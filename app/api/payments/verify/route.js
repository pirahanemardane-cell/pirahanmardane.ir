import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

function isMock() {
  const v = process.env.PAYMENT_MOCK
  if (v === undefined || v === '') return true
  return v === '1' || v === 'true' || v === 'TRUE'
}

async function markPaid(admin, order, refId) {
  await admin.from('orders').update({
    status: 'paid',
    paid_at: new Date().toISOString(),
    payment_ref: refId ? String(refId) : null,
    updated_at: new Date().toISOString(),
  }).eq('id', order.id)
}

export async function GET(request) {
  const url = new URL(request.url)
  const authority = url.searchParams.get('Authority') || url.searchParams.get('authority') || ''
  const status = url.searchParams.get('Status') || url.searchParams.get('status') || ''
  const orderIdQ = url.searchParams.get('order_id') || ''
  const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://pirahanmardane.ir').replace(/\/$/, '')

  try {
    if (!authority) return NextResponse.redirect(site + '/?pay=failed&reason=no_authority')
    if (String(status).toUpperCase() !== 'OK') return NextResponse.redirect(site + '/?pay=cancelled')

    const admin = createAdminClient()
    let order = null
    if (orderIdQ) {
      const { data } = await admin.from('orders').select('id, user_id, status, payable, total, payment_authority').eq('id', orderIdQ).maybeSingle()
      order = data
    }
    if (!order) {
      const { data } = await admin.from('orders').select('id, user_id, status, payable, total, payment_authority').eq('payment_authority', authority).maybeSingle()
      order = data
    }
    if (!order) return NextResponse.redirect(site + '/?pay=failed&reason=order')
    if (order.status === 'paid') return NextResponse.redirect(site + '/?pay=ok&order=' + order.id)

    const amount = Math.round(Number(order.payable ?? order.total) || 0)

    if (isMock() || String(authority).startsWith('MOCK-')) {
      await markPaid(admin, order, 'MOCK-REF-' + Date.now())
      return NextResponse.redirect(site + '/?pay=ok&order=' + order.id + '&mock=1')
    }

    const merchant = process.env.ZARINPAL_MERCHANT_ID
    const zpRes = await fetch('https://api.zarinpal.com/pg/v4/payment/verify.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchant_id: merchant, amount, authority }),
    })
    const zp = await zpRes.json().catch(() => ({}))
    const code = zp?.data?.code
    if (code === 100 || code === 101) {
      await markPaid(admin, order, zp?.data?.ref_id)
      return NextResponse.redirect(site + '/?pay=ok&order=' + order.id)
    }
    return NextResponse.redirect(site + '/?pay=failed&reason=verify')
  } catch (e) {
    console.error('[payments/verify]', e)
    return NextResponse.redirect(site + '/?pay=failed&reason=server')
  }
}
