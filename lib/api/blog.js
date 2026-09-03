export async function apiBlogList(limit = 20) {
  const res = await fetch(`/api/blog?limit=${limit}`, { credentials: 'include' })
  return res.json().catch(() => ({}))
}
export async function apiBlogPost(slug) {
  const res = await fetch(`/api/blog/${encodeURIComponent(slug)}`, { credentials: 'include' })
  return res.json().catch(() => ({}))
}
