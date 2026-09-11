# چک‌لیست قبل از وصل درگاه پرداخت

وضعیت فعلی: OTP کار می‌کند · Realtime کار می‌کند · پرداخت هنوز mock · noindex

## امنیت
- [x] سشن ادمین محدود به ۲ ساعت (ADMIN_SESSION_MAX_AGE_SEC=7200)
- [x] چک انقضای سشن ادمین فعال است
- [ ] در Vercel متغیر ADMIN_SESSION_MAX_AGE_SEC روی Production ست شده
- [ ] بیلد بعد از فاز ۱ در Vercel سبز است
- [ ] بدون لاگین، APIهای /api/admin/* پاسخ 401/403 می‌دهند

## تست
- [ ] `npx playwright test e2e/critical.spec.js` سبز است
- [ ] صفحه اصلی بدون خطای ۵۰۰ باز می‌شود
- [ ] /api/health سالم است
- [ ] کاتالوگ محصولات پاسخ می‌دهد

## پرداخت (بعد از دریافت درگاه)
- [ ] ZARINPAL_MERCHANT_ID در Vercel ست شود
- [ ] PAYMENT_MOCK=false فقط بعد از تست موفق در staging
- [ ] verify: تطبیق مبلغ + authority + idempotency
- [ ] تست end-to-end یک سفارش واقعی در staging

## OTP / SMS
- [x] OTP در حالت فعلی کار می‌کند
- [ ] قبل از ترافیک واقعی: rate-limit و مانیتورینگ تحویل SMS بررسی شود

## داده
- [ ] RLS روی orders / sellers / profiles یک‌بار در Supabase مرور شود
- [ ] backup سوپابیس قبل از فعال‌سازی درگاه

## لانچ
- [ ] noindex تا تکمیل و پایدار شدن درگاه باقی بماند
- [ ] بعد از پایدار شدن: حذف noindex + مانیتورینگ خطا و پرداخت
