/** Shipping methods */
export async function fetchShippingMethods() {
  const res = await fetch("/api/shipping-methods", { credentials: "include", cache: "no-store" });
  return res.json().catch(() => ({}));
}
export async function postShippingMethods(items) {
  const res = await fetch("/api/shipping-methods", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ items }),
  });
  return res.json().catch(() => ({}));
}
