# Gitleaks — local + GitHub Actions (واقعی)

## Local
```bash
brew install gitleaks pre-commit
pre-commit install
gitleaks git . --verbose
```

## CI واقعی (داخل ریپو)
فایل: `.github/workflows/ci.yml`
- Job `gitleaks` با `gitleaks/gitleaks-action@v2` روی هر push/PR به main
- اگر Secret پیدا شود، workflow **قرمز** می‌شود و merge/build متوقف است
- Job `build` بعد از سبز شدن gitleaks اجرا می‌شود

بعد از push به GitHub → تب Actions را ببین.
