'use client';

import { useAppApi } from '../AppApiContext';

/** CheckoutView — استخراج از App.jsx برای code-split (رفتار یکسان) */
export default function CheckoutView() {
  const {
    Icon,
    Textarea,
    addresses,
    applyCoupon,
    cart,
    checkoutContact,
    checkoutErrors,
    checkoutNewAddress,
    checkoutNote,
    checkoutPaymentMethod,
    checkoutPlacing,
    checkoutSelectedAddressId,
    checkoutShippingMethod,
    checkoutStep,
    checkoutUseNewAddress,
    closeCheckout,
    confirmPaymentFail,
    confirmPaymentSuccess,
    couponApplied,
    couponInput,
    couponMsg,
    dark,
    formatPrice,
    getCheckoutTotals,
    getShippingOptions,
    onlyDigits,
    openAuth,
    openCartPage,
    openPLP,
    openStaticPage,
    orderFailed,
    orderSuccess,
    orders,
    pdpProduct,
    pendingPayOrder,
    placeOrder,
    printOrderInvoice,
    removeCoupon,
    sellerUser,
    setCheckoutContact,
    setCheckoutNewAddress,
    setCheckoutNote,
    setCheckoutPaymentMethod,
    setCheckoutSelectedAddressId,
    setCheckoutShippingMethod,
    setCheckoutStep,
    setCheckoutUseNewAddress,
    setCouponInput,
    setOrderDetailId,
    setOrderFailed,
    setPendingPayOrder,
    setProfileTab,
    setShowProfilePage,
    showAdminPanel,
    showCheckout,
    showProfilePage,
    showSellerPanel,
    showToast,
    toFa,
    user
  } = useAppApi();

  return (
    <>
          {showCheckout && !pdpProduct && !showProfilePage && !showSellerPanel && !showAdminPanel && (
            <div className="checkout-page-shell w-full flex-1 flex flex-col bg-primary-50 dark:bg-primary-950 overflow-visible">
              <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10 flex-1 overflow-visible">
                {orderSuccess ? (
                  /* Order Success */
                  <div className="max-w-lg mx-auto text-center py-10 px-4 rounded-2xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 flex items-center justify-center">
                      <Icon name="checkCircle" size={32} />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-white mb-2">پرداخت موفق</h1>
                    <p className="text-sm text-primary-500 dark:!text-white mb-1">سفارش ثبت شد · آماده‌سازی حدود ۱–۲ روز کاری</p>
                    <div className="flex items-center justify-center gap-2 my-4 px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/25 bg-primary-50 dark:bg-[#2A2C30] max-w-md mx-auto">
                      <span className="text-sm text-primary-600 dark:text-white/80 shrink-0">شماره سفارش:</span>
                      <code className="text-sm font-bold text-primary-900 dark:text-white tracking-wide" dir="ltr">{orderSuccess.id}</code>
                      <button type="button" onClick={() => { try { navigator.clipboard.writeText(orderSuccess.id); showToast({ title: 'کپی شد', message: 'شماره سفارش در کلیپ‌بورد قرار گرفت', type: 'success' }); } catch (_) {} }} className="p-1.5 rounded-lg text-primary-700 dark:text-white/90 hover:bg-primary-100 dark:hover:bg-white/10 transition shrink-0" title="کپی">
                        <Icon name="copy" size={14} />
                      </button>
                    </div>
                    <p className="text-base font-bold text-primary-900 dark:text-white mb-1">{formatPrice(orderSuccess.total || orderSuccess.totals?.payable || 0)} تومان</p>
                    <p className="text-xs text-primary-500 dark:!text-white mb-4">
                      {orderSuccess.shipping?.method} — {orderSuccess.shipping?.address?.slice?.(0, 60)}{(orderSuccess.shipping?.address?.length || 0) > 60 ? '…' : ''}
                    </p>
                    {orderSuccess.items?.length > 0 && (
                      <ul className="text-right text-xs space-y-1.5 mb-4 max-w-xs mx-auto text-primary-600 dark:text-white/70">
                        {orderSuccess.items.map((it, idx) => (
                          <li key={idx} className="flex justify-between gap-2"><span className="truncate">{it.name}</span><span>×{toFa(it.qty)}</span></li>
                        ))}
                      </ul>
                    )}
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <button type="button" onClick={() => printOrderInvoice(orderSuccess)} className="px-6 py-2.5 rounded-full border border-primary-200 dark:border-white/30 text-primary-800 dark:text-white text-sm font-medium hover:bg-primary-50 dark:hover:bg-primary-800 transition inline-flex items-center gap-1.5"><Icon name="printer" size={16} /> چاپ فاکتور</button>
                      <button type="button" onClick={() => { closeCheckout(); setShowProfilePage(true); setProfileTab('orders'); setOrderDetailId(orderSuccess.id); }} className="px-6 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium hover:opacity-90 transition">
                        پیگیری سفارش
                      </button>
                      <button type="button" onClick={() => { closeCheckout(); openPLP(); }} className="px-6 py-2.5 rounded-full border border-primary-200 dark:border-white/30 text-sm font-medium text-primary-800 dark:text-white hover:bg-primary-50 dark:hover:bg-primary-800 transition">
                        ادامه خرید
                      </button>
                    </div>
                  </div>
                ) : pendingPayOrder ? (
                  /* شبیه‌سازی درگاه */
                  <div className="max-w-md mx-auto py-8 px-4 rounded-2xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900">
                    <div className="text-center mb-6">
                      <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary-100 dark:bg-[#2A2C30] border border-transparent dark:border-white/30 flex items-center justify-center text-primary-700 dark:text-white">
                        <Icon name="shield" size={28} />
                      </div>
                      <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-white">تأیید سفارش (آزمایشی)</h1>
                      <p className="text-xs text-primary-500 mt-1">شماره سفارش <span dir="ltr">{pendingPayOrder.id}</span></p>
                      <p className="text-xl font-bold text-primary-900 dark:text-white mt-3">{formatPrice(pendingPayOrder.total)} تومان</p>
                    </div>
                    <p className="text-xs text-primary-500 text-center mb-4 leading-6">این مرحله آزمایشی است. دو نتیجه موفق/ناموفق را برای تست انتخاب کنید.</p>
                    <div className="space-y-2">
                      <button type="button" disabled={checkoutPlacing} onClick={confirmPaymentSuccess} className="w-full py-3 rounded-full bg-green-600 text-white text-sm font-bold hover:opacity-90 disabled:opacity-60">{checkoutPlacing ? 'در حال تأیید...' : 'پرداخت موفق (دمو)'}</button>
                      <button type="button" disabled={checkoutPlacing} onClick={confirmPaymentFail} className="w-full py-3 rounded-full border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20">پرداخت ناموفق / انصراف</button>
                      <button type="button" onClick={() => { setPendingPayOrder(null); }} className="w-full py-2 text-xs text-primary-500 hover:underline">بازگشت به ثبت سفارش</button>
                    </div>
                  </div>
                ) : orderFailed ? (
                  <div className="max-w-md mx-auto text-center py-10 px-4 rounded-2xl border border-red-200 dark:border-red-900/40 bg-white dark:bg-primary-900">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center">
                      <Icon name="x" size={28} />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-white mb-2">پرداخت ناموفق</h1>
                    <p className="text-sm text-primary-500 mb-2">{orderFailed.reason}</p>
                    {orderFailed.orderId && <p className="text-xs text-primary-400 mb-1">سفارش <span dir="ltr">{orderFailed.orderId}</span> در وضعیت «در انتظار پرداخت» مانده است.</p>}
                    {orderFailed.amount != null && <p className="text-sm font-bold text-primary-800 dark:text-white mb-4">{formatPrice(orderFailed.amount)} تومان</p>}
                    <div className="flex flex-col gap-2">
                      <button type="button" onClick={() => { setOrderFailed(null); if (cart.length) placeOrder(); else openCartPage(); }} className="px-6 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium">تلاش مجدد پرداخت</button>
                      <button type="button" onClick={() => { setOrderFailed(null); closeCheckout(); setShowProfilePage(true); setProfileTab('orders'); }} className="text-sm text-apple-blue hover:underline">مشاهده سفارش‌ها</button>
                      <button type="button" onClick={() => openStaticPage('contact')} className="text-xs text-primary-500 hover:underline">پشتیبانی</button>
                    </div>
                  </div>
                ) : cart.length === 0 ? (
                  <div className="text-center py-20 px-4 rounded-2xl border border-primary-200 dark:border-white/20 bg-primary-50/40 dark:bg-primary-900/30">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white dark:bg-primary-900 flex items-center justify-center text-primary-400 shadow-sm">
                      <Icon name="shoppingBag" size={32} />
                    </div>
                    <p className="text-primary-900 dark:text-white font-bold text-base mb-2">سبد خرید شما خالی است</p>
                    <p className="text-primary-500 dark:!text-white text-sm mb-6">برای تسویه حساب ابتدا کالا به سبد اضافه کنید.</p>
                    <button type="button" onClick={() => { closeCheckout(); openPLP(); }} className="px-6 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium hover:opacity-90 transition">بازگشت به فروشگاه</button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-white mb-4">تسویه حساب</h1>
                    {/* Stepper — لینک داخلی + سبز وقتی تکمیل شد */}
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-6 overflow-x-auto no-scrollbar pb-1" role="navigation" aria-label="مراحل تسویه">
                      {[
                        { id: 0, label: 'اطلاعات تماس', anchor: 'checkout-step-contact' },
                        { id: 1, label: 'آدرس ارسال', anchor: 'checkout-step-address' },
                        { id: 2, label: 'روش ارسال', anchor: 'checkout-step-shipping' },
                        { id: 3, label: 'پرداخت و تأیید', anchor: 'checkout-step-payment' },
                      ].map((s, idx) => {
                        const contactDone = !!(checkoutContact?.firstName?.trim() && checkoutContact?.phone && /^09\d{9}$/.test(onlyDigits(checkoutContact.phone || '')));
                        const addressDone = (checkoutUseNewAddress || !(addresses || []).length)
                          ? !!(checkoutNewAddress?.receiver?.trim() && checkoutNewAddress?.phone && /^09\d{9}$/.test(onlyDigits(checkoutNewAddress.phone || '')) && checkoutNewAddress?.province?.trim() && checkoutNewAddress?.city?.trim() && checkoutNewAddress?.address?.trim() && onlyDigits(checkoutNewAddress?.postal || '').length === 10)
                          : !!checkoutSelectedAddressId;
                        let shippingDone = false;
                        try {
                          const shipOpts = typeof getShippingOptions === 'function' ? getShippingOptions() : [];
                          const ship = shipOpts.find((o) => o.id === checkoutShippingMethod);
                          shippingDone = !!(ship && !ship.disabled);
                        } catch (_) { shippingDone = !!checkoutShippingMethod; }
                        const paymentDone = !!checkoutPaymentMethod;
                        const stepDone = s.id === 0 ? contactDone : s.id === 1 ? addressDone : s.id === 2 ? shippingDone : paymentDone;
                        const isActive = checkoutStep === s.id;
                        return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setCheckoutStep(s.id);
                            try {
                              requestAnimationFrame(() => {
                                const el = document.getElementById(s.anchor);
                                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              });
                            } catch (_) {}
                          }}
                          className={`checkout-step-chip flex-shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap border ${
                            isActive
                              ? 'checkout-step-chip--active bg-apple-blue !text-white border-apple-blue'
                              : stepDone
                              ? 'checkout-step-chip--done'
                              : 'checkout-step-chip--todo bg-primary-100 dark:bg-primary-800 !text-primary-800 dark:!text-white border-primary-200 dark:border-white/35'
                          }`}
                          aria-current={isActive ? 'step' : undefined}
                          aria-label={`${s.label}${stepDone ? ' — تکمیل‌شده' : ''}`}
                        >
                          <span className={`checkout-step-num w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border ${
                            isActive
                              ? 'bg-white/25 border-white/40 !text-white'
                              : stepDone
                              ? 'bg-emerald-500 border-emerald-600 !text-white'
                              : 'bg-white dark:bg-primary-700 border-primary-300 dark:border-white/40 !text-primary-800 dark:!text-white'
                          }`}>{stepDone && !isActive ? '✓' : toFa(idx + 1)}</span>
                          <span>{s.label}</span>
                        </button>
                        );
                      })}
                    </div>

                    <div className="checkout-grid-layout">
                      {/* Main form — ستون اصلی */}
                      <div className="checkout-main-col space-y-4 min-w-0">
                        {/* Contact */}
                        
                      {/* ناوبری مرحله‌ای */}
                      <div className="checkout-step-nav sticky top-0 z-30 mb-4 py-2 bg-white/90 dark:bg-primary-950/90 backdrop-blur-md border-b border-primary-100 dark:border-white/10">
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <button
                            type="button"
                            onClick={() => setCheckoutStep((s) => Math.max(0, (s || 0) - 1))}
                            disabled={(checkoutStep || 0) <= 0}
                            className="inline-flex items-center justify-center gap-2 h-11 sm:h-12 rounded-full border border-primary-200 dark:border-white/25 bg-white dark:bg-primary-900 text-sm font-semibold text-primary-800 dark:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-50 dark:hover:bg-primary-800 transition"
                          >
                            قبلی
                          </button>
                          {(checkoutStep || 0) < 3 ? (
                            <button
                              type="button"
                              onClick={() => setCheckoutStep((s) => Math.min(3, (s || 0) + 1))}
                              className="inline-flex items-center justify-center gap-2 h-11 sm:h-12 rounded-full bg-apple-blue text-white text-sm font-bold shadow-md hover:opacity-95 transition"
                            >
                              ادامه
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={placeOrder}
                              disabled={checkoutPlacing || !user}
                              className="inline-flex items-center justify-center gap-2 h-11 sm:h-12 rounded-full bg-emerald-600 text-white text-sm font-bold shadow-md hover:opacity-95 transition disabled:opacity-60"
                            >
                              {checkoutPlacing ? 'در حال ثبت…' : 'پرداخت و ثبت'}
                            </button>
                          )}
                        </div>
                        <p className="mt-1.5 text-center text-[11px] text-primary-400 dark:text-white/50">
                          {['اطلاعات تماس', 'آدرس ارسال', 'روش ارسال', 'پرداخت و تأیید'][checkoutStep || 0]}
                        </p>
                      </div>
<section id="checkout-step-contact" className={`scroll-mt-28 rounded-2xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 p-4 sm:p-5 ${checkoutStep === 0 ? 'ring-2 ring-apple-blue/30' : 'hidden'}`}>
                          <h2 className="text-sm font-bold text-primary-900 dark:text-white mb-3 flex items-center gap-2"><Icon name="user" size={16} /> اطلاعات تماس</h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-primary-600 dark:text-white/70 mb-1">نام <span className="text-red-500">*</span></label>
                              <input type="text" value={checkoutContact.firstName} onChange={e => setCheckoutContact(c => ({ ...c, firstName: e.target.value }))} className={`w-full px-3 py-2.5 rounded-xl border bg-transparent text-sm ${checkoutErrors.firstName ? 'border-red-400' : 'border-primary-200 dark:border-white/20'}`} data-checkout-error={checkoutErrors.firstName || undefined} />
                              {checkoutErrors.firstName && <p className="text-xs text-red-500 mt-1" data-checkout-error>{checkoutErrors.firstName}</p>}
                            </div>
                            <div>
                              <label className="block text-xs text-primary-600 dark:text-white/70 mb-1">نام‌خانوادگی</label>
                              <input type="text" value={checkoutContact.lastName} onChange={e => setCheckoutContact(c => ({ ...c, lastName: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs text-primary-600 dark:text-white/70 mb-1">موبایل <span className="text-red-500">*</span></label>
                              <input type="tel" dir="ltr" value={checkoutContact.phone} readOnly className={`w-full px-3 py-2.5 rounded-xl border bg-primary-50 dark:bg-primary-900/50 text-sm opacity-90 ${checkoutErrors.phone ? 'border-red-400' : 'border-primary-200 dark:border-white/20'}`} data-checkout-error={checkoutErrors.phone || undefined} />
                              {checkoutErrors.phone && <p className="text-xs text-red-500 mt-1">{checkoutErrors.phone}</p>}
                            </div>
                            <div>
                              <label className="block text-xs text-primary-600 dark:text-white/70 mb-1">ایمیل (اختیاری)</label>
                              <input type="email" dir="ltr" value={checkoutContact.email} onChange={e => setCheckoutContact(c => ({ ...c, email: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm" />
                            </div>
                          </div>
                          {!user && (
                            <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 text-sm text-amber-800 dark:text-amber-200">
                              برای ادامه وارد شوید.{' '}
                              <button type="button" onClick={openAuth} className="font-bold underline">ورود</button>
                            </div>
                          )}
                        </section>

                        {/* Address */}
                        <section id="checkout-step-address" className={`scroll-mt-28 rounded-2xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 p-4 sm:p-5 ${checkoutStep === 1 ? 'ring-2 ring-apple-blue/30' : 'hidden'}`}>
                          <h2 className="text-sm font-bold text-primary-900 dark:text-white mb-3 flex items-center gap-2"><Icon name="mapPin" size={16} /> آدرس ارسال</h2>
                          <p className="text-xs text-primary-500 dark:!text-white mb-3">ارسال به سراسر ایران</p>
                          {(addresses || []).length > 0 && !checkoutUseNewAddress && (
                            <div className="space-y-2 mb-3">
                              {(addresses || []).map(a => (
                                <label key={a.id} className={`flex gap-3 p-3 rounded-xl border cursor-pointer transition ${checkoutSelectedAddressId === a.id ? 'border-apple-blue bg-apple-blue/5 dark:bg-apple-blue/10' : 'border-primary-200 dark:border-white/15 hover:border-primary-300'}`}>
                                  <input type="radio" name="checkout-addr" checked={checkoutSelectedAddressId === a.id} onChange={() => setCheckoutSelectedAddressId(a.id)} className="mt-1" />
                                  <div className="flex-1 min-w-0 text-sm">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className="font-bold text-primary-900 dark:text-white">{a.title}</span>
                                      {a.isDefault && <span className="text-xs px-1.5 py-0.5 rounded bg-apple-blue/15 text-apple-blue">پیش‌فرض</span>}
                                    </div>
                                    <p className="text-primary-600 dark:text-white/70 text-xs">{a.receiver} — <span dir="ltr">{a.phone}</span></p>
                                    <p className="text-primary-500 dark:!text-white text-xs mt-0.5">{a.province}، {a.city}، {a.address}</p>
                                    {a.postal && <p className="text-xs text-primary-400" dir="ltr">{a.postal}</p>}
                                  </div>
                                </label>
                              ))}
                              <button type="button" onClick={() => setCheckoutUseNewAddress(true)} className="text-xs text-apple-blue font-medium hover:underline">+ آدرس جدید</button>
                            </div>
                          )}
                          {(checkoutUseNewAddress || !(addresses || []).length) && (
                            <div className="space-y-3">
                              {(addresses || []).length > 0 && (
                                <button type="button" onClick={() => setCheckoutUseNewAddress(false)} className="text-xs text-primary-500 hover:text-apple-blue mb-1">← بازگشت به آدرس‌های ذخیره‌شده</button>
                              )}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs text-primary-600 dark:text-white/70 mb-1">عنوان آدرس</label>
                                  <input type="text" value={checkoutNewAddress.title} onChange={e => setCheckoutNewAddress(a => ({ ...a, title: e.target.value }))} placeholder="خانه / محل کار" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm" />
                                </div>
                                <div>
                                  <label className="block text-xs text-primary-600 dark:text-white/70 mb-1">نام گیرنده <span className="text-red-500">*</span></label>
                                  <input type="text" value={checkoutNewAddress.receiver} onChange={e => setCheckoutNewAddress(a => ({ ...a, receiver: e.target.value }))} className={`w-full px-3 py-2.5 rounded-xl border bg-transparent text-sm ${checkoutErrors.receiver ? 'border-red-400' : 'border-primary-200 dark:border-white/20'}`} data-checkout-error={checkoutErrors.receiver || undefined} />
                                  {checkoutErrors.receiver && <p className="text-xs text-red-500 mt-1">{checkoutErrors.receiver}</p>}
                                </div>
                                <div>
                                  <label className="block text-xs text-primary-600 dark:text-white/70 mb-1">موبایل گیرنده <span className="text-red-500">*</span></label>
                                  <input type="tel" dir="ltr" value={checkoutNewAddress.phone} onChange={e => setCheckoutNewAddress(a => ({ ...a, phone: onlyDigits(e.target.value).slice(0, 11) }))} className={`w-full px-3 py-2.5 rounded-xl border bg-transparent text-sm ${checkoutErrors.receiverPhone ? 'border-red-400' : 'border-primary-200 dark:border-white/20'}`} />
                                  {checkoutErrors.receiverPhone && <p className="text-xs text-red-500 mt-1">{checkoutErrors.receiverPhone}</p>}
                                </div>
                                <div>
                                  <label className="block text-xs text-primary-600 dark:text-white/70 mb-1">استان <span className="text-red-500">*</span></label>
                                  <input type="text" value={checkoutNewAddress.province} onChange={e => setCheckoutNewAddress(a => ({ ...a, province: e.target.value }))} className={`w-full px-3 py-2.5 rounded-xl border bg-transparent text-sm ${checkoutErrors.province ? 'border-red-400' : 'border-primary-200 dark:border-white/20'}`} />
                                  {checkoutErrors.province && <p className="text-xs text-red-500 mt-1">{checkoutErrors.province}</p>}
                                </div>
                                <div>
                                  <label className="block text-xs text-primary-600 dark:text-white/70 mb-1">شهر <span className="text-red-500">*</span></label>
                                  <input type="text" value={checkoutNewAddress.city} onChange={e => setCheckoutNewAddress(a => ({ ...a, city: e.target.value }))} className={`w-full px-3 py-2.5 rounded-xl border bg-transparent text-sm ${checkoutErrors.city ? 'border-red-400' : 'border-primary-200 dark:border-white/20'}`} />
                                  {checkoutErrors.city && <p className="text-xs text-red-500 mt-1">{checkoutErrors.city}</p>}
                                </div>
                                <div>
                                  <label className="block text-xs text-primary-600 dark:text-white/70 mb-1">کد پستی <span className="text-red-500">*</span></label>
                                  <input type="text" dir="ltr" value={checkoutNewAddress.postal} onChange={e => setCheckoutNewAddress(a => ({ ...a, postal: onlyDigits(e.target.value).slice(0, 10) }))} className={`w-full px-3 py-2.5 rounded-xl border bg-transparent text-sm ${checkoutErrors.postal ? 'border-red-400' : 'border-primary-200 dark:border-white/20'}`} />
                                  {checkoutErrors.postal && <p className="text-xs text-red-500 mt-1">{checkoutErrors.postal}</p>}
                                </div>
                                
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="sm:col-span-1">
                                  <label className="block text-xs font-medium text-primary-700 dark:text-white/80 mb-1">
                                    خیابان <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={checkoutNewAddress.street || ''}
                                    onChange={(e) => setCheckoutNewAddress((a) => ({ ...a, street: e.target.value }))}
                                    className="w-full rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-950 px-3 py-2 text-sm text-primary-900 dark:text-white"
                                    placeholder="نام خیابان"
                                  />
                                  {checkoutErrors.street && <p className="text-xs text-red-500 mt-1">{checkoutErrors.street}</p>}
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-primary-700 dark:text-white/80 mb-1">
                                    پلاک <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={checkoutNewAddress.plaque || ''}
                                    onChange={(e) => setCheckoutNewAddress((a) => ({ ...a, plaque: e.target.value }))}
                                    className="w-full rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-950 px-3 py-2 text-sm text-primary-900 dark:text-white"
                                    placeholder="پلاک"
                                  />
                                  {checkoutErrors.plaque && <p className="text-xs text-red-500 mt-1">{checkoutErrors.plaque}</p>}
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-primary-700 dark:text-white/80 mb-1">
                                    واحد (زنگ) <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={checkoutNewAddress.unit || ''}
                                    onChange={(e) => setCheckoutNewAddress((a) => ({ ...a, unit: e.target.value }))}
                                    className="w-full rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-950 px-3 py-2 text-sm text-primary-900 dark:text-white"
                                    placeholder="واحد / زنگ"
                                  />
                                  {checkoutErrors.unit && <p className="text-xs text-red-500 mt-1">{checkoutErrors.unit}</p>}
                                </div>
                              </div>

<label className="flex items-center gap-2 text-xs text-primary-700 dark:text-white/80 cursor-pointer">
                                <input type="checkbox" checked={!!checkoutNewAddress.save} onChange={e => setCheckoutNewAddress(a => ({ ...a, save: e.target.checked }))} />
                                ذخیره این آدرس
                              </label>
                              <label className="flex items-center gap-2 text-xs text-primary-700 dark:text-white/80 cursor-pointer">
                                <input type="checkbox" checked={!!checkoutNewAddress.isDefault} onChange={e => setCheckoutNewAddress(a => ({ ...a, isDefault: e.target.checked }))} />
                                انتخاب به‌عنوان پیش‌فرض
                              </label>
                            </div>
                          )}
{checkoutErrors.address && !checkoutUseNewAddress && (addresses || []).length > 0 && <p className="text-xs text-red-500 mt-2">{checkoutErrors.address}</p>}
                        </section>

                        {/* Shipping method */}
                        <section id="checkout-step-shipping" className={`scroll-mt-28 rounded-2xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 p-4 sm:p-5 ${checkoutStep === 2 ? 'ring-2 ring-apple-blue/30' : 'hidden'}`}>
                          <h2 className="text-sm font-bold text-primary-900 dark:text-white mb-3 flex items-center gap-2"><Icon name="truck" size={16} /> روش ارسال</h2>
                          <p className="text-xs text-primary-500 dark:!text-white mb-3">فقط روش‌هایی که فروشنده پشتیبانی می‌کند نمایش داده می‌شود.</p>
                          <div className="space-y-2">
                            {getShippingOptions().length === 0 && (
                              <p className="text-xs text-amber-600 dark:text-amber-300 p-3 rounded-xl border border-amber-200 dark:border-amber-800/40">فروشنده هنوز روش ارسالی انتخاب نکرده است.</p>
                            )}
                            {getShippingOptions().map(opt => (
                              <label key={opt.id} className={`flex gap-3 p-3 rounded-xl border cursor-pointer transition ${checkoutShippingMethod === opt.id ? 'border-apple-blue bg-apple-blue/5 dark:bg-apple-blue/10' : 'border-primary-200 dark:border-white/15'}`}>
                                <input type="radio" name="ship-method" checked={checkoutShippingMethod === opt.id} onChange={() => setCheckoutShippingMethod(opt.id)} className="mt-1" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <p className="text-sm font-bold text-primary-900 dark:text-white">{opt.label}</p>
                                      <p className="text-xs text-primary-500 dark:!text-white">{opt.desc}{opt.eta ? ` · ${opt.eta}` : ''}</p>
                                    </div>
                                    <span className="text-sm font-medium text-primary-900 dark:text-white whitespace-nowrap">
                                      {opt.priceMode === 'dynamic_cod'
                                        ? `≈ ${formatPrice(opt.cost)} ت`
                                        : `${formatPrice(opt.cost)} ت`}
                                    </span>
                                  </div>
                                  {opt.priceMode === 'dynamic_cod' && (
                                    <p className="shipping-dynamic-note text-xs text-amber-800 dark:text-amber-200 mt-2 leading-relaxed bg-amber-50 dark:bg-amber-950/40 rounded-lg p-2">
                                      قیمت همین لحظه (تقریبی). فروشنده هنگام ارسال تماس می‌گیرد و مبلغ نهایی را اعلام می‌کند؛ در صورت تأیید، هزینه در مقصد توسط خریدار پرداخت می‌شود. در غیر این صورت خریدار پیک خود را از مبدأ می‌گیرد.
                                    </p>
                                  )}
                                  {opt.note && opt.priceMode !== 'dynamic_cod' && (
                                    <p className="text-xs text-primary-400 mt-1">{opt.note}</p>
                                  )}
                                </div>
                              </label>
                            ))}
                          </div>
                          {checkoutErrors.shipping && <p className="text-xs text-red-500 mt-2">{checkoutErrors.shipping}</p>}
                        </section>

                        {/* Coupon (shared with cart) */}
                        <section className={`rounded-2xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 p-4 sm:p-5 ${checkoutStep === 3 ? '' : 'hidden'}`}>
                          <h2 className="text-sm font-bold text-primary-900 dark:text-white mb-3">کد تخفیف و هدایا</h2>
                          {couponApplied ? (
                            <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-apple-blue/10 border border-apple-blue/30">
                              <span className="text-xs font-bold text-apple-blue">{couponApplied.code}</span>
                              <button type="button" onClick={removeCoupon} className="text-xs text-red-500 hover:underline">حذف</button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <input type="text" value={couponInput} onChange={e => setCouponInput(e.target.value)} placeholder="کد تخفیف یا هدیه" className="coupon-input flex-1 px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/40 bg-white dark:bg-[#1A1C20] text-sm !text-primary-900 dark:!text-white placeholder:!text-primary-500 dark:placeholder:!text-white/70" dir="ltr" />
                              <button type="button" onClick={applyCoupon} className="coupon-apply-btn px-4 py-2.5 rounded-xl bg-primary-900 dark:bg-white text-white dark:!text-[#0A0A0A] text-sm font-medium">اعمال</button>
                            </div>
                          )}
                          {couponMsg && <p className={`text-xs mt-1.5 ${couponMsg.type === 'ok' ? 'text-apple-blue' : 'text-red-500'}`}>{couponMsg.text}</p>}
                        </section>

                        {/* Note */}
                        <section className={`rounded-2xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 p-4 sm:p-5 ${checkoutStep === 3 ? '' : 'hidden'}`}>
                          <label className="block text-sm font-bold text-primary-900 dark:text-white mb-2">یادداشت سفارش (اختیاری)</label>
                          <Textarea rows={2} value={checkoutNote} onChange={(v) => setCheckoutNote(v || '')} placeholder="توضیح برای فروشنده یا پیک…" style={{ minHeight: 72 }} />
                        </section>

                        {/* Payment method */}
                        <section id="checkout-step-payment" className={`scroll-mt-28 rounded-2xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 p-4 sm:p-5 ${checkoutStep === 3 ? 'ring-2 ring-apple-blue/30' : 'hidden'}`}>
                          <h2 className="text-sm font-bold text-primary-900 dark:text-white mb-3 flex items-center gap-2"><Icon name="shield" size={16} /> روش پرداخت</h2>
                          <label className={`flex gap-3 p-3 rounded-xl border cursor-pointer ${checkoutPaymentMethod === 'online' ? 'border-apple-blue bg-apple-blue/5' : 'border-primary-200 dark:border-white/15'}`}>
                            <input type="radio" name="pay-method" checked={checkoutPaymentMethod === 'online'} onChange={() => setCheckoutPaymentMethod('online')} className="mt-1" />
                            <div>
                              <p className="text-sm font-bold text-primary-900 dark:text-white">پرداخت آنلاین</p>
                              <p className="text-xs text-primary-500 dark:!text-white">شبیه‌سازی درگاه — بدون اتصال واقعی بانکی</p>
                            </div>
                          </label>
                        </section>
                      </div>


                      

                      {/* Sidebar summary ~35% — موبایل: اول | دسکتاپ: sticky (ستون باید کشیده شود تا sticky جا داشته باشد) */}
                      <aside className="checkout-summary-col order-summary-col">
                        <div className="order-summary-sticky checkout-summary-panel rounded-2xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 p-4 sm:p-5 space-y-4">
                          <h2 className="text-sm font-bold text-primary-900 dark:text-white">خلاصه سفارش</h2>
                          <div className="space-y-3">
                            {cart.map((item, idx) => {
                              const lineTotal = item.price * item.qty;
                              return (
                                <div key={`co-${item.id}-${item.selectedColor?.name || ''}-${item.selectedSize || ''}-${idx}`} className="flex gap-3">
                                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-primary-100 dark:bg-primary-900 flex-shrink-0">
                                    {(item.selectedColor?.image || item.image) ? (
                                      <img src={item.selectedColor?.image || item.image} alt="" className="w-full h-full object-cover" />
                                    ) : null}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-primary-900 dark:text-white line-clamp-2">{item.name}</p>
                                    <p className="text-xs text-primary-500 dark:!text-white">{item.seller?.name || 'فروشگاه مرکزی'} · {item.selectedColor?.name || ''} {item.selectedSize || item.size || ''} · ×{toFa(item.qty)}</p>
                                    <p className="text-xs font-bold text-primary-900 dark:text-white mt-0.5">{formatPrice(lineTotal)} ت</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {(() => {
                            const t = getCheckoutTotals();
                            const taxLabel = t.taxRate > 0 ? `مالیات (${toFa(Math.round(t.taxRate * 100))}٪)` : null;
                            return (
                              <div className="space-y-2 text-sm border-t border-primary-100 dark:border-white/10 pt-3">
                                <div className="flex justify-between"><span className="text-primary-600 dark:text-white/70">جمع جزء</span><span className="font-medium text-primary-900 dark:text-white">{formatPrice(t.subtotal)} ت</span></div>
                                {t.productSavings > 0 && (
                                  <div className="flex justify-between"><span className="text-apple-blue">تخفیف کالاها</span><span className="text-apple-blue font-medium">−{formatPrice(t.productSavings)} ت</span></div>
                                )}
                                {t.discount > 0 && (
                                  <div className="flex justify-between"><span className="text-apple-blue">تخفیف کد</span><span className="text-apple-blue font-medium">−{formatPrice(t.discount)} ت</span></div>
                                )}
                                <div className="flex justify-between"><span className="text-primary-600 dark:text-white/70">هزینه ارسال</span><span className="font-medium text-primary-900 dark:text-white">{t.shipping === 0 ? 'پرداخت در مقصد / ۰' : formatPrice(t.shipping) + ' ت'}</span></div>
                                {taxLabel && (
                                  <div className="flex justify-between"><span className="text-primary-600 dark:text-white/70">{taxLabel}</span><span className="font-medium text-primary-900 dark:text-white">{formatPrice(t.tax)} ت</span></div>
                                )}
                                <div className="flex justify-between items-center pt-2 border-t border-primary-100 dark:border-white/10">
                                  <span className="font-bold text-primary-900 dark:text-white">قابل پرداخت</span>
                                  <span className="font-bold text-lg text-primary-900 dark:text-white">{formatPrice(t.payable)} تومان</span>
                                </div>
                              </div>
                            );
                          })()}
                          <div className="grid grid-cols-3 gap-2 pt-1">
                            {[{ icon: 'shield', t: 'پرداخت امن' }, { icon: 'refresh', t: '۷ روز بازگشت' }, { icon: 'badge', t: 'ضمانت اصالت' }].map((x) => (
                              <div key={x.t} className="flex flex-col items-center gap-1.5 text-center">
                                <span className="trust-icon-wrap inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-800 border border-primary-200 dark:border-white/30">
                                  <Icon name={x.icon} size={16} className="text-apple-blue dark:text-[#13ABC4]" />
                                </span>
                                <span className="text-xs font-medium text-primary-700 dark:!text-white">{x.t}</span>
                              </div>
                            ))}
                          </div>
                          {/* Desktop pay button */}
                          <button
                            type="button"
                            onClick={placeOrder}
                            disabled={checkoutStep !== 3 || checkoutPlacing || !user}
                            className="hidden lg:flex w-full items-center justify-center gap-2 bg-apple-blue text-white py-3.5 rounded-full font-bold hover:opacity-90 active:scale-[0.98] transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {checkoutPlacing ? (
                              <>در حال ثبت…</>
                            ) : (
                              <>پرداخت و ثبت سفارش · {formatPrice(getCheckoutTotals().payable)} ت</>
                            )}
                          </button>
                          {!user && <p className="hidden lg:block text-xs text-center text-amber-600">ابتدا وارد شوید</p>}
                        </div>
                      </aside>
                    </div>
</>
                )}
              </div>
            </div>
          )}

          {/* ========== Buyer Profile Page ========== */}
    </>
  );
}
