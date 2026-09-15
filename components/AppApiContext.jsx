'use client';

import { createContext, useContext, useRef, useMemo } from 'react';

const AppApiContext = createContext(null);

/** Provider با ref تا بدون تغییر identity همهٔ bindingهای App در دسترس پنل‌ها باشد */
export function AppApiProvider({ value, children }) {
  const ref = useRef(value);
  ref.current = value;
  // version bump each parent render so consumers that read ref.current still paint with parent
  const bundle = useMemo(() => ({ get: () => ref.current }), [value]);
  return (
    <AppApiContext.Provider value={bundle}>
      {children}
    </AppApiContext.Provider>
  );
}

export function useAppApi() {
  const bundle = useContext(AppApiContext);
  if (!bundle) {
    throw new Error('useAppApi must be used within AppApiProvider');
  }
  return bundle.get() || {};
}
