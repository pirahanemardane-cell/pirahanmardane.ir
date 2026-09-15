/** جدول راهنمای سایز پیش‌فرض */

export const SIZE_GUIDE_TABLE = [
  { size: "S", chest: "۹۶", waist: "۸۴", length: "۷۲" },
  { size: "M", chest: "۱۰۰", waist: "۸۸", length: "۷۴" },
  { size: "L", chest: "۱۰۴", waist: "۹۲", length: "۷۶" },
  { size: "XL", chest: "۱۱۰", waist: "۹۸", length: "۷۸" },
  { size: "XXL", chest: "۱۱۶", waist: "۱۰۴", length: "۸۰" },
];

export const ALL_SIZES = ["S", "M", "L", "XL", "XXL"];

/** پیشنهاد سایز از قد (سانتی‌متر) و وزن (کیلو) */
export function suggestSizeFromHeightWeight(height, weight) {
  const h = Number(height);
  const w = Number(weight);
  if (!h || !w) return null;
  if (h < 170 || w < 65) return "S";
  if (h < 178 && w < 78) return "M";
  if (h < 185 && w < 88) return "L";
  if (h < 192 && w < 98) return "XL";
  return "XXL";
}
