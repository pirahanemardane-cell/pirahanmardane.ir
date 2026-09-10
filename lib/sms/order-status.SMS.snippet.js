/**
 * قطعه آماده برای route تغییر وضعیت سفارش
 * (مثلاً app/api/orders/[id]/status/route.js یا seller order actions)
 *
 * بعد از آپدیت موفق status در DB:
 */

// import { smsOrderConfirmed, smsOrderRejected } from '@/lib/sms'
// import { notifyUser } from '@/lib/api/notify'

/*
  const admin = createAdminClient()
  // ... update order status ...

  const { data: order } = await admin
    .from('orders')
    .select('id, order_number, user_id, status')
    .eq('id', orderId)
    .maybeSingle()

  if (!order?.user_id) return

  const { data: prof } = await admin
    .from('profiles')
    .select('full_name, phone')
    .eq('id', order.user_id)
    .maybeSingle()

  const buyerName = prof?.full_name || 'خریدار'
  const phone = prof?.phone

  if (newStatus === 'confirmed' || newStatus === 'processing' || newStatus === 'preparing') {
    if (phone) {
      await smsOrderConfirmed({
        phone,
        buyerName,
        orderNumber: order.order_number,
      })
    }
    await notifyUser({
      userId: order.user_id,
      title: 'سفارش تأیید شد',
      body: `سفارش ${order.order_number || ''} تأیید شد و در حال آماده‌سازی است.`,
      type: 'order',
      meta: { order_id: order.id },
    })
  }

  if (newStatus === 'rejected' || newStatus === 'cancelled' || newStatus === 'canceled') {
    const action = newStatus.startsWith('cancel') ? 'لغو' : 'رد'
    if (phone) {
      await smsOrderRejected({
        phone,
        buyerName,
        orderNumber: order.order_number,
        action,
        reason: reason || '—',
      })
    }
    await notifyUser({
      userId: order.user_id,
      title: `سفارش ${action} شد`,
      body: `سفارش ${order.order_number || ''} ${action} شد. ${reason || ''}`,
      type: 'order',
      meta: { order_id: order.id },
    })
  }
*/
