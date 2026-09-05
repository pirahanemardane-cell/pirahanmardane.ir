'use client';

import { useAppApi } from '../AppApiContext';

/** SellersListView — code-split from App.jsx */
export default function SellersListView() {
  const {
    sellerSortOptions,
    filteredSellersList,
    isSellerListFilterActive,
    sellerFilterCount,
    sellerNameSuggestions,
    citySuggestions,
    popularCities,
    IRAN_CITIES,
    CarouselArrows,
    Icon,
    activeSellerId,
    clearSellerListFilters,
    dark,
    openSeller,
    pdpProduct,
    products,
    sellerCityInput,
    sellerCityOpen,
    sellerFilterSheetOpen,
    sellerFollowed,
    sellerListCities,
    sellerListMaxResponse,
    sellerListMinProducts,
    sellerListMinRating,
    sellerListQuery,
    sellerListSort,
    sellerSearchOpen,
    sellerSortMenuOpen,
    setSellerCityInput,
    setSellerCityOpen,
    setSellerFilterSheetOpen,
    setSellerListCities,
    setSellerListMaxResponse,
    setSellerListMinProducts,
    setSellerListMinRating,
    setSellerListQuery,
    setSellerListSort,
    setSellerSearchOpen,
    setSellerSortMenuOpen,
    setTopSellersTab,
    showAdminPanel,
    showCartPage,
    showComparePage,
    showProfilePage,
    showRecentPage,
    showSellerPanel,
    showSellersList,
    showWishlistPage,
    staticPage,
    toFa,
    toggleSellerFollow,
    toggleSellerListCity,
    topSellersRanked,
    topSellersTab,
    sellersListTrackRef
  } = useAppApi();
  const IRAN_CITIES_LIST = Array.isArray(IRAN_CITIES) ? IRAN_CITIES : [];
  const filteredSellersListSafe = Array.isArray(filteredSellersList) ? filteredSellersList : [];
  const sellerSortOptionsSafe = Array.isArray(sellerSortOptions) ? sellerSortOptions : [];
  const citySuggestionsSafe = Array.isArray(citySuggestions) ? citySuggestions : [];
  const popularCitiesSafe = Array.isArray(popularCities) ? popularCities : [];
  const sellerNameSuggestionsSafe = Array.isArray(sellerNameSuggestions) ? sellerNameSuggestions : [];
  const isSellerListFilterActiveSafe = !!isSellerListFilterActive;
  const sellerFilterCountSafe = Number(sellerFilterCount) || 0;
  const topSellersRankedSafe = Array.isArray(topSellersRanked) ? topSellersRanked : [];
  const sellerListCitiesSafe = Array.isArray(sellerListCities) ? sellerListCities : [];
  const sellerFollowedSafe = sellerFollowed && typeof sellerFollowed === 'object' && !Array.isArray(sellerFollowed) ? sellerFollowed : {};
  const productsSafe = Array.isArray(products) ? products : [];


  return (
    <>
          {showSellersList && !activeSellerId && !pdpProduct && !showCartPage && !showWishlistPage && !showRecentPage && !showComparePage && !showProfilePage && !showSellerPanel && !showAdminPanel && !staticPage && (
            <div className="flex-1 flex flex-col bg-primary-50 dark:bg-primary-950">
              {/* فیلتر صفحه فروشندگان — موبایل: سرچ + شیت | دسکتاپ: باکس یکپارچه */}
              <div className="bg-white dark:bg-primary-900 border-b border-primary-100 dark:border-white/15">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-3.5">

                  {/* ===== موبایل ===== */}
                  <div className="sm:hidden flex flex-col gap-2.5">
                    {/* خط ۱: سرچ تمام‌عرض — فیلتر سمت راست باکس (اول در DOM برای RTL) */}
                    <div className="relative">
                      <div className="flex items-center gap-2 bg-primary-50 dark:bg-primary-900 border border-primary-200 dark:border-white/25 rounded-full overflow-hidden px-3 py-2.5">
                        <button
                          type="button"
                          onClick={() => setSellerFilterSheetOpen(true)}
                          className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition ${sellerFilterCountSafe > 0 ? 'bg-primary-800 text-white dark:bg-[#13ABC4] dark:!text-white' : 'text-primary-700 dark:text-white'}`}
                        >
                          <Icon name="sliders" size={14} />
                          فیلتر
                          {sellerFilterCountSafe > 0 && (
                            <span className="w-3.5 h-3.5 rounded-full bg-white/25 text-xs flex items-center justify-center">{toFa(sellerFilterCountSafe)}</span>
                          )}
                        </button>
                        <span className="w-px h-5 bg-primary-200 dark:bg-white/20 flex-shrink-0" />
                        <Icon name="search" size={16} className="text-primary-400 dark:!text-white flex-shrink-0" />
                        <input
                          type="search"
                          value={sellerListQuery}
                          onChange={e => { setSellerListQuery(e.target.value); setSellerSearchOpen(true); }}
                          onFocus={() => setSellerSearchOpen(true)}
                          onBlur={() => setTimeout(() => setSellerSearchOpen(false), 180)}
                          placeholder="جستجوی فروشنده..."
                          className="w-full bg-transparent text-primary-900 dark:text-white caret-primary-900 dark:caret-white text-sm focus:outline-none placeholder:text-primary-400 dark:placeholder:text-white/40"
                        />
                        {sellerListQuery && (
                          <button type="button" onClick={() => setSellerListQuery('')} className="text-primary-400 flex-shrink-0" aria-label="پاک کردن">
                            <Icon name="x" size={14} />
                          </button>
                        )}
                      </div>
                      {sellerSearchOpen && sellerNameSuggestionsSafe.length > 0 && (
                        <div className="absolute top-full right-0 left-0 mt-1.5 z-40 bg-white dark:bg-black rounded-xl shadow-lg border border-primary-200 dark:border-white/30 overflow-hidden max-h-56 overflow-y-auto">
                          {sellerNameSuggestionsSafe.map(s => (
                            <button
                              key={s.id}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => { setSellerListQuery(s.name); setSellerSearchOpen(false); }}
                              className="w-full text-right px-3 py-2.5 text-sm hover:bg-primary-50 dark:hover:bg-primary-800 transition flex items-center justify-between gap-2"
                            >
                              <span className="font-medium text-primary-900 dark:text-white">{s.name}</span>
                              <span className="text-xs text-primary-400 dark:!text-white">{s.city}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>


                    <div className="flex items-center justify-between">
                      <p className="text-xs text-primary-500 dark:!text-white">{toFa(filteredSellersListSafe.length)} فروشنده</p>
                      {isSellerListFilterActiveSafe && (
                        <button type="button" onClick={clearSellerListFilters} className="text-xs text-apple-blue dark:text-[#13ABC4]">پاک کردن فیلترها</button>
                      )}
                    </div>
                  </div>

                  {/* ===== دسکتاپ: باکس یکپارچه ===== */}
                  <div className="hidden sm:block">
                    <div className="relative flex flex-wrap items-center gap-2 bg-primary-50 dark:bg-primary-900 border border-primary-200 dark:border-white/25 rounded-[9999px] overflow-hidden px-3 py-2 min-h-[48px]">
                      <div className="relative flex-1 min-w-[12rem]">
                        <div className="flex items-center gap-1.5 rounded-full border border-primary-200 dark:border-white/30 bg-primary-50 dark:bg-black px-2.5 py-1">
                          <Icon name="search" size={14} className="text-primary-400 dark:!text-white flex-shrink-0" />
                          <input
                            type="search"
                            value={sellerListQuery}
                            onChange={e => { setSellerListQuery(e.target.value); setSellerSearchOpen(true); }}
                            onFocus={() => setSellerSearchOpen(true)}
                            onBlur={() => setTimeout(() => setSellerSearchOpen(false), 180)}
                            placeholder="جستجوی فروشنده..."
                            className="w-full bg-transparent text-primary-900 dark:text-white caret-primary-900 dark:caret-white text-sm py-1.5 focus:outline-none placeholder:text-primary-400 dark:placeholder:text-white/40"
                          />
                          {sellerListQuery && (
                            <button type="button" onClick={() => setSellerListQuery('')} className="text-primary-400 hover:text-primary-700 dark:hover:text-white flex-shrink-0" aria-label="پاک کردن">
                              <Icon name="x" size={14} />
                            </button>
                          )}
                        </div>
                        {sellerSearchOpen && sellerNameSuggestionsSafe.length > 0 && (
                          <div className="absolute top-full right-0 left-0 mt-2 z-40 bg-white dark:bg-black rounded-xl shadow-lg border border-primary-200 dark:border-white/30 overflow-hidden max-h-56 overflow-y-auto">
                            {sellerNameSuggestionsSafe.map(s => (
                              <button
                                key={s.id}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => { setSellerListQuery(s.name); setSellerSearchOpen(false); }}
                                className="w-full text-right px-3 py-2.5 text-sm hover:bg-primary-50 dark:hover:bg-primary-800 transition flex items-center justify-between gap-2"
                              >
                                <span className="font-medium text-primary-900 dark:text-white">{s.name}</span>
                                <span className="text-xs text-primary-400 dark:!text-white">{s.city}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <span className="w-px h-6 bg-primary-200 dark:bg-white/20 flex-shrink-0" />

                      <div className="relative flex-shrink-0 min-w-[9rem]">
                        <div className="flex items-center gap-1 flex-wrap rounded-full border border-primary-200 dark:border-white/30 bg-primary-50 dark:bg-black px-2.5 py-1">
                          {sellerListCitiesSafe.map(city => (
                            <button
                              key={city}
                              type="button"
                              onClick={() => toggleSellerListCity(city)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary-800 text-white dark:bg-[#13ABC4] dark:!text-white"
                            >
                              {city}
                              <Icon name="x" size={14} />
                            </button>
                          ))}
                          <input
                            type="text"
                            value={sellerCityInput}
                            onChange={e => { setSellerCityInput(e.target.value); setSellerCityOpen(true); }}
                            onFocus={() => setSellerCityOpen(true)}
                            onBlur={() => setTimeout(() => setSellerCityOpen(false), 180)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && citySuggestionsSafe[0]) {
                                e.preventDefault();
                                if (!sellerListCitiesSafe.includes(citySuggestionsSafe[0])) toggleSellerListCity(citySuggestionsSafe[0]);
                                setSellerCityInput('');
                              }
                            }}
                            placeholder="شهر..."
                            className="w-24 bg-transparent text-primary-900 dark:text-white caret-primary-900 dark:caret-white text-sm py-1.5 focus:outline-none placeholder:text-primary-400 dark:placeholder:text-white/40"
                          />
                        </div>
                        {sellerCityOpen && citySuggestionsSafe.length > 0 && (
                          <div className="absolute top-full right-0 mt-2 z-40 w-44 bg-white dark:bg-black rounded-xl shadow-lg border border-primary-200 dark:border-white/30 overflow-hidden max-h-56 overflow-y-auto">
                            {citySuggestionsSafe.map(city => {
                              const on = sellerListCitiesSafe.includes(city);
                              return (
                                <button
                                  key={city}
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => {
                                    toggleSellerListCity(city);
                                    setSellerCityInput('');
                                    setSellerCityOpen(false);
                                  }}
                                  className={`w-full text-right px-3 py-2 text-xs transition ${on ? 'bg-primary-100 dark:bg-primary-800 font-medium' : 'hover:bg-primary-50 dark:hover:bg-primary-800'} text-primary-900 dark:text-white`}
                                >
                                  {city}{on ? ' ✓' : ''}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <span className="w-px h-6 bg-primary-200 dark:bg-white/20 flex-shrink-0" />

                      {/* حداقل امتیاز */}
                      <div className="flex gap-1 flex-shrink-0" role="group" aria-label="حداقل امتیاز">
                        {[
                          { v: 0, label: 'امتیاز' },
                          { v: 4, label: '۴+' },
                          { v: 4.5, label: '۴.۵+' },
                        ].map(({ v, label }) => {
                          const on = v > 0 && sellerListMinRating === v;
                          return (
                            <button
                              key={v}
                              type="button"
                              onClick={() => setSellerListMinRating(sellerListMinRating === v ? 0 : v)}
                              className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium border transition ${on ? 'bg-primary-800 text-white border-primary-800 dark:bg-[#13ABC4] dark:!text-white dark:border-[#13ABC4]' : 'plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium bg-white/70 dark:bg-primary-950/50'}`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>

                      <span className="w-px h-6 bg-primary-200 dark:bg-white/20 flex-shrink-0" />

                      {isSellerListFilterActiveSafe && (
                        <button type="button" onClick={clearSellerListFilters} className="flex-shrink-0 text-xs text-apple-blue dark:text-[#13ABC4] hover:underline px-1">
                          پاک کردن
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* باتم‌شیت فیلتر موبایل — شهر */}
              {sellerFilterSheetOpen && (
                <div className="fixed inset-0 z-[90] sm:hidden">
                  <div className="site-modal-backdrop" onClick={() => setSellerFilterSheetOpen(false)} />
                  <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-primary-900 rounded-t-2xl shadow-2xl max-h-[75vh] flex flex-col animate-[slideUp_0.25s_ease-out]">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-primary-100 dark:border-white/15">
                      <h3 className="text-sm font-bold text-primary-900 dark:text-white">فیلتر فروشندگان</h3>
                      <button type="button" onClick={() => setSellerFilterSheetOpen(false)} className="p-1.5 rounded-full hover:bg-primary-100 dark:hover:bg-primary-800 text-primary-700 dark:text-white">
                        <Icon name="x" size={18} />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 py-4">
                      <p className="text-xs font-bold text-primary-500 dark:!text-white mb-2">شهر</p>
                      <div className="relative mb-3">
                        <Icon name="search" size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 pointer-events-none" />
                        <input
                          type="text"
                          value={sellerCityInput}
                          onChange={e => setSellerCityInput(e.target.value)}
                          placeholder="جستجوی شهر..."
                          className="w-full bg-primary-50 dark:bg-primary-900 border border-primary-200 dark:border-white/25 rounded-full py-2.5 pr-9 pl-3 text-sm text-primary-900 dark:text-white caret-primary-900 dark:caret-white focus:outline-none placeholder:text-primary-400 dark:placeholder:text-white/40"
                        />
                      </div>
                      {sellerListCitiesSafe.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {sellerListCitiesSafe.map(city => (
                            <button
                              key={city}
                              type="button"
                              onClick={() => toggleSellerListCity(city)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-primary-800 text-white dark:bg-[#13ABC4] dark:!text-white"
                            >
                              {city}
                              <Icon name="x" size={14} />
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="border border-primary-100 dark:border-white/15 rounded-xl overflow-hidden max-h-48 overflow-y-auto bg-white dark:bg-primary-900">
                        {(sellerCityInput.trim()
                          ? IRAN_CITIES_LIST.filter(c => c.includes(sellerCityInput.trim()) || c.replace(/‌/g, '').includes(sellerCityInput.trim().replace(/‌/g, ''))).slice(0, 8)
                          : ['تهران', 'مشهد', 'اصفهان', 'شیراز', 'تبریز', 'کرج', 'اهواز', 'رشت']
                        ).map(city => {
                          const on = sellerListCitiesSafe.includes(city);
                          return (
                            <button
                              key={city}
                              type="button"
                              onClick={() => { toggleSellerListCity(city); setSellerCityInput(''); }}
                              className={`w-full text-right px-3 py-2.5 text-sm border-b border-primary-50 dark:border-white/5 last:border-0 transition ${on ? 'bg-primary-100 dark:bg-primary-800 font-medium text-primary-900 dark:text-white' : 'text-primary-800 dark:text-white/90 hover:bg-primary-50 dark:hover:bg-primary-900'}`}
                            >
                              {city}{on ? ' ✓' : ''}
                            </button>
                          );
                        })}
                        {sellerCityInput.trim() && IRAN_CITIES_LIST.filter(c => c.includes(sellerCityInput.trim()) || c.replace(/‌/g, '').includes(sellerCityInput.trim().replace(/‌/g, ''))).length === 0 && (
                          <p className="px-3 py-3 text-xs text-primary-400">شهری یافت نشد</p>
                        )}
                      </div>

                      <p className="text-xs font-bold text-primary-500 dark:!text-white mt-5 mb-2">حداقل امتیاز</p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { v: 0, label: 'همه' },
                          { v: 4, label: '۴ و بالاتر' },
                          { v: 4.5, label: '۴.۵ و بالاتر' },
                        ].map(({ v, label }) => {
                          const on = sellerListMinRating === v;
                          return (
                            <button
                              key={v}
                              type="button"
                              onClick={() => setSellerListMinRating(v)}
                              className={`px-3 py-1.5 rounded-full text-xs border transition ${on ? 'bg-primary-800 text-white border-primary-800 dark:bg-[#13ABC4] dark:!text-white dark:border-[#13ABC4]' : 'plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium bg-primary-50 dark:bg-primary-900'}`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>

                      <p className="text-xs font-bold text-primary-500 dark:!text-white mt-5 mb-2">زمان پاسخگویی</p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { v: 0, label: 'همه' },
                          { v: 2, label: 'زیر ۲ ساعت' },
                          { v: 4, label: 'زیر ۴ ساعت' },
                          { v: 6, label: 'زیر ۶ ساعت' },
                        ].map(({ v, label }) => {
                          const on = sellerListMaxResponse === v;
                          return (
                            <button
                              key={v}
                              type="button"
                              onClick={() => setSellerListMaxResponse(v)}
                              className={`px-3 py-1.5 rounded-full text-xs border transition ${on ? 'bg-primary-800 text-white border-primary-800 dark:bg-[#13ABC4] dark:!text-white dark:border-[#13ABC4]' : 'plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium bg-primary-50 dark:bg-primary-900'}`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>

                      <p className="text-xs font-bold text-primary-500 dark:!text-white mt-5 mb-2">حداقل تعداد محصول</p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { v: 0, label: 'همه' },
                          { v: 20, label: '۲۰ و بیشتر' },
                          { v: 40, label: '۴۰ و بیشتر' },
                        ].map(({ v, label }) => {
                          const on = sellerListMinProducts === v;
                          return (
                            <button
                              key={v}
                              type="button"
                              onClick={() => setSellerListMinProducts(v)}
                              className={`px-3 py-1.5 rounded-full text-xs border transition ${on ? 'bg-primary-800 text-white border-primary-800 dark:bg-[#13ABC4] dark:!text-white dark:border-[#13ABC4]' : 'plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium bg-primary-50 dark:bg-primary-900'}`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex gap-2 px-4 py-3 border-t border-primary-100 dark:border-white/15">
                      <button
                        type="button"
                        onClick={() => { setSellerListCities([]); setSellerCityInput(''); setSellerListMinRating(0); setSellerListMaxResponse(0); setSellerListMinProducts(0); }}
                        className="flex-1 py-2.5 rounded-full text-sm font-medium border border-primary-200 dark:border-white/30 text-primary-800 dark:text-white"
                      >
                        پاک کردن
                      </button>
                      <button
                        type="button"
                        onClick={() => setSellerFilterSheetOpen(false)}
                        className="flex-1 py-2.5 rounded-full text-sm font-medium bg-apple-blue text-white"
                      >
                        اعمال فیلتر
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* باتم‌شیت مرتب‌سازی موبایل — لیست فروشندگان */}
              {sellerSortMenuOpen && showSellersList && (
                <div className="fixed inset-0 z-[90] sm:hidden">
                  <div className="site-modal-backdrop" onClick={() => setSellerSortMenuOpen(false)} />
                  <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-primary-900 rounded-t-2xl shadow-2xl max-h-[70vh] flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-primary-100 dark:border-white/15">
                      <h3 className="text-sm font-bold text-primary-900 dark:text-white">مرتب‌سازی</h3>
                      <button type="button" onClick={() => setSellerSortMenuOpen(false)} className="p-1.5 rounded-full hover:bg-primary-100 dark:hover:bg-primary-800 text-primary-700 dark:text-white">
                        <Icon name="x" size={18} />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 py-3">
                      {sellerSortOptionsSafe.map(({ id, label }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => { setSellerListSort(id); setSellerSortMenuOpen(false); }}
                          className={`w-full text-right px-3 py-3 rounded-xl text-sm mb-1 ${sellerListSort === id ? 'bg-primary-100 dark:bg-primary-800 font-bold text-primary-900 dark:text-white' : 'text-primary-700 dark:text-white'}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* فروشندگان برتر — کراسل اسلایدر مانند صفحه اصلی */}
              <section className="py-6 sm:py-8 bg-primary-50 dark:bg-primary-950 transition-colors border-b border-primary-100 dark:border-white/10">
                <div className="max-w-7xl mx-auto px-3 sm:px-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-5 gap-3">
                    <h2 className="section-title text-primary-900 dark:text-white text-lg sm:text-xl">فروشندگان برتر</h2>
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                      {[
                        { id: 'smart', label: 'برتر' },
                        { id: 'sales', label: 'بیشترین فروش' },
                        { id: 'new', label: 'تازه‌واردها' },
                      ].map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTopSellersTab(t.id)}
                          className={`seller-rank-tab flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition ${topSellersTab === t.id ? 'seller-rank-tab--active bg-primary-800 text-white border-primary-800 dark:bg-[#13ABC4] dark:!text-white dark:border-[#13ABC4]' : 'bg-white dark:bg-primary-800 plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white font-medium font-medium'}`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <CarouselArrows trackRef={sellersListTrackRef} />
                    <div ref={sellersListTrackRef} className="carousel-track flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth snap-x px-0 sm:px-10" style={{ WebkitOverflowScrolling: 'touch' }}>
                      {topSellersRankedSafe.map((s, idx) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => openSeller(s.id)}
                          className="group flex-shrink-0 w-[78%] min-[400px]:w-[70%] sm:w-[42%] md:w-[calc((100%-2.5rem)/3.3)] lg:w-[calc((100%-3.5rem)/4.3)] relative overflow-hidden rounded-xl bg-white dark:bg-primary-900 sm:rounded-2xl text-right min-h-[160px] sm:min-h-[180px] border border-primary-200 dark:border-white/30 snap-start"
                        >
                          <img src={s.image} alt={s.name} className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-[1.02]" loading="lazy" decoding="async" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/25" />
                          {idx < 3 && (
                            <span className={`absolute top-2 right-2 z-20 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow ${idx === 0 ? 'bg-amber-400 text-amber-950' : idx === 1 ? 'bg-slate-300 text-slate-800' : 'bg-amber-700 text-amber-50'}`}>
                              {toFa(idx + 1)}
                            </span>
                          )}
                          <div className="relative z-10 flex flex-col h-full justify-end p-4 sm:p-5 min-h-[160px] sm:min-h-[180px]">
                            <h3 className="text-base font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">{s.name}</h3>
                            <p className="text-xs text-white/95 mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">{s.desc}</p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{toFa(s.productsSafe)} محصول · {toFa(Number(s.rating).toFixed(1))}★</span>
                              <span className="text-xs font-semibold text-white underline-offset-2 group-hover:underline drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">مشاهده</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <div className="max-w-7xl mx-auto px-3 sm:px-4 py-5 sm:py-8 w-full flex-1">
                <div className="mb-5 sm:mb-6">
                  <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-white text-right">فروشندگان</h1>
                  <p className="text-xs sm:text-sm text-primary-500 dark:text-white/70 mt-1 text-right">فروشگاه‌های معتبر پیراهن مردانه</p>
                  {/* موبایل: مرتب‌سازی + فیلتر مثل استایل استاندارد */}
                  <div className="sm:hidden flex items-center gap-2 mt-3">
                    {/* RTL: first = right → فیلتر راست */}
                    <button
                      type="button"
                      onClick={() => setSellerFilterSheetOpen(true)}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-medium border ${sellerFilterCountSafe > 0 ? 'bg-primary-800 text-white border-primary-800 dark:bg-[#13ABC4] dark:!text-white dark:border-[#13ABC4]' : 'bg-primary-800 text-white border-primary-800 dark:bg-primary-800 dark:text-white dark:border-primary-800'}`}
                    >
                      <Icon name="sliders" size={14} />
                      فیلتر
                      {sellerFilterCountSafe > 0 && (
                        <span className="w-4 h-4 rounded-full bg-white/25 text-xs flex items-center justify-center">{toFa(sellerFilterCountSafe)}</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSellerSortMenuOpen(true)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-medium border bg-primary-50 dark:bg-primary-900 border-primary-200 dark:border-white/30 text-primary-800 dark:text-white"
                    >
                      مرتب‌سازی
                    </button>
                    {sellerFilterCountSafe > 0 && (
                      <button
                        type="button"
                        onClick={clearSellerListFilters}
                        className="flex-shrink-0 px-3 py-2.5 rounded-full text-xs font-medium border plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium bg-white dark:bg-primary-900"
                      >
                        پاکسازی
                      </button>
                    )}
                  </div>
                  {/* دسکتاپ: چیپ‌های مرتب‌سازی */}
                  <div className="hidden sm:flex flex-wrap justify-start gap-1.5 mt-3" role="group" aria-label="مرتب‌سازی">
                    {sellerSortOptionsSafe.map(({ id, label }) => {
                      const on = sellerListSort === id;

      return (

                        <button
                          key={id}
                          type="button"
                          onClick={() => setSellerListSort(sellerListSort === id ? '' : id)}
                          className={`seller-rank-tab flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition active:scale-[0.97] ${on ? 'seller-rank-tab--active bg-primary-800 text-white border-primary-800 shadow-sm dark:bg-[#13ABC4] dark:!text-white dark:border-[#13ABC4]' : 'bg-white dark:bg-primary-800 plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white font-medium font-medium hover:border-primary-400'}`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-primary-600 dark:!text-white/90 mt-2 text-right font-medium">{toFa(filteredSellersListSafe.length)} فروشنده</p>
                </div>

                {filteredSellersListSafe.length === 0 ? (
                  <div className="text-center py-12 sm:py-16 text-primary-500 dark:!text-white text-sm">
                    <p className="font-medium text-primary-800 dark:text-white mb-1">فروشنده‌ای با این فیلتر یافت نشد</p>
                    {sellerListCitiesSafe.length > 0 && (
                      <p className="text-xs mb-3">در {sellerListCitiesSafe.join('، ')} فروشنده‌ای نیست — شهرهای پرجمعیت را امتحان کنید:</p>
                    )}
                    <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                      {popularCitiesSafe.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => { setSellerListCities([c]); setSellerListMinRating(0); setSellerListMaxResponse(0); setSellerListQuery(''); }}
                          className="px-3 py-1.5 rounded-full text-xs border plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium hover:bg-primary-100 dark:hover:bg-primary-800 transition"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                    <button type="button" onClick={clearSellerListFilters} className="text-apple-blue dark:text-[#13ABC4] underline text-xs">پاک کردن همه فیلترها</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {filteredSellersListSafe.map((s) => (
                      <div
                        key={s.id}
                        className="group text-right bg-white dark:bg-black rounded-2xl border border-primary-100 dark:border-white/20 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
                      >
                        <button type="button" onClick={() => openSeller(s.id)} className="text-right w-full">
                          <div className="relative h-32 sm:h-36 overflow-hidden">
                            <img src={s.banner || s.image} alt="" className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:opacity-95" loading="lazy" decoding="async" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/15" />
                            {s.responseTime && (
                              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/50 text-white text-xs backdrop-blur-sm">
                                پاسخ {s.responseTime}
                              </span>
                            )}
                            {s.lastActive && (
                              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-xs font-medium">
                                {s.lastActive}
                              </span>
                            )}
                          </div>
                          <div className="p-3.5 sm:p-4 flex gap-3 items-start">
                            <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white dark:border-primary-800 shadow -mt-8 relative z-10 flex-shrink-0 bg-primary-100">
                              <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0 flex-1 pt-0.5">
                              <h3 className="font-bold text-sm text-primary-900 dark:text-white truncate">{s.name}</h3>
                              <p className="text-xs text-primary-500 dark:!text-white mt-0.5 line-clamp-1">{s.desc}</p>
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <span className="inline-flex items-center gap-0.5 text-xs text-primary-700 dark:text-white">
                                  <Icon name="starFilled" size={14} className="text-primary-400" />
                                  {toFa(Number(s.rating).toFixed(1))}
                                  <span className="text-primary-400 dark:!text-white">({toFa(s.ratingCount)})</span>
                                </span>
                                <span className="text-xs text-primary-400 dark:!text-white">{toFa(s.productsSafe)} محصول</span>
                                <span className="text-xs text-primary-400 dark:!text-white">{s.city}</span>
                                {s.followers != null && (
                                  <span className="text-xs text-primary-400 dark:!text-white">{toFa(s.followers)} دنبال‌کننده</span>
                                )}
                              </div>
                              {s.badges?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {s.badges.slice(0, 3).map(b => (
                                    <span key={b} className="px-1.5 py-0.5 rounded text-xs bg-primary-50 dark:bg-primary-800 text-primary-600 dark:text-white/80 border border-primary-100 dark:border-white/15">{b}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <Icon name="chevronLeft" size={16} className="text-primary-300 dark:!text-white mt-1 flex-shrink-0 group-hover:text-apple-blue transition" />
                          </div>
                        </button>
                        <div className="px-3.5 sm:px-4 pb-3.5 -mt-1">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleSellerFollow(s.id); }}
                            className={`w-full py-1.5 rounded-full text-xs font-medium border transition ${sellerFollowedSafe[s.id] ? 'border-apple-blue bg-apple-blue/10 text-apple-blue dark:border-[#13ABC4] dark:bg-[#13ABC4]/20 dark:!text-[#7EFAFF]' : 'border-primary-200 dark:border-white/30 bg-white dark:bg-primary-900 text-primary-700 dark:text-white hover:border-apple-blue hover:text-apple-blue dark:hover:border-[#13ABC4]'}`}
                          >
                            {sellerFollowedSafe[s.id] ? 'دنبال‌شده' : 'دنبال کردن'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

    </>
  );
}
