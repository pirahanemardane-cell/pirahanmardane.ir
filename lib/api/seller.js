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
