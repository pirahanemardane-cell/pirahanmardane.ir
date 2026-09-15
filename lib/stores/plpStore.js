import { createStore } from './createStore.js';

export const plpStore = createStore({
  open: false,
  sort: '',
  cats: [],
  tagFilter: [],
  q: '',
});

export function setPlpState(partial) {
  plpStore.setState((s) => ({ ...s, ...partial }));
}
