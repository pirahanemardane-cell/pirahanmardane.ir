export async function apiSellerProducts() {
  const res = await fetch('/api/seller/products', { credentials: 'include', cache: 'no-store' })
  return res.json().catch(() => ({}))
}
export async function apiCreateSellerProduct(body) {
  const res = await fetch('/api/seller/products', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  })
  return res.json().catch(() => ({}))
}
export async function apiPatchSellerProduct(id, body) {
  const res = await fetch(`/api/seller/products/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  })
  return res.json().catch(() => ({}))
}
export async function apiDeleteSellerProduct(id) {
  const res = await fetch(`/api/seller/products/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  return res.json().catch(() => ({}))
}

/** Upload WebP data URL → Storage; returns public URL (original never stored) */
export async function apiUploadSellerProductImage(dataUrl, productId) {
  const res = await fetch('/api/seller/products/upload-image', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataUrl, productId: productId || undefined }),
  })
  return res.json().catch(() => ({}))
}


/** Shared media upload (seller/admin/buyer) — WebP data URL → Storage URL */
export async function apiUploadMediaImage(dataUrl, folder = 'users') {
  const res = await fetch('/api/media/upload-image', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataUrl, folder }),
  })
  return res.json().catch(() => ({}))
}
