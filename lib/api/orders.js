/**
 * کلاینت سفارش و پرداخت — credentials: include
 */

async function parseJson(res) {
  try {
    return await res.json()
  } catch {
    return { ok: false, error: 'پاسخ نامعتبر از سرور' }
  }
}

const STATUS_LABELS = {
  pending_payment: 'در انتظار پرداخت',
  pending: 'در انتظار پرداخت / تأیید',
  paid: 'پرداخت‌شده',
  preparing: 'در حال آماده‌سازی',
  shipped: 'ارسال‌شده',
  delivered: 'تحویل‌شده',
  cancelled: 'لغو‌شده',
  refunded: 'بازگشت وجه',
}

function formatFaDate(iso) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return String(iso)
    return d.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  } catch {
    return String(iso)
  }
}

/** تبدیل سفارش سرور به شکل UI پروفایل */
export function mapServerOrder(o) {
  if (!o) return null
  const status = String(o.status || 'pending')
  const total = Number(o.total ?? o.payable ?? 0) || 0
  const items = (o.items || o.order_items || []).map((it) => ({
    id: it.product_id || it.id,
    name: it.name || it.title || 'محصول',
    color: it.color_name || it.color || '',
    size: it.size || '',
    qty: Number(it.qty) || 1,
    price: Number(it.unit_price ?? it.price) || 0,
    image: it.image_url || it.image || null,
  }))
  return {
    id: o.id,
    order_number: o.order_number,
    date: formatFaDate(o.created_at || o.paid_at),
    status,
    statusLabel: STATUS_LABELS[status] || status,
    total,
    subtotal: Number(o.subtotal) || 0,
    shipping_cost: Number(o.shipping_cost) || 0,
    discount: Number(o.discount ?? o.discount_amount) || 0,
    items,
    shipping: {
      method: o.shipping_method || '',
      cost: Number(o.shipping_cost) || 0,
      address: o.address_snapshot
        ? [
            o.address_snapshot.province,
            o.address_snapshot.city,
            o.address_snapshot.address || o.address_snapshot.address_line,
          ]
            .filter(Boolean)
            .join('، ')
        : '',
    },
    payment: {
      method: o.payment_method || 'آنلاین',
      status:
        status === 'paid' ||
        status === 'preparing' ||
        status === 'shipped' ||
        status === 'delivered'
          ? 'paid'
          : status === 'pending_payment' || status === 'pending'
            ? 'pending'
            : status,
      amount: total,
    },
    tracking: o.tracking_code
      ? { code: o.tracking_code, carrier: o.shipping_method || '' }
      : null,
    fromServer: true,
    created_at: o.created_at,
    paid_at: o.paid_at,
  }
}

/** GET /api/orders + map به UI */
export async function apiGetOrders() {
  const res = await fetch('/api/orders', {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
  const data = await parseJson(res)
  if (data?.ok && Array.isArray(data.orders)) {
    data.mapped = data.orders.map(mapServerOrder).filter(Boolean)
  }
  return data
}

/**
 * POST /api/orders
 * body: contact, address_snapshot, shipping_method, shipping_cost, payment_method, discount?, note?
 */
export async function apiCreateOrder(payload) {
  const res = await fetch('/api/orders', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  })
  return parseJson(res)
}

/** POST /api/payments/initiate */
export async function apiPaymentInitiate(orderId) {
  const res = await fetch('/api/payments/initiate', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ order_id: orderId }),
  })
  return parseJson(res)
}

/** POST /api/payments/verify — mock با Status=OK */
export async function apiPaymentVerify({ orderId, authority, status = 'OK' }) {
  const res = await fetch('/api/payments/verify', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      order_id: orderId,
      authority,
      Authority: authority,
      Status: status,
      status,
    }),
  })
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    return parseJson(res)
  }
  if (res.redirected || res.status === 307 || res.status === 302) {
    return { ok: true, redirected: true, url: res.url }
  }
  if (res.ok) return { ok: true, redirected: true }
  return parseJson(res)
}
