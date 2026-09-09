#!/usr/bin/env bash
set -euo pipefail
echo "=== taxonomy multi-select + archive ==="
if [ ! -f package.json ] || [ ! -f components/panels/AdminPanelContent.jsx ]; then
  echo "Error: داخل ریشه پروژه اجرا کنید"; exit 1
fi
STAMP=$(date +%Y%m%d%H%M%S)
mkdir -p .bak-panel-fix
cp -f components/panels/AdminPanelContent.jsx ".bak-panel-fix/AdminPanelContent.jsx.tax.$STAMP"
echo "Backup ok"

python3 << 'PY'
from pathlib import Path
import re
path = Path("components/panels/AdminPanelContent.jsx")
text = path.read_text(encoding="utf-8")
orig = text

if "taxSelectedIds" not in text:
    text = text.replace(
        "const [adminSelectedProductIds, setAdminSelectedProductIds] = useState([]);\n",
        "const [adminSelectedProductIds, setAdminSelectedProductIds] = useState([]);\n"
        "  const [taxSelectedIds, setTaxSelectedIds] = useState([]);\n"
        "  const [taxFilter, setTaxFilter] = useState('active');\n"
        "  const [taxBusy, setTaxBusy] = useState(false);\n",
        1,
    )
    text = text.replace(
        "useEffect(() => { setAdminSelectedProductIds([]); }, [adminProductFilter, adminProductSearch]);",
        "useEffect(() => { setAdminSelectedProductIds([]); }, [adminProductFilter, adminProductSearch]);\n"
        "  useEffect(() => { setTaxSelectedIds([]); }, [adminTab, taxFilter]);",
        1,
    )

