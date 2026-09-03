# مدل داده — فروشگاه پیراهن مردانه

منبع حقیقت: **Supabase (Postgres)**. فرانت فعلاً پروتوتایپ است و به‌تدریج به این مدل وصل می‌شود.

## نقش‌ها (roles)

| نقش | توضیح |
|-----|--------|
| `buyer` | خریدار |
| `seller` | فروشنده (نیاز به رکورد `sellers` تأییدشده) |
| `admin` | مدیر کل |

نقش در `profiles.role` و در صورت نیاز claim سفارشی Auth.

## وضعیت‌های کلیدی

### سفارش (`orders.status`)
`pending_payment` → `paid` → `preparing` → `shipped` → `delivered`  
شاخه‌ها: `cancelled` | `returned` | `refunded`

### محصول (`products.status`)
`draft` | `pending` | `active` | `rejected` | `inactive`

### تیکت (`tickets.status`)
`open` | `pending` | `closed`

### فروشنده (`sellers.status`)
`pending` | `approved` | `suspended` | `rejected`

## موجودیت‌های اصلی

```
auth.users
  └── profiles (1:1)
        ├── sellers (0..1) ── products ── product_variants
        ├── addresses
        ├── carts / cart_items
        ├── orders / order_items
        ├── wishlists
        └── tickets / ticket_messages

categories, brands
blog_posts
coupons
reviews
```

## اصل امنیتی
- RLS از روز اول روشن است.
- نوشتن سفارش / موجودی / تسویه فقط با session معتبر یا service role سمت سرور.
- کلاینت مستقیم به جدول‌های حساس با دسترسی باز وصل نمی‌شود.
