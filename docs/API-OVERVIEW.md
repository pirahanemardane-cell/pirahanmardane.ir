# API Overview

پایه: app/api/**/route.js

## Auth
- POST /api/auth/otp/request
- POST /api/auth/otp/verify|complete
- POST /api/auth/login-password
- PATCH /api/auth/profile
- POST /api/auth/password

## Orders & Pay
- POST /api/orders
- PATCH /api/orders/[id] · seller/orders · admin/orders
- POST /api/orders/[id]/return
- POST /api/payments/initiate · verify

## Seller
- /api/seller/me · products · orders · payouts
- GET /api/seller/export/orders?format=csv|json

## Admin
- /api/admin/orders · sellers · products · stats · errors

## Cron
- GET/POST /api/cron/order-reminders (Bearer CRON_SECRET)

## حساس (env)
- OTP_MOCK / SMS_MOCK — تا فعال‌سازی provider
- PAYMENT mock — تا درگاه
