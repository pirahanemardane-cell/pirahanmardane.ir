/** Small one-off client helpers */
export async function fetchNotifications() {
  const res = await fetch("/api/notifications", { credentials: "include", cache: "no-store" });
  return res.json().catch(() => ({}));
}
export async function postRecentView(productId) {
  const res = await fetch("/api/recent-views", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ product_id: String(productId) }),
  });
  return res.json().catch(() => ({}));
}
export async function trackOrder(code) {
  const res = await fetch("/api/orders/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  return res.json().catch(() => ({}));
}
