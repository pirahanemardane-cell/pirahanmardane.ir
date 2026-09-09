#!/usr/bin/env bash
set -euo pipefail
echo "=== bulk activate / deactivate ==="
if [ ! -f package.json ] || [ ! -f components/panels/AdminPanelContent.jsx ]; then
  echo "Error: داخل ریشه پروژه اجرا کنید"; exit 1
fi
STAMP=$(date +%Y%m%d%H%M%S)
mkdir -p .bak-panel-fix
cp -f components/panels/AdminPanelContent.jsx ".bak-panel-fix/AdminPanelContent.jsx.bulk-act.$STAMP"
echo "Backup: .bak-panel-fix/AdminPanelContent.jsx.bulk-act.$STAMP"

python3 << 'PY'
from pathlib import Path
import re

path = Path("components/panels/AdminPanelContent.jsx")
text = path.read_text(encoding="utf-8")
orig = text

if "mode === 'activate' || mode === 'deactivate'" not in text[text.find("runAdminBulkProducts"):text.find("runAdminBulkProducts")+900]:
    soft_old = """  setAdminBulkBusy(true);
  try {
   if (isPurge && typeof adminBulkPurgeProducts === 'function') await adminBulkPurgeProducts(ids);"""
    soft_new = """  setAdminBulkBusy(true);
  try {
   if (mode === 'activate' || mode === 'deactivate') {
    const st = mode === 'activate' ? 'active' : 'inactive';
    for (const id of ids) {
     try {
      if (typeof patchAdminProductStatus === 'function') await patchAdminProductStatus(id, st);
      else if (typeof adminPatchProductStatus === 'function') await adminPatchProductStatus(id, st);
     } catch (_) {}
    }
    try { if (typeof hydrateAdminProducts === 'function') await hydrateAdminProducts(); } catch (_) {}
    try { showToast({ message: mode === 'activate' ? 'محصولات فعال شدند' : 'محصولات غیرفعال شدند', variant: 'success', duration: 3000, position: 'top-center' }); } catch (_) {}
   } else if (isPurge && typeof adminBulkPurgeProducts === 'function') await adminBulkPurgeProducts(ids);"""
    if soft_old in text:
        text = text.replace(soft_old, soft_new, 1)
        print("OK products handler")
    else:
        print("WARN products handler")
else:
    print("products handler already")

marker = "{adminSelectedProductIds.length} محصول انتخاب شده</span>"
if marker in text and "runAdminBulkProducts('activate')" not in text:
    text = text.replace(
        marker,
        marker + """
             <button type="button" disabled={adminBulkBusy} onClick={() => runAdminBulkProducts('activate')} className="text-xs px-3 py-1.5 rounded-full border border-emerald-300 text-emerald-700 bg-emerald-50 font-medium disabled:opacity-50">فعال گروهی</button>
             <button type="button" disabled={adminBulkBusy} onClick={() => runAdminBulkProducts('deactivate')} className="text-xs px-3 py-1.5 rounded-full border border-amber-300 text-amber-700 bg-amber-50 font-medium disabled:opacity-50">غیرفعال گروهی</button>""",
        1,
    )
    print("OK products bar")
elif "runAdminBulkProducts('activate')" in text:
    print("products bar already")
else:
    print("WARN products bar")

specs = [
    ("runTaxBulkCategory", "saveAdminCategories", "دسته"),
    ("runTaxBulkTag", "saveAdminTags", "برچسب"),
    ("runTaxBulkBrand", "saveAdminCatalogBrands", "برند"),
    ("runTaxBulkBlogCategory", "saveAdminBlogCategories", "دسته مقاله"),
    ("runTaxBulkBlogTag", "saveAdminBlogTags", "برچسب مقاله"),
]

for fn, save_fn, entity in specs:
    marker = "const " + fn + " = async (mode) => {"
    start = text.find(marker)
    if start < 0:
        print("missing", fn)
        continue
    end = text.find("\n  const run", start + 20)
    if end < 0:
        end = text.find("\n const run", start + 20)
    if end < 0:
        end = start + 2500
    body = text[start:end]
    body2 = body
    if "const isActivate = mode === 'activate';" not in body2:
        body2 = body2.replace(
            "const isPurge = mode === 'purge';\n    const isRestore = mode === 'restore';",
            "const isPurge = mode === 'purge';\n    const isRestore = mode === 'restore';\n    const isActivate = mode === 'activate';\n    const isDeactivate = mode === 'deactivate';",
            1,
        )
    m = re.search(r"if \(isRestore\) msg = '[^']+';", body2)
    if m and "isActivate) msg" not in body2:
        body2 = body2.replace(
            m.group(0),
            m.group(0)
            + "\n    if (isActivate) msg = 'فعال‌سازی ' + ids.size + ' "
            + entity
            + "؟';\n    if (isDeactivate) msg = 'غیرفعال‌سازی ' + ids.size + ' "
            + entity
            + "؟';",
            1,
        )
    if ("isActivate) " + save_fn) not in body2:
        m2 = re.search(r"else if \(isRestore\) " + re.escape(save_fn) + r"\([^;]+;", body2)
        if m2:
            insert = m2.group(0)
            add = (
                insert
                + "\n      else if (isActivate) "
                + save_fn
                + "(list.map((x) => ids.has(String(x.id)) ? { ...x, status: 'active', active: true } : x));\n"
                + "      else if (isDeactivate) "
                + save_fn
                + "(list.map((x) => ids.has(String(x.id)) ? { ...x, status: 'archived', active: false } : x));"
            )
            body2 = body2.replace(insert, add, 1)
            print("OK", fn)
        else:
            print("WARN branch", fn)
    else:
        print("already", fn)
    text = text[:start] + body2 + text[end:]

