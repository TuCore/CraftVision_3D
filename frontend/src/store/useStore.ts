import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AiGiftDto {
  recipientName: string;
  relationship: string;
  occasion: string;
  writingStyle: string;
  language: string;
  length: string;
  emojiLevel: string;
  sharedMemories: string;
  thingsToMention: string[];
  thingsToAvoid: string[];
}

export interface GiftSummaryDto {
  giftTitle: string;
  senderName: string;
  receiverName: string;
  message: string;
  messageSource: string;
  theme: string;
  threeDModelUrl: string | null;
  previewImageUrl: string | null;
  threeDModelType: string;
  mediaFileIds: string[];
}

interface PreOrderState {
  productId: string | null;
  aiGiftData: AiGiftDto;
  finalGiftData: GiftSummaryDto | null;
  setProductId: (id: string) => void;
  setAiGiftData: (data: Partial<AiGiftDto>) => void;
  setFinalGiftData: (data: GiftSummaryDto) => void;
  resetPreOrder: () => void;
}

const initialAiGiftData: AiGiftDto = {
  recipientName: '',
  relationship: 'lover',
  occasion: 'birthday',
  writingStyle: 'romantic',
  language: 'vi',
  length: 'medium',
  emojiLevel: 'low',
  sharedMemories: '',
  thingsToMention: [],
  thingsToAvoid: []
};

export const usePreOrderStore = create<PreOrderState>()(
  persist(
    (set) => ({
      productId: null,
      aiGiftData: initialAiGiftData,
      finalGiftData: null,
      setProductId: (id) => set({ productId: id }),
      setAiGiftData: (data) => set((state) => ({ aiGiftData: { ...state.aiGiftData, ...data } })),
      setFinalGiftData: (data) => set({ finalGiftData: data }),
      resetPreOrder: () =>
        set({
          productId: null,
          aiGiftData: initialAiGiftData,
          finalGiftData: null,
        }),
    }),
    {
      name: 'preorder-storage',
    }
  )
);
