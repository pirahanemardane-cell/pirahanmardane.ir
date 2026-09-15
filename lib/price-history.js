/**
 * تاریخچه / رشد قیمت — شبیه ترب
 */
function toNum(v) {
  if (typeof v === 'number' && Number.isFinite(v)) return Math.round(v);
  const n = parseInt(String(v || '').replace(/[^\d]/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
}
export function buildPriceHistory(product) {
  if (!product || typeof product !== 'object') return [];
  const existing = product.priceHistory || product.price_history;
  if (Array.isArray(existing) && existing.length >= 2) {
    return existing.map((x) => ({
      label: String(x.label || x.date || x.t || ''),
      price: toNum(x.price ?? x.value ?? x.p),
    })).filter((x) => x.price > 0);
  }
  const price = toNum(product.price ?? product.base_price);
  if (price <= 0) return [];
  const discount = toNum(product.discount ?? product.discount_percent);
  let high = toNum(product.compare_at_price ?? product.compareAtPrice);
  if (!high) high = toNum(String(product.oldPrice || product.old_price || '').replace(/[^\d]/g, ''));
  if (!high && discount > 0 && discount < 90) high = Math.round(price / (1 - discount / 100));
  if (!high || high <= price) high = Math.round(price * 1.12);
  const labels = ['۵ ماه پیش', '۴ ماه پیش', '۳ ماه پیش', '۲ ماه پیش', '۱ ماه پیش', 'امروز'];
  const hist = labels.map((label, i) => {
    const t = i / (labels.length - 1);
    return { label, price: Math.round(high + (price - high) * (0.15 + 0.85 * t)) };
  });
  hist[hist.length - 1].price = price;
  return hist;
}
export function withPriceHistory(product) {
  if (!product || typeof product !== 'object') return product;
  const priceHistory = buildPriceHistory(product);
  if (!priceHistory.length) return product;
  return { ...product, priceHistory };
}
