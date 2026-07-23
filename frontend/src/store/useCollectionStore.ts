import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CollectionItem {
  id: string;
  title: string;
  modelUrl: string;
  createdAt: number;
}

interface CollectionState {
  items: CollectionItem[];
  saveItem: (item: Omit<CollectionItem, 'id' | 'createdAt'>) => void;
  removeItem: (id: string) => void;
}

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set) => ({
      items: [],
      saveItem: (item) => set((state) => {
        // Prevent duplicate saves of the same model URL
        if (state.items.find(i => i.modelUrl === item.modelUrl)) {
          return state;
        }
        const newItem: CollectionItem = {
          ...item,
          id: Math.random().toString(36).substring(7),
          createdAt: Date.now(),
        };
        return { items: [newItem, ...state.items] };
      }),
      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id)
      })),
    }),
    {
      name: 'collection-storage',
    }
  )
);
