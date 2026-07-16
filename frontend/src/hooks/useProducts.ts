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
      
      // Compute primaryImageUrl for convenience
      data.items = data.items.map(p => {
        return { ...p, primaryImageUrl: p.sampleImageUrl || p.thumbnailUrl || (p.images && p.images[0]) || 'https://placehold.co/600x400/png' };
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
      data.primaryImageUrl = data.sampleImageUrl || data.thumbnailUrl || (data.images && data.images[0]) || 'https://placehold.co/600x400/png';
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
