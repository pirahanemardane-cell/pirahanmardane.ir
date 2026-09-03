/**
 * lib/otp.js — نسخه production با پترن‌های جدا + سازگاری با sendMelliPatternSms قبلی
 *
 * کپی به: Pirahanemardaneir-pro/lib/otp.js
 * (و در صورت نیاز mens-clothing-deploy/lib/otp.js)
 *
 * env:
 *   OTP_MOCK=true|false          (پیش‌فرض true اگر خالی)
 *   MELLI_USERNAME / MELIPAYAMAK_USERNAME
 *   MELLI_PASSWORD / MELIPAYAMAK_PASSWORD
 *   MELLI_PATTERN_CODE           (پترن تک‌متغیره قدیمی — فقط کد)
 *   SMS_PATTERN_OTP_LOGIN        (اختیاری — پترن جدید با نام+کد)
 *   SMS_PATTERN_OTP_REGISTER
 *   SMS_PATTERN_OTP_RECOVERY
 */

import { createHash, randomInt } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

export function normalizePhone(input) {
  let d = String(input || '')
    .replace(/[۰-۹]/g, (c) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(c))
    .replace(/[٠-٩]/g, (c) => '٠١٢٣٤٥٦٧٨٩'.indexOf(c))
    .replace(/\D/g, '')
  if (d.startsWith('98') && d.length >= 12) d = '0' + d.slice(2)
  if (d.length === 10 && d.startsWith('9')) d = '0' + d
  return d
}

export function isValidIranMobile(phone) {
  const p = normalizePhone(phone)
  return /^09\d{9}$/.test(p)
}

function normalizeCode(code) {
  return String(code || '')
    .replace(/[۰-۹]/g, (c) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(c))
    .replace(/[٠-٩]/g, (c) => '٠١٢٣٤٥٦٧٨٩'.indexOf(c))
    .replace(/\D/g, '')
}

function hashCode(phone, code) {
  return createHash('sha256').update(`${phone}:${code}`).digest('hex')
}

export function generateCode() {
  return String(randomInt(100000, 999999))
}

export async function issueOtp(phoneRaw, { role = null, ttlMinutes = 10 } = {}) {
  const phone = normalizePhone(phoneRaw)
  if (!isValidIranMobile(phone)) {
    return { ok: false, error: 'شماره موبایل معتبر نیست' }
  }
  const code = generateCode()
  const code_hash = hashCode(phone, code)
  const expires_at = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString()

  try {
    const sb = createAdminClient()
    await sb
      .from('login_otps')
      .update({ consumed_at: new Date().toISOString() })
      .eq('phone', phone)
      .is('consumed_at', null)

    const { error } = await sb.from('login_otps').insert({
      phone,
      code_hash,
      role: role || null,
      expires_at,
    })
    if (error) {
      console.error('[issueOtp]', error)
      return { ok: false, error: error.message || 'خطا در ذخیره کد' }
    }
    return { ok: true, phone, code, ttlMinutes }
  } catch (e) {
    console.error('[issueOtp]', e)
    return { ok: false, error: String(e?.message || e) }
  }
}

/** سازگاری: storeOtp قدیمی → issueOtp */
export async function storeOtp(phone, code, role = null) {
  const phoneN = normalizePhone(phone)
  const codeN = normalizeCode(code)
  if (!isValidIranMobile(phoneN) || !codeN) {
    return { ok: false, error: 'شماره یا کد نامعتبر' }
  }
  try {
    const sb = createAdminClient()
    const code_hash = hashCode(phoneN, codeN)
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    await sb
      .from('login_otps')
      .update({ consumed_at: new Date().toISOString() })
      .eq('phone', phoneN)
      .is('consumed_at', null)
    const { error } = await sb.from('login_otps').insert({
      phone: phoneN,
      code_hash,
      role,
      expires_at,
    })
    if (error) return { ok: false, error: error.message }
    return { ok: true, phone: phoneN }
  } catch (e) {
    return { ok: false, error: String(e?.message || e) }
  }
}

export async function verifyOtp(phoneRaw, codeRaw) {
  const phone = normalizePhone(phoneRaw)
  const code = normalizeCode(codeRaw)
  if (!phone || !code) {
    return { ok: false, error: 'شماره یا کد ناقص است' }
  }
  try {
    const sb = createAdminClient()
    const { data: rows, error } = await sb
      .from('login_otps')
      .select('id, code_hash, expires_at, consumed_at')
      .eq('phone', phone)
      .is('consumed_at', null)
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('[verifyOtp]', error)
      return { ok: false, error: error.message || 'خطا در بررسی کد' }
    }
    if (!rows?.length) {
      return { ok: false, error: 'کد منقضی شده یا درخواست نشده' }
    }

    const now = Date.now()
    const code_hash = hashCode(phone, code)
    let matched = null
    for (const row of rows) {
      if (row.expires_at && new Date(row.expires_at).getTime() < now) continue
      if (row.code_hash === code_hash) {
        matched = row
        break
      }
    }
    if (!matched) {
      const anyValid = rows.some(
        (r) => r.expires_at && new Date(r.expires_at).getTime() >= now
      )
      return {
        ok: false,
        error: anyValid ? 'کد تأیید اشتباه است' : 'کد منقضی شده یا درخواست نشده',
      }
    }

    await sb
      .from('login_otps')
      .update({ consumed_at: new Date().toISOString() })
      .eq('id', matched.id)

    await sb.from('login_otps').insert({
      phone,
      code_hash: hashCode(phone, 'verified:' + matched.id),
      role: 'verified_session',
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    })

    return { ok: true, phone }
  } catch (e) {
    console.error('[verifyOtp]', e)
    return { ok: false, error: String(e?.message || e) }
  }
}

