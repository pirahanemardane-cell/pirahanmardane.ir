/**
 * قطعه آماده برای تغییر اطلاعات حساب بانکی فروشنده
 * (مثلاً app/api/seller/bank/route.js یا profile/seller settings)
 *
 * بعد از ذخیره موفق شبا/حساب:
 */

// import { smsSellerBankChanged } from '@/lib/sms'
// import { notifyUser } from '@/lib/api/notify'

/*
  // seller: { id, shop_name, phone, owner_id }

  const phone = seller.phone
  const sellerName = seller.shop_name || 'فروشنده'

  if (phone) {
    await smsSellerBankChanged({ phone, sellerName })
  }

  if (seller.owner_id) {
    await notifyUser({
      userId: seller.owner_id,
      title: 'تغییر حساب بانکی',
      body: 'اطلاعات حساب بانکی شما تغییر یافت. اگر شما نبودید فوراً اقدام کنید.',
      type: 'security',
      meta: { seller_id: seller.id },
    })
  }
*/
