/**
 * قطعه آماده برای ثبت ارسال / کد رهگیری
 * (مثلاً seller panel → mark as shipped)
 */

// import { smsShipmentSent, smsShipmentTracking } from '@/lib/sms'

/*
  // بعد از update سفارش به shipped + ذخیره tracking_code:

  const { data: order } = await admin
    .from('orders')
    .select('id, order_number, user_id, tracking_code')
    .eq('id', orderId)
    .maybeSingle()

  if (!order?.user_id) return

  const { data: prof } = await admin
    .from('profiles')
    .select('full_name, phone')
    .eq('id', order.user_id)
    .maybeSingle()

  if (!prof?.phone) return

  const buyerName = prof.full_name || 'خریدار'
  const orderNumber = order.order_number

  await smsShipmentSent({ phone: prof.phone, buyerName, orderNumber })

  const code = trackingCode || order.tracking_code
  if (code) {
    await smsShipmentTracking({
      phone: prof.phone,
      buyerName,
      orderNumber,
      trackingCode: code,
    })
  }
*/
