'use client';

import { useAppApi } from '../AppApiContext';
import { Breadcrumb } from '../ui/breadcrumb';

/** PdpView — code-split from App.jsx */
export default function PdpView() {
  const {
    Icon,
    OWN_SELLER,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Textarea,
    addToCart,
    adminCatalogAttributes,
    assertNoUserLinks,
    closePDP,
    compare,
    dark,
    findProductVariant,
    getAttrDimensions,
    getVariantPrice,
    getVariantStock,
    isFavorite,
    onlyDigits,
    openCategory,
    openPDP,
    isProductFastShip,
    openPLP,
    openSeller,
    openStaticPage,
    pdpAttrs,
    pdpColorIdx,
    pdpExpress,
    pdpGalleryIdx,
    pdpGiftWrap,
    pdpHeight,
    pdpNotifyOpen,
    pdpProduct,
    pdpQText,
    pdpQaFilter,
    pdpQty,
    pdpReviewFilter,
    pdpSize,
    pdpSizeRec,
    pdpSizeRecOpen,
    pdpSticky,
    pdpTab,
    pdpTouchX,
    pdpWeight,
    pdpZoom,
    products,
    recentlyViewed,
    renderProductCard,
    renderShareBar,
    setPdpAttrs,
    setPdpColorIdx,
    setPdpExpress,
    setPdpGalleryIdx,
    setPdpGiftWrap,
    setPdpHeight,
    setPdpNotifyOpen,
    setPdpQText,
    setPdpQaFilter,
    setPdpQty,
    setPdpReviewFilter,
    setPdpSize,
    setPdpSizeRecOpen,
    setPdpTab,
    setPdpTouchX,
    setPdpWeight,
    setPdpZoom,
    setSelectedSizes,
    setStockNotifyIds,
    showToast,
    stockNotifyIds,
    suggestSizeFromBody,
    toFa,
    toggleCompare,
    toggleFavorite,
    topSellers,
    allSizes,
    sampleReviews,
    sampleQuestions,
    sizeGuideTable,
    user
  } = useAppApi();

  return (
    <>
          {pdpProduct && (() => {
            const p = pdpProduct;
            const seller = p.seller || OWN_SELLER;
            const colors = p.colors || [];
            const activeColor = colors[pdpColorIdx] || colors[0] || { name: '', hex: '#ccc', image: '' };
            const sizes = Array.isArray(p.sizes) && p.sizes.length ? p.sizes : (Array.isArray(allSizes) ? allSizes : ['S','M','L','XL']);
            const activeSize = pdpSize || sizes[0] || 'M';
            const attrDims = getAttrDimensions(p.attributes || {}, adminCatalogAttributes || []);
            const activeAttrs = { ...pdpAttrs };
            attrDims.forEach(d => { if (!activeAttrs[d.id] && d.options?.[0]) activeAttrs[d.id] = d.options[0]; });
            const activeVariant = findProductVariant(p, activeColor.name, activeSize, activeAttrs);
            const variantPrice = getVariantPrice(p, activeColor.name, activeSize, activeAttrs);
            const variantStock = getVariantStock(p, activeColor.name, activeSize, activeAttrs);
            const variantPriceText = toFa(Number(variantPrice).toLocaleString());
            const variantNote = (activeVariant?.note || '').trim();
            const variantImage = (activeVariant?.image || '').trim();
            const galleryImages = [
              ...(variantImage ? [variantImage] : []),
              ...((p.images || []).filter(Boolean)),
              ...(colors.map(c => c.image).filter(Boolean)),
            ].filter((u, i, arr) => u && arr.indexOf(u) === i);
            const mainImg = galleryImages[Math.min(pdpGalleryIdx, Math.max(0, galleryImages.length - 1))] || variantImage || activeColor.image || (p.images || [])[0] || '';
            const isFav = isFavorite(p.id);
            const inCompare = compare.find(c => c.id === p.id);
            const stockOk = p.inStock !== false && variantStock > 0;
            const lowStock = stockOk && variantStock <= 5;
            const filteredReviews = sampleReviews.filter(r => {
              if (pdpReviewFilter === 'photo') return r.hasPhoto;
              if (pdpReviewFilter === 'positive') return r.rating >= 4;
              if (pdpReviewFilter === 'negative') return r.rating <= 2;
              return true;
            });
            const filteredQs = sampleQuestions.filter(q => pdpQaFilter === 'answered' ? q.answered : true);
            const similar = products.filter(x => x.id !== p.id && (x.category === p.category || (x.colors||[]).some(c => c.name === activeColor.name))).slice(0, 8);
            const fromSeller = products.filter(x => x.id !== p.id && (x.seller?.id || 'own') === (seller.id || 'own')).slice(0, 8);
            const ratingDist = { 5: 42, 4: 28, 3: 12, 2: 5, 1: 3 };
            const shareText = encodeURIComponent(`${p.name} - ${variantPriceText} تومان\n${typeof window !== 'undefined' ? window.location.href : ''}`);
            const fullSeller = topSellers.find(s => s.id === (seller.id || 'own')) || { ...seller, products: 48, badges: ['ارسال سریع', 'ضمانت اصالت'], image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=200&h=200&fit=crop' };

            return (
              <div className="flex-1 flex flex-col bg-primary-50 dark:bg-primary-950 pb-24 sm:pb-8">
                {/* SEO Structured Data */}
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                      '@context': 'https://schema.org/',
                      '@type': 'Product',
                      name: p.name,
                      image: galleryImages,
                      description: p.description,
                      sku: p.sku,
                      brand: { '@type': 'Brand', name: seller.name || 'پیراهن مردانه' },
                      offers: {
                        '@type': 'Offer',
                        url: typeof window !== 'undefined' ? window.location.href : '',
                        priceCurrency: 'IRR',
                        price: p.price,
                        availability: stockOk ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                        seller: { '@type': 'Organization', name: seller.name },
                      },
                      aggregateRating: p.reviews ? {
                        '@type': 'AggregateRating',
                        ratingValue: p.rating,
                        reviewCount: p.reviews,
                      } : undefined,
                    }),
                  }}
                />
                {/* Breadcrumb */}
                <Breadcrumb
                  homeOnClick={() => { closePDP(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  items={[
                    { label: 'فروشگاه', onClick: () => { closePDP(); openPLP(); } },
                    { label: p.category, onClick: () => { closePDP(); openCategory(p.category); } },
                    { label: p.name, current: true },
                  ]}
                />

                {/* Sticky desktop bar */}
                {pdpSticky && (
                  <div className="hidden sm:block sticky top-[52px] sm:top-[60px] z-40 bg-white/95 dark:bg-primary-950/95 backdrop-blur-xl border-b border-primary-100 dark:border-white/15 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-4">
                      <img src={mainImg} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-primary-900 dark:text-white truncate">{p.name}</p>
                        <p className="text-xs text-primary-500">{p.priceText} تومان</p>
                      </div>
                      <button type="button" onClick={() => addToCart(p, { colorIdx: pdpColorIdx, size: pdpSize || '', qty: pdpQty, attrs: activeAttrs, requireSize: true })} disabled={!stockOk || (sizes.length > 0 && !pdpSize)} className={`px-5 py-2 rounded-full text-sm font-medium ${stockOk && !(sizes.length > 0 && !pdpSize) ? 'bg-apple-blue text-white hover:opacity-90' : 'bg-primary-300 text-primary-600 cursor-not-allowed'}`}>افزودن به سبد</button>
                    </div>
                  </div>
                )}

                <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 w-full">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-10">
                    {/* ——— Gallery ——— */}
                    <div className="relative">
                      <div
                        className="relative aspect-[4/5] sm:aspect-square rounded-2xl overflow-hidden bg-primary-100 dark:bg-primary-900 border border-primary-100 dark:border-white/10 touch-pan-y"
                        onTouchStart={(e) => setPdpTouchX(e.changedTouches[0].clientX)}
                        onTouchEnd={(e) => {
                          if (pdpTouchX == null || galleryImages.length < 2) return;
                          const dx = e.changedTouches[0].clientX - pdpTouchX;
                          if (Math.abs(dx) > 40) {
                            if (dx > 0) setPdpGalleryIdx(i => (i - 1 + galleryImages.length) % galleryImages.length);
                            else setPdpGalleryIdx(i => (i + 1) % galleryImages.length);
                          }
                          setPdpTouchX(null);
                        }}
                      >
                        <img
                          src={mainImg}
                          alt={`${p.name} - ${activeColor.name}`}
                          className={`w-full h-full object-cover transition duration-300 cursor-zoom-in origin-center sm: ${pdpZoom ? 'scale-150 sm:scale-[1.75]' : ''}`}
                          onClick={() => setPdpZoom(z => !z)}
                          onMouseLeave={() => { if (pdpZoom) setPdpZoom(false); }}
                          draggable={false}
                        />
                        <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs bg-black/50 text-white px-2 py-0.5 rounded-full pointer-events-none hidden sm:block">کلیک برای زوم · هاور برای بزرگنمایی</p>
                        {/* Badges — هم‌عرض و چسبیده به راست */}
                        <div className="product-card-badges absolute top-3 right-3 z-10 flex flex-col items-stretch gap-1.5 w-max max-w-[40%] pointer-events-none">
                          {p.discount ? (
                            <span className="product-card-badge bg-apple-blue text-white text-xs font-bold px-2 py-0.5 rounded-md shadow text-center whitespace-nowrap">{toFa(p.discount)}٪ تخفیف</span>
                          ) : null}
                          {p.amazing && <span className="product-card-badge bg-gradient-to-l from-amber-500 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-md shadow text-center whitespace-nowrap">شگفت‌انگیز</span>}
                          {p.popular && !p.amazing && <span className="product-card-badge bg-amber-500 text-white text-xs font-medium px-2 py-0.5 rounded-md shadow text-center whitespace-nowrap">پرفروش</span>}
                          {(isProductFastShip ? isProductFastShip(p) : p.fastShip) && <span className="product-card-badge bg-emerald-600 text-white text-xs font-medium px-2 py-0.5 rounded-md shadow text-center whitespace-nowrap">ارسال سریع</span>}
                          {!stockOk && <span className="product-card-badge bg-primary-800 text-white text-xs font-medium px-2 py-0.5 rounded-md shadow text-center whitespace-nowrap">ناموجود</span>}
                        </div>
                        {/* Action buttons on image */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                          <button type="button" onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id); }} className={`w-9 h-9 rounded-full shadow-md flex items-center justify-center ${isFav ? 'bg-apple-blue text-white' : 'bg-white/95 dark:bg-primary-900 text-primary-600 dark:text-white'}`} aria-label="علاقه‌مندی">
                            <Icon name={isFav ? 'heartFilled' : 'heart'} size={16} />
                          </button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); toggleCompare(p); }} className={`w-9 h-9 rounded-full shadow-md flex items-center justify-center ${inCompare ? 'bg-apple-blue text-white' : 'bg-white/95 dark:bg-primary-900 text-primary-600 dark:text-white'}`} aria-label="مقایسه">
                            <Icon name="scale" size={16} />
                          </button>
                          <a href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="w-9 h-9 rounded-full shadow-md flex items-center justify-center bg-white/95 dark:bg-primary-900 text-primary-600 dark:text-white" aria-label="اشتراک‌گذاری">
                            <Icon name="share" size={16} />
                          </a>
                        </div>
                        {/* Gallery arrows */}
                        {galleryImages.length > 1 && (
                          <>
                            <button type="button" onClick={() => setPdpGalleryIdx(i => (i - 1 + galleryImages.length) % galleryImages.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 dark:bg-primary-800 shadow flex items-center justify-center text-primary-700 dark:text-white">
                              <Icon name="chevronRight" size={16} />
                            </button>
                            <button type="button" onClick={() => setPdpGalleryIdx(i => (i + 1) % galleryImages.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 dark:bg-primary-800 shadow flex items-center justify-center text-primary-700 dark:text-white">
                              <Icon name="chevronLeft" size={16} />
                            </button>
                          </>
                        )}
                      </div>
                      {/* Thumbnails */}
                      {galleryImages.length > 1 && (
                        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
                          {galleryImages.map((img, i) => (
                            <button key={i} type="button" onClick={() => { setPdpGalleryIdx(i); setPdpColorIdx(Math.min(i, colors.length - 1)); }} className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition ${pdpGalleryIdx === i ? 'border-apple-blue ring-2 ring-apple-blue/30' : 'border-primary-200 dark:border-white/20'}`}>
                              <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* دسکتاپ: اعتماد + ارسال + فروشنده زیر تامبنیل */}
                      <div className="hidden lg:block mt-5 space-y-3">
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { icon: 'badge', t: 'ضمانت اصالت' },
                            { icon: 'refresh', t: '۷ روز بازگشت' },
                            { icon: 'truck', t: 'ارسال سریع' },
                            { icon: 'shield', t: 'پرداخت امن' },
                          ].map(item => (
                            <div key={item.t} className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-primary-900 border border-primary-100 dark:border-white/15">
                              <span className="trust-icon-wrap inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-800 border border-primary-200 dark:border-white/30 flex-shrink-0">
                                <Icon name={item.icon} size={15} className="text-apple-blue dark:text-[#13ABC4]" />
                              </span>
                              <span className="text-xs font-medium text-primary-800 dark:!text-white">{item.t}</span>
                            </div>
                          ))}
                        </div>
                        <div className="p-3.5 rounded-xl bg-white dark:bg-primary-900 border border-primary-100 dark:border-white/10 text-xs text-primary-600 dark:text-white/70 space-y-1.5">
                          <p className="flex items-center gap-2"><Icon name="truck" size={14} /> ارسال تقریبی: ۱ تا ۳ روز کاری</p>
                          <p>هزینه ارسال بر اساس روش انتخابی در تسویه حساب محاسبه می‌شود</p>
                          <p>مبدأ ارسال: {fullSeller.city || 'تهران'}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white dark:bg-primary-900 border border-primary-100 dark:border-white/10">
                          <div className="flex items-center gap-3">
                            <img src={fullSeller.image || fullSeller.banner} alt="" className="w-12 h-12 rounded-xl object-cover" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-primary-900 dark:text-white truncate">{fullSeller.name}</p>
                              <p className="text-xs text-primary-500 dark:!text-white">{toFa(Number(fullSeller.rating || seller.rating || 0).toFixed(1))}★ · {toFa(fullSeller.products || 0)} محصول</p>
                            </div>
                            <button type="button" onClick={() => { closePDP(); openSeller(seller.id || 'own'); }} className="px-3 py-1.5 rounded-full text-xs font-medium border border-primary-200 dark:border-white/30 text-primary-800 dark:text-white hover:bg-primary-50 dark:hover:bg-primary-800">
                              مشاهده فروشگاه
                            </button>
                          </div>
                          {fullSeller.badges?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {fullSeller.badges.map(b => (
                                <span key={b} className="text-xs px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-800 text-primary-700 dark:text-white/80">{b}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ——— Info column ——— */}
                    <div className="flex flex-col">
                      <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-white leading-snug">{p.name}</h1>
                      {p.productCode && <p className="text-xs text-primary-400 dark:text-white/50 font-latin mt-1" dir="ltr">کد: {p.productCode}</p>}
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs sm:text-sm">
                        <button type="button" onClick={() => { closePDP(); openCategory(p.category); }} className="text-apple-blue dark:text-[#13ABC4] hover:underline">{p.category}</button>
                        <span className="text-primary-300">·</span>
                        <button type="button" onClick={() => { closePDP(); openSeller(seller.id || 'own'); }} className="text-primary-600 dark:text-white/80 hover:underline">فروشنده: {seller.name}</button>
                        <span className="text-primary-300">·</span>
                        <span className="text-primary-400 dark:!text-white">کد: {p.sku || `PM-${p.id}`}</span>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(n => (
                            <Icon key={n} name={n <= Math.round(p.rating || 0) ? 'starFilled' : 'star'} size={16} className={n <= Math.round(p.rating || 0) ? 'text-amber-400' : 'text-primary-200 dark:text-primary-600'} />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-primary-800 dark:text-white">{toFa(Number(p.rating || 0).toFixed(1))}</span>
                        <span className="text-xs text-primary-500 dark:!text-white">({toFa(p.reviews || 0)} نظر)</span>
                        {fullSeller.rating && (
                          <span className="text-xs text-primary-400 dark:!text-white mr-1">· امتیاز فروشنده {toFa(Number(fullSeller.rating).toFixed(1))}</span>
                        )}
                      </div>

                      {/* Social proof */}
                      {p.soldRecent > 0 && (
                        <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 inline-flex self-start px-2.5 py-1 rounded-full">
                          {toFa(p.soldRecent)} نفر در ۷ روز گذشته خریده‌اند
                        </p>
                      )}

                      {/* Price */}
                      <div className="mt-4 p-4 rounded-2xl bg-white dark:bg-primary-900 border border-primary-100 dark:border-white/10">
                        <div className="flex items-end gap-3 flex-wrap">
                          <p className="text-2xl sm:text-3xl font-bold text-primary-900 dark:text-white">{variantPriceText} <span className="text-sm font-normal text-primary-500">تومان</span></p>
                          {p.oldPrice && (
                            <div className="flex items-center gap-2 pb-1">
                              <span className="text-sm text-primary-400 line-through">{p.oldPrice}</span>
                              {p.discount && <span className="text-xs font-bold text-white bg-red-500 px-1.5 py-0.5 rounded">{toFa(p.discount)}٪</span>}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-primary-400 dark:!text-white mt-1">قیمت برای ۱ عدد</p>
                        {p.oldPrice && (
                          <p className="text-xs text-primary-500 mt-1">قیمت قبلی: {p.oldPrice} تومان</p>
                        )}
                        {p.installment && (
                          <p className="text-xs text-apple-blue dark:text-[#13ABC4] mt-2 font-medium">
                            اقساط ۴ ماهه: از {toFa(Math.round(p.installment / 1000))}٬۰۰۰ تومان / ماه
                          </p>
                        )}
                        {/* تاریخچه قیمت — نمودار روند (شبیه ترب) */}
                        {p.priceHistory && p.priceHistory.length > 0 && (() => {
                          const hist = p.priceHistory;
                          const maxP = Math.max(...hist.map(x => x.price));
                          const minP = Math.min(...hist.map(x => x.price));
                          const range = maxP - minP || 1;
                          const w = 280;
                          const h = 100;
                          const padX = 8;
                          const padY = 12;
                          const pts = hist.map((item, i) => {
                            const x = padX + (i / (hist.length - 1)) * (w - padX * 2);
                            const y = padY + (1 - (item.price - minP) / range) * (h - padY * 2);
                            return { x, y, ...item };
                          });
                          const lineD = pts.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ');
                          const areaD = `${lineD} L ${pts[pts.length - 1].x} ${h} L ${pts[0].x} ${h} Z`;
                          const dropPct = maxP > 0 ? Math.round(((maxP - p.price) / maxP) * 100) : 0;
                          return (
                            <div className="mt-4 pt-4 border-t border-primary-100 dark:border-white/10">
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-bold text-primary-800 dark:text-white">تاریخچه قیمت</p>
                                {dropPct > 0 && (
                                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                                    {toFa(dropPct)}٪ ارزان‌تر از بالاترین
                                  </span>
                                )}
                              </div>
                              <div className="rounded-xl bg-primary-50 dark:bg-primary-950 border border-primary-100 dark:border-white/10 p-3 sm:p-4">
                                <svg viewBox={`0 0 ${w} ${h + 28}`} className="w-full h-auto" style={{ minHeight: '140px' }} role="img" aria-label="نمودار روند قیمت">
                                  {/* grid lines */}
                                  {[0, 0.25, 0.5, 0.75, 1].map((t, gi) => {
                                    const gy = padY + t * (h - padY * 2);
                                    return <line key={gi} x1={padX} y1={gy} x2={w - padX} y2={gy} stroke="currentColor" className="text-primary-200 dark:text-white/10" strokeWidth="1" strokeDasharray="4 4" />;
                                  })}
                                  {/* area fill */}
                                  <path d={areaD} fill="url(#priceGrad)" opacity="0.35" />
                                  <defs>
                                    <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#0071e3" stopOpacity="0.5" />
                                      <stop offset="100%" stopColor="#0071e3" stopOpacity="0" />
                                    </linearGradient>
                                  </defs>
                                  {/* line */}
                                  <path d={lineD} fill="none" stroke="#0071e3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="dark:stroke-[#FF0000]" />
                                  {/* points */}
                                  {pts.map((pt, i) => (
                                    <g key={i}>
                                      <circle cx={pt.x} cy={pt.y} r={i === pts.length - 1 ? 5 : 3.5} fill={i === pts.length - 1 ? '#0071e3' : '#fff'} stroke="#0071e3" strokeWidth="2" className="dark:stroke-[#FF0000]" style={i === pts.length - 1 ? { fill: '#0071e3' } : {}} />
                                      {i === pts.length - 1 && (
                                        <text x={pt.x} y={pt.y - 10} textAnchor="middle" className="fill-primary-800 dark:fill-white" style={{ fontSize: '11px', fontWeight: 700 }}>
                                          {toFa((pt.price).toLocaleString('en-US'))}
                                        </text>
                                      )}
                                    </g>
                                  ))}
                                  {/* x labels */}
                                  {pts.map((pt, i) => (
                                    <text key={`l-${i}`} x={pt.x} y={h + 18} textAnchor="middle" className="fill-primary-500 dark:fill-white/50" style={{ fontSize: '10px' }}>
                                      {pt.label}
                                    </text>
                                  ))}
                                </svg>
                                <div className="flex flex-wrap items-center justify-between gap-2 mt-2 text-xs sm:text-sm text-primary-600 dark:text-white/70">
                                  <span>کمینه: <strong className="text-primary-900 dark:text-white">{toFa(minP.toLocaleString('en-US'))}</strong> تومان</span>
                                  <span>بیشینه: <strong className="text-primary-900 dark:text-white">{toFa(maxP.toLocaleString('en-US'))}</strong> تومان</span>
                                </div>
                                {p.oldPrice && (
                                  <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                                    قیمت فعلی نسبت به ۶ ماه گذشته روند کاهشی داشته است.
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* انتخاب ویژگی‌ها */}
                      <div className="mt-5 p-4 rounded-2xl bg-white dark:bg-primary-900 border border-primary-100 dark:border-white/10 space-y-5">
                      {/* Color */}
                      <div>
                        <p className="text-xs font-bold text-primary-600 dark:text-white/70 mb-2">رنگ: <span className="text-primary-900 dark:text-white font-medium">{activeColor.name}</span></p>
                        <div className="flex flex-wrap gap-2">
                          {colors.map((c, i) => (
                            <button
                              key={c.name}
                              type="button"
                              title={c.name}
                              onClick={() => { setPdpColorIdx(i); setPdpGalleryIdx(0); }}
                              className={`color-swatch w-9 h-9 rounded-full border-2 transition relative ${pdpColorIdx === i ? 'color-swatch--active border-apple-blue' : 'border-primary-200 dark:border-white/60'}`}
                              style={{ ["--swatch-color"]: c.hex || '#888', backgroundColor: c.hex || '#888' }}
                            >
                              {(c.name === 'سفید' || c.name === 'کرم') && <span className="absolute inset-0 rounded-full border border-primary-200" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Size */}
                      <div className="mt-5" id="pdp-size-section">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold text-primary-600 dark:text-white/70">سایز <span className="text-red-500">*</span></p>
                          <button type="button" onClick={() => openStaticPage('size-guide')} className="text-xs text-apple-blue dark:text-[#13ABC4] hover:underline">راهنمای سایز</button>
                        </div>
                        {!pdpSize && sizes.length > 0 && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">برای افزودن به سبد، یک سایز انتخاب کنید</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {sizes.map(sz => {
                            const szStock = getVariantStock(p, activeColor.name, sz, activeAttrs);
                            const disabled = szStock <= 0;
                            const on = pdpSize === sz;
                            return (
                              <button
                                key={sz}
                                type="button"
                                disabled={disabled}
                                title={disabled ? 'ناموجود' : `موجودی: ${toFa(szStock)}`}
                                onClick={() => { setPdpSize(sz); setSelectedSizes(prev => ({ ...prev, [p.id]: sz })); setPdpGalleryIdx(0); }}
                                dir="ltr" lang="en"
                                className={`latin-label size-chip min-w-[2.75rem] px-3 py-2 rounded-xl text-sm font-medium border transition ${disabled ? 'opacity-40 cursor-not-allowed border-primary-200 text-primary-400 line-through' : on ? 'size-chip--active bg-primary-800 text-white border-primary-800 dark:bg-[#13ABC4] dark:!text-white dark:border-[#13ABC4]' : 'border-primary-200 dark:border-white/30 text-primary-800 dark:!text-white hover:border-primary-400'}`}
                              >{sz}</button>
                            );
                          })}
                        </div>
                        {p.modelInfo && <p className="text-xs text-primary-400 mt-2">{p.modelInfo}</p>}
                        <button type="button" onClick={() => setPdpSizeRecOpen(v => !v)} className="mt-2 text-xs text-apple-blue dark:text-[#13ABC4] hover:underline">پیشنهاد سایز بر اساس قد و وزن</button>
                        {pdpSizeRecOpen && (
                          <div className="mt-2 p-3 rounded-xl bg-primary-50 dark:bg-primary-900 border border-primary-100 dark:border-white/10 space-y-2">
                            <div className="flex gap-2">
                              <input type="number" placeholder="قد (سانتی‌متر)" value={pdpHeight} onChange={e => setPdpHeight(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white" />
                              <input type="number" placeholder="وزن (کیلو)" value={pdpWeight} onChange={e => setPdpWeight(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white" />
                            </div>
                            <button type="button" onClick={suggestSizeFromBody} className="btn-cta w-full py-2 rounded-lg bg-primary-800 dark:bg-[#13ABC4] text-white dark:text-white text-xs font-medium">محاسبه سایز</button>
                            {pdpSizeRec && <p className="text-xs text-center text-emerald-700 dark:text-emerald-400">سایز پیشنهادی: <strong>{pdpSizeRec}</strong></p>}
                          </div>
                        )}
                      </div>

                      {/* ویژگی‌های متغیر */}
                      {attrDims.map(dim => (
                        <div key={dim.id} className="mt-5">
                          <p className="text-xs font-bold text-primary-600 dark:text-white/70 mb-2">{dim.name}: <span className="text-primary-900 dark:text-white font-medium">{activeAttrs[dim.id] || dim.options[0]}</span></p>
                          <div className="flex flex-wrap gap-2">
                            {dim.options.map(opt => {
                              const on = (activeAttrs[dim.id] || dim.options[0]) === opt;
                              const optAttrs = { ...activeAttrs, [dim.id]: opt };
                              const optStock = getVariantStock(p, activeColor.name, activeSize, optAttrs);
                              const gone = optStock <= 0;
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  disabled={gone}
                                  title={gone ? 'ناموجود' : `موجودی: ${toFa(optStock)}`}
                                  onClick={() => { setPdpAttrs(prev => ({ ...prev, [dim.id]: opt })); setPdpGalleryIdx(0); }}
                                  className={`min-w-[2.75rem] px-3 py-2 rounded-xl text-sm font-medium border transition ${gone ? 'opacity-40 cursor-not-allowed border-primary-200 text-primary-400 line-through' : on ? 'bg-primary-800 text-white border-primary-800 dark:bg-[#13ABC4] dark:!text-white dark:border-[#13ABC4]' : 'border-primary-200 dark:border-white/30 text-primary-800 dark:!text-white hover:border-primary-400'}`}
                                >{opt}</button>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      {/* Qty + stock */}
                      <div className="mt-5 flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1 border border-primary-200 dark:border-white/25 rounded-full">
                          <button type="button" onClick={() => setPdpQty(q => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center text-primary-900 dark:text-white hover:bg-primary-50 dark:hover:bg-primary-800 rounded-full" aria-label="کاهش تعداد">
                            <Icon name="minus" size={16} />
                          </button>
                          <span className="w-8 text-center text-sm font-medium tabular-nums text-primary-900 dark:text-white">{toFa(pdpQty)}</span>
                          <button type="button" onClick={() => setPdpQty(q => Math.min(Math.max(1, variantStock || 1), Math.min(10, q + 1)))} className="w-9 h-9 flex items-center justify-center text-primary-900 dark:text-white hover:bg-primary-50 dark:hover:bg-primary-800 rounded-full" aria-label="افزایش تعداد">
                            <Icon name="plus" size={16} />
                          </button>
                        </div>
                        {lowStock && <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">فقط {toFa(variantStock)} عدد از این ترکیب باقی مانده</span>}
                        {stockOk && !lowStock && <span className="text-xs text-emerald-600 dark:text-emerald-400">این ترکیب موجود است</span>}
                        {!stockOk && <span className="text-xs text-red-500">این ترکیب ناموجود است</span>}
                      </div>
                      {variantNote ? (
                        <div className="mt-4 p-3 rounded-xl border border-primary-100 dark:border-white/10 bg-primary-50/60 dark:bg-primary-900/50">
                          <p className="text-xs font-bold text-primary-700 dark:text-white mb-1">درباره این ترکیب</p>
                          <p className="text-sm text-primary-800 dark:text-white/90 leading-relaxed">{variantNote}</p>
                        </div>
                      ) : null}

                      {/* Gift + express */}
                      <div className="mt-4 space-y-2">
                        {p.giftWrap && (
                          <label className="flex items-center gap-2 text-xs text-primary-700 dark:text-white/80 cursor-pointer">
                            <input type="checkbox" checked={pdpGiftWrap} onChange={e => setPdpGiftWrap(e.target.checked)} className="rounded border-primary-300" />
                            بسته‌بندی هدیه
                          </label>
                        )}
                        {p.expressShipCost && (
                          <label className="flex items-center gap-2 text-xs text-primary-700 dark:text-white/80 cursor-pointer">
                            <input type="checkbox" checked={pdpExpress} onChange={e => setPdpExpress(e.target.checked)} className="rounded border-primary-300" />
                            ارسال سریع‌تر (+{toFa(Math.round(p.expressShipCost / 1000))} هزار تومان)
                          </label>
                        )}
                      </div>
                      </div>

                      {/* CTA */}
                      <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
                        {stockOk ? (
                          <button type="button" onClick={() => addToCart(p, { colorIdx: pdpColorIdx, size: pdpSize || '', qty: pdpQty, attrs: activeAttrs, requireSize: true })} className="flex-1 py-3 rounded-full bg-apple-blue text-white text-sm font-bold hover:opacity-90 transition shadow-md">
                            افزودن به سبد
                          </button>
                        ) : (
                          <button type="button" onClick={() => setPdpNotifyOpen(v => !v)} className="flex-1 py-3 rounded-full bg-primary-800 dark:bg-[#13ABC4] text-white dark:text-white text-sm font-bold">
                            خبرم کن وقتی موجود شد
                          </button>
                        )}
                      </div>
                      {pdpNotifyOpen && (
                        <div className="mt-2 p-3 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900">
                          {stockNotifyIds.includes(p.id) ? (
                            <p className="text-xs text-apple-blue text-center py-1">در لیست اطلاع‌رسانی هستید ✓</p>
                          ) : (
                            <>
                              <input type="tel" defaultValue={user?.phone || ''} placeholder="شماره موبایل" id="pdp-notify-phone" className="w-full px-3 py-2 rounded-lg border border-primary-200 dark:border-white/20 bg-primary-50 dark:bg-primary-950 text-sm mb-2 text-primary-900 dark:text-white" dir="ltr" />
                              <button type="button" onClick={() => {
                                const phone = onlyDigits(document.getElementById('pdp-notify-phone')?.value || '');
                                if (phone.length !== 11) { showToast({ message: 'شماره موبایل معتبر وارد کنید', variant: 'default', duration: 4500, position: 'top-center' }); return; }
                                const next = [...new Set([...stockNotifyIds, p.id])];
                                setStockNotifyIds(next);
                                try { localStorage.setItem('stockNotifyIds', JSON.stringify(next)); } catch (_) {}
                                setPdpNotifyOpen(false);
                                showToast({ message: 'ثبت شد؛ وقتی موجود شود پیامک می‌گیرید (دمو).', variant: 'success', duration: 4500, position: 'top-center' });
                              }} className="w-full py-2 rounded-lg bg-apple-blue text-white text-xs font-medium">ثبت اطلاع‌رسانی</button>
                            </>
                          )}
                        </div>
                      )}

                      {/* Return summary under CTA */}
                      <p className="mt-3 text-xs text-primary-500 dark:!text-white leading-relaxed">
                        ۷ روز ضمانت بازگشت کالا · ضمانت اصالت · ارسال از {fullSeller.city || 'تهران'}
                      </p>

                      {/* Trust bar — موبایل/تبلت */}
                      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 lg:hidden">
                        {[
                          { icon: 'badge', t: 'ضمانت اصالت' },
                          { icon: 'refresh', t: '۷ روز بازگشت' },
                          { icon: 'truck', t: 'ارسال سریع' },
                          { icon: 'shield', t: 'پرداخت امن' },
                        ].map(item => (
                          <div key={item.t} className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-primary-900 border border-primary-100 dark:border-white/15">
                            <span className="trust-icon-wrap inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-800 border border-primary-200 dark:border-white/30 flex-shrink-0">
                              <Icon name={item.icon} size={15} className="text-apple-blue dark:text-[#13ABC4]" />
                            </span>
                            <span className="text-xs font-medium text-primary-800 dark:!text-white">{item.t}</span>
                          </div>
                        ))}
                      </div>

                      {/* Shipping info — موبایل/تبلت */}
                      <div className="mt-4 p-3.5 rounded-xl bg-white dark:bg-primary-900 border border-primary-100 dark:border-white/10 text-xs text-primary-600 dark:text-white/70 space-y-1.5 lg:hidden">
                        <p className="flex items-center gap-2"><Icon name="truck" size={14} /> ارسال تقریبی: ۱ تا ۳ روز کاری</p>
                        <p>هزینه ارسال بر اساس روش انتخابی در تسویه حساب محاسبه می‌شود</p>
                        <p>مبدأ ارسال: {fullSeller.city || 'تهران'}</p>
                      </div>

                      {/* Seller card — موبایل/تبلت */}
                      <div className="mt-4 p-4 rounded-2xl bg-white dark:bg-primary-900 border border-primary-100 dark:border-white/10 lg:hidden">
                        <div className="flex items-center gap-3">
                          <img src={fullSeller.image || fullSeller.banner} alt="" className="w-12 h-12 rounded-xl object-cover" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-primary-900 dark:text-white truncate">{fullSeller.name}</p>
                            <p className="text-xs text-primary-500 dark:!text-white">{toFa(Number(fullSeller.rating || seller.rating || 0).toFixed(1))}★ · {toFa(fullSeller.products || 0)} محصول</p>
                          </div>
                          <button type="button" onClick={() => { closePDP(); openSeller(seller.id || 'own'); }} className="px-3 py-1.5 rounded-full text-xs font-medium border border-primary-200 dark:border-white/30 text-primary-800 dark:text-white hover:bg-primary-50 dark:hover:bg-primary-800">
                            مشاهده فروشگاه
                          </button>
                        </div>
                        {fullSeller.badges?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {fullSeller.badges.map(b => (
                              <span key={b} className="text-xs px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-800 text-primary-700 dark:text-white/80">{b}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Stylist note */}
                      <div className="mt-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
                        <strong className="font-bold">نظر استایلیست: </strong>
                        این مدل با شلوار پارچه‌ای تیره و کفش رسمی برای محیط اداری و مجالس روزانه انتخاب بسیار مناسبی است.
                      </div>
                    </div>
                  </div>

                  {/* Tabs: details */}
                  <div className="mt-8 sm:mt-10">
                    <div className="flex gap-1 overflow-x-auto no-scrollbar border-b border-primary-200 dark:border-white/15 mb-4">
                      {[
                        { id: 'desc', label: 'توضیحات' },
                        { id: 'specs', label: 'مشخصات' },
                        { id: 'care', label: 'نگهداری' },
                        { id: 'size', label: 'راهنمای سایز' },
                        { id: 'style', label: 'استایل' },
                      ].map(t => (
                        <button key={t.id} type="button" onClick={() => setPdpTab(t.id)} className={`flex-shrink-0 px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition ${pdpTab === t.id ? 'border-apple-blue text-apple-blue dark:border-[#13ABC4] dark:text-[#13ABC4]' : 'border-transparent text-primary-500 dark:!text-white hover:text-primary-800'}`}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                    <div className="bg-white dark:bg-black rounded-2xl border border-primary-100 dark:border-white/10 p-4 sm:p-6 text-sm text-primary-700 dark:text-white/80 leading-relaxed">
                      {pdpTab === 'desc' && (
                        <div className="space-y-3">
                          <p>{p.description}</p>
                          <p className="text-xs text-primary-500">مناسب: {p.season} · موقعیت اداری، رسمی و روزمره</p>
                          <p className="text-xs text-primary-500">جنس پارچه: {p.composition || p.fabric}</p>
                        </div>
                      )}
                      {pdpTab === 'specs' && (
                        <Table className="w-full text-xs sm:text-sm">
                          <TableBody>
                            {[
                              ['جنس پارچه', p.composition || p.fabric],
                              ['برش', p.fit],
                              ['یقه', p.collar],
                              ['آستین', p.sleeve],
                              ['فصل', p.season],
                              ['کشور تولید', p.origin],
                              ['کد محصول', p.productCode || p.sku],
                            ].map(([k, v]) => (
                              <TableRow key={k} className="border-b border-primary-50 dark:border-white/5">
                                <TableCell className="py-2.5 text-primary-500 dark:!text-white w-32">{k}</TableCell>
                                <TableCell className="py-2.5 font-medium text-primary-900 dark:text-white">{v}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                      {pdpTab === 'care' && (
                        <ul className="space-y-2">
                          {(p.care || []).map((c, i) => (
                            <li key={i} className="flex items-start gap-2"><span className="text-apple-blue mt-0.5">•</span>{c}</li>
                          ))}
                        </ul>
                      )}
                      {pdpTab === 'size' && (
                        <div>
                          <p className="text-xs text-primary-500 mb-3">اندازه‌ها به سانتی‌متر هستند. برای اندازه‌گیری دقیق، راهنمای زیر را ببینید.</p>
                          <div className="overflow-x-auto">
                            <Table className="w-full text-xs sm:text-sm min-w-[320px]">
                              <TableHeader>
                                <TableRow className="bg-primary-50 dark:bg-primary-800">
                                  <TableHead className="py-2 px-3 text-right font-bold">سایز</TableHead>
                                  <TableHead className="py-2 px-3 text-right font-bold">سینه</TableHead>
                                  <TableHead className="py-2 px-3 text-right font-bold">کمر</TableHead>
                                  <TableHead className="py-2 px-3 text-right font-bold">قد</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {sizeGuideTable.map(row => (
                                  <TableRow key={row.size} className={`border-b border-primary-50 dark:border-white/5 ${pdpSize === row.size ? 'bg-apple-blue/10' : ''}`}>
                                    <TableCell className="py-2 px-3 font-medium">{row.size}</TableCell>
                                    <TableCell className="py-2 px-3">{row.chest}</TableCell>
                                    <TableCell className="py-2 px-3">{row.waist}</TableCell>
                                    <TableCell className="py-2 px-3">{row.length}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                          <p className="mt-3 text-xs text-primary-400">نحوه اندازه‌گیری: متر را دور پهن‌ترین قسمت سینه و دور کمر قرار دهید. قد لباس از شانه تا پایین اندازه‌گیری می‌شود.</p>
                        </div>
                      )}
                      {pdpTab === 'style' && (
                        <div className="space-y-3">
                          <p>این پیراهن را می‌توانید با شلوار پارچه‌ای، کروات هماهنگ و کفش رسمی برای محیط کار ست کنید. برای استایل کژوال، دکمه‌های بالایی را باز بگذارید و با شلوار جین ترکیب کنید.</p>
                          <div className="grid grid-cols-3 gap-2">
                            {[activeColor.image, colors[1]?.image || activeColor.image, colors[2]?.image || activeColor.image].map((img, i) => (
                              <div key={i} className="aspect-square rounded-xl overflow-hidden bg-primary-100">
                                <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reviews */}
                  <div className="mt-8 sm:mt-10">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base sm:text-lg font-bold text-primary-900 dark:text-white">نظرات خریداران</h2>
                      <button type="button" className="text-xs text-apple-blue dark:text-[#13ABC4] font-medium">ثبت نظر</button>
                    </div>
                    <div className="bg-white dark:bg-black rounded-2xl border border-primary-100 dark:border-white/10 p-4 sm:p-6 mb-4">
                      <div className="flex flex-col sm:flex-row gap-5">
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-3xl font-bold text-primary-900 dark:text-white">{toFa(Number(p.rating || 0).toFixed(1))}</span>
                          <div>
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(n => <Icon key={n} name={n <= Math.round(p.rating || 0) ? 'starFilled' : 'star'} size={14} className={n <= Math.round(p.rating || 0) ? 'text-amber-400' : 'text-primary-200'} />)}
                            </div>
                            <p className="text-xs text-primary-500 mt-0.5">{toFa(p.reviews || 0)} نظر</p>
                          </div>
                        </div>
                        <div className="flex-1 space-y-1">
                          {[5,4,3,2,1].map(star => {
                            const cnt = ratingDist[star] || 0;
                            const pct = Math.round((cnt / 90) * 100);
                            return (
                              <div key={star} className="flex items-center gap-2 text-xs">
                                <span className="w-4 text-primary-500">{toFa(star)}</span>
                                <div className="flex-1 h-1.5 rounded-full bg-primary-100 dark:bg-primary-800 overflow-hidden">
                                  <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="w-6 text-primary-400">{toFa(cnt)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1.5 mb-3 overflow-x-auto no-scrollbar">
                      {[
                        { id: 'all', label: 'همه' },
                        { id: 'photo', label: 'با عکس' },
                        { id: 'positive', label: 'مثبت' },
                        { id: 'negative', label: 'منفی' },
                      ].map(f => (
                        <button key={f.id} type="button" onClick={() => setPdpReviewFilter(f.id)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border ${pdpReviewFilter === f.id ? 'bg-primary-800 text-white border-primary-800 dark:bg-[#13ABC4] dark:!text-white' : 'plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium'}`}>{f.label}</button>
                      ))}
                    </div>
                    <div className="space-y-3">
                      {filteredReviews.map(r => (
                        <div key={r.id} className="bg-white dark:bg-black rounded-xl border border-primary-100 dark:border-white/10 p-4">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-primary-900 dark:text-white">{r.name}</span>
                              {r.verified && <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">خرید تأییدشده</span>}
                            </div>
                            <span className="text-xs text-primary-400">{r.date}</span>
                          </div>
                          <div className="flex gap-0.5 mb-1.5">
                            {[1,2,3,4,5].map(n => <Icon key={n} name={n <= r.rating ? 'starFilled' : 'star'} size={14} className={n <= r.rating ? 'text-amber-400' : 'text-primary-200'} />)}
                            <span className="text-xs text-primary-400 mr-2">سایز {r.size}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-primary-700 dark:text-white/80 leading-relaxed">{r.text}</p>
                          {r.photos && r.photos.length > 0 && (
                            <div className="flex gap-2 mt-2.5 overflow-x-auto no-scrollbar">
                              {r.photos.map((ph, pi) => (
                                <img key={pi} src={ph} alt={`عکس نظر ${r.name}`} loading="lazy" className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border border-primary-100 dark:border-white/10 flex-shrink-0" />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Q&A */}
                  <div className="mt-8 sm:mt-10">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base sm:text-lg font-bold text-primary-900 dark:text-white">پرسش و پاسخ</h2>
                      <div className="flex gap-1.5">
                        <button type="button" onClick={() => setPdpQaFilter('all')} className={`px-2.5 py-1 rounded-full text-xs border ${pdpQaFilter === 'all' ? 'bg-primary-800 text-white border-primary-800' : 'border-primary-200 text-primary-600'}`}>همه</button>
                        <button type="button" onClick={() => setPdpQaFilter('answered')} className={`px-2.5 py-1 rounded-full text-xs border ${pdpQaFilter === 'answered' ? 'bg-primary-800 text-white border-primary-800' : 'border-primary-200 text-primary-600'}`}>پاسخ‌داده‌شده</button>
                      </div>
                    </div>
                    <div className="space-y-3 mb-4">
                      {filteredQs.map(q => (
                        <div key={q.id} className="bg-white dark:bg-black rounded-xl border border-primary-100 dark:border-white/10 p-4">
                          <p className="text-sm font-medium text-primary-900 dark:text-white">س: {q.q}</p>
                          {q.answered ? (
                            <p className="mt-2 text-xs text-primary-600 dark:text-white/70 leading-relaxed">ج: {q.a} <span className="text-primary-400">— {q.by} · {q.date}</span></p>
                          ) : (
                            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">در انتظار پاسخ</p>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="bg-white dark:bg-black rounded-xl border border-primary-100 dark:border-white/10 p-4">
                      <p className="text-xs font-bold text-primary-700 dark:text-white mb-2">سوال بپرسید</p>
                      <Textarea value={pdpQText} onChange={(v) => setPdpQText(v || '')} rows={3} placeholder="سوال خود را بنویسید (بدون لینک)..." style={{ minHeight: 96 }} className="mb-2" />
                      <button type="button" onClick={() => {
                        const chk = assertNoUserLinks(pdpQText);
                        if (!chk.ok) { showToast({ message: String(chk.error), variant: 'error', duration: 4500, position: 'top-center' }); return; }
                        if (!chk.text.trim()) { showToast({ message: 'سوال را بنویسید', variant: 'default', duration: 4500, position: 'top-center' }); return; }
                        showToast({ message: 'سوال شما ثبت شد و پس از بررسی نمایش داده می‌شود.', variant: 'success', duration: 4500, position: 'top-center' });
                        setPdpQText('');
                      }} className="px-4 py-2 rounded-full bg-apple-blue text-white text-xs font-medium">ارسال سوال</button>
                    </div>
                  </div>

                  {/* Frequently bought together */}
                  <div className="mt-8 sm:mt-10">
                    <h2 className="text-base sm:text-lg font-bold text-primary-900 dark:text-white mb-4">معمولاً با این محصول خریداری می‌شود</h2>
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                      {similar.slice(0, 4).map(sp => (
                        <div key={sp.id} className="flex-shrink-0 w-36 sm:w-40 cursor-pointer" onClick={() => openPDP(sp)}>
                          <div className="aspect-[4/5] rounded-xl overflow-hidden bg-primary-100 dark:bg-primary-900 mb-2">
                            <img src={sp.colors?.[0]?.image} alt={sp.name} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                          <p className="text-xs font-medium text-primary-900 dark:text-white truncate">{sp.name}</p>
                          <p className="text-xs text-primary-500">{sp.priceText} تومان</p>
                        </div>
                      ))}
                    </div>
                  </div>


                  {/* Similar products */}
                  {similar.length > 0 && (
                    <div className="mt-8 sm:mt-10">
                      <h2 className="text-base sm:text-lg font-bold text-primary-900 dark:text-white mb-4">محصولات مشابه</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        {similar.slice(0, 4).map(sp => (
                          <div key={sp.id} className="min-w-0" onClick={() => openPDP(sp)}>
                            {renderProductCard(sp, 'pdp-sim-', { grid: true })}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* From same seller */}
                  {fromSeller.length > 0 && (
                    <div className="mt-8 sm:mt-10">
                      <h2 className="text-base sm:text-lg font-bold text-primary-900 dark:text-white mb-4">از همین فروشنده</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        {fromSeller.slice(0, 4).map(sp => (
                          <div key={sp.id} className="min-w-0" onClick={() => openPDP(sp)}>
                            {renderProductCard(sp, 'pdp-sel-', { grid: true })}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recently viewed */}
                  {recentlyViewed.filter(x => x.id !== p.id).length > 0 && (
                    <div className="mt-8 sm:mt-10">
                      <h2 className="text-base sm:text-lg font-bold text-primary-900 dark:text-white mb-4">اخیراً دیده‌شده</h2>
                      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                        {recentlyViewed.filter(x => x.id !== p.id).map(sp => (
                          <div key={sp.id} className="flex-shrink-0 w-32 sm:w-36 cursor-pointer" onClick={() => openPDP(sp)}>
                            <div className="aspect-[4/5] rounded-xl overflow-hidden bg-primary-100 dark:bg-primary-900 mb-1.5">
                              <img src={sp.colors?.[0]?.image} alt={sp.name} className="w-full h-full object-cover" loading="lazy" />
                            </div>
                            <p className="text-xs font-medium text-primary-900 dark:text-white truncate">{sp.name}</p>
                            <p className="text-xs text-primary-500">{sp.priceText}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {renderShareBar({ title: p.name, text: `${p.name} — ${p.priceText || ''} تومان`, url: typeof window !== 'undefined' ? window.location.href : '' })}
                </div>

                {/* Mobile sticky CTA */}
                <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-primary-950/95 backdrop-blur-xl border-t border-primary-100 dark:border-white/15 px-3 py-2.5 safe-pb safe-area-pb">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-primary-900 dark:text-white">{p.priceText} <span className="text-xs font-normal text-primary-500">تومان</span></p>
                      {p.discount && <p className="text-xs text-red-500">{toFa(p.discount)}٪ تخفیف</p>}
                    </div>
                    {stockOk ? (
                      <button type="button" onClick={() => addToCart(p, { colorIdx: pdpColorIdx, size: pdpSize || '', qty: pdpQty, attrs: activeAttrs, requireSize: true })} className="flex-1 py-2.5 rounded-full bg-apple-blue text-white text-sm font-bold">
                        افزودن به سبد
                      </button>
                    ) : (
                      <button type="button" onClick={() => setPdpNotifyOpen(true)} className="flex-1 py-2.5 rounded-full bg-primary-800 text-white text-sm font-bold">
                        خبرم کن
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
    </>
  );
}
