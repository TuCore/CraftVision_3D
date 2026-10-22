import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/lib/product.types';
import api from '@/lib/api';
import { getAccessToken } from '@/lib/authSession';

const syncItemToBackend = (productId: string, quantity: number, selectedOptions?: any) => {
  if (typeof window === 'undefined') return;
  const token = getAccessToken();
  if (!token) return;
  const cleanId = (productId || '').replace(/-3d$/, '');
  const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
  if (!isGuid) return;
  api.post('/api/cart/items', {
    productId: cleanId,
    quantity,
    selectedOptions: selectedOptions ? JSON.stringify(selectedOptions) : ''
  }).catch((e) => console.warn('Could not sync cart item to backend:', e));
};

const removeItemFromBackend = (cartItemIdOrProductId: string) => {
  if (typeof window === 'undefined') return;
  const token = getAccessToken();
  if (!token) return;
  const match = (cartItemIdOrProductId || '').match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  if (!match) return;
  const cleanId = match[0];
  api.delete(`/api/cart/items/${cleanId}`).catch((e) => console.warn('Could not remove cart item from backend:', e));
};

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
  cardSlug?: string;
  cardType?: 'none' | 'default' | 'web_library_3d';
  originalCardPrice?: number;
  discountedCardPrice?: number;
  isCardTemplate?: boolean;
  draftValues?: Record<string, import('@/features/cards/catalog').CardValue>;
  selectedTemplate?: {
    id: number;
    slug?: string;
    title: string;
    image: string;
    price: number;
    is3D?: boolean;
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
  cardSlug?: string;
  cardType?: CartItem['cardType'];
  originalCardPrice?: number;
  discountedCardPrice?: number;
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
        let finalCardSlug: string | undefined;
        let finalCardType: CartItem['cardType'] | undefined;
        let finalOriginalCardPrice: number | undefined;
        let finalDiscountedCardPrice: number | undefined;
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
          finalCardSlug = opts.cardSlug;
          finalCardType = opts.cardType;
          finalOriginalCardPrice = opts.originalCardPrice;
          finalDiscountedCardPrice = opts.discountedCardPrice;
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
            cardSlug: finalCardSlug !== undefined ? finalCardSlug : currentItem.cardSlug,
            cardType: finalCardType !== undefined ? finalCardType : currentItem.cardType,
            originalCardPrice: finalOriginalCardPrice !== undefined ? finalOriginalCardPrice : currentItem.originalCardPrice,
            discountedCardPrice: finalDiscountedCardPrice !== undefined ? finalDiscountedCardPrice : currentItem.discountedCardPrice,
            selectedTemplate: finalSelectedTemplate !== undefined ? finalSelectedTemplate : currentItem.selectedTemplate,
            stock: effectiveStock
          };
          syncItemToBackend(product.id, newQty, { hasGreeting, selectedTemplate: finalSelectedTemplate });
          return { items: newItems };
        }

        let initialQty = addQty;
        if (maxStock !== undefined && maxStock > 0) {
          initialQty = Math.min(initialQty, maxStock);
        }

        syncItemToBackend(product.id, initialQty, { hasGreeting, selectedTemplate: finalSelectedTemplate });

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
              cardSlug: finalCardSlug,
              cardType: finalCardType,
              originalCardPrice: finalOriginalCardPrice,
              discountedCardPrice: finalDiscountedCardPrice,
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
      removeFromCart: (id) => {
        const itemToRemove = get().items.find(item => (item.cartItemId || item.id) === id || item.id === id || item.cartItemId === id);
        if (itemToRemove) {
          const deleteKey = itemToRemove.id || itemToRemove.cartItemId || id;
          removeItemFromBackend(deleteKey);
        } else {
          removeItemFromBackend(id);
        }
        set((state) => ({
          items: state.items.filter(item => (item.cartItemId || item.id) !== id && item.id !== id && item.cartItemId !== id)
        }));
      },
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(id);
          return;
        }
        set((state) => ({
          items: state.items.map(item => {
            if ((item.cartItemId || item.id) === id || item.id === id || item.cartItemId === id) {
              let finalQty = Math.max(1, quantity);
              if (item.stock !== undefined && item.stock > 0) {
                finalQty = Math.min(finalQty, item.stock);
              }
              syncItemToBackend(item.id, finalQty, { hasGreeting: item.hasGreeting, selectedTemplate: item.selectedTemplate });
              return { ...item, quantity: finalQty };
            }
            return item;
          })
        }));
      },
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
          const rawId = ((item as any).productId || item.id || '').replace(/-3d$/, '').toLowerCase();
          const status = statusMap.get(rawId) || statusMap.get(item.id?.toLowerCase());
          if (status) {
            const isOutOfStock = status.isOutOfStock === true || status.stock <= 0;
            let itemQty = item.quantity || 1;
            if (!isOutOfStock && status.stock > 0 && itemQty > status.stock) {
              itemQty = status.stock;
            }
            return {
              ...item,
              stock: status.stock,
              quantity: itemQty,
              isOutOfStock: isOutOfStock,
              price: status.price !== undefined && status.price > 0 ? status.price : item.price,
            };
          }
          return item;
        });
        return { items: updatedItems };
      }),
      isFavorite: (id) => get().items.some((item) => item.id === id),
      clearWishlist: () => {
        if (getAccessToken()) {
          api.delete('/api/cart').catch(() => {});
        }
        set({ items: [] });
      },
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
