"use client";

import React, { useState } from "react";
import { Flame, Info, PlayCircle, ShoppingCart, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

// Mock data for template products
const TEMPLATE_PRODUCTS = [
  { id: 1, image: "/dreamy-hero-bg.jpg", title: "Trung thu - Ngàn Đèn Lồng, Một Lời Thương", sold: 116, originalPrice: 69998, price: 49999, discount: 40 },
  { id: 2, image: "/dreamy-hero-bg.jpg", title: "TRUNG THU - Đèn hoa dưới ánh trăng 🌸", sold: 227, originalPrice: 69998, price: 49999, discount: 40 },
  { id: 3, image: "/dreamy-hero-bg.jpg", title: "VIP - Món quà kỷ niệm, tình yêu, sinh nhật", sold: 491, originalPrice: 69998, price: 49999, discount: 40 },
  { id: 4, image: "/dreamy-hero-bg.jpg", title: "LOVE VIP - Mưa lời yêu thương 3D", sold: 144, originalPrice: 66665, price: 39999, discount: 40 },
  { id: 5, image: "/dreamy-hero-bg.jpg", title: "Món quà tình yêu lấp lánh", sold: 89, originalPrice: 49999, price: 29999, discount: 40 },
  { id: 6, image: "/dreamy-hero-bg.jpg", title: "Thiệp chúc mừng ngày phụ nữ 20/10", sold: 342, originalPrice: 55000, price: 33000, discount: 40 },
  { id: 7, image: "/dreamy-hero-bg.jpg", title: "Happy Birthday - Vũ trụ tình yêu", sold: 56, originalPrice: 80000, price: 48000, discount: 40 },
  { id: 8, image: "/dreamy-hero-bg.jpg", title: "Kỷ niệm ngày cưới 3D đặc biệt", sold: 12, originalPrice: 100000, price: 60000, discount: 40 },
  { id: 9, image: "/dreamy-hero-bg.jpg", title: "Trung thu - Ngàn Đèn Lồng, Một Lời Thương (Mẫu 2)", sold: 116, originalPrice: 69998, price: 49999, discount: 40 },
  { id: 10, image: "/dreamy-hero-bg.jpg", title: "TRUNG THU - Đèn hoa dưới ánh trăng 🌸 (Mẫu 2)", sold: 227, originalPrice: 69998, price: 49999, discount: 40 },
  { id: 11, image: "/dreamy-hero-bg.jpg", title: "VIP - Món quà kỷ niệm, tình yêu, sinh nhật (Mẫu 2)", sold: 491, originalPrice: 69998, price: 49999, discount: 40 },
  { id: 12, image: "/dreamy-hero-bg.jpg", title: "LOVE VIP - Mưa lời yêu thương 3D (Mẫu 2)", sold: 144, originalPrice: 66665, price: 39999, discount: 40 },
  { id: 13, image: "/dreamy-hero-bg.jpg", title: "Món quà tình yêu lấp lánh (Mẫu 2)", sold: 89, originalPrice: 49999, price: 29999, discount: 40 },
  { id: 14, image: "/dreamy-hero-bg.jpg", title: "Thiệp chúc mừng ngày phụ nữ 20/10 (Mẫu 2)", sold: 342, originalPrice: 55000, price: 33000, discount: 40 },
  { id: 15, image: "/dreamy-hero-bg.jpg", title: "Happy Birthday - Vũ trụ tình yêu (Mẫu 2)", sold: 56, originalPrice: 80000, price: 48000, discount: 40 },
  { id: 16, image: "/dreamy-hero-bg.jpg", title: "Kỷ niệm ngày cưới 3D đặc biệt (Mẫu 2)", sold: 12, originalPrice: 100000, price: 60000, discount: 40 },
];

export function TemplateProductsSection() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(TEMPLATE_PRODUCTS.length / itemsPerPage);
  
  const displayedProducts = TEMPLATE_PRODUCTS.slice(
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
    <section className="w-full py-16 sm:py-24 bg-background border-t border-border/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-center gap-3 mb-12 sm:mb-16">
          <Flame className="h-8 w-8 sm:h-10 sm:w-10 text-orange-500 fill-orange-500 animate-pulse" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-rose-500 tracking-tight text-center">
            Hơn 50+ mẫu thiết kế đang chờ bạn khám phá
          </h2>
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
                      Đã bán: {product.sold}
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
                    onClick={() => toast.success("Đã thêm vào giỏ hàng")}
                    className="flex items-center justify-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-2.5 text-xs font-semibold transition-colors shadow-sm"
                  >
                    <ShoppingCart className="h-4 w-4" /> Mua ngay
                  </button>
                  <button
                    onClick={() => toast.info("Đang mở bản demo...")}
                    className="flex items-center justify-center gap-1.5 bg-transparent hover:bg-muted border border-border text-foreground rounded-xl py-2.5 text-xs font-semibold transition-colors"
                  >
                    <Eye className="h-4 w-4" /> Xem demo
                  </button>
                </div>

                {/* Links */}
                <div className="flex items-center justify-between text-[11px] sm:text-xs font-medium px-1">
                  <button className="flex items-center gap-1.5 text-blue-500 hover:underline hover:text-blue-600 transition-all">
                    <Info className="h-3.5 w-3.5" /> Hướng dẫn
                  </button>
                  <button className="flex items-center gap-1.5 text-rose-500 hover:underline hover:text-rose-600 transition-all">
                    <PlayCircle className="h-3.5 w-3.5" /> Video hướng dẫn
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
              Trang {currentPage}
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
    </section>
  );
}
