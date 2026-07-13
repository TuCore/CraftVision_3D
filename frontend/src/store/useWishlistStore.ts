import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/lib/mock-products';

interface WishlistStore {
  items: Product[];
  toggleFavorite: (product: Product) => void;
  isFavorite: (id: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggleFavorite: (product) => set((state) => {
        const exists = state.items.some((item) => item.id === product.id);
        if (exists) {
          return { items: state.items.filter((item) => item.id !== product.id) };
        }
        return { items: [...state.items, product] };
      }),
      isFavorite: (id) => get().items.some((item) => item.id === id),
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'craftvision-wishlist',
    }
  )
);
