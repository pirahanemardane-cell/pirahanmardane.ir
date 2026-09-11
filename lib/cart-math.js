/** محاسبات خالص سبد خرید */

export const TAX_RATE = 0.09;
export const FREE_SHIP_THRESHOLD = 2000000;

export function cartItemKey(id, colorName, size) {
  return `${id}::${colorName || ""}::${size || ""}`;
}

export function calcCartCount(cart) {
  return (Array.isArray(cart) ? cart : []).reduce((s, i) => s + (Number(i?.qty) || 0), 0);
}

export function calcCartSubtotal(cart) {
  return (Array.isArray(cart) ? cart : []).reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 0), 0);
}

export function calcCartListTotal(cart) {
  return (Array.isArray(cart) ? cart : []).reduce((s, i) => {
    const list = i.oldPrice
      ? Math.round(
          typeof i.oldPrice === "number"
            ? i.oldPrice
            : Number(String(i.oldPrice).replace(/[^\d]/g, "")) ||
                i.price / (1 - (i.discount || 0) / 100)
        )
      : i.price;
    return s + list * i.qty;
  }, 0);
}

export function calcCartProductSavings(cart) {
  return (Array.isArray(cart) ? cart : []).reduce((s, i) => {
    if (!i.discount && !i.oldPrice) return s;
    const list = i.oldPrice
      ? typeof i.oldPrice === "number"
        ? i.oldPrice
        : Number(String(i.oldPrice).replace(/[^\d]/g, "")) || 0
      : Math.round(i.price / (1 - (i.discount || 0) / 100));
    return s + Math.max(0, list - i.price) * i.qty;
  }, 0);
}

export function calcCouponDiscount(cartSubtotal, couponApplied) {
  if (!couponApplied) return 0;
  return couponApplied.percent
    ? Math.round((cartSubtotal * couponApplied.percent) / 100)
    : couponApplied.amount || 0;
}

export function calcCartTotals(cart, couponApplied) {
  const cartCount = calcCartCount(cart);
  const cartSubtotal = calcCartSubtotal(cart);
  const cartListTotal = calcCartListTotal(cart);
  const cartProductSavings = calcCartProductSavings(cart);
  const couponDiscount = calcCouponDiscount(cartSubtotal, couponApplied);
  const cartAfterCoupon = Math.max(0, cartSubtotal - couponDiscount);
  const cartTax = Math.round(cartAfterCoupon * TAX_RATE);
  const cartTotal = cartAfterCoupon + cartTax;
  const freeShipRemain = Math.max(0, FREE_SHIP_THRESHOLD - cartSubtotal);
  const freeShipProgress = Math.min(100, Math.round((cartSubtotal / FREE_SHIP_THRESHOLD) * 100));
  return {
    cartCount,
    cartSubtotal,
    cartListTotal,
    cartProductSavings,
    couponDiscount,
    cartAfterCoupon,
    cartTax,
    cartTotal,
    freeShipRemain,
    freeShipProgress,
  };
}

/** افزودن/حذف مقدار در آرایه فیلتر */
export function toggleInList(prev, value) {
  const list = Array.isArray(prev) ? prev : [];
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
}
