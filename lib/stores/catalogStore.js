import { createStore } from './createStore.js';

/** کاتالوگ ادمین — منبع حقیقت سرور؛ حافظه فقط کش نشست */
export const catalogStore = createStore({
  brands: [],
  colors: [],
  sizes: [],
  attributes: [],
  categories: [],
  tags: [],
});

const SESSION_KEYS = {
  brands: 'pm_cache_brands',
  colors: 'pm_cache_colors',
  sizes: 'pm_cache_sizes',
  attributes: 'pm_cache_attributes',
  categories: 'pm_cache_categories',
  tags: 'pm_cache_tags',
};

function sessionGet(key) {
  try {
    if (typeof sessionStorage === 'undefined') return null;
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
}

function sessionSet(key, value) {
  try {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (_) {}
}

/** فقط کش نشست — نه localStorage دائمی */
export function hydrateCatalogStore() {
  if (typeof window === 'undefined') return;
  const next = {};
  Object.entries(SESSION_KEYS).forEach(([field, key]) => {
    next[field] = sessionGet(key) || [];
  });
  catalogStore.setState((s) => ({ ...s, ...next }));
}

export function setCatalogField(field, value) {
  const list = Array.isArray(value) ? value : [];
  catalogStore.setState((s) => ({ ...s, [field]: list }));
  const key = SESSION_KEYS[field];
  if (key) sessionSet(key, list);
}

/** بارگذاری همهٔ کاتالوگ از API (منبع حقیقت) */
export async function hydrateCatalogFromApi() {
  if (typeof window === 'undefined') return;
  const endpoints = [
    ['categories', '/api/catalog/categories'],
    ['tags', '/api/catalog/tags'],
    ['colors', '/api/catalog/colors'],
    ['sizes', '/api/catalog/sizes'],
    ['brands', '/api/catalog/brands'],
    ['attributes', '/api/catalog/attributes'],
  ];
  const next = {};
  await Promise.all(
    endpoints.map(async ([field, url]) => {
      try {
        const res = await fetch(url, { credentials: 'include', cache: 'no-store' });
        const json = await res.json().catch(() => ({}));
        const list = json?.items || json?.data || json?.[field] || [];
        if (json?.ok && Array.isArray(list)) {
          next[field] = list;
          sessionSet(SESSION_KEYS[field], list);
        }
      } catch (_) {}
    }),
  );
  if (Object.keys(next).length) {
    catalogStore.setState((s) => ({ ...s, ...next }));
  }
  return next;
}
