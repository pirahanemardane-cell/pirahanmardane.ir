# امنیت Secretها

## Gitleaks (قبل از commit)

```bash
brew install gitleaks
gitleaks git .
```

با pre-commit:

```bash
brew install pre-commit
pre-commit install
```

فایل `.pre-commit-config.yaml` در ریشه پروژه است.

## قوانین

- هرگز `SUPABASE_SERVICE_ROLE_KEY`، رمز ملی‌پیامک، `ZARINPAL_MERCHANT_ID` را در کد commit نکنید.
- فقط در Vercel Environment Variables / `.env.local` (gitignored).
- `.env*` در `.gitignore` باشد.
