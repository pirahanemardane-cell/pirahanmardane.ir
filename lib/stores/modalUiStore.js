import { createStore } from './createStore.js';

/** دامنه modalUi — state موقت فرم/مودال/پنل */
export const modalUiStore = createStore({
  cartOpen: false,
  clearCartConfirm: false,
  quickColorIdx: 0,
  quickSize: 'M',
  quickQty: 1,
  quickGalleryIdx: 0,
  quickDescOpen: false,
  pdpNotifyOpen: false,
  pdpSizeRecOpen: false,
  searchOpen: false,
  catOpen: false,
  mobileMenuOpen: false,
  wishlistOpen: false,
  notifPanelOpen: false,
  searchSuggestOpen: false,
  orderReturnOpen: false,
  authOpen: false,
  plpCityOpen: false,
  plpFilterOpen: false,
  plpSortOpen: false,
  quickAdd: null,
  compareOpen: false,
  compareReplaceOpen: false,
  megaOpen: '',
  oldPriceOpen: false,
  recentOpen: false,
  plpSidebarOpen: true
});

export function patchModalUi(partial) {
  modalUiStore.setState((s) => ({ ...s, ...partial }));
}
