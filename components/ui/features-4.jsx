'use client';

/** Features grid — استایل features-4 (border + divide) */
export function Features4({
  title = 'انتخاب دقیق‌تر، خرید مطمئن‌تر',
  subtitle = 'پیراهن مردانه',
  description = 'از پیراهن رسمی تا روزمره — فروشندگان تأییدشده، قیمت شفاف، و تجربه‌ای ساده برای انتخاب سایز و رنگ مناسب شما.',
  items = [],
  renderIcon,
}) {
  return (
    <section className="py-10 sm:py-14 md:py-16 bg-white dark:bg-primary-950 border-b border-primary-100 dark:border-white/10">
      <div className="mx-auto max-w-5xl space-y-8 px-4 sm:px-6 md:space-y-12">
        <div className="relative z-10 mx-auto max-w-xl space-y-3 text-center md:space-y-5">
          {subtitle ? (
            <p className="text-[11px] sm:text-xs font-bold tracking-wide text-[#FF0000] dark:text-[#13ABC4]">
              {subtitle}
            </p>
          ) : null}
          <h2 className="text-balance text-xl sm:text-2xl md:text-3xl font-black text-primary-900 dark:text-white">
            {title}
          </h2>
          {description ? (
            <p className="text-sm sm:text-base text-primary-600 dark:text-white/70 leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>

        <div className="relative mx-auto grid max-w-2xl lg:max-w-4xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-x-0 sm:divide-x divide-y border border-primary-200 dark:border-white/20 divide-primary-200 dark:divide-white/20 overflow-hidden rounded-none bg-transparent">
          {(items || []).map((f, i) => (
            <div key={i} className="space-y-2 p-6 sm:p-8">
              <div className="flex items-center gap-2 text-primary-900 dark:text-white">
                <span className="inline-flex shrink-0 opacity-80">
                  {renderIcon ? renderIcon(f) : null}
                </span>
                <h3 className="text-sm font-medium">{f.title}</h3>
              </div>
              <p className="text-sm text-primary-500 dark:text-white/65 leading-relaxed">
                {f.desc || f.description || ''}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
