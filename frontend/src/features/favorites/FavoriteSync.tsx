"use client";

import { useEffect } from "react";
import { AUTH_SESSION_EVENT } from "@/lib/authSession";
import { useFavoriteStore } from "@/store/useFavoriteStore";

export function FavoriteSync() {
  const syncFavorites = useFavoriteStore((state) => state.syncFavorites);
  useEffect(() => {
    const sync = () => { void syncFavorites(); };
    const onVisible = () => { if (document.visibilityState === "visible") sync(); };
    sync();
    window.addEventListener(AUTH_SESSION_EVENT, sync);
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener(AUTH_SESSION_EVENT, sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [syncFavorites]);
  return null;
}
