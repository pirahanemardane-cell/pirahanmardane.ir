# Observability

## الان
- Vercel Runtime Logs
- lib/critical-log → DB + SMS ادمین (وقتی SMS فعال)
- Analytics در صورت فعال بودن پنل Vercel

## حداقل عملیاتی
1. هر خطای ۵۰۰ در OTP/orders/payments → logCritical
2. کرون order-reminders را هفتگی دستی یک‌بار smoke تست کن
3. هشدار دستی: اگر error rate در Vercel بالا رفت

## بعدی (اختیاری وقتی بودجه)
- Sentry یا معادل
- آلرت Slack/تلگرام روی critical
