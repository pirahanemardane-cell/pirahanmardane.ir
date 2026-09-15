/** منطق خالص واریانت رنگ/سایز/ویژگی */

export function normalizeAttrMap(attrs) {
  const out = {};
  Object.keys(attrs || {})
    .sort()
    .forEach((k) => {
      const v = attrs[k];
      if (v == null || v === "") return;
      out[k] = Array.isArray(v) ? String(v[0] ?? "") : String(v);
    });
  return out;
}

export function attrsKeyPart(attrs) {
  const n = normalizeAttrMap(attrs);
  return Object.keys(n)
    .map((k) => `${k}:${n[k]}`)
    .join("|");
}

export function variantKey(color, size, attrs) {
  return `${String(color || "").trim()}||${String(size || "").trim()}||${attrsKeyPart(attrs)}`;
}

export function attrsMatch(a, b) {
  const na = normalizeAttrMap(a);
  const nb = normalizeAttrMap(b);
  const keys = Array.from(new Set([...Object.keys(na), ...Object.keys(nb)]));
  if (!keys.length) return true;
  return keys.every((k) => String(na[k] || "") === String(nb[k] || ""));
}

export function getAttrDimensions(attributes, catalogAttrs) {
  const dims = [];
  const cat = catalogAttrs || [];
  cat
    .filter((a) => a && a.active !== false)
    .forEach((a) => {
      const raw = (attributes || {})[a.id];
      let opts = [];
      if (Array.isArray(raw)) opts = raw.map(String).filter(Boolean);
      else if (raw != null && raw !== "") opts = [String(raw)];
      if (opts.length) dims.push({ id: a.id, name: a.name, options: opts });
    });
  return dims;
}

export function cartesianAttrCombos(dims) {
  if (!dims.length) return [{}];
  return dims.reduce((acc, dim) => {
    const next = [];
    acc.forEach((prev) => {
      (dim.options || []).forEach((opt) => {
        next.push({ ...prev, [dim.id]: opt });
      });
    });
    return next;
  }, [{}]);
}

export function findProductVariant(prod, colorName, size, attrs) {
  const list = prod?.variants;
  if (!Array.isArray(list) || !list.length) return null;
  const c = String(colorName || "").trim();
  const s = String(size || "").trim();
  const want = normalizeAttrMap(attrs);
  let hit = list.find(
    (v) =>
      String(v.color || "") === c &&
      String(v.size || "") === s &&
      attrsMatch(v.attrs || {}, want)
  );
  if (hit) return hit;
  hit = list.find(
    (v) =>
      String(v.color || "") === c &&
      String(v.size || "") === s &&
      (!v.attrs || !Object.keys(v.attrs || {}).length)
  );
  return hit || null;
}

export function getVariantPrice(prod, colorName, size, attrs) {
  const v = findProductVariant(prod, colorName, size, attrs);
  if (v && v.price != null && v.price !== "") return Number(v.price) || 0;
  return Number(prod?.price) || 0;
}

export function getVariantStock(prod, colorName, size, attrs) {
  const v = findProductVariant(prod, colorName, size, attrs);
  if (v && v.stock != null && v.stock !== "") return Number(v.stock) || 0;
  if (prod?.stockLeft != null) return Number(prod.stockLeft) || 0;
  return Number(prod?.stock) || 0;
}

export function buildVariantMatrix(colorNames, sizes, attrDims, basePrice, baseStock, existing = []) {
  const cols = (colorNames || []).filter(Boolean);
  const szs = (sizes || []).filter(Boolean);
  let combos = cartesianAttrCombos(attrDims || []);
  const maxRows = 120;
  const total = Math.max(1, cols.length) * Math.max(1, szs.length) * combos.length;
  if (total > maxRows) {
    combos = combos.slice(0, Math.max(1, Math.floor(maxRows / Math.max(1, cols.length * szs.length))));
  }
  const map = {};
  (existing || []).forEach((v) => {
    map[variantKey(v.color, v.size, v.attrs)] = v;
  });
  const out = [];
  (cols.length ? cols : [""]).forEach((color) => {
    (szs.length ? szs : [""]).forEach((size) => {
      combos.forEach((attrs) => {
        const k = variantKey(color, size, attrs);
        const prev = map[k];
        out.push({
          id: prev?.id || `var-${k}`,
          color,
          size,
          attrs: { ...attrs },
          price: prev?.price != null && prev.price !== "" ? Number(prev.price) : Number(basePrice) || 0,
          stock: prev?.stock != null && prev.stock !== "" ? Number(prev.stock) : Number(baseStock) || 0,
          note: prev?.note || "",
          image: prev?.image || "",
        });
      });
    });
  });
  return out;
}
