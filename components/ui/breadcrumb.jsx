'use client';

import React from 'react';

function HomeIcon({ className = '' }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M16 7.609c.352 0 .69.122.96.343l.111.1 6.25 6.25v.001a1.5 1.5 0 0 1 .445 1.071v7.5a.89.89 0 0 1-.891.891H9.125a.89.89 0 0 1-.89-.89v-7.5l.006-.149a1.5 1.5 0 0 1 .337-.813l.1-.11 6.25-6.25c.285-.285.67-.444 1.072-.444Zm5.984 7.876L16 9.5l-5.984 5.985v6.499h11.968z"
        className="fill-current stroke-current"
        strokeWidth=".094"
      />
    </svg>
  );
}

function ChevronIcon({ className = '' }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden
    >
      <path
        d="m5.587 10.663 6.25 6.25a.939.939 0 1 0 1.328-1.328L7.58 10l5.584-5.587a.939.939 0 1 0-1.328-1.328l-6.25 6.25a.94.94 0 0 0 .001 1.328"
        className="fill-current"
      />
    </svg>
  );
}

/**
 * Breadcrumb — items: [{ label, onClick?, href?, current? }]
 * اگر href باشد از <a> واقعی استفاده می‌شود (SEO + باز کردن در تب جدید)
 */
export function Breadcrumb({
  items = [],
  homeOnClick,
  homeHref = '/',
  className = '',
  showHomeIcon = true,
  fullWidth = false,
}) {
  const crumbs = Array.isArray(items) ? items.filter(Boolean) : [];
  if (!crumbs.length) return null;

  const linkClass =
    'truncate max-w-[11rem] sm:max-w-[16rem] text-primary-600 dark:text-white/70 hover:text-apple-blue dark:hover:text-[#4CCD99] transition';

  return (
    <nav className={`w-full relative z-10 border-t border-b border-primary-200 dark:border-white/20 bg-primary-50 dark:bg-primary-950 ${className}`} aria-label="breadcrumb" dir="rtl">
      <div className={`${fullWidth ? 'max-w-none' : 'max-w-none sm:max-w-7xl'} mx-auto px-2 sm:px-4 py-2 sm:py-3`}>
        <div className="flex flex-wrap justify-start items-center gap-x-2 gap-y-1 text-sm text-primary-500 dark:text-white/55 font-medium text-right">
          {(typeof homeOnClick === 'function' || homeHref) && (
            <>
              {homeHref ? (
                <a
                  href={homeHref}
                  onClick={(e) => {
                    if (typeof homeOnClick === 'function') {
                      e.preventDefault();
                      homeOnClick(e);
                    }
                  }}
                  aria-label="خانه"
                  className="inline-flex items-center justify-center text-primary-600 dark:text-white/70 hover:text-apple-blue dark:hover:text-[#4CCD99] transition"
                >
                  {showHomeIcon ? (
                    <HomeIcon className="w-7 h-7 sm:w-8 sm:h-8" />
                  ) : (
                    <span>خانه</span>
                  )}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={homeOnClick}
                  aria-label="خانه"
                  className="inline-flex items-center justify-center text-primary-600 dark:text-white/70 hover:text-apple-blue dark:hover:text-[#4CCD99] transition"
                >
                  {showHomeIcon ? (
                    <HomeIcon className="w-7 h-7 sm:w-8 sm:h-8" />
                  ) : (
                    <span>خانه</span>
                  )}
                </button>
              )}
              <ChevronIcon className="text-primary-300 dark:text-white/30 w-4 h-4 sm:w-5 sm:h-5" />
            </>
          )}

          {crumbs.map((item, i) => {
            const isLast = i === crumbs.length - 1 || !!item.current;
            return (
              <React.Fragment key={`${item.label}-${i}`}>
                {isLast ? (
                  <span
                    className="truncate max-w-[11rem] sm:max-w-[18rem] text-apple-blue dark:text-[#4CCD99] font-semibold"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : item.href ? (
                  <a
                    href={item.href}
                    onClick={(e) => {
                      if (typeof item.onClick === 'function') {
                        e.preventDefault();
                        item.onClick(e);
                      }
                    }}
                    className={linkClass}
                  >
                    {item.label}
                  </a>
                ) : item.onClick ? (
                  <button type="button" onClick={item.onClick} className={linkClass}>
                    {item.label}
                  </button>
                ) : (
                  <span className="truncate max-w-[11rem] sm:max-w-[18rem] text-primary-600 dark:text-white/70">
                    {item.label}
                  </span>
                )}
                {!isLast && (
                  <ChevronIcon className="text-primary-300 dark:text-white/30 w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default Breadcrumb;
