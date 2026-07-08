"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, X } from 'lucide-react';

export default function PricingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Close Button */}
      <button 
        onClick={() => router.back()}
        className="absolute top-6 right-6 p-2 rounded-full hover:bg-foreground/5 transition-colors z-50 cursor-pointer"
        aria-label="Đóng"
      >
        <X className="w-8 h-8 text-muted-foreground hover:text-foreground transition-colors" strokeWidth={1.5} />
      </button>

      {/* Main Content */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 py-8 md:py-12 flex flex-col items-center justify-center">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Nâng cấp gói</h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Chọn gói phù hợp với nhu cầu tạo mô hình 3D của bạn để mở khóa các tính năng nâng cao và chất lượng xuất tốt nhất.
          </p>
        </div>
        
        {/* Horizontal Scrolling Container */}
        <div className="w-full flex flex-row gap-4 lg:gap-6 items-stretch overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar">
          
          {/* 1. Dùng thử */}
          <div className="flex-none w-[85vw] sm:w-[320px] lg:w-[280px] h-full snap-center bg-card rounded-3xl p-6 border border-border flex flex-col hover:border-foreground/30 transition-colors">
            <h3 className="text-2xl font-semibold mb-1">Dùng thử</h3>
            <div className="text-3xl font-bold mb-2 mt-4">0đ<span className="text-sm font-normal text-muted-foreground"> /tháng</span></div>
            <div className="text-sm text-foreground mb-6 h-10">Trải nghiệm tính năng cơ bản.</div>
            <button className="w-full py-3 rounded-full bg-muted text-muted-foreground font-medium mb-8 cursor-default">Gói hiện tại</button>
            <ul className="text-sm space-y-4 text-foreground/80 flex-1">
              <li className="flex gap-3 items-start"><Check className="w-5 h-5 text-foreground/50 shrink-0" /> Xem trước mô hình (Demo)</li>
              <li className="flex gap-3 items-start"><Check className="w-5 h-5 text-foreground/50 shrink-0" /> Có đóng dấu bản quyền</li>
            </ul>
          </div>

          {/* 2. Mua lẻ 1 */}
          <div className="flex-none w-[85vw] sm:w-[320px] lg:w-[280px] h-full snap-center bg-card rounded-3xl p-6 border border-border flex flex-col hover:border-foreground/30 transition-colors">
            <h3 className="text-2xl font-semibold mb-1">Mua lẻ</h3>
            <div className="text-3xl font-bold mb-2 mt-4">25.000đ</div>
            <div className="text-sm text-foreground mb-6 h-10">Tạo 1 mô hình 3D chuẩn chất lượng cao.</div>
            <button className="w-full py-3 rounded-full bg-foreground text-white hover:opacity-90 font-medium mb-8 transition-opacity">Mua gói</button>
            <div className="text-sm font-medium mb-4">Mọi thứ trong Dùng thử, cộng thêm:</div>
            <ul className="text-sm space-y-4 text-foreground/80 flex-1">
              <li className="flex gap-3 items-start"><Check className="w-5 h-5 text-foreground/50 shrink-0" /> 1 Mô hình chất lượng cao</li>
              <li className="flex gap-3 items-start"><Check className="w-5 h-5 text-foreground/50 shrink-0" /> Tải file .GLB không giới hạn</li>
            </ul>
          </div>

          {/* 3. Combo 2 */}
          <div className="flex-none w-[85vw] sm:w-[320px] lg:w-[280px] h-full snap-center bg-card rounded-3xl p-6 border border-border flex flex-col hover:border-foreground/30 transition-colors">
            <h3 className="text-2xl font-semibold mb-1">Combo 2</h3>
            <div className="text-3xl font-bold mb-2 mt-4">45.000đ</div>
            <div className="text-sm text-foreground mb-6 h-10">Gói tiết kiệm tạo 2 mô hình 3D.</div>
            <button className="w-full py-3 rounded-full bg-foreground text-white hover:opacity-90 font-medium mb-8 transition-opacity">Mua gói</button>
            <div className="text-sm font-medium mb-4">Mọi thứ trong Mua lẻ, cộng thêm:</div>
            <ul className="text-sm space-y-4 text-foreground/80 flex-1">
              <li className="flex gap-3 items-start"><Check className="w-5 h-5 text-foreground/50 shrink-0" /> 2 Mô hình chất lượng cao</li>
              <li className="flex gap-3 items-start"><Check className="w-5 h-5 text-foreground/50 shrink-0" /> Tiết kiệm 10% chi phí</li>
            </ul>
          </div>

          {/* 4. Combo 5 (Phổ biến) - Màu đặc biệt */}
          <div className="flex-none w-[85vw] sm:w-[320px] lg:w-[280px] h-full snap-center rounded-3xl p-6 border-2 border-[color:var(--coral)] bg-[color:var(--coral)]/5 flex flex-col relative shadow-lg">
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-2xl font-semibold">Combo 5</h3>
              <span className="bg-[color:var(--coral)]/10 text-[color:var(--coral)] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-[color:var(--coral)]/20">Phổ biến</span>
            </div>
            <div className="text-3xl font-bold mb-2 mt-4">99.000đ</div>
            <div className="text-sm text-foreground mb-6 h-10">Hoàn hảo cho người dùng thường xuyên.</div>
            <button className="w-full py-3 rounded-full bg-[color:var(--coral)] hover:opacity-90 text-white font-medium mb-8 transition-opacity shadow-md">Mua gói</button>
            <div className="text-sm font-medium mb-4">Mọi thứ trong Combo 2, cộng thêm:</div>
            <ul className="text-sm space-y-4 text-foreground/80 flex-1">
              <li className="flex gap-3 items-start"><Check className="w-5 h-5 text-[color:var(--coral)] shrink-0" /> 5 Mô hình chất lượng cao</li>
              <li className="flex gap-3 items-start"><Check className="w-5 h-5 text-[color:var(--coral)] shrink-0" /> Tiết kiệm lên đến 20%</li>
              <li className="flex gap-3 items-start"><Check className="w-5 h-5 text-[color:var(--coral)] shrink-0" /> Ưu tiên xử lý kết quả nhanh</li>
            </ul>
          </div>

          {/* 5. Combo 10 */}
          <div className="flex-none w-[85vw] sm:w-[320px] lg:w-[280px] h-full snap-center bg-card rounded-3xl p-6 border border-border flex flex-col hover:border-foreground/30 transition-colors">
            <h3 className="text-2xl font-semibold mb-1">Combo 10</h3>
            <div className="text-3xl font-bold mb-2 mt-4">179.000đ</div>
            <div className="text-sm text-foreground mb-6 h-10">Gói số lượng lớn dành cho Studio.</div>
            <button className="w-full py-3 rounded-full bg-foreground text-white hover:opacity-90 font-medium mb-8 transition-opacity">Mua gói</button>
            <div className="text-sm font-medium mb-4">Mọi thứ trong Combo 5, cộng thêm:</div>
            <ul className="text-sm space-y-4 text-foreground/80 flex-1">
              <li className="flex gap-3 items-start"><Check className="w-5 h-5 text-foreground/50 shrink-0" /> 10 Mô hình chất lượng cao</li>
              <li className="flex gap-3 items-start"><Check className="w-5 h-5 text-foreground/50 shrink-0" /> Tiết kiệm tối đa 28%</li>
              <li className="flex gap-3 items-start"><Check className="w-5 h-5 text-foreground/50 shrink-0" /> Cấp quyền thương mại</li>
            </ul>
          </div>

        </div>
        
        <style dangerouslySetInnerHTML={{__html: `
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}} />
      </main>
    </div>
  );
}
