/**
 * Helperهای سطح‌بالا برای رویدادهای SMS
 * هر تابع فقط SMS می‌فرستد؛ نوتیف داخل‌اپ را جداگانه با notifyUser صدا بزن.
 *
 * همه توابع safe هستند (throw نمی‌کنند) و Promise<SendSmsResult> برمی‌گردانند.
 *
 * essential → همیشه (اگر bodyId ست باشد)
 * recommended → فقط وقتی SMS_SEND_RECOMMENDED=true
 */

import { sendSms, sendAdminSms } from './send'

function safe(fn) {
  return async (...args) => {
    try {
      return await fn(...args)
    } catch (e) {
      console.error('[sms:events]', e)
      return { ok: false, reason: 'exception', error: e }
    }
  }
}

// ─── Auth ───────────────────────────────────────────────

/** OTP ثبت‌نام */
export const smsOtpRegister = safe(async ({ phone, name, code, minutes = 5 }) =>
  sendSms({
    patternKey: 'otp_register',
    phone,
    vars: { name: name || 'کاربر', code, minutes },
  })
)

/** OTP ورود */
export const smsOtpLogin = safe(async ({ phone, name, code }) =>
  sendSms({
    patternKey: 'otp_login',
    phone,
    vars: { name: name || 'کاربر', code },
  })
)

/** OTP بازیابی */
export const smsOtpRecovery = safe(async ({ phone, name, code }) =>
  sendSms({
    patternKey: 'otp_recovery',
    phone,
    vars: { name: name || 'کاربر', code },
  })
)

// ─── Security ───────────────────────────────────────────

/** object یا (phone, name, newPhone) */
export const smsPhoneChanged = safe(async (...args) => {
  const p =
    args.length === 1 && args[0] && typeof args[0] === 'object' && !Array.isArray(args[0])
      ? args[0]
      : { phone: args[0], name: args[1], newPhone: args[2] }
  return sendSms({
    patternKey: 'security_phone_changed',
    phone: p.phone,
    vars: { name: p.name || 'کاربر', newPhone: p.newPhone },
  })
})

/** object یا (phone, name) */
export const smsPasswordChanged = safe(async (...args) => {
  const p =
    args.length === 1 && args[0] && typeof args[0] === 'object' && !Array.isArray(args[0])
      ? args[0]
      : { phone: args[0], name: args[1] }
  return sendSms({
    patternKey: 'security_password_changed',
    phone: p.phone,
    vars: { name: p.name || 'کاربر' },
  })
})

/** recommended */
export const smsSuspiciousLogin = safe(async ({ phone, name, time }) =>
  sendSms({
    patternKey: 'security_suspicious_login',
    phone,
    vars: {
      name: name || 'کاربر',
      time: time || new Date().toLocaleString('fa-IR'),
    },
  })
)

// ─── Order ──────────────────────────────────────────────

/** به فروشنده: سفارش جدید — object یا (phone, sellerName, orderNumber, amount) */
export const smsOrderNewSeller = safe(async (...args) => {
  const p =
    args.length === 1 && args[0] && typeof args[0] === 'object' && !Array.isArray(args[0])
      ? args[0]
      : { phone: args[0], sellerName: args[1], orderNumber: args[2], amount: args[3] }
  return sendSms({
    patternKey: 'order_new_seller',
    phone: p.phone,
    vars: {
      sellerName: p.sellerName || 'فروشنده',
      orderNumber: p.orderNumber,
      amount: formatAmount(p.amount),
    },
  })
})

/** recommended — به خریدار: سفارش ثبت شد — object یا (phone, buyerName, orderNumber, amount) */
export const smsOrderPlacedBuyer = safe(async (...args) => {
  const p =
    args.length === 1 && args[0] && typeof args[0] === 'object' && !Array.isArray(args[0])
      ? args[0]
      : { phone: args[0], buyerName: args[1], orderNumber: args[2], amount: args[3] }
  return sendSms({
    patternKey: 'order_placed_buyer',
    phone: p.phone,
    vars: {
      buyerName: p.buyerName || 'خریدار',
      orderNumber: p.orderNumber,
      amount: formatAmount(p.amount),
    },
  })
})

