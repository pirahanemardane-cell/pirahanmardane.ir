#!/usr/bin/env bash
set -euo pipefail
echo "=== brand page UI: single breadcrumb + site product cards ==="
if [ ! -f package.json ] || [ ! -f components/App.jsx ]; then
  echo "Error: داخل ریشه پروژه اجرا کنید"; exit 1
fi
STAMP=$(date +%Y%m%d%H%M%S)
mkdir -p .bak-panel-fix
cp -f components/App.jsx ".bak-panel-fix/App.jsx.brand-ui.$STAMP"
cp -f components/shop/StaticPagesView.jsx ".bak-panel-fix/StaticPagesView.jsx.brand-ui.$STAMP"
echo "Backup .$STAMP"

python3 << 'PY'
from pathlib import Path

app = Path("components/App.jsx")
text = app.read_text(encoding="utf-8")

old_crumb = """              ...(staticPage && staticPage !== 'blog-post' ? [{
                label: ({
                  about: 'درباره ما', contact: 'تماس با ما', faq: 'سوالات متداول', 'size-guide': 'راهنمای سایز',
                  'become-seller': 'فروشنده شوید', terms: 'قوانین و شرایط', returns: 'شرایط بازگشت',
                  privacy: 'حریم خصوصی', cookies: 'کوکی‌ها', sitemap: 'نقشه سایت', blog: 'مجله',
                  brands: 'برندها', campaigns: 'کمپین‌ها', deals: 'شگفت‌انگیز',
                  'error-404': 'صفحه یافت نشد', 'error-500': 'خطای سرور', maintenance: 'تعمیرات',
                })[staticPage] || 'صفحه',
                current: true,
              }] : []),"""

new_crumb = """              ...(staticPage === 'brands' && brandDetailId ? [
                { label: 'برندها', href: '/برندها', onClick: () => { try { setBrandDetailId(null); openStaticPage('brands'); } catch (_) {} } },
                { label: (() => {
                  const pool = [
                    ...(Array.isArray(adminCatalogBrands) ? adminCatalogBrands : []),
                    ...(Array.isArray(brandsList) ? brandsList : []),
                  ];
                  const br = pool.find((x) => x && (String(x.id) === String(brandDetailId) || String(x.slug) === String(brandDetailId) || String(x.name) === String(brandDetailId)));
                  return (br && br.name) || String(brandDetailId);
                })(), current: true },
              ] : []),
              ...(staticPage && staticPage !== 'blog-post' && !(staticPage === 'brands' && brandDetailId) ? [{
                label: ({
                  about: 'درباره ما', contact: 'تماس با ما', faq: 'سوالات متداول', 'size-guide': 'راهنمای سایز',
                  'become-seller': 'فروشنده شوید', terms: 'قوانین و شرایط', returns: 'شرایط بازگشت',
                  privacy: 'حریم خصوصی', cookies: 'کوکی‌ها', sitemap: 'نقشه سایت', blog: 'مجله',
                  brands: 'برندها', campaigns: 'کمپین‌ها', deals: 'شگفت‌انگیز',
                  'error-404': 'صفحه یافت نشد', 'error-500': 'خطای سرور', maintenance: 'تعمیرات',
                })[staticPage] || 'صفحه',
                current: true,
              }] : []),"""

if old_crumb in text:
    text = text.replace(old_crumb, new_crumb, 1)
    print("OK: top breadcrumb")
elif "staticPage === 'brands' && brandDetailId ?" in text:
    print("breadcrumb already specialized")
else:
    raise SystemExit("crumbItems block not found")
app.write_text(text, encoding="utf-8")

sp = Path("components/shop/StaticPagesView.jsx")
st = sp.read_text(encoding="utf-8")
st_orig = st

if "renderProductCard" not in st.split("= useAppApi()")[0][-3000:]:
    if "openPDP," in st:
        st = st.replace("openPDP,", "openPDP, renderProductCard,", 1)
        print("OK: renderProductCard in context")
    elif "openPLP," in st:
        st = st.replace("openPLP,", "openPLP, renderProductCard,", 1)
        print("OK: renderProductCard via openPLP")

