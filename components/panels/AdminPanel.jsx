'use client';

/**
 * مرز lazy پنل ادمین — فقط پوسته ظاهری؛ منطق در children است.
 */
export default function AdminPanel({ children, className = '' }) {
  return (
    <div
      className={`panel-ui panel-ui--admin ${className}`.trim()}
      data-panel="admin"
      role="region"
      aria-label="پنل ادمین"
    >
      {children}
    </div>
  );
}
