import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { useCreateReview } from '@/hooks/useReviews';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
}

export function ReviewModal({ isOpen, onClose, productId, productName }: ReviewModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  
  const { mutate: createReview, isPending } = useCreateReview();
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá');
      return;
    }

    createReview(
      { productId, rating, comment },
      {
        onSuccess: () => {
          toast.success('Cảm ơn bạn đã đánh giá sản phẩm!');
          setRating(0);
          setComment('');
          onClose();
          router.push(`/shop/${productId}#reviews`);
        },
        onError: (err: any) => {
          toast.error('Có lỗi xảy ra: ' + (err.response?.data?.message || err.message));
        }
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative animate-in fade-in slide-in-from-top-12 duration-300 pointer-events-auto border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-lg">Đánh giá sản phẩm</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-gray-600 text-sm mb-4">Bạn cảm thấy thế nào về <span className="font-medium text-gray-900">{productName}</span>?</p>
          
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="p-1 focus:outline-none transition-transform hover:scale-110"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`w-10 h-10 transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="mb-6">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Bình luận của bạn
            </label>
            <textarea
              id="comment"
              rows={4}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-black focus:border-black outline-none transition-shadow"
              placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isPending || rating === 0}
            className="w-full bg-black text-white rounded-xl py-3 font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </form>
      </div>
    </div>
  );
}
