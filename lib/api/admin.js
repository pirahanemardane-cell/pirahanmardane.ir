/** Admin API helpers (client) */

async function getJson(url) {
  const res = await fetch(url, { credentials: "include", cache: "no-store" });
  return res.json().catch(() => ({}));
}

export async function apiAdminProducts(limit = 200) {
  return getJson(`/api/admin/products?limit=${limit}`);
}

export async function apiAdminOrders(limit = 100) {
  return getJson(`/api/admin/orders?limit=${limit}`);
}

export async function apiAdminSellers() {
  return getJson("/api/admin/sellers");
}

export async function apiAdminStats() {
  return getJson("/api/admin/stats");
}

export async function apiAdminPatchProduct(productId, body) {
  const res = await fetch("/api/admin/products/" + encodeURIComponent(String(productId)), {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  return res.json().catch(() => ({}));
}
