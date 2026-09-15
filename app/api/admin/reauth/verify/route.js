import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../../lib/api/admin-guard'
import { verifyOtp, normalizePhone } from '../../../../../lib/otp'
import { clientIp, rateLimitAsync, rateLimitResponse } from '../../../../../lib/rate-limit'

export const dynamic = 'force-dynamic'

function normalizeCode(code) {
  return String(code || '')
    .replace(/[۰-۹]/g, (c) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c)))
    .replace(/[٠-٩]/g, (c) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(c)))
    .replace(/\D/g, '')
}

export async function POST(req) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error

    const body = await req.json().catch(() => ({}))
    const code = normalizeCode(body.code || body.otp)
    const phone = normalizePhone(gate.profile?.phone || '')
    if (!phone || code.length < 4) {
      return NextResponse.json({ ok: false, error: 'کد نامعتبر است' }, { status: 400 })
    }

    const ip = clientIp(req)
    const rl = await rateLimitAsync('admin-reauth-v:' + phone, { limit: 8, windowMs: 15 * 60 * 1000 })
    if (!rl.ok) return rateLimitResponse(rl, 'تعداد تلاش زیاد است')

    const result = await verifyOtp(phone, code)
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error || 'کد اشتباه است' }, { status: 401 })
    }

    const exp = Date.now() + 10 * 60 * 1000
    const res = NextResponse.json({
      ok: true,
      message: 'تأیید شد. تا ۱۰ دقیقه می‌توانید بک‌آپ بگیرید.',
      expires_at: new Date(exp).toISOString(),
    })
    const secure = process.env.NODE_ENV === 'production'
    res.cookies.set('pm_admin_reauth', `ok:${gate.user.id}`, {
      path: '/', httpOnly: true, sameSite: 'lax', secure, maxAge: 10 * 60,
    })
    res.cookies.set('pm_admin_reauth_exp', String(exp), {
      path: '/', httpOnly: true, sameSite: 'lax', secure, maxAge: 10 * 60,
    })
    return res
  } catch (e) {
    console.error('[admin/reauth/verify]', e)
    return NextResponse.json({ ok: false, error: 'خطای سرور' }, { status: 500 })
  }
}
