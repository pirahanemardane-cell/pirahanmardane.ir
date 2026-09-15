/**
 * URLهای فارسی فروشگاه — کل صفحات
 * مثال محصول: /پیراهن_چهارخانه_قرمز/فروشگاه_نمونه
 */

/** اسلاگ فارسی: فاصله و جداکننده → _ */
export function slugifyFa(s) {
  return (
    String(s || '')
      .trim()
      .replace(/^پیراهن\s+/u, '')
      .replace(/\s+/g, '_')
      .replace(/[^\u0600-\u06FFa-zA-Z0-9_]/gu, '')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '') || 'مورد'
  );
}

/** نگاشت کلید صفحه → مسیر فارسی */
export const FA_PATHS = {
  'admin-login': '/ashn',
  'admin-panel': '/ashn-pnl',
  home: '/',
  shop: '/فروشگاه',
  about: '/درباره-ما',
  contact: '/تماس-با-ما',
  faq: '/سوالات-متداول',
  'size-guide': '/راهنمای-سایز',
  'become-seller': '/فروشنده-شوید',
  terms: '/قوانین',
  returns: '/مرجوعی',
  privacy: '/حریم-خصوصی',
  cookies: '/کوکی-ها',
  sitemap: '/نقشه-سایت',
  blog: '/مجله',
  brands: '/برندها',
  campaigns: '/کمپین-ها',
  deals: '/پیشنهادها',
  cart: '/سبد-خرید',
  checkout: '/تسویه-حساب',
  wishlist: '/علاقه-مندی-ها',
  compare: '/مقایسه',
  recent: '/بازدیدهای-اخیر',
  profile: '/حساب-من',
  'seller-panel': '/پنل-فروشنده',
  sellers: '/فروشندگان',
  categories: '/دسته-بندی-ها',
  tags: '/برچسب-ها',
};

/** مسیر انگلیسی قدیمی → فارسی (ریدایرکت کلاینت) */
export const LEGACY_EN_TO_FA = {
  '/shop': FA_PATHS.shop,
  '/about': FA_PATHS.about,
  '/contact': FA_PATHS.contact,
  '/faq': FA_PATHS.faq,
  '/size-guide': FA_PATHS['size-guide'],
  '/become-seller': FA_PATHS['become-seller'],
  '/terms': FA_PATHS.terms,
  '/returns': FA_PATHS.returns,
  '/privacy': FA_PATHS.privacy,
  '/cookies': FA_PATHS.cookies,
  '/sitemap': FA_PATHS.sitemap,
  '/blog': FA_PATHS.blog,
  '/بلاگ': FA_PATHS.blog,
  '/brands': FA_PATHS.brands,
  '/campaigns': FA_PATHS.campaigns,
  '/deals': FA_PATHS.deals,
  '/cart': FA_PATHS.cart,
  '/checkout': FA_PATHS.checkout,
  '/wishlist': FA_PATHS.wishlist,
  '/compare': FA_PATHS.compare,
  '/recent': FA_PATHS.recent,
  '/profile': FA_PATHS.profile,
  '/account': FA_PATHS.profile,
  '/seller': FA_PATHS['seller-panel'],
  '/seller-panel': FA_PATHS['seller-panel'],
  '/sellers': FA_PATHS.sellers,
  '/categories': FA_PATHS.categories,
  '/tags': FA_PATHS.tags,
};

const PATH_TO_KEY = Object.fromEntries(
  Object.entries(FA_PATHS).map(([k, v]) => [v.replace(/\/$/, '') || '/', k])
);

export function pathForStaticPage(page) {
  if (!page) return FA_PATHS.home;
  if (page === 'blog-post') return FA_PATHS.blog;
  return FA_PATHS[page] || `/${slugifyFa(page)}`;
}

export function pathForBlogPost(slugOrTitle) {
  return `${FA_PATHS.blog}/${slugifyFa(slugOrTitle)}`;
}

/** صفحه فیلتر برچسب مجله — همیشه noindex (هرگز در sitemap نیاید) */
export function pathForBlogTag(slugOrName) {
  const s = slugifyFa(slugOrName);
  return `${FA_PATHS.blog}/برچسب/${s}`;
}


