/** پیشوند کد محصول از نام فروشگاه */

export function shopCodePrefix(shopName) {
  const raw = String(shopName || "SHOP").replace(/\s+/g, "");
  let letters = raw.replace(/[^\u0600-\u06FFa-zA-Z0-9]/g, "");
  if (letters.length < 4) letters = (letters + "XXXX").slice(0, 4);
  else letters = letters.slice(0, 4);
  return letters.toUpperCase();
}
