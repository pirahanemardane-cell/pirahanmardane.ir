'use client';

import { useAppApi } from '../AppApiContext';
import dynamic from 'next/dynamic';
import EnamadFooterBadge from './EnamadFooterBadge';
const FAQMonochrome = dynamic(() => import('../ui/faq-monochrome').then(m => m.FAQMonochrome || m.default), { ssr: false });

/** StaticPagesView — code-split from App.jsx */
export default function StaticPagesView() {
  const {
    BRANDS_LIST,
    COMPARE_MAX,
    DEFAULT_SITE_FAQS,
    DEFAULT_SELLER_FAQS,
    EmptyStateBox,
    Icon,
    SimpleEditor,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Textarea,
    activeSellerId,
    addBlogComment,
    addToCart,
    blogCommentName,
    blogCommentText,
    blogComments,
    blogPostId,
    blogPosts,
    brandDetailId,
    brandQuery,
    campaignNow,
    campaignsList,
    cart,
    cartCount: cartCountProp,
    cartOpen,
    catOpen,
    catalogProducts,
    clearCompare,
    clearFavorites,
    closeStaticPage,
    compare,
    compareOpen,
    compareReplaceOpen,
    contactForm,
    contactFormError,
    cookieConsent,
    dark,
    dealsMinDiscount,
    dealsSort,
    faqCat,
    faqQuery,
    favorites,
    getPageCms,
    hasMounted,
    headerRevealedAfterHero,
    imgZoom,
    isBlogLiked,
    isDealActive,
    markAllNotifsRead,
    markNotifRead,
    mobileMenuOpen,
    notifPanelOpen,
    notifications,
    unreadNotifCount: unreadNotifCountRaw,
    openAdminPanel,
    openAuth,
    openCartPage,
    openComparePage,
    openPDP,
    openPLP,
    openProfilePage,
    openRecentPage,
    openSellerAuth,
    openSellerPanel,
    openSellersList,
    openStaticPage,
    openWishlistPage,
    orders,
    pdpProduct,
    products,
    pushLiveToast,
    quickAdd,
    quickColorIdx,
    quickDescOpen,
    quickGalleryIdx,
    quickQty,
    quickSize,
    recentOpen,
    recentlyViewed,
    renderShareBar,
    replaceCompareAt,
    searchCategories,
    searchColors,
    searchSizes,
    sellerUser,
    setActiveSellerId,
    setBlogCommentName,
    setBlogCommentText,
    setBrandDetailId,
    setBrandQuery,
    setCartOpen,
    setCatOpen,
    setCompareOpen,
    setCompareReplaceOpen,
    setContactForm,
    setContactFormError,
    setCookieConsent,
    setDark,
    toggleDarkMode,
    setDealsMinDiscount,
    setDealsSort,
    setFaqCat,
    setFaqQuery,
    setImgZoom,
    setMobileMenuOpen,
    setNotifPanelOpen,
    setPdpProduct,
    setQuickAdd,
    setQuickColorIdx,
    setQuickDescOpen,
    setQuickGalleryIdx,
    setQuickQty,
    setQuickSize,
    setRecentOpen,
    setSearchQuery,
    setShowCartPage,
    setShowCheckout,
    setShowComparePage,
    setShowPLP,
    setShowProfilePage,
    setShowSellerPanel,
    setShowSellersList,
    setShowWishlistPage,
    setWishlistClearConfirm,
    setWishlistOpen,
    showAdminPanel,
    showCartPage,
    showCheckout,
    showComparePage,
    showPLP,
    showProfilePage,
    showRecentPage,
    showSellerPanel,
    showSellersList,
    showTaxonomyHub,
    showToast,
    showWishlistPage,
    siteFaqs,
    staticPage,
    toFa,
    toggleBlogLike,
    toggleCompare,
    toggleFavorite,
    toggleSearchCategory,
    toggleSearchColor,
    toggleSearchSize,
    categories,
    allColors,
    allSizes,
    user,
    wishlistClearConfirm,
    wishlistOpen,
    wishlistProducts,
    setPublicTrackOpen,
    publicTrackOpen,
} = useAppApi();
  const cartCount =
    typeof cartCountProp === 'number'
      ? cartCountProp
      : (Array.isArray(cart) ? cart.reduce((sum, i) => sum + (i?.qty || 1), 0) : 0);

  const unreadNotifCount = typeof unreadNotifCountRaw === 'number'
    ? unreadNotifCountRaw
    : (notifications || []).filter((n) => n && !n.read).length;


  return (
    <>
          {staticPage && !pdpProduct && !showSellerPanel && !showAdminPanel && (
            <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12 min-h-[50vh]">
              {/* درباره ما */}
              {staticPage === 'about' && (
                <div className="w-full space-y-6">
                  <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-white">درباره ما</h1>
                  {(() => {
                    const cms = getPageCms('about');
                    if (!cms || (!cms.body && !cms.image && !cms.video)) return null;
                    return (
                      <div className="space-y-3 p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                        {cms.image ? <img src={cms.image} alt="" className="w-full max-h-64 object-cover rounded-xl" /> : null}
                        {cms.video ? <div className="aspect-video rounded-xl overflow-hidden bg-primary-100 dark:bg-primary-900"><iframe title="ویدیو" src={cms.video} className="w-full h-full border-0" allowFullScreen /></div> : null}
                        {cms.body ? <div className="text-sm leading-7 text-primary-700 dark:text-white/80 prose prose-sm dark:prose- max-w-none" dangerouslySetInnerHTML={{ __html: cms.body }} /> : null}
                      </div>
                    );
                  })()}

                  <p className="text-sm sm:text-base text-primary-600 dark:text-white/70 leading-8">پیراهن مردانه یک بازارگاه اینترنتی تخصصی برای خرید پیراهن مردانه است. ما فروشگاه حضوری نداریم و از طریق همکاری با فروشندگان معتبر سراسر ایران، امکان مقایسه قیمت، اصالت کالا و ارسال سراسری را فراهم کرده‌ایم. پلتفرم توسط شخص حقیقی اداره می‌شود و نقش واسطهٔ شفاف بین خریدار و فروشنده را دارد.</p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[{ n: '۱۲+', l: 'فروشنده' }, { n: toFa((products || []).length || 40) + '+', l: 'محصول' }, { n: '۳۱', l: 'استان پوشش' }].map(x => (
                      <div key={x.l} className="p-3 rounded-2xl bg-apple-blue/10">
                        <p className="text-xl font-bold text-apple-blue">{x.n}</p>
                        <p className="text-xs text-primary-600 dark:text-white/70">{x.l}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {[{ t: 'اصالت کالا', d: 'فروشندگان احرازشده' }, { t: 'قیمت شفاف', d: 'بدون هزینه پنهان' }, { t: 'ارسال سراسری', d: 'از مبدأ فروشنده تا درب منزل' }].map(x => (
                      <div key={x.t} className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                        <p className="font-bold text-sm text-primary-900 dark:text-white">{x.t}</p>
                        <p className="text-xs text-primary-500 mt-1">{x.d}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-primary-600 dark:text-white/70 leading-7">ماموریت ما: دسترسی منصفانه به پیراهن باکیفیت، پشتیبانی واقعی و قوانین شفاف مرجوعی.</p>
                </div>
              )}

              {/* تماس با ما */}
              {staticPage === 'contact' && (
                <div className="w-full space-y-6">
                  <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-white">تماس با ما</h1>
                  {(() => {
                    const cms = getPageCms('contact');
                    if (!cms || (!cms.body && !cms.image && !cms.video)) return null;
                    return (
                      <div className="space-y-3 p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                        {cms.image ? <img src={cms.image} alt="" className="w-full max-h-64 object-cover rounded-xl" /> : null}
                        {cms.video ? <div className="aspect-video rounded-xl overflow-hidden bg-primary-100 dark:bg-primary-900"><iframe title="ویدیو" src={cms.video} className="w-full h-full border-0" allowFullScreen /></div> : null}
                        {cms.body ? <div className="text-sm leading-7 text-primary-700 dark:text-white/80 prose prose-sm dark:prose- max-w-none" dangerouslySetInnerHTML={{ __html: cms.body }} /> : null}
                      </div>
                    );
                  })()}

                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-2">
<p className="text-primary-500 text-xs pt-1">شنبه تا چهارشنبه ۹–۱۸ · پنج‌شنبه ۹–۱۴</p>
                    </div>
                    <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 text-xs text-primary-500 leading-6">فروشگاه اینترنتی هستیم و شعبه حضوری نداریم. برای پیگیری سفارش از پروفایل یا تیکت پشتیبانی استفاده کنید.</div>
                  </div>
                  <form className="space-y-3 p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900" onSubmit={(e) => { e.preventDefault(); if (!contactForm.name.trim() || !contactForm.message.trim()) { setContactFormError('نام و پیام الزامی است'); return; } setContactFormError(''); try { showToast({ title: 'ثبت شد', message: 'پیام شما دریافت شد. به‌زودی پاسخ می‌دهیم.', variant: 'success' }); } catch (_) {} setContactForm({ name: '', phone: '', subject: '', message: '' }); }}>
                    <input value={contactForm.name} onChange={e => { setContactForm(f => ({ ...f, name: e.target.value })); setContactFormError(''); }} placeholder="نام *" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white" />
                    <input value={contactForm.phone} onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))} placeholder="موبایل یا ایمیل" dir="rtl" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-right text-primary-900 dark:text-white font-['IRANYekanX',Tahoma,sans-serif]" />
                    <input value={contactForm.subject} onChange={e => setContactForm(f => ({ ...f, subject: e.target.value }))} placeholder="موضوع" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white" />
                    <Textarea value={contactForm.message} onChange={(v) => { setContactForm(f => ({ ...f, message: v || '' })); setContactFormError(''); }} error={contactFormError || undefined} rows={4} placeholder="پیام *" style={{ minHeight: 120 }} />
                    <div className="flex justify-start">
                      <button type="submit" className="px-6 sm:px-8 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium hover:opacity-95 transition">ارسال پیام</button>
                    </div>
                  </form>
                </div>
              )}

              {/* FAQ */}
              {staticPage === 'faq' && (() => {
                const FAQ_ALL = (Array.isArray(siteFaqs) && siteFaqs.length > 0) ? siteFaqs : DEFAULT_SITE_FAQS;
                const activeCat = (!faqCat || faqCat === 'all') ? 'all' : faqCat;
                const filtered = FAQ_ALL.filter(item => {
                  const catOk = activeCat === 'all' || item.cat === activeCat;
                  const q = (faqQuery || '').trim();
                  const textOk = !q || (item.q || '').includes(q) || (item.a || '').includes(q) || (item.question || '').includes(q) || (item.answer || '').includes(q);
                  return catOk && textOk;
                });
                const cats = ['all', ...Array.from(new Set(FAQ_ALL.map(x => x.cat).filter(Boolean)))];
                return (
                <div className="w-full space-y-4">
                  <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-white mb-2">سوالات متداول</h1>
                  {(() => {
                    const cms = getPageCms('faq');
                    if (!cms || (!cms.body && !cms.image && !cms.video)) return null;
                    return (
                      <div className="space-y-3 p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                        {cms.image ? <img src={cms.image} alt="" className="w-full max-h-64 object-cover rounded-xl" /> : null}
                        {cms.video ? <div className="aspect-video rounded-xl overflow-hidden bg-primary-100 dark:bg-primary-900"><iframe title="ویدیو" src={cms.video} className="w-full h-full border-0" allowFullScreen /></div> : null}
                        {cms.body ? <div className="text-sm leading-7 text-primary-700 dark:text-white/80 prose prose-sm dark:prose- max-w-none" dangerouslySetInnerHTML={{ __html: cms.body }} /> : null}
                      </div>
                    );
                  })()}

                  <input value={faqQuery} onChange={e => setFaqQuery(e.target.value)} placeholder="جستجو در سوالات..." className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white" />
                  <div className="flex flex-wrap gap-1.5">
                    {cats.map(c => (
                      <button key={c} type="button" onClick={() => setFaqCat(c)} className={`px-3 py-1 rounded-full text-xs font-medium border transition ${faqCat === c ? 'bg-apple-blue text-white border-apple-blue' : 'border-primary-200 dark:border-white/20 text-primary-600 dark:text-white/70'}`}>{c === 'all' ? 'همه' : c}</button>
                    ))}
                  </div>
                  {filtered.length === 0 ? (
                    <p className="text-sm text-primary-500 text-center py-6">نتیجه‌ای یافت نشد</p>
                  ) : (
                    <FAQMonochrome
                      compact
                      title=""
                      badge=""
                      items={filtered.map(item => ({ q: item.q || item.question, a: item.a || item.answer, cat: item.cat || item.meta }))}
                      defaultOpen={0}
                    />
                  )}
                  <button type="button" onClick={() => openStaticPage('contact')} className="text-sm text-apple-blue hover:underline">سوال شما نیست؟ تیکت بزنید / تماس بگیرید</button>
                </div>
                );
              })()}

              {/* راهنمای سایز */}
              {staticPage === 'size-guide' && (
                <div className="w-full space-y-6">
                  <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-white">راهنمای سایز</h1>
                  {(() => {
                    const cms = getPageCms('size-guide');
                    if (!cms || (!cms.body && !cms.image && !cms.video)) return null;
                    return (
                      <div className="space-y-3 p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                        {cms.image ? <img src={cms.image} alt="" className="w-full max-h-64 object-cover rounded-xl" /> : null}
                        {cms.video ? <div className="aspect-video rounded-xl overflow-hidden bg-primary-100 dark:bg-primary-900"><iframe title="ویدیو" src={cms.video} className="w-full h-full border-0" allowFullScreen /></div> : null}
                        {cms.body ? <div className="text-sm leading-7 text-primary-700 dark:text-white/80 prose prose-sm dark:prose- max-w-none" dangerouslySetInnerHTML={{ __html: cms.body }} /> : null}
                      </div>
                    );
                  })()}

                  <p className="text-sm text-primary-600 dark:text-white/70 leading-7">اندازه‌ها به سانتی‌متر است. برای دقت بیشتر، یک پیراهن مناسب خود را اندازه بگیرید.</p>
                  <div className="overflow-x-auto rounded-2xl border border-primary-200 dark:border-white/15">
                    <Table className="w-full text-sm table-fixed">
                      <TableHeader>
                        <TableRow>
                          {['سایز', 'سینه', 'شانه', 'آستین', 'قد'].map(h => (
                            <TableHead key={h} className="!text-center text-center px-3 py-2.5 font-bold w-[20%]">{h}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          ['S', '۹۶–۱۰۰', '۴۲–۴۴', '۶۱', '۷۲'],
                          ['M', '۱۰۰–۱۰۴', '۴۴–۴۶', '۶۲', '۷۴'],
                          ['L', '۱۰۴–۱۰۸', '۴۶–۴۸', '۶۳', '۷۶'],
                          ['XL', '۱۰۸–۱۱۴', '۴۸–۵۰', '۶۴', '۷۸'],
                          ['XXL', '۱۱۴–۱۲۰', '۵۰–۵۲', '۶۵', '۸۰'],
                        ].map(row => (
                          <TableRow key={row[0]}>
                            {row.map((c, i) => (
                              <TableCell key={i} className="!text-center text-center px-3 py-2.5" dir="ltr">{c}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <ul className="text-sm text-primary-600 dark:text-white/70 space-y-2 list-disc list-inside">
                    <li>سینه: پهن‌ترین قسمت سینه را اندازه بگیرید.</li>
                    <li>شانه: از نوک یک شانه تا شانه دیگر از پشت.</li>
                    <li>بین دو سایز هستید؟ برای فیت تنگ‌تر سایز کوچک‌تر را انتخاب کنید.</li>
                  </ul>
                </div>
              )}

              {/* فروشنده شوید */}
              {staticPage === 'become-seller' && (
                <div className="w-full space-y-8 p-4 sm:p-6 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                  <div className="text-center space-y-3">
                    <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-white">شما هم فروشنده شوید</h1>
                  {(() => {
                    const cms = getPageCms('become-seller');
                    if (!cms || (!cms.body && !cms.image && !cms.video)) return null;
                    return (
                      <div className="space-y-3 p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                        {cms.image ? <img src={cms.image} alt="" className="w-full max-h-64 object-cover rounded-xl" /> : null}
                        {cms.video ? <div className="aspect-video rounded-xl overflow-hidden bg-primary-100 dark:bg-primary-900"><iframe title="ویدیو" src={cms.video} className="w-full h-full border-0" allowFullScreen /></div> : null}
                        {cms.body ? <div className="text-sm leading-7 text-primary-700 dark:text-white/80 prose prose-sm dark:prose- max-w-none" dangerouslySetInnerHTML={{ __html: cms.body }} /> : null}
                      </div>
                    );
                  })()}

                    <p className="text-sm text-primary-600 dark:text-white/70 leading-7">بدون اجاره مغازه، به هزاران خریدار پیراهن مردانه دسترسی پیدا کنید. قیمت شفاف و مدیریت سفارش ساده.</p>
                    <button type="button" onClick={() => { if (sellerUser) { closeStaticPage(); openSellerPanel(); } else { openSellerAuth(); } }} className="inline-flex px-8 py-3 rounded-full bg-apple-blue text-white text-sm font-bold whitespace-nowrap shrink-0">
                      {sellerUser ? 'ورود به پنل فروشنده' : 'شروع ثبت‌نام فروشنده'}
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {[{ n: '۱', t: 'ثبت‌نام و احراز', d: 'موبایل، مدارک و جواز کسب' }, { n: '۲', t: 'افزودن کالا', d: 'تصویر استاندارد و قیمت‌گذاری' }, { n: '۳', t: 'فروش و پشتیبانی', d: 'مدیریت سفارش و ارتباط با خریدار' }].map(s => (
                      <div key={s.n} className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 text-center">
                        <span className="inline-flex w-8 h-8 rounded-full bg-apple-blue text-white items-center justify-center text-sm font-bold mb-2">{s.n}</span>
                        <p className="font-bold text-sm text-primary-900 dark:text-white">{s.t}</p>
                        <p className="text-xs text-primary-500 mt-1">{s.d}</p>
                      </div>
                    ))}
                  </div>
                
                  <FAQMonochrome
                    compact
                    title="سوالات فروشندگان"
                    subtitle="قبل از ثبت‌نام این موارد را بخوانید"
                    badge="FAQ"
                    items={((getPageCms('become-seller') || {}).faqs && (getPageCms('become-seller') || {}).faqs.length)
                      ? (getPageCms('become-seller') || {}).faqs
                      : DEFAULT_SELLER_FAQS}
                  />
</div>
              )}

              {/* قوانین */}
              {staticPage === 'terms' && (
                <div className="w-full space-y-6 text-primary-700 dark:text-white/80">
                  <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-white">قوانین و شرایط استفاده</h1>
                  {(() => {
                    const cms = getPageCms('terms');
                    if (!cms || (!cms.body && !cms.image && !cms.video)) return null;
                    return (
                      <div className="space-y-3 p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                        {cms.image ? <img src={cms.image} alt="" className="w-full max-h-64 object-cover rounded-xl" /> : null}
                        {cms.video ? <div className="aspect-video rounded-xl overflow-hidden bg-primary-100 dark:bg-primary-900"><iframe title="ویدیو" src={cms.video} className="w-full h-full border-0" allowFullScreen /></div> : null}
                        {cms.body ? <div className="text-sm leading-7 text-primary-700 dark:text-white/80 prose prose-sm dark:prose- max-w-none" dangerouslySetInnerHTML={{ __html: cms.body }} /> : null}
                      </div>
                    );
                  })()}

                  <p className="text-sm leading-7">استفاده از این پلتفرم به معنای پذیرش شرایط زیر است. پلتفرم به‌عنوان واسطه بین خریدار و فروشنده عمل می‌کند و محتوای آگهی‌ها مسئولیت فروشنده است.</p>
                  <h2 className="text-base font-bold text-primary-900 dark:text-white pt-2">هزینه خدمات پلتفرم</h2>
                  <p className="text-sm leading-7">جزئیات کارمزد خدمات پلتفرم در قرارداد همکاری با فروشنده مشخص می‌شود. هزینه ارسال و مالیات طبق توافق اعلام‌شده محاسبه می‌گردد.</p>
                  <h2 className="text-base font-bold text-primary-900 dark:text-white pt-2">حساب کاربری</h2>
                  <p className="text-sm leading-7">کاربر موظف است اطلاعات صحیح ارائه دهد. هرگونه سوءاستفاده، محتوای غیرواقعی یا تخلف می‌تواند منجر به تعلیق حساب شود.</p>
                  <h2 className="text-base font-bold text-primary-900 dark:text-white pt-2">پرداخت و سفارش</h2>
                  <p className="text-sm leading-7">پس از ثبت سفارش، فروشنده از سفارش مطلع می‌شود و فرآیند آماده‌سازی آغاز می‌گردد.</p>
                </div>
              )}

              {/* بازگشت */}
              {staticPage === 'returns' && (
                <div className="w-full space-y-6 text-sm text-primary-700 dark:text-white/80 leading-7">
                  <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-white">شرایط بازگشت و مرجوعی</h1>
                  {(() => {
                    const cms = getPageCms('returns');
                    if (!cms || (!cms.body && !cms.image && !cms.video)) return null;
                    return (
                      <div className="space-y-3 p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                        {cms.image ? <img src={cms.image} alt="" className="w-full max-h-64 object-cover rounded-xl" /> : null}
                        {cms.video ? <div className="aspect-video rounded-xl overflow-hidden bg-primary-100 dark:bg-primary-900"><iframe title="ویدیو" src={cms.video} className="w-full h-full border-0" allowFullScreen /></div> : null}
                        {cms.body ? <div className="text-sm leading-7 text-primary-700 dark:text-white/80 prose prose-sm dark:prose- max-w-none" dangerouslySetInnerHTML={{ __html: cms.body }} /> : null}
                      </div>
                    );
                  })()}

                  <ul className="list-none space-y-3 p-5 rounded-2xl bg-white dark:bg-primary-900 border border-primary-100 dark:border-white/10">
                    <li className="flex gap-2"><span className="text-apple-blue font-bold">•</span><span>مهلت درخواست مرجوعی: تا ۷ روز پس از تحویل</span></li>
                    <li className="flex gap-2"><span className="text-apple-blue font-bold">•</span><span>کالا باید استفاده نشده، با تگ و در بسته‌بندی مناسب باشد</span></li>
                    <li className="flex gap-2"><span className="text-apple-blue font-bold">•</span><span>کالای بهداشتی یا سفارشی ممکن است مشمول مرجوعی نباشد</span></li>
                    <li className="flex gap-2"><span className="text-apple-blue font-bold">•</span><span>هماهنگی ارسال برگشت از طریق تیکت پشتیبانی انجام می‌شود</span></li>
                    <li className="flex gap-2"><span className="text-apple-blue font-bold">•</span><span>پس از تأیید فروشنده/ادمین، وضعیت مرجوعی در پنل به‌روزرسانی می‌شود</span></li>
                  </ul>
                  <button type="button" onClick={() => { if (user) openProfilePage('orders'); else openAuth(); }} className="text-apple-blue hover:underline">ثبت درخواست از سفارش‌ها</button>
                </div>
              )}

              {/* حریم خصوصی */}
              {staticPage === 'privacy' && (
                <div className="w-full space-y-6 text-sm text-primary-700 dark:text-white/80 leading-7">
                  <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-white">حریم خصوصی</h1>
                  {(() => {
                    const cms = getPageCms('privacy');
                    if (!cms || (!cms.body && !cms.image && !cms.video)) return null;
                    return (
                      <div className="space-y-3 p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                        {cms.image ? <img src={cms.image} alt="" className="w-full max-h-64 object-cover rounded-xl" /> : null}
                        {cms.video ? <div className="aspect-video rounded-xl overflow-hidden bg-primary-100 dark:bg-primary-900"><iframe title="ویدیو" src={cms.video} className="w-full h-full border-0" allowFullScreen /></div> : null}
                        {cms.body ? <div className="text-sm leading-7 text-primary-700 dark:text-white/80 prose prose-sm dark:prose- max-w-none" dangerouslySetInnerHTML={{ __html: cms.body }} /> : null}
                      </div>
                    );
                  })()}

                  <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-primary-900 border border-primary-100 dark:border-white/10 space-y-4">
                  <p>ما اطلاعاتی مانند شماره موبایل، نام، آدرس و سوابق سفارش را برای ارائه خدمات فروشگاه جمع‌آوری می‌کنیم.</p>
                  <p>داده‌ها با شرکت‌های ارسال صرفاً به میزان لازم به اشتراک گذاشته می‌شود. فروش اطلاعات به شخص ثالث انجام نمی‌شود.</p>
                  <p>می‌توانید درخواست حذف حساب را از پروفایل ثبت کنید. نگه‌داری لاگ‌های امنیتی ممکن است طبق الزامات قانونی ادامه یابد.</p>
                  </div>
                </div>
              )}

              {/* کوکی */}
              {staticPage === 'cookies' && (
                <div className="w-full space-y-4 text-sm text-primary-700 dark:text-white/80 leading-7">
                  <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-white">سیاست کوکی</h1>
                  {(() => {
                    const cms = getPageCms('cookies');
                    if (!cms || (!cms.body && !cms.image && !cms.video)) return null;
                    return (
                      <div className="space-y-3 p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                        {cms.image ? <img src={cms.image} alt="" className="w-full max-h-64 object-cover rounded-xl" /> : null}
                        {cms.video ? <div className="aspect-video rounded-xl overflow-hidden bg-primary-100 dark:bg-primary-900"><iframe title="ویدیو" src={cms.video} className="w-full h-full border-0" allowFullScreen /></div> : null}
                        {cms.body ? <div className="text-sm leading-7 text-primary-700 dark:text-white/80 prose prose-sm dark:prose- max-w-none" dangerouslySetInnerHTML={{ __html: cms.body }} /> : null}
                      </div>
                    );
                  })()}

                  <p>از کوکی‌های ضروری برای ورود، سبد خرید و امنیت استفاده می‌کنیم. کوکی‌های تحلیلی در صورت رضایت برای بهبود تجربه فعال می‌شوند.</p>
                  <p>می‌توانید از تنظیمات مرورگر کوکی‌ها را محدود کنید؛ در این صورت برخی امکانات ممکن است درست کار نکنند.</p>
                </div>
              )}

              {/* نقشه سایت */}
              {staticPage === 'sitemap' && (
                <div className="w-full space-y-6">
                  <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-white">نقشه سایت</h1>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h2 className="font-bold mb-2 text-primary-900 dark:text-white">خرید</h2>
                      <ul className="space-y-1.5">
                        <li><button type="button" onClick={() => openPLP()} className="text-apple-blue hover:underline">فروشگاه</button></li>
                        <li><button type="button" onClick={() => openSellersList()} className="text-apple-blue hover:underline">فروشندگان</button></li>
                        <li><button type="button" onClick={() => openStaticPage('brands')} className="text-apple-blue hover:underline">برندها</button></li>
                        <li><button type="button" onClick={() => openStaticPage('deals')} className="text-apple-blue hover:underline">شگفت‌انگیز</button></li>
                        <li><button type="button" onClick={() => openStaticPage('campaigns')} className="text-apple-blue hover:underline">کمپین‌ها</button></li>
                      </ul>
                    </div>
                    <div>
                      <h2 className="font-bold mb-2 text-primary-900 dark:text-white">اطلاعات</h2>
                      <ul className="space-y-1.5">
                        {[['about','درباره ما'],['contact','تماس'],['faq','FAQ'],['size-guide','راهنمای سایز'],['terms','قوانین'],['returns','مرجوعی'],['privacy','حریم خصوصی'],['blog','بلاگ'],['become-seller','فروشنده شوید']].map(([id,l]) => (
                          <li key={id}><button type="button" onClick={() => openStaticPage(id)} className="text-apple-blue hover:underline">{l}</button></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* بلاگ لیست */}
              {staticPage === 'blog' && (
                <div className="w-full space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-white">بلاگ</h1>
                      <p className="text-sm text-primary-500 dark:!text-white mt-1">راهنمای خرید، استایل و مراقبت از پیراهن مردانه</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['همه', ...Array.from(new Set(blogPosts.map(p => p.cat)))].map(cat => (
                        <button key={cat} type="button" onClick={() => setFaqQuery(cat === 'همه' ? '' : cat)} className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition ${(!faqQuery && cat==='همه') || faqQuery===cat ? 'bg-apple-blue text-white shadow-md' : 'bg-white dark:bg-primary-900 border border-primary-200 dark:border-white/15 text-primary-600 dark:text-white/70 hover:border-apple-blue/40'}`}>{cat}</button>
                      ))}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {blogPosts.filter(p => (p.status === 'published' || (p.status === 'scheduled' && p.publishAtMs && Number(p.publishAtMs) <= Date.now())) && (!faqQuery || p.cat === faqQuery || p.title.includes(faqQuery))).map(p => (
                      <button key={p.id} type="button" onClick={() => openStaticPage('blog-post', { blogId: p.id })} className="group text-right rounded-3xl border border-primary-100 dark:border-white/10 bg-white dark:bg-primary-900 overflow-hidden hover:shadow-xl hover:border-apple-blue/30 transition flex flex-col">
                        <div className="aspect-[16/9] overflow-hidden bg-primary-100 dark:bg-primary-900">
                          <img src={p.image || 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&h=450&fit=crop&q=80'} alt="" className="w-full h-full object-cover group-hover:opacity-95 transition duration-500" loading="lazy" />
                        </div>
                        <div className="p-4 sm:p-5 flex-1 flex flex-col">
                          <span className="text-xs font-bold text-apple-blue uppercase tracking-wide">{p.cat}</span>
                          <p className="font-bold text-sm sm:text-base text-primary-900 dark:text-white mt-1.5 leading-snug line-clamp-2">{p.title}</p>
                          <p className="text-xs text-primary-500 dark:!text-white mt-2 line-clamp-2 flex-1">{p.excerpt}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-primary-50 dark:border-white/10 text-xs text-primary-400 dark:!text-white">
                            <span className="dark:!text-white">{p.author || 'تحریریه'}</span>
                            <span className="dark:!text-white">·</span>
                            <span className="dark:!text-white">{p.date}</span>
                            <span className="dark:!text-white">·</span>
                            <span className="dark:!text-white">{p.read} مطالعه</span>
                          </div>
                          {(p.tags || []).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {(p.tags || []).map(t => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-white/70">#{t}</span>)}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* بلاگ تکی */}
              {staticPage === 'blog-post' && (() => {
                const isLive = (p) => p && (p.status === 'published' || (p.status === 'scheduled' && p.publishAtMs && Number(p.publishAtMs) <= Date.now()));
                const post = blogPosts.find(p => p.id === blogPostId) || blogPosts.find(isLive) || blogPosts[0];
                if (!post) return <p className="text-center text-sm text-primary-500">مطلبی یافت نشد</p>;
                const related = blogPosts.filter(p => p.id !== post.id && isLive(p)).slice(0, 3);
                const isHtmlBody = /<[a-z][\s\S]*>/i.test(post.body || '');
                const headings = isHtmlBody ? [] : (post.body || '').split('\n').filter(l => l.startsWith('## ')).map(l => l.replace(/^##\s+/, '').trim());
                const paragraphs = isHtmlBody ? [] : (post.body || '').split('\n\n');
                return (
                  <article className="w-full space-y-6">
                    <button type="button" onClick={() => openStaticPage('blog')} className="text-xs text-apple-blue hover:underline flex items-center gap-1"><Icon name="arrowRight" size={14} /> بازگشت به بلاگ</button>
                    <div className="rounded-3xl overflow-hidden aspect-[21/9] sm:aspect-[2.4/1] bg-primary-100 dark:bg-primary-900 border border-primary-100 dark:border-white/10">
                      <img src={post.image || 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=1200&h=500&fit=crop&q=80'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-full bg-apple-blue/10 text-apple-blue font-bold text-white">{post.cat}</span>
                      {(post.tags || []).map(t => <span key={t} className="px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-white/70">#{t}</span>)}
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-white leading-snug">{post.title}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-primary-500 dark:!text-white pb-4 border-b border-primary-100 dark:border-white/10">
                      <span className="font-medium text-primary-800 dark:!text-white">{post.author || 'تحریریه'}</span>
                      <span className="dark:!text-white">·</span>
                      <span className="dark:!text-white">{post.date}</span>
                      <span className="dark:!text-white">·</span>
                      <span className="dark:!text-white">{post.read} مطالعه</span>
                    </div>
                    {headings.length > 0 && (
                      <nav className="p-4 rounded-2xl bg-primary-50 dark:bg-primary-900/50 border border-primary-100 dark:border-white/10">
                        <p className="text-xs font-bold text-primary-900 dark:text-white mb-2">فهرست مطالب</p>
                        <ol className="list-decimal list-inside space-y-1.5 text-sm text-primary-700 dark:text-white/80">
                          {headings.map((h, i) => (
                            <li key={i}><a href={`#toc-${i}`} className="hover:text-apple-blue transition">{h}</a></li>
                          ))}
                        </ol>
                      </nav>
                    )}
                    <div className="space-y-4">
                      {isHtmlBody ? (
                      <div className="text-sm text-primary-700 dark:text-white/85 leading-8 simple-editor-surface" dangerouslySetInnerHTML={{ __html: post.body }} />
                    ) : (
                      paragraphs.map((para, i) => {
                        if (para.startsWith('## ')) {
                          const h = para.replace(/^##\s+/, '');
                          const hi = headings.indexOf(h);
                          return <h2 key={i} id={hi >= 0 ? `toc-${hi}` : undefined} className="text-lg font-bold text-primary-900 dark:text-white pt-4 scroll-mt-24">{h}</h2>;
                        }
                        return <p key={i} className="text-sm sm:text-base text-primary-700 dark:text-white/80 leading-8">{para}</p>;
                      })
                    )}
                    </div>
                    <div className="flex flex-wrap gap-2 pt-4">
                      <button type="button" onClick={() => openPLP()} className="px-5 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium">محصولات مرتبط</button>
                      <button type="button" onClick={() => { try { navigator.clipboard.writeText(window.location.href); pushLiveToast('لینک کپی شد', { type: 'info' }); } catch(_){} }} className="px-4 py-2.5 rounded-full border border-primary-200 dark:border-white/20 text-sm text-primary-700 dark:text-white">اشتراک‌گذاری</button>
                    </div>

                    {/* لایک مطلب */}
                    <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-primary-100 dark:border-white/10">
                      <button
                        type="button"
                        onClick={() => toggleBlogLike(post.id)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition ${isBlogLiked(post.id) ? 'bg-[#FF0000] dark:bg-[#13ABC4] !text-white border-[#FF0000] dark:border-[#13ABC4]' : 'border-primary-200 dark:border-white/30 text-primary-800 dark:text-white hover:border-[#FF0000] dark:border-[#13ABC4]'}`}
                      >
                        <Icon name={isBlogLiked(post.id) ? 'heartFilled' : 'heart'} size={16} />
                        {isBlogLiked(post.id) ? 'لایک شده' : 'لایک این مطلب'}
                      </button>
                      <span className="text-xs text-primary-500 dark:text-white/60">در بخش علاقه‌مندی‌های حساب شما نمایش داده می‌شود</span>
                    </div>

                    {/* کامنت‌ها */}
                    <section className="rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 p-4 sm:p-5 space-y-4">
                      <h2 className="text-base font-bold text-primary-900 dark:text-white">دیدگاه‌ها ({toFa((blogComments[post.id] || []).length)})</h2>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={blogCommentName}
                          onChange={(e) => setBlogCommentName(e.target.value)}
                          placeholder="نام (اختیاری)"
                          className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white"
                        />
                        <SimpleEditor
                          value={blogCommentText}
                          onChange={(html, plain) => setBlogCommentText(html)}
                          placeholder="نظر خود را درباره این مطلب بنویسید…"
                          appearance="comment"
                          maxLength={1000}
                        />
                        <button type="button" onClick={() => addBlogComment(post.id)} className="px-4 py-2 rounded-full bg-apple-blue text-white text-sm font-medium hover:opacity-90">
                          ثبت دیدگاه
                        </button>
                      </div>
                      <div className="space-y-3 max-h-[320px] overflow-y-auto">
                        {(blogComments[post.id] || []).length === 0 ? (
                          <p className="text-sm text-primary-500 dark:text-white/50 text-center py-4">هنوز دیدگاهی ثبت نشده — اولین نفر باشید</p>
                        ) : (
                          (blogComments[post.id] || []).map(c => (
                            <div key={c.id} className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/40 border border-primary-100 dark:border-white/10 text-right">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-xs font-bold text-primary-900 dark:text-white">{c.name}</span>
                                <span className="text-xs text-primary-400 dark:text-white/50">{c.date}</span>
                              </div>
                              <div className="text-sm text-primary-700 dark:text-white/85 leading-relaxed simple-editor-surface" dangerouslySetInnerHTML={{ __html: c.html || c.text }} />
                            </div>
                          ))
                        )}
                      </div>
                    </section>

                    {renderShareBar({ title: post.title, text: post.title, url: typeof window !== 'undefined' ? window.location.href : '' })}

                    {related.length > 0 && (
                      <div className="pt-8 border-t border-primary-100 dark:border-white/10">
                        <p className="text-sm font-bold text-primary-900 dark:text-white mb-4">مطالب مرتبط</p>
                        <div className="grid sm:grid-cols-3 gap-3">
                          {related.map(r => (
                            <button key={r.id} type="button" onClick={() => openStaticPage('blog-post', { blogId: r.id })} className="text-right rounded-2xl border border-primary-100 dark:border-white/10 bg-white dark:bg-primary-900 overflow-hidden hover:border-apple-blue/40 transition">
                              <div className="aspect-video bg-primary-100 dark:bg-primary-900">
                                <img src={r.image || 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&h=225&fit=crop'} alt="" className="w-full h-full object-cover" loading="lazy" />
                              </div>
                              <p className="p-3 text-xs font-bold text-primary-900 dark:text-white line-clamp-2">{r.title}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })()}

              {/* برندها */}
              {staticPage === 'brands' && !brandDetailId && (
                <div className="space-y-8">
                  <div className="text-center sm:text-right space-y-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-white">برندها</h1>
                    <p className="text-sm text-primary-500 dark:!text-white">از برندهای تخصصی پیراهن مردانه انتخاب کنید</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    <input value={brandQuery} onChange={e => setBrandQuery(e.target.value)} placeholder="جستجوی برند..." className="flex-1 max-w-md px-4 py-3 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white shadow-sm" />
                    {brandQuery && <button type="button" onClick={() => setBrandQuery('')} className="text-xs text-apple-blue">پاک کردن فیلتر</button>}
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start p-3 rounded-2xl bg-white dark:bg-primary-950 border border-primary-200 dark:border-white/15">
                    <button type="button" onClick={() => setBrandQuery('')} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${!brandQuery ? 'bg-apple-blue !text-white shadow-md' : 'bg-primary-100 dark:bg-primary-700 text-primary-800 dark:!text-white hover:bg-primary-200 dark:hover:bg-primary-600 border border-primary-200/80 dark:border-white/20'}`}>همه</button>
                    {'ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی'.split('').map(ch => (
                      <button key={ch} type="button" onClick={() => setBrandQuery(ch)} className={`min-w-[2rem] h-8 px-2 rounded-full text-xs font-semibold transition ${brandQuery === ch ? 'bg-apple-blue !text-white shadow-md' : 'bg-primary-100 dark:bg-primary-700 text-primary-800 dark:!text-white hover:bg-primary-200 dark:hover:bg-primary-600 border border-primary-200/80 dark:border-white/20'}`}>{ch}</button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {BRANDS_LIST.filter(b => !brandQuery || b.name.includes(brandQuery) || b.name[0] === brandQuery).map(b => (
                      <button key={b.id} type="button" onClick={() => setBrandDetailId(b.id)} className="group p-6 rounded-3xl border border-primary-100 dark:border-white/10 bg-white dark:bg-primary-900 text-center hover:border-apple-blue/50 hover:shadow-lg transition">
                        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-700 dark:to-primary-600 flex items-center justify-center text-xl font-bold text-primary-900 dark:!text-white border border-primary-200/80 dark:border-white/25 shadow-sm transition group-hover:from-apple-blue group-hover:to-apple-blue group-hover:!text-white dark:group-hover:from-[#FF0000] dark:from-[#13ABC4] dark:group-hover:to-[#AF0404] dark:to-[#3161A3]">{b.name[0]}</div>
                        <p className="text-sm font-bold text-primary-900 dark:text-white">{b.name}</p>
                        <p className="text-xs text-primary-500 dark:!text-white mt-1">{toFa(b.count)} محصول</p>
                      </button>
                    ))}
                  </div>
                  {BRANDS_LIST.filter(b => !brandQuery || b.name.includes(brandQuery) || b.name[0] === brandQuery).length === 0 && (
                    <p className="text-center text-sm text-primary-500 py-12">برندی با این فیلتر یافت نشد</p>
                  )}
                </div>
              )}
              {staticPage === 'brands' && brandDetailId && (() => {
                const b = BRANDS_LIST.find(x => x.id === brandDetailId) || BRANDS_LIST[0];
                const brandProducts = products.filter((p, i) => (i % BRANDS_LIST.length) === BRANDS_LIST.findIndex(x => x.id === b.id)).slice(0, 12);
                return (
                  <div className="space-y-6">
                    <button type="button" onClick={() => setBrandDetailId(null)} className="text-xs text-apple-blue hover:underline flex items-center gap-1"><Icon name="arrowRight" size={14} /> همه برندها</button>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-700 flex items-center justify-center text-2xl font-bold text-primary-800 dark:!text-white border border-primary-200 dark:border-white/25 shadow-sm">{b.name[0]}</div>
                      <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-white">{b.name}</h1>
                        <p className="text-sm text-primary-500 dark:!text-white mt-1">{b.desc || 'برند منتخب فروشگاه'}</p>
                        <p className="text-xs text-primary-400 dark:!text-white mt-0.5">{toFa(b.count)} محصول</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => openPLP()} className="text-xs px-3 py-1.5 rounded-full bg-apple-blue text-white">مشاهده در فروشگاه</button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
                      {(brandProducts.length ? brandProducts : products.slice(0, 8)).map(p => (
                        <button key={p.id} type="button" onClick={() => { closeStaticPage(); setBrandDetailId(null); openPDP(p); }} className="text-right rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 overflow-hidden hover:border-apple-blue/40 transition">
                          <img src={p.colors?.[0]?.image || p.image} alt="" className="aspect-[4/5] w-full object-cover" loading="lazy" />
                          <div className="p-2.5">
                            <p className="text-sm sm:text-base font-medium text-primary-900 dark:!text-white line-clamp-2">{p.name}</p>
                            <p className="text-xs font-bold mt-1">{p.priceText} ت</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* کمپین‌ها */}
              {staticPage === 'campaigns' && (() => {
                const active = campaignsList.find(c => c.active) || campaignsList[0];
                const endAt = active?.endAt || campaignEndTs;
                const left = Math.max(0, endAt - campaignNow);
                const d = Math.floor(left / 86400000);
                const h = Math.floor((left % 86400000) / 3600000);
                const m = Math.floor((left % 3600000) / 60000);
                const s = Math.floor((left % 60000) / 1000);
                const others = campaignsList.filter(c => c.id !== active?.id);
                return (
                <div className="space-y-6">
                  {active ? (
                  <div className="rounded-2xl overflow-hidden bg-gradient-to-l from-apple-blue to-[#1d4ed8] text-white p-6 sm:p-8">
                    <p className="text-xs opacity-80 mb-1">{active.active ? 'کمپین فعال' : 'کمپین'}</p>
                    <h1 className="text-xl sm:text-2xl font-bold">{active.title}</h1>
                    <p className="text-sm mt-2 opacity-90">{active.desc}</p>
                    {active.active && (
                    <div className="flex gap-2 mt-4 text-center">
                      {[[d,'روز'],[h,'ساعت'],[m,'دقیقه'],[s,'ثانیه']].map(([v,l]) => (
                        <div key={l} className="bg-white/15 rounded-xl px-3 py-2 min-w-[3.5rem]">
                          <p className="text-lg font-bold tabular-nums">{toFa(v)}</p>
                          <p className="text-xs opacity-80">{l}</p>
                        </div>
                      ))}
                    </div>
                    )}
                    {active.rules && <p className="text-xs mt-3 opacity-75">قوانین: {active.rules}</p>}
                  </div>
                  ) : (
                    <p className="text-center text-sm text-primary-500 py-10">کمپین فعالی نیست</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => openPLP()} className="px-4 py-2 rounded-full bg-apple-blue text-white text-xs font-medium">مشاهده محصولات کمپین</button>
                    <button type="button" onClick={() => { try { navigator.clipboard.writeText(window.location.href); showToast({ message: 'لینک کپی شد', variant: 'default', duration: 4500, position: 'top-center' }); } catch(_){} }} className="px-4 py-2 rounded-full border border-primary-200 dark:border-white/20 text-xs">اشتراک‌گذاری</button>
                  </div>
                  {others.length > 0 && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {others.map(c => (
                      <div key={c.id} className="p-5 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                        <h2 className="font-bold text-lg text-primary-900 dark:text-white">{c.title}</h2>
                        <p className="text-sm text-primary-600 dark:text-white/70 mt-1">{c.desc}</p>
                        <p className="text-xs text-primary-400 mt-2">{c.active ? 'فعال' : 'به‌زودی / غیرفعال'}</p>
                      </div>
                    ))}
                  </div>
                  )}
                </div>
                );
              })()}

              {/* شگفت‌انگیز / تخفیف‌ها */}
              {staticPage === 'deals' && (() => {
                let list = catalogProducts.filter(p => isDealActive(p) && (p.discount || 0) >= dealsMinDiscount);
                if (dealsSort === 'discount') list = [...list].sort((a,b) => (b.discount||0)-(a.discount||0));
                else if (dealsSort === 'cheap') list = [...list].sort((a,b) => (a.price||0)-(b.price||0));
                else if (dealsSort === 'new') list = [...list].reverse();
                return (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-white">پیشنهادات شگفت‌انگیز</h1>
                  </div>
                  <div className="flex flex-wrap gap-3 items-center p-3 sm:p-4 rounded-2xl bg-white dark:bg-primary-900 border border-primary-100 dark:border-white/10 shadow-sm">
                    <div className="flex flex-wrap gap-2">
                      {[0,20,30,40].map(d => (
                        <button key={d} type="button" onClick={() => setDealsMinDiscount(d)} className={`px-4 py-2 rounded-full text-xs font-bold transition shadow-sm ${dealsMinDiscount===d?'bg-[#FF0000] dark:bg-[#13ABC4] text-white':'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-white/80 hover:bg-primary-100 dark:hover:bg-primary-800'}`}>{d===0?'همه تخفیف‌ها':`از ${toFa(d)}٪ به بالا`}</button>
                      ))}
                    </div>
                    <select value={dealsSort || 'discount'} onChange={e => setDealsSort(e.target.value)} className="mr-auto text-xs rounded-full border border-primary-200 dark:border-white/15 bg-primary-50 dark:bg-primary-900 px-4 py-2 text-primary-700 dark:text-white font-medium">
                      <option value="discount">بیشترین تخفیف</option>
                      <option value="cheap">ارزان‌ترین</option>
                      <option value="new">جدیدترین</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
                    {list.slice(0, 24).map(p => (
                      <button key={p.id} type="button" onClick={() => { closeStaticPage(); openPDP(p); }} className="text-right rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 overflow-hidden hover:border-apple-blue/40 transition">
                        <div className="relative aspect-[4/5] bg-primary-50 dark:bg-primary-900">
                          <img src={p.colors?.[0]?.image || p.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                          {p.discount > 0 && <span className="absolute top-2 right-2 bg-apple-blue text-white text-xs font-bold px-1.5 py-0.5 rounded text-right">{toFa(p.discount)}٪</span>}
                          {(p.stock === 0 || p.available === false) && <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-bold">ناموجود</span>}
                        </div>
                        <div className="p-2.5">
                          <p className="text-sm sm:text-base font-medium text-primary-900 dark:!text-white line-clamp-2">{p.name}</p>
                          <p className="text-xs font-bold mt-1 text-primary-800 dark:text-white">{p.priceText} ت</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  {list.length === 0 && (
                    <p className="text-center text-sm text-primary-500 py-12">فعلاً پیشنهادی با این فیلتر نیست</p>
                  )}
                </div>
                );
              })()}

              {/* ۴۰۴ */}
              {staticPage === 'error-404' && (
                <div className="relative overflow-hidden rounded-3xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 px-4 sm:px-8 py-14 sm:py-16 text-center max-w-2xl mx-auto shadow-sm">
                  <div className="pointer-events-none absolute inset-0 opacity-[0.07] dark:opacity-[0.12]" aria-hidden>
                    <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-[#FF0000] dark:bg-[#13ABC4] blur-3xl" />
                    <div className="absolute -bottom-20 -right-10 w-64 h-64 rounded-full bg-[#AF0404] dark:bg-[#3161A3] blur-3xl" />
                  </div>
                  <div className="relative z-10 space-y-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary-200 dark:border-white/20 bg-primary-50 dark:bg-primary-950 text-xs font-medium text-primary-600 dark:text-[#7EFAFF]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF0000] dark:bg-[#13ABC4]" />
                      خطا · صفحه موجود نیست
                    </div>
                    <p className="text-7xl sm:text-8xl font-black leading-none tracking-tight text-[#FF0000] dark:text-[#13ABC4] select-none">۴۰۴</p>
                    <div className="space-y-2">
                      <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-[#EBFFFB]">صفحه پیدا نشد</h1>
                      <p className="text-sm text-primary-500 dark:text-white/65 max-w-md mx-auto leading-relaxed">
                        آدرس واردشده اشتباه است یا این صفحه حذف شده. می‌توانید جستجو کنید یا به بخش دیگری بروید.
                      </p>
                    </div>
                    <div className="max-w-sm mx-auto">
                      <input
                        type="search"
                        placeholder="جستجوی محصول، برند یا دسته..."
                        className="w-full px-4 py-3 rounded-2xl border border-primary-200 dark:border-white/20 bg-primary-50 dark:bg-primary-950 text-sm text-primary-900 dark:text-white placeholder:text-primary-400 dark:placeholder:text-white/40 outline-none focus:border-[#FF0000] dark:focus:border-[#13ABC4] transition"
                        onKeyDown={(e) => { if (e.key === 'Enter') { setSearchQuery(e.target.value); openPLP(); } }}
                      />
                    </div>
                    <div className="flex flex-wrap justify-center gap-2.5 pt-1">
                      <button type="button" onClick={() => { closeStaticPage(); window.scrollTo({ top: 0 }); }} className="px-6 py-2.5 rounded-full bg-[#FF0000] dark:bg-[#13ABC4] text-white text-sm font-semibold hover:bg-[#AF0404] dark:hover:bg-[#3161A3] transition shadow-md">خانه</button>
                      <button type="button" onClick={() => openPLP()} className="px-5 py-2.5 rounded-full border border-primary-200 dark:border-white/25 bg-white dark:bg-primary-950 text-sm font-medium text-primary-900 dark:text-white hover:border-[#FF0000] dark:hover:border-[#7EFAFF] transition">فروشگاه</button>
                      <button type="button" onClick={() => openStaticPage('deals')} className="px-5 py-2.5 rounded-full border border-primary-200 dark:border-white/25 bg-white dark:bg-primary-950 text-sm font-medium text-primary-900 dark:text-white hover:border-[#FF0000] dark:hover:border-[#7EFAFF] transition">شگفت‌انگیز</button>
                    </div>
                  </div>
                </div>
              )}

              {/* ۵۰۰ */}
              {staticPage === 'error-500' && (
                <div className="text-center py-16 space-y-4 max-w-md mx-auto">
                  <p className="text-6xl font-bold text-primary-200 dark:text-primary-700">۵۰۰</p>
                  <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-white">خطایی رخ داد</h1>
                  <p className="text-sm text-primary-500">موقتاً مشکلی پیش آمده. چند لحظه دیگر دوباره تلاش کنید.</p>
                  <button type="button" onClick={() => window.location.reload()} className="px-5 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium">تلاش مجدد</button>
                </div>
              )}

              {/* تعمیرات */}
              {staticPage === 'maintenance' && (
                <div className="text-center py-16 space-y-4 max-w-md mx-auto">
                  <Icon name="settings" size={40} className="mx-auto text-primary-400" />
                  <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-white">سایت در حال به‌روزرسانی است</h1>
                  <p className="text-sm text-primary-500">به‌زودی برمی‌گردیم. از شکیبایی شما سپاسگزاریم.</p>
</div>
              )}
            </div>
          )}

          {/* بنر رضایت کوکی — ۱۰٪ بالاتر از پایین؛ در صفحه اصلی پس از پایان هیرو */}
          {!cookieConsent && (headerRevealedAfterHero || activeSellerId || showSellersList || showPLP || showTaxonomyHub || pdpProduct || showCartPage || showCheckout || showWishlistPage || showRecentPage || showComparePage || showProfilePage || showSellerPanel || showAdminPanel || staticPage) && (
            <div className="fixed bottom-[10vh] inset-x-0 z-[150] p-3 sm:p-4 pointer-events-none">
              <div className="max-w-3xl mx-auto pointer-events-auto rounded-2xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 shadow-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-3 sm:items-center">
                <p className="flex-1 text-xs sm:text-sm text-primary-700 dark:text-white/80 leading-6">
                  برای بهبود تجربه از کوکی‌های ضروری استفاده می‌کنیم. جزئیات در{' '}
                  <button type="button" onClick={() => openStaticPage('cookies')} className="text-apple-blue underline">سیاست کوکی</button>.
                </p>
                <div className="flex gap-2 flex-shrink-0">
                  <button type="button" onClick={() => { setCookieConsent('essential'); try { localStorage.setItem('cookieConsent', 'essential'); } catch (_) {} }} className="px-3 py-2 rounded-full border border-primary-200 dark:border-white/20 text-xs font-medium text-primary-700 dark:text-white">فقط ضروری</button>
                  <button type="button" onClick={() => { setCookieConsent('all'); try { localStorage.setItem('cookieConsent', 'all'); } catch (_) {} }} className="px-4 py-2 rounded-full bg-apple-blue text-white text-xs font-bold">پذیرش همه</button>
                </div>
              </div>
            </div>
          )}

          {/* Footer — در تمام صفحات بدون استثنا */}
          
          <footer className="bg-primary-50 dark:bg-primary-950 text-primary-800 dark:text-white pt-10 sm:pt-14 pb-6 sm:pb-8 border-t border-primary-200 dark:border-white/30 transition-colors">
            <div className="max-w-7xl mx-auto px-3 sm:px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 mb-8 sm:mb-12 items-start">
                {/* ستون ۱ — فقط دسکتاپ (موبایل حذف) */}
                <div className="min-w-0 hidden md:block">
                  <h3 className="font-bold text-base sm:text-lg text-primary-900 dark:text-white mb-3">دسترسی سریع</h3>
                  <ul className="space-y-2 text-sm text-primary-500 dark:text-white/80">
                    <li><button type="button" onClick={() => { try { closeStaticPage(); } catch (_) {} try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_) {} }} className="text-red-600 hover:text-red-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition">خانه</button></li>
                    <li><button type="button" onClick={() => { try { closeStaticPage(); openPLP?.(); } catch (_) {} }} className="text-red-600 hover:text-red-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition">فروشگاه</button></li>
                    <li><button type="button" onClick={() => { try { closeStaticPage(); openSellersList?.(); } catch (_) {} }} className="text-red-600 hover:text-red-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition">فروشندگان</button></li>
                    <li><button type="button" onClick={() => { try { openStaticPage('brands'); } catch (_) {} }} className="text-red-600 hover:text-red-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition">برندها</button></li>
                    <li><button type="button" onClick={() => { try { openStaticPage('deals'); } catch (_) {} }} className="text-red-600 hover:text-red-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition">شگفت‌انگیز</button></li>
                    <li><button type="button" onClick={() => { try { openStaticPage('about'); } catch (_) {} }} className="text-red-600 hover:text-red-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition">درباره ما</button></li>
                    <li><button type="button" onClick={() => { try { openStaticPage('contact'); } catch (_) {} }} className="text-red-600 hover:text-red-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition">تماس با ما</button></li>
                  </ul>
                </div>

                {/* ستون ۲ */}
                <div className="min-w-0">
                  <h3 className="font-bold text-base sm:text-lg text-primary-900 dark:text-white mb-3">خدمات مشتریان</h3>
                  <ul className="space-y-2 text-sm text-primary-500 dark:text-white/80">
                    <li><button type="button" onClick={() => { try { openStaticPage('track'); } catch (_) {} }} className="text-red-600 hover:text-red-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition">پیگیری سفارش</button></li>
                    <li><button type="button" onClick={() => { try { openStaticPage('faq'); } catch (_) {} }} className="text-red-600 hover:text-red-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition">سوالات متداول</button></li>
                    <li><button type="button" onClick={() => { try { openStaticPage('size-guide'); } catch (_) {} }} className="text-red-600 hover:text-red-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition">راهنمای سایز</button></li>
                    <li><button type="button" onClick={() => { try { openStaticPage('returns'); } catch (_) {} }} className="text-red-600 hover:text-red-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition">شرایط بازگشت کالا</button></li>
                    <li><button type="button" onClick={() => { try { openStaticPage('privacy'); } catch (_) {} }} className="text-red-600 hover:text-red-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition">حریم خصوصی</button></li>
                    <li><button type="button" onClick={() => { try { openStaticPage('terms'); } catch (_) {} }} className="text-red-600 hover:text-red-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition">قوانین و شرایط</button></li>
                    <li><button type="button" onClick={() => { try { openStaticPage('blog'); } catch (_) {} }} className="text-red-600 hover:text-red-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition">بلاگ</button></li>
                    <li><button type="button" onClick={() => { try { openStaticPage('sitemap'); } catch (_) {} }} className="text-red-600 hover:text-red-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition">نقشه سایت</button></li>
                    <li><button type="button" onClick={() => { try { openStaticPage('become-seller'); } catch (_) {} }} className="text-red-600 hover:text-red-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition">فروشنده شوید</button></li>
                  </ul>
                </div>

                {/* ستون ۳ */}
                <div className="min-w-0">
                  <h3 className="font-bold text-base sm:text-lg text-primary-900 dark:text-white mb-3">ساعات پاسخگویی</h3>
                  <ul className="space-y-2 text-sm text-primary-500 dark:text-white/80">
                    <li>شنبه تا چهارشنبه: ۹ تا ۱۸</li>
                    <li>پنج‌شنبه: ۹ تا ۱۴</li>
                    <li>جمعه: تعطیل</li>
                    <li className="pt-1 text-primary-600 dark:text-white/90">پشتیبانی آنلاین همه روزه</li>
                    <li className="pt-2 text-xs text-primary-400 dark:text-white/60 leading-relaxed">فروشگاه اینترنتی — ارسال به سراسر ایران</li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-primary-200 dark:border-primary-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
                <p className="text-primary-400 dark:text-white/70 text-sm text-center md:text-right">© ۱۴۰۵ پیراهن مردانه (PIRAHANMARDANE.IR). تمامی حقوق محفوظ است.</p>
                <EnamadFooterBadge />
              </div>
            </div>
          </footer>


          {/* Mobile Mega Menu — مدرن، تمام‌صفحه */}
          {mobileMenuOpen && (
            <div role="dialog" aria-modal="true" aria-label="منوی اصلی" className="mobile-menu-panel fixed inset-0 z-[9999] h-[100dvh] max-h-[100dvh] w-full max-w-[100vw] bg-primary-50 dark:bg-primary-950 flex flex-col overflow-hidden isolate" style={{ top: 0, left: 0, right: 0, bottom: 0, position: 'fixed', width: '100%', overflowX: 'hidden' }}>
              {/* Header */}
              <div className="flex items-center justify-between gap-3 px-4 py-3.5 bg-white dark:bg-primary-900 border-b border-primary-100 dark:border-white/10 flex-shrink-0 relative z-10 w-full max-w-full overflow-hidden">
                <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
                  <img src={dark ? "/logo-white.webp" : "/logo-dark.webp"} alt="پیراهن مردانه" className="site-logo-img h-8 w-auto max-w-[140px] object-contain flex-shrink-0" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo.webp'; }} />
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-white active:scale-95 transition"
                  aria-label="بستن منو"
                >
                  <Icon name="x" size={20} />
                </button>
              </div>

              {/* میانبرهای آیکونی — بالاترین بخش مگامنو */}
              <div className="flex-shrink-0 px-3.5 pt-3 pb-2 bg-primary-50 dark:bg-primary-950 border-b border-primary-100 dark:border-white/10">
                <div className="flex items-center justify-center gap-2 sm:gap-3 px-1 py-1">

                  <button
                    type="button"
                    onClick={() => { setMobileMenuOpen(false); setNotifPanelOpen(true); setCartOpen(false); setWishlistOpen(false); setCompareOpen(false); setRecentOpen(false); }}
                    className="header-icon-btn relative w-11 h-11 flex items-center justify-center rounded-full text-primary-800 dark:text-white bg-white dark:bg-primary-900 border border-primary-100 dark:border-white/10 shadow-sm active:scale-95 transition"
                    title="اعلان‌ها"
                    aria-label="اعلان‌ها"
                  >
                    <Icon name="bell" size={18} />
                    {unreadNotifCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">{toFa(unreadNotifCount > 9 ? '9+' : unreadNotifCount)}</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={toggleDarkMode}
                    className="header-icon-btn w-11 h-11 flex items-center justify-center rounded-full text-primary-800 dark:text-white bg-white dark:bg-primary-900 border border-primary-100 dark:border-white/10 shadow-sm active:scale-95 transition"
                    title={dark ? 'حالت روشن' : 'حالت تاریک'}
                    aria-label={dark ? 'حالت روشن' : 'حالت تاریک'}
                  >
                    <Icon name={dark ? 'sun' : 'moon'} size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMobileMenuOpen(false); openCartPage(); }}
                    className="header-icon-btn relative w-11 h-11 flex items-center justify-center rounded-full text-primary-800 dark:text-white bg-white dark:bg-primary-900 border border-primary-100 dark:border-white/10 shadow-sm active:scale-95 transition"
                    title="سبد خرید"
                    aria-label="سبد خرید"
                  >
                    <Icon name="shoppingBag" size={18} />
                    {hasMounted && cartCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-apple-blue text-white text-xs font-bold flex items-center justify-center">{toFa(cartCount > 9 ? '9+' : cartCount)}</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMobileMenuOpen(false); openWishlistPage(); }}
                    className="header-icon-btn relative w-11 h-11 flex items-center justify-center rounded-full text-primary-800 dark:text-white bg-white dark:bg-primary-900 border border-primary-100 dark:border-white/10 shadow-sm active:scale-95 transition"
                    title="علاقه‌مندی‌ها"
                    aria-label="علاقه‌مندی‌ها"
                  >
                    <Icon name={favorites.length ? 'heartFilled' : 'heart'} size={18} />
                    {hasMounted && favorites.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-apple-blue text-white text-xs font-bold flex items-center justify-center">{toFa(favorites.length > 9 ? '9+' : favorites.length)}</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMobileMenuOpen(false); openComparePage(); }}
                    className="header-icon-btn relative w-11 h-11 flex items-center justify-center rounded-full text-primary-800 dark:text-white bg-white dark:bg-primary-900 border border-primary-100 dark:border-white/10 shadow-sm active:scale-95 transition"
                    title="مقایسه"
                    aria-label="مقایسه"
                  >
                    <Icon name="scale" size={18} />
                    {hasMounted && compare.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-apple-blue text-white text-xs font-bold flex items-center justify-center">{toFa(compare.length > 9 ? '9+' : compare.length)}</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMobileMenuOpen(false); openRecentPage(); }}
                    className="header-icon-btn relative w-11 h-11 flex items-center justify-center rounded-full text-primary-800 dark:text-white bg-white dark:bg-primary-900 border border-primary-100 dark:border-white/10 shadow-sm active:scale-95 transition"
                    title="بازدید اخیر"
                    aria-label="بازدید اخیر"
                  >
                    <Icon name="eye" size={18} />
                    {recentlyViewed.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-apple-blue text-white text-xs font-bold flex items-center justify-center">{toFa(Math.min(recentlyViewed.length, 9))}</span>
                    )}
                  </button>
                
                </div>
              </div>
              <div className="flex-shrink-0 px-3.5 py-2 border-b border-primary-100 dark:border-white/10 sm:hidden">
                <button
                  type="button"
                  onClick={() => { try { setMobileMenuOpen(false); setPublicTrackOpen(true); } catch (_) {} }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-primary-900 border border-primary-100 dark:border-white/10 text-primary-800 dark:text-white"
                >
                  <Icon name="package" size={18} />
                  <span>پیگیری سفارش</span>
                </button>
              </div>


              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain px-3.5 py-4 space-y-5 w-full max-w-full">
                {/* ورود جدا: خریدار / فروشنده */}
                {user ? (
                  <button
                    type="button"
                    onClick={() => { setMobileMenuOpen(false); openProfilePage(); }}
                    className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-primary-900 border border-primary-100 dark:border-white/10 shadow-sm text-right active:scale-[0.99] transition"
                  >
                    <span className="w-11 h-11 rounded-full bg-apple-blue flex items-center justify-center flex-shrink-0 text-white">
                      <Icon name="user" size={20} className="!text-white" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-primary-900 dark:text-white truncate">
                        {user.firstName ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}` : 'حساب کاربری'}
                      </span>
                      <span className="block text-xs text-primary-400 dark:!text-white mt-0.5">مشاهده حساب و سفارش‌ها</span>
                    </span>
                    {unreadNotifCount > 0 && (
                      <span className="text-xs font-bold bg-apple-blue text-white min-w-[1.35rem] h-5 px-1.5 rounded-full flex items-center justify-center">{toFa(unreadNotifCount)}</span>
                    )}
                    <Icon name="chevronLeft" size={16} className="text-primary-300 dark:text-white/30 flex-shrink-0" />
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { setMobileMenuOpen(false); openAuth(); }}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white dark:bg-primary-900 border border-primary-100 dark:border-white/10 shadow-sm active:scale-[0.99] transition"
                    >
                      <span className="w-10 h-10 rounded-full bg-apple-blue flex items-center justify-center !text-white">
                        <Icon name="user" size={18} className="!text-white" />
                      </span>
                      <span className="text-xs font-bold text-primary-900 dark:text-white whitespace-nowrap shrink-0">ورود خریدار</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMobileMenuOpen(false); openSellerAuth(); }}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white dark:bg-primary-900 border border-primary-100 dark:border-white/10 shadow-sm active:scale-[0.99] transition"
                    >
                      <span className="w-10 h-10 rounded-full bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center !text-white">
                        <Icon name="sell" size={18} className="!text-white" />
                      </span>
                      <span className="text-xs font-bold text-primary-900 dark:text-white whitespace-nowrap shrink-0 header-auth min-w-0 max-w-full overflow-hidden">ورود فروشنده</span>
                    </button>
                  </div>

                )}

                {/* لینک‌های اصلی */}
                <div className="rounded-2xl bg-white dark:bg-primary-900 border border-primary-100 dark:border-white/10 shadow-sm overflow-hidden divide-y divide-primary-50 dark:divide-white/5">
                  {[
                    { label: 'خانه', icon: 'home', onClick: () => { setMobileMenuOpen(false); setPdpProduct(null); setActiveSellerId(null); setShowSellersList(false); setShowCartPage(false); setShowCheckout(false); setShowWishlistPage(false); setShowComparePage(false); setShowProfilePage(false); setShowSellerPanel(false); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
                    { label: 'فروشگاه', icon: 'package', onClick: () => { setMobileMenuOpen(false); openPLP(); } },
                    { label: 'فروشندگان', icon: 'users', onClick: () => openSellersList() },
                    { label: 'شگفت‌انگیز', icon: 'gift', onClick: () => { setMobileMenuOpen(false); openStaticPage('deals'); } },
                    { label: 'برندها', icon: 'package', onClick: () => { setMobileMenuOpen(false); openStaticPage('brands'); } },
                    { label: 'شرایط بازگشت', icon: 'package', onClick: () => { setMobileMenuOpen(false); openStaticPage('returns'); } },
                    { label: 'بلاگ', icon: 'package', onClick: () => { setMobileMenuOpen(false); openStaticPage('blog'); } },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.onClick}
                      className="w-full flex items-center gap-3 px-3.5 py-3 text-right active:bg-primary-50 dark:active:bg-primary-800 transition"
                    >
                      <span className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-800 text-primary-700 dark:text-white flex items-center justify-center flex-shrink-0">
                        <Icon name={item.icon} size={16} />
                      </span>
                      <span className="flex-1 text-sm font-medium text-primary-900 dark:text-white">{item.label}</span>
                      {item.badge > 0 && (
                        <span className="text-xs font-bold bg-apple-blue text-white min-w-[1.25rem] h-[1.25rem] px-1 rounded-full flex items-center justify-center">{toFa(item.badge)}</span>
                      )}
                      <Icon name="chevronLeft" size={14} className="text-primary-300 dark:text-white/25" />
                    </button>
                  ))}
                </div>

                {/* دسته‌بندی‌ها */}
                <div>
                  <h4 className="text-xs font-bold text-primary-400 dark:!text-white mb-2.5 px-1 tracking-wide">دسته‌بندی‌ها</h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    {categories.map((cat) => (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          if (cat.name === 'همه محصولات') openPLP();
                          else openPLP({ cat: cat.name });
                        }}
                        className="flex items-center gap-2.5 p-3 rounded-2xl bg-white dark:bg-primary-900 border border-primary-100 dark:border-white/10 shadow-sm active:scale-[0.98] transition text-right"
                      >
                        <span className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-800 text-primary-700 dark:text-white flex items-center justify-center flex-shrink-0">
                          <Icon name={cat.icon} size={18} />
                        </span>
                        <span className="text-xs font-semibold text-primary-800 dark:text-white leading-snug">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* پرفروش‌ترین‌ها */}
                <div>
                  <h4 className="text-xs font-bold text-primary-400 dark:!text-white mb-2.5 px-1 tracking-wide">پرفروش‌ترین‌ها</h4>
                  <div className="space-y-2">
                    {products.slice(0, 3).map((p) => {
                      const col = (p.colors && p.colors[0]) || { name: '', image: p.image || p.cover_image || '/logo.webp' };
                      return (
                        <button key={p.id} type="button" onClick={() => { setMobileMenuOpen(false); openPDP(p); }} className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-white dark:bg-primary-900 border border-primary-100 dark:border-white/10 shadow-sm active:scale-[0.99] transition text-right">
                          <img src={col.image} alt={p.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" loading="lazy" decoding="async" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-primary-900 dark:text-white line-clamp-2" title={p.name}>{p.name}</p>
                            <p className="text-xs font-bold text-apple-blue dark:text-[#13ABC4] mt-0.5">{p.priceText} تومان</p>
                          </div>
                          <Icon name="chevronLeft" size={14} className="text-primary-300 dark:text-white/25 flex-shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* لینک‌های ثانویه */}
                <div className="rounded-2xl bg-white dark:bg-primary-900 border border-primary-100 dark:border-white/10 shadow-sm overflow-hidden divide-y divide-primary-50 dark:divide-white/5">
                  <button type="button" onClick={() => { setMobileMenuOpen(false); openStaticPage('contact'); }} className="w-full flex items-center gap-3 px-3.5 py-3 text-right active:bg-primary-50 dark:active:bg-primary-800 transition">
                    <span className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-800 text-primary-700 dark:text-white flex items-center justify-center flex-shrink-0">
                      <Icon name="phone" size={16} />
                    </span>
                    <span className="flex-1 text-sm font-medium text-primary-900 dark:text-white">تماس با ما</span>
                    <Icon name="chevronLeft" size={14} className="text-primary-300 dark:text-white/25" />
                  </button>
                  <button type="button" onClick={() => { setMobileMenuOpen(false); openStaticPage('about'); }} className="w-full flex items-center gap-3 px-3.5 py-3 text-right active:bg-primary-50 dark:active:bg-primary-800 transition">
                    <span className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-800 text-primary-700 dark:text-white flex items-center justify-center flex-shrink-0">
                      <Icon name="alertCircle" size={16} />
                    </span>
                    <span className="flex-1 text-sm font-medium text-primary-900 dark:text-white">درباره ما</span>
                    <Icon name="chevronLeft" size={14} className="text-primary-300 dark:text-white/25" />
                  </button>
                  <button type="button" onClick={() => { setMobileMenuOpen(false); openStaticPage('faq'); }} className="w-full flex items-center gap-3 px-3.5 py-3 text-right active:bg-primary-50 dark:active:bg-primary-800 transition">
                    <span className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-800 text-primary-700 dark:text-white flex items-center justify-center flex-shrink-0">
                      <Icon name="alertCircle" size={16} />
                    </span>
                    <span className="flex-1 text-sm font-medium text-primary-900 dark:text-white">سوالات متداول</span>
                    <Icon name="chevronLeft" size={14} className="text-primary-300 dark:text-white/25" />
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMobileMenuOpen(false); if (sellerUser) openSellerPanel(); else openSellerAuth(); }}
                    className="w-full flex items-center gap-3 px-3.5 py-3 text-right active:bg-primary-50 dark:active:bg-primary-800 transition"
                  >
                    <span className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <Icon name="sell" size={16} />
                    </span>
                    <span className="flex-1 text-sm font-medium text-primary-900 dark:text-white whitespace-nowrap shrink-0">{sellerUser ? 'پنل فروشنده' : 'فروشنده شوید'}</span>
                    {sellerUser && sellerUnreadTickets > 0 && (
                      <span className="text-xs font-bold bg-apple-blue text-white min-w-[1.25rem] h-[1.25rem] px-1 rounded-full flex items-center justify-center">{toFa(sellerUnreadTickets)}</span>
                    )}
                    <Icon name="chevronLeft" size={14} className="text-primary-300 dark:text-white/25" />
                  </button>
                  <button type="button" onClick={() => { setMobileMenuOpen(false); openStaticPage('privacy'); }} className="w-full flex items-center gap-3 px-3.5 py-3 text-right active:bg-primary-50 dark:active:bg-primary-800 transition">
                    <span className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-800 text-primary-700 dark:text-white flex items-center justify-center flex-shrink-0">
                      <Icon name="shield" size={16} />
                    </span>
                    <span className="flex-1 text-sm font-medium text-primary-900 dark:text-white">حریم خصوصی</span>
                    <Icon name="chevronLeft" size={14} className="text-primary-300 dark:text-white/25" />
                  </button>
                  <button type="button" onClick={() => { setMobileMenuOpen(false); openStaticPage('sitemap'); }} className="w-full flex items-center gap-3 px-3.5 py-3 text-right active:bg-primary-50 dark:active:bg-primary-800 transition">
                    <span className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-800 text-primary-700 dark:text-white flex items-center justify-center flex-shrink-0">
                      <Icon name="grid" size={16} />
                    </span>
                    <span className="flex-1 text-sm font-medium text-primary-900 dark:text-white">نقشه سایت</span>
                    <Icon name="chevronLeft" size={14} className="text-primary-300 dark:text-white/25" />
                  </button>
                </div>

                {/* بنر تخفیف */}
                <button type="button" onClick={() => { setMobileMenuOpen(false); openPLP(); }} className="w-full block rounded-2xl overflow-hidden relative h-28 text-right shadow-sm">
                  <img src="https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&h=300&fit=crop&q=80&fm=webp" alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
                  <div className="absolute inset-0 bg-gradient-to-l from-black/75 via-black/40 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-end p-4 text-white">
                    <div>
                      <span className="text-xs font-bold bg-apple-blue px-2.5 py-1 rounded-full">تا ۲۹٪ تخفیف</span>
                      <p className="font-bold text-sm mt-1.5">پیشنهادات شگفت‌انگیز</p>
                      <p className="text-xs text-white/70 mt-0.5">مشاهده همه محصولات</p>
                    </div>
                  </div>
                </button>
              </div>

            </div>
          )}

          {/* Quick Add popup */}
          {quickAdd && (() => {
            const p = quickAdd;
            const gallery = p.colors || [];
            const mainImg = gallery[quickGalleryIdx]?.image || gallery[0]?.image;
            const selectedColor = gallery[quickColorIdx] || gallery[0];
            const desc = p.desc || `${p.name} از دسته ${p.category} با کیفیت عالی و دوخت تمیز. مناسب استفاده روزمره و رسمی، با پارچه مرغوب و رنگ‌بندی متنوع برای سلیقه‌های مختلف.`;
            return (
              <div
                className="site-modal-root" role="dialog" aria-modal="true"
                style={{ background: 'rgba(0,0,0,0.5)' }}
                onClick={() => setQuickAdd(null)}
              >
                <div
                  className="quick-add-popup max-h-[90dvh] overflow-y-auto bg-white dark:bg-black rounded-2xl shadow-2xl border border-primary-200 dark:border-white/80"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-primary-200 dark:border-white/40 bg-white dark:bg-primary-900 rounded-t-2xl">
                    <h3 className="text-base font-bold text-primary-900 dark:text-white line-clamp-2" title={p.name}>{p.name}</h3>
                    <button type="button" onClick={() => setQuickAdd(null)} className="w-9 h-9 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-white">
                      <Icon name="x" size={18} />
                    </button>
                  </div>
                  <div className="p-4 space-y-4">
                    {/* Mobile: stacked (unchanged) */}
                    <div className="sm:hidden space-y-3">
                      <div
                        className={`rounded-xl overflow-hidden bg-primary-50 dark:bg-primary-800 mx-auto w-full aspect-[4/5] cursor-zoom-in max-w-full`}
                        onClick={() => setImgZoom(z => !z)}
                        title="برای بزرگ‌نمایی کلیک کنید"
                      >
                        <img src={mainImg} alt={p.name} className={`w-full h-full object-cover transition-transform duration-300 ${imgZoom ? 'scale-125' : 'scale-100'}`} loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                      </div>
                      {gallery.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                          {gallery.map((c, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => { setQuickGalleryIdx(i); setQuickColorIdx(i); }}
                              className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition ${quickGalleryIdx === i ? 'border-primary-800 dark:border-white' : 'border-primary-200 dark:border-white/50'}`}
                            >
                              <img src={c.image} alt={c.name} className="w-full h-full object-cover" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Desktop: main image + thumbnails on the right */}
                    <div className="hidden sm:flex flex-row gap-3 items-start justify-center" dir="ltr">
                      <div
                        className={`rounded-xl overflow-hidden bg-primary-50 dark:bg-primary-800 aspect-[16/15] cursor-zoom-in flex-1 max-w-[23.4rem] max-h-[22rem] ${imgZoom ? 'max-w-none max-h-none' : ''}`}
                        onClick={() => setImgZoom(z => !z)}
                        title="برای بزرگ‌نمایی کلیک کنید"
                      >
                        <img src={mainImg} alt={p.name} className={`w-full h-full object-cover transition-transform duration-300 ${imgZoom ? 'scale-125' : 'scale-100'}`} loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                      </div>
                      {gallery.length > 1 && (
                        <div className="flex flex-col gap-2 flex-shrink-0 max-h-[28rem] overflow-y-auto no-scrollbar">
                          {gallery.map((c, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => { setQuickGalleryIdx(i); setQuickColorIdx(i); }}
                              className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition flex-shrink-0 ${quickGalleryIdx === i ? 'border-primary-800 dark:border-white' : 'border-primary-200 dark:border-white/50'}`}
                            >
                              <img src={c.image} alt={c.name} className="w-full h-full object-cover" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary-400 dark:text-white mb-2">رنگ</p>
                      <div className="flex flex-wrap gap-2">
                        {gallery.map((c, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => { setQuickColorIdx(i); setQuickGalleryIdx(i); }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition text-primary-900 dark:text-white ${quickColorIdx === i ? 'border-primary-800 dark:border-white bg-primary-50 dark:bg-primary-800' : 'border-primary-200 dark:border-white/50'}`}
                          >
                            <span className="color-swatch w-4 h-4 rounded-full border border-primary-300 dark:border-white/60" style={{ ["--swatch-color"]: c.hex || '#888', backgroundColor: c.hex || '#888' }} />
                            {c.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary-400 dark:text-white mb-2">سایز</p>
                      <div className="flex flex-wrap gap-2">
                        {(p.sizes || allSizes).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setQuickSize(s)}
                            className={`latin-label size-chip min-w-[2.75rem] px-3 py-2 rounded-lg border text-xs font-semibold transition ${quickSize === s ? 'size-chip--active bg-primary-800 !text-white border-primary-800 dark:bg-[#13ABC4] dark:!text-white dark:border-[#13ABC4]' : 'border-primary-200 dark:border-white/50 !text-primary-900 dark:!text-white bg-transparent'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary-400 dark:text-white mb-2">تعداد</p>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => setQuickQty(q => Math.max(1, q - 1))} className="w-9 h-9 rounded-full border border-primary-200 dark:border-[#13ABC4] flex items-center justify-center text-primary-900 dark:text-white">
                          <Icon name="minus" size={16} />
                        </button>
                        <span className="text-base font-medium w-8 text-center tabular-nums text-primary-900 dark:text-white">{toFa(quickQty)}</span>
                        <button type="button" onClick={() => setQuickQty(q => q + 1)} className="w-9 h-9 rounded-full border border-primary-200 dark:border-[#13ABC4] flex items-center justify-center text-primary-900 dark:text-white">
                          <Icon name="plus" size={16} />
                        </button>
                      </div>
                    </div>
                    {/* Collapsible short description — closed by default */}
                    <div className="border border-primary-200 dark:border-white/30 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setQuickDescOpen(v => !v)}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-primary-900 dark:text-white bg-primary-50 dark:bg-primary-900"
                      >
                        <span>توضیح کوتاه</span>
                        <Icon name="chevronDown" size={16} className={`transition-transform ${quickDescOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {quickDescOpen && (
                        <p className="px-3 py-3 text-sm text-primary-600 dark:text-white leading-relaxed border-t border-primary-200 dark:border-white/30">
                          {desc}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <p className={`font-bold text-base ${p.discount ? 'text-primary-900 dark:text-white' : 'text-primary-900 dark:text-white'}`}>
                        {p.priceText} <span className="text-xs font-normal text-primary-400 dark:!text-white">تومان</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addToCart(p, { colorIdx: quickColorIdx, selectedColor, size: quickSize || '', qty: quickQty, requireSize: true })}
                      className="w-full bg-apple-blue text-white py-3.5 rounded-full font-medium text-sm hover:opacity-90 active:scale-[0.98] transition"
                    >
                      افزودن به سبد خرید
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Mobile search filters — bottom sheet with backdrop; closes on outside click */}
          {catOpen && (
            <div
              className="flex md:!hidden flex-col max-md:flex"
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100dvh', zIndex: 9999, background: 'rgba(0,0,0,0.45)' }}
              onClick={() => setCatOpen(false)}
            >
              <div
                data-filter-panel="true"
                className="flex flex-col overflow-hidden w-full mt-auto rounded-t-2xl bg-white dark:bg-primary-900"
                style={{ maxHeight: '78dvh' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-primary-200 dark:border-white/30 flex-shrink-0">
                  <span className="text-sm font-bold text-primary-900 dark:text-white">فیلتر جستجو</span>
                  <button type="button" onClick={() => setCatOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-white">
                    <Icon name="x" size={18} />
                  </button>
                </div>
                <div className="overflow-y-auto overscroll-contain flex-1 px-3 py-3" style={{ WebkitOverflowScrolling: 'touch' }}>
                  <div className="px-1 py-1.5 text-xs font-bold text-primary-400">دسته‌بندی</div>
                  <div className="flex flex-wrap gap-2 px-1 pb-2">
                    {['رسمی', 'کروات', 'آستین کوتاه'].map(c => {
                      const on = searchCategories.includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleSearchCategory(c)}
                          className={`px-3.5 py-2 rounded-full text-xs font-medium border ${on ? 'search-filter-chip--on px-3.5 py-2 rounded-full text-xs font-bold border-2 border-[#FF0000] bg-[#FF0000] dark:border-[#13ABC4] dark:bg-[#13ABC4] !text-white shadow-sm' : 'px-3.5 py-2 rounded-full text-xs font-medium border border-primary-200 dark:border-white/50 text-primary-800 dark:!text-white/75 bg-transparent'}`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                  <div className="border-t border-primary-200 dark:border-white/30 my-3" />
                  <div className="px-1 py-1.5 text-xs font-bold text-primary-400">رنگ</div>
                  <div className="flex flex-wrap gap-2 px-1 pb-2">
                    {(Array.isArray(allColors) ? allColors : []).map(c => {
                      const on = (searchColors || []).includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleSearchColor(c)}
                          className={`px-3.5 py-2 rounded-full text-xs font-medium border ${on ? 'search-filter-chip--on px-3.5 py-2 rounded-full text-xs font-bold border-2 border-[#FF0000] bg-[#FF0000] dark:border-[#13ABC4] dark:bg-[#13ABC4] !text-white shadow-sm' : 'px-3.5 py-2 rounded-full text-xs font-medium border border-primary-200 dark:border-white/50 text-primary-800 dark:!text-white/75 bg-transparent'}`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                  <div className="border-t border-primary-200 dark:border-white/30 my-3" />
                  <div className="px-1 py-1.5 text-xs font-bold text-primary-400">سایز</div>
                  <div className="flex flex-wrap gap-2 px-1 pb-2">
                    {(Array.isArray(allSizes) ? allSizes : []).map(s => {
                      const on = (searchSizes || []).includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSearchSize(s)}
                          className={`latin-label min-w-[3rem] px-3.5 py-2 rounded-full text-xs font-medium border ${on ? 'search-filter-chip--on px-3.5 py-2 rounded-full text-xs font-bold border-2 border-[#FF0000] bg-[#FF0000] dark:border-[#13ABC4] dark:bg-[#13ABC4] !text-white shadow-sm' : 'px-3.5 py-2 rounded-full text-xs font-medium border border-primary-200 dark:border-white/50 text-primary-800 dark:!text-white/75 bg-transparent'}`}
                        >
                          سایز {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex-shrink-0 px-4 py-3 border-t border-primary-200 dark:border-white/30">
                  <button
                    type="button"
                    onClick={() => {
                      setCatOpen(false);
                      openPLP();
                    }}
                    className="w-full bg-apple-blue text-white py-3 rounded-full font-medium text-sm hover:opacity-90 active:scale-[0.98] transition"
                  >
                    اعمال فیلتر
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Compare floating bar */}
          {compare.length > 0 && !showComparePage && !wishlistOpen && !compareOpen && !recentOpen && !cartOpen && !mobileMenuOpen && (
            <div className="fixed bottom-20 sm:bottom-16 inset-x-0 z-[140] p-3 sm:p-4 pointer-events-none">
              <div className="pointer-events-auto max-w-3xl mx-auto rounded-2xl shadow-2xl border border-primary-200 dark:border-white/20 bg-white/95 dark:bg-primary-900/95 backdrop-blur-xl px-3 sm:px-4 py-3 flex items-center gap-3">
                <div className="flex -space-x-2 space-x-reverse flex-shrink-0">
                  {compare.map(p => (
                    <div key={p.id} className="relative">
                      <img src={p.colors?.[0]?.image || p.image} alt="" className="w-10 h-12 sm:w-12 sm:h-14 object-cover rounded-lg border-2 border-white dark:border-primary-900 shadow" />
                      <button type="button" onClick={() => toggleCompare(p)} className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-primary-800 text-white flex items-center justify-center text-xs" aria-label="حذف">×</button>
                    </div>
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-primary-900 dark:text-white">مقایسه · {toFa(compare.length)} از {toFa(COMPARE_MAX)}</p>
                  <p className="text-xs text-primary-500 dark:!text-white truncate">{compare.length < 2 ? 'یک کالای دیگر اضافه کنید' : 'آماده مقایسه'}</p>
                </div>
                <button type="button" onClick={openComparePage} className="flex-shrink-0 px-3 sm:px-4 py-2 rounded-full bg-apple-blue text-white text-xs font-bold">مقایسه کن</button>
                <button type="button" onClick={clearCompare} className="flex-shrink-0 p-2 rounded-full text-primary-500 hover:bg-primary-100 dark:hover:bg-primary-800" aria-label="پاک کردن">
                  <Icon name="x" size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Replace when compare full */}
          {compareReplaceOpen && (
            <div className="site-modal-root" role="dialog" aria-modal="true">
              <div className="site-modal-backdrop" onClick={() => setCompareReplaceOpen(null)} />
              <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-primary-900 p-5 shadow-2xl border border-primary-200 dark:border-white/20">
                <h3 className="font-bold text-primary-900 dark:text-white text-base mb-1">ظرفیت مقایسه پر است</h3>
                <p className="text-xs text-primary-500 dark:!text-white mb-4">حداکثر {toFa(COMPARE_MAX)} کالا. یکی را جایگزین کنید:</p>
                <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                  {compare.map(p => (
                    <button key={p.id} type="button" onClick={() => replaceCompareAt(p.id, compareReplaceOpen)} className="w-full flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-primary-900 border border-primary-200 dark:border-white/20 hover:border-apple-blue text-right transition">
                      <img src={p.colors?.[0]?.image || p.image} alt="" className="w-12 h-14 object-cover rounded-lg" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm sm:text-base font-medium text-primary-900 dark:!text-white line-clamp-2">{p.name}</p>
                        <p className="text-xs text-primary-500 mt-0.5">ضربه برای جایگزینی</p>
                      </div>
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => setCompareReplaceOpen(null)} className="w-full py-2.5 rounded-full border border-primary-200 dark:border-white/30 text-sm text-primary-700 dark:text-white">انصراف</button>
              </div>
            </div>
          )}

          {/* Notifications Drawer — outside header so fixed = viewport height */}
          {notifPanelOpen && (
            <>
              <div className="cart-overlay fixed inset-0 z-[90] bg-black/40 backdrop-blur-xl" onClick={() => setNotifPanelOpen(false)} onWheel={(e) => e.preventDefault()} onTouchMove={(e) => e.preventDefault()} aria-hidden="true" />
              <div role="dialog" aria-modal="true" className="cart-panel fixed top-0 bottom-0 start-0 z-[200] w-full max-w-[360px] sm:max-w-[400px] h-full min-h-0 max-h-[100dvh] bg-white dark:bg-primary-900 shadow-2xl flex flex-col rounded-l-2xl overflow-hidden" role="dialog" aria-modal="true" aria-label="اعلان‌ها">
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-primary-200 dark:border-white/30 bg-primary-50/50 dark:bg-primary-900/40">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-apple-blue text-white flex items-center justify-center">
                      <Icon name="bell" size={18} />
                    </div>
                    <div className="drawer-title-wrap">
                      <h3 data-drawer-title className="font-bold text-base text-primary-900 dark:!text-white leading-tight">اعلان‌ها</h3>
                      <p className="text-xs text-primary-500 dark:!text-white">{toFa(unreadNotifCount)} خوانده‌نشده</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={markAllNotifsRead} className="text-xs px-2 py-1 rounded-full text-apple-blue">همه خوانده</button>
                    <button type="button" onClick={() => setNotifPanelOpen(false)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-primary-100 dark:hover:bg-primary-800 transition text-primary-900 dark:text-white" aria-label="بستن">
                      <Icon name="x" size={20} />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2.5" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {(notifications || []).length === 0 ? (
                    <EmptyStateBox title="اعلانی نیست" description="وقتی سفارشی ارسال شود یا موجودی برسد اینجا می‌بینید." className="border-0 bg-transparent py-10" />
                  ) : (
                    (notifications || []).slice(0, 40).map(n => (
                      <button key={n.id} type="button" onClick={() => markNotifRead(n.id)} className={`w-full text-right px-3.5 py-3 rounded-2xl border border-primary-100 dark:border-white/10 transition hover:bg-primary-50/90 dark:hover:bg-[#1A1C20] ${n.read ? 'opacity-75 bg-white dark:bg-black/40' : 'bg-apple-blue/5 dark:bg-[#13ABC4]/10 border-apple-blue/20 dark:border-[#13ABC4]/25'}`}>
                        <div className="flex items-start gap-2.5">
                          {!n.read && <span className="mt-1.5 w-2 h-2 rounded-full bg-apple-blue dark:bg-[#13ABC4] flex-shrink-0 text-white" />}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-primary-900 dark:text-white">{n.title}</p>
                            <p className="text-xs text-primary-500 dark:!text-white line-clamp-2 mt-0.5">{n.body}</p>
                            <p className="text-xs text-primary-400 dark:!text-white mt-1">{n.date}</p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                <div className="p-3 border-t border-primary-100 dark:border-white/10">
                  <button type="button" onClick={() => { setNotifPanelOpen(false); if (user) { openProfilePage('notifications'); } else { openAuth(); } }} className="w-full text-center text-xs py-2.5 rounded-xl text-apple-blue font-medium hover:bg-primary-50 dark:hover:bg-primary-900">مشاهده همه در پروفایل</button>
                </div>
              </div>
            </>
          )}

          {/* Wishlist Drawer */}
          {wishlistOpen && (
            <>
              <div className="cart-overlay fixed inset-0 z-[90] bg-black/40 backdrop-blur-xl" onClick={() => setWishlistOpen(false)} onWheel={(e) => e.preventDefault()} onTouchMove={(e) => e.preventDefault()} aria-hidden="true" />
              <div role="dialog" aria-modal="true" className="cart-panel fixed top-0 bottom-0 start-0 z-[200] w-full max-w-[360px] sm:max-w-[400px] bg-white dark:bg-primary-900 h-full min-h-0 max-h-[100dvh] shadow-2xl flex flex-col rounded-l-2xl overflow-hidden" role="dialog" aria-modal="true" aria-label="علاقه‌مندی‌ها">
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-primary-200 dark:border-white/30 bg-primary-50/50 dark:bg-primary-900/40">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-apple-blue text-white flex items-center justify-center">
                      <Icon name="heartFilled" size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-primary-900 dark:!text-white leading-tight">علاقه‌مندی‌ها</h3>
                      <p className="text-xs text-primary-500 dark:text-white">{toFa(favorites.length)} کالا · عمل سریع</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {favorites.length > 0 && (
                      wishlistClearConfirm ? (
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={clearFavorites} className="text-xs px-2 py-1 rounded-full bg-red-500 text-white">تأیید</button>
                          <button type="button" onClick={() => setWishlistClearConfirm(false)} className="text-xs px-2 py-1 rounded-full border border-primary-200 dark:border-white/30">لغو</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setWishlistClearConfirm(true)} className="text-xs px-2 py-1 rounded-full text-primary-500 dark:text-white/70 hover:bg-primary-100 dark:hover:bg-primary-800">حذف همه</button>
                      )
                    )}
                    <button type="button" onClick={() => setWishlistOpen(false)} className="p-2 hover:bg-primary-100 dark:hover:bg-primary-800 rounded-full transition text-primary-900 dark:text-white" aria-label="بستن">
                      <Icon name="x" size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-5" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {wishlistProducts.length === 0 ? (
                    <div className="text-center py-14 px-2">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-50 dark:bg-primary-900 flex items-center justify-center text-primary-400">
                        <Icon name="heart" size={28} />
                      </div>
                      <p className="text-primary-800 dark:text-white text-sm font-bold mb-1">هنوز چیزی را لایک نکرده‌اید</p>
                      <p className="text-primary-500 dark:!text-white text-xs mb-5">با زدن قلب، کالاها اینجا می‌آیند</p>
                      <button type="button" onClick={() => { setWishlistOpen(false); openPLP(); }} className="inline-flex px-5 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium">مشاهده محصولات</button>
                    </div>
                  ) : (
                    wishlistProducts.map((p, idx) => {
                      if (p.missing) {
                        return (
                          <div key={`w-miss-${p.id}`} className="py-3 border-b border-primary-100 dark:border-white/10">
                            <p className="text-xs text-red-500">کالا دیگر موجود نیست</p>
                            <button type="button" onClick={() => toggleFavorite(p.id)} className="text-xs text-primary-500 mt-1">حذف</button>
                          </div>
                        );
                      }
                      const priceDropped = p.priceAtAdd && p.price < p.priceAtAdd;
                      const out = p.stock === 0;
                      return (
                        <div key={`w-${p.id}`} className="flex gap-3 py-3.5 border-b border-primary-100 dark:border-white/10 last:border-0">
                          <button type="button" className="flex-shrink-0 p-0 border-0 bg-transparent" onClick={() => { setWishlistOpen(false); openPDP(p); }}>
                            <img src={p.colors?.[0]?.image || p.image} alt={p.name || "محصول"} className="w-16 h-20 object-cover rounded-xl shadow-sm" loading="lazy" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.classList.add("img-broken"); e.currentTarget.src = "/logo.webp"; }} />
                          </button>
                          <div className="flex-1 min-w-0">
                            <button type="button" className="text-right w-full p-0 border-0 bg-transparent" onClick={() => { setWishlistOpen(false); openPDP(p); }}>
                              <h4 className="text-xs font-medium text-primary-900 dark:text-white line-clamp-2">{p.name}</h4>
                            </button>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {out && <span className="text-xs text-red-500">ناموجود</span>}
                              {priceDropped && <span className="text-xs text-apple-blue font-medium">کاهش قیمت</span>}
                              {p.discount > 0 && <span className="text-xs font-bold text-apple-blue">{toFa(p.discount)}٪</span>}
                            </div>
                            <p className="text-xs font-bold text-primary-900 dark:text-white mt-1">{p.priceText} <span className="dark:!text-white">تومان</span></p>
                            <div className="flex items-center gap-2 mt-2">
                              {!out ? (
                                <button type="button" onClick={() => addToCart(p)} className="text-xs px-2.5 py-1 rounded-full bg-apple-blue text-white">افزودن به سبد</button>
                              ) : (
                                <button type="button" className="text-xs px-2.5 py-1 rounded-full border border-primary-200 dark:border-white/30 text-primary-600 dark:text-white">خبرم کن</button>
                              )}
                              <button type="button" onClick={() => toggleFavorite(p.id)} className="mr-auto p-1.5 rounded-full text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-800" aria-label="حذف">
                                <Icon name="trash" size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {favorites.length > 0 && (
                  <div className="p-4 sm:p-5 border-t border-primary-200 dark:border-white/30 space-y-2 bg-primary-50/40 dark:bg-primary-900/30">
                    <button type="button" onClick={() => { setWishlistOpen(false); openWishlistPage(); }} className="w-full bg-apple-blue text-white py-3 rounded-full font-medium hover:opacity-90 transition shadow-md">
                      مشاهده صفحه علاقه‌مندی‌ها
                    </button>
                    <button type="button" onClick={() => { setWishlistOpen(false); openPLP(); }} className="drawer-secondary-btn w-full py-2.5 rounded-full text-sm font-semibold border border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30]">
                      ادامه خرید
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Compare Drawer — عمل سریع از آیکون هدر */}
          {compareOpen && (
            <>
              <div className="cart-overlay fixed inset-0 z-[90] bg-black/40 backdrop-blur-xl" onClick={() => setCompareOpen(false)} onWheel={(e) => e.preventDefault()} onTouchMove={(e) => e.preventDefault()} aria-hidden="true" />
              <div role="dialog" aria-modal="true" className="cart-panel fixed top-0 bottom-0 start-0 z-[200] w-full max-w-[360px] sm:max-w-[400px] bg-white dark:bg-primary-900 h-full min-h-0 max-h-[100dvh] shadow-2xl flex flex-col rounded-l-2xl overflow-hidden" role="dialog" aria-modal="true" aria-label="مقایسه">
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-primary-200 dark:border-white/30 bg-primary-50/50 dark:bg-primary-900/40">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-apple-blue text-white flex items-center justify-center">
                      <Icon name="scale" size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-primary-900 dark:text-white leading-tight">مقایسه</h3>
                      <p className="text-xs text-primary-500 dark:text-white">{toFa(compare.length)} از {toFa(COMPARE_MAX)} کالا</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {compare.length > 0 && (
                      <button type="button" onClick={clearCompare} className="text-xs px-2 py-1 rounded-full border border-primary-200 dark:border-white/30 text-primary-600 dark:text-white/80 hover:bg-primary-50 dark:hover:bg-primary-800">پاک کردن</button>
                    )}
                    <button type="button" onClick={() => setCompareOpen(false)} className="p-2 hover:bg-primary-100 dark:hover:bg-primary-800 rounded-full transition text-primary-900 dark:text-white" aria-label="بستن">
                      <Icon name="x" size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
                  {compare.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                      <div className="w-14 h-14 rounded-full bg-primary-50 dark:bg-primary-900 flex items-center justify-center mb-3 text-primary-400">
                        <Icon name="scale" size={28} />
                      </div>
                      <p className="text-sm font-medium text-primary-700 dark:text-white mb-1">لیست مقایسه خالی است</p>
                      <p className="text-xs text-primary-500 dark:!text-white mb-4">محصولات را از فروشگاه به مقایسه اضافه کنید</p>
                      <button type="button" onClick={() => { setCompareOpen(false); openPLP(); }} className="inline-flex px-5 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium">مشاهده فروشگاه</button>
                    </div>
                  ) : (
                    compare.map(p => (
                      <div key={p.id} className="flex gap-3 p-2.5 rounded-xl border border-primary-100 dark:border-white/10 bg-white dark:bg-primary-900/40">
                        <button type="button" className="flex-shrink-0 p-0 border-0 bg-transparent" onClick={() => { setCompareOpen(false); openPDP(p); }}>
                          <img src={p.colors?.[0]?.image || p.image} alt={p.name || "محصول"} className="w-16 h-20 object-cover rounded-lg" onError={(e) => { e.currentTarget.classList.add("img-broken"); e.currentTarget.src = "/logo.webp"; }} />
                        </button>
                        <div className="min-w-0 flex-1 flex flex-col">
                          <button type="button" className="text-right w-full p-0 border-0 bg-transparent" onClick={() => { setCompareOpen(false); openPDP(p); }}>
                            <p className="text-xs sm:text-sm font-medium text-primary-900 dark:text-white line-clamp-2">{p.name}</p>
                            <p className="text-xs text-primary-500 dark:!text-white mt-0.5">{p.category}</p>
                            <p className="text-xs font-bold text-primary-800 dark:text-[#13ABC4] mt-1">{p.priceText} تومان</p>
                          </button>
                          <div className="mt-auto flex items-center justify-end pt-1">
                            <button type="button" onClick={() => toggleCompare(p)} className="p-1.5 rounded-full text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-800" aria-label="حذف از مقایسه">
                              <Icon name="trash" size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {compare.length > 0 && (
                  <div className="p-4 sm:p-5 border-t border-primary-200 dark:border-white/30 space-y-2 bg-primary-50/40 dark:bg-primary-900/30">
                    <button
                      type="button"
                      onClick={() => { setCompareOpen(false); openComparePage(); }}
                      disabled={compare.length < 2}
                      className={`w-full py-3 rounded-full font-medium transition shadow-md ${compare.length < 2 ? 'bg-primary-200 dark:bg-primary-800 text-primary-500 dark:!text-white cursor-not-allowed' : 'bg-apple-blue text-white hover:opacity-90'}`}
                    >
                      {compare.length < 2 ? 'حداقل ۲ کالا برای مقایسه' : 'مقایسه کن'}
                    </button>
                    <button type="button" onClick={() => { setCompareOpen(false); openPLP(); }} className="drawer-secondary-btn w-full py-2.5 rounded-full text-sm font-semibold border border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30]">
                      ادامه خرید
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Recent views Drawer — عمل سریع از آیکون هدر */}
          {recentOpen && (
            <>
              <div className="cart-overlay fixed inset-0 z-[90] bg-black/40 backdrop-blur-xl" onClick={() => setRecentOpen(false)} onWheel={(e) => e.preventDefault()} onTouchMove={(e) => e.preventDefault()} aria-hidden="true" />
              <div role="dialog" aria-modal="true" className="cart-panel fixed top-0 bottom-0 start-0 z-[200] w-full max-w-[360px] sm:max-w-[400px] bg-white dark:bg-primary-900 h-full min-h-0 max-h-[100dvh] shadow-2xl flex flex-col rounded-l-2xl overflow-hidden" role="dialog" aria-modal="true" aria-label="بازدید اخیر">
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-primary-200 dark:border-white/30 bg-primary-50/50 dark:bg-primary-900/40">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-apple-blue text-white flex items-center justify-center">
                      <Icon name="eye" size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-primary-900 dark:text-white leading-tight">بازدید اخیر</h3>
                      <p className="text-xs text-primary-500 dark:text-white">{toFa(recentlyViewed.length)} کالا</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setRecentOpen(false)} className="p-2 hover:bg-primary-100 dark:hover:bg-primary-800 rounded-full transition text-primary-900 dark:text-white" aria-label="بستن">
                    <Icon name="x" size={18} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {recentlyViewed.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                      <div className="w-14 h-14 rounded-full bg-primary-50 dark:bg-primary-900 flex items-center justify-center mb-3 text-primary-400">
                        <Icon name="eye" size={28} />
                      </div>
                      <p className="text-sm font-medium text-primary-700 dark:text-white mb-1">هنوز بازدیدی ثبت نشده</p>
                      <p className="text-xs text-primary-500 dark:!text-white mb-4">محصولاتی که می‌بینید اینجا می‌آیند</p>
                      <button type="button" onClick={() => { setRecentOpen(false); openPLP(); }} className="inline-flex px-5 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium">مشاهده فروشگاه</button>
                    </div>
                  ) : (
                    recentlyViewed.map(p => (
                      <div key={p.id} className="flex gap-3 p-2.5 rounded-xl border border-primary-100 dark:border-white/10 bg-white dark:bg-primary-900/40">
                        <button type="button" className="flex-shrink-0 p-0 border-0 bg-transparent" onClick={() => { setRecentOpen(false); openPDP(p); }}>
                          <img src={p.colors?.[0]?.image || p.image} alt={p.name || "محصول"} className="w-16 h-20 object-cover rounded-lg" onError={(e) => { e.currentTarget.classList.add("img-broken"); e.currentTarget.src = "/logo.webp"; }} />
                        </button>
                        <div className="min-w-0 flex-1 flex flex-col">
                          <button type="button" className="text-right w-full p-0 border-0 bg-transparent" onClick={() => { setRecentOpen(false); openPDP(p); }}>
                            <p className="text-xs font-medium text-primary-900 dark:text-white line-clamp-2">{p.name}</p>
                            <p className="text-xs font-bold text-primary-900 dark:text-white mt-1">{p.priceText} <span className="dark:!text-white">تومان</span></p>
                          </button>
                          <div className="mt-auto flex items-center justify-start gap-2 pt-1" dir="rtl">
                            <button type="button" onClick={() => addToCart(p)} className="text-xs px-2.5 py-1 rounded-full bg-apple-blue text-white">سبد</button>
                            <button type="button" onClick={() => toggleFavorite(p.id)} className="text-xs px-2.5 py-1 rounded-full border border-primary-200 dark:border-white/30 text-primary-600 dark:text-white">لایک</button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {recentlyViewed.length > 0 && (
                  <div className="p-4 sm:p-5 border-t border-primary-200 dark:border-white/30 space-y-2 bg-primary-50/40 dark:bg-primary-900/30">
                    <button type="button" onClick={() => { setRecentOpen(false); openRecentPage(); }} className="w-full py-3 rounded-full font-medium bg-apple-blue text-white hover:opacity-90 transition shadow-md">
                      مشاهده صفحه بازدید اخیر
                    </button>
                    <button type="button" onClick={() => { setRecentOpen(false); openPLP(); }} className="drawer-secondary-btn w-full py-2.5 rounded-full text-sm font-semibold border border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30]">
                      ادامه خرید
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Cart Drawer - modern animated */}
    </>
  );
}
