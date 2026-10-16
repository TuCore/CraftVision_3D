import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/lib/product.types';

export interface OrderItem {
  product: Product;
  quantity: number;
  gift?: any;
  cartItemId?: string;
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
      version: 2,
    }
  )
);
