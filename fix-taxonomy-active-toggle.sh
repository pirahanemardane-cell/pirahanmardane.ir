#!/usr/bin/env bash
set -euo pipefail
echo "=== taxonomy active/inactive toggle buttons ==="
if [ ! -f package.json ] || [ ! -f components/panels/AdminPanelContent.jsx ]; then
  echo "Error: داخل ریشه پروژه اجرا کنید"; exit 1
fi
STAMP=$(date +%Y%m%d%H%M%S)
mkdir -p .bak-panel-fix
cp -f components/panels/AdminPanelContent.jsx ".bak-panel-fix/AdminPanelContent.jsx.tax-toggle.$STAMP"

python3 << 'PY'
from pathlib import Path
path = Path("components/panels/AdminPanelContent.jsx")
text = path.read_text(encoding="utf-8")
orig = text
n = 0

def rep(old, new, label):
    global text, n
    c = text.count(old)
    if c:
        text = text.replace(old, new)
        n += c
        print(f"OK ({c}x): {label}")
    else:
        print(f"SKIP: {label}")

rep(
    """<span className={`text-xs px-2 py-0.5 rounded-full ${isTaxArchived(c) ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}`}>{isTaxArchived(c) ? 'آرشیو' : 'فعال'}</span>""",
    """<button type="button" title={isTaxArchived(c) ? 'فعال‌سازی' : 'غیرفعال‌سازی'} onClick={() => {
                  if (typeof saveAdminCategories !== 'function') return;
                  const nextOn = isTaxArchived(c);
                  saveAdminCategories((adminCategories || []).map((x) => x.id === c.id ? { ...x, active: nextOn, status: nextOn ? 'active' : 'archived' } : x));
                  try { showToast({ message: nextOn ? 'دسته فعال شد' : 'دسته غیرفعال شد', variant: 'success', duration: 2500, position: 'top-center' }); } catch (_) {}
                }} className={`text-xs px-2 py-0.5 rounded-full border font-medium cursor-pointer ${isTaxArchived(c) ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300' : 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300'}`}>{isTaxArchived(c) ? 'غیرفعال' : 'فعال'}</button>""",
    "product category",
)

rep(
    """<span className={`text-xs px-2 py-0.5 rounded-full ${isTaxArchived(tg) ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}`}>{isTaxArchived(tg) ? 'آرشیو' : 'فعال'}</span>""",
    """<button type="button" title={isTaxArchived(tg) ? 'فعال‌سازی' : 'غیرفعال‌سازی'} onClick={() => {
                  if (typeof saveAdminTags !== 'function') return;
                  const nextOn = isTaxArchived(tg);
                  saveAdminTags((adminTags || []).map((x) => x.id === tg.id ? { ...x, active: nextOn, status: nextOn ? 'active' : 'archived' } : x));
                  try { showToast({ message: nextOn ? 'برچسب فعال شد' : 'برچسب غیرفعال شد', variant: 'success', duration: 2500, position: 'top-center' }); } catch (_) {}
                }} className={`text-xs px-2 py-0.5 rounded-full border font-medium cursor-pointer ${isTaxArchived(tg) ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300' : 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300'}`}>{isTaxArchived(tg) ? 'غیرفعال' : 'فعال'}</button>""",
    "product tag",
)

rep(
    """<span className={`text-xs px-2 py-0.5 rounded-full ${isTaxArchived(b) ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}`}>{isTaxArchived(b) ? 'آرشیو' : 'فعال'}</span>""",
    """<button type="button" title={isTaxArchived(b) ? 'فعال‌سازی' : 'غیرفعال‌سازی'} onClick={() => {
                  if (typeof saveAdminCatalogBrands !== 'function') return;
                  const nextOn = isTaxArchived(b);
                  saveAdminCatalogBrands((adminCatalogBrands || []).map((x) => x.id === b.id ? { ...x, active: nextOn, status: nextOn ? 'active' : 'archived' } : x));
                  try { showToast({ message: nextOn ? 'برند فعال شد' : 'برند غیرفعال شد', variant: 'success', duration: 2500, position: 'top-center' }); } catch (_) {}
                }} className={`text-xs px-2 py-0.5 rounded-full border font-medium cursor-pointer ${isTaxArchived(b) ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300' : 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300'}`}>{isTaxArchived(b) ? 'غیرفعال' : 'فعال'}</button>""",
    "brand",
)

rep(
    """<span className={`text-xs px-2 py-1 rounded-full border ${isTaxArchived(c) ? 'border-amber-300 text-amber-700' : 'border-emerald-300 text-emerald-700'}`}>{isTaxArchived(c) ? 'آرشیو' : 'فعال'}</span>
                <button type="button" onClick={() => openTaxonomyWizard('blog-category', c)}""",
    """<button type="button" title={isTaxArchived(c) ? 'فعال‌سازی' : 'غیرفعال‌سازی'} onClick={() => {
                  if (typeof saveAdminBlogCategories !== 'function') return;
                  const nextOn = isTaxArchived(c);
                  saveAdminBlogCategories((adminBlogCategories || []).map((x) => x.id === c.id ? { ...x, active: nextOn, status: nextOn ? 'active' : 'archived' } : x));
                  try { showToast({ message: nextOn ? 'دسته مقاله فعال شد' : 'دسته مقاله غیرفعال شد', variant: 'success', duration: 2500, position: 'top-center' }); } catch (_) {}
                }} className={`text-xs px-2 py-1 rounded-full border font-medium cursor-pointer ${isTaxArchived(c) ? 'border-amber-300 text-amber-700 bg-amber-50' : 'border-emerald-300 text-emerald-700 bg-emerald-50'}`}>{isTaxArchived(c) ? 'غیرفعال' : 'فعال'}</button>
                <button type="button" onClick={() => openTaxonomyWizard('blog-category', c)}""",
    "blog category",
)

rep(
    """<span className={`text-xs px-2 py-0.5 rounded-full ${isTaxArchived(tg) ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>{isTaxArchived(tg) ? 'آرشیو' : 'فعال'}</span>""",
    """<button type="button" title={isTaxArchived(tg) ? 'فعال‌سازی' : 'غیرفعال‌سازی'} onClick={() => {
                  const saver = typeof saveAdminBlogTags === 'function' ? saveAdminBlogTags : (typeof saveAdminTags === 'function' ? saveAdminTags : null);
                  const list = typeof saveAdminBlogTags === 'function' ? (adminBlogTags || []) : (adminTags || []);
                  if (!saver) return;
                  const nextOn = isTaxArchived(tg);
                  saver(list.map((x) => x.id === tg.id ? { ...x, active: nextOn, status: nextOn ? 'active' : 'archived' } : x));
                  try { showToast({ message: nextOn ? 'برچسب فعال شد' : 'برچسب غیرفعال شد', variant: 'success', duration: 2500, position: 'top-center' }); } catch (_) {}
                }} className={`text-xs px-2 py-0.5 rounded-full border font-medium cursor-pointer ${isTaxArchived(tg) ? 'bg-red-100 text-red-700 border-red-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>{isTaxArchived(tg) ? 'غیرفعال' : 'فعال'}</button>""",
    "blog tag short",
)

if text == orig:
    raise SystemExit("No changes applied")
path.write_text(text, encoding="utf-8")
print(f"Done: {n} replacements")
PY
