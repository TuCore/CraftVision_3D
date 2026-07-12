import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PreOrderState {
  productId: string | null;
  threeDPrompt: string;
  threeDModelUrl: string | null;
  previewImageUrl: string | null;
  taskId: string | null;
  nfcMediaId: string | null;
  nfcMediaUrl: string | null;
  giftMessage: string;
  senderName: string;
  receiverName: string;
  setProductId: (id: string) => void;
  setThreeDData: (prompt: string, modelUrl: string, previewUrl: string, taskId: string) => void;
  setNfcMedia: (id: string, url: string) => void;
  setGiftDetails: (message: string, sender: string, receiver: string) => void;
  resetPreOrder: () => void;
}

export const usePreOrderStore = create<PreOrderState>()(
  persist(
    (set) => ({
      productId: null,
      threeDPrompt: '',
      threeDModelUrl: null,
      previewImageUrl: null,
      taskId: null,
      nfcMediaId: null,
      nfcMediaUrl: null,
      giftMessage: '',
      senderName: '',
      receiverName: '',
      setProductId: (id) => set({ productId: id }),
      setThreeDData: (prompt, modelUrl, previewUrl, taskId) =>
        set({ threeDPrompt: prompt, threeDModelUrl: modelUrl, previewImageUrl: previewUrl, taskId }),
      setNfcMedia: (id, url) => set({ nfcMediaId: id, nfcMediaUrl: url }),
      setGiftDetails: (message, sender, receiver) =>
        set({ giftMessage: message, senderName: sender, receiverName: receiver }),
      resetPreOrder: () =>
        set({
          productId: null,
          threeDPrompt: '',
          threeDModelUrl: null,
          previewImageUrl: null,
          taskId: null,
          nfcMediaId: null,
          nfcMediaUrl: null,
          giftMessage: '',
          senderName: '',
          receiverName: '',
        }),
    }),
    {
      name: 'preorder-storage',
    }
  )
);
