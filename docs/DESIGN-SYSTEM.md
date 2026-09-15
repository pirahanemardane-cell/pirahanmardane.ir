# Design System (عملی) — از UI موجود

سند formal بر اساس الگوهای فعلی UI (نه Figma جدا).

## اصول
- RTL فارسی
- تم لایت / دارک
- موبایل‌اول برای فروشگاه؛ پنل‌ها responsive

## رنگ‌های پرتکرار (کلاس‌های Tailwind)
- primary: primary-800 / primary-900
- accent: apple-blue / emerald برای موفقیت
- سطح تیره پنل: #2A2C30
- موفقیت فروشنده: #4CCD99

## تیپوگرافی
- متن UI فارسی؛ اعداد قابل toFa در پنل‌ها

## کامپوننت‌های کلیدی (کد)
- components/ui/table
- پنل‌ها: SellerPanel, SellerPanelContent, Admin*
- کارت محصول PLP/PDP
- دکمه خروجی حسابداری CSV در تب سفارش فروشنده

## Spacing / Radius
- دکمه‌ها: rounded-full برای chip/فیلتر
- کارت‌ها: radius متوسط Tailwind پیش‌فرض پروژه

## حالت‌ها
- loading / empty / error در لیست سفارش و کاتالوگ باید یکدست بمانند

به‌روزرسانی این سند هنگام تغییر توکن رنگ اصلی.
