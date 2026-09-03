'use client';

import { useCallback } from 'react';
import { useStore } from './useStore.js';

/** جایگزین drop-in برای useState روی یک کلید استور */
export function useStoreField(store, key) {
  const value = useStore(store, (s) => s[key]);
  const setValue = useCallback((updater) => {
    store.setState((s) => {
      const prev = s[key];
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (Object.is(prev, next)) return s;
      return { ...s, [key]: next };
    });
  }, [store, key]);
  return [value, setValue];
}
