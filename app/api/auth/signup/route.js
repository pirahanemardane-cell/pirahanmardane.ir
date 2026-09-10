import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'
import { isPhoneVerified, normalizePhone as normOtpPhone } from '../../../../lib/otp'

function normalizePhone(p) {
  let d = String(p || '').replace(/\D/g, '')
  if (d.startsWith('98') && d.length >= 12) d = '0' + d.slice(2)
  if (d.startsWith('9') && d.length === 10) d = '0' + d
  return d
}

function phoneEmail(phone0) {
  return 'u' + normalizePhone(phone0) + '@otp.local'
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const fullName = String(body.fullName || body.full_name || '').trim()
    const role = body.role === 'seller' ? 'seller' : 'buyer'
    const password = String(body.password || '')
    const phone = normalizePhone(body.phone || body.mobile || '')
    const emailRaw = String(body.email || '').trim().toLowerCase()
    const email = emailRaw && emailRaw.includes('@') ? emailRaw : phoneEmail(phone)

    if (!/^09\d{9}$/.test(phone)) {
      return NextResponse.json({ ok: false, error: 'شماره موبایل معتبر (۱۱ رقم با ۰۹) الزامی است' }, { status: 400 })
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ ok: false, error: 'رمز حداقل ۶ کاراکتر باشد' }, { status: 400 })
    }
    if (!fullName || fullName.length < 2) {
      return NextResponse.json({ ok: false, error: 'نام الزامی است' }, { status: 400 })
    }

    // استاندارد: ثبت‌نام با رمز فقط بعد از تأیید OTP همان شماره
    try {
      const verified = await isPhoneVerified(phone)
      if (!verified) {
        return NextResponse.json(
          { ok: false, error: 'ابتدا شماره را با کد پیامک تأیید کنید', needs_otp: true },
          { status: 401 }
        )
      }
    } catch (_) {}

    let admin
    try {
      admin = createAdminClient()
    } catch {
      return NextResponse.json({ ok: false, error: 'پیکربندی سرور ناقص است' }, { status: 500 })
    }

    const { data: existing } = await admin.from('profiles').select('id').eq('phone', phone).limit(1).maybeSingle()
    if (existing?.id) {
      return NextResponse.json({ ok: false, error: 'این شماره قبلاً ثبت شده — وارد شوید' }, { status: 400 })
    }

    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role, phone, has_user_password: true },
    })
    if (cErr) {
      return NextResponse.json({ ok: false, error: cErr.message || 'ثبت‌نام ناموفق' }, { status: 400 })
    }

    const userId = created.user.id
    await admin.from('profiles').upsert({
      id: userId,
      full_name: fullName,
      phone,
      role,
      updated_at: new Date().toISOString(),
    })

    const supabase = await createClient()
    if (supabase) {
      await supabase.auth.signInWithPassword({ email, password })
    }

    const { data: profile } = await admin
      .from('profiles')
      .select('id, full_name, role, phone, avatar_url')
      .eq('id', userId)
      .maybeSingle()

    return NextResponse.json({
      ok: true,
      message: 'ثبت‌نام موفق بود',
      user: { id: userId, email },
      profile: profile || { id: userId, full_name: fullName, role, phone },
    })
  } catch (e) {
    try { await logCritical('app/api/auth/signup/route.js', e) } catch (_) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
