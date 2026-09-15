import { logCritical } from '../../../../../lib/critical-log';
import { NextResponse } from 'next/server';
import { getProductByCode, SITE } from '@/lib/catalog-seed';

/**
 * GET /api/seo/product/:code
 * متادیتای محصول برای SSR / ابزارهای خارجی
 */
export async function GET(_request, { params }) {
  const code = decodeURIComponent(params?.code || '');
  const p = getProductByCode(code);
  const base = SITE.base.replace(/\/$/, '');

  if (!p) {
    return NextResponse.json(
      {
        ok: false,
        code,
        title: `محصول ${code} | ${SITE.name}`,
        description: SITE.description,
        canonical: `${base}/product/${encodeURIComponent(code)}`,
        indexable: true,
        source: 'fallback',
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    source: 'seed',
    code: p.productCode,
    title: p.seoTitle || p.name,
    description: p.seoDescription || SITE.description,
    canonical: `${base}/product/${encodeURIComponent(p.productCode)}`,
    image: p.image || null,
    price: p.price,
    currency: 'IRR',
    availability: (Number(p.stock) || 0) > 0 ? 'InStock' : 'OutOfStock',
    brand: p.brandName || null,
    category: p.category || null,
    sku: p.productCode,
    gtin: p.gtin || null,
    rating: p.rating || null,
    reviewCount: p.reviewsCount || 0,
    indexable: true,
  });
}
