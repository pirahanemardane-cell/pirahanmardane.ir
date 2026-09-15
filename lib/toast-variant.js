/** تشخیص variant پیام toast از متن فارسی */

export function classifyToastVariant(text, type = "info") {
  const t = String(text || "");
  const ty = String(type || "info");
  if (ty === "error") return "error";
  if (ty === "success" || ty === "order") return "success";
  if (ty === "cart") return /اضافه|افزود/.test(t) ? "success" : "default";
  if (ty === "warning") return "error";
  if (ty === "system") return /موفق|نصب شد/.test(t) ? "success" : "default";
  if (/خطا|نامعتبر|مجاز نیست|رد شد|شکست|ناموفق|اجباری|الزامی|پیدا نشد|مسدود/.test(t)) return "error";
  if (
    /موفق|ثبت شد|تأیید|تایید|ارسال شد|ذخیره|کپی شد|به‌روز|بازگردانی|دانلود|منتشر|فعال شد|انجام شد|خوش آمدید|اضافه شد|افزوده|پرداخت موفق|نصب شد|باز شد|تعطیل شد|غیرفعال شد|آماده‌سازی|رهگیری/.test(
      t
    )
  )
    return "success";
  return "default";
}
