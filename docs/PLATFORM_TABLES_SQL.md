# جداول پلتفرم — اجرا در Supabase SQL Editor

فایل migration:

`supabase/migrations/20260828000000_platform_tables.sql`

محتوای کامل همان فایل را در **SQL Editor** اجرا کنید.

## جداول جدید
- user_notifications
- shipping_methods
- site_settings
- blog_categories
- seller_payout_requests
- admin_audit_logs

## ستون‌های جدید sellers
- kyc_status, sheba_status, location_status, national_id, discount_quota

## profiles
- deleted_at, is_super_admin

## APIهای جدید
- GET/POST/DELETE `/api/shipping-methods`
- GET/PUT `/api/site-settings`
- GET/POST `/api/coupons` و PATCH/DELETE `/api/coupons/[id]`
- GET `/api/admin/audit`
- GET/POST/PATCH `/api/seller/payouts`
- POST `/api/account/delete`
- GET/POST `/api/blog/categories`
