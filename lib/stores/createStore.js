/** استور سبک دامنه با subscribe — بدون Redux */
export function createStore(initialState) {
  let state = typeof initialState === 'function' ? initialState() : initialState;
  const listeners = new Set();

  return {
    getState: () => state,
    setState: (partial) => {
      const next = typeof partial === 'function' ? partial(state) : { ...state, ...partial };
      state = next;
      listeners.forEach((l) => {
        try { l(state); } catch (_) {}
      });
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    reset: () => {
      state = typeof initialState === 'function' ? initialState() : initialState;
      listeners.forEach((l) => {
        try { l(state); } catch (_) {}
      });
    },
  };
}
