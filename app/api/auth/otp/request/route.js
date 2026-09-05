/**
 * app/api/auth/otp/request/route.js
 * rate-limit + critical log
 */
import { NextResponse } from 'next/server'
import {
  isValidIranMobile,
  normalizePhone,
  issueOtp,
  isOtpMock,
  sendMelliPatternSms,
} from '../../../../../lib/otp'
import { createAdminClient } from '../../../../../lib/supabase/admin'
import { clientIp, rateLimit, RATE_POLICIES, rateLimitResponse } from '../../../../../lib/rate-limit'
import { logCritical } from '../../../../../lib/critical-log'

export async function POST(request) {
  try {
    const ip = clientIp(request)
    const rlIp = rateLimit(`otp_ip:${ip}`, RATE_POLICIES.otp_ip)
    if (!rlIp.ok) return rateLimitResponse(rlIp, 'تعداد درخواست از این شبکه زیاد است')

    const body = await request.json().catch(() => ({}))
    const phone = normalizePhone(body.phone || body.mobile || '')
    if (!isValidIranMobile(phone)) {
      return NextResponse.json({ ok: false, error: 'شماره موبایل معتبر نیست' }, { status: 400 })
    }

    const rlPhone = rateLimit(`otp:${phone}`, RATE_POLICIES.otp_phone)
    if (!rlPhone.ok) return rateLimitResponse(rlPhone, 'تعداد درخواست کد برای این شماره زیاد است')

    const purpose = String(body.purpose || body.type || body.role || 'login').toLowerCase()
    const role = body.role || null

    const issued = await issueOtp(phone, { role })
    if (!issued.ok) {
      return NextResponse.json({ ok: false, error: issued.error || 'خطا در صدور کد' }, { status: 500 })
    }

    if (typeof isOtpMock === 'function' && isOtpMock()) {
      const payload = {
        ok: true,
        message: 'کد تأیید ارسال شد (حالت آزمایشی)',
        mock: true,
      }
      // debug_code فقط در development محلی — هرگز در production
      if (process.env.NODE_ENV !== 'production' && process.env.OTP_DEBUG === '1') {
        payload.debug_code = issued.code
      }
      return NextResponse.json(payload)
    }

    let name = 'کاربر'
    try {
      const admin = createAdminClient()
      const { data: prof } = await admin
        .from('profiles')
        .select('full_name')
        .eq('phone', phone)
        .maybeSingle()
      if (prof?.full_name) name = prof.full_name
    } catch (_) {}

    const sent = await sendMelliPatternSms(phone, issued.code, {
      purpose,
      name,
      minutes: issued.ttlMinutes || 10,
    })
    if (!sent.ok) {
      await logCritical('otp', sent.error || 'sms fail', { phone: phone.slice(0, 4) + '****' })
      return NextResponse.json(
        { ok: false, error: sent.error || 'ارسال پیامک ناموفق' },
        { status: 502 }
      )
    }

    return NextResponse.json({
      ok: true,
      message: 'کد تأیید پیامک شد',
      mock: false,
    })
  } catch (e) {
    await logCritical('otp', e)
    return NextResponse.json({ ok: false, error: 'خطای سرور' }, { status: 500 })
  }
}
