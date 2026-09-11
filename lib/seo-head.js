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
