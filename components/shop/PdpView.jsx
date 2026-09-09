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
              <div className="flex-1 flex flex-col bg-[#f7f7f8] dark:bg-primary-950 pb-28 sm:pb-10">
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
                  homeOnClick={() => { try { closePDP({ silent: true }); } catch(_){} try { if (window.__goHome) window.__goHome(); } catch(_){} try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch(_){} }}
                  items={[
                    { label: 'فروشگاه', onClick: () => { try { closePDP({ silent: true }); } catch(_){} openPLP({ resetFilters: true, query: '', cats: [], colors: [], sizes: [] }); } },
                    { label: p.category, onClick: () => { try { closePDP({ silent: true }); } catch(_){} openCategory(p.category); } },
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

                <div className="max-w-6xl mx-auto px-3 sm:px-5 py-3 sm:py-8 w-full">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

                    {/* ——— گالری (چپ / بالا) ——— */}
                    <div className="lg:col-span-6 xl:col-span-7 relative">
                      <div
                        className="relative aspect-[3/4] sm:aspect-[4/5] lg:aspect-square rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden bg-[#f3f3f5] dark:bg-primary-900 ring-1 ring-black/5 dark:ring-white/10"
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
                          className="w-full h-full object-cover cursor-zoom-in"
                          onClick={() => setPdpZoom(true)}
                          draggable={false}
                        />
                        <button
                          type="button"
                          onClick={() => setPdpZoom(true)}
                          className="absolute bottom-4 left-4 text-[11px] font-semibold bg-white/90 dark:bg-primary-950/90 text-primary-900 dark:text-white px-3.5 py-2 rounded-full shadow-md backdrop-blur-md hover:bg-white transition"
                        >
                          بزرگ‌نمایی
                        </button>
                        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
                          {p.discount ? (
                            <span className="bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">{toFa(p.discount)}٪</span>
                          ) : null}
                          {p.amazing && <span className="bg-gradient-to-l from-amber-500 to-orange-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">شگفت‌انگیز</span>}
                          {(isProductFastShip ? isProductFastShip(p) : p.fastShip) && <span className="bg-emerald-600 text-white text-[11px] font-medium px-2.5 py-1 rounded-full shadow">ارسال سریع</span>}
                          {!stockOk && <span className="bg-primary-800 text-white text-[11px] font-medium px-2.5 py-1 rounded-full shadow">ناموجود</span>}
                        </div>
                        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                          <button type="button" onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id); }} className={`w-10 h-10 rounded-full shadow-md flex items-center justify-center backdrop-blur-md transition ${isFav ? 'bg-apple-blue text-white' : 'bg-white/95 dark:bg-primary-900 text-primary-700 dark:text-white'}`} aria-label="علاقه‌مندی">
                            <Icon name={isFav ? 'heartFilled' : 'heart'} size={17} />
                          </button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); toggleCompare(p); }} className={`w-10 h-10 rounded-full shadow-md flex items-center justify-center backdrop-blur-md transition ${inCompare ? 'bg-apple-blue text-white' : 'bg-white/95 dark:bg-primary-900 text-primary-700 dark:text-white'}`} aria-label="مقایسه">
                            <Icon name="scale" size={17} />
                          </button>
                        </div>
                        {galleryImages.length > 1 && (
                          <>
                            <button type="button" onClick={() => setPdpGalleryIdx(i => (i - 1 + galleryImages.length) % galleryImages.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 dark:bg-primary-800 shadow flex items-center justify-center">
                              <Icon name="chevronRight" size={16} />
                            </button>
                            <button type="button" onClick={() => setPdpGalleryIdx(i => (i + 1) % galleryImages.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 dark:bg-primary-800 shadow flex items-center justify-center">
                              <Icon name="chevronLeft" size={16} />
                            </button>
                          </>
                        )}
                      </div>
                      {galleryImages.length > 1 && (
                        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1 px-0.5">
                          {galleryImages.map((img, i) => (
                            <button key={i} type="button" onClick={() => { setPdpGalleryIdx(i); }} className={`flex-shrink-0 w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] rounded-2xl overflow-hidden border-2 transition ${pdpGalleryIdx === i ? 'border-apple-blue ring-2 ring-apple-blue/20' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                              <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* ——— پنل خرید (راست / پایین) ——— */}
                    <div className="lg:col-span-6 xl:col-span-5 lg:sticky lg:top-24">
                      <div className="rounded-[1.75rem] bg-white dark:bg-primary-900 border border-primary-100/80 dark:border-white/10 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12)] dark:shadow-none p-5 sm:p-6 space-y-5">

                        <div>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-primary-500 dark:text-white/50 mb-2">
                            <button type="button" onClick={() => { try { closePDP({ silent: true }); } catch(_){} openCategory(p.category); }} className="hover:text-apple-blue transition">{p.category}</button>
                            <span>·</span>
                            <span className="font-latin" dir="ltr">{p.sku || `PM-${p.id}`}</span>
                          </div>
                          <h1 className="text-[1.35rem] sm:text-2xl font-black text-primary-900 dark:text-white leading-snug tracking-tight">{p.name}</h1>
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                              {toFa(Number(p.rating || 0).toFixed(1))}
                              <Icon name="starFilled" size={11} />
                            </span>
                            <span className="text-xs text-primary-500 dark:text-white/60">{toFa(p.reviews || 0)} نظر</span>
                            <button type="button" onClick={() => { try { closePDP({ silent: true }); } catch(_){} openSeller(seller.id || 'own'); }} className="text-xs text-primary-600 dark:text-white/70 hover:text-apple-blue mr-auto">
                              {seller.name}
                            </button>
                          </div>
                          {p.soldRecent > 0 && (
                            <p className="mt-2 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 inline-flex px-2.5 py-1 rounded-full">
                              {toFa(p.soldRecent)} خرید در ۷ روز اخیر
                            </p>
                          )}
                        </div>

                        <div className="flex items-end gap-3 flex-wrap border-t border-b border-primary-100 dark:border-white/10 py-4">
                          <p className="text-3xl sm:text-[2.15rem] font-black text-primary-900 dark:text-white tracking-tight">
                            {variantPriceText}
                            <span className="text-sm font-medium text-primary-400 mr-1">تومان</span>
                          </p>
                          {p.oldPrice && (
                            <div className="flex items-center gap-2 pb-1">
                              <span className="text-sm text-primary-400 line-through">{p.oldPrice}</span>
                              {p.discount && <span className="text-[11px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-md">{toFa(p.discount)}٪</span>}
                            </div>
                          )}
                        </div>

                        {/* رنگ */}
                        {colors.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-primary-500 dark:text-white/50 mb-2.5">رنگ · <span className="text-primary-900 dark:text-white">{activeColor.name}</span></p>
                            <div className="flex flex-wrap gap-2.5">
                              {colors.map((c, i) => (
                                <button
                                  key={c.name}
                                  type="button"
                                  title={c.name}
                                  onClick={() => { setPdpColorIdx(i); setPdpGalleryIdx(0); }}
                                  className={`w-10 h-10 rounded-full border-[2.5px] transition shadow-sm ${pdpColorIdx === i ? 'border-apple-blue scale-110 ring-2 ring-apple-blue/20' : 'border-primary-200 dark:border-white/30 hover:scale-105'}`}
                                  style={{ backgroundColor: c.hex || '#888' }}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* سایز */}
                        <div id="pdp-size-section">
                          <div className="flex items-center justify-between mb-2.5">
                            <p className="text-xs font-bold text-primary-500 dark:text-white/50">سایز <span className="text-red-500">*</span></p>
                            <button type="button" onClick={() => openStaticPage('size-guide')} className="text-[11px] text-apple-blue dark:text-[#13ABC4] hover:underline">راهنمای سایز</button>
                          </div>
                          {!pdpSize && sizes.length > 0 && (
                            <p className="text-[11px] text-amber-600 dark:text-amber-400 mb-2">یک سایز انتخاب کنید</p>
                          )}
                          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
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
                                  className={`py-2.5 rounded-xl text-sm font-semibold border transition ${disabled ? 'opacity-35 cursor-not-allowed border-primary-100 text-primary-300 line-through' : on ? 'bg-primary-900 text-white border-primary-900 dark:bg-[#13ABC4] dark:border-[#13ABC4]' : 'border-primary-200 dark:border-white/20 text-primary-800 dark:text-white hover:border-primary-400 bg-primary-50/50 dark:bg-primary-950/40'}`}
                                >{sz}</button>
                              );
                            })}
                          </div>
                          <button type="button" onClick={() => setPdpSizeRecOpen(v => !v)} className="mt-2 text-[11px] text-apple-blue dark:text-[#13ABC4] hover:underline">پیشنهاد سایز با قد و وزن</button>
                          {pdpSizeRecOpen && (
                            <div className="mt-2 p-3 rounded-2xl bg-primary-50 dark:bg-primary-950 border border-primary-100 dark:border-white/10 space-y-2">
                              <div className="flex gap-2">
                                <input type="number" placeholder="قد (سانتی‌متر)" value={pdpHeight} onChange={e => setPdpHeight(e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm" />
                                <input type="number" placeholder="وزن (کیلو)" value={pdpWeight} onChange={e => setPdpWeight(e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm" />
                              </div>
                              <button type="button" onClick={suggestSizeFromBody} className="w-full py-2 rounded-xl bg-primary-800 dark:bg-[#13ABC4] text-white text-xs font-medium">محاسبه</button>
                              {pdpSizeRec && <p className="text-xs text-center text-emerald-700 dark:text-emerald-400">پیشنهاد: <strong>{pdpSizeRec}</strong></p>}
                            </div>
                          )}
                        </div>

                        {/* ویژگی‌های متغیر */}
                        {attrDims.map(dim => (
                          <div key={dim.id}>
                            <p className="text-xs font-bold text-primary-500 dark:text-white/50 mb-2">{dim.name}: <span className="text-primary-900 dark:text-white">{activeAttrs[dim.id] || dim.options[0]}</span></p>
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
                                    onClick={() => { setPdpAttrs(prev => ({ ...prev, [dim.id]: opt })); setPdpGalleryIdx(0); }}
                                    className={`min-w-[2.75rem] px-3 py-2 rounded-xl text-sm font-medium border transition ${gone ? 'opacity-40 cursor-not-allowed line-through' : on ? 'bg-primary-900 text-white border-primary-900 dark:bg-[#13ABC4] dark:border-[#13ABC4]' : 'border-primary-200 dark:border-white/20'}`}
                                  >{opt}</button>
                                );
                              })}
                            </div>
                          </div>
                        ))}

                        {/* تعداد */}
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-1 rounded-2xl border border-primary-200 dark:border-white/20 bg-primary-50/60 dark:bg-primary-950/50 px-1">
                            <button type="button" onClick={() => setPdpQty(q => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center rounded-xl" aria-label="کاهش"><Icon name="minus" size={16} /></button>
                            <span className="w-8 text-center text-sm font-bold tabular-nums">{toFa(pdpQty)}</span>
                            <button type="button" onClick={() => setPdpQty(q => Math.min(Math.max(1, variantStock || 1), Math.min(10, q + 1)))} className="w-9 h-9 flex items-center justify-center rounded-xl" aria-label="افزایش"><Icon name="plus" size={16} /></button>
                          </div>
                          {lowStock && <span className="text-[11px] text-amber-600 font-medium">فقط {toFa(variantStock)} عدد</span>}
                          {stockOk && !lowStock && <span className="text-[11px] text-emerald-600">موجود</span>}
                          {!stockOk && <span className="text-[11px] text-red-500">ناموجود</span>}
                        </div>

                        {p.giftWrap && (
                          <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <input type="checkbox" checked={pdpGiftWrap} onChange={e => setPdpGiftWrap(e.target.checked)} className="rounded" />
                            بسته‌بندی هدیه
                          </label>
                        )}
                        {p.expressShipCost && (
                          <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <input type="checkbox" checked={pdpExpress} onChange={e => setPdpExpress(e.target.checked)} className="rounded" />
                            ارسال سریع‌تر (+{toFa(Math.round(p.expressShipCost / 1000))} هزار)
                          </label>
                        )}

                        {stockOk ? (
                          <button type="button" onClick={() => addToCart(p, { colorIdx: pdpColorIdx, size: pdpSize || '', qty: pdpQty, attrs: activeAttrs, requireSize: true })} className="w-full py-3.5 rounded-2xl bg-apple-blue text-white text-[15px] font-bold shadow-lg shadow-apple-blue/25 hover:opacity-95 active:scale-[0.99] transition">
                            افزودن به سبد
                          </button>
                        ) : (
                          <button type="button" onClick={() => setPdpNotifyOpen(v => !v)} className="w-full py-3.5 rounded-2xl bg-primary-800 dark:bg-[#13ABC4] text-white text-[15px] font-bold">
                            خبرم کن وقتی موجود شد
                          </button>
                        )}
                        {pdpNotifyOpen && (
                          <div className="p-3 rounded-2xl border border-primary-200 dark:border-white/15 bg-primary-50 dark:bg-primary-950">
                            {stockNotifyIds.includes(p.id) ? (
                              <p className="text-xs text-apple-blue text-center">در لیست اطلاع‌رسانی هستید ✓</p>
                            ) : (
                              <>
                                <input type="tel" defaultValue={user?.phone || ''} placeholder="شماره موبایل" id="pdp-notify-phone" className="w-full px-3 py-2 rounded-xl border text-sm mb-2" dir="ltr" />
                                <button type="button" onClick={() => {
                                  const phone = onlyDigits(document.getElementById('pdp-notify-phone')?.value || '');
                                  if (phone.length !== 11) { showToast({ message: 'شماره موبایل معتبر وارد کنید', variant: 'default', duration: 4500, position: 'top-center' }); return; }
                                  const next = [...new Set([...stockNotifyIds, p.id])];
                                  setStockNotifyIds(next);
                                  try { localStorage.setItem('stockNotifyIds', JSON.stringify(next)); } catch (_) {}
                                  setPdpNotifyOpen(false);
                                  showToast({ message: 'ثبت شد؛ وقتی موجود شود پیامک می‌گیرید (دمو).', variant: 'success', duration: 4500, position: 'top-center' });
                                }} className="w-full py-2 rounded-xl bg-apple-blue text-white text-xs font-medium">ثبت</button>
                              </>
                            )}
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          {[
                            { icon: 'badge', t: 'ضمانت اصالت' },
                            { icon: 'refresh', t: '۷ روز بازگشت' },
                            { icon: 'truck', t: 'ارسال سریع' },
                            { icon: 'shield', t: 'پرداخت امن' },
                          ].map(item => (
                            <div key={item.t} className="flex items-center gap-2 p-2.5 rounded-2xl bg-primary-50/80 dark:bg-primary-950/60 text-[11px] font-medium text-primary-700 dark:text-white/80">
                              <Icon name={item.icon} size={14} className="text-apple-blue dark:text-[#13ABC4] shrink-0" />
                              {item.t}
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-3 pt-1 border-t border-primary-100 dark:border-white/10">
                          <img src={fullSeller.image || fullSeller.banner} alt="" className="w-11 h-11 rounded-2xl object-cover" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold truncate">{fullSeller.name}</p>
                            <p className="text-[11px] text-primary-500">{toFa(Number(fullSeller.rating || seller.rating || 0).toFixed(1))}★ · {toFa(fullSeller.products || 0)} محصول</p>
                          </div>
                          <button type="button" onClick={() => { try { closePDP({ silent: true }); } catch(_){} openSeller(seller.id || 'own'); }} className="text-[11px] font-medium px-3 py-1.5 rounded-full border border-primary-200 dark:border-white/20 hover:bg-primary-50 dark:hover:bg-primary-800">
                            فروشگاه
                          </button>
                        </div>
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
                    <div className="bg-white dark:bg-primary-900 rounded-3xl border border-primary-100/80 dark:border-white/10 p-5 sm:p-7 text-sm text-primary-700 dark:text-white/80 leading-relaxed shadow-sm">
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
                <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-primary-950/95 backdrop-blur-xl border-t border-primary-100 dark:border-white/15 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] safe-pb safe-area-pb">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-primary-900 dark:text-white">{p.priceText} <span className="text-xs font-normal text-primary-500">تومان</span></p>
                      {p.discount && <p className="text-xs text-red-500">{toFa(p.discount)}٪ تخفیف</p>}
                    </div>
                    {stockOk ? (
                      <button type="button" onClick={() => addToCart(p, { colorIdx: pdpColorIdx, size: pdpSize || '', qty: pdpQty, attrs: activeAttrs, requireSize: true })} className="flex-1 py-3 rounded-2xl bg-apple-blue text-white text-sm font-bold shadow-md">
                        افزودن به سبد
                      </button>
                    ) : (
                      <button type="button" onClick={() => setPdpNotifyOpen(true)} className="flex-1 py-2.5 rounded-full bg-primary-800 text-white text-sm font-bold">
                        خبرم کن
                      </button>
                    )}
                  </div>
                </div>

                {pdpZoom && (
                  <div
                    className="fixed inset-0 z-[400] flex flex-col bg-black/94 backdrop-blur-xl"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => setPdpZoom(false)}
                  >
                    <div className="flex items-center justify-between px-4 py-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={() => setPdpZoom(false)} className="w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center" aria-label="بستن">
                        <Icon name="x" size={20} />
                      </button>
                      <p className="text-sm font-bold text-white truncate px-3 flex-1 text-center">{p.name}</p>
                      <div className="w-11" />
                    </div>
                    <div className="flex-1 relative flex items-center justify-center min-h-0 p-4" onClick={(e) => e.stopPropagation()}>
                      <img
                        src={galleryImages[Math.min(pdpGalleryIdx, Math.max(0, galleryImages.length - 1))] || mainImg}
                        alt={p.name}
                        className="max-h-[75vh] max-w-full object-contain rounded-2xl select-none"
                        draggable={false}
                      />
                      {galleryImages.length > 1 && (
                        <>
                          <button type="button" onClick={() => setPdpGalleryIdx((i) => (i - 1 + galleryImages.length) % galleryImages.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 text-white flex items-center justify-center">
                            <Icon name="chevronRight" size={22} />
                          </button>
                          <button type="button" onClick={() => setPdpGalleryIdx((i) => (i + 1) % galleryImages.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 text-white flex items-center justify-center">
                            <Icon name="chevronLeft" size={22} />
                          </button>
                        </>
                      )}
                    </div>
                    {galleryImages.length > 1 && (
                      <div className="flex gap-2 justify-center overflow-x-auto px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        {galleryImages.map((img, i) => (
                          <button key={i} type="button" onClick={() => setPdpGalleryIdx(i)} className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 ${pdpGalleryIdx === i ? 'border-white' : 'border-white/25 opacity-70'}`}>
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
    </>
  );
}
