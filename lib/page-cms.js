/** کمک‌توابع CMS صفحات ثابت */

export function getPageCmsFromMap(map, pageKey) {
  return (map && map[pageKey]) || null;
}

export function getShopSeoBodyFrom(map, adminSettings) {
  const cmsBody = (getPageCmsFromMap(map, "shop") || {}).body;
  if (cmsBody != null && String(cmsBody).trim() !== "") return cmsBody;
  return adminSettings?.shopSeoHtml || adminSettings?.shopSeoText || "";
}

export function mergePageCmsEntry(prevEntry, patch) {
  return { ...(prevEntry || {}), ...(patch || {}), updatedAt: new Date().toISOString() };
}

export function plainTextFromHtml(html, htmlToPlainFn, maxLen = 500) {
  const plain =
    typeof htmlToPlainFn === "function"
      ? htmlToPlainFn(html)
      : String(html || "").replace(/<[^>]+>/g, " ");
  return plain.replace(/\s+/g, " ").trim().slice(0, maxLen);
}

export function mergeSeoConfig(defaultSeo, adminSeo) {
  return { ...(defaultSeo || {}), ...(adminSeo || {}) };
}
