import { createStore } from './createStore.js';
import { storageGetJSON, storageSetJSON } from '../client-storage.js';
import {
  apiGetCart,
  apiAddToCart,
  apiClearCart,
  apiRemoveCartItem,
  mapServerCartResponse,
  isServerProductId,
} from '../api/cart.js';

function loadCart() {
  if (typeof window === 'undefined') return [];
  const data = storageGetJSON('cart', null);
  return Array.isArray(data) ? data : [];
}

export const cartStore = createStore([]);

export function hydrateCartStore() {
  cartStore.setState(() => loadCart());
}

export function setCartItems(items) {
  const list = Array.isArray(items) ? items : [];
  cartStore.setState(() => list);
  storageSetJSON('cart', list);
}

export function getCartCount(items) {
  const list = items || cartStore.getState();
  return (list || []).reduce((n, i) => n + (i.qty || 1), 0);
}

/** آیا کاربر session سروری دارد؟ (کوکی) — با یک GET سبک چک می‌شود در sync */
let _serverCartEnabled = null;

export function setServerCartEnabled(v) {
  _serverCartEnabled = !!v;
}

export function isServerCartEnabled() {
  return _serverCartEnabled === true;
}

/**
 * همگام‌سازی سبد از سرور.
 * اگر 401 بود → فقط local می‌ماند و serverCart خاموش می‌شود.
 * @returns {{ ok: boolean, items?: any[], error?: string }}
 */
export async function syncCartFromServer() {
  const localBefore = Array.isArray(cartStore.getState()) ? [...cartStore.getState()] : [];
  try {
    const data = await apiGetCart();
    if (!data?.ok) {
      if (data?.error && /وارد نشده|401|auth/i.test(String(data.error))) {
        setServerCartEnabled(false);
      }
      return { ok: false, error: data?.error || 'خطا در خواندن سبد' };
    }
    setServerCartEnabled(true);
    let mapped = mapServerCartResponse(data);
    const serverItems = Array.isArray(mapped.items) ? mapped.items : [];

    // ادغام سبد مهمان: آیتم‌های local با UUID که روی سرور نیستند را push کن
    const serverProductKeys = new Set(
      serverItems.map((it) => `${it.product_id || it.id}::${it.variantId || it.variant_id || ''}`),
    );
    let pushed = 0;
    for (const item of localBefore) {
      const pid = item.product_id || item.id;
      if (!isServerProductId(pid)) continue;
      const key = `${pid}::${item.variantId || item.variant_id || ''}`;
      if (serverProductKeys.has(key)) continue;
      try {
        const addRes = await apiAddToCart({
          productId: pid,
          variantId: item.variantId || item.variant_id || null,
          qty: item.qty || 1,
        });
        if (addRes?.ok) {
          pushed += 1;
          serverProductKeys.add(key);
        }
      } catch (_) {}
    }

    if (pushed > 0) {
      const data2 = await apiGetCart();
      if (data2?.ok) {
        mapped = mapServerCartResponse(data2);
      }
    }

    // آیتم‌های purely local (بدون UUID) را کنار سرور نگه دار
    const finalServer = Array.isArray(mapped.items) ? mapped.items : [];
    const localOnly = localBefore.filter((it) => !isServerProductId(it.product_id || it.id));
    const merged = localOnly.length ? [...finalServer, ...localOnly] : finalServer;
    setCartItems(merged);
    return {
      ok: true,
      items: merged,
      subtotal: mapped.subtotal,
      count: merged.reduce((n, i) => n + (i.qty || 1), 0),
    };
  } catch (e) {
    return { ok: false, error: String(e?.message || e) };
  }
}

/**
 * افزودن به سبد سرور (فقط اگر productId از نوع UUID باشد و session فعال).
 * در غیر این صورت null برمی‌گرداند تا caller روی local کار کند.
 */
export async function addToCartServer(productId, qty = 1, variantId = null) {
  if (!isServerProductId(productId)) return null;
  try {
    const data = await apiAddToCart({ productId, variantId, qty });
    if (!data?.ok) {
      if (data?.error && /وارد نشده|401/i.test(String(data.error))) {
        setServerCartEnabled(false);
      }
      return data;
    }
    setServerCartEnabled(true);
    // بعد از افزودن، لیست کامل را بگیر
    await syncCartFromServer();
    return data;
  } catch (e) {
    return { ok: false, error: String(e?.message || e) };
  }
}

export async function clearCartServer() {
  try {
    const data = await apiClearCart();
    if (data?.ok) {
      setCartItems([]);
      return data;
    }
    return data;
  } catch (e) {
    return { ok: false, error: String(e?.message || e) };
  }
}

export async function removeCartItemServer(item) {
  if (!item) return { ok: false, error: 'آیتم نامعتبر' };
  try {
    const data = await apiRemoveCartItem({
      itemId: item.serverItemId || item.id,
      productId: item.product_id || item.id,
    });
    if (data?.ok) {
      await syncCartFromServer();
      return data;
    }
    // اگر API حذف نبود، فقط از UI/local حذف کن
    return data;
  } catch (e) {
    return { ok: false, error: String(e?.message || e) };
  }
}
