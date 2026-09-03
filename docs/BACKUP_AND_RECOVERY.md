# بک‌آپ و بازیابی — پیراهن مردانه

## ۱) دیتابیس (Supabase)
- Dashboard → Project Settings → Database → Backups
- قبل از تغییر بزرگ: Export CSV جداول مهم
- اولویت: profiles, orders, order_items, products, payments, addresses, sellers

## ۲) کد
- GitHub + `git tag backup-YYYYMMDD`

## ۳) Env
- از Vercel در password manager؛ service_role را commit نکن

## ۴) بازیابی
1. clone + env
2. در صورت نیاز restore بک‌آپ Supabase
3. `npm ci && npm run build` + دیپلوی

## ۵) مانیتور
```bash
curl -s https://YOUR_HOST/api/health
```
انتظار: `"ok": true`
