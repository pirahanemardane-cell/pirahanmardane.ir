#!/usr/bin/env bash
set -euo pipefail
echo "=== brand as independent page (not PLP filter) ==="
if [ ! -f package.json ] || [ ! -f components/App.jsx ]; then
  echo "Error: داخل ریشه پروژه اجرا کنید"; exit 1
fi
STAMP=$(date +%Y%m%d%H%M%S)
mkdir -p .bak-panel-fix
cp -f components/App.jsx ".bak-panel-fix/App.jsx.brand-page.$STAMP"
cp -f components/shop/StaticPagesView.jsx ".bak-panel-fix/StaticPagesView.jsx.brand-page.$STAMP"

python3 << 'PY'
from pathlib import Path

path = Path("components/App.jsx")
text = path.read_text(encoding="utf-8")
orig = text

old_open = """      const openBrand = (brandNameOrObj, opts = {}) => {
        const pool = [
          ...(Array.isArray(adminCatalogBrands) ? adminCatalogBrands : []),
          ...(Array.isArray(brandsList) ? brandsList : []),
        ];
        let b = brandNameOrObj && typeof brandNameOrObj === 'object' ? brandNameOrObj : null;
        if (!b) {
          const key = String(brandNameOrObj || '').trim();
          const norm = (x) => (typeof slugifyFa === 'function' ? slugifyFa(String(x || '')) : String(x || '').replace(/\\s+/g, '_'));
          const t = norm(key);
          b = pool.find((x) => {
            if (!x) return false;
            const n = String(x.name || '').trim();
            const s = String(x.slug || '').trim();
            return n === key || s === key || norm(n) === t || norm(s) === t || String(x.id) === key;
          }) || { name: key, slug: key };
        }
        const name = String(b.name || b.slug || '').trim();
        const slug = String(b.slug || b.name || '').trim();
        if (!name && !slug) return;
        try { setBrandDetailId(null); } catch (_) {}
        try { setStaticPage(null); } catch (_) {}
        // PLP برند — URL اختصاصی /{slug}
        openPLP({
          brand: name || slug,
          brandSlug: slug || name,
          silent: !!opts.silent,
        });
      };"""

new_open = """      const openBrand = (brandNameOrObj, opts = {}) => {
        const pool = [
          ...(Array.isArray(adminCatalogBrands) ? adminCatalogBrands : []),
          ...(Array.isArray(brandsList) ? brandsList : []),
        ];
        let b = brandNameOrObj && typeof brandNameOrObj === 'object' ? brandNameOrObj : null;
        if (!b) {
          const key = String(brandNameOrObj || '').trim();
          const norm = (x) => (typeof slugifyFa === 'function' ? slugifyFa(String(x || '')) : String(x || '').replace(/\\s+/g, '_'));
          const t = norm(key);
          b = pool.find((x) => {
            if (!x) return false;
            const n = String(x.name || '').trim();
            const s = String(x.slug || '').trim();
            return n === key || s === key || norm(n) === t || norm(s) === t || String(x.id) === key;
          }) || { name: key, slug: key, id: key };
        }
        const name = String(b.name || b.slug || '').trim();
        const slug = String(b.slug || b.name || '').trim();
        if (!name && !slug) return;
        // صفحه مستقل برند — نه فیلتر PLP
        try { setPlpBrand(''); } catch (_) {}
        try { setShowPLP(false); } catch (_) {}
        try { setPdpProduct(null); } catch (_) {}
        try { setShowCartPage(false); } catch (_) {}
        try { setShowCheckout(false); } catch (_) {}
        try { setShowWishlistPage(false); } catch (_) {}
        try { setShowRecentPage(false); } catch (_) {}
        try { setShowComparePage(false); } catch (_) {}
        try { setShowProfilePage(false); } catch (_) {}
        try { setShowSellerPanel(false); } catch (_) {}
        try { setShowAdminPanel(false); } catch (_) {}
        try { setShowSellersList(false); } catch (_) {}
        try { setActiveSellerId(null); } catch (_) {}
        try { setShowTaxonomyHub(null); } catch (_) {}
        try { setMobileMenuOpen(false); } catch (_) {}
        try { setBrandDetailId(b.id || name || slug); } catch (_) {}
        try { setStaticPage('brands'); } catch (_) {}
        try {
          const pathSlug = (typeof slugifyFa === 'function' ? slugifyFa(slug || name) : String(slug || name).replace(/\\s+/g, '_'));
          if (pathSlug && pathSlug !== 'مورد') {
            const url = '/' + pathSlug;
            if (!opts.silent) {
              try { pushFaUrl(url, { brandPage: true, brand: name, brandId: b.id || null }); } catch (_) {
                try { window.history.pushState({ brandPage: true }, '', url); } catch (__) {}
              }
            } else {
              try { window.history.replaceState({ brandPage: true, brand: name }, '', url); } catch (_) {}
            }
          }
        } catch (_) {}
        try { if (typeof scrollPageToTop === 'function') scrollPageToTop(); } catch (_) {}
      };"""

if old_open in text:
    text = text.replace(old_open, new_open, 1)
    print("OK: openBrand → independent page")
elif "صفحه مستقل برند — نه فیلتر PLP" in text:
    print("already independent")
