/** Addresses API helpers */

export async function fetchAddresses() {
  const res = await fetch("/api/addresses", { credentials: "include" });
  return res.json().catch(() => ({}));
}

export async function createAddress(payload) {
  const res = await fetch("/api/addresses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload || {}),
  });
  return res.json().catch(() => ({}));
}

export async function patchAddress(id, payload) {
  const res = await fetch("/api/addresses/" + encodeURIComponent(String(id)), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload || {}),
  });
  return res.json().catch(() => ({}));
}

export async function deleteAddress(id) {
  const res = await fetch("/api/addresses/" + encodeURIComponent(String(id)), {
    method: "DELETE",
    credentials: "include",
  });
  return { ok: res.ok, status: res.status };
}
