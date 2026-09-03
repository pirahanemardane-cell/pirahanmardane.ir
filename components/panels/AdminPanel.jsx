'use client';

/**
 * مرز lazy پنل ادمین.
 * محتوای سنگین هنوز از App به صورت children تزریق می‌شود تا رفتار ۱۰۰٪ حفظ شود؛
 * این فایل نقطهٔ code-split و توسعهٔ بعدی است.
 */
export default function AdminPanel({ children, className = '' }) {
  return (
    <div className={className} data-panel="admin" role="region" aria-label="پنل ادمین">
      {children}
    </div>
  );
}
