"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Search, Star, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Product, Category } from "@/lib/mock-products";

import { TiltCard } from "@/components/TiltCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const categories: ("Tất cả" | "Móc khoá" | "Vòng tay" | "Dây chuyền" | "Charm" | "Đồ trang trí")[] = [
  "Tất cả",
  "Móc khoá",
  "Vòng tay",
  "Dây chuyền",
  "Charm",
  "Đồ trang trí",
];

export default function ShopPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<"Tất cả" | Category | string>("Tất cả");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          const items = data.items || [];
          // Map backend ProductDto to frontend Product interface
          const mapped = items.map((p: any) => {
            let cat = p.categoryName || "Khác";
            const nameLower = p.name.toLowerCase();
            if (nameLower.includes("charm")) cat = "Charm";
            else if (nameLower.includes("móc khóa") || nameLower.includes("móc khoá")) cat = "Móc khoá";
            else if (nameLower.includes("dây chuyền")) cat = "Dây chuyền";
            else if (nameLower.includes("vòng tay")) cat = "Vòng tay";
            else if (nameLower.includes("đồ trang trí") || nameLower.includes("decor")) cat = "Đồ trang trí";

            return {
              id: p.id,
              name: p.name,
              price: p.price,
              category: cat,
              image: p.sampleImageUrl || p.thumbnailUrl || "/image/placeholder.jpg",
              rating: parseFloat((4.8 + Math.random() * 0.2).toFixed(1)), // Fake rating for now
              description: p.description || "",
              matchScore: Math.floor(85 + Math.random() * 15), // Fake score
            };
          });
          setProducts(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchSearch = product.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === "Tất cả" || product.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [search, selectedCategory, products]);

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
        <Dialog>
          <section className="glass-card border-primary/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-up">
            <div>
              <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                <Sparkles className="h-5 w-5" /> Thiết kế theo yêu cầu (Pre-order)
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Bạn muốn mẫu độc lạ? Thời gian hoàn thiện từ 7-10 ngày. Để lại SĐT để được tư vấn thiết kế riêng!
              </p>
            </div>
            <DialogTrigger asChild>
              <button 
                className="btn-hero px-6 py-3 rounded-xl font-semibold whitespace-nowrap shrink-0 hover:scale-105 transition-transform"
              >
                Nhận tư vấn ngay
              </button>
            </DialogTrigger>
          </section>
          <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6 border-primary/20">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold font-display text-primary flex items-center gap-2">
                <Sparkles className="h-5 w-5" /> Đăng ký nhận tư vấn
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Họ và tên</label>
                <input 
                  type="text" 
                  placeholder="Nhập tên của bạn" 
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Số điện thoại</label>
                <input 
                  type="tel" 
                  placeholder="Nhập số điện thoại" 
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ý tưởng của bạn (Không bắt buộc)</label>
                <textarea 
                  placeholder="Mô tả ngắn gọn thiết kế bạn muốn..." 
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 h-20 resize-none outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => toast.success("Đã gửi thông tin! Chúng tôi sẽ liên hệ sớm nhất.")}
                className="w-full btn-hero px-6 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
              >
                Gửi yêu cầu
              </button>
            </div>
          </DialogContent>
        </Dialog>

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
