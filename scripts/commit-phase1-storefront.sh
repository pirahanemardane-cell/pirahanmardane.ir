#!/usr/bin/env bash
# فاز ۱ — لود سریع‌تر + مسیر خرید بدون اورلی سیاه
# اجرا: bash scripts/commit-phase1-storefront.sh

set -euo pipefail
cd "$(dirname "$0")/.."

echo "→ staging phase-1 storefront changes..."
git add \
  app/page.jsx \
  components/App.jsx \
  components/PageBootShell.jsx \
  components/shop/HomeView.jsx \
  lib/load-gsap.js \
  scripts/commit-phase1-storefront.sh

if git diff --cached --quiet; then
  echo "هیچ تغییری برای کامیت نیست."
  exit 0
fi

git commit -m "$(cat <<'EOF'
perf(storefront): faster boot shell and smoother shop navigation

Show hero poster while App.js loads, lazy-load GSAP to shrink the initial chunk, and stop blocking the whole viewport on in-app page transitions. Keep full-screen loading only for direct product deep links.
EOF
)"

echo ""
echo "✓ commit شد. برای push:"
echo "  git push origin main"