/** مسیر PDP: /نام_محصول  یا  /نام_فروشنده/نام_محصول (نه /فروشگاه/...) */
/** مسیر PDP: /نام_محصول یا /نام_فروشنده/نام_محصول — مسیرهای رزرو فروشگاه استفاده نشوند */
/** مسیر PDP — مسیرهای رزرو سایت به‌عنوان نام فروشگاه استفاده نشوند */
/** مسیر PDP: /نام_محصول یا /فروشنده/نام_محصول — مسیرهای رزرو سایت به‌عنوان shop استفاده نشوند */
/** مسیر PDP: /نام_محصول یا /فروشنده/نام_محصول */
export function pathForProduct(productName, shopName) {
  const product = slugifyFa(productName);
  let shop = slugifyFa(shopName || '');
  const reserved = new Set([
    'فروشگاه', 'فروشندگان', 'محصول', 'مجله', 'برندها',
    'سبد-خرید', 'حساب', 'خانه', 'پیشنهادها', 'مقایسه',
    'علاقه-مندی-ها', 'اخیرا', 'تماس-با-ما', 'درباره-ما',
    'سوالات-متداول', 'دسته-بندی-ها', 'برچسب-ها', 'حساب-من',
    'پنل-فروشنده', 'تسویه-حساب', 'بازدیدهای-اخیر',
  ]);
  if (!shop || shop === 'مورد' || reserved.has(shop)) shop = '';
  if (shop && product && product !== 'مورد') return `/${shop}/${product}`;
  if (product && product !== 'مورد') return `/${product}`;
  return '/محصول';
}

export function pathForSellerStore(shopName) {
  return `${FA_PATHS.sellers}/${slugifyFa(shopName)}`;
}


/** مسیر دسته کلسایت: /{slug} */
export function pathForCategory(slugOrName) {
  const s = slugifyFa(slugOrName);
  if (!s || s === "مورد") return FA_PATHS.shop;
  return "/" + s;
}

/** مسیر دسته داخل فروشگاه: /{shopSlug}/{catSlug} */
export function pathForSellerCategory(shopName, catSlugOrName) {
  const a = slugifyFa(shopName);
  const b = slugifyFa(catSlugOrName);
  if (!a || a === "مورد") return pathForCategory(catSlugOrName);
  if (!b || b === "مورد") return pathForSellerStore(shopName);
  return "/" + a + "/" + b;
}

export function pathForShop(opts = {}) {
  // فقط دسته → /{slug}  |  فروشنده+دسته جدا با pathForSellerCategory
  // اگر sort هم باشد، همان مسیر فروشگاه با query (نه اسلاگ دسته)
  if (opts.cat && !opts.tag && !opts.query && !opts.sort) {
    return pathForCategory(opts.cat);
  }
  const base = FA_PATHS.shop;
  const params = new URLSearchParams();
  if (opts.cat) params.set("دسته", slugifyFa(opts.cat));
  if (opts.tag) params.set("برچسب", slugifyFa(opts.tag));
  if (opts.query) params.set("ق", String(opts.query));
  if (opts.sort) params.set("sort", String(opts.sort));
  const q = params.toString();
  return q ? `${base}?${q}` : base;
}

/**
 * تجزیه pathname فارسی (یا legacy انگلیسی)
 * @returns {{ type: string, page?: string, productSlug?: string, shopSlug?: string, blogSlug?: string, sellerSlug?: string }}
 */
