/** پیشوند کد محصول از نام فروشگاه */

export function shopCodePrefix(shopName) {
  const raw = String(shopName || "SHOP").replace(/\s+/g, "");
  let letters = raw.replace(/[^\u0600-\u06FFa-zA-Z0-9]/g, "");
  if (letters.length < 4) letters = (letters + "XXXX").slice(0, 4);
  else letters = letters.slice(0, 4);
  return letters.toUpperCase();
}

import { onlyDigits, toEnDigits } from "@/lib/format-digits";

export function normProductCode(v) {
  return onlyDigits(toEnDigits(String(v ?? "")));
}

export function findProductByCode(pools, rawCode) {
  const want = normProductCode(rawCode);
  if (!want) return null;
  const list = pools || [];
  return (
    list.find((x) => {
      const c = normProductCode(x?.productCode || x?.product_code || "");
      if (c && c === want) return true;
      if (c && (c.endsWith(want) || want.endsWith(c)) && Math.min(c.length, want.length) >= 8) return true;
      if (String(x?.id) === String(rawCode)) return true;
      return false;
    }) || null
  );
}
