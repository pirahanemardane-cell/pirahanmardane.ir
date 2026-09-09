#!/usr/bin/env bash
set -euo pipefail
echo "=== fix mapCatalogRow: pass brand/tags/categories ==="
if [ ! -f package.json ] || [ ! -f components/App.jsx ]; then
  echo "Error: داخل ریشه پروژه اجرا کنید"; exit 1
fi
STAMP=$(date +%Y%m%d%H%M%S)
mkdir -p .bak-panel-fix
cp -f components/App.jsx ".bak-panel-fix/App.jsx.mapcatalog-brand.$STAMP"
echo "Backup: .bak-panel-fix/App.jsx.mapcatalog-brand.$STAMP"

python3 << 'PY'
from pathlib import Path
path = Path("components/App.jsx")
text = path.read_text(encoding="utf-8")
orig = text

old = """          salesCount: Number(p.salesCount ?? p.sales_count ?? p.sold_count ?? p.soldCount ?? 0) || 0,
        };
      };

      const reloadServerCatalog = async () => {"""

new = """          salesCount: Number(p.salesCount ?? p.sales_count ?? p.sold_count ?? p.soldCount ?? 0) || 0,
          // taxonomy — بدون این‌ها PLP برند/دسته/برچسب خالی می‌ماند
          brand: p.brand || p.brandName || p.brand_name || '',
          brandName: p.brandName || p.brand || p.brand_name || '',
          brandId: p.brandId || p.brand_id || '',
          brand_id: p.brand_id || p.brandId || null,
          category: p.category_name || p.category || p.categories?.[0] || 'عمومی',
          categories: Array.isArray(p.categories) ? p.categories : (p.category || p.category_name ? [p.category || p.category_name] : []),
          tags: Array.isArray(p.tags) ? p.tags : [],
        };
      };

      const reloadServerCatalog = async () => {"""

if old not in text:
    if "brand: p.brand || p.brandName" in text and "const mapCatalogRow" in text:
        print("Already has brand in mapCatalogRow — skip field add")
    else:
        raise SystemExit("mapCatalogRow anchor not found")
else:
    text = text.replace(old, new, 1)
    print("OK: brand/tags/categories added to mapCatalogRow")

old_colors = """        let colors = Array.isArray(p.colors) && p.colors.length ? p.colors.map((c) => ({ ...c })) : [];
        if (!colors.length) {
          colors = [{ name: 'پیش‌فرض', hex: '#999', image: img || '/logo.webp' }];
        } else {
          colors = colors.map((c, i) => {
            const cImg = isUsableProductImage(c && c.image) ? String(c.image).trim() : (imgs[i] || img || '/logo.webp');
            return { ...(c || {}), image: cImg };
          });
        }"""

new_colors = """        let colors = Array.isArray(p.colors) && p.colors.length ? p.colors.map((c) => ({ ...c })) : [];
        if (!colors.length) {
          colors = [{ name: 'پیش‌فرض', hex: '#999', image: img || '/logo.webp' }];
        } else {
          colors = colors.map((c, i) => {
            const cImg = isUsableProductImage(c && c.image) ? String(c.image).trim() : (imgs[i] || img || '/logo.webp');
            let name = (c && (c.name || c.label || c.title)) ? String(c.name || c.label || c.title).trim() : '';
            if (!name && c && typeof c === 'object') {
              const keys = Object.keys(c).filter((k) => /^\\d+$/.test(k)).sort((a, b) => Number(a) - Number(b));
              if (keys.length) name = keys.map((k) => c[k]).join('');
            }
            if (!name) name = 'پیش‌فرض';
            return { ...(c || {}), name, image: cImg };
          });
        }"""

if old_colors in text:
    text = text.replace(old_colors, new_colors, 1)
    print("OK: color name recovery")

old_dup = """          status: p.status || 'active',
          category: p.category_name || p.category || 'عمومی',
          seller: {"""
new_dup = """          status: p.status || 'active',
          seller: {"""
if old_dup in text:
    text = text.replace(old_dup, new_dup, 1)

if text == orig:
    raise SystemExit("No changes applied")
path.write_text(text, encoding="utf-8")
print("Done: components/App.jsx")
PY
