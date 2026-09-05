import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { clientIp, rateLimitAsync, rateLimitResponse, RATE_POLICIES } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

function isMock() {
  const v = process.env.PAYMENT_MOCK
  if (v === undefined || v === '') return true
  return v === '1' || v === 'true' || v === 'TRUE'
}

export async function POST(request) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 })

    const ip = clientIp(request)
    const rl = await rateLimitAsync('pay:' + user.id, RATE_POLICIES.pay_user)
    const rlIp = await rateLimitAsync('pay:ip:' + ip, { limit: 40, windowMs: 60 * 60 * 1000 })
    if (!rl.ok || !rlIp.ok) return rateLimitResponse(!rl.ok ? rl : rlIp)

    const body = await request.json().catch(() => ({}))
    const orderId = String(body.order_id || body.orderId || '').trim()
    if (!orderId) return NextResponse.json({ ok: false, error: 'order_id الزامی است' }, { status: 400 })

    const admin = createAdminClient()
    const { data: order, error } = await admin
      .from('orders')
      .select('id, order_number, user_id, status, payable, total, currency')
      .eq('id', orderId)
      .maybeSingle()
    if (error || !order) return NextResponse.json({ ok: false, error: 'سفارش یافت نشد' }, { status: 404 })
    if (order.user_id !== user.id) return NextResponse.json({ ok: false, error: 'دسترسی غیرمجاز' }, { status: 403 })
    if (order.status !== 'pending_payment') {
      return NextResponse.json({ ok: false, error: 'این سفارش قابل پرداخت نیست' }, { status: 400 })
    }

    const amount = Math.round(Number(order.payable ?? order.total) || 0)
    if (amount < 1000) return NextResponse.json({ ok: false, error: 'مبلغ نامعتبر' }, { status: 400 })

    const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://pirahanmardane.ir').replace(/\/$/, '')
    const callbackUrl = site + '/api/payments/verify'

    if (isMock()) {
      const authority = 'MOCK-' + order.id + '-' + Date.now()
      try {
        await admin.from('orders').update({
          payment_authority: authority,
          updated_at: new Date().toISOString(),
        }).eq('id', order.id)
      } catch (_) {}
      return NextResponse.json({
        ok: true,
        mock: true,
        authority,
        redirect_url: callbackUrl + '?Authority=' + encodeURIComponent(authority) + '&Status=OK&order_id=' + order.id,
        amount,
      })
    }

    const merchant = process.env.ZARINPAL_MERCHANT_ID
    if (!merchant) {
      return NextResponse.json({ ok: false, error: 'درگاه پیکربندی نشده' }, { status: 500 })
    }

    const zpRes = await fetch('https://api.zarinpal.com/pg/v4/payment/request.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchant_id: merchant,
        amount,
        callback_url: callbackUrl,
        description: 'سفارش ' + (order.order_number || order.id),
        metadata: { order_id: order.id, user_id: user.id },
      }),
    })
    const zp = await zpRes.json().catch(() => ({}))
    const authority = zp?.data?.authority
    if (!authority) {
      return NextResponse.json({ ok: false, error: 'خطای درگاه پرداخت' }, { status: 502 })
    }

    try {
      await admin.from('orders').update({
        payment_authority: authority,
        updated_at: new Date().toISOString(),
      }).eq('id', order.id)
    } catch (_) {}

    return NextResponse.json({
      ok: true,
      mock: false,
      authority,
      redirect_url: 'https://www.zarinpal.com/pg/StartPay/' + authority,
      amount,
    })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e?.message || 'server error' }, { status: 500 })
  }
}
