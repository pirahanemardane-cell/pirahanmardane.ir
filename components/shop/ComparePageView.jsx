'use client';

import { useAppApi } from '../AppApiContext';

/** ComparePageView — code-split from App.jsx */
export default function ComparePageView() {
  const {
    COMPARE_MAX,
    Icon,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    addToCart,
    clearCompare,
    closeComparePage,
    compare,
    compareOnlyDiffs,
    dark,
    deriveCollar,
    deriveFabric,
    deriveSleeve,
    isFavorite,
    openPDP,
    openPLP,
    pdpProduct,
    setCompareOnlyDiffs,
    showComparePage,
    showProfilePage,
    toFa,
    toggleCompare,
    toggleFavorite
  } = useAppApi();

  return (
    <>
          {showComparePage && !pdpProduct && !showProfilePage && (() => {
            const list = compare;
            const minPrice = list.length ? Math.min(...list.map(p => p.price)) : 0;
            const maxRating = list.length ? Math.max(...list.map(p => Number(p.rating) || 0)) : 0;
            const maxDiscount = list.length ? Math.max(...list.map(p => p.discount || 0)) : 0;
            const rows = [
              { key: 'price', label: 'قیمت', get: (p) => p.priceText + ' تومان', best: (p) => p.price === minPrice },
              { key: 'discount', label: 'تخفیف', get: (p) => p.discount ? toFa(p.discount) + '٪' : '—', best: (p) => (p.discount || 0) === maxDiscount && maxDiscount > 0 },
              { key: 'old', label: 'قیمت قبلی', get: (p) => p.oldPrice || '—', best: () => false },
              { key: 'rating', label: 'امتیاز', get: (p) => `${toFa(Number(p.rating || 0).toFixed(1))} از ۵`, best: (p) => Number(p.rating) === maxRating },
              { key: 'reviews', label: 'تعداد نظر', get: (p) => toFa(p.reviews || 0), best: () => false },
              { key: 'seller', label: 'فروشنده', get: (p) => p.seller?.name || 'فروشگاه مرکزی', best: () => false },
              { key: 'cat', label: 'دسته‌بندی', get: (p) => p.category || '—', best: () => false },
              { key: 'fabric', label: 'جنس پارچه', get: (p) => deriveFabric(p), best: () => false },
              { key: 'sleeve', label: 'نوع آستین', get: (p) => deriveSleeve(p), best: () => false },
              { key: 'collar', label: 'نوع یقه', get: (p) => deriveCollar(p), best: () => false },
              { key: 'sizes', label: 'سایزهای موجود', get: (p) => (p.sizes || []).join('، ') || '—', best: () => false },
              { key: 'colors', label: 'رنگ‌ها', get: (p) => toFa((p.colors || []).length), best: () => false },
              { key: 'ship', label: 'ارسال سریع', get: (p) => p.fastShip ? 'دارد' : '—', best: (p) => !!p.fastShip },
              { key: 'return', label: 'مرجوعی', get: () => '۷ روز', best: () => false },
              { key: 'auth', label: 'ضمانت اصالت', get: () => 'دارد', best: () => false },
            ];
            const visibleRows = compareOnlyDiffs && list.length >= 2
              ? rows.filter(r => {
                  const vals = list.map(p => r.get(p));
                  return vals.some(v => v !== vals[0]);
                })
              : rows;
            return (
            <div className="w-full flex-1 flex flex-col bg-primary-50 dark:bg-primary-950">
            <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-white flex items-center gap-2">
                    <Icon name="scale" size={22} />
                    مقایسه محصولات
                    {list.length > 0 && <span className="text-sm font-medium text-primary-500">({toFa(list.length)} از {toFa(COMPARE_MAX)})</span>}
                  </h1>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {list.length >= 2 && (
                    <label className="flex items-center gap-1.5 text-xs text-primary-700 dark:text-white cursor-pointer select-none">
                      <input type="checkbox" checked={compareOnlyDiffs} onChange={(e) => setCompareOnlyDiffs(e.target.checked)} className="accent-[#0071e3]" />
                      فقط تفاوت‌ها
                    </label>
                  )}
                  {list.length > 0 && (
                    <button type="button" onClick={clearCompare} className="text-xs text-primary-500 hover:text-red-500">پاک کردن همه</button>
                  )}
                  <button type="button" onClick={() => { closeComparePage(); openPLP(); }} className="text-xs px-3 py-1.5 rounded-full border plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium">افزودن کالا</button>
                </div>
              </div>

              {list.length === 0 && (
                <div className="text-center py-20 rounded-2xl border border-primary-200 dark:border-white/20 bg-primary-50/40 dark:bg-primary-900/30">
                  <p className="font-bold text-primary-900 dark:text-white">هنوز کالایی برای مقایسه نیست</p>
                  <p className="text-sm text-primary-500 mt-1 mb-5">از روی کارت محصول دکمه مقایسه را بزنید</p>
                  <button type="button" onClick={() => { closeComparePage(); openPLP(); }} className="px-6 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium">مشاهده فروشگاه</button>
                </div>
              )}
              {list.length === 1 && (
                <div className="text-center py-12 rounded-2xl border border-primary-200 dark:border-white/20 bg-primary-50/40 dark:bg-primary-900/30 mb-6">
                  <p className="font-bold text-primary-900 dark:text-white">حداقل ۲ کالا برای مقایسه لازم است</p>
                  <p className="text-sm text-primary-500 mt-1 mb-4">یک کالای دیگر اضافه کنید</p>
                  <button type="button" onClick={() => { closeComparePage(); openPLP(); }} className="px-5 py-2 rounded-full bg-apple-blue text-white text-sm">افزودن کالا</button>
                </div>
              )}

              {list.length > 0 && (
                <div className="compare-table-wrap overflow-x-auto no-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
                  <Table className="w-full text-sm min-w-[640px] md:min-w-0">
                    <TableHeader>
                      <TableRow className="border-b border-primary-200 dark:border-white/20">
                        <TableHead className="sticky right-0 z-20 bg-[#F7F7F8] dark:!bg-[#1A1C20] py-3 px-3 text-right text-primary-600 dark:!text-white/80 font-semibold min-w-[110px] text-sm">ویژگی</TableHead>
                        {list.map(p => {
                          const isBestPrice = list.length >= 2 && p.price === minPrice;
                          const isBestRating = list.length >= 2 && Number(p.rating) === maxRating;
                          return (
                            <TableHead key={p.id} className="py-3 px-3 text-right min-w-[170px] align-top">
                              <div className="flex flex-col items-stretch w-full text-right" dir="rtl">
                                <div className="relative w-24 self-start">
                                  <button type="button" className="p-0 border-0 bg-transparent block w-full text-right" onClick={() => { closeComparePage(); openPDP(p); }}>
                                    <img src={p.colors?.[0]?.image || p.image} alt="" className="w-24 h-28 object-cover rounded-xl shadow-sm" loading="lazy" referrerPolicy="no-referrer" />
                                  </button>
                                  {isBestPrice && <span className="absolute -top-1 right-0 text-xs bg-apple-blue text-white px-1.5 py-0.5 rounded-full">بهترین قیمت</span>}
                                </div>
                                <button type="button" className="mt-2 font-medium text-primary-900 dark:text-white line-clamp-2 text-xs sm:text-sm min-h-[2.5rem] w-full text-right" onClick={() => { closeComparePage(); openPDP(p); }}>{p.name}</button>
                                <p className="text-xs text-primary-500 mt-0.5 min-h-[1.25rem] w-full truncate text-right">{p.seller?.name || 'فروشگاه مرکزی'}</p>
                                <p className="text-xs text-apple-blue font-medium mt-0.5 min-h-[1.25rem] w-full text-right">{isBestRating ? 'بهترین امتیاز' : '\u00a0'}</p>
                                <div className="flex justify-start items-center gap-1 mt-1.5 flex-nowrap w-full" dir="rtl">
                                  <button type="button" onClick={() => addToCart(p)} className="text-xs px-2.5 py-1 rounded-full bg-apple-blue text-white shrink-0">سبد</button>
                                  <button type="button" onClick={() => toggleFavorite(p.id)} className="text-xs px-2 py-1 rounded-full border plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium inline-flex items-center justify-center shrink-0">
                                    <Icon name={isFavorite(p.id) ? 'heartFilled' : 'heart'} size={14} />
                                  </button>
                                  <button type="button" onClick={() => toggleCompare(p)} className="text-xs px-2 py-1 rounded-full border border-primary-200 dark:border-white/30 text-primary-500 dark:text-white shrink-0">حذف</button>
                                </div>
                              </div>
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleRows.map((r) => (
                        <TableRow key={r.key} className="border-b border-primary-100 dark:border-white/10">
                          <TableCell className="sticky right-0 z-10 bg-[#FAFAFB] dark:!bg-[#16161a] py-3 px-3 text-primary-600 dark:!text-white/80 text-xs font-semibold">{r.label}</TableCell>
                          {list.map(p => {
                            const best = r.best(p);
                            return (
                              <TableCell key={p.id} className={`py-2.5 px-3 text-right text-xs sm:text-sm ${best ? 'text-apple-blue font-bold bg-apple-blue/5' : 'text-primary-800 dark:text-white'}`}>
                                {r.key === 'colors' ? (
                                  <div className="flex justify-start gap-1.5 flex-wrap" dir="rtl">
                                    {(p.colors || []).slice(0, 6).map(c => (
                                      <span key={c.name} title={c.name} className="color-swatch w-7 h-7 rounded-full border-2 border-primary-300 dark:border-white/70" style={{ ["--swatch-color"]: c.hex || '#888', backgroundColor: c.hex || '#888' }} />
                                    ))}
                                  </div>
                                ) : r.get(p)}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell className="sticky right-0 z-10 bg-white dark:!bg-[#121214] py-3 px-3"></TableCell>
                        {list.map(p => (
                          <TableCell key={p.id} className="py-3 px-3 text-right">
                            <button type="button" onClick={() => addToCart(p)} className="inline-flex bg-apple-blue text-white text-xs px-4 py-2 rounded-full font-medium">افزودن به سبد</button>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
              {list.length >= 2 && (
                <div className="mt-4 flex flex-wrap justify-start gap-2 w-full" dir="rtl">
                  <button
                    type="button"
                    onClick={() => list.forEach(p => addToCart(p))}
                    className="compare-add-all-btn text-xs px-5 py-2.5 rounded-full font-semibold shadow-sm"
                  >
                    افزودن همه به سبد
                  </button>
                </div>
              )}
            </div>
            </div>
            );
          })()}

          {/* ===================== صفحه علاقه‌مندی‌ها ===================== */}
    </>
  );
}
