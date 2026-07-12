import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Product {
  id: string;
  productCategoryId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  supportsNfc: boolean;
  isActive: boolean;
  productType: string;
  estimatedProductionDays?: number;
  createdAt: string;
  images: { id: string; url: string; isPrimary: boolean }[];
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
      let url = `/api/products?page=${page}&size=${size}`;
      if (type) {
        url += `&type=${type}`;
      }
      const { data } = await api.get<PagedResult<Product>>(url);
      
      // Compute primaryImageUrl for convenience
      data.items = data.items.map(p => {
        const primary = p.images?.find(i => i.isPrimary) || p.images?.[0];
        return { ...p, primaryImageUrl: primary?.url || 'https://placehold.co/600x400/png' };
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
      const primary = data.images?.find(i => i.isPrimary) || data.images?.[0];
      data.primaryImageUrl = primary?.url || 'https://placehold.co/600x400/png';
      return data;
    },
    enabled: !!id,
  });
}
