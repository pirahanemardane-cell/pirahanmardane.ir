/** نرمال‌سازی کلید دسته برای فیلتر PLP */

export function normalizeCategoryKey(raw, categories = []) {
  if (raw == null || raw === "") return null;
  const s = String(raw).trim();
  if (!s || s === "همه" || s === "همه محصولات") return null;
  const found = (categories || []).find(
    (c) =>
      c.name === s ||
      c.productKey === s ||
      c.name.replace("پیراهن ", "") === s.replace("پیراهن ", "")
  );
  if (found) return found.productKey;
  const stripped = s.replace(/^پیراهن\s+/, "");
  if (stripped.includes("لینن") || stripped.includes("آستین بلند")) return "آستین کوتاه";
  if (stripped.includes("آستین کوتاه")) return "آستین کوتاه";
  if (stripped.includes("کروات")) return "کروات";
  if (stripped.includes("رسمی")) return "رسمی";
  return stripped;
}
