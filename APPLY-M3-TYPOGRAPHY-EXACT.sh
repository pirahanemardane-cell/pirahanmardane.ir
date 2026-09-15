#!/bin/bash
set -euo pipefail
PROJECT_DIR="/Users/mac/Documents/Projects/Pirahanmardane/Pirahanemardaneir-pro"
cd "$PROJECT_DIR"

if [ ! -f package.json ] || [ ! -d app ]; then
  echo "❌ فولدر پروژه پیدا نشد: $(pwd)"
  exit 1
fi

echo "✅ پروژه: $(pwd)"
echo "🔒 فقط تایپوگرافی Material 3 طبق جدول دقیق شما — رنگ‌ها دست نخورده"

CSS="app/globals.css"
if [ ! -f "$CSS" ]; then
  echo "❌ app/globals.css پیدا نشد"
  exit 1
fi

STAMP=$(date +%Y%m%d-%H%M%S)
cp "$CSS" "app/globals.css.backup-typography-${STAMP}"
echo "📦 بک‌آپ: app/globals.css.backup-typography-${STAMP}"

python3 << 'PY'
from pathlib import Path
import re

css_path = Path("app/globals.css")
text = css_path.read_text(encoding="utf-8")

NEW_TYPO = r'''
/* === TYPOGRAPHY SCALE — Material 3 EXACT (جدول کاربر) === */
/* یک منبع حقیقت | لایت و دارک یکسان | فقط اندازه/وزن/line-height/letter-spacing */
/* پایه: html { font-size: 16px } → 1rem = 16px */

:root {
  /* ---- DISPLAY ---- */
  --fs-display-lg: 3.5625rem;   /* 57px */
  --lh-display-lg: 4rem;        /* 64px */
  --fw-display-lg: 400;
  --ls-display-lg: -0.25px;

  --fs-display-md: 2.8125rem;   /* 45px */
  --lh-display-md: 3.25rem;     /* 52px */
  --fw-display-md: 400;
  --ls-display-md: 0px;

  --fs-display-sm: 2.25rem;     /* 36px */
  --lh-display-sm: 2.75rem;     /* 44px */
  --fw-display-sm: 400;
  --ls-display-sm: 0px;

  /* ---- HEADLINE ---- */
  --fs-headline-lg: 2rem;       /* 32px → H1 */
  --lh-headline-lg: 2.5rem;     /* 40px */
  --fw-headline-lg: 400;
  --ls-headline-lg: 0px;

  --fs-headline-md: 1.75rem;    /* 28px → H2 */
  --lh-headline-md: 2.25rem;    /* 36px */
  --fw-headline-md: 400;
  --ls-headline-md: 0px;

  --fs-headline-sm: 1.5rem;     /* 24px → H3 */
  --lh-headline-sm: 2rem;       /* 32px */
  --fw-headline-sm: 400;
  --ls-headline-sm: 0px;

  /* ---- TITLE ---- */
  --fs-title-lg: 1.375rem;      /* 22px → H4 / Title Large */
  --lh-title-lg: 1.75rem;       /* 28px */
  --fw-title-lg: 500;
  --ls-title-lg: 0px;

  --fs-title-md: 1rem;          /* 16px → H5 / Title Medium */
  --lh-title-md: 1.5rem;        /* 24px */
  --fw-title-md: 500;
  --ls-title-md: 0.15px;

  --fs-title-sm: 0.875rem;      /* 14px → H6 / Title Small */
  --lh-title-sm: 1.25rem;       /* 20px */
  --fw-title-sm: 500;
  --ls-title-sm: 0.1px;

  /* ---- BODY ---- */
  --fs-body-lg: 1rem;           /* 16px */
  --lh-body-lg: 1.5rem;         /* 24px */
  --fw-body-lg: 400;
  --ls-body-lg: 0.15px;

  --fs-body-md: 0.875rem;       /* 14px */
  --lh-body-md: 1.25rem;        /* 20px */
  --fw-body-md: 400;
  --ls-body-md: 0.25px;

  --fs-body-sm: 0.75rem;        /* 12px */
  --lh-body-sm: 1rem;           /* 16px */
  --fw-body-sm: 400;
  --ls-body-sm: 0.4px;

  /* ---- LABEL ---- */
  --fs-label-lg: 0.875rem;      /* 14px — دکمه‌ها / Navigation / Chip */
  --lh-label-lg: 1.25rem;       /* 20px */
  --fw-label-lg: 500;
  --ls-label-lg: 0.1px;

  --fs-label-md: 0.75rem;       /* 12px */
  --lh-label-md: 1rem;          /* 16px */
  --fw-label-md: 500;
  --ls-label-md: 0.5px;

  --fs-label-sm: 0.6875rem;     /* 11px */
  --lh-label-sm: 1rem;          /* 16px */
  --fw-label-sm: 500;
  --ls-label-sm: 0.5px;

  /* ---- Lead / Quote special ---- */
  --fs-lead: 1.125rem;          /* 18px */
  --lh-lead: 1.75rem;           /* 28px */
  --fw-lead: 400;
  --ls-lead: 0px;

  /* ---- Alias برای سازگاری با کد موجود ---- */
  --fs-h1: var(--fs-headline-lg);
  --lh-h1: var(--lh-headline-lg);
  --fw-h1: var(--fw-headline-lg);
  --ls-h1: var(--ls-headline-lg);

  --fs-h2: var(--fs-headline-md);
  --lh-h2: var(--lh-headline-md);
  --fw-h2: var(--fw-headline-md);
  --ls-h2: var(--ls-headline-md);

  --fs-h3: var(--fs-headline-sm);
  --lh-h3: var(--lh-headline-sm);
  --fw-h3: var(--fw-headline-sm);
  --ls-h3: var(--ls-headline-sm);

  --fs-h4: var(--fs-title-lg);
  --lh-h4: var(--lh-title-lg);
  --fw-h4: var(--fw-title-lg);
  --ls-h4: var(--ls-title-lg);

  --fs-h5: var(--fs-title-md);
  --lh-h5: var(--lh-title-md);
  --fw-h5: var(--fw-title-md);
  --ls-h5: var(--ls-title-md);

  --fs-h6: var(--fs-title-sm);
  --lh-h6: var(--lh-title-sm);
  --fw-h6: var(--fw-title-sm);
  --ls-h6: var(--ls-title-sm);

  --fs-body: var(--fs-body-lg);
  --lh-body: var(--lh-body-lg);
  --fw-body: var(--fw-body-lg);
  --ls-body: var(--ls-body-lg);

  --fs-label: var(--fs-label-lg);
  --lh-label: var(--lh-label-lg);
  --fw-label: var(--fw-label-lg);
  --ls-label: var(--ls-label-lg);

  --fs-btn: var(--fs-label-lg);
  --lh-btn: var(--lh-label-lg);
  --fw-btn: var(--fw-label-lg);
  --ls-btn: var(--ls-label-lg);

  --fs-caption: var(--fs-body-sm);
  --lh-caption: var(--lh-body-sm);
  --ls-caption: var(--ls-body-sm);
  --fs-meta: var(--fs-body-sm);
  --lh-meta: var(--lh-body-sm);
  --ls-meta: var(--ls-body-sm);
  --fs-nav: var(--fs-label-lg);
  --lh-nav: var(--lh-label-lg);
  --ls-nav: var(--ls-label-lg);

  --fs-price: var(--fs-body-lg);
  --lh-price: var(--lh-body-lg);
  --fw-price: 500;
  --ls-price: var(--ls-body-lg);

  --fs-price-sale: var(--fs-headline-sm);
  --lh-price-sale: var(--lh-headline-sm);

  --fs-display: var(--fs-display-sm);
  --lh-display: var(--lh-display-sm);
}

/* Display طبق M3 — بدون تغییر در بریک‌پوینت‌ها (ثابت) */
@media (min-width: 1024px) {
  :root {
    --fs-display-lg: 3.5625rem;
    --lh-display-lg: 4rem;
    --fs-display-md: 2.8125rem;
    --lh-display-md: 3.25rem;
    --fs-display-sm: 2.25rem;
    --lh-display-sm: 2.75rem;
    --fs-headline-lg: 2rem;
    --lh-headline-lg: 2.5rem;
    --fs-headline-md: 1.75rem;
    --lh-headline-md: 2.25rem;
    --fs-headline-sm: 1.5rem;
    --lh-headline-sm: 2rem;
  }
}

html { font-size: 16px; -webkit-text-size-adjust: 100%; }

body {
  font-size: var(--fs-body-lg) !important;
  line-height: var(--lh-body-lg) !important;
  font-weight: var(--fw-body-lg);
  letter-spacing: var(--ls-body-lg);
}

h1, .h1 {
  font-size: var(--fs-headline-lg) !important;
  font-weight: var(--fw-headline-lg) !important;
  line-height: var(--lh-headline-lg) !important;
  letter-spacing: var(--ls-headline-lg) !important;
}
h2, .h2 {
  font-size: var(--fs-headline-md) !important;
  font-weight: var(--fw-headline-md) !important;
  line-height: var(--lh-headline-md) !important;
  letter-spacing: var(--ls-headline-md) !important;
}
h3, .h3 {
  font-size: var(--fs-headline-sm) !important;
  font-weight: var(--fw-headline-sm) !important;
  line-height: var(--lh-headline-sm) !important;
  letter-spacing: var(--ls-headline-sm) !important;
}
h4, .h4 {
  font-size: var(--fs-title-lg) !important;
  font-weight: var(--fw-title-lg) !important;
  line-height: var(--lh-title-lg) !important;
  letter-spacing: var(--ls-title-lg) !important;
}
h5, .h5 {
  font-size: var(--fs-title-md) !important;
  font-weight: var(--fw-title-md) !important;
  line-height: var(--lh-title-md) !important;
  letter-spacing: var(--ls-title-md) !important;
}
h6, .h6 {
  font-size: var(--fs-title-sm) !important;
  font-weight: var(--fw-title-sm) !important;
  line-height: var(--lh-title-sm) !important;
  letter-spacing: var(--ls-title-sm) !important;
}

.text-xs  { font-size: var(--fs-label-sm) !important; line-height: var(--lh-label-sm) !important; letter-spacing: var(--ls-label-sm) !important; }
.text-sm  { font-size: var(--fs-body-md)  !important; line-height: var(--lh-body-md)  !important; letter-spacing: var(--ls-body-md)  !important; }
.text-base{ font-size: var(--fs-body-lg)  !important; line-height: var(--lh-body-lg)  !important; letter-spacing: var(--ls-body-lg)  !important; }
.text-lg  { font-size: var(--fs-title-md) !important; line-height: var(--lh-title-md) !important; letter-spacing: var(--ls-title-md) !important; }
.text-xl  { font-size: var(--fs-title-lg) !important; line-height: var(--lh-title-lg) !important; letter-spacing: var(--ls-title-lg) !important; }
.text-2xl { font-size: var(--fs-headline-sm) !important; line-height: var(--lh-headline-sm) !important; letter-spacing: var(--ls-headline-sm) !important; }
.text-3xl { font-size: var(--fs-headline-md) !important; line-height: var(--lh-headline-md) !important; letter-spacing: var(--ls-headline-md) !important; }
.text-4xl,
.text-5xl,
.text-6xl { font-size: var(--fs-headline-lg) !important; line-height: var(--lh-headline-lg) !important; letter-spacing: var(--ls-headline-lg) !important; }

.text-\[10px\], .text-\[11px\] { font-size: var(--fs-label-sm) !important; line-height: var(--lh-label-sm) !important; letter-spacing: var(--ls-label-sm) !important; }
.text-\[12px\], .text-\[13px\] { font-size: var(--fs-body-sm)  !important; line-height: var(--lh-body-sm)  !important; letter-spacing: var(--ls-body-sm)  !important; }
.text-\[14px\], .text-\[15px\] { font-size: var(--fs-body-md)  !important; line-height: var(--lh-body-md)  !important; letter-spacing: var(--ls-body-md)  !important; }
.text-\[16px\], .text-\[17px\] { font-size: var(--fs-body-lg)  !important; line-height: var(--lh-body-lg)  !important; letter-spacing: var(--ls-body-lg)  !important; }
.text-\[18px\], .text-\[19px\] { font-size: var(--fs-lead) !important; line-height: var(--lh-lead) !important; letter-spacing: var(--ls-lead) !important; }
.text-\[20px\], .text-\[21px\], .text-\[22px\] { font-size: var(--fs-title-lg) !important; line-height: var(--lh-title-lg) !important; letter-spacing: var(--ls-title-lg) !important; }
.text-\[24px\], .text-\[26px\] { font-size: var(--fs-headline-sm) !important; line-height: var(--lh-headline-sm) !important; letter-spacing: var(--ls-headline-sm) !important; }
.text-\[28px\], .text-\[30px\], .text-\[32px\] { font-size: var(--fs-headline-md) !important; line-height: var(--lh-headline-md) !important; letter-spacing: var(--ls-headline-md) !important; }
.text-\[36px\], .text-\[40px\], .text-\[44px\], .text-\[48px\] { font-size: var(--fs-display-sm) !important; line-height: var(--lh-display-sm) !important; letter-spacing: var(--ls-display-sm) !important; }
.text-\[57px\] { font-size: var(--fs-display-lg) !important; line-height: var(--lh-display-lg) !important; letter-spacing: var(--ls-display-lg) !important; }

button,
[type="button"],
[type="submit"],
[type="reset"],
[role="button"],
.btn,
.btn-primary,
.btn-secondary,
.btn-outline,
.btn-ghost,
.btn-tonal {
  font-size: var(--fs-label-lg) !important;
  line-height: var(--lh-label-lg) !important;
  font-weight: var(--fw-label-lg) !important;
  letter-spacing: var(--ls-label-lg) !important;
}

label,
.form-label,
.field-label {
  font-size: var(--fs-label-lg) !important;
  line-height: var(--lh-label-lg) !important;
  font-weight: var(--fw-label-lg) !important;
  letter-spacing: var(--ls-label-lg) !important;
}
.helper-text,
.hint,
.form-hint,
.field-hint,
.supporting-text {
  font-size: var(--fs-body-sm) !important;
  line-height: var(--lh-body-sm) !important;
  font-weight: var(--fw-body-sm) !important;
  letter-spacing: var(--ls-body-sm) !important;
}
.error-text,
.form-error,
.field-error,
[role="alert"] {
  font-size: var(--fs-body-md) !important;
  line-height: var(--lh-body-md) !important;
  letter-spacing: var(--ls-body-md) !important;
}

nav a,
.nav-link,
.menu-item,
.breadcrumb,
.breadcrumb a {
  font-size: var(--fs-label-lg) !important;
  line-height: var(--lh-label-lg) !important;
  letter-spacing: var(--ls-label-lg) !important;
}

.chip,
.badge,
.tag,
.size-chip {
  font-size: var(--fs-label-md) !important;
  line-height: var(--lh-label-md) !important;
  font-weight: var(--fw-label-md) !important;
  letter-spacing: var(--ls-label-md) !important;
}

.caption,
.meta,
.metadata,
.product-meta,
.card-meta {
  font-size: var(--fs-body-sm) !important;
  line-height: var(--lh-body-sm) !important;
  letter-spacing: var(--ls-body-sm) !important;
}

.price,
.product-price,
.price-original,
.price-sale {
  font-size: var(--fs-price) !important;
  line-height: var(--lh-price) !important;
  font-weight: var(--fw-price) !important;
  letter-spacing: var(--ls-price) !important;
}
.price-sale {
  font-size: var(--fs-price-sale) !important;
  line-height: var(--lh-price-sale) !important;
}

[role="tab"],
.tab,
.tab-label {
  font-size: var(--fs-label-lg) !important;
  line-height: var(--lh-label-lg) !important;
  font-weight: var(--fw-label-lg) !important;
  letter-spacing: var(--ls-label-lg) !important;
}

[role="dialog"] h1,
[role="dialog"] h2,
.dialog-title,
.modal-title {
  font-size: var(--fs-title-lg) !important;
  line-height: var(--lh-title-lg) !important;
  font-weight: var(--fw-title-lg) !important;
  letter-spacing: var(--ls-title-lg) !important;
}

.tooltip,
[role="tooltip"],
.snackbar,
.toast,
.sonner-toast {
  font-size: var(--fs-body-md) !important;
  line-height: var(--lh-body-md) !important;
  letter-spacing: var(--ls-body-md) !important;
}

input,
textarea,
select,
.input,
[contenteditable="true"] {
  font-size: var(--fs-body-lg) !important;
  line-height: var(--lh-body-lg) !important;
  font-weight: var(--fw-body-lg) !important;
  letter-spacing: var(--ls-body-lg) !important;
}
input::placeholder,
textarea::placeholder {
  font-size: inherit;
  line-height: inherit;
  letter-spacing: inherit;
}

th {
  font-size: var(--fs-title-sm) !important;
  line-height: var(--lh-title-sm) !important;
  font-weight: var(--fw-title-sm) !important;
  letter-spacing: var(--ls-title-sm) !important;
}
td {
  font-size: var(--fs-body-md) !important;
  line-height: var(--lh-body-md) !important;
  letter-spacing: var(--ls-body-md) !important;
}

p a, li a, article a {
  font-size: inherit;
  line-height: inherit;
  font-weight: 500;
  letter-spacing: inherit;
}

.display-lg, .text-display-lg {
  font-size: var(--fs-display-lg) !important;
  line-height: var(--lh-display-lg) !important;
  font-weight: var(--fw-display-lg) !important;
  letter-spacing: var(--ls-display-lg) !important;
}
.display-md, .text-display-md {
  font-size: var(--fs-display-md) !important;
  line-height: var(--lh-display-md) !important;
  font-weight: var(--fw-display-md) !important;
  letter-spacing: var(--ls-display-md) !important;
}
.display-sm, .text-display-sm {
  font-size: var(--fs-display-sm) !important;
  line-height: var(--lh-display-sm) !important;
  font-weight: var(--fw-display-sm) !important;
  letter-spacing: var(--ls-display-sm) !important;
}

.lead, .lead-paragraph, blockquote {
  font-size: var(--fs-lead) !important;
  line-height: var(--lh-lead) !important;
  font-weight: var(--fw-lead) !important;
  letter-spacing: var(--ls-lead) !important;
}

/* === END Material 3 Typography === */
'''

