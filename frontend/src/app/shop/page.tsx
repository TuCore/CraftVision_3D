"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Search, Star, Sparkles } from "lucide-react";
import { mockProducts, Category } from "@/lib/mock-products";

import { DIYProjectWidget } from "@/components/DIYProjectWidget";

import { TiltCard } from "@/components/TiltCard";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
const categories: ("Tất cả" | Category)[] = [
  "Tất cả",
  "Móc khoá",
  "Vòng tay",
  "Dây chuyền",
  "Charm",
  "Đồ trang trí",
];

export default function ShopPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"Tất cả" | Category>("Tất cả");

  const filteredProducts = useMemo(() => {
    return mockProducts.filter((product) => {
      const matchSearch = product.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === "Tất cả" || product.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [search, selectedCategory]);

  return (
    <AppShell active="shop">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Hero */}
        <section className="relative glass-strong rounded-3xl p-8 md:p-12 overflow-hidden text-center">
          <div className="blob animate-pulse-glow" style={{ top: -50, left: "20%", width: 300, height: 300, background: "oklch(0.74 0.18 55)" }} />
          <div className="blob animate-pulse-glow" style={{ bottom: -50, right: "20%", width: 300, height: 300, background: "oklch(0.72 0.2 25)", animationDelay: "1s" }} />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold font-display leading-tight">
              Khám phá sản phẩm <br />
              <span className="gradient-text">handmade độc đáo</span>
            </h1>
            <p className="mt-4 text-muted-foreground">
              Tìm kiếm các loại hạt, charm, dây và bộ kit tự làm có tích hợp NFC để tạo ra những tác phẩm nghệ thuật của riêng bạn.
            </p>
          </div>
        </section>

        {/* Search & Filter */}
        <section className="space-y-4">
          <div className="relative max-w-md mx-auto md:mx-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm nguyên liệu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-full glass-card border border-border outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? "btn-hero"
                    : "glass-card border border-border hover:bg-white/50 text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Pre-order Banner */}
        <section className="glass-card border-primary/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-up">
          <div>
            <h3 className="font-bold text-lg text-primary flex items-center gap-2">
              <Sparkles className="h-5 w-5" /> Thiết kế theo yêu cầu (Pre-order)
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Bạn muốn mẫu độc lạ? Thời gian hoàn thiện từ 7-10 ngày. Để lại SĐT để được tư vấn thiết kế riêng!
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <button className="btn-hero px-6 py-3 rounded-xl font-semibold whitespace-nowrap shrink-0 hover:scale-105 transition-transform">
                Nhận tư vấn ngay
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white border-primary/20 rounded-3xl shadow-coral-glow p-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-extrabold font-display text-primary flex items-center gap-2">
                  <Sparkles className="h-5 w-5" /> Nhận tư vấn thiết kế riêng
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm leading-relaxed pt-1">
                  Hãy để lại thông tin, đội ngũ <span className="text-[#FF37C0]/60">CraftVision 3D</span> sẽ liên hệ lại với bạn trong thời gian sớm nhất!
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="font-semibold text-foreground/80">Họ và tên</Label>
                  <Input id="name" placeholder="Ví dụ: Nguyễn Văn A" className="rounded-xl border-primary/20 bg-white shadow-sm focus-visible:ring-primary/30" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="font-semibold text-foreground/80">Số điện thoại</Label>
                  <Input id="phone" placeholder="09xxxx..." className="rounded-xl border-primary/20 bg-white shadow-sm focus-visible:ring-primary/30" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="idea" className="font-semibold text-foreground/80">Ý tưởng của bạn</Label>
                  <Textarea 
                    id="idea" 
                    placeholder="Bạn muốn thiết kế móc khóa hình gì, màu sắc ra sao..." 
                    className="min-h-[100px] rounded-xl border-primary/20 bg-white shadow-sm focus-visible:ring-primary/30"
                  />
                </div>
              </div>
              <button className="btn-hero w-full py-2.5 rounded-xl font-semibold text-white">
                Gửi yêu cầu
              </button>
            </DialogContent>
          </Dialog>
        </section>

        {/* Product Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <TiltCard
              key={product.id}
              onClick={() => router.push(`/shop/${product.id}`)}
              className="animate-fade-up glass-card rounded-2xl p-4 shadow-soft transition-all duration-300 hover:shadow-coral-glow cursor-pointer flex flex-col group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-4">
                <div className="absolute inset-0 bg-[color:var(--coral)] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-40 z-0" />
                <img
                  src={product.image}
                  alt={product.name}
                  className="relative z-10 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-2 left-2 z-20 glass-strong px-2 py-1 rounded-lg text-[10px] font-semibold text-foreground">
                  {product.category}
                </div>
                
                {/* AI Recommendation Confidence Label */}
                <div className="absolute bottom-2 right-2 z-20 glass-strong border border-white/40 px-2 py-0.5 rounded-full text-[10px] font-bold text-foreground flex items-center gap-1 shadow-sm">
                  <Sparkles className="h-2.5 w-2.5 text-primary" />
                  <span className="text-primary">{product.matchScore}%</span>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col">
                <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center gap-1 mt-auto mb-2 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-foreground">{product.rating}</span>
                </div>
                <div className="text-xl font-display font-bold gradient-text mb-4">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/shop/${product.id}`);
                  }}
                  className="w-full py-2.5 rounded-xl btn-hero text-sm font-semibold mt-auto"
                >
                  Xem chi tiết
                </button>
              </div>
            </TiltCard>
          ))}
        </section>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            Không tìm thấy sản phẩm nào phù hợp.
          </div>
        )}
      </div>
    </AppShell>
  );
}
