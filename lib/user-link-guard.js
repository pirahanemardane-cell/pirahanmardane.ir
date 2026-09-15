/** ممنوعیت لینک برای خریدار و فروشنده — استخراج از App.jsx قدم ۲ */

export const USER_LINK_RE = /(?:https?:\/\/|www\.|\/\/)|(?:\b[a-z0-9][a-z0-9-]{0,61}[a-z0-9]?\.(?:com|ir|net|org|io|co|me|info|app|dev|shop|store|xyz|online|site|link|blog|cloud|pro|tv|cc|biz|ai|eu|uk|de|fr|ca|us)\b)|(?:\b(?:t\.me|telegram\.me|instagram\.com|ig\.me|wa\.me|chat\.whatsapp\.com|youtu\.be|youtube\.com|twitter\.com|x\.com|linkedin\.com|facebook\.com|fb\.me|tiktok\.com|threads\.net|bit\.ly|cutt\.ly|rb\.gy|goo\.gl|eitaa\.com|splus\.ir|ble\.ir|rubika\.ir)\/[^\s]*)|(?:\[url\b|href\s*=|src\s*=)|(?:@\w{3,})/i;

export function textContainsForbiddenLink(text) {
  const t = String(text || "");
  if (!t.trim()) return false;
  if (USER_LINK_RE.test(t)) return true;
  if (/(?:^|[\s(])[a-z0-9-]+\.(?:com|ir|net|org)\//i.test(t)) return true;
  return false;
}

export function assertNoUserLinks(text, opts = {}) {
  if (opts.allowAdmin) return { ok: true, text: String(text || "") };
  if (textContainsForbiddenLink(text)) {
    return {
      ok: false,
      error:
        opts.message ||
        "ارسال هرگونه لینک، آدرس وب، یا شناسه شبکه‌های اجتماعی مجاز نیست.",
    };
  }
  return { ok: true, text: String(text || "") };
}

export function stripLinksForDisplay(text) {
  return String(text || "")
    .replace(/https?:\/\/[^\s]+/gi, "[لینک حذف‌شده]")
    .replace(/\bwww\.[^\s]+/gi, "[لینک حذف‌شده]");
}
