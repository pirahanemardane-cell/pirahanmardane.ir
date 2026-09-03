/**
 * لایهٔ ذخیره‌سازی کلاینتی نسخه‌دار (بدون بک‌اند)
 * — get/set امن، مهاجرت نسخه، خروجی/ورود پشتیبان JSON
 */

export const STORAGE_VERSION = 1;
const VERSION_KEY = '__pm_storage_version';

/** کلیدهای اصلی دامنه — برای بکاپ و مهاجرت */
/** کلیدهای کاتالوگ دیگر منبع حقیقت نیستند؛ فقط مهاجرت قدیمی */
export const CATALOG_LEGACY_KEYS = [
  'adminCatalogBrands',
  'adminCatalogColors',
  'adminCatalogSizes',
  'adminCatalogAttributes',
  'adminCatalogCategories',
  'adminCatalogTags',
  'adminCategories',
  'adminTags',
];

export const STORAGE_KEYS = [
  'cart',
  'favorites',
  'compare',
  'recentlyViewed',
  'theme',
  'likedBlogs',
  'blogComments',
  'cookieConsent',
  'adminSettings',
  'adminPageContent',
  'pageSeoMap',
  'adminCategories',
  'adminTags',
  'adminBlogCategories',
  'adminBlogTags',
  'adminCatalogBrands',
  'adminCatalogColors',
  'adminCatalogSizes',
  'adminCatalogAttributes',
  'adminCatalogCategories',
  'adminCatalogTags',
  'adminShippingMethods',
  'adminCampaigns',
  'sellerUser',
  'sellerProducts',
  'sellerGifts',
  'buyerGifts',
  'buyerTickets',
  'stockNotifyIds',
  'recentSearches',
  'sellerShopOpen',
  'adminBlogPosts',
  'adminRedirects',
  'adminSeoConfig',
  'adminUsers',
  'adminOrders',
];

export function storageAvailable() {
  try {
    const k = '__pm_ping';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function storageGet(key, fallback = null) {
  if (typeof window === 'undefined' || !storageAvailable()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return raw;
  } catch {
    return fallback;
  }
}

export function storageGetJSON(key, fallback = null) {
  const raw = storageGet(key, null);
  if (raw == null || raw === '') return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function storageSet(key, value) {
  if (typeof window === 'undefined' || !storageAvailable()) return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function storageSetJSON(key, value) {
  try {
    return storageSet(key, JSON.stringify(value));
  } catch {
    return false;
  }
}

export function storageRemove(key) {
  if (typeof window === 'undefined' || !storageAvailable()) return;
  try {
    localStorage.removeItem(key);
  } catch (_) {}
}

/** مهاجرت سبک هنگام بالا آمدن نسخه */
export function ensureStorageVersion() {
  if (typeof window === 'undefined' || !storageAvailable()) return;
  try {
    const cur = parseInt(localStorage.getItem(VERSION_KEY) || '0', 10) || 0;
    if (cur < STORAGE_VERSION) {
      // مهاجرت‌های آینده اینجا بر اساس cur → STORAGE_VERSION
      localStorage.setItem(VERSION_KEY, String(STORAGE_VERSION));
    }
  } catch (_) {}
}

/** خروجی پشتیبان از کلیدهای شناخته‌شده + کلیدهای admin و seller */
export function exportClientBackup() {
  if (typeof window === 'undefined' || !storageAvailable()) {
    return { version: STORAGE_VERSION, exportedAt: new Date().toISOString(), data: {} };
  }
  const data = {};
  const keys = new Set(STORAGE_KEYS);
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (
        keys.has(k) ||
        k.startsWith('admin') ||
        k.startsWith('seller') ||
        k.startsWith('buyer') ||
        k.startsWith('pageSeo') ||
        k === 'cart' ||
        k === 'favorites' ||
        k === 'theme'
      ) {
        keys.add(k);
      }
    }
  } catch (_) {}
  keys.forEach((k) => {
    try {
      const v = localStorage.getItem(k);
      if (v != null) data[k] = v;
    } catch (_) {}
  });
  return {
    version: STORAGE_VERSION,
    exportedAt: new Date().toISOString(),
    app: 'pirahanemardane-front',
    data,
  };
}

/**
 * ورود پشتیبان — replace=true همه کلیدهای فایل را می‌نویسد
 * @returns {{ ok: boolean, count: number, message?: string }}
 */
export function importClientBackup(payload, { replace = true } = {}) {
  if (typeof window === 'undefined' || !storageAvailable()) {
    return { ok: false, count: 0, message: 'localStorage در دسترس نیست' };
  }
  try {
    const obj = typeof payload === 'string' ? JSON.parse(payload) : payload;
    const data = obj?.data && typeof obj.data === 'object' ? obj.data : obj;
    if (!data || typeof data !== 'object') {
      return { ok: false, count: 0, message: 'فرمت پشتیبان نامعتبر است' };
    }
    let count = 0;
    Object.keys(data).forEach((k) => {
      if (typeof data[k] !== 'string') {
        try {
          localStorage.setItem(k, JSON.stringify(data[k]));
          count += 1;
        } catch (_) {}
        return;
      }
      try {
        localStorage.setItem(k, data[k]);
        count += 1;
      } catch (_) {}
    });
    localStorage.setItem(VERSION_KEY, String(obj.version || STORAGE_VERSION));
    return { ok: true, count, message: replace ? 'پشتیبان بازیابی شد' : 'ادغام شد' };
  } catch (e) {
    return { ok: false, count: 0, message: 'خواندن فایل پشتیبان ناموفق بود' };
  }
}

export function downloadBackupFile(filename = 'pirahanemardane-backup.json') {
  const backup = exportClientBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return backup;
}
