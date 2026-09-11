/** product/checkout pure helpers */
export function isDealActive(p) {
  if (!p) return false;
  if (!p.amazing) return false;
  if (p.dealEndsAt && Number(p.dealEndsAt) < Date.now()) return false;
  // بدون dealEndsAt در دیتای قدیمی: فقط اگر تخفیف دارد (سازگاری)
  if (!p.dealEndsAt) return ((Number(p.discount) || 0) > 0 || !!p.oldPrice);
  return ((Number(p.discount) || 0) > 0 || !!p.oldPrice);
}

export function matchSellerId(p, sid) {
  if (!p || !sid) return false;
  const a = String(sid);
  const candidates = [
    p.sellerId,
    p.seller_id,
    p.seller?.id,
    p.seller?.seller_id,
  ].filter(Boolean).map(String);
  return candidates.includes(a);
}

export function getCheckoutTaxRate(taxRateRaw) {
  const r = Number(taxRateRaw);
  if (r > 0) return r / 100;
  return 0.09;
}


export function isSellerFastShipAllowed(sellerId, adminSellers = [], sellerUser = null) {
  try {
    const id = sellerId || 'own';
    const fromAdmin = (adminSellers || []).find((x) => x && (x.id === id || x.phone === id));
    if (fromAdmin) return fromAdmin.fastShipEnabled !== false;
    if (sellerUser && (sellerUser.id === id || id === 'own')) return sellerUser.fastShipEnabled !== false;
  } catch (_) {}
  return true; // پیش‌فرض: فعال
}

export function isProductFastShip(p, adminSellers = [], sellerUser = null) {
  if (!p || !p.fastShip) return false;
  const sid = p.sellerId || p.seller?.id || 'own';
  return isSellerFastShipAllowed(sid, adminSellers, sellerUser);
}
