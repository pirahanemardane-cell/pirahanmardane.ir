'use client';

import React, { useEffect, useRef, useState } from 'react';

const glowColorMap = {
  blue: { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  green: { base: 120, spread: 200 },
  red: { base: 0, spread: 200 },
  orange: { base: 30, spread: 200 },
};

const sizeMap = {
  sm: 'w-48 h-64',
  md: 'w-64 h-80',
  lg: 'w-80 h-96',
};

/**
 * Spotlight / glow border card — product cards only.
 * Hydration-safe: first render (SSR + first client paint) is a plain div
 * with no data-glow / CSS vars. Glow is applied only after mount.
 */
export function GlowCard({
  children,
  className = '',
  glowColor = 'orange',
  size = 'md',
  width,
  height,
  customSize = false,
  onClick,
  onKeyDown,
  role,
  tabIndex,
  ...rest
}) {
  const cardRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const el = cardRef.current;
    if (!el) return;

    const { base, spread } = glowColorMap[glowColor] || glowColorMap.orange;
    el.setAttribute('data-glow', '');
    el.setAttribute('data-product-glow', '');
    el.style.setProperty('--base', String(base));
    el.style.setProperty('--spread', String(spread));
    el.style.setProperty('--radius', '16');
    el.style.setProperty('--border', '2');
    el.style.setProperty('--backdrop', 'transparent');
    el.style.setProperty('--backup-border', 'rgba(128,128,128,0.18)');
    el.style.setProperty('--size', '220');
    el.style.setProperty('--outer', '1');
    el.style.setProperty('--border-size', 'calc(var(--border, 2) * 1px)');
    el.style.setProperty('--spotlight-size', 'calc(var(--size, 150) * 1px)');
    el.style.setProperty('--hue', 'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))');
    el.style.backgroundImage = `radial-gradient(
      var(--spotlight-size) var(--spotlight-size) at
      calc(var(--x, 0) * 1px)
      calc(var(--y, 0) * 1px),
      hsl(var(--hue, 30) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 70) * 1%) / var(--bg-spot-opacity, 0.08)), transparent
    )`;
    el.style.backgroundSize = 'calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))';
    el.style.backgroundPosition = '50% 50%';
    el.style.backgroundAttachment = 'fixed';
    el.style.border = 'var(--border-size) solid var(--backup-border)';

    const syncPointer = (e) => {
      if (!cardRef.current) return;
      const { clientX: x, clientY: y } = e;
      cardRef.current.style.setProperty('--x', x.toFixed(2));
      cardRef.current.style.setProperty('--xp', (x / window.innerWidth).toFixed(2));
      cardRef.current.style.setProperty('--y', y.toFixed(2));
      cardRef.current.style.setProperty('--yp', (y / window.innerHeight).toFixed(2));
    };
    document.addEventListener('pointermove', syncPointer, { passive: true });
    return () => {
      document.removeEventListener('pointermove', syncPointer);
    };
  }, [mounted, glowColor]);

  const getSizeClasses = () => {
    if (customSize) return '';
    return sizeMap[size] || sizeMap.md;
  };

  // First render MUST match SSR exactly — no data-glow, no CSS vars
  const style = { position: 'relative' };
  if (width !== undefined) {
    style.width = typeof width === 'number' ? `${width}px` : width;
  }
  if (height !== undefined) {
    style.height = typeof height === 'number' ? `${height}px` : height;
  }

  const sizeCls = getSizeClasses();
  const aspectCls = customSize ? '' : 'aspect-[3/4]';
  const combined = [sizeCls, aspectCls, 'rounded-2xl', 'relative', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={cardRef}
      style={style}
      role={role}
      tabIndex={tabIndex}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={combined}
      suppressHydrationWarning
      {...rest}
    >
      {children}
    </div>
  );
}

export default GlowCard;
