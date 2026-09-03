# Security audit — فاز soft-launch (۲۰۲۶-۰۸-۳۰)

## پوشش انجام‌شده در کد
- [x] Secrets فقط در Vercel (نه گیت) — `.gitleaks.toml`
- [x] Admin / seller guards روی APIهای حساس
- [x] Rate limit روی auth/OTP/orders (سیاست‌های `lib/rate-limit`)
- [x] RLS/نقش در Supabase (اسکما موجود)
- [x] Previewهای `*.vercel.app` همیشه noindex
- [x] Upload تصویر: سقف حجم + تبدیل سرور (Sharp) نه ذخیرهٔ خام بی‌حد

## باقی‌ماندهٔ آگاهانه (خارج از این فاز)
- Penetration test شخص ثالث
- Bug bounty
- چرخش دوره‌ای کلید R2/SMS

## حکم این فاز
برای soft-launch با mock SMS/پرداخت: **ممیزی پایه پاس**؛ ممیزی خارجی قبل از scale.
