/**
 * قطعه آماده برای تغییر شماره موبایل / رمز عبور
 * (مثلاً app/api/profile/phone/route.js
 *  یا app/api/auth/change-password/route.js
 *  یا app/api/profile/route.js)
 */

// import { smsPhoneChanged, smsPasswordChanged, smsSuspiciousLogin } from '@/lib/sms'
// import { notifyUser } from '@/lib/api/notify'

/* ─── تغییر شماره موبایل ───
  // بعد از آپدیت موفق phone در profiles:
  // userId, oldPhone (اختیاری), newPhone, fullName

  // SMS به شماره جدید (یا قدیم — بسته به سیاست امنیتی)
  const targetPhone = newPhone // یا oldPhone برای اطلاع به شماره قبلی
  if (targetPhone) {
    await smsPhoneChanged({
      phone: targetPhone,
      name: fullName || 'کاربر',
      newPhone,
    })
  }

  await notifyUser({
    userId,
    title: 'تغییر شماره موبایل',
    body: `شماره موبایل حساب به ${newPhone} تغییر یافت.`,
    type: 'security',
  })
*/

/* ─── تغییر رمز عبور ───
  // بعد از آپدیت موفق password:

  if (phone) {
    await smsPasswordChanged({
      phone,
      name: fullName || 'کاربر',
    })
  }

  await notifyUser({
    userId,
    title: 'تغییر رمز عبور',
    body: 'رمز عبور حساب شما با موفقیت تغییر کرد. اگر شما نبودید فوراً اقدام کنید.',
    type: 'security',
  })
*/

/* ─── ورود مشکوک (recommended) ───
  // وقتی IP/device جدید یا geo غیرعادی تشخیص داده شد:

  if (phone) {
    await smsSuspiciousLogin({
      phone,
      name: fullName || 'کاربر',
      time: new Date().toLocaleString('fa-IR'),
    })
  }
*/
