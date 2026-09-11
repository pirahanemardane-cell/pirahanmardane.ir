/** ادغام override سئوی صفحه با defaults */

export function resolvePageSeo(pageSeoMap, ctx) {
  const ctx0 = ctx || {};
  const key = ctx0.key;
  const ov = (pageSeoMap && key && pageSeoMap[key]) || {};
  const defaults = ctx0.defaults || {};
  return {
    title: ov.title != null && ov.title !== "" ? ov.title : defaults.title,
    description: ov.description != null && ov.description !== "" ? ov.description : defaults.description,
    slug: ov.slug != null && ov.slug !== "" ? ov.slug : defaults.slug,
    indexable: ov.indexable != null ? !!ov.indexable : !!defaults.indexable,
    focusKeywords: ov.focusKeywords != null ? ov.focusKeywords : defaults.focusKeywords || "",
    canonical: ov.canonical != null ? ov.canonical : defaults.canonical || "",
    ogImage: ov.ogImage != null ? ov.ogImage : defaults.ogImage || "",
    faq: Array.isArray(ov.faq) ? ov.faq : defaults.faq || [],
    hasOverride: !!(pageSeoMap && key && pageSeoMap[key]),
  };
}
