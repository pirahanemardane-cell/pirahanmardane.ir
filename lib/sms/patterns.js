/**
 * پترن‌های پیامک پیراهن مردانه
 * bodyId از env خوانده می‌شود — تا وقتی در ملی‌پیامک ساخته نشده، ارسال skip می‌شود.
 *
 * ترتیب vars باید دقیقاً با ترتیب {0},{1},... پترن در پنل ملی‌پیامک یکی باشد.
 */

/** @typedef {'essential' | 'recommended'} Priority */

/**
 * @type {Record<string, {
 *   env: string,
 *   vars: string[],
 *   priority: Priority,
 *   category: string,
 *   label: string,
 *   sample: string,
 * }>}
 */
export const SMS_PATTERNS = {
  // ─── 🔐 احراز هویت ───
  otp_register: {
    env: 'SMS_PATTERN_OTP_REGISTER',
    vars: ['name', 'code', 'minutes'],
    priority: 'essential',
    category: 'auth',
    label: 'کد OTP ثبت‌نام',
    sample:
      '{0} عزیز کد تأیید ثبت‌نام شما در پیراهن مردانه: {1} این کد تا {2} دقیقه معتبر است. https://pirahanmardane.ir لغو۱۱',
  },
  otp_login: {
    env: 'SMS_PATTERN_OTP_LOGIN',
    vars: ['name', 'code'],
    priority: 'essential',
    category: 'auth',
    label: 'کد OTP ورود',
    sample:
      '{0} عزیز کد ورود به حساب پیراهن مردانه: {1} این کد را در اختیار دیگران قرار ندهید. https://pirahanmardane.ir لغو۱۱',
  },
  otp_recovery: {
    env: 'SMS_PATTERN_OTP_RECOVERY',
    vars: ['name', 'code'],
    priority: 'essential',
    category: 'auth',
    label: 'کد بازیابی حساب',
    sample:
      '{0} عزیز کد بازیابی حساب پیراهن مردانه: {1} در صورت درخواست نکردن این پیام را نادیده بگیرید. https://pirahanmardane.ir لغو۱۱',
  },

  // ─── 🛡️ امنیت ───
  security_phone_changed: {
    env: 'SMS_PATTERN_SECURITY_PHONE_CHANGED',
    vars: ['name', 'newPhone'],
    priority: 'essential',
    category: 'security',
    label: 'تغییر شماره موبایل',
    sample:
      '{0} عزیز شماره موبایل حساب شما در پیراهن مردانه به {1} تغییر یافت. اگر شما نبودید فوراً با پشتیبانی تماس بگیرید. https://pirahanmardane.ir لغو۱۱',
  },
  security_password_changed: {
    env: 'SMS_PATTERN_SECURITY_PASSWORD_CHANGED',
    vars: ['name'],
    priority: 'essential',
    category: 'security',
    label: 'تغییر رمز عبور',
    sample:
      '{0} عزیز رمز عبور حساب شما در پیراهن مردانه با موفقیت تغییر کرد. اگر شما نبودید فوراً اقدام کنید. https://pirahanmardane.ir لغو۱۱',
  },
  security_suspicious_login: {
    env: 'SMS_PATTERN_SECURITY_SUSPICIOUS_LOGIN',
    vars: ['name', 'time'],
    priority: 'recommended',
    category: 'security',
    label: 'ورود مشکوک',
    sample:
      '{0} عزیز ورود جدید از دستگاه/IP مشکوک به حساب پیراهن مردانه شما ثبت شد. زمان: {1} https://pirahanmardane.ir لغو۱۱',
  },

  // ─── 🛒 سفارش ───
  order_new_seller: {
    env: 'SMS_PATTERN_ORDER_NEW_SELLER',
    vars: ['sellerName', 'orderNumber', 'amount'],
    priority: 'essential',
    category: 'order',
    label: 'سفارش جدید (فروشنده)',
    sample:
      '{0} عزیز سفارش جدید شماره {1} به مبلغ {2} تومان در پیراهن مردانه ثبت شد. لطفاً بررسی کنید. https://pirahanmardane.ir لغو۱۱',
  },
  order_placed_buyer: {
    env: 'SMS_PATTERN_ORDER_PLACED_BUYER',
    vars: ['buyerName', 'orderNumber', 'amount'],
    priority: 'recommended',
    category: 'order',
    label: 'سفارش ثبت شد (خریدار)',
    sample:
      '{0} عزیز سفارش شما با شماره {1} در پیراهن مردانه با موفقیت ثبت شد. مبلغ: {2} تومان https://pirahanmardane.ir لغو۱۱',
  },
  order_confirmed: {
    env: 'SMS_PATTERN_ORDER_CONFIRMED',
    vars: ['buyerName', 'orderNumber'],
    priority: 'essential',
    category: 'order',
    label: 'سفارش تأیید شد',
    sample:
      '{0} عزیز سفارش {1} شما در پیراهن مردانه تأیید شد و در حال آماده‌سازی است. https://pirahanmardane.ir لغو۱۱',
  },
  order_rejected: {
    env: 'SMS_PATTERN_ORDER_REJECTED',
    vars: ['buyerName', 'orderNumber', 'action', 'reason'],
    priority: 'essential',
    category: 'order',
    label: 'سفارش رد/لغو شد',
    sample:
      '{0} عزیز سفارش {1} شما در پیراهن مردانه {2} شد. دلیل: {3} https://pirahanmardane.ir لغو۱۱',
  },
  order_reminder_seller: {
    env: 'SMS_PATTERN_ORDER_REMINDER_SELLER',
    vars: ['sellerName', 'orderNumber'],
    priority: 'recommended',
    category: 'order',
    label: 'یادآوری سفارش بدون اقدام',
    sample:
      '{0} عزیز سفارش {1} در پیراهن مردانه هنوز اقدام نشده است. لطفاً بررسی کنید. https://pirahanmardane.ir لغو۱۱',
  },
  order_deadline_near: {
    env: 'SMS_PATTERN_ORDER_DEADLINE_NEAR',
    vars: ['sellerName', 'orderNumber', 'remaining'],
    priority: 'recommended',
    category: 'order',
    label: 'نزدیک شدن Deadline',
    sample:
      '{0} عزیز Deadline پردازش سفارش {1} در پیراهن مردانه نزدیک است ({2}). https://pirahanmardane.ir لغو۱۱',
  },

  // ─── 💳 پرداخت ───
  payment_success: {
    env: 'SMS_PATTERN_PAYMENT_SUCCESS',
    vars: ['buyerName', 'orderNumber', 'amount'],
    priority: 'essential',
    category: 'payment',
    label: 'پرداخت موفق',
    sample:
      '{0} عزیز پرداخت سفارش {1} به مبلغ {2} تومان در پیراهن مردانه با موفقیت انجام شد. https://pirahanmardane.ir لغو۱۱',
  },
  payment_failed: {
    env: 'SMS_PATTERN_PAYMENT_FAILED',
    vars: ['buyerName', 'orderNumber'],
    priority: 'essential',
    category: 'payment',
    label: 'پرداخت ناموفق',
    sample:
      '{0} عزیز پرداخت سفارش {1} در پیراهن مردانه ناموفق بود. لطفاً مجدداً تلاش کنید. https://pirahanmardane.ir لغو۱۱',
  },
  payment_refunded_gateway: {
    env: 'SMS_PATTERN_PAYMENT_REFUNDED_GATEWAY',
    vars: ['buyerName', 'amount', 'orderNumber'],
    priority: 'recommended',
    category: 'payment',
    label: 'پرداخت برگشت خورد',
    sample:
      '{0} عزیز مبلغ {1} تومان از سفارش {2} در پیراهن مردانه به حساب شما برگشت خورد. https://pirahanmardane.ir لغو۱۱',
  },

  // ─── 🚚 ارسال ───
  shipment_sent: {
    env: 'SMS_PATTERN_SHIPMENT_SENT',
    vars: ['buyerName', 'orderNumber'],
    priority: 'essential',
    category: 'shipment',
    label: 'سفارش ارسال شد',
    sample:
      '{0} عزیز سفارش {1} شما از پیراهن مردانه ارسال شد. https://pirahanmardane.ir لغو۱۱',
  },
  shipment_tracking: {
    env: 'SMS_PATTERN_SHIPMENT_TRACKING',
    vars: ['buyerName', 'orderNumber', 'trackingCode'],
    priority: 'essential',
    category: 'shipment',
    label: 'کد رهگیری',
    sample:
      '{0} عزیز کد رهگیری سفارش {1} از پیراهن مردانه: {2} https://pirahanmardane.ir لغو۱۱',
  },
  shipment_delay: {
    env: 'SMS_PATTERN_SHIPMENT_DELAY',
    vars: ['buyerName', 'orderNumber'],
    priority: 'recommended',
    category: 'shipment',
    label: 'تأخیر در ارسال/تحویل',
    sample:
      '{0} عزیز ارسال/تحویل سفارش {1} از پیراهن مردانه با تأخیر مواجه شده است. https://pirahanmardane.ir لغو۱۱',
  },
  shipment_failed_delivery: {
    env: 'SMS_PATTERN_SHIPMENT_FAILED_DELIVERY',
    vars: ['buyerName', 'orderNumber'],
    priority: 'recommended',
    category: 'shipment',
    label: 'تحویل ناموفق',
    sample:
      '{0} عزیز تحویل سفارش {1} از پیراهن مردانه ناموفق بود. لطفاً با پشتیبانی تماس بگیرید. https://pirahanmardane.ir لغو۱۱',
  },

  // ─── 💰 فروشنده ───
  seller_payout_processing: {
    env: 'SMS_PATTERN_SELLER_PAYOUT_PROCESSING',
    vars: ['sellerName', 'amount'],
    priority: 'recommended',
    category: 'seller',
    label: 'پرداخت فروشنده در حال پردازش',
    sample:
      '{0} عزیز مبلغ {1} تومان از فروش شما در پیراهن مردانه در حال پردازش است. https://pirahanmardane.ir لغو۱۱',
  },
  seller_payout_success: {
    env: 'SMS_PATTERN_SELLER_PAYOUT_SUCCESS',
    vars: ['sellerName', 'amount'],
    priority: 'essential',
    category: 'seller',
    label: 'تسویه موفق',
    sample:
      '{0} عزیز تسویه مبلغ {1} تومان در پیراهن مردانه با موفقیت انجام شد. https://pirahanmardane.ir لغو۱۱',
  },
  seller_payout_failed: {
    env: 'SMS_PATTERN_SELLER_PAYOUT_FAILED',
    vars: ['sellerName', 'amount', 'reason'],
    priority: 'essential',
    category: 'seller',
    label: 'تسویه ناموفق',
    sample:
      '{0} عزیز تسویه مبلغ {1} تومان در پیراهن مردانه ناموفق بود. دلیل: {2} https://pirahanmardane.ir لغو۱۱',
  },
  seller_bank_changed: {
    env: 'SMS_PATTERN_SELLER_BANK_CHANGED',
    vars: ['sellerName'],
    priority: 'essential',
    category: 'seller',
    label: 'تغییر اطلاعات حساب بانکی',
    sample:
      '{0} عزیز اطلاعات حساب بانکی شما در پیراهن مردانه تغییر یافت. اگر شما نبودید فوراً اقدام کنید. https://pirahanmardane.ir لغو۱۱',
  },

  // ─── ↩️ مرجوعی ───
  return_requested_seller: {
    env: 'SMS_PATTERN_RETURN_REQUESTED_SELLER',
    vars: ['sellerName', 'orderNumber'],
    priority: 'essential',
    category: 'return',
    label: 'درخواست مرجوعی ثبت شد (فروشنده)',
    sample:
      '{0} عزیز درخواست مرجوعی برای سفارش {1} در پیراهن مردانه ثبت شد. https://pirahanmardane.ir لغو۱۱',
  },
  return_decision_buyer: {
    env: 'SMS_PATTERN_RETURN_DECISION_BUYER',
    vars: ['buyerName', 'orderNumber', 'decision'],
    priority: 'essential',
    category: 'return',
    label: 'درخواست مرجوعی تأیید/رد شد (خریدار)',
    sample:
      '{0} عزیز درخواست مرجوعی سفارش {1} در پیراهن مردانه {2} شد. https://pirahanmardane.ir لغو۱۱',
  },
  return_received: {
    env: 'SMS_PATTERN_RETURN_RECEIVED',
    vars: ['buyerName', 'orderNumber'],
    priority: 'recommended',
    category: 'return',
    label: 'کالای مرجوعی دریافت شد',
    sample:
      '{0} عزیز کالای مرجوعی سفارش {1} در پیراهن مردانه دریافت شد. https://pirahanmardane.ir لغو۱۱',
  },

  // ─── 💸 Refund ───
  refund_requested: {
    env: 'SMS_PATTERN_REFUND_REQUESTED',
    vars: ['buyerName', 'orderNumber'],
    priority: 'recommended',
    category: 'refund',
    label: 'درخواست Refund ثبت شد',
    sample:
      '{0} عزیز درخواست بازپرداخت سفارش {1} در پیراهن مردانه ثبت شد. https://pirahanmardane.ir لغو۱۱',
  },
  refund_approved: {
    env: 'SMS_PATTERN_REFUND_APPROVED',
    vars: ['buyerName', 'orderNumber'],
    priority: 'essential',
    category: 'refund',
    label: 'Refund تأیید شد',
    sample:
      '{0} عزیز بازپرداخت سفارش {1} در پیراهن مردانه تأیید شد. https://pirahanmardane.ir لغو۱۱',
  },
  refund_done: {
    env: 'SMS_PATTERN_REFUND_DONE',
    vars: ['buyerName', 'amount', 'orderNumber'],
    priority: 'essential',
    category: 'refund',
    label: 'Refund انجام شد',
    sample:
      '{0} عزیز مبلغ {1} تومان از سفارش {2} در پیراهن مردانه به حساب شما بازگردانده شد. https://pirahanmardane.ir لغو۱۱',
  },
  refund_failed: {
    env: 'SMS_PATTERN_REFUND_FAILED',
    vars: ['buyerName', 'orderNumber'],
    priority: 'essential',
    category: 'refund',
    label: 'Refund ناموفق',
    sample:
      '{0} عزیز بازپرداخت سفارش {1} در پیراهن مردانه ناموفق بود. https://pirahanmardane.ir لغو۱۱',
  },

  // ─── ⚖️ اختلاف ───
  dispute_opened: {
    env: 'SMS_PATTERN_DISPUTE_OPENED',
    vars: ['name', 'orderNumber'],
    priority: 'essential',
    category: 'dispute',
    label: 'Dispute ایجاد شد',
    sample:
      '{0} عزیز اختلاف برای سفارش {1} در پیراهن مردانه ایجاد شد. لطفاً وارد پنل شوید. https://pirahanmardane.ir لغو۱۱',
  },
  dispute_action_needed: {
    env: 'SMS_PATTERN_DISPUTE_ACTION_NEEDED',
    vars: ['name', 'orderNumber'],
    priority: 'essential',
    category: 'dispute',
    label: 'نیاز به اقدام/مدرک',
    sample:
      '{0} عزیز برای اختلاف سفارش {1} در پیراهن مردانه نیاز به اقدام/مدرک دارید. https://pirahanmardane.ir لغو۱۱',
  },
  dispute_resolved: {
    env: 'SMS_PATTERN_DISPUTE_RESOLVED',
    vars: ['name', 'orderNumber', 'result'],
    priority: 'essential',
    category: 'dispute',
    label: 'نتیجه نهایی Dispute',
    sample:
      '{0} عزیز نتیجه نهایی اختلاف سفارش {1} در پیراهن مردانه: {2} https://pirahanmardane.ir لغو۱۱',
  },

  // ─── 🚨 ادمین ───
  admin_critical_error: {
    env: 'SMS_PATTERN_ADMIN_CRITICAL_ERROR',
    vars: ['detail', 'time'],
    priority: 'essential',
    category: 'admin',
    label: 'خطای Critical سیستم',
    sample:
      'خطای Critical سیستم پیراهن مردانه: {0} زمان: {1} https://pirahanmardane.ir لغو۱۱',
  },
  admin_fraud: {
    env: 'SMS_PATTERN_ADMIN_FRAUD',
    vars: ['detail', 'time'],
    priority: 'recommended',
    category: 'admin',
    label: 'Fraud / فعالیت مشکوک',
    sample:
      'فعالیت مشکوک/Fraud در پیراهن مردانه: {0} {1} https://pirahanmardane.ir لغو۱۱',
  },
  admin_payment_outage: {
    env: 'SMS_PATTERN_ADMIN_PAYMENT_OUTAGE',
    vars: ['detail'],
    priority: 'essential',
    category: 'admin',
    label: 'اختلال جدی Payment',
    sample:
      'اختلال جدی در درگاه پرداخت پیراهن مردانه: {0} https://pirahanmardane.ir لغو۱۱',
  },
  admin_sms_outage: {
    env: 'SMS_PATTERN_ADMIN_SMS_OUTAGE',
    vars: ['detail'],
    priority: 'recommended',
    category: 'admin',
    label: 'اختلال جدی SMS Provider',
    sample:
      'اختلال در سرویس پیامک پیراهن مردانه: {0} https://pirahanmardane.ir لغو۱۱',
  },
}

/** کلیدهای ضروری (اولویت بالا برای ساخت در ملی‌پیامک) */
export const ESSENTIAL_PATTERN_KEYS = Object.keys(SMS_PATTERNS).filter(
  (k) => SMS_PATTERNS[k].priority === 'essential'
)

/**
 * bodyId پترن از env — اگر خالی/ناعدد باشد null برمی‌گرداند.
 * @param {string} patternKey
 * @returns {number|null}
 */
export function getPatternBodyId(patternKey) {
  const meta = SMS_PATTERNS[patternKey]
  if (!meta) return null
  const raw = process.env[meta.env]
  if (raw == null || String(raw).trim() === '') return null
  const n = parseInt(String(raw).trim(), 10)
  return Number.isFinite(n) && n > 0 ? n : null
}

/**
 * لیست envهای لازم برای کپی در Vercel
 * @param {{ onlyEssential?: boolean }} [opts]
 */
export function listRequiredEnvKeys(opts = {}) {
  const keys = opts.onlyEssential
    ? ESSENTIAL_PATTERN_KEYS
    : Object.keys(SMS_PATTERNS)
  return keys.map((k) => SMS_PATTERNS[k].env)
}
