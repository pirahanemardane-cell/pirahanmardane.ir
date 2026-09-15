/** نرمال‌سازی path URL (بدون query، بدون اسلش انتهایی) */
export function normalizePath(u) {
  try {
    return decodeURIComponent(String(u || "").split("?")[0]).replace(/\/+$/, "") || "/";
  } catch (_) {
    return String(u || "").split("?")[0].replace(/\/+$/, "") || "/";
  }
}
