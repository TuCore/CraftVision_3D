import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/lib/mock-products';

export interface CartItem extends Product {
  cartItemId: string;
  quantity: number;
  hasGreeting?: boolean;
  greetingMessage?: string;
  greetingImage?: string;
  senderName?: string;
  receiverName?: string;
}

interface WishlistStore {
  items: CartItem[];
  toggleFavorite: (product: Product, hasGreeting?: boolean, greetingMessage?: string, greetingImage?: string, senderName?: string, receiverName?: string) => void;
  removeFromCart: (cartItemIdOrId: string) => void;
  updateQuantity: (cartItemIdOrId: string, quantity: number) => void;
  updateGreeting: (cartItemIdOrId: string, hasGreeting: boolean, greetingMessage?: string, greetingImage?: string, senderName?: string, receiverName?: string) => void;
  isFavorite: (id: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggleFavorite: (product, hasGreeting, greetingMessage, greetingImage, senderName, receiverName) => set((state) => {
        const cartItemId = `${product.id}-${hasGreeting ? 'nfc' : 'standard'}`;
        const existsIndex = state.items.findIndex((item) => 
          item.cartItemId === cartItemId || (item.id === product.id && !!item.hasGreeting === !!hasGreeting)
        );
        
        if (existsIndex >= 0) {
          const newItems = [...state.items];
          newItems[existsIndex] = { 
            ...newItems[existsIndex], 
            quantity: newItems[existsIndex].quantity + 1,
            hasGreeting: hasGreeting !== undefined ? hasGreeting : newItems[existsIndex].hasGreeting,
            greetingMessage: greetingMessage !== undefined ? greetingMessage : newItems[existsIndex].greetingMessage,
            greetingImage: greetingImage !== undefined ? greetingImage : newItems[existsIndex].greetingImage,
            senderName: senderName !== undefined ? senderName : newItems[existsIndex].senderName,
            receiverName: receiverName !== undefined ? receiverName : newItems[existsIndex].receiverName
          };
          return { items: newItems };
        }
        return { items: [...state.items, { ...product, cartItemId, quantity: 1, hasGreeting, greetingMessage, greetingImage, senderName, receiverName }] };
      }),
      removeFromCart: (id) => set((state) => ({
        items: state.items.filter(item => (item.cartItemId || item.id) !== id)
      })),
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map(item => 
          (item.cartItemId || item.id) === id ? { ...item, quantity: Math.max(1, quantity) } : item
        )
      })),
      updateGreeting: (id, hasGreeting, greetingMessage, greetingImage, senderName, receiverName) => set((state) => ({
        items: state.items.map(item => 
          (item.cartItemId || item.id) === id ? { ...item, hasGreeting, greetingMessage, greetingImage, senderName, receiverName } : item
        )
      })),
      isFavorite: (id) => get().items.some((item) => item.id === id),
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'craftvision-wishlist',
    }
  )
);