export function parseFaPath(pathname) {
  let path = decodeURIComponent(String(pathname || "/").split("?")[0] || "/");
  path = path.replace(/[\u200c\u200d\u200e\u200f\ufeff]/g, "");
  path = path.replace(/\/$/, "") || "/";

  if (path === "/ashn" || path.endsWith("/ashn")) return { type: "admin-login", page: "admin-login" };
  if (path === "/ashn-pnl" || path.endsWith("/ashn-pnl")) return { type: "admin-panel", page: "admin-panel" };
  if (path === "/amirshn" || path.endsWith("/amirshn") || path === "/amirpnl" || path.endsWith("/amirpnl")) {
    return { type: "admin-login", page: "admin-login", legacyRedirect: "/ashn" };
  }

  let m = path.match(/^\/product\/([^/]+)$/i);
  if (m) return { type: "product_code", code: decodeURIComponent(m[1]) };

  m = path.match(/^\/blog\/([^/]+)$/i);
  if (m) return { type: "blog", blogSlug: decodeURIComponent(m[1]) };

  const leg = LEGACY_EN_TO_FA[path.toLowerCase()];
  if (leg) {
    const key = PATH_TO_KEY[leg.replace(/\/$/, "") || "/"];
    if (key && key !== "home") return { type: "static", page: key, legacyRedirect: leg };
  }

  if (path === "/" || path === "") return { type: "home" };

  const key = PATH_TO_KEY[path];
  if (key === "home") return { type: "home" };
  if (key === "blog") return { type: "static", page: "blog" };
  if (key && FA_PATHS[key]) {
    const panelKeys = ["cart", "checkout", "wishlist", "compare", "recent", "profile", "sellers", "shop", "categories", "tags"];
    const isPanel = String(key).includes("panel") || panelKeys.includes(key);
    return { type: isPanel ? key : "static", page: key === "shop" ? null : key };
  }

  // /مجله/برچسب/xxx — فیلتر برچسب (noindex)
  const blogTagPrefix = FA_PATHS.blog + "/برچسب/";
  if (path.startsWith(blogTagPrefix)) {
    return { type: "blog-tag", tagSlug: path.slice(blogTagPrefix.length), noindex: true };
  }
  if (path.startsWith("/بلاگ/برچسب/")) {
    return { type: "blog-tag", tagSlug: path.slice("/بلاگ/برچسب/".length), noindex: true };
  }
  if (path.startsWith(FA_PATHS.blog + "/")) {
    return { type: "blog", blogSlug: path.slice(FA_PATHS.blog.length + 1) };
  }
  // سازگاری با URL قدیمی /بلاگ/...
  if (path.startsWith("/بلاگ/")) {
    return { type: "blog", blogSlug: path.slice("/بلاگ/".length) };
  }
  if (path === "/بلاگ") {
    return { type: "static", page: "blog" };
  }
  if (path.startsWith(FA_PATHS.sellers + "/")) {
    const rest = path.slice(FA_PATHS.sellers.length + 1);
    const segs = rest.split("/").filter(Boolean);
    if (segs.length >= 2) {
      return { type: "seller", sellerSlug: segs[0], catSlug: segs[1] };
    }
    return { type: "seller", sellerSlug: segs[0] || rest };
  }
  if (path === FA_PATHS.shop) return { type: "shop" };

  const parts = path.split("/").filter(Boolean);
  if (parts.length === 2) {
    const firstFull = "/" + parts[0];
    // /فروشگاه/xxx → فروشگاه با فیلتر/جستجو نیست؛ محصول با shopSlug اشتباه
    // pathForProduct = /{shop}/{product} پس productSlug=parts[1], shopSlug=parts[0]
    if (firstFull === FA_PATHS.shop) {
      return {
        type: "product",
        productSlug: parts[1],
        shopSlug: parts[0],
        maybeCatSlug: parts[1],
      };
    }
    if (!PATH_TO_KEY[firstFull] && firstFull !== FA_PATHS.blog && firstFull !== FA_PATHS.sellers) {
      return {
        type: "product",
        productSlug: parts[1],
        shopSlug: parts[0],
        maybeSellerSlug: parts[0],
        maybeCatSlug: parts[1],
      };
    }
  }
  if (parts.length === 1) {
    const p0 = "/" + parts[0];
    if (PATH_TO_KEY[p0]) {
      const k = PATH_TO_KEY[p0];
      return { type: k, page: k };
    }
    // تک‌بخشی: هم کاندید دسته (/{slug}) هم محصول — applyPath اول دسته را چک می‌کند
    return {
      type: "category_or_product",
      productSlug: parts[0],
      shopSlug: null,
      maybeCatSlug: parts[0],
      catSlug: parts[0],
    };
  }
  return { type: "unknown", path };
}

export function pushFaUrl(path, state = {}) {
  if (typeof window === 'undefined') return;
  const norm = (u) => {
    try {
      const raw = String(u || '/');
      const [p, q = ''] = raw.split('?');
      const dec = decodeURIComponent(p).replace(/\/+$/, '') || '/';
      return q ? dec + '?' + q : dec;
    } catch (_) {
      return String(u || '/').replace(/\/+$/, '') || '/';
    }
  };
  const next = norm(path || '/');
  const cur = norm(window.location.pathname + window.location.search);
  if (cur === next) {
    window.history.replaceState({ ...(state || {}), ts: Date.now() }, '', next);
    return;
  }
  window.history.pushState({ ...(state || {}), ts: Date.now() }, '', next);
}

export function replaceFaUrl(path, state = {}) {
  if (typeof window === 'undefined') return;
  window.history.replaceState(state || {}, '', path || '/');
}
