import { createClient } from '../../../lib/supabase/server'
import { createAdminClient } from '../../../lib/supabase/admin'
import { NextResponse } from 'next/server'
import { notifyUser } from '../../../lib/api/notify'
import { logCritical } from '../../../lib/critical-log'
import { smsOrderPlacedBuyer, smsOrderNewSeller } from '../../../lib/sms/events'
import { rateLimit, RATE_POLICIES, rateLimitResponse } from '../../../lib/rate-limit'

function orderNumber() {
  const d = new Date()
  const y = d.getFullYear().toString().slice(-2)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const r = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `PM${y}${m}${day}-${r}`
}

async function requireUser(supabase) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    return {
      user: null,
      res: NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 }),
    }
  }
  return { user, res: null }
}

export async function GET() {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ ok: false, error: 'پیکربندی Supabase ناقص است' }, { status: 500 })
    }
    const { user, res } = await requireUser(supabase)
    if (res) return res

    const admin = createAdminClient()
    let { data, error } = await admin
      .from('orders')
      .select(
        `id, order_number, status, subtotal, shipping_cost, discount, discount_amount, payable, total, currency,
         payment_method, shipping_method, tracking_code, paid_at, created_at, updated_at, user_id,
         address_snapshot, contact_snapshot,
         items:order_items ( id, product_id, name, color_name, size, image_url, qty, unit_price, line_total )`
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error && /column|does not exist|relationship/i.test(error.message || '')) {
      const r2 = await admin
        .from('orders')
        .select(
          `id, order_number, status, subtotal, shipping_cost, total, payment_method, shipping_method,
           tracking_code, paid_at, created_at, updated_at, user_id, address_snapshot`
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      data = r2.data
      error = r2.error

      if (!error && data?.length) {
        const ids = data.map((o) => o.id)
        const { data: items } = await admin
          .from('order_items')
          .select('id, order_id, product_id, name, color_name, size, image_url, qty, unit_price, line_total')
          .in('order_id', ids)
        const byOrder = {}
        ;(items || []).forEach((it) => {
          if (!byOrder[it.order_id]) byOrder[it.order_id] = []
          byOrder[it.order_id].push(it)
        })
        data = data.map((o) => ({ ...o, items: byOrder[o.id] || [] }))
      }
    }

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true, orders: data || [] })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ ok: false, error: 'پیکربندی Supabase ناقص است' }, { status: 500 })
    }
    const { user, res } = await requireUser(supabase)
    if (res) return res

  const __rlOrder = rateLimit(`order_user:${user.id}`, RATE_POLICIES.order_user)
  if (!__rlOrder.ok) return rateLimitResponse(__rlOrder, 'تعداد ثبت سفارش بیش از حد است')

    const admin = createAdminClient()

    const { data: profile } = await admin
      .from('profiles')
      .select('phone, full_name')
      .eq('id', user.id)
      .maybeSingle()

    const body = await request.json().catch(() => ({}))
    const contact = body.contact || {}
    const phone =
      String(contact.phone || profile?.phone || '')
        .replace(/\D/g, '')
        .replace(/^98/, '0') || ''
    const normalizedPhone = phone.startsWith('9') && phone.length === 10 ? '0' + phone : phone

    if (!/^09\d{9}$/.test(normalizedPhone)) {
      return NextResponse.json(
        { ok: false, error: 'شماره موبایل معتبر برای ثبت سفارش الزامی است' },
        { status: 400 }
      )
    }

    const { data: cart } = await admin
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!cart) {
      return NextResponse.json({ ok: false, error: 'سبد خالی است' }, { status: 400 })
    }

    const { data: cartItems, error: cartErr } = await admin
      .from('cart_items')
      .select(
        `id, product_id, variant_id, qty, unit_price,
         product:products ( id, title, cover_image, seller_id, status )`
      )
      .eq('cart_id', cart.id)

    if (cartErr) {
      return NextResponse.json({ ok: false, error: cartErr.message }, { status: 400 })
    }
    if (!cartItems?.length) {
      return NextResponse.json({ ok: false, error: 'سبد خالی است' }, { status: 400 })
    }

    let addressSnapshot = body.address_snapshot || null
    if (!addressSnapshot && body.address_id) {
      const { data: addr } = await admin
        .from('addresses')
        .select(
          'id, title, full_name, receiver_name, phone, province, city, address_line, postal_code, is_default'
        )
        .eq('id', body.address_id)
        .eq('user_id', user.id)
        .maybeSingle()
      if (addr) {
        addressSnapshot = {
          id: addr.id,
          title: addr.title,
          full_name: addr.full_name || addr.receiver_name,
          receiver_name: addr.receiver_name || addr.full_name,
          receiver: addr.receiver_name || addr.full_name,
          phone: addr.phone,
          province: addr.province,
          city: addr.city,
          address_line: addr.address_line,
          address: addr.address_line,
          postal_code: addr.postal_code,
          postal: addr.postal_code,
        }
      }
    }
    if (!addressSnapshot) {
      return NextResponse.json(
        { ok: false, error: 'آدرس ارسال الزامی است (address_id یا address_snapshot)' },
        { status: 400 }
      )
    }

    const subtotal = cartItems.reduce((s, it) => s + (it.unit_price || 0) * (it.qty || 0), 0)
    const shippingCost = Math.max(0, parseInt(body.shipping_cost ?? 45000, 10) || 0)
    const discount = Math.max(
      0,
      parseInt(body.discount ?? body.discount_amount ?? 0, 10) || 0
    )
    const payable = Math.max(0, subtotal + shippingCost - discount)

    const contactSnapshot = {
      firstName: contact.firstName || profile?.full_name || '',
      lastName: contact.lastName || '',
      phone: normalizedPhone,
      email: contact.email || user.email || '',
    }

    const num = orderNumber()
    const insertPayload = {
      order_number: num,
      user_id: user.id,
      status: 'pending_payment',
      subtotal,
      shipping_cost: shippingCost,
      tax: 0,
      discount,
      discount_amount: discount,
      payable,
      total: payable,
      currency: 'IRT',
      coupon_code: body.coupon_code || null,
      shipping_method: body.shipping_method || body.shippingMethod || 'post',
      payment_method: body.payment_method || body.paymentMethod || 'online',
      address_snapshot: addressSnapshot,
      contact_snapshot: contactSnapshot,
      note: body.note || null,
    }

    let order = null
    let orderErr = null
    {
      const r = await admin
        .from('orders')
        .insert(insertPayload)
        .select(
          `id, order_number, status, subtotal, shipping_cost, discount, discount_amount, payable, total,
           payment_method, shipping_method, created_at`
        )
        .maybeSingle()
      order = r.data
      orderErr = r.error
    }

    if (orderErr && /column|does not exist/i.test(orderErr.message || '')) {
      const minimal = {
        order_number: num,
        user_id: user.id,
        status: 'pending',
        subtotal,
        shipping_cost: shippingCost,
        total: payable,
        payment_method: insertPayload.payment_method,
        shipping_method: insertPayload.shipping_method,
        address_snapshot: addressSnapshot,
        contact_snapshot: contactSnapshot,
        note: body.note || null,
      }
      const r2 = await admin
        .from('orders')
        .insert(minimal)
        .select('id, order_number, status, subtotal, shipping_cost, total, payment_method, created_at')
        .maybeSingle()
      order = r2.data
      orderErr = r2.error
    }

    if (orderErr) {
      return NextResponse.json({ ok: false, error: orderErr.message }, { status: 400 })
    }
    if (!order) {
      return NextResponse.json({ ok: false, error: 'ثبت سفارش ناموفق' }, { status: 500 })
    }

    const productIds = [...new Set(cartItems.map((it) => it.product_id).filter(Boolean))]
    let sellerByProduct = {}
    if (productIds.length) {
      const { data: prows } = await admin
        .from('products')
        .select('id, seller_id, title, cover_image')
        .in('id', productIds)
      for (const r of prows || []) sellerByProduct[r.id] = r
    }

    const orderItemsPayload = cartItems.map((it) => {
      const prow = sellerByProduct[it.product_id] || {}
      return {
        order_id: order.id,
        product_id: it.product_id,
        variant_id: it.variant_id,
        seller_id: it.product?.seller_id || prow.seller_id || it.seller_id || null,
        name: it.product?.title || prow.title || 'محصول',
        color_name: null,
        size: null,
        image_url: it.product?.cover_image || prow.cover_image || null,
        qty: it.qty,
        unit_price: it.unit_price,
        line_total: (it.unit_price || 0) * (it.qty || 0),
      }
    })

    const { error: itemsErr } = await admin.from('order_items').insert(orderItemsPayload)
    if (itemsErr) {
      return NextResponse.json({ ok: false, error: itemsErr.message }, { status: 400 })
    }

    // کم کردن موجودی واریانت
    for (const it of cartItems) {
      const qty = Math.max(1, Number(it.qty) || 1)
      if (it.variant_id) {
        try {
          const { data: v } = await admin
            .from('product_variants')
            .select('id, stock')
            .eq('id', it.variant_id)
            .maybeSingle()
          if (v?.id != null && Number.isFinite(Number(v.stock))) {
            const nextStock = Math.max(0, Number(v.stock) - qty)
            await admin.from('product_variants').update({ stock: nextStock }).eq('id', v.id)
          }
        } catch (stockErr) {
          console.error('stock decrement failed', stockErr?.message || stockErr)
        }
      }
    }

    await admin.from('cart_items').delete().eq('cart_id', cart.id)

    let addressSaved = false
    let addressSaveError = null
    if (addressSnapshot && typeof addressSnapshot === 'object') {
      const { error: addrErr } = await admin.from('addresses').insert({
        user_id: user.id,
        title: addressSnapshot.title || 'خانه',
        full_name:
          addressSnapshot.full_name ||
          addressSnapshot.receiver_name ||
          addressSnapshot.receiver ||
          null,
        receiver_name:
          addressSnapshot.receiver_name ||
          addressSnapshot.full_name ||
          addressSnapshot.receiver ||
          null,
        phone: addressSnapshot.phone || normalizedPhone,
        province: addressSnapshot.province || null,
        city: addressSnapshot.city || null,
        address_line: addressSnapshot.address_line || addressSnapshot.address || null,
        postal_code: addressSnapshot.postal_code || addressSnapshot.postal || null,
        is_default: false,
      })
      if (addrErr) {
        addressSaveError = addrErr.message
        console.error('addresses insert failed:', addrErr.message)
      } else {
        addressSaved = true
      }
    }

    await notifyUser({
      userId: user.id,
      title: 'سفارش ثبت شد',
      body: `سفارش ${order?.order_number || ''} با مبلغ ${(order?.payable ?? payable ?? 0).toLocaleString?.('fa-IR') || (order?.payable ?? payable)} تومان ثبت شد و در انتظار پرداخت است.`,
      type: 'order',
      meta: { order_id: order?.id, order_number: order?.order_number },
    })


    // SMS خریدار: سفارش ثبت شد (فروشنده بعد از پرداخت در payments/verify)
    try {
      const orderNo = order?.order_number || order?.id
      const amount = order?.payable ?? order?.total ?? payable
      const buyerPhone = normalizedPhone
      const buyerName = contactSnapshot?.firstName || profile?.full_name || 'خریدار'
      if (buyerPhone) await smsOrderPlacedBuyer(buyerPhone, buyerName, orderNo, amount)
    } catch (smsErr) {
      console.warn('[orders] sms', smsErr?.message || smsErr)
    }

return NextResponse.json({
      ok: true,
      message: 'سفارش ثبت شد — در انتظار پرداخت',
      order,
      address_saved: addressSaved,
      address_save_error: addressSaveError,
    })
  } catch (e) {
    await logCritical('orders', e)

    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
