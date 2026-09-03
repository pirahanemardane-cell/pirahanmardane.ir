'use client';

/** حالت خالی یکدست — بدون تغییر زبان بصری کلی سایت */
export default function EmptyState({
  title = 'موردی نیست',
  description = '',
  actionLabel = '',
  onAction,
  className = '',
}) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-primary-200 dark:border-white/15 bg-white/50 dark:bg-primary-900/40 px-4 py-10 text-center ${className}`}
      role="status"
    >
      <p className="text-sm font-bold text-primary-900 dark:text-white">{title}</p>
      {description ? (
        <p className="text-xs text-primary-500 dark:text-white/60 mt-1.5 leading-6 max-w-sm mx-auto">{description}</p>
      ) : null}
      {actionLabel && typeof onAction === 'function' ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 text-xs px-4 py-2 rounded-full bg-apple-blue text-white font-medium"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
