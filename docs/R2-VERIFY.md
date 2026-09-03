# R2 — تأیید نهایی

## پیش‌نیاز (انجام‌شده)
- Bucket: `product-images`
- Custom domain: `img.pirahanmardane.ir` (Access Enabled)
- Env در Vercel: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL=https://img.pirahanmardane.ir`
- Redeploy بعد از env

## تست پذیرش (۲ دقیقه)
1. ورود فروشنده → محصول → آپلود تصویر
2. URL برگشتی باید با `https://img.pirahanmardane.ir/` شروع شود
3. باز کردن URL در تب ناشناس → تصویر دیده شود
4. در Cloudflare R2 → Objects → فایل موجود باشد

## معیار پاس
هر چهار مورد بالا = R2 برای production بسته است.

ریشهٔ `https://img.pirahanmardane.ir/` همیشه 404 می‌دهد (بدون object) و طبیعی است.
