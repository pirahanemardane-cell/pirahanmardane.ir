'use client';

/** قرارداد یکشکل empty / loading / error */
export function LoadingState({ label = 'در حال بارگذاری…', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 py-12 px-4 ${className}`} role="status" aria-live="polite">
      <div className="w-8 h-8 rounded-full border-2 border-primary-200 dark:border-white/20 border-t-apple-blue animate-spin" aria-hidden />
      <p className="text-xs text-primary-500 dark:text-white/60">{label}</p>
    </div>
  );
}

export function ErrorState({ title = 'خطایی رخ داد', description = '', onRetry, className = '' }) {
  return (
    <div className={`rounded-2xl border border-red-200/60 dark:border-red-500/30 bg-red-50/50 dark:bg-red-950/20 px-4 py-8 text-center ${className}`} role="alert">
      <p className="text-2xl font-bold text-primary-900 dark:text-white">{title}</p>
      {description ? <p className="text-xs text-primary-500 dark:text-white/60 mt-1.5">{description}</p> : null}
      {typeof onRetry === 'function' ? (
        <button type="button" onClick={onRetry} className="mt-4 text-xs px-4 py-2 rounded-full bg-apple-blue text-white font-medium">
          تلاش دوباره
        </button>
      ) : null}
    </div>
  );
}

export function EmptyStateBox({ title = 'موردی نیست', description = '', actionLabel, onAction, className = '' }) {
  return (
    <div className={`rounded-2xl border border-dashed border-primary-200 dark:border-white/15 px-4 py-10 text-center ${className}`} role="status">
      <p className="text-2xl font-bold text-primary-900 dark:text-white">{title}</p>
      {description ? <p className="text-xs text-primary-500 dark:text-white/60 mt-1.5 max-w-sm mx-auto leading-6">{description}</p> : null}
      {actionLabel && typeof onAction === 'function' ? (
        <button type="button" onClick={onAction} className="mt-4 text-xs px-4 py-2 rounded-full bg-apple-blue text-white font-medium">
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export { EmptyStateBox as EmptyState };
