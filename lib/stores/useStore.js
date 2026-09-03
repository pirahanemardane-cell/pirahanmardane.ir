'use client';

import { useSyncExternalStore, useCallback } from 'react';

export function useStore(store, selector = (s) => s) {
  const subscribe = useCallback((onStoreChange) => store.subscribe(onStoreChange), [store]);
  const getSnapshot = useCallback(() => selector(store.getState()), [store, selector]);
  const getServerSnapshot = useCallback(() => selector(store.getState()), [store, selector]);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
