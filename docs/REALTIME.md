# Realtime سراسری — پیراهن مردانه

## هدف
بدون استثنا: تغییر در دیتابیس → همه کلاینت‌های متصل (خریدار / فروشنده / ادمین) از طریق رویداد به‌روز می‌شوند.

## معماری (سه لایه)

1. **Supabase Realtime** (`lib/realtime/supabase-live.js`)  
   `postgres_changes` روی جداول حیاتی → رویدادهای `pm:db` و `pm:invalidate`

2. **لایه تب‌محلی** (موجود در `App.jsx`)  
   BroadcastChannel + localStorage برای هم‌گام‌سازی فوری همان مرورگر

3. **سرور**  
   بعد از write، `invalidateCatalogCache()` کش API را پاک می‌کند

## راه‌اندازی Supabase (الزامی یک‌بار)

1. Dashboard → **Database** → **Publications** → `supabase_realtime`
2. یا SQL Editor: اجرای فایل `sql/realtime-publication.sql`
3. **Authentication** → اطمینان از RLS؛ Realtime فقط ردیف‌هایی را می‌فرستد که policy SELECT اجازه دهد

## رویدادهای فرانت

| رویداد | detail |
|--------|--------|
| `pm:db` | `{ table, event, row, old, scope }` |
| `pm:invalidate` | `{ scope, table, event }` |
| `pm:realtime-status` | `{ status }` مثل SUBSCRIBED |

`scope`: `catalog` | `orders` | `sellers` | `notifications` | `cart` | `settings`

## محدودیت‌ها (صادقانه)

- کاربر آفلاین تا اتصال بعدی نمی‌بیند
- RLS اگر SELECT ندهد، رویداد آن ردیف به آن کاربر نمی‌رسد (امنیت درست است)
- تیکت اگر جدول جدا با نام دیگر داشته باشد باید به `REALTIME_TABLES` اضافه شود
