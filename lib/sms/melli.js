/**
 * Melipayamak BaseServiceNumber (pattern SMS).
 * text args joined with ";" in pattern variable order.
 */
import { resolveBodyId } from './patterns'

function normalizePhone(phone) {
  let s = String(phone || '').replace(/\D/g, '')
  if (s.startsWith('98') && s.length >= 12) s = '0' + s.slice(2)
  if (s.startsWith('9') && s.length === 10) s = '0' + s
  return s
}

/**
 * @param {string} phone
 * @param {string} patternKey key from SMS_PATTERNS
 * @param {(string|number)[]} args variables in order {0},{1},...
 */
export async function sendPatternSms(phone, patternKey, args = []) {
  const username = process.env.MELLI_USERNAME || process.env.MELIPAYAMAK_USERNAME
  const password = process.env.MELLI_PASSWORD || process.env.MELIPAYAMAK_PASSWORD
  const bodyId = resolveBodyId(patternKey)

  if (!username || !password) {
    return { ok: false, error: 'تنظیمات ملی‌پیامک ناقص است (USERNAME/PASSWORD)' }
  }
  if (!bodyId) {
    return { ok: false, skipped: true, error: `پترن تنظیم نشده: ${patternKey}` }
  }

  const to = normalizePhone(phone).replace(/^0/, '98')
  const text = (Array.isArray(args) ? args : [args])
    .map((a) => String(a ?? '').replace(/;/g, ' '))
    .join(';')

  const url = 'https://rest.payamak-panel.com/api/SendSMS/BaseServiceNumber'
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        text,
        to,
        bodyId: String(bodyId),
      }),
    })
    const data = await res.json().catch(() => ({}))
    const val = data?.Value ?? data?.RetStatus ?? data
    const n = Number(val)
    if (Number.isFinite(n) && n > 15) {
      return { ok: true, ref: String(n), patternKey, bodyId }
    }
    return {
      ok: false,
      error: data?.StrRetStatus || data?.message || `خطای ملی‌پیامک: ${JSON.stringify(data)}`,
      patternKey,
      bodyId,
    }
  } catch (e) {
    return { ok: false, error: String(e?.message || e), patternKey }
  }
}

/** @deprecated prefer sendPatternSms — kept for OTP callers */
export async function sendMelliPatternSms(phone, code) {
  return sendPatternSms(phone, 'otp', [code])
}
