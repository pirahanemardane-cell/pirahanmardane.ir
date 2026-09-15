/** منطق خالص علاقه‌مندی‌ها */

import { WISHLIST_MAX } from "@/lib/app-constants";

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
