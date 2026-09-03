'use client';

import React, { useEffect, useMemo, useState } from 'react';

const INTRO_STYLE_ID = 'faq1-animations';

function ensureStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(INTRO_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = INTRO_STYLE_ID;
  style.innerHTML = `
    @keyframes faq1-fade-up {
      0% { transform: translate3d(0, 16px, 0); opacity: 0; filter: blur(6px); }
      60% { filter: blur(0); }
      100% { transform: translate3d(0, 0, 0); opacity: 1; filter: blur(0); }
    }
    .faq1-fade--ready {
      animation: faq1-fade-up 860ms cubic-bezier(0.22, 0.68, 0, 1) both;
    }
    .dark .faq-plus-icon { color: #FFFFFF !important; }
    .dark .faq-plus-icon path { stroke: #FFFFFF !important; }
    .dark .faq-plus-icon.is-open { color: #4CCD99 !important; }
    .dark .faq-plus-icon.is-open path { stroke: #4CCD99 !important; }
    .faq-plus-icon { color: #171717; }
    .faq-plus-icon path { stroke: currentColor; }
  `;
  document.head.appendChild(style);
}

/**
 * FAQ مونوکروم — بدون mismatch تم سرور/کلاینت (فقط کلاس‌های dark:)
 */
export function FAQMonochrome({
  items = [],
  title = 'سوالات متداول',
  subtitle = '',
  badge = 'FAQ',
  className = '',
  compact = false,
  defaultOpen = 0,
}) {
  const [activeIndex, setActiveIndex] = useState(defaultOpen);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    ensureStyles();
    setHasEntered(true);
  }, []);

  const normalized = useMemo(
    () =>
      (items || [])
        .map((it) => ({
          question: it.question || it.q || '',
          answer: it.answer || it.a || '',
          meta: it.meta || it.cat || '',
        }))
        .filter((it) => it.question),
    [items]
  );

  const toggleQuestion = (index) => setActiveIndex((prev) => (prev === index ? -1 : index));

  const setCardGlow = (event) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    target.style.setProperty('--faq-x', `${event.clientX - rect.left}px`);
    target.style.setProperty('--faq-y', `${event.clientY - rect.top}px`);
  };
  const clearCardGlow = (event) => {
    event.currentTarget.style.removeProperty('--faq-x');
    event.currentTarget.style.removeProperty('--faq-y');
  };

  if (!normalized.length) return null;

  return (
    <div
      className={`relative w-full overflow-hidden transition-colors duration-500 bg-transparent text-neutral-900 dark:text-neutral-100 ${className}`}
      dir="rtl"
    >
      <section
        className={`relative z-10 mx-auto flex w-full flex-col ${compact ? 'gap-6 py-2' : 'gap-8 py-4 sm:py-6'} ${
          hasEntered ? 'faq1-fade--ready' : ''
        }`}
      >
        {(title || subtitle || badge) && (
          <header className="flex flex-col gap-3 sm:gap-4">
            {badge ? (
              <p className="text-[10px] uppercase tracking-[0.35em] text-neutral-600 dark:text-neutral-400">{badge}</p>
            ) : null}
            {title ? (
              <h2 className="text-xl font-semibold leading-tight sm:text-2xl md:text-3xl text-neutral-900 dark:text-white">
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className="max-w-2xl text-sm sm:text-base text-neutral-600 dark:text-neutral-400">{subtitle}</p>
            ) : null}
          </header>
        )}

        <ul className="space-y-3 sm:space-y-4">
          {normalized.map((item, index) => {
            const open = activeIndex === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-trigger-${index}`;
            return (
              <li
                key={`${item.question}-${index}`}
                className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-neutral-200 dark:border-white/10 bg-white/80 dark:bg-[#191919]/90 backdrop-blur-xl transition-colors duration-300 shadow-[0_24px_80px_-50px_rgba(15,15,15,0.15)] dark:shadow-[0_24px_80px_-40px_rgba(0,0,0,0.65)]"
                onMouseMove={setCardGlow}
                onMouseLeave={clearCardGlow}
              >
                <div
                  className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
                    open ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  style={{
                    background:
                      'radial-gradient(220px circle at var(--faq-x, 50%) var(--faq-y, 50%), rgba(255, 107, 53, 0.12), transparent 70%)',
                  }}
                />
                <button
                  type="button"
                  id={buttonId}
                  aria-controls={panelId}
                  aria-expanded={open}
                  onClick={() => toggleQuestion(index)}
                  className="relative flex w-full items-start gap-4 sm:gap-6 px-4 py-5 sm:px-7 sm:py-6 text-right transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4CCD99]/50"
                >
                  <span className={`relative flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl border transition-all duration-500 ${
                      open
                        ? 'border-[#4CCD99]/60 bg-[#4CCD99]/15 dark:border-[#4CCD99]/70 dark:bg-[#4CCD99]/20'
                        : 'border-neutral-300 bg-neutral-100 dark:border-white/45 dark:bg-[#2A2C30]'
                    }`}>
                    <span
                      className={`pointer-events-none absolute inset-0 rounded-2xl border opacity-30 ${
                        open ? 'border-[#4CCD99] animate-ping' : 'border-neutral-300 dark:border-white/40'
                      }`}
                    />
                    <svg
                      className={`faq-plus-icon relative h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-500 ${
                        open ? 'is-open rotate-45 text-[#4CCD99]' : 'text-neutral-900 dark:text-white'
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden
                      style={open ? { color: '#4CCD99' } : undefined}
                    >
                      <path d="M12 5v14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div className="flex flex-1 flex-col gap-3 min-w-0">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                      <h3 className="text-sm font-medium leading-snug sm:text-base md:text-lg text-neutral-900 dark:text-white">
                        {item.question}
                      </h3>
                      {item.meta ? (
                        <span className="inline-flex w-fit items-center rounded-full border border-neutral-200 dark:border-white/10 px-2.5 py-0.5 text-[10px] tracking-wide sm:mr-auto text-neutral-600 dark:text-neutral-400">
                          {item.meta}
                        </span>
                      ) : null}
                    </div>
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      className={`overflow-hidden text-xs sm:text-sm leading-relaxed transition-[max-height] duration-500 ease-out text-neutral-600 dark:text-neutral-400 ${
                        open ? 'max-h-[32rem]' : 'max-h-0'
                      }`}
                    >
                      {/<[a-z][\s\S]*>/i.test(item.answer || '') ? (
                        <div className="pb-1 pl-1 prose prose-sm dark:prose- max-w-none" dangerouslySetInnerHTML={{ __html: item.answer }} />
                      ) : (
                        <p className="pb-1 pl-1">{item.answer}</p>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

export default FAQMonochrome;
