/** Wishlist */
export async function addWishlist(productId) {
  const res = await fetch("/api/wishlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ product_id: String(productId) }),
  });
  return res.json().catch(() => ({}));
}
export async function removeWishlist(productId) {
  const res = await fetch("/api/wishlist", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ product_id: String(productId) }),
  });
  return res.json().catch(() => ({}));
}
