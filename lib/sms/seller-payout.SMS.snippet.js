/**
 * قطعه آماده برای روت تسویه فروشنده
 * (مثلاً app/api/admin/sellers/[id]/payout/route.js
 *  یا app/api/seller/payouts/route.js)
 *
 * بعد از آپدیت موفق وضعیت payout در DB:
 */

// import {
//   smsSellerPayoutProcessing,
//   smsSellerPayoutSuccess,
//   smsSellerPayoutFailed,
// } from '@/lib/sms'
// import { notifyUser } from '@/lib/api/notify'

/*
  // seller: { id, shop_name, phone, owner_id }
  // amount: عدد
  // status: 'processing' | 'paid' | 'failed'
  // reason: رشته (فقط برای failed)

  const phone = seller.phone
  const sellerName = seller.shop_name || 'فروشنده'

  if (status === 'processing' && phone) {
    await smsSellerPayoutProcessing({ phone, sellerName, amount })
  }

  if (status === 'paid' && phone) {
    await smsSellerPayoutSuccess({ phone, sellerName, amount })
  }

  if (status === 'failed' && phone) {
    await smsSellerPayoutFailed({
      phone,
      sellerName,
      amount,
      reason: reason || '—',
    })
  }

  // نوتیف داخل‌اپ (اختیاری)
  if (seller.owner_id) {
    const titles = {
      processing: 'تسویه در حال پردازش',
      paid: 'تسویه موفق',
      failed: 'تسویه ناموفق',
    }
    await notifyUser({
      userId: seller.owner_id,
      title: titles[status] || 'تسویه',
      body: `مبلغ ${amount} تومان — ${titles[status] || status}`,
      type: 'payout',
      meta: { seller_id: seller.id, amount, status },
    })
  }
*/
