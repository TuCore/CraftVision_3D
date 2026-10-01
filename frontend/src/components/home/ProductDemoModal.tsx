"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Eye, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: number;
  image: string;
  title: string;
  sold: number;
  originalPrice: number;
  price: number;
  discount: number;
}

interface ProductDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export function ProductDemoModal({ isOpen, onClose, product }: ProductDemoModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !product || !isMounted) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(price)
      .replace("₫", "VND");
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
          <h2 className="text-lg font-bold text-gray-800">Xem mẫu sản phẩm</h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col md:flex-row flex-1 overflow-y-auto bg-white">
          {/* Left - Phone Mockup */}
          <div className="flex-1 p-6 md:p-8 flex justify-center items-center bg-gray-50/50">
            <div className="relative w-full max-w-[280px] aspect-[9/19] bg-[#1a1a1a] rounded-[2.5rem] border-[8px] border-gray-800 shadow-xl overflow-hidden shrink-0 flex flex-col">
              {/* Phone Notch */}
              <div className="absolute top-0 inset-x-0 h-5 flex justify-center z-20 bg-gray-800 rounded-b-xl w-32 mx-auto"></div>
              
              {/* Phone Content (Fake UI to look like demo) */}
              <div className="relative flex-1 bg-black text-white overflow-hidden flex flex-col items-center">
                <img 
                  src={product.image} 
                  alt="Demo preview" 
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                
                {/* Fake Demo Content */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full w-full p-4 text-center mt-12">
                   <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 w-full border border-white/20 shadow-lg">
                     <h4 className="text-lg font-bold text-white mb-2 leading-tight">Có một món quà nhỏ dành cho cậu...</h4>
                     <p className="text-xs text-white/80">Nhưng trước khi mở, thổi nến trước nhé 🎂</p>
                   </div>
                </div>

                {/* Bottom lang selector mock */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 border border-white/20 px-3 py-1.5 rounded-full backdrop-blur-md z-10">
                   <div className="w-3 h-3 rounded-full border border-white"></div>
                   <span className="text-[10px] font-medium">VN</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Product Details */}
          <div className="flex-1 p-6 md:p-8 flex flex-col gap-6">
            <h3 className="text-2xl font-bold text-gray-900 leading-tight">{product.title}</h3>
            
            <div className="bg-gray-50 rounded-xl p-5 flex flex-col gap-4 text-sm text-gray-600">
              <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-4">
                <span className="font-semibold text-rose-500">Thiết kế:</span>
                <span>Mẫu thiết kế đẹp mắt, sang trọng, tùy chỉnh nhanh chóng theo nhu cầu của bạn.</span>
              </div>
              <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-4">
                <span className="font-semibold text-rose-500">Thao tác:</span>
                <span>Chỉnh sửa nội dung, hình ảnh, màu sắc và âm nhạc dễ dàng chỉ với vài thao tác.</span>
              </div>
              <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-4">
                <span className="font-semibold text-rose-500">Chia sẻ:</span>
                <span>Gửi link hoặc QR code cho người thương qua Zalo, Facebook, Messenger nhanh chóng.</span>
              </div>
              <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-4">
                <span className="font-semibold text-rose-500">Tương thích:</span>
                <span>Chạy mượt trên mọi thiết bị: điện thoại, máy tính bảng, laptop và máy tính.</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-rose-600">
                {formatPrice(product.price)}
              </span>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 border border-green-200 text-xs font-bold rounded">
                -{product.discount}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <button 
                onClick={() => toast.info("Đang mở bản demo...")}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold transition-colors text-sm"
              >
                <Eye className="w-4 h-4" /> Xem trực tiếp
              </button>
              <button 
                onClick={() => toast.success("Đã thêm vào giỏ hàng")}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors shadow-sm text-sm"
              >
                <ShoppingCart className="w-4 h-4" /> Mua ngay
              </button>
            </div>

            {/* QR Code Section */}
            <div className="mt-4 flex flex-col items-center justify-center pt-6 relative">
              
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 relative w-36 h-44 flex flex-col items-center shadow-md rotate-[-3deg] hover:rotate-0 transition-transform">
                {/* Red tape top left */}
                <div className="absolute -top-2 -left-3 w-10 h-4 bg-red-400/80 -rotate-45 z-10 shadow-sm"></div>
                {/* Red tape bottom right */}
                <div className="absolute -bottom-2 -right-3 w-10 h-4 bg-red-400/80 -rotate-45 z-10 shadow-sm"></div>
                
                {/* QR container */}
                <div className="w-full aspect-square bg-[#8B0000] rounded overflow-hidden flex flex-wrap content-start relative mt-1">
                   {/* Fake QR pattern */}
                   {Array.from({length: 64}).map((_, i) => (
                      <div key={i} className={`w-[12.5%] h-[12.5%] ${Math.random() > 0.5 ? 'bg-[#5c0000]' : 'bg-transparent'}`}></div>
                   ))}
                   {/* Center Heart */}
                   <div className="absolute inset-0 flex items-center justify-center">
                     <div className="bg-white p-1 rounded-sm shadow">
                        <svg className="w-6 h-6 text-red-600 fill-current" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                     </div>
                   </div>
                </div>
                
                <div className="flex-1 w-full flex items-center justify-center mt-2">
                   <div className="flex gap-2 text-red-500">
                     <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                     <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                   </div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-6 text-center max-w-[200px]">Quét mã QR để xem trên điện thoại</p>
            </div>

          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
