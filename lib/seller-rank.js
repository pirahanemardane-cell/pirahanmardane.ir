/** امتیاز و رتبه‌بندی فروشنده */

export function parseResponseHours(rt) {
  if (!rt) return 99;
  const m = String(rt).match(/(\d+)/);
  return m ? Number(m[1]) : 99;
}

export function smartScore(s) {
  return (
    (Number(s.rating) || 0) * Math.log10((Number(s.ratingCount) || 0) + 1) +
    Math.log10((Number(s.products) || 0) + 1) * 0.5
  );
}

export function rankSellers(list, tab) {
  const arr = [...(list || [])];
  if (tab === "sales") return arr.sort((a, b) => (b.products || 0) - (a.products || 0)).slice(0, 20);
  if (tab === "new")
    return arr
      .sort((a, b) => String(b.joinDate || "").localeCompare(String(a.joinDate || ""), "fa"))
      .slice(0, 20);
  return arr.sort((a, b) => smartScore(b) - smartScore(a)).slice(0, 20);
}
