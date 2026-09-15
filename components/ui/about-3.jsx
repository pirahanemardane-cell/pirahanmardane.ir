'use client';

import { Button } from '@/components/ui/button';

const defaultAchievements = [
  { label: 'فروشنده فعال', value: '۵۰+' },
  { label: 'مدل پیراهن', value: '۲۰۰+' },
  { label: 'رضایت خریداران', value: '۹۸٪' },
  { label: 'شهر تحت پوشش', value: '۳۰+' },
];

const MOVE_TEXT =
  'ما یک مارکت‌پلیس تخصصی برای پیراهن مردانه هستیم؛ از برندهای معتبر تا فروشندگان منتخب، با تمرکز روی کیفیت دوخت، سایزبندی دقیق و تجربه خرید ساده.';

/**
 * About3 — بلوک داخلی صفحه درباره ما (هدر/فوتر سایت جداست)
 */
export function About3({
  title = 'درباره پیراهن مردانه',
  description = '',
  mainImage = {
    src: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=1200&h=900&fit=crop&q=80',
    alt: 'پیراهن مردانه',
  },
  secondaryImage = null,
  breakout = {
    src: '/Pirrahanmardane-logo.webp',
    alt: 'لوگو پیراهن مردانه',
    title: 'فروشگاه تخصصی پیراهن',
    description: MOVE_TEXT,
    buttonText: 'مشاهده فروشگاه',
    buttonUrl: null,
  },
  companiesTitle = 'همراه با برندها و فروشندگان منتخب',
  companies = [],
  achievementsTitle = 'آمارهایی که به آن‌ها افتخار می‌کنیم',
  achievementsDescription =
    'نتیجه تمرکز روی یک دسته کالا: پیراهن مردانه با استاندارد مشخص و پشتیبانی واقعی.',
  achievements = defaultAchievements,
  onShopClick,
  onContactClick,
  onBecomeSellerClick,
} = {}) {
  return (
    <section className="py-8 sm:py-12 md:py-16">
      <div className="w-full">
        <div className="mb-10 md:mb-14 grid gap-4 md:gap-6 text-center md:grid-cols-2 md:text-right">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-900 text-white leading-tight">
            {title}
          </h1>
          {description ? (
            <p className="text-sm sm:text-base text-primary-600 text-white/75 leading-8 md:pt-2">
              {description}
            </p>
          ) : null}
        </div>

        <div className="grid gap-5 lg:grid-cols-3 items-center">
          <img
            src={mainImage.src}
            alt={mainImage.alt}
            className="w-full max-h-[420px] sm:max-h-[520px] lg:max-h-[620px] rounded-2xl object-cover lg:col-span-2 border border-primary-100 border-white/10"
            loading="lazy"
            decoding="async"
          />
          <div className="flex flex-col gap-5 md:flex-row lg:flex-col justify-center self-center h-full">
            <div className="flex flex-col justify-center gap-5 rounded-2xl bg-primary-50 bg-primary-900/60 border border-primary-100 border-white/10 p-6 md:w-1/2 lg:w-auto justify-center self-center">
              {breakout.src ? (
                <img
                  src={breakout.src}
                  alt={breakout.alt || ''}
                  className="w-auto max-w-full h-auto object-contain object-right"
                  loading="lazy"
                  onError={(e) => {
                    try {
                      e.currentTarget.style.display = 'none';
                    } catch (_) {}
                  }}
                />
              ) : null}
              <div>
                <p className="mb-2 text-base sm:text-lg font-bold text-primary-900 text-white">
                  {breakout.title}
                </p>
                <p className="text-sm text-primary-600 text-white/70 leading-7">
                  {breakout.description}
                </p>
              </div>
              {breakout.buttonText ? (
                <Button
                  type="button"
                  variant="outline"
                  className="about-breakout-shop-btn w-fit border-[#023047] text-[#023047]"
                  onClick={() => {
                    if (typeof onShopClick === 'function') onShopClick();
                    else if (breakout.buttonUrl) {
                      try {
                        window.location.href = breakout.buttonUrl;
                      } catch (_) {}
                    }
                  }}
                >
                  {breakout.buttonText}
                </Button>
              ) : null}
            </div>
            
          </div>
        </div>

        {Array.isArray(companies) && companies.length > 0 ? (
          <div className="py-14 sm:py-20">
            <p className="text-center text-sm font-medium text-primary-600 text-white/70">
              {companiesTitle}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-8 items-center">
              {companies.map((company, idx) => (
                <div
                  className="flex items-center gap-3 opacity-80"
                  key={(company.src || '') + idx}
                >
                  <img
                    src={company.src}
                    alt={company.alt || ''}
                    className="h-6 w-auto md:h-8 object-contain"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-10 sm:py-14" />
        )}

        <div className="relative overflow-hidden rounded-2xl bg-primary-50 bg-primary-900/50 border border-primary-100 border-white/10 p-8 sm:p-10 md:p-14">
          <div className="flex flex-col gap-3 text-center md:text-right relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-900 text-white">
              {achievementsTitle}
            </h2>
            <p className="max-w-2xl text-sm sm:text-base text-primary-600 text-white/70 leading-7 mx-auto md:mx-0">
              {achievementsDescription}
            </p>
          </div>
          <div className="mt-10 flex flex-wrap justify-between gap-8 sm:gap-10 text-center relative z-10">
            {(achievements || []).map((item, idx) => (
              <div
                className="flex flex-col gap-2 min-w-[120px] flex-1"
                key={(item.label || '') + idx}
              >
                <p className="text-xs sm:text-sm text-primary-600 text-white/65">
                  {item.label}
                </p>
                <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#023047] text-white tabular-nums">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-[0.07] opacity-[0.12]"
            style={{
              backgroundImage:
                'linear-gradient(to right, #023047 1px, transparent 1px), linear-gradient(to bottom, #023047 1px, transparent 1px)',
              backgroundSize: '80px 80px',
              maskImage:
                'linear-gradient(to bottom right, #000, transparent, transparent)',
              WebkitMaskImage:
                'linear-gradient(to bottom right, #000, transparent, transparent)',
            }}
          />
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button
            type="button"
            className="bg-[#023047] text-white hover:opacity-90 px-6"
            onClick={() => {
              if (typeof onBecomeSellerClick === 'function') onBecomeSellerClick();
              else if (typeof onShopClick === 'function') onShopClick();
            }}
          >
            فروشنده شوید
          </Button>
          <Button
            type="button"
            variant="outline"
            className="about-breakout-shop-btn border-[#023047] text-[#023047] px-6"
            onClick={() => {
              if (typeof onContactClick === 'function') onContactClick();
            }}
          >
            تماس با ما
          </Button>
        </div>
      </div>
    </section>
  );
}

export default About3;
