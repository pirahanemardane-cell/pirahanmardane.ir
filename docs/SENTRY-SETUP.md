# Sentry (اختیاری)

1. حساب Sentry بساز و DSN بگیر
2. در Vercel:
   - SENTRY_DSN=...
   - NEXT_PUBLIC_SENTRY_DSN=...
3. npm i @sentry/nextjs --save
4. فایل‌های sentry.*.config.js در ریشه پروژه هستند
5. بدون DSN هیچ‌چیز ارسال نمی‌شود (no-op امن)

اگر پکیج نصب نباشد، این فایل‌ها را commit نکن یا dynamic import استفاده کن.
