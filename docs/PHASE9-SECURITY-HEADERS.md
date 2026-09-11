# فاز ۹ — هدرهای امنیتی

## اضافه‌شده / تقویت‌شده
- Permissions-Policy: payment=()
- Cross-Origin-Opener-Policy: same-origin
- Cross-Origin-Resource-Policy: cross-origin
- CSP: object-src 'none' + upgrade-insecure-requests
- noindex همچنان فعال (soft-launch)

## بررسی بعد از دیپلوی
در مرورگر DevTools → Network → سند HTML → Response Headers:
- Strict-Transport-Security
- Content-Security-Policy
- X-Frame-Options
- X-Robots-Tag
