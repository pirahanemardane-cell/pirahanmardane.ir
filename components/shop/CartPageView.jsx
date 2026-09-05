'use client';

import { useAppApi } from '../AppApiContext';

/** CartPageView — code-split from App.jsx */
export default function CartPageView() {
  const {
    Icon,
    OWN_SELLER,
    addToCart,
    applyCoupon,
    cart,
    cartCount,
    cartItemKey,
    cartItemLoading,
    changeCartColor,
    clearCart,
    clearCartConfirm,
    closeCartPage,
    couponApplied,
    couponInput,
    couponMsg,
    dark,
    formatPrice,
    openCheckout,
    openPDP,
    openPLP,
    openStaticPage,
    pdpProduct,
    products,
    removeCoupon,
    removeFromCart,
    setClearCartConfirm,
    setCouponInput,
    setCouponMsg,
    showAdminPanel,
    showCartPage,
    showCheckout,
    showComparePage,
    showProfilePage,
    showRecentPage,
    showSellerPanel,
    showWishlistPage,
    toFa,
    updateQty
  } = useAppApi();

  return (
    <>
          {showCartPage && !showRecentPage && !showCheckout && !pdpProduct && !showWishlistPage && !showComparePage && !showProfilePage && !showSellerPanel && !showAdminPanel && (
            <div className="cart-page-shell w-full flex-1 flex flex-col bg-primary-50 dark:bg-primary-950">
            <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10 flex-1">
            <div className="cart-page-inner p-0 sm:p-0 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:!text-white">سبد خرید {cartCount > 0 && <span className="text-sm font-medium dark:!text-white">({toFa(cartCount)} کالا)</span>}</h1>
                </div>
                {cart.length > 0 && (
                  clearCartConfirm ? (
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={clearCart} className="btn-cta text-xs px-3 py-1.5 rounded-full bg-red-500 text-white font-medium">تأیید حذف همه</button>
                      <button type="button" onClick={() => setClearCartConfirm(false)} className="text-xs px-3 py-1.5 rounded-full border border-primary-200 dark:border-white/30 text-primary-600 dark:text-white">لغو</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setClearCartConfirm(true)} className="text-xs text-primary-500 dark:!text-white hover:text-red-500 transition">حذف همه</button>
                  )
                )}
              </div>

              {cart.length === 0 ? (
                <div className="space-y-8">
                <div className="text-center py-16 px-4 rounded-2xl border border-primary-200 dark:border-white/20 bg-primary-50/40 dark:bg-primary-900/30">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white dark:bg-primary-900 flex items-center justify-center text-primary-400 shadow-sm">
                    <Icon name="shoppingBag" size={32} />
                  </div>
                  <p className="text-primary-900 dark:text-white font-bold text-base mb-2">سبد خرید شما خالی است</p>
                  <p className="text-primary-500 dark:!text-white text-sm mb-6 max-w-sm mx-auto">هنوز کالایی اضافه نکرده‌اید. از فروشگاه دیدن کنید و اولین پیراهن را انتخاب کنید.</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button type="button" onClick={() => { closeCartPage(); openPLP(); }} className="px-6 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium hover:opacity-90 transition">مشاهده فروشگاه</button>
                    <button type="button" onClick={() => { closeCartPage(); openStaticPage('deals'); }} className="px-6 py-2.5 rounded-full border border-primary-200 dark:border-white/30 text-sm font-medium text-primary-800 dark:text-white hover:bg-primary-50 dark:hover:bg-primary-800 transition">پرفروش / تخفیف</button>
                  </div>
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-primary-800 dark:!text-white mb-3">پیشنهاد برای شما</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {products.slice(0, 8).map(p => (
                      <button key={p.id} type="button" onClick={() => { closeCartPage(); openPDP(p); }} className="text-right rounded-xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 overflow-hidden hover:border-apple-blue/40 transition">
                        <img src={p.colors?.[0]?.image || p.image} alt="" className="aspect-[4/5] w-full object-cover" loading="lazy" />
                        <div className="p-2"><p className="text-xs font-medium line-clamp-2 text-primary-900 dark:text-white">{p.name}</p></div>
                      </button>
                    ))}
                  </div>
                </div>
                </div>
              ) : (
                <>
                <div
                  className="cart-grid"
                  style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '1.5rem', width: '100%' }}
                >
                  {/* Items — گروه‌بندی بر اساس فروشنده */}
                  <div className="cart-items-col space-y-4 min-w-0" style={{ flex: '1 1 420px', minWidth: 'min(100%, 280px)' }}>
                    {Object.entries(cart.reduce((acc, item) => {
                      const product = products.find(pr => pr.id === item.id);
                      const sellerName = product?.seller?.name || item.seller?.name || 'فروشگاه مرکزی';
                      if (!acc[sellerName]) acc[sellerName] = [];
                      acc[sellerName].push(item);
                      return acc;
                    }, {})).map(([sellerName, items]) => (
                      <div key={sellerName} className="space-y-2">
                        <p className="text-xs font-bold text-primary-600 dark:text-white/70 px-1 flex items-center gap-1.5">
                          <Icon name="package" size={14} /> فروشنده: {sellerName}
                        </p>
                    {items.map((item) => {
                      const product = products.find(pr => pr.id === item.id);
                      const availableColors = product?.colors || (item.selectedColor ? [item.selectedColor] : []);
                      const seller = product?.seller || item.seller || OWN_SELLER;
                      const key = cartItemKey(item.id, item.selectedColor?.name, item.selectedSize);
                      const loading = !!cartItemLoading[key];
                      const stockLeft = product?.stock ?? (item.id % 3 === 0 ? 2 : null);
                      const lineTotal = item.price * item.qty;
                      return (
                        <div key={`${item.id}-${item.selectedColor?.name || ''}-${item.selectedSize || ''}-page`} className={`flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 ${loading ? 'opacity-60 pointer-events-none' : ''}`}>
                          <button type="button" className="flex-shrink-0 p-0 border-0 bg-transparent" onClick={() => { closeCartPage(); openPDP(product || item); }}>
                            <img src={item.selectedColor?.image || item.image} alt={item.name} className="w-20 h-24 sm:w-24 sm:h-28 object-cover rounded-xl shadow-sm" loading="lazy" referrerPolicy="no-referrer" />
                          </button>
                          <div className="flex-1 min-w-0 flex flex-col">
                            <button type="button" className="text-right p-0 border-0 bg-transparent" onClick={() => { closeCartPage(); openPDP(product || item); }}>
                              <h2 className="font-bold text-sm sm:text-base text-primary-900 dark:text-white line-clamp-2">{item.name}</h2>
                              {item.productCode && <p className="text-xs text-primary-400 dark:text-white/50 font-latin mt-0.5" dir="ltr">{item.productCode}</p>}
                            </button>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              <span className="text-xs px-1.5 py-0.5 rounded-md bg-primary-50 dark:bg-primary-800 text-primary-600 dark:text-white border border-primary-100 dark:border-white/20">فروشنده: {seller.name}</span>
                              {item.selectedSize && <span className="latin-label text-xs px-1.5 py-0.5 rounded-md bg-primary-50 dark:bg-primary-800 text-primary-600 dark:text-white border border-primary-100 dark:border-white/20">سایز {item.selectedSize}</span>}
                              {item.selectedColor?.name && <span className="text-xs px-1.5 py-0.5 rounded-md bg-primary-50 dark:bg-primary-800 text-primary-600 dark:text-white border border-primary-100 dark:border-white/20">رنگ {item.selectedColor.name}</span>}
                            </div>
                            {availableColors.length > 1 && (
                              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                {availableColors.map((c) => (
                                  <button key={c.name} type="button" onClick={() => changeCartColor(item.id, item.selectedColor?.name, c)} title={c.name}
                                    className={`p-0.5 rounded-full border-2 transition ${item.selectedColor?.name === c.name ? 'border-primary-800 dark:border-white' : 'border-primary-200 dark:border-primary-600'}`}>
                                    <span className="color-swatch block w-3.5 h-3.5 rounded-full border border-primary-300 dark:border-white/70" style={{ ["--swatch-color"]: c.hex || "#888", backgroundColor: c.hex || "#888" }} />
                                  </button>
                                ))}
                              </div>
                            )}
                            {stockLeft != null && stockLeft <= 3 && (
                              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 font-medium">فقط {toFa(stockLeft)} عدد باقی مانده</p>
                            )}
                            <div className="mt-auto pt-2 flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-baseline gap-2">
                                <span className="font-bold text-primary-900 dark:text-white text-base">{formatPrice(lineTotal)} تومان</span>
                                {item.discount ? (
                                  <span className="text-xs font-bold text-apple-blue bg-apple-blue/10 px-1.5 py-0.5 rounded">{toFa(item.discount)}٪</span>
                                ) : null}
                              </div>
                              <div className="flex items-center gap-2">
                                <button type="button" onClick={() => updateQty(item.id, item.selectedColor?.name, -1, item.selectedSize)} className="w-8 h-8 rounded-full border border-primary-200 dark:border-white/50 flex items-center justify-center text-primary-900 dark:text-white hover:bg-primary-50 dark:hover:bg-primary-800" aria-label="کاهش"><Icon name="minus" size={14} /></button>
                                <span className="w-6 text-center text-sm font-medium text-primary-900 dark:text-white">{toFa(item.qty)}</span>
                                <button type="button" onClick={() => updateQty(item.id, item.selectedColor?.name, 1, item.selectedSize)} className="w-8 h-8 rounded-full border border-primary-200 dark:border-white/50 flex items-center justify-center text-primary-900 dark:text-white hover:bg-primary-50 dark:hover:bg-primary-800" aria-label="افزایش"><Icon name="plus" size={14} /></button>
                                <button type="button" onClick={() => removeFromCart(item.id, item.selectedColor?.name, item.selectedSize)} className="p-2 rounded-full text-primary-500 hover:bg-red-50 dark:hover:bg-primary-800 hover:text-red-500 transition" aria-label="حذف"><Icon name="trash" size={16} /></button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                      </div>
                    ))}


                    {/* Upsell on page */}
                    {cartUpsell.length > 0 && (
                      <div className="mt-4 p-4 rounded-2xl border border-primary-200 dark:border-white/20 bg-primary-50/30 dark:bg-primary-900/20">
                        <p className="text-sm font-bold text-primary-900 dark:text-white mb-3">تکمیل استایل شما</p>
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                          {cartUpsell.map((p) => (
                            <div key={`upsell-${p.id}`} className="flex-shrink-0 w-[140px] rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 p-2.5">
                              <img src={p.colors?.[0]?.image || p.image} alt="" className="w-full h-20 object-cover rounded-lg mb-2" loading="lazy" referrerPolicy="no-referrer" />
                              <p className="text-xs font-medium text-primary-900 dark:text-white line-clamp-2 mb-1">{p.name}</p>
                              <p className="text-xs font-bold text-primary-700 dark:text-white mb-2">{p.priceText}</p>
                              <button type="button" onClick={() => addToCart(p)} className="w-full text-xs py-1.5 rounded-full bg-apple-blue text-white font-medium">افزودن</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Summary sidebar — sticky on desktop */}
                  <aside
                    className="order-summary-col"
                    style={{
                      flex: '0 0 320px',
                      width: '320px',
                      maxWidth: '100%',
                      position: 'sticky',
                      top: '7.5rem',
                      alignSelf: 'flex-start',
                      zIndex: 40,
                    }}
                  >
                    <div className="order-summary-sticky space-y-4 p-4 sm:p-5 rounded-2xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 shadow-sm">
                      <h3 className="font-bold text-primary-900 dark:text-white text-base">خلاصه سفارش</h3>

                      <div>
                        <p className="text-xs font-bold text-primary-700 dark:text-white mb-2">کد تخفیف و هدایا</p>
                        {couponApplied ? (
                          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-apple-blue/30 bg-apple-blue/5">
                            <span className="text-xs font-bold text-apple-blue">{couponApplied.code}</span>
                            <button type="button" onClick={removeCoupon} className="text-xs text-primary-500 hover:text-red-500">حذف</button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <input type="text" value={couponInput} onChange={(e) => { setCouponInput(e.target.value); setCouponMsg(null); }} onKeyDown={(e) => { if (e.key === 'Enter') applyCoupon(); }} placeholder="کد تخفیف یا هدیه" className="coupon-input flex-1 min-w-0 px-3 py-2 rounded-xl border border-primary-200 dark:border-white/40 bg-white dark:bg-[#1A1C20] text-sm !text-primary-900 dark:!text-white placeholder:!text-primary-500 dark:placeholder:!text-white/70 outline-none focus:border-apple-blue" />
                            <button type="button" onClick={applyCoupon} className="coupon-apply-btn px-3 py-2 rounded-xl bg-primary-800 dark:bg-white text-white dark:!text-[#0A0A0A] text-xs font-bold">اعمال</button>
                          </div>
                        )}
                        {couponMsg && <p className={`text-xs mt-1.5 ${couponMsg.type === 'ok' ? 'text-apple-blue' : 'text-red-500'}`}>{couponMsg.text}</p>}
                      </div>

                      <div className="space-y-2 text-sm border-t border-primary-100 dark:border-white/10 pt-3">
                        <div className="flex justify-between"><span className="text-primary-600 dark:text-white/70">جمع جزء</span><span className="text-primary-900 dark:text-white font-medium">{formatPrice(cartSubtotal)} تومان</span></div>
                        {couponDiscount > 0 && (
                          <div className="flex justify-between"><span className="text-apple-blue">تخفیف کد</span><span className="text-apple-blue font-medium">−{formatPrice(couponDiscount)} تومان</span></div>
                        )}
                        <div className="flex justify-between"><span className="text-primary-600 dark:text-white/70">مالیات (۹٪)</span><span className="text-primary-900 dark:text-white font-medium">{formatPrice(cartTax)} تومان</span></div>
                        {(cartProductSavings > 0 || couponDiscount > 0) && (
                          <p className="text-xs text-apple-blue font-medium">شما {formatPrice(cartProductSavings + couponDiscount)} تومان سود کردید</p>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-primary-100 dark:border-white/10">
                          <span className="font-bold text-primary-900 dark:text-white">قابل پرداخت</span>
                          <span className="font-bold text-lg text-primary-900 dark:text-white">{formatPrice(cartTotal)} تومان</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button type="button" onClick={() => { closeCartPage(); openPLP(); }} className="px-4 py-2 rounded-full text-sm font-medium border border-primary-200 dark:border-white/30 text-primary-800 dark:text-white hover:bg-primary-50 dark:hover:bg-primary-800 transition">
                          ادامه خرید
                        </button>
                        <button type="button" onClick={openCheckout} className="btn-cta px-5 py-2.5 rounded-full bg-apple-blue text-white text-sm font-bold hover:opacity-90 active:scale-[0.98] transition shadow-md">
                          ادامه و پرداخت
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-1">
                        {[{ icon: 'shield', t: 'پرداخت امن' }, { icon: 'refresh', t: '۷ روز بازگشت' }, { icon: 'badge', t: 'ضمانت اصالت' }].map((x) => (
                          <div key={x.t} className="flex flex-col items-center gap-1.5 text-center">
                            <span className="trust-icon-wrap inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-800 border border-primary-200 dark:border-white/30">
                              <Icon name={x.icon} size={16} className="text-apple-blue dark:text-[#13ABC4]" />
                            </span>
                            <span className="text-xs font-medium text-primary-700 dark:!text-white leading-tight">{x.t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </aside>
                </div>

                {/* Mobile sticky pay */}
                <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 p-3 bg-white/95 dark:bg-primary-950/95 backdrop-blur-xl border-t border-primary-200 dark:border-white/15">
                  <div className="max-w-7xl mx-auto flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-primary-500 dark:text-white/60">قابل پرداخت</p>
                      <p className="text-base font-bold text-primary-900 dark:text-white">{formatPrice(cartTotal)} تومان</p>
                    </div>
                    <button type="button" onClick={openCheckout} className="btn-cta px-5 py-2.5 rounded-full bg-apple-blue text-white text-sm font-bold shadow-md">ادامه و پرداخت</button>
                  </div>
                </div>
                </>
              )}
            </div>
            </div>
            </div>
          )}

          {/* ========== Checkout Page ========== */}
    </>
  );
}
