import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CreateReviewDto {
  productId: string;
  rating: number;
  comment: string;
}

export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const { data } = await api.get<Review[]>(`/api/products/${productId}/reviews`);
      return data;
    },
    enabled: !!productId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateReviewDto) => {
      const res = await api.post('/api/reviews', dto);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.productId] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reviewId: string) => {
      await api.delete(`/api/reviews/${reviewId}`);
    },
    onSuccess: (_, reviewId) => {
      // Invalidate all reviews or a specific one if we had the productId, 
      // but since we only have reviewId, we can invalidate all reviews queries to be safe.
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    }
  });
}
