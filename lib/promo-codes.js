/** تولید کد هدیه / پرومو */

export function generateGiftCode(existingSet = null) {
  const existing = existingSet instanceof Set ? existingSet : new Set(existingSet || []);
  for (let i = 0; i < 30; i++) {
    let digits = "";
    for (let j = 0; j < 8; j++) digits += String(Math.floor(Math.random() * 10));
    const code = "GIFT" + digits;
    if (!existing.has(code)) return code;
  }
  return "GIFT" + String(Date.now()).slice(-8);
}

export function nextRecentSearches(prev, q, max = 8) {
  const t = String(q || "").trim();
  if (!t) return Array.isArray(prev) ? prev : [];
  return [t, ...(prev || []).filter((x) => x !== t)].slice(0, max);
}

export function removeFromRecentSearches(prev, q) {
  return (prev || []).filter((x) => x !== q);
}

export function getUsedPromoCodes() {
  try {
    return JSON.parse(localStorage.getItem("usedPromoCodes") || "[]");
  } catch {
    return [];
  }
}

export function markPromoCodeUsed(code) {
  const c = String(code || "").toUpperCase();
  if (!c) return;
  const used = getUsedPromoCodes();
  if (!used.includes(c)) {
    used.push(c);
    try {
      localStorage.setItem("usedPromoCodes", JSON.stringify(used));
    } catch (_) {}
  }
}
