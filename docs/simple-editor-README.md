# Simple Editor (بدون لینک، عکس و فیلم)

این پروژه یک ادیتور مبتنی بر `@atlaskit/editor-core` است که قابلیت‌های زیر از آن حذف شده‌اند:

- لینک‌گذاری (Hyperlink + Smart Links)
- عکس و فیلم (Media Plugin)
- پشتیبانی کامل از HTML خام

## نصب

```bash
npm install
# یا
yarn
```

سپس حتماً dedupe انجام دهید:

```bash
npx yarn-deduplicate
# یا
npm dedupe
```

## اجرا

```bash
npm run dev
```

سپس به آدرس `http://localhost:3000` بروید.

## نکات مهم

- از React 18 استفاده کنید (React 19 هنوز پشتیبانی کامل ندارد).
- بعد از نصب پکیج‌ها حتماً `dedupe` بزنید تا مشکل نسخه‌های تکراری ProseMirror حل شود.
- این ادیتور فقط قابلیت‌های پایه‌ای متن (bold, italic, list, heading, code block و ...) را دارد.
