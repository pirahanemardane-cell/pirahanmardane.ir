'use client';

import { useEffect, useState } from 'react';

export default function EnamadFooterBadge() {
  const [cfg, setCfg] = useState(null);

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem('pm_site_licenses');
        if (raw) {
          const j = JSON.parse(raw);
          setCfg(j);
          return;
        }
      } catch (_) {}
      setCfg(null);
    };
    load();
    const on = (e) => setCfg(e?.detail || null);
    window.addEventListener('pm-site-licenses', on);
    return () => window.removeEventListener('pm-site-licenses', on);
  }, []);

  if (!cfg?.enamadOn) return null;
  const id = String(cfg.enamadId || '').trim();
  const code = String(cfg.enamadCode || '').trim();
  if (!id || !code) return null;

  const href = `https://trustseal.enamad.ir/?id=${encodeURIComponent(id)}&Code=${encodeURIComponent(code)}`;
  const src = `https://trustseal.enamad.ir/logo.aspx?id=${encodeURIComponent(id)}&Code=${encodeURIComponent(code)}`;

  return (
    <a
      href={href}
      referrerPolicy="origin"
      target="_blank"
      rel="noopener noreferrer"
      className="pm-enamad-badge inline-flex items-center"
      title="نماد اعتماد الکترونیکی"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="اینماد" width={80} height={80} className="w-16 h-16 object-contain" style={{ cursor: 'pointer' }} referrerPolicy="origin" />
    </a>
  );
}
