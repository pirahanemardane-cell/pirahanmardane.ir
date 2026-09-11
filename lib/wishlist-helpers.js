/** کمک‌توابع خالص علاقه‌مندی */

import { WISHLIST_MAX } from "@/lib/app-constants";

export function favIdsFromList(favorites) {
  return (Array.isArray(favorites) ? favorites : []).map((f) => f.id);
}

export function isFavoriteId(favorites, productId) {
  return favIdsFromList(favorites).includes(productId);
}

export function getFavEntry(favorites, productId) {
  return (Array.isArray(favorites) ? favorites : []).find((f) => f.id === productId);
}

export function isInWishlist(list, productId) {
  return (Array.isArray(list) ? list : []).some((f) => f.id === productId);
}

export function removeFromWishlist(list, productId) {
  return (Array.isArray(list) ? list : []).filter((f) => f.id !== productId);
}

export function canAddToWishlist(list, max = WISHLIST_MAX) {
  return (Array.isArray(list) ? list.length : 0) < max;
}

export function addToWishlist(list, productId, priceAtAdd = 0) {
  return [
    ...(Array.isArray(list) ? list : []),
    { id: productId, addedAt: Date.now(), priceAtAdd: priceAtAdd ?? 0 },
  ];
}

export function removeWishlistBulk(list, ids) {
  const set = new Set(ids || []);
  return (Array.isArray(list) ? list : []).filter((f) => !set.has(f.id));
}

/** ساخت لیست نمایش علاقه‌مندی از favorites + pool محصولات */
export function buildWishlistProducts(favorites, pool, wishlistFilter, wishlistSort) {
  const favs = Array.isArray(favorites) ? favorites : [];
  const productPool = Array.isArray(pool) ? pool : [];
  let list = favs.map((f) => {
    const fid = f?.product_id || f?.product?.id || f?.id || f;
    const p = productPool.find((x) => x && String(x.id) === String(fid));
    if (!p) return { missing: true, id: fid, addedAt: f?.addedAt, priceAtAdd: f?.priceAtAdd };
    const unavailable = p.status && p.status !== "active" && p.contentStatus !== "approved";
    return {
      ...p,
      addedAt: f?.addedAt,
      priceAtAdd: f?.priceAtAdd,
      missing: !!unavailable,
    };
  });
  if (wishlistFilter === "inStock") list = list.filter((p) => !p.missing && p.stock !== 0);
  if (wishlistFilter === "outStock") list = list.filter((p) => p.missing || p.stock === 0);
  if (wishlistFilter === "sale") list = list.filter((p) => !p.missing && p.discount > 0);
  const sorted = [...list];
  if (wishlistSort === "newest") sorted.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
  if (wishlistSort === "oldest") sorted.sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));
  if (wishlistSort === "priceAsc") sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
  if (wishlistSort === "priceDesc") sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
  if (wishlistSort === "discount") sorted.sort((a, b) => (b.discount || 0) - (a.discount || 0));
  if (wishlistSort === "name")
    sorted.sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "fa"));
  return sorted;
}

