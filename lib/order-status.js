/** رنگ و برچسب وضعیت سفارش */

export function orderStatusColor(s) {
  if (s === "delivered") return "bg-emerald-100 text-emerald-700 bg-emerald-900/40 text-emerald-300";
  if (s === "shipped") return "bg-blue-100 text-blue-700 bg-blue-900/40 text-blue-300";
  if (s === "paid") return "bg-emerald-100 text-emerald-800 bg-emerald-900/40 text-emerald-300";
  if (s === "preparing" || s === "processing") return "bg-amber-100 text-amber-700 bg-amber-900/40 text-amber-300";
  if (s === "pending" || s === "pending_payment") return "bg-orange-100 text-orange-700 bg-orange-900/40 text-orange-300";
  if (s === "cancelled" || s === "returned" || s === "refunded") return "bg-red-100 text-red-700 bg-red-900/40 text-red-300";
  return "bg-primary-100 text-primary-700 bg-primary-800 text-white";
}

export const ORDER_STATUS_LABELS = {
  pending: "در انتظار",
  pending_payment: "در انتظار پرداخت",
  paid: "پرداخت‌شده",
  preparing: "آماده‌سازی",
  processing: "در حال پردازش",
  shipped: "ارسال‌شده",
  delivered: "تحویل‌شده",
  cancelled: "لغوشده",
  returned: "مرجوعی",
  refunded: "بازپرداخت",
};

export function orderStatusLabel(s) {
  return ORDER_STATUS_LABELS[s] || String(s || "");
}

export function unreadNotificationsCount(notifications) {
  return (notifications || []).filter((n) => !n.read).length;
}
