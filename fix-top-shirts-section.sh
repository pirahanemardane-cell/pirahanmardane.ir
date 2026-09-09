#!/usr/bin/env bash
set -euo pipefail
echo "=== top shirts section (admin-curated products) ==="
if [ ! -f package.json ]; then
  echo "Error: داخل ریشه پروژه اجرا کنید"; exit 1
fi
STAMP=$(date +%Y%m%d%H%M%S)
mkdir -p .bak-panel-fix
cp -f components/shop/HomeView.jsx ".bak-panel-fix/HomeView.jsx.topshirts.$STAMP" 2>/dev/null || true
cp -f components/panels/AdminPanelContent.jsx ".bak-panel-fix/AdminPanelContent.jsx.topshirts.$STAMP" 2>/dev/null || true
cp -f components/App.jsx ".bak-panel-fix/App.jsx.topshirts.$STAMP" 2>/dev/null || true
cp -f app/api/admin/products/route.js ".bak-panel-fix/admin-products.route.topshirts.$STAMP" 2>/dev/null || true
echo "Backup .$STAMP"

python3 << 'PY'
from pathlib import Path
import re

hv = Path("components/shop/HomeView.jsx")
ht = hv.read_text(encoding="utf-8")
ht_orig = ht

old_feat = """            {/* Top brands — فقط show_on_home از پنل ادمین */}
            {/* برترین‌های پیراهن — محصول */}
      {(() => {
        const all = (typeof products !== 'undefined' && products) || (typeof catalogProducts !== 'undefined' && catalogProducts) || [];
        const list = (Array.isArray(all) ? all : [])
          .filter((p) => p && (p.status === 'active' || !p.status))
          .map((p) => ({
            ...p,
            _sales: Number(p.soldRecent || p.sold_count || p.sales || p.sold || 0) || 0,
            _feat: !!(p.featured_top || p.featuredTop),
          }))
          .sort((a, b) => {
            if (a._feat !== b._feat) return a._feat ? -1 : 1;
            return b._sales - a._sales;
          })
          .slice(0, 8);
        if (!list.length) return null;
        return (
          <section className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
            <h2 className="text-lg sm:text-xl font-black text-primary-900 dark:text-white mb-4 text-center">برترین‌های پیراهن</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {list.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { try { if (typeof openPDP === 'function') openPDP(p); } catch (_) {} }}
                  className="text-right rounded-2xl border border-primary-100 dark:border-white/10 bg-white dark:bg-primary-900 overflow-hidden shadow-sm hover:shadow-md transition"
                >
                  <div className="aspect-[3/4] bg-primary-50 dark:bg-primary-950">
                    <img src={p.image || p.images?.[0] || p.thumb || ''} alt={p.name || ''} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs sm:text-sm font-bold text-primary-900 dark:text-white line-clamp-2">{p.name}</p>
                    {p.priceText && <p className="text-xs text-primary-600 dark:text-white/70 mt-1">{p.priceText} تومان</p>}
                  </div>
                </button>
              ))}
            </div>"""

new_feat = """            {/* برترین های پیراهن — فقط تیک ادمین (featured_top) — بدون اتومات و بدون برند */}
      {(() => {
        const all = (typeof catalogProducts !== 'undefined' && Array.isArray(catalogProducts) && catalogProducts.length)
          ? catalogProducts
          : ((typeof products !== 'undefined' && Array.isArray(products)) ? products : []);
        const list = all
          .filter((p) => {
            if (!p) return false;
            const st = String(p.status || 'active').toLowerCase();
            if (st && st !== 'active' && st !== 'approved') return false;
            return !!(p.featured_top || p.featuredTop || (p.payload && (p.payload.featured_top || p.payload.featuredTop)));
          })
          .slice(0, 12);
        if (!list.length) return null;
        return (
          <section className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8" data-section="top-shirts">
            <h2 className="section-title text-right text-primary-900 dark:text-white mb-6 sm:mb-8 text-lg sm:text-xl">برترین های پیراهن</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {list.map((p) => (
                typeof renderProductCard === 'function'
                  ? <div key={p.id}>{renderProductCard(p, 'topshirt-')}</div>
                  : (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { try { if (typeof openPDP === 'function') openPDP(p); } catch (_) {} }}
                      className="text-right rounded-2xl border border-primary-100 dark:border-white/10 bg-white dark:bg-primary-900 overflow-hidden shadow-sm hover:shadow-md transition"
                    >
                      <div className="aspect-[3/4] bg-primary-50 dark:bg-primary-950">
                        <img src={p.image || p.images?.[0] || p.thumb || ''} alt={p.name || ''} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs sm:text-sm font-bold text-primary-900 dark:text-white line-clamp-2">{p.name}</p>
                        {p.priceText && <p className="text-xs text-primary-600 dark:text-white/70 mt-1">{p.priceText} تومان</p>}
                      </div>
                    </button>
                  )
              ))}
            </div>"""

