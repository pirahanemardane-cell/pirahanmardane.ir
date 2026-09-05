/**
 * لایه مرکزی ارسال پیامک پترن — ملی‌پیامک (BaseServiceNumber)
 *
 * استفاده:
 *   import { sendSms } from '@/lib/sms'
 *   await sendSms({ patternKey: 'payment_success', phone: '09...', vars: { buyerName: '...', orderNumber: '...', amount: '...' } })
 *
 * env لازم:
 *   MELIPAYAMAK_USERNAME
 *   MELIPAYAMAK_PASSWORD   (یا API key در برخی حساب‌ها)
 *   SMS_PATTERN_*          (bodyId هر پترن — از patterns.js)
 *   SMS_ENABLED=true       (اختیاری؛ پیش‌فرض true اگر username ست باشد)
 *   SMS_MOCK=true          (اختیاری؛ فقط لاگ، ارسال واقعی نه)
 *   SMS_ADMIN_PHONES       (اختیاری؛ شماره‌های ادمین با کاما برای پترن‌های admin_*)
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
  return /^09\d{9}$/.test(phone)
}

function isSmsEnabled() {
  const flag = process.env.SMS_ENABLED
  if (flag != null && String(flag).toLowerCase() === 'false') return false
  if (String(process.env.SMS_MOCK || '').toLowerCase() === 'true') return true // mock allowed
  return !!(process.env.MELIPAYAMAK_USERNAME && process.env.MELIPAYAMAK_PASSWORD)
}

function isMockMode() {
  return String(process.env.SMS_MOCK || '').toLowerCase() === 'true'
}

/**
 * ساخت رشته text برای ملی‌پیامک: arg0;arg1;arg2
 * @param {string} patternKey
 * @param {Record<string, string|number|null|undefined>} vars
 */
function buildTextArgs(patternKey, vars = {}) {
  const meta = SMS_PATTERNS[patternKey]
  if (!meta) throw new Error(`unknown patternKey: ${patternKey}`)
  return meta.vars
    .map((key) => {
      const v = vars[key]
      if (v == null) return ''
      // ملی‌پیامک جداکننده ; است — نباید داخل متغیر باشد
      return String(v).replace(/;/g, '،').trim()
    })
    .join(';')
}

/**
 * @typedef {Object} SendSmsResult
 * @property {boolean} ok
 * @property {boolean} [skipped]
 * @property {string} [reason]
 * @property {string} [recId]
 * @property {string|number} [raw]
 * @property {boolean} [mock]
 * @property {Error} [error]
 */

/**
 * ارسال پیامک پترن
 * @param {{
 *   patternKey: string,
 *   phone: string,
 *   vars?: Record<string, string|number|null|undefined>,
 *   force?: boolean,
 * }} opts
 * @returns {Promise<SendSmsResult>}
 */
export async function sendSms({ patternKey, phone, vars = {}, force = false }) {
  try {
    if (!SMS_PATTERNS[patternKey]) {
      return { ok: false, skipped: true, reason: `unknown_pattern:${patternKey}` }
    }

    const bodyId = getPatternBodyId(patternKey)
    if (!bodyId) {
      // پترن هنوز در env ست نشده — silent skip تا وقتی در ملی‌پیامک ساخته شود
      if (process.env.NODE_ENV !== 'production') {
  }
  return results
}

/**
 * شماره‌های ادمین از env: SMS_ADMIN_PHONES=0912...,0913...
 */
export function getAdminPhones() {
  const raw = process.env.SMS_ADMIN_PHONES || process.env.ADMIN_PHONES || ''
  return raw
    .split(/[,;\s]+/)
    .map((s) => normalizePhone(s))
    .filter(isValidMobile)
}

/**
 * ارسال پیامک ادمین (critical / fraud / outage)
 */
export async function sendAdminSms(patternKey, vars = {}) {
  const phones = getAdminPhones()
  if (!phones.length) {
    return [{ ok: true, skipped: true, reason: 'no_admin_phones' }]
  }
  return sendSmsMany({ patternKey, phones, vars })
}

export { normalizePhone, isValidMobile, buildTextArgs, isSmsEnabled, isMockMode }
