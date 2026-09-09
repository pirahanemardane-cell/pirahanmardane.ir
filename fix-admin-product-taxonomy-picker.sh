#!/usr/bin/env bash
# =============================================================================
# فقط: ویرایش محصول در پنل ادمین — دسته / برچسب / برند
# - کلیک روی فیلد → زبانه (پنل) باز می‌شود
# - تیک از فهرست ازپیش‌تعریف‌شده ادمین
# - دسته و برچسب چندتایی (حداکثر ۳ مثل فروشنده)، برند تکی
# - ذخیره از طریق همان PATCH موجود + state
# هیچ بخش دیگری (فروشنده، PLP، سئو، …) دست نخورده
# =============================================================================
set -euo pipefail

echo "=== admin product taxonomy picker (tabs + ticks) ==="

if [ ! -f package.json ] || [ ! -f components/panels/AdminPanelContent.jsx ]; then
  echo "Error: داخل ریشه پروژه اجرا کنید (جایی که package.json هست)"
  exit 1
fi

STAMP=$(date +%Y%m%d%H%M%S)
mkdir -p .bak-panel-fix
cp -f components/panels/AdminPanelContent.jsx ".bak-panel-fix/AdminPanelContent.jsx.taxpick.$STAMP"
echo "Backup: .bak-panel-fix/AdminPanelContent.jsx.taxpick.$STAMP"

python3 << 'PY'
from pathlib import Path
import re

path = Path("components/panels/AdminPanelContent.jsx")
text = path.read_text(encoding="utf-8")
orig = text

# --- 1) state ---
if "adminProductTaxPicker" not in text:
    anchor = "  const [taxSelectedIds, setTaxSelectedIds] = useState([]);\n  const [taxFilter, setTaxFilter] = useState('all');\n"
    if anchor not in text:
        raise SystemExit("anchor taxSelectedIds not found")
    insert = (
        anchor
        + "  const [adminProductTaxPicker, setAdminProductTaxPicker] = useState(null); // 'cats' | 'tags' | 'brand' | null\n"
        + "  const [adminProductTaxSearch, setAdminProductTaxSearch] = useState('');\n"
        + "  const [adminEditCats, setAdminEditCats] = useState([]);\n"
        + "  const [adminEditTags, setAdminEditTags] = useState([]);\n"
        + "  const [adminEditBrand, setAdminEditBrand] = useState({ id: '', name: '' });\n"
    )
    text = text.replace(anchor, insert, 1)

# --- 2) sync effect ---
if "SYNC_ADMIN_EDIT_TAX" not in text:
    sync_effect = """
  // SYNC_ADMIN_EDIT_TAX — همگام‌سازی انتخاب taxonomy با محصول بازشده
  useEffect(() => {
    if (!adminProductDetailId) {
      setAdminProductTaxPicker(null);
      setAdminProductTaxSearch('');
      setAdminEditCats([]);
      setAdminEditTags([]);
      setAdminEditBrand({ id: '', name: '' });
      return;
    }
    const p = (adminProducts || []).find((x) => String(x.id) === String(adminProductDetailId));
    if (!p) return;
    const cats = Array.isArray(p.categories) && p.categories.length
      ? p.categories.map((c) => (typeof c === 'string' ? c : c?.name || '')).filter(Boolean)
      : (p.category ? [String(p.category)] : []);
    const tags = Array.isArray(p.tags)
      ? p.tags.map((tg) => (typeof tg === 'string' ? tg : tg?.name || '')).filter(Boolean)
      : [];
    const bname = String(p.brand || p.brandName || '').trim();
    const bid = String(p.brandId || p.brand_id || '').trim();
    setAdminEditCats(cats.slice(0, 3));
    setAdminEditTags(tags.slice(0, 3));
    setAdminEditBrand({ id: bid, name: bname });
    setAdminProductTaxPicker(null);
    setAdminProductTaxSearch('');
  }, [adminProductDetailId]);

"""
    mark = "  useEffect(() => { setTaxSelectedIds([]); }, [adminTab, taxFilter]);"
    if mark in text:
        text = text.replace(mark, mark + "\n" + sync_effect, 1)
    else:
        text = text.replace(
            "  const [adminEditBrand, setAdminEditBrand] = useState({ id: '', name: '' });\n",
            "  const [adminEditBrand, setAdminEditBrand] = useState({ id: '', name: '' });\n" + sync_effect,
            1,
        )

