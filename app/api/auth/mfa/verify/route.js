import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyOtp, normalizePhone } from '@/lib/otp'
import { clientIp, rateLimitAsync, rateLimitResponse, RATE_POLICIES } from '@/lib/rate-limit'
import { isAdminPhone } from '@/lib/api/admin-guard'

export const dynamic = 'force-dynamic'

function deviceFingerprint(req) {
  const ua = String(req.headers.get('user-agent') || '').slice(0, 180)
  let h = 0
  for (let i = 0; i < ua.length; i++) h = (h * 31 + ua.charCodeAt(i)) >>> 0
  return 'd' + h.toString(16)
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}))
    const phone = normalizePhone(body.phone)
    const code = String(body.code || '').replace(/\D/g, '')

    if (!phone || code.length < 4 || code.length > 8) {
      return NextResponse.json({ ok: false, error: 'کد نامعتبر است' }, { status: 400 })
    }

    if (!isAdminPhone(phone)) {
      return NextResponse.json({ ok: false, error: 'دسترسی غیرمجاز' }, { status: 403 })
    }

    const ip = clientIp(req)
    const rlPhone = await rateLimitAsync('mfa:' + phone, RATE_POLICIES.mfa)
    const rlIp = await rateLimitAsync('mfa:ip:' + ip, { limit: 20, windowMs: 15 * 60 * 1000 })
    if (!rlPhone.ok || !rlIp.ok) {
      return rateLimitResponse(!rlPhone.ok ? rlPhone : rlIp, 'تعداد تلاش زیاد است')
    }

    const pending = req.cookies.get('pm_mfa_pending')?.value || ''
    if (!pending || pending !== phone) {
      return NextResponse.json(
        { ok: false, error: 'نشست تأیید دو مرحله‌ای منقضی شده. دوباره وارد شوید.' },
        { status: 401 }
      )
    }

    const result = await verifyOtp(phone, code)
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error || 'کد اشتباه است' }, { status: 401 })
    }

    const admin = createAdminClient()
    const { data: profile } = await admin
      .from('profiles')
      .select('id, full_name, role, phone, avatar_url')
      .eq('phone', phone)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!profile?.id) {
      return NextResponse.json({ ok: false, error: 'کاربر پیدا نشد' }, { status: 404 })
    }

    await admin
      .from('profiles')
      .update({ role: 'admin', phone, updated_at: new Date().toISOString() })
      .eq('id', profile.id)

    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })
    }

    const email = 'u' + phone + '@otp.local'
    let signedUser = null
    try {
      const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
        type: 'magiclink',
        email,
      })
      const tokenHash = linkData?.properties?.hashed_token
      if (!linkErr && tokenHash) {
        const { data: sign, error: vErr } = await supabase.auth.verifyOtp({
          type: 'email',
          token_hash: tokenHash,
        })
        if (!vErr && sign?.user) signedUser = sign.user
      }
    } catch (e) {
      console.error('[mfa/verify] session', e)
    }

    if (!signedUser) {
      return NextResponse.json(
        { ok: false, error: 'ورود پس از تأیید انجام نشد. دوباره تلاش کنید.' },
        { status: 500 }
      )
    }

    const fp = deviceFingerprint(req)
    const res = NextResponse.json({
      ok: true,
      message: 'ورود با موفقیت انجام شد',
      mfa_verified: true,
      user: {
        id: signedUser.id,
        email: signedUser.email,
        phone,
      },
      profile: { ...profile, role: 'admin', phone },
    })

    res.cookies.set('pm_device', fp, {
      path: '/',
      maxAge: 60 * 60 * 24 * 180,
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    })
    res.cookies.set('pm_mfa_pending', '', { path: '/', maxAge: 0 })
    return res
  } catch (e) {
    console.error('[mfa/verify]', e)
    return NextResponse.json({ ok: false, error: 'خطای سرور' }, { status: 500 })
  }
}
