/** انتخاب رنگ/سایز کارت محصول */

export function safeColorIdx(map, id) {
  const m = map && typeof map === "object" ? map : {};
  return Number(m[id]) || 0;
}

export function safeSizeSel(map, id, fallback = "") {
  const m = map && typeof map === "object" ? map : {};
  return m[id] || fallback;
}

export function safeCardQty(map, id, fallback = 1) {
  const m = map && typeof map === "object" ? map : {};
  const n = Number(m[id]);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
