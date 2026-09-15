/**
 * کلاینت API سبد — credentials: include برای کوکی session
 * وقتی کاربر لاگین است از سرور استفاده می‌شود؛ مهمان localStorage می‌ماند.
 */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isServerProductId(id) {
  return UUID_RE.test(String(id || '').trim());
}

async function parseJson(res) {
  try {
    return await res.json();
  } catch {
    return { ok: false, error: 'پاسخ نامعتبر از سرور' };
  }
}

/** GET /api/cart */
export async function apiGetCart() {
  const res = await fetch('/api/cart', {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  return parseJson(res);
}

/** POST /api/cart — افزودن یا افزایش qty */
export async function apiAddToCart({ productId, variantId = null, qty = 1 }) {
  const res = await fetch('/api/cart', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      product_id: productId,
      variant_id: variantId || null,
      qty: Math.max(1, Number(qty) || 1),
    }),
  });
  return parseJson(res);
}

/** PATCH/POST items — تغییر تعداد (اگر route جدا باشد) */
export async function apiUpdateCartItem({ itemId, productId, qty }) {
  // اول /api/cart/items
  let res = await fetch('/api/cart/items', {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      id: itemId,
      item_id: itemId,
      product_id: productId,
      qty: Math.max(0, Number(qty) || 0),
    }),
  });
  if (res.status === 404) {
    // fallback: حذف و افزودن مجدد
    if (qty <= 0) {
      return apiRemoveCartItem({ itemId, productId });
    }
    res = await fetch('/api/cart', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ product_id: productId, qty: Math.max(1, Number(qty) || 1) }),
    });
  }
  return parseJson(res);
}

/** DELETE item */
export async function apiRemoveCartItem({ itemId, productId }) {
  let res = await fetch('/api/cart/items', {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ id: itemId, item_id: itemId, product_id: productId }),
  });
  if (res.status === 404) {
    res = await fetch('/api/cart/items?id=' + encodeURIComponent(itemId || productId || ''), {
      method: 'DELETE',
      credentials: 'include',
    });
  }
  return parseJson(res);
}

/** DELETE /api/cart — خالی کردن */
export async function apiClearCart() {
  const res = await fetch('/api/cart', {
    method: 'DELETE',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  return parseJson(res);
}

/**
 * تبدیل آیتم سرور به شکل UI فرانت (سازگار با App.jsx)
 */
export function mapServerCartItem(it) {
  if (!it) return null;
  const p = it.product || {};
  const name = p.title || p.name || it.name || 'محصول';
  const price = Number(it.unit_price != null ? it.unit_price : p.base_price) || 0;
  return {
    id: it.product_id || p.id,
    product_id: it.product_id || p.id,
    serverItemId: it.id,
    name,
    title: name,
    qty: Number(it.qty) || 1,
    price,
    priceText: String(price),
    unit_price: price,
    image: p.cover_image || it.image_url || null,
    selectedColor: it.color_name ? { name: it.color_name } : null,
    selectedSize: it.size || '',
    selectedAttrs: {},
    stockLeft: 99,
    slug: p.slug || null,
    status: p.status || 'active',
    base_price: p.base_price,
    discount_percent: p.discount_percent || 0,
    fromServer: true,
  };
}

export function mapServerCartResponse(data) {
  if (!data?.ok) return { items: [], subtotal: 0, count: 0, cart: null };
  const items = (data.items || []).map(mapServerCartItem).filter(Boolean);
  return {
    items,
    subtotal: data.subtotal ?? items.reduce((s, i) => s + i.price * i.qty, 0),
    count: data.count ?? items.reduce((s, i) => s + i.qty, 0),
    cart: data.cart || null,
  };
}
