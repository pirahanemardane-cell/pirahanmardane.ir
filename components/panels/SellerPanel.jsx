'use client';

/** پوسته ظاهری پنل seller — منطق در children */
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
