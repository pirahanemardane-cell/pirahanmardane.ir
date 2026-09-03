# SMS روی Vercel

در **Vercel → Project → Settings → Environment Variables** (Production + Preview):

| Key | توضیح |
|-----|--------|
| `MELLI_USERNAME` | نام کاربری پنل ملی‌پیامک |
| `MELLI_PASSWORD` | رمز API |
| `MELLI_PATTERN_CODE` | کد پترن (مثلاً `521601`) |

بعد از ذخیره، **Redeploy** لازم است.

بدون این‌ها: در production ممکن است OTP ارسال نشود؛ در dev کد ممکن است در لاگ سرور باشد.

جزئیات: `docs/MELLI_PAYAMAK_SETUP.md`
