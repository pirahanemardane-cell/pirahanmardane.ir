/**
 * GET /api/seller/export/orders
 *
 * خروجی حسابداری فروشنده — CSV (Excel) یا JSON
 *
 * Query:
 *   format=csv|json          پیش‌فرض csv
 *   status=all|paid|processing|shipped|delivered|cancelled|refunded
 *   accounting=all|awaiting_fulfillment|shipped|ready_to_settle|cancelled|refunded
 *   from=YYYY-MM-DD
 *   to=YYYY-MM-DD
 *   limit=1..5000            پیش‌فرض 2000
 *
 * ستون‌ها: شماره سفارش، تاریخ، وضعیت، ناخالص، کمیسیون، خالص، ...
 * CSV با UTF-8 BOM برای باز شدن درست در Excel
 */
import { createClient } from '../../../../../lib/supabase/server'
import { createAdminClient } from '../../../../../lib/supabase/admin'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../../../lib/critical-log'
import {
  getDefaultCommissionRate,
  splitCommission,
  accountingStatus,
  ACCOUNTING_STATUS_FA,
  toCsv,
  SELLER_ORDER_CSV_COLUMNS,
} from '../../../../../lib/seller-accounting'

export const dynamic = 'force-dynamic'

async function getSellerContext() {
  const supabase = await createClient()
  if (!supabase) {
    return { error: NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 }) }
  }
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 }) }
  }
  const admin = createAdminClient()
  // commission_rate ممکن است روی جدول نباشد
  let seller = null
  {
    const r1 = await admin
      .from('sellers')
      .select('id, owner_id, shop_name, status, commission_rate')
      .eq('owner_id', user.id)
      .maybeSingle()
    if (r1.error && /commission_rate|column/i.test(r1.error.message || '')) {
      const r1b = await admin
        .from('sellers')
        .select('id, owner_id, shop_name, status')
        .eq('owner_id', user.id)
        .maybeSingle()
      seller = r1b.data
    } else {
      seller = r1.data
    }
  }

  if (!seller) {
    const r2 = await admin
      .from('sellers')
      .select('id, owner_id, shop_name, status')
      .eq('user_id', user.id)
      .maybeSingle()
    seller = r2.data
  }

  if (!seller) {
    return {
      error: NextResponse.json({ ok: false, error: 'فروشگاه یافت نشد', code: 'NO_SHOP' }, { status: 404 }),
    }
  }
  return { user, admin, seller }
}

function parseDateBound(s, endOfDay) {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(String(s).trim())) return null
  const d = new Date(String(s).trim() + (endOfDay ? 'T23:59:59.999Z' : 'T00:00:00.000Z'))
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

function formatFaDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' })
  } catch {
    return String(iso)
  }
}

