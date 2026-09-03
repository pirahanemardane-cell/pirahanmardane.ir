import { headers } from 'next/headers';

/**
 * Soft-launch: SITE_NOINDEX (default on) blocks all indexing.
 * *.vercel.app always disallow — even after main domain is opened for SEO.
 */
const envNoindex =
  process.env.SITE_NOINDEX !== 'false' &&
  process.env.NEXT_PUBLIC_SITE_NOINDEX !== 'false';

const base = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://pirahanemardane.ir'
).replace(/\/$/, '');

export default async function robots() {
  let host = '';
  try {
    const h = await headers();
    host = (h.get('host') || '').toLowerCase();
  } catch (_) {}

  const isVercelPreview = host.endsWith('.vercel.app');

  if (envNoindex || isVercelPreview) {
    return {
      rules: [
        { userAgent: '*', disallow: '/' },
        { userAgent: 'GPTBot', disallow: '/' },
        { userAgent: 'Google-Extended', disallow: '/' },
        { userAgent: 'Googlebot', disallow: '/' },
        { userAgent: 'bingbot', disallow: '/' },
      ],
      host: isVercelPreview ? undefined : base,
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/seller-panel',
          '/seller',
          '/checkout',
          '/cart',
          '/wishlist',
          '/compare',
          '/profile',
          '/api/',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
