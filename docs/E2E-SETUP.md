# E2E smoke (Playwright)

```bash
cd /Users/mac/Pirahanemardaneir-pro
npm i -D @playwright/test
npx playwright install chromium
npx playwright test
```

اختیاری در CI (GitHub Actions) بعداً؛ فعلاً لوکال:

```bash
PLAYWRIGHT_BASE_URL=https://pirahanmardane.ir npx playwright test
```
