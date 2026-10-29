import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Product } from '@/lib/product.types';
import { commerceStorage } from '@/lib/commerceStorage';

export interface OrderGift {
  giftTitle?: string;
  templateTitle?: string;
  cardSlug?: string;
  cardPrice?: number;
  originalCardPrice?: number;
  senderName?: string;
  receiverName?: string;
  message?: string;
  messageSource?: string;
  theme?: string;
  threeDModelUrl?: string | null;
  previewImageUrl?: string | null;
  threeDModelType?: string;
  mediaFileIds?: string[];
  [key: string]: unknown;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  gift?: OrderGift | null;
  cartItemId?: string;
  cardSlug?: string;
  cardPrice?: number;
  hasGreeting?: boolean;
}

interface OrderStore {
  items: OrderItem[];
  orderNote?: string;
  setItems: (items: OrderItem[]) => void;
  setItem: (product: Product, quantity: number, gift?: any) => void;
  setOrderNote: (note: string) => void;
  clearItems: () => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      items: [],
      orderNote: '',
      setItems: (items) => set({ items }),
      setItem: (product, quantity, gift) => set({ items: [{ product, quantity, gift }] }),
      setOrderNote: (note) => set({ orderNote: note }),
      clearItems: () => set({ items: [], orderNote: '' }),
    }),
    {
      name: 'order-storage',
      storage: createJSONStorage(() => commerceStorage),
      version: 2,
    }
  )
);
