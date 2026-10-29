import type { StateCreator } from "zustand";

export interface FavoritesApi {
  list(token: string): Promise<string[]>;
  add(productId: string, token: string): Promise<void>;
  remove(productId: string, token: string): Promise<void>;
}

export interface FavoriteStore {
  favoriteIds: string[];
  pendingIds: string[];
  hasSession: boolean;
  isLoading: boolean;
  hasLoaded: boolean;
  loadError: boolean;
  syncFavorites(): Promise<void>;
  toggleFavorite(productId: string): Promise<void>;
  isFavorite(productId: string): boolean;
}

export function createFavoriteState(api: FavoritesApi, getToken: () => string | null): StateCreator<FavoriteStore> {
  return (set, get) => {
    let activeToken: string | null = null;
    let generation = 0;
    let loadPromise: Promise<void> | null = null;

    return {
      favoriteIds: [], pendingIds: [], hasSession: false,
      isLoading: false, hasLoaded: false, loadError: false,
      isFavorite: (productId) => get().favoriteIds.includes(productId),

      syncFavorites: async () => {
        const token = getToken();
        if (token !== activeToken) {
          activeToken = token;
          generation++;
          loadPromise = null;
          set({ favoriteIds: [], pendingIds: [], hasSession: !!token, isLoading: false, hasLoaded: false, loadError: false });
        }
        if (!token || get().pendingIds.length) return;
        if (loadPromise) return loadPromise;

        const requestGeneration = generation;
        const isCurrent = () => generation === requestGeneration && token === getToken();
        set({ isLoading: true, loadError: false });
        loadPromise = (async () => {
          try {
            const ids = await api.list(token);
            if (isCurrent()) set({ favoriteIds: [...new Set(ids)], hasLoaded: true });
          } catch {
            if (isCurrent()) set({ loadError: true });
          } finally {
            if (generation === requestGeneration) {
              loadPromise = null;
              set({ isLoading: false });
            }
          }
        })();
        return loadPromise;
      },

      toggleFavorite: async (productId) => {
        const token = getToken();
        if (!token || token !== activeToken) {
          await get().syncFavorites();
          return;
        }
        if (!get().hasLoaded || get().isLoading || get().pendingIds.includes(productId)) return;

        const requestGeneration = generation;
        const wasFavorite = get().favoriteIds.includes(productId);
        const isCurrent = () => generation === requestGeneration && token === getToken();
        set((state) => ({ pendingIds: [...state.pendingIds, productId] }));
        try {
          if (wasFavorite) await api.remove(productId, token);
          else await api.add(productId, token);
          if (isCurrent()) {
            set((state) => ({ favoriteIds: wasFavorite
              ? state.favoriteIds.filter((id) => id !== productId)
              : [...new Set([...state.favoriteIds, productId])] }));
          }
        } catch (error) {
          if (isCurrent()) throw error;
        } finally {
          if (isCurrent()) set((state) => ({ pendingIds: state.pendingIds.filter((id) => id !== productId) }));
        }
      },
    };
  };
}
