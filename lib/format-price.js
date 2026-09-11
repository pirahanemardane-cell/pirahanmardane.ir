/** قالب قیمت فارسی */

export function formatPrice(n) {
  return (Number(n) || 0).toLocaleString("fa-IR");
}

export const PLP_SORT_LABELS = {
  newest: "جدیدترین",
  popular: "پرفروش",
  "price-asc": "ارزان‌ترین",
  "price-desc": "گران‌ترین",
  discount: "بیشترین تخفیف",
  rating: "امتیاز",
};

export function plpSortLabel(sortKey) {
  return PLP_SORT_LABELS[sortKey] || "مرتب‌سازی";
}

export function scrollCarousel(track, dir) {
  if (!track) return;
  const step = Math.max(track.clientWidth * 0.7, 200);
  const rtl = getComputedStyle(track).direction === "rtl";
  track.scrollBy({ left: (rtl ? -dir : dir) * step, behavior: "smooth" });
}
