'use client';


import { useEffect } from 'react';
import { useAppApi } from '../AppApiContext';
import dynamic from 'next/dynamic';
const VirtualProductGrid = dynamic(() => import('../VirtualProductGrid'), { ssr: false, loading: () => <div className="min-h-[200px] animate-pulse rounded-2xl bg-primary-100 dark:bg-primary-900" aria-hidden /> });

/** PlpView — code-split from App.jsx */
export default function PlpView() {
  const {
    allColors,
    allFabrics,
    allSellerNames,
    colorHexMap,
    Icon,
    activeSellerId,
    clearPlpFilters,
    dark,
    formatPrice,
    openPDP,
    openQuickAdd,
    pdpProduct,
    plpActiveChips,
    activePlpCategory,
    activePlpTag,
    plpFiltered,
    plpHasMore,
    plpEmptyHints,
    plpH1,
    plpPriceBounds,
    plpSentinelRef,
    plpSeoFooterHtml,
    plpSeoFooterIsHtml,
    plpVisibleProducts,
    plpColors,
    plpDiscountOnly,
    plpFabrics,
    plpFastShipOnly,
    plpFilterOpen,
    plpFilterTab,
    plpInStockOnly,
    plpMinDiscount,
    plpPriceMax,
    plpPriceMin,
    plpSellers,
    plpSidebarOpen,
    plpSizes,
    plpSkeleton,
    plpSort,
    plpSortOpen,
    plpView,
    products,
    renderProductCard,
    setPlpColors,
    setPlpDiscountOnly,
    setPlpFabrics,
    setPlpFastShipOnly,
    setPlpFilterOpen,
    setPlpFilterTab,
    setPlpInStockOnly,
    setPlpMinDiscount,
    setPlpPriceMax,
    setPlpPriceMin,
    setPlpSellers,
    setPlpSidebarOpen,
    setPlpSizes,
    setPlpSort,
    setPlpSortOpen,
    setPlpViewPersist,
    setPlpVisible,
    showAdminPanel,
    showCartPage,
    showComparePage,
    showPLP,
    showProfilePage,
    showRecentPage,
    showSellerPanel,
    showSellersList,
    showTaxonomyHub,
    showWishlistPage,
    staticPage,
    allSizes,
    toFa
  } = useAppApi();
  // Defensive defaults — never crash if context is incomplete
  const plpActiveChipsSafe = Array.isArray(plpActiveChips) ? plpActiveChips : [];
  const plpFilteredSafe = Array.isArray(plpFiltered) ? plpFiltered : [];
  const activePlpCategorySafe = activePlpCategory || null;
  const activePlpTagSafe = activePlpTag || null;
  const plpHasMoreSafe = !!plpHasMore;
  const plpEmptyHintsSafe = Array.isArray(plpEmptyHints) ? plpEmptyHints : [];
  const plpVisibleProductsSafe = Array.isArray(plpVisibleProducts) ? plpVisibleProducts : plpFilteredSafe;
  const allColorsSafe = Array.isArray(allColors) ? allColors : [];
  const allFabricsSafe = Array.isArray(allFabrics) ? allFabrics : [];
  const allSellerNamesSafe = Array.isArray(allSellerNames) ? allSellerNames : [];
  const colorHexMapSafe = colorHexMap && typeof colorHexMap === 'object' ? colorHexMap : {};
  const allSizesSafe = Array.isArray(allSizes) ? allSizes : [];
  const plpPriceBoundsSafe = (plpPriceBounds && typeof plpPriceBounds === 'object')
    ? {
        min: Number.isFinite(plpPriceBounds.min) ? plpPriceBounds.min : 0,
        max: Number.isFinite(plpPriceBounds.max) ? plpPriceBounds.max : 0,
      }
    : { min: 0, max: 0 };
  const plpH1Safe = plpH1 || 'فروشگاه';
  const plpSeoFooterHtmlSafe = plpSeoFooterHtml || '';
  const plpColorsSafe = Array.isArray(plpColors) ? plpColors : [];
  const plpFabricsSafe = Array.isArray(plpFabrics) ? plpFabrics : [];
  const plpSellersSafe = Array.isArray(plpSellers) ? plpSellers : [];
  const plpSizesSafe = Array.isArray(plpSizes) ? plpSizes : [];
  const productsSafe = Array.isArray(products) ? products : [];

  // ورود به فروشگاه: همیشه از بالای صفحه (نزدیک هدر)، نه نزدیک فوتر
  useEffect(() => {
    if (!showPLP) return;
    const toTop = () => {
      try {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      } catch (_) {
        try { window.scrollTo(0, 0); } catch (__) {}
      }
    };
    toTop();
    const t1 = requestAnimationFrame(toTop);
    const t2 = setTimeout(toTop, 50);
    const t3 = setTimeout(toTop, 250);
    return () => {
      cancelAnimationFrame(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [showPLP, activePlpCategorySafe, activePlpTagSafe, plpH1Safe]);

  return (
    <>
          {showPLP && !activeSellerId && !showSellersList && !showTaxonomyHub && !pdpProduct && !showCartPage && !showWishlistPage && !showRecentPage && !showComparePage && !showProfilePage && !showSellerPanel && !showAdminPanel && !staticPage && (
            <div className="flex-1 flex flex-col bg-primary-50 dark:bg-primary-950 pb-16 sm:pb-0">
              {/* نوار فیلتر/مرتب‌سازی زیر breadcrumb حذف شد — فقط نوار پایین موبایل + سایدبار دسکتاپ */}

              <div className="max-w-7xl mx-auto px-3 sm:px-4 py-5 w-full flex-1">
                {/* هدر دسته / برچسب با تصویر شاخص */}
                {(activePlpCategorySafe?.image || activePlpTagSafe?.image) && (
                  <div className="mb-4 rounded-2xl overflow-hidden border border-primary-100 dark:border-white/10 relative h-36 sm:h-48">
                    <img src={activePlpTagSafe?.image || activePlpCategorySafe?.image} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 right-3 left-3">
                      <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow">{plpH1Safe}</h1>
                      {activePlpTagSafe && <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-red-500/90 text-white">برچسب · noindex</span>}
                    </div>
                  </div>
                )}
                <div className="mb-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    {!(activePlpCategorySafe?.image || activePlpTagSafe?.image) && (
                      <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-white">{plpH1Safe}</h1>
                    )}
                    <div className={`flex items-center gap-2 ${(activePlpCategorySafe?.image || activePlpTagSafe?.image) ? 'w-full justify-between' : ''}`}>
                      <p className="text-xs text-primary-500 dark:!text-white">{toFa(plpFilteredSafe.length)} محصول</p>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setPlpSidebarOpen(v => !v)} className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium">
                          <Icon name="sliders" size={14} /> {plpSidebarOpen ? 'مخفی فیلتر' : 'فیلتر'}
                        </button>
                        <button type="button" onClick={() => setPlpViewPersist(v => v === 'grid' ? 'list' : 'grid')} className="hidden sm:flex w-8 h-8 rounded-full border border-primary-200 dark:border-white/30 items-center justify-center text-primary-700 dark:text-white" title="نمایش">
                          <Icon name={plpView === 'grid' ? 'grid' : 'list'} size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  {(activePlpCategorySafe?.description || activePlpTagSafe?.description) && (
                    <p className="text-sm text-primary-600 dark:text-white/70 leading-relaxed mb-2 line-clamp-3">
                      {activePlpTagSafe?.description || activePlpCategorySafe?.description}
                    </p>
                  )}
                </div>

                {/* چیپ فیلترهای فعال */}
                {plpActiveChipsSafe.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mb-4">
                    {plpActiveChipsSafe.map(ch => (
                      <button key={ch.key} type="button" onClick={() => { ch.clear(); setPlpVisible(8); }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-primary-800 text-white dark:bg-[#13ABC4] dark:!text-white">
                        {ch.label} <Icon name="x" size={14} />
                      </button>
                    ))}
                    <button type="button" onClick={clearPlpFilters} className="text-xs text-apple-blue dark:text-[#13ABC4] underline px-1">پاک کردن همه</button>
                  </div>
                )}

                <div className="flex gap-5 items-start">
                  {/* سایدبار فیلتر دسکتاپ */}
                  {plpSidebarOpen && (
                    <aside className="hidden md:block plp-filter-aside w-56 md:w-56 lg:w-64 flex-shrink-0 sticky top-[130px] max-h-[calc(100vh-150px)] overflow-y-auto rounded-2xl bg-white/80 dark:bg-black/80 backdrop-blur-xl backdrop-saturate-150 border border-primary-100/70 dark:border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] p-4 space-y-5">
                      <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-primary-900 dark:text-white">فیلترها</h2>
                        {plpActiveChipsSafe.length > 0 && (
                          <button type="button" onClick={clearPlpFilters} className="text-xs text-apple-blue dark:text-[#13ABC4]">پاک کردن</button>
                        )}
                      </div>
                      {/* قیمت */}
                      <div>
                        <p className="text-xs font-bold text-primary-500 dark:!text-white mb-2">قیمت (تومان)</p>
                        <div className="flex gap-2 mb-2">
                          <input type="number" inputMode="numeric" placeholder="از" value={plpPriceMin} onChange={e => { setPlpPriceMin(e.target.value); setPlpVisible(8); }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-primary-200 dark:border-white/20 bg-primary-50 dark:bg-primary-950 text-xs text-primary-900 dark:text-white focus:outline-none" />
                          <input type="number" inputMode="numeric" placeholder="تا" value={plpPriceMax} onChange={e => { setPlpPriceMax(e.target.value); setPlpVisible(8); }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-primary-200 dark:border-white/20 bg-primary-50 dark:bg-primary-950 text-xs text-primary-900 dark:text-white focus:outline-none" />
                        </div>
                        <p className="text-xs text-primary-400 dark:!text-white">محدوده: {toFa(Math.round(plpPriceBoundsSafe.min / 1000))}k – {toFa(Math.round(plpPriceBoundsSafe.max / 1000))}k</p>
                        <input type="range" min={plpPriceBoundsSafe.min} max={plpPriceBoundsSafe.max} step={10000}
                          value={plpPriceMax !== '' ? Number(plpPriceMax) : plpPriceBoundsSafe.max}
                          onChange={e => { setPlpPriceMax(String(e.target.value)); setPlpVisible(8); }}
                          className="w-full mt-2 accent-apple-blue" />
                      </div>
                      {/* رنگ */}
                      <div>
                        <p className="text-xs font-bold text-primary-500 dark:!text-white mb-2">رنگ</p>
                        <div className="flex flex-wrap gap-2">
                          {allColorsSafe.map(c => {
                            const on = plpColorsSafe.includes(c);
                            const hex = colorHexMapSafe[c] || '#888';
                            const cnt = productsSafe.filter(p => (p.colors || []).some(x => x.name === c)).length;
                            return (
                              <button key={c} type="button" title={`${c} (${toFa(cnt)})`} onClick={() => { setPlpColors(prev => on ? prev.filter(x => x !== c) : [...prev, c]); setPlpVisible(8); }}
                                className={`color-swatch w-8 h-8 rounded-full border-2 transition relative ${on ? 'color-swatch--active border-apple-blue ring-2 ring-apple-blue/40 dark:ring-[#13ABC4]/50 dark:border-[#13ABC4]' : 'border-primary-300 dark:border-white/70'}`}
                                style={{ ["--swatch-color"]: hex || "#888", backgroundColor: hex || "#888" }}>
                                {c === 'سفید' || c === 'کرم' ? <span className="absolute inset-0 rounded-full border border-primary-300 dark:border-white/50" /> : null}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      {/* سایز */}
                      <div>
                        <p className="text-xs font-bold text-primary-500 dark:!text-white mb-2">سایز</p>
                        <div className="flex flex-wrap gap-1.5">
                          {allSizesSafe.map(s => {
                            const on = plpSizesSafe.includes(s);
                            return (
                              <button key={s} type="button" onClick={() => { setPlpSizes(prev => on ? prev.filter(x => x !== s) : [...prev, s]); setPlpVisible(8); }}
                                className={`latin-label min-w-[2.25rem] px-2 py-1.5 rounded-lg text-xs font-medium border transition ${on ? 'bg-primary-800 text-white border-primary-800 dark:bg-[#13ABC4] dark:!text-white' : 'border-primary-200 dark:border-white/30 text-primary-800 dark:text-white bg-primary-50 dark:bg-primary-900'}`}>{s}</button>
                            );
                          })}
                        </div>
                      </div>
                      {/* جنس پارچه */}
                      <div>
                        <p className="text-xs font-bold text-primary-500 dark:!text-white mb-2">جنس پارچه</p>
                        <div className="space-y-1.5">
                          {allFabricsSafe.map(f => {
                            const on = plpFabricsSafe.includes(f);
                            const cnt = productsSafe.filter(p => p.fabric === f).length;
                            return (
                              <button key={f} type="button" onClick={() => { setPlpFabrics(prev => on ? prev.filter(x => x !== f) : [...prev, f]); setPlpVisible(8); }}
                                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition border ${on ? 'bg-primary-100 dark:bg-[#13ABC4]/20 border-primary-300 dark:border-[#13ABC4] text-primary-900 dark:text-[#13ABC4] font-medium' : 'border-transparent text-primary-700 dark:text-white/80 hover:bg-primary-50 dark:hover:bg-primary-800/50'}`}>
                                <span>{f}</span>
                                <span className="text-primary-400 dark:!text-white">{toFa(cnt)}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      {/* تخفیف */}
                      <div>
                        <p className="text-xs font-bold text-primary-500 dark:!text-white mb-2">تخفیف</p>
                        <div className="flex flex-wrap gap-1.5">
                          <button type="button" onClick={() => { setPlpDiscountOnly(v => !v); setPlpVisible(8); }}
                            className={`px-2.5 py-1.5 rounded-lg text-xs border transition ${plpDiscountOnly ? 'plp-chip--on bg-[#FF0000] dark:bg-[#13ABC4] !text-white border-[#FF0000] dark:border-[#13ABC4] font-bold shadow-sm' : 'plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium'}`}>فقط تخفیف‌دار</button>
                          {[10, 20, 25].map(d => (
                            <button key={d} type="button" onClick={() => { setPlpMinDiscount(plpMinDiscount === d ? 0 : d); setPlpVisible(8); }}
                              className={`px-2.5 py-1.5 rounded-lg text-xs border ${plpMinDiscount === d ? 'plp-chip--on bg-[#FF0000] dark:bg-[#13ABC4] !text-white border-[#FF0000] dark:border-[#13ABC4] font-bold' : 'plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium'}`}>{toFa(d)}٪+</button>
                          ))}
                        </div>
                      </div>
                      {/* موجودی و ارسال */}
                      <div>
                        <p className="text-xs font-bold text-primary-500 dark:!text-white mb-2">موجودی و ارسال</p>
                        <div className="space-y-1.5">
                          <button type="button" onClick={() => { setPlpInStockOnly(v => !v); setPlpVisible(8); }}
                            className={`w-full px-2.5 py-2 rounded-lg text-xs border text-right font-medium transition ${plpInStockOnly ? 'plp-toggle-on bg-[#FF0000] !border-[#FF0000] !text-white dark:!bg-[#13ABC4] dark:!border-[#13ABC4] dark:!text-white' : 'plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30]'}`}>فقط موجود</button>
                          <button type="button" onClick={() => { setPlpFastShipOnly(v => !v); setPlpVisible(8); }}
                            className={`w-full px-2.5 py-2 rounded-lg text-xs border text-right font-medium transition ${plpFastShipOnly ? 'plp-toggle-on bg-[#FF0000] !border-[#FF0000] !text-white dark:!bg-[#13ABC4] dark:!border-[#13ABC4] dark:!text-white' : 'plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30]'}`}>ارسال سریع</button>
                        </div>
                      </div>
                      {/* مرتب‌سازی */}
                      <div>
                        <p className="text-xs font-bold text-primary-500 dark:!text-white mb-2">مرتب‌سازی</p>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { id: 'popular', label: 'پرفروش' },
                            { id: 'newest', label: 'جدیدترین' },
                            { id: 'price-asc', label: 'ارزان' },
                            { id: 'price-desc', label: 'گران' },
                            { id: 'discount', label: 'تخفیف' },
                            { id: 'rating', label: 'امتیاز' },
                          ].map(s => (
                            <button key={s.id} type="button" onClick={() => { setPlpSort(plpSort === s.id ? '' : s.id); setPlpVisible(8); }}
                              className={`px-2.5 py-1.5 rounded-lg text-xs border ${plpSort === s.id ? 'plp-chip--on bg-[#FF0000] dark:bg-[#13ABC4] !text-white border-[#FF0000] dark:border-[#13ABC4] font-bold' : 'plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium'}`}>{s.label}</button>
                          ))}
                        </div>
                      </div>
                    </aside>
                  )}

                  {/* گرید / لیست محصولات */}
                  <div className="flex-1 min-w-0">
                    {plpSkeleton ? (
                      <div className={`grid gap-3 sm:gap-4 ${plpView === 'grid' ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} className="rounded-2xl bg-white dark:bg-primary-900 border border-primary-100 dark:border-white/10 overflow-hidden animate-pulse">
                            <div className="aspect-[4/5] bg-primary-100 dark:bg-primary-800" />
                            <div className="p-3 space-y-2">
                              <div className="h-3 bg-primary-100 dark:bg-primary-800 rounded w-3/4" />
                              <div className="h-3 bg-primary-100 dark:bg-primary-800 rounded w-1/2" />
                              <div className="h-3 bg-primary-100 dark:bg-primary-800 rounded w-1/3" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : plpFilteredSafe.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="font-medium text-primary-800 dark:text-white mb-2">محصولی با این فیلتر یافت نشد</p>
                        <p className="text-xs text-primary-500 dark:!text-white mb-4">فیلترها را کم کنید یا این پیشنهادها را ببینید</p>
                        {plpEmptyHintsSafe.length > 0 && (
                          <div className="flex flex-wrap justify-center gap-2 mb-4">
                            {plpEmptyHintsSafe.map(ch => (
                              <button key={ch.key} type="button" onClick={() => { ch.clear(); setPlpVisible(8); }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium bg-white dark:bg-primary-900">
                                حذف «{ch.label}»
                              </button>
                            ))}
                          </div>
                        )}
                        <p className="text-sm text-primary-500 dark:text-white/70 mb-3">با فیلترهای فعلی نتیجه‌ای پیدا نشد. فیلترها را کم کنید یا پاک کنید.</p>
                        <button type="button" onClick={clearPlpFilters} className="text-sm text-apple-blue dark:text-[#13ABC4] underline mb-6">پاک کردن فیلترها</button>
                        <h2 className="text-sm font-bold text-primary-900 dark:text-white mb-3">شاید این‌ها را بپسندید</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {productsSafe.slice(0, 4).map(p => (
                            <div key={p.id} className="min-w-0">{renderProductCard(p, 'plp-sugg-', { grid: true })}</div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        {plpView === 'grid' ? (
                          <VirtualProductGrid
                            items={plpVisibleProductsSafe}
                            columns={plpSidebarOpen ? 3 : 4}
                            rowHeight={380}
                            gap={16}
                            overscan={2}
                            className="w-full"
                            renderItem={(p) => (
                              <div className="min-w-0 h-full">{renderProductCard(p, 'plp-', { grid: true })}</div>
                            )}
                          />
                        ) : (
                        <div className="flex flex-col gap-3">
                          {plpVisibleProductsSafe.map(p => (
                              <div key={p.id} className="flex gap-3 bg-white dark:bg-black rounded-xl border border-primary-100 dark:border-white/15 p-3 hover:shadow-md transition">
                                <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-primary-50 dark:bg-primary-950">
                                  <img src={p.colors?.[0]?.image} alt="" className="w-full h-full object-cover" />
                                  {p.discount ? (
                                    <span className="absolute top-1 right-1 bg-apple-blue text-white text-xs font-bold px-1.5 py-0.5 rounded text-right">{toFa(p.discount)}٪</span>
                                  ) : null}
                                  {p.amazing && (
                                    <span className="absolute bottom-1 right-1 bg-amber-500 text-white text-xs font-medium px-1 py-0.5 rounded text-right">شگفت‌انگیز</span>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1 flex flex-col">
                                  <p className="font-bold text-sm text-primary-900 dark:text-white line-clamp-2">{p.name}</p>
                                  <p className="text-xs text-primary-500 dark:!text-white mt-0.5">فروشنده: {p.seller?.name || '—'} · {p.fabric || ''}</p>
                                  <div className="flex items-center gap-1 mt-1">
                                    {[1,2,3,4,5].map(n => (
                                      <Icon key={n} name={n <= Math.round(p.rating || 0) ? 'starFilled' : 'star'} size={14} className={n <= Math.round(p.rating || 0) ? 'text-amber-400' : 'text-primary-200 dark:text-primary-600'} />
                                    ))}
                                    <span className="text-xs text-primary-500 dark:!text-white">({toFa(p.reviews || 0)})</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-2 mt-auto pt-2">
                                    <div>
                                      <p className="text-sm font-bold text-primary-900 dark:text-white">{p.priceText} <span className="text-xs font-normal text-primary-500">تومان</span></p>
                                      {p.oldPrice && <p className="text-xs text-primary-400 line-through">{p.oldPrice}</p>}
                                    </div>
                                    <div className="flex gap-1.5">
                                      <button type="button" onClick={() => openQuickAdd(p)} className="px-3 py-1.5 rounded-full bg-apple-blue text-white text-xs font-medium">افزودن</button>
                                      <button type="button" onClick={() => openPDP(p)} className="px-3 py-1.5 rounded-full border border-primary-200 dark:border-white/25 text-xs text-primary-800 dark:text-white">جزئیات</button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                          ))}
                        </div>
                        )}
                                                {plpHasMoreSafe && (
                          <div ref={plpSentinelRef} className="py-8 flex justify-center">
                            <div className="w-6 h-6 border-2 border-primary-300 border-t-apple-blue rounded-full animate-spin" />
                          </div>
                        )}
                        {!plpHasMoreSafe && plpFilteredSafe.length > 8 && (
                          <p className="text-center text-xs text-primary-400 dark:!text-white py-6">همه {toFa(plpFilteredSafe.length)} محصول نمایش داده شد</p>
                        )}
                      </>
                    )}

                    {/* توضیح SEO انتهای صفحه — قبل از فوتر */}
                    {plpSeoFooterHtmlSafe && (
                      <section className="mt-10 mb-6 p-5 sm:p-6 rounded-2xl border border-primary-100 dark:border-white/10 bg-white dark:bg-primary-900">
                        <h2 className="text-sm font-bold text-primary-900 dark:text-white mb-2">
                          {activePlpTagSafe ? `درباره برچسب ${activePlpTagSafe.name}` : activePlpCategorySafe ? `درباره دسته ${activePlpCategorySafe.name}` : 'درباره فروشگاه'}
                        </h2>
                        {(/<[a-z][\s\S]*>/i.test(plpSeoFooterHtmlSafe || '')) ? (
                          <div className="text-sm text-primary-600 dark:text-white/70 leading-7 prose prose-sm dark:prose- max-w-none" dangerouslySetInnerHTML={{ __html: plpSeoFooterHtmlSafe }} />
                        ) : (
                          <p className="text-sm text-primary-600 dark:text-white/70 leading-7 whitespace-pre-line">{plpSeoFooterHtmlSafe}</p>
                        )}
                        {activePlpTagSafe && (
                          <p className="text-xs text-primary-400 mt-3">این صفحه برچسب است و برای موتورهای جستجو ایندکس نمی‌شود.</p>
                        )}
                      </section>
                    )}
                  </div>
                </div>
              </div>

              {/* Sticky bottom bar موبایل — فیلتر راست، پاکسازی چپ (RTL) */}
              <div className="plp-mobile-bottom-bar fixed bottom-0 inset-x-0 z-40 sm:hidden bg-white/95 dark:bg-primary-950/95 backdrop-blur-xl border-t border-primary-100 dark:border-white/15 px-3 py-2.5 flex gap-2 safe-pb safe-area-pb">
                <button type="button" onClick={() => { setPlpFilterTab('price'); setPlpFilterOpen(true); }} className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-medium border ${plpActiveChipsSafe.length ? 'bg-primary-800 text-white border-primary-800 dark:bg-[#13ABC4] dark:!text-white dark:border-[#13ABC4]' : 'bg-primary-800 text-white border-primary-800 dark:bg-primary-800 dark:text-white dark:border-primary-800'}`}>
                  <Icon name="sliders" size={14} /> فیلتر
                  {plpActiveChipsSafe.length > 0 && <span className="w-4 h-4 rounded-full bg-white/25 text-xs flex items-center justify-center">{toFa(plpActiveChipsSafe.length)}</span>}
                </button>
                <button type="button" onClick={() => setPlpSortOpen(true)} className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-medium border bg-primary-50 dark:bg-primary-900 border-primary-200 dark:border-white/30 text-primary-800 dark:text-white">
                  مرتب‌سازی
                </button>
                {plpActiveChipsSafe.length > 0 && (
                  <button type="button" onClick={() => { plpActiveChipsSafe.forEach(ch => ch.clear()); setPlpVisible(8); }} className="flex-shrink-0 px-3 py-2.5 rounded-full text-xs font-medium border plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium bg-white dark:bg-primary-900">
                    پاکسازی
                  </button>
                )}
              </div>

              {/* باتم‌شیت فیلتر موبایل — تب‌بندی‌شده */}
              {plpFilterOpen && (
                <div className="fixed inset-0 z-[90] sm:hidden plp-mobile-filters">
                  <div className="site-modal-backdrop" onClick={() => setPlpFilterOpen(false)} />
                  <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-black rounded-t-2xl max-h-[85vh] flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-primary-100 dark:border-white/15">
                      <h3 className="text-sm font-bold text-primary-900 dark:text-white">فیلتر محصولات</h3>
                      <button type="button" onClick={() => setPlpFilterOpen(false)}><Icon name="x" size={18} className="text-primary-700 dark:text-white" /></button>
                    </div>
                    {/* تب‌ها */}
                    <div className="flex border-b border-primary-100 dark:border-white/10 px-2 gap-1 overflow-x-auto">
                      {[

                        { id: 'price', label: 'قیمت' },
                        { id: 'color', label: 'رنگ و سایز' },
                        { id: 'more', label: 'سایر' },
                      ].map(t => (
                        <button key={t.id} type="button" onClick={() => setPlpFilterTab(t.id)}
                          className={`flex-shrink-0 px-3 py-2.5 text-xs font-medium border-b-2 transition ${plpFilterTab === t.id ? 'border-apple-blue text-apple-blue dark:border-[#13ABC4] dark:text-[#13ABC4]' : 'border-transparent text-primary-500 dark:!text-white'}`}>{t.label}</button>
                      ))}
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                      {plpFilterTab === 'price' && (
                        <div className="space-y-3">
                          <div className="flex flex-col gap-2">
                            <label className="text-xs text-primary-500 dark:!text-white">از (تومان)</label>
                            <input type="number" inputMode="numeric" placeholder="مثلاً ۷۵۰۰۰۰" value={plpPriceMin} onChange={e => setPlpPriceMin(e.target.value)} className="w-full px-4 py-2.5 rounded-full border border-primary-200 dark:border-white/30 bg-primary-50 dark:bg-primary-900 text-sm text-primary-900 dark:text-white" />
                            <label className="text-xs text-primary-500 dark:!text-white">تا (تومان)</label>
                            <input type="number" inputMode="numeric" placeholder="مثلاً ۹۹۹۰۰۰" value={plpPriceMax} onChange={e => setPlpPriceMax(e.target.value)} className="w-full px-4 py-2.5 rounded-full border border-primary-200 dark:border-white/30 bg-primary-50 dark:bg-primary-900 text-sm text-primary-900 dark:text-white" />
                          </div>
                          <p className="text-xs text-primary-400">محدوده موجود: {formatPrice(plpPriceBoundsSafe.min)} – {formatPrice(plpPriceBoundsSafe.max)}</p>
                          <input type="range" min={plpPriceBoundsSafe.min} max={plpPriceBoundsSafe.max} step={10000}
                            value={plpPriceMax !== '' ? Number(plpPriceMax) : plpPriceBoundsSafe.max}
                            onChange={e => setPlpPriceMax(String(e.target.value))}
                            className="w-full accent-apple-blue" />
                        </div>
                      )}
                      {plpFilterTab === 'color' && (
                        <>
                          <div>
                            <p className="text-xs font-bold text-primary-500 mb-2">رنگ</p>
                            <div className="flex flex-wrap gap-2">
                              {allColorsSafe.map(c => {
                                const on = plpColorsSafe.includes(c);
                                const hex = colorHexMapSafe[c] || '#888';
                                return (
                                  <button key={c} type="button" onClick={() => setPlpColors(prev => on ? prev.filter(x => x !== c) : [...prev, c])}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs border ${on ? 'bg-primary-800 text-white border-primary-800 dark:bg-[#13ABC4] dark:!text-white dark:border-[#13ABC4]' : 'plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium'}`}>
                                    <span className="color-swatch w-3.5 h-3.5 rounded-full border border-black/20 dark:border-white/60" style={{ ["--swatch-color"]: hex || '#888', backgroundColor: hex || '#888' }} />
                                    {c}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-primary-500 mb-2">سایز</p>
                            <div className="flex flex-wrap gap-1.5">
                              {allSizesSafe.map(s => (
                                <button key={s} type="button" onClick={() => setPlpSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                                  className={`latin-label min-w-[2.75rem] px-3 py-2 rounded-full text-xs font-bold border ${plpSizesSafe.includes(s) ? 'bg-primary-800 text-white border-primary-800 dark:bg-[#13ABC4] dark:!text-white dark:border-[#13ABC4]' : 'border-primary-200 dark:border-white/30 text-primary-800 dark:text-white bg-primary-50 dark:bg-primary-900'}`} style={{ fontFamily: 'system-ui, -apple-system, Arial, sans-serif' }}>{s}</button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                      {plpFilterTab === 'more' && (
                        <>
                          <div>
                            <p className="text-xs font-bold text-primary-500 mb-2">جنس پارچه</p>
                            <div className="flex flex-wrap gap-1.5">
                              {allFabricsSafe.map(f => (
                                <button key={f} type="button" onClick={() => setPlpFabrics(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])}
                                  className={`px-3 py-1.5 rounded-full text-xs border ${plpFabricsSafe.includes(f) ? 'bg-primary-800 text-white border-primary-800 dark:bg-[#13ABC4] dark:!text-white dark:border-[#13ABC4]' : 'plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium'}`}>{f}</button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-primary-500 mb-2">فروشنده</p>
                            <div className="flex flex-wrap gap-1.5">
                              {allSellerNamesSafe.map(s => (
                                <button key={s} type="button" onClick={() => setPlpSellers(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                                  className={`px-3 py-1.5 rounded-full text-xs border ${plpSellersSafe.includes(s) ? 'bg-primary-800 text-white border-primary-800 dark:bg-[#13ABC4] dark:!text-white dark:border-[#13ABC4]' : 'plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium'}`}>{s}</button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-primary-500 mb-2">تخفیف</p>
                            <div className="flex flex-wrap gap-1.5">
                              <button type="button" onClick={() => setPlpDiscountOnly(v => !v)} className={`px-3 py-1.5 rounded-full text-xs border ${plpDiscountOnly ? 'plp-chip--on bg-[#FF0000] dark:bg-[#13ABC4] !text-white border-[#FF0000] dark:border-[#13ABC4] font-bold' : 'plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium'}`}>فقط تخفیف‌دار</button>
                              {[10, 20, 25].map(d => (
                                <button key={d} type="button" onClick={() => setPlpMinDiscount(plpMinDiscount === d ? 0 : d)} className={`px-3 py-1.5 rounded-full text-xs border ${plpMinDiscount === d ? 'plp-chip--on bg-[#FF0000] dark:bg-[#13ABC4] !text-white border-[#FF0000] dark:border-[#13ABC4] font-bold' : 'plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium'}`}>{toFa(d)}٪+</button>
                              ))}
                            </div>
                          </div>
                          <button type="button" onClick={() => setPlpInStockOnly(v => !v)} className={`px-3 py-1.5 rounded-full text-xs border font-medium transition ${plpInStockOnly ? 'plp-toggle-on bg-[#FF0000] !border-[#FF0000] !text-white dark:!bg-[#13ABC4] dark:!border-[#13ABC4] dark:!text-white' : 'plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30]'}`}>فقط موجود</button>
                          <button type="button" onClick={() => setPlpFastShipOnly(v => !v)} className={`px-3 py-1.5 rounded-full text-xs border font-medium transition ${plpFastShipOnly ? 'plp-toggle-on bg-[#FF0000] !border-[#FF0000] !text-white dark:!bg-[#13ABC4] dark:!border-[#13ABC4] dark:!text-white' : 'plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30]'}`}>ارسال سریع</button>
                          <p className="text-xs font-bold text-primary-500 mb-2 mt-3 w-full">مرتب‌سازی</p>
                          <div className="flex flex-wrap gap-1.5 w-full">
                            {[
                              { id: 'popular', label: 'پرفروش' },
                              { id: 'newest', label: 'جدیدترین' },
                              { id: 'price-asc', label: 'ارزان' },
                              { id: 'price-desc', label: 'گران' },
                              { id: 'discount', label: 'تخفیف' },
                              { id: 'rating', label: 'امتیاز' },
                            ].map(s => (
                              <button key={s.id} type="button" onClick={() => setPlpSort(plpSort === s.id ? '' : s.id)} className={`px-3 py-1.5 rounded-full text-xs border ${plpSort === s.id ? 'plp-chip--on bg-[#FF0000] dark:bg-[#13ABC4] !text-white border-[#FF0000] dark:border-[#13ABC4] font-bold' : 'plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium'}`}>{s.label}</button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2 px-4 py-3 border-t border-primary-100 dark:border-white/15">
                      <button type="button" onClick={() => { clearPlpFilters(); }} className="flex-1 py-2.5 rounded-full text-sm border border-primary-200 dark:border-white/30 text-primary-800 dark:text-white">پاک کردن</button>
                      <button type="button" onClick={() => { setPlpFilterOpen(false); setPlpVisible(8); }} className="flex-1 py-2.5 rounded-full text-sm bg-apple-blue text-white">اعمال ({toFa(plpFilteredSafe.length)})</button>
                    </div>
                  </div>
                </div>
              )}

              {/* شیت مرتب‌سازی موبایل */}
              {plpSortOpen && (
                <div className="fixed inset-0 z-[90] sm:hidden">
                  <div className="site-modal-backdrop" onClick={() => setPlpSortOpen(false)} />
                  <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-primary-900 rounded-t-2xl p-4">
                    <h3 className="text-sm font-bold text-primary-900 dark:text-white mb-3">مرتب‌سازی</h3>
                    {[
                      { id: 'popular', label: 'پرفروش' },
                      { id: 'newest', label: 'جدیدترین' },
                      { id: 'price-asc', label: 'ارزان‌ترین' },
                      { id: 'price-desc', label: 'گران‌ترین' },
                      { id: 'discount', label: 'بیشترین تخفیف' },
                      { id: 'rating', label: 'بیشترین امتیاز' },
                    ].map(s => (
                      <button key={s.id} type="button" onClick={() => { setPlpSort(s.id); setPlpSortOpen(false); }}
                        className={`w-full text-right px-3 py-3 rounded-xl text-sm mb-1 ${plpSort === s.id ? 'plp-chip--on bg-[#FF0000] dark:bg-[#13ABC4] !text-white font-bold' : 'text-primary-700 dark:!text-white/80 hover:bg-primary-50 dark:hover:bg-primary-900'}`}>{s.label}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================== SELLER DETAIL PAGE (SDP) ===================== */}
    </>
  );
}
