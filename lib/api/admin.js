async function j(url) {
  const res = await fetch(url, { credentials: 'include', cache: 'no-store' })
  return res.json().catch(() => ({}))
}
export const apiAdminOrders = () => j('/api/admin/orders')
export const apiAdminProducts = () => j('/api/admin/products')
export const apiAdminSellers = () => j('/api/admin/sellers')
