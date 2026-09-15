/** Seller API helpers */

/** GET /api/seller/me */
export async function fetchSellerMe() {
  const r = await fetch("/api/seller/me", { credentials: "include", cache: "no-store" });
  const j = await r.json().catch(() => ({}));
  return j;
}

/** POST /api/seller/register */
export async function registerSellerApi(payload) {
  const rr = await fetch("/api/seller/register", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const rj = await rr.json().catch(() => ({}));
  return { ok: rr.ok && !!rj?.ok, seller: rj?.seller || null, ...rj };
}

/** PATCH /api/seller/me */
export async function patchSellerMe(payload) {
  const res = await fetch("/api/seller/me", {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
  return res.json().catch(() => ({}));
}

/** GET /api/seller/orders */
export async function fetchSellerOrders() {
  const res = await fetch("/api/seller/orders", {
    credentials: "include",
    cache: "no-store",
  });
  return res.json().catch(() => ({}));
}

/** GET /api/seller/payouts */
export async function fetchSellerPayouts() {
  const res = await fetch("/api/seller/payouts", {
    credentials: "include",
    cache: "no-store",
  });
  return res.json().catch(() => ({}));
}

/** POST /api/seller/payouts */
export async function createSellerPayout(payload) {
  const res = await fetch("/api/seller/payouts", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
  return res.json().catch(() => ({}));
}

