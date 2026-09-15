/** اشتراک‌گذاری و کپی لینک صفحه */

export function getPageShareUrl() {
  try {
    return typeof window !== "undefined" ? window.location.href : "";
  } catch {
    return "";
  }
}

export async function copyTextSilent(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  ta.remove();
  return true;
}

export async function nativeShare(title, text, url) {
  const u = url || getPageShareUrl();
  try {
    if (navigator.share) {
      await navigator.share({ title: title || document.title, text: text || "", url: u });
      return "shared";
    }
    await copyTextSilent(u);
    return "copied";
  } catch (_) {
    return "failed";
  }
}
