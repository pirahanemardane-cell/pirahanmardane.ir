#!/bin/bash
set -e
cd /Users/mac/Documents/Projects/Pirahanmardane/Pirahanemardaneir-pro
if [ ! -f package.json ] || [ ! -d components ]; then
  echo "❌ فولدر پروژه پیدا نشد."
  exit 1
fi
echo "✅ پروژه: $(pwd)"
echo "📦 در حال اعمال فیکس..."
python3 << 'PY'
from pathlib import Path
auth_path = Path("components/shop/AuthModalView.jsx")
auth_path.write_text(r"""'use client';

import { useAppApi } from '../AppApiContext';
import LoginCardSection from '@/components/ui/login-signup';
import { patchModalUi } from '@/lib/stores/modalUiStore';

function isAdminLoginPath() {
  try {
    const p = String(typeof window !== 'undefined' ? window.location.pathname || '' : '');
    return p === '/amirpnl' || p.endsWith('/amirpnl');
  } catch (_) {
    return false;
  }
}

export default function AuthModalView() {
  const api = useAppApi() || {};
  if (!api.authOpen) return null;

  const handleClose = () => {
    try { patchModalUi({ authOpen: false }); } catch (_) {}
    try { api.closeAuth?.(); } catch (_) {}
    try { api.setAuthOpen?.(false); } catch (_) {}
  };

  const handleContact = () => {
    handleClose();
    try {
      if (typeof api.openStaticPage === 'function') {
        api.openStaticPage('contact');
        return;
      }
    } catch (_) {}
    try { window.location.assign('/تماس-با-ما'); } catch (_) {}
  };

  const forceAdmin = isAdminLoginPath() || api.authMode === 'admin';
  const mode = forceAdmin ? 'admin' : api.authMode === 'seller' ? 'seller' : 'buyer';

  return (
    <LoginCardSection
      mode={mode}
      onClose={handleClose}
      onContact={handleContact}
    />
  );
}
""", encoding="utf-8")
print("  ✓ AuthModalView.jsx")

login_path = Path("components/ui/login-signup.jsx")
t = login_path.read_text(encoding="utf-8")

old_is = """  const isSeller = mode === 'seller';
  const isAdmin = mode === 'admin';
  React.useEffect(() => {
    if (isAdmin && view === 'signup') setView('signin');
  }, [isAdmin, view]);
  const role = isAdmin ? 'admin' : isSeller ? 'seller' : 'buyer';"""

new_is = """  const isSeller = mode === 'seller';
  const pathIsAdmin =
    typeof window !== 'undefined' &&
    (() => {
      try {
        const p = String(window.location.pathname || '');
        return p === '/amirpnl' || p.endsWith('/amirpnl');
      } catch (_) {
        return false;
      }
    })();
  const isAdmin = mode === 'admin' || pathIsAdmin;
  React.useEffect(() => {
    if (isAdmin && view === 'signup') setView('signin');
  }, [isAdmin, view]);
  const role = isAdmin ? 'admin' : isSeller ? 'seller' : 'buyer';"""

if old_is in t:
    t = t.replace(old_is, new_is, 1)
    print("  ✓ pathIsAdmin")
elif "pathIsAdmin" not in t and "const isSeller = mode === 'seller';" in t:
    t = t.replace(
        "  const isSeller = mode === 'seller';\n  const isAdmin = mode === 'admin';",
        "  const isSeller = mode === 'seller';\n  const pathIsAdmin = typeof window !== 'undefined' && (() => { try { const p = String(window.location.pathname || ''); return p === '/amirpnl' || p.endsWith('/amirpnl'); } catch (_) { return false; } })();\n  const isAdmin = mode === 'admin' || pathIsAdmin;",
        1,
    )
    print("  ✓ pathIsAdmin (fallback)")
else:
    print("  ℹ️ pathIsAdmin از قبل بود یا الگو فرق داشت")

if "function hardRedirect" not in t:
    insert_after = "  const role = isAdmin ? 'admin' : isSeller ? 'seller' : 'buyer';\n"
    hard = r'''
  function hardRedirect(url) {
    try {
      window.location.replace(url);
    } catch (_) {
      try { window.location.href = url; }
      catch (__) {
        try { window.location.assign(url); } catch (___) {}
      }
    }
    try {
      setTimeout(() => {
        try {
          if (String(window.location.pathname || '').indexOf('amirshn') < 0) {
            window.location.href = url;
          }
        } catch (_) {}
      }, 120);
    } catch (_) {}
  }

  function goAdminPanelNow(phone, name) {
    let ph = String(phone || '').replace(/\D/g, '');
    if (ph.length === 10 && ph.startsWith('9')) ph = '0' + ph;
    try {
      localStorage.setItem(
        'adminUser',
        JSON.stringify({
          name: name || 'سوپر ادمین',
          role: 'Super Admin',
          phone: ph.length >= 10 ? ph : ph || '09000000000',
          loggedAt: Date.now(),
          sessionExpires: Date.now() + 30 * 24 * 60 * 60 * 1000,
        })
      );
      sessionStorage.setItem('pm_panel', 'admin');
      sessionStorage.setItem('pm_admin_ok', '1');
    } catch (_) {}
    hardRedirect('/amirshn?panel=1&t=' + Date.now());
  }

'''
    if insert_after in t:
        t = t.replace(insert_after, insert_after + hard, 1)
        print("  ✓ hardRedirect + goAdminPanelNow")
    else:
        print("  ⚠️ محل hardRedirect پیدا نشد")
