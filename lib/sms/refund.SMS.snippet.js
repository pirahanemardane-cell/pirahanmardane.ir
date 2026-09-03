/**
 * قطعه آماده برای Refund
 * (مثلاً app/api/orders/[id]/refund/route.js
 *  یا app/api/admin/refunds/[id]/route.js
 *  یا داخل orders-return بعد از تأیید مرجوعی)
 */

// import {
//   smsRefundRequested,
//   smsRefundApproved,
//   smsRefundDone,
//   smsRefundFailed,
// } from '@/lib/sms'
// import { notifyUser } from '@/lib/api/notify'

/*
  // buyer: { phone, full_name, user_id }
  // orderNumber, amount, status: 'requested' | 'approved' | 'done' | 'failed'

  const phone = buyer.phone
  const buyerName = buyer.full_name || 'خریدار'

  if (status === 'requested' && phone) {
    await smsRefundRequested({ phone, buyerName, orderNumber })
  }

  if (status === 'approved' && phone) {
    await smsRefundApproved({ phone, buyerName, orderNumber })
  }

  if (status === 'done' && phone) {
    await smsRefundDone({ phone, buyerName, amount, orderNumber })
  }

  if (status === 'failed' && phone) {
    await smsRefundFailed({ phone, buyerName, orderNumber })
  }

  if (buyer.user_id) {
    const titles = {
      requested: 'درخواست بازپرداخت ثبت شد',
      approved: 'بازپرداخت تأیید شد',
      done: 'بازپرداخت انجام شد',
      failed: 'بازپرداخت ناموفق',
    }
    await notifyUser({
      userId: buyer.user_id,
      title: titles[status] || 'بازپرداخت',
      body: `سفارش ${orderNumber} — ${titles[status] || status}`,
      type: 'refund',
      meta: { order_number: orderNumber, status, amount },
    })
  }
*/
