#!/bin/bash
# فقط دارک: هر #023047 → #13ABC4 | لایت دست نخورده
set -e
cd /Users/mac/Documents/Projects/Pirahanmardane/Pirahanemardaneir-pro

if [ ! -f package.json ] || [ ! -d app ]; then
  echo "❌ فولدر پروژه پیدا نشد: $(pwd)"
  exit 1
fi

echo "✅ پروژه: $(pwd)"
echo "🎨 فقط حالت دارک: #023047 → #13ABC4 (لایت دست نخورده)"

python3 << 'PY'
from pathlib import Path
import re

ROOT = Path(".")
css_path = ROOT / "app" / "globals.css"
if not css_path.exists():
    raise SystemExit("❌ app/globals.css پیدا نشد")

text = css_path.read_text(encoding="utf-8")
original = text

def patch_dark_block_values(s: str) -> str:
    lines = s.splitlines(keepends=True)
    out = []
    i = 0
    n = len(lines)

    def is_dark_selector_line(line: str) -> bool:
        t = line.strip()
        if "html:not()" in t:
            return False
        if re.search(r"(?:^|[,+\s>]|html)(?:\|html\|\[data-theme=[\"']dark[\"']\])", t):
            return True
        if t.startswith("") or t.startswith("html:not()"):
            return True
        return False

    while i < n:
        line = lines[i]
        if "{" in line and is_dark_selector_line(line):
            block = [line]
            depth = line.count("{") - line.count("}")
            i += 1
            while i < n and depth > 0:
                block.append(lines[i])
                depth += lines[i].count("{") - lines[i].count("}")
                i += 1
            block_text = "".join(block)
            protected = []
            def protect(m):
                protected.append(m.group(0))
                return f"__PROT{len(protected)-1}__"
            tmp = re.sub(
                r'\[[^\]]*(?:023047)[^\]]*\]',
                protect,
                block_text,
                flags=re.IGNORECASE,
            )
            tmp = re.sub(r"#023047\b", "#13ABC4", tmp, flags=re.IGNORECASE)
            for idx, frag in enumerate(protected):
                tmp = tmp.replace(f"__PROT{idx}__", frag)
            out.append(tmp)
            continue
        out.append(line)
        i += 1
    return "".join(out)

text = patch_dark_block_values(text)

def patch_dark_css_vars(s: str) -> str:
    pattern = re.compile(
        r"((?:html\|\|\[data-theme=[\"']dark[\"']\])[^{]*\{)(.*?)(\n\})",
        re.DOTALL,
    )
    def sub_block(m):
        head, body, tail = m.group(1), m.group(2), m.group(3)
        body2 = re.sub(r"#023047\b", "#13ABC4", body, flags=re.IGNORECASE)
        return head + body2 + tail
    return pattern.sub(sub_block, s)

text = patch_dark_css_vars(text)

FORCE_BLOCK = r"""

/* ==========================================================================
   FORCE DARK: هر #023047 در حالت دارک → #13ABC4 (بلا استثنا)
   لایت دست نخورده می‌ماند — این بلاک فقط html:not() /  را هدف می‌گیرد
   ========================================================================== */
html:not() [class*="bg-[#023047]"],
html:not() [class*="bg-\[#023047\]"],
html:not() [class*="bg-[#023047]/"],
html:not() .bg-\[\#023047\],
html:not() button[class*="bg-[#023047]"],
html:not() a[class*="bg-[#023047]"],
html:not() [style*="#023047"],
html:not() [style*="023047"] {
  background-color: #13ABC4 !important;
  background: #13ABC4 !important;
  border-color: #13ABC4 !important;
}

html:not() [class*="text-[#023047]"],
html:not() [class*="text-\[#023047\]"],
html:not() .text-\[\#023047\],
html:not() [class*="text-[#023047]/"] {
  color: #13ABC4 !important;
  -webkit-text-fill-color: #13ABC4 !important;
}

html:not() [class*="border-[#023047]"],
html:not() [class*="border-\[#023047\]"],
html:not() [class*="ring-[#023047]"],
html:not() [class*="ring-\[#023047\]"],
html:not() [class*="outline-[#023047]"] {
  border-color: #13ABC4 !important;
  --tw-ring-color: rgba(19, 171, 196, 0.45) !important;
  outline-color: #13ABC4 !important;
}

html:not() [class*="from-[#023047]"],
html:not() [class*="to-[#023047]"],
html:not() [class*="via-[#023047]"] {
  --tw-gradient-from: #13ABC4 !important;
  --tw-gradient-to: #13ABC4 !important;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
}

/* متغیرهای باقی‌مانده داخل دارک */
html:not(),
,
 {
  --pm-brand-red: #13ABC4;
  --pm-brand-red- #0D91A7;
  --pm-brand-red-darker: #087F91;
  --color-apple-blue: #13ABC4;
  --color-grok-orange: #13ABC4;
}
"""

