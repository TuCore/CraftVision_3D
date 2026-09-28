'use client';

import { useProductCategories, useCreateCategory, useDeleteCategory } from '@/hooks/useProductCategories';
import { LayoutGrid, Plus, Trash2, Loader2, LayoutList } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AdminCategoriesPage() {
  const { data: categories, isLoading, error } = useProductCategories();
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory();
  
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast.error('Vui lòng nhập tên danh mục');
      return;
    }
    createCategory({ name: newCategoryName }, {
      onSuccess: () => {
        toast.success('Đã thêm danh mục thành công!');
        setNewCategoryName('');
      },
      onError: () => toast.error('Lỗi khi thêm danh mục')
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này? Các sản phẩm thuộc danh mục này có thể bị ảnh hưởng.')) {
      deleteCategory(id, {
        onSuccess: () => toast.success('Đã xóa danh mục thành công.'),
        onError: () => toast.error('Lỗi khi xóa danh mục. Có thể danh mục đang chứa sản phẩm.')
      });
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      <p className="text-muted-foreground font-medium animate-pulse">Đang tải danh sách danh mục...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-2 shadow-sm">
        <LayoutList className="w-10 h-10" />
      </div>
      <h3 className="text-2xl font-extrabold font-display">Lỗi tải dữ liệu</h3>
      <p className="text-muted-foreground font-medium">Không thể lấy danh sách danh mục. Vui lòng thử lại sau.</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-page pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-foreground">Quản lý Danh mục</h1>
          <p className="text-muted-foreground mt-2 font-medium">Thêm, sửa, xóa các danh mục sản phẩm</p>
        </div>
      </div>

      <div className="glass-card rounded-[2rem] overflow-hidden shadow-soft border border-white/40 p-6 bg-white/60">
        <form onSubmit={handleAdd} className="flex gap-4 mb-8">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Nhập tên danh mục mới..."
            className="flex-1 border border-border rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[color:var(--coral)]/30 outline-none transition-all"
            disabled={isCreating}
          />
          <button 
            type="submit"
            disabled={isCreating}
            className="btn-hero px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm hover:scale-105 active:scale-95 transition-all text-white disabled:opacity-50"
          >
            {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />} 
            Thêm mới
          </button>
        </form>

        <div className="overflow-x-auto custom-scrollbar bg-white rounded-2xl border border-border">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-gray-50">
                <th className="px-6 py-4 font-bold text-sm text-muted-foreground uppercase tracking-wider">Tên Danh mục</th>
                <th className="px-6 py-4 font-bold text-sm text-muted-foreground uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {categories?.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-bold text-foreground">{cat.name}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(cat.id)}
                      disabled={isDeleting}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 inline-flex" 
                      title="Xóa"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              
              {!categories?.length && (
                <tr>
                  <td colSpan={2} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <LayoutList className="w-10 h-10 mb-3 opacity-20" />
                      <p className="font-medium">Chưa có danh mục nào.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
