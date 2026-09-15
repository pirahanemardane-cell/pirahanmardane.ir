# فاز ۶ — Rate Limit

## تغییرات
- سقف OTP و لاگین سخت‌تر شد
- OTP verify از rateLimitAsync استفاده می‌کند (Upstash → DB → حافظه)
- پاسخ 429 در OTP verify درست برگردانده می‌شود

## سقف‌های مهم
| کلید | حد | پنجره |
|------|-----|--------|
| otp_phone | 4 | 15 دقیقه |
| otp_ip | 12 | 15 دقیقه |
| otp_verify_phone | 10 | 15 دقیقه |
| otp_verify_ip | 25 | 15 دقیقه |
| login_id | 8 | 15 دقیقه |
| login_ip | 20 | 15 دقیقه |

## توصیه
برای چند instance ورسل، Upstash را در Environment Variables ست کنید تا rate-limit بین سرورها مشترک باشد.
