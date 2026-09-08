import { NextResponse } from 'next/server'
import { createAdminClient } from '../../../lib/supabase/admin'

export const dynamic = 'force-dynamic'

function normalizePhone(raw) {
  let d = String(raw || '')
    .replace(/[۰-۹]/g, (c) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c)))
    .replace(/[٠-٩]/g, (c) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(c)))
    .replace(/\D/g, '')
  if (d.startsWith('0098')) d = d.slice(4)
  if (d.startsWith('98') && d.length >= 12) d = '0' + d.slice(2)
  if (d.length === 10 && d.startsWith('9')) d = '0' + d
  return d
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}))
    const phone = normalizePhone(body.phone)
    if (!/^09\d{9}$/.test(phone)) {
      return NextResponse.json({ ok: false, error: 'شماره موبایل معتبر نیست' }, { status: 400 })
    }
    let admin
    try { admin = createAdminClient() } catch {
      return NextResponse.json({ ok: false, error: 'پیکربندی سرور ناقص است' }, { status: 500 })
    }
    const ua = String(req.headers.get('user-agent') || '').slice(0, 300)
    const { error } = await admin.from('customer_club').upsert(
      {
        phone,
        phone_normalized: phone,
        source: String(body.source || 'home_newsletter').slice(0, 64),
        user_agent: ua || null,
      },
      { onConflict: 'phone_normalized', ignoreDuplicates: true },
    )
    if (error) {
      if (/relation|does not exist|schema cache/i.test(error.message || '')) {
        return NextResponse.json({ ok: false, error: 'جدول باشگاه مشتریان هنوز ساخته نشده' }, { status: 503 })
      }
      return NextResponse.json({ ok: false, error: 'خطای سرور' }, { status: 500 })
    }
    return NextResponse.json({ ok: true, message: 'شماره ثبت شد' })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'خطای سرور' }, { status: 500 })
  }
}
