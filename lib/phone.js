/**
 * رقم فارسی/عربی → انگلیسی + نرمال موبایل ایران
 */
export function toEnglishDigits(input = "") {
  const s = String(input ?? "");
  const map = {
    "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
    "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
    "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
    "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
  };
  return s.replace(/[۰-۹٠-٩]/g, (ch) => map[ch] || ch);
}

export function normalizeIranMobile(input = "") {
  let d = toEnglishDigits(input).replace(/\D/g, "");
  if (d.startsWith("98") && d.length >= 12) d = "0" + d.slice(2);
  if (d.startsWith("9") && d.length === 10) d = "0" + d;
  return d;
}

export function isValidIranMobile(input = "") {
  return /^09\d{9}$/.test(normalizeIranMobile(input));
}
