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

/** آمار min قیمت / max تخفیف هر فروشنده از لیست محصولات */
export function buildSellerPriceMap(products) {
  const map = {};
  (Array.isArray(products) ? products : []).forEach((p) => {
    const id = p.seller?.id || "own";
    if (!map[id]) map[id] = { prices: [], discounts: [] };
    if (typeof p.price === "number") map[id].prices.push(p.price);
    if (typeof p.discount === "number") map[id].discounts.push(p.discount);
  });
  const out = {};
  Object.keys(map).forEach((id) => {
    const prices = map[id].prices;
    const discounts = map[id].discounts;
    out[id] = {
      minPrice: prices.length ? Math.min(...prices) : 999999999,
      maxDiscount: discounts.length ? Math.max(...discounts) : 0,
    };
  });
  return out;
}

export function getSellerMinPrice(sellerPriceMap, s) {
  return sellerPriceMap[s?.id]?.minPrice ?? 999999999;
}

export function getSellerMaxDiscount(sellerPriceMap, s) {
  return sellerPriceMap[s?.id]?.maxDiscount ?? 0;
}

/** فیلتر + سورت لیست فروشندگان */
export function filterAndSortSellers(sellers, opts, sellerPriceMap) {
  const {
    cities = [],
    query = "",
    minRating = 0,
    maxResponse = 0,
    minProducts = 0,
    sort = "smart",
  } = opts || {};
  const citiesSafe = Array.isArray(cities) ? cities : [];
  const querySafe = typeof query === "string" ? query : "";
  const minRatingSafe = Number(minRating) || 0;
  const maxResponseSafe = Number(maxResponse) || 0;
  const minProductsSafe = Number(minProducts) || 0;

  return (Array.isArray(sellers) ? sellers : [])
    .filter((s) => {
      if (citiesSafe.length > 0 && !citiesSafe.includes(s.city)) return false;
      if (minRatingSafe > 0 && (Number(s.rating) || 0) < minRatingSafe) return false;
      if (maxResponseSafe > 0 && parseResponseHours(s.responseTime) > maxResponseSafe) return false;
      if (minProductsSafe > 0 && (Number(s.products) || 0) < minProductsSafe) return false;
      if (querySafe.trim()) {
        const q = querySafe.trim().toLowerCase();
        const hay = `${s.name || ""} ${s.desc || ""} ${s.city || ""} ${(s.badges || []).join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sort === "products") return (b.products || 0) - (a.products || 0);
      if (sort === "price-asc") return getSellerMinPrice(sellerPriceMap, a) - getSellerMinPrice(sellerPriceMap, b);
      if (sort === "price-desc") return getSellerMinPrice(sellerPriceMap, b) - getSellerMinPrice(sellerPriceMap, a);
      if (sort === "discount") return getSellerMaxDiscount(sellerPriceMap, b) - getSellerMaxDiscount(sellerPriceMap, a);
      if (sort === "response") return parseResponseHours(a.responseTime) - parseResponseHours(b.responseTime);
      if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
      return smartScore(b) - smartScore(a);
    });
}

