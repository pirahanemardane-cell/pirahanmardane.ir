'use client';

/** مرز lazy پنل فروشنده — فقط پوسته ظاهری */
export default function SellerPanel({ children, className = '' }) {
  return (
    <div
      className={`panel-ui panel-ui--seller ${className}`.trim()}
      data-panel="seller"
      role="region"
      aria-label="پنل فروشنده"
    >
      {children}
    </div>
  );
}
