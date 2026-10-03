"use client";

import React, { useState, useEffect } from "react";
import { Flame, Info, PlayCircle, ShoppingCart, Eye, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ProductDemoModal } from "./ProductDemoModal";
import { TutorialVideoModal } from "./TutorialVideoModal";
import { INITIAL_TEMPLATE_PRODUCTS, TemplateProduct, TemplateVideo, DEFAULT_TUTORIAL_VIDEO } from "@/data/templateProducts";
import { useTranslation } from "@/components/LanguageProvider";

export function TemplateProductsSection() {
  const { t } = useTranslation();
  const [products] = useState<TemplateProduct[]>(INITIAL_TEMPLATE_PRODUCTS);
  const [videoMap, setVideoMap] = useState<Record<number, TemplateVideo>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<TemplateProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Tutorial Video Modal State
  const [activeVideo, setActiveVideo] = useState<TemplateVideo | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Fetch updated videos from API
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch("/api/template-videos");
        if (res.ok) {
          const data = await res.json();
          setVideoMap(data);
        }
      } catch (e) {
        console.error("Lỗi khi tải video hướng dẫn:", e);
      }
    };
    fetchVideos();
  }, []);

  const handleOpenVideo = (product: TemplateProduct) => {
    // If customized in videoMap, use it; otherwise use default video
    const video = videoMap[product.id] || product.video || {
      id: product.id,
      templateId: product.id,
      headerTitle: `${DEFAULT_TUTORIAL_VIDEO.headerTitle} - ${product.title}`,
      videoUrl: DEFAULT_TUTORIAL_VIDEO.videoUrl,
      captionTitle: DEFAULT_TUTORIAL_VIDEO.captionTitle,
      captionDesc: DEFAULT_TUTORIAL_VIDEO.captionDesc,
      detailUrl: DEFAULT_TUTORIAL_VIDEO.detailUrl,
    };
    setActiveVideo(video);
    setSelectedProduct(product);
    setIsVideoModalOpen(true);
  };

  const itemsPerPage = 8;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  
  const displayedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(price)
      .replace("₫", "VND");
  };

  return (
    <section id="template-products" className="w-full py-16 sm:py-24 bg-background border-t border-border/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="relative flex items-center justify-center mb-12 sm:mb-16 py-4">
          {/* Aura Effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-3xl h-[150%] bg-[#ffd1da] opacity-80 blur-[50px] rounded-[100%] pointer-events-none" />
          
          <div className="relative inline-flex items-center gap-3 sm:gap-4 z-10">
            <Sparkles className="h-7 w-7 sm:h-10 sm:w-10 text-[#4a0b19]" strokeWidth={2.5} />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#4a0b19] tracking-tight text-center">
              {t("template.heading")}
            </h2>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedProducts.map((product) => (
            <div
              key={product.id}
              className="group flex flex-col bg-card rounded-3xl border border-border/50 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Product Image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Product Info */}
              <div className="p-5 flex flex-col flex-1">
                {/* Title */}
                <h3 className="font-bold text-foreground text-sm sm:text-base line-clamp-2 min-h-[2.5rem] mb-3">
                  {product.title}
                </h3>

                {/* Sold & Price */}
                <div className="flex flex-col gap-2 mt-auto mb-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-orange-500">
                      <Flame className="h-3.5 w-3.5 fill-orange-500" />
                      {t("template.sold")} {product.sold}
                    </span>
                    <span className="text-[11px] sm:text-xs text-muted-foreground line-through decoration-muted-foreground/50">
                      {formatPrice(product.originalPrice)}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-lg font-extrabold text-rose-600">
                      {formatPrice(product.price)}
                    </span>
                    <span className="px-1.5 py-0.5 bg-green-100/80 text-green-700 border border-green-200 text-[10px] font-bold rounded">
                      -{product.discount}%
                    </span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => toast.success(t("template.added_to_cart"))}
                    className="flex items-center justify-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-2.5 text-xs font-semibold transition-colors shadow-sm"
                  >
                    <ShoppingCart className="h-4 w-4" /> {t("template.buy_now")}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-1.5 bg-transparent hover:bg-muted border border-border text-foreground rounded-xl py-2.5 text-xs font-semibold transition-colors"
                  >
                    <Eye className="h-4 w-4" /> {t("template.view_demo")}
                  </button>
                </div>

                {/* Links */}
                <div className="flex items-center justify-between text-[11px] sm:text-xs font-medium px-1">
                  <button 
                    onClick={() => handleOpenVideo(product)}
                    className="flex items-center gap-1.5 text-blue-500 hover:underline hover:text-blue-600 transition-all cursor-pointer"
                  >
                    <Info className="h-3.5 w-3.5" /> {t("template.guide")}
                  </button>
                  <button 
                    onClick={() => handleOpenVideo(product)}
                    className="flex items-center gap-1.5 text-rose-500 hover:underline hover:text-rose-600 transition-all cursor-pointer font-semibold"
                  >
                    <PlayCircle className="h-3.5 w-3.5" /> {t("template.tutorial_video")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors ${
                currentPage === 1 
                  ? "opacity-50 cursor-not-allowed bg-muted/50 text-muted-foreground" 
                  : "hover:bg-muted text-foreground"
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium text-foreground min-w-[4rem] text-center">
              {t("template.page")} {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors ${
                currentPage === totalPages 
                  ? "opacity-50 cursor-not-allowed bg-muted/50 text-muted-foreground" 
                  : "hover:bg-muted text-foreground"
              }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Product Demo Modal */}
      <ProductDemoModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
      />

      {/* Tutorial Video Modal (Matching Hình 1) */}
      <TutorialVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        video={activeVideo}
        productTitle={selectedProduct?.title}
      />
    </section>
  );
}
