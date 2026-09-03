'use client';

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { motion } from 'framer-motion';
import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner';
import { cn } from '@/lib/utils';

function isDarkMode() {
  if (typeof document === 'undefined') return true;
  return (
    document.documentElement.classList.contains('dark') ||
    document.body?.classList?.contains('dark') ||
    !!document.querySelector('.dark')
  );
}

/** Palette only: success=pastel green · error=pastel red · info/default=purple (no yellow) */
function getPalette(variant) {
  const dark = isDarkMode();
  // فقط سه خانواده: سبز پاستیلی (موفق) · قرمز پاستیلی (خطا) · بنفش پاستیلی (اینفو)
  const map = {
    success: dark
      ? { bg: '#16382C', border: '#86EFAC', text: '#ECFDF5', icon: '#86EFAC' }
      : { bg: '#D1FAE5', border: '#34D399', text: '#065F46', icon: '#059669' },
    error: dark
      ? { bg: '#3B1F24', border: '#FCA5A5', text: '#FEF2F2', icon: '#FCA5A5' }
      : { bg: '#FEE2E2', border: '#F87171', text: '#991B1B', icon: '#DC2626' },
    default: dark
      ? { bg: '#2E2348', border: '#DDD6FE', text: '#F5F3FF', icon: '#C4B5FD' }
      : { bg: '#EDE9FE', border: '#A78BFA', text: '#5B21B6', icon: '#7C3AED' },
  };
  if (variant === 'warning') return map.error; // خطا و اخطار → قرمز پاستیلی
  if (variant === 'info') return map.default;
  return map[variant] || map.default;
}

function IconSvg({ type, color, size = 16 }) {
  const s = { width: size, height: size, flexShrink: 0, color };
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    style: s,
    'aria-hidden': true,
  };
  if (type === 'success') {
    return (
      <svg {...common}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    );
  }
  if (type === 'error') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    );
  }
  if (type === 'close') {
    return (
      <svg {...common}>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    );
  }
  // info / default
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

const toastAnimation = {
  initial: { opacity: 0, y: -16, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -12, scale: 0.96 },
};

/** جلوگیری از دو بار آمدن همان پیام در فاصله کوتاه */
const recentToastMap = new Map();
const TOAST_DEDUP_MS = 2200;

/**
 * Site-wide toast API — always top-center.
 * success → pastel green | error → pastel red | info/default → purple (no yellow)
 * هر پیام یکتا فقط یک‌بار در بازهٔ کوتاه نشان داده می‌شود.
 */
export function showToast({
  title,
  message,
  variant = 'default',
  duration = 4000,
  position = 'top-center',
  actions,
  onDismiss,
  id,
} = {}) {
  // success=سبز · error/warning=قرمز پاستیلی · info/default=بنفش
  const v =
    variant === 'success' ? 'success'
    : (variant === 'error' || variant === 'warning') ? 'error'
    : 'default';
  const pal = getPalette(v);
  // متن کامل، تک‌خطی (بدون برش با …)
  const raw = String(message || title || '');
  const text = raw.replace(/\s+/g, ' ').trim();
  const titleClean = title ? String(title).replace(/\s+/g, ' ').trim() : '';
  const showTitle = !!(titleClean && text && titleClean !== text);
  const dedupeKey = id || `${v}::${String(title || '')}::${String(text)}`;
  const now = Date.now();
  const prev = recentToastMap.get(dedupeKey);
  if (prev && now - prev < TOAST_DEDUP_MS) {
    return prev;
  }
  recentToastMap.set(dedupeKey, now);
  // پاکسازی کلیدهای قدیمی
  if (recentToastMap.size > 40) {
    for (const [k, t] of recentToastMap) {
      if (now - t > TOAST_DEDUP_MS * 3) recentToastMap.delete(k);
    }
  }

  // همان id باعث می‌شود sonner toast تکراری را جایگزین کند نه روی هم بچیند
  const toastKey = dedupeKey.slice(0, 120);

  return sonnerToast.custom(
    (toastId) => (
      <motion.div
        variants={toastAnimation}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="flex items-center justify-between gap-2 w-max max-w-[min(96vw,42rem)] px-3.5 py-2.5 rounded-2xl border shadow-lg"
        style={{
          backgroundColor: pal.bg,
          borderColor: pal.border,
          color: pal.text,
        }}
        dir="rtl"
        data-app-toast="1"
        data-toast-variant={v}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <IconSvg type={v === 'default' ? 'info' : v} color={pal.icon} size={16} />
          <div className="min-w-0 text-right">
            {showTitle ? (
              <h3
                className="text-[11px] sm:text-xs font-bold leading-none whitespace-nowrap"
                style={{ color: pal.text }}
              >
                {titleClean}
              </h3>
            ) : null}
            <p
              className={cn(
                'text-[11px] sm:text-xs leading-none whitespace-nowrap font-medium',
                showTitle ? 'mt-1 opacity-95' : ''
              )}
              style={{ color: pal.text }}
            >
              {text}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions?.label ? (
            <button
              type="button"
              onClick={() => {
                actions.onClick?.();
                sonnerToast.dismiss(toastId);
              }}
              className="cursor-pointer h-7 px-2.5 text-xs rounded-md border bg-transparent font-medium"
              style={{ color: pal.text, borderColor: pal.border }}
            >
              {actions.label}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              sonnerToast.dismiss(toastId);
              onDismiss?.();
            }}
            className="rounded-full p-1 transition-colors"
            style={{ color: pal.icon }}
            aria-label="بستن"
          >
            <IconSvg type="close" color={pal.icon} size={14} />
          </button>
        </div>
      </motion.div>
    ),
    { duration, position, id: toastKey }
  );
}

export const Toaster = forwardRef(function Toaster(
  { defaultPosition = 'top-center' },
  ref
) {
  const toastReference = useRef(null);

  useImperativeHandle(ref, () => ({
    show(props) {
      toastReference.current = showToast({
        position: defaultPosition,
        ...props,
      });
    },
  }));

  return (
    <SonnerToaster
      position={defaultPosition}
      expand
      visibleToasts={4}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: 'flex justify-center w-full',
        },
      }}
      dir="rtl"
      style={{ zIndex: 99999 }}
    />
  );
});

export default Toaster;
