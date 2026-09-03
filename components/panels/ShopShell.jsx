'use client';

/** پوسته فروشگاه — مرز lazy برای بخش خریدار */
export default function ShopShell({ children, className = '' }) {
  return (
    <div className={className} data-shell="shop">
      {children}
    </div>
  );
}
