# فاز ۸ — مشاهده‌پذیری

## تغییرات کد
- /api/health: region، commit کوتاه، rate_limit_backend، و logCritical هنگام شکست
- lib/critical-log.js: درج تمیزتر در critical_logs
- sql/critical-logs.sql: ساخت جدول لاگ

## کار دستی شما در سوپابیس (یک‌بار)
1. SQL Editor را باز کنید
2. محتوای فایل sql/critical-logs.sql را اجرا کنید

## مانیتورینگ پیشنهادی بعد از این فاز
- هر ۱–۵ دقیقه GET /api/health
- اگر status=503 یا ok=false → هشدار
- در پنل ادمین مسیر errors / critical_logs را گاه‌به‌گاه ببینید
