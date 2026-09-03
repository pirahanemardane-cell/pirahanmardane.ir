'use client'

/**
 * دکمه دانلود گزارش حسابداری فروشنده (CSV / Excel)
 * استفاده: <AccountingExportButton />
 */
export default function AccountingExportButton({ className = '' }) {
  const base =
    className ||
    'inline-flex items-center gap-2 rounded-lg border border-emerald-600/40 bg-emerald-600/10 px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-600/20 dark:text-emerald-300'

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a href="/api/seller/export/orders?format=csv" className={base} download>
        دانلود گزارش حسابداری (Excel)
      </a>
      <a
        href="/api/seller/export/orders?format=json"
        className="text-xs text-neutral-500 underline-offset-2 hover:underline"
        target="_blank"
        rel="noreferrer"
      >
        JSON
      </a>
    </div>
  )
}
