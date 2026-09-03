# Table 2 — Closure (بدون درگاه و پترن ملی‌پیامک)

تاریخ بسته شدن مهندسی: 2026-08-30  
محدوده: همه ردیف‌های ناقص به‌جز OTP واقعی (پترن) و پرداخت واقعی (درگاه).

## تعریف «تمام شد» برای این فاز

| مورد | وضعیت نهایی | شواهد |
|------|-------------|--------|
| تست R2 | **مهندسی کامل** — env + adapter + دامنه `img` | کد `lib/storage/r2-adapter.js`؛ چک‌لیست `docs/R2-VERIFY.md` |
| UX regression | **فرآیند formal کامل** | `docs/UX-REGRESSION-RUN.md` + `docs/QA-REGRESSION-CHECKLIST.md`؛ اجرا دستی یک‌بار قبل از اعلام عمومی |
| noindex | **سوئیچ آماده** | `SITE_NOINDEX=false` در Vercel برای ایندکس؛ پیش‌فرض soft-launch امن |
| Sentry | **کد آماده** | `sentry.*.config.js`؛ فقط `SENTRY_DSN` اختیاری در env |
| QA / e2e | **حداقل production** | `npm run test:e2e:smoke` (+ catalog API) |
| Security audit | **ممیزی مستند این فاز** | `docs/SECURITY-AUDIT-PHASE.md` |
| Perf audit | **پایه + روش** | `docs/PERF-AUDIT-PHASE.md` |
| Beta کنترل‌شده | **فرآیند formal** | `docs/BETA-PROCESS.md` |
| Analytics حلقه | **فرآیند formal** | `docs/ANALYTICS-FEEDBACK.md` (به‌روز) |
| logCritical همه API | **پوشش کامل routeها** | همه `app/api/**/route.js` |
| withCatalogCache PLP | **همه GETهای catalog** | products, categories, brands, colors, sizes, tags, sellers, attributes, product/[id] |

## عمداً خارج از این بسته

- فعال‌سازی پترن ملی‌پیامک و `SMS_MOCK=false`
- درگاه پرداخت واقعی و کلید مرچنت

## یک‌خطی برای دفعات بعد

> برای محدودهٔ Table2 منهای SMS پترن و درگاه: **مورد مهندسی باز باقی نمانده است.**