if old_feat in ht:
    ht = ht.replace(old_feat, new_feat, 1)
    print("OK: HomeView top shirts filter")
else:
    soft = """        const list = (Array.isArray(all) ? all : [])
          .filter((p) => p && (p.status === 'active' || !p.status))
          .map((p) => ({
            ...p,
            _sales: Number(p.soldRecent || p.sold_count || p.sales || p.sold || 0) || 0,
            _feat: !!(p.featured_top || p.featuredTop),
          }))
          .sort((a, b) => {
            if (a._feat !== b._feat) return a._feat ? -1 : 1;
            return b._sales - a._sales;
          })
          .slice(0, 8);"""
    soft_new = """        const list = (Array.isArray(all) ? all : [])
          .filter((p) => {
            if (!p) return false;
            const st = String(p.status || 'active').toLowerCase();
            if (st && st !== 'active' && st !== 'approved') return false;
            return !!(p.featured_top || p.featuredTop || (p.payload && (p.payload.featured_top || p.payload.featuredTop)));
          })
          .slice(0, 12);"""
    if soft in ht:
        ht = ht.replace(soft, soft_new, 1)
        ht = ht.replace("برترین‌های پیراهن", "برترین های پیراهن")
        print("OK: soft filter curated only")
    else:
        print("WARN: products section pattern")

m = re.search(
    r"\{homeBrands\.length > 0 && \(\s*<section[\s\S]*?برترین برندها[\s\S]*?</section>\s*\)\}",
    ht,
)
if m:
    ht = ht[:m.start()] + "\n            {/* برترین برندها حذف شد — جایش برترین های پیراهن */}\n" + ht[m.end():]
    print("OK: removed brands home section")
elif "برترین برندها" not in ht:
    print("brands section already removed")
else:
    print("WARN: brands section still present — check HomeView")

if "renderProductCard" not in ht.split("= useAppApi()")[0][-2500:]:
    if "openPLP," in ht:
        ht = ht.replace("openPLP,", "openPLP, renderProductCard,", 1)
        print("OK: renderProductCard in HomeView")
    elif "openPDP," in ht:
        ht = ht.replace("openPDP,", "openPDP, renderProductCard,", 1)
        print("OK: renderProductCard via openPDP")

if ht != ht_orig:
    hv.write_text(ht, encoding="utf-8")
    print("Wrote HomeView.jsx")

ap = Path("components/panels/AdminPanelContent.jsx")
at = ap.read_text(encoding="utf-8")
at_orig = at

old_badges = """                {[
                  { key: 'amazing', label: 'شگفت‌انگیز', on: !!(p.amazing), cls: 'from-amber-500 to-orange-500 text-white' },
                  { key: 'popular', label: 'پرفروش', on: !!(p.popular), cls: 'bg-amber-500 text-white' },
                  { key: 'fastShip', label: 'ارسال سریع', on: !!(p.fastShip || p.fast_ship), cls: 'bg-emerald-600 text-white' },
                ].map((b) => ("""

new_badges = """                {[
                  { key: 'amazing', label: 'شگفت‌انگیز', on: !!(p.amazing), cls: 'from-amber-500 to-orange-500 text-white' },
                  { key: 'popular', label: 'پرفروش', on: !!(p.popular), cls: 'bg-amber-500 text-white' },
                  { key: 'fastShip', label: 'ارسال سریع', on: !!(p.fastShip || p.fast_ship), cls: 'bg-emerald-600 text-white' },
                  { key: 'featuredTop', label: 'برترین پیراهن', on: !!(p.featuredTop || p.featured_top), cls: 'bg-primary-900 text-white dark:bg-white dark:text-primary-900' },
                ].map((b) => ("""

