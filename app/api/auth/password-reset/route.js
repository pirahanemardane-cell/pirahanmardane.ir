import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { normalizePhone, isValidIranMobile, verifyOtp } from '@/lib/otp'
import { logCritical } from '@/lib/critical-log'

function phoneEmail(phone0) {
  return 'u' + normalizePhone(phone0) + '@otp.local'
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}))
    const phone = normalizePhone(body.phone || '')
    const code = String(body.code || body.otp || '').replace(/\D/g, '')
    const password = String(body.password || '')

    if (!isValidIranMobile(phone)) {
      return NextResponse.json({ ok: false, error: 'شماره موبایل معتبر نیست' }, { status: 400 })
    }
    if (!/^\d{4,8}$/.test(code)) {
      return NextResponse.json({ ok: false, error: 'کد تأیید نامعتبر است' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ ok: false, error: 'رمز حداقل ۶ کاراکتر باشد' }, { status: 400 })
    }

    const check = await verifyOtp(phone, code)
    if (!check.ok) {
      return NextResponse.json({ ok: false, error: check.error || 'کد اشتباه است' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: prof } = await admin
      .from('profiles')
      .select('id, phone, full_name, role')
      .eq('phone', phone)
      .limit(1)
      .maybeSingle()

    if (!prof?.id) {
      return NextResponse.json({ ok: false, error: 'حسابی با این شماره یافت نشد' }, { status: 404 })
    }

    const { error } = await admin.auth.admin.updateUserById(prof.id, {
      password,
      email: phoneEmail(phone),
      email_confirm: true,
      user_metadata: { has_user_password: true, phone },
    })
    if (error) {
      return NextResponse.json({ ok: false, error: error.message || 'خطا در ذخیره رمز' }, { status: 400 })
    }

    return NextResponse.json({ ok: true, message: 'رمز با موفقیت تغییر کرد. وارد شوید.' })
  } catch (e) {
    try { await logCritical('auth/password-reset', e) } catch (_) {}
    return NextResponse.json({ ok: false, error: e?.message || 'server error' }, { status: 500 })
  }
}
