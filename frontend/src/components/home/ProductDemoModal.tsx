"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { X, Eye, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/components/LanguageProvider";
import Link from "next/link";
import { legacyCardSlug, legacyCardPath } from "@/features/cards/legacy";

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
  const router = useRouter();
  const { t } = useTranslation();
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
          <h2 className="text-lg font-bold text-gray-800">{t("demo.title")}</h2>
          <button 
            onClick={onClose}
            aria-label={t("demo.close")}
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
              <div className="absolute top-0 inset-x-0 h-5 flex justify-center z-20 bg-gray-800 rounded-b-xl w-32 mx-auto pointer-events-none" aria-hidden="true"></div>
              
              {/* A separate viewport keeps the scene and letter inside the phone. */}
              <iframe
                key={product.id}
                src={`${legacyCardPath(product.id)}?preview=1`}
                title={t("demo.preview_title")}
                className="absolute inset-0 h-full w-full border-0 bg-black"
              />
            </div>
          </div>

          {/* Right - Product Details */}
          <div className="flex-1 p-6 md:p-8 flex flex-col gap-6">
            <h3 className="text-2xl font-bold text-gray-900 leading-tight">{product.title}</h3>
            
            <div className="bg-gray-50 rounded-xl p-5 flex flex-col gap-4 text-sm text-gray-600">
              <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-4">
                <span className="font-semibold text-rose-500">{t("demo.spec_design_label")}</span>
                <span>{t("demo.spec_design_desc")}</span>
              </div>
              <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-4">
                <span className="font-semibold text-rose-500">{t("demo.spec_action_label")}</span>
                <span>{t("demo.spec_action_desc")}</span>
              </div>
              <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-4">
                <span className="font-semibold text-rose-500">{t("demo.spec_share_label")}</span>
                <span>{t("demo.spec_share_desc")}</span>
              </div>
              <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-4">
                <span className="font-semibold text-rose-500">{t("demo.spec_compat_label")}</span>
                <span>{t("demo.spec_compat_desc")}</span>
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
                onClick={() => {
                  onClose();
                  router.push(legacyCardPath(product.id));
                }}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold transition-colors text-sm cursor-pointer"
              >
                <Eye className="w-4 h-4" /> {t("demo.live_view")}
              </button>
              <button 
                onClick={() => {
                  onClose();
                  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                  if (!token) {
                    toast.info("Vui lòng đăng nhập hoặc đăng ký để mua sản phẩm!");
                    router.push(`/auth?redirect=/shop/template-${product.id}/greeting`);
                    return;
                  }
                  router.push(`/shop/template-${product.id}/greeting`);
                }}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors shadow-sm text-sm cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" /> {t("template.buy_now")}
              </button>
            </div>

            <Link href={`/cards/${legacyCardSlug(product.id)}/edit`} onClick={onClose} className="text-center text-sm font-semibold text-rose-600 underline underline-offset-4">Cá nhân hóa thiệp 3D →</Link>

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
              <p className="text-xs text-gray-400 mt-6 text-center max-w-[200px]">{t("demo.scan_qr")}</p>
            </div>

          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
