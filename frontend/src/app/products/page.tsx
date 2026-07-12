'use client';

import { useProducts } from '@/hooks/useProducts';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, Wand2 } from 'lucide-react';
import { Suspense } from 'react';

function ProductsContent() {
  const searchParams = useSearchParams();
  const currentType = searchParams.get('type') || ''; // 'InStock' or 'PreOrder'
  
  const { data, isLoading } = useProducts(1, 24, currentType);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {currentType === 'PreOrder' ? 'Quà Tặng 3D & AI' : currentType === 'InStock' ? 'Sản Phẩm Có Sẵn' : 'Tất Cả Sản Phẩm'}
          </h1>
          <p className="text-gray-500">Khám phá bộ sưu tập quà tặng độc đáo của CraftVision</p>
        </div>

        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <Link 
            href="/products" 
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${!currentType ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            Tất cả
          </Link>
          <Link 
            href="/products?type=PreOrder" 
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${currentType === 'PreOrder' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <Wand2 className="w-4 h-4" /> PreOrder 3D
          </Link>
          <Link 
            href="/products?type=InStock" 
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${currentType === 'InStock' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <ShoppingBag className="w-4 h-4" /> Có Sẵn
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-800 aspect-[4/5] rounded-2xl mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {data?.items.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`} className="group block">
              <div className="relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 aspect-[4/5] mb-4">
                <img 
                  src={product.primaryImageUrl} 
                  alt={product.name} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-md ${
                    product.productType === 'PreOrder' 
                      ? 'bg-purple-900/50 text-purple-100 border border-purple-400/30' 
                      : 'bg-green-900/50 text-green-100 border border-green-400/30'
                  }`}>
                    {product.productType === 'PreOrder' ? 'Tạo AI 3D' : 'Có Sẵn'}
                  </span>
                  {product.supportsNfc && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-900/50 text-blue-100 border border-blue-400/30 backdrop-blur-md w-fit">
                      Có NFC
                    </span>
                  )}
                </div>
              </div>
              <h3 className="text-lg font-bold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {product.name}
              </h3>
              <p className="text-gray-500 font-medium">{product.price.toLocaleString('vi-VN')} đ</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Đang tải bộ lọc...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