HELPER = r'''
  const isTaxArchived = (item) => String(item?.status || '').toLowerCase() === 'archived';
  const toggleTaxSelect = (id) => {
    const sid = String(id);
    setTaxSelectedIds((prev) => (prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid]));
  };
  const filterTaxList = (list) => {
    const arr = Array.isArray(list) ? list : [];
    if (taxFilter === 'archived') return arr.filter(isTaxArchived);
    return arr.filter((x) => !isTaxArchived(x));
  };
  const runTaxBulk = async (kind, mode) => {
    const ids = new Set(taxSelectedIds.map(String));
    if (!ids.size) {
      try { showToast({ message: 'موردی انتخاب نشده', variant: 'error', duration: 2500, position: 'top-center' }); } catch (_) {}
      return;
    }
    const isPurge = mode === 'purge';
    const msg = isPurge
      ? (`حذف دائم ${ids.size} مورد از آرشیو؟ برگشت‌پذیر نیست.`)
      : (`آرشیو ${ids.size} مورد انتخاب‌شده؟`);
    const ok = typeof siteConfirm === 'function'
      ? await siteConfirm(msg, isPurge ? 'حذف دائم گروهی' : 'آرشیو گروهی')
      : (typeof window !== 'undefined' && window.confirm(msg));
    if (!ok) return;
    setTaxBusy(true);
    try {
      const mapArchive = (list) => (list || []).map((x) => ids.has(String(x.id)) ? { ...x, status: 'archived' } : x);
      const mapPurge = (list) => (list || []).filter((x) => !ids.has(String(x.id)));
      if (kind === 'category') {
        if (isPurge) saveAdminCategories(mapPurge(adminCategories));
        else saveAdminCategories(mapArchive(adminCategories));
      } else if (kind === 'tag') {
        if (isPurge) saveAdminTags(mapPurge(adminTags));
        else saveAdminTags(mapArchive(adminTags));
      } else if (kind === 'brand') {
        if (isPurge) saveAdminCatalogBrands(mapPurge(adminCatalogBrands));
        else saveAdminCatalogBrands(mapArchive(adminCatalogBrands));
      } else if (kind === 'blog-category') {
        if (isPurge) saveAdminBlogCategories(mapPurge(adminBlogCategories));
        else saveAdminBlogCategories(mapArchive(adminBlogCategories));
      } else if (kind === 'blog-tag') {
        if (isPurge) saveAdminBlogTags(mapPurge(adminBlogTags));
        else saveAdminBlogTags(mapArchive(adminBlogTags));
      } else if (kind === 'blog') {
        try {
          if (isPurge && typeof deleteBlogPost === 'function') {
            for (const id of ids) { try { await deleteBlogPost(id); } catch (_) {} }
          } else if (typeof patchBlogPostStatus === 'function') {
            for (const id of ids) { try { await patchBlogPostStatus(id, isPurge ? 'deleted' : 'archived'); } catch (_) {} }
          } else if (typeof saveBlogPosts === 'function') {
            const list = blogPosts || [];
            saveBlogPosts(isPurge ? mapPurge(list) : mapArchive(list));
          }
          if (typeof hydrateBlogPostsFromApi === 'function') try { hydrateBlogPostsFromApi(); } catch (_) {}
        } catch (_) {}
      }
      setTaxSelectedIds([]);
      try { showToast({ message: isPurge ? 'حذف دائم انجام شد' : 'به آرشیو منتقل شد', variant: 'success', duration: 3000, position: 'top-center' }); } catch (_) {}
    } finally {
      setTaxBusy(false);
    }
  };
  const taxToolbar = (kind, visibleList) => {
    const allIds = (visibleList || []).map((x) => String(x.id));
    const allSelected = allIds.length > 0 && allIds.every((id) => taxSelectedIds.includes(id));
    return (
      <div className="space-y-2 mb-3">
        <div className="flex flex-wrap gap-1.5">
          {[{ id: 'active', l: 'فعال‌ها' }, { id: 'archived', l: 'آرشیو شده‌ها' }].map((f) => (
            <button key={f.id} type="button" onClick={() => setTaxFilter(f.id)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium ${taxFilter === f.id ? 'bg-primary-900 text-white border-primary-900 dark:bg-white dark:text-primary-900' : 'border-primary-200 dark:border-white/20'}`}>{f.l}</button>
          ))}
        </div>
        {taxSelectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40">
            <span className="text-xs font-medium text-red-800 dark:text-red-200">{taxSelectedIds.length} مورد انتخاب شده</span>
            <button type="button" disabled={taxBusy} onClick={() => runTaxBulk(kind, taxFilter === 'archived' ? 'purge' : 'archive')}
              className="text-xs px-3 py-1.5 rounded-full bg-red-600 text-white font-medium disabled:opacity-50">
              {taxBusy ? 'در حال اجرا…' : (taxFilter === 'archived' ? 'حذف دائم گروهی' : 'آرشیو گروهی')}
            </button>
            {taxFilter === 'archived' && (
              <button type="button" disabled={taxBusy} onClick={async () => {
                const ids = new Set(taxSelectedIds.map(String));
                const ok = typeof siteConfirm === 'function' ? await siteConfirm('بازگردانی موارد انتخاب‌شده از آرشیو؟', 'بازگردانی') : window.confirm('بازگردانی؟');
                if (!ok) return;
                setTaxBusy(true);
                try {
                  const rest = (list) => (list || []).map((x) => ids.has(String(x.id)) ? { ...x, status: 'active' } : x);
                  if (kind === 'category') saveAdminCategories(rest(adminCategories));
                  else if (kind === 'tag') saveAdminTags(rest(adminTags));
                  else if (kind === 'brand') saveAdminCatalogBrands(rest(adminCatalogBrands));
                  else if (kind === 'blog-category') saveAdminBlogCategories(rest(adminBlogCategories));
                  else if (kind === 'blog-tag') saveAdminBlogTags(rest(adminBlogTags));
                  setTaxSelectedIds([]);
                  try { showToast({ message: 'بازگردانی شد', variant: 'success', duration: 2500, position: 'top-center' }); } catch (_) {}
                } finally { setTaxBusy(false); }
              }} className="text-xs px-3 py-1.5 rounded-full border border-emerald-300 text-emerald-700 bg-emerald-50">بازگردانی گروهی</button>
            )}
            <button type="button" onClick={() => setTaxSelectedIds([])} className="text-xs px-3 py-1.5 rounded-full border border-primary-300 dark:border-white/30">لغو انتخاب</button>
          </div>
        )}
        {allIds.length > 0 && (
          <label className="flex items-center gap-2 text-xs text-primary-600 dark:text-white/70 cursor-pointer">
            <input type="checkbox" checked={allSelected} onChange={() => {
              if (allSelected) setTaxSelectedIds([]);
              else setTaxSelectedIds(allIds);
            }} className="rounded border-primary-300" />
            انتخاب همه در این فهرست ({allIds.length})
          </label>
        )}
      </div>
    );
  };
'''

