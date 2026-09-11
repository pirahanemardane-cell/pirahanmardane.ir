/** کمک‌توابع تشخیص منبع و خواندن فیلدهای CSV ایمپورت */

export function detectImportSource(headers) {
  const h = (headers || []).map((x) => String(x || "").toLowerCase());
  const has = (names) => names.some((n) => h.includes(String(n).toLowerCase()));
  if (has(["Handle", "Option1 Name", "Variant Price", "Image Src"]) || has(["handle", "variant price"])) return "shopify";
  if (has(["Regular price", "Attribute 1 name", "Images", "Published"]) || has(["regular price", "attribute 1 name"])) return "woocommerce";
  if (has(["Name", "SKU", "Categories"]) && has(["Regular price", "Sale price"])) return "woocommerce";
  return "unknown";
}

export function normKey(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function pickField(row, candidates) {
  const keys = Object.keys(row || {});
  for (const cand of candidates) {
    const hit = keys.find((k) => normKey(k) === normKey(cand));
    if (hit && String(row[hit] || "").trim() !== "") return String(row[hit]).trim();
  }
  for (const cand of candidates) {
    const hit = keys.find((k) => normKey(k).includes(normKey(cand)));
    if (hit && String(row[hit] || "").trim() !== "") return String(row[hit]).trim();
  }
  return "";
}

export function splitList(val) {
  return String(val || "")
    .split(/[,|،;/]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
