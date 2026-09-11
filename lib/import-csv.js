/** کمک‌توابع تشخیص منبع و خواندن فیلدهای CSV ایمپورت */

export function detectImportSource(headers) {
  const h = (headers || []).map((x) => String(x || "").toLowerCase());
  const has = (names) => names.some((n) => h.includes(String(n).toLowerCase()));
  if (has(["Handle", "Option1 Name", "Variant Price", "Image Src"]) || has(["handle", "variant price"])) return "shopify";
  if (has(["Regular price", "Attribute 1 name", "Images", "Published"]) || has(["regular price", "attribute 1 name"])) return "woocommerce";
  if (has(["Name", "SKU", "Categories"]) && has(["Regular price", "Sale price"])) return "woocommerce";
  return "unknown";
}

export function normKey(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function pickField(row, candidates) {
  const keys = Object.keys(row || {});
  for (const cand of candidates) {
    const hit = keys.find((k) => normKey(k) === normKey(cand));
    if (hit && String(row[hit] || "").trim() !== "") return String(row[hit]).trim();
  }
  for (const cand of candidates) {
    const hit = keys.find((k) => normKey(k).includes(normKey(cand)));
    if (hit && String(row[hit] || "").trim() !== "") return String(row[hit]).trim();
  }
  return "";
}

export function splitList(val) {
  return String(val || "")
    .split(/[,|،;/]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseCsvText(text) {
  const raw = String(text || "").replace(/^\uFEFF/, "");
  const rows = [];
  let i = 0,
    field = "",
    row = [],
    inQ = false;
  while (i < raw.length) {
    const ch = raw[i];
    if (inQ) {
      if (ch === '"') {
        if (raw[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQ = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inQ = true;
      i++;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && raw[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((c) => String(c).trim() !== "")) rows.push(row);
      row = [];
      i++;
      continue;
    }
    field += ch;
    i++;
  }
  row.push(field);
  if (row.some((c) => String(c).trim() !== "")) rows.push(row);
  if (!rows.length) return { headers: [], records: [] };
  const headers = rows[0].map((h) => String(h || "").trim());
  const records = rows.slice(1).map((r) => {
    const o = {};
    headers.forEach((h, idx) => {
      o[h] = r[idx] != null ? String(r[idx]) : "";
    });
    return o;
  });
  return { headers, records };
}
