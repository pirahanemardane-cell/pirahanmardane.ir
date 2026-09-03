# ملی‌پیامک + ورود فقط OTP

## جریان ورود
1. شماره موبایل → `POST /api/auth/otp/request`
2. کد پیامک → `POST /api/auth/otp/verify` (اگر کاربر قبلی باشد وارد می‌شود)
3. کاربر جدید → مرحله نام → `POST /api/auth/otp/complete`

## Vercel Environment Variables
```
OTP_MOCK=false
MELLI_USERNAME=نام‌کاربری_پنل
MELLI_PASSWORD=رمز_API
MELLI_PATTERN_CODE=521601
```

تا وقتی `OTP_MOCK=true` (یا خالی) است پیامک واقعی ارسال نمی‌شود و `debug_code` برمی‌گردد.

## پیش‌نیاز
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (برای ساخت سشن بعد از OTP)
