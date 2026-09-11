/** تطبیق نام رنگ/سایز/برند/دسته با کاتالوگ — pure */

export function normKey(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function matchCatalogColor(name, colors) {
  const n = normKey(name);
  return (colors || []).find(
    (c) =>
      c.active !== false &&
      (normKey(c.name) === n ||
        normKey(c.name).includes(n) ||
        n.includes(normKey(c.name)))
  );
}

export function matchCatalogSize(name, sizes) {
  const n = normKey(name);
  if (!n) return null;
  const list = (sizes || []).filter((s) => s.active !== false);
  let hit = list.find((s) => normKey(s.name) === n);
  if (hit) return hit;
  const aliases = { "2xl": "xxl", xxl: "2xl", xxx: "xxxl", "3xl": "xxxl", xs: "xs", xl: "xl" };
  const alt = aliases[n];
  if (alt) hit = list.find((s) => normKey(s.name) === alt);
  if (hit) return hit;
  return list.find((s) => normKey(s.name).includes(n) || n.includes(normKey(s.name))) || null;
}

export function matchCatalogBrand(name, brands) {
  const n = normKey(name);
  if (!n) return null;
  return (brands || []).find(
    (b) =>
      b.active !== false &&
      (normKey(b.name) === n ||
        normKey(b.name).includes(n) ||
        n.includes(normKey(b.name)))
  );
}

export function matchCategory(name, categories) {
  const n = normKey(name);
  const cats = (categories || []).filter((c) => c.active !== false);
  const hit = cats.find(
    (c) =>
      normKey(c.name) === n ||
      normKey(c.name).includes(n) ||
      n.includes(normKey(c.name))
  );
  return hit ? hit.name : null;
}
