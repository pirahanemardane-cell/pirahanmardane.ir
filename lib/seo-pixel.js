/** اندازه‌گیری تقریبی عرض عنوان/توضیح در نتایج گوگل */

export function stripHtmlSeo(html) {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const SEO_PX_LIMITS = {
  titleDesktop: 600,
  titleMobile: 560,
  descDesktop: 960,
  descMobile: 680,
};

export const SEO_FONTS = {
  titleDesktop: "400 20px arial, sans-serif",
  titleMobile: "400 16px arial, sans-serif",
  descDesktop: "400 14px arial, sans-serif",
  descMobile: "400 12px arial, sans-serif",
};

export function measureSeoPx(text, font) {
  const str = String(text || "");
  if (typeof document === "undefined") {
    const avg = /20px|18px|16px/i.test(font) ? 9.2 : 7.0;
    return Math.ceil(str.length * avg);
  }
  try {
    if (!measureSeoPx._canvas) measureSeoPx._canvas = document.createElement("canvas");
    const ctx = measureSeoPx._canvas.getContext("2d");
    if (!ctx) return Math.ceil(str.length * 8);
    ctx.font = font;
    return Math.ceil(ctx.measureText(str).width);
  } catch (_) {
    return Math.ceil(str.length * 8);
  }
}

export function seoPixelReport(val, kind) {
  const text = String(val || "");
  const deskLim = kind === "title" ? SEO_PX_LIMITS.titleDesktop : SEO_PX_LIMITS.descDesktop;
  const mobLim = kind === "title" ? SEO_PX_LIMITS.titleMobile : SEO_PX_LIMITS.descMobile;
  const deskPx = measureSeoPx(text, kind === "title" ? SEO_FONTS.titleDesktop : SEO_FONTS.descDesktop);
  const mobPx = measureSeoPx(text, kind === "title" ? SEO_FONTS.titleMobile : SEO_FONTS.descMobile);
  const chars = text.length;
  const statusOf = (px, lim) => {
    if (!chars) return "empty";
    const ratio = px / lim;
    if (ratio > 1) return "over";
    if (ratio < 0.45) return "short";
    if (ratio > 0.92) return "near";
    return "ok";
  };
  const dKey = statusOf(deskPx, deskLim);
  const mKey = statusOf(mobPx, mobLim);
  const worst = [dKey, mKey].includes("over")
    ? "over"
    : [dKey, mKey].includes("short")
      ? "short"
      : [dKey, mKey].includes("near")
        ? "near"
        : chars
          ? "ok"
          : "empty";
  const tone =
    worst === "over"
      ? "text-red-300"
      : worst === "short" || worst === "near"
        ? "text-amber-600"
        : worst === "ok"
          ? "text-emerald-600"
          : "text-primary-400";
  const label = !chars
    ? `خالی · هدف دسکتاپ ≤${deskLim}px`
    : `دسکتاپ ${deskPx}/${deskLim}px · موبایل ${mobPx}/${mobLim}px · ${chars} نویسه`;
  return {
    chars,
    deskPx,
    mobPx,
    deskLim,
    mobLim,
    deskRatio: Math.min(1.25, deskPx / Math.max(1, deskLim)),
    mobRatio: Math.min(1.25, mobPx / Math.max(1, mobLim)),
    deskOver: deskPx > deskLim,
    mobOver: mobPx > mobLim,
    tone,
    label,
    worst,
  };
}

export function seoCharHint(val, min, max) {
  const kind = max != null && max <= 70 ? "title" : "desc";
  const r = seoPixelReport(val, kind);
  return { n: r.chars, tone: r.tone, label: r.label, report: r };
}
