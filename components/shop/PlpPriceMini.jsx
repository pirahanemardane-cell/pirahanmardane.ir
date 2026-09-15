'use client';

import { useMemo, useState } from 'react';
import { buildPriceHistory } from '@/lib/price-history';

/**
 * نسخه جمع‌وجور روند قیمت برای کارت/لیست PLP (شبیه ترب، خیلی کوچک‌تر از PDP)
 */
export default function PlpPriceMini({ product, toFa = (n) => String(n), compact = true }) {
  const [open, setOpen] = useState(false);
  const hist = useMemo(() => {
    try {
      if (product?.priceHistory?.length >= 2) return product.priceHistory;
      return buildPriceHistory(product);
    } catch (_) {
      return [];
    }
  }, [product]);

  if (!hist || hist.length < 2) return null;

  const prices = hist.map((x) => Number(x.price) || 0).filter((n) => n > 0);
  if (prices.length < 2) return null;
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const last = prices[prices.length - 1];
  const first = prices[0];
  const drop = first > 0 ? Math.round(((first - last) / first) * 100) : 0;
  const range = maxP - minP || 1;
  const w = compact ? 72 : 120;
  const h = compact ? 22 : 36;
  const pts = prices.map((price, i) => {
    const x = (i / (prices.length - 1)) * w;
    const y = h - ((price - minP) / range) * (h - 2) - 1;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="mt-1.5">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="w-full flex items-center gap-2 text-right rounded-lg px-1 py-0.5 hover:bg-primary-50/80 hover:bg-white/5 transition"
        aria-expanded={open}
        title="روند قیمت"
      >
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="flex-shrink-0 opacity-90" aria-hidden>
          <polyline
            fill="none"
            stroke={drop >= 0 ? '#059669' : '#dc2626'}
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={pts}
          />
        </svg>
        <span className="text-[10px] sm:text-[11px] text-primary-500 text-white/60 truncate">
          {drop > 0 ? (
            <span className="text-emerald-600 text-emerald-400 font-medium">{toFa(drop)}٪↓</span>
          ) : drop < 0 ? (
            <span className="text-red-500 font-medium">{toFa(Math.abs(drop))}٪↑</span>
          ) : (
            <span>روند قیمت</span>
          )}
        </span>
        <span className="text-[10px] text-primary-400 mr-auto">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div
          className="mt-1 overflow-hidden rounded-lg border border-primary-100 border-white/10 bg-white bg-primary-950"
          onClick={(e) => e.stopPropagation()}
        >
          <table className="w-full text-[10px] sm:text-[11px] text-right">
            <thead>
              <tr className="bg-primary-50 bg-primary-900/60 text-primary-600 text-white/70">
                <th className="px-2 py-1 font-semibold">بازه</th>
                <th className="px-2 py-1 font-semibold">قیمت</th>
                <th className="px-2 py-1 font-semibold">٪</th>
              </tr>
            </thead>
            <tbody>
              {hist.map((row, i) => {
                const prev = i > 0 ? Number(hist[i - 1].price) || 0 : Number(row.price) || 0;
                const cur = Number(row.price) || 0;
                const diff = cur - prev;
                const pct = prev > 0 ? Math.round((diff / prev) * 100) : 0;
                return (
                  <tr key={i} className="border-t border-primary-50 border-white/10">
                    <td className="px-2 py-1 text-primary-700 text-white/80">{row.label}</td>
                    <td className="px-2 py-1 font-medium text-primary-900 text-white">
                      {toFa(cur.toLocaleString('en-US'))}
                    </td>
                    <td className={`px-2 py-1 ${diff < 0 ? 'text-emerald-600' : diff > 0 ? 'text-red-500' : 'text-primary-400'}`}>
                      {i === 0 ? '—' : `${diff > 0 ? '+' : ''}${toFa(pct)}٪`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