# --- 3) UI block ---
start_marker = '                <p className="text-xs text-primary-500 font-medium">دسته‌بندی محصول <span className="text-primary-400 font-normal">(از فهرست ادمین)</span></p>'
# already patched variant
start_marker_alt = '                <p className="text-xs text-primary-500 font-medium">دسته‌بندی محصول <span className="text-primary-400 font-normal">(از فهرست ادمین — کلیک برای باز شدن زبانه)</span></p>'
end_marker = '              <label className="text-xs text-primary-500 space-y-1"><span>آدرس تصویر شاخص</span>'

si = text.find(start_marker)
if si < 0:
    si = text.find(start_marker_alt)
ei = text.find(end_marker)
if si < 0 or ei < 0 or ei <= si:
    raise SystemExit(f"taxonomy UI block not found (si={si}, ei={ei})")

block_start = text.rfind('<div className="sm:col-span-2 space-y-2">', 0, si)
if block_start < 0:
    block_start = si

if "adminProductTaxPicker &&" not in text[block_start:ei]:
    NEW_UI = r'''              <div className="sm:col-span-2 space-y-2">
                <p className="text-xs text-primary-500 font-medium">دسته‌بندی محصول <span className="text-primary-400 font-normal">(از فهرست ادمین — کلیک برای باز شدن زبانه)</span></p>
                <button
                  type="button"
                  onClick={() => { setAdminProductTaxPicker((v) => v === 'cats' ? null : 'cats'); setAdminProductTaxSearch(''); }}
                  className="w-full text-right px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white flex items-center justify-between gap-2"
                >
                  <span className="truncate">{adminEditCats.length ? adminEditCats.join('، ') : 'انتخاب دسته…'}</span>
                  <span className="text-[11px] text-primary-400 shrink-0">{adminEditCats.length}/۳</span>
                </button>
                {!(adminCategories || []).filter((c) => c && c.active !== false && String(c.status || '') !== 'archived').length && (
                  <p className="text-[11px] text-amber-600">هنوز دسته‌ای تعریف نشده — از تب دسته‌بندی اضافه کنید</p>
                )}
              </div>
              <div className="sm:col-span-2 space-y-2">
                <p className="text-xs text-primary-500 font-medium">برند محصول <span className="text-primary-400 font-normal">(فقط از فهرست ادمین — کلیک برای باز شدن زبانه)</span></p>
                <button
                  type="button"
                  onClick={() => { setAdminProductTaxPicker((v) => v === 'brand' ? null : 'brand'); setAdminProductTaxSearch(''); }}
                  className="w-full text-right px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white flex items-center justify-between gap-2"
                >
                  <span className="truncate">{adminEditBrand.name || 'انتخاب برند…'}</span>
                  <span className="text-[11px] text-primary-400 shrink-0">تکی</span>
                </button>
                {!(adminCatalogBrands || []).filter((b) => b && b.active !== false && String(b.status || '') !== 'archived').length && (
                  <p className="text-[11px] text-amber-600">هنوز برندی تعریف نشده — از تب برندها اضافه کنید</p>
                )}
              </div>
              <div className="sm:col-span-2 space-y-2">
                <p className="text-xs text-primary-500 font-medium">برچسب محصول <span className="text-primary-400 font-normal">(چندتایی از فهرست ادمین — کلیک برای باز شدن زبانه)</span></p>
                <button
                  type="button"
                  onClick={() => { setAdminProductTaxPicker((v) => v === 'tags' ? null : 'tags'); setAdminProductTaxSearch(''); }}
                  className="w-full text-right px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white flex items-center justify-between gap-2"
                >
                  <span className="truncate">{adminEditTags.length ? adminEditTags.join('، ') : 'انتخاب برچسب…'}</span>
                  <span className="text-[11px] text-primary-400 shrink-0">{adminEditTags.length}/۳</span>
                </button>
                {!(adminTags || []).filter((tg) => tg && tg.active !== false && String(tg.status || '') !== 'archived').length && (
                  <p className="text-[11px] text-amber-600">هنوز برچسبی تعریف نشده — از تب برچسب محصولات اضافه کنید</p>
                )}
              </div>
              {adminProductTaxPicker && (
                <div className="sm:col-span-2 rounded-2xl border border-primary-200 dark:border-white/15 bg-primary-50/80 dark:bg-primary-950/80 overflow-hidden">
                  <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-b border-primary-100 dark:border-white/10">
                    <p className="text-xs font-bold text-primary-900 dark:text-white">
                      {adminProductTaxPicker === 'cats' ? 'انتخاب دسته‌بندی'
                        : adminProductTaxPicker === 'tags' ? 'انتخاب برچسب'
                        : 'انتخاب برند'}
                    </p>
                    <button type="button" onClick={() => setAdminProductTaxPicker(null)} className="text-[11px] px-2 py-1 rounded-full border border-primary-200 dark:border-white/20">بستن</button>
                  </div>
                  <div className="px-3 py-2 border-b border-primary-100 dark:border-white/10">
                    <input
                      type="search"
                      value={adminProductTaxSearch}
                      onChange={(e) => setAdminProductTaxSearch(e.target.value)}
                      placeholder="جستجو…"
                      className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto p-2 flex flex-wrap gap-1.5">
                    {(() => {
                      const q = String(adminProductTaxSearch || '').trim().toLowerCase();
                      let items = [];
                      if (adminProductTaxPicker === 'cats') {
                        items = (adminCategories || []).filter((c) => c && c.active !== false && String(c.status || '') !== 'archived');
                      } else if (adminProductTaxPicker === 'tags') {
                        items = (adminTags || []).filter((tg) => tg && tg.active !== false && String(tg.status || '') !== 'archived');
                      } else {
                        items = (adminCatalogBrands || []).filter((b) => b && b.active !== false && String(b.status || '') !== 'archived');
                      }
                      if (q) items = items.filter((it) => String(it.name || '').toLowerCase().includes(q) || String(it.slug || '').toLowerCase().includes(q));
                      if (!items.length) {
                        return <p className="text-xs text-primary-400 w-full text-center py-4">موردی یافت نشد</p>;
                      }
                      return items.map((item) => {
                        const name = String(item.name || '').trim();
                        if (!name) return null;
                        let selected = false;
                        if (adminProductTaxPicker === 'cats') selected = adminEditCats.includes(name);
                        else if (adminProductTaxPicker === 'tags') selected = adminEditTags.includes(name);
                        else selected = adminEditBrand.name === name || String(adminEditBrand.id) === String(item.id);
                        return (
                          <label
                            key={item.id || name}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs cursor-pointer transition ${selected ? 'bg-apple-blue text-white border-apple-blue' : 'border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-primary-800 dark:text-white'}`}
                          >
                            <input
                              type={adminProductTaxPicker === 'brand' ? 'radio' : 'checkbox'}
                              name={adminProductTaxPicker === 'brand' ? 'admin_brand_pick' : undefined}
                              checked={selected}
                              onChange={() => {
                                if (adminProductTaxPicker === 'cats') {
                                  setAdminEditCats((prev) => {
                                    if (prev.includes(name)) return prev.filter((x) => x !== name);
                                    if (prev.length >= 3) return prev;
                                    return [...prev, name];
                                  });
                                } else if (adminProductTaxPicker === 'tags') {
                                  setAdminEditTags((prev) => {
                                    if (prev.includes(name)) return prev.filter((x) => x !== name);
                                    if (prev.length >= 3) return prev;
                                    return [...prev, name];
                                  });
                                } else {
                                  setAdminEditBrand({ id: String(item.id || ''), name });
                                }
                              }}
                              className="sr-only"
                            />
                            {name}
                          </label>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
              <input type="hidden" name="category" value={adminEditCats[0] || ''} />
              <input type="hidden" name="brand" value={adminEditBrand.name || ''} />
              <input type="hidden" name="brand_id" value={adminEditBrand.id || ''} />
              {adminEditTags.map((tg) => (
                <input key={`htag-${tg}`} type="hidden" name="tag_pick" value={tg} defaultChecked />
              ))}
'''
    text = text[:block_start] + NEW_UI + text[ei:]