else:
    print("  ℹ️ hardRedirect از قبل بود")

import re
t2 = t
t2 = t2.replace("window.location.href='/amirshn?panel=1';", "hardRedirect('/amirshn?panel=1&t=' + Date.now());")
t2 = t2.replace('window.location.href="/amirshn?panel=1";', "hardRedirect('/amirshn?panel=1&t=' + Date.now());")
t2 = re.sub(
    r"window\.location\.(href|replace|assign)\s*=\s*['\"]/amirshn\?panel=1[^'\"]*['\"]",
    "hardRedirect('/amirshn?panel=1&t=' + Date.now())",
    t2,
)
if t2 != t:
    t = t2
    print("  ✓ ریدایرکت‌ها hard شدند")

login_path.write_text(t, encoding="utf-8")
print("  ✓ login-signup.jsx")

app = Path("components/App.jsx")
if app.exists():
    a = app.read_text(encoding="utf-8")
    changed = False
    old_ph = (
        "          if (ph.length < 10) return;\n"
        "          setAdminUser({ name: saved.name || 'سوپر ادمین', role: saved.role || 'Super Admin', phone: ph, loggedAt: saved.loggedAt || Date.now() });"
    )
    new_ph = (
        "          setAdminUser({ name: saved.name || 'سوپر ادمین', role: saved.role || 'Super Admin', phone: ph.length >= 10 ? ph : (ph || '09000000000'), loggedAt: saved.loggedAt || Date.now() });"
    )
    if old_ph in a:
        a = a.replace(old_ph, new_ph, 1)
        changed = True
        print("  ✓ App.jsx phone")
    old_cond = "            if ((u && ph.length >= 10 && isAdminPhone(ph)) || (okFlag && ph.length >= 10) || (panelQuery && ph.length >= 10)) {"
    new_cond = (
        "            if (\n"
        "              (u && ph.length >= 10 && isAdminPhone(ph)) ||\n"
        "              (okFlag && ph.length >= 10) ||\n"
        "              (panelQuery && (ph.length >= 10 || okFlag)) ||\n"
        "              (okFlag && panelQuery)\n"
        "            ) {"
    )
    if old_cond in a:
        a = a.replace(old_cond, new_cond, 1)
        changed = True
        print("  ✓ App.jsx condition")
    needle = (
        '      if (typeof isAdminLogin !== "undefined" && isAdminLogin) {\n'
        '        try { setShowAdminPanel(false); } catch (_) {}\n'
        '        setAdminAuthOpen(true);\n'
        '        setAdminAuthStep("phone");\n'
        '        return;\n'
        '      }'
    )
    insert = (
        '      if (typeof isAdminLogin !== "undefined" && isAdminLogin) {\n'
        '        try {\n'
        '          const raw = localStorage.getItem("adminUser");\n'
        '          if (raw) {\n'
        '            const saved = JSON.parse(raw);\n'
        '            const ph = String(saved?.phone || "").replace(/\\D/g, "");\n'
        '            if (ph.length >= 10) {\n'
        '              try {\n'
        '                setAdminUser({\n'
        '                  name: saved.name || "سوپر ادمین",\n'
        '                  role: saved.role || "Super Admin",\n'
        '                  phone: ph,\n'
        '                  loggedAt: saved.loggedAt || Date.now(),\n'
        '                });\n'
        '              } catch (_) {}\n'
        '              try { sessionStorage.setItem("pm_panel", "admin"); sessionStorage.setItem("pm_admin_ok", "1"); } catch (_) {}\n'
        '              try { window.location.replace("/amirshn?panel=1&t=" + Date.now()); return; } catch (_) {}\n'
        '            }\n'
        '          }\n'
        '        } catch (_) {}\n'
        '        try { setShowAdminPanel(false); } catch (_) {}\n'
        '        setAdminAuthOpen(true);\n'
        '        setAdminAuthStep("phone");\n'
        '        try { setAuthMode("admin"); setAuthOpen(true); } catch (_) {}\n'
        '        return;\n'
        '      }'
    )
    idx = a.find("isAdminLogin")
    if needle in a and idx >= 0 and 'window.location.replace("/amirshn?panel=1' not in a[idx:idx+900]:
        a = a.replace(needle, insert, 1)
        changed = True
        print("  ✓ App.jsx session boot")
    if changed:
        app.write_text(a, encoding="utf-8")
        print("  ✓ App.jsx saved")
    else:
        print("  ℹ️ App.jsx از قبل ok")
print("\n✅ فیکس فایل‌ها تمام شد.")
PY

echo ""
git status -sb
git diff --stat || true
echo ""
echo "🚀 کامیت و پوش..."
git add components/ui/login-signup.jsx components/shop/AuthModalView.jsx components/App.jsx 2>/dev/null || true
if git diff --cached --quiet 2>/dev/null; then
  git commit --allow-empty -m "chore: force vercel deploy (admin redirect)" || true
else
  git commit -m "fix(admin): /amirpnl login redirects to /amirshn (email + OTP)"
fi
BRANCH=$(git rev-parse --abbrev-ref HEAD)
git push origin "$BRANCH"
echo ""
echo "✅ تمام. بعد از سبز شدن بیلد Vercel تست کنید:"
echo "  https://pirahanmardane.ir/amirpnl  → لاگین → باید برود /amirshn"
