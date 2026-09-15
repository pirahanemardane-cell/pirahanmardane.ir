/**
 * کاتالوگ seed برای metadata سمت سرور (P0)
 * تا قبل از اتصال DB، خزنده از این داده title/description/canonical می‌گیرد.
 * کدهای محصول با دموی فرانت هم‌خوان نگه داشته شده‌اند.
 */

export const SITE = {
  name: 'پیراهن مردانه',
  base: 'https://pirahanemardane.ir',
  description:
    'فروشگاه اینترنتی پیراهن مردانه — رسمی، کروات، لینن و آستین کوتاه از فروشندگان معتبر',
};

/** @type {Array<Record<string, any>>} */
export const SEED_PRODUCTS = [];

export const SEED_BLOG = [];

export function getProductByCode(code) {
  const c = String(code || '').trim();
  if (!c) return null;
  return (
    SEED_PRODUCTS.find(
      (p) => p.productCode === c || String(p.id) === c || p.productCode?.toLowerCase() === c.toLowerCase()
    ) || null
  );
}

export function getBlogById(id) {
  const c = String(id || '').trim();
  if (!c) return null;
  return SEED_BLOG.find((b) => b.id === c || String(b.id) === c) || null;
}

export function productMetadata(code) {
  const p = getProductByCode(code);
  const base = SITE.base.replace(/\/$/, '');
  if (!p) {
    return {
      title: `محصول ${code || ''} | ${SITE.name}`,
      description: SITE.description,
      alternates: { canonical: `${base}/product/${encodeURIComponent(code || '')}` },
      robots: { index: true, follow: true },
    };
  }
  const title = p.seoTitle || p.name;
  const description = p.seoDescription || SITE.description;
  const url = `${base}/product/${encodeURIComponent(p.productCode)}`;
  const images = p.image ? [{ url: p.image }] : undefined;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      locale: 'fa_IR',
      siteName: SITE.name,
      images,
    },
    other: p.productCode ? { 'product:retailer_item_id': p.productCode } : undefined,
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: p.image ? [p.image] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

export function blogMetadata(id) {
  const post = getBlogById(id);
  const base = SITE.base.replace(/\/$/, '');
  if (!post) {
    return {
      title: `مطلب | ${SITE.name}`,
      description: SITE.description,
      alternates: { canonical: `${base}/blog/${encodeURIComponent(id || '')}` },
    };
  }
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt || SITE.description;
  const url = `${base}/blog/${encodeURIComponent(post.id)}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      locale: 'fa_IR',
      siteName: SITE.name,
    },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: post.status === 'published', follow: true },
  };
}