# --- 4) submit: خواندن از state ---
old_cat = """              const category = String(fd.get('category') || '').trim();
              const brand = String(fd.get('brand') || '').trim();
              const brandId = (() => {
                try {
                  const checked = e.currentTarget.querySelector('input[name="brand"]:checked');
                  return checked ? String(checked.getAttribute('data-brand-id') || '').trim() : '';
                } catch (_) { return ''; }
              })();"""

new_cat = """              const category = (Array.isArray(adminEditCats) && adminEditCats[0]) || String(fd.get('category') || '').trim();
              const categories = (Array.isArray(adminEditCats) && adminEditCats.length)
                ? adminEditCats.filter(Boolean).slice(0, 3)
                : (category ? [category] : []);
              const brand = (adminEditBrand && adminEditBrand.name) || String(fd.get('brand') || '').trim();
              const brandId = (adminEditBrand && adminEditBrand.id) || String(fd.get('brand_id') || '').trim() || (() => {
                try {
                  const checked = e.currentTarget.querySelector('input[name="brand"]:checked');
                  return checked ? String(checked.getAttribute('data-brand-id') || '').trim() : '';
                } catch (_) { return ''; }
              })();"""

if old_cat in text:
    text = text.replace(old_cat, new_cat, 1)
elif "Array.isArray(adminEditCats) && adminEditCats[0]" not in text:
    raise SystemExit("could not patch category/brand submit readers")