pattern = re.compile(
    r'/\*\s*===\s*TYPOGRAPHY SCALE.*?(?=\n/\*\s*==========|\n@font-face|\n/\*\s*IRANYekan|\nhtml\s*\{|\Z)',
    re.DOTALL | re.IGNORECASE
)

if pattern.search(text):
    text = pattern.sub(NEW_TYPO.strip() + "\n\n", text, count=1)
    print("✅ بلوک TYPOGRAPHY SCALE جایگزین شد.")
else:
    tw = re.search(r'@tailwind utilities;', text)
    if tw:
        insert_at = tw.end()
        text = text[:insert_at] + "\n\n" + NEW_TYPO.strip() + "\n" + text[insert_at:]
        print("✅ بلوک تایپوگرافی بعد از @tailwind utilities اضافه شد.")
    else:
        text = text.rstrip() + "\n\n" + NEW_TYPO.strip() + "\n"
        print("✅ بلوک تایپوگرافی به انتهای globals.css اضافه شد.")

if not re.search(r'html\s*\{\s*font-size:\s*16px', text):
    text = re.sub(
        r'html\s*\{[^}]*\}',
        'html { font-size: 16px; -webkit-text-size-adjust: 100%; }',
        text,
        count=1
    )

css_path.write_text(text, encoding="utf-8")
print("✅ app/globals.css به‌روزرسانی شد.")
print("📏 مقیاس دقیق جدول شما اعمال شد (لایت و دارک یکسان).")
PY

