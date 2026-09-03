# QA Regression Checklist (دستی)

محیط: production یا preview با داده تست

## Auth
- [ ] OTP request (mock یا واقعی)
- [ ] login-password صحیح / غلط
- [ ] تغییر موبایل پروفایل

## خریدار
- [ ] PLP فیلتر و جستجو
- [ ] افزودن سبد و ثبت سفارش
- [ ] جزئیات سفارش و مرجوعی

## فروشنده
- [ ] ساخت/ویرایش محصول + تصویر
- [ ] تغییر وضعیت سفارش + tracking
- [ ] CSV دانلود (all / paid / pending)
- [ ] تغییر شبا

## ادمین
- [ ] لیست sellers و archive
- [ ] سفارش ادمین
- [ ] تیکت

## زیرساخت
- [ ] curl /api/health → DYNAMIC
- [ ] cron با CRON_SECRET → ok
- [ ] بعد از edit محصول، PLP داده تازه

## منفی
- [ ] buyer به API seller/export دسترسی ندارد
- [ ] بدون auth → 401
