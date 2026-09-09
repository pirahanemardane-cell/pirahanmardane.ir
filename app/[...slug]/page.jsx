import { notFound } from 'next/navigation';
import { FA_PATHS, LEGACY_EN_TO_FA } from '@/lib/fa-routes';
import CatchAllClient from './CatchAllClient';

function decodePart(s) {
  try {
    return decodeURIComponent(String(s || ''));
  } catch {
    return String(s || '');
  }
}

function isAllowedSlug(slugParts) {
  const parts = (slugParts || []).map(decodePart).filter(Boolean);
  if (!parts.length) return true;

  const path = '/' + parts.join('/');

  const exact = new Set([
    ...Object.values(FA_PATHS),
    ...Object.keys(LEGACY_EN_TO_FA),
  ]);
  if (exact.has(path)) return true;

  const first = parts[0];
  const knownFirst = new Set(
    [
      ...Object.values(FA_PATHS),
      ...Object.keys(LEGACY_EN_TO_FA),
      '/product',
      '/blog',
      '/seller',
      '/account',
      '/shop',
      '/sellers',
      '/categories',
      '/tags',
      '/amirshn',
    ]
      .map((p) => p.replace(/^\//, '').split('/')[0])
      .filter(Boolean),
  );

  // تک‌بخشی: دسته یا برند (مثل /مجلسی)
  if (parts.length === 1) return true;

  // مسیرهای اختصاصی
  if (first === 'product' || first === 'blog' || first === 'seller' || first === 'account') {
    return true;
  }

  // نامک محصول فارسی: /نام_محصول/نام_فروشگاه
  if (parts.length === 2) return true;

  return false;
}

export default async function FaCatchAllPage({ params }) {
  const resolved = typeof params?.then === 'function' ? await params : params;
  const slug = resolved?.slug || [];
  if (!isAllowedSlug(slug)) {
    notFound();
  }
  return <CatchAllClient />;
}
