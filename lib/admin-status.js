/** رنگ و برچسب وضعیت پنل ادمین / فروشنده — pure */

export function adminStatusBadge(status) {
  const map = {
    pending: "bg-amber-100 text-amber-700 bg-amber-900/40 text-amber-300",
    approved: "bg-emerald-100 text-emerald-700 bg-emerald-900/40 text-emerald-300",
    active: "bg-emerald-100 text-emerald-700 bg-emerald-900/40 text-emerald-300",
    rejected: "bg-red-100 text-red-700 bg-red-900/40 text-red-300",
    blocked: "bg-red-100 text-red-700 bg-red-900/40 text-red-300",
    inactive: "bg-primary-100 text-primary-600 bg-primary-800 text-white/70",
    expired: "bg-primary-100 text-primary-500 bg-primary-800 !text-white",
    open: "bg-orange-100 text-orange-700 bg-orange-900/40 text-orange-300",
    closed: "bg-primary-100 text-primary-600 bg-primary-800 text-white/70",
    shipped: "bg-blue-100 text-blue-700 bg-blue-900/40 text-blue-300",
    preparing: "bg-amber-100 text-amber-700 bg-amber-900/40 text-amber-300",
    delivered: "bg-emerald-100 text-emerald-700 bg-emerald-900/40 text-emerald-300",
    returned: "bg-red-100 text-red-700 bg-red-900/40 text-red-300",
    cancelled: "bg-red-100 text-red-700 bg-red-900/40 text-red-300",
    archived: "bg-primary-200 text-primary-600 bg-primary-800 text-white/70",
  };
  return map[status] || "bg-primary-100 text-primary-700 bg-primary-800 text-white";
}

export function adminStatusLabel(s) {
  return (
    {
      pending: "در انتظار",
      approved: "تأیید‌شده",
      active: "فعال",
      rejected: "رد‌شده",
      blocked: "مسدود",
      inactive: "غیرفعال",
      archived: "آرشیو شده",
      expired: "منقضی",
      open: "باز",
      closed: "بسته‌شده",
      shipped: "ارسال‌شده",
      preparing: "آماده‌سازی",
      delivered: "تحویل‌شده",
      returned: "مرجوعی",
      cancelled: "لغو",
      new: "جدید",
    }[s] || s
  );
}

export function sellerOrderStatusColor(s) {
  if (s === "delivered") return "bg-emerald-100 text-emerald-700 bg-emerald-900/40 text-emerald-300";
  if (s === "shipped") return "bg-blue-100 text-blue-700 bg-blue-900/40 text-blue-300";
  if (s === "preparing") return "bg-amber-100 text-amber-700 bg-amber-900/40 text-amber-300";
  if (s === "new") return "bg-orange-100 text-orange-700 bg-orange-900/40 text-orange-300";
  if (s === "cancelled" || s === "returned") return "bg-red-100 text-red-700 bg-red-900/40 text-red-300";
  return "bg-primary-100 text-primary-700 bg-primary-800 text-white";
}
