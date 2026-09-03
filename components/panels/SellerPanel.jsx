'use client';

/** مرز lazy پنل فروشنده */
export default function SellerPanel({ children, className = '' }) {
  return (
    <div className={className} data-panel="seller" role="region" aria-label="پنل فروشنده">
      {children}
    </div>
  );
}
