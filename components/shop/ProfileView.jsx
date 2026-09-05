'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAppApi } from '../AppApiContext';

/** ProfileView — استخراج از App.jsx برای code-split (رفتار یکسان) */

function SecurityPasswordForm({ setAccountPassword, showToast }) {
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = (message, variant = 'default') => {
    try {
      showToast && showToast({ message, variant, duration: 4500, position: 'top-center' });
    } catch (_) {}
  };
  const save = async () => {
    if (!pw || pw.length < 6) { toast('رمز حداقل ۶ کاراکتر', 'error'); return; }
    if (pw !== pw2) { toast('تکرار رمز یکسان نیست', 'error'); return; }
    setLoading(true);
    try {
      if (typeof setAccountPassword === 'function') await setAccountPassword(pw);
      else {
        const res = await fetch('/api/auth/password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ password: pw }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data?.ok === false) throw new Error(data?.error || 'خطا');
      }
      setPw('');
      setPw2('');
      toast('رمز با موفقیت ذخیره شد', 'success');
    } catch (e) {
      toast(e?.message || 'ذخیره ناموفق', 'error');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-3 mt-6 pt-6 border-t border-primary-200 dark:border-white/15" dir="rtl">
      <h3 className="text-sm font-bold text-primary-900 dark:text-white">امنیت و رمز عبور</h3>
      <p className="text-xs text-primary-500 dark:text-white/60 leading-relaxed">
        ساخت یا تغییر رمز برای ورود بدون پیامک. فراموشی: ورود با پیامک، سپس رمز جدید.
      </p>
      <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="رمز جدید (حداقل ۶ کاراکتر)" autoComplete="new-password" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white" />
      <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="تکرار رمز" autoComplete="new-password" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white" />
      <button type="button" disabled={loading} onClick={save} className="btn-cta w-full sm:w-auto px-6 py-2.5 rounded-full bg-apple-blue dark:bg-[#13ABC4] text-white text-sm font-bold disabled:opacity-60 hover:opacity-90 transition">
        {loading ? 'در حال ذخیره...' : 'ذخیره رمز'}
      </button>
    </div>
  );
}

export default function ProfileView() {

  const [trackCode, setTrackCode] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);

  const {
    Icon,
    SimpleEditor,
    Textarea,
    addToCart,
    addressDeleteConfirm,
    addressForm,
    addressFormOpen,
    addresses,
    adminSellers,
    assertNoUserLinks,
    blogPosts,
    buyerGifts,
    buyerTicketBody,
    buyerTicketDetailId,
    buyerTicketError,
    buyerTicketFormOpen,
    buyerTicketSubject,
    buyerTickets,
    cart,
    cartCount,
    clearCompare,
    closeProfilePage,
    compare,
    conversationChannelLabel,
    dark,
    editingAddressId,
    favorites,
    formatPrice,
    generateTicketCode,
    htmlToPlain,
    installBuyerPwa,
    likedBlogs,
    logout,
    logoutAllDevices,
    markAllNotifsRead,
    mirrorConversationToAdmin,
    notifPulling,
    notifications,
    unreadNotifCount: unreadNotifCountRaw,
    onlyDigits,
    openCheckout,
    openComparePage,
    openPDP,
    openPLP,
    openSeller,
    openSellersList,
    openStaticPage,
    orderDetailId,
    orderRateDraft,
    orderReturnOpen,
    orderStatusColor,
    orders,
    ordersFilter,
    pdpProduct,
    printOrderInvoice,
    products,
    profileTab,
    pullNotifications,
    pushLiveToast,
    pushNotification,
    pwaInstalled,
    recentlyViewed,
    removeFromCart,
    saveAddresses,
    saveBuyerOrders,
    saveBuyerTickets,
    setBuyerTickets,
    saveNotifications,
    saveUser,
    sellerFollowed,
    sellerGifts,
    setAddressDeleteConfirm,
    setAddressForm,
    setAddressFormOpen,
    setAddresses,
    setBuyerTicketBody,
    setBuyerTicketDetailId,
    setBuyerTicketError,
    setBuyerTicketFormOpen,
    setBuyerTicketSubject,
    setClearCartConfirm,
    setCompareOpen,
    setEditingAddressId,
    setNotifications,
    setOrderDetailId,
    setOrderFailed,
    setOrderRateDraft,
    setOrderReturnOpen,
    setOrderSuccess,
    setOrders,
    setOrdersFilter,
    setPendingPayOrder,
    setProfileTab,
    setRecentlyViewed,
    setShowCheckout,
    setShowProfilePage,
    setShowTracking,
    showProfilePage,
    showToast,
    showTracking,
    siteConfirm,
    stripLinksForDisplay,
    toFa,
    toggleBlogLike,
    toggleCompare,
    toggleFavorite,
    toggleSellerFollow,
    topSellers,
    user,
    wishlistProducts,
    setAccountPassword
  } = useAppApi();

  // --- Buyer panel: server-first loaders (P0/P1) ---
  const [buyerLoading, setBuyerLoading] = useState({ orders: false, addresses: false, wishlist: false, tickets: false, notifications: false });
  const [buyerError, setBuyerError] = useState({ orders: '', addresses: '', wishlist: '', tickets: '', notifications: '' });

  const safeJson = async (r) => {
    try { return await r.json(); } catch { return null; }
  };


  const BuyerEmpty = ({ title, desc, actionLabel, onAction }) => (
    <div className="text-center py-10 px-4">
      <p className="text-sm font-semibold text-primary-800 dark:text-white mb-1">{title}</p>
      <p className="text-xs text-primary-500 dark:text-white/60 mb-4">{desc}</p>
      {actionLabel && onAction ? (
        <button type="button" onClick={onAction} className="text-xs px-4 py-2 rounded-full border border-primary-200 dark:border-white/20 font-medium hover:bg-primary-50 dark:hover:bg-primary-800">
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
  const BuyerLoading = () => (
    <div className="py-8 text-center text-xs text-primary-400 animate-pulse">در حال بارگذاری…</div>
  );
  const BuyerErr = ({ msg, onRetry }) => (
    <div className="py-6 text-center">
      <p className="text-xs text-red-600 mb-2">{msg || 'خطا'}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="text-xs underline">تلاش مجدد</button>
      ) : null}
    </div>
  );

  const loadBuyerOrders = useCallback(async () => {
    setBuyerLoading((s) => ({ ...s, orders: true }));
    setBuyerError((s) => ({ ...s, orders: '' }));
    try {
      const r = await fetch('/api/orders', { credentials: 'include' });
      const j = await safeJson(r);
      if (!r.ok) {
        // fallback alternate path
        const r2 = await fetch('/api/buyer/orders', { credentials: 'include' });
        const j2 = await safeJson(r2);
        if (r2.ok && j2) {
          const list = j2.orders || j2.data || j2.items || (Array.isArray(j2) ? j2 : []);
          if (typeof setOrders === 'function') setOrders(list);
          return;
        }
        setBuyerError((s) => ({ ...s, orders: (j && (j.error || j.message)) || 'خطا در دریافت سفارش‌ها' }));
        if (typeof setOrders === 'function') setOrders([]);
        return;
      }
      const list = (j && (j.orders || j.data || j.items)) || (Array.isArray(j) ? j : []);
      if (typeof setOrders === 'function') setOrders(list);
    } catch (e) {
      setBuyerError((s) => ({ ...s, orders: 'خطای شبکه در دریافت سفارش‌ها' }));
      if (typeof setOrders === 'function') setOrders([]);
    } finally {
      setBuyerLoading((s) => ({ ...s, orders: false }));
    }
  }, []);

  const loadBuyerAddresses = useCallback(async () => {
    setBuyerLoading((s) => ({ ...s, addresses: true }));
    setBuyerError((s) => ({ ...s, addresses: '' }));
    try {
      let r = await fetch('/api/addresses', { credentials: 'include' });
      let j = await safeJson(r);
      if (!r.ok) {
        r = await fetch('/api/buyer/addresses', { credentials: 'include' });
        j = await safeJson(r);
      }
      if (!r.ok) {
        setBuyerError((s) => ({ ...s, addresses: (j && (j.error || j.message)) || 'خطا در دریافت آدرس‌ها' }));
        if (typeof setAddresses === 'function') setAddresses([]);
        return;
      }
      const list = (j && (j.addresses || j.data || j.items)) || (Array.isArray(j) ? j : []);
      if (typeof setAddresses === 'function') setAddresses(list);
    } catch {
      setBuyerError((s) => ({ ...s, addresses: 'خطای شبکه در دریافت آدرس‌ها' }));
      if (typeof setAddresses === 'function') setAddresses([]);
    } finally {
      setBuyerLoading((s) => ({ ...s, addresses: false }));
    }
  }, []);

  const loadBuyerWishlist = useCallback(async () => {
    setBuyerLoading((s) => ({ ...s, wishlist: true }));
    setBuyerError((s) => ({ ...s, wishlist: '' }));
    try {
      const r = await fetch('/api/wishlist', { credentials: 'include' });
      const j = await safeJson(r);
      if (!r.ok) {
        setBuyerError((s) => ({ ...s, wishlist: (j && (j.error || j.message)) || 'خطا در دریافت علاقه‌مندی‌ها' }));
        return;
      }
      const raw = (j && (j.items || j.wishlist || j.data)) || (Array.isArray(j) ? j : []);
      const list = (raw || []).map((row) => {
        if (typeof row === 'string') return { id: row, addedAt: Date.now() };
        const id = row.product_id || row.product?.id || row.id;
        return {
          id,
          addedAt: row.created_at ? new Date(row.created_at).getTime() : (row.addedAt || Date.now()),
          priceAtAdd: row.product?.base_price ?? row.priceAtAdd,
        };
      }).filter((x) => x.id);
      if (typeof setFavorites === 'function') setFavorites(list);
      else if (typeof setWishlist === 'function') setWishlist(list);
    } catch {
      setBuyerError((s) => ({ ...s, wishlist: 'خطای شبکه در دریافت علاقه‌مندی‌ها' }));
    } finally {
      setBuyerLoading((s) => ({ ...s, wishlist: false }));
    }
  }, []);

  const loadBuyerTickets = useCallback(async () => {
    setBuyerLoading((s) => ({ ...s, tickets: true }));
    setBuyerError((s) => ({ ...s, tickets: '' }));
    try {
      const r = await fetch('/api/tickets', { credentials: 'include' });
      const j = await safeJson(r);
      if (!r.ok) {
        setBuyerError((s) => ({ ...s, tickets: (j && (j.error || j.message)) || 'خطا در دریافت تیکت‌ها' }));
        if (typeof setNotifications === 'function') { /* keep */ }
        return;
      }
      const raw = (j && (j.tickets || j.data || j.items)) || (Array.isArray(j) ? j : []);
      const list = (raw || []).map((t) => ({
        id: t.id,
        code: t.code || t.id,
        subject: t.subject || '',
        status: t.status || 'open',
        type: t.type || 'ticket',
        channel: 'ticket',
        date: t.created_at ? new Date(t.created_at).toLocaleDateString('fa-IR') : (t.date || ''),
        messages: Array.isArray(t.messages) ? t.messages : (t.messages || []),
        fromServer: true,
      }));
      if (typeof saveBuyerTickets === 'function') saveBuyerTickets(list);
      else if (typeof setBuyerTickets === 'function') setBuyerTickets(list);
      else if (typeof setTickets === 'function') setTickets(list);
    } catch {
      setBuyerError((s) => ({ ...s, tickets: 'خطای شبکه در دریافت تیکت‌ها' }));
    } finally {
      setBuyerLoading((s) => ({ ...s, tickets: false }));
    }
  }, []);

  const loadBuyerNotifications = useCallback(async () => {
    setBuyerLoading((s) => ({ ...s, notifications: true }));
    setBuyerError((s) => ({ ...s, notifications: '' }));
    try {
      const r = await fetch('/api/notifications', { credentials: 'include' });
      const j = await safeJson(r);
      if (!r.ok) {
        // soft-fail: notifications optional
        setBuyerError((s) => ({ ...s, notifications: (j && (j.error || j.message)) || '' }));
        return;
      }
      const list = (j && (j.notifications || j.data || j.items)) || (Array.isArray(j) ? j : []);
      if (typeof setNotifications === 'function') setNotifications(list);
    } catch {
      setBuyerError((s) => ({ ...s, notifications: 'خطای شبکه' }));
    } finally {
      setBuyerLoading((s) => ({ ...s, notifications: false }));
    }
  }, []);

  const refreshBuyerPanel = useCallback(() => {
    loadBuyerOrders();
    loadBuyerAddresses();
    loadBuyerWishlist();
    loadBuyerTickets();
    loadBuyerNotifications();
  }, [loadBuyerOrders, loadBuyerAddresses, loadBuyerWishlist, loadBuyerTickets, loadBuyerNotifications]);

  useEffect(() => {
    if (!user) return;
    refreshBuyerPanel();
  }, [user && (user.id || user.phone || user.email)]);


  const unreadNotifCount = typeof unreadNotifCountRaw === 'number'
    ? unreadNotifCountRaw
    : (notifications || []).filter((n) => n && !n.read).length;


  return (
    <>
          {showProfilePage && !pdpProduct && user && (
            <div className="profile-page-shell w-full flex-1 flex flex-col bg-primary-50 dark:bg-primary-950">
            <div className="panel-content-wrap w-full max-w-none mx-auto px-2 sm:px-4 py-4 sm:py-10 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 sm:p-5 rounded-2xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-apple-blue text-white flex items-center justify-center text-xl font-bold">{(user.firstName || 'ک')[0]}</div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-white">{user.firstName} {user.lastName}</h1>
                    <p className="text-xs text-primary-500 dark:!text-white" dir="ltr">{String(user.phone).replace(/(\d{4})(\d{3})(\d{4})/, '$1***$3')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setProfileTab('edit')} className="text-xs px-3 py-1.5 rounded-full border plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium hover:bg-primary-50 dark:hover:bg-primary-800 transition flex items-center gap-1"><Icon name="pencil" size={14} /> ویرایش پروفایل</button>
                  <button type="button" onClick={logout} className="text-xs px-3 py-1.5 rounded-full border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center gap-1"><Icon name="logOut" size={14} /> خروج</button>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-6">
                <aside className="w-full md:w-48 lg:w-56 flex-shrink-0">
                  <div className="relative profile-tabs-outer">
                  <div className="profile-tabs-strip flex flex-nowrap md:flex-col gap-1 overflow-x-auto no-scrollbar md:overflow-visible px-2 pt-2 pb-2 pe-10 md:pe-2 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 shadow-sm">
                    {[
                      { id: 'dashboard', label: 'داشبورد', icon: 'home' },
                      { id: 'track', label: 'پیگیری سفارش', icon: 'package' },
                      { id: 'orders', label: 'سفارش‌ها', icon: 'package', badge: (orders || []).length },
                      { id: 'addresses', label: 'آدرس‌ها', icon: 'mapPin', badge: (addresses || []).length },
                      { id: 'wishlist', label: 'علاقه‌مندی‌ها', icon: 'heart', badge: (favorites || []).length },
                      { id: 'compare', label: 'مقایسه', icon: 'scale', badge: (compare || []).length },
                      { id: 'recent', label: 'بازدید اخیر', icon: 'eye', badge: (recentlyViewed || []).length },
                      { id: 'cart', label: 'سبد خرید', icon: 'shoppingBag', badge: typeof cartCount === 'number' ? cartCount : (cart || []).reduce((s, i) => s + (Number(i?.qty) || 0), 0) },
                      { id: 'notifications', label: 'اعلان‌ها', icon: 'bell', badge: unreadNotifCount },
                      { id: 'tickets', label: 'پشتیبانی', icon: 'mail', badge: (buyerTickets || []).filter(x => x.status === 'open').length || 0 },
                      { id: 'gifts', label: 'تخفیف و هدایا', icon: 'gift', badge: (buyerGifts || []).length },
                      { id: 'following', label: 'فروشندگان دنبال‌شده', icon: 'users', badge: Object.keys(sellerFollowed || {}).filter(k => sellerFollowed[k]).length || 0 },
                      { id: 'edit', label: 'اطلاعات حساب', icon: 'settings' },
                    ].map(t => {
                      const active = profileTab === t.id || (t.id === 'orders' && orderDetailId);
                      const n = Number(t.badge) || 0;
                      return (
                      <button key={t.id} type="button" onClick={() => {
                        setProfileTab(t.id); setOrderDetailId(null); setShowTracking(false);
                        try { window.scrollTo({ top: 0, behavior: 'auto' }); } catch (_) { try { window.scrollTo(0, 0); } catch (__) {} }
                      }} className={`flex-shrink-0 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap md:w-full md:text-right ${active ? 'bg-apple-blue text-white' : 'text-primary-700 dark:text-white/80 hover:bg-primary-50 dark:hover:bg-primary-900'}`}>
                        <Icon name={t.icon} size={16} /><span>{t.label}</span>
                        {n > 0 && (
                          <span className={`text-[11px] font-bold min-w-[1.25rem] h-5 px-1.5 rounded-full inline-flex items-center justify-center ${active ? 'bg-white/25 text-white' : 'bg-apple-blue text-white'}`}>
                            {toFa(n)}
                          </span>
                        )}
                      </button>
                      );
                    })}
                  </div>
                  {/* لبه محو موبایل — تب بعدی نیمه‌نمایان */}
                  <div className="profile-tabs-fade pointer-events-none absolute inset-y-0 left-0 w-14 md:hidden rounded-s-2xl bg-gradient-to-r from-white dark:from-primary-900 from-40% to-transparent" aria-hidden />
                  </div>
                </aside>
                <div className="flex-1 min-w-0 p-3 sm:p-5 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 shadow-sm">
                  {profileTab === 'dashboard' && !orderDetailId && (
                    <div className="space-y-6">
                      {/* وب‌اپ — اولین بخش داشبورد؛ پوش اجباری بدون دکمه فعال‌سازی */}
                      <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-primary-900 dark:text-white">نسخه وب‌اپ فروشگاه</p>
                          <p className="text-xs text-primary-500 dark:!text-white mt-0.5">نصب روی موبایل برای دسترسی سریع</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {!pwaInstalled ? (
                            <button type="button" onClick={installBuyerPwa} className="btn-cta px-4 py-2 rounded-full bg-apple-blue text-white text-xs font-medium whitespace-nowrap">
                              نصب وب‌اپ
                            </button>
                          ) : (
                            <span className="px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-medium">نصب‌شده</span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: 'در حال پردازش', value: (orders || []).filter(o => o.status === 'processing' || o.status === 'shipped').length, color: 'text-amber-600' },
                          { label: 'تحویل‌شده', value: (orders || []).filter(o => o.status === 'delivered').length, color: 'text-emerald-600' },
                          { label: 'علاقه‌مندی', value: favorites.length, color: 'text-rose-600' },
                          { label: 'آدرس‌ها', value: (addresses || []).length, color: 'text-blue-600' },
                        ].map(s => (
                          <div key={s.label} className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 text-center">
                            <p className={`text-2xl font-bold ${s.color}`}>{toFa(s.value)}</p>
                            <p className="text-xs text-primary-500 dark:!text-white mt-1">{s.label}</p>
                          </div>
                        ))}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h2 className="text-base font-bold text-primary-900 dark:text-white">آخرین سفارش‌ها</h2>
                          <button type="button" onClick={() => setProfileTab('orders')} className="text-xs text-apple-blue hover:underline">مشاهده همه</button>
                        </div>
                        {(orders || []).slice(0, 3).length === 0 ? (
                          <div className="text-center py-10 rounded-2xl bg-white dark:bg-primary-900 border border-dashed border-primary-200 dark:border-white/20">
                            <p className="text-sm text-primary-500 dark:!text-white">هنوز سفارشی ثبت نکرده‌اید</p>
                            <button type="button" onClick={() => { closeProfilePage(); openPLP(); }} className="mt-3 px-5 py-2 rounded-full bg-apple-blue text-white text-sm">مشاهده فروشگاه</button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {(orders || []).slice(0, 3).map(o => (
                              <button key={o.id} type="button" onClick={() => { setProfileTab('orders'); setOrderDetailId(o.id); }} className="w-full flex items-center gap-3 p-3 rounded-xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 hover:border-apple-blue/40 transition text-right">
                                <img src={(o.items && o.items[0]?.image) || '/logo.webp'} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-primary-900 dark:text-white truncate">{o.order_number || o.id}</p>
                                  <p className="text-xs text-primary-500 dark:!text-white">{o.date} · {toFa((o.items || []).reduce((s,i)=>s+(i.qty||0),0))} کالا · {formatPrice?.(o.total) || o.total}</p>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${orderStatusColor(o.status)}`}>{o.statusLabel}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {recentlyViewed.length > 0 && (
                        <div>
                          <div className="flex items-center justify-start gap-3 mb-3 w-full" dir="rtl">
                            <h2 className="text-base font-bold text-primary-900 dark:text-white">اخیراً دیده‌شده</h2>
                            <button type="button" onClick={() => { setRecentlyViewed([]); /* session only */ }} className="text-xs font-medium text-primary-500 dark:!text-white/80 hover:text-red-500 transition">پاک کردن</button>
                          </div>
                          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 justify-start" dir="rtl">
                            {recentlyViewed.slice(0, 12).map(p => (
                              <button key={p.id} type="button" onClick={() => { closeProfilePage(); openPDP(p); }} className="flex-shrink-0 w-28 text-right">
                                <img src={p.colors?.[0]?.image || p.image} alt={p.name} className="w-28 h-28 rounded-xl object-cover border border-primary-100 dark:border-white/10" />
                                <p className="text-xs mt-1.5 line-clamp-2 text-primary-800 dark:text-white">{p.name}</p>
                                <p className="text-xs font-bold text-primary-700 dark:text-white/80">{p.priceText} ت</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {true /*orders-tab*/ && profileTab === 'orders' && !orderDetailId && (
                    <div className="p-4 sm:p-5 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                        <h2 className="text-base font-bold text-primary-900 dark:text-white">سفارش‌های من</h2>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const { apiGetOrders } = await import('@/lib/api/orders');
                              const res = await apiGetOrders();
                              if (res?.ok && Array.isArray(res.mapped) && typeof saveBuyerOrders === 'function') {
                                saveBuyerOrders(res.mapped);
                                showToast({ message: 'سفارش‌ها به‌روز شد', variant: 'success', duration: 3000, position: 'top-center' });
                              } else {
                                showToast({ message: 'به‌روزرسانی انجام نشد', variant: 'default', duration: 3000, position: 'top-center' });
                              }
                            } catch (_) {
                              showToast({ message: 'خطا در دریافت سفارش‌ها', variant: 'default', duration: 3000, position: 'top-center' });
                            }
                          }}
                          className="text-xs px-3 py-1.5 rounded-full border border-primary-200 dark:border-white/20 text-primary-700 dark:text-white"
                        >
                          به‌روزرسانی
                        </button>
                      </div>
                      <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-4">
                        {[{ id: 'all', label: 'همه' },{ id: 'paid', label: 'پرداخت‌شده' },{ id: 'pending', label: 'در انتظار' },{ id: 'preparing', label: 'آماده‌سازی' },{ id: 'shipped', label: 'ارسال‌شده' },{ id: 'delivered', label: 'تحویل‌شده' },{ id: 'cancelled', label: 'لغو‌شده' }].map(f => (
                          <button key={f.id} type="button" onClick={() => setOrdersFilter(f.id)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition ${ordersFilter === f.id ? 'bg-primary-800 text-white border-primary-800 dark:bg-[#13ABC4] dark:border-[#13ABC4] dark:text-white' : 'plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium'}`}>{f.label}</button>
                        ))}
                      </div>
                      {(() => {
                        const list = (orders || []).filter(o => ordersFilter === 'all' || o.status === ordersFilter);
                        if (list.length === 0) return (<div className="text-center py-16 rounded-2xl bg-white dark:bg-primary-900 border border-dashed border-primary-200 dark:border-white/20"><Icon name="package" size={32} className="mx-auto text-primary-300 mb-3" /><p className="text-sm text-primary-500 dark:!text-white">سفارشی در این وضعیت نیست</p></div>);
                        return (
                          <div className="space-y-3">
                            {list.map(o => (
                              <button key={o.id} type="button" onClick={() => setOrderDetailId(o.id)} className="w-full p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 hover:border-apple-blue/40 transition text-right">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                  <div><p className="text-sm font-bold text-primary-900 dark:text-white">{o.order_number || o.id}</p><p className="text-xs text-primary-500 dark:!text-white mt-0.5">{o.date}</p></div>
                                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${orderStatusColor(o.status)}`}>{o.statusLabel}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {(o.items || []).slice(0, 3).map((it, i) => (<img key={i} src={it.image || '/logo.webp'} alt="" className="w-10 h-10 rounded-lg object-cover border border-primary-100 dark:border-white/10" />))}
                                  <div className="flex-1" />
                                  <p className="text-sm font-bold text-primary-900 dark:text-white">{toFa(Number(o.total || 0).toLocaleString())} <span className="text-xs font-normal text-primary-500">تومان</span></p>
                                </div>
                              </button>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  {profileTab === 'orders' && orderDetailId && (() => {
                    const o = (orders || []).find(x => x.id === orderDetailId);
                    if (!o) return null;
                    const items = Array.isArray(o.items) ? o.items : [];
                    const timeline = Array.isArray(o.timeline) && o.timeline.length
                      ? o.timeline
                      : [
                          { label: 'ثبت', done: true, date: o.date || o.created_at || '' },
                          { label: 'پرداخت', done: ['paid','preparing','shipped','delivered'].includes(o.status), date: o.paid_at || '' },
                          { label: 'آماده‌سازی', done: ['preparing','shipped','delivered'].includes(o.status) },
                          { label: 'ارسال', done: ['shipped','delivered'].includes(o.status), date: o.tracking_code ? '' : '' },
                          { label: 'تحویل', done: o.status === 'delivered' },
                        ];
                    const shipping = o.shipping || {
                      receiver: o.contact_snapshot?.name || o.receiver || '—',
                      phone: o.contact_snapshot?.phone || o.phone || '',
                      address: typeof o.address_snapshot === 'string' ? o.address_snapshot : (o.address_snapshot?.full || o.address || '—'),
                      method: o.shipping_method || '—',
                      cost: Number(o.shipping_cost || 0),
                    };
                    const payment = o.payment || {
                      method: o.payment_method || '—',
                      discount: Number(o.discount || o.discount_amount || 0),
                    };
                    const total = Number(o.total ?? o.payable ?? 0);
                    return (
                      <div className="p-4 sm:p-5 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                        <button type="button" onClick={() => { setOrderDetailId(null); setShowTracking(false); }} className="text-xs text-primary-500 hover:text-apple-blue mb-4 flex items-center gap-1"><Icon name="arrowRight" size={14} /> بازگشت به لیست سفارش‌ها</button>
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                          <div><h2 className="text-base font-bold text-primary-900 dark:text-white">{o.id}</h2><p className="text-xs text-primary-500 dark:!text-white">{o.date}</p></div>
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${orderStatusColor(o.status)}`}>{o.statusLabel}</span>
                        </div>
                        <div className="mb-6 p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                          <h3 className="text-sm font-bold text-primary-900 dark:text-white mb-4">وضعیت سفارش</h3>
                          <div className="overflow-x-auto pb-1">
                            <div className="flex items-start min-w-[480px] gap-0">
                              {timeline.map((t, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center text-center relative px-1">
                                  {i < timeline.length - 1 && (
                                    <div className={`absolute top-3 right-1/2 left-0 h-0.5 ${timeline[i + 1]?.done || t.done ? 'bg-apple-blue' : 'bg-primary-200 dark:bg-primary-700'}`} style={{ right: '50%', left: 'auto', width: '100%', transform: 'translateX(50%)' }} />
                                  )}
                                  <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${t.done ? 'bg-apple-blue text-white shadow-md' : 'bg-primary-100 dark:bg-primary-800 text-primary-400 border border-primary-200 dark:border-white/10'}`}>{t.done ? <Icon name="check" size={14} /> : <span className="text-xs">{toFa(i + 1)}</span>}</div>
                                  <p className={`text-xs font-medium mt-2 ${t.done ? 'text-primary-900 dark:text-white' : 'text-primary-400'}`}>{t.label}</p>
                                  {t.date ? <p className="text-xs text-primary-400 dark:!text-white mt-0.5 leading-tight">{t.date}</p> : null}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="mb-6 p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                          <h3 className="text-sm font-bold text-primary-900 dark:text-white mb-3">کالاها</h3>
                          <div className="space-y-3">
                            {items.map((it, i) => (
                              <div key={i} className="flex gap-3">
                                <img src={it.image || it.image_url || "/logo.webp"} alt="" className="w-16 h-16 rounded-xl object-cover border border-primary-100 dark:border-white/10" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-primary-900 dark:text-white line-clamp-2">{it.name}</p>
                                  <p className="text-xs text-primary-500 dark:!text-white mt-0.5">{it.color || it.color_name || '—'} · سایز {it.size || '—'} · {toFa(it.qty || 1)} عدد</p>
                                  <p className="text-xs font-bold text-primary-800 dark:text-white mt-1">{toFa(Number(it.price ?? it.unit_price ?? it.line_total ?? 0).toLocaleString())} تومان</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4 mb-6">
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                            <h3 className="text-sm font-bold text-primary-900 dark:text-white mb-2">اطلاعات ارسال</h3>
                            <p className="text-xs text-primary-700 dark:text-white/80">{shipping.receiver}</p>
                            <p className="text-xs text-primary-500 dark:!text-white mt-0.5" dir="ltr">{shipping.phone}</p>
                            <p className="text-xs text-primary-600 dark:text-white/70 mt-1 leading-relaxed">{shipping.address}</p>
                            <p className="text-xs text-primary-400 mt-2">{shipping.method} · {toFa(Number(shipping.cost || 0).toLocaleString())} تومان</p>
                          </div>
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                            <h3 className="text-sm font-bold text-primary-900 dark:text-white mb-2">اطلاعات پرداخت</h3>
                            <div className="space-y-1 text-xs text-primary-600 dark:text-white/70">
                              <div className="flex justify-between"><span>روش</span><span>{payment.method}</span></div>
                              <div className="flex justify-between"><span>مبلغ کالا</span><span>{toFa(Number(total - Number(shipping.cost || 0) + Number(payment.discount || 0)).toLocaleString())} ت</span></div>
                              {Number(payment.discount) > 0 && <div className="flex justify-between text-emerald-600"><span>تخفیف</span><span>−{toFa(Number(payment.discount).toLocaleString())} ت</span></div>}
                              <div className="flex justify-between"><span>ارسال</span><span>{toFa(Number(shipping.cost || 0).toLocaleString())} ت</span></div>
                              <div className="flex justify-between font-bold text-primary-900 dark:text-white pt-1 border-t border-primary-100 dark:border-white/10"><span>نهایی</span><span>{toFa(Number(total).toLocaleString())} تومان</span></div>
                            </div>
                          </div>
                          <div className="mb-4 p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                            <h3 className="text-sm font-bold text-primary-900 dark:text-white mb-2">تماس با فروشنده</h3>
                            <p className="text-xs text-primary-600 dark:text-white/70 mb-2">{(o.sellerContact && o.sellerContact.shopName) || (o.items && o.items[0] && (o.items[0].sellerName || (o.items[0].seller && o.items[0].seller.name))) || 'فروشنده'}</p>
                            {(() => {
                              const phone = String((o.sellerContact && o.sellerContact.phone) || (o.items && o.items[0] && o.items[0].seller && o.items[0].seller.phone) || o.sellerPhone || '').trim();
                              const bale = (o.sellerContact && o.sellerContact.bale) || (phone ? `https://ble.ir/${onlyDigits(phone)}` : 'https://ble.ir');
                              return (
                                <div className="flex flex-col items-start gap-1.5">
                                  {phone ? (
                                    <a href={'tel:' + onlyDigits(phone)} className="text-xs text-primary-900 dark:text-white font-medium" dir="ltr">{phone}</a>
                                  ) : (
                                    <span className="text-xs text-primary-400">شماره تلفن ثبت نشده</span>
                                  )}
                                  <a href={bale} target="_blank" rel="noopener noreferrer" className="text-xs text-apple-blue font-medium">لینک پشتیبانی بله فروشنده</a>
                                </div>
                              );
                            })()}
                          </div>
                          {o.cancelReason && (
                            <div className="mb-4 p-4 rounded-2xl border border-red-200 dark:border-red-500/30 bg-red-50/50 dark:bg-red-950/20">
                              <h3 className="text-sm font-bold text-red-700 dark:text-red-300 mb-1">لغو سفارش</h3>
                              <p className="text-xs text-primary-700 dark:text-white/80 mb-2">دلیل: {o.cancelReason}</p>
                              {o.refundNote && <p className="text-xs text-primary-600 dark:text-white/70 leading-relaxed">{o.refundNote}</p>}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {o.status === 'pending_payment' && (
                            <button type="button" onClick={() => { setPendingPayOrder(o); setShowProfilePage(false); setShowCheckout(true); setOrderSuccess(null); setOrderFailed(null); }} className="px-4 py-2 rounded-full bg-apple-blue text-white text-xs font-medium">ادامه پرداخت</button>
                          )}
                          {o.tracking && (<button type="button" onClick={() => setShowTracking(v => !v)} className="px-4 py-2 rounded-full bg-apple-blue text-white text-xs font-medium hover:opacity-90 transition">{showTracking ? 'بستن پیگیری' : 'پیگیری مرسوله'}</button>)}
                          {(o.status === 'pending_payment' || o.status === 'pending' || o.status === 'processing') && (
                          <button
                            type="button"
                            onClick={() => {
                              siteConfirm('لغو این سفارش؟').then(async (ok) => {
                                if (!ok) return;
                                try {
                                  const res = await fetch(`/api/orders/${o.id}`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    credentials: 'include',
                                    body: JSON.stringify({ action: 'cancel' }),
                                  });
                                  const data = await res.json().catch(() => ({}));
                                  if (!res.ok || !data?.ok) {
                                    showToast({ message: data?.error || 'لغو سفارش ناموفق بود', variant: 'error', duration: 4500, position: 'top-center' });
                                    return;
                                  }
                                  const next = (orders || []).map((x) =>
                                    x.id === o.id ? { ...x, status: 'cancelled', statusLabel: 'لغو‌شده' } : x
                                  );
                                  saveBuyerOrders(next);
                                  showToast({ message: 'سفارش لغو شد', variant: 'success', duration: 3500, position: 'top-center' });
                                } catch (_) {
                                  showToast({ message: 'خطا در لغو سفارش', variant: 'error', duration: 4500, position: 'top-center' });
                                }
                              });
                            }}
                            className="px-4 py-2 rounded-full border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition"
                          >
                            لغو سفارش
                          </button>
                        )}
                          {(o.status === 'delivered' || o.status === 'shipped') && (
                            <button type="button" onClick={() => setOrderReturnOpen(o.id)} className="px-4 py-2 rounded-full border plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium text-xs font-medium">درخواست مرجوعی</button>
                          )}
                          <button type="button" onClick={() => printOrderInvoice(o)} className="px-4 py-2 rounded-full border plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium text-xs font-medium hover:bg-primary-50 dark:hover:bg-primary-800 transition flex items-center gap-1.5"><Icon name="printer" size={14} /> چاپ / دانلود فاکتور</button>
                          {o.status === 'delivered' && !o.rated && (
                            <button type="button" onClick={() => setOrderRateDraft(d => ({ ...(d || {}), [o.id]: (d || {})[o.id] || { rating: 5, text: '' } }))} className="px-4 py-2 rounded-full border border-amber-300 text-amber-700 text-xs font-medium">امتیازدهی</button>
                          )}
                          <button type="button" onClick={() => {
                            const _tcode = generateTicketCode(); const t = { id: _tcode, code: _tcode, channel: 'ticket', type: 'ticket', fromChat: false, orderId: o.id, subject: `پشتیبانی سفارش ${o.id}`, status: 'open', date: o.date, messages: [{ from: 'buyer', text: 'درخواست پشتیبانی برای این سفارش', date: o.date }] }; mirrorConversationToAdmin(t, 'خریدار');
                            const next = [t, ...buyerTickets];
                            saveBuyerTickets(next);
                            showToast({ message: 'تیکت ثبت شد. از تب پشتیبانی پیگیری کنید.', variant: 'success', duration: 4500, position: 'top-center' });
                            setProfileTab('tickets');
                          }} className="px-4 py-2 rounded-full border plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium text-xs font-medium">تیکت پشتیبانی</button>
                          <button type="button" onClick={() => { items.forEach(it => { const p = products.find(x => x.id === it.id); if (p) addToCart(p, { qty: it.qty, size: it.size }); }); }} className="px-4 py-2 rounded-full border plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium text-xs font-medium">تکرار سفارش</button>
                        </div>
                        {orderReturnOpen === o.id && (
                          <div className="mt-4 p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-2">
                            <p className="text-sm font-bold text-primary-900 dark:text-white">درخواست مرجوعی</p>
                            <Textarea id="return-reason" rows={3} placeholder="دلیل مرجوعی..." style={{ minHeight: 96 }} />
                            <div className="flex gap-2">
                              <button type="button" onClick={async () => {
                                const reason = document.getElementById('return-reason')?.value || '';
                                const _tcode = generateTicketCode(); const t = { id: _tcode, code: _tcode, channel: 'return', type: 'return', fromChat: false, orderId: o.id, subject: `مرجوعی ${o.id}`, status: 'open', date: o.date, messages: [{ from: 'buyer', text: reason || 'درخواست مرجوعی', date: o.date }] }; mirrorConversationToAdmin(t, 'خریدار');
                                const nextT = [t, ...buyerTickets];
                                saveBuyerTickets(nextT);
                                const next = (orders || []).map(x => x.id === o.id ? { ...x, status: o.status, statusLabel: (o.statusLabel || o.status), returnRequested: true } : x);
                                saveBuyerOrders(next);
                                setOrderReturnOpen(null);
                                try {
                                  const res = await fetch(`/api/orders/${o.id}/return`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    credentials: 'include',
                                    body: JSON.stringify({ reason: 'درخواست مرجوعی از پنل خریدار' }),
                                  });
                                  const data = await res.json().catch(() => ({}));
                                  if (!res.ok || !data?.ok) {
                                    showToast({ message: data?.error || 'ثبت مرجوعی ناموفق', variant: 'error', duration: 4500, position: 'top-center' });
                                    return;
                                  }
                                  showToast({ message: 'درخواست مرجوعی ثبت شد', variant: 'success', duration: 4500, position: 'top-center' });
                                } catch (_) {
                                  showToast({ message: 'خطا در ثبت مرجوعی', variant: 'error', duration: 4500, position: 'top-center' });
                                  return;
                                }
                              }} className="px-4 py-2 rounded-full bg-apple-blue text-white text-xs font-medium">ثبت درخواست</button>
                              <button type="button" onClick={() => setOrderReturnOpen(null)} className="px-4 py-2 rounded-full border text-xs">انصراف</button>
                            </div>
                          </div>
                        )}
                        {(orderRateDraft && orderRateDraft[o.id]) && (
                          <div className="mt-4 p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-2">
                            <p className="text-sm font-bold text-primary-900 dark:text-white">امتیاز به سفارش</p>
                            <div className="flex gap-1">
                              {[1,2,3,4,5].map(n => (
                                <button key={n} type="button" onClick={() => setOrderRateDraft(d => ({ ...(d || {}), [o.id]: { ...((d || {})[o.id] || {}), rating: n } }))} className={`text-lg ${ ((orderRateDraft || {})[o.id]?.rating || 0) >= n ? 'text-amber-400' : 'text-primary-200'}`}>★</button>
                              ))}
                            </div>
                            <Textarea value={(orderRateDraft || {})[o.id]?.text || ''} onChange={(v) => setOrderRateDraft(d => ({ ...(d || {}), [o.id]: { ...((d || {})[o.id] || {}), text: v || '' } }))} rows={2} placeholder="نظر شما (اختیاری)" style={{ minHeight: 72 }} />
                            <button type="button" onClick={async () => {
                              const draft = (orderRateDraft || {})[o.id] || { rating: 5, text: '' };
                              const firstItem = (o.items || [])[0];
                              const productId = firstItem?.product_id || firstItem?.productId || firstItem?.id;
                              if (!productId) {
                                showToast({ message: 'آیتم سفارش برای امتیاز یافت نشد', variant: 'error', duration: 4500, position: 'top-center' });
                                return;
                              }
                              try {
                                let anyFail = null;
                                for (const it of rateItems) {
                                  const pid = it.product_id || it.productId || it.id;
                                  const res = await fetch(`/api/orders/${o.id}/review`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    credentials: 'include',
                                    body: JSON.stringify({
                                      product_id: pid,
                                      rating: Number(draft.rating) || 5,
                                      comment: draft.text || '',
                                    }),
                                  });
                                  const data = await res.json().catch(() => ({}));
                                  if (!res.ok || !data?.ok) anyFail = data?.error || 'ثبت امتیاز ناموفق بود';
                                }
                                if (anyFail) {
                                  showToast({ message: anyFail, variant: 'error', duration: 4500, position: 'top-center' });
                                  return;
                                }
                              } catch (_) {
                                showToast({ message: 'خطا در ثبت امتیاز', variant: 'error', duration: 4500, position: 'top-center' });
                                return;
                              }
                              const next = (orders || []).map(x => x.id === o.id ? { ...x, rated: true, rating: draft.rating, ratingText: draft.text } : x);
                              saveBuyerOrders(next);
                              setOrderRateDraft(d => { const n = { ...(d || {}) }; delete n[o.id]; return n; });
                              showToast({ message: 'امتیاز ثبت شد. متشکریم!', variant: 'success', duration: 4500, position: 'top-center' });
                            }} className="px-4 py-2 rounded-full bg-apple-blue text-white text-xs font-medium">ثبت امتیاز</button>
                          </div>
                        )}
                        {showTracking && o.tracking && (
                          <div className="mt-5 p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-primary-50/50 dark:bg-primary-900/30">
                            <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-bold text-primary-900 dark:text-white">پیگیری مرسوله</h3><span className="text-xs text-primary-500 dark:!text-white">{o.tracking.carrier}</span></div>
                            <div className="flex items-center gap-2 mb-4 p-2.5 rounded-xl bg-white dark:bg-primary-900 border border-primary-100 dark:border-white/10">
                              <span className="text-xs text-primary-500">کد رهگیری:</span>
                              <span className="text-xs font-bold text-primary-900 dark:text-white" dir="ltr">{o.tracking.code}</span>
                              <button type="button" onClick={() => { try { navigator.clipboard.writeText(o.tracking.code); } catch(_){} }} className="mr-auto p-1 rounded hover:bg-primary-50 dark:hover:bg-primary-800" title="کپی"><Icon name="copy" size={14} /></button>
                            </div>
                            <p className="text-xs text-primary-500 dark:!text-white mb-3">تحویل تقریبی: {o.tracking.eta}</p>
                            <div className="flex items-start w-full overflow-x-auto no-scrollbar pb-1" dir="rtl">
                              {o.tracking.steps.map((s, i) => (
                                <div key={i} className="flex-1 min-w-[4.75rem] flex flex-col items-center text-center relative px-1">
                                  {i < o.tracking.steps.length - 1 && (
                                    <div className={`absolute top-2.5 right-[calc(50%+10px)] left-0 h-0.5 ${s.done && o.tracking.steps[i + 1]?.done ? 'bg-apple-blue' : 'bg-primary-200 dark:bg-primary-700'}`} aria-hidden />
                                  )}
                                  <div className={`relative z-[1] w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${s.done ? 'bg-apple-blue text-white' : 'bg-primary-200 dark:bg-primary-700 text-primary-400'}`}>{s.done ? <Icon name="check" size={12} /> : null}</div>
                                  <p className={`text-xs mt-2 leading-snug ${s.done ? 'text-primary-900 dark:text-white font-medium' : 'text-primary-400'}`}>{s.label}</p>
                                  {s.date ? <p className="text-xs text-primary-400 mt-0.5 leading-tight">{s.date}</p> : null}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}


                  {profileTab === 'track' && (
                    <div className="p-4 sm:p-5 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-4">
                      <h2 className="text-base font-bold text-primary-900 dark:text-white">پیگیری سفارش</h2>
                      <p className="text-xs text-primary-500">شماره سفارش یا کد رهگیری را وارد کنید.</p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          dir="ltr"
                          value={trackCode}
                          onChange={(e) => setTrackCode(e.target.value)}
                          placeholder=""
                          className="flex-1 px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left"
                        />
                        <button
                          type="button"
                          disabled={trackLoading}
                          onClick={async () => {
                            const code = (trackCode || '').trim();
                            if (!code) {
                              showToast({ message: 'کد را وارد کنید', variant: 'default', position: 'top-center' });
                              return;
                            }
                            setTrackLoading(true);
                            setTrackResult(null);
                            try {
                              const res = await fetch('/api/orders/track', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify({ code }),
                              });
                              const data = await res.json().catch(() => ({}));
                              if (!res.ok || !data?.ok) {
                                showToast({ message: data?.error || 'سفارش یافت نشد', variant: 'error', position: 'top-center' });
                              } else {
                                setTrackResult(data.order);
                              }
                            } catch (_) {
                              showToast({ message: 'خطا در پیگیری', variant: 'error', position: 'top-center' });
                            } finally {
                              setTrackLoading(false);
                            }
                          }}
                          className="px-5 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium disabled:opacity-60"
                        >
                          {trackLoading ? 'در حال بررسی…' : 'پیگیری'}
                        </button>
                      </div>
                      {trackResult && (
                        <div className="p-4 rounded-xl border border-primary-200 dark:border-white/15 space-y-2">
                          <div className="flex justify-between gap-2 items-start">
                            <p className="text-sm font-bold text-primary-900 dark:text-white">{trackResult.order_number}</p>
                            <span className="text-xs px-2.5 py-1 rounded-full bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-white">{trackResult.statusLabel}</span>
                          </div>
                          {trackResult.tracking_code ? (
                            <p className="text-xs text-primary-500">کد رهگیری: <span dir="ltr" className="font-latin">{trackResult.tracking_code}</span></p>
                          ) : null}
                          <p className="text-xs text-primary-500">مبلغ: {toFa(Number(trackResult.payable || trackResult.total || 0).toLocaleString())} تومان</p>
                          <ul className="text-xs text-primary-600 dark:text-white/80 space-y-1">
                            {(trackResult.items || []).map((it) => (
                              <li key={it.id}>{it.name} × {toFa(it.qty)}</li>
                            ))}
                          </ul>
                          <button
                            type="button"
                            className="text-xs text-apple-blue"
                            onClick={() => { setOrderDetailId(trackResult.id); setProfileTab('orders'); }}
                          >
                            مشاهده جزئیات کامل
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {profileTab === 'addresses' && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-bold text-primary-900 dark:text-white">آدرس‌های من</h2>
                      <button type="button" onClick={() => { setEditingAddressId(null); setAddressForm({ title: 'خانه', receiver: user.firstName + (user.lastName ? ' ' + user.lastName : ''), phone: user.phone, province: '', city: '', street: '', plaque: '', unit: '', address: '', postal: '', isDefault: false }); setAddressFormOpen(true); }} className="text-xs px-3 py-1.5 rounded-full bg-apple-blue text-white font-medium flex items-center gap-1"><Icon name="plus" size={14} /> افزودن آدرس</button>
                      </div>
                      {(addresses || []).length === 0 ? (
                        <div className="text-center py-16 rounded-2xl bg-white dark:bg-primary-900 border border-dashed border-primary-200 dark:border-white/20"><Icon name="mapPin" size={32} className="mx-auto text-primary-300 mb-3" /><p className="text-sm text-primary-500 dark:!text-white mb-3">هنوز آدرسی ثبت نکرده‌اید</p><button type="button" onClick={() => setAddressFormOpen(true)} className="px-5 py-2 rounded-full bg-apple-blue text-white text-sm">افزودن اولین آدرس</button></div>
                      ) : (
                        <div className="space-y-3">
                          {(addresses || []).map(a => (
                            <div key={a.id} className={`p-4 rounded-2xl border bg-white dark:bg-primary-900 ${a.isDefault ? 'border-apple-blue' : 'border-primary-200 dark:border-white/15'}`}>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2"><span className="text-sm font-bold text-primary-900 dark:text-white">{a.title}</span>{a.isDefault && <span className="text-xs px-2 py-0.5 rounded-full bg-apple-blue/10 text-apple-blue font-medium text-white">پیش‌فرض</span>}</div>
                                <div className="flex items-center gap-1">
                                  <button type="button" onClick={() => { setEditingAddressId(a.id); setAddressForm({ ...a }); setAddressFormOpen(true); }} className="p-1.5 rounded-full hover:bg-primary-50 dark:hover:bg-primary-800 text-primary-500"><Icon name="pencil" size={14} /></button>
                                  <button type="button" onClick={() => setAddressDeleteConfirm(a.id)} className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Icon name="trash" size={14} /></button>
                                </div>
                              </div>
                              <p className="text-xs text-primary-700 dark:text-white/80">{a.receiver} · <span dir="ltr">{a.phone}</span></p>
                              <p className="text-xs text-primary-500 dark:!text-white mt-1 leading-relaxed">{a.province}، {a.city}، {a.address}</p>
                              <p className="text-xs text-primary-400 mt-1">کد پستی: {a.postal}</p>
                              {!a.isDefault && (<button type="button" onClick={() => saveAddresses((addresses || []).map(x => ({ ...x, isDefault: x.id === a.id })))} className="mt-2 text-xs text-apple-blue hover:underline">تعیین به‌عنوان پیش‌فرض</button>)}
                              {addressDeleteConfirm === a.id && (
                                <div className="mt-2 flex items-center gap-2">
                                  <button type="button" onClick={() => { saveAddresses((addresses || []).filter(x => x.id !== a.id)); setAddressDeleteConfirm(null); }} className="text-xs px-3 py-1 rounded-full bg-red-500 text-white">تأیید حذف</button>
                                  <button type="button" onClick={() => setAddressDeleteConfirm(null)} className="text-xs px-3 py-1 rounded-full border border-primary-200 dark:border-white/30">لغو</button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {addressFormOpen && (
                        <div className="site-modal-root" role="dialog" aria-modal="true">
                          <div className="site-modal-backdrop" onClick={() => setAddressFormOpen(false)} />
                          <div className="site-modal-panel bg-white dark:bg-primary-900 p-5 border border-primary-200 dark:border-white/15">
                            <h3 className="text-base font-bold text-primary-900 dark:text-white mb-4">{editingAddressId ? 'ویرایش آدرس' : 'افزودن آدرس جدید'}</h3>
                            <div className="space-y-3">
                              <div><label className="text-xs text-primary-500 mb-1 block">عنوان</label><div className="flex gap-2">{['خانه', 'محل کار', 'سایر'].map(t => (<button key={t} type="button" onClick={() => setAddressForm(f => ({ ...f, title: t }))} className={`px-3 py-1.5 rounded-full text-xs border ${addressForm.title === t ? 'bg-apple-blue text-white border-apple-blue' : 'plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium'}`}>{t}</button>))}</div></div>
                              <div><label className="text-xs text-primary-500 mb-1 block">نام گیرنده</label><input value={addressForm.receiver} onChange={e => setAddressForm(f => ({ ...f, receiver: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue" /></div>
                              <div><label className="text-xs text-primary-500 mb-1 block">شماره موبایل</label><input value={addressForm.phone} onChange={e => setAddressForm(f => ({ ...f, phone: e.target.value }))} dir="ltr" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue text-left" placeholder="09xxxxxxxxx" /></div>
                              <div className="grid grid-cols-2 gap-3">
                                <div><label className="text-xs text-primary-500 mb-1 block">استان</label><input value={addressForm.province} onChange={e => setAddressForm(f => ({ ...f, province: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue" /></div>
                                <div><label className="text-xs text-primary-500 mb-1 block">شهر</label><input value={addressForm.city} onChange={e => setAddressForm(f => ({ ...f, city: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue" /></div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                  <label className="text-xs text-primary-500 mb-1 block">خیابان <span className="text-red-500">*</span></label>
                                  <input value={addressForm.street || ''} onChange={e => setAddressForm(f => ({ ...f, street: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue" placeholder="نام خیابان" />
                                </div>
                                <div>
                                  <label className="text-xs text-primary-500 mb-1 block">پلاک <span className="text-red-500">*</span></label>
                                  <input value={addressForm.plaque || ''} onChange={e => setAddressForm(f => ({ ...f, plaque: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue" placeholder="پلاک" />
                                </div>
                                <div>
                                  <label className="text-xs text-primary-500 mb-1 block">واحد (زنگ) <span className="text-red-500">*</span></label>
                                  <input value={addressForm.unit || ''} onChange={e => setAddressForm(f => ({ ...f, unit: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue" placeholder="واحد / زنگ" />
                                </div>
                              </div>

                              <div><label className="text-xs text-primary-500 mb-1 block">کد پستی</label><input value={addressForm.postal} onChange={e => setAddressForm(f => ({ ...f, postal: onlyDigits(e.target.value).slice(0, 10) }))} dir="ltr" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue text-left" placeholder="۱۰ رقم" /></div>
                              <div className="space-y-2">
                                <p className="text-xs text-primary-500">موقعیت روی نقشه <span className="text-primary-400 font-normal">(اختیاری)</span></p>
</div>
                              <label className="flex items-center gap-2 text-xs text-primary-700 dark:text-white cursor-pointer"><input type="checkbox" checked={addressForm.isDefault} onChange={e => setAddressForm(f => ({ ...f, isDefault: e.target.checked }))} className="rounded" />آدرس پیش‌فرض</label>
                            </div>
                            <div className="flex gap-2 mt-5">
                              <button type="button" onClick={() => {
                                const phoneOk = onlyDigits(addressForm.phone || '').length === 11;
                                if (!addressForm.receiver?.trim() || !phoneOk || !addressForm.province?.trim() || !addressForm.city?.trim() || !addressForm.street?.trim() || !addressForm.plaque?.trim() || !addressForm.unit?.trim() || onlyDigits(addressForm.postal || '').length !== 10) {
                                  showToast({ message: 'همه فیلدهای اجباری را پر کنید (خیابان، پلاک، واحد، موبایل ۱۱ رقم، کد پستی ۱۰ رقم)', variant: 'default', duration: 4500, position: 'top-center' });
                                  return;
                                }
                                const lineParts = [];
                                if (addressForm.street?.trim()) lineParts.push('خیابان ' + addressForm.street.trim());
                                if (addressForm.plaque?.trim()) lineParts.push('پلاک ' + addressForm.plaque.trim());
                                if (addressForm.unit?.trim()) lineParts.push('واحد (زنگ) ' + addressForm.unit.trim());
                                const addressLine = lineParts.join('، ');
                                const payload = { ...addressForm, address: addressLine, phone: onlyDigits(addressForm.phone), postal: onlyDigits(addressForm.postal) };
                                if (editingAddressId) {
                                  let next = (addresses || []).map(x => x.id === editingAddressId ? { ...payload, id: editingAddressId } : (payload.isDefault ? { ...x, isDefault: false } : x));
                                  saveAddresses(next);
                                } else {
                                  const newA = { ...payload, id: 'addr' + Date.now() };
                                  let next = payload.isDefault ? (addresses || []).map(x => ({ ...x, isDefault: false })).concat(newA) : [...(addresses || []), newA];
                                  saveAddresses(next);
                                }
                                setAddressFormOpen(false);
                              }} className="flex-1 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium">ذخیره</button>
                              <button type="button" onClick={() => setAddressFormOpen(false)} className="px-5 py-2.5 rounded-full border border-primary-200 dark:border-white/30 text-sm text-primary-700 dark:text-white">لغو</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {profileTab === 'wishlist' && (
                    <div className="p-4 sm:p-5 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-4">
                      <h2 className="text-base font-bold text-primary-900 dark:text-white">علاقه‌مندی‌ها ({toFa(favorites.length + likedBlogs.length)})</h2>
                      <div
                        className="wishlist-two-col w-full"
                        style={{ display: 'flex', flexDirection: 'row-reverse', flexWrap: 'wrap', alignItems: 'flex-start', gap: '1.5rem', width: '100%' }}
                      >
                        <div className="wishlist-col-products space-y-3 min-w-0" style={{ flex: '1 1 300px', minWidth: '260px', maxWidth: '100%' }}>
                          <h3 className="text-sm font-bold text-primary-900 dark:text-white">محصولات لایک‌شده ({toFa((wishlistProducts || []).length)})</h3>
                          {(wishlistProducts || []).length === 0 ? (
                            <p className="text-sm text-primary-500 text-center py-8">کالایی در علاقه‌مندی‌ها نیست</p>
                          ) : (
                            <div className="space-y-3">
                              {(wishlistProducts || []).map(p => (
                                <div key={p.id} className={`flex gap-3 p-3 rounded-xl border ${p.missing ? 'border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20' : 'border-primary-100 dark:border-white/10 bg-primary-50/40 dark:bg-primary-900/30'}`}>
                                  <button type="button" onClick={() => { if (!p.missing) { closeProfilePage(); openPDP(p); } }} className="flex-shrink-0" disabled={!!p.missing}>
                                    {p.missing ? (
                                      <div className="w-16 h-20 rounded-lg bg-primary-200/50 dark:bg-primary-800 flex items-center justify-center text-xs text-primary-500">حذف شده</div>
                                    ) : (
                                      <img src={p.colors?.[0]?.image || p.image} alt={p.name || "محصول"} className="w-16 h-20 object-cover rounded-lg" onError={(e) => { e.currentTarget.classList.add("img-broken"); e.currentTarget.src = "/logo.webp"; }} />
                                    )}
                                  </button>
                                  <div className="flex-1 min-w-0 text-right">
                                    {p.missing ? (
                                      <>
                                        <p className="text-xs font-medium text-primary-700 dark:text-white/80">این کالا دیگر عرضه نمی‌شود</p>
                                        <button type="button" onClick={() => toggleFavorite(p.id)} className="mt-2 text-xs text-red-500">حذف از لیست</button>
                                      </>
                                    ) : (
                                      <>
                                        <button type="button" onClick={() => { closeProfilePage(); openPDP(p); }} className="w-full text-right">
                                          <p className="text-xs font-medium text-primary-900 dark:text-white line-clamp-2">{p.name}</p>
                                          <p className="text-xs font-bold mt-1 text-primary-900 dark:text-white">{p.priceText} تومان</p>
                                        </button>
                                        <div className="flex justify-start gap-1.5 mt-2" dir="rtl">
                                          <button type="button" onClick={() => addToCart(p)} className="inline-flex flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-apple-blue text-white">افزودن به سبد</button>
                                          <button type="button" onClick={() => toggleFavorite(p.id)} className="px-2.5 py-1.5 rounded-full border border-primary-200 dark:border-white/20 text-xs text-red-500">حذف</button>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="wishlist-col-blogs space-y-3 min-w-0" style={{ flex: '1 1 300px', minWidth: '260px', maxWidth: '100%' }}>
                          <h3 className="text-sm font-bold text-primary-900 dark:text-white">بلاگ‌های لایک‌شده ({toFa(likedBlogs.length)})</h3>
                          {likedBlogs.length === 0 ? (
                            <p className="text-sm text-primary-500 text-center py-8">هنوز مطلب بلاگی لایک نکرده‌اید</p>
                          ) : (
                            <div className="space-y-2">
                              {likedBlogs.map(lb => {
                                const post = blogPosts.find(bp => String(bp.id) === String(lb.id));
                                if (!post) return null;
                                return (
                                  <div key={post.id} className="flex gap-2 items-center p-2 rounded-lg border border-primary-100 dark:border-white/10">
                                    <button type="button" className="flex-1 text-right text-xs font-medium text-primary-900 dark:text-white line-clamp-2" onClick={() => { closeProfilePage(); openStaticPage('blog-post', { blogId: post.id }); }}>{post.title}</button>
                                    <button type="button" onClick={() => toggleBlogLike(post.id)} className="text-xs text-red-500 flex-shrink-0">حذف</button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {profileTab === 'compare' && (
                    <div className="p-4 sm:p-5 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-base font-bold text-primary-900 dark:text-white">مقایسه ({toFa(compare.length)})</h2>
                        {compare.length > 0 && <button type="button" onClick={clearCompare} className="text-xs text-red-500">پاک کردن</button>}
                      </div>
                      {compare.length === 0 ? (
                        <div className="text-center py-12 px-3">
                        <p className="text-sm text-primary-500 dark:text-white/70 mb-4">کالایی برای مقایسه انتخاب نشده</p>
                        <button type="button" onClick={() => { setCompareOpen(false); openPLP(); }} className="inline-flex px-5 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium">مشاهده محصولات</button>
                      </div>
                      ) : (
                        <div className="space-y-3">
                          {compare.map(p => (
                            <div key={p.id} className="flex gap-3 p-3 rounded-xl border border-primary-100 dark:border-white/10 bg-primary-50/40 dark:bg-primary-900/30">
                              <button type="button" onClick={() => { closeProfilePage(); openPDP(p); }} className="flex-shrink-0">
                                <img src={p.colors?.[0]?.image || p.image} alt={p.name || "محصول"} className="w-16 h-20 object-cover rounded-lg" onError={(e) => { e.currentTarget.classList.add("img-broken"); e.currentTarget.src = "/logo.webp"; }} />
                              </button>
                              <div className="flex-1 min-w-0 text-right">
                                <button type="button" onClick={() => { closeProfilePage(); openPDP(p); }} className="w-full text-right">
                                  <p className="text-xs font-medium text-primary-900 dark:text-white line-clamp-2">{p.name}</p>
                                  <p className="text-xs font-bold mt-1 text-primary-900 dark:text-white">{p.priceText} تومان</p>
                                </button>
                                <button type="button" onClick={() => toggleCompare(p)} className="mt-2 text-xs text-red-500">حذف از مقایسه</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {compare.length >= 2 && (
                        <div className="flex w-full justify-end" dir="ltr">
                          <button type="button" onClick={() => { closeProfilePage(); openComparePage(); }} className="px-5 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium">مشاهده جدول مقایسه کامل</button>
                        </div>
                      )}
                    </div>
                  )}
                  {profileTab === 'recent' && (
                    <div className="p-4 sm:p-5 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-4">
                      <div className="flex items-center justify-start gap-3 w-full" dir="rtl">
                        <h2 className="text-base font-bold text-primary-900 dark:text-white">بازدید اخیر ({toFa((recentlyViewed || []).length)})</h2>
                        {(recentlyViewed || []).length > 0 && <button type="button" onClick={() => { setRecentlyViewed([]); /* session only */ }} className="text-xs font-medium text-primary-500 dark:!text-white/80 hover:text-red-500">پاک کردن</button>}
                      </div>
                      {(recentlyViewed || []).length === 0 ? (
                        <p className="text-sm text-primary-500 text-center py-10">هنوز بازدیدی ثبت نشده</p>
                      ) : (
                        <div className="space-y-3">
                          {(recentlyViewed || []).map(p => (
                            <button key={p.id} type="button" onClick={() => { closeProfilePage(); openPDP(p); }} className="w-full flex gap-3 p-3 rounded-xl border border-primary-100 dark:border-white/10 bg-primary-50/40 dark:bg-primary-900/30 text-right">
                              <img src={p.colors?.[0]?.image || p.image} alt="" className="w-16 h-20 object-cover rounded-lg flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-primary-900 dark:text-white line-clamp-2">{p.name}</p>
                                <p className="text-xs font-bold mt-1 text-primary-900 dark:text-white">{p.priceText} تومان</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {profileTab === 'cart' && (
                    <div className="p-4 sm:p-5 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-base font-bold text-primary-900 dark:text-white">سبد خرید ({toFa(cartCount)})</h2>
                        {cart.length > 0 && <button type="button" onClick={() => setClearCartConfirm(true)} className="text-xs text-red-500">حذف همه</button>}
                      </div>
                      {cart.length === 0 ? (
                        <p className="text-sm text-primary-500 text-center py-10">سبد خرید خالی است</p>
                      ) : (
                        <div className="space-y-3">
                          {cart.map((item, idx) => (
                            <div key={idx} className="flex gap-3 p-3 rounded-xl border border-primary-100 dark:border-white/10 bg-primary-50/40 dark:bg-primary-900/30">
                              <img src={item.selectedColor?.image || item.image} alt="" className="w-16 h-20 object-cover rounded-lg flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-primary-900 dark:text-white line-clamp-2">{item.name}</p>
                                <p className="text-xs text-primary-500 mt-0.5">{item.selectedColor?.name}{item.size ? ` · ${item.size}` : ''}</p>
                                <p className="text-xs font-bold mt-1 text-primary-900 dark:text-white">{item.priceText} تومان × {toFa(item.qty)}</p>
                              </div>
                              <button type="button" onClick={() => removeFromCart(item.id, item.selectedColor?.name, item.selectedSize)} className="text-red-400 self-start p-1"><Icon name="trash" size={14} /></button>
                            </div>
                          ))}
                          <div className="flex w-full justify-end" dir="ltr">
                            <button type="button" onClick={() => { closeProfilePage(); openCheckout(); }} className="px-5 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium hover:opacity-90 transition">ادامه و پرداخت</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {profileTab === 'notifications' && (
                    <div className="p-4 sm:p-5 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                        <h2 className="text-base font-bold text-primary-900 dark:text-white">اعلان‌ها</h2>
                        <div className="flex items-center gap-2">
                          <button type="button" disabled={notifPulling} onClick={pullNotifications} className="text-xs px-3 py-1.5 rounded-full border border-primary-200 dark:border-white/20 text-primary-700 dark:text-white disabled:opacity-60">{notifPulling ? 'در حال به‌روزرسانی…' : 'به‌روزرسانی'}</button>
                          <button type="button" onClick={() => { markAllNotifsRead(); fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ mark_all_read: true }) }).catch(() => {}); }} className="text-xs text-apple-blue hover:underline">خواندن همه</button>
                        </div>
                      </div>
                      {(notifications || []).length === 0 ? (
                        <div className="text-center py-16 rounded-2xl bg-white dark:bg-primary-900 border border-dashed border-primary-200 dark:border-white/20"><Icon name="bell" size={32} className="mx-auto text-primary-300 mb-3" /><p className="text-sm text-primary-500 dark:!text-white">اعلانی وجود ندارد</p></div>
                      ) : (
                        <div className="space-y-2">
                          {(notifications || []).map(n => (
                            <div key={n.id} className={`notif-item p-3.5 rounded-xl border transition ${n.read ? 'notif-item--read border-primary-100 dark:border-white/10 bg-white dark:bg-primary-900' : 'notif-item--unread border-apple-blue/30 bg-apple-blue/5 dark:bg-apple-blue/10'}`}>
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs font-bold ${n.read ? 'text-primary-700 dark:text-white/80' : 'text-primary-900 dark:text-white'}`}>{n.title}</p>
                                  <p className="text-xs text-primary-500 dark:!text-white mt-0.5 leading-relaxed">{n.body}</p>
                                  <p className="text-xs text-primary-400 mt-1">{n.date}</p>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {!n.read && (<button type="button" onClick={() => {
                                    saveNotifications((notifications || []).map(x => x.id === n.id ? { ...x, read: true } : x));
                                    fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ id: n.id, read: true }) }).catch(() => {});
                                  }} className="notif-item-action p-1 rounded hover:bg-primary-50 dark:hover:bg-primary-800 text-primary-600 dark:text-white" title="خوانده شد"><Icon name="check" size={14} /></button>)}
                                  <button type="button" onClick={() => {
                                    saveNotifications((notifications || []).filter(x => x.id !== n.id));
                                    fetch('/api/notifications', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ id: n.id }) }).catch(() => {});
                                  }} className="notif-item-action p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-primary-500 dark:text-white/70" title="حذف"><Icon name="trash" size={14} /></button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {profileTab === 'tickets' && (
                    <div className="p-4 sm:p-5 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h2 className="text-base font-bold text-primary-900 dark:text-white">پشتیبانی / گفتگوها</h2>
                          <p className="text-xs text-primary-500 dark:text-white/50 mt-0.5">بدون لینک · پاسخ در همین بخش</p>
                        </div>
                        <button type="button" onClick={() => { setBuyerTicketFormOpen(true); setBuyerTicketSubject(''); setBuyerTicketBody(''); setBuyerTicketError(''); setBuyerTicketDetailId(null); }} className="text-xs px-3 py-1.5 rounded-full bg-apple-blue text-white font-medium inline-flex items-center gap-1">
                          <Icon name="plus" size={14} /> تیکت جدید
                        </button>
                      </div>

                      {buyerTicketFormOpen && (
                        <div className="rounded-2xl border border-primary-200 dark:border-white/20 bg-primary-50/50 dark:bg-primary-900/40 p-4 space-y-3">
                          <h3 className="text-sm font-bold text-primary-900 dark:text-white">ثبت تیکت پشتیبانی</h3>
                          <div>
                            <label className="block text-xs text-primary-500 dark:text-white/60 mb-1">موضوع</label>
                            <input
                              type="text"
                              value={buyerTicketSubject}
                              onChange={(e) => { setBuyerTicketSubject(e.target.value); setBuyerTicketError(''); }}
                              placeholder=""
                              className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue"
                              maxLength={80}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-primary-500 dark:text-white/60 mb-1">شرح درخواست <span className="text-primary-400">(لینک مجاز نیست)</span></label>
                            <SimpleEditor
                              value={buyerTicketBody}
                              onChange={(html) => { setBuyerTicketBody(html); setBuyerTicketError(''); }}
                              placeholder="مشکل یا سؤال خود را واضح بنویسید…"
                              appearance="comment"
                              maxLength={2000}
                            />
                          </div>
                          {buyerTicketError && <p className="text-xs text-red-500">{buyerTicketError}</p>}
                          <div className="flex w-full flex-wrap gap-2 justify-end" dir="ltr">
                            <button type="button" onClick={() => setBuyerTicketFormOpen(false)} className="px-4 py-2 rounded-full text-xs border plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium">انصراف</button>
                            <button type="button" onClick={async () => {
                              const sub = (buyerTicketSubject || '').trim();
                              const body = htmlToPlain(buyerTicketBody || '').trim();
                              if (!sub) { setBuyerTicketError('موضوع را وارد کنید'); return; }
                              if (!body || body.length < 5) { setBuyerTicketError('متن پیام را کامل‌تر بنویسید'); return; }
                              const chkS = assertNoUserLinks(sub);
                              const chkB = assertNoUserLinks(body);
                              if (!chkS.ok || !chkB.ok) { setBuyerTicketError(chkS.error || chkB.error); return; }
                              try {
                                const res = await fetch('/api/tickets', {
                                  method: 'POST',
                                  credentials: 'include',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ subject: chkS.text.slice(0, 80), body: chkB.text.slice(0, 2000), type: 'buyer' }),
                                });
                                const data = await res.json().catch(() => ({}));
                                if (!res.ok || !data?.ok) {
                                  setBuyerTicketError(data?.error || 'ثبت تیکت ناموفق بود — وارد حساب شده‌اید؟');
                                  return;
                                }
                                // فوری به لیست اضافه کن (optimistic)
                                const created = data.ticket || {};
                                const optimistic = {
                                  id: created.id || ('tmp-' + Date.now()),
                                  code: created.code || created.id || '',
                                  subject: created.subject || chkS.text.slice(0, 80),
                                  status: created.status || 'open',
                                  type: created.type || 'ticket',
                                  channel: 'ticket',
                                  date: created.created_at ? new Date(created.created_at).toLocaleDateString('fa-IR') : new Date().toLocaleDateString('fa-IR'),
                                  messages: [{ from: 'buyer', text: chkB.text.slice(0, 1000), date: new Date().toLocaleDateString('fa-IR') }],
                                  fromServer: true,
                                };
                                try {
                                  if (typeof saveBuyerTickets === 'function') {
                                    saveBuyerTickets([optimistic, ...((buyerTickets || []).filter((x) => x && x.id !== optimistic.id))]);
                                  }
                                } catch (_) {}
                                try { pushNotification({ type: 'ticket', title: 'تیکت ثبت شد', body: chkS.text.slice(0, 80) }, { toast: true }); } catch (_) {}
                                setBuyerTicketFormOpen(false);
                                setBuyerTicketSubject('');
                                setBuyerTicketBody('');
                                setBuyerTicketError('');
                                setBuyerTicketDetailId(null);
                                try { await loadBuyerTickets(); } catch (_) {}
                                try { window.scrollTo({ top: 0, behavior: 'auto' }); } catch (_) {}
                              } catch (e) {
                                setBuyerTicketError('خطای شبکه در ثبت تیکت');
                              }
                            }} className="px-4 py-2 rounded-full text-xs bg-apple-blue text-white font-medium">ارسال تیکت</button>
                          </div>
                        </div>
                      )}

                      {(buyerTickets || []).length === 0 && !buyerTicketFormOpen ? (
                        <div className="text-center py-14 rounded-2xl bg-white dark:bg-primary-900 border border-dashed border-primary-200 dark:border-white/20">
                          <Icon name="mail" size={32} className="mx-auto text-primary-300 mb-3" />
                          <p className="text-sm text-primary-500 dark:text-white/60 mb-3">هنوز تیکتی ندارید</p>
                          <button type="button" onClick={() => setBuyerTicketFormOpen(true)} className="text-xs px-4 py-2 rounded-full bg-apple-blue text-white">اولین تیکت را بسازید</button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {buyerTickets.map(t => (
                            <div key={t.id} className={`rounded-xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 overflow-hidden ${buyerTicketDetailId === t.id ? 'ring-1 ring-apple-blue/40' : ''}`}>
                              <button type="button" onClick={async () => {
                                  const nextId = buyerTicketDetailId === t.id ? null : t.id;
                                  setBuyerTicketDetailId(nextId);
                                  if (nextId && t.fromServer) {
                                    try {
                                      const det = await fetch('/api/tickets/' + encodeURIComponent(t.id), { credentials: 'include' });
                                      const dj = await det.json().catch(() => ({}));
                                      if (dj?.ok && Array.isArray(dj.messages)) {
                                        const msgs = dj.messages.map((m) => ({
                                          from: m.sender_role === 'admin' || m.sender_role === 'support' ? 'support' : 'buyer',
                                          text: m.body || '',
                                          date: m.created_at ? new Date(m.created_at).toLocaleDateString('fa-IR') : '',
                                          time: m.created_at ? new Date(m.created_at).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) : '',
                                        }));
                                        if (typeof saveBuyerTickets === 'function') {
                                          saveBuyerTickets((buyerTickets || []).map(x => x.id === t.id ? { ...x, messages: msgs } : x));
                                        }
                                      }
                                    } catch (_) {}
                                  }
                                }} className="w-full p-3.5 text-right">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <p className="text-xs font-bold text-primary-900 dark:text-white">{t.subject}</p>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(t.fromChat || t.channel === 'chat' || t.type === 'chat') ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' : t.type === 'return' || t.channel === 'return' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' : 'bg-primary-100 text-primary-600 dark:bg-primary-800 dark:text-white/70'}`}>
                                      {conversationChannelLabel(t)}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.status === 'open' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : t.status === 'closed' ? 'bg-primary-100 text-primary-600 dark:bg-primary-800 dark:text-white/70' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'}`}>
                                      {t.status === 'open' ? 'باز' : t.status === 'closed' ? 'بسته' : 'در انتظار'}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-xs text-primary-400 mb-1 font-latin" dir="ltr">کد: {t.code || t.id}</p>
                                {t.orderId && <p className="text-xs text-primary-400 mb-1">سفارش: {t.orderId}</p>}
                                <p className="text-xs text-primary-500 dark:text-white/60 line-clamp-2">{t.messages?.[t.messages.length - 1]?.text}</p>
                                <p className="text-xs text-primary-400 mt-1">{t.date}</p>
                              </button>
                              {buyerTicketDetailId === t.id && (
                                <div className="px-3.5 pb-3.5 border-t border-primary-100 dark:border-white/10 space-y-2">
                                  <p className="text-xs font-bold text-primary-500 dark:text-white/50 pt-2">گفتگو</p>
                                  <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {(t.messages || []).map((m, mi) => (
                                      <div key={mi} className={`p-2.5 rounded-lg text-xs ${m.from === 'buyer' ? 'bg-apple-blue/10 text-primary-900 dark:text-white mr-4' : 'bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-white ml-4'}`}>
                                        <p className="font-medium mb-0.5 opacity-70">{m.from === 'buyer' ? 'شما' : 'پشتیبانی'}</p>
                                        <p className="leading-relaxed">{stripLinksForDisplay(m.text)}</p>
                                        <p className="text-[10px] opacity-50 mt-1">{m.date}{m.time ? ` · ${m.time}` : ''}</p>
                                      </div>
                                    ))}
                                  </div>
                                  {t.status !== 'closed' && (
                                    <div className="flex flex-col gap-2 pt-1 w-full">
                                      <SimpleEditor
                                          value={t._replyDraft || ''}
                                          onChange={(html) => {
                                            saveBuyerTickets(buyerTickets.map(x => x.id === t.id ? { ...x, _replyDraft: html } : x));
                                          }}
                                          placeholder="پاسخ (بدون لینک)…"
                                          appearance="comment"
                                          maxLength={2000}
                                        />
                                      <div className="flex justify-start w-full" dir="rtl">
                                      <button type="button" onClick={() => {
                                        const html = t._replyDraft || '';
                                        const val = htmlToPlain(html).trim();
                                        if (!val) return;
                                        const chk = assertNoUserLinks(val);
                                        if (!chk.ok) { showToast({ message: String(chk.error), variant: 'error', duration: 4500, position: 'top-center' }); return; }
                                        (async () => {
                                          try {
                                            const res = await fetch('/api/tickets/' + encodeURIComponent(t.id) + '/messages', {
                                              method: 'POST',
                                              credentials: 'include',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({ body: chk.text }),
                                            });
                                            const data = await res.json().catch(() => ({}));
                                            if (!res.ok || !data?.ok) {
                                              try { showToast({ message: data?.error || 'ارسال پاسخ ناموفق', variant: 'error', duration: 4500, position: 'top-center' }); } catch (_) {}
                                              return;
                                            }
                                            // optimistic + reload
                                            const updated = {
                                              ...t,
                                              _replyDraft: '',
                                              messages: [...(t.messages || []), { from: 'buyer', text: chk.text, html: html, date: new Date().toLocaleDateString('fa-IR'), time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) }],
                                              status: t.status === 'closed' ? 'open' : t.status,
                                            };
                                            saveBuyerTickets(buyerTickets.map(x => x.id === t.id ? updated : x));
                                            try {
                                              const det = await fetch('/api/tickets/' + encodeURIComponent(t.id), { credentials: 'include' });
                                              const dj = await det.json().catch(() => ({}));
                                              if (dj?.ok && dj.ticket) {
                                                const msgs = (dj.messages || []).map((m) => ({
                                                  from: m.sender_role === 'admin' || m.sender_role === 'support' ? 'support' : 'buyer',
                                                  text: m.body || '',
                                                  date: m.created_at ? new Date(m.created_at).toLocaleDateString('fa-IR') : '',
                                                  time: m.created_at ? new Date(m.created_at).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) : '',
                                                }));
                                                saveBuyerTickets(buyerTickets.map(x => x.id === t.id ? { ...x, messages: msgs, _replyDraft: '' } : x));
                                              }
                                            } catch (_) {}
                                          } catch (e) {
                                            try { showToast({ message: 'خطای شبکه', variant: 'error', duration: 3000, position: 'top-center' }); } catch (_) {}
                                          }
                                        })();
                                      }} className="px-4 py-2 rounded-full bg-apple-blue text-white text-sm font-medium">ارسال</button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {profileTab === 'gifts' && (
                    <div className="space-y-4">
                      <h2 className="text-base font-bold text-primary-900 dark:text-white">تخفیف‌ها و هدایا</h2>
                      <p className="text-xs text-primary-500">کدهای هدیه و تخفیف دریافتی از فروشندگان اینجا نمایش داده می‌شود.</p>
                      {(buyerGifts || []).length === 0 ? (
                        <div className="text-center py-12 rounded-2xl border border-dashed border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900"><Icon name="gift" size={32} className="mx-auto text-primary-300 mb-2" /><p className="text-sm text-primary-500">هدیه‌ای ندارید</p></div>
                      ) : (
                        <div className="space-y-2">
                          {(buyerGifts || []).map(g => (
                            <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center"><Icon name="gift" size={18} /></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-primary-900 dark:text-white">{g.title}</p>
                                <p className="text-xs text-primary-500"><span className="latin-label" dir="ltr">{g.code}</span>{g.percent ? ` · ${toFa(g.percent)}٪` : ''}</p>
                              </div>
                              <button type="button" onClick={() => { try { navigator.clipboard.writeText(g.code); pushLiveToast('کد کپی شد', { type: 'info' }); } catch(_){} }} className="text-xs text-apple-blue">کپی کد</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {profileTab === 'following' && (
                    <div className="p-4 sm:p-5 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-base font-bold text-primary-900 dark:text-white">فروشندگان دنبال‌شده</h2>
                        <span className="text-xs text-primary-500 dark:text-white/60">{toFa(Object.keys(sellerFollowed || {}).filter(k => sellerFollowed[k]).length)} فروشنده</span>
                      </div>
                      {(() => {
                        const ids = Object.keys(sellerFollowed || {}).filter(k => sellerFollowed[k]);
                        if (!ids.length) {
                          return (
                            <div className="text-center py-12 space-y-3">
                              <p className="text-sm text-primary-500 dark:text-white/70">هنوز فروشنده‌ای را دنبال نکرده‌اید</p>
                              <button type="button" onClick={() => { closeProfilePage(); openSellersList(); }} className="px-4 py-2 rounded-full bg-apple-blue text-white text-xs font-medium">مشاهده فروشندگان</button>
                            </div>
                          );
                        }
                        const pool = [...(topSellers || []), ...((typeof adminSellers !== 'undefined' && adminSellers) ? adminSellers : []).map(s => ({
                          id: s.id,
                          name: s.shopName || s.name,
                          image: s.image || s.avatar,
                          city: s.city,
                          rating: s.rating,
                          products: s.productsCount || s.products,
                        }))];
                        const byId = {};
                        pool.forEach(s => { if (s && s.id) byId[String(s.id)] = s; });
                        return (
                          <div className="space-y-2">
                            {ids.map((id) => {
                              const s = byId[String(id)] || { id, name: id === 'own' ? 'فروشگاه مرکزی' : `فروشنده ${id}`, image: '', city: '' };
                              return (
                                <div key={id} className="flex items-center gap-3 p-3 rounded-xl border border-primary-100 dark:border-white/10 bg-primary-50/40 dark:bg-primary-900/30">
                                  <button
                                    type="button"
                                    onClick={() => { closeProfilePage(); openSeller(s.id); }}
                                    className="flex items-center gap-3 flex-1 min-w-0 text-right"
                                  >
                                    {s.image ? (
                                      <img src={s.image} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" loading="lazy" referrerPolicy="no-referrer" />
                                    ) : (
                                      <span className="w-12 h-12 rounded-full bg-apple-blue text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{(s.name || 'ف')[0]}</span>
                                    )}
                                    <span className="min-w-0 flex-1">
                                      <span className="block text-sm font-medium text-primary-900 dark:text-white truncate">{s.name}</span>
                                      <span className="block text-xs text-primary-500 dark:text-white/60 mt-0.5">
                                        {[s.city, s.products != null ? `${toFa(s.products)} محصول` : null].filter(Boolean).join(' · ') || 'مشاهده فروشگاه'}
                                      </span>
                                    </span>
                                    <Icon name="chevronLeft" size={16} className="text-primary-300 dark:text-white/30 flex-shrink-0" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => toggleSellerFollow(id)}
                                    className="text-xs px-2.5 py-1.5 rounded-full border border-primary-200 dark:border-white/25 text-primary-600 dark:text-white flex-shrink-0"
                                  >لغو دنبال</button>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  {profileTab === 'edit' && (
                    <div className="p-4 sm:p-5 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                      <h2 className="text-base font-bold text-primary-900 dark:text-white mb-4">اطلاعات حساب</h2>
                      <div className="space-y-4 w-full max-w-none">
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className="text-xs text-primary-500 mb-1 block">نام</label><input defaultValue={user.firstName} id="edit-first" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue" /></div>
                          <div><label className="text-xs text-primary-500 mb-1 block">نام‌خانوادگی</label><input defaultValue={user.lastName} id="edit-last" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue" /></div>
                        </div>
                        <div><label className="text-xs text-primary-500 mb-1 block">شماره موبایل</label><input value={user.phone} disabled dir="ltr" className="w-full px-3 py-2.5 rounded-xl border border-primary-100 dark:border-white/10 bg-primary-50 dark:bg-primary-900 text-sm text-primary-500 text-left" /><p className="text-xs text-primary-400 mt-1">برای تغییر شماره با پشتیبانی تماس بگیرید</p></div>
                        <div><label className="text-xs text-primary-500 mb-1 block">ایمیل (اختیاری)</label><input defaultValue={user.email || ''} id="edit-email" type="email" dir="ltr" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue text-left" placeholder="email@example.com" /></div>
                        <div><label className="text-xs text-primary-500 mb-1 block">تاریخ تولد (اختیاری)</label><input defaultValue={user.birthDate || ''} id="edit-birth" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue" placeholder="۱۳۷۰/۰۱/۰۱" /></div>
                        <div><label className="text-xs text-primary-500 mb-1 block">جنسیت (اختیاری)</label><div className="flex gap-2">{['مرد', 'زن', 'ترجیح نمی‌دهم'].map(g => (<button key={g} type="button" onClick={() => saveUser({ ...user, gender: g })} className={`px-3 py-1.5 rounded-full text-xs border ${user.gender === g ? 'bg-apple-blue text-white border-apple-blue' : 'plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium'}`}>{g}</button>))}</div></div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                          <button type="button" onClick={() => { const first = document.getElementById('edit-first')?.value?.trim() || user.firstName; const last = document.getElementById('edit-last')?.value?.trim() || ''; const email = document.getElementById('edit-email')?.value?.trim() || ''; const birth = document.getElementById('edit-birth')?.value?.trim() || ''; saveUser({ ...user, firstName: first, lastName: last, email, birthDate: birth }); showToast({ message: 'اطلاعات ذخیره شد', variant: 'success', duration: 4500, position: 'top-center' }); }} className="w-full sm:flex-1 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium hover:opacity-90 transition">ذخیره تغییرات</button>
                          <button type="button" onClick={logoutAllDevices} className="w-full sm:flex-1 py-2.5 rounded-full border border-primary-200 dark:border-white/20 text-primary-700 dark:!text-white text-sm font-medium hover:bg-primary-50 dark:hover:bg-primary-900 transition">خروج از همه دستگاه‌ها</button>
                          <button type="button" onClick={() => { siteConfirm('آیا از حذف حساب کاربری مطمئن هستید؟ این عمل قابل بازگشت نیست.', 'حذف حساب').then(async ok=>{ if(!ok) return; try { await fetch('/api/account', { method: 'DELETE', credentials: 'include' }); } catch(_){}
                try { await fetch('/api/auth/delete', { method: 'POST', credentials: 'include' }); } catch(_){}
                logout(); /* server is source of truth */ setOrders(null); setAddresses(null); setNotifications(null); }); }} className="w-full sm:flex-1 py-2.5 rounded-full border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition">حذف حساب کاربری</button>
                        </div>
                        <SecurityPasswordForm setAccountPassword={setAccountPassword} showToast={showToast} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            </div>
          )}

    </>
  );
}
