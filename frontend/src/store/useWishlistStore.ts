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

export interface ToggleFavoriteOptions {
  hasGreeting?: boolean;
  greetingMessage?: string;
  greetingImage?: string;
  senderName?: string;
  receiverName?: string;
  selectedTemplate?: CartItem['selectedTemplate'];
  preserveQuantity?: boolean;
  customQuantity?: number;
  setQuantityExact?: boolean;
}

interface WishlistStore {
  items: CartItem[];
  toggleFavorite: (
    product: Product, 
    optionsOrHasGreeting?: boolean | ToggleFavoriteOptions, 
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
      toggleFavorite: (
        product, 
        optionsOrHasGreeting, 
        greetingMessage, 
        greetingImage, 
        senderName, 
        receiverName, 
        selectedTemplate, 
        preserveQuantity, 
        customQuantity
      ) => set((state) => {
        let hasGreeting: boolean | undefined;
        let finalGreetingMessage: string | undefined;
        let finalGreetingImage: string | undefined;
        let finalSenderName: string | undefined;
        let finalReceiverName: string | undefined;
        let finalSelectedTemplate: CartItem['selectedTemplate'] | undefined;
        let finalPreserveQuantity: boolean | undefined;
        let finalCustomQuantity: number | undefined;
        let finalSetQuantityExact: boolean | undefined;

        if (optionsOrHasGreeting && typeof optionsOrHasGreeting === 'object') {
          const opts = optionsOrHasGreeting as ToggleFavoriteOptions;
          hasGreeting = opts.hasGreeting;
          finalGreetingMessage = opts.greetingMessage;
          finalGreetingImage = opts.greetingImage;
          finalSenderName = opts.senderName;
          finalReceiverName = opts.receiverName;
          finalSelectedTemplate = opts.selectedTemplate;
          finalPreserveQuantity = opts.preserveQuantity;
          finalCustomQuantity = opts.customQuantity;
          finalSetQuantityExact = opts.setQuantityExact;
        } else {
          hasGreeting = optionsOrHasGreeting as boolean | undefined;
          finalGreetingMessage = greetingMessage;
          finalGreetingImage = greetingImage;
          finalSenderName = senderName;
          finalReceiverName = receiverName;
          finalSelectedTemplate = selectedTemplate;
          finalPreserveQuantity = typeof preserveQuantity === 'boolean' ? preserveQuantity : undefined;
          
          if (typeof preserveQuantity === 'number') {
            finalCustomQuantity = preserveQuantity;
            finalPreserveQuantity = false;
          } else if (typeof customQuantity === 'number') {
            finalCustomQuantity = customQuantity;
          }
        }

        const is3D = (product as any).is3D;
        const templateKey = finalSelectedTemplate?.id ? `-tpl${finalSelectedTemplate.id}` : '';
        const cartItemId = `${product.id}-${is3D ? '3d' : (hasGreeting ? 'nfc' : 'standard')}${templateKey}`;
        const existsIndex = state.items.findIndex((item) => 
          item.cartItemId === cartItemId || (item.id === product.id && !!item.hasGreeting === !!hasGreeting && !!(item as any).is3D === !!is3D && item.selectedTemplate?.id === finalSelectedTemplate?.id)
        );
        
        const addQty = finalCustomQuantity !== undefined && finalCustomQuantity > 0 ? finalCustomQuantity : 1;
        const maxStock = (product as any).stock;

        if (existsIndex >= 0) {
          const newItems = [...state.items];
          const currentItem = newItems[existsIndex];
          // Always prioritize current fresh product.stock over potentially stale stored item.stock
          const effectiveStock = maxStock !== undefined ? maxStock : currentItem.stock;
          
          let newQty: number;
          if (finalPreserveQuantity) {
            newQty = currentItem.quantity;
          } else if (finalSetQuantityExact) {
            newQty = addQty;
          } else {
            newQty = currentItem.quantity + addQty;
          }

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
            greetingMessage: finalGreetingMessage !== undefined ? finalGreetingMessage : currentItem.greetingMessage,
            greetingImage: finalGreetingImage !== undefined ? finalGreetingImage : currentItem.greetingImage,
            senderName: finalSenderName !== undefined ? finalSenderName : currentItem.senderName,
            receiverName: finalReceiverName !== undefined ? finalReceiverName : currentItem.receiverName,
            selectedTemplate: finalSelectedTemplate !== undefined ? finalSelectedTemplate : currentItem.selectedTemplate,
            stock: effectiveStock
          };
          return { items: newItems };
        }

        let initialQty = addQty;
        if (maxStock !== undefined && maxStock > 0) {
          initialQty = Math.min(initialQty, maxStock);
        }

        return { 
          items: [
            ...state.items, 
            { 
              ...product, 
              cartItemId, 
              quantity: initialQty, 
              hasGreeting, 
              greetingMessage: finalGreetingMessage, 
              greetingImage: finalGreetingImage, 
              senderName: finalSenderName, 
              receiverName: finalReceiverName, 
              selectedTemplate: finalSelectedTemplate, 
              stock: maxStock 
            }
          ] 
        };
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
            let itemQty = item.quantity || 1;
            if (!status.isOutOfStock && status.stock > 0 && itemQty > status.stock) {
              itemQty = status.stock;
            }
            return {
              ...item,
              stock: status.stock,
              quantity: itemQty,
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
