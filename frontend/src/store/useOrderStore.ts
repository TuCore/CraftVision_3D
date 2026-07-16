import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/lib/mock-products';

export interface OrderItem {
  product: Product;
  quantity: number;
  gift?: any;
  cartItemId?: string;
}

interface OrderStore {
  items: OrderItem[];
  setItems: (items: OrderItem[]) => void;
  setItem: (product: Product, quantity: number, gift?: any) => void;
  clearItems: () => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      items: [],
      setItems: (items) => set({ items }),
      setItem: (product, quantity, gift) => set({ items: [{ product, quantity, gift }] }),
      clearItems: () => set({ items: [] }),
    }),
    {
      name: 'order-storage',
    }
  )
);
