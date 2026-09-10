/**
 * لایه مرکزی ارسال پیامک پترن — ملی‌پیامک (BaseServiceNumber)
 *
 * env:
 *   MELIPAYAMAK_USERNAME / MELIPAYAMAK_PASSWORD
 *   SMS_PATTERN_* (bodyId)
 *   SMS_ENABLED / SMS_MOCK
 *   SMS_ADMIN_PHONES یا ADMIN_PHONES
 */

import { SMS_PATTERNS, getPatternBodyId } from './patterns'

const MELI_URL = 'https://rest.payamak-panel.com/api/SendSMS/BaseServiceNumber'

function normalizePhone(phone) {
  let p = String(phone || '').replace(/\D/g, '')
  if (p.startsWith('98') && p.length === 12) p = '0' + p.slice(2)
  if (p.length === 10 && p.startsWith('9')) p = '0' + p
  return p
}

function isValidMobile(phone) {
  return /^09\d{9}$/.test(normalizePhone(phone))
}

function isSmsEnabled() {
  const flag = process.env.SMS_ENABLED
  if (flag != null && String(flag).toLowerCase() === 'false') return false
  if (String(process.env.SMS_MOCK || '').toLowerCase() === 'true') return true
  return !!(
    (process.env.MELIPAYAMAK_USERNAME || process.env.MELLI_USERNAME) &&
    (process.env.MELIPAYAMAK_PASSWORD || process.env.MELLI_PASSWORD)
  )
}

function isMockMode() {
  return String(process.env.SMS_MOCK || '').toLowerCase() === 'true'
}

function buildTextArgs(patternKey, vars = {}) {
  const meta = SMS_PATTERNS[patternKey]
  if (!meta) throw new Error(`unknown patternKey: ${patternKey}`)
  return meta.vars
    .map((key) => {
      const v = vars[key]
      if (v == null) return ''
      return String(v).replace(/;/g, '،').trim()
    })
    .join(';')
}

/**
 * ارسال یک پیامک پترن
 */
export async function sendSms({ patternKey, phone, vars = {}, force = false }) {
  try {
    if (!SMS_PATTERNS[patternKey]) {
      return { ok: false, skipped: true, reason: `unknown_pattern:${patternKey}` }
    }

    const bodyId = getPatternBodyId(patternKey)
    if (!bodyId) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[sms] missing bodyId for', patternKey)
      }
      return { ok: true, skipped: true, reason: 'no_body_id' }
    }

    const priority = SMS_PATTERNS[patternKey]?.priority || 'essential'
    if (
      !force &&
      priority === 'recommended' &&
      String(process.env.SMS_SEND_RECOMMENDED || '').toLowerCase() !== 'true'
    ) {
      return { ok: true, skipped: true, reason: 'recommended_disabled' }
    }

    if (!isSmsEnabled() && !isMockMode()) {
      return { ok: true, skipped: true, reason: 'sms_disabled' }
    }

    const to = normalizePhone(phone)
    if (!isValidMobile(to)) {
      return { ok: false, skipped: true, reason: 'invalid_phone' }
    }

    const text = buildTextArgs(patternKey, vars)

    if (isMockMode()) {
      if (process.env.NODE_ENV !== 'production') {
        console.info('[sms:mock]', patternKey, to, text)
      }
      return { ok: true, mock: true, recId: 'mock' }
    }

    const username = process.env.MELIPAYAMAK_USERNAME || process.env.MELLI_USERNAME
    const password = process.env.MELIPAYAMAK_PASSWORD || process.env.MELLI_PASSWORD
    if (!username || !password) {
      return { ok: false, skipped: true, reason: 'missing_credentials' }
    }

    const body = new URLSearchParams({
      username: String(username),
      password: String(password),
      text: String(text),
      to,
      bodyId: String(bodyId),
    })

    const res = await fetch(MELI_URL, {
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
      return { ok: true, recId: String(n), raw: data }
    }

    return {
      ok: false,
      raw: data,
      reason:
        data?.StrRetStatus ||
        data?.message ||
        `meli_error:${typeof data === 'string' ? data : JSON.stringify(data)}`,
    }
  } catch (e) {
    console.error('[sms:sendSms]', e)
    return { ok: false, reason: 'exception', error: e }
  }
}

/**
 * ارسال به چند شماره
 */
export async function sendSmsMany({ patternKey, phones = [], vars = {}, force = false }) {
  const list = Array.isArray(phones) ? phones : []
  const results = []
  for (const phone of list) {
    results.push(await sendSms({ patternKey, phone, vars, force }))
  }
  return results
}

/**
 * شماره‌های ادمین از env
 */
export function getAdminPhones() {
  const raw = process.env.SMS_ADMIN_PHONES || process.env.ADMIN_PHONES || ''
  return raw
    .split(/[,;\s]+/)
    .map((s) => normalizePhone(s))
    .filter(isValidMobile)
}

/**
 * پیامک به همه ادمین‌ها
 */
export async function sendAdminSms(patternKey, vars = {}) {
  const phones = getAdminPhones()
  if (!phones.length) {
    return [{ ok: true, skipped: true, reason: 'no_admin_phones' }]
  }
  return sendSmsMany({ patternKey, phones, vars, force: true })
}

export { normalizePhone, isValidMobile, buildTextArgs, isSmsEnabled, isMockMode }
