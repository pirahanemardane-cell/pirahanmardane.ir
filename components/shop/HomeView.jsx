'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAppApi } from '../AppApiContext';
import Hero from '../Hero';
import Avatar from '../ui/Avatar';

/** HomeView — code-split from App.jsx */
export default function HomeView() {
  const [liveReviews, setLiveReviews] = useState([]);
  const [homeBrands, setHomeBrands] = useState([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/catalog/brands', { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        const list = Array.isArray(data?.brands) ? data.brands : [];
        const picked = list
          .filter((b) => b && b.active !== false && (b.show_on_home === true || b.showOnHome === true))
          .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
        if (!cancelled) setHomeBrands(picked);
      } catch (_) {}
    })();
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/reviews?featured=true', { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        if (!cancelled && data?.ok && Array.isArray(data.reviews)) {
          setLiveReviews(data.reviews.map((r) => ({
            name: r.name || r.display_name || 'خریدار',
            image: r.image || r.display_avatar_url || '',
            rating: r.rating || 0,
            text: r.text || r.body || '',
            seller: r.seller || null,
            sellerId: r.seller_id || null,
            city: r.city || '',
          })));
        }
      } catch (_) {}
    })();
    return () => { cancelled = true; };
  }, []);
  const {CarouselArrows, Icon, activeSellerId, features, brands, adminCatalogBrands, topSellers, blogs, reviews, stats, categories, catalogProducts, dark, isDealActive, newestTab, newsletterPhone, openPLP, openRecentPage, openSellerPanel, openSellersList, openStaticPage, setFaqQuery, pdpProduct, awaitingDeepProduct, products, pushLiveToast, recentlyViewed, renderProductCard, sellerUser, setActiveSellerId, setHeaderRevealedAfterHero, setNewestTab, setNewsletterPhone, setSellerCat, setSellerSort, showAdminPanel, showCartPage, showCheckout, showComparePage, showPLP, showProfilePage, showRecentPage, showSellerPanel, showSellersList, showTaxonomyHub, showToast, showWishlistPage, staticPage, brandsTrackRef, sellersTrackRef, bestTrackRef, newTrackRef, amazingTrackRef, reviewTrackRef, recentTrackRef, blogsTrackRef, toFa, setPublicTrackOpen, setPublicTrackCode, publicTrackOpen, setBrandDetailId, openBrand} = useAppApi(); /* setPublicTrackOpen from context */
  const [homeBlogs, setHomeBlogs] = useState([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/blog?limit=12', { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        const list = Array.isArray(data?.posts) ? data.posts : (Array.isArray(data?.items) ? data.items : []);
        const mapped = list
          .filter((p) => p && (p.status == null || p.status === 'published'))
          .map((p) => ({
            id: p.id,
            title: p.title || 'بدون عنوان',
            image: p.cover_image || p.cover_url || p.cover || '/default-avatar.svg',
            category: p.cat || p.category || p.category_name || '',
            author: p.author || p.author_name || 'پیراهن مردانه',
            date: (() => {
              const raw = p.published_at || p.date || p.created_at;
              if (!raw) return '';
              try {
                return new Date(raw).toLocaleDateString('fa-IR');
              } catch (_) {
                return String(raw).slice(0, 10);
              }
            })(),
            slug: p.slug || '',
          }));
        if (!cancelled) setHomeBlogs(mapped);
      } catch (_) {}
    })();
    return () => { cancelled = true; };
  }, []);

  const displayReviews = (liveReviews.length ? liveReviews : (reviews || []))
    .filter((r) => String(r?.text || '').trim().length > 0);

  const featuredHomeBrands = useMemo(() => {
    // فقط برندهای کاتالوگ ادمین — هرگز اسم فروشگاه
    const raw = [
      ...(Array.isArray(homeBrands) ? homeBrands : []),
      ...(Array.isArray(adminCatalogBrands) ? adminCatalogBrands : []),
    ];
    const byKey = new Map();
    for (const b of raw) {
      if (!b) continue;
      const name = String(b.name || '').trim();
      if (!name) continue;
      // رد کردن نام‌هایی که شبیه فروشگاه‌اند اگر فقط از seller آمده باشند — فقط از catalog
      const id = String(b.id || b.slug || name);
      const key = id.toLowerCase();
      const prev = byKey.get(key);
      const row = {
        id,
        name,
        logo_url: b.logo_url || b.logoUrl || b.image || (prev && prev.logo_url) || '',
        show_on_home: (b.home_opt_out === true || b.homeOptOut === true) ? false : (b.show_on_home == null && b.showOnHome == null ? true : !!(b.show_on_home ?? b.showOnHome ?? (prev && prev.show_on_home))),
        active: b.active !== false,
        sort_order: Number(b.sort_order ?? b.sortOrder) || (prev && prev.sort_order) || 0,
      };
      if (!row.active) continue;
      byKey.set(key, row);
    }
    const all = [...byKey.values()];

    // فقط برندهایی که تیک صفحه اصلی دارند (دستی ادمین یا auto پرفروش)
    let manual = all
      .filter((b) => b.show_on_home)
      .sort((a, b) => a.sort_order - b.sort_order);

    // خودکار: پرفروش بر اساس brand روی محصول (نه seller)
    const productPool = [
      ...(Array.isArray(catalogProducts) ? catalogProducts : []),
      ...(Array.isArray(products) ? products : []),
    ];
    const byName = new Map(all.map((b) => [b.name.toLowerCase(), b]));
    const byId = new Map(all.map((b) => [String(b.id).toLowerCase(), b]));
    const salesMap = new Map();
    for (const p of productPool) {
      if (!p) continue;
      const bid = String(p.brand_id || p.brandId || '').trim();
      const bname = String(p.brand_name || p.brandName || p.brand || '').trim();
      if (!bid && !bname) continue;
      if (bname === 'عمومی' || bname.toLowerCase() === 'generic') continue;
      const hit = (bid && byId.get(bid.toLowerCase())) || (bname && byName.get(bname.toLowerCase()));
      if (!hit) continue;
      const k = String(hit.id).toLowerCase();
      const sold = Number(p.sold_count ?? p.soldCount ?? p.salesCount ?? p.order_count ?? 0);
      const w = sold > 0 ? sold : 1;
      const prev = salesMap.get(k) || { ...hit, score: 0, auto: true };
      prev.score += w;
      salesMap.set(k, prev);
    }
    const autoSorted = [...salesMap.values()].sort((a, b) => b.score - a.score).slice(0, 12);

    const seen = new Set();
    const out = [];
    for (const b of [...manual.map((x) => ({ ...x, manual: true, score: 1e9 })), ...autoSorted]) {
      const k = String(b.id || b.name).toLowerCase();
      if (!k || seen.has(k)) continue;
      seen.add(k);
      out.push(b);
      if (out.length >= 16) break;
    }
    return out;
  }, [homeBrands, catalogProducts, products, adminCatalogBrands]);

  return (
    <>
          {!awaitingDeepProduct && !activeSellerId && !showSellersList && !showPLP && !showTaxonomyHub && !pdpProduct && !showCartPage && !showCheckout && !showWishlistPage && !showRecentPage && !showComparePage && !showProfilePage && !showSellerPanel && !showAdminPanel && !staticPage && (
          <>
          <main className="flex-1">
            <Hero onShopClick={() => { openPLP(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} onHeroProgress={(p) => {
              if (p >= 0.98) setHeaderRevealedAfterHero(true);
            }} />

                        {/* Features — full-width · فاصله چپ/راست متقارن */}
            <section className="relative z-20 bg-primary-50 dark:bg-primary-900 py-3 sm:py-4 border-b border-primary-200 dark:border-white/30 transition-colors overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 w-full items-stretch justify-items-stretch sm:justify-items-center">
                  {features.map((f, i) => (
                    <div key={i} className="flex items-center justify-start sm:justify-center gap-2 sm:gap-2.5 min-w-0 w-full max-w-full h-full">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-primary-800 text-primary-800 dark:text-white flex items-center justify-center flex-shrink-0 border border-primary-200 dark:border-white/30">
                        <Icon name={f.icon} size={16} />
                      </div>
                      <div className="min-w-0 overflow-hidden text-right flex-1 sm:flex-none">
                        <h3 className="font-semibold text-xs text-primary-900 dark:text-white leading-snug whitespace-nowrap">{f.title}</h3>
                        <p className="text-xs text-primary-500 dark:text-white/80 mt-0.5 leading-snug line-clamp-2">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Categories */}
            <section id="categories" className="py-8 sm:py-12 bg-primary-50 dark:bg-primary-950 transition-colors">
              <div className="max-w-7xl mx-auto px-3 sm:px-4">
                <h2 className="gsap-reveal section-title text-right text-primary-900 dark:text-white mb-6 sm:mb-10 text-lg sm:text-xl">دسته بندی محصولات</h2>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-x-3 gap-y-5 sm:gap-x-6 md:gap-x-8 justify-items-center">
                  {categories.map((cat, i) => (
                    <button key={i} type="button" onClick={() => openPLP({ cat: cat.name })} className="gsap-cat flex flex-col items-center gap-1.5 sm:gap-3 group w-full max-w-[140px] md:max-w-none">
                      <div className="category-icon w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-2 border-neutral-300 dark:border-neutral-500 flex items-center justify-center text-primary-800 dark:text-white bg-white dark:bg-primary-900">
                        <Icon name={cat.icon} size={22} />
                      </div>
                      <span className="text-xs sm:text-xs md:text-xs font-medium text-primary-800 dark:text-white group-hover:text-primary-700 dark:group-hover:text-white text-center line-clamp-2 leading-snug" title={cat.name}>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Featured brands */}
            {featuredHomeBrands.length > 0 && (
            <section className="py-8 sm:py-10 bg-white dark:bg-primary-900 border-y border-primary-200 dark:border-white/30 transition-colors">
              <div className="max-w-7xl mx-auto px-3 sm:px-4">
                <div className="flex items-center justify-between mb-5 sm:mb-6 gap-3">
                  <h2 className="section-title text-primary-900 dark:text-white text-lg sm:text-xl">برندهای منتخب</h2>
                  <button
                    type="button"
                    onClick={() => openStaticPage('brands')}
                    className="text-xs sm:text-sm text-apple-link hover:underline flex items-center gap-1"
                  >
                    مشاهده همه
                    <Icon name="chevronLeft" size={14} />
                  </button>
                </div>
                <div className="relative">
                  <CarouselArrows trackRef={brandsTrackRef} />
                  <div ref={brandsTrackRef} className="carousel-track flex gap-3 overflow-x-auto no-scrollbar pb-1 px-0 sm:px-10" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {featuredHomeBrands.map((b) => (
                      <div
                        key={b.id || b.name}
                        role="button"
                        tabIndex={0}
                        onClick={() => { try { (typeof openBrand === 'function' ? openBrand(b) : openPLP({ brand: b.name, brandSlug: b.slug || b.name })); } catch (_) { openPLP({ brand: b.name }); } }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { try { openBrand(b); } catch (_) { try { openPLP({ brand: b.name, brandSlug: b.slug || b.name }); } catch (__) {} } } }}
                        className="flex-shrink-0 w-[104px] h-[88px] rounded-xl border border-primary-200 dark:border-white/25 bg-primary-50 dark:bg-primary-800 flex flex-col items-center justify-center text-center p-2 cursor-pointer transition hover:bg-primary-800 hover:border-primary-800 dark:hover:bg-primary-700 dark:hover:border-white/40 group/brand shadow-sm"
                      >
                        <span className="font-bold text-xs leading-tight text-primary-900 dark:text-white group-hover/brand:text-white dark:group-hover/brand:text-[#FF0000] dark:text-[#13ABC4] line-clamp-2">{b.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            )}

            {/* Top sellers — horizontal carousel, photo + text, palette only */}
            <section className="py-8 sm:py-10 bg-primary-50 dark:bg-primary-950 transition-colors">
              <div className="max-w-7xl mx-auto px-3 sm:px-4">
                <div className="flex items-center justify-between mb-5 sm:mb-6 gap-3">
                  <h2 className="section-title text-primary-900 dark:text-white text-lg sm:text-xl">برترین فروشندگان</h2>
                  <button
                    type="button"
                    onClick={openSellersList}
                    className="text-xs sm:text-sm text-apple-link hover:underline flex items-center gap-1"
                  >
                    مشاهده همه
                    <Icon name="chevronLeft" size={14} />
                  </button>
                </div>
                <div className="relative">
                  <CarouselArrows trackRef={sellersTrackRef} />
                  <div ref={sellersTrackRef} className="carousel-track flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth snap-x px-0 sm:px-10" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {topSellers.slice(0, 6).map((s, i) => {
                    const img = String(s.image || s.logo || s.avatar || '').trim();
                    const hasPhoto = img && !/default-avatar|logo\.webp|^\/logo/i.test(img);
                    const letter = (() => {
                      const t = String(s.name || s.shopName || '').trim();
                      const m = t.match(/[\u0600-\u06FFa-zA-Z0-9]/);
                      return (m ? m[0] : (t[0] || '؟')).toUpperCase();
                    })();
                    return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => { setActiveSellerId(s.id); setSellerCat('همه'); setSellerSort('newest'); window.scrollTo({ top: 0, behavior: 'instant' }); }}
                      className="group flex-shrink-0 w-[78%] min-[400px]:w-[70%] sm:w-[42%] md:w-[calc((100%-2.5rem)/3.3)] lg:w-[calc((100%-3.5rem)/4.3)] relative overflow-hidden rounded-xl bg-white dark:bg-primary-900 sm:rounded-2xl text-right min-h-[160px] sm:min-h-[180px] border border-primary-200 dark:border-white/30 snap-start"
                    >
                      {hasPhoto ? (
                        <img src={img} alt={s.name} className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-[1.02]" loading="lazy" decoding="async" onError={(e) => { try { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList?.remove('hidden'); } catch (_) {} }} />
                      ) : null}
                      <div className={`absolute inset-0 flex items-center justify-center bg-primary-200 dark:bg-primary-800 ${hasPhoto ? 'hidden' : ''}`} aria-hidden={hasPhoto ? 'true' : undefined}>
                        <span className="text-5xl sm:text-6xl font-bold text-primary-700 dark:text-white select-none" style={{ fontFamily: 'IRANYekanX, var(--font-app), sans-serif' }}>{letter}</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/25" />
                      <span
                        className={`seller-rank-badge absolute top-2 left-2 z-20 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md ${
                          i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-red-800' : i === 2 ? 'bg-amber-700' : 'bg-primary-700'
                        }`}
                      >
                        {typeof toFa === 'function' ? toFa(i + 1) : (i + 1)}
                      </span>

                      <div className="relative z-10 flex flex-col h-full justify-end p-4 sm:p-5 min-h-[160px] sm:min-h-[180px]">
                        <h3 className="text-base font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">{s.name}</h3>
                        <p className="text-xs text-white/95 mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">{s.desc}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{toFa(s.products)} محصول</span>
                          <span className="text-xs font-semibold text-white underline-offset-2 group-hover:underline drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">مشاهده محصولات</span>
                        </div>
                      </div>
                    </button>
                    );
                  })}
                  </div>
                </div>
              </div>
            </section>

            {/* Bestsellers */}
            <section id="products" className="py-8 sm:py-12 bg-primary-50 dark:bg-primary-950 transition-colors">
              <div className="max-w-7xl mx-auto px-3 sm:px-4">
                <div className="flex items-center justify-between mb-5 sm:mb-8 gap-3">
                  <h2 className="gsap-reveal section-title text-primary-900 dark:text-white text-lg sm:text-xl">
                    پرفروش ترین محصولات
                  </h2>
                  <a href="/فروشگاه?sort=popular" onClick={(e) => { e.preventDefault(); openPLP({ sort: 'popular' }); }} className="text-xs sm:text-sm text-apple-link hover:underline flex items-center gap-1">
                    مشاهده همه
                    <Icon name="chevronLeft" size={14} />
                  </a>
                </div>
                {/* Horizontal carousel — max 10 items */}
                <div className="relative">
                  <CarouselArrows trackRef={bestTrackRef} />
                  <div ref={bestTrackRef} className="carousel-track flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth snap-x px-0 sm:px-10" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {catalogProducts.slice(0, 10).map(p => renderProductCard(p, 'best-'))}
                  </div>
                </div>
              </div>
            </section>

            {/* Newest products - جدیدترین محصولات */}
            <section className="py-8 sm:py-12 bg-white dark:bg-primary-900 transition-colors">
              <div className="max-w-7xl mx-auto px-3 sm:px-4">
                <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">✨</span>
                    <h2 className="section-title text-primary-900 dark:text-white text-lg sm:text-xl">جدیدترین محصولات</h2>
                  </div>
                  <a href="/فروشگاه?sort=newest" onClick={(e) => { e.preventDefault(); openPLP({ sort: 'newest' }); }} className="text-xs sm:text-sm text-apple-link hover:underline flex items-center gap-1">
                    مشاهده همه
                    <Icon name="chevronLeft" size={14} />
                  </a>
                </div>

                {/* Category tabs - only men's shirt related */}
                <div
                  className="carousel-track flex gap-2 overflow-x-auto no-scrollbar mb-5 sm:mb-6 pb-1 scroll-smooth"
                  style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
                >
                  {['همه', 'جدیدترین', 'پیراهن رسمی', 'پیراهن کروات', 'آستین کوتاه', 'لینن و نخی', 'کلاسیک'].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => {
                        if (tab === 'جدیدترین') {
                          openPLP({ sort: 'newest' });
                          return;
                        }
                        setNewestTab(tab);
                      }}
                      className={`flex-shrink-0 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                        newestTab === tab
                          ? 'bg-apple-blue text-white'
                          : 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:!text-white border border-primary-200 dark:border-white/30 hover:bg-primary-100 dark:hover:bg-primary-800'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Products row - same card as bestsellers, max 10 */}
                <div className="relative">
                  <CarouselArrows trackRef={newTrackRef} />
                  <div ref={newTrackRef} className="carousel-track flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth snap-x px-0 sm:px-10" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {catalogProducts.filter(p => {
                      if (newestTab === 'همه' || newestTab === 'جدیدترین') return true;
                      if (newestTab === 'پیراهن رسمی') return p.category === 'رسمی';
                      if (newestTab === 'پیراهن کروات') return p.category === 'کروات';
                      if (newestTab === 'آستین کوتاه') return p.category === 'آستین کوتاه';
                      if (newestTab === 'لینن و نخی') return (p.name || '').includes('لینن') || p.category === 'آستین کوتاه';
                      if (newestTab === 'کلاسیک') return (p.name || '').includes('کلاسیک') || p.category === 'رسمی';
                      return true;
                    }).slice(0, 10).map(p => renderProductCard(p, 'new-'))}
                  </div>
                </div>
              </div>
            </section>

            {/* Amazing offers / آفرتایم */}
            <section className="py-8 sm:py-12 bg-white dark:bg-primary-900 transition-colors">
              <div className="max-w-7xl mx-auto px-3 sm:px-4">
                <div className="flex items-center justify-between mb-5 sm:mb-6 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-apple-blue flex-shrink-0 text-white" aria-hidden="true">
                      <Icon name="percent" size={16} className="text-white" />
                    </span>
                    <h2 className="section-title text-primary-900 dark:text-white text-lg sm:text-xl">پیشنهادات شگفت‌انگیز</h2>
                  </div>
                  <a href="#" onClick={(e) => { e.preventDefault(); openStaticPage('deals'); }} className="text-xs sm:text-sm text-apple-link hover:underline flex items-center gap-1">
                    مشاهده همه
                    <Icon name="chevronLeft" size={14} />
                  </a>
                </div>
                <div className="relative">
                  <CarouselArrows trackRef={amazingTrackRef} />
                  <div ref={amazingTrackRef} className="carousel-track flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth snap-x px-0 sm:px-10" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {/* Timer card - آفرتایم — same peek width as product cards */}
                  <div className="flex-shrink-0 w-[78%] min-[400px]:w-[70%] sm:w-[42%] md:w-[calc((100%-2.5rem)/3.3)] lg:w-[calc((100%-3.5rem)/4.3)] rounded-xl sm:rounded-2xl overflow-hidden bg-[#FF0000] dark:bg-[#13ABC4] text-white flex flex-col items-center justify-center p-3 sm:p-4 text-center shadow-lg snap-start min-h-[200px] sm:min-h-[280px]">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    </div>
                    <h3 className="font-bold text-base sm:text-lg mb-1">آفرتایم</h3>
                    <p className="offer-time-sub text-xs sm:text-xs text-white/85 mb-4 pointer-events-none select-none">تخفیف‌های ویژه در مدتی</p>
                    <div className="flex gap-1.5 mb-4 font-mono text-sm sm:text-base font-bold tracking-wider" dir="ltr">
                      <div className="bg-white/20 rounded-md px-1.5 py-1 min-w-[2rem]">
                        <span>۰۵</span>
                        <div className="text-xs font-normal opacity-80">ساعت</div>
                      </div>
                      <span className="self-center">:</span>
                      <div className="bg-white/20 rounded-md px-1.5 py-1 min-w-[2rem]">
                        <span>۲۲</span>
                        <div className="text-xs font-normal opacity-80">دقیقه</div>
                      </div>
                      <span className="self-center">:</span>
                      <div className="bg-white/20 rounded-md px-1.5 py-1 min-w-[2rem]">
                        <span>۰۹</span>
                        <div className="text-xs font-normal opacity-80">ثانیه</div>
                      </div>
                    </div>
                    <a href="#" onClick={(e) => { e.preventDefault(); openPLP(); }} className="offer-view-all-btn inline-flex items-center gap-1 bg-white !text-[#0A0A0A] hover:!text-[#0A0A0A] active:!text-[#0A0A0A] text-xs font-semibold px-4 py-2 rounded-full shadow-md hover:bg-[#F3F4F6] active:bg-[#E5E7EB] transition border border-white">
                      مشاهده همه
                      <Icon name="chevronLeft" size={14} />
                    </a>
                  </div>

                  {catalogProducts.filter(p => isDealActive(p)).slice(0, 10).map(p => renderProductCard(p, 'amazing-'))}
                  </div>
                </div>
              </div>
            </section>

            {/* Customer Reviews - carousel, one review per slide */}
            <section className="py-8 sm:py-12 bg-primary-50 dark:bg-primary-950 transition-colors">
              <div className="max-w-7xl mx-auto px-3 sm:px-4">
                <div className="flex items-center justify-between mb-5 sm:mb-6">
                  <div>
                    <h2 className="section-title text-primary-900 dark:text-white mb-1 text-lg sm:text-xl">نظرات مشتریان واقعی</h2>
                    <p className="text-sm text-primary-500 dark:text-white">تجربه خریداران پیراهن مردانه از سراسر ایران</p>
                  </div>
                </div>
                <div className="carousel-track flex gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth snap-x" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {displayReviews.map((r, i) => (
                    <div key={i} className="flex-shrink-0 w-[78%] min-[400px]:w-[70%] sm:w-[42%] md:w-[calc((100%-2.5rem)/3.3)] lg:w-[calc((100%-3.5rem)/4.3)] bg-white dark:bg-black rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-primary-200 dark:border-white shadow-sm flex flex-col snap-start">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar name={r.name || r.display_name || "خریدار"} src={r.image || ""} size={48} className="w-12 h-12" />
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-primary-900 dark:text-white">{r.name}</p>
                          <p className="text-xs text-primary-400 dark:text-white">{r.city}</p>
                        </div>
                      </div>
                      {r.seller ? (
                        r.sellerId ? (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSellerId(r.sellerId);
                              setSellerCat('همه');
                              setSellerSort('newest');
                              window.scrollTo({ top: 0, behavior: 'instant' });
                            }}
                            className="review-shop-badge inline-flex self-start items-center h-6 px-2 rounded-md bg-primary-100 dark:bg-white text-primary-900 dark:!text-[#0A0A0A] text-xs sm:text-xs font-medium mb-2 hover:bg-primary-200 dark:hover:bg-white transition cursor-pointer"
                          >
                            {r.seller}
                          </button>
                        ) : (
                          <span className="review-shop-badge inline-flex self-start items-center h-6 px-2 rounded-md bg-primary-100 dark:bg-white text-primary-900 dark:!text-[#0A0A0A] text-xs sm:text-xs font-medium mb-2">
                            {r.seller}
                          </span>
                        )
                      ) : null}
                      <div className="flex gap-0.5 text-primary-400 mb-3">
                        {[...Array(5)].map((_, j) => (
                          <Icon key={j} name="star" size={14} className={j < r.rating ? "text-primary-400 fill-primary-400" : "text-primary-200 dark:text-primary-700"} />
                        ))}
                      </div>
                      {(() => {
                        const t = String(r.text || '').trim()
                        const s = String(r.seller || '').trim()
                        if (!t || (s && t === s)) return null
                        return <p className="text-sm text-primary-600 dark:text-white leading-relaxed flex-1">«{t}»</p>
                      })()}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* برترین های پیراهن — فقط تیک ادمین (featured_top) — بدون اتومات و بدون برند */}
      {(() => {
        const all = (typeof catalogProducts !== 'undefined' && Array.isArray(catalogProducts) && catalogProducts.length)
          ? catalogProducts
          : ((typeof products !== 'undefined' && Array.isArray(products)) ? products : []);
        const list = all
          .filter((p) => {
            if (!p) return false;
            const st = String(p.status || 'active').toLowerCase();
            if (st && st !== 'active' && st !== 'approved') return false;
            return !!(p.featured_top || p.featuredTop || (p.payload && (p.payload.featured_top || p.payload.featuredTop)));
          })
          .slice(0, 12);
        if (!list.length) return null;
        return (
          <section className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8" data-section="top-shirts">
            <h2 className="section-title text-right text-primary-900 dark:text-white mb-6 sm:mb-8 text-lg sm:text-xl">برترین های پیراهن</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {list.map((p) => (
                typeof renderProductCard === 'function'
                  ? <div key={p.id}>{renderProductCard(p, 'topshirt-')}</div>
                  : (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { try { if (typeof openPDP === 'function') openPDP(p); } catch (_) {} }}
                      className="text-right rounded-2xl border border-primary-100 dark:border-white/10 bg-white dark:bg-primary-900 overflow-hidden shadow-sm hover:shadow-md transition"
                    >
                      <div className="aspect-[3/4] bg-primary-50 dark:bg-primary-950">
                        <img src={p.image || p.images?.[0] || p.thumb || ''} alt={p.name || ''} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs sm:text-sm font-bold text-primary-900 dark:text-white line-clamp-2">{p.name}</p>
                        {p.priceText && <p className="text-xs text-primary-600 dark:text-white/70 mt-1">{p.priceText} تومان</p>}
                      </div>
                    </button>
                  )
              ))}
            </div>
          </section>
        );
      })()}


            {/* برترین برندها حذف شد — جایش برترین های پیراهن */}


            {/* Recently Viewed */}
            <section className="py-8 sm:py-12 bg-white dark:bg-primary-900 transition-colors" data-section="recent">
              <div className="max-w-7xl mx-auto px-3 sm:px-4">
                <div className="flex items-center justify-between mb-5 sm:mb-6">
                  <h2 className="section-title text-primary-900 dark:text-white flex items-center gap-2 text-lg sm:text-xl">
                    <Icon name="eye" size={22} className="text-primary-600" />
                    اخیراً دیده‌شده
                  </h2>
                  <button type="button" onClick={openRecentPage} className="text-xs sm:text-sm text-apple-link hover:underline flex items-center gap-1">
                    مشاهده همه
                    <Icon name="chevronLeft" size={14} />
                  </button>
                </div>
                <div className="relative">
                  <CarouselArrows trackRef={recentTrackRef} />
                  <div ref={recentTrackRef} className="carousel-track flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth snap-x px-0 sm:px-10" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {(recentlyViewed.length > 0 ? recentlyViewed : catalogProducts.slice(0, 10)).map(p => renderProductCard(p, 'recent-'))}
                  </div>
                </div>
              </div>
            </section>

            {/* Stats */}
            <section className="py-8 sm:py-12 bg-primary-50 dark:bg-primary-950 transition-colors">
              <div className="max-w-7xl mx-auto px-3 sm:px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                  {stats.map((s, i) => (
                    <div key={i} className="gsap-stat bg-white dark:bg-black rounded-xl p-4 sm:p-6 text-center shadow-sm border border-primary-200 dark:border-white text-primary-800 dark:text-white">
                      <div className="w-11 h-11 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-full bg-primary-50 dark:bg-black text-primary-700 dark:text-white flex items-center justify-center border border-transparent dark:border-white/20">
                        <Icon name={s.icon} size={20} />
                      </div>
                      <h3 className="font-bold text-primary-900 dark:text-white text-xs sm:text-base mb-0.5 leading-tight">{s.title}</h3>
                      <p className="text-xs sm:text-sm text-primary-500 dark:text-white leading-snug">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Blog — از /api/blog (منتشرشده) */}
            {homeBlogs.length > 0 && (
            <section className="py-8 sm:py-12 bg-primary-50 dark:bg-primary-950 transition-colors">
              <div className="max-w-7xl mx-auto px-3 sm:px-4">
                <div className="flex items-center justify-between mb-5 sm:mb-8 gap-3">
                  <h2 className="text-lg sm:text-xl font-bold leading-tight text-primary-900 dark:text-white">مجله پیراهن مردانه</h2>
                  <button
                    type="button"
                    onClick={() => { try { openStaticPage('blog'); } catch (_) {} }}
                    className="text-xs sm:text-sm text-apple-link hover:underline flex items-center gap-1 flex-shrink-0"
                  >
                    مشاهده همه
                    <Icon name="chevronLeft" size={14} />
                  </button>
                </div>
                <div className="relative">
                  <CarouselArrows trackRef={blogsTrackRef} />
                  <div ref={blogsTrackRef} className="carousel-track flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth snap-x px-0 sm:px-10" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {homeBlogs.map((b) => (
                      <article
                        key={b.id || b.slug || b.title}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          try {
                            if (b.id) openStaticPage('blog-post', { blogId: b.id, slug: b.slug || '' });
                            else openStaticPage('blog');
                          } catch (_) {
                            try { openStaticPage('blog'); } catch (__) {}
                          }
                        }}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.click(); }}
                        className="gsap-blog flex-shrink-0 w-[78%] min-[400px]:w-[70%] sm:w-[42%] md:w-[calc((100%-2.5rem)/3.3)] lg:w-[calc((100%-3.5rem)/4.3)] bg-white dark:bg-black rounded-xl sm:rounded-2xl overflow-hidden border border-primary-200 dark:border-white shadow-sm hover:shadow-md transition group snap-start cursor-pointer text-right"
                      >
                        <div className="aspect-video overflow-hidden bg-primary-100 dark:bg-primary-800">
                          <img
                            src={b.image}
                            alt={b.title}
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/default-avatar.svg'; }}
                            className="w-full h-full object-cover group-hover:opacity-95 transition duration-500"
                          />
                        </div>
                        <div className="p-3.5 sm:p-5">
                          {b.category ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                try { if (typeof setFaqQuery === 'function') setFaqQuery(b.category); } catch (_) {}
                                try { openStaticPage('blog'); } catch (_) {}
                              }}
                              className="inline-flex self-start items-center h-6 px-2 mb-1.5 rounded-md bg-primary-100 dark:bg-primary-700 text-primary-900 dark:text-white text-xs font-medium hover:bg-primary-200 dark:hover:bg-primary-600 transition"
                            >{b.category}</button>
                          ) : null}
                          <h3 className="text-base font-bold text-primary-900 dark:text-white mt-1 mb-1.5 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-white transition" title={b.title}>{b.title}</h3>
                          <p className="text-xs text-primary-500 dark:text-white mb-1">{b.author}</p>
                          {b.date ? <time className="text-xs text-primary-400 dark:text-white/70">{b.date}</time> : null}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            )}

            {/* Become a seller CTA — photo + text, palette only */}
            <section className="py-6 sm:py-8 bg-white dark:bg-primary-900 transition-colors">
              <div className="max-w-7xl mx-auto px-3 sm:px-4">
                <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl min-h-[180px] sm:min-h-[220px]">
                  <img
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=500&fit=crop&q=80&fm=webp"
                    alt="شما هم فروشنده شوید"
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy" decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-black/85 via-black/70 to-black/45" />
                  <div className="relative z-10 w-full box-border px-4 py-6 sm:px-10 sm:py-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-5 min-h-[180px] sm:min-h-[220px]">
                    <div className="max-w-xl w-full min-w-0">
                      <h2 className="text-lg sm:text-xl font-bold leading-tight text-white [text-shadow:0_2px_14px_rgba(0,0,0,1),0_1px_4px_rgba(0,0,0,1)]">شما هم فروشنده شوید</h2>
                      <p className="mt-2 text-sm sm:text-base text-white/95 leading-relaxed [text-shadow:0_1px_10px_rgba(0,0,0,0.95),0_1px_2px_rgba(0,0,0,1)]">
                        محصولات خود را در این مارکت‌پلیس عرضه کنید و به هزاران مشتری دسترسی پیدا کنید. ثبت‌نام ساده و مدیریت آسان سفارش‌ها.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { if (sellerUser) openSellerPanel(); else openStaticPage('become-seller'); }}
                      className="seller-banner-cta w-full sm:w-auto max-w-full inline-flex items-center justify-center gap-2 bg-[#FF0000] dark:bg-[#13ABC4] !text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold text-sm shadow-md border border-[#FF0000] dark:border-[#13ABC4] hover:bg-[#AF0404] dark:hover:bg-[#3161A3] hover:!text-white active:opacity-90 transition"
                    >
                      {sellerUser ? 'ورود به پنل فروشنده' : 'شروع فروش'}
                      <Icon name="arrowLeft" size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Newsletter */}
            <div id="home-newsletter-track-row" className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-stretch w-full max-w-7xl mx-auto px-3 sm:px-4 py-6 md:py-8">
            {/* Newsletter */}
            <section className="gsap-newsletter h-full rounded-2xl bg-primary-50 dark:bg-primary-900 text-primary-800 dark:text-primary-100 transition-colors border border-primary-100 dark:border-white/10">
              <div className="flex flex-col items-center text-center h-full p-6 sm:p-8">
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-black text-primary-700 dark:text-white flex items-center justify-center flex-shrink-0">
                  <Icon name="phone" size={22} />
                </div>
                <h2 className="mt-3 text-lg sm:text-xl font-bold text-primary-900 dark:text-white text-center leading-snug">
                  از تخفیف‌های ما باخبر شوید
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-primary-500 dark:text-white/70 text-center leading-relaxed min-h-[2.75rem]">
                  تخفیف‌های ویژه و پیشنهادهای شگفت‌انگیز را زودتر از همه دریافت کنید.
                </p>
                <div className="mt-auto pt-5 flex w-full max-w-md gap-2 flex-row justify-center items-center">
                  <button
                    type="button"
                    onClick={async () => {
                      const raw = String(newsletterPhone || '').trim();
                      const digits = raw.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/\D/g, '');
                      let phone = digits;
                      if (phone.startsWith('98') && phone.length === 12) phone = '0' + phone.slice(2);
                      if (phone.startsWith('9') && phone.length === 10) phone = '0' + phone;
                      if (!/^09\d{9}$/.test(phone)) {
                        try { showToast({ message: 'شماره موبایل معتبر وارد کنید (مثال: ۰۹۱۲۱۲۳۴۵۶۷)', variant: 'error', duration: 4000, position: 'top-center' }); } catch (_) {}
                        try { pushLiveToast('شماره موبایل معتبر نیست', { type: 'error', duration: 3500 }); } catch (_) {}
                        return;
                      }
                      try {
                        const res = await fetch('/api/club', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ phone, source: 'home_newsletter' }),
                        });
                        const data = await res.json().catch(() => ({}));
                        if (!res.ok || data.ok === false) {
                          try { showToast({ message: data.error || 'ثبت ناموفق', variant: 'error', duration: 4000, position: 'top-center' }); } catch (_) {}
                          return;
                        }
                        try {
                          const prev = JSON.parse(localStorage.getItem('newsletterPhones') || '[]');
                          const list = Array.isArray(prev) ? prev : [];
                          if (!list.some((x) => (x && x.phone) === phone || x === phone)) {
                            list.unshift({ phone, at: Date.now() });
                            localStorage.setItem('newsletterPhones', JSON.stringify(list.slice(0, 200)));
                          }
                        } catch (_) {}
                        setNewsletterPhone('');
                        try { showToast({ message: 'شماره شما ثبت شد. از تخفیف‌ها باخبر می‌شوید.', variant: 'success', duration: 4000, position: 'top-center' }); } catch (_) {}
                        try { pushLiveToast('شماره با موفقیت ثبت شد', { type: 'success', duration: 3500 }); } catch (_) {}
                      } catch (_) {
                        try { showToast({ message: 'خطای شبکه', variant: 'error', duration: 3500, position: 'top-center' }); } catch (__) {}
                      }
                    }}
                    className="h-11 min-w-[7.5rem] px-5 rounded-full bg-apple-blue text-white text-sm font-bold hover:opacity-90 dark:bg-[#13ABC4] transition whitespace-nowrap flex-shrink-0 inline-flex items-center justify-center"
                  >
                    ثبت شماره
                  </button>
                  <input
                    type="tel"
                    inputMode="tel"
                    dir="ltr"
                    value={newsletterPhone}
                    onChange={(e) => setNewsletterPhone(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.currentTarget.parentElement?.querySelector('button')?.click();
                      }
                    }}
                    placeholder="09121234567"
                    className="flex-1 min-w-0 h-11 px-4 rounded-full bg-white dark:bg-primary-950 border border-primary-300 dark:border-white/40 text-primary-900 dark:text-white text-sm text-left focus:outline-none focus:border-apple-blue"
                  />
                </div>
              </div>
            </section>

            {/* پیگیری سفارش */}
            <section id="home-track-order" className="h-full rounded-2xl bg-primary-50 dark:bg-primary-900 text-primary-800 dark:text-primary-100 transition-colors border border-primary-100 dark:border-white/10">
              <div className="flex flex-col items-center text-center h-full p-6 sm:p-8">
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-black text-primary-700 dark:text-white flex items-center justify-center flex-shrink-0">
                  <Icon name="package" size={22} />
                </div>
                <h2 className="mt-3 text-lg sm:text-xl font-bold text-primary-900 dark:text-white text-center leading-snug">
                  پیگیری سفارش
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-primary-500 dark:text-white/70 text-center leading-relaxed min-h-[2.75rem]">
                  شماره سفارش یا کد رهگیری را وارد کنید
                </p>
                <div className="mt-auto pt-5 flex w-full max-w-md gap-2 flex-row justify-center items-center" dir="ltr">
                  <input
                    type="text"
                    dir="ltr"
                    id="home-track-code"
                    placeholder=""
                    className="flex-1 min-w-0 h-11 px-4 rounded-full bg-white dark:bg-primary-950 border border-primary-300 dark:border-white/40 text-primary-900 dark:text-white text-sm text-left focus:outline-none focus:border-apple-blue"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('home-track-code');
                      const code = (el && el.value) ? el.value.trim() : '';
                      try {
                        if (typeof setPublicTrackCode === 'function') setPublicTrackCode(code);
                        if (typeof setPublicTrackOpen === 'function') setPublicTrackOpen(true);
                      } catch (_) {}
                    }}
                    className="h-11 min-w-[7.5rem] px-5 rounded-full bg-apple-blue text-white text-sm font-bold hover:opacity-90 dark:bg-[#13ABC4] transition whitespace-nowrap flex-shrink-0 inline-flex items-center justify-center"
                  >
                    پیگیری
                  </button>
                </div>
              </div>
            </section>
          </div>

          </main>
          </>
          )}

          {/* ========== صفحات ثابت / لندینگ ========== */}
    </>
  );
}
