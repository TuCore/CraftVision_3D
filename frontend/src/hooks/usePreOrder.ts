import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

export function useGenerate3DPrompt() {
  return useMutation({
    mutationFn: async (payload: { categoryId: string; designPrompt: string }) => {
      // Mocking AI draft prompt
      await new Promise(r => setTimeout(r, 1500));
      return { prompt: `A detailed 3D model of ${payload.designPrompt}, high quality, realistic lighting` };
    },
  });
}

// Giả lập Tripo AI Generate - Trong thực tế sẽ gọi Tripo API từ Backend
export function useGenerate3DModel() {
  return useMutation({
    mutationFn: async (prompt: string) => {
      // Mocking Tripo generation
      await new Promise(r => setTimeout(r, 3000));
      return { 
        taskId: 'mock-task-id', 
        status: 'success', 
        modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Embedded/Duck.gltf'
      };
    },
  });
}

export function useUploadMedia() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data; // returns { fileId, fileUrl }
    },
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/api/orders', payload);
      return data;
    },
  });
}
