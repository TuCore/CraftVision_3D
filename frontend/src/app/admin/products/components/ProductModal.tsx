import { useState, useEffect } from 'react';
import { Product } from '@/hooks/useProducts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';
import { toast } from 'sonner';
import { Image as ImageIcon, Loader2 } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

export function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const isEdit = !!product;
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    productType: 'InStock',
    supportsNfc: true,
    primaryImageUrl: ''
  });

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        stock: product.stock || 0,
        productType: product.productType || 'InStock',
        supportsNfc: product.supportsNfc ?? true,
        primaryImageUrl: product.primaryImageUrl || ''
      });
    } else if (isOpen) {
      setFormData({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        productType: 'InStock',
        supportsNfc: true,
        primaryImageUrl: ''
      });
    }
  }, [product, isOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error('Cloudinary chưa được cấu hình. Vui lòng thêm API key vào .env.local');
      return;
    }

    setIsUploadingImage(true);
    const formDataPayload = new FormData();
    formDataPayload.append('file', file);
    formDataPayload.append('upload_preset', uploadPreset);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formDataPayload,
      });
      const data = await res.json();
      if (data.secure_url) {
        setFormData(prev => ({ ...prev, primaryImageUrl: data.secure_url }));
        toast.success('Tải ảnh lên thành công!');
      } else {
        toast.error('Lỗi khi tải ảnh lên Cloudinary.');
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi mạng khi tải ảnh.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.price <= 0 || formData.stock < 0) {
      toast.error('Vui lòng điền đầy đủ thông tin hợp lệ.');
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      price: formData.price,
      stock: formData.stock,
      productType: formData.productType,
      supportsNfc: formData.supportsNfc,
      productCategoryId: "00000000-0000-0000-0000-000000000000", // Generic category ID required by API
      images: formData.primaryImageUrl ? [{ url: formData.primaryImageUrl, isPrimary: true }] : []
    };

    if (isEdit && product) {
      updateProduct(
        { id: product.id, data: payload },
        {
          onSuccess: () => {
            toast.success('Cập nhật sản phẩm thành công!');
            onClose();
          },
          onError: () => toast.error('Lỗi khi cập nhật sản phẩm.')
        }
      );
    } else {
      createProduct(
        payload,
        {
          onSuccess: () => {
            toast.success('Thêm sản phẩm thành công!');
            onClose();
          },
          onError: () => toast.error('Lỗi khi thêm sản phẩm.')
        }
      );
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white rounded-[2rem] p-6 sm:p-8 border-border shadow-soft max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold font-display">
            {isEdit ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm Mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-muted-foreground">Tên sản phẩm *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-border rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[color:var(--coral)]/30 outline-none transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground">Giá (VNĐ) *</label>
              <input
                type="number"
                min="0"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full border border-border rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[color:var(--coral)]/30 outline-none transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground">Tồn kho *</label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full border border-border rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[color:var(--coral)]/30 outline-none transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground">Loại sản phẩm</label>
              <select
                value={formData.productType}
                onChange={e => setFormData({ ...formData, productType: e.target.value })}
                className="w-full border border-border rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[color:var(--coral)]/30 outline-none transition-all"
              >
                <option value="InStock">Có sẵn (InStock)</option>
                <option value="PreOrder">Đặt trước (PreOrder)</option>
                <option value="CustomMade">Làm theo yêu cầu (CustomMade)</option>
              </select>
            </div>

            <div className="space-y-2 flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="supportsNfc"
                checked={formData.supportsNfc}
                onChange={e => setFormData({ ...formData, supportsNfc: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-[color:var(--coral)] focus:ring-[color:var(--coral)]"
              />
              <label htmlFor="supportsNfc" className="text-sm font-bold text-muted-foreground cursor-pointer">
                Hỗ trợ gắn thẻ NFC
              </label>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-muted-foreground">Mô tả chi tiết</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-border rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[color:var(--coral)]/30 outline-none transition-all min-h-[100px] resize-y custom-scrollbar"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-muted-foreground">Hình ảnh chính</label>
              <div className="flex items-center gap-4">
                {formData.primaryImageUrl ? (
                  <img src={formData.primaryImageUrl} alt="Preview" className="w-20 h-20 rounded-xl object-cover border border-border" />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[color:var(--coral)]/10 file:text-[color:var(--coral)] hover:file:bg-[color:var(--coral)]/20 cursor-pointer"
                  />
                  {isUploadingImage && <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Đang tải ảnh lên...</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-gray-100 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              className="btn-hero px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? 'Lưu thay đổi' : 'Tạo Sản phẩm'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
