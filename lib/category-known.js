/** تشخیص شناخته‌بودن برچسب/اسلاگ دسته */

export function isKnownCategory(catLabel, catSlugRaw, categories, adminCategories, pools, slugifyFa) {
  if (!catLabel) return false;
  const norm = (x) => (typeof slugifyFa === "function" ? slugifyFa(String(x || "")) : String(x || ""));
  const target = norm(catLabel);
  if (!target || target === "مورد") return false;

  const fromUi = (Array.isArray(categories) ? categories : []).some((c) => {
    const n = c && (c.name || c.label || c.title);
    return n && (norm(n) === target || String(n).trim() === catLabel);
  });
  if (fromUi) return true;

  const fromAdmin = (Array.isArray(adminCategories) ? adminCategories : []).some((c) => {
    const n = c && (c.name || c.label || c.title || c.slug);
    return n && (norm(n) === target || String(c.slug || "") === catSlugRaw);
  });
  if (fromAdmin) return true;

  const list = Array.isArray(pools) ? pools : [];
  return list.some((p) => {
    const c1 = p && (p.category || "");
    const cats = Array.isArray(p?.categories) ? p.categories : [];
    if (c1 && (norm(c1) === target || String(c1).includes(catLabel))) return true;
    return cats.some((c) => norm(c) === target || String(c) === catLabel);
  });
}
