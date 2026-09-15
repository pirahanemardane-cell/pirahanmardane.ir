'use client';

import { LumaSpinBlock } from '@/components/ui/luma-spin';

export function LoadingState({ label = 'در حال بارگذاری…', className = '' }) {
  return <LumaSpinBlock label={label} className={className} />;
}

export function ErrorState({ title = 'خطایی رخ داد', description = '', onRetry, className = '' }) {
  return (
    <div className={`rounded-2xl border border-red-200/60 border-red-500/30 bg-red-50/50 bg-red-950/20 px-4 py-8 text-center ${className}`} role="alert">
      <p className="text-2xl font-bold text-primary-900 text-white">{title}</p>
      {description ? <p className="text-xs text-primary-500 text-white/60 mt-1.5">{description}</p> : null}
      {typeof onRetry === 'function' ? (
        <button type="button" onClick={onRetry} className="btn-cta mt-4 text-xs px-4 py-2 rounded-full bg-apple-blue text-white font-medium">
          تلاش دوباره
        </button>
      ) : null}
    </div>
  );
}

export function EmptyStateBox({ title = 'موردی نیست', description = '', actionLabel, onAction, className = '' }) {
  return (
    <div className={`rounded-2xl border border-dashed border-primary-200 border-white/15 px-4 py-10 text-center ${className}`} role="status">
      <p className="text-2xl font-bold text-primary-900 text-white">{title}</p>
      {description ? <p className="text-xs text-primary-500 text-white/60 mt-1.5 max-w-sm mx-auto leading-6">{description}</p> : null}
      {actionLabel && typeof onAction === 'function' ? (
        <button type="button" onClick={onAction} className="btn-cta mt-4 text-xs px-4 py-2 rounded-full bg-apple-blue text-white font-medium">
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export { EmptyStateBox as EmptyState };
