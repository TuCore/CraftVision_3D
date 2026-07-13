import { create } from 'zustand';

export interface GreetingMetadata {
  model: string;
  promptVersion: string;
  generationTimeMs: number;
  qualityScore: number;
  qualityLabel: string;
}

export interface GreetingResult {
  message: string;
  metadata: GreetingMetadata;
}

export interface GreetingState {
  // Form State
  tone: string;
  occasion: string;
  recipientTrait: string;
  messageLength: string;
  giftType: string;
  visualStyle: string;
  senderName: string;
  receiverName: string;
  specialMemory: string;
  giftTitle: string;
  
  // App State
  status: 'idle' | 'generating' | 'completed' | 'error';
  error: string | null;
  result: GreetingResult | null;
  
  // Actions
  setField: (field: keyof GreetingState, value: string) => void;
  setStatus: (status: GreetingState['status'], error?: string | null) => void;
  setResult: (result: GreetingResult) => void;
  reset: () => void;
}

export const useGreetingStore = create<GreetingState>((set) => ({
  tone: '',
  occasion: '',
  recipientTrait: '',
  messageLength: '',
  giftType: '',
  visualStyle: '',
  senderName: '',
  receiverName: '',
  specialMemory: '',
  giftTitle: '',
  
  status: 'idle',
  error: null,
  result: null,
  
  setField: (field, value) => set((state) => ({ ...state, [field]: value })),
  setStatus: (status, error = null) => set({ status, error }),
  setResult: (result) => set({ result, status: 'completed' }),
  reset: () => set({ 
    status: 'idle', 
    error: null, 
    result: null,
    tone: '', occasion: '', recipientTrait: '', messageLength: '',
    giftType: '', visualStyle: '', senderName: '', receiverName: '', specialMemory: '', giftTitle: ''
  })
}));
