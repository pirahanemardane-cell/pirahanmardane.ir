import { createStore } from './createStore.js';
import { storageGetJSON, storageSetJSON } from '../client-storage.js';

export const compareStore = createStore([]);

export function hydrateCompareStore() {
  if (typeof window === 'undefined') return;
  const data = storageGetJSON('compare', null);
  compareStore.setState(() => (Array.isArray(data) ? data : []));
}

export function setCompareItems(items) {
  const list = Array.isArray(items) ? items : [];
  compareStore.setState(() => list);
  storageSetJSON('compare', list);
}
