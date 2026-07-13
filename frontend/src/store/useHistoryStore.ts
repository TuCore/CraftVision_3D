import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GreetingResult } from './useGreetingStore';

export interface HistoryItem {
  id: string;
  date: string;
  context: {
    occasion: string;
    tone: string;
    recipientTrait: string;
    giftType: string;
  };
  result: GreetingResult;
  isFavorite: boolean;
}

interface HistoryState {
  history: HistoryItem[];
  addToHistory: (item: Omit<HistoryItem, 'id' | 'date' | 'isFavorite'>) => void;
  toggleFavorite: (id: string) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      history: [],
      addToHistory: (item) => set((state) => {
        const newItem: HistoryItem = {
          ...item,
          id: Math.random().toString(36).substring(7),
          date: new Date().toISOString(),
          isFavorite: false
        };
        return { history: [newItem, ...state.history].slice(0, 50) }; // Keep last 50
      }),
      toggleFavorite: (id) => set((state) => ({
        history: state.history.map(item => 
          item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
        )
      })),
      clearHistory: () => set({ history: [] })
    }),
    {
      name: 'greeting-history-storage'
    }
  )
);
