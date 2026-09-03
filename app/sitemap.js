/**
 * Empty sitemap while full noindex is active.
 */
export default function sitemap() {
  const noindex =
    process.env.SITE_NOINDEX !== 'false' &&
    process.env.NEXT_PUBLIC_SITE_NOINDEX !== 'false';
  if (noindex) return [];
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://pirahanemardane.ir').replace(
    /\/$/,
    ''
  );
  return [{ url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 }];
}
