/** نرمال‌سازی آیتم‌های breadcrumb */

export function normalizeBreadcrumbs(items) {
  const list = (Array.isArray(items) ? items : []).filter(Boolean);
  if (!list.length) return list;
  return list.map((it, i) => ({
    ...it,
    current: i === list.length - 1,
  }));
}
