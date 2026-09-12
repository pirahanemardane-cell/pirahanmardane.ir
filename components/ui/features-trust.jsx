'use client';

/**
 * FeaturesTrust — مینیمال، خوانا، لایت/دارک
 * ۴ مزیت در یک ردیف تمیز
 */
export function FeaturesTrust({ items = [], renderIcon }) {
  return (
    <section className="relative z-20 py-8 sm:py-12 bg-primary-50/80 dark:bg-primary-950 border-b border-primary-100 dark:border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6 sm:mb-8 max-w-xl mx-auto">
          <p className="text-[11px] font-bold tracking-widest text-[#FF0000] dark:text-[#13ABC4] mb-1.5">
            چرا پیراهن مردانه؟
          </p>
          <h2 className="text-lg sm:text-2xl font-black text-primary-900 dark:text-white leading-snug">
            خرید مطمئن، بدون دردسر
          </h2>
        </div>

        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {(items || []).map((f, i) => (
            <li
              key={i}
              className="group flex flex-col items-center text-center rounded-2xl bg-white dark:bg-primary-900/70 border border-primary-100/80 dark:border-white/10 px-3 py-5 sm:px-4 sm:py-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-primary-200 dark:hover:border-white/20 transition-all duration-200"
            >
              <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-800 text-primary-800 dark:text-[#13ABC4] ring-1 ring-primary-100 dark:ring-white/10 group-hover:scale-105 transition-transform">
                {renderIcon ? renderIcon(f) : null}
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-primary-900 dark:text-white leading-snug">
                {f.title}
              </h3>
              <p className="mt-1.5 text-[11px] sm:text-xs text-primary-500 dark:text-white/60 leading-relaxed line-clamp-2">
                {f.desc || f.description || ''}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
