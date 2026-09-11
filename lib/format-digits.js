/** ارقام و موبایل — استخراج‌شده از App.jsx (قدم ۱ رفکتور) */

export function toFa(n) {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
}

/** ارقام فارسی/عربی → انگلیسی */
export function toEnDigits(s) {
  return String(s ?? "")
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

export function onlyDigits(v) {
  return toEnDigits(v).replace(/\D/g, "");
}

/** یکسان‌سازی موبایل ایران: +98... / 98... / 9... → 09xxxxxxxxx */
export function normalizeIranMobile(v) {
  let d = onlyDigits(v);
  if (d.startsWith("0098")) d = d.slice(4);
  if (d.startsWith("98") && d.length >= 12) d = "0" + d.slice(2);
  if (d.length === 10 && d.startsWith("9")) d = "0" + d;
  return d;
}
