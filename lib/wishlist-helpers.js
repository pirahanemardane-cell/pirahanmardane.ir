/** کمک‌توابع خالص علاقه‌مندی */

export function favIdsFromList(favorites) {
  return (Array.isArray(favorites) ? favorites : []).map((f) => f.id);
}

export function isFavoriteId(favorites, productId) {
  return favIdsFromList(favorites).includes(productId);
}

export function getFavEntry(favorites, productId) {
  return (Array.isArray(favorites) ? favorites : []).find((f) => f.id === productId);
}

export function canAddToWishlist(favorites, max) {
  return (Array.isArray(favorites) ? favorites.length : 0) < max;
}
