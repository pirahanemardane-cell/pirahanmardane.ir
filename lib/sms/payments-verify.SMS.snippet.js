/**
 * قطعه آماده برای اضافه کردن SMS به app/api/payments/verify/route.js
 * داخل تابع markPaid، بعد از notifyUser موجود قرار بده.
 */

// --- imports بالای فایل ---
// import { smsPaymentSuccess } from '../../../../lib/sms'
// (مسیر را نسبت به محل route تنظیم کن)

// --- داخل markPaid، بعد از block مربوط به notifyUser ---
try {
  if (data?.user_id) {
    const { data: prof } = await admin
      .from('profiles')
      .select('full_name, phone')
      .eq('id', data.user_id)
      .maybeSingle()
    const phone = prof?.phone || null
    if (phone) {
      const { smsPaymentSuccess } = await import('../../../../lib/sms')
      await smsPaymentSuccess({
        phone,
        buyerName: prof?.full_name || 'خریدار',
        orderNumber: data.order_number,
        amount: data.payable ?? data.total,
      })
    }
  }
} catch (_) {}
