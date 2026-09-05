import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'
import { notifyUser } from '../../../../lib/api/notify'
import {
  smsOrderConfirmed,
  smsOrderCancelled,
  smsShipped,
  smsTracking,
  smsShipDelay,
  smsDeliveryFail,
} from '../../../../lib/sms/events'

async function getSellerContext() {
  const supabase = await createClient()
  if (!supabase) return { error: NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 }) }
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 }) }
  const admin = createAdminClient()
  const { data: seller } = await admin
    .from('sellers')
    .select('id, owner_id, shop_name, status')
    .eq('owner_id', user.id)
    .maybeSingle()
  if (!seller) return { error: NextResponse.json({ ok: false, error: 'فروشنده یافت نشد' }, { status: 404 }) }
  return { user, admin, seller }
}

export async function GET(request) {
  try {
    const ctx = await getSellerContext()
    if (ctx.error) return ctx.error
    const limit = Math.min(Number(new URL(request.url).searchParams.get('limit') || 50), 100)
    const { data: items, error: itemsErr } = await ctx.admin
      .from('order_items')
      .select('order_id, product_id, seller_id, qty, unit_price, title')
      .eq('seller_id', ctx.seller.id)
      .limit(500)
    if (itemsErr) {
      const { data: orders, error } = await ctx.admin
        .from('orders')
        .select('id, order_number, status, payable, total, created_at, updated_at, user_id, shipping_method')
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
      return NextResponse.json({ ok: true, orders: orders || [], note: 'seller_id filter unavailable' })
    }
    const orderIds = [...new Set((items || []).map((i) => i.order_id).filter(Boolean))]
    if (!orderIds.length) return NextResponse.json({ ok: true, orders: [] })
    const { data: orders, error } = await ctx.admin
      .from('orders')
      .select(
        'id, order_number, status, payable, total, created_at, updated_at, user_id, shipping_method, address_snapshot, tracking_code'
      )
      .in('id', orderIds)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    const byOrder = {}
    for (const it of items || []) {
      if (!byOrder[it.order_id]) byOrder[it.order_id] = []
      byOrder[it.order_id].push(it)
    }
    const mapped = (orders || []).map((o) => ({ ...o, items: byOrder[o.id] || [] }))
    return NextResponse.json({ ok: true, orders: mapped })
  } catch (e) { try { await logCritical('seller-orders', e) } catch (_lc) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

async function notifyBuyerOrderSms(admin, orderRow, status, trackingCode) {
  try {
    if (!orderRow?.user_id) return
    const { data: prof } = await admin
      .from('profiles')
      .select('phone, full_name, name')
      .eq('id', orderRow.user_id)
      .maybeSingle()
    const phone = prof?.phone
    if (!phone) return
    const name = prof?.full_name || prof?.name || 'خریدار'
    const no = orderRow.order_number || orderRow.id
    if (status === 'processing' || status === 'preparing' || status === 'confirmed') {
      await smsOrderConfirmed(phone, name, no)
    } else if (status === 'cancelled' || status === 'rejected') {
      await smsOrderCancelled(phone, name, no, status === 'rejected' ? 'رد' : 'لغو', '-')
    } else if (status === 'shipped') {
      await smsShipped(phone, name, no)
      if (trackingCode) await smsTracking(phone, name, no, trackingCode)
    } else if (status === 'delayed' || status === 'ship_delay') {
      await smsShipDelay(phone, name, no)
    } else if (status === 'delivery_failed' || status === 'undelivered') {
      await smsDeliveryFail(phone, name, no)
    }
  } catch (e) {
    console.warn('[seller/orders] sms', e?.message || e)
  }
}

export async function PATCH(request) {
  try {
    const ctx = await getSellerContext()
    if (ctx.error) return ctx.error
    const body = await request.json().catch(() => ({}))
    const id = body.id || body.orderId
    if (!id) return NextResponse.json({ ok: false, error: 'id الزامی است' }, { status: 400 })
    const status = String(body.status || '').trim()
    const allowed = [
      'pending',
      'pending_payment',
      'paid',
      'processing',
      'preparing',
      'shipped',
      'delivered',
      'cancelled',
      'rejected',
      'refunded',
      'delayed',
      'delivery_failed',
    ]
    if (!status || !allowed.includes(status)) {
      return NextResponse.json({ ok: false, error: 'status نامعتبر' }, { status: 400 })
    }

    const { data: ownItems } = await ctx.admin
      .from('order_items')
      .select('id')
      .eq('order_id', id)
      .eq('seller_id', ctx.seller.id)
      .limit(1)
    if (!ownItems?.length) {
      const { count } = await ctx.admin
        .from('order_items')
        .select('id', { count: 'exact', head: true })
        .eq('order_id', id)
      if (count === null) {
        /* proceed */
      } else if (count > 0 && !ownItems?.length) {
        return NextResponse.json({ ok: false, error: 'این سفارش متعلق به شما نیست' }, { status: 403 })
      }
    }

    const patch = { status, updated_at: new Date().toISOString() }
    const tracking = body.tracking_code || body.trackingCode
    if (tracking != null && String(tracking).trim()) {
      patch.tracking_code = String(tracking).trim().slice(0, 80)
    }

    const { data, error } = await ctx.admin
      .from('orders')
      .update(patch)
      .eq('id', id)
      .select('id, order_number, status, user_id, payable, updated_at, tracking_code')
      .maybeSingle()
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    if (!data) return NextResponse.json({ ok: false, error: 'سفارش یافت نشد' }, { status: 404 })

    if (data.user_id) {
      try {
        await notifyUser({
          userId: data.user_id,
          title: 'به‌روزرسانی سفارش',
          body: `وضعیت سفارش ${data.order_number || ''} به «${status}» تغییر کرد.`,
          type: 'order',
          meta: { order_id: data.id, status },
        })
      } catch (_) {}
    }

    await notifyBuyerOrderSms(
      ctx.admin,
      data,
      status,
      tracking || data.tracking_code
    )
    return NextResponse.json({ ok: true, order: data })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
