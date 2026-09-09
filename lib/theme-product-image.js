/**
 * Pick light/dark watermarked product image URL.
 * Convention: foo.webp (red logo) + foo-dark.webp (blue logo)
 * Existing single-version URLs stay unchanged.
 */
export function themeProductImageUrl(url, isDark) {
  if (!url || typeof url !== 'string') return url
  if (url.startsWith('data:')) return url
  if (/-dark\.webp(?:\?|$)/i.test(url)) {
    return isDark ? url : url.replace(/-dark\.webp/i, '.webp')
  }
  if (!/\.webp(?:\?|$)/i.test(url)) return url
  if (!isDark) return url
  // uuid-thumb.webp → uuid-thumb-dark.webp ; uuid.webp → uuid-dark.webp
  return url.replace(/\.webp(\?|$)/i, '-dark.webp$1')
}
