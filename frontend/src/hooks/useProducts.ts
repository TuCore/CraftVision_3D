import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Product {
  id: string;
  name: string;
  sku?: string;
  description?: string;
  price: number;
  stock: number;
  thumbnailUrl?: string;
  sampleImageUrl?: string;
  images: string[];
  productType: string;
  supportsNfc: boolean;
  estimatedProductionDays?: number;
  categoryName?: string;
  productCategoryId?: string;
  primaryImageUrl?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function useProducts(page = 1, size = 12, type?: string) {
  return useQuery({
    queryKey: ['products', page, size, type],
    queryFn: async () => {
      let url = `/api/products?page=${page}&pageSize=${size}`;
      if (type) {
        url += `&type=${type}`;
      }
      const { data } = await api.get<PagedResult<Product>>(url);
      
      // Compute images and primaryImageUrl for convenience
      data.items = data.items.map(p => {
        const parsedImages = p.sampleImageUrl ? p.sampleImageUrl.split(',') : (p.images || []);
        const primary = parsedImages.length > 0 ? parsedImages[0] : (p.thumbnailUrl || 'https://placehold.co/600x400/png');
        return { ...p, images: parsedImages, primaryImageUrl: primary };
      });
      
      return data;
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get<Product>(`/api/products/${id}`);
      const parsedImages = data.sampleImageUrl ? data.sampleImageUrl.split(',') : (data.images || []);
      data.images = parsedImages;
      data.primaryImageUrl = parsedImages.length > 0 ? parsedImages[0] : (data.thumbnailUrl || 'https://placehold.co/600x400/png');
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Product>) => {
      const res = await api.post('/api/products', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Product> }) => {
      const res = await api.put(`/api/products/${id}`, data);
      return res.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/api/products/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
