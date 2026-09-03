'use client';

import { useAppApi } from '../AppApiContext';

/** RecentPageView — code-split from App.jsx */
export default function RecentPageView() {
  const {
    Icon,
    closeRecentPage,
    dark,
    openPDP,
    openPLP,
    pdpProduct,
    recentlyViewed,
    setRecentlyViewed,
    showAdminPanel,
    showCartPage,
    showComparePage,
    showProfilePage,
    showRecentPage,
    showSellerPanel,
    showWishlistPage,
    toFa
  } = useAppApi();

  return (
    <>
          {showRecentPage && !showCartPage && !pdpProduct && !showWishlistPage && !showComparePage && !showProfilePage && !showSellerPanel && !showAdminPanel && (
            <div className="w-full flex-1 flex flex-col bg-primary-50 dark:bg-primary-950">
              <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10 flex-1">
              <div className="rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 p-4 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-start gap-3 mb-6 w-full" dir="rtl">
                  <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-white">
                    اخیراً دیده‌شده
                    {recentlyViewed.length > 0 && (
                      <span className="text-sm font-medium text-primary-500 dark:!text-white ms-2">({toFa(recentlyViewed.length)})</span>
                    )}
                  </h1>
                  {recentlyViewed.length > 0 && (
                    <button
                      type="button"
                      onClick={() => { setRecentlyViewed([]); /* session only */ }}
                      className="text-xs font-medium text-primary-500 dark:!text-white hover:text-red-500 transition"
                    >
                      پاک کردن تاریخچه
                    </button>
                  )}
                </div>
                {recentlyViewed.length === 0 ? (
                  <div className="text-center py-20 px-4 rounded-2xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-50 dark:bg-primary-900 flex items-center justify-center text-primary-400">
                      <Icon name="eye" size={28} />
                    </div>
                    <p className="font-bold text-primary-900 dark:text-white mb-2">هنوز محصولی ندیده‌اید</p>
                    <p className="text-sm text-primary-500 dark:!text-white mb-6">با مرور فروشگاه، محصولات اینجا نمایش داده می‌شوند</p>
                    <button type="button" onClick={() => { closeRecentPage(); openPLP(); }} className="px-6 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium">مشاهده فروشگاه</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {recentlyViewed.map((p) => (
                      <div key={p.id} className="rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 overflow-hidden">
                        <button type="button" onClick={() => openPDP(p)} className="w-full text-right">
                          <div className="aspect-[4/5] bg-primary-50 dark:bg-primary-900 overflow-hidden">
                            <img src={p.colors?.[0]?.image || p.image} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                          <div className="p-3">
                            <p className="text-sm sm:text-base font-semibold text-primary-900 dark:!text-white line-clamp-2">{p.name}</p>
                            <p className="text-sm sm:text-base font-bold text-apple-blue dark:!text-white mt-1">{p.priceText} <span className="dark:!text-white">تومان</span></p>
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              </div>
            </div>
          )}

          {/* ===================== صفحه سبد خرید ===================== */}
    </>
  );
}
