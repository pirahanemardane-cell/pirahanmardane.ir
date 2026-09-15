import { createClient } from '../../../../lib/supabase/server'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'

const STATUS_LABEL = {
  pending_payment: 'در انتظار پرداخت',
  pending: 'در انتظار',
  paid: 'پرداخت‌شده',
  preparing: 'آماده‌سازی',
  shipped: 'ارسال‌شده',
  delivered: 'تحویل‌شده',
  cancelled: 'لغو‌شده',
  returned: 'مرجوعی',
  refunded: 'بازگشت وجه',
}

export async function POST(request) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })

    const body = await request.json().catch(() => ({}))
    const code = String(body.code || body.tracking_code || body.order_number || '').trim()
    if (!code || code.length < 4) {
      return NextResponse.json({ ok: false, error: 'کد پیگیری یا شماره سفارش را وارد کنید' }, { status: 400 })
    }

    const { data: { user } } = await supabase.auth.getUser()

    let publicRow = null
    try {
      const { data: rpcData, error: rpcErr } = await supabase.rpc('track_order_public', { p_code: code })
      if (!rpcErr && Array.isArray(rpcData) && rpcData[0]) publicRow = rpcData[0]
      else if (!rpcErr && rpcData && !Array.isArray(rpcData)) publicRow = rpcData
    } catch (_) {}

    let ownerOrder = null
    if (user) {
      let q = await supabase
        .from('orders')
        .select('id, order_number, status, tracking_code, payable, total, shipping_method, payment_method, address_snapshot, contact_snapshot, created_at, updated_at, paid_at, user_id')
        .eq('user_id', user.id)
        .eq('tracking_code', code)
        .maybeSingle()
      if (!q.data) {
        q = await supabase
          .from('orders')
          .select('id, order_number, status, tracking_code, payable, total, shipping_method, payment_method, address_snapshot, contact_snapshot, created_at, updated_at, paid_at, user_id')
          .eq('user_id', user.id)
          .eq('order_number', code)
          .maybeSingle()
      }
      ownerOrder = q.data
    }

    if (ownerOrder) {
      const { data: items } = await supabase
        .from('order_items')
        .select('id, product_id, name, color_name, size, image_url, qty, unit_price, line_total')
        .eq('order_id', ownerOrder.id)
      return NextResponse.json({
        ok: true,
        order: {
          ...ownerOrder,
          statusLabel: STATUS_LABEL[ownerOrder.status] || ownerOrder.status,
          items: items || [],
        },
      })
    }

    if (publicRow) {
      return NextResponse.json({
        ok: true,
        order: {
          order_number: publicRow.order_number,
          status: publicRow.status,
          statusLabel: STATUS_LABEL[publicRow.status] || publicRow.status,
          tracking_code: publicRow.tracking_code || null,
          updated_at: publicRow.updated_at || null,
        },
      })
    }

    return NextResponse.json({ ok: false, error: 'سفارشی با این کد یافت نشد' }, { status: 404 })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e?.message || 'خطا' }, { status: 500 })
  }
}
