/** shipping / checkout pure helpers */

const DYNAMIC_COD_ESTIMATE = 35000;

export function buildShippingOptions(adminShippingMethods = [], allowedIds = null) {
  const methods = adminShippingMethods || [];
  const allowed =
    allowedIds == null
      ? null
      : new Set(Array.isArray(allowedIds) ? allowedIds : []);
  return methods
    .filter((m) => m && m.enabled !== false && (allowed == null || allowed.has(m.id)))
    .map((m) => {
      const isDynamic = m.priceMode === "dynamic_cod";
      const liveEstimate = isDynamic ? DYNAMIC_COD_ESTIMATE : Number(m.baseCost) || 0;
      return {
        id: m.id,
        label: m.name,
        desc: isDynamic ? "قیمت همین لحظه (تقریبی) · تسویه در مقصد" : m.eta || "",
        cost: isDynamic ? liveEstimate : Number(m.baseCost) || 0,
        eta: m.eta || "",
        priceMode: m.priceMode || "fixed",
        note: m.note || "",
        disabled: false,
        chargeAtCheckout: !isDynamic,
      };
    });
}

export function getCheckoutShippingCostFromOptions(opts, methodId) {
  const list = opts || [];
  if (!list.length) return 0;
  const m = list.find((o) => o.id === methodId) || list[0];
  if (!m) return 0;
  if (m.priceMode === "dynamic_cod") return 0;
  return Number(m.cost) || 0;
}

export function computeCheckoutTotals({
  subtotal = 0,
  discount = 0,
  productSavings = 0,
  shipping = 0,
  taxRate = 0,
} = {}) {
  const sub = Number(subtotal) || 0;
  const disc = Number(discount) || 0;
  const afterCoupon = Math.max(0, sub - disc);
  const ship = Number(shipping) || 0;
  const rate = Number(taxRate) || 0;
  const tax = Math.round(afterCoupon * rate);
  const payable = afterCoupon + ship + tax;
  return {
    subtotal: sub,
    discount: disc,
    productSavings: Number(productSavings) || 0,
    shipping: ship,
    tax,
    taxRate: rate,
    payable,
    afterCoupon,
  };
}
