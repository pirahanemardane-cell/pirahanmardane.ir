import { stripHtmlSeo } from "@/lib/seo-pixel";
/** DOM helpers برای meta / canonical / JSON-LD */

export function setOrCreateMeta(attr, key, content) {
  if (content == null || content === "") return;
  if (typeof document === "undefined") return;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", String(content));
}

export function setCanonicalLink(href) {
  if (!href || typeof document === "undefined") return;
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function upsertJsonLd(id, data) {
  if (typeof document === "undefined") return;
  let el = document.getElementById(id);
  if (!data) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = typeof data === "string" ? data : JSON.stringify(data);
}

export function buildLlmsTxt(s) {
  const base = (s.canonicalBase || "https://pirahanemardane.ir").replace(/\/$/, "");
  const lines = [
    "# llms.txt — راهنمای مختصر برای دستیارهای AI",
    `# Site: ${s.siteTitle || "پیراهن مردانه"}`,
    `# Base: ${base}`,
    "",
    "## Summary",
    s.metaDescription || "فروشگاه اینترنتی پیراهن مردانه",
    "",
    "## Key pages",
    `- Home: ${base}/`,
    `- Shop: ${base}/shop`,
    `- Blog: ${base}/blog`,
    `- About: ${base}/about`,
    `- Contact: ${base}/contact`,
    "",
    "## Sitemap",
    `- ${base}/sitemap.xml`,
    "",
    "## Policy",
    "- Prefer official product pages for prices and availability.",
    "- Do not invent stock, price, or seller claims.",
  ];
  if (s.llmsTxtExtra) lines.push("", "## Extra", s.llmsTxtExtra.trim());
  return lines.join("\n");
}

export function defaultOrganizationSchema(s) {
  const base = (s.canonicalBase || "https://pirahanemardane.ir").replace(/\/$/, "");
  if (s.schemaOrgJson && String(s.schemaOrgJson).trim().startsWith("{")) {
    try {
      return JSON.parse(s.schemaOrgJson);
    } catch (_) {}
  }
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: s.siteTitle || "پیراهن مردانه",
    url: base,
    logo: base + "/logo.webp",
    description: s.metaDescription || "",
  };
}

export function buildBreadcrumbSchema(items, s) {
  if (!items || !items.length) return null;
  const base = ((s && s.canonicalBase) || "https://pirahanemardane.ir").replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.label || it.name || "",
      item: it.href ? (it.href.startsWith("http") ? it.href : base + it.href) : undefined,
    })),
  };
}


export function buildProductSchema(p, s, getProductPublicUrl) {
  if (!p) return null;
  const base = (s.canonicalBase || "https://pirahanemardane.ir").replace(/\/$/, "");
  const price = Number(p.price) || Number(String(p.price || "").replace(/[^\d]/g, "")) || 0;
  const stock = Number(p.stock);
  const inStock = Number.isFinite(stock) ? stock > 0 : p.inStock !== false;
  const availability = inStock
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";
  const images = [];
  const pushImg = (u) => {
    if (u && !images.includes(u)) images.push(u);
  };
  pushImg(p.seoOgImage);
  (p.images || []).forEach(pushImg);
  (p.colors || []).forEach((c) => pushImg(c?.image));
  pushImg(p.image);
  const brandName = p.brandName || p.brand || p.seller?.name || s.organizationName || "پیراهن مردانه";
  const sku = p.productCode || p.sku || p.id || "";
  const url =
    typeof getProductPublicUrl === "function"
      ? getProductPublicUrl(p)
      : `${base}/`;
  const offer = {
    "@type": "Offer",
    url,
    priceCurrency: "IRR",
    price: String(price),
    availability,
    itemCondition: "https://schema.org/NewCondition",
    seller: {
      "@type": "Organization",
      name: p.sellerName || p.seller?.name || brandName,
    },
  };
  if (p.dealEndsAt || p.saleEndsAt) {
    try {
      const until = new Date(p.dealEndsAt || p.saleEndsAt);
      if (!Number.isNaN(until.getTime())) offer.priceValidUntil = until.toISOString().slice(0, 10);
    } catch (_) {}
  }
  offer.hasMerchantReturnPolicy = {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "IR",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 7,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/FreeReturn",
  };
  offer.shippingDetails = {
    "@type": "OfferShippingDetails",
    shippingDestination: { "@type": "DefinedRegion", addressCountry: "IR" },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" },
      transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 5, unitCode: "DAY" },
    },
    shippingRate: { "@type": "MonetaryAmount", currency: "IRR", value: "0" },
  };
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.seoTitle || p.name || "",
    description: stripHtmlSeo(p.seoDescription || p.desc || p.description || ""),
    image: images.length ? images : undefined,
    sku: sku || undefined,
    mpn: p.mpn || sku || undefined,
    gtin: p.gtin || p.barcode || undefined,
    brand: { "@type": "Brand", name: brandName },
    category: p.category || (Array.isArray(p.categories) ? p.categories[0] : undefined),
    offers: offer,
  };
  const rating = Number(p.rating);
  const reviewCount = Number(p.reviewsCount || p.reviewCount || p.ratingsCount || 0);
  if (rating > 0 && reviewCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: String(Math.min(5, Math.max(1, rating))),
      reviewCount: String(reviewCount),
      bestRating: "5",
      worstRating: "1",
    };
  }
  return schema;
}

export function buildArticleSchema(post, s) {
  if (!post) return null;
  const base = (s.canonicalBase || "https://pirahanemardane.ir").replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.seoTitle || post.title,
    description: stripHtmlSeo(post.seoDescription || post.excerpt || ""),
    image: post.image || undefined,
    datePublished: post.date || undefined,
    author: { "@type": "Person", name: post.author || "تحریریه" },
    publisher: {
      "@type": "Organization",
      name: s.siteTitle || "پیراهن مردانه",
      logo: { "@type": "ImageObject", url: base + "/logo.webp" },
    },
    mainEntityOfPage:
      base +
      (typeof window !== "undefined" ? window.location.pathname + window.location.search : ""),
  };
}
