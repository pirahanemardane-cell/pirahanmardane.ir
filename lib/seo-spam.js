/**
 * P0 — گارد اسپم سئو برای محتوای فروشنده
 */

// نیم‌فاصله فارسی (U+200C / ZWNJ) عمداً خارج است — در فارسی عادی و صحیح است.
// فقط فاصلهٔ صفرعرض، ZWJ، علامت‌های جهت، bidi override، word joiner و BOM مسدود می‌شوند.
const SUSPICIOUS_HIDDEN = /[\u200B\u200D\u200E\u200F\u202A-\u202E\u2060\uFEFF]/g;
const ZW_CHARS = SUSPICIOUS_HIDDEN;

export function stripHiddenChars(text) {
  return String(text || '').replace(ZW_CHARS, '');
}

export function normalizeFa(text) {
  return stripHiddenChars(text)
    .replace(/\u064A/g, '\u06CC')
    .replace(/\u0643/g, '\u06A9')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordList(text) {
  return normalizeFa(text)
    .split(/[^\p{L}\p{N}]+/u)
    .map((w) => w.trim())
    .filter((w) => w.length > 1);
}

export function checkSellerSeoSpam({
  name = '',
  desc = '',
  seoTitle = '',
  seoDescription = '',
  seoFocusKeywords = '',
  maxKeywords = 3,
} = {}) {
  const errors = [];
  const warnings = [];
  const plain = normalizeFa(`${name} ${desc} ${seoTitle} ${seoDescription}`);
  const words = wordList(plain);
  const title = normalizeFa(seoTitle || name);
  const meta = normalizeFa(seoDescription);
  const keys = String(seoFocusKeywords || '')
    .split(/[,،\n]+/)
    .map((k) => normalizeFa(k))
    .filter(Boolean)
    .slice(0, maxKeywords);

  if (SUSPICIOUS_HIDDEN.test(String(name || '') + String(desc || '') + String(seoTitle || '') + String(seoDescription || '') + String(seoFocusKeywords || ''))) {
    errors.push('کاراکتر نامرئی در متن شناسایی شد (مشکوک به پنهان‌کاری)');
  }

  if (title.length > 70) errors.push('عنوان سئو بیش از ۷۰ کاراکتر است');
  if (meta.length > 170) errors.push('توضیحات متا بیش از ۱۷۰ کاراکتر است');

  if (keys.length > maxKeywords) {
    errors.push(`حداکثر ${maxKeywords} کلمه کلیدی برای فروشنده مجاز است`);
  }

  const freq = {};
  words.forEach((w) => {
    const k = w.toLowerCase();
    freq[k] = (freq[k] || 0) + 1;
  });
  const total = words.length || 1;
  Object.entries(freq).forEach(([w, c]) => {
    if (c >= 8 && c / total > 0.12 && w.length > 2) {
      errors.push(`تکرار غیرعادی واژه «${w}» (احتمال کیورد استافینگ)`);
    }
  });

  keys.forEach((key) => {
    if (!key) return;
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(escaped, 'gi');
    const inTitle = (title.match(re) || []).length;
    const inBody = (plain.match(re) || []).length;
    if (inTitle > 3) errors.push(`کلیدواژه «${key}» در عنوان بیش از حد تکرار شده`);
    if (inBody > 15) errors.push(`کلیدواژه «${key}» در متن بیش از حد تکرار شده`);
    if (inBody === 0 && plain.length > 40) {
      warnings.push(`کلیدواژه «${key}» در متن محصول نیامده`);
    }
  });

  if (plain.length < 40 && (seoTitle || seoFocusKeywords)) {
    warnings.push('متن محصول کوتاه است؛ برای سئو حداقل چند جمله توضیح بنویسید');
  }

  if ((plain.match(/!/g) || []).length > 8) {
    warnings.push('تعداد علامت تعجب غیرعادی است');
  }
  if ((plain.match(/[A-Z]{6,}/g) || []).length > 2) {
    warnings.push('حروف بزرگ لاتین پشت‌سرهم مشکوک است');
  }

  return { ok: errors.length === 0, errors, warnings };
}

export function minPublishSeoScore(score, min = 35) {
  return Number(score) >= min;
}