marker = "FORCE DARK: هر #023047 در حالت دارک"
if marker not in text:
    text = text.rstrip() + "\n" + FORCE_BLOCK + "\n"
else:
    print("  ℹ️ بلاک FORCE از قبل بود — بازنویسی نشد")

if text != original:
    css_path.write_text(text, encoding="utf-8")
    print("  ✓ app/globals.css به‌روز شد (فقط دارک)")
else:
    print("  ℹ️ globals.css تغییری لازم نداشت (یا از قبل ok بود)")

exts = {".jsx", ".js", ".tsx", ".ts", ".css", ".mjs"}
skip_dirs = {"node_modules", ".git", ".next", "dist", "build", "coverage", "e2e"}
changed_files = []

dark_patterns = [
    (re.compile(r"bg-\[#023047\]", re.I), "bg-[#13ABC4]"),
    (re.compile(r"text-\[#023047\]", re.I), "text-[#13ABC4]"),
    (re.compile(r"border-\[#023047\]", re.I), "border-[#13ABC4]"),
    (re.compile(r"ring-\[#023047\]", re.I), "ring-[#13ABC4]"),
    (re.compile(r"from-\[#023047\]", re.I), "from-[#13ABC4]"),
    (re.compile(r"to-\[#023047\]", re.I), "to-[#13ABC4]"),
    (re.compile(r"via-\[#023047\]", re.I), "via-[#13ABC4]"),
    (re.compile(r"outline-\[#023047\]", re.I), "outline-[#13ABC4]"),
    (re.compile(r"fill-\[#023047\]", re.I), "fill-[#13ABC4]"),
    (re.compile(r"stroke-\[#023047\]", re.I), "stroke-[#13ABC4]"),
    (re.compile(r"([a-z-]+-)#023047\b", re.I), r"\1#13ABC4"),
]

for path in ROOT.rglob("*"):
    if not path.is_file():
        continue
    if path.suffix not in exts:
        continue
    if any(part in skip_dirs for part in path.parts):
        continue
    if path.resolve() == css_path.resolve():
        continue
    try:
        content = path.read_text(encoding="utf-8")
    except Exception:
        continue
    new = content
    for rx, repl in dark_patterns:
        new = rx.sub(repl, new)
    if new != content:
        path.write_text(new, encoding="utf-8")
        changed_files.append(str(path))
        print(f"  ✓ {path}")

if not changed_files:
    print("  ℹ️ فایل JSX/JS دیگری با #023047 پیدا نشد")

print("\n✅ پچ دارک تمام شد.")
PY

echo ""
echo "📋 وضعیت گیت:"
git status -sb
git diff --stat || true
echo ""
echo "🚀 کامیت و پوش به GitHub (Vercel بیلد جدید می‌زند)..."

git add -A
if git diff --cached --quiet 2>/dev/null; then
  echo "ℹ️ تغییری برای کامیت نبود — force empty commit برای ری‌دیپلوی"
  git commit --allow-empty -m "chore: force vercel redeploy (dark #023047 → #13ABC4)"
else
  git commit -m "fix(dark): replace every #023047 with #13ABC4 in dark mode only (light untouched)"
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD)
git push origin "$BRANCH"

echo ""
echo "✅ تمام. بعد از سبز شدن بیلد Vercel سایت را در حالت دارک چک کنید:"
echo "   https://pirahanmardane.ir"
echo "   هر جایی که قبلاً #023047 بود باید #13ABC4 باشد."
echo "   حالت لایت هیچ تغییری نکرده است."
