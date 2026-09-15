'use client';

/** پوسته ظاهری پنل admin — منطق در children */
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
