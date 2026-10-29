"use client";

import { useCallback, useSyncExternalStore } from "react";

type PersistedStore = {
  persist: {
    hasHydrated(): boolean;
    onHydrate(listener: () => void): () => void;
    onFinishHydration(listener: () => void): () => void;
  };
};

export function useStoreHydration(store: PersistedStore) {
  const subscribe = useCallback((notify: () => void) => {
    const stopStart = store.persist.onHydrate(notify);
    const stopFinish = store.persist.onFinishHydration(notify);
    return () => { stopStart(); stopFinish(); };
  }, [store]);
  return useSyncExternalStore(subscribe, store.persist.hasHydrated, () => false);
}
