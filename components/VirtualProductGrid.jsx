'use client';

import { useMemo, useState, useEffect, useRef, memo } from 'react';

/**
 * گرید مجازی ساده برای PLP — فقط ردیف‌های نزدیک viewport را render می‌کند
 * ظاهر همان grid است؛ فقط تعداد DOM کمتر می‌شود.
 */
function VirtualProductGridInner({
  items = [],
  renderItem,
  columns = 2,
  rowHeight = 320,
  gap = 12,
  overscan = 2,
  className = '',
}) {
  const scrollerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewH, setViewH] = useState(800);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return undefined;
    const onScroll = () => setScrollTop(el.scrollTop || window.scrollY || 0);
    // PLP معمولاً با اسکرول صفحه است نه ظرف
    let raf = 0;
    const onWin = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setScrollTop(window.scrollY || 0);
      });
    };
    window.addEventListener('scroll', onWin, { passive: true });
    setViewH(window.innerHeight || 800);
    const onResize = () => setViewH(window.innerHeight || 800);
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      window.removeEventListener('scroll', onWin);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const [cols, setCols] = useState(columns);
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth || 400;
      if (w < 640) setCols(2);
      else if (w < 768) setCols(2);
      else if (w < 1024) setCols(3);
      else setCols(columns || 4);
    };
    calc();
    window.addEventListener('resize', calc, { passive: true });
    return () => window.removeEventListener('resize', calc);
  }, [columns]);

  const rows = Math.ceil(items.length / Math.max(1, cols));
  const totalH = rows * (rowHeight + gap);

  const { startRow, endRow } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / (rowHeight + gap)) - overscan);
    const visible = Math.ceil(viewH / (rowHeight + gap)) + overscan * 2;
    return { startRow: start, endRow: Math.min(rows, start + visible) };
  }, [scrollTop, viewH, rowHeight, gap, overscan, rows]);

  const slice = [];
  for (let r = startRow; r < endRow; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const idx = r * cols + c;
      if (idx < items.length) slice.push({ item: items[idx], idx, row: r, col: c });
    }
  }

  const padTop = startRow * (rowHeight + gap);

  return (
    <div ref={scrollerRef} className={className} style={{ position: 'relative', minHeight: totalH, contain: 'layout style' }}>
      <div style={{ height: padTop }} aria-hidden />
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gap,
        }}
      >
        {slice.map(({ item, idx }) => (
          <div key={item.id ?? idx} style={{ minHeight: rowHeight }}>
            {renderItem(item, idx)}
          </div>
        ))}
      </div>
      <div style={{ height: Math.max(0, totalH - padTop - (endRow - startRow) * (rowHeight + gap)) }} aria-hidden />
    </div>
  );
}

export default memo(VirtualProductGridInner);
