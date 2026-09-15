globalThis.localStorage = {
  _d: new Map(),
  getItem(k) { return this._d.has(k) ? this._d.get(k) : null; },
  setItem(k, v) { this._d.set(k, String(v)); },
  removeItem(k) { this._d.delete(k); },
};
import { createStore } from '../lib/stores/createStore.js';
import { adminUiStore } from '../lib/stores/adminUiStore.js';
import { sellerUiStore } from '../lib/stores/sellerUiStore.js';
import { formsStore } from '../lib/stores/formsStore.js';
import { modalUiStore } from '../lib/stores/modalUiStore.js';
import { commerceUiStore } from '../lib/stores/commerceUiStore.js';

let failed = 0;
function assert(cond, msg) {
  if (!cond) { console.error('FAIL:', msg); failed += 1; }
  else console.log('ok:', msg);
}

const s = createStore({ a: 1 });
s.setState({ a: 2 });
assert(s.getState().a === 2, 'createStore');

adminUiStore.setState((st) => ({ ...st, adminTab: 'products' }));
assert(adminUiStore.getState().adminTab === 'products', 'adminUiStore');
sellerUiStore.setState((st) => ({ ...st, sellerTab: 'orders' }));
assert(sellerUiStore.getState().sellerTab === 'orders', 'sellerUiStore');
assert(formsStore.getState() && typeof formsStore.getState() === 'object', 'formsStore');
assert(modalUiStore.getState() && typeof modalUiStore.getState() === 'object', 'modalUiStore');
assert(commerceUiStore.getState() && typeof commerceUiStore.getState() === 'object', 'commerceUiStore');

if (failed) process.exit(1);
console.log('\nall unit tests passed');
