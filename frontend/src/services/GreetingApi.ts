import api from '../lib/api';
import { GreetingResult } from '../store/useGreetingStore';

export interface GreetingRequestDto {
  tone: string;
  occasion: string;
  length: string;
  recipientTrait: string;
  giftType: string;
  visualStyle: string;
  senderName: string;
  receiverName: string;
  specialMemory: string;
}

export const GreetingApi = {
  generate: async (data: GreetingRequestDto): Promise<GreetingResult> => {
    const response = await api.post<GreetingResult>('/api/ai/greetings/generate', data);
    return response.data;
  },

  // Mocked for future implementation
  regenerate: async (data: GreetingRequestDto): Promise<GreetingResult> => {
    const response = await api.post<GreetingResult>('/api/ai/greetings/generate', data);
    return response.data;
  },

  history: async () => {
    // TODO: Connect to backend history API when ready
    console.warn('History API is not implemented on backend yet.');
    return [];
  },

  save: async (id: string, isFavorite: boolean) => {
    // TODO: Connect to backend save/favorite API
    console.warn('Save API is not implemented on backend yet.');
    return { id, isFavorite };
  }
};
