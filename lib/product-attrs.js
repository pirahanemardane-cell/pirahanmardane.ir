/** استخراج ویژگی‌های نمایشی محصول از نام/دسته */

export function deriveFabric(p) {
  const n = p?.name || "";
  if (n.includes("لینن")) return "لینن";
  if (n.includes("نخی") || n.includes("پنبه")) return "پنبه / نخی";
  if (n.includes("چهارخانه") || n.includes("راه راه")) return "نخی ترکیبی";
  return "پارچه رسمی";
}

export function deriveSleeve(p) {
  const c = p?.category || "";
  const n = p?.name || "";
  if (c.includes("آستین کوتاه") || n.includes("آستین کوتاه") || n.includes("لینن")) return "آستین کوتاه";
  return "آستین بلند";
}

export function deriveCollar(p) {
  const c = p?.category || "";
  if (c.includes("کروات")) return "یقه کروات";
  if (c.includes("رسمی")) return "یقه رسمی";
  return "یقه معمولی";
}
