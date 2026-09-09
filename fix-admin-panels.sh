#!/usr/bin/env bash
set -euo pipefail
echo "=== panel fix start ==="

if [ ! -f package.json ] || [ ! -d components/panels ]; then
  echo "Error: run this inside the project root"
  exit 1
fi

STAMP=$(date +%Y%m%d%H%M%S)
mkdir -p .bak-panel-fix
cp -f components/panels/AdminPanelContent.jsx ".bak-panel-fix/AdminPanelContent.jsx.$STAMP"

python3 - <<'PY'
from pathlib import Path
import re
path = Path("components/panels/AdminPanelContent.jsx")
text = path.read_text(encoding="utf-8")
orig = text
text = re.sub(
    r"\n\s*\{\s*id:\s*'settings'\s*,\s*label:\s*'تنظیمات'\s*,\s*icon:\s*'settings'\s*\}\s*,?",
    "\n",
    text,
    count=1,
)
pat = re.compile(
    r"\n\s*\{!\s*adminLoading\s*&&\s*adminTab\s*===\s*'settings'\s*&&\s*\([\s\S]*?"
    r"تنظیمات سایت[\s\S]*?"
    r"<button[^>]*>\s*ذخیره\s*</button>\s*</div>\s*\)\s*\}",
    re.MULTILINE,
)
text2, n = pat.subn("\n", text, count=1)
if n == 0:
    pat2 = re.compile(
        r"\n\s*\{!\s*adminLoading\s*&&\s*adminTab\s*===\s*'settings'\s*&&\s*\([\s\S]*?^\s*\)\}\s*\n",
        re.MULTILINE,
    )
    text2, n = pat2.subn("\n", text, count=1)
text = text2
if text == orig:
    print("No JSX change (maybe already removed)")
else:
    path.write_text(text, encoding="utf-8")
    print("Removed admin settings tab/form")
PY

CSS_FILE=""
for f in app/globals.css styles/globals.css src/app/globals.css; do
  [ -f "$f" ] && CSS_FILE="$f" && break
done

if [ -n "$CSS_FILE" ]; then
  if grep -q "panel overflow fix (auto)" "$CSS_FILE" 2>/dev/null; then
    echo "CSS already present in $CSS_FILE"
  else
    cp -f "$CSS_FILE" ".bak-panel-fix/$(basename "$CSS_FILE").$STAMP"
    cat >> "$CSS_FILE" << 'CSS'

/* === panel overflow fix (auto) === */
.panel-ui,
.panel-ui--admin,
.panel-ui--seller,
.panel-ui--buyer {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: hidden;
}
.admin-panel-shell,
.seller-panel-shell,
.buyer-panel-shell {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: hidden;
}
.panel-ui table,
.panel-ui .table-wrap {
  width: 100%;
  max-width: 100%;
  display: block;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.panel-ui td,
.panel-ui th {
  max-width: 16rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.panel-ui .min-w-0 { min-width: 0; }
.panel-ui img { max-width: 100%; height: auto; }
/* === end panel overflow fix === */
CSS
    echo "CSS added to $CSS_FILE"
  fi
else
  echo "globals.css not found — JSX only"
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD)
git add components/panels/AdminPanelContent.jsx
[ -n "$CSS_FILE" ] && git add "$CSS_FILE" || true

if git diff --cached --quiet; then
  echo "Nothing new to commit"
else
  git commit -m "fix(admin): remove site settings tab; panel overflow CSS"
  echo "Committed"
fi

echo "Pushing branch: $BRANCH"
git push -u origin "$BRANCH"
echo "=== done — check Vercel deploy ==="
