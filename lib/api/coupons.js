/** Coupons API helpers */

export async function fetchCouponByCode(code) {
  const res = await fetch(
    "/api/coupons?code=" + encodeURIComponent(String(code || "")),
    { credentials: "include", cache: "no-store" }
  );
  return res.json().catch(() => ({}));
}

export async function fetchCouponsAdmin() {
  const res = await fetch("/api/coupons?admin=1", {
    credentials: "include",
    cache: "no-store",
  });
  return res.json().catch(() => ({}));
}

export async function createCoupon(payload) {
  const res = await fetch("/api/coupons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload || {}),
  });
  return res.json().catch(() => ({}));
}