export async function GET(request) {
  try {
    const ctx = await getSellerContext()
    if (ctx.error) return ctx.error

    const url = new URL(request.url)
    const format = String(url.searchParams.get('format') || 'csv').toLowerCase()
    const statusFilter = String(url.searchParams.get('status') || 'all').toLowerCase()
    const accountingFilter = String(url.searchParams.get('accounting') || 'all').toLowerCase()
    const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 2000), 1), 5000)
    const fromIso = parseDateBound(url.searchParams.get('from'), false)
    const toIso = parseDateBound(url.searchParams.get('to'), true)

    const rate =
      ctx.seller.commission_rate != null && Number.isFinite(Number(ctx.seller.commission_rate))
        ? Number(ctx.seller.commission_rate)
        : getDefaultCommissionRate()

    // اقلام این فروشنده
    const { data: items, error: itemsErr } = await ctx.admin
      .from('order_items')
      .select('id, order_id, product_id, seller_id, name, title, qty, unit_price, line_total')
      .eq('seller_id', ctx.seller.id)
      .limit(10000)

    if (itemsErr) {
      return NextResponse.json({ ok: false, error: itemsErr.message }, { status: 400 })
    }

    const orderIds = [...new Set((items || []).map((i) => i.order_id).filter(Boolean))]
    if (!orderIds.length) {
      if (format === 'json') {
        return NextResponse.json({
          ok: true,
          seller_id: ctx.seller.id,
          shop_name: ctx.seller.shop_name,
          commission_rate: rate,
          rows: [],
          totals: { gross: 0, commission: 0, net: 0, orders: 0 },
        })
      }
      const empty = toCsv([], SELLER_ORDER_CSV_COLUMNS)
      return new NextResponse(empty, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="seller-orders-${ctx.seller.id}.csv"`,
        },
      })
    }

    // سفارش‌ها — در صورت زیاد بودن، تکه‌تکه
    const chunk = 200
    let orders = []
    for (let i = 0; i < orderIds.length; i += chunk) {
      const slice = orderIds.slice(i, i + chunk)
      let q = ctx.admin
        .from('orders')
        .select('id, order_number, status, payable, total, created_at, updated_at, paid_at')
        .in('id', slice)
      if (statusFilter && statusFilter !== 'all') {
        q = q.eq('status', statusFilter)
      }
      if (fromIso) q = q.gte('created_at', fromIso)
      if (toIso) q = q.lte('created_at', toIso)
      const { data, error } = await q
      if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
      }
      orders = orders.concat(data || [])
    }

    const orderById = {}
    for (const o of orders) orderById[o.id] = o

    // تجمیع per order فقط برای سفارش‌هایی که بعد از فیلتر مانده‌اند
    const byOrder = {}
    for (const it of items || []) {
      const o = orderById[it.order_id]
      if (!o) continue
      if (!byOrder[it.order_id]) {
        byOrder[it.order_id] = {
          order: o,
          items: [],
          gross: 0,
          qty_total: 0,
        }
      }
      const line =
        it.line_total != null
          ? Number(it.line_total)
          : (Number(it.unit_price) || 0) * (Number(it.qty) || 0)
      byOrder[it.order_id].items.push(it)
      byOrder[it.order_id].gross += Math.max(0, Math.round(line || 0))
      byOrder[it.order_id].qty_total += Math.max(0, Number(it.qty) || 0)
    }

    let rows = Object.values(byOrder).map(({ order, items: its, gross, qty_total }) => {
      const split = splitCommission(gross, rate)
      const acc = accountingStatus(order.status)
      return {
        order_id: order.id,
        order_number: order.order_number || order.id,
        created_at: formatFaDate(order.created_at),
        created_at_iso: order.created_at,
        paid_at: formatFaDate(order.paid_at),
        paid_at_iso: order.paid_at,
        status: order.status,
        accounting_status_key: acc,
        accounting_status: ACCOUNTING_STATUS_FA[acc] || acc,
        items_count: its.length,
        qty_total,
        gross: split.gross,
        commission_rate: split.commission_rate,
        commission: split.commission,
        net: split.net,
        item_titles: its
          .map((x) => x.name || x.title || '')
          .filter(Boolean)
          .join(' | ')
          .slice(0, 500),
      }
    })

    if (accountingFilter && accountingFilter !== 'all') {
      rows = rows.filter((r) => r.accounting_status_key === accountingFilter)
    }

    // جدیدترین اول
    rows.sort((a, b) => String(b.created_at_iso || '').localeCompare(String(a.created_at_iso || '')))
    rows = rows.slice(0, limit)

    const totals = rows.reduce(
      (a, r) => {
        a.gross += r.gross
        a.commission += r.commission
        a.net += r.net
        a.orders += 1
        return a
      },
      { gross: 0, commission: 0, net: 0, orders: 0 }
    )

    if (format === 'json') {
      return NextResponse.json({
        ok: true,
        seller_id: ctx.seller.id,
        shop_name: ctx.seller.shop_name,
        commission_rate: rate,
        filters: { status: statusFilter, accounting: accountingFilter, from: fromIso, to: toIso },
        totals,
        rows,
      })
    }

    // CSV — فقط فیلدهای جدول
    const csvRows = rows.map((r) => ({
      order_number: r.order_number,
      order_id: r.order_id,
      created_at: r.created_at,
      paid_at: r.paid_at,
      status: r.status,
      accounting_status: r.accounting_status,
      items_count: r.items_count,
      qty_total: r.qty_total,
      gross: r.gross,
      commission_rate: r.commission_rate,
      commission: r.commission,
      net: r.net,
      item_titles: r.item_titles,
    }))

    // ردیف جمع در انتها
    csvRows.push({
      order_number: 'جمع',
      order_id: '',
      created_at: '',
      paid_at: '',
      status: '',
      accounting_status: `${totals.orders} سفارش`,
      items_count: '',
      qty_total: '',
      gross: totals.gross,
      commission_rate: rate,
      commission: totals.commission,
      net: totals.net,
      item_titles: '',
    })

    const csv = toCsv(csvRows, SELLER_ORDER_CSV_COLUMNS)
    const filename = `seller-accounting-${ctx.seller.id}-${new Date().toISOString().slice(0, 10)}.csv`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (e) { try { await logCritical('seller-export', e) } catch (_lc) {} 
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
