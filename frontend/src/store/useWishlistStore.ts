import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/lib/product.types';

export interface CartItem extends Product {
  cartItemId: string;
  quantity: number;
  hasGreeting?: boolean;
  greetingMessage?: string;
  greetingImage?: string;
  senderName?: string;
  receiverName?: string;
  selectedTemplate?: {
    id: number;
    title: string;
    image: string;
    price: number;
    originalPrice?: number;
    discount?: number;
  };
}

interface WishlistStore {
  items: CartItem[];
  toggleFavorite: (
    product: Product, 
    hasGreeting?: boolean, 
    greetingMessage?: string, 
    greetingImage?: string, 
    senderName?: string, 
    receiverName?: string,
    selectedTemplate?: CartItem['selectedTemplate'],
    preserveQuantity?: boolean
  ) => void;
  updateCartItem: (
    cartItemIdOrId: string,
    updates: Partial<CartItem>
  ) => void;
  removeFromCart: (cartItemIdOrId: string) => void;
  updateQuantity: (cartItemIdOrId: string, quantity: number) => void;
  updateGreeting: (
    cartItemIdOrId: string, 
    hasGreeting: boolean, 
    greetingMessage?: string, 
    greetingImage?: string, 
    senderName?: string, 
    receiverName?: string,
    selectedTemplate?: CartItem['selectedTemplate']
  ) => void;
  isFavorite: (id: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggleFavorite: (product, hasGreeting, greetingMessage, greetingImage, senderName, receiverName, selectedTemplate, preserveQuantity) => set((state) => {
        const is3D = (product as any).is3D;
        const templateKey = selectedTemplate?.id ? `-tpl${selectedTemplate.id}` : '';
        const cartItemId = `${product.id}-${is3D ? '3d' : (hasGreeting ? 'nfc' : 'standard')}${templateKey}`;
        const existsIndex = state.items.findIndex((item) => 
          item.cartItemId === cartItemId || (item.id === product.id && !!item.hasGreeting === !!hasGreeting && !!(item as any).is3D === !!is3D && item.selectedTemplate?.id === selectedTemplate?.id)
        );
        
        if (existsIndex >= 0) {
          const newItems = [...state.items];
          newItems[existsIndex] = { 
            ...newItems[existsIndex], 
            quantity: preserveQuantity ? newItems[existsIndex].quantity : newItems[existsIndex].quantity + 1,
            hasGreeting: hasGreeting !== undefined ? hasGreeting : newItems[existsIndex].hasGreeting,
            greetingMessage: greetingMessage !== undefined ? greetingMessage : newItems[existsIndex].greetingMessage,
            greetingImage: greetingImage !== undefined ? greetingImage : newItems[existsIndex].greetingImage,
            senderName: senderName !== undefined ? senderName : newItems[existsIndex].senderName,
            receiverName: receiverName !== undefined ? receiverName : newItems[existsIndex].receiverName,
            selectedTemplate: selectedTemplate !== undefined ? selectedTemplate : newItems[existsIndex].selectedTemplate
          };
          return { items: newItems };
        }
        return { items: [...state.items, { ...product, cartItemId, quantity: 1, hasGreeting, greetingMessage, greetingImage, senderName, receiverName, selectedTemplate }] };
      }),
      updateCartItem: (cartItemIdOrId, updates) => set((state) => ({
        items: state.items.map((item) => {
          if ((item.cartItemId || item.id) === cartItemIdOrId) {
            return {
              ...item,
              ...updates,
              cartItemId: updates.cartItemId || item.cartItemId,
              quantity: updates.quantity !== undefined ? updates.quantity : item.quantity,
            };
          }
          return item;
        }),
      })),
      removeFromCart: (id) => set((state) => ({
        items: state.items.filter(item => (item.cartItemId || item.id) !== id)
      })),
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map(item => 
          (item.cartItemId || item.id) === id ? { ...item, quantity: Math.max(1, quantity) } : item
        )
      })),
      updateGreeting: (id, hasGreeting, greetingMessage, greetingImage, senderName, receiverName, selectedTemplate) => set((state) => ({
        items: state.items.map(item => 
          (item.cartItemId || item.id) === id ? { 
            ...item, 
            hasGreeting, 
            greetingMessage, 
            greetingImage, 
            senderName, 
            receiverName,
            selectedTemplate: selectedTemplate !== undefined ? selectedTemplate : item.selectedTemplate
          } : item
        )
      })),
      isFavorite: (id) => get().items.some((item) => item.id === id),
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'craftvision-wishlist',
      version: 1,
      migrate: (persistedState: any) => {
        if (!persistedState || !Array.isArray(persistedState.items)) {
          return { items: [] };
        }
        return persistedState as WishlistStore;
      },
    }
  )
);
