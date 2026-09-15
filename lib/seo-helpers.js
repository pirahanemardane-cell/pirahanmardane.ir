/** کمک‌توابع SEO سمت کلاینت */

export function buildSeo404Entry(path, referrer) {
  return {
    id: "404-" + Date.now(),
    path:
      path ||
      (typeof window !== "undefined" ? window.location.pathname + window.location.search : ""),
    referrer:
      referrer || (typeof document !== "undefined" ? document.referrer : ""),
    at: new Date().toISOString(),
    atFa: new Date().toLocaleString("fa-IR"),
  };
}

export function applyImageSeoAltTemplate(template, { name = "", brand = "" } = {}) {
  const t = String(template || "{name} | {brand} | پیراهن مردانه");
  return t.replace(/\{name\}/g, name || "").replace(/\{brand\}/g, brand || "").trim();
}
