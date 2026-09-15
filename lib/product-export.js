/** خروجی CSV/JSON بک‌آپ محصول */

export const PRODUCT_BACKUP_SITE = "pirahan-mardane";
export const PRODUCT_BACKUP_MAGIC = "PM-PRODUCT-BACKUP-v1";

export function productBackupPayload(list, meta = {}) {
  return {
    magic: PRODUCT_BACKUP_MAGIC,
    site: PRODUCT_BACKUP_SITE,
    version: 1,
    exportedAt: new Date().toISOString(),
    exportedAtFa: new Date().toLocaleString("fa-IR"),
    source: meta.source || "unknown",
    sellerId: meta.sellerId || null,
    sellerName: meta.sellerName || null,
    count: (list || []).length,
    products: (list || []).map((p) => ({ ...p })),
  };
}

function escCsv(v) {
  if (v == null) return "";
  let s = typeof v === "object" ? JSON.stringify(v) : String(v);
  if (s.includes('"') || s.includes(",") || s.includes("\n") || s.includes("\r")) {
    s = '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export function productsToCsv(list) {
  const rows = list || [];
  const headers = [
    "id", "name", "sku", "category", "categories", "tags", "price", "oldPrice", "discount",
    "stock", "reorderPoint", "status", "sellerId", "sellerName", "sizes", "colors", "rating",
    "reviews", "desc", "fit", "material", "createdAt", "updatedAt",
  ];
  const lines = [headers.join(",")];
  rows.forEach((p) => {
    const seller = p.seller || {};
    lines.push(
      [
        p.id,
        p.name,
        p.sku || p.code || "",
        p.category || "",
        Array.isArray(p.categories) ? p.categories.join("|") : p.categories || "",
        Array.isArray(p.tags) ? p.tags.join("|") : p.tags || "",
        p.price ?? "",
        p.oldPrice ?? "",
        p.discount ?? "",
        p.stock ?? "",
        p.reorderPoint ?? "",
        p.status || "",
        p.sellerId || seller.id || "",
        p.sellerName || seller.name || "",
        Array.isArray(p.sizes) ? p.sizes.join("|") : p.sizes || "",
        Array.isArray(p.colors) ? p.colors.map((c) => (c && c.name ? c.name : c)).join("|") : "",
        p.rating ?? "",
        p.reviews ?? "",
        p.desc || p.description || "",
        p.fit || "",
        p.material || p.fabric || "",
        p.createdAt || "",
        p.updatedAt || "",
      ]
        .map(escCsv)
        .join(",")
    );
  });
  return "\uFEFF" + lines.join("\n");
}

export function productsToWooCsv(list) {
  const rows = list || [];
  const headers = [
    "Name", "SKU", "Description", "Short description", "Regular price", "Sale price", "Stock",
    "Published", "Categories", "Tags", "Brands", "Images",
    "Attribute 1 name", "Attribute 1 value(s)", "Attribute 2 name", "Attribute 2 value(s)",
    "Attribute 3 name", "Attribute 3 value(s)",
  ];
  const lines = [headers.join(",")];
  rows.forEach((p) => {
    const sizes = Array.isArray(p.sizes)
      ? p.sizes.map((x) => (x && x.name ? x.name : x)).filter(Boolean).join(", ")
      : p.sizes || "";
    const colors = Array.isArray(p.colors)
      ? p.colors.map((c) => (c && c.name ? c.name : c)).filter(Boolean).join(", ")
      : p.colors || "";
    const imgs =
      Array.isArray(p.images) && p.images.length
        ? p.images.join(", ")
        : p.image || p.cover_image || (p.colors && p.colors[0] && p.colors[0].image) || "";
    const price = Number(p.price) || 0;
    let oldPrice = 0;
    if (p.oldPrice != null) oldPrice = Number(String(p.oldPrice).replace(/[^\d.]/g, "")) || 0;
    const regular = oldPrice > price && price > 0 ? oldPrice : price;
    const sale = oldPrice > price && price > 0 ? price : "";
    const cats =
      Array.isArray(p.categories) && p.categories.length ? p.categories.join(", ") : p.category || "";
    const tags = Array.isArray(p.tags) ? p.tags.join(", ") : p.tags || "";
    const published = ["active", "approved", "published"].includes(String(p.status || "").toLowerCase())
      ? "1"
      : "0";
    lines.push(
      [
        p.name || "",
        p.sku || p.productCode || p.code || "",
        p.desc || p.description || "",
        String(p.desc || p.description || "").slice(0, 120),
        regular || "",
        sale,
        p.stock ?? "",
        published,
        cats,
        tags,
        p.brand || p.brandName || "",
        imgs,
        sizes ? "سایز" : "",
        sizes,
        colors ? "رنگ" : "",
        colors,
        "",
        "",
      ]
        .map(escCsv)
        .join(",")
    );
  });
  return "\uFEFF" + lines.join("\n");
}

export function validateProductBackup(data, opts = {}) {
  if (!data || typeof data !== "object") return { ok: false, error: "فایل نامعتبر است" };
  if (data.magic !== PRODUCT_BACKUP_MAGIC || data.site !== PRODUCT_BACKUP_SITE) {
    return {
      ok: false,
      error: "این فایل بک‌آپ پیراهن مردانه نیست. فقط فایل خروجی همین سایت قابل بازگردانی است.",
    };
  }
  if (Number(data.version) !== 1) return { ok: false, error: "نسخه بک‌آپ پشتیبانی نمی‌شود" };
  const list = Array.isArray(data.products) ? data.products : null;
  if (!list || !list.length) return { ok: false, error: "فایل بک‌آپ خالی است یا محصولات ندارد" };
  if (opts.requireSource && data.source !== opts.requireSource) {
    return {
      ok: false,
      error:
        opts.requireSource === "seller"
          ? "این بک‌آپ مربوط به فروشنده نیست"
          : "این بک‌آپ مربوط به ادمین نیست",
    };
  }
  if (opts.sellerId != null && data.source === "seller" && data.sellerId != null) {
    const sid = String(opts.sellerId);
    if (String(data.sellerId) !== sid && String(data.sellerId) !== "own") {
      if (String(data.sellerId) !== String(opts.sellerPhone || "")) {
        return {
          ok: false,
          error: "این بک‌آپ متعلق به فروشگاه دیگری است و قابل بازگردانی در پنل شما نیست.",
        };
      }
    }
  }
  return { ok: true, list, meta: data };
}
