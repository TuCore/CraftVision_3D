'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, Gift, Zap } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';

export default function Home() {
  const { data, isLoading } = useProducts(1, 4, 'PreOrder');

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-medium tracking-wide">Quà tặng 3D & NFC thông minh</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
            Biến ý tưởng thành<br />Món quà độc bản
          </h1>
          <p className="text-xl text-indigo-100 max-w-2xl mb-10 leading-relaxed">
            CraftVision 3D sử dụng AI để tạo ra món quà 3D mang đậm dấu ấn cá nhân, tích hợp công nghệ chạm NFC để lưu giữ những lời chúc chân thành nhất.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/products?type=PreOrder" className="px-8 py-4 bg-white text-indigo-900 rounded-full font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/20">
              Tạo quà 3D bằng AI
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/products?type=InStock" className="px-8 py-4 bg-indigo-800/50 backdrop-blur-md border border-indigo-400/30 text-white rounded-full font-bold hover:bg-indigo-700/50 transition-all flex items-center justify-center gap-2">
              Mua hàng có sẵn
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Tạo 3D Bằng AI</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Chỉ cần miêu tả ý tưởng, AI của chúng tôi sẽ dựng lên mô hình 3D hoàn chỉnh ngay trên trình duyệt của bạn.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Chạm NFC Thông Minh</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Mỗi sản phẩm đều tích hợp chip NFC ẩn. Chỉ cần chạm điện thoại, người nhận sẽ thấy ngay video và lời chúc.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/50 rounded-xl flex items-center justify-center mb-6">
              <Gift className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Thủ Công Tinh Xảo</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Sau khi bạn chốt thiết kế, các nghệ nhân của CraftVision sẽ tỉ mỉ chế tác thành sản phẩm thật.
            </p>
          </div>
        </div>
      </section>

      {/* Highlight Products */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Sản Phẩm PreOrder Nổi Bật</h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Các phôi quà tặng được tối ưu riêng để in 3D theo yêu cầu.</p>
            </div>
            <Link href="/products?type=PreOrder" className="hidden md:flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:gap-3 transition-all">
              Xem tất cả <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {data?.items.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`} className="group relative block overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 aspect-[4/5]">
                  <img 
                    src={product.primaryImageUrl} 
                    alt={product.name} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                    <h3 className="text-xl font-bold text-white mb-1">{product.name}</h3>
                    <p className="text-indigo-200 font-medium">{product.price.toLocaleString('vi-VN')} đ</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
