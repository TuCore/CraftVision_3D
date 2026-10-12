import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/lib/product.types';

export interface CartItem extends Product {
  cartItemId: string;
  quantity: number;
  basePrice?: number;
  cardPrice?: number;
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
  stock?: number;
  isOutOfStock?: boolean;
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
    preserveQuantity?: boolean,
    customQuantity?: number
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
  syncStock: (
    statuses: Array<{
      productId: string;
      stock: number;
      isOutOfStock: boolean;
      price?: number;
    }>
  ) => void;
  isFavorite: (id: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggleFavorite: (product, hasGreeting, greetingMessage, greetingImage, senderName, receiverName, selectedTemplate, preserveQuantity, customQuantity) => set((state) => {
        const is3D = (product as any).is3D;
        const templateKey = selectedTemplate?.id ? `-tpl${selectedTemplate.id}` : '';
        const cartItemId = `${product.id}-${is3D ? '3d' : (hasGreeting ? 'nfc' : 'standard')}${templateKey}`;
        const existsIndex = state.items.findIndex((item) => 
          item.cartItemId === cartItemId || (item.id === product.id && !!item.hasGreeting === !!hasGreeting && !!(item as any).is3D === !!is3D && item.selectedTemplate?.id === selectedTemplate?.id)
        );
        
        const addQty = customQuantity !== undefined ? customQuantity : 1;
        const maxStock = (product as any).stock;

        if (existsIndex >= 0) {
          const newItems = [...state.items];
          const currentItem = newItems[existsIndex];
          const effectiveStock = maxStock ?? currentItem.stock;
          let newQty = preserveQuantity ? currentItem.quantity : currentItem.quantity + addQty;
          if (effectiveStock !== undefined && effectiveStock > 0) {
            newQty = Math.min(newQty, effectiveStock);
          }

          newItems[existsIndex] = { 
            ...currentItem, 
            ...product,
            price: product.price,
            basePrice: (product as any).basePrice ?? currentItem.basePrice,
            cardPrice: (product as any).cardPrice ?? currentItem.cardPrice,
            quantity: newQty,
            hasGreeting: hasGreeting !== undefined ? hasGreeting : currentItem.hasGreeting,
            greetingMessage: greetingMessage !== undefined ? greetingMessage : currentItem.greetingMessage,
            greetingImage: greetingImage !== undefined ? greetingImage : currentItem.greetingImage,
            senderName: senderName !== undefined ? senderName : currentItem.senderName,
            receiverName: receiverName !== undefined ? receiverName : currentItem.receiverName,
            selectedTemplate: selectedTemplate !== undefined ? selectedTemplate : currentItem.selectedTemplate,
            stock: effectiveStock
          };
          return { items: newItems };
        }

        let initialQty = addQty;
        if (maxStock !== undefined && maxStock > 0) {
          initialQty = Math.min(initialQty, maxStock);
        }

        return { items: [...state.items, { ...product, cartItemId, quantity: initialQty, hasGreeting, greetingMessage, greetingImage, senderName, receiverName, selectedTemplate, stock: maxStock }] };
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
        items: state.items.map(item => {
          if ((item.cartItemId || item.id) === id) {
            let finalQty = Math.max(1, quantity);
            if (item.stock !== undefined && item.stock > 0) {
              finalQty = Math.min(finalQty, item.stock);
            }
            return { ...item, quantity: finalQty };
          }
          return item;
        })
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
      syncStock: (statuses) => set((state) => {
        if (!statuses || statuses.length === 0) return state;
        const statusMap = new Map(statuses.map(s => [s.productId.toLowerCase(), s]));
        const updatedItems = state.items.map((item) => {
          const rawId = item.id ? item.id.replace(/-3d$/, '').toLowerCase() : '';
          const status = statusMap.get(rawId) || statusMap.get(item.id?.toLowerCase());
          if (status) {
            return {
              ...item,
              stock: status.stock,
              isOutOfStock: status.isOutOfStock,
              price: status.price !== undefined && status.price > 0 ? status.price : item.price,
            };
          }
          return item;
        });
        return { items: updatedItems };
      }),
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
