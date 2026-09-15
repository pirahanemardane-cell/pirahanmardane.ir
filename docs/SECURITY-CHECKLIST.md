# Security Checklist

## انجام‌شده
- [x] Secrets در Vercel نه در گیت
- [x] Admin guard
- [x] Rate-limit OTP / login / orders / pay-initiate
- [x] Service role فقط سرور
- [x] CF Bypass برای /api و پنل
- [x] Always Use HTTPS (CF)
- [x] critical-log روی مسیرهای حیاتی

## قبل از لانچ عمومی (دستی)
- [ ] OTP_MOCK=false فقط بعد از پترن
- [ ] PAYMENT mock خاموش بعد از درگاه
- [ ] مرور RLS policies در Supabase برای tables حساس
- [ ] چرخش کلیدهای لو‌رفته احتمالی
- [ ] محدودیت CORS اگر API عمومی اضافه شد

## هدرها
vercel.json headers برای استاتیک؛ API no-store ترجیحاً از route
