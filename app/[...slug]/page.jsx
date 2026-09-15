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
  // مسیرهای ادمین جدید
  try {
    const joined = '/' + (slugParts || []).map(decodePart).filter(Boolean).join('/');
    if (joined === '/ashn' || joined === '/ashn-pnl') return true;
  } catch (_) {}

  const parts = (slugParts || []).map(decodePart).filter(Boolean);
  if (!parts.length) return true;

  const path = '/' + parts.join('/');
  const first = String(parts[0] || '');
  const firstLower = first.toLowerCase();

  // مسیرهای حذف‌شده / ممنوع
  const blocked = new Set([
    'amirpnl', 'amirshn', 'admin', 'admin-login', 'admin-panel',
    'پنل-ادمین', 'پنل_ادمین',
  ]);
  if (blocked.has(firstLower) || blocked.has(first)) return false;
  if (firstLower.startsWith('amirpnl') || firstLower.startsWith('amirshn')) return false;

  const exact = new Set([
    ...Object.values(FA_PATHS),
    ...Object.keys(LEGACY_EN_TO_FA),
  ]);
  if (exact.has(path)) return true;

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
    ]
      .map((p) => p.replace(/^\//, '').split('/')[0])
      .filter(Boolean)
      .map((s) => String(s).toLowerCase()),
  );

  // تک‌بخشی
  if (parts.length === 1) {
    if (knownFirst.has(firstLower)) return true;
    // فارسی / غیرلاتین → دسته یا برند محتمل
    if (!/^[a-z0-9_-]+$/i.test(first)) return true;
    // لاتین ناشناخته → 404 سرور
    return false;
  }

  if (['product', 'blog', 'seller', 'account'].includes(firstLower)) return true;

  // /محصول/فروشگاه
  if (parts.length === 2) return true;

  // بقیه (۳ بخش و بیشتر ناشناخته) → 404
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