if old_badges in at:
    at = at.replace(old_badges, new_badges, 1)
    print("OK: admin badge برترین پیراهن")
elif "برترین پیراهن" in at:
    print("admin badge already present")
else:
    print("WARN: badge list not found")

old_set = """setAdminProducts((prev) => (prev || []).map((x) => String(x.id) === String(p.id) ? { ...x, [b.key]: nextVal, fast_ship: b.key === 'fastShip' ? nextVal : x.fast_ship } : x));"""
new_set = """setAdminProducts((prev) => (prev || []).map((x) => String(x.id) === String(p.id) ? { ...x, [b.key]: nextVal, fast_ship: b.key === 'fastShip' ? nextVal : x.fast_ship, featured_top: b.key === 'featuredTop' ? nextVal : x.featured_top, featuredTop: b.key === 'featuredTop' ? nextVal : x.featuredTop } : x));"""
if old_set in at:
    at = at.replace(old_set, new_set, 1)
    print("OK: admin state featured_top")

old_body = """body: JSON.stringify({ id: p.id, [b.key]: nextVal }),"""
new_body = """body: JSON.stringify({ id: p.id, [b.key]: nextVal, ...(b.key === 'featuredTop' ? { featured_top: nextVal, featuredTop: nextVal } : {}) }),"""
if old_body in at and "featuredTop' ? { featured_top" not in at:
    at = at.replace(old_body, new_body, 1)
    print("OK: PATCH body featured_top")

if at != at_orig:
    ap.write_text(at, encoding="utf-8")
    print("Wrote AdminPanelContent.jsx")

rt = Path("app/api/admin/products/route.js")
rj = rt.read_text(encoding="utf-8")
rj_orig = rj

if "body.featured_top != null || body.featuredTop != null" not in rj:
    anchor = "    const needPayload ="
    inject = """    if (body.featured_top != null || body.featuredTop != null) {
      patch.featured_top = !!(body.featured_top ?? body.featuredTop)
    }

"""
    if anchor in rj:
        rj = rj.replace(anchor, inject + anchor, 1)
        print("OK: API PATCH featured_top column")
    else:
        print("WARN: needPayload anchor missing")
else:
    print("API already has featured_top")

if "if (body.featured_top != null || body.featuredTop != null) next.featured_top" not in rj:
    payload_anchor = "      if (body.amazing != null) next.amazing = !!body.amazing"
    if payload_anchor in rj:
        rj = rj.replace(
            payload_anchor,
            payload_anchor
            + "\n      if (body.featured_top != null || body.featuredTop != null) {\n"
            + "        next.featured_top = !!(body.featured_top ?? body.featuredTop)\n"
            + "        next.featuredTop = next.featured_top\n"
            + "      }",
            1,
        )
        rj = rj.replace(
            "body.amazing != null || body.popular != null || body.fastShip != null ||",
            "body.amazing != null || body.popular != null || body.fastShip != null ||\n"
            "      body.featured_top != null || body.featuredTop != null ||",
            1,
        )
        print("OK: payload + needPayload featured_top")

if rj != rj_orig:
    rt.write_text(rj, encoding="utf-8")
    print("Wrote admin products route")

app = Path("components/App.jsx")
ax = app.read_text(encoding="utf-8")
ax_orig = ax
i = ax.find("const mapCatalogRow")
if i > 0 and "featured_top:" not in ax[i:i+3500]:
    chunk = ax[i:i+3500]
    for key in ["status: p.status", "brand: p.brand", "tags:"]:
        if key in chunk:
            ax = ax[:i] + chunk.replace(
                key,
                "featured_top: !!(p.featured_top ?? p.featuredTop ?? (p.payload && (p.payload.featured_top || p.payload.featuredTop))),\n"
                "          featuredTop: !!(p.featured_top ?? p.featuredTop ?? (p.payload && (p.payload.featured_top || p.payload.featuredTop))),\n"
                "          " + key,
                1,
            ) + ax[i+3500:]
            print("OK: mapCatalogRow featured_top")
            break
    else:
        print("WARN: mapCatalogRow inject point")
elif i > 0 and "featured_top:" in ax[i:i+3500]:
    print("mapCatalogRow already has featured_top")

if ax != ax_orig:
    app.write_text(ax, encoding="utf-8")
    print("Wrote App.jsx")

print("Done.")
PY
