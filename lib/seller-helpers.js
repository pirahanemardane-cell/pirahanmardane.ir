/** Small pure helpers — extracted from App (قدم ۶۸) */

export function buildAddressLine(addr) {
  const parts = [];
  if (addr?.street?.trim()) parts.push("خیابان " + addr.street.trim());
  if (addr?.plaque?.trim()) parts.push("پلاک " + addr.plaque.trim());
  if (addr?.unit?.trim()) parts.push("واحد (زنگ) " + addr.unit.trim());
  if (addr?.address?.trim()) parts.push(addr.address.trim());
  return parts.join("، ");
}

/** @param {object} [sellerUser] */
export function sellerCanSell(sellerUser) {
  try {
    const u = sellerUser || {};
    const st = String(u.status || u.shopStatus || u.sellerStatus || "").toLowerCase();
    if (["archived", "suspended", "blocked", "banned", "rejected"].includes(st)) return false;
    if (u.restricted === true || st === "restricted") return false;
    if (u.licenseApproved === true || u.canSell === true) return true;
    if (["approved", "active", "enabled", "verified"].includes(st)) return true;
    return false;
  } catch (_) {
    return false;
  }
}
