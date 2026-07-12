'use client';

import { useParams, useRouter } from 'next/navigation';
import { useProduct } from '@/hooks/useProducts';
import { ArrowLeft, Check, Package, Clock, Wand2, Info } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: product, isLoading, error } = useProduct(id as string);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  if (error || !product) return <div className="min-h-screen flex items-center justify-center">Không tìm thấy sản phẩm.</div>;

  const isPreOrder = product.productType === 'PreOrder';

  const handleAction = () => {
    if (isPreOrder) {
      router.push(`/preorder/${product.id}`);
    } else {
      // In a real app, add to cart
      alert('Đã thêm vào giỏ hàng!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <Link href="/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Quay lại cửa hàng
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="relative rounded-3xl overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-[4/5]">
            <img 
              src={product.primaryImageUrl} 
              alt={product.name} 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          {/* Thumbnails could go here if product.images has more than 1 */}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="mb-2 flex items-center gap-2">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
              isPreOrder ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' 
              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            }`}>
              {isPreOrder ? 'Sản Phẩm Đặt Trước' : 'Sản Phẩm Có Sẵn'}
            </span>
            {product.supportsNfc && (
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                Có Chip NFC
              </span>
            )}
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4">{product.name}</h1>
          <p className="text-3xl font-medium text-indigo-600 dark:text-indigo-400 mb-8">
            {product.price.toLocaleString('vi-VN')} đ
          </p>

          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-8">
            {product.description || 'Chưa có mô tả cho sản phẩm này.'}
          </p>

          <div className="space-y-4 mb-10 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
            {isPreOrder ? (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Thời gian chế tác</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Dự kiến hoàn thành sau {product.estimatedProductionDays || 7} ngày kể từ lúc chốt thiết kế 3D.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Tình trạng kho</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Còn {product.stock} sản phẩm sẵn sàng giao ngay.</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">NFC Kỹ thuật số</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Sản phẩm cho phép lưu trữ 1 lời chúc video/hình ảnh qua liên kết chạm thông minh.</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleAction}
            className={`w-full py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all ${
              isPreOrder 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 shadow-lg shadow-indigo-500/25'
                : 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'
            }`}
          >
            {isPreOrder ? (
              <>
                <Wand2 className="w-5 h-5" /> Bắt đầu tạo 3D Model
              </>
            ) : (
              'Thêm vào giỏ hàng'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
