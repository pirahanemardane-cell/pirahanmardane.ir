'use client';


import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppApi } from '../AppApiContext';
import Icon from '../Icon';
import dynamic from 'next/dynamic';
import { Textarea } from '../ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { LoadingState, ErrorState, EmptyStateBox } from '../ui/async-state';
import EmptyState from '../EmptyState';
import { showToast } from '../ui/toast';
import PermissionsPanelContent from './PermissionsPanelContent';

const SimpleEditor = dynamic(() => import('../SimpleEditor'), { ssr: false });

/** اسکرول به بالای پنل ادمین */
function scrollAdminPanelToTop() {
  try {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    document.querySelectorAll('.admin-panel-shell, [data-admin-scroll], main').forEach((el) => {
      try { el.scrollTop = 0; } catch (_) {}
    });
  } catch (_) {}
}

/** پنل AdminPanelContent — استخراج‌شده از App.jsx (رفتار یکسان، وابستگی از AppApi) */
export default function AdminPanelContent() {

  const AdminProductActions = ({ product }) => {
    if (!product || !product.id) return null;
    const st = String(product.status || product.contentStatus || '');
    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {st !== 'active' && st !== 'approved' ? (
          <button type="button" className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-600 text-white"
            onClick={() => {
              if (typeof patchAdminProductStatus === 'function') patchAdminProductStatus(product.id, 'active');
              else if (typeof approveAdminProduct === 'function') approveAdminProduct(product.id);
            }}>تأیید</button>
        ) : null}
        {st !== 'rejected' ? (
          <button type="button" className="text-[11px] px-2.5 py-1 rounded-full bg-amber-500 text-white"
            onClick={() => {
              if (typeof patchAdminProductStatus === 'function') patchAdminProductStatus(product.id, 'rejected');
              else if (typeof approveAdminProduct === 'function') approveAdminProduct(product.id);
            }}>رد</button>
        ) : null}
        <button type="button" className="text-[11px] px-2.5 py-1 rounded-full border border-red-300 text-red-600"
          onClick={async () => {
            const ok = typeof siteConfirm === 'function'
              ? await siteConfirm('حذف/بایگانی این محصول؟', 'حذف محصول')
              : window.confirm('حذف شود؟');
            if (!ok) return;
            if (typeof adminDeleteProduct === 'function') adminDeleteProduct(product.id);
          }}>حذف</button>
      </div>
    );
  };

  const AdminSellerActions = ({ seller }) => {
    if (!seller || !seller.id) return null;
    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        <button type="button" className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-600 text-white"
          onClick={() => adminPatchSellerStatus && adminPatchSellerStatus(seller.id, 'approved')}>تأیید</button>
        <button type="button" className="text-[11px] px-2.5 py-1 rounded-full bg-amber-500 text-white"
          onClick={() => adminPatchSellerStatus && adminPatchSellerStatus(seller.id, 'rejected')}>رد</button>
        <button type="button" className="text-[11px] px-2.5 py-1 rounded-full border border-red-300 text-red-600"
          onClick={() => adminPatchSellerStatus && adminPatchSellerStatus(seller.id, 'suspended')}>مسدود</button>
      </div>
    );
  };


  


    

  
  
  const adminReplyTicket = async (ticketId, text) => {
    const body = String(text || '').trim();
    if (!ticketId || !body) return false;
    try {
      let res = await fetch('/api/tickets/' + encodeURIComponent(ticketId) + '/messages', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: body, body }),
      });
      if (!res.ok) {
        res = await fetch('/api/tickets/' + encodeURIComponent(ticketId), {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reply: body, message: body }),
        });
      }
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        try { showToast({ message: data?.error || 'ارسال پاسخ ناموفق', variant: 'error', duration: 4000, position: 'top-center' }); } catch (_) {}
        return false;
      }
      try { showToast({ message: 'پاسخ ارسال شد', variant: 'success', duration: 2500, position: 'top-center' }); } catch (_) {}
      return true;
    } catch (e) {
      try { showToast({ message: 'خطای شبکه', variant: 'error', duration: 4000, position: 'top-center' }); } catch (_) {}
      return false;
    }
  };

  const sellerStatusLabel = (st) => {
    const s = String(st || '').toLowerCase();
    if (s === 'approved' || s === 'active') return 'تأیید‌شده';
    if (s === 'suspended' || s === 'blocked') return 'محدود شده';
    if (s === 'rejected') return 'رد‌شده';
    if (s === 'pending') return 'در انتظار';
    if (s === 'archived') return 'آرشیو شده';
    return s || 'نامشخص';
  };

  
  // server-first: will be bound after useAppApi()
  let patchAdminProductStatus = async () => false;
  let patchSellerStatus = async () => false;


  

  const api = useAppApi();
  const { BarList, CarouselArrows, EmptyState, EmptyStateBox, ErrorState, Icon, Kpi, LoadingState, OWN_SELLER, PRODUCT_IMG, SeoPixelBars, SimpleEditor, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Textarea, TipText, activeSellerId, activeTip, add, addBlogComment, addBrandMention, addToCart, addressDeleteConfirm, addressForm, addressFormOpen, addresses, adm, adminAnalyticsRange, adminAnalyticsSub, adminAuthError, adminAuthLoading, adminAuthOpen, adminAuthOtp, adminAuthOtpTimer, adminAuthPhone, adminAuthStep, adminBlogCategories, adminBlogTags, adminBuyerDetailId, adminBuyerSearch, adminBuyers, adminCatalogAttributes, adminCatalogBrands, adminCatalogColors, adminCatalogSizes, adminCategories, adminContentTab, adminCouponForm, adminCouponFormOpen, adminCoupons, hydrateCatalogFromApi, setAdminOrderStatus, hydrateAdminStatsFromApi, requestSellerPayout, hydrateSellerPayouts, hydrateBlogPostsFromApi, hydrateAdminCoupons, persistCampaignOnServer, hydrateCampaignsFromApi, createAdminCouponOnServer, hydrateSellerOrdersFromApi, adminFrontEditForm, adminFrontEditOpen, adminGscDim, adminGscInspectResult, adminGscInspectUrl, adminGscRange, adminGscSub, adminLoading, adminModerationQueue, adminOrderDetailId, adminOrderFilter, adminOrderNote, adminOrderSearch, adminOrders, adminPageContent, adminPageSeoStep, adminProductDetailId, adminProductFilter, adminProductSearch, adminProducts, adminRejectReason, adminSellerDetailId, adminSellerFilter, adminSellerSearch, adminSellers, adminSeoHubKey, adminSettings, adminShippingMethods, adminStatusBadge, adminStatusLabel, adminTab, adminTags, adminTicketDetailId, adminTicketFilter, adminTicketReply, adminTickets, adminUser, aiGenerateSeoMeta, aiOptimizeTextHints, aiSuggestFaq, allLists, analyzeOnPageSeo, apply, applyCoupon, applyFromUrl, applyRealtimePayload, applySellerDescFormat, approveAdminProduct, assertNoUserLinks, attrsKeyPart, attrsMatch, authError, authFailCount, authLastName, authLoading, authLockedUntil, authMode, authName, authOpen, authOtp, authOtpTimer, authPhone, authReturnTo, authStep, authTermsAccepted, backupAdminProducts, backupDestPath, backupSellerProducts, bar, blankShippingMethod, blogCommentName, blogCommentText, blogComments, blogForm, blogPostId, blogPosts, brandDetailId, brandQuery, brandsList, buildArticleSchema, buildBreadcrumbSchema, buildCheckoutOrderDraft, buildFaqSchema, buildGa4Seed, buildGscSeed, buildImageAlt, buildLlmsTxt, buildLocalBusinessSchema, buildNewsSitemapXml, buildProductSchema, buildRobotsTxt, buildSitemapIndexXml, buildSitemapXml, buildVariantMatrix, buildVideoSitemapXml, buyerGifts, buyerTicketBody, buyerTicketDetailId, buyerTicketError, buyerTicketFormOpen, buyerTicketSubject, buyerTickets, campaignForm, campaignNow, campaignsList, canonicalBase, cardQtys, carouselIndex, cart, cartItemKey, cartItemLoading, cartOpen, cartesianAttrCombos, catOpen, catalogForm, catalogProducts, changeCartColor, checkoutContact, checkoutErrors, checkoutNewAddress, checkoutNote, checkoutPaymentMethod, checkoutPlacing, checkoutSelectedAddressId, checkoutShippingMethod, checkoutStep, checkoutUseNewAddress, classifyToastVariant, clearAllSearchFilters, clearCart, clearCartConfirm, clearCompare, clearFavorites, clearPlpFilters, clearRecentSearches, clearSellerListFilters, close, closeAdminAuth, closeAdminPanel, closeAuth, closeCartPage, closeCheckout, closeComparePage, closeMobileMenuOnWide, closePDP, closePLP, closeProfilePage, closeRecentPage, closeSeller, closeSellerPanel, closeSellersList, closeSiteDialog, closeStaticPage, closeWishlistPage, collect, collectFullSiteBackup, compare, compareOnlyDiffs, compareOpen, compareReplaceOpen, compareToast, completeRegister, confirmPaymentFail, confirmPaymentSuccess, consumeSeoAiQuota, contactForm, contactFormError, contentEditorTarget, conversationChannelLabel, cookieConsent, copyShareLink, copyTextToClipboard, countFor, couponApplied, couponInput, couponMsg, dark, dealsMinDiscount, dealsSort, defaultAdminBlogCategories, defaultAdminCategories, defaultAdminTags, defaultOrganizationSchema, defaultSeoConfig, defaultShippingMethods, demoOtpCode, deriveCollar, deriveFabric, deriveSleeve, detectImportSource, didYouMean, discountMode, discountPercent, discountPickIds, discountPrices, downloadBlobFile, downloadFullSiteBackup, downloadSeoFile, editingAddressId, editingCouponId, editingSellerProductId, emptyTaxonomyForm, enqueueModeration, ensureAdminSeed, ensureProductCode, esc, existingSellerOrders, expandQuery, exportRedirectsForServer, faqCat, faqQuery, favToast, favorites, fileToImage, finalizePaidOrder, findOpenChatConversation, findProductVariant, findSlider, finishAuthSuccess, fire, fmt, fmtMoney, formatPrice, ga4Aggregate, ga4FilterEvents, ga4Store, generateGiftCode, generateProductCode, generateTicketCode, getAttrDimensions, getCheckoutShippingCost, getCheckoutTaxRate, getCheckoutTotals, getCurrentPageSeoContext, getFavEntry, getPageCms, getPageShareUrl, getProductPublicPath, getProductPublicUrl, getResolvedPageSeo, getSellerEnabledShippingIds, getSellerMaxDiscount, getSellerMinPrice, getSeoAiQuota, getShippingOptions, getShopSeoBody, getUsedPromoCodes, getVariantPrice, getVariantStock, giftCodeForm, gscAggregate, gscInspect, gscStore, has, hasMounted, headerRevealedAfterHero, htmlToPlain, imgZoom, importExternalProductsCsv, installBuyerPwa, isBlogLiked, isDealActive, isFavorite, isLive, isNumericField, isSlider, isVerticalScrollable, ix, lastAutoBackupAt, likedBlogs, list, liveToasts, loadForm, loadGa4Store, loadGscStore, logSeo404, logout, logoutAdmin, hydrateAdminProducts, hydrateAdminSellers, hydrateAdminOrders, adminPatchProductStatus, adminDeleteProduct, adminPurgeProduct, adminBulkArchiveProducts, adminBulkPurgeProducts, adminBulkArchiveSellers, adminBulkPurgeSellers, adminPatchSellerStatus, adminDeleteSeller, adminPurgeSeller, adminPatchOrderStatus, adminListLoading, adminListError, logoutAllDevices, logoutSeller, mapExternalRowToProduct, markAllNotifsRead, markNotifRead, markPromoCodeUsed, matchCatalogBrand, matchCatalogColor, matchCatalogSize, matchCategory, measureSeoPx, mediaToolAssign, mediaToolOffset, mediaToolProcessing, mediaToolResult, mediaToolScale, mediaToolSearch, mediaToolSrc, mediaToolStep, megaOpen, mirrorConversationToAdmin, mirrorSellerOrderToBuyer, mobileMenuOpen, move, nativeShare, newestTab, newsletterPhone, normKey, normalize, normalizeAttrMap, normalizeCategoryKey, normalizeSearch, notifPanelOpen, notifPulling, notifications, oldPriceOpen, onBeforeInput, onBip, onClickCapture, onDragStart, onFocusIn, onInput, onInstalled, onKey, onKeyDown, onMouseDown, onMouseMove, onMouseUp, onPointer, onPointerDown, onScroll, onStorage, onWheel, onlyDigits, openAdminAuth, openAdminFrontEdit, openAdminPanel, openAuth, openCartPage, openCategory, openCheckout, openComparePage, openNewShippingMethod, openPDP, openPLP, openProfilePage, openQuickAdd, openRecentPage, openSeller, openSellerAuth, openSellerPanel, openSellersList, openStaticPage, openTagPage, openTaxonomyHub, openTaxonomyWizard, openWishlistPage, orderDetailId, orderFailed, orderRateDraft, orderReturnOpen, orderStatusColor, orderSuccess, orders, ordersFilter, pageSeoMap, parseCsvText, parseResponseHours, pct, pdpAttrs, pdpColorIdx, pdpExpress, pdpGalleryIdx, pdpGiftWrap, pdpHeight, pdpNotifyOpen, pdpProduct, pdpQText, pdpQaFilter, pdpQty, pdpReviewFilter, pdpSize, pdpSizeRec, pdpSizeRecOpen, pdpSticky, pdpTab, pdpTouchX, pdpWeight, pdpZoom, pendingPayOrder, persistBlogComments, persistCompare, persistFavorites, persistGa4, persistGsc, persistLikedBlogs, persistSession, pickField, pingIndexNow, placeOrder, plpCats, plpCities, plpCityInput, plpCityOpen, plpColors, plpDiscountOnly, plpFabrics, plpFastShipOnly, plpFilterOpen, plpFilterTab, plpInStockOnly, plpMinDiscount, plpPriceMax, plpPriceMin, plpQuery, plpSellers, plpSidebarOpen, plpSizes, plpSkeleton, plpSort, plpSortOpen, plpTagFilter, plpView, plpVisible, poll, portalMounted, pos, prev, printOrderInvoice, processToProductWebP, processProductImageFile, productBackupPayload, productImportReport, productSlugFromNameAndShop, products, productsToCsv, profileTab, publishRealtime, pullNotifications, pushImg, pushLiveToast, pushNotification, pushRecentSearch, pushSellerNotification, pwaInstallEvent, pwaInstalled, quickAdd, quickColorIdx, quickDescOpen, quickGalleryIdx, quickQty, quickSize, readFile, readSessionUser, recentOpen, recentSearches, recentlyViewed, releaseDrag, removeCoupon, removeFavoritesBulk, removeFromCart, removeRecentSearch, renderContentSeoBox, renderList, renderProductCard, renderShareBar, replaceCompareAt, restoreAdminProductsFromFile, restoreFullSiteBackup, restoreSellerProductsFromFile, row, run, runSeoHealthCheck, same, saveAddresses, saveAdminBlogCategories, saveAdminBlogTags, saveAdminBuyers, saveAdminCatalogAttributes, saveAdminCatalogBrands, saveAdminCatalogColors, saveAdminCatalogSizes, saveAdminCategories, saveAdminCoupons, saveAdminFrontEdit, saveAdminOrders, saveAdminPageContentMap, saveAdminProducts, saveAdminSellers, saveAdminSettings, saveAdminShippingMethods, saveAdminTags, saveAdminTickets, saveBlogPosts, saveBuyerGifts, saveBuyerOrders, saveBuyerTickets, saveCampaigns, saveModerationQueue, saveNotifications, savePageSeoMap, saveSellerGifts, saveSellerOrders, saveSellerProducts, saveSellerTickets, saveSellerUser, saveSeo404Log, saveSeoPatch, saveSeoRedirects, saveShippingMethodForm, saveSiteFaqs, saveTaxonomy, saveUser, scoreProduct, scrollCarousel, scrolled, searchActiveIdx, searchCategories, searchColors, searchOpen, searchPhIdx, searchQuery, searchSizes, searchSuggestOpen, seedAddresses, seedAdminData, seedNotifications, seedOrders, seedSellerOrders, seedSellerProducts, seedSellerTickets, selectColor, selectedColors, selectedSizes, sellerBannerIdx, sellerCanSell, sellerCancelForm, sellerCancelOrder, sellerCat, sellerCatMenuOpen, sellerCityInput, sellerCityOpen, sellerConfirmOrder, sellerDescDraft, sellerDescEditorOpen, sellerDescError, sellerDiscountOnly, sellerFaqOpen, sellerFilterSheetOpen, sellerFollowed, sellerGifts, sellerListCities, sellerListMaxResponse, sellerListMinProducts, sellerListMinRating, sellerListQuery, sellerListSort, sellerMarkPackingDone, sellerMediaToolOpen, sellerNewTicket, sellerNewTicketOpen, sellerOpenOrderTicket, sellerOrderDetailId, sellerOrderStatusColor, sellerOrders, sellerOrdersFilter, sellerPriceMap, sellerProductDeleteId, sellerProductFilter, sellerProductForm, sellerProductFormOpen, sellerProductSearch, sellerProductStep, sellerProducts, sellerPromoModal, sellerReportOpen, sellerReportSent, sellerSearchOpen, sellerShareToast, sellerShipOrder, sellerShopOpen, sellerSort, sellerSortMenuOpen, sellerStickyBar, sellerTab, sellerTaxonomyPicker, sellerTaxonomySearch, sellerTicketDetailId, sellerTicketReply, sellerTickets, sellerTrackForm, sellerUser, sendAdminOtp, sendOtp, seo404Log, seoAiDaily, seoCfg, seoCharHint, seoOnChange, seoPixelReport, seoRedirectForm, seoRedirects, setActiveSellerId, setActiveTip, setAddressDeleteConfirm, setAddressForm, setAddressFormOpen, setAddresses, setAdminAnalyticsRange, setAdminAnalyticsSub, setAdminAuthError, setAdminAuthLoading, setAdminAuthOpen, setAdminAuthOtp, setAdminAuthOtpTimer, setAdminAuthPhone, setAdminAuthStep, setAdminBlogCategories, setAdminBlogTags, setAdminBuyerDetailId, setAdminBuyerSearch, setAdminBuyers, setAdminCatalogAttributes, setAdminCatalogBrands, setAdminCatalogColors, setAdminCatalogSizes, setAdminCategories, setAdminContentTab, setAdminCouponForm, setAdminCouponFormOpen, setAdminCoupons, setAdminFrontEditForm, setAdminFrontEditOpen, setAdminGscDim, setAdminGscInspectResult, setAdminGscInspectUrl, setAdminGscRange, setAdminGscSub, setAdminLoading, setAdminModerationQueue, setAdminOrderDetailId, setAdminOrderFilter, setAdminOrderNote, setAdminOrderSearch, setAdminOrders, setAdminPageContent, setAdminPageSeoStep, setAdminProductDetailId, setAdminProductFilter, setAdminProductSearch, setAdminProducts, setAdminRejectReason, setAdminSellerDetailId, setAdminSellerFilter, setAdminSellerSearch, setAdminSellers, setAdminSeoHubKey, setAdminSettings, setAdminShippingMethods, setAdminTab, setAdminTags, setAdminTicketDetailId, setAdminTicketFilter, setAdminTicketReply, setAdminTickets, setAdminUser, setAuthError, setAuthFailCount, setAuthLastName, setAuthLoading, setAuthLockedUntil, setAuthMode, setAuthName, setAuthOpen, setAuthOtp, setAuthOtpTimer, setAuthPhone, setAuthReturnTo, setAuthStep, setAuthTermsAccepted, setBackupDestPath, setBlogCommentName, setBlogCommentText, setBlogComments, setBlogForm, setBlogPostId, setBlogPosts, setBrandDetailId, setBrandQuery, setBrandsList, setBuyerGifts, setBuyerTicketBody, setBuyerTicketDetailId, setBuyerTicketError, setBuyerTicketFormOpen, setBuyerTicketSubject, setBuyerTickets, setCampaignForm, setCampaignNow, setCampaignsList, setCanonicalLink, setCardQtys, setCarouselIndex, setCart, setCartItemLoading, setCartOpen, setCatOpen, setCatalogForm, setCheckoutContact, setCheckoutErrors, setCheckoutNewAddress, setCheckoutNote, setCheckoutPaymentMethod, setCheckoutPlacing, setCheckoutSelectedAddressId, setCheckoutShippingMethod, setCheckoutStep, setCheckoutUseNewAddress, setClearCartConfirm, setCompare, setCompareOnlyDiffs, setCompareOpen, setCompareReplaceOpen, setCompareToast, setContactForm, setContactFormError, setContentEditorTarget, setCookieConsent, setCouponApplied, setCouponInput, setCouponMsg, setDark, setDealsMinDiscount, setDealsSort, setDemoOtpCode, setDiscountMode, setDiscountPercent, setDiscountPickIds, setDiscountPrices, setEditingAddressId, setEditingCouponId, setEditingSellerProductId, setFaqCat, setFaqQuery, setFavToast, setFavorites, setGa4Store, setGiftCodeForm, setGscStore, setHasMounted, setHeaderRevealedAfterHero, setImgZoom, setLastAutoBackupAt, setLikedBlogs, setLiveToasts, setMediaToolAssign, setMediaToolOffset, setMediaToolProcessing, setMediaToolResult, setMediaToolScale, setMediaToolSearch, setMediaToolSrc, setMediaToolStep, setMegaOpen, setMeta, setMobileMenuOpen, setNewestTab, setNewsletterPhone, setNotifPanelOpen, setNotifPulling, setNotifications, setOldPriceOpen, setOrCreateMeta, setOrderDetailId, setOrderFailed, setOrderRateDraft, setOrderReturnOpen, setOrderSuccess, setOrders, setOrdersFilter, setPageSeoMap, setPdpAttrs, setPdpColorIdx, setPdpExpress, setPdpGalleryIdx, setPdpGiftWrap, setPdpHeight, setPdpNotifyOpen, setPdpProduct, setPdpQText, setPdpQaFilter, setPdpQty, setPdpReviewFilter, setPdpSize, setPdpSizeRec, setPdpSizeRecOpen, setPdpSticky, setPdpTab, setPdpTouchX, setPdpWeight, setPdpZoom, setPendingPayOrder, setPlpCats, setPlpCities, setPlpCityInput, setPlpCityOpen, setPlpColors, setPlpDiscountOnly, setPlpFabrics, setPlpFastShipOnly, setPlpFilterOpen, setPlpFilterTab, setPlpInStockOnly, setPlpMinDiscount, setPlpPriceMax, setPlpPriceMin, setPlpQuery, setPlpSellers, setPlpSidebarOpen, setPlpSizes, setPlpSkeleton, setPlpSort, setPlpSortOpen, setPlpTagFilter, setPlpView, setPlpViewPersist, setPlpVisible, setPortalMounted, setProductImportReport, setProfileTab, setPwaInstallEvent, setPwaInstalled, setQuickAdd, setQuickColorIdx, setQuickDescOpen, setQuickGalleryIdx, setQuickQty, setQuickSize, setRecentOpen, setRecentSearches, setRecentlyViewed, setScrolled, setSearchActiveIdx, setSearchCategories, setSearchColors, setSearchOpen, setSearchPhIdx, setSearchQuery, setSearchSizes, setSearchSuggestOpen, setSelectedColors, setSelectedSizes, setSellerBannerIdx, setSellerCancelForm, setSellerCat, setSellerCatMenuOpen, setSellerCityInput, setSellerCityOpen, setSellerDescDraft, setSellerDescEditorOpen, setSellerDescError, setSellerDiscountOnly, setSellerFaqOpen, setSellerFilterSheetOpen, setSellerFollowed, setSellerGifts, setSellerListCities, setSellerListMaxResponse, setSellerListMinProducts, setSellerListMinRating, setSellerListQuery, setSellerListSort, setSellerMediaToolOpen, setSellerNewTicket, setSellerNewTicketOpen, setSellerOrderDetailId, setSellerOrders, setSellerOrdersFilter, setSellerProductDeleteId, setSellerProductFilter, setSellerProductForm, setSellerProductFormOpen, setSellerProductOutOfStock, setSellerProductReorderPoint, setSellerProductSearch, setSellerProductStep, setSellerProducts, setSellerPromoModal, setSellerReportOpen, setSellerReportSent, setSellerSearchOpen, setSellerShareToast, setSellerShopOpen, setSellerSort, setSellerSortMenuOpen, setSellerStickyBar, setSellerTab, setSellerTaxonomyPicker, setSellerTaxonomySearch, setSellerTicketDetailId, setSellerTicketReply, setSellerTickets, setSellerTrackForm, setSellerUser, setSeo404Log, setSeoAiDaily, setSeoRedirectForm, setSeoRedirects, setShippingMethodForm, setShippingMethodFormOpen, setShowAdminPanel, setShowCartPage, setShowCheckout, setShowComparePage, setShowPLP, setShowProfilePage, setShowRecentPage, setShowSellerPanel, setShowSellersList, setShowTaxonomyHub, setShowTop, setShowTracking, setShowWishlistPage, setSiteDialog, setSiteFaqs, setStaticPage, setStep, setStockNotifyIds, setTaxonomyForm, setTaxonomyFormOpen, setTopSellersTab, setUser, setWishlistClearConfirm, setWishlistFilter, setWishlistOpen, setWishlistSelected, setWishlistSort, setWishlistView, shareSeller, shippingMethodForm, shippingMethodFormOpen, shopCodePrefix, shouldNormalize, show, showAdminPanel, showBrowserPush, showCartPage, showCheckout, showComparePage, showCompareToast, showPLP, showProfilePage, showRecentPage, showSellerPanel, showSellersList, showTaxonomyHub, showToast, showTop, showTracking, showWishlistPage, simulateBrandScan, siteConfirm, siteDialog, siteFaqs, sitePrompt, sitePromptFields, slugifyTaxonomy, smartScore, splitList, staticPage, statusBadge, statusLabel, statusOf, stockNotifyIds, stripHtmlSeo, stripLinksForDisplay, submitSearch, suggestInternalLinks, suggestSizeFromBody, sync, syncFormVariants, takeSnap, taxonomyForm, taxonomyFormOpen, taxonomyTypeLabel, textContainsForbiddenLink, tick, ticketMessagesToChatUI, toEnDigits, toFa, toggleBlogLike, toggleCompare, toggleFavorite, toggleSearchCategory, toggleSearchColor, toggleSearchSize, toggleSellerFollow, toggleSellerListCity, top, topSellersRanked, topSellersTab, trackGa4Event, up, updatePageCms, updateQty, updateSellerOrderStatus, updateSellerProductStock, upsertJsonLd, upsertRankKeyword, user, validateCheckout, validateProductBackup, variantKey, verifyAdminOtp, verifyOtp, warnFaKeyboard, wishlistClearConfirm, wishlistFilter, wishlistOpen, wishlistProducts, wishlistSelected, wishlistSort, wishlistView, wrap, yes } = api;

  const [adminSelectedProductIds, setAdminSelectedProductIds] = useState([]);
  const [adminSelectedSellerIds, setAdminSelectedSellerIds] = useState([]);
  const [adminBulkBusy, setAdminBulkBusy] = useState(false);

  useEffect(() => { setAdminSelectedProductIds([]); }, [adminProductFilter, adminProductSearch]);
  useEffect(() => { setAdminSelectedSellerIds([]); }, [adminSellerFilter, adminSellerSearch]);

  const toggleAdminProductSelect = (id) => {
    const sid = String(id);
    setAdminSelectedProductIds((prev) => (prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid]));
  };
  const toggleAdminSellerSelect = (id) => {
    const sid = String(id);
    setAdminSelectedSellerIds((prev) => (prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid]));
  };

  const runAdminBulkProducts = async (mode) => {
    const ids = [...adminSelectedProductIds];
    if (!ids.length || adminBulkBusy) return;
    const isPurge = mode === 'purge';
    const msg = isPurge
      ? ('حذف دائم ' + ids.length + ' محصول انتخاب‌شده؟ این عمل برگشت‌پذیر نیست.')
      : ('آرشیو ' + ids.length + ' محصول انتخاب‌شده؟');
    const ok = typeof siteConfirm === 'function'
      ? await siteConfirm(msg, isPurge ? 'حذف دائم گروهی' : 'آرشیو گروهی')
      : (typeof window !== 'undefined' && window.confirm(msg));
    if (!ok) return;
    setAdminBulkBusy(true);
    try {
      if (isPurge && typeof adminBulkPurgeProducts === 'function') await adminBulkPurgeProducts(ids);
      else if (!isPurge && typeof adminBulkArchiveProducts === 'function') await adminBulkArchiveProducts(ids);
      else {
        for (const id of ids) {
          if (isPurge && typeof adminPurgeProduct === 'function') await adminPurgeProduct(id);
          else if (typeof adminDeleteProduct === 'function') await adminDeleteProduct(id);
        }
        try { if (typeof hydrateAdminProducts === 'function') await hydrateAdminProducts(); } catch (_) {}
      }
      setAdminSelectedProductIds([]);
    } finally {
      setAdminBulkBusy(false);
    }
  };

  const runAdminBulkSellers = async (mode) => {
    const ids = [...adminSelectedSellerIds];
    if (!ids.length || adminBulkBusy) return;
    const isPurge = mode === 'purge';
    const msg = isPurge
      ? ('حذف دائم ' + ids.length + ' فروشنده انتخاب‌شده؟ برگشت‌پذیر نیست.')
      : ('آرشیو ' + ids.length + ' فروشنده انتخاب‌شده؟');
    const ok = typeof siteConfirm === 'function'
      ? await siteConfirm(msg, isPurge ? 'حذف دائم گروهی' : 'آرشیو گروهی')
      : (typeof window !== 'undefined' && window.confirm(msg));
    if (!ok) return;
    setAdminBulkBusy(true);
    try {
      if (isPurge && typeof adminBulkPurgeSellers === 'function') await adminBulkPurgeSellers(ids);
      else if (!isPurge && typeof adminBulkArchiveSellers === 'function') await adminBulkArchiveSellers(ids);
      else {
        for (const id of ids) {
          if (isPurge && typeof adminPurgeSeller === 'function') await adminPurgeSeller(id);
          else if (typeof adminDeleteSeller === 'function') await adminDeleteSeller(id);
        }
        try { if (typeof hydrateAdminSellers === 'function') await hydrateAdminSellers(); } catch (_) {}
      }
      setAdminSelectedSellerIds([]);
    } finally {
      setAdminBulkBusy(false);
    }
  };

  // ——— A1/A2/A3/A4: همیشه از API سرور + re-hydrate ———
  patchAdminProductStatus = async (productId, status) => {
    if (typeof adminPatchProductStatus === 'function') {
      const ok = await adminPatchProductStatus(productId, status);
      if (ok && typeof hydrateAdminProducts === 'function') await hydrateAdminProducts();
      return !!ok;
    }
    try {
      let res = await fetch('/api/admin/products/' + encodeURIComponent(productId), {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      let data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        res = await fetch('/api/admin/products', {
          method: 'PATCH', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: productId, status }),
        });
        data = await res.json().catch(() => null);
      }
      if (!res.ok || !data?.ok) {
        try { showToast({ message: data?.error || 'خطا در تغییر وضعیت محصول', variant: 'error', duration: 4000, position: 'top-center' }); } catch (_) {}
        return false;
      }
      try { showToast({ message: (status === 'active' || status === 'approved') ? 'محصول تأیید و منتشر شد' : (status === 'rejected' ? 'محصول رد شد' : 'وضعیت ذخیره شد'), variant: 'success', duration: 2500, position: 'top-center' }); } catch (_) {}
      if (typeof hydrateAdminProducts === 'function') await hydrateAdminProducts();
      return true;
    } catch (e) {
      try { showToast({ message: 'خطای شبکه', variant: 'error', duration: 3000, position: 'top-center' }); } catch (_) {}
      return false;
    }
  };

  const deleteSeller = async (sellerId) => {
    if (!sellerId) return false;
    try {
      let okConfirm = false;
      if (typeof siteConfirm === 'function') {
        okConfirm = await siteConfirm('فروشگاه تعلیق و آرشیو شود؟ فروشنده پیام تعلیق می‌بیند و فقط ادمین می‌تواند بازگردانی کند.', 'حذف فروشنده');
      } else if (typeof window !== 'undefined') {
        okConfirm = window.confirm('حذف دائمی این فروشنده؟');
      }
      if (!okConfirm) return false;
      if (typeof adminDeleteSeller === 'function') return !!(await adminDeleteSeller(sellerId));
      const res = await fetch('/api/admin/sellers/' + encodeURIComponent(sellerId), { method: 'DELETE', credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data || !data.ok) throw new Error((data && data.error) || 'حذف ناموفق');
      try { showToast({ message: 'فروشنده حذف شد', variant: 'success', duration: 3500, position: 'top-center' }); } catch (_) {}
      if (typeof hydrateAdminSellers === 'function') await hydrateAdminSellers();
      try { if (typeof setAdminSellerDetailId === 'function') setAdminSellerDetailId(null); } catch (_) {}
      return true;
    } catch (err) {
      try { showToast({ message: String((err && err.message) || err), variant: 'error', duration: 5000, position: 'top-center' }); } catch (_) {}
      return false;
    }
  };

  patchSellerStatus = async (sellerId, status) => {
    const normalized = status === 'blocked' ? 'suspended' : status;
    if (typeof adminPatchSellerStatus === 'function') {
      const ok = await adminPatchSellerStatus(sellerId, normalized);
      if (ok && typeof hydrateAdminSellers === 'function') await hydrateAdminSellers();
      return !!ok;
    }
    try {
      let res = await fetch('/api/admin/sellers/' + encodeURIComponent(sellerId), {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: normalized }),
      });
      let data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        res = await fetch('/api/admin/sellers', {
          method: 'PATCH', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: sellerId, status: normalized }),
        });
        data = await res.json().catch(() => ({}));
      }
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'خطا در به‌روزرسانی فروشنده');
      try { showToast({ message: normalized === 'approved' ? 'فروشنده تأیید شد' : 'وضعیت فروشنده به‌روز شد', variant: 'success', duration: 3500, position: 'top-center' }); } catch (_) {}
      if (typeof hydrateAdminSellers === 'function') await hydrateAdminSellers();
      return true;
    } catch (err) {
      try { showToast({ message: String(err?.message || err), variant: 'error', duration: 5000, position: 'top-center' }); } catch (_) {}
      return false;
    }
  };

  // hydrate لیست‌ها هنگام باز شدن پنل / تغییر تب
  useEffect(() => {
    if (adminLoading) return;
    if (typeof hydrateAdminProducts === 'function') hydrateAdminProducts();
    if (typeof hydrateAdminSellers === 'function') hydrateAdminSellers();
    if (typeof hydrateAdminTickets === 'function') hydrateAdminTickets();
  }, [adminTab, adminLoading]);

  useEffect(() => {
    if (!adminTab || adminLoading) return;
    const run = () => {
      scrollAdminPanelToTop();
      const el = document.getElementById('admin-tab-' + adminTab);
      if (el) {
        try { el.scrollIntoView({ block: 'start', behavior: 'auto' }); } catch (_) {}
      }
      scrollAdminPanelToTop();
    };
    const id = requestAnimationFrame(run);
    const t = setTimeout(run, 50);
    return () => { cancelAnimationFrame(id); clearTimeout(t); };
  }, [adminTab, adminLoading]);


  const adminUnreadTickets = (adminTickets || []).filter((t) => t.unread || t.status === 'open').length;

  return (
    <>
            <div className="panel-content-wrap w-full max-w-none mx-auto px-2 sm:px-4 py-4 sm:py-10 pb-24">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 sm:p-5 rounded-2xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-primary-800 dark:bg-[#4CCD99] text-white flex items-center justify-center text-xl font-bold">{(adminUser.name || 'ا')[0]}</div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-white">{adminUser.name}</h1>
                    <p className="text-xs text-primary-500 dark:!text-white">{adminUser.role || 'Super Admin'} · <span className="text-emerald-600" dir="ltr">{adminUser.phone}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button type="button" onClick={logoutAdmin} className="text-xs px-3 py-1.5 rounded-full border border-red-200 text-red-600 flex items-center gap-1"><Icon name="logOut" size={14} /> خروج</button>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                <aside className="w-full md:w-48 lg:w-56 flex-shrink-0 md:sticky md:top-28 md:self-start z-10">
                  <div className="admin-tabs-strip flex md:flex-col gap-1 overflow-x-auto no-scrollbar pb-1 md:pb-0 p-2 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 shadow-sm">
                    {[
                      { id: 'dashboard', label: 'داشبورد', icon: 'home' },
                      { id: 'sellers', label: 'فروشندگان', icon: 'users' },
                      { id: 'products', label: 'محصولات', icon: 'package' },
                      { id: 'product-categories', label: 'دسته‌بندی محصولات', icon: 'grid' },
                      { id: 'product-tags', label: 'برچسب محصولات', icon: 'grid' },
                      { id: 'brands', label: 'برندها', icon: 'package' },
                      { id: 'pages', label: 'برگه‌ها', icon: 'bookmark' },
                      { id: 'taxonomy', label: 'رنگ / سایز / ویژگی', icon: 'grid' },
                      { id: 'shipping', label: 'روش‌های ارسال', icon: 'truck' },
                      // { id: 'content', label: 'محتوا و تأیید', icon: 'pencil' }, // موقتاً مخفی
                      { id: 'blog-categories', label: 'دسته‌بندی بلاگ', icon: 'pencil' },
                      { id: 'blog-new', label: 'افزودن بلاگ', icon: 'pencil' },
                      { id: 'blog', label: 'مطالب بلاگ', icon: 'pencil' },
                      { id: 'campaigns', label: 'کمپین‌ها', icon: 'gift' },
                      { id: 'orders', label: 'سفارش‌ها', icon: 'shoppingBag' },
                      { id: 'coupons', label: 'کد تخفیف', icon: 'gift' },
                      { id: 'audit', label: 'لاگ ادمین', icon: 'shield' },
                      { id: 'tickets', label: 'تیکت‌ها', icon: 'message' },
                      { id: 'buyers', label: 'خریداران', icon: 'user' },
                      { id: 'seo', label: 'سئو و ایندکس', icon: 'settings' },
                      { id: 'redirects', label: 'ریدایرکت', icon: 'share' },
                      { id: 'analytics', label: 'آنالیتیکس', icon: 'grid' },
                      { id: 'search-console', label: 'سرچ کنسول', icon: 'search' },
                      { id: 'backup', label: 'بک‌آپ و بازیابی', icon: 'download' },
                      { id: 'site-licenses', label: 'مجوزهای سایت', icon: 'shield' },
                      { id: 'settings', label: 'تنظیمات', icon: 'settings' },
                      { id: 'profile', label: 'پروفایل', icon: 'user' },
                    ].map(t => (
                      <button key={t.id} type="button" onClick={() => { setAdminTab(t.id); if (t.id === 'campaigns' && typeof hydrateCampaignsFromApi === 'function') { try { hydrateCampaignsFromApi(true); } catch(_){} } if (t.id === 'dashboard' && typeof hydrateAdminStatsFromApi === 'function') { try { hydrateAdminStatsFromApi(); } catch(_){} } if (t.id === 'coupons' && typeof hydrateAdminCoupons === 'function') { try { hydrateAdminCoupons(); } catch(_){} } if (t.id === 'blog-new') { const defCat = ((adminBlogCategories || []).find(c => c.active !== false) || {}).name || 'راهنمای خرید'; setBlogForm({ id: '', title: '', cat: defCat, excerpt: '', body: '', status: 'published', author: 'تحریریه', read: '۵ دقیقه', publishAtDate: '', publishAtTime: '10:00', publishAtMs: null, publishAtFa: '', seoTitle: '', seoDescription: '', seoFocusKeywords: '', seoCanonical: '', seoOgImage: '', imageAlt: '', image: '', seoNoindex: false, seoFaq: [] }); } else if (t.id === 'blog') { setBlogForm(null); if (typeof hydrateBlogPostsFromApi === 'function') try { hydrateBlogPostsFromApi(); } catch(_){} } setAdminSellerDetailId(null); setAdminProductDetailId(null); setAdminOrderDetailId(null); setAdminTicketDetailId(null); setAdminBuyerDetailId(null); setAdminLoading(true); setTimeout(() => setAdminLoading(false), 200); requestAnimationFrame(() => scrollAdminPanelToTop()); }}
                        className={`flex-shrink-0 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap ${adminTab === t.id ? 'bg-apple-blue text-white' : 'text-primary-700 dark:text-white/80 hover:bg-primary-50 dark:hover:bg-primary-900'}`}>
                        <Icon name={t.icon === 'home' ? 'shield' : t.icon === 'package' ? 'shoppingBag' : t.icon === 'message' ? 'headphones' : t.icon === 'settings' ? 'pencil' : t.icon === 'percent' ? 'dollar' : t.icon} size={16} />
                        {t.label}
                        {t.id === 'tickets' && adminUnreadTickets > 0 && <span className="mr-auto text-xs bg-red-500 text-white rounded-full px-1.5 min-w-[18px] text-center">{toFa(adminUnreadTickets)}</span>}
                      </button>
                    ))}
                  </div>
                </aside>
                <div className="flex-1 min-w-0 min-h-0 pb-8 p-3 sm:p-5 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 shadow-sm">
                  {adminLoading && <LoadingState label="در حال بارگذاری پنل ادمین…" />}

                  {/* Dashboard */}
                  {!adminLoading && adminTab === 'dashboard' && (
                    <div className="space-y-6">
                      <h2 className="text-base font-bold text-primary-900 dark:text-white">داشبورد ادمین</h2>
                      <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-3">
                        <div>
                          <p className="text-sm font-bold text-primary-900 dark:text-white">پشتیبان دادهٔ مرورگر</p>
                          <p className="text-xs text-primary-500 dark:text-white/60 mt-1 leading-6">
                            داده‌ها از سرور خوانده و ذخیره می‌شوند.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              try {
                                downloadBackupFile(`pirahanemardane-backup-${Date.now()}.json`);
                                showToast({ message: 'فایل پشتیبان دانلود شد', variant: 'success', duration: 3500, position: 'top-center' });
                              } catch (_) {
                                showToast({ message: 'دانلود پشتیبان ناموفق بود', variant: 'error', duration: 4000, position: 'top-center' });
                              }
                            }}
                            className="text-xs px-3 py-2 rounded-full bg-apple-blue text-white font-medium"
                          >
                            دانلود پشتیبان JSON
                          </button>
                          <label className="text-xs px-3 py-2 rounded-full border border-primary-200 dark:border-white/25 text-primary-800 dark:text-white cursor-pointer font-medium">
                            بازیابی از فایل
                            <input
                              type="file"
                              accept="application/json,.json"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files && e.target.files[0];
                                e.target.value = '';
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = () => {
                                  const res = importClientBackup(String(reader.result || ''));
                                  if (res.ok) {
                                    showToast({ message: `بازیابی شد (${res.count} کلید) — در حال رفرش…`, variant: 'success', duration: 4000, position: 'top-center' });
                                    setTimeout(() => { try { window.location.reload(); } catch (_) {} }, 600);
                                  } else {
                                    showToast({ message: res.message || 'بازیابی ناموفق', variant: 'error', duration: 4500, position: 'top-center' });
                                  }
                                };
                                reader.readAsText(file);
                              }}
                            />
                          </label>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {(() => {
                          const live = (adminSettings && adminSettings.liveStats) || (typeof window !== 'undefined' ? window.__adminLiveStats : null) || {};
                          return [
                          { label: 'کل سفارش‌ها', value: toFa(live.orders ?? (adminOrders||[]).length) },
                          { label: 'سفارش پرداخت‌شده', value: toFa(live.paid_orders ?? (adminOrders||[]).filter(o=>o.status==='paid').length) },
                          { label: 'درآمد (تومان)', value: toFa(live.revenue ?? (adminOrders||[]).reduce((s,o)=>s+(o.total||0),0)) },
                          { label: 'فروشندگان', value: toFa(live.sellers ?? (adminSellers||[]).length) },
                          { label: 'فروشندگان فعال', value: toFa((adminSellers||[]).filter(s=>s.status==='approved').length) },
                          { label: 'محصولات', value: toFa(live.products ?? (adminProducts||[]).length) },
                          { label: 'محصول در انتظار', value: toFa((adminProducts||[]).filter(p=>p.status==='pending').length) },
                          { label: 'تیکت باز', value: toFa(live.tickets_open ?? (adminTickets||[]).filter(t=>t.status==='open'||t.status==='pending').length) },
                          { label: 'خریداران', value: toFa(live.buyers ?? (adminBuyers||[]).length) },
                        ];
                        })().map((c,i) => (
                          <div key={i} className="p-3 sm:p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                            <p className="text-xs text-primary-500 dark:!text-white mb-1">{c.label}</p>
                            <p className="text-lg sm:text-xl font-bold text-primary-900 dark:text-white">{c.value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-950/20">
                          <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-2">هشدارها</p>
                          <ul className="space-y-1.5 text-xs text-primary-700 dark:text-white/80">
                            <li>• {(adminSellers||[]).filter(s=>s.status==='pending').length} فروشنده در انتظار تأیید</li>
                            <li>• {(adminProducts||[]).filter(p=>p.status==='pending').length} محصول در انتظار تأیید</li>
                            <li>• {(adminTickets||[]).filter(t=>t.unread).length} تیکت خوانده‌نشده</li>
                            <li>• {(adminOrders||[]).filter(o=>o.status==='returned').length} سفارش مرجوعی</li>
                          </ul>
                        </div>
                        <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                          <p className="text-xs font-bold text-primary-700 dark:text-white mb-2">میان‌بر سریع</p>
                          <div className="flex flex-wrap gap-2">
                            {[{t:'sellers',l:'فروشندگان'},{t:'products',l:'محصولات'},{t:'orders',l:'سفارش‌ها'},{t:'tickets',l:'تیکت‌ها'}].map(x=>(
                              <button key={x.t} type="button" onClick={()=>setAdminTab(x.t)} className="px-3 py-1.5 rounded-full text-xs border border-primary-200 dark:border-white/30 hover:bg-primary-50 dark:hover:bg-primary-900">{x.l}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-primary-900 dark:text-white mb-3">آخرین سفارش‌ها</h3>
                        <div className="space-y-2">
                          {(adminOrders||[]).slice(0,8).map(o=>(
                            <button key={o.id} type="button" onClick={()=>{setAdminTab('orders');setAdminOrderDetailId(o.id);}} className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-primary-100 dark:border-white/10 hover:bg-primary-50 dark:hover:bg-primary-900 text-right">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-primary-900 dark:text-white">{o.id}</p>
                                <p className="text-xs text-primary-500">{o.buyerName} · {o.date}</p>
                                <p className="text-xs text-primary-600 dark:text-white/70 mt-0.5 truncate">فروشنده: {o.sellerName || o.seller?.name || o.items?.[0]?.sellerName || '—'}</p>
                              </div>
                              <div className="text-left flex-shrink-0">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${adminStatusBadge(o.status)}`}>{o.statusLabel||adminStatusLabel(o.status)}</span>
                                <p className="text-xs font-medium mt-1">{toFa((o.total||0).toLocaleString())} ت</p>
                              </div>
                            </button>
                          ))}
                          {!(adminOrders||[]).length && <p className="text-sm text-primary-400 text-center py-8">سفارشی وجود ندارد</p>}
                        </div>
                      </div>
                      {/* نمودارها و گزارش فروشگاه‌ها */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                          <h3 className="text-sm font-bold text-primary-900 dark:text-white mb-3">وضعیت سفارش‌ها</h3>
                          {(() => {
                            const list = adminOrders || [];
                            const statuses = [
                              { k: 'pending', l: 'در انتظار', c: 'bg-amber-400' },
                              { k: 'preparing', l: 'آماده‌سازی', c: 'bg-blue-400' },
                              { k: 'shipped', l: 'ارسال', c: 'bg-indigo-400' },
                              { k: 'delivered', l: 'تحویل', c: 'bg-emerald-400' },
                              { k: 'returned', l: 'مرجوعی', c: 'bg-red-400' },
                            ];
                            const total = Math.max(list.length, 1);
                            return (
                              <div className="space-y-2">
                                {statuses.map(s => {
                                  const n = list.filter(o => o.status === s.k).length;
                                  const pct = Math.round((n / total) * 100);
                                  return (
                                    <div key={s.k}>
                                      <div className="flex justify-between text-xs mb-0.5"><span>{s.l}</span><span>{toFa(n)} · {toFa(pct)}٪</span></div>
                                      <div className="h-2 rounded-full bg-primary-100 dark:bg-primary-800 overflow-hidden"><div className={`h-full ${s.c}`} style={{ width: pct + '%' }} /></div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>
                        <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                          <h3 className="text-sm font-bold text-primary-900 dark:text-white mb-3">سود / کارمزد (خلاصه)</h3>
                          {(() => {
                            const list = adminOrders || [];
                            const rev = list.reduce((s,o)=>s+(Number(o.total)||0),0);
                            const fee = list.reduce((s,o)=>s+(Number(o.platformFee)||Math.round((Number(o.total)||0)*0.08)),0);
                            const seller = rev - fee;
                            return (
                              <div className="space-y-3 text-sm">
                                <div className="flex justify-between"><span className="text-primary-500">فروش کل</span><span className="font-bold">{toFa(rev.toLocaleString())} ت</span></div>
                                <div className="flex justify-between"><span className="text-primary-500">کارمزد پلتفرم</span><span className="font-bold text-apple-blue">{toFa(fee.toLocaleString())} ت</span></div>
                                <div className="flex justify-between"><span className="text-primary-500">سهم فروشندگان</span><span className="font-bold text-emerald-600">{toFa(seller.toLocaleString())} ت</span></div>
                                <div className="h-3 rounded-full overflow-hidden flex bg-primary-100 dark:bg-primary-800">
                                  <div className="bg-apple-blue" style={{ width: (rev?Math.round(fee/rev*100):0)+'%' }} />
                                  <div className="bg-emerald-500" style={{ width: (rev?Math.round(seller/rev*100):0)+'%' }} />
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-3">
                        <h3 className="text-sm font-bold text-primary-900 dark:text-white">رتبه‌بندی فروشگاه‌ها (روزانه / هفتگی / ماهانه / سالانه)</h3>
                        {(() => {
                          const sellers = adminSellers || [];
                          const ranked = [...sellers].map(s => ({
                            ...s,
                            sales: Number(s.salesCount || s.ordersCount || Math.floor(Math.random()*50)+1),
                            rating: Number(s.rating || (3.5 + Math.random()*1.5).toFixed(1)),
                          })).sort((a,b)=>b.sales-a.sales);
                          const top = ranked.slice(0,3);
                          const bottom = [...ranked].sort((a,b)=>a.sales-b.sales).slice(0,3);
                          const topR = [...ranked].sort((a,b)=>b.rating-a.rating).slice(0,3);
                          const botR = [...ranked].sort((a,b)=>a.rating-b.rating).slice(0,3);
                          const row = (list, label) => {
                            const darkBg =
                              label === 'بیشترین فروش' ? 'dark:bg-emerald-950/70 dark:border-emerald-800/50' :
                              label === 'کمترین فروش' ? 'dark:bg-amber-950/60 dark:border-amber-800/45' :
                              label === 'بیشترین امتیاز' ? 'dark:bg-sky-950/70 dark:border-sky-800/50' :
                              'dark:bg-orange-950/50 dark:border-orange-800/40';
                            return (
                            <div key={label}>
                              <p className="text-xs font-bold text-primary-600 dark:text-white/70 mb-1">{label}</p>
                              <div className="space-y-1">
                                {list.length ? list.map((s,i)=>(
                                  <div key={s.id||i} className={`flex justify-between text-xs p-2 rounded-lg bg-primary-50/80 border border-transparent ${darkBg} text-primary-900 dark:text-white`}>
                                    <span className="truncate">{s.shopName||s.name}</span>
                                    <span className="font-medium">{label.includes('امتیاز') ? toFa(Number(s.rating).toFixed(1)) : toFa(s.sales)}</span>
                                  </div>
                                )) : <p className="text-xs text-primary-400">داده‌ای نیست</p>}
                              </div>
                            </div>
                          );};
                          return (
                            <div className="grid sm:grid-cols-2 gap-3">
                              {row(top, 'بیشترین فروش')}
                              {row(bottom, 'کمترین فروش')}
                              {row(topR, 'بیشترین امتیاز')}
                              {row(botR, 'کمترین امتیاز')}
                            </div>
                          );
                        })()}
                        <p className="text-xs text-primary-400">خلاصه بر اساس دادهٔ فعلی سفارش‌ها و فروشندگان · قابل تعمیم به بازه روزانه/هفتگی/ماهانه/سالانه</p>
                      </div>
                    </div>
                  )}

                  {/* Sellers management */}
                  {!adminLoading && adminTab === 'sellers' && !adminSellerDetailId && (
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <h2 className="text-base font-bold text-primary-900 dark:text-white">مدیریت فروشندگان</h2>
                        <input value={adminSellerSearch} onChange={e=>setAdminSellerSearch(e.target.value)} placeholder="جستجو نام یا موبایل…" className="px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm w-full sm:w-56 focus:outline-none focus:border-apple-blue" />
                      </div>
                      <div className="flex gap-1 overflow-x-auto no-scrollbar mb-4">
                        {[{id:'all',l:'همه'},{id:'pending',l:'در انتظار'},{id:'approved',l:'تأیید‌شده'},{id:'rejected',l:'رد‌شده'},{id:'suspended',l:'محدود شده'},{id:'archived',l:'آرشیو شده‌ها'}].map(f=>(
                          <button key={f.id} type="button" onClick={()=>setAdminSellerFilter(f.id)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition ${adminSellerFilter===f.id?'bg-primary-800 text-white border-primary-800 dark:bg-[#4CCD99] dark:!text-white dark:border-[#4CCD99]':'plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium'}`}>{f.l}</button>
                        ))}
                      </div>
                      {(adminListError && adminListError.sellers) && (
                        <div className="mb-3 p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700 flex flex-wrap items-center justify-between gap-2">
                          <span>{adminListError.sellers}</span>
                          <button type="button" onClick={() => { try { hydrateAdminSellers(); } catch (_) {} }} className="text-xs px-2.5 py-1 rounded-full border border-red-300">تلاش دوباره</button>
                        </div>
                      )}
                      {(adminListLoading && adminListLoading.sellers) && (
                        <p className="text-center text-sm text-primary-400 py-6">در حال بارگذاری فروشندگان…</p>
                      )}
                      <div className="space-y-2">
                        {adminSelectedSellerIds.length > 0 && (
                        <div className="mb-3 flex flex-wrap items-center gap-2 p-2.5 rounded-xl border border-red-200 bg-red-50/80 dark:bg-red-950/30 dark:border-red-500/30">
                          <span className="text-xs font-medium text-red-800 dark:text-red-200">{adminSelectedSellerIds.length} فروشنده انتخاب شده</span>
                          <button type="button" disabled={adminBulkBusy} onClick={() => runAdminBulkSellers(adminSellerFilter === 'archived' ? 'purge' : 'archive')} className="text-xs px-3 py-1.5 rounded-full bg-red-600 text-white font-medium disabled:opacity-50">
                            {adminBulkBusy ? 'در حال اجرا…' : (adminSellerFilter === 'archived' ? 'حذف دائم گروهی' : 'آرشیو گروهی')}
                          </button>
                          <button type="button" disabled={adminBulkBusy} onClick={() => setAdminSelectedSellerIds([])} className="text-xs px-3 py-1.5 rounded-full border border-primary-300 dark:border-white/30">لغو انتخاب</button>
                        </div>
                      )}
                      {(() => {
                          const visibleSellers = (adminSellers||[]).filter(s=>{
                          const st = String(s.status || '').toLowerCase();
                          // همه = تمام وضعیت‌ها از جمله آرشیو
                          if (adminSellerFilter === 'all') {
                            // no status filter
                          } else if (adminSellerFilter === 'archived') {
                            if (st !== 'archived') return false;
                          } else if (adminSellerFilter === 'suspended') {
                            if (st !== 'suspended' && st !== 'blocked') return false;
                          } else if (st !== String(adminSellerFilter || '').toLowerCase()) {
                            return false;
                          }
                          const q=(adminSellerSearch||'').trim().toLowerCase();
                          if(!q) return true;
                          return (s.shopName||'').toLowerCase().includes(q)||(s.phone||'').includes(q)||(s.ownerName||'').toLowerCase().includes(q);
                        });
                          const allSellersSelected = visibleSellers.length > 0 && visibleSellers.every((s) => adminSelectedSellerIds.includes(String(s.id)));
                          return (
                            <>
                        {visibleSellers.length > 0 && (
                          <label className="flex items-center gap-2 px-1 py-1 text-xs text-primary-600 dark:text-white/70 cursor-pointer select-none">
                            <input type="checkbox" checked={allSellersSelected} onChange={() => {
                              if (allSellersSelected) setAdminSelectedSellerIds([]);
                              else setAdminSelectedSellerIds(visibleSellers.map((s) => String(s.id)));
                            }} className="rounded border-primary-300" />
                            انتخاب همه در این فهرست ({visibleSellers.length})
                          </label>
                        )}
                        {visibleSellers.map(s=>(
                          <div key={s.id} className={`p-3 sm:p-4 rounded-2xl border bg-white dark:bg-primary-900 flex flex-col sm:flex-row sm:items-center gap-3 ${adminSelectedSellerIds.includes(String(s.id)) ? 'border-apple-blue ring-1 ring-apple-blue/30' : 'border-primary-200 dark:border-white/15'}`}>
                          <input type="checkbox" checked={adminSelectedSellerIds.includes(String(s.id))} onChange={() => toggleAdminSellerSelect(s.id)} className="rounded border-primary-300 flex-shrink-0" aria-label="انتخاب فروشنده" />
                            <button type="button" onClick={()=>setAdminSellerDetailId(s.id)} className="flex-1 text-right min-w-0">
                              <div className="flex items-start gap-3">
                                {s.logo ? (
                                  <img src={s.logo} alt="" className="w-12 h-12 rounded-xl object-cover border border-primary-100 dark:border-white/10 flex-shrink-0" onError={(e)=>{e.currentTarget.style.display='none'}} />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-800 flex items-center justify-center text-sm font-bold text-primary-500 flex-shrink-0">{(s.shopName||'ف').slice(0,1)}</div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-primary-900 dark:text-white truncate">{s.shopName || 'بدون نام فروشگاه'}</p>
                                  <p className="text-xs text-primary-500 dark:!text-white mt-0.5">
                                    {s.ownerName ? s.ownerName + ' · ' : ''}<span dir="ltr">{s.phone || '—'}</span>{s.city ? ' · ' + s.city : ''}
                                  </p>
                                  <p className="text-xs text-primary-400 mt-0.5">
                                    {toFa(s.productsCount||0)} محصول
                                    {s.activeProductsCount!=null ? ` · ${toFa(s.activeProductsCount)} فعال` : ''}
                                    {' · '}امتیاز {toFa(s.rating||0)}
                                    {s.createdAt ? ` · ${new Date(s.createdAt).toLocaleDateString('fa-IR')} ${new Date(s.createdAt).toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit'})}` : ''}
                                  </p>
                                </div>
                              </div>
                            </button>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${adminStatusBadge(s.status)}`}>{adminStatusLabel(s.status)}</span>
                              {s.status==='pending'&&(<>
                                <button type="button" onClick={()=>patchSellerStatus(s.id, 'approved')} className="text-xs px-2.5 py-1 rounded-full bg-emerald-600 text-white">تأیید</button>
                                <button type="button" onClick={()=>{sitePrompt('دلیل رد (اختیاری):').then((r)=>{patchSellerStatus(s.id, 'rejected');});}} className="text-xs px-2.5 py-1 rounded-full bg-red-500 text-white">رد</button>
                              </>)}
                              {s.status==='approved'&&<button type="button" onClick={()=>patchSellerStatus(s.id, 'blocked')} className="text-xs px-2.5 py-1 rounded-full border border-red-200 text-red-600">محدود کردن</button>}
                              {(s.status==='blocked'||s.status==='suspended')&&<button type="button" onClick={()=>patchSellerStatus(s.id, 'approved')} className="text-xs px-2.5 py-1 rounded-full border border-emerald-200 text-emerald-600">تأیید / رفع محدودیت</button>}
                              {String(s.status||'').toLowerCase()==='archived' ? (
                                <>
                                  <button type="button" onClick={()=>patchSellerStatus(s.id, 'approved')} className="text-xs px-2.5 py-1 rounded-full border border-emerald-200 text-emerald-700 bg-emerald-50">بازگردانی از آرشیو</button>
                                  <button type="button" onClick={async ()=>{
                                    const ok = typeof siteConfirm === 'function'
                                      ? await siteConfirm('این فروشنده برای همیشه از پایگاه داده و سایت حذف شود؟ محصولاتش آرشیو می‌مانند ولی فروشگاه پاک می‌شود. این عمل برگشت‌پذیر نیست.', 'حذف برای همیشه')
                                      : (typeof window !== 'undefined' && window.confirm('حذف برای همیشه؟ برگشت‌پذیر نیست.'));
                                    if (!ok) return;
                                    if (typeof adminPurgeSeller === 'function') await adminPurgeSeller(s.id);
                                    else if (typeof showToast === 'function') showToast({ message: 'حذف دائم در دسترس نیست', variant: 'error', duration: 4000, position: 'top-center' });
                                  }} className="text-xs px-2.5 py-1 rounded-full border border-red-500 bg-red-50 text-red-700 font-medium">حذف برای همیشه</button>
                                </>
                              ) : (
                                <button type="button" onClick={()=>deleteSeller(s.id)} className="text-xs px-2.5 py-1 rounded-full border border-red-300 bg-red-50 text-red-700">حذف</button>
                              )}
                            </div>
                          </div>
                        ))}
                        {!(adminListLoading && adminListLoading.sellers) && !(adminSellers||[]).length && (
                          <p className="text-center text-sm text-primary-400 py-10">
                            {(adminListError && adminListError.sellers) ? 'بارگذاری ناموفق بود' : 'فروشنده‌ای ثبت نشده'}
                          </p>
                        )}
                        {!visibleSellers.length && !!(adminSellers||[]).length && (
                          <p className="text-center text-sm text-primary-400 py-10">موردی با این فیلتر نیست</p>
                        )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                  {!adminLoading && adminTab === 'sellers' && adminSellerDetailId && (() => {
                    const detailId = String(adminSellerDetailId || '');
                    const s = (adminSellers || []).find((x) => x && String(x.id) === detailId) || null;
                    if (!s) {
                      return (
                        <div className="p-4">
                          <button type="button" onClick={() => setAdminSellerDetailId(null)} className="text-xs text-apple-blue mb-4">← بازگشت به لیست</button>
                          <p className="text-sm text-primary-500">فروشنده یافت نشد. از لیست دوباره انتخاب کنید.</p>
                        </div>
                      );
                    }
                    const sid = String(s.id);
                    const sellerProds = (adminProducts || []).filter((p) => p && (String(p.sellerId || p.seller_id || '') === sid));
                    const fa = (v) => {
                      try {
                        if (typeof toFa === 'function') return toFa(v);
                      } catch (_) {}
                      return String(v == null ? '' : v);
                    };
                    const badge = (st) => {
                      try {
                        if (typeof adminStatusBadge === 'function') return adminStatusBadge(st);
                      } catch (_) {}
                      return 'bg-primary-100 text-primary-700';
                    };
                    const label = (st) => {
                      try {
                        if (typeof adminStatusLabel === 'function') return adminStatusLabel(st);
                      } catch (_) {}
                      return String(st || '—');
                    };
                    const pubLogo = String(s.logoUrl || s.logo_url || s.logo || '');
                    const pubBanner = String(s.bannerUrl || s.banner_url || s.banner || '');
                    const pendLogo = String(s.logoPendingUrl || s.logo_pending_url || '');
                    const pendBanner = String(s.bannerPendingUrl || s.banner_pending_url || '');
                    const logoSt = String(s.logoStatus || s.logo_status || (pendLogo ? 'pending' : (pubLogo ? 'approved' : 'none'))).toLowerCase();
                    const bannerSt = String(s.bannerStatus || s.banner_status || (pendBanner ? 'pending' : (pubBanner ? 'approved' : 'none'))).toLowerCase();
                    const runMedia = async (kind, action) => {
                      try {
                        const msg = action === 'approve'
                          ? (kind === 'logo' ? 'عکس پروفایل منتشر شود؟' : 'کاور منتشر شود؟')
                          : (kind === 'logo' ? 'درخواست عکس پروفایل رد شود؟' : 'درخواست کاور رد شود؟');
                        let ok = true;
                        if (typeof siteConfirm === 'function') ok = await siteConfirm(msg, action === 'approve' ? 'تأیید' : 'رد');
                        else if (typeof window !== 'undefined') ok = window.confirm(msg);
                        if (!ok) return;
                        const res = await fetch('/api/admin/sellers/' + encodeURIComponent(sid), {
                          method: 'PATCH',
                          credentials: 'include',
                          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                          body: JSON.stringify({ mediaAction: action, mediaKind: kind }),
                        });
                        const data = await res.json().catch(() => null);
                        if (!res.ok || (data && data.ok === false)) {
                          if (typeof showToast === 'function') showToast({ message: (data && data.error) || 'خطا', variant: 'error', duration: 4000, position: 'top-center' });
                          return;
                        }
                        if (typeof showToast === 'function') showToast({ message: action === 'approve' ? 'تصویر منتشر شد' : 'رد شد', variant: 'success', duration: 3000, position: 'top-center' });
                        try { if (typeof hydrateAdminSellers === 'function') await hydrateAdminSellers(); } catch (_) {}
                        try { window.dispatchEvent(new CustomEvent('pm:invalidate', { detail: { scope: 'sellers', reason: 'admin-media', ts: Date.now() } })); } catch (_) {}
                      } catch (_) {
                        if (typeof showToast === 'function') showToast({ message: 'خطای شبکه', variant: 'error', duration: 4000, position: 'top-center' });
                      }
                    };
                    const setStatus = async (next) => {
                      try {
                        if (typeof patchSellerStatus === 'function') await patchSellerStatus(sid, next);
                        else if (typeof adminPatchSellerStatus === 'function') await adminPatchSellerStatus(sid, next);
                        else {
                          await fetch('/api/admin/sellers/' + encodeURIComponent(sid), {
                            method: 'PATCH', credentials: 'include',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: next }),
                          });
                        }
                        try { if (typeof hydrateAdminSellers === 'function') await hydrateAdminSellers(); } catch (_) {}
                      } catch (_) {}
                    };

                    return (
                      <div className="space-y-4">
                        <button type="button" onClick={() => setAdminSellerDetailId(null)} className="text-xs text-apple-blue flex items-center gap-1">← بازگشت به لیست</button>
                        <h2 className="text-base font-bold text-primary-900 dark:text-white">{String(s.shopName || s.name || 'فروشگاه')}</h2>

                        <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-4">
                          <h3 className="text-sm font-bold text-primary-900 dark:text-white">تصاویر فروشگاه (تأیید انتشار)</h3>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <p className="text-xs text-primary-500">پروفایل · {logoSt === 'pending' || pendLogo ? 'در انتظار تأیید' : logoSt === 'approved' ? 'منتشر شده' : '—'}</p>
                              <div className="w-20 h-20 rounded-full overflow-hidden border border-primary-200 bg-primary-50 flex items-center justify-center">
                                {(pendLogo || pubLogo) ? (
                                  <img src={pendLogo || pubLogo} alt="" className="w-full h-full object-cover" onError={(e) => { try { e.currentTarget.removeAttribute('src'); } catch (_) {} }} />
                                ) : <span className="text-[11px] text-primary-400">ندارد</span>}
                              </div>
                              {(logoSt === 'pending' || pendLogo) ? (
                                <div className="flex flex-wrap gap-2">
                                  <button type="button" onClick={() => runMedia('logo', 'approve')} className="text-xs px-3 py-1.5 rounded-full bg-emerald-600 text-white">تأیید پروفایل</button>
                                  <button type="button" onClick={() => runMedia('logo', 'reject')} className="text-xs px-3 py-1.5 rounded-full border border-red-300 text-red-600">رد</button>
                                </div>
                              ) : null}
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs text-primary-500">کاور · {bannerSt === 'pending' || pendBanner ? 'در انتظار تأیید' : bannerSt === 'approved' ? 'منتشر شده' : '—'}</p>
                              <div className="w-full h-20 rounded-xl overflow-hidden border border-primary-200 bg-primary-50 flex items-center justify-center">
                                {(pendBanner || pubBanner) ? (
                                  <img src={pendBanner || pubBanner} alt="" className="w-full h-full object-cover" onError={(e) => { try { e.currentTarget.removeAttribute('src'); } catch (_) {} }} />
                                ) : <span className="text-[11px] text-primary-400">ندارد</span>}
                              </div>
                              {(bannerSt === 'pending' || pendBanner) ? (
                                <div className="flex flex-wrap gap-2">
                                  <button type="button" onClick={() => runMedia('banner', 'approve')} className="text-xs px-3 py-1.5 rounded-full bg-emerald-600 text-white">تأیید کاور</button>
                                  <button type="button" onClick={() => runMedia('banner', 'reject')} className="text-xs px-3 py-1.5 rounded-full border border-red-300 text-red-600">رد</button>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 text-sm">
                          <div className="p-4 rounded-2xl bg-white dark:bg-primary-900 border border-primary-200 dark:border-white/15 space-y-1.5">
                            <p><span className="text-primary-500">مسئول:</span> {String(s.ownerName || '—')}</p>
                            <p><span className="text-primary-500">موبایل:</span> <span dir="ltr">{String(s.phone || '—')}</span></p>
                            <p><span className="text-primary-500">شهر:</span> {String(s.city || '—')}</p>
                            <p><span className="text-primary-500">عضویت:</span> {String(s.joinDate || s.createdAt || '—')}</p>
                            <p><span className="text-primary-500">شبا:</span> <span dir="ltr" className="text-xs">{String(s.sheba || '—')}</span></p>
                            <p><span className="text-primary-500">درباره:</span> {String(s.about || '—')}</p>
                            <p><span className={`text-xs px-2 py-0.5 rounded-full ${badge(s.status)}`}>{label(s.status)}</span></p>
                          </div>
                          <div className="p-4 rounded-2xl bg-white dark:bg-primary-900 border border-primary-200 dark:border-white/15 space-y-3">
                            <p className="text-sm">{fa(s.productsCount != null ? s.productsCount : sellerProds.length)} محصول · امتیاز {fa(s.rating || 0)}</p>
                            <div className="flex flex-wrap gap-2">
                              {String(s.status || '').toLowerCase() !== 'approved' && (
                                <button type="button" onClick={() => setStatus('approved')} className="text-xs px-3 py-1.5 rounded-full bg-emerald-600 text-white">تأیید فروشنده</button>
                              )}
                              {String(s.status || '').toLowerCase() !== 'suspended' && String(s.status || '').toLowerCase() !== 'archived' && (
                                <button type="button" onClick={() => setStatus('suspended')} className="text-xs px-3 py-1.5 rounded-full border border-amber-300 text-amber-700">تعلیق</button>
                              )}
                              {String(s.status || '').toLowerCase() === 'archived' ? (
                                <button type="button" onClick={() => setStatus('approved')} className="text-xs px-3 py-1.5 rounded-full border border-emerald-200 text-emerald-700">بازگردانی از آرشیو</button>
                              ) : (
                                <button type="button" onClick={() => setStatus('archived')} className="text-xs px-3 py-1.5 rounded-full border border-red-300 text-red-600">آرشیو</button>
                              )}
                              {String(s.status || '').toLowerCase() === 'archived' && (
                                <button type="button" onClick={async () => {
                                  const ok = typeof siteConfirm === 'function'
                                    ? await siteConfirm('حذف دائم این فروشنده؟ برگشت‌پذیر نیست.', 'حذف دائم')
                                    : (typeof window !== 'undefined' && window.confirm('حذف دائم؟'));
                                  if (!ok) return;
                                  if (typeof adminPurgeSeller === 'function') await adminPurgeSeller(sid);
                                }} className="text-xs px-3 py-1.5 rounded-full border border-red-500 bg-red-50 text-red-700">حذف دائم</button>
                              )}
                            </div>
                          </div>
                        </div>

                        <h3 className="text-sm font-bold">محصولات این فروشنده</h3>
                        <div className="space-y-2">
                          {sellerProds.map((p) => (
                            <div key={String(p.id)} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl bg-white dark:bg-primary-900 border border-primary-100 dark:border-white/10">
                              <img
                                src={String((p.image || (Array.isArray(p.images) && p.images[0]) || '/logo.webp'))}
                                alt=""
                                className="w-16 h-20 object-cover rounded-lg flex-shrink-0 bg-primary-50"
                                onError={(e) => { try { e.currentTarget.src = '/logo.webp'; } catch (_) {} }}
                              />
                              <div className="flex-1 min-w-0 text-right">
                                <p className="text-sm font-medium text-primary-900 dark:text-white truncate">{String(p.name || p.title || 'محصول')}</p>
                                <p className="text-xs text-primary-500 mt-0.5">{fa(Number(p.price || 0).toLocaleString())} ت · موجودی {fa(p.stock || 0)}</p>
                              </div>
                              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${badge(p.status)}`}>{label(p.status)}</span>
                                <button type="button" onClick={() => setAdminProductDetailId(p.id)} className="text-xs px-2 py-0.5 rounded-full border border-primary-200 dark:border-white/30">جزئیات</button>
                              </div>
                            </div>
                          ))}
                          {!sellerProds.length && <p className="text-xs text-primary-400">محصولی نیست</p>}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Products */}
                  {!adminLoading && adminTab === 'products' && !adminProductDetailId && (
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <h2 className="text-base font-bold text-primary-900 dark:text-white">مدیریت محصولات</h2>
                        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                          <button type="button" onClick={() => { try { window.dispatchEvent(new CustomEvent('admin-products-refetch')); window.dispatchEvent(new CustomEvent('admin-sellers-refetch')); } catch(_){} }} className="text-xs px-2 py-1 rounded-full border border-primary-200 dark:border-white/20 text-primary-700 dark:text-white">بازخوانی از سرور</button>
                          <button
                            type="button"
                            className="text-xs px-3 py-1.5 rounded-full border border-primary-200 dark:border-white/20 text-primary-700 dark:text-white font-medium flex items-center gap-1 hover:bg-primary-50 dark:hover:bg-primary-800"
                            title="بک‌آپ کامل جداول سرور (JSON)"
                            onClick={async () => {
                              try {
                                const res = await fetch('/api/admin/backup', { credentials: 'include' });
                                const json = await res.json().catch(() => ({}));
                                if (!json?.ok) {
                                  try { showToast({ message: json?.error || 'بک‌آپ ناموفق', variant: 'error', duration: 4000, position: 'top-center' }); } catch (_) {}
                                  return;
                                }
                                const blob = new Blob([JSON.stringify(json.backup, null, 2)], { type: 'application/json' });
                                const a = document.createElement('a');
                                a.href = URL.createObjectURL(blob);
                                a.download = 'pm-full-backup-' + Date.now() + '.json';
                                a.click();
                                setTimeout(() => URL.revokeObjectURL(a.href), 2000);
                                try { showToast({ message: 'بک‌آپ کامل سرور دانلود شد', variant: 'success', duration: 3500, position: 'top-center' }); } catch (_) {}
                              } catch (e) {
                                try { showToast({ message: 'خطای شبکه در بک‌آپ', variant: 'error', duration: 3500, position: 'top-center' }); } catch (_) {}
                              }
                            }}
                          >
                            <Icon name="download" size={14} /> بک‌آپ کامل
                          </button>
                          <label
                            className="text-xs px-3 py-1.5 rounded-full border border-primary-200 dark:border-white/20 text-primary-700 dark:text-white font-medium flex items-center gap-1 cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-800"
                            title="بازگردانی از فایل بک‌آپ سرور"
                          >
                            <Icon name="upload" size={14} /> بازگردانی کامل
                            <input
                              type="file"
                              accept="application/json,.json"
                              className="hidden"
                              onChange={async (e) => {
                                const f = e.target.files?.[0];
                                e.target.value = '';
                                if (!f) return;
                                try {
                                  const text = await f.text();
                                  const parsed = JSON.parse(text);
                                  const backup = parsed?.backup || parsed;
                                  if (!backup?.tables) {
                                    showToast({ message: 'فایل بک‌آپ سرور معتبر نیست', variant: 'error', duration: 4500, position: 'top-center' });
                                    return;
                                  }
                                  const ok = await siteConfirm(
                                    'بازگردانی کامل از این فایل؟\nداده‌ها با upsert روی سرور نوشته می‌شوند (حذف کامل انجام نمی‌شود).',
                                    'بازگردانی کامل'
                                  );
                                  if (!ok) return;
                                  const res = await fetch('/api/admin/backup', {
                                    method: 'POST',
                                    credentials: 'include',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ backup }),
                                  });
                                  const json = await res.json().catch(() => ({}));
                                  if (!json?.ok) {
                                    showToast({ message: json?.error || 'بازگردانی ناموفق', variant: 'error', duration: 5000, position: 'top-center' });
                                    return;
                                  }
                                  showToast({ message: 'بازگردانی کامل انجام شد', variant: 'success', duration: 4000, position: 'top-center' });
                                  try {
                                    window.dispatchEvent(new CustomEvent('admin-products-refetch'));
                                    window.dispatchEvent(new CustomEvent('admin-sellers-refetch'));
                                    if (typeof hydrateAdminProducts === 'function') hydrateAdminProducts();
                                    if (typeof hydrateAdminSellers === 'function') hydrateAdminSellers();
                                    if (typeof hydrateAdminOrders === 'function') hydrateAdminOrders();
                                  } catch (_) {}
                                } catch (err) {
                                  showToast({ message: 'خواندن یا ارسال فایل ناموفق بود', variant: 'error', duration: 4500, position: 'top-center' });
                                }
                              }}
                            />
                          </label>
                          <input value={adminProductSearch} onChange={e=>setAdminProductSearch(e.target.value)} placeholder="جستجو نام محصول…" className="px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm w-full sm:w-56 focus:outline-none focus:border-apple-blue" />
                        </div>
                      </div>
                      <div className="flex gap-1 overflow-x-auto no-scrollbar mb-4">
                        {[{id:'all',l:'همه'},{id:'active',l:'فعال'},{id:'pending',l:'در انتظار'},{id:'rejected',l:'رد‌شده'},{id:'inactive',l:'غیرفعال'},{id:'archived',l:'آرشیو شده‌ها'}].map(f=>(
                          <button key={f.id} type="button" onClick={()=>setAdminProductFilter(f.id)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border ${adminProductFilter===f.id?'bg-primary-800 text-white border-primary-800 dark:bg-[#4CCD99] dark:!text-white':'plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium'}`}>{f.l}</button>
                        ))}
                      </div>
                      {adminSelectedProductIds.length > 0 && (
                        <div className="mb-3 flex flex-wrap items-center gap-2 p-2.5 rounded-xl border border-red-200 bg-red-50/80 dark:bg-red-950/30 dark:border-red-500/30">
                          <span className="text-xs font-medium text-red-800 dark:text-red-200">{adminSelectedProductIds.length} محصول انتخاب شده</span>
                          <button type="button" disabled={adminBulkBusy} onClick={() => runAdminBulkProducts(adminProductFilter === 'archived' || adminProductFilter === 'purge_requested' ? 'purge' : 'archive')} className="text-xs px-3 py-1.5 rounded-full bg-red-600 text-white font-medium disabled:opacity-50">
                            {adminBulkBusy ? 'در حال اجرا…' : (adminProductFilter === 'archived' || adminProductFilter === 'purge_requested' ? 'حذف دائم گروهی' : 'آرشیو گروهی')}
                          </button>
                          <button type="button" disabled={adminBulkBusy} onClick={() => setAdminSelectedProductIds([])} className="text-xs px-3 py-1.5 rounded-full border border-primary-300 dark:border-white/30">لغو انتخاب</button>
                        </div>
                      )}
                      <div className="space-y-2">
                        {(() => {
                          const visibleProducts = (adminProducts||[]).filter(p=>{
                          const stt = p.status || '';
                          if (adminProductFilter === 'archived') {
                            if (stt !== 'archived') return false;
                          } else if (adminProductFilter === 'purge_requested') {
                            if (stt !== 'purge_requested') return false;
                          } else if (adminProductFilter === 'all') {
                            if (stt === 'archived' || stt === 'purge_requested') return false;
                          } else if (stt !== adminProductFilter) {
                            return false;
                          }
                          const q=adminProductSearch.trim().toLowerCase();
                          if(!q) return true;
                          return (p.name||'').toLowerCase().includes(q)||(p.sellerName||'').toLowerCase().includes(q)||String(p.productCode||'').toLowerCase().includes(q);
                          });
                          const allVisibleSelected = visibleProducts.length > 0 && visibleProducts.every((p) => adminSelectedProductIds.includes(String(p.id)));
                          return (
                            <>
                        {visibleProducts.length > 0 && (
                          <label className="flex items-center gap-2 px-1 py-1 text-xs text-primary-600 dark:text-white/70 cursor-pointer select-none">
                            <input type="checkbox" checked={allVisibleSelected} onChange={() => {
                              if (allVisibleSelected) setAdminSelectedProductIds([]);
                              else setAdminSelectedProductIds(visibleProducts.map((p) => String(p.id)));
                            }} className="rounded border-primary-300" />
                            انتخاب همه در این فهرست ({visibleProducts.length})
                          </label>
                        )}
                        {visibleProducts.map(p=>(
                          <div key={p.id} className={`flex flex-col sm:flex-row sm:items-stretch gap-3 p-3 rounded-2xl border bg-white dark:bg-primary-900 ${adminSelectedProductIds.includes(String(p.id)) ? 'border-apple-blue ring-1 ring-apple-blue/30' : 'border-primary-200 dark:border-white/15'}`}>
                            <div className="flex items-start gap-2 flex-shrink-0">
                              <input type="checkbox" checked={adminSelectedProductIds.includes(String(p.id))} onChange={() => toggleAdminProductSelect(p.id)} className="mt-2 rounded border-primary-300" aria-label="انتخاب محصول" />
                            <img
                              src={p.image || (Array.isArray(p.images) && p.images[0]) || '/logo.webp'}
                              alt=""
                              className="w-full sm:w-20 h-40 sm:h-24 object-cover rounded-xl flex-shrink-0 bg-primary-50 dark:bg-primary-800"
                              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo.webp'; }}
                            />
                            </div>
                            <div className="flex-1 min-w-0 text-right space-y-1">
                              <p className="text-sm font-bold text-primary-900 dark:text-white truncate">{p.name || p.title || 'بدون نام'}</p>
                              <p className="text-xs text-primary-600 dark:text-white/80">
                                فروشگاه: <span className="font-medium">{p.sellerName || '—'}</span>
                                {p.productCode ? <> · <span dir="ltr">کد {p.productCode}</span></> : null}
                              </p>
                              <p className="text-xs text-primary-500">
                                {toFa(Number(p.price || 0).toLocaleString())} تومان
                              </p>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-primary-500 dark:text-white/60 mt-0.5">
                                <span>موجودی <span className="font-medium text-primary-800 dark:text-white/90">{toFa(p.stock || 0)}</span></span>
                                {p.category ? (
                                  <>
                                    <span className="text-primary-300 dark:text-white/20">·</span>
                                    <button type="button" onClick={(e)=>{e.preventDefault();e.stopPropagation();try{if(typeof openCategory==='function')openCategory(p.category);else if(typeof openPLP==='function')openPLP({cat:p.category});}catch(_){}}} className="hover:text-apple-blue underline-offset-2 hover:underline">
                                      دسته <span className="font-medium text-primary-800 dark:text-white/90">{p.category}</span>
                                    </button>
                                  </>
                                ) : null}
                                {p.brand ? (
                                  <>
                                    <span className="text-primary-300 dark:text-white/20">·</span>
                                    <button type="button" onClick={(e)=>{e.preventDefault();e.stopPropagation();try{if(typeof openPLP==='function')openPLP({query:p.brand});}catch(_){}}} className="hover:text-apple-blue underline-offset-2 hover:underline">
                                      برند <span className="font-medium text-primary-800 dark:text-white/90">{p.brand}</span>
                                    </button>
                                  </>
                                ) : null}
                              </div>
                              {(Array.isArray(p.colors) && p.colors.length > 0) || (Array.isArray(p.sizes) && p.sizes.length > 0) ? (
                                <p className="text-xs text-primary-400">
                                  {Array.isArray(p.colors) && p.colors.length
                                    ? `رنگ: ${p.colors.map((c) => (typeof c === 'string' ? c : c?.name || '')).filter(Boolean).slice(0, 6).join('، ')}`
                                    : ''}
                                  {Array.isArray(p.sizes) && p.sizes.length
                                    ? `${Array.isArray(p.colors) && p.colors.length ? ' · ' : ''}سایز: ${p.sizes.slice(0, 8).join('، ')}`
                                    : ''}
                                </p>
                              ) : null}
                              {Array.isArray(p.tags) && p.tags.length > 0 && (
                                <p className="text-xs text-primary-400">برچسب: {p.tags.slice(0, 6).map((tg) => (typeof tg === 'string' ? tg : tg?.name || '')).filter(Boolean).join('، ')}</p>
                              )}
                              {p.attributes && typeof p.attributes === 'object' && Object.keys(p.attributes).length > 0 && (
                                <p className="text-xs text-primary-400 truncate">
                                  ویژگی: {Object.entries(p.attributes).slice(0, 4).map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`).join(' · ')}
                                </p>
                              )}
                              <p className="text-[10px] text-primary-400">
                                {p.createdAt
                                  ? `ثبت: ${new Date(p.createdAt).toLocaleDateString('fa-IR')} ${new Date(p.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`
                                  : ''}
                                {p.updatedAt
                                  ? ` · به‌روزرسانی: ${new Date(p.updatedAt).toLocaleDateString('fa-IR')} ${new Date(p.updatedAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`
                                  : ''}
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  try {
                                    const url = typeof getProductPublicUrl === 'function' ? getProductPublicUrl(p) : '';
                                    if (url && typeof copyTextToClipboard === 'function') {
                                      copyTextToClipboard(url);
                                      try { showToast({ message: 'لینک محصول کپی شد', variant: 'success', duration: 2500, position: 'top-center' }); } catch (_) {}
                                    } else {
                                      try { showToast({ message: 'لینک در دسترس نیست', variant: 'error', duration: 2500, position: 'top-center' }); } catch (_) {}
                                    }
                                  } catch (_) {}
                                }}
                                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border-2 border-apple-blue text-apple-blue bg-apple-blue/5 hover:bg-apple-blue hover:text-white transition"
                              >
                                <Icon name="copy" size={14} />
                                کپی لینک محصول
                              </button>
                            </div>
                            <div className="flex sm:flex-col items-end justify-between gap-2 flex-shrink-0">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${adminStatusBadge(p.status)}`}>{adminStatusLabel(p.status)}</span>
                              <div className="flex flex-wrap gap-1 justify-end">
                                {p.status === 'pending' && (
                                  <>
                                    <button type="button" onClick={() => patchAdminProductStatus(p.id, 'active')} className="text-xs px-2 py-0.5 rounded-full bg-emerald-600 text-white">تأیید</button>
                                    <button type="button" onClick={() => { sitePrompt('دلیل رد:').then(() => { patchAdminProductStatus(p.id, 'rejected'); }); }} className="text-xs px-2 py-0.5 rounded-full bg-red-500 text-white">رد</button>
                                  </>
                                )}
                                {p.status === 'active' && (
                                  <button type="button" onClick={() => patchAdminProductStatus(p.id, 'inactive')} className="text-xs px-2 py-0.5 rounded-full border border-primary-200 text-primary-600">غیرفعال</button>
                                )}
                                {p.status === 'inactive' && (
                                  <button type="button" onClick={() => patchAdminProductStatus(p.id, 'active')} className="text-xs px-2 py-0.5 rounded-full border border-emerald-200 text-emerald-600">فعال</button>
                                )}
                                {p.status === 'archived' && (
                                  <button type="button" onClick={() => patchAdminProductStatus(p.id, 'inactive')} className="text-xs px-2 py-0.5 rounded-full border border-emerald-200 text-emerald-600">بازگردانی از آرشیو</button>
                                )}
                                <button type="button" onClick={() => setAdminProductDetailId(p.id)} className="text-xs px-2 py-0.5 rounded-full border border-primary-200 dark:border-white/30">جزئیات / ویرایش</button>
                                {p.status === 'purge_requested' ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        siteConfirm('درخواست فروشنده تأیید شود و محصول برای همیشه از پایگاه داده حذف شود؟ برگشت‌پذیر نیست.').then((ok) => {
                                          if (!ok) return;
                                          if (typeof adminPurgeProduct === 'function') adminPurgeProduct(p.id);
                                        });
                                      }}
                                      className="text-xs px-2 py-0.5 rounded-full border border-red-500 bg-red-600 text-white font-medium"
                                    >
                                      تأیید حذف دائم
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (typeof adminPatchProductStatus === 'function') adminPatchProductStatus(p.id, 'archived');
                                        else if (typeof patchAdminProductStatus === 'function') patchAdminProductStatus(p.id, 'archived');
                                      }}
                                      className="text-xs px-2 py-0.5 rounded-full border border-amber-300 text-amber-700"
                                    >
                                      رد درخواست (بماند در آرشیو)
                                    </button>
                                  </>
                                ) : p.status === 'archived' ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      siteConfirm('این محصول برای همیشه از پایگاه داده و سایت حذف شود؟ این عمل برگشت‌پذیر نیست.').then((ok) => {
                                        if (!ok) return;
                                        if (typeof adminPurgeProduct === 'function') adminPurgeProduct(p.id);
                                      });
                                    }}
                                    className="text-xs px-2 py-0.5 rounded-full border border-red-500 bg-red-50 text-red-700 font-medium"
                                  >
                                    حذف برای همیشه
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      siteConfirm('این محصول به آرشیو منتقل شود؟').then((ok) => {
                                        if (ok) {
                                          if (typeof adminDeleteProduct === 'function') adminDeleteProduct(p.id);
                                          else patchAdminProductStatus(p.id, 'archived');
                                        }
                                      });
                                    }}
                                    className="text-xs px-2 py-0.5 rounded-full border border-red-200 text-red-600"
                                  >
                                    حذف
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {!(adminProducts||[]).length && <p className="text-center text-sm text-primary-400 py-10">محصولی نیست</p>}
                        {!visibleProducts.length && !!(adminProducts||[]).length && <p className="text-center text-sm text-primary-400 py-10">موردی با این فیلتر نیست</p>}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}


                  {/* Product detail / edit */}
                  {!adminLoading && adminTab === 'products' && adminProductDetailId && (() => {
                    const p = (adminProducts || []).find((x) => String(x.id) === String(adminProductDetailId));
                    if (!p) {
                      return (
                        <div className="p-6 text-center">
                          <p className="text-sm text-primary-500 mb-3">محصول یافت نشد</p>
                          <button type="button" onClick={() => setAdminProductDetailId(null)} className="text-xs text-apple-blue">← بازگشت به لیست</button>
                        </div>
                      );
                    }
                    return (
                      <div className="space-y-4" key={p.id}>
                        <button type="button" onClick={() => setAdminProductDetailId(null)} className="text-xs text-apple-blue flex items-center gap-1">← بازگشت به لیست محصولات</button>
                        <div className="flex flex-wrap items-start gap-4 p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                          <img src={p.image || (p.images && p.images[0]) || '/logo.webp'} alt="" className="w-28 h-36 object-cover rounded-xl bg-primary-50" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo.webp'; }} />
                          <div className="flex-1 min-w-0 space-y-1 text-right">
                            <h2 className="text-base font-bold text-primary-900 dark:text-white">{p.name || p.title}</h2>
                            <p className="text-xs text-primary-500">فروشگاه: {p.sellerName || '—'} · <span dir="ltr">{p.productCode || p.id}</span></p>
                            <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${adminStatusBadge(p.status)}`}>{adminStatusLabel(p.status)}</span>
                          </div>
                        </div>
                        <form
                          className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-3 text-right"
                          onSubmit={async (e) => {
                            e.preventDefault();
                            const fd = new FormData(e.currentTarget);
                            const name = String(fd.get('name') || '').trim();
                            const price = Number(String(fd.get('price') || '').replace(/[^\d.]/g, '')) || 0;
                            const stock = Number(String(fd.get('stock') || '').replace(/[^\d]/g, '')) || 0;
                            const category = String(fd.get('category') || '').trim();
                            const brand = String(fd.get('brand') || '').trim();
                            const description = String(fd.get('description') || '');
                            const image = String(fd.get('image') || '').trim();
                            const colorsRaw = String(fd.get('colors') || '').trim();
                            const sizesRaw = String(fd.get('sizes') || '').trim();
                            const tagsRaw = String(fd.get('tags') || '').trim();
                            const colors = colorsRaw ? colorsRaw.split(/[,،]/).map((s) => s.trim()).filter(Boolean) : [];
                            const sizes = sizesRaw ? sizesRaw.split(/[,،]/).map((s) => s.trim()).filter(Boolean) : [];
                            const tags = tagsRaw ? tagsRaw.split(/[,،]/).map((s) => s.trim()).filter(Boolean) : [];
                            if (!name) {
                              try { showToast({ message: 'نام محصول الزامی است', variant: 'error', duration: 3000, position: 'top-center' }); } catch (_) {}
                              return;
                            }
                            try {
                              const res = await fetch('/api/admin/products', {
                                method: 'PATCH',
                                credentials: 'include',
                                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                                body: JSON.stringify({ id: p.id, name, title: name, price, base_price: price, stock, category, brand, description, image, cover_image: image, colors, sizes, tags }),
                              });
                              const data = await res.json().catch(() => ({}));
                              if (!res.ok || !data?.ok) throw new Error(data?.error || ('خطا ' + res.status));
                              try { showToast({ message: 'محصول ذخیره شد', variant: 'success', duration: 3000, position: 'top-center' }); } catch (_) {}
                              if (typeof hydrateAdminProducts === 'function') await hydrateAdminProducts();
                              try { window.dispatchEvent(new CustomEvent('admin-products-refetch')); } catch (_) {}
                              try { window.dispatchEvent(new CustomEvent('catalog-products-refetch')); } catch (_) {}
                            } catch (err) {
                              try { showToast({ message: String(err?.message || err), variant: 'error', duration: 5000, position: 'top-center' }); } catch (_) {}
                            }
                          }}
                        >
                          <h3 className="text-sm font-bold text-primary-900 dark:text-white">ویرایش محصول</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label className="text-xs text-primary-500 space-y-1"><span>نام محصول</span><input name="name" defaultValue={p.name || p.title || ''} className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm" /></label>
                            <label className="text-xs text-primary-500 space-y-1"><span>قیمت (تومان)</span><input name="price" defaultValue={p.price || 0} inputMode="numeric" className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm" dir="ltr" /></label>
                            <label className="text-xs text-primary-500 space-y-1"><span>موجودی</span><input name="stock" defaultValue={p.stock || 0} inputMode="numeric" className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm" dir="ltr" /></label>
                            <label className="text-xs text-primary-500 space-y-1"><span>دسته‌بندی</span><input name="category" defaultValue={p.category || ''} className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm" /></label>
                            <label className="text-xs text-primary-500 space-y-1"><span>برند</span><input name="brand" defaultValue={p.brand || ''} className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm" /></label>
                            <label className="text-xs text-primary-500 space-y-1"><span>آدرس تصویر شاخص</span><input name="image" defaultValue={p.image || ''} className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm" dir="ltr" /></label>
                            <label className="text-xs text-primary-500 space-y-1 sm:col-span-2"><span>رنگ‌ها (با ویرگول)</span><input name="colors" defaultValue={(Array.isArray(p.colors) ? p.colors.map((c) => (typeof c === 'string' ? c : c?.name || '')).filter(Boolean) : []).join('، ')} className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm" /></label>
                            <label className="text-xs text-primary-500 space-y-1 sm:col-span-2"><span>سایزها (با ویرگول)</span><input name="sizes" defaultValue={(Array.isArray(p.sizes) ? p.sizes : []).join('، ')} className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm" /></label>
                            <label className="text-xs text-primary-500 space-y-1 sm:col-span-2"><span>برچسب‌ها (با ویرگول)</span><input name="tags" defaultValue={(Array.isArray(p.tags) ? p.tags.map((tg) => (typeof tg === 'string' ? tg : tg?.name || '')).filter(Boolean) : []).join('، ')} className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm" /></label>
                            <label className="text-xs text-primary-500 space-y-1 sm:col-span-2"><span>توضیحات</span><textarea name="description" defaultValue={p.description || ''} rows={4} className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm" /></label>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-2">
                            <button type="submit" className="btn-cta text-xs px-4 py-2 rounded-full bg-apple-blue text-white font-medium">ذخیره تغییرات</button>
                            {p.status === 'pending' && (<button type="button" onClick={() => patchAdminProductStatus(p.id, 'active')} className="text-xs px-3 py-2 rounded-full bg-emerald-600 text-white">تأیید و انتشار</button>)}
                            {p.status === 'active' && (<button type="button" onClick={() => patchAdminProductStatus(p.id, 'inactive')} className="text-xs px-3 py-2 rounded-full border border-primary-200 text-primary-600">غیرفعال</button>)}
                            {p.status === 'inactive' && (<button type="button" onClick={() => patchAdminProductStatus(p.id, 'active')} className="text-xs px-3 py-2 rounded-full border border-emerald-200 text-emerald-600">فعال‌سازی</button>)}
                            {p.status === 'purge_requested' ? (
                              <>
                                <button type="button" onClick={() => { siteConfirm('درخواست فروشنده تأیید شود و محصول برای همیشه از پایگاه داده حذف شود؟ برگشت‌پذیر نیست.').then((ok) => { if (!ok) return; if (typeof adminPurgeProduct === 'function') adminPurgeProduct(p.id); setAdminProductDetailId(null); }); }} className="text-xs px-3 py-2 rounded-full border border-red-500 bg-red-600 text-white font-medium">تأیید حذف دائم</button>
                                <button type="button" onClick={() => { if (typeof adminPatchProductStatus === 'function') adminPatchProductStatus(p.id, 'archived'); else if (typeof patchAdminProductStatus === 'function') patchAdminProductStatus(p.id, 'archived'); setAdminProductDetailId(null); }} className="text-xs px-3 py-2 rounded-full border border-amber-300 text-amber-700">رد درخواست</button>
                              </>
                            ) : p.status === 'archived' ? (
                              <button type="button" onClick={() => { siteConfirm('این محصول برای همیشه از پایگاه داده و سایت حذف شود؟ این عمل برگشت‌پذیر نیست.').then((ok) => { if (!ok) return; if (typeof adminPurgeProduct === 'function') adminPurgeProduct(p.id); setAdminProductDetailId(null); }); }} className="text-xs px-3 py-2 rounded-full border border-red-500 bg-red-50 text-red-700 font-medium">حذف برای همیشه</button>
                            ) : (
                              <button type="button" onClick={() => { siteConfirm('این محصول به آرشیو منتقل شود؟').then((ok) => { if (!ok) return; if (typeof adminDeleteProduct === 'function') adminDeleteProduct(p.id); else patchAdminProductStatus(p.id, 'archived'); setAdminProductDetailId(null); }); }} className="text-xs px-3 py-2 rounded-full border border-red-200 text-red-600">حذف</button>
                            )}
                          </div>
                        </form>
                      </div>
                    );
                  })()}

                  {/* Orders */}
                  {!adminLoading && adminTab === 'orders' && !adminOrderDetailId && (
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <h2 className="text-base font-bold text-primary-900 dark:text-white">مدیریت سفارش‌ها</h2>
                        <input value={adminOrderSearch} onChange={e=>setAdminOrderSearch(e.target.value)} placeholder="شماره سفارش یا موبایل…" className="px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm w-full sm:w-56 focus:outline-none focus:border-apple-blue" />
                      </div>
                      <div className="flex gap-1 overflow-x-auto no-scrollbar mb-4">
                        {[{id:'all',l:'همه'},{id:'pending',l:'در انتظار پرداخت'},{id:'preparing',l:'آماده‌سازی'},{id:'shipped',l:'ارسال‌شده'},{id:'delivered',l:'تحویل‌شده'},{id:'cancelled',l:'لغو'},{id:'returned',l:'مرجوع'}].map(f=>(
                          <button key={f.id} type="button" onClick={()=>setAdminOrderFilter(f.id)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border ${adminOrderFilter===f.id?'bg-primary-800 text-white border-primary-800 dark:bg-[#4CCD99] dark:!text-white':'plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium'}`}>{f.l}</button>
                        ))}
                      </div>
                      <div className="space-y-2">
                        {(adminOrders||[]).filter(o=>{
                          if(adminOrderFilter!=='all'&&o.status!==adminOrderFilter) return false;
                          const q=adminOrderSearch.trim().toLowerCase();
                          if(!q) return true;
                          return (o.id||'').toLowerCase().includes(q)||(o.buyerPhone||'').includes(q)||(o.buyerName||'').includes(q);
                        }).map(o=>(
                          <button key={o.id} type="button" onClick={()=>{setAdminOrderDetailId(o.id);setAdminOrderNote(o.adminNote||'');}} className="w-full p-3 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 text-right flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-primary-900 dark:text-white">{o.id}</p>
                              <p className="text-xs text-primary-500">{o.buyerName} · {o.date}</p>
                              <p className="text-xs text-primary-600 dark:text-white/70 mt-0.5 truncate">فروشنده: {o.sellerName || o.seller?.name || o.items?.[0]?.sellerName || o.items?.[0]?.seller || '—'}</p>
                            </div>
                            <div className="text-left">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${adminStatusBadge(o.status)}`}>{o.statusLabel||adminStatusLabel(o.status)}</span>
                              <p className="text-xs mt-1 font-medium">{toFa((o.total||0).toLocaleString())} ت</p>
                            </div>
                          </button>
                        ))}
                        {!(adminOrders||[]).length && <p className="text-center text-sm text-primary-400 py-10">سفارشی نیست</p>}
                      </div>
                    </div>
                  )}
                  {!adminLoading && adminTab === 'orders' && adminOrderDetailId && (()=>{
                    const o=(adminOrders||[]).find(x=>x.id===adminOrderDetailId);
                    if(!o) return null;
                    return (
                      <div>
                        <button type="button" onClick={()=>setAdminOrderDetailId(null)} className="text-xs text-apple-blue mb-4">← بازگشت</button>
                        <h2 className="text-base font-bold mb-4">{o.id}</h2>
                        <div className="space-y-4 text-sm">
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 space-y-2 bg-white dark:bg-primary-900">
                            <p>خریدار: {o.buyerName} · {(() => {
                              const ph = String(o.buyerPhone || '').trim();
                              if (!ph || ph === '—') return <span dir="ltr">—</span>;
                              const digits = ph.replace(/\D/g, '');
                              return digits ? <a href={`tel:${digits}`} className="text-apple-blue hover:underline font-medium" dir="ltr">{ph}</a> : <span dir="ltr">{ph}</span>;
                            })()}</p>
                            <p>آدرس: {o.address}</p>
                            <p>پرداخت: {o.payment}</p>
                            <div className="mt-2 pt-2 border-t border-primary-100 dark:border-white/10 space-y-1">
                              <p className="text-xs font-bold text-primary-800 dark:text-white">فروشنده / فروشگاه</p>
                              <p>نام فروشگاه: {o.sellerName || o.seller?.name || o.items?.[0]?.sellerName || '—'}</p>
                              <p>مسئول: {o.sellerOwner || o.seller?.ownerName || o.sellerContactName || '—'}</p>
                              <p>تماس: {(() => {
                              const ph = String(o.sellerPhone || o.seller?.phone || o.sellerContactPhone || '').trim();
                              if (!ph || ph === '—') return <span dir="ltr">—</span>;
                              const digits = ph.replace(/\D/g, '');
                              return digits ? <a href={`tel:${digits}`} className="text-apple-blue hover:underline font-medium" dir="ltr">{ph}</a> : <span dir="ltr">{ph}</span>;
                            })()}</p>
                              {(o.sellerEmail || o.seller?.email) && <p>ایمیل: <span dir="ltr">{o.sellerEmail || o.seller?.email}</span></p>}
                            </div>
                            {o.tracking && <p>رهگیری: <span dir="ltr">{o.tracking}</span></p>}
                            <p>وضعیت: <span className={`text-xs px-2 py-0.5 rounded-full ${adminStatusBadge(o.status)}`}>{o.statusLabel||adminStatusLabel(o.status)}</span></p>
                          </div>
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                            <p className="text-xs font-bold mb-2 text-primary-900 dark:text-white">کالاها</p>
                            {(o.items||[]).map((it,i)=>(
                              <div key={i} className="flex justify-between py-2 border-b border-primary-100 dark:border-white/10 text-xs last:border-0">
                                <span>{it.name} × {toFa(it.qty)} <span className="text-primary-400">({it.seller})</span></span>
                                <span>{toFa((it.price||0).toLocaleString())} ت</span>
                              </div>
                            ))}
                          </div>
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                            <p className="text-xs font-bold mb-2 text-primary-900 dark:text-white">تایم‌لاین</p>
                            <ul className="space-y-1 text-xs text-primary-600 dark:text-white/70">
                              {(o.history||[]).map((h,i)=><li key={i}>• {h.label} — {h.date}</li>)}
                            </ul>
                          </div>
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-2">
                            <label className="text-xs text-primary-500 block mb-1">تغییر وضعیت</label>
                            <select value={o.status} onChange={e=>{
                              const st=e.target.value;
                              const labels={pending:'در انتظار پرداخت',preparing:'آماده‌سازی',shipped:'ارسال‌شده',delivered:'تحویل‌شده',cancelled:'لغو',returned:'مرجوعی'};
                              saveAdminOrders((adminOrders||[]).map(x=>x.id===o.id?{...x,status:st,statusLabel:labels[st]||st,history:[...(x.history||[]),{label:labels[st]||st,date:'اکنون'}]}:x));
                            }} className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm">
                              {['pending','preparing','shipped','delivered','cancelled','returned'].map(s=><option key={s} value={s}>{adminStatusLabel(s)}</option>)}
                            </select>
                          </div>
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                            <label className="text-xs text-primary-500 block mb-1">یادداشت ادمین</label>
                            <Textarea value={adminOrderNote} onChange={(v) => setAdminOrderNote(v || '')} rows={2} placeholder="" style={{ minHeight: 72 }} />
                            <button type="button" onClick={()=>{saveAdminOrders((adminOrders||[]).map(x=>x.id===o.id?{...x,adminNote:adminOrderNote}:x));showToast({ message: 'ذخیره شد', variant: 'success', duration: 4500, position: 'top-center' });}} className="mt-2 text-xs px-3 py-1.5 rounded-full bg-apple-blue text-white">ذخیره یادداشت</button>
                            <div className="mt-3 flex flex-wrap gap-1">
                              {['paid','processing','shipped','delivered','cancelled'].map((st) => (
                                <button
                                  key={st}
                                  type="button"
                                  className="text-[10px] px-2 py-1 rounded-full border border-primary-200 dark:border-white/20"
                                  onClick={async () => {
                                    if (typeof setAdminOrderStatus === 'function') {
                                      const ok = await setAdminOrderStatus(o.id, st);
                                      if (ok) {
                                        saveAdminOrders((adminOrders||[]).map(x => x.id===o.id ? {...x, status: st} : x));
                                        try { showToast({ message: 'وضعیت سفارش به‌روز شد', variant: 'success', duration: 3000, position: 'top-center' }); } catch(_){}
                                      } else {
                                        try { showToast({ message: 'به‌روزرسانی سرور ناموفق', variant: 'error', duration: 3500, position: 'top-center' }); } catch(_){}
                                      }
                                    }
                                  }}
                                >{st}</button>
                              ))}
                            </div>
                            <div className="mt-3 flex flex-wrap gap-1">
                              {['paid','processing','shipped','delivered','cancelled'].map((st) => (
                                <button
                                  key={st}
                                  type="button"
                                  className="text-[10px] px-2 py-1 rounded-full border border-primary-200 dark:border-white/20"
                                  onClick={async () => {
                                    if (typeof setAdminOrderStatus === 'function') {
                                      const ok = await setAdminOrderStatus(o.id, st);
                                      if (ok) {
                                        saveAdminOrders((adminOrders||[]).map(x => x.id===o.id ? {...x, status: st} : x));
                                        try { showToast({ message: 'وضعیت سفارش به‌روز شد', variant: 'success', duration: 3000, position: 'top-center' }); } catch(_){}
                                      } else {
                                        try { showToast({ message: 'به‌روزرسانی سرور ناموفق', variant: 'error', duration: 3500, position: 'top-center' }); } catch(_){}
                                      }
                                    }
                                  }}
                                >{st}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Coupons */}
                  {!adminLoading && adminTab === 'coupons' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h2 className="text-base font-bold text-primary-900 dark:text-white">کدهای تخفیف</h2>
                        <button
                          type="button"
                          className="btn-cta text-xs px-3 py-1.5 rounded-full bg-apple-blue text-white font-bold"
                          onClick={async () => {
                            const code = window.prompt('کد تخفیف (مثلاً SUMMER20)');
                            if (!code) return;
                            const type = window.prompt('نوع: percent یا amount', 'percent') || 'percent';
                            const value = parseInt(window.prompt('مقدار (٪ یا تومان)', type === 'amount' ? '50000' : '10') || '0', 10);
                            if (!value) return;
                            const payload = { code: String(code).trim().toUpperCase(), type: type === 'amount' ? 'amount' : 'percent', value, status: 'active' };
                            let server = null;
                            try {
                              if (typeof createAdminCouponOnServer === 'function') server = await createAdminCouponOnServer(payload);
                            } catch (_) {}
                            const row = server
                              ? { id: server.id, code: server.code, type: server.type, value: server.value, status: server.active === false ? 'inactive' : 'active' }
                              : { id: 'local-' + Date.now(), ...payload };
                            saveAdminCoupons([row, ...(adminCoupons || [])]);
                            try { showToast({ message: server ? 'کوپن روی سرور ثبت شد' : 'کوپن محلی ذخیره شد', variant: 'success', duration: 3000, position: 'top-center' }); } catch (_) {}
                            if (typeof hydrateAdminCoupons === 'function') try { hydrateAdminCoupons(); } catch (_) {}
                          }}
                        >
                          + کوپن جدید
                        </button>
                      </div>
                      <div className="space-y-2">
                        {(adminCoupons || []).length === 0 && (
                          <EmptyStateBox title="کوپنی نیست" description="اولین کد تخفیف را بسازید." className="py-8" />
                        )}
                        {(adminCoupons || []).map((c) => (
                          <div key={c.id || c.code} className="flex items-center justify-between gap-2 p-3 rounded-xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                            <div className="text-right">
                              <p className="text-sm font-bold font-latin text-primary-900 dark:text-white">{c.code}</p>
                              <p className="text-xs text-primary-500">
                                {c.type === 'amount' ? `${Number(c.value || 0).toLocaleString('fa-IR')} تومان` : `${c.value}٪`}
                                {' · '}
                                {c.status === 'active' ? 'فعال' : c.status || '—'}
                              </p>
                            </div>
                            <button
                              type="button"
                              className="text-xs px-2 py-1 rounded-full border border-red-300 text-red-600"
                              onClick={async () => {
                                if (c.id && String(c.id).indexOf('local-') !== 0) {
                                  try {
                                    await fetch('/api/coupons/' + encodeURIComponent(c.id), { method: 'DELETE', credentials: 'include' });
                                  } catch (_) {}
                                }
                                saveAdminCoupons((adminCoupons || []).filter((x) => (x.id || x.code) !== (c.id || c.code)));
                              }}
                            >
                              حذف
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Tickets */}
                  {!adminLoading && adminTab === 'audit' && (
                    <div className="space-y-3" key="audit-panel">
                      <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-primary-900 dark:text-white">لاگ اقدامات ادمین</h2>
                        <button
                          type="button"
                          className="btn-cta text-xs px-3 py-1.5 rounded-full bg-apple-blue text-white"
                          onClick={async (e) => {
                            const box = e.currentTarget.closest('[data-audit-root]') || e.currentTarget.parentElement?.parentElement;
                            const listEl = box?.querySelector('[data-audit-list]');
                            if (listEl) listEl.innerHTML = '<p class="text-xs text-primary-500">در حال بارگذاری…</p>';
                            try {
                              const res = await fetch('/api/admin/audit?limit=80', { credentials: 'include', cache: 'no-store' });
                              const json = await res.json().catch(() => ({}));
                              if (!json?.ok) {
                                if (listEl) listEl.innerHTML = '<p class="text-xs text-red-500">' + (json?.error || 'خطا') + '</p>';
                                return;
                              }
                              const items = json.items || [];
                              if (!items.length) {
                                if (listEl) listEl.innerHTML = '<p class="text-xs text-primary-500">هنوز لاگی ثبت نشده.</p>';
                                return;
                              }
                              if (listEl) {
                                listEl.innerHTML = items.map((row) => {
                                  const when = row.created_at ? new Date(row.created_at).toLocaleString('fa-IR') : '';
                                  return '<div class="p-3 rounded-xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 text-right space-y-1">'
                                    + '<p class="text-sm font-bold text-primary-900 dark:text-white">' + (row.action || '') + '</p>'
                                    + '<p class="text-xs text-primary-500">' + (row.entity_type || '') + (row.entity_id ? ' · ' + row.entity_id.slice(0, 8) : '') + ' · ' + when + '</p>'
                                    + '</div>';
                                }).join('');
                              }
                            } catch (err) {
                              if (listEl) listEl.innerHTML = '<p class="text-xs text-red-500">خطای شبکه</p>';
                            }
                          }}
                        >بارگذاری لاگ</button>
                      </div>
                      <div data-audit-root>
                        <div data-audit-list className="space-y-2">
                          <p className="text-xs text-primary-500">روی «بارگذاری لاگ» بزنید.</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {!adminLoading && adminTab === 'tickets' && !adminTicketDetailId && (
                    <div>
                      <h2 className="text-base font-bold text-primary-900 dark:text-white mb-4">تیکت‌های پشتیبانی</h2>
                      <div className="flex gap-1 overflow-x-auto no-scrollbar mb-4">
                        {[{id:'all',l:'همه'},{id:'open',l:'باز'},{id:'pending',l:'در انتظار'},{id:'closed',l:'بسته'}].map(f=>(
                          <button key={f.id} type="button" onClick={()=>setAdminTicketFilter(f.id)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border ${adminTicketFilter===f.id?'bg-primary-800 text-white border-primary-800 dark:bg-[#4CCD99] dark:!text-white':'plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium'}`}>{f.l}</button>
                        ))}
                      </div>
                      <div className="space-y-2">
                        {(adminTickets||[]).filter(t=>adminTicketFilter==='all'||t.status===adminTicketFilter).map(t=>(
                          <button key={t.id} type="button" onClick={async ()=>{
                            setAdminTicketDetailId(t.id);
                            setAdminTicketReply('');
                            if(t.unread)saveAdminTickets((adminTickets||[]).map(x=>x.id===t.id?{...x,unread:false}:x));
                            try {
                              const res = await fetch('/api/tickets/' + encodeURIComponent(t.id), { credentials: 'include' });
                              const data = await res.json().catch(() => ({}));
                              if (data?.ok && Array.isArray(data.messages)) {
                                const msgs = data.messages.map((m) => ({
                                  from: m.sender_role === 'admin' || m.sender_role === 'support' ? 'admin' : 'buyer',
                                  text: m.body || '',
                                  date: m.created_at ? new Date(m.created_at).toLocaleDateString('fa-IR') : '',
                                  time: m.created_at ? new Date(m.created_at).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) : '',
                                }));
                                saveAdminTickets((adminTickets||[]).map(x => x.id === t.id ? { ...x, messages: msgs, unread: false } : x));
                              }
                            } catch (_) {}
                          }} className="w-full p-3 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 text-right flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-primary-900 dark:text-white flex items-center gap-2 flex-wrap">{t.unread&&<span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"/>}{t.subject}
                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${(t.type==='seller'||t.from==='seller')?'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300':'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300'}`}>{(t.type==='seller'||t.from==='seller')?'فروشنده':'خریدار'}</span>
                                <span className="text-xs px-1.5 py-0.5 rounded-full font-bold bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-white/80">{conversationChannelLabel(t)}</span>
                              </p>
                              <p className="text-xs text-primary-500"><span className="font-latin" dir="ltr">{t.code || t.id}</span> · {t.fromName} · {t.date}</p>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${adminStatusBadge(t.status)}`}>{adminStatusLabel(t.status)}</span>
                          </button>
                        ))}
                        {!(adminTickets||[]).length && <p className="text-center text-sm text-primary-400 py-10">تیکتی نیست</p>}
                      </div>
                    </div>
                  )}
                  {!adminLoading && adminTab === 'tickets' && adminTicketDetailId && (()=>{
                    const t=(adminTickets||[]).find(x=>x.id===adminTicketDetailId);
                    if(!t) return null;
                    return (
                      <div>
                        <button type="button" onClick={()=>setAdminTicketDetailId(null)} className="text-xs text-apple-blue mb-4">← بازگشت</button>
                        <h2 className="text-base font-bold mb-2">{t.subject}</h2>
                        <p className="text-xs text-primary-500 mb-1 font-latin" dir="ltr">کد تیکت: {t.code || t.id}</p>
                        <p className="text-xs text-primary-500 mb-4">{t.fromName} · {t.date} · <span className={`px-2 py-0.5 rounded-full ${adminStatusBadge(t.status)}`}>{adminStatusLabel(t.status)}</span></p>
                        <div className="space-y-3 mb-4">
                          {(t.messages||[]).map((m,i)=>(
                            <div key={i} className={`p-3 rounded-xl text-sm ${m.from==='admin'?'bg-apple-blue/10 border border-apple-blue/20':'bg-primary-50 dark:bg-primary-900 border border-primary-100 dark:border-white/10'}`}>
                              <p className="text-xs font-medium mb-1">{m.from==='admin'?'ادمین':m.from==='seller'?'فروشنده':m.from==='buyer'?'خریدار':'سیستم'} · {m.date}</p>
                              <p className="text-primary-800 dark:text-white/90">{stripLinksForDisplay(m.text)}</p>
                            </div>
                          ))}
                        </div>
                        {t.status!=='closed' && (
                          <div className="space-y-2">
                            <SimpleEditor
                              value={adminTicketReply}
                              onChange={(html) => setAdminTicketReply(html)}
                              placeholder="پاسخ ادمین…"
                              appearance="comment"
                              maxLength={8000}
                              mode="admin"
                            />
                            <div className="flex gap-2">
                              <button type="button" onClick={async ()=>{
                                const replyPlain = htmlToPlain(adminTicketReply || '').trim();
                                if(!replyPlain) return;
                                try {
                                  const res = await fetch('/api/tickets/' + encodeURIComponent(t.id) + '/messages', {
                                    method: 'POST',
                                    credentials: 'include',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ body: replyPlain }),
                                  });
                                  const data = await res.json().catch(() => ({}));
                                  if (!res.ok || !data?.ok) {
                                    try { pushLiveToast(data?.error || 'ارسال پاسخ ناموفق', { type: 'error' }); } catch (_) {}
                                    return;
                                  }
                                  const msg = { from: 'admin', text: replyPlain, html: adminTicketReply || '', date: new Date().toLocaleDateString('fa-IR'), time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) };
                                  saveAdminTickets((adminTickets||[]).map(x => x.id===t.id ? { ...x, status: 'open', messages: [...(x.messages||[]), msg], unread: false } : x));
                                  setAdminTicketReply('');
                                  pushLiveToast('پاسخ ارسال شد', { type: 'info' });
                                  if (typeof hydrateAdminTickets === 'function') try { hydrateAdminTickets(); } catch (_) {}
                                } catch (e) {
                                  try { pushLiveToast('خطای شبکه', { type: 'error' }); } catch (_) {}
                                }
                              }} className="px-4 py-2 rounded-full bg-apple-blue text-white text-sm">ارسال پاسخ</button>
                              <button type="button" onClick={async ()=>{
                                try {
                                  await fetch('/api/tickets/' + encodeURIComponent(t.id), {
                                    method: 'PATCH',
                                    credentials: 'include',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ status: 'closed' }),
                                  });
                                } catch (_) {}
                                saveAdminTickets((adminTickets||[]).map(x=>x.id===t.id?{...x,status:'closed'}:x));
                              }} className="px-4 py-2 rounded-full border border-primary-200 text-sm">بستن تیکت</button>
                            </div>
                          </div>
                        )}
                        {t.status==='closed' && <button type="button" onClick={()=>saveAdminTickets((adminTickets||[]).map(x=>x.id===t.id?{...x,status:'open'}:x))} className="text-xs px-3 py-1.5 rounded-full border border-primary-200">بازگشایی</button>}
                      </div>
                    );
                  })()}

                  {/* Buyers */}
                  {!adminLoading && adminTab === 'buyers' && !adminBuyerDetailId && (
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <h2 className="text-base font-bold text-primary-900 dark:text-white">مدیریت خریداران</h2>
                        <input value={adminBuyerSearch} onChange={e=>setAdminBuyerSearch(e.target.value)} placeholder="جستجو نام یا موبایل…" className="px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm w-full sm:w-56" />
                      </div>
                      <div className="space-y-2">
                        {(adminBuyers||[]).filter(b=>{
                          const q=adminBuyerSearch.trim().toLowerCase();
                          if(!q) return true;
                          return (b.name||'').toLowerCase().includes(q)||(b.phone||'').includes(q);
                        }).map(b=>(
                          <div key={b.id} className="p-3 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 flex items-center justify-between gap-3">
                            <button type="button" onClick={()=>setAdminBuyerDetailId(b.id)} className="text-right flex-1 min-w-0">
                              <p className="text-sm font-medium text-primary-900 dark:text-white">{b.name}</p>
                              <p className="text-xs text-primary-500" dir="ltr">{b.phone} · {toFa(b.ordersCount||0)} سفارش · {b.joinDate}</p>
                            </button>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${adminStatusBadge(b.status)}`}>{adminStatusLabel(b.status)}</span>
                              {b.status==='active'?<button type="button" onClick={()=>saveAdminBuyers((adminBuyers||[]).map(x=>x.id===b.id?{...x,status:'blocked'}:x))} className="text-xs px-2 py-1 rounded-full border border-red-200 text-red-600">محدود کردن</button>:
                              <button type="button" onClick={()=>saveAdminBuyers((adminBuyers||[]).map(x=>x.id===b.id?{...x,status:'active'}:x))} className="text-xs px-2 py-1 rounded-full border border-emerald-200 text-emerald-600">تأیید / رفع محدودیت</button>}
                            </div>
                          </div>
                        ))}
                        {!(adminBuyers||[]).length && <p className="text-center text-sm text-primary-400 py-10">خریداری نیست</p>}
                      </div>
                    </div>
                  )}
                  {!adminLoading && adminTab === 'buyers' && adminBuyerDetailId && (()=>{
                    const b=(adminBuyers||[]).find(x=>x.id===adminBuyerDetailId);
                    if(!b) return null;
                    const buyerOrders=(adminOrders||[]).filter(o=>(o.buyerPhone||'').replace(/\*/g,'').slice(0,4)===(b.phone||'').slice(0,4));
                    return (
                      <div>
                        <button type="button" onClick={()=>setAdminBuyerDetailId(null)} className="text-xs text-apple-blue mb-4">← بازگشت</button>
                        <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 mb-4 space-y-2">
                          <h2 className="text-base font-bold text-primary-900 dark:text-white">{b.name}</h2>
                          <p className="text-sm text-primary-500" dir="ltr">{b.phone}</p>
                          <p className="text-xs text-primary-600 dark:text-white/70">عضویت: {b.joinDate} · سفارش‌ها: {toFa(b.ordersCount||0)} · وضعیت: {b.status==='blocked'||b.status==='suspended'?'مسدود':'فعال'}</p>
                          {b.email && <p className="text-xs">ایمیل: <span dir="ltr">{b.email}</span></p>}
                          {b.city && <p className="text-xs">شهر: {b.city}</p>}
                          {b.address && <p className="text-xs">آدرس: {b.address}</p>}
                          <p className="text-xs text-primary-400">شناسه: {b.id}</p>
                        </div>
                        <h3 className="text-sm font-bold mb-2 text-primary-900 dark:text-white">سفارش‌های مرتبط</h3>
                        <div className="space-y-2">
                          {(buyerOrders.length?buyerOrders:(adminOrders||[]).slice(0,3)).map(o=>(
                            <div key={o.id} className="p-3 rounded-xl bg-white dark:bg-primary-900 border border-primary-200 dark:border-white/15 text-xs flex justify-between shadow-sm">
                              <span>{o.id} · {o.date}</span>
                              <span className={`px-2 py-0.5 rounded-full ${adminStatusBadge(o.status)}`}>{adminStatusLabel(o.status)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Settings */}
                  {/* Taxonomy — دسته‌بندی (ایندکس) و برچسب (ممنوع ایندکس) */}
                  {!adminLoading && adminTab === 'product-categories' && (
                    <div className="space-y-6">
{/* Categories */}
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                          <div>
                            <h2 className="text-base font-bold text-primary-900 dark:text-white">دسته‌بندی محصولات</h2>
                            <p className="text-xs text-primary-500 dark:!text-white mt-0.5">ایندکس‌پذیر · URL قابل ویرایش · تصویر و توضیح · در فرم فروشنده (حداکثر ۳)</p>
                          </div>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => openTaxonomyHub('categories')} className="text-xs px-3 py-1.5 rounded-full border plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium">مشاهده همه</button>
                            <button
                              type="button"
                              onClick={() => openTaxonomyWizard('category')}
                              className="text-xs px-3 py-1.5 rounded-full bg-apple-blue text-white font-medium flex items-center gap-1"
                            >
                              <Icon name="plus" size={14} /> افزودن دسته
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {(adminCategories || []).map((c) => (
                            <div key={c.id} className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                              {c.image ? <img src={c.image} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" /> : <div className="w-14 h-14 rounded-lg bg-primary-100 dark:bg-primary-800 flex-shrink-0" />}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-primary-900 dark:text-white">{c.name}</p>
                                <p className="text-xs text-primary-500 dark:!text-white mt-0.5 font-latin" dir="ltr">{c.url || `/${c.slug || c.name}`}</p>
                                {c.description && <p className="text-xs text-primary-400 dark:!text-white line-clamp-1 mt-0.5">{c.description}</p>}
                              </div>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">index</span>
                              <button type="button" onClick={() => openCategory(c.name)} className="text-xs px-2 py-1 rounded-full border border-primary-200 dark:border-white/20 text-primary-600 dark:text-white">صفحه</button>
                              <button type="button" onClick={() => openTaxonomyWizard('category', c)} className="p-1.5 rounded-full hover:bg-primary-50 dark:hover:bg-primary-800 text-primary-500"><Icon name="pencil" size={14} /></button>
                              <button type="button" onClick={() => { siteConfirm('حذف این دسته؟').then(ok=>{ if(ok) saveAdminCategories((adminCategories || []).filter(x => x.id !== c.id)); }); }} className="p-1.5 rounded-full hover:bg-red-50 text-red-500"><Icon name="trash" size={14} /></button>
                            </div>
                          ))}
                          {!(adminCategories || []).length && <p className="text-sm text-primary-400 text-center py-8">دسته‌ای ثبت نشده</p>}
                        </div>
                      </div>

                      </div>
                  )}


                  {!adminLoading && adminTab === 'product-tags' && (
                    <div className="space-y-6">
{/* Tags */}
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                          <div>
                            <h2 className="text-base font-bold text-primary-900 dark:text-white">برچسب محصولات</h2>
                            <p className="text-xs text-primary-500 dark:!text-white mt-0.5">صفحه مستقل · ممنوع ایندکس · تصویر و توضیح · در فرم فروشنده (حداکثر ۳)</p>
                          </div>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => openTaxonomyHub('tags')} className="text-xs px-3 py-1.5 rounded-full border plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium">مشاهده همه</button>
                            <button
                              type="button"
                              onClick={() => openTaxonomyWizard('tag')}
                              className="text-xs px-3 py-1.5 rounded-full bg-apple-blue text-white font-medium flex items-center gap-1"
                            >
                              <Icon name="plus" size={14} /> افزودن برچسب
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {(adminTags || []).map((t) => (
                            <div key={t.id} className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                              {t.image ? <img src={t.image} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" /> : <div className="w-14 h-14 rounded-lg bg-primary-100 dark:bg-primary-800 flex-shrink-0" />}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-primary-900 dark:text-white">{t.name}</p>
                                <p className="text-xs text-primary-500 dark:!text-white mt-0.5 font-latin" dir="ltr">{t.url || `/shop?tag=${t.slug}`}</p>
                                {t.description && <p className="text-xs text-primary-400 dark:!text-white line-clamp-1 mt-0.5">{t.description}</p>}
                              </div>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">noindex</span>
                              <button type="button" onClick={() => openTagPage(t.name)} className="text-xs px-2 py-1 rounded-full border border-primary-200 dark:border-white/20 text-primary-600 dark:text-white">صفحه</button>
                              <button type="button" onClick={() => openTaxonomyWizard('tag', t)} className="p-1.5 rounded-full hover:bg-primary-50 dark:hover:bg-primary-800 text-primary-500"><Icon name="pencil" size={14} /></button>
                              <button type="button" onClick={() => { siteConfirm('حذف این برچسب؟').then(ok=>{ if(ok) saveAdminTags((adminTags || []).filter(x => x.id !== t.id)); }); }} className="p-1.5 rounded-full hover:bg-red-50 text-red-500"><Icon name="trash" size={14} /></button>
                            </div>
                          ))}
                          {!(adminTags || []).length && <p className="text-sm text-primary-400 text-center py-8">برچسبی ثبت نشده</p>}
                        </div>
                      </div>
                      </div>
                  )}

                  {!adminLoading && adminTab === 'brands' && (
                    <div className="space-y-6">
{/* Brands catalog */}
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                          <div>
                            <h2 className="text-base font-bold text-primary-900 dark:text-white">برندها</h2>
                            <p className="text-xs text-primary-500">فروشنده موظف است یک برند از این لیست انتخاب کند</p>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                          <button type="button" onClick={() => openTaxonomyWizard('brand')} className="text-xs px-3 py-1.5 rounded-full bg-apple-blue text-white font-medium flex items-center gap-1"><Icon name="plus" size={14} /> افزودن برند</button>
                          <button type="button" onClick={() => { closeAdminPanel(); openStaticPage('brands'); }} className="text-xs px-3 py-1.5 rounded-full border plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium font-medium">مشاهده همه</button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {(adminCatalogBrands || []).map(b => (
                            <div key={b.id} className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-primary-900 dark:text-white">{b.name}</p>
                                {b.seoTitle && <p className="text-[10px] text-primary-400 truncate">SEO: {b.seoTitle}</p>}
                              </div>
                              <button type="button" onClick={() => saveAdminCatalogBrands((adminCatalogBrands || []).map(x => x.id === b.id ? { ...x, active: x.active === false } : x))} className={`text-xs px-2 py-1 rounded-full border ${b.active === false ? 'border-amber-300 text-amber-700' : 'border-emerald-300 text-emerald-700'}`}>{b.active === false ? 'غیرفعال' : 'فعال'}</button>
                              <button type="button" onClick={() => openTaxonomyWizard('brand', b)} className="p-1.5 rounded-full hover:bg-primary-50 text-primary-500"><Icon name="pencil" size={14} /></button>
                              <button type="button" onClick={() => { siteConfirm('حذف این برند؟').then(ok=>{ if(ok) saveAdminCatalogBrands((adminCatalogBrands || []).filter(x => x.id !== b.id)); }); }} className="p-1.5 rounded-full hover:bg-red-50 text-red-500"><Icon name="trash" size={14} /></button>
                            </div>
                          ))}
                        </div>
                      </div>

                                          </div>
                  )}

                  
                  {!adminLoading && adminTab === 'pages' && (
                    <div className="space-y-4 max-w-3xl">
                      <div>
                        <h2 className="text-base font-bold text-primary-900 dark:text-white">برگه‌ها</h2>
                        <p className="text-xs text-primary-500 mt-1">محتوا با ویرایشگر متن · سوالات متداول · سئو هر برگه</p>
                      </div>
                      {(() => {
                        const base = (seoCfg().canonicalBase || 'https://pirahanemardane.ir').replace(/\/$/, '');
                        const sitePages = [
                          { key: 'static:home', label: 'صفحه اصلی', slug: '', cmsKey: 'home', open: () => { setShowAdminPanel(false); setPdpProduct(null); setActiveSellerId(null); setShowSellersList(false); setShowPLP(false); try { closeStaticPage(); } catch (_) {} window.scrollTo({ top: 0, behavior: 'smooth' }); } },
                          { key: 'static:shop', label: 'فروشگاه', slug: 'shop', cmsKey: 'shop', hasBody: true, bodyLabel: 'توضیح پایین صفحه فروشگاه (قبل از فوتر)', open: () => { setShowAdminPanel(false); try { openPLP({}); } catch (_) { setShowPLP(true); } } },
                          { key: 'static:about', label: 'درباره ما', slug: 'about', cmsKey: 'about', hasBody: true, open: () => { setShowAdminPanel(false); openStaticPage('about'); } },
                          { key: 'static:contact', label: 'تماس با ما', slug: 'contact', cmsKey: 'contact', hasBody: true, open: () => { setShowAdminPanel(false); openStaticPage('contact'); } },
                          { key: 'static:deals', label: 'شگفت‌انگیز', slug: 'deals', cmsKey: 'deals', hasBody: true, open: () => { setShowAdminPanel(false); openStaticPage('deals'); } },
                          { key: 'static:terms', label: 'قوانین و شرایط', slug: 'terms', cmsKey: 'terms', hasBody: true, open: () => { setShowAdminPanel(false); openStaticPage('terms'); } },
                          { key: 'static:privacy', label: 'حریم خصوصی', slug: 'privacy', cmsKey: 'privacy', hasBody: true, open: () => { setShowAdminPanel(false); openStaticPage('privacy'); } },
                          { key: 'static:returns', label: 'شرایط بازگشت کالا', slug: 'returns', cmsKey: 'returns', hasBody: true, open: () => { setShowAdminPanel(false); openStaticPage('returns'); } },
                          { key: 'static:size-guide', label: 'راهنمای سایز', slug: 'size-guide', cmsKey: 'size-guide', hasBody: true, open: () => { setShowAdminPanel(false); openStaticPage('size-guide'); } },
                          { key: 'static:faq', label: 'سوالات متداول', slug: 'faq', cmsKey: 'faq', hasBody: true, hasSiteFaqs: true, open: () => { setShowAdminPanel(false); openStaticPage('faq'); } },
                          { key: 'sellers', label: 'فروشندگان', slug: 'sellers', cmsKey: 'sellers', hasBody: true, open: () => { setShowAdminPanel(false); setShowSellersList(true); setActiveSellerId(null); try { closeStaticPage(); } catch (_) {} } },
                          { key: 'static:seller', label: 'صفحه تکی فروشندگان', slug: 'seller', cmsKey: 'seller', hasBody: true, open: () => { setShowAdminPanel(false); setShowSellersList(true); setActiveSellerId(null); try { closeStaticPage(); } catch (_) {} } },
                          { key: 'static:become-seller', label: 'فروشنده شوید', slug: 'become-seller', cmsKey: 'become-seller', hasBody: true, hasPageFaqs: true, open: () => { setShowAdminPanel(false); openStaticPage('become-seller'); } },
                        ];
                        const active = sitePages.find(x => x.key === adminSeoHubKey) || null;
                        const loadForm = (item) => {
                          const o = pageSeoMap[item.key] || {};
                          return {
                            title: o.title || item.label || '',
                            description: o.description || '',
                            focusKeywords: o.focusKeywords || '',
                            canonical: o.canonical || '',
                            ogImage: o.ogImage || '',
                            noindex: o.indexable === false,
                            faq: Array.isArray(o.faq) ? o.faq : [],
                            slug: o.slug != null && o.slug !== '' ? o.slug : (item.slug || ''),
                          };
                        };
                        const cms = active ? (getPageCms(active.cmsKey) || {}) : {};
                        const pageFaqs = Array.isArray(cms.faqs) ? cms.faqs : (active?.hasPageFaqs ? DEFAULT_SELLER_FAQS : []);
                        return (
                          <div className="space-y-3">
                            <div className="rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 divide-y divide-primary-50 dark:divide-white/5 overflow-hidden">
                              {sitePages.map(item => {
                                const saved = pageSeoMap[item.key] || getPageCms(item.cmsKey);
                                const isOn = adminSeoHubKey === item.key;
                                return (
                                  <div key={item.key} className={`flex items-center gap-2 px-3 py-2.5 ${isOn ? 'bg-primary-50 dark:bg-primary-800' : ''}`}>
                                    <button type="button" onClick={() => { setAdminSeoHubKey(isOn ? null : item.key); if (!isOn) setAdminPageSeoStep(1); }} className="flex-1 text-right flex items-center justify-between gap-2 min-w-0">
                                      <span className="text-sm font-medium text-primary-900 dark:text-white truncate">{item.label}</span>
                                      <span className="text-[10px] text-primary-400 flex-shrink-0">{saved ? 'دارای محتوا/سئو' : 'پیش‌فرض'}</span>
                                    </button>
                                    <button type="button" onClick={item.open} className="text-[10px] px-2 py-1 rounded-full border border-primary-200 dark:border-white/20 text-primary-600 dark:text-white/80 whitespace-nowrap">مشاهده</button>
                                  </div>
                                );
                              })}
                            </div>
                            {active && (
                              <div className="space-y-4">
                                <div className="flex items-center justify-between gap-2">
                                  <h3 className="text-sm font-bold text-primary-900 dark:text-white">{active.label}</h3>
                                  <button type="button" onClick={() => setAdminSeoHubKey(null)} className="text-xs text-primary-500">بستن</button>
                                </div>

                                {(active.hasBody || active.cmsKey === 'shop') && (
                                  <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-3">
                                    <p className="text-xs font-bold text-primary-900 dark:text-white">{active.bodyLabel || 'محتوای صفحه (ویرایشگر متن)'}</p>
                                    <SimpleEditor
                                      key={`cms-body-${active.cmsKey}`}
                                      mode="admin"
                                      value={active.cmsKey === 'shop' ? getShopSeoBody() : (cms.body || '')}
                                      onChange={(html) => {
                                        updatePageCms(active.cmsKey, { body: html });
                                        if (active.cmsKey === 'shop') {
                                          try { saveAdminSettings({ ...adminSettings, shopSeoHtml: html, shopSeoText: htmlToPlain(html).slice(0, 500) }); } catch (_) {}
                                        }
                                      }}
                                      placeholder="متن صفحه را بنویسید…"
                                      minHeight={180}
                                    />
                                    <div className="grid sm:grid-cols-2 gap-2">
                                      <input dir="ltr" value={cms.image || ''} onChange={(e) => updatePageCms(active.cmsKey, { image: e.target.value })} placeholder="آدرس تصویر (اختیاری)" className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left" />
                                      <input dir="ltr" value={cms.video || ''} onChange={(e) => updatePageCms(active.cmsKey, { video: e.target.value })} placeholder="آدرس ویدیو / آپارات (اختیاری)" className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left" />
                                    </div>
                                    <p className="text-[10px] text-primary-400">ذخیره خودکار · بلافاصله در سایت اعمال می‌شود</p>
                                  </div>
                                )}

                                {active.hasSiteFaqs && (
                                  <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-3">
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="text-xs font-bold text-primary-900 dark:text-white">سوالات متداول صفحه</p>
                                      <button type="button" className="text-xs text-apple-blue" onClick={() => saveSiteFaqs([...(siteFaqs || []), { cat: 'عمومی', q: '', a: '' }])}>+ افزودن سوال</button>
                                    </div>
                                    {(siteFaqs || []).map((f, i) => (
                                      <div key={i} className="p-3 rounded-xl border border-primary-100 dark:border-white/10 space-y-2">
                                        <div className="grid sm:grid-cols-2 gap-2">
                                          <input value={f.cat || ''} onChange={(e) => { const next = [...siteFaqs]; next[i] = { ...next[i], cat: e.target.value }; saveSiteFaqs(next); }} placeholder="دسته (مثلاً ارسال)" className="w-full px-2 py-1.5 rounded-lg border border-primary-200 dark:border-white/15 bg-transparent text-xs" />
                                          <button type="button" className="text-xs text-red-500 text-left sm:text-right" onClick={() => saveSiteFaqs(siteFaqs.filter((_, j) => j !== i))}>حذف سوال</button>
                                        </div>
                                        <input value={f.q || ''} onChange={(e) => { const next = [...siteFaqs]; next[i] = { ...next[i], q: e.target.value }; saveSiteFaqs(next); }} placeholder="سؤال" className="w-full px-2 py-1.5 rounded-lg border border-primary-200 dark:border-white/15 bg-transparent text-xs font-medium" />
                                        <SimpleEditor
                                          key={`site-faq-${i}`}
                                          mode="admin"
                                          value={f.a || ''}
                                          onChange={(html) => { const next = [...siteFaqs]; next[i] = { ...next[i], a: html }; saveSiteFaqs(next); }}
                                          placeholder="پاسخ (ویرایشگر متن)"
                                          minHeight={100}
                                        />
                                      </div>
                                    ))}
                                    {!(siteFaqs || []).length && <EmptyStateBox title="هنوز سوالی ثبت نشده" description="سوالات متداول را از همین بخش اضافه کنید." className="py-6" />}
                                  </div>
                                )}

                                {active.hasPageFaqs && (
                                  <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-3">
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="text-xs font-bold text-primary-900 dark:text-white">سوالات متداول این صفحه</p>
                                      <button type="button" className="text-xs text-apple-blue" onClick={() => updatePageCms(active.cmsKey, { faqs: [...pageFaqs, { cat: '', q: '', a: '' }] })}>+ افزودن سوال</button>
                                    </div>
                                    {pageFaqs.map((f, i) => (
                                      <div key={i} className="p-3 rounded-xl border border-primary-100 dark:border-white/10 space-y-2">
                                        <div className="flex gap-2 items-center">
                                          <input value={f.cat || ''} onChange={(e) => { const next = [...pageFaqs]; next[i] = { ...next[i], cat: e.target.value }; updatePageCms(active.cmsKey, { faqs: next }); }} placeholder="دسته" className="flex-1 px-2 py-1.5 rounded-lg border border-primary-200 dark:border-white/15 bg-transparent text-xs" />
                                          <button type="button" className="text-xs text-red-500" onClick={() => updatePageCms(active.cmsKey, { faqs: pageFaqs.filter((_, j) => j !== i) })}>حذف</button>
                                        </div>
                                        <input value={f.q || ''} onChange={(e) => { const next = [...pageFaqs]; next[i] = { ...next[i], q: e.target.value }; updatePageCms(active.cmsKey, { faqs: next }); }} placeholder="سؤال" className="w-full px-2 py-1.5 rounded-lg border border-primary-200 dark:border-white/15 bg-transparent text-xs font-medium" />
                                        <SimpleEditor
                                          key={`page-faq-${active.cmsKey}-${i}`}
                                          mode="admin"
                                          value={f.a || ''}
                                          onChange={(html) => { const next = [...pageFaqs]; next[i] = { ...next[i], a: html }; updatePageCms(active.cmsKey, { faqs: next }); }}
                                          placeholder="پاسخ (ویرایشگر متن)"
                                          minHeight={100}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {(() => {
                                  const f = loadForm(active);
                                  const PAGE_SEO_STEPS = [
                                    { n: 1, part: 'keywords', label: '۱. کلمات کلیدی' },
                                    { n: 2, part: 'title', label: '۲. عنوان سئو (SEO Title)+پیش‌نمایش گوگل' },
                                    { n: 3, part: 'desc', label: '۳. توضیحات متا (Meta Description)+پیش‌نمایش گوگل' },
                                    { n: 4, part: 'faq', label: '۴. FAQ (Schema)' },
                                    { n: 5, part: 'index', label: '۵. ایندکس' },
                                    { n: 6, part: 'canonical', label: '۶. کنونیکال' },
                                    { n: 7, part: 'social', label: '۷. پیش‌نمایش شبکه اجتماعی' },
                                    { n: 8, part: 'ai', label: '۸. پیشنهاد هوشمند (AI محلی)' },
                                  ];
                                  const step = Math.min(8, Math.max(1, adminPageSeoStep || 1));
                                  const current = PAGE_SEO_STEPS[step - 1];
                                  const seoOnChange = (patch) => {
                                    const prev = pageSeoMap[active.key] || {};
                                    const nextNoindex = patch.noindex != null ? patch.noindex : f.noindex;
                                    savePageSeoMap({
                                      ...pageSeoMap,
                                      [active.key]: {
                                        ...prev,
                                        title: patch.title != null ? patch.title : (prev.title || f.title),
                                        description: patch.description != null ? patch.description : (prev.description || f.description),
                                        focusKeywords: patch.focusKeywords != null ? patch.focusKeywords : (prev.focusKeywords || f.focusKeywords),
                                        canonical: patch.canonical != null ? patch.canonical : (prev.canonical || f.canonical),
                                        ogImage: patch.ogImage != null ? patch.ogImage : (prev.ogImage || f.ogImage),
                                        indexable: !nextNoindex,
                                        faq: Array.isArray(prev.faq) ? prev.faq : f.faq,
                                        type: 'page',
                                        label: active.label,
                                        slug: f.slug || active.slug,
                                        updatedAt: new Date().toISOString(),
                                      },
                                    });
                                  };
                                  return (
                                    <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-4">
                                      <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <h3 className="text-sm font-bold text-primary-900 dark:text-white">سئوی «{active.label}»</h3>
                                        <span className="text-[10px] text-primary-400">مرحله {toFa(step)} از {toFa(8)}</span>
                                      </div>
                                      <div className="flex flex-wrap gap-1">
                                        {PAGE_SEO_STEPS.map((s) => (
                                          <button
                                            key={s.n}
                                            type="button"
                                            onClick={() => setAdminPageSeoStep(s.n)}
                                            className={`text-[10px] px-2 py-1 rounded-full border transition ${step === s.n ? 'bg-apple-blue text-white border-apple-blue' : 'border-primary-200 dark:border-white/20 text-primary-600 dark:text-white/70'}`}
                                          >{toFa(s.n)}</button>
                                        ))}
                                      </div>
                                      <p className="text-xs font-semibold text-primary-700 dark:text-white/90">{current.label}</p>
                                      {renderContentSeoBox({
                                        title: f.title,
                                        description: f.description,
                                        focusKeywords: f.focusKeywords,
                                        slug: f.slug,
                                        bodyText: f.description,
                                        contentTitle: active.label,
                                        image: f.ogImage,
                                        imageAlt: active.label,
                                        noindex: f.noindex,
                                        canonical: f.canonical,
                                        ogImage: f.ogImage,
                                        faqItems: f.faq,
                                        seoPart: current.part,
                                        adminSeoLayout: true,
                                        maxKeywords: 5,
                                        previewUrl: base + '/' + (f.slug || active.slug || ''),
                                        onFaqChange: (items) => {
                                          const prev = pageSeoMap[active.key] || {};
                                          savePageSeoMap({
                                            ...pageSeoMap,
                                            [active.key]: {
                                              ...prev,
                                              title: f.title,
                                              description: f.description,
                                              focusKeywords: f.focusKeywords,
                                              canonical: f.canonical,
                                              ogImage: f.ogImage,
                                              faq: items,
                                              indexable: !(prev.indexable === false || f.noindex),
                                              type: 'page',
                                              label: active.label,
                                              slug: f.slug,
                                              updatedAt: new Date().toISOString(),
                                            },
                                          });
                                        },
                                        onChange: seoOnChange,
                                      })}
                                      <div className="flex items-center justify-between gap-2 pt-1" dir="rtl">
                                        <button
                                          type="button"
                                          disabled={step <= 1}
                                          onClick={() => setAdminPageSeoStep(Math.max(1, step - 1))}
                                          className={`text-xs px-4 py-2 rounded-full border ${step <= 1 ? 'opacity-40 border-primary-100 text-primary-300' : 'border-primary-200 dark:border-white/25 text-primary-800 dark:text-white'}`}
                                        >مرحله قبل</button>
                                        {step < 8 ? (
                                          <button
                                            type="button"
                                            onClick={() => setAdminPageSeoStep(Math.min(8, step + 1))}
                                            className="text-xs px-4 py-2 rounded-full bg-apple-blue text-white font-medium"
                                          >مرحله بعد</button>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => showToast({ message: 'سئوی صفحه ذخیره شد', variant: 'success', duration: 3500, position: 'top-center' })}
                                            className="text-xs px-4 py-2 rounded-full bg-emerald-600 text-white font-medium"
                                          >پایان</button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}

{!adminLoading && adminTab === 'taxonomy' && (
                    <div className="space-y-8">
{/* Colors catalog */}
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                          <div>
                            <h2 className="text-base font-bold text-primary-900 dark:text-white">رنگ‌ها</h2>
                            <p className="text-xs text-primary-500">فروشنده فقط از این رنگ‌ها برای محصول انتخاب می‌کند</p>
                          </div>
                          <button type="button" onClick={() => {
                            sitePromptFields('افزودن رنگ', [
                              { key: 'name', label: 'نام رنگ (مثلاً مشکی)', defaultValue: '' },
                              { key: 'hex', label: 'کد رنگ hex', defaultValue: '#888888', dir: 'ltr' },
                            ]).then((v) => {
                              if (!v) return;
                              const name = (v.name || '').trim();
                              const hex = (v.hex || '#888888').trim() || '#888888';
                              if (!name) return;
                              saveAdminCatalogColors([...(adminCatalogColors || []), { id: 'col-' + Date.now(), name, hex, active: true }]);
                            });
                          }} className="text-xs px-3 py-1.5 rounded-full bg-apple-blue text-white font-medium flex items-center gap-1"><Icon name="plus" size={14} /> افزودن رنگ</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(adminCatalogColors || []).map(col => (
                            <div key={col.id} className="flex items-center gap-2 p-3 rounded-xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                              <span className="color-swatch w-8 h-8 rounded-full border border-primary-200 dark:border-white/70 flex-shrink-0" style={{ ["--swatch-color"]: col.hex || "#888", backgroundColor: col.hex || "#888" }} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-primary-900 dark:text-white">{col.name}</p>
                                <p className="text-xs text-primary-400" dir="ltr">{col.hex}</p>
                              </div>
                              <button type="button" onClick={() => saveAdminCatalogColors((adminCatalogColors || []).map(x => x.id === col.id ? { ...x, active: x.active === false } : x))} className={`text-xs px-2 py-1 rounded-full border ${col.active === false ? 'border-amber-300 text-amber-700' : 'border-emerald-300 text-emerald-700'}`}>{col.active === false ? 'غیرفعال' : 'فعال'}</button>
                              <button type="button" onClick={() => {
                                sitePromptFields('ویرایش رنگ', [
                                  { key: 'name', label: 'نام رنگ', defaultValue: col.name },
                                  { key: 'hex', label: 'کد hex', defaultValue: col.hex || '#888888', dir: 'ltr' },
                                ]).then((v) => {
                                  if (!v) return;
                                  const name = (v.name || '').trim();
                                  const hex = (v.hex || col.hex || '').trim();
                                  if (!name) return;
                                  saveAdminCatalogColors((adminCatalogColors || []).map(x => x.id === col.id ? { ...x, name, hex } : x));
                                });
                              }} className="p-1.5 rounded-full hover:bg-primary-50 text-primary-500"><Icon name="pencil" size={14} /></button>
                              <button type="button" onClick={() => { siteConfirm('حذف این رنگ؟').then(ok=>{ if(ok) saveAdminCatalogColors((adminCatalogColors || []).filter(x => x.id !== col.id)); }); }} className="p-1.5 rounded-full hover:bg-red-50 text-red-500"><Icon name="trash" size={14} /></button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sizes catalog */}
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                          <div>
                            <h2 className="text-base font-bold text-primary-900 dark:text-white">سایزها</h2>
                            <p className="text-xs text-primary-500">فروشنده فقط سایزهای فعال این لیست را می‌تواند روی محصول بگذارد</p>
                          </div>
                          <button type="button" onClick={() => {
                            sitePrompt('نام سایز (مثلاً M یا 40):').then((name) => {
                              name = (name || '').trim();
                              if (!name) return;
                              if ((adminCatalogSizes || []).some(s => s.name === name)) { showToast({ message: 'این سایز از قبل هست', variant: 'error', duration: 4500, position: 'top-center' }); return; }
                              saveAdminCatalogSizes([...(adminCatalogSizes || []), { id: 'sz-' + Date.now(), name, active: true }]);
                            });
                          }} className="text-xs px-3 py-1.5 rounded-full bg-apple-blue text-white font-medium flex items-center gap-1"><Icon name="plus" size={14} /> افزودن سایز</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(adminCatalogSizes || []).map(sz => (
                            <div key={sz.id} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border ${sz.active === false ? 'opacity-50 border-primary-200' : 'border-primary-200 dark:border-white/15'} bg-white dark:bg-primary-900`}>
                              <span className="latin-label text-sm font-bold text-primary-900 dark:text-white" dir="ltr" lang="en">{sz.name}</span>
                              <button type="button" onClick={() => saveAdminCatalogSizes((adminCatalogSizes || []).map(x => x.id === sz.id ? { ...x, active: x.active === false } : x))} className="text-xs text-primary-500 hover:text-apple-blue">{sz.active === false ? 'فعال‌سازی' : 'غیرفعال'}</button>
                              <button type="button" onClick={() => { siteConfirm('حذف سایز؟').then(ok=>{ if(ok) saveAdminCatalogSizes((adminCatalogSizes || []).filter(x => x.id !== sz.id)); }); }} className="text-red-500 text-xs">حذف</button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Attributes catalog */}
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                          <div>
                            <h2 className="text-base font-bold text-primary-900 dark:text-white">ویژگی‌های محصول</h2>
                            <p className="text-xs text-primary-500">چند گزینه انتخاب کنید تا در واریانت و صفحه محصول قابل انتخاب باشد · قابل محدود به دسته (شرطی)</p>
                          </div>
                          <button type="button" onClick={() => {
                            sitePromptFields('افزودن ویژگی', [
                              { key: 'name', label: 'نام ویژگی (مثلاً جنس پارچه)', defaultValue: '' },
                              { key: 'opts', label: 'گزینه‌ها (با ویرگول جدا کنید)', defaultValue: 'گزینه۱, گزینه۲' },
                              { key: 'cats', label: 'محدود به دسته‌ها (خالی = همه)', defaultValue: '' },
                              { key: 'flags', label: 'اجباری؟ چند‌انتخابی؟ (بله/خیر — با ویرگول: اجباری,چند)', defaultValue: 'خیر,خیر' },
                            ]).then((v) => {
                              if (!v) return;
                              const name = (v.name || '').trim();
                              if (!name) return;
                              const opts = String(v.opts || '').split(/[,،]/).map(s => s.trim()).filter(Boolean);
                              if (!opts.length) { showToast({ message: 'حداقل یک گزینه لازم است', variant: 'error', duration: 4500, position: 'top-center' }); return; }
                              const flags = String(v.flags || '').split(/[,،]/).map(s => s.trim());
                              const yes = (s) => /^(1|y|yes|بله|آره|true)$/i.test(s || '');
                              const required = yes(flags[0]);
                              const multi = yes(flags[1]);
                              const catHint = String(v.cats || '').split(/[,،]/).map(s => s.trim()).filter(Boolean);
                              saveAdminCatalogAttributes([...(adminCatalogAttributes || []), {
                                id: 'attr-' + Date.now(),
                                name,
                                active: true,
                                required,
                                multi,
                                categoryNames: catHint,
                                options: opts,
                              }]);
                            });
                          }} className="text-xs px-3 py-1.5 rounded-full bg-apple-blue text-white font-medium flex items-center gap-1"><Icon name="plus" size={14} /> افزودن ویژگی</button>
                        </div>
                        <div className="space-y-2">
                          {(adminCatalogAttributes || []).map(attr => (
                            <div key={attr.id} className="p-3 rounded-xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <p className="flex-1 text-sm font-bold text-primary-900 dark:text-white">{attr.name}</p>
                                {attr.required && <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-50 text-red-600">اجباری</span>}
                                {attr.multi && <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600">چند‌انتخابی</span>}
                                {attr.categoryNames?.length ? <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700">شرطی: {attr.categoryNames.join('، ')}</span> : <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary-50 text-primary-500">همه دسته‌ها</span>}
                                <button type="button" onClick={() => saveAdminCatalogAttributes((adminCatalogAttributes || []).map(x => x.id === attr.id ? { ...x, active: x.active === false } : x))} className={`text-xs px-2 py-1 rounded-full border ${attr.active === false ? 'border-amber-300 text-amber-700' : 'border-emerald-300 text-emerald-700'}`}>{attr.active === false ? 'غیرفعال' : 'فعال'}</button>
                                <button type="button" onClick={() => {
                                  sitePromptFields('ویرایش ویژگی', [
                                    { key: 'name', label: 'نام ویژگی', defaultValue: attr.name },
                                    { key: 'opts', label: 'گزینه‌ها (ویرگول‌جدا)', defaultValue: (attr.options || []).join('، ') },
                                    { key: 'cats', label: 'دسته‌های شرطی (خالی=همه)', defaultValue: (attr.categoryNames || []).join('، ') },
                                  ]).then((v) => {
                                    if (!v) return;
                                    const name = (v.name || '').trim();
                                    if (!name) return;
                                    const opts = String(v.opts || '').split(/[,،]/).map(s => s.trim()).filter(Boolean);
                                    const catHint = String(v.cats || '').split(/[,،]/).map(s => s.trim()).filter(Boolean);
                                    saveAdminCatalogAttributes((adminCatalogAttributes || []).map(x => x.id === attr.id ? { ...x, name, options: opts.length ? opts : x.options, categoryNames: catHint } : x));
                                  });
                                }} className="p-1.5 rounded-full hover:bg-primary-50 text-primary-500"><Icon name="pencil" size={14} /></button>
                                <button type="button" onClick={() => { siteConfirm('حذف این ویژگی؟').then(ok=>{ if(ok) saveAdminCatalogAttributes((adminCatalogAttributes || []).filter(x => x.id !== attr.id)); }); }} className="p-1.5 rounded-full hover:bg-red-50 text-red-500"><Icon name="trash" size={14} /></button>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {(attr.options || []).map(opt => (
                                  <span key={opt} className="text-xs px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-white/80 border border-primary-100 dark:border-white/10">{opt}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                          {!(adminCatalogAttributes || []).length && <EmptyStateBox title="هنوز ویژگی‌ای تعریف نشده" description="ویژگی‌های محصول را برای واریانت‌ها تعریف کنید." className="py-6" />}
                        </div>
                      </div>

                                          </div>
                  )}

                  {!adminLoading && adminTab === 'blog-categories' && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h2 className="text-base font-bold text-primary-900 dark:text-white">دسته‌بندی بلاگ</h2>
                          <p className="text-xs text-primary-500 dark:!text-white mt-0.5">دسته‌های مطالب بلاگ برای انتخاب در افزودن مطلب</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => openTaxonomyWizard('blog-category')}
                          className="text-xs px-3 py-1.5 rounded-full bg-apple-blue text-white font-medium flex items-center gap-1"
                        >
                          <Icon name="plus" size={14} /> افزودن دسته
                        </button>
                      </div>
                      <div className="space-y-2">
                        {(adminBlogCategories || []).map((c) => (
                          <div key={c.id} className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                            <p className="flex-1 text-sm font-medium text-primary-900 dark:text-white">{c.name}</p>
                            <button type="button" onClick={() => saveAdminBlogCategories((adminBlogCategories || []).map((x) => x.id === c.id ? { ...x, active: x.active === false } : x))} className={`text-xs px-2 py-1 rounded-full border ${c.active === false ? 'border-amber-300 text-amber-700' : 'border-emerald-300 text-emerald-700'}`}>{c.active === false ? 'غیرفعال' : 'فعال'}</button>
                            <button type="button" onClick={() => openTaxonomyWizard('blog-category', c)} className="p-1.5 rounded-full hover:bg-primary-50 text-primary-500"><Icon name="pencil" size={14} /></button>
                            <button type="button" onClick={() => { siteConfirm('حذف این دسته بلاگ؟').then((ok) => { if (ok) saveAdminBlogCategories((adminBlogCategories || []).filter((x) => x.id !== c.id)); }); }} className="p-1.5 rounded-full hover:bg-red-50 text-red-500"><Icon name="trash" size={14} /></button>
                          </div>
                        ))}
                        {!(adminBlogCategories || []).length && <EmptyStateBox title="هنوز دسته‌ای تعریف نشده" className="py-6" />}
                      </div>

                      <div className="pt-6 border-t border-primary-100 dark:border-white/10 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h2 className="text-base font-bold text-primary-900 dark:text-white">برچسب مقالات</h2>
                            <p className="text-xs text-primary-500 mt-0.5">برچسب‌های مطالب بلاگ</p>
                          </div>
                          <button type="button" onClick={() => openTaxonomyWizard('blog-tag')} className="text-xs px-3 py-1.5 rounded-full bg-apple-blue text-white font-medium flex items-center gap-1">
                            <Icon name="plus" size={14} /> افزودن برچسب
                          </button>
                        </div>
                        <div className="space-y-2">
                          {(adminBlogTags || []).map((tg) => (
                            <div key={tg.id} className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                              <p className="flex-1 text-sm font-medium text-primary-900 dark:text-white">{tg.name}</p>
                              <button type="button" onClick={() => openTaxonomyWizard('blog-tag', tg)} className="p-1.5 rounded-full hover:bg-primary-50 text-primary-500"><Icon name="pencil" size={14} /></button>
                              <button type="button" onClick={() => {
                                siteConfirm('حذف این برچسب؟').then(ok => { if (ok) saveAdminBlogTags((adminBlogTags || []).filter(x => x.id !== tg.id)); });
                              }} className="p-1.5 rounded-full hover:bg-red-50 text-red-500"><Icon name="trash" size={14} /></button>
                            </div>
                          ))}
                          {!(adminBlogTags || []).length && <EmptyStateBox title="برچسبی ثبت نشده" className="py-6" />}
                        </div>
                      </div>
                    </div>
                  )}

                  {!adminLoading && adminTab === 'shipping' && (
                    <div className="space-y-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h2 className="text-base font-bold text-primary-900 dark:text-white">روش‌های ارسال</h2>
                          <p className="text-xs text-primary-500 mt-0.5">روش‌های ارسال فعال برای فروشنده و خریدار</p>
                        </div>
                        <button
                          type="button"
                          onClick={openNewShippingMethod}
                          className="btn-cta text-xs px-3 py-1.5 rounded-full bg-apple-blue text-white font-medium flex items-center gap-1"
                        >
                          <Icon name="plus" size={14} /> افزودن روش ارسال
                        </button>
                      </div>
                      <div className="space-y-3">
                        {(adminShippingMethods || []).length === 0 && (
                          <p className="text-sm text-primary-500 p-4 rounded-2xl bg-white dark:bg-primary-900 border border-dashed border-primary-200 dark:border-white/15 text-center">
                            هنوز روش ارسالی تعریف نشده. با دکمه «افزودن روش ارسال» شروع کنید.
                          </p>
                        )}
                        {(adminShippingMethods || []).map((m) => (
                          <div key={m.id} className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="text-sm font-bold text-primary-900 dark:text-white">{m.name}</p>
                                <p className="text-xs text-primary-500">{m.priceMode === 'dynamic_cod' ? 'قیمت داینامیک · پرداخت در مقصد' : `مبلغ پایه: ${toFa((m.baseCost||0).toLocaleString())} ت`} · {m.eta}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button type="button" onClick={() => saveAdminShippingMethods((adminShippingMethods||[]).map(x => x.id===m.id ? { ...x, enabled: x.enabled===false } : x))} className={`text-xs px-2 py-1 rounded-full border ${m.enabled!==false ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-primary-100 text-primary-500 border-primary-200'}`}>{m.enabled!==false ? 'فعال' : 'غیرفعال'}</button>
                                <button type="button" onClick={() => { setShippingMethodForm({ ...m, isNew: false }); setShippingMethodFormOpen(true); }} className="p-1.5 rounded-full hover:bg-primary-50 dark:hover:bg-primary-800 text-primary-500" aria-label="ویرایش"><Icon name="pencil" size={14} /></button>
                                <button type="button" onClick={() => {
                                  siteConfirm(`روش «${m.name}» حذف شود؟`).then((ok) => {
                                    if (!ok) return;
                                    saveAdminShippingMethods((adminShippingMethods || []).filter((x) => x.id !== m.id));
                                    showToast({ message: 'روش ارسال حذف شد', variant: 'success', duration: 3000, position: 'top-center' });
                                  });
                                }} className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500" aria-label="حذف"><Icon name="trash" size={14} /></button>
                              </div>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-2 text-xs">
                              <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/50">
                                <span className="text-primary-400">API:</span> {m.apiEnabled ? 'متصل' : 'خاموش'} · {m.apiProvider || m.id}
                              </div>
                              <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/50 font-latin text-left" dir="ltr">
                                {m.apiEndpoint || 'endpoint خالی'}
                              </div>
                            </div>
                            {m.note && <p className="text-xs text-primary-500 dark:!text-white leading-relaxed">{m.note}</p>}
                          </div>
                        ))}
                      </div>
                      {shippingMethodFormOpen && shippingMethodForm && typeof document !== 'undefined' && createPortal(
                        <div className="site-modal-root" role="dialog" aria-modal="true" aria-label="فرم روش ارسال">
                          <div className="site-modal-backdrop" onClick={() => setShippingMethodFormOpen(false)} />
                          <div className="site-modal-panel bg-white dark:bg-primary-900 p-5 border border-primary-200 dark:border-white/15">
                            <h3 className="text-base font-bold text-primary-900 dark:text-white mb-4">{shippingMethodForm.isNew || !(adminShippingMethods || []).some((x) => x.id === shippingMethodForm.id) ? 'روش ارسال جدید' : (`ویرایش ${shippingMethodForm.name || ''}`)}</h3>
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs text-primary-500 mb-1 block">نام نمایشی</label>
                                <input value={shippingMethodForm.name||''} onChange={e => setShippingMethodForm(f => ({...f, name: e.target.value}))} className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white" />
                              </div>
                              <div>
                                <label className="text-xs text-primary-500 mb-1 block">نوع قیمت</label>
                                <select value={shippingMethodForm.priceMode||'fixed'} onChange={e => setShippingMethodForm(f => ({...f, priceMode: e.target.value}))} className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white">
                                  <option value="fixed">ثابت (در ثبت سفارش)</option>
                                  <option value="dynamic_cod">داینامیک / پرداخت در مقصد</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-xs text-primary-500 mb-1 block">مبلغ پایه (تومان)</label>
                                <input type="number" value={shippingMethodForm.baseCost||0} onChange={e => setShippingMethodForm(f => ({...f, baseCost: Number(e.target.value)||0}))} dir="ltr" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left text-primary-900 dark:text-white" />
                              </div>
                              <div>
                                <label className="text-xs text-primary-500 mb-1 block">زمان تقریبی</label>
                                <input value={shippingMethodForm.eta||''} onChange={e => setShippingMethodForm(f => ({...f, eta: e.target.value}))} className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white" />
                              </div>
                              <div>
                                <label className="text-xs text-primary-500 mb-1 block">کلید API</label>
                                <input value={shippingMethodForm.apiKey||''} onChange={e => setShippingMethodForm(f => ({...f, apiKey: e.target.value}))} dir="ltr" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left font-latin text-primary-900 dark:text-white" placeholder="API Key" />
                              </div>
                              <div>
                                <label className="text-xs text-primary-500 mb-1 block">Endpoint API</label>
                                <input value={shippingMethodForm.apiEndpoint||''} onChange={e => setShippingMethodForm(f => ({...f, apiEndpoint: e.target.value}))} dir="ltr" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left font-latin text-primary-900 dark:text-white" placeholder="https://api.example.com/..." />
                              </div>
                              <label className="flex items-center gap-2 text-xs text-primary-700 dark:text-white cursor-pointer">
                                <input type="checkbox" checked={!!shippingMethodForm.apiEnabled} onChange={e => setShippingMethodForm(f => ({...f, apiEnabled: e.target.checked}))} />
                                اتصال API فعال باشد
                              </label>
                              <div>
                                <label className="text-xs text-primary-500 mb-1 block">توضیح برای خریدار</label>
                                <Textarea rows={3} value={shippingMethodForm.note||''} onChange={(v) => setShippingMethodForm(f => ({...f, note: v || ''}))} placeholder="" style={{ minHeight: 96 }} />
                              </div>
                            </div>
                            <div className="flex gap-2 mt-5">
                              <button type="button" onClick={saveShippingMethodForm} className="btn-cta flex-1 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium">ذخیره</button>
                              <button type="button" onClick={() => setShippingMethodFormOpen(false)} className="px-5 py-2.5 rounded-full border border-primary-200 dark:border-white/30 text-sm">لغو</button>
                            </div>
                          </div>
                        </div>,
                        document.body
                      )}
                    </div>
                  )}


                      {taxonomyFormOpen && taxonomyForm && typeof document !== 'undefined' && createPortal(

                        <div className="site-modal-root" role="dialog" aria-modal="true">
                          <div className="site-modal-backdrop" onClick={() => setTaxonomyFormOpen(false)} />
                          <div className="site-modal-panel bg-white dark:bg-primary-900 p-5 border border-primary-200 dark:border-white/15">
                            {(() => {
                              const t = taxonomyForm.type;
                              const step = Math.min(12, Math.max(1, taxonomyForm.step || 1));
                              const label = taxonomyTypeLabel(t);
                              const stepsMeta = [
                                { n: 1, title: `۱. نام ${label}` },
                                { n: 2, title: '۲. نامک قابل ویرایش' },
                                { n: 3, title: '۳. افزودن تصاویر با تگ آلت + انتخاب تصویر شاخص' },
                                { n: 4, title: '۴. توضیحات صفحه (پیش از فوتر)' },
                                { n: 5, title: '۵. کلمات کلیدی' },
                                { n: 6, title: '۶. عنوان سئو (SEO Title)+پیش‌نمایش گوگل' },
                                { n: 7, title: '۷. توضیحات متا (Meta Description)+پیش‌نمایش گوگل' },
                                { n: 8, title: '۸. FAQ (Schema)' },
                                { n: 9, title: '۹. ایندکس' },
                                { n: 10, title: '۱۰. کنونیکال' },
                                { n: 11, title: '۱۱. پیش‌نمایش شبکه اجتماعی' },
                                { n: 12, title: '۱۲. پیشنهاد هوشمند (AI محلی)' },
                              ];
                              const seoPartMap = { 5: 'keywords', 6: 'title', 7: 'desc', 8: 'faq', 9: 'index', 10: 'canonical', 11: 'social', 12: 'ai' };
                              const prefix = t === 'category' ? '/' : t === 'tag' ? '/shop?tag=' : t === 'brand' ? '/brands/' : t === 'blog-category' ? '/blog?cat=' : '/blog?tag=';
                              const images = Array.isArray(taxonomyForm.images) ? taxonomyForm.images : (taxonomyForm.image ? [taxonomyForm.image] : []);
                              const imageAlts = Array.isArray(taxonomyForm.imageAlts) ? taxonomyForm.imageAlts : images.map(() => '');
                              const setStep = (n) => setTaxonomyForm(f => ({ ...f, step: n }));
                              const saveTaxonomy = () => {
                                if (!taxonomyForm.name.trim()) {
                                  showToast({ message: 'نام الزامی است', variant: 'error', duration: 4000, position: 'top-center' });
                                  setStep(1);
                                  return;
                                }
                                if (!taxonomyForm.slug.trim()) {
                                  showToast({ message: 'نامک الزامی است', variant: 'error', duration: 4000, position: 'top-center' });
                                  setStep(2);
                                  return;
                                }
                                const featured = images[taxonomyForm.featuredImageIndex || 0] || images[0] || '';
                                const item = {
                                  id: taxonomyForm.id || `${t}-${Date.now()}`,
                                  name: taxonomyForm.name.trim(),
                                  slug: taxonomyForm.slug.trim(),
                                  url: (taxonomyForm.url || '').trim() || `${prefix}${taxonomyForm.slug.trim()}`,
                                  image: featured,
                                  images,
                                  imageAlts,
                                  featuredImageIndex: taxonomyForm.featuredImageIndex || 0,
                                  imageAlt: (imageAlts[taxonomyForm.featuredImageIndex || 0] || taxonomyForm.imageAlt || '').trim(),
                                  description: taxonomyForm.description || '',
                                  desc: taxonomyForm.description || '',
                                  seoTitle: (taxonomyForm.seoTitle || '').trim(),
                                  seoDescription: (taxonomyForm.seoDescription || '').trim(),
                                  seoFocusKeywords: (taxonomyForm.seoFocusKeywords || '').trim(),
                                  seoCanonical: (taxonomyForm.seoCanonical || '').trim(),
                                  seoNoindex: !!taxonomyForm.seoNoindex,
                                  seoFaq: Array.isArray(taxonomyForm.seoFaq) ? taxonomyForm.seoFaq : [],
                                  active: true,
                                };
                                if (t === 'category') {
                                  const next = taxonomyForm.id
                                    ? (adminCategories || []).map(c => c.id === item.id ? { ...c, ...item } : c)
                                    : [...(adminCategories || []), item];
                                  saveAdminCategories(next);
                                } else if (t === 'tag') {
                                  const next = taxonomyForm.id
                                    ? (adminTags || []).map(c => c.id === item.id ? { ...c, ...item } : c)
                                    : [...(adminTags || []), item];
                                  saveAdminTags(next);
                                } else if (t === 'brand') {
                                  const next = taxonomyForm.id
                                    ? (adminCatalogBrands || []).map(c => c.id === item.id ? { ...c, ...item } : c)
                                    : [...(adminCatalogBrands || []), { ...item, id: item.id.startsWith('br-') ? item.id : 'br-' + Date.now() }];
                                  saveAdminCatalogBrands(next);
                                } else if (t === 'blog-category') {
                                  const next = taxonomyForm.id
                                    ? (adminBlogCategories || []).map(c => c.id === item.id ? { ...c, ...item } : c)
                                    : [...(adminBlogCategories || []), { ...item, id: item.id.startsWith('bc-') ? item.id : 'bc-' + Date.now() }];
                                  saveAdminBlogCategories(next);
                                } else if (t === 'blog-tag') {
                                  const next = taxonomyForm.id
                                    ? (adminBlogTags || []).map(c => c.id === item.id ? { ...c, ...item } : c)
                                    : [...(adminBlogTags || []), { ...item, id: item.id || 'bt-' + Date.now() }];
                                  saveAdminBlogTags(next);
                                }
                                showToast({ message: 'ذخیره شد', variant: 'success', duration: 3500, position: 'top-center' });
                                setTaxonomyFormOpen(false);
                              };
                              const canPublish = step >= 4;
                              return (
                                <>
                                  <div className="flex items-start justify-between gap-2 mb-3">
                                    <div>
                                      <h3 className="text-base font-bold text-primary-900 dark:text-white">
                                        {taxonomyForm.id ? 'ویرایش' : 'افزودن'} {label}
                                      </h3>
                                      <p className="text-[10px] text-primary-400 mt-0.5">مرحله {toFa(step)} از {toFa(12)}</p>
                                    </div>
                                    <button type="button" onClick={() => setTaxonomyFormOpen(false)} className="text-xs text-primary-500">بستن</button>
                                  </div>
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {stepsMeta.map(s => (
                                      <button key={s.n} type="button" onClick={() => setStep(s.n)} className={`text-[10px] w-6 h-6 rounded-full border ${step === s.n ? 'bg-apple-blue text-white border-apple-blue' : 'border-primary-200 dark:border-white/25 text-primary-500'}`}>{toFa(s.n)}</button>
                                    ))}
                                  </div>
                                  <p className="text-xs font-semibold text-primary-800 dark:text-white mb-3">{stepsMeta[step - 1].title}</p>

                                  {step >= 5 && (
                                    <div className="mb-3">
                                      {renderContentSeoBox({
                                        analysisOnly: true,
                                        mode: t === 'category' ? 'category' : t === 'brand' ? 'brand' : 'page',
                                        title: taxonomyForm.seoTitle || '',
                                        description: taxonomyForm.seoDescription || '',
                                        focusKeywords: taxonomyForm.seoFocusKeywords || '',
                                        contentTitle: taxonomyForm.name || '',
                                        bodyText: taxonomyForm.description || '',
                                        hasImage: images.length > 0,
                                        imageHasAlt: !!(imageAlts[taxonomyForm.featuredImageIndex || 0] || '').trim(),
                                      })}
                                    </div>
                                  )}

                                  {step === 1 && (
                                    <div>
                                      <label className="text-xs text-primary-500 mb-1 block">نام</label>
                                      <input
                                        value={taxonomyForm.name}
                                        onChange={(e) => {
                                          const name = e.target.value;
                                          const slug = taxonomyForm.id ? taxonomyForm.slug : slugifyTaxonomy(name);
                                          setTaxonomyForm(f => ({ ...f, name, slug: f.id ? f.slug : slug, url: f.id ? f.url : `${prefix}${slug}` }));
                                        }}
                                        className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue"
                                        placeholder={`نام ${label}`}
                                      />
                                    </div>
                                  )}

                                  {step === 2 && (
                                    <div>
                                      <label className="text-xs text-primary-500 mb-1 block">نامک (Slug) — قابل ویرایش</label>
                                      <input
                                        value={taxonomyForm.slug}
                                        onChange={(e) => {
                                          const slug = slugifyTaxonomy(e.target.value);
                                          setTaxonomyForm(f => ({ ...f, slug, url: `${prefix}${slug}` }));
                                        }}
                                        dir="ltr"
                                        className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left font-latin text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue"
                                      />
                                      <p className="text-[10px] text-primary-400 mt-1 font-latin" dir="ltr">{taxonomyForm.url || `${prefix}${taxonomyForm.slug}`}</p>
                                    </div>
                                  )}

                                  {step === 3 && (
                                    <div className="space-y-3">
                                      <div className="flex flex-wrap gap-2">
                                        {images.map((src, i) => (
                                          <div key={i} className={`relative w-24 rounded-xl border p-1 ${taxonomyForm.featuredImageIndex === i ? 'border-apple-blue ring-1 ring-apple-blue/40' : 'border-primary-200 dark:border-white/20'}`}>
                                            <img src={src} alt="" className="w-full h-20 object-cover rounded-lg" />
                                            <input
                                              value={imageAlts[i] || ''}
                                              onChange={(e) => {
                                                const next = [...imageAlts];
                                                next[i] = e.target.value;
                                                setTaxonomyForm(f => ({ ...f, imageAlts: next }));
                                              }}
                                              placeholder="تگ آلت"
                                              className="mt-1 w-full px-1.5 py-1 rounded-md border border-primary-100 dark:border-white/10 bg-transparent text-[10px] text-primary-900 dark:text-white"
                                            />
                                            <div className="flex gap-1 mt-1">
                                              <button type="button" className="flex-1 text-[9px] py-0.5 rounded bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-white" onClick={() => setTaxonomyForm(f => ({ ...f, featuredImageIndex: i, image: images[i] }))}>شاخص</button>
                                              <button type="button" className="text-[9px] px-1 py-0.5 rounded text-red-500" onClick={() => {
                                                const nextImgs = images.filter((_, j) => j !== i);
                                                const nextAlts = imageAlts.filter((_, j) => j !== i);
                                                setTaxonomyForm(f => ({
                                                  ...f,
                                                  images: nextImgs,
                                                  imageAlts: nextAlts,
                                                  image: nextImgs[0] || '',
                                                  featuredImageIndex: 0,
                                                }));
                                              }}>حذف</button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                      <label className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-full border border-dashed border-primary-300 dark:border-white/30 cursor-pointer text-primary-700 dark:text-white">
                                        <Icon name="plus" size={14} /> افزودن تصویر
                                        <input type="file" accept="image/webp,image/jpeg,image/png,image/jpg" className="hidden" onChange={async (e) => {
                                          const file = e.target.files && e.target.files[0];
                                          if (!file) return;
                                          try {
                                            const url = await processProductImageFile(file, { folder: 'admin' });
                                            setTaxonomyForm(f => {
                                              const imgs = [...(f.images || []), url].slice(0, 8);
                                              const alts = [...(f.imageAlts || []), ''].slice(0, 8);
                                              return { ...f, images: imgs, imageAlts: alts, image: f.image || url };
                                            });
                                          } catch (err) {
                                            showToast({ message: String(err?.message || 'خطا در تبدیل WebP'), variant: 'error', duration: 4000, position: 'top-center' });
                                          }
                                          e.target.value = '';
                                        }} />
                                      </label>
                                      <input
                                        dir="ltr"
                                        value=""
                                        onChange={(e) => {
                                          const url = e.target.value.trim();
                                          if (!url) return;
                                          setTaxonomyForm(f => {
                                            const imgs = [...(f.images || []), url].slice(0, 8);
                                            const alts = [...(f.imageAlts || []), ''].slice(0, 8);
                                            return { ...f, images: imgs, imageAlts: alts, image: f.image || url };
                                          });
                                          e.target.value = '';
                                        }}
                                        placeholder="یا آدرس تصویر را بچسبانید و Enter"
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const url = e.currentTarget.value.trim();
                                            if (!url) return;
                                            setTaxonomyForm(f => {
                                              const imgs = [...(f.images || []), url].slice(0, 8);
                                              const alts = [...(f.imageAlts || []), ''].slice(0, 8);
                                              return { ...f, images: imgs, imageAlts: alts, image: f.image || url };
                                            });
                                            e.currentTarget.value = '';
                                          }
                                        }}
                                        className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-xs text-left"
                                      />
                                    </div>
                                  )}

                                  {step === 4 && (
                                    <div>
                                      <SimpleEditor
                                        key={`tax-desc-${taxonomyForm.type}-${taxonomyForm.id || 'new'}`}
                                        mode="admin"
                                        value={taxonomyForm.description || ''}
                                        onChange={(html) => setTaxonomyForm(f => ({ ...f, description: html }))}
                                        placeholder="توضیحات این صفحه (نمایش پیش از فوتر)…"
                                      />
                                    </div>
                                  )}

                                  {step >= 5 && (
                                    <div>
                                      {renderContentSeoBox({
                                        mode: t === 'category' ? 'category' : t === 'brand' ? 'brand' : 'page',
                                        title: taxonomyForm.seoTitle || '',
                                        description: taxonomyForm.seoDescription || '',
                                        focusKeywords: taxonomyForm.seoFocusKeywords || '',
                                        canonical: taxonomyForm.seoCanonical || '',
                                        ogImage: images[taxonomyForm.featuredImageIndex || 0] || taxonomyForm.image || '',
                                        noindex: t === 'tag' || t === 'blog-tag' ? true : !!taxonomyForm.seoNoindex,
                                        contentTitle: taxonomyForm.name || '',
                                        bodyText: taxonomyForm.description || '',
                                        hasImage: images.length > 0,
                                        imageHasAlt: !!(imageAlts[taxonomyForm.featuredImageIndex || 0] || '').trim(),
                                        imageAlt: imageAlts[taxonomyForm.featuredImageIndex || 0] || '',
                                        faqItems: taxonomyForm.seoFaq || [],
                                        onFaqChange: (items) => setTaxonomyForm(f => ({ ...f, seoFaq: items })),
                                        previewUrl: taxonomyForm.url || `${prefix}${taxonomyForm.slug}`,
                                        seoPart: seoPartMap[step],
                                        adminSeoLayout: true,
                                        hideAnalysis: true,
                                        onChange: (patch) => setTaxonomyForm(f => ({
                                          ...f,
                                          seoTitle: patch.title != null ? patch.title : f.seoTitle,
                                          seoDescription: patch.description != null ? patch.description : f.seoDescription,
                                          seoFocusKeywords: patch.focusKeywords != null ? patch.focusKeywords : f.seoFocusKeywords,
                                          seoCanonical: patch.canonical != null ? patch.canonical : f.seoCanonical,
                                          seoNoindex: patch.noindex != null ? patch.noindex : f.seoNoindex,
                                          image: patch.ogImage != null ? patch.ogImage : f.image,
                                        })),
                                      })}
                                    </div>
                                  )}

                                  <div className="flex flex-wrap items-center justify-between gap-2 mt-5 pt-3 border-t border-primary-100 dark:border-white/10" dir="rtl">
                                    <button type="button" disabled={step <= 1} onClick={() => setStep(step - 1)} className={`text-xs px-4 py-2 rounded-full border ${step <= 1 ? 'opacity-40 border-primary-100' : 'border-primary-200 dark:border-white/25'} text-primary-800 dark:text-white`}>مرحله قبل</button>
                                    <div className="flex gap-2">
                                      {canPublish && (
                                        <button type="button" onClick={saveTaxonomy} className="text-xs px-4 py-2 rounded-full bg-emerald-600 text-white font-medium">ذخیره</button>
                                      )}
                                      {step < 12 ? (
                                        <button type="button" onClick={() => {
                                          if (step === 1 && !taxonomyForm.name.trim()) {
                                            showToast({ message: 'نام را وارد کنید', variant: 'error', duration: 3000, position: 'top-center' });
                                            return;
                                          }
                                          if (step === 2 && !taxonomyForm.slug.trim()) {
                                            showToast({ message: 'نامک را وارد کنید', variant: 'error', duration: 3000, position: 'top-center' });
                                            return;
                                          }
                                          setStep(step + 1);
                                        }} className="text-xs px-4 py-2 rounded-full bg-apple-blue text-white font-medium">مرحله بعد</button>
                                      ) : (
                                        <button type="button" onClick={saveTaxonomy} className="btn-cta text-xs px-4 py-2 rounded-full bg-apple-blue text-white font-medium">ذخیره نهایی</button>
                                      )}
                                    </div>
                                  </div>
                                  {step >= 4 && step < 12 && (
                                    <p className="text-[10px] text-primary-400 mt-2">از مرحله ۴ می‌توانید ذخیره کنید · مراحل ۵–۱۲ برای سئو اختیاری‌اند</p>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>,
                        document.body
                      )}

{false && !adminLoading && adminTab === 'content' && (
                    <div className="space-y-6">
                      <div className="flex gap-2 mb-2">
                        <button type="button" onClick={() => setAdminContentTab('moderation')} className={`text-xs px-3 py-1.5 rounded-full border bg-white dark:bg-primary-900 ${adminContentTab==='moderation'?'!bg-apple-blue text-white border-apple-blue':'plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium'}`}>صف تأیید ({toFa((adminModerationQueue||[]).filter(x=>x.status==='pending').length)})</button>
                        <button type="button" onClick={() => setAdminContentTab('pages')} className={`text-xs px-3 py-1.5 rounded-full border bg-white dark:bg-primary-900 ${adminContentTab==='pages'?'!bg-apple-blue text-white border-apple-blue':'plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium'}`}>ویرایش محتوای صفحات</button>
                      </div>

                      {adminContentTab === 'moderation' && (
                        <div className="space-y-3">
                          <h2 className="text-base font-bold text-primary-900 dark:text-white">تأیید محتوای فروشنده</h2>
                          <p className="text-xs text-primary-500">هر موردی که فروشنده یا خریدار ارسال می‌کند (محصول، تصویر، لوکیشن، مدارک، شبا، تسویه، آپارات و …) قبل از اعمال نهایی باید تأیید ادمین شود.</p>
                          {(adminModerationQueue||[]).filter(x=>x.status==='pending').length === 0 && (
                            <p className="text-sm text-primary-400 text-center py-10 border border-dashed border-primary-200 dark:border-white/20 rounded-2xl bg-white dark:bg-primary-900">مورد معلقی نیست</p>
                          )}
                          {(adminModerationQueue||[]).filter(x=>x.status==='pending').map(item => (
                            <div key={item.id} className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 flex flex-wrap gap-3 items-start">
                              {item.preview && <img src={item.preview} alt="" className="w-16 h-20 object-cover rounded-lg" />}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-primary-900 dark:text-white">{item.productName || item.type}</p>
                                <p className="text-xs text-primary-500 mt-0.5">{item.type === 'product_image' ? 'تصویر محصول' : item.type === 'product' ? 'محصول / متن' : item.type === 'seller_location' ? 'لوکیشن فروشنده' : item.type === 'seller_kyc' ? 'احراز هویت فروشنده' : item.type === 'seller_sheba' ? 'شبا فروشنده' : item.type === 'seller_payout' ? 'درخواست مالی' : item.type === 'seller_discount' ? 'تخفیف فروشنده' : item.type}</p>
                                {item.text && <p className="text-xs text-primary-600 dark:text-white/70 mt-1 line-clamp-3">{item.text}</p>}
                                {item.type === 'seller_discount' && Array.isArray(item.items) && (
                                  <ul className="mt-2 space-y-1">
                                    {item.items.map((it, i) => (
                                      <li key={i} className="text-xs text-primary-700 dark:text-white/80">• {it.name}: {toFa(Number(it.oldPrice).toLocaleString())} → {toFa(Number(it.salePrice).toLocaleString())} ({toFa(it.percent)}٪)</li>
                                    ))}
                                  </ul>
                                )}
                                {item.aparatEmbed && (
                                  <div className="mt-2 space-y-1">
                                    <p className="text-xs text-primary-500">ویدیو آپارات (embed):</p>
                                    <p className="text-xs font-latin text-left text-primary-400 break-all" dir="ltr">{item.aparatEmbed}</p>
                                    <div className="aspect-video max-w-sm rounded-xl overflow-hidden border border-primary-200 dark:border-white/15 bg-black">
                                      <iframe title="پیش‌نمایش آپارات" src={item.aparatEmbed} className="w-full h-full border-0" allowFullScreen loading="lazy" />
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <button type="button" onClick={async () => {
                                  saveModerationQueue((adminModerationQueue||[]).map(x => x.id===item.id ? { ...x, status: 'approved' } : x));
                                  if (item.productId) {
                                      await patchAdminProductStatus(item.productId, 'active');
                                      try {
                                    const _prId = item.productId;
                                    const _res = void fetch('/api/admin/products/' + encodeURIComponent(_prId), {
                                      method: 'PATCH', credentials: 'include',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ status: 'active' }),
                                    });
                                    const _data = await _res.json().catch(() => ({}));
                                    if (!_res.ok || !_data?.ok) {
                                      const _res2 = await fetch('/api/admin/products', {
                                        method: 'PATCH', credentials: 'include',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ id: _prId, status: 'active' }),
                                      });
                                      const _d2 = await _res2.json().catch(() => ({}));
                                      if (!_res2.ok || !_d2?.ok) throw new Error(_d2?.error || _data?.error || 'تأیید محصول روی سرور ناموفق');
                                    }
                                  } catch (e) {
                                    try { showToast({ message: String(e?.message || e), variant: 'error', duration: 5000, position: 'top-center' }); } catch (_) {}
                                    return;
                                  }
                                  const pr0 = (sellerProducts||[]).find(pr => pr.id===item.productId); const code = pr0 ? ensureProductCode(pr0, 'OWN') : (pr0?.productCode); saveSellerProducts((sellerProducts||[]).map(pr => pr.id===item.productId ? { ...pr, status: 'active', contentStatus: 'approved', productCode: code || pr.productCode, publicPath: getProductPublicPath({ ...pr, productCode: code || pr.productCode }), publishedAt: pr.publishedAt || new Date().toISOString() } : pr));
                                    setAdminProducts(prev => (prev||[]).map(pr => pr.id===item.productId ? { ...pr, status: 'active' } : pr));
                                  }
                                  if (item.type === 'seller_location' && item.lat != null) {
                                    try {
                                      const su = JSON.parse(localStorage.getItem('sellerUser')||'null')||{};
                                      const next = { ...su, lat: item.lat, lng: item.lng, locationStatus: 'approved' };
                                      localStorage.setItem('sellerUser', JSON.stringify(next));
                                      setSellerUser(next);
                                    } catch(_){}
                                  }
                                  if (item.type === 'seller_kyc') {
                                    try {
                                      const su = JSON.parse(localStorage.getItem('sellerUser')||'null')||{};
                                      const next = { ...su, kycStatus: 'approved' };
                                      localStorage.setItem('sellerUser', JSON.stringify(next));
                                      setSellerUser(next);
                                    } catch(_){}
                                  }
                                  if (item.type === 'seller_sheba') {
                                    try {
                                      const su = JSON.parse(localStorage.getItem('sellerUser')||'null')||{};
                                      const next = { ...su, shebaStatus: 'approved' };
                                      localStorage.setItem('sellerUser', JSON.stringify(next));
                                      setSellerUser(next);
                                    } catch(_){}
                                  }
                                  if (item.type === 'seller_payout' && item.meta?.id) {
                                    try {
                                      const su = JSON.parse(localStorage.getItem('sellerUser')||'null')||{};
                                      const payouts = (su.payoutRequests||[]).map(r => r.id===item.meta.id ? { ...r, status: 'approved' } : r);
                                      const next = { ...su, payoutRequests: payouts };
                                      localStorage.setItem('sellerUser', JSON.stringify(next));
                                      setSellerUser(next);
                                    } catch(_){}
                                  }
                                  if (item.type === 'seller_discount' && Array.isArray(item.items)) {
                                    const endsAt = Date.now() + (Number(item.days) || 7) * 86400000;
                                    const byId = Object.fromEntries(item.items.map(it => [it.productId, it]));
                                    const nowTs = Date.now();
                                    const activeAmazingIds = (sellerProducts || []).filter(pr => pr && pr.amazing && (!pr.dealEndsAt || Number(pr.dealEndsAt) > nowTs)).map(pr => pr.id);
                                    const room = Math.max(0, 10 - activeAmazingIds.filter(id => !byId[id]).length);
                                    const allowedIds = new Set(item.items.slice(0, room).map(it => it.productId));
                                    if (room < item.items.length) {
                                      pushLiveToast(`فقط ${toFa(room)} کالا از این درخواست در سقف ۱۰تایی شگفت‌انگیز جا داشت`, { type: 'warning' });
                                    }
                                    saveSellerProducts((sellerProducts || []).map(pr => {
                                      const it = byId[pr.id];
                                      if (!it || !allowedIds.has(pr.id)) return pr;
                                      return {
                                        ...pr,
                                        priceBeforeDeal: it.oldPrice,
                                        oldPrice: it.oldPrice,
                                        price: it.salePrice,
                                        priceText: toFa(Number(it.salePrice).toLocaleString()),
                                        discount: it.percent,
                                        amazing: true,
                                        dealEndsAt: endsAt,
                                      };
                                    }));
                                    // سهمیه ماهانه
                                    try {
                                      const monthKey = new Date().toISOString().slice(0, 7);
                                      let quota = JSON.parse(localStorage.getItem('sellerDiscountQuota') || '{}');
                                      if (quota.month !== monthKey) quota = { month: monthKey, itemIds: [] };
                                      quota.itemIds = [...new Set([...(quota.itemIds || []), ...item.items.map(i => i.productId)])].slice(0, 10);
                                      localStorage.setItem('sellerDiscountQuota', JSON.stringify(quota));
                                      // سهمیه ماهانهٔ آیتم‌ها؛ سقف عددی فروشنده از sellers.discount_quota (ادمین)
                                    } catch (_) {}
                                    saveSellerGifts((sellerGifts || []).map(g => g.id === item.id ? { ...g, status: 'active' } : g));
                                    pushLiveToast('تخفیف فروشنده تأیید و به شگفت‌انگیز اضافه شد', { type: 'info' });
                                  }
                                }} className="px-3 py-1.5 rounded-full bg-emerald-500 text-white text-xs">تأیید</button>
                                <button type="button" onClick={() => {
                                  saveModerationQueue((adminModerationQueue||[]).map(x => x.id===item.id ? { ...x, status: 'rejected' } : x));
                                  if (item.type === 'seller_discount') {
                                    saveSellerGifts((sellerGifts || []).map(g => g.id === item.id ? { ...g, status: 'rejected' } : g));
                                    pushLiveToast('درخواست تخفیف / شگفت‌انگیز رد شد', { type: 'error' });
                                  }
                                  if (item.productId) {
                                    void patchAdminProductStatus(item.productId, 'rejected');
                                    void (async () => {
                                    try {
                                      const _rid = item.productId;
                                      void fetch('/api/admin/products/' + encodeURIComponent(_rid), {
                                        method: 'PATCH', credentials: 'include',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ status: 'rejected' }),
                                      });
                                    } catch (_) {}
                                  })();
                                  saveSellerProducts((sellerProducts||[]).map(pr => pr.id===item.productId ? { ...pr, status: 'inactive', contentStatus: 'rejected' } : pr));
                                  }
                                  if (item.type === 'seller_location') {
                                    try { const su = JSON.parse(localStorage.getItem('sellerUser')||'null')||{}; const next={...su, locationStatus:'rejected'}; localStorage.setItem('sellerUser', JSON.stringify(next)); setSellerUser(next);} catch(_){}
                                  }
                                  if (item.type === 'seller_kyc') {
                                    try { const su = JSON.parse(localStorage.getItem('sellerUser')||'null')||{}; const next={...su, kycStatus:'rejected'}; localStorage.setItem('sellerUser', JSON.stringify(next)); setSellerUser(next);} catch(_){}
                                  }
                                  if (item.type === 'seller_sheba') {
                                    try { const su = JSON.parse(localStorage.getItem('sellerUser')||'null')||{}; const next={...su, shebaStatus:'rejected'}; localStorage.setItem('sellerUser', JSON.stringify(next)); setSellerUser(next);} catch(_){}
                                  }
                                  if (item.type === 'seller_payout' && item.meta?.id) {
                                    try { const su = JSON.parse(localStorage.getItem('sellerUser')||'null')||{}; const payouts=(su.payoutRequests||[]).map(r=>r.id===item.meta.id?{...r,status:'rejected'}:r); const next={...su,payoutRequests:payouts}; localStorage.setItem('sellerUser', JSON.stringify(next)); setSellerUser(next);} catch(_){}
                                  }
                                }} className="px-3 py-1.5 rounded-full bg-red-500 text-white text-xs">رد</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {adminContentTab === 'pages' && (
                        <div className="space-y-4">
                          <h2 className="text-base font-bold text-primary-900 dark:text-white">ویرایش محتوای سایت</h2>
                          <div className="grid sm:grid-cols-2 gap-2">
                            {[
                              { type: 'home', label: 'خانه' },
                              { type: 'about', label: 'درباره ما' },
                              { type: 'contact', label: 'تماس با ما' },
                              { type: 'faq', label: 'سوالات متداول' },
                              { type: 'terms', label: 'قوانین' },
                              { type: 'privacy', label: 'حریم خصوصی' },
                              { type: 'returns', label: 'مرجوعی' },
                              { type: 'size-guide', label: 'راهنمای سایز' },
                              { type: 'become-seller', label: 'فروشنده شوید' },
                              { type: 'shop', label: 'صفحه فروشگاه' },
                              { type: 'cats_hub', label: 'همه دسته‌بندی‌ها' },
                              { type: 'tags_hub', label: 'همه برچسب‌ها' },
                              { type: 'categories', label: 'دسته‌بندی‌ها (تکی)' },
                              { type: 'tags', label: 'برچسب‌ها (تکی)' },
                              { type: 'blog_cats', label: 'دسته‌های بلاگ' },
                              { type: 'blog_tags', label: 'برچسب‌های بلاگ' },
                              { type: 'blogs', label: 'مقالات' },
                            ].map(x => (
                              <button key={x.type} type="button" onClick={() => setContentEditorTarget({ type: x.type })} className={`text-right p-3 rounded-xl border text-sm bg-white dark:bg-primary-900 ${contentEditorTarget?.type===x.type?'border-apple-blue ring-1 ring-apple-blue/30':'border-primary-200 dark:border-white/15'} text-primary-900 dark:text-white`}>{x.label}</button>
                            ))}
                          </div>

                          {contentEditorTarget?.type === 'shop' && (
                            <div className="p-4 rounded-2xl bg-white dark:bg-primary-900 border border-primary-200 dark:border-white/15 space-y-3">
                              <h3 className="text-sm font-bold">توضیح انتهای فروشگاه</h3>
                              <SimpleEditor
                                key="cms-shop-seo-editor"
                                mode="admin"
                                value={getShopSeoBody()}
                                onChange={(html) => {
                                  updatePageCms('shop', { body: html });
                                  saveAdminSettings({ ...adminSettings, shopSeoHtml: html, shopSeoText: htmlToPlain(html).slice(0, 500) });
                                }}
                                placeholder="توضیح پایین صفحه فروشگاه…"
                              />
                              <p className="text-[10px] text-primary-400">ذخیره خودکار · نمایش قبل از فوتر فروشگاه</p>
                            </div>
                          )}
                          {contentEditorTarget?.type === 'cats_hub' && (
                            <div className="p-4 rounded-2xl bg-white dark:bg-primary-900 border border-primary-200 dark:border-white/15 space-y-3">
                              <h3 className="text-sm font-bold">توضیح صفحه همه دسته‌ها</h3>
                              <Textarea id="cms-cats-seo" defaultValue={adminSettings?.categoriesIndexSeoText||''} placeholder="" rows={3} style={{ minHeight: 84 }} />
                              <button type="button" onClick={() => { saveAdminSettings({ ...adminSettings, categoriesIndexSeoText: document.getElementById('cms-cats-seo')?.value||'' }); showToast({ message: 'ذخیره شد', variant: 'success', duration: 4500, position: 'top-center' }); }} className="px-4 py-2 rounded-full bg-apple-blue text-white text-xs">ذخیره</button>
                            </div>
                          )}
                          {contentEditorTarget?.type === 'tags_hub' && (
                            <div className="p-4 rounded-2xl bg-white dark:bg-primary-900 border border-primary-200 dark:border-white/15 space-y-3">
                              <h3 className="text-sm font-bold">توضیح صفحه همه برچسب‌ها</h3>
                              <Textarea id="cms-tags-seo" defaultValue={adminSettings?.tagsIndexSeoText||''} placeholder="" rows={3} style={{ minHeight: 84 }} />
                              <button type="button" onClick={() => { saveAdminSettings({ ...adminSettings, tagsIndexSeoText: document.getElementById('cms-tags-seo')?.value||'' }); showToast({ message: 'ذخیره شد', variant: 'success', duration: 4500, position: 'top-center' }); }} className="px-4 py-2 rounded-full bg-apple-blue text-white text-xs">ذخیره</button>
                            </div>
                          )}
                          {contentEditorTarget?.type === 'categories' && (
                            <div className="space-y-2">
                              <p className="text-xs text-primary-500">روی ویرایش بزنید تا نام، تصویر شاخص و توضیح همان دسته را عوض کنید.</p>
                              {(adminCategories||[]).map(c => (
                                <div key={c.id} className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-primary-900 border border-primary-200 dark:border-white/15">
                                  {c.image && <img src={c.image} alt="" className="w-12 h-12 rounded object-cover" />}
                                  <div className="flex-1 min-w-0"><p className="text-sm font-bold text-primary-900 dark:text-white">{c.name}</p><p className="text-xs text-primary-400 line-clamp-1">{c.description}</p></div>
                                  <button type="button" onClick={() => { setAdminTab('product-categories'); openTaxonomyWizard('category', c); }} className="text-xs px-2 py-1 rounded-full border border-primary-200 dark:border-white/30">ویرایش</button>
                                  <button type="button" onClick={() => openCategory(c.name)} className="text-xs px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-800">مشاهده صفحه</button>
                                </div>
                              ))}
                            </div>
                          )}
                          {contentEditorTarget?.type === 'tags' && (
                            <div className="space-y-2">
                              {(adminTags||[]).map(tg => (
                                <div key={tg.id} className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-primary-900 border border-primary-200 dark:border-white/15">
                                  {tg.image && <img src={tg.image} alt="" className="w-12 h-12 rounded object-cover" />}
                                  <div className="flex-1 min-w-0"><p className="text-sm font-bold text-primary-900 dark:text-white">{tg.name}</p><p className="text-xs text-primary-400 line-clamp-1">{tg.description}</p></div>
                                  <button type="button" onClick={() => { setAdminTab('product-tags'); openTaxonomyWizard('tag', tg); }} className="text-xs px-2 py-1 rounded-full border border-primary-200 dark:border-white/30">ویرایش</button>
                                  <button type="button" onClick={() => openTagPage(tg.name)} className="text-xs px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-800">مشاهده صفحه</button>
                                </div>
                              ))}
                            </div>
                          )}
                          {contentEditorTarget?.type === 'blogs' && (
                            <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 text-sm text-primary-600 dark:text-white/70 space-y-2">
                              <p>برای نوشتن مطلب جدید به تب «بلاگ» بروید.</p>
                              <button type="button" onClick={() => setAdminTab('blog')} className="text-xs px-3 py-1.5 rounded-full bg-apple-blue text-white">رفتن به مدیریت بلاگ</button>
                            </div>
                          )}
                          {['home','about','contact','faq','terms','privacy','returns','size-guide','become-seller'].includes(contentEditorTarget?.type) && (
                            <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-3">
                              <h3 className="text-sm font-bold text-primary-900 dark:text-white">محتوای صفحه: {contentEditorTarget.type}</h3>
                              <SimpleEditor
                                key={`legacy-cms-${contentEditorTarget.type}`}
                                mode="admin"
                                value={(getPageCms(contentEditorTarget.type) || {}).body || ''}
                                onChange={(html) => updatePageCms(contentEditorTarget.type, { body: html })}
                                placeholder="متن صفحه را با ویرایشگر بنویسید…"
                              />
                              <input dir="ltr" value={(getPageCms(contentEditorTarget.type) || {}).image || ''} onChange={(e) => updatePageCms(contentEditorTarget.type, { image: e.target.value })} placeholder="آدرس تصویر (اختیاری)" className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left" />
                              <input dir="ltr" value={(getPageCms(contentEditorTarget.type) || {}).video || ''} onChange={(e) => updatePageCms(contentEditorTarget.type, { video: e.target.value })} placeholder="آدرس ویدیو / آپارات (اختیاری)" className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left" />
                              <p className="text-[10px] text-primary-400">ذخیره خودکار</p>
                            </div>
                          )}
                          {(contentEditorTarget?.type === 'blog_cats' || contentEditorTarget?.type === 'blog_tags') && (
                            <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 text-sm text-primary-600 dark:text-white/70">
                              دسته‌ها و برچسب‌های بلاگ هنگام نوشتن مطلب در تب بلاگ قابل انتخاب هستند. لیست پیش‌فرض: راهنمای خرید، مد و فشن، مراقبت و نگهداری، اخبار فروشگاه.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

{!adminLoading && adminTab === 'blog-new' && (() => {
                    const emptyBlog = () => {
                      const defCat = ((adminBlogCategories || []).find(c => c.active !== false) || {}).name || 'راهنمای خرید';
                      return { id: '', title: '', cat: defCat, excerpt: '', body: '', status: 'published', author: 'تحریریه', read: '۵ دقیقه', publishAtDate: '', publishAtTime: '10:00', publishAtMs: null, publishAtFa: '', seoTitle: '', seoDescription: '', seoFocusKeywords: '', seoCanonical: '', seoOgImage: '', imageAlt: '', image: '', seoNoindex: false, seoFaq: [] };
                    };
                    const form = (blogForm && !blogForm.id) ? blogForm : (blogForm && blogForm.id ? blogForm : null);
                    /* فقط مقاله جدید در این تب — اگر فرم ویرایش باشد به مطالب هدایت می‌شود */
                    const f = form && !form.id ? form : (blogForm && !blogForm.id ? blogForm : emptyBlog());
                    if (blogForm && blogForm.id) {
                      /* ویرایش از تب مطالب می‌آید؛ فرم جدید نگه داریم */
                    }
                    const bf = (blogForm && !blogForm.id) ? blogForm : (!blogForm ? emptyBlog() : (blogForm.id ? emptyBlog() : blogForm));
                    return (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h2 className="text-base font-bold text-primary-900 dark:text-white">افزودن بلاگ</h2>
                          <p className="text-xs text-primary-500 dark:!text-white mt-0.5">فقط نوشتن مقاله / مطلب جدید</p>
                        </div>
                        <button type="button" onClick={() => { setBlogForm(null); setAdminTab('blog'); }} className="text-xs px-3 py-1.5 rounded-full border border-primary-200 dark:border-white/30 text-primary-700 dark:text-white">مشاهده مطالب</button>
                      </div>
                      <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-2">
                          <input value={bf.title} onChange={e => setBlogForm(prev => ({ ...(prev && !prev.id ? prev : emptyBlog()), title: e.target.value, id: '' }))} placeholder="عنوان *" className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white" />
                          <div className="grid grid-cols-2 gap-2">
                            <select value={bf.cat} onChange={e => setBlogForm(prev => ({ ...(prev && !prev.id ? prev : emptyBlog()), cat: e.target.value, id: '' }))} className="px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white">
                              {(adminBlogCategories || []).filter(c => c.active !== false).map(c => <option key={c.id || c.name} value={c.name}>{c.name}</option>)}
                            </select>
                            <select value={bf.status} onChange={e => setBlogForm(prev => ({ ...(prev && !prev.id ? prev : emptyBlog()), status: e.target.value, id: '' }))} className="px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white">
                              <option value="published">منتشر</option>
                              <option value="draft">پیش‌نویس</option>
                              <option value="scheduled">زمان‌بندی‌شده</option>
                            </select>
                          </div>
                          {bf.status === 'scheduled' && (
                            <div className="grid sm:grid-cols-2 gap-3 p-3 rounded-xl border border-primary-200 dark:border-white/15 bg-primary-50/50 dark:bg-primary-900/30">
                              <div>
                                <label className="text-xs text-primary-500 mb-1 block">تاریخ انتشار</label>
                                <input type="date" value={bf.publishAtDate || ''} onChange={e => {
                                  const v = e.target.value;
                                  setBlogForm(prev => {
                                    const base = (prev && !prev.id) ? prev : emptyBlog();
                                    const time = base.publishAtTime || '10:00';
                                    let ms = null; let fa = '';
                                    if (v) { try { const d = new Date(v + 'T' + (time.length === 5 ? time : '10:00') + ':00'); ms = d.getTime(); fa = d.toLocaleDateString('fa-IR') + ' ' + d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }); } catch (_) {} }
                                    return { ...base, id: '', publishAtDate: v, publishAtMs: ms, publishAtFa: fa };
                                  });
                                }} className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white" />
                              </div>
                              <div>
                                <label className="text-xs text-primary-500 mb-1 block">ساعت انتشار</label>
                                <input type="time" value={bf.publishAtTime || '10:00'} onChange={e => {
                                  const time = e.target.value;
                                  setBlogForm(prev => {
                                    const base = (prev && !prev.id) ? prev : emptyBlog();
                                    const v = base.publishAtDate || '';
                                    let ms = null; let fa = '';
                                    if (v) { try { const d = new Date(v + 'T' + (time.length === 5 ? time : '10:00') + ':00'); ms = d.getTime(); fa = d.toLocaleDateString('fa-IR') + ' ' + d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }); } catch (_) {} }
                                    return { ...base, id: '', publishAtTime: time, publishAtMs: ms, publishAtFa: fa };
                                  });
                                }} className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white" />
                              </div>
                              {bf.publishAtFa && <p className="sm:col-span-2 text-xs text-apple-blue">انتشار در: {bf.publishAtFa}</p>}
                            </div>
                          )}
                          <input value={bf.excerpt} onChange={e => setBlogForm(prev => ({ ...(prev && !prev.id ? prev : emptyBlog()), excerpt: e.target.value, id: '' }))} placeholder="خلاصه" className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white" />
                          <SimpleEditor value={bf.body} onChange={(html) => setBlogForm(prev => ({ ...(prev && !prev.id ? prev : emptyBlog()), body: html, id: '' }))} placeholder="متن کامل مطلب…" appearance="full" maxLength={50000} mode="admin" />
                          {renderContentSeoBox({
                            mode: 'article', sellerLimited: false, adminSeoLayout: true, showAdminIndexCanonical: true,
                            title: bf.seoTitle || '', description: bf.seoDescription || '', focusKeywords: bf.seoFocusKeywords || '',
                            canonical: bf.seoCanonical || '', ogImage: bf.seoOgImage || bf.image || '', imageAlt: bf.imageAlt || '',
                            noindex: !!bf.seoNoindex, bodyText: (bf.body || '') + ' ' + (bf.excerpt || ''), contentTitle: bf.title || '',
                            hasImage: !!(bf.seoOgImage || bf.image), imageHasAlt: !!(bf.imageAlt || '').trim(),
                            faqItems: bf.seoFaq || [], onFaqChange: (items) => setBlogForm(prev => ({ ...(prev && !prev.id ? prev : emptyBlog()), seoFaq: items, id: '' })),
                            onChange: (patch) => setBlogForm(prev => {
                              const base = (prev && !prev.id) ? prev : emptyBlog();
                              return {
                                ...base, id: '',
                                seoTitle: patch.title != null ? patch.title : base.seoTitle,
                                seoDescription: patch.description != null ? patch.description : base.seoDescription,
                                seoFocusKeywords: patch.focusKeywords != null ? patch.focusKeywords : base.seoFocusKeywords,
                                seoCanonical: patch.canonical != null ? patch.canonical : base.seoCanonical,
                                seoOgImage: patch.ogImage != null ? patch.ogImage : base.seoOgImage,
                                imageAlt: patch.imageAlt != null ? patch.imageAlt : base.imageAlt,
                                seoNoindex: patch.noindex != null ? patch.noindex : base.seoNoindex,
                                image: patch.ogImage != null ? patch.ogImage : base.image,
                              };
                            }),
                          })}
                          <div className="flex gap-2">
                            <button type="button" onClick={() => {
                              const cur = (blogForm && !blogForm.id) ? blogForm : bf;
                              if (!cur.title.trim()) { showToast({ message: 'عنوان الزامی است', variant: 'error', duration: 4500, position: 'top-center' }); return; }
                              if (cur.status === 'scheduled' && !cur.publishAtMs) {
                                showToast({ message: 'برای انتشار زمان‌بندی‌شده تاریخ و ساعت را مشخص کنید', variant: 'error', duration: 4500, position: 'top-center' });
                                return;
                              }
                              const id = 'b' + Date.now();
                              const post = {
                                ...cur, id,
                                date: cur.status === 'scheduled' && cur.publishAtFa ? String(cur.publishAtFa).split(' ')[0] : new Date().toLocaleDateString('fa-IR'),
                                read: cur.read || '۵ دقیقه',
                                publishAtMs: cur.status === 'scheduled' ? cur.publishAtMs : null,
                                publishAtFa: cur.status === 'scheduled' ? cur.publishAtFa : null,
                              };
                              saveBlogPosts([post, ...(blogPosts || [])]);
                              showToast({ message: 'مطلب جدید ذخیره شد', variant: 'success', duration: 3000, position: 'top-center' });
                              setBlogForm(emptyBlog());
                            }} className="px-4 py-2 rounded-full bg-apple-blue text-white text-xs font-medium">انتشار / ذخیره مطلب جدید</button>
                            <button type="button" onClick={() => setBlogForm(emptyBlog())} className="px-4 py-2 rounded-full border text-xs">پاک کردن فرم</button>
                          </div>
                      </div>
                    </div>
                    );
                  })()}

                  {!adminLoading && adminTab === 'blog' && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h2 className="text-base font-bold text-primary-900 dark:text-white">مطالب بلاگ</h2>
                          <p className="text-xs text-primary-500 dark:!text-white mt-0.5">لیست مطالب — انتخاب برای ویرایش</p>
                        </div>
                        <button type="button" onClick={() => {
                          const defCat = ((adminBlogCategories || []).find(c => c.active !== false) || {}).name || 'راهنمای خرید';
                          setBlogForm({ id: '', title: '', cat: defCat, excerpt: '', body: '', status: 'published', author: 'تحریریه', read: '۵ دقیقه', publishAtDate: '', publishAtTime: '10:00', publishAtMs: null, publishAtFa: '', seoTitle: '', seoDescription: '', seoFocusKeywords: '', seoCanonical: '', seoOgImage: '', imageAlt: '', image: '', seoNoindex: false, seoFaq: [] });
                          setAdminTab('blog-new');
                        }} className="text-xs px-3 py-1.5 rounded-full bg-apple-blue text-white font-medium">افزودن مطلب جدید</button>
                      </div>

                      {/* فرم ویرایش فقط وقتی مطلبی از لیست انتخاب شده */}
                      {blogForm && blogForm.id && (
                        <div className="p-4 rounded-2xl border border-apple-blue/40 dark:border-[#4CCD99]/40 bg-white dark:bg-primary-900 space-y-2">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-sm font-bold text-primary-900 dark:text-white">ویرایش مطلب</p>
                            <button type="button" onClick={() => setBlogForm(null)} className="text-xs px-2.5 py-1 rounded-full border border-primary-200 dark:border-white/25">بستن</button>
                          </div>
                          <input value={blogForm.title} onChange={e => setBlogForm(f => ({ ...f, title: e.target.value }))} placeholder="عنوان *" className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white" />
                          <div className="grid grid-cols-2 gap-2">
                            <select value={blogForm.cat} onChange={e => setBlogForm(f => ({ ...f, cat: e.target.value }))} className="px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white">
                              {(adminBlogCategories || []).filter(c => c.active !== false).map(c => <option key={c.id || c.name} value={c.name}>{c.name}</option>)}
                            </select>
                            <select value={blogForm.status} onChange={e => setBlogForm(f => ({ ...f, status: e.target.value }))} className="px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white">
                              <option value="published">منتشر</option>
                              <option value="draft">پیش‌نویس</option>
                              <option value="scheduled">زمان‌بندی‌شده</option>
                            </select>
                          </div>
                          {blogForm.status === 'scheduled' && (
                            <div className="grid sm:grid-cols-2 gap-3 p-3 rounded-xl border border-primary-200 dark:border-white/15 bg-primary-50/50 dark:bg-primary-900/30">
                              <div>
                                <label className="text-xs text-primary-500 mb-1 block">تاریخ انتشار</label>
                                <input type="date" value={blogForm.publishAtDate || ''} onChange={e => {
                                  const v = e.target.value;
                                  setBlogForm(f => {
                                    const time = f.publishAtTime || '10:00';
                                    let ms = null; let fa = '';
                                    if (v) { try { const d = new Date(v + 'T' + (time.length === 5 ? time : '10:00') + ':00'); ms = d.getTime(); fa = d.toLocaleDateString('fa-IR') + ' ' + d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }); } catch (_) {} }
                                    return { ...f, publishAtDate: v, publishAtMs: ms, publishAtFa: fa };
                                  });
                                }} className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white" />
                              </div>
                              <div>
                                <label className="text-xs text-primary-500 mb-1 block">ساعت انتشار</label>
                                <input type="time" value={blogForm.publishAtTime || '10:00'} onChange={e => {
                                  const time = e.target.value;
                                  setBlogForm(f => {
                                    const v = f.publishAtDate || '';
                                    let ms = null; let fa = '';
                                    if (v) { try { const d = new Date(v + 'T' + (time.length === 5 ? time : '10:00') + ':00'); ms = d.getTime(); fa = d.toLocaleDateString('fa-IR') + ' ' + d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }); } catch (_) {} }
                                    return { ...f, publishAtTime: time, publishAtMs: ms, publishAtFa: fa };
                                  });
                                }} className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white" />
                              </div>
                              {blogForm.publishAtFa && <p className="sm:col-span-2 text-xs text-apple-blue">انتشار در: {blogForm.publishAtFa}</p>}
                            </div>
                          )}
                          <input value={blogForm.excerpt} onChange={e => setBlogForm(f => ({ ...f, excerpt: e.target.value }))} placeholder="خلاصه" className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white" />
                          <SimpleEditor value={blogForm.body} onChange={(html) => setBlogForm(f => ({ ...f, body: html }))} placeholder="متن کامل مطلب…" appearance="full" maxLength={50000} mode="admin" />
                          {renderContentSeoBox({
                            mode: 'article', sellerLimited: false, adminSeoLayout: true, showAdminIndexCanonical: true,
                            title: blogForm.seoTitle || '', description: blogForm.seoDescription || '', focusKeywords: blogForm.seoFocusKeywords || '',
                            canonical: blogForm.seoCanonical || '', ogImage: blogForm.seoOgImage || blogForm.image || '', imageAlt: blogForm.imageAlt || '',
                            noindex: !!blogForm.seoNoindex, bodyText: (blogForm.body || '') + ' ' + (blogForm.excerpt || ''), contentTitle: blogForm.title || '',
                            hasImage: !!(blogForm.seoOgImage || blogForm.image), imageHasAlt: !!(blogForm.imageAlt || '').trim(),
                            faqItems: blogForm.seoFaq || [], onFaqChange: (items) => setBlogForm(f => ({ ...f, seoFaq: items })),
                            onChange: (patch) => setBlogForm(f => ({
                              ...f,
                              seoTitle: patch.title != null ? patch.title : f.seoTitle,
                              seoDescription: patch.description != null ? patch.description : f.seoDescription,
                              seoFocusKeywords: patch.focusKeywords != null ? patch.focusKeywords : f.seoFocusKeywords,
                              seoCanonical: patch.canonical != null ? patch.canonical : f.seoCanonical,
                              seoOgImage: patch.ogImage != null ? patch.ogImage : f.seoOgImage,
                              imageAlt: patch.imageAlt != null ? patch.imageAlt : f.imageAlt,
                              seoNoindex: patch.noindex != null ? patch.noindex : f.seoNoindex,
                              image: patch.ogImage != null ? patch.ogImage : f.image,
                            })),
                          })}
                          <div className="flex gap-2">
                            <button type="button" onClick={() => {
                              if (!blogForm.title.trim()) { showToast({ message: 'عنوان الزامی است', variant: 'error', duration: 4500, position: 'top-center' }); return; }
                              if (blogForm.status === 'scheduled' && !blogForm.publishAtMs) {
                                showToast({ message: 'برای انتشار زمان‌بندی‌شده تاریخ و ساعت را مشخص کنید', variant: 'error', duration: 4500, position: 'top-center' });
                                return;
                              }
                              const id = blogForm.id;
                              const post = {
                                ...blogForm, id,
                                date: blogForm.status === 'scheduled' && blogForm.publishAtFa ? String(blogForm.publishAtFa).split(' ')[0] : (blogForm.date || new Date().toLocaleDateString('fa-IR')),
                                read: blogForm.read || '۵ دقیقه',
                                publishAtMs: blogForm.status === 'scheduled' ? blogForm.publishAtMs : null,
                                publishAtFa: blogForm.status === 'scheduled' ? blogForm.publishAtFa : null,
                              };
                              saveBlogPosts((blogPosts || []).map(p => p.id === id ? post : p));
                              showToast({ message: 'مطلب به‌روزرسانی شد', variant: 'success', duration: 3000, position: 'top-center' });
                              setBlogForm(null);
                            }} className="px-4 py-2 rounded-full bg-apple-blue text-white text-xs font-medium">ذخیره تغییرات</button>
                            <button type="button" onClick={() => setBlogForm(null)} className="px-4 py-2 rounded-full border text-xs">انصراف</button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        {!(blogPosts || []).length && (
                          <p className="text-sm text-primary-500 text-center py-10">هنوز مطلبی ثبت نشده · از «افزودن بلاگ» مطلب جدید بنویسید</p>
                        )}
                        {(blogPosts || []).map(p => (
                          <div
                            key={p.id}
                            className={`flex flex-wrap items-center gap-2 p-3 rounded-xl border bg-white dark:bg-primary-900 transition ${blogForm && blogForm.id === p.id ? 'border-apple-blue dark:border-[#4CCD99] ring-1 ring-apple-blue/30' : 'border-primary-200 dark:border-white/15'}`}
                          >
                            <button
                              type="button"
                              onClick={() => setBlogForm({ ...p })}
                              className="flex-1 min-w-0 text-right"
                            >
                              <p className="text-sm font-bold text-primary-900 dark:text-white truncate">{p.title || 'بدون عنوان'}</p>
                              <p className="text-xs text-primary-500">
                                {p.cat || '—'} · {p.status === 'draft' ? 'پیش‌نویس' : p.status === 'scheduled' ? `زمان‌بندی‌شده${p.publishAtFa ? ' · ' + p.publishAtFa : ''}` : 'منتشر'} · {p.date || '—'}
                              </p>
                            </button>
                            <button type="button" onClick={() => setBlogForm({ ...p })} className="text-xs px-2.5 py-1 rounded-full border border-primary-200 dark:border-white/20 text-primary-800 dark:text-white">ویرایش</button>
                            <button type="button" onClick={() => { siteConfirm('حذف این مطلب؟').then(ok=>{ if(ok) { saveBlogPosts((blogPosts || []).filter(x => x.id !== p.id)); if (blogForm && blogForm.id === p.id) setBlogForm(null); } }); }} className="text-xs px-2.5 py-1 rounded-full border border-red-200 text-red-600">حذف</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!adminLoading && adminTab === 'campaigns' && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-base font-bold text-primary-900 dark:text-white">کمپین‌ها</h2>
                        <button type="button" onClick={() => setCampaignForm({ id: '', title: '', desc: '', rules: '', active: true, days: 7 })} className="text-xs px-3 py-1.5 rounded-full bg-apple-blue text-white font-medium">کمپین جدید</button>
                      </div>
                      {campaignForm && (
                        <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-2">
                          <input value={campaignForm.title} onChange={e => setCampaignForm(f => ({ ...f, title: e.target.value }))} placeholder="عنوان کمپین *" className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white" />
                          <input value={campaignForm.desc} onChange={e => setCampaignForm(f => ({ ...f, desc: e.target.value }))} placeholder="توضیح کوتاه" className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white" />
                          <input value={campaignForm.rules || ''} onChange={e => setCampaignForm(f => ({ ...f, rules: e.target.value }))} placeholder="قوانین کمپین" className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white" />
                          <div className="flex flex-wrap gap-3 items-center text-sm">
                            <label className="flex items-center gap-1.5 text-xs text-primary-700 dark:text-white"><input type="checkbox" checked={!!campaignForm.active} onChange={e => setCampaignForm(f => ({ ...f, active: e.target.checked }))} /> فعال</label>
                            <label className="text-xs text-primary-600 dark:text-white/70">مدت (روز): <input type="number" min={1} value={campaignForm.days || 7} onChange={e => setCampaignForm(f => ({ ...f, days: Number(e.target.value) || 7 }))} className="w-16 mx-1 px-2 py-1 rounded border border-primary-200 dark:border-white/20 bg-transparent" /></label>
                          </div>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => {
                              if (!campaignForm.title.trim()) { showToast({ message: 'عنوان الزامی است', variant: 'error', duration: 4500, position: 'top-center' }); return; }
                              const id = campaignForm.id || ('c' + Date.now());
                              const endAt = campaignForm.endAt || (Date.now() + (campaignForm.days || 7) * 86400000);
                              const item = { id, title: campaignForm.title, desc: campaignForm.desc, rules: campaignForm.rules || '', active: !!campaignForm.active, endAt, status: campaignForm.status || 'approved', sellerName: campaignForm.sellerName || null, source: campaignForm.source || 'admin' };
                              const next = campaignForm.id ? campaignsList.map(c => c.id === id ? item : c) : [item, ...campaignsList];
                              saveCampaigns(next);
                              setCampaignForm(null);
                            }} className="px-4 py-2 rounded-full bg-apple-blue text-white text-xs font-medium">ذخیره</button>
                            <button type="button" onClick={() => setCampaignForm(null)} className="px-4 py-2 rounded-full border text-xs">انصراف</button>
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        {campaignsList.map(c => (
                          <div key={c.id} className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-primary-900 dark:text-white">{c.title} {c.status === 'pending' ? <span className="text-xs text-amber-600">در انتظار تأیید</span> : c.active ? <span className="text-xs text-emerald-600">فعال</span> : <span className="text-xs text-primary-400">غیرفعال</span>}{c.sellerName ? <span className="text-xs text-primary-400"> · {c.sellerName}</span> : null}</p>
                              <p className="text-xs text-primary-500 truncate">{c.desc}</p>
                            </div>
                            {c.status === 'pending' && (
                              <button type="button" onClick={async () => { const next = campaignsList.map(x => x.id === c.id ? { ...x, status: 'approved', active: true } : x); saveCampaigns(next); if (typeof persistCampaignOnServer === 'function') try { await persistCampaignOnServer({ id: c.id, status: 'approved', active: true }, 'PATCH'); } catch(_){} }} className="text-xs px-2.5 py-1 rounded-full bg-emerald-500 text-white">تأیید</button>
                            )}
                            <button type="button" onClick={() => setCampaignForm({ ...c, days: Math.max(1, Math.ceil(((c.endAt||Date.now()) - Date.now()) / 86400000)) })} className="text-xs px-2.5 py-1 rounded-full border">ویرایش</button>
                            <button type="button" onClick={() => saveCampaigns(campaignsList.map(x => x.id === c.id ? { ...x, active: !x.active } : x))} className="text-xs px-2.5 py-1 rounded-full border border-primary-200 dark:border-white/20">{c.active ? 'غیرفعال' : 'فعال'} کردن</button>
                            <button type="button" onClick={() => { siteConfirm('حذف کمپین؟').then(ok=>{ if(ok) saveCampaigns(campaignsList.filter(x => x.id !== c.id)); }); }} className="text-xs px-2.5 py-1 rounded-full border border-red-200 text-red-600">حذف</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  
                  {/* SEO & Indexing */}
                  {!adminLoading && adminTab === 'seo' && (
                    <div className="space-y-6 max-w-3xl">
                      <div>
                        <h2 className="text-base font-bold text-primary-900 dark:text-white">سئو و ابزارهای فنی</h2>
                        <p className="text-xs text-primary-500 mt-1">سئوی هر صفحه جداگانه · اسکیما، سایت‌مپ، Search Console، GA و GTM</p>
                      </div>

                      {/* Page SEO hub — جایگزین ایندکس سراسری و تگ‌های عمومی */}
                      <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-4">
                        <div>
                          <h3 className="text-sm font-bold text-primary-900 dark:text-white">سئوی صفحات سایت</h3>
                          <p className="text-xs text-primary-500 mt-1 whitespace-nowrap shrink-0">برای هر صفحه: تحلیل، کلمات کلیدی، Title، Meta، FAQ، پیش‌نمایش گوگل/شبکه، سپس ایندکس و کنونیکال. سئوی محصول در پنل فروشنده است.</p>
                        </div>
                        {(() => {
                          const base = (seoCfg().canonicalBase || 'https://pirahanemardane.ir').replace(/\/$/, '');
                          const staticPages = [
                            { key: 'static:home', label: 'صفحه اصلی', slug: '', type: 'page' },
                            { key: 'static:about', label: 'درباره ما', slug: 'about', type: 'page' },
                            { key: 'static:contact', label: 'تماس با ما', slug: 'contact', type: 'page' },
                            { key: 'static:deals', label: 'شگفت‌انگیز', slug: 'deals', type: 'page' },
                            { key: 'static:terms', label: 'قوانین و شرایط', slug: 'terms', type: 'page' },
                            { key: 'static:privacy', label: 'حریم خصوصی', slug: 'privacy', type: 'page' },
                            { key: 'static:returns', label: 'شرایط بازگشت کالا', slug: 'returns', type: 'page' },
                            { key: 'static:size-guide', label: 'راهنمای سایز', slug: 'size-guide', type: 'page' },
                            { key: 'static:faq', label: 'سوالات متداول', slug: 'faq', type: 'page' },
                            { key: 'sellers', label: 'فروشندگان', slug: 'sellers', type: 'page' },
                            { key: 'blog', label: 'بلاگ (لیست)', slug: 'blog', type: 'article' },
                            { key: 'static:brands', label: 'برندها', slug: 'brands', type: 'brand' },
                          ];
                          const catPages = (adminCategories || []).filter(c => c.active !== false).map(c => ({
                            key: `category:${c.slug || c.name}`,
                            label: `دسته: ${c.name}`,
                            slug: c.slug || '',
                            type: 'category',
                            entity: c,
                          }));
                          const brandPages = (adminCatalogBrands || []).filter(b => b.active !== false).map(b => ({
                            key: `brand:${b.id}`,
                            label: `برند: ${b.name}`,
                            slug: b.slug || b.id,
                            type: 'brand',
                            entity: b,
                          }));
                          const blogPages = (blogPosts || []).slice(0, 30).map(post => ({
                            key: `blog-post:${post.id}`,
                            label: `مقاله: ${post.title || post.id}`,
                            slug: post.slug || String(post.id),
                            type: 'article',
                            entity: post,
                          }));
                          const all = [...staticPages, ...catPages, ...brandPages, ...blogPages];
                          const active = all.find(x => x.key === adminSeoHubKey) || null;
                          const ov = adminSeoHubKey ? (pageSeoMap[adminSeoHubKey] || {}) : {};
                          const loadForm = (item) => {
                            const o = pageSeoMap[item.key] || {};
                            const ent = item.entity || {};
                            return {
                              title: o.title || ent.seoTitle || item.label || '',
                              description: o.description || ent.seoDescription || ent.description || '',
                              focusKeywords: o.focusKeywords || ent.seoFocusKeywords || '',
                              canonical: o.canonical || ent.seoCanonical || '',
                              ogImage: o.ogImage || ent.image || '',
                              noindex: o.indexable === false || !!ent.seoNoindex,
                              faq: Array.isArray(o.faq) ? o.faq : (ent.seoFaq || []),
                              slug: o.slug || item.slug || '',
                            };
                          };
                          return (
                            <div className="space-y-3">
                              <div className="max-h-56 overflow-y-auto rounded-xl border border-primary-100 dark:border-white/10 divide-y divide-primary-50 dark:divide-white/5">
                                {all.map(item => {
                                  const saved = pageSeoMap[item.key];
                                  const isOn = adminSeoHubKey === item.key;
                                  return (
                                    <button
                                      key={item.key}
                                      type="button"
                                      onClick={() => setAdminSeoHubKey(isOn ? null : item.key)}
                                      className={`w-full text-right px-3 py-2.5 flex items-center justify-between gap-2 text-xs transition ${isOn ? 'bg-primary-50 dark:bg-primary-800' : 'hover:bg-primary-50/60 dark:hover:bg-primary-800/50'}`}
                                    >
                                      <span className="font-medium text-primary-900 dark:text-white truncate">{item.label}</span>
                                      <span className="flex items-center gap-1.5 flex-shrink-0">
                                        {saved?.indexable === false || saved?.noindex ? (
                                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">noindex</span>
                                        ) : saved ? (
                                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">ذخیره‌شده</span>
                                        ) : (
                                          <span className="text-[10px] text-primary-400">تنظیم نشده</span>
                                        )}
                                        <span className="text-primary-400">{isOn ? '▲' : '▼'}</span>
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                              {active && (() => {
                                const f = loadForm(active);
                                return (
                                  <div className="space-y-3 pt-1">
                                    <p className="text-xs text-primary-500">در حال ویرایش: <span className="font-bold text-primary-900 dark:text-white">{active.label}</span></p>
                                    {renderContentSeoBox({
                                      mode: active.type === 'article' ? 'article' : active.type === 'category' ? 'category' : active.type === 'brand' ? 'brand' : 'page',
                                      sellerLimited: false,
                                      adminSeoLayout: true,
                                      showAdminIndexCanonical: true,
                                      title: f.title,
                                      description: f.description,
                                      focusKeywords: f.focusKeywords,
                                      canonical: f.canonical,
                                      ogImage: f.ogImage,
                                      noindex: f.noindex,
                                      contentTitle: active.label,
                                      bodyText: f.description,
                                      hasImage: !!f.ogImage,
                                      faqItems: f.faq,
                                      onFaqChange: (items) => {
                                        const prev = pageSeoMap[active.key] || {};
                                        savePageSeoMap({
                                          ...pageSeoMap,
                                          [active.key]: {
                                            ...prev,
                                            ...f,
                                            title: prev.title || f.title,
                                            description: prev.description || f.description,
                                            faq: items,
                                            indexable: !(prev.indexable === false || f.noindex),
                                            type: active.type,
                                            label: active.label,
                                            slug: f.slug,
                                            updatedAt: new Date().toISOString(),
                                          },
                                        });
                                      },
                                      previewUrl: base + '/' + (f.slug || active.slug || ''),
                                      onChange: (patch) => {
                                        const prev = pageSeoMap[active.key] || {};
                                        const nextNoindex = patch.noindex != null ? patch.noindex : f.noindex;
                                        savePageSeoMap({
                                          ...pageSeoMap,
                                          [active.key]: {
                                            ...prev,
                                            title: patch.title != null ? patch.title : (prev.title || f.title),
                                            description: patch.description != null ? patch.description : (prev.description || f.description),
                                            focusKeywords: patch.focusKeywords != null ? patch.focusKeywords : (prev.focusKeywords || f.focusKeywords),
                                            canonical: patch.canonical != null ? patch.canonical : (prev.canonical || f.canonical),
                                            ogImage: patch.ogImage != null ? patch.ogImage : (prev.ogImage || f.ogImage),
                                            indexable: !nextNoindex,
                                            faq: Array.isArray(prev.faq) ? prev.faq : f.faq,
                                            type: active.type,
                                            label: active.label,
                                            slug: f.slug || active.slug,
                                            updatedAt: new Date().toISOString(),
                                          },
                                        });
                                      },
                                    })}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        showToast({ message: 'سئوی صفحه ذخیره شد', variant: 'success', duration: 3000, position: 'top-center' });
                                        setAdminSeoHubKey(null);
                                      }}
                                      className="w-full py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium"
                                    >
                                      بستن
                                    </button>
                                  </div>
                                );
                              })()}
                              <p className="text-[10px] text-primary-400 leading-relaxed whitespace-nowrap shrink-0 text-xs sm:text-sm">سئوی محصول از پنل فروشنده · سئوی دسته/برند هنگام ساخت همان آیتم نیز در دسترس است · ایندکس سراسری حذف شد؛ ایندکس هر صفحه اینجاست.</p>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Canonical base only (site-wide technical) */}
                      <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-3">
                        <h3 className="text-sm font-bold text-primary-900 dark:text-white">آدرس پایه سایت (Canonical Base)</h3>
                        <p className="text-xs text-primary-500">برای ساخت URL کامل صفحات و سایت‌مپ</p>
                        <input defaultValue={seoCfg().canonicalBase} id="seo-canon" dir="ltr" className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left text-primary-900 dark:text-white" />
                        <button type="button" onClick={() => {
                          saveSeoPatch({ canonicalBase: document.getElementById('seo-canon')?.value || '' });
                          showToast({ message: 'آدرس پایه ذخیره شد', variant: 'success', duration: 3500, position: 'top-center' });
                        }} className="px-4 py-2 rounded-full bg-apple-blue text-white text-xs font-medium">ذخیره</button>
                      </div>

                      {/* Schema */}
                      <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-3">
                        <h3 className="text-sm font-bold text-primary-900 dark:text-white">اتصال به موتورهای جستجو</h3>
                        <p className="text-xs text-primary-500">کد تأیید (Verification) هر موتور را وارد کنید تا متا تگ در سایت قرار گیرد.</p>
                        {[
                          ['googleSiteVerification', 'Google Search Console'],
                          ['bingSiteVerification', 'Bing Webmaster (msvalidate.01)'],
                          ['yandexVerification', 'Yandex Webmaster'],
                          ['yahooVerification', 'Yahoo'],
                          ['baiduVerification', 'Baidu'],
                          ['duckduckVerification', 'DuckDuckGo / سایر'],
                        ].map(([key, label]) => (
                          <div key={key}>
                            <label className="text-xs text-primary-500 block mb-1">{label}</label>
                            <input id={`seo-v-${key}`} defaultValue={seoCfg()[key] || ''} dir="ltr" className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left text-primary-900 dark:text-white" placeholder="کد verification" />
                          </div>
                        ))}
                        <div>
                          <label className="text-xs text-primary-500 block mb-1">متاهای سفارشی (هر خط: name=content)</label>
                          <Textarea id="seo-custom-meta" defaultValue={seoCfg().customMetaVerifications} placeholder="my-engine-verification=abc123" rows={3} style={{ minHeight: 84 }} dir="ltr" />
                        </div>
                        <button type="button" onClick={() => {
                          saveSeoPatch({
                            googleSiteVerification: document.getElementById('seo-v-googleSiteVerification')?.value || '',
                            bingSiteVerification: document.getElementById('seo-v-bingSiteVerification')?.value || '',
                            yandexVerification: document.getElementById('seo-v-yandexVerification')?.value || '',
                            yahooVerification: document.getElementById('seo-v-yahooVerification')?.value || '',
                            baiduVerification: document.getElementById('seo-v-baiduVerification')?.value || '',
                            duckduckVerification: document.getElementById('seo-v-duckduckVerification')?.value || '',
                            customMetaVerifications: document.getElementById('seo-custom-meta')?.value || '',
                          });
                          showToast({ message: 'کدهای تأیید ذخیره شد', variant: 'success', duration: 4500, position: 'top-center' });
                        }} className="px-4 py-2 rounded-full bg-apple-blue text-white text-xs font-medium">ذخیره Verification</button>
                        <div className="flex flex-wrap gap-2 pt-2">
                          <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="text-xs px-3 py-1.5 rounded-full border border-primary-200 text-primary-700 dark:text-white">Google Search Console</a>
                          <a href="https://www.bing.com/webmasters" target="_blank" rel="noreferrer" className="text-xs px-3 py-1.5 rounded-full border border-primary-200 text-primary-700 dark:text-white">Bing Webmaster</a>
                          <a href="https://webmaster.yandex.com" target="_blank" rel="noreferrer" className="text-xs px-3 py-1.5 rounded-full border border-primary-200 text-primary-700 dark:text-white">Yandex</a>
                        </div>
                      </div>

                      {/* Sitemap & robots */}
                      <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-3">
                        <h3 className="text-sm font-bold text-primary-900 dark:text-white">سایت‌مپ و robots.txt</h3>
                        <p className="text-xs text-primary-500">از ساختار فعلی سایت (محصولات، دسته، بلاگ…) XML ساخته می‌شود — برای آپلود در Search Console.</p>
                        <div className="flex flex-wrap gap-2">
                          {[
                            ['sitemapIncludeProducts', 'محصولات'],
                            ['sitemapIncludeCategories', 'دسته‌ها'],
                            ['sitemapIncludeBlog', 'بلاگ'],
                            ['sitemapIncludeStatic', 'صفحات ثابت'],
                            ['sitemapIncludeSellers', 'فروشندگان'],
                          ].map(([key, label]) => {
                            const on = !!seoCfg()[key];
                            return (
                              <button key={key} type="button" onClick={() => saveSeoPatch({ [key]: !on })} className={`text-xs px-3 py-1.5 rounded-full border ${on ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'border-primary-200 text-primary-500'}`}>{label}</button>
                            );
                          })}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => downloadSeoFile('sitemap.xml', buildSitemapXml(), 'application/xml;charset=utf-8')} className="text-xs px-3 py-2 rounded-full bg-apple-blue text-white font-medium flex items-center gap-1"><Icon name="download" size={14} /> دانلود sitemap.xml</button>
                          <button type="button" onClick={() => downloadSeoFile('sitemap-index.xml', buildSitemapIndexXml(), 'application/xml;charset=utf-8')} className="text-xs px-3 py-2 rounded-full border border-primary-200 dark:border-white/20 font-medium">دانلود sitemap-index.xml</button>
                          <button type="button" onClick={exportRedirectsForServer} className="text-xs px-3 py-2 rounded-full border border-primary-200 dark:border-white/20 font-medium">خروجی ریدایرکت سروری (JSON)</button>
                          <button type="button" onClick={() => { const h = runSeoHealthCheck(); if (h.ok) showToast({ message: 'بررسی سلامت سئو: موردی یافت نشد', variant: 'success', duration: 4000, position: 'top-center' }); else showToast({ message: h.issues[0], variant: 'error', duration: 5000, position: 'top-center' }); }} className="text-xs px-3 py-2 rounded-full border border-primary-200 dark:border-white/20 font-medium">بررسی سلامت سئو (P0)</button>
                          <button type="button" onClick={() => downloadSeoFile('robots.txt', buildRobotsTxt(), 'text/plain;charset=utf-8')} className="text-xs px-3 py-2 rounded-full border border-primary-200 dark:border-white/20 text-primary-700 dark:text-white font-medium flex items-center gap-1"><Icon name="download" size={14} /> دانلود robots.txt</button>
                          <button type="button" onClick={() => downloadSeoFile('llms.txt', buildLlmsTxt(), 'text/plain;charset=utf-8')} className="text-xs px-3 py-2 rounded-full border border-primary-200 dark:border-white/20 text-primary-700 dark:text-white font-medium flex items-center gap-1"><Icon name="download" size={14} /> دانلود llms.txt</button>
                        </div>
                        <div>
                          <label className="text-xs text-primary-500 block mb-1">خطوط اضافه robots.txt</label>
                          <Textarea id="seo-robots-extra" defaultValue={seoCfg().robotsTxtExtra} placeholder="Disallow: /admin" rows={3} style={{ minHeight: 84 }} dir="ltr" />
                          <button type="button" onClick={() => saveSeoPatch({ robotsTxtExtra: document.getElementById('seo-robots-extra')?.value || '' })} className="mt-2 text-xs text-apple-blue">ذخیره خطوط اضافه robots</button>
                          <label className="text-xs text-primary-500 block mt-3 mb-1">متن اضافی llms.txt</label>
                          <Textarea id="seo-llms-extra" defaultValue={seoCfg().llmsTxtExtra || ''} placeholder="قوانین اضافه برای دستیارهای AI…" rows={3} style={{ minHeight: 84 }} />
                          <button type="button" onClick={() => saveSeoPatch({ llmsTxtExtra: document.getElementById('seo-llms-extra')?.value || '' })} className="mt-2 text-xs text-apple-blue">ذخیره خطوط اضافه llms</button>
                        </div>
                      </div>

                      {/* Redirects moved to dedicated tab */}
                      <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-2">
                        <h3 className="text-sm font-bold text-primary-900 dark:text-white">ریدایرکت دستی</h3>
                        <p className="text-xs text-primary-500">مدیریت ۳۰۱ / ۳۰۲ / ۴۱۰ در تب جداگانه «ریدایرکت»</p>
                        <button type="button" onClick={() => { setAdminTab('redirects'); scrollAdminPanelToTop(); setTimeout(() => { scrollAdminPanelToTop(); document.getElementById('admin-tab-redirects')?.scrollIntoView({ block: 'start', behavior: 'auto' }); scrollAdminPanelToTop(); }, 220); }} className="text-xs px-3 py-2 rounded-full bg-apple-blue text-white font-medium">باز کردن تب ریدایرکت</button>
                      </div>

                      <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-bold text-primary-900 dark:text-white">مانیتور ۴۰۴</h3>
                          <button type="button" onClick={() => saveSeo404Log([])} className="text-xs text-primary-500 hover:text-red-500">پاک کردن لاگ</button>
                        </div>
                        <p className="text-xs text-primary-500">آخرین مسیرهای یافت‌نشده (حداکثر ۲۰۰)</p>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {(seo404Log || []).length === 0 && <p className="text-xs text-primary-400">لاگی ثبت نشده</p>}
                          {(seo404Log || []).map(e => (
                            <div key={e.id} className="text-xs py-1.5 border-b border-primary-50 dark:border-white/5 flex flex-wrap gap-x-3 gap-y-0.5">
                              <span className="font-latin text-primary-900 dark:text-white" dir="ltr">{e.path}</span>
                              <span className="text-primary-400">{e.atFa}</span>
                              {e.referrer ? <span className="text-primary-400 truncate max-w-[12rem]" dir="ltr">از: {e.referrer}</span> : null}
                              <button type="button" className="text-apple-blue" onClick={() => setSeoRedirectForm({ from: e.path, to: '', type: '301' })}>ریدایرکت بساز</button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* فاز C: Image SEO + IndexNow + Custom Schema */}
                      <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-3">
                        <h3 className="text-sm font-bold text-primary-900 dark:text-white">Image SEO</h3>
                        <label className="flex items-center gap-2 text-xs text-primary-800 dark:text-white cursor-pointer">
                          <input type="checkbox" defaultChecked={seoCfg().imageSeoAutoAlt !== false} id="seo-img-auto-alt" />
                          تولید خودکار ALT از قالب
                        </label>
                        <div>
                          <label className="text-xs text-primary-500 block mb-1">قالب ALT (متغیرها: {'{name}'} {'{brand}'} {'{category}'} {'{keyword}'})</label>
                          <input id="seo-img-alt-tpl" defaultValue={seoCfg().imageSeoAltTemplate || '{name} | {brand} | پیراهن مردانه'} className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white" />
                        </div>
                        <button type="button" onClick={() => {
                          saveSeoPatch({
                            imageSeoAutoAlt: !!document.getElementById('seo-img-auto-alt')?.checked,
                            imageSeoAltTemplate: document.getElementById('seo-img-alt-tpl')?.value || '',
                          });
                          showToast({ message: 'تنظیمات Image SEO ذخیره شد', variant: 'success', duration: 3500, position: 'top-center' });
                        }} className="text-xs px-3 py-2 rounded-full bg-apple-blue text-white">ذخیره Image SEO</button>
                      </div>

                      <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-3">
                        <h3 className="text-sm font-bold text-primary-900 dark:text-white">IndexNow</h3>
                        <p className="text-xs text-primary-500">اعلام URLهای جدید/به‌روز به موتورهای پشتیبان IndexNow. در پروداکشن باید از سرور پروکسی شود.</p>
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                          <input type="checkbox" id="seo-indexnow-on" defaultChecked={!!seoCfg().indexNowEnabled} />
                          فعال
                        </label>
                        <input id="seo-indexnow-key" defaultValue={seoCfg().indexNowKey || ''} dir="ltr" placeholder="API Key" className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left font-latin" />
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => {
                            saveSeoPatch({
                              indexNowEnabled: !!document.getElementById('seo-indexnow-on')?.checked,
                              indexNowKey: document.getElementById('seo-indexnow-key')?.value || '',
                            });
                            showToast({ message: 'IndexNow ذخیره شد', variant: 'success', duration: 3500, position: 'top-center' });
                          }} className="text-xs px-3 py-2 rounded-full bg-apple-blue text-white">ذخیره</button>
                          <button type="button" onClick={() => pingIndexNow(['/'])} className="text-xs px-3 py-2 rounded-full border border-primary-200 dark:border-white/20">پینگ صفحه اصلی</button>
                          <button type="button" onClick={() => {
                            const urls = (products || []).slice(0, 20).map(pr => `/product/${pr.slug || pr.id}`);
                            pingIndexNow(urls);
                          }} className="text-xs px-3 py-2 rounded-full border border-primary-200 dark:border-white/20">پینگ ۲۰ محصول</button>
                        </div>
                      </div>

                      
                      {/* P0: Google Search Console API */}
                      <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-3">
                        <h3 className="text-sm font-bold text-primary-900 dark:text-white">Google Search Console (API)</h3>
                        <p className="text-xs text-primary-500">اتصال رسمی برای گزارش کلیک/نمایش/رتبه. کلیدها فقط در env سرور: GSC_CLIENT_ID · GSC_CLIENT_SECRET · GSC_REFRESH_TOKEN · GSC_SITE_URL</p>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={async () => {
                            try {
                              const res = await fetch('/api/seo/gsc');
                              const data = await res.json();
                              showToast({ message: data.message || (data.connected ? 'GSC متصل است' : 'GSC هنوز به env وصل نیست'), variant: data.connected ? 'success' : 'info', duration: 5000, position: 'top-center' });
                            } catch (_) {
                              showToast({ message: 'خطا در بررسی وضعیت GSC', variant: 'error', duration: 4000, position: 'top-center' });
                            }
                          }} className="text-xs px-3 py-2 rounded-full border border-primary-200 dark:border-white/20">وضعیت اتصال</button>
                          <button type="button" onClick={async () => {
                            try {
                              const res = await fetch('/api/seo/gsc', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'test' }) });
                              const data = await res.json();
                              const sample = (data.rows && data.rows[0]) ? data.rows[0].query : '';
                              showToast({ message: data.message + (sample ? ` · نمونه: ${sample}` : ''), variant: data.ok ? 'success' : 'info', duration: 5000, position: 'top-center' });
                            } catch (_) {
                              showToast({ message: 'خطا در تست GSC', variant: 'error', duration: 4000, position: 'top-center' });
                            }
                          }} className="text-xs px-3 py-2 rounded-full bg-apple-blue text-white">تست Search Analytics</button>
                          <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="text-xs px-3 py-2 rounded-full border border-primary-200 dark:border-white/20">باز کردن GSC</a>
                        </div>
                      </div>

<div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-bold text-primary-900 dark:text-white">Custom Schema Builder</h3>
                          <button type="button" className="text-xs text-apple-blue" onClick={() => {
                            const list = Array.isArray(seoCfg().customSchemas) ? [...seoCfg().customSchemas] : [];
                            list.push({ id: 'cs-' + Date.now(), name: 'Schema جدید', when: 'all', enabled: true, json: '{\n  "@context": "https://schema.org",\n  "@type": "WebSite",\n  "name": "پیراهن مردانه"\n}' });
                            saveSeoPatch({ customSchemas: list });
                          }}>+ Schema</button>
                        </div>
                        <p className="text-xs text-primary-500">فقط ادمین · شرط نمایش: all / home / product / article</p>
                        {(Array.isArray(seoCfg().customSchemas) ? seoCfg().customSchemas : []).map((cs, i) => (
                          <div key={cs.id || i} className="p-3 rounded-xl bg-white dark:bg-primary-900 border border-primary-100 dark:border-white/10 space-y-2">
                            <div className="flex flex-wrap gap-2 items-center">
                              <input defaultValue={cs.name || ''} onBlur={e => {
                                const list = [...(seoCfg().customSchemas || [])];
                                list[i] = { ...list[i], name: e.target.value };
                                saveSeoPatch({ customSchemas: list });
                              }} className="flex-1 min-w-[8rem] px-2 py-1.5 rounded-lg border border-primary-200 dark:border-white/15 bg-transparent text-xs" placeholder="نام" />
                              <select defaultValue={cs.when || 'all'} onChange={e => {
                                const list = [...(seoCfg().customSchemas || [])];
                                list[i] = { ...list[i], when: e.target.value };
                                saveSeoPatch({ customSchemas: list });
                              }} className="px-2 py-1.5 rounded-lg border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 text-xs">
                                <option value="all">همه صفحات</option>
                                <option value="home">خانه</option>
                                <option value="product">محصول</option>
                                <option value="article">مقاله</option>
                              </select>
                              <label className="text-xs flex items-center gap-1">
                                <input type="checkbox" defaultChecked={cs.enabled !== false} onChange={e => {
                                  const list = [...(seoCfg().customSchemas || [])];
                                  list[i] = { ...list[i], enabled: e.target.checked };
                                  saveSeoPatch({ customSchemas: list });
                                }} /> فعال
                              </label>
                              <button type="button" className="text-xs text-red-500" onClick={() => {
                                const list = (seoCfg().customSchemas || []).filter((_, j) => j !== i);
                                saveSeoPatch({ customSchemas: list });
                              }}>حذف</button>
                            </div>
                            <textarea defaultValue={typeof cs.json === 'string' ? cs.json : JSON.stringify(cs.json || {}, null, 2)} onBlur={e => {
                              const list = [...(seoCfg().customSchemas || [])];
                              list[i] = { ...list[i], json: e.target.value };
                              saveSeoPatch({ customSchemas: list });
                            }} rows={5} dir="ltr" className="w-full px-2 py-1.5 rounded-lg border border-primary-200 dark:border-white/15 bg-transparent text-xs font-latin text-left" />
                          </div>
                        ))}
                        {!(seoCfg().customSchemas || []).length && <p className="text-xs text-primary-400">Schema سفارشی ندارید</p>}
                      </div>

                      {/* فاز D: Local · News/Video · Brand AI · Rank Tracker */}
                      <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-primary-900 dark:text-white">Local SEO</h3>
                          <label className="text-xs flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" checked={!!seoCfg().localSeoEnabled} onChange={e => saveSeoPatch({ localSeoEnabled: e.target.checked })} />
                            فعال
                          </label>
                        </div>
                        <p className="text-xs text-primary-500">NAP چندلوکیشنی + Schema LocalBusiness — فقط ادمین</p>
                        <div className="grid sm:grid-cols-2 gap-2">
                          <input defaultValue={seoCfg().localBusinessName || ''} onBlur={e => saveSeoPatch({ localBusinessName: e.target.value })} placeholder="نام کسب‌وکار" className="px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm" />
                          <input defaultValue={seoCfg().localPhone || ''} onBlur={e => saveSeoPatch({ localPhone: e.target.value })} dir="ltr" placeholder="تلفن" className="px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left font-latin" />
                          <input defaultValue={seoCfg().localEmail || ''} onBlur={e => saveSeoPatch({ localEmail: e.target.value })} dir="ltr" placeholder="ایمیل" className="px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left font-latin" />
                          <input defaultValue={seoCfg().localPriceRange || ''} onBlur={e => saveSeoPatch({ localPriceRange: e.target.value })} placeholder="بازه قیمت (مثلاً $$)" className="px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm" />
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-primary-700 dark:text-white">لوکیشن‌ها</p>
                          <button type="button" className="text-xs text-apple-blue" onClick={() => {
                            const list = [...(seoCfg().localLocations || [])];
                            list.push({ id: 'loc-' + Date.now(), name: '', address: '', city: '', postalCode: '', phone: '', lat: '', lng: '', hours: '', mapsUrl: '' });
                            saveSeoPatch({ localLocations: list });
                          }}>+ لوکیشن</button>
                        </div>
                        {(seoCfg().localLocations || []).map((L, i) => (
                          <div key={L.id || i} className="p-3 rounded-xl bg-white dark:bg-primary-900 border border-primary-100 dark:border-white/10 space-y-2">
                            <div className="grid sm:grid-cols-2 gap-2">
                              {[
                                ['name', 'نام شعبه'],
                                ['address', 'آدرس'],
                                ['city', 'شهر'],
                                ['postalCode', 'کد پستی'],
                                ['phone', 'تلفن'],
                                ['hours', 'ساعات کاری'],
                                ['lat', 'عرض جغرافیایی'],
                                ['lng', 'طول جغرافیایی'],
                              ].map(([k, lab]) => (
                                <input key={k} defaultValue={L[k] || ''} placeholder={lab} dir={k === 'lat' || k === 'lng' || k === 'phone' ? 'ltr' : undefined}
                                  onBlur={e => {
                                    const list = [...(seoCfg().localLocations || [])];
                                    list[i] = { ...list[i], [k]: e.target.value };
                                    saveSeoPatch({ localLocations: list });
                                  }}
                                  className="px-2 py-1.5 rounded-lg border border-primary-200 dark:border-white/15 bg-transparent text-xs"
                                />
                              ))}
                            </div>
                            <button type="button" className="text-xs text-red-500" onClick={() => saveSeoPatch({ localLocations: (seoCfg().localLocations || []).filter((_, j) => j !== i) })}>حذف لوکیشن</button>
                          </div>
                        ))}
                      </div>

                      <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-3">
                        <h3 className="text-sm font-bold text-primary-900 dark:text-white">News و Video Sitemap</h3>
                        <div className="flex flex-wrap gap-3">
                          <label className="text-xs flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" checked={!!seoCfg().newsSitemapEnabled} onChange={e => saveSeoPatch({ newsSitemapEnabled: e.target.checked })} />
                            News Sitemap
                          </label>
                          <label className="text-xs flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" checked={!!seoCfg().videoSitemapEnabled} onChange={e => saveSeoPatch({ videoSitemapEnabled: e.target.checked })} />
                            Video Sitemap
                          </label>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" disabled={!seoCfg().newsSitemapEnabled} onClick={() => downloadSeoFile('news-sitemap.xml', buildNewsSitemapXml(), 'application/xml;charset=utf-8')} className="text-xs px-3 py-2 rounded-full border border-primary-200 dark:border-white/20 disabled:opacity-40">دانلود news-sitemap.xml</button>
                          <button type="button" disabled={!seoCfg().videoSitemapEnabled} onClick={() => downloadSeoFile('video-sitemap.xml', buildVideoSitemapXml(), 'application/xml;charset=utf-8')} className="text-xs px-3 py-2 rounded-full border border-primary-200 dark:border-white/20 disabled:opacity-40">دانلود video-sitemap.xml</button>
                        </div>
                        <p className="text-xs text-primary-400">News از مطالب منتشرشده بلاگ · Video از محصولات دارای آپارات/ویدیو</p>
                      </div>

                      <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-primary-900 dark:text-white">رصد برند در AI (Brand Visibility)</h3>
                          <button type="button" onClick={simulateBrandScan} className="btn-cta text-xs px-3 py-1.5 rounded-full bg-apple-blue text-white">اسکن شبیه‌سازی</button>
                        </div>
                        <p className="text-xs text-primary-500">ChatGPT / Perplexity / Gemini — ثبت دستی یا اسکن نمونه. داده واقعی نیاز به سرویس رصد دارد.</p>
                        <input
                          defaultValue={(seoCfg().brandNames || []).join('، ')}
                          onBlur={e => saveSeoPatch({ brandNames: e.target.value.split(/[,،]/).map(x => x.trim()).filter(Boolean) })}
                          placeholder="نام‌های برند با ویرگول"
                          className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm"
                        />
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {(seoCfg().brandMentions || []).length === 0 && <p className="text-xs text-primary-400">هنوز موردی ثبت نشده</p>}
                          {(seoCfg().brandMentions || []).slice(0, 20).map(m => (
                            <div key={m.id} className="text-xs py-1.5 border-b border-primary-50 dark:border-white/5 flex flex-wrap gap-x-2">
                              <span className={`px-1.5 py-0.5 rounded ${m.sentiment === 'positive' ? 'bg-emerald-100 text-emerald-800' : m.sentiment === 'none' ? 'bg-primary-100 text-primary-600' : 'bg-amber-100 text-amber-800'}`}>{m.platform}</span>
                              <span className="text-primary-400">{m.atFa}</span>
                              <span className="text-primary-800 dark:text-white">{m.note}</span>
                            </div>
                          ))}
                        </div>
                        <button type="button" className="text-xs text-primary-500" onClick={() => saveSeoPatch({ brandMentions: [] })}>پاک کردن لاگ برند</button>
                      </div>

                      <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-3">
                        <h3 className="text-sm font-bold text-primary-900 dark:text-white">Keyword Rank Tracker</h3>
                        <p className="text-xs text-primary-500">ثبت دستی رتبه کلمات (از GSC یا ابزارهای دیگر). تاریخچه تا ۳۰ نقطه.</p>
                        <div className="grid sm:grid-cols-3 gap-2">
                          <input id="rank-kw" placeholder="کلمه کلیدی" className="px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm" />
                          <input id="rank-pos" type="number" min="1" max="100" placeholder="رتبه (۱–۱۰۰)" dir="ltr" className="px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left font-latin" />
                          <input id="rank-url" placeholder="URL مرتبط (اختیاری)" dir="ltr" className="px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left font-latin" />
                        </div>
                        <button type="button" onClick={() => {
                          const kw = document.getElementById('rank-kw')?.value || '';
                          const pos = document.getElementById('rank-pos')?.value || '';
                          const url = document.getElementById('rank-url')?.value || '';
                          if (!kw || !pos) { showToast({ message: 'کلمه و رتبه لازم است', variant: 'error', duration: 3500, position: 'top-center' }); return; }
                          upsertRankKeyword(kw, pos, url);
                          showToast({ message: 'رتبه ثبت شد', variant: 'success', duration: 3000, position: 'top-center' });
                          try { document.getElementById('rank-kw').value = ''; document.getElementById('rank-pos').value = ''; } catch (_) {}
                        }} className="text-xs px-3 py-2 rounded-full bg-apple-blue text-white">ثبت رتبه</button>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {(seoCfg().rankKeywords || []).length === 0 && <p className="text-xs text-primary-400">کلمه‌ای ثبت نشده</p>}
                          {(seoCfg().rankKeywords || []).map(r => {
                            const prev = (r.history || [])[1]?.position;
                            const delta = prev != null ? prev - r.position : null;
                            return (
                              <div key={r.id} className="flex items-center gap-2 text-xs py-1.5 border-b border-primary-50 dark:border-white/5">
                                <span className="font-bold text-primary-900 dark:text-white min-w-[4rem]">#{toFa(r.position)}</span>
                                <span className="flex-1 text-primary-800 dark:text-white truncate">{r.keyword}</span>
                                {delta != null && delta !== 0 && (
                                  <span className={delta > 0 ? 'text-emerald-600' : 'text-red-500'}>{delta > 0 ? '↑' : '↓'}{toFa(Math.abs(delta))}</span>
                                )}
                                <button type="button" className="text-red-500" onClick={() => saveSeoPatch({ rankKeywords: (seoCfg().rankKeywords || []).filter(x => x.id !== r.id) })}>حذف</button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* GTM & GA */}
                      <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-3">
                        <h3 className="text-sm font-bold text-primary-900 dark:text-white">Google Tag Manager و Analytics</h3>
                        <div>
                          <label className="text-xs text-primary-500 block mb-1">GTM Container ID</label>
                          <input id="seo-gtm" defaultValue={seoCfg().gtmId} dir="ltr" placeholder="GTM-XXXXXXX" className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left text-primary-900 dark:text-white" />
                        </div>
                        <div>
                          <label className="text-xs text-primary-500 block mb-1">Google Analytics 4 Measurement ID</label>
                          <input id="seo-ga" defaultValue={seoCfg().gaId} dir="ltr" placeholder="G-XXXXXXXX" className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left text-primary-900 dark:text-white" />
                        </div>
                        <button type="button" onClick={() => {
                          saveSeoPatch({
                            gtmId: document.getElementById('seo-gtm')?.value?.trim() || '',
                            gaId: document.getElementById('seo-ga')?.value?.trim() || '',
                          });
                          showToast({ message: 'GTM / GA ذخیره شد. برای اعمال کامل یک‌بار رفرش کنید.', variant: 'success', duration: 4500, position: 'top-center' });
                        }} className="px-4 py-2 rounded-full bg-apple-blue text-white text-xs font-medium">ذخیره GTM و Analytics</button>
                      </div>
                    </div>
                  )}


                  {!adminLoading && adminTab === 'redirects' && (
                    <div className="space-y-5 max-w-3xl">
                      <div>
                        <h2 className="text-base font-bold text-primary-900 dark:text-white">ریدایرکت دستی</h2>
                        <p className="text-xs text-primary-500 mt-1">مسیر قدیمی را به مسیر جدید بفرستید · ۳۰۱ دائم · ۳۰۲ موقت · ۴۱۰ حذف‌شده · فقط ادمین</p>
                      </div>

                      <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-3">
                        <h3 className="text-sm font-bold text-primary-900 dark:text-white">افزودن ریدایرکت</h3>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-primary-500 mb-1 block">از مسیر (From)</label>
                            <input
                              value={seoRedirectForm.from}
                              onChange={e => setSeoRedirectForm(f => ({ ...f, from: e.target.value }))}
                              dir="ltr"
                              placeholder="/old-path یا /shop?cat=old"
                              className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left font-latin text-primary-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-primary-500 mb-1 block">به مسیر (To) · برای ۴۱۰ خالی بگذارید</label>
                            <input
                              value={seoRedirectForm.to}
                              onChange={e => setSeoRedirectForm(f => ({ ...f, to: e.target.value }))}
                              dir="ltr"
                              placeholder="/new-path یا https://..."
                              className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left font-latin text-primary-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-primary-500 mb-1 block">نوع</label>
                            <select
                              value={seoRedirectForm.type}
                              onChange={e => setSeoRedirectForm(f => ({ ...f, type: e.target.value }))}
                              className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white"
                            >
                              <option value="301">301 — دائم (پیشنهادی سئو)</option>
                              <option value="302">302 — موقت</option>
                              <option value="410">410 — حذف‌شده (Gone)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-primary-500 mb-1 block">یادداشت (اختیاری)</label>
                            <input
                              value={seoRedirectForm.note || ''}
                              onChange={e => setSeoRedirectForm(f => ({ ...f, note: e.target.value }))}
                              placeholder="مثلاً تغییر نامک دسته"
                              className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white"
                            />
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const from = (seoRedirectForm.from || '').trim();
                              let to = (seoRedirectForm.to || '').trim();
                              const type = seoRedirectForm.type || '301';
                              if (!from) {
                                showToast({ message: 'مسیر مبدأ لازم است', variant: 'error', duration: 4000, position: 'top-center' });
                                return;
                              }
                              if (!from.startsWith('/') && !from.startsWith('http')) {
                                showToast({ message: 'مبدأ باید با / یا http شروع شود', variant: 'error', duration: 4000, position: 'top-center' });
                                return;
                              }
                              if (type !== '410' && !to) {
                                showToast({ message: 'مسیر مقصد لازم است', variant: 'error', duration: 4000, position: 'top-center' });
                                return;
                              }
                              if (type === '410') to = '';
                              if ((seoRedirects || []).some(r => r.from === from && r.id !== seoRedirectForm.editId)) {
                                showToast({ message: 'برای این مبدأ از قبل ریدایرکت هست', variant: 'error', duration: 4000, position: 'top-center' });
                                return;
                              }
                              const row = {
                                id: seoRedirectForm.editId || ('redir-' + Date.now()),
                                from,
                                to,
                                type,
                                note: (seoRedirectForm.note || '').trim(),
                                createdAt: seoRedirectForm.editId
                                  ? ((seoRedirects || []).find(r => r.id === seoRedirectForm.editId)?.createdAt || new Date().toISOString())
                                  : new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                              };
                              if (seoRedirectForm.editId) {
                                saveSeoRedirects((seoRedirects || []).map(r => r.id === seoRedirectForm.editId ? row : r));
                                showToast({ message: 'ریدایرکت ویرایش شد', variant: 'success', duration: 3500, position: 'top-center' });
                              } else {
                                saveSeoRedirects([row, ...(seoRedirects || [])]);
                                showToast({ message: 'ریدایرکت اضافه شد', variant: 'success', duration: 3500, position: 'top-center' });
                              }
                              setSeoRedirectForm({ from: '', to: '', type: '301', note: '', editId: null });
                            }}
                            className="text-xs px-4 py-2.5 rounded-full bg-apple-blue text-white font-medium"
                          >
                            {seoRedirectForm.editId ? 'ذخیره ویرایش' : 'افزودن ریدایرکت'}
                          </button>
                          {seoRedirectForm.editId && (
                            <button
                              type="button"
                              onClick={() => setSeoRedirectForm({ from: '', to: '', type: '301', note: '', editId: null })}
                              className="text-xs px-4 py-2.5 rounded-full border border-primary-200 dark:border-white/25 text-primary-800 dark:text-white"
                            >
                              انصراف
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={exportRedirectsForServer}
                            className="text-xs px-4 py-2.5 rounded-full border border-primary-200 dark:border-white/25 text-primary-800 dark:text-white"
                          >
                            خروجی JSON سرور
                          </button>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-primary-900 dark:text-white">لیست ریدایرکت‌ها</h3>
                          <span className="text-xs text-primary-400">{toFa((seoRedirects || []).length)} مورد</span>
                        </div>
                        {(seoRedirects || []).length === 0 ? (
                          <p className="text-xs text-primary-400 py-4 text-center">هنوز ریدایرکتی ثبت نشده</p>
                        ) : (
                          <div className="overflow-x-auto max-h-80 overflow-y-auto rounded-xl border border-primary-100 dark:border-white/10">
                            <table className="w-full text-xs min-w-[520px]">
                              <thead className="sticky top-0 bg-primary-50 dark:bg-primary-800">
                                <tr className="text-right text-primary-700 dark:text-white">
                                  <th className="p-2 font-semibold">نوع</th>
                                  <th className="p-2 font-semibold">از</th>
                                  <th className="p-2 font-semibold">به</th>
                                  <th className="p-2 font-semibold">یادداشت</th>
                                  <th className="p-2 font-semibold">عملیات</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(seoRedirects || []).map(r => (
                                  <tr key={r.id} className="border-t border-primary-100 dark:border-white/10">
                                    <td className="p-2">
                                      <span className={`px-1.5 py-0.5 rounded font-latin ${r.type === '301' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' : r.type === '410' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'}`}>{r.type}</span>
                                    </td>
                                    <td className="p-2 font-latin text-left text-primary-900 dark:text-white" dir="ltr">{r.from}</td>
                                    <td className="p-2 font-latin text-left text-primary-800 dark:text-white/90" dir="ltr">{r.type === '410' ? 'Gone' : (r.to || '—')}</td>
                                    <td className="p-2 text-primary-500 max-w-[8rem] truncate">{r.note || '—'}</td>
                                    <td className="p-2 whitespace-nowrap">
                                      <button
                                        type="button"
                                        className="text-apple-blue dark:text-[#4CCD99] me-2"
                                        onClick={() => setSeoRedirectForm({ from: r.from || '', to: r.to || '', type: r.type || '301', note: r.note || '', editId: r.id })}
                                      >ویرایش</button>
                                      <button
                                        type="button"
                                        className="text-red-500"
                                        onClick={() => {
                                          saveSeoRedirects((seoRedirects || []).filter(x => x.id !== r.id));
                                          if (seoRedirectForm.editId === r.id) setSeoRedirectForm({ from: '', to: '', type: '301', note: '', editId: null });
                                          showToast({ message: 'حذف شد', variant: 'success', duration: 2500, position: 'top-center' });
                                        }}
                                      >حذف</button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        <p className="text-[10px] text-primary-400 leading-relaxed">ریدایرکت‌های سئو در صورت اتصال API از سرور خوانده می‌شوند؛ در غیر این صورت از ذخیره‌سازی مرورگر به‌عنوان پشتیبان استفاده می‌شود.</p>
                      </div>
                    </div>
                  )}

                  {!adminLoading && adminTab === 'search-console' && (() => {
                    const agg = gscAggregate(adminGscRange, adminGscDim);
                    const sub = adminGscSub;
                    const fmt = (n) => toFa(Math.round(Number(n) || 0).toLocaleString('en-US'));
                    const pct = (n) => toFa(((Number(n) || 0) * 100).toFixed(1)) + '٪';
                    const pos = (n) => toFa((Number(n) || 0).toFixed(1));
                    const subs = [
                      { id: 'performance', label: 'عملکرد' },
                      { id: 'url', label: 'بازرسی URL' },
                      { id: 'indexing', label: 'ایندکس / پوشش' },
                      { id: 'sitemaps', label: 'سایت‌مپ' },
                      { id: 'experience', label: 'تجربه صفحه' },
                      { id: 'links', label: 'لینک‌ها' },
                      { id: 'removals', label: 'حذف‌ها' },
                      { id: 'security', label: 'امنیت و اقدامات دستی' },
                      { id: 'settings', label: 'تنظیمات' },
                    ];
                    const dims = [
                      { id: 'queries', label: 'Queries' },
                      { id: 'pages', label: 'Pages' },
                      { id: 'countries', label: 'Countries' },
                      { id: 'devices', label: 'Devices' },
                      { id: 'dates', label: 'Dates' },
                    ];
                    const Kpi = ({ label, value }) => (
                      <div className="p-3 rounded-xl border border-primary-100 dark:border-white/10 bg-primary-50/50 dark:bg-primary-800/40">
                        <p className="text-[10px] text-primary-500 mb-1">{label}</p>
                        <p className="text-lg font-bold text-primary-900 dark:text-white tabular-nums" dir="ltr">{value}</p>
                      </div>
                    );
                    const cov = gscStore?.coverage || [];
                    const covValid = cov.filter(c => c.type === 'valid').reduce((s, c) => s + c.count, 0);
                    const covErr = cov.filter(c => c.type === 'error').reduce((s, c) => s + c.count, 0);
                    const covEx = cov.filter(c => c.type === 'excluded').reduce((s, c) => s + c.count, 0);
                    return (
                    <div className="space-y-4 max-w-5xl">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h2 className="text-base font-bold text-primary-900 dark:text-white">سرچ کنسول (Search Console)</h2>
                          <p className="text-xs text-primary-500 mt-1 font-latin" dir="ltr">{gscStore?.property || 'https://pirahanemardane.ir/'}</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {['7d', '28d', '3m', '6m', '16m'].map(r => (
                            <button key={r} type="button" onClick={() => setAdminGscRange(r)} className={`text-xs px-2.5 py-1.5 rounded-full border ${adminGscRange === r ? 'bg-apple-blue text-white border-apple-blue' : 'border-primary-200 dark:border-white/20 text-primary-800 dark:text-white'}`}>{r}</button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-1 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: 'touch' }}>
                        {subs.map(s => (
                          <button key={s.id} type="button" onClick={() => setAdminGscSub(s.id)} className={`flex-shrink-0 text-xs px-3 py-2 rounded-full border ${sub === s.id ? 'bg-primary-900 text-white dark:bg-white dark:text-primary-900 border-transparent' : 'border-primary-200 dark:border-white/20 text-primary-700 dark:text-white/80'}`}>{s.label}</button>
                        ))}
                      </div>

                      {sub === 'performance' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <Kpi label="Total clicks" value={fmt(agg.totals.clicks)} />
                            <Kpi label="Total impressions" value={fmt(agg.totals.impressions)} />
                            <Kpi label="Average CTR" value={pct(agg.totals.ctr)} />
                            <Kpi label="Average position" value={pos(agg.totals.position)} />
                          </div>
                          <div className="flex gap-1 overflow-x-auto">
                            {dims.map(d => (
                              <button key={d.id} type="button" onClick={() => setAdminGscDim(d.id)} className={`flex-shrink-0 text-xs px-2.5 py-1.5 rounded-full border ${adminGscDim === d.id ? 'bg-emerald-600 text-white border-emerald-600' : 'border-primary-200 dark:border-white/20'}`}>{d.label}</button>
                            ))}
                          </div>
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 overflow-x-auto">
                            <table className="w-full text-xs min-w-[520px]">
                              <thead>
                                <tr className="text-primary-500 text-right">
                                  <th className="p-2">{adminGscDim === 'queries' ? 'Query' : adminGscDim === 'pages' ? 'Page' : adminGscDim === 'countries' ? 'Country' : adminGscDim === 'devices' ? 'Device' : 'Date'}</th>
                                  <th className="p-2">Clicks</th>
                                  <th className="p-2">Impressions</th>
                                  <th className="p-2">CTR</th>
                                  <th className="p-2">Position</th>
                                </tr>
                              </thead>
                              <tbody>
                                {agg.rows.slice(0, 40).map(r => (
                                  <tr key={r.key} className="border-t border-primary-50 dark:border-white/5">
                                    <td className="p-2 font-latin text-left text-primary-900 dark:text-white" dir="ltr">{r.key}</td>
                                    <td className="p-2" dir="ltr">{fmt(r.clicks)}</td>
                                    <td className="p-2" dir="ltr">{fmt(r.impressions)}</td>
                                    <td className="p-2" dir="ltr">{pct(r.ctr)}</td>
                                    <td className="p-2" dir="ltr">{pos(r.position)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {sub === 'url' && (
                        <div className="space-y-4">
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-3">
                            <h3 className="text-sm font-bold text-primary-900 dark:text-white">URL Inspection</h3>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input value={adminGscInspectUrl} onChange={e => setAdminGscInspectUrl(e.target.value)} dir="ltr" placeholder="https://pirahanemardane.ir/shop یا /shop" className="flex-1 px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left font-latin text-primary-900 dark:text-white" />
                              <button type="button" onClick={() => gscInspect(adminGscInspectUrl)} className="px-4 py-2.5 rounded-full bg-apple-blue text-white text-xs font-medium">بازرسی</button>
                            </div>
                            {adminGscInspectResult && (
                              <div className="space-y-2 text-xs border-t border-primary-100 dark:border-white/10 pt-3">
                                {[
                                  ['Coverage', adminGscInspectResult.coverage],
                                  ['Indexing', adminGscInspectResult.indexing],
                                  ['Crawled as', adminGscInspectResult.crawledAs],
                                  ['Last crawl', adminGscInspectResult.lastCrawl],
                                  ['robots.txt', adminGscInspectResult.robots],
                                  ['Indexing allowed', adminGscInspectResult.indexingAllowed],
                                  ['Page fetch', adminGscInspectResult.pageFetch],
                                  ['User canonical', adminGscInspectResult.canonicalUser],
                                  ['Google canonical', adminGscInspectResult.canonicalGoogle],
                                  ['Mobile friendly', adminGscInspectResult.mobileFriendly],
                                  ['Rich results', (adminGscInspectResult.richResults || []).join(', ')],
                                ].map(([k, v]) => (
                                  <div key={k} className="flex justify-between gap-2 py-1 border-b border-primary-50 dark:border-white/5">
                                    <span className="text-primary-500">{k}</span>
                                    <span className="text-primary-900 dark:text-white font-latin text-left" dir="ltr">{String(v)}</span>
                                  </div>
                                ))}
                                <button type="button" className="text-xs text-apple-blue mt-2" onClick={() => showToast({ message: 'درخواست ایندکس به صف اضافه شد (شبیه‌سازی)', variant: 'success', duration: 3500, position: 'top-center' })}>Request indexing</button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {sub === 'indexing' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-2">
                            <Kpi label="Valid" value={fmt(covValid)} />
                            <Kpi label="Error" value={fmt(covErr)} />
                            <Kpi label="Excluded" value={fmt(covEx)} />
                          </div>
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 overflow-x-auto">
                            <h3 className="text-sm font-bold mb-3 text-primary-900 dark:text-white">Page indexing</h3>
                            <table className="w-full text-xs min-w-[400px]">
                              <thead><tr className="text-primary-500 text-right"><th className="p-2">Reason</th><th className="p-2">Type</th><th className="p-2">Count</th></tr></thead>
                              <tbody>
                                {cov.map((c, i) => (
                                  <tr key={i} className="border-t border-primary-50 dark:border-white/5">
                                    <td className="p-2 text-primary-900 dark:text-white font-latin text-left" dir="ltr">{c.reason}</td>
                                    <td className="p-2"><span className={`px-1.5 py-0.5 rounded text-[10px] ${c.type === 'valid' ? 'bg-emerald-100 text-emerald-800' : c.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>{c.type}</span></td>
                                    <td className="p-2" dir="ltr">{fmt(c.count)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {sub === 'sitemaps' && (
                        <div className="space-y-4">
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-3">
                            <h3 className="text-sm font-bold text-primary-900 dark:text-white">Sitemaps</h3>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input id="gsc-sitemap-add" dir="ltr" placeholder="https://pirahanemardane.ir/sitemap.xml" className="flex-1 px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left font-latin" />
                              <button type="button" onClick={() => {
                                const el = document.getElementById('gsc-sitemap-add');
                                const path = (el?.value || '').trim();
                                if (!path) return;
                                const row = { path, type: 'urlset', submitted: true, lastRead: new Date().toISOString(), status: 'Success', discovered: 0 };
                                persistGsc({ ...gscStore, sitemaps: [row, ...(gscStore.sitemaps || [])] });
                                if (el) el.value = '';
                                showToast({ message: 'سایت‌مپ ثبت شد', variant: 'success', duration: 3000, position: 'top-center' });
                              }} className="px-4 py-2.5 rounded-full bg-apple-blue text-white text-xs font-medium">Submit</button>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs min-w-[520px]">
                                <thead><tr className="text-primary-500 text-right"><th className="p-2">Sitemap</th><th className="p-2">Status</th><th className="p-2">Discovered</th><th className="p-2">Last read</th><th className="p-2"></th></tr></thead>
                                <tbody>
                                  {(gscStore?.sitemaps || []).map((s, i) => (
                                    <tr key={i} className="border-t border-primary-50 dark:border-white/5">
                                      <td className="p-2 font-latin text-left text-primary-900 dark:text-white" dir="ltr">{s.path}</td>
                                      <td className="p-2 text-emerald-600">{sellerStatusLabel(s.status)}</td>
                                      <td className="p-2" dir="ltr">{fmt(s.discovered)}</td>
                                      <td className="p-2 font-latin text-left" dir="ltr">{(s.lastRead || '').slice(0, 16)}</td>
                                      <td className="p-2"><button type="button" className="text-red-500" onClick={() => persistGsc({ ...gscStore, sitemaps: (gscStore.sitemaps || []).filter((_, j) => j !== i) })}>حذف</button></td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button type="button" onClick={() => downloadSeoFile('sitemap.xml', buildSitemapXml(), 'application/xml;charset=utf-8')} className="text-xs px-3 py-2 rounded-full border border-primary-200 dark:border-white/20">دانلود sitemap.xml</button>
                              <button type="button" onClick={() => downloadSeoFile('sitemap-index.xml', buildSitemapIndexXml(), 'application/xml;charset=utf-8')} className="text-xs px-3 py-2 rounded-full border border-primary-200 dark:border-white/20">دانلود index</button>
                            </div>
                          </div>
                        </div>
                      )}

                      {sub === 'experience' && (
                        <div className="space-y-4">
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-4">
                            <h3 className="text-sm font-bold text-primary-900 dark:text-white">Core Web Vitals</h3>
                            {['lcp', 'inp', 'cls'].map(metric => {
                              const m = gscStore?.experience?.[metric] || { good: 0, needs: 0, poor: 0 };
                              const total = Math.max(1, m.good + m.needs + m.poor);
                              return (
                                <div key={metric}>
                                  <p className="text-xs font-bold text-primary-800 dark:text-white mb-1 uppercase font-latin">{metric}</p>
                                  <div className="flex h-3 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500" style={{ width: `${(m.good / total) * 100}%` }} />
                                    <div className="bg-amber-400" style={{ width: `${(m.needs / total) * 100}%` }} />
                                    <div className="bg-red-500" style={{ width: `${(m.poor / total) * 100}%` }} />
                                  </div>
                                  <p className="text-[10px] text-primary-400 mt-1">Good {m.good}% · Needs improvement {m.needs}% · Poor {m.poor}%</p>
                                </div>
                              );
                            })}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Kpi label="Mobile usability — Valid" value={fmt(gscStore?.experience?.mobileUsability?.valid)} />
                            <Kpi label="Mobile usability — Errors" value={fmt(gscStore?.experience?.mobileUsability?.errors)} />
                          </div>
                        </div>
                      )}

                      {sub === 'links' && (
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                            <h3 className="text-sm font-bold mb-3 text-primary-900 dark:text-white">Internal links</h3>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {(gscStore?.linksInternal || []).map((l, i) => (
                                <div key={i} className="flex justify-between text-xs gap-2">
                                  <span className="font-latin truncate" dir="ltr">{l.url}</span>
                                  <span dir="ltr">{fmt(l.links)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                            <h3 className="text-sm font-bold mb-3 text-primary-900 dark:text-white">External linking sites</h3>
                            <div className="space-y-2">
                              {(gscStore?.linksExternal || []).map((l, i) => (
                                <div key={i} className="flex justify-between text-xs gap-2">
                                  <span className="font-latin truncate" dir="ltr">{l.domain}</span>
                                  <span dir="ltr">{fmt(l.links)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {sub === 'removals' && (
                        <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-3">
                          <h3 className="text-sm font-bold text-primary-900 dark:text-white">Removals</h3>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input id="gsc-removal-url" dir="ltr" placeholder="/path-to-remove" className="flex-1 px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left font-latin" />
                            <button type="button" onClick={() => {
                              const el = document.getElementById('gsc-removal-url');
                              const url = (el?.value || '').trim();
                              if (!url) return;
                              const row = { url, type: 'Temporary', status: 'Pending', requestedAt: new Date().toISOString() };
                              persistGsc({ ...gscStore, removals: [row, ...(gscStore.removals || [])] });
                              if (el) el.value = '';
                              showToast({ message: 'درخواست حذف ثبت شد', variant: 'success', duration: 3000, position: 'top-center' });
                            }} className="px-4 py-2.5 rounded-full bg-apple-blue text-white text-xs font-medium">New request</button>
                          </div>
                          <table className="w-full text-xs">
                            <thead><tr className="text-primary-500 text-right"><th className="p-2">URL</th><th className="p-2">Type</th><th className="p-2">Status</th></tr></thead>
                            <tbody>
                              {(gscStore?.removals || []).map((r, i) => (
                                <tr key={i} className="border-t border-primary-50 dark:border-white/5">
                                  <td className="p-2 font-latin text-left" dir="ltr">{r.url}</td>
                                  <td className="p-2">{r.type}</td>
                                  <td className="p-2">{r.status}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {sub === 'security' && (
                        <div className="space-y-3">
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                            <h3 className="text-sm font-bold text-primary-900 dark:text-white mb-2">Manual actions</h3>
                            {(gscStore?.security?.manualActions || []).length === 0 ? (
                              <p className="text-xs text-emerald-600">No manual actions detected</p>
                            ) : (
                              <ul className="text-xs space-y-1">{(gscStore.security.manualActions || []).map((m, i) => <li key={i}>{m}</li>)}</ul>
                            )}
                          </div>
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                            <h3 className="text-sm font-bold text-primary-900 dark:text-white mb-2">Security issues</h3>
                            {(gscStore?.security?.securityIssues || []).length === 0 ? (
                              <p className="text-xs text-emerald-600">No security issues detected</p>
                            ) : (
                              <ul className="text-xs space-y-1">{(gscStore.security.securityIssues || []).map((m, i) => <li key={i}>{m}</li>)}</ul>
                            )}
                          </div>
                        </div>
                      )}

                      {sub === 'settings' && (
                        <div className="space-y-4">
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-2">
                            <h3 className="text-sm font-bold text-primary-900 dark:text-white">Property</h3>
                            <input defaultValue={gscStore?.property || ''} id="gsc-property" dir="ltr" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left font-latin" />
                            <button type="button" onClick={() => {
                              const v = document.getElementById('gsc-property')?.value || '';
                              persistGsc({ ...gscStore, property: v });
                              showToast({ message: 'Property ذخیره شد', variant: 'success', duration: 2500, position: 'top-center' });
                            }} className="text-xs px-3 py-2 rounded-full bg-apple-blue text-white">ذخیره</button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button type="button" className="text-xs px-3 py-2 rounded-full border border-primary-200 dark:border-white/20" onClick={() => { const s = buildGscSeed(); persistGsc(s); showToast({ message: 'داده نمونه GSC بازنشانی شد', variant: 'success', duration: 3000, position: 'top-center' }); }}>بازنشانی داده نمونه</button>
                            <button type="button" className="text-xs px-3 py-2 rounded-full border border-primary-200 dark:border-white/20" onClick={() => {
                              const blob = new Blob([JSON.stringify(gscStore, null, 2)], { type: 'application/json' });
                              const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'gsc-local-export.json'; a.click();
                            }}>خروجی JSON</button>
                          </div>
                          <p className="text-[10px] text-primary-400 leading-relaxed">شبیه‌سازی کامل گزارش‌های Search Console روی داده محلی/نمونه. برای اتصال API واقعی از تب سئو (کد تأیید و OAuth) استفاده کنید.</p>
                        </div>
                      )}
                    </div>
                    );
                  })()}

                  {!adminLoading && adminTab === 'analytics' && (() => {
                    const agg = ga4Aggregate(adminAnalyticsRange);
                    const sub = adminAnalyticsSub;
                    const fmt = (n) => toFa(Math.round(Number(n) || 0).toLocaleString('en-US'));
                    const fmtMoney = (n) => toFa(Math.round(Number(n) || 0).toLocaleString('en-US')) + ' تومان';
                    const pct = (n) => toFa((Number(n) || 0).toFixed(1)) + '٪';
                    const subs = [
                      { id: 'overview', label: 'نمای کلی' },
                      { id: 'realtime', label: 'لحظه‌ای' },
                      { id: 'acquisition', label: 'جذب' },
                      { id: 'engagement', label: 'تعامل' },
                      { id: 'monetization', label: 'درآمد' },
                      { id: 'retention', label: 'بازدید مجدد' },
                      { id: 'demographics', label: 'جمعیت‌شناختی' },
                      { id: 'tech', label: 'فناوری' },
                      { id: 'explore', label: 'کاوش' },
                      { id: 'ads', label: 'تبلیغات' },
                      { id: 'config', label: 'پیکربندی' },
                    ];
                    const BarList = ({ rows, valueKey = 1, labelKey = 0 }) => (
                      <div className="space-y-2">
                        {(rows || []).map((row, i) => {
                          const label = Array.isArray(row) ? row[labelKey] : row.key || row.name || row.id;
                          const val = Array.isArray(row) ? row[valueKey] : row[valueKey] || row.users || row.events || 0;
                          const max = Math.max(1, ...(rows || []).map(r => Array.isArray(r) ? r[valueKey] : (r[valueKey] || r.users || r.events || 0)));
                          return (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              <span className="w-28 sm:w-40 truncate text-primary-800 dark:text-white/90" title={String(label)}>{label}</span>
                              <div className="flex-1 h-2 rounded-full bg-primary-100 dark:bg-white/10 overflow-hidden">
                                <div className="h-full rounded-full bg-apple-blue" style={{ width: `${Math.min(100, (val / max) * 100)}%` }} />
                              </div>
                              <span className="w-14 text-left tabular-nums text-primary-600 dark:text-white/70" dir="ltr">{fmt(val)}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                    const Kpi = ({ label, value, sub }) => (
                      <div className="p-3 rounded-xl border border-primary-100 dark:border-white/10 bg-primary-50/50 dark:bg-primary-800/40">
                        <p className="text-[10px] text-primary-500 mb-1">{label}</p>
                        <p className="text-lg font-bold text-primary-900 dark:text-white tabular-nums" dir="ltr">{value}</p>
                        {sub ? <p className="text-[10px] text-primary-400 mt-0.5">{sub}</p> : null}
                      </div>
                    );
                    const liveWindow = Date.now() - 30 * 60 * 1000;
                    const liveEvents = (ga4Store?.events || []).filter(e => (e.ts || 0) >= liveWindow);
                    const liveUsers = new Set(liveEvents.map(e => e.user_id)).size;
                    return (
                    <div className="space-y-4 max-w-5xl">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h2 className="text-base font-bold text-primary-900 dark:text-white">آنالیتیکس (GA4-like)</h2>
                          <p className="text-xs text-primary-500 mt-1">رویدادمحور · جذب · تعامل · درآمد · جمعیت · فناوری · کاوش · پیکربندی</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {['24h', '7d', '28d', '90d'].map(r => (
                            <button key={r} type="button" onClick={() => setAdminAnalyticsRange(r)} className={`text-xs px-2.5 py-1.5 rounded-full border ${adminAnalyticsRange === r ? 'bg-apple-blue text-white border-apple-blue' : 'border-primary-200 dark:border-white/20 text-primary-800 dark:text-white'}`}>{r}</button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-1 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: 'touch' }}>
                        {subs.map(s => (
                          <button key={s.id} type="button" onClick={() => setAdminAnalyticsSub(s.id)} className={`flex-shrink-0 text-xs px-3 py-2 rounded-full border ${sub === s.id ? 'bg-primary-900 text-white dark:bg-white dark:text-primary-900 border-transparent' : 'border-primary-200 dark:border-white/20 text-primary-700 dark:text-white/80'}`}>{s.label}</button>
                        ))}
                      </div>

                      {sub === 'overview' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <Kpi label="کاربران فعال" value={fmt(agg.activeUsers)} />
                            <Kpi label="نشست‌ها" value={fmt(agg.sessions)} />
                            <Kpi label="بازدید صفحه" value={fmt(agg.pageViews)} />
                            <Kpi label="نرخ تبدیل" value={pct(agg.conversionRate)} />
                            <Kpi label="خریدها" value={fmt(agg.purchases)} />
                            <Kpi label="درآمد" value={fmtMoney(agg.revenue)} />
                            <Kpi label="افزودن به سبد" value={fmt(agg.addToCarts)} />
                            <Kpi label="میانگین صفحه/نشست" value={toFa((agg.avgViewsPerSession || 0).toFixed(2))} />
                          </div>
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                              <h3 className="text-sm font-bold text-primary-900 dark:text-white mb-3">کانال‌های جذب</h3>
                              <BarList rows={agg.sourceRows.slice(0, 8).map(r => [r.key, r.users])} />
                            </div>
                            <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                              <h3 className="text-sm font-bold text-primary-900 dark:text-white mb-3">صفحات برتر</h3>
                              <BarList rows={agg.topPages.slice(0, 8)} />
                            </div>
                          </div>
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                            <h3 className="text-sm font-bold text-primary-900 dark:text-white mb-3">فعالیت ساعتی</h3>
                            <div className="flex items-end gap-0.5 h-24">
                              {agg.byHour.map((v, h) => {
                                const max = Math.max(1, ...agg.byHour);
                                return <div key={h} title={`${h}:00 — ${v}`} className="flex-1 bg-apple-blue/80 rounded-t" style={{ height: `${(v / max) * 100}%`, minHeight: v ? 2 : 0 }} />;
                              })}
                            </div>
                            <div className="flex justify-between text-[9px] text-primary-400 mt-1" dir="ltr"><span>0</span><span>6</span><span>12</span><span>18</span><span>23</span></div>
                          </div>
                        </div>
                      )}

                      {sub === 'realtime' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <Kpi label="کاربران ۳۰ دقیقه اخیر" value={fmt(liveUsers)} />
                            <Kpi label="رویدادهای زنده" value={fmt(liveEvents.length)} />
                            <Kpi label="page_view زنده" value={fmt(liveEvents.filter(e => e.name === 'page_view').length)} />
                            <Kpi label="خرید زنده" value={fmt(liveEvents.filter(e => e.name === 'purchase').length)} />
                          </div>
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                            <h3 className="text-sm font-bold mb-2 text-primary-900 dark:text-white">رویدادهای اخیر</h3>
                            <div className="max-h-72 overflow-y-auto space-y-1">
                              {liveEvents.slice(0, 50).map((e, i) => (
                                <div key={i} className="flex gap-2 text-[11px] border-b border-primary-50 dark:border-white/5 py-1.5">
                                  <span className="text-primary-400 w-14 flex-shrink-0" dir="ltr">{new Date(e.ts).toLocaleTimeString('fa-IR')}</span>
                                  <span className="font-medium text-apple-blue dark:text-[#4CCD99] w-28 flex-shrink-0">{e.name}</span>
                                  <span className="truncate text-primary-600 dark:text-white/70" dir="ltr">{e.page_path}</span>
                                  <span className="text-primary-400 flex-shrink-0">{e.device}</span>
                                </div>
                              ))}
                              {!liveEvents.length && <p className="text-xs text-primary-400">در ۳۰ دقیقه اخیر رویدادی نیست — در سایت جابه‌جا شوید.</p>}
                            </div>
                          </div>
                        </div>
                      )}

                      {sub === 'acquisition' && (
                        <div className="space-y-4">
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 overflow-x-auto">
                            <h3 className="text-sm font-bold text-primary-900 dark:text-white mb-3">Traffic acquisition</h3>
                            <table className="w-full text-xs min-w-[560px]">
                              <thead><tr className="text-primary-500 text-right"><th className="p-2">Session source / medium</th><th className="p-2">Users</th><th className="p-2">Sessions</th><th className="p-2">Events</th><th className="p-2">Revenue</th></tr></thead>
                              <tbody>
                                {agg.sourceRows.map(r => (
                                  <tr key={r.key} className="border-t border-primary-50 dark:border-white/5">
                                    <td className="p-2 font-latin text-left" dir="ltr">{r.key}</td>
                                    <td className="p-2" dir="ltr">{fmt(r.users)}</td>
                                    <td className="p-2" dir="ltr">{fmt(r.sessions)}</td>
                                    <td className="p-2" dir="ltr">{fmt(r.events)}</td>
                                    <td className="p-2" dir="ltr">{fmtMoney(r.revenue)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                              <h3 className="text-sm font-bold mb-3 text-primary-900 dark:text-white">Campaigns</h3>
                              <BarList rows={agg.topCampaigns} />
                            </div>
                            <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                              <h3 className="text-sm font-bold mb-3 text-primary-900 dark:text-white">Landing pages</h3>
                              <BarList rows={agg.topLandings} />
                            </div>
                          </div>
                        </div>
                      )}

                      {sub === 'engagement' && (
                        <div className="space-y-4">
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                              <h3 className="text-sm font-bold mb-3 text-primary-900 dark:text-white">Events</h3>
                              <BarList rows={agg.topEvents} />
                            </div>
                            <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                              <h3 className="text-sm font-bold mb-3 text-primary-900 dark:text-white">Pages and screens</h3>
                              <BarList rows={agg.topPages} />
                            </div>
                          </div>
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                            <h3 className="text-sm font-bold mb-3 text-primary-900 dark:text-white">Site search</h3>
                            <BarList rows={agg.searchTerms} />
                          </div>
                        </div>
                      )}

                      {sub === 'monetization' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <Kpi label="Total revenue" value={fmtMoney(agg.revenue)} />
                            <Kpi label="Purchases" value={fmt(agg.purchases)} />
                            <Kpi label="Add to cart" value={fmt(agg.addToCarts)} />
                            <Kpi label="Checkouts" value={fmt(agg.checkouts)} />
                          </div>
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                            <h3 className="text-sm font-bold mb-3 text-primary-900 dark:text-white">Ecommerce purchases funnel</h3>
                            <div className="flex flex-col sm:flex-row gap-2 items-stretch">
                              {[
                                ['view_item', agg.funnel.view_item],
                                ['add_to_cart', agg.funnel.add_to_cart],
                                ['begin_checkout', agg.funnel.begin_checkout],
                                ['purchase', agg.funnel.purchase],
                              ].map(([name, val], idx, arr) => (
                                <div key={name} className="flex-1 p-3 rounded-xl bg-primary-50 dark:bg-primary-800/50 text-center">
                                  <p className="text-[10px] text-primary-500 font-latin">{name}</p>
                                  <p className="text-base font-bold text-primary-900 dark:text-white" dir="ltr">{fmt(val)}</p>
                                  {idx > 0 && arr[idx-1][1] ? <p className="text-[10px] text-primary-400">{pct((val / arr[idx-1][1]) * 100)} از مرحله قبل</p> : null}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 overflow-x-auto">
                            <h3 className="text-sm font-bold mb-3 text-primary-900 dark:text-white">Item performance</h3>
                            <table className="w-full text-xs min-w-[400px]">
                              <thead><tr className="text-primary-500 text-right"><th className="p-2">Item</th><th className="p-2">Qty</th><th className="p-2">Revenue</th></tr></thead>
                              <tbody>
                                {agg.topItems.map(it => (
                                  <tr key={it.id} className="border-t border-primary-50 dark:border-white/5">
                                    <td className="p-2 text-primary-900 dark:text-white">{it.name || it.id}</td>
                                    <td className="p-2" dir="ltr">{fmt(it.qty)}</td>
                                    <td className="p-2" dir="ltr">{fmtMoney(it.revenue)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {sub === 'retention' && (
                        <div className="space-y-4">
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                            <h3 className="text-sm font-bold mb-2 text-primary-900 dark:text-white">Retention overview</h3>
                            <p className="text-xs text-primary-500 mb-3">کاربران تکراری بر اساس user_id در بازه انتخابی</p>
                            {(() => {
                              const counts = {};
                              agg.list.forEach(e => { if (e.user_id) counts[e.user_id] = (counts[e.user_id] || 0) + 1; });
                              const multi = Object.values(counts).filter(c => c > 5).length;
                              const single = Object.values(counts).filter(c => c <= 5).length;
                              return (
                                <div className="grid grid-cols-2 gap-2">
                                  <Kpi label="New / low-activity users" value={fmt(single)} />
                                  <Kpi label="Returning / engaged users" value={fmt(multi)} />
                                </div>
                              );
                            })()}
                          </div>
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                            <h3 className="text-sm font-bold mb-3 text-primary-900 dark:text-white">Activity by day</h3>
                            <BarList rows={Object.entries(agg.byDay).sort((a,b) => a[0] < b[0] ? 1 : -1).slice(0, 14)} />
                          </div>
                        </div>
                      )}

                      {sub === 'demographics' && (
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                            <h3 className="text-sm font-bold mb-3 text-primary-900 dark:text-white">Cities</h3>
                            <BarList rows={agg.topCities} />
                          </div>
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                            <h3 className="text-sm font-bold mb-3 text-primary-900 dark:text-white">Countries</h3>
                            <BarList rows={agg.topCountries} />
                          </div>
                        </div>
                      )}

                      {sub === 'tech' && (
                        <div className="grid sm:grid-cols-3 gap-3">
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                            <h3 className="text-sm font-bold mb-3 text-primary-900 dark:text-white">Device category</h3>
                            <BarList rows={agg.topDevices} />
                          </div>
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                            <h3 className="text-sm font-bold mb-3 text-primary-900 dark:text-white">Browser</h3>
                            <BarList rows={agg.topBrowsers} />
                          </div>
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                            <h3 className="text-sm font-bold mb-3 text-primary-900 dark:text-white">Operating system</h3>
                            <BarList rows={agg.topOs} />
                          </div>
                        </div>
                      )}

                      {sub === 'explore' && (
                        <div className="space-y-4">
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                            <h3 className="text-sm font-bold mb-3 text-primary-900 dark:text-white">Funnel exploration — Purchase</h3>
                            <div className="space-y-2">
                              {[
                                ['view_item', agg.funnel.view_item],
                                ['add_to_cart', agg.funnel.add_to_cart],
                                ['begin_checkout', agg.funnel.begin_checkout],
                                ['purchase', agg.funnel.purchase],
                              ].map(([name, val]) => {
                                const max = Math.max(1, agg.funnel.view_item);
                                return (
                                  <div key={name} className="flex items-center gap-2 text-xs">
                                    <span className="w-32 font-latin">{name}</span>
                                    <div className="flex-1 h-3 rounded-full bg-primary-100 dark:bg-white/10 overflow-hidden">
                                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(val / max) * 100}%` }} />
                                    </div>
                                    <span dir="ltr">{fmt(val)}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                            <h3 className="text-sm font-bold mb-3 text-primary-900 dark:text-white">Path — top pages sequence (approx)</h3>
                            <BarList rows={agg.topPages.slice(0, 12)} />
                          </div>
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                            <h3 className="text-sm font-bold mb-3 text-primary-900 dark:text-white">Free-form — event counts</h3>
                            <BarList rows={agg.topEvents} />
                          </div>
                        </div>
                      )}

                      {sub === 'ads' && (
                        <div className="space-y-4">
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                            <h3 className="text-sm font-bold mb-2 text-primary-900 dark:text-white">Advertising snapshot</h3>
                            <p className="text-xs text-primary-500 mb-3">کمپین‌های CPC و social از دادهٔ رویدادها</p>
                            <BarList rows={agg.sourceRows.filter(r => /cpc|social|affiliate|email/i.test(r.key)).map(r => [r.key, r.users])} />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Kpi label="Paid & campaign users" value={fmt(agg.sourceRows.filter(r => /cpc|social|email|affiliate/i.test(r.key)).reduce((s, r) => s + r.users, 0))} />
                            <Kpi label="Campaign revenue" value={fmtMoney(agg.sourceRows.filter(r => /cpc|social|email|affiliate/i.test(r.key)).reduce((s, r) => s + r.revenue, 0))} />
                          </div>
                        </div>
                      )}

                      {sub === 'config' && (
                        <div className="space-y-4">
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-2">
                            <h3 className="text-sm font-bold text-primary-900 dark:text-white">Data stream</h3>
                            <p className="text-xs text-primary-600 dark:text-white/80 font-latin" dir="ltr">{ga4Store?.stream?.measurement_id || 'G-LOCALDEMO'} — {ga4Store?.stream?.name || 'Web'}</p>
                            <p className="text-xs text-primary-400">{ga4Store?.stream?.default_uri}</p>
                          </div>
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                            <h3 className="text-sm font-bold mb-2 text-primary-900 dark:text-white">Conversions</h3>
                            <div className="flex flex-wrap gap-1.5">
                              {(ga4Store?.conversions || []).map(c => (
                                <span key={c} className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 font-latin">{c}</span>
                              ))}
                            </div>
                          </div>
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                            <h3 className="text-sm font-bold mb-2 text-primary-900 dark:text-white">Custom dimensions</h3>
                            <ul className="text-xs space-y-1 text-primary-700 dark:text-white/80">
                              {(ga4Store?.customDimensions || []).map(d => (
                                <li key={d.name} className="font-latin" dir="ltr">{d.name} <span className="text-primary-400">({d.scope})</span></li>
                              ))}
                            </ul>
                          </div>
                          <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                            <h3 className="text-sm font-bold mb-2 text-primary-900 dark:text-white">Audiences</h3>
                            <ul className="text-xs space-y-2">
                              {(ga4Store?.audiences || []).map(a => (
                                <li key={a.id} className="flex justify-between gap-2 border-b border-primary-50 dark:border-white/5 pb-1">
                                  <span className="font-medium text-primary-900 dark:text-white">{a.name}</span>
                                  <span className="text-primary-400 font-latin" dir="ltr">{a.rule}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button type="button" className="text-xs px-3 py-2 rounded-full border border-primary-200 dark:border-white/20" onClick={() => {
                              const seed = buildGa4Seed();
                              persistGa4(seed);
                              showToast({ message: 'داده نمونه GA4 بازنشانی شد', variant: 'success', duration: 3500, position: 'top-center' });
                            }}>بازنشانی داده نمونه</button>
                            <button type="button" className="text-xs px-3 py-2 rounded-full border border-primary-200 dark:border-white/20" onClick={() => {
                              const blob = new Blob([JSON.stringify(ga4Store, null, 2)], { type: 'application/json' });
                              const a = document.createElement('a');
                              a.href = URL.createObjectURL(blob);
                              a.download = 'ga4-local-export.json';
                              a.click();
                            }}>خروجی JSON</button>
                            <button type="button" className="text-xs px-3 py-2 rounded-full border border-red-200 text-red-600" onClick={() => {
                              persistGa4({ ...ga4Store, events: [] });
                              showToast({ message: 'رویدادها پاک شد', variant: 'success', duration: 3000, position: 'top-center' });
                            }}>پاک‌کردن رویدادها</button>
                          </div>
                          <p className="text-[10px] text-primary-400 leading-relaxed">این ماژول رویدادمحور محلی شبیه GA4 است و با gtag/dataLayer هم هم‌تراز می‌شود. برای Measurement ID واقعی از تنظیمات سئو / GTM استفاده کنید.</p>
                        </div>
                      )}
                    </div>
                    );
                  })()}

                  {!adminLoading && adminTab === 'backup' && (
                    <div className="space-y-4 p-4 sm:p-5 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                      <h2 className="text-base font-bold text-primary-900 dark:text-white">بک‌آپ و بازیابی کامل سایت</h2>
                      <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-2 mb-4">
                        <p className="text-sm font-bold text-primary-900 dark:text-white">بکاپ سرور (JSON)</p>
                        <p className="text-xs text-primary-500">خروجی جداول اصلی از Supabase — فقط ادمین.</p>
                        <button
                          type="button"
                          className="btn-cta text-xs px-3 py-1.5 rounded-full bg-apple-blue text-white font-bold"
                          onClick={async () => {
                            try {
                              const res = await fetch('/api/admin/backup', { credentials: 'include' });
                              const json = await res.json().catch(() => ({}));
                              if (!json?.ok) {
                                try { showToast({ message: json?.error || 'بکاپ ناموفق', variant: 'error', duration: 4000, position: 'top-center' }); } catch(_){}
                                return;
                              }
                              const blob = new Blob([JSON.stringify(json.backup, null, 2)], { type: 'application/json' });
                              const a = document.createElement('a');
                              a.href = URL.createObjectURL(blob);
                              a.download = 'pm-backup-' + Date.now() + '.json';
                              a.click();
                              try { showToast({ message: 'بکاپ دانلود شد', variant: 'success', duration: 3000, position: 'top-center' }); } catch(_){}
                            } catch (e) {
                              try { showToast({ message: 'خطای شبکه', variant: 'error', duration: 3500, position: 'top-center' }); } catch(_){}
                            }
                          }}
                        >دانلود بکاپ سرور</button>
                        <label className="text-xs px-3 py-1.5 rounded-full border border-primary-200 dark:border-white/30 text-primary-800 dark:text-white font-medium flex items-center gap-1 cursor-pointer inline-flex">
                          <Icon name="upload" size={14} /> بازگردانی بکاپ سرور
                          <input
                            type="file"
                            accept="application/json,.json"
                            className="hidden"
                            onChange={async (e) => {
                              const f = e.target.files?.[0];
                              e.target.value = '';
                              if (!f) return;
                              try {
                                const text = await f.text();
                                const parsed = JSON.parse(text);
                                const backup = parsed?.backup || parsed;
                                if (!backup?.tables) {
                                  showToast({ message: 'فایل بک‌آپ سرور معتبر نیست', variant: 'error', duration: 4500, position: 'top-center' });
                                  return;
                                }
                                const ok = await siteConfirm(
                                  'بازگردانی کامل جداول سرور از این فایل؟',
                                  'بازگردانی سرور'
                                );
                                if (!ok) return;
                                const res = await fetch('/api/admin/backup', {
                                  method: 'POST',
                                  credentials: 'include',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ backup }),
                                });
                                const json = await res.json().catch(() => ({}));
                                if (!json?.ok) {
                                  showToast({ message: json?.error || 'بازگردانی ناموفق', variant: 'error', duration: 5000, position: 'top-center' });
                                  return;
                                }
                                showToast({ message: 'بازگردانی سرور انجام شد', variant: 'success', duration: 4000, position: 'top-center' });
                                try {
                                  window.dispatchEvent(new CustomEvent('admin-products-refetch'));
                                  window.dispatchEvent(new CustomEvent('admin-sellers-refetch'));
                                } catch (_) {}
                              } catch (_) {
                                showToast({ message: 'خطا در خواندن فایل', variant: 'error', duration: 4000, position: 'top-center' });
                              }
                            }}
                          />
                        </label>
                      </div>

                      <p className="text-xs text-primary-500 dark:!text-white">شامل محصولات، دسته‌ها، برندها، فروشندگان، خریداران، سفارش‌ها، تیکت‌ها، تنظیمات، بلاگ، کمپین و سایر داده‌های local. </p>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={downloadFullSiteBackup} className="btn-cta px-4 py-2 rounded-full bg-apple-blue text-white text-xs font-medium flex items-center gap-1"><Icon name="download" size={14} /> دانلود بک‌آپ کامل JSON</button>
                        <label className="px-4 py-2 rounded-full border border-primary-200 dark:border-white/30 text-xs font-medium flex items-center gap-1 cursor-pointer">
                          <Icon name="upload" size={14} /> بازگردانی از فایل
                          <input type="file" accept="application/json,.json" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) restoreFullSiteBackup(f); e.target.value=''; }} />
                        </label>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-primary-900 border border-primary-100 dark:border-white/10 space-y-2">
                        <p className="text-xs font-bold text-primary-800 dark:text-white">مسیر ذخیره / ارسال بک‌آپ</p>
                        <p className="text-xs text-primary-500">پیش‌زمینه اتصال به Google Drive — مسیر مقصد را مشخص کنید؛ </p>
                        <input value={backupDestPath} onChange={e => { setBackupDestPath(e.target.value); try { localStorage.setItem('backupDestPath', e.target.value); } catch(_){} }} dir="ltr" className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left font-latin text-primary-900 dark:text-white" placeholder="google-drive://folder-id/ یا مسیر دلخواه" />
                        <p className="text-xs text-primary-400"> {lastAutoBackupAt ? new Date(lastAutoBackupAt).toLocaleString('fa-IR') : 'هنوز گرفته نشده'}</p>
                      </div>
                    </div>
                  )}

                  {!adminLoading && adminTab === 'site-licenses' && (
                <PermissionsPanelContent
                  adminSettings={adminSettings}
                  setAdminSettings={setAdminSettings}
                  saveAdminSettings={saveAdminSettings}
                  showToast={showToast}
                />
              )}

                  {!adminLoading && adminTab === 'settings' && (
                    <div className="max-w-lg space-y-4">
                      <h2 className="text-base font-bold text-primary-900 dark:text-white">تنظیمات سایت</h2>
                      <div><label className="text-xs text-primary-500 block mb-1">نام فروشگاه</label>
                        <input defaultValue={adminSettings?.siteName||''} id="adm-site" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white" /></div>
                      <div><label className="text-xs text-primary-500 block mb-1">متن کوتاه فوتر</label>
                        <input defaultValue={adminSettings?.footerText||''} id="adm-footer" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white" /></div>
                      <div><label className="text-xs text-primary-500 block mb-1">نرخ مالیات نمایشی (٪)</label>
                        <input defaultValue={adminSettings?.taxRate||0} id="adm-tax" type="number" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white" /></div>
                      
                      <button type="button" onClick={()=>{
                        saveAdminSettings({
                          ...adminSettings,
                          siteName: document.getElementById('adm-site')?.value||adminSettings.siteName,
                          footerText: document.getElementById('adm-footer')?.value||adminSettings.footerText,
                          
                          taxRate: Number(document.getElementById('adm-tax')?.value)||0,
                          shopSeoText: document.getElementById('adm-shop-seo')?.value||'',
                          categoriesIndexSeoText: document.getElementById('adm-cats-seo')?.value||'',
                          tagsIndexSeoText: document.getElementById('adm-tags-seo')?.value||'',
                        });
                        showToast({ message: 'تنظیمات ذخیره شد', variant: 'success', duration: 4500, position: 'top-center' });
                      }} className="w-full py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium">ذخیره</button>
                    </div>
                  )}

                  {/* Admin profile */}
                  {!adminLoading && adminTab === 'profile' && (
                    <div className="max-w-md space-y-4">
                      <h2 className="text-base font-bold text-primary-900 dark:text-white">پروفایل ادمین</h2>
                      <div className="p-4 rounded-2xl bg-white dark:bg-primary-900 border border-primary-200 dark:border-white/15 space-y-2 text-sm">
                        <p><span className="text-primary-500">نام:</span> {adminUser.name}</p>
                        <p><span className="text-primary-500">نقش:</span> {adminUser.role}</p>
                        <p><span className="text-primary-500">موبایل:</span> <span dir="ltr">{adminUser.phone}</span></p>
                      </div>
                      
                      <div className="rounded-2xl border border-primary-100 dark:border-white/10 bg-white dark:bg-primary-900 p-4 space-y-3 mb-4">
                        <h3 className="text-sm font-bold text-primary-900 dark:text-white">امنیت و رمز عبور</h3>
                        <p className="text-xs text-primary-500 dark:text-white/60">ساخت یا تغییر رمز برای ورود بدون پیامک (مثل خریدار و فروشنده). فراموشی: ورود با OTP سپس رمز جدید.</p>
                        <input type="password" id="admin-new-pw" placeholder="رمز جدید (حداقل ۶ کاراکتر)" autoComplete="new-password" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white" />
                        <input type="password" id="admin-new-pw2" placeholder="تکرار رمز" autoComplete="new-password" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white" />
                        <button
                          type="button"
                          className="btn-cta w-full py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium"
                          onClick={async () => {
                            const a = String(document.getElementById('admin-new-pw')?.value || '');
                            const b = String(document.getElementById('admin-new-pw2')?.value || '');
                            if (a.length < 6) {
                              try { showToast({ message: 'رمز حداقل ۶ کاراکتر', variant: 'error', duration: 3000, position: 'top-center' }); } catch (_) {}
                              return;
                            }
                            if (a !== b) {
                              try { showToast({ message: 'تکرار رمز یکسان نیست', variant: 'error', duration: 3000, position: 'top-center' }); } catch (_) {}
                              return;
                            }
                            try {
                              const res = await fetch('/api/auth/password', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify({ password: a }),
                              });
                              const data = await res.json().catch(() => ({}));
                              if (!res.ok || !data?.ok) {
                                try { showToast({ message: data?.error || 'خطا در ذخیره رمز', variant: 'error', duration: 3500, position: 'top-center' }); } catch (_) {}
                                return;
                              }
                              try { document.getElementById('admin-new-pw').value = ''; document.getElementById('admin-new-pw2').value = ''; } catch (_) {}
                              try { showToast({ message: 'رمز با موفقیت ذخیره شد', variant: 'success', duration: 3000, position: 'top-center' }); } catch (_) {}
                            } catch (e) {
                              try { showToast({ message: 'خطا در ارتباط با سرور', variant: 'error', duration: 3000, position: 'top-center' }); } catch (_) {}
                            }
                          }}
                        >
                          ذخیره رمز
                        </button>
                      </div>
                      <button type="button" onClick={logoutAdmin} className="w-full py-2.5 rounded-full border border-red-200 text-red-600 text-sm">خروج از حساب ادمین</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
    </>
  );
}