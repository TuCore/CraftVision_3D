import { create } from 'zustand';
import { Product } from '@/lib/mock-products';

export interface OrderItem {
  product: Product;
  quantity: number;
  gift?: any;
}

interface OrderStore {
  item: OrderItem | null;
  setItem: (product: Product, quantity: number, gift?: any) => void;
  updateQuantity: (quantity: number) => void;
  clearItem: () => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
  item: null,
  setItem: (product, quantity, gift) => set({ item: { product, quantity, gift } }),
  updateQuantity: (quantity) => set((state) => ({
    item: state.item ? { ...state.item, quantity } : null
  })),
  clearItem: () => set({ item: null }),
}));