else:
    soft_old = """        try { setBrandDetailId(null); } catch (_) {}
        try { setStaticPage(null); } catch (_) {}
        // PLP برند — URL اختصاصی /{slug}
        openPLP({
          brand: name || slug,
          brandSlug: slug || name,
          silent: !!opts.silent,
        });
      };"""
    soft_new = new_open[new_open.find("// صفحه مستقل برند"):]
    # use tail from soft - actually replace soft_old with body without const openBrand header
    body = """        // صفحه مستقل برند — نه فیلتر PLP
        try { setPlpBrand(''); } catch (_) {}
        try { setShowPLP(false); } catch (_) {}
        try { setPdpProduct(null); } catch (_) {}
        try { setShowCartPage(false); } catch (_) {}
        try { setShowCheckout(false); } catch (_) {}
        try { setShowWishlistPage(false); } catch (_) {}
        try { setShowRecentPage(false); } catch (_) {}
        try { setShowComparePage(false); } catch (_) {}
        try { setShowProfilePage(false); } catch (_) {}
        try { setShowSellerPanel(false); } catch (_) {}
        try { setShowAdminPanel(false); } catch (_) {}
        try { setShowSellersList(false); } catch (_) {}
        try { setActiveSellerId(null); } catch (_) {}
        try { setShowTaxonomyHub(null); } catch (_) {}
        try { setMobileMenuOpen(false); } catch (_) {}
        try { setBrandDetailId(b.id || name || slug); } catch (_) {}
        try { setStaticPage('brands'); } catch (_) {}
        try {
          const pathSlug = (typeof slugifyFa === 'function' ? slugifyFa(slug || name) : String(slug || name).replace(/\\s+/g, '_'));
          if (pathSlug && pathSlug !== 'مورد') {
            const url = '/' + pathSlug;
            if (!opts.silent) {
              try { pushFaUrl(url, { brandPage: true, brand: name, brandId: b.id || null }); } catch (_) {
                try { window.history.pushState({ brandPage: true }, '', url); } catch (__) {}
              }
            } else {
              try { window.history.replaceState({ brandPage: true, brand: name }, '', url); } catch (_) {}
            }
          }
        } catch (_) {}
        try { if (typeof scrollPageToTop === 'function') scrollPageToTop(); } catch (_) {}
      };"""
    if soft_old in text:
        text = text.replace(soft_old, body, 1)
        print("OK: openBrand soft-patched")
    else:
        raise SystemExit("openBrand block not found")

text = text.replace(
    "openPLP({ brand: catLabel, brandSlug: catSlugRaw || catLabel, silent: true });",
    "openBrand({ name: catLabel, slug: catSlugRaw || catLabel }, { silent: true });",
)
path.write_text(text, encoding="utf-8")
print("Wrote App.jsx")

sp = Path("components/shop/StaticPagesView.jsx")
st = sp.read_text(encoding="utf-8")
if "adminCatalogBrands" not in st.split("= useAppApi()")[0][-2000:]:
    st = st.replace(
        "brandsList, catalogProducts, brandQuery,",
        "brandsList, adminCatalogBrands, catalogProducts, brandQuery,",
        1,
    )

old_list = """                const list = (Array.isArray(brandsList) && brandsList.length ? brandsList : (typeof BRANDS_LIST !== 'undefined' ? BRANDS_LIST : []));
                const b = list.find(x => String(x.id) === String(brandDetailId)) || list[0];"""
new_list = """                const list = [
                  ...(Array.isArray(adminCatalogBrands) ? adminCatalogBrands : []),
                  ...(Array.isArray(brandsList) ? brandsList : []),
                  ...((typeof BRANDS_LIST !== 'undefined' && Array.isArray(BRANDS_LIST)) ? BRANDS_LIST : []),
                ];
                const b = list.find(x => String(x.id) === String(brandDetailId))
                  || list.find(x => String(x.slug || '') === String(brandDetailId) || String(x.name || '') === String(brandDetailId))
                  || (brandDetailId ? { id: brandDetailId, name: String(brandDetailId), slug: String(brandDetailId) } : null);"""
if old_list in st:
    st = st.replace(old_list, new_list, 1)

old_filter = """                const brandName = String(b.name || '').trim().toLowerCase();
                const brandId = String(b.id || '');
                const brandProducts = (Array.isArray(catalogProducts) && catalogProducts.length ? catalogProducts : products).filter((p) => {
                  const pb = String(p.brand || p.brandName || p.brand_name || '').trim().toLowerCase();
                  const pid = String(p.brandId || p.brand_id || '');
                  if (brandId && pid && pid === brandId) return true;
                  if (brandName && pb && pb === brandName) return true;
                  if (brandName && pb && (pb.includes(brandName) || brandName.includes(pb))) return true;
                  return false;
                });"""
new_filter = """                const brandName = String(b.name || '').trim().toLowerCase();
                const brandId = String(b.id || '');
                const brandSlug = String(b.slug || '').trim().toLowerCase();
                const poolProducts = (Array.isArray(catalogProducts) && catalogProducts.length)
                  ? catalogProducts
                  : (Array.isArray(products) ? products : []);
                const brandProducts = poolProducts.filter((p) => {
                  if (!p) return false;
                  const pb = String(p.brand || p.brandName || p.brand_name || '').trim().toLowerCase();
                  const pid = String(p.brandId || p.brand_id || '');
                  if (brandId && pid && String(pid) === String(brandId)) return true;
                  if (brandName && pb && pb === brandName) return true;
                  if (brandSlug && pb && pb === brandSlug) return true;
                  if (brandName && pb && (pb.includes(brandName) || brandName.includes(pb))) return true;
                  return false;
                });"""
if old_filter in st:
    st = st.replace(old_filter, new_filter, 1)
sp.write_text(st, encoding="utf-8")
print("Wrote StaticPagesView.jsx")
print("Done.")
PY
