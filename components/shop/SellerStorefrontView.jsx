'use client';

import { useAppApi } from '../AppApiContext';
import dynamic from 'next/dynamic';
const FAQMonochrome = dynamic(() => import('../ui/faq-monochrome').then(m => m.FAQMonochrome || m.default), { ssr: false });

/** SellerStorefrontView — code-split from App.jsx */
export default function SellerStorefrontView() {
  const {
    SELLERS,
    CarouselArrows,
    Icon,
    dark,
    pdpProduct,
    products,
    renderProductCard,
    activeSeller,
    sellerBannerIdx,
    sellerCat,
    sellerCatMenuOpen,
    sellerDiscountOnly,
    sellerFollowed,
    sellerReportOpen,
    sellerReportSent,
    sellerSort,
    sellerSortMenuOpen,
    sellerStickyBar,
    setSellerBannerIdx,
    setSellerCat,
    setSellerCatMenuOpen,
    setSellerDiscountOnly,
    setSellerReportOpen,
    setSellerReportSent,
    setSellerSort,
    setSellerSortMenuOpen,
    shareSeller,
    sellerBestTrackRef,
    sellerNewTrackRef,
    sellerProfileRef,
    sellerProductsSorted,
    sellerNewestProducts,
    sellerBestProducts,
    sellerSimilarProducts,
    sellerCategories,
    sellerHasDiscount,
    sellerReviews,
    toFa,
    toggleSellerFollow,
  } = useAppApi();

  const sellerProductsSortedSafe = Array.isArray(sellerProductsSorted) ? sellerProductsSorted : [];
  const sellerNewestProductsSafe = Array.isArray(sellerNewestProducts) ? sellerNewestProducts : [];
  const sellerBestProductsSafe = Array.isArray(sellerBestProducts) ? sellerBestProducts : [];
  const sellerSimilarProductsSafe = Array.isArray(sellerSimilarProducts) ? sellerSimilarProducts : [];
  const sellerCategoriesSafe = Array.isArray(sellerCategories) ? sellerCategories : ['همه'];
  const followedMap = sellerFollowed && typeof sellerFollowed === 'object' && !Array.isArray(sellerFollowed) ? sellerFollowed : {};


  return (
    <>
          {activeSeller && !pdpProduct && (
            <div className="flex-1 flex flex-col bg-primary-50 dark:bg-primary-950">
              {/* هدر چسبان فروشنده — بعد از اسکرول پروفایل */}
              {sellerStickyBar && (
                <div className="sticky top-[52px] sm:top-[60px] z-40 bg-white/90 dark:bg-primary-950/90 backdrop-blur-xl border-b border-primary-100 dark:border-white/15 shadow-sm">
                  <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center gap-3">
                    <img src={activeSeller.image} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-primary-900 dark:text-white truncate">{activeSeller.name}</p>
                      <p className="text-xs text-primary-500 dark:!text-white">{toFa(activeSeller.products)} محصول · {toFa(Number(activeSeller.rating).toFixed(1))}★</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSellerFollow(activeSeller.id)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition border ${!!followedMap[activeSeller.id] ? 'seller-follow-on !text-[#064E3B] dark:!text-white' : 'seller-follow-off bg-apple-blue border-apple-blue text-white dark:bg-[#13ABC4] dark:border-[#13ABC4] dark:!text-white'}`}
                    >
                      {!!followedMap[activeSeller.id] ? 'دنبال‌شده' : 'دنبال کردن'}
                    </button>
                  </div>
                </div>
              )}

              {/* Banner gallery */}
              <div className="relative w-full h-36 sm:h-48 md:h-56 overflow-hidden">
                <img
                  src={(activeSeller.banners || [activeSeller.banner || activeSeller.image])[sellerBannerIdx % (activeSeller.banners?.length || 1)]}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-950/70 via-primary-950/20 to-transparent" />
                {(activeSeller.banners?.length || 0) > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setSellerBannerIdx(i => (i - 1 + activeSeller.banners.length) % activeSeller.banners.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm"
                      aria-label="قبلی"
                    >
                      <Icon name="chevronRight" size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSellerBannerIdx(i => (i + 1) % activeSeller.banners.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm"
                      aria-label="بعدی"
                    >
                      <Icon name="chevronLeft" size={16} />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {activeSeller.banners.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSellerBannerIdx(i)}
                          className={`w-2 h-2 rounded-full transition border ${i === sellerBannerIdx % activeSeller.banners.length ? 'bg-white border-white scale-125' : 'bg-transparent border-white/80'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Seller identity card */}
              <div ref={sellerProfileRef} className="max-w-7xl mx-auto px-3 sm:px-4 -mt-10 sm:-mt-12 relative z-10 w-full">
                <div className="bg-white dark:bg-primary-900 rounded-2xl shadow-sm border border-primary-200 dark:border-white/15 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-4 border-white dark:border-primary-900 shadow-md flex-shrink-0 -mt-12 sm:-mt-14 bg-primary-100">
                      <img src={activeSeller.image} alt={activeSeller.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-white">{activeSeller.name}</h1>
                        {activeSeller.lastActive && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">{activeSeller.lastActive}</span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-primary-500 dark:text-white/70">{activeSeller.desc}</p>
                      <p className="text-xs text-primary-400 dark:!text-white mt-1">
                        {activeSeller.city} · عضو از {activeSeller.joinDate}
                        {activeSeller.followers != null && <> · {toFa(activeSeller.followers)} دنبال‌کننده</>}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0 items-center">
                      <button
                        type="button"
                        onClick={() => toggleSellerFollow(activeSeller.id)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition border ${!!followedMap[activeSeller.id] ? 'seller-follow-on !text-[#064E3B] dark:!text-white' : 'seller-follow-off bg-apple-blue border-apple-blue text-white dark:bg-[#13ABC4] dark:border-[#13ABC4] dark:!text-white hover:opacity-90'}`}
                      >
                        {!!followedMap[activeSeller.id] ? 'دنبال‌شده' : 'دنبال کردن'}
                      </button>
                      <button type="button" onClick={() => shareSeller(activeSeller)} className="w-10 h-10 rounded-full border border-primary-200 dark:border-white/30 flex items-center justify-center text-primary-700 dark:!text-white hover:bg-primary-50 dark:hover:bg-primary-800 transition" title="اشتراک‌گذاری">
                        <Icon name="send" size={16} />
                      </button>
                      <button type="button" onClick={() => { setSellerReportOpen(true); setSellerReportSent(false); }} className="w-10 h-10 rounded-full border border-primary-200 dark:border-white/30 flex items-center justify-center text-primary-800 dark:!text-white hover:bg-primary-50 dark:hover:bg-primary-800 transition" title="گزارش" aria-label="گزارش">
                        <Icon name="flag" size={16} />
                      </button>
                      <button type="button" className="w-10 h-10 rounded-full border border-primary-200 dark:border-white/30 flex items-center justify-center text-primary-700 dark:!text-white hover:bg-primary-50 dark:hover:bg-primary-800 transition" title="پیام">
                        <Icon name="headphones" size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 pt-5 border-t border-primary-100 dark:border-white/15">
                    {[
                      { label: 'امتیاز', value: toFa(Number(activeSeller.rating).toFixed(1)) },
                      { label: 'رضایت', value: toFa(activeSeller.satisfaction) + '٪' },
                      { label: 'پاسخگویی', value: activeSeller.responseTime },
                      { label: 'محصولات', value: toFa(activeSeller.products) },
                      { label: 'تحویل به‌موقع', value: toFa(activeSeller.onTimeRate) + '٪' },
                      { label: 'میانگین ارسال', value: toFa(activeSeller.avgShipDays) + ' روز' },
                    ].map((st) => (
                      <div key={st.label} className="text-center">
                        <p className="text-base sm:text-lg font-bold text-primary-900 dark:text-white">{st.value}</p>
                        <p className="text-xs text-primary-400 dark:!text-white mt-0.5">{st.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Badges */}
                  {activeSeller.badges?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {activeSeller.badges.map(b => (
                        <span key={b} className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-800 text-primary-700 dark:text-white border border-primary-100 dark:border-white/20">{b}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* باکس سیاست ارسال و مرجوعی */}
              <div className="max-w-7xl mx-auto px-3 sm:px-4 mt-5 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  {[
                    { icon: 'truck', title: 'ارسال', desc: `میانگین ${toFa(activeSeller.avgShipDays)} روز · ${toFa(activeSeller.onTimeRate)}٪ تحویل به‌موقع` },
                    { icon: 'refresh', title: 'مرجوعی', desc: '۷ روز ضمانت بازگشت کالا در صورت مشکل' },
                    { icon: 'headphones', title: 'پاسخگویی', desc: activeSeller.responseTime ? `میانگین پاسخ ${activeSeller.responseTime}` : 'پاسخگویی در ساعات کاری' },
                  ].map(item => (
                    <div key={item.title} className="flex items-start gap-2.5 bg-white dark:bg-primary-900 rounded-xl border border-primary-100 dark:border-white/15 px-3.5 py-3">
                      <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-800 flex items-center justify-center text-primary-700 dark:text-white flex-shrink-0">
                        <Icon name={item.icon} size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-primary-900 dark:text-white">{item.title}</p>
                        <p className="text-xs text-primary-500 dark:text-white/70 mt-0.5 leading-snug">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* پرفروش‌ترین محصولات این فروشنده */}
              {sellerBestProductsSafe.length > 0 && (
                <section className="max-w-7xl mx-auto px-3 sm:px-4 mt-6 sm:mt-8 w-full">
                  <div className="flex items-center justify-between mb-4 sm:mb-5 gap-3">
                    <h2 className="section-title text-primary-900 dark:text-white text-lg sm:text-xl">پرفروش‌ترین محصولات</h2>
                  </div>
                  <div className="relative">
                    <CarouselArrows trackRef={sellerBestTrackRef} />
                    <div ref={sellerBestTrackRef} className="carousel-track flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth snap-x px-0 sm:px-10" style={{ WebkitOverflowScrolling: 'touch' }}>
                      {sellerBestProductsSafe.map(p => renderProductCard(p, 'seller-best-'))}
                    </div>
                  </div>
                </section>
              )}

              {/* جدیدترین محصولات این فروشنده */}
              {sellerNewestProductsSafe.length > 0 && (
                <section className="max-w-7xl mx-auto px-3 sm:px-4 mt-6 sm:mt-8 w-full">
                  <div className="flex items-center justify-between mb-4 sm:mb-5 gap-3">
                    <h2 className="section-title text-primary-900 dark:text-white text-lg sm:text-xl">جدیدترین محصولات</h2>
                  </div>
                  <div className="relative">
                    <CarouselArrows trackRef={sellerNewTrackRef} />
                    <div ref={sellerNewTrackRef} className="carousel-track flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth snap-x px-0 sm:px-10" style={{ WebkitOverflowScrolling: 'touch' }}>
                      {sellerNewestProductsSafe.map(p => renderProductCard(p, 'seller-new-'))}
                    </div>
                  </div>
                </section>
              )}

              {/* تیتر + فیلترهای بازشونده */}
              <div className="max-w-7xl mx-auto px-3 sm:px-4 mt-6 w-full">
                <h2 className="text-base sm:text-lg font-bold text-primary-900 dark:text-white mb-3 text-right">همه محصولات</h2>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {/* دسته */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => { setSellerCatMenuOpen(v => !v); setSellerSortMenuOpen(false); }}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium border transition ${sellerCat && sellerCat !== 'همه' ? 'bg-primary-800 text-white border-primary-800 dark:bg-[#13ABC4] dark:!text-white dark:border-[#13ABC4]' : 'bg-white dark:bg-primary-900 plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium'}`}
                    >
                      {sellerCat && sellerCat !== 'همه' ? sellerCat : 'دسته‌بندی'}
                      <Icon name="chevronDown" size={14} className={`transition ${sellerCatMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {sellerCatMenuOpen && (
                      <div className="absolute top-full right-0 mt-1.5 z-40 min-w-[10rem] bg-white dark:bg-primary-900 rounded-xl shadow-lg border border-primary-200 dark:border-white/30 overflow-hidden py-1">
                        {sellerCategoriesSafe.map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => { setSellerCat(c === 'همه' ? '' : c); setSellerCatMenuOpen(false); }}
                            className={`w-full text-right px-3 py-2 text-xs transition ${(sellerCat === c || (!sellerCat && c === 'همه')) ? 'bg-primary-100 dark:bg-primary-800 font-medium' : 'hover:bg-primary-50 dark:hover:bg-primary-800'} text-primary-900 dark:text-white`}
                          >
                            {c}
                          </button>
                        ))}
                        {sellerHasDiscount && (
                          <button
                            type="button"
                            onClick={() => { setSellerDiscountOnly(v => !v); setSellerCatMenuOpen(false); }}
                            className={`w-full text-right px-3 py-2 text-xs border-t border-primary-100 dark:border-white/10 transition ${sellerDiscountOnly ? 'bg-red-50 text-red-700 font-medium' : 'hover:bg-primary-50 dark:hover:bg-primary-800 text-primary-900 dark:text-white'}`}
                          >
                            فقط تخفیف‌دار {sellerDiscountOnly ? '✓' : ''}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  {/* مرتب‌سازی */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => { setSellerSortMenuOpen(v => !v); setSellerCatMenuOpen(false); }}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium border transition ${sellerSort ? 'bg-primary-800 text-white border-primary-800 dark:bg-[#13ABC4] dark:!text-white dark:border-[#13ABC4]' : 'bg-white dark:bg-primary-900 plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium'}`}
                    >
                      {{ newest: 'جدیدترین', popular: 'پرفروش', rating: 'بیشترین امتیاز', 'price-asc': 'ارزان‌ترین', 'price-desc': 'گران‌ترین' }[sellerSort] || 'مرتب‌سازی'}
                      <Icon name="chevronDown" size={14} className={`transition ${sellerSortMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {sellerSortMenuOpen && (
                      <div className="absolute top-full right-0 mt-1.5 z-40 min-w-[10rem] bg-white dark:bg-primary-900 rounded-xl shadow-lg border border-primary-200 dark:border-white/30 overflow-hidden py-1">
                        {[
                          { id: '', label: 'پیش‌فرض' },
                          { id: 'newest', label: 'جدیدترین' },
                          { id: 'popular', label: 'پرفروش' },
                          { id: 'rating', label: 'بیشترین امتیاز' },
                          { id: 'price-asc', label: 'ارزان‌ترین' },
                          { id: 'price-desc', label: 'گران‌ترین' },
                        ].map(({ id, label }) => (
                          <button
                            key={id || 'default'}
                            type="button"
                            onClick={() => { setSellerSort(id); setSellerSortMenuOpen(false); }}
                            className={`w-full text-right px-3 py-2 text-xs transition ${sellerSort === id ? 'bg-primary-100 dark:bg-primary-800 font-medium' : 'hover:bg-primary-50 dark:hover:bg-primary-800'} text-primary-900 dark:text-white`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {sellerDiscountOnly && (
                    <button type="button" onClick={() => setSellerDiscountOnly(false)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs bg-red-600 text-white">
                      فقط تخفیف‌دار <Icon name="x" size={14} />
                    </button>
                  )}
                </div>
                <p className="text-xs text-primary-500 dark:!text-white text-right mb-3">{toFa(sellerProductsSortedSafe.length)} محصول</p>
              </div>

              {/* Products grid */}
              <div className="max-w-7xl mx-auto px-3 sm:px-4 mt-4 pb-8 w-full">
                {sellerProductsSortedSafe.length === 0 ? (
                  <div className="text-center py-12 text-primary-500 dark:!text-white text-sm">
                    <p className="mb-2">محصولی در این دسته یافت نشد</p>
                    <button type="button" onClick={() => { setSellerCat(''); setSellerDiscountOnly(false); }} className="text-apple-blue underline text-xs">مشاهده همه محصولات فروشنده</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {sellerProductsSortedSafe.map(p => (
                      <div key={p.id} className="min-w-0">
                        {renderProductCard(p, 'seller-', { grid: true })}
                      </div>
                    ))}
                  </div>
                )}

                {/* پیشنهاد مشابه وقتی فروشنده محصول اختصاصی ندارد */}
                {sellerSimilarProductsSafe.length > 0 && (
                  <div className="mt-8">
                    <h2 className="section-title text-primary-900 dark:text-white mb-4 text-lg sm:text-xl">محصولات مشابه از فروشندگان دیگر</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {sellerSimilarProductsSafe.map(p => (
                        <div key={p.id} className="min-w-0">
                          {renderProductCard(p, 'seller-sim-', { grid: true })}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* About */}
              <div className="max-w-7xl mx-auto px-3 sm:px-4 pb-6 w-full">
                <div className="bg-white dark:bg-primary-900 rounded-2xl border border-primary-100 dark:border-white/20 p-4 sm:p-6">
                  <h2 className="text-sm sm:text-base font-bold text-primary-900 dark:text-white mb-2">درباره فروشنده</h2>
                  <p className="text-xs sm:text-sm text-primary-600 dark:text-white/80 leading-relaxed">{activeSeller.about}</p>
                  <div className="mt-4 pt-4 border-t border-primary-100 dark:border-white/15 grid sm:grid-cols-3 gap-3 text-xs sm:text-xs text-primary-500 dark:!text-white">
                    <div className="flex items-center gap-2"><Icon name="truck" size={14} /><span>ارسال به سراسر ایران</span></div>
                    <div className="flex items-center gap-2"><Icon name="refresh" size={14} /><span>۷ روز ضمانت مرجوعی</span></div>
                    <div className="flex items-center gap-2"><Icon name="shield" size={14} /><span>پرداخت امن</span></div>
                  </div>
                </div>
              </div>

              {/* Reviews + rating distribution */}
              <div className="max-w-7xl mx-auto px-3 sm:px-4 pb-6 w-full">
                <div className="bg-white dark:bg-primary-900 rounded-2xl border border-primary-100 dark:border-white/20 p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm sm:text-base font-bold text-primary-900 dark:text-white">نظرات خریداران</h2>
                    <span className="text-xs text-primary-500 dark:!text-white">{toFa(activeSeller.ratingCount)} نظر</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-5 mb-5">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-2xl font-bold text-primary-900 dark:text-white">{toFa(Number(activeSeller.rating).toFixed(1))}</span>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(n => (
                          <Icon key={n} name={n <= Math.round(activeSeller.rating) ? 'starFilled' : 'star'} size={14} className={n <= Math.round(activeSeller.rating) ? 'text-primary-400' : 'text-primary-200 dark:text-primary-600'} />
                        ))}
                      </div>
                    </div>
                    {activeSeller.ratingDist && (
                      <div className="flex-1 space-y-1.5 min-w-0">
                        {[5,4,3,2,1].map(star => {
                          const count = activeSeller.ratingDist[star] || 0;
                          const total = activeSeller.ratingCount || 1;
                          const pct = Math.round((count / total) * 100);
                          return (
                            <div key={star} className="flex items-center gap-2 text-xs">
                              <span className="w-6 text-primary-500 dark:!text-white">{toFa(star)}★</span>
                              <div className="flex-1 h-1.5 rounded-full bg-primary-100 dark:bg-primary-800 overflow-hidden">
                                <div className="h-full rounded-full bg-primary-400 dark:bg-[#13ABC4]" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="w-8 text-left text-primary-400 dark:!text-white">{toFa(pct)}٪</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {sellerReviews.map((r, i) => (
                      <div key={i} className="pb-4 border-b border-primary-50 dark:border-white/10 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-xs font-medium text-primary-900 dark:text-white">{r.name}</p>
                          <span className="text-xs text-primary-400 dark:!text-white">{r.date}</span>
                        </div>
                        <div className="flex gap-0.5 mb-1.5">
                          {[1,2,3,4,5].map(n => (
                            <Icon key={n} name={n <= r.rating ? 'starFilled' : 'star'} size={14} className={n <= r.rating ? 'text-primary-400' : 'text-primary-200 dark:text-primary-600'} />
                          ))}
                        </div>
                        <p className="text-xs text-primary-600 dark:text-white/75 leading-relaxed">{r.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* FAQ */}
              {activeSeller.faq?.length > 0 && (
                <div className="max-w-7xl mx-auto px-3 sm:px-4 pb-10 w-full">
                  <FAQMonochrome
                    compact
                    title="سوالات پرتکرار"
                    subtitle="پاسخ سوالات رایج این فروشگاه"
                    badge="FAQ"
                    items={activeSeller.faq}
                  />
                </div>
              )}

              {/* مودال گزارش */}
              {sellerReportOpen && (
                <div className="site-modal-root" role="dialog" aria-modal="true">
                  <div className="site-modal-backdrop" onClick={() => setSellerReportOpen(false)} />
                  <div className="site-modal-panel bg-white dark:bg-primary-900 p-5 border border-primary-200 dark:border-white/15">
                    <h3 className="text-sm font-bold text-primary-900 dark:text-white mb-3">گزارش فروشنده</h3>
                    {sellerReportSent ? (
                      <p className="text-xs text-primary-600 dark:text-white/80 mb-4">گزارش شما ثبت شد. با تشکر از همراهی‌تان.</p>
                    ) : (
                      <>
                        <p className="text-xs text-primary-500 dark:text-white/70 mb-3">دلیل گزارش را انتخاب کنید:</p>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {['اطلاعات نادرست', 'تاخیر در ارسال', 'کیفیت پایین', 'سایر'].map(r => (
                            <button key={r} type="button" className="px-3 py-1.5 rounded-full text-xs border plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium hover:bg-primary-50 dark:hover:bg-primary-800">{r}</button>
                          ))}
                        </div>
                      </>
                    )}
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setSellerReportOpen(false)} className="flex-1 py-2.5 rounded-full text-sm border border-primary-200 dark:border-white/30 text-primary-800 dark:text-white">بستن</button>
                      {!sellerReportSent && (
                        <button type="button" onClick={() => setSellerReportSent(true)} className="flex-1 py-2.5 rounded-full text-sm bg-apple-blue text-white">ارسال گزارش</button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================== SELLERS LIST PAGE ===================== */}
    </>
  );
}
