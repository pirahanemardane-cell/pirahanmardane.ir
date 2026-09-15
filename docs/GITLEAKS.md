# Gitleaks — جلوگیری از Commit شدن Secret

ریپوی رسمی: https://github.com/gitleaks/gitleaks

## یک‌بار روی لپ‌تاپ (macOS)

```bash
brew install gitleaks pre-commit
cd مسیر/پروژه   # ریشهٔ همین ریپو
pre-commit install
```

## اسکن دستی کل تاریخچه / وضعیت فعلی

```bash
gitleaks git . --verbose
# یا فقط فایل‌های staged:
gitleaks protect --staged --verbose --redact
```

## قبل از هر Commit (خودکار)

با `pre-commit install`، hook از فایل `.pre-commit-config.yaml` فعال می‌شود.  
اگر Secret پیدا شود، **Commit متوقف** می‌شود تا آن را از کد حذف کنی.

## GitHub Actions (CI)

فایل `.github/workflows/ci.yml` روی هر push/PR به `main`:
1. Job `gitleaks` با `gitleaks/gitleaks-action@v2`
2. اگر Secret باشد → workflow قرمز
3. Job `build` فقط بعد از سبز شدن gitleaks

## قوانین پروژه

- هرگز `.env` و کلید واقعی را Commit نکن
- فقط `.env.example` / `.env.local.example` در گیت باشد
- تنظیمات نادیده (allowlist) در `.gitleaks.toml`
