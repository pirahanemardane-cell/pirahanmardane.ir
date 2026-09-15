/** Site settings API helpers */

export async function fetchSiteSettings() {
  const res = await fetch("/api/site-settings", { cache: "no-store" });
  return res.json().catch(() => ({}));
}

export async function putSiteSetting(key, value) {
  const res = await fetch("/api/site-settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ key, value }),
  });
  return res.json().catch(() => ({}));
}
