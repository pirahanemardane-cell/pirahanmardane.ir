'use client';

import React, { useEffect, useState, useRef } from 'react';
import { jalaliTehranToIso, nowJalaaliTehran, jalaaliMonthLength, faMonthName } from '../../lib/jalali';

import { useAppApi } from '../AppApiContext';
import Icon from '../Icon';
import dynamic from 'next/dynamic';
import { Textarea } from '../ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { LoadingState, ErrorState, EmptyStateBox } from '../ui/async-state';
import EmptyState from '../EmptyState';
import { showToast } from '../ui/toast';

const SimpleEditor = dynamic(() => import('../SimpleEditor'), { ssr: false });

/** پنل SellerPanelContent — استخراج‌شده از App.jsx (رفتار یکسان، وابستگی از AppApi) */

function scrollSellerPanelToTop() {
  try {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const panel = document.querySelector('[data-panel="seller"]');
    if (panel) {
      try { panel.scrollIntoView({ block: 'start', behavior: 'auto' }); } catch (_) {}
      let el = panel.parentElement;
      while (el && el !== document.body) {
        try {
          const st = window.getComputedStyle(el);
          const oy = st.overflowY;
          if ((oy === 'auto' || oy === 'scroll' || oy === 'overlay') && el.scrollTop > 0) el.scrollTop = 0;
        } catch (_) {}
        el = el.parentElement;
      }
    }
  } catch (_) {}
}

