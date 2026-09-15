/** نگاشت ردیف کاتالوگ و محصول فروشنده از سرور */

export function isUsableProductImage(u) {
  if (typeof u !== "string") return false;
  const s = u.trim();
  if (!s || s === "/logo.webp") return false;
  if (/^https?:\/\/?$/i.test(s)) return false;
  if (/^https?:\/\//i.test(s)) return s.length > 12;
  if (s.startsWith("/") && s.length > 3) return true;
  if (s.startsWith("data:image/")) return true;
  return false;
}

export function pickProductImage(p) {
  if (!p) return "";
  const candidates = [
    p.cover_image,
    p.image,
    ...(Array.isArray(p.images) ? p.images : []),
    ...(Array.isArray(p.colors) ? p.colors.map((c) => c && c.image) : []),
  ];
  for (const u of candidates) {
    if (isUsableProductImage(u)) return String(u).trim();
  }
  return "";
}

export function mapCatalogRow(p) {
  if (!p) return null;
  const base = Number(p.base_price ?? p.price) || 0;
  const disc = Number(p.discount_percent ?? p.discount) || 0;
  const price = disc > 0 ? Math.round(base * (1 - disc / 100)) : base;
  const img = pickProductImage(p);
  const imgs =
    Array.isArray(p.images) && p.images.length
      ? p.images.filter(isUsableProductImage)
      : img
        ? [img]
        : [];
  if (img && !imgs.length) imgs.push(img);
  const name = p.title || p.name || "محصول";
  const sid = p.seller_id || p.sellerId || p.seller?.id || null;
  const sname = p.seller_name || p.seller?.name || p.sellerName || "فروشگاه";
  const stockN = Number(p.stock ?? p.stockLeft);
  let colors = Array.isArray(p.colors) && p.colors.length ? p.colors.map((c) => ({ ...c })) : [];
  if (!colors.length) {
    colors = [{ name: "پیش‌فرض", hex: "#999", image: img || "/logo.webp" }];
  } else {
    colors = colors.map((c, i) => {
      const cImg = isUsableProductImage(c && c.image)
        ? String(c.image).trim()
        : imgs[i] || img || "/logo.webp";
      let cname =
        c && (c.name || c.label || c.title)
          ? String(c.name || c.label || c.title).trim()
          : "";
      if (!cname && c && typeof c === "object") {
        const keys = Object.keys(c)
          .filter((k) => /^\d+$/.test(k))
          .sort((a, b) => Number(a) - Number(b));
        if (keys.length) cname = keys.map((k) => c[k]).join("");
      }
      if (!cname) cname = "پیش‌فرض";
      return { ...(c || {}), name: cname, image: cImg };
    });
  }
  return {
    id: p.id,
    product_id: p.id,
    productCode: p.productCode || p.product_code || "",
    product_code: p.productCode || p.product_code || "",
    name,
    title: name,
    slug: p.slug || "",
    price,
    priceText: (() => {
      try {
        return price.toLocaleString("fa-IR");
      } catch {
        return String(price);
      }
    })(),
    oldPrice: disc > 0 ? base : null,
    discount: disc,
    image: img || (colors[0] && colors[0].image) || "",
    cover_image: img || null,
    images: imgs.length ? imgs : img ? [img] : [],
    colors,
    sizes: Array.isArray(p.sizes) && p.sizes.length ? p.sizes : ["S", "M", "L", "XL", "XXL"],
    featured_top: !!(p.featured_top ?? p.featuredTop ?? (p.payload && (p.payload.featured_top || p.payload.featuredTop))),
    featuredTop: !!(p.featured_top ?? p.featuredTop ?? (p.payload && (p.payload.featured_top || p.payload.featuredTop))),
    status: p.status || "active",
    seller: {
      id: sid || "own",
      name: sname && sname !== "undefined" ? sname : "فروشگاه",
    },
    sellerId: sid || "own",
    sellerName: sname && sname !== "undefined" ? sname : "فروشگاه",
    inStock: Number.isFinite(stockN) ? stockN > 0 : true,
    stock: Number.isFinite(stockN) ? stockN : null,
    description: p.description || "",
    fromServer: true,
    scheduledPublishAt: p.scheduled_publish_at || null,
    amazing: !!(p.amazing || p.is_amazing || p.isAmazing),
    dealEndsAt: p.dealEndsAt || p.deal_ends_at || p.deal_endsAt || null,
    popular: !!(p.popular || p.is_popular || p.isPopular || p.bestseller || p.best_seller),
    fastShip: !!(p.fastShip || p.fast_ship || p.fastShipping || p.fast_shipping),
    salesCount: Number(p.salesCount ?? p.sales_count ?? p.sold_count ?? p.soldCount ?? 0) || 0,
    brand: p.brand || p.brandName || p.brand_name || "",
    brandName: p.brandName || p.brand || p.brand_name || "",
    brandId: p.brandId || p.brand_id || "",
    brand_id: p.brand_id || p.brandId || null,
    category: p.category_name || p.category || p.categories?.[0] || "عمومی",
    categories: Array.isArray(p.categories)
      ? p.categories
      : p.category || p.category_name
        ? [p.category || p.category_name]
        : [],
    tags: Array.isArray(p.tags) ? p.tags : [],
  };
}

/** sellerUser اختیاری — اگر نباشد از payload استفاده می‌شود */
export function mapServerProductToSellerUi(p, sellerUser = null) {
  if (!p) return null;
  const payload = p.payload && typeof p.payload === "object" ? p.payload : {};
  const price = Number(p.base_price ?? p.price ?? payload.price ?? 0) || 0;
  const imgs =
    Array.isArray(p.images) && p.images.length
      ? p.images
      : Array.isArray(payload.images)
        ? payload.images
        : p.cover_image
          ? [p.cover_image]
          : [];
  const stock = payload.stock ?? p.stock ?? 0;
  const shopFallback =
    (sellerUser && (sellerUser.shopName || sellerUser.name)) || payload.sellerName || "فروشگاه";
  return {
    ...payload,
    id: p.id,
    name: p.name || p.title || payload.name || "",
    title: p.title || p.name || payload.name || "",
    price,
    priceText: payload.priceText || (price ? String(price) : ""),
    status: p.status || payload.status || "pending",
    contentStatus: p.status === "active" ? "approved" : p.status || "pending",
    image: p.cover_image || imgs[0] || "",
    images: imgs,
    cover_image: p.cover_image || imgs[0] || "",
    stock,
    stockLeft: stock,
    productCode: p.product_code || payload.productCode || "",
    category: payload.category || payload.category_name || p.category || "",
    categories: payload.categories || [],
    brand: payload.brand || payload.brandName || "",
    brandName: payload.brandName || payload.brand || "",
    colors: Array.isArray(payload.colors) ? payload.colors : [],
    sizes: Array.isArray(payload.sizes) ? payload.sizes : [],
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    attributes: payload.attributes || {},
    variants: payload.variants || [],
    desc: payload.desc || p.description || "",
    description: p.description || payload.desc || "",
    slug: p.slug || payload.slug || "",
    createdAt: p.created_at || payload.createdAt || null,
    updatedAt: p.updated_at || payload.updatedAt || null,
    sellerId: p.seller_id || payload.sellerId,
    shopName: payload.shopName || (sellerUser ? sellerUser.shopName || sellerUser.name : "") || "",
    sellerName: payload.sellerName || (sellerUser ? sellerUser.shopName || sellerUser.name : "") || "",
    seller: {
      id: p.seller_id || payload.sellerId || "own",
      name: shopFallback,
    },
    salesCount: Number(payload.salesCount ?? payload.sales_count ?? payload.sold_count ?? 0) || 0,
    amazing: !!(payload.amazing || p.amazing),
    dealEndsAt: payload.dealEndsAt || payload.deal_ends_at || null,
    popular: !!(payload.popular || payload.is_popular || payload.bestseller),
    fastShip: !!(payload.fastShip || payload.fast_ship || payload.fastShipping),
    discount: Number(payload.discount ?? payload.discount_percent ?? 0) || 0,
    inStock: (Number(payload.stock ?? p.stock ?? 0) || 0) > 0,
    fromServer: true,
  };
}
