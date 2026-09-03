/**
 * قطعه آماده برای پیامک ادمین (Critical / Fraud / Outage)
 *
 * env لازم: SMS_ADMIN_PHONES=0912...,0913...
 */

// import {
//   smsAdminCritical,
//   smsAdminFraud,
//   smsAdminPaymentOutage,
//   smsAdminSmsOutage,
// } from '@/lib/sms'

/* ─── خطای Critical سیستم ───
  // در catch بلوک‌های حساس (DB down، unhandled، ...):

  await smsAdminCritical({
    detail: err?.message || 'خطای ناشناخته',
    time: new Date().toLocaleString('fa-IR'),
  })
*/

/* ─── Fraud / فعالیت مشکوک (recommended) ───
  await smsAdminFraud({
    detail: `کاربر ${userId} — ${reason}`,
    time: new Date().toLocaleString('fa-IR'),
  })
*/

/* ─── اختلال درگاه پرداخت ───
  // وقتی verify یا request به درگاه timeout/5xx مکرر می‌دهد:

  await smsAdminPaymentOutage({
    detail: `Zarinpal/درگاه: ${err?.message || 'timeout'}`,
  })
*/

/* ─── اختلال سرویس پیامک (recommended) ───
  // وقتی خود provider پیامک خطا می‌دهد (برای جلوگیری از حلقه، فقط لاگ کن
  // یا به کانال دیگری مثل تلگرام بفرست):

  await smsAdminSmsOutage({
    detail: `ملی‌پیامک: ${err?.message || 'provider_error'}`,
  })
*/
