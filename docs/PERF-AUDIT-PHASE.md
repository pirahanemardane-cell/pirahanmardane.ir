# Performance audit — فاز پایه (۲۰۲۶-۰۸-۳۰)

## انجام‌شده
- `withCatalogCache` روی GETهای catalog
- `revalidate` / Cache-Control روی پاسخ‌های عمومی
- تصاویر WebP + thumb از مسیر upload
- ایندکس‌های SQL پیشنهادی در `performance-indexes.sql` / docs

## روش تکرار (Lighthouse)
1. Chrome Incognito → https://pirahanmardane.ir
2. DevTools → Lighthouse → Mobile
3. ثبت LCP / CLS / TBT در جدول زیر هر ماه

| تاریخ | LCP | CLS | یادداشت |
|-------|-----|-----|---------|
| (پس از لانچ) | — | — | پر شود |

## حکم این فاز
پایه engineering بسته است؛ audit ماهانه ops است نه blocker کد.
