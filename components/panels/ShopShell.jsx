'use client';

/** پوسته فروشگاه / ناحیه خریدار */
export default function ShopShell({ children, className = '' }) {
  return (
    <div className={`panel-ui panel-ui--buyer ${className}`.trim()} data-shell="shop" data-panel="buyer">
      {children}
    </div>
  );
}
