'use client';

import React, { useMemo } from 'react';

function cn(...parts) {
  return parts.filter(Boolean).join(' ');
}

function GridPattern({ width, height, x, y, squares, className }) {
  const patternId = React.useId();
  return (
    <svg aria-hidden className={className}>
      <defs>
        <pattern id={patternId} width={width} height={height} patternUnits="userSpaceOnUse" x={x} y={y}>
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${patternId})`} />
      {squares ? (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([sx, sy], index) => (
            <rect key={index} strokeWidth="0" width={width + 1} height={height + 1} x={sx * width} y={sy * height} />
          ))}
        </svg>
      ) : null}
    </svg>
  );
}

function genPattern(seed = 0) {
  // پایدار برای SSR — نه random هر رندر
  const out = [];
  let s = (seed * 9301 + 49297) % 233280;
  for (let i = 0; i < 5; i++) {
    s = (s * 9301 + 49297) % 233280;
    const x = 7 + (s % 4);
    s = (s * 9301 + 49297) % 233280;
    const y = 1 + (s % 6);
    out.push([x, y]);
  }
  return out;
}

export function FeatureCard({ title, description, iconNode, className, seed = 0, ...props }) {
  const p = useMemo(() => genPattern(seed), [seed]);
  return (
    <div className={cn('relative overflow-hidden p-5 sm:p-6', className)} {...props}>
      <div className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 h-full w-full [mask-image:linear-gradient(white,transparent)]">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/5 to-transparent dark:from-white/5 [mask-image:radial-gradient(farthest-side_at_top,white,transparent)]">
          <GridPattern
            width={20}
            height={20}
            x="-12"
            y="4"
            squares={p}
            className="absolute inset-0 h-full w-full fill-primary-900/5 stroke-primary-900/20 dark:fill-white/5 dark:stroke-white/20 mix-blend-overlay"
          />
        </div>
      </div>
      <div className="text-primary-700 dark:text-white/80">{iconNode}</div>
      <h3 className="mt-8 sm:mt-10 text-sm md:text-base font-semibold text-primary-900 dark:text-white">{title}</h3>
      <p className="relative z-20 mt-2 text-xs font-light text-primary-500 dark:text-white/65 leading-relaxed">{description}</p>
    </div>
  );
}

export function FeatureCardsGrid({ items, renderIcon }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-x-0 sm:divide-x divide-y divide-dashed border border-dashed border-primary-200 dark:border-white/20 rounded-2xl overflow-hidden bg-white/60 dark:bg-primary-950/40">
      {items.map((f, i) => (
        <FeatureCard
          key={i}
          seed={i + 1}
          title={f.title}
          description={f.desc || f.description || ''}
          iconNode={renderIcon ? renderIcon(f) : null}
        />
      ))}
    </div>
  );
}
