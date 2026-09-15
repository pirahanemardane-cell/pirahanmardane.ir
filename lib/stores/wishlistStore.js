import { createStore } from './createStore.js';
import { storageGetJSON, storageSetJSON } from '../client-storage.js';

export const wishlistStore = createStore([]);

export function hydrateWishlistStore() {
  if (typeof window === 'undefined') return;
  const data = storageGetJSON('favorites', null);
  wishlistStore.setState(() => (Array.isArray(data) ? data : []));
}

export function setWishlistIds(ids) {
  const list = Array.isArray(ids) ? ids : [];
  wishlistStore.setState(() => list);
  storageSetJSON('favorites', list);
}

function isUuid(id) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(id || ''));
}

/** بعد از لاگین: علاقه‌مندی محلی → سرور، بعد لیست سرور منبع حقیقت */
export async function syncWishlistFromServer() {
  if (typeof window === 'undefined') return { ok: false };
  const local = Array.isArray(wishlistStore.getState()) ? [...wishlistStore.getState()] : [];
  const localIds = local
    .map((f) => (typeof f === 'string' ? f : f?.id))
    .filter((id) => id && isUuid(id));

  try {
    for (const productId of localIds) {
      try {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ product_id: String(productId) }),
        });
      } catch (_) {}
    }
    const res = await fetch('/api/wishlist', { credentials: 'include', cache: 'no-store' });
    const json = await res.json().catch(() => ({}));
    if (!json?.ok) return { ok: false, error: json?.error };
    const items = Array.isArray(json.items) ? json.items : [];
    const next = items
      .map((row) => {
        const id = row.product_id || row.product?.id || row.id;
        return { id, addedAt: row.created_at ? new Date(row.created_at).getTime() : Date.now() };
      })
      .filter((x) => x.id);
    setWishlistIds(next);
    return { ok: true, items: next };
  } catch (e) {
    return { ok: false, error: String(e?.message || e) };
  }
}
