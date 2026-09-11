# استخراج توابع خالص از App.jsx (قدم ۱–۱۴)

هدف: کم‌کردن حجم `components/App.jsx` بدون شکستن UI/state.

## فایل‌های lib ساخته/گسترش‌یافته

| فایل | نقش |
|------|-----|
| `lib/format-digits.js` | ارقام فارسی/انگلیسی، موبایل، isAdminPhone |
| `lib/breadcrumbs.js` | normalizeBreadcrumbs |
| `lib/user-link-guard.js` | جلوگیری از لینک کاربر |
| `lib/product-codes.js` | پیشوند فروشگاه، کد محصول، findByCode |
| `lib/ticket-chat.js` | کمک‌توابع چت/تیکت |
| `lib/ticket-code.js` | generateTicketCode |
| `lib/download-blob.js` | دانلود فایل |
| `lib/size-guide.js` | جدول سایز + suggestSizeFromHeightWeight |
| `lib/search-normalize.js` | جستجو و امتیاز |
| `lib/product-attrs.js` | پارچه/آستین/یقه |
| `lib/import-csv.js` | CSV ایمپورت |
| `lib/product-export.js` | بک‌آپ/CSV محصول |
| `lib/site-content.js` | features/stats/nav/OWN_SELLER/GA4 key |
| `lib/product-variants.js` | ماتریس واریانت |
| `lib/scroll-page-to-top.js` | اسکرول بالا |
| `lib/toast-variant.js` | classifyToastVariant |
| `lib/share-utils.js` | share/copy |
| `lib/catalog-map.js` | mapCatalogRow / seller UI map |
| `lib/app-constants.js` | COMPARE_MAX, RT_*, PAGE_LOAD_LABELS |
| `lib/category-key.js` | normalizeCategoryKey |
| `lib/default-seo-config.js` | defaultSeoConfig |
| `lib/default-shipping-methods.js` | روش‌های ارسال پیش‌فرض |

## خارج از محدودهٔ ایمن فعلی
- شکستن کامل handlers داخل App (سبد، ناوبری، پنل ادمین/فروشنده)
- جدا کردن JSX بزرگ بدون تست دستی گسترده

## Node
`engines.node` و `.nvmrc` روی **22.x** تنظیم شد.
