import { createStore } from './createStore.js';

/** وضعیت UI سراسری: دراور/مودال — مکمل state داخل App */
export const uiStore = createStore({
  mobileMenuOpen: false,
  cartOpen: false,
  wishlistOpen: false,
  compareOpen: false,
  recentOpen: false,
  notifPanelOpen: false,
});

export function setUiFlags(partial) {
  uiStore.setState((s) => ({ ...s, ...partial }));
}
