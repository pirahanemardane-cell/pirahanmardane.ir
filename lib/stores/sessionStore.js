import { createStore } from './createStore.js';
import { storageGetJSON, storageSetJSON } from '../client-storage.js';

export const sessionStore = createStore({
  buyer: null,
  seller: null,
  admin: null,
});

export function hydrateSessionStore() {
  if (typeof window === 'undefined') return;
  try {
    const buyer = storageGetJSON('buyerUser', null);
    const seller = storageGetJSON('sellerUser', null);
    const admin = storageGetJSON('adminUser', null);
    sessionStore.setState({
      buyer: buyer || null,
      seller: seller || null,
      admin: admin || null,
    });
  } catch (_) {}
}

export function setSessionBuyer(buyer) {
  sessionStore.setState((s) => ({ ...s, buyer }));
  if (buyer) storageSetJSON('buyerUser', buyer);
  else {
    try { localStorage.removeItem('buyerUser'); } catch (_) {}
  }
}

export function setSessionSeller(seller) {
  sessionStore.setState((s) => ({ ...s, seller }));
  if (seller) storageSetJSON('sellerUser', seller);
  else {
    try { localStorage.removeItem('sellerUser'); } catch (_) {}
  }
}

export function setSessionAdmin(admin) {
  sessionStore.setState((s) => ({ ...s, admin }));
  if (admin) storageSetJSON('adminUser', admin);
  else {
    try { localStorage.removeItem('adminUser'); } catch (_) {}
  }
}
