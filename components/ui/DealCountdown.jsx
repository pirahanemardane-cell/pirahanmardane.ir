'use client';

import { useEffect, useState } from 'react';

function pad(n) {
  return String(Math.max(0, n)).padStart(2, '0');
}

/** شمارش معکوس تا dealEndsAt — مخصوص هر محصول */
export default function DealCountdown({ endsAt, toFa, className = '' }) {
  const [left, setLeft] = useState(() => {
    const end = Number(endsAt) || 0;
    return Math.max(0, end - Date.now());
  });

  useEffect(() => {
    const end = Number(endsAt) || 0;
    if (!end) {
      setLeft(0);
      return undefined;
    }
    const tick = () => setLeft(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (!endsAt || left <= 0) return null;

  const h = Math.floor(left / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  const s = Math.floor((left % 60000) / 1000);
  const fmt = (n) => (typeof toFa === 'function' ? toFa(pad(n)) : pad(n));

  return (
    <div
      className={`inline-flex items-center gap-0.5 font-mono text-[10px] sm:text-[11px] font-bold tabular-nums text-primary-900 dark:text-white ${className}`}
      dir="ltr"
      aria-label="زمان باقی‌مانده پیشنهاد"
    >
      <span className="rounded bg-primary-100 dark:bg-primary-800 px-1 py-0.5 min-w-[1.5rem] text-center">{fmt(h)}</span>
      <span className="opacity-60">:</span>
      <span className="rounded bg-primary-100 dark:bg-primary-800 px-1 py-0.5 min-w-[1.5rem] text-center">{fmt(m)}</span>
      <span className="opacity-60">:</span>
      <span className="rounded bg-primary-100 dark:bg-primary-800 px-1 py-0.5 min-w-[1.5rem] text-center">{fmt(s)}</span>
    </div>
  );
}
