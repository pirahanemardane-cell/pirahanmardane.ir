'use client';

import { useEffect, useState } from 'react';

export default function PermissionsPanelContent({ adminSettings, setAdminSettings, saveAdminSettings, showToast }) {
  const cfg = (adminSettings && adminSettings.siteLicenses) || {};
  const [enamadId, setEnamadId] = useState(cfg.enamadId || '');
  const [enamadCode, setEnamadCode] = useState(cfg.enamadCode || '');
  const [enamadOn, setEnamadOn] = useState(!!cfg.enamadOn);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const c = (adminSettings && adminSettings.siteLicenses) || {};
    setEnamadId(c.enamadId || '');
    setEnamadCode(c.enamadCode || '');
    setEnamadOn(!!c.enamadOn);
  }, [adminSettings]);

  const save = async () => {
    setSaving(true);
    try {
      const siteLicenses = {
        enamadId: String(enamadId || '').trim(),
        enamadCode: String(enamadCode || '').trim(),
        enamadOn: !!enamadOn,
      };
      const next = { ...(adminSettings || {}), siteLicenses };
      if (typeof setAdminSettings === 'function') setAdminSettings(next);
      if (typeof saveAdminSettings === 'function') await saveAdminSettings(next);
      try {
        await fetch('/api/site-settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'siteLicenses', value: siteLicenses }),
        });
      } catch (_) {}
      try { localStorage.setItem('pm_site_licenses', JSON.stringify(siteLicenses)); } catch (_) {}
      try { window.dispatchEvent(new CustomEvent('pm-site-licenses', { detail: siteLicenses })); } catch (_) {}
      if (typeof showToast === 'function') {
        showToast({ message: 'تنظیمات اینماد ذخیره شد', variant: 'success', position: 'top-center' });
      }
    } catch (e) {
      if (typeof showToast === 'function') {
        showToast({ message: e?.message || 'ذخیره ناموفق', variant: 'error', position: 'top-center' });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-lg font-bold text-primary-900 dark:text-white mb-1">مجوزهای سایت</h2>
        <p className="text-xs text-primary-500 dark:text-white/60">
          id و Code را از پنل اینماد بگیرید؛ بعد از ذخیره، لوگو در فوتر نمایش داده می‌شود.
        </p>
      </div>
      <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-3">
        <h3 className="text-sm font-bold text-primary-900 dark:text-white">اینماد</h3>
        <label className="flex items-center gap-2 text-sm text-primary-800 dark:text-white/90">
          <input type="checkbox" checked={enamadOn} onChange={(e) => setEnamadOn(e.target.checked)} />
          نمایش لوگو در فوتر
        </label>
        <div>
          <label className="block text-xs mb-1 text-primary-600 dark:text-white/70">شناسه اینماد (id)</label>
          <input value={enamadId} onChange={(e) => setEnamadId(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm" placeholder="id از پنل اینماد" dir="ltr" />
        </div>
        <div>
          <label className="block text-xs mb-1 text-primary-600 dark:text-white/70">کد اینماد (Code)</label>
          <input value={enamadCode} onChange={(e) => setEnamadCode(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm" placeholder="Code از پنل اینماد" dir="ltr" />
        </div>
      </div>
      <button type="button" disabled={saving} onClick={save} className="btn-cta px-5 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium disabled:opacity-60">
        {saving ? '...' : 'ذخیره'}
      </button>
    </div>
  );
}
