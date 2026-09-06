'use client';

import { useMemo, useState } from 'react';

function firstLetter(name) {
  const t = String(name || '').trim();
  if (!t) return '؟';
  const m = t.match(/[\u0600-\u06FFa-zA-Z0-9]/);
  return (m ? m[0] : t[0]).toUpperCase();
}

function isPlaceholder(src) {
  if (!src) return true;
  const s = String(src).trim();
  if (!s) return true;
  if (s === '/default-avatar.svg' || s === '/logo.webp') return true;
  return false;
}

/**
 * آواتار: عکس واقعی یا حرف اول نام
 * رنگ از تم لایت/دارک سایت (primary) — بدون پالت رنگی جدا
 */
export default function Avatar({
  name = '',
  src = '',
  size = 48,
  className = '',
  alt = '',
  shape = 'circle',
}) {
  const [broken, setBroken] = useState(false);
  const letter = useMemo(() => firstLetter(name), [name]);
  const hasImg = !isPlaceholder(src) && !broken;

  const dim = typeof size === 'number' ? `${size}px` : size;
  const fontSize = typeof size === 'number' ? Math.max(12, Math.round(size * 0.42)) : '1rem';
  const radius = shape === 'rounded' ? '1rem' : '9999px';

  if (hasImg) {
    return (
      <img
        src={src}
        alt={alt || name || ''}
        width={typeof size === 'number' ? size : undefined}
        height={typeof size === 'number' ? size : undefined}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
        className={`object-cover flex-shrink-0 ${className}`.trim()}
        style={{ width: dim, height: dim, borderRadius: radius }}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt || name || 'آواتار'}
      className={`flex items-center justify-center flex-shrink-0 select-none bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-white border border-primary-200/80 dark:border-white/15 ${className}`.trim()}
      style={{
        width: dim,
        height: dim,
        borderRadius: radius,
        fontFamily: 'IRANYekanX, var(--font-app), sans-serif',
        fontWeight: 700,
        fontSize,
        lineHeight: 1,
      }}
    >
      {letter}
    </div>
  );
}
