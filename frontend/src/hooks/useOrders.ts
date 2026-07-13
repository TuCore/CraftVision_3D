import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Order {
  id: string;
  orderCode: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  receiverName: string;
  createdAt: string;
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

export function useOrders(page = 1, size = 10) {
  return useQuery({
    queryKey: ['orders', page, size],
    queryFn: async () => {
      const { data } = await api.get<PagedResult<Order>>(`/api/orders?page=${page}&size=${size}`);
      return data;
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.patch(`/api/orders/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useOrderDetails(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      // Assuming GET /api/orders/{id} exists
      const { data } = await api.get(`/api/orders/${id}`);
      return data;
    },
    enabled: !!id,
  });
}
