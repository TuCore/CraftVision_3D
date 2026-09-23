import React, { useState } from 'react';
import { Star, X, Image as ImageIcon, Trash2 } from 'lucide-react';
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const { mutate: createReview, isPending } = useCreateReview();
  const router = useRouter();

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá');
      return;
    }

    let uploadedImageUrl = undefined;

    if (imageFile) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', imageFile);
        
        const { default: api } = await import('@/lib/api');
        const res = await api.post('/api/uploads', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        uploadedImageUrl = res.data?.cloudinaryUrl;
      } catch (error) {
        toast.error('Lỗi khi tải ảnh lên. Vui lòng thử lại.');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    createReview(
      // @ts-ignore
      { productId, rating, comment, imageUrl: uploadedImageUrl },
      {
        onSuccess: () => {
          toast.success('Cảm ơn bạn đã đánh giá sản phẩm!');
          setRating(0);
          setComment('');
          setImageFile(null);
          setImagePreview(null);
          onClose();
          router.push(`/shop/${productId}#reviews`);
        },
        onError: (err: any) => {
          toast.error('Có lỗi xảy ra: ' + (err.message || 'Lỗi không xác định'));
        }
      }
    );
  };

  return (
    <div className="bg-white rounded-2xl w-full shadow-sm border border-gray-200 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h3 className="font-semibold text-lg text-gray-800">Đánh giá sản phẩm</h3>
        <button type="button" onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-full transition-colors">
          <X className="w-4 h-4 text-gray-500" />
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
              rows={3}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-black focus:border-black outline-none transition-shadow mb-3"
              placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <ImageIcon className="w-4 h-4" />
                <span>Thêm ảnh</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
            
            {imagePreview && (
              <div className="relative mt-4 inline-block">
                <img src={imagePreview} alt="Preview" className="h-24 rounded-lg object-cover border border-gray-200" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-white rounded-full shadow p-1 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending || isUploading || rating === 0}
            className="w-full bg-black text-white rounded-xl py-3 font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {(isPending || isUploading) ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isUploading ? 'Đang tải ảnh...' : 'Đang gửi...'}
              </>
            ) : 'Gửi đánh giá'}
          </button>
        </form>
    </div>
  );
}
