/** رجیستری استورهای دامنه — نقطه ورود معماری state */
export { createStore } from './createStore.js';
export { useStore } from './useStore.js';
export {
  cartStore,
  hydrateCartStore,
  setCartItems,
  getCartCount,
  syncCartFromServer,
  addToCartServer,
  clearCartServer,
  removeCartItemServer,
  setServerCartEnabled,
  isServerCartEnabled,
} from './cartStore.js';
export { wishlistStore, hydrateWishlistStore, setWishlistIds } from './wishlistStore.js';
export { compareStore, hydrateCompareStore, setCompareItems } from './compareStore.js';
export { uiStore, setUiFlags } from './uiStore.js';
export { plpStore, setPlpState } from './plpStore.js';
export { sessionStore, hydrateSessionStore, setSessionBuyer, setSessionSeller, setSessionAdmin } from './sessionStore.js';
export { catalogStore, hydrateCatalogStore, setCatalogField } from './catalogStore.js';

export { adminUiStore, patchAdminUi } from './adminUiStore.js';
export { sellerUiStore, patchSellerUi } from './sellerUiStore.js';
export { formsStore, patchForms } from './formsStore.js';
export { modalUiStore, patchModalUi } from './modalUiStore.js';
export { commerceUiStore, patchCommerceUi } from './commerceUiStore.js';
export { useStoreField } from './useStoreField.js';
export { shopUiStore, patchShopUi } from './shopUiStore.js';
