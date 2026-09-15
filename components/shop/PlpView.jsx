'use client';

import { useEffect } from 'react';
import { useAppApi } from '../AppApiContext';
import dynamic from 'next/dynamic';
import PlpPriceMini from './PlpPriceMini';

const VirtualProductGrid = dynamic(() => import('../VirtualProductGrid'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[120px] flex items-center justify-center" role="status">
      <span className="text-sm text-primary-500 animate-pulse">در حال بارگذاری…</span>
    </div>
  ),
});

const SORT_OPTIONS = [
  { id: 'popular', label: 'پرفروش' },
  { id: 'newest', label: 'جدیدترین' },
  { id: 'price-asc', label: 'ارزان‌ترین' },
  { id: 'price-desc', label: 'گران‌ترین' },
  { id: 'discount', label: 'بیشترین تخفیف' },
  { id: 'rating', label: 'بیشترین امتیاز' },
];

function chipOn(active) {
  return active
    ? 'bg-[#023047] bg-[#13ABC4] !text-white border-[#023047] border-[#13ABC4] font-bold'
    : 'border-primary-200 border-white/20 !text-primary-800 !text-white bg-white bg-[#2A2C30] font-medium hover:border-primary-400 hover:border-white/40';
}

/** PlpView — ظاهر مدرن، منطق فیلتر/مرتب‌سازی/گرید بدون تغییر */
export default function PlpView() {
  const {
    allColors,
    allFabrics,
    allSellerNames,
    allSizes,
    colorHexMap,
    Icon,
    activeSellerId,
    clearPlpFilters,
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
    renderProductCard,
    setPlpColors,
    setPlpDiscountOnly,
    setPlpFabrics,
    plpAttrs,
    setPlpAttrs,
    plpMinSellerRating,
    setPlpMinSellerRating,
    adminCatalogAttributes,
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
    toFa,
  } = useAppApi();

  const plpFilteredSafe = Array.isArray(plpFiltered) ? plpFiltered : [];
  const plpActiveChipsSafe = Array.isArray(plpActiveChips) ? plpActiveChips : [];
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
  const plpPriceBoundsSafe =
    plpPriceBounds && typeof plpPriceBounds === 'object'
      ? {
          min: Number.isFinite(plpPriceBounds.min) ? plpPriceBounds.min : 0,
          max: Number.isFinite(plpPriceBounds.max) ? plpPriceBounds.max : 0,
        }
      : { min: 0, max: 0 };
  const priceRangeValid = plpPriceBoundsSafe.max > plpPriceBoundsSafe.min && plpPriceBoundsSafe.max > 0;
  const plpH1Safe = plpH1 || 'فروشگاه';
  const plpSeoFooterHtmlSafe = plpSeoFooterHtml || '';
  const plpColorsSafe = Array.isArray(plpColors) ? plpColors : [];
  const plpFabricsSafe = Array.isArray(plpFabrics) ? plpFabrics : [];
  const plpAttrsSafe = plpAttrs && typeof plpAttrs === 'object' ? plpAttrs : {};
  const adminCatalogAttributesSafe = Array.isArray(adminCatalogAttributes) ? adminCatalogAttributes : [];
  const plpMinSellerRatingSafe = Number(plpMinSellerRating) || 0;
  const plpSellersSafe = Array.isArray(plpSellers) ? plpSellers : [];
  const plpSizesSafe = Array.isArray(plpSizes) ? plpSizes : [];

  useEffect(() => {
    if (!showPLP) return;
    const toTop = () => {
      try {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      } catch (_) {
        try {
          window.scrollTo(0, 0);
        } catch (__) {}
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

  if (
    !showPLP ||
    activeSellerId ||
    showSellersList ||
    showTaxonomyHub ||
    pdpProduct ||
    showCartPage ||
    showWishlistPage ||
    showRecentPage ||
    showComparePage ||
    showProfilePage ||
    showSellerPanel ||
    showAdminPanel ||
    staticPage
  ) {
    return null;
  }

  const emptyState = !plpSkeleton && plpFilteredSafe.length === 0;

  return (
    <>
      <div className="flex-1 flex flex-col bg-[#F7F7F8] bg-primary-950 pb-20 sm:pb-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6 w-full flex-1">
          {/* هدر صفحه */}
          {(activePlpCategorySafe?.image || activePlpTagSafe?.image) && (
            <div className="mb-4 rounded-2xl overflow-hidden border border-primary-100/80 border-white/10 relative h-32 sm:h-44">
              <img
                src={activePlpTagSafe?.image || activePlpCategorySafe?.image}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
              <div className="absolute bottom-3 right-3 left-3">
                <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow">{plpH1Safe}</h1>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 mb-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                {!(activePlpCategorySafe?.image || activePlpTagSafe?.image) && (
                  <h1 className="text-xl sm:text-2xl font-bold text-primary-900 text-white tracking-tight">
                    {plpH1Safe}
                  </h1>
                )}
                <p className="text-xs sm:text-sm text-primary-500 text-white/55 mt-1">
                  {plpSkeleton ? 'در حال بارگذاری…' : (
                    <>
                      <span className="font-semibold text-primary-800 text-white/80">{toFa(plpFilteredSafe.length)}</span>
                      {' '}محصول
                      {plpActiveChipsSafe.length > 0 ? ` · ${toFa(plpActiveChipsSafe.length)} فیلتر فعال` : ''}
                    </>
                  )}
                </p>
              </div>

              {/* ابزار دسکتاپ: مرتب‌سازی + نمای گرید */}
              <div className="hidden sm:flex items-center gap-2 flex-wrap justify-end">
                <div className="flex items-center gap-1 p-1 rounded-xl bg-white bg-primary-900 border border-primary-100 border-white/10 shadow-sm">
                  {SORT_OPTIONS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setPlpSort(plpSort === s.id ? '' : s.id);
                        setPlpVisible(8);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs transition ${
                        plpSort === s.id
                          ? 'bg-[#023047] bg-[#13ABC4] text-white font-bold'
                          : 'text-primary-600 text-white/70 hover:bg-primary-50 hover:bg-white/5'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center rounded-xl border border-primary-100 border-white/10 bg-white bg-primary-900 overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => setPlpViewPersist('grid')}
                    className={`px-3 py-2 text-xs ${plpView === 'grid' ? 'bg-primary-100 bg-white/10 font-bold text-primary-900 text-white' : 'text-primary-500'}`}
                    title="نمای شبکه‌ای"
                  >
                    <Icon name="grid" size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlpViewPersist('list')}
                    className={`px-3 py-2 text-xs ${plpView === 'list' ? 'bg-primary-100 bg-white/10 font-bold text-primary-900 text-white' : 'text-primary-500'}`}
                    title="نمای لیستی"
                  >
                    <Icon name="list" size={16} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setPlpSidebarOpen((v) => !v)}
                  className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border border-primary-200 border-white/20 bg-white bg-primary-900 text-primary-800 text-white shadow-sm"
                >
                  <Icon name="sliders" size={14} />
                  {plpSidebarOpen ? 'مخفی فیلتر' : 'فیلترها'}
                </button>
              </div>
            </div>

            {/* چیپ فیلترهای فعال */}
            {plpActiveChipsSafe.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {plpActiveChipsSafe.map((ch) => (
                  <button
                    key={ch.key || ch.label}
                    type="button"
                    onClick={() => {
                      try {
                        ch.clear?.();
                      } catch (_) {}
                      setPlpVisible(8);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-white bg-primary-900 border border-primary-200 border-white/20 text-primary-800 text-white shadow-sm"
                  >
                    <span>{ch.label}</span>
                    <Icon name="x" size={12} className="opacity-60" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearPlpFilters}
                  className="text-[11px] text-apple-blue text-[#13ABC4] underline px-1"
                >
                  پاک کردن همه
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-4 lg:gap-6 items-start">
            {/* سایدبار دسکتاپ */}
            {plpSidebarOpen && (
              <aside className="hidden lg:flex w-[260px] flex-shrink-0 flex-col gap-4 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-primary-100 border-white/10 bg-white bg-primary-900 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-primary-900 text-white">فیلترها</p>
                  {plpActiveChipsSafe.length > 0 && (
                    <button type="button" onClick={clearPlpFilters} className="text-[11px] text-apple-blue text-[#13ABC4]">
                      پاک کردن همه
                    </button>
                  )}
                </div>

                {/* ۱. دسته‌بندی پیراهن — فعلاً از طریق منو و چیپ‌ها */}
                {/* ۲. سایز */}
                {allSizesSafe.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-primary-500 text-white/55 mb-2">سایز</p>
                    <div className="flex flex-wrap gap-1.5">
                      {allSizesSafe.map((s) => {
                        const name = typeof s === 'string' ? s : s.name;
                        const on = plpSizesSafe.includes(name);
                        return (
                          <button
                            key={name}
                            type="button"
                            onClick={() => {
                              setPlpSizes((prev) =>
                                (prev || []).includes(name) ? prev.filter((x) => x !== name) : [...(prev || []), name],
                              );
                              setPlpVisible(8);
                            }}
                            className={`min-w-[2.25rem] px-2 py-1 rounded-lg text-xs border ${chipOn(on)}`}
                          >
                            {name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ۳. قیمت */}
                {priceRangeValid && (
                  <div>
                    <p className="text-[11px] font-bold text-primary-500 text-white/55 mb-2">قیمت (تومان)</p>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder={String(plpPriceBoundsSafe.min)}
                        value={plpPriceMin}
                        onChange={(e) => setPlpPriceMin(e.target.value)}
                        className="w-full rounded-lg border border-primary-200 border-white/15 bg-primary-50 bg-primary-950 px-2 py-1.5 text-xs"
                      />
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder={String(plpPriceBoundsSafe.max)}
                        value={plpPriceMax}
                        onChange={(e) => setPlpPriceMax(e.target.value)}
                        className="w-full rounded-lg border border-primary-200 border-white/15 bg-primary-50 bg-primary-950 px-2 py-1.5 text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* ۴. رنگ */}
                {allColorsSafe.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-primary-500 text-white/55 mb-2">رنگ</p>
                    <div className="flex flex-wrap gap-1.5">
                      {allColorsSafe.map((c) => {
                        const name = typeof c === 'string' ? c : c.name;
                        const hex = typeof c === 'string' ? colorHexMapSafe[c] : c.hex || colorHexMapSafe[name];
                        const on = plpColorsSafe.includes(name);
                        return (
                          <button
                            key={name}
                            type="button"
                            title={name}
                            onClick={() => {
                              setPlpColors((prev) =>
                                (prev || []).includes(name) ? prev.filter((x) => x !== name) : [...(prev || []), name],
                              );
                              setPlpVisible(8);
                            }}
                            className={`w-7 h-7 rounded-full border-2 transition ${on ? 'border-[#023047] border-[#13ABC4] scale-110' : 'border-primary-200 border-white/20'}`}
                            style={{ background: hex || '#ccc' }}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ۵. برند — فعلاً از طریق چیپ و صفحات برند */}
                {/* ۶. جنس پارچه */}
                {allFabricsSafe.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-primary-500 text-white/55 mb-2">جنس پارچه</p>
                    <div className="flex flex-wrap gap-1.5">
                      {allFabricsSafe.map((f) => {
                        const name = typeof f === 'string' ? f : f.name;
                        const on = plpFabricsSafe.includes(name);
                        return (
                          <button
                            key={name}
                            type="button"
                            onClick={() => {
                              setPlpFabrics((prev) =>
                                (prev || []).includes(name) ? prev.filter((x) => x !== name) : [...(prev || []), name],
                              );
                              setPlpVisible(8);
                            }}
                            className={`px-2 py-1 rounded-lg text-xs border ${chipOn(on)}`}
                          >
                            {name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* وضعیت محصول */}
                <div>
                  <p className="text-[11px] font-bold text-primary-500 text-white/55 mb-2">وضعیت محصول</p>
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setPlpInStockOnly((v) => !v);
                        setPlpVisible(8);
                      }}
                      className={`px-3 py-2 rounded-lg text-xs border text-right ${chipOn(!!plpInStockOnly)}`}
                    >
                      فقط موجود
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPlpDiscountOnly((v) => !v);
                        setPlpVisible(8);
                      }}
                      className={`px-3 py-2 rounded-lg text-xs border text-right ${chipOn(!!plpDiscountOnly)}`}
                    >
                      فقط تخفیف‌دار
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPlpFastShipOnly((v) => !v);
                        setPlpVisible(8);
                      }}
                      className={`px-3 py-2 rounded-lg text-xs border text-right ${chipOn(!!plpFastShipOnly)}`}
                    >
                      ارسال سریع
                    </button>
                  </div>
                </div>

                {plpDiscountOnly && (
                  <div>
                    <p className="text-[11px] font-bold text-primary-500 text-white/55 mb-2">حداقل تخفیف</p>
                    <input
                      type="range"
                      min={0}
                      max={70}
                      step={5}
                      value={Number(plpMinDiscount) || 0}
                      onChange={(e) => {
                        setPlpMinDiscount(Number(e.target.value) || 0);
                        setPlpVisible(8);
                      }}
                      className="w-full"
                    />
                    <p className="text-[11px] text-primary-600 text-white/60 mt-1">از {toFa(plpMinDiscount || 0)}٪</p>
                  </div>
                )}

                                {/* فیلترهای بیشتر — فاز ۳ */}
                <details className="group border-t border-primary-100 border-white/10 pt-3" open>
                  <summary className="flex items-center justify-between cursor-pointer list-none text-[11px] font-bold text-primary-500 text-white/55 select-none">
                    <span>فیلترهای بیشتر</span>
                    <span className="text-primary-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="mt-3 space-y-4">
                    {(adminCatalogAttributesSafe || [])
                      .filter((a) => a && a.active !== false && a.slug !== 'fabric')
                      .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0))
                      .map((attr) => {
                        const opts = Array.isArray(attr.options) && attr.options.length
                          ? attr.options
                          : (Array.isArray(attr.values) ? attr.values : []);
                        if (!opts.length) return null;
                        const key = attr.id || attr.slug || attr.name;
                        const selected = Array.isArray(plpAttrsSafe[key]) ? plpAttrsSafe[key] : [];
                        return (
                          <div key={key}>
                            <p className="text-[11px] font-bold text-primary-500 text-white/55 mb-1.5">{attr.name}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {opts.map((opt) => {
                                const on = selected.includes(opt);
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => {
                                      setPlpAttrs((prev) => {
                                        const cur = { ...(prev || {}) };
                                        const list = Array.isArray(cur[key]) ? [...cur[key]] : [];
                                        const idx = list.indexOf(opt);
                                        if (idx >= 0) list.splice(idx, 1);
                                        else list.push(opt);
                                        if (list.length) cur[key] = list;
                                        else delete cur[key];
                                        return cur;
                                      });
                                      setPlpVisible(8);
                                    }}
                                    className={`px-2 py-1 rounded-lg text-xs border ${chipOn(on)}`}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}

                    {/* فروشنده — حداقل امتیاز */}
                    <div>
                      <p className="text-[11px] font-bold text-primary-500 text-white/55 mb-1.5">حداقل امتیاز فروشنده</p>
                      <div className="flex flex-wrap gap-1.5">
                        {[0, 3, 3.5, 4, 4.5].map((r) => {
                          const on = plpMinSellerRatingSafe === r || (r === 0 && !plpMinSellerRatingSafe);
                          return (
                            <button
                              key={r}
                              type="button"
                              onClick={() => {
                                setPlpMinSellerRating(r);
                                setPlpVisible(8);
                              }}
                              className={`px-2 py-1 rounded-lg text-xs border ${chipOn(!!on)}`}
                            >
                              {r === 0 ? 'همه' : `≥ ${r}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>


                  </div>
                </details>
              </aside>
            )}

            {/* محتوای اصلی */}
            <div className="flex-1 min-w-0">
              {plpSkeleton ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4" role="status">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-2xl bg-white bg-primary-900 border border-primary-100 border-white/10 overflow-hidden animate-pulse">
                      <div className="aspect-[3/4] bg-primary-100 bg-primary-800" />
                      <div className="p-3 space-y-2">
                        <div className="h-3 bg-primary-100 bg-primary-800 rounded w-4/5" />
                        <div className="h-3 bg-primary-100 bg-primary-800 rounded w-2/5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : emptyState ? (
                <div className="rounded-2xl border border-dashed border-primary-200 border-white/15 bg-white bg-primary-900 px-6 py-14 text-center">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-primary-50 bg-primary-800 flex items-center justify-center mb-4">
                    <Icon name="search" size={22} className="text-primary-400" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-primary-900 text-white mb-1">محصولی پیدا نشد</h2>
                  <p className="text-sm text-primary-500 text-white/55 max-w-sm mx-auto mb-5">
                    {plpActiveChipsSafe.length > 0
                      ? 'با فیلترهای فعلی نتیجه‌ای نیست. یکی از فیلترها را بردارید یا همه را پاک کنید.'
                      : 'در این بخش هنوز محصولی ثبت نشده است. به‌زودی موجود می‌شود.'}
                  </p>
                  {plpEmptyHintsSafe.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {plpEmptyHintsSafe.slice(0, 4).map((h) => (
                        <button
                          key={h.key || h.label}
                          type="button"
                          onClick={() => {
                            try {
                              h.clear?.();
                            } catch (_) {}
                            setPlpVisible(8);
                          }}
                          className="px-3 py-1.5 rounded-full text-xs border border-primary-200 border-white/20 bg-primary-50 bg-primary-800 text-primary-800 text-white"
                        >
                          حذف «{h.label}»
                        </button>
                      ))}
                    </div>
                  )}
                  {plpActiveChipsSafe.length > 0 && (
                    <button
                      type="button"
                      onClick={clearPlpFilters}
                      className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-bold bg-[#023047] bg-[#13ABC4] text-white"
                    >
                      پاک کردن فیلترها
                    </button>
                  )}
                </div>
              ) : plpView === 'grid' ? (
                <>
                  <VirtualProductGrid
                    items={plpVisibleProductsSafe}
                    columns={plpSidebarOpen ? 3 : 4}
                    rowHeight={420}
                    gap={16}
                    overscan={2}
                    className="w-full"
                    renderItem={(p) => (
                      <div className="min-w-0 h-full flex flex-col">
                        <div className="flex-1 min-h-0">{renderProductCard(p, 'plp-', { grid: true })}</div>
                        <div className="px-1 pb-1">
                          <PlpPriceMini product={p} toFa={toFa} compact />
                        </div>
                      </div>
                    )}
                  />
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  {plpVisibleProductsSafe.map((p) => (
                    <div
                      key={p.id}
                      className="flex gap-3 bg-white bg-primary-900 rounded-2xl border border-primary-100 border-white/10 p-3 hover:shadow-md transition cursor-pointer"
                      onClick={() => {
                        try {
                          openPDP(p);
                        } catch (_) {}
                      }}
                    >
                      <div className="relative w-24 h-28 sm:w-32 sm:h-36 flex-shrink-0 rounded-xl overflow-hidden bg-primary-50 bg-primary-950">
                        <img
                          src={p.colors?.[0]?.image || p.cover_image || p.image}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                        {p.discount ? (
                          <span className="absolute top-1.5 right-1.5 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                            {toFa(p.discount)}٪
                          </span>
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1 flex flex-col">
                        <p className="font-bold text-sm text-primary-900 text-white line-clamp-2">{p.name}</p>
                        <p className="text-[11px] text-primary-500 text-white/55 mt-0.5">
                          {p.brand || p.brand_name || p.category_name || p.category || ''}
                          {p.seller?.name ? ` · ${p.seller.name}` : ''}
                        </p>
                        <div className="mt-auto pt-2 flex items-end justify-between gap-2">
                          <div>
                            <p className="text-sm font-black text-primary-900 text-white">
                              {formatPrice ? formatPrice(p.price) : toFa(Number(p.price || 0).toLocaleString('en-US'))}
                              <span className="text-[10px] font-medium text-primary-400 mr-1">تومان</span>
                            </p>
                            <PlpPriceMini product={p} toFa={toFa} compact />
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              try {
                                openQuickAdd?.(p);
                              } catch (_) {
                                openPDP(p);
                              }
                            }}
                            className="px-3 py-2 rounded-xl text-xs font-bold bg-[#023047] bg-[#13ABC4] text-white"
                          >
                            افزودن
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!emptyState && !plpSkeleton && plpHasMoreSafe && (
                <div ref={plpSentinelRef} className="py-8 flex justify-center">
                  <span className="text-xs text-primary-500 animate-pulse">در حال بارگذاری…</span>
                </div>
              )}
              {!emptyState && !plpSkeleton && !plpHasMoreSafe && plpFilteredSafe.length > 8 && (
                <p className="text-center text-xs text-primary-400 text-white/45 py-6">
                  همه {toFa(plpFilteredSafe.length)} محصول نمایش داده شد
                </p>
              )}

              {plpSeoFooterHtmlSafe && (
                <section className="mt-8 mb-4 p-5 sm:p-6 rounded-2xl border border-primary-100 border-white/10 bg-white bg-primary-900">
                  <h2 className="text-sm font-bold text-primary-900 text-white mb-2">
                    {activePlpTagSafe
                      ? `درباره برچسب ${activePlpTagSafe.name}`
                      : activePlpCategorySafe
                        ? `درباره دسته ${activePlpCategorySafe.name}`
                        : 'درباره فروشگاه'}
                  </h2>
                  {/<[a-z][\s\S]*>/i.test(plpSeoFooterHtmlSafe || '') ? (
                    <div
                      className="text-sm text-primary-600 text-white/70 leading-7 prose prose-sm prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: plpSeoFooterHtmlSafe }}
                    />
                  ) : (
                    <p className="text-sm text-primary-600 text-white/70 leading-7 whitespace-pre-line">
                      {plpSeoFooterHtmlSafe}
                    </p>
                  )}
                </section>
              )}
            </div>
          </div>
        </div>

        {/* نوار پایین موبایل */}
        <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-primary-100 border-white/10 bg-white/95 bg-primary-950/95 backdrop-blur-md px-3 py-2.5 safe-pb">
          <div className="flex gap-2 max-w-lg mx-auto">
            <button
              type="button"
              onClick={() => setPlpFilterOpen(true)}
              className="flex-1 min-h-[48px] rounded-xl border border-primary-200 border-white/20 bg-white bg-primary-900 text-sm font-bold text-primary-900 text-white inline-flex items-center justify-center gap-2 shadow-sm"
            >
              <Icon name="sliders" size={16} />
              فیلتر
              {plpActiveChipsSafe.length > 0 ? (
                <span className="min-w-[1.25rem] h-5 px-1 rounded-full bg-[#023047] bg-[#13ABC4] text-white text-[10px] flex items-center justify-center">
                  {toFa(plpActiveChipsSafe.length)}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => setPlpSortOpen(true)}
              className="flex-1 min-h-[48px] rounded-xl border border-primary-200 border-white/20 bg-white bg-primary-900 text-sm font-bold text-primary-900 text-white inline-flex items-center justify-center gap-2 shadow-sm"
            >
              <Icon name="arrowUpDown" size={16} />
              مرتب‌سازی
            </button>
          </div>
        </div>

        {/* شیت فیلتر موبایل */}
        {plpFilterOpen && (
          <div className="fixed inset-0 z-[90] sm:hidden plp-mobile-filters">
            <div className="site-modal-backdrop" onClick={() => setPlpFilterOpen(false)} />
            <div className="absolute bottom-0 left-0 right-0 bg-white bg-primary-950 rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-primary-100 border-white/10">
                <h3 className="text-sm font-bold text-primary-900 text-white">فیلتر محصولات</h3>
                <button type="button" onClick={() => setPlpFilterOpen(false)} aria-label="بستن">
                  <Icon name="x" size={18} className="text-primary-700 text-white" />
                </button>
              </div>
              <div className="flex border-b border-primary-100 border-white/10 px-2 gap-1 overflow-x-auto">
                {[
                  { id: 'price', label: 'قیمت' },
                  { id: 'color', label: 'رنگ و سایز' },
                  { id: 'more', label: 'وضعیت و بیشتر' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setPlpFilterTab(t.id)}
                    className={`flex-shrink-0 px-3 py-2.5 text-xs font-medium border-b-2 transition ${
                      plpFilterTab === t.id
                        ? 'border-apple-blue text-apple-blue border-[#13ABC4] text-[#13ABC4]'
                        : 'border-transparent text-primary-500 text-white/60'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {plpFilterTab === 'price' && priceRangeValid && (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="از"
                      value={plpPriceMin}
                      onChange={(e) => setPlpPriceMin(e.target.value)}
                      className="flex-1 rounded-xl border border-primary-200 border-white/15 bg-primary-50 bg-primary-900 px-3 py-2.5 text-sm"
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="تا"
                      value={plpPriceMax}
                      onChange={(e) => setPlpPriceMax(e.target.value)}
                      className="flex-1 rounded-xl border border-primary-200 border-white/15 bg-primary-50 bg-primary-900 px-3 py-2.5 text-sm"
                    />
                  </div>
                )}
                {plpFilterTab === 'price' && !priceRangeValid && (
                  <p className="text-sm text-primary-500 text-center py-6">محدوده قیمت در دسترس نیست</p>
                )}
                {plpFilterTab === 'color' && (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {allColorsSafe.map((c) => {
                        const name = typeof c === 'string' ? c : c.name;
                        const hex = typeof c === 'string' ? colorHexMapSafe[c] : c.hex || colorHexMapSafe[name];
                        const on = plpColorsSafe.includes(name);
                        return (
                          <button
                            key={name}
                            type="button"
                            onClick={() =>
                              setPlpColors((prev) =>
                                (prev || []).includes(name) ? prev.filter((x) => x !== name) : [...(prev || []), name],
                              )
                            }
                            className={`w-9 h-9 rounded-full border-2 ${on ? 'border-[#023047] border-[#13ABC4]' : 'border-primary-200 border-white/20'}`}
                            style={{ background: hex || '#ccc' }}
                            title={name}
                          />
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {allSizesSafe.map((s) => {
                        const name = typeof s === 'string' ? s : s.name;
                        const on = plpSizesSafe.includes(name);
                        return (
                          <button
                            key={name}
                            type="button"
                            onClick={() =>
                              setPlpSizes((prev) =>
                                (prev || []).includes(name) ? prev.filter((x) => x !== name) : [...(prev || []), name],
                              )
                            }
                            className={`min-w-[2.5rem] px-3 py-2 rounded-xl text-sm border ${chipOn(on)}`}
                          >
                            {name}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
                {plpFilterTab === 'more' && (
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setPlpInStockOnly((v) => !v)}
                      className={`px-3 py-3 rounded-xl text-sm border text-right ${chipOn(!!plpInStockOnly)}`}
                    >
                      فقط موجود
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlpDiscountOnly((v) => !v)}
                      className={`px-3 py-3 rounded-xl text-sm border text-right ${chipOn(!!plpDiscountOnly)}`}
                    >
                      فقط تخفیف‌دار
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlpFastShipOnly((v) => !v)}
                      className={`px-3 py-3 rounded-xl text-sm border text-right ${chipOn(!!plpFastShipOnly)}`}
                    >
                      ارسال سریع
                    </button>
                  </div>
                )}
              </div>
              <div className="flex gap-2 px-4 py-3 border-t border-primary-100 border-white/10">
                <button
                  type="button"
                  onClick={() => clearPlpFilters()}
                  className="flex-1 py-3 rounded-xl text-sm border border-primary-200 border-white/20 text-primary-800 text-white"
                >
                  پاک کردن
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPlpFilterOpen(false);
                    setPlpVisible(8);
                  }}
                  className="flex-1 py-3 rounded-xl text-sm font-bold bg-[#023047] bg-[#13ABC4] text-white"
                >
                  اعمال ({toFa(plpFilteredSafe.length)})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* شیت مرتب‌سازی موبایل */}
        {plpSortOpen && (
          <div className="fixed inset-0 z-[90] sm:hidden">
            <div className="site-modal-backdrop" onClick={() => setPlpSortOpen(false)} />
            <div className="absolute bottom-0 left-0 right-0 bg-white bg-primary-950 rounded-t-2xl p-4 shadow-2xl">
              <h3 className="text-sm font-bold text-primary-900 text-white mb-3">مرتب‌سازی</h3>
              {SORT_OPTIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setPlpSort(s.id);
                    setPlpSortOpen(false);
                    setPlpVisible(8);
                  }}
                  className={`w-full text-right px-3 py-3.5 rounded-xl text-sm mb-1 min-h-[48px] ${
                    plpSort === s.id
                      ? 'bg-[#023047] bg-[#13ABC4] !text-white font-bold'
                      : 'text-primary-700 text-white/80 hover:bg-primary-50 hover:bg-primary-900'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
