import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'
import { requireAdmin } from '../../../../lib/api/admin-guard'
import { notifyUser } from '../../../../lib/api/notify'
import {
  smsOrderConfirmed,
  smsOrderCancelled,
  smsShipped,
  smsTracking,
  smsShipDelay,
  smsDeliveryFail,
} from '../../../../lib/sms/events'

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
    console.warn('[admin/orders] sms', e?.message || e)
  }
}

export async function GET(request) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error
    const url = new URL(request.url)
    const limit = Math.min(Number(url.searchParams.get('limit') || 100), 300)
    const status = String(url.searchParams.get('status') || '').trim()

    let q = gate.admin
      .from('orders')
      .select(
        'id, user_id, status, total, total_amount, payment_status, created_at, updated_at, items, shipping_address, note, order_number'
      )
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) q = q.eq('status', status)

    const { data, error } = await q
    if (error) {
      const { data: data2, error: err2 } = await gate.admin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)
      if (err2) return NextResponse.json({ ok: false, error: err2.message }, { status: 400 })
      return NextResponse.json({ ok: true, orders: data2 || [] })
    }
    return NextResponse.json({ ok: true, orders: data || [] })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error
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
      'refunded',
      'rejected',
      'delayed',
      'delivery_failed',
    ]
    if (status && !allowed.includes(status)) {
      return NextResponse.json({ ok: false, error: 'status نامعتبر' }, { status: 400 })
    }
    const patch = { updated_at: new Date().toISOString() }
    if (status) patch.status = status
    if (body.note != null) patch.note = body.note
    if (body.admin_note != null) patch.admin_note = body.admin_note
    if (body.tracking_code != null || body.trackingCode != null) {
      patch.tracking_code = String(body.tracking_code || body.trackingCode || '').slice(0, 80)
    }

    const { data, error } = await gate.admin
      .from('orders')
      .update(patch)
      .eq('id', id)
      .select('*')
      .maybeSingle()

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    if (!data) return NextResponse.json({ ok: false, error: 'سفارش یافت نشد' }, { status: 404 })

    if (data.user_id && status) {
      try {
        await notifyUser({
          userId: data.user_id,
          title: 'به‌روزرسانی سفارش',
          body: `وضعیت سفارش به «${status}» تغییر کرد.`,
          type: 'order',
          meta: { order_id: data.id, status },
        })
      } catch (_) {}
    }

    // SMS خریدار
    if (status) {
      await notifyBuyerOrderSms(
        gate.admin,
        data,
        status,
        body.tracking_code || body.trackingCode || data.tracking_code
      )
    }

    return NextResponse.json({ ok: true, order: data })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