export async function markPhoneVerified(phoneRaw) {
  return { ok: true, phone: normalizePhone(phoneRaw) }
}

export async function isPhoneVerified(phoneRaw) {
  const phone = normalizePhone(phoneRaw)
  try {
    const sb = createAdminClient()
    const { data: rows } = await sb
      .from('login_otps')
      .select('id, role, expires_at, consumed_at')
      .eq('phone', phone)
      .eq('role', 'verified_session')
      .is('consumed_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
    const row = rows?.[0]
    if (!row) return false
    if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) return false
    return true
  } catch (_) {
    return false
  }
}

export async function clearPhoneVerified(phoneRaw) {
  const phone = normalizePhone(phoneRaw)
  try {
    const sb = createAdminClient()
    await sb
      .from('login_otps')
      .update({ consumed_at: new Date().toISOString() })
      .eq('phone', phone)
      .eq('role', 'verified_session')
      .is('consumed_at', null)
  } catch (_) {}
}

export function isOtpMock() {
  const v = process.env.OTP_MOCK
  if (v === undefined || v === '') return true
  return v === '1' || v === 'true' || v === 'TRUE'
}

/**
 * ارسال OTP — اولویت:
 * 1) لایه lib/sms با پترن جدا (اگر bodyId ست باشد)
 * 2) پترن قدیمی تک‌آرگومانی MELLI_PATTERN_CODE (رفتار قبلی)
 */
export async function sendMelliPatternSms(phone, code, opts = {}) {
  const purpose = String(opts.purpose || opts.role || 'login').toLowerCase()
  const name = opts.name || 'کاربر'
  const minutes = opts.minutes || 10

  // تلاش با لایه مرکزی (اگر در پروژه باشد)
  try {
    const sms = await import('@/lib/sms').catch(() => null)
    if (sms?.sendSms) {
      const patternKey =
        purpose === 'register' || purpose === 'signup'
          ? 'otp_register'
          : purpose === 'recovery' || purpose === 'reset'
            ? 'otp_recovery'
            : 'otp_login'

      const vars =
        patternKey === 'otp_register'
          ? { name, code, minutes }
          : { name, code }

      const r = await sms.sendSms({
        patternKey,
        phone,
        vars,
        force: true, // OTP همیشه essential است
      })
      if (r?.ok && !r.skipped) return { ok: true, ref: r.recId, via: 'lib/sms' }
      if (r?.mock) return { ok: true, mock: true, via: 'lib/sms' }
      // اگر skip به‌خاطر نبودن bodyId بود → fallback به پترن قدیمی
    }
  } catch (e) {
    console.warn('[sendMelliPatternSms] lib/sms fallback', e?.message || e)
  }

  // ─── روش قبلی (یک پترن، فقط کد) ───
  const username = process.env.MELLI_USERNAME || process.env.MELIPAYAMAK_USERNAME
  const password = process.env.MELLI_PASSWORD || process.env.MELIPAYAMAK_PASSWORD
  const bodyId =
    process.env.MELLI_PATTERN_CODE || process.env.MELIPAYAMAK_BODY_ID || '521601'

  if (!username || !password || !bodyId) {
    return {
      ok: false,
      error: 'تنظیمات ملی‌پیامک ناقص است (USERNAME/PASSWORD/PATTERN)',
    }
  }

  // ملی‌پیامک گاهی 09 و گاهی 98 می‌خواهد — هر دو را امتحان‌پذیر نگه می‌داریم
  const toLocal = normalizePhone(phone)
  const to = toLocal

  const url = 'https://rest.payamak-panel.com/api/SendSMS/BaseServiceNumber'
  const body = new URLSearchParams({
    username: String(username),
    password: String(password),
    text: String(code),
    to,
    bodyId: String(bodyId),
  })

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  const rawText = await res.text()
  let data
  try {
    data = JSON.parse(rawText)
  } catch {
    data = rawText
  }

  const val = data?.Value ?? data?.RetStatus ?? data
  const n = Number(Array.isArray(val) ? val[0] : val)
  if (Number.isFinite(n) && n > 15) {
    return { ok: true, ref: String(n), via: 'legacy' }
  }
  return {
    ok: false,
    error:
      data?.StrRetStatus ||
      data?.message ||
      `خطای ملی‌پیامک: ${typeof data === 'string' ? data : JSON.stringify(data)}`,
  }
}