export default function SellerPanelContent() {

  const downloadSellerOrdersCsv = async (status = "all") => {
    try {
      const q = status && status !== "all" ? ("?status=" + encodeURIComponent(status)) : "";
      const res = await fetch("/api/seller/export/orders" + q, { credentials: "include", cache: "no-store" });
      if (!res.ok) {
        let msg = "دانلود ناموفق";
        try { const j = await res.json(); if (j && j.error) msg = j.error; } catch (_) {}
        try { showToast && showToast({ message: msg, variant: "error", duration: 4000, position: "top-center" }); } catch (_) {}
        return;
      }
      const blob = await res.blob();
      const dispo = res.headers.get("Content-Disposition") || "";
      let filename = "seller-orders.csv";
      const m = /filename="?([^\";]+)"?/.exec(dispo);
      if (m) filename = m[1];
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      try { showToast && showToast({ message: "فایل CSV دانلود شد", variant: "success", duration: 3000, position: "top-center" }); } catch (_) {}
    } catch (e) {
      try { showToast && showToast({ message: String(e && e.message ? e.message : e), variant: "error", duration: 4000, position: "top-center" }); } catch (_) {}
    }
  };

  const [sellerScheduleOpen, setSellerScheduleOpen] = React.useState(false);
  const [sellerSchedule, setSellerSchedule] = React.useState(() => {
    const n = nowJalaaliTehran();
    return { jy: n.jy, jm: n.jm, jd: n.jd, hour: Math.min(23, n.hour + 1), minute: 0 };
  });

  const api = useAppApi();
  const _cats = api?.adminCategories;
  const activeCatalogCategories = (Array.isArray(_cats) ? _cats : []).filter(
    (c) => c && c.active !== false && (c.name || c.title)
  );
  const {
    BarList,
    CarouselArrows,
    EmptyState,
    EmptyStateBox,
    ErrorState,
    Icon,
    Kpi,
    LoadingState,
    OWN_SELLER,
    PRODUCT_IMG,
    SeoPixelBars,
    SimpleEditor,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Textarea,
    TipText,
    activeSellerId,
    activeTip,
    add,
    addBlogComment,
    addBrandMention,
    addToCart,
    addressDeleteConfirm,
    addressForm,
    addressFormOpen,
    addresses,
    adm,
    adminAnalyticsRange,
    adminAnalyticsSub,
    adminAuthError,
    adminAuthLoading,
    adminAuthOpen,
    adminAuthOtp,
    adminAuthOtpTimer,
    adminAuthPhone,
    adminAuthStep,
    adminBlogCategories,
    adminBlogTags,
    adminBuyerDetailId,
    adminBuyerSearch,
    adminBuyers,
    adminCatalogAttributes,
    adminCatalogBrands,
    adminCatalogColors,
    adminCatalogSizes,
    adminCategories,
    adminContentTab,
    adminCouponForm,
    adminCouponFormOpen,
    adminCoupons,
    adminFrontEditForm,
    adminFrontEditOpen,
    adminGscDim,
    adminGscInspectResult,
    adminGscInspectUrl,
    adminGscRange,
    adminGscSub,
    adminLoading,
    adminModerationQueue,
    adminOrderDetailId,
    adminOrderFilter,
    adminOrderNote,
    adminOrderSearch,
    adminOrders,
    adminPageContent,
    adminPageSeoStep,
    adminProductDetailId,
    adminProductFilter,
    adminProductSearch,
    adminProducts,
    adminRejectReason,
    adminSellerDetailId,
    adminSellerFilter,
    adminSellerSearch,
    adminSellers,
    adminSeoHubKey,
    adminSettings,
    adminShippingMethods,
    adminStatusBadge,
    adminStatusLabel,
    adminTab,
    adminTags,
    adminTicketDetailId,
    adminTicketFilter,
    adminTicketReply,
    adminTickets,
    adminUser,
    aiGenerateSeoMeta,
    aiOptimizeTextHints,
    aiSuggestFaq,
    allLists,
    analyzeOnPageSeo,
    apply,
    applyCoupon,
    applyFromUrl,
    applyRealtimePayload,
    applySellerDescFormat,
    approveAdminProduct,
    assertNoUserLinks,
    attrsKeyPart,
    attrsMatch,
    authError,
    authFailCount,
    authLastName,
    authLoading,
    authLockedUntil,
    authMode,
    authName,
    authOpen,
    authOtp,
    authOtpTimer,
    authPhone,
    authReturnTo,
    authStep,
    authTermsAccepted,
    backupAdminProducts,
    backupDestPath,
    backupSellerProducts,
    bar,
    blankShippingMethod,
    blogCommentName,
    blogCommentText,
    blogComments,
    blogForm,
    blogPostId,
    blogPosts,
    brandDetailId,
    brandQuery,
    brandsList,
    buildArticleSchema,
    buildBreadcrumbSchema,
    buildCheckoutOrderDraft,
    buildFaqSchema,
    buildGa4Seed,
    buildGscSeed,
    buildImageAlt,
    buildLlmsTxt,
    buildLocalBusinessSchema,
    buildNewsSitemapXml,
    buildProductSchema,
    buildRobotsTxt,
    buildSitemapIndexXml,
    buildSitemapXml,
    buildVariantMatrix,
    buildVideoSitemapXml,
    buyerGifts,
    buyerTicketBody,
    buyerTicketDetailId,
    buyerTicketError,
    buyerTicketFormOpen,
    buyerTicketSubject,
    buyerTickets,
    campaignForm,
    campaignNow,
    campaignsList,
    canonicalBase,
    cardQtys,
    carouselIndex,
    cart,
    cartItemKey,
    cartItemLoading,
    cartOpen,
    cartesianAttrCombos,
    catOpen,
    catalogForm,
    catalogProducts,
    changeCartColor,
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
    classifyToastVariant,
    clearAllSearchFilters,
    clearCart,
    clearCartConfirm,
    clearCompare,
    clearFavorites,
    clearPlpFilters,
    clearRecentSearches,
    clearSellerListFilters,
    close,
    closeAdminAuth,
    closeAdminPanel,
    closeAuth,
    closeCartPage,
    closeCheckout,
    closeComparePage,
    closeMobileMenuOnWide,
    closePDP,
    closePLP,
    closeProfilePage,
    closeRecentPage,
    closeSeller,
    closeSellerPanel,
    closeSellersList,
    closeSiteDialog,
    closeStaticPage,
    closeWishlistPage,
    collect,
    collectFullSiteBackup,
    compare,
    compareOnlyDiffs,
    compareOpen,
    compareReplaceOpen,
    compareToast,
    completeRegister,
    confirmPaymentFail,
    confirmPaymentSuccess,
    consumeSeoAiQuota,
    contactForm,
    contactFormError,
    contentEditorTarget,
    conversationChannelLabel,
    cookieConsent,
    copyShareLink,
    copyTextToClipboard,
    countFor,
    couponApplied,
    couponInput,
    couponMsg,
    dark,
    dealsMinDiscount,
    dealsSort,
    defaultAdminBlogCategories,
    defaultAdminCategories,
    defaultAdminTags,
    defaultOrganizationSchema,
    defaultSeoConfig,
    defaultShippingMethods,
    demoOtpCode,
    deriveCollar,
    deriveFabric,
    deriveSleeve,
    detectImportSource,
    didYouMean,
    discountMode,
    discountPercent,
    discountPickIds,
    discountPrices,
    downloadBlobFile,
    downloadFullSiteBackup,
    downloadSeoFile,
    editingAddressId,
    editingCouponId,
    editingSellerProductId,
    emptyTaxonomyForm,
    enqueueModeration,
    ensureAdminSeed,
    ensureProductCode,
    esc,
    existingSellerOrders,
    expandQuery,
    exportRedirectsForServer,
    faqCat,
    faqQuery,
    favToast,
    favorites,
    fileToImage,
    finalizePaidOrder,
    findOpenChatConversation,
    findProductVariant,
    findSlider,
    finishAuthSuccess,
    fire,
    fmt,
    fmtMoney,
    formatPrice,
    ga4Aggregate,
    ga4FilterEvents,
    ga4Store,
    generateGiftCode,
    generateProductCode,
    generateTicketCode,
    getAttrDimensions,
    getCheckoutShippingCost,
    getCheckoutTaxRate,
    getCheckoutTotals,
    getCurrentPageSeoContext,
    getFavEntry,
    getPageCms,
    getPageShareUrl,
    getProductPublicPath,
    getProductPublicUrl,
    getResolvedPageSeo,
    getSellerEnabledShippingIds,
    getSellerMaxDiscount,
    getSellerMinPrice,
    getSeoAiQuota,
    getShippingOptions,
    getShopSeoBody,
    getUsedPromoCodes,
    getVariantPrice,
    getVariantStock,
    giftCodeForm,
    gscAggregate,
    gscInspect,
    gscStore,
    has,
    hasMounted,
    headerRevealedAfterHero,
    htmlToPlain,
    imgZoom,
    importExternalProductsCsv,
    installBuyerPwa,
    isBlogLiked,
    isDealActive,
    isFavorite,
    isLive,
    isNumericField,
    isSlider,
    isVerticalScrollable,
    ix,
    lastAutoBackupAt,
    likedBlogs,
    list,
    liveToasts,
    loadForm,
    loadGa4Store,
    loadGscStore,
    logSeo404,
    logout,
    logoutAdmin,
    logoutAllDevices,
    logoutSeller,
    mapExternalRowToProduct,
    markAllNotifsRead,
    markNotifRead,
    markPromoCodeUsed,
    matchCatalogBrand,
    matchCatalogColor,
    matchCatalogSize,
    matchCategory,
    measureSeoPx,
    mediaToolAssign,
    mediaToolOffset,
    mediaToolProcessing,
    mediaToolResult,
    mediaToolScale,
    mediaToolSearch,
    mediaToolSrc,
    mediaToolStep,
    megaOpen,
    mirrorConversationToAdmin,
    mirrorSellerOrderToBuyer,
    mobileMenuOpen,
    move,
    nativeShare,
    newestTab,
    newsletterPhone,
    normKey,
    normalize,
    normalizeAttrMap,
    normalizeCategoryKey,
    normalizeSearch,
    notifPanelOpen,
    notifPulling,
    notifications,
    oldPriceOpen,
    onBeforeInput,
    onBip,
    onClickCapture,
    onDragStart,
    onFocusIn,
    onInput,
    onInstalled,
    onKey,
    onKeyDown,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onPointer,
    onPointerDown,
    onScroll,
    onStorage,
    onWheel,
    onlyDigits,
    openAdminAuth,
    openAdminFrontEdit,
    openAdminPanel,
    openAuth,
    openCartPage,
    openCategory,
    openCheckout,
    openComparePage,
    openNewShippingMethod,
    openPDP,
    openPLP,
    openProfilePage,
    openQuickAdd,
    openRecentPage,
    openSeller,
    openSellerAuth,
    openSellerPanel,
    openSellersList,
    openStaticPage,
    openTagPage,
    openTaxonomyHub,
    openTaxonomyWizard,
    openWishlistPage,
    orderDetailId,
    orderFailed,
    orderRateDraft,
    orderReturnOpen,
    orderStatusColor,
    orderSuccess,
    orders,
    ordersFilter,
    pageSeoMap,
    parseCsvText,
    parseResponseHours,
    pct,
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
    pendingPayOrder,
    persistBlogComments,
    persistCompare,
    persistFavorites,
    persistGa4,
    persistGsc,
    persistLikedBlogs,
    persistSession,
    pickField,
    pingIndexNow,
    placeOrder,
    plpCats,
    plpCities,
    plpCityInput,
    plpCityOpen,
    plpColors,
    plpDiscountOnly,
    plpFabrics,
    plpFastShipOnly,
    plpFilterOpen,
    plpFilterTab,
    plpInStockOnly,
    plpMinDiscount,
    plpPriceMax,
    plpPriceMin,
    plpQuery,
    plpSellers,
    plpSidebarOpen,
    plpSizes,
    plpSkeleton,
    plpSort,
    plpSortOpen,
    plpTagFilter,
    plpView,
    plpVisible,
    poll,
    portalMounted,
    pos,
    prev,
    printOrderInvoice,
    processToProductWebP,
    processProductImageFile,
    productBackupPayload,
    productImportReport,
    productSlugFromNameAndShop,
    products,
    productsToCsv,
    profileTab,
    publishRealtime,
    pullNotifications,
    pushImg,
    pushLiveToast,
    pushNotification,
    pushRecentSearch,
    pushSellerNotification,
    pwaInstallEvent,
    pwaInstalled,
    quickAdd,
    quickColorIdx,
    quickDescOpen,
    quickGalleryIdx,
    quickQty,
    quickSize,
    readFile,
    readSessionUser,
    recentOpen,
    recentSearches,
    recentlyViewed,
    releaseDrag,
    removeCoupon,
    removeFavoritesBulk,
    removeFromCart,
    removeRecentSearch,
    renderContentSeoBox,
    renderList,
    renderProductCard,
    renderShareBar,
    replaceCompareAt,
    restoreAdminProductsFromFile,
    restoreFullSiteBackup,
    restoreSellerProductsFromFile,
    row,
    run,
    runSeoHealthCheck,
    same,
    saveAddresses,
    saveAdminBlogCategories,
    saveAdminBlogTags,
    saveAdminBuyers,
    saveAdminCatalogAttributes,
    saveAdminCatalogBrands,
    saveAdminCatalogColors,
    saveAdminCatalogSizes,
    saveAdminCategories,
    saveAdminCoupons,
    saveAdminFrontEdit,
    saveAdminOrders,
    saveAdminPageContentMap,
    saveAdminProducts,
    saveAdminSellers,
    saveAdminSettings,
    saveAdminShippingMethods,
    saveAdminTags,
    saveAdminTickets,
    saveBlogPosts,
    saveBuyerGifts,
    saveBuyerOrders,
    saveBuyerTickets,
    saveCampaigns,
    saveModerationQueue,
    saveNotifications,
    savePageSeoMap,
    saveSellerGifts,
    saveSellerOrders,
    saveSellerProducts,
    createSellerProductOnServer, deleteSellerProductOnServer, updateSellerShopOnServer, createSellerShopOnServer,
    checkSellerSeoSpam,
    updateSellerProductOnServer,
    fetchSellerProductsFromServer,
    mapServerProductToSellerUi,
    saveSellerTickets,
    saveSellerUser,
    saveSeo404Log,
    saveSeoPatch,
    saveSeoRedirects,
    saveShippingMethodForm,
    saveSiteFaqs,
    saveTaxonomy,
    saveUser,
    scoreProduct,
    scrollCarousel,
    scrolled,
    searchActiveIdx,
    searchCategories,
    searchColors,
    searchOpen,
    searchPhIdx,
    searchQuery,
    searchSizes,
    searchSuggestOpen,
    seedAddresses,
    seedAdminData,
    seedNotifications,
    seedOrders,
    seedSellerOrders,
    seedSellerProducts,
    seedSellerTickets,
    selectColor,
    selectedColors,
    selectedSizes,
    sellerBannerIdx,
    sellerCanSell,
    sellerCancelForm,
    sellerCancelOrder,
    sellerCat,
    sellerCatMenuOpen,
    sellerCityInput,
    sellerCityOpen,
    sellerConfirmOrder,
    sellerDescDraft,
    sellerDescEditorOpen,
    sellerDescError,
    sellerDiscountOnly,
    sellerFaqOpen,
    sellerFilterSheetOpen,
    sellerFollowed,
    sellerGifts,
    sellerListCities,
    sellerListMaxResponse,
    sellerListMinProducts,
    sellerListMinRating,
    sellerListQuery,
    sellerListSort,
    sellerMarkPackingDone,
    sellerMediaToolOpen,
    sellerNewTicket,
    sellerNewTicketOpen,
    sellerOpenOrderTicket,
    sellerOrderDetailId,
    sellerOrderStatusColor,
    sellerOrders,
    sellerOrdersFilter,
    sellerPriceMap,
    sellerProductDeleteId,
    sellerProductFilter,
    sellerProductForm,
    sellerProductFormOpen,
    sellerProductSearch,
    sellerProductStep,
    sellerProducts,
    sellerPromoModal,
    sellerReportOpen,
    sellerReportSent,
    sellerSearchOpen,
    sellerShareToast,
    sellerShipOrder,
    sellerShopOpen,
    sellerSort,
    sellerSortMenuOpen,
    sellerStickyBar,
    sellerTab,
    sellerTaxonomyPicker,
    sellerTaxonomySearch,
    sellerTicketDetailId,
    sellerTicketReply,
    sellerTickets,
    sellerTrackForm,
    sellerUser, requestSellerPayout, hydrateSellerPayouts,
    sendAdminOtp,
    sendOtp,
    seo404Log,
    seoAiDaily,
    seoCfg,
    seoCharHint,
    seoOnChange,
    seoPixelReport,
    seoRedirectForm,
    seoRedirects,
    setActiveSellerId,
    setActiveTip,
    setAddressDeleteConfirm,
    setAddressForm,
    setAddressFormOpen,
    setAddresses,
    setAdminAnalyticsRange,
    setAdminAnalyticsSub,
    setAdminAuthError,
    setAdminAuthLoading,
    setAdminAuthOpen,
    setAdminAuthOtp,
    setAdminAuthOtpTimer,
    setAdminAuthPhone,
    setAdminAuthStep,
    setAdminBlogCategories,
    setAdminBlogTags,
    setAdminBuyerDetailId,
    setAdminBuyerSearch,
    setAdminBuyers,
    setAdminCatalogAttributes,
    setAdminCatalogBrands,
    setAdminCatalogColors,
    setAdminCatalogSizes,
    setAdminCategories,
    setAdminContentTab,
    setAdminCouponForm,
    setAdminCouponFormOpen,
    setAdminCoupons,
    setAdminFrontEditForm,
    setAdminFrontEditOpen,
    setAdminGscDim,
    setAdminGscInspectResult,
    setAdminGscInspectUrl,
    setAdminGscRange,
    setAdminGscSub,
    setAdminLoading,
    setAdminModerationQueue,
    setAdminOrderDetailId,
    setAdminOrderFilter,
    setAdminOrderNote,
    setAdminOrderSearch,
    setAdminOrders,
    setAdminPageContent,
    setAdminPageSeoStep,
    setAdminProductDetailId,
    setAdminProductFilter,
    setAdminProductSearch,
    setAdminProducts,
    setAdminRejectReason,
    setAdminSellerDetailId,
    setAdminSellerFilter,
    setAdminSellerSearch,
    setAdminSellers,
    setAdminSeoHubKey,
    setAdminSettings,
    setAdminShippingMethods,
    setAdminTab,
    setAdminTags,
    setAdminTicketDetailId,
    setAdminTicketFilter,
    setAdminTicketReply,
    setAdminTickets,
    setAdminUser,
    setAuthError,
    setAuthFailCount,
    setAuthLastName,
    setAuthLoading,
    setAuthLockedUntil,
    setAuthMode,
    setAuthName,
    setAuthOpen,
    setAuthOtp,
    setAuthOtpTimer,
    setAuthPhone,
    setAuthReturnTo,
    setAuthStep,
    setAuthTermsAccepted,
    setBackupDestPath,
    setBlogCommentName,
    setBlogCommentText,
    setBlogComments,
    setBlogForm,
    setBlogPostId,
    setBlogPosts,
    setBrandDetailId,
    setBrandQuery,
    setBrandsList,
    setBuyerGifts,
    setBuyerTicketBody,
    setBuyerTicketDetailId,
    setBuyerTicketError,
    setBuyerTicketFormOpen,
    setBuyerTicketSubject,
    setBuyerTickets,
    setCampaignForm,
    setCampaignNow,
    setCampaignsList,
    setCanonicalLink,
    setCardQtys,
    setCarouselIndex,
    setCart,
    setCartItemLoading,
    setCartOpen,
    setCatOpen,
    setCatalogForm,
    setCheckoutContact,
    setCheckoutErrors,
    setCheckoutNewAddress,
    setCheckoutNote,
    setCheckoutPaymentMethod,
    setCheckoutPlacing,
    setCheckoutSelectedAddressId,
    setCheckoutShippingMethod,
    setCheckoutStep,
    setCheckoutUseNewAddress,
    setClearCartConfirm,
    setCompare,
    setCompareOnlyDiffs,
    setCompareOpen,
    setCompareReplaceOpen,
    setCompareToast,
    setContactForm,
    setContactFormError,
    setContentEditorTarget,
    setCookieConsent,
    setCouponApplied,
    setCouponInput,
    setCouponMsg,
    setDark,
    setDealsMinDiscount,
    setDealsSort,
    setDemoOtpCode,
    setDiscountMode,
    setDiscountPercent,
    setDiscountPickIds,
    setDiscountPrices,
    setEditingAddressId,
    setEditingCouponId,
    setEditingSellerProductId,
    setFaqCat,
    setFaqQuery,
    setFavToast,
    setFavorites,
    setGa4Store,
    setGiftCodeForm,
    setGscStore,
    setHasMounted,
    setHeaderRevealedAfterHero,
    setImgZoom,
    setLastAutoBackupAt,
    setLikedBlogs,
    setLiveToasts,
    setMediaToolAssign,
    setMediaToolOffset,
    setMediaToolProcessing,
    setMediaToolResult,
    setMediaToolScale,
    setMediaToolSearch,
    setMediaToolSrc,
    setMediaToolStep,
    setMegaOpen,
    setMeta,
    setMobileMenuOpen,
    setNewestTab,
    setNewsletterPhone,
    setNotifPanelOpen,
    setNotifPulling,
    setNotifications,
    setOldPriceOpen,
    setOrCreateMeta,
    setOrderDetailId,
    setOrderFailed,
    setOrderRateDraft,
    setOrderReturnOpen,
    setOrderSuccess,
    setOrders,
    setOrdersFilter,
    setPageSeoMap,
    setPdpAttrs,
    setPdpColorIdx,
    setPdpExpress,
    setPdpGalleryIdx,
    setPdpGiftWrap,
    setPdpHeight,
    setPdpNotifyOpen,
    setPdpProduct,
    setPdpQText,
    setPdpQaFilter,
    setPdpQty,
    setPdpReviewFilter,
    setPdpSize,
    setPdpSizeRec,
    setPdpSizeRecOpen,
    setPdpSticky,
    setPdpTab,
    setPdpTouchX,
    setPdpWeight,
    setPdpZoom,
    setPendingPayOrder,
    setPlpCats,
    setPlpCities,
    setPlpCityInput,
    setPlpCityOpen,
    setPlpColors,
    setPlpDiscountOnly,
    setPlpFabrics,
    setPlpFastShipOnly,
    setPlpFilterOpen,
    setPlpFilterTab,
    setPlpInStockOnly,
    setPlpMinDiscount,
    setPlpPriceMax,
    setPlpPriceMin,
    setPlpQuery,
    setPlpSellers,
    setPlpSidebarOpen,
    setPlpSizes,
    setPlpSkeleton,
    setPlpSort,
    setPlpSortOpen,
    setPlpTagFilter,
    setPlpView,
    setPlpViewPersist,
    setPlpVisible,
    setPortalMounted,
    setProductImportReport,
    setProfileTab,
    setPwaInstallEvent,
    setPwaInstalled,
    setQuickAdd,
    setQuickColorIdx,
    setQuickDescOpen,
    setQuickGalleryIdx,
    setQuickQty,
    setQuickSize,
    setRecentOpen,
    setRecentSearches,
    setRecentlyViewed,
    setScrolled,
    setSearchActiveIdx,
    setSearchCategories,
    setSearchColors,
    setSearchOpen,
    setSearchPhIdx,
    setSearchQuery,
    setSearchSizes,
    setSearchSuggestOpen,
    setSelectedColors,
    setSelectedSizes,
    setSellerBannerIdx,
    setSellerCancelForm,
    setSellerCat,
    setSellerCatMenuOpen,
    setSellerCityInput,
    setSellerCityOpen,
    setSellerDescDraft,
    setSellerDescEditorOpen,
    setSellerDescError,
    setSellerDiscountOnly,
    setSellerFaqOpen,
    setSellerFilterSheetOpen,
    setSellerFollowed,
    setSellerGifts,
    setSellerListCities,
    setSellerListMaxResponse,
    setSellerListMinProducts,
    setSellerListMinRating,
    setSellerListQuery,
    setSellerListSort,
    setSellerMediaToolOpen,
    setSellerNewTicket,
    setSellerNewTicketOpen,
    setSellerOrderDetailId,
    setSellerOrders,
    setSellerOrdersFilter,
    setSellerProductDeleteId,
    setSellerProductFilter,
    setSellerProductForm,
    setSellerProductFormOpen,
    setSellerProductOutOfStock,
    setSellerProductReorderPoint,
    setSellerProductSearch,
    setSellerProductStep,
    setSellerProducts,
    setSellerPromoModal,
    setSellerReportOpen,
    setSellerReportSent,
    setSellerSearchOpen,
    setSellerShareToast,
    setSellerShopOpen,
    setSellerSort,
    setSellerSortMenuOpen,
    setSellerStickyBar,
    setSellerTab,
    setSellerTaxonomyPicker,
    setSellerTaxonomySearch,
    setSellerTicketDetailId,
    setSellerTicketReply,
    setSellerTickets,
    setSellerTrackForm,
    setSellerUser,
    setSeo404Log,
    setSeoAiDaily,
    setSeoRedirectForm,
    setSeoRedirects,
    setShippingMethodForm,
    setShippingMethodFormOpen,
    setShowAdminPanel,
    setShowCartPage,
    setShowCheckout,
    setShowComparePage,
    setShowPLP,
    setShowProfilePage,
    setShowRecentPage,
    setShowSellerPanel,
    setShowSellersList,
    setShowTaxonomyHub,
    setShowTop,
    setShowTracking,
    setShowWishlistPage,
    setSiteDialog,
    setSiteFaqs,
    setStaticPage,
    setStep,
    setStockNotifyIds,
    setTaxonomyForm,
    setTaxonomyFormOpen,
    setTopSellersTab,
    setUser,
    setWishlistClearConfirm,
    setWishlistFilter,
    setWishlistOpen,
    setWishlistSelected,
    setWishlistSort,
    setWishlistView,
    shareSeller,
    shippingMethodForm,
    shippingMethodFormOpen,
    shopCodePrefix,
    shouldNormalize,
    show,
    showAdminPanel,
    showBrowserPush,
    showCartPage,
    showCheckout,
    showComparePage,
    showCompareToast,
    showPLP,
    showProfilePage,
    showRecentPage,
    showSellerPanel,
    showSellersList,
    showTaxonomyHub,
    showToast,
    showTop,
    showTracking,
    showWishlistPage,
    simulateBrandScan,
    siteConfirm,
    siteDialog,
    siteFaqs,
    sitePrompt,
    sitePromptFields,
    slugifyTaxonomy,
    smartScore,
    splitList,
    staticPage,
    statusBadge,
    statusLabel,
    statusOf,
    stockNotifyIds,
    stripHtmlSeo,
    stripLinksForDisplay,
    submitSearch,
    suggestInternalLinks,
    suggestSizeFromBody,
    sync,
    syncFormVariants,
    takeSnap,
    taxonomyForm,
    taxonomyFormOpen,
    taxonomyTypeLabel,
    textContainsForbiddenLink,
    tick,
    ticketMessagesToChatUI,
    toEnDigits,
    toFa,
    toggleBlogLike,
    toggleCompare,
    toggleFavorite,
    toggleSearchCategory,
    toggleSearchColor,
    toggleSearchSize,
    toggleSellerFollow,
    toggleSellerListCity,
    top,
    topSellersRanked,
    topSellersTab,
    trackGa4Event,
    up,
    updatePageCms,
    updateQty,
    updateSellerOrderStatus,
    updateSellerProductStock,
    upsertJsonLd,
    upsertRankKeyword,
    user,
    validateCheckout,
    validateProductBackup,
    variantKey,
    verifyAdminOtp,
    verifyOtp,
    warnFaKeyboard,
    wishlistClearConfirm,
    wishlistFilter,
    wishlistOpen,
    wishlistProducts,
    wishlistSelected,
    wishlistSort,
    wishlistView,
    wrap,
    yes
  
} = api;

  const [sellerLogoUrl, setSellerLogoUrl] = useState(() => sellerUser?.logoUrl || sellerUser?.logo_url || sellerUser?.logo || '');
  const [sellerBannerUrl, setSellerBannerUrl] = useState(() => sellerUser?.bannerUrl || sellerUser?.banner_url || sellerUser?.banner || '');
  const [sellerMediaBusy, setSellerMediaBusy] = useState('');
  const sellerLogoInputRef = useRef(null);
  const sellerBannerInputRef = useRef(null);

  useEffect(() => {
    setSellerLogoUrl(sellerUser?.logoPendingUrl || sellerUser?.logo_pending_url || sellerUser?.logoUrl || sellerUser?.logo_url || sellerUser?.logo || '');
    setSellerBannerUrl(sellerUser?.bannerPendingUrl || sellerUser?.banner_pending_url || sellerUser?.bannerUrl || sellerUser?.banner_url || sellerUser?.banner || '');
  }, [sellerUser?.id, sellerUser?.logoUrl, sellerUser?.logo_url, sellerUser?.logoPendingUrl, sellerUser?.logo_pending_url, sellerUser?.bannerUrl, sellerUser?.banner_url, sellerUser?.bannerPendingUrl, sellerUser?.banner_pending_url]);

  const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error('خواندن فایل ناموفق'));
    r.readAsDataURL(file);
  });

  const uploadSellerMedia = async (file, kind) => {
    if (!file || !String(file.type || '').startsWith('image/')) {
      if (typeof showToast === 'function') showToast({ message: 'فقط فایل تصویر مجاز است', variant: 'error', duration: 3500, position: 'top-center' });
      return null;
    }
    if (file.size > 4 * 1024 * 1024) {
      if (typeof showToast === 'function') showToast({ message: 'حجم تصویر حداکثر ۴ مگابایت', variant: 'error', duration: 3500, position: 'top-center' });
      return null;
    }
    setSellerMediaBusy(kind);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const folder = 'seller-' + String(sellerUser?.id || 'shop').slice(0, 12);
      const res = await fetch('/api/media/upload-image', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ dataUrl, folder, role: kind === 'banner' ? 'banner' : 'logo' }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok || !data?.url) {
        if (typeof showToast === 'function') showToast({ message: (data && data.error) || 'آپلود تصویر ناموفق', variant: 'error', duration: 4000, position: 'top-center' });
        return null;
      }
      const url = String(data.url);
      if (kind === 'banner') setSellerBannerUrl(url);
      else setSellerLogoUrl(url);
      // ذخیره فوری روی سرور تا realtime شود
      try {
        if (typeof updateSellerShopOnServer === 'function') {
          const payload = kind === 'banner'
            ? { bannerUrl: url, banner_url: url }
            : { logoUrl: url, logo_url: url };
          await updateSellerShopOnServer(payload);
        }
      } catch (_) {}
      if (typeof showToast === 'function') showToast({ message: kind === 'banner' ? 'کاور ذخیره شد' : 'عکس پروفایل ذخیره شد', variant: 'success', duration: 3000, position: 'top-center' });
      return url;
    } catch (e) {
      if (typeof showToast === 'function') showToast({ message: 'خطا در آپلود تصویر', variant: 'error', duration: 4000, position: 'top-center' });
      return null;
    } finally {
      setSellerMediaBusy('');
    }
  };


  useEffect(() => {
    if (!sellerTab) return;
    scrollSellerPanelToTop();
    const id = requestAnimationFrame(() => scrollSellerPanelToTop());
    const t1 = setTimeout(() => scrollSellerPanelToTop(), 50);
    const t2 = setTimeout(() => scrollSellerPanelToTop(), 150);
    return () => { cancelAnimationFrame(id); clearTimeout(t1); clearTimeout(t2); };
  }, [sellerTab]);


  const sellerUnreadTickets = (sellerTickets || []).filter((t) => t.unread).length;


  return (
    <>
            <div className="panel-content-wrap w-full max-w-none mx-auto px-2 sm:px-4 py-4 sm:py-10 pb-24">
              <div className="mb-6 p-4 sm:p-5 rounded-2xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 space-y-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-14 h-14 rounded-full bg-apple-blue text-white flex items-center justify-center text-xl font-bold flex-shrink-0 overflow-hidden">
                  {(sellerLogoUrl || sellerUser?.logoUrl || sellerUser?.logo_url || sellerUser?.logo) ? (
                    <img src={sellerLogoUrl || sellerUser?.logoUrl || sellerUser?.logo_url || sellerUser?.logo} alt="" className="w-full h-full object-cover" onError={(e)=>{ e.currentTarget.style.display='none'; }} />
                  ) : (
                    <span>{(sellerUser.shopName || 'ف')[0]}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-white truncate">{sellerUser.shopName}</h1>
                  <p className="text-xs text-primary-500 dark:!text-white truncate">{sellerUser.ownerName || sellerUser.name || ''}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {(() => {
                  const stt = String(sellerUser?.status || sellerUser?.shopStatus || sellerUser?.sellerStatus || '').toLowerCase();
                  const ok =
                    (typeof sellerCanSell === 'function' ? sellerCanSell() : false) ||
                    sellerUser?.licenseApproved === true ||
                    sellerUser?.canSell === true ||
                    ['approved', 'active', 'enabled', 'verified'].includes(stt);
                  if (stt === 'archived') {
                    return <span className="inline-flex items-center gap-0.5 text-red-600 font-medium whitespace-nowrap"><Icon name="x" size={12} /> تعلیق‌شده</span>;
                  }
                  const blocked = ['suspended', 'blocked', 'banned', 'rejected'].includes(stt);
                  if (blocked) {
                    return <span className="inline-flex items-center gap-0.5 text-red-600 font-medium whitespace-nowrap"><Icon name="x" size={12} /> رد / محدود</span>;
                  }
                  if (ok) {
                    return <span className="inline-flex items-center gap-0.5 text-emerald-600 font-medium whitespace-nowrap"><Icon name="checkCircle" size={12} /> تأیید‌شده</span>;
                  }
                  return <span className="inline-flex items-center gap-0.5 text-amber-600 font-medium whitespace-nowrap">در انتظار تأیید</span>;
                })()}
              </div>
              {(() => {
                const sid = sellerUser.id || 'own';
                const path = `/seller/${encodeURIComponent(sid)}`;
                const full = (typeof window !== 'undefined' ? window.location.origin : '') + path;
                const short = path.replace(/^\//, '');
                return (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 min-w-0">
                    <p className="text-[11px] sm:text-xs text-primary-500 dark:text-white/70 whitespace-nowrap shrink-0">لینک اختصاصی فروشگاه شما</p>
                    <button
                      type="button"
                      onClick={() => {
                        const url = (typeof window !== 'undefined' ? window.location.origin : '') + path;
                        try {
                          navigator.clipboard.writeText(url);
                          try { showToast({ title: 'کپی شد', message: 'لینک کامل فروشگاه کپی شد', variant: 'success' }); } catch (_) {}
                        } catch (_) {
                          try { showToast({ title: 'کپی', message: url, variant: 'default' }); } catch (_) {}
                        }
                      }}
                      className="inline-flex items-center gap-1.5 min-w-0 max-w-full px-2.5 py-1.5 rounded-full border border-primary-200 dark:border-white/20 bg-primary-50/80 dark:bg-primary-900/40 text-[11px] sm:text-xs text-primary-700 dark:text-white/90 hover:border-[#4CCD99]/50 transition shadow-none"
                      title={full || path}
                    >
                      <Icon name="copy" size={12} className="flex-shrink-0 opacity-70" />
                      <span className="truncate font-latin text-left min-w-0" dir="ltr">{short}</span>
                    </button>
                  </div>
                );
              })()}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button type="button" onClick={() => setSellerTab('shop')} className="seller-header-btn text-xs px-3 py-1.5 rounded-full border border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-semibold flex items-center gap-1"><Icon name="pencil" size={14} /> ویرایش فروشگاه</button>
                <button type="button" onClick={logoutSeller} className="seller-logout-btn text-xs px-3 py-1.5 rounded-full border border-red-400 dark:border-red-400/80 !text-red-600 dark:!text-red-300 font-semibold flex items-center gap-1"><Icon name="logOut" size={14} /> خروج</button>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-6">
                <aside className="w-full md:w-48 lg:w-56 flex-shrink-0 md:sticky md:top-24 md:self-start">
                  <div className="seller-tabs-strip flex md:flex-col gap-1 overflow-x-auto no-scrollbar px-2 pt-2 pb-2 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 shadow-sm">
                    {[
                      { id: 'dashboard', label: 'داشبورد', icon: 'home' },
                      { id: 'orders', label: 'سفارش‌ها', icon: 'truck' },

                { id: 'products', label: 'محصولات', icon: 'package' },
                      { id: 'inventory', label: 'موجودی انبار', icon: 'package' },
                      { id: 'support', label: 'پشتیبانی', icon: 'headphones', badge: sellerUnreadTickets },
                      { id: 'gifts', label: 'تخفیف و هدایا', icon: 'gift' },
                      { id: 'stats', label: 'آمار', icon: 'dollar' },
                      { id: 'tools', label: 'ابزارهای کمکی', icon: 'sliders' },
                      { id: 'kyc', label: 'احراز هویت', icon: 'shield' },
                      { id: 'finance', label: 'مالی', icon: 'dollar' },
                      { id: 'shop', label: 'اطلاعات فروشگاه', icon: 'settings' },
                    ].map(t => (
                      <button key={t.id} type="button" onClick={() => {
                        if (typeof sellerCanSell === 'function' && !sellerCanSell()) {
                          setSellerTab('pending-approval');
                          try { showToast({ message: 'پس از تأیید ادمین، پنل فعال می‌شود', variant: 'default', position: 'top-center' }); } catch (_) {}
                          return;
                        }
                        setSellerTab(t.id); setSellerOrderDetailId(null); setSellerTicketDetailId(null); try { window.scrollTo({ top: 0, behavior: 'auto' }); } catch (_) {}
                      }} className={`flex-shrink-0 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap ${sellerTab === t.id || (t.id === 'orders' && sellerOrderDetailId) || (t.id === 'support' && sellerTicketDetailId) ? 'bg-apple-blue text-white' : 'text-primary-700 dark:text-white/80 hover:bg-primary-50 dark:hover:bg-primary-900'}`}>
                        <Icon name={t.icon} size={16} /><span>{t.label}</span>
                        {t.badge > 0 && <span className="mr-auto text-xs bg-white/20 text-white px-1.5 py-0.5 rounded-full">{toFa(t.badge)}</span>}
                      </button>
                    ))}
                  </div>
                </aside>
                <div className="flex-1 min-w-0 p-3 sm:p-5 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 shadow-sm">
                  {/* Dashboard */}
                  {sellerTab === 'pending-approval' && (
                        <div className="p-8 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/30 text-center max-w-lg mx-auto my-12">
                          <p className="text-lg font-bold text-primary-900 dark:text-white mb-2">در انتظار تأیید ادمین</p>
                          <p className="text-sm text-primary-600 dark:text-white/70 leading-relaxed">
                            حساب فروشنده شما هنوز تأیید نشده است. پس از بررسی و تأیید توسط ادمین، پنل فروش فعال می‌شود.
                          </p>
                        </div>
                      )}

                      {sellerTab === 'dashboard' && !sellerOrderDetailId && (
                    <div className="space-y-6">
                      
                      {String(sellerUser?.status||'').toLowerCase()==='archived' && (
                        <div className="mb-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300 leading-relaxed">
                          فروشگاه شما توسط مدیریت <strong>تعلیق شده</strong> است. برای فعال‌سازی مجدد با پشتیبانی تماس بگیرید.
                        </div>
                      )}

                      {(String(sellerUser?.status||'').toLowerCase()==='suspended' || String(sellerUser?.status||'').toLowerCase()==='blocked') && (
                        <div className="mb-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
                          فروشگاه شما توسط ادمین <strong>محدود شده</strong> است. امکان افزودن/ویرایش محصول تا رفع محدودیت وجود ندارد.
                        </div>
                      )}

                      {!sellerCanSell() && !['archived','suspended','blocked','banned','rejected'].includes(String(sellerUser?.status||'').toLowerCase()) && (
                        <div className="p-3 rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/30 text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                          پنل فروش شما تا <strong>تأیید جواز کسب توسط ادمین</strong> محدود است. پس از آپلود جواز و تأیید، می‌توانید محصول ثبت و بفروشید.
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary-900 dark:text-white">{sellerShopOpen ? 'الان هستیم' : 'الان نیستیم'}</p>
                          <p className="text-xs text-primary-500 dark:!text-white mt-0.5">{sellerShopOpen ? 'فروشگاه آنلاین باز است' : 'فروشگاه آنلاین تعطیل است'}</p>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={sellerShopOpen}
                          aria-label={sellerShopOpen ? 'فروشگاه باز است' : 'فروشگاه بسته است'}
                          onClick={() => {
                            setSellerShopOpen(v => {
                              const next = !v;
                              try { localStorage.setItem('sellerShopOpen', next ? '1' : '0'); } catch (_) {}
                              pushLiveToast(next ? 'فروشگاه آنلاین باز شد' : 'فروشگاه آنلاین تعطیل شد', { type: 'info' });
                              return next;
                            });
                          }}
                          className="inline-flex items-center gap-2.5 shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2"
                        >
                          <span className={`text-xs font-bold min-w-[2.5rem] text-left ${sellerShopOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary-500 dark:text-white/60'}`}>
                            {sellerShopOpen ? 'باز' : 'بسته'}
                          </span>
                          <span
                            dir="ltr"
                            className={`relative inline-flex h-8 w-14 items-center rounded-full p-1 transition-colors duration-300 ease-out ${sellerShopOpen ? 'bg-emerald-500' : 'bg-primary-300 dark:bg-primary-600'}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 ease-out ${sellerShopOpen ? 'translate-x-6' : 'translate-x-0'}`}
                            />
                          </span>
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: 'محصول فعال', value: (sellerProducts || []).filter(p => p.status === 'active').length, color: 'text-emerald-600' },
                          { label: 'سفارش جدید', value: (sellerOrders || []).filter(o => o.status === 'new').length, color: 'text-orange-600' },
                          { label: 'در آماده‌سازی', value: (sellerOrders || []).filter(o => o.status === 'preparing').length, color: 'text-amber-600' },
                          { label: 'پیام خوانده‌نشده', value: sellerUnreadTickets, color: 'text-blue-600' },
                        ].map(s => (
                          <div key={s.label} className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 text-center">
                            <p className={`text-2xl font-bold ${s.color}`}>{toFa(s.value)}</p>
                            <p className="text-xs text-primary-500 dark:!text-white mt-1">{s.label}</p>
                          </div>
                        ))}
                      </div>
                      {/* خلاصه وضعیت تیکت‌ها */}
                      <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/25 bg-white dark:bg-[#1A1C20] shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-bold text-primary-900 dark:text-white">وضعیت تیکت‌ها</h3>
                          <button type="button" onClick={() => setSellerTab('support')} className="text-xs text-apple-blue dark:text-[#018383] hover:underline">مشاهده همه</button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {(() => {
                            const tickets = sellerTickets || [];
                            const openN = tickets.filter(t => t.status === 'open').length;
                            const waitN = tickets.filter(t => t.status === 'waiting').length;
                            const closedN = tickets.filter(t => t.status === 'closed').length;
                            return [
                              { label: 'باز', n: openN, cls: 'bg-blue-50 text-blue-700 dark:bg-[#2A3540] dark:text-[#D6E8F7]' },
                              { label: 'منتظر پاسخ', n: waitN, cls: 'bg-amber-50 text-amber-700 dark:bg-[#3A342A] dark:text-[#F5E6C8]' },
                              { label: 'بسته', n: closedN, cls: 'bg-primary-50 text-primary-600 dark:bg-[#2A2C30] dark:text-white' },
                            ].map(x => (
                              <div key={x.label} className={`rounded-xl p-3 text-center border border-transparent dark:border-white/10 ${x.cls}`}>
                                <p className="text-lg font-bold">{toFa(x.n)}</p>
                                <p className="text-xs mt-0.5">{x.label}</p>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-3 gap-3">
                        {(() => {
                          const orders = Array.isArray(sellerOrders) ? sellerOrders : [];
                          const now = Date.now();
                          const day = 86400000;
                          const sumPaid = (fromTs) => orders.reduce((acc, o) => {
                            const st = String(o.status || '');
                            if (st === 'cancelled' || st === 'pending_payment') return acc;
                            const ts = o.created_at ? new Date(o.created_at).getTime() : (Number(o.createdAt) || 0);
                            if (ts && ts < fromTs) return acc;
                            const amt = Number(o.payable ?? o.total ?? o.amount ?? 0) || 0;
                            return acc + amt;
                          }, 0);
                          const fmt = (n) => {
                            try { return Number(n || 0).toLocaleString('fa-IR'); } catch { return String(n || 0); }
                          };
                          return [
                            { label: 'فروش امروز', value: fmt(sumPaid(now - day)) },
                            { label: 'این هفته', value: fmt(sumPaid(now - 7 * day)) },
                            { label: 'این ماه', value: fmt(sumPaid(now - 30 * day)) },
                          ].map(s => (
                          <div key={s.label} className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                            <p className="text-xs text-primary-500 dark:!text-white">{s.label}</p>
                            <p className="text-lg font-bold text-primary-900 dark:text-white mt-1">{s.value} <span className="text-xs font-normal">تومان</span></p>
                          </div>
                          ));
                        })()}
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h2 className="text-base font-bold text-primary-900 dark:text-white">آخرین سفارش‌ها</h2>
                          <button type="button" onClick={() => setSellerTab('orders')} className="text-xs text-apple-blue hover:underline">همه</button>
                        </div>
                        <div className="space-y-2">
                          {(sellerOrders || []).slice(0, 4).map(o => (
                            <button key={o.id} type="button" onClick={() => { setSellerTab('orders'); setSellerOrderDetailId(o.id); }} className="w-full flex items-center gap-3 p-3 rounded-xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 text-right hover:border-apple-blue/40 transition">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-primary-900 dark:text-white">{o.id}</p>
                                <p className="text-xs text-primary-500">{o.date} · {o.buyerName}</p>
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sellerOrderStatusColor(o.status)}`}>{o.statusLabel}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <h2 className="text-base font-bold text-primary-900 dark:text-white">نقطه سفارش / اتمام موجودی</h2>
                          <button type="button" onClick={() => setSellerTab('products')} className="text-xs text-apple-blue hover:underline">مدیریت محصولات</button>
                        </div>
                        {(() => {
                          const low = (sellerProducts || []).filter(p => (Number(p.stock) || 0) > 0 && (Number(p.stock) || 0) <= 5);
                          const out = (sellerProducts || []).filter(p => (Number(p.stock) || 0) <= 0);
                          if (!low.length && !out.length) {
                            return <p className="text-xs text-primary-500 dark:!text-white py-2">همه محصولات موجودی کافی دارند.</p>;
                          }
                          return (
                            <div className="space-y-2">
                              {out.slice(0, 6).map(p => (
                                <div key={'o'+p.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-red-200/60 dark:border-red-800/40 bg-red-50/50 dark:bg-red-900/10">
                                  <img src={p.colors?.[0]?.image || p.image || p.images?.[0]} alt="" className="w-10 h-12 object-cover rounded-lg flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-primary-900 dark:text-white truncate">{p.name}</p>
                                    <p className="text-xs text-red-600 dark:text-red-400">تمام شده</p>
                                  </div>
                                  <span className="text-xs font-bold text-red-600">۰</span>
                                </div>
                              ))}
                              {low.slice(0, 6).map(p => (
                                <div key={'l'+p.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-800/40 bg-amber-50/40 dark:bg-amber-900/10">
                                  <img src={p.colors?.[0]?.image || p.image || p.images?.[0]} alt="" className="w-10 h-12 object-cover rounded-lg flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-primary-900 dark:text-white truncate">{p.name}</p>
                                    <p className="text-xs text-amber-700 dark:text-amber-300">نزدیک نقطه سفارش</p>
                                  </div>
                                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300">{toFa(p.stock)}</span>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Products */}
                  {sellerTab === 'products' && (
                    <div>
                      {!sellerCanSell() && (
                        <div className="mb-4 p-3 rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/30 text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                          فروش و افزودن محصول تا <strong>تأیید جواز کسب توسط ادمین</strong> غیرفعال است. مدارک و جواز را ارسال کنید و منتظر تأیید بمانید.
                        </div>
                      )}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <h2 className="text-base font-bold text-primary-900 dark:text-white">مدیریت محصولات</h2>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <label className="text-xs px-3 py-1.5 rounded-full border border-emerald-300 text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer">
                            <Icon name="upload" size={14} /> ورود CSV
                            <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              if (!(typeof sellerCanSell === 'function' ? sellerCanSell() : sellerCanSell) && !['approved','active'].includes(String(sellerUser?.status||sellerUser?.shopStatus||'').toLowerCase()) && sellerUser?.licenseApproved !== true) {
                                showToast({ message: 'تا تأیید فروشگاه توسط ادمین، امکان ورود محصول نیست', variant: 'error', duration: 5000, position: 'top-center' });
                                e.target.value = '';
                                return;
                              }
                              importExternalProductsCsv(f, 'seller');
                              e.target.value = '';
                            }} />
                          </label>
                          <button type="button" onClick={() => backupSellerProducts('csv')} className="text-xs px-3 py-1.5 rounded-full border border-primary-200 dark:border-white/20 text-primary-700 dark:text-white font-medium flex items-center gap-1">
                            <Icon name="download" size={14} /> خروجی CSV
                          </button>
                          <button type="button" onClick={() => {
                            if (!(typeof sellerCanSell === 'function' ? sellerCanSell() : sellerCanSell) && !['approved','active'].includes(String(sellerUser?.status||sellerUser?.shopStatus||'').toLowerCase()) && sellerUser?.licenseApproved !== true) { showToast({ message: 'تا تأیید فروشگاه توسط ادمین، امکان افزودن محصول نیست', variant: 'error', duration: 5000, position: 'top-center' });
                              return;
                            }
                            setEditingSellerProductId(null);
                            setSellerProductForm({ name: '', category: 'رسمی', categories: ['رسمی'], tags: [], desc: '', price: '', oldPrice: '', stock: '10', multiVariant: false, fastShip: true, sizes: ['S','M','L','XL'], colorIds: [((Array.isArray(adminCatalogColors) ? adminCatalogColors : []).find(x=>x.active!==false)||{}).id || 'col-black'], brandId: '', brandName: '', images: [], featuredImageIndex: 0, attributes: {}, slug: '', productCode: '', seoTitle: '', seoDescription: '', seoFocusKeywords: '', seoOgImage: '', seoFaq: [], imageAlt: '', aparatEmbed: '', status: 'pending' });
                            setSellerProductStep(1);
                            setSellerProductFormOpen(true);
                          }} className={`text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1 ${sellerCanSell() ? 'bg-apple-blue !text-white dark:!text-white' : 'bg-primary-200 dark:bg-primary-800 text-primary-500 cursor-not-allowed'}`}><Icon name="plus" size={14} className={sellerCanSell() ? '!text-white' : ''} /> افزودن محصول</button>
                        </div>
                      </div>
                      <div className="mb-4 space-y-2">
                        <input value={sellerProductSearch} onChange={e => setSellerProductSearch(e.target.value)} placeholder="جستجوی نام..." className="w-full px-3 py-2 rounded-full border border-primary-200 dark:border-white/20 bg-transparent text-xs text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue" />
                        <div className="flex flex-wrap gap-2">
                          {['all','active','inactive','pending'].map(f => (
                            <button key={f} type="button" onClick={() => setSellerProductFilter(f)} className={`px-3 py-1.5 rounded-full text-xs border font-medium ${sellerProductFilter === f ? 'bg-primary-800 text-white border-primary-800 dark:bg-[#4CCD99] dark:border-[#4CCD99] dark:text-white' : 'plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium'}`}>{f === 'all' ? 'همه' : f === 'active' ? 'فعال' : f === 'inactive' ? 'غیرفعال' : 'در انتظار'}</button>
                          ))}
                        </div>
                      </div>
                      {(() => {
                        let list = sellerProducts || [];
                        if (sellerProductFilter !== 'all') list = list.filter(p => p.status === sellerProductFilter);
                        if (sellerProductSearch.trim()) list = list.filter(p => (p.name || '').includes(sellerProductSearch.trim()));
                        if (list.length === 0) return <div className="text-center py-16 rounded-2xl bg-white dark:bg-primary-900 border border-dashed border-primary-200 dark:border-white/20"><Icon name="package" size={32} className="mx-auto text-primary-300 mb-3" /><p className="text-sm text-primary-500">محصولی یافت نشد</p></div>;
                        return (
                          <div className="space-y-2">
                            {list.map(p => (
                              <div key={p.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                <img
                                  src={p.image || p.colors?.[0]?.image || (Array.isArray(p.images) && p.images[0]) || '/logo.webp'}
                                  alt=""
                                  className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl object-cover flex-shrink-0 bg-primary-50 dark:bg-primary-800"
                                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo.webp'; }}
                                />
                                <div className="flex-1 min-w-0 text-right space-y-0.5">
                                  <p className="text-sm font-bold text-primary-900 dark:text-white line-clamp-2">{p.name || 'بدون نام'}</p>
                                <p className="text-xs text-primary-500">
                                  {p.priceText || (toFa(Number(p.price || 0).toLocaleString()) + ' تومان')}
                                </p>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-primary-500 dark:text-white/60">
                                  <span>موجودی <span className="font-medium text-primary-800 dark:text-white/90">{toFa(p.stock ?? 0)}</span></span>
                                  {(p.category || (Array.isArray(p.categories) && p.categories[0])) ? (
                                    <>
                                      <span className="text-primary-300 dark:text-white/20">·</span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          const cat = p.category || (Array.isArray(p.categories) && p.categories[0]);
                                          try {
                                            if (typeof openCategory === 'function') openCategory(cat);
                                            else if (typeof openPLP === 'function') openPLP({ cat });
                                          } catch (_) {}
                                        }}
                                        className="hover:text-apple-blue underline-offset-2 hover:underline"
                                      >
                                        دسته <span className="font-medium text-primary-800 dark:text-white/90">{p.category || p.categories[0]}</span>
                                      </button>
                                    </>
                                  ) : null}
                                  {(p.brand || p.brandName) ? (
                                    <>
                                      <span className="text-primary-300 dark:text-white/20">·</span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          const brand = p.brand || p.brandName;
                                          try {
                                            if (typeof openPLP === 'function') openPLP({ query: brand });
                                          } catch (_) {}
                                        }}
                                        className="hover:text-apple-blue underline-offset-2 hover:underline"
                                      >
                                        برند <span className="font-medium text-primary-800 dark:text-white/90">{p.brand || p.brandName}</span>
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
                                  {p.productCode && (
                                    <p className="text-xs text-primary-400 flex items-center gap-1 flex-wrap justify-end">
                                      <span>کد:</span>
                                      <span className="latin-label font-semibold text-primary-700 dark:text-white" dir="ltr">{p.productCode}</span>
                                      <button type="button" onClick={() => copyTextToClipboard(p.productCode)} className="text-apple-blue hover:underline">کپی کد</button>
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
                                  <div className="mt-1 flex flex-wrap items-center gap-1.5 justify-end">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          try {
                                            let prod = p;
                                            if (!prod.productCode && typeof ensureProductCode === 'function') {
                                              prod = { ...prod, productCode: ensureProductCode(prod) };
                                            }
                                            const url = typeof getProductPublicUrl === 'function' ? getProductPublicUrl(prod) : '';
                                            if (url && typeof copyTextToClipboard === 'function') {
                                              copyTextToClipboard(url);
                                              try { showToast({ message: 'لینک کپی شد: ' + url, variant: 'success', duration: 2500, position: 'top-center' }); } catch (_) {}
                                            }
                                          } catch (_) {}
                                        }}
                                        className="text-xs px-2 py-0.5 rounded-full border border-emerald-300 text-emerald-700 dark:text-emerald-300 flex items-center gap-1"
                                      >
                                        <Icon name="copy" size={14} /> کپی لینک محصول
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          try {
                                            let prod = p;
                                            if (!prod.productCode && typeof ensureProductCode === 'function') {
                                              prod = { ...prod, productCode: ensureProductCode(prod) };
                                            }
                                            if (typeof openPDP === 'function') {
                                              try { if (typeof setShowSellerPanel === 'function') setShowSellerPanel(false); } catch (_) {}
                                              openPDP(prod);
                                              return;
                                            }
                                            const url = typeof getProductPublicUrl === 'function' ? getProductPublicUrl(prod) : '';
                                            if (url) window.location.href = url;
                                          } catch (_) {}
                                        }}
                                        className="text-xs px-2 py-0.5 rounded-full border border-primary-200 dark:border-white/20 text-primary-600 dark:text-white/80"
                                      >
                                        باز کردن
                                      </button>
                                    </div>
                                  {p.status === 'pending' && (
                                    <p className="text-xs text-amber-600 mt-0.5">پس از تأیید ادمین، لینک عمومی فعال می‌شود</p>
                                  )}
                                </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                                {p.status === 'pending' ? (
                                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">در انتظار</span>
                                ) : (
                                  <button
                                    type="button"
                                    role="switch"
                                    aria-checked={p.status === 'active'}
                                    aria-label={p.status === 'active' ? 'محصول فعال است' : 'محصول غیرفعال است'}
                                    title={p.status === 'active' ? 'فعال — کلیک برای غیرفعال کردن' : 'غیرفعال — کلیک برای فعال کردن'}
                                    onClick={() => {
                                      const nextStatus = p.status === 'active' ? 'inactive' : 'active';
                                      const next = (sellerProducts || []).map(x => x.id === p.id ? { ...x, status: nextStatus } : x);
                                      saveSellerProducts(next);
                                      try { pushLiveToast(nextStatus === 'active' ? 'محصول فعال شد' : 'محصول غیرفعال شد', { type: nextStatus === 'active' ? 'success' : 'info' }); } catch (_) {}
                                    }}
                                    className="inline-flex items-center gap-2 shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                                  >
                                    <span className={`text-[11px] font-bold ${p.status === 'active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary-500 dark:text-white/60'}`}>
                                      {p.status === 'active' ? 'فعال' : 'غیرفعال'}
                                    </span>
                                    <span
                                      dir="ltr"
                                      className={`relative inline-flex h-7 w-12 items-center rounded-full p-0.5 transition-colors duration-300 ease-out ${p.status === 'active' ? 'bg-emerald-500' : 'bg-primary-300 dark:bg-primary-600'}`}
                                    >
                                      <span
                                        className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 ease-out ${p.status === 'active' ? 'translate-x-5' : 'translate-x-0'}`}
                                      />
                                    </span>
                                  </button>
                                )}
                                <div className="flex items-center gap-1">
                                  <button type="button" onClick={() => { setEditingSellerProductId(p.id); setSellerProductForm({ name: p.name, multiVariant: !!(p.variants && p.variants.length > 1) || !!p.multiVariant, category: p.category || 'رسمی', categories: p.categories || (p.category ? [p.category] : []), tags: p.tags || [], desc: p.desc || '', price: String(p.price || ''), oldPrice: p.oldPrice ? String(p.oldPrice).replace(/[^\d]/g,'') : '', stock: String(p.stock ?? 10), fastShip: p.fastShip !== false, sizes: p.sizes || (adminCatalogSizes||[]).filter(s=>s.active!==false).map(s=>s.name), colorIds: (p.colors||[]).map(col => (adminCatalogColors||[]).find(ac => ac.name === col.name)?.id).filter(Boolean), brandId: p.brandId || (adminCatalogBrands||[]).find(b => b.name === p.brand)?.id || '', brandName: p.brand || p.brandName || '', images: p.images || [], featuredImageIndex: p.featuredImageIndex || 0, attributes: p.attributes || {}, slug: p.slug || productSlugFromNameAndShop(p.name, sellerUser?.shopName || sellerUser?.name || ''), productCode: p.productCode || '', seoTitle: p.seoTitle || '', seoDescription: p.seoDescription || '', seoFocusKeywords: Array.isArray(p.seoFocusKeywords) ? p.seoFocusKeywords.join('، ') : (p.seoFocusKeywords || ''), seoOgImage: p.seoOgImage || '', seoFaq: p.seoFaq || [], imageAlt: p.imageAlt || '', imageAlts: p.imageAlts || (p.images || []).map((_, i) => (i === (p.featuredImageIndex || 0) ? (p.imageAlt || '') : '')), variants: p.variants || [], slugLocked: !!p.slug, aparatEmbed: p.aparatEmbed || '', status: p.status || 'active' }); setSellerProductFormOpen(true); setSellerProductStep(1); setSellerDescDraft(p.desc || ''); setSellerDescError(''); setSellerDescEditorOpen(false); }} className="p-1.5 rounded-full hover:bg-primary-50 dark:hover:bg-primary-800 text-primary-500"><Icon name="pencil" size={14} /></button>
                                  {String(p.status) === 'purge_requested' ? (
                                    <button type="button" title="لغو درخواست حذف" onClick={async () => {
                                      if (typeof cancelSellerProductPurge === 'function') await cancelSellerProductPurge(p.id);
                                    }} className="text-[10px] px-2 py-1 rounded-full border border-amber-300 text-amber-700">لغو درخواست حذف</button>
                                  ) : String(p.status) === 'archived' ? (
                                    <button type="button" title="درخواست حذف دائم" onClick={() => setSellerProductDeleteId(p.id)} className="text-[10px] px-2 py-1 rounded-full border border-red-400 text-red-600 font-medium">حذف برای همیشه</button>
                                  ) : (
                                    <button type="button" onClick={() => setSellerProductDeleteId(p.id)} className="p-1.5 rounded-full hover:bg-red-50 text-red-500" title="انتقال به آرشیو"><Icon name="trash" size={14} /></button>
                                  )}
                                </div>
                                {sellerProductDeleteId === p.id && String(p.status) === 'archived' && (
                                  <div className="flex flex-col items-end gap-1 mt-1">
                                    <p className="text-[10px] text-red-600 text-left">درخواست حذف دائم برای تأیید ادمین ارسال شود؟</p>
                                    <div className="flex items-center gap-1">
                                      <button type="button" onClick={async () => {
                                        if (typeof requestSellerProductPurge === 'function') {
                                          const ok = await requestSellerProductPurge(p.id);
                                          if (ok) setSellerProductDeleteId(null);
                                        }
                                      }} className="text-xs px-2 py-1 rounded-full bg-red-600 text-white">ارسال درخواست</button>
                                      <button type="button" onClick={() => setSellerProductDeleteId(null)} className="text-xs px-2 py-1 rounded-full border border-primary-200">لغو</button>
                                    </div>
                                  </div>
                                )}
                                {sellerProductDeleteId === p.id && String(p.status) !== 'archived' && String(p.status) !== 'purge_requested' && (
                                  <div className="flex items-center gap-1">
                                    <button type="button" onClick={async () => {
                                      if (typeof deleteSellerProductOnServer === 'function') {
                                        const ok = await deleteSellerProductOnServer(p.id);
                                        if (ok) setSellerProductDeleteId(null);
                                      } else {
                                        saveSellerProducts((sellerProducts || []).filter(x => x.id !== p.id));
                                        setSellerProductDeleteId(null);
                                      }
                                    }} className="text-xs px-2 py-1 rounded-full bg-red-500 text-white">آرشیو</button>
                                    <button type="button" onClick={() => setSellerProductDeleteId(null)} className="text-xs px-2 py-1 rounded-full border border-primary-200">لغو</button>
                                  </div>
                                )}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                      {sellerProductFormOpen && (
                        <div className="site-modal-root" role="dialog" aria-modal="true">
                          <div className="site-modal-backdrop" onClick={() => setSellerProductFormOpen(false)} />
                          <div className="site-modal-panel bg-white dark:bg-primary-900 p-4 sm:p-5 border border-primary-200 dark:border-white/15 max-sm:!fixed max-sm:!inset-0 max-sm:!max-w-none max-sm:!w-full max-sm:!h-full max-sm:!rounded-none max-sm:!m-0 max-sm:overflow-y-auto max-sm:overflow-x-hidden">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-base font-bold text-primary-900 dark:text-white">{editingSellerProductId ? 'ویرایش محصول' : 'افزودن محصول'}</h3>
                              <button type="button" onClick={() => setSellerProductFormOpen(false)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-primary-100 dark:hover:bg-primary-800 text-primary-700 dark:text-white" aria-label="بستن">
                                <Icon name="x" size={18} />
                              </button>
                            </div>
                            <div className="mb-3">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <p className="text-xs font-semibold text-primary-700 dark:text-white">مرحله {toFa(sellerProductStep > 11 && !sellerProductForm.multiVariant ? sellerProductStep - 1 : sellerProductStep)} از {toFa(sellerProductForm.multiVariant ? 18 : 17)}</p>
                                <p className="text-xs text-primary-400">{sellerProductStep <= 12 ? 'الزامی برای انتشار' : 'اختیاری · سئو'}</p>
                              </div>
                              <div className="h-1.5 rounded-full bg-primary-100 dark:bg-primary-800 overflow-hidden">
                                <div className="h-full rounded-full bg-apple-blue transition-all" style={{ width: `${((sellerProductForm.multiVariant ? sellerProductStep : (sellerProductStep > 11 ? sellerProductStep - 1 : sellerProductStep)) / (sellerProductForm.multiVariant ? 18 : 17)) * 100}%` }} />
                              </div>
                            </div>
                            <div className="space-y-3">
                              {sellerProductStep === 1 && (
                              <div className="space-y-4">
                              <p className="text-sm font-bold text-primary-900 dark:text-white mb-3">۱. نام محصول و کد محصول و نامک و قیمت (تومان)</p>

                              <div><label className="text-xs text-primary-500 mb-1 block">نام محصول</label><input value={sellerProductForm.name} onChange={e => setSellerProductForm(f => ({ ...f, name: e.target.value, slug: slugifyTaxonomy(e.target.value) }))} className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue shadow-none" /></div>
                              <div>
                                <label className="text-xs text-primary-500 mb-1 block">کد محصول</label>
                                <input
                                  value={sellerProductForm.productCode || shopCodePrefix(sellerUser?.shopName || sellerUser?.name || 'SHOP') + '·········'}
                                  readOnly
                                  disabled
                                  dir="ltr"
                                  className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-primary-50 dark:bg-primary-900/50 text-sm text-left font-latin text-primary-500 dark:!text-white cursor-not-allowed shadow-none"
                                />
                                <p className="text-xs text-primary-400 mt-1">کد یکتا: ۴ حرف اول فروشگاه + ۹ رقم · بدون هم‌پوشانی با سایر محصولات · غیرقابل ویرایش</p>
                              </div>
                              <div>
                                <label className="text-xs text-primary-500 mb-1 block">نامک (Slug)</label>
                                <input value={productSlugFromNameAndShop(sellerProductForm.name, sellerUser?.shopName || sellerUser?.name || '')} readOnly disabled dir="ltr" placeholder="خودکار از نام محصول و فروشگاه" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-primary-50 dark:bg-primary-900/50 text-sm text-left font-latin text-primary-500 dark:!text-white cursor-not-allowed shadow-none" />
                                <p className="text-xs text-primary-400 mt-1">نامک به‌صورت خودکار از نام محصول و نام فروشگاه ساخته می‌شود و قابل ویرایش نیست.</p>
                              </div>
                              
                              <div className="rounded-xl border border-primary-200 dark:border-white/15 bg-primary-50/50 dark:bg-primary-950/40 p-3">
                                <label className="flex items-start gap-2.5 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="mt-1 rounded border-primary-300"
                                    checked={!!sellerProductForm.multiVariant}
                                    onChange={(e) => setSellerProductForm(f => ({
                                      ...f,
                                      multiVariant: e.target.checked,
                                      ...(e.target.checked ? { price: '' } : {}),
                                    }))}
                                  />
                                  <span>
                                    <span className="text-sm font-medium text-primary-900 dark:text-white">محصولات من دارای چند رنگ، سایز یا قیمت مختلف است</span>
                                    <span className="block text-xs text-primary-500 dark:text-white/60 mt-0.5">با فعال‌سازی، قیمت واحد در این مرحله مخفی می‌شود و تنظیم قیمت/موجودی در مرحله واریانت اجباری خواهد بود.</span>
                                  </span>
                                </label>
                              </div>
                              {!sellerProductForm.multiVariant && (
                              <div>
                                <label className="text-xs text-primary-500 mb-1 block">قیمت (تومان)</label>
                                <input value={sellerProductForm.price} onChange={e => setSellerProductForm(f => ({ ...f, price: onlyDigits(e.target.value) }))} dir="ltr" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue shadow-none" />
                              </div>
                              )}
                              {!!sellerProductForm.multiVariant && (
                                <p className="text-xs text-apple-blue dark:text-[#4CCD99]">قیمت واحد غیرفعال است — در مرحله واریانت برای هر ترکیب قیمت بگذارید.</p>
                              )}


                              </div>
                              )}
                              {sellerProductStep === 2 && !sellerProductForm.multiVariant && (
                              <div className="space-y-4">
                              <p className="text-sm font-bold text-primary-900 dark:text-white mb-3">۲. توضیحات محصول به همراه پیشنهاد لینک داخلی (فقط محصولات شما)</p>

                              <div>
                                <label className="text-xs text-primary-500 mb-1 block">توضیحات محصول <span className="text-red-500">(بدون لینک خارجی)</span></label>
                                <SimpleEditor
                                  value={sellerProductForm.desc || ''}
                                  onChange={(html) => setSellerProductForm(f => ({ ...f, desc: html }))}
                                  placeholder="توضیح کامل محصول را بنویسید…"
                                  appearance="comment"
                                  maxLength={2000}
                                  allowTable={false}
                                />
                                <p className="text-xs text-primary-400 mt-1">{sellerProductForm.desc ? `${toFa(htmlToPlain(sellerProductForm.desc).length)} نویسه` : 'حداکثر ۲۰۰۰ نویسه · قالب‌بندی متن مجاز است'}</p>
                                {(() => {
                                  const linkIdeas = suggestInternalLinks({ focusKeywords: sellerProductForm.seoFocusKeywords || '', bodyText: sellerProductForm.desc || '', sellerLimited: true, sellerId: sellerUser?.id || 'own' });
                                  if (!linkIdeas.length) return null;
                                  return (
                                    <div className="mt-3 rounded-xl border border-primary-100 dark:border-white/10 bg-primary-50/50 dark:bg-primary-900/40 p-3 space-y-2">
                                      <p className="text-xs font-bold text-primary-800 dark:text-white">پیشنهاد لینک داخلی (فقط محصولات شما)</p>
                                      <p className="text-xs text-primary-500 dark:text-white/70">تنها لینک مجاز در توضیح محصول، لینک به محصولات خودتان است.</p>
                                      <ul className="space-y-1">
                                        {linkIdeas.map(l => (
                                          <li key={l.id} className="text-xs flex items-center justify-between gap-2">
                                            <span className="text-primary-800 dark:text-white truncate">{l.name}</span>
                                            <button
                                              type="button"
                                              className="text-apple-blue shrink-0 text-xs font-medium"
                                              onClick={() => {
                                                const a = `<a href="${l.path}">${l.name}</a>`;
                                                setSellerProductForm(f => ({ ...f, desc: (f.desc || '') + (f.desc ? ' ' : '') + a }));
                                                showToast({ message: 'لینک داخلی اضافه شد', variant: 'success', duration: 3000, position: 'top-center' });
                                              }}
                                            >درج در توضیح</button>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  );
                                })()}
                              </div>

                              </div>
                              )}
                              {sellerProductStep === 3 && !sellerProductForm.multiVariant && (
                              <div className="space-y-4">
                              <p className="text-sm font-bold text-primary-900 dark:text-white mb-3">۳. تصاویر محصول(به همراه تگ آلت برای هر تصویری که داره آپلود میشه)و مشخص کردن این که کدوم تصویر - تصویر شاخص هستش</p>

                              <div>
                                <label className="text-xs text-primary-500 mb-1 block">تصاویر محصول (حداکثر ۸ · یکی شاخص · فقط WebP · ۸۰۰×۱۰۰۰ · حداکثر ۱۰۰KB)</label>
                                <div className="flex flex-wrap gap-3 mb-2">
                                  {(sellerProductForm.images || []).map((im, idx) => (
                                    <div key={idx} className="w-[7.5rem] space-y-1.5">
                                      <div className="relative w-full aspect-[4/5] rounded-lg overflow-hidden border border-primary-200 dark:border-white/20">
                                        <img src={im} alt={(sellerProductForm.imageAlts || [])[idx] || sellerProductForm.imageAlt || ''} className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => setSellerProductForm(f => ({ ...f, featuredImageIndex: idx, imageAlt: (f.imageAlts || [])[idx] || f.imageAlt || '', seoOgImage: (f.images || [])[idx] || f.seoOgImage }))} className={`absolute top-0.5 right-0.5 text-xs px-1 rounded ${(sellerProductForm.featuredImageIndex || 0) === idx ? 'bg-apple-blue text-white' : 'bg-black/50 text-white'}`}>شاخص</button>
                                        <button type="button" onClick={() => setSellerProductForm(f => {
                                          const imgs = (f.images || []).filter((_, i) => i !== idx);
                                          const alts = [...(f.imageAlts || [])];
                                          alts.splice(idx, 1);
                                          const feat = Math.min(f.featuredImageIndex || 0, Math.max(0, imgs.length - 1));
                                          return { ...f, images: imgs, imageAlts: alts, featuredImageIndex: feat, imageAlt: alts[feat] || '' };
                                        })} className="absolute bottom-0.5 left-0.5 bg-red-500 text-white text-xs px-1 rounded">حذف</button>
                                      </div>
                                      <input
                                        value={(sellerProductForm.imageAlts || [])[idx] || ''}
                                        onChange={e => setSellerProductForm(f => {
                                          const alts = [...(f.imageAlts || [])];
                                          while (alts.length < (f.images || []).length) alts.push('');
                                          alts[idx] = e.target.value;
                                          const feat = f.featuredImageIndex || 0;
                                          return { ...f, imageAlts: alts, imageAlt: feat === idx ? e.target.value : (alts[feat] || f.imageAlt || '') };
                                        })}
                                        placeholder="تگ Alt تصویر"
                                        className="w-full px-2 py-1 rounded-lg border border-primary-200 dark:border-white/20 bg-transparent text-xs text-primary-900 dark:text-white"
                                      />
                                    </div>
                                  ))}
                                  {(sellerProductForm.images || []).length < 8 && (
                                    <label className="w-[7.5rem] aspect-[4/5] rounded-lg border border-dashed border-primary-300 dark:border-white/30 flex items-center justify-center text-xs text-primary-500 cursor-pointer">
                                      + افزودن
                                      <input type="file" accept="image/webp,image/jpeg,image/png,image/jpg" className="hidden" onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        try {
                                          const dataUrl = await processProductImageFile(file, { folder: 'seller' });
                                          if (dataUrl.length * 0.75 > PRODUCT_IMG.maxBytes) {
                                            showToast({ message: 'خروجی WebP از حد مجاز (~۶۵KB) بیشتر شد. از ابزار برش دقیق‌تر استفاده کنید.', variant: 'default', duration: 4500, position: 'top-center' });
                                            e.target.value = '';
                                            return;
                                          }
                                          setSellerProductForm(f => ({ ...f, images: [...(f.images || []), dataUrl].slice(0, 8), imageAlts: [...(f.imageAlts || []), ''].slice(0, 8) }));
                                        } catch (err) { showToast({ message: String(err.message || 'خطا'), variant: 'error', duration: 4500, position: 'top-center' }); }
                                        e.target.value = '';
                                      }} />
                                    </label>
                                  )}
                                </div>
                                <p className="text-xs text-primary-400">برای هر تصویر تگ Alt بنویسید · روی «شاخص» بزنید تا تصویر اصلی صفحه شود</p>
                              </div>

                              </div>
                              )}
                              {sellerProductStep === 4 && (
                              <div className="space-y-4">
                              <p className="text-sm font-bold text-primary-900 dark:text-white mb-3">۴. دسته‌بندی</p>

                              <div>
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <label className="text-xs text-primary-500">دسته‌بندی <span className="text-primary-400">(حداکثر ۳ · از پنل ادمین)</span></label>
                                  <button type="button" onClick={() => { setSellerTaxonomySearch(''); setSellerTaxonomyPicker('cats'); }} className="text-xs text-apple-blue hover:underline font-medium">مشاهده همه</button>
                                </div>
                                <div className="flex gap-2 flex-wrap min-h-[2rem]">
                                  {(sellerProductForm.categories || []).length === 0 && (
                                    <span className="text-xs text-primary-400">هنوز دسته‌ای انتخاب نشده</span>
                                  )}
                                  {(sellerProductForm.categories || []).map((name) => (
                                    <button
                                      key={name}
                                      type="button"
                                      onClick={() => setSellerProductForm((f) => {
                                        const next = (f.categories || []).filter((x) => x !== name);
                                        return { ...f, categories: next, category: next[0] || '' };
                                      })}
                                      className="px-3 py-1.5 rounded-full text-xs border bg-apple-blue text-white border-apple-blue inline-flex items-center gap-1"
                                    >
                                      {name} <span className="opacity-80">×</span>
                                    </button>
                                  ))}
                                </div>
                                <p className="text-xs text-primary-400 mt-1">{toFa((sellerProductForm.categories || []).length)}/۳ انتخاب شده</p>
                              </div>

                              </div>
                              )}
                              
                              {sellerProductStep === 5 && (
                              <div className="space-y-4">
                              <p className="text-sm font-bold text-primary-900 dark:text-white mb-3">۵. انتخاب برند</p>
                              <p className="text-xs text-primary-500 dark:text-white/70 -mt-2">برند اجباری است و فقط از فهرست تعریف‌شده در پنل ادمین انتخاب می‌شود.</p>
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <label className="text-xs text-primary-500">برند <span className="text-red-500">*</span></label>
                                  <button type="button" onClick={() => { setSellerTaxonomySearch(''); setSellerTaxonomyPicker('brand'); }} className="text-xs text-apple-blue hover:underline font-medium">مشاهده همه</button>
                                </div>
                                <div className="flex flex-wrap gap-1.5 min-h-[2.5rem]">
                                  {(adminCatalogBrands || []).filter(b => b.active !== false).length === 0 ? (
                                    <span className="text-xs text-amber-600 dark:text-amber-400">هنوز برندی در پنل ادمین تعریف نشده — از ادمین بخواهید برند اضافه کند.</span>
                                  ) : (
                                    (adminCatalogBrands || []).filter(b => b.active !== false).map(b => (
                                      <button
                                        key={b.id}
                                        type="button"
                                        onClick={() => setSellerProductForm(f => (
                                          f.brandId === b.id
                                            ? { ...f, brandId: '', brandName: '' }
                                            : { ...f, brandId: b.id, brandName: b.name }
                                        ))}
                                        className={`px-3 py-1.5 rounded-full text-xs border transition ${
                                          sellerProductForm.brandId === b.id
                                            ? 'bg-primary-800 text-white border-primary-800 dark:bg-[#4CCD99] dark:border-[#4CCD99]'
                                            : 'border-primary-200 dark:border-white/25 text-primary-800 dark:text-white hover:border-apple-blue'
                                        }`}
                                      >
                                        {b.name}
                                      </button>
                                    ))
                                  )}
                                </div>
                              </div>
                              </div>
                              )}

                              {sellerProductStep === 6 && (
                              <div className="space-y-4">
                              <p className="text-sm font-bold text-primary-900 dark:text-white mb-3">۵. برچسب</p>

                              <div>
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <label className="text-xs text-primary-500">برچسب <span className="text-primary-400">(حداکثر ۳ · از پنل ادمین)</span></label>
                                  <button type="button" onClick={() => { setSellerTaxonomySearch(''); setSellerTaxonomyPicker('tags'); }} className="text-xs text-apple-blue hover:underline font-medium">مشاهده همه</button>
                                </div>
                                <div className="flex gap-2 flex-wrap min-h-[2rem]">
                                  {(sellerProductForm.tags || []).length === 0 && (
                                    <span className="text-xs text-primary-400">هنوز برچسبی انتخاب نشده</span>
                                  )}
                                  {(sellerProductForm.tags || []).map((name) => (
                                    <button
                                      key={name}
                                      type="button"
                                      onClick={() => setSellerProductForm((f) => ({ ...f, tags: (f.tags || []).filter((x) => x !== name) }))}
                                      className="px-3 py-1.5 rounded-full text-xs border bg-apple-blue text-white border-apple-blue inline-flex items-center gap-1"
                                    >
                                      {name} <span className="opacity-80">×</span>
                                    </button>
                                  ))}
                                </div>
                                <p className="text-xs text-primary-400 mt-1">{toFa((sellerProductForm.tags || []).length)}/۳</p>
                              </div>

                              </div>
                              )}
                              {sellerProductStep === 7 && !sellerProductForm.multiVariant && (
                              <div className="space-y-4">
                              <p className="text-sm font-bold text-primary-900 dark:text-white mb-3">۶. موجودی پایه</p>

                              <div><label className="text-xs text-primary-500 mb-1 block">موجودی پایه</label><input value={sellerProductForm.stock} onChange={e => setSellerProductForm(f => ({ ...f, stock: onlyDigits(e.target.value) }))} dir="ltr" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue shadow-none" /></div>

                              </div>
                              )}
                              {sellerProductStep === 8 && !sellerProductForm.multiVariant && (
                              <div className="space-y-4">
                              <p className="text-sm font-bold text-primary-900 dark:text-white mb-3">۷. رنگ‌ها</p>

                              <div>
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <label className="text-xs text-primary-500">رنگ‌ها <span className="text-primary-400">(حداقل ۱ · از پنل ادمین)</span></label>
                                  <button type="button" onClick={() => { setSellerTaxonomySearch(''); setSellerTaxonomyPicker('colors'); }} className="text-xs text-apple-blue hover:underline font-medium">مشاهده همه</button>
                                </div>
                                <div className="flex flex-wrap gap-1.5 min-h-[2rem]">
                                  {(sellerProductForm.colorIds || []).length === 0 && <span className="text-xs text-primary-400">رنگی انتخاب نشده</span>}
                                  {(sellerProductForm.colorIds || []).map(cid => {
                                    const col = (adminCatalogColors || []).find(c => c.id === cid);
                                    if (!col) return null;
                                    return (
                                      <button key={cid} type="button" onClick={() => setSellerProductForm(f => ({ ...f, colorIds: (f.colorIds || []).filter(id => id !== cid), variants: [] }))} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs border bg-primary-800 text-white border-primary-800 dark:bg-[#4CCD99] dark:border-[#4CCD99]">
                                        <span className="color-swatch w-3.5 h-3.5 rounded-full border border-white/60 flex-shrink-0" style={{ ["--swatch-color"]: col.hex || '#888', backgroundColor: col.hex || '#888' }} />
                                        {col.name} <span className="opacity-80">×</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              </div>
                              )}
                              {sellerProductStep === 9 && !sellerProductForm.multiVariant && (
                              <div className="space-y-4">
                              <p className="text-sm font-bold text-primary-900 dark:text-white mb-3">۸. سایزها</p>

                              <div>
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <label className="text-xs text-primary-500">سایزها <span className="text-primary-400">(حداقل ۱ · از پنل ادمین)</span></label>
                                  <button type="button" onClick={() => { setSellerTaxonomySearch(''); setSellerTaxonomyPicker('sizes'); }} className="text-xs text-apple-blue hover:underline font-medium">مشاهده همه</button>
                                </div>
                                <div className="flex flex-wrap gap-1.5 min-h-[2rem]">
                                  {(sellerProductForm.sizes || []).length === 0 && <span className="text-xs text-primary-400">سایزی انتخاب نشده</span>}
                                  {(sellerProductForm.sizes || []).map(sz => (
                                    <button key={sz} type="button" dir="ltr" onClick={() => setSellerProductForm(f => ({ ...f, sizes: (f.sizes || []).filter(s => s !== sz), variants: [] }))} className="latin-label min-w-[2.5rem] px-2.5 py-1.5 rounded-full text-xs border font-semibold bg-primary-800 text-white border-primary-800 dark:bg-[#4CCD99] dark:border-[#4CCD99]">{sz} ×</button>
                                  ))}
                                </div>
                              </div>

                              </div>
                              )}
                              {sellerProductStep === 10 && !sellerProductForm.multiVariant && (
                              <div className="space-y-4">
                              <p className="text-sm font-bold text-primary-900 dark:text-white mb-3">۱۰. ویژگی‌ها</p>
                              <p className="text-xs text-primary-500 dark:text-white/70 -mt-2 mb-1 whitespace-nowrap shrink-0">تنظیم واریانت فقط در پنل فروشنده است. ادمین فقط رنگ، سایز و ویژگی‌های پایه را تعریف می‌کند.</p>
                              <div className="space-y-3 pt-1">
                                <p className="text-xs font-bold text-primary-600 dark:text-white/70">ویژگی‌ها <span className="font-normal text-primary-400">(برش، یقه، آستین، طرح و … · از پنل ادمین)</span></p>
                                {(adminCatalogAttributes || []).filter(attr => {
                                  if (attr.active === false) return false;
                                  const cats = sellerProductForm.categories || [];
                                  const limited = attr.categoryNames || [];
                                  if (!limited.length) return true;
                                  return cats.some(c => limited.includes(c));
                                }).map(attr => {
                                  const cur = (sellerProductForm.attributes || {})[attr.id];
                                  const selected = attr.multi
                                    ? (Array.isArray(cur) ? cur : (cur ? [cur] : []))
                                    : (cur ? [cur] : []);
                                  return (
                                    <div key={attr.id}>
                                      <div className="flex items-center justify-between gap-2 mb-1">
                                        <label className="text-xs text-primary-500">
                                          {attr.name}
                                          {attr.required ? <span className="text-red-500"> *</span> : null}
                                        </label>
                                        <button type="button" onClick={() => { setSellerTaxonomySearch(''); setSellerTaxonomyPicker({ type: 'attr', id: attr.id }); }} className="text-xs text-apple-blue hover:underline font-medium">مشاهده همه</button>
                                      </div>
                                      <div className="flex flex-wrap gap-1.5 min-h-[1.75rem]">
                                        {selected.length === 0 && <span className="text-xs text-primary-400">انتخاب نشده</span>}
                                        {selected.map(val => (
                                          <button
                                            key={val}
                                            type="button"
                                            onClick={() => setSellerProductForm(f => {
                                              const attrs = { ...(f.attributes || {}) };
                                              if (attr.multi) {
                                                const next = selected.filter(v => v !== val);
                                                if (next.length) attrs[attr.id] = next; else delete attrs[attr.id];
                                              } else {
                                                delete attrs[attr.id];
                                              }
                                              return { ...f, attributes: attrs, variants: [] };
                                            })}
                                            className="px-2.5 py-1 rounded-full text-xs border bg-primary-800 text-white border-primary-800 dark:bg-[#4CCD99] dark:border-[#4CCD99] inline-flex items-center gap-1"
                                          >
                                            {val} <span className="opacity-80">×</span>
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                                {!(adminCatalogAttributes || []).filter(attr => {
                                  if (attr.active === false) return false;
                                  const cats = sellerProductForm.categories || [];
                                  const limited = attr.categoryNames || [];
                                  if (!limited.length) return true;
                                  return cats.some(c => limited.includes(c));
                                }).length && (
                                  <p className="text-xs text-primary-400">برای دسته‌های انتخاب‌شده ویژگی‌ای تعریف نشده است.</p>
                                )}
                              </div>
                              </div>
                              )}

                              {sellerProductStep === 11 && !!sellerProductForm.multiVariant && (
                              <div className="space-y-4">
                              <p className="text-sm font-bold text-primary-900 dark:text-white mb-3">۱۱. واریانت‌ها (رنگ × سایز × ویژگی)</p>
                              <div className="rounded-xl border border-dashed border-primary-200 dark:border-white/20 p-3 space-y-2">
                                <p className="text-xs font-bold text-primary-800 dark:text-white">انتخاب سریع رنگ و سایز (برای ساخت واریانت)</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {(adminCatalogColors || []).filter(c => c.active !== false).map(c => (
                                    <button key={c.id} type="button"
                                      onClick={() => setSellerProductForm(f => {
                                        const ids = f.colorIds || [];
                                        const next = ids.includes(c.id) ? ids.filter(x => x !== c.id) : [...ids, c.id];
                                        return { ...f, colorIds: next, variants: [] };
                                      })}
                                      className={`px-2.5 py-1 rounded-full text-xs border ${ (sellerProductForm.colorIds||[]).includes(c.id) ? 'bg-primary-800 text-white border-primary-800' : 'border-primary-200 dark:border-white/25' }`}
                                    >{c.name}</button>
                                  ))}
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {(adminCatalogSizes || []).filter(s => s.active !== false).map(s => (
                                    <button key={s.id || s.name} type="button" dir="ltr"
                                      onClick={() => setSellerProductForm(f => {
                                        const sz = f.sizes || [];
                                        const next = sz.includes(s.name) ? sz.filter(x => x !== s.name) : [...sz, s.name];
                                        return { ...f, sizes: next, variants: [] };
                                      })}
                                      className={`px-2.5 py-1 rounded-full text-xs border font-semibold ${ (sellerProductForm.sizes||[]).includes(s.name) ? 'bg-primary-800 text-white border-primary-800' : 'border-primary-200 dark:border-white/25' }`}
                                    >{s.name}</button>
                                  ))}
                                </div>
                              </div>

                              <p className="text-xs text-primary-500 dark:text-white/70 -mt-2">
                                {sellerProductForm.multiVariant
                                  ? 'چون محصول چندقیمتی است، ساخت جدول واریانت و تعیین قیمت هر ردیف الزامی است.'
                                  : 'واریانت اختیاری است. در صورت نیاز جدول را بسازید.'}
                              </p>
                              <div className="rounded-xl border border-primary-200 dark:border-white/15 bg-primary-50/40 dark:bg-primary-950/40 p-3 space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div>
                                    <p className="text-xs font-bold text-primary-900 dark:text-white">واریانت‌ها (رنگ × سایز × ویژگی‌ها)</p>
                                    <p className="text-xs text-primary-500">اول رنگ، سایز و ویژگی‌ها را انتخاب کنید؛ سپس با دکمه زیر، جدول را بسازید و برای هر ترکیب قیمت و موجودی بگذارید. خودکار ساخته نمی‌شود.</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const colors = (sellerProductForm.colorIds || []).length;
                                      const sizes = (sellerProductForm.sizes || []).length;
                                      if (!colors || !sizes) {
                                        showToast({ message: 'اول حداقل یک رنگ و یک سایز انتخاب کنید (مراحل ۸ و ۹)', variant: 'error', duration: 4000, position: 'top-center' });
                                        return;
                                      }
                                      setSellerProductForm(f => {
                                        const rows = syncFormVariants(f);
                                        try {
                                          showToast({
                                            message: rows.length
                                              ? `جدول واریانت با ${rows.length} ترکیب ساخته شد — قیمت و موجودی هر ردیف را تنظیم کنید`
                                              : 'ترکیبی ساخته نشد؛ رنگ، سایز یا ویژگی را بررسی کنید',
                                            variant: rows.length ? 'success' : 'error',
                                            duration: 4500,
                                            position: 'top-center',
                                          });
                                        } catch (_) {}
                                        return { ...f, variants: rows };
                                      });
                                    }}
                                    className="text-xs px-3 py-1.5 rounded-full border border-primary-200 dark:border-white/25 text-primary-800 dark:text-white hover:bg-white/50 dark:hover:bg-primary-800"
                                  >ساخت جدول واریانت</button>
                                </div>
                                {(() => {
                                  const rows = (sellerProductForm.variants && sellerProductForm.variants.length)
                                    ? sellerProductForm.variants
                                    : syncFormVariants(sellerProductForm);
                                  return (
                                    <div className="space-y-2 max-h-80 overflow-y-auto pr-0.5">
                                      {rows.map((row, ri) => (
                                        <div key={row.id || ri} className="rounded-xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 p-3 space-y-2">
                                          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-primary-900 dark:text-white">
                                            <span className="px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-800">رنگ: {row.color}</span>
                                            <span className="px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-800 font-latin" dir="ltr">سایز: {row.size}</span>
                                            {getAttrDimensions(sellerProductForm.attributes || {}, adminCatalogAttributes || []).map(d => (
                                              <span key={d.id} className="px-2 py-0.5 rounded-full border border-primary-200 dark:border-white/20 text-primary-700 dark:text-white/90">
                                                {d.name}: {(row.attrs || {})[d.id] || '—'}
                                              </span>
                                            ))}
                                          </div>
                                          <div className="grid grid-cols-2 gap-2">
                                            <div>
                                              <label className="text-[10px] text-primary-500 block mb-0.5">قیمت</label>
                                              <input
                                                dir="ltr"
                                                value={row.price ?? ''}
                                                onChange={e => {
                                                  const val = onlyDigits(e.target.value);
                                                  setSellerProductForm(f => {
                                                    const base = (f.variants && f.variants.length) ? f.variants : syncFormVariants(f);
                                                    const next = base.map((r, i) => i === ri ? { ...r, price: val } : r);
                                                    return { ...f, variants: next };
                                                  });
                                                }}
                                                className="w-full px-2 py-1.5 rounded-lg border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left text-primary-900 dark:text-white"
                                              />
                                            </div>
                                            <div>
                                              <label className="text-[10px] text-primary-500 block mb-0.5">موجودی</label>
                                              <input
                                                dir="ltr"
                                                value={row.stock ?? ''}
                                                onChange={e => {
                                                  const val = onlyDigits(e.target.value);
                                                  setSellerProductForm(f => {
                                                    const base = (f.variants && f.variants.length) ? f.variants : syncFormVariants(f);
                                                    const next = base.map((r, i) => i === ri ? { ...r, stock: val } : r);
                                                    return { ...f, variants: next };
                                                  });
                                                }}
                                                className="w-full px-2 py-1.5 rounded-lg border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left text-primary-900 dark:text-white"
                                              />
                                            </div>
                                          </div>
                                          <div>
                                            <label className="text-[10px] text-primary-500 block mb-0.5">توضیح کوتاه (اختیاری)</label>
                                            <input
                                              value={row.note || ''}
                                              maxLength={300}
                                              placeholder="حداکثر ۳۰۰ نویسه"
                                              onChange={e => {
                                                const val = e.target.value.slice(0, 300);
                                                setSellerProductForm(f => {
                                                  const base = (f.variants && f.variants.length) ? f.variants : syncFormVariants(f);
                                                  const next = base.map((r, i) => i === ri ? { ...r, note: val } : r);
                                                  return { ...f, variants: next };
                                                });
                                              }}
                                              className="w-full px-2 py-1.5 rounded-lg border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white"
                                            />
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {row.image ? (
                                              <div className="relative w-12 h-14 rounded-lg overflow-hidden border border-primary-200 dark:border-white/20 flex-shrink-0">
                                                <img src={row.image} alt="" className="w-full h-full object-cover" />
                                                <button type="button" className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] py-0.5" onClick={() => setSellerProductForm(f => {
                                                  const base = (f.variants && f.variants.length) ? f.variants : syncFormVariants(f);
                                                  return { ...f, variants: base.map((r, i) => i === ri ? { ...r, image: '' } : r) };
                                                })}>حذف</button>
                                              </div>
                                            ) : null}
                                            <label className="text-[11px] px-2.5 py-1.5 rounded-full border border-dashed border-primary-300 dark:border-white/30 cursor-pointer text-primary-600 dark:text-white/80">
                                              {row.image ? 'عوض کردن عکس' : '+ عکس واریانت'}
                                              <input type="file" accept="image/webp,image/jpeg,image/png,image/jpg" className="hidden" onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                try {
                                                  const dataUrl = await processProductImageFile(file, { folder: 'seller' });
                                                  setSellerProductForm(f => {
                                                    const base = (f.variants && f.variants.length) ? f.variants : syncFormVariants(f);
                                                    return { ...f, variants: base.map((r, i) => i === ri ? { ...r, image: dataUrl } : r) };
                                                  });
                                                } catch (err) { showToast({ message: String(err.message || 'خطا'), variant: 'error', duration: 4000, position: 'top-center' }); }
                                                e.target.value = '';
                                              }} />
                                            </label>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })()}
                              </div>
                              </div>
                              )}

                              {sellerProductStep === 12 && (
                              <div className="space-y-4">
                              <p className="text-sm font-bold text-primary-900 dark:text-white mb-3">۱۰. ویدیو آپارات</p>


                              <div>
                                <label className="text-xs text-primary-500 mb-1 block">ویدیو آپارات (تنها لینک مجاز فروشنده · فقط embed)</label>
                                <input value={sellerProductForm.aparatEmbed || ''} onChange={e => setSellerProductForm(f => ({ ...f, aparatEmbed: e.target.value }))} dir="ltr" placeholder="https://www.aparat.com/video/video/embed/videohash/..." className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-xs text-left font-latin text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue" />
                              </div>

                              <p className="text-xs text-primary-500 dark:text-white/70 rounded-xl border border-primary-100 dark:border-white/10 bg-primary-50/50 dark:bg-primary-950/40 p-3">تا این مرحله می‌توانید محصول را منتشر یا به‌روزرسانی کنید. مراحل بعدی اختیاری است اما برای سئو بهتر است تکمیل شوند.</p>
                              </div>
                              )}
                              {sellerProductStep === 13 && (
                              <div className="space-y-3">
                              {renderContentSeoBox({
                                mode: 'product',
                                sellerLimited: true,
                                sellerId: sellerUser?.id || 'own',
                                title: sellerProductForm.seoTitle || '',
                                description: sellerProductForm.seoDescription || '',
                                focusKeywords: sellerProductForm.seoFocusKeywords || '',
                                ogImage: sellerProductForm.seoOgImage || (sellerProductForm.images || [])[sellerProductForm.featuredImageIndex || 0] || (sellerProductForm.images || [])[0] || '',
                                imageAlt: sellerProductForm.imageAlt || (sellerProductForm.imageAlts || [])[sellerProductForm.featuredImageIndex || 0] || '',
                                bodyText: sellerProductForm.desc || '',
                                contentTitle: sellerProductForm.name || '',
                                hasImage: (sellerProductForm.images || []).length > 0 || !!sellerProductForm.seoOgImage,
                                imageHasAlt: !!(sellerProductForm.imageAlt || '').trim() || (sellerProductForm.imageAlts || []).some(Boolean),
                                faqItems: sellerProductForm.seoFaq || [],
                                onFaqChange: (items) => setSellerProductForm(f => ({ ...f, seoFaq: items })),
                                onChange: (patch) => setSellerProductForm(f => ({
                                  ...f,
                                  seoTitle: patch.title != null ? patch.title : f.seoTitle,
                                  seoDescription: patch.description != null ? patch.description : f.seoDescription,
                                  seoFocusKeywords: patch.focusKeywords != null ? patch.focusKeywords : f.seoFocusKeywords,
                                  seoOgImage: patch.ogImage != null ? patch.ogImage : f.seoOgImage,
                                  imageAlt: patch.imageAlt != null ? patch.imageAlt : f.imageAlt,
                                })),
                                previewUrl: (seoCfg().canonicalBase || 'https://pirahanemardane.ir').replace(/\/$/, '') + '/product/' + (sellerProductForm.slug || productSlugFromNameAndShop(sellerProductForm.name, sellerUser?.shopName || sellerUser?.name || '') || '…'),

                                analysisOnly: true,
                              })}
                              {renderContentSeoBox({
                                mode: 'product',
                                sellerLimited: true,
                                sellerId: sellerUser?.id || 'own',
                                title: sellerProductForm.seoTitle || '',
                                description: sellerProductForm.seoDescription || '',
                                focusKeywords: sellerProductForm.seoFocusKeywords || '',
                                ogImage: sellerProductForm.seoOgImage || (sellerProductForm.images || [])[sellerProductForm.featuredImageIndex || 0] || (sellerProductForm.images || [])[0] || '',
                                imageAlt: sellerProductForm.imageAlt || (sellerProductForm.imageAlts || [])[sellerProductForm.featuredImageIndex || 0] || '',
                                bodyText: sellerProductForm.desc || '',
                                contentTitle: sellerProductForm.name || '',
                                hasImage: (sellerProductForm.images || []).length > 0 || !!sellerProductForm.seoOgImage,
                                imageHasAlt: !!(sellerProductForm.imageAlt || '').trim() || (sellerProductForm.imageAlts || []).some(Boolean),
                                faqItems: sellerProductForm.seoFaq || [],
                                onFaqChange: (items) => setSellerProductForm(f => ({ ...f, seoFaq: items })),
                                onChange: (patch) => setSellerProductForm(f => ({
                                  ...f,
                                  seoTitle: patch.title != null ? patch.title : f.seoTitle,
                                  seoDescription: patch.description != null ? patch.description : f.seoDescription,
                                  seoFocusKeywords: patch.focusKeywords != null ? patch.focusKeywords : f.seoFocusKeywords,
                                  seoOgImage: patch.ogImage != null ? patch.ogImage : f.seoOgImage,
                                  imageAlt: patch.imageAlt != null ? patch.imageAlt : f.imageAlt,
                                })),
                                previewUrl: (seoCfg().canonicalBase || 'https://pirahanemardane.ir').replace(/\/$/, '') + '/product/' + (sellerProductForm.slug || productSlugFromNameAndShop(sellerProductForm.name, sellerUser?.shopName || sellerUser?.name || '') || '…'),

                                sellerStep2: true,
                                seoPart: 'keywords',
                              })}
                              </div>

                              )}
                              {sellerProductStep === 14 && (
                              <div className="space-y-3">
                              {renderContentSeoBox({
                                mode: 'product',
                                sellerLimited: true,
                                sellerId: sellerUser?.id || 'own',
                                title: sellerProductForm.seoTitle || '',
                                description: sellerProductForm.seoDescription || '',
                                focusKeywords: sellerProductForm.seoFocusKeywords || '',
                                ogImage: sellerProductForm.seoOgImage || (sellerProductForm.images || [])[sellerProductForm.featuredImageIndex || 0] || (sellerProductForm.images || [])[0] || '',
                                imageAlt: sellerProductForm.imageAlt || (sellerProductForm.imageAlts || [])[sellerProductForm.featuredImageIndex || 0] || '',
                                bodyText: sellerProductForm.desc || '',
                                contentTitle: sellerProductForm.name || '',
                                hasImage: (sellerProductForm.images || []).length > 0 || !!sellerProductForm.seoOgImage,
                                imageHasAlt: !!(sellerProductForm.imageAlt || '').trim() || (sellerProductForm.imageAlts || []).some(Boolean),
                                faqItems: sellerProductForm.seoFaq || [],
                                onFaqChange: (items) => setSellerProductForm(f => ({ ...f, seoFaq: items })),
                                onChange: (patch) => setSellerProductForm(f => ({
                                  ...f,
                                  seoTitle: patch.title != null ? patch.title : f.seoTitle,
                                  seoDescription: patch.description != null ? patch.description : f.seoDescription,
                                  seoFocusKeywords: patch.focusKeywords != null ? patch.focusKeywords : f.seoFocusKeywords,
                                  seoOgImage: patch.ogImage != null ? patch.ogImage : f.seoOgImage,
                                  imageAlt: patch.imageAlt != null ? patch.imageAlt : f.imageAlt,
                                })),
                                previewUrl: (seoCfg().canonicalBase || 'https://pirahanemardane.ir').replace(/\/$/, '') + '/product/' + (sellerProductForm.slug || productSlugFromNameAndShop(sellerProductForm.name, sellerUser?.shopName || sellerUser?.name || '') || '…'),

                                analysisOnly: true,
                              })}
                              {renderContentSeoBox({
                                mode: 'product',
                                sellerLimited: true,
                                sellerId: sellerUser?.id || 'own',
                                title: sellerProductForm.seoTitle || '',
                                description: sellerProductForm.seoDescription || '',
                                focusKeywords: sellerProductForm.seoFocusKeywords || '',
                                ogImage: sellerProductForm.seoOgImage || (sellerProductForm.images || [])[sellerProductForm.featuredImageIndex || 0] || (sellerProductForm.images || [])[0] || '',
                                imageAlt: sellerProductForm.imageAlt || (sellerProductForm.imageAlts || [])[sellerProductForm.featuredImageIndex || 0] || '',
                                bodyText: sellerProductForm.desc || '',
                                contentTitle: sellerProductForm.name || '',
                                hasImage: (sellerProductForm.images || []).length > 0 || !!sellerProductForm.seoOgImage,
                                imageHasAlt: !!(sellerProductForm.imageAlt || '').trim() || (sellerProductForm.imageAlts || []).some(Boolean),
                                faqItems: sellerProductForm.seoFaq || [],
                                onFaqChange: (items) => setSellerProductForm(f => ({ ...f, seoFaq: items })),
                                onChange: (patch) => setSellerProductForm(f => ({
                                  ...f,
                                  seoTitle: patch.title != null ? patch.title : f.seoTitle,
                                  seoDescription: patch.description != null ? patch.description : f.seoDescription,
                                  seoFocusKeywords: patch.focusKeywords != null ? patch.focusKeywords : f.seoFocusKeywords,
                                  seoOgImage: patch.ogImage != null ? patch.ogImage : f.seoOgImage,
                                  imageAlt: patch.imageAlt != null ? patch.imageAlt : f.imageAlt,
                                })),
                                previewUrl: (seoCfg().canonicalBase || 'https://pirahanemardane.ir').replace(/\/$/, '') + '/product/' + (sellerProductForm.slug || productSlugFromNameAndShop(sellerProductForm.name, sellerUser?.shopName || sellerUser?.name || '') || '…'),

                                sellerStep2: true,
                                seoPart: 'title',
                              })}
                              </div>

                              )}
                              {sellerProductStep === 15 && (
                              <div className="space-y-3">
                              {renderContentSeoBox({
                                mode: 'product',
                                sellerLimited: true,
                                sellerId: sellerUser?.id || 'own',
                                title: sellerProductForm.seoTitle || '',
                                description: sellerProductForm.seoDescription || '',
                                focusKeywords: sellerProductForm.seoFocusKeywords || '',
                                ogImage: sellerProductForm.seoOgImage || (sellerProductForm.images || [])[sellerProductForm.featuredImageIndex || 0] || (sellerProductForm.images || [])[0] || '',
                                imageAlt: sellerProductForm.imageAlt || (sellerProductForm.imageAlts || [])[sellerProductForm.featuredImageIndex || 0] || '',
                                bodyText: sellerProductForm.desc || '',
                                contentTitle: sellerProductForm.name || '',
                                hasImage: (sellerProductForm.images || []).length > 0 || !!sellerProductForm.seoOgImage,
                                imageHasAlt: !!(sellerProductForm.imageAlt || '').trim() || (sellerProductForm.imageAlts || []).some(Boolean),
                                faqItems: sellerProductForm.seoFaq || [],
                                onFaqChange: (items) => setSellerProductForm(f => ({ ...f, seoFaq: items })),
                                onChange: (patch) => setSellerProductForm(f => ({
                                  ...f,
                                  seoTitle: patch.title != null ? patch.title : f.seoTitle,
                                  seoDescription: patch.description != null ? patch.description : f.seoDescription,
                                  seoFocusKeywords: patch.focusKeywords != null ? patch.focusKeywords : f.seoFocusKeywords,
                                  seoOgImage: patch.ogImage != null ? patch.ogImage : f.seoOgImage,
                                  imageAlt: patch.imageAlt != null ? patch.imageAlt : f.imageAlt,
                                })),
                                previewUrl: (seoCfg().canonicalBase || 'https://pirahanemardane.ir').replace(/\/$/, '') + '/product/' + (sellerProductForm.slug || productSlugFromNameAndShop(sellerProductForm.name, sellerUser?.shopName || sellerUser?.name || '') || '…'),

                                analysisOnly: true,
                              })}
                              {renderContentSeoBox({
                                mode: 'product',
                                sellerLimited: true,
                                sellerId: sellerUser?.id || 'own',
                                title: sellerProductForm.seoTitle || '',
                                description: sellerProductForm.seoDescription || '',
                                focusKeywords: sellerProductForm.seoFocusKeywords || '',
                                ogImage: sellerProductForm.seoOgImage || (sellerProductForm.images || [])[sellerProductForm.featuredImageIndex || 0] || (sellerProductForm.images || [])[0] || '',
                                imageAlt: sellerProductForm.imageAlt || (sellerProductForm.imageAlts || [])[sellerProductForm.featuredImageIndex || 0] || '',
                                bodyText: sellerProductForm.desc || '',
                                contentTitle: sellerProductForm.name || '',
                                hasImage: (sellerProductForm.images || []).length > 0 || !!sellerProductForm.seoOgImage,
                                imageHasAlt: !!(sellerProductForm.imageAlt || '').trim() || (sellerProductForm.imageAlts || []).some(Boolean),
                                faqItems: sellerProductForm.seoFaq || [],
                                onFaqChange: (items) => setSellerProductForm(f => ({ ...f, seoFaq: items })),
                                onChange: (patch) => setSellerProductForm(f => ({
                                  ...f,
                                  seoTitle: patch.title != null ? patch.title : f.seoTitle,
                                  seoDescription: patch.description != null ? patch.description : f.seoDescription,
                                  seoFocusKeywords: patch.focusKeywords != null ? patch.focusKeywords : f.seoFocusKeywords,
                                  seoOgImage: patch.ogImage != null ? patch.ogImage : f.seoOgImage,
                                  imageAlt: patch.imageAlt != null ? patch.imageAlt : f.imageAlt,
                                })),
                                previewUrl: (seoCfg().canonicalBase || 'https://pirahanemardane.ir').replace(/\/$/, '') + '/product/' + (sellerProductForm.slug || productSlugFromNameAndShop(sellerProductForm.name, sellerUser?.shopName || sellerUser?.name || '') || '…'),

                                sellerStep2: true,
                                seoPart: 'desc',
                              })}
                              </div>

                              )}
                              {sellerProductStep === 16 && (
                              <div className="space-y-3">
                              {renderContentSeoBox({
                                mode: 'product',
                                sellerLimited: true,
                                sellerId: sellerUser?.id || 'own',
                                title: sellerProductForm.seoTitle || '',
                                description: sellerProductForm.seoDescription || '',
                                focusKeywords: sellerProductForm.seoFocusKeywords || '',
                                ogImage: sellerProductForm.seoOgImage || (sellerProductForm.images || [])[sellerProductForm.featuredImageIndex || 0] || (sellerProductForm.images || [])[0] || '',
                                imageAlt: sellerProductForm.imageAlt || (sellerProductForm.imageAlts || [])[sellerProductForm.featuredImageIndex || 0] || '',
                                bodyText: sellerProductForm.desc || '',
                                contentTitle: sellerProductForm.name || '',
                                hasImage: (sellerProductForm.images || []).length > 0 || !!sellerProductForm.seoOgImage,
                                imageHasAlt: !!(sellerProductForm.imageAlt || '').trim() || (sellerProductForm.imageAlts || []).some(Boolean),
                                faqItems: sellerProductForm.seoFaq || [],
                                onFaqChange: (items) => setSellerProductForm(f => ({ ...f, seoFaq: items })),
                                onChange: (patch) => setSellerProductForm(f => ({
                                  ...f,
                                  seoTitle: patch.title != null ? patch.title : f.seoTitle,
                                  seoDescription: patch.description != null ? patch.description : f.seoDescription,
                                  seoFocusKeywords: patch.focusKeywords != null ? patch.focusKeywords : f.seoFocusKeywords,
                                  seoOgImage: patch.ogImage != null ? patch.ogImage : f.seoOgImage,
                                  imageAlt: patch.imageAlt != null ? patch.imageAlt : f.imageAlt,
                                })),
                                previewUrl: (seoCfg().canonicalBase || 'https://pirahanemardane.ir').replace(/\/$/, '') + '/product/' + (sellerProductForm.slug || productSlugFromNameAndShop(sellerProductForm.name, sellerUser?.shopName || sellerUser?.name || '') || '…'),

                                analysisOnly: true,
                              })}
                              {renderContentSeoBox({
                                mode: 'product',
                                sellerLimited: true,
                                sellerId: sellerUser?.id || 'own',
                                title: sellerProductForm.seoTitle || '',
                                description: sellerProductForm.seoDescription || '',
                                focusKeywords: sellerProductForm.seoFocusKeywords || '',
                                ogImage: sellerProductForm.seoOgImage || (sellerProductForm.images || [])[sellerProductForm.featuredImageIndex || 0] || (sellerProductForm.images || [])[0] || '',
                                imageAlt: sellerProductForm.imageAlt || (sellerProductForm.imageAlts || [])[sellerProductForm.featuredImageIndex || 0] || '',
                                bodyText: sellerProductForm.desc || '',
                                contentTitle: sellerProductForm.name || '',
                                hasImage: (sellerProductForm.images || []).length > 0 || !!sellerProductForm.seoOgImage,
                                imageHasAlt: !!(sellerProductForm.imageAlt || '').trim() || (sellerProductForm.imageAlts || []).some(Boolean),
                                faqItems: sellerProductForm.seoFaq || [],
                                onFaqChange: (items) => setSellerProductForm(f => ({ ...f, seoFaq: items })),
                                onChange: (patch) => setSellerProductForm(f => ({
                                  ...f,
                                  seoTitle: patch.title != null ? patch.title : f.seoTitle,
                                  seoDescription: patch.description != null ? patch.description : f.seoDescription,
                                  seoFocusKeywords: patch.focusKeywords != null ? patch.focusKeywords : f.seoFocusKeywords,
                                  seoOgImage: patch.ogImage != null ? patch.ogImage : f.seoOgImage,
                                  imageAlt: patch.imageAlt != null ? patch.imageAlt : f.imageAlt,
                                })),
                                previewUrl: (seoCfg().canonicalBase || 'https://pirahanemardane.ir').replace(/\/$/, '') + '/product/' + (sellerProductForm.slug || productSlugFromNameAndShop(sellerProductForm.name, sellerUser?.shopName || sellerUser?.name || '') || '…'),

                                sellerStep2: true,
                                seoPart: 'faq',
                              })}
                              </div>

                              )}
                              {sellerProductStep === 17 && (
                              <div className="space-y-3">
                              {renderContentSeoBox({
                                mode: 'product',
                                sellerLimited: true,
                                sellerId: sellerUser?.id || 'own',
                                title: sellerProductForm.seoTitle || '',
                                description: sellerProductForm.seoDescription || '',
                                focusKeywords: sellerProductForm.seoFocusKeywords || '',
                                ogImage: sellerProductForm.seoOgImage || (sellerProductForm.images || [])[sellerProductForm.featuredImageIndex || 0] || (sellerProductForm.images || [])[0] || '',
                                imageAlt: sellerProductForm.imageAlt || (sellerProductForm.imageAlts || [])[sellerProductForm.featuredImageIndex || 0] || '',
                                bodyText: sellerProductForm.desc || '',
                                contentTitle: sellerProductForm.name || '',
                                hasImage: (sellerProductForm.images || []).length > 0 || !!sellerProductForm.seoOgImage,
                                imageHasAlt: !!(sellerProductForm.imageAlt || '').trim() || (sellerProductForm.imageAlts || []).some(Boolean),
                                faqItems: sellerProductForm.seoFaq || [],
                                onFaqChange: (items) => setSellerProductForm(f => ({ ...f, seoFaq: items })),
                                onChange: (patch) => setSellerProductForm(f => ({
                                  ...f,
                                  seoTitle: patch.title != null ? patch.title : f.seoTitle,
                                  seoDescription: patch.description != null ? patch.description : f.seoDescription,
                                  seoFocusKeywords: patch.focusKeywords != null ? patch.focusKeywords : f.seoFocusKeywords,
                                  seoOgImage: patch.ogImage != null ? patch.ogImage : f.seoOgImage,
                                  imageAlt: patch.imageAlt != null ? patch.imageAlt : f.imageAlt,
                                })),
                                previewUrl: (seoCfg().canonicalBase || 'https://pirahanemardane.ir').replace(/\/$/, '') + '/product/' + (sellerProductForm.slug || productSlugFromNameAndShop(sellerProductForm.name, sellerUser?.shopName || sellerUser?.name || '') || '…'),

                                analysisOnly: true,
                              })}
                              {renderContentSeoBox({
                                mode: 'product',
                                sellerLimited: true,
                                sellerId: sellerUser?.id || 'own',
                                title: sellerProductForm.seoTitle || '',
                                description: sellerProductForm.seoDescription || '',
                                focusKeywords: sellerProductForm.seoFocusKeywords || '',
                                ogImage: sellerProductForm.seoOgImage || (sellerProductForm.images || [])[sellerProductForm.featuredImageIndex || 0] || (sellerProductForm.images || [])[0] || '',
                                imageAlt: sellerProductForm.imageAlt || (sellerProductForm.imageAlts || [])[sellerProductForm.featuredImageIndex || 0] || '',
                                bodyText: sellerProductForm.desc || '',
                                contentTitle: sellerProductForm.name || '',
                                hasImage: (sellerProductForm.images || []).length > 0 || !!sellerProductForm.seoOgImage,
                                imageHasAlt: !!(sellerProductForm.imageAlt || '').trim() || (sellerProductForm.imageAlts || []).some(Boolean),
                                faqItems: sellerProductForm.seoFaq || [],
                                onFaqChange: (items) => setSellerProductForm(f => ({ ...f, seoFaq: items })),
                                onChange: (patch) => setSellerProductForm(f => ({
                                  ...f,
                                  seoTitle: patch.title != null ? patch.title : f.seoTitle,
                                  seoDescription: patch.description != null ? patch.description : f.seoDescription,
                                  seoFocusKeywords: patch.focusKeywords != null ? patch.focusKeywords : f.seoFocusKeywords,
                                  seoOgImage: patch.ogImage != null ? patch.ogImage : f.seoOgImage,
                                  imageAlt: patch.imageAlt != null ? patch.imageAlt : f.imageAlt,
                                })),
                                previewUrl: (seoCfg().canonicalBase || 'https://pirahanemardane.ir').replace(/\/$/, '') + '/product/' + (sellerProductForm.slug || productSlugFromNameAndShop(sellerProductForm.name, sellerUser?.shopName || sellerUser?.name || '') || '…'),

                                sellerStep2: true,
                                seoPart: 'social',
                              })}
                              </div>

                              )}
                              {sellerProductStep === 18 && (
                              <div className="space-y-3">
                              {renderContentSeoBox({
                                mode: 'product',
                                sellerLimited: true,
                                sellerId: sellerUser?.id || 'own',
                                title: sellerProductForm.seoTitle || '',
                                description: sellerProductForm.seoDescription || '',
                                focusKeywords: sellerProductForm.seoFocusKeywords || '',
                                ogImage: sellerProductForm.seoOgImage || (sellerProductForm.images || [])[sellerProductForm.featuredImageIndex || 0] || (sellerProductForm.images || [])[0] || '',
                                imageAlt: sellerProductForm.imageAlt || (sellerProductForm.imageAlts || [])[sellerProductForm.featuredImageIndex || 0] || '',
                                bodyText: sellerProductForm.desc || '',
                                contentTitle: sellerProductForm.name || '',
                                hasImage: (sellerProductForm.images || []).length > 0 || !!sellerProductForm.seoOgImage,
                                imageHasAlt: !!(sellerProductForm.imageAlt || '').trim() || (sellerProductForm.imageAlts || []).some(Boolean),
                                faqItems: sellerProductForm.seoFaq || [],
                                onFaqChange: (items) => setSellerProductForm(f => ({ ...f, seoFaq: items })),
                                onChange: (patch) => setSellerProductForm(f => ({
                                  ...f,
                                  seoTitle: patch.title != null ? patch.title : f.seoTitle,
                                  seoDescription: patch.description != null ? patch.description : f.seoDescription,
                                  seoFocusKeywords: patch.focusKeywords != null ? patch.focusKeywords : f.seoFocusKeywords,
                                  seoOgImage: patch.ogImage != null ? patch.ogImage : f.seoOgImage,
                                  imageAlt: patch.imageAlt != null ? patch.imageAlt : f.imageAlt,
                                })),
                                previewUrl: (seoCfg().canonicalBase || 'https://pirahanemardane.ir').replace(/\/$/, '') + '/product/' + (sellerProductForm.slug || productSlugFromNameAndShop(sellerProductForm.name, sellerUser?.shopName || sellerUser?.name || '') || '…'),

                                analysisOnly: true,
                              })}
                              {renderContentSeoBox({
                                mode: 'product',
                                sellerLimited: true,
                                sellerId: sellerUser?.id || 'own',
                                title: sellerProductForm.seoTitle || '',
                                description: sellerProductForm.seoDescription || '',
                                focusKeywords: sellerProductForm.seoFocusKeywords || '',
                                ogImage: sellerProductForm.seoOgImage || (sellerProductForm.images || [])[sellerProductForm.featuredImageIndex || 0] || (sellerProductForm.images || [])[0] || '',
                                imageAlt: sellerProductForm.imageAlt || (sellerProductForm.imageAlts || [])[sellerProductForm.featuredImageIndex || 0] || '',
                                bodyText: sellerProductForm.desc || '',
                                contentTitle: sellerProductForm.name || '',
                                hasImage: (sellerProductForm.images || []).length > 0 || !!sellerProductForm.seoOgImage,
                                imageHasAlt: !!(sellerProductForm.imageAlt || '').trim() || (sellerProductForm.imageAlts || []).some(Boolean),
                                faqItems: sellerProductForm.seoFaq || [],
                                onFaqChange: (items) => setSellerProductForm(f => ({ ...f, seoFaq: items })),
                                onChange: (patch) => setSellerProductForm(f => ({
                                  ...f,
                                  seoTitle: patch.title != null ? patch.title : f.seoTitle,
                                  seoDescription: patch.description != null ? patch.description : f.seoDescription,
                                  seoFocusKeywords: patch.focusKeywords != null ? patch.focusKeywords : f.seoFocusKeywords,
                                  seoOgImage: patch.ogImage != null ? patch.ogImage : f.seoOgImage,
                                  imageAlt: patch.imageAlt != null ? patch.imageAlt : f.imageAlt,
                                })),
                                previewUrl: (seoCfg().canonicalBase || 'https://pirahanemardane.ir').replace(/\/$/, '') + '/product/' + (sellerProductForm.slug || productSlugFromNameAndShop(sellerProductForm.name, sellerUser?.shopName || sellerUser?.name || '') || '…'),

                                sellerStep2: true,
                                seoPart: 'ai',
                              })}
                              </div>

                              )}
                            <div className="flex w-full flex-wrap justify-start gap-2 mt-5" dir="rtl">
                              <button type="button" onClick={() => setSellerProductFormOpen(false)} className="px-5 py-2 rounded-full border border-primary-200 dark:border-white/30 text-sm text-primary-700 dark:text-white min-w-[5.5rem]">لغو</button>
                              {sellerProductStep > 1 && (
                                <button type="button" onClick={() => setSellerProductStep(s => {
                                  let n = Math.max(1, s - 1);
                                  if (n === 11 && !sellerProductForm.multiVariant) n = 10;
                                  return n;
                                })} className="px-5 py-2 rounded-full border border-primary-200 dark:border-white/30 text-sm text-primary-700 dark:text-white min-w-[5.5rem]">مرحله قبل</button>
                              )}
                              {sellerProductStep < 18 && (
                                <button type="button" onClick={() => {
                                  if (sellerProductStep === 1) {
                                    if (!sellerProductForm.name.trim()) { pushLiveToast('نام محصول را وارد کنید', { type: 'error' }); return; }
                                    if (!sellerProductForm.multiVariant && (!sellerProductForm.price || !(Number(sellerProductForm.price) > 0))) { pushLiveToast('قیمت معتبر وارد کنید', { type: 'error' }); return; }
                                  }
                                  if (sellerProductStep === 5 && !sellerProductForm.brandId) {
                                  try { showToast({ message: 'انتخاب برند الزامی است', variant: 'error', duration: 4000, position: 'top-center' }); } catch (_) {}
                                  return;
                                }
                                if (sellerProductStep === 3 && !(sellerProductForm.images || []).length) {
                                    pushLiveToast('حداقل یک تصویر اضافه کنید', { type: 'error' });
                                    return;
                                  }
                                  if (sellerProductStep === 8 && !(sellerProductForm.colorIds || []).length) {
                                  pushLiveToast('حداقل یک رنگ انتخاب کنید', { type: 'error' });
                                  return;
                                }
                                if (sellerProductStep === 9 && !(sellerProductForm.sizes || []).length) {
                                  pushLiveToast('حداقل یک سایز انتخاب کنید', { type: 'error' });
                                  return;
                                }
                                  
                                  if (sellerProductStep === 10) {
                                  /* واریانت اختیاری — اگر خالی بود رد شو */
                                  const hasColor = (sellerProductForm.colorIds || []).length > 0;
                                  const hasSize = (sellerProductForm.sizes || []).length > 0;
                                  if (hasColor && hasSize && !(sellerProductForm.variants || []).length) {
                                    try {
                                      const rows = syncFormVariants(sellerProductForm);
                                      if (rows.length) {
                                        setSellerProductForm(f => ({ ...f, variants: rows }));
                                        pushLiveToast(`جدول واریانت با ${rows.length} ردیف ساخته شد (اختیاری)`, { type: 'info' });
                                      }
                                    } catch (_) {}
                                  }
                                }
                                  setSellerProductStep(s => {
                                  let n = s + 1;
                                  if (sellerProductForm.multiVariant) {
                                    // بعد از نام(1) → دسته(4)؛ رد توضیح/تصویر
                                    if (s === 1) n = 4;
                                    // بعد از دسته(4) → برند(5)
                                    else if (s === 4) n = 5;
                                    // بعد از برند(5) → برچسب(6)
                                    else if (s === 5) n = 6;
                                    // بعد از برچسب(6) → یک‌ضرب واریانت(11)
                                    else if (s === 6) n = 11;
                                    // بعد از واریانت → سئو
                                    else if (s === 11) n = 12;
                                    // رد مراحل ۲،۳،۷،۸،۹،۱۰
                                    else if (n in {2:1,3:1,7:1,8:1,9:1,10:1}) {
                                      while (n in {2:1,3:1,7:1,8:1,9:1,10:1} && n < 18) n += 1;
                                      if (n === 10) n = 11;
                                    }
                                  } else {
                                    // بدون چندقیمتی: رد واریانت
                                    if (n === 11) n = 12;
                                  }
                                  return Math.min(18, n);
                                });
                                }} className="seller-form-primary-btn px-5 py-2 rounded-full bg-primary-800 dark:bg-white text-sm font-medium min-w-[5.5rem]">مرحله بعد</button>
                              )}
                              {sellerProductStep >= 10 && (
                              <>
                              <button type="button" onClick={async () => {
                                try { console.log('[publish] click', { step: sellerProductStep, brandId: sellerProductForm.brandId, name: sellerProductForm.name, multi: sellerProductForm.multiVariant }); } catch (_) {}
                                if (!(typeof sellerCanSell === 'function' ? sellerCanSell() : sellerCanSell) && !['approved','active'].includes(String(sellerUser?.status||sellerUser?.shopStatus||'').toLowerCase()) && sellerUser?.licenseApproved !== true) { showToast({ message: 'تا تأیید فروشگاه توسط ادمین، امکان افزودن محصول نیست', variant: 'error', duration: 5000, position: 'top-center' });
                                  return;
                                }
                                if (!sellerProductForm.name.trim()) {
                                  setSellerProductStep(1);
                                  pushLiveToast('نام محصول الزامی است', { type: 'error' });
                                  return;
                                }
                                if (!sellerProductForm.multiVariant && (!sellerProductForm.price || !(Number(sellerProductForm.price) > 0))) {
                                  setSellerProductStep(1);
                                  pushLiveToast('قیمت معتبر و بزرگ‌تر از صفر الزامی است', { type: 'error' });
                                  return;
                                }
                                if (!(sellerProductForm.images || []).length) {
                                  setSellerProductStep(3);
                                  pushLiveToast('حداقل یک تصویر محصول الزامی است', { type: 'error' });
                                  return;
                                }
                                const price = Number(sellerProductForm.price);
                                const oldP = sellerProductForm.oldPrice ? Number(sellerProductForm.oldPrice) : null;
                                const discount = oldP && oldP > price ? Math.round((1 - price/oldP)*100) : 0;
                                const priceText = toFa(price.toLocaleString());
                                const imgs = (sellerProductForm.images || []).slice(0, 8);
                                const _ap = (sellerProductForm.aparatEmbed || '').trim();
                                if (_ap) {
                                  const okAparat = /^https:\/\/(www\.)?aparat\.com\/video\/video\/embed\//i.test(_ap) || /^https:\/\/(www\.)?aparat\.com\/embed\//i.test(_ap);
                                  if (!okAparat) { pushLiveToast('فقط آدرس embed آپارات مجاز است', { type: 'error', duration: 4500 }); return; }
                                }
                                const feat = sellerProductForm.featuredImageIndex || 0;
                                const mainImg = imgs[feat] || imgs[0] || '';
                                const selectedColors = (adminCatalogColors || []).filter(col => (sellerProductForm.colorIds || []).includes(col.id));
                                if (!selectedColors.length) { pushLiveToast('حداقل یک رنگ انتخاب کنید', { type: 'error' }); return; }
                                const colors = selectedColors.map((col, i) => ({ name: col.name, hex: col.hex, image: i === 0 ? mainImg : (imgs[i] || mainImg) }));
                                const color = colors[0];
                                const allowedSizes = (adminCatalogSizes || []).filter(s => s.active !== false).map(s => s.name);
                                const sizes = (sellerProductForm.sizes || []).filter(s => allowedSizes.includes(s));
                                if (!sizes.length) { pushLiveToast('حداقل یک سایز انتخاب کنید', { type: 'error' }); setSellerProductStep(8); return; }
                                const colorNames = selectedColors.map(c => c.name);
                                const attrDimsSave = getAttrDimensions(sellerProductForm.attributes || {}, adminCatalogAttributes || []);
                                let variants = Array.isArray(sellerProductForm.variants) && sellerProductForm.variants.length
                                  ? sellerProductForm.variants
                                  : buildVariantMatrix(colorNames, sizes, attrDimsSave, price, Number(sellerProductForm.stock) || 0, []);
                                // همیشه ماتریس را با انتخاب‌های فعلی همگام کن (قیمت/موجودی قبلی حفظ می‌شود)
                                variants = buildVariantMatrix(colorNames, sizes, attrDimsSave, price, Number(sellerProductForm.stock) || 0, variants).map(v => ({
                                  id: v.id,
                                  color: v.color,
                                  size: v.size,
                                  attrs: v.attrs || {},
                                  price: Number(v.price) || price,
                                  stock: Number(v.stock) || 0,
                                  note: (v.note || '').trim().slice(0, 300),
                                  image: v.image || '',
                                }));
                                const stockTotal = variants.reduce((s, v) => s + (Number(v.stock) || 0), 0);
                                /* variants optional */
                                if (stockTotal <= 0 && (sellerProductForm.status || 'active') === 'active') {
                                  pushLiveToast('موجودی همه واریانت‌ها صفر است؛ محصول به‌صورت ناموجود/غیرفعال ذخیره می‌شود', { type: 'info' });
                                }
                                if (!Array.isArray(variants) || !variants.length) {
                                  const basePrice = Number(sellerProductForm.price) || 0;
                                  const baseStock = Number(sellerProductForm.stock) || 0;
                                  variants = [{
                                    id: 'v-base',
                                    color: '',
                                    size: '',
                                    price: String(basePrice),
                                    stock: String(baseStock),
                                    attrs: {},
                                  }];
                                }
                                const minVarPrice = variants.length ? Math.min(...variants.map(v => Number(v.price) || price)) : price;
                                if (!sellerProductForm.brandId) { showToast({ message: 'انتخاب برند از لیست ادمین الزامی است', variant: 'error', duration: 4500, position: 'top-center' }); return; }

                                if (sellerProductForm.multiVariant) {
                                  const vv = Array.isArray(variants) ? variants : [];
                                  if (!vv.length) {
                                    setSellerProductStep(11);
                                    pushLiveToast('برای محصول چندقیمتی، جدول واریانت را بسازید', { type: 'error' });
                                    return;
                                  }
                                  const bad = vv.some(v => !(Number(v.price) > 0));
                                  if (bad) {
                                    setSellerProductStep(11);
                                    pushLiveToast('قیمت همه ردیف‌های واریانت باید بزرگ‌تر از صفر باشد', { type: 'error' });
                                    return;
                                  }
                                }
                                const brandObj = (adminCatalogBrands || []).find(b => b.id === sellerProductForm.brandId);
                                if (!brandObj || brandObj.active === false) { showToast({ message: 'برند انتخاب‌شده معتبر نیست', variant: 'error', duration: 4500, position: 'top-center' }); return; }
                                const cats = (sellerProductForm.categories || []).slice(0, 3);
                                const tags = (sellerProductForm.tags || []).slice(0, 3);
                                const descCheck = assertNoUserLinks(htmlToPlain(sellerProductForm.desc || ''));
                                if (!descCheck.ok) { showToast({ message: String('در توضیحات محصول: ' + descCheck.error), variant: 'error', duration: 4500, position: 'top-center' }); return; }
                                const spam = (typeof checkSellerSeoSpam === 'function')
                                  ? checkSellerSeoSpam({
                                      name: sellerProductForm.name || '',
                                      desc: (typeof htmlToPlain === 'function' ? htmlToPlain(sellerProductForm.desc || '') : String(sellerProductForm.desc || '')),
                                      seoTitle: sellerProductForm.seoTitle || '',
                                      seoDescription: sellerProductForm.seoDescription || '',
                                      seoFocusKeywords: sellerProductForm.seoFocusKeywords || '',
                                      maxKeywords: 3,
                                    })
                                  : { ok: true, errors: [], warnings: [] };
                                if (!spam.ok) {
                                  showToast({ message: (spam.errors && spam.errors[0]) || 'محتوای سئو مشکوک به اسپم است', variant: 'error', duration: 5000, position: 'top-center' });
                                  return;
                                }
                                if (spam.warnings?.length) {
                                  showToast({ message: spam.warnings[0], variant: 'info', duration: 4000, position: 'top-center' });
                                }
                                if (!cats.length) { showToast({ message: 'حداقل یک دسته‌بندی انتخاب کنید', variant: 'error', duration: 4500, position: 'top-center' }); return; }
                                // ویژگی‌های اجباری (شرطی بر اساس دسته)
                                const attrsOut = {};
                                for (const attr of (adminCatalogAttributes || []).filter(a => a.active !== false)) {
                                  const limited = attr.categoryNames || [];
                                  if (limited.length && !cats.some(c => limited.includes(c))) continue;
                                  const raw = (sellerProductForm.attributes || {})[attr.id];
                                  const vals = attr.multi ? (Array.isArray(raw) ? raw : (raw ? [raw] : [])) : (raw ? [raw] : []);
                                  const allowed = attr.options || [];
                                  const clean = vals.filter(v => allowed.includes(v));
                                  if (attr.required && !clean.length) {
                                    showToast({ message: `ویژگی اجباری «${attr.name}» را انتخاب کنید`, variant: 'default', duration: 4500, position: 'top-center' });
                                    return;
                                  }
                                  if (clean.length) attrsOut[attr.id] = attr.multi ? clean : clean[0];
                                }
                                if (editingSellerProductId) {
                                  saveSellerProducts((sellerProducts || []).map(x => x.id === editingSellerProductId ? { ...x, name: sellerProductForm.name, category: cats[0], categories: cats, tags, desc: sellerProductForm.desc, price: minVarPrice, oldPrice: oldP ? toFa(oldP.toLocaleString()) : undefined, discount, priceText: toFa(minVarPrice.toLocaleString()), stock: stockTotal, stockLeft: stockTotal, fastShip: (sellerUser?.fastShipEnabled !== false) && !!sellerProductForm.fastShip, variants, sizes, colors, brandId: brandObj.id, brand: brandObj.name, brandName: brandObj.name, attributes: attrsOut, slug: productSlugFromNameAndShop(sellerProductForm.name, sellerUser?.shopName || sellerUser?.name || ''), seoTitle: (sellerProductForm.seoTitle || '').trim(), seoDescription: (sellerProductForm.seoDescription || '').trim(), seoFocusKeywords: (sellerProductForm.seoFocusKeywords || '').trim(), seoOgImage: (sellerProductForm.seoOgImage || '').trim(), seoFaq: sellerProductForm.seoFaq || [], imageAlt: (sellerProductForm.imageAlt || '').trim() || buildImageAlt({ name: sellerProductForm.name, brand: sellerProductForm.brandName, category: (sellerProductForm.categories||[])[0], seoFocusKeywords: sellerProductForm.seoFocusKeywords }), images: imgs, featuredImageIndex: feat, aparatEmbed: (sellerProductForm.aparatEmbed||'').trim(), status: 'pending', contentStatus: 'pending', productCode: x.productCode || generateProductCode(sellerUser?.id || sellerUser?.phone || 'OWN', x.id, sellerUser?.shopName || sellerUser?.name) } : x)); enqueueModeration({ type: 'product', productId: editingSellerProductId, productName: sellerProductForm.name, sellerId: 'own', preview: mainImg, text: sellerProductForm.desc, aparatEmbed: sellerProductForm.aparatEmbed });
                                  try {
                                    if (typeof updateSellerProductOnServer === 'function' && editingSellerProductId) {
                                      const _modeU = (typeof window !== 'undefined' && window.__sellerProductPublishMode) || 'publish';
                                      const _schedU = (typeof window !== 'undefined' && window.__sellerProductScheduleIso) || null;
                                      if (typeof window !== 'undefined') {
                                        window.__sellerProductPublishMode = null;
                                        window.__sellerProductScheduleIso = null;
                                      }
                                      await updateSellerProductOnServer(editingSellerProductId, {
                                        name: sellerProductForm.name,
                                        status: _modeU === 'publish' ? 'active' : 'draft',
                                        scheduled_publish_at: _modeU === 'schedule' && _schedU ? _schedU : null,
                                        title: sellerProductForm.name,
                                        base_price: Number(String(sellerProductForm.price || '').replace(/[^\d]/g, '')) || 0,
                                        description: sellerProductForm.desc || '',
                                        images: sellerProductForm.images || [],
                                      });
                                      if (typeof fetchSellerProductsFromServer === 'function') {
                                        const fresh = await fetchSellerProductsFromServer();
                                        if (Array.isArray(fresh) && typeof saveSellerProducts === 'function') saveSellerProducts(fresh);
                                      }
                                    }
                                  } catch (err) {
                                    try { showToast({ message: String(err?.message || err), variant: 'error' }); } catch (_) {}
                                  }

                                } else {
                                  const _pid = Date.now();
                                  const _scode = generateProductCode(sellerUser?.id || sellerUser?.phone || 'OWN', _pid, sellerUser?.shopName || sellerUser?.name);
                                  const np = { id: _pid, productCode: _scode, name: sellerProductForm.name, category: cats[0], categories: cats, tags, desc: sellerProductForm.desc, price: minVarPrice, oldPrice: oldP ? toFa(oldP.toLocaleString()) : undefined, discount, priceText: toFa(minVarPrice.toLocaleString()), stock: stockTotal, stockLeft: stockTotal, fastShip: (sellerUser?.fastShipEnabled !== false) && !!sellerProductForm.fastShip, variants, sizes, colors, brandId: brandObj.id, brand: brandObj.name, brandName: brandObj.name, attributes: attrsOut, slug: productSlugFromNameAndShop(sellerProductForm.name, sellerUser?.shopName || sellerUser?.name || ''), seoTitle: (sellerProductForm.seoTitle || '').trim(), seoDescription: (sellerProductForm.seoDescription || '').trim(), seoFocusKeywords: (sellerProductForm.seoFocusKeywords || '').trim(), seoOgImage: (sellerProductForm.seoOgImage || '').trim(), seoFaq: sellerProductForm.seoFaq || [], imageAlt: (sellerProductForm.imageAlt || '').trim() || buildImageAlt({ name: sellerProductForm.name, brand: sellerProductForm.brandName, category: (sellerProductForm.categories||[])[0], seoFocusKeywords: sellerProductForm.seoFocusKeywords }), images: imgs, featuredImageIndex: feat, aparatEmbed: (sellerProductForm.aparatEmbed||'').trim(), status: 'pending', contentStatus: 'pending', rating: 0, reviews: 0, seller: { id: 'own', name: sellerUser.shopName }, salesCount: 0 }; enqueueModeration({ type: 'product', productId: np.id, productName: np.name, sellerId: 'own', preview: mainImg, text: np.desc, aparatEmbed: np.aparatEmbed });
                                  try {
                                    if (typeof createSellerProductOnServer === 'function') {
                                      const _mode = (typeof window !== 'undefined' && window.__sellerProductPublishMode) || 'publish';
                                      if (typeof window !== 'undefined') window.__sellerProductPublishMode = null;
                                      const _payload = {
                                        name: np.name,
                                        title: np.name,
                                        base_price: Number(np.price || 0) || 0,
                                        price: Number(np.price || 0) || 0,
                                        status: _mode === 'draft' ? 'draft' : 'pending',
                                        description: np.desc || '',
                                        desc: np.desc || '',
                                        images: np.images || [],
                                        cover_image: (np.images && np.images[0]) || np.image || null,
                                        slug: np.slug || undefined,
                                        stock: Number(np.stock ?? 0) || 0,
                                        category: (np.categories && np.categories[0]) || np.category || '',
                                        categories: np.categories || [],
                                        brand: np.brand || np.brandName || '',
                                        brandName: np.brandName || np.brand || '',
                                        colors: np.colors || [],
                                        sizes: np.sizes || [],
                                        tags: np.tags || [],
                                        attributes: np.attributes || {},
                                        variants: np.variants || [],
                                        productCode: np.productCode || '',
                                        product_code: np.productCode || '',
                                        multiVariant: !!np.multiVariant,
                                        seoTitle: np.seoTitle || '',
                                        seoDescription: np.seoDescription || '',
                                        payload: {
                                          name: np.name,
                                          price: Number(np.price || 0) || 0,
                                          stock: Number(np.stock ?? 0) || 0,
                                          category: (np.categories && np.categories[0]) || np.category || '',
                                          categories: np.categories || [],
                                          brand: np.brand || np.brandName || '',
                                          brandName: np.brandName || np.brand || '',
                                          colors: np.colors || [],
                                          sizes: np.sizes || [],
                                          tags: np.tags || [],
                                          attributes: np.attributes || {},
                                          variants: np.variants || [],
                                          desc: np.desc || '',
                                          images: np.images || [],
                                          productCode: np.productCode || '',
                                        },
                                      };
                                      if (_mode === 'schedule' && window.__sellerProductScheduleIso) {
                                        _payload.scheduled_publish_at = window.__sellerProductScheduleIso;
                                        _payload.status = 'draft';
                                        window.__sellerProductScheduleIso = null;
                                      }
                                      const created = await createSellerProductOnServer(_payload);
                                      try {
                                        showToast({
                                          message: 'محصول در سرور ثبت شد و منتظر تأیید ادمین است',
                                          variant: 'success',
                                          duration: 4500,
                                          position: 'top-center',
                                        });
                                      } catch (_) {}
                                      if (typeof fetchSellerProductsFromServer === 'function') {
                                        const fresh = await fetchSellerProductsFromServer();
                                        if (Array.isArray(fresh) && typeof saveSellerProducts === 'function') {
                                          saveSellerProducts(fresh);
                                        }
                                      } else if (created && typeof mapServerProductToSellerUi === 'function' && typeof saveSellerProducts === 'function') {
                                        const mapped = mapServerProductToSellerUi(created);
                                        saveSellerProducts([mapped, ...(sellerProducts || []).filter((x) => x.id !== np.id)]);
                                      }
                                    } else {
                                      showToast({ message: 'API ثبت محصول در دسترس نیست', variant: 'error', duration: 4500, position: 'top-center' });
                                      return;
                                    }
                                  } catch (err) {
                                    try { showToast({ message: String(err?.message || err || 'خطا در ثبت سروری'), variant: 'error', duration: 5500, position: 'top-center' }); } catch (_) {}
                                    return;
                                  }
                                  setSellerProductFormOpen(false);
                                  return;
                                }
                                setSellerProductFormOpen(false);
                              }}
                              id="seller-product-publish-btn"
                              className="px-5 py-2 rounded-full bg-apple-blue text-white text-sm font-medium min-w-[5.5rem]"
                            >
                              {editingSellerProductId ? 'به‌روزرسانی' : 'انتشار'}
                            </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const n = nowJalaaliTehran();
                                  setSellerSchedule({
                                    jy: n.jy,
                                    jm: n.jm,
                                    jd: Math.min(jalaaliMonthLength(n.jy, n.jm), n.jd),
                                    hour: Math.min(23, (n.hour + 1) % 24),
                                    minute: 0,
                                  });
                                  setSellerScheduleOpen(true);
                                }}
                                className="px-4 py-2 rounded-full border border-apple-blue text-apple-blue text-sm font-medium min-w-[5.5rem]"
                              >
                                انتشار زمان‌بندی‌شده
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  try {
                                    window.__sellerProductPublishMode = 'draft';
                                    const btn = document.getElementById('seller-product-publish-btn');
                                    if (btn) btn.click();
                                  } catch (_) {}
                                }}
                                className="px-4 py-2 rounded-full border border-primary-200 dark:border-white/30 text-sm text-primary-700 dark:text-white min-w-[5.5rem]"
                              >
                                ذخیره پیش‌نویس
                              </button>
                              </>
                              )}

                            </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* مودال انتخاب دسته / برچسب */}
                      
      {sellerScheduleOpen && (
        <div className="site-modal-root" role="dialog" aria-modal="true" style={{ zIndex: 80 }}>
          <div className="site-modal-backdrop" onClick={() => setSellerScheduleOpen(false)} />
          <div className="site-modal-panel bg-white dark:bg-primary-900 border border-primary-200 dark:border-white/15 p-4 max-w-sm mx-auto rounded-2xl">
            <h3 className="text-base font-bold text-primary-900 dark:text-white mb-1">انتشار زمان‌بندی‌شده</h3>
            <p className="text-xs text-primary-500 dark:text-white/60 mb-4">تاریخ و ساعت به‌وقت ایران (تقویم شمسی)</p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div>
                <label className="text-[10px] text-primary-500 block mb-1">روز</label>
                <select
                  className="w-full px-2 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm"
                  value={sellerSchedule.jd}
                  onChange={(e) => setSellerSchedule((s) => ({ ...s, jd: Number(e.target.value) }))}
                >
                  {Array.from({ length: jalaaliMonthLength(sellerSchedule.jy, sellerSchedule.jm) }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-primary-500 block mb-1">ماه</label>
                <select
                  className="w-full px-2 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm"
                  value={sellerSchedule.jm}
                  onChange={(e) => {
                    const jm = Number(e.target.value);
                    setSellerSchedule((s) => ({
                      ...s,
                      jm,
                      jd: Math.min(s.jd, jalaaliMonthLength(s.jy, jm)),
                    }));
                  }}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>{faMonthName(m)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-primary-500 block mb-1">سال</label>
                <select
                  className="w-full px-2 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm"
                  value={sellerSchedule.jy}
                  onChange={(e) => {
                    const jy = Number(e.target.value);
                    setSellerSchedule((s) => ({
                      ...s,
                      jy,
                      jd: Math.min(s.jd, jalaaliMonthLength(jy, s.jm)),
                    }));
                  }}
                >
                  {Array.from({ length: 8 }, (_, i) => nowJalaaliTehran().jy + i).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <label className="text-[10px] text-primary-500 block mb-1">ساعت</label>
                <select
                  className="w-full px-2 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm"
                  value={sellerSchedule.hour}
                  onChange={(e) => setSellerSchedule((s) => ({ ...s, hour: Number(e.target.value) }))}
                >
                  {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                    <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-primary-500 block mb-1">دقیقه</label>
                <select
                  className="w-full px-2 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm"
                  value={sellerSchedule.minute}
                  onChange={(e) => setSellerSchedule((s) => ({ ...s, minute: Number(e.target.value) }))}
                >
                  {[0, 15, 30, 45].map((m) => (
                    <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setSellerScheduleOpen(false)} className="px-4 py-2 rounded-full border border-primary-200 dark:border-white/30 text-sm">انصراف</button>
              <button
                type="button"
                className="btn-cta px-4 py-2 rounded-full bg-apple-blue text-white text-sm font-medium"
                onClick={() => {
                  try {
                    const iso = jalaliTehranToIso(
                      sellerSchedule.jy,
                      sellerSchedule.jm,
                      sellerSchedule.jd,
                      sellerSchedule.hour,
                      sellerSchedule.minute,
                    );
                    const when = new Date(iso);
                    if (when.getTime() <= Date.now() + 60_000) {
                      showToast({ message: 'زمان باید بعد از الان باشد', variant: 'error', duration: 4000, position: 'top-center' });
                      return;
                    }
                    window.__sellerProductScheduleIso = iso;
                    window.__sellerProductPublishMode = 'schedule';
                    setSellerScheduleOpen(false);
                    const btn = document.getElementById('seller-product-publish-btn');
                    if (btn) btn.click();
                  } catch (e) {
                    try { showToast({ message: 'تاریخ نامعتبر', variant: 'error' }); } catch (_) {}
                  }
                }}
              >
                تأیید زمان و انتشار
              </button>
            </div>
          </div>
        </div>
      )}

      {sellerTaxonomyPicker && (
                        <div className="site-modal-root" role="dialog" aria-modal="true">
                          <div className="site-modal-backdrop" onClick={() => setSellerTaxonomyPicker(null)} />
                          <div className="site-modal-panel bg-white dark:bg-primary-900 border border-primary-200 dark:border-white/15 flex flex-col overflow-hidden">
                            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-primary-100 dark:border-white/10">
                              <h3 className="text-sm font-bold text-primary-900 dark:text-white">
                                {sellerTaxonomyPicker === 'cats' ? 'انتخاب دسته‌بندی'
                                  : sellerTaxonomyPicker === 'tags' ? 'انتخاب برچسب'
                                  : sellerTaxonomyPicker === 'brand' ? 'انتخاب برند'
                                  : sellerTaxonomyPicker === 'colors' ? 'انتخاب رنگ'
                                  : sellerTaxonomyPicker === 'sizes' ? 'انتخاب سایز'
                                  : (sellerTaxonomyPicker && sellerTaxonomyPicker.type === 'attr'
                                    ? `انتخاب ${(adminCatalogAttributes || []).find(a => a.id === sellerTaxonomyPicker.id)?.name || 'ویژگی'}`
                                    : 'انتخاب')}
                              </h3>
                              <button type="button" onClick={() => setSellerTaxonomyPicker(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-primary-100 dark:hover:bg-primary-800 text-primary-700 dark:text-white" aria-label="بستن">
                                <Icon name="x" size={16} />
                              </button>
                            </div>
                            <div className="px-4 py-2 border-b border-primary-100 dark:border-white/10">
                              <input
                                type="search"
                                value={sellerTaxonomySearch}
                                onChange={(e) => setSellerTaxonomySearch(e.target.value)}
                                placeholder="جستجو…"
                                className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue"
                              />
                              <p className="text-xs text-primary-400 mt-1.5">
                                {sellerTaxonomyPicker === 'cats' ? `${toFa((sellerProductForm.categories || []).length)}/۳ دسته انتخاب‌شده`
                                  : sellerTaxonomyPicker === 'tags' ? `${toFa((sellerProductForm.tags || []).length)}/۳ برچسب انتخاب‌شده`
                                  : sellerTaxonomyPicker === 'brand' ? (sellerProductForm.brandId ? '۱ برند انتخاب‌شده' : 'برندی انتخاب نشده')
                                  : sellerTaxonomyPicker === 'colors' ? `${toFa((sellerProductForm.colorIds || []).length)} رنگ انتخاب‌شده`
                                  : sellerTaxonomyPicker === 'sizes' ? `${toFa((sellerProductForm.sizes || []).length)} سایز انتخاب‌شده`
                                  : 'انتخاب از لیست ادمین'}
                              </p>
                            </div>
                            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5" style={{ WebkitOverflowScrolling: 'touch' }}>
                              {(() => {
                                const q = sellerTaxonomySearch.trim();
                                let items = [];
                                let mode = sellerTaxonomyPicker;
                                let attrDef = null;
                                if (mode === 'cats') items = (adminCategories || []).filter(c => c.active !== false);
                                else if (mode === 'tags') items = (adminTags || []).filter(t => t.active !== false);
                                else if (mode === 'brand') items = (adminCatalogBrands || []).filter(b => b.active !== false);
                                else if (mode === 'colors') items = (adminCatalogColors || []).filter(c => c.active !== false);
                                else if (mode === 'sizes') items = (adminCatalogSizes || []).filter(s => s.active !== false);
                                else if (mode && mode.type === 'attr') {
                                  attrDef = (adminCatalogAttributes || []).find(a => a.id === mode.id);
                                  items = (attrDef?.options || []).map((opt, i) => ({ id: `${mode.id}-${i}`, name: typeof opt === 'string' ? opt : (opt.name || opt.label || String(opt)) }));
                                }
                                items = items.filter((item) => !q || String(item.name).includes(q));
                                if (!items.length) return <EmptyStateBox title="موردی یافت نشد" className="py-8" />;
                                return items.map((item) => {
                                  let selected = false;
                                  if (mode === 'cats') selected = (sellerProductForm.categories || []).includes(item.name);
                                  else if (mode === 'tags') selected = (sellerProductForm.tags || []).includes(item.name);
                                  else if (mode === 'brand') selected = sellerProductForm.brandId === item.id;
                                  else if (mode === 'colors') selected = (sellerProductForm.colorIds || []).includes(item.id);
                                  else if (mode === 'sizes') selected = (sellerProductForm.sizes || []).includes(item.name);
                                  else if (mode && mode.type === 'attr' && attrDef) {
                                    const cur = (sellerProductForm.attributes || {})[attrDef.id];
                                    const arr = attrDef.multi ? (Array.isArray(cur) ? cur : (cur ? [cur] : [])) : (cur ? [cur] : []);
                                    selected = arr.includes(item.name);
                                  }
                                  return (
                                    <button
                                      key={item.id || item.name}
                                      type="button"
                                      onClick={() => {
                                        if (mode === 'cats') {
                                          setSellerProductForm((f) => {
                                            const cur = f.categories || [];
                                            if (selected) {
                                              const next = cur.filter((x) => x !== item.name);
                                              return { ...f, categories: next, category: next[0] || '' };
                                            }
                                            if (cur.length >= 3) return f;
                                            const next = [...cur, item.name];
                                            return { ...f, categories: next, category: next[0] };
                                          });
                                        } else if (mode === 'tags') {
                                          setSellerProductForm((f) => {
                                            const cur = f.tags || [];
                                            if (selected) return { ...f, tags: cur.filter((x) => x !== item.name) };
                                            if (cur.length >= 3) return f;
                                            return { ...f, tags: [...cur, item.name] };
                                          });
                                        } else if (mode === 'brand') {
                                          setSellerProductForm((f) => selected
                                            ? { ...f, brandId: '', brandName: '' }
                                            : { ...f, brandId: item.id, brandName: item.name });
                                        } else if (mode === 'colors') {
                                          setSellerProductForm((f) => {
                                            const cur = f.colorIds || [];
                                            return { ...f, colorIds: selected ? cur.filter(id => id !== item.id) : [...cur, item.id], variants: [] };
                                          });
                                        } else if (mode === 'sizes') {
                                          setSellerProductForm((f) => {
                                            const cur = f.sizes || [];
                                            return { ...f, sizes: selected ? cur.filter(s => s !== item.name) : [...cur, item.name], variants: [] };
                                          });
                                        } else if (mode && mode.type === 'attr' && attrDef) {
                                          setSellerProductForm((f) => {
                                            const attrs = { ...(f.attributes || {}) };
                                            if (attrDef.multi) {
                                              const cur = Array.isArray(attrs[attrDef.id]) ? attrs[attrDef.id] : (attrs[attrDef.id] ? [attrs[attrDef.id]] : []);
                                              const next = selected ? cur.filter(v => v !== item.name) : [...cur, item.name];
                                              if (next.length) attrs[attrDef.id] = next; else delete attrs[attrDef.id];
                                            } else {
                                              if (selected) delete attrs[attrDef.id];
                                              else attrs[attrDef.id] = item.name;
                                            }
                                            return { ...f, attributes: attrs, variants: [] };
                                          });
                                        }
                                      }}
                                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-right transition ${selected ? 'bg-apple-blue/10 dark:bg-[#4CCD99]/15' : 'hover:bg-primary-50 dark:hover:bg-primary-900/50'}`}
                                    >
                                      <span className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 ${selected ? 'bg-apple-blue border-apple-blue text-white dark:bg-[#4CCD99] dark:border-[#4CCD99]' : 'border-primary-300 dark:border-white/30'}`}>
                                        {selected && <Icon name="check" size={12} />}
                                      </span>
                                      {mode === 'colors' && item.hex && (
                                        <span className="color-swatch w-4 h-4 rounded-full border border-black/20 dark:border-white/60 flex-shrink-0" style={{ ["--swatch-color"]: item.hex || '#888', backgroundColor: item.hex || '#888' }} />
                                      )}
                                      <span className={`text-sm font-medium text-primary-900 dark:text-white flex-1 ${mode === 'sizes' ? 'font-latin' : ''}`} dir={mode === 'sizes' ? 'ltr' : undefined}>{item.name}</span>
                                    </button>
                                  );
                                });
                              })()}
                            </div>
                            <div className="px-4 py-3 border-t border-primary-100 dark:border-white/10">
                              <button type="button" onClick={() => setSellerTaxonomyPicker(null)} className="w-full py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium">تأیید انتخاب</button>
                            </div>
                          </div>
                        </div>
                      )}
                      {/* ویرایشگر حرفه‌ای توضیحات محصول */}
                      {sellerDescEditorOpen && (
                        <div className="site-modal-root" role="dialog" aria-modal="true">
                          <div className="site-modal-backdrop" onClick={() => setSellerDescEditorOpen(false)} />
                          <div className="site-modal-panel bg-white dark:bg-primary-900 border border-primary-200 dark:border-white/15 flex flex-col overflow-hidden">
                            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-primary-100 dark:border-white/10">
                              <div>
                                <h3 className="text-sm font-bold text-primary-900 dark:text-white">توضیحات محصول</h3>
                                <p className="text-xs text-primary-400 mt-0.5">بدون لینک، تصویر و ویدیو</p>
                              </div>
                              <button type="button" onClick={() => setSellerDescEditorOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-primary-100 dark:hover:bg-primary-800 text-primary-700 dark:text-white" aria-label="بستن">
                                <Icon name="x" size={16} />
                              </button>
                            </div>
                            <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
                              <SimpleEditor
                                value={sellerDescDraft}
                                onChange={(html, plain) => {
                                  setSellerDescDraft(html);
                                  setSellerDescError('');
                                  if ((plain || '').length > 2000) setSellerDescError('حداکثر ۲۰۰۰ نویسه');
                                }}
                                placeholder="توضیحات کامل محصول را بنویسید…"
                                appearance="full"
                                maxLength={2000}
                                allowTable
                              />
                              <div className="flex justify-between items-center mt-2 text-xs text-primary-400">
                                <span>قالب‌بندی متن · بدون لینک و رسانه</span>
                                <span dir="ltr">{toFa(htmlToPlain(sellerDescDraft).length)}/۲۰۰۰</span>
                              </div>
                              {sellerDescError && <p className="text-xs text-red-500 mt-1">{sellerDescError}</p>}
                            </div>
                            <div className="flex w-full justify-end gap-2 px-4 py-3 border-t border-primary-100 dark:border-white/10" dir="ltr">
                              <button type="button" onClick={() => setSellerDescEditorOpen(false)} className="px-5 py-2 rounded-full border border-primary-200 dark:border-white/30 text-sm text-primary-700 dark:text-white min-w-[5.5rem]">لغو</button>
                              <button
                                type="button"
                                onClick={() => {
                                  const plain = htmlToPlain(sellerDescDraft);
                                  const chk = assertNoUserLinks(plain);
                                  if (!chk.ok) { setSellerDescError(chk.error); return; }
                                  const htmlChk = assertNoUserLinks(sellerDescDraft.replace(/<[^>]+>/g, ' '));
                                  if (!htmlChk.ok) { setSellerDescError(htmlChk.error); return; }
                                  if (plain.length > 2000) { setSellerDescError('حداکثر ۲۰۰۰ نویسه'); return; }
                                  setSellerProductForm(f => ({ ...f, desc: sellerDescDraft }));
                                  setSellerDescEditorOpen(false);
                                }}
                                className="px-5 py-2 rounded-full bg-apple-blue text-white text-sm font-medium min-w-[5.5rem]"
                              >
                                ذخیره
                              </button>
                            </div>
                          </div>
                        </div>
                      )}


                    </div>
                  )}

                  {/* Seller Orders */}
                  {sellerTab === 'inventory' && (
                    <div className="space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h2 className="text-base font-bold text-primary-900 dark:text-white">موجودی انبار</h2>
                          <p className="text-xs text-primary-500 mt-0.5">نمای کلی موجودی، نقطه سفارش و ناموجود کردن فوری</p>
                        </div>
                      </div>
                      {(() => {
                        const list = sellerProducts || [];
                        const totalSku = list.length;
                        const out = list.filter(p => (Number(p.stock) || 0) <= 0 || p.status === 'inactive').length;
                        const low = list.filter(p => {
                          const st = Number(p.stock) || 0;
                          const rp = Number(p.reorderPoint);
                          if (st <= 0) return false;
                          if (!Number.isFinite(rp) || rp <= 0) return st > 0 && st <= 3;
                          return st <= rp;
                        }).length;
                        const ok = totalSku - out - low;
                        return (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                              { l: 'کل کالا', v: totalSku, cls: 'text-primary-900 dark:text-white' },
                              { l: 'موجود کافی', v: Math.max(0, ok), cls: 'text-emerald-600' },
                              { l: 'نزدیک نقطه سفارش', v: low, cls: 'text-amber-600' },
                              { l: 'ناموجود / غیرفعال', v: out, cls: 'text-red-600' },
                            ].map(x => (
                              <div key={x.l} className="p-3 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 text-center">
                                <p className={`text-xl font-bold ${x.cls}`}>{toFa(x.v)}</p>
                                <p className="text-xs text-primary-500 mt-1">{x.l}</p>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                      <div className="space-y-2">
                        {(sellerProducts || []).length === 0 ? (
                          <div className="text-center py-14 rounded-2xl bg-white dark:bg-primary-900 border border-dashed border-primary-200 dark:border-white/20">
                            <Icon name="package" size={32} className="mx-auto text-primary-300 mb-3" />
                            <p className="text-sm text-primary-500">هنوز محصولی ندارید</p>
                            <button type="button" onClick={() => setSellerTab('products')} className="mt-3 text-xs text-apple-blue">رفتن به مدیریت محصولات</button>
                          </div>
                        ) : (
                          (sellerProducts || []).map(p => {
                            const stock = Number(p.stock) || 0;
                            const rp = Number(p.reorderPoint);
                            const hasRp = Number.isFinite(rp) && rp > 0;
                            const isOut = stock <= 0;
                            const isLow = !isOut && (hasRp ? stock <= rp : stock <= 3);
                            return (
                              <div key={p.id} className={`p-3 sm:p-4 rounded-2xl border bg-white dark:bg-primary-900 ${isOut ? 'border-red-200 dark:border-red-800/40' : isLow ? 'border-amber-200 dark:border-amber-800/40' : 'border-primary-200 dark:border-white/15'}`}>
                                <div className="flex flex-wrap items-start gap-3">
                                  {(p.colors?.[0]?.image || p.image) && (
                                    <img src={p.colors?.[0]?.image || p.image} alt="" className="w-14 h-16 object-cover rounded-lg flex-shrink-0" loading="lazy" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="text-sm font-bold text-primary-900 dark:text-white truncate">{p.name}</p>
                                      {isOut && <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">ناموجود</span>}
                                      {isLow && <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">نقطه سفارش</span>}
                                      {!isOut && !isLow && <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">موجود</span>}
                                    </div>
                                    <p className="text-xs text-primary-500 mt-0.5">{p.category || '—'} · وضعیت: {p.status === 'active' ? 'فعال' : p.status === 'pending' ? 'در انتظار' : p.status === 'archived' ? 'آرشیو' : p.status === 'purge_requested' ? 'درخواست حذف دائم' : 'غیرفعال'}</p>
                                    <div className="mt-3 flex flex-wrap items-end gap-3">
                                      <div>
                                        <label className="text-xs text-primary-500 block mb-1">موجودی فعلی</label>
                                        <div className="flex items-center gap-1.5">
                                          <input
                                            id={`stock-input-${p.id}`}
                                            type="text"
                                            inputMode="numeric"
                                            defaultValue={toFa(stock)}
                                            key={`st-${p.id}-${stock}`}
                                            onInput={(e) => { e.target.value = toFa(toEnDigits(e.target.value).replace(/\D/g, '')); }}
                                            className="w-24 px-2.5 py-1.5 rounded-xl bg-white dark:bg-primary-900 border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue font-[IRANYekanX,Tahoma,sans-serif]"
                                            dir="rtl"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const el = document.getElementById(`stock-input-${p.id}`);
                                              const raw = el ? el.value : stock;
                                              const n = Math.max(0, parseInt(String(raw).replace(/[^0-9]/g, ''), 10) || 0);
                                              if (el) el.value = String(n);
                                              updateSellerProductStock(p.id, n);
                                              pushLiveToast(n === 0 ? 'موجودی صفر شد — محصول ناموجود' : `موجودی به ${n} عدد به‌روز شد`, { type: n === 0 ? 'info' : 'success' });
                                            }}
                                            className="text-xs px-3 py-1.5 rounded-full bg-apple-blue text-white font-medium whitespace-nowrap"
                                          >به‌روزرسانی</button>
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-xs text-primary-500 block mb-1">نقطه سفارش</label>
                                        <div className="flex items-center gap-1.5">
                                          <input
                                            id={`rp-input-${p.id}`}
                                            type="text"
                                            inputMode="numeric"
                                            defaultValue={hasRp ? toFa(rp) : ''}
                                            placeholder="مثلاً ۵"
                                            key={`rp-${p.id}-${hasRp ? rp : 'x'}`}
                                            onInput={(e) => { e.target.value = toFa(toEnDigits(e.target.value).replace(/\D/g, '')); }}
                                            className="w-24 px-2.5 py-1.5 rounded-xl bg-white dark:bg-primary-900 border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue font-[IRANYekanX,Tahoma,sans-serif]"
                                            dir="rtl"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const el = document.getElementById(`rp-input-${p.id}`);
                                              const val = el ? el.value : rp;
                                              setSellerProductReorderPoint(p.id, val);
                                              pushLiveToast('نقطه سفارش به‌روز شد', { type: 'success' });
                                            }}
                                            className="text-xs px-3 py-1.5 rounded-full bg-apple-blue text-white font-medium whitespace-nowrap"
                                          >به‌روزرسانی</button>
                                        </div>
                                      </div>
                                      <div className="flex flex-wrap gap-1.5 pb-0.5">
                                        {!isOut ? (
                                          <button type="button" onClick={() => { siteConfirm(`«${p.name}» ناموجود شود؟`).then(ok=>{ if(ok) setSellerProductOutOfStock(p.id); }); }} className="text-xs px-3 py-1.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium">ناموجود فوری</button>
                                        ) : (
                                          <button type="button" onClick={() => updateSellerProductStock(p.id, 1)} className="text-xs px-3 py-1.5 rounded-full bg-emerald-600 text-white font-medium">موجود کردن (۱ عدد)</button>
                                        )}
                                        <button type="button" onClick={() => updateSellerProductStock(p.id, stock + 5)} className="text-xs px-3 py-1.5 rounded-full border border-primary-200 dark:border-white/20 text-primary-700 dark:text-white">+۵</button>
                                        <button type="button" onClick={() => updateSellerProductStock(p.id, stock + 10)} className="text-xs px-3 py-1.5 rounded-full border border-primary-200 dark:border-white/20 text-primary-700 dark:text-white">+۱۰</button>
                                      </div>
                                    </div>
                                    {hasRp && stock > 0 && stock <= rp && (
                                      <p className="text-xs text-amber-600 mt-2">موجودی به نقطه سفارش ({toFa(rp)}) رسیده یا کمتر است — بهتر است شارژ کنید.</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {sellerTab === 'orders' && !sellerOrderDetailId && (
                    <div>
                      <h2 className="text-base font-bold text-primary-900 dark:text-white mb-4">سفارش‌های فروشنده</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  <button type="button" onClick={() => downloadSellerOrdersCsv("all")} className="text-xs sm:text-sm px-3 py-2 rounded-full border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-primary-800 dark:text-white hover:border-apple-blue transition">خروجی حسابداری (CSV)</button>
                  <button type="button" onClick={() => downloadSellerOrdersCsv("paid")} className="text-xs sm:text-sm px-3 py-2 rounded-full border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 transition">فقط پرداخت‌شده</button>
                  <button type="button" onClick={() => downloadSellerOrdersCsv("pending")} className="text-xs sm:text-sm px-3 py-2 rounded-full border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 transition">فقط در انتظار</button>
                </div>
                      <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-4">
                        {[{ id: 'all', label: 'همه' },{ id: 'new', label: 'جدید' },{ id: 'preparing', label: 'آماده‌سازی' },{ id: 'shipped', label: 'ارسال‌شده' },{ id: 'delivered', label: 'تحویل‌شده' }].map(f => (
                          <button key={f.id} type="button" onClick={() => setSellerOrdersFilter(f.id)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border ${sellerOrdersFilter === f.id ? 'bg-primary-800 text-white border-primary-800 dark:bg-[#4CCD99] dark:border-[#4CCD99] dark:text-white' : 'plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium'}`}>{f.label}</button>
                        ))}
                      </div>
                      {(() => {
                        const list = (sellerOrders || []).filter(o => sellerOrdersFilter === 'all' || o.status === sellerOrdersFilter);
                        if (!list.length) return (
                          <div className="text-center py-16 px-4 rounded-2xl bg-white dark:bg-primary-900 border border-dashed border-primary-200 dark:border-white/20">
                            <p className="text-sm font-medium text-primary-700 dark:text-white mb-1">سفارشی در این فیلتر نیست</p>
                            <p className="text-xs text-primary-500 dark:text-white/60">وقتی خریدار سفارش بدهد اینجا نمایش داده می‌شود</p>
                          </div>
                        );
                        return <div className="space-y-3">{list.map(o => (
                          <button key={o.id} type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSellerOrderDetailId(o.id); setSellerTab('orders'); }} className="w-full p-4 rounded-xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 text-right hover:border-apple-blue/40 transition cursor-pointer">
                            <div className="flex justify-between items-start mb-2"><div><p className="text-sm font-bold text-primary-900 dark:text-white">{o.id}</p><p className="text-xs text-primary-500">{o.date} · {o.buyerName}</p></div><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${sellerOrderStatusColor(o.status)}`}>{o.statusLabel}</span></div>
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-bold text-primary-800 dark:text-white">{toFa(Number(o.total||0).toLocaleString())} تومان · {toFa((o.items||[]).reduce((s,i)=>s+(i.qty||0),0))} کالا</p>
                              {o.status === 'delivered' && (
                                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-0.5">
                                  ★ {toFa(o.rating != null ? o.rating : '—')}
                                  <span className="text-primary-400 font-normal mr-0.5">امتیاز</span>
                                </span>
                              )}
                            </div>
                          </button>
                        ))}</div>;
                      })()}
                    </div>
                  )}
                  {sellerTab === 'orders' && sellerOrderDetailId && (() => {
                    const o = (sellerOrders || []).find(x => String(x.id) === String(sellerOrderDetailId));
                    if (!o) return (
                      <div className="p-6 text-center">
                        <p className="text-sm text-primary-500 mb-3">جزئیات این سفارش پیدا نشد</p>
                        <button type="button" onClick={() => setSellerOrderDetailId(null)} className="text-xs text-apple-blue">بازگشت به لیست</button>
                      </div>
                    );
                    const items = Array.isArray(o.items) ? o.items : [];
                    const ship = o.shipping || {};
                    return (
                      <div>
                        <button type="button" onClick={() => setSellerOrderDetailId(null)} className="text-xs text-primary-500 hover:text-apple-blue mb-4 flex items-center gap-1"><Icon name="arrowRight" size={14} /> بازگشت</button>
                        <div className="flex justify-between items-start mb-4"><div><h2 className="text-base font-bold text-primary-900 dark:text-white">{o.id}</h2><p className="text-xs text-primary-500">{o.date} · {o.buyerName || 'خریدار'}</p></div><span className={`text-xs px-3 py-1 rounded-full font-medium ${sellerOrderStatusColor(o.status)}`}>{o.statusLabel || o.status}</span></div>
                        <div className="mb-4 p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-3">
                          {items.length === 0 && <EmptyStateBox title="آیتمی ثبت نشده" className="py-4 border-0 bg-transparent" />}
                          {items.map((it,i) => (
                            <div key={i} className="flex gap-3"><img src={it.image || ''} alt="" className="w-14 h-14 rounded-lg object-cover bg-primary-100" /><div className="flex-1"><p className="text-xs font-medium text-primary-900 dark:text-white">{it.name}</p><p className="text-xs text-primary-500">{it.color || '—'} · {it.size || '—'} · {toFa(it.qty || 1)} عدد</p><p className="text-xs font-bold mt-0.5">{toFa(Number(it.price || 0).toLocaleString())} ت</p></div></div>
                          ))}
                        </div>
                        <div className="mb-4 p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                          <h3 className="text-sm font-bold mb-2 text-primary-900 dark:text-white">آدرس ارسال</h3>
                          <p className="text-xs text-primary-600 dark:text-white/70">{ship.address || o.address || '—'}</p>
                          <p className="text-xs text-primary-400 mt-1">{ship.method || o.shippingMethod || '—'}</p>
                          {o.buyerPhone && <p className="text-xs text-primary-500 mt-1" dir="ltr">{o.buyerPhone}</p>}
                        </div>
                        <div className="flex flex-col gap-3 mb-4">
                          <div className="flex flex-wrap gap-2">
                            {(o.status === 'new' || o.status === 'pending') && (
                              <>
                                <button type="button" onClick={() => sellerConfirmOrder(o)} className="px-4 py-2 rounded-full bg-apple-blue text-white text-xs font-medium">تأیید سفارش</button>
                                <button type="button" onClick={() => setSellerCancelForm({ open: true, orderId: o.id, reason: '' })} className="px-4 py-2 rounded-full border border-red-300 text-red-600 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/20">لغو سفارش</button>
                              </>
                            )}
                            {o.status === 'preparing' && !o.packingDone && (
                              <button type="button" onClick={() => sellerMarkPackingDone(o)} className="px-4 py-2 rounded-full bg-amber-500 text-white text-xs font-medium">در حال آماده‌سازی</button>
                            )}
                            {(o.status === 'preparing' || o.status === 'new' || o.status === 'pending' || o.status === 'shipped') && o.status !== 'cancelled' && (
                              <>
                                <button type="button" onClick={() => sellerOpenOrderTicket(o)} className="px-4 py-2 rounded-full border border-primary-200 dark:border-white/30 text-primary-800 dark:text-white text-xs font-medium">تیکت</button>
                                <a
                                  href={(function(){ const raw = o.buyerPhone || o.buyer?.phone || o.shipping?.phone || o.contactPhone || ''; const d = String(raw).replace(/[۰-۹]/g, c => '۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).replace(/[٠-٩]/g, c => '٠١٢٣٤٥٦٧٨٩'.indexOf(c)).replace(/\D/g,''); return d ? `tel:${d}` : undefined; })()}
                                  onClick={(e) => {
                                    const raw = o.buyerPhone || o.buyer?.phone || o.shipping?.phone || o.contactPhone || '';
                                    const d = String(raw).replace(/[۰-۹]/g, c => '۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).replace(/[٠-٩]/g, c => '٠١٢٣٤٥٦٧٨٩'.indexOf(c)).replace(/\D/g,'');
                                    if (!d) {
                                      e.preventDefault();
                                      showToast({ message: 'شماره تماس خریدار ثبت نشده است', variant: 'error', duration: 3500, position: 'top-center' });
                                    }
                                  }}
                                  className="px-4 py-2 rounded-full border border-primary-200 dark:border-white/30 text-primary-800 dark:text-white text-xs font-medium inline-flex items-center gap-1"
                                >
                                  <Icon name="phone" size={14} /> تماس با خریدار
                                </a>
                              </>
                            )}
                            {o.status === 'preparing' && !o.packingDone && (
                              <button type="button" onClick={() => setSellerCancelForm({ open: true, orderId: o.id, reason: '' })} className="px-4 py-2 rounded-full border border-red-300 text-red-600 text-xs font-medium">لغو سفارش</button>
                            )}
                          </div>
                          {o.status === 'preparing' && o.packingDone && (
                            <div className="w-full space-y-2 p-3 rounded-xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                              <p className="text-xs font-medium text-primary-900 dark:text-white">ثبت ارسال</p>
                              <input value={sellerTrackForm.code} onChange={e => setSellerTrackForm(f => ({...f, code: toEnDigits(e.target.value)}))} placeholder="کد رهگیری" dir="ltr" className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue" />
                              <div className="flex gap-2 flex-wrap">{['پست پیشتاز','تیپاکس','اسنپ‌باکس'].map(c => (<button key={c} type="button" onClick={() => setSellerTrackForm(f => ({...f, carrier: c}))} className={`px-3 py-1 rounded-full text-xs border ${sellerTrackForm.carrier===c?'bg-apple-blue text-white border-apple-blue':'plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium'}`}>{c}</button>))}</div>
                              <button type="button" onClick={() => { if (!sellerTrackForm.code.trim()) { showToast({ message: 'کد رهگیری را وارد کنید', variant: 'default', duration: 4500, position: 'top-center' }); return; } sellerShipOrder(o, sellerTrackForm.code.trim(), sellerTrackForm.carrier); }} className="px-4 py-2 rounded-full bg-apple-blue text-white text-xs font-medium">ارسال</button>
                            </div>
                          )}
                          {sellerCancelForm.open && sellerCancelForm.orderId === o.id && (
                            <div className="w-full space-y-2.5 p-3.5 rounded-xl border border-red-200 dark:border-red-500/40 bg-red-50/50 dark:bg-red-950/30">
                              <p className="text-sm font-bold text-red-700 dark:text-red-200">دلیل لغو سفارش</p>
                              <textarea value={sellerCancelForm.reason} onChange={e => setSellerCancelForm(f => ({...f, reason: e.target.value}))} rows={3} placeholder="دلیل لغو را بنویسید (برای خریدار ارسال می‌شود)…" className="w-full px-3 py-2.5 rounded-xl border border-red-200 dark:border-red-500/40 bg-white dark:bg-primary-900 text-sm sm:text-base text-primary-900 dark:!text-white placeholder:text-primary-400 dark:placeholder:text-white/50" />
                              <p className="text-sm text-primary-700 dark:!text-white/85 leading-relaxed">شرایط بازگشت وجه برای خریدار در بخش سفارش‌ها ثبت می‌شود.</p>
                              <div className="flex flex-row-reverse justify-start gap-2">
                                <button type="button" onClick={() => {
                                  if (!(sellerCancelForm.reason || '').trim()) {
                                    showToast({ message: 'دلیل لغو را بنویسید', variant: 'error', duration: 3500, position: 'top-center' });
                                    return;
                                  }
                                  sellerCancelOrder(o, sellerCancelForm.reason.trim());
                                }} className="px-4 py-2 rounded-full bg-red-600 text-white text-xs font-medium">تأیید لغو</button>
                                <button type="button" onClick={() => setSellerCancelForm({ open: false, orderId: null, reason: '' })} className="px-4 py-2 rounded-full border border-primary-200 dark:border-white/30 text-xs">انصراف</button>
                              </div>
                            </div>
                          )}
                          {o.tracking && <p className="text-xs text-primary-500">رهگیری: <span dir="ltr" className="font-bold text-primary-900 dark:text-white">{o.tracking.code}</span> ({o.tracking.carrier})</p>}
                          {o.cancelReason && <p className="text-xs text-red-600">دلیل لغو: {o.cancelReason}</p>}
                        </div>
                        <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                          <h3 className="text-sm font-bold mb-2 text-primary-900 dark:text-white">تاریخچه</h3>
                          {(o.history || []).map((h,i) => (<p key={i} className="text-xs text-primary-600 dark:text-white/70 py-1 border-b border-primary-50 dark:border-white/5 last:border-0">{h.label} — {h.date}</p>))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Support */}
                  {sellerTab === 'support' && !sellerTicketDetailId && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-base font-bold text-primary-900 dark:text-white">پشتیبانی</h2>
                        <button type="button" onClick={() => { setSellerNewTicket({ subject:'', body:'', target:'admin' }); setSellerNewTicketOpen(true); }} className="text-xs px-3 py-1.5 rounded-full bg-apple-blue text-white font-medium">تیکت جدید</button>
                      </div>
                      {(() => {
                        const tickets = sellerTickets || [];
                        const buyerTickets = tickets.filter(t => t.type === 'buyer' || t.type === 'return');
                        const adminTickets = tickets.filter(t => t.type === 'admin' || t.type === 'system');
                        const statusBadge = (status) => {
                          if (status === 'open') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
                          if (status === 'waiting') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
                          return 'bg-primary-100 text-primary-600 dark:bg-primary-800 dark:text-white/70';
                        };
                        const statusLabel = (status) => status === 'open' ? 'باز' : status === 'waiting' ? 'منتظر پاسخ' : 'بسته';
                        const renderList = (list, emptyText) => (
                          <div className="space-y-2">
                            {list.length === 0 && <EmptyStateBox title="{emptyText}" className="py-6" />}
                            {list.map(t => (
                              <button key={t.id} type="button" onClick={() => { setSellerTicketDetailId(t.id); if (t.unread) saveSellerTickets((sellerTickets||[]).map(x => x.id===t.id ? {...x, unread:false} : x)); }} className={`w-full p-3.5 rounded-xl border text-right transition ${t.unread ? 'border-apple-blue/30 bg-apple-blue/5' : 'border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900'}`}>
                                <div className="flex justify-between gap-2 items-start">
                                  <p className="text-xs font-bold text-primary-900 dark:text-white">{t.subject}</p>
                                  <span className={`ticket-status-badge text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusBadge(t.status)}`}>{statusLabel(t.status)}</span>
                                </div>
                                <div className="flex justify-between gap-2 mt-1">
                                  <p className="text-xs text-primary-500">{t.type === 'buyer' ? 'خریدار' : t.type === 'return' ? 'مرجوعی' : t.type === 'admin' ? 'ادمین' : 'سیستم'}{t.code ? ` · ${t.code}` : (t.id && String(t.id).startsWith('TK') ? ` · ${t.id}` : '')}</p>
                                  <span className="text-xs text-primary-400">{t.date}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        );
                        return (
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <h3 className="text-xs font-bold text-primary-700 dark:text-white/80 mb-2 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" /> تیکت‌های خریدار
                              </h3>
                              {renderList(buyerTickets, 'تیکتی از خریدار نیست')}
                            </div>
                            <div>
                              <h3 className="text-xs font-bold text-primary-700 dark:text-white/80 mb-2 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-apple-blue text-white" /> تیکت‌های ادمین
                              </h3>
                              {renderList(adminTickets, 'تیکتی با ادمین نیست')}
                            </div>
                          </div>
                        );
                      })()}
                      {sellerNewTicketOpen && (
                        <div className="site-modal-root" role="dialog" aria-modal="true">
                          <div className="site-modal-backdrop" onClick={() => setSellerNewTicketOpen(false)} />
                          <div className="site-modal-panel bg-white dark:bg-primary-900 p-5 border border-primary-200 dark:border-white/15">
                            <h3 className="text-base font-bold mb-4 text-primary-900 dark:text-white">تیکت جدید</h3>
                            <p className="text-xs text-primary-500 mb-2">گیرنده</p>
                            <div className="flex gap-2 mb-3">
                              {[
                                { id: 'admin', label: 'ادمین' },
                                { id: 'buyer', label: 'خریدار' },
                              ].map(opt => (
                                <button key={opt.id} type="button" onClick={() => setSellerNewTicket(t => ({ ...t, target: opt.id }))} className={`flex-1 py-2 rounded-full text-xs font-medium border ${(sellerNewTicket.target || 'admin') === opt.id ? 'bg-apple-blue text-white border-apple-blue' : 'plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium'}`}>{opt.label}</button>
                              ))}
                            </div>
                            <input value={sellerNewTicket.subject} onChange={e => setSellerNewTicket(t => ({...t, subject: e.target.value}))} placeholder="موضوع" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm mb-3 text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue" />
                            <div className="mb-3"><SimpleEditor
                              value={sellerNewTicket.body}
                              onChange={(html) => setSellerNewTicket(s => ({ ...s, body: html }))}
                              placeholder="متن پیام"
                              appearance="comment"
                              maxLength={2000}
                              allowTable
                            /></div>
                            <div className="flex gap-2">
                              <button type="button" onClick={() => {
                                if (!sellerNewTicket.subject.trim()) {
                                  showToast({ message: 'موضوع تیکت را وارد کنید', variant: 'error', duration: 3500, position: 'top-center' });
                                  return;
                                }
                                if (!htmlToPlain(sellerNewTicket.body || '').trim()) {
                                  showToast({ message: 'متن پیام را وارد کنید', variant: 'error', duration: 3500, position: 'top-center' });
                                  return;
                                }
                                const chkS = assertNoUserLinks(sellerNewTicket.subject);
                                const chkB = assertNoUserLinks(htmlToPlain(sellerNewTicket.body || ''));
                                if (!chkS.ok) { showToast({ message: String(chkS.error), variant: 'error', duration: 4500, position: 'top-center' }); return; }
                                if (!chkB.ok) { showToast({ message: String(chkB.error), variant: 'error', duration: 4500, position: 'top-center' }); return; }
                                const target = sellerNewTicket.target || 'admin';
                                const _tcode = generateTicketCode();
                                const nt = {
                                  id: _tcode,
                                  code: _tcode,
                                  type: target === 'buyer' ? 'buyer' : 'admin',
                                  subject: chkS.text,
                                  status: 'open',
                                  unread: false,
                                  date: new Date().toLocaleDateString('fa-IR'),
                                  messages: [{ from: 'seller', text: chkB.text, html: sellerNewTicket.body || '', date: new Date().toLocaleDateString('fa-IR') }],
                                };
                                saveSellerTickets([nt, ...(sellerTickets||[])]);
                                setSellerNewTicketOpen(false);
                                setSellerNewTicket({ subject: '', body: '', target: 'admin' });
                                showToast({ message: 'تیکت با موفقیت ثبت شد', variant: 'success', duration: 3500, position: 'top-center' });
                                scrollSellerPanelToTop();
                                requestAnimationFrame(() => scrollSellerPanelToTop());
                                setTimeout(() => scrollSellerPanelToTop(), 60);
                              }} className="flex-1 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium">ارسال</button>
                              <button type="button" onClick={() => setSellerNewTicketOpen(false)} className="px-5 py-2.5 rounded-full border border-primary-200 dark:border-white/30 text-sm">لغو</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {sellerTab === 'support' && sellerTicketDetailId && (() => {
                    const t = (sellerTickets || []).find(x => x.id === sellerTicketDetailId);
                    if (!t) return null;
                    return (
                      <div>
                        <button type="button" onClick={() => setSellerTicketDetailId(null)} className="text-xs text-primary-500 hover:text-apple-blue mb-4 flex items-center gap-1"><Icon name="arrowRight" size={14} /> بازگشت</button>
                        <h2 className="text-base font-bold text-primary-900 dark:text-white mb-1">{t.subject}</h2>
                        <p className="text-xs text-primary-500 mb-4 font-latin" dir="ltr">{t.code || t.id} · {t.date}</p>
                        <div className="space-y-3 mb-4">
                          {t.messages.map((m,i) => (
                            <div key={i} className={`p-3 rounded-xl text-xs ${m.from === 'seller' ? 'bg-apple-blue/10 text-primary-900 dark:text-white mr-6' : 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-white/80 ml-6'}`}>
                              <p className="font-medium mb-0.5">{m.from === 'seller' ? 'شما' : m.from === 'buyer' ? 'خریدار' : m.from === 'admin' ? 'ادمین' : 'سیستم'}</p>
                              <p>{stripLinksForDisplay(m.text)}</p>
                              <p className="text-xs text-primary-400 mt-1">{m.date}</p>
                            </div>
                          ))}
                        </div>
                        {t.status !== 'closed' && (
                          <div className="flex gap-2">
                            <div className="w-full flex flex-col gap-2">
                              <SimpleEditor
                                value={sellerTicketReply}
                                onChange={(html) => setSellerTicketReply(html)}
                                placeholder="پاسخ شما (بدون لینک)…"
                                appearance="comment"
                                maxLength={2000}
                                allowTable
                              />
                              <div className="flex justify-start w-full" dir="rtl">
                                <button type="button" onClick={() => {
                                  if (!htmlToPlain(sellerTicketReply || '').trim()) {
                                    showToast({ message: 'متن پاسخ را بنویسید', variant: 'error', duration: 3000, position: 'top-center' });
                                    return;
                                  }
                                  const chk = assertNoUserLinks(htmlToPlain(sellerTicketReply || ''));
                                  if (!chk.ok) { showToast({ message: String(chk.error), variant: 'error', duration: 4500, position: 'top-center' }); return; }
                                  saveSellerTickets((sellerTickets||[]).map(x => x.id===t.id ? { ...x, status:'waiting', messages:[...x.messages, { from:'seller', text:chk.text, html: sellerTicketReply, date: new Date().toLocaleDateString('fa-IR') }] } : x));
                                  setSellerTicketReply('');
                                  showToast({ message: 'پاسخ ارسال شد', variant: 'success', duration: 3000, position: 'top-center' });
                                }} className="px-4 py-2 rounded-full bg-apple-blue text-white text-sm font-medium">ارسال</button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Stats */}
                  {sellerTab === 'gifts' && (
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-base font-bold text-primary-900 dark:text-white">تخفیف‌ها و هدایا</h2>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <button
                            type="button"
                            onClick={() => {
                              setDiscountPickIds([]);
                              setDiscountMode('percent');
                              setDiscountPercent(15);
                              setDiscountPrices({});
                              setSellerPromoModal('discount');
                            }}
                            className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-full bg-[#4CCD99] text-white font-medium shadow-sm hover:opacity-95 transition"
                          >
                            <Icon name="tag" size={14} /> درخواست تخفیف
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setGiftCodeForm({ code: generateGiftCode(), search: '', selected: [], validDays: 7 });
                              setSellerPromoModal('gift');
                            }}
                            className="seller-gift-secondary-btn inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-full bg-white dark:bg-primary-800 !text-primary-900 dark:!text-white font-semibold border border-primary-300 dark:border-white/40 hover:border-[#4CCD99] transition"
                          >
                            <Icon name="gift" size={14} /> کد هدیه
                          </button>
                        </div>
                      </div>

                      {(sellerGifts || []).length === 0 ? (
                        <div className="text-center py-14 rounded-2xl border border-dashed border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900">
                          <Icon name="gift" size={32} className="mx-auto text-primary-300 mb-2" />
                          <p className="text-sm text-primary-500">هنوز هدیه‌ای ثبت نشده</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {(sellerGifts || []).map(g => (
                            <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center"><Icon name="gift" size={18} /></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-primary-900 dark:text-white font-latin" dir="ltr">{g.code}</p>
                                <p className="text-xs text-primary-500">{g.type === 'gift' ? 'کد هدیه' : 'تخفیف'} · {g.status === 'used' ? 'استفاده‌شده' : g.status === 'pending' ? 'در انتظار تأیید' : g.status === 'active' ? 'فعال' : g.status}{g.buyerName ? ` · ${g.buyerName}` : ''}{g.expiresAt ? ` · تا ${new Date(g.expiresAt).toLocaleDateString('fa-IR')}` : ''} · یک‌بارمصرف</p>
                              </div>
                              <button type="button" onClick={() => saveSellerGifts((sellerGifts || []).filter(x => x.id !== g.id))} className="text-xs text-red-500">حذف</button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* مودال درخواست تخفیف */}
                      {sellerPromoModal === 'discount' && (
                        <div className="site-modal-root" role="dialog" aria-modal="true">
                          <div className="site-modal-backdrop" onClick={() => setSellerPromoModal(null)} />
                          <div className="site-modal-panel bg-white dark:bg-primary-900 border border-primary-200 dark:border-white/15 p-4 sm:p-5">
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <h3 className="text-sm font-bold text-primary-900 dark:text-white">درخواست تخفیف کالا</h3>
                              <button type="button" onClick={() => setSellerPromoModal(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-primary-100 dark:hover:bg-primary-800" aria-label="بستن"><Icon name="x" size={16} /></button>
                            </div>
                            <p className="text-xs text-primary-500 mb-3">فقط درخواست ارسال می‌شود — فروشنده مستقیم محصول را در شگفت‌انگیز قرار نمی‌دهد. پس از تأیید ادمین، حداکثر ۱۰ کالای منتشرشده به مدت ۷ روز در «پیشنهادات شگفت‌انگیز» کل سایت (بین رقبا) دیده می‌شود. شرکت اختیاری است.</p>
                            <div className="flex gap-2 mb-3">
                              <button type="button" onClick={() => setDiscountMode('percent')} className={`flex-1 py-2 rounded-full text-xs font-medium border ${discountMode === 'percent' ? 'bg-[#4CCD99] text-white border-[#4CCD99]' : 'border-primary-200 dark:border-white/25 text-primary-700 dark:text-white'}`}>درصد یکسان</button>
                              <button type="button" onClick={() => setDiscountMode('price')} className={`flex-1 py-2 rounded-full text-xs font-medium border ${discountMode === 'price' ? 'bg-[#4CCD99] text-white border-[#4CCD99]' : 'border-primary-200 dark:border-white/25 text-primary-700 dark:text-white'}`}>قیمت جدید هر کالا</button>
                            </div>
                            {discountMode === 'percent' && (
                              <div className="mb-3">
                                <label className="text-xs text-primary-500 mb-1 block">درصد تخفیف برای انتخاب‌شده‌ها</label>
                                <input type="number" min={1} max={90} value={discountPercent} onChange={e => setDiscountPercent(Number(e.target.value) || 0)} className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white" dir="ltr" />
                              </div>
                            )}
                            <div className="space-y-2 max-h-64 overflow-y-auto mb-3">
                              {(sellerProducts || []).filter(p => p.status === 'active' || p.contentStatus === 'approved').map(p => {
                                const checked = discountPickIds.includes(p.id);
                                const price = Number(p.price) || 0;
                                return (
                                  <label key={p.id} className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer ${checked ? 'border-[#4CCD99]/60 bg-[#4CCD99]/5' : 'border-primary-200 dark:border-white/15'}`}>
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => {
                                        setDiscountPickIds(prev => {
                                          if (prev.includes(p.id)) return prev.filter(id => id !== p.id);
                                          if (prev.length >= 10) { showToast({ message: 'حداکثر ۱۰ کالا', variant: 'error', duration: 4500, position: 'top-center' }); return prev; }
                                          return [...prev, p.id];
                                        });
                                      }}
                                      className="mt-1"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-primary-900 dark:text-white">{p.name}</p>
                                      <p className="text-xs text-primary-500">قیمت فعلی: {toFa((price).toLocaleString())} تومان</p>
                                      {checked && discountMode === 'price' && (
                                        <input
                                          type="number"
                                          placeholder="قیمت تخفیف‌خورده"
                                          value={discountPrices[p.id] || ''}
                                          onChange={e => setDiscountPrices(prev => ({ ...prev, [p.id]: e.target.value }))}
                                          className="mt-1.5 w-full px-2.5 py-1.5 rounded-lg border border-primary-200 dark:border-white/20 bg-transparent text-xs text-primary-900 dark:text-white"
                                          dir="ltr"
                                        />
                                      )}
                                      {checked && discountMode === 'percent' && discountPercent > 0 && (
                                        <p className="text-xs text-[#4CCD99] mt-1">بعد از تخفیف: {toFa(Math.round(price * (1 - discountPercent / 100)).toLocaleString())} تومان</p>
                                      )}
                                    </div>
                                  </label>
                                );
                              })}
                              {!(sellerProducts || []).filter(p => p.status === 'active' || p.contentStatus === 'approved').length && (
                                <EmptyStateBox title="کالای منتشرشده‌ای نیست" className="py-6" />
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!discountPickIds.length) { showToast({ message: 'حداقل یک کالا انتخاب کنید', variant: 'error', duration: 4500, position: 'top-center' }); return; }
                                  const items = discountPickIds.map(id => {
                                    const p = (sellerProducts || []).find(x => x.id === id);
                                    const price = Number(p?.price) || 0;
                                    let sale = price;
                                    let percent = 0;
                                    if (discountMode === 'percent') {
                                      percent = Math.min(90, Math.max(1, Number(discountPercent) || 0));
                                      sale = Math.round(price * (1 - percent / 100));
                                    } else {
                                      sale = Number(String(discountPrices[id] || '').replace(/[^\d]/g, '')) || 0;
                                      if (!sale || sale >= price) {
                                        return null;
                                      }
                                      percent = Math.round((1 - sale / price) * 100);
                                    }
                                    return { productId: id, name: p?.name || '', oldPrice: price, salePrice: sale, percent };
                                  }).filter(Boolean);
                                  if (items.length !== discountPickIds.length) {
                                    showToast({ message: 'برای هر کالا قیمت جدید معتبر (کمتر از قیمت فعلی) وارد کنید', variant: 'default', duration: 4500, position: 'top-center' });
                                    return;
                                  }
                                  // سهمیه ماهانه: حداکثر ۱۰ آیتم
                                  let quota = {};
                                  try { quota = JSON.parse(localStorage.getItem('sellerDiscountQuota') || '{}'); } catch (_) { quota = {}; }
                                  // سرور: sellerUser.discountQuota
                                  if (sellerUser && sellerUser.discountQuota != null && sellerUser.id) { quota[sellerUser.id] = sellerUser.discountQuota; }
                                  const monthKey = new Date().toISOString().slice(0, 7);
                                  if (quota.month !== monthKey) quota = { month: monthKey, itemIds: [] };
                                  const merged = [...new Set([...(quota.itemIds || []), ...items.map(i => i.productId)])];
                                  if (merged.length > 10) {
                                    showToast({ message: 'سقف ماهانه ۱۰ کالا برای تخفیف پر شده است', variant: 'default', duration: 4500, position: 'top-center' });
                                    return;
                                  }
                                  const req = {
                                    id: 'sdisc-' + Date.now(),
                                    type: 'seller_discount',
                                    status: 'pending',
                                    sellerId: sellerUser?.id || 'own',
                                    sellerName: sellerUser?.shopName || sellerUser?.name || 'فروشنده',
                                    items,
                                    days: 7,
                                    createdAt: new Date().toISOString(),
                                    productName: `${items.length} کالا · تخفیف فروشنده`,
                                    text: items.map(i => `${i.name}: ${i.oldPrice} → ${i.salePrice} (${i.percent}%)`).join(' | '),
                                  };
                                  enqueueModeration(req);
                                  saveSellerGifts([
                                    { id: req.id, code: 'DISC-' + req.id.slice(-6), type: 'discount', status: 'pending', itemsCount: items.length },
                                    ...(sellerGifts || []),
                                  ]);
                                  setSellerPromoModal(null);
                                  pushLiveToast('درخواست تخفیف برای تأیید ادمین ارسال شد', { type: 'info' });
                                }}
                                className="flex-1 py-2.5 rounded-full bg-[#4CCD99] text-white text-sm font-medium"
                              >ارسال برای تأیید ادمین</button>
                              <button type="button" onClick={() => setSellerPromoModal(null)} className="px-5 py-2.5 rounded-full border border-primary-200 dark:border-white/30 text-sm text-primary-700 dark:text-white">لغو</button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* مودال کد هدیه */}
                      {sellerPromoModal === 'gift' && (
                        <div className="site-modal-root" role="dialog" aria-modal="true">
                          <div className="site-modal-backdrop" onClick={() => setSellerPromoModal(null)} />
                          <div className="site-modal-panel bg-white dark:bg-primary-900 border border-primary-200 dark:border-white/15 p-4 sm:p-5">
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <h3 className="text-sm font-bold text-primary-900 dark:text-white">ساخت کد هدیه</h3>
                              <button type="button" onClick={() => setSellerPromoModal(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-primary-100 dark:hover:bg-primary-800" aria-label="بستن"><Icon name="x" size={16} /></button>
                            </div>
                            <p className="text-xs text-primary-500 mb-3">کد به‌صورت خودکار و یکتا ساخته می‌شود. هر کد فقط یک‌بار قابل استفاده است. محدودیت ارسال ندارید.</p>
                            <label className="text-xs text-primary-500 mb-1 block">کد هدیه (خودکار · یکتا)</label>
                            <div className="flex gap-2 mb-3">
                              <input
                                value={giftCodeForm.code}
                                readOnly
                                dir="ltr"
                                className="flex-1 px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-primary-50 dark:bg-primary-900 text-sm font-latin text-primary-900 dark:text-white"
                              />
                              <button type="button" onClick={() => setGiftCodeForm(f => ({ ...f, code: generateGiftCode() }))} className="px-3 py-2 rounded-full border border-primary-200 dark:border-white/25 text-xs text-primary-700 dark:text-white whitespace-nowrap">کد جدید</button>
                            </div>
                            <label className="text-xs text-primary-500 mb-1 block">مهلت استفاده (روز)</label>
                            <input
                              type="number"
                              min={1}
                              max={365}
                              value={giftCodeForm.validDays || 7}
                              onChange={e => setGiftCodeForm(f => ({ ...f, validDays: Math.max(1, Number(e.target.value) || 7) }))}
                              className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white mb-3"
                              dir="ltr"
                            />
                            <label className="text-xs text-primary-500 mb-1 block">جستجوی خریدار</label>
                            <input
                              value={giftCodeForm.search}
                              onChange={e => setGiftCodeForm(f => ({ ...f, search: e.target.value }))}
                              placeholder="نام یا موبایل"
                              className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white mb-2"
                            />
                            <div className="space-y-1.5 max-h-48 overflow-y-auto mb-3">
                              {((adminBuyers || []).filter(b => {
                                const q = (giftCodeForm.search || '').trim();
                                if (!q) return true;
                                return (b.name || '').includes(q) || (b.phone || '').includes(q);
                              }).slice(0, 30)).map(b => {
                                const checked = (giftCodeForm.selected || []).includes(b.id);
                                return (
                                  <label key={b.id} className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer ${checked ? 'border-[#4CCD99]/50 bg-[#4CCD99]/5' : 'border-primary-100 dark:border-white/10'}`}>
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => {
                                        setGiftCodeForm(f => ({
                                          ...f,
                                          selected: checked ? (f.selected || []).filter(id => id !== b.id) : [...(f.selected || []), b.id],
                                        }));
                                      }}
                                    />
                                    <span className="text-xs text-primary-900 dark:text-white">{b.name || 'خریدار'}</span>
                                    <span className="text-xs text-primary-400 font-latin mr-auto" dir="ltr">{b.phone}</span>
                                  </label>
                                );
                              })}
                              {!(adminBuyers || []).length && <EmptyStateBox title="لیست خریداران خالی است" className="py-4" />}
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!(giftCodeForm.selected || []).length) { pushLiveToast('حداقل یک خریدار انتخاب کنید', { type: 'warning' }); return; }
                                  const buyers = (adminBuyers || []).filter(b => (giftCodeForm.selected || []).includes(b.id));
                                  const days = Math.max(1, Number(giftCodeForm.validDays) || 7);
                                  const expiresAt = new Date(Date.now() + days * 86400000).toISOString();
                                  const giftRows = buyers.map((b, idx) => {
                                    // هر گیرنده کد یکتا
                                    const code = idx === 0 && giftCodeForm.code ? String(giftCodeForm.code).toUpperCase() : generateGiftCode();
                                    return {
                                      id: 'gift-' + Date.now() + '-' + b.id + '-' + idx,
                                      code,
                                      type: 'gift',
                                      status: 'active',
                                      active: true,
                                      singleUse: true,
                                      buyerId: b.id,
                                      buyerName: b.name,
                                      sellerName: sellerUser?.shopName || sellerUser?.name || 'فروشنده',
                                      percent: 10,
                                      validDays: days,
                                      expiresAt,
                                      createdAt: new Date().toISOString(),
                                    };
                                  });
                                  saveSellerGifts([...giftRows, ...(sellerGifts || [])]);
                                  saveBuyerGifts([...giftRows, ...(buyerGifts || [])]);
                                  setSellerPromoModal(null);
                                  pushLiveToast(`کد هدیه یکتا برای ${toFa(buyers.length)} خریدار ارسال شد`, { type: 'info' });
                                }}
                                className="flex-1 py-2.5 rounded-full bg-[#4CCD99] text-white text-sm font-medium"
                              >تأیید و ارسال</button>
                              <button type="button" onClick={() => setSellerPromoModal(null)} className="px-5 py-2.5 rounded-full border border-primary-200 dark:border-white/30 text-sm text-primary-700 dark:text-white">لغو</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {sellerTab === 'stats' && (
                    <div className="space-y-6">
                      <h2 className="text-base font-bold text-primary-900 dark:text-white">آمار و گزارش</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { l:'فروش ۳۰ روز', v:'۴۵,۲۰۰,۰۰۰' },
                          { l:'تعداد سفارش', v: toFa((sellerOrders||[]).length) },
                          { l:'میانگین امتیاز', v:'۴.۷' },
                          { l:'بازدید فروشگاه', v: toFa(12840) },
                          { l:'فروش با تخفیف', v:'۸,۶۰۰,۰۰۰' },
                          { l:'سود بالقوه ماه', v:'۱۲,۴۰۰,۰۰۰' },
                        ].map(s => (
                          <div key={s.l} className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900"><p className="text-xs text-primary-500">{s.l}</p><p className="text-lg font-bold text-primary-900 dark:text-white mt-1">{s.v}</p></div>
                        ))}
                      </div>
                      {/* نمودار ساده فروش هفتگی */}
                      <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                        <h3 className="text-sm font-bold text-primary-900 dark:text-white mb-3">روند فروش ۷ روز اخیر</h3>
                        <div className="flex items-end gap-1.5 h-28">
                          {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                              <div className="w-full rounded-t-md bg-gradient-to-t from-apple-blue to-sky-400 dark:from-[#4CCD99] dark:to-orange-300" style={{ height: `${h}%` }} />
                              <span className="text-xs text-primary-400">{toFa(i + 1)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                        <h3 className="text-sm font-bold text-primary-900 dark:text-white mb-3">ترکیب فروش</h3>
                        <div className="space-y-2.5">
                          {[
                            { label: 'بدون تخفیف', pct: 62, color: 'bg-apple-blue' },
                            { label: 'با تخفیف', pct: 28, color: 'bg-amber-400' },
                            { label: 'پیشنهاد ویژه', pct: 10, color: 'bg-emerald-500' },
                          ].map(r => (
                            <div key={r.label}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-primary-600 dark:text-white/70">{r.label}</span>
                                <span className="font-medium text-primary-900 dark:text-white">{toFa(r.pct)}٪</span>
                              </div>
                              <div className="h-2 rounded-full bg-primary-100 dark:bg-primary-900 overflow-hidden">
                                <div className={`h-full rounded-full ${r.color}`} style={{ width: `${r.pct}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-primary-900 dark:text-white mb-3">محصولات پرفروش</h3>
                        <div className="space-y-2">
                          {[...(sellerProducts||[])].sort((a,b)=>(b.salesCount||0)-(a.salesCount||0)).slice(0,5).map(p => (
                            <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                              <img src={p.colors?.[0]?.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                              <p className="flex-1 text-xs font-medium text-primary-900 dark:text-white line-clamp-1">{p.name}</p>
                              <p className="text-xs text-primary-500">{toFa(p.salesCount||0)} فروش</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-primary-900 dark:text-white mb-3">پرفروش‌ترین‌ها در تخفیف</h3>
                        <div className="space-y-2">
                          {[...(sellerProducts||[])].filter(p => p.discount || p.oldPrice).sort((a,b)=>(b.salesCount||0)-(a.salesCount||0)).slice(0,3).map(p => (
                            <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-amber-200/60 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-900/10">
                              <img src={p.colors?.[0]?.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-primary-900 dark:text-white line-clamp-1">{p.name}</p>
                                <p className="text-xs text-amber-600">{p.discount ? `${toFa(p.discount)}٪ تخفیف` : 'تخفیف‌دار'}</p>
                              </div>
                              <p className="text-xs text-primary-500">{toFa(p.salesCount||0)} فروش</p>
                            </div>
                          ))}
                          {!(sellerProducts||[]).some(p => p.discount || p.oldPrice) && <EmptyStateBox title="محصول تخفیف‌داری نیست" className="py-4" />}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Shop profile */}
                  {sellerTab === 'tools' && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-base font-bold text-primary-900 dark:text-white">ابزارهای کمکی</h2>
                      </div>
                      {/* ورود / خروجی CSV */}
                      <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-3">
                        <h3 className="text-sm font-bold text-primary-900 dark:text-white flex items-center gap-2"><Icon name="upload" size={16} /> ورود و خروجی CSV</h3>
                        <p className="text-xs text-primary-500 dark:text-white/60">فایل استاندارد ووکامرس یا شاپیفای را وارد کنید یا از محصولات فعلی خروجی بگیرید.</p>
                        <div className="flex flex-wrap gap-2">
                          <label className="text-xs px-3 py-1.5 rounded-full border border-emerald-300 text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                            <Icon name="upload" size={14} /> ورود CSV
                            <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              if (!(typeof sellerCanSell === 'function' ? sellerCanSell() : sellerCanSell) && !['approved','active'].includes(String(sellerUser?.status||sellerUser?.shopStatus||'').toLowerCase()) && sellerUser?.licenseApproved !== true) {
                                showToast({ message: 'تا تأیید فروشگاه توسط ادمین، امکان ورود محصول نیست', variant: 'error', duration: 5000, position: 'top-center' });
                                e.target.value = '';
                                return;
                              }
                              importExternalProductsCsv(f, 'seller');
                              e.target.value = '';
                            }} />
                          </label>
                          <button type="button" onClick={() => backupSellerProducts('csv')} className="text-xs px-3 py-1.5 rounded-full border border-primary-200 dark:border-white/20 text-primary-700 dark:text-white font-medium flex items-center gap-1 hover:bg-primary-50 dark:hover:bg-primary-800">
                            <Icon name="download" size={14} /> خروجی CSV
                          </button>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-4 overflow-hidden">
                        <h3 className="text-sm font-bold text-primary-900 dark:text-white">ویرایشگر تصویر محصول</h3>
                        <p className="text-xs text-primary-500 leading-relaxed">عکس را آپلود کنید، داخل کادر جابه‌جا کنید تا از بالا/پایین برش نخورد، سپس پردازش WebP و تخصیص به یک محصول.</p>
                        {mediaToolStep === 'upload' && (
                          <div className="w-full overflow-hidden">
                            <label className="flex flex-col items-center justify-center gap-2 w-full min-h-[88px] px-4 py-4 rounded-xl border-2 border-dashed border-primary-200 dark:border-white/20 bg-primary-50/50 dark:bg-primary-900/40 cursor-pointer hover:border-apple-blue transition">
                              <Icon name="plus" size={20} className="text-primary-400" />
                              <span className="text-xs font-medium text-primary-700 dark:text-white">انتخاب تصویر</span>
                              <span className="text-xs text-primary-400">JPG, PNG · حداکثر ۲ مگابایت · خروجی WebP ≤ ۱۰۰KB</span>
                              <input type="file" accept="image/*" className="sr-only" onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              if (file.size > PRODUCT_IMG.maxUploadBytes) { showToast({ message: 'حجم فایل خام حداکثر ۲ مگابایت', variant: 'error', duration: 4500, position: 'top-center' }); return; }
                              const url = URL.createObjectURL(file);
                              setMediaToolSrc(url);
                              setMediaToolOffset({ x: 0, y: 0 });
                              setMediaToolScale(1);
                              setMediaToolStep('crop');
                            }} />
                            </label>
                          </div>
                        )}
                        {mediaToolStep === 'crop' && mediaToolSrc && (
                          <div className="space-y-3">
                            <div className="relative mx-auto w-[200px] h-[250px] overflow-hidden rounded-xl border-2 border-dashed border-apple-blue bg-primary-100 dark:bg-primary-900 touch-none"
                              onMouseDown={(e) => {
                                const startX = e.clientX, startY = e.clientY;
                                const ox = mediaToolOffset.x, oy = mediaToolOffset.y;
                                const move = (ev) => setMediaToolOffset({ x: ox + (ev.clientX - startX), y: oy + (ev.clientY - startY) });
                                const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
                                window.addEventListener('mousemove', move);
                                window.addEventListener('mouseup', up);
                              }}
                            >
                              <img src={mediaToolSrc} alt="" draggable={false} style={{ transform: `translate(${mediaToolOffset.x}px, ${mediaToolOffset.y}px) scale(${mediaToolScale})`, transformOrigin: 'center center', width: '100%', height: 'auto', minHeight: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
                              <div className="absolute inset-0 pointer-events-none border border-white/40" />
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <button type="button" aria-label="جابه‌جایی به چپ" onClick={() => setMediaToolOffset(o => ({ ...o, x: o.x - 12 }))} className="w-9 h-9 rounded-full border border-primary-200 dark:border-white/30 flex items-center justify-center text-primary-700 dark:text-white hover:bg-primary-50 dark:hover:bg-primary-800">
                                <Icon name="chevronLeft" size={16} />
                              </button>
                              <div className="flex flex-col gap-1">
                                <button type="button" aria-label="جابه‌جایی به بالا" onClick={() => setMediaToolOffset(o => ({ ...o, y: o.y - 12 }))} className="w-9 h-9 rounded-full border border-primary-200 dark:border-white/30 flex items-center justify-center text-primary-700 dark:text-white hover:bg-primary-50 dark:hover:bg-primary-800">
                                  <Icon name="chevronUp" size={16} />
                                </button>
                                <button type="button" aria-label="جابه‌جایی به پایین" onClick={() => setMediaToolOffset(o => ({ ...o, y: o.y + 12 }))} className="w-9 h-9 rounded-full border border-primary-200 dark:border-white/30 flex items-center justify-center text-primary-700 dark:text-white hover:bg-primary-50 dark:hover:bg-primary-800">
                                  <Icon name="chevronDown" size={16} />
                                </button>
                              </div>
                              <button type="button" aria-label="جابه‌جایی به راست" onClick={() => setMediaToolOffset(o => ({ ...o, x: o.x + 12 }))} className="w-9 h-9 rounded-full border border-primary-200 dark:border-white/30 flex items-center justify-center text-primary-700 dark:text-white hover:bg-primary-50 dark:hover:bg-primary-800">
                                <Icon name="chevronRight" size={16} />
                              </button>
                              <button type="button" onClick={() => setMediaToolOffset({ x: 0, y: 0 })} className="text-xs px-2 py-1 rounded-full border border-primary-200 dark:border-white/30 text-primary-600 dark:text-white/80">مرکز</button>
                            </div>
                            <p className="text-xs text-center text-primary-400">بکشید یا با دکمه‌ها جابه‌جا کنید · زوم:</p>
                            <input type="range" min="1" max="2.5" step="0.05" value={mediaToolScale} onChange={(e) => setMediaToolScale(Number(e.target.value))} className="w-full" />
                            <div className="flex gap-2">
                              <button type="button" disabled={mediaToolProcessing} onClick={async () => {
                                try {
                                  setMediaToolProcessing(true);
                                  const baseScale = mediaToolScale || 1;
                                  // Prefer custom crop from tool when scale/offset set
                                  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = mediaToolSrc; });
                                  const tw = PRODUCT_IMG.w, th = PRODUCT_IMG.h;
                                  const canvas = document.createElement('canvas');
                                  canvas.width = tw; canvas.height = th;
                                  const ctx = canvas.getContext('2d', { alpha: false });
                                  ctx.imageSmoothingEnabled = true;
                                  ctx.imageSmoothingQuality = 'high';
                                  const base = Math.max(tw / img.width, th / img.height) * baseScale;
                                  const dw = img.width * base, dh = img.height * base;
                                  const ox = (tw - dw) / 2 + (mediaToolOffset?.x || 0) * (tw / 200);
                                  const oy = (th - dh) / 2 + (mediaToolOffset?.y || 0) * (th / 250);
                                  ctx.fillStyle = '#fff'; ctx.fillRect(0,0,tw,th);
                                  ctx.drawImage(img, ox, oy, dw, dh);
                                  // Re-encode drawn canvas via processToProductWebP from dataURL of canvas (full quality path)
                                  const raw = canvas.toDataURL('image/png');
                                  const optimized = await processToProductWebP(raw, {});
                                  setMediaToolResult({ dataUrl: optimized.dataUrl, bytes: optimized.bytes });
                                  setMediaToolAssign({ productId: null, colorName: '', size: '' });
                                  setMediaToolStep('assign');
                                } catch (err) {
                                  showToast({ message: String(err.message || 'خطا در پردازش'), variant: 'error', duration: 4500, position: 'top-center' });
                                } finally {
                                  setMediaToolProcessing(false);
                                }
                              }} className="flex-1 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium disabled:opacity-50">{mediaToolProcessing ? 'در حال پردازش…' : 'پردازش WebP و ادامه'}</button>
                              <button type="button" onClick={() => { setMediaToolStep('upload'); setMediaToolSrc(null); }} className="px-4 py-2.5 rounded-full border border-primary-200 dark:border-white/30 text-sm">انصراف</button>
                            </div>
                          </div>
                        )}
                        {mediaToolStep === 'assign' && mediaToolResult && (
                          <div className="space-y-3">
                            <div className="flex gap-3 items-start">
                              <img src={mediaToolResult.dataUrl} alt="" className="w-24 h-30 rounded-lg object-cover border border-primary-200 dark:border-white/20" style={{ height: 120 }} />
                              <div className="text-xs text-primary-500">
                                <p>۸۰۰×۱۰۰۰ WebP</p>
                                <p>حجم ≈ {toFa(Math.round(mediaToolResult.bytes/1024))} کیلوبایت</p>
                              </div>
                            </div>
                            <p className="text-xs font-bold text-primary-900 dark:text-white">انتخاب یک محصول (فقط یکی)</p>
                            <input
                              type="search"
                              value={mediaToolSearch}
                              onChange={(e) => setMediaToolSearch(e.target.value)}
                              placeholder="جستجوی نام محصول…"
                              className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white placeholder:text-primary-400 focus:outline-none focus:border-apple-blue"
                            />
                            <div className="max-h-48 overflow-y-auto space-y-1.5 border border-primary-100 dark:border-white/10 rounded-xl bg-white dark:bg-primary-900 p-2">
                              {(sellerProducts || [])
                                .filter((pr) => {
                                  const q = mediaToolSearch.trim();
                                  if (!q) return true;
                                  return String(pr.name || '').includes(q);
                                })
                                .map((pr) => (
                                <label key={pr.id} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${mediaToolAssign.productId === pr.id ? 'bg-apple-blue/10 border border-apple-blue' : 'hover:bg-primary-50 dark:hover:bg-primary-900'}`}>
                                  <input type="radio" name="media-prod" checked={mediaToolAssign.productId === pr.id} onChange={() => setMediaToolAssign({ productId: pr.id, colorName: pr.colors?.[0]?.name || '', size: (pr.sizes||[])[0] || '' })} />
                                  <img src={pr.colors?.[0]?.image || pr.images?.[0]} alt="" className="w-8 h-8 rounded object-cover" />
                                  <span className="text-xs text-primary-900 dark:text-white line-clamp-1">{pr.name}</span>
                                  <span className="text-xs text-primary-400 mr-auto">{toFa((pr.images || pr.colors || []).length)}/۳</span>
                                </label>
                              ))}
                              {!(sellerProducts || []).length && <p className="text-xs text-primary-400 p-2">ابتدا یک محصول بسازید</p>}
                              {(sellerProducts || []).length > 0 && mediaToolSearch.trim() && !(sellerProducts || []).some(pr => String(pr.name || '').includes(mediaToolSearch.trim())) && (
                                <p className="text-xs text-primary-400 p-2">محصولی پیدا نشد</p>
                              )}
                            </div>
                            {mediaToolAssign.productId && (() => {
                              const pr = (sellerProducts || []).find(x => x.id === mediaToolAssign.productId);
                              if (!pr) return null;
                              return (
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-xs text-primary-500">رنگ</label>
                                    <select value={mediaToolAssign.colorName} onChange={e => setMediaToolAssign(a => ({...a, colorName: e.target.value}))} className="w-full px-2 py-1.5 rounded-lg border border-primary-200 dark:border-white/20 bg-transparent text-xs">
                                      {(pr.colors || [{ name: 'پیش‌فرض' }]).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-xs text-primary-500">سایز</label>
                                    <select value={mediaToolAssign.size} onChange={e => setMediaToolAssign(a => ({...a, size: e.target.value}))} className="w-full px-2 py-1.5 rounded-lg border border-primary-200 dark:border-white/20 bg-transparent text-xs">
                                      {(pr.sizes || ['Free']).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                  </div>
                                </div>
                              );
                            })()}
                            <button type="button" onClick={() => {
                              if (!mediaToolAssign.productId) { showToast({ message: 'یک محصول را انتخاب کنید', variant: 'default', duration: 4500, position: 'top-center' }); return; }
                              const pr = (sellerProducts || []).find(x => x.id === mediaToolAssign.productId);
                              if (!pr) return;
                              const imgs = [...(pr.images || (pr.colors?.[0]?.image ? [pr.colors[0].image] : []))];
                              if (imgs.length >= PRODUCT_IMG.maxPerProduct) { showToast({ message: 'هر محصول حداکثر ۸ تصویر', variant: 'error', duration: 4500, position: 'top-center' }); return; }
                              imgs.push(mediaToolResult.dataUrl);
                              const colors = [...(pr.colors || [])];
                              if (colors.length) {
                                const ci = colors.findIndex(c => c.name === mediaToolAssign.colorName);
                                if (ci >= 0) colors[ci] = { ...colors[ci], image: mediaToolResult.dataUrl };
                                else colors[0] = { ...colors[0], image: mediaToolResult.dataUrl };
                              } else {
                                colors.push({ name: mediaToolAssign.colorName || 'پیش‌فرض', hex: '#1a1a1a', image: mediaToolResult.dataUrl });
                              }
                              const featured = pr.featuredImageIndex != null ? pr.featuredImageIndex : 0;
                              saveSellerProducts((sellerProducts || []).map(x => x.id === pr.id ? { ...x, images: imgs, colors, featuredImageIndex: featured, contentStatus: 'pending' } : x));
                              enqueueModeration({ type: 'product_image', sellerId: sellerUser?.id || 'own', productId: pr.id, productName: pr.name, preview: mediaToolResult.dataUrl, meta: { color: mediaToolAssign.colorName, size: mediaToolAssign.size } });
                              showToast({ message: 'تصویر اضافه شد و برای تأیید ادمین ارسال شد', variant: 'default', duration: 4500, position: 'top-center' });
                              setMediaToolStep('upload'); setMediaToolSrc(null); setMediaToolResult(null);
                            }} className="w-full py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium">پایان و افزودن تصویر</button>
                            <button type="button" onClick={() => { setMediaToolStep('upload'); setMediaToolSrc(null); setMediaToolResult(null); }} className="w-full text-xs text-primary-500">شروع مجدد</button>
                          </div>
                        )}
                      </div>
                      <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-2">
                        <h3 className="text-sm font-bold text-primary-900 dark:text-white">استاندارد تصویر</h3>
                        <ul className="text-xs text-primary-500 space-y-1 list-disc list-inside">
                          <li>ابعاد خروجی: ۸۰۰×۱۰۰۰ پیکسل (نسبت ۴:۵)</li>
                          <li>فرمت: فقط WebP (تبدیل خودکار)</li>
                          <li>مجاز به افزودن ۳ تصویر هستید</li>
                        </ul>
                      </div>
                    </div>
                  )}

{sellerTab === 'kyc' && (
                    <div className="space-y-6 w-full">
                      <div>
                        <h2 className="text-base font-bold text-primary-900 dark:text-white">احراز هویت و مدارک</h2>
                        <p className="text-xs text-primary-500 mt-1">همه مدارک پس از ارسال منتظر تأیید ادمین می‌مانند.</p>
                      </div>
                      <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-primary-800 dark:text-white">وضعیت احراز</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${sellerUser.kycStatus==='approved'?'bg-emerald-100 text-emerald-700':sellerUser.kycStatus==='pending'?'bg-amber-100 text-amber-700':sellerUser.kycStatus==='rejected'?'bg-red-100 text-red-600':'bg-primary-100 text-primary-500'}`}>
                            {sellerUser.kycStatus==='approved'?'تأیید شده':sellerUser.kycStatus==='pending'?'در انتظار تأیید':sellerUser.kycStatus==='rejected'?'رد شده':'ارسال نشده'}
                          </span>
                        </div>
                        <div>
                          <label className="text-xs text-primary-500 mb-1 block">کد ملی</label>
                          <input id="kyc-national" defaultValue={sellerUser.nationalId||''} dir="ltr" maxLength={10} className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left font-latin text-primary-900 dark:text-white" />
                        </div>
                        <div>
                          <label className="text-xs text-primary-500 mb-1 block">شماره شناسنامه / ثبتی</label>
                          <input id="kyc-idno" defaultValue={sellerUser.idNumber||''} dir="ltr" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left font-latin text-primary-900 dark:text-white" />
                        </div>
                        <div>
                          <label className="text-xs text-primary-500 mb-1 block">تصویر کارت ملی (روی)</label>
                          <input type="file" accept="image/*" id="kyc-card-front" className="text-xs text-primary-700 dark:text-white w-full" />
                        </div>
                        <div>
                          <label className="text-xs text-primary-500 mb-1 block">تصویر کارت ملی (پشت)</label>
                          <input type="file" accept="image/*" id="kyc-card-back" className="text-xs text-primary-700 dark:text-white w-full" />
                        </div>
                        <div>
                          <label className="text-xs text-primary-500 mb-1 block">مجوز / جواز کسب <span className="text-red-500">*</span></label>
                          <input type="file" accept="image/*,.pdf" id="kyc-license" className="text-xs text-primary-700 dark:text-white w-full max-w-full" />
                        </div>
                        <div className="flex justify-end"><button type="button" onClick={async () => {
                          const readFile = (el) => new Promise((res) => {
                            const f = el?.files?.[0];
                            if (!f) return res('');
                            if (f.size > 5*1024*1024) { showToast({ message: 'حجم هر فایل حداکثر ۵ مگابایت', variant: 'error', duration: 4500, position: 'top-center' }); return res(''); }
                            const r = new FileReader();
                            r.onload = () => res(r.result);
                            r.readAsDataURL(f);
                          });
                          const nationalId = document.getElementById('kyc-national')?.value?.trim()||'';
                          if (nationalId && !/^\d{10}$/.test(nationalId)) { showToast({ message: 'کد ملی ۱۰ رقم باشد', variant: 'default', duration: 4500, position: 'top-center' }); return; }
                          const front = await readFile(document.getElementById('kyc-card-front'));
                          const back = await readFile(document.getElementById('kyc-card-back'));
                          const license = await readFile(document.getElementById('kyc-license'));
                          if (!license) {
                            showToast({ message: 'آپلود جواز کسب اجباری است', variant: 'error', duration: 4500, position: 'top-center' });
                            return;
                          }
                          const docs = { nationalId, idNumber: document.getElementById('kyc-idno')?.value||'', front, back, license, submittedAt: new Date().toISOString() };
                          saveSellerUser({ ...sellerUser, ...docs, kycStatus: 'pending', kycDocs: docs, licenseRequired: true, licenseApproved: false });
                          enqueueModeration({ type: 'seller_kyc', sellerId: sellerUser.id||'own', sellerName: sellerUser.shopName, text: `کد ملی: ${nationalId}`, preview: front || back });
                          showToast({ message: 'مدارک ارسال شد و منتظر تأیید ادمین است', variant: 'default', duration: 4500, position: 'top-center' });
                        }} className="px-5 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium hover:opacity-90 transition">ارسال مدارک برای تأیید</button></div>
                      </div>
                    </div>
                  )}

                  {sellerTab === 'finance' && (
                    <div className="space-y-6 w-full">
                      <div>
                        <h2 className="text-base font-bold text-primary-900 dark:text-white">مالی حساب</h2>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                          <p className="text-xs text-primary-500">موجودی قابل برداشت</p>
                          <p className="text-lg font-bold text-primary-900 dark:text-white mt-1">{toFa((sellerUser.balance||0).toLocaleString())} <span className="text-xs font-normal">تومان</span></p>
                        </div>
                        <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                          <p className="text-xs text-primary-500">در انتظار تأیید مالی</p>
                          <p className="text-lg font-bold text-primary-900 dark:text-white mt-1">{toFa((sellerUser.pendingPayout||0).toLocaleString())} <span className="text-xs font-normal">تومان</span></p>
                        </div>
                      </div>
                      {/* نمودار درآمد ماهانه */}
                      <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                        <h3 className="text-sm font-bold text-primary-900 dark:text-white mb-1">درآمد ماهانه</h3>
                        <p className="text-xs text-primary-400 mb-3">۶ ماه اخیر (میلیون تومان)</p>
                        <div className="flex items-end gap-2 h-32">
                          {[
                            { m: 'دی', v: 18 },
                            { m: 'بهمن', v: 24 },
                            { m: 'اسفند', v: 21 },
                            { m: 'فروردین', v: 32 },
                            { m: 'اردیبهشت', v: 28 },
                            { m: 'خرداد', v: 45 },
                          ].map((b) => (
                            <div key={b.m} className="flex-1 flex flex-col items-center gap-1">
                              <span className="text-xs font-medium text-primary-600 dark:text-white/70">{toFa(b.v)}</span>
                              <div className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 dark:from-emerald-500 dark:to-lime-400" style={{ height: `${(b.v / 45) * 100}%` }} />
                              <span className="text-xs text-primary-400">{b.m}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">
                        <h3 className="text-sm font-bold text-primary-900 dark:text-white mb-1">تفکیک مالی این ماه</h3>
                        <p className="text-xs text-primary-400 mb-3">مبنای کارمزد: مبلغ فروش بعد از تخفیف</p>
                        <div className="space-y-2">
                          {[
                            { label: 'فروش ناخالص', v: '۴۵,۲۰۰,۰۰۰', cls: 'text-primary-900 dark:text-white' },
                            { label: 'هزینه خدمات پلتفرم', v: '۳,۶۱۶,۰۰۰', cls: 'text-red-500' },
                            { label: 'سهم شما', v: '۴۱,۵۸۴,۰۰۰', cls: 'text-emerald-600' },
                          ].map(r => (
                            <div key={r.label} className="flex justify-between text-xs py-1.5 border-b border-primary-50 dark:border-white/5 last:border-0">
                              <span className="text-primary-500">{r.label}</span>
                              <span className={`font-bold ${r.cls}`}>{r.v} ت</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-3">
                        <h3 className="text-sm font-bold text-primary-900 dark:text-white">شماره شبا</h3>
                        <input id="fin-sheba" defaultValue={sellerUser.sheba||''} dir="ltr" placeholder="IR..." className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left font-latin text-primary-900 dark:text-white" />
                        <input id="fin-holder" defaultValue={sellerUser.accountHolder||sellerUser.ownerName||''} placeholder="نام صاحب حساب" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white" />
                        <div className="flex justify-start" dir="rtl"><button type="button" onClick={() => {
                          const sheba = document.getElementById('fin-sheba')?.value?.trim()||'';
                          const accountHolder = document.getElementById('fin-holder')?.value?.trim()||'';
                          if (!sheba.startsWith('IR') || sheba.length < 24) { showToast({ message: 'شبا معتبر وارد کنید', variant: 'default', duration: 4500, position: 'top-center' }); return; }
                          saveSellerUser({ ...sellerUser, sheba, accountHolder, shebaStatus: 'pending' });
                          enqueueModeration({ type: 'seller_sheba', sellerId: sellerUser.id||'own', sellerName: sellerUser.shopName, text: `شبا: ${sheba} · ${accountHolder}` });
                          showToast({ message: 'شبا برای تأیید ادمین ارسال شد', variant: 'default', duration: 4500, position: 'top-center' });
                        }} className="px-5 py-2.5 rounded-full border border-primary-200 dark:border-white/30 text-sm text-primary-800 dark:text-white hover:bg-primary-50 dark:hover:bg-primary-800 transition">ذخیره شبا (نیاز به تأیید)</button></div>
                      </div>
                      <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-2">
                        <h3 className="text-sm font-bold text-primary-900 dark:text-white">درخواست مالی (غیرفعال)</h3>
                        <button
                          type="button"
                          className="btn-cta text-xs px-3 py-1.5 rounded-full bg-apple-blue text-white font-bold"
                          onClick={async () => {
                            const raw = window.prompt('مبلغ (تومان)', '100000');
                            const amount = parseInt(String(raw || '').replace(/,/g, ''), 10);
                            if (!amount || amount < 10000) {
                              try { showToast({ message: 'مبلغ نامعتبر', variant: 'error', duration: 3000, position: 'top-center' }); } catch (_) {}
                              return;
                            }
                            try {
                              if (typeof requestSellerPayout === 'function') await requestSellerPayout(amount);
                              else {
                                const res = await fetch('/api/seller/payouts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ amount }) });
                                const data = await res.json().catch(() => ({}));
                                if (!res.ok || !data?.ok) throw new Error(data?.error || 'خطا');
                                if (typeof hydrateSellerPayouts === 'function') hydrateSellerPayouts();
                              }
                              try { showToast({ message: 'تسویه فروشنده فعلاً غیرفعال است', variant: 'default', duration: 3500, position: 'top-center' }); } catch (_) {}; return;
                            } catch (e) {
                              try { showToast({ message: e?.message || 'ثبت ناموفق', variant: 'error', duration: 3500, position: 'top-center' }); } catch (_) {}
                            }
                          }}
                        >
                          ثبت درخواست (به‌زودی)
                        </button>
                      </div>
                      {(sellerUser.payoutRequests||[]).length > 0 && (
                        <div className="p-4 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 space-y-2">
                          <h3 className="text-sm font-bold text-primary-900 dark:text-white">سابقه درخواست‌ها</h3>
                          {(sellerUser.payoutRequests||[]).slice(0,5).map(r => (
                            <div key={r.id} className="flex justify-between text-xs p-2 rounded-lg bg-primary-50 dark:bg-primary-900/50">
                              <span>{r.date} · {toFa((r.amount||0).toLocaleString())} ت</span>
                              <span className={r.status==='approved'?'text-emerald-600':r.status==='rejected'?'text-red-500':'text-amber-600'}>{r.status==='approved'?'پرداخت شد':r.status==='rejected'?'رد شد':'در انتظار'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

{sellerTab === 'shop' && (
                    <div className="p-4 sm:p-5 rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900">

                      <div className="mt-6 p-4 rounded-2xl border border-primary-200 dark:border-white/15 space-y-3" dir="rtl">
                        <h3 className="text-sm font-bold text-primary-900 dark:text-white">امنیت و رمز عبور</h3>
                        <p className="text-xs text-primary-500">برای ورود با رمز علاوه بر پیامک. فراموشی: ورود پیامکی سپس رمز جدید.</p>
                        <input type="password" id="seller-new-pw" placeholder="رمز جدید (حداقل ۶)" className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white" />
                        <input type="password" id="seller-new-pw2" placeholder="تکرار رمز" className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white" />
                        <button
                          type="button"
                          className="btn-cta text-xs px-4 py-2 rounded-full bg-apple-blue text-white font-bold"
                          onClick={async () => {
                            const a = document.getElementById('seller-new-pw')?.value || '';
                            const b = document.getElementById('seller-new-pw2')?.value || '';
                            const toast = (message, variant = 'default') => {
                              try { showToast({ message, variant, duration: 4500, position: 'top-center' }); } catch (_) {}
                            };
                            if (a.length < 6) { toast('رمز حداقل ۶ کاراکتر', 'error'); return; }
                            if (a !== b) { toast('تکرار رمز یکسان نیست', 'error'); return; }
                            try {
                              if (typeof setAccountPassword === 'function') await setAccountPassword(a);
                              else {
                                const res = await fetch('/api/auth/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ password: a }) });
                                const data = await res.json().catch(() => ({}));
                                if (!res.ok || data?.ok === false) throw new Error(data?.error || 'خطا');
                              }
                              toast('رمز با موفقیت ذخیره شد', 'success');
                              try { document.getElementById('seller-new-pw').value = ''; document.getElementById('seller-new-pw2').value = ''; } catch (_) {}
                            } catch (e) {
                              toast(e?.message || 'ذخیره ناموفق', 'error');
                            }
                          }}
                        >
                          ذخیره رمز
                        </button>
                      </div>

                      <h2 className="text-base font-bold text-primary-900 dark:text-white mb-4">اطلاعات فروشگاه</h2>
                      <p className="text-xs text-primary-400 mb-3">به‌جز ایمیل، اینستاگرام و بله، همه فیلدها الزامی هستند.</p>
                      <div className="space-y-4 w-full max-w-none">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-primary-500 mb-1.5 block">عکس پروفایل فروشگاه</label>
                            <div className="flex items-center gap-3">
                              <div className="w-20 h-20 rounded-full border border-primary-200 dark:border-white/20 overflow-hidden bg-primary-50 dark:bg-primary-800 flex items-center justify-center flex-shrink-0">
                                {sellerLogoUrl ? (
                                  <img src={sellerLogoUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-2xl font-bold text-primary-400">{(sellerUser?.shopName || 'ف')[0]}</span>
                                )}
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <input ref={sellerLogoInputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                  const f = e.target.files && e.target.files[0];
                                  e.target.value = '';
                                  if (f) await uploadSellerMedia(f, 'logo');
                                }} />
                                <button type="button" disabled={!!sellerMediaBusy} onClick={() => sellerLogoInputRef.current && sellerLogoInputRef.current.click()} className="text-xs px-3 py-1.5 rounded-full border border-primary-300 dark:border-white/30 bg-white dark:bg-primary-900 disabled:opacity-50">
                                  {sellerMediaBusy === 'logo' ? 'در حال آپلود…' : 'انتخاب عکس پروفایل'}
                                </button>
                                {(sellerUser?.logoStatus === 'pending' || sellerUser?.logo_status === 'pending' || sellerUser?.logoPendingUrl || sellerUser?.logo_pending_url) ? (
                                  <span className="text-[11px] text-amber-600">در انتظار تأیید ادمین</span>
                                ) : (sellerLogoUrl || sellerUser?.logoUrl) ? (
                                  <span className="text-[11px] text-emerald-600">منتشر شده</span>
                                ) : null}
                                {sellerLogoUrl ? (
                                  <button type="button" disabled={!!sellerMediaBusy} onClick={async () => {
                                    setSellerLogoUrl('');
                                    try {
                                      if (typeof updateSellerShopOnServer === 'function') {
                                        await updateSellerShopOnServer({ logoUrl: '', logo_url: '' });
                                      }
                                    } catch (_) {}
                                  }} className="text-[11px] text-red-600">حذف عکس پروفایل</button>
                                ) : null}
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-primary-500 mb-1.5 block">عکس کاور فروشگاه</label>
                            <div className="space-y-2">
                              <div className="w-full h-24 rounded-xl border border-primary-200 dark:border-white/20 overflow-hidden bg-primary-50 dark:bg-primary-800 flex items-center justify-center">
                                {sellerBannerUrl ? (
                                  <img src={sellerBannerUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-xs text-primary-400">کاور انتخاب نشده</span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <input ref={sellerBannerInputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                  const f = e.target.files && e.target.files[0];
                                  e.target.value = '';
                                  if (f) await uploadSellerMedia(f, 'banner');
                                }} />
                                <button type="button" disabled={!!sellerMediaBusy} onClick={() => sellerBannerInputRef.current && sellerBannerInputRef.current.click()} className="text-xs px-3 py-1.5 rounded-full border border-primary-300 dark:border-white/30 bg-white dark:bg-primary-900 disabled:opacity-50">
                                  {sellerMediaBusy === 'banner' ? 'در حال آپلود…' : 'انتخاب کاور'}
                                </button>
                                {(sellerUser?.bannerStatus === 'pending' || sellerUser?.banner_status === 'pending' || sellerUser?.bannerPendingUrl || sellerUser?.banner_pending_url) ? (
                                  <span className="text-[11px] text-amber-600">در انتظار تأیید ادمین</span>
                                ) : (sellerBannerUrl || sellerUser?.bannerUrl) ? (
                                  <span className="text-[11px] text-emerald-600">منتشر شده</span>
                                ) : null}
                                {sellerBannerUrl ? (
                                  <button type="button" disabled={!!sellerMediaBusy} onClick={async () => {
                                    setSellerBannerUrl('');
                                    try {
                                      if (typeof updateSellerShopOnServer === 'function') {
                                        await updateSellerShopOnServer({ bannerUrl: '', banner_url: '' });
                                      }
                                    } catch (_) {}
                                  }} className="text-[11px] text-red-600">حذف کاور</button>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div><label className="text-xs text-primary-500 mb-1 block">نام فروشگاه <span className="text-red-500">*</span></label><input defaultValue={sellerUser.shopName} id="s-shop" required className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue" /></div>
                        <div><label className="text-xs text-primary-500 mb-1 block">نام مسئول <span className="text-red-500">*</span></label><input defaultValue={sellerUser.ownerName} id="s-owner" required className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue" /></div>
                        <div><label className="text-xs text-primary-500 mb-1 block">موبایل <span className="text-red-500">*</span></label><input value={sellerUser.phone} disabled dir="ltr" className="w-full px-3 py-2.5 rounded-xl border border-primary-100 bg-primary-50 dark:bg-primary-900 text-sm text-primary-500 text-left" /></div>
                        <div><label className="text-xs text-primary-500 mb-1 block">ایمیل <span className="text-primary-400">(اختیاری)</span></label><input defaultValue={sellerUser.email||''} id="s-email" dir="ltr" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue" /></div>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className="text-xs text-primary-500 mb-1 block">استان <span className="text-red-500">*</span></label><input defaultValue={sellerUser.province||''} id="s-prov" required className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue" /></div>
                          <div><label className="text-xs text-primary-500 mb-1 block">شهر <span className="text-red-500">*</span></label><input defaultValue={sellerUser.city||''} id="s-city" required className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue" /></div>
                        </div>
                        <div><label className="text-xs text-primary-500 mb-1 block">آدرس پستی <span className="text-red-500">*</span></label><Textarea id="s-address" defaultValue={sellerUser.address||''} placeholder="آدرس کامل پستی" rows={2} style={{ minHeight: 72 }} /></div>
                        <div><label className="text-xs text-primary-500 mb-1 block">کد پستی <span className="text-red-500">*</span></label><input defaultValue={sellerUser.postal||''} id="s-postal" dir="ltr" maxLength={10} required placeholder="۱۰ رقم" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue" /></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-primary-500 mb-1 block">روزهای باز بودن <span className="text-red-500">*</span></label>
                            <input defaultValue={sellerUser.openDays||'شنبه تا پنجشنبه'} id="s-open-days" required placeholder="مثلاً شنبه تا پنجشنبه" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue" />
                          </div>
                          <div>
                            <label className="text-xs text-primary-500 mb-1 block">ساعت کاری <span className="text-red-500">*</span></label>
                            <input defaultValue={sellerUser.openHours||'۹ تا ۲۱'} id="s-open-hours" required dir="ltr" placeholder="09:00 - 21:00" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue" />
                          </div>
                        </div>
                        <div><label className="text-xs text-primary-500 mb-1 block">درباره فروشگاه <span className="text-red-500">*</span></label><Textarea id="s-about" defaultValue={sellerUser.about||''} placeholder="" rows={2} style={{ minHeight: 72 }} /></div>
                        <div><label className="text-xs text-primary-500 mb-1 block">اینستاگرام <span className="text-primary-400">(اختیاری)</span></label><input defaultValue={sellerUser.instagram||''} id="s-ig" dir="ltr" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue" /></div>
                        <div><label className="text-xs text-primary-500 mb-1 block">لینک بله <span className="text-primary-400">(اختیاری · پشتیبانی)</span></label><input defaultValue={sellerUser.bale||''} id="s-bale" dir="ltr" placeholder="https://ble.ir/..." className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue" /></div>
                        {/* شبا فقط در بخش مالی */}
                        <div className="p-3 rounded-xl bg-white dark:bg-primary-900 border border-primary-200 dark:border-white/15 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <label className="text-xs font-bold text-primary-800 dark:text-white">موقعیت فروشگاه روی نقشه نشان (مبدأ ارسال)</label>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${(sellerUser.locationStatus==='approved')?'bg-emerald-100 text-emerald-700':(sellerUser.locationStatus==='pending')?'bg-amber-100 text-amber-700':'bg-primary-100 text-primary-500'}`}>
                              {sellerUser.locationStatus==='approved'?'تأیید شده':sellerUser.locationStatus==='pending'?'در انتظار تأیید ادمین':'ثبت نشده'}
                            </span>
                          </div>
                          <p className="text-xs text-primary-400">پس از ثبت، ادمین باید تأیید کند تا در تسویه خریدار به‌عنوان مبدأ روی نقشه بیاید.</p>
                          <div className="relative rounded-xl overflow-hidden border border-primary-200 dark:border-white/20 h-40 bg-primary-100 dark:bg-primary-900">
                            <iframe title="مبدأ فروشنده" className="w-full h-full border-0" loading="lazy"
                              src={`https://www.openstreetmap.org/export/embed.html?bbox=${(sellerUser.lng||51.389)-0.02}%2C${(sellerUser.lat||35.689)-0.015}%2C${(sellerUser.lng||51.389)+0.02}%2C${(sellerUser.lat||35.689)+0.015}&layer=mapnik&marker=${sellerUser.lat||35.689}%2C${sellerUser.lng||51.389}`} />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-primary-500">عرض</label>
                              <input type="number" step="0.00001" dir="ltr" defaultValue={sellerUser.lat||35.6892} id="s-lat" className="w-full px-2 py-1.5 rounded-lg border border-primary-200 dark:border-white/20 bg-transparent text-xs text-left font-latin text-primary-900 dark:text-white" />
                            </div>
                            <div>
                              <label className="text-xs text-primary-500">طول</label>
                              <input type="number" step="0.00001" dir="ltr" defaultValue={sellerUser.lng||51.389} id="s-lng" className="w-full px-2 py-1.5 rounded-lg border border-primary-200 dark:border-white/20 bg-transparent text-xs text-left font-latin text-primary-900 dark:text-white" />
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={() => {
                              if (!navigator.geolocation) { showToast({ message: 'پشتیبانی نمی‌شود', variant: 'default', duration: 4500, position: 'top-center' }); return; }
                              navigator.geolocation.getCurrentPosition((pos) => {
                                const lat = pos.coords.latitude, lng = pos.coords.longitude;
                                const elat = document.getElementById('s-lat'); const elng = document.getElementById('s-lng');
                                if (elat) elat.value = lat; if (elng) elng.value = lng;
                                saveSellerUser({ ...sellerUser, lat, lng, locationStatus: 'pending' });
                                enqueueModeration({ type: 'seller_location', sellerId: sellerUser.id || 'own', sellerName: sellerUser.shopName, lat, lng, text: `مختصات: ${lat.toFixed(5)}, ${lng.toFixed(5)}` });
                                showToast({ message: 'موقعیت ثبت شد و برای تأیید ادمین ارسال شد', variant: 'success', duration: 4500, position: 'top-center' });
                              }, () => showToast({ message: 'دسترسی به موقعیت مجاز نیست', variant: 'error', duration: 4500, position: 'top-center' }));
                            }} className="text-xs px-3 py-1.5 rounded-full border plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium">موقعیت فعلی</button>
                            <button type="button" onClick={() => {
                              const lat = Number(document.getElementById('s-lat')?.value)||35.6892;
                              const lng = Number(document.getElementById('s-lng')?.value)||51.389;
                              saveSellerUser({ ...sellerUser, lat, lng, locationStatus: 'pending' });
                              enqueueModeration({ type: 'seller_location', sellerId: sellerUser.id || 'own', sellerName: sellerUser.shopName, lat, lng, text: `مختصات: ${lat.toFixed(5)}, ${lng.toFixed(5)}` });
                              showToast({ message: 'موقعیت ثبت شد و برای تأیید ادمین ارسال شد', variant: 'success', duration: 4500, position: 'top-center' });
                            }} className="text-xs px-3 py-1.5 rounded-full bg-apple-blue text-white">ثبت و ارسال برای تأیید</button>
                            <a href={`https://neshan.org/maps/@${sellerUser.lat||35.689},${sellerUser.lng||51.389},15.z`} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 rounded-full border plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium">باز کردن در نشان</a>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-primary-500 mb-2 block">روش‌های ارسالی که پشتیبانی می‌کنید</label>
                          <p className="text-xs text-primary-400 mb-2">از روش‌های فعال‌شده توسط ادمین انتخاب کنید.</p>
                          <div className="flex flex-wrap gap-2">
                            {(adminShippingMethods || []).filter((m) => m.enabled !== false).map((m) => {
                              const selected = (sellerUser.shippingMethodIds || []).includes(m.id);
                              return (
                                <button
                                  key={m.id}
                                  type="button"
                                  onClick={() => {
                                    const cur = sellerUser.shippingMethodIds || [];
                                    const next = selected ? cur.filter((x) => x !== m.id) : [...cur, m.id];
                                    saveSellerUser({ ...sellerUser, shippingMethodIds: next });
                                  }}
                                  className={`px-3 py-1.5 rounded-full text-xs border ${selected ? 'bg-apple-blue text-white border-apple-blue' : 'plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium'}`}
                                >
                                  {m.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex justify-start w-full" dir="rtl"><button type="button" onClick={async () => {
                          const shopName = document.getElementById('s-shop')?.value?.trim()||'';
                          const ownerName = document.getElementById('s-owner')?.value?.trim()||'';
                          const province = document.getElementById('s-prov')?.value?.trim()||'';
                          const city = document.getElementById('s-city')?.value?.trim()||'';
                          const address = document.getElementById('s-address')?.value?.trim()||'';
                          const postal = (document.getElementById('s-postal')?.value||'').replace(/\D/g,'');
                          const about = document.getElementById('s-about')?.value?.trim()||'';
                          let ig = (document.getElementById('s-ig')?.value||'').trim();
                          let bale = (document.getElementById('s-bale')?.value||'').trim();
                          if (!shopName || !ownerName || !province || !city || !address || postal.length !== 10 || !about) {
                            showToast({ message: 'همه فیلدهای ستاره‌دار الزامی هستند (کد پستی ۱۰ رقم)', variant: 'error', duration: 4500, position: 'top-center' });
                            return;
                          }
                          if (ig) {
                            const igOk = /^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)[A-Za-z0-9._]+\/?$/.test(ig) || /^@?[A-Za-z0-9._]{1,30}$/.test(ig);
                            if (!igOk) { showToast({ message: 'لینک اینستاگرام معتبر نیست. فقط آدرس instagram.com یا نام کاربری مجاز است.', variant: 'error', duration: 4500, position: 'top-center' }); return; }
                            if (ig.startsWith('@')) ig = 'https://instagram.com/' + ig.slice(1);
                            else if (!/^https?:\/\//i.test(ig) && !ig.includes('instagram.com')) ig = 'https://instagram.com/' + ig.replace(/^\//,'');
                            else if (!/^https?:\/\//i.test(ig)) ig = 'https://' + ig;
                          }
                          if (bale) {
                            const baleOk = /^(?:https?:\/\/)?(?:www\.)?ble\.ir\/[A-Za-z0-9._-]+\/?$/.test(bale);
                            if (!baleOk) { showToast({ message: 'لینک بله معتبر نیست. فقط ساختار https://ble.ir/نام‌کاربری مجاز است.', variant: 'error', duration: 4500, position: 'top-center' }); return; }
                            if (!/^https?:\/\//i.test(bale)) bale = 'https://' + bale.replace(/^\//,'');
                          }
                          const payload = {
                            shop_name: shopName,
                            shopName,
                            about,
                            city,
                            address,
                            phone: sellerUser?.phone || '',
                            // فیلدهای اضافه برای state محلی
                            ownerName,
                            province,
                            postal,
                            instagram: ig,
                            bale: bale,
                            lat: Number(document.getElementById('s-lat')?.value)||sellerUser.lat,
                            lng: Number(document.getElementById('s-lng')?.value)||sellerUser.lng,
                            email: document.getElementById('s-email')?.value||'',
                            shippingMethodIds: sellerUser.shippingMethodIds || [],
                            logoUrl: sellerLogoUrl || '',
                            logo_url: sellerLogoUrl || '',
                            bannerUrl: sellerBannerUrl || '',
                            banner_url: sellerBannerUrl || '',
                          };
                          // اول سرور
                          let serverOk = false;
                          if (typeof updateSellerShopOnServer === 'function') {
                            const s = await updateSellerShopOnServer(payload);
                            serverOk = !!s;
                          } else if (typeof createSellerShopOnServer === 'function') {
                            const s = await createSellerShopOnServer(payload);
                            serverOk = !!s;
                          }
                          // state محلی
                          saveSellerUser({
                            ...sellerUser,
                            ...payload,
                            shopName,
                            ownerName,
                          });
                          if (!serverOk) {
                            showToast({ message: 'ذخیره محلی انجام شد؛ همگام‌سازی سرور ناموفق بود', variant: 'error', duration: 4500, position: 'top-center' });
                          }
                        }} className="px-5 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium hover:opacity-90 transition">ذخیره تغییرات</button></div>
                      </div>
                    </div>
                  )}


                </div>
              </div>
            </div>
    </>
  );
}
