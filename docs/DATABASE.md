# Database Design — Overview

منبع حقیقت: جداول Supabase در حال استفاده در APIها.

## جداول اصلی (منطقی)
| جدول | کاربرد |
|------|--------|
| profiles | کاربر، نقش، phone |
| sellers | فروشگاه، شبا، وضعیت، owner_id |
| products | کالا، seller_id، status، category |
| orders | سفارش، user_id، status، مبالغ |
| order_items | اقلام، seller_id، order_id |
| order_returns | مرجوعی |
| carts / cart_items | سبد |
| tickets | پشتیبانی / اختلاف |
| payouts (در صورت وجود) | تسویه فروشنده |

## ایندکس‌های اعمال‌شده (performance-indexes.sql)
- orders(user_id, created_at), (status, created_at), order_number, paid_at
- order_items(seller_id), (order_id), (seller_id, order_id)
- products(status, created_at), (seller_id, status), category_id, title trgm/lower
- sellers(owner_id), status, slug
- profiles(phone), carts, tickets, order_returns

## قوانین عملی
- soft-archive فروشنده (نه حذف سخت بدون سیاست)
- ownership: فروشنده فقط ردیف‌های خودش
- admin از service role با گارد نقش

## Constraints پیشنهادی بعدی (اختیاری SQL)
- FK واضح order_items.order_id → orders.id
- چک status با enum یا check constraint در migration رسمی
- unique phone در profiles در صورت سیاست محصول

اجرای constraint جدید فقط با backup و در پنجره کم‌ترافیک.
