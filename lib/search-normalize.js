/** نرمال‌سازی و گسترش عبارت جستجو — استخراج از App.jsx */

export function normalizeSearch(s) {
  return String(s || "")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u064B-\u065F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export const SEARCH_SYNONYMS = {
  کتان: "لینن",
  linen: "لینن",
  "نیم آستین": "آستین کوتاه",
  "نیم‌آستین": "آستین کوتاه",
  boss: "باس",
  hugo: "باس",
  polo: "پولو",
  tommy: "تامی",
  lacoste: "لاکوست",
  formal: "رسمی",
  shirt: "پیراهن",
  white: "سفید",
  black: "مشکی",
};

export function expandQuery(q) {
  let t = normalizeSearch(q);
  Object.entries(SEARCH_SYNONYMS).forEach(([k, v]) => {
    if (t === normalizeSearch(k) || t.includes(normalizeSearch(k))) {
      t = `${t} ${normalizeSearch(v)}`;
    }
  });
  return t;
}

export function scoreProduct(p, qRaw) {
  if (!qRaw) return 1;
  const q = expandQuery(qRaw);
  const tokens = q.split(" ").filter(Boolean);
  const name = normalizeSearch(p.name);
  const cat = normalizeSearch(p.category);
  const seller = normalizeSearch(p.seller?.name);
  const colors = (p.colors || []).map((c) => normalizeSearch(c.name)).join(" ");
  let score = 0;
  tokens.forEach((t) => {
    if (name === t) score += 100;
    else if (name.startsWith(t)) score += 50;
    else if (name.includes(t)) score += 30;
    if (cat.includes(t)) score += 25;
    if (seller.includes(t)) score += 15;
    if (colors.includes(t)) score += 12;
    if (normalizeSearch(`پیراهن ${p.category}`).includes(t)) score += 20;
  });
  if (p.discount) score += 2;
  if (p.rating >= 5) score += 2;
  if (p.amazing) score += 1;
  return score;
}


/** پیشنهاد اصلاح عبارت جستجو */
export function didYouMean(searchQuery, filteredProducts, products, trendQueries = []) {
  const norm = normalizeSearch;
  const q = norm(searchQuery);
  if (!q || (filteredProducts && filteredProducts.length > 0)) return null;
  const pool = [...(trendQueries || []), ...(products || []).map(p => p.name), ...(products || []).map(p => p.category)];
  let best = null, bestScore = 0;
  pool.forEach(cand => {
    const c = norm(cand);
    if (!c) return;
    let s = 0;
    if (c.includes(q) || q.includes(c)) s = 10;
    const qa = [...q], ca = [...c];
    const setc = new Set(ca);
    s += qa.filter(ch => setc.has(ch)).length * 0.5;
    if (s > bestScore) { bestScore = s; best = cand; }
  });
  return bestScore >= 4 ? best : null;
}
