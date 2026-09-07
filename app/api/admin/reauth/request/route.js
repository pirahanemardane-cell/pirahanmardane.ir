import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../../lib/api/admin-guard'
import { issueOtp, isOtpMock, sendMelliPatternSms } from '../../../../../lib/otp'
import { clientIp, rateLimitAsync, rateLimitResponse, RATE_POLICIES } from '../../../../../lib/rate-limit'
import { logCritical } from '../../../../../lib/critical-log'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error

    const phone = String(gate.profile?.phone || '').replace(/\D/g, '')
    if (!phone) {
      return NextResponse.json({ ok: false, error: 'شماره ادمین یافت نشد' }, { status: 400 })
    }

    const ip = clientIp(req)
    const rl = await rateLimitAsync('admin-reauth:' + phone, RATE_POLICIES?.otp_phone || { limit: 5, windowMs: 15 * 60 * 1000 })
    const rlIp = await rateLimitAsync('admin-reauth-ip:' + ip, { limit: 10, windowMs: 15 * 60 * 1000 })
    if (!rl.ok) return rateLimitResponse(rl, 'تعداد درخواست زیاد است')
    if (!rlIp.ok) return rateLimitResponse(rlIp, 'تعداد درخواست زیاد است')

    const issued = await issueOtp(phone, { role: 'admin_reauth', ttlMinutes: 10 })
    if (!issued.ok) {
      return NextResponse.json({ ok: false, error: issued.error || 'خطا در صدور کد' }, { status: 500 })
    }

    if (typeof isOtpMock === 'function' && isOtpMock()) {
      const payload = { ok: true, message: 'کد تأیید ارسال شد (آزمایشی)', mock: true }
      if (process.env.NODE_ENV !== 'production' && process.env.OTP_DEBUG === '1') {
        payload.debug_code = issued.code
      }
      return NextResponse.json(payload)
    }

    const sent = await sendMelliPatternSms(phone, issued.code, {
      purpose: 'recovery',
      name: gate.profile?.full_name || 'ادمین',
      minutes: 10,
    })
    if (!sent.ok) {
      try { await logCritical('admin-reauth/request', sent.error) } catch (_) {}
      return NextResponse.json({ ok: false, error: sent.error || 'ارسال پیامک ناموفق' }, { status: 502 })
    }

    return NextResponse.json({ ok: true, message: 'کد تأیید به شماره ادمین ارسال شد' })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'خطای سرور' }, { status: 500 })
  }
}
