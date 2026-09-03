export async function apiReviews(productId) {
  const res = await fetch(`/api/reviews?product_id=${encodeURIComponent(productId)}`, {
    credentials: 'include',
    cache: 'no-store',
  })
  return res.json().catch(() => ({}))
}
export async function apiCreateReview(body) {
  const res = await fetch('/api/reviews', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  })
  return res.json().catch(() => ({}))
}