# tags
m = re.search(
    r"const tags = Array\.from\(e\.currentTarget\.querySelectorAll\('input\[name=\"tag_pick\"\]:checked'\)\)[^;]+;",
    text,
)
if m and "adminEditTags" not in m.group(0):
    text = text.replace(
        m.group(0),
        "const tags = (Array.isArray(adminEditTags) && adminEditTags.length)\n"
        "                ? adminEditTags.slice(0, 3)\n"
        "                : Array.from(e.currentTarget.querySelectorAll('input[name=\"tag_pick\"]:checked')).map((el) => String(el.value || '').trim()).filter(Boolean);",
        1,
    )

# body
# چند حالت ممکن برای categories در body
replacements = [
    (
        "body: JSON.stringify({ id: p.id, name, title: name, price, base_price: price, stock, category, brand, brand_id: brandId || undefined, brandId: brandId || undefined, description, image, cover_image: image, colors, sizes, tags, categories: category ? [category] : [] }),",
        "body: JSON.stringify({ id: p.id, name, title: name, price, base_price: price, stock, category: category || (categories[0] || ''), brand, brand_id: brandId || undefined, brandId: brandId || undefined, description, image, cover_image: image, colors, sizes, tags, categories }),",
    ),
    (
        "body: JSON.stringify({ id: p.id, name, title: name, price, base_price: price, stock, category, brand, brand_id: brandId || undefined, brandId: brandId || undefined, description, image, cover_image: image, colors, sizes, tags, categories: (Array.isArray(adminEditCats) && adminEditCats.length ? adminEditCats : (category ? [category] : [])), category: (adminEditCats && adminEditCats[0]) || category || '' }),",
        "body: JSON.stringify({ id: p.id, name, title: name, price, base_price: price, stock, category: category || (categories[0] || ''), brand, brand_id: brandId || undefined, brandId: brandId || undefined, description, image, cover_image: image, colors, sizes, tags, categories }),",
    ),
]
for a, b in replacements:
    if a in text:
        text = text.replace(a, b, 1)
        break

if text == orig:
    raise SystemExit("No changes applied — already patched or markers shifted")

path.write_text(text, encoding="utf-8")
print("OK: AdminPanelContent.jsx patched")
print("  - click-to-open tabs for category / tag / brand")
print("  - ticks from admin-defined lists (cats/tags max 3, brand single)")
print("  - submit uses adminEdit state")
PY

echo ""
echo "Done."
echo "  git diff --stat -- components/panels/AdminPanelContent.jsx"
echo "  git add components/panels/AdminPanelContent.jsx"
echo "  git commit -m 'admin: product edit taxonomy tabs (cat/tag/brand from admin lists)'"
echo "  git push"
