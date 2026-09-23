import React, { useState, useEffect } from 'react';
import { useProductReviews, useDeleteReview } from '@/hooks/useReviews';
import { Star, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ReviewModal } from './ReviewModal';
import { useSearchParams } from 'next/navigation';

interface ReviewListProps {
  productId: string;
  productName?: string;
}

export function ReviewList({ productId, productName = "Sản phẩm" }: ReviewListProps) {
  const { data: reviews, isLoading, isError } = useProductReviews(productId);
  const { mutate: deleteReview } = useDeleteReview();
  const searchParams = useSearchParams();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUserId(localStorage.getItem('userId'));
    }
    if (searchParams.get('review') === 'true') {
      setIsReviewModalOpen(true);
    }
  }, [searchParams]);

  if (isLoading) return <div className="py-4 text-gray-500">Đang tải đánh giá...</div>;
  if (isError) return <div className="py-4 text-red-500">Lỗi khi tải đánh giá.</div>;
  return (
    <div className="space-y-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Đánh giá từ khách hàng</h3>
        <button 
          onClick={() => setIsReviewModalOpen(!isReviewModalOpen)}
          className="border border-black text-black bg-white hover:bg-gray-50 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
        >
          {isReviewModalOpen ? 'Đóng' : 'Viết đánh giá'}
        </button>
      </div>
      
      {isReviewModalOpen && (
        <ReviewModal 
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          productId={productId}
          productName={productName}
        />
      )}
      
      {(!reviews || reviews.length === 0) ? (
        <div className="py-4 text-gray-500">Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên đánh giá!</div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {review.userAvatarUrl ? (
                  <img src={review.userAvatarUrl} alt={review.userName} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                    {review.userName.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm">{review.userName}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: vi })}
                  </p>
                </div>
              </div>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            </div>
            <div className="mt-2">
              <div className="flex justify-between items-start">
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{review.comment}</p>
                {currentUserId === review.userId && (
                  <button
                    onClick={() => {
                      if (confirm('Bạn có chắc muốn xóa đánh giá này?')) {
                        deleteReview(review.id);
                      }
                    }}
                    className="text-red-500 hover:text-red-700 p-1 shrink-0 ml-4"
                    title="Xóa đánh giá"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {review.imageUrl && (
                <div className="mt-3">
                  <a href={review.imageUrl} target="_blank" rel="noopener noreferrer" className="block w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity">
                    <img src={review.imageUrl} alt="Review attachment" className="w-full h-full object-cover" />
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
