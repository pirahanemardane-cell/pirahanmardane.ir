'use client';

import { useAppApi } from '../AppApiContext';

/** WishlistPageView — code-split from App.jsx */
export default function WishlistPageView() {
  const {
    Icon,
    addToCart,
    blogPosts,
    clearFavorites,
    closeWishlistPage,
    dark,
    favorites,
    likedBlogs,
    openPDP,
    openPLP,
    openStaticPage,
    pdpProduct,
    products,
    removeFavoritesBulk,
    setWishlistClearConfirm,
    setWishlistFilter,
    setWishlistSelected,
    setWishlistSort,
    setWishlistView,
    showAdminPanel,
    showComparePage,
    showProfilePage,
    showSellerPanel,
    showWishlistPage,
    toFa,
    toggleBlogLike,
    toggleFavorite,
    wishlistClearConfirm,
    wishlistFilter,
    wishlistProducts,
    wishlistSelected,
    wishlistSort,
    wishlistView
  } = useAppApi();

  return (
    <>
          {showWishlistPage && !pdpProduct && !showComparePage && !showProfilePage && !showSellerPanel && !showAdminPanel && (
            <div className="w-full flex-1 flex flex-col bg-primary-50 dark:bg-primary-950">
            <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10 flex-1">
            <div className="rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 p-4 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-white">علاقه‌مندی‌ها {(favorites.length + likedBlogs.length) > 0 && <span className="text-sm font-medium text-primary-500 dark:!text-white">({toFa(favorites.length + likedBlogs.length)})</span>}</h1>
                  {(likedBlogs.length > 0) && <p className="text-xs text-primary-500 dark:text-white/60 mt-1">{toFa(likedBlogs.length)} مطلب بلاگ لایک‌شده</p>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select value={wishlistSort || ''} onChange={(e) => setWishlistSort(e.target.value)} className="wishlist-toolbar-select text-xs px-2 py-1.5 rounded-lg border border-primary-200 dark:border-white/30 bg-white dark:bg-primary-900 text-primary-800 dark:text-white">
                    <option value="newest">جدیدترین</option>
                    <option value="oldest">قدیمی‌ترین</option>
                    <option value="priceAsc">ارزان‌ترین</option>
                    <option value="priceDesc">گران‌ترین</option>
                    <option value="discount">بیشترین تخفیف</option>
                    <option value="name">نام</option>
                  </select>
                  <select value={wishlistFilter || ''} onChange={(e) => setWishlistFilter(e.target.value)} className="wishlist-toolbar-select text-xs px-2 py-1.5 rounded-lg border border-primary-200 dark:border-white/30 bg-white dark:bg-primary-900 text-primary-800 dark:text-white">
                    <option value="all">همه</option>
                    <option value="inStock">موجود</option>
                    <option value="outStock">ناموجود</option>
                    <option value="sale">تخفیف‌دار</option>
                  </select>
                  <div className="flex rounded-lg border border-primary-200 dark:border-white/30 overflow-hidden">
                    <button type="button" onClick={() => setWishlistView('list')} className={`wishlist-view-btn px-3 py-1.5 text-xs rounded-full border ${wishlistView === 'list' ? 'wishlist-view-btn--on bg-white !text-[#0A0A0A] border-white font-bold' : 'border-primary-200 dark:border-white/30 text-primary-600 dark:!text-white/80 bg-transparent'}`}>لیست</button>
                    <button type="button" onClick={() => setWishlistView('grid')} className={`wishlist-view-btn px-3 py-1.5 text-xs rounded-full border ${wishlistView === 'grid' ? 'wishlist-view-btn--on bg-white !text-[#0A0A0A] border-white font-bold' : 'border-primary-200 dark:border-white/30 text-primary-600 dark:!text-white/80 bg-transparent'}`}>شبکه</button>
                  </div>
                  {favorites.length > 0 && (
                    wishlistClearConfirm ? (
                      <div className="flex gap-1">
                        <button type="button" onClick={clearFavorites} className="text-xs px-2.5 py-1.5 rounded-full bg-red-500 text-white">تأیید حذف</button>
                        <button type="button" onClick={() => setWishlistClearConfirm(false)} className="text-xs px-2.5 py-1.5 rounded-full border border-primary-200 dark:border-white/30">لغو</button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setWishlistClearConfirm(true)} className="text-xs text-primary-500 hover:text-red-500">حذف همه</button>
                    )
                  )}
                </div>
              </div>

              {wishlistSelected.length > 0 && (
                <div className="mb-4 flex flex-wrap items-center gap-2 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/40 border border-primary-100 dark:border-white/10">
                  <span className="text-xs text-primary-700 dark:text-white">{toFa(wishlistSelected.length)} مورد انتخاب شده</span>
                  <button type="button" onClick={() => {
                    wishlistSelected.forEach(id => {
                      const p = products.find(x => x.id === id);
                      if (p) addToCart(p);
                    });
                    setWishlistSelected([]);
                  }} className="text-xs px-3 py-1.5 rounded-full bg-apple-blue text-white font-medium">افزودن به سبد</button>
                  <button type="button" onClick={() => removeFavoritesBulk(wishlistSelected)} className="text-xs px-3 py-1.5 rounded-full border border-red-300 text-red-500">حذف</button>
                  <button type="button" onClick={() => setWishlistSelected([])} className="text-xs text-primary-500">لغو انتخاب</button>
                </div>
              )}

              {wishlistProducts.length === 0 ? (
                <div className="text-center py-20 px-4 rounded-2xl border border-primary-200 dark:border-white/20 bg-primary-50/40 dark:bg-primary-900/30">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white dark:bg-primary-900 flex items-center justify-center text-primary-400 shadow-sm">
                    <Icon name="heart" size={32} />
                  </div>
                  <p className="text-primary-900 dark:text-white font-bold text-base mb-2">هنوز چیزی را لایک نکرده‌اید</p>
                  <p className="text-primary-500 dark:!text-white text-sm mb-6 max-w-sm mx-auto">کالاهای مورد علاقه‌تان را با زدن قلب لایک کنید تا بعداً راحت پیدا کنید.</p>
                  <button type="button" onClick={() => { closeWishlistPage(); openPLP(); }} className="px-6 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium">مشاهده محصولات</button>
                  <div className="mt-10 text-right">
                    <p className="text-base sm:text-lg font-bold text-primary-800 dark:!text-white mb-3">پیشنهاد برای شما</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {products.slice(0, 4).map(p => (
                        <button key={p.id} type="button" onClick={() => { closeWishlistPage(); openPDP(p); }} className="text-right rounded-xl border border-primary-200 dark:border-white/20 p-2 bg-white dark:bg-primary-900 hover:border-apple-blue transition">
                          <img src={p.colors?.[0]?.image || p.image} alt="" className="w-full h-24 object-cover rounded-lg mb-2" loading="lazy" referrerPolicy="no-referrer" />
                          <p className="text-xs font-medium text-primary-900 dark:text-white line-clamp-2">{p.name}</p>
                          <p className="text-xs font-bold mt-1 text-primary-700 dark:text-white">{p.priceText}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className="wishlist-two-col w-full"
                    style={{ display: 'flex', flexDirection: 'row-reverse', flexWrap: 'wrap', alignItems: 'flex-start', gap: '1.5rem', width: '100%' }}
                  >
                    {/* ستون راست: محصولات لایک‌شده */}
                    <div className="wishlist-col-products space-y-3 min-w-0" style={{ flex: '1 1 300px', minWidth: '280px', maxWidth: '100%' }}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-base font-bold text-primary-900 dark:text-white">محصولات لایک‌شده ({toFa(wishlistProducts.length)})</h2>
                        <button type="button" onClick={() => {
                          const ids = wishlistProducts.filter(p => !p.missing && p.stock !== 0).map(p => p.id);
                          ids.forEach(id => { const p = products.find(x => x.id === id); if (p) addToCart(p); });
                        }} className="text-xs px-3 py-1.5 rounded-full bg-apple-blue text-white font-medium">افزودن همه موجودها به سبد</button>
                      </div>
                      <div className={wishlistView === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'space-y-3'}>
                    {wishlistProducts.map((p) => {
                      const priceDropped = !p.missing && p.priceAtAdd && p.price < p.priceAtAdd;
                      const checked = wishlistSelected.includes(p.id);
                      if (p.missing) {
                        return (
                          <div key={`miss-${p.id}`} className="flex gap-3 p-3 rounded-2xl border border-red-200 dark:border-red-500/30 bg-red-50/50 dark:bg-red-950/20">
                            <div className="w-20 h-24 rounded-xl bg-primary-100 dark:bg-primary-800 flex items-center justify-center text-primary-400 text-xs">حذف شده</div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-primary-800 dark:text-white">این کالا دیگر عرضه نمی‌شود</p>
                              <button type="button" onClick={() => toggleFavorite(p.id)} className="mt-2 text-xs text-red-500">حذف از لیست</button>
                            </div>
                          </div>
                        );
                      }
                      const lowStock = p.stock != null && p.stock > 0 && p.stock <= 3;
                      const out = p.stock === 0;
                      return (
                        <div key={p.id} className={`relative rounded-2xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 p-3 ${wishlistView === 'list' ? 'flex gap-3' : ''}`}>
                          <label className="absolute top-2 right-2 z-10">
                            <input type="checkbox" checked={checked} onChange={() => setWishlistSelected(prev => checked ? prev.filter(x => x !== p.id) : [...prev, p.id])} className="w-4 h-4 accent-[var(--apple-blue,#0071e3)]" />
                          </label>
                          <button type="button" className={`flex-shrink-0 p-0 border-0 bg-transparent ${wishlistView === 'grid' ? 'w-full' : ''}`} onClick={() => { closeWishlistPage(); openPDP(p); }}>
                            <img src={p.colors?.[0]?.image || p.image} alt={p.name} className={`object-cover rounded-xl ${wishlistView === 'grid' ? 'w-full h-36' : 'w-20 h-24 sm:w-24 sm:h-28'}`} loading="lazy" referrerPolicy="no-referrer" />
                          </button>
                          <div className={`flex-1 min-w-0 ${wishlistView === 'grid' ? 'mt-2' : ''}`}>
                            <button type="button" className="text-right w-full p-0 border-0 bg-transparent" onClick={() => { closeWishlistPage(); openPDP(p); }}>
                              <h2 className="buyer-product-name font-bold text-base text-primary-900 dark:!text-white line-clamp-2">{p.name}</h2>
                            </button>
                            <p className="text-xs text-primary-500 dark:!text-white mt-1">{p.seller?.name || 'فروشگاه مرکزی'} · {p.rating ? `${toFa(Number(p.rating).toFixed(1))}★` : ''} {p.reviews ? `(${toFa(p.reviews)})` : ''}</p>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {out && <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300">ناموجود</span>}
                              {lowStock && <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">کم‌موجود</span>}
                              {!out && !lowStock && <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">موجود</span>}
                              {priceDropped && <span className="text-xs px-1.5 py-0.5 rounded bg-apple-blue/10 text-apple-blue font-medium">قیمت کاهش یافت</span>}
                              {p.discount > 0 && <span className="text-xs px-1.5 py-0.5 rounded bg-apple-blue text-white font-bold">{toFa(p.discount)}٪</span>}
                            </div>
                            <div className="flex items-baseline gap-2 mt-1.5">
                              <span className="buyer-product-price font-bold text-primary-900 dark:!text-white text-sm">{p.priceText} <span className="dark:!text-white">تومان</span></span>
                              {p.oldPrice && <span className="text-xs text-primary-400 line-through">{p.oldPrice}</span>}
                            </div>
                            {p.colors?.length > 0 && (
                              <div className="flex gap-1 mt-1.5">
                                {p.colors.slice(0, 5).map(c => (
                                  <span key={c.name} title={c.name} className="color-swatch w-3.5 h-3.5 rounded-full border border-primary-300 dark:border-white/60" style={{ ["--swatch-color"]: c.hex || '#888', backgroundColor: c.hex || '#888' }} />
                                ))}
                              </div>
                            )}
                            <div className={`flex flex-wrap justify-start gap-2 mt-2 ${wishlistView === 'grid' ? '' : 'mt-auto pt-1'}`} dir="rtl">
                              {!out ? (
                                <button type="button" onClick={() => addToCart(p)} className="text-xs px-3 py-1.5 rounded-full bg-apple-blue text-white font-medium">افزودن به سبد</button>
                              ) : (
                                <button type="button" className="text-xs px-3 py-1.5 rounded-full border border-primary-200 dark:border-white/30 text-primary-600 dark:text-white">خبرم کن وقتی موجود شد</button>
                              )}
                              <button type="button" onClick={() => toggleFavorite(p.id)} className="text-xs px-2.5 py-1.5 rounded-full border border-primary-200 dark:border-white/30 text-primary-600 dark:text-white inline-flex items-center gap-1">
                                <Icon name="heartFilled" size={14} /> حذف
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                    </div>

                    {/* ستون چپ: بلاگ‌های لایک‌شده */}
                    <div className="wishlist-col-blogs space-y-3 min-w-0" style={{ flex: '1 1 300px', minWidth: '280px', maxWidth: '100%' }}>
                      <h2 className="text-base font-bold text-primary-900 dark:text-white">بلاگ‌های لایک‌شده ({toFa(likedBlogs.length)})</h2>
                      {likedBlogs.length === 0 ? (
                        <div className="text-center py-10 px-3 rounded-2xl border border-dashed border-primary-200 dark:border-white/20 bg-primary-50/40 dark:bg-primary-900/30">
                          <p className="text-sm text-primary-500 dark:text-white/70">هنوز مطلب بلاگی لایک نکرده‌اید</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {likedBlogs.map(lb => {
                            const post = blogPosts.find(p => String(p.id) === String(lb.id));
                            if (!post) return (
                              <div key={lb.id} className="flex gap-3 p-3 rounded-xl border border-primary-100 dark:border-white/10 bg-primary-50/40 dark:bg-primary-900/30">
                                <div className="flex-1 min-w-0 text-right">
                                  <p className="text-xs font-medium text-primary-900 dark:text-white">{lb.title || 'مطلب حذف‌شده'}</p>
                                  <button type="button" onClick={() => toggleBlogLike(lb.id)} className="mt-1 text-xs text-red-500">حذف لایک</button>
                                </div>
                              </div>
                            );
                            return (
                              <div key={post.id} className="flex gap-3 p-3 rounded-xl border border-primary-100 dark:border-white/10 bg-primary-50/40 dark:bg-primary-900/30">
                                <button type="button" onClick={() => openStaticPage('blog-post', { blogId: post.id })} className="flex-shrink-0">
                                  <img src={post.image} alt="" className="w-20 h-16 object-cover rounded-lg" />
                                </button>
                                <div className="flex-1 min-w-0 text-right">
                                  <button type="button" onClick={() => openStaticPage('blog-post', { blogId: post.id })} className="w-full text-right">
                                    <p className="text-xs font-medium text-primary-900 dark:text-white line-clamp-2">{post.title}</p>
                                    <p className="text-xs text-primary-500 dark:text-white/60 mt-0.5">{post.cat} · {post.date}</p>
                                  </button>
                                  <button type="button" onClick={() => toggleBlogLike(post.id)} className="mt-1 text-xs text-red-500">حذف لایک</button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            </div>
            </div>
          )}

          {/* ===================== صفحه اخیراً دیده‌شده (بدون لنگر) ===================== */}
    </>
  );
}
