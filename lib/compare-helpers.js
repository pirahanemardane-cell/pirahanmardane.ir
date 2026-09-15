/** منطق خالص مقایسه محصول */

import { COMPARE_MAX } from "@/lib/app-constants";

export function isInCompareList(list, productId) {
  return (Array.isArray(list) ? list : []).some((i) => i.id === productId);
}

export function removeFromCompareList(list, productId) {
  return (Array.isArray(list) ? list : []).filter((i) => i.id !== productId);
}

export function canAddToCompare(list, max = COMPARE_MAX) {
  return (Array.isArray(list) ? list.length : 0) < max;
}

export function replaceInCompareList(list, oldId, newProduct) {
  const prev = Array.isArray(list) ? list : [];
  const has = prev.some((p) => p.id === oldId);
  if (has) return prev.map((p) => (p.id === oldId ? newProduct : p));
  return [...prev.slice(0, -1), newProduct];
}
