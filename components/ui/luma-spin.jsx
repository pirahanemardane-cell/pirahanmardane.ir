'use client';

export function LumaSpin({ className = '', size = 65 }) {
  return (
    <div
      className={'luma-spin relative aspect-square ' + (className || '')}
      style={{ width: size }}
      role="status"
      aria-label="در حال بارگذاری"
    >
      <span className="luma-spin-bar luma-spin-bar-a" />
      <span className="luma-spin-bar luma-spin-bar-b" />
      <span className="sr-only">در حال بارگذاری…</span>
    </div>
  );
}

export function LumaSpinBlock({ label = 'در حال بارگذاری…', className = '' }) {
  return (
    <div
      className={'flex flex-col items-center justify-center gap-4 py-12 px-4 ' + (className || '')}
      role="status"
      aria-busy="true"
    >
      <LumaSpin />
      {label ? <p className="text-sm text-primary-600 text-white/70">{label}</p> : null}
    </div>
  );
}

export default LumaSpin;
