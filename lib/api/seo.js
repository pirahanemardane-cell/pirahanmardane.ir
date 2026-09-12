/** SEO helpers */
export async function postSeoRedirects(redirects) {
  const res = await fetch("/api/seo/redirects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ redirects: redirects || [] }),
  });
  return res.json().catch(() => ({}));
}
export async function postIndexNow(payload) {
  const res = await fetch("/api/seo/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
  return res.json().catch(() => ({}));
}
