export default function PageBootShell({ label = 'در حال بارگذاری…' }) {
  return (
    <div className="min-h-[40vh] flex items-center justify-center" role="status" aria-live="polite">
      <p className="text-sm text-primary-500 dark:text-primary-400 animate-pulse">{label}</p>
    </div>
  );
}