bp_start = text.find("const runTaxBulkBlogPost = async")
if bp_start >= 0:
    body_end = text.find("\n  const run", bp_start + 20)
    if body_end < 0:
        body_end = text.find("\n const run", bp_start + 20)
    if body_end < 0:
        body_end = bp_start + 2000
    body = text[bp_start:body_end]
    body2 = body
    if "const isActivate = mode === 'activate';" not in body2:
        body2 = body2.replace(
            "const isPurge = mode === 'purge';\n    const isRestore = mode === 'restore';",
            "const isPurge = mode === 'purge';\n    const isRestore = mode === 'restore';\n    const isActivate = mode === 'activate';\n    const isDeactivate = mode === 'deactivate';",
            1,
        )
    if "else if (isActivate)" not in body2:
        body2 = body2.replace(
            "      } else if (isRestore) {\n        saveBlogPosts(list.map((x) => ids.has(String(x.id)) ? { ...x, status: 'draft' } : x));\n      } else {",
            "      } else if (isActivate) {\n        saveBlogPosts(list.map((x) => ids.has(String(x.id)) ? { ...x, status: 'published' } : x));\n      } else if (isDeactivate) {\n        saveBlogPosts(list.map((x) => ids.has(String(x.id)) ? { ...x, status: 'draft' } : x));\n      } else if (isRestore) {\n        saveBlogPosts(list.map((x) => ids.has(String(x.id)) ? { ...x, status: 'draft' } : x));\n      } else {",
            1,
        )
        m = re.search(r"if \(isRestore\) msg = '[^']+';", body2)
        if m and "isActivate) msg" not in body2:
            body2 = body2.replace(
                m.group(0),
                m.group(0)
                + "\n    if (isActivate) msg = 'فعال‌سازی (انتشار) ' + ids.size + ' مطلب؟';\n    if (isDeactivate) msg = 'غیرفعال‌سازی ' + ids.size + ' مطلب؟';",
                1,
            )
        print("OK blog post")
    else:
        print("blog post already")
    text = text[:bp_start] + body2 + text[body_end:]

for fn in [
    "runTaxBulkCategory",
    "runTaxBulkTag",
    "runTaxBulkBrand",
    "runTaxBulkBlogCategory",
    "runTaxBulkBlogTag",
    "runTaxBulkBlogPost",
]:
    needle = "onClick={() => " + fn + "('archive')}"
    idx = 0
    count = 0
    while True:
        i = text.find(needle, idx)
        if i < 0:
            break
        bar_start = text.rfind("taxSelectedIds.length > 0", 0, i)
        if bar_start < 0:
            idx = i + 10
            continue
        span_end = text.find("</span>", bar_start)
        if span_end < 0 or span_end > i:
            idx = i + 10
            continue
        if fn + "('activate')" in text[bar_start:i]:
            idx = i + 10
            continue
        insert_at = span_end + len("</span>")
        buttons = (
            "\n                <button type=\"button\" disabled={taxBusy} onClick={() => "
            + fn
            + "('activate')} className=\"text-xs px-3 py-1.5 rounded-full border border-emerald-300 text-emerald-700 bg-emerald-50 disabled:opacity-50\">فعال گروهی</button>\n"
            + "                <button type=\"button\" disabled={taxBusy} onClick={() => "
            + fn
            + "('deactivate')} className=\"text-xs px-3 py-1.5 rounded-full border border-amber-300 text-amber-700 bg-amber-50 disabled:opacity-50\">غیرفعال گروهی</button>"
        )
        text = text[:insert_at] + buttons + text[insert_at:]
        count += 1
        idx = insert_at + len(buttons) + 20
    print("UI", fn, count)

if text == orig:
    print("No changes — maybe already applied")
else:
    path.write_text(text, encoding="utf-8")
    print("Done. فعال گروهی:", text.count("فعال گروهی"))
PY

