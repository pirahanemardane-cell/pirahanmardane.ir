/**
 * Public API — لایه پیامک پیراهن مردانه
 *
 * import { sendSms, smsPaymentSuccess, SMS_PATTERNS } from '@/lib/sms'
 */

export { SMS_PATTERNS, ESSENTIAL_PATTERN_KEYS, getPatternBodyId, listRequiredEnvKeys } from './patterns'
export {
  sendSms,
  sendSmsMany,
  sendAdminSms,
  getAdminPhones,
  normalizePhone,
  isValidMobile,
  isSmsEnabled,
  isMockMode,
} from './send'
export * from './events'
