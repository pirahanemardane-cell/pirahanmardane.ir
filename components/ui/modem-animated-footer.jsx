'use client';

import React from 'react';
import { cn } from '../../lib/utils';

/**
 * فوتر سایت
 * لایت: قرمز  |  دارک: فیروزه‌ای #13ABC4
 * دسکتاپ: توضیح یک‌خط + لینک‌ها یک ردیف افقی
 * موبایل: توضیح دوخط + لینک‌ها ۳×۳
 */
export function ModemAnimatedFooter({
  brandName = 'پیراهن مردانه',
  navLinks = [],
  socialLinks = [],
  brandIcon,
  dark = false,
  className,
  onNavClick,
}) {
  const accent = dark ? '#13ABC4' : '#FF0000';

  const handleNav = (link) => {
    if (typeof onNavClick === 'function') onNavClick(link);
    else if (link?.href && typeof window !== 'undefined') {
      try { window.location.assign(link.href); } catch (_) {}
    }
  };

  const linkBtn = (link, index) => (
    <button
      key={index}
      type="button"
      onClick={() => handleNav(link)}
      className="transition-colors duration-200 leading-snug shrink-0 whitespace-nowrap"
      style={{ color: accent }}
    >
      {link.label}
    </button>
  );

  return (
    <section className={cn('relative w-full mt-0 overflow-hidden', className)} dir="rtl">
      <footer className="border-t border-primary-200 dark:border-white/20 bg-primary-50 dark:bg-primary-950 mt-10 sm:mt-16 relative">
        <div className="max-w-7xl flex flex-col justify-between mx-auto min-h-[22rem] sm:min-h-[26rem] md:min-h-[30rem] relative p-4 py-10">
          <div className="flex flex-col mb-10 sm:mb-14 w-full relative z-10 pb-4 sm:pb-0">
            <div className="w-full flex flex-col items-center gap-3">
              {/* برند — بالاترین وزن */}
              <div className="flex items-center gap-2">
                <span
                  className="text-2xl sm:text-3xl font-black"
                  style={{ color: accent }}
                >
                  {brandName}
                </span>
              </div>

              {/* توضیح: موبایل دو خط / دسکتاپ یک خط */}
              <div className="text-primary-500 dark:text-white/60 font-medium text-center w-full max-w-3xl text-sm sm:text-base px-4 leading-7">
                {/* موبایل */}
                <div className="sm:hidden space-y-0.5">
                  <p className="m-0">فروشگاه اینترنتی تخصصی پیراهن مردانه</p>
                  <p className="m-0">ارسال به سراسر&nbsp;ایران</p>
                </div>
                {/* دسکتاپ — یک خط مثل قبل */}
                <p className="m-0 hidden sm:block whitespace-nowrap">
                  فروشگاه اینترنتی تخصصی پیراهن مردانه — ارسال به سراسر&nbsp;ایران
                </p>
              </div>

              {Array.isArray(socialLinks) && socialLinks.length > 0 && (
                <div className="flex mb-4 mt-2 gap-4">
                  {socialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      className="transition-opacity"
                      style={{ color: accent }}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label}
                    >
                      <div className="w-6 h-6 hover:scale-110 duration-300">{link.icon}</div>
                    </a>
                  ))}
                </div>
              )}

              {Array.isArray(navLinks) && navLinks.length > 0 && (
                <>
                  {/* موبایل: ۳ ستون × ۳ ردیف */}
                  <div className="grid grid-cols-3 gap-x-2 gap-y-3 text-sm font-medium w-full max-w-md px-2 mt-3 mb-28 text-center sm:hidden relative z-10">
                    {navLinks.map((link, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleNav(link)}
                        className="transition-colors duration-200 leading-snug"
                        style={{ color: accent }}
                      >
                        {link.label}
                      </button>
                    ))}
                  </div>
                  {/* دسکتاپ: یک ردیف افقی مثل قبل */}
                  <div className="hidden sm:flex flex-nowrap justify-center items-center gap-x-4 text-sm font-medium w-full max-w-6xl px-2 mt-3 overflow-x-auto">
                    {navLinks.map((link, index) => linkBtn(link, index))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-16 md:mt-20 flex flex-col gap-2 items-center justify-center relative z-10 px-4">
            <p className="text-sm text-primary-400 dark:text-white/50 text-center">
              تمامی حقوق پیراهن مردانه محفوظ است.
            </p>
          </div>
        </div>

        <div
          className="leading-none absolute left-1/2 -translate-x-1/2 bottom-36 md:bottom-32 font-extrabold tracking-tighter pointer-events-none select-none text-center px-4 bg-clip-text text-transparent"
          style={{
            fontSize: 'clamp(2.2rem, 10vw, 7rem)',
            maxWidth: '95vw',
            backgroundImage: dark
              ? 'linear-gradient(to bottom, rgba(19,171,196,0.35), rgba(19,171,196,0.08), transparent)'
              : 'linear-gradient(to bottom, rgba(255,0,0,0.28), rgba(255,0,0,0.08), transparent)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          PIRAHANMARDANE
        </div>

        <div
          className="absolute bottom-20 md:bottom-16 left-1/2 -translate-x-1/2 z-10 rounded-3xl border-2 bg-white/70 dark:bg-primary-900/70 backdrop-blur-sm flex items-center justify-center p-3 drop-shadow-lg"
          style={{ borderColor: dark ? 'rgba(19,171,196,0.45)' : 'rgba(255,0,0,0.35)' }}
        >
          <div className="w-14 sm:w-16 md:w-20 h-14 sm:h-16 md:h-20 rounded-2xl flex items-center justify-center overflow-hidden bg-transparent">
            {brandIcon || (
              <img
                src={dark ? '/blue_t_bg.webp' : '/red_t_bg.webp'}
                alt={brandName}
                className="w-full h-full object-contain bg-transparent"
                onError={(e) => {
                  try {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = dark ? '/blue_t_bg.webp' : '/red_t_bg.webp';
                  } catch (_) {}
                }}
              />
            )}
          </div>
        </div>

        <div
          className="absolute bottom-28 sm:bottom-28 h-0.5 w-full left-1/2 -translate-x-1/2"
          style={{
            background: dark
              ? 'linear-gradient(to right, transparent, rgba(19,171,196,0.5), transparent)'
              : 'linear-gradient(to right, transparent, rgba(255,0,0,0.4), transparent)',
          }}
        />
        <div className="bg-gradient-to-t from-primary-50 dark:from-primary-950 via-primary-50/80 dark:via-primary-950/80 to-transparent absolute bottom-24 w-full h-20 pointer-events-none" />
      </footer>
    </section>
  );
}

export default ModemAnimatedFooter;
