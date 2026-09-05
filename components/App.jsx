'use client';
import { checkSellerSeoSpam } from '@/lib/seo-spam';
import {
  ensureStorageVersion,
  storageGetJSON,
  storageSetJSON,
  downloadBackupFile,
  importClientBackup,
} from '@/lib/client-storage';
import {
  PRODUCT_IMG_DEFAULTS,
  encodeProductWebP,
  processProductImageFile as processProductImageFileUtil,
  fileToImage as fileToImageUtil,
} from '@/lib/image-webp-client';
import { apiUploadSellerProductImage, apiUploadMediaImage } from '@/lib/api/seller-products';
import {
  slugifyFa,
  FA_PATHS,
  pathForStaticPage,
  pathForBlogPost,
  pathForProduct,
  pathForSellerStore,
  pathForShop,
  parseFaPath,
  pushFaUrl,
  replaceFaUrl,
  LEGACY_EN_TO_FA,
  pathForCategory, pathForSellerCategory
} from '@/lib/fa-routes';

import { attachFocusTrap } from '@/lib/focus-trap';
import { loadGsap } from '@/lib/load-gsap';
import { useState, useEffect, useRef, useLayoutEffect, useCallback, useMemo, memo } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import ClientErrorBoundary from './ClientErrorBoundary';
import Icon from './Icon';
import { AppApiProvider } from './AppApiContext';
import ShopShell from './panels/ShopShell';
import { htmlToPlain } from '@/lib/html-plain';
import EmptyState from './EmptyState';
import { Textarea } from './ui/textarea';
import { Breadcrumb } from './ui/breadcrumb';
import Toaster, { showToast } from './ui/toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import {
  cartStore,
  hydrateCartStore,
  setCartItems,
  syncCartFromServer,
  addToCartServer,
  clearCartServer,
  removeCartItemServer,
  isServerCartEnabled,
  setServerCartEnabled,
} from '@/lib/stores/cartStore';
import { isServerProductId } from '@/lib/api/cart';
import { hydrateCatalogFromApi } from '@/lib/stores/catalogStore';
import { wishlistStore, hydrateWishlistStore, setWishlistIds, syncWishlistFromServer } from '@/lib/stores/wishlistStore';
import { compareStore, hydrateCompareStore, setCompareItems } from '@/lib/stores/compareStore';
import { hydrateSessionStore } from '@/lib/stores/sessionStore';
import { hydrateCatalogStore } from '@/lib/stores/catalogStore';
import { setPlpState } from '@/lib/stores/plpStore';
import { setUiFlags } from '@/lib/stores/uiStore';
import { useStore } from '@/lib/stores/useStore';
import { useStoreField } from '@/lib/stores/useStoreField';
import { shopUiStore } from '@/lib/stores/shopUiStore';
import { modalUiStore } from '@/lib/stores/modalUiStore';
import { commerceUiStore } from '@/lib/stores/commerceUiStore';
import { adminUiStore } from '@/lib/stores/adminUiStore';
import { sellerUiStore } from '@/lib/stores/sellerUiStore';
import { formsStore } from '@/lib/stores/formsStore';
import FocusTrap from './a11y/FocusTrap';
import { LoadingState, ErrorState, EmptyStateBox } from './ui/async-state';

/* —— Code-split heavy UI (PageSpeed: smaller initial JS) —— */
const Hero = dynamic(() => import('./Hero'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[100svh] bg-[#5C6065]" style={{ backgroundImage: 'url(/hero-poster.webp)', backgroundSize: 'cover', backgroundPosition: 'center' }} aria-hidden />
  ),
});
const SellerPanelContent = dynamic(() => import('./panels/SellerPanelContent'), { ssr: false, loading: () => null });
const AdminPanelContent = dynamic(() => import('./panels/AdminPanelContent'), { ssr: false, loading: () => null });
const SellerPanelShell = dynamic(() => import('./panels/SellerPanel'), { ssr: false, loading: () => null });
const AdminPanelShell = dynamic(() => import('./panels/AdminPanel'), { ssr: false, loading: () => null });
const CheckoutView = dynamic(() => import('./shop/CheckoutView'), { ssr: false, loading: () => null });
const ProfileView = dynamic(() => import('./shop/ProfileView'), { ssr: false, loading: () => null });
const CartPageView = dynamic(() => import('./shop/CartPageView'), { ssr: false, loading: () => null });
const WishlistPageView = dynamic(() => import('./shop/WishlistPageView'), { ssr: false, loading: () => null });
const ComparePageView = dynamic(() => import('./shop/ComparePageView'), { ssr: false, loading: () => null });
const RecentPageView = dynamic(() => import('./shop/RecentPageView'), { ssr: false, loading: () => null });
const PdpView = dynamic(() => import('./shop/PdpView'), { ssr: false, loading: () => null });
const TaxonomyHubView = dynamic(() => import('./shop/TaxonomyHubView'), { ssr: false, loading: () => null });
const PlpView = dynamic(() => import('./shop/PlpView'), { ssr: false, loading: () => null });
const SellerStorefrontView = dynamic(() => import('./shop/SellerStorefrontView'), { ssr: false, loading: () => null });
const SellersListView = dynamic(() => import('./shop/SellersListView'), { ssr: false, loading: () => null });
const HomeView = dynamic(() => import('./shop/HomeView'), { ssr: false, loading: () => (
  <div className="min-h-[100svh] bg-[#5C6065]" style={{ backgroundImage: 'url(/hero-poster.webp)', backgroundSize: 'cover', backgroundPosition: 'center' }} aria-hidden />
) });
const StaticPagesView = dynamic(() => import('./shop/StaticPagesView'), { ssr: false, loading: () => null });
const AuthModalView = dynamic(() => import('./shop/AuthModalView'), { ssr: false, loading: () => null });



const FAQMonochrome = dynamic(() => import('./ui/faq-monochrome').then((m) => m.FAQMonochrome || m.default), {
  ssr: false,
  loading: () => null,
});
const VirtualProductGrid = dynamic(() => import('./VirtualProductGrid'), {
  ssr: false,
  loading: () => <div className="min-h-[240px] animate-pulse rounded-2xl bg-primary-100 dark:bg-primary-900" aria-hidden />,
});
const SimpleEditor = dynamic(() => import('./SimpleEditor'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[120px] rounded-xl border border-primary-200 dark:border-white/15 bg-primary-50 dark:bg-primary-900/50 animate-pulse" aria-hidden />
  ),
});


    

    
    const toFa = (n) => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
    /** ارقام فارسی/عربی → انگلیسی */
    const toEnDigits = (s) => String(s ?? '')
      .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06F0))
      .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660));
    const onlyDigits = (v) => toEnDigits(v).replace(/\D/g, '');
    const ADMIN_ALLOWED_PHONES = ['09921863063'];
    const isAdminPhone = (raw) => ADMIN_ALLOWED_PHONES.includes(onlyDigits(raw));
    
    /** ممنوعیت لینک برای خریدار و فروشنده */
    const USER_LINK_RE = /(?:https?:\/\/|www\.|\/\/)|(?:\b[a-z0-9][a-z0-9-]{0,61}[a-z0-9]?\.(?:com|ir|net|org|io|co|me|info|app|dev|shop|store|xyz|online|site|link|blog|cloud|pro|tv|cc|biz|ai|eu|uk|de|fr|ca|us)\b)|(?:\b(?:t\.me|telegram\.me|instagram\.com|ig\.me|wa\.me|chat\.whatsapp\.com|youtu\.be|youtube\.com|twitter\.com|x\.com|linkedin\.com|facebook\.com|fb\.me|tiktok\.com|threads\.net|bit\.ly|cutt\.ly|rb\.gy|goo\.gl|eitaa\.com|splus\.ir|ble\.ir|rubika\.ir)\/[^\s]*)|(?:\[url\b|href\s*=|src\s*=)|(?:@\w{3,})/i;
    const textContainsForbiddenLink = (text) => {
      const t = String(text || '');
      if (!t.trim()) return false;
      if (USER_LINK_RE.test(t)) return true;
      if (/(?:^|[\s(])[a-z0-9-]+\.(?:com|ir|net|org)\//i.test(t)) return true;
      return false;
    };
    const assertNoUserLinks = (text, opts = {}) => {
      if (opts.allowAdmin) return { ok: true, text: String(text || '') };
      if (textContainsForbiddenLink(text)) {
        return { ok: false, error: opts.message || 'ارسال هرگونه لینک، آدرس وب، یا شناسه شبکه‌های اجتماعی مجاز نیست.' };
      }
      return { ok: true, text: String(text || '') };
    };
    const stripLinksForDisplay = (text) => String(text || '')
      .replace(/https?:\/\/[^\s]+/gi, '[لینک حذف‌شده]')
      .replace(/\bwww\.[^\s]+/gi, '[لینک حذف‌شده]');

    const allSizes = ['S', 'M', 'L', 'XL', 'XXL'];

    const OWN_SELLER = { id: 'own', name: 'فروشگاه مرکزی', rating: 0, ratingCount: 0 };
    const SELLERS = {
      own: OWN_SELLER,
    };
    const products = [];


    const sampleReviews = [];
    const completeTheLook = [];
    const sampleQuestions = [];
    const sizeGuideTable = [
      { size: 'S', chest: '۹۶', waist: '۸۴', length: '۷۲' },
      { size: 'M', chest: '۱۰۰', waist: '۸۸', length: '۷۴' },
      { size: 'L', chest: '۱۰۴', waist: '۹۲', length: '۷۶' },
      { size: 'XL', chest: '۱۱۰', waist: '۹۸', length: '۷۸' },
      { size: 'XXL', chest: '۱۱۶', waist: '۱۰۴', length: '۸۰' },
    ];

    /* ============================================================================
     * دسته‌بندی‌ها — قانون معماری (ریشه‌ای)
     * ----------------------------------------------------------------------------
     * همهٔ دسته‌ها (فعلی و آینده) فقط از طریق همان صفحهٔ فروشگاه / PLP باز می‌شوند.
     * ساختار UI = openPLP (فیلتر سایدبار + گرید + سورت + infinite scroll).
     * صفحهٔ جدا برای «دسته» ساخته نشود؛ فقط فیلتر cat روی PLP ست شود.
     * برای افزودن دستهٔ جدید: به این آرایه + PRODUCT_CAT_KEYS (در صورت نیاز) اضافه کنید
     * و از openCategory / openPLP({ cat }) استفاده کنید — نه صفحهٔ جدید.
     * ========================================================================== */
    const categories = [
      { name: "همه محصولات", icon: "grid", productKey: null },
    ];
    /** نرمال‌سازی نام دستهٔ نمایشی → کلید فیلتر محصول روی PLP */
    const normalizeCategoryKey = (raw) => {
      if (raw == null || raw === '') return null;
      const s = String(raw).trim();
      if (!s || s === 'همه' || s === 'همه محصولات') return null;
      const found = categories.find(
        (c) => c.name === s || c.productKey === s || c.name.replace('پیراهن ', '') === s.replace('پیراهن ', '')
      );
      if (found) return found.productKey; // null = همه محصولات
      const stripped = s.replace(/^پیراهن\s+/, '');
      if (stripped.includes('لینن') || stripped.includes('آستین بلند')) return 'آستین کوتاه';
      if (stripped.includes('آستین کوتاه')) return 'آستین کوتاه';
      if (stripped.includes('کروات')) return 'کروات';
      if (stripped.includes('رسمی')) return 'رسمی';
      return stripped;
    };

    const navLinks = [
      { label: "خانه", href: "#" },
      { label: "فروشگاه", href: "#" },
      { label: "دسته‌بندی‌ها", href: "#" },
      { label: "درباره ما", href: "#" },
      { label: "تماس با ما", href: "#" },
    ];


    const brands = [];

    const features = [
      { title: "ضمانت بازگشت", desc: "۷ روز ضمانت بازگشت کالا", icon: "refresh" },
      { title: "اصالت کالا", desc: "تأمین از فروشندگان معتبر", icon: "badge" },
      { title: "خرید مطمئن", desc: "پیگیری سفارش در پنل", icon: "shield" },
      { title: "پشتیبانی سریع", desc: "پاسخگویی در کوتاه‌ترین زمان", icon: "headphones" },
    ];

    const topSellersSeed = [];

    const blogs = [];

    const stats = [
      { title: "تنوع در کیفیت", desc: "از بهترین برندها", icon: "gift" },
      { title: "تخفیف های ویژه", desc: "در مناسبت های مختلف", icon: "percent" },
      { title: "پشتیبانی آنلاین", desc: "پاسخگوی شما هستیم", icon: "headphones" },
      { title: "باشگاه مشتریان", desc: "امتیاز جمع کنید و تخفیف بگیرید", icon: "users" },
    ];

    const reviews = [];

    function App({ initialProductCode = null, initialBlogId = null } = {}) {
      const navigateToHome = () => {
        try {
          if (typeof setShowSellerPanel === 'function') setShowSellerPanel(false);
          if (typeof setShowAdminPanel === 'function') setShowAdminPanel(false);
          if (typeof setShowBuyerPanel === 'function') setShowBuyerPanel(false);
          if (typeof setSellerUser === 'function') setSellerUser(null);
          if (typeof setAdminUser === 'function') setAdminUser(null);
        } catch (_) {}
        try {
          const home = '/';
          if (typeof window !== 'undefined') {
            window.history.pushState({}, '', home);
            window.dispatchEvent(new PopStateEvent('popstate'));
            // fallback سخت اگر SPA route نشنود
            setTimeout(() => {
              if (window.location.pathname.indexOf('پنل') !== -1 || window.location.pathname.indexOf('%D9%BE%D9%86%D9%84') !== -1) {
                window.location.assign('/');
              }
            }, 50);
          }
        } catch (_) {
          try { window.location.href = '/'; } catch (__) {}
        }
        try { if (typeof setPage === 'function') setPage('home'); } catch (_) {}
      };

      const hydrateSiteSettingsFromApi = async () => {
        try {
          const res = await fetch('/api/site-settings', { cache: 'no-store' });
          const json = await res.json().catch(() => ({}));
          if (!json?.ok || !json.settings) return;
          if (Array.isArray(json.settings.faqs)) {
            setSiteFaqs(json.settings.faqs);
            try { localStorage.setItem('siteFaqs', JSON.stringify(json.settings.faqs)); } catch (_) {}
          }
          if (json.settings.pages && typeof json.settings.pages === 'object') {
            setAdminPageContent(json.settings.pages);
            try { localStorage.setItem('adminPageContent', JSON.stringify(json.settings.pages)); } catch (_) {}
          }
        } catch (_) {}
      };

      const hydrateShippingMethodsFromApi = async () => {
        try {
          const res = await fetch('/api/shipping-methods', { credentials: 'include', cache: 'no-store' });
          const json = await res.json().catch(() => ({}));
          if (json?.ok && Array.isArray(json.items) && json.items.length) {
            const mapped = json.items.map((m) => ({
              id: m.code || m.id,
              code: m.code,
              title: m.title,
              name: m.title,
              price: m.price,
              baseCost: m.price,
              eta: m.eta || '',
              enabled: m.enabled !== false,
              sort_order: m.sort_order,
              priceMode: 'fixed',
            }));
            try { setAdminShippingMethods(mapped); } catch (_) {}
            try { localStorage.setItem('adminShippingMethods', JSON.stringify(mapped)); } catch (_) {}
            return true;
          }
        } catch (_) {}
        return false;
      };


      const [dark, setDark] = useStoreField(shopUiStore, 'dark');
      
      // Clean legacy ?view= query from URLs (site-wide)
      try {
        if (typeof window !== 'undefined') {
          const u = new URL(window.location.href);
          if (u.searchParams.has('view')) {
            u.searchParams.delete('view');
            const clean = u.pathname + (u.searchParams.toString() ? '?' + u.searchParams.toString() : '') + u.hash;
            window.history.replaceState(window.history.state || {}, '', clean);
          }
        }
      } catch (_) {}

      useEffect(() => { try { ensureStorageVersion(); } catch (_) {} }, []);
      useEffect(() => {
        hydrateSiteSettingsFromApi();
        try { hydrateCampaignsFromApi(false); } catch (_) {}
        hydrateShippingMethodsFromApi?.();
        try {
          hydrateCartStore();
          hydrateWishlistStore();
          hydrateCompareStore();
          hydrateSessionStore();
          hydrateCatalogStore();
        } catch (_) {}
      }, []);

      const [cartOpen, setCartOpen] = useStoreField(modalUiStore, 'cartOpen')
      const cart = useStore(cartStore);
      const setCart = useCallback((updater) => {
        const prev = cartStore.getState();
        const next = typeof updater === 'function' ? updater(prev) : updater;
        setCartItems(Array.isArray(next) ? next : []);
      }, []);
      const [couponInput, setCouponInput] = useStoreField(shopUiStore, 'couponInput');
      const [couponApplied, setCouponApplied] = useStoreField(shopUiStore, 'couponApplied');
      const [couponMsg, setCouponMsg] = useStoreField(shopUiStore, 'couponMsg');
      const [clearCartConfirm, setClearCartConfirm] = useStoreField(modalUiStore, 'clearCartConfirm')
      const [cartItemLoading, setCartItemLoading] = useStoreField(shopUiStore, 'cartItemLoading');
      const [selectedColors, setSelectedColors] = useStoreField(shopUiStore, 'selectedColors');
      const [selectedSizes, setSelectedSizes] = useStoreField(shopUiStore, 'selectedSizes');
      const safeColorIdx = (id) => {
        const m = selectedColors && typeof selectedColors === 'object' ? selectedColors : {};
        return Number(m[id]) || 0;
      };
      const safeSizeSel = (id, fallback = '') => {
        const m = selectedSizes && typeof selectedSizes === 'object' ? selectedSizes : {};
        return m[id] || fallback;
      };
      const [cardQtys, setCardQtys] = useStoreField(shopUiStore, 'cardQtys');
      const [quickAdd, setQuickAdd] = useStoreField(modalUiStore, 'quickAdd');
      const [quickColorIdx, setQuickColorIdx] = useStoreField(modalUiStore, 'quickColorIdx')
      const [quickSize, setQuickSize] = useStoreField(modalUiStore, 'quickSize')
      const [quickQty, setQuickQty] = useStoreField(modalUiStore, 'quickQty')
      const [quickGalleryIdx, setQuickGalleryIdx] = useStoreField(modalUiStore, 'quickGalleryIdx')
      const [quickDescOpen, setQuickDescOpen] = useStoreField(modalUiStore, 'quickDescOpen')
      // ——— PDP (صفحه جزئیات محصول) ———
      const [pdpProduct, setPdpProduct] = useStoreField(commerceUiStore, 'pdpProduct')
      // deep-link /product/... : تا باز شدن PDP هیرو/خانه نشان داده نشود (فقط لودینگ ساده)
      const [awaitingDeepProduct, setAwaitingDeepProduct] = useState(() => {
        try {
          if (initialProductCode) return true;
          if (typeof window !== 'undefined') {
            const path = window.location.pathname || '';
            if (path.startsWith('/product/')) return true;
            const q = new URLSearchParams(window.location.search || '');
            if (q.get('product') || q.get('p')) return true;
          }
        } catch (_) {}
        return false;
      });
      /** متن لودینگ بین صفحات — مختص همان صفحه */
      const [pageLoadingText, setPageLoadingText] = useState(null);
      const PAGE_LOAD_LABELS = {
        product: 'در حال بارگذاری محصول…',
        shop: 'در حال بارگذاری فروشگاه…',
        cart: 'در حال بارگذاری سبد خرید…',
        checkout: 'در حال بارگذاری تسویه حساب…',
        wishlist: 'در حال بارگذاری علاقه‌مندی‌ها…',
        compare: 'در حال بارگذاری مقایسه…',
        recent: 'در حال بارگذاری بازدیدهای اخیر…',
        profile: 'در حال بارگذاری حساب کاربری…',
        sellers: 'در حال بارگذاری فروشندگان…',
        categories: 'در حال بارگذاری دسته‌بندی‌ها…',
        tags: 'در حال بارگذاری برچسب‌ها…',
        'seller-panel': 'در حال بارگذاری پنل فروشنده…',
        'admin-panel': 'در حال بارگذاری پنل مدیریت…',
        about: 'در حال بارگذاری درباره ما…',
        contact: 'در حال بارگذاری تماس با ما…',
        faq: 'در حال بارگذاری سوالات متداول…',
        'size-guide': 'در حال بارگذاری راهنمای سایز…',
        'become-seller': 'در حال بارگذاری فروشنده شوید…',
        terms: 'در حال بارگذاری قوانین…',
        returns: 'در حال بارگذاری مرجوعی…',
        privacy: 'در حال بارگذاری حریم خصوصی…',
        cookies: 'در حال بارگذاری کوکی‌ها…',
        sitemap: 'در حال بارگذاری نقشه سایت…',
        blog: 'در حال بارگذاری بلاگ…',
        'blog-post': 'در حال بارگذاری مطلب…',
        brands: 'در حال بارگذاری برندها…',
        campaigns: 'در حال بارگذاری کمپین‌ها…',
        deals: 'در حال بارگذاری پیشنهادها…',
        home: 'در حال بارگذاری…',
      };
      const beginPageLoad = (key) => {
        try {
          const msg = PAGE_LOAD_LABELS[key] || (key ? ('در حال بارگذاری ' + key + '…') : 'در حال بارگذاری…');
          setPageLoadingText(msg);
        } catch (_) {}
      };
      const endPageLoad = () => {
        try {
          requestAnimationFrame(() => {
            setTimeout(() => { try { setPageLoadingText(null); } catch (_) {} }, 200);
          });
        } catch (_) {
          try { setPageLoadingText(null); } catch (__) {}
        }
      };

      const [pdpColorIdx, setPdpColorIdx] = useStoreField(commerceUiStore, 'pdpColorIdx')
      const [pdpGalleryIdx, setPdpGalleryIdx] = useStoreField(commerceUiStore, 'pdpGalleryIdx')
      const [pdpSize, setPdpSize] = useStoreField(commerceUiStore, 'pdpSize')
      const [pdpAttrs, setPdpAttrs] = useStoreField(commerceUiStore, 'pdpAttrs')
      const [pdpQty, setPdpQty] = useStoreField(commerceUiStore, 'pdpQty')
      const [pdpTab, setPdpTab] = useStoreField(commerceUiStore, 'pdpTab');
      const [pdpReviewFilter, setPdpReviewFilter] = useStoreField(commerceUiStore, 'pdpReviewFilter');
      const [pdpZoom, setPdpZoom] = useStoreField(commerceUiStore, 'pdpZoom')
      const [pdpGiftWrap, setPdpGiftWrap] = useStoreField(commerceUiStore, 'pdpGiftWrap')
      const [pdpExpress, setPdpExpress] = useStoreField(commerceUiStore, 'pdpExpress')
      const [pdpNotifyOpen, setPdpNotifyOpen] = useStoreField(modalUiStore, 'pdpNotifyOpen')
      const [pdpQText, setPdpQText] = useStoreField(commerceUiStore, 'pdpQText')
      const [pdpQaFilter, setPdpQaFilter] = useStoreField(commerceUiStore, 'pdpQaFilter');
      const [pdpSizeRecOpen, setPdpSizeRecOpen] = useStoreField(modalUiStore, 'pdpSizeRecOpen')
      const [pdpHeight, setPdpHeight] = useStoreField(commerceUiStore, 'pdpHeight')
      const [pdpWeight, setPdpWeight] = useStoreField(commerceUiStore, 'pdpWeight')
      const [pdpSizeRec, setPdpSizeRec] = useStoreField(commerceUiStore, 'pdpSizeRec')
      const [recentlyViewed, setRecentlyViewed] = useStoreField(shopUiStore, 'recentlyViewed');
      const [pdpSticky, setPdpSticky] = useStoreField(commerceUiStore, 'pdpSticky')
      const [pdpTouchX, setPdpTouchX] = useStoreField(commerceUiStore, 'pdpTouchX')
      const compare = useStore(compareStore);
      const setCompare = useCallback((updater) => {
        const prev = compareStore.getState();
        const next = typeof updater === 'function' ? updater(prev) : updater;
        setCompareItems(Array.isArray(next) ? next : []);
      }, []);
      const [showComparePage, setShowComparePage] = useStoreField(shopUiStore, 'showComparePage');
      const [compareOpen, setCompareOpen] = useStoreField(modalUiStore, 'compareOpen');
      const [compareOnlyDiffs, setCompareOnlyDiffs] = useStoreField(shopUiStore, 'compareOnlyDiffs');
      const [compareToast, setCompareToast] = useStoreField(shopUiStore, 'compareToast');
      const [compareReplaceOpen, setCompareReplaceOpen] = useStoreField(modalUiStore, 'compareReplaceOpen');
      const COMPARE_MAX = 4;
      const [searchOpen, setSearchOpen] = useStoreField(modalUiStore, 'searchOpen')
      const [catOpen, setCatOpen] = useStoreField(modalUiStore, 'catOpen')
      const [mobileMenuOpen, setMobileMenuOpen] = useStoreField(modalUiStore, 'mobileMenuOpen')
      const [megaOpen, setMegaOpen] = useStoreField(modalUiStore, 'megaOpen');
      const megaTimeout = useRef(null);
      useEffect(() => {
        if (megaOpen) {
          setSearchSuggestOpen(false);
          setCatOpen(false);
        }
      }, [megaOpen]);
      const [oldPriceOpen, setOldPriceOpen] = useStoreField(modalUiStore, 'oldPriceOpen');
      const [hasMounted, setHasMounted] = useStoreField(shopUiStore, 'hasMounted');
      useEffect(() => { setHasMounted(true); }, []);
      // محصولات فعال از سرور (Supabase) — تا در فروشگاه دیده شوند
      const [serverProducts, setServerProducts] = useState([]);
      const [catalogFetchDone, setCatalogFetchDone] = useState(false);
      const isUsableProductImage = (u) => {
        if (typeof u !== 'string') return false;
        const s = u.trim();
        if (!s || s === '/logo.webp') return false;
        // URL ناقص مثل "https:" یا path خالی را رد کن
        if (/^https?:\/\/?$/i.test(s)) return false;
        if (/^https?:\/\//i.test(s)) return s.length > 12;
        if (s.startsWith('/') && s.length > 3) return true;
        if (s.startsWith('data:image/')) return true;
        return false;
      };
      const pickProductImage = (p) => {
        if (!p) return '';
        const candidates = [
          p.cover_image,
          p.image,
          ...(Array.isArray(p.images) ? p.images : []),
          ...(Array.isArray(p.colors) ? p.colors.map((c) => c && c.image) : []),
        ];
        for (const u of candidates) {
          if (isUsableProductImage(u)) return String(u).trim();
        }
        return '';
      };
      const mapCatalogRow = (p) => {
        if (!p) return null;
        const base = Number(p.base_price ?? p.price) || 0;
        const disc = Number(p.discount_percent) || 0;
        const price = disc > 0 ? Math.round(base * (1 - disc / 100)) : base;
        const img = pickProductImage(p);
        const imgs = Array.isArray(p.images) && p.images.length
          ? p.images.filter(isUsableProductImage)
          : (img ? [img] : []);
        if (img && !imgs.length) imgs.push(img);
        const name = p.title || p.name || 'محصول';
        const sid = p.seller_id || p.sellerId || p.seller?.id || null;
        const sname =
          p.seller_name ||
          p.seller?.name ||
          p.sellerName ||
          'فروشگاه';
        const stockN = Number(p.stock);
        let colors = Array.isArray(p.colors) && p.colors.length ? p.colors.map((c) => ({ ...c })) : [];
        if (!colors.length) {
          colors = [{ name: 'پیش‌فرض', hex: '#999', image: img || '/logo.webp' }];
        } else {
          colors = colors.map((c, i) => {
            const cImg = isUsableProductImage(c && c.image) ? String(c.image).trim() : (imgs[i] || img || '/logo.webp');
            return { ...(c || {}), image: cImg };
          });
        }
        return {
          id: p.id,
          product_id: p.id,
          productCode: p.productCode || p.product_code || '',
          product_code: p.productCode || p.product_code || '',
          name,
          title: name,
          slug: p.slug || '',
          price,
          priceText: (() => {
            try {
              return price.toLocaleString('fa-IR');
            } catch {
              return String(price);
            }
          })(),
          oldPrice: disc > 0 ? base : null,
          discount: disc,
          image: img || (colors[0] && colors[0].image) || '',
          cover_image: img || null,
          images: imgs.length ? imgs : (img ? [img] : []),
          colors,
          sizes: Array.isArray(p.sizes) && p.sizes.length ? p.sizes : ['S', 'M', 'L', 'XL', 'XXL'],
          status: p.status || 'active',
          category: p.category_name || p.category || 'عمومی',
          seller: {
            id: sid || 'own',
            name: sname && sname !== 'undefined' ? sname : 'فروشگاه',
          },
          sellerId: sid || 'own',
          sellerName: sname && sname !== 'undefined' ? sname : 'فروشگاه',
          inStock: Number.isFinite(stockN) ? stockN > 0 : true,
          stock: Number.isFinite(stockN) ? stockN : null,
          description: p.description || '',
          fromServer: true,
          scheduledPublishAt: p.scheduled_publish_at || null,
        };
      };

      const reloadServerCatalog = async () => {
        try {
          const res = await fetch('/api/catalog/products?limit=200', {
            credentials: 'include',
            headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
            cache: 'no-store',
          });
          const data = await res.json().catch(() => null);
          const list = Array.isArray(data?.products) ? data.products : [];
          if (!data?.ok && !list.length) return;
          const mapped = list.map(mapCatalogRow).filter(Boolean);
          setServerProducts((prev) => {
            try {
              const prevIds = (prev || []).map((x) => `${x.id}:${x.price}:${x.status}:${x.image}`).join('|');
              const nextIds = mapped.map((x) => `${x.id}:${x.price}:${x.status}:${x.image}`).join('|');
              if (prevIds === nextIds) return prev;
            } catch (_) {}
            return mapped;
          });
          try { setCatalogFetchDone(true); } catch (_) {}
        } catch (_) {
          try { setCatalogFetchDone(true); } catch (_) {}
        }
      };

      useEffect(() => {
        let cancelled = false;
        (async () => {
          if (!cancelled) await reloadServerCatalog();
        })();
        const iv = setInterval(() => {
          if (!cancelled) reloadServerCatalog();
        }, 30000);
        const onRefetch = () => { if (!cancelled) reloadServerCatalog(); };
        try {
          window.addEventListener('catalog-products-refetch', onRefetch);
          window.addEventListener('admin-products-refetch', onRefetch);
          document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && !cancelled) reloadServerCatalog();
          });
        } catch (_) {}
        return () => {
          cancelled = true;
          clearInterval(iv);
          try {
            window.removeEventListener('catalog-products-refetch', onRefetch);
            window.removeEventListener('admin-products-refetch', onRefetch);
          } catch (_) {}
        };
      }, []);
      /* Hydrate client-only state AFTER mount so SSR HTML matches first client render */
      useEffect(() => {
        const FA_DIGIT_RE = /[\u06F0-\u06F9\u0660-\u0669]/;
        const isNumericField = (el) => {
          if (!(el instanceof HTMLInputElement) && !(el instanceof HTMLTextAreaElement)) return false;
          if (el.dataset && (el.dataset.skipDigitNormalize === 'true' || el.dataset.adminAuth === 'true')) return false;
          const t = (el.type || '').toLowerCase();
          const mode = String(el.getAttribute('inputMode') || el.inputMode || '').toLowerCase();
          if (t === 'number' || t === 'tel') return true;
          if (mode === 'numeric' || mode === 'decimal' || mode === 'tel') return true;
          if (el.dataset && (el.dataset.digits === 'en' || el.dataset.normalizeDigits === 'true')) return true;
          const ac = String(el.autocomplete || el.getAttribute('autocomplete') || '').toLowerCase();
          if (ac === 'tel' || ac === 'tel-national' || ac === 'one-time-code') return true;
          return false;
        };
        const onInput = (e) => {
          const el = e.target;
          if (!isNumericField(el)) return;
          const raw = String(el.value || '');
          if (!FA_DIGIT_RE.test(raw)) return;
          const converted = toEnDigits(raw);
          if (converted === raw) return;
          const start = el.selectionStart;
          const end = el.selectionEnd;
          try {
            const native = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')
              || Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
            if (native && native.set) native.set.call(el, converted);
            else el.value = converted;
            if (typeof start === 'number' && typeof end === 'number') {
              const delta = converted.length - raw.length;
              el.setSelectionRange(Math.max(0, start + delta), Math.max(0, end + delta));
            }
          } catch (_) {
            el.value = converted;
          }
          el.dispatchEvent(new Event('input', { bubbles: true }));
        };
        document.addEventListener('input', onInput, true);
        return () => {
          document.removeEventListener('input', onInput, true);
        };
      }, []);
      const favorites = useStore(wishlistStore);
      const setFavorites = useCallback((updater) => {
        const prev = wishlistStore.getState();
        const next = typeof updater === 'function' ? updater(prev) : updater;
        setWishlistIds(Array.isArray(next) ? next : []);
      }, []);
      const [wishlistOpen, setWishlistOpen] = useStoreField(modalUiStore, 'wishlistOpen')
      const [recentOpen, setRecentOpen] = useStoreField(modalUiStore, 'recentOpen');
      const [notifPanelOpen, setNotifPanelOpen] = useStoreField(modalUiStore, 'notifPanelOpen')
      const [showWishlistPage, setShowWishlistPage] = useStoreField(shopUiStore, 'showWishlistPage');
      const [showRecentPage, setShowRecentPage] = useStoreField(shopUiStore, 'showRecentPage');
      const [wishlistSort, setWishlistSort] = useStoreField(shopUiStore, 'wishlistSort');
      const [wishlistFilter, setWishlistFilter] = useStoreField(shopUiStore, 'wishlistFilter');
      const [wishlistView, setWishlistView] = useStoreField(shopUiStore, 'wishlistView');
      const [wishlistSelected, setWishlistSelected] = useStoreField(shopUiStore, 'wishlistSelected');
      const [wishlistClearConfirm, setWishlistClearConfirm] = useStoreField(shopUiStore, 'wishlistClearConfirm');
      const [favToast, setFavToast] = useStoreField(shopUiStore, 'favToast');
      const WISHLIST_MAX = 100;
      /* بلاگ: لایک + کامنت */
      const [likedBlogs, setLikedBlogs] = useStoreField(shopUiStore, 'likedBlogs');
      const [blogComments, setBlogComments] = useStoreField(shopUiStore, 'blogComments');
      const [blogCommentName, setBlogCommentName] = useStoreField(shopUiStore, 'blogCommentName');
      const [blogCommentText, setBlogCommentText] = useStoreField(shopUiStore, 'blogCommentText');


      const persistLikedBlogs = (next) => {
        /* no localStorage (strict buyer) */
        return next;
      };
      const isBlogLiked = (blogId) => likedBlogs.some(b => String(b.id) === String(blogId));
      const toggleBlogLike = (blogId) => {
        if (!blogId) return;
        setLikedBlogs(prev => {
          const exists = prev.some(b => String(b.id) === String(blogId));
          let next;
          if (exists) {
            next = prev.filter(b => String(b.id) !== String(blogId));
            showToast({ message: 'لایک بلاگ برداشته شد', variant: 'success', position: 'top-center' });
          } else {
            next = [{ id: blogId, likedAt: Date.now() }, ...prev];
            showToast({ message: 'بلاگ به علاقه‌مندی‌ها اضافه شد', variant: 'success', position: 'top-center', actions: { label: 'مشاهده', onClick: () => setWishlistOpen(true), variant: 'outline' } });
          }
          return persistLikedBlogs(next);
        });
      };
      const persistBlogComments = (next) => {
        try { localStorage.setItem('blogComments', JSON.stringify(next)); } catch (_) {}
        return next;
      };
      const addBlogComment = (blogId) => {
        const name = (blogCommentName || '').trim() || 'کاربر';
        const body = htmlToPlain(blogCommentText || '').trim();
        const bodyHtml = blogCommentText || '';
        if (!body) { showToast({ message: 'متن دیدگاه را بنویسید', variant: 'default', position: 'top-center' }); return; }
        if (body.length < 3) { showToast({ message: 'دیدگاه خیلی کوتاه است', variant: 'default', position: 'top-center' }); return; }
        const chkName = assertNoUserLinks(name);
        const chkBody = assertNoUserLinks(body);
        if (!chkName.ok || !chkBody.ok) { showToast({ message: chkName.error || chkBody.error || 'لینک مجاز نیست', variant: 'error', position: 'top-center' }); return; }
        const entry = {
          id: `c${Date.now()}`,
          name: chkName.text.slice(0, 40),
          text: chkBody.text.slice(0, 500),
          html: (bodyHtml || '').slice(0, 2000),
          date: new Date().toLocaleDateString('fa-IR'),
        };
        setBlogComments(prev => {
          const list = Array.isArray(prev[blogId]) ? prev[blogId] : [];
          const next = { ...prev, [blogId]: [entry, ...list] };
          return persistBlogComments(next);
        });
        setBlogCommentText('');
        showToast({ message: 'دیدگاه شما ثبت شد', variant: 'success', position: 'top-center' });
      };

      const favIds = favorites.map(f => f.id);
      const isFavorite = (productId) => favIds.includes(productId);
      const getFavEntry = (productId) => favorites.find(f => f.id === productId);

      const persistFavorites = (next) => {
        try { setWishlistIds(Array.isArray(next) ? next : []); } catch (_) { /* no localStorage (strict buyer) */ }
        return next;
      };

      const toggleFavorite = (productId) => {
        setFavorites(prev => {
          const exists = prev.some(f => f.id === productId);
          let next;
          if (exists) {
            next = prev.filter(f => f.id !== productId);
            showToast({ message: 'از علاقه‌مندی‌ها حذف شد', variant: 'success', position: 'top-center' });
            try {
              fetch('/api/wishlist', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ product_id: String(productId) }),
              }).catch(() => {});
            } catch (_) {}
          } else {
            if (prev.length >= WISHLIST_MAX) {
              showToast({ message: `حداکثر ${WISHLIST_MAX} کالا در علاقه‌مندی`, variant: 'default', position: 'top-center' });
              return prev;
            }
            const p = products.find(x => x.id === productId);
            next = [...prev, { id: productId, addedAt: Date.now(), priceAtAdd: p?.price ?? 0 }];
            showToast({ variant: 'success',
              message: 'به علاقه‌مندی‌ها اضافه شد',
              position: 'top-center',
              actions: { label: 'مشاهده', onClick: () => { setCompareOpen(false); setCartOpen(false); setWishlistOpen(true); }, variant: 'outline' },
            });
            try {
              fetch('/api/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ product_id: String(productId) }),
              }).catch(() => {});
            } catch (_) {}
          }
          return persistFavorites(next);
        });
        setWishlistSelected(sel => sel.filter(id => id !== productId));
      };

      const clearFavorites = () => {
        setFavorites(persistFavorites([]));
        setWishlistSelected([]);
        setWishlistClearConfirm(false);
        showToast({ message: 'همه علاقه‌مندی‌ها حذف شدند', variant: 'success', position: 'top-center' });
      };

      const removeFavoritesBulk = (ids) => {
        setFavorites(prev => persistFavorites(prev.filter(f => !ids.includes(f.id))));
        setWishlistSelected([]);
      };

      useEffect(() => {
        if (oldPriceOpen == null) return;
        const close = () => setOldPriceOpen(null);
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
      }, [oldPriceOpen]);

      useEffect(() => {
        // ستون کناری (سبد/علاقه/…): اسکرول صفحه را دست نزن — فقط overlay چرخ را می‌گیرد (بدون پرش)
        const sideOpen = !!(cartOpen || wishlistOpen || compareOpen || recentOpen || notifPanelOpen);
        // منو/مودال واقعی: قفل overflow
        const modalOpen = !!(mobileMenuOpen || quickAdd || compareReplaceOpen);
        if (sideOpen) {
          try { window.dispatchEvent(new CustomEvent('pm-scroll-lock', { detail: true })); } catch (_) {}
        }
        if (modalOpen) {
          if (document.body.dataset.drawerScrollLock === '1') {
            // already locked
          } else {
            const y = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
            document.body.dataset.drawerScrollLock = '1';
            document.body.dataset.drawerScrollY = String(y);
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
          }
        } else if (!document.body.dataset.panelLock) {
          if (document.body.dataset.drawerScrollLock === '1') {
            const y = parseInt(document.body.dataset.drawerScrollY || '0', 10) || 0;
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            delete document.body.dataset.drawerScrollLock;
            delete document.body.dataset.drawerScrollY;
            requestAnimationFrame(() => { window.scrollTo(0, y); });
          }
        }
        if (!sideOpen) {
          try { window.dispatchEvent(new CustomEvent('pm-scroll-lock', { detail: false })); } catch (_) {}
        }
      }, [mobileMenuOpen, catOpen, quickAdd, cartOpen, wishlistOpen, compareOpen, compareReplaceOpen, recentOpen, notifPanelOpen]);
      useEffect(() => {
        const closeMobileMenuOnWide = () => {
          if (typeof window === 'undefined') return;
          const wide = window.matchMedia('(min-width: 768px) and (min-height: 501px)').matches;
          if (wide) setMobileMenuOpen(false);
        };
        closeMobileMenuOnWide();
        window.addEventListener('resize', closeMobileMenuOnWide);
        window.addEventListener('orientationchange', closeMobileMenuOnWide);
        return () => {
          window.removeEventListener('resize', closeMobileMenuOnWide);
          window.removeEventListener('orientationchange', closeMobileMenuOnWide);
        };
      }, []);

      /* Focus trap مگامنوی موبایل */
      useEffect(() => {
        if (!mobileMenuOpen) return undefined;
        const panel = document.querySelector('.mobile-menu-panel');
        if (!panel) return undefined;
        return attachFocusTrap(panel);
      }, [mobileMenuOpen]);

      /* Focus trap سیستمی برای drawer / quick-add */
      useEffect(() => {
        const any =
          !!(cartOpen || wishlistOpen || compareOpen || recentOpen || notifPanelOpen || quickAdd);
        if (!any) return undefined;
        const panel =
          document.querySelector('.quick-add-popup') ||
          document.querySelector('.cart-panel[role="dialog"]') ||
          document.querySelector('.cart-panel');
        if (!panel) return undefined;
        return attachFocusTrap(panel);
      }, [cartOpen, wishlistOpen, compareOpen, recentOpen, notifPanelOpen, quickAdd]);

      useEffect(() => {
        try {
          setUiFlags({
            mobileMenuOpen: !!mobileMenuOpen,
            cartOpen: !!cartOpen,
            wishlistOpen: !!wishlistOpen,
            compareOpen: !!compareOpen,
            recentOpen: !!recentOpen,
            notifPanelOpen: !!notifPanelOpen,
          });
        } catch (_) {}
      }, [mobileMenuOpen, cartOpen, wishlistOpen, compareOpen, recentOpen, notifPanelOpen]);


      useEffect(() => {
        if (!wishlistOpen) return;
        const onKey = (e) => { if (e.key === 'Escape') setWishlistOpen(false); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
      }, [wishlistOpen]);

      useEffect(() => {
        if (!compareOpen) return;
        const onKey = (e) => { if (e.key === 'Escape') setCompareOpen(false); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
      }, [compareOpen]);

      useEffect(() => {
        if (!recentOpen) return;
        const onKey = (e) => { if (e.key === 'Escape') setRecentOpen(false); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
      }, [recentOpen]);

      useEffect(() => {
        const id = setInterval(() => setSearchPhIdx(i => (i + 1) % 6), 3200);
        return () => clearInterval(id);
      }, []);

      // Persist cart
      useEffect(() => {
        try { setCartItems(cart); } catch (_) { try { storageSetJSON('cart', cart); } catch (__) {} }
      }, [cart]);
      // ——— Live toasts + pull notifications + live chat ———
      const [liveToasts, setLiveToasts] = useStoreField(shopUiStore, 'liveToasts');
      const [sellerShopOpen, setSellerShopOpen] = useStoreField(sellerUiStore, 'sellerShopOpen');


            const [sellerGifts, setSellerGifts] = useStoreField(sellerUiStore, 'sellerGifts');
      const saveSellerGifts = (next) => {
        setSellerGifts(next);
        try { localStorage.setItem('sellerGifts', JSON.stringify(next)); } catch (_) {}
      };
      const [sellerPromoModal, setSellerPromoModal] = useStoreField(sellerUiStore, 'sellerPromoModal')
      const [discountPickIds, setDiscountPickIds] = useStoreField(shopUiStore, 'discountPickIds');
      const [discountMode, setDiscountMode] = useStoreField(shopUiStore, 'discountMode');
      const [discountPercent, setDiscountPercent] = useStoreField(shopUiStore, 'discountPercent');
      const [discountPrices, setDiscountPrices] = useStoreField(shopUiStore, 'discountPrices');
      const [giftCodeForm, setGiftCodeForm] = useStoreField(formsStore, 'giftCodeForm')
      const [buyerGifts, setBuyerGifts] = useStoreField(shopUiStore, 'buyerGifts');
      const saveBuyerGifts = (next) => {
        setBuyerGifts(next);
        /* no localStorage (strict buyer) */
      };
      const [notifPulling, setNotifPulling] = useStoreField(shopUiStore, 'notifPulling');
      const [pwaInstallEvent, setPwaInstallEvent] = useStoreField(shopUiStore, 'pwaInstallEvent');
      const [pwaInstalled, setPwaInstalled] = useStoreField(shopUiStore, 'pwaInstalled');
      const [portalMounted, setPortalMounted] = useStoreField(shopUiStore, 'portalMounted');
      useEffect(() => { setPortalMounted(true); }, []);

      // ثبت Service Worker + رویداد نصب وب‌اپ (برای خریداران)
      useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(() => {});
          }
          const onBip = (e) => {
            e.preventDefault();
            setPwaInstallEvent(e);
          };
          window.addEventListener('beforeinstallprompt', onBip);
          const onInstalled = () => {
            setPwaInstalled(true);
            setPwaInstallEvent(null);
          };
          window.addEventListener('appinstalled', onInstalled);
          if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
            setPwaInstalled(true);
          }
          return () => {
            window.removeEventListener('beforeinstallprompt', onBip);
            window.removeEventListener('appinstalled', onInstalled);
          };
        } catch (_) {}
      }, []);

      const installBuyerPwa = async () => {
        try {
          if (pwaInstallEvent) {
            pwaInstallEvent.prompt();
            const choice = await pwaInstallEvent.userChoice;
            if (choice && choice.outcome === 'accepted') {
              setPwaInstalled(true);
              setPwaInstallEvent(null);
              pushLiveToast('وب‌اپ با موفقیت نصب شد', { type: 'success' });
            }
          } else {
            showToast({ message: 'برای نصب وب‌اپ: از منوی مرورگر گزینه «افزودن به صفحه اصلی» / Add to Home Screen را انتخاب کنید.', variant: 'default', duration: 4500, position: 'top-center' });
          }
          if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
            Notification.requestPermission().catch(() => {});
          }
        } catch (_) {
          showToast({ message: 'نصب وب‌اپ در این مرورگر پشتیبانی نمی‌شود. از منوی مرورگر استفاده کنید.', variant: 'default', duration: 4500, position: 'top-center' });
        }
      };

      // Esc closes cart
      useEffect(() => {
        if (!cartOpen) return;
        const onKey = (e) => {
          if (e.key === 'Escape') setCartOpen(false);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
      }, [cartOpen]);
      const [searchQuery, setSearchQuery] = useStoreField(commerceUiStore, 'searchQuery')
      const [newsletterPhone, setNewsletterPhone] = useStoreField(shopUiStore, 'newsletterPhone');
      const [recentSearches, setRecentSearches] = useStoreField(shopUiStore, 'recentSearches');
      const [searchSuggestOpen, setSearchSuggestOpen] = useStoreField(modalUiStore, 'searchSuggestOpen')
      const [searchActiveIdx, setSearchActiveIdx] = useStoreField(commerceUiStore, 'searchActiveIdx')
      const [searchPhIdx, setSearchPhIdx] = useStoreField(commerceUiStore, 'searchPhIdx')
      const [searchCategories, setSearchCategories] = useStoreField(commerceUiStore, 'searchCategories');
      const [searchColors, setSearchColors] = useStoreField(commerceUiStore, 'searchColors');
      const [searchSizes, setSearchSizes] = useStoreField(commerceUiStore, 'searchSizes');
      const [imgZoom, setImgZoom] = useStoreField(shopUiStore, 'imgZoom');
      const [activeSellerId, setActiveSellerId] = useStoreField(shopUiStore, 'activeSellerId');
      const [showSellersList, setShowSellersList] = useStoreField(shopUiStore, 'showSellersList');
      const [showPLP, setShowPLP] = useStoreField(shopUiStore, 'showPLP');
      const [plpTagFilter, setPlpTagFilter] = useStoreField(commerceUiStore, 'plpTagFilter');
      const [showCartPage, setShowCartPage] = useStoreField(shopUiStore, 'showCartPage');
      // ——— Checkout ———
      const [showCheckout, setShowCheckout] = useStoreField(shopUiStore, 'showCheckout');
      const [publicTrackOpen, setPublicTrackOpen] = useState(false);
      const [publicTrackCode, setPublicTrackCode] = useState('');
      const [publicTrackResult, setPublicTrackResult] = useState(null);
      const [publicTrackLoading, setPublicTrackLoading] = useState(false);
      const [publicTrackError, setPublicTrackError] = useState('');

      const [checkoutStep, setCheckoutStep] = useStoreField(shopUiStore, 'checkoutStep');
      const [checkoutContact, setCheckoutContact] = useStoreField(shopUiStore, 'checkoutContact');
      const [checkoutSelectedAddressId, setCheckoutSelectedAddressId] = useStoreField(shopUiStore, 'checkoutSelectedAddressId');
      const [checkoutUseNewAddress, setCheckoutUseNewAddress] = useStoreField(shopUiStore, 'checkoutUseNewAddress');
      const [checkoutNewAddress, setCheckoutNewAddress] = useStoreField(shopUiStore, 'checkoutNewAddress');
      const [checkoutShippingMethod, setCheckoutShippingMethod] = useStoreField(shopUiStore, 'checkoutShippingMethod');
      const [checkoutNote, setCheckoutNote] = useStoreField(shopUiStore, 'checkoutNote');
      const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useStoreField(shopUiStore, 'checkoutPaymentMethod');
      const [checkoutErrors, setCheckoutErrors] = useStoreField(shopUiStore, 'checkoutErrors');
      const [checkoutPlacing, setCheckoutPlacing] = useStoreField(shopUiStore, 'checkoutPlacing');
      const [orderSuccess, setOrderSuccess] = useStoreField(shopUiStore, 'orderSuccess');
      const [orderFailed, setOrderFailed] = useStoreField(shopUiStore, 'orderFailed');
      const [pendingPayOrder, setPendingPayOrder] = useStoreField(shopUiStore, 'pendingPayOrder');
      const [stockNotifyIds, setStockNotifyIds] = useStoreField(shopUiStore, 'stockNotifyIds');
      const [buyerTicketFormOpen, setBuyerTicketFormOpen] = useStoreField(formsStore, 'buyerTicketFormOpen')
      const [buyerTicketSubject, setBuyerTicketSubject] = useStoreField(shopUiStore, 'buyerTicketSubject');
      const [buyerTicketBody, setBuyerTicketBody] = useStoreField(shopUiStore, 'buyerTicketBody');
      const [buyerTicketError, setBuyerTicketError] = useStoreField(shopUiStore, 'buyerTicketError');
      const [buyerTicketDetailId, setBuyerTicketDetailId] = useStoreField(shopUiStore, 'buyerTicketDetailId');
      const [buyerTickets, setBuyerTickets] = useStoreField(shopUiStore, 'buyerTickets');
      const [orderRateDraft, setOrderRateDraft] = useStoreField(formsStore, 'orderRateDraft');
      const [orderReturnOpen, setOrderReturnOpen] = useStoreField(modalUiStore, 'orderReturnOpen')
      // ——— Auth & Buyer Profile ———
      const [roleGateOpen, setRoleGateOpen] = useState(false);
      const [authOpen, setAuthOpen] = useStoreField(modalUiStore, 'authOpen')
      const [authStep, setAuthStep] = useStoreField(shopUiStore, 'authStep');
      const [authPhone, setAuthPhone] = useStoreField(shopUiStore, 'authPhone');
      const [authEmail, setAuthEmail] = useStoreField(shopUiStore, 'authEmail');
      const [authPassword, setAuthPassword] = useStoreField(shopUiStore, 'authPassword');
      const [authLoginMethod, setAuthLoginMethod] = useState('otp');
      const [authRemember, setAuthRemember] = useState(true);
      const [authOtp, setAuthOtp] = useStoreField(shopUiStore, 'authOtp');
      const [authName, setAuthName] = useStoreField(shopUiStore, 'authName');
      const [authLastName, setAuthLastName] = useStoreField(shopUiStore, 'authLastName');
      const [authOtpTimer, setAuthOtpTimer] = useStoreField(shopUiStore, 'authOtpTimer');
      const [authError, setAuthError] = useStoreField(shopUiStore, 'authError');
      const [authLoading, setAuthLoading] = useStoreField(shopUiStore, 'authLoading');
      const [authFailCount, setAuthFailCount] = useStoreField(shopUiStore, 'authFailCount');
      const [authLockedUntil, setAuthLockedUntil] = useStoreField(shopUiStore, 'authLockedUntil');
      const [authReturnTo, setAuthReturnTo] = useStoreField(shopUiStore, 'authReturnTo');
      const [authTermsAccepted, setAuthTermsAccepted] = useStoreField(shopUiStore, 'authTermsAccepted');
      const [demoOtpCode, setDemoOtpCode] = useStoreField(shopUiStore, 'demoOtpCode');
      const [cookieConsent, setCookieConsent] = useStoreField(shopUiStore, 'cookieConsent');
      const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // ۳۰ روز
      const readSessionUser = (key) => {
        try {
          const raw = localStorage.getItem(key);
          if (!raw) return null;
          const u = JSON.parse(raw);
          if (u && u.sessionExpires && Date.now() > u.sessionExpires) {
            localStorage.removeItem(key);
            return null;
          }
          return u;
        } catch { return null; }
      };
      const [user, setUser] = useStoreField(shopUiStore, 'user');
      const [showProfilePage, setShowProfilePage] = useStoreField(shopUiStore, 'showProfilePage');
      const [profileTab, setProfileTab] = useStoreField(shopUiStore, 'profileTab');
      const [orderDetailId, setOrderDetailId] = useStoreField(shopUiStore, 'orderDetailId');
      const [ordersFilter, setOrdersFilter] = useStoreField(shopUiStore, 'ordersFilter');
      const [showTracking, setShowTracking] = useStoreField(shopUiStore, 'showTracking');
      const [addressFormOpen, setAddressFormOpen] = useStoreField(formsStore, 'addressFormOpen')
      const [editingAddressId, setEditingAddressId] = useStoreField(shopUiStore, 'editingAddressId');
      const [addressForm, setAddressForm] = useStoreField(formsStore, 'addressForm')
      const [addressDeleteConfirm, setAddressDeleteConfirm] = useStoreField(shopUiStore, 'addressDeleteConfirm');
      const [orders, setOrders] = useStoreField(shopUiStore, 'orders');
      const [addresses, setAddresses] = useStoreField(shopUiStore, 'addresses');
      const [notifications, setNotifications] = useStoreField(shopUiStore, 'notifications');
      // ——— Seller Panel ———
      const [authMode, setAuthMode] = useStoreField(shopUiStore, 'authMode');
      const [sellerUser, setSellerUser] = useStoreField(sellerUiStore, 'sellerUser')
      const [showSellerPanel, setShowSellerPanel] = useStoreField(shopUiStore, 'showSellerPanel');
      /** صفحات ثابت / لندینگ: about | contact | faq | size-guide | become-seller | terms | returns | privacy | cookies | sitemap | blog | blog-post | brands | campaigns | deals | error-404 | error-500 | maintenance */
      const [staticPage, setStaticPage] = useStoreField(shopUiStore, 'staticPage');
      const [blogPostId, setBlogPostId] = useStoreField(shopUiStore, 'blogPostId');
      const [contactForm, setContactForm] = useStoreField(formsStore, 'contactForm')
      const [contactFormError, setContactFormError] = useStoreField(formsStore, 'contactFormError')
      const [faqQuery, setFaqQuery] = useStoreField(shopUiStore, 'faqQuery');
      const [faqCat, setFaqCat] = useStoreField(shopUiStore, 'faqCat');
      const [dealsMinDiscount, setDealsMinDiscount] = useStoreField(shopUiStore, 'dealsMinDiscount');
      const [dealsSortRaw, setDealsSort] = useStoreField(shopUiStore, 'dealsSort');
      const dealsSort = dealsSortRaw || 'discount';
      const [brandQuery, setBrandQuery] = useStoreField(shopUiStore, 'brandQuery');
      const [campaignEndTs] = useState(() => Date.now() + 5 * 24 * 60 * 60 * 1000);
      const [campaignNow, setCampaignNow] = useStoreField(shopUiStore, 'campaignNow');
      useEffect(() => {
        if (staticPage !== 'campaigns' && staticPage !== 'deals') return;
        const t = setInterval(() => setCampaignNow(Date.now()), 1000);
        return () => clearInterval(t);
      }, [staticPage]);
      const [blogPosts, setBlogPosts] = useStoreField(shopUiStore, 'blogPosts');
      const saveBlogPosts = (list) => {
        setBlogPosts(list);
        try { localStorage.setItem('siteBlogPosts', JSON.stringify(list)); } catch (_) {}
      };
      const [blogForm, setBlogForm] = useStoreField(formsStore, 'blogForm');
      // انتشار خودکار مطالب زمان‌بندی‌شده
      useEffect(() => {
        const tick = () => {
          const now = Date.now();
          setBlogPosts(prev => {
            if (!Array.isArray(prev)) return prev;
            let changed = false;
            const next = prev.map(p => {
              if (p && p.status === 'scheduled' && p.publishAtMs && Number(p.publishAtMs) <= now) {
                changed = true;
                return { ...p, status: 'published', date: p.publishAtFa ? String(p.publishAtFa).split(' ')[0] : (p.date || new Date().toLocaleDateString('fa-IR')) };
              }
              return p;
            });
            return changed ? next : prev;
          });
        };
        tick();
        const id = setInterval(tick, 30000);
        return () => clearInterval(id);
      }, []);
      const [brandsList, setBrandsList] = useStoreField(shopUiStore, 'brandsList');
      const [brandDetailId, setBrandDetailId] = useStoreField(shopUiStore, 'brandDetailId');
      const [campaignsList, setCampaignsList] = useStoreField(shopUiStore, 'campaignsList');
      const saveCampaigns = (list) => {
        setCampaignsList(list);
        try { sessionStorage.setItem('siteCampaigns', JSON.stringify(list)); } catch (_) {}
      };
      const hydrateCampaignsFromApi = async (all = false) => {
        try {
          const res = await fetch('/api/campaigns' + (all ? '?all=1' : ''), { credentials: 'include', cache: 'no-store' });
          const json = await res.json().catch(() => ({}));
          if (!json?.ok || !Array.isArray(json.items)) return;
          setCampaignsList(json.items);
        } catch (_) {}
      };
      const persistCampaignOnServer = async (item, method = 'POST') => {
        try {
          const res = await fetch('/api/campaigns', {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(item),
          });
          return await res.json().catch(() => ({}));
        } catch (_) {
          return { ok: false };
        }
      };
      const [campaignForm, setCampaignForm] = useStoreField(formsStore, 'campaignForm')
      const BLOG_POSTS = blogPosts; // سازگاری با کد قبلی
      const BRANDS_LIST = brandsList;
      const [sellerTab, setSellerTab] = useStoreField(sellerUiStore, 'sellerTab');
      const [sellerOrderDetailId, setSellerOrderDetailId] = useStoreField(sellerUiStore, 'sellerOrderDetailId')
      const [sellerOrdersFilter, setSellerOrdersFilter] = useStoreField(sellerUiStore, 'sellerOrdersFilter')
      const [sellerProductFilter, setSellerProductFilter] = useStoreField(sellerUiStore, 'sellerProductFilter')
      const [sellerProductSearch, setSellerProductSearch] = useStoreField(sellerUiStore, 'sellerProductSearch')
      const [sellerProductFormOpen, setSellerProductFormOpen] = useStoreField(sellerUiStore, 'sellerProductFormOpen')
      const [sellerProductStep, setSellerProductStep] = useStoreField(sellerUiStore, 'sellerProductStep')
      const [sellerTaxonomyPicker, setSellerTaxonomyPicker] = useStoreField(sellerUiStore, 'sellerTaxonomyPicker');
      const [sellerDescEditorOpen, setSellerDescEditorOpen] = useStoreField(sellerUiStore, 'sellerDescEditorOpen')
      const [sellerDescDraft, setSellerDescDraft] = useStoreField(sellerUiStore, 'sellerDescDraft')
      const [sellerDescError, setSellerDescError] = useStoreField(sellerUiStore, 'sellerDescError')
      const sellerDescRef = useRef(null);
      const [sellerTaxonomySearch, setSellerTaxonomySearch] = useStoreField(sellerUiStore, 'sellerTaxonomySearch')
      const [editingSellerProductId, setEditingSellerProductId] = useStoreField(shopUiStore, 'editingSellerProductId');
      const [sellerProductForm, setSellerProductForm] = useStoreField(sellerUiStore, 'sellerProductForm')
      /* تصویر محصول: فقط WebP · ≤۶۵KB · واترمارک لوگو پایین-چپ · حداکثر ۳ تصویر */
      const PRODUCT_IMG = {
        w: PRODUCT_IMG_DEFAULTS.w,
        h: PRODUCT_IMG_DEFAULTS.h,
        maxBytes: PRODUCT_IMG_DEFAULTS.maxBytes,
        quality: PRODUCT_IMG_DEFAULTS.quality,
        minQuality: PRODUCT_IMG_DEFAULTS.minQuality,
        maxPerProduct: PRODUCT_IMG_DEFAULTS.maxPerProduct,
        maxUploadBytes: PRODUCT_IMG_DEFAULTS.maxUploadBytes,
        watermark: true,
      };
      const fileToImage = fileToImageUtil;
      /** برش مرکز/آفست + WebP با جستجوی باینری کیفیت و کاهش ابعاد در صورت نیاز */
      const processToProductWebP = async (source, opts = {}) => {
        return encodeProductWebP(source, { ...PRODUCT_IMG, ...opts });
      };
      /** فایل خام → WebP + واترمارک → Storage (فروشنده/ادمین/خریدار) → فقط URL؛ اصل حذف */
      const processProductImageFile = async (file, opts = {}) => {
        const dataUrl = await processProductImageFileUtil(file, PRODUCT_IMG);
        const folder = opts.folder || 'users';
        try {
          const up = await apiUploadMediaImage(dataUrl, folder);
          if (up && up.ok && up.url) return up.url;
        } catch (_) {}
        try {
          const up2 = await apiUploadSellerProductImage(dataUrl);
          if (up2 && up2.ok && up2.url) return up2.url;
        } catch (_) {}
        return dataUrl; // فقط WebP dataUrl — نه اصل فایل
      };
      const [sellerMediaToolOpen, setSellerMediaToolOpen] = useStoreField(sellerUiStore, 'sellerMediaToolOpen')
      const [mediaToolStep, setMediaToolStep] = useStoreField(shopUiStore, 'mediaToolStep');
      const [mediaToolSrc, setMediaToolSrc] = useStoreField(shopUiStore, 'mediaToolSrc');
      const [mediaToolOffset, setMediaToolOffset] = useStoreField(shopUiStore, 'mediaToolOffset');
      const [mediaToolScale, setMediaToolScale] = useStoreField(shopUiStore, 'mediaToolScale');
      const [mediaToolResult, setMediaToolResult] = useStoreField(shopUiStore, 'mediaToolResult');
      const [mediaToolAssign, setMediaToolAssign] = useStoreField(shopUiStore, 'mediaToolAssign');
      const [mediaToolProcessing, setMediaToolProcessing] = useStoreField(shopUiStore, 'mediaToolProcessing');
      const [mediaToolSearch, setMediaToolSearch] = useStoreField(shopUiStore, 'mediaToolSearch');
      const [adminModerationQueue, setAdminModerationQueue] = useStoreField(adminUiStore, 'adminModerationQueue');
      const saveModerationQueue = (next) => {
        setAdminModerationQueue(next);
        publishRealtime('adminModerationQueue', next);
      };
      const enqueueModeration = (item) => {
        const row = { id: 'mod-' + Date.now(), status: 'pending', createdAt: new Date().toISOString(), ...item };
        saveModerationQueue([row, ...(adminModerationQueue || [])]);
        return row;
      };
      const [adminContentTab, setAdminContentTab] = useStoreField(adminUiStore, 'adminContentTab');
      const [contentEditorTarget, setContentEditorTarget] = useStoreField(shopUiStore, 'contentEditorTarget');

      const [sellerProductDeleteId, setSellerProductDeleteId] = useStoreField(sellerUiStore, 'sellerProductDeleteId')
      const [sellerTicketDetailId, setSellerTicketDetailId] = useStoreField(sellerUiStore, 'sellerTicketDetailId')
      const [sellerTicketReply, setSellerTicketReply] = useStoreField(sellerUiStore, 'sellerTicketReply')
      const [sellerNewTicketOpen, setSellerNewTicketOpen] = useStoreField(sellerUiStore, 'sellerNewTicketOpen')
      const [sellerNewTicket, setSellerNewTicket] = useStoreField(sellerUiStore, 'sellerNewTicket')
      const [sellerTrackForm, setSellerTrackForm] = useStoreField(sellerUiStore, 'sellerTrackForm')
      const [sellerCancelForm, setSellerCancelForm] = useStoreField(sellerUiStore, 'sellerCancelForm')
      const [sellerProducts, setSellerProducts] = useStoreField(sellerUiStore, 'sellerProducts');
      const [sellerOrders, setSellerOrders] = useStoreField(sellerUiStore, 'sellerOrders');
      const [sellerTickets, setSellerTickets] = useStoreField(sellerUiStore, 'sellerTickets');

      // ——— Admin Panel ———
      const [adminUser, setAdminUser] = useStoreField(adminUiStore, 'adminUser');
      const [showAdminPanel, setShowAdminPanel] = useStoreField(shopUiStore, 'showAdminPanel');

  // Boot: restore buyer/seller/admin after full reload — UI از localStorage، سشن از کوکی (middleware)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const url = new URL(window.location.href);
      const path = url.pathname || "";
      const isAdmin = path === "/amirshn" || path.endsWith("/amirshn") || path.includes("پنل-ادمین");
      const isProfile = url.searchParams.get("profile") === "1" || path === "/account" || path.startsWith("/account/") || path.includes("profile");
      const isSeller = url.searchParams.get("sellerPanel") === "1" || path === "/seller" || path.startsWith("/seller/") || sessionStorage.getItem("pm_panel") === "seller";

      // همیشه کاربر ذخیره‌شده را برگردان (قبل از هر guard)
      try {
        const b = localStorage.getItem("buyerUser");
        if (b) {
          const u = JSON.parse(b);
          if (u && !(u.sessionExpires && Date.now() > u.sessionExpires)) {
            try { setUser(u); } catch (_) {}
          }
        }
      } catch (_) {}
      try {
        const s = localStorage.getItem("sellerUser");
        if (s) {
          const u = JSON.parse(s);
          if (u && !(u.sessionExpires && Date.now() > u.sessionExpires)) {
            try { setSellerUser(u); } catch (_) {}
          }
        }
      } catch (_) {}
      try {
        const a = localStorage.getItem("adminUser");
        if (a) {
          const saved = JSON.parse(a);
          const ph = String(saved?.phone || "").replace(/\D/g, "");
          if (ph) {
            try {
              setAdminUser({
                name: saved.name || "سوپر ادمین",
                role: saved.role || "Super Admin",
                phone: ph,
                loggedAt: saved.loggedAt || Date.now(),
              });
            } catch (_) {}
          }
        }
      } catch (_) {}

      if (isAdmin) {
        try {
          const raw = localStorage.getItem("adminUser");
          if (raw) {
            const saved = JSON.parse(raw);
            const ph = String(saved?.phone || "").replace(/\D/g, "");
            if (ph.length >= 10) {
              setAdminUser({ name: saved.name || "سوپر ادمین", role: saved.role || "Super Admin", phone: ph, loggedAt: saved.loggedAt || Date.now() });
              setShowAdminPanel(true);
              setAdminAuthOpen(false);
              setShowSellerPanel(false);
              setShowProfilePage(false);
              try { sessionStorage.setItem("pm_panel", "admin"); } catch (_) {}
              // تأیید نرم سرور — فقط اگر صریحاً غیر ادمین بود بیرون (نه خطای شبکه)
              fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
                .then((r) => r.json())
                .then((mj) => {
                  if (!mj || mj.ok === false) return;
                  if (mj.user == null && mj.profile == null) return; // شبکه/سشن موقت — local نگه دار
                  const role = String(mj?.profile?.role || "").toLowerCase();
                  const mph = String(mj?.profile?.phone || "").replace(/\D/g, "");
                  const ok = role === "admin" || (typeof isAdminPhone === "function" && isAdminPhone(mph || ph));
                  if (mj.user && !ok) {
                    /* فقط وقتی سرور کاربر دیگری را تأیید کرد */
                  }
                })
                .catch(() => {});
              return;
            }
          }
        } catch (_) {}
        setAdminAuthOpen(true);
        setAdminAuthStep("phone");
        return;
      }

      if (isSeller) {
        setShowSellerPanel(true);
        setShowProfilePage(false);
        try { setAuthOpen(false); } catch (_) {}
        try { sessionStorage.setItem("pm_panel", "seller"); } catch (_) {}
        // تأیید سشن سرور در پس‌زمینه — شکست موقت = بیرون نینداز
        fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
          .then((r) => r.json())
          .then((me) => {
            if (me?.user?.id) {
              try {
                const cur = JSON.parse(localStorage.getItem("sellerUser") || "null") || {};
                const next = { ...cur, id: me.user.id, phone: me.profile?.phone || cur.phone };
                localStorage.setItem("sellerUser", JSON.stringify({ ...next, sessionExpires: Date.now() + 30 * 24 * 60 * 60 * 1000 }));
                setSellerUser(next);
              } catch (_) {}
            }
          })
          .catch(() => {});
      } else if (isProfile) {
        setShowProfilePage(true);
        setShowSellerPanel(false);
        const tab = url.searchParams.get("tab");
        try { setProfileTab(tab || "dashboard"); } catch (_) {}
        try { sessionStorage.setItem("pm_panel", "account"); } catch (_) {}
        fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
          .then((r) => r.json())
          .then((me) => {
            if (me?.user?.id) {
              try {
                const cur = JSON.parse(localStorage.getItem("buyerUser") || "null") || {};
                const next = { ...cur, id: me.user.id, phone: me.profile?.phone || cur.phone, name: me.profile?.full_name || cur.name };
                localStorage.setItem("buyerUser", JSON.stringify({ ...next, sessionExpires: Date.now() + 30 * 24 * 60 * 60 * 1000 }));
                setUser(next);
              } catch (_) {}
            }
          })
          .catch(() => {});
      }
    } catch (_) {}
  }, []);


  // اگر پنل خریدار باز است ولی تب خالی است → داشبورد
  useEffect(() => {
    if (showProfilePage && (!profileTab || profileTab === '')) {
      try { setProfileTab('dashboard'); } catch (_) {}
    }
  }, [showProfilePage, profileTab]);

  // Restore panel after full page reload via URL or sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    let panel = null;
    try {
      const path = window.location.pathname || "";
      if (path === "/seller" || path.startsWith("/seller/")) panel = "seller";
      else if (path === "/account" || path.startsWith("/account/")) panel = "account";
      else panel = sessionStorage.getItem("pm_panel");
    } catch (_) {}
    if (panel === "seller") {
      try {
        const raw = localStorage.getItem("sellerUser");
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved && (saved.id || saved.phone)) {
            try { setSellerUser(saved); } catch (_) {}
          }
        }
      } catch (_) {}
      setShowSellerPanel(true);
      setShowProfilePage(false);
      try { setAuthOpen(false); } catch (_) {}
    } else if (panel === "account") {
      try {
        const raw = localStorage.getItem("buyerUser");
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved && (saved.id || saved.phone)) {
            try { setUser(saved); } catch (_) {}
          }
        }
      } catch (_) {}
      setShowProfilePage(true);
      setShowSellerPanel(false);
      try {
        fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
          .then((r) => r.json())
          .then((me) => {
            if (me?.user?.id) {
              try {
                const cur = JSON.parse(localStorage.getItem("buyerUser") || "null") || {};
                const next = {
                  ...cur,
                  id: me.user.id,
                  phone: me.profile?.phone || cur.phone,
                  name: me.profile?.full_name || cur.name,
                  firstName: (me.profile?.full_name || cur.name || "").split(" ")[0] || cur.firstName,
                };
                setUser(next);
                try { localStorage.setItem("buyerUser", JSON.stringify(next)); } catch (_) {}
              } catch (_) {}
            }
          })
          .catch(() => {});
      } catch (_) {}
    }
  }, []);

  // همگام URL با پنل — هرگز روی mount اول کاربر را از /seller|/account بیرون نینداز
  const panelUrlBootRef = useRef(true);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const path = window.location.pathname || "";
      const onSellerPath = path === "/seller" || path.startsWith("/seller/");
      const onAccountPath = path === "/account" || path.startsWith("/account/");

      if (showSellerPanel) {
        sessionStorage.setItem("pm_panel", "seller");
        if (!onSellerPath) {
          window.history.replaceState({ panel: "seller" }, "", "/seller");
        }
      } else if (showProfilePage) {
        sessionStorage.setItem("pm_panel", "account");
        if (!onAccountPath) {
          window.history.replaceState({ panel: "account" }, "", "/account");
        }
      } else {
        // فقط بعد از boot و وقتی کاربر عمداً پنل را بسته
        if (panelUrlBootRef.current) {
          panelUrlBootRef.current = false;
          // اگر URL هنوز پنل است، state را از URL برگردان (جلوگیری از پرت شدن)
          if (onSellerPath) {
            setShowSellerPanel(true);
            sessionStorage.setItem("pm_panel", "seller");
            return;
          }
          if (onAccountPath) {
            setShowProfilePage(true);
            sessionStorage.setItem("pm_panel", "account");
            return;
          }
          return;
        }
        try { sessionStorage.removeItem("pm_panel"); } catch (_) {}
        if (onSellerPath || onAccountPath) {
          window.history.replaceState({}, "", "/");
        }
      }
    } catch (_) {}
    panelUrlBootRef.current = false;
  }, [showSellerPanel, showProfilePage]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPop = () => {
      let path = window.location.pathname || "/";
      try { path = decodeURIComponent(path); } catch (_) {}
      const isSellerPanel =
        path === "/seller" || path.startsWith("/seller/") ||
        path === "/پنل-فروشنده" || path.startsWith("/پنل-فروشنده");
      const isProfile =
        path === "/account" || path.startsWith("/account/") ||
        path === "/حساب-من" || path.startsWith("/حساب-من");
      const isAdminPanel =
        path === "/amirshn" || path.endsWith("/amirshn");
      if (isSellerPanel) {
        setShowSellerPanel(true);
        setShowProfilePage(false);
      } else if (isProfile) {
        setShowProfilePage(true);
        setShowSellerPanel(false);
      } else if (isAdminPanel) {
        // applyPathRef پنل ادمین را باز می‌کند — اینجا نبند
      } else {
        setShowSellerPanel(false);
        setShowProfilePage(false);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
      const [pageSeoMap, setPageSeoMap] = useStoreField(shopUiStore, 'pageSeoMap');
      const DEFAULT_SITE_FAQS = [
          { cat: 'سفارش', q: 'چطور سفارش ثبت کنم؟', a: 'محصول را به سبد اضافه کنید، آدرس و روش ارسال را انتخاب کنید و سفارش را ثبت کنید.' },
          { cat: 'سفارش', q: 'آیا می‌توانم سفارش را لغو کنم؟', a: 'تا قبل از آماده‌سازی توسط فروشنده، از بخش سفارش‌های من می‌توانید درخواست لغو بدهید.' },
          { cat: 'سفارش', q: 'بعد از ثبت سفارش چه می‌شود؟', a: 'سفارش برای فروشنده ارسال می‌شود و می‌توانید وضعیت را از پنل حساب پیگیری کنید.' },
          { cat: 'پرداخت', q: 'اگر پرداخت ناموفق بود چه کنم؟', a: 'مبلغ تا ۷۲ ساعت به حساب برمی‌گردد. در صورت کسر شدن و ثبت‌نشدن سفارش با پشتیبانی تماس بگیرید.' },
          { cat: 'ارسال', q: 'هزینه ارسال چقدر است؟', a: 'هزینه ارسال توسط فروشنده تعیین می‌شود و قبل از ثبت نهایی سفارش نمایش داده می‌شود.' },
          { cat: 'ارسال', q: 'چقدر طول می‌کشد سفارش برسد؟', a: 'بسته به شهر مبدأ فروشنده و روش ارسال معمولاً ۲ تا ۵ روز کاری است.' },
          { cat: 'مرجوعی', q: 'شرایط مرجوعی چیست؟', a: 'تا ۷ روز پس از تحویل، در صورت استفاده‌نشدن کالا و هماهنگی با پشتیبانی، امکان مرجوعی وجود دارد.' },
          { cat: 'مرجوعی', q: 'هزینه برگشت کالا با کیست؟', a: 'در صورت ایراد کالا یا مغایرت، هزینه بازگشت با فروشنده است؛ در غیر این صورت طبق قوانین مرجوعی محاسبه می‌شود.' },
          { cat: 'حساب کاربری', q: 'چطور از حساب خارج شوم؟', a: 'از پروفایل → اطلاعات حساب می‌توانید خروج یا خروج از همه دستگاه‌ها را انتخاب کنید.' },
          { cat: 'حساب کاربری', q: 'رمز عبور ندارم؛ چطور وارد شوم؟', a: 'ورود با شماره موبایل و کد یک‌بارمصرف (OTP) انجام می‌شود و نیازی به رمز ثابت نیست.' },
          { cat: 'فروشندگی', q: 'کارمزد پلتفرم چقدر است؟', a: 'جزئیات هزینه‌های پلتفرم در قرارداد فروشنده اعلام می‌شود. خریدار همان مبلغ نمایش‌داده‌شده را می‌پردازد.' },
          { cat: 'فروشندگی', q: 'چطور فروشنده شوم؟', a: 'از صفحه «فروشنده شوید» ثبت‌نام کنید، مدارک و جواز را ارسال کنید و پس از تأیید ادمین کالا اضافه کنید.' },
      ];
      const DEFAULT_SELLER_FAQS = [
          { q: 'کارمزد پلتفرم چقدر است؟', a: 'جزئیات هزینه‌های پلتفرم در قرارداد فروشنده اعلام می‌شود.', cat: 'فروشندگی' },
          { q: 'چطور فروشنده شوم؟', a: 'ثبت‌نام کنید، مدارک و جواز را ارسال کنید و پس از تأیید ادمین کالا اضافه کنید.', cat: 'فروشندگی' },
          { q: 'چه مدارکی لازم است؟', a: 'مدارک هویتی و مجوز فعالیت صنفی طبق راهنمای احراز هویت در پنل.', cat: 'فروشندگی' },
      ];
      const [adminPageContent, setAdminPageContent] = useStoreField(adminUiStore, 'adminPageContent');
      const saveAdminPageContentMap = (next) => {
        setAdminPageContent(next || {});
        try { localStorage.setItem('adminPageContent', JSON.stringify(next || {})); } catch (_) {}
        try {
          fetch('/api/site-settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ key: 'pages', value: next || {} }),
          }).catch(() => {});
        } catch (_) {}
      };
      const [siteFaqs, setSiteFaqs] = useStoreField(shopUiStore, 'siteFaqs');
      const saveSiteFaqs = (next) => {
        const list = Array.isArray(next) ? next : [];
        setSiteFaqs(list);
        try { localStorage.setItem('siteFaqs', JSON.stringify(list)); } catch (_) {}
        try {
          fetch('/api/site-settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ key: 'faqs', value: list }),
          }).catch(() => {});
        } catch (_) {}
      };
      const [adminSeoHubKey, setAdminSeoHubKey] = useStoreField(adminUiStore, 'adminSeoHubKey')
      const [adminPageSeoStep, setAdminPageSeoStep] = useStoreField(adminUiStore, 'adminPageSeoStep');
      const [seoRedirects, setSeoRedirects] = useStoreField(shopUiStore, 'seoRedirects');

      const [siteDialog, setSiteDialog] = useStoreField(shopUiStore, 'siteDialog');
      /* { mode:'prompt'|'confirm', title, message, defaultValue, fields, resolve } */
      const sitePrompt = (title, defaultValue = '') => new Promise((resolve) => {
        setSiteDialog({ mode: 'prompt', title: String(title || ''), defaultValue: defaultValue == null ? '' : String(defaultValue), message: '', fields: null, resolve });
      });
      const sitePromptFields = (title, fields) => new Promise((resolve) => {
        setSiteDialog({ mode: 'prompt', title: String(title || ''), defaultValue: '', message: '', fields: fields || [], resolve });
      });
      const siteConfirm = (message, title = 'تأیید') => new Promise((resolve) => {
        setSiteDialog({ mode: 'confirm', title: String(title || 'تأیید'), message: String(message || ''), defaultValue: '', fields: null, resolve });
      });
      const closeSiteDialog = (value) => {
        setSiteDialog((cur) => {
          try { cur?.resolve?.(value); } catch (_) {}
          return null;
        });
      };

      const [seo404Log, setSeo404Log] = useStoreField(shopUiStore, 'seo404Log');
            const [seoRedirectForm, setSeoRedirectForm] = useStoreField(formsStore, 'seoRedirectForm')
      const [adminAnalyticsSub, setAdminAnalyticsSub] = useStoreField(adminUiStore, 'adminAnalyticsSub');
            const [adminAnalyticsRange, setAdminAnalyticsRange] = useStoreField(adminUiStore, 'adminAnalyticsRange');
      const [adminGscSub, setAdminGscSub] = useStoreField(adminUiStore, 'adminGscSub');
      const [adminGscRange, setAdminGscRange] = useStoreField(adminUiStore, 'adminGscRange')
      const [adminGscDim, setAdminGscDim] = useStoreField(adminUiStore, 'adminGscDim');
      const [adminGscInspectUrl, setAdminGscInspectUrl] = useStoreField(adminUiStore, 'adminGscInspectUrl')
      const [adminGscInspectResult, setAdminGscInspectResult] = useStoreField(adminUiStore, 'adminGscInspectResult')
      const GSC_STORAGE_KEY = 'siteGscConsole';
      const buildGscSeed = () => ({}); /* production: no demo seed */
      const loadGscStore = () => {
        try {
          const raw = localStorage.getItem(GSC_STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && Array.isArray(parsed.performance) && parsed.performance.length > 50) return parsed;
          }
        } catch (_) {}
        const seed = buildGscSeed();
        try { localStorage.setItem(GSC_STORAGE_KEY, JSON.stringify(seed)); } catch (_) {}
        return seed;
      };
      const [gscStore, setGscStore] = useStoreField(shopUiStore, 'gscStore');
      const persistGsc = (next) => {
        setGscStore(next);
        try { localStorage.setItem(GSC_STORAGE_KEY, JSON.stringify(next)); } catch (_) {}
      };
      const gscRangeMs = { '24h': 86400000, '7d': 7 * 86400000, '28d': 28 * 86400000, '3m': 90 * 86400000, '6m': 180 * 86400000, '16m': 480 * 86400000 };
      const gscAggregate = (rangeKey = adminGscRange, dim = adminGscDim) => {
        const ms = gscRangeMs[rangeKey] || gscRangeMs['28d'];
        const cut = Date.now() - ms;
        const dimMap = { queries: 'query', pages: 'page', countries: 'country', devices: 'device', dates: 'date', searchAppearance: 'query' };
        const want = dimMap[dim] || 'query';
        const list = (gscStore?.performance || []).filter(r => {
          const ts = Date.parse(r.date + 'T12:00:00Z') || 0;
          return ts >= cut && (dim === 'dates' ? true : r.dim === want);
        });
        const bucket = {};
        list.forEach(r => {
          const key = dim === 'dates' ? r.date : (r.keys && r.keys[0]) || '(not set)';
          if (dim !== 'dates' && r.dim !== want) return;
          if (!bucket[key]) bucket[key] = { key, clicks: 0, impressions: 0, posSum: 0, n: 0 };
          bucket[key].clicks += r.clicks || 0;
          bucket[key].impressions += r.impressions || 0;
          bucket[key].posSum += (r.position || 0) * (r.impressions || 1);
          bucket[key].n += r.impressions || 1;
        });
        const rows = Object.values(bucket).map(b => ({
          key: b.key,
          clicks: b.clicks,
          impressions: b.impressions,
          ctr: b.impressions ? b.clicks / b.impressions : 0,
          position: b.n ? b.posSum / b.n : 0,
        })).sort((a, b) => b.clicks - a.clicks);
        const totals = rows.reduce((a, r) => ({
          clicks: a.clicks + r.clicks,
          impressions: a.impressions + r.impressions,
        }), { clicks: 0, impressions: 0 });
        totals.ctr = totals.impressions ? totals.clicks / totals.impressions : 0;
        totals.position = rows.length ? rows.reduce((s, r) => s + r.position, 0) / rows.length : 0;
        return { rows, totals, list };
      };
      const gscInspect = (url) => {
        const u = String(url || '').trim() || '/';
        const path = u.replace(/^https?:\/\/[^/]+/i, '') || '/';
        const coverageHit = (gscStore?.coverage || []).find(c => c.type === 'error') || null;
        const result = {
          url: path,
          inspectedAt: new Date().toISOString(),
          coverage: Math.random() > 0.15 ? 'URL is on Google' : 'URL is not on Google',
          indexing: Math.random() > 0.2 ? 'Indexed' : 'Discovered - currently not indexed',
          crawledAs: Math.random() > 0.5 ? 'MOBILE' : 'DESKTOP',
          lastCrawl: new Date(Date.now() - Math.random() * 5 * 86400000).toISOString(),
          robots: 'Allowed',
          indexingAllowed: 'Yes',
          pageFetch: 'Successful',
          canonicalUser: path,
          canonicalGoogle: path,
          mobileFriendly: Math.random() > 0.1 ? 'Yes' : 'No',
          richResults: Math.random() > 0.6 ? ['Product', 'BreadcrumbList'] : ['BreadcrumbList'],
          referringSitemaps: (gscStore?.sitemaps || []).slice(0, 2).map(s => s.path),
        };
        setAdminGscInspectResult(result);
        const next = { ...gscStore, inspectionCache: { ...(gscStore.inspectionCache || {}), [path]: result } };
        persistGsc(next);
        return result;
      };
      const GA4_STORAGE_KEY = 'siteGa4Analytics';
      const buildGa4Seed = () => ({}); /* production: no demo seed */
;
      const loadGa4Store = () => {
        try {
          const raw = localStorage.getItem(GA4_STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && Array.isArray(parsed.events) && parsed.events.length > 100) return parsed;
          }
        } catch (_) {}
        const seed = buildGa4Seed();
        try { localStorage.setItem(GA4_STORAGE_KEY, JSON.stringify(seed)); } catch (_) {}
        return seed;
      };
      const [ga4Store, setGa4Store] = useStoreField(shopUiStore, 'ga4Store');
      const persistGa4 = (next) => {
        setGa4Store(next);
        try { localStorage.setItem(GA4_STORAGE_KEY, JSON.stringify(next)); } catch (_) {}
      };
      const trackGa4Event = (name, params = {}, ctx = {}) => {
        try {
          const page_path = ctx.page_path || (typeof window !== 'undefined' ? (window.location.pathname + window.location.search) : '/');
          const row = {
            name: String(name || 'custom_event'),
            ts: Date.now(),
            params: { ...params },
            user_id: ctx.user_id || (user?.id || 'anon'),
            source: ctx.source || 'direct',
            medium: ctx.medium || '(none)',
            campaign: ctx.campaign || '(direct)',
            device: ctx.device || (typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'),
            browser: ctx.browser || 'Chrome',
            os: ctx.os || 'Unknown',
            city: ctx.city || 'تهران',
            country: ctx.country || 'IR',
            page_path,
          };
          setGa4Store(prev => {
            const base = prev && Array.isArray(prev.events) ? prev : loadGa4Store();
            const events = [row, ...(base.events || [])].slice(0, 25000);
            const next = { ...base, events };
            try { localStorage.setItem(GA4_STORAGE_KEY, JSON.stringify(next)); } catch (_) {}
            return next;
          });
          if (typeof window !== 'undefined' && window.gtag) {
            try { window.gtag('event', name, params); } catch (_) {}
          }
          if (typeof window !== 'undefined') {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ event: name, ...params });
          }
        } catch (_) {}
      };
      const ga4RangeMs = { '24h': 86400000, '7d': 7 * 86400000, '28d': 28 * 86400000, '90d': 90 * 86400000 };
      const ga4FilterEvents = (rangeKey = adminAnalyticsRange) => {
        const ms = ga4RangeMs[rangeKey] || ga4RangeMs['28d'];
        const cut = Date.now() - ms;
        return (ga4Store?.events || []).filter(e => (e.ts || 0) >= cut);
      };
      const ga4Aggregate = (rangeKey = adminAnalyticsRange) => {
        const list = ga4FilterEvents(rangeKey);
        const users = new Set();
        const sessions = new Set();
        let pageViews = 0, purchases = 0, revenue = 0, addToCarts = 0, checkouts = 0, engaged = 0;
        const bySource = {};
        const byPage = {};
        const byEvent = {};
        const byDevice = {};
        const byBrowser = {};
        const byOs = {};
        const byCity = {};
        const byCountry = {};
        const byLanding = {};
        const byCampaign = {};
        const byItem = {};
        const byHour = Array.from({ length: 24 }, () => 0);
        const byDay = {};
        const searchTerms = {};
        list.forEach(e => {
          if (e.user_id) users.add(e.user_id);
          const sid = e.params?.session_id || `${e.user_id}_${new Date(e.ts).toDateString()}`;
          sessions.add(sid);
          byEvent[e.name] = (byEvent[e.name] || 0) + 1;
          const dev = e.device || 'unknown';
          byDevice[dev] = (byDevice[dev] || 0) + 1;
          const br = e.browser || 'unknown';
          byBrowser[br] = (byBrowser[br] || 0) + 1;
          const os = e.os || 'unknown';
          byOs[os] = (byOs[os] || 0) + 1;
          const city = e.city || 'unknown';
          byCity[city] = (byCity[city] || 0) + 1;
          const country = e.country || 'unknown';
          byCountry[country] = (byCountry[country] || 0) + 1;
          const srcKey = `${e.source || '(direct)'} / ${e.medium || '(none)'}`;
          bySource[srcKey] = bySource[srcKey] || { users: new Set(), events: 0, revenue: 0, sessions: new Set() };
          bySource[srcKey].events += 1;
          bySource[srcKey].users.add(e.user_id);
          bySource[srcKey].sessions.add(sid);
          const camp = e.campaign || '(not set)';
          byCampaign[camp] = (byCampaign[camp] || 0) + 1;
          const hour = new Date(e.ts).getHours();
          byHour[hour] += 1;
          const dayKey = new Date(e.ts).toISOString().slice(0, 10);
          byDay[dayKey] = (byDay[dayKey] || 0) + 1;
          if (e.name === 'page_view') {
            pageViews += 1;
            const pg = e.page_path || e.params?.page_location || '/';
            byPage[pg] = (byPage[pg] || 0) + 1;
          }
          if (e.name === 'session_start') {
            const lp = e.page_path || '/';
            byLanding[lp] = (byLanding[lp] || 0) + 1;
          }
          if (e.name === 'add_to_cart') addToCarts += 1;
          if (e.name === 'begin_checkout') checkouts += 1;
          if (e.name === 'purchase') {
            purchases += 1;
            const val = Number(e.params?.value) || 0;
            revenue += val;
            bySource[srcKey].revenue += val;
            (e.params?.items || []).forEach(it => {
              const id = it.item_id || it.item_name;
              byItem[id] = byItem[id] || { name: it.item_name, qty: 0, revenue: 0 };
              byItem[id].qty += 1;
              byItem[id].revenue += Number(it.price) || 0;
            });
          }
          if (e.name === 'user_engagement' || e.name === 'scroll') engaged += 1;
          if (e.name === 'search' && e.params?.search_term) {
            const st = e.params.search_term;
            searchTerms[st] = (searchTerms[st] || 0) + 1;
          }
        });
        const sourceRows = Object.entries(bySource).map(([k, v]) => ({
          key: k, users: v.users.size, sessions: v.sessions.size, events: v.events, revenue: v.revenue,
        })).sort((a, b) => b.users - a.users);
        const top = (obj, n = 10) => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n);
        return {
          list,
          activeUsers: users.size,
          sessions: sessions.size,
          pageViews,
          purchases,
          revenue,
          addToCarts,
          checkouts,
          engaged,
          conversionRate: sessions.size ? (purchases / sessions.size) * 100 : 0,
          avgViewsPerSession: sessions.size ? pageViews / sessions.size : 0,
          sourceRows,
          topPages: top(byPage),
          topEvents: top(byEvent, 20),
          topDevices: top(byDevice),
          topBrowsers: top(byBrowser),
          topOs: top(byOs),
          topCities: top(byCity),
          topCountries: top(byCountry),
          topLandings: top(byLanding),
          topCampaigns: top(byCampaign),
          topItems: Object.entries(byItem).map(([id, v]) => ({ id, ...v })).sort((a, b) => b.revenue - a.revenue).slice(0, 15),
          byHour,
          byDay,
          searchTerms: top(searchTerms, 15),
          funnel: {
            view_item: list.filter(e => e.name === 'view_item').length,
            add_to_cart: addToCarts,
            begin_checkout: checkouts,
            purchase: purchases,
          },
        };
      };
      const [seoAiDaily, setSeoAiDaily] = useStoreField(shopUiStore, 'seoAiDaily');

      const saveSeoRedirects = (next) => {
        setSeoRedirects(next);
        try { localStorage.setItem('seoRedirects', JSON.stringify(next)); } catch (_) {}
        try {
          fetch('/api/seo/redirects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ redirects: next || [] }),
          }).catch(() => {});
        } catch (_) {}
      };

      useEffect(() => {
        try {
          const raw = localStorage.getItem('seoRedirects');
          if (!raw) return;
          const list = JSON.parse(raw);
          if (!Array.isArray(list) || !list.length) return;
          fetch('/api/seo/redirects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ redirects: list }),
          }).catch(() => {});
        } catch (_) {}
      }, []);
      const saveSeo404Log = (next) => {
        setSeo404Log(next);
        try { localStorage.setItem('seo404Log', JSON.stringify(next)); } catch (_) {}
      };
      const logSeo404 = (path, referrer) => {
        const entry = {
          id: '404-' + Date.now(),
          path: path || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : ''),
          referrer: referrer || (typeof document !== 'undefined' ? document.referrer : ''),
          at: new Date().toISOString(),
          atFa: new Date().toLocaleString('fa-IR'),
        };
        saveSeo404Log([entry, ...(seo404Log || [])].slice(0, 200));
      };

      const [adminFrontEditOpen, setAdminFrontEditOpen] = useStoreField(adminUiStore, 'adminFrontEditOpen')
      const [adminFrontEditForm, setAdminFrontEditForm] = useStoreField(adminUiStore, 'adminFrontEditForm')
      const savePageSeoMap = (next) => {
        setPageSeoMap(next);
        try { localStorage.setItem('pageSeoMap', JSON.stringify(next)); } catch (_) {}
      };

      const [adminTab, setAdminTab] = useStoreField(adminUiStore, 'adminTab');

      // بخش محتوا و تأیید موقتاً از پنل ادمین حذف شده
      useEffect(() => {
        if (adminTab === 'content') setAdminTab('dashboard');
        else if (!adminTab) setAdminTab('dashboard');
        try {
          if (adminTab) sessionStorage.setItem('adminTab', String(adminTab));
        } catch (_) {}
      }, [adminTab]);
      // ——— تاکسونومی سراسری (دسته ایندکس‌پذیر / برچسب ممنوع از ایندکس) ———
      const slugifyTaxonomy = (s) => slugifyFa(s);
      /** نامک محصول: نام_محصول / نام_فروشگاه */
      const productSlugFromNameAndShop = (productName, shopName) => {
        const a = slugifyFa(productName);
        const b = slugifyFa(shopName || '');
        if (a && b && b !== 'مورد') return `${a}/${b}`;
        return a || 'محصول';
      };
      const applySellerDescFormat = (type) => {
        const el = sellerDescRef.current;
        if (!el) return;
        const start = el.selectionStart ?? 0;
        const end = el.selectionEnd ?? 0;
        const val = sellerDescDraft || '';
        const selected = val.slice(start, end);
        let next = val;
        let caret = end;
        const wrap = (before, after = before) => {
          const body = selected || 'متن';
          next = val.slice(0, start) + before + body + after + val.slice(end);
          caret = start + before.length + body.length + after.length;
        };
        if (type === 'bold') wrap('**', '**');
        else if (type === 'italic') wrap('*', '*');
        else if (type === 'h2') {
          const body = selected || 'عنوان بخش';
          const line = `## ${body}`;
          next = val.slice(0, start) + (start > 0 && val[start-1] !== '\n' ? '\n' : '') + line + '\n' + val.slice(end);
          caret = start + line.length + 2;
        }
        else if (type === 'ul') {
          const lines = (selected || 'مورد').split('\n').map(l => l.trim() ? (l.startsWith('• ') ? l : `• ${l}`) : '• ');
          next = val.slice(0, start) + lines.join('\n') + val.slice(end);
          caret = start + lines.join('\n').length;
        }
        else if (type === 'ol') {
          const lines = (selected || 'مورد').split('\n').map((l, i) => l.trim() ? `${i+1}. ${l.replace(/^\d+\.\s*/, '')}` : `${i+1}. `);
          next = val.slice(0, start) + lines.join('\n') + val.slice(end);
          caret = start + lines.join('\n').length;
        }
        else if (type === 'quote') {
          const body = selected || 'نکته';
          next = val.slice(0, start) + `> ${body}` + val.slice(end);
          caret = start + body.length + 2;
        }
        else if (type === 'hr') {
          next = val.slice(0, start) + '\n———\n' + val.slice(end);
          caret = start + 5;
        }
        setSellerDescDraft(next);
        setSellerDescError('');
        requestAnimationFrame(() => {
          const node = sellerDescRef.current;
          if (!node) return;
          node.focus();
          node.setSelectionRange(caret, caret);
        });
      };

      const defaultAdminCategories = () => [
        { id: 'cat-rasmi', name: 'رسمی', slug: 'rasmi', url: '/shop?cat=rasmi', indexable: true, active: true, image: '/logo.webp', description: 'پیراهن رسمی مردانه برای محیط کار، مراسم و استایل کلاسیک. تنوع پارچه و رنگ از فروشندگان معتبر.' },
        { id: 'cat-kravati', name: 'کروات', slug: 'kravati', url: '/shop?cat=kravati', indexable: true, active: true, image: '/logo.webp', description: 'پیراهن مناسب کروات با یقه رسمی و دوخت دقیق برای استایل اداری و رسمی.' },
        { id: 'cat-short', name: 'آستین کوتاه', slug: 'astin-kutah', url: '/shop?cat=astin-kutah', indexable: true, active: true, image: '/logo.webp', description: 'پیراهن آستین کوتاه و لینن برای فصل گرم؛ سبک، خنک و مناسب استفاده روزمره.' },
      ];
      const defaultAdminTags = () => [
        { id: 'tag-linen', name: 'لینن', slug: 'linen', url: '/shop?tag=linen', indexable: false, active: true, image: '/logo.webp', description: 'محصولات با پارچه لینن — خنک و مناسب تابستان. این صفحه برچسب است و ایندکس نمی‌شود.' },
        { id: 'tag-summer', name: 'تابستانه', slug: 'tabestane', url: '/shop?tag=tabestane', indexable: false, active: true, image: '/logo.webp', description: 'انتخاب‌های سبک و خنک برای فصل تابستان. صفحه برچسب — noindex.' },
        { id: 'tag-luxury', name: 'لوکس', slug: 'luxury', url: '/shop?tag=luxury', indexable: false, active: true, image: '/logo.webp', description: 'محصولات با دوخت و متریال لوکس. صفحه برچسب — noindex.' },
      ];
      const [adminCategories, setAdminCategories] = useStoreField(adminUiStore, 'adminCategories');
      const [adminTags, setAdminTags] = useStoreField(adminUiStore, 'adminTags');
      const saveAdminCategories = async (next) => {
        const prev = Array.isArray(adminCategories) ? adminCategories : [];
        const list = typeof next === "function" ? next(prev) : next;
        const arr = Array.isArray(list) ? list : [];
        setAdminCategories(arr);
        try {
          const payload = arr.map((c, i) => ({
            id: String(c.id || ("cat-" + Date.now() + "-" + i)),
            name: String(c.name || "دسته").trim(),
            slug: String(c.slug || c.name || "cat").trim().replace(/\s+/g, "-").slice(0, 80),
            parent_id: c.parent_id || c.parentId || null,
            active: c.active !== false,
            sort_order: Number.isFinite(Number(c.sort_order != null ? c.sort_order : c.sortOrder))
              ? Number(c.sort_order != null ? c.sort_order : c.sortOrder)
              : i,
          }));
          const res = await fetch("/api/catalog/categories", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ categories: payload }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            console.error("categories PUT failed", data);
            setAdminCategories(prev);
            try {
              showToast && showToast({
                message: "ذخیره دسته ناموفق: " + (data.error || res.status),
                variant: "error",
                duration: 5000,
                position: "top-center",
              });
            } catch (_) {}
            return false;
          }
          const saved = Array.isArray(data.categories) ? data.categories : payload;
          const merged = saved.map((s) => {
            const oldC = arr.find((x) => x.id === s.id) || {};
            return Object.assign({}, oldC, s, { parentId: s.parent_id != null ? s.parent_id : oldC.parentId });
          });
          setAdminCategories(merged);
          try { localStorage.setItem("adminCategories", JSON.stringify(merged)); } catch (_) {}
          try { sessionStorage.setItem("adminCatalogCategories", JSON.stringify(merged)); } catch (_) {}
          try { window.dispatchEvent(new CustomEvent("pm:catalog-categories", { detail: merged })); } catch (_) {}
          return true;
        } catch (e) {
          console.error(e);
          setAdminCategories(prev);
          return false;
        }
      };

      const refreshCatalogCategories = async () => {
        try {
          const res = await fetch("/api/catalog/categories", { cache: "no-store" });
          const data = await res.json().catch(() => ({}));
          const list = Array.isArray(data.categories) ? data.categories : null;
          if (list && list.length) {
            const mapped = list.map((s) => Object.assign({}, s, { parentId: s.parent_id }));
            setAdminCategories(mapped);
            try { localStorage.setItem("adminCategories", JSON.stringify(mapped)); } catch (_) {}
          }
        } catch (_) {}
      };
      useEffect(() => {
        refreshCatalogCategories();
        const onFocus = () => { try { refreshCatalogCategories(); } catch (_) {} };
        const onCustom = (e) => {
          if (Array.isArray(e && e.detail) && e.detail.length) setAdminCategories(e.detail);
        };
        const onStorage = (e) => {
          if ((e.key === "adminCategories" || e.key === "adminCatalogCategories") && e.newValue) {
            try { setAdminCategories(JSON.parse(e.newValue)); } catch (_) {}
          }
        };
        window.addEventListener("focus", onFocus);
        window.addEventListener("pm:catalog-categories", onCustom);
        window.addEventListener("storage", onStorage);
        const iv = setInterval(() => { try { refreshCatalogCategories(); } catch (_) {} }, 60000);
        return () => {
          window.removeEventListener("focus", onFocus);
          window.removeEventListener("pm:catalog-categories", onCustom);
          window.removeEventListener("storage", onStorage);
          clearInterval(iv);
        };
      }, []);


      const saveAdminTags = async (next) => {
        const prev = Array.isArray(adminTags) ? adminTags : [];
        const list = typeof next === "function" ? next(prev) : next;
        const arr = Array.isArray(list) ? list : [];
        setAdminTags(arr);
        try {
          const payload = arr.map((tag, i) => ({
            id: String(tag.id || ("tag-" + Date.now() + "-" + i)),
            name: String(tag.name || "برچسب").trim(),
            slug: String(tag.slug || tag.name || "tag").trim().replace(/\s+/g, "-").slice(0, 80),
            active: tag.active !== false,
            sort_order: Number.isFinite(Number(tag.sort_order != null ? tag.sort_order : tag.sortOrder))
              ? Number(tag.sort_order != null ? tag.sort_order : tag.sortOrder)
              : i,
          }));
          const res = await fetch("/api/catalog/tags", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tags: payload }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            console.error("tags PUT failed", data);
            setAdminTags(prev);
            try {
              showToast && showToast({
                message: "ذخیره برچسب ناموفق: " + (data.error || res.status),
                variant: "error",
                duration: 5000,
                position: "top-center",
              });
            } catch (_) {}
            return false;
          }
          const saved = Array.isArray(data.tags) ? data.tags : payload;
          const merged = saved.map((s) => {
            const oldT = arr.find((x) => x.id === s.id) || {};
            return Object.assign({}, oldT, s);
          });
          setAdminTags(merged);
          try { localStorage.setItem("adminTags", JSON.stringify(merged)); } catch (_) {}
          try { sessionStorage.setItem("adminCatalogTags", JSON.stringify(merged)); } catch (_) {}
          try { window.dispatchEvent(new CustomEvent("pm:catalog-tags", { detail: merged })); } catch (_) {}
          return true;
        } catch (e) {
          console.error(e);
          setAdminTags(prev);
          return false;
        }
      };

      const refreshCatalogTags = async () => {
        try {
          const res = await fetch("/api/catalog/tags", { cache: "no-store" });
          const data = await res.json().catch(() => ({}));
          const list = Array.isArray(data.tags) ? data.tags : null;
          if (list && list.length) {
            setAdminTags(list);
            try { localStorage.setItem("adminTags", JSON.stringify(list)); } catch (_) {}
          }
        } catch (_) {}
      };
      useEffect(() => {
        refreshCatalogTags();
        const onFocus = () => { try { refreshCatalogTags(); } catch (_) {} };
        const onCustom = (e) => {
          if (Array.isArray(e && e.detail) && e.detail.length) setAdminTags(e.detail);
        };
        const onStorage = (e) => {
          if ((e.key === "adminTags" || e.key === "adminCatalogTags") && e.newValue) {
            try { setAdminTags(JSON.parse(e.newValue)); } catch (_) {}
          }
        };
        window.addEventListener("focus", onFocus);
        window.addEventListener("pm:catalog-tags", onCustom);
        window.addEventListener("storage", onStorage);
        const iv = setInterval(() => { try { refreshCatalogTags(); } catch (_) {} }, 60000);
        return () => {
          window.removeEventListener("focus", onFocus);
          window.removeEventListener("pm:catalog-tags", onCustom);
          window.removeEventListener("storage", onStorage);
          clearInterval(iv);
        };
      }, []);


      const defaultAdminBlogCategories = () => [
        { id: 'bc-guide', name: 'راهنمای خرید', active: true },
        { id: 'bc-fashion', name: 'مد و فشن', active: true },
        { id: 'bc-care', name: 'مراقبت و نگهداری', active: true },
        { id: 'bc-news', name: 'اخبار فروشگاه', active: true },
        { id: 'bc-other', name: 'سایر', active: true },
      ];
      const [adminBlogCategories, setAdminBlogCategories] = useStoreField(adminUiStore, 'adminBlogCategories');
      const saveAdminBlogCategories = (next) => {
        setAdminBlogCategories(next);
        try { localStorage.setItem('adminBlogCategories', JSON.stringify(next)); } catch (_) {}
      };
      const [adminBlogTags, setAdminBlogTags] = useStoreField(adminUiStore, 'adminBlogTags');
      const saveAdminBlogTags = (next) => {
        setAdminBlogTags(next || []);
        try { localStorage.setItem('adminBlogTags', JSON.stringify(next || [])); } catch (_) {}
      };


      const DEFAULT_CATALOG_COLORS = [
        { id: 'col-black', name: 'مشکی', hex: '#1a1a1a', active: true },
        { id: 'col-white', name: 'سفید', hex: '#f8fafc', active: true },
        { id: 'col-navy', name: 'سرمه‌ای', hex: '#0f172a', active: true },
        { id: 'col-blue', name: 'آبی', hex: '#1e3a5f', active: true },
        { id: 'col-lightblue', name: 'آبی روشن', hex: '#60a5fa', active: true },
        { id: 'col-gray', name: 'طوسی', hex: '#6b7280', active: true },
        { id: 'col-beige', name: 'بژ', hex: '#d4c4a8', active: true },
        { id: 'col-green', name: 'سبز', hex: '#166534', active: true },
      ];
      const DEFAULT_CATALOG_SIZES = [
        { id: 'sz-s', name: 'S', active: true },
        { id: 'sz-m', name: 'M', active: true },
        { id: 'sz-l', name: 'L', active: true },
        { id: 'sz-xl', name: 'XL', active: true },
        { id: 'sz-xxl', name: 'XXL', active: true },
      ];
      const DEFAULT_CATALOG_BRANDS = [
        { id: 'br1', name: 'کلاسیک من', active: true },
        { id: 'br2', name: 'لینن‌لند', active: true },
        { id: 'br3', name: 'استایل پرو', active: true },
        { id: 'br4', name: 'نخی‌بافت', active: true },
        { id: 'br5', name: 'فرمال‌ویر', active: true },
        { id: 'br6', name: 'ساده پوش', active: true },
      ];
      const [adminCatalogColors, setAdminCatalogColors] = useStoreField(adminUiStore, 'adminCatalogColors');

  const saveAdminCatalogColors = async (next) => {
    const prev = Array.isArray(adminCatalogColors) ? adminCatalogColors : [];
    const list = typeof next === "function" ? next(prev) : next;
    const arr = Array.isArray(list) ? list : [];
    setAdminCatalogColors(arr);
    try {
      const res = await fetch("/api/catalog/colors", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colors: arr }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("catalog colors PUT failed", data);
        setAdminCatalogColors(prev);
        try {
          if (typeof showToast === "function") {
            showToast({ message: "ذخیره رنگ ناموفق: " + (data?.error || res.status), variant: "error", duration: 5000 });
          } else {
            showToast({ message: "ذخیره رنگ ناموفق: " + (data?.error || res.status), variant: "error", duration: 5000, position: "top-center" });
          }
        } catch (_) {}
        return false;
      }
      const saved = Array.isArray(data?.colors) ? data.colors : arr;
      setAdminCatalogColors(saved);
      try { sessionStorage.setItem("adminCatalogColors", JSON.stringify(saved)); } catch (_) {}
      try { window.dispatchEvent(new CustomEvent("pm:catalog-colors", { detail: saved })); } catch (_) {}
      return true;
    } catch (e) {
      console.error(e);
      setAdminCatalogColors(prev);
      try { showToast({ message: "خطا در ذخیره رنگ: " + (e?.message || e), variant: "error", duration: 5000, position: "top-center" }); } catch (_) {}
      return false;
    }
  };

  const refreshCatalogColors = async () => {
    try {
      const res = await fetch("/api/catalog/colors", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      const list = Array.isArray(data?.colors) ? data.colors : null;
      if (list) {
        setAdminCatalogColors(list);
        try { sessionStorage.setItem("adminCatalogColors", JSON.stringify(list)); } catch (_) {}
      }
    } catch (_) {}
  };

  useEffect(() => {
    refreshCatalogColors();
    const onFocus = () => { try { refreshCatalogColors(); } catch (_) {} };
    const onCustom = (e) => { if (Array.isArray(e?.detail)) setAdminCatalogColors(e.detail); };
    const onStorage = (e) => {
      if (e.key === "adminCatalogColors" && e.newValue) {
        try { setAdminCatalogColors(JSON.parse(e.newValue)); } catch (_) {}
      }
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("pm:catalog-colors", onCustom);
    window.addEventListener("storage", onStorage);
    const iv = setInterval(() => { try { refreshCatalogColors(); } catch (_) {} }, 60000);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pm:catalog-colors", onCustom);
      window.removeEventListener("storage", onStorage);
      clearInterval(iv);
    };
  }, []);
      const [adminCatalogSizes, setAdminCatalogSizes] = useStoreField(adminUiStore, 'adminCatalogSizes');
      const [adminCatalogBrands, setAdminCatalogBrands] = useStoreField(adminUiStore, 'adminCatalogBrands');
      const saveAdminCatalogSizes = async (next) => {
        const prev = Array.isArray(adminCatalogSizes) ? adminCatalogSizes : [];
        const list = typeof next === "function" ? next(prev) : next;
        const arr = Array.isArray(list) ? list : [];
        setAdminCatalogSizes(arr);
        try {
          const payload = arr.map((s, i) => ({
            id: String(s.id || ("size-" + Date.now() + "-" + i)),
            name: String(s.name || "سایز").trim(),
            slug: String(s.slug || s.name || "size").trim().replace(/\s+/g, "-").slice(0, 40),
            active: s.active !== false,
            sort_order: Number.isFinite(Number(s.sort_order != null ? s.sort_order : s.sortOrder))
              ? Number(s.sort_order != null ? s.sortOrder : s.sort_order)
              : i,
          }));
          // fix sort_order ternary
          const payload2 = arr.map((s, i) => {
            const so = s.sort_order != null ? s.sort_order : s.sortOrder;
            return {
              id: String(s.id || ("size-" + Date.now() + "-" + i)),
              name: String(s.name || "سایز").trim(),
              slug: String(s.slug || s.name || "size").trim().replace(/\s+/g, "-").slice(0, 40),
              active: s.active !== false,
              sort_order: Number.isFinite(Number(so)) ? Number(so) : i,
            };
          });
          const res = await fetch("/api/catalog/sizes", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sizes: payload2 }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            console.error("sizes PUT failed", data);
            setAdminCatalogSizes(prev);
            try {
              showToast && showToast({
                message: "ذخیره سایز ناموفق: " + (data.error || res.status),
                variant: "error",
                duration: 5000,
                position: "top-center",
              });
            } catch (_) {}
            return false;
          }
          const saved = Array.isArray(data.sizes) ? data.sizes : payload2;
          const merged = saved.map((s) => {
            const oldS = arr.find((x) => x.id === s.id) || {};
            return Object.assign({}, oldS, s);
          });
          setAdminCatalogSizes(merged);
          try { sessionStorage.setItem("adminCatalogSizes", JSON.stringify(merged)); } catch (_) {}
          try { window.dispatchEvent(new CustomEvent("pm:catalog-sizes", { detail: merged })); } catch (_) {}
          return true;
        } catch (e) {
          console.error(e);
          setAdminCatalogSizes(prev);
          return false;
        }
      };

      const refreshCatalogSizes = async () => {
        try {
          const res = await fetch("/api/catalog/sizes", { cache: "no-store" });
          const data = await res.json().catch(() => ({}));
          const list = Array.isArray(data.sizes) ? data.sizes : null;
          if (list && list.length) {
            setAdminCatalogSizes(list);
            try { sessionStorage.setItem("adminCatalogSizes", JSON.stringify(list)); } catch (_) {}
          }
        } catch (_) {}
      };
      useEffect(() => {
        refreshCatalogSizes();
        const onFocus = () => { try { refreshCatalogSizes(); } catch (_) {} };
        const onCustom = (e) => {
          if (Array.isArray(e && e.detail) && e.detail.length) setAdminCatalogSizes(e.detail);
        };
        const onStorage = (e) => {
          if (e.key === "adminCatalogSizes" && e.newValue) {
            try { setAdminCatalogSizes(JSON.parse(e.newValue)); } catch (_) {}
          }
        };
        window.addEventListener("focus", onFocus);
        window.addEventListener("pm:catalog-sizes", onCustom);
        window.addEventListener("storage", onStorage);
        const iv = setInterval(() => { try { refreshCatalogSizes(); } catch (_) {} }, 60000);
        return () => {
          window.removeEventListener("focus", onFocus);
          window.removeEventListener("pm:catalog-sizes", onCustom);
          window.removeEventListener("storage", onStorage);
          clearInterval(iv);
        };
      }, []);


      const saveAdminCatalogBrands = async (next) => {
        const prev = Array.isArray(adminCatalogBrands) ? adminCatalogBrands : [];
        const list = typeof next === "function" ? next(prev) : next;
        const arr = Array.isArray(list) ? list : [];
        setAdminCatalogBrands(arr);
        try {
          const payload = arr.map((b, i) => ({
            id: String(b.id || ("brand-" + Date.now() + "-" + i)),
            name: String(b.name || "برند").trim(),
            slug: String(b.slug || b.name || "brand").trim().replace(/\s+/g, "-").slice(0, 80),
            active: b.active !== false,
            sort_order: Number.isFinite(Number(b.sort_order != null ? b.sort_order : b.sortOrder))
              ? Number(b.sort_order != null ? b.sort_order : b.sortOrder)
              : i,
            logo_url: b.logo_url || b.logoUrl || b.image || null,
          }));
          const res = await fetch("/api/catalog/brands", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ brands: payload }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            console.error("brands PUT failed", data);
            setAdminCatalogBrands(prev);
            try {
              showToast && showToast({
                message: "ذخیره برند ناموفق: " + (data.error || res.status),
                variant: "error",
                duration: 5000,
                position: "top-center",
              });
            } catch (_) {}
            return false;
          }
          const saved = Array.isArray(data.brands) ? data.brands : payload;
          const merged = saved.map((s) => {
            const oldB = arr.find((x) => x.id === s.id) || {};
            return Object.assign({}, oldB, s, {
              logoUrl: s.logo_url || oldB.logoUrl || oldB.image,
              image: s.logo_url || oldB.image || oldB.logoUrl,
            });
          });
          setAdminCatalogBrands(merged);
          try { sessionStorage.setItem("adminCatalogBrands", JSON.stringify(merged)); } catch (_) {}
          try { window.dispatchEvent(new CustomEvent("pm:catalog-brands", { detail: merged })); } catch (_) {}
          return true;
        } catch (e) {
          console.error(e);
          setAdminCatalogBrands(prev);
          return false;
        }
      };

      const refreshCatalogBrands = async () => {
        try {
          const res = await fetch("/api/catalog/brands", { cache: "no-store" });
          const data = await res.json().catch(() => ({}));
          const list = Array.isArray(data.brands) ? data.brands : null;
          if (list && list.length) {
            const mapped = list.map((s) => Object.assign({}, s, {
              logoUrl: s.logo_url,
              image: s.logo_url,
            }));
            setAdminCatalogBrands(mapped);
            try { sessionStorage.setItem("adminCatalogBrands", JSON.stringify(mapped)); } catch (_) {}
          }
        } catch (_) {}
      };
      useEffect(() => {
        refreshCatalogBrands();
        const onFocus = () => { try { refreshCatalogBrands(); } catch (_) {} };
        const onCustom = (e) => {
          if (Array.isArray(e && e.detail) && e.detail.length) setAdminCatalogBrands(e.detail);
        };
        const onStorage = (e) => {
          if (e.key === "adminCatalogBrands" && e.newValue) {
            try { setAdminCatalogBrands(JSON.parse(e.newValue)); } catch (_) {}
          }
        };
        window.addEventListener("focus", onFocus);
        window.addEventListener("pm:catalog-brands", onCustom);
        window.addEventListener("storage", onStorage);
        const iv = setInterval(() => { try { refreshCatalogBrands(); } catch (_) {} }, 60000);
        return () => {
          window.removeEventListener("focus", onFocus);
          window.removeEventListener("pm:catalog-brands", onCustom);
          window.removeEventListener("storage", onStorage);
          clearInterval(iv);
        };
      }, []);


      const [catalogForm, setCatalogForm] = useStoreField(formsStore, 'catalogForm');

      const DEFAULT_CATALOG_ATTRIBUTES = [
        { id: 'attr-material', name: 'جنس پارچه', active: true, required: false, multi: true, categoryNames: [], options: ['نخی', 'لینن', 'پلی‌استر', 'ویسکوز', 'ترکیبی'] },
        { id: 'attr-fit', name: 'برش / فیت', active: true, required: false, multi: true, categoryNames: [], options: ['Slim', 'Regular', 'Relaxed', 'Oversize'] },
        { id: 'attr-collar', name: 'نوع یقه', active: true, required: false, multi: true, categoryNames: ['رسمی', 'کروات'], options: ['کلاسیک', 'دکمه‌دار', 'گرد', 'هفتی'] },
        { id: 'attr-sleeve', name: 'آستین', active: true, required: false, multi: true, categoryNames: [], options: ['بلند', 'کوتاه', 'سه‌ربع'] },
        { id: 'attr-pattern', name: 'طرح', active: true, required: false, multi: true, categoryNames: [], options: ['ساده', 'راه راه', 'چهارخانه', 'طرح‌دار'] },
      ];
      const [adminCatalogAttributes, setAdminCatalogAttributes] = useStoreField(adminUiStore, 'adminCatalogAttributes');
      const saveAdminCatalogAttributes = async (next) => {
        const prev = Array.isArray(adminCatalogAttributes) ? adminCatalogAttributes : [];
        const list = typeof next === "function" ? next(prev) : next;
        const arr = Array.isArray(list) ? list : [];
        setAdminCatalogAttributes(arr);
        try {
          const payload = arr.map((a, i) => {
            const opts = Array.isArray(a.options) ? a.options
              : Array.isArray(a.values) ? a.values
              : [];
            const cats = Array.isArray(a.categoryNames) ? a.categoryNames
              : Array.isArray(a.category_names) ? a.category_names
              : Array.isArray(a.categories) ? a.categories
              : [];
            const so = a.sort_order != null ? a.sort_order : a.sortOrder;
            return {
              id: String(a.id || ("attr-" + Date.now() + "-" + i)),
              name: String(a.name || "ویژگی").trim(),
              slug: String(a.slug || a.name || "attr").trim().replace(/\s+/g, "-").slice(0, 80),
              active: a.active !== false,
              sort_order: Number.isFinite(Number(so)) ? Number(so) : i,
              options: opts.map((x) => String(x).trim()).filter(Boolean),
              category_names: cats.map((x) => String(x).trim()).filter(Boolean),
            };
          });
          const res = await fetch("/api/catalog/attributes", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ attributes: payload }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            console.error("attributes PUT failed", data);
            setAdminCatalogAttributes(prev);
            try {
              showToast && showToast({
                message: "ذخیره ویژگی ناموفق: " + (data.error || res.status),
                variant: "error",
                duration: 5000,
                position: "top-center",
              });
            } catch (_) {}
            return false;
          }
          const saved = Array.isArray(data.attributes) ? data.attributes : payload;
          const merged = saved.map((s) => {
            const oldA = arr.find((x) => x.id === s.id) || {};
            return Object.assign({}, oldA, s, {
              categoryNames: s.category_names || s.categoryNames || oldA.categoryNames || [],
              options: s.options || oldA.options || [],
              values: s.options || s.values || oldA.values || [],
            });
          });
          setAdminCatalogAttributes(merged);
          try { sessionStorage.setItem("adminCatalogAttributes", JSON.stringify(merged)); } catch (_) {}
          try { sessionStorage.setItem("adminCatalogAttributes", JSON.stringify(merged)); } catch (_) {}
          try { window.dispatchEvent(new CustomEvent("pm:catalog-attributes", { detail: merged })); } catch (_) {}
          return true;
        } catch (e) {
          console.error(e);
          setAdminCatalogAttributes(prev);
          return false;
        }
      };

      const refreshCatalogAttributes = async () => {
        try {
          const res = await fetch("/api/catalog/attributes", { cache: "no-store" });
          const data = await res.json().catch(() => ({}));
          const list = Array.isArray(data.attributes) ? data.attributes : null;
          if (list && list.length) {
            const mapped = list.map((s) => Object.assign({}, s, {
              categoryNames: s.category_names || s.categoryNames || [],
              options: s.options || [],
              values: s.options || s.values || [],
            }));
            setAdminCatalogAttributes(mapped);
            try { sessionStorage.setItem("adminCatalogAttributes", JSON.stringify(mapped)); } catch (_) {}
            try { sessionStorage.setItem("adminCatalogAttributes", JSON.stringify(mapped)); } catch (_) {}
          }
        } catch (_) {}
      };
      useEffect(() => {
        refreshCatalogAttributes();
        const onFocus = () => { try { refreshCatalogAttributes(); } catch (_) {} };
        const onCustom = (e) => {
          if (Array.isArray(e && e.detail) && e.detail.length) setAdminCatalogAttributes(e.detail);
        };
        const onStorage = (e) => {
          if ((e.key === "adminCatalogAttributes" || e.key === "adminCatalogAttributes") && e.newValue) {
            try { setAdminCatalogAttributes(JSON.parse(e.newValue)); } catch (_) {}
          }
        };
        window.addEventListener("focus", onFocus);
        window.addEventListener("pm:catalog-attributes", onCustom);
        window.addEventListener("storage", onStorage);
        const iv = setInterval(() => { try { refreshCatalogAttributes(); } catch (_) {} }, 60000);
        return () => {
          window.removeEventListener("focus", onFocus);
          window.removeEventListener("pm:catalog-attributes", onCustom);
          window.removeEventListener("storage", onStorage);
          clearInterval(iv);
        };
      }, []);



      const emptyTaxonomyForm = (type = 'category') => ({
        type,
        id: null,
        name: '',
        slug: '',
        url: '',
        image: '',
        images: [],
        imageAlts: [],
        featuredImageIndex: 0,
        description: '',
        imageAlt: '',
        seoTitle: '',
        seoDescription: '',
        seoFocusKeywords: '',
        seoCanonical: '',
        seoNoindex: false,
        seoFaq: [],
        step: 1,
      });
      const [taxonomyForm, setTaxonomyForm] = useStoreField(formsStore, 'taxonomyForm')
      const [taxonomyFormOpen, setTaxonomyFormOpen] = useStoreField(formsStore, 'taxonomyFormOpen')
      const taxonomyTypeLabel = (t) => ({
        category: 'دسته محصول',
        tag: 'برچسب محصول',
        brand: 'برند',
        'blog-category': 'دسته مقالات',
        'blog-tag': 'برچسب مقالات',
      }[t] || 'مورد');
      const openTaxonomyWizard = (type, item = null) => {
        if (item) {
          const images = item.images && item.images.length ? [...item.images] : (item.image ? [item.image] : []);
          const imageAlts = item.imageAlts && item.imageAlts.length ? [...item.imageAlts] : images.map((_, i) => (i === 0 ? (item.imageAlt || '') : ''));
          setTaxonomyForm({
            ...emptyTaxonomyForm(type),
            type,
            id: item.id,
            name: item.name || '',
            slug: item.slug || slugifyTaxonomy(item.name || ''),
            url: item.url || '',
            image: item.image || images[0] || '',
            images,
            imageAlts,
            featuredImageIndex: item.featuredImageIndex || 0,
            description: item.description || item.desc || '',
            imageAlt: item.imageAlt || '',
            seoTitle: item.seoTitle || '',
            seoDescription: item.seoDescription || '',
            seoFocusKeywords: item.seoFocusKeywords || '',
            seoCanonical: item.seoCanonical || '',
            seoNoindex: !!item.seoNoindex,
            seoFaq: Array.isArray(item.seoFaq) ? item.seoFaq : [],
            step: 1,
          });
        } else {
          const prefix = type === 'category' ? '/' : type === 'tag' ? '/shop?tag=' : type === 'brand' ? '/brands/' : type === 'blog-category' ? '/blog?cat=' : '/blog?tag=';
          setTaxonomyForm({ ...emptyTaxonomyForm(type), type, url: prefix });
        }
        setTaxonomyFormOpen(true);
      };
      /** هاب: همه دسته‌ها | همه برچسب‌ها (صفحهٔ فهرست) */
      const [showTaxonomyHub, setShowTaxonomyHub] = useStoreField(shopUiStore, 'showTaxonomyHub');
      const [adminAuthOpen, setAdminAuthOpen] = useStoreField(adminUiStore, 'adminAuthOpen')
      const [adminAuthStep, setAdminAuthStep] = useStoreField(adminUiStore, 'adminAuthStep');
      const [adminAuthPhone, setAdminAuthPhone] = useStoreField(adminUiStore, 'adminAuthPhone')
      const [adminAuthOtp, setAdminAuthOtp] = useStoreField(adminUiStore, 'adminAuthOtp')
      const [adminAuthPassword, setAdminAuthPassword] = useStoreField(adminUiStore, 'adminAuthPassword')
      const [adminAuthMethod, setAdminAuthMethod] = useStoreField(adminUiStore, 'adminAuthMethod')
      const [adminAuthError, setAdminAuthError] = useStoreField(adminUiStore, 'adminAuthError')
      const [adminAuthLoading, setAdminAuthLoading] = useStoreField(adminUiStore, 'adminAuthLoading')
      const [adminAuthOtpTimer, setAdminAuthOtpTimer] = useStoreField(adminUiStore, 'adminAuthOtpTimer')
      const [adminSellers, setAdminSellers] = useStoreField(adminUiStore, 'adminSellers');
      const [adminProducts, setAdminProducts] = useStoreField(adminUiStore, 'adminProducts');
      const [adminOrders, setAdminOrders] = useStoreField(adminUiStore, 'adminOrders');
      const [adminCoupons, setAdminCoupons] = useStoreField(adminUiStore, 'adminCoupons');
      const [adminTickets, setAdminTickets] = useStoreField(adminUiStore, 'adminTickets');
      const [adminBuyers, setAdminBuyers] = useStoreField(adminUiStore, 'adminBuyers');
      const defaultSeoConfig = () => ({
        globalIndex: true,
        indexHome: true,
        indexProducts: true,
        indexCategories: true,
        indexTags: false,
        indexBlog: true,
        indexBlogPosts: true,
        indexSellers: true,
        indexStatic: true,
        siteTitle: 'پیراهن مردانه | PIRAHANMARDANE.IR',
        siteTitleTemplate: '%s | پیراهن مردانه',
        metaDescription: 'فروشگاه اینترنتی پیراهن مردانه — رسمی، کروات، لینن و آستین کوتاه از فروشندگان معتبر',
        metaKeywords: 'پیراهن مردانه, خرید پیراهن, پیراهن رسمی, لینن',
        canonicalBase: 'https://pirahanemardane.ir',
        schemaOrgJson: '',
        schemaProductExtra: '',
        schemaArticleExtra: '',
        robotsTxtExtra: '',
        googleSiteVerification: '',
        bingSiteVerification: '',
        yandexVerification: '',
        yahooVerification: '',
        baiduVerification: '',
        duckduckVerification: '',
        customMetaVerifications: '',
        gtmId: '',
        gaId: '',
        googleSearchConsoleUrl: 'https://search.google.com/search-console',
        bingWebmasterUrl: 'https://www.bing.com/webmasters',
        yandexWebmasterUrl: 'https://webmaster.yandex.com',
        sitemapIncludeProducts: true,
        sitemapIncludeCategories: true,
        sitemapIncludeBlog: true,
        sitemapIncludeStatic: true,
        sitemapIncludeSellers: true,
        noindexWhenGlobalOff: true,
        llmsTxtExtra: '',
        llmsEnabled: true,
        indexNowKey: '',
        indexNowEnabled: false,
        imageSeoAutoAlt: true,
        imageSeoAltTemplate: '{name} | {brand} | پیراهن مردانه',
        customSchemas: [],
        // فاز D
        localSeoEnabled: false,
        localBusinessName: 'پیراهن مردانه',
        localPhone: '021-3456789',
        localEmail: 'info@pirahanemardane.ir',
        localPriceRange: '$$',
        localLocations: [
          {
            id: 'loc-1',
            name: 'فروشگاه مرکزی تهران',
            address: 'تهران، خیابان ولیعصر',
            city: 'تهران',
            postalCode: '1234567890',
            phone: '021-3456789',
            lat: '35.6892',
            lng: '51.3890',
            hours: 'شنبه تا پنجشنبه ۹–۱۸',
            mapsUrl: '',
          },
        ],
        newsSitemapEnabled: false,
        videoSitemapEnabled: false,
        brandWatchEnabled: true,
        brandNames: ['پیراهن مردانه', 'PIRAHANMARDANE'],
        brandMentions: [],
        rankKeywords: [],
      });

      const [adminSettings, setAdminSettings] = useStoreField(adminUiStore, 'adminSettings');
      // روش‌های ارسال — فقط ادمین تعریف می‌کند؛ فروشنده از بین آن‌ها انتخاب می‌کند
      const defaultShippingMethods = () => [
        {
          id: 'snapbox',
          name: 'اسنپ‌باکس',
          priceMode: 'dynamic_cod',
          baseCost: 0,
          apiProvider: 'snapbox',
          apiKey: '',
          apiEndpoint: '',
          apiEnabled: false,
          enabled: true,
          eta: 'همان‌روز / روز بعد',
          note: 'قیمت داینامیک است. مبلغ نمایش‌داده‌شده تقریبی همین لحظه است؛ فروشنده هنگام ارسال تماس می‌گیرد و هزینه نهایی را اعلام می‌کند. در صورت تأیید، ارسال انجام و هزینه در مقصد توسط خریدار پرداخت می‌شود. در غیر این صورت خریدار موظف است پیک مورد نظر خود را از مبدأ بگیرد.',
        },
        {
          id: 'aloopeyk',
          name: 'الوپیک',
          priceMode: 'dynamic_cod',
          baseCost: 0,
          apiProvider: 'aloopeyk',
          apiKey: '',
          apiEndpoint: '',
          apiEnabled: false,
          enabled: true,
          eta: 'همان‌روز',
          note: 'قیمت داینامیک است. مبلغ نمایش‌داده‌شده تقریبی همین لحظه است؛ فروشنده هنگام ارسال تماس می‌گیرد و هزینه نهایی را اعلام می‌کند. در صورت تأیید، ارسال انجام و هزینه در مقصد توسط خریدار پرداخت می‌شود. در غیر این صورت خریدار موظف است پیک مورد نظر خود را از مبدأ بگیرد.',
        },
        {
          id: 'tipax',
          name: 'تیپاکس',
          priceMode: 'fixed',
          baseCost: 65000,
          apiProvider: 'tipax',
          apiKey: '',
          apiEndpoint: '',
          apiEnabled: false,
          enabled: true,
          eta: '۱ تا ۳ روز کاری',
          note: '',
        },
        {
          id: 'mahax',
          name: 'ماهکس',
          priceMode: 'fixed',
          baseCost: 55000,
          apiProvider: 'mahax',
          apiKey: '',
          apiEndpoint: '',
          apiEnabled: false,
          enabled: true,
          eta: '۱ تا ۳ روز کاری',
          note: '',
        },
        {
          id: 'post',
          name: 'پست',
          priceMode: 'fixed',
          baseCost: 45000,
          apiProvider: 'post',
          apiKey: '',
          apiEndpoint: '',
          apiEnabled: false,
          enabled: true,
          eta: '۲ تا ۴ روز کاری',
          note: '',
        },
      ];
      const [adminShippingMethods, setAdminShippingMethods] = useStoreField(adminUiStore, 'adminShippingMethods');
      const saveAdminShippingMethods = (next) => {
        setAdminShippingMethods(next);
        try { localStorage.setItem('adminShippingMethods', JSON.stringify(next)); } catch (_) {}
        try {
          const items = (Array.isArray(next) ? next : []).map((m, i) => ({
            code: String(m.code || m.id || `ship-${i}`),
            title: m.title || m.name || 'ارسال',
            price: Math.max(0, parseInt(m.baseCost ?? m.price, 10) || 0),
            eta: m.eta || '',
            enabled: m.enabled !== false,
            sort_order: i,
          }));
          fetch('/api/shipping-methods', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ items }),
          }).catch(() => {});
        } catch (_) {}
      };
      /* TEMP / پیش‌فرض: روش‌های ارسال فرضی برای تست خرید */
      useEffect(() => {
        let cancelled = false;
        (async () => {
          try {
            const fromApi = await hydrateShippingMethodsFromApi();
            if (cancelled || fromApi) return;
          } catch (_) {}
          let fromLs = null;
          try {
            const raw = localStorage.getItem('adminShippingMethods');
            if (raw) fromLs = JSON.parse(raw);
          } catch (_) {}
          const empty = (v) => !v || !Array.isArray(v) || v.length === 0;
          if (cancelled) return;
          if (empty(adminShippingMethods) && empty(fromLs)) {
            const list = defaultShippingMethods();
            setAdminShippingMethods(list);
            try { localStorage.setItem('adminShippingMethods', JSON.stringify(list)); } catch (_) {}
          } else if (empty(adminShippingMethods) && !empty(fromLs)) {
            setAdminShippingMethods(fromLs);
          }
        })();
        return () => { cancelled = true; };
      }, []);
      const [shippingMethodFormOpen, setShippingMethodFormOpen] = useStoreField(formsStore, 'shippingMethodFormOpen')
      const [shippingMethodForm, setShippingMethodForm] = useStoreField(formsStore, 'shippingMethodForm')
      const blankShippingMethod = () => ({
        id: 'ship-' + Date.now(),
        name: '',
        priceMode: 'fixed',
        baseCost: 0,
        eta: '۲ تا ۴ روز کاری',
        apiKey: '',
        apiEndpoint: '',
        apiEnabled: false,
        note: '',
        enabled: true,
        isNew: true,
      });
      const openNewShippingMethod = () => {
        setShippingMethodForm(blankShippingMethod());
        setShippingMethodFormOpen(true);
      };
      const saveShippingMethodForm = () => {
        const f = shippingMethodForm;
        if (!f) return;
        const name = String(f.name || '').trim();
        if (!name) {
          showToast({ message: 'نام روش ارسال الزامی است', variant: 'error', duration: 4000, position: 'top-center' });
          return;
        }
        const payload = {
          ...f,
          name,
          baseCost: Number(f.baseCost) || 0,
          isNew: undefined,
        };
        delete payload.isNew;
        const list = adminShippingMethods || [];
        const exists = list.some((x) => x.id === payload.id);
        if (exists) {
          saveAdminShippingMethods(list.map((x) => (x.id === payload.id ? { ...x, ...payload } : x)));
        } else {
          saveAdminShippingMethods([...list, payload]);
        }
        setShippingMethodFormOpen(false);
        setShippingMethodForm(null);
        showToast({ message: exists ? 'روش ارسال به‌روز شد' : 'روش ارسال جدید اضافه شد', variant: 'success', duration: 3500, position: 'top-center' });
      };
      const [adminSellerFilter, setAdminSellerFilter] = useStoreField(adminUiStore, 'adminSellerFilter')
      const [adminSellerSearch, setAdminSellerSearch] = useStoreField(adminUiStore, 'adminSellerSearch')
      const [adminSellerDetailId, setAdminSellerDetailId] = useStoreField(adminUiStore, 'adminSellerDetailId')
      const [adminProductFilter, setAdminProductFilter] = useStoreField(adminUiStore, 'adminProductFilter')
      const [adminProductSearch, setAdminProductSearch] = useStoreField(adminUiStore, 'adminProductSearch')
      const [adminProductDetailId, setAdminProductDetailId] = useStoreField(adminUiStore, 'adminProductDetailId')
      const [adminOrderFilter, setAdminOrderFilter] = useStoreField(adminUiStore, 'adminOrderFilter')
      const [adminOrderSearch, setAdminOrderSearch] = useStoreField(adminUiStore, 'adminOrderSearch')
      const [adminOrderDetailId, setAdminOrderDetailId] = useStoreField(adminUiStore, 'adminOrderDetailId')
      const [adminOrderNote, setAdminOrderNote] = useStoreField(adminUiStore, 'adminOrderNote')
      const [adminCouponFormOpen, setAdminCouponFormOpen] = useStoreField(adminUiStore, 'adminCouponFormOpen')
      const [editingCouponId, setEditingCouponId] = useStoreField(shopUiStore, 'editingCouponId');
      const [adminCouponForm, setAdminCouponForm] = useStoreField(adminUiStore, 'adminCouponForm')
      const [adminTicketFilter, setAdminTicketFilter] = useStoreField(adminUiStore, 'adminTicketFilter')
      const [adminTicketDetailId, setAdminTicketDetailId] = useStoreField(adminUiStore, 'adminTicketDetailId')
      const [adminTicketReply, setAdminTicketReply] = useStoreField(adminUiStore, 'adminTicketReply')
      const [adminBuyerSearch, setAdminBuyerSearch] = useStoreField(adminUiStore, 'adminBuyerSearch')
      const [adminBuyerDetailId, setAdminBuyerDetailId] = useStoreField(adminUiStore, 'adminBuyerDetailId')
      const [adminRejectReason, setAdminRejectReason] = useStoreField(adminUiStore, 'adminRejectReason')
      const [adminLoading, setAdminLoading] = useStoreField(adminUiStore, 'adminLoading')
      const [plpQuery, setPlpQuery] = useStoreField(commerceUiStore, 'plpQuery')
      const [plpCats, setPlpCats] = useStoreField(commerceUiStore, 'plpCats')
      const [plpColors, setPlpColors] = useStoreField(commerceUiStore, 'plpColors')
      const [plpSizes, setPlpSizes] = useStoreField(commerceUiStore, 'plpSizes')
      const [plpSort, setPlpSort] = useStoreField(commerceUiStore, 'plpSort')

/* Deep link فروشگاه/فیلتر — بدون سرور: &sort=&q= */
      useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
          const sp = new URLSearchParams(window.location.search);
          const view = sp.get('view');
          if (view === 'shop' || view === 'plp') {
            setShowPLP(true);
            const sort = sp.get('sort');
            if (sort) setPlpSort(sort);
            const q = sp.get('q');
            if (q) setSearchQuery(q);
          }
        } catch (_) {}
      }, []);

      useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
          const url = new URL(window.location.href);
          if (showPLP) {
            /* view query removed — clean FA path */
            if (plpSort) url.searchParams.set('sort', plpSort);
            else url.searchParams.delete('sort');
            const q = (searchQuery || '').trim();
            if (q) url.searchParams.set('q', q);
            else url.searchParams.delete('q');
            window.history.replaceState({}, '', url.pathname + url.search + url.hash);
            setPlpState({ open: true, sort: plpSort || '', q: searchQuery || '' });
          }
        } catch (_) {}
      }, [showPLP, plpSort, searchQuery]);
      const [plpPriceMin, setPlpPriceMin] = useStoreField(commerceUiStore, 'plpPriceMin')
      const [plpPriceMax, setPlpPriceMax] = useStoreField(commerceUiStore, 'plpPriceMax')
      const [plpSellers, setPlpSellers] = useStoreField(commerceUiStore, 'plpSellers');
      const [plpFabrics, setPlpFabrics] = useStoreField(commerceUiStore, 'plpFabrics');
      const [plpDiscountOnly, setPlpDiscountOnly] = useStoreField(commerceUiStore, 'plpDiscountOnly')
      const [plpMinDiscount, setPlpMinDiscount] = useStoreField(commerceUiStore, 'plpMinDiscount')
      const [plpInStockOnly, setPlpInStockOnly] = useStoreField(commerceUiStore, 'plpInStockOnly')
      const [plpFastShipOnly, setPlpFastShipOnly] = useStoreField(commerceUiStore, 'plpFastShipOnly')
      const [plpCities, setPlpCities] = useStoreField(commerceUiStore, 'plpCities')
      const [plpCityInput, setPlpCityInput] = useStoreField(commerceUiStore, 'plpCityInput')
      const [plpCityOpen, setPlpCityOpen] = useStoreField(modalUiStore, 'plpCityOpen')
      const [plpView, setPlpView] = useStoreField(commerceUiStore, 'plpView');
      const [plpVisible, setPlpVisible] = useStoreField(commerceUiStore, 'plpVisible')
      const [plpFilterOpen, setPlpFilterOpen] = useStoreField(modalUiStore, 'plpFilterOpen')
      const [plpSortOpen, setPlpSortOpen] = useStoreField(modalUiStore, 'plpSortOpen')
      const [plpFilterTab, setPlpFilterTab] = useStoreField(commerceUiStore, 'plpFilterTab');
      const [plpSkeleton, setPlpSkeleton] = useStoreField(commerceUiStore, 'plpSkeleton')
      const [plpSidebarOpen, setPlpSidebarOpen] = useStoreField(modalUiStore, 'plpSidebarOpen');
      const plpSentinelRef = useRef(null);
      const [sellerCat, setSellerCat] = useStoreField(sellerUiStore, 'sellerCat')
      const [sellerSort, setSellerSort] = useStoreField(sellerUiStore, 'sellerSort')
      const [sellerDiscountOnly, setSellerDiscountOnly] = useStoreField(sellerUiStore, 'sellerDiscountOnly')
      const [sellerCatMenuOpen, setSellerCatMenuOpen] = useStoreField(sellerUiStore, 'sellerCatMenuOpen')
      const [sellerSortMenuOpen, setSellerSortMenuOpen] = useStoreField(sellerUiStore, 'sellerSortMenuOpen')
      const [sellerFollowed, setSellerFollowed] = useStoreField(sellerUiStore, 'sellerFollowed');
      const toggleSellerFollow = async (sellerId) => {
        if (!sellerId) return;
        const sid = String(sellerId);
        const prevMap = sellerFollowed && typeof sellerFollowed === 'object' && !Array.isArray(sellerFollowed)
          ? sellerFollowed
          : {};
        const was = !!prevMap[sid];

        // optimistic UI
        setSellerFollowed((prev) => {
          const base = prev && typeof prev === 'object' && !Array.isArray(prev) ? { ...prev } : {};
          if (was) delete base[sid];
          else base[sid] = true;
          return base;
        });

        try {
          if (!user) {
            // برگردان + باز کردن ورود
            setSellerFollowed((prev) => {
              const base = prev && typeof prev === 'object' && !Array.isArray(prev) ? { ...prev } : {};
              if (was) base[sid] = true;
              else delete base[sid];
              return base;
            });
            try {
              showToast({ message: 'برای دنبال کردن فروشنده وارد شوید', variant: 'default', duration: 3000, position: 'top-center' });
            } catch (_) {}
            try {
              if (typeof setRoleGateOpen === 'function') setRoleGateOpen(true);
              else if (typeof openAuth === 'function') openAuth();
            } catch (_) {}
            return;
          }

          const res = await fetch('/api/seller-follows', {
            method: was ? 'DELETE' : 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ seller_id: sid }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || data?.ok === false) {
            // rollback
            setSellerFollowed((prev) => {
              const base = prev && typeof prev === 'object' && !Array.isArray(prev) ? { ...prev } : {};
              if (was) base[sid] = true;
              else delete base[sid];
              return base;
            });
            try {
              showToast({
                message: data?.error || 'خطا در ذخیره دنبال کردن',
                variant: 'error',
                duration: 4000,
                position: 'top-center',
              });
            } catch (_) {}
            return;
          }
          try {
            showToast({
              message: was ? 'دنبال کردن لغو شد' : 'فروشنده دنبال شد',
              variant: 'success',
              position: 'top-center',
              duration: 2500,
            });
          } catch (_) {}
        } catch (e) {
          setSellerFollowed((prev) => {
            const base = prev && typeof prev === 'object' && !Array.isArray(prev) ? { ...prev } : {};
            if (was) base[sid] = true;
            else delete base[sid];
            return base;
          });
          try {
            showToast({ message: 'خطای شبکه', variant: 'error', duration: 3000, position: 'top-center' });
          } catch (_) {}
        }
      };

      // بارگذاری لیست دنبال‌شده از سرور بعد از لاگین
      useEffect(() => {
        let cancelled = false;
        if (!user) {
          try { setSellerFollowed({}); } catch (_) {}
          return undefined;
        }
        (async () => {
          try {
            const res = await fetch('/api/seller-follows', {
              credentials: 'include',
              cache: 'no-store',
              headers: { Accept: 'application/json' },
            });
            const data = await res.json().catch(() => null);
            if (cancelled || !data?.ok) return;
            const map = {};
            for (const id of data.ids || []) {
              if (id) map[String(id)] = true;
            }
            setSellerFollowed(map);
          } catch (_) {}
        })();
        return () => { cancelled = true; };
      }, [user?.id]);
      const [sellerStickyBar, setSellerStickyBar] = useStoreField(sellerUiStore, 'sellerStickyBar')
      const [sellerListMinProducts, setSellerListMinProducts] = useStoreField(sellerUiStore, 'sellerListMinProducts');
      const [topSellersTab, setTopSellersTab] = useStoreField(shopUiStore, 'topSellersTab');
      const [topSellers, setTopSellers] = useState([]);

      useEffect(() => {
        let cancelled = false;
        const load = async () => {
          try {
            const res = await fetch('/api/catalog/sellers', {
              cache: 'no-store',
              headers: { Accept: 'application/json' },
            });
            const data = await res.json().catch(() => null);
            if (cancelled || !data || !data.ok) return;
            const mapped = (data.sellers || []).map((s) => {
              const products = Number(
                s.active_products_count != null ? s.active_products_count : s.products_count
              ) || 0;
              return {
                id: s.id,
                name: s.shop_name || s.shopName || 'فروشگاه',
                shopName: s.shop_name || s.shopName || 'فروشگاه',
                slug: s.slug || '',
                desc: s.about || '',
                about: s.about || '',
                city: s.city || '',
                image: s.logo_url || s.logo || '/logo.webp',
                logo: s.logo_url || s.logo || '',
                banner: s.banner_url || s.logo_url || '/logo.webp',
                rating: s.rating != null ? Number(s.rating) : 0,
                ratingCount: s.rating_count != null ? Number(s.rating_count) : 0,
                products: products,
                productsSafe: products,
                productsCount: products,
                joinDate: s.created_at ? String(s.created_at).slice(0, 10) : '',
                badges: [],
                responseTime: '',
                lastActive: '',
                followers: null,
                status: s.status || 'approved',
              };
            });
            setTopSellers(mapped);
          } catch (e) {}
        };
        load();
        const iv = setInterval(load, 60000);
        return () => {
          cancelled = true;
          clearInterval(iv);
        };
      }, []);

      const [sellerBannerIdx, setSellerBannerIdx] = useStoreField(sellerUiStore, 'sellerBannerIdx')
      const [sellerFaqOpen, setSellerFaqOpen] = useStoreField(sellerUiStore, 'sellerFaqOpen')
      const [sellerShareToast, setSellerShareToast] = useStoreField(sellerUiStore, 'sellerShareToast')
      const [sellerReportOpen, setSellerReportOpen] = useStoreField(sellerUiStore, 'sellerReportOpen')
      const [sellerReportSent, setSellerReportSent] = useStoreField(sellerUiStore, 'sellerReportSent')
      // فیلتر صفحه همه فروشندگان
      const IRAN_CITIES = [
        'تهران', 'مشهد', 'اصفهان', 'کرج', 'شیراز', 'تبریز', 'قم', 'اهواز', 'کرمانشاه', 'ارومیه',
        'رشت', 'زاهدان', 'همدان', 'کرمان', 'یزد', 'اردبیل', 'بندرعباس', 'اراک', 'اسلامشهر', 'زنجان',
        'سنندج', 'قزوین', 'خرم‌آباد', 'گرگان', 'ساری', 'شهریار', 'قدس', 'کاشان', 'ملارد', 'دزفول',
        'بروجرد', 'نیشابور', 'سبزوار', 'نجف‌آباد', 'آمل', 'بابل', 'ورامین', 'آبادان', 'خوی', 'مراغه',
        'ساوه', 'بوشهر', 'قائم‌شهر', 'بیرجند', 'ایلام', 'بجنورد', 'بندر بوشهر', 'شاهرود', 'لاهیجان', 'تربت حیدریه',
        'مرودشت', 'زابل', 'گنبد کاووس', 'شوشتر', 'بانه', 'جیرفت', 'ایذه', 'شهرکرد', 'سیرجان', 'ملایر',
        'مهاباد', 'کامیاران', 'نهاوند', 'بهبهان', 'رفسنجان', 'فسا', 'سمنان', 'شوش', 'اندیمشک', 'بندر انزلی',
        'میدان‌میاندوآب', 'میاندوآب', 'بوکان', 'پارس‌آباد', 'کاشمر', 'تربت جام', 'چابهار', 'سبزوار', 'لار',
        'گچساران', 'دورود', 'کوهدشت', 'بندر ماهشهر', 'نورآباد', 'فیروزآباد', 'اهر', 'نقده', 'سقز', 'تویسرکان',
      ];
      const [sellerListCities, setSellerListCities] = useStoreField(sellerUiStore, 'sellerListCities');
      const [sellerListQuery, setSellerListQuery] = useStoreField(sellerUiStore, 'sellerListQuery')
      const [sellerListSort, setSellerListSort] = useStoreField(sellerUiStore, 'sellerListSort');
      const [sellerListMinRating, setSellerListMinRating] = useStoreField(sellerUiStore, 'sellerListMinRating');
      const [sellerListMaxResponse, setSellerListMaxResponse] = useStoreField(sellerUiStore, 'sellerListMaxResponse');
      const [sellerCityInput, setSellerCityInput] = useStoreField(sellerUiStore, 'sellerCityInput')
      const [sellerSearchOpen, setSellerSearchOpen] = useStoreField(sellerUiStore, 'sellerSearchOpen')
      const [sellerCityOpen, setSellerCityOpen] = useStoreField(sellerUiStore, 'sellerCityOpen')
      const [sellerFilterSheetOpen, setSellerFilterSheetOpen] = useStoreField(sellerUiStore, 'sellerFilterSheetOpen')
      const sellerSortOptions = [
        { id: 'smart', label: 'پیشنهادی' },
        { id: 'rating', label: 'بیشترین امتیاز' },
        { id: 'products', label: 'بیشترین محصول' },
        { id: 'price-asc', label: 'ارزان‌ترین' },
        { id: 'price-desc', label: 'گران‌ترین' },
        { id: 'discount', label: 'پرتخفیف' },
        { id: 'response', label: 'سریع‌ترین پاسخ' },
      ];
      useEffect(() => {
        if (sellerFilterSheetOpen) {
          document.body.style.overflow = 'hidden';
        }
        return () => {
          if (sellerFilterSheetOpen) document.body.style.overflow = '';
        };
      }, [sellerFilterSheetOpen]);
      const toggleSellerListCity = (city) => {
        setSellerListCities(prev => {
          const list = Array.isArray(prev) ? prev : [];
          return list.includes(city) ? list.filter(c => c !== city) : [...list, city];
        });
      };
      const clearSellerListFilters = () => {
        setSellerListCities([]);
        setSellerListQuery('');
        setSellerListSort('smart');
        setSellerListMinRating(0);
        setSellerListMaxResponse(0);
        setSellerListMinProducts(0);
        setSellerCityInput('');
      };
      // استخراج عدد ساعت از responseTime مثل «زیر ۲ ساعت»
      const parseResponseHours = (rt) => {
        if (!rt) return 99;
        const m = String(rt).match(/(\d+)/);
        return m ? Number(m[1]) : 99;
      };
      // امتیاز هوشمند: rating × log10(ratingCount+1)
      const smartScore = (s) => (Number(s.rating) || 0) * Math.log10((Number(s.ratingCount) || 0) + 1) + Math.log10((Number(s.products) || 0) + 1) * 0.5;
      // آمار قیمت/تخفیف هر فروشنده از محصولات
      const sellerPriceMap = (() => {
        const map = {};
        products.forEach(p => {
          const id = p.seller?.id || 'own';
          if (!map[id]) map[id] = { prices: [], discounts: [] };
          if (typeof p.price === 'number') map[id].prices.push(p.price);
          if (typeof p.discount === 'number') map[id].discounts.push(p.discount);
        });
        const out = {};
        Object.keys(map).forEach(id => {
          const prices = map[id].prices;
          const discounts = map[id].discounts;
          out[id] = {
            minPrice: prices.length ? Math.min(...prices) : 999999999,
            maxDiscount: discounts.length ? Math.max(...discounts) : 0,
          };
        });
        return out;
      })();
      const getSellerMinPrice = (s) => sellerPriceMap[s.id]?.minPrice ?? 999999999;
      const getSellerMaxDiscount = (s) => sellerPriceMap[s.id]?.maxDiscount ?? 0;
      const sellerCitiesSafe = Array.isArray(sellerListCities) ? sellerListCities : [];
      const sellerQuerySafe = typeof sellerListQuery === 'string' ? sellerListQuery : '';
      const sellerMinRatingSafe = Number(sellerListMinRating) || 0;
      const sellerMaxResponseSafe = Number(sellerListMaxResponse) || 0;
      const sellerMinProductsSafe = Number(sellerListMinProducts) || 0;
      const filteredSellersList = (topSellers || [])
        .filter(s => {
          if (sellerCitiesSafe.length > 0 && !sellerCitiesSafe.includes(s.city)) return false;
          if (sellerMinRatingSafe > 0 && (Number(s.rating) || 0) < sellerMinRatingSafe) return false;
          if (sellerMaxResponseSafe > 0 && parseResponseHours(s.responseTime) > sellerMaxResponseSafe) return false;
          if (sellerMinProductsSafe > 0 && (Number(s.products) || 0) < sellerMinProductsSafe) return false;
          if (sellerQuerySafe.trim()) {
            const q = sellerQuerySafe.trim().toLowerCase();
            const hay = `${s.name || ''} ${s.desc || ''} ${s.city || ''} ${(s.badges || []).join(' ')}`.toLowerCase();
            if (!hay.includes(q)) return false;
          }
          return true;
        })
        .sort((a, b) => {
          if (sellerListSort === 'products') return (b.products || 0) - (a.products || 0);
          if (sellerListSort === 'price-asc') return getSellerMinPrice(a) - getSellerMinPrice(b);
          if (sellerListSort === 'price-desc') return getSellerMinPrice(b) - getSellerMinPrice(a);
          if (sellerListSort === 'discount') return getSellerMaxDiscount(b) - getSellerMaxDiscount(a);
          if (sellerListSort === 'response') return parseResponseHours(a.responseTime) - parseResponseHours(b.responseTime);
          if (sellerListSort === 'rating') return (b.rating || 0) - (a.rating || 0);
          return smartScore(b) - smartScore(a); // smart default
        });
      const isSellerListFilterActive = sellerCitiesSafe.length > 0 || !!sellerQuerySafe.trim() || sellerMinRatingSafe > 0 || sellerMaxResponseSafe > 0 || sellerMinProductsSafe > 0;
      const sellerFilterCount = sellerCitiesSafe.length + (sellerMinRatingSafe > 0 ? 1 : 0) + (sellerMaxResponseSafe > 0 ? 1 : 0) + (sellerMinProductsSafe > 0 ? 1 : 0);
      const sellerNameSuggestions = sellerListQuery.trim()
        ? topSellers.filter(s => {
            const q = sellerListQuery.trim().toLowerCase();
            return s.name.toLowerCase().includes(q) || (s.desc || '').toLowerCase().includes(q) || (s.city || '').includes(q);
          }).slice(0, 8)
        : [];
      const citySuggestions = sellerCityInput.trim()
        ? IRAN_CITIES.filter(c => c.includes(sellerCityInput.trim()) || c.replace(/‌/g, '').includes(sellerCityInput.trim().replace(/‌/g, ''))).slice(0, 10)
        : IRAN_CITIES.slice(0, 10);
      // نزدیک‌ترین شهرها برای حالت خالی
      const popularCities = ['تهران', 'مشهد', 'اصفهان', 'شیراز', 'تبریز', 'کرج'];
      const topSellersRanked = (() => {
        const list = [...topSellers];
        if (topSellersTab === 'sales') return list.sort((a, b) => (b.products || 0) - (a.products || 0)).slice(0, 20);
        if (topSellersTab === 'new') return list.sort((a, b) => String(b.joinDate || '').localeCompare(String(a.joinDate || ''), 'fa')).slice(0, 20);
        return list.sort((a, b) => smartScore(b) - smartScore(a)).slice(0, 20);
      })();
      


      const toggleSearchCategory = (c) => {
        if (c === 'همه') { setSearchCategories([]); return; }
        setSearchCategories(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
      };
      const toggleSearchColor = (c) => {
        setSearchColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
      };
      const toggleSearchSize = (s) => {
        setSearchSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
      };
      const clearAllSearchFilters = () => {
        setSearchQuery('');
        setSearchCategories([]);
        setSearchColors([]);
        setSearchSizes([]);
      };

      // Close filter panel when clicking outside (desktop dropdown + mobile sheet)
      useEffect(() => {
        if (!catOpen) return;
        const onPointerDown = (e) => {
          if (e.target.closest && e.target.closest('[data-filter-panel="true"]')) return;
          if (e.target.closest && e.target.closest('[data-filter-toggle="true"]')) return;
          setCatOpen(false);
        };
        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
      }, [catOpen]);

      const [showTop, setShowTop] = useStoreField(shopUiStore, 'showTop');
      const [scrolled, setScrolled] = useStoreField(shopUiStore, 'scrolled');
      const [headerRevealedAfterHero, setHeaderRevealedAfterHero] = useStoreField(shopUiStore, 'headerRevealedAfterHero');
      const [carouselIndex, setCarouselIndex] = useStoreField(shopUiStore, 'carouselIndex');
      const [newestTab, setNewestTab] = useStoreField(shopUiStore, 'newestTab');
      const headerRef = useRef(null);
      // site-header-spacer-sync — همیشه با ارتفاع واقعی هدر؛ در خانهٔ قبل از reveal صفر
      const isHomeSurface =
        !activeSellerId && !showSellersList && !showPLP && !showTaxonomyHub && !pdpProduct &&
        !showCartPage && !showCheckout && !showWishlistPage && !showRecentPage && !showComparePage &&
        !showProfilePage && !showSellerPanel && !showAdminPanel && !staticPage;

      useEffect(() => {
        const apply = () => {
          const header = headerRef.current;
          const el = document.querySelector(".site-header-spacer");
          if (!header) return;
          try {
            const h = Math.ceil(header.getBoundingClientRect().height) || 0;
            if (h > 0) {
              document.documentElement.style.setProperty("--site-header-h", h + "px");
            }
            if (!el) return;
            const cs = window.getComputedStyle(header);
            const intentionallyHidden =
              isHomeSurface &&
              !headerRevealedAfterHero &&
              (cs.pointerEvents === "none" ||
                Number(cs.opacity) === 0 ||
                (typeof header.className === "string" && header.className.includes("-translate-y-full")));
            if (intentionallyHidden) {
              el.style.height = "0px";
              el.style.minHeight = "0px";
              return;
            }
            const useH = h > 0 ? h : 96;
            el.style.height = useH + "px";
            el.style.minHeight = useH + "px";
          } catch (_) {}
        };
        apply();
        let ro;
        if (typeof ResizeObserver !== "undefined" && headerRef.current) {
          ro = new ResizeObserver(apply);
          ro.observe(headerRef.current);
        }
        window.addEventListener("resize", apply);
        const t1 = setTimeout(apply, 50);
        const t2 = setTimeout(apply, 200);
        const t3 = setTimeout(apply, 500);
        return () => {
          if (ro) ro.disconnect();
          window.removeEventListener("resize", apply);
          clearTimeout(t1);
          clearTimeout(t2);
          clearTimeout(t3);
        };
      }, [
        isHomeSurface,
        headerRevealedAfterHero,
        showPLP,
        showSellerPanel,
        showAdminPanel,
        showCartPage,
        showCheckout,
        showWishlistPage,
        showProfilePage,
        showComparePage,
        showRecentPage,
        activeSellerId,
        showSellersList,
        showTaxonomyHub,
        pdpProduct,
        staticPage,
        mobileMenuOpen,
        megaOpen,
      ]);
      useEffect(() => {
        const el = headerRef.current;
        if (!el || typeof ResizeObserver === "undefined") return;
        const apply = () => {
          try {
            const h = Math.ceil(el.getBoundingClientRect().height);
            if (h > 0) document.documentElement.style.setProperty("--site-header-h", h + "px");
          } catch (_) {}
        };
        apply();
        const ro = new ResizeObserver(apply);
        ro.observe(el);
        return () => ro.disconnect();
      }, []);

      // اعمال کلاس dark + ذخیره فقط وقتی کاربر صریحاً light/dark انتخاب کرده
      // اگر theme در localStorage نباشد = auto (دنبال سیستم)
      useEffect(() => {
        document.documentElement.classList.toggle('dark', dark);
        try {
          const saved = localStorage.getItem('theme');
          // فقط وقتی قبلاً انتخاب صریح بوده، با state همگام کن (نه در اولین فریم SSR)
          if (saved === 'dark' || saved === 'light') {
            localStorage.setItem('theme', dark ? 'dark' : 'light');
          }
        } catch (_) {}
      }, [dark]);

      // دکمه تم: همیشه انتخاب صریح ذخیره می‌شود
      const toggleDarkMode = () => {
        const next = !dark;
        setDark(next);
        try {
          localStorage.setItem('theme', next ? 'dark' : 'light');
        } catch (_) {}
      };

      // اگر کاربر هنوز دستی انتخاب نکرده، با تغییر تم سیستم همگام شو
      useEffect(() => {
        let mq;
        try {
          mq = window.matchMedia('(prefers-color-scheme: dark)');
        } catch (_) {
          return undefined;
        }
        const onChange = (e) => {
          try {
            const saved = localStorage.getItem('theme');
            if (saved === 'dark' || saved === 'light') return; // انتخاب دستی اولویت دارد
            setDark(!!e.matches);
          } catch (_) {}
        };
        if (mq.addEventListener) mq.addEventListener('change', onChange);
        else if (mq.addListener) mq.addListener(onChange);
        return () => {
          if (mq.removeEventListener) mq.removeEventListener('change', onChange);
          else if (mq.removeListener) mq.removeListener(onChange);
        };
      }, [setDark]);

      useEffect(() => {
        let ticking = false;
        const onScroll = () => {
          if (ticking) return;
          ticking = true;
          requestAnimationFrame(() => {
            setShowTop(window.scrollY > 900);
            setScrolled(window.scrollY > 20);
            ticking = false;
          });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
      }, []);

      // GSAP — page scroll animations (lazy-loaded so LCP isn't blocked)
      useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
        let cancelled = false;

        const run = async () => {
          const { gsap, ScrollTrigger } = await loadGsap();
          if (cancelled) return;

        gsap.utils.toArray('.gsap-reveal').forEach((el) => {
          gsap.fromTo(el,
            { y: 50, opacity: 0 },
            {
              y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' }
            }
          );
        });

        // Product cards: no GSAP hide/show (instant carousel visibility)


        const cats = gsap.utils.toArray('.gsap-cat');
        if (cats.length) {
          gsap.fromTo(cats,
            { y: 30, opacity: 0, scale: 0.55 },
            {
              y: 0, opacity: 1, scale: 1, duration: 0.55, stagger: 0.07, ease: 'back.out(1.8)',
              scrollTrigger: { trigger: cats[0].parentElement, start: 'top 85%', toggleActions: 'play none none none' }
            }
          );
        }

        const feats = gsap.utils.toArray('.gsap-feature');
        if (feats.length) {
          gsap.fromTo(feats,
            { x: 36, opacity: 0 },
            {
              x: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out',
              scrollTrigger: { trigger: feats[0].parentElement, start: 'top 88%', toggleActions: 'play none none none' }
            }
          );
        }

        const banners = gsap.utils.toArray('.gsap-banner');
        if (banners.length) {
          gsap.fromTo(banners,
            { y: 45, opacity: 0, scale: 0.94 },
            {
              y: 0, opacity: 1, scale: 1, duration: 0.75, stagger: 0.15, ease: 'power3.out',
              scrollTrigger: { trigger: banners[0].parentElement, start: 'top 85%', toggleActions: 'play none none none' }
            }
          );
        }

        const statsEls = gsap.utils.toArray('.gsap-stat');
        if (statsEls.length) {
          gsap.fromTo(statsEls,
            { y: 40, opacity: 0 },
            {
              y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out',
              scrollTrigger: { trigger: statsEls[0].parentElement, start: 'top 85%', toggleActions: 'play none none none' }
            }
          );
        }

        const blogs = gsap.utils.toArray('.gsap-blog');
        if (blogs.length) {
          gsap.fromTo(blogs,
            { y: 45, opacity: 0 },
            {
              y: 0, opacity: 1, duration: 0.7, stagger: 0.14, ease: 'power3.out',
              scrollTrigger: { trigger: blogs[0].parentElement, start: 'top 85%', toggleActions: 'play none none none' }
            }
          );
        }

        // Newsletter: visible immediately (no delayed opacity animation)


        // هدر در خانه تا اسکرول اول مخفی است — انیمیشن ورود فقط وقتی هدر باید دیده شود
        const header = document.querySelector('header');
        if (header && window.scrollY > 20) {
          gsap.fromTo(header, { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' });
        }
        }; // end run

        void run();

        return () => {
          cancelled = true;
          loadGsap()
            .then(({ ScrollTrigger }) => {
              ScrollTrigger.getAll().forEach((st) => st.kill());
            })
            .catch(() => {});
        };
      }, []);

      useEffect(() => {
        if (!cartOpen) return undefined;
        let cancelled = false;
        loadGsap().then(({ gsap }) => {
          if (cancelled) return;
        const panel = document.querySelector('.cart-panel');
        const items = document.querySelectorAll('.cart-item-row');
        if (panel) {
          gsap.fromTo(panel, { x: '100%' }, { x: '0%', duration: 0.45, ease: 'power3.out' });
        }
        if (items.length) {
          gsap.fromTo(items, { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out', delay: 0.15 });
        }
        }).catch(() => {});
        return () => { cancelled = true; };
      }, [cartOpen]);

      // Mouse drag ONLY for true horizontal carousels (نه هر overflow-x-auto — فیلتر/سرچ/لیست‌های عمودی)
      useEffect(() => {
        let activeSlider = null;
        let startX = 0;
        let startY = 0;
        let scrollLeft = 0;
        let moved = false;
        let axis = null; // 'x' | 'y' | null

        // فقط کاروسل‌های واقعی — نه ردیف چیپ فیلتر و نه dropdown
        const isSlider = (el) =>
          el &&
          (el.classList?.contains('product-slider') ||
            el.classList?.contains('carousel-track') ||
            el.dataset?.dragScroll === 'x');

        const isVerticalScrollable = (el) => {
          if (!el || el === document.body || el === document.documentElement) return false;
          const style = window.getComputedStyle(el);
          const oy = style.overflowY;
          if (oy !== 'auto' && oy !== 'scroll' && oy !== 'overlay') return false;
          return el.scrollHeight > el.clientHeight + 2;
        };

        const findSlider = (target) => {
          let el = target;
          while (el && el !== document.body) {
            // اگر روی ناحیه اسکرول عمودی هستیم، درگ افقی را فعال نکن
            if (isVerticalScrollable(el) && !isSlider(el)) return null;
            if (isSlider(el)) return el;
            el = el.parentElement;
          }
          return null;
        };

        const onMouseDown = (e) => {
          if (e.button !== 0) return;
          const tag = (e.target.tagName || '').toLowerCase();
          if (tag === 'input' || tag === 'select' || tag === 'textarea' || tag === 'option') return;
          if (e.target.closest?.('input, select, textarea, option, [data-no-drag]')) return;

          const slider = findSlider(e.target);
          if (!slider) return;
          if (slider.scrollWidth <= slider.clientWidth + 2) return;

          activeSlider = slider;
          moved = false;
          axis = null;
          startX = e.pageX;
          startY = e.pageY;
          scrollLeft = slider.scrollLeft;
          slider.classList.add('cursor-grabbing');
          slider.style.userSelect = 'none';
          slider.style.scrollSnapType = 'none';
        };

        const onMouseMove = (e) => {
          if (!activeSlider) return;
          const dx = e.pageX - startX;
          const dy = e.pageY - startY;
          // تا وقتی محور مشخص نشده، اگر حرکت عمدتاً عمودی بود درگ را رها کن تا اسکرول صفحه/فیلتر کار کند
          if (!axis) {
            if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
            if (Math.abs(dy) > Math.abs(dx)) {
              // vertical intent — cancel horizontal drag
              activeSlider.classList.remove('cursor-grabbing');
              activeSlider.style.userSelect = '';
              activeSlider.style.scrollSnapType = '';
              activeSlider = null;
              axis = null;
              return;
            }
            axis = 'x';
          }
          if (axis !== 'x') return;
          e.preventDefault();
          const walk = dx * 1.75;
          if (Math.abs(walk) > 5) moved = true;
          activeSlider.scrollLeft = scrollLeft - walk;
        };

        const releaseDrag = () => {
          if (activeSlider) {
            activeSlider.classList.remove('cursor-grabbing');
            activeSlider.style.userSelect = '';
            const s = activeSlider;
            setTimeout(() => { if (s) s.style.scrollSnapType = ''; }, 40);
          }
          activeSlider = null;
          axis = null;
        };

        const onMouseUp = () => { releaseDrag(); };
        const onWheel = () => { if (activeSlider) releaseDrag(); };

        const onClickCapture = (e) => {
          if (moved) {
            e.preventDefault();
            e.stopPropagation();
            moved = false;
          }
        };

        const onDragStart = (e) => {
          if (findSlider(e.target)) e.preventDefault();
        };

        document.addEventListener('mousedown', onMouseDown, true);
        document.addEventListener('mousemove', onMouseMove, { passive: false });
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('mouseleave', onMouseUp);
        document.addEventListener('wheel', onWheel, { passive: true });
        document.addEventListener('click', onClickCapture, true);
        document.addEventListener('dragstart', onDragStart, true);

        document.querySelectorAll('.product-slider, .carousel-track, [data-drag-scroll="x"]').forEach((el) => {
          el.classList.add('cursor-grab');
          el.style.touchAction = 'pan-x pan-y';
          el.style.WebkitOverflowScrolling = 'touch';
          el.style.overscrollBehaviorX = 'contain';
        });

        return () => {
          document.removeEventListener('mousedown', onMouseDown, true);
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          document.removeEventListener('mouseleave', onMouseUp);
          document.removeEventListener('wheel', onWheel);
          document.removeEventListener('click', onClickCapture, true);
          document.removeEventListener('dragstart', onDragStart, true);
        };
      }, []);

      const cartCount = (Array.isArray(cart) ? cart : []).reduce((s, i) => s + (Number(i?.qty) || 0), 0);
      const cartSubtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
      const cartListTotal = cart.reduce((s, i) => s + (i.oldPrice ? Math.round(i.oldPrice.replace?.(/[^\d]/g, '') ? Number(String(i.oldPrice).replace(/[^\d]/g, '')) : (i.price / (1 - (i.discount || 0) / 100))) : i.price) * i.qty, 0);
      // Savings from product discounts (list vs sale)
      const cartProductSavings = cart.reduce((s, i) => {
        if (!i.discount && !i.oldPrice) return s;
        const list = i.oldPrice
          ? (typeof i.oldPrice === 'number' ? i.oldPrice : Number(String(i.oldPrice).replace(/[^\d]/g, '')) || 0)
          : Math.round(i.price / (1 - (i.discount || 0) / 100));
        return s + Math.max(0, list - i.price) * i.qty;
      }, 0);
      const couponDiscount = couponApplied
        ? (couponApplied.percent ? Math.round(cartSubtotal * couponApplied.percent / 100) : (couponApplied.amount || 0))
        : 0;
      const cartAfterCoupon = Math.max(0, cartSubtotal - couponDiscount);
      // مالیات بر ارزش افزوده ۹٪ (قابل تغییر بعداً)
      const TAX_RATE = 0.09;
      const cartTax = Math.round(cartAfterCoupon * TAX_RATE);
      const cartTotal = cartAfterCoupon + cartTax;
      const FREE_SHIP_THRESHOLD = 2000000;
      const freeShipRemain = Math.max(0, FREE_SHIP_THRESHOLD - cartSubtotal);
      const freeShipProgress = Math.min(100, Math.round((cartSubtotal / FREE_SHIP_THRESHOLD) * 100));
      const cartUpsell = products.filter(p => !cart.some(c => c.id === p.id)).slice(0, 4);

      /** شگفت‌انگیز فقط با درخواست فروشنده + تأیید ادمین (amazing + dealEndsAt ≤۷روز). فروشنده مستقیم اضافه نمی‌کند. */
      /** ارسال سریع: محصول + مجوز فروشنده (پیش‌فرض فعال؛ ادمین می‌تواند غیرفعال کند) */
      const isSellerFastShipAllowed = (sellerId) => {
        try {
          const id = sellerId || 'own';
          const fromAdmin = (adminSellers || []).find((x) => x && (x.id === id || x.phone === id));
          if (fromAdmin) return fromAdmin.fastShipEnabled !== false;
          if (sellerUser && (sellerUser.id === id || id === 'own')) return sellerUser.fastShipEnabled !== false;
        } catch (_) {}
        return true; // پیش‌فرض: فعال
      };
      const isProductFastShip = (p) => {
        if (!p || !p.fastShip) return false;
        const sid = p.sellerId || p.seller?.id || 'own';
        return isSellerFastShipAllowed(sid);
      };
      const isDealActive = (p) => {
        if (!p) return false;
        if (!p.amazing) return false;
        if (p.dealEndsAt && Number(p.dealEndsAt) < Date.now()) return false;
        // بدون dealEndsAt در دیتای قدیمی: فقط اگر تخفیف دارد (سازگاری)
        if (!p.dealEndsAt) return ((Number(p.discount) || 0) > 0 || !!p.oldPrice);
        return ((Number(p.discount) || 0) > 0 || !!p.oldPrice);
      };
      const catalogProducts = useMemo(() => {
        // Until mount: only static demo products — same on server & client (no localStorage merge)
        const now = hasMounted ? Date.now() : 0;
        const normalize = (p) => {
          if (!p) return null;
          let out = { ...p };
          const expired = out.dealEndsAt && Number(out.dealEndsAt) < now;
          if (expired && out.amazing) {
            const restoreRaw = out.priceBeforeDeal != null ? out.priceBeforeDeal : out.oldPrice;
            const restore = typeof restoreRaw === 'number' ? restoreRaw : Number(String(restoreRaw || '').replace(/[^\d]/g, '')) || 0;
            if (restore > 0) {
              out.price = restore;
              try { out.priceText = toFa(restore.toLocaleString()); } catch (_) {}
            }
            out.amazing = false;
            out.discount = 0;
          }
          {
            const img =
              (typeof isUsableProductImage === 'function' && typeof pickProductImage === 'function')
                ? pickProductImage(out)
                : ((out.images && out.images[out.featuredImageIndex || 0]) || out.images?.[0] || out.image || out.cover_image || '');
            if (img) {
              out.image = out.image && String(out.image).length > 12 ? out.image : img;
              out.cover_image = out.cover_image || img;
              if (!Array.isArray(out.images) || !out.images.length) out.images = [img];
            }
            if (!out.colors || !out.colors.length) {
              out.colors = [{ name: out.colorName || 'پیش‌فرض', hex: '#999', image: img || '/logo.webp' }];
            } else {
              out.colors = out.colors.map((c, i) => {
                const bad = !c || !c.image || String(c.image).length < 12 || /^https?:\/\/?$/i.test(String(c.image).trim());
                if (!bad) return c;
                const fallback = (out.images && out.images[i]) || img || '/logo.webp';
                return { ...(c || {}), image: fallback };
              });
            }
          }
          const sName = (out.seller && out.seller.name && out.seller.name !== 'undefined')
            ? out.seller.name
            : (out.sellerName || out.seller_name || out.brandName || out.brand || 'فروشگاه');
          out.seller = {
            id: (out.seller && out.seller.id) || out.sellerId || out.seller_id || 'own',
            name: sName,
          };
          out.sellerName = sName;
          return out;
        };
        const map = new Map();
        (products || []).forEach((p) => { if (p) map.set(String(p.id), normalize(p)); });
        (serverProducts || []).forEach((p) => {
          if (!p) return;
          const prev = map.get(String(p.id));
          // داده سرور برای تصویر اولویت دارد تا کش/دموی قدیمی عکس را نپوشاند
          const merged = prev
            ? {
                ...prev,
                ...p,
                image: p.image || p.cover_image || prev.image,
                cover_image: p.cover_image || p.image || prev.cover_image,
                images: (Array.isArray(p.images) && p.images.length) ? p.images : (prev.images || []),
                colors: (Array.isArray(p.colors) && p.colors.length) ? p.colors : (prev.colors || []),
              }
            : p;
          map.set(String(p.id), normalize(merged));
        });
        if (hasMounted && !(serverProducts && serverProducts.length)) {
          [...(sellerProducts || []), ...(adminProducts || [])].forEach((p) => {
            if (!p) return;
            const ok = p.status === 'active' || p.contentStatus === 'approved';
            if (!ok) return;
            const prev = map.get(String(p.id));
            map.set(String(p.id), normalize(prev ? { ...prev, ...p } : p));
          });
        }
        return [...map.values()];
      }, [hasMounted, products, serverProducts, sellerProducts, adminProducts]);


      const cartItemKey = (id, colorName, size) => `${id}::${colorName || ''}::${size || ''}`;

      const updateQty = (id, colorName, delta, size) => {
        const key = cartItemKey(id, colorName, size);
        const item = cart.find(i => i.id === id && (i.selectedColor?.name || '') === (colorName || '') && (i.selectedSize || '') === (size || ''));
        setCartItemLoading(prev => ({ ...prev, [key]: true }));
        const finishLoading = () => setCartItemLoading(prev => {
          const next = { ...prev };
          delete next[key];
          return next;
        });

        const applyLocal = () => {
          setCart(prev => prev.map(it => {
            if (!(it.id === id && (it.selectedColor?.name || '') === (colorName || '') && (it.selectedSize || '') === (size || ''))) return it;
            const prod = (catalogProducts || products || []).find(pr => pr.id === it.id);
            const maxStock = getVariantStock(prod || it, it.selectedColor?.name, it.selectedSize || it.size, it.selectedAttrs || {}) || it.stockLeft || 99;
            const nextQty = Math.max(0, Math.min(maxStock, it.qty + delta));
            if (delta > 0 && it.qty >= maxStock) {
              try { pushLiveToast(`حداکثر موجودی این ترکیب ${toFa(maxStock)} عدد است`, { type: 'error' }); } catch (_) {}
            }
            return { ...it, qty: nextQty };
          }).filter(i => i.qty > 0));
          setTimeout(finishLoading, 220);
        };

        // آیتم سرور: PATCH به API
        if (item && (item.fromServer || item.serverItemId || isServerProductId(item.product_id || item.id))) {
          (async () => {
            try {
              const nextQty = Math.max(0, (item.qty || 1) + delta);
              const { apiUpdateCartItem, apiRemoveCartItem } = await import('@/lib/api/cart');
              if (nextQty <= 0) {
                await apiRemoveCartItem({ itemId: item.serverItemId, productId: item.product_id || item.id });
              } else {
                await apiUpdateCartItem({ itemId: item.serverItemId, productId: item.product_id || item.id, qty: nextQty });
              }
              await syncCartFromServer();
            } catch (_) {
              applyLocal();
              return;
            }
            finishLoading();
          })();
          return;
        }
        applyLocal();
      };
      const removeFromCart = (id, colorName, size) => {
        const key = cartItemKey(id, colorName, size);
        const item = cart.find(i => i.id === id && i.selectedColor?.name === colorName && (i.selectedSize || '') === (size || ''));
        setCartItemLoading(prev => ({ ...prev, [key]: true }));
        const finishLocal = () => {
          setCart(prev => prev.filter(i => !(i.id === id && i.selectedColor?.name === colorName && (i.selectedSize || '') === (size || ''))));
          setCartItemLoading(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
          });
          pushLiveToast(item ? `«${item.name}» از سبد حذف شد` : 'از سبد حذف شد', { type: 'cart' });
        };
        if (item?.fromServer || item?.serverItemId) {
          (async () => {
            try {
              await removeCartItemServer(item);
            } catch (_) {}
            finishLocal();
          })();
          return;
        }
        setTimeout(finishLocal, 180);
      };
      const printOrderInvoice = (o) => {
        if (!o) return;
        const itemsHtml = (o.items || []).map(it => `
          <tr>
            <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">${it.name || ''}${it.color ? ' · ' + it.color : ''}${it.size ? ' · سایز ' + it.size : ''}</td>
            <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center">${it.qty || 1}</td>
            <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:left;direction:ltr">${Number(it.price || 0).toLocaleString('fa-IR')}</td>
            <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:left;direction:ltr">${Number((it.price || 0) * (it.qty || 1)).toLocaleString('fa-IR')}</td>
          </tr>`).join('');
        const shipCost = o.shipping?.cost ?? 0;
        const discount = o.payment?.discount ?? 0;
        const total = o.total ?? o.totals?.payable ?? 0;
        const goods = total - shipCost + discount;
        const html = `<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="utf-8"/><title>فاکتور ${o.id}</title>
          <style>
            body{font-family:Tahoma,Arial,sans-serif;padding:24px;color:#111;max-width:720px;margin:0 auto}
            h1{font-size:18px;margin:0 0 4px} .muted{color:#6b7280;font-size:12px}
            table{width:100%;border-collapse:collapse;margin-top:16px;font-size:13px}
            th{background:#f3f4f6;padding:8px;text-align:right;border-bottom:2px solid #e5e7eb}
            .totals{margin-top:16px;font-size:13px;line-height:1.9}
            .totals .row{display:flex;justify-content:space-between;border-bottom:1px solid #f3f4f6;padding:4px 0}
            .totals .final{font-weight:bold;font-size:15px;border-top:2px solid #111;margin-top:8px;padding-top:8px}
            @media print{body{padding:0} .no-print{display:none}}
          </style></head><body>
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px">
            <div><h1>فاکتور / رسید سفارش</h1><p class="muted">پیراهن مردانه — بازارگاه تخصصی</p></div>
            <div style="text-align:left"><p style="margin:0;font-weight:bold;direction:ltr">${o.id}</p><p class="muted">${o.date || ''}</p></div>
          </div>
          <p class="muted" style="margin-top:12px">وضعیت: ${o.statusLabel || o.status || '—'} · پرداخت: ${o.payment?.method || 'درگاه بانکی'}</p>
          ${o.shipping?.address ? `` : ''}
          <table><thead><tr><th>کالا</th><th style="text-align:center">تعداد</th><th style="text-align:left">قیمت واحد</th><th style="text-align:left">جمع</th></tr></thead>
          <tbody>${itemsHtml || '<tr><td colspan="4" style="padding:12px;text-align:center">بدون آیتم</td></tr>'}</tbody></table>
          <div class="totals">
            <div class="row"><span>مبلغ کالا</span><span>${Number(goods).toLocaleString('fa-IR')} تومان</span></div>
            ${discount > 0 ? `<div class="row"><span>تخفیف</span><span>−${Number(discount).toLocaleString('fa-IR')} تومان</span></div>` : ''}
            <div class="row"><span>ارسال</span><span>${Number(shipCost).toLocaleString('fa-IR')} تومان</span></div>
            <div class="row final"><span>مبلغ قابل پرداخت</span><span>${Number(total).toLocaleString('fa-IR')} تومان</span></div>
          </div>
          <p class="muted" style="margin-top:24px">این فاکتور از پنل خریدار قابل چاپ است. برای پشتیبانی شماره سفارش را ذکر کنید.</p>
          <p class="no-print" style="margin-top:16px"><button onclick="window.print()" style="padding:10px 20px;border-radius:999px;background:#2563eb;color:#fff;border:0;cursor:pointer;font-family:inherit">چاپ فاکتور</button></p>
          <script>setTimeout(function(){try{window.print()}catch(e){}},400)</script>
          </body></html>`;
        const w = window.open('', '_blank', 'noopener,noreferrer,width=800,height=900');
        if (!w) { showToast({ message: 'پنجره چاپ مسدود شد؛ اجازه پاپ‌آپ را فعال کنید', variant: 'default', duration: 4500, position: 'top-center' }); return; }
        w.document.open();
        w.document.write(html);
        w.document.close();
      };

      const classifyToastVariant = (text, type = 'info') => {
        const t = String(text || '');
        const ty = String(type || 'info');
        if (ty === 'error') return 'error';
        if (ty === 'success' || ty === 'order') return 'success';
        if (ty === 'cart') return /اضافه|افزود/.test(t) ? 'success' : 'default';
        if (ty === 'warning') return 'error'; // اخطار هم قرمز پاستیلی
        if (ty === 'system') return /موفق|نصب شد/.test(t) ? 'success' : 'default';
        // info و بقیه: موفقیت‌های رایج → سبز، خطاها → قرمز، راهنما → بنفش
        if (/خطا|نامعتبر|مجاز نیست|رد شد|شکست|ناموفق|اجباری|الزامی|پیدا نشد|مسدود/.test(t)) return 'error';
        if (/موفق|ثبت شد|تأیید|تایید|ارسال شد|ذخیره|کپی شد|به‌روز|بازگردانی|دانلود|منتشر|فعال شد|انجام شد|خوش آمدید|اضافه شد|افزوده|پرداخت موفق|نصب شد|باز شد|تعطیل شد|غیرفعال شد|آماده‌سازی|رهگیری/.test(t)) return 'success';
        return 'default';
      };
      const pushLiveToast = (text, opts = {}) => {
        const type = opts.type || 'info';
        // success→سبز پاستیلی · error→قرمز پاستیلی · info→بنفش پاستیلی
        const variant = opts.variant || classifyToastVariant(text, type);
        const actions = opts.action === 'cart'
          ? { label: 'مشاهده سبد', onClick: () => setCartOpen(true), variant: 'outline' }
          : opts.actions || undefined;
        showToast({
          title: opts.title,
          message: text,
          variant,
          duration: opts.duration || 4000,
          position: 'top-center',
          actions,
        });
      };

      /* ═══════════════════════════════════════════════════════════
         لایهٔ Realtime فرانت (فاز ۱)
         - BroadcastChannel بین تب‌های هم‌origin
         - storage event بین پنجره‌ها
         - آماده برای اتصال بعدی به WebSocket / Supabase (فاز ۲)
         ═══════════════════════════════════════════════════════════ */
      const RT_CHANNEL_NAME = 'pirahan-realtime-v1';
      const RT_KEYS = {
        buyerTickets: true,
        sellerTickets: true,
        adminTickets: true,
        buyerOrders: true,
        sellerOrders: true,
        adminOrders: true,
        sellerProducts: true,
        adminProducts: true,
        adminModerationQueue: true,
        buyerNotifications: true,
        sellerNotifications: true,
        adminSellers: true,
        adminBuyers: true,
        adminCoupons: true,
      };
      const rtTabIdRef = useRef(
        (typeof crypto !== 'undefined' && crypto.randomUUID)
          ? crypto.randomUUID()
          : ('tab-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8))
      );
      const rtChannelRef = useRef(null);

      const publishRealtime = useCallback((key, value) => {
        if (!key || !RT_KEYS[key]) {
          try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
          return;
        }
        try {
          const serialized = JSON.stringify(value);
          localStorage.setItem(key, serialized);
          // pulse برای storage event در تب‌های دیگر
          localStorage.setItem('__rt_pulse', JSON.stringify({ key, ts: Date.now(), tab: rtTabIdRef.current }));
        } catch (_) {}
        try {
          if (rtChannelRef.current) {
            rtChannelRef.current.postMessage({
              type: 'rt',
              key,
              value,
              tab: rtTabIdRef.current,
              ts: Date.now(),
            });
          }
        } catch (_) {}
      }, []);

      const applyRealtimePayload = useCallback((key, value) => {
        if (!key || value === undefined) return;
        switch (key) {
          case 'buyerTickets': setBuyerTickets(Array.isArray(value) ? value : []); break;
          case 'sellerTickets': setSellerTickets(Array.isArray(value) ? value : []); break;
          case 'adminTickets': setAdminTickets(Array.isArray(value) ? value : []); break;
          case 'buyerOrders': setOrders(Array.isArray(value) ? value : []); break;
          case 'sellerOrders': setSellerOrders(Array.isArray(value) ? value : []); break;
          case 'adminOrders': setAdminOrders(Array.isArray(value) ? value : []); break;
          case 'sellerProducts': setSellerProducts(Array.isArray(value) ? value : []); break;
          case 'adminProducts': setAdminProducts(Array.isArray(value) ? value : []); break;
          case 'adminModerationQueue': setAdminModerationQueue(Array.isArray(value) ? value : []); break;
          case 'buyerNotifications': setNotifications(Array.isArray(value) ? value : []); break;
          case 'sellerNotifications':
            try { /* seller notifications state if present */ } catch (_) {}
            break;
          case 'adminSellers': setAdminSellers(Array.isArray(value) ? value : []); break;
          case 'adminBuyers': setAdminBuyers(Array.isArray(value) ? value : []); break;
          case 'adminCoupons': setAdminCoupons(Array.isArray(value) ? value : []); break;
          default: break;
        }
      }, []);

      // گوش‌دادن به BroadcastChannel + storage (بین تب/پنجره)
      useEffect(() => {
        let ch = null;
        try {
          if (typeof BroadcastChannel !== 'undefined') {
            ch = new BroadcastChannel(RT_CHANNEL_NAME);
            rtChannelRef.current = ch;
            ch.onmessage = (ev) => {
              const data = ev && ev.data;
              if (!data || data.type !== 'rt') return;
              if (data.tab === rtTabIdRef.current) return;
              if (!RT_KEYS[data.key]) return;
              applyRealtimePayload(data.key, data.value);
            };
          }
        } catch (_) {}

        const onStorage = (e) => {
          if (!e) return;
          if (e.key === '__rt_pulse') {
            try {
              const pulse = JSON.parse(e.newValue || '{}');
              if (!pulse || pulse.tab === rtTabIdRef.current) return;
              if (!pulse.key || !RT_KEYS[pulse.key]) return;
              const raw = localStorage.getItem(pulse.key);
              const parsed = raw ? JSON.parse(raw) : [];
              applyRealtimePayload(pulse.key, parsed);
            } catch (_) {}
            return;
          }
          if (e.key && RT_KEYS[e.key] && e.newValue != null) {
            try {
              applyRealtimePayload(e.key, JSON.parse(e.newValue));
            } catch (_) {}
          }
        };
        window.addEventListener('storage', onStorage);

        // polling سبک وقتی تب可见 است — پوشش مرورگرهای بدون BroadcastChannel
        let pollTimer = null;
        const snapshot = {};
        const pollKeys = Object.keys(RT_KEYS);
        const takeSnap = () => {
          pollKeys.forEach((k) => {
            try { snapshot[k] = localStorage.getItem(k); } catch (_) { snapshot[k] = null; }
          });
        };
        takeSnap();
        const poll = () => {
          if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
          pollKeys.forEach((k) => {
            try {
              const cur = localStorage.getItem(k);
              if (cur !== snapshot[k]) {
                snapshot[k] = cur;
                if (cur != null) applyRealtimePayload(k, JSON.parse(cur));
              }
            } catch (_) {}
          });
        };
        pollTimer = setInterval(poll, 2500);

        return () => {
          window.removeEventListener('storage', onStorage);
          if (pollTimer) clearInterval(pollTimer);
          try { if (ch) ch.close(); } catch (_) {}
          rtChannelRef.current = null;
        };
      }, [applyRealtimePayload]);

      /* ═══════════════════════════════════════════════════════════
         Realtime سراسری — Supabase postgres_changes (فاز ۲)
         همه جداول حیاتی → pm:invalidate → رفرش لیست‌های مربوط
         ═══════════════════════════════════════════════════════════ */
      useEffect(() => {
        if (typeof window === 'undefined') return undefined;
        let stop = () => {};
        let cancelled = false;


        const onInvalidate = (ev) => {
          const scope = ev?.detail?.scope || 'all';
          try {
            if (scope === 'catalog' || scope === 'all') {
              try {
                if (typeof reloadServerCatalog === 'function') reloadServerCatalog();
              } catch (_) {}
              fetch('/api/catalog/products?limit=200', {
                cache: 'no-store',
                headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
              })
                .then((r) => r.json())
                .then((j) => {
                  const list = j?.products;
                  if (Array.isArray(list) && typeof mapCatalogRow === 'function' && typeof setServerProducts === 'function') {
                    const mapped = list.map(mapCatalogRow).filter(Boolean);
                    setServerProducts(mapped);
                    try { setCatalogFetchDone(true); } catch (_) {}
                    try { publishRealtime('catalogProducts', mapped); } catch (_) {}
                  }
                })
                .catch(() => {});
              fetch('/api/seller/products', { credentials: 'include', cache: 'no-store' })
                .then((r) => r.json())
                .then((j) => {
                  const list = j?.products || j?.data || (Array.isArray(j) ? j : null);
                  if (list && typeof setSellerProducts === 'function') {
                    try {
                      const mapped =
                        typeof mapServerProductToSellerUi === 'function'
                          ? list.map((row) => mapServerProductToSellerUi(row)).filter(Boolean)
                          : list;
                      setSellerProducts(mapped);
                      publishRealtime('sellerProducts', mapped);
                    } catch (_) {}
                  }
                })
                .catch(() => {});
              fetch('/api/admin/products?limit=200', { credentials: 'include', cache: 'no-store' })
                .then((r) => r.json())
                .then((j) => {
                  const list = j?.products || j?.data;
                  if (Array.isArray(list) && typeof setAdminProducts === 'function') {
                    try {
                      setAdminProducts(list);
                      publishRealtime('adminProducts', list);
                    } catch (_) {}
                  }
                })
                .catch(() => {});
              try { window.dispatchEvent(new Event('catalog-products-refetch')); } catch (_) {}
              try { window.dispatchEvent(new Event('admin-products-refetch')); } catch (_) {}
            }
            if (scope === 'orders' || scope === 'all') {
              fetch('/api/orders', { credentials: 'include', cache: 'no-store' })
                .then((r) => r.json())
                .then((j) => {
                  const list = j?.orders || j?.data;
                  if (Array.isArray(list)) {
                    try { setOrders(list); } catch (_) {}
                    try { publishRealtime('buyerOrders', list); } catch (_) {}
                  }
                })
                .catch(() => {});
              fetch('/api/seller/orders', { credentials: 'include', cache: 'no-store' })
                .then((r) => r.json())
                .then((j) => {
                  const list = j?.orders || j?.data;
                  if (Array.isArray(list)) {
                    try { setSellerOrders && setSellerOrders(list); } catch (_) {}
                    try { publishRealtime('sellerOrders', list); } catch (_) {}
                  }
                })
                .catch(() => {});
              fetch('/api/admin/orders?limit=100', { credentials: 'include', cache: 'no-store' })
                .then((r) => r.json())
                .then((j) => {
                  const list = j?.orders || j?.data;
                  if (Array.isArray(list) && typeof setAdminOrders === 'function') {
                    try { setAdminOrders(list); } catch (_) {}
                  }
                })
                .catch(() => {});
            }
            if (scope === 'notifications' || scope === 'all') {
              fetch('/api/notifications', { credentials: 'include', cache: 'no-store' })
                .then((r) => r.json())
                .then((j) => {
                  const list = j?.notifications || j?.data;
                  if (Array.isArray(list)) {
                    try { setNotifications && setNotifications(list); } catch (_) {}
                    try { publishRealtime('buyerNotifications', list); } catch (_) {}
                  }
                })
                .catch(() => {});
            }
            if (scope === 'sellers' || scope === 'all') {
              try { window.dispatchEvent(new CustomEvent('seller-status-changed')); } catch (_) {}
              fetch('/api/catalog/sellers', { cache: 'no-store' })
                .then((r) => r.json())
                .then((j) => {
                  if (j?.ok && Array.isArray(j.sellers) && typeof setTopSellers === 'function') {
                    const mapped = (j.sellers || []).map((s) => {
                      const products = Number(s.active_products_count != null ? s.active_products_count : s.products_count) || 0;
                      return {
                        id: s.id,
                        name: s.shop_name || s.shopName || 'فروشگاه',
                        shopName: s.shop_name || s.shopName || 'فروشگاه',
                        slug: s.slug || '',
                        desc: s.about || '',
                        about: s.about || '',
                        city: s.city || '',
                        image: s.logo_url || s.logo || '/logo.webp',
                        logo: s.logo_url || s.logo || '',
                        banner: s.banner_url || s.logo_url || '/logo.webp',
                        rating: s.rating != null ? Number(s.rating) : 0,
                        ratingCount: s.rating_count != null ? Number(s.rating_count) : 0,
                        products,
                        productsSafe: products,
                        productsCount: products,
                        status: s.status || 'approved',
                      };
                    });
                    setTopSellers(mapped);
                  }
                })
                .catch(() => {});
              fetch('/api/admin/sellers', { credentials: 'include', cache: 'no-store' })
                .then((r) => r.json())
                .then((j) => {
                  const list = j?.sellers || j?.data;
                  if (Array.isArray(list) && typeof setAdminSellers === 'function') {
                    try { setAdminSellers(list); } catch (_) {}
                  }
                })
                .catch(() => {});
            }
            if (scope === 'tickets' || scope === 'all') {
              fetch('/api/tickets', { credentials: 'include', cache: 'no-store' })
                .then((r) => r.json())
                .then((j) => {
                  const list = j?.tickets || j?.data;
                  if (Array.isArray(list)) {
                    try { setTickets && setTickets(list); } catch (_) {}
                    try { setAdminTickets && setAdminTickets(list); } catch (_) {}
                  }
                })
                .catch(() => {});
            }
            if (scope === 'cart' || scope === 'all') {
              try {
                if (typeof loadAddressesFromServer === 'function') loadAddressesFromServer();
              } catch (_) {}
            }
          } catch (_) {}
        };

        const onDb = (ev) => {
          try {
            const table = ev?.detail?.table;
            if (table === 'products' || table === 'product_variants') {
              window.dispatchEvent(new CustomEvent('pm:invalidate', { detail: { scope: 'catalog', ts: Date.now() } }));
            }
            if (table === 'orders' || table === 'order_items') {
              window.dispatchEvent(new CustomEvent('pm:invalidate', { detail: { scope: 'orders', ts: Date.now() } }));
            }
            if (table === 'sellers') {
              window.dispatchEvent(new CustomEvent('pm:invalidate', { detail: { scope: 'sellers', ts: Date.now() } }));
            }
            if (table === 'user_notifications') {
              window.dispatchEvent(new CustomEvent('pm:invalidate', { detail: { scope: 'notifications', ts: Date.now() } }));
            }
            if (table === 'tickets' || table === 'support_tickets') {
              window.dispatchEvent(new CustomEvent('pm:invalidate', { detail: { scope: 'tickets', ts: Date.now() } }));
            }
          } catch (_) {}
        };


        window.addEventListener('pm:invalidate', onInvalidate);
        window.addEventListener('pm:db', onDb);

        (async () => {
          try {
            const mod = await import('../lib/supabase/client');
            const client = mod.createClient?.() || null;
            if (!client || cancelled) return;
            const live = await import('../lib/realtime/supabase-live');
            const handle = live.startGlobalRealtime(client);
            stop = handle.stop;
          } catch (e) {
            try { console.warn('[realtime] bootstrap', e); } catch (_) {}
          }
        })();

        return () => {
          cancelled = true;
          window.removeEventListener('pm:invalidate', onInvalidate);
          try { window.removeEventListener('pm:db', onDb); } catch (_) {}
          try { stop(); } catch (_) {}
        };
      }, [publishRealtime]);

      const showBrowserPush = (title, body, opts = {}) => {
        try {
          if (typeof window === 'undefined' || !('Notification' in window)) return;
          const fire = () => {
            try {
              if (Notification.permission !== 'granted') return;
              const n = new Notification(title || 'پیراهن مردانه', {
                body: body || '',
                icon: '/apple-touch-icon.webp',
                badge: '/favicon-32.webp',
                dir: 'rtl',
                lang: 'fa',
                tag: opts.tag || 'pirahan-' + Date.now(),
                data: { url: opts.url || '/' },
              });
              n.onclick = () => {
                try { window.focus(); } catch (_) {}
                n.close();
              };
            } catch (_) {}
          };
          if (Notification.permission === 'granted') fire();
          else if (Notification.permission !== 'denied' && opts.request !== false) {
            Notification.requestPermission().then((p) => { if (p === 'granted') fire(); }).catch(() => {});
          }
        } catch (_) {}
      };

      const pushNotification = (payload, opts = {}) => {
        const n = {
          id: 'n-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
          type: payload.type || 'system',
          title: payload.title || 'اعلان',
          body: payload.body || '',
          date: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
          read: false,
        };
        setNotifications(prev => {
          const base = Array.isArray(prev) ? prev : [];
          const next = [n, ...base].slice(0, 60);
          publishRealtime('buyerNotifications', next);
          return next;
        });
        if (opts.toast !== false) {
          pushLiveToast(payload.title || payload.body || 'اعلان جدید', { type: payload.type || 'info', action: opts.toastAction });
        }
        // پوش نوتیفیکیشن مرورگر / وب‌اپ برای خریدار
        if (opts.push !== false) {
          showBrowserPush(n.title, n.body, { tag: n.id, url: opts.url || '/?profile=1' });
        }
        return n;
      };

      const pushSellerNotification = (payload, opts = {}) => {
        const n = {
          id: 'sn-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
          type: payload.type || 'system',
          title: payload.title || 'اعلان فروشنده',
          body: payload.body || '',
          date: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
          read: false,
        };
        try {
          const prev = JSON.parse(localStorage.getItem('sellerNotifications') || '[]');
          const next = [n, ...(Array.isArray(prev) ? prev : [])].slice(0, 60);
          publishRealtime('sellerNotifications', next);
          window.dispatchEvent(new CustomEvent('seller-notif-update', { detail: next }));
        } catch (_) {}
        if (opts.toast !== false) {
          pushLiveToast(payload.title || payload.body || 'اعلان فروشنده', { type: payload.type || 'info' });
        }
        if (opts.push !== false) {
          showBrowserPush(n.title, n.body, { tag: n.id, url: opts.url || '/?sellerPanel=1' });
        }
        return n;
      };

      const pullNotifications = () => {
        setNotifPulling(true);
        setTimeout(() => {
          // شبیه‌سازی دریافت اعلان‌های جدید از سرور و به‌روزرسانی لیست
          const pool = [
            { type: 'promo', title: 'پیشنهاد لحظه‌ای', body: 'تا ۲ ساعت آینده روی پیراهن رسمی ۱۵٪ تخفیف بیشتر.' },
            { type: 'order', title: 'به‌روزرسانی سفارش', body: 'یکی از سفارش‌های شما در حال آماده‌سازی است.' },
            { type: 'system', title: 'یادآوری سبد', body: 'کالاهایی در سبد دارید که ممکن است موجودی‌شان تمام شود.' },
            { type: 'ticket', title: 'پاسخ پشتیبانی', body: 'پاسخ جدیدی برای یکی از تیکت‌های شما ثبت شد.' },
          ];
          const pick = pool[Math.floor(Math.random() * pool.length)];
          pushNotification({ ...pick, title: pick.title }, { toast: true });
          try { pushLiveToast('اعلان‌ها به‌روزرسانی شد', { type: 'success', duration: 2500 }); } catch (_) {}
          setNotifPulling(false);
        }, 700);
      };

      const markAllNotifsRead = () => {
        setNotifications(prev => {
          const next = (prev || []).map(n => ({ ...n, read: true }));
          publishRealtime('buyerNotifications', next);
          return next;
        });
      };

      const markNotifRead = (id) => {
        setNotifications(prev => {
          const next = (prev || []).map(n => n.id === id ? { ...n, read: true } : n);
          publishRealtime('buyerNotifications', next);
          return next;
        });
      };

      
      const clearCart = () => {
        if (isServerCartEnabled() || user?.supabase) {
          clearCartServer().catch(() => {});
        }
        setCart([]);
        setCouponApplied(null);
        setCouponInput('');
        setCouponMsg(null);
        setClearCartConfirm(false);
        pushLiveToast('سبد خرید خالی شد', { type: 'cart' });
      };
      
      const getUsedPromoCodes = () => {
        try { return JSON.parse(localStorage.getItem('usedPromoCodes') || '[]'); } catch { return []; }
      };
      const markPromoCodeUsed = (code) => {
        const c = String(code || '').toUpperCase();
        if (!c) return;
        const used = getUsedPromoCodes();
        if (!used.includes(c)) {
          used.push(c);
          try { localStorage.setItem('usedPromoCodes', JSON.stringify(used)); } catch (_) {}
        }
        // mark in buyerGifts / sellerGifts / adminCoupons
        try {
          const bg = Array.isArray(buyerGifts) ? buyerGifts : [];
          const nextBg = (bg || []).map(g => (g.code || '').toUpperCase() === c ? { ...g, status: 'used', active: false, usedAt: new Date().toISOString() } : g);
          if (typeof setBuyerGifts === 'function') setBuyerGifts(nextBg);
          setBuyerGifts(nextBg);
        } catch (_) {}
        try {
          const sg = JSON.parse(localStorage.getItem('sellerGifts') || '[]');
          const nextSg = (sg || []).map(g => (g.code || '').toUpperCase() === c ? { ...g, status: 'used', active: false, usedAt: new Date().toISOString() } : g);
          localStorage.setItem('sellerGifts', JSON.stringify(nextSg));
          setSellerGifts(nextSg);
        } catch (_) {}
        try {
          const ac = JSON.parse(localStorage.getItem('adminCoupons') || '[]');
          const nextAc = (ac || []).map(g => (g.code || '').toUpperCase() === c ? { ...g, status: 'used', used: (Number(g.used) || 0) + 1 } : g);
          localStorage.setItem('adminCoupons', JSON.stringify(nextAc));
          setAdminCoupons(nextAc);
        } catch (_) {}
      };
      const generateGiftCode = () => {
        const existing = new Set();
        try {
          (Array.isArray(buyerGifts) ? buyerGifts : []).forEach(g => existing.add(String(g.code || '').toUpperCase()));
          (JSON.parse(localStorage.getItem('sellerGifts') || '[]') || []).forEach(g => existing.add(String(g.code || '').toUpperCase()));
          (JSON.parse(localStorage.getItem('adminCoupons') || '[]') || []).forEach(g => existing.add(String(g.code || '').toUpperCase()));
          getUsedPromoCodes().forEach(c => existing.add(String(c).toUpperCase()));
        } catch (_) {}
        for (let i = 0; i < 30; i++) {
          let digits = '';
          for (let j = 0; j < 8; j++) digits += String(Math.floor(Math.random() * 10));
          const code = 'GIFT' + digits;
          if (!existing.has(code)) return code;
        }
        return 'GIFT' + String(Date.now()).slice(-8);
      };

      const applyCoupon = async () => {
        const code = (couponInput || '').trim().toUpperCase();
        if (!code) {
          setCouponMsg({ type: 'err', text: 'کد تخفیف یا هدیه را وارد کنید' });
          return;
        }
        if (getUsedPromoCodes().includes(code)) {
          setCouponApplied(null);
          setCouponMsg({ type: 'err', text: 'این کد قبلاً استفاده شده و منقضی است' });
          return;
        }
        let found = null;
        let source = null;

        // اول از سرور (جدول coupons)
        try {
          const res = await fetch('/api/coupons?code=' + encodeURIComponent(code), { credentials: 'include', cache: 'no-store' });
          const json = await res.json().catch(() => ({}));
          if (json?.ok && json.coupon) {
            const c = json.coupon;
            found = c.type === 'amount'
              ? { code: c.code, amount: Number(c.value) || 0, singleUse: true, kind: 'discount', serverId: c.id }
              : { code: c.code, percent: Number(c.value) || 0, singleUse: true, kind: 'discount', serverId: c.id };
            source = 'server';
          }
        } catch (_) {}

        const map = {
          PIRAHAN10: { code: 'PIRAHAN10', percent: 10, singleUse: true },
          SHIRT50: { code: 'SHIRT50', amount: 50000, singleUse: true },
          WELCOME: { code: 'WELCOME', percent: 15, singleUse: true },
        };
        if (!found) {
          found = map[code] || null;
          source = found ? 'demo' : null;
        }

        // کدهای ادمین (تخفیف)
        if (!found && adminCoupons && Array.isArray(adminCoupons)) {
          const ac = adminCoupons.find(c => (c.code || '').toUpperCase() === code && (c.status === 'active' || c.status === 'pending'));
          if (ac && ac.status === 'used') {
            setCouponMsg({ type: 'err', text: 'این کد قبلاً استفاده شده و منقضی است' });
            return;
          }
          if (ac && ac.status === 'active') {
            found = ac.type === 'percent'
              ? { code: ac.code, percent: Number(ac.value) || 0, singleUse: true, kind: 'discount' }
              : { code: ac.code, amount: Number(ac.value) || 0, singleUse: true, kind: 'discount' };
            source = 'admin';
          }
        }

        // کد هدیه (خریدار / فروشنده)
        if (!found) {
          const gifts = [
            ...((buyerGifts || [])),
            ...((sellerGifts || []).filter(g => g.type === 'gift')),
          ];
          const g = gifts.find(x => (x.code || '').toUpperCase() === code);
          if (g) {
            if (g.status === 'used' || g.active === false) {
              setCouponMsg({ type: 'err', text: 'این کد هدیه قبلاً استفاده شده و منقضی است' });
              return;
            }
            if (g.expiresAt && new Date(g.expiresAt).getTime() < Date.now()) {
              setCouponMsg({ type: 'err', text: 'مهلت استفاده از این کد هدیه به پایان رسیده است' });
              return;
            }
            if (g.status && g.status !== 'active' && g.status !== 'pending') {
              setCouponMsg({ type: 'err', text: 'این کد هدیه قابل استفاده نیست' });
              return;
            }
            found = {
              code: g.code,
              percent: Number(g.percent) || 10,
              singleUse: true,
              kind: 'gift',
              expiresAt: g.expiresAt || null,
            };
            source = 'gift';
          }
        }

        if (!found) {
          setCouponApplied(null);
          setCouponMsg({ type: 'err', text: 'کد تخفیف یا هدیه معتبر نیست' });
          return;
        }
        setCouponApplied({ ...found, singleUse: true });
        setCouponMsg({
          type: 'ok',
          text: found.kind === 'gift'
            ? `کد هدیه ${found.code} اعمال شد — ${toFa(found.percent || 0)}٪`
            : found.percent
              ? `کد ${found.code} اعمال شد — ${toFa(found.percent)}٪ تخفیف`
              : `کد ${found.code} اعمال شد — ${formatPrice(found.amount)} تومان تخفیف`,
        });
      };
      const removeCoupon = () => {
        setCouponApplied(null);
        setCouponInput('');
        setCouponMsg(null);
      };
      const openQuickAdd = (p) => {
        const idx = selectedColors[p.id] ?? 0;
        setQuickAdd(p);
        setQuickColorIdx(idx);
        setQuickGalleryIdx(idx);
        setQuickSize(selectedSizes[p.id] || 'M');
        setQuickQty(1);
        setQuickDescOpen(false);
        setImgZoom(false);
      };

      /** پیشوند ۴حرفی از نام فروشگاه */
      const shopCodePrefix = (shopName) => {
        const raw = String(shopName || 'SHOP').replace(/\s+/g, '');
        let letters = raw.replace(/[^\u0600-\u06FFa-zA-Z0-9]/g, '');
        if (letters.length < 4) letters = (letters + 'XXXX').slice(0, 4);
        else letters = letters.slice(0, 4);
        return letters.toUpperCase();
      };
      /** کد یکتا: ۴حرف فروشگاه + ۹ رقم — بدون هم‌پوشانی بین همه فروشگاه‌ها */
      
      /** کد یکتای تیکت: TK + 9 رقم — بدون هم‌پوشانی بین خریدار/فروشنده/ادمین */
      const generateTicketCode = () => {
        const collect = () => {
          const codes = new Set();
          const add = (arr) => {
            (arr || []).forEach((t) => {
              if (t && t.code) codes.add(String(t.code));
              if (t && t.id) codes.add(String(t.id));
            });
          };
          try { add(JSON.parse(localStorage.getItem('buyerTickets') || '[]')); } catch (_) {}
          try { add(JSON.parse(localStorage.getItem('sellerTickets') || '[]')); } catch (_) {}
          try { add(JSON.parse(localStorage.getItem('adminTickets') || '[]')); } catch (_) {}
          try { if (typeof buyerTickets !== 'undefined') add(buyerTickets); } catch (_) {}
          try { if (typeof sellerTickets !== 'undefined') add(sellerTickets); } catch (_) {}
          try { if (typeof adminTickets !== 'undefined') add(adminTickets); } catch (_) {}
          return codes;
        };
        const existing = collect();
        for (let i = 0; i < 40; i++) {
          let digits = '';
          for (let j = 0; j < 9; j++) digits += String(Math.floor(Math.random() * 10));
          const code = 'TK' + digits;
          if (!existing.has(code)) return code;
        }
        return 'TK' + String(Date.now()).slice(-9);
      };

      /** گفتگوی باز چت (یکپارچه با تیکت) */
      const findOpenChatConversation = (list) => {
        const arr = Array.isArray(list) ? list : [];
        return arr.find(t => t && (t.fromChat || t.channel === 'chat') && t.status !== 'closed')
          || arr.find(t => t && t.channel === 'chat')
          || null;
      };

      const conversationChannelLabel = (t) => {
        if (!t) return 'گفتگو';
        if (t.type === 'return' || t.channel === 'return') return 'مرجوعی';
        if (t.fromChat || t.channel === 'chat' || t.type === 'chat') return 'چت';
        return 'تیکت';
      };

      const ticketMessagesToChatUI = (messages) => {
        return (messages || []).map((m, i) => ({
          id: m.id || ('m-' + i + '-' + (m.time || m.date || '')),
          from: (m.from === 'buyer' || m.from === 'user') ? 'user' : 'agent',
          text: m.text || '',
          time: m.time || m.date || '',
        }));
      };

      const mirrorConversationToAdmin = (conv, fromName) => {
        if (!conv || !conv.id) return;
        try {
          const adm = (() => { try { return JSON.parse(localStorage.getItem('adminTickets') || '[]'); } catch { return []; } })();
          const existing = (adm || []).find(t => t.id === conv.id);
          const row = {
            id: conv.id,
            code: conv.code || conv.id,
            type: conv.type === 'return' ? 'return' : 'buyer',
            channel: conv.channel || (conv.fromChat ? 'chat' : 'ticket'),
            fromChat: !!(conv.fromChat || conv.channel === 'chat'),
            subject: conv.subject || (conv.fromChat ? 'چت آنلاین' : 'گفتگو'),
            status: conv.status || 'open',
            unread: true,
            date: conv.date || new Date().toLocaleDateString('fa-IR'),
            fromName: fromName || conv.fromName || 'خریدار',
            fromPhone: conv.fromPhone || '',
            messages: conv.messages || [],
          };
          const nextAdm = existing
            ? (adm || []).map(t => t.id === conv.id ? { ...row, unread: true } : t)
            : [row, ...(adm || [])];
          saveAdminTickets(nextAdm);
        } catch (_) {}
      };


const generateProductCode = (sellerKey, productId, shopName) => {
        const prefix = shopCodePrefix(shopName || sellerKey || 'SHOP');
        const allLists = () => [...(sellerProducts || []), ...(adminProducts || []), ...(products || [])];
        const taken = new Set(
          allLists()
            .filter(p => p && p.productCode && String(p.id) !== String(productId))
            .map(p => String(p.productCode))
        );
        let code = '';
        for (let attempt = 0; attempt < 80; attempt++) {
          const now = Date.now() + attempt * 97 + Math.floor(Math.random() * 999);
          let digits = String(now % 1000000000).padStart(9, '0');
          if (digits.length > 9) digits = digits.slice(-9);
          code = `${prefix}${digits}`;
          if (!taken.has(code)) return code;
        }
        // fallback فوق‌العاده نادر
        code = `${prefix}${String(Date.now()).slice(-9)}`;
        while (taken.has(code)) {
          code = `${prefix}${String(Math.floor(Math.random() * 1e9)).padStart(9, '0')}`;
        }
        return code;
      };

      const ensureProductCode = (p, sellerKey) => {
        if (p?.productCode) return p.productCode;
        const shop = p?.seller?.name || p?.shopName || sellerUser?.shopName || sellerKey || 'SHOP';
        return generateProductCode(sellerKey || p?.sellerId || p?.seller?.id || 'OWN', p?.id, shop);
      };

      const getProductPublicPath = (p) => {
        try {
          const code = p?.productCode || p?.product_code || '';
          if (code) return '/product/' + encodeURIComponent(String(code));
        } catch (_) {}
        return pathForProduct(
          p?.name || p?.title || p?.id,
          p?.shopName || p?.sellerName || p?.seller?.name || p?.brand || sellerUser?.shopName || ''
        );
      };

      const getProductPublicUrl = (p) => {
        try {
          const origin = typeof window !== 'undefined' ? window.location.origin : 'https://pirahanemardane.ir';
          return origin + getProductPublicPath(p);
        } catch (_) {
          return 'https://pirahanemardane.ir' + getProductPublicPath(p);
        }
      };

      const copyTextToClipboard = async (text) => {
        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
          } else {
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
          }
          pushLiveToast('کپی شد', { type: 'info', duration: 2000 });
          return true;
        } catch (_) {
          showToast({ message: String('کپی ممکن نشد — متن را دستی کپی کنید:\n' + text), variant: 'error', duration: 4500, position: 'top-center' });
          return false;
        }
      };

      
      const approveAdminProductOnServer = async (productId, status = 'active') => {
        const res = await fetch('/api/admin/products/' + encodeURIComponent(productId), {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.ok) throw new Error(data?.error || 'تأیید محصول ناموفق');
        return data.product;
      };

      const approveAdminProduct = async (productId) => {
        try {
          await approveAdminProductOnServer(productId, 'active');
        } catch (err) {
          try { showToast({ message: String(err?.message || err), variant: 'error', duration: 5000, position: 'top-center' }); } catch (_) {}
          return;
        }
        const list = adminProducts || [];
        const p = list.find(x => x.id === productId);
        if (!p) return;
        const code = ensureProductCode(p, p.sellerId || p.sellerName || 'ADM');
        const next = list.map(x => x.id === productId ? {
          ...x,
          status: 'active',
          contentStatus: 'approved',
          productCode: code,
          publishedAt: x.publishedAt || new Date().toISOString(),
          publicPath: getProductPublicPath({ ...x, productCode: code }),
        } : x);
        saveAdminProducts(next);
        // sync seller products if same id
        if (sellerProducts?.some(sp => sp.id === productId)) {
          saveSellerProducts((sellerProducts || []).map(sp => sp.id === productId ? {
            ...sp,
            status: 'active',
            contentStatus: 'approved',
            productCode: code,
            publishedAt: sp.publishedAt || new Date().toISOString(),
            publicPath: getProductPublicPath({ ...sp, productCode: code }),
          } : sp));
        }
        pushLiveToast('محصول تأیید و منتشر شد', { type: 'info' });
        pushNotification({
          type: 'product',
          title: 'محصول منتشر شد',
          body: `«${p.name}» تأیید شد. کد: ${code}`,
        });
      };


      const normProductCode = (v) => onlyDigits(toEnDigits(String(v ?? '')));
      const findProductByCode = (pools, rawCode) => {
        const want = normProductCode(rawCode);
        if (!want) return null;
        const list = pools || [];
        return list.find((x) => {
          const c = normProductCode(x?.productCode || x?.product_code || '');
          if (c && c === want) return true;
          if (c && (c.endsWith(want) || want.endsWith(c)) && Math.min(c.length, want.length) >= 8) return true;
          if (String(x?.id) === String(rawCode)) return true;
          return false;
        }) || null;
      };

      const openPDP = (p, opts = {}) => {
        if (!(opts && opts.silent)) beginPageLoad('product');
        try { const _arg = arguments.length ? arguments[0] : null; const _pid = _arg && (typeof _arg === 'object' ? _arg.id : _arg); if (_pid) pushProductView(_pid); } catch (_) {}

        if (!p || p.id == null) return;
        try { setAwaitingDeepProduct(false); } catch (_) {}
        const silent = !!(opts && opts.silent);
        try {
          if (pdpProduct && String(pdpProduct.id) === String(p.id) && !opts.force) {
            setPdpProduct(p);
            return;
          }
        } catch (_) {}

        const colorsMap = selectedColors && typeof selectedColors === 'object' ? selectedColors : {};
        const sizesMap = selectedSizes && typeof selectedSizes === 'object' ? selectedSizes : {};
        const idx = Number(colorsMap[p.id]) || 0;
        setPdpProduct(p);
        setPdpColorIdx(idx);
        setPdpGalleryIdx(0);
        setPdpSize(sizesMap[p.id] || '');
        {
          let dims = [];
          try {
            dims = Array.isArray(getAttrDimensions?.(p.attributes || {}, adminCatalogAttributes || []))
              ? getAttrDimensions(p.attributes || {}, adminCatalogAttributes || [])
              : [];
          } catch (_) { dims = []; }
          const init = {};
          dims.forEach(d => { if (d && d.options?.[0]) init[d.id] = d.options[0]; });
          setPdpAttrs(init);
        }
        setPdpQty(1);
        setPdpTab('desc');
        setPdpReviewFilter('all');
        setPdpZoom(false);
        setPdpGiftWrap(false);
        setPdpExpress(false);
        setPdpNotifyOpen(false);
        setPdpQText('');
        setPdpQaFilter('all');
        setPdpSizeRecOpen(false);
        setPdpSizeRec(null);
        setShowPLP(false);
        setShowSellersList(false);
        setActiveSellerId(null);
        setQuickAdd(null);
        setRecentlyViewed(prev => {
          const filtered = prev.filter(x => x.id !== p.id);
          return [p, ...filtered].slice(0, 12);
        });
        if (!silent) {
          try {
            window.scrollTo(0, 0);
            requestAnimationFrame(() => { window.scrollTo(0, 0); });
          } catch (_) {}
        }
        try {
          const code = p?.productCode || ensureProductCode(p);
          if (code && typeof window !== 'undefined') {
            const path = pathForProduct(p?.name || p?.title || code, p?.shopName || p?.sellerName || p?.brand || '');
            if (window.location.pathname !== path) {
              window.history.pushState({ product: code }, '', path);
            }
          }
        } catch (_) {}
      };
      const closePDP = () => {
        setPdpProduct(null);
        setPdpZoom(false);
        try {
          if (typeof window !== 'undefined') {
            const parsed = parseFaPath(window.location.pathname);
            if (parsed.type === 'product' || parsed.type === 'product_code' || window.location.pathname.startsWith('/product/')) {
              leaveCurrentPage();
            }
          }
        } catch (_) {}
      };


      // ——— مسیریابی فارسی + Back/Forward (همیشه آخرین state با ref) ———
      const applyPathRef = useRef(() => {});
      applyPathRef.current = () => {
        try {
          const clearViews = () => {
            try { setStaticPage(null); } catch (_) {}
            try { setBlogPostId(null); } catch (_) {}
            try { setBrandDetailId(null); } catch (_) {}
            try { setPdpProduct(null); } catch (_) {}
            try { setShowPLP(false); } catch (_) {}
            try { setShowCartPage(false); } catch (_) {}
            try { setShowCheckout(false); } catch (_) {}
            try { setShowWishlistPage(false); } catch (_) {}
            try { setShowRecentPage(false); } catch (_) {}
            try { setShowComparePage(false); } catch (_) {}
            try { setShowProfilePage(false); } catch (_) {}
            try { setShowSellerPanel(false); } catch (_) {}
            try { setShowAdminPanel(false); } catch (_) {}
            try { setShowSellersList(false); } catch (_) {}
            try { setShowTaxonomyHub(null); } catch (_) {}
            try { setActiveSellerId(null); } catch (_) {}
            try { setMobileMenuOpen(false); } catch (_) {}
            try { setMegaOpen(null); } catch (_) {}
            try { setCartOpen(false); } catch (_) {}
            try { setWishlistOpen(false); } catch (_) {}
            try { setCompareOpen(false); } catch (_) {}
            try { setRecentOpen(false); } catch (_) {}
          };

          const path = window.location.pathname;
          const parsed = parseFaPath(path);
          if (parsed.legacyRedirect) {
            replaceFaUrl(parsed.legacyRedirect);
          }
          const params = new URLSearchParams(window.location.search);

          if (parsed.type === 'home') {
            clearViews();
            try { if (typeof scrollPageToTop === 'function') scrollPageToTop(); else window.scrollTo(0, 0); } catch (_) {}
            return;
          }

          clearViews();

          if (parsed.type === 'shop' || parsed.page === 'shop') {
            const cat = params.get('دسته') || params.get('cat');
            const tag = params.get('برچسب') || params.get('tag');
            const q = params.get('ق') || params.get('q');
            const sort = params.get('sort') || params.get('مرتب') || undefined;
            openPLP({ cat: cat || undefined, tag: tag || undefined, query: q || undefined, sort: sort || undefined, silent: true, keepSort: true });
            try { if (typeof scrollPageToTop === 'function') scrollPageToTop(); } catch (_) {}
            return;
          }
          if (parsed.type === 'cart' || parsed.page === 'cart') {
            setShowCartPage(true);
            try { if (typeof scrollPageToTop === 'function') scrollPageToTop(); } catch (_) {}
            return;
          }
          if (parsed.type === 'checkout' || parsed.page === 'checkout') {
            setShowCheckout(true);
            try { if (typeof scrollPageToTop === 'function') scrollPageToTop(); } catch (_) {}
            return;
          }
          if (parsed.type === 'wishlist' || parsed.page === 'wishlist') {
            setShowWishlistPage(true);
            try { if (typeof scrollPageToTop === 'function') scrollPageToTop(); } catch (_) {}
            return;
          }
          if (parsed.type === 'compare' || parsed.page === 'compare') {
            setShowComparePage(true);
            try { if (typeof scrollPageToTop === 'function') scrollPageToTop(); } catch (_) {}
            return;
          }
          if (parsed.type === 'recent' || parsed.page === 'recent') {
            setShowRecentPage(true);
            try { if (typeof scrollPageToTop === 'function') scrollPageToTop(); } catch (_) {}
            return;
          }
          if (parsed.type === 'profile' || parsed.page === 'profile') {
            setShowProfilePage(true);
            try { if (typeof scrollPageToTop === 'function') scrollPageToTop(); } catch (_) {}
            return;
          }
          if (parsed.type === 'seller-panel' || parsed.page === 'seller-panel') {
            setShowSellerPanel(true);
            try { if (typeof scrollPageToTop === 'function') scrollPageToTop(); } catch (_) {}
            return;
          }
          if (parsed.type === 'admin-panel' || parsed.page === 'admin-panel' || path === '/amirshn' || path.endsWith('/amirshn')) {
            if (adminUser && isAdminPhone(adminUser.phone)) {
              setShowAdminPanel(true);
              setAdminAuthOpen(false);
            } else {
              setAdminAuthOpen(true);
              setAdminAuthStep('phone');
            }
            try { if (typeof scrollPageToTop === 'function') scrollPageToTop(); } catch (_) {}
            return;
          }
          if (parsed.type === 'sellers' || parsed.page === 'sellers') {
            setActiveSellerId(null);
            setShowSellersList(true);
            try { if (typeof scrollPageToTop === 'function') scrollPageToTop(); } catch (_) {}
            return;
          }
          if (parsed.type === 'categories' || parsed.page === 'categories') {
            setShowTaxonomyHub('categories');
            try { if (typeof scrollPageToTop === 'function') scrollPageToTop(); } catch (_) {}
            return;
          }
          if (parsed.type === 'tags' || parsed.page === 'tags') {
            setShowTaxonomyHub('tags');
            try { if (typeof scrollPageToTop === 'function') scrollPageToTop(); } catch (_) {}
            return;
          }
          if (parsed.type === 'static' && parsed.page) {
            setStaticPage(parsed.page);
            try { if (typeof scrollPageToTop === 'function') scrollPageToTop(); } catch (_) {}
            return;
          }
          if (parsed.type === 'blog' && parsed.blogSlug) {
            const posts = blogPosts || [];
            const post = posts.find((b) => slugifyFa(b.slug || b.title || '') === slugifyFa(parsed.blogSlug) || String(b.id) === parsed.blogSlug);
            if (post) { setBlogPostId(post.id); setStaticPage('blog-post'); }
            else setStaticPage('blog');
            try { if (typeof scrollPageToTop === 'function') scrollPageToTop(); } catch (_) {}
            return;
          }
          if (parsed.type === 'seller' && parsed.sellerSlug) {
            setShowSellersList(false);
            try {
              const slug = String(parsed.sellerSlug || '');
              const list = Array.isArray(topSellers) ? topSellers : [];
              const hit = list.find((s) =>
                String(s.id) === slug
                || slugifyFa(s.shopName || s.name || '') === slugifyFa(slug)
                || String(s.slug || '') === slug
                || slugifyFa(s.slug || '') === slugifyFa(slug)
              );
              if (hit) setActiveSellerId(hit.id);
              else setActiveSellerId(slug);
            } catch (_) {
              try { setActiveSellerId(String(parsed.sellerSlug)); } catch (__) {}
            }
            try { if (typeof scrollPageToTop === 'function') scrollPageToTop(); } catch (_) {}
            return;
          }
          if (parsed.type === 'product' || parsed.type === 'product_code') {
            const pools = [
              ...(catalogProducts || []),
              ...(serverProducts || []),
              ...(sellerProducts || []),
              ...(adminProducts || []),
              ...(products || []),
            ];
            let found = null;
            if (parsed.type === 'product_code') {
              found = typeof findProductByCode === 'function'
                ? findProductByCode(pools, parsed.code)
                : pools.find((x) => String(x.productCode || x.product_code || x.id) === String(parsed.code));
            } else {
              found = pools.find((x) => {
                const pth = pathForProduct(x.name || x.title, x.shopName || x.sellerName || x.brand || '');
                const want = pathForProduct(parsed.productSlug, parsed.shopSlug || '');
                return pth === want || slugifyFa(x.name || x.title) === slugifyFa(parsed.productSlug);
              });
            }
            if (found) openPDP(found, { silent: true });
            else if (catalogFetchDone) setStaticPage('error-404');
            try { if (typeof scrollPageToTop === 'function') scrollPageToTop(); } catch (_) {}
            return;
          }
          if (parsed.type === 'unknown') {
            setStaticPage('error-404');
            try { if (typeof scrollPageToTop === 'function') scrollPageToTop(); } catch (_) {}
            return;
          }
        } catch (_) {}
      };

      useEffect(() => {
        const run = () => {
          try { applyPathRef.current(); } catch (_) {}
        };
        run();
        const onPop = () => run();
        window.addEventListener('popstate', onPop);
        return () => window.removeEventListener('popstate', onPop);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      useEffect(() => {
        try {
          if (typeof window === 'undefined') return;
          const parsed = parseFaPath(window.location.pathname);
          const isProdRoute =
            parsed.type === 'product' ||
            parsed.type === 'product_code' ||
            (window.location.pathname || '').startsWith('/product/');
          if (!isProdRoute) return;
          if (pdpProduct) {
            try { setAwaitingDeepProduct(false); } catch (_) {}
            return;
          }
          const pools = [
            ...(catalogProducts || []),
            ...(serverProducts || []),
            ...(sellerProducts || []),
            ...(adminProducts || []),
            ...(products || []),
          ];
          if (!pools.length) return;
          let found = null;
          if (parsed.type === 'product_code' || (window.location.pathname || '').startsWith('/product/')) {
            const code =
              parsed.type === 'product_code'
                ? String(parsed.code || '')
                : decodeURIComponent((window.location.pathname.split('/')[2] || ''));
            found = findProductByCode(pools, code || initialProductCode);
          } else {
            found = pools.find((x) => {
              const path = pathForProduct(x.name || x.title, x.shopName || x.sellerName || x.brand || '');
              const want = pathForProduct(parsed.productSlug, parsed.shopSlug || '');
              return path === want || slugifyFa(x.name || x.title) === slugifyFa(parsed.productSlug);
            });
          }
          if (found) {
            openPDP(found, { silent: true });
            try { setAwaitingDeepProduct(false); } catch (_) {}
            try { if (staticPage === 'error-404') setStaticPage(null); } catch (_) {}
          } else if (catalogFetchDone) {
            // فقط بعد از پاسخ سرور → ۴۰۴
            try { setAwaitingDeepProduct(false); } catch (_) {}
            try { setStaticPage('error-404'); } catch (_) {}
          }
        } catch (_) {}
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [catalogProducts, serverProducts, sellerProducts, adminProducts, products, initialProductCode, catalogFetchDone]);



      // awaitingDeepProduct timeout — اگر بعد از انتظار هنوز PDP نیست → ۴۰۴ نه خانه
      useEffect(() => {
        if (!awaitingDeepProduct) return undefined;
        if (pdpProduct) {
          try { setAwaitingDeepProduct(false); } catch (_) {}
          return undefined;
        }
        const t = setTimeout(() => {
          try { setAwaitingDeepProduct(false); } catch (_) {}
          try {
            if (!pdpProduct) setStaticPage('error-404');
          } catch (_) {}
        }, 12000);
        return () => clearTimeout(t);
      }, [awaitingDeepProduct, pdpProduct]);

      // لینک مستقیم محصول: /product/CODE یا /?product=CODE + prop سرور
      useEffect(() => {
        try {
          const params = new URLSearchParams(window.location.search);
          let code = initialProductCode || params.get('product') || params.get('p') || '';
          if (!code && typeof window !== 'undefined') {
            const m = window.location.pathname.match(/^\/product\/([^/\?]+)/);
            if (m) code = decodeURIComponent(m[1]);
          }
          if (!code) return;
          try { setAwaitingDeepProduct(true); } catch (_) {}
          const pools = [
            ...(catalogProducts || []),
            ...(serverProducts || []),
            ...(products || []),
            ...(sellerProducts || []),
            ...(adminProducts || []),
          ];
          if (!pools.length) return;
          const found = findProductByCode(pools, code);
          if (found) {
            openPDP(found);
            try { setAwaitingDeepProduct(false); } catch (_) {}
          }
        } catch (_) {}
      }, [initialProductCode, catalogProducts, serverProducts, products, sellerProducts, adminProducts]);


      // با تغییر صفحه (منو / ناوبری) همیشه از بالای صفحه شروع شود
      useEffect(() => {
        scrollPageToTop();
      }, [
        staticPage,
        showPLP,
        pdpProduct,
        showCartPage,
        showCheckout,
        showWishlistPage,
        showRecentPage,
        showComparePage,
        showProfilePage,
        showSellerPanel,
        showAdminPanel,
        activeSellerId,
        showSellersList,
        showTaxonomyHub,
        blogPostId,
      ]);

      // لینک مستقیم مطلب بلاگ از مسیر /blog/[id]
      useEffect(() => {
        try {
          let id = initialBlogId || '';
          if (!id && typeof window !== 'undefined') {
            const m = window.location.pathname.match(/^\/blog\/([^/\?]+)/);
            if (m) id = decodeURIComponent(m[1]);
          }
          if (!id) return;
          const post = (blogPosts || []).find(b => String(b.id) === String(id));
          if (post) {
            setStaticPage('blog-post');
            setBlogPostId(post.id);
            try {
              const path = `/blog/${encodeURIComponent(post.id)}`;
              if (window.location.pathname !== path) {
                window.history.replaceState({ blog: post.id }, '', path);
              }
            } catch (_) {}
          }
        } catch (_) {}
      }, [initialBlogId]);

      const suggestSizeFromBody = () => {
        const h = Number(pdpHeight);
        const w = Number(pdpWeight);
        if (!h || !w) { setPdpSizeRec(null); return; }
        let s = 'M';
        if (h < 170 || w < 65) s = 'S';
        else if (h < 178 && w < 78) s = 'M';
        else if (h < 185 && w < 88) s = 'L';
        else if (h < 192 && w < 98) s = 'XL';
        else s = 'XXL';
        setPdpSizeRec(s);
        setPdpSize(s);
      };

      const normalizeAttrMap = (attrs) => {
        const out = {};
        Object.keys(attrs || {}).sort().forEach(k => {
          const v = attrs[k];
          if (v == null || v === '') return;
          out[k] = Array.isArray(v) ? String(v[0] ?? '') : String(v);
        });
        return out;
      };
      const attrsKeyPart = (attrs) => {
        const n = normalizeAttrMap(attrs);
        return Object.keys(n).map(k => `${k}:${n[k]}`).join('|');
      };
      const variantKey = (color, size, attrs) => `${String(color || '').trim()}||${String(size || '').trim()}||${attrsKeyPart(attrs)}`;
      const attrsMatch = (a, b) => {
        const na = normalizeAttrMap(a);
        const nb = normalizeAttrMap(b);
        const keys = Array.from(new Set([...Object.keys(na), ...Object.keys(nb)]));
        if (!keys.length) return true;
        return keys.every(k => String(na[k] || '') === String(nb[k] || ''));
      };
      /** ابعاد ویژگی از attributes محصول یا فرم فروشنده */
      const getAttrDimensions = (attributes, catalogAttrs) => {
        const dims = [];
        const cat = catalogAttrs || [];
        cat.filter(a => a && a.active !== false).forEach(a => {
          const raw = (attributes || {})[a.id];
          let opts = [];
          if (Array.isArray(raw)) opts = raw.map(String).filter(Boolean);
          else if (raw != null && raw !== '') opts = [String(raw)];
          if (opts.length) dims.push({ id: a.id, name: a.name, options: opts });
        });
        return dims;
      };
      const cartesianAttrCombos = (dims) => {
        if (!dims.length) return [{}];
        return dims.reduce((acc, dim) => {
          const next = [];
          acc.forEach(prev => {
            (dim.options || []).forEach(opt => {
              next.push({ ...prev, [dim.id]: opt });
            });
          });
          return next;
        }, [{}]);
      };
      const findProductVariant = (prod, colorName, size, attrs) => {
        const list = prod?.variants;
        if (!Array.isArray(list) || !list.length) return null;
        const c = String(colorName || '').trim();
        const s = String(size || '').trim();
        const want = normalizeAttrMap(attrs);
        let hit = list.find(v => String(v.color || '') === c && String(v.size || '') === s && attrsMatch(v.attrs || {}, want));
        if (hit) return hit;
        // سازگاری با واریانت‌های قدیمی فقط رنگ×سایز
        hit = list.find(v => String(v.color || '') === c && String(v.size || '') === s && (!v.attrs || !Object.keys(v.attrs || {}).length));
        return hit || null;
      };
      const getVariantPrice = (prod, colorName, size, attrs) => {
        const v = findProductVariant(prod, colorName, size, attrs);
        if (v && v.price != null && v.price !== '') return Number(v.price) || 0;
        return Number(prod?.price) || 0;
      };
      const getVariantStock = (prod, colorName, size, attrs) => {
        const v = findProductVariant(prod, colorName, size, attrs);
        if (v && v.stock != null && v.stock !== '') return Number(v.stock) || 0;
        if (prod?.stockLeft != null) return Number(prod.stockLeft) || 0;
        return Number(prod?.stock) || 0;
      };
      const buildVariantMatrix = (colorNames, sizes, attrDims, basePrice, baseStock, existing = []) => {
        const cols = (colorNames || []).filter(Boolean);
        const szs = (sizes || []).filter(Boolean);
        let combos = cartesianAttrCombos(attrDims || []);
        // سقف ترکیب برای جلوگیری از هنگ
        const maxRows = 120;
        const total = Math.max(1, cols.length) * Math.max(1, szs.length) * combos.length;
        if (total > maxRows) {
          combos = combos.slice(0, Math.max(1, Math.floor(maxRows / Math.max(1, cols.length * szs.length))));
        }
        const map = {};
        (existing || []).forEach(v => { map[variantKey(v.color, v.size, v.attrs)] = v; });
        const out = [];
        (cols.length ? cols : ['']).forEach(color => {
          (szs.length ? szs : ['']).forEach(size => {
            combos.forEach(attrs => {
              const k = variantKey(color, size, attrs);
              const prev = map[k];
              out.push({
                id: prev?.id || `var-${k}`,
                color,
                size,
                attrs: { ...attrs },
                price: prev?.price != null && prev.price !== '' ? Number(prev.price) : (Number(basePrice) || 0),
                stock: prev?.stock != null && prev.stock !== '' ? Number(prev.stock) : (Number(baseStock) || 0),
                note: prev?.note || '',
                image: prev?.image || '',
              });
            });
          });
        });
        return out;
      };
      const syncFormVariants = (f) => {
        const colorNames = (adminCatalogColors || []).filter(c => (f.colorIds || []).includes(c.id)).map(c => c.name);
        const sizes = f.sizes || [];
        const attrDims = getAttrDimensions(f.attributes || {}, adminCatalogAttributes || []);
        const basePrice = onlyDigits(String(f.price || '')) || f.price;
        const baseStock = onlyDigits(String(f.stock || '')) || f.stock;
        return buildVariantMatrix(colorNames, sizes, attrDims, basePrice, baseStock, f.variants || []);
      };

      const addToCart = (p, opts = {}) => {
        if (!p) return;
        const colorIdx = opts.colorIdx ?? selectedColors[p.id] ?? 0;
        const selectedColor = opts.selectedColor || p.colors?.[colorIdx] || p.selectedColor || { name: 'پیش‌فرض', image: p.image || p.cover_image || '/logo.webp' };
        const sizeList = (p.sizes && p.sizes.length) ? p.sizes : [];
        let selectedSize = opts.size || selectedSizes[p.id] || '';
        if (opts.requireSize && sizeList.length && !selectedSize) {
          if (!opts.silent) {
            try { showToast({ message: 'لطفاً سایز را انتخاب کنید', variant: 'error', duration: 3500, position: 'top-center' }); } catch (_) {}
            try { document.getElementById('pdp-size-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_) {}
          }
          return;
        }
        if (!selectedSize) selectedSize = (sizeList[0] || '');
        const addQty = Math.max(1, opts.qty ?? 1);
        const selectedAttrs = opts.attrs || {};
        const productId = p.product_id || p.id;
        const isServerProd = isServerProductId(productId) || !!p.fromServer;
        const vPrice = getVariantPrice(p, selectedColor?.name, selectedSize, selectedAttrs) || Number(p.price) || 0;
        let vStock = getVariantStock(p, selectedColor?.name, selectedSize, selectedAttrs);
        // محصولات سرور بدون ماتریس واریانت: موجودی پیش‌فرض
        if (isServerProd && (!vStock || vStock <= 0)) vStock = Number(p.stock) || Number(p.stockLeft) || 99;
        if (!isServerProd && vStock <= 0) {
          if (!opts.silent) pushLiveToast('این ترکیب رنگ/سایز ناموجود است', { type: 'error' });
          return;
        }
        if (!isServerProd && addQty > vStock) {
          if (!opts.silent) pushLiveToast(`حداکثر ${toFa(vStock)} عدد از این ترکیب موجود است`, { type: 'error' });
          return;
        }

        // سبد سرور: UUID + کاربر لاگین (یا session فعال)
        const tryServer = isServerProductId(productId) && !!(user?.id || user?.supabase || isServerCartEnabled());
        if (tryServer) {
          (async () => {
            try {
              const res = await addToCartServer(productId, addQty, opts.variantId || p.variant_id || null);
              if (res?.ok) {
                setQuickAdd(null);
                if (!opts.silent) {
                  setCartOpen(true);
                  pushLiveToast(`«${p.name || p.title}» به سبد اضافه شد`, { type: 'success', action: 'cart' });
                }
                return;
              }
              if (res && /وارد نشده|401/i.test(String(res.error || ''))) {
                setServerCartEnabled(false);
                if (!opts.silent) pushLiveToast('برای سبد سرور دوباره وارد شوید', { type: 'error' });
              } else if (res?.error && !opts.silent) {
                pushLiveToast(String(res.error), { type: 'error' });
              }
              // fallback محلی فقط اگر سرور خطا داد
              applyLocalAdd();
            } catch (e) {
              applyLocalAdd();
            }
          })();
          return;
        }

        function applyLocalAdd() {
          setCart(prev => {
            const same = (i) => i.id === p.id && (i.selectedColor?.name || '') === (selectedColor?.name || '') && (i.selectedSize || '') === selectedSize && attrsMatch(i.selectedAttrs || {}, selectedAttrs);
            const exist = prev.find(same);
            if (exist) {
              const nextQty = exist.qty + addQty;
              if (vStock > 0 && nextQty > vStock) {
                if (!opts.silent) pushLiveToast(`حداکثر ${toFa(vStock)} عدد از این ترکیب موجود است`, { type: 'error' });
                return prev;
              }
              return prev.map(i => same(i) ? { ...i, qty: nextQty, price: vPrice, priceText: toFa(vPrice.toLocaleString()) } : i);
            }
            return [...prev, {
              ...p,
              id: p.id,
              product_id: productId,
              qty: addQty,
              selectedColor,
              selectedSize,
              selectedAttrs,
              price: vPrice,
              priceText: toFa(vPrice.toLocaleString()),
              stockLeft: vStock || 99,
              image: selectedColor?.image || p.image,
              variantKey: variantKey(selectedColor?.name, selectedSize, selectedAttrs),
              fromServer: isServerProd,
            }];
          });
          setQuickAdd(null);
          if (!opts.silent) {
            setCartOpen(true);
            pushLiveToast(`«${p.name || p.title}» به سبد اضافه شد`, { type: 'success', action: 'cart' });
          }
        }
        applyLocalAdd();
      };
      const changeCartColor = (id, oldColorName, newColor) => {
        setCart(prev => {
          const existingSame = prev.find(i => i.id === id && i.selectedColor?.name === newColor.name);
          if (existingSame) {
            return prev
              .map(i => {
                if (i.id === id && i.selectedColor?.name === oldColorName) {
                  return { ...existingSame, qty: existingSame.qty + i.qty };
                }
                if (i.id === id && i.selectedColor?.name === newColor.name) return null;
                return i;
              })
              .filter(Boolean);
          }
          return prev.map(i =>
            (i.id === id && i.selectedColor?.name === oldColorName)
              ? { ...i, selectedColor: newColor, image: newColor.image }
              : i
          );
        });
      };
      const selectColor = (productId, colorIdx) => {
        setSelectedColors(prev => ({ ...prev, [productId]: colorIdx }));
      };
      const persistCompare = (list) => {
        try { localStorage.setItem('compare', JSON.stringify(list.map(p => p.id))); } catch (_) {}
        return list;
      };
      const showCompareToast = (payload) => {
        const msg = payload?.text || '';
        showToast({
          message: msg,
          variant: classifyToastVariant(msg, 'success'),
          position: 'top-center',
          duration: 2800,
          actions: payload?.action === 'view'
            ? { label: 'مشاهده مقایسه', onClick: () => { setWishlistOpen(false); setCartOpen(false); setCompareOpen(true); }, variant: 'outline' }
            : undefined,
        });
      };
      const toggleCompare = (p) => {
        setCompare(prev => {
          if (prev.find(i => i.id === p.id)) {
            const next = prev.filter(i => i.id !== p.id);
            showCompareToast({ text: 'از مقایسه حذف شد' });
            return persistCompare(next);
          }
          if (prev.length >= COMPARE_MAX) {
            setCompareReplaceOpen(p);
            return prev;
          }
          const next = [...prev, p];
          showCompareToast({ text: 'به مقایسه اضافه شد', action: 'view' });
          return persistCompare(next);
        });
      };
      const replaceCompareAt = (oldId, newProduct) => {
        setCompare(prev => {
          const next = prev.map(p => p.id === oldId ? newProduct : p);
          // if oldId not in list, replace last
          const has = prev.some(p => p.id === oldId);
          const final = has ? next : [...prev.slice(0, -1), newProduct];
          showCompareToast({ text: 'جایگزین شد', action: 'view' });
          return persistCompare(final);
        });
        setCompareReplaceOpen(null);
      };
      const clearCompare = () => {
        setCompare(persistCompare([]));
        setCompareReplaceOpen(null);
        showCompareToast({ text: 'لیست مقایسه پاک شد' });
      };
      const closeStaticPage = () => { setStaticPage(null); setBlogPostId(null); setBrandDetailId(null); };

      const getPageCms = (pageKey) => (adminPageContent && adminPageContent[pageKey]) || null;
      /** منبع واحد توضیح فروشگاه: CMS صفحه shop (با همگام‌سازی به adminSettings) */
      const getShopSeoBody = () => {
        const cmsBody = (getPageCms('shop') || {}).body;
        if (cmsBody != null && String(cmsBody).trim() !== '') return cmsBody;
        return adminSettings?.shopSeoHtml || adminSettings?.shopSeoText || '';
      };
      const updatePageCms = (pageKey, patch) => {
        const prev = (adminPageContent && adminPageContent[pageKey]) || {};
        const merged = { ...prev, ...patch, updatedAt: new Date().toISOString() };
        saveAdminPageContentMap({ ...adminPageContent, [pageKey]: merged });
        if (pageKey === 'shop' && patch && patch.body != null) {
          try {
            const plain = (typeof htmlToPlain === 'function'
              ? htmlToPlain(patch.body)
              : String(patch.body).replace(/<[^>]+>/g, ' ')
            ).replace(/\s+/g, ' ').trim().slice(0, 500);
            if (typeof saveAdminSettings === 'function') {
              saveAdminSettings({ ...adminSettings, shopSeoHtml: patch.body, shopSeoText: plain });
            }
          } catch (_) {}
        }
      };


      /** اسکرول به بالای صفحه — موبایل/سافاری: behavior:instant اغلب بی‌اثر است */


      const scrollPageToTop = () => {
        const go = () => {
          try {
            window.scrollTo(0, 0);
            if (document.documentElement) document.documentElement.scrollTop = 0;
            if (document.body) document.body.scrollTop = 0;
            const root = document.getElementById('__next') || document.getElementById('root');
            if (root) root.scrollTop = 0;
          } catch (_) {}
        };
        go();
        try { requestAnimationFrame(go); } catch (_) {}
        try { setTimeout(go, 50); } catch (_) {}
        try { setTimeout(go, 150); } catch (_) {}
        try { setTimeout(go, 350); } catch (_) {}
      };


      /** بستن صفحه: Back مرورگر یا خانه — URL همیشه درست بماند */
      const leaveCurrentPage = () => {
        try {
          if (typeof window !== 'undefined' && window.history.length > 1) {
            window.history.back();
            return;
          }
        } catch (_) {}
        try {
          setStaticPage(null);
          setBlogPostId(null);
          setPdpProduct(null);
          setShowPLP(false);
          setShowCartPage(false);
          setShowCheckout(false);
          setShowWishlistPage(false);
          setShowRecentPage(false);
          setShowComparePage(false);
          setShowProfilePage(false);
          setShowSellerPanel(false);
          setShowAdminPanel(false);
          setShowSellersList(false);
          try { pushFaUrl(FA_PATHS.home || '/'); } catch (_) {}
          setShowTaxonomyHub(null);
          setActiveSellerId(null);
        } catch (_) {}
        try { replaceFaUrl(FA_PATHS.home); } catch (_) {}
        try { scrollPageToTop(); } catch (_) {}
      };


      // endPageLoad on view settle — پاک کردن لودینگ بعد از نشستن ویو
      useEffect(() => {
        if (!pageLoadingText) return undefined;
        const tmr = setTimeout(() => { try { endPageLoad(); } catch (_) {} }, 250);
        return () => clearTimeout(tmr);
      }, [
        pageLoadingText,
        staticPage,
        showPLP,
        pdpProduct,
        showCartPage,
        showCheckout,
        showWishlistPage,
        showRecentPage,
        showComparePage,
        showProfilePage,
        showSellerPanel,
        showAdminPanel,
        activeSellerId,
        showSellersList,
        showTaxonomyHub,
      ]);

      const openStaticPage = (page, opts = {}) => {
        beginPageLoad(page || 'home');
        setStaticPage(page);
        setBlogPostId(opts.blogId || null);
        setCompareOpen(false);
        setWishlistOpen(false);
        setCartOpen(false);
        setRecentOpen(false);
        setShowComparePage(false);
        setShowCartPage(false);
        setShowCheckout(false);
        setShowWishlistPage(false);
        setShowRecentPage(false);
        setShowProfilePage(false);
        setShowSellerPanel(false);
        setShowAdminPanel(false);
        setPdpProduct(null);
        setShowPLP(false);
        setShowSellersList(false);
        setShowTaxonomyHub(null);
        setActiveSellerId(null);
        setMobileMenuOpen(false);
        setMegaOpen(null);
        try {
          if (page === 'blog-post' && opts.blogId) {
            const post = (typeof blogPosts !== 'undefined' ? blogPosts : [])?.find?.(b => b.id === opts.blogId);
            pushFaUrl(pathForBlogPost(post?.slug || post?.title || opts.blogId), { staticPage: page, blogId: opts.blogId });
          
        try { applyPathRef.current(); } catch (_) {}} else {
            pushFaUrl(pathForStaticPage(page), { staticPage: page });
          }
        } catch (_) {}
        scrollPageToTop();
      };
      const openComparePage = () => {
        beginPageLoad('compare');
        setCompareOpen(false);
        setWishlistOpen(false);
        setCartOpen(false);
        closeStaticPage();
        setShowComparePage(true);
        setShowCartPage(false);
        setShowCheckout(false);
        setShowWishlistPage(false);
        setShowRecentPage(false);
        setShowProfilePage(false);
        setShowSellerPanel(false);
        setShowAdminPanel(false);
        setPdpProduct(null);
        setShowPLP(false);
        setShowSellersList(false);
        setActiveSellerId(null);
        setMobileMenuOpen(false);
        setMegaOpen(null);
        try {
          const url = new URL(window.location.href);
          ['plp','cat','seller','sellers','cart','wishlist','recent','tag'].forEach(k => url.searchParams.delete(k));
          url.searchParams.set('compare', compare.map(p => p.id).join(',') || '1');
          pushFaUrl(FA_PATHS.compare, { compare: true });
        
        try { applyPathRef.current(); } catch (_) {}} catch (_) {}
        window.scrollTo({ top: 0, behavior: 'instant' });
      };
      const closeComparePage = () => {
        setShowComparePage(false);
        leaveCurrentPage();
      };
      const deriveFabric = (p) => {
        const n = p.name || '';
        if (n.includes('لینن')) return 'لینن';
        if (n.includes('نخی') || n.includes('پنبه')) return 'پنبه / نخی';
        if (n.includes('چهارخانه') || n.includes('راه راه')) return 'نخی ترکیبی';
        return 'پارچه رسمی';
      };
      const deriveSleeve = (p) => {
        const c = p.category || '';
        const n = p.name || '';
        if (c.includes('آستین کوتاه') || n.includes('آستین کوتاه') || n.includes('لینن')) return 'آستین کوتاه';
        return 'آستین بلند';
      };
      const deriveCollar = (p) => {
        const c = p.category || '';
        if (c.includes('کروات')) return 'یقه کروات';
        if (c.includes('رسمی')) return 'یقه رسمی';
        return 'یقه معمولی';
      };

      const normalizeSearch = (s) => String(s || '')
        .replace(/ي/g, 'ی').replace(/ك/g, 'ک')
        .replace(/[\u064B-\u065F]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();

      const SEARCH_SYNONYMS = {
        'کتان': 'لینن', 'linen': 'لینن', 'نیم آستین': 'آستین کوتاه', 'نیم‌آستین': 'آستین کوتاه',
        'boss': 'باس', 'hugo': 'باس', 'polo': 'پولو', 'tommy': 'تامی', 'lacoste': 'لاکوست',
        'formal': 'رسمی', 'shirt': 'پیراهن', 'white': 'سفید', 'black': 'مشکی',
      };
      const expandQuery = (q) => {
        let t = normalizeSearch(q);
        Object.entries(SEARCH_SYNONYMS).forEach(([k, v]) => {
          if (t === normalizeSearch(k) || t.includes(normalizeSearch(k))) {
            t = `${t} ${normalizeSearch(v)}`;
          }
        });
        return t;
      };

      const scoreProduct = (p, qRaw) => {
        if (!qRaw) return 1;
        const q = expandQuery(qRaw);
        const tokens = q.split(' ').filter(Boolean);
        const name = normalizeSearch(p.name);
        const cat = normalizeSearch(p.category);
        const seller = normalizeSearch(p.seller?.name);
        const colors = (p.colors || []).map(c => normalizeSearch(c.name)).join(' ');
        let score = 0;
        tokens.forEach(t => {
          if (name === t) score += 100;
          else if (name.startsWith(t)) score += 50;
          else if (name.includes(t)) score += 30;
          if (cat.includes(t)) score += 25;
          if (seller.includes(t)) score += 15;
          if (colors.includes(t)) score += 12;
          if (normalizeSearch(`پیراهن ${p.category}`).includes(t)) score += 20;
        });
        if (p.discount) score += 2;
        if (p.rating >= 5) score += 2;
        if (p.amazing) score += 1;
        return score;
      };

      const searchCatsSafe = Array.isArray(searchCategories) ? searchCategories : [];
      const searchColorsSafe = Array.isArray(searchColors) ? searchColors : [];
      const searchSizesSafe = Array.isArray(searchSizes) ? searchSizes : [];
      const searchQuerySafe = typeof searchQuery === 'string' ? searchQuery : '';
      const filteredProducts = (catalogProducts || products || [])
        .map(p => ({ p, score: scoreProduct(p, searchQuerySafe) }))
        .filter(({ p, score }) => {
          const q = searchQuerySafe.trim();
          const matchQ = !q || score > 0;
          const cat = p.category || '';
          const matchC = searchCatsSafe.length === 0 || searchCatsSafe.some(c => cat === c || cat.includes(String(c).replace('پیراهن ', '')));
          const matchColor = searchColorsSafe.length === 0 || (p.colors || []).some(c => searchColorsSafe.includes(c.name));
          const matchSize = searchSizesSafe.length === 0 || (p.sizes || []).some(s => searchSizesSafe.includes(s));
          return matchQ && matchC && matchColor && matchSize;
        })
        .sort((a, b) => b.score - a.score)
        .map(({ p }) => p);

      const allColors = [...new Set((catalogProducts || products || []).flatMap(p => (p.colors || []).map(c => c.name)))];
      const isSearchActive = !!(searchQuerySafe.trim() || searchCatsSafe.length > 0 || searchColorsSafe.length > 0 || searchSizesSafe.length > 0);

      const TREND_QUERIES = ['پیراهن رسمی', 'لینن', 'آستین کوتاه', 'سفید', 'چهارخانه', 'کروات'];
      const searchCategorySuggestions = ['رسمی', 'کروات', 'آستین کوتاه'].filter(c => {
        const q = normalizeSearch(searchQuery);
        return !q || normalizeSearch(c).includes(q) || normalizeSearch(`پیراهن ${c}`).includes(q);
      });
      const searchBrandSuggestions = [...new Set((Array.isArray(products)?products:[]).map(p => p.seller?.name).filter(Boolean))]
        .filter(b => {
          const q = normalizeSearch(searchQuery);
          return !q || normalizeSearch(b).includes(q);
        })
        .slice(0, 4);

      const pushRecentSearch = (q) => {
        const t = (q || '').trim();
        if (!t) return;
        setRecentSearches(prev => {
          const next = [t, ...prev.filter(x => x !== t)].slice(0, 8);
          try { localStorage.setItem('recentSearches', JSON.stringify(next)); } catch (_) {}
          return next;
        });
      };
      const removeRecentSearch = (q) => {
        setRecentSearches(prev => {
          const next = prev.filter(x => x !== q);
          try { localStorage.setItem('recentSearches', JSON.stringify(next)); } catch (_) {}
          return next;
        });
      };
      const clearRecentSearches = () => {
        setRecentSearches([]);
        try { localStorage.removeItem('recentSearches'); } catch (_) {}
      };
      const submitSearch = (q) => {
        const query = (q != null ? q : searchQuery).trim();
        setSearchSuggestOpen(false);
        setSearchActiveIdx(-1);
        setCatOpen(false);
        if (query) {
          setSearchQuery(query);
          pushRecentSearch(query);
        }
        const cats = Array.isArray(searchCategories) ? searchCategories.filter(Boolean) : [];
        const colors = Array.isArray(searchColors) ? searchColors.filter(Boolean) : [];
        const sizes = Array.isArray(searchSizes) ? searchSizes.filter(Boolean) : [];
        openPLP({
          query: query || '',
          cats,
          colors,
          sizes,
          keepSort: true,
        });
      };
      const didYouMean = (() => {
        const q = normalizeSearch(searchQuery);
        if (!q || filteredProducts.length > 0) return null;
        const pool = [...TREND_QUERIES, ...products.map(p => p.name), ...products.map(p => p.category)];
        let best = null, bestScore = 0;
        pool.forEach(cand => {
          const c = normalizeSearch(cand);
          if (!c) return;
          let s = 0;
          if (c.includes(q) || q.includes(c)) s = 10;
          const qa = [...q], ca = [...c];
          // simple char overlap
          const setc = new Set(ca);
          s += qa.filter(ch => setc.has(ch)).length * 0.5;
          if (s > bestScore) { bestScore = s; best = cand; }
        });
        return bestScore >= 4 ? best : null;
      })();

      const catLabelMap = {
        'رسمی': 'پیراهن رسمی مردانه',
        'کروات': 'پیراهن کروات مردانه',
        'آستین کوتاه': 'پیراهن آستین کوتاه مردانه',
      };
      /**
       * تنها نقطهٔ ورود به لیست محصولات (فروشگاه + همهٔ دسته‌ها).
       * opts.cat → هر نام دسته (فعلی/آینده)؛ همیشه همان ساختار PLP.
       * opts.query → جستجو روی همان PLP.
       * صفحهٔ جدا برای دسته نسازید — از openCategory / openPLP استفاده کنید.
       */
      const openPLP = (opts = {}) => {
        beginPageLoad('shop');
        closeStaticPage();
        const alreadyOnPlp = !!showPLP && !opts.forceSkeleton;
        setPdpProduct(null);
        setShowPLP(true);
        setShowTaxonomyHub(null);
        setShowCartPage(false);
        setShowCheckout(false);
        setShowWishlistPage(false);
        setShowRecentPage(false);
        setShowComparePage(false);
        setShowProfilePage(false);
        setShowSellerPanel(false);
        setShowAdminPanel(false);
        setShowSellersList(false);
        setActiveSellerId(null);
        setMobileMenuOpen(false);
        setMegaOpen(null);
        setCatOpen(false);
        if (!alreadyOnPlp) setPlpVisible(8);
        // اسکلتون فقط ورود اول — نه با هر رفرش کاتالوگ
        if (!alreadyOnPlp && !opts.silent) {
          setPlpSkeleton(true);
          setTimeout(() => setPlpSkeleton(false), 350);
        }

        // دسته: همیشه فیلتر روی همان PLP — بدون صفحهٔ جدا
        if (opts.cat !== undefined) {
          const key = normalizeCategoryKey(opts.cat);
          setPlpCats(key ? [key] : []);
          setPlpTagFilter([]);
        } else if (!opts.query && opts.tag === undefined && opts.cats === undefined) {
          // فروشگاه عمومی بدون cat → همه محصولات
          setPlpCats([]);
          if (!opts.keepTags) setPlpTagFilter([]);
        }
        if (opts.tag !== undefined) {
          const t = (adminTags || []).find((x) => x.name === opts.tag || x.slug === opts.tag);
          setPlpTagFilter([t?.name || String(opts.tag)]);
          setPlpCats([]);
        }
        if (opts.query != null) setPlpQuery(opts.query);
        else if (opts.cat !== undefined && !opts.keepQuery) setPlpQuery('');
        if (opts.sort !== undefined) setPlpSort(opts.sort || '');
        else if (!opts.keepSort && (opts.cat !== undefined || opts.tag !== undefined || opts.query != null)) setPlpSort('');

        // فیلترهای سرچ هدر → PLP
        if (opts.cats !== undefined) {
          const arr = Array.isArray(opts.cats) ? opts.cats.filter(Boolean) : [];
          setPlpCats(arr);
          if (arr.length) setPlpTagFilter([]);
        }
        if (opts.colors !== undefined) {
          setPlpColors(Array.isArray(opts.colors) ? opts.colors.filter(Boolean) : []);
        }
        if (opts.sizes !== undefined) {
          setPlpSizes(Array.isArray(opts.sizes) ? opts.sizes.filter(Boolean) : []);
        }

        try {
          if (!opts.silent) {
            if (opts.cat && !opts.tag && !opts.query) {
              pushFaUrl(pathForCategory(opts.cat), { plp: true, cat: opts.cat });
            } else {
              pushFaUrl(pathForShop({ cat: opts.cat, tag: opts.tag, query: opts.query, sort: opts.sort }), { plp: true });
            }
          }
        } catch (_) {}
        // همیشه از بالای صفحه (هدر) باز شود — نه نزدیک فوتر
        scrollPageToTop();
      };
      /** میانبر صریح: باز کردن هر دسته روی همان ساختار فروشگاه/PLP */
      const openCategory = (catName) => openPLP({ cat: catName });
      /** صفحهٔ هر برچسب — ساختار PLP، همیشه noindex */
      const openTagPage = (tagNameOrSlug) => {
        const t = (adminTags || []).find(
          (x) => x.name === tagNameOrSlug || x.slug === tagNameOrSlug || x.id === tagNameOrSlug
        );
        const name = t?.name || String(tagNameOrSlug);
        setShowTaxonomyHub(null);
        setShowPLP(true);
        setShowCartPage(false);
        setShowCheckout(false);
        setShowWishlistPage(false);
        setShowRecentPage(false);
        setShowComparePage(false);
        setShowProfilePage(false);
        setShowSellerPanel(false);
        setShowAdminPanel(false);
        setPdpProduct(null);
        setShowSellersList(false);
        setActiveSellerId(null);
        setMobileMenuOpen(false);
        setPlpCats([]);
        setPlpTagFilter([name]);
        setPlpVisible(8);
        try {
          const url = new URL(window.location.href);
          ['plp', 'cat', 'seller', 'sellers', 'cart', 'wishlist', 'compare', 'recent', 'hub'].forEach((k) => url.searchParams.delete(k));
          url.searchParams.set('tag', t?.slug || slugifyTaxonomy(name));
          window.history.pushState({ tag: true }, '', url.pathname + '?' + url.searchParams.toString());
        } catch (_) {}
        window.scrollTo({ top: 0, behavior: 'instant' });
      };
      /** فهرست همه دسته‌ها یا همه برچسب‌ها */
      const openTaxonomyHub = (kind) => {
        beginPageLoad(kind === 'tags' ? 'tags' : 'categories');
        // kind: 'categories' | 'tags'
        setShowTaxonomyHub(kind);
        setShowPLP(false);
        setShowCartPage(false);
        setShowCheckout(false);
        setShowWishlistPage(false);
        setShowRecentPage(false);
        setShowComparePage(false);
        setShowProfilePage(false);
        setShowSellerPanel(false);
        setShowAdminPanel(false);
        setPdpProduct(null);
        setShowSellersList(false);
        setActiveSellerId(null);
        setMobileMenuOpen(false);
        try {
          const url = new URL(window.location.href);
          ['plp', 'cat', 'tag', 'seller', 'sellers', 'cart', 'wishlist', 'compare', 'recent'].forEach((k) => url.searchParams.delete(k));
          url.searchParams.set('hub', kind === 'tags' ? 'tags' : 'categories');
          pushFaUrl(kind === 'tags' ? FA_PATHS.tags : FA_PATHS.categories, { hub: kind });
        } catch (_) {}
        window.scrollTo({ top: 0, behavior: 'instant' });
      };
      const closePLP = () => {
        setShowPLP(false);
        leaveCurrentPage();
      };
      const openCartPage = () => {
        beginPageLoad('cart');
        closeStaticPage();
        setCartOpen(false);
        setWishlistOpen(false);
        setCompareOpen(false);
        setRecentOpen(false);
        // B1: اگر لاگین است سبد را از سرور تازه کن
        try {
          const u = user || (typeof readSessionUser === 'function' ? readSessionUser('buyerUser') : null);
          if (u) {
            setServerCartEnabled(true);
            void syncCartFromServer();
            void syncWishlistFromServer();
          }
        } catch (_) {}
        setShowCartPage(true);
        setShowWishlistPage(false);
        setShowComparePage(false);
        setShowRecentPage(false);
        setShowProfilePage(false);
        setShowSellerPanel(false);
        setShowAdminPanel(false);
        setPdpProduct(null);
        setShowPLP(false);
        setShowSellersList(false);
        setActiveSellerId(null);
        setMobileMenuOpen(false);
        setMegaOpen(null);
        try {
          const url = new URL(window.location.href);
          ['plp','cat','seller','sellers','recent','wishlist','compare','profile','sellerPanel'].forEach(k => url.searchParams.delete(k));
          url.searchParams.set('cart', '1');
          pushFaUrl(FA_PATHS.cart, { cart: true });
        
        try { applyPathRef.current(); } catch (_) {}} catch (_) {}
        window.scrollTo({ top: 0, behavior: 'instant' });
      };
      const closeCartPage = () => {
        setShowCartPage(false);
        leaveCurrentPage();
      };
      const openCheckout = (opts = {}) => {
        beginPageLoad('checkout');
        try { setShowSellersList(false); } catch (_) {}
        if (cart.length === 0) {
          openCartPage();
          return;
        }
        // userOverride: بعد از لاگین همان لحظه (قبل از re-render) معتبر است
        const activeUser = opts.userOverride || user || readSessionUser('buyerUser');
        if (!activeUser) {
          openAuth({ type: 'checkout' });
          return;
        }
        // اگر از localStorage آمده و state هنوز خالی است، همگام کن
        if (!user && activeUser) setUser(activeUser);
        setAuthOpen(false);
        setShowCartPage(false);
        setShowCheckout(true);
        setOrderSuccess(null);
        setOrderFailed(null);
        setPendingPayOrder(null);
        setCheckoutStep(0);
        setCheckoutErrors({});
        setCheckoutPlacing(false);
        setCheckoutContact({
          firstName: activeUser.firstName || '',
          lastName: activeUser.lastName || '',
          phone: activeUser.phone || '',
          email: activeUser.email || '',
        });
        const addrs = addresses || [];
        const def = addrs.find(a => a.isDefault) || addrs[0];
        setCheckoutSelectedAddressId(def ? def.id : null);
        setCheckoutUseNewAddress(addrs.length === 0);
        setCheckoutNewAddress({
          title: 'خانه',
          receiver: (activeUser.firstName || '') + (activeUser.lastName ? ' ' + activeUser.lastName : ''),
          phone: activeUser.phone || '',
          province: '',
          city: '',
          address: '',
          postal: '',
          isDefault: addrs.length === 0,
          save: true,
        });
        setCheckoutShippingMethod('post');
        setCheckoutNote('');
        setCheckoutPaymentMethod('online');
        setShowWishlistPage(false);
        setShowComparePage(false);
        setShowProfilePage(false);
        setShowSellerPanel(false);
        setShowAdminPanel(false);
        setPdpProduct(null);
        setShowPLP(false);
        setShowSellersList(false);
        setActiveSellerId(null);
        setMobileMenuOpen(false);
        setCartOpen(false);
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete('cart');
          url.searchParams.set('checkout', '1');
          pushFaUrl(FA_PATHS.checkout, { checkout: true });
        } catch (_) {}
        window.scrollTo({ top: 0, behavior: 'instant' });
      };
      const closeCheckout = () => {
        setShowCheckout(false);
        setOrderSuccess(null);
        leaveCurrentPage();
      };
      /** روش‌های ارسال فعال ادمین ∩ انتخاب‌شده توسط فروشنده(های) سبد */
      const getSellerEnabledShippingIds = () => {
        // اگر فروشنده لاگین/محصول سبد فروشنده خاصی دارد از shippingMethodIds او استفاده می‌شود
        const fromCart = [];
        (cart || []).forEach((item) => {
          const sid = item.seller?.id;
          // sellerUser فعلی یا متادیتای محصول
          if (item.sellerShippingMethods) fromCart.push(...item.sellerShippingMethods);
        });
        try {
          const su = JSON.parse(localStorage.getItem('sellerUser') || 'null');
          if (su?.shippingMethodIds?.length) return su.shippingMethodIds;
        } catch (_) {}
        // پیش‌فرض: همه روش‌های فعال ادمین تا فروشنده انتخاب نکرده
        return (adminShippingMethods || []).filter((m) => m.enabled !== false).map((m) => m.id);
      };

      const getShippingOptions = () => {
        const allowed = new Set(getSellerEnabledShippingIds());
        return (adminShippingMethods || [])
          .filter((m) => m.enabled !== false && allowed.has(m.id))
          .map((m) => {
            const isDynamic = m.priceMode === 'dynamic_cod';
            // قیمت تقریبی لحظه‌ای برای داینامیک (شبیه‌سازی تا اتصال API واقعی)
            const liveEstimate = isDynamic
              ? 35000
              : Number(m.baseCost) || 0;
            return {
              id: m.id,
              label: m.name,
              desc: isDynamic ? 'قیمت همین لحظه (تقریبی) · تسویه در مقصد' : (m.eta || ''),
              cost: isDynamic ? liveEstimate : Number(m.baseCost) || 0,
              eta: m.eta || '',
              priceMode: m.priceMode || 'fixed',
              note: m.note || '',
              disabled: false,
              chargeAtCheckout: !isDynamic,
            };
          });
      };
      const getCheckoutShippingCost = () => {
        const opts = getShippingOptions();
        if (!opts.length) return 0;
        const m = opts.find((o) => o.id === checkoutShippingMethod) || opts[0];
        // داینامیک: در تسویه ۰ (پرداخت در مقصد) — فقط نمایش برآورد
        if (m.priceMode === 'dynamic_cod') return 0;
        return m.cost;
      };
      const getCheckoutTaxRate = () => {
        const r = Number(adminSettings?.taxRate);
        if (r > 0) return r / 100;
        return 0.09;
      };
      const getCheckoutTotals = () => {
        const subtotal = cartSubtotal;
        const discount = couponDiscount;
        const afterCoupon = Math.max(0, subtotal - discount);
        const shipping = getCheckoutShippingCost();
        const taxRate = getCheckoutTaxRate();
        const tax = Math.round(afterCoupon * taxRate);
        const payable = afterCoupon + shipping + tax;
        return { subtotal, discount, productSavings: cartProductSavings, shipping, tax, taxRate, payable, afterCoupon };
      };
      const validateCheckout = () => {
        const errs = {};
        if (!checkoutContact.firstName?.trim()) errs.firstName = 'نام الزامی است';
        if (!checkoutContact.phone || !/^09\d{9}$/.test(onlyDigits(checkoutContact.phone))) errs.phone = 'موبایل معتبر (۱۱ رقم با ۰۹) الزامی است';
        if (checkoutUseNewAddress || !(addresses || []).length) {
          
      const buildAddressLine = (addr) => {
        const parts = [];
        if (addr?.street?.trim()) parts.push('خیابان ' + addr.street.trim());
        if (addr?.plaque?.trim()) parts.push('پلاک ' + addr.plaque.trim());
        if (addr?.unit?.trim()) parts.push('واحد (زنگ) ' + addr.unit.trim());
        if (addr?.address?.trim()) parts.push(addr.address.trim());
        return parts.join('، ');
      };

      if (!checkoutNewAddress.receiver?.trim()) errs.receiver = 'نام گیرنده الزامی است';
          if (!checkoutNewAddress.phone || !/^09\d{9}$/.test(onlyDigits(checkoutNewAddress.phone))) errs.receiverPhone = 'موبایل گیرنده معتبر نیست';
          if (!checkoutNewAddress.province?.trim()) errs.province = 'استان الزامی است';
          if (!checkoutNewAddress.city?.trim()) errs.city = 'شهر الزامی است';
          if (!checkoutNewAddress.street?.trim()) errs.street = 'خیابان الزامی است';
          if (!checkoutNewAddress.plaque?.trim()) errs.plaque = 'پلاک الزامی است';
          if (!checkoutNewAddress.unit?.trim()) errs.unit = 'واحد (زنگ) الزامی است';
          if (!checkoutNewAddress.postal?.trim() || onlyDigits(checkoutNewAddress.postal).length !== 10) errs.postal = 'کد پستی ۱۰ رقمی الزامی است';
          // نقشه اختیاری — اگر آماده نبود مانع ثبت سفارش سرور نمی‌شود
        } else if (!checkoutSelectedAddressId) {
          errs.address = 'یک آدرس انتخاب کنید';
        }
        const shipOpts = getShippingOptions();
        const ship = shipOpts.find(o => o.id === checkoutShippingMethod);
        if (!ship || ship.disabled) errs.shipping = 'روش ارسال معتبر انتخاب کنید';
        if (cart.length === 0) errs.cart = 'سبد خالی است';
        setCheckoutErrors(errs);
        return Object.keys(errs).length === 0;
      };
      const buildCheckoutOrderDraft = () => {
        const totals = getCheckoutTotals();
        const shipOpts = getShippingOptions();
        const shipMethod = shipOpts.find(o => o.id === checkoutShippingMethod) || shipOpts[0];
        let addrObj;
        if (checkoutUseNewAddress || !(addresses || []).length) {
          addrObj = {
            title: checkoutNewAddress.title || 'آدرس',
            receiver: checkoutNewAddress.receiver.trim(),
            phone: onlyDigits(checkoutNewAddress.phone),
            province: checkoutNewAddress.province.trim(),
            city: checkoutNewAddress.city.trim(),
            address: buildAddressLine(checkoutNewAddress),
            postal: onlyDigits(checkoutNewAddress.postal),
          };
          if (checkoutNewAddress.save) {
            const newId = 'addr' + Date.now();
            const nextAddr = {
              id: newId,
              ...addrObj,
              isDefault: checkoutNewAddress.isDefault || !(addresses || []).length,
            };
            let list = [...(addresses || [])];
            if (nextAddr.isDefault) list = list.map(a => ({ ...a, isDefault: false }));
            list.push(nextAddr);
            setAddresses(list);
            /* no localStorage (strict buyer) */
          }
        } else {
          const a = (addresses || []).find(x => x.id === checkoutSelectedAddressId);
          addrObj = a ? { title: a.title, receiver: a.receiver, phone: a.phone, province: a.province, city: a.city, address: a.address, postal: a.postal } : null;
        }
        const now = new Date();
        const shamsiApprox = `۱۴۰${String((now.getFullYear() - 2021) % 10)}/${String(now.getMonth() + 1).padStart(2, '۰').replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])}/${String(now.getDate()).padStart(2, '۰').replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])}`;
        const orderId = `ORD-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(Math.floor(Math.random()*900)+100)}`;
        const orderItems = cart.map(i => ({
          id: i.id,
          name: i.name,
          color: i.selectedColor?.name || '',
          size: i.selectedSize || i.size || 'M',
          qty: i.qty,
          price: i.price,
          image: i.selectedColor?.image || i.image,
          seller: (i.seller?.name) || (products.find(p => p.id === i.id)?.seller?.name) || 'فروشگاه مرکزی',
        }));
        // کارمزد پلتفرم روی مبلغ کالا بعد از تخفیف (قیمت فروش × تعداد − کد هدیه فروشنده) — بدون هزینه ارسال
        const goodsAmount = Math.max(0, totals.payable - (totals.shipping || 0));
        const platformFee = Math.round(goodsAmount * 0.08);
        const sellerShare = goodsAmount - platformFee;
        return {
          id: orderId,
          date: shamsiApprox,
          status: 'pending_payment',
          statusLabel: 'در انتظار پرداخت',
          total: totals.payable,
          buyerName: `${checkoutContact.firstName} ${checkoutContact.lastName || ''}`.trim(),
          buyerPhone: onlyDigits(checkoutContact.phone),
          items: orderItems,
          shipping: {
            receiver: addrObj?.receiver || checkoutContact.firstName,
            phone: addrObj?.phone || checkoutContact.phone,
            address: addrObj ? `${addrObj.province}، ${addrObj.city}، ${addrObj.address}${addrObj.postal ? ' — کدپستی ' + addrObj.postal : ''}` : '',
            method: shipMethod.label,
            cost: totals.shipping,
          },
          payment: { method: 'سفارش', discount: totals.discount, tax: totals.tax, amount: totals.payable, status: 'pending' },
          totals: { subtotal: totals.subtotal, discount: totals.discount, shipping: totals.shipping, tax: totals.tax, payable: totals.payable },
          settlement: { platformFeePercent: 8, platformFee, sellerShare, feeBase: 'after_discount', shippingOnSeller: true, taxOnSeller: true },
          coupon: couponApplied ? { code: couponApplied.code, amount: totals.discount } : null,
          note: checkoutNote.trim() || '',
          tracking: null,
          timeline: [
            { label: 'ثبت سفارش', done: true, date: shamsiApprox },
            { label: 'پرداخت', done: false, date: '' },
            { label: 'آماده‌سازی', done: false, date: '' },
            { label: 'ارسال', done: false, date: '' },
            { label: 'تحویل', done: false, date: '' },
          ],
          history: [{ label: 'ثبت سفارش — در انتظار پرداخت', date: shamsiApprox }],
          adminNote: '',
          payDeadline: Date.now() + 30 * 60 * 1000,
        };
      };

      const finalizePaidOrder = (draft) => {
        const shamsi = draft.date;
        const order = {
          ...draft,
          status: 'pending',
          statusLabel: 'در انتظار تأیید / آماده‌سازی',
          payment: { ...draft.payment, status: 'paid', method: 'پرداخت آنلاین (تأیید شده)' },
          timeline: draft.timeline.map((t, i) => i <= 1 ? { ...t, done: true, date: t.date || shamsi } : t),
          history: [...(draft.history || []), { label: 'پرداخت موفق', date: shamsi }],
        };
        const nextOrders = [order, ...(orders || []).filter(o => o.id !== order.id)];
        saveBuyerOrders(nextOrders);
        const _sellerName = order.items?.[0]?.seller?.name || order.items?.[0]?.sellerName || order.settlement?.sellerName || 'فروشگاه';
        const _sellerPhone = order.items?.[0]?.seller?.phone || order.settlement?.sellerPhone || '';
        const _sellerOwner = order.items?.[0]?.seller?.ownerName || order.settlement?.sellerOwner || '';
        const adminOrder = {
          id: order.id,
          date: shamsi,
          status: 'pending',
          statusLabel: 'در انتظار تأیید',
          buyerName: order.buyerName,
          buyerPhone: order.buyerPhone,
          total: order.total,
          items: order.items.map(it => ({ name: it.name, seller: it.seller, sellerName: it.seller?.name || it.sellerName, qty: it.qty, price: it.price })),
          address: order.shipping.address,
          payment: 'آنلاین',
          platformFee: order.settlement?.platformFee,
          sellerShare: order.settlement?.sellerShare,
          sellerName: _sellerName,
          sellerPhone: _sellerPhone,
          sellerOwner: _sellerOwner,
          sellerEmail: order.settlement?.sellerEmail || '',
          tracking: null,
          history: order.history,
          adminNote: '',
        };
        const nextAdminOrders = [adminOrder, ...(adminOrders || [])];
        setAdminOrders(nextAdminOrders);
        try { localStorage.setItem('adminOrders', JSON.stringify(nextAdminOrders)); } catch (_) {}
        try {
          const existingSellerOrders = (() => { try { return JSON.parse(localStorage.getItem('sellerOrders') || 'null'); } catch { return null; } })() || sellerOrders || [];
          const sellerOrd = {
            id: order.id,
            date: shamsi,
            status: 'pending',
            statusLabel: 'جدید',
            buyerName: order.buyerName,
            total: order.total,
            sellerShare: order.settlement?.sellerShare,
            platformFee: order.settlement?.platformFee,
            items: order.items,
            address: order.shipping.address,
            shippingMethod: order.shipping.method,
          };
          const nextSO = [sellerOrd, ...(Array.isArray(existingSellerOrders) ? existingSellerOrders : [])];
          setSellerOrders(nextSO);
          localStorage.setItem('sellerOrders', JSON.stringify(nextSO));
        } catch (_) {}
        if (couponApplied && couponApplied.code) {
          markPromoCodeUsed(couponApplied.code);
        }
        const notif = {
          id: 'n' + Date.now(),
          type: 'order',
          title: 'پرداخت موفق',
          body: `سفارش ${order.id} پرداخت شد. مبلغ ${formatPrice(order.total)} تومان. آماده‌سازی ۱–۲ روز کاری.`,
          date: shamsi,
          read: false,
        };
        const nextNotifs = [notif, ...(notifications || [])];
        setNotifications(nextNotifs);
        /* no localStorage (strict buyer) */
        setCart([]);
        setCouponApplied(null);
        setCouponInput('');
        setCouponMsg(null);
        try { localStorage.setItem('cart', JSON.stringify([])); } catch (_) {}
        setPendingPayOrder(null);
        setOrderFailed(null);
        setOrderSuccess(order);
        setCheckoutPlacing(false);
        pushLiveToast(`پرداخت موفق — سفارش ${order.order_number || order.id}`, { type: 'success', duration: 4500 });
        // تازه‌سازی لیست سفارش از سرور
        try {
          import('@/lib/api/orders').then(({ apiGetOrders }) =>
            apiGetOrders().then((res) => {
              if (res?.ok && Array.isArray(res.mapped)) saveBuyerOrders(res.mapped);
            })
          );
        } catch (_) {}
        window.scrollTo({ top: 0, behavior: 'instant' });
      };

      const placeOrder = () => {
        if (typeof checkoutStep === 'number' && checkoutStep !== 3) {
          showToast?.({ message: 'لطفاً مراحل تسویه را تا پرداخت کامل کنید', variant: 'default', duration: 4000, position: 'top-center' });
          return;
        }

        if (checkoutPlacing) return;
        if (!(user || readSessionUser('buyerUser'))) { openAuth({ type: 'checkout' }); return; }
        if (cart.length === 0) { closeCheckout(); openCartPage(); return; }
        if (!validateCheckout()) {
          const firstErr = document.querySelector('[data-checkout-error]');
          if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        setCheckoutPlacing(true);
        setOrderFailed(null);

        (async () => {
          try {
            const { apiCreateOrder, apiPaymentInitiate } = await import('@/lib/api/orders');
            const totals = getCheckoutTotals();
            const shipOpts = getShippingOptions();
            const shipMethod = shipOpts.find(o => o.id === checkoutShippingMethod) || shipOpts[0];

            let addrObj;
            if (checkoutUseNewAddress || !(addresses || []).length) {
              addrObj = {
                title: checkoutNewAddress.title || 'آدرس',
                full_name: checkoutNewAddress.receiver?.trim() || checkoutContact.firstName,
                receiver_name: checkoutNewAddress.receiver?.trim(),
                receiver: checkoutNewAddress.receiver?.trim(),
                phone: onlyDigits(checkoutNewAddress.phone || checkoutContact.phone),
                province: checkoutNewAddress.province?.trim(),
                city: checkoutNewAddress.city?.trim(),
                address_line: buildAddressLine(checkoutNewAddress),
                address: buildAddressLine(checkoutNewAddress),
                postal_code: onlyDigits(checkoutNewAddress.postal || ''),
                postal: onlyDigits(checkoutNewAddress.postal || ''),
              };
            } else {
              const a = (addresses || []).find(x => x.id === checkoutSelectedAddressId);
              addrObj = a
                ? {
                    title: a.title,
                    full_name: a.receiver || a.full_name,
                    receiver: a.receiver,
                    phone: a.phone,
                    province: a.province,
                    city: a.city,
                    address_line: a.address || a.address_line,
                    address: a.address || a.address_line,
                    postal_code: a.postal || a.postal_code,
                    postal: a.postal || a.postal_code,
                  }
                : null;
            }

            const orderRes = await apiCreateOrder({
              contact: {
                firstName: checkoutContact.firstName,
                lastName: checkoutContact.lastName || '',
                phone: onlyDigits(checkoutContact.phone),
              },
              address_snapshot: addrObj,
              shipping_method: shipMethod?.id || checkoutShippingMethod || 'post',
              shipping_cost: totals.shipping || 0,
              payment_method: checkoutPaymentMethod || 'online',
              discount: totals.discount || 0,
              note: (checkoutNote || '').trim() || undefined,
            });

            if (!orderRes?.ok || !orderRes.order?.id) {
              throw new Error(orderRes?.error || 'ثبت سفارش ناموفق');
            }

            const srv = orderRes.order;
            const payRes = await apiPaymentInitiate(srv.id);
            if (!payRes?.ok) {
              throw new Error(payRes?.error || 'ایجاد درخواست پرداخت ناموفق');
            }

            const draft = {
              ...buildCheckoutOrderDraft(),
              id: srv.id,
              order_number: srv.order_number,
              serverOrderId: srv.id,
              status: srv.status || 'pending_payment',
              statusLabel: 'در انتظار پرداخت',
              total: Number(srv.total ?? srv.payable ?? totals.payable) || totals.payable,
              payment: {
                method: payRes.mode === 'mock' ? 'ثبت آزمایشی' : 'ثبت سفارش',
                status: 'pending',
                authority: payRes.authority || null,
                mode: payRes.mode || 'mock',
              },
              authority: payRes.authority || null,
              payment_url: payRes.payment_url || null,
              fromServer: true,
            };

            const nextOrders = [draft, ...(orders || []).filter(o => o.id !== draft.id)];
            saveBuyerOrders(nextOrders);
            setPendingPayOrder(draft);

            // سبد سرور بعد از ثبت سفارش خالی شده — UI را هم خالی کن
            try {
              await clearCartServer();
            } catch (_) {}
            setCart([]);

            if (payRes.mode === 'zarinpal' && payRes.payment_url) {
              pushLiveToast('در حال ثبت سفارش...', { type: 'info' });
              window.location.href = payRes.payment_url;
              return;
            }

            pushLiveToast('سفارش ثبت شد — پرداخت آزمایشی را تأیید کنید', { type: 'success' });
            window.scrollTo({ top: 0, behavior: 'instant' });
          } catch (e) {
            const msg = String(e?.message || e || 'خطا در ثبت سفارش');
            pushLiveToast(msg, { type: 'error' });
            setOrderFailed({ orderId: null, reason: msg, amount: getCheckoutTotals().payable });
          } finally {
            setCheckoutPlacing(false);
          }
        })();
      };

      const confirmPaymentSuccess = () => {
        if (!pendingPayOrder) return;
        setCheckoutPlacing(true);
        (async () => {
          try {
            if (pendingPayOrder.fromServer || pendingPayOrder.serverOrderId) {
              const { apiPaymentVerify } = await import('@/lib/api/orders');
              const orderId = pendingPayOrder.serverOrderId || pendingPayOrder.id;
              const ver = await apiPaymentVerify({
                orderId,
                authority: pendingPayOrder.authority || pendingPayOrder.payment?.authority,
                status: 'OK',
              });
              if (!ver?.ok && !ver?.redirected) {
                throw new Error(ver?.error || 'تأیید پرداخت ناموفق');
              }
              const paidOrder = {
                ...pendingPayOrder,
                status: 'paid',
                statusLabel: 'پرداخت شده',
                total: ver?.order?.total ?? pendingPayOrder.total,
                payment: {
                  ...pendingPayOrder.payment,
                  status: 'paid',
                  method: 'پرداخت آنلاین (تأیید شده)',
                  ref: ver?.order?.payment_ref || pendingPayOrder.authority,
                },
              };
              finalizePaidOrder(paidOrder);
              return;
            }
            finalizePaidOrder(pendingPayOrder);
          } catch (e) {
            pushLiveToast(String(e?.message || e), { type: 'error' });
            setCheckoutPlacing(false);
          }
        })();
      };

      const confirmPaymentFail = () => {
        if (!pendingPayOrder) return;
        const failed = {
          ...pendingPayOrder,
          status: 'pending_payment',
          statusLabel: 'در انتظار پرداخت',
          payment: { ...pendingPayOrder.payment, status: 'failed' },
          history: [...(pendingPayOrder.history || []), { label: 'پرداخت ناموفق / انصراف', date: pendingPayOrder.date }],
        };
        const nextOrders = [failed, ...(orders || []).filter(o => o.id !== failed.id)];
        saveBuyerOrders(nextOrders);
        setOrderFailed({ orderId: failed.id, reason: 'پرداخت توسط بانک تأیید نشد یا کاربر انصراف داد.', amount: failed.total });
        setPendingPayOrder(null);
        setCheckoutPlacing(false);
      };
      const openWishlistPage = () => {
        beginPageLoad('wishlist');
        closeStaticPage();
        setWishlistOpen(false);
        setCompareOpen(false);
        setCartOpen(false);
        setShowWishlistPage(true);
        setShowCartPage(false);
        setShowCheckout(false);
        setShowComparePage(false);
        setShowRecentPage(false);
        setShowProfilePage(false);
        setShowSellerPanel(false);
        setShowAdminPanel(false);
        setPdpProduct(null);
        setShowPLP(false);
        setShowSellersList(false);
        setActiveSellerId(null);
        setMobileMenuOpen(false);
        setMegaOpen(null);
        try {
          const url = new URL(window.location.href);
          ['plp','cat','seller','sellers','cart','compare','recent','tag'].forEach(k => url.searchParams.delete(k));
          url.searchParams.set('wishlist', '1');
          pushFaUrl(FA_PATHS.wishlist, { wishlist: true });
        
        try { applyPathRef.current(); } catch (_) {}} catch (_) {}
        window.scrollTo({ top: 0, behavior: 'instant' });
      };
      /** صفحه اخیراً دیده‌شده — بدون لنگر؛ صفحهٔ مستقل */
      const openRecentPage = () => {
        beginPageLoad('recent');
        closeStaticPage();
        setShowRecentPage(true);
        setShowWishlistPage(false);
        setShowComparePage(false);
        setShowCartPage(false);
        setShowCheckout(false);
        setShowProfilePage(false);
        setShowSellerPanel(false);
        setShowAdminPanel(false);
        setPdpProduct(null);
        setShowPLP(false);
        setShowSellersList(false);
        setActiveSellerId(null);
        setMobileMenuOpen(false);
        setMegaOpen(null);
        try {
          const url = new URL(window.location.href);
          ['plp','cat','seller','sellers','cart','compare','wishlist','tag'].forEach(k => url.searchParams.delete(k));
          url.searchParams.set('recent', '1');
          pushFaUrl(FA_PATHS.recent, { recent: true });
        
        try { applyPathRef.current(); } catch (_) {}} catch (_) {}
        window.scrollTo({ top: 0, behavior: 'instant' });
      };
      const closeRecentPage = () => {
        setShowRecentPage(false);
        leaveCurrentPage();
      };
      const closeWishlistPage = () => {
        setShowWishlistPage(false);
        leaveCurrentPage();
      };
      const seedOrders = () => []; /* production: no demo seed */
      const seedAddresses = () => []; /* production: no demo seed */
      const seedNotifications = () => []; /* production: no demo seed */

      const openAuth = (returnTo = null) => {
        // اگر خریدار از قبل لاگین است، دوباره فرم شماره باز نشود
        const existingBuyer = user || readSessionUser('buyerUser');
        if (existingBuyer && (!returnTo || returnTo?.type === 'cart' || returnTo?.type === 'checkout' || returnTo?.type === 'pdp')) {
          // session معتبر است — مستقیم مقصد
          if (!user) setUser(existingBuyer);
          if (returnTo?.type === 'checkout') {
            openCheckout({ userOverride: existingBuyer });
            return;
          }
          if (returnTo?.type === 'cart') {
            openCartPage();
            return;
          }
          if (returnTo?.type === 'pdp' && returnTo.productId) {
            const p = products.find(x => x.id === returnTo.productId);
            if (p) { openPDP(p); return; }
          }
          if (!returnTo) {
            setShowProfilePage(true);
            setProfileTab('dashboard');
            setAuthOpen(false);
            return;
          }
        }
        setAuthMode('buyer');
        setAuthOpen(true);
        setAuthStep('phone');
        setAuthPhone('');
        setAuthEmail('');
        setAuthPassword('');
        setAuthOtp('');
        setAuthName('');
        setAuthLastName('');
        setAuthError('');
        setAuthLoading(false);
        setAuthFailCount(0);
        setDemoOtpCode('');
        setAuthTermsAccepted(true);
        setAuthReturnTo(returnTo);
      };

      const closeAuth = () => { setAuthOpen(false); setAuthError(''); setDemoOtpCode(''); setAuthReturnTo(null); };

      const pushProductView = async (productId) => {
        if (!user || !productId) return;
        try {
          await fetch('/api/recent-views', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ product_id: String(productId) }),
          });
        } catch (_) {}
      };

      const loadAddressesFromServer = async () => {
        try {
          const res = await fetch('/api/addresses', { credentials: 'include' });
          const data = await res.json().catch(() => ({}));
          if (data?.ok && Array.isArray(data.addresses)) {
            setAddresses(data.addresses);
            /* no localStorage (strict buyer) */
          }
        } catch (_) {}
      };

      const saveAddresses = async (next) => {
        const prev = addresses || [];
        setAddresses(next);
        /* no localStorage (strict buyer) */

        try {
          const nextIds = new Set((next || []).map((a) => a.id));
          // حذف از سرور
          for (const a of prev) {
            if (a?.id && !nextIds.has(a.id) && !String(a.id).startsWith('addr')) {
              await fetch('/api/addresses/' + a.id, { method: 'DELETE', credentials: 'include' });
            }
          }

          // ایجاد / ویرایش
          for (const a of next || []) {
            const payload = {
              title: a.title,
              full_name: a.receiver || a.full_name,
              receiver: a.receiver || a.full_name,
              phone: a.phone,
              province: a.province,
              city: a.city,
              address_line: a.address || a.address_line,
              address: a.address || a.address_line,
              postal_code: a.postal || a.postal_code,
              postal: a.postal || a.postal_code,
              is_default: !!(a.isDefault ?? a.is_default),
              isDefault: !!(a.isDefault ?? a.is_default),
              lat: a.lat,
              lng: a.lng,
            };

            if (!a.id || String(a.id).startsWith('addr')) {
              const res = await fetch('/api/addresses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
              });
              const data = await res.json().catch(() => ({}));
              if (!data?.ok) {
                showToast?.({ message: data?.error || 'ذخیره آدرس ناموفق بود', variant: 'default', duration: 4500, position: 'top-center' });
              }
            } else {
              const res = await fetch('/api/addresses/' + a.id, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
              });
              const data = await res.json().catch(() => ({}));
              if (!data?.ok) {
                showToast?.({ message: data?.error || 'به‌روزرسانی آدرس ناموفق بود', variant: 'default', duration: 4500, position: 'top-center' });
              }
            }
          }

          // همگام‌سازی نهایی از سرور
          const listRes = await fetch('/api/addresses', { credentials: 'include' });
          const listData = await listRes.json().catch(() => ({}));
          if (listData?.ok && Array.isArray(listData.addresses)) {
            setAddresses(listData.addresses);
            /* no localStorage (strict buyer) */
          }
        } catch (e) {
          showToast?.({ message: 'خطا در ارتباط با سرور برای آدرس', variant: 'default', duration: 4500, position: 'top-center' });
        }
      };

      const persistSession = (key, u) => {
        const withExp = { ...u, sessionExpires: Date.now() + SESSION_TTL_MS, sessionId: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}` };
        try { localStorage.setItem(key, JSON.stringify(withExp)); } catch (_) {}
        return withExp;
      };


      const REFUND_POLICY_TEXT = 'شرایط بازگشت وجه: در صورت لغو سفارش توسط فروشنده قبل از ارسال، مبلغ ظرف ۱ تا ۳ روز کاری به همان حساب/کارت پرداخت‌کننده برگشت داده می‌شود. هزینه ارسال (در صورت پرداخت) طبق قوانین مرجوعی بررسی می‌شود.';

      const mirrorSellerOrderToBuyer = (sellerOrder, buyerPatch) => {
        try {
          const list = Array.isArray(orders) ? orders : [];
          const next = list.map((bo) => {
            if (String(bo.id) !== String(sellerOrder.id)) return bo;
            return { ...bo, ...buyerPatch };
          });
          if (next.some((bo, i) => bo !== list[i])) saveBuyerOrders(next);
        } catch (_) {}
      };

      const patchOrderStatusOnServer = async (orderId, status, asRole = 'seller') => {
        try {
          const url = asRole === 'admin' ? '/api/admin/orders' : '/api/seller/orders';
          const res = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ id: orderId, status }),
          });
          const json = await res.json().catch(() => ({}));
          return !!(res.ok && json?.ok);
        } catch (_) {
          return false;
        }
      };

      const updateSellerOrderStatus = (orderId, updater) => {
        const list = sellerOrders || [];
        const next = list.map((x) => {
          if (x.id !== orderId) return x;
          return typeof updater === 'function' ? updater(x) : { ...x, ...updater };
        });
        saveSellerOrders(next);
        const updated = next.find((x) => x.id === orderId);
        if (updated?.status) {
          try { patchOrderStatusOnServer(orderId, updated.status, 'seller'); } catch (_) {}
        }
        return updated;
      };

      const hydrateSellerOrdersFromApi = async () => {
        try {
          const res = await fetch('/api/seller/orders', { credentials: 'include', cache: 'no-store' });
          const json = await res.json().catch(() => ({}));
          if (!json?.ok || !Array.isArray(json.orders)) return;
          const mapped = json.orders.map((o) => ({
            id: o.id,
            code: o.order_number,
            status: o.status,
            statusLabel: o.status,
            total: o.payable ?? o.total,
            date: o.created_at,
            items: o.items || [],
            shippingMethod: o.shipping_method,
          }));
          if (typeof setSellerOrders === 'function') setSellerOrders(mapped);
          else if (typeof saveSellerOrders === 'function') saveSellerOrders(mapped);
        } catch (_) {}
      };

      const hydrateAdminStatsFromApi = async () => {
        try {
          const res = await fetch('/api/admin/stats', { credentials: 'include', cache: 'no-store' });
          const json = await res.json().catch(() => ({}));
          if (!json?.ok || !json.stats) return;
          try {
            if (typeof setAdminSettings === 'function') {
              setAdminSettings((prev) => ({ ...(prev || {}), liveStats: json.stats }));
            }
          } catch (_) {
            try { window.__adminLiveStats = json.stats; } catch (__) {}
          }
          return json.stats;
        } catch (_) {}
      };

      const sellerConfirmOrder = (o) => {
        const shamsi = new Date().toLocaleDateString('fa-IR');
        const updated = updateSellerOrderStatus(o.id, (x) => ({
          ...x,
          status: 'preparing',
          statusLabel: 'در حال آماده‌سازی',
          packingDone: false,
          history: [...(x.history || []), { label: 'تأیید فروشنده', date: shamsi }],
        }));
        mirrorSellerOrderToBuyer(updated || o, {
          status: 'processing',
          statusLabel: 'در حال آماده‌سازی',
          timeline: (orders.find((b) => b.id === o.id)?.timeline || []).map((t) =>
            t.label === 'آماده‌سازی' || t.label === 'آماده‌سازي' ? { ...t, done: true, date: shamsi } : t
          ),
          history: [...(orders.find((b) => b.id === o.id)?.history || []), { label: 'تأیید فروشنده — آماده‌سازی', date: shamsi }],
        });
        // fix timeline more carefully
        try {
          const list = Array.isArray(orders) ? orders : [];
          const next = list.map((bo) => {
            if (String(bo.id) !== String(o.id)) return bo;
            const tl = (bo.timeline || []).map((t, i) => {
              if (i <= 2 || /آماده/.test(t.label || '')) return { ...t, done: true, date: t.date || shamsi };
              return t;
            });
            return {
              ...bo,
              status: 'processing',
              statusLabel: 'در حال آماده‌سازی',
              timeline: tl,
              history: [...(bo.history || []), { label: 'تأیید فروشنده — آماده‌سازی', date: shamsi }],
            };
          });
          saveBuyerOrders(next);
        } catch (_) {}
        pushLiveToast('سفارش تأیید شد — در حال آماده‌سازی', { type: 'success' });
      };

      const sellerMarkPackingDone = (o) => {
        const shamsi = new Date().toLocaleDateString('fa-IR');
        updateSellerOrderStatus(o.id, (x) => ({
          ...x,
          packingDone: true,
          statusLabel: 'آماده ارسال',
          history: [...(x.history || []), { label: 'آماده‌سازی تکمیل شد', date: shamsi }],
        }));
        pushLiveToast('می‌توانید ارسال را ثبت کنید', { type: 'info' });
      };

      const sellerShipOrder = (o, code, carrier) => {
        const shamsi = new Date().toLocaleDateString('fa-IR');
        const tracking = {
          code,
          carrier: carrier || 'پست پیشتاز',
          eta: '۲ تا ۴ روز کاری',
          steps: [
            { label: 'ثبت در انبار پست', done: true, date: shamsi },
            { label: 'خروج از مبدأ', done: true, date: shamsi },
            { label: 'در مسیر', done: false, date: '' },
            { label: 'تحویل به گیرنده', done: false, date: '' },
          ],
        };
        const updated = updateSellerOrderStatus(o.id, (x) => ({
          ...x,
          status: 'shipped',
          statusLabel: 'ارسال‌شده',
          tracking,
          packingDone: true,
          history: [...(x.history || []), { label: `ارسال · ${carrier || ''} · ${code}`, date: shamsi }],
        }));
        try {
          const list = Array.isArray(orders) ? orders : [];
          const next = list.map((bo) => {
            if (String(bo.id) !== String(o.id)) return bo;
            const tl = (bo.timeline || []).map((t, i) => {
              if (i <= 3 || /ارسال|آماده|پرداخت|ثبت/.test(t.label || '')) return { ...t, done: true, date: t.date || shamsi };
              return t;
            });
            return {
              ...bo,
              status: 'shipped',
              statusLabel: 'ارسال‌شده',
              tracking,
              timeline: tl,
              history: [...(bo.history || []), { label: `ارسال شد — کد ${code}`, date: shamsi }],
              sellerContact: {
                phone: sellerUser?.phone || o.buyerPhone || '',
                shopName: sellerUser?.shopName || sellerUser?.name || 'فروشنده',
                bale: sellerUser?.bale || sellerUser?.supportBale || (sellerUser?.phone ? `https://ble.ir/${onlyDigits(sellerUser.phone)}` : ''),
              },
            };
          });
          saveBuyerOrders(next);
        } catch (_) {}
        // تیکت خودکار برای خریدار
        try {
          const tkId = typeof makeTicketCode === 'function' ? makeTicketCode() : ('TK' + String(Date.now()).slice(-9));
          const ticket = {
            id: tkId,
            code: tkId,
            type: 'system',
            channel: 'ticket',
            orderId: o.id,
            subject: `ارسال سفارش ${o.id}`,
            status: 'open',
            date: shamsi,
            messages: [{
              from: 'system',
              text: `سفارش شما ارسال شد.\nکد رهگیری: ${code}\nشرکت: ${carrier || '—'}\nاز بخش پیگیری مرسوله می‌توانید وضعیت را ببینید.`,
              date: shamsi,
            }],
          };
          const bt = [ticket, ...(buyerTickets || [])];
          saveBuyerTickets(bt);
          try { mirrorConversationToAdmin(ticket, 'سیستم'); } catch (_) {}
        } catch (_) {}
        setSellerTrackForm({ code: '', carrier: 'پست پیشتاز' });
        pushLiveToast('ارسال ثبت شد — کد رهگیری برای خریدار ارسال شد', { type: 'success' });
      };

      const sellerCancelOrder = (o, reason) => {
        const shamsi = new Date().toLocaleDateString('fa-IR');
        const why = (reason || '').trim() || 'بدون توضیح';
        updateSellerOrderStatus(o.id, (x) => ({
          ...x,
          status: 'cancelled',
          statusLabel: 'لغو‌شده',
          cancelReason: why,
          history: [...(x.history || []), { label: `لغو فروشنده: ${why}`, date: shamsi }],
        }));
        try {
          const list = Array.isArray(orders) ? orders : [];
          const next = list.map((bo) => {
            if (String(bo.id) !== String(o.id)) return bo;
            return {
              ...bo,
              status: 'cancelled',
              statusLabel: 'لغو‌شده توسط فروشنده',
              cancelReason: why,
              refundNote: REFUND_POLICY_TEXT,
              history: [...(bo.history || []), { label: `لغو فروشنده: ${why}`, date: shamsi }, { label: 'شرایط بازگشت وجه', date: shamsi, note: REFUND_POLICY_TEXT }],
            };
          });
          saveBuyerOrders(next);
        } catch (_) {}
        try {
          const notif = {
            id: 'n' + Date.now(),
            type: 'order',
            title: 'لغو سفارش',
            body: `سفارش ${o.id} توسط فروشنده لغو شد. دلیل: ${why}. ${REFUND_POLICY_TEXT}`,
            date: shamsi,
            read: false,
          };
          const nextNotifs = [notif, ...(notifications || [])];
          setNotifications(nextNotifs);
          try { localStorage.setItem('notifications', JSON.stringify(nextNotifs)); } catch (_) {}
        } catch (_) {}
        setSellerCancelForm({ open: false, orderId: null, reason: '' });
        pushLiveToast('سفارش لغو شد', { type: 'error' });
      };

      const sellerOpenOrderTicket = (o) => {
        const shamsi = new Date().toLocaleDateString('fa-IR');
        const list = sellerTickets || [];
        // اگر تیکت باز/قبلی برای همین سفارش هست، همان را باز کن
        const existing = list.find(t => t && String(t.orderId) === String(o.id) && t.status !== 'closed');
        if (existing) {
          setSellerOrderDetailId(null);
          setSellerTicketDetailId(existing.id);
          setSellerTab('support');
          if (existing.unread) {
            try { saveSellerTickets(list.map(x => x.id === existing.id ? { ...x, unread: false } : x)); } catch (_) {}
          }
          pushLiveToast('ادامه گفتگوی سفارش باز شد', { type: 'info' });
          return;
        }
        const tkId = typeof makeTicketCode === 'function' ? makeTicketCode() : (typeof generateTicketCode === 'function' ? generateTicketCode() : ('TK' + String(Date.now()).slice(-9)));
        const ticket = {
          id: tkId,
          code: tkId,
          type: 'buyer',
          channel: 'ticket',
          orderId: o.id,
          subject: `پیگیری سفارش ${o.id}`,
          status: 'open',
          date: shamsi,
          fromName: o.buyerName || 'خریدار',
          buyerName: o.buyerName,
          messages: [{ from: 'seller', text: `گفتگو درباره سفارش ${o.id}`, date: shamsi }],
        };
        saveSellerTickets([ticket, ...list]);
        try { mirrorConversationToAdmin(ticket, 'فروشنده'); } catch (_) {}
        setSellerOrderDetailId(null);
        setSellerTicketDetailId(tkId);
        setSellerTab('support');
        pushLiveToast('تیکت سفارش باز شد', { type: 'info' });
      };


      const finishAuthSuccess = async (mode, u) => {
        setAuthOpen(false);
        setAuthLoading(false);
        setDemoOtpCode('');
        const ret = authReturnTo;
        setAuthReturnTo(null);
        setMobileMenuOpen(false);
        setMegaOpen(null);
        setAuthError('');
        // خریدار فقط وقتی هدف سبد/تسویه باشد → همان‌جا؛ وگرنه مستقیم پنل
        if (mode === 'seller') {
          // تضمین session فروشنده قبل از باز کردن پنل (جلوگیری از رندر بدون sellerUser)
          if (u) {
            try { setSellerUser(u); } catch (_) {}
          // منبع حقیقت سرور
          try { void hydrateSellerFromServer(); } catch (_) {}
          }
          setShowAdminPanel(false);
          setShowProfilePage(false);
          setShowCartPage(false);
          setShowCheckout(false);
          setShowWishlistPage(false);
          setShowComparePage(false);
          setShowPLP(false);
          setShowSellersList(false);
          setPdpProduct(null);
          setActiveSellerId(null);
          setShowSellerPanel(true);
          setSellerTab('dashboard');
          setSellerOrderDetailId(null);
          setSellerTicketDetailId(null);
          setAuthOpen(false);
          pushLiveToast('ورود فروشنده موفق — خوش آمدید', { type: 'success', duration: 2000 });
          try { window.scrollTo({ top: 0, behavior: 'instant' }); } catch (_) { try { window.scrollTo(0, 0); } catch (__) {} }
          // یک فریم بعد دوباره پنل را باز کن تا اگر state قبلی مانع شده بود، قطعی باز شود
          try {
            requestAnimationFrame(() => {
              try { setShowSellerPanel(true); setAuthOpen(false); } catch (_) {}
            });
          } catch (_) {}
          return;
        }
        if (mode === 'admin') {
          const ph = onlyDigits(u?.phone || authPhone || '');
          if (!isAdminPhone(ph)) {
            setAuthError('این شماره به عنوان ادمین تعریف نشده است');
            setAuthOpen(true);
            return;
          }
          const adminU = { name: 'سوپر ادمین', role: 'Super Admin', phone: ph, loggedAt: Date.now() };
          setAdminUser(adminU);
          try { localStorage.setItem('adminUser', JSON.stringify(adminU)); } catch (_) {}
          setShowSellerPanel(false);
          setShowProfilePage(false);
          setShowCartPage(false);
          setShowCheckout(false);
          setShowWishlistPage(false);
          setShowComparePage(false);
          setShowPLP(false);
          setShowSellersList(false);
          setPdpProduct(null);
          setShowAdminPanel(true);
          setAdminTab('dashboard');
          pushFaUrl('/amirshn', { adminPanel: true });
          pushLiveToast('ورود ادمین موفق', { type: 'success', duration: 2000 });
          try { window.scrollTo({ top: 0, behavior: 'instant' }); } catch (_) { try { window.scrollTo(0, 0); } catch (__) {} }
          return;
        }
        // خریدار — فقط یک‌بار لاگین؛ اگر هدف سبد/تسویه بود همان‌جا ادامه
        setShowSellerPanel(false);
        setShowAdminPanel(false);
        if (ret?.type === 'checkout') {
          setShowProfilePage(false);
          try {
            setServerCartEnabled(true);
            void syncCartFromServer();
            void syncWishlistFromServer();
          } catch (_) {}
          try { void loadAddressesFromServer(); } catch (_) {}
          openCheckout({ userOverride: u });
          pushLiveToast('ورود موفق — ادامه تسویه حساب', { type: 'success', duration: 2000 });
          return;
        }
        if (ret?.type === 'cart') {
          setShowProfilePage(false);
          try {
            setServerCartEnabled(true);
            void syncCartFromServer();
            void syncWishlistFromServer();
          } catch (_) {}
          openCartPage();
          pushLiveToast('ورود موفق — سبد خرید', { type: 'success', duration: 2000 });
          return;
        }
        // پیش‌فرض: مستقیم پنل خریدار (بدون مکث)
        setShowCartPage(false);
        setShowCheckout(false);
        setShowWishlistPage(false);
        setShowComparePage(false);
        setShowPLP(false);
        setShowSellersList(false);
        setPdpProduct(null);
        setShowProfilePage(true);
        setProfileTab('dashboard');
        setOrderDetailId(null);
        // B1–B4: هیدراته سرور بلافاصله بعد از ورود
        try {
          setServerCartEnabled(true);
          void syncCartFromServer();
          void syncWishlistFromServer();
        } catch (_) {}
        try { void loadAddressesFromServer(); } catch (_) {}
        try {
          import('@/lib/api/orders').then(({ apiGetOrders }) =>
            apiGetOrders().then((res) => {
              if (res?.ok && Array.isArray(res.mapped)) saveBuyerOrders(res.mapped);
            }).catch(() => {})
          );
        } catch (_) {}
        pushLiveToast('ورود موفق — به پنل خریدار خوش آمدید', { type: 'success', duration: 2000 });
        try { window.scrollTo({ top: 0, behavior: 'instant' }); } catch (_) { try { window.scrollTo(0, 0); } catch (__) {} }
      };

      const mapProfileToBuyer = (user, profile) => ({
        id: user?.id || profile?.id,
        email: user?.email || '',
        phone: profile?.phone || '',
        firstName: (profile?.full_name || '').split(' ')[0] || profile?.full_name || '',
        lastName: (profile?.full_name || '').split(' ').slice(1).join(' ') || '',
        birthDate: '',
        gender: '',
        createdAt: Date.now(),
        supabase: true,
      });

      const mapProfileToSeller = (user, profile, extra = {}) => {
        const shopId = extra.id || extra.sellerId || profile?.seller_id || null;
        return {
          // فقط id واقعی فروشگاه از جدول sellers — نه id کاربر
          id: shopId || null,
          ownerId: user?.id || profile?.id || null,
          email: user?.email || '',
          phone: profile?.phone || extra.phone || '',
          shopName: extra.shopName || extra.shop_name || profile?.full_name || 'فروشگاه من',
          ownerName: extra.ownerName || profile?.full_name || '',
          city: extra.city || '',
          province: extra.province || '',
          address: extra.address || '',
          about: extra.about || '',
          logo: extra.logoUrl || extra.logo_url || extra.logo || '',
          banner: extra.bannerUrl || extra.banner_url || '',
          instagram: '',
          sheba: extra.sheba || '',
          card: '',
          status: extra.status || 'pending',
          licenseApproved: extra.licenseApproved === true || extra.status === 'approved',
          canSell: extra.canSell === true || extra.status === 'approved',
          createdAt: Date.now(),
          supabase: true,
          _needsShop: !shopId,
        };
      };

      /** ورود فقط با OTP پیامک — ایمیل/رمز از UI حذف شده */
      const sendOtp = async () => {
        const phoneDigits = onlyDigits(authPhone || '');
        if (!/^09\d{9}$/.test(phoneDigits)) {
          setAuthError('شماره موبایل معتبر (۱۱ رقم با ۰۹) وارد کنید');
          return;
        }
        setAuthError('');
        setAuthLoading(true);
        try {
          const res = await fetch('/api/auth/otp/request', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: phoneDigits }),
          });
          const data = await res.json();
          if (!data.ok) {
            setAuthError(data.error || 'ارسال کد ناموفق بود');
            setAuthLoading(false);
            return;
          }
          setAuthPhone(phoneDigits);
          setAuthOtp('');
          setAuthStep('otp');
          setAuthOtpTimer(90);
          if (data.mock && data.debug_code) {
            setAuthError(`حالت آزمایشی — کد: ${data.debug_code}`);
          }
          setAuthLoading(false);
        } catch (e) {
          setAuthError('خطا در ارتباط با سرور');
          setAuthLoading(false);
        }
      };

      
      
      const setAccountPassword = async (password) => {
        const res = await fetch('/api/auth/password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data?.ok === false) {
          throw new Error(data?.error || 'ذخیره رمز ناموفق');
        }
        return data;
      };

      const loginWithPassword = async () => {
        setAuthLoading(true);
        setAuthError('');
        try {
          const phone = onlyDigits(authPhone || '');
          const password = (authPassword || (typeof window !== 'undefined' && window.__pmAuthPassword) || '');
          const res = await fetch('/api/auth/login-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ phone, password, remember: !!(authRemember || (typeof window !== 'undefined' && window.__pmAuthRemember)) }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data?.ok) {
            setAuthError(data?.error || 'ورود ناموفق');
            return;
          }

          // MFA فقط وقتی سرور mfa_required بفرستد (ادمین)
          if (data.mfa_required) {
            setAuthOtp('');
            setAuthStep('mfa');
            setAuthOtpTimer(90);
            setAuthError('');
            setAuthLoading(false);
            return;
          }

          try {
            if (authRemember) localStorage.setItem('pm_remember', '1');
            else localStorage.removeItem('pm_remember');
          } catch (_) {}

          // یکسان با OTP: نقش از پروفایل سرور + شماره ادمین مجاز
          const role = String(data?.profile?.role || '').toLowerCase();
          const isAdminLogin = role === 'admin' || (typeof isAdminPhone === 'function' && isAdminPhone(phone));

          if (isAdminLogin) {
            // همان مسیر OTP ادمین — session از قبل با cookie ست شده
            finishAdminLogin(phone);
            try {
              if (typeof hydrateAdminProducts === 'function') hydrateAdminProducts();
              if (typeof hydrateAdminSellers === 'function') hydrateAdminSellers();
              if (typeof hydrateAdminTickets === 'function') hydrateAdminTickets();
              if (typeof hydrateAdminCoupons === 'function') hydrateAdminCoupons();
              try { hydrateCatalogFromApi(); } catch (_) {}
              if (typeof hydrateAdminOrders === 'function') hydrateAdminOrders();
            } catch (_) {}
            setAuthOpen(false);
            return;
          }

          if (authMode === 'seller' || role === 'seller') {
            try {
              const r = await fetch('/api/seller/me', { credentials: 'include', cache: 'no-store' });
              const j = await r.json().catch(() => ({}));
              if (j?.ok && j.seller && j.seller.id) {
                const u = persistSession(
                  'sellerUser',
                  mapProfileToSeller(data.user, { ...(data.profile || {}), ...j.seller }, j.seller),
                );
                setSellerUser(u);
                setShowSellerPanel(true);
                setShowAdminPanel(false);
                setShowProfilePage(false);
                setAuthOpen(false);
                try { pushFaUrl(FA_PATHS['seller-panel'], { sellerPanel: true }); } catch (_) {}
                try {
                  const pr = await fetch('/api/seller/products', { credentials: 'include' });
                  const pj = await pr.json().catch(() => ({}));
                  if (pj?.ok && Array.isArray(pj.products) && typeof setSellerProducts === 'function') {
                    setSellerProducts(pj.products.map((row) => (typeof mapServerProductToSellerUi === 'function' ? mapServerProductToSellerUi(row) : row)).filter(Boolean));
                  }
                } catch (_) {}
                try { pushLiveToast('ورود فروشنده موفق', { type: 'success', duration: 2000 }); } catch (_) {}
                return;
              }
            } catch (_) {}
            // بدون فروشگاه واقعی در DB
            try { setSellerUser(null); } catch (_) {}
            try {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('sellerUser');
                sessionStorage.removeItem('sellerUser');
              }
            } catch (_) {}
            setAuthMode('seller');
            setAuthStep('name');
            setAuthOpen(true);
            setShowSellerPanel(false);
            try {
              if (typeof showToast === 'function') {
                showToast({
                  message: 'فروشگاهی ثبت نشده. نام فروشگاه را وارد کنید تا درخواست جدید ارسال شود.',
                  variant: 'default',
                  duration: 5000,
                  position: 'top-center',
                });
              }
            } catch (_) {}
            return;
          }

          // خریدار
          const u = persistSession('buyerUser', mapProfileToBuyer(data.user, data.profile));
          setUser(u);
          setShowAdminPanel(false);
          setShowSellerPanel(false);
          setAuthOpen(false);
          try { openProfilePage('dashboard'); } catch (_) {}
          try {
            if (typeof refreshBuyerPanel === 'function') refreshBuyerPanel();
            if (typeof syncCartFromServer === 'function') syncCartFromServer();
            if (typeof loadBuyerTickets === 'function') loadBuyerTickets();
          } catch (_) {}
          try { pushLiveToast('ورود موفق', { type: 'success', duration: 2000 }); } catch (_) {}
        } catch (e) {
          setAuthError(e?.message || 'خطا در ورود');
        } finally {
          setAuthLoading(false);
        }
      };

const verifyOtp = async () => {
        const phoneDigits = onlyDigits(authPhone || '');
        const code = onlyDigits(authOtp || '');
        if (!/^09\d{9}$/.test(phoneDigits)) {
          setAuthError('شماره موبایل نامعتبر است');
          setAuthStep('phone');
          return;
        }
        if (code.length < 4) {
          setAuthError('کد تأیید را وارد کنید');
          return;
        }
        setAuthError('');
        setAuthLoading(true);
        try {
          const res = await fetch('/api/auth/otp/verify', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: phoneDigits,
              code,
              role: authMode === 'seller' ? 'seller' : 'buyer',
            }),
          });
          const data = await res.json();
          if (!data.ok) {
            setAuthError(data.error || 'تأیید ناموفق بود');
            setAuthLoading(false);
            return;
          }
          // کاربر جدید → تکمیل ثبت‌نام؛ کاربر قبلی → ورود مستقیم به پنل مربوطه
          if (data.needs_profile) {
            setAuthStep('name');
            setAuthLoading(false);
            setAuthError('');
            return;
          }
          const wanted = authMode === 'seller' ? 'seller' : 'buyer';
          // ورود فروشنده فقط با فروشگاه واقعی در DB
          if (wanted === 'seller') {
            if (data.needs_shop || data.needs_profile) {
              setAuthStep('name');
              setAuthLoading(false);
              setAuthError('');
              return;
            }
            try {
              const r = await fetch('/api/seller/me', { credentials: 'include', cache: 'no-store' });
              const j = await r.json().catch(() => ({}));
              if (j?.ok && j.seller && j.seller.id) {
                const u = persistSession(
                  'sellerUser',
                  mapProfileToSeller(data.user, data.profile || {}, j.seller),
                );
                setSellerUser(u);
                finishAuthSuccess('seller', u);
                return;
              }
            } catch (_) {}
            // بدون فروشگاه → فرم ثبت فروشگاه
            setAuthStep('name');
            setAuthLoading(false);
            setAuthError('');
            try {
              if (typeof showToast === 'function') {
                showToast({
                  message: 'فروشگاهی برای این شماره یافت نشد. لطفاً ثبت فروشگاه را تکمیل کنید.',
                  variant: 'default',
                  duration: 4500,
                  position: 'top-center',
                });
              }
            } catch (_) {}
            return;
          }
          // ورود خریدار
          const u = persistSession('buyerUser', mapProfileToBuyer(data.user, data.profile));
          setUser(u);
          finishAuthSuccess('buyer', u);
          try {
            setServerCartEnabled(true);
            await syncCartFromServer();
            await syncWishlistFromServer();
          } catch (_) {}
        } catch (e) {
          setAuthError('خطا در ارتباط با سرور');
          setAuthLoading(false);
        }
      };

      const completeRegister = async () => {
        if (!authName.trim()) {
          setAuthError(authMode === 'seller' ? 'نام فروشگاه را وارد کنید' : 'نام را وارد کنید');
          return;
        }
        const phoneDigits = onlyDigits(authPhone || '');
        if (!/^09\d{9}$/.test(phoneDigits)) {
          setAuthError('شماره موبایل معتبر الزامی است');
          setAuthStep('phone');
          return;
        }
        if (!authTermsAccepted) {
          setAuthError('پذیرش قوانین برای ثبت‌نام الزامی است');
          return;
        }
        setAuthError('');
        setAuthLoading(true);
        try {
          const res = await fetch('/api/auth/otp/complete', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: phoneDigits,
              fullName: authName.trim(),
              lastName: authLastName.trim(),
              ownerName: authLastName.trim(),
              shopName: authName.trim(),
              role: authMode === 'seller' ? 'seller' : 'buyer',
            }),
          });
          const data = await res.json();
          if (!data.ok) {
            setAuthError(data.error || 'ثبت‌نام ناموفق بود');
            setAuthLoading(false);
            return;
          }
          if (authMode === 'seller') {
            const u = persistSession('sellerUser', mapProfileToSeller(data.user, data.profile, {
              shopName: authName.trim(),
              ownerName: authLastName.trim() || authName.trim(),
            }));
            setSellerUser(u);
            finishAuthSuccess('seller', u);
          } else {
            const u = persistSession('buyerUser', mapProfileToBuyer(data.user, data.profile));
            setUser(u);
            finishAuthSuccess('buyer', u);
            try {
              setServerCartEnabled(true);
              await syncCartFromServer();
            } catch (_) {}
          }
        } catch (e) {
          setAuthError('خطا در ارتباط با سرور');
          setAuthLoading(false);
        }
      };


      const clearAuthLocal = () => {
        try {
          ['buyerUser', 'sellerUser', 'adminUser', 'pm_remember', 'user'].forEach((k) => {
            try { localStorage.removeItem(k); } catch (_) {}
            try { sessionStorage.removeItem(k); } catch (_) {}
          });
        } catch (_) {}
        try { sessionStorage.removeItem('pm_panel'); } catch (_) {}
        try { sessionStorage.removeItem('adminTab'); } catch (_) {}
        try {
          if (typeof window !== 'undefined') {
            try { delete window.__pmAuthPassword; } catch (_) {}
            try { delete window.__pmAuthRemember; } catch (_) {}
          }
        } catch (_) {}
      };

      const logout = () => {
        try { if (typeof setSellerUser === 'function') setSellerUser(null); } catch (_) {}
        try { if (typeof setAdminUser === 'function') setAdminUser(null); } catch (_) {}
        try { if (typeof setUser === 'function') setUser(null); } catch (_) {}
        try { if (typeof setShowSellerPanel === 'function') setShowSellerPanel(false); } catch (_) {}
        try { if (typeof setShowProfilePage === 'function') setShowProfilePage(false); } catch (_) {}
        try { if (typeof setShowAdminPanel === 'function') setShowAdminPanel(false); } catch (_) {}
        try { clearAuthLocal(); } catch (_) {}
        const go = () => {
          try { clearAuthLocal(); } catch (_) {}
          try { window.location.replace('/'); } catch (_) {
            try { window.location.assign('/'); } catch (__) {}
          }
        };
        try {
          fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
            .catch(() => {})
            .finally(go);
          setTimeout(go, 600);
        } catch (_) {
          go();
        }
      };

      const logoutAllDevices = () => {
        try { setSellerUser && setSellerUser(null); } catch (_) {}
        try { setAdminUser && setAdminUser(null); } catch (_) {}
        try { if (typeof setUser === 'function') setUser(null); } catch (_) {}
        try { if (typeof setShowProfilePage === 'function') setShowProfilePage(false); } catch (_) {}
        try { if (typeof setShowSellerPanel === 'function') setShowSellerPanel(false); } catch (_) {}
        try { if (typeof setShowAdminPanel === 'function') setShowAdminPanel(false); } catch (_) {}
        try { if (typeof setPage === 'function') setPage('home'); } catch (_) {}
        try { clearAuthLocal(); } catch (_) {}

        try {
          const go = () => { try { window.location.assign('/'); } catch (_) {} };
          const p = fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
          Promise.resolve(p).finally(go);
          setTimeout(go, 400);
          return;
        } catch (_) {
          try { window.location.assign('/'); } catch (_) {}
        }
      };


      // BUYER_PANEL_HYDRATE — سفارش / آدرس / تیکت هنگام باز بودن پنل خریدار
      useEffect(() => {
        if (!showProfilePage) return undefined;
        let cancelled = false;
        const run = async () => {
          if (cancelled) return;
          try { void loadAddressesFromServer(); } catch (_) {}
          try {
            const { apiGetOrders } = await import("@/lib/api/orders");
            const res = await apiGetOrders();
            if (!cancelled && res?.ok && Array.isArray(res.mapped)) {
              saveBuyerOrders(res.mapped);
            }
          } catch (_) {}
          try {
            const r = await fetch("/api/tickets", { credentials: "include", cache: "no-store" });
            const j = await r.json().catch(() => ({}));
            if (!cancelled && j?.ok && Array.isArray(j.tickets) && typeof setBuyerTickets === "function") {
              setBuyerTickets(j.tickets);
            }
          } catch (_) {}
        };
        const t0 = setTimeout(run, 50);
        const t1 = setTimeout(run, 500);
        return () => {
          cancelled = true;
          clearTimeout(t0);
          clearTimeout(t1);
        };
      }, [showProfilePage, user && (user.id || user.phone)]);

      const openProfilePage = (tab = 'dashboard', opts = {}) => {
        beginPageLoad('profile');
        try { sessionStorage.setItem('pm_panel', 'account'); } catch (_) {}
        try { if (window.location.pathname !== FA_PATHS.profile) pushFaUrl(FA_PATHS.profile, { profile: true }); } catch (_) {}

        closeStaticPage();
        if (!user) {
          if (opts.bypassAuth) {
            const u = { phone: '09121234567', firstName: 'علی', lastName: 'رضایی', email: '', birthDate: '', gender: '', createdAt: Date.now() };
            setUser(u);
            /* no localStorage (strict buyer) */
          } else {
            openAuth();
            return;
          }
        }
        setShowProfilePage(true);
        setProfileTab(tab);
        setOrderDetailId(null);
        setShowTracking(false);
        setShowCartPage(false);
        setShowCheckout(false);
        setShowWishlistPage(false);
        setShowComparePage(false);
        setShowSellerPanel(false);
        setShowAdminPanel(false);
        setPdpProduct(null);
        setShowPLP(false);
        setShowSellersList(false);
        setActiveSellerId(null);
        setMobileMenuOpen(false);
        setMegaOpen(null);
        setAuthOpen(false);
        try {
          const url = new URL(window.location.href);
          ['plp','cat','seller','sellers','cart','wishlist','compare'].forEach(k => url.searchParams.delete(k));
          url.searchParams.set('profile', '1');
          if (tab !== 'dashboard') url.searchParams.set('tab', tab);
          pushFaUrl(FA_PATHS.profile, { profile: true });
        } catch (_) {}
        window.scrollTo({ top: 0, behavior: 'instant' });
      };
      const closeProfilePage = () => {
        setShowProfilePage(false);
        setOrderDetailId(null);
        leaveCurrentPage();
      };
      const saveNotifications = (next) => {
        setNotifications(next);
        /* no localStorage (strict buyer) */
      };
      const saveUser = (next) => {
        setUser(next);
        /* no localStorage (strict buyer) */
        // همگام‌سازی با Supabase profiles (اگر لاگین واقعی باشد)
        try {
          if (next?.supabase || next?.id) {
            const fullName = `${next.firstName || ''} ${next.lastName || ''}`.trim();
            fetch('/api/auth/profile', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                fullName: fullName || undefined,
                phone: next.phone || undefined,
                email: next.email || undefined,
                birthDate: next.birthDate || undefined,
                gender: next.gender || undefined,
              }),
            }).catch(() => {});
          }
        } catch (_) {}
      };

      const orderStatusColor = (s) => {
        if (s === 'delivered') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
        if (s === 'shipped') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
        if (s === 'paid') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
        if (s === 'preparing' || s === 'processing') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
        if (s === 'pending' || s === 'pending_payment') return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300';
        if (s === 'cancelled' || s === 'returned' || s === 'refunded') return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
        return 'bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-white';
      };

      const unreadNotifCount = (notifications || []).filter(n => !n.read).length;

      // ——— Seller Panel helpers ———
      const seedSellerProducts = () => []; /* production: no demo seed */
      const seedSellerOrders = () => []; /* production: no demo seed */

      const seedSellerTickets = () => []; /* production: no demo seed */
      useEffect(() => {
        if (!showSellerPanel) return;
        let cancelled = false;
        (async () => {
          try {
            const list = await fetchSellerProductsFromServer();
            if (!cancelled) setSellerProducts(list);
          } catch (_) {
            if (!cancelled) setSellerProducts([]);
          }
        })();
        return () => { cancelled = true; };
      }, [showSellerPanel]);

      const saveSellerProducts = async (next) => {
        const prev = Array.isArray(sellerProducts) ? sellerProducts : [];
        const list = typeof next === "function" ? next(prev) : next;
        const arr = Array.isArray(list) ? list : [];
        setSellerProducts(arr);
        try { publishRealtime && publishRealtime("sellerProducts", arr); } catch (_) {}
        // محصولات از سرور با create/update/delete جداگانه همگام می‌شوند.
        // bulk PUT فقط برای آیتم‌های قدیمی بدون fromServer (legacy) و بدون toast پرصدا.
        const needsBulk = arr.some((p) => p && !p.fromServer && p.id && String(p.id).length < 20);
        if (!needsBulk) return true;
        try {
          let sellerId =
            (sellerUser && (sellerUser.sellerId || sellerUser.seller_id || sellerUser.id)) ||
            null;
          try {
            const me = await fetch("/api/seller/me", { cache: "no-store" }).then((r) => r.json()).catch(() => ({}));
            if (me && (me.seller_id || me.id || (me.seller && me.seller.id))) {
              sellerId = me.seller_id || me.id || me.seller.id;
            }
          } catch (_) {}
          if (!sellerId) return true;
          const res = await fetch("/api/catalog/products", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              products: arr.filter((p) => p && !p.fromServer),
              sellerId: String(sellerId),
            }),
          });
          if (!res.ok) {
            // silent — مسیر اصلی create/update/delete است
            return true;
          }
          return true;
        } catch (_) {
          return true;
        }
      };

      const refreshSellerProducts = async () => {
        try {
          let sellerId =
            (typeof sellerUser !== "undefined" && sellerUser &&
              (sellerUser.sellerId || sellerUser.seller_id || sellerUser.id)) ||
            null;
          try {
            const me = await fetch("/api/seller/me", { cache: "no-store" }).then((r) => r.json()).catch(() => ({}));
            if (me && (me.seller_id || me.id || (me.seller && me.seller.id))) {
              sellerId = me.seller_id || me.id || me.seller.id;
            }
          } catch (_) {}
          let list = null;
          try {
            const res2 = await fetch("/api/seller/products", { credentials: "include", cache: "no-store" });
            const data2 = await res2.json().catch(() => ({}));
            if (data2 && data2.ok && Array.isArray(data2.products)) {
              list = data2.products.map((row) => mapServerProductToSellerUi(row)).filter(Boolean);
            }
          } catch (_) {}
          if (!list && sellerId) {
            const res = await fetch("/api/catalog/products?sellerId=" + encodeURIComponent(String(sellerId)), {
              cache: "no-store",
            });
            const data = await res.json().catch(() => ({}));
            if (Array.isArray(data.products)) {
              list = data.products.map((row) => {
                const mapped = mapServerProductToSellerUi(row) || {};
                return {
                  ...mapped,
                  category: mapped.category || row.category_name || row.category || '',
                  image: mapped.image || row.cover_image || '',
                  createdAt: mapped.createdAt || row.created_at,
                  updatedAt: mapped.updatedAt || row.updated_at,
                };
              });
            }
          }
          if (list && list.length) {
            setSellerProducts(list);
            try { publishRealtime && publishRealtime("sellerProducts", list); } catch (_) {}
          }
        } catch (_) {}
      };

      useEffect(() => {
        try { refreshSellerProducts(); } catch (_) {}
        const onFocus = () => { try { refreshSellerProducts(); } catch (_) {} };
        const onCustom = (e) => {
          if (Array.isArray(e && e.detail)) setSellerProducts(e.detail);
        };
        const onStorage = (e) => {
          if (e.key === "sellerProducts" && e.newValue) {
            try { setSellerProducts(JSON.parse(e.newValue)); } catch (_) {}
          }
        };
        window.addEventListener("focus", onFocus);
        window.addEventListener("pm:seller-products", onCustom);
        window.addEventListener("storage", onStorage);
        const iv = setInterval(() => { try { refreshSellerProducts(); } catch (_) {} }, 30000);
        return () => {
          window.removeEventListener("focus", onFocus);
          window.removeEventListener("pm:seller-products", onCustom);
          window.removeEventListener("storage", onStorage);
          clearInterval(iv);
        };
      }, []);


      const saveSellerOrders = (next) => {
        setSellerOrders(next);
        publishRealtime('sellerOrders', next);
      };
      const saveSellerTickets = (next) => {
        setSellerTickets(next);
        publishRealtime('sellerTickets', next);
      };
      const saveBuyerTickets = (next) => {
        setBuyerTickets(next);
        publishRealtime('buyerTickets', next);
      };
      const saveBuyerOrders = (next) => {
        setOrders(next);
        publishRealtime('buyerOrders', next);
      };
      const saveSellerUser = async (next) => {
        setSellerUser(next);
        try {
          const res = await fetch('/api/seller/me', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              shopName: next.shopName || next.name,
              about: next.about,
              city: next.city,
              address: next.address,
              phone: next.phone,
              sheba: next.sheba,
              logoUrl: next.logoUrl || next.logo,
              bannerUrl: next.bannerUrl || next.banner,
            }),
          });
          const data = await res.json().catch(() => null);
          if (res.ok && data?.seller) setSellerUser(data.seller);
        } catch (_) {}
      };

      /** فقط با تأیید جواز توسط ادمین فروشنده مجاز به فروش است */
      const sellerCanSell = () => {
      try {
        const u = sellerUser || {};
        const st = String(u.status || u.shopStatus || u.sellerStatus || "").toLowerCase();
        // تعلیق/آرشیو/مسدود اولویت دارد حتی اگر canSell قدیمی در state مانده باشد
        if (["archived", "suspended", "blocked", "banned", "rejected"].includes(st)) return false;
        if (u.restricted === true || st === "restricted") return false;
        if (u.licenseApproved === true || u.canSell === true) return true;
        if (["approved", "active", "enabled", "verified"].includes(st)) return true;
        return false;
      } catch (_) {
        return false;
      }
    }


      
      /** S0: فروشنده فقط از سرور — بدون اتکا به localStorage به‌عنوان منبع حقیقت */
      
      const mapServerProductToSellerUi = (p) => {
        if (!p) return null;
        const payload = p.payload && typeof p.payload === 'object' ? p.payload : {};
        const price = Number(p.base_price ?? p.price ?? payload.price ?? 0) || 0;
        const imgs = Array.isArray(p.images) && p.images.length
          ? p.images
          : (Array.isArray(payload.images) ? payload.images : (p.cover_image ? [p.cover_image] : []));
        const stock = payload.stock ?? p.stock ?? 0;
        return {
          ...payload,
          id: p.id,
          name: p.name || p.title || payload.name || '',
          title: p.title || p.name || payload.name || '',
          price,
          priceText: payload.priceText || (price ? String(price) : ''),
          status: p.status || payload.status || 'pending',
          contentStatus: p.status === 'active' ? 'approved' : (p.status || 'pending'),
          image: p.cover_image || imgs[0] || '',
          images: imgs,
          cover_image: p.cover_image || imgs[0] || '',
          stock,
          stockLeft: stock,
          productCode: p.product_code || payload.productCode || '',
          category: payload.category || payload.category_name || p.category || '',
          categories: payload.categories || [],
          brand: payload.brand || payload.brandName || '',
          brandName: payload.brandName || payload.brand || '',
          colors: Array.isArray(payload.colors) ? payload.colors : [],
          sizes: Array.isArray(payload.sizes) ? payload.sizes : [],
          tags: Array.isArray(payload.tags) ? payload.tags : [],
          attributes: payload.attributes || {},
          variants: payload.variants || [],
          desc: payload.desc || p.description || '',
          description: p.description || payload.desc || '',
          slug: p.slug || payload.slug || '',
          createdAt: p.created_at || payload.createdAt || null,
          updatedAt: p.updated_at || payload.updatedAt || null,
          sellerId: p.seller_id || payload.sellerId,
          shopName: payload.shopName || (typeof sellerUser !== 'undefined' && sellerUser ? (sellerUser.shopName || sellerUser.name) : '') || '',
          sellerName: payload.sellerName || (typeof sellerUser !== 'undefined' && sellerUser ? (sellerUser.shopName || sellerUser.name) : '') || '',
          seller: {
            id: p.seller_id || payload.sellerId || 'own',
            name: (typeof sellerUser !== 'undefined' && sellerUser ? (sellerUser.shopName || sellerUser.name) : '') || payload.sellerName || 'فروشگاه',
          },
          salesCount: 0,
          fromServer: true,
        };
      };
      const fetchSellerProductsFromServer = async () => {
        try {
          const res = await fetch('/api/seller/products', { credentials: 'include' });
          const data = await res.json().catch(() => null);
          if (!res.ok || !data?.ok) return [];
          return (Array.isArray(data.products) ? data.products : []).map(mapServerProductToSellerUi).filter(Boolean);
        } catch (_) {
          return [];
        }
      };
      const createSellerProductOnServer = async (payload) => {
        const res = await fetch('/api/seller/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.ok) throw new Error(data?.error || 'ثبت محصول ناموفق');
        return data.product;
      };
      const updateSellerProductOnServer = async (id, payload) => {
        const res = await fetch('/api/seller/products/' + encodeURIComponent(id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.ok) throw new Error(data?.error || 'بروزرسانی محصول ناموفق');
        return data.product;
      };

      const fetchSellerMe = async () => {
        try {
          const res = await fetch('/api/seller/me', { credentials: 'include', cache: 'no-store' });
          const data = await res.json().catch(() => null);
          if (!res.ok || !data?.ok || !data?.seller) {
            // بدون ردیف واقعی در DB — state لوکال را پاک کن (سایت real است)
            if (res.status === 404 || data?.code === 'NO_SHOP' || (data && data.ok && !data.seller)) {
              try { setSellerUser(null); } catch (_) {}
              try {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('sellerUser');
                  sessionStorage.removeItem('sellerUser');
                }
              } catch (_) {}
            }
            return null;
          }
          const s = data.seller;
          const mapped = {
            id: s.id,
            ownerId: s.ownerId || s.owner_id,
            shopName: s.shopName || s.shop_name || 'فروشگاه',
            name: s.name || s.shopName || s.shop_name,
            slug: s.slug || '',
            status: s.status || 'pending',
            phone: s.phone || '',
            city: s.city || '',
            about: s.about || '',
            logo: s.logoUrl || s.logo_url || s.logo || '',
            licenseApproved: s.licenseApproved === true || s.status === 'approved',
            canSell: s.canSell === true || s.status === 'approved',
            role: 'seller',
          };
          try { setSellerUser(mapped); } catch (_) {}
          try {
            if (typeof persistSession === 'function') persistSession('sellerUser', mapped);
          } catch (_) {}
          return mapped;
        } catch (_) {
          return null;
        }
      };

      const createSellerShopOnServer = async (payload = {}) => {
        try {
          const res = await fetch('/api/seller/register', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const data = await res.json().catch(() => null);
          if (!res.ok || !data?.ok) {
            if (typeof showToast === 'function') showToast({ message: data?.error || 'ثبت فروشگاه ناموفق', variant: 'error', duration: 4000, position: 'top-center' });
            return null;
          }
          if (typeof showToast === 'function') showToast({ message: data.already ? 'فروشگاه از قبل وجود دارد' : 'فروشگاه ثبت شد و در انتظار تأیید است', variant: 'default', duration: 3500, position: 'top-center' });
          try { void hydrateSellerFromServer(); } catch (_) {}
          return data.seller;
        } catch (e) {
          if (typeof showToast === 'function') showToast({ message: 'خطای شبکه در ثبت فروشگاه', variant: 'error', duration: 4000, position: 'top-center' });
          return null;
        }
      };
      const updateSellerShopOnServer = async (payload = {}) => {
        try {
          const res = await fetch('/api/seller/me', {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const data = await res.json().catch(() => null);
          if (!res.ok || !data?.ok) {
            // اگر فروشگاه وجود ندارد → ثبت جدید
            if (res.status === 404 || data?.code === 'NO_SHOP') {
              return await createSellerShopOnServer(payload);
            }
            if (typeof showToast === 'function') showToast({ message: data?.error || 'بروزرسانی فروشگاه ناموفق', variant: 'error', duration: 4000, position: 'top-center' });
            return null;
          }
          if (data.seller) {
            try {
              setSellerUser((prev) => ({
                ...(prev || {}),
                ...data.seller,
                shopName: data.seller.shopName || data.seller.shop_name || prev?.shopName,
                logoUrl: data.seller.logoUrl || data.seller.logo_url || prev?.logoUrl || '',
                logo_url: data.seller.logo_url || data.seller.logoUrl || prev?.logo_url || '',
                bannerUrl: data.seller.bannerUrl || data.seller.banner_url || prev?.bannerUrl || '',
                banner_url: data.seller.banner_url || data.seller.bannerUrl || prev?.banner_url || '',
              }));
            } catch (_) {}
            try {
              if (typeof setTopSellers === 'function') {
                const sid = String(data.seller.id || '');
                const logo = data.seller.logoUrl || data.seller.logo_url || '';
                const banner = data.seller.bannerUrl || data.seller.banner_url || '';
                setTopSellers((prev) => Array.isArray(prev)
                  ? prev.map((s) => (s && String(s.id) === sid
                    ? { ...s, logo, logo_url: logo, image: logo || s.image, banner: banner || s.banner, banner_url: banner }
                    : s))
                  : prev);
              }
            } catch (_) {}
          }
          try {
            window.dispatchEvent(new CustomEvent('pm:invalidate', { detail: { scope: 'sellers', reason: 'seller-shop-update', ts: Date.now() } }));
          } catch (_) {}
          if (typeof showToast === 'function') showToast({ message: 'اطلاعات فروشگاه ذخیره شد', variant: 'success', duration: 3000, position: 'top-center' });
          try { void hydrateSellerFromServer(); } catch (_) {}
          return data.seller;
        } catch (e) {
          if (typeof showToast === 'function') showToast({ message: 'خطای شبکه در ذخیره فروشگاه', variant: 'error', duration: 4000, position: 'top-center' });
          return null;
        }
      };


      /** فروشنده: درخواست حذف دائم (بعد از آرشیو) — فقط با تأیید ادمین پاک می‌شود */
      const requestSellerProductPurge = async (id) => {
        if (!id) return false;
        try {
          const res = await fetch('/api/seller/products/' + encodeURIComponent(id), {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ status: 'purge_requested' }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || data?.ok === false) {
            if (typeof showToast === 'function') showToast({ message: data?.error || 'ثبت درخواست حذف ناموفق', variant: 'error', duration: 4000, position: 'top-center' });
            return false;
          }
          if (typeof showToast === 'function') showToast({ message: 'درخواست حذف دائم برای تأیید ادمین ثبت شد', variant: 'default', duration: 3500, position: 'top-center' });
          try {
            setSellerProducts((prev) => (prev || []).map((p) => (p && String(p.id) === String(id) ? { ...p, status: 'purge_requested' } : p)));
          } catch (_) {}
          try {
            const fresh = await fetchSellerProductsFromServer();
            if (Array.isArray(fresh)) setSellerProducts(fresh);
          } catch (_) {}
          return true;
        } catch (e) {
          if (typeof showToast === 'function') showToast({ message: 'خطای شبکه در درخواست حذف', variant: 'error', duration: 4000, position: 'top-center' });
          return false;
        }
      };

      /** لغو درخواست حذف دائم توسط فروشنده → بازگشت به آرشیو */
      const cancelSellerProductPurge = async (id) => {
        if (!id) return false;
        try {
          const res = await fetch('/api/seller/products/' + encodeURIComponent(id), {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ status: 'archived' }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || data?.ok === false) {
            if (typeof showToast === 'function') showToast({ message: data?.error || 'لغو درخواست ناموفق', variant: 'error', duration: 4000, position: 'top-center' });
            return false;
          }
          try {
            setSellerProducts((prev) => (prev || []).map((p) => (p && String(p.id) === String(id) ? { ...p, status: 'archived' } : p)));
          } catch (_) {}
          if (typeof showToast === 'function') showToast({ message: 'درخواست حذف لغو شد — محصول در آرشیو ماند', variant: 'default', duration: 3000, position: 'top-center' });
          return true;
        } catch (_) {
          return false;
        }
      };

      const deleteSellerProductOnServer = async (id) => {
        if (!id) return false;
        try {
          const res = await fetch('/api/seller/products/' + encodeURIComponent(id), {
            method: 'DELETE',
            credentials: 'include',
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || data?.ok === false) {
            if (typeof showToast === 'function') showToast({ message: data?.error || 'حذف محصول ناموفق', variant: 'error', duration: 4000, position: 'top-center' });
            return false;
          }
          if (typeof showToast === 'function') showToast({ message: 'محصول به آرشیو منتقل شد', variant: 'default', duration: 3000, position: 'top-center' });
          try {
            const fresh = await fetchSellerProductsFromServer();
            if (Array.isArray(fresh)) setSellerProducts(fresh);
          } catch (_) {
            try { setSellerProducts((prev) => (prev || []).filter((x) => x && x.id !== id)); } catch (__) {}
          }
          return true;
        } catch (e) {
          if (typeof showToast === 'function') showToast({ message: 'خطای شبکه در حذف محصول', variant: 'error', duration: 4000, position: 'top-center' });
          return false;
        }
      };


      const hydrateSellerFromServer = async () => {
        try {
          const s = await fetchSellerMe();
          if (s) {
            try { setSellerUser(s); } catch (_) {}
            return s;
          }
        } catch (_) {}
        return null;
      };

      
      useEffect(() => {
        if (!showSellerPanel) return
        let cancelled = false
        const load = async () => {
          try {
            const res = await fetch('/api/seller/me', { credentials: 'include' })
            const data = await res.json().catch(() => null)
            if (cancelled || !data?.ok) return
            const s = data.seller || data
            if (!s) return
            setSellerUser((prev) => ({
              ...(prev || {}),
              ...s,
              id: s.id || prev?.id,
              shopName: s.shop_name || s.shopName || prev?.shopName,
              status: s.status || prev?.status,
              licenseApproved: s.licenseApproved ?? (s.status === 'approved'),
              canSell: s.canSell ?? (s.status === 'approved'),
              phone: s.phone || prev?.phone,
            }))
          } catch (_) {}
        }
        load()
        const onVis = () => { if (document.visibilityState === 'visible') load() }
        document.addEventListener('visibilitychange', onVis)
        return () => { cancelled = true; document.removeEventListener('visibilitychange', onVis) }
      }, [showSellerPanel])

      
      // ——— Live: وضعیت فروشنده بدون رفرش ———
      useEffect(() => {
        if (typeof window === 'undefined') return;
        let cancelled = false;

        const applySellerPayload = (s) => {
          if (cancelled || !s) return;
          setSellerUser((prev) => {
            const next = {
              ...(prev || {}),
              ...s,
              id: s.id || prev?.id,
              shopName: s.shop_name || s.shopName || prev?.shopName,
              name: s.shop_name || s.name || prev?.name,
              status: s.status ?? prev?.status,
              licenseApproved: s.licenseApproved ?? (String(s.status || '').toLowerCase() === 'approved'),
              canSell: s.canSell ?? (String(s.status || '').toLowerCase() === 'approved'),
              phone: s.phone || prev?.phone,
            };
            return next;
          });
        };

        const loadSellerMe = async () => {
          try {
            const res = await fetch('/api/seller/me', { credentials: 'include' });
            const data = await res.json().catch(() => null);
            if (!res.ok || !data?.ok) return;
            applySellerPayload(data.seller || data);
          } catch (_) {}
        };

        const onSellerStatusEvent = () => { loadSellerMe(); };
        window.addEventListener('seller-status-changed', onSellerStatusEvent);

        // BroadcastChannel: تب ادمین → تب فروشنده
        let bc = null;
        try {
          bc = new BroadcastChannel('pirahan-live');
          bc.onmessage = (ev) => {
            if (ev?.data?.type === 'seller-status-changed') loadSellerMe();
            if (ev?.data?.type === 'admin-sellers-changed') {
              try { window.dispatchEvent(new CustomEvent('admin-sellers-refetch')); } catch (_) {}
            }
          };
        } catch (_) {}

        // وقتی پنل فروشنده باز است: poll سریع
        let iv = null;
        if (showSellerPanel) {
          loadSellerMe();
          iv = setInterval(loadSellerMe, 20000);
        }

        const onVis = () => {
          if (document.visibilityState === 'visible') loadSellerMe();
        };
        document.addEventListener('visibilitychange', onVis);
        window.addEventListener('focus', loadSellerMe);

        // Supabase Realtime (اگر کلاینت مرورگر موجود باشد)
        let channel = null;
        (async () => {
          try {
            let client = null;
            try {
              const mod = await import('../lib/supabase/client');
              client = mod.createClient?.() || mod.supabase || mod.default;
            } catch (_) {
              try {
                const mod = await import('../lib/supabase');
                client = mod.createClient?.() || mod.supabase || mod.default;
              } catch (__) {}
            }
            if (!client?.channel) return;
            channel = client
              .channel('sellers-live')
              .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'sellers' },
                (payload) => {
                  const row = payload.new || payload.old;
                  if (!row) return;
                  // اگر فروشنده فعلی همان ردیف است
                  setSellerUser((prev) => {
                    if (!prev) return prev;
                    const same =
                      prev.id === row.id ||
                      prev.ownerId === row.owner_id ||
                      (prev.phone && row.phone && String(prev.phone).replace(/\D/g, '') === String(row.phone).replace(/\D/g, ''));
                    if (!same) return prev;
                    const st = row.status;
                    return {
                      ...prev,
                      status: st,
                      licenseApproved: st === 'approved',
                      canSell: st === 'approved',
                      shopName: row.shop_name || prev.shopName,
                    };
                  });
                  try { window.dispatchEvent(new CustomEvent('seller-status-changed')); } catch (_) {}
                },
              )
              .subscribe();
          } catch (_) {}
        })();

        return () => {
          cancelled = true;
          if (iv) clearInterval(iv);
          window.removeEventListener('seller-status-changed', onSellerStatusEvent);
          document.removeEventListener('visibilitychange', onVis);
          window.removeEventListener('focus', loadSellerMe);
          try { bc && bc.close(); } catch (_) {}
          try { channel && client?.removeChannel?.(channel); } catch (_) {}
        };
      }, [showSellerPanel, sellerUser?.id]);

      // ادمین: لیست فروشنده‌ها را زنده نگه دار
      useEffect(() => {
        if (!showAdminPanel) return;
        let cancelled = false;
        const loadSellers = async () => {
          try {
            const res = await fetch('/api/admin/sellers', { credentials: 'include' });
            const data = await res.json().catch(() => null);
            if (cancelled || !res.ok || !data?.ok) return;
            const mapped = (data.sellers || []).map((s) => ({
              id: s.id,
              shopName: s.shop_name || s.shopName || 'فروشگاه',
              name: s.shop_name || s.shopName || 'فروشگاه',
              slug: s.slug || '',
              status: s.status || 'pending',
              ownerId: s.owner_id,
              ownerName: s.owner_name || s.ownerName || '',
              phone: s.phone || '',
              city: s.city || '',
              address: s.address || '',
              about: s.about || '',
              logo: s.logo_url || s.logo || '',
              banner: s.banner_url || '',
              sheba: s.sheba || '',
              rating: s.rating != null ? Number(s.rating) : 0,
              ratingCount: s.rating_count != null ? Number(s.rating_count) : 0,
              productsCount: s.products_count != null ? Number(s.products_count) : 0,
              activeProductsCount: s.active_products_count != null ? Number(s.active_products_count) : 0,
              kycStatus: s.kyc_status || 'pending',
              createdAt: s.created_at,
              updatedAt: s.updated_at,
              licenseApproved: s.status === 'approved',
            }));
            try { setAdminSellers(mapped); } catch (_) {}
          } catch (_) {}
        };
        loadSellers();
        const iv = setInterval(loadSellers, 30000);
        const onRefetch = () => loadSellers();
        window.addEventListener('admin-sellers-refetch', onRefetch);
        window.addEventListener('seller-status-changed', onRefetch);
        return () => {
          cancelled = true;
          clearInterval(iv);
          window.removeEventListener('admin-sellers-refetch', onRefetch);
          window.removeEventListener('seller-status-changed', onRefetch);
        };
      }, [showAdminPanel]);

      // hydrate admin products from server (not local demo)
      useEffect(() => {
        if (!showAdminPanel) return;
        let cancelled = false;
        const loadProducts = async () => {
          try {
            const res = await fetch('/api/admin/products?limit=200', { credentials: 'include' });
            const data = await res.json().catch(() => null);
            if (cancelled || !res.ok || !data?.ok) return;
            const sellersList = typeof adminSellers !== 'undefined' ? adminSellers : [];
            const mapped = (data.products || []).map((p) => mapAdminProductRow(p, sellersList)).filter(Boolean);
            try { setAdminProducts(mapped); } catch (_) {}
          } catch (_) {}
        };
        loadProducts();
        const iv = setInterval(loadProducts, 30000);
        window.addEventListener('admin-products-refetch', loadProducts);
        return () => {
          cancelled = true;
          clearInterval(iv);
          window.removeEventListener('admin-products-refetch', loadProducts);
        };
      }, [showAdminPanel]);



      const openSellerAuth = () => {
        setAuthMode('seller');
        setAuthOpen(true);
        setAuthStep('phone');
        setAuthPhone('');
        setAuthOtp('');
        setAuthName('');
        setAuthLastName('');
        setAuthError('');
        setAuthLoading(false);
        setAuthFailCount(0);
        setDemoOtpCode('');
        setAuthTermsAccepted(true);
        setAuthReturnTo('become-seller');
      };

      const openSellerPanel = async (tab = 'dashboard', opts = {}) => {
        closeStaticPage();
        if (!sellerUser || !sellerUser.id || sellerUser._needsShop) {
          try {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('sellerUser');
              sessionStorage.removeItem('sellerUser');
            }
          } catch (_) {}
          try { setSellerUser(null); } catch (_) {}
          openSellerAuth();
          return;
        }
        let live = null;
        try {
          live = await fetchSellerMe();
          if (live) setSellerUser(live);
        } catch (_) {}
        const u = live || null;
        if (!u || !u.id) {
          try {
            if (typeof showToast === 'function') {
              showToast({ message: 'فروشگاهی در سرور ثبت نشده. ابتدا از «فروشنده شوید» فروشگاه را ثبت کنید.', variant: 'error', duration: 5500, position: 'top-center' });
            }
          } catch (_) {}
          try { setSellerUser(null); } catch (_) {}
          try { if (typeof window !== 'undefined') { localStorage.removeItem('sellerUser'); sessionStorage.removeItem('sellerUser'); } } catch (_) {}
          try { if (typeof openSellerAuth === 'function') openSellerAuth(); } catch (_) {}
          return;
        }

        const st = String(u.status || u.shopStatus || u.sellerStatus || '').toLowerCase();
        // آرشیو/تعلیق: پنل باز شود ولی فروش قفل — پیام جدا در داشبورد
        if (['archived', 'suspended', 'blocked'].includes(st) && !opts.allowPendingView) {
          setSellerTab(typeof tab === 'string' && tab ? tab : 'dashboard');
          setShowSellerPanel(true);
          setShowAdminPanel(false);
          setShowProfilePage(false);
          setMobileMenuOpen(false);
          setAuthOpen(false);
          try { pushFaUrl(FA_PATHS['seller-panel'], { sellerPanel: true }); } catch (_) {}
          return;
        }
        const approved =
          (u.licenseApproved === true || u.canSell === true || ['approved', 'active', 'enabled', 'verified'].includes(st))
          && !['archived', 'suspended', 'blocked', 'banned', 'rejected'].includes(st);
        if (!approved && !opts.allowPendingView) {
          try {
            showToast({
              message: 'حساب فروشنده هنوز توسط ادمین تأیید نشده است. پس از تأیید، پنل فعال می‌شود.',
              variant: 'error',
              duration: 5000,
              position: 'top-center',
            });
          } catch (_) {}
          setSellerTab('pending-approval');
          setShowSellerPanel(true);
          setShowAdminPanel(false);
          setShowProfilePage(false);
          setMobileMenuOpen(false);
          setAuthOpen(false);
          try { pushFaUrl(FA_PATHS['seller-panel'], { sellerPanel: true, pending: true }); } catch (_) {}
          return;
        }
        setShowSellerPanel(true);
        setShowAdminPanel(false);
        setSellerTab(tab === 'pending-approval' ? 'dashboard' : tab);
        setSellerOrderDetailId(null);
        setSellerTicketDetailId(null);
        setShowProfilePage(false);
        setShowCartPage(false);
        setShowCheckout(false);
        setShowWishlistPage(false);
        setShowComparePage(false);
        setPdpProduct(null);
        setShowPLP(false);
        setShowSellersList(false);
        setActiveSellerId(null);
        setMobileMenuOpen(false);
        setMegaOpen(null);
        setAuthOpen(false);
        try {
          const url = new URL(window.location.href);
          ['plp','cat','seller','sellers','cart','wishlist','compare','profile'].forEach(k => url.searchParams.delete(k));
          url.searchParams.set('sellerPanel', '1');
          pushFaUrl(FA_PATHS['seller-panel'], { sellerPanel: true });
        } catch (_) {}
        window.scrollTo({ top: 0, behavior: 'instant' });
      };
      const closeSellerPanel = () => {
        setShowSellerPanel(false);
        setSellerOrderDetailId(null);
        try {
          if (typeof pushFaUrl === 'function') pushFaUrl('/', { home: true });
          else if (typeof replaceFaUrl === 'function') replaceFaUrl('/');
          else window.history.pushState({}, '', '/');
        } catch (_) {
          try { window.history.pushState({}, '', '/'); } catch (__) {}
        }
      };
      const logoutSeller = () => {
        try { setSellerUser(null); } catch (_) {}
        try { if (typeof setUser === 'function') setUser(null); } catch (_) {}
        try { if (typeof setAdminUser === 'function') setAdminUser(null); } catch (_) {}
        try { if (typeof setShowSellerPanel === 'function') setShowSellerPanel(false); } catch (_) {}
        try { if (typeof setShowProfilePage === 'function') setShowProfilePage(false); } catch (_) {}
        try { if (typeof setPage === 'function') setPage('home'); } catch (_) {}
        try { clearAuthLocal(); } catch (_) {}

        const go = () => {
          try { clearAuthLocal(); } catch (_) {}
          try { window.location.replace('/'); } catch (_) {
            try { window.location.assign('/'); } catch (__) {}
          }
        };
        try {
          fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
            .catch(() => {})
            .finally(go);
          setTimeout(go, 600);
        } catch (_) {
          go();
        }
      };


      // ——— Admin Panel helpers ———
      const ADMIN_PRESET = { name: 'سوپر ادمین', role: 'Super Admin' };
      const seedAdminData = () => {
        console.info('[admin] seedAdminData disabled — server is source of truth');
      };

      const collectFullSiteBackup = () => {
        const keys = [
          'adminOrders','adminSellers','adminProducts','adminCoupons','adminTickets','adminBuyers',
          'adminShippingMethods','adminCatalogCategories','adminCatalogTags','adminCatalogBrands',
          'adminCategories','adminTags','adminBlogCategories',
          'adminCatalogColors','adminCatalogSizes','adminCatalogAttrs','adminSettings','adminBlogPosts',
          'adminCampaigns','adminPageContent','adminModerationQueue','sellerUser','sellerProducts',
          'sellerOrders','sellerGifts','sellerTickets','buyerUser','buyerOrders','buyerTickets',
          'cart','favorites','compare','recentlyViewed','buyerAddresses','notifications'
        ];
        const data = { version: 1, exportedAt: new Date().toISOString(), site: 'pirahanemardane', payload: {} };
        keys.forEach(k => {
          try { data.payload[k] = JSON.parse(localStorage.getItem(k) || 'null'); } catch { data.payload[k] = null; }
        });
        try { data.payload.productsSeed = products; } catch (_) {}
        return data;
      };
      const downloadFullSiteBackup = () => {
        const data = collectFullSiteBackup();
        const stamp = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
        downloadBlobFile(`pirahan-full-backup-${stamp}.json`, JSON.stringify(data, null, 2), 'application/json;charset=utf-8');
        pushLiveToast('بک‌آپ کامل دانلود شد', { type: 'info' });
        try { localStorage.setItem('lastFullBackupAt', String(Date.now())); } catch (_) {}
      };
      const restoreFullSiteBackup = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const data = JSON.parse(String(reader.result || '{}'));
            if (!data || data.site !== 'pirahanemardane' || !data.payload) {
              showToast({ message: 'فایل بک‌آپ معتبر نیست (باید از همین سایت باشد).', variant: 'error', duration: 4500, position: 'top-center' });
              return;
            }
            siteConfirm('بازگردانی کامل سایت؟ همه داده‌های فعلی جایگزین می‌شوند.', 'بازگردانی').then((ok) => {
              if (!ok) return;
              Object.entries(data.payload).forEach(([k,v]) => {
                try {
                  if (v === null || v === undefined) localStorage.removeItem(k);
                  else localStorage.setItem(k, JSON.stringify(v));
                } catch (_) {}
              });
              pushLiveToast('بازگردانی انجام شد — صفحه را رفرش کنید', { type: 'info', duration: 5000 });
              setTimeout(() => { try { window.location.reload(); } catch (_) {} }, 1200);
            });
          } catch (e) {
            showToast({ message: 'خواندن فایل ناموفق بود', variant: 'error', duration: 4500, position: 'top-center' });
          }
        };
        reader.readAsText(file);
      };
      const [backupDestPath, setBackupDestPath] = useStoreField(shopUiStore, 'backupDestPath');
      const [lastAutoBackupAt, setLastAutoBackupAt] = useStoreField(shopUiStore, 'lastAutoBackupAt');
      useEffect(() => {
        if (!showAdminPanel) return;
        const tick = () => {
          try {
            const last = Number(localStorage.getItem('lastFullBackupAt') || 0);
            if (Date.now() - last > 3600000) {
              // آماده‌سازی بک‌آپ ساعتی — ذخیرهٔ متادیتا؛ ارسال به Google Drive بعداً وصل می‌شود
              const data = collectFullSiteBackup();
              localStorage.setItem('lastHourlyBackupMeta', JSON.stringify({ at: Date.now(), path: backupDestPath, bytes: JSON.stringify(data).length }));
              localStorage.setItem('lastFullBackupAt', String(Date.now()));
              setLastAutoBackupAt(Date.now());
            }
          } catch (_) {}
        };
        tick();
        const id = setInterval(tick, 60000);
        return () => clearInterval(id);
      }, [showAdminPanel, backupDestPath]);

      const ensureAdminSeed = () => { /* no demo seed — server is source of truth */ };
      const saveAdminSellers = (next) => { setAdminSellers(next); publishRealtime('adminSellers', next); };
      const saveAdminProducts = (next) => { setAdminProducts(next); publishRealtime('adminProducts', next); };

      const downloadBlobFile = (filename, content, mime) => {
        try {
          const blob = new Blob([content], { type: mime || 'application/octet-stream' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 1500);
          return true;
        } catch (e) {
          showToast({ message: 'دانلود ناموفق بود', variant: 'error', duration: 4500, position: 'top-center' });
          return false;
        }
      };

      const PRODUCT_BACKUP_SITE = 'pirahan-mardane';
      const PRODUCT_BACKUP_MAGIC = 'PM-PRODUCT-BACKUP-v1';

      const productBackupPayload = (list, meta = {}) => ({
        magic: PRODUCT_BACKUP_MAGIC,
        site: PRODUCT_BACKUP_SITE,
        version: 1,
        exportedAt: new Date().toISOString(),
        exportedAtFa: new Date().toLocaleString('fa-IR'),
        source: meta.source || 'unknown',
        sellerId: meta.sellerId || null,
        sellerName: meta.sellerName || null,
        count: (list || []).length,
        products: (list || []).map(p => ({ ...p })),
      });

      /** خروجی CSV سازگار با ورود WooCommerce */
      const productsToWooCsv = (list) => {
        const rows = list || [];
        const headers = [
          'Name', 'SKU', 'Description', 'Short description',
          'Regular price', 'Sale price', 'Stock', 'Published',
          'Categories', 'Tags', 'Brands', 'Images',
          'Attribute 1 name', 'Attribute 1 value(s)',
          'Attribute 2 name', 'Attribute 2 value(s)',
          'Attribute 3 name', 'Attribute 3 value(s)',
        ];
        const esc = (v) => {
          if (v == null) return '';
          let s = String(v);
          if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
            s = '"' + s.replace(/"/g, '""') + '"';
          }
          return s;
        };
        const lines = [headers.join(',')];
        rows.forEach((p) => {
          const sizes = Array.isArray(p.sizes)
            ? p.sizes.map((x) => (x && x.name) ? x.name : x).filter(Boolean).join(', ')
            : (p.sizes || '');
          const colors = Array.isArray(p.colors)
            ? p.colors.map((c) => (c && c.name) ? c.name : c).filter(Boolean).join(', ')
            : (p.colors || '');
          const imgs = Array.isArray(p.images) && p.images.length
            ? p.images.join(', ')
            : (p.image || p.cover_image || (p.colors && p.colors[0] && p.colors[0].image) || '');
          const price = Number(p.price) || 0;
          let oldPrice = 0;
          if (p.oldPrice != null) {
            oldPrice = Number(String(p.oldPrice).replace(/[^\d.]/g, '')) || 0;
          }
          const regular = oldPrice > price && price > 0 ? oldPrice : price;
          const sale = oldPrice > price && price > 0 ? price : '';
          const cats = Array.isArray(p.categories) && p.categories.length
            ? p.categories.join(', ')
            : (p.category || '');
          const tags = Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || '');
          const published = ['active', 'approved', 'published'].includes(String(p.status || '').toLowerCase()) ? '1' : '0';
          lines.push([
            p.name || '',
            p.sku || p.productCode || p.code || '',
            p.desc || p.description || '',
            String(p.desc || p.description || '').slice(0, 120),
            regular || '',
            sale,
            p.stock ?? '',
            published,
            cats,
            tags,
            p.brand || p.brandName || '',
            imgs,
            sizes ? 'سایز' : '',
            sizes,
            colors ? 'رنگ' : '',
            colors,
            '',
            '',
          ].map(esc).join(','));
        });
        return '\uFEFF' + lines.join('\n');
      };

      const productsToCsv = (list) => {
        const rows = list || [];
        const headers = ['id', 'name', 'sku', 'category', 'categories', 'tags', 'price', 'oldPrice', 'discount', 'stock', 'reorderPoint', 'status', 'sellerId', 'sellerName', 'sizes', 'colors', 'rating', 'reviews', 'desc', 'fit', 'material', 'createdAt', 'updatedAt'];
        const esc = (v) => {
          if (v == null) return '';
          let s = typeof v === 'object' ? JSON.stringify(v) : String(v);
          if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
            s = '"' + s.replace(/"/g, '""') + '"';
          }
          return s;
        };
        const lines = [headers.join(',')];
        rows.forEach(p => {
          const seller = p.seller || {};
          lines.push([
            p.id,
            p.name,
            p.sku || p.code || '',
            p.category || '',
            Array.isArray(p.categories) ? p.categories.join('|') : (p.categories || ''),
            Array.isArray(p.tags) ? p.tags.join('|') : (p.tags || ''),
            p.price ?? '',
            p.oldPrice ?? '',
            p.discount ?? '',
            p.stock ?? '',
            p.reorderPoint ?? '',
            p.status || '',
            p.sellerId || seller.id || '',
            p.sellerName || seller.name || '',
            Array.isArray(p.sizes) ? p.sizes.join('|') : (p.sizes || ''),
            Array.isArray(p.colors) ? p.colors.map(c => (c && c.name) ? c.name : c).join('|') : '',
            p.rating ?? '',
            p.reviews ?? '',
            p.desc || p.description || '',
            p.fit || '',
            p.material || p.fabric || '',
            p.createdAt || '',
            p.updatedAt || '',
          ].map(esc).join(','));
        });
        return '\uFEFF' + lines.join('\n');
      };

      const validateProductBackup = (data, opts = {}) => {
        if (!data || typeof data !== 'object') return { ok: false, error: 'فایل نامعتبر است' };
        // فقط بک‌آپ خروجی همین سایت
        if (data.magic !== PRODUCT_BACKUP_MAGIC || data.site !== PRODUCT_BACKUP_SITE) {
          return { ok: false, error: 'این فایل بک‌آپ پیراهن مردانه نیست. فقط فایل خروجی همین سایت قابل بازگردانی است.' };
        }
        if (Number(data.version) !== 1) {
          return { ok: false, error: 'نسخه بک‌آپ پشتیبانی نمی‌شود' };
        }
        const list = Array.isArray(data.products) ? data.products : null;
        if (!list || !list.length) {
          return { ok: false, error: 'فایل بک‌آپ خالی است یا محصولات ندارد' };
        }
        if (opts.requireSource && data.source !== opts.requireSource) {
          return { ok: false, error: opts.requireSource === 'seller'
            ? 'این بک‌آپ مربوط به فروشنده نیست'
            : 'این بک‌آپ مربوط به ادمین نیست' };
        }
        // فروشنده فقط بک‌آپ خودش (یا بدون sellerId قدیمی) را می‌تواند برگرداند
        if (opts.sellerId != null && data.source === 'seller' && data.sellerId != null) {
          const sid = String(opts.sellerId);
          if (String(data.sellerId) !== sid && String(data.sellerId) !== 'own') {
            // allow if phone matches etc.
            if (String(data.sellerId) !== String(opts.sellerPhone || '')) {
              return { ok: false, error: 'این بک‌آپ متعلق به فروشگاه دیگری است و قابل بازگردانی در پنل شما نیست.' };
            }
          }
        }
        return { ok: true, list, meta: data };
      };

      const backupAdminProducts = (fmt = 'json') => {
        const list = adminProducts || [];
        if (!list.length) { showToast({ message: 'محصولی برای بک‌آپ نیست', variant: 'error', duration: 4500, position: 'top-center' }); return; }
        const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
        if (fmt === 'csv') {
          downloadBlobFile(`admin-products-backup-${stamp}.csv`, productsToCsv(list), 'text/csv;charset=utf-8');
          pushLiveToast(`خروجی CSV ادمین: ${toFa(list.length)} محصول`, { type: 'info' });
        } else {
          const payload = productBackupPayload(list, { source: 'admin' });
          downloadBlobFile(`admin-products-backup-${stamp}.json`, JSON.stringify(payload, null, 2), 'application/json;charset=utf-8');
          pushLiveToast(`بک‌آپ کامل JSON ادمین: ${toFa(list.length)} محصول`, { type: 'info' });
        }
      };

      const backupSellerProducts = (fmt = 'json') => {
        const list = sellerProducts || [];
        if (!list.length) { showToast({ message: 'محصولی برای بک‌آپ نیست', variant: 'error', duration: 4500, position: 'top-center' }); return; }
        const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
        const meta = {
          source: 'seller',
          sellerId: sellerUser?.id || sellerUser?.phone || 'own',
          sellerName: sellerUser?.shopName || sellerUser?.name || null,
        };
        if (fmt === 'csv') {
          downloadBlobFile(`seller-products-${stamp}.csv`, productsToWooCsv(list), 'text/csv;charset=utf-8');
          pushLiveToast(`خروجی CSV فروشنده: ${toFa(list.length)} محصول`, { type: 'info' });
        } else {
          const payload = productBackupPayload(list, meta);
          downloadBlobFile(`seller-products-backup-${stamp}.json`, JSON.stringify(payload, null, 2), 'application/json;charset=utf-8');
          pushLiveToast(`بک‌آپ کامل JSON فروشنده: ${toFa(list.length)} محصول`, { type: 'info' });
        }
      };

      const restoreAdminProductsFromFile = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const data = JSON.parse(String(reader.result || ''));
            const check = validateProductBackup(data, { requireSource: 'admin' });
            // ادمین می‌تواند بک‌آپ ادمین یا فروشنده (از همین سایت) را هم وارد کند
            const check2 = check.ok ? check : validateProductBackup(data, {});
            if (!check2.ok) { showToast({ message: String(check2.error), variant: 'error', duration: 4500, position: 'top-center' }); return; }
            const list = check2.list;
            siteConfirm(`بازگردانی ${list.length} محصول از بک‌آپ همین سایت؟\nلیست محصولات ادمین جایگزین می‌شود.`, 'تأیید').then((ok) => {
  if (!ok) return;
  saveAdminProducts(list);
  pushLiveToast(`بازگردانی ${toFa(list.length)} محصول انجام شد`, { type: 'info' });
});          } catch (e) {
            showToast({ message: 'خواندن فایل JSON ناموفق بود. فقط فایل بک‌آپ JSON همین سایت را انتخاب کنید.', variant: 'error', duration: 4500, position: 'top-center' });
          }
        };
        reader.readAsText(file, 'utf-8');
      };

      const restoreSellerProductsFromFile = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const data = JSON.parse(String(reader.result || ''));
            const check = validateProductBackup(data, {
              requireSource: 'seller',
              sellerId: sellerUser?.id || 'own',
              sellerPhone: sellerUser?.phone,
            });
            if (!check.ok) { showToast({ message: String(check.error), variant: 'error', duration: 4500, position: 'top-center' }); return; }
            const list = check.list;
            siteConfirm(`بازگردانی ${list.length} محصول از بک‌آپ فروشگاه خودتان؟\nمحصولات فعلی جایگزین می‌شوند.`, 'تأیید').then((ok) => {
  if (!ok) return;
  saveSellerProducts(list);
  pushLiveToast(`بازگردانی ${toFa(list.length)} محصول انجام شد`, { type: 'info' });
});          } catch (e) {
            showToast({ message: 'خواندن فایل JSON ناموفق بود. فقط بک‌آپ JSON گرفته‌شده از همین سایت (پنل فروشنده) قابل قبول است.', variant: 'error', duration: 4500, position: 'top-center' });
          }
        };
        reader.readAsText(file, 'utf-8');
      };

      const updateSellerProductStock = (id, stock) => {
        const n = Math.max(0, Math.floor(Number(stock) || 0));
        saveSellerProducts((sellerProducts || []).map(p => {
          if (p.id !== id) return p;
          const next = { ...p, stock: n };
          if (n <= 0) next.status = 'inactive';
          else if (p.status === 'inactive' && n > 0 && p.contentStatus !== 'rejected') next.status = 'active';
          // sync simple variants stock if single-variant style
          if (Array.isArray(next.variants) && next.variants.length === 1) {
            next.variants = next.variants.map(v => ({ ...v, stock: n }));
          }
          return next;
        }));
      };

      const setSellerProductOutOfStock = (id) => {
        saveSellerProducts((sellerProducts || []).map(p => p.id === id ? { ...p, stock: 0, status: 'inactive' } : p));
        pushLiveToast('محصول ناموجود شد', { type: 'info' });
      };


      const setSellerProductReorderPoint = (id, point) => {
        const n = Math.max(0, Number(point) || 0);
        saveSellerProducts((sellerProducts || []).map(p => p.id === id ? { ...p, reorderPoint: n } : p));
      };

      // ——— Import WooCommerce / Shopify → ساختار سایت ———
      const [productImportReport, setProductImportReport] = useStoreField(shopUiStore, 'productImportReport');

      const parseCsvText = (text) => {
        const raw = String(text || '').replace(/^\uFEFF/, '');
        const rows = [];
        let i = 0, field = '', row = [], inQ = false;
        while (i < raw.length) {
          const ch = raw[i];
          if (inQ) {
            if (ch === '"') {
              if (raw[i + 1] === '"') { field += '"'; i += 2; continue; }
              inQ = false; i++; continue;
            }
            field += ch; i++; continue;
          }
          if (ch === '"') { inQ = true; i++; continue; }
          if (ch === ',') { row.push(field); field = ''; i++; continue; }
          if (ch === '\n' || ch === '\r') {
            if (ch === '\r' && raw[i + 1] === '\n') i++;
            row.push(field); field = '';
            if (row.some(c => String(c).trim() !== '')) rows.push(row);
            row = []; i++; continue;
          }
          field += ch; i++;
        }
        row.push(field);
        if (row.some(c => String(c).trim() !== '')) rows.push(row);
        if (!rows.length) return { headers: [], records: [] };
        const headers = rows[0].map(h => String(h || '').trim());
        const records = rows.slice(1).map(r => {
          const o = {};
          headers.forEach((h, idx) => { o[h] = r[idx] != null ? String(r[idx]) : ''; });
          return o;
        });
        return { headers, records };
      };

      const detectImportSource = (headers) => {
        const h = headers.map(x => x.toLowerCase());
        const has = (names) => names.some(n => h.includes(n.toLowerCase()));
        if (has(['Handle', 'Option1 Name', 'Variant Price', 'Image Src']) || has(['handle', 'variant price'])) return 'shopify';
        if (has(['Regular price', 'Attribute 1 name', 'Images', 'Published']) || has(['regular price', 'attribute 1 name'])) return 'woocommerce';
        if (has(['Name', 'SKU', 'Categories']) && has(['Regular price', 'Sale price'])) return 'woocommerce';
        return 'unknown';
      };

      const normKey = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
      const pickField = (row, candidates) => {
        const keys = Object.keys(row || {});
        for (const cand of candidates) {
          const hit = keys.find(k => normKey(k) === normKey(cand));
          if (hit && String(row[hit] || '').trim() !== '') return String(row[hit]).trim();
        }
        // partial match
        for (const cand of candidates) {
          const hit = keys.find(k => normKey(k).includes(normKey(cand)));
          if (hit && String(row[hit] || '').trim() !== '') return String(row[hit]).trim();
        }
        return '';
      };

      const splitList = (val) => String(val || '')
        .split(/[,|،;/]+/)
        .map(s => s.trim())
        .filter(Boolean);


      /** کاتالوگ لحظه‌ای ایمپورت (پر از ensureCatalogSnapshot) */
      let _importCatalogSnap = null;
      const _catColors = () => (_importCatalogSnap?.colors?.length ? _importCatalogSnap.colors : (adminCatalogColors || []));
      const _catSizes = () => (_importCatalogSnap?.sizes?.length ? _importCatalogSnap.sizes : (adminCatalogSizes || []));
      const _catBrands = () => (_importCatalogSnap?.brands?.length ? _importCatalogSnap.brands : (adminCatalogBrands || []));
      const _catCategories = () => (_importCatalogSnap?.categories?.length ? _importCatalogSnap.categories : (adminCategories || []));
      const _catTags = () => (_importCatalogSnap?.tags?.length ? _importCatalogSnap.tags : (adminTags || []));
      const _catAttrs = () => (_importCatalogSnap?.attributes?.length ? _importCatalogSnap.attributes : (adminCatalogAttributes || []));

      const matchCatalogColor = (name) => {
        const n = normKey(name);
        return _catColors().find(c => c.active !== false && (normKey(c.name) === n || normKey(c.name).includes(n) || n.includes(normKey(c.name))));
      };
      const matchCatalogSize = (name) => {
        const n = normKey(name);
        if (!n) return null;
        const list = _catSizes().filter(s => s.active !== false);
        let hit = list.find(s => normKey(s.name) === n);
        if (hit) return hit;
        const aliases = { '2xl': 'xxl', 'xxl': '2xl', 'xxx': 'xxxl', '3xl': 'xxxl', 'xs': 'xs', 'xl': 'xl' };
        const alt = aliases[n];
        if (alt) hit = list.find(s => normKey(s.name) === alt);
        if (hit) return hit;
        return list.find(s => normKey(s.name).includes(n) || n.includes(normKey(s.name))) || null;
      };
      const matchCatalogBrand = (name) => {
        const n = normKey(name);
        if (!n) return null;
        return _catBrands().find(b => b.active !== false && (normKey(b.name) === n || normKey(b.name).includes(n) || n.includes(normKey(b.name))));
      };
      const matchCategory = (name) => {
        const n = normKey(name);
        const cats = _catCategories().filter(c => c.active !== false);
        const hit = cats.find(c => normKey(c.name) === n || normKey(c.name).includes(n) || n.includes(normKey(c.name)));
        return hit ? hit.name : null;
      };


      /** snapshot کاتالوگ ادمین برای ایمپورت — همیشه از API تازه می‌گیرد تا فروشنده هم داده داشته باشد */
      const ensureCatalogSnapshot = async () => {
        const snap = {
          colors: Array.isArray(adminCatalogColors) ? adminCatalogColors : [],
          sizes: Array.isArray(adminCatalogSizes) ? adminCatalogSizes : [],
          brands: Array.isArray(adminCatalogBrands) ? adminCatalogBrands : [],
          categories: Array.isArray(adminCategories) ? adminCategories : [],
          tags: Array.isArray(adminTags) ? adminTags : [],
          attributes: Array.isArray(adminCatalogAttributes) ? adminCatalogAttributes : [],
        };
        const load = async (url, key, mapFn) => {
          try {
            const res = await fetch(url, { cache: 'no-store', credentials: 'include' });
            const data = await res.json().catch(() => ({}));
            const list = mapFn(data);
            if (Array.isArray(list) && list.length) snap[key] = list;
          } catch (_) {}
        };
        await Promise.all([
          load('/api/catalog/colors', 'colors', (d) => d.colors || d.items || d.data || []),
          load('/api/catalog/sizes', 'sizes', (d) => d.sizes || d.items || d.data || []),
          load('/api/catalog/brands', 'brands', (d) => d.brands || d.items || d.data || []),
          load('/api/catalog/categories', 'categories', (d) => d.categories || d.items || d.data || []),
          load('/api/catalog/tags', 'tags', (d) => d.tags || d.items || d.data || []),
          load('/api/catalog/attributes', 'attributes', (d) => d.attributes || d.items || d.data || []),
        ]);
        try {
          if (snap.colors.length) setAdminCatalogColors(snap.colors);
          if (snap.sizes.length) setAdminCatalogSizes(snap.sizes);
          if (snap.brands.length) setAdminCatalogBrands(snap.brands);
          if (snap.categories.length) setAdminCategories(snap.categories);
          if (snap.tags.length) setAdminTags(snap.tags);
          if (snap.attributes.length) setAdminCatalogAttributes(snap.attributes);
        } catch (_) {}
        return snap;
      };

      const mapExternalRowToProduct = (row, source, warnings, idx) => {
        let name = '', sku = '', desc = '', price = 0, oldPrice = 0, stock = 0, image = '', status = 'pending';
        let sizeRaw = [], colorRaw = [], catsRaw = [], tagsRaw = [], brandRaw = '';
        let imagesAll = [];
        let extraAttrs = [];

        if (source === 'shopify') {
          name = pickField(row, ['Title', 'title']);
          sku = pickField(row, ['Variant SKU', 'SKU', 'Handle']);
          desc = pickField(row, ['Body (HTML)', 'Body', 'body_html']);
          price = Number(String(pickField(row, ['Variant Price', 'Price'])).replace(/[^\d.]/g, '')) || 0;
          oldPrice = Number(String(pickField(row, ['Variant Compare At Price', 'Compare At Price']) || '').replace(/[^\d.]/g, '')) || 0;
          stock = Number(String(pickField(row, ['Variant Inventory Qty', 'Inventory Qty']).replace(/[^\d]/g, '')) || 0);
          image = pickField(row, ['Image Src', 'Image URL', 'Image']);
          imagesAll = splitList(image).concat(splitList(pickField(row, ['Variant Image']))).filter(Boolean);
          if (row._images) imagesAll = [...imagesAll, ...row._images];
          brandRaw = pickField(row, ['Vendor', 'Brand']);
          catsRaw = splitList(pickField(row, ['Type', 'Product Category', 'Category']));
          tagsRaw = splitList(pickField(row, ['Tags']));
          const opt1n = normKey(pickField(row, ['Option1 Name']));
          const opt1v = pickField(row, ['Option1 Value']);
          const opt2n = normKey(pickField(row, ['Option2 Name']));
          const opt2v = pickField(row, ['Option2 Value']);
          const opt3n = normKey(pickField(row, ['Option3 Name']));
          const opt3v = pickField(row, ['Option3 Value']);
          [[opt1n, opt1v], [opt2n, opt2v], [opt3n, opt3v]].forEach(([n, v]) => {
            if (!v) return;
            if (n.includes('size') || n.includes('سایز') || n === 'size') sizeRaw.push(...splitList(v));
            else if (n.includes('color') || n.includes('colour') || n.includes('رنگ')) colorRaw.push(...splitList(v));
            else if (matchCatalogSize(v)) sizeRaw.push(v);
            else if (matchCatalogColor(v)) colorRaw.push(v);
            else if (n) extraAttrs.push({ name: n, value: v });
          });
          const pub = pickField(row, ['Published']);
          if (pub && /false|0|no/i.test(pub)) status = 'inactive';
          else status = 'pending';
        } else {
          // WooCommerce
          name = pickField(row, ['Name', 'Post Title', 'Title']);
          sku = pickField(row, ['SKU', 'Id', 'ID']);
          desc = pickField(row, ['Description', 'Short description', 'Short Description']);
          price = Number(String(pickField(row, ['Regular price', 'Regular Price', 'Price'])).replace(/[^\d.]/g, '')) || 0;
          oldPrice = Number(String(pickField(row, ['Sale price', 'Sale Price'])).replace(/[^\d.]/g, '')) || 0;
          // if sale price is lower, swap semantics: our oldPrice = regular, price = sale
          const reg = price;
          const sale = oldPrice;
          if (sale > 0 && sale < reg) { price = sale; oldPrice = reg; }
          else { oldPrice = 0; }
          stock = Number(String(pickField(row, ['Stock', 'In stock?', 'Stock quantity']).replace(/[^\d]/g, '')) || 0);
          imagesAll = splitList(pickField(row, ['Images', 'Image', 'Featured image']));
          image = imagesAll[0] || '';
          catsRaw = splitList(pickField(row, ['Categories', 'Category']));
          tagsRaw = splitList(pickField(row, ['Tags', 'Tag']));
          brandRaw = pickField(row, ['Brands', 'Brand', 'Attribute: Brand', 'Attribute 3 value(s)']);
          // attributes
          for (let a = 1; a <= 5; a++) {
            const an = normKey(pickField(row, [`Attribute ${a} name`, `Attribute ${a} Name`]));
            const av = pickField(row, [`Attribute ${a} value(s)`, `Attribute ${a} value`, `Attribute ${a} Values`]);
            if (!an && !av) continue;
            if (an.includes('size') || an.includes('سایز')) sizeRaw.push(...splitList(av));
            else if (an.includes('color') || an.includes('colour') || an.includes('رنگ')) colorRaw.push(...splitList(av));
            else if (an.includes('brand') || an.includes('برند')) brandRaw = brandRaw || av;
            else {
              extraAttrs.push({ name: an, value: av });
              splitList(av).forEach(v => {
                if (matchCatalogSize(v)) sizeRaw.push(v);
                else if (matchCatalogColor(v)) colorRaw.push(v);
              });
            }
          }
          const pub = pickField(row, ['Published', 'Status']);
          if (pub && (/^-1$|draft|private|0/i.test(pub))) status = 'inactive';
          else status = 'pending';
        }

        if (!name) {
          warnings.push(`ردیف ${idx + 1}: بدون نام — رد شد`);
          return null;
        }
        if (!(price > 0)) {
          warnings.push(`«${name}»: قیمت نامعتبر — رد شد`);
          return null;
        }

        // ——— نگاشت نرم: فقط مقادیر کاتالوگ ادمین ذخیره می‌شود؛ ناشناخته‌ها با fallback و هشدار ———
        // سایز
        const unmatchedSizes = [...new Set(sizeRaw)].filter(s => !matchCatalogSize(s));
        let sizes = [...new Set(sizeRaw.map(s => matchCatalogSize(s)?.name).filter(Boolean))];
        if (unmatchedSizes.length) {
          warnings.push(`«${name}»: سایزهای خارج از کاتالوگ نادیده گرفته شد: ${unmatchedSizes.join('، ')}`);
        }
        if (!sizes.length) {
          const fallbackSizes = _catSizes().filter(s => s.active !== false).map(s => s.name);
          const prefer = ['M', 'L', 'S', 'XL'].map(x => fallbackSizes.find(s => normKey(s) === normKey(x))).filter(Boolean);
          sizes = prefer.length ? prefer.slice(0, 2) : fallbackSizes.slice(0, 2);
          if (!sizes.length) sizes = ['M'];
          warnings.push(`«${name}»: سایز از کاتالوگ ادمین جایگزین شد (${sizes.join('، ')})`);
        }

        // رنگ
        const unmatchedColors = [...new Set(colorRaw)].filter(cn => !matchCatalogColor(cn));
        let colors = [];
        [...new Set(colorRaw)].forEach(cn => {
          const hit = matchCatalogColor(cn);
          if (hit) colors.push({ name: hit.name, hex: hit.hex, image: image || undefined });
        });
        if (unmatchedColors.length) {
          warnings.push(`«${name}»: رنگ‌های خارج از کاتالوگ نادیده گرفته شد: ${unmatchedColors.join('، ')}`);
        }
        if (!colors.length) {
          const fb = _catColors().find(c => c.active !== false);
          if (fb) {
            colors = [{ name: fb.name, hex: fb.hex, image: image || undefined }];
            warnings.push(`«${name}»: رنگ از کاتالوگ ادمین جایگزین شد (${fb.name})`);
          } else {
            colors = [{ name: 'پیش‌فرض', hex: '#888888', image: image || undefined }];
            warnings.push(`«${name}»: رنگ پیش‌فرض اعمال شد (کاتالوگ رنگ ادمین خالی است)`);
          }
        }
        if (image) colors = colors.map((c, i) => (i === 0 ? { ...c, image } : c));

        // برند — در صورت نبود، اولین برند فعال ادمین
        let brandObj = matchCatalogBrand(brandRaw);
        if (!brandObj) {
          brandObj = _catBrands().find(b => b.active !== false) || null;
          if (brandObj) {
            warnings.push(`«${name}»: برند «${brandRaw || 'خالی'}» در کاتالوگ نبود — جایگزین: ${brandObj.name}`);
          } else {
            warnings.push(`«${name}»: رد شد — هیچ برندی در کاتالوگ ادمین تعریف نشده`);
            return null;
          }
        }

        // دسته — در صورت نبود، اولین دسته فعال
        let categories = [...new Set(catsRaw.map(x => matchCategory(x)).filter(Boolean))].slice(0, 3);
        const unmatchedCats = [...new Set(catsRaw)].filter(x => !matchCategory(x));
        if (unmatchedCats.length) {
          warnings.push(`«${name}»: دسته‌های خارج از لیست ادمین نادیده گرفته شد: ${unmatchedCats.join('، ')}`);
        }
        if (!categories.length) {
          const fbCat = _catCategories().find(c => c.active !== false);
          if (fbCat) {
            categories = [fbCat.name];
            warnings.push(`«${name}»: دسته از لیست ادمین جایگزین شد (${fbCat.name})`);
          } else {
            categories = ['عمومی'];
            warnings.push(`«${name}»: دسته «عمومی» اعمال شد (دسته‌بندی ادمین خالی است)`);
          }
        }

        // برچسب: فقط برچسب‌های تعریف‌شده ادمین (اگر ادمین تگ داشته باشد)
        const adminTagNames = _catTags().filter(t => t.active !== false).map(t => t.name);
        let tags = [];
        if (adminTagNames.length) {
          const unmatchedTags = tagsRaw.filter(t => !adminTagNames.some(a => normKey(a) === normKey(t)));
          tags = tagsRaw.filter(t => adminTagNames.some(a => normKey(a) === normKey(t))).slice(0, 5);
          if (unmatchedTags.length) {
            warnings.push(`«${name}»: برچسب‌های خارج از لیست ادمین حذف شد: ${unmatchedTags.join('، ')}`);
          }
        } else {
          // اگر ادمین هنوز تگی نساخته، برچسب‌ها وارد نمی‌شوند
          tags = [];
          if (tagsRaw.length) warnings.push(`«${name}»: برچسب‌ها وارد نشد (هنوز برچسبی در پنل ادمین تعریف نشده)`);
        }
                const discount = oldPrice > price && oldPrice > 0 ? Math.round((1 - price / oldPrice) * 100) : undefined;
        const priceText = toFa(Math.round(price).toLocaleString('en-US'));

        // تصاویر: لیست URLها · اولی = تصویر شاخص
        const imgList = (Array.isArray(imagesAll) ? imagesAll : (image ? [image] : []))
          .map(u => String(u || '').trim())
          .filter(Boolean)
          .slice(0, 3);
        if (imgList.length && colors.length) {
          colors = colors.map((col, i) => ({ ...col, image: col.image || imgList[Math.min(i, imgList.length - 1)] }));
          colors[0] = { ...colors[0], image: imgList[0] };
        }

        // ویژگی‌ها از attributeهای فایل → فقط گزینه‌های کاتالوگ ادمین
        const attributes = {};
        const attrWarnings = [];
        _catAttrs().filter(a => a.active !== false).forEach(attr => {
          const limited = attr.categoryNames || [];
          if (limited.length && !categories.some(cat => limited.includes(cat))) return;
          // پیدا کردن مقدار خام هم‌نام
          let rawVals = [];
          (extraAttrs || []).forEach(({ name: an, value: av }) => {
            if (normKey(an) === normKey(attr.name) || normKey(an).includes(normKey(attr.name)) || normKey(attr.name).includes(normKey(an))) {
              rawVals.push(...splitList(av));
            }
          });
          const matched = rawVals.filter(v => (attr.options || []).some(o => normKey(o) === normKey(v)));
          const mapped = matched.map(v => (attr.options || []).find(o => normKey(o) === normKey(v))).filter(Boolean);
          if (attr.required && !mapped.length) {
            attrWarnings.push(attr.name);
            return;
          }
          if (mapped.length) {
            attributes[attr.id] = attr.multi ? [...new Set(mapped)] : mapped[0];
          }
        });
        if (attrWarnings.length) {
          warnings.push(`«${name}»: ویژگی اجباری بدون مقدار معتبر نادیده گرفته شد: ${attrWarnings.join('، ')}`);
        }

        const _impId = 'imp-' + Date.now() + '-' + idx + '-' + Math.random().toString(36).slice(2, 6);
        const _impCode = generateProductCode(brandObj?.id || brandObj?.name || 'IMP', _impId);
        return {
          id: _impId,
          productCode: _impCode,
          name,
          sku: sku || undefined,
          category: categories[0],
          categories,
          tags,
          desc: desc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 2000),
          price: Math.round(price),
          oldPrice: oldPrice > price ? toFa(Math.round(oldPrice).toLocaleString('en-US')) : undefined,
          discount,
          priceText,
          stock: Math.max(0, Math.round(stock)),
          sizes,
          colors,
          brandId: brandObj?.id,
          brand: brandObj?.name,
          brandName: brandObj?.name,
          attributes,
          images: imgList,
          featuredImageIndex: 0,
          status,
          contentStatus: 'pending',
          rating: 0,
          reviews: 0,
          sellerName: brandObj?.name || 'وارداتی',
          sellerId: 'import',
          importSource: source,
          importedAt: new Date().toISOString(),
        };
      };

      const importExternalProductsCsv = (file, target = 'admin') => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const { headers, records } = parseCsvText(String(reader.result || ''));
            if (!headers.length || !records.length) {
              showToast({ message: 'فایل CSV خالی یا نامعتبر است', variant: 'error', duration: 4500, position: 'top-center' });
              return;
            }
            const source = detectImportSource(headers);
            if (source === 'unknown') {
              showToast({ message: 'فرمت CSV تشخیص داده نشد.\\nخروجی استاندارد WooCommerce یا Shopify را آپلود کنید.', variant: 'default', duration: 4500, position: 'top-center' });
              return;
            }
            // Shopify often has one row per variant — group by Handle/Title
            let rows = records;
            if (source === 'shopify') {
              const grouped = new Map();
              records.forEach((r) => {
                const key = pickField(r, ['Handle', 'Title']) || JSON.stringify(r);
                if (!grouped.has(key)) grouped.set(key, { ...r, _sizes: [], _colors: [] });
                const g = grouped.get(key);
                const opt1n = normKey(pickField(r, ['Option1 Name']));
                const opt1v = pickField(r, ['Option1 Value']);
                const opt2n = normKey(pickField(r, ['Option2 Name']));
                const opt2v = pickField(r, ['Option2 Value']);
                [[opt1n, opt1v], [opt2n, opt2v]].forEach(([n, v]) => {
                  if (!v) return;
                  if (n.includes('size') || n.includes('سایز')) g._sizes.push(v);
                  else if (n.includes('color') || n.includes('colour') || n.includes('رنگ')) g._colors.push(v);
                });
                const img = pickField(r, ['Image Src']);
                if (img) {
                  g._images = g._images || [];
                  if (!g._images.includes(img)) g._images.push(img);
                  if (!pickField(g, ['Image Src'])) g['Image Src'] = img;
                }
                const inv = Number(String(pickField(r, ['Variant Inventory Qty']).replace(/[^\d]/g, '')) || 0);
                g['Variant Inventory Qty'] = String((Number(g['Variant Inventory Qty'] || 0) || 0) + inv);
              });
              rows = [...grouped.values()].map(g => {
                // inject collected options into option fields for mapper
                if (g._sizes?.length) {
                  g['Option1 Name'] = 'Size';
                  g['Option1 Value'] = [...new Set(g._sizes)].join(', ');
                }
                if (g._colors?.length) {
                  g['Option2 Name'] = 'Color';
                  g['Option2 Value'] = [...new Set(g._colors)].join(', ');
                }
                return g;
              });
            }

            // کاتالوگ ادمین را تازه کن تا نگاشت فروشنده همیشه کار کند
            try {
              _importCatalogSnap = await ensureCatalogSnapshot();
            } catch (_) {
              _importCatalogSnap = null;
            }
            if (!_importCatalogSnap?.brands?.length && !_catBrands().length) {
              showToast({
                message: 'هنوز برندی در پنل ادمین تعریف نشده. ابتدا برند را در ادمین بسازید.',
                variant: 'error',
                duration: 6000,
                position: 'top-center',
              });
              setProductImportReport({
                source,
                total: rows.length,
                imported: 0,
                skipped: rows.length,
                warnings: ['کاتالوگ برند ادمین خالی است — ورود ممکن نیست'],
              });
              return;
            }

            const warnings = [];
            const products = [];
            rows.forEach((row, idx) => {
              const p = mapExternalRowToProduct(row, source, warnings, idx);
              if (p) products.push(p);
            });
            _importCatalogSnap = null;

            if (!products.length) {
              showToast({ message: 'هیچ محصول قابل واردسازی پیدا نشد.', variant: 'default', duration: 4500, position: 'top-center' });
              setProductImportReport({ source, total: rows.length, imported: 0, skipped: rows.length, warnings });
              return;
            }

            siteConfirm(`${products.length} محصول از ${source === 'shopify' ? 'Shopify' : 'WooCommerce'} آماده ورود است.\nادامه؟`, 'تأیید').then(async (ok) => {
              if (!ok) return;
              if (target === 'seller') {
                let okCount = 0;
                const failMsgs = [];
                const created = [];
                for (let i = 0; i < products.length; i++) {
                  const p = products[i];
                  try {
                    const payload = {
                      name: p.name,
                      title: p.name,
                      price: p.price,
                      base_price: p.price,
                      stock: p.stock,
                      category: p.category,
                      categories: p.categories || (p.category ? [p.category] : []),
                      brand: p.brand || p.brandName,
                      brandName: p.brandName || p.brand,
                      brandId: p.brandId,
                      description: p.desc || p.description || '',
                      desc: p.desc || p.description || '',
                      images: Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []),
                      cover_image: (Array.isArray(p.images) && p.images[0]) || p.image || null,
                      colors: p.colors || [],
                      sizes: p.sizes || [],
                      tags: p.tags || [],
                      sku: p.sku,
                      productCode: p.productCode,
                      product_code: p.productCode,
                      status: 'pending',
                      payload: {
                        sizes: p.sizes || [],
                        colors: p.colors || [],
                        tags: p.tags || [],
                        attributes: p.attributes || {},
                        oldPrice: p.oldPrice,
                        discount: p.discount,
                        sku: p.sku,
                        importSource: source,
                      },
                    };
                    if (typeof createSellerProductOnServer !== 'function') {
                      throw new Error('API ثبت محصول در دسترس نیست');
                    }
                    const row = await createSellerProductOnServer(payload);
                    if (row) {
                      okCount += 1;
                      created.push(row);
                    }
                  } catch (err) {
                    failMsgs.push((p.name || ('#' + (i + 1))) + ': ' + (err && err.message ? err.message : 'خطا'));
                  }
                }
                try {
                  if (typeof refreshSellerProducts === 'function') await refreshSellerProducts();
                  else if (created.length && typeof setSellerProducts === 'function') {
                    const mapped = created.map((row) =>
                      typeof mapServerProductToSellerUi === 'function' ? mapServerProductToSellerUi(row) : row
                    ).filter(Boolean);
                    setSellerProducts([...(sellerProducts || []), ...mapped]);
                  }
                } catch (_) {}
                setProductImportReport({
                  source,
                  total: rows.length,
                  imported: okCount,
                  skipped: products.length - okCount,
                  warnings: [...(warnings || []).slice(0, 20), ...failMsgs.slice(0, 20)],
                });
                try {
                  if (typeof hydrateCatalogFromApi === 'function') hydrateCatalogFromApi();
                  window.dispatchEvent(new CustomEvent('catalog-refetch'));
                } catch (_) {}
                if (okCount > 0) {
                  pushLiveToast(`${toFa(okCount)} از ${toFa(products.length)} محصول روی سرور ثبت شد (در انتظار تأیید ادمین)`, { type: 'info', duration: 5000 });
                } else {
                  showToast({
                    message: failMsgs[0] || 'ورود محصول ناموفق بود',
                    variant: 'error',
                    duration: 5500,
                    position: 'top-center',
                  });
                }
              } else {
                saveAdminProducts([...(adminProducts || []), ...products]);
                setProductImportReport({
                  source,
                  total: rows.length,
                  imported: products.length,
                  skipped: rows.length - products.length,
                  warnings: warnings.slice(0, 40),
                });
                pushLiveToast(`${toFa(products.length)} محصول از ${source === 'shopify' ? 'Shopify' : 'ووکامرس'} وارد شد`, { type: 'info', duration: 4500 });
              }
            });
          } catch (e) {
            console.error(e);
            showToast({ message: 'خطا در خواندن CSV. مطمئن شوید فایل خروجی استاندارد است.', variant: 'error', duration: 4500, position: 'top-center' });
          }
        };
        reader.readAsText(file, 'utf-8');
      };

      const saveAdminOrders = (next) => { setAdminOrders(next); publishRealtime('adminOrders', next); };
      const setAdminOrderStatus = async (orderId, status) => {
        const ok = await patchOrderStatusOnServer(orderId, status, 'admin');
        if (ok) {
          setAdminOrders((prev) => (prev || []).map((o) => (String(o.id) === String(orderId) ? { ...o, status } : o)));
        }
        return ok;
      };
      const saveAdminCoupons = (next) => {
        setAdminCoupons(next);
        publishRealtime('adminCoupons', next);
        try { localStorage.setItem('adminCoupons', JSON.stringify(next || [])); } catch (_) {}
      };
      const hydrateBlogPostsFromApi = async () => {
        try {
          const res = await fetch('/api/blog?all=1', { credentials: 'include', cache: 'no-store' });
          const json = await res.json().catch(() => ({}));
          const list = json?.posts || json?.items || [];
          if (!json?.ok || !Array.isArray(list)) return;
          const mapped = list.map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            excerpt: p.excerpt,
            body: p.body,
            status: p.status,
            cover: p.cover_image || p.cover_url,
            date: p.published_at || p.created_at,
            published_at: p.published_at,
          }));
          try {
            if (typeof setBlogPosts === 'function') setBlogPosts(mapped);
          } catch (_) {}
          try { localStorage.setItem('adminBlogPosts', JSON.stringify(mapped)); } catch (_) {}
        } catch (_) {}
      };
      const hydrateAdminCoupons = async () => {
        try {
          const res = await fetch('/api/coupons?admin=1', { credentials: 'include', cache: 'no-store' });
          const json = await res.json().catch(() => ({}));
          if (!json?.ok || !Array.isArray(json.items)) return;
          const mapped = json.items.map((c) => ({
            id: c.id,
            code: c.code,
            type: c.type === 'amount' ? 'amount' : 'percent',
            value: c.value,
            status: c.active === false ? 'inactive' : 'active',
            title: c.title || '',
            min_cart: c.min_cart,
            max_uses: c.max_uses,
            used_count: c.used_count,
            starts_at: c.starts_at,
            ends_at: c.ends_at,
          }));
          setAdminCoupons(mapped);
          try { localStorage.setItem('adminCoupons', JSON.stringify(mapped)); } catch (_) {}
        } catch (_) {}
      };
      const createAdminCouponOnServer = async (coupon) => {
        try {
          const res = await fetch('/api/coupons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              code: coupon.code,
              type: coupon.type === 'amount' ? 'amount' : 'percent',
              value: coupon.value,
              title: coupon.title || coupon.code,
              active: coupon.status !== 'inactive',
              min_cart: coupon.min_cart || 0,
              max_uses: coupon.max_uses ?? null,
            }),
          });
          const json = await res.json().catch(() => ({}));
          return json?.ok ? json.coupon : null;
        } catch (_) {
          return null;
        }
      };
      const saveAdminTickets = (next) => { setAdminTickets(next); publishRealtime('adminTickets', next); };
      const saveAdminBuyers = (next) => { setAdminBuyers(next); publishRealtime('adminBuyers', next); };
      const saveAdminSettings = (next) => { setAdminSettings(next); try { localStorage.setItem('adminSettings', JSON.stringify(next)); } catch (_) {} };

      // یک‌بار: همگام‌سازی توضیح فروشگاه از adminSettings به CMS واحد
      useEffect(() => {
        try {
          const cmsBody = (adminPageContent && adminPageContent.shop && adminPageContent.shop.body) || '';
          const fromSettings = adminSettings?.shopSeoHtml || adminSettings?.shopSeoText || '';
          if (fromSettings && !String(cmsBody).trim()) {
            const plain = String(fromSettings).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500);
            saveAdminPageContentMap({
              ...(adminPageContent || {}),
              shop: {
                ...((adminPageContent && adminPageContent.shop) || {}),
                body: fromSettings,
                updatedAt: new Date().toISOString(),
              },
            });
            if (!adminSettings?.shopSeoHtml) {
              saveAdminSettings({ ...adminSettings, shopSeoHtml: fromSettings, shopSeoText: plain });
            }
          }
        } catch (_) {}
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);


      const seoCfg = () => ({ ...defaultSeoConfig(), ...(adminSettings?.seo || {}) });

      const saveSeoPatch = (patch) => {
        const next = { ...adminSettings, seo: { ...seoCfg(), ...patch } };
        saveAdminSettings(next);
      };

      /** کلید و پیش‌فرض SEO برای صفحهٔ فعلی (ویرایش ادمین روی فرانت) */
      const getCurrentPageSeoContext = () => {
        const s = seoCfg();
        if (pdpProduct) {
          return {
            key: `product:${pdpProduct.id}`,
            type: 'product',
            typeLabel: 'صفحه محصول',
            label: pdpProduct.name,
            defaults: {
              title: pdpProduct.seoTitle || pdpProduct.name || '',
              description: pdpProduct.seoDescription || pdpProduct.desc || '',
              slug: pdpProduct.slug || pdpProduct.productCode || String(pdpProduct.id),
              indexable: s.indexProducts !== false,
            },
            canEditContent: true,
          };
        }
        if (showPLP && plpCats?.length === 1) {
          const catName = plpCats[0];
          const cat = (adminCategories || []).find(x => x.name === catName);
          return {
            key: `category:${cat?.slug || catName}`,
            type: 'category',
            typeLabel: 'دسته‌بندی',
            label: catName,
            defaults: {
              title: cat?.seoTitle || catName,
              description: cat?.seoDescription || cat?.description || s.categoriesIndexSeoText || '',
              slug: cat?.slug || slugifyTaxonomy(catName),
              indexable: s.indexCategories !== false,
            },
          };
        }
        if (showPLP && plpTagFilter?.length) {
          const tagName = plpTagFilter[0];
          const tag = (adminTags || []).find(x => x.name === tagName);
          return {
            key: `tag:${tag?.slug || tagName}`,
            type: 'tag',
            typeLabel: 'برچسب',
            label: tagName,
            defaults: {
              title: tag?.seoTitle || tagName,
              description: tag?.seoDescription || '',
              slug: tag?.slug || slugifyTaxonomy(tagName),
              indexable: !!s.indexTags,
            },
          };
        }
        if (showPLP) {
          return {
            key: 'plp',
            type: 'plp',
            typeLabel: 'فروشگاه / لیست محصولات',
            label: 'فروشگاه',
            defaults: {
              title: 'فروشگاه',
              description: s.metaDescription || '',
              slug: 'shop',
              indexable: s.indexCategories !== false,
            },
          };
        }
        if (staticPage === 'blog-post' && blogPosts?.length) {
          const post = blogPosts.find(b => String(b.id) === String(brandDetailId || blogForm?.id)) || blogPosts[0];
          // try active blog post from static context - use first matching if state exists
          return {
            key: `blog-post:${post?.id || 'x'}`,
            type: 'blog-post',
            typeLabel: 'مقاله بلاگ',
            label: post?.title || 'مقاله',
            defaults: {
              title: post?.seoTitle || post?.title || '',
              description: post?.seoDescription || post?.excerpt || '',
              slug: post?.slug || String(post?.id || ''),
              indexable: s.indexBlogPosts !== false,
            },
          };
        }
        if (staticPage === 'blog') {
          return {
            key: 'blog',
            type: 'blog',
            typeLabel: 'بلاگ',
            label: 'بلاگ',
            defaults: { title: 'بلاگ', description: '', slug: 'blog', indexable: s.indexBlog !== false },
          };
        }
        if (staticPage) {
          const labels = { about: 'درباره ما', contact: 'تماس با ما', faq: 'سوالات متداول', terms: 'قوانین و شرایط', returns: 'شرایط بازگشت کالا', privacy: 'حریم خصوصی', cookies: 'کوکی', 'size-guide': 'راهنمای سایز', 'become-seller': 'فروشنده شوید', brands: 'برندها', campaigns: 'کمپین‌ها', deals: 'شگفت‌انگیز', amazing: 'شگفت‌انگیز', home: 'صفحه اصلی', sellers: 'فروشندگان', sitemap: 'نقشه سایت' };
          return {
            key: `static:${staticPage}`,
            type: 'static',
            typeLabel: 'صفحه ثابت',
            label: labels[staticPage] || staticPage,
            defaults: {
              title: labels[staticPage] || staticPage,
              description: '',
              slug: staticPage,
              indexable: s.indexStatic !== false,
            },
          };
        }
        if (activeSellerId) {
          return {
            key: `seller:${activeSellerId}`,
            type: 'seller',
            typeLabel: 'صفحه فروشنده',
            label: String(activeSellerId),
            defaults: { title: '', description: '', slug: String(activeSellerId), indexable: s.indexSellers !== false },
          };
        }
        if (showSellersList) {
          return {
            key: 'sellers',
            type: 'sellers',
            typeLabel: 'فهرست فروشندگان',
            label: 'فروشندگان',
            defaults: { title: 'فروشندگان', description: '', slug: 'sellers', indexable: true },
          };
        }
        if (showAdminPanel) {
          return { key: 'admin', type: 'admin', typeLabel: 'پنل ادمین', label: 'ادمین', defaults: { title: 'پنل ادمین', description: '', slug: 'admin', indexable: false } };
        }
        return {
          key: 'home',
          type: 'home',
          typeLabel: 'صفحه اصلی',
          label: 'خانه',
          defaults: {
            title: s.siteTitle || 'پیراهن مردانه',
            description: s.metaDescription || '',
            slug: '',
            indexable: s.indexHome !== false && s.globalIndex !== false,
          },
        };
      };

      const getResolvedPageSeo = (ctx) => {
        const ctx0 = ctx || getCurrentPageSeoContext();
        const ov = pageSeoMap[ctx0.key] || {};
        return {
          title: ov.title != null && ov.title !== '' ? ov.title : ctx0.defaults.title,
          description: ov.description != null && ov.description !== '' ? ov.description : ctx0.defaults.description,
          slug: ov.slug != null && ov.slug !== '' ? ov.slug : ctx0.defaults.slug,
          indexable: ov.indexable != null ? !!ov.indexable : !!ctx0.defaults.indexable,
          focusKeywords: ov.focusKeywords != null ? ov.focusKeywords : (ctx0.defaults.focusKeywords || ''),
          canonical: ov.canonical != null ? ov.canonical : (ctx0.defaults.canonical || ''),
          ogImage: ov.ogImage != null ? ov.ogImage : (ctx0.defaults.ogImage || ''),
          faq: Array.isArray(ov.faq) ? ov.faq : (ctx0.defaults.faq || []),
          hasOverride: !!pageSeoMap[ctx0.key],
        };
      };


      /** ——— فاز A: ابزارهای سئوی محتوا (باکس + head + schema + llms) ——— */
      const stripHtmlSeo = (html) => String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const measureSeoPx = (text, font) => {
        const str = String(text || '');
        if (typeof document === 'undefined') {
          const avg = /20px|18px|16px/i.test(font) ? 9.2 : 7.0;
          return Math.ceil(str.length * avg);
        }
        try {
          if (!measureSeoPx._canvas) measureSeoPx._canvas = document.createElement('canvas');
          const ctx = measureSeoPx._canvas.getContext('2d');
          if (!ctx) return Math.ceil(str.length * 8);
          ctx.font = font;
          return Math.ceil(ctx.measureText(str).width);
        } catch (_) {
          return Math.ceil(str.length * 8);
        }
      };
      /** محدودیت تقریبی عرض نمایش گوگل (پیکسل) */
      const SEO_PX_LIMITS = {
        titleDesktop: 600,
        titleMobile: 560,
        descDesktop: 960,
        descMobile: 680,
      };
      const SEO_FONTS = {
        titleDesktop: '400 20px arial, sans-serif',
        titleMobile: '400 16px arial, sans-serif',
        descDesktop: '400 14px arial, sans-serif',
        descMobile: '400 12px arial, sans-serif',
      };
      const seoPixelReport = (val, kind) => {
        const text = String(val || '');
        const deskLim = kind === 'title' ? SEO_PX_LIMITS.titleDesktop : SEO_PX_LIMITS.descDesktop;
        const mobLim = kind === 'title' ? SEO_PX_LIMITS.titleMobile : SEO_PX_LIMITS.descMobile;
        const deskPx = measureSeoPx(text, kind === 'title' ? SEO_FONTS.titleDesktop : SEO_FONTS.descDesktop);
        const mobPx = measureSeoPx(text, kind === 'title' ? SEO_FONTS.titleMobile : SEO_FONTS.descMobile);
        const chars = text.length;
        const statusOf = (px, lim) => {
          if (!chars) return 'empty';
          const ratio = px / lim;
          if (ratio > 1) return 'over';
          if (ratio < 0.45) return 'short';
          if (ratio > 0.92) return 'near';
          return 'ok';
        };
        const dKey = statusOf(deskPx, deskLim);
        const mKey = statusOf(mobPx, mobLim);
        const worst = [dKey, mKey].includes('over') ? 'over' : ([dKey, mKey].includes('short') ? 'short' : ([dKey, mKey].includes('near') ? 'near' : (chars ? 'ok' : 'empty')));
        const tone = worst === 'over' ? 'text-red-500' : (worst === 'short' || worst === 'near') ? 'text-amber-600' : worst === 'ok' ? 'text-emerald-600' : 'text-primary-400';
        const label = !chars
          ? `خالی · هدف دسکتاپ ≤${deskLim}px`
          : `دسکتاپ ${deskPx}/${deskLim}px · موبایل ${mobPx}/${mobLim}px · ${chars} نویسه`;
        return {
          chars, deskPx, mobPx, deskLim, mobLim,
          deskRatio: Math.min(1.25, deskPx / Math.max(1, deskLim)),
          mobRatio: Math.min(1.25, mobPx / Math.max(1, mobLim)),
          deskOver: deskPx > deskLim,
          mobOver: mobPx > mobLim,
          tone, label, worst,
        };
      };
      const seoCharHint = (val, min, max) => {
        const kind = (max != null && max <= 70) ? 'title' : 'desc';
        const r = seoPixelReport(val, kind);
        return { n: r.chars, tone: r.tone, label: r.label, report: r };
      };
      const SeoPixelBars = ({ report }) => {
        if (!report) return null;
        const bar = (ratio, over) => (
          <div className="h-1.5 rounded-full bg-primary-200 dark:bg-white/15 overflow-hidden flex-1 min-w-[4rem]">
            <div
              className={`h-full rounded-full transition-all ${over ? 'bg-red-500' : (ratio > 0.92 || (ratio < 0.45 && report.chars)) ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(100, Math.round((ratio || 0) * 100))}%` }}
            />
          </div>
        );
        return (
          <div className="mt-1.5 space-y-1">
            <div className="flex items-center gap-2 text-[10px] text-primary-500 dark:text-white/60">
              <span className="w-14 flex-shrink-0">دسکتاپ</span>
              {bar(report.deskRatio, report.deskOver)}
              <span className={`tabular-nums flex-shrink-0 ${report.deskOver ? 'text-red-500 font-medium' : ''}`}>{report.deskPx}/{report.deskLim}px</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-primary-500 dark:text-white/60">
              {bar(report.mobRatio, report.mobOver)}
              <span className={`tabular-nums flex-shrink-0 ${report.mobOver ? 'text-red-500 font-medium' : ''}`}>{report.mobPx}/{report.mobLim}px</span>
            </div>
            <p className="text-[10px] text-primary-400 dark:text-white/50">محاسبه با عرض پیکسل نمایش گوگل (فونت تقریبی Arial) · نه صرفاً تعداد کاراکتر</p>
          </div>
        );
      };

      const buildLlmsTxt = () => {
        const s = seoCfg();
        const base = (s.canonicalBase || 'https://pirahanemardane.ir').replace(/\/$/, '');
        const lines = [
          '# llms.txt — راهنمای مختصر برای دستیارهای AI',
          `# Site: ${s.siteTitle || 'پیراهن مردانه'}`,
          `# Base: ${base}`,
          '',
          '## Summary',
          s.metaDescription || 'فروشگاه اینترنتی پیراهن مردانه',
          '',
          '## Key pages',
          `- Home: ${base}/`,
          `- Shop: ${base}/shop`,
          `- Blog: ${base}/blog`,
          `- About: ${base}/about`,
          `- Contact: ${base}/contact`,
          '',
          '## Sitemap',
          `- ${base}/sitemap.xml`,
          '',
          '## Policy',
          '- Prefer official product pages for prices and availability.',
          '- Do not invent stock, price, or seller claims.',
        ];
        if (s.llmsTxtExtra) lines.push('', '## Extra', s.llmsTxtExtra.trim());
        return lines.join('\n');
      };
      const setOrCreateMeta = (attr, key, content) => {
        if (content == null || content === '') return;
        let el = document.querySelector(`meta[${attr}="${key}"]`);
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute(attr, key);
          document.head.appendChild(el);
        }
        el.setAttribute('content', String(content));
      };
      const setCanonicalLink = (href) => {
        if (!href) return;
        let el = document.querySelector('link[rel="canonical"]');
        if (!el) {
          el = document.createElement('link');
          el.setAttribute('rel', 'canonical');
          document.head.appendChild(el);
        }
        el.setAttribute('href', href);
      };
      const upsertJsonLd = (id, data) => {
        let el = document.getElementById(id);
        if (!data) {
          if (el) el.remove();
          return;
        }
        if (!el) {
          el = document.createElement('script');
          el.id = id;
          el.type = 'application/ld+json';
          document.head.appendChild(el);
        }
        el.textContent = typeof data === 'string' ? data : JSON.stringify(data);
      };
      const defaultOrganizationSchema = () => {
        const s = seoCfg();
        const base = (s.canonicalBase || 'https://pirahanemardane.ir').replace(/\/$/, '');
        if (s.schemaOrgJson && String(s.schemaOrgJson).trim().startsWith('{')) {
          try { return JSON.parse(s.schemaOrgJson); } catch (_) {}
        }
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: s.siteTitle || 'پیراهن مردانه',
          url: base,
          logo: base + '/logo.webp',
          description: s.metaDescription || '',
        };
      };
      const buildProductSchema = (p) => {
        if (!p) return null;
        const s = seoCfg();
        const base = (s.canonicalBase || 'https://pirahanemardane.ir').replace(/\/$/, '');
        const price = Number(p.price) || Number(String(p.price || '').replace(/[^\d]/g, '')) || 0;
        const stock = Number(p.stock);
        const inStock = Number.isFinite(stock) ? stock > 0 : p.inStock !== false;
        const availability = inStock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock';
        const images = [];
        const pushImg = (u) => { if (u && !images.includes(u)) images.push(u); };
        pushImg(p.seoOgImage);
        (p.images || []).forEach(pushImg);
        (p.colors || []).forEach((c) => pushImg(c?.image));
        pushImg(p.image);
        const brandName = p.brandName || p.brand || p.seller?.name || s.organizationName || 'پیراهن مردانه';
        const sku = p.productCode || p.sku || p.id || '';
        const url = typeof getProductPublicUrl === 'function' ? getProductPublicUrl(p) : `${base}/`;
        const offer = {
          '@type': 'Offer',
          url,
          priceCurrency: 'IRR',
          price: String(price),
          availability,
          itemCondition: 'https://schema.org/NewCondition',
          seller: {
            '@type': 'Organization',
            name: p.sellerName || p.seller?.name || brandName,
          },
        };
        if (p.dealEndsAt || p.saleEndsAt) {
          try {
            const until = new Date(p.dealEndsAt || p.saleEndsAt);
            if (!Number.isNaN(until.getTime())) offer.priceValidUntil = until.toISOString().slice(0, 10);
          } catch (_) {}
        }
        // سیاست مرجوعی و ارسال (سطح فروشگاه)
        offer.hasMerchantReturnPolicy = {
          '@type': 'MerchantReturnPolicy',
          applicableCountry: 'IR',
          returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
          merchantReturnDays: 7,
          returnMethod: 'https://schema.org/ReturnByMail',
          returnFees: 'https://schema.org/FreeReturn',
        };
        offer.shippingDetails = {
          '@type': 'OfferShippingDetails',
          shippingDestination: {
            '@type': 'DefinedRegion',
            addressCountry: 'IR',
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' },
            transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 5, unitCode: 'DAY' },
          },
          shippingRate: {
            '@type': 'MonetaryAmount',
            currency: 'IRR',
            value: '0',
          },
        };
        const schema = {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: p.seoTitle || p.name || '',
          description: stripHtmlSeo(p.seoDescription || p.desc || p.description || ''),
          image: images.length ? images : undefined,
          sku: sku || undefined,
          mpn: p.mpn || sku || undefined,
          gtin: p.gtin || p.barcode || undefined,
          brand: { '@type': 'Brand', name: brandName },
          category: p.category || (Array.isArray(p.categories) ? p.categories[0] : undefined),
          offers: offer,
        };
        const rating = Number(p.rating);
        const reviewCount = Number(p.reviewsCount || p.reviewCount || p.ratingsCount || 0);
        if (rating > 0 && reviewCount > 0) {
          schema.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: String(Math.min(5, Math.max(1, rating))),
            reviewCount: String(reviewCount),
            bestRating: '5',
            worstRating: '1',
          };
        }
        return schema;
      };

      const buildArticleSchema = (post) => {
        if (!post) return null;
        const s = seoCfg();
        const base = (s.canonicalBase || 'https://pirahanemardane.ir').replace(/\/$/, '');
        return {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.seoTitle || post.title,
          description: stripHtmlSeo(post.seoDescription || post.excerpt || ''),
          image: post.image || undefined,
          datePublished: post.date || undefined,
          author: { '@type': 'Person', name: post.author || 'تحریریه' },
          publisher: { '@type': 'Organization', name: s.siteTitle || 'پیراهن مردانه', logo: { '@type': 'ImageObject', url: base + '/logo.webp' } },
          mainEntityOfPage: base + (typeof window !== 'undefined' ? window.location.pathname + window.location.search : ''),
        };
      };
      const buildBreadcrumbSchema = (items) => {
        if (!items || !items.length) return null;
        const s = seoCfg();
        const base = (s.canonicalBase || 'https://pirahanemardane.ir').replace(/\/$/, '');
        return {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: items.map((it, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: it.name,
            item: it.path ? (base + it.path) : undefined,
          })),
        };
      };
      /** باکس سئوی محتوا — mode: product | article | page */

      /** فاز B: تحلیل on-page با قوانین فارسی‌محور */
      const analyzeOnPageSeo = ({
        title = '',
        description = '',
        focusKeywords = '',
        bodyText = '',
        contentTitle = '',
        url = '',
        hasImage = false,
        imageHasAlt = false,
        sellerLimited = false,
      } = {}) => {
        const checks = [];
        const add = (id, label, status, detail) => checks.push({ id, label, status, detail }); // status: good | ok | bad
        const body = String(bodyText || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        const words = body ? body.split(/\s+/).filter(Boolean) : [];
        const wordCount = words.length;
        const kws = String(focusKeywords || '').split(/[,،]/).map(x => x.trim()).filter(Boolean);
        const primary = (kws[0] || '').toLowerCase();
        const titleL = String(title || '').toLowerCase();
        const descL = String(description || '').toLowerCase();
        const bodyL = body.toLowerCase();
        const contentTitleL = String(contentTitle || '').toLowerCase();
        const tLen = String(title || '').length;
        const dLen = String(description || '').length;
        const tPx = seoPixelReport(title, 'title');
        const dPx = seoPixelReport(description, 'desc');

        // Title length — بر اساس پیکسل گوگل
        if (!tLen) add('title-empty', 'عنوان سئو', 'bad', 'خالی است');
        else if (tPx.deskOver || tPx.mobOver) add('title-long', 'طول عنوان سئو (پیکسل)', 'ok', `دسکتاپ ${tPx.deskPx}/${tPx.deskLim}px · موبایل ${tPx.mobPx}/${tPx.mobLim}px · بلند`);
        else if (tPx.worst === 'short') add('title-short', 'طول عنوان سئو (پیکسل)', 'ok', `دسکتاپ ${tPx.deskPx}/${tPx.deskLim}px · کوتاه`);
        else add('title-len', 'طول عنوان سئو (پیکسل)', 'good', `دسکتاپ ${tPx.deskPx}/${tPx.deskLim}px · موبایل ${tPx.mobPx}/${tPx.mobLim}px`);

        // Description length — پیکسل
        if (!dLen) add('desc-empty', 'توضیحات متا', 'bad', 'خالی است');
        else if (dPx.deskOver || dPx.mobOver) add('desc-long', 'طول متا (پیکسل)', 'ok', `دسکتاپ ${dPx.deskPx}/${dPx.deskLim}px · موبایل ${dPx.mobPx}/${dPx.mobLim}px · بلند`);
        else if (dPx.worst === 'short') add('desc-short', 'طول متا (پیکسل)', 'ok', `دسکتاپ ${dPx.deskPx}/${dPx.deskLim}px · کوتاه`);
        else add('desc-len', 'طول متا (پیکسل)', 'good', `دسکتاپ ${dPx.deskPx}/${dPx.deskLim}px · موبایل ${dPx.mobPx}/${dPx.mobLim}px`);

        // Focus keyword
        if (!primary) add('kw-missing', 'کلمه کلیدی فوکوس', 'bad', 'تعریف نشده');
        else {
          add('kw-set', 'کلمه کلیدی فوکوس', 'good', primary);
          if (titleL.includes(primary)) add('kw-title', 'کلیدواژه در عنوان سئو', 'good', 'وجود دارد');
          else add('kw-title', 'کلیدواژه در عنوان سئو', 'bad', 'نیست');
          if (descL.includes(primary)) add('kw-desc', 'کلیدواژه در متا', 'good', 'وجود دارد');
          else add('kw-desc', 'کلیدواژه در متا', 'ok', 'پیشنهاد: در متا هم بیاید');
          if (contentTitleL && contentTitleL.includes(primary)) add('kw-h1', 'کلیدواژه در نام/عنوان محتوا', 'good', 'وجود دارد');
          else if (contentTitle) add('kw-h1', 'کلیدواژه در نام/عنوان محتوا', 'ok', 'اختیاری ولی مفید');
          if (bodyL) {
            if (bodyL.includes(primary)) {
              const dens = wordCount ? (bodyL.split(primary).length - 1) / wordCount * 100 : 0;
              if (dens > 0 && dens < 0.5) add('kw-dens', 'چگالی کلیدواژه', 'ok', `حدود ${dens.toFixed(1)}٪ · کم`);
              else if (dens > 3) add('kw-dens', 'چگالی کلیدواژه', 'ok', `حدود ${dens.toFixed(1)}٪ · زیاد`);
              else add('kw-dens', 'چگالی کلیدواژه', 'good', `حدود ${dens.toFixed(1)}٪`);
            } else add('kw-body', 'کلیدواژه در متن', 'bad', 'در بدنه محتوا نیست');
          }
        }

        // Content length
        if (!body) add('body-empty', 'متن محتوا', 'ok', 'متن خالی · برای محصول توضیح اضافه کنید');
        else if (wordCount < 50) add('body-short', 'طول محتوا', 'ok', `${wordCount} کلمه · کوتاه`);
        else if (wordCount < 150) add('body-mid', 'طول محتوا', 'ok', `${wordCount} کلمه · متوسط`);
        else add('body-len', 'طول محتوا', 'good', `${wordCount} کلمه`);

        // Readability rough (Persian): avg sentence length by .
        if (body) {
          const sentences = body.split(/[.!?؟۔]+/).map(s => s.trim()).filter(Boolean);
          const avg = sentences.length ? words.length / sentences.length : words.length;
          if (avg > 35) add('read-sent', 'طول جملات', 'ok', `میانگین ~${Math.round(avg)} کلمه · جملات را کوتاه‌تر کنید`);
          else if (sentences.length) add('read-sent', 'طول جملات', 'good', `میانگین ~${Math.round(avg)} کلمه`);
          const paras = body.split(/\n+/).filter(Boolean);
          if (paras.some(p => p.split(/\s+/).length > 120)) add('read-para', 'طول پاراگراف', 'ok', 'حداقل یک پاراگراف خیلی بلند است');
          else if (paras.length) add('read-para', 'طول پاراگراف', 'good', 'پاراگراف‌ها متعادل');
        }

        // Image
        if (hasImage) {
          if (imageHasAlt) add('img-alt', 'متن جایگزین تصویر', 'good', 'حداقل یک alt دارد');
          else add('img-alt', 'متن جایگزین تصویر', 'ok', 'تصویر هست ولی alt خالی است');
        } else {
          add('img-missing', 'تصویر شاخص', 'ok', 'تصویر شاخص توصیه می‌شود');
        }

        // URL
        if (url) {
          if (url.length > 90) add('url-long', 'طول URL', 'ok', 'URL کمی بلند است');
          else add('url-len', 'طول URL', 'good', 'مناسب');
          if (primary && url.toLowerCase().includes(primary.replace(/\s+/g, '-'))) add('url-kw', 'کلیدواژه در URL', 'good', 'وجود دارد');
        }

        const scoreMap = { good: 2, ok: 1, bad: 0 };
        const total = checks.reduce((s, c) => s + scoreMap[c.status], 0);
        const max = checks.length * 2 || 1;
        const score = Math.round((total / max) * 100);
        let traffic = 'red';
        if (score >= 75) traffic = 'green';
        else if (score >= 45) traffic = 'orange';
        return { score, traffic, checks, wordCount, kwCount: kws.length };
      };

      const suggestInternalLinks = ({ focusKeywords = '', bodyText = '', sellerLimited = false, sellerId = null } = {}) => {
        const kws = String(focusKeywords || '').split(/[,،]/).map(x => x.trim()).filter(Boolean);
        const bodyL = String(bodyText || '').toLowerCase();
        let pool = [...(catalogProducts || products || [])];
        if (sellerLimited) {
          pool = pool.filter(p => {
            const sid = p.seller?.id || p.sellerId;
            return sid === 'own' || sid === sellerId || (sellerUser && (sid === sellerUser.id));
          });
        }
        const scored = pool.map(p => {
          const name = String(p.name || '').toLowerCase();
          let sc = 0;
          kws.forEach(k => { if (name.includes(k.toLowerCase()) || bodyL.includes(String(p.name || '').toLowerCase())) sc += 2; });
          if (p.discount) sc += 0.5;
          return { p, sc };
        }).filter(x => x.sc > 0).sort((a, b) => b.sc - a.sc).slice(0, 5);
        return scored.map(({ p }) => ({
          id: p.id,
          name: p.name,
          path: pathForProduct(p.name || p.title, p.shopName || p.sellerName || p.brand || ''),
          label: p.name,
        }));
      };


      /** فاز C: پیشنهاد AI محلی (بدون API خارجی) + سقف روزانه فروشنده */
      const getSeoAiQuota = (role = 'admin') => {
        const day = new Date().toISOString().slice(0, 10);
        const key = role + ':' + day;
        const used = Number(seoAiDaily[key] || 0);
        const limit = role === 'seller' ? 15 : 200;
        return { day, key, used, limit, left: Math.max(0, limit - used) };
      };
      const consumeSeoAiQuota = (role = 'admin') => {
        const q = getSeoAiQuota(role);
        if (q.left <= 0) return false;
        const next = { ...seoAiDaily, [q.key]: q.used + 1 };
        setSeoAiDaily(next);
        try { localStorage.setItem('seoAiDaily', JSON.stringify(next)); } catch (_) {}
        return true;
      };
      const aiGenerateSeoMeta = ({ name = '', desc = '', focusKeywords = '', mode = 'product' } = {}) => {
        const kw = String(focusKeywords || '').split(/[,،]/).map(x => x.trim()).filter(Boolean)[0] || name;
        const cleanDesc = String(desc || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        const title = (kw || name || 'محصول').slice(0, 55);
        let description = cleanDesc.slice(0, 150);
        if (description.length < 70) {
          description = `${name || kw} — خرید آنلاین از فروشگاه پیراهن مردانه با ارسال سریع و ضمانت اصالت.`.slice(0, 155);
        }
        if (mode === 'article') {
          return {
            title: (name || kw).slice(0, 58),
            description: (cleanDesc || `مطلب ${name} در بلاگ پیراهن مردانه`).slice(0, 155),
            summary: (cleanDesc || name).slice(0, 220),
          };
        }
        return { title, description, summary: description };
      };
      const aiSuggestFaq = ({ name = '', desc = '', focusKeywords = '' } = {}) => {
        const kw = String(focusKeywords || '').split(/[,،]/).map(x => x.trim()).filter(Boolean)[0] || name;
        return [
          { q: `${name || kw} مناسب چه فصلی است؟`, a: `بسته به جنس پارچه، ${name || 'این محصول'} برای استفاده در فصل مناسب طراحی شده است. جزئیات در توضیحات محصول آمده است.` },
          { q: `راهنمای سایز ${name || 'محصول'} چگونه است؟`, a: 'از جدول راهنمای سایز فروشگاه استفاده کنید و در صورت تردید با پشتیبانی فروشنده در تماس باشید.' },
          { q: `ارسال و مرجوعی ${name || 'این کالا'} چگونه است؟`, a: 'پس از ثبت سفارش، ارسال طبق روش انتخابی انجام می‌شود. شرایط مرجوعی در صفحه قوانین مرجوعی فروشگاه آمده است.' },
        ];
      };
      const aiOptimizeTextHints = ({ title = '', description = '', bodyText = '', focusKeywords = '' } = {}) => {
        const hints = [];
        const primary = String(focusKeywords || '').split(/[,،]/).map(x => x.trim()).filter(Boolean)[0];
        if (!title) hints.push('یک عنوان سئو در محدوده پیکسل گوگل (دسکتاپ ≤۶۰۰px) بنویسید.');
        else if (seoPixelReport(title, 'title').worst === 'short') hints.push('عنوان را کمی طولانی‌تر و توصیفی‌تر کنید.');
        else if (seoPixelReport(title, 'title').deskOver) hints.push('عنوان برای دسکتاپ گوگل بلند است (≤۶۰۰px).');
        if (!description) hints.push('توضیحات متا در محدوده پیکسل گوگل (دسکتاپ ≤۹۶۰px) اضافه کنید.');
        else if (seoPixelReport(description, 'desc').deskOver) hints.push('توضیحات متا برای دسکتاپ بلند است (≤۹۶۰px).');
        if (primary && title && !title.includes(primary)) hints.push(`کلمه «${primary}» را در عنوان سئو بیاورید.`);
        if (primary && bodyText && !String(bodyText).includes(primary)) hints.push(`یک‌بار «${primary}» را طبیعی در متن توضیح بنویسید.`);
        if (String(bodyText || '').split(/\s+/).filter(Boolean).length < 80) hints.push('توضیح محصول را به حداقل ۸۰–۱۵۰ کلمه برسانید.');
        if (!hints.length) hints.push('وضعیت سئو قابل قبول است؛ روی لینک داخلی و تصویر با alt تمرکز کنید.');
        return hints;
      };
      const buildImageAlt = (p) => {
        const s = seoCfg();
        if (s.imageSeoAutoAlt === false) return p?.imageAlt || p?.name || '';
        const tpl = s.imageSeoAltTemplate || '{name} | {brand} | پیراهن مردانه';
        return tpl
          .replace(/\{name\}/g, p?.name || '')
          .replace(/\{brand\}/g, p?.brand || p?.brandName || '')
          .replace(/\{category\}/g, p?.category || '')
          .replace(/\{keyword\}/g, String(p?.seoFocusKeywords || '').split(/[,،]/)[0] || p?.name || '')
          .replace(/\s+\|/g, ' |')
          .trim();
      };
      const buildFaqSchema = (faqs) => {
        const items = (faqs || []).filter(f => f && f.q && f.a);
        if (!items.length) return null;
        return {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: items.map(f => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        };
      };
      const pingIndexNow = async (urlList) => {
        const s = seoCfg();
        if (!s.indexNowEnabled || !s.indexNowKey) {
          showToast({ message: 'IndexNow خاموش است یا کلید تنظیم نشده', variant: 'error', duration: 4000, position: 'top-center' });
          return false;
        }
        const base = (s.canonicalBase || 'https://pirahanemardane.ir').replace(/\/$/, '');
        const urls = (urlList || []).map(u => (u.startsWith('http') ? u : base + u));
        try {
          const res = await fetch('/api/seo/indexnow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              host: base.replace(/^https?:\/\//, ''),
              key: s.indexNowKey,
              urlList: urls,
            }),
          });
          const data = await res.json().catch(() => ({}));
          if (data.dryRun) {
            showToast({ message: `IndexNow dry-run: ${urls.length} آدرس (برای ارسال واقعی INDEXNOW_KEY در env)`, variant: 'success', duration: 4500, position: 'top-center' });
          } else if (data.ok) {
            showToast({ message: `IndexNow ارسال شد (${urls.length} آدرس)`, variant: 'success', duration: 4000, position: 'top-center' });
          } else {
            showToast({ message: data.error || data.message || 'خطا در IndexNow', variant: 'error', duration: 4500, position: 'top-center' });
          }
          return !!data.ok || !!data.dryRun;
        } catch (e) {
          showToast({ message: 'خطا در IndexNow', variant: 'error', duration: 4000, position: 'top-center' });
          return false;
        }
      };


      const buildLocalBusinessSchema = () => {
        const s = seoCfg();
        if (!s.localSeoEnabled) return null;
        const locs = Array.isArray(s.localLocations) ? s.localLocations : [];
        if (!locs.length) {
          return {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: s.localBusinessName || s.siteTitle,
            telephone: s.localPhone || undefined,
            email: s.localEmail || undefined,
          };
        }
        if (locs.length === 1) {
          const L = locs[0];
          return {
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: L.name || s.localBusinessName || s.siteTitle,
            image: (s.canonicalBase || '') + '/logo.webp',
            telephone: L.phone || s.localPhone,
            email: s.localEmail || undefined,
            priceRange: s.localPriceRange || '$$',
            address: {
              '@type': 'PostalAddress',
              streetAddress: L.address || '',
              addressLocality: L.city || '',
              postalCode: L.postalCode || '',
              addressCountry: 'IR',
            },
            geo: (L.lat && L.lng) ? { '@type': 'GeoCoordinates', latitude: L.lat, longitude: L.lng } : undefined,
            openingHours: L.hours || undefined,
            url: (s.canonicalBase || '').replace(/\/$/, ''),
          };
        }
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: s.localBusinessName || s.siteTitle,
          telephone: s.localPhone,
          email: s.localEmail,
          department: locs.map(L => ({
            '@type': 'LocalBusiness',
            name: L.name,
            telephone: L.phone || s.localPhone,
            address: {
              '@type': 'PostalAddress',
              streetAddress: L.address || '',
              addressLocality: L.city || '',
              postalCode: L.postalCode || '',
              addressCountry: 'IR',
            },
            geo: (L.lat && L.lng) ? { '@type': 'GeoCoordinates', latitude: L.lat, longitude: L.lng } : undefined,
            openingHours: L.hours || undefined,
          })),
        };
      };
      const buildNewsSitemapXml = () => {
        const s = seoCfg();
        const base = (s.canonicalBase || 'https://pirahanemardane.ir').replace(/\/$/, '');
        const posts = (blogPosts || []).filter(b => b.status === 'published').slice(0, 100);
        const body = posts.map(b => {
          const loc = `${base}/blog/${encodeURIComponent(b.id)}`;
          const title = (b.seoTitle || b.title || '').replace(/&/g, '&amp;');
          const date = b.date || new Date().toISOString().slice(0, 10);
          return `  <url>\\n    <loc>${loc}</loc>\\n    <news:news>\\n      <news:publication>\\n        <news:name>پیراهن مردانه</news:name>\\n        <news:language>fa</news:language>\\n      </news:publication>\\n      <news:publication_date>${date}</news:publication_date>\\n      <news:title>${title}</news:title>\\n    </news:news>\\n  </url>`;
        }).join('\\n');
        return `<?xml version="1.0" encoding="UTF-8"?>\\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\\n${body}\\n</urlset>\\n`;
      };
      const buildVideoSitemapXml = () => {
        const s = seoCfg();
        const base = (s.canonicalBase || 'https://pirahanemardane.ir').replace(/\/$/, '');
        const withVideo = [...(catalogProducts || products || [])].filter(pr => pr.aparatEmbed || pr.video).slice(0, 50);
        const body = withVideo.map(pr => {
          const loc = `${base}${pathForProduct(pr.name || pr.title, pr.shopName || pr.sellerName || pr.brand || '')}`;
          const title = (pr.seoTitle || pr.name || '').replace(/&/g, '&amp;');
          const desc = String(pr.seoDescription || pr.desc || title).replace(/<[^>]+>/g, '').slice(0, 200).replace(/&/g, '&amp;');
          const thumb = pr.colors?.[0]?.image || pr.images?.[0] || pr.image || '';
          return `  <url>\\n    <loc>${loc}</loc>\\n    <video:video>\\n      <video:title>${title}</video:title>\\n      <video:description>${desc}</video:description>\\n      ${thumb ? `<video:thumbnail_loc>${thumb}</video:thumbnail_loc>` : ''}\\n      <video:player_loc>${(pr.aparatEmbed || pr.video || loc).replace(/&/g, '&amp;')}</video:player_loc>\\n    </video:video>\\n  </url>`;
        }).join('\\n');
        return `<?xml version="1.0" encoding="UTF-8"?>\\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\\n${body}\\n</urlset>\\n`;
      };
      const addBrandMention = (platform, note, sentiment = 'neutral') => {
        const s = seoCfg();
        const row = {
          id: 'bm-' + Date.now(),
          platform,
          note,
          sentiment,
          at: new Date().toISOString(),
          atFa: new Date().toLocaleString('fa-IR'),
        };
        const list = [row, ...(s.brandMentions || [])].slice(0, 100);
        saveSeoPatch({ brandMentions: list });
        return row;
      };
      const simulateBrandScan = () => {
        const s = seoCfg();
        const brands = (s.brandNames || []).filter(Boolean);
        if (!brands.length) {
          showToast({ message: 'نام برند تعریف نشده', variant: 'error', duration: 4000, position: 'top-center' });
          return;
        }
        const platforms = ['ChatGPT', 'Perplexity', 'Gemini', 'Google AI Overview'];
        const rows = platforms.map((pl) => {
          const hit = Math.random() > 0.35;
          return {
            id: 'bm-' + Date.now() + '-' + pl,
            platform: pl,
            note: hit
              ? `اشاره احتمالی به «${brands[0]}» در پاسخ‌های نمونه ${pl} (شبیه‌سازی — برای داده واقعی API رصد لازم است).`
              : `در اسکن نمونه ${pl} اشاره‌ای ثبت نشد.`,
            sentiment: hit ? (Math.random() > 0.5 ? 'positive' : 'neutral') : 'none',
            at: new Date().toISOString(),
            atFa: new Date().toLocaleString('fa-IR'),
          };
        });
        saveSeoPatch({ brandMentions: [...rows, ...(s.brandMentions || [])].slice(0, 100) });
        showToast({ message: 'اسکن برند (شبیه‌سازی) ثبت شد', variant: 'success', duration: 4000, position: 'top-center' });
      };
      const upsertRankKeyword = (keyword, position, url = '') => {
        const s = seoCfg();
        const kw = String(keyword || '').trim();
        if (!kw) return;
        const pos = Number(position) || 0;
        const list = Array.isArray(s.rankKeywords) ? [...s.rankKeywords] : [];
        const idx = list.findIndex(x => String(x.keyword).toLowerCase() === kw.toLowerCase());
        const hist = { at: new Date().toISOString(), atFa: new Date().toLocaleDateString('fa-IR'), position: pos };
        if (idx >= 0) {
          const prev = list[idx];
          list[idx] = {
            ...prev,
            position: pos,
            url: url || prev.url || '',
            history: [hist, ...(prev.history || [])].slice(0, 30),
            updatedAt: hist.at,
          };
        } else {
          list.unshift({
            id: 'rk-' + Date.now(),
            keyword: kw,
            position: pos,
            url,
            history: [hist],
            updatedAt: hist.at,
          });
        }
        saveSeoPatch({ rankKeywords: list });
      };

      const renderContentSeoBox = (opts) => {
        const {
          mode = 'product',
          title = '',
          description = '',
          focusKeywords = '',
          canonical = '',
          ogImage = '',
          noindex = false,
          onChange,
          sellerLimited = false,
          previewUrl = '',
          bodyText = '',
          contentTitle = '',
          hasImage = false,
          imageHasAlt = false,
          imageAlt = '',
          sellerId = null,
          faqItems = null,
          onFaqChange = null,
          analysisOnly = false,
          hideAnalysis = false,
          sellerStep2 = false,
          seoPart = null,
          adminSeoLayout = false,
          showAdminIndexCanonical = false,
        } = opts || {};
        const titleReport = seoPixelReport(title, 'title');
        const descReport = seoPixelReport(description, 'desc');
        const titleHint = { n: titleReport.chars, tone: titleReport.tone, label: titleReport.label, report: titleReport };
        const descHint = { n: descReport.chars, tone: descReport.tone, label: descReport.label, report: descReport };
        const siteName = seoCfg().siteTitle || 'پیراهن مردانه';
        const base = (seoCfg().canonicalBase || 'https://pirahanemardane.ir').replace(/\/$/, '');
        const serpUrl = previewUrl || base + '/…';
        const kwLimit = sellerLimited ? 3 : 5;
        const kwCount = String(focusKeywords || '').split(/[,،]/).map(x => x.trim()).filter(Boolean).length;
        const analysis = analyzeOnPageSeo({
          title, description, focusKeywords, bodyText, contentTitle, url: previewUrl || '',
          hasImage, imageHasAlt, sellerLimited,
        });
        const linkIdeas = suggestInternalLinks({ focusKeywords, bodyText, sellerLimited, sellerId });
        const trafficColor = analysis.traffic === 'green' ? 'bg-emerald-500' : analysis.traffic === 'orange' ? 'bg-amber-400' : 'bg-red-500';
        const trafficLabel = analysis.traffic === 'green' ? 'خوب' : analysis.traffic === 'orange' ? 'نیاز به بهبود' : 'ضعیف';
        if (analysisOnly) {
          return (
            <div className="rounded-2xl border border-primary-200 dark:border-white/15 bg-primary-50/40 dark:bg-primary-900/20 p-3 sm:p-4 space-y-3" data-seo-analysis="1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-sm font-bold text-primary-900 dark:text-white flex items-center gap-1.5">
                  <Icon name="search" size={16} /> تحلیل لحظه‌ای
                </p>
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full text-white ${trafficColor}`}>
                  <span className="w-2 h-2 rounded-full bg-white/90" /> {toFa(analysis.score)} · {trafficLabel}
                </span>
              </div>
              <div className="rounded-xl border border-primary-100 dark:border-white/10 bg-white dark:bg-primary-900 p-3 space-y-1.5 max-h-48 overflow-y-auto">
                <p className="text-xs font-bold text-primary-700 dark:text-white mb-1">تحلیل لحظه‌ای</p>
                {analysis.checks.map(c => (
                  <div key={c.id} className="flex items-start gap-2 text-xs">
                    <span className={`mt-0.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${c.status === 'good' ? 'bg-emerald-500' : c.status === 'ok' ? 'bg-amber-400' : 'bg-red-500'}`} />
                    <div className="min-w-0">
                      <span className="font-medium text-primary-800 dark:text-white">{c.label}</span>
                      <span className="text-primary-500 dark:text-white/60"> — {c.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        if (sellerStep2) {
          const partTitle =
            seoPart === 'keywords' ? '۱۱. کلمات کلیدی' :
            seoPart === 'title' ? '۱۲. عنوان سئو (SEO Title)+پیش‌نمایش گوگل' :
            seoPart === 'desc' ? '۱۳. توضیحات متا (Meta Description)+پیش‌نمایش گوگل' :
            seoPart === 'faq' ? '۱۴. FAQ (Schema)' :
            seoPart === 'social' ? '۱۵. پیش‌نمایش شبکه اجتماعی' :
            seoPart === 'ai' ? '۱۶. پیشنهاد هوشمند (AI محلی)' :
            null;
          const show = (p) => (seoPart ? seoPart === p : true);
          return (
            <div className="rounded-2xl border border-primary-200 dark:border-white/15 bg-primary-50/40 dark:bg-primary-900/20 p-3 sm:p-4 space-y-3" data-seo-box="seller-step2">
              {partTitle && <p className="text-sm font-bold text-primary-900 dark:text-white">{partTitle}</p>}
              {show('keywords') && (
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label className="text-xs text-primary-500">کلمات کلیدی فوکوس (با ویرگول) · حداکثر ۳</label>
                  <span className={`text-xs ${kwCount > kwLimit ? 'text-red-500' : 'text-primary-400'}`}>{kwCount}/{kwLimit}</span>
                </div>
                <input
                  value={focusKeywords}
                  onChange={e => {
                    let v = e.target.value;
                    const parts = v.split(/[,،]/).map(x => x.trim()).filter(Boolean);
                    if (parts.length > kwLimit) v = parts.slice(0, kwLimit).join('، ');
                    onChange?.({ focusKeywords: v });
                  }}
                  placeholder="حداکثر ۳ کلمه"
                  className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white"
                />
              </div>
              )}
              {show('title') && (
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label className="text-xs text-primary-500">عنوان صفحه (SEO Title)</label>
                  <span className={`text-xs ${titleHint.tone}`}>{titleHint.label}</span>
                </div>
                <input value={title} onChange={e => onChange?.({ title: e.target.value })} maxLength={90} placeholder="خالی = نام محصول" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white" />
                <SeoPixelBars report={titleReport} />
              </div>
              )}
              {show('desc') && (
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label className="text-xs text-primary-500">توضیحات متا (Meta Description)</label>
                  <span className={`text-xs ${descHint.tone}`}>{descHint.label}</span>
                </div>
                <textarea value={description} onChange={e => onChange?.({ description: e.target.value })} rows={3} maxLength={320} placeholder="توضیح کوتاه نتایج گوگل" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white resize-y min-h-[80px]" />
                <SeoPixelBars report={descReport} />
              </div>
              )}
              {show('faq') && onFaqChange && (
                <div className="rounded-xl border border-primary-100 dark:border-white/10 bg-white dark:bg-primary-900 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-primary-700 dark:text-white">FAQ (Schema)</p>
                    <button type="button" className="text-xs text-apple-blue" onClick={() => onFaqChange([...(faqItems || []), { q: '', a: '' }])}>+ پرسش</button>
                  </div>
                  {(faqItems || []).map((f, i) => (
                    <div key={i} className="space-y-1 p-2 rounded-lg border border-primary-50 dark:border-white/5">
                      <input value={f.q || ''} onChange={e => { const next = [...faqItems]; next[i] = { ...next[i], q: e.target.value }; onFaqChange(next); }} placeholder="سؤال" className="w-full px-2 py-1.5 rounded-lg border border-primary-200 dark:border-white/15 bg-transparent text-xs" />
                      <textarea value={f.a || ''} onChange={e => { const next = [...faqItems]; next[i] = { ...next[i], a: e.target.value }; onFaqChange(next); }} placeholder="پاسخ" rows={2} className="w-full px-2 py-1.5 rounded-lg border border-primary-200 dark:border-white/15 bg-transparent text-xs resize-y" />
                      <button type="button" className="text-xs text-red-500" onClick={() => onFaqChange(faqItems.filter((_, j) => j !== i))}>حذف</button>
                    </div>
                  ))}
                  {!(faqItems || []).length && <p className="text-xs text-primary-400">خالی · از «پیشنهاد FAQ» یا افزودن دستی استفاده کنید</p>}
                </div>
              )}
              {show('ai') && (
              <div className="rounded-xl border border-primary-100 dark:border-white/10 bg-white dark:bg-primary-900 p-3 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-xs font-bold text-primary-700 dark:text-white">پیشنهاد هوشمند (AI محلی)</p>
                  <span className="text-xs text-primary-400">باقیمانده امروز: {toFa(getSeoAiQuota(sellerLimited ? 'seller' : 'admin').left)}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button type="button" className="text-xs px-2.5 py-1.5 rounded-full bg-apple-blue text-white" onClick={() => {
                    const role = sellerLimited ? 'seller' : 'admin';
                    if (!consumeSeoAiQuota(role)) { showToast({ message: 'سقف روزانه AI پر شده است', variant: 'error', duration: 4000, position: 'top-center' }); return; }
                    const g = aiGenerateSeoMeta({ name: contentTitle, desc: bodyText, focusKeywords, mode });
                    onChange?.({ title: g.title, description: g.description, focusKeywords: g.focusKeywords || focusKeywords });
                    showToast({ message: g.summary, variant: 'default', duration: 7000, position: 'top-center' });
                  }}>پیشنهاد کامل</button>
                  <button type="button" className="text-xs px-2.5 py-1.5 rounded-full border border-primary-200 dark:border-white/20 text-primary-800 dark:text-white" onClick={() => {
                    const role = sellerLimited ? 'seller' : 'admin';
                    if (!consumeSeoAiQuota(role)) { showToast({ message: 'سقف روزانه AI پر شده است', variant: 'error', duration: 4000, position: 'top-center' }); return; }
                    const g = aiGenerateSeoMeta({ name: contentTitle, desc: bodyText, focusKeywords, mode });
                    onChange?.({ title: g.title });
                    showToast({ message: 'عنوان پیشنهاد شد', variant: 'success', duration: 3500, position: 'top-center' });
                  }}>عنوان</button>
                  <button type="button" className="text-xs px-2.5 py-1.5 rounded-full border border-primary-200 dark:border-white/20 text-primary-800 dark:text-white" onClick={() => {
                    const role = sellerLimited ? 'seller' : 'admin';
                    if (!consumeSeoAiQuota(role)) { showToast({ message: 'سقف روزانه AI پر شده است', variant: 'error', duration: 4000, position: 'top-center' }); return; }
                    const g = aiGenerateSeoMeta({ name: contentTitle, desc: bodyText, focusKeywords, mode });
                    onChange?.({ description: g.description });
                    showToast({ message: 'خلاصه متا پیشنهاد شد', variant: 'success', duration: 3500, position: 'top-center' });
                  }}>خلاصه</button>
                  {onFaqChange && (
                    <button type="button" className="text-xs px-2.5 py-1.5 rounded-full border border-primary-200 dark:border-white/20 text-primary-800 dark:text-white" onClick={() => {
                      const role = sellerLimited ? 'seller' : 'admin';
                      if (!consumeSeoAiQuota(role)) { showToast({ message: 'سقف روزانه AI پر شده است', variant: 'error', duration: 4000, position: 'top-center' }); return; }
                      onFaqChange(aiSuggestFaq({ name: contentTitle, desc: bodyText, focusKeywords }));
                      showToast({ message: 'FAQ پیشنهاد شد', variant: 'success', duration: 3500, position: 'top-center' });
                    }}>پیشنهاد FAQ</button>
                  )}
                </div>
              </div>
              )}
              {show('social') && (
              <div className="seo-social-preview rounded-xl border border-primary-200 dark:border-white/25 bg-white dark:bg-primary-800 overflow-hidden">
                <p className="text-xs font-semibold text-primary-600 dark:!text-white/90 px-3 pt-2.5 pb-1.5">پیش‌نمایش شبکه اجتماعی</p>
                <div className="aspect-[1.91/1] max-h-28 bg-primary-100 dark:bg-[#1A1C20] flex flex-col items-center justify-center gap-1.5 overflow-hidden border-y border-primary-100 dark:border-white/15">
                  {ogImage || hasImage ? (
                    <img src={ogImage || undefined} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <>
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-200 dark:bg-primary-700 border border-primary-300 dark:border-white/30">
                        <Icon name="image" size={18} className="text-primary-600 dark:!text-white" />
                      </span>
                      <span className="text-xs font-medium text-primary-600 dark:!text-white/85">بدون تصویر OG</span>
                    </>
                  )}
                </div>
                <div className="p-2.5 space-y-1 bg-white dark:bg-primary-800">
                  <p className="text-xs text-primary-500 dark:!text-white/70 truncate" dir="ltr">{base.replace(/^https?:\/\//, '')}</p>
                  <p className="text-sm font-bold text-primary-900 dark:!text-white line-clamp-2">{title || contentTitle || 'عنوان'}</p>
                  <p className="text-xs text-primary-600 dark:!text-white/80 line-clamp-2">{description || 'توضیح…'}</p>
                </div>
              </div>
              )}
              {(show('title') || show('desc')) && (
              <div className="rounded-xl border border-primary-200 dark:border-white/25 bg-white dark:bg-primary-800 p-3 space-y-3">
                <p className="text-xs font-semibold text-primary-600 dark:!text-white/90">پیش‌نمایش گوگل (پیکسل دسکتاپ / موبایل)</p>
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-primary-500">دسکتاپ · عنوان ≤{SEO_PX_LIMITS.titleDesktop}px · متا ≤{SEO_PX_LIMITS.descDesktop}px</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 truncate" dir="ltr">{serpUrl}</p>
                  <p className="text-base text-blue-700 dark:text-blue-400 font-medium" style={{ maxWidth: SEO_PX_LIMITS.titleDesktop, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontFamily: 'arial, sans-serif', fontSize: 20 }}>{title || 'عنوان سئو (خالی = نام محتوا)'}</p>
                  <p className="text-xs text-primary-600 dark:text-white/70" style={{ maxWidth: SEO_PX_LIMITS.descDesktop, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', fontFamily: 'arial, sans-serif', fontSize: 14 }}>{description || 'توضیحات متا اینجا نمایش داده می‌شود…'}</p>
                  {(titleReport.deskOver || descReport.deskOver) && <p className="text-[10px] text-red-500">در دسکتاپ بخشی از متن بریده می‌شود</p>}
                </div>
                <div className="space-y-1 pt-2 border-t border-primary-100 dark:border-white/10">
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 truncate" dir="ltr">{serpUrl}</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400 font-medium" style={{ maxWidth: SEO_PX_LIMITS.titleMobile, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontFamily: 'arial, sans-serif', fontSize: 16 }}>{title || 'عنوان سئو (خالی = نام محتوا)'}</p>
                  <p className="text-[11px] text-primary-600 dark:text-white/70" style={{ maxWidth: SEO_PX_LIMITS.descMobile, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', fontFamily: 'arial, sans-serif', fontSize: 12 }}>{description || 'توضیحات متا اینجا نمایش داده می‌شود…'}</p>
                  {(titleReport.mobOver || descReport.mobOver) && <p className="text-[10px] text-red-500">در موبایل بخشی از متن بریده می‌شود</p>}
                </div>
              </div>
              )}
            </div>
          );
        }

        if (adminSeoLayout) {
          const show = (p) => !seoPart || seoPart === p;
          const stepTitle =
            seoPart === 'keywords' ? '۱. کلمات کلیدی' :
            seoPart === 'title' ? '۲. عنوان سئو (SEO Title)+پیش‌نمایش گوگل' :
            seoPart === 'desc' ? '۳. توضیحات متا (Meta Description)+پیش‌نمایش گوگل' :
            seoPart === 'faq' ? '۴. FAQ (Schema)' :
            seoPart === 'index' ? '۵. ایندکس' :
            seoPart === 'canonical' ? '۶. کنونیکال' :
            seoPart === 'social' ? '۷. پیش‌نمایش شبکه اجتماعی' :
            seoPart === 'ai' ? '۸. پیشنهاد هوشمند (AI محلی)' :
            null;
          return (
            <div className="rounded-2xl border border-primary-200 dark:border-white/15 bg-primary-50/40 dark:bg-primary-900/20 p-3 sm:p-4 space-y-3" data-seo-box="admin-layout">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-sm font-bold text-primary-900 dark:text-white flex items-center gap-1.5">
                  <Icon name="search" size={16} /> {stepTitle || (`سئو ${mode === 'article' ? 'مطلب' : mode === 'category' ? 'دسته' : mode === 'brand' ? 'برند' : 'صفحه'}`)}
                </p>
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full text-white ${trafficColor}`}>
                  <span className="w-2 h-2 rounded-full bg-white/90" /> {toFa(analysis.score)} · {trafficLabel}
                </span>
              </div>

              {show('keywords') && (
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label className="text-xs text-primary-500">کلمات کلیدی فوکوس (با ویرگول) · حداکثر ۳</label>
                  <span className={`text-xs ${kwCount > kwLimit ? 'text-red-500' : 'text-primary-400'}`}>{kwCount}/{kwLimit}</span>
                </div>
                <input value={focusKeywords} onChange={e => { let v = e.target.value; const parts = v.split(/[,،]/).map(x => x.trim()).filter(Boolean); if (parts.length > kwLimit) v = parts.slice(0, kwLimit).join('، '); onChange?.({ focusKeywords: v }); }} placeholder="حداکثر ۳ کلمه" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white" />
              </div>
              )}

              {show('title') && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label className="text-xs text-primary-500">عنوان صفحه (SEO Title)</label>
                    <span className={`text-xs ${titleHint.tone}`}>{titleHint.label}</span>
                  </div>
                  <input value={title} onChange={e => onChange?.({ title: e.target.value })} maxLength={90} placeholder="عنوان نمایش در گوگل" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white" />
                  <SeoPixelBars report={titleReport} />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 p-3 space-y-1">
                    <p className="text-[10px] font-semibold text-primary-500">پیش‌نمایش گوگل · دسکتاپ</p>
                    <p className="text-sm text-[#1a0dab] dark:text-[#8ab4f8] leading-snug" style={{ maxWidth: SEO_PX_LIMITS.titleDesktop, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontFamily: 'arial, sans-serif' }}>{title || 'عنوان سئو'}</p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-latin" dir="ltr" style={{ maxWidth: SEO_PX_LIMITS.titleDesktop, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{previewUrl || 'https://example.com/page'}</p>
                    <p className="text-[11px] text-primary-600 dark:text-white/70" style={{ maxWidth: SEO_PX_LIMITS.descDesktop, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', fontFamily: 'arial, sans-serif', fontSize: 13 }}>{description || 'توضیحات متا…'}</p>
                  </div>
                  <div className="rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 p-3 space-y-1">
                    <p className="text-[10px] font-semibold text-primary-500">پیش‌نمایش گوگل · موبایل</p>
                    <p className="text-sm text-[#1a0dab] dark:text-[#8ab4f8] leading-snug" style={{ maxWidth: SEO_PX_LIMITS.titleMobile, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontFamily: 'arial, sans-serif' }}>{title || 'عنوان سئو'}</p>
                    <p className="text-[11px] text-primary-600 dark:text-white/70" style={{ maxWidth: SEO_PX_LIMITS.descMobile, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', fontFamily: 'arial, sans-serif', fontSize: 12 }}>{description || 'توضیحات متا…'}</p>
                  </div>
                </div>
              </div>
              )}

              {show('desc') && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label className="text-xs text-primary-500">توضیحات متا (Meta Description)</label>
                    <span className={`text-xs ${descHint.tone}`}>{descHint.label}</span>
                  </div>
                  <textarea value={description} onChange={e => onChange?.({ description: e.target.value })} rows={3} maxLength={200} placeholder="توضیح کوتاه برای نتایج گوگل" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white resize-y" />
                  <SeoPixelBars report={descReport} />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 p-3 space-y-1">
                    <p className="text-[10px] font-semibold text-primary-500">پیش‌نمایش گوگل · دسکتاپ</p>
                    <p className="text-sm text-[#1a0dab] dark:text-[#8ab4f8] leading-snug" style={{ maxWidth: SEO_PX_LIMITS.titleDesktop, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontFamily: 'arial, sans-serif' }}>{title || 'عنوان سئو'}</p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-latin" dir="ltr" style={{ maxWidth: SEO_PX_LIMITS.titleDesktop, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{previewUrl || 'https://example.com/page'}</p>
                    <p className="text-[11px] text-primary-600 dark:text-white/70" style={{ maxWidth: SEO_PX_LIMITS.descDesktop, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', fontFamily: 'arial, sans-serif', fontSize: 13 }}>{description || 'توضیحات متا…'}</p>
                  </div>
                  <div className="rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 p-3 space-y-1">
                    <p className="text-[10px] font-semibold text-primary-500">پیش‌نمایش گوگل · موبایل</p>
                    <p className="text-sm text-[#1a0dab] dark:text-[#8ab4f8] leading-snug" style={{ maxWidth: SEO_PX_LIMITS.titleMobile, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontFamily: 'arial, sans-serif' }}>{title || 'عنوان سئو'}</p>
                    <p className="text-[11px] text-primary-600 dark:text-white/70" style={{ maxWidth: SEO_PX_LIMITS.descMobile, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', fontFamily: 'arial, sans-serif', fontSize: 12 }}>{description || 'توضیحات متا…'}</p>
                  </div>
                </div>
              </div>
              )}

              {show('faq') && onFaqChange && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-primary-800 dark:text-white">FAQ (Schema)</p>
                  <button type="button" className="text-xs text-apple-blue" onClick={() => onFaqChange([...(faqItems || []), { q: '', a: '' }])}>+ پرسش</button>
                </div>
                {(faqItems || []).map((it, idx) => (
                  <div key={idx} className="p-2 rounded-xl border border-primary-100 dark:border-white/10 space-y-1.5">
                    <input value={it.q || ''} onChange={e => { const next = [...faqItems]; next[idx] = { ...next[idx], q: e.target.value }; onFaqChange(next); }} placeholder="سؤال" className="w-full px-2 py-1.5 rounded-lg border border-primary-200 dark:border-white/20 bg-transparent text-xs text-primary-900 dark:text-white" />
                    <textarea value={it.a || ''} onChange={e => { const next = [...faqItems]; next[idx] = { ...next[idx], a: e.target.value }; onFaqChange(next); }} placeholder="پاسخ" rows={2} className="w-full px-2 py-1.5 rounded-lg border border-primary-200 dark:border-white/20 bg-transparent text-xs text-primary-900 dark:text-white resize-y" />
                    <button type="button" className="text-xs text-red-500" onClick={() => onFaqChange(faqItems.filter((_, j) => j !== idx))}>حذف</button>
                  </div>
                ))}
                {!(faqItems || []).length && <p className="text-xs text-primary-400">خالی · از «پیشنهاد FAQ» یا افزودن دستی استفاده کنید</p>}
              </div>
              )}

              {show('index') && (
              <div className="rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 p-3 space-y-3">
                <p className="text-xs font-bold text-primary-800 dark:text-white">ایندکس</p>
                <label className="flex items-center justify-between gap-3 py-1">
                  <span className="text-xs text-primary-800 dark:text-white">ایندکس در موتورهای جستجو</span>
                  <button type="button" role="switch" aria-checked={!noindex} onClick={() => onChange?.({ noindex: !noindex })} dir="ltr" className={`relative inline-flex h-7 w-12 items-center rounded-full p-0.5 transition-colors ${!noindex ? 'bg-emerald-500' : 'bg-primary-300 dark:bg-primary-600'}`}>
                    <span className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-md transition-transform ${!noindex ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </label>
                <p className="text-[10px] text-primary-400">{noindex ? 'noindex, nofollow' : 'index, follow'}</p>
              </div>
              )}

              {show('canonical') && (
              <div className="rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 p-3 space-y-2">
                <p className="text-xs font-bold text-primary-800 dark:text-white">کنونیکال</p>
                <label className="text-xs text-primary-500 mb-1 block">آدرس کنونیکال (Canonical)</label>
                <input value={canonical || ''} onChange={e => onChange?.({ canonical: e.target.value })} dir="ltr" placeholder="خالی = آدرس پیش‌فرض صفحه" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left font-latin text-primary-900 dark:text-white" />
              </div>
              )}

              {show('social') && (
              <div className="seo-social-preview rounded-xl border border-primary-200 dark:border-white/25 bg-white dark:bg-primary-800 overflow-hidden">
                <p className="text-xs font-semibold text-primary-600 dark:!text-white/90 px-3 pt-2.5 pb-1.5">پیش‌نمایش شبکه اجتماعی</p>
                <div className="aspect-[1.91/1] max-h-28 bg-primary-100 dark:bg-[#1A1C20] flex items-center justify-center overflow-hidden border-y border-primary-100 dark:border-white/15">
                  {(ogImage || hasImage) ? (
                    <img src={ogImage || undefined} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <span className="text-xs text-primary-400 dark:text-white/50 flex flex-col items-center gap-1"><Icon name="image" size={22} /> بدون تصویر OG</span>
                  )}
                </div>
                <div className="px-3 py-2 space-y-0.5">
                  <p className="text-[10px] text-primary-400 font-latin" dir="ltr">{(previewUrl || '').replace(/^https?:\/\//, '') || 'example.com'}</p>
                  <p className="text-sm font-bold text-primary-900 dark:text-white line-clamp-2">{title || 'عنوان'}</p>
                  <p className="text-xs text-primary-500 dark:text-white/70 line-clamp-2">{description || 'توضیحات…'}</p>
                </div>
                <div className="px-3 pb-3">
                  <label className="text-[10px] text-primary-400 block mb-1">تصویر OG / شبکه اجتماعی</label>
                  <input value={ogImage || ''} onChange={e => onChange?.({ ogImage: e.target.value })} dir="ltr" placeholder="https://..." className="w-full px-2 py-1.5 rounded-lg border border-primary-200 dark:border-white/20 bg-transparent text-xs text-left" />
                </div>
              </div>
              )}

              {show('ai') && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-primary-800 dark:text-white">پیشنهاد هوشمند (AI محلی)</p>
                <div className="flex flex-wrap gap-1.5">
                  <button type="button" className="text-xs px-2.5 py-1.5 rounded-full border border-primary-200 dark:border-white/20 text-primary-800 dark:text-white" onClick={() => {
                    if (!consumeSeoAiQuota('admin')) { showToast({ message: 'سقف روزانه AI پر شده است', variant: 'error', duration: 4000, position: 'top-center' }); return; }
                    const g = aiGenerateSeoMeta({ name: contentTitle, desc: bodyText, focusKeywords, mode });
                    onChange?.({ title: g.title || title, description: g.description || description });
                    showToast({ message: 'Title/Meta تولید شد', variant: 'success', duration: 3500, position: 'top-center' });
                  }}>تولید Title/Meta</button>
                  <button type="button" className="text-xs px-2.5 py-1.5 rounded-full border border-primary-200 dark:border-white/20 text-primary-800 dark:text-white" onClick={() => {
                    if (!consumeSeoAiQuota('admin')) { showToast({ message: 'سقف روزانه AI پر شده است', variant: 'error', duration: 4000, position: 'top-center' }); return; }
                    const g = aiGenerateSeoMeta({ name: contentTitle || title, desc: bodyText || description, focusKeywords, mode });
                    onChange?.({ title: g.title || title, description: g.description || description });
                    const hints = aiOptimizeTextHints({ title: g.title || title, description: g.description || description, bodyText, focusKeywords });
                    showToast({ message: hints[0] || 'بهینه‌سازی اعمال شد', variant: 'success', duration: 3500, position: 'top-center' });
                  }}>بهینه‌سازی</button>
                  {onFaqChange && (
                    <button type="button" className="text-xs px-2.5 py-1.5 rounded-full border border-primary-200 dark:border-white/20 text-primary-800 dark:text-white" onClick={() => {
                      if (!consumeSeoAiQuota('admin')) { showToast({ message: 'سقف روزانه AI پر شده است', variant: 'error', duration: 4000, position: 'top-center' }); return; }
                      onFaqChange(aiSuggestFaq({ name: contentTitle, desc: bodyText, focusKeywords }));
                      showToast({ message: '۳ پرسش‌وپاسخ پیشنهادی اضافه شد', variant: 'success', duration: 3500, position: 'top-center' });
                    }}>پیشنهاد FAQ</button>
                  )}
                </div>
              </div>
              )}
            </div>
          );
        }

        return (
          <div className="rounded-2xl border border-primary-200 dark:border-white/15 bg-primary-50/40 dark:bg-primary-900/20 p-3 sm:p-4 space-y-3" data-seo-box="1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-sm font-bold text-primary-900 dark:text-white flex items-center gap-1.5">
                <Icon name="search" size={16} /> سئو {mode === 'product' ? 'محصول' : mode === 'article' ? 'مطلب' : 'صفحه'}
              </p>
              <div className="flex items-center gap-2">
                {sellerLimited && <span className="text-xs text-primary-500">فروشنده · حداکثر {kwLimit} کلیدواژه</span>}
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full text-white ${trafficColor}`}>
                  <span className="w-2 h-2 rounded-full bg-white/90" /> {toFa(analysis.score)} · {trafficLabel}
                </span>
              </div>
            </div>
            {/* SERP preview */}
            <div className="rounded-xl border border-primary-200 dark:border-white/25 bg-white dark:bg-primary-800 p-3 space-y-1">
              <p className="text-xs font-semibold text-primary-600 dark:!text-white/90 mb-1">پیش‌نمایش گوگل</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 truncate" dir="ltr">{serpUrl}</p>
              <p className="text-base text-blue-700 dark:text-blue-400 font-medium line-clamp-2">{title || 'عنوان سئو (خالی = نام محتوا)'}</p>
              <p className="text-xs text-primary-600 dark:text-white/70 line-clamp-2">{description || 'توضیحات متا اینجا نمایش داده می‌شود…'}</p>
            </div>
            {/* Social preview */}
            <div className="seo-social-preview rounded-xl border border-primary-200 dark:border-white/25 bg-white dark:bg-primary-800 overflow-hidden">
              <p className="text-xs font-semibold text-primary-600 dark:!text-white/90 px-3 pt-2.5 pb-1.5">پیش‌نمایش شبکه اجتماعی</p>
              <div className="aspect-[1.91/1] max-h-28 bg-primary-100 dark:bg-[#1A1C20] flex flex-col items-center justify-center gap-1.5 overflow-hidden border-y border-primary-100 dark:border-white/15">
                {ogImage || hasImage ? (
                  <img src={ogImage || undefined} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                ) : (
                  <>
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-200 dark:bg-primary-700 border border-primary-300 dark:border-white/30">
                      <Icon name="image" size={18} className="text-primary-600 dark:!text-white" />
                    </span>
                    <span className="text-xs font-medium text-primary-600 dark:!text-white/85">بدون تصویر OG</span>
                  </>
                )}
              </div>
              <div className="p-2.5 space-y-1 bg-white dark:bg-primary-800">
                <p className="text-xs text-primary-500 dark:!text-white/70 truncate" dir="ltr">{base.replace(/^https?:\/\//, '')}</p>
                <p className="text-sm font-bold text-primary-900 dark:!text-white line-clamp-2">{title || contentTitle || 'عنوان'}</p>
                <p className="text-xs text-primary-600 dark:!text-white/80 line-clamp-2">{description || 'توضیح…'}</p>
              </div>
            </div>
            {/* Checklist */}
            {/* فاز C: ابزارهای AI محلی */}
            <div className="rounded-xl border border-primary-100 dark:border-white/10 bg-white dark:bg-primary-900 p-3 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-xs font-bold text-primary-700 dark:text-white">پیشنهاد هوشمند</p>
                <span className="text-xs text-primary-400">باقیمانده امروز: {toFa(getSeoAiQuota(sellerLimited ? 'seller' : 'admin').left)}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button type="button" className="text-xs px-2.5 py-1.5 rounded-full bg-apple-blue text-white" onClick={() => {
                  const role = sellerLimited ? 'seller' : 'admin';
                  if (!consumeSeoAiQuota(role)) { showToast({ message: 'سقف روزانه AI پر شده است', variant: 'error', duration: 4000, position: 'top-center' }); return; }
                  const g = aiGenerateSeoMeta({ name: contentTitle, desc: bodyText, focusKeywords, mode });
                  onChange?.({ title: g.title, description: g.description });
                  showToast({ message: 'عنوان و متا پیشنهاد شد', variant: 'success', duration: 3500, position: 'top-center' });
                }}>تولید Title/Meta</button>
                <button type="button" className="text-xs px-2.5 py-1.5 rounded-full border border-primary-200 dark:border-white/20 text-primary-800 dark:text-white" onClick={() => {
                  const role = sellerLimited ? 'seller' : 'admin';
                  if (!consumeSeoAiQuota(role)) { showToast({ message: 'سقف روزانه AI پر شده است', variant: 'error', duration: 4000, position: 'top-center' }); return; }
                  const hints = aiOptimizeTextHints({ title, description, bodyText, focusKeywords });
                  showToast({ message: hints[0] + (hints[1] ? ' · ' + hints[1] : ''), variant: 'default', duration: 6000, position: 'top-center' });
                }}>بهینه‌سازی</button>
                <button type="button" className="text-xs px-2.5 py-1.5 rounded-full border border-primary-200 dark:border-white/20 text-primary-800 dark:text-white" onClick={() => {
                  const role = sellerLimited ? 'seller' : 'admin';
                  if (!consumeSeoAiQuota(role)) { showToast({ message: 'سقف روزانه AI پر شده است', variant: 'error', duration: 4000, position: 'top-center' }); return; }
                  const g = aiGenerateSeoMeta({ name: contentTitle, desc: bodyText, focusKeywords, mode });
                  showToast({ message: g.summary, variant: 'default', duration: 7000, position: 'top-center' });
                }}>خلاصه</button>
                {onFaqChange && (
                  <button type="button" className="text-xs px-2.5 py-1.5 rounded-full border border-primary-200 dark:border-white/20 text-primary-800 dark:text-white" onClick={() => {
                    const role = sellerLimited ? 'seller' : 'admin';
                    if (!consumeSeoAiQuota(role)) { showToast({ message: 'سقف روزانه AI پر شده است', variant: 'error', duration: 4000, position: 'top-center' }); return; }
                    onFaqChange(aiSuggestFaq({ name: contentTitle, desc: bodyText, focusKeywords }));
                    showToast({ message: '۳ پرسش‌وپاسخ پیشنهادی اضافه شد', variant: 'success', duration: 3500, position: 'top-center' });
                  }}>پیشنهاد FAQ</button>
                )}
              </div>
            </div>
            {/* FAQ items */}
            {Array.isArray(faqItems) && onFaqChange && (
              <div className="rounded-xl border border-primary-100 dark:border-white/10 bg-white dark:bg-primary-900 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-primary-700 dark:text-white">FAQ (Schema)</p>
                  <button type="button" className="text-xs text-apple-blue" onClick={() => onFaqChange([...(faqItems || []), { q: '', a: '' }])}>+ پرسش</button>
                </div>
                {(faqItems || []).map((f, i) => (
                  <div key={i} className="space-y-1 p-2 rounded-lg border border-primary-50 dark:border-white/5">
                    <input value={f.q || ''} onChange={e => { const next = [...faqItems]; next[i] = { ...next[i], q: e.target.value }; onFaqChange(next); }} placeholder="سؤال" className="w-full px-2 py-1.5 rounded-lg border border-primary-200 dark:border-white/15 bg-transparent text-xs" />
                    <textarea value={f.a || ''} onChange={e => { const next = [...faqItems]; next[i] = { ...next[i], a: e.target.value }; onFaqChange(next); }} placeholder="پاسخ" rows={2} className="w-full px-2 py-1.5 rounded-lg border border-primary-200 dark:border-white/15 bg-transparent text-xs resize-y" />
                    <button type="button" className="text-xs text-red-500" onClick={() => onFaqChange(faqItems.filter((_, j) => j !== i))}>حذف</button>
                  </div>
                ))}
                {!(faqItems || []).length && <p className="text-xs text-primary-400">خالی · از «پیشنهاد FAQ» یا افزودن دستی استفاده کنید</p>}
              </div>
            )}
            {/* Internal links */}
            {linkIdeas.length > 0 && (
              <div className="rounded-xl border border-primary-100 dark:border-white/10 bg-white dark:bg-primary-900 p-3 space-y-2">
                <p className="text-xs font-bold text-primary-700 dark:text-white">پیشنهاد لینک داخلی {sellerLimited ? '(فقط محصولات شما)' : ''}</p>
                <ul className="space-y-1">
                  {linkIdeas.map(l => (
                    <li key={l.id} className="text-xs flex items-center justify-between gap-2">
                      <span className="text-primary-800 dark:text-white truncate">{l.name}</span>
                      <span className="text-primary-400 font-latin text-xs flex-shrink-0" dir="ltr">{l.path}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-primary-400">{sellerLimited ? 'لینک خارجی مجاز نیست · از محصولات خودتان در توضیح استفاده کنید.' : 'می‌توانید در متن به این صفحات لینک دهید.'}</p>
              </div>
            )}
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <label className="text-xs text-primary-500">عنوان سئو (SEO Title)</label>
                <span className={`text-xs ${titleHint.tone}`}>{titleHint.label}</span>
              </div>
              <input
                value={title}
                onChange={e => onChange?.({ title: e.target.value })}
                maxLength={70}
                placeholder="مثلاً خرید پیراهن رسمی مردانه مشکی"
                className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-primary-500 block">تصویر شاخص (Featured / OG)</label>
              <div className="flex flex-wrap items-start gap-3">
                <div className="w-28 h-28 rounded-xl border border-primary-200 dark:border-white/15 bg-primary-100 dark:bg-primary-900 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {ogImage ? (
                    <img src={ogImage} alt={imageAlt || ''} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <span className="text-[10px] text-primary-400 text-center px-1">بدون تصویر</span>
                  )}
                </div>
                <div className="flex-1 min-w-[12rem] space-y-2">
                  <label className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-full border border-primary-200 dark:border-white/20 cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900 text-primary-800 dark:text-white">
                    <Icon name="plus" size={14} /> بارگذاری تصویر
                    <input
                      type="file"
                      accept="image/webp,image/jpeg,image/png,image/jpg"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const url = await processProductImageFile(file, { folder: 'admin' });
                          onChange?.({ ogImage: url });
                        } catch (err) {
                          showToast({ message: String(err?.message || 'خطا در تبدیل WebP'), variant: 'error', duration: 4000, position: 'top-center' });
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <input
                    value={ogImage && !String(ogImage).startsWith('data:') ? ogImage : ''}
                    onChange={(e) => onChange?.({ ogImage: e.target.value })}
                    dir="ltr"
                    placeholder="یا آدرس تصویر (https://…)"
                    className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-xs text-left font-latin text-primary-900 dark:text-white"
                  />
                  {ogImage ? (
                    <button type="button" onClick={() => onChange?.({ ogImage: '' })} className="text-xs text-red-500">حذف تصویر</button>
                  ) : null}
                </div>
              </div>
              <div>
                <label className="text-xs text-primary-500 mb-1 block">تگ Alt تصویر شاخص</label>
                <input
                  value={imageAlt}
                  onChange={(e) => onChange?.({ imageAlt: e.target.value })}
                  placeholder="توضیح کوتاه تصویر برای سئو و دسترس‌پذیری"
                  className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <label className="text-xs text-primary-500">توضیحات متا (Meta Description)</label>
                <span className={`text-xs ${descHint.tone}`}>{descHint.label}</span>
              </div>
              <textarea
                value={description}
                onChange={e => onChange?.({ description: e.target.value })}
                rows={3}
                maxLength={180}
                placeholder="خلاصه جذاب برای نتایج گوگل…"
                className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white resize-y min-h-[80px]"
              />
            </div>
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <label className="text-xs text-primary-500">کلمات کلیدی فوکوس (با ویرگول)</label>
                <span className={`text-xs ${kwCount > kwLimit ? 'text-red-500' : 'text-primary-400'}`}>{kwCount}/{kwLimit}</span>
              </div>
              <input
                value={focusKeywords}
                onChange={e => {
                  let v = e.target.value;
                  const parts = v.split(/[,،]/).map(x => x.trim()).filter(Boolean);
                  if (parts.length > kwLimit) v = parts.slice(0, kwLimit).join('، ');
                  onChange?.({ focusKeywords: v });
                }}
                placeholder={sellerLimited ? 'حداکثر ۳ کلمه' : 'حداکثر ۵ کلمه'}
                className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white"
              />
            </div>
            {!sellerLimited && (
              <>
                <div>
                  <label className="text-xs text-primary-500 mb-1 block">Canonical (اختیاری)</label>
                  <input
                    value={canonical}
                    onChange={e => onChange?.({ canonical: e.target.value })}
                    dir="ltr"
                    placeholder="https://…"
                    className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-left font-latin text-primary-900 dark:text-white"
                  />
                </div>
                {/* OG URL در بخش تصویر شاخص بالاتر مدیریت می‌شود */}
                <label className="flex items-center gap-2 text-xs text-primary-700 dark:text-white cursor-pointer">
                  <input type="checkbox" checked={!!noindex} onChange={e => onChange?.({ noindex: e.target.checked })} />
                  noindex این محتوا (ایندکس نشود)
                </label>
              </>
            )}
            <p className="text-xs text-primary-400">خالی بماند ← از نام/توضیح محتوا استفاده می‌شود.</p>
          </div>
        );
      };

      const openAdminFrontEdit = () => {
        const ctx = getCurrentPageSeoContext();
        const resolved = getResolvedPageSeo(ctx);
        setAdminFrontEditForm({
          title: resolved.title || '',
          description: resolved.description || '',
          slug: resolved.slug || '',
          indexable: resolved.indexable,
          focusKeywords: resolved.focusKeywords || '',
          canonical: resolved.canonical || '',
          ogImage: resolved.ogImage || '',
          faq: Array.isArray(resolved.faq) ? resolved.faq : [],
        });
        setAdminFrontEditOpen(true);
      };

      const saveAdminFrontEdit = () => {
        const ctx = getCurrentPageSeoContext();
        const nextMap = {
          ...pageSeoMap,
          [ctx.key]: {
            title: (adminFrontEditForm.title || '').trim(),
            description: (adminFrontEditForm.description || '').trim(),
            slug: (adminFrontEditForm.slug || '').trim(),
            indexable: !!adminFrontEditForm.indexable,
            focusKeywords: (adminFrontEditForm.focusKeywords || '').trim(),
            canonical: (adminFrontEditForm.canonical || '').trim(),
            ogImage: (adminFrontEditForm.ogImage || '').trim(),
            faq: Array.isArray(adminFrontEditForm.faq) ? adminFrontEditForm.faq : [],
            updatedAt: new Date().toISOString(),
            type: ctx.type,
            label: ctx.label,
          },
        };
        savePageSeoMap(nextMap);

        // همگام‌سازی با موجودیت‌ها در صورت امکان
        if (ctx.type === 'product' && pdpProduct) {
          const patch = {
            seoTitle: (adminFrontEditForm.title || '').trim(),
            seoDescription: (adminFrontEditForm.description || '').trim(),
            slug: (adminFrontEditForm.slug || '').trim(),
          };
          setPdpProduct(prev => prev ? { ...prev, ...patch } : prev);
          if (sellerProducts?.some(p => p.id === pdpProduct.id)) {
            saveSellerProducts((sellerProducts || []).map(p => p.id === pdpProduct.id ? { ...p, ...patch } : p));
          }
          if (adminProducts?.some(p => p.id === pdpProduct.id)) {
            saveAdminProducts((adminProducts || []).map(p => p.id === pdpProduct.id ? { ...p, ...patch } : p));
          }
        }
        if (ctx.type === 'category') {
          const slug = ctx.key.replace(/^category:/, '');
          saveAdminCategories((adminCategories || []).map(c => (c.slug === slug || c.name === ctx.label) ? {
            ...c,
            seoTitle: (adminFrontEditForm.title || '').trim(),
            seoDescription: (adminFrontEditForm.description || '').trim(),
            slug: (adminFrontEditForm.slug || c.slug || '').trim() || c.slug,
          } : c));
        }
        if (ctx.type === 'tag') {
          const slug = ctx.key.replace(/^tag:/, '');
          saveAdminTags((adminTags || []).map(t => (t.slug === slug || t.name === ctx.label) ? {
            ...t,
            seoTitle: (adminFrontEditForm.title || '').trim(),
            seoDescription: (adminFrontEditForm.description || '').trim(),
            slug: (adminFrontEditForm.slug || t.slug || '').trim() || t.slug,
          } : t));
        }
        if (ctx.type === 'home') {
          saveSeoPatch({
            siteTitle: (adminFrontEditForm.title || '').trim() || seoCfg().siteTitle,
            metaDescription: (adminFrontEditForm.description || '').trim() || seoCfg().metaDescription,
          });
        }

        setAdminFrontEditOpen(false);
        pushLiveToast('تنظیمات صفحه ذخیره شد', { type: 'info' });
        // اعمال فوری title/meta
        try {
          const s = seoCfg();
          const title = (adminFrontEditForm.title || '').trim();
          if (title) {
            const tpl = s.siteTitleTemplate || '%s | پیراهن مردانه';
            document.title = ctx.type === 'home' ? title : (tpl.includes('%s') ? tpl.replace('%s', title) : title);
          }
          const desc = (adminFrontEditForm.description || '').trim();
          if (desc) {
            let el = document.querySelector('meta[name="description"]');
            if (!el) { el = document.createElement('meta'); el.setAttribute('name', 'description'); document.head.appendChild(el); }
            el.setAttribute('content', desc);
          }
          const robots = adminFrontEditForm.indexable ? 'index, follow' : 'noindex, nofollow';
          let r = document.querySelector('meta[name="robots"]');
          if (!r) { r = document.createElement('meta'); r.setAttribute('name', 'robots'); document.head.appendChild(r); }
          r.setAttribute('content', robots);
        } catch (_) {}
      };


      const buildRobotsTxt = () => {
        const s = seoCfg();
        const base = (s.canonicalBase || 'https://pirahanemardane.ir').replace(/\/$/, '');
        const lines = [
          'User-agent: *',
          s.globalIndex ? 'Allow: /' : 'Disallow: /',
          '',
          '# موتورهای جستجو',
          'User-agent: Googlebot',
          s.indexHome !== false ? 'Allow: /' : 'Disallow: /',
          'User-agent: Bingbot',
          s.globalIndex ? 'Allow: /' : 'Disallow: /',
          'User-agent: Yandex',
          s.globalIndex ? 'Allow: /' : 'Disallow: /',
          'User-agent: DuckDuckBot',
          s.globalIndex ? 'Allow: /' : 'Disallow: /',
          '',
          `Sitemap: ${base}/sitemap.xml`,
        ];
        if (!s.indexTags) {
          lines.push('Disallow: /*?tag=');
          lines.push('Disallow: /tag/');
        }
        if (s.robotsTxtExtra) lines.push('', s.robotsTxtExtra.trim());
        return lines.join('\\n') + '\\n';
      };

      const buildSitemapXml = () => {
        const s = seoCfg();
        const base = (s.canonicalBase || 'https://pirahanemardane.ir').replace(/\/$/, '');
        const today = new Date().toISOString().slice(0, 10);
        const urls = [];
        const add = (loc, priority = '0.5', changefreq = 'weekly') => {
          urls.push({ loc: loc.startsWith('http') ? loc : base + loc, priority, changefreq });
        };
        if (s.indexHome) add('/', '1.0', 'daily');
        if (s.sitemapIncludeStatic && s.indexStatic) {
          ['/about', '/contact', '/faq', '/size-guide', '/terms', '/returns', '/privacy', '/blog', '/brands', '/campaigns', '/deals', '/sellers'].forEach(p => add(p, '0.6', 'monthly'));
        }
        if (s.sitemapIncludeCategories && s.indexCategories) {
          (adminCategories || []).filter(c => c.active !== false).forEach(cat => {
            add(`/shop?cat=${encodeURIComponent(cat.slug || cat.name)}`, '0.8', 'daily');
          });
        }
        if (s.sitemapIncludeProducts && s.indexProducts) {
          const prods = [...(adminProducts || []).filter(p => p.status === 'active' || p.status === 'approved'), ...(sellerProducts || []).filter(p => p.status === 'active' || p.status === 'approved' || (!p.status && p.active !== false)), ...(products || [])].filter(p => p && p.status !== 'pending' && p.status !== 'rejected' && p.status !== 'inactive');
          const seen = new Set();
          prods.forEach(p => {
            const key = p.productCode || p.id;
            if (seen.has(key)) return;
            seen.add(key);
            if (p.productCode) add(`/?product=${encodeURIComponent(p.productCode)}`, '0.9', 'weekly');
            else add(`/?id=${encodeURIComponent(p.id)}`, '0.7', 'weekly');
          });
        }
        if (s.sitemapIncludeBlog && s.indexBlog) {
          add('/blog', '0.7', 'weekly');
          (blogPosts || []).filter(b => b.status === 'published').forEach(b => {
            add(`/blog/${encodeURIComponent(b.id)}`, '0.6', 'monthly');
          });
        }
        if (s.sitemapIncludeSellers && s.indexSellers) {
          (adminSellers || []).filter(x => x.status === 'approved').forEach(sel => {
            add(`/seller/${encodeURIComponent(sel.id)}`, '0.5', 'weekly');
          });
        }
        const body = urls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod || today}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n');
        return `<?xml version="1.0" encoding="UTF-8"?>\\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\\n${body}\\n</urlset>\\n`;
      };

      
      const buildSitemapIndexXml = () => {
        const s = seoCfg();
        const base = (s.canonicalBase || 'https://pirahanemardane.ir').replace(/\/$/, '');
        const now = new Date().toISOString();
        const parts = [
          { loc: `${base}/sitemap-static.xml`, lastmod: now },
          { loc: `${base}/sitemap-products.xml`, lastmod: now },
          { loc: `${base}/sitemap-blog.xml`, lastmod: now },
        ];
        if (s.newsSitemapEnabled) parts.push({ loc: `${base}/news-sitemap.xml`, lastmod: now });
        if (s.videoSitemapEnabled) parts.push({ loc: `${base}/video-sitemap.xml`, lastmod: now });
        const body = parts.map(p => `  <sitemap>\n    <loc>${p.loc}</loc>\n    <lastmod>${p.lastmod}</lastmod>\n  </sitemap>`).join('\n');
        return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
      };

      const exportRedirectsForServer = () => {
        const payload = JSON.stringify(seoRedirects || [], null, 2);
        downloadSeoFile('seo-redirects.json', payload, 'application/json;charset=utf-8');
        pushLiveToast('فایل را در public/seo-redirects.json قرار دهید تا ریدایرکت سروری فعال شود', { type: 'info' });
      };

      const runSeoHealthCheck = () => {
        const s = seoCfg();
        const issues = [];
        if (!s.canonicalBase) issues.push('آدرس canonical پایه خالی است');
        if (!s.siteTitle) issues.push('عنوان سایت خالی است');
        if (!s.metaDescription || String(s.metaDescription).length < 50) issues.push('توضیحات متای سراسری کوتاه یا خالی است');
        if (!s.organizationName) issues.push('نام سازمان برای Schema خالی است');
        const pending = [...(sellerProducts || []), ...(adminProducts || [])].filter(p => p && (p.status === 'pending' || p.status === 'awaiting'));
        if (pending.length) issues.push(`${pending.length} محصول در انتظار تأیید (نباید در sitemap ایندکس شوند)`);
        const redirs = seoRedirects || [];
        const dangling = redirs.filter(r => r.type !== '410' && !r.to);
        if (dangling.length) issues.push(`${dangling.length} ریدایرکت بدون مقصد`);
        return { ok: issues.length === 0, issues };
      };

const downloadSeoFile = (filename, content, mime) => {
        downloadBlobFile(filename, content, mime);
        pushLiveToast(`فایل ${filename} آماده شد`, { type: 'info' });
      };

      // اعمال SEO سراسری: verification + GA + GTM + title
      useEffect(() => {
        const s = seoCfg();
        const setMeta = (name, content, attr = 'name') => {
          if (!content) return;
          let el = document.querySelector(`meta[${attr}="${name}"]`);
          if (!el) {
            el = document.createElement('meta');
            el.setAttribute(attr, name);
            document.head.appendChild(el);
          }
          el.setAttribute('content', content);
        };
        if (s.siteTitle && !pdpProduct) document.title = s.siteTitle;
        if (s.metaDescription) setMeta('description', s.metaDescription);
        if (s.metaKeywords) setMeta('keywords', s.metaKeywords);
        if (s.googleSiteVerification) setMeta('google-site-verification', s.googleSiteVerification);
        if (s.bingSiteVerification) setMeta('msvalidate.01', s.bingSiteVerification);
        if (s.yandexVerification) setMeta('yandex-verification', s.yandexVerification);
        if (s.baiduVerification) setMeta('baidu-site-verification', s.baiduVerification);
        // custom lines: name=content per line
        (s.customMetaVerifications || '').split('\\n').forEach(line => {
          const m = line.trim().match(/^([^=]+)=(.+)$/);
          if (m) setMeta(m[1].trim(), m[2].trim());
        });
        // ایندکس سراسری حذف شده — robots بر اساس صفحه در effect جداگانه تنظیم می‌شود
        // GTM
        if (s.gtmId && !document.getElementById('pm-gtm')) {
          const sn = document.createElement('script');
          sn.id = 'pm-gtm';
          sn.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${s.gtmId}');`;
          document.head.appendChild(sn);
        }
        // GA4
        if (s.gaId && !document.getElementById('pm-ga')) {
          const s1 = document.createElement('script');
          s1.id = 'pm-ga';
          s1.async = true;
          s1.src = `https://www.googletagmanager.com/gtag/js?id=${s.gaId}`;
          document.head.appendChild(s1);
          const s2 = document.createElement('script');
          s2.id = 'pm-ga-cfg';
          s2.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${s.gaId}');`;
          document.head.appendChild(s2);
        }
        // Organization schema
        if (s.schemaOrgJson) {
          let el = document.getElementById('pm-schema-org');
          if (!el) {
            el = document.createElement('script');
            el.id = 'pm-schema-org';
            el.type = 'application/ld+json';
            document.head.appendChild(el);
          }
          try {
            el.textContent = s.schemaOrgJson.trim().startsWith('{') ? s.schemaOrgJson : s.schemaOrgJson;
          } catch (_) {}
        }
      }, [adminSettings]);

      const openAdminAuth = () => {
        setAdminAuthOpen(true);
        setAdminAuthStep('phone');
        setAdminAuthPhone('');
        setAdminAuthOtp('');
        setAdminAuthError('');
        setAdminAuthLoading(false);
        setMobileMenuOpen(false);
      };

      
      // فوتر: باز کردن مودال/پنل ادمین بدون reload
      useEffect(() => {
        if (typeof window === 'undefined') return;
        const open = () => {
          try {
            let u = null;
            try { u = adminUiStore.getState()?.adminUser; } catch (_) { u = adminUser; }
            if (u && typeof isAdminPhone === 'function' && isAdminPhone(u.phone)) {
              setShowAdminPanel(true);
              setAdminAuthOpen(false);
            } else {
              setAdminAuthOpen(true);
              setAdminAuthStep('phone');
              setShowAdminPanel(false);
            }
          } catch (_) {
            try { setAdminAuthOpen(true); setAdminAuthStep('phone'); } catch (__) {}
          }
        };
        const onEvt = () => open();
        window.addEventListener('open-admin-panel', onEvt);
        return () => window.removeEventListener('open-admin-panel', onEvt);
      }, [adminUser]);

      
      useEffect(() => {
        if (typeof window === 'undefined') return;
        window.__openAdminAuth = () => {
          try {
            let u = null;
            try { u = adminUiStore.getState()?.adminUser; } catch (_) { u = adminUser; }
            if (u && typeof isAdminPhone === 'function' && isAdminPhone(u.phone)) {
              setShowAdminPanel(true);
              setAdminAuthOpen(false);
            } else {
              setAdminAuthOpen(true);
              setAdminAuthStep('phone');
              setShowAdminPanel(false);
            }
          } catch (_) {
            try { setAdminAuthOpen(true); setAdminAuthStep('phone'); } catch (__) {}
          }
        };
        const onEvt = () => { try { window.__openAdminAuth(); } catch (_) {} };
        window.addEventListener('open-admin-panel', onEvt);
        return () => {
          window.removeEventListener('open-admin-panel', onEvt);
          try { delete window.__openAdminAuth; } catch (_) {}
        };
      }, [adminUser]);

      // مسیر /amirshn — جدا از مسیریابی کلی تا همیشه مودال/پنل ادمین باز شود
      useEffect(() => {
        if (typeof window === 'undefined') return;
        const run = () => {
          try {
            const path = decodeURIComponent(String(window.location.pathname || '')).replace(/\/$/, '') || '/';
            if (path !== '/amirshn' && !path.endsWith('/amirshn')) return;
            // از store مستقیم بخوان تا closure کهنه مانع نشود
            let u = null;
            try { u = adminUiStore.getState()?.adminUser; } catch (_) { u = adminUser; }
            if (u && isAdminPhone(u.phone)) {
              setShowAdminPanel(true);
              setAdminAuthOpen(false);
              try {
                const saved = sessionStorage.getItem('adminTab');
                const cur = adminUiStore.getState()?.adminTab;
                if (!cur || cur === 'null') setAdminTab(saved || 'dashboard');
              } catch (_) { try { setAdminTab('dashboard'); } catch (__) {} }
              return;
            }
            setAdminAuthOpen(true);
            setAdminAuthStep('phone');
            setShowAdminPanel(false);
          } catch (_) {}
        };
        run();
        const t1 = setTimeout(run, 50);
        const t2 = setTimeout(run, 300);
        return () => { clearTimeout(t1); clearTimeout(t2); };
      }, [adminUser]);




      // شمارش معکوس OTP خریدار/فروشنده
      useEffect(() => {
        if (!(authOtpTimer > 0)) return;
        const id = setTimeout(() => {
          try { setAuthOtpTimer(Math.max(0, (authOtpTimer || 0) - 1)); } catch (_) {}
        }, 1000);
        return () => clearTimeout(id);
      }, [authOtpTimer]);

      // شمارش معکوس OTP ادمین
      useEffect(() => {
        if (!adminAuthOpen) return;
        if (!(adminAuthOtpTimer > 0)) return;
        const id = setTimeout(() => {
          try { setAdminAuthOtpTimer(Math.max(0, (adminAuthOtpTimer || 0) - 1)); } catch (_) {}
        }, 1000);
        return () => clearTimeout(id);
      }, [adminAuthOpen, adminAuthOtpTimer]);

      // کیبورد موبایل: مودال ادمین را داخل viewport نگه دار
      useEffect(() => {
        if (!adminAuthOpen || typeof window === 'undefined') return;
        const panel = document.querySelector('.site-modal-root[style*="10050"] .site-modal-panel, .site-modal-root .site-modal-panel');
        const onFocusIn = (e) => {
          const el = e.target;
          if (!el || !el.closest || !el.closest('.site-modal-root')) return;
          setTimeout(() => {
            try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (_) {}
          }, 300);
        };
        const onVv = () => {
          try {
            const vv = window.visualViewport;
            if (!vv || !panel) return;
            const kb = Math.max(0, window.innerHeight - vv.height - (vv.offsetTop || 0));
            if (kb > 80) {
              panel.style.maxHeight = Math.max(220, vv.height - 24) + 'px';
              panel.style.overflowY = 'auto';
              panel.style.marginBottom = kb + 'px';
            } else {
              panel.style.maxHeight = '';
              panel.style.overflowY = '';
              panel.style.marginBottom = '';
            }
          } catch (_) {}
        };
        document.addEventListener('focusin', onFocusIn);
        if (window.visualViewport) {
          window.visualViewport.addEventListener('resize', onVv);
          window.visualViewport.addEventListener('scroll', onVv);
        }
        onVv();
        return () => {
          document.removeEventListener('focusin', onFocusIn);
          try {
            if (window.visualViewport) {
              window.visualViewport.removeEventListener('resize', onVv);
              window.visualViewport.removeEventListener('scroll', onVv);
            }
          } catch (_) {}
          try {
            if (panel) {
              panel.style.maxHeight = '';
              panel.style.overflowY = '';
              panel.style.marginBottom = '';
            }
          } catch (_) {}
        };
      }, [adminAuthOpen, adminAuthStep]);

      // Web OTP for admin modal (Chrome Android) — Safari uses autocomplete=one-time-code
      useEffect(() => {
        if (!adminAuthOpen) return;
        if (adminAuthStep !== 'otp' && adminAuthStep !== 'mfa') return;
        if (typeof window === 'undefined') return;
        if (typeof window.OTPCredential === 'undefined') return;
        const ac = new AbortController();
        navigator.credentials
          .get({
            otp: { transport: ['sms'] },
            signal: ac.signal,
          })
          .then((otp) => {
            const code = String(otp?.code || '').replace(/\D/g, '').slice(0, 6);
            if (code.length >= 4) {
              setAdminAuthOtp(code);
              setAdminAuthError('');
            }
          })
          .catch(() => {});
        return () => {
          try { ac.abort(); } catch (_) {}
        };
      }, [adminAuthOpen, adminAuthStep]);

      const closeAdminAuth = () => {
        setAdminAuthOpen(false);
        setAdminAuthError('');
        setAdminAuthStep('phone');
        setAdminAuthOtp('');
        setAdminAuthOtpTimer(0);
        setAdminAuthLoading(false);
      };

      const finishAdminLogin = (phone) => {
        const u = { ...ADMIN_PRESET, phone, loggedAt: Date.now() };
        setAdminUser(u);
        try { localStorage.setItem('adminUser', JSON.stringify(u)); } catch (_) {}
        setAdminAuthOpen(false);
        setAdminAuthStep('phone');
        setAdminAuthOtp('');
        setAdminAuthOtpTimer(0);
        ensureAdminSeed();
        setShowSellerPanel(false);
        setShowProfilePage(false);
        setShowCartPage(false);
        setShowCheckout(false);
        setShowWishlistPage(false);
        setShowComparePage(false);
        setShowPLP(false);
        setShowSellersList(false);
        setPdpProduct(null);
        setActiveSellerId(null);
        setMobileMenuOpen(false);
        setShowAdminPanel(true);
        setAdminTab('dashboard');
        try { pushFaUrl('/amirshn', { adminPanel: true }); } catch (_) {}
        pushLiveToast('ورود ادمین موفق', { type: 'success', duration: 2000 });
        try { window.scrollTo({ top: 0, behavior: 'instant' }); } catch (_) { try { window.scrollTo(0, 0); } catch (__) {} }
        // همیشه دیتا از سرور — یکسان برای OTP و رمز
        setTimeout(() => {
          try {
            if (typeof hydrateAdminProducts === 'function') hydrateAdminProducts();
            if (typeof hydrateAdminSellers === 'function') hydrateAdminSellers();
            if (typeof hydrateAdminTickets === 'function') hydrateAdminTickets();
              if (typeof hydrateAdminCoupons === 'function') hydrateAdminCoupons();
            if (typeof hydrateAdminOrders === 'function') hydrateAdminOrders();
          } catch (_) {}
        }, 200);
      };

      /** ورود ادمین فقط با OTP واقعی (شماره‌های مجاز) */
      const sendAdminOtp = async (phoneOverride) => {
        const phone = onlyDigits(phoneOverride != null ? phoneOverride : adminAuthPhone);
        if (phone.length !== 11 || !phone.startsWith('09')) {
          setAdminAuthError('شماره موبایل معتبر وارد کنید');
          return;
        }
        if (!isAdminPhone(phone)) {
          setAdminAuthError('این شماره به عنوان ادمین تعریف نشده است');
          return;
        }
        setAdminAuthPhone(phone);
        setAdminAuthError('');
        setAdminAuthLoading(true);
        try {
          const res = await fetch('/api/auth/otp/request', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone }),
          });
          const data = await res.json();
          if (!data.ok) {
            setAdminAuthError(data.error || 'ارسال کد ناموفق بود');
            setAdminAuthLoading(false);
            return;
          }
          setAdminAuthPhone(phone);
          setAdminAuthOtp('');
          setAdminAuthStep('otp');
          setAdminAuthOtpTimer(90);
          if (data.mock && data.debug_code) {
            setAdminAuthError(`حالت آزمایشی — کد: ${data.debug_code}`);
          }
          setAdminAuthLoading(false);
        } catch (e) {
          setAdminAuthError('خطا در ارتباط با سرور');
          setAdminAuthLoading(false);
        }
      };

      const verifyAdminOtp = async (phoneOverride, codeOverride) => {
        const phone = onlyDigits(phoneOverride != null ? phoneOverride : adminAuthPhone);
        const code = onlyDigits(codeOverride != null ? codeOverride : adminAuthOtp);
        if (!isAdminPhone(phone)) {
          setAdminAuthError('این شماره به عنوان ادمین تعریف نشده است');
          return;
        }
        if (code.length < 4) {
          setAdminAuthError('کد تأیید را وارد کنید');
          return;
        }
        setAdminAuthError('');
        setAdminAuthLoading(true);
        try {
          const res = await fetch('/api/auth/otp/verify', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, code, role: 'admin' }),
          });
          const data = await res.json();
          if (!data.ok) {
            setAdminAuthError(data.error || 'کد نادرست است');
            setAdminAuthLoading(false);
            return;
          }
          setAdminAuthLoading(false);
          finishAdminLogin(phone);
        } catch (e) {
          setAdminAuthError('خطا در ارتباط با سرور');
          setAdminAuthLoading(false);
        }
      };
      


      const resendMfa = async () => {
        if (authOtpTimer > 0) return;
        setAuthLoading(true);
        setAuthError('');
        try {
          const phone = onlyDigits(authPhone || '');
          const password = (authPassword || (typeof window !== 'undefined' && window.__pmAuthPassword) || '');
          if (!phone || !password) {
            setAuthError('برای ارسال مجدد، دوباره با رمز وارد شوید');
            setAuthStep('phone');
            return;
          }
          const res = await fetch('/api/auth/login-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              phone,
              password,
              remember: !!(authRemember || (typeof window !== 'undefined' && window.__pmAuthRemember)),
            }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data?.ok) {
            setAuthError(data?.error || 'ارسال مجدد ناموفق');
            return;
          }
          if (data.mfa_required) {
            setAuthOtp('');
            setAuthOtpTimer(90);
            setAuthError('');
            return;
          }
          // اگر MFA لازم نبود (نادر) همان مسیر ورود
          setAuthStep('phone');
        } catch (e) {
          setAuthError(e?.message || 'خطا در ارسال مجدد');
        } finally {
          setAuthLoading(false);
        }
      };

      const verifyMfa = async () => {
        setAuthLoading(true);
        setAuthError('');
        try {
          const phone = onlyDigits(authPhone || '');
          const code = onlyDigits(authOtp || '');
          if (code.length !== 6) {
            setAuthError('کد ۶ رقمی را وارد کنید');
            return;
          }
          const res = await fetch('/api/auth/mfa/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ phone, code }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data?.ok) {
            setAuthError(data?.error || 'کد اشتباه است');
            return;
          }

          try {
            if (authRemember) localStorage.setItem('pm_remember', '1');
            else localStorage.removeItem('pm_remember');
          } catch (_) {}

          const role = String(data?.profile?.role || '').toLowerCase();
          const isAdminLogin = role === 'admin' || (typeof isAdminPhone === 'function' && isAdminPhone(phone));

          if (isAdminLogin) {
            finishAdminLogin(phone);
            try {
              if (typeof hydrateAdminProducts === 'function') hydrateAdminProducts();
              if (typeof hydrateAdminSellers === 'function') hydrateAdminSellers();
              if (typeof hydrateAdminTickets === 'function') hydrateAdminTickets();
              if (typeof hydrateAdminCoupons === 'function') hydrateAdminCoupons();
              try { hydrateCatalogFromApi(); } catch (_) {}
              if (typeof hydrateAdminOrders === 'function') hydrateAdminOrders();
            } catch (_) {}
            setAuthOpen(false);
            return;
          }

          if (authMode === 'seller' || role === 'seller') {
            try {
              const r = await fetch('/api/seller/me', { credentials: 'include', cache: 'no-store' });
              const j = await r.json().catch(() => ({}));
              if (j?.ok && j.seller && j.seller.id) {
                const u = persistSession(
                  'sellerUser',
                  mapProfileToSeller(data.user, { ...(data.profile || {}), ...j.seller }, j.seller),
                );
                setSellerUser(u);
                setShowSellerPanel(true);
                setShowAdminPanel(false);
                setShowProfilePage(false);
                setAuthOpen(false);
                try { pushFaUrl(FA_PATHS['seller-panel'], { sellerPanel: true }); } catch (_) {}
                try { pushLiveToast('ورود فروشنده موفق', { type: 'success', duration: 2000 }); } catch (_) {}
                return;
              }
            } catch (_) {}
            setAuthMode('seller');
            setAuthStep('name');
            setAuthOpen(true);
            return;
          }

          // buyer
          try {
            const u = persistSession('buyerUser', mapProfileToBuyer(data.user, data.profile || {}));
            setBuyerUser(u);
          } catch (_) {}
          setAuthOpen(false);
          try { pushLiveToast('ورود موفق', { type: 'success', duration: 2000 }); } catch (_) {}
        } catch (e) {
          setAuthError(e?.message || 'خطا در تأیید کد');
        } finally {
          setAuthLoading(false);
        }
      };


      const adminVerifyMfa = async () => {
        const phone = onlyDigits(adminAuthPhone);
        const code = onlyDigits(adminAuthOtp || '');
        if (code.length !== 6) {
          setAdminAuthError('کد ۶ رقمی را وارد کنید');
          return;
        }
        setAdminAuthError('');
        setAdminAuthLoading(true);
        try {
          const res = await fetch('/api/auth/mfa/verify', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, code }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data?.ok) {
            setAdminAuthError(data?.error || 'کد اشتباه است');
            setAdminAuthLoading(false);
            return;
          }
          setAdminAuthLoading(false);
          setAdminAuthPassword('');
          setAdminAuthOtp('');
          finishAdminLogin(phone);
        } catch (e) {
          setAdminAuthError('خطا در ارتباط با سرور');
          setAdminAuthLoading(false);
        }
      };

      const adminLoginWithPassword = async () => {
        const phone = onlyDigits(adminAuthPhone);
        const password = String(adminAuthPassword || '');
        if (!isAdminPhone(phone)) {
          setAdminAuthError('این شماره به عنوان ادمین تعریف نشده است');
          return;
        }
        if (password.length < 6) {
          setAdminAuthError('رمز حداقل ۶ کاراکتر باشد');
          return;
        }
        setAdminAuthError('');
        setAdminAuthLoading(true);
        try {
          const res = await fetch('/api/auth/login-password', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, password, remember: true }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data?.ok) {
            setAdminAuthError(data?.error || 'شماره یا رمز اشتباه است');
            setAdminAuthLoading(false);
            return;
          }
          if (data.mfa_required) {
            setAdminAuthOtp('');
            setAdminAuthError('');
            setAdminAuthStep('mfa');
            setAdminAuthOtpTimer(90);
            setAdminAuthLoading(false);
            return;
          }
          const role = String(data?.profile?.role || '').toLowerCase();
          if (role !== 'admin' && !isAdminPhone(phone)) {
            setAdminAuthError('این حساب دسترسی ادمین ندارد');
            setAdminAuthLoading(false);
            return;
          }
          setAdminAuthLoading(false);
          setAdminAuthPassword('');
          finishAdminLogin(phone);
        } catch (e) {
          setAdminAuthError('خطا در ارتباط با سرور');
          setAdminAuthLoading(false);
        }
      };

const openAdminPanel = (tab = 'dashboard', opts = {}) => {
        if (!adminUser || !isAdminPhone(adminUser.phone)) {
          // فقط با شمارهٔ مجاز پس از ورود از /amirshn
          setAdminUser(null);
          try { localStorage.removeItem('adminUser'); } catch (_) {}
          openAdminAuth();
          return;
        }
        ensureAdminSeed();
        setShowAdminPanel(true);
        setAdminTab(tab);
        setAdminSellerDetailId(null);
        setAdminProductDetailId(null);
        setAdminOrderDetailId(null);
        setAdminTicketDetailId(null);
        setAdminBuyerDetailId(null);
        setShowSellerPanel(false);
        setShowProfilePage(false);
        setShowCartPage(false);
        setShowCheckout(false);
        setShowWishlistPage(false);
        setShowComparePage(false);
        setPdpProduct(null);
        setShowPLP(false);
        setShowSellersList(false);
        setActiveSellerId(null);
        setMobileMenuOpen(false);
        setMegaOpen(null);
        setAuthOpen(false);
        setAdminAuthOpen(false);
        try {
          const url = new URL(window.location.href);
          ['plp','cat','seller','sellers','cart','wishlist','compare','profile','sellerPanel'].forEach(k => url.searchParams.delete(k));
          url.searchParams.set('adminPanel', '1');
          pushFaUrl('/amirshn', { adminPanel: true });
        } catch (_) {}
        window.scrollTo({ top: 0, behavior: 'instant' });
      };
      const closeAdminPanel = () => {
        setShowAdminPanel(false);
        try {
          if (typeof pushFaUrl === 'function') pushFaUrl('/', { home: true });
          else if (typeof replaceFaUrl === 'function') replaceFaUrl('/');
          else window.history.pushState({}, '', '/');
        } catch (_) {
          try { window.history.pushState({}, '', '/'); } catch (__) {}
        }
      };

      // پنل ادمین در جریان صفحه است (مثل پنل فروشنده) — قفل overflow لازم نیست
      useEffect(() => {
        if (!showAdminPanel) return;
        // پاکسازی قفل‌های قدیمی در صورت باقی‌ماندن
        if (document.body.dataset.panelLock) {
          delete document.body.dataset.panelLock;
          document.body.style.overflow = '';
          document.documentElement.style.overflow = '';
        }
      }, [showAdminPanel]);
      const logoutAdmin = () => {
        try { setAdminUser(null); } catch (_) {}
        try { if (typeof setUser === 'function') setUser(null); } catch (_) {}
        try { if (typeof setSellerUser === 'function') setSellerUser(null); } catch (_) {}
        try { if (typeof setShowAdminPanel === 'function') setShowAdminPanel(false); } catch (_) {}
        try { if (typeof setShowSellerPanel === 'function') setShowSellerPanel(false); } catch (_) {}
        try { if (typeof setShowProfilePage === 'function') setShowProfilePage(false); } catch (_) {}
        try { if (typeof setPage === 'function') setPage('home'); } catch (_) {}
        try { clearAuthLocal(); } catch (_) {}

        try {
          const go = () => { try { window.location.assign('/'); } catch (_) {} };
          const p = fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
          Promise.resolve(p).finally(go);
          setTimeout(go, 400);
          return;
        } catch (_) {
          try { window.location.assign('/'); } catch (_) {}
        }
      }

      
      // SELLER_ROUTE_GUARD — با بازیابی session از localStorage + سرور (جلوگیری از مودال روی ریلود)
      useEffect(() => {
        if (typeof window === 'undefined') return;
        const path = window.location.pathname || '';
        const isSellerPath = path === '/seller' || path.startsWith('/seller/') || path.includes('پنل-فروشنده');
        if (!isSellerPath) return;

        let cancelled = false;

        try {
          const raw = localStorage.getItem('sellerUser');
          if (raw) {
            const saved = JSON.parse(raw);
            if (saved && (saved.id || saved.phone || saved.sellerId || saved.seller_id)) {
              try {
                const cur = sellerUiStore.getState()?.sellerUser;
                if (!cur || !cur.id) setSellerUser(saved);
              } catch (_) {
                try { setSellerUser(saved); } catch (_) {}
              }
              setShowSellerPanel(true);
              setAuthOpen(false);
            }
          }
        } catch (_) {}

        (async () => {
          try {
            const me = await fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' })
              .then((r) => r.json())
              .catch(() => ({}));
            if (cancelled) return;
            const role = String(me?.profile?.role || me?.user?.role || '').toLowerCase();
            const hasUser = !!(me?.ok && me?.user);

            if (hasUser && (role === 'seller' || role === 'admin' || role === 'superadmin')) {
              try {
                const sm = await fetch('/api/seller/me', { credentials: 'include', cache: 'no-store' })
                  .then((r) => r.json())
                  .catch(() => ({}));
                if (cancelled) return;
                if (sm?.ok && sm?.seller) {
                  const u = typeof persistSession === 'function'
                    ? persistSession('sellerUser', { ...(sellerUser || {}), ...sm.seller, id: sm.seller.id || sm.seller.user_id || me.user.id })
                    : { ...(sellerUser || {}), ...sm.seller };
                  setSellerUser(u);
                } else if (me.user) {
                  const u = typeof persistSession === 'function'
                    ? persistSession('sellerUser', {
                        id: me.user.id,
                        phone: me.profile?.phone || '',
                        shopName: me.profile?.full_name || me.profile?.shop_name || 'فروشگاه من',
                        status: me.profile?.status || 'pending',
                      })
                    : { id: me.user.id, phone: me.profile?.phone || '' };
                  setSellerUser(u);
                }
              } catch (_) {}
              if (cancelled) return;
              setShowSellerPanel(true);
              setAuthOpen(false);
              return;
            }

            let hasLocal = false;
            try {
              const raw = localStorage.getItem('sellerUser');
              if (raw) {
                const saved = JSON.parse(raw);
                hasLocal = !!(saved && (saved.id || saved.phone));
              }
            } catch (_) {}
            if (hasLocal) {
              setShowSellerPanel(true);
              setAuthOpen(false);
              return;
            }
            setTimeout(() => {
              if (cancelled) return;
              try {
                let cur = null;
                try { cur = sellerUiStore.getState()?.sellerUser; } catch (_) {}
                if (cur && (cur.id || cur.phone)) {
                  setShowSellerPanel(true);
                  setAuthOpen(false);
                  return;
                }
                if (typeof openSellerAuth === 'function') openSellerAuth();
              } catch (_) {}
            }, 400);
          } catch (_) {}
        })();

        return () => { cancelled = true; };
      }, [showSellerPanel]);

      // ADMIN_ROUTE_GUARD — با بازیابی از localStorage تا ریلود پنل را نگه دارد
      useEffect(() => {
        try {
          if (typeof window === 'undefined') return;
          const path = window.location.pathname || '';
          const isAdminPath = path === '/amirshn' || path.startsWith('/amirshn/') || path.includes('پنل-ادمین');
          if (!isAdminPath) return;

          // بازیابی فوری session ادمین از localStorage
          try {
            const raw = localStorage.getItem('adminUser');
            if (raw) {
              const saved = JSON.parse(raw);
              const ph = onlyDigits(saved?.phone || '');
              if (ph && isAdminPhone(ph)) {
                if (!adminUser || onlyDigits(adminUser.phone) !== ph) {
                  setAdminUser({ name: saved.name || 'سوپر ادمین', role: saved.role || 'Super Admin', phone: ph, loggedAt: saved.loggedAt || Date.now() });
                }
                setShowAdminPanel(true);
                setAdminAuthOpen(false);
                return; // لاگین معتبر — بیرون نینداز
              }
            }
          } catch (_) {}

          // تأیید نرم سرور — خطای شبکه / سشن موقت = پنل را نگه دار
          const t = setTimeout(async () => {
            try {
              let u = adminUser;
              try { u = adminUiStore.getState()?.adminUser || u; } catch (_) {}
              if (u && isAdminPhone(u.phone)) {
                setShowAdminPanel(true);
                setAdminAuthOpen(false);
                try {
                  if (typeof hydrateAdminProducts === 'function') hydrateAdminProducts();
                  if (typeof hydrateAdminSellers === 'function') hydrateAdminSellers();
                  if (typeof hydrateAdminTickets === 'function') hydrateAdminTickets();
                  if (typeof hydrateAdminCoupons === 'function') hydrateAdminCoupons();
                } catch (_) {}
              }
              try {
                const me = await fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' });
                const mj = await me.json().catch(() => ({}));
                // فقط وقتی سرور صریحاً کاربر دیگری با نقش غیر ادمین برگرداند
                if (mj && mj.ok !== false && mj.user && mj.profile) {
                  const role = String(mj.profile.role || '').toLowerCase();
                  const ph = onlyDigits(mj.profile.phone || '');
                  const serverAdmin = role === 'admin' || (typeof isAdminPhone === 'function' && isAdminPhone(ph));
                  if (!serverAdmin && u && isAdminPhone(u.phone)) {
                    // تضاد: local ادمین است ولی سرور نقش دیگر — local را نگه می‌داریم تا سشن رفرش شود
                    return;
                  }
                }
              } catch (_) {
                /* شبکه — بیرون نینداز */
              }
              if (!u || !isAdminPhone(u?.phone)) {
                setShowAdminPanel(false);
                setAdminAuthOpen(true);
                setAdminAuthStep('phone');
              }
            } catch (_) {}
          }, 600);
          return () => clearTimeout(t);
        } catch (_) {}
      }, [adminUser]);

      // ===== Admin server-first (P0/P1/P2) — do not use localStorage as source of truth =====
      const [adminListLoading, setAdminListLoading] = useState({ products: false, sellers: false, orders: false, tickets: false });
      const [adminListError, setAdminListError] = useState({ products: '', sellers: '', orders: '', tickets: '' });

      const adminFetchJson = async (url, opts = {}) => {
        const r = await fetch(url, { credentials: 'include', ...opts, headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) } });
        let body = null;
        try { body = await r.json(); } catch (_) { body = null; }
        return { ok: r.ok, status: r.status, body };
      };


      const mapAdminProductRow = (p, sellersList) => {
        if (!p) return null;
        const payload = p.payload && typeof p.payload === 'object' ? p.payload : {};
        const imgs = Array.isArray(p.images) && p.images.length
          ? p.images
          : (Array.isArray(payload.images) ? payload.images : (p.cover_image || p.image ? [p.cover_image || p.image] : []));
        const sellerJoin = p.sellers || p.seller || null;
        const sid = p.seller_id || p.sellerId || sellerJoin?.id || null;
        let sellerName =
          (sellerJoin && (sellerJoin.shop_name || sellerJoin.name)) ||
          p.seller_name || p.sellerName || payload.sellerName || '';
        if (!sellerName && sid && Array.isArray(sellersList)) {
          const hit = sellersList.find((s) => String(s.id) === String(sid));
          if (hit) sellerName = hit.shopName || hit.shop_name || hit.name || '';
        }
        const name = p.name || p.title || payload.name || '';
        const colors = Array.isArray(payload.colors) ? payload.colors : (Array.isArray(p.colors) ? p.colors : []);
        const sizes = Array.isArray(payload.sizes) ? payload.sizes : (Array.isArray(p.sizes) ? p.sizes : []);
        const tags = Array.isArray(payload.tags) ? payload.tags : (Array.isArray(p.tags) ? p.tags : []);
        const attributes = payload.attributes || payload.attrs || p.attributes || {};
        return {
          id: p.id,
          name,
          title: p.title || p.name || name,
          status: p.status || 'pending',
          contentStatus: p.status === 'active' ? 'approved' : (p.status === 'rejected' ? 'rejected' : 'pending'),
          price: p.base_price ?? p.price ?? payload.price ?? 0,
          sellerId: sid,
          sellerName: sellerName || '—',
          image: p.cover_image || p.image || imgs[0] || '',
          images: imgs,
          createdAt: p.created_at || p.createdAt || null,
          updatedAt: p.updated_at || p.updatedAt || null,
          slug: p.slug || '',
          productCode: p.product_code || payload.productCode || '',
          category: payload.category || payload.category_name || p.category || '',
          categoryId: p.category_id || p.categoryId,
          brand: payload.brand || payload.brand_name || p.brand || '',
          brandId: p.brand_id || p.brandId,
          colors,
          sizes,
          tags,
          attributes,
          stock: payload.stock ?? p.stock ?? 0,
          description: p.description || payload.desc || payload.description || '',
        };
      };

      const hydrateAdminProducts = async () => {
        setAdminListLoading((s) => ({ ...s, products: true }));
        setAdminListError((s) => ({ ...s, products: '' }));
        try {
          const { ok, status, body } = await adminFetchJson('/api/admin/products');
          if (!ok) {
            setAdminListError((s) => ({ ...s, products: (body && (body.error || body.message)) || ('خطا ' + status) }));
            return;
          }
          const list = (body && (body.products || body.data || body.items)) || (Array.isArray(body) ? body : []);
          const sellersList = typeof adminSellers !== 'undefined' ? adminSellers : [];
          const mapped = (Array.isArray(list) ? list : []).map((p) => mapAdminProductRow(p, sellersList)).filter(Boolean);
          if (typeof setAdminProducts === 'function') {
            setAdminProducts((prev) => {
              try {
                const sig = (arr) => (arr || []).map((x) => `${x.id}:${x.name}:${x.status}`).join('|');
                if (sig(prev) === sig(mapped)) return prev;
              } catch (_) {}
              return mapped;
            });
          }
        } catch (e) {
          setAdminListError((s) => ({ ...s, products: 'خطای شبکه در دریافت محصولات' }));
        } finally {
          setAdminListLoading((s) => ({ ...s, products: false }));
        }
      };

      const mapAdminSellerRow = (s) => {
        if (!s) return null;
        const shop = String(s.shop_name || s.shopName || s.name || '').trim();
        const phone = s.phone || '';
        const logo = s.logo_url || s.logoUrl || s.logo || '';
        const banner = s.banner_url || s.bannerUrl || s.banner || '';
        return {
          id: s.id,
          shopName: shop || (phone ? ('فروشگاه ' + String(phone).slice(-4)) : 'فروشگاه'),
          name: shop || (phone ? ('فروشگاه ' + String(phone).slice(-4)) : 'فروشگاه'),
          slug: s.slug || '',
          status: s.status || 'pending',
          ownerId: s.owner_id || s.ownerId,
          ownerName: s.owner_name || s.ownerName || '',
          phone,
          city: s.city || '',
          about: s.about || '',
          sheba: s.sheba || '',
          address: s.address || '',
          logo,
          logo_url: logo,
          logoUrl: logo,
          banner,
          banner_url: banner,
          bannerUrl: banner,
          logo_pending_url: s.logo_pending_url || s.logoPendingUrl || '',
          logoPendingUrl: s.logo_pending_url || s.logoPendingUrl || '',
          banner_pending_url: s.banner_pending_url || s.bannerPendingUrl || '',
          bannerPendingUrl: s.banner_pending_url || s.bannerPendingUrl || '',
          logo_status: s.logo_status || s.logoStatus || '',
          logoStatus: s.logo_status || s.logoStatus || '',
          banner_status: s.banner_status || s.bannerStatus || '',
          bannerStatus: s.banner_status || s.bannerStatus || '',
          rating: s.rating != null ? Number(s.rating) : 0,
          productsCount: s.products_count != null ? Number(s.products_count) : (s.productsCount || 0),
          activeProductsCount: s.active_products_count != null ? Number(s.active_products_count) : (s.activeProductsCount || 0),
          ordersCount: s.orders_count != null ? Number(s.orders_count) : (s.ordersCount || 0),
          createdAt: s.created_at || s.createdAt,
          joinDate: s.joinDate || (s.created_at ? new Date(s.created_at).toLocaleDateString('fa-IR') : ''),
          licenseApproved: (s.status || '') === 'approved' || s.licenseApproved === true,
          canSell: (s.status || '') === 'approved',
          fastShipEnabled: s.fastShipEnabled !== false,
        };
      };

      const hydrateAdminSellers = async () => {
        setAdminListLoading((s) => ({ ...s, sellers: true }));
        setAdminListError((s) => ({ ...s, sellers: '' }));
        try {
          const { ok, status, body } = await adminFetchJson('/api/admin/sellers');
          if (!ok) {
            const msg = (body && (body.error || body.message)) || ('خطا ' + status);
            setAdminListError((s) => ({ ...s, sellers: msg }));
            if (typeof setAdminSellers === 'function') setAdminSellers([]);
            return;
          }
          const list = (body && (body.sellers || body.data || body.items)) || (Array.isArray(body) ? body : []);
          const mapped = (Array.isArray(list) ? list : []).map(mapAdminSellerRow).filter(Boolean);
          if (typeof setAdminSellers === 'function') setAdminSellers(mapped);
        } catch (e) {
          setAdminListError((s) => ({ ...s, sellers: 'خطای شبکه در دریافت فروشندگان' }));
          if (typeof setAdminSellers === 'function') setAdminSellers([]);
        } finally {
          setAdminListLoading((s) => ({ ...s, sellers: false }));
        }
      };

      const hydrateAdminOrders = async () => {
        setAdminListLoading((s) => ({ ...s, orders: true }));
        setAdminListError((s) => ({ ...s, orders: '' }));
        try {
          const { ok, status, body } = await adminFetchJson('/api/admin/orders');
          if (!ok) {
            setAdminListError((s) => ({ ...s, orders: (body && (body.error || body.message)) || ('خطا ' + status) }));
            return;
          }
          const list = (body && (body.orders || body.data || body.items)) || (Array.isArray(body) ? body : []);
          if (typeof setAdminOrders === 'function') setAdminOrders(Array.isArray(list) ? list : []);
        } catch (e) {
          setAdminListError((s) => ({ ...s, orders: 'خطای شبکه در دریافت سفارش‌ها' }));
        } finally {
          setAdminListLoading((s) => ({ ...s, orders: false }));
        }
      };

      const hydrateSellerPayouts = async () => {
        try {
          const res = await fetch('/api/seller/payouts', { credentials: 'include', cache: 'no-store' });
          const json = await res.json().catch(() => ({}));
          if (!json?.ok || !Array.isArray(json.items)) return;
          const mapped = json.items.map((r) => ({
            id: r.id,
            amount: r.amount,
            status: r.status,
            note: r.note,
            date: r.created_at ? new Date(r.created_at).toLocaleDateString('fa-IR') : '',
            created_at: r.created_at,
          }));
          setSellerUser((prev) => {
            const base = prev && typeof prev === 'object' ? prev : {};
            return { ...base, payoutRequests: mapped };
          });
        } catch (_) {}
      };
      const requestSellerPayout = async (amount, note) => {
        try {
          const res = await fetch('/api/seller/payouts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ amount, note }),
          });
          const json = await res.json().catch(() => ({}));
          if (!res.ok || json?.ok === false) throw new Error(json?.error || 'خطا در ثبت درخواست');
          await hydrateSellerPayouts();
        try { hydrateSellerOrdersFromApi(); } catch (_) {}
          return json.item;
        } catch (e) {
          throw e;
        }
      };
      const hydrateAdminTickets = async () => {
        setAdminListLoading((s) => ({ ...s, tickets: true }));
        setAdminListError((s) => ({ ...s, tickets: '' }));
        try {
          const { ok, status, body } = await adminFetchJson('/api/tickets');
          if (!ok) {
            setAdminListError((s) => ({ ...s, tickets: (body && (body.error || body.message)) || ('خطا ' + status) }));
            return;
          }
          const raw = (body && (body.tickets || body.data || body.items)) || (Array.isArray(body) ? body : []);
          const list = (raw || []).map((t) => ({
            id: t.id,
            code: t.code || t.id,
            subject: t.subject || '',
            status: t.status || 'open',
            type: t.type || 'ticket',
            channel: t.type === 'seller' ? 'seller' : 'ticket',
            userId: t.user_id,
            date: t.created_at ? new Date(t.created_at).toLocaleDateString('fa-IR') : '',
            created_at: t.created_at,
            updated_at: t.updated_at,
            messages: Array.isArray(t.messages) ? t.messages : [],
            unread: t.status === 'open',
            fromServer: true,
          }));
          if (typeof setAdminTickets === 'function') setAdminTickets(list);
        } catch (e) {
          setAdminListError((s) => ({ ...s, tickets: 'خطای شبکه در دریافت تیکت‌ها' }));
        } finally {
          setAdminListLoading((s) => ({ ...s, tickets: false }));
        }
      };

      const adminPatchProductStatus = async (id, status) => {
        const { ok, status: http, body } = await adminFetchJson('/api/admin/products', {
          method: 'PATCH',
          body: JSON.stringify({ id, status }),
        });
        // try alternate REST path
        if (!ok) {
          const r2 = await adminFetchJson('/api/admin/products/' + encodeURIComponent(id), {
            method: 'PATCH',
            body: JSON.stringify({ status }),
          });
          if (!r2.ok) {
            if (typeof showToast === 'function') showToast({ message: (body && (body.error || body.message)) || ('خطا در بروزرسانی محصول (' + http + ')'), variant: 'error', duration: 4500, position: 'top-center' });
            return false;
          }
        }
        if (typeof showToast === 'function') showToast({ message: status === 'active' ? 'محصول تأیید شد' : (status === 'rejected' ? 'محصول رد شد' : 'وضعیت محصول بروزرسانی شد'), variant: 'default', duration: 3500, position: 'top-center' });
        await hydrateAdminProducts();
        try {
          if (typeof reloadServerCatalog === 'function') await reloadServerCatalog();
          window.dispatchEvent(new Event('catalog-products-refetch'));
          window.dispatchEvent(new Event('admin-products-refetch'));
          window.dispatchEvent(new CustomEvent('pm:invalidate', { detail: { scope: 'catalog', ts: Date.now() } }));
        } catch (_) {}
        return true;
      };


      /** حذف/آرشیو گروهی محصولات — ادمین */
      const adminBulkArchiveProducts = async (ids = []) => {
        const list = [...new Set((ids || []).map((x) => String(x || '')).filter(Boolean))];
        if (!list.length) return { ok: 0, fail: 0 };
        let ok = 0, fail = 0;
        for (const id of list) {
          try {
            const r = await adminDeleteProduct(id);
            if (r) ok += 1; else fail += 1;
          } catch (_) { fail += 1; }
        }
        try { await hydrateAdminProducts(); } catch (_) {}
        try { if (typeof reloadServerCatalog === 'function') await reloadServerCatalog(); } catch (_) {}
        try {
          window.dispatchEvent(new CustomEvent('pm:invalidate', { detail: { scope: 'catalog', reason: 'admin-bulk-archive-products' } }));
        } catch (_) {}
        if (typeof showToast === 'function') {
          showToast({
            message: fail ? `آرشیو گروهی: ${ok} موفق، ${fail} ناموفق` : `${ok} محصول به آرشیو منتقل شد`,
            variant: fail ? 'default' : 'success',
            duration: 4000,
            position: 'top-center',
          });
        }
        return { ok, fail };
      };

      const adminBulkPurgeProducts = async (ids = []) => {
        const list = [...new Set((ids || []).map((x) => String(x || '')).filter(Boolean))];
        if (!list.length) return { ok: 0, fail: 0 };
        let ok = 0, fail = 0;
        for (const id of list) {
          try {
            const r = await adminPurgeProduct(id);
            if (r) ok += 1; else fail += 1;
          } catch (_) { fail += 1; }
        }
        try { await hydrateAdminProducts(); } catch (_) {}
        try { if (typeof reloadServerCatalog === 'function') await reloadServerCatalog(); } catch (_) {}
        try {
          window.dispatchEvent(new CustomEvent('pm:invalidate', { detail: { scope: 'catalog', reason: 'admin-bulk-purge-products' } }));
        } catch (_) {}
        if (typeof showToast === 'function') {
          showToast({
            message: fail ? `حذف دائم گروهی: ${ok} موفق، ${fail} ناموفق` : `${ok} محصول برای همیشه حذف شد`,
            variant: fail ? 'default' : 'success',
            duration: 4000,
            position: 'top-center',
          });
        }
        return { ok, fail };
      };

      const adminBulkArchiveSellers = async (ids = []) => {
        const list = [...new Set((ids || []).map((x) => String(x || '')).filter(Boolean))];
        if (!list.length) return { ok: 0, fail: 0 };
        let ok = 0, fail = 0;
        for (const id of list) {
          try {
            const r = await adminDeleteSeller(id);
            if (r) ok += 1; else fail += 1;
          } catch (_) { fail += 1; }
        }
        try { await hydrateAdminSellers(); } catch (_) {}
        try { await hydrateAdminProducts(); } catch (_) {}
        try {
          window.dispatchEvent(new CustomEvent('pm:invalidate', { detail: { scope: 'sellers', reason: 'admin-bulk-archive-sellers' } }));
        } catch (_) {}
        if (typeof showToast === 'function') {
          showToast({
            message: fail ? `آرشیو فروشندگان: ${ok} موفق، ${fail} ناموفق` : `${ok} فروشنده آرشیو شد`,
            variant: fail ? 'default' : 'success',
            duration: 4000,
            position: 'top-center',
          });
        }
        return { ok, fail };
      };

      const adminBulkPurgeSellers = async (ids = []) => {
        const list = [...new Set((ids || []).map((x) => String(x || '')).filter(Boolean))];
        if (!list.length) return { ok: 0, fail: 0 };
        let ok = 0, fail = 0;
        for (const id of list) {
          try {
            const r = await adminPurgeSeller(id);
            if (r) ok += 1; else fail += 1;
          } catch (_) { fail += 1; }
        }
        try { await hydrateAdminSellers(); } catch (_) {}
        try { await hydrateAdminProducts(); } catch (_) {}
        try {
          window.dispatchEvent(new CustomEvent('pm:invalidate', { detail: { scope: 'sellers', reason: 'admin-bulk-purge-sellers' } }));
        } catch (_) {}
        if (typeof showToast === 'function') {
          showToast({
            message: fail ? `حذف دائم فروشندگان: ${ok} موفق، ${fail} ناموفق` : `${ok} فروشنده برای همیشه حذف شد`,
            variant: fail ? 'default' : 'success',
            duration: 4000,
            position: 'top-center',
          });
        }
        return { ok, fail };
      };

      const adminDeleteProduct = async (id) => {
        // soft-delete → archived تا در تب «آرشیو شده‌ها» بماند
        let res = await adminFetchJson('/api/admin/products', {
          method: 'PATCH',
          body: JSON.stringify({ id, status: 'archived' }),
        });
        if (!res.ok) {
          res = await adminFetchJson('/api/admin/products/' + encodeURIComponent(id), { method: 'DELETE' });
        }
        if (!res.ok) {
          if (typeof showToast === 'function') showToast({ message: (res.body && (res.body.error || res.body.message)) || 'آرشیو محصول ناموفق بود', variant: 'error', duration: 4500, position: 'top-center' });
          return false;
        }
        if (typeof setAdminProducts === 'function') {
          setAdminProducts((prev) => (Array.isArray(prev)
            ? prev.map((p) => (p && String(p.id) === String(id) ? { ...p, status: 'archived' } : p))
            : []));
        }
        if (typeof showToast === 'function') showToast({ message: 'محصول به آرشیو منتقل شد', variant: 'default', duration: 3500, position: 'top-center' });
        await hydrateAdminProducts();
        return true;
      };

      /** حذف قطعی از پایگاه داده — فقط از تب آرشیو */
      const adminPurgeProduct = async (id) => {
        if (!id) return false;
        let res = await adminFetchJson('/api/admin/products/' + encodeURIComponent(id) + '?permanent=1', {
          method: 'DELETE',
        });
        if (!res.ok) {
          res = await adminFetchJson('/api/admin/products/' + encodeURIComponent(id), {
            method: 'DELETE',
            body: JSON.stringify({ permanent: true }),
          });
        }
        if (!res.ok) {
          if (typeof showToast === 'function') {
            showToast({
              message: (res.body && (res.body.error || res.body.message)) || 'حذف برای همیشه ناموفق بود',
              variant: 'error',
              duration: 4500,
              position: 'top-center',
            });
          }
          return false;
        }
        if (typeof setAdminProducts === 'function') {
          setAdminProducts((prev) => (Array.isArray(prev) ? prev.filter((p) => p && String(p.id) !== String(id)) : []));
        }
        try {
          if (typeof setAdminProductDetailId === 'function') setAdminProductDetailId(null);
        } catch (_) {}
        try {
          if (typeof setSellerProducts === 'function') {
            setSellerProducts((prev) => (Array.isArray(prev) ? prev.filter((p) => p && String(p.id) !== String(id)) : []));
          }
        } catch (_) {}
        try {
          if (typeof setCatalogProducts === 'function') {
            setCatalogProducts((prev) => (Array.isArray(prev) ? prev.filter((p) => p && String(p.id) !== String(id)) : []));
          }
        } catch (_) {}
        try {
          if (typeof setServerProducts === 'function') {
            setServerProducts((prev) => (Array.isArray(prev) ? prev.filter((p) => p && String(p.id) !== String(id)) : []));
          }
        } catch (_) {}
        if (typeof showToast === 'function') {
          showToast({ message: 'محصول برای همیشه از سایت و پایگاه داده حذف شد', variant: 'success', duration: 4000, position: 'top-center' });
        }
        try { await hydrateAdminProducts(); } catch (_) {}
        return true;
      };

      const adminPurgeSeller = async (id) => {
        if (!id) return false;
        let res = await adminFetchJson('/api/admin/sellers/' + encodeURIComponent(id) + '?permanent=1', {
          method: 'DELETE',
        });
        if (!res.ok) {
          res = await adminFetchJson('/api/admin/sellers/' + encodeURIComponent(id), {
            method: 'DELETE',
            body: JSON.stringify({ permanent: true }),
          });
        }
        if (!res.ok) {
          if (typeof showToast === 'function') showToast({ message: (res.body && (res.body.error || res.body.message)) || 'حذف قطعی ناموفق', variant: 'error', duration: 4500, position: 'top-center' });
          return false;
        }
        try { if (typeof setAdminSellers === 'function') setAdminSellers((prev) => Array.isArray(prev) ? prev.filter((s) => String(s && s.id) !== String(id)) : []); } catch (_) {}
        try { if (typeof setAdminSellerDetailId === 'function') setAdminSellerDetailId(null); } catch (_) {}
        try { if (typeof setTopSellers === 'function') setTopSellers((prev) => Array.isArray(prev) ? prev.filter((s) => String(s && s.id) !== String(id)) : []); } catch (_) {}
        if (typeof showToast === 'function') showToast({ message: 'فروشنده برای همیشه حذف شد', variant: 'success', duration: 3500, position: 'top-center' });
        try { await hydrateAdminSellers(); } catch (_) {}
        try { await hydrateAdminProducts(); } catch (_) {}
        return true;
      };

      const adminDeleteSeller = async (id) => {
        if (!id) return false;
        let res = await adminFetchJson('/api/admin/sellers/' + encodeURIComponent(id), {
          method: 'PATCH',
          body: JSON.stringify({ status: 'archived' }),
        });
        if (!res.ok) {
          res = await adminFetchJson('/api/admin/sellers', {
            method: 'PATCH',
            body: JSON.stringify({ id, status: 'archived' }),
          });
        }
        if (!res.ok) {
          res = await adminFetchJson('/api/admin/sellers/' + encodeURIComponent(id), { method: 'DELETE' });
        }
        if (!res.ok) {
          if (typeof showToast === 'function') showToast({ message: (res.body && (res.body.error || res.body.message)) || 'آرشیو فروشنده ناموفق', variant: 'error', duration: 4500, position: 'top-center' });
          return false;
        }
        try {
          if (typeof setAdminSellers === 'function') {
            setAdminSellers((prev) => Array.isArray(prev)
              ? prev.map((s) => (s && String(s.id) === String(id) ? { ...s, status: 'archived' } : s))
              : prev);
          }
        } catch (_) {}
        try { if (typeof setAdminSellerDetailId === 'function') setAdminSellerDetailId(null); } catch (_) {}
        try { if (typeof setTopSellers === 'function') setTopSellers((prev) => Array.isArray(prev) ? prev.filter((s) => String(s && s.id) !== String(id)) : []); } catch (_) {}
        if (typeof showToast === 'function') showToast({ message: 'فروشنده تعلیق و آرشیو شد', variant: 'success', duration: 3500, position: 'top-center' });
        try { await hydrateAdminSellers(); } catch (_) {}
        try { await hydrateAdminProducts(); } catch (_) {}
        try { if (typeof reloadServerCatalog === 'function') await reloadServerCatalog(); } catch (_) {}
        return true;
      };

      const adminPatchSellerStatus = async (id, status) => {
        let res = await adminFetchJson('/api/admin/sellers/' + encodeURIComponent(id), {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        });
        if (!res.ok) {
          res = await adminFetchJson('/api/admin/sellers', {
            method: 'PATCH',
            body: JSON.stringify({ id, status }),
          });
        }
        if (!res.ok) {
          if (typeof showToast === 'function') showToast({ message: (res.body && (res.body.error || res.body.message)) || 'بروزرسانی فروشنده ناموفق', variant: 'error', duration: 4500, position: 'top-center' });
          return false;
        }
        if (typeof showToast === 'function') showToast({ message: 'وضعیت فروشنده: ' + status, variant: 'default', duration: 3500, position: 'top-center' });
        await hydrateAdminSellers();
        return true;
      };

      const adminPatchOrderStatus = async (id, status) => {
        let res = await adminFetchJson('/api/admin/orders/' + encodeURIComponent(id), {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        });
        if (!res.ok) {
          res = await adminFetchJson('/api/admin/orders', {
            method: 'PATCH',
            body: JSON.stringify({ id, status }),
          });
        }
        if (!res.ok) {
          if (typeof showToast === 'function') showToast({ message: (res.body && (res.body.error || res.body.message)) || 'بروزرسانی سفارش ناموفق', variant: 'error', duration: 4500, position: 'top-center' });
          return false;
        }
        if (typeof showToast === 'function') showToast({ message: 'وضعیت سفارش بروزرسانی شد', variant: 'default', duration: 3500, position: 'top-center' });
        await hydrateAdminOrders();
        return true;
      };

      // When admin panel opens, hydrate lists from server
      useEffect(() => {
        if (!showAdminPanel) return undefined;
        let cancelled = false;
        const run = () => {
          if (cancelled) return;
          try {
            hydrateAdminProducts();
            hydrateAdminSellers();
            hydrateAdminOrders();
            hydrateAdminTickets();
          } catch (_) {}
        };
        run();
        const t1 = setTimeout(run, 400);
        const t2 = setTimeout(run, 1200);
        return () => {
          cancelled = true;
          clearTimeout(t1);
          clearTimeout(t2);
        };
      }, [showAdminPanel, adminTab]);

      useEffect(() => {
        if (!showAdminPanel) return;
        try {
          if (adminTab === 'sellers') hydrateAdminSellers();
          if (adminTab === 'products') hydrateAdminProducts();
          if (adminTab === 'orders') hydrateAdminOrders();
          if (adminTab === 'tickets') hydrateAdminTickets();
        } catch (_) {}
      }, [adminTab, showAdminPanel]);

      const adminUnreadTickets = (adminTickets || []).filter(t => t.unread || t.status === 'open').length;
      const adminStatusBadge = (status) => {
        const map = {
          pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
          approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
          active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
          rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
          blocked: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
          inactive: 'bg-primary-100 text-primary-600 dark:bg-primary-800 dark:text-white/70',
          expired: 'bg-primary-100 text-primary-500 dark:bg-primary-800 dark:!text-white',
          open: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
          closed: 'bg-primary-100 text-primary-600 dark:bg-primary-800 dark:text-white/70',
          shipped: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
          preparing: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
          delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
          returned: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
          cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
          archived: 'bg-primary-200 text-primary-600 dark:bg-primary-800 dark:text-white/70',
        };
        return map[status] || 'bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-white';
      };
      const adminStatusLabel = (s) => ({
        pending: 'در انتظار', approved: 'تأیید‌شده', active: 'فعال', rejected: 'رد‌شده', blocked: 'مسدود', inactive: 'غیرفعال',
        archived: 'آرشیو شده',
        expired: 'منقضی', open: 'باز', closed: 'بسته‌شده', shipped: 'ارسال‌شده', preparing: 'آماده‌سازی',
        delivered: 'تحویل‌شده', returned: 'مرجوعی', cancelled: 'لغو', new: 'جدید',
      })[s] || s;

      const sellerUnreadTickets = (sellerTickets || []).filter(t => t.unread).length;
      const sellerOrderStatusColor = (s) => {
        if (s === 'delivered') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
        if (s === 'shipped') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
        if (s === 'preparing') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
        if (s === 'new') return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300';
        if (s === 'cancelled' || s === 'returned') return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
        return 'bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-white';
      };

      const wishlistProducts = (() => {
        const pool = (typeof catalogProducts !== 'undefined' && catalogProducts?.length)
          ? catalogProducts
          : [
              ...(serverProducts || []),
              ...(sellerProducts || []),
              ...(adminProducts || []),
              ...(products || []),
            ];
        let list = favorites.map(f => {
          const fid = f?.product_id || f?.product?.id || f?.id || f;
          const p = pool.find(x => x && String(x.id) === String(fid));
          if (!p) return { missing: true, id: fid, addedAt: f?.addedAt, priceAtAdd: f?.priceAtAdd };
          const unavailable = p.status && p.status !== 'active' && p.contentStatus !== 'approved';
          return {
            ...p,
            addedAt: f?.addedAt,
            priceAtAdd: f?.priceAtAdd,
            missing: !!unavailable,
          };
        });
        if (wishlistFilter === 'inStock') list = list.filter(p => !p.missing && p.stock !== 0);
        if (wishlistFilter === 'outStock') list = list.filter(p => p.missing || p.stock === 0);
        if (wishlistFilter === 'sale') list = list.filter(p => !p.missing && p.discount > 0);
        const sorted = [...list];
        if (wishlistSort === 'newest') sorted.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
        if (wishlistSort === 'oldest') sorted.sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));
        if (wishlistSort === 'priceAsc') sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        if (wishlistSort === 'priceDesc') sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        if (wishlistSort === 'discount') sorted.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        if (wishlistSort === 'name') sorted.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'fa'));
        return sorted;
      })();
      const clearPlpFilters = () => {
        setPlpQuery('');
        setPlpCats([]);
        setPlpColors([]);
        setPlpSizes([]);
        setPlpPriceMin('');
        setPlpPriceMax('');
        setPlpSellers([]);
        setPlpFabrics([]);
        setPlpDiscountOnly(false);
        setPlpMinDiscount(0);
        setPlpInStockOnly(false);
        setPlpFastShipOnly(false);
        setPlpCities([]);
        setPlpCityInput('');
        setPlpSort('');
        setPlpVisible(8);
      };
      const setPlpViewPersist = (v) => {
        const next = typeof v === 'function' ? v(plpView) : v;
        setPlpView(next);
        try { localStorage.setItem('plpView', next); } catch (_) {}
      };
      const catalogList = Array.isArray(catalogProducts) && catalogProducts.length
        ? catalogProducts
        : (Array.isArray(products) ? products : []);
      const _plpColors = Array.isArray(plpColors) ? plpColors : [];
      const _plpSizes = Array.isArray(plpSizes) ? plpSizes : [];
      const _plpCities = Array.isArray(plpCities) ? plpCities : [];
      const _plpSellers = Array.isArray(plpSellers) ? plpSellers : [];
      const _plpFabrics = Array.isArray(plpFabrics) ? plpFabrics : [];
      const _plpCats = Array.isArray(plpCats) ? plpCats : [];
      const _plpTagFilter = Array.isArray(plpTagFilter) ? plpTagFilter : [];
      const _topSellers = Array.isArray(topSellers) ? topSellers : [];
      const plpPriceBounds = catalogList.reduce((acc, p) => {
        const price = Number(p?.price) || 0;
        acc.min = Math.min(acc.min, price);
        acc.max = Math.max(acc.max, price);
        return acc;
      }, { min: Infinity, max: 0 });
      if (!Number.isFinite(plpPriceBounds.min)) plpPriceBounds.min = 0;
      if (!Number.isFinite(plpPriceBounds.max) || plpPriceBounds.max < plpPriceBounds.min) plpPriceBounds.max = plpPriceBounds.min;
      const allFabrics = ['نخی', 'لینن', 'پنبه‌ای', 'پلی‌استر'];
      const allSellerNames = [...new Set(catalogList.map(p => p?.seller?.name).filter(Boolean))];
      const colorHexMap = {};
      catalogList.forEach(p => (Array.isArray(p?.colors) ? p.colors : []).forEach(c => { if (c?.hex) colorHexMap[c.name] = c.hex; }));
      const countFor = (predicate) => catalogList.filter(predicate).length;
      const plpFiltered = catalogList.filter(p => {
        if (!p) return false;
        const q = String(plpQuery || '').trim();
        if (q) {
          const hay = `${p.name || ''} ${p.category || ''} ${(Array.isArray(p.categories) ? p.categories : []).join(' ')} ${(Array.isArray(p.tags) ? p.tags : []).join(' ')} ${p.seller?.name || ''} ${p.fabric || ''}`.toLowerCase();
          if (!hay.includes(q.toLowerCase())) return false;
        }
        if (_plpCats.length > 0) {
          const prodCats = [
            p.category,
            ...(Array.isArray(p.categories) ? p.categories : []),
          ].filter(Boolean);
          if (!_plpCats.some(c => prodCats.some(pc => pc === c || String(pc).includes(c) || String(c).includes(pc)))) return false;
        }
        if (_plpTagFilter.length > 0) {
          const prodTags = Array.isArray(p.tags) ? p.tags : [];
          if (!_plpTagFilter.some(t => prodTags.includes(t))) return false;
        }
        if (_plpColors.length > 0 && !(Array.isArray(p.colors) ? p.colors : []).some(c => _plpColors.includes(c?.name))) return false;
        if (_plpSizes.length > 0 && !(Array.isArray(p.sizes) ? p.sizes : []).some(s => _plpSizes.includes(s))) return false;
        if (_plpSellers.length > 0 && !_plpSellers.includes(p.seller?.name)) return false;
        if (_plpFabrics.length > 0 && !_plpFabrics.includes(p.fabric)) return false;
        if (plpDiscountOnly && !(p.discount > 0)) return false;
        if (plpMinDiscount > 0 && !(p.discount >= plpMinDiscount)) return false;
        if (plpInStockOnly && p.inStock === false) return false;
        if (plpFastShipOnly && !isProductFastShip(p)) return false;
        if (_plpCities.length > 0) {
          const sid = p.seller?.id || 'own';
          const sellerObj = _topSellers.find(s => s && s.id === sid);
          const city = sellerObj?.city || '';
          if (!_plpCities.includes(city)) return false;
        }
        const minP = plpPriceMin !== '' && plpPriceMin != null ? Number(plpPriceMin) : null;
        const maxP = plpPriceMax !== '' && plpPriceMax != null ? Number(plpPriceMax) : null;
        const price = Number(p.price) || 0;
        if (minP != null && !Number.isNaN(minP) && price < minP) return false;
        if (maxP != null && !Number.isNaN(maxP) && price > maxP) return false;
        return true;
      }).sort((a, b) => {
        if (plpSort === 'price-asc') return (Number(a.price)||0) - (Number(b.price)||0);
        if (plpSort === 'price-desc') return (Number(b.price)||0) - (Number(a.price)||0);
        if (plpSort === 'discount') return (Number(b.discount)||0) - (Number(a.discount)||0);
        if (plpSort === 'rating') return (Number(b.rating)||0) - (Number(a.rating)||0);
        if (plpSort === 'newest') return String(b.id||'').localeCompare(String(a.id||''));
        if (plpSort === 'popular' || !plpSort) return (Number(b.reviews)||0) - (Number(a.reviews)||0);
        return String(b.id||'').localeCompare(String(a.id||''));
      });
      const plpVisibleProducts = plpFiltered.slice(0, plpVisible);
      const plpHasMore = plpVisible < plpFiltered.length;
      const plpActiveChips = [];
      (Array.isArray(plpCats) ? plpCats : []).forEach(c => plpActiveChips.push({ key: `cat-${c}`, label: c, clear: () => setPlpCats(prev => (Array.isArray(prev) ? prev : []).filter(x => x !== c)) }));
      (Array.isArray(plpTagFilter) ? plpTagFilter : []).forEach(t => plpActiveChips.push({ key: `tag-${t}`, label: `#${t}`, clear: () => setPlpTagFilter(prev => (Array.isArray(prev) ? prev : []).filter(x => x !== t)) }));
      (Array.isArray(plpColors) ? plpColors : []).forEach(c => plpActiveChips.push({ key: `col-${c}`, label: c, clear: () => setPlpColors(prev => (Array.isArray(prev) ? prev : []).filter(x => x !== c)) }));
      (Array.isArray(plpSizes) ? plpSizes : []).forEach(s => plpActiveChips.push({ key: `sz-${s}`, label: s, clear: () => setPlpSizes(prev => (Array.isArray(prev) ? prev : []).filter(x => x !== s)) }));
      (Array.isArray(plpSellers) ? plpSellers : []).forEach(s => plpActiveChips.push({ key: `sel-${s}`, label: s, clear: () => setPlpSellers(prev => (Array.isArray(prev) ? prev : []).filter(x => x !== s)) }));
      (Array.isArray(plpFabrics) ? plpFabrics : []).forEach(f => plpActiveChips.push({ key: `fab-${f}`, label: f, clear: () => setPlpFabrics(prev => (Array.isArray(prev) ? prev : []).filter(x => x !== f)) }));
      if (plpDiscountOnly) plpActiveChips.push({ key: 'disc', label: 'فقط تخفیف‌دار', clear: () => setPlpDiscountOnly(false) });
      if (plpMinDiscount > 0) plpActiveChips.push({ key: 'mind', label: `تخفیف ${toFa(plpMinDiscount)}٪+`, clear: () => setPlpMinDiscount(0) });
      if (plpInStockOnly) plpActiveChips.push({ key: 'stock', label: 'فقط موجود', clear: () => setPlpInStockOnly(false) });
      if (plpFastShipOnly) plpActiveChips.push({ key: 'fast', label: 'ارسال سریع', clear: () => setPlpFastShipOnly(false) });
      (Array.isArray(plpCities) ? plpCities : []).forEach(c => plpActiveChips.push({ key: `city-${c}`, label: c, clear: () => setPlpCities(prev => (Array.isArray(prev) ? prev : []).filter(x => x !== c)) }));
      if (plpPriceMin !== '' || plpPriceMax !== '') plpActiveChips.push({ key: 'price', label: `قیمت ${plpPriceMin || '…'}–${plpPriceMax || '…'}`, clear: () => { setPlpPriceMin(''); setPlpPriceMax(''); } });
      if (String(plpQuery || '').trim()) plpActiveChips.push({ key: 'q', label: `«${plpQuery}»`, clear: () => setPlpQuery('') });
      const activePlpCategory =
        (Array.isArray(plpCats) ? plpCats : []).length === 1
          ? (adminCategories || []).find((c) => c.name === plpCats[0] || c.slug === plpCats[0]) || {
              name: plpCats[0],
              description: '',
              image: '',
            }
          : null;
      const activePlpTag =
        plpTagFilter.length === 1
          ? (adminTags || []).find((t) => t.name === plpTagFilter[0] || t.slug === plpTagFilter[0]) || {
              name: plpTagFilter[0],
              description: '',
              image: '',
            }
          : null;
      const plpH1 = activePlpTag
        ? `برچسب: ${activePlpTag.name}`
        : activePlpCategory
        ? catLabelMap[activePlpCategory.name] || `پیراهن ${activePlpCategory.name}`
        : plpCats.length === 1
        ? catLabelMap[plpCats[0]] || `پیراهن ${plpCats[0]}`
        : 'همه محصولات';
      const plpSeoFooterHtml = activePlpTag
        ? (activePlpTag.description || '')
        : activePlpCategory
        ? (activePlpCategory.description || '')
        : getShopSeoBody();
      const plpSeoFooterIsHtml = !activePlpTag && !activePlpCategory && !!(getShopSeoBody() && /<[a-z][\s\S]*>/i.test(String(getShopSeoBody())));
      const plpSortLabel = ({ newest: 'جدیدترین', popular: 'پرفروش', 'price-asc': 'ارزان‌ترین', 'price-desc': 'گران‌ترین', discount: 'بیشترین تخفیف', rating: 'امتیاز' })[plpSort] || 'مرتب‌سازی';
      // smarter empty-state: suggest removing one filter
      const plpEmptyHints = [];
      if (plpFiltered.length === 0 && plpActiveChips.length > 0) {
        plpActiveChips.slice(0, 3).forEach(ch => {
          // approximate: show chip label as removable hint
          plpEmptyHints.push(ch);
        });
      }

      const formatPrice = (n) => (Number(n) || 0).toLocaleString('fa-IR');

      const scrollCarousel = (track, dir) => {
        if (!track) return;
        const step = Math.max(track.clientWidth * 0.7, 200);
        // In RTL, positive left moves the opposite way — flip so arrows feel natural
        const rtl = getComputedStyle(track).direction === 'rtl';
        track.scrollBy({ left: (rtl ? -dir : dir) * step, behavior: 'smooth' });
      };

      const CarouselArrows = ({ trackRef }) => (
        <>
          <button
            type="button"
            aria-label="قبلی"
            onClick={() => scrollCarousel(trackRef?.current, 1)}
            className="hidden sm:flex absolute top-1/2 -translate-y-1/2 right-0 z-10 w-9 h-9 items-center justify-center rounded-full bg-white/95 dark:bg-primary-800 shadow-md border border-primary-200 dark:border-white/30 text-primary-800 dark:text-white hover:bg-primary-50 dark:hover:bg-primary-700"
          >
            <Icon name="chevronRight" size={18} />
          </button>
          <button
            type="button"
            aria-label="بعدی"
            onClick={() => scrollCarousel(trackRef?.current, -1)}
            className="hidden sm:flex absolute top-1/2 -translate-y-1/2 left-0 z-10 w-9 h-9 items-center justify-center rounded-full bg-white/95 dark:bg-primary-800 shadow-md border border-primary-200 dark:border-white/30 text-primary-800 dark:text-white hover:bg-primary-50 dark:hover:bg-primary-700"
          >
            <Icon name="chevronLeft" size={18} />
          </button>
        </>
      );

      const BarList = ({ rows, valueKey = 1, labelKey = 0 }) => {
        const list = rows || [];
        const max = Math.max(1, ...list.map(r => {
          if (Array.isArray(r)) return Number(r[valueKey]) || 0;
          return Number(r[valueKey] || r.users || r.events || 0) || 0;
        }));
        return (
          <div className="space-y-2">
            {list.map((row, i) => {
              const label = Array.isArray(row) ? row[labelKey] : (row.key || row.name || row.id);
              const val = Array.isArray(row) ? (Number(row[valueKey]) || 0) : (Number(row[valueKey] || row.users || row.events || 0) || 0);
              return (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="w-28 sm:w-40 truncate text-primary-800 dark:text-white/90" title={String(label)}>{label}</span>
                  <div className="flex-1 h-2 rounded-full bg-primary-100 dark:bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-apple-blue" style={{ width: `${Math.min(100, (val / max) * 100)}%` }} />
                  </div>
                  <span className="w-14 text-left tabular-nums text-primary-600 dark:text-white/70" dir="ltr">{toFa(Math.round(val).toLocaleString('en-US'))}</span>
                </div>
              );
            })}
          </div>
        );
      };
      const Kpi = ({ label, value, sub }) => (
        <div className="p-3 rounded-xl border border-primary-100 dark:border-white/10 bg-primary-50/50 dark:bg-primary-800/40">
          <p className="text-[10px] text-primary-500 mb-1">{label}</p>
          <p className="text-lg font-bold text-primary-900 dark:text-white tabular-nums" dir="ltr">{value}</p>
          {sub ? <p className="text-[10px] text-primary-400 mt-0.5">{sub}</p> : null}
        </div>
      );

      const bestTrackRef = useRef(null);
      const newTrackRef = useRef(null);
      const amazingTrackRef = useRef(null);
      const reviewTrackRef = useRef(null);
      const recentTrackRef = useRef(null);
      const brandsTrackRef = useRef(null);
      const sellersTrackRef = useRef(null);
      const sellersListTrackRef = useRef(null);
      const sellerBestTrackRef = useRef(null);
      const sellerNewTrackRef = useRef(null);
      const sellerProfileRef = useRef(null);
      const blogsTrackRef = useRef(null);
      const [activeTip, setActiveTip] = useStoreField(shopUiStore, 'activeTip');

      // Close mega menu on outside tap (touch tablets)
      useEffect(() => {
        if (!megaOpen) return;
        const onPointer = (e) => {
          const header = headerRef.current;
          if (header && !header.contains(e.target)) setMegaOpen(null);
        };
        document.addEventListener('pointerdown', onPointer);
        return () => document.removeEventListener('pointerdown', onPointer);
      }, [megaOpen]);

      // Auto-hide mobile tip
      useEffect(() => {
        if (!activeTip) return;
        const t = setTimeout(() => setActiveTip(null), 2500);
        return () => clearTimeout(t);
      }, [activeTip]);

      const TipText = ({ text, className = '', lines = 2 }) => (
        <span
          className={`relative inline-block max-w-full align-top ${className}`}
          title={text}
          onClick={(e) => {
            // Mobile: tap shows full text tip (native title is weak on touch)
            if (window.matchMedia('(hover: none)').matches) {
              e.preventDefault();
              e.stopPropagation();
              setActiveTip((prev) => (prev === text ? null : text));
            }
          }}
        >
          <span className={lines === 1 ? 'line-clamp-1' : 'line-clamp-2'}>{text}</span>
          {activeTip === text && (
            <span className="sm:hidden absolute z-[80] bottom-full right-0 mb-1 max-w-[220px] rounded-lg bg-primary-900 text-white text-xs px-2.5 py-1.5 shadow-lg leading-snug">
              {text}
            </span>
          )}
        </span>
      );

      const renderProductCard = useCallback((p, keyPrefix = '', opts = {}) => {
        const gridMode = !!opts.grid;
        const colors = Array.isArray(p?.colors) ? p.colors : [];
        const colorIdx = Math.min(selectedColors[p?.id] ?? 0, Math.max(0, colors.length - 1));
        const activeColor = colors[colorIdx] || colors[0] || {
          name: '',
          image: p?.image || p?.cover_image || '/logo.webp',
        };
        const isFav = hasMounted && isFavorite(p.id);
        const inCompare = hasMounted && !!compare.find(c => c.id === p.id);
        const showOld = hasMounted && oldPriceOpen === p.id;
        const seller = p.seller || OWN_SELLER;
        return (
          <div
            key={`${keyPrefix}${p.id}`}
            role="button"
            tabIndex={0}
            onClick={() => openPDP(p)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPDP(p); } }}
            suppressHydrationWarning
            className={`gsap-card product-card bg-white dark:bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-sm flex flex-col cursor-pointer select-none border border-primary-100/80 dark:border-white/10 ${gridMode ? 'w-full h-full' : 'flex-shrink-0 w-[78%] min-[400px]:w-[70%] sm:w-[42%] md:w-[calc((100%-2.5rem)/3.3)] lg:w-[calc((100%-3.5rem)/4.3)] snap-start'}`}
          >
            <div className="px-2.5 pt-2.5 sm:px-3.5 sm:pt-3.5 sm:pb-0">
              <h3 className="text-base font-bold text-primary-900 dark:text-white">
                <TipText text={p.name} className="font-bold text-primary-900 dark:text-white text-base" />
              </h3>
              <div className="mt-1.5 flex flex-col items-start gap-1 min-h-[3.5rem]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const sid = seller?.id || seller?.seller_id || p.sellerId || p.seller_id || p.seller?.id || null;
                    if (sid) openSeller(sid);
                    else {
                      try { openSellersList(); } catch (_) {}
                    }
                  }}
                  className="product-seller-badge inline-flex items-center gap-1 h-6 sm:h-7 px-1.5 sm:px-2 rounded-md bg-primary-900 dark:bg-white text-white dark:!text-primary-900 text-xs font-bold whitespace-nowrap max-w-full transition border border-primary-900 dark:border-white cursor-pointer hover:opacity-90"
                  title="مشاهده فروشگاه"
                >
                  <span className="truncate">{`فروشنده: ${seller?.name && seller.name !== "undefined" ? seller.name : (seller?.shop_name || "فروشگاه")}`}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const cat = (p.category || (Array.isArray(p.categories) && p.categories[0]) || '').trim();
                    if (cat && cat !== '—') {
                      try {
                        if (typeof openCategory === 'function') openCategory(cat);
                        else if (typeof openPLP === 'function') openPLP({ cat });
                      } catch (_) {}
                    } else {
                      try { if (typeof openPLP === 'function') openPLP(); } catch (_) {}
                    }
                  }}
                  className="product-category-badge inline-flex items-center h-6 sm:h-7 px-1.5 sm:px-2 rounded-md bg-primary-100 dark:bg-primary-700 text-primary-900 dark:!text-white text-xs font-semibold whitespace-nowrap transition border border-primary-200/80 dark:border-white/25 cursor-pointer hover:opacity-90"
                  title="مشاهده این دسته"
                >
                  {p.category || (Array.isArray(p.categories) && p.categories[0]) || 'عمومی'}
                </button>
              </div>
            </div>
            <div className="relative aspect-[1/1] sm:aspect-[4/5] overflow-hidden bg-primary-50 dark:bg-black mx-2 my-1.5 sm:mx-3.5 sm:my-3 rounded-md sm:rounded-xl group/img">
              <img src={activeColor.image || p?.image || '/logo.webp'} alt={`${p.name || ''} - ${activeColor.name || ''}`} loading="lazy" decoding="async" referrerPolicy="no-referrer" className={`w-full h-full object-cover transition-opacity duration-300 pointer-events-none ${colors.length > 1 ? 'group-hover/img:opacity-0' : ''}`} onError={(e) => { e.currentTarget.classList.add('img-broken'); e.currentTarget.src = '/logo.webp'; }} />
              {colors.length > 1 && colors[colorIdx === 0 ? 1 : 0]?.image && (
                <img src={colors[colorIdx === 0 ? 1 : 0].image} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 pointer-events-none" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              )}
              <div className="product-card-badges absolute top-1.5 right-1.5 z-10 flex flex-col items-stretch gap-1 w-max max-w-[45%] pointer-events-none">
                {p.discount ? (
                  <span className="product-card-badge bg-apple-blue text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md shadow-sm leading-tight text-white text-center whitespace-nowrap">
                    {toFa(p.discount)}٪ تخفیف
                  </span>
                ) : null}
                {p.amazing && (
                  <span className="product-card-badge bg-gradient-to-l from-amber-500 to-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-md shadow-sm text-center whitespace-nowrap">شگفت‌انگیز</span>
                )}
                {p.popular && !p.amazing && (
                  <span className="product-card-badge bg-amber-500 !text-white text-xs font-semibold px-1.5 py-0.5 rounded-md shadow-sm text-center whitespace-nowrap">پرفروش</span>
                )}
                {isProductFastShip(p) && (
                  <span className="product-card-badge bg-emerald-600 !text-white text-xs font-semibold px-1.5 py-0.5 rounded-md shadow-sm text-center whitespace-nowrap">ارسال سریع</span>
                )}
                {p.inStock === false && (
                  <span className="product-card-badge bg-primary-800 text-white text-xs font-medium px-1.5 py-0.5 rounded-md shadow-sm text-center whitespace-nowrap">ناموجود</span>
                )}
              </div>
              <div className="absolute bottom-1.5 right-1.5 z-10 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggleCompare(p); }}
                  className={`w-11 h-11 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-md transition ${inCompare ? 'bg-apple-blue text-white dark:!text-white' : 'bg-white/95 dark:bg-primary-800 text-primary-700 dark:!text-white hover:bg-white dark:hover:bg-primary-700 hover:text-[#FF0000] dark:hover:text-[#7EFAFF] dark:hover:!text-[#7EFAFF] dark:text-[#13ABC4] border border-primary-100 dark:border-white/20'}`}
                  title="مقایسه"
                  aria-label="مقایسه"
                >
                  <Icon name="scale" size={14} />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id); }}
                  className={`w-11 h-11 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-md transition ${isFav ? 'bg-apple-blue text-white dark:!text-white' : 'bg-white/95 dark:bg-primary-800 text-primary-700 dark:!text-white hover:bg-white dark:hover:bg-primary-700 hover:text-[#FF0000] dark:hover:text-[#7EFAFF] dark:hover:!text-[#7EFAFF] dark:text-[#13ABC4] border border-primary-100 dark:border-white/20'}`}
                  title={isFav ? 'حذف از علاقه‌مندی' : 'افزودن به علاقه‌مندی'}
                  aria-label="علاقه‌مندی"
                >
                  <Icon name={isFav ? 'heartFilled' : 'heart'} size={14} />
                </button>
              </div>
            </div>
            <div className="px-2.5 pb-2.5 sm:px-3.5 sm:pb-3.5 md:px-4 md:pb-4 mt-auto">
              <div className="flex items-center justify-center gap-1.5 mb-1.5 sm:mb-2">
                <div className="flex items-center gap-0.5" title={`میانگین امتیاز فروشنده: ${seller.rating ?? p.rating}`}>
                  {[1, 2, 3, 4, 5].map((n) => {
                    const score = Number(seller.rating ?? p.rating ?? 0);
                    const filled = n <= Math.round(score);
                    return (
                      <Icon
                        key={n}
                        name={filled ? 'starFilled' : 'star'}
                        size={14}
                        className={filled ? 'text-primary-400' : 'text-primary-200 dark:text-primary-600'}
                      />
                    );
                  })}
                </div>
                <span className="text-xs sm:text-xs text-primary-500 dark:text-white tabular-nums">
                  {toFa(Number(seller.rating ?? p.rating ?? 0).toFixed(1))}
                  {seller.ratingCount ? (
                    <span className="text-primary-400 dark:text-white"> ({toFa(seller.ratingCount)})</span>
                  ) : null}
                </span>
              </div>
              <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                <div className="min-w-0 flex items-center gap-1.5 relative">
                  <p className="product-card-price font-bold text-sm leading-none text-primary-900 dark:!text-white">
                    {p.priceText} <span className="font-normal dark:!text-white">تومان</span>
                  </p>
                  {p.oldPrice ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOldPriceOpen(showOld ? null : p.id);
                      }}
                      className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-apple-blue text-white flex items-center justify-center hover:opacity-90 transition shadow-sm"
                      title="قیمت قبل حراج"
                      aria-label="قیمت قبل حراج"
                    >
                      <Icon name="sell" size={14} className="text-white" />
                    </button>
                  ) : null}
                  {p.oldPrice && showOld ? (
                    <span className="absolute bottom-full right-0 mb-1.5 z-30 whitespace-nowrap rounded-lg bg-primary-900 dark:bg-primary-800 text-white text-xs px-2.5 py-1.5 shadow-lg">
                      قیمت قبل حراج: {p.oldPrice} تومان
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); openQuickAdd(p); }}
                  className="product-add-btn px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-xl border border-transparent bg-apple-blue text-white dark:!text-white hover:bg-blue-700 hover:text-white dark:hover:!bg-[#1A1C20] dark:hover:!text-[#7EFAFF] dark:text-[#13ABC4] dark:hover:!border-white transition flex-shrink-0"
                >
                  افزودن
                </button>
              </div>
            </div>
          </div>
        );
      }, [selectedColors, hasMounted, compare, favorites, oldPriceOpen]);

      // ——— Seller pages helpers ———
      const openSeller = (id) => {
        try {
          if (!id) {
            try { openSellersList(); } catch (_) {}
            return;
          }
          if (id === 's-blocked' || String(id).startsWith('s-pending')) {
            showToast({ message: 'این فروشگاه در دسترس نیست', variant: 'default', duration: 3000, position: 'top-center' });
            return;
          }
        } catch (_) {}

        try { if (typeof beginPageLoad === 'function') beginPageLoad('sellers'); } catch (_) {}
        setPdpProduct(null);
        setShowSellersList(false);
        setShowPLP(false);
        setShowCartPage(false);
        setShowCheckout(false);
        setShowWishlistPage(false);
        setShowComparePage(false);
        setShowRecentPage(false);
        setShowProfilePage(false);
        setShowAdminPanel(false);
        setShowSellerPanel(false);
        setStaticPage(null);
        setActiveSellerId(id);
        setSellerCat('');
        setSellerSort('');
        setSellerDiscountOnly(false);
        setSellerBannerIdx(0);
        setSellerFaqOpen(null);
        setSellerReportOpen(false);
        setSellerReportSent(false);
        setMobileMenuOpen(false);
        setMegaOpen(null);
        try {
          const s =
            (Array.isArray(topSellers) ? topSellers : []).find((x) => String(x.id) === String(id))
            || null;
          const label = s?.shopName || s?.name || id;
          try {
            pushFaUrl(pathForSellerStore(label), { seller: id });
          } catch (_) {
            pushFaUrl((FA_PATHS.sellers || '/فروشندگان') + '/' + encodeURIComponent(String(id)), { seller: id });
          }
        } catch (_) {}
        try {
          if (typeof scrollPageToTop === 'function') scrollPageToTop();
          else window.scrollTo(0, 0);
        } catch (_) {}
        // اگر هنوز در topSellers نیست، یک‌بار از API بگیر و merge کن
        try {
          if (!(Array.isArray(topSellers) && topSellers.some((x) => String(x.id) === String(id)))) {
            fetch('/api/catalog/sellers', { cache: 'no-store', headers: { Accept: 'application/json' } })
              .then((r) => r.json())
              .then((data) => {
                if (!data?.ok || !Array.isArray(data.sellers)) return;
                const mapped = data.sellers.map((s) => {
                  const products = Number(s.active_products_count != null ? s.active_products_count : s.products_count) || 0;
                  return {
                    id: s.id,
                    name: s.shop_name || s.shopName || 'فروشگاه',
                    shopName: s.shop_name || s.shopName || 'فروشگاه',
                    slug: s.slug || '',
                    desc: s.about || '',
                    about: s.about || '',
                    city: s.city || '',
                    image: s.logo_url || s.logo || '/logo.webp',
                    logo: s.logo_url || s.logo || '',
                    banner: s.banner_url || s.logo_url || '/logo.webp',
                    rating: s.rating != null ? Number(s.rating) : 0,
                    ratingCount: s.rating_count != null ? Number(s.rating_count) : 0,
                    products,
                    productsSafe: products,
                    productsCount: products,
                    joinDate: s.created_at ? String(s.created_at).slice(0, 10) : '',
                    badges: [],
                    status: s.status || 'approved',
                  };
                });
                setTopSellers(mapped);
              })
              .catch(() => {});
          }
        } catch (_) {}
      };
      const openSellersList = () => {
        beginPageLoad('sellers');
        closeStaticPage();
        setActiveSellerId(null);
        setShowPLP(false);
        setShowCartPage(false);
        setShowCheckout(false);
        setShowWishlistPage(false);
        setShowComparePage(false);
        setShowRecentPage(false);
        setShowProfilePage(false);
        setPdpProduct(null);
        setShowSellersList(true);
        setShowAdminPanel(false);
        setShowSellerPanel(false);
        setMobileMenuOpen(false);
        setMegaOpen(null);
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete('seller');
          url.searchParams.delete('plp');
          url.searchParams.delete('cat');
          url.searchParams.set('sellers', '1');
          pushFaUrl(FA_PATHS.sellers, { sellers: true });
        } catch (_) {}
        window.scrollTo({ top: 0, behavior: 'instant' });
      };
      const closeSeller = () => {
        setActiveSellerId(null);
        try {
          if (typeof leaveCurrentPage === 'function') leaveCurrentPage();
          else if (typeof window !== 'undefined' && window.history.length > 1) window.history.back();
          else {
            setShowSellersList(true);
            try { pushFaUrl(FA_PATHS.sellers, { sellers: true }); } catch (_) {}
          }
        } catch (_) {
          setShowSellersList(true);
        }
        try { if (typeof scrollPageToTop === 'function') scrollPageToTop(); else window.scrollTo(0, 0); } catch (_) {}
      };
      const closeSellersList = () => {
        try { beginPageLoad('home'); } catch (_) {}
        try { pushFaUrl(FA_PATHS.home || '/'); } catch (_) {}
        try { applyPathRef.current(); } catch (_) {
          setShowSellersList(false);
        }
        window.scrollTo({ top: 0, behavior: 'instant' });
      };
      const shareSeller = async (seller) => {
        const url = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?seller=${seller.id}` : '';
        try {
          if (navigator.share) {
            await navigator.share({ title: seller.name, text: seller.desc || seller.name, url });
          } else if (navigator.clipboard) {
            await navigator.clipboard.writeText(url);
            showToast({ message: 'لینک فروشنده کپی شد', variant: 'success', position: 'top-center' });
          }
        } catch (_) {
          try {
            await navigator.clipboard.writeText(url);
            showToast({ message: 'لینک فروشنده کپی شد', variant: 'success', position: 'top-center' });
          } catch (__) {}
        }
      };

      /** نوار اشتراک‌گذاری شبکه اجتماعی — انتهای صفحه محصول / مطلب */
      const getPageShareUrl = () => {
        try { return typeof window !== 'undefined' ? window.location.href : ''; } catch { return ''; }
      };
      const copyShareLink = async (url) => {
        const u = url || getPageShareUrl();
        try {
          if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(u);
          else {
            const ta = document.createElement('textarea');
            ta.value = u; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
          }
          try { showToast({ message: 'لینک کپی شد', variant: 'success', position: 'top-center' }); } catch (_) {
            try { pushLiveToast('لینک کپی شد', { type: 'success' }); } catch (__) {}
          }
        } catch (_) {}
      };
      const nativeShare = async (title, text, url) => {
        const u = url || getPageShareUrl();
        try {
          if (navigator.share) {
            await navigator.share({ title: title || document.title, text: text || '', url: u });
          } else {
            await copyShareLink(u);
          }
        } catch (_) {}
      };
      const renderShareBar = (opts = {}) => {
        const title = opts.title || '';
        const text = opts.text || title;
        const url = opts.url || getPageShareUrl();
        const u = encodeURIComponent(url);
        const t = encodeURIComponent(text);
        const full = encodeURIComponent([title, text, url].filter(Boolean).join('\n'));
        const btn = 'w-10 h-10 rounded-full flex items-center justify-center border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-950 text-primary-700 dark:text-white hover:border-apple-blue hover:text-apple-blue transition shadow-sm';
        return (
          <div className="mt-8 sm:mt-10 pt-6 border-t border-primary-100 dark:border-white/15" data-share-bar="1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <p className="text-sm font-bold text-primary-900 dark:text-white flex items-center gap-2 shrink-0">
                <Icon name="share" size={16} />
                اشتراک‌گذاری
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <a href={`https://t.me/share/url?url=${u}&text=${t}`} target="_blank" rel="noopener noreferrer" className={btn} title="تلگرام" aria-label="اشتراک در تلگرام">
                  <Icon name="send" size={16} />
                </a>
                <a href={`https://wa.me/?text=${full}`} target="_blank" rel="noopener noreferrer" className={btn} title="واتساپ" aria-label="اشتراک در واتساپ">
                  <Icon name="messageCircle" size={16} />
                </a>
                <a href={`https://twitter.com/intent/tweet?url=${u}&text=${t}`} target="_blank" rel="noopener noreferrer" className={btn} title="X / توییتر" aria-label="اشتراک در توییتر">
                  <Icon name="twitter" size={16} />
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`} target="_blank" rel="noopener noreferrer" className={btn} title="لینکدین" aria-label="اشتراک در لینکدین">
                  <Icon name="linkedin" size={16} />
                </a>
                <button type="button" onClick={() => copyShareLink(url)} className={btn} title="کپی لینک" aria-label="کپی لینک">
                  <Icon name="copy" size={16} />
                </button>
                <button type="button" onClick={() => nativeShare(title, text, url)} className={`${btn} bg-apple-blue border-apple-blue text-white hover:opacity-95 hover:text-white`} title="اشتراک‌گذاری" aria-label="اشتراک‌گذاری بیشتر">
                  <Icon name="share" size={16} />
                </button>
              </div>
            </div>
          </div>
        );
      };
      const matchSellerId = (p, sid) => {
        if (!p || !sid) return false;
        const a = String(sid);
        const candidates = [
          p.sellerId,
          p.seller_id,
          p.seller?.id,
          p.seller?.seller_id,
        ].filter(Boolean).map(String);
        return candidates.includes(a);
      };
      const catalogPool = [
        ...(Array.isArray(catalogProducts) ? catalogProducts : []),
        ...(Array.isArray(serverProducts) ? serverProducts : []),
        ...(Array.isArray(products) ? products : []),
      ];
      // پروفایل فروشنده: اول از لیست API، وگرنه آبجکت حداقلی تا صفحه خالی نماند
      const activeSeller = activeSellerId
        ? (
            (topSellers || []).find((s) => String(s.id) === String(activeSellerId))
            || {
              id: activeSellerId,
              name: 'فروشگاه',
              shopName: 'فروشگاه',
              image: '/logo.webp',
              banner: '/logo.webp',
              banners: ['/logo.webp'],
              products: 0,
              rating: 0,
              ratingCount: 0,
              about: '',
              desc: '',
              city: '',
              joinDate: '',
              badges: [],
              avgShipDays: 3,
              onTimeRate: 0,
              responseTime: '',
              followers: null,
              faq: [],
            }
          )
        : null;
      const sellerProductsRaw = activeSellerId
        ? catalogPool.filter((p) => matchSellerId(p, activeSellerId))
        : [];
      // بدون پر کردن با محصول فروشندهٔ دیگر (حذف فالبک دمو)
      const sellerProductsBase = sellerProductsRaw;
      const sellerProductsFiltered = sellerProductsBase.filter((p) => {
        const cat = String(p?.category || '');
        const matchCat =
          !sellerCat ||
          sellerCat === 'همه' ||
          cat === sellerCat ||
          (cat && cat.includes(sellerCat));
        const matchDiscount = !sellerDiscountOnly || (Number(p?.discount) || 0) > 0;
        return matchCat && matchDiscount;
      });
      const sellerProductsSorted = [...sellerProductsFiltered].sort((a, b) => {
        if (sellerSort === 'price-asc') return (Number(a.price) || 0) - (Number(b.price) || 0);
        if (sellerSort === 'price-desc') return (Number(b.price) || 0) - (Number(a.price) || 0);
        if (sellerSort === 'rating') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
        if (sellerSort === 'popular') return (Number(b.reviews) || 0) - (Number(a.reviews) || 0);
        const ta = a.createdAt || a.created_at || '';
        const tb = b.createdAt || b.created_at || '';
        if (ta || tb) return String(tb).localeCompare(String(ta));
        return String(b.id || '').localeCompare(String(a.id || ''));
      });
      const sellerCategories = ['همه', ...new Set(sellerProductsBase.map(p => p.category))];
      const sellerNewestProducts = [...sellerProductsBase].sort((a, b) => b.id - a.id).slice(0, 6);
      const sellerBestProducts = [...sellerProductsBase].sort((a, b) => (b.reviews || 0) - (a.reviews || 0) || (b.rating || 0) - (a.rating || 0)).slice(0, 6);
      const sellerHasDiscount = sellerProductsBase.some(p => p.discount && p.discount > 0);
      const sellerSimilarProducts = sellerProductsRaw.length === 0 && activeSellerId
        ? catalogPool.filter((p) => !matchSellerId(p, activeSellerId)).slice(0, 6)
        : [];
      const sellerReviews = [
        { name: 'علی م.', rating: 5, date: '۱۴۰۳/۰۴/۱۲', text: 'کیفیت پارچه و دوخت عالی بود. بسته‌بندی مرتب و ارسال به‌موقع.' },
        { name: 'رضا ک.', rating: 4, date: '۱۴۰۳/۰۳/۲۸', text: 'از خریدم راضی‌ام. رنگ‌ها دقیقاً مثل عکس بودن.' },
        { name: 'محمد حسینی', rating: 5, date: '۱۴۰۳/۰۳/۱۵', text: 'فروشنده پاسخ‌گو و حرفه‌ای. حتماً دوباره خرید می‌کنم.' },
      ];

      useEffect(() => {
        if (!activeSellerId) { setSellerStickyBar(false); return; }
        const onScroll = () => {
          const el = sellerProfileRef.current;
          if (!el) return;
          const bottom = el.getBoundingClientRect().bottom;
          setSellerStickyBar(bottom < 80);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
      }, [activeSellerId]);

      // URL sync: ?seller=id | ?sellers=1 | ?plp=1 | ?cat= | /amirshn (ادمین)
      useEffect(() => {
        const applyFromUrl = () => {
          try {
            const path = (window.location.pathname || '').replace(/\/+$/, '');
            if (path.endsWith('/amirshn') || path === '/amirshn') {
              if (adminUser) openAdminPanel('dashboard');
              else openAdminAuth();
              return;
            }
            // پنل فروشنده / خریدار از URL
            {
              const pnorm = (path || "").replace(/\/+$/, "") || "/";
              if (
                pnorm === "/پنل-فروشنده" ||
                pnorm.endsWith("/پنل-فروشنده") ||
                pnorm === "/seller" ||
                pnorm === "/seller-panel"
              ) {
                setShowSellerPanel(true);
                try { setShowProfilePage(false); } catch (_) {}
                try { setShowPLP(false); } catch (_) {}
                try { setActiveSellerId(null); } catch (_) {}
                return;
              }
              if (
                pnorm === "/حساب-من" ||
                pnorm.endsWith("/حساب-من") ||
                pnorm === "/account" ||
                pnorm === "/profile"
              ) {
                setShowProfilePage(true);
                try { setShowSellerPanel(false); } catch (_) {}
                return;
              }
            }

// مسیرهای SEO امن: /دسته و /فروشنده/دسته
            try {
              const parts = (path || "").replace(/^\//, "").split("/").filter(Boolean);
              const catList = Array.isArray(adminCategories) ? adminCategories : [];
              const sellers = Array.isArray(topSellers) ? topSellers : [];
              const norm = (x) => {
                try { return typeof slugifyFa === "function" ? slugifyFa(x) : String(x || "").trim(); }
                catch (_) { return String(x || "").trim(); }
              };
              const findCat = (slug) => {
                const sf = norm(slug);
                if (!sf) return null;
                return catList.find((c) => c && c.active !== false && (
                  norm(c.name) === sf || norm(c.slug) === sf || String(c.slug) === String(slug) || String(c.name) === String(slug)
                )) || null;
              };
              const findSeller = (slug) => {
                const sf = norm(slug);
                if (!sf) return null;
                return sellers.find((x) => {
                  const n = norm(x && (x.shopName || x.name) || "");
                  return n === sf || String(x.id) === String(slug);
                }) || null;
              };
              if (parts.length === 1) {
                const cat = findCat(parts[0]);
                if (cat) {
                  setActiveSellerId(null);
                  setShowSellersList(false);
                  setShowPLP(true);
                  setPlpCats([cat.name]);
                  setPlpTagFilter([]);
                  return;
                }
              }
              if (parts.length === 2) {
                const seller = findSeller(parts[0]);
                const cat = findCat(parts[1]);
                if (seller && cat) {
                  setShowSellersList(false);
                  setShowPLP(false);
                  setActiveSellerId(seller.id);
                  setPlpCats([cat.name]);
                  return;
                }
              }
            } catch (err) {
              try { console.warn("[seo-path]", err); } catch (_) {}
            }

const params = new URLSearchParams(window.location.search);
            const sid = params.get('seller');
            if (sid && topSellers.some(s => s.id === sid)) {
              setShowSellersList(false);
              setShowPLP(false);
              setActiveSellerId(sid);
              return;
            }
            if (params.get('sellers') === '1') {
              setActiveSellerId(null);
              setShowPLP(false);
              setShowSellersList(true);
              return;
            }
            if (params.get('wishlist') === '1') {
              setShowWishlistPage(true);
              setShowRecentPage(false);
              setShowComparePage(false);
              return;
            }
            if (params.get('compare')) {
              setShowComparePage(true);
              setShowRecentPage(false);
              setShowWishlistPage(false);
              return;
            }
            if (params.get('cart') === '1') {
              setShowCartPage(true);
              setShowRecentPage(false);
              setShowWishlistPage(false);
              setShowComparePage(false);
              return;
            }
            if (params.get('recent') === '1') {
              setShowRecentPage(true);
              setShowCartPage(false);
              setShowWishlistPage(false);
              setShowComparePage(false);
              return;
            }
            const sp = params.get('page');
            if (sp) {
              setStaticPage(sp);
              setBlogPostId(params.get('blog') || null);
              return;
            }
            const hub = params.get('hub');
            if (hub === 'categories' || hub === 'tags') {
              setShowTaxonomyHub(hub);
              setShowPLP(false);
              return;
            }
            const cat = params.get('cat');
            const tag = params.get('tag');
            if (cat || tag || params.get('plp') === '1') {
              setActiveSellerId(null);
              setShowSellersList(false);
              setShowPLP(true);
              if (cat) {
                const decoded = decodeURIComponent(cat).replace(/-/g, ' ');
                const key = normalizeCategoryKey(decoded);
                setPlpCats(key ? [key] : []);
              } else {
                setPlpCats([]);
              }
              // برچسب: فیلتر می‌شود اما noindex (قانون سراسری)
              if (tag) {
                const decodedTag = decodeURIComponent(tag).replace(/-/g, ' ');
                const match = (adminTags || []).find(t => t.slug === tag || t.name === decodedTag);
                setPlpTagFilter([match?.name || decodedTag]);
              } else {
                setPlpTagFilter([]);
              }
            }
          } catch (_) {}
        };
        applyFromUrl();
        window.addEventListener('popstate', applyFromUrl);
        return () => window.removeEventListener('popstate', applyFromUrl);
      }, []);

      // infinite scroll PLP
      useEffect(() => {
        if (!showPLP || !plpHasMore) return;
        const el = plpSentinelRef.current;
        if (!el) return;
        const io = new IntersectionObserver((entries) => {
          if (entries[0]?.isIntersecting) {
            setPlpVisible(v => Math.min(v + 8, plpFiltered.length));
          }
        }, { rootMargin: '200px' });
        io.observe(el);
        return () => io.disconnect();
      }, [showPLP, plpHasMore, plpFiltered.length, plpVisible]);

      /* ——— SEO سراسری: دسته ایندکس‌پذیر / برچسب هرگز ایندکس نشود ——— */
      useEffect(() => {
        if (typeof document === 'undefined') return;
        const setMeta = (name, content) => {
          let el = document.querySelector(`meta[name="${name}"]`);
          if (!el) {
            el = document.createElement('meta');
            el.setAttribute('name', name);
            document.head.appendChild(el);
          }
          el.setAttribute('content', content);
        };
        let tagInUrl = false;
        try {
          tagInUrl = !!(new URL(window.location.href).searchParams.get('tag'));
        } catch (_) {}
        const isTagView = tagInUrl || (showPLP && plpTagFilter.length > 0);
        const isCategoryView = showPLP && plpCats.length === 1 && plpTagFilter.length === 0;
        const s = { ...defaultSeoConfig(), ...(adminSettings?.seo || {}) };
        // اعمال واقعی: هر سوییچ پنل → meta robots در <head>
        const ix = (flag) => (flag === false ? 'noindex, nofollow' : 'index, follow');
        let robotsVal = ix(s.indexHome);
        if (isTagView) {
          robotsVal = 'noindex, nofollow'; // برچسب‌ها همیشه noindex
        } else if (isCategoryView) {
          robotsVal = ix(s.indexCategories);
        } else if (showPLP) {
          robotsVal = ix(s.indexCategories);
        } else if (pdpProduct) {
          robotsVal = ix(s.indexProducts);
        } else if (staticPage === 'blog') {
          robotsVal = ix(s.indexBlog);
        } else if (staticPage === 'blog-post') {
          robotsVal = ix(s.indexBlogPosts);
        } else if (staticPage === 'brands' || staticPage === 'campaigns' || staticPage === 'deals' || staticPage === 'become-seller') {
          robotsVal = ix(s.indexStatic !== false);
        } else if (staticPage) {
          // about, contact, faq, terms, privacy, returns, sitemap, cookies, size-guide
          robotsVal = ix(s.indexStatic !== false);
        } else if (activeSellerId || showSellersList) {
          robotsVal = ix(s.indexSellers);
        } else if (showProfilePage || showSellerPanel || showAdminPanel || showCartPage || showCheckout || showWishlistPage || showComparePage || showRecentPage) {
          robotsVal = 'noindex, nofollow'; // پنل‌ها و سبد خصوصی
        } else {
          robotsVal = ix(s.indexHome);
        }
        setMeta('robots', robotsVal);
        setMeta('googlebot', robotsVal);
        setMeta('bingbot', robotsVal);
        // override دستی هر صفحه از pageSeoMap
        try {
          const ctx = getCurrentPageSeoContext();
          const resolved = getResolvedPageSeo(ctx);
          if (pageSeoMap[ctx.key] && resolved.indexable === false) {
            setMeta('robots', 'noindex, nofollow');
            setMeta('googlebot', 'noindex, nofollow');
            setMeta('bingbot', 'noindex, nofollow');
          } else if (pageSeoMap[ctx.key] && resolved.indexable === true) {
            setMeta('robots', 'index, follow');
            setMeta('googlebot', 'index, follow');
            setMeta('bingbot', 'index, follow');
          }
        } catch (_) {}
      }, [showPLP, plpCats, plpTagFilter, adminSettings, pdpProduct, staticPage, pageSeoMap, activeSellerId, showSellersList, showProfilePage, showSellerPanel, showAdminPanel, showCartPage, showCheckout, showWishlistPage, showComparePage, showRecentPage]);

      /* فاز A: title + description + canonical + Open Graph + Twitter + JSON-LD پویا */
      useEffect(() => {
        try {
          const s = seoCfg();
          const base = (s.canonicalBase || 'https://pirahanemardane.ir').replace(/\/$/, '');
          const ctx = getCurrentPageSeoContext();
          const resolved = getResolvedPageSeo(ctx);
          const tpl = s.siteTitleTemplate || '%s | پیراهن مردانه';
          let title = resolved.title || s.siteTitle || 'پیراهن مردانه';
          let description = resolved.description || s.metaDescription || '';
          let image = base + '/logo.webp';
          let canonical = base + (typeof window !== 'undefined' ? (window.location.pathname + window.location.search) : '/');
          let breadcrumbs = [{ name: 'خانه', path: '/' }];

          if (pdpProduct) {
            title = pdpProduct.seoTitle || pdpProduct.name || title;
            description = stripHtmlSeo(pdpProduct.seoDescription || pdpProduct.desc || description);
            image = pdpProduct.seoOgImage || pdpProduct.colors?.[0]?.image || pdpProduct.images?.[0] || pdpProduct.image || image;
            if (pdpProduct.seoCanonical) canonical = pdpProduct.seoCanonical;
            if (pdpProduct.seoNoindex) {
              setOrCreateMeta('name', 'robots', 'noindex, nofollow');
            }
            breadcrumbs = [
              { name: 'خانه', path: '/' },
              { name: 'فروشگاه', path: '/shop' },
              { name: pdpProduct.category || 'محصول', path: pdpProduct.category ? `/shop?cat=${encodeURIComponent(pdpProduct.category)}` : '/shop' },
              { name: pdpProduct.name, path: '' },
            ];
            upsertJsonLd('pm-schema-product', buildProductSchema(pdpProduct));
            upsertJsonLd('pm-schema-faq', buildFaqSchema(pdpProduct.seoFaq));
          } else {
            upsertJsonLd('pm-schema-product', null);
            if (staticPage !== 'blog-post') upsertJsonLd('pm-schema-faq', null);
          }

          if (staticPage === 'blog-post' && blogPostId) {
            const post = (blogPosts || []).find(b => b.id === blogPostId);
            if (post) {
              title = post.seoTitle || post.title || title;
              description = stripHtmlSeo(post.seoDescription || post.excerpt || description);
              image = post.seoOgImage || post.image || image;
              if (post.seoCanonical) canonical = post.seoCanonical;
              if (post.seoNoindex) setOrCreateMeta('name', 'robots', 'noindex, nofollow');
              breadcrumbs = [
                { name: 'خانه', path: '/' },
                { name: 'بلاگ', path: '/blog' },
                { name: post.title, path: '' },
              ];
              upsertJsonLd('pm-schema-article', buildArticleSchema(post));
              upsertJsonLd('pm-schema-faq', buildFaqSchema(post.seoFaq));
            }
          } else {
            upsertJsonLd('pm-schema-article', null);
          }

          if (!(showProfilePage || showSellerPanel || showAdminPanel || showCartPage || showCheckout || showWishlistPage || showComparePage || showRecentPage)) {
            document.title = (ctx.type === 'home') ? (title || s.siteTitle) : (tpl.includes('%s') ? tpl.replace('%s', title) : `${title} | ${s.siteTitle || ''}`);
            setOrCreateMeta('name', 'description', description);
            setCanonicalLink(canonical);
            setOrCreateMeta('property', 'og:type', pdpProduct ? 'product' : (staticPage === 'blog-post' ? 'article' : 'website'));
            setOrCreateMeta('property', 'og:title', title);
            setOrCreateMeta('property', 'og:description', description);
            setOrCreateMeta('property', 'og:url', canonical);
            setOrCreateMeta('property', 'og:image', image);
            setOrCreateMeta('property', 'og:site_name', s.siteTitle || 'پیراهن مردانه');
            setOrCreateMeta('property', 'og:locale', 'fa_IR');
            setOrCreateMeta('name', 'twitter:card', 'summary_large_image');
            setOrCreateMeta('name', 'twitter:title', title);
            setOrCreateMeta('name', 'twitter:description', description);
            setOrCreateMeta('name', 'twitter:image', image);
            upsertJsonLd('pm-schema-org-auto', defaultOrganizationSchema());
            upsertJsonLd('pm-schema-local', buildLocalBusinessSchema());
            upsertJsonLd('pm-schema-breadcrumb', buildBreadcrumbSchema(breadcrumbs));
            // Custom schemas (ادمین)
            try {
              const customs = Array.isArray(s.customSchemas) ? s.customSchemas : [];
              customs.forEach((cs, i) => {
                if (!cs || !cs.enabled) return;
                const when = cs.when || 'all';
                let ok = when === 'all';
                if (when === 'product') ok = !!pdpProduct;
                if (when === 'article') ok = staticPage === 'blog-post';
                if (when === 'home') ok = !pdpProduct && !staticPage && !showPLP;
                if (ok && cs.json) {
                  try { upsertJsonLd('pm-schema-custom-' + i, typeof cs.json === 'string' ? JSON.parse(cs.json) : cs.json); }
                  catch (_) { upsertJsonLd('pm-schema-custom-' + i, null); }
                } else {
                  upsertJsonLd('pm-schema-custom-' + i, null);
                }
              });
            } catch (_) {}
          } else {
            upsertJsonLd('pm-schema-breadcrumb', null);
          }
        } catch (_) {}
      }, [showPLP, plpCats, plpTagFilter, adminSettings, pdpProduct, staticPage, blogPostId, blogPosts, pageSeoMap, activeSellerId, showSellersList, showProfilePage, showSellerPanel, showAdminPanel, showCartPage, showCheckout, showWishlistPage, showComparePage, showRecentPage]);

      useEffect(() => {
        if (plpFilterOpen || plpSortOpen) document.body.style.overflow = 'hidden';
        return () => { if (plpFilterOpen || plpSortOpen) document.body.style.overflow = ''; };
      }, [plpFilterOpen, plpSortOpen]);
      useEffect(() => {
        if (!pdpProduct) { setPdpSticky(false); return; }
        const onScroll = () => setPdpSticky(window.scrollY > 420);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
      }, [pdpProduct]);
      // GA4 local: page_view on route-ish changes
      useEffect(() => {
        try {
          if (typeof trackGa4Event === 'function') {
            trackGa4Event('page_view', {
              page_title: typeof document !== 'undefined' ? document.title : '',
              page_location: typeof window !== 'undefined' ? window.location.href : '',
            });
          }
        } catch (_) {}
      }, [staticPage, showPLP, pdpProduct, showCartPage, showCheckout, showAdminPanel, showSellerPanel]);

      // scroll-top-on-view-change — بالای صفحه هنگام تعویض نمای اصلی
      useEffect(() => {
        try {
          window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        } catch (_) {}
      }, [showPLP, pdpProduct, showCartPage, showCheckout, showWishlistPage, showComparePage, showRecentPage, showProfilePage, showSellerPanel, showAdminPanel, staticPage, activeSellerId, showSellersList, showTaxonomyHub, blogPostId]);



      // قفل اسکرول + Escape برای مودال‌های site-modal و دیالوگ‌ها
      useEffect(() => {
        const anyModal = !!(
          (typeof document !== 'undefined' && document.querySelector('.site-modal-root')) ||
          authOpen || adminAuthOpen || addressFormOpen || taxonomyFormOpen || siteDialog
        );
        // MutationObserver: sync body class با مودال‌های portal
        let obs;
        const sync = () => {
          const open = !!document.querySelector('.site-modal-root') || !!authOpen || !!adminAuthOpen || !!siteDialog;
          document.body.classList.toggle('site-modal-open', open);
        };
        sync();
        try {
          obs = new MutationObserver(sync);
          obs.observe(document.body, { childList: true, subtree: true });
        } catch (_) {}
        const submitSiteDialog = () => {
          if (!siteDialog) return;
          try {
            if (siteDialog.mode === 'confirm') {
              closeSiteDialog(true);
              return;
            }
            if (Array.isArray(siteDialog.fields) && siteDialog.fields.length) {
              const out = {};
              siteDialog.fields.forEach((f, fi) => {
                const el = document.getElementById(`site-dialog-field-${f.key || fi}`);
                out[f.key || `f${fi}`] = (el?.value || '').trim();
              });
              closeSiteDialog(out);
              return;
            }
            const el = document.getElementById('site-dialog-input');
            closeSiteDialog((el?.value || '').trim());
          } catch (_) {}
        };
        const onKey = (e) => {
          if (siteDialog && (e.key === 'Enter' || e.key === 'NumpadEnter')) {
            const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
            if (tag === 'textarea') return; // اجازه خط جدید در textarea
            e.preventDefault();
            e.stopPropagation();
            submitSiteDialog();
            return;
          }
          if (e.key !== 'Escape') return;
          if (siteDialog) { try { closeSiteDialog(siteDialog.mode === 'confirm' ? false : null); } catch (_) {} return; }
          if (authOpen) { try { closeAuth(); } catch (_) {} return; }
          if (adminAuthOpen) { try { closeAdminAuth(); } catch (_) {} return; }
          if (addressFormOpen) { try { setAddressFormOpen(false); } catch (_) {} return; }
          if (taxonomyFormOpen) { try { setTaxonomyFormOpen(false); } catch (_) {} return; }
          if (shippingMethodFormOpen) { try { setShippingMethodFormOpen(false); } catch (_) {} return; }
          if (cartOpen) { try { setCartOpen(false); } catch (_) {} return; }
          if (wishlistOpen) { try { setWishlistOpen(false); } catch (_) {} return; }
          if (compareOpen) { try { setCompareOpen(false); } catch (_) {} return; }
          if (recentOpen) { try { setRecentOpen(false); } catch (_) {} return; }
          if (notifPanelOpen) { try { setNotifPanelOpen(false); } catch (_) {} return; }
          if (mobileMenuOpen) { try { setMobileMenuOpen(false); } catch (_) {} return; }
        };
        document.addEventListener('keydown', onKey);
        return () => {
          document.removeEventListener('keydown', onKey);
          try { obs && obs.disconnect(); } catch (_) {}
          document.body.classList.remove('site-modal-open');
        };
      }, [authOpen, adminAuthOpen, addressFormOpen, taxonomyFormOpen, siteDialog, shippingMethodFormOpen, cartOpen, wishlistOpen, compareOpen, recentOpen, notifPanelOpen, mobileMenuOpen]);

      // فاز B: اعمال ریدایرکت‌های ادمین روی مسیر فعلی
      useEffect(() => {
        if (typeof window === 'undefined') return;
        const apply = () => {
          try {
            const path = window.location.pathname + window.location.search;
            const list = (() => { try { return JSON.parse(localStorage.getItem('seoRedirects') || '[]'); } catch { return []; } })();
            const hit = (list || []).find(r => r && r.from && (r.from === path || r.from === window.location.pathname));
            if (!hit) return;
            if (hit.type === '410') {
              setStaticPage('error-404');
              return;
            }
            const dest = hit.to || '/';
            if (dest.startsWith('http')) {
              window.location.replace(dest);
            } else {
              window.history.replaceState({}, '', dest);
              window.location.reload();
            }
          } catch (_) {}
        };
        apply();
        window.addEventListener('popstate', apply);
        return () => window.removeEventListener('popstate', apply);
      }, []);

      // فاز B: ثبت ۴۰۴
      useEffect(() => {
        if (staticPage === 'error-404') {
          try {
            const path = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/404';
            const entry = {
              id: '404-' + Date.now(),
              path,
              referrer: typeof document !== 'undefined' ? document.referrer : '',
              at: new Date().toISOString(),
              atFa: new Date().toLocaleString('fa-IR'),
            };
            const prev = (() => { try { return JSON.parse(localStorage.getItem('seo404Log') || '[]'); } catch { return []; } })();
            // جلوگیری از اسپم یک مسیر
            if (prev[0] && prev[0].path === path && (Date.now() - new Date(prev[0].at).getTime()) < 5000) return;
            const next = [entry, ...prev].slice(0, 200);
            setSeo404Log(next);
            try { localStorage.setItem('seo404Log', JSON.stringify(next)); } catch (_) {}
          } catch (_) {}
        }
      }, [staticPage]);

      useEffect(() => {
        if (!pdpProduct) return;
        const prev = document.title;
        const s = { ...defaultSeoConfig(), ...(adminSettings?.seo || {}) };
        const pageTitle = pdpProduct.seoTitle || pdpProduct.name;
        const tpl = s.siteTitleTemplate || '%s | پیراهن مردانه';
        document.title = tpl.includes('%s') ? tpl.replace('%s', pageTitle) : `${pageTitle} | ${s.siteTitle || 'پیراهن مردانه'}`;
        const meta = document.querySelector('meta[name="description"]');
        const prevMeta = meta?.getAttribute('content');
        const desc = pdpProduct.seoDescription || pdpProduct.desc || pdpProduct.description || pdpProduct.name;
        if (meta) meta.setAttribute('content', desc);
        return () => {
          document.title = prev;
          if (meta && prevMeta != null) meta.setAttribute('content', prevMeta);
        };
      }, [pdpProduct]);


      const appApiValue = {
        BarList,
        CarouselArrows,
        EmptyState,
        EmptyStateBox,
        ErrorState,
        Icon,
        allColors,
        allFabrics,
        allSellerNames,
        colorHexMap,
        sellerSortOptions,
        filteredSellersList,
        isSellerListFilterActive,
        sellerFilterCount,
        sellerNameSuggestions,
        citySuggestions,
        popularCities,
        BRANDS_LIST,
        COMPARE_MAX,
        DEFAULT_SITE_FAQS,
        DEFAULT_SELLER_FAQS,
        IRAN_CITIES,
        SELLERS,
        Hero,
        VirtualProductGrid,
        FAQMonochrome,
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
        showToast,
        sellerGifts,
        setSellerGifts,
        seoRedirectForm,
        setSeoRedirectForm,
        adminAnalyticsRange,
        setAdminAnalyticsRange,
        activeSellerId,
        activeSeller,
        sellerProductsSorted,
        sellerProductsBase,
        sellerProductsFiltered,
        sellerProductsRaw,
        sellerNewestProducts,
        sellerBestProducts,
        sellerSimilarProducts,
        sellerCategories,
        sellerHasDiscount,
        sellerReviews,
        sellerProfileRef,
        activeTip,
        features,
        brands,
        topSellers,
        blogs,
        reviews,
        stats,
        categories,
        allSizes,
        sampleReviews,
        sampleQuestions,
        sizeGuideTable,
        brandsTrackRef,
        sellersTrackRef,
        bestTrackRef,
        newTrackRef,
        amazingTrackRef,
        reviewTrackRef,
        recentTrackRef,
        blogsTrackRef,
        sellerBestTrackRef,
        sellerNewTrackRef,
        sellersListTrackRef,
        addBlogComment,
        addBrandMention,
        addToCart,
        addressDeleteConfirm,
        addressForm,
        addressFormOpen,
        addresses,
        adminAnalyticsSub,
        adminAuthError,
        adminAuthLoading,
        adminAuthOpen,
        adminAuthOtp,
        adminAuthPassword,
        adminAuthMethod,
        setAdminAuthPassword,
        setAdminAuthMethod,
        adminLoginWithPassword,
        adminVerifyMfa,
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
        analyzeOnPageSeo,
        applyCoupon,
        applyRealtimePayload,
        applySellerDescFormat,
        approveAdminProduct,
        createSellerShopOnServer,
        updateSellerShopOnServer,
        deleteSellerProductOnServer,
        requestSellerProductPurge,
        cancelSellerProductPurge,
        adminPatchOrderStatus,
        adminPatchSellerStatus,
        adminDeleteSeller,
        adminPurgeSeller,
        adminDeleteProduct,
        adminPurgeProduct,
        adminBulkArchiveProducts,
        adminBulkPurgeProducts,
        adminBulkArchiveSellers,
        adminBulkPurgeSellers,
        adminPatchProductStatus,
        hydrateAdminOrders,
        hydrateAdminTickets,
        hydrateSellerPayouts,
        patchOrderStatusOnServer,
        setAdminOrderStatus,
        hydrateAdminStatsFromApi,
        hydrateCatalogFromApi,
        hydrateCampaignsFromApi,
        persistCampaignOnServer,
        hydrateSellerOrdersFromApi,
        requestSellerPayout,
        hydrateAdminCoupons,
        hydrateBlogPostsFromApi,
        createAdminCouponOnServer,
        hydrateAdminSellers,
        hydrateAdminProducts,
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
        cardQtys,
        carouselIndex,
        cart,
        cartCount,
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
        closeAdminAuth,
        closeAdminPanel,
        closeAuth,
        closeCartPage,
        closeCheckout,
        closeComparePage,
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
        finishAuthSuccess,
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
        hasMounted,
        headerRevealedAfterHero,
        htmlToPlain,
        imgZoom,
        importExternalProductsCsv,
        installBuyerPwa,
        isBlogLiked,
        isDealActive,
        isProductFastShip,
        isSellerFastShipAllowed,
        isFavorite,
        lastAutoBackupAt,
        likedBlogs,
        liveToasts,
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
        nativeShare,
        newestTab,
        newsletterPhone,
        normKey,
        normalizeAttrMap,
        normalizeCategoryKey,
        normalizeSearch,
        notifPanelOpen,
        notifPulling,
        notifications,
        unreadNotifCount,
        oldPriceOpen,
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
        plpActiveChips,
        activePlpCategory,
        activePlpTag,
        plpFiltered,
        plpHasMore,
        plpEmptyHints,
        plpH1,
        plpPriceBounds,
        plpSentinelRef,
        plpSeoFooterHtml,
        plpSeoFooterIsHtml,
        plpVisibleProducts,
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
        portalMounted,
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
        readSessionUser,
        recentOpen,
        recentSearches,
        recentlyViewed,
        removeCoupon,
        removeFavoritesBulk,
        removeFromCart,
        removeRecentSearch,
        renderContentSeoBox,
        renderProductCard,
        renderShareBar,
        replaceCompareAt,
        restoreAdminProductsFromFile,
        restoreFullSiteBackup,
        restoreSellerProductsFromFile,
        runSeoHealthCheck,
        saveAddresses,
        saveAdminBlogCategories,
        saveAdminBlogTags,
        saveAdminBuyers,
        saveAdminCatalogAttributes,
        refreshCatalogAttributes,
        saveAdminCatalogBrands,
        refreshCatalogBrands,
        saveAdminCatalogColors,
        saveAdminCatalogSizes,
        refreshCatalogSizes,
        saveAdminCategories,
        refreshCatalogCategories,
        saveAdminCoupons,
        saveAdminFrontEdit,
        saveAdminOrders,
        saveAdminPageContentMap,
        saveAdminProducts,
        saveAdminSellers,
        saveAdminSettings,
        saveAdminShippingMethods,
        saveAdminTags,
        refreshCatalogTags,
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
        refreshSellerProducts,
        createSellerProductOnServer,
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
        sellerUser,
        sendAdminOtp,
        sendOtp,
        seo404Log,
        seoAiDaily,
        seoCfg,
        seoCharHint,
        seoPixelReport,
        seoRedirects,
        setActiveSellerId,
        setActiveTip,
        setAddressDeleteConfirm,
        setAddressForm,
        setAddressFormOpen,
        setAddresses,
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
        toggleDarkMode,
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
        setMobileMenuOpen,
        setPublicTrackOpen,
        publicTrackOpen,
        publicTrackCode,
        setPublicTrackCode,
        publicTrackResult,
        publicTrackLoading,
        publicTrackError,
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
        stockNotifyIds,
        stripHtmlSeo,
        stripLinksForDisplay,
        submitSearch,
        suggestInternalLinks,
        suggestSizeFromBody,
        syncFormVariants,
        taxonomyForm,
        taxonomyFormOpen,
        taxonomyTypeLabel,
        textContainsForbiddenLink,
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
        topSellersRanked,
        topSellersTab,
        trackGa4Event,
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
        setAuthRemember,
        authLoginMethod,
        setAuthLoginMethod,
        setAuthPassword,
        setAccountPassword,
        loginWithPassword,
        verifyMfa,
        resendMfa,
        wishlistClearConfirm,
        wishlistFilter,
        wishlistOpen,
        wishlistProducts,
        wishlistSelected,
        wishlistSort,
        wishlistView,
      };

      return (
        <AppApiProvider value={appApiValue}>
        <div className="min-h-screen flex flex-col">
          {(awaitingDeepProduct && !pdpProduct) ? (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#5C6065]" style={{ backgroundImage: 'url(/hero-poster.webp)', backgroundSize: 'cover', backgroundPosition: 'center' }} role="status" aria-live="polite">
              <div className="px-4 py-2 rounded-full bg-black/40 text-white/75 text-sm tracking-wide backdrop-blur-sm">
                {pageLoadingText || 'در حال بارگذاری محصول…'}
              </div>
            </div>
          ) : null}
          {/* ===================== MAIN HEADER (always) ===================== */}
          {/* Header */}
          <header
            ref={headerRef}
            data-home-hero-header="1"
            className={`transition-all duration-500 ease-out fixed top-0 left-0 right-0 z-[100] overflow-visible flex flex-col ${
              /* همه صفحات: هدر چسبان (fixed).
                 خانه قبل از پایان هیرو مخفی؛ بعد از هیرو (یا با باز بودن کشو) نمایان.
                 بقیه صفحات همیشه نمایان. */
              (!activeSellerId && !showSellersList && !showPLP && !showTaxonomyHub && !pdpProduct && !showCartPage && !showCheckout && !showWishlistPage && !showRecentPage && !showComparePage && !showProfilePage && !showSellerPanel && !showAdminPanel && !staticPage)
                ? (
                    (headerRevealedAfterHero || cartOpen || wishlistOpen || compareOpen || recentOpen || notifPanelOpen || mobileMenuOpen || catOpen)
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-full opacity-0 pointer-events-none'
                  )
                : 'translate-y-0 opacity-100'
            } ${scrolled || headerRevealedAfterHero || cartOpen || wishlistOpen || compareOpen || recentOpen || notifPanelOpen || mobileMenuOpen ? 'bg-white dark:bg-primary-900 shadow-md border-b border-primary-100/50 dark:border-primary-800/50' : 'bg-white dark:bg-primary-900 shadow-sm'}`}
          >
            {/* Top bar — موبایل: پایین (منو/جستجو/ورود) · دسکتاپ: بالا */}
            <div className="order-2 md:order-1 bg-primary-50 dark:bg-primary-900 text-primary-400 dark:text-white text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4 border-b border-primary-200 dark:border-white/30 transition-colors relative overflow-visible">
              <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
                {/* Burger (mobile) */}
                <div className="flex md:contents items-center gap-1.5 sm:gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => { setMobileMenuOpen(v => !v); setMegaOpen(null); }}
                    className="header-burger-btn md:hidden relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary-100 dark:hover:bg-primary-800 text-primary-600 dark:text-white"
                    aria-label="منو"
                  >
                    <Icon name={mobileMenuOpen ? "x" : "menu"} size={20} />
                    {!mobileMenuOpen && unreadNotifCount > 0 && (
                      <span className="absolute top-1 right-1 min-w-[8px] h-2 w-2 rounded-full bg-red-500" aria-hidden />
                    )}
                  </button>
                  </div>

                {/* Mobile search — between phone and login, with filters */}
                <div className="md:hidden flex-1 min-w-0 mx-1.5 relative z-[300] overflow-visible">
                  <div className="flex items-stretch bg-white dark:bg-primary-900 rounded-2xl border border-primary-200/80 dark:border-white/20 shadow-sm overflow-hidden h-[50px]">
                    <button
                      type="button"
                      data-filter-toggle="true"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCatOpen((v) => !v);
                      }}
                      className="flex items-center gap-0.5 flex-shrink-0 px-2 text-xs font-medium text-primary-800 dark:text-white border-l border-primary-200 dark:border-white"
                    >
                      <span className="max-w-[3.5rem] truncate">فیلتر</span>
                      <Icon name="chevronDown" size={14} className={`transition-transform dark:text-white ${catOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <div className="relative flex-1 min-w-0">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => { setSearchQuery(e.target.value); setSearchSuggestOpen(true); setSearchActiveIdx(-1); }}
                        onFocus={(e) => { setCatOpen(false); setSearchSuggestOpen(true); try { e.target.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (_) {} }}
                        onBlur={() => setTimeout(() => setSearchSuggestOpen(false), 280)}
                        placeholder={['پیراهن رسمی…', 'لینن…', 'آستین کوتاه…', 'سفید…', 'کروات…', 'جستجو…'][searchPhIdx]}
                        dir="rtl"
                        enterKeyHint="search"
                        autoComplete="off"
                        onKeyDown={e => {
                          if (e.key === 'Enter') { e.preventDefault(); submitSearch(); }
                          if (e.key === 'Escape') { setSearchSuggestOpen(false); e.target.blur(); }
                        }}
                        className={`w-full bg-transparent text-primary-900 dark:text-white py-3 pr-9 text-sm text-right focus:outline-none caret-primary-900 dark:caret-white placeholder:text-xs placeholder:text-primary-400 dark:placeholder:text-white/50 ${(searchQuery || searchColors.length > 0 || searchSizes.length > 0 || searchCategories.length > 0) ? 'pl-7' : 'pl-1.5'}`}
                      />
                      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 text-primary-400 pointer-events-none">
                        <Icon name="search" size={14} />
                      </div>
                      {(searchQuery || searchColors.length > 0 || searchSizes.length > 0 || searchCategories.length > 0) && (
                        <button
                          type="button"
                          onClick={clearAllSearchFilters}
                          className="absolute left-1 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-apple-blue text-white"
                          title="پاک کردن"
                        >
                          <Icon name="x" size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Search suggest — mobile */}
                  {searchSuggestOpen && !catOpen && (
                    <div className="absolute top-full right-0 left-0 mt-1.5 z-[500] w-full max-h-[min(70vh,28rem)] overflow-y-auto bg-white dark:!bg-black rounded-2xl shadow-2xl border border-primary-200 dark:border-white text-right isolate" role="listbox">
                      {!searchQuery.trim() && (recentSearches || []).length > 0 && (
                        <div className="px-3 pt-3 pb-2">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-primary-400">جستجوهای اخیر</span>
                            <button type="button" onClick={clearRecentSearches} className="text-xs text-primary-400 hover:text-red-500">پاک کردن</button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(recentSearches || []).map(q => (
                              <button key={q} type="button" onClick={() => submitSearch(q)} className="search-trend-chip text-xs px-2.5 py-1 rounded-full bg-primary-50 dark:bg-[#2A2C30] !text-primary-800 dark:!text-white border border-primary-200 dark:border-white/40 font-medium">{q}</button>
                            ))}
                          </div>
                        </div>
                      )}
                      {!searchQuery.trim() && (
                        <div className="px-3 pt-2 pb-3">
                          <span className="text-xs font-bold text-primary-600 dark:!text-white/90">پرتکرار</span>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {TREND_QUERIES.map(q => (
                              <button key={q} type="button" onClick={() => submitSearch(q)} className="search-trend-chip text-xs px-2.5 py-1 rounded-full border border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium hover:border-apple-blue">{q}</button>
                            ))}
                          </div>
                        </div>
                      )}
                      {searchQuery.trim() && searchCategorySuggestions.length > 0 && (
                        <div className="px-3 pt-3 pb-1">
                          <span className="text-xs font-bold text-primary-400">دسته‌بندی</span>
                          {searchCategorySuggestions.map(c => (
                            <button key={c} type="button" onClick={() => submitSearch(`پیراهن ${c}`)} className="w-full text-right px-2 py-2 text-sm text-primary-800 dark:text-white hover:bg-primary-50 dark:hover:bg-primary-800 rounded-lg flex items-center gap-2">
                              <Icon name="grid" size={14} /> پیراهن {c}
                            </button>
                          ))}
                        </div>
                      )}
                      {searchQuery.trim() && searchBrandSuggestions.length > 0 && (
                        <div className="px-3 pt-2 pb-1">
                          <span className="text-xs font-bold text-primary-400">فروشنده</span>
                          {searchBrandSuggestions.map(b => (
                            <button key={b} type="button" onClick={() => submitSearch(b)} className="w-full text-right px-2 py-2 text-sm text-primary-800 dark:text-white hover:bg-primary-50 dark:hover:bg-primary-800 rounded-lg">{b}</button>
                          ))}
                        </div>
                      )}
                      {searchQuery.trim() && (
                        <div className="px-1 pt-1 pb-1">
                          <div className="px-2 py-1 text-xs font-bold text-primary-400">محصولات {filteredProducts.length > 0 ? `(${toFa(filteredProducts.length)})` : ''}</div>
                          {filteredProducts.length === 0 ? (
                            <div className="px-3 py-5 text-center text-sm text-primary-500">
                              محصولی یافت نشد
                              {didYouMean && (
                                <button type="button" onClick={() => submitSearch(didYouMean)} className="block mx-auto mt-2 text-apple-blue text-xs">آیا منظورتان «{didYouMean}» بود؟</button>
                              )}
                              <button type="button" onClick={() => submitSearch(searchQuery)} className="block mx-auto mt-2 text-xs underline text-primary-600 dark:text-white/70">جستجوی همه نتایج</button>
                            </div>
                          ) : filteredProducts.slice(0, 6).map(p => {
                            const col = p.colors?.[selectedColors[p.id] ?? 0] || p.colors?.[0];
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => { setSearchSuggestOpen(false); pushRecentSearch(searchQuery); setSearchQuery(''); openPDP(p); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 bg-white dark:!bg-black hover:bg-primary-50 dark:hover:!bg-[#1A1C20] transition border-b border-primary-50 dark:border-white/15 last:border-0 text-right relative z-10"
                              >
                                <img src={col?.image || p.image} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" loading="lazy" decoding="async" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-primary-900 dark:text-white line-clamp-2">{p.name}</p>
                                  <p className="text-xs text-primary-500 dark:!text-white/70">{p.category} · {p.seller?.name || 'فروشگاه مرکزی'}</p>
                                  <p className="text-xs font-bold text-primary-700 dark:text-[#13ABC4] mt-0.5">{p.priceText} تومان{p.discount ? ` · ${toFa(p.discount)}٪` : ''}</p>
                                </div>
                              </button>
                            );
                          })}
                          {filteredProducts.length > 0 && (
                            <button type="button" onClick={() => submitSearch(searchQuery)} className="w-full py-2.5 text-xs font-bold text-apple-blue hover:bg-primary-50 dark:hover:bg-primary-800">
                              مشاهده همه نتایج ({toFa(filteredProducts.length)})
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Desktop mega-nav */}
                <nav className="hidden md:flex items-center gap-1 lg:gap-2 flex-1 justify-start min-w-0">
                  <a href="/" onClick={(e) => { e.preventDefault(); try { beginPageLoad('home'); } catch(_){} try { pushFaUrl(FA_PATHS.home || '/'); } catch(_){} try { applyPathRef.current(); } catch(_){} }} className="px-2.5 py-1 rounded-md text-primary-500 dark:text-white hover:text-primary-800 dark:hover:text-white hover:bg-primary-100/60 dark:hover:bg-primary-800/60 transition whitespace-nowrap text-xs lg:text-sm">خانه</a>

                  <div
                    className="relative"
                    onMouseEnter={() => { clearTimeout(megaTimeout.current); setMegaOpen('shop'); }}
                    onMouseLeave={() => { megaTimeout.current = setTimeout(() => setMegaOpen(null), 180); }}
                  >
                    <a href="/فروشگاه" onClick={(e) => { e.preventDefault(); openPLP(); }} className={`flex items-center gap-0.5 px-2 lg:px-2.5 py-1 rounded-md transition whitespace-nowrap text-xs lg:text-sm ${megaOpen === 'shop' || showPLP ? 'text-primary-800 dark:text-white bg-primary-100/60 dark:bg-primary-800/60' : 'text-primary-500 dark:text-white hover:text-primary-800 dark:hover:text-white hover:bg-primary-100/60 dark:hover:bg-primary-800/60'}`}>
                      فروشگاه
                      <Icon name="chevronDown" size={14} className={`transition-transform ${megaOpen === 'shop' ? 'rotate-180' : ''}`} />
                    </a>
                  </div>

                  <div
                    className="relative"
                    onMouseEnter={() => { clearTimeout(megaTimeout.current); setMegaOpen('cats'); }}
                    onMouseLeave={() => { megaTimeout.current = setTimeout(() => setMegaOpen(null), 180); }}
                  >
                    <button type="button" onClick={() => setMegaOpen(v => v === 'cats' ? null : 'cats')} className={`flex items-center gap-0.5 px-2 lg:px-2.5 py-1 rounded-md transition whitespace-nowrap text-xs lg:text-sm ${megaOpen === 'cats' ? 'text-primary-800 dark:text-white bg-primary-100/60 dark:bg-primary-800/60' : 'text-primary-500 dark:text-white hover:text-primary-800 dark:hover:text-white hover:bg-primary-100/60 dark:hover:bg-primary-800/60'}`}>
                      دسته‌بندی‌ها
                      <Icon name="chevronDown" size={14} className={`transition-transform ${megaOpen === 'cats' ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  <button type="button" onClick={openSellersList} className="px-2 lg:px-2.5 py-1 rounded-md text-primary-500 dark:text-white hover:text-primary-800 dark:hover:text-white hover:bg-primary-100/60 dark:hover:bg-primary-800/60 transition whitespace-nowrap text-xs lg:text-sm">فروشندگان</button>
                  <button type="button" onClick={openCartPage} className={`px-2 lg:px-2.5 py-1 rounded-md transition whitespace-nowrap text-xs lg:text-sm ${showCartPage ? 'text-primary-800 dark:text-white bg-primary-100/60 dark:bg-primary-800/60' : 'text-primary-500 dark:text-white hover:text-primary-800 dark:hover:text-white hover:bg-primary-100/60 dark:hover:bg-primary-800/60'}`}>سبد خرید{hasMounted && cartCount > 0 ? ` (${toFa(cartCount)})` : ''}</button>
                  <button type="button" onClick={openWishlistPage} className={`px-2 lg:px-2.5 py-1 rounded-md transition whitespace-nowrap text-xs lg:text-sm ${showWishlistPage ? 'text-primary-800 dark:text-white bg-primary-100/60 dark:bg-primary-800/60' : 'text-primary-500 dark:text-white hover:text-primary-800 dark:hover:text-white hover:bg-primary-100/60 dark:hover:bg-primary-800/60'}`}>علاقه‌مندی‌ها{hasMounted && favorites.length > 0 ? ` (${toFa(favorites.length)})` : ''}</button>
                  <button type="button" onClick={openComparePage} className={`px-2 lg:px-2.5 py-1 rounded-md transition whitespace-nowrap text-xs lg:text-sm ${showComparePage ? 'text-primary-800 dark:text-white bg-primary-100/60 dark:bg-primary-800/60' : 'text-primary-500 dark:text-white hover:text-primary-800 dark:hover:text-white hover:bg-primary-100/60 dark:hover:bg-primary-800/60'}`}>مقایسه{hasMounted && compare.length > 0 ? ` (${toFa(compare.length)})` : ''}</button>
                  <button type="button" onClick={() => openStaticPage('about')} className="hidden lg:inline-flex px-2 lg:px-2.5 py-1 rounded-md text-primary-500 dark:text-white hover:text-primary-800 dark:hover:text-white hover:bg-primary-100/60 dark:hover:bg-primary-800/60 transition whitespace-nowrap text-xs lg:text-sm">درباره ما</button>
                  <button type="button" onClick={() => openStaticPage('contact')} className="px-2 lg:px-2.5 py-1 rounded-md text-primary-500 dark:text-white hover:text-primary-800 dark:hover:text-white hover:bg-primary-100/60 dark:hover:bg-primary-800/60 transition whitespace-nowrap text-xs lg:text-sm">تماس با ما</button>
                  <button type="button" onClick={() => openStaticPage('deals')} className="hidden md:inline-flex px-2 lg:px-2.5 py-1 rounded-md text-primary-500 dark:text-white hover:text-primary-800 dark:hover:text-white hover:bg-primary-100/60 dark:hover:bg-primary-800/60 transition whitespace-nowrap text-xs lg:text-sm">شگفت‌انگیز</button>
                  <button type="button" onClick={() => openStaticPage('brands')} className="hidden md:inline-flex px-2 lg:px-2.5 py-1 rounded-md text-primary-500 dark:text-white hover:text-primary-800 dark:hover:text-white hover:bg-primary-100/60 dark:hover:bg-primary-800/60 transition whitespace-nowrap text-xs lg:text-sm">برندها</button>
                </nav>

                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  {user ? (
                    <button
                      type="button"
                      onClick={() => openProfilePage()}
                      className="hover:text-primary-600 dark:hover:text-white flex items-center gap-1 text-primary-400 dark:text-white"
                    >
                      <Icon name="user" size={14} />
                      <span className="hidden sm:inline">{user.firstName || 'حساب من'}</span>
                      <span className="sm:hidden">{user.firstName || 'حساب'}</span>
                    </button>
                  ) : (
                                      <div className="flex items-center gap-1.5 sm:gap-2.5">
                    {sellerUser ? (
                      <button
                        type="button"
                        onClick={() => openSellerPanel()}
                        className="hover:text-primary-600 dark:hover:text-white flex items-center gap-1 text-primary-700 dark:text-white whitespace-nowrap shrink-0 font-medium"
                        title="پنل فروشنده"
                      >
                        <Icon name="user" size={14} />
                        <span className="text-xs lg:text-sm max-w-[9rem] truncate">
                          {sellerUser.shopName || sellerUser.name || sellerUser.ownerName || sellerUser.phone || 'فروشنده'}
                        </span>
                      </button>
                    ) : user ? (
                      <button
                        type="button"
                        onClick={() => { try { openProfilePage('dashboard'); } catch (_) {} }}
                        className="hover:text-primary-600 dark:hover:text-white flex items-center gap-1 text-primary-700 dark:text-white whitespace-nowrap shrink-0 font-medium"
                        title="حساب کاربری"
                      >
                        <Icon name="user" size={14} />
                        <span className="text-xs lg:text-sm max-w-[9rem] truncate">
                          {user.firstName || user.name || user.phone || 'حساب من'}
                        </span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setRoleGateOpen(true)}
                        className="hover:text-primary-600 dark:hover:text-white flex items-center gap-1 text-primary-400 dark:text-white whitespace-nowrap shrink-0"
                        title="ورود / ثبت‌نام"
                      >
                        <Icon name="user" size={14} />
                        <span className="hidden sm:inline text-xs lg:text-sm">ورود / ثبت‌نام</span>
                        <span className="sm:hidden text-xs">ورود</span>
                      </button>
                    )}
                  </div>
                  )}
                </div>
              </div>

              {/* Desktop Mega Menu Panel */}
              {megaOpen && (
                <div
                  className="hidden md:block absolute left-0 right-0 top-full z-[250]"
                  onMouseEnter={() => { clearTimeout(megaTimeout.current); }}
                  onMouseLeave={() => { megaTimeout.current = setTimeout(() => setMegaOpen(null), 150); }}
                >
                  <div className="mega-menu-panel bg-white dark:bg-[#1A1C20] border-b border-primary-200 dark:border-white/25 shadow-2xl">
                    <div className="max-w-7xl mx-auto px-4 py-6 relative">
                      <button
                        type="button"
                        onClick={() => setMegaOpen(null)}
                        className="absolute left-4 top-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-800 text-primary-700 dark:!text-white hover:bg-primary-200 dark:hover:bg-primary-700 border border-primary-200 dark:border-white shadow-sm"
                        aria-label="بستن منو"
                        title="بستن"
                      >
                        <Icon name="x" size={18} />
                      </button>
                      {megaOpen === 'shop' && (
                        <div className="grid grid-cols-12 gap-6">
                          <div className="col-span-3 border-l border-primary-200 dark:border-white/30 pl-5">
                            <h4 className="text-xs font-bold text-primary-400 dark:text-white mb-3 tracking-wide">دسته‌بندی‌ها</h4>
                            <ul className="space-y-1">
                              {categories.map((cat) => (
                                <li key={cat.name}>
                                  <button type="button" onClick={() => openPLP({ cat: cat.name })} className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-[#1A1A1A] dark:!text-white hover:bg-primary-50 dark:hover:bg-primary-900 transition group text-right">
                                    <span className="shop-menu-cat-icon w-8 h-8 rounded-full bg-primary-200 dark:bg-primary-900 flex items-center justify-center text-[#1A1A1A] dark:!text-white group-hover:bg-primary-800 group-hover:text-white dark:group-hover:bg-[#13ABC4]/20 dark:group-hover:!text-[#7EFAFF] transition flex-shrink-0">
                                      <Icon name={cat.icon} size={16} className="text-current" />
                                    </span>
                                    <span className="whitespace-nowrap text-[#1A1A1A] dark:!text-white dark:group-hover:!text-[#7EFAFF]">{cat.name}</span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="col-span-6">
                            <h4 className="text-xs font-bold text-primary-400 dark:text-white mb-3 tracking-wide">پرفروش‌ترین‌ها</h4>
                            <div className="grid grid-cols-3 gap-3">
                              {products.slice(0, 3).map((p) => {
                                const col = (p.colors && p.colors[0]) || { name: '', image: p.image || p.cover_image || '/logo.webp' };
                                return (
                                  <button key={p.id} type="button" onClick={() => setMegaOpen(null)} className="group rounded-xl border border-primary-200 dark:border-white/30 overflow-hidden hover:shadow-md transition bg-white dark:bg-primary-900 text-right">
                                    <div className="aspect-[4/5] overflow-hidden bg-primary-50 dark:bg-primary-950">
                                      <img src={col.image} alt={p.name} className="w-full h-full object-cover group-hover:opacity-95 transition duration-500" loading="lazy" decoding="async" />
                                    </div>
                                    <div className="p-2.5">
                                      <p className="text-xs font-medium text-primary-900 dark:text-white line-clamp-2" title={p.name}>{p.name}</p>
                                      <p className="text-xs font-bold text-primary-700 dark:text-white mt-1">{p.priceText} <span className="font-normal text-primary-400 dark:text-white">تومان</span></p>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          <div className="col-span-3">
                            <button type="button" onClick={() => setMegaOpen(null)} className="block w-full h-full min-h-[220px] rounded-2xl overflow-hidden relative group text-right">
                              <img src="/logo.webp" alt="پیشنهاد ویژه" className="absolute inset-0 w-full h-full object-cover group-hover:opacity-95 transition duration-700" loading="lazy" decoding="async" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                              <div className="absolute bottom-0 inset-x-0 p-4 text-white">
                                <span className="inline-block text-xs bg-apple-blue px-2 py-0.5 rounded-full mb-2">تا ۲۹٪ تخفیف</span>
                                <p className="font-bold text-sm leading-snug">پیشنهادات شگفت‌انگیز پیراهن رسمی</p>
                                <span className="inline-flex items-center gap-1 text-xs mt-2 text-white/90">مشاهده همه <Icon name="chevronLeft" size={14} /></span>
                              </div>
                            </button>
                          </div>
                        </div>
                      )}

                      {megaOpen === 'cats' && (
                        <div className="grid grid-cols-12 gap-6">
                          <div className="col-span-8">
                            <h4 className="text-xs font-bold text-primary-400 dark:!text-white mb-4 tracking-wide">همه دسته‌بندی‌ها</h4>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                              {categories.map((cat) => (
                                <button
                                  key={cat.name}
                                  type="button"
                                  onClick={() => setMegaOpen(null)}
                                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-primary-200 dark:border-white/30 bg-primary-50/50 dark:bg-primary-900/50 hover:bg-white dark:hover:bg-primary-900 hover:shadow-md transition group"
                                >
                                  <span className="w-12 h-12 rounded-full border-2 border-transparent dark:border-white/50 flex items-center justify-center text-[#252525] dark:!text-white bg-primary-100 dark:bg-primary-900 group-hover:border-primary-800 group-hover:bg-primary-800 group-hover:text-white dark:group-hover:border-[#13ABC4] dark:group-hover:bg-primary-900 dark:group-hover:!text-[#7EFAFF] transition">
                                    <Icon name={cat.icon} size={22} />
                                  </span>
                                  <span className="text-xs font-medium text-[#252525] dark:!text-white text-center whitespace-nowrap group-hover:text-primary-800 dark:group-hover:!text-[#7EFAFF]">{cat.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="col-span-4 flex flex-col gap-3">
                            <h4 className="text-xs font-bold text-primary-400 dark:!text-white tracking-wide">دسترسی سریع</h4>
                            {[
                              { label: 'پرفروش‌ترین محصولات', go: () => openPLP({ sort: 'popular' }) },
                              { label: 'پیشنهادات شگفت‌انگیز', go: () => openStaticPage('deals') },
                              { label: 'اخیراً دیده‌شده', go: () => openRecentPage() },
                            ].map((item) => (
                              <button key={item.label} type="button" onClick={() => { setMegaOpen(null); item.go(); }} className="flex items-center justify-between px-4 py-3 rounded-xl bg-primary-50 dark:bg-primary-900 text-sm text-primary-800 dark:text-white hover:bg-primary-100 dark:hover:bg-primary-800 dark:hover:text-[#7EFAFF] dark:hover:text-[#7EFAFF] transition text-right">
                                {item.label}
                                <Icon name="chevronLeft" size={14} />
                              </button>
                            ))}
                            <div className="mt-auto rounded-xl bg-gradient-to-br from-primary-800 to-primary-950 dark:from-primary-800 dark:to-primary-900 text-white p-4">
                              <p className="text-xs opacity-80 mb-1">ارسال سریع</p>
                              <p className="text-sm font-bold leading-snug">برای خریدهای بالای ۱۰ میلیون تومان</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="order-1 md:order-2 max-w-7xl mx-auto px-3 sm:px-4 py-1.5 sm:py-2.5 w-full">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-row w-full">
                {/* Logo — right side in RTL */}
                <a href="#" onClick={(e) => { e.preventDefault(); setActiveSellerId(null); setShowSellersList(false); setShowPLP(false); setShowCartPage(false); setShowWishlistPage(false); setShowComparePage(false); setShowProfilePage(false); setShowSellerPanel(false); setShowAdminPanel(false); setMobileMenuOpen(false); scrollPageToTop(); }} className="flex items-center flex-shrink-0 order-1" aria-label="پیراهن مردانه — خانه">
                  <img src={dark ? "/blue_t_bg.webp" : "/red_t_bg.webp"} alt="پیراهن مردانه" className="site-logo-img h-8 sm:h-10 md:h-11 w-auto max-w-[148px] sm:max-w-[180px] md:max-w-[200px] object-contain object-right" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/blue_t_bg.webp'; }} />
                </a>

                {/* Search box with category tab — desktop */}
                <div className="hidden md:block flex-1 min-w-0 relative order-2 z-20">
                  <div className="flex items-stretch bg-primary-50 dark:bg-primary-900 rounded-full overflow-hidden border border-transparent dark:border-white focus-within:ring-2 focus-within:ring-primary-300 dark:focus-within:ring-white/30 transition">
                    {/* Category tab */}
                    <button
                      type="button"
                      data-filter-toggle="true"
                      onClick={() => setCatOpen(v => !v)}
                      className="flex items-center gap-1 flex-shrink-0 px-2.5 sm:px-3.5 text-xs sm:text-xs font-medium text-primary-800 dark:text-white border-l border-primary-200 dark:border-white hover:bg-primary-100 dark:hover:bg-primary-800 transition whitespace-nowrap"
                    >
                      <span className="max-w-[4.5rem] sm:max-w-none truncate">فیلتر</span>
                      <Icon name="chevronDown" size={14} className={`transition-transform dark:text-white ${catOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {/* Input */}
                    <div className="relative flex-1 min-w-0">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => { setSearchQuery(e.target.value); setSearchSuggestOpen(true); }}
                        onFocus={(e) => { setCatOpen(false); setSearchSuggestOpen(true); try { e.target.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (_) {} }}
                        onBlur={() => setTimeout(() => setSearchSuggestOpen(false), 280)}
                        placeholder={['پیراهن رسمی…', 'لینن…', 'آستین کوتاه…', 'سفید…', 'کروات…', 'جستجو محصول…'][searchPhIdx]}
                        dir="rtl"
                        autoComplete="off"
                        onKeyDown={e => {
                          if (e.key === 'Enter') { e.preventDefault(); submitSearch(); }
                          if (e.key === 'Escape') setSearchSuggestOpen(false);
                        }}
                        className="w-full bg-transparent text-primary-900 dark:text-white caret-primary-900 dark:caret-white py-2 sm:py-2.5 pr-9 pl-28 text-sm focus:outline-none placeholder:text-sm placeholder:text-primary-400 dark:placeholder:text-white/50"
                      />
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-primary-400 pointer-events-none">
                        <Icon name="search" size={16} />
                      </div>
                      <div className="absolute left-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
                        {(searchQuery || searchColors.length > 0 || searchSizes.length > 0 || searchCategories.length > 0) && (
                          <button
                            type="button"
                            onClick={clearAllSearchFilters}
                            className="w-6 h-6 flex items-center justify-center rounded-full bg-apple-blue text-white hover:opacity-90 shadow-sm flex-shrink-0"
                            title="پاک کردن"
                          >
                            <Icon name="x" size={14} />
                          </button>
                        )}
                        {catOpen && (
                          <button
                            type="button"
                            onClick={() => {
                              setCatOpen(false);
                              setSearchSuggestOpen(false);
                              const cats = Array.isArray(searchCategories) ? searchCategories.filter(Boolean) : [];
                              const colors = Array.isArray(searchColors) ? searchColors.filter(Boolean) : [];
                              const sizes = Array.isArray(searchSizes) ? searchSizes.filter(Boolean) : [];
                              const q = (typeof searchQuery === 'string' ? searchQuery : '').trim();
                              openPLP({
                                query: q || '',
                                cats,
                                colors,
                                sizes,
                                keepSort: true,
                              });
                            }}
                            className="h-7 px-2.5 rounded-full bg-[#FF0000] dark:bg-[#13ABC4] text-white text-[11px] font-medium whitespace-nowrap hover:opacity-90 active:scale-[0.98] transition flex-shrink-0 shadow-sm"
                            title="اعمال فیلتر"
                          >
                            اعمال فیلتر
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Search suggest — desktop */}
                  {searchSuggestOpen && !catOpen && (
                    <div className="absolute top-full right-0 left-0 mt-1.5 z-[200] bg-white dark:!bg-[#111] rounded-[11px] shadow-[0_12px_26px_rgba(0,0,0,0.10)] border border-[#E5E5E5] dark:border-white/15 overflow-hidden max-h-[70vh] overflow-y-auto text-right isolate z-[500]" role="listbox">
                      {!searchQuery.trim() && (recentSearches || []).length > 0 && (
                        <div className="px-3 pt-3 pb-2">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-primary-400">جستجوهای اخیر</span>
                            <button type="button" onClick={clearRecentSearches} className="text-xs text-primary-400 hover:text-red-500">پاک کردن</button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(recentSearches || []).map(q => (
                              <button key={q} type="button" onClick={() => submitSearch(q)} className="search-trend-chip text-xs px-2.5 py-1 rounded-full bg-primary-50 dark:bg-[#2A2C30] !text-primary-800 dark:!text-white border border-primary-200 dark:border-white/40 font-medium">{q}</button>
                            ))}
                          </div>
                        </div>
                      )}
                      {!searchQuery.trim() && (
                        <div className="px-3 pt-2 pb-3">
                          <span className="text-xs font-bold text-primary-600 dark:!text-white/90">پرتکرار</span>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {TREND_QUERIES.map(q => (
                              <button key={q} type="button" onClick={() => submitSearch(q)} className="search-trend-chip text-xs px-2.5 py-1 rounded-full border border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium hover:border-apple-blue">{q}</button>
                            ))}
                          </div>
                        </div>
                      )}
                      {searchQuery.trim() && searchCategorySuggestions.length > 0 && (
                        <div className="px-3 pt-3 pb-1">
                          <span className="text-xs font-bold text-primary-400">دسته‌بندی</span>
                          {searchCategorySuggestions.map(c => (
                            <button key={c} type="button" onClick={() => submitSearch(`پیراهن ${c}`)} className="w-full text-right px-2 py-2 text-sm text-primary-800 dark:text-white hover:bg-primary-50 dark:hover:bg-primary-800 rounded-lg flex items-center gap-2">
                              <Icon name="grid" size={14} /> پیراهن {c}
                            </button>
                          ))}
                        </div>
                      )}
                      {searchQuery.trim() && searchBrandSuggestions.length > 0 && (
                        <div className="px-3 pt-2 pb-1">
                          <span className="text-xs font-bold text-primary-400">فروشنده</span>
                          {searchBrandSuggestions.map(b => (
                            <button key={b} type="button" onClick={() => submitSearch(b)} className="w-full text-right px-2 py-2 text-sm text-primary-800 dark:text-white hover:bg-primary-50 dark:hover:bg-primary-800 rounded-lg">{b}</button>
                          ))}
                        </div>
                      )}
                      {searchQuery.trim() && (
                        <div className="px-1 pt-1 pb-1">
                          <div className="px-2 py-1 text-xs font-bold text-primary-400">محصولات {filteredProducts.length > 0 ? `(${toFa(filteredProducts.length)})` : ''}</div>
                          {filteredProducts.length === 0 ? (
                            <div className="px-3 py-5 text-center text-sm text-primary-500">
                              محصولی یافت نشد
                              {didYouMean && (
                                <button type="button" onClick={() => submitSearch(didYouMean)} className="block mx-auto mt-2 text-apple-blue text-xs">آیا منظورتان «{didYouMean}» بود؟</button>
                              )}
                              <button type="button" onClick={() => submitSearch(searchQuery)} className="block mx-auto mt-2 text-xs underline text-primary-600 dark:text-white/70">جستجوی همه نتایج</button>
                            </div>
                          ) : filteredProducts.slice(0, 6).map(p => {
                            const col = p.colors?.[selectedColors[p.id] ?? 0] || p.colors?.[0];
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => { setSearchSuggestOpen(false); pushRecentSearch(searchQuery); setSearchQuery(''); openPDP(p); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 bg-white dark:!bg-black hover:bg-primary-50 dark:hover:!bg-[#1A1C20] transition border-b border-primary-50 dark:border-white/15 last:border-0 text-right relative z-10"
                              >
                                <img src={col?.image || p.image} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" loading="lazy" decoding="async" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-primary-900 dark:text-white line-clamp-2">{p.name}</p>
                                  <p className="text-xs text-primary-500 dark:!text-white/70">{p.category} · {p.seller?.name || 'فروشگاه مرکزی'}</p>
                                  <p className="text-xs font-bold text-primary-700 dark:text-[#13ABC4] mt-0.5">{p.priceText} تومان{p.discount ? ` · ${toFa(p.discount)}٪` : ''}</p>
                                </div>
                              </button>
                            );
                          })}
                          {filteredProducts.length > 0 && (
                            <button type="button" onClick={() => submitSearch(searchQuery)} className="w-full py-2.5 text-xs font-bold text-apple-blue hover:bg-primary-50 dark:hover:bg-primary-800">
                              مشاهده همه نتایج ({toFa(filteredProducts.length)})
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Category / Color / Size dropdown — desktop only */}
                  {catOpen && (
                    <div
                      data-filter-panel="true"
                      className="hidden md:block absolute top-full right-0 left-0 mt-1.5 z-[120] bg-white dark:bg-[#1A1C20] rounded-xl shadow-xl border border-primary-200 dark:border-white/40 py-2 overflow-hidden max-h-[min(31vh,320px)] overflow-y-auto w-full"
                    >
                      <div className="px-3 py-1.5 text-xs font-bold text-primary-400 dark:text-primary-500 tracking-wide">دسته‌بندی</div>
                      <div className="flex flex-wrap gap-1.5 px-3 pb-2">
                        {['رسمی', 'کروات', 'آستین کوتاه'].map(c => {
                          const on = searchCategories.includes(c);
                          return (
                            <button
                              key={c}
                              type="button"
                              onClick={() => toggleSearchCategory(c)}
                              className={`px-2.5 py-1 rounded-full text-xs border transition ${on ? 'search-filter-chip--on px-2.5 py-1.5 rounded-full text-xs font-bold border-2 border-[#FF0000] bg-[#FF0000] dark:border-[#13ABC4] dark:bg-[#13ABC4] !text-white shadow-sm' : 'px-2.5 py-1.5 rounded-full text-xs font-medium border plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium'}`}
                            >
                              {c}
                            </button>
                          );
                        })}
                      </div>
                      <div className="border-t border-primary-200 dark:border-white/30 my-1.5" />
                      <div className="px-3 py-1.5 text-xs font-bold text-primary-400 dark:text-primary-500 tracking-wide">رنگ</div>
                      <div className="flex flex-wrap gap-1.5 px-3 pb-2">
                        {allColors.map(c => {
                          const on = searchColors.includes(c);
                          return (
                            <button
                              key={c}
                              type="button"
                              onClick={() => toggleSearchColor(c)}
                              className={`px-2.5 py-1 rounded-full text-xs border transition ${on ? 'search-filter-chip--on px-2.5 py-1.5 rounded-full text-xs font-bold border-2 border-[#FF0000] bg-[#FF0000] dark:border-[#13ABC4] dark:bg-[#13ABC4] !text-white shadow-sm' : 'px-2.5 py-1.5 rounded-full text-xs font-medium border plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium'}`}
                            >
                              {c}
                            </button>
                          );
                        })}
                      </div>
                      <div className="border-t border-primary-200 dark:border-white/30 my-1.5" />
                      <div className="px-3 py-1.5 text-xs font-bold text-primary-400 dark:text-primary-500 tracking-wide">سایز</div>
                      <div className="flex flex-wrap gap-1.5 px-3 pb-2">
                        {allSizes.map(s => {
                          const on = searchSizes.includes(s);
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => toggleSearchSize(s)}
                              dir="ltr" lang="en"
                              className={`latin-label px-2.5 py-1 rounded-full text-xs border transition ${on ? 'search-filter-chip--on px-2.5 py-1.5 rounded-full text-xs font-bold border-2 border-[#FF0000] bg-[#FF0000] dark:border-[#13ABC4] dark:bg-[#13ABC4] !text-white shadow-sm' : 'px-2.5 py-1.5 rounded-full text-xs font-medium border plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium'}`}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>

                    </div>
                  )}

                  {/* Search results dropdown */}
                  {searchQuery.trim() && !catOpen && (
                    <div className="absolute top-full right-0 left-0 mt-1.5 z-50 bg-white dark:bg-black rounded-xl shadow-xl border border-primary-200 dark:border-white/50 overflow-hidden max-h-80 overflow-y-auto">
                      {filteredProducts.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-primary-500 dark:text-primary-400">
                          محصولی یافت نشد
                          <button onClick={() => setSearchQuery('')} className="block mx-auto mt-2 text-primary-700 dark:text-[#13ABC4] underline text-xs">پاک کردن</button>
                        </div>
                      ) : filteredProducts.map(p => {
                        const cIdx = selectedColors[p.id] ?? 0;
                        const col = (p.colors && p.colors[cIdx]) || (p.colors && p.colors[0]) || { name: '', image: p.image || p.cover_image || '/logo.webp' };
                        const seller = p.seller || OWN_SELLER;
                        return (
                          <a
                            key={p.id}
                            href="#" onClick={(e) => { e.preventDefault(); setSearchQuery(''); openPLP(); }}
                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-primary-50 dark:hover:bg-primary-800 transition border-b border-primary-50 dark:border-primary-800 last:border-0"
                          >
                            <img src={col.image} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" loading="lazy" decoding="async" />
                            <div className="min-w-0 flex-1 text-right">
                              <p className="text-sm font-medium text-primary-900 dark:text-white line-clamp-2" title={p.name}>{p.name}</p>
                              <p className="text-xs text-primary-700 dark:text-white">{p.category}</p>
                              <p className="text-xs text-primary-700 dark:text-white">فروشنده: {(seller?.name && seller.name !== "undefined") ? seller.name : (seller?.shop_name || "فروشگاه")}</p>
                              <p className="text-xs font-bold text-primary-700 dark:text-[#13ABC4] mt-0.5">{p.priceText} تومان</p>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Action icons — left side in RTL — عمل سریع: ستون کناری باز می‌شود (نه صفحه کامل) */}
                <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0 order-3 ms-auto">
                  <div className="header-secondary-slot relative flex-shrink-0 hidden md:block">
                    <button type="button" onClick={() => { setNotifPanelOpen(v => !v); setCartOpen(false); setWishlistOpen(false); setCompareOpen(false); setRecentOpen(false); }} className="header-icon-btn w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full relative text-primary-800 hover:bg-primary-50 dark:bg-[#2A2C30] dark:text-white dark:border dark:border-white/25 dark:hover:bg-[#1A1C20] dark:hover:text-white" title="اعلان‌ها">
                      <Icon name="bell" size={18} />
                      {unreadNotifCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">{toFa(unreadNotifCount > 9 ? '9+' : unreadNotifCount)}</span>
                      )}
                    </button>
                  </div>
                  <button type="button" onClick={toggleDarkMode} className="header-icon-btn hidden md:flex w-8 h-8 sm:w-10 sm:h-10 items-center justify-center rounded-full flex-shrink-0 text-primary-800 hover:bg-primary-50 dark:bg-[#2A2C30] dark:text-white dark:border dark:border-white/25 dark:hover:bg-[#1A1C20] dark:hover:text-white" title="حالت تاریک">
                    <Icon name={dark ? "sun" : "moon"} size={18} />
                  </button>
                  <button type="button" onClick={() => { setCartOpen(false); setCompareOpen(false); setRecentOpen(false); setWishlistOpen(true); }} className="header-icon-btn hidden md:flex w-8 h-8 sm:w-10 sm:h-10 items-center justify-center rounded-full relative flex-shrink-0 text-primary-800 hover:bg-primary-50 dark:bg-[#2A2C30] dark:text-white dark:border dark:border-white/25 dark:hover:bg-[#1A1C20] dark:hover:text-white" title="علاقه‌مندی‌ها">
                    <Icon name={favorites.length ? 'heartFilled' : 'heart'} size={18} />
                    {hasMounted && favorites.length > 0 && (
                      <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 bg-apple-blue text-white text-xs w-3.5 h-3.5 rounded-full flex items-center justify-center leading-none">{toFa(favorites.length)}</span>
                    )}
                  </button>
                  <button type="button" onClick={() => { setCartOpen(false); setCompareOpen(false); setWishlistOpen(false); setRecentOpen(true); }} className="header-icon-btn hidden md:flex w-8 h-8 sm:w-10 sm:h-10 items-center justify-center rounded-full relative flex-shrink-0 text-primary-800 hover:bg-primary-50 dark:bg-[#2A2C30] dark:text-white dark:border dark:border-white/25 dark:hover:bg-[#1A1C20] dark:hover:text-white" title="اخیراً دیده‌شده">
                    <Icon name="eye" size={18} />
                    {recentlyViewed.length > 0 && (
                      <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 bg-apple-blue text-white text-xs w-3.5 h-3.5 rounded-full flex items-center justify-center leading-none">{toFa(Math.min(recentlyViewed.length, 9))}</span>
                    )}
                  </button>
                  <button type="button" onClick={() => { setCartOpen(false); setWishlistOpen(false); setRecentOpen(false); setCompareOpen(true); }} className="header-icon-btn hidden md:flex w-8 h-8 sm:w-10 sm:h-10 items-center justify-center rounded-full relative flex-shrink-0 text-primary-800 hover:bg-primary-50 dark:bg-[#2A2C30] dark:text-white dark:border dark:border-white/25 dark:hover:bg-[#1A1C20] dark:hover:text-white" title="مقایسه">
                    <Icon name="scale" size={18} />
                    {hasMounted && compare.length > 0 && (
                      <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 bg-apple-blue text-white text-xs w-3.5 h-3.5 rounded-full flex items-center justify-center leading-none">{toFa(compare.length)}</span>
                    )}
                  </button>
                  <button type="button" onClick={() => { setWishlistOpen(false); setCompareOpen(false); setRecentOpen(false); setCartOpen(true); }} title="سبد خرید" className="header-icon-btn w-10 h-10 sm:w-10 sm:h-10 flex items-center justify-center rounded-full relative flex-shrink-0 text-primary-800 hover:bg-primary-50 dark:bg-[#2A2C30] dark:text-white dark:border dark:border-white/25 dark:hover:bg-[#1A1C20] dark:hover:text-white">
                    <Icon name="shoppingBag" size={18} />
                    {hasMounted && cartCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 bg-apple-blue text-white text-xs w-3.5 h-3.5 rounded-full flex items-center justify-center leading-none">{String(cartCount).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])}</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </header>
          {/* فاصله زیر هدر fixed — ارتفاع با JS؛ در خانهٔ قبل از reveal = 0 */}
          <div className="site-header-spacer flex-shrink-0" aria-hidden="true" />


          
          {/* Breadcrumbs — فقط صفحات داخلی؛ در صفحه خانه هرگز نمایش داده نشود */}
          {!pdpProduct && (() => {
            const isHome = !showPLP && !activeSellerId && !showSellersList && !showCartPage && !showCheckout
              && !showComparePage && !showWishlistPage && !showRecentPage && !showProfilePage
              && !showSellerPanel && !showAdminPanel && !showTaxonomyHub && !staticPage;
            if (isHome) return null;
            const crumbItems = [
              ...(showPLP && !activeSeller && !activePlpTag ? [
                { label: 'فروشگاه', href: '/فروشگاه', onClick: () => openPLP() },
                { label: plpCats.length === 1 ? plpH1 : 'همه محصولات', current: true },
              ] : []),
              ...(showPLP && !activeSeller && activePlpTag ? [
                { label: 'فروشگاه', href: '/فروشگاه', onClick: () => openPLP() },
                { label: activePlpTag.name || activePlpTag.label || 'برچسب', current: true },
              ] : []),
              ...(showPLP && activeSeller ? [
                { label: 'فروشندگان', onClick: () => { setShowSellersList(true); setActiveSellerId(null); } },
                { label: activeSeller.name, current: true },
              ] : []),
              ...(showSellersList && !activeSeller && !showPLP ? [
                { label: 'فروشندگان', current: true },
              ] : []),
              ...(activeSeller && !showPLP ? [
                { label: 'فروشندگان', onClick: () => { setShowSellersList(true); setActiveSellerId(null); } },
                { label: activeSeller.name, current: true },
              ] : []),
              ...(showCartPage ? [{ label: 'سبد خرید', current: true }] : []),
              ...(showCheckout ? [
                { label: 'سبد خرید', onClick: () => { setShowCheckout(false); setShowCartPage(true); } },
                { label: 'ثبت سفارش', current: true },
              ] : []),
              ...(showComparePage ? [{ label: 'مقایسه', current: true }] : []),
              ...(showWishlistPage ? [{ label: 'علاقه‌مندی‌ها', current: true }] : []),
              ...(showRecentPage ? [{ label: 'اخیراً دیده‌شده', current: true }] : []),
              ...(showProfilePage ? [{ label: 'حساب کاربری', current: true }] : []),
              ...(showSellerPanel ? [{ label: 'پنل فروشنده', current: true }] : []),
              // پنل ادمین: breadcrumb فقط داخل AdminPanelContent — جلوگیری از دوبل
              ...(showAdminPanel ? [] : []),
              ...(showTaxonomyHub === 'categories' ? [{ label: 'همه دسته‌بندی‌ها', current: true }] : []),
              ...(showTaxonomyHub === 'tags' ? [{ label: 'همه برچسب‌ها', current: true }] : []),
              ...(staticPage ? [{
                label: ({
                  about: 'درباره ما', contact: 'تماس با ما', faq: 'سوالات متداول', 'size-guide': 'راهنمای سایز',
                  'become-seller': 'فروشنده شوید', terms: 'قوانین و شرایط', returns: 'شرایط بازگشت',
                  privacy: 'حریم خصوصی', cookies: 'کوکی‌ها', sitemap: 'نقشه سایت', blog: 'بلاگ',
                  'blog-post': (typeof blogPostId !== 'undefined' && blogPosts?.find?.(b => b.id === blogPostId)?.title) || 'مطلب',
                  brands: 'برندها', campaigns: 'کمپین‌ها', deals: 'شگفت‌انگیز',
                  'error-404': 'صفحه یافت نشد', 'error-500': 'خطای سرور', maintenance: 'تعمیرات',
                })[staticPage] || 'صفحه',
                current: true,
              }] : []),
            ].filter(Boolean);
            if (!crumbItems.length) return null;
            return (
              <Breadcrumb
                fullWidth={showProfilePage || showSellerPanel}
                homeOnClick={() => { setActiveSellerId(null); setShowSellersList(false); setShowPLP(false); setShowCartPage(false); setShowCheckout(false); setShowWishlistPage(false); setShowComparePage(false); setShowRecentPage(false); setShowProfilePage(false); setShowSellerPanel(false); setShowAdminPanel(false); try { closeStaticPage(); } catch (_) {} closePLP(); scrollPageToTop(); }}
                items={crumbItems}
              />
            );
          })()}


          
          {/* FAQ سراسری در صفحه اصلی */}
          

{/* ===================== PLP — لیست محصولات ===================== */}
          
          {/* ===================== PDP — صفحه جزئیات محصول ===================== */}
          <ClientErrorBoundary><PdpView /></ClientErrorBoundary>


          {/* ===================== صفحه مقایسه ===================== */}
          <ComparePageView />
          <WishlistPageView />
          <RecentPageView />
          <CartPageView />
          {/* Checkout — code-split */}
          <CheckoutView />
          {/* Profile — code-split */}
          <ProfileView />
          {/* ========== Seller Panel ========== */}
          {showSellerPanel && sellerUser && !pdpProduct && (
            <SellerPanelShell className="seller-panel-shell w-full min-h-screen flex flex-col bg-primary-50 dark:bg-primary-950 overflow-x-hidden">
              <SellerPanelContent adminCategories={adminCategories || []} setAccountPassword={setAccountPassword}  adminCatalogColors={adminCatalogColors} saveAdminCatalogColors={saveAdminCatalogColors}/>
            </SellerPanelShell>
          )}


          {/* ===================== ADMIN PANEL ===================== */}
          
      {adminAuthOpen && (
        <div className="site-modal-root" role="dialog" aria-modal="true" style={{ zIndex: 10050 }}>
          <div className="site-modal-backdrop" onClick={() => { try { closeAdminAuth(); } catch (_) {} }} />
          <div className="site-modal-panel bg-white dark:bg-primary-900 border border-primary-200 dark:border-white/15 p-5 max-w-sm mx-auto rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-primary-900 dark:text-white">ورود ادمین</h3>
              <button type="button" onClick={() => { try { closeAdminAuth(); } catch (_) {} }} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-primary-100 dark:hover:bg-primary-800" aria-label="بستن">
                <Icon name="x" size={18} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                try {
                  if (adminAuthStep === 'mfa') adminVerifyMfa();
                  else if (adminAuthStep === 'otp') verifyAdminOtp();
                  else if (adminAuthMethod === 'password') adminLoginWithPassword();
                  else sendAdminOtp();
                } catch (_) {}
              }}
            >
              {(adminAuthStep === 'otp' || adminAuthStep === 'mfa') ? (
                <>
                  <p className="text-sm text-primary-600 dark:text-white/70 mb-3">
                    {adminAuthStep === 'mfa' ? 'کد تأیید دو مرحله‌ای ارسال‌شده به' : 'کد ارسال‌شده به'}{' '}
                    <span dir="ltr">{adminAuthPhone}</span>
                  </p>
                  <input
                    id="admin-otp-code-input"
                    type="text"
                    name="one-time-code"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    enterKeyHint="done"
                    maxLength={6}
                    autoFocus
                    value={adminAuthOtp || ''}
                    onFocus={(e) => {
                      try {
                        setTimeout(() => e.target.scrollIntoView({ block: 'center', behavior: 'smooth' }), 280);
                      } catch (_) {}
                    }}
                    onChange={(e) => {
                      const code = String(e.target.value || '').replace(/\D/g, '').slice(0, 6);
                      setAdminAuthOtp(code);
                      setAdminAuthError('');
                    }}
                    dir="ltr"
                    className="w-full mb-3 px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-950 text-primary-900 dark:text-white text-center tracking-[0.3em]"
                    placeholder="------"
                    data-admin-auth="true"
                  />
                  {adminAuthError ? <p className="text-sm text-red-600 mb-2">{adminAuthError}</p> : null}
                  <button
                    type="submit"
                    disabled={adminAuthLoading}
                    className="w-full py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium disabled:opacity-60"
                  >
                    {adminAuthLoading ? '...' : 'تأیید'}
                  </button>
                  <div className="flex items-center justify-between gap-2 mt-2 text-xs text-primary-500">
                    <button
                      type="button"
                      className="text-sm text-primary-500"
                      onClick={() => { setAdminAuthStep('phone'); setAdminAuthOtp(''); setAdminAuthError(''); setAdminAuthOtpTimer(0); }}
                    >
                      {adminAuthStep === 'mfa' ? 'بازگشت' : 'تغییر شماره'}
                    </button>
                    {(adminAuthStep === 'otp' || adminAuthStep === 'mfa') ? (
                      adminAuthOtpTimer > 0 ? (
                        <span>ارسال مجدد تا {adminAuthOtpTimer} ثانیه</span>
                      ) : (
                        <button
                          type="button"
                          className="text-apple-blue font-medium"
                          disabled={adminAuthLoading}
                          onClick={() => {
                            try {
                              if (adminAuthStep === 'mfa') adminLoginWithPassword();
                              else sendAdminOtp();
                            } catch (_) {}
                          }}
                        >
                          ارسال مجدد کد
                        </button>
                      )
                    ) : null}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => { setAdminAuthMethod('otp'); setAdminAuthError(''); }}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border ${adminAuthMethod !== 'password' ? 'bg-apple-blue text-white border-apple-blue' : 'border-primary-200 dark:border-white/20 text-primary-700 dark:text-white'}`}
                    >
                      پیامک (OTP)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAdminAuthMethod('password'); setAdminAuthError(''); }}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border ${adminAuthMethod === 'password' ? 'bg-apple-blue text-white border-apple-blue' : 'border-primary-200 dark:border-white/20 text-primary-700 dark:text-white'}`}
                    >
                      رمز عبور
                    </button>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoFocus
                    value={adminAuthPhone}
                    onChange={(e) => setAdminAuthPhone(e.target.value)}
                    className="w-full mb-3 px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-950 text-primary-900 dark:text-white"
                    placeholder="09xxxxxxxxx"
                    data-admin-auth="true"
                  />
                  {adminAuthMethod === 'password' && (
                    <input
                      type="password"
                      value={adminAuthPassword || ''}
                      onChange={(e) => setAdminAuthPassword(e.target.value)}
                      className="w-full mb-3 px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-950 text-primary-900 dark:text-white"
                      placeholder="رمز عبور"
                      autoComplete="current-password"
                      data-admin-auth="true"
                    />
                  )}
                  {adminAuthError ? <p className="text-sm text-red-600 mb-2">{adminAuthError}</p> : null}
                  <button
                    type="submit"
                    disabled={adminAuthLoading}
                    className="w-full py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium disabled:opacity-60"
                  >
                    {adminAuthLoading ? '...' : (adminAuthMethod === 'password' ? 'ورود با رمز' : 'ارسال کد')}
                  </button>
                  <p className="mt-3 text-[11px] text-primary-400 text-center leading-relaxed">
                    رمز را بعد از ورود با پیامک، از تب تنظیمات پنل ادمین بسازید یا تغییر دهید.
                  </p>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {showAdminPanel && adminUser && !pdpProduct && (
            <AdminPanelShell className="admin-panel-shell w-full min-h-screen flex flex-col bg-primary-50 dark:bg-primary-950 overflow-x-hidden">
              <AdminPanelContent
            hydrateAdminProducts={hydrateAdminProducts}
            hydrateAdminSellers={hydrateAdminSellers}
            hydrateAdminOrders={hydrateAdminOrders}
            adminPatchProductStatus={adminPatchProductStatus}
            adminDeleteProduct={adminDeleteProduct}
            adminPatchSellerStatus={adminPatchSellerStatus}
            adminPatchOrderStatus={adminPatchOrderStatus}
            adminListLoading={adminListLoading}
            adminListError={adminListError}
          adminCatalogColors={adminCatalogColors} saveAdminCatalogColors={saveAdminCatalogColors}/>
            </AdminPanelShell>
          )}

          {/* هاب همه دسته‌ها / همه برچسب‌ها */}
          <ClientErrorBoundary><TaxonomyHubView /></ClientErrorBoundary>
          <ClientErrorBoundary><PlpView /></ClientErrorBoundary>
          <SellerStorefrontView />
          <ClientErrorBoundary><SellersListView /></ClientErrorBoundary>
          <HomeView />
          <ClientErrorBoundary><StaticPagesView /></ClientErrorBoundary>
          {/* ========== Auth Modal (OTP) ========== */}
          
      {roleGateOpen ? (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" dir="rtl" role="dialog" aria-modal="true">
          <button type="button" className="absolute inset-0 bg-black/50 backdrop-blur-[2px] border-0 cursor-default" aria-label="بستن" onClick={() => setRoleGateOpen(false)} />
          <div className="role-gate-modal relative z-10 w-full max-w-md border border-primary-200 dark:border-white/15 bg-white dark:bg-[#1a1c20] shadow-2xl p-6 sm:p-8" style={{ borderRadius: 0, borderRadius: "0px" }}>
            <button type="button" onClick={() => setRoleGateOpen(false)} className="absolute top-3 left-3 w-9 h-9 rounded-full text-primary-500 hover:bg-primary-100 dark:hover:bg-white/10 text-lg leading-none" aria-label="بستن">×</button>
            <h2 className="text-lg font-bold text-primary-900 dark:text-white text-center">ورود / ثبت‌نام</h2>
            <p className="text-xs text-primary-500 dark:text-white/55 text-center mt-1 mb-6">حساب مورد نظر را انتخاب کنید</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button type="button" onClick={() => { setRoleGateOpen(false); openAuth(); }} className="flex flex-col items-center gap-2 rounded-2xl border border-primary-200 dark:border-white/15 px-4 py-6 hover:border-apple-blue transition bg-primary-50/70 dark:bg-white/5">
                <span className="text-2xl" aria-hidden>🛒</span>
                <span className="text-sm font-bold text-primary-900 dark:text-white">خریدار</span>
                <span className="text-[11px] text-primary-500 dark:text-white/50 text-center">خرید و پیگیری سفارش</span>
              </button>
              <button type="button" onClick={() => { setRoleGateOpen(false); openSellerAuth(); }} className="flex flex-col items-center gap-2 rounded-2xl border border-primary-200 dark:border-white/15 px-4 py-6 hover:border-apple-blue transition bg-primary-50/70 dark:bg-white/5">
                <span className="text-2xl" aria-hidden>🏪</span>
                <span className="text-sm font-bold text-primary-900 dark:text-white">فروشنده</span>
                <span className="text-[11px] text-primary-500 dark:text-white/50 text-center">پنل فروشگاه و محصولات</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <AuthModalView />
          
      {publicTrackOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40" role="dialog" aria-modal="true" onClick={() => setPublicTrackOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-primary-900 border border-primary-200 dark:border-white/15 p-5 shadow-xl" onClick={(e) => e.stopPropagation()} dir="ltr">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-primary-900 dark:text-white">پیگیری سفارش</h2>
              <button type="button" onClick={() => setPublicTrackOpen(false)} className="text-primary-500 text-sm">بستن</button>
            </div>
            <div className="flex gap-2 flex-row" dir="ltr" style={{ direction: "ltr" }}>
              <input
                value={publicTrackCode}
                onChange={(e) => setPublicTrackCode(e.target.value)}
                placeholder=""
                className="flex-1 px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white"
                dir="ltr"
              />
              <button
                type="button"
                disabled={publicTrackLoading}
                onClick={async () => {
                  const code = (publicTrackCode || '').trim();
                  if (!code) return;
                  setPublicTrackLoading(true);
                  setPublicTrackError('');
                  setPublicTrackResult(null);
                  try {
                    const res = await fetch('/api/orders/track', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ code }),
                    });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok || !data?.ok) {
                      setPublicTrackError(data?.error || 'سفارشی یافت نشد');
                    } else {
                      setPublicTrackResult(data.order || data);
                    }
                  } catch (_) {
                    setPublicTrackError('خطا در ارتباط با سرور');
                  } finally {
                    setPublicTrackLoading(false);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-apple-blue text-white text-sm font-medium disabled:opacity-60 flex-shrink-0 order-2"
              >
                {publicTrackLoading ? '...' : 'پیگیری'}
              </button>
            </div>
            {publicTrackError && <p className="mt-3 text-xs text-red-600">{publicTrackError}</p>}
            {publicTrackResult && (
              <div className="mt-4 p-3 rounded-xl border border-primary-100 dark:border-white/10 space-y-1">
                <p className="text-sm font-bold text-primary-900 dark:text-white">{publicTrackResult.order_number || publicTrackResult.id}</p>
                <p className="text-xs text-primary-600 dark:text-white/80">وضعیت: {publicTrackResult.statusLabel || publicTrackResult.status}</p>
                {publicTrackResult.tracking_code && (
                  <p className="text-xs text-primary-500" dir="ltr">کد رهگیری: {publicTrackResult.tracking_code}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

{cartOpen && (
            <>
              <div className="cart-overlay fixed inset-0 z-[90] bg-black/40 backdrop-blur-xl" onClick={() => setCartOpen(false)} onWheel={(e) => e.preventDefault()} onTouchMove={(e) => e.preventDefault()} aria-hidden="true" />
              <div role="dialog" aria-modal="true" className="cart-panel fixed top-0 bottom-0 start-0 z-[200] w-full max-w-[360px] sm:max-w-[400px] bg-white dark:bg-primary-900 h-full min-h-0 max-h-[100dvh] shadow-2xl flex flex-col rounded-l-2xl overflow-hidden" role="dialog" aria-modal="true" aria-label="سبد خرید">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-primary-200 dark:border-white/30 bg-primary-50/50 dark:bg-primary-900/40">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-apple-blue text-white flex items-center justify-center">
                      <Icon name="shoppingBag" size={18} />
                    </div>
                    <div className="drawer-title-wrap">
                      <h3 data-drawer-title className="font-bold text-base text-primary-900 dark:!text-white leading-tight">سبد خرید</h3>
                      <p className="text-xs text-primary-500 dark:!text-white">{toFa(cartCount)} کالا</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {cart.length > 0 && (
                      clearCartConfirm ? (
                        <div className="flex items-center gap-1 ml-1">
                          <button type="button" onClick={clearCart} className="text-xs px-2 py-1 rounded-full bg-red-500 text-white font-medium">تأیید حذف</button>
                          <button type="button" onClick={() => setClearCartConfirm(false)} className="text-xs px-2 py-1 rounded-full border border-primary-200 dark:border-white/30 text-primary-600 dark:text-white">لغو</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setClearCartConfirm(true)} className="text-xs px-2 py-1 rounded-full text-primary-500 dark:text-white/70 hover:bg-primary-100 dark:hover:bg-primary-800 transition">حذف همه</button>
                      )
                    )}
                    <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-primary-100 dark:hover:bg-primary-800 rounded-full transition text-primary-900 dark:text-white" aria-label="بستن سبد">
                      <Icon name="x" size={20} />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {cart.length === 0 ? (
                    <div className="text-center py-14 px-2">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-50 dark:bg-primary-900 flex items-center justify-center text-primary-400 dark:text-white">
                        <Icon name="shoppingBag" size={28} />
                      </div>
                      <p className="text-primary-800 dark:text-white text-sm font-bold mb-1">سبد خرید شما خالی است</p>
                      <p className="text-primary-500 dark:!text-white text-xs mb-5 leading-relaxed">پیراهن مورد علاقه‌تان را پیدا کنید و استایل‌تان را کامل کنید</p>
                      <button type="button" onClick={() => { setCartOpen(false); openPLP(); }} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium hover:opacity-90 transition">
                        ادامه خرید
                      </button>
                    </div>
                  ) : (
                    <>
                      {cart.map((item, idx) => {
                        const product = products.find(pr => pr.id === item.id);
                        const availableColors = product?.colors || (item.selectedColor ? [item.selectedColor] : []);
                        const seller = product?.seller || item.seller || OWN_SELLER;
                        const key = cartItemKey(item.id, item.selectedColor?.name, item.selectedSize);
                        const loading = !!cartItemLoading[key];
                        const stockLeft = product?.stock ?? (item.id % 3 === 0 ? 2 : null);
                        const lineTotal = item.price * item.qty;
                        return (
                          <div key={`${item.id}-${item.selectedColor?.name || ''}-${item.selectedSize || ''}-${idx}`} className={`cart-item-row ${loading ? 'opacity-60 pointer-events-none' : ''}`} style={{ animationDelay: `${idx * 0.06}s` }}>
                            <div className="flex gap-3 items-start py-3.5">
                              <button type="button" className="flex-shrink-0 p-0 border-0 bg-transparent" onClick={() => { setCartOpen(false); openPDP(product || item); }}>
                                <img src={item.selectedColor?.image || item.image} alt={item.name || "محصول"} loading="lazy" decoding="async" referrerPolicy="no-referrer" className="w-16 h-20 object-cover rounded-xl shadow-sm" onError={(e) => { e.currentTarget.classList.add("img-broken"); e.currentTarget.src = "/logo.webp"; }} />
                              </button>
                              <div className="flex-1 min-w-0">
                                <button type="button" className="text-right w-full p-0 border-0 bg-transparent" onClick={() => { setCartOpen(false); openPDP(product || item); }}>
                                  <h4 className="font-medium text-sm text-primary-900 dark:text-white line-clamp-2" title={item.name}>{item.name}</h4>
                                  {item.productCode && <p className="text-[10px] text-primary-400 dark:text-white/50 font-latin mt-0.5" dir="ltr">{item.productCode}</p>}
                                </button>
                                <div className="mt-1 flex flex-wrap items-center gap-1">
                                  <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md font-medium bg-primary-50 dark:bg-primary-700 text-primary-600 dark:text-white border border-primary-100 dark:border-white/30">
                                    فروشنده: {(seller?.name && seller.name !== "undefined") ? seller.name : (seller?.shop_name || "فروشگاه")}
                                  </span>
                                  {item.selectedSize && (
                                    <span className="latin-label text-xs px-1.5 py-0.5 rounded-md bg-primary-50 dark:bg-primary-800 text-primary-600 dark:text-white border border-primary-100 dark:border-white/20">سایز {item.selectedSize}</span>
                                  )}
                                </div>
                                {availableColors.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                    {availableColors.map((c) => (
                                      <button
                                        key={c.name}
                                        type="button"
                                        onClick={() => changeCartColor(item.id, item.selectedColor?.name, c)}
                                        title={c.name}
                                        className={`p-0.5 rounded-full border-2 transition ${item.selectedColor?.name === c.name ? 'border-primary-800 dark:border-white' : 'border-primary-200 dark:border-primary-600 hover:border-primary-400'}`}
                                      >
                                        <span className="color-swatch block w-3.5 h-3.5 rounded-full border border-primary-300 dark:border-white/70" style={{ ["--swatch-color"]: c.hex || "#888", backgroundColor: c.hex || "#888" }} />
                                      </button>
                                    ))}
                                    <span className="text-xs text-primary-500 dark:text-white mr-1">{item.selectedColor?.name}</span>
                                  </div>
                                )}
                                {stockLeft != null && stockLeft <= 3 && (
                                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">فقط {toFa(stockLeft)} عدد باقی مانده</p>
                                )}
                                <div className="flex items-baseline gap-2 mt-1.5 flex-wrap">
                                  {item.discount ? (
                                    <>
                                      <span className="text-primary-700 dark:text-white font-bold text-sm">{item.priceText} تومان</span>
                                      {item.oldPrice && <span className="text-xs text-primary-400 line-through">{item.oldPrice}</span>}
                                      <span className="text-xs font-bold text-apple-blue bg-apple-blue/10 px-1.5 py-0.5 rounded">{toFa(item.discount)}٪</span>
                                    </>
                                  ) : (
                                    <span className="text-primary-700 dark:text-white font-bold text-sm">{item.priceText} تومان</span>
                                  )}
                                </div>
                                <p className="text-xs text-primary-500 dark:!text-white mt-0.5">جمع این کالا: {formatPrice(lineTotal)} تومان</p>
                                <div className="flex items-center gap-2 mt-2.5">
                                  <button type="button" disabled={item.qty <= 1} onClick={() => updateQty(item.id, item.selectedColor?.name, -1, item.selectedSize)} className="w-7 h-7 rounded-full border border-primary-200 dark:border-white/50 flex items-center justify-center hover:bg-primary-100 dark:hover:bg-primary-800 transition text-primary-900 dark:text-white disabled:opacity-40 disabled:cursor-not-allowed" aria-label="کاهش تعداد">
                                    <Icon name="minus" size={14} />
                                  </button>
                                  <span className="text-sm font-medium w-6 text-center text-primary-900 dark:text-white">{toFa(item.qty)}</span>
                                  <button type="button" onClick={() => updateQty(item.id, item.selectedColor?.name, 1, item.selectedSize)} className="w-7 h-7 rounded-full border border-primary-200 dark:border-white/50 flex items-center justify-center hover:bg-primary-100 dark:hover:bg-primary-800 transition text-primary-900 dark:text-white" aria-label="افزایش تعداد">
                                    <Icon name="plus" size={14} />
                                  </button>
                                  <button type="button" onClick={() => removeFromCart(item.id, item.selectedColor?.name, item.selectedSize)} className="cart-trash-btn p-1.5 rounded-full transition text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-800" aria-label="حذف از سبد">
                                    <Icon name="trash" size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                            {idx < cart.length - 1 && (
                              <div className="border-b border-primary-200 dark:border-white/30" />
                            )}
                          </div>
                        );
                      })}

                      {/* Coupon */}
                      <div className="mt-4">
                        <p className="text-xs font-bold text-primary-700 dark:text-white mb-2">کد تخفیف و هدایا</p>
                        {couponApplied ? (
                          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-apple-blue/30 bg-apple-blue/5">
                            <span className="text-xs font-bold text-apple-blue">{couponApplied.code}</span>
                            <button type="button" onClick={removeCoupon} className="text-xs text-primary-500 hover:text-red-500 transition">حذف</button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={couponInput}
                              onChange={(e) => { setCouponInput(e.target.value); setCouponMsg(null); }}
                              onKeyDown={(e) => { if (e.key === 'Enter') applyCoupon(); }}
                              placeholder="کد تخفیف یا هدیه"
                              className="coupon-input flex-1 min-w-0 px-3 py-2 rounded-xl border border-primary-200 dark:border-white/40 bg-white dark:bg-[#1A1C20] text-sm !text-primary-900 dark:!text-white placeholder:!text-primary-500 dark:placeholder:!text-white/70 outline-none focus:border-apple-blue"
                            />
                            <button type="button" onClick={applyCoupon} className="px-3 py-2 rounded-xl bg-primary-800 dark:bg-[#212121] text-white dark:!text-white text-xs font-bold flex-shrink-0 hover:opacity-90 transition">
                              اعمال
                            </button>
                          </div>
                        )}
                        {couponMsg && (
                          <p className={`text-xs mt-1.5 ${couponMsg.type === 'ok' ? 'text-apple-blue' : 'text-red-500'}`}>{couponMsg.text}</p>
                        )}

                      </div>


                      {/* Upsell */}
                      {cartUpsell.length > 0 && (
                        <div className="mt-5">
                          <p className="text-xs font-bold text-primary-800 dark:text-white mb-2.5">معمولاً با این کالا می‌خرند</p>
                          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1" style={{ WebkitOverflowScrolling: 'touch' }}>
                            {cartUpsell.map((p) => (
                              <div key={p.id} className="flex-shrink-0 w-[120px] rounded-xl border border-primary-200 dark:border-white bg-primary-50/50 dark:bg-[#1A1C20] p-2">
                                <img src={p.colors?.[0]?.image || p.image} alt="" className="w-full h-16 object-cover rounded-lg mb-1.5" loading="lazy" referrerPolicy="no-referrer" />
                                <p className="text-xs font-medium text-primary-900 dark:text-white line-clamp-2 leading-snug mb-1">{p.name}</p>
                                <p className="text-xs font-bold text-primary-700 dark:text-white mb-1.5">{p.priceText}</p>
                                <button type="button" onClick={() => addToCart(p)} className="product-card-add-btn w-full text-xs py-2 rounded-xl bg-[#0A84FF] text-white font-bold hover:opacity-95">افزودن به سبد</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Trust */}
                      <div className="mt-5 grid grid-cols-3 gap-2">
                        {[
                          { icon: 'shield', t: 'پرداخت امن' },
                          { icon: 'refresh', t: '۷ روز بازگشت' },
                          { icon: 'badge', t: 'ضمانت اصالت' },
                        ].map((x) => (
                          <div key={x.t} className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-primary-50 dark:bg-primary-900 text-center border border-primary-100 dark:border-white/15">
                            <span className="trust-icon-wrap inline-flex items-center justify-center w-9 h-9 rounded-full bg-white dark:bg-primary-800 border border-primary-200 dark:border-white/30">
                              <Icon name={x.icon} size={16} className="text-apple-blue dark:text-[#13ABC4]" />
                            </span>
                            <span className="text-xs font-medium text-primary-700 dark:!text-white leading-tight">{x.t}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Sticky footer */}
                {cart.length > 0 && (
                  <div className="p-4 sm:p-5 border-t border-primary-200 dark:border-white/30 space-y-2.5 bg-primary-50/40 dark:bg-primary-900/30">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-primary-600 dark:text-white/80">جمع جزء</span>
                      <span className="text-primary-800 dark:text-white font-medium">{formatPrice(cartSubtotal)} تومان</span>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-apple-blue">تخفیف کد</span>
                        <span className="text-apple-blue font-medium">−{formatPrice(couponDiscount)} تومان</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-primary-600 dark:text-white/80">مالیات (۹٪)</span>
                      <span className="text-primary-800 dark:text-white font-medium">{formatPrice(cartTax)} تومان</span>
                    </div>
                    {(cartProductSavings > 0 || couponDiscount > 0) && (
                      <p className="text-xs text-apple-blue dark:text-[#13ABC4] font-medium">شما {formatPrice(cartProductSavings + couponDiscount)} تومان سود کردید</p>
                    )}
                    <div className="flex justify-between items-center pt-1 border-t border-primary-200/60 dark:border-white/10">
                      <span className="text-primary-700 dark:text-white text-sm font-bold">مبلغ قابل پرداخت</span>
                      <span className="font-bold text-lg text-primary-900 dark:text-white">{formatPrice(cartTotal)} تومان</span>
                    </div>
                    <button type="button" onClick={openCheckout} className="w-full bg-apple-blue text-white py-3.5 rounded-full font-medium hover:bg-primary-700 active:scale-[0.98] transition shadow-md">
                      ادامه و پرداخت
                    </button>
                    <button type="button" onClick={() => { setCartOpen(false); openCartPage(); }} className="w-full py-2.5 rounded-full text-sm font-medium text-primary-800 dark:!text-white border border-primary-200 dark:border-white hover:bg-primary-50 dark:hover:bg-primary-800 transition">
                      مشاهده کامل سبد خرید
                    </button>
                    <button type="button" onClick={() => setCartOpen(false)} className="w-full py-2 rounded-full text-xs font-medium text-primary-500 dark:!text-white">
                      ادامه خرید
                    </button>
                  </div>
                )}
              </div>
            </>
          )}


                    {/* Product import report */}
          {productImportReport && (
            <div className="site-modal-root" role="dialog" aria-modal="true">
              <div className="site-modal-backdrop" onClick={() => setProductImportReport(null)} />
              <div className="site-modal-panel bg-white dark:bg-primary-900 border border-primary-200 dark:border-white/15 p-5">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="text-base font-bold text-primary-900 dark:text-white">گزارش ورود محصولات</h3>
                  <button type="button" onClick={() => setProductImportReport(null)} className="p-1.5 rounded-full hover:bg-primary-50 dark:hover:bg-primary-800"><Icon name="x" size={16} /></button>
                </div>
                <p className="text-xs text-primary-500 mb-3">
                  منبع: <strong>{productImportReport.source === 'shopify' ? 'Shopify' : productImportReport.source === 'woocommerce' ? 'WooCommerce' : productImportReport.source}</strong>
                  {' · '}کل ردیف: {toFa(productImportReport.total)}
                  {' · '}واردشده: {toFa(productImportReport.imported)}
                  {' · '}ردشده: {toFa(productImportReport.skipped)}
                </p>
                {productImportReport.warnings?.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-amber-700">هشدارها / نگاشت‌ها:</p>
                    <ul className="text-xs text-primary-600 dark:text-white/70 space-y-1 max-h-60 overflow-y-auto">
                      {productImportReport.warnings.map((w, i) => (
                        <li key={i} className="border-b border-primary-50 dark:border-white/5 pb-1">{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-xs text-primary-400 mt-4 leading-relaxed">
                  رنگ، سایز، برند و دسته با کاتالوگ ادمین هم‌تراز می‌شوند. موارد نامشخص با مقدار پیش‌فرض جایگزین و در هشدارها ثبت می‌شوند. محصولات واردشده با وضعیت «در انتظار تأیید ادمین» ذخیره می‌شوند.
                </p>
                <button type="button" onClick={() => setProductImportReport(null)} className="mt-4 w-full py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium">باشه</button>
              </div>
            </div>
          )}


          {/* نوار ویرایش ادمین روی فرانت (مشابه وردپرس) */}
          {adminUser && !showAdminPanel && !showSellerPanel && (
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[160] flex items-center gap-2 px-3 py-2 rounded-full bg-white/95 dark:bg-[#1a1a1a]/95 text-primary-900 dark:text-white shadow-2xl border border-primary-200 dark:border-white/15 backdrop-blur-xl max-w-[95vw]">
              <span className="text-xs sm:text-xs text-primary-900 dark:text-white/80 hidden sm:inline whitespace-nowrap font-medium">حالت ادمین</span>
              <span className="text-xs font-semibold text-primary-900 dark:text-white truncate max-w-[28vw] sm:max-w-[140px]">{getCurrentPageSeoContext().typeLabel}</span>
              <button type="button" onClick={openAdminFrontEdit} className="text-xs px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-medium whitespace-nowrap shadow-sm">ویرایش SEO صفحه</button>
              <button type="button" onClick={() => openAdminPanel('seo')} className="text-xs px-2.5 py-1.5 rounded-full border border-primary-300 dark:border-white/30 text-primary-900 dark:text-white hover:bg-primary-50 dark:hover:bg-white/10 whitespace-nowrap hidden sm:inline font-medium">پنل سئو</button>
              <button type="button" onClick={() => openAdminPanel('dashboard')} className="text-xs px-2.5 py-1.5 rounded-full border border-primary-300 dark:border-white/30 text-primary-900 dark:text-white hover:bg-primary-50 dark:hover:bg-white/10 whitespace-nowrap font-medium">پنل</button>
            </div>
          )}

          {adminFrontEditOpen && adminUser && (
            <div className="site-modal-root" role="dialog" aria-modal="true">
              <div className="absolute inset-0 bg-black/45" onClick={() => setAdminFrontEditOpen(false)} />
              <div className="site-modal-panel bg-white dark:bg-primary-900 border border-primary-200 dark:border-white/15 p-5">
                {(() => {
                  const ctx = getCurrentPageSeoContext();
                  return (
                    <>
                      <div className="flex items-start justify-between gap-2 mb-4">
                        <div>
                          <h3 className="text-base font-bold text-primary-900 dark:text-white">ویرایش این صفحه</h3>
                          <p className="text-xs text-primary-500 mt-0.5">{ctx.typeLabel} · {ctx.label}</p>
                          <p className="text-xs text-primary-400 mt-0.5 font-mono" dir="ltr">{ctx.key}</p>
                        </div>
                        <button type="button" onClick={() => setAdminFrontEditOpen(false)} className="p-1.5 rounded-full hover:bg-primary-50 dark:hover:bg-primary-800"><Icon name="x" size={16} /></button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-primary-500 mb-1 block">نامک (Slug)</label>
                          <input value={adminFrontEditForm.slug} onChange={e => setAdminFrontEditForm(f => ({ ...f, slug: e.target.value }))} dir="ltr" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left font-latin text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue" />
                        </div>
                        {renderContentSeoBox({
                          mode: (ctx.type === 'blog-post' || ctx.type === 'blog') ? 'article' : (ctx.type === 'category' ? 'category' : (ctx.type === 'brand' ? 'brand' : 'page')),
                          sellerLimited: false,
                          adminSeoLayout: true,
                          showAdminIndexCanonical: true,
                          title: adminFrontEditForm.title || '',
                          description: adminFrontEditForm.description || '',
                          focusKeywords: adminFrontEditForm.focusKeywords || '',
                          canonical: adminFrontEditForm.canonical || '',
                          ogImage: adminFrontEditForm.ogImage || '',
                          noindex: !adminFrontEditForm.indexable,
                          contentTitle: ctx.label || '',
                          bodyText: adminFrontEditForm.description || '',
                          hasImage: !!adminFrontEditForm.ogImage,
                          faqItems: adminFrontEditForm.faq || [],
                          onFaqChange: (items) => setAdminFrontEditForm(f => ({ ...f, faq: items })),
                          previewUrl: ((seoCfg().canonicalBase || 'https://pirahanemardane.ir').replace(/\/$/, '') + '/' + (adminFrontEditForm.slug || (ctx.defaults && ctx.defaults.slug) || '')),
                          onChange: (patch) => setAdminFrontEditForm(f => ({
                            ...f,
                            title: patch.title != null ? patch.title : f.title,
                            description: patch.description != null ? patch.description : f.description,
                            focusKeywords: patch.focusKeywords != null ? patch.focusKeywords : f.focusKeywords,
                            canonical: patch.canonical != null ? patch.canonical : f.canonical,
                            ogImage: patch.ogImage != null ? patch.ogImage : f.ogImage,
                            indexable: patch.noindex != null ? !patch.noindex : f.indexable,
                          })),
                        })}
                        <p className="text-xs text-primary-500 leading-relaxed bg-primary-50 dark:bg-primary-900/50 rounded-xl p-3">
                          تغییرات روی همین صفحه اعمال می‌شود و در صورت وجود، با محصول / دسته / تنظیمات سراسری همگام می‌شود. برای اسکیما، GTM و سایت‌مپ از «پنل سئو» استفاده کنید.
                        </p>
                        <div className="flex gap-2 pt-1">
                          <button type="button" onClick={saveAdminFrontEdit} className="flex-1 py-2.5 rounded-full bg-apple-blue text-white text-sm font-medium">ذخیره</button>
                          <button type="button" onClick={() => setAdminFrontEditOpen(false)} className="px-5 py-2.5 rounded-full border border-primary-200 dark:border-white/30 text-sm text-primary-700 dark:text-white">لغو</button>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          


          {siteDialog && (
            <div className="site-modal-root" role="dialog" aria-modal="true">
              <div className="site-modal-backdrop" onClick={() => closeSiteDialog(siteDialog.mode === 'confirm' ? false : null)} />
              <div
                className="site-modal-panel bg-white dark:bg-primary-900 border border-primary-200 dark:border-white/15 p-4 sm:p-5 space-y-3"
                tabIndex={-1}
                ref={(el) => { try { if (el && siteDialog.mode === 'confirm') el.focus(); } catch (_) {} }}
              >
                <h3 className="text-sm font-bold text-primary-900 dark:text-white text-right">{siteDialog.title}</h3>
                {siteDialog.message ? (
                  <p className="text-sm text-primary-600 dark:text-white/80 text-right whitespace-pre-wrap leading-relaxed">{siteDialog.message}</p>
                ) : null}
                {siteDialog.mode === 'prompt' && !siteDialog.fields && (
                  <input
                    id="site-dialog-input"
                    autoFocus
                    defaultValue={siteDialog.defaultValue || ''}
                    className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        closeSiteDialog((e.currentTarget.value || '').trim());
                      }
                      if (e.key === 'Escape') closeSiteDialog(null);
                    }}
                  />
                )}
                {siteDialog.mode === 'prompt' && Array.isArray(siteDialog.fields) && (
                  <div className="space-y-2">
                    {siteDialog.fields.map((f, fi) => (
                      <div key={f.key || fi}>
                        <label className="text-xs text-primary-500 block mb-1 text-right">{f.label}</label>
                        <input
                          id={`site-dialog-field-${f.key || fi}`}
                          defaultValue={f.defaultValue || ''}
                          dir={f.dir || 'rtl'}
                          className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === 'NumpadEnter') {
                              e.preventDefault();
                              const out = {};
                              (siteDialog.fields || []).forEach((ff, ffi) => {
                                const el = document.getElementById(`site-dialog-field-${ff.key || ffi}`);
                                out[ff.key || `f${ffi}`] = (el?.value || '').trim();
                              });
                              closeSiteDialog(out);
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 justify-start pt-1">
                  <button
                    type="button"
                    className="px-5 py-2 rounded-full bg-apple-blue text-white text-sm font-medium min-w-[5rem]"
                    onClick={() => {
                      if (siteDialog.mode === 'confirm') {
                        closeSiteDialog(true);
                        return;
                      }
                      if (Array.isArray(siteDialog.fields) && siteDialog.fields.length) {
                        const out = {};
                        siteDialog.fields.forEach((f, fi) => {
                          const el = document.getElementById(`site-dialog-field-${f.key || fi}`);
                          out[f.key || `f${fi}`] = (el?.value || '').trim();
                        });
                        closeSiteDialog(out);
                        return;
                      }
                      const el = document.getElementById('site-dialog-input');
                      closeSiteDialog((el?.value || '').trim());
                    }}
                  >
                    {siteDialog.mode === 'confirm' ? 'تأیید' : 'تأیید'}
                  </button>
                  <button
                    type="button"
                    className="px-5 py-2 rounded-full border border-primary-200 dark:border-white/30 text-sm text-primary-700 dark:text-white min-w-[5rem]"
                    onClick={() => closeSiteDialog(siteDialog.mode === 'confirm' ? false : null)}
                  >
                    انصراف
                  </button>
                </div>
              </div>
            </div>
          )}

          <Toaster defaultPosition="top-center" />

          {/* برو بالا */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`back-to-top fixed bottom-16 sm:bottom-8 right-4 sm:right-6 z-[150] w-11 h-11 rounded-full bg-apple-blue text-white shadow-lg flex items-center justify-center hover:opacity-95 transition ${showTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
            title="برو بالا"
            aria-label="برو بالا"
          >
            <Icon name="chevronUp" size={22} />
          </button>

        </div>
        </AppApiProvider>
              );
    }

export default App;