/** به خریدار: سفارش تأیید شد — object یا (phone, name, orderNumber) */
export const smsOrderConfirmed = safe(async (...args) => {
  const p =
    args.length === 1 && args[0] && typeof args[0] === 'object' && !Array.isArray(args[0])
      ? args[0]
      : { phone: args[0], buyerName: args[1], orderNumber: args[2] }
  return sendSms({
    patternKey: 'order_confirmed',
    phone: p.phone,
    vars: { buyerName: p.buyerName || p.name || 'خریدار', orderNumber: p.orderNumber },
  })
})

/** به خریدار: رد/لغو — action = 'رد' | 'لغو' */
export const smsOrderRejected = safe(async ({ phone, buyerName, orderNumber, action, reason }) =>
  sendSms({
    patternKey: 'order_rejected',
    phone,
    vars: {
      buyerName: buyerName || 'خریدار',
      orderNumber,
      action: action || 'لغو',
      reason: reason || '—',
    },
  })
)

/** recommended — یادآوری فروشنده */
export const smsOrderReminderSeller = safe(async ({ phone, sellerName, orderNumber }) =>
  sendSms({
    patternKey: 'order_reminder_seller',
    phone,
    vars: { sellerName: sellerName || 'فروشنده', orderNumber },
  })
)

/** recommended — نزدیک شدن deadline */
export const smsOrderDeadlineNear = safe(async ({ phone, sellerName, orderNumber, remaining }) =>
  sendSms({
    patternKey: 'order_deadline_near',
    phone,
    vars: {
      sellerName: sellerName || 'فروشنده',
      orderNumber,
      remaining: remaining || '—',
    },
  })
)

// ─── Payment ────────────────────────────────────────────

export const smsPaymentSuccess = safe(async ({ phone, buyerName, orderNumber, amount }) =>
  sendSms({
    patternKey: 'payment_success',
    phone,
    vars: {
      buyerName: buyerName || 'خریدار',
      orderNumber,
      amount: formatAmount(amount),
    },
  })
)

export const smsPaymentFailed = safe(async ({ phone, buyerName, orderNumber }) =>
  sendSms({
    patternKey: 'payment_failed',
    phone,
    vars: { buyerName: buyerName || 'خریدار', orderNumber },
  })
)

/** recommended — برگشت مبلغ از درگاه */
export const smsPaymentRefundedGateway = safe(async ({ phone, buyerName, amount, orderNumber }) =>
  sendSms({
    patternKey: 'payment_refunded_gateway',
    phone,
    vars: {
      buyerName: buyerName || 'خریدار',
      amount: formatAmount(amount),
      orderNumber,
    },
  })
)

// ─── Shipment ───────────────────────────────────────────

export const smsShipmentSent = safe(async ({ phone, buyerName, orderNumber }) =>
  sendSms({
    patternKey: 'shipment_sent',
    phone,
    vars: { buyerName: buyerName || 'خریدار', orderNumber },
  })
)

export const smsShipmentTracking = safe(async ({ phone, buyerName, orderNumber, trackingCode }) =>
  sendSms({
    patternKey: 'shipment_tracking',
    phone,
    vars: {
      buyerName: buyerName || 'خریدار',
      orderNumber,
      trackingCode,
    },
  })
)

/** recommended */
export const smsShipmentDelay = safe(async ({ phone, buyerName, orderNumber }) =>
  sendSms({
    patternKey: 'shipment_delay',
    phone,
    vars: { buyerName: buyerName || 'خریدار', orderNumber },
  })
)

/** recommended */
export const smsShipmentFailedDelivery = safe(async ({ phone, buyerName, orderNumber }) =>
  sendSms({
    patternKey: 'shipment_failed_delivery',
    phone,
    vars: { buyerName: buyerName || 'خریدار', orderNumber },
  })
)

// ─── Seller payout ──────────────────────────────────────

/** recommended */
export const smsSellerPayoutProcessing = safe(async ({ phone, sellerName, amount }) =>
  sendSms({
    patternKey: 'seller_payout_processing',
    phone,
    vars: { sellerName: sellerName || 'فروشنده', amount: formatAmount(amount) },
  })
)

