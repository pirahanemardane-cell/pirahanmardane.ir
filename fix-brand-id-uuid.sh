#!/usr/bin/env bash
# رفع: invalid input syntax for type uuid: "br-..."
set -euo pipefail

echo "=== fix brand_id UUID on admin product PATCH ==="

if [ ! -f package.json ] || [ ! -f app/api/admin/products/route.js ]; then
  echo "Error: داخل ریشه پروژه اجرا کنید"
  exit 1
fi

STAMP=$(date +%Y%m%d%H%M%S)
mkdir -p .bak-panel-fix
cp -f app/api/admin/products/route.js ".bak-panel-fix/admin-products-route.js.$STAMP"
echo "Backup: .bak-panel-fix/admin-products-route.js.$STAMP"

python3 << 'PY'
from pathlib import Path

path = Path("app/api/admin/products/route.js")
text = path.read_text(encoding="utf-8")
orig = text

HELPER = """
function isUuid(v) {
  const s = String(v || '').trim()
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s)
}

"""

if "function isUuid" not in text:
    lines = text.splitlines(keepends=True)
    insert_at = 0
    for i, line in enumerate(lines):
        if line.startswith("import "):
            insert_at = i + 1
    lines.insert(insert_at, HELPER)
    text = "".join(lines)

old_block = """    if (body.brand_id != null || body.brandId != null) {
      const bid = body.brand_id ?? body.brandId
      if (bid) patch.brand_id = String(bid)
      else patch.brand_id = null
    }"""

new_block = """    if (body.brand_id != null || body.brandId != null) {
      const bid = body.brand_id ?? body.brandId
      // ستون products.brand_id فقط UUID می‌پذیرد (FK به brands)
      // شناسه‌های catalog_brands مثل br-... فقط در payload نگه داشته می‌شوند
      if (bid && isUuid(bid)) patch.brand_id = String(bid).trim()
      else patch.brand_id = null
    }"""

if old_block in text:
    text = text.replace(old_block, new_block, 1)
elif "isUuid(bid)" not in text and "patch.brand_id = String(bid)" in text:
    text = text.replace(
        "if (bid) patch.brand_id = String(bid)\n      else patch.brand_id = null",
        "if (bid && isUuid(bid)) patch.brand_id = String(bid).trim()\n      else patch.brand_id = null",
        1,
    )
else:
    if "isUuid(bid)" not in text:
        raise SystemExit("could not find brand_id patch block")

if text == orig and "isUuid(bid)" not in path.read_text(encoding="utf-8"):
    raise SystemExit("No changes applied")

path.write_text(text, encoding="utf-8")
print("OK: app/api/admin/products/route.js")
print("  - brand_id column only set when value is valid UUID")
print("  - catalog ids (br-...) stay in payload only")
PY

echo ""
echo "Done."
