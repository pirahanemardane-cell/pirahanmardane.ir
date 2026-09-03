const g = globalThis
if (!g.__pmCatalogCache) g.__pmCatalogCache = new Map()
const store = g.__pmCatalogCache
/** TTL کوتاه‌تر تا بعد از تأیید ادمین فروشگاه زودتر تازه شود */
const DEFAULT_TTL_MS = Number(process.env.CATALOG_CACHE_TTL_MS || 15_000)

export function cacheKey(parts) {
  return (Array.isArray(parts) ? parts : [parts]).map(String).join('|')
}

export function cacheGet(key) {
  const row = store.get(key)
  if (!row) return null
  if (Date.now() > row.exp) {
    store.delete(key)
    return null
  }
  return row.val
}

export function cacheSet(key, val, ttlMs = DEFAULT_TTL_MS) {
  store.set(key, { val, exp: Date.now() + ttlMs })
  return val
}

export function invalidateProductCaches() {
  for (const k of [...store.keys()]) {
    if (
      k.startsWith('cat:') ||
      k.startsWith('plp:') ||
      k.startsWith('prod:') ||
      k.startsWith('search:') ||
      k.startsWith('catalog:') ||
      k.startsWith('catalog|') ||
      k.includes('|catalog|') ||
      k.startsWith('catalog') ||
      k.includes('product')
    ) {
      store.delete(k)
    }
  }
}

export function invalidateAllCaches() {
  store.clear()
}

export async function withCatalogCache(key, fn, ttlMs = DEFAULT_TTL_MS) {
  const hit = cacheGet(key)
  if (hit != null) return hit
  const val = await fn()
  return cacheSet(key, val, ttlMs)
}

export function invalidateCatalogCache() {
  return invalidateProductCaches()
}
