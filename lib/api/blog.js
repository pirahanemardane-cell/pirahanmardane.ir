/** Blog API helpers */

export async function apiBlogList(limit = 20) {
  const res = await fetch(`/api/blog?limit=${limit}`, { credentials: "include", cache: "no-store" });
  return res.json().catch(() => ({}));
}

export async function apiBlogListAll() {
  const res = await fetch("/api/blog?all=1", { credentials: "include", cache: "no-store" });
  return res.json().catch(() => ({}));
}

export async function apiBlogPost(slug) {
  const res = await fetch(`/api/blog/${encodeURIComponent(slug)}`, { credentials: "include" });
  return res.json().catch(() => ({}));
}

export async function apiBlogPatch(body) {
  const res = await fetch("/api/blog", {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  return res.json().catch(() => ({}));
}

export async function apiBlogDelete(id) {
  const res = await fetch("/api/blog", {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  return res.json().catch(() => ({}));
}

export async function apiBlogCategoriesList() {
  const res = await fetch("/api/blog/categories", { cache: "no-store" });
  return res.json().catch(() => ({}));
}

export async function apiBlogCategoryCreate(payload) {
  const res = await fetch("/api/blog/categories", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
  return res.json().catch(() => ({}));
}

export async function apiBlogCategoryPatch(payload) {
  const res = await fetch("/api/blog/categories", {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
  return res.json().catch(() => ({}));
}

export async function apiBlogCategoryDelete(id) {
  const res = await fetch("/api/blog/categories?id=" + encodeURIComponent(String(id)), {
    method: "DELETE",
    credentials: "include",
  });
  return { ok: res.ok, status: res.status };
}

export async function apiBlogTagsList() {
  const res = await fetch("/api/blog/tags", { cache: "no-store" });
  return res.json().catch(() => ({}));
}

export async function apiBlogTagCreate(payload) {
  const res = await fetch("/api/blog/tags", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
  return res.json().catch(() => ({}));
}

export async function apiBlogTagPatch(payload) {
  const res = await fetch("/api/blog/tags", {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
  return res.json().catch(() => ({}));
}

export async function apiBlogTagDelete(id) {
  const res = await fetch("/api/blog/tags", {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  return res.json().catch(() => ({}));
}
