/** استخراج ویژگی‌های نمایشی محصول از attributes / نام / دسته */

function getAttr(p, slugOrId) {
  const attrs = p?.attributes || {};
  if (!attrs || typeof attrs !== "object") return null;
  // کلید می‌تواند id یا slug باشد
  for (const [k, v] of Object.entries(attrs)) {
    if (k === slugOrId || k.includes(slugOrId)) {
      if (Array.isArray(v) && v.length) return v[0];
      if (v) return String(v);
    }
  }
  return null;
}

export function deriveFabric(p) {
  const fromAttr = getAttr(p, "fabric") || getAttr(p, "attr-fabric");
  if (fromAttr) return fromAttr;
  const n = p?.name || "";
  if (n.includes("لینن")) return "لینن";
  if (n.includes("نخی") || n.includes("پنبه")) return "پنبه / نخی";
  if (n.includes("چهارخانه") || n.includes("راه راه")) return "نخی ترکیبی";
  return p?.fabric || "پارچه رسمی";
}

export function deriveSleeve(p) {
  const fromAttr = getAttr(p, "sleeve") || getAttr(p, "attr-sleeve");
  if (fromAttr) return fromAttr;
  const c = p?.category || "";
  const n = p?.name || "";
  if (c.includes("آستین کوتاه") || n.includes("آستین کوتاه") || n.includes("لینن")) return "آستین کوتاه";
  return "آستین بلند";
}

export function deriveCollar(p) {
  const fromAttr = getAttr(p, "collar") || getAttr(p, "attr-collar");
  if (fromAttr) return fromAttr;
  const c = p?.category || "";
  if (c.includes("کروات")) return "یقه کروات";
  if (c.includes("رسمی")) return "یقه رسمی";
  return "یقه معمولی";
}

export function deriveFit(p) {
  return getAttr(p, "fit") || getAttr(p, "attr-fit") || null;
}

export function derivePattern(p) {
  return getAttr(p, "pattern") || getAttr(p, "attr-pattern") || null;
}

export function deriveSeason(p) {
  return getAttr(p, "season") || getAttr(p, "attr-season") || null;
}

export function deriveOccasion(p) {
  return getAttr(p, "occasion") || getAttr(p, "attr-occasion") || null;
}
