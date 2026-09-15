/**
 * قطعه آماده برای Dispute
 * (مثلاً app/api/orders/[id]/dispute/route.js
 *  یا app/api/admin/disputes/[id]/route.js)
 */

// import {
//   smsDisputeOpened,
//   smsDisputeActionNeeded,
//   smsDisputeResolved,
// } from '@/lib/sms'
// import { notifyUser } from '@/lib/api/notify'

/* ─── ایجاد اختلاف ───
  // بعد از insert dispute:

  // به خریدار و/یا فروشنده:
  for (const party of parties) {
    // party: { phone, name, userId }
    if (party.phone) {
      await smsDisputeOpened({
        phone: party.phone,
        name: party.name || 'کاربر',
        orderNumber,
      })
    }
    if (party.userId) {
      await notifyUser({
        userId: party.userId,
        title: 'اختلاف ایجاد شد',
        body: `برای سفارش ${orderNumber} اختلاف ثبت شد. لطفاً وارد پنل شوید.`,
        type: 'dispute',
        meta: { order_id: orderId, dispute_id: disputeId },
      })
    }
  }
*/

/* ─── نیاز به اقدام/مدرک ───
  if (phone) {
    await smsDisputeActionNeeded({
      phone,
      name: name || 'کاربر',
      orderNumber,
    })
  }
*/

/* ─── نتیجه نهایی ───
  // result مثلاً: 'به نفع خریدار' | 'به نفع فروشنده' | 'بسته شد'

  if (phone) {
    await smsDisputeResolved({
      phone,
      name: name || 'کاربر',
      orderNumber,
      result: result || '—',
    })
  }

  if (userId) {
    await notifyUser({
      userId,
      title: 'نتیجه اختلاف',
      body: `نتیجه نهایی اختلاف سفارش ${orderNumber}: ${result || '—'}`,
      type: 'dispute',
      meta: { order_id: orderId, dispute_id: disputeId, result },
    })
  }
*/