old_nav = """                  <div className="space-y-6">
                    <nav className="flex flex-wrap items-center gap-1.5 text-xs text-primary-500 dark:text-white/70" aria-label="breadcrumb">
                      <button type="button" onClick={() => { try { closeStaticPage(); } catch (_) {} try { if (typeof goHome === 'function') goHome(); else window.location.href = '/'; } catch (_) {} }} className="hover:text-apple-blue">خانه</button>
                      <span aria-hidden>‹</span>
                      <button type="button" onClick={() => { setBrandDetailId(null); try { openStaticPage('brands'); } catch (_) {} }} className="hover:text-apple-blue">برندها</button>
                      <span aria-hidden>‹</span>
                      <span className="text-primary-800 dark:text-white font-medium">{b.name}</span>
                    </nav>
                    <div className="flex items-center gap-4">"""

new_nav = """                  <div className="space-y-6">
                    <div className="flex items-center gap-4">"""

if old_nav in st:
    st = st.replace(old_nav, new_nav, 1)
    print("OK: removed duplicate inner breadcrumb")
else:
    i = st.find("staticPage === 'brands' && brandDetailId")
    if i > 0:
        j = st.find("<nav ", i)
        k = st.find("</nav>", j) if j > 0 else -1
        if j > 0 and k > j and k < i + 3000 and "برندها" in st[j:k]:
            st = st[:j] + st[k + len("</nav>"):]
            print("OK: soft-removed inner nav")
        else:
            print("inner breadcrumb already gone or pattern shifted")

old_cards = """                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
                      {!brandProducts.length && (
                      <p className="col-span-full text-center text-sm text-primary-500 py-10">محصولی برای این برند ثبت نشده</p>
                    )}
                    {(brandProducts.length ? brandProducts : []).map(p => (
                        <button key={p.id} type="button" onClick={() => { closeStaticPage(); setBrandDetailId(null); openPDP(p); }} className="text-right rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 overflow-hidden hover:border-apple-blue/40 transition">
                          <img src={p.colors?.[0]?.image || p.image} alt="" className="aspect-[4/5] w-full object-cover" loading="lazy" />
                          <div className="p-2.5">
                            <p className="text-sm sm:text-base font-medium text-primary-900 dark:!text-white line-clamp-2">{p.name}</p>
                            <p className="text-xs font-bold mt-1">{p.priceText} ت</p>
                          </div>
                        </button>
                      ))}
                    </div>"""

new_cards = """                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
                      {!brandProducts.length && (
                        <p className="col-span-full text-center text-sm text-primary-500 py-10">محصولی برای این برند ثبت نشده</p>
                      )}
                      {(brandProducts.length ? brandProducts : []).map((p) => (
                        typeof renderProductCard === 'function'
                          ? <div key={p.id}>{renderProductCard(p, 'brand-' + String(p.id))}</div>
                          : (
                            <button key={p.id} type="button" onClick={() => { try { closeStaticPage(); } catch (_) {} try { setBrandDetailId(null); } catch (_) {} openPDP(p); }} className="text-right rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 overflow-hidden hover:border-apple-blue/40 transition">
                              <img src={p.colors?.[0]?.image || p.image} alt="" className="aspect-[4/5] w-full object-cover" loading="lazy" />
                              <div className="p-2.5">
                                <p className="text-sm sm:text-base font-medium text-primary-900 dark:!text-white line-clamp-2">{p.name}</p>
                                <p className="text-xs font-bold mt-1">{p.priceText} ت</p>
                              </div>
                            </button>
                          )
                      ))}
                    </div>"""

if old_cards in st:
    st = st.replace(old_cards, new_cards, 1)
    print("OK: brand products use renderProductCard")
elif "renderProductCard(p, 'brand-'" in st:
    print("cards already use renderProductCard")
else:
    if "brandProducts.length ? brandProducts : []).map" in st and "renderProductCard(p, 'brand-'" not in st:
        import re
        m = re.search(
            r'<div className="grid grid-cols-2[^"]*">\s*\{!brandProducts\.length && \([\s\S]*?\(brandProducts\.length \? brandProducts : \[\]\)\.map\([\s\S]*?</div>\s*\)\}\s*</div>',
            st,
        )
        if m:
            st = st[:m.start()] + new_cards + st[m.end():]
            print("OK: cards replaced via regex")
        else:
            print("WARN: cards pattern not found")
    else:
        print("WARN: cards")

if st != st_orig:
    sp.write_text(st, encoding="utf-8")
    print("Wrote StaticPagesView.jsx")
else:
    print("StaticPagesView unchanged?")
print("Done.")
PY
