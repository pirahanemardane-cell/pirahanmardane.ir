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

/** taken: Set از کدهای موجود؛ productId برای حذف خود محصول از مقایسه */
export function generateProductCodeFromTaken(shopName, productId, takenSet) {
  const prefix = shopCodePrefix(shopName || "SHOP");
  const taken = takenSet instanceof Set ? takenSet : new Set(takenSet || []);
  let code = "";
  for (let attempt = 0; attempt < 80; attempt++) {
    const now = Date.now() + attempt * 97 + Math.floor(Math.random() * 999);
    let digits = String(now % 1000000000).padStart(9, "0");
    if (digits.length > 9) digits = digits.slice(-9);
    code = `${prefix}${digits}`;
    if (!taken.has(code)) return code;
  }
  code = `${prefix}${String(Date.now()).slice(-9)}`;
  while (taken.has(code)) {
    code = `${prefix}${String(Math.floor(Math.random() * 1e9)).padStart(9, "0")}`;
  }
  return code;
}

export function getProductPublicPathByCode(p, fallbackPathBuilder) {
  try {
    const code = p?.productCode || p?.product_code || "";
    if (code) return "/product/" + encodeURIComponent(String(code));
  } catch (_) {}
  if (typeof fallbackPathBuilder === "function") return fallbackPathBuilder(p);
  return "/";
}

export function getProductPublicUrlFromPath(path, originFallback = "https://pirahanemardane.ir") {
  try {
    const origin = typeof window !== "undefined" ? window.location.origin : originFallback;
    return origin + path;
  } catch (_) {
    return originFallback + path;
  }
}

/** نامک محصول: نام_محصول / نام_فروشگاه — slugifyFa از بیرون پاس داده شود */
export function productSlugFromNameAndShop(productName, shopName, slugifyFa) {
  const a = typeof slugifyFa === "function" ? slugifyFa(productName) : String(productName || "");
  const b = typeof slugifyFa === "function" ? slugifyFa(shopName || "") : String(shopName || "");
  if (a && b && b !== "مورد") return `${a}/${b}`;
  return a || "محصول";
}


/** taken codes از چند لیست محصول */
export function collectTakenProductCodes(pools, excludeProductId) {
  const taken = new Set();
  for (const list of pools || []) {
    for (const p of list || []) {
      if (!p || !p.productCode) continue;
      if (excludeProductId != null && String(p.id) === String(excludeProductId)) continue;
      taken.add(String(p.productCode));
    }
  }
  return taken;
}

/** تولید کد با جمع‌آوری taken از pools */
export function generateProductCodeFromPools(shopName, productId, pools) {
  const taken = collectTakenProductCodes(pools, productId);
  return generateProductCodeFromTaken(shopName || "SHOP", productId, taken);
}

/** اگر productCode نباشد، یکی می‌سازد (pure — sellerUser.shopName را به‌عنوان arg بده) */
export function ensureProductCode(p, sellerKey, sellerShopName, pools) {
  if (p?.productCode) return p.productCode;
  const shop =
    p?.seller?.name ||
    p?.shopName ||
    sellerShopName ||
    sellerKey ||
    "SHOP";
  const key = sellerKey || p?.sellerId || p?.seller?.id || "OWN";
  return generateProductCodeFromPools(shop, p?.id, pools);
}
