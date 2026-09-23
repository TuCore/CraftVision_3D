import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoriteStore {
  favoriteIds: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
}

export const useFavoriteStore = create<FavoriteStore>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      toggleFavorite: (productId) => set((state) => {
        if (state.favoriteIds.includes(productId)) {
          return { favoriteIds: state.favoriteIds.filter(id => id !== productId) };
        }
        return { favoriteIds: [...state.favoriteIds, productId] };
      }),
      isFavorite: (productId) => get().favoriteIds.includes(productId),
    }),
    {
      name: 'favorite-storage',
    }
  )
);
