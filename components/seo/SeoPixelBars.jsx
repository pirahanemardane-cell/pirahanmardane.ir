/** نوار پیکسل سئوی عنوان/توضیح */

export default function SeoPixelBars({ report }) {
  if (!report) return null;
  const bar = (ratio, over) => (
    <div className="h-1.5 rounded-full bg-primary-200 dark:bg-white/15 overflow-hidden flex-1 min-w-[4rem]">
      <div
        className={`h-full rounded-full transition-all ${over ? "bg-red-500" : ratio > 0.92 || (ratio < 0.45 && report.chars) ? "bg-amber-500" : "bg-emerald-500"}`}
        style={{ width: `${Math.min(100, Math.round((ratio || 0) * 100))}%` }}
      />
    </div>
  );
  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex items-center gap-2 text-[10px] text-primary-500 dark:text-white/60">
        <span className="w-14 flex-shrink-0">دسکتاپ</span>
        {bar(report.deskRatio, report.deskOver)}
        <span className={`tabular-nums flex-shrink-0 ${report.deskOver ? "text-red-300 font-medium" : ""}`}>
          {report.deskPx}/{report.deskLim}px
        </span>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-primary-500 dark:text-white/60">
        {bar(report.mobRatio, report.mobOver)}
        <span className={`tabular-nums flex-shrink-0 ${report.mobOver ? "text-red-300 font-medium" : ""}`}>
          {report.mobPx}/{report.mobLim}px
        </span>
      </div>
      <p className="text-[10px] text-primary-400 dark:text-white/50">
        محاسبه با عرض پیکسل نمایش گوگل (فونت تقریبی Arial) · نه صرفاً تعداد کاراکتر
      </p>
    </div>
  );
}
