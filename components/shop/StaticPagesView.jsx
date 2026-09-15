'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useAppApi } from '../AppApiContext';
import { About3 } from '../ui/about-3';
import Avatar from '../ui/Avatar';
import dynamic from 'next/dynamic';
import EnamadFooterBadge from './EnamadFooterBadge';
import { ModemAnimatedFooter } from '../ui/modem-animated-footer';
const FAQMonochrome = dynamic(() => import('../ui/faq-monochrome').then(m => m.FAQMonochrome || m.default), { ssr: false });

/** StaticPagesView — code-split from App.jsx */
export default function StaticPagesView() {
  const {BRANDS_LIST, COMPARE_MAX, DEFAULT_SITE_FAQS, DEFAULT_SELLER_FAQS, EmptyStateBox, Icon, SimpleEditor, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Textarea, activeSellerId, addBlogComment, addToCart, blogCommentName, blogCommentText, blogComments, blogPostId, blogPosts, brandDetailId, brandsList, adminCatalogBrands, catalogProducts, brandQuery, campaignNow, campaignsList, cart, cartCount: cartCountProp, cartOpen, catOpen, clearCompare, clearFavorites, closeStaticPage, compare, compareOpen, compareReplaceOpen, contactForm, contactFormError, cookieConsent, dark, dealsMinDiscount, dealsSort, faqCat, faqQuery, favorites, getPageCms, hasMounted, headerRevealedAfterHero, imgZoom, isBlogLiked, isDealActive, markAllNotifsRead, markNotifRead, mobileMenuOpen, notifPanelOpen, notifications, unreadNotifCount: unreadNotifCountRaw, openAdminPanel, openAuth, openCartPage, openComparePage, openPDP, renderProductCard, openPLP, openProfilePage, openRecentPage, openSellerAuth, openSellerPanel, openSellersList, openStaticPage, setPublicTrackOpen, openWishlistPage, orders, pdpProduct, products, pushLiveToast, quickAdd, quickColorIdx, quickDescOpen, quickGalleryIdx, quickQty, quickSize, recentOpen, recentlyViewed, renderShareBar, replaceCompareAt, searchCategories, searchColors, searchSizes, sellerUser, sellerTickets, setActiveSellerId, setBlogCommentName, setBlogCommentText, setBrandDetailId, setBrandQuery, setCartOpen, setCatOpen, setCompareOpen, setCompareReplaceOpen, setContactForm, setContactFormError, setCookieConsent, setDark, toggleDarkMode, setDealsMinDiscount, setDealsSort, setFaqCat, setFaqQuery, setImgZoom, setMobileMenuOpen, setNotifPanelOpen, setPdpProduct, setQuickAdd, setQuickColorIdx, setQuickDescOpen, setQuickGalleryIdx, setQuickQty, setQuickSize, setRecentOpen, setSearchQuery, setShowCartPage, setShowCheckout, setShowComparePage, setShowPLP, setShowProfilePage, setShowSellerPanel, setShowSellersList, setShowWishlistPage, setWishlistClearConfirm, setWishlistOpen, showAdminPanel, showCartPage, showCheckout, showComparePage, showPLP, showProfilePage, showRecentPage, showSellerPanel, showSellersList, showTaxonomyHub, showToast, showWishlistPage, siteFaqs, staticPage, toFa, toggleBlogLike, toggleCompare, toggleFavorite, toggleSearchCategory, toggleSearchColor, toggleSearchSize, categories, allColors, allSizes, user, wishlistClearConfirm, wishlistOpen, wishlistProducts, publicTrackOpen, openBrand} = useAppApi();
  const _sellerTickets = (typeof sellerTickets !== 'undefined' ? sellerTickets : (api && api.sellerTickets)) || [];
  const sellerUnreadTickets = (Array.isArray(sellerTickets) ? sellerTickets : []).filter((x) => x && x.unread).length;

    const [magQuery, setMagQuery] = useState('');
  const [magVisible, setMagVisible] = useState(9);
  const magSentinelRef = useRef(null);
  useEffect(() => { setMagVisible(9); }, [faqQuery, magQuery]);
  const magFiltered = useMemo(() => {
    const posts = Array.isArray(blogPosts) ? blogPosts : [];
    const q = String(magQuery || '').trim().toLowerCase();
    const cat = String(faqQuery || '').trim();
    return posts.filter((post) => {
      const live = post.status === 'published' || (post.status === 'scheduled' && post.publishAtMs && Number(post.publishAtMs) <= Date.now());
      if (!live) return false;
      const pcat = post.cat || post.category || '';
      const tags = Array.isArray(post.tags) ? post.tags : (Array.isArray(post.tag_names) ? post.tag_names : []);
      // فیلتر دسته یا برچسب (هر دو از faqQuery)
      if (cat && pcat !== cat && !tags.includes(cat)) return false;
      if (q) {
        const hay = `${post.title || ''} ${post.excerpt || ''} ${pcat} ${tags.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [blogPosts, faqQuery, magQuery]);
  useEffect(() => {
    const el = magSentinelRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        setMagVisible((n) => (n < magFiltered.length ? n + 9 : n));
      }
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [magFiltered.length]);

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
              {/* درباره ما — ساختار About3 | هدر و فوتر سایت حفظ می‌شود */}
              {staticPage === 'about' && (
                <div className="w-full">
                  {(() => {
                    const cms = typeof getPageCms === 'function' ? getPageCms('about') : null;
                    if (cms && (cms.body || cms.image || cms.video)) {
                      return (
                        <div className="space-y-3 mb-8 p-4 rounded-2xl border border-primary-200 border-white/15 bg-white bg-primary-900">
                          {cms.image ? <img src={cms.image} alt="" className="w-full max-h-64 object-cover rounded-xl" loading="lazy" decoding="async" /> : null}
                          {cms.video ? <div className="aspect-video rounded-xl overflow-hidden bg-primary-100 bg-primary-900"><iframe title="ویدیو" src={cms.video} className="w-full h-full border-0" allowFullScreen /></div> : null}
                          {cms.body ? <div className="about-cms-body text-sm sm:text-base leading-8 sm:leading-9 text-primary-700 text-white/80 prose prose-sm max-w-none space-y-4" dangerouslySetInnerHTML={{ __html: cms.body }} /> : null}
                        </div>
                      );
                    }
                    return null;
                  })()}
                  <About3
                    onShopClick={() => { try { openPLP(); } catch (_) {} }}
                    onContactClick={() => { try { openStaticPage('contact'); } catch (_) {} }}
                    onBecomeSellerClick={() => { try { openStaticPage('become-seller'); } catch (_) {} }}
                  />
                </div>
              )}

{/* تماس با ما */}
              {staticPage === 'contact' && (
                <div className="w-full space-y-6">
                  <h1 className="text-xl sm:text-2xl font-bold text-primary-900 text-white">تماس با ما</h1>
                  {(() => {
                    const cms = getPageCms('contact');
                    if (!cms || (!cms.body && !cms.image && !cms.video)) return null;
                    return (
                      <div className="space-y-3 p-4 rounded-2xl border border-primary-200 border-white/15 bg-white bg-primary-900">
                        {cms.image ? <img src={cms.image} alt="" className="w-full max-h-64 object-cover rounded-xl"  loading="lazy" decoding="async" /> : null}
                        {cms.video ? <div className="aspect-video rounded-xl overflow-hidden bg-primary-100 bg-primary-900"><iframe title="ویدیو" src={cms.video} className="w-full h-full border-0" allowFullScreen /></div> : null}
                        {cms.body ? <div className="contact-cms-body text-sm sm:text-base leading-8 sm:leading-9 text-primary-700 text-white/80 prose prose-sm max-w-none space-y-4" dangerouslySetInnerHTML={{ __html: cms.body }} /> : null}
                      </div>
                    );
                  })()}

                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div className="p-4 rounded-2xl border border-primary-200 border-white/15 bg-white bg-primary-900 space-y-2">
<p className="text-primary-500 text-[#13ABC4] text-xs pt-1">شنبه تا چهارشنبه ۹–۱۸ · پنج‌شنبه ۹–۱۴</p>
                    </div>
                    <div className="p-4 rounded-2xl border border-primary-200 border-white/15 bg-white bg-primary-900 text-xs sm:text-sm text-primary-500 text-[#13ABC4] leading-7 sm:leading-8">فروشگاه اینترنتی هستیم و شعبه حضوری نداریم. برای پیگیری سفارش از پروفایل یا تیکت پشتیبانی استفاده کنید.</div>
                  </div>
                  <form className="space-y-3 p-4 rounded-2xl border border-primary-200 border-white/15 bg-white bg-primary-900" onSubmit={(e) => { e.preventDefault(); if (!contactForm.name.trim() || !contactForm.message.trim()) { setContactFormError('نام و پیام الزامی است'); return; } setContactFormError(''); try { showToast({ title: 'ثبت شد', message: 'پیام شما دریافت شد. به‌زودی پاسخ می‌دهیم.', variant: 'success' }); } catch (_) {} setContactForm({ name: '', phone: '', subject: '', message: '' }); }}>
                    <input value={contactForm.name} onChange={e => { setContactForm(f => ({ ...f, name: e.target.value })); setContactFormError(''); }} placeholder="نام *" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 border-white/20 bg-transparent text-sm text-primary-900 text-white" />
                    <input value={contactForm.phone} onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))} placeholder="موبایل یا ایمیل" dir="rtl" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 border-white/20 bg-transparent text-sm text-right text-primary-900 text-white font-['IRANYekanX',Tahoma,sans-serif]" />
                    <input value={contactForm.subject} onChange={e => setContactForm(f => ({ ...f, subject: e.target.value }))} placeholder="موضوع" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 border-white/20 bg-transparent text-sm text-primary-900 text-white" />
                    <Textarea value={contactForm.message} onChange={(v) => { setContactForm(f => ({ ...f, message: v || '' })); setContactFormError(''); }} error={contactFormError || undefined} rows={4} placeholder="پیام *" style={{ minHeight: 120 }} />
                    <div className="flex justify-start">
                      <button type="submit" className="btn-cta px-6 sm:px-8 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium hover:opacity-95 transition">ارسال پیام</button>
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
                  <h1 className="text-xl sm:text-2xl font-bold text-primary-900 text-white mb-2">سوالات متداول</h1>
                  {(() => {
                    const cms = getPageCms('faq');
                    if (!cms || (!cms.body && !cms.image && !cms.video)) return null;
                    return (
                      <div className="space-y-3 p-4 rounded-2xl border border-primary-200 border-white/15 bg-white bg-primary-900">
                        {cms.image ? <img src={cms.image} alt="" className="w-full max-h-64 object-cover rounded-xl"  loading="lazy" decoding="async" /> : null}
                        {cms.video ? <div className="aspect-video rounded-xl overflow-hidden bg-primary-100 bg-primary-900"><iframe title="ویدیو" src={cms.video} className="w-full h-full border-0" allowFullScreen /></div> : null}
                        {cms.body ? <div className="text-sm leading-7 text-primary-700 text-white/80 prose prose-sm prose- max-w-none" dangerouslySetInnerHTML={{ __html: cms.body }} /> : null}
                      </div>
                    );
                  })()}

                  <input value={faqQuery} onChange={e => setFaqQuery(e.target.value)} placeholder="جستجو در سوالات..." className="w-full px-4 py-2.5 rounded-xl border border-primary-200 border-white/20 bg-white bg-primary-900 text-sm text-primary-900 text-white" />
                  <div className="flex flex-wrap gap-1.5">
                    {cats.map(c => (
                      <button key={c} type="button" onClick={() => setFaqCat(c)} className={`px-3 py-1 rounded-full text-xs font-medium border transition ${faqCat === c ? 'bg-apple-blue text-white border-apple-blue' : 'border-primary-200 border-white/20 text-primary-600 text-white/70'}`}>{c === 'all' ? 'همه' : c}</button>
                    ))}
                  </div>
                  {filtered.length === 0 ? (
                    <p className="text-sm text-primary-500 text-[#13ABC4] text-center py-6">نتیجه‌ای یافت نشد</p>
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
                  <h1 className="text-xl sm:text-2xl font-bold text-primary-900 text-white">راهنمای سایز</h1>
                  {(() => {
                    const cms = getPageCms('size-guide');
                    if (!cms || (!cms.body && !cms.image && !cms.video)) return null;
                    return (
                      <div className="space-y-3 p-4 rounded-2xl border border-primary-200 border-white/15 bg-white bg-primary-900">
                        {cms.image ? <img src={cms.image} alt="" className="w-full max-h-64 object-cover rounded-xl"  loading="lazy" decoding="async" /> : null}
                        {cms.video ? <div className="aspect-video rounded-xl overflow-hidden bg-primary-100 bg-primary-900"><iframe title="ویدیو" src={cms.video} className="w-full h-full border-0" allowFullScreen /></div> : null}
                        {cms.body ? <div className="text-sm leading-7 text-primary-700 text-white/80 prose prose-sm prose- max-w-none" dangerouslySetInnerHTML={{ __html: cms.body }} /> : null}
                      </div>
                    );
                  })()}

                  <p className="text-sm text-primary-600 text-white/70 leading-7">اندازه‌ها به سانتی‌متر است. برای دقت بیشتر، یک پیراهن مناسب خود را اندازه بگیرید.</p>
                  <div className="overflow-x-auto rounded-2xl border border-primary-200 border-white/15">
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
                  <ul className="text-sm text-primary-600 text-white/70 space-y-2 list-disc list-inside">
                    <li>سینه: پهن‌ترین قسمت سینه را اندازه بگیرید.</li>
                    <li>شانه: از نوک یک شانه تا شانه دیگر از پشت.</li>
                    <li>بین دو سایز هستید؟ برای فیت تنگ‌تر سایز کوچک‌تر را انتخاب کنید.</li>
                  </ul>
                </div>
              )}

              {/* فروشنده شوید */}
              {staticPage === 'become-seller' && (
                <div className="w-full space-y-8 p-4 sm:p-6 rounded-2xl border border-primary-200 border-white/15 bg-white bg-primary-900">
                  <div className="text-center space-y-3">
                    <h1 className="text-xl sm:text-2xl font-bold text-primary-900 text-white">شما هم فروشنده شوید</h1>
                  {(() => {
                    const cms = getPageCms('become-seller');
                    if (!cms || (!cms.body && !cms.image && !cms.video)) return null;
                    return (
                      <div className="space-y-3 p-4 rounded-2xl border border-primary-200 border-white/15 bg-white bg-primary-900">
                        {cms.image ? <img src={cms.image} alt="" className="w-full max-h-64 object-cover rounded-xl"  loading="lazy" decoding="async" /> : null}
                        {cms.video ? <div className="aspect-video rounded-xl overflow-hidden bg-primary-100 bg-primary-900"><iframe title="ویدیو" src={cms.video} className="w-full h-full border-0" allowFullScreen /></div> : null}
                        {cms.body ? <div className="text-sm leading-7 text-primary-700 text-white/80 prose prose-sm prose- max-w-none" dangerouslySetInnerHTML={{ __html: cms.body }} /> : null}
                      </div>
                    );
                  })()}

                    <p className="text-sm text-primary-600 text-white/70 leading-7">بدون اجاره مغازه، به هزاران خریدار پیراهن مردانه دسترسی پیدا کنید. قیمت شفاف و مدیریت سفارش ساده.</p>
                    <button type="button" onClick={() => { if (sellerUser) { closeStaticPage(); openSellerPanel(); } else { openSellerAuth(); } }} className="inline-flex px-8 py-3 rounded-full bg-apple-blue text-white text-sm font-bold whitespace-nowrap shrink-0">
                      {sellerUser ? 'ورود به پنل فروشنده' : 'شروع ثبت‌نام فروشنده'}
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {[{ n: '۱', t: 'ثبت‌نام و احراز', d: 'موبایل، مدارک و جواز کسب' }, { n: '۲', t: 'افزودن کالا', d: 'تصویر استاندارد و قیمت‌گذاری' }, { n: '۳', t: 'فروش و پشتیبانی', d: 'مدیریت سفارش و ارتباط با خریدار' }].map(s => (
                      <div key={s.n} className="p-4 rounded-2xl border border-primary-200 border-white/15 bg-white bg-primary-900 text-center">
                        <span className="inline-flex w-8 h-8 rounded-full bg-apple-blue text-white items-center justify-center text-sm font-bold mb-2">{s.n}</span>
                        <p className="font-bold text-sm text-primary-900 text-white">{s.t}</p>
                        <p className="text-xs text-primary-500 text-[#13ABC4] mt-1">{s.d}</p>
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
                <div className="w-full space-y-6 text-primary-700 text-white/80">
                  <h1 className="text-xl sm:text-2xl font-bold text-primary-900 text-white">قوانین و شرایط استفاده</h1>
                  {(() => {
                    const cms = getPageCms('terms');
                    if (!cms || (!cms.body && !cms.image && !cms.video)) return null;
                    return (
                      <div className="space-y-3 p-4 rounded-2xl border border-primary-200 border-white/15 bg-white bg-primary-900">
                        {cms.image ? <img src={cms.image} alt="" className="w-full max-h-64 object-cover rounded-xl"  loading="lazy" decoding="async" /> : null}
                        {cms.video ? <div className="aspect-video rounded-xl overflow-hidden bg-primary-100 bg-primary-900"><iframe title="ویدیو" src={cms.video} className="w-full h-full border-0" allowFullScreen /></div> : null}
                        {cms.body ? <div className="text-sm leading-7 text-primary-700 text-white/80 prose prose-sm prose- max-w-none" dangerouslySetInnerHTML={{ __html: cms.body }} /> : null}
                      </div>
                    );
                  })()}

                  {(() => {
                    const cms = getPageCms('terms');
                    if (cms && (cms.body || cms.image || cms.video)) return null;
                    return (
                      <p className="text-sm text-primary-500 text-white/55 py-10 text-center">
                        محتوای این صفحه به‌زودی تکمیل می‌شود.
                      </p>
                    );
                  })()}
                </div>
              )}

              {/* بازگشت */}
              {staticPage === 'returns' && (
                <div className="w-full space-y-6 text-sm text-primary-700 text-white/80 leading-7">
                  <h1 className="text-xl sm:text-2xl font-bold text-primary-900 text-white">بازگشت کالا</h1>
                  {(() => {
                    const cms = getPageCms('returns');
                    if (!cms || (!cms.body && !cms.image && !cms.video)) {
                      return (
                        <p className="text-sm text-primary-500 text-white/55 py-8 text-center">
                          محتوای این صفحه به‌زودی از پنل ادمین تکمیل می‌شود.
                        </p>
                      );
                    }
                    return (
                      <div className="space-y-3 p-4 rounded-2xl border border-primary-200 border-white/15 bg-white bg-primary-900">
                        {cms.image ? <img src={cms.image} alt="" className="w-full max-h-64 object-cover rounded-xl"  loading="lazy" decoding="async" /> : null}
                        {cms.video ? <div className="aspect-video rounded-xl overflow-hidden bg-primary-100 bg-primary-900"><iframe title="ویدیو" src={cms.video} className="w-full h-full border-0" allowFullScreen /></div> : null}
                        {cms.body ? <div className="text-sm leading-7 text-primary-700 text-white/80 prose prose-sm prose- max-w-none" dangerouslySetInnerHTML={{ __html: cms.body }} /> : null}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* حریم خصوصی */}
              {staticPage === 'privacy' && (
                <div className="w-full space-y-6 text-sm text-primary-700 text-white/80 leading-7">
                  <h1 className="text-xl sm:text-2xl font-bold text-primary-900 text-white">حریم خصوصی</h1>
                  {(() => {
                    const cms = getPageCms('privacy');
                    if (!cms || (!cms.body && !cms.image && !cms.video)) return null;
                    return (
                      <div className="space-y-3 p-4 rounded-2xl border border-primary-200 border-white/15 bg-white bg-primary-900">
                        {cms.image ? <img src={cms.image} alt="" className="w-full max-h-64 object-cover rounded-xl"  loading="lazy" decoding="async" /> : null}
                        {cms.video ? <div className="aspect-video rounded-xl overflow-hidden bg-primary-100 bg-primary-900"><iframe title="ویدیو" src={cms.video} className="w-full h-full border-0" allowFullScreen /></div> : null}
                        {cms.body ? <div className="text-sm leading-7 text-primary-700 text-white/80 prose prose-sm prose- max-w-none" dangerouslySetInnerHTML={{ __html: cms.body }} /> : null}
                      </div>
                    );
                  })()}

                  {(() => {
                    const cms = getPageCms('privacy');
                    if (cms && (cms.body || cms.image || cms.video)) return null;
                    return (
                      <p className="text-sm text-primary-500 text-white/55 py-10 text-center">
                        محتوای این صفحه به‌زودی تکمیل می‌شود.
                      </p>
                    );
                  })()}
                </div>
              )}

              {/* کوکی */}
              {staticPage === 'cookies' && (
                <div className="w-full space-y-4 text-sm text-primary-700 text-white/80 leading-7">
                  <h1 className="text-xl sm:text-2xl font-bold text-primary-900 text-white">سیاست کوکی</h1>
                  {(() => {
                    const cms = getPageCms('cookies');
                    if (!cms || (!cms.body && !cms.image && !cms.video)) return null;
                    return (
                      <div className="space-y-3 p-4 rounded-2xl border border-primary-200 border-white/15 bg-white bg-primary-900">
                        {cms.image ? <img src={cms.image} alt="" className="w-full max-h-64 object-cover rounded-xl"  loading="lazy" decoding="async" /> : null}
                        {cms.video ? <div className="aspect-video rounded-xl overflow-hidden bg-primary-100 bg-primary-900"><iframe title="ویدیو" src={cms.video} className="w-full h-full border-0" allowFullScreen /></div> : null}
                        {cms.body ? <div className="text-sm leading-7 text-primary-700 text-white/80 prose prose-sm prose- max-w-none" dangerouslySetInnerHTML={{ __html: cms.body }} /> : null}
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
                  <h1 className="text-xl sm:text-2xl font-bold text-primary-900 text-white">نقشه سایت</h1>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h2 className="font-bold mb-2 text-primary-900 text-white">خرید</h2>
                      <ul className="space-y-1.5">
                        <li><button type="button" onClick={() => openPLP()} className="text-apple-blue hover:underline">فروشگاه</button></li>
                        <li><button type="button" onClick={() => openSellersList()} className="text-apple-blue hover:underline">فروشندگان</button></li>
                        <li><button type="button" onClick={() => openStaticPage('brands')} className="text-apple-blue hover:underline">برندها</button></li>
                        <li><button type="button" onClick={() => openStaticPage('deals')} className="text-apple-blue hover:underline">شگفت‌انگیز</button></li>
                        <li><button type="button" onClick={() => openStaticPage('campaigns')} className="text-apple-blue hover:underline">کمپین‌ها</button></li>
                      </ul>
                    </div>
                    <div>
                      <h2 className="font-bold mb-2 text-primary-900 text-white">اطلاعات</h2>
                      <ul className="space-y-1.5">
                        {[['about','درباره ما'],['contact','تماس'],['faq','FAQ'],['size-guide','راهنمای سایز'],['terms','قوانین'],['returns','مرجوعی'],['privacy','حریم خصوصی'],['blog','مجله'],['become-seller','فروشنده شوید']].map(([id,l]) => (
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
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                      <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-primary-900 text-white">مجله</h1>
                        <p className="text-sm text-primary-500 text-[#13ABC4] !text-white mt-1">راهنمای خرید، استایل و مراقبت از پیراهن مردانه</p>
                      </div>
                      <div className="w-full sm:w-72">
                        <input
                          value={magQuery}
                          onChange={(e) => setMagQuery(e.target.value)}
                          placeholder="جستجو در مجله…"
                          className="w-full px-4 py-2.5 rounded-xl border border-primary-200 border-white/20 bg-white bg-primary-900 text-sm text-primary-900 text-white"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['همه', ...Array.from(new Set((blogPosts || []).map(p => p.cat || p.category).filter(Boolean)))].map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFaqQuery(cat === 'همه' ? '' : cat)}
                          className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition ${(!faqQuery && cat === 'همه') || faqQuery === cat ? 'bg-primary-800 text-white bg-primary-200 text-primary-900 shadow-md' : 'bg-white bg-primary-900 border border-primary-200 border-white/15 text-primary-600 text-white/70 hover:border-primary-400'}`}
                        >{cat}</button>
                      ))}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {magFiltered.slice(0, magVisible).map(p => (
                      <button key={p.id} type="button" onClick={() => openStaticPage('blog-post', { blogId: p.id, slug: p.slug || '' })} className="group text-right rounded-3xl border border-primary-100 border-white/10 bg-white bg-primary-900 overflow-hidden hover:shadow-xl hover:border-primary-300 transition flex flex-col">
                        <div className="aspect-[16/9] overflow-hidden bg-primary-100 bg-primary-900">
                          <img src={p.image || 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&h=450&fit=crop&q=80'} alt="" className="w-full h-full object-cover group-hover:opacity-95 transition duration-500" loading="lazy" />
                        </div>
                        <div className="p-4 sm:p-5 flex-1 flex flex-col">
                          {(p.cat || p.category) ? (
                            <span
                              role="link"
                              tabIndex={0}
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFaqQuery(p.cat || p.category); }}
                              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); setFaqQuery(p.cat || p.category); } }}
                              className="inline-flex self-start items-center h-6 px-2 rounded-md bg-primary-100 bg-primary-700 text-primary-900 text-white text-xs font-medium hover:bg-primary-200 hover:bg-primary-600 transition"
                            >{p.cat || p.category}</span>
                          ) : null}
                          <p className="font-bold text-sm sm:text-base text-primary-900 text-white mt-1.5 leading-snug line-clamp-2">{p.title}</p>
                          <p className="text-xs text-primary-500 text-[#13ABC4] !text-white mt-2 line-clamp-2 flex-1">{p.excerpt}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-primary-50 border-white/10 text-xs text-primary-400 text-[#13ABC4] !text-white">
                            {(p.cat || p.category) ? (
                              <>
                                <span
                                  role="link"
                                  tabIndex={0}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setFaqQuery(p.cat || p.category);
                                    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_) {}
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setFaqQuery(p.cat || p.category);
                                    }
                                  }}
                                  className="text-apple-blue text-[#13ABC4] hover:underline cursor-pointer font-medium"
                                >
                                  {p.cat || p.category}
                                </span>
                                {(p.date || p.read) ? <span className="!text-white">·</span> : null}
                              </>
                            ) : null}
                            {p.date ? <span className="!text-white">{p.date}</span> : null}
                            {p.date && p.read ? <span className="!text-white">·</span> : null}
                            {p.read ? <span className="!text-white">{p.read} مطالعه</span> : null}
                          </div>
                          {(p.tags || p.tag_names || []).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {(p.tags || p.tag_names || []).map(t => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setFaqQuery(t);
                                    try {
                                      const slug = String(t).trim().replace(/\s+/g, '_');
                                      window.history.pushState({}, '', '/مجله/برچسب/' + encodeURIComponent(slug));
                                    } catch (_) {}
                                  }}
                                  className="text-xs px-2 py-0.5 rounded-full bg-primary-50 bg-primary-900 text-primary-600 text-white/70 hover:bg-primary-100 hover:bg-primary-800"
                                >#{t}</button>
                              ))}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                    {magFiltered.length === 0 && (
                      <p className="col-span-full text-center text-sm text-primary-500 text-[#13ABC4] py-10">مطلبی با این فیلتر پیدا نشد.</p>
                    )}
                  </div>
                  {magVisible < magFiltered.length && (
                    <div ref={magSentinelRef} className="flex justify-center py-6">
                      <button
                        type="button"
                        onClick={() => setMagVisible((n) => n + 9)}
                        className="text-sm px-5 py-2 rounded-full border border-primary-200 border-white/20 text-primary-700 text-white hover:bg-primary-50 hover:bg-primary-800"
                      >
                        بارگذاری مطالب بیشتر
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* بلاگ تکی */}
              {staticPage === 'blog-post' && (() => {
                const isLive = (p) => p && (p.status === 'published' || (p.status === 'scheduled' && p.publishAtMs && Number(p.publishAtMs) <= Date.now()));
                const post = blogPosts.find(p => String(p.id) === String(blogPostId)) || blogPosts.find(isLive) || blogPosts[0];
                if (!post) return <p className="text-center text-sm text-primary-500">مطلبی یافت نشد</p>;
                const postCat = String(post.cat || post.category || '').trim().toLowerCase();
                const liveOthers = (Array.isArray(blogPosts) ? blogPosts : []).filter(
                  (bp) => bp && String(bp.id) !== String(post.id) && isLive(bp)
                );
                const sameCat = postCat
                  ? liveOthers.filter((bp) => String(bp.cat || bp.category || '').trim().toLowerCase() === postCat)
                  : [];
                const related = (sameCat.length ? sameCat : liveOthers).slice(0, 6);
                const isHtmlBody = /<[a-z][\s\S]*>/i.test(post.body || '');
                let headings = [];
                let bodyHtmlWithIds = post.body || '';
                if (isHtmlBody) {
                  let hi = 0;
                  bodyHtmlWithIds = String(post.body || '').replace(
                    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
                    (match, level, attrs, inner) => {
                      const plain = String(inner).replace(/<[^>]+>/g, '').trim();
                      const idMatch = attrs && attrs.match(/\sid=["']([^"']+)["']/i);
                      const id = (idMatch && idMatch[1]) ? idMatch[1] : ('heading-' + (++hi));
                      headings.push({ id, text: plain, level: Number(level) });
                      if (idMatch) return match;
                      return '<h' + level + attrs + ' id="' + id + '">' + inner + '</h' + level + '>';
                    }
                  );
                } else {
                  headings = (post.body || '').split('\n').filter((l) => l.startsWith('## ')).map((l, i) => ({
                    id: 'heading-' + (i + 1),
                    text: l.replace(/^##\s+/, '').trim(),
                    level: 2,
                  }));
                }
                const paragraphs = isHtmlBody ? [] : (post.body || '').split('\n\n');
                return (
                  <article className="w-full space-y-6">
                    <button type="button" onClick={() => openStaticPage('blog')} className="text-xs text-apple-blue hover:underline flex items-center gap-1"><Icon name="arrowRight" size={14} /> بازگشت به مجله</button>
                    <div className="rounded-3xl overflow-hidden aspect-[21/9] sm:aspect-[2.4/1] bg-primary-100 bg-primary-900 border border-primary-100 border-white/10">
                      <img src={post.image || 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=1200&h=500&fit=crop&q=80'} alt="" className="w-full h-full object-cover"  loading="lazy" decoding="async" />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-primary-900 text-white leading-snug">{post.title}</h1>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-primary-500 text-[#13ABC4] !text-white pb-4 border-b border-primary-100 border-white/10">
                      {(post.cat || post.category) ? (
                        <button
                          type="button"
                          onClick={() => { setFaqQuery(post.cat || post.category); openStaticPage('blog'); }}
                          className="inline-flex items-center h-6 px-2 rounded-md bg-primary-100 bg-primary-700 text-primary-900 text-white text-xs font-medium hover:bg-primary-200 hover:bg-primary-600 transition"
                        >{post.cat || post.category}</button>
                      ) : null}
                      {(post.cat || post.category) && post.date ? <span className="text-primary-300 text-white/40">·</span> : null}
                      {post.date ? <span className="!text-white">{post.date}</span> : null}
                      {post.date && (post.author || post.read) ? <span className="text-primary-300 text-white/40">·</span> : null}
                      {post.author ? <span className="font-medium text-primary-800 text-[#13ABC4] !text-white">{post.author}</span> : null}
                      {post.author && post.read ? <span className="text-primary-300 text-white/40">·</span> : null}
                      {post.read ? <span className="!text-white">{(() => {
                        const body = [post.title, post.excerpt, post.body].filter(Boolean).join(' ');
                        const text = String(body || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                        const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
                        const mins = Math.max(1, Math.ceil(words / 180));
                        return `${toFa(mins)} دقیقه مطالعه`;
                      })()}</span> : null}
                      {(post.tags || []).length > 0 && (
                        <span className="flex flex-wrap gap-1 w-full sm:w-auto sm:ms-1">
                          {(post.tags || post.tag_names || []).map(t => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => {
                                setFaqQuery(t);
                                openStaticPage('blog');
                                try {
                                  const slug = String(t).trim().replace(/\s+/g, '_');
                                  window.history.pushState({}, '', '/مجله/برچسب/' + encodeURIComponent(slug));
                                } catch (_) {}
                              }}
                              className="px-2 py-0.5 rounded-full bg-primary-50 bg-primary-900 text-primary-600 text-white/70 hover:bg-primary-100"
                            >#{t}</button>
                          ))}
                        </span>
                      )}
                    </div>
                    {headings.length > 0 && (
                      <nav className="p-4 rounded-2xl bg-primary-50 bg-primary-900/50 border border-primary-100 border-white/10" aria-label="فهرست مطالب">
                        <p className="text-xs font-bold text-primary-900 text-white mb-3">فهرست مطالب</p>
                        <ol className="list-none space-y-1.5 text-sm text-primary-700 text-white/80">
                          {headings.map((h, i) => (
                            <li key={h.id || i} className={h.level === 3 ? 'pr-4' : ''}>
                              <a
                                href={`#${h.id || ('toc-' + i)}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  try {
                                    const el = document.getElementById(h.id || ('toc-' + i));
                                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  } catch (_) {}
                                }}
                                className="hover:text-apple-blue hover:text-[#023047] transition flex items-start gap-2"
                              >
                                <span className="text-primary-400 text-white/40 tabular-nums shrink-0">{toFa(i + 1)}.</span>
                                <span>{h.text || h}</span>
                              </a>
                            </li>
                          ))}
                        </ol>
                      </nav>
                    )}
                    <div className="space-y-4">
                      {isHtmlBody ? (
                      <div className="text-sm text-primary-700 text-white/85 leading-8 simple-editor-surface [&_h2]:scroll-mt-24 [&_h3]:scroll-mt-24 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-primary-900 [&_h2]:text-white [&_h2]:pt-4 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-primary-900 [&_h3]:text-white [&_h3]:pt-3" dangerouslySetInnerHTML={{ __html: bodyHtmlWithIds }} />
                    ) : (
                      paragraphs.map((para, i) => {
                        if (para.startsWith('## ')) {
                          const h = para.replace(/^##\s+/, '');
                          const found = headings.find((x) => (x.text || x) === h);
                          const hid = found ? found.id : undefined;
                          return <h2 key={i} id={hid} className="text-lg font-bold text-primary-900 text-white pt-4 scroll-mt-24">{h}</h2>;
                        }
                        return <p key={i} className="text-sm sm:text-base text-primary-700 text-white/80 leading-8">{para}</p>;
                      })
                    )}
                    </div>
                    <div className="flex flex-wrap gap-2 pt-4">
                      <button type="button" onClick={() => openPLP()} className="px-5 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium">محصولات مرتبط</button>
                      <button type="button" onClick={() => { try { navigator.clipboard.writeText(window.location.href); pushLiveToast('لینک کپی شد', { type: 'info' }); } catch(_){} }} className="px-4 py-2.5 rounded-full border border-primary-200 border-white/20 text-sm text-primary-700 text-white">اشتراک‌گذاری</button>
                    </div>

                    {/* لایک مطلب */}
                    <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-primary-100 border-white/10">
                      <button
                        type="button"
                        onClick={() => toggleBlogLike(post.id)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition ${isBlogLiked(post.id) ? 'bg-[#023047] bg-[#13ABC4] !text-white border-[#023047] border-[#13ABC4]' : 'border-primary-200 border-white/30 text-primary-800 text-white hover:border-[#023047] border-[#13ABC4]'}`}
                      >
                        <Icon name={isBlogLiked(post.id) ? 'heartFilled' : 'heart'} size={16} />
                        {isBlogLiked(post.id) ? 'لایک شده' : 'لایک این مطلب'}
                      </button>
                      <span className="text-xs text-primary-500 text-white/60">در بخش علاقه‌مندی‌های حساب شما نمایش داده می‌شود</span>
                    </div>

                    {/* کامنت‌ها */}
                    <section className="rounded-2xl border border-primary-200 border-white/15 bg-white bg-primary-900 p-4 sm:p-5 space-y-4">
                      <h2 className="text-base font-bold text-primary-900 text-white">دیدگاه‌ها ({toFa((blogComments[post.id] || []).length)})</h2>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={blogCommentName}
                          onChange={(e) => setBlogCommentName(e.target.value)}
                          placeholder="نام (اختیاری)"
                          className="w-full px-3 py-2 rounded-xl border border-primary-200 border-white/20 bg-transparent text-sm text-primary-900 text-white"
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
                          <p className="text-sm text-primary-500 text-white/50 text-center py-4">هنوز دیدگاهی ثبت نشده — اولین نفر باشید</p>
                        ) : (
                          (blogComments[post.id] || []).map(c => (
                            <div key={c.id} className="p-3 rounded-xl bg-primary-50 bg-primary-900/40 border border-primary-100 border-white/10 text-right">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-xs font-bold text-primary-900 text-white">{c.name}</span>
                                <span className="text-xs text-primary-400 text-white/50">{c.date}</span>
                              </div>
                              <div className="text-sm text-primary-700 text-white/85 leading-relaxed simple-editor-surface" dangerouslySetInnerHTML={{ __html: c.html || c.text }} />
                            </div>
                          ))
                        )}
                      </div>
                    </section>

                    {renderShareBar({ title: post.title, text: post.title, url: typeof window !== 'undefined' ? window.location.href : '' })}

                    <div className="pt-8 border-t border-primary-100 border-white/10 space-y-4">
                      <div>
                        <p className="text-[11px] font-bold text-apple-blue text-[#13ABC4] mb-1">پیشنهاد مطالعه</p>
                        <h2 className="text-base sm:text-lg font-bold text-primary-900 text-white">
                          {postCat ? `مطالب بیشتر در «${post.cat || post.category}»` : 'شاید این مطالب را هم بپسندید'}
                        </h2>
                        <p className="text-xs text-primary-500 text-white/55 mt-1">مقالاتی از همان دسته‌بندی که ممکن است برایتان جالب باشد</p>
                      </div>
                      {related.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {related.map((r) => (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => openStaticPage('blog-post', { blogId: r.id, slug: r.slug || '' })}
                              className="text-right rounded-2xl border border-primary-100 border-white/10 bg-white bg-primary-900 overflow-hidden hover:border-apple-blue/40 transition group"
                            >
                              <div className="aspect-video bg-primary-100 bg-primary-900">
                                <img
                                  src={r.image || 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&h=225&fit=crop'}
                                  alt=""
                                  className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-300"
                                  loading="lazy"
                                />
                              </div>
                              <div className="p-3 space-y-1">
                                {(r.cat || r.category) ? (
                                  <span className="inline-block text-[10px] px-1.5 py-0.5 rounded-md bg-primary-100 bg-primary-800 text-primary-700 text-white/80">
                                    {r.cat || r.category}
                                  </span>
                                ) : null}
                                <p className="text-xs sm:text-sm font-bold text-primary-900 text-white line-clamp-2">{r.title}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 space-y-3">
                          <p className="text-sm text-primary-500 text-white/55">فعلاً مطلب مرتبط دیگری در این دسته نیست</p>
                          <button type="button" onClick={() => openStaticPage('blog')} className="text-sm text-apple-blue text-[#13ABC4] hover:underline">
                            مشاهده همه مقالات مجله
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })()}

              {/* برندها */}
              {staticPage === 'brands' && !brandDetailId && (
                <div className="space-y-8">
                  <div className="text-center sm:text-right space-y-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-primary-900 text-white">برندها</h1>
                    <p className="text-sm text-primary-500 text-[#13ABC4] !text-white">از برندهای تخصصی پیراهن مردانه انتخاب کنید</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    <input value={brandQuery} onChange={e => setBrandQuery(e.target.value)} placeholder="جستجوی برند..." className="flex-1 max-w-md px-4 py-3 rounded-2xl border border-primary-200 border-white/15 bg-white bg-primary-900 text-sm text-primary-900 text-white shadow-sm" />
                    {brandQuery && <button type="button" onClick={() => setBrandQuery('')} className="text-xs text-apple-blue">پاک کردن فیلتر</button>}
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start p-3 rounded-2xl bg-white bg-primary-950 border border-primary-200 border-white/15">
                    <button type="button" onClick={() => setBrandQuery('')} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${!brandQuery ? 'bg-apple-blue !text-white shadow-md' : 'bg-primary-100 bg-primary-700 text-primary-800 !text-white hover:bg-primary-200 hover:bg-primary-600 border border-primary-200/80 border-white/20'}`}>همه</button>
                    {'ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی'.split('').map(ch => (
                      <button key={ch} type="button" onClick={() => setBrandQuery(ch)} className={`min-w-[2rem] h-8 px-2 rounded-full text-xs font-semibold transition ${brandQuery === ch ? 'bg-apple-blue !text-white shadow-md' : 'bg-primary-100 bg-primary-700 text-primary-800 !text-white hover:bg-primary-200 hover:bg-primary-600 border border-primary-200/80 border-white/20'}`}>{ch}</button>
                    ))}
                  </div>
                  {(() => {
                    const pool = [
                      ...(Array.isArray(adminCatalogBrands) ? adminCatalogBrands : []),
                      ...(Array.isArray(brandsList) ? brandsList : []),
                      ...((typeof BRANDS_LIST !== 'undefined' && Array.isArray(BRANDS_LIST)) ? BRANDS_LIST : []),
                    ];
                    const seen = new Set();
                    const allBrands = pool.filter((b) => {
                      if (!b || !b.name) return false;
                      if (b.active === false || String(b.status || '') === 'archived') return false;
                      const key = String(b.id || b.slug || b.name).trim().toLowerCase();
                      if (seen.has(key)) return false;
                      seen.add(key);
                      return true;
                    });
                    const q = String(brandQuery || '').trim();
                    const filtered = allBrands.filter((b) => {
                      if (!q) return true;
                      const n = String(b.name || '');
                      return n.includes(q) || n[0] === q;
                    });
                    const productPool = (Array.isArray(catalogProducts) && catalogProducts.length)
                      ? catalogProducts
                      : (Array.isArray(products) ? products : []);
                    const countFor = (b) => {
                      if (typeof b.count === 'number') return b.count;
                      const name = String(b.name || '').trim().toLowerCase();
                      const id = String(b.id || '');
                      return productPool.filter((p) => {
                        if (!p) return false;
                        const pb = String(p.brand || p.brandName || p.brand_name || '').trim().toLowerCase();
                        const pid = String(p.brandId || p.brand_id || '');
                        if (id && pid && pid === id) return true;
                        if (name && pb && pb === name) return true;
                        return false;
                      }).length;
                    };
                    return (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          {filtered.map((b) => (
                            <button
                              key={b.id || b.slug || b.name}
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const id = b.id || b.slug || b.name;
                                try {
                                  if (typeof openBrand === 'function') {
                                    openBrand(b);
                                    return;
                                  }
                                } catch (_) {}
                                try {
                                  if (typeof setBrandDetailId === 'function') setBrandDetailId(id);
                                  if (typeof openStaticPage === 'function') openStaticPage('brands');
                                } catch (_) {
                                  try { setBrandDetailId(id); } catch (__) {}
                                }
                              }}
                              className="group relative z-[2] p-2 sm:p-2.5 rounded-2xl border border-primary-100 border-white/10 bg-white bg-primary-900 text-center hover:border-apple-blue/50 hover:shadow-lg transition overflow-hidden cursor-pointer touch-manipulation"
                            >
                              <div className="w-full aspect-square mx-auto mb-2 rounded-xl bg-primary-50 bg-primary-800 flex items-center justify-center text-2xl font-bold text-primary-900 text-[#13ABC4] !text-white border border-primary-100 border-white/15 overflow-hidden">
                                {(b.logoUrl || b.logo_url || b.image)
                                  ? <img src={b.logoUrl || b.logo_url || b.image} alt="" className="w-full h-full object-cover"  loading="lazy" decoding="async" />
                                  : (b.name?.[0] || 'ب')}
                              </div>
                              <p className="text-sm font-bold text-primary-900 text-white">{b.name}</p>
                              <p className="text-xs text-primary-500 text-[#13ABC4] !text-white mt-1">{toFa(countFor(b))} محصول</p>
                            </button>
                          ))}
                        </div>
                        {filtered.length === 0 && (
                          <p className="text-center text-sm text-primary-500 text-[#13ABC4] py-12">
                            {allBrands.length === 0 ? 'هنوز برندی تعریف نشده — از پنل ادمین اضافه کنید' : 'برندی با این فیلتر یافت نشد'}
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
              {staticPage === 'brands' && brandDetailId && (() => {
                const list = [
                  ...(Array.isArray(adminCatalogBrands) ? adminCatalogBrands : []),
                  ...(Array.isArray(brandsList) ? brandsList : []),
                  ...((typeof BRANDS_LIST !== 'undefined' && Array.isArray(BRANDS_LIST)) ? BRANDS_LIST : []),
                ];
                const b = list.find(x => String(x.id) === String(brandDetailId))
                  || list.find(x => String(x.slug || '') === String(brandDetailId) || String(x.name || '') === String(brandDetailId))
                  || (brandDetailId ? { id: brandDetailId, name: String(brandDetailId), slug: String(brandDetailId) } : null);
                if (!b) return null;
                const brandName = String(b.name || '').trim().toLowerCase();
                const brandId = String(b.id || '');
                const brandSlug = String(b.slug || '').trim().toLowerCase();
                const poolProducts = (Array.isArray(catalogProducts) && catalogProducts.length)
                  ? catalogProducts
                  : (Array.isArray(products) ? products : []);
                const brandProducts = poolProducts.filter((p) => {
                  if (!p) return false;
                  const pb = String(p.brand || p.brandName || p.brand_name || '').trim().toLowerCase();
                  const pid = String(p.brandId || p.brand_id || '');
                  if (brandId && pid && String(pid) === String(brandId)) return true;
                  if (brandName && pb && pb === brandName) return true;
                  if (brandSlug && pb && pb === brandSlug) return true;
                  if (brandName && pb && (pb.includes(brandName) || brandName.includes(pb))) return true;
                  return false;
                });
                return (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-primary-100 bg-primary-700 flex items-center justify-center text-2xl font-bold text-primary-800 text-[#13ABC4] !text-white border border-[#023047] border-[#13ABC4] border-white/25 shadow-sm overflow-hidden shrink-0">
                        {b.logoUrl || b.logo_url || b.image ? (
                          <img src={b.logoUrl || b.logo_url || b.image} alt="" className="w-full h-full object-cover"  loading="lazy" decoding="async" />
                        ) : (b.name?.[0] || 'ب')}
                      </div>
                      <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-primary-900 text-white">{b.name}</h1>
                        <p className="text-sm text-primary-500 text-[#13ABC4] !text-white mt-1">{b.desc || b.description || ('محصولات برند ' + b.name)}</p>
                        <p className="text-xs text-primary-400 text-[#13ABC4] !text-white mt-0.5">{toFa(brandProducts.length)} محصول</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 items-stretch">
                      {!brandProducts.length && (
                        <p className="col-span-full text-center text-sm text-primary-500 text-[#13ABC4] py-10">محصولی برای این برند ثبت نشده</p>
                      )}
                      {(brandProducts.length ? brandProducts : []).map((p) => (
                        typeof renderProductCard === 'function'
                          ? renderProductCard(p, 'brand-', { grid: true })
                          : (
                            <button key={p.id} type="button" onClick={() => { try { closeStaticPage(); } catch (_) {} try { setBrandDetailId(null); } catch (_) {} openPDP(p); }} className="text-right rounded-2xl border border-primary-200 border-white/15 bg-white bg-primary-900 overflow-hidden hover:border-apple-blue/40 transition w-full h-full">
                              <img src={p.colors?.[0]?.image || p.image} alt="" className="aspect-[4/5] w-full object-cover" loading="lazy" />
                              <div className="p-2.5">
                                <p className="text-sm sm:text-base font-medium text-primary-900 text-[#13ABC4] !text-white line-clamp-2">{p.name}</p>
                                <p className="text-xs font-bold mt-1">{p.priceText} ت</p>
                              </div>
                            </button>
                          )
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
                    <p className="text-center text-sm text-primary-500 text-[#13ABC4] py-10">کمپین فعالی نیست</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => openPLP()} className="px-4 py-2 rounded-full bg-apple-blue text-white text-xs font-medium">مشاهده محصولات کمپین</button>
                    <button type="button" onClick={() => { try { navigator.clipboard.writeText(window.location.href); showToast({ message: 'لینک کپی شد', variant: 'default', duration: 4500, position: 'top-center' }); } catch(_){} }} className="px-4 py-2 rounded-full border border-primary-200 border-white/20 text-xs">اشتراک‌گذاری</button>
                  </div>
                  {others.length > 0 && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {others.map(c => (
                      <div key={c.id} className="p-5 rounded-2xl border border-primary-200 border-white/15 bg-white bg-primary-900">
                        <h2 className="font-bold text-lg text-primary-900 text-white">{c.title}</h2>
                        <p className="text-sm text-primary-600 text-white/70 mt-1">{c.desc}</p>
                        <p className="text-xs text-primary-400 text-[#13ABC4] mt-2">{c.active ? 'فعال' : 'به‌زودی / غیرفعال'}</p>
                      </div>
                    ))}
                  </div>
                  )}
                </div>
                );
              })()}

              {/* شگفت‌انگیز / تخفیف‌ها */}
              {staticPage === 'deals' && (() => {
                // فیلترهای درصد حذف شد — بعداً از ریشه بازطراحی می‌شود
                let list = (Array.isArray(catalogProducts) ? catalogProducts : []).filter(p => isDealActive(p));
                if (dealsSort === 'discount') list = [...list].sort((a,b) => (b.discount||0)-(a.discount||0));
                else if (dealsSort === 'cheap') list = [...list].sort((a,b) => (a.price||0)-(b.price||0));
                else if (dealsSort === 'new') list = [...list].reverse();
                return (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-primary-900 text-white">پیشنهادات شگفت‌انگیز</h1>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
                    {list.slice(0, 24).map(p => (
                      <button key={p.id} type="button" onClick={() => { closeStaticPage(); openPDP(p); }} className="text-right rounded-2xl border border-primary-200 border-white/15 bg-white bg-primary-900 overflow-hidden hover:border-apple-blue/40 transition">
                        <div className="relative aspect-[4/5] bg-primary-50 bg-primary-900">
                          <img src={p.colors?.[0]?.image || p.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                          {p.discount > 0 && <span className="absolute top-2 right-2 bg-apple-blue text-white text-xs font-bold px-1.5 py-0.5 rounded text-right">{toFa(p.discount)}٪</span>}
                          {(p.stock === 0 || p.available === false) && <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-bold">ناموجود</span>}
                        </div>
                        <div className="p-2.5">
                          <p className="text-sm sm:text-base font-medium text-primary-900 text-[#13ABC4] !text-white line-clamp-2">{p.name}</p>
                          <p className="text-xs font-bold mt-1 text-primary-800 text-white">{p.priceText} ت</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  {list.length === 0 && (
                    <p className="text-center text-sm text-primary-500 text-[#13ABC4] py-12">فعلاً پیشنهاد شگفت‌انگیزی نیست</p>
                  )}
                </div>
                );
              })()}

              {/* ۴۰۴ */}
              {staticPage === 'error-404' && (
                <div className="relative overflow-hidden rounded-3xl border border-primary-200 border-white/15 bg-white bg-primary-900 px-4 sm:px-8 py-14 sm:py-16 text-center max-w-2xl mx-auto shadow-sm">
                  <div className="pointer-events-none absolute inset-0 opacity-[0.07] opacity-[0.12]" aria-hidden>
                    <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-[#023047] hover:bg-[#012536] hover:bg-white/10 border border-[#023047] border-[#13ABC4] border-white/25 bg-[#13ABC4] blur-3xl" />
                    <div className="absolute -bottom-20 -right-10 w-64 h-64 rounded-full bg-[#012536] bg-[#3161A3] blur-3xl" />
                  </div>
                  <div className="relative z-10 space-y-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary-200 border-white/20 bg-primary-50 bg-primary-950 text-xs font-medium text-primary-600 text-[#7EFAFF]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#023047] hover:bg-[#012536] hover:bg-white/10 border border-[#023047] border-[#13ABC4] border-white/25 bg-[#13ABC4]" />
                      خطا · صفحه موجود نیست
                    </div>
                    <p className="text-7xl sm:text-8xl font-black leading-none tracking-tight text-[#023047] text-[#13ABC4] select-none">۴۰۴</p>
                    <div className="space-y-2">
                      <h1 className="text-xl sm:text-2xl font-bold text-primary-900 text-[#EBFFFB]">صفحه پیدا نشد</h1>
                      <p className="text-sm text-primary-500 text-white/65 max-w-md mx-auto leading-relaxed">
                        آدرس واردشده اشتباه است یا این صفحه حذف شده. می‌توانید جستجو کنید یا به بخش دیگری بروید.
                      </p>
                    </div>
                    <div className="max-w-sm mx-auto">
                      <input
                        type="search"
                        placeholder="جستجوی محصول، برند یا دسته..."
                        className="w-full px-4 py-3 rounded-2xl border border-primary-200 border-white/20 bg-primary-50 bg-primary-950 text-sm text-primary-900 text-white placeholder:text-primary-400 placeholder:text-white/40 outline-none focus:border-[#023047] focus:border-[#023047] transition"
                        onKeyDown={(e) => { if (e.key === 'Enter') { setSearchQuery(e.target.value); openPLP(); } }}
                      />
                    </div>
                    <div className="flex flex-wrap justify-center gap-2.5 pt-1">
                      <button type="button" onClick={() => { closeStaticPage(); window.scrollTo({ top: 0 }); }} className="px-6 py-2.5 rounded-full bg-transparent border border-[#023047] border-[#13ABC4] border-white/25 bg-[#13ABC4] text-primary-900 text-white text-sm font-semibold hover:bg-[#012536] hover:bg-[#3161A3] transition shadow-md">خانه</button>
                      <button type="button" onClick={() => openPLP()} className="px-5 py-2.5 rounded-full border border-[#023047] border-[#13ABC4] border-white/25 bg-white bg-primary-950 text-sm font-medium text-primary-900 text-white hover:border-[#023047] hover:border-[#7EFAFF] transition">فروشگاه</button>
                      <button type="button" onClick={() => openStaticPage('deals')} className="px-5 py-2.5 rounded-full border border-[#023047] border-[#13ABC4] border-white/25 bg-white bg-primary-950 text-sm font-medium text-primary-900 text-white hover:border-[#023047] hover:border-[#7EFAFF] transition">شگفت‌انگیز</button>
                    </div>
                  </div>
                </div>
              )}

              {/* ۵۰۰ */}
              {staticPage === 'error-500' && (
                <div className="text-center py-16 space-y-4 max-w-md mx-auto">
                  <p className="text-6xl font-bold text-primary-200 text-primary-700">۵۰۰</p>
                  <h1 className="text-xl sm:text-2xl font-bold text-primary-900 text-white">خطایی رخ داد</h1>
                  <p className="text-sm text-primary-500">موقتاً مشکلی پیش آمده. چند لحظه دیگر دوباره تلاش کنید.</p>
                  <button type="button" onClick={() => window.location.reload()} className="px-5 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium">تلاش مجدد</button>
                </div>
              )}

              {/* تعمیرات */}
              {staticPage === 'maintenance' && (
                <div className="text-center py-16 space-y-4 max-w-md mx-auto">
                  <Icon name="settings" size={40} className="mx-auto text-primary-400" />
                  <h1 className="text-xl sm:text-2xl font-bold text-primary-900 text-white">سایت در حال به‌روزرسانی است</h1>
                  <p className="text-sm text-primary-500">به‌زودی برمی‌گردیم. از شکیبایی شما سپاسگزاریم.</p>
</div>
              )}
            </div>
          )}

          {/* بنر رضایت کوکی — ۱۰٪ بالاتر از پایین؛ در صفحه اصلی پس از پایان هیرو */}
          {!cookieConsent && (headerRevealedAfterHero || activeSellerId || showSellersList || showPLP || showTaxonomyHub || pdpProduct || showCartPage || showCheckout || showWishlistPage || showRecentPage || showComparePage || showProfilePage || showSellerPanel || showAdminPanel || staticPage) && (
            <div className="fixed bottom-[10vh] inset-x-0 z-[150] p-3 sm:p-4 pointer-events-none">
              <div className="max-w-3xl mx-auto pointer-events-auto rounded-2xl bg-white bg-primary-900 border border-[#023047] border-[#13ABC4] p-4 sm:p-5 flex flex-col sm:flex-row gap-3 sm:items-center">
                <p className="flex-1 text-xs sm:text-sm text-primary-700 text-white/80 leading-6">
                  برای بهبود تجربه از کوکی‌های ضروری استفاده می‌کنیم. جزئیات در{' '}
                  <button type="button" onClick={() => openStaticPage('cookies')} className="text-apple-blue text-[#13ABC4] underline">سیاست کوکی</button>.
                </p>
                <div className="flex gap-2 flex-shrink-0">
                  <button type="button" onClick={() => { setCookieConsent('essential'); try { localStorage.setItem('cookieConsent', 'essential'); } catch (_) {} }} className="px-3 py-2 rounded-full border border-primary-200 border-white/20 text-xs font-medium text-primary-700 text-white">فقط ضروری</button>
                  <button type="button" onClick={() => { setCookieConsent('all'); try { localStorage.setItem('cookieConsent', 'all'); } catch (_) {} }} className="px-4 py-2 rounded-full bg-apple-blue text-white text-xs font-bold">پذیرش همه</button>
                </div>
              </div>
            </div>
          )}

          {/* Footer — در تمام صفحات بدون استثنا */}

          <ModemAnimatedFooter
            dark={!!dark}
            brandName="پیراهن مردانه"
            brandDescription={"فروشگاه اینترنتی تخصصی پیراهن مردانه — ارسال به سراسر\u00A0ایران"}
            yearText="۱۴۰۵"
            navLinks={[
              { label: 'پیگیری سفارش', action: 'track' },
              { label: 'سوالات متداول', action: 'faq' },
              { label: 'راهنمای سایز', action: 'size-guide' },
              { label: 'بازگشت کالا', action: 'returns' },
              { label: 'حریم خصوصی', action: 'privacy' },
              { label: 'قوانین و شرایط', action: 'terms' },
              { label: 'بلاگ', action: 'blog' },
              { label: 'نقشه سایت', action: 'sitemap' },
              { label: 'فروشنده شوید', action: 'become-seller' },
            ]}
            onNavClick={(link) => {
              try {
                const a = link && link.action;
                if (a === 'track') { try { setPublicTrackOpen?.(true); } catch (_) {} return; }
                if (a === 'faq') { try { openStaticPage('faq'); } catch (_) {} return; }
                if (a === 'size-guide') { try { openStaticPage('size-guide'); } catch (_) {} return; }
                if (a === 'returns') { try { openStaticPage('returns'); } catch (_) {} return; }
                if (a === 'privacy') { try { openStaticPage('privacy'); } catch (_) {} return; }
                if (a === 'terms') { try { openStaticPage('terms'); } catch (_) {} return; }
                if (a === 'blog') { try { openStaticPage('blog'); } catch (_) {} return; }
                if (a === 'sitemap') { try { openStaticPage('sitemap'); } catch (_) {} return; }
                if (a === 'become-seller') { try { openStaticPage('become-seller'); } catch (_) {} return; }
                if (link && link.href && link.href !== '#') {
                  try { window.location.assign(link.href); } catch (_) {}
                }
              } catch (_) {}
            }}
          />
          {/* نگه داشتن نماد اعتماد زیر فوتر جدید */}
          <div className="bg-primary-50 bg-primary-950 pb-6 flex justify-center">
            <EnamadFooterBadge />
          </div>


          {/* Mobile Mega Menu — مدرن، تمام‌صفحه */}
          {mobileMenuOpen && (
            <div role="dialog" aria-modal="true" aria-label="منوی اصلی" className="mobile-menu-panel fixed inset-0 z-[9999] h-[100dvh] max-h-[100dvh] w-full max-w-[100vw] bg-primary-50 bg-primary-950 flex flex-col overflow-hidden isolate" style={{ top: 0, left: 0, right: 0, bottom: 0, position: 'fixed', width: '100%', overflowX: 'hidden' }}>
              {/* Header */}
              <div className="flex items-center justify-between gap-3 px-4 py-3.5 bg-white bg-primary-900 border-b border-primary-100 border-white/10 flex-shrink-0 relative z-10 w-full max-w-full overflow-hidden">
                <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
                  {(() => {
                    const logged = !!(user || sellerUser);
                    if (!logged) {
                      return (
                        <img
                          src={dark ? "/logo-white.webp" : "/Pirrahanmardane-logo-T.webp"}
                          alt="پیراهن مردانه"
                          className="site-logo-img h-8 w-auto max-w-[140px] object-contain flex-shrink-0"
                          onError={(e) => {
                            try {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = dark ? "/blue_t_bg.webp" : "/Pirrahanmardane-logo-T.webp";
                            } catch (_) {}
                          }}
                        />
                      );
                    }
                    const isSeller = !!sellerUser;
                    const displayName = isSeller
                      ? (sellerUser.shopName || sellerUser.name || sellerUser.ownerName || sellerUser.phone || 'فروشنده')
                      : (user.firstName || user.name || user.lastName || user.phone || 'کاربر');
                    const avatarSrc = isSeller
                      ? (sellerUser.logo || sellerUser.logoUrl || sellerUser.logo_url || sellerUser.avatar || sellerUser.avatarUrl || sellerUser.avatar_url || sellerUser.photo || '')
                      : (user.avatar || user.avatarUrl || user.avatar_url || user.photo || user.photoUrl || user.image || user.profileImage || '');
                    const roleLabel = isSeller ? 'فروشنده' : 'خریدار';
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          try {
                            if (isSeller) openSellerPanel();
                            else openProfilePage();
                          } catch (_) {}
                        }}
                        className="flex items-center gap-2.5 min-w-0 text-right"
                        aria-label={displayName}
                      >
                        <Avatar name={displayName} src={avatarSrc} size={40} className="flex-shrink-0 border border-primary-100 border-white/15" />
                        <span className="min-w-0 flex flex-col items-start">
                          <span className="text-sm font-bold text-[#023047] text-[#023047] truncate max-w-[11rem]">{displayName}</span>
                          <span className="text-[11px] text-[#023047] text-[#023047]">{roleLabel}</span>
                        </span>
                      </button>
                    );
                  })()}
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-primary-100 bg-primary-800 text-[#023047] text-[#023047] active:scale-95 transition"
                  aria-label="بستن منو"
                >
                  <Icon name="x" size={20} />
                </button>
              </div>

              {/* میانبرهای آیکونی — بالاترین بخش مگامنو */}
              <div className="flex-shrink-0 px-3.5 pt-3 pb-2 bg-primary-50 bg-primary-950 border-b border-primary-100 border-white/10">
                <div className="flex items-center justify-center gap-2 sm:gap-3 px-1 py-1">

                  <button
                    type="button"
                    onClick={() => { setMobileMenuOpen(false); setNotifPanelOpen(true); setCartOpen(false); setWishlistOpen(false); setCompareOpen(false); setRecentOpen(false); }}
                    className="header-icon-btn relative w-11 h-11 flex items-center justify-center rounded-full text-[#023047] text-[#023047] bg-white bg-primary-900 border border-primary-100 border-white/10 shadow-sm active:scale-95 transition"
                    title="اعلان‌ها"
                    aria-label="اعلان‌ها"
                  >
                    <Icon name="bell" size={18} />
                    {unreadNotifCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-[#023047] hover:bg-[#012536] hover:bg-white/10 border border-[#023047] border-[#13ABC4] border-white/25 text-[#023047] text-[#023047] text-xs font-bold flex items-center justify-center">{toFa(unreadNotifCount > 9 ? '9+' : unreadNotifCount)}</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={toggleDarkMode}
                    className="header-icon-btn w-11 h-11 flex items-center justify-center rounded-full text-[#023047] text-[#023047] bg-white bg-primary-900 border border-primary-100 border-white/10 shadow-sm active:scale-95 transition"
                    title={dark ? 'حالت روشن' : 'حالت تاریک'}
                    aria-label={dark ? 'حالت روشن' : 'حالت تاریک'}
                  >
                    <Icon name={dark ? 'sun' : 'moon'} size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMobileMenuOpen(false); openCartPage(); }}
                    className="header-icon-btn relative w-11 h-11 flex items-center justify-center rounded-full text-[#023047] text-[#023047] bg-white bg-primary-900 border border-primary-100 border-white/10 shadow-sm active:scale-95 transition"
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
                    className="header-icon-btn relative w-11 h-11 flex items-center justify-center rounded-full text-[#023047] text-[#023047] bg-white bg-primary-900 border border-primary-100 border-white/10 shadow-sm active:scale-95 transition"
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
                    className="header-icon-btn relative w-11 h-11 flex items-center justify-center rounded-full text-[#023047] text-[#023047] bg-white bg-primary-900 border border-primary-100 border-white/10 shadow-sm active:scale-95 transition"
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
                    className="header-icon-btn relative w-11 h-11 flex items-center justify-center rounded-full text-[#023047] text-[#023047] bg-white bg-primary-900 border border-primary-100 border-white/10 shadow-sm active:scale-95 transition"
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
              <div className="flex-shrink-0 px-3.5 py-2 border-b border-primary-100 border-white/10 sm:hidden">
                <button
                  type="button"
                  onClick={() => { try { setMobileMenuOpen(false); setPublicTrackOpen(true); } catch (_) {} }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white bg-primary-900 border border-primary-100 border-white/10 text-[#023047] text-[#023047]"
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
                    className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-white bg-primary-900 border border-primary-100 border-white/10 shadow-sm text-right active:scale-[0.99] transition"
                  >
                    <span className="w-11 h-11 rounded-full bg-apple-blue flex items-center justify-center flex-shrink-0 text-white">
                      <Icon name="user" size={20} className="!text-white" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-[#023047] text-[#023047] truncate">
                        {user.firstName ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}` : 'حساب کاربری'}
                      </span>
                      <span className="block text-xs text-[#023047] text-[#023047] mt-0.5">مشاهده حساب و سفارش‌ها</span>
                    </span>
                    {unreadNotifCount > 0 && (
                      <span className="text-xs font-bold bg-apple-blue text-white min-w-[1.35rem] h-5 px-1.5 rounded-full flex items-center justify-center">{toFa(unreadNotifCount)}</span>
                    )}
                    <Icon name="chevronLeft" size={16} className="text-[#023047] text-[#023047] flex-shrink-0" />
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { setMobileMenuOpen(false); openAuth(); }}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white bg-primary-900 border border-primary-100 border-white/10 shadow-sm active:scale-[0.99] transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#023047] text-[#023047]" aria-hidden="true"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                      <span className="text-xs font-bold text-[#023047] text-[#023047] whitespace-nowrap shrink-0">ورود خریدار</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMobileMenuOpen(false); openSellerAuth(); }}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white bg-primary-900 border border-primary-100 border-white/10 shadow-sm active:scale-[0.99] transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#023047] text-[#023047]" aria-hidden="true"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2 2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/></svg>
                      <span className="text-xs font-bold text-[#023047] text-[#023047] whitespace-nowrap shrink-0 header-auth min-w-0 max-w-full overflow-hidden">ورود فروشنده</span>
                    </button>
                  </div>

                )}

                {/* لینک‌های اصلی */}
                <div className="rounded-2xl bg-white bg-primary-900 border border-primary-100 border-white/10 shadow-sm overflow-hidden divide-y divide-primary-50 divide-white/5">
                  {[
                    { label: 'خانه', icon: 'home', onClick: () => { setMobileMenuOpen(false); setPdpProduct(null); setActiveSellerId(null); setShowSellersList(false); setShowCartPage(false); setShowCheckout(false); setShowWishlistPage(false); setShowComparePage(false); setShowProfilePage(false); setShowSellerPanel(false); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
                    { label: 'فروشگاه', icon: 'package', onClick: () => { setMobileMenuOpen(false); openPLP(); } },
                    { label: 'فروشندگان', icon: 'users', onClick: () => openSellersList() },
                    { label: 'شگفت‌انگیز', icon: 'gift', onClick: () => { setMobileMenuOpen(false); openStaticPage('deals'); } },
                    { label: 'پرفروش‌ترین‌ها', icon: 'star', onClick: () => { setMobileMenuOpen(false); openPLP({ sort: 'popular' }); } },
                    { label: 'جدیدترین‌ها', icon: 'sparkles', onClick: () => { setMobileMenuOpen(false); openPLP({ sort: 'newest' }); } },
                    { label: 'برندها', icon: 'package', onClick: () => { setMobileMenuOpen(false); openStaticPage('brands'); } },
                    { label: 'شرایط بازگشت', icon: 'package', onClick: () => { setMobileMenuOpen(false); openStaticPage('returns'); } },
                    { label: 'بلاگ', icon: 'package', onClick: () => { setMobileMenuOpen(false); openStaticPage('blog'); } },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.onClick}
                      className="w-full flex items-center gap-3 px-3.5 py-3 text-right active:bg-primary-50 active:bg-primary-800 transition"
                    >
                      <span className="w-9 h-9 rounded-xl bg-primary-50 bg-primary-800 text-[#023047] text-[#023047] flex items-center justify-center flex-shrink-0">
                        <Icon name={item.icon} size={16} />
                      </span>
                      <span className="flex-1 text-sm font-medium text-[#023047] text-[#023047]">{item.label}</span>
                      {item.badge > 0 && (
                        <span className="text-xs font-bold bg-apple-blue text-white min-w-[1.25rem] h-[1.25rem] px-1 rounded-full flex items-center justify-center">{toFa(item.badge)}</span>
                      )}
                      <Icon name="chevronLeft" size={14} className="text-[#023047] text-[#023047]" />
                    </button>
                  ))}
                </div>

                {/* دسته‌بندی‌ها */}
                <div>
                  <h4 className="text-xs font-bold text-[#023047] text-[#023047] mb-2.5 px-1 tracking-wide">دسته‌بندی‌ها</h4>
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
                        className="flex items-center gap-2.5 p-3 rounded-2xl bg-white bg-primary-900 border border-primary-100 border-white/10 shadow-sm active:scale-[0.98] transition text-right"
                      >
                        <span className="w-10 h-10 rounded-xl bg-primary-50 bg-primary-800 text-[#023047] text-[#023047] flex items-center justify-center flex-shrink-0">
                          <Icon name={cat.icon} size={18} />
                        </span>
                        <span className="text-xs font-semibold text-[#023047] text-[#023047] leading-snug">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* پرفروش‌ترین‌ها */}
                <div>
                  <h4 className="text-xs font-bold text-[#023047] text-[#023047] mb-2.5 px-1 tracking-wide">پرفروش‌ترین‌ها</h4>
                  <div className="space-y-2">
                    {products.slice(0, 3).map((p) => {
                      const col = (p.colors && p.colors[0]) || { name: '', image: p.image || p.cover_image || '/logo.webp' };
                      return (
                        <button key={p.id} type="button" onClick={() => { setMobileMenuOpen(false); openPDP(p); }} className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-white bg-primary-900 border border-primary-100 border-white/10 shadow-sm active:scale-[0.99] transition text-right">
                          <img src={col.image} alt={p.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" loading="lazy" decoding="async" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-[#023047] text-[#023047] line-clamp-2" title={p.name}>{p.name}</p>
                            <p className="text-xs font-bold text-apple-blue text-[#13ABC4] mt-0.5">{p.priceText} تومان</p>
                          </div>
                          <Icon name="chevronLeft" size={14} className="text-[#023047] text-[#023047] flex-shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* لینک‌های ثانویه */}
                <div className="rounded-2xl bg-white bg-primary-900 border border-primary-100 border-white/10 shadow-sm overflow-hidden divide-y divide-primary-50 divide-white/5">
                  <button type="button" onClick={() => { setMobileMenuOpen(false); openStaticPage('contact'); }} className="w-full flex items-center gap-3 px-3.5 py-3 text-right active:bg-primary-50 active:bg-primary-800 transition">
                    <span className="w-9 h-9 rounded-xl bg-primary-50 bg-primary-800 text-[#023047] text-[#023047] flex items-center justify-center flex-shrink-0">
                      <Icon name="phone" size={16} />
                    </span>
                    <span className="flex-1 text-sm font-medium text-[#023047] text-[#023047]">تماس با ما</span>
                    <Icon name="chevronLeft" size={14} className="text-[#023047] text-[#023047]" />
                  </button>
                  <button type="button" onClick={() => { setMobileMenuOpen(false); openStaticPage('about'); }} className="w-full flex items-center gap-3 px-3.5 py-3 text-right active:bg-primary-50 active:bg-primary-800 transition">
                    <span className="w-9 h-9 rounded-xl bg-primary-50 bg-primary-800 text-[#023047] text-[#023047] flex items-center justify-center flex-shrink-0">
                      <Icon name="alertCircle" size={16} />
                    </span>
                    <span className="flex-1 text-sm font-medium text-[#023047] text-[#023047]">درباره ما</span>
                    <Icon name="chevronLeft" size={14} className="text-[#023047] text-[#023047]" />
                  </button>
                  <button type="button" onClick={() => { setMobileMenuOpen(false); openStaticPage('faq'); }} className="w-full flex items-center gap-3 px-3.5 py-3 text-right active:bg-primary-50 active:bg-primary-800 transition">
                    <span className="w-9 h-9 rounded-xl bg-primary-50 bg-primary-800 text-[#023047] text-[#023047] flex items-center justify-center flex-shrink-0">
                      <Icon name="alertCircle" size={16} />
                    </span>
                    <span className="flex-1 text-sm font-medium text-[#023047] text-[#023047]">سوالات متداول</span>
                    <Icon name="chevronLeft" size={14} className="text-[#023047] text-[#023047]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMobileMenuOpen(false); if (sellerUser) openSellerPanel(); else openSellerAuth(); }}
                    className="w-full flex items-center gap-3 px-3.5 py-3 text-right active:bg-primary-50 active:bg-primary-800 transition"
                  >
                    <span className="w-9 h-9 rounded-xl bg-emerald-50 bg-emerald-900/30 text-emerald-600 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <Icon name="sell" size={16} />
                    </span>
                    <span className="flex-1 text-sm font-medium text-[#023047] text-[#023047] whitespace-nowrap shrink-0">{sellerUser ? 'پنل فروشنده' : 'فروشنده شوید'}</span>
                    {sellerUser && sellerUnreadTickets > 0 && (
                      <span className="text-xs font-bold bg-apple-blue text-white min-w-[1.25rem] h-[1.25rem] px-1 rounded-full flex items-center justify-center">{toFa(sellerUnreadTickets)}</span>
                    )}
                    <Icon name="chevronLeft" size={14} className="text-[#023047] text-[#023047]" />
                  </button>
                  <button type="button" onClick={() => { setMobileMenuOpen(false); openStaticPage('privacy'); }} className="w-full flex items-center gap-3 px-3.5 py-3 text-right active:bg-primary-50 active:bg-primary-800 transition">
                    <span className="w-9 h-9 rounded-xl bg-primary-50 bg-primary-800 text-[#023047] text-[#023047] flex items-center justify-center flex-shrink-0">
                      <Icon name="shield" size={16} />
                    </span>
                    <span className="flex-1 text-sm font-medium text-[#023047] text-[#023047]">حریم خصوصی</span>
                    <Icon name="chevronLeft" size={14} className="text-[#023047] text-[#023047]" />
                  </button>
                  <button type="button" onClick={() => { setMobileMenuOpen(false); openStaticPage('sitemap'); }} className="w-full flex items-center gap-3 px-3.5 py-3 text-right active:bg-primary-50 active:bg-primary-800 transition">
                    <span className="w-9 h-9 rounded-xl bg-primary-50 bg-primary-800 text-[#023047] text-[#023047] flex items-center justify-center flex-shrink-0">
                      <Icon name="grid" size={16} />
                    </span>
                    <span className="flex-1 text-sm font-medium text-[#023047] text-[#023047]">نقشه سایت</span>
                    <Icon name="chevronLeft" size={14} className="text-[#023047] text-[#023047]" />
                  </button>
                </div>

                {/* بنر تخفیف */}
                <button type="button" onClick={() => { setMobileMenuOpen(false); try { openStaticPage('deals'); } catch (_) { openPLP(); } }} className="w-full block rounded-2xl overflow-hidden relative h-28 text-right shadow-sm isolate ring-1 ring-black/5 ring-white/10">
                  <img
                    src={(() => { try { const c = typeof getPageCms === 'function' ? getPageCms('deals') : null; return (c && (c.image || c.banner || c.cover)) || 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&h=300&fit=crop&q=80&fm=webp'; } catch (_) { return 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&h=300&fit=crop&q=80&fm=webp'; } })()}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                    loading="lazy"
                    decoding="async"
                  />
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
                  className="quick-add-popup max-h-[90dvh] overflow-y-auto bg-white bg-black rounded-2xl shadow-2xl border border-primary-200 border-white/80"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-primary-200 border-white/40 bg-white bg-primary-900 rounded-t-2xl">
                    <h3 className="text-base font-bold text-primary-900 text-white line-clamp-2" title={p.name}>{p.name}</h3>
                    <button type="button" onClick={() => setQuickAdd(null)} className="w-9 h-9 flex items-center justify-center rounded-full bg-primary-100 bg-primary-800 text-primary-700 text-white">
                      <Icon name="x" size={18} />
                    </button>
                  </div>
                  <div className="p-4 space-y-4">
                    {/* Mobile: stacked (unchanged) */}
                    <div className="sm:hidden space-y-3">
                      <div
                        className={`rounded-xl overflow-hidden bg-primary-50 bg-primary-800 mx-auto w-full aspect-[4/5] cursor-zoom-in max-w-full`}
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
                              className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition ${quickGalleryIdx === i ? 'border-primary-800 border-white' : 'border-primary-200 border-white/50'}`}
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
                        className={`rounded-xl overflow-hidden bg-primary-50 bg-primary-800 aspect-[16/15] cursor-zoom-in flex-1 max-w-[23.4rem] max-h-[22rem] ${imgZoom ? 'max-w-none max-h-none' : ''}`}
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
                              className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition flex-shrink-0 ${quickGalleryIdx === i ? 'border-primary-800 border-white' : 'border-primary-200 border-white/50'}`}
                            >
                              <img src={c.image} alt={c.name} className="w-full h-full object-cover" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary-400 text-white mb-2">رنگ</p>
                      <div className="flex flex-wrap gap-2">
                        {gallery.map((c, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => { setQuickColorIdx(i); setQuickGalleryIdx(i); }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition text-primary-900 text-white ${quickColorIdx === i ? 'border-primary-800 border-white bg-primary-50 bg-primary-800' : 'border-primary-200 border-white/50'}`}
                          >
                            <span className="color-swatch w-4 h-4 rounded-full border border-primary-300 border-white/60" style={{ ["--swatch-color"]: c.hex || '#888', backgroundColor: c.hex || '#888' }} />
                            {c.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary-400 text-white mb-2">سایز</p>
                      <div className="flex flex-wrap gap-2">
                        {(p.sizes || allSizes).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setQuickSize(s)}
                            className={`latin-label size-chip min-w-[2.75rem] px-3 py-2 rounded-lg border text-xs font-semibold transition ${quickSize === s ? 'size-chip--active bg-primary-800 !text-white border-primary-800 bg-[#13ABC4] !text-white border-[#13ABC4]' : 'border-primary-200 border-white/50 !text-primary-900 !text-white bg-transparent'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary-400 text-white mb-2">تعداد</p>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => setQuickQty(q => Math.max(1, q - 1))} className="w-9 h-9 rounded-full border border-primary-200 border-[#13ABC4] flex items-center justify-center text-primary-900 text-white">
                          <Icon name="minus" size={16} />
                        </button>
                        <span className="text-base font-medium w-8 text-center tabular-nums text-primary-900 text-white">{toFa(quickQty)}</span>
                        <button type="button" onClick={() => setQuickQty(q => q + 1)} className="w-9 h-9 rounded-full border border-primary-200 border-[#13ABC4] flex items-center justify-center text-primary-900 text-white">
                          <Icon name="plus" size={16} />
                        </button>
                      </div>
                    </div>
                    {/* Collapsible short description — closed by default */}
                    <div className="border border-primary-200 border-white/30 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setQuickDescOpen(v => !v)}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-primary-900 text-white bg-primary-50 bg-primary-900"
                      >
                        <span>توضیح کوتاه</span>
                        <Icon name="chevronDown" size={16} className={`transition-transform ${quickDescOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {quickDescOpen && (
                        <p className="px-3 py-3 text-sm text-primary-600 text-white leading-relaxed border-t border-primary-200 border-white/30">
                          {desc}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <p className={`font-bold text-base ${p.discount ? 'text-primary-900 text-white' : 'text-primary-900 text-white'}`}>
                        {p.priceText} <span className="text-xs font-normal text-primary-400 text-[#13ABC4] !text-white">تومان</span>
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
                className="flex flex-col overflow-hidden w-full mt-auto rounded-t-2xl bg-white bg-primary-900"
                style={{ maxHeight: '78dvh' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-primary-200 border-white/30 flex-shrink-0">
                  <span className="text-sm font-bold text-primary-900 text-white">فیلتر جستجو</span>
                  <button type="button" onClick={() => setCatOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full bg-primary-100 bg-primary-800 text-primary-700 text-white">
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
                          className={`px-3.5 py-2 rounded-full text-xs font-medium border ${on ? 'search-filter-chip--on px-3.5 py-2 rounded-full text-xs font-bold border-2 border-[#023047] bg-[#023047] border-[#13ABC4] bg-[#13ABC4] !text-white shadow-sm' : 'px-3.5 py-2 rounded-full text-xs font-medium border border-primary-200 border-white/50 text-primary-800 !text-white/75 bg-transparent'}`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                  <div className="border-t border-primary-200 border-white/30 my-3" />
                  <div className="px-1 py-1.5 text-xs font-bold text-primary-400">رنگ</div>
                  <div className="flex flex-wrap gap-2 px-1 pb-2">
                    {(Array.isArray(allColors) ? allColors : []).map(c => {
                      const on = (searchColors || []).includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleSearchColor(c)}
                          className={`px-3.5 py-2 rounded-full text-xs font-medium border ${on ? 'search-filter-chip--on px-3.5 py-2 rounded-full text-xs font-bold border-2 border-[#023047] bg-[#023047] border-[#13ABC4] bg-[#13ABC4] !text-white shadow-sm' : 'px-3.5 py-2 rounded-full text-xs font-medium border border-primary-200 border-white/50 text-primary-800 !text-white/75 bg-transparent'}`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                  <div className="border-t border-primary-200 border-white/30 my-3" />
                  <div className="px-1 py-1.5 text-xs font-bold text-primary-400">سایز</div>
                  <div className="flex flex-wrap gap-2 px-1 pb-2">
                    {(Array.isArray(allSizes) ? allSizes : []).map(s => {
                      const on = (searchSizes || []).includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSearchSize(s)}
                          className={`latin-label min-w-[3rem] px-3.5 py-2 rounded-full text-xs font-medium border ${on ? 'search-filter-chip--on px-3.5 py-2 rounded-full text-xs font-bold border-2 border-[#023047] bg-[#023047] border-[#13ABC4] bg-[#13ABC4] !text-white shadow-sm' : 'px-3.5 py-2 rounded-full text-xs font-medium border border-primary-200 border-white/50 text-primary-800 !text-white/75 bg-transparent'}`}
                        >
                          سایز {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex-shrink-0 px-4 py-3 border-t border-primary-200 border-white/30">
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
              <div className="pointer-events-auto max-w-3xl mx-auto rounded-2xl shadow-2xl border border-primary-200 border-white/20 bg-white/95 bg-primary-900/95 backdrop-blur-xl px-3 sm:px-4 py-3 flex items-center gap-3">
                <div className="flex -space-x-2 space-x-reverse flex-shrink-0">
                  {compare.map(p => (
                    <div key={p.id} className="relative">
                      <img src={p.colors?.[0]?.image || p.image} alt="" className="w-10 h-12 sm:w-12 sm:h-14 object-cover rounded-lg border-2 border-white border-primary-900 shadow"  loading="lazy" decoding="async" />
                      <button type="button" onClick={() => toggleCompare(p)} className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-primary-800 text-white flex items-center justify-center text-xs" aria-label="حذف">×</button>
                    </div>
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-primary-900 text-white">مقایسه · {toFa(compare.length)} از {toFa(COMPARE_MAX)}</p>
                  <p className="text-xs text-primary-500 text-[#13ABC4] !text-white truncate">{compare.length < 2 ? 'یک کالای دیگر اضافه کنید' : 'آماده مقایسه'}</p>
                </div>
                <button type="button" onClick={openComparePage} className="btn-cta flex-shrink-0 px-3 sm:px-4 py-2 rounded-full bg-apple-blue text-white text-xs font-bold">مقایسه کن</button>
                <button type="button" onClick={clearCompare} className="flex-shrink-0 p-2 rounded-full text-primary-500 text-[#13ABC4] footer-link hover:bg-primary-100 hover:bg-primary-800" aria-label="پاک کردن">
                  <Icon name="x" size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Replace when compare full */}
          {compareReplaceOpen && (
            <div className="site-modal-root" role="dialog" aria-modal="true">
              <div className="site-modal-backdrop" onClick={() => setCompareReplaceOpen(null)} />
              <div className="relative w-full max-w-md rounded-2xl bg-white bg-primary-900 p-5 shadow-2xl border border-primary-200 border-white/20">
                <h3 className="font-bold text-primary-900 text-white text-base mb-1">ظرفیت مقایسه پر است</h3>
                <p className="text-xs text-primary-500 text-[#13ABC4] !text-white mb-4">حداکثر {toFa(COMPARE_MAX)} کالا. یکی را جایگزین کنید:</p>
                <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                  {compare.map(p => (
                    <button key={p.id} type="button" onClick={() => replaceCompareAt(p.id, compareReplaceOpen)} className="w-full flex items-center gap-3 p-2 rounded-xl bg-white bg-primary-900 border border-primary-200 border-white/20 hover:border-apple-blue text-right transition">
                      <img src={p.colors?.[0]?.image || p.image} alt="" className="w-12 h-14 object-cover rounded-lg"  loading="lazy" decoding="async" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm sm:text-base font-medium text-primary-900 text-[#13ABC4] !text-white line-clamp-2">{p.name}</p>
                        <p className="text-xs text-primary-500 text-[#13ABC4] mt-0.5">ضربه برای جایگزینی</p>
                      </div>
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => setCompareReplaceOpen(null)} className="w-full py-2.5 rounded-full border border-primary-200 border-white/30 text-sm text-primary-700 text-white">انصراف</button>
              </div>
            </div>
          )}

          {/* Notifications Drawer — outside header so fixed = viewport height */}
          {notifPanelOpen && (
            <>
              <div className="cart-overlay fixed inset-0 z-[90] bg-black/40 backdrop-blur-xl" onClick={() => setNotifPanelOpen(false)} onWheel={(e) => e.preventDefault()} onTouchMove={(e) => e.preventDefault()} aria-hidden="true" />
              <div role="dialog" aria-modal="true" className="cart-panel fixed top-0 bottom-0 start-0 z-[200] w-full max-w-[360px] sm:max-w-[400px] h-full min-h-0 max-h-[100dvh] bg-white bg-primary-900 shadow-2xl flex flex-col rounded-l-2xl overflow-hidden" role="dialog" aria-modal="true" aria-label="اعلان‌ها">
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-primary-200 border-white/30 bg-primary-50/50 bg-primary-900/40">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-apple-blue text-white flex items-center justify-center">
                      <Icon name="bell" size={18} />
                    </div>
                    <div className="drawer-title-wrap">
                      <h3 data-drawer-title className="font-bold text-base text-primary-900 text-[#13ABC4] !text-white leading-tight">اعلان‌ها</h3>
                      <p className="text-xs text-primary-500 text-[#13ABC4] !text-white">{toFa(unreadNotifCount)} خوانده‌نشده</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={markAllNotifsRead} className="text-xs px-2 py-1 rounded-full text-apple-blue">همه خوانده</button>
                    <button type="button" onClick={() => setNotifPanelOpen(false)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-primary-100 hover:bg-primary-800 transition text-primary-900 text-white" aria-label="بستن">
                      <Icon name="x" size={20} />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2.5" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {(notifications || []).length === 0 ? (
                    <EmptyStateBox title="اعلانی نیست" description="وقتی سفارشی ارسال شود یا موجودی برسد اینجا می‌بینید." className="border-0 bg-transparent py-10" />
                  ) : (
                    (notifications || []).slice(0, 40).map(n => (
                      <button key={n.id} type="button" onClick={() => markNotifRead(n.id)} className={`w-full text-right px-3.5 py-3 rounded-2xl border border-primary-100 border-white/10 transition hover:bg-primary-50/90 hover:bg-[#1A1C20] ${n.read ? 'opacity-75 bg-white bg-black/40' : 'bg-apple-blue/5 bg-[#13ABC4]/10 border-apple-blue/20 border-[#13ABC4]/25'}`}>
                        <div className="flex items-start gap-2.5">
                          {!n.read && <span className="mt-1.5 w-2 h-2 rounded-full bg-apple-blue bg-[#13ABC4] flex-shrink-0 text-white" />}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-primary-900 text-white">{n.title}</p>
                            <p className="text-xs text-primary-500 text-[#13ABC4] !text-white line-clamp-2 mt-0.5">{n.body}</p>
                            <p className="text-xs text-primary-400 text-[#13ABC4] !text-white mt-1">{n.date}</p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                <div className="p-3 border-t border-primary-100 border-white/10">
                  <button type="button" onClick={() => { setNotifPanelOpen(false); if (user) { openProfilePage('notifications'); } else { openAuth(); } }} className="w-full text-center text-xs py-2.5 rounded-xl text-apple-blue font-medium hover:bg-primary-50 hover:bg-primary-900">مشاهده همه در پروفایل</button>
                </div>
              </div>
            </>
          )}

          {/* Wishlist Drawer */}
          {wishlistOpen && (
            <>
              <div className="cart-overlay fixed inset-0 z-[90] bg-black/40 backdrop-blur-xl" onClick={() => setWishlistOpen(false)} onWheel={(e) => e.preventDefault()} onTouchMove={(e) => e.preventDefault()} aria-hidden="true" />
              <div role="dialog" aria-modal="true" className="cart-panel fixed top-0 bottom-0 start-0 z-[200] w-full max-w-[360px] sm:max-w-[400px] bg-white bg-primary-900 h-full min-h-0 max-h-[100dvh] shadow-2xl flex flex-col rounded-l-2xl overflow-hidden" role="dialog" aria-modal="true" aria-label="علاقه‌مندی‌ها">
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-primary-200 border-white/30 bg-primary-50/50 bg-primary-900/40">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-apple-blue text-white flex items-center justify-center">
                      <Icon name="heartFilled" size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-primary-900 text-[#13ABC4] !text-white leading-tight">علاقه‌مندی‌ها</h3>
                      <p className="text-xs text-primary-500 text-white">{toFa(favorites.length)} کالا · عمل سریع</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {favorites.length > 0 && (
                      wishlistClearConfirm ? (
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={clearFavorites} className="btn-cta text-xs px-2 py-1 rounded-full bg-[#023047] hover:bg-[#012536] hover:bg-white/10 border border-[#023047] border-[#13ABC4] border-white/25 text-primary-900 text-[#13ABC4] footer-link text-white">تأیید</button>
                          <button type="button" onClick={() => setWishlistClearConfirm(false)} className="text-xs px-2 py-1 rounded-full border border-primary-200 border-white/30">لغو</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setWishlistClearConfirm(true)} className="text-xs px-2 py-1 rounded-full text-primary-500 text-white/70 hover:bg-primary-100 hover:bg-primary-800">حذف همه</button>
                      )
                    )}
                    <button type="button" onClick={() => setWishlistOpen(false)} className="p-2 hover:bg-primary-100 hover:bg-primary-800 rounded-full transition text-primary-900 text-white" aria-label="بستن">
                      <Icon name="x" size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-5" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {wishlistProducts.length === 0 ? (
                    <div className="text-center py-14 px-2">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-50 bg-primary-900 flex items-center justify-center text-primary-400">
                        <Icon name="heart" size={28} />
                      </div>
                      <p className="text-primary-800 text-white text-sm font-bold mb-1">هنوز چیزی را لایک نکرده‌اید</p>
                      <p className="text-primary-500 text-[#13ABC4] !text-white text-xs mb-5">با زدن قلب، کالاها اینجا می‌آیند</p>
                      <button type="button" onClick={() => { setWishlistOpen(false); openPLP(); }} className="inline-flex px-5 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium">مشاهده محصولات</button>
                    </div>
                  ) : (
                    wishlistProducts.map((p, idx) => {
                      if (p.missing) {
                        return (
                          <div key={`w-miss-${p.id}`} className="py-3 border-b border-primary-100 border-white/10">
                            <p className="text-xs text-red-500">کالا دیگر موجود نیست</p>
                            <button type="button" onClick={() => toggleFavorite(p.id)} className="text-xs text-primary-500 text-[#13ABC4] mt-1">حذف</button>
                          </div>
                        );
                      }
                      const priceDropped = p.priceAtAdd && p.price < p.priceAtAdd;
                      const out = p.stock === 0;
                      return (
                        <div key={`w-${p.id}`} className="flex gap-3 py-3.5 border-b border-primary-100 border-white/10 last:border-0">
                          <button type="button" className="flex-shrink-0 p-0 border-0 bg-transparent" onClick={() => { setWishlistOpen(false); openPDP(p); }}>
                            <img src={p.colors?.[0]?.image || p.image} alt={p.name || "محصول"} className="w-16 h-20 object-cover rounded-xl shadow-sm" loading="lazy" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.classList.add("img-broken"); e.currentTarget.src = "/logo.webp"; }} />
                          </button>
                          <div className="flex-1 min-w-0">
                            <button type="button" className="text-right w-full p-0 border-0 bg-transparent" onClick={() => { setWishlistOpen(false); openPDP(p); }}>
                              <h4 className="text-xs font-medium text-primary-900 text-white line-clamp-2">{p.name}</h4>
                            </button>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {out && <span className="text-xs text-red-500">ناموجود</span>}
                              {priceDropped && <span className="text-xs text-apple-blue font-medium">کاهش قیمت</span>}
                              {p.discount > 0 && <span className="text-xs font-bold text-apple-blue">{toFa(p.discount)}٪</span>}
                            </div>
                            <p className="text-xs font-bold text-primary-900 text-white mt-1">{p.priceText} <span className="!text-white">تومان</span></p>
                            <div className="flex items-center gap-2 mt-2">
                              {!out ? (
                                <button type="button" onClick={() => addToCart(p)} className="text-xs px-2.5 py-1 rounded-full bg-apple-blue text-white">افزودن به سبد</button>
                              ) : (
                                <button type="button" className="text-xs px-2.5 py-1 rounded-full border border-primary-200 border-white/30 text-primary-600 text-[#13ABC4] footer-link text-white">خبرم کن</button>
                              )}
                              <button type="button" onClick={() => toggleFavorite(p.id)} className="mr-auto p-1.5 rounded-full text-primary-500 text-[#13ABC4] hover:bg-primary-50 hover:bg-primary-800" aria-label="حذف">
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
                  <div className="p-4 sm:p-5 border-t border-primary-200 border-white/30 space-y-2 bg-primary-50/40 bg-primary-900/30">
                    <button type="button" onClick={() => { setWishlistOpen(false); openWishlistPage(); }} className="w-full bg-apple-blue text-white py-3 rounded-full font-medium hover:opacity-90 transition shadow-md">
                      مشاهده صفحه علاقه‌مندی‌ها
                    </button>
                    <button type="button" onClick={() => { try { setWishlistOpen(false); } catch (_) {}; try { setCompareOpen(false); } catch (_) {}; try { setRecentOpen(false); } catch (_) {}; openPLP(); }} className="drawer-secondary-btn w-full py-2.5 rounded-full text-sm font-semibold border border-primary-300 border-white/50 !text-primary-900 text-[#13ABC4] !text-white bg-white bg-[#2A2C30]">
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
              <div role="dialog" aria-modal="true" className="cart-panel fixed top-0 bottom-0 start-0 z-[200] w-full max-w-[360px] sm:max-w-[400px] bg-white bg-primary-900 h-full min-h-0 max-h-[100dvh] shadow-2xl flex flex-col rounded-l-2xl overflow-hidden" role="dialog" aria-modal="true" aria-label="مقایسه">
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-primary-200 border-white/30 bg-primary-50/50 bg-primary-900/40">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-apple-blue text-white flex items-center justify-center">
                      <Icon name="scale" size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-primary-900 text-white leading-tight">مقایسه</h3>
                      <p className="text-xs text-primary-500 text-white">{toFa(compare.length)} از {toFa(COMPARE_MAX)} کالا</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {compare.length > 0 && (
                      <button type="button" onClick={clearCompare} className="text-xs px-2 py-1 rounded-full border border-primary-200 border-white/30 text-primary-600 text-[#13ABC4] footer-link text-white/80 hover:bg-primary-50 hover:bg-primary-800">پاک کردن</button>
                    )}
                    <button type="button" onClick={() => setCompareOpen(false)} className="p-2 hover:bg-primary-100 hover:bg-primary-800 rounded-full transition text-primary-900 text-white" aria-label="بستن">
                      <Icon name="x" size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
                  {compare.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                      <div className="w-14 h-14 rounded-full bg-primary-50 bg-primary-900 flex items-center justify-center mb-3 text-primary-400">
                        <Icon name="scale" size={28} />
                      </div>
                      <p className="text-sm font-medium text-primary-700 text-white mb-1">لیست مقایسه خالی است</p>
                      <p className="text-xs text-primary-500 text-[#13ABC4] !text-white mb-4">محصولات را از فروشگاه به مقایسه اضافه کنید</p>
                      <button type="button" onClick={() => { try { setCompareOpen(false); } catch (_) {}; try { setRecentOpen(false); } catch (_) {}; openPLP(); }} className="inline-flex px-5 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium">مشاهده فروشگاه</button>
                    </div>
                  ) : (
                    compare.map(p => (
                      <div key={p.id} className="flex gap-3 p-2.5 rounded-xl border border-primary-100 border-white/10 bg-white bg-primary-900/40">
                        <button type="button" className="flex-shrink-0 p-0 border-0 bg-transparent" onClick={() => { setCompareOpen(false); openPDP(p); }}>
                          <img src={p.colors?.[0]?.image || p.image} alt={p.name || "محصول"} className="w-16 h-20 object-cover rounded-lg" onError={(e) => { e.currentTarget.classList.add("img-broken"); e.currentTarget.src = "/logo.webp"; }} />
                        </button>
                        <div className="min-w-0 flex-1 flex flex-col">
                          <button type="button" className="text-right w-full p-0 border-0 bg-transparent" onClick={() => { setCompareOpen(false); openPDP(p); }}>
                            <p className="text-xs sm:text-sm font-medium text-primary-900 text-white line-clamp-2">{p.name}</p>
                            <p className="text-xs text-primary-500 text-[#13ABC4] !text-white mt-0.5">{p.category}</p>
                            <p className="text-xs font-bold text-primary-800 text-[#13ABC4] mt-1">{p.priceText} تومان</p>
                          </button>
                          <div className="mt-auto flex items-center justify-end pt-1">
                            <button type="button" onClick={() => toggleCompare(p)} className="p-1.5 rounded-full text-primary-500 text-[#13ABC4] hover:bg-primary-50 hover:bg-primary-800" aria-label="حذف از مقایسه">
                              <Icon name="trash" size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {compare.length > 0 && (
                  <div className="p-4 sm:p-5 border-t border-primary-200 border-white/30 space-y-2 bg-primary-50/40 bg-primary-900/30">
                    <button
                      type="button"
                      onClick={() => { setCompareOpen(false); openComparePage(); }}
                      disabled={compare.length < 2}
                      className={`w-full py-3 rounded-full font-medium transition shadow-md ${compare.length < 2 ? 'bg-primary-200 bg-primary-800 text-primary-500 !text-white cursor-not-allowed' : 'bg-apple-blue text-white hover:opacity-90'}`}
                    >
                      {compare.length < 2 ? 'حداقل ۲ کالا برای مقایسه' : 'مقایسه کن'}
                    </button>
                    <button type="button" onClick={() => { try { setWishlistOpen(false); } catch (_) {}; try { setCompareOpen(false); } catch (_) {}; try { setRecentOpen(false); } catch (_) {}; openPLP(); }} className="drawer-secondary-btn w-full py-2.5 rounded-full text-sm font-semibold border border-primary-300 border-white/50 !text-primary-900 text-[#13ABC4] !text-white bg-white bg-[#2A2C30]">
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
              <div role="dialog" aria-modal="true" className="cart-panel fixed top-0 bottom-0 start-0 z-[200] w-full max-w-[360px] sm:max-w-[400px] bg-white bg-primary-900 h-full min-h-0 max-h-[100dvh] shadow-2xl flex flex-col rounded-l-2xl overflow-hidden" role="dialog" aria-modal="true" aria-label="بازدید اخیر">
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-primary-200 border-white/30 bg-primary-50/50 bg-primary-900/40">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-apple-blue text-white flex items-center justify-center">
                      <Icon name="eye" size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-primary-900 text-white leading-tight">بازدید اخیر</h3>
                      <p className="text-xs text-primary-500 text-white">{toFa(recentlyViewed.length)} کالا</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setRecentOpen(false)} className="p-2 hover:bg-primary-100 hover:bg-primary-800 rounded-full transition text-primary-900 text-white" aria-label="بستن">
                    <Icon name="x" size={18} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {recentlyViewed.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                      <div className="w-14 h-14 rounded-full bg-primary-50 bg-primary-900 flex items-center justify-center mb-3 text-primary-400">
                        <Icon name="eye" size={28} />
                      </div>
                      <p className="text-sm font-medium text-primary-700 text-white mb-1">هنوز بازدیدی ثبت نشده</p>
                      <p className="text-xs text-primary-500 text-[#13ABC4] !text-white mb-4">محصولاتی که می‌بینید اینجا می‌آیند</p>
                      <button type="button" onClick={() => { try { setCompareOpen(false); } catch (_) {}; try { setRecentOpen(false); } catch (_) {}; openPLP(); }} className="inline-flex px-5 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium">مشاهده فروشگاه</button>
                    </div>
                  ) : (
                    recentlyViewed.map(p => (
                      <div key={p.id} className="flex gap-3 p-2.5 rounded-xl border border-primary-100 border-white/10 bg-white bg-primary-900/40">
                        <button type="button" className="flex-shrink-0 p-0 border-0 bg-transparent" onClick={() => { setRecentOpen(false); openPDP(p); }}>
                          <img src={p.colors?.[0]?.image || p.image} alt={p.name || "محصول"} className="w-16 h-20 object-cover rounded-lg" onError={(e) => { e.currentTarget.classList.add("img-broken"); e.currentTarget.src = "/logo.webp"; }} />
                        </button>
                        <div className="min-w-0 flex-1 flex flex-col">
                          <button type="button" className="text-right w-full p-0 border-0 bg-transparent" onClick={() => { setRecentOpen(false); openPDP(p); }}>
                            <p className="text-xs font-medium text-primary-900 text-white line-clamp-2">{p.name}</p>
                            <p className="text-xs font-bold text-primary-900 text-white mt-1">{p.priceText} <span className="!text-white">تومان</span></p>
                          </button>
                          <div className="mt-auto flex items-center justify-start gap-2 pt-1" dir="rtl">
                            <button type="button" onClick={() => addToCart(p)} className="text-xs px-2.5 py-1 rounded-full bg-apple-blue text-white">سبد</button>
                            <button type="button" onClick={() => toggleFavorite(p.id)} className="text-xs px-2.5 py-1 rounded-full border border-primary-200 border-white/30 text-primary-600 text-white">لایک</button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {recentlyViewed.length > 0 && (
                  <div className="p-4 sm:p-5 border-t border-primary-200 border-white/30 space-y-2 bg-primary-50/40 bg-primary-900/30">
                    <button type="button" onClick={() => { setRecentOpen(false); openRecentPage(); }} className="w-full py-3 rounded-full font-medium bg-apple-blue text-white hover:opacity-90 transition shadow-md">
                      مشاهده صفحه بازدید اخیر
                    </button>
                    <button type="button" onClick={() => { try { setWishlistOpen(false); } catch (_) {}; try { setCompareOpen(false); } catch (_) {}; try { setRecentOpen(false); } catch (_) {}; openPLP(); }} className="drawer-secondary-btn w-full py-2.5 rounded-full text-sm font-semibold border border-primary-300 border-white/50 !text-primary-900 text-[#13ABC4] !text-white bg-white bg-[#2A2C30]">
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
