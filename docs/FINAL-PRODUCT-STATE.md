# وضعیت نهایی محصول (بدون درگاه)

## بسته شده در فازهای ۱–۱۵
- امنیت سشن ادمین، rate limit، هدرها
- تست critical/security
- health + critical_logs + rate_limit_buckets
- محدودیت‌های DB
- آنالیتیکس قیف + login/sign_up
- UX اولویت ۱–۳
- حذف حساب + دانلود داده کاربر
- requireAdminSensitive روی عملیات حساس
- error boundary
- بستن نشت سفارش فروشنده
- اصلاح HTML پروفایل

## خارج از محدوده (عمدی)
- درگاه پرداخت واقعی
- شکستن کامل App.jsx
- MFA اجباری login-password (فعلاً false در کد)

## قبل از ترافیک عمومی
- CRON_SECRET در Vercel
- OTP_MOCK مطابق واقعیت SMS
- noindex تا آماده ایندکس
