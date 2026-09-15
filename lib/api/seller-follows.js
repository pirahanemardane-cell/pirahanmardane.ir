/** Seller follows */
export async function fetchSellerFollows() {
  const res = await fetch("/api/seller-follows", {
    credentials: "include",
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  return res.json().catch(() => null);
}
export async function toggleSellerFollow(sellerId, wasFollowing) {
  const res = await fetch("/api/seller-follows", {
    method: wasFollowing ? "DELETE" : "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ seller_id: sellerId }),
  });
  return res.json().catch(() => ({}));
}
