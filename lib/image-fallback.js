/** لوگوی تم و fallback تصاویر شکسته */

export function logoForTheme() {
  try {
    const dark = document.documentElement.classList.contains("dark");
    return dark ? "/blue_w_bg.webp" : "/red_w_bg.webp";
  } catch (_) {
    return "/red_w_bg.webp";
  }
}

export function onProductImgError(e) {
  const el = e.target;
  if (!el || el.tagName !== "IMG") return;
  if (el.dataset.pmLogoFallback === "1") return;
  if (el.closest("header, footer, .site-header, .site-footer")) return;
  const src = el.getAttribute("src") || "";
  if (/red_w_bg\.webp|blue_w_bg\.webp|favicon|apple-touch|icon-192|icon-512/i.test(src)) {
    el.dataset.pmLogoFallback = "1";
    return;
  }
  el.dataset.pmLogoFallback = "1";
  el.classList.add("img-broken");
  el.src = logoForTheme();
}