export const smsSellerPayoutSuccess = safe(async ({ phone, sellerName, amount }) =>
  sendSms({
    patternKey: 'seller_payout_success',
    phone,
    vars: { sellerName: sellerName || 'فروشنده', amount: formatAmount(amount) },
  })
)

export const smsSellerPayoutFailed = safe(async ({ phone, sellerName, amount, reason }) =>
  sendSms({
    patternKey: 'seller_payout_failed',
    phone,
    vars: {
      sellerName: sellerName || 'فروشنده',
      amount: formatAmount(amount),
      reason: reason || '—',
    },
  })
)

export const smsSellerBankChanged = safe(async ({ phone, sellerName }) =>
  sendSms({
    patternKey: 'seller_bank_changed',
    phone,
    vars: { sellerName: sellerName || 'فروشنده' },
  })
)

// ─── Return ─────────────────────────────────────────────

export const smsReturnRequestedSeller = safe(async ({ phone, sellerName, orderNumber }) =>
  sendSms({
    patternKey: 'return_requested_seller',
    phone,
    vars: { sellerName: sellerName || 'فروشنده', orderNumber },
  })
)

/** decision = 'تأیید' | 'رد' */
export const smsReturnDecisionBuyer = safe(async ({ phone, buyerName, orderNumber, decision }) =>
  sendSms({
    patternKey: 'return_decision_buyer',
    phone,
    vars: {
      buyerName: buyerName || 'خریدار',
      orderNumber,
      decision: decision || 'بررسی',
    },
  })
)

/** recommended */
export const smsReturnReceived = safe(async ({ phone, buyerName, orderNumber }) =>
  sendSms({
    patternKey: 'return_received',
    phone,
    vars: { buyerName: buyerName || 'خریدار', orderNumber },
  })
)

// ─── Refund ─────────────────────────────────────────────

/** recommended */
export const smsRefundRequested = safe(async ({ phone, buyerName, orderNumber }) =>
  sendSms({
    patternKey: 'refund_requested',
    phone,
    vars: { buyerName: buyerName || 'خریدار', orderNumber },
  })
)

export const smsRefundApproved = safe(async ({ phone, buyerName, orderNumber }) =>
  sendSms({
    patternKey: 'refund_approved',
    phone,
    vars: { buyerName: buyerName || 'خریدار', orderNumber },
  })
)

export const smsRefundDone = safe(async ({ phone, buyerName, amount, orderNumber }) =>
  sendSms({
    patternKey: 'refund_done',
    phone,
    vars: {
      buyerName: buyerName || 'خریدار',
      amount: formatAmount(amount),
      orderNumber,
    },
  })
)

export const smsRefundFailed = safe(async ({ phone, buyerName, orderNumber }) =>
  sendSms({
    patternKey: 'refund_failed',
    phone,
    vars: { buyerName: buyerName || 'خریدار', orderNumber },
  })
)

// ─── Dispute ────────────────────────────────────────────

export const smsDisputeOpened = safe(async ({ phone, name, orderNumber }) =>
  sendSms({
    patternKey: 'dispute_opened',
    phone,
    vars: { name: name || 'کاربر', orderNumber },
  })
)

export const smsDisputeActionNeeded = safe(async ({ phone, name, orderNumber }) =>
  sendSms({
    patternKey: 'dispute_action_needed',
    phone,
    vars: { name: name || 'کاربر', orderNumber },
  })
)

export const smsDisputeResolved = safe(async ({ phone, name, orderNumber, result }) =>
  sendSms({
    patternKey: 'dispute_resolved',
    phone,
    vars: { name: name || 'کاربر', orderNumber, result: result || '—' },
  })
)

// ─── Admin ──────────────────────────────────────────────

/** object یا (detail, time) */
export const smsAdminCritical = safe(async (...args) => {
  const p =
    args.length === 1 && args[0] && typeof args[0] === 'object' && !Array.isArray(args[0])
      ? args[0]
      : { detail: args[0], time: args[1] }
  return sendAdminSms('admin_critical_error', {
    detail: p.detail || 'خطای ناشناخته',
    time: p.time || new Date().toLocaleString('fa-IR'),
  })
})

