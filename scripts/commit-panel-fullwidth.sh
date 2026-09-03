#!/usr/bin/env bash
# پوش و کامیت: تمام‌عرض شدن پنل‌های ادمین / فروشنده / خریدار
# اجرا از ریشه پروژه: bash scripts/commit-panel-fullwidth.sh

set -euo pipefail
cd "$(dirname "$0")/.."

echo "→ staging panel full-width changes..."
git add \
  app/globals.css \
  components/App.jsx \
  components/panels/AdminPanelContent.jsx \
  components/panels/SellerPanelContent.jsx \
  components/shop/ProfileView.jsx \
  components/ui/breadcrumb.jsx

if git diff --cached --quiet; then
  echo "هیچ تغییری برای کامیت نیست."
  exit 0
fi

git commit -m "$(cat <<'EOF'
fix(ui): full-width admin, seller, and buyer panel containers

Remove sm:max-w-7xl cap on panel shells so content uses the full viewport on mobile and desktop. Add shared panel-content-wrap styling and fullWidth breadcrumb for panel routes.
EOF
)"

echo ""
echo "✓ commit شد. برای push:"
echo "  git push origin main"
