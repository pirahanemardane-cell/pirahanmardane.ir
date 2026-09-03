import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyOtp, normalizePhone } from '@/lib/otp'
import { clientIp, rateLimit, rateLimitResponse } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

function deviceFingerprint(req) {
  const ua = String(req.headers.get('user-agent') || '').slice(0, 180)
  let h = 0
  for (let i = 0; i < ua.length; i++) h = (h * 31 + ua.charCodeAt(i)) >>> 0
  return `d${h.toString(16)}`
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}))
    const phone = normalizePhone(body.phone)
    const code = String(body.code || '').replace(/\D/g, '')

    if (!phone || code.length !== 6) {
      return NextResponse.json({ ok: false, error: 'کد نامعتبر است' }, { status: 400 })
    }

    const rl = rateLimit(`mfa:${phone}`, { limit: 5, window: 300 })
    if (!rl.ok) return rateLimitResponse(rl, 'تعداد تلاش زیاد است')

    // 1) تأیید کد MFA
    const result = await verifyOtp(phone, code)
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error || 'کد اشتباه است' },
        { status: 401 }
      )
    }

    // 2) پروفایل کاربر
    const admin = createAdminClient()
    const { data: profile } = await admin
      .from('profiles')
      .select('id, full_name, role, phone, avatar_url')
      .eq('phone', phone)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!profile?.id) {
      return NextResponse.json(
        { ok: false, error: 'کاربر پیدا نشد' },
        { status: 404 }
      )
    }

    // 3) اگر session از مرحله لاگین هنوز معتبر است، همان را نگه می‌داریم
    // در غیر این صورت حداقل پاسخ کامل لاگین را برمی‌گردانیم
    const supabase = await createClient()
    let user = null
    try {
      const { data: auth } = await supabase.auth.getUser()
      user = auth?.user || null
    } catch (_) {}

    if (!user) {
      // fallback: اطلاعات حداقلی از profile
      user = {
        id: profile.id,
        email: `u${phone}@otp.local`,
        phone,
      }
    }

    const fp = deviceFingerprint(req)
    const known = req.cookies.get('pm_device')?.value || ''
    const isNewDevice = Boolean(known && known !== fp)

    const res = NextResponse.json({
      ok: true,
      message: 'ورود با موفقیت انجام شد',
      mfa_verified: true,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone || phone,
      },
      profile,
      new_device: isNewDevice || !known,
    })

    res.cookies.set('pm_device', fp, {
      path: '/',
      maxAge: 60 * 60 * 24 * 180,
      sameSite: 'lax',
      httpOnly: true,
    })

    return res
  } catch (e) {
    console.error('[mfa/verify]', e)
    return NextResponse.json({ ok: false, error: 'خطای سرور' }, { status: 500 })
  }
}
