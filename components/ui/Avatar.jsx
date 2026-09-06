'use client';

import { useMemo, useState } from 'react';

const PALETTE = [
  { bg: '#E0F2FE', fg: '#0369A1' },
  { bg: '#D1FAE5', fg: '#047857' },
  { bg: '#EDE9FE', fg: '#6D28D9' },
  { bg: '#FFE4E6', fg: '#BE123C' },
  { bg: '#FEF3C7', fg: '#B45309' },
  { bg: '#E0E7FF', fg: '#4338CA' },
  { bg: '#CCFBF1', fg: '#0F766E' },
  { bg: '#F3E8FF', fg: '#7E22CE' },
];

function firstLetter(name) {
  const t = String(name || '').trim();
  if (!t) return '؟';
  const m = t.match(/[\u0600-\u06FFa-zA-Z0-9]/);
  return (m ? m[0] : t[0]).toUpperCase();
}

function colorFor(name) {
  const s = String(name || '');
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function isPlaceholder(src) {
  if (!src) return true;
  const s = String(src).trim();
  if (!s) return true;
  if (s === '/default-avatar.svg' || s === '/logo.webp') return true;
  return false;
}

/**
 * آواتار سراسری: عکس واقعی یا حرف اول نام با فونت IRANYekanX
 * shape: 'circle' | 'rounded'
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
  const colors = useMemo(() => colorFor(name || letter), [name, letter]);
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
      className={`flex items-center justify-center flex-shrink-0 select-none ${className}`.trim()}
      style={{
        width: dim,
        height: dim,
        borderRadius: radius,
        backgroundColor: colors.bg,
        color: colors.fg,
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