/** recommended */
export const smsAdminFraud = safe(async ({ detail, time } = {}) =>
  sendAdminSms('admin_fraud', {
    detail: detail || 'فعالیت مشکوک',
    time: time || new Date().toLocaleString('fa-IR'),
  })
)

export const smsAdminPaymentOutage = safe(async ({ detail } = {}) =>
  sendAdminSms('admin_payment_outage', { detail: detail || 'اختلال درگاه' })
)

/** recommended */
export const smsAdminSmsOutage = safe(async ({ detail } = {}) =>
  sendAdminSms('admin_sms_outage', { detail: detail || 'اختلال سرویس پیامک' })
)

// ─── Aliases (سازگاری با روت‌های قبلی روی GitHub) ───────
// بعضی روت‌ها positional یا نام کوتاه صدا می‌زنند.

function asObj(args, keys) {
  if (args.length === 1 && args[0] && typeof args[0] === 'object' && !Array.isArray(args[0])) {
    return args[0]
  }
  const o = {}
  keys.forEach((k, i) => {
    if (args[i] !== undefined) o[k] = args[i]
  })
  return o
}

/** @deprecated از smsOrderConfirmed با object استفاده کنید */
export const smsOrderCancelled = safe(async (...args) => {
  const p = asObj(args, ['phone', 'buyerName', 'orderNumber', 'action', 'reason'])
  return smsOrderRejected({
    phone: p.phone,
    buyerName: p.buyerName || p.name,
    orderNumber: p.orderNumber,
    action: p.action || 'لغو',
    reason: p.reason || '-',
  })
})

export const smsShipped = safe(async (...args) => {
  const p = asObj(args, ['phone', 'buyerName', 'orderNumber'])
  return smsShipmentSent({
    phone: p.phone,
    buyerName: p.buyerName || p.name,
    orderNumber: p.orderNumber,
  })
})

export const smsTracking = safe(async (...args) => {
  const p = asObj(args, ['phone', 'buyerName', 'orderNumber', 'trackingCode'])
  return smsShipmentTracking({
    phone: p.phone,
    buyerName: p.buyerName || p.name,
    orderNumber: p.orderNumber,
    trackingCode: p.trackingCode,
  })
})

export const smsShipDelay = safe(async (...args) => {
  const p = asObj(args, ['phone', 'buyerName', 'orderNumber'])
  return smsShipmentDelay({
    phone: p.phone,
    buyerName: p.buyerName || p.name,
    orderNumber: p.orderNumber,
  })
})

export const smsDeliveryFail = safe(async (...args) => {
  const p = asObj(args, ['phone', 'buyerName', 'orderNumber'])
  return smsShipmentFailedDelivery({
    phone: p.phone,
    buyerName: p.buyerName || p.name,
    orderNumber: p.orderNumber,
  })
})

export const smsPayoutProcessing = safe(async (...args) => {
  const p = asObj(args, ['phone', 'sellerName', 'amount'])
  return smsSellerPayoutProcessing({
    phone: p.phone,
    sellerName: p.sellerName || p.name,
    amount: p.amount,
  })
})

export const smsPayoutOk = safe(async (...args) => {
  const p = asObj(args, ['phone', 'sellerName', 'amount'])
  return smsSellerPayoutSuccess({
    phone: p.phone,
    sellerName: p.sellerName || p.name,
    amount: p.amount,
  })
})

export const smsPayoutFail = safe(async (...args) => {
  const p = asObj(args, ['phone', 'sellerName', 'amount', 'reason'])
  return smsSellerPayoutFailed({
    phone: p.phone,
    sellerName: p.sellerName || p.name,
    amount: p.amount,
    reason: p.reason || '-',
  })
})

export const smsBankChanged = safe(async (...args) => {
  const p = asObj(args, ['phone', 'sellerName'])
  return smsSellerBankChanged({
    phone: p.phone,
    sellerName: p.sellerName || p.name,
  })
})

// ─── utils ──────────────────────────────────────────────

function formatAmount(n) {
  if (n == null || n === '') return '0'
  const num = Number(String(n).replace(/[^\d.-]/g, ''))
  if (!Number.isFinite(num)) return String(n)
  return num.toLocaleString('fa-IR')
}
