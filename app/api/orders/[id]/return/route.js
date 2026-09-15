/**
 * app/api/orders/[id]/return/route.js
 *
 * POST  — خریدار: درخواست مرجوعی → SMS فروشنده + refund requested
 * PATCH — ادمین/فروشنده: تأیید/رد/دریافت/refund → SMS خریدار
 */
import { createClient } from '../../../../../lib/supabase/server'
import { createAdminClient } from '../../../../../lib/supabase/admin'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../../../lib/critical-log'
import {
  smsReturnRequestedSeller,
  smsReturnDecisionBuyer,
  smsReturnReceived,
  smsRefundRequested,
  smsRefundApproved,
  smsRefundDone,
  smsRefundFailed,
} from '../../../../../lib/sms/events'

async function loadBuyerPhone(admin, userId) {
  if (!userId) return { phone: null, name: 'خریدار' }
  const { data } = await admin
    .from('profiles')
    .select('phone, full_name')
    .eq('id', userId)
    .maybeSingle()
  return { phone: data?.phone || null, name: data?.full_name || 'خریدار' }
}

export async function POST(request, { params }) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) return NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 })

    const orderId = params?.id
    if (!orderId) return NextResponse.json({ ok: false, error: 'شناسه نامعتبر' }, { status: 400 })

    const body = await request.json().catch(() => ({}))
    const reason = String(body.reason || '').trim().slice(0, 500)

    const { data: order, error: oErr } = await supabase
      .from('orders')
      .select('id, status, user_id, order_number, payable, total')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (oErr) return NextResponse.json({ ok: false, error: oErr.message }, { status: 400 })
    if (!order) return NextResponse.json({ ok: false, error: 'سفارش یافت نشد' }, { status: 404 })

    if (!['delivered', 'shipped'].includes(String(order.status))) {
      return NextResponse.json(
        { ok: false, error: 'فقط سفارش ارسال/تحویل‌شده قابل مرجوعی است' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('order_returns')
      .insert({
        order_id: order.id,
        user_id: user.id,
        reason: reason || null,
        status: 'requested',
      })
      .select('id, order_id, status, reason, created_at')
      .maybeSingle()

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })

    try {
      const admin = createAdminClient()
      const { data: items } = await admin
        .from('order_items')
        .select('seller_id')
        .eq('order_id', order.id)

      const sellerIds = [...new Set((items || []).map((x) => x.seller_id).filter(Boolean))]

      for (const sellerId of sellerIds) {
        const { data: seller } = await admin
          .from('sellers')
          .select('id, shop_name, phone, owner_id')
          .eq('id', sellerId)
          .maybeSingle()
        if (!seller) continue

        let phone = seller.phone
        let name = seller.shop_name || 'فروشنده'
        if (!phone && seller.owner_id) {
          const { data: owner } = await admin
            .from('profiles')
            .select('phone, full_name')
            .eq('id', seller.owner_id)
            .maybeSingle()
          phone = owner?.phone || phone
          if (!seller.shop_name && owner?.full_name) name = owner.full_name
        }
        if (phone) {
          await smsReturnRequestedSeller({
            phone,
            sellerName: name,
            orderNumber: order.order_number,
          })
        }
      }

      const buyer = await loadBuyerPhone(admin, user.id)
      if (buyer.phone) {
        await smsRefundRequested({
          phone: buyer.phone,
          buyerName: buyer.name,
          orderNumber: order.order_number,
        })
      }
    } catch (_) { try { await logCritical('order-return', _) } catch (_lc) {} }

    return NextResponse.json({ ok: true, message: 'درخواست مرجوعی ثبت شد', return: data })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

/**
 * PATCH body: { return_id?, status }
 * status: approved | rejected | received | refunded | refund_failed
 */
export async function PATCH(request, { params }) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 })

    const orderId = params?.id
    if (!orderId) return NextResponse.json({ ok: false, error: 'شناسه نامعتبر' }, { status: 400 })

    const body = await request.json().catch(() => ({}))
    const status = String(body.status || '').toLowerCase().trim()
    const allowed = ['approved', 'rejected', 'received', 'refunded', 'refund_failed']
    if (!allowed.includes(status)) {
      return NextResponse.json({ ok: false, error: 'status نامعتبر' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle()
    const role = String(profile?.role || '').toLowerCase()
    const isAdmin = role === 'admin' || role === 'superadmin'

    if (!isAdmin) {
      const { data: seller } = await admin
        .from('sellers')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle()
      if (!seller) {
        return NextResponse.json({ ok: false, error: 'دسترسی ندارید' }, { status: 403 })
      }
      const { data: own } = await admin
        .from('order_items')
        .select('id')
        .eq('order_id', orderId)
        .eq('seller_id', seller.id)
        .limit(1)
      if (!own?.length) {
        return NextResponse.json({ ok: false, error: 'این سفارش متعلق به شما نیست' }, { status: 403 })
      }
    }

    const { data: order } = await admin
      .from('orders')
      .select('id, order_number, user_id, payable, total')
      .eq('id', orderId)
      .maybeSingle()
    if (!order) return NextResponse.json({ ok: false, error: 'سفارش یافت نشد' }, { status: 404 })

    // آخرین return این سفارش (یا return_id مشخص)
    let retQuery = admin
      .from('order_returns')
      .select('id, order_id, status, reason, created_at')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (body.return_id) {
      retQuery = admin
        .from('order_returns')
        .select('id, order_id, status, reason, created_at')
        .eq('id', body.return_id)
        .eq('order_id', orderId)
        .maybeSingle()
    }

    const found = body.return_id ? await retQuery : await retQuery.maybeSingle()
    const existing = body.return_id ? found.data : found.data
    const findErr = found.error
    if (findErr) return NextResponse.json({ ok: false, error: findErr.message }, { status: 400 })
    if (!existing) return NextResponse.json({ ok: false, error: 'درخواست مرجوعی یافت نشد' }, { status: 404 })

    const { data: ret, error } = await admin
      .from('order_returns')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select('id, order_id, status, reason')
      .maybeSingle()

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })

    try {
      const buyer = await loadBuyerPhone(admin, order.user_id)
      if (buyer.phone) {
        const no = order.order_number
        if (status === 'approved' || status === 'rejected') {
          await smsReturnDecisionBuyer({
            phone: buyer.phone,
            buyerName: buyer.name,
            orderNumber: no,
            decision: status === 'approved' ? 'تأیید' : 'رد',
          })
          if (status === 'approved') {
            await smsRefundApproved({
              phone: buyer.phone,
              buyerName: buyer.name,
              orderNumber: no,
            })
          }
        } else if (status === 'received') {
          await smsReturnReceived({
            phone: buyer.phone,
            buyerName: buyer.name,
            orderNumber: no,
          })
        } else if (status === 'refunded') {
          await smsRefundDone({
            phone: buyer.phone,
            buyerName: buyer.name,
            amount: order.payable ?? order.total,
            orderNumber: no,
          })
        } else if (status === 'refund_failed') {
          await smsRefundFailed({
            phone: buyer.phone,
            buyerName: buyer.name,
            orderNumber: no,
          })
        }
      }
    } catch (e) {
      console.warn('[return] sms', e?.message || e)
    }

    return NextResponse.json({ ok: true, return: ret })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
