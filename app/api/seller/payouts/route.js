import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { requireAdmin } from '../../../../lib/api/admin-guard'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'
import { smsPayoutProcessing, smsPayoutOk, smsPayoutFail } from '../../../../lib/sms/events'

export async function GET(request) {
  try {
    const adminView = new URL(request.url).searchParams.get('admin') === '1'
    if (adminView) {
      const gate = await requireAdmin()
      if (gate.error) return gate.error
      const admin = createAdminClient()
      const { data, error } = await admin
        .from('seller_payout_requests')
        .select('*, sellers(shop_name, owner_id)')
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
      return NextResponse.json({ ok: true, items: data || [] })
    }

    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 })
    const admin = createAdminClient()
    const { data: seller } = await admin.from('sellers').select('id').eq('owner_id', user.id).maybeSingle()
    if (!seller) return NextResponse.json({ ok: false, error: 'فروشگاه نیست', code: 'NO_SHOP' }, { status: 404 })
    const { data, error } = await admin
      .from('seller_payout_requests')
      .select('*')
      .eq('seller_id', seller.id)
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, items: data || [] })
  } catch (e) { try { await logCritical('seller-payouts', e) } catch (_lc) {} 
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 })
    const body = await request.json().catch(() => ({}))
    const amount = parseInt(body.amount, 10)
    if (!amount || amount < 10000) {
      return NextResponse.json({ ok: false, error: 'مبلغ نامعتبر (حداقل ۱۰٬۰۰۰)' }, { status: 400 })
    }
    const admin = createAdminClient()
    const { data: seller } = await admin
      .from('sellers')
      .select('id, status, shop_name, phone, owner_id')
      .eq('owner_id', user.id)
      .maybeSingle()
    if (!seller) return NextResponse.json({ ok: false, error: 'فروشگاه نیست', code: 'NO_SHOP' }, { status: 404 })
    const { data, error } = await admin
      .from('seller_payout_requests')
      .insert({
        seller_id: seller.id,
        amount,
        note: body.note ? String(body.note).slice(0, 300) : null,
        status: 'pending',
      })
      .select('*')
      .single()
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })

    // SMS: درخواست ثبت شد → در حال پردازش (recommended)
    try {
      let phone = seller.phone
      let name = seller.shop_name || 'فروشنده'
      if (!phone && seller.owner_id) {
        const { data: prof } = await admin
          .from('profiles')
          .select('phone, full_name')
          .eq('id', seller.owner_id)
          .maybeSingle()
        phone = prof?.phone || phone
        if (!seller.shop_name && prof?.full_name) name = prof.full_name
      }
      if (phone) await smsPayoutProcessing(phone, name, amount)
    } catch (_) {}

    return NextResponse.json({ ok: true, item: data })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error
    const admin = createAdminClient()
    const body = await request.json().catch(() => ({}))
    const id = body.id
    if (!id) return NextResponse.json({ ok: false, error: 'id لازم است' }, { status: 400 })
    const status = String(body.status || '').toLowerCase()
    if (!['pending', 'approved', 'rejected', 'paid'].includes(status)) {
      return NextResponse.json({ ok: false, error: 'status نامعتبر' }, { status: 400 })
    }
    const { data, error } = await admin
      .from('seller_payout_requests')
      .update({
        status,
        admin_note: body.admin_note != null ? String(body.admin_note).slice(0, 300) : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .maybeSingle()
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    if (!data) return NextResponse.json({ ok: false, error: 'یافت نشد' }, { status: 404 })

    // SMS به فروشنده بر اساس وضعیت تسویه
    try {
      const { data: seller } = await admin
        .from('sellers')
        .select('id, shop_name, phone, owner_id')
        .eq('id', data.seller_id)
        .maybeSingle()
      if (seller) {
        let phone = seller.phone
        let name = seller.shop_name || 'فروشنده'
        if (!phone && seller.owner_id) {
          const { data: prof } = await admin
            .from('profiles')
            .select('phone, full_name')
            .eq('id', seller.owner_id)
            .maybeSingle()
          phone = prof?.phone || phone
          if (!seller.shop_name && prof?.full_name) name = prof.full_name
        }
        if (phone) {
          if (status === 'paid' || status === 'approved') {
            await smsPayoutOk(phone, name, data.amount)
          } else if (status === 'rejected') {
            await smsPayoutFail(phone, name, data.amount, body.admin_note || 'رد توسط ادمین')
          }
        }
      }
    } catch (e) {
      console.warn('[seller/payouts] sms', e?.message || e)
    }

    return NextResponse.json({ ok: true, item: data })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