if "const isTaxArchived" not in text:
    m = re.search(r"const runAdminBulkProducts = async \(mode\) => \{[\s\S]*?\n  \};\n", text)
    if m:
        text = text[: m.end()] + HELPER + text[m.end() :]
    else:
        m2 = re.search(r"const toggleAdminProductSelect = \([^)]*\) => \{[^}]*\};\n", text)
        if m2:
            text = text[: m2.end()] + HELPER + text[m2.end() :]
        else:
            print("WARN: helper insert point not found")

# categories
text = text.replace(
    "{(adminCategories || []).map((c) => (\n              <div key={c.id} className=\"flex flex-wrap items-center gap-3 p-3 rounded-xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900\">",
    "{taxToolbar('category', filterTaxList(adminCategories))}\n"
    "            {filterTaxList(adminCategories).map((c) => (\n"
    "              <div key={c.id} className={`flex flex-wrap items-center gap-3 p-3 rounded-xl border bg-white dark:bg-primary-900 ${taxSelectedIds.includes(String(c.id)) ? 'border-apple-blue ring-1 ring-apple-blue/30' : 'border-primary-200 dark:border-white/15'}`}>\n"
    "               <input type=\"checkbox\" checked={taxSelectedIds.includes(String(c.id))} onChange={() => toggleTaxSelect(c.id)} className=\"rounded border-primary-300 flex-shrink-0\" aria-label=\"انتخاب\" />",
    1,
)
text = text.replace(
    "siteConfirm('حذف این دسته؟').then(ok=>{ if(ok) saveAdminCategories((adminCategories || []).filter(x => x.id !== c.id)); });",
    "siteConfirm(isTaxArchived(c) ? 'حذف دائم این دسته؟ برگشت‌پذیر نیست.' : 'این دسته به آرشیو منتقل شود؟').then(ok=>{ if(!ok) return; if(isTaxArchived(c)) saveAdminCategories((adminCategories || []).filter(x => x.id !== c.id)); else saveAdminCategories((adminCategories || []).map(x => x.id === c.id ? { ...x, status: 'archived' } : x)); });",
    1,
)
text = text.replace(
    "{!(adminCategories || []).length && <p className=\"text-sm text-primary-400 text-center py-8\">دسته‌ای ثبت نشده</p>}",
    "{!filterTaxList(adminCategories).length && <p className=\"text-sm text-primary-400 text-center py-8\">{taxFilter === 'archived' ? 'آرشیو خالی است' : 'دسته‌ای ثبت نشده'}</p>}",
    1,
)

# tags
text = text.replace(
    "{(adminTags || []).map((t) => (\n              <div key={t.id} className=\"flex flex-wrap items-center gap-3 p-3 rounded-xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900\">",
    "{taxToolbar('tag', filterTaxList(adminTags))}\n"
    "            {filterTaxList(adminTags).map((t) => (\n"
    "              <div key={t.id} className={`flex flex-wrap items-center gap-3 p-3 rounded-xl border bg-white dark:bg-primary-900 ${taxSelectedIds.includes(String(t.id)) ? 'border-apple-blue ring-1 ring-apple-blue/30' : 'border-primary-200 dark:border-white/15'}`}>\n"
    "               <input type=\"checkbox\" checked={taxSelectedIds.includes(String(t.id))} onChange={() => toggleTaxSelect(t.id)} className=\"rounded border-primary-300 flex-shrink-0\" aria-label=\"انتخاب\" />",
    1,
)
text = text.replace(
    "siteConfirm('حذف این برچسب؟').then(ok=>{ if(ok) saveAdminTags((adminTags || []).filter(x => x.id !== t.id)); });",
    "siteConfirm(isTaxArchived(t) ? 'حذف دائم این برچسب؟ برگشت‌پذیر نیست.' : 'این برچسب به آرشیو منتقل شود؟').then(ok=>{ if(!ok) return; if(isTaxArchived(t)) saveAdminTags((adminTags || []).filter(x => x.id !== t.id)); else saveAdminTags((adminTags || []).map(x => x.id === t.id ? { ...x, status: 'archived' } : x)); });",
    1,
)

# brands
text = text.replace(
    "{(adminCatalogBrands || []).map(b => (",
    "{taxToolbar('brand', filterTaxList(adminCatalogBrands))}\n"
    "             {filterTaxList(adminCatalogBrands).map(b => (",
    1,
)
if "toggleTaxSelect(b.id)" not in text:
    text = re.sub(
        r"(filterTaxList\(adminCatalogBrands\)\.map\(b => \(\s*<div key=\{b\.id\} className=\"[^\"]+\">)",
        r"""\1
               <input type="checkbox" checked={taxSelectedIds.includes(String(b.id))} onChange={() => toggleTaxSelect(b.id)} className="rounded border-primary-300 flex-shrink-0" aria-label="انتخاب" />""",
        text,
        count=1,
    )
