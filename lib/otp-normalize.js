/**
 * نرمال‌سازی شماره و کد OTP — جلوگیری از false negative
 */
export function toEnglishDigits(input) {
  const s = String(input ?? '');
  const fa = '۰۱۲۳۴۵۶۷۸۹';
  const ar = '٠١٢٣٤٥٦٧٨٩';
  let out = '';
  for (const ch of s) {
    const iFa = fa.indexOf(ch);
    if (iFa >= 0) { out += String(iFa); continue; }
    const iAr = ar.indexOf(ch);
    if (iAr >= 0) { out += String(iAr); continue; }
    out += ch;
  }
  return out;
}

/** فقط ارقام انگلیسی، بدون فاصله */
export function normalizeOtpCode(input) {
  return toEnglishDigits(input).replace(/\D/g, '');
}

/**
 * نرمال موبایل ایران → 09xxxxxxxxx
 */
export function normalizeIranPhone(input) {
  let d = toEnglishDigits(input).replace(/\D/g, '');
  if (d.startsWith('0098')) d = d.slice(4);
  if (d.startsWith('98') && d.length >= 12) d = d.slice(2);
  if (d.startsWith('9') && d.length === 10) d = '0' + d;
  if (d.length === 10 && d.startsWith('9')) d = '0' + d;
  // 98912... → 0912...
  if (d.startsWith('98') && d.length === 12) d = '0' + d.slice(2);
  return d;
}

export function otpCodesEqual(a, b) {
  const x = normalizeOtpCode(a);
  const y = normalizeOtpCode(b);
  if (!x || !y) return false;
  return x === y;
}
