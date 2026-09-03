# نقشه اتصال بک‌اند — پیراهن مردانه (pirahanemardane.ir)

## اولویت‌ها
1. **ایمنی (RLS + service_role فقط برای عملیات حساس)**
2. **بدون باگ (سیاست‌های ناقص = خطای runtime)**
3. **استاندارد مرحله‌ای**

## انجام‌شده
- [x] اسکما + RLS پایه
- [x] Auth / پروفایل / آدرس / کاتالوگ
- [x] Wishlist + تیکت API
- [x] سبد + سفارش + پرداخت (mock + اسکلت زرین‌پال)
- [x] **سخت‌سازی RLS** `20260822000000_rls_harden_cart_orders_tickets.sql`
  - order_items: insert فقط روی سفارش خودِ کاربر با status=pending_payment
  - orders: کاربر فقط cancel در pending_payment (نه paid)
  - tickets update + ticket_messages insert برای شرکت‌کنندگان
  - paid شدن فقط با SERVICE_ROLE در verify

## کار فوری شما در پنل Supabase
فایل migration جدید را در **SQL Editor** اجرا کنید:
`supabase/migrations/20260822000000_rls_harden_cart_orders_tickets.sql`

و مطمئن شوید در `.env.local` هست:
- `SUPABASE_SERVICE_ROLE_KEY` (فقط سرور — هرگز در فرانت)

## بعدی (بعد از اجرای migration)
- اتصال کنترل‌شدهٔ UI سبد/تسویه به API (با حفظ session کوکی)
- پنل فروشنده/ادمین روی DB
- OTP بعد از تأیید پترن
- ZARINPAL_MERCHANT_ID برای پرداخت واقعی