text = text.replace(
    "siteConfirm('حذف این برند؟').then(ok=>{ if(ok) saveAdminCatalogBrands((adminCatalogBrands || []).filter(x => x.id !== b.id)); });",
    "siteConfirm(isTaxArchived(b) ? 'حذف دائم این برند؟ برگشت‌پذیر نیست.' : 'این برند به آرشیو منتقل شود؟').then(ok=>{ if(!ok) return; if(isTaxArchived(b)) saveAdminCatalogBrands((adminCatalogBrands || []).filter(x => x.id !== b.id)); else saveAdminCatalogBrands((adminCatalogBrands || []).map(x => x.id === b.id ? { ...x, status: 'archived' } : x)); });",
    1,
)

# blog categories
text = text.replace(
    "{(adminBlogCategories || []).map((c) => (",
    "{taxToolbar('blog-category', filterTaxList(adminBlogCategories))}\n"
    "            {filterTaxList(adminBlogCategories).map((c) => (",
    1,
)
text = re.sub(
    r"(filterTaxList\(adminBlogCategories\)\.map\(\(c\) => \(\s*<div key=\{c\.id\} className=\"[^\"]+\">)",
    r"""\1
               <input type="checkbox" checked={taxSelectedIds.includes(String(c.id))} onChange={() => toggleTaxSelect(c.id)} className="rounded border-primary-300 flex-shrink-0" aria-label="انتخاب" />""",
    text,
    count=1,
)
text = text.replace(
    "siteConfirm('حذف این دسته بلاگ؟').then((ok) => { if (ok) saveAdminBlogCategories((adminBlogCategories || []).filter((x) => x.id !== c.id)); });",
    "siteConfirm(isTaxArchived(c) ? 'حذف دائم این دسته؟ برگشت‌پذیر نیست.' : 'این دسته به آرشیو منتقل شود؟').then((ok) => { if (!ok) return; if (isTaxArchived(c)) saveAdminBlogCategories((adminBlogCategories || []).filter((x) => x.id !== c.id)); else saveAdminBlogCategories((adminBlogCategories || []).map((x) => x.id === c.id ? { ...x, status: 'archived' } : x)); });",
    1,
)

# blog tags
text = text.replace(
    "{(adminBlogTags || []).map((tg) => (",
    "{taxToolbar('blog-tag', filterTaxList(adminBlogTags))}\n"
    "             {filterTaxList(adminBlogTags).map((tg) => (",
    1,
)
text = re.sub(
    r"(filterTaxList\(adminBlogTags\)\.map\(\(tg\) => \(\s*<div key=\{tg\.id\} className=\"[^\"]+\">)",
    r"""\1
               <input type="checkbox" checked={taxSelectedIds.includes(String(tg.id))} onChange={() => toggleTaxSelect(tg.id)} className="rounded border-primary-300 flex-shrink-0" aria-label="انتخاب" />""",
    text,
    count=1,
)
text = text.replace(
    "siteConfirm('حذف این برچسب؟').then(ok => { if (ok) saveAdminBlogTags((adminBlogTags || []).filter(x => x.id !== tg.id)); });",
    "siteConfirm(isTaxArchived(tg) ? 'حذف دائم این برچسب؟ برگشت‌پذیر نیست.' : 'این برچسب به آرشیو منتقل شود؟').then(ok => { if (!ok) return; if (isTaxArchived(tg)) saveAdminBlogTags((adminBlogTags || []).filter(x => x.id !== tg.id)); else saveAdminBlogTags((adminBlogTags || []).map(x => x.id === tg.id ? { ...x, status: 'archived' } : x)); });",
    1,
)

if text == orig:
    print("WARNING: no changes applied — patterns may differ")
else:
    path.write_text(text, encoding="utf-8")
    print("OK: taxonomy multi-select + archive applied")
print("brace diff", text.count("{") - text.count("}"))
PY

BRANCH=$(git rev-parse --abbrev-ref HEAD)
git add components/panels/AdminPanelContent.jsx
if git diff --cached --quiet; then
  echo "Nothing to commit"
else
  git commit -m "feat(admin): multi-select archive/purge for categories tags brands blog taxonomy"
fi
echo "Pushing $BRANCH ..."
git push -u origin "$BRANCH" && echo "=== done — Vercel will deploy ==="
