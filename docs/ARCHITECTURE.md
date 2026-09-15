# Technical Architecture — pirahanmardane.ir

## Stack
- Frontend/Backend: Next.js 15 App Router (Route Handlers)
- DB/Auth: Supabase (Postgres + Auth)
- Hosting: Vercel
- CDN/DNS/SSL: Cloudflare (proxied)
- SMS layer: lib/sms/* (Melipayamak-ready, mockable)
- Storage: Supabase Storage و/یا R2 adapter

## لایه‌ها
```
Browser → Cloudflare → Vercel (Next.js)
                ↓
         Supabase Auth + Postgres
                ↓
         lib/* (otp, sms, rate-limit, catalog-cache, critical-log, seller-accounting)
```

## ماژول‌های کلیدی
| مسیر | نقش |
|------|-----|
| app/api/auth/* | OTP، login، profile |
| app/api/orders/* | ثبت و وضعیت سفارش |
| app/api/payments/* | initiate/verify (mockable) |
| app/api/seller/* | سفارش، payout، export، محصول |
| app/api/admin/* | مدیریت |
| app/api/cron/* | یادآوری سفارش |
| lib/sms | patterns, send, events |
| lib/seller-accounting | CSV کمیسیون/خالص |

## امنیت معماری
- Service role فقط سمت سرور
- Admin guard روی API ادمین
- Rate-limit روی نقاط حساس
- CF Bypass برای API و پنل

## مقیاس (عمداً بعداً)
صف، replica، worker جدا، search engine — تا ترافیک واقعی نه
