'use client';

import { useProducts, useDeleteProduct, Product } from '@/hooks/useProducts';
import Link from 'next/link';
import { Package, Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ProductModal } from './components/ProductModal';

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useProducts(page, 5);
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      deleteProduct(id, {
        onSuccess: () => toast.success('Đã xóa sản phẩm thành công.'),
        onError: () => toast.error('Lỗi khi xóa sản phẩm.')
      });
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      <p className="text-muted-foreground font-medium animate-pulse">Đang tải danh sách sản phẩm...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-2 shadow-sm">
        <Package className="w-10 h-10" />
      </div>
      <h3 className="text-2xl font-extrabold font-display">Lỗi tải dữ liệu</h3>
      <p className="text-muted-foreground font-medium">Không thể lấy danh sách sản phẩm. Vui lòng thử lại sau.</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-page pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-foreground">Quản lý Sản phẩm</h1>
          <p className="text-muted-foreground mt-2 font-medium">Xem và quản lý tất cả sản phẩm trong cửa hàng</p>
        </div>
        <button 
          onClick={() => { setSelectedProduct(null); setModalOpen(true); }}
          className="btn-hero px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm hover:scale-105 active:scale-95 transition-all text-white"
        >
          <Plus className="w-5 h-5" /> Tạo Sản phẩm Mới
        </button>
      </div>

      <div className="glass-card rounded-[2rem] overflow-hidden shadow-soft border border-white/40 p-2 md:p-4 bg-white/60">
        
        {/* Mobile View: Cards */}
        <div className="md:hidden space-y-4">
          {data?.items.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm border border-border flex gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-border/50">
                <img src={product.primaryImageUrl} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground truncate">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-1">{product.productType}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-extrabold text-[color:var(--coral)]">{product.price.toLocaleString('vi-VN')} đ</span>
                  <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-md">Kho: {product.stock}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => { setSelectedProduct(product); setModalOpen(true); }} className="p-2 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors flex-1 flex justify-center">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(product.id)} disabled={isDeleting} className="p-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex-1 flex justify-center disabled:opacity-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-border/50">
                <th className="px-6 py-5 font-bold text-sm text-muted-foreground uppercase tracking-wider">Sản phẩm</th>
                <th className="px-6 py-5 font-bold text-sm text-muted-foreground uppercase tracking-wider">Loại</th>
                <th className="px-6 py-5 font-bold text-sm text-muted-foreground uppercase tracking-wider">Giá</th>
                <th className="px-6 py-5 font-bold text-sm text-muted-foreground uppercase tracking-wider">Tồn kho</th>
                <th className="px-6 py-5 font-bold text-sm text-muted-foreground uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {data?.items.map((product) => (
                <tr key={product.id} className="hover:bg-white/60 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-border/50 shrink-0">
                        <img src={product.primaryImageUrl} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-bold text-foreground">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-medium text-muted-foreground">{product.productType}</td>
                  <td className="px-6 py-5 font-extrabold text-[color:var(--coral)]">{product.price.toLocaleString('vi-VN')} đ</td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 bg-green-100 text-green-700 font-bold rounded-lg text-sm border border-green-200">
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => { setSelectedProduct(product); setModalOpen(true); }}
                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" 
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        disabled={isDeleting}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50" 
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {!data?.items?.length && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Package className="w-12 h-12 mb-3 opacity-20" />
                      <p className="font-medium">Chưa có sản phẩm nào trong hệ thống.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-end mt-4 px-4 py-3 border-t border-border">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={data.page === 1}
                className="p-2 rounded-xl border border-border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-sm font-medium px-2">
                Trang {data.page} / {data.totalPages}
              </div>
              <button 
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={data.page === data.totalPages}
                className="p-2 rounded-xl border border-border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ProductModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        product={selectedProduct} 
      />
    </div>
  );
}