echo ""
echo "🔍 بررسی سریع توکن‌های جدید..."
grep -n "fs-headline-lg\|fs-body-lg\|fs-label-lg\|fs-title-lg\|ls-display-lg\|500\|57px\|32px\|14px" app/globals.css | head -25 || true

echo ""
echo "📤 کامیت و پوش به GitHub..."
git add app/globals.css APPLY-M3-TYPOGRAPHY-EXACT.sh
git status --short

git commit -m "typography: apply exact Material 3 scale from user table (weights + letter-spacing)" || {
  echo "⚠️ چیزی برای کامیت نبود یا قبلاً کامیت شده."
}

BRANCH=$(git rev-parse --abbrev-ref HEAD)
git push origin "$BRANCH"

echo ""
echo "✅ تمام شد."
echo "   Vercel به‌صورت خودکار بیلد جدید می‌گیرد."
echo "   بک‌آپ محلی: app/globals.css.backup-typography-*"
echo ""
echo "مقیاس اعمال‌شده (دقیق طبق جدول شما):"
echo "  Display Large   57/64/400  letter-spacing: -0.25px"
echo "  Display Medium  45/52/400"
echo "  Display Small   36/44/400"
echo "  Headline Large  32/40/400  ← H1"
echo "  Headline Medium 28/36/400  ← H2"
echo "  Headline Small  24/32/400  ← H3"
echo "  Title Large     22/28/500  ← H4"
echo "  Title Medium    16/24/500  ← H5  (0.15px)"
echo "  Title Small     14/20/500  ← H6  (0.1px)"
echo "  Body Large      16/24/400  (0.15px)"
echo "  Body Medium     14/20/400  (0.25px)"
echo "  Body Small      12/16/400  (0.4px)"
echo "  Label Large     14/20/500  ← دکمه‌ها / Nav (0.1px)"
echo "  Label Medium    12/16/500  (0.5px)"
echo "  Label Small     11/16/500  (0.5px)"
echo "  Lead / Quote    18/28/400"
echo ""
echo "رنگ‌های لایت و دارک هیچ تغییری نکرده‌اند."
