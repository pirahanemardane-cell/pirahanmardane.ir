#!/bin/bash
# Quick smoke against production — run anytime before/after test session
set -e
BASE="${1:-https://pirahanmardane.ir}"
PASS=0; FAIL=0; WARN=0
ok(){ echo "[OK]  $1"; PASS=$((PASS+1)); }
fail(){ echo "[FAIL] $1"; FAIL=$((FAIL+1)); }
warn(){ echo "[WARN] $1"; WARN=$((WARN+1)); }

echo "SMOKE $BASE"
code=$(curl -sS -o /tmp/h.json -w "%{http_code}" --max-time 25 "$BASE/api/health" || echo 000)
if [ "$code" = "200" ] && grep -q '"ok":true' /tmp/h.json 2>/dev/null; then ok "health 200 ok"; else fail "health $code"; fi

code=$(curl -sS -o /tmp/p.json -w "%{http_code}" --max-time 20 "$BASE/api/catalog/products")
n=$(python3 -c "import json;d=json.load(open('/tmp/p.json'));print(len(d.get('products')or[]))" 2>/dev/null || echo 0)
[ "$code" = "200" ] && [ "$n" -ge 1 ] && ok "products $n" || fail "products $code n=$n"

code=$(curl -sS -o /tmp/s.json -w "%{http_code}" --max-time 15 "$BASE/api/catalog/sizes")
python3 -c "import json;n=set(x['name'] for x in json.load(open('/tmp/s.json')).get('sizes')or[]);
import sys; sys.exit(0 if n>=set('S M L XL'.split()) else 1)" 2>/dev/null && ok "sizes S-L+" || fail "sizes incomplete"

for p in /api/seller/me /api/orders /api/cart /api/admin/stats; do
  c=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 12 "$BASE$p")
  [ "$c" = "401" ] || [ "$c" = "403" ] && ok "guard $p $c" || fail "guard $p $c"
done

html=$(curl -sS --max-time 20 "$BASE/" || true)
echo "$html" | grep -qi service_role && fail "service_role in HTML" || ok "no service_role HTML"
echo "$html" | grep -q 'lang="fa"' && ok "lang=fa" || warn "lang"
echo "$html" | grep -q 'dir="rtl"' && ok "rtl" || warn "rtl"

for path in "/" "/%D9%81%D8%B1%D9%88%D8%B4%DA%AF%D8%A7%D9%87"; do
  c=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 15 "$BASE$path")
  [ "$c" = "200" ] && ok "UI $path" || fail "UI $path $c"
done

echo "RESULT PASS=$PASS WARN=$WARN FAIL=$FAIL"
[ "$FAIL" -eq 0 ] && echo "Status: GO for real testing (no gateway)" && exit 0
echo "Status: NOT GO — fix FAIL first"; exit 1
