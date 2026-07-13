"use client";

import { useWishlistStore } from "@/store/useWishlistStore";
import { useOrderStore } from "@/store/useOrderStore";
import { AppShell } from "@/components/AppShell";
import { Heart, Trash2, ShoppingBag, ArrowLeft, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function WishlistPage() {
  const router = useRouter();
  const { items, toggleFavorite, clearWishlist } = useWishlistStore();
  const { setItem } = useOrderStore();

  const handleBuyNow = (product: any) => {
    setItem(product, 1);
    router.push("/checkout");
  };

  return (
    <AppShell active="wishlist">
      <div className="mx-auto max-w-6xl py-12 px-4 space-y-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-extrabold font-display flex items-center gap-3 gradient-text">
              <Heart className="w-8 h-8 fill-rose-500 text-rose-500" />
              Sản phẩm yêu thích
            </h1>
          </div>
          {items.length > 0 && (
            <button 
              onClick={() => {
                if(confirm("Bạn có chắc chắn muốn xoá tất cả?")) clearWishlist();
              }}
              className="text-sm font-semibold text-muted-foreground hover:text-destructive flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Xoá tất cả
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="glass-card rounded-3xl p-16 text-center space-y-6 flex flex-col items-center">
            <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-10 h-10 text-rose-400" />
            </div>
            <h2 className="text-2xl font-bold font-display">Danh sách yêu thích trống</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Bạn chưa lưu sản phẩm nào. Hãy khám phá cửa hàng và lưu lại những món đồ bạn yêu thích nhé!
            </p>
            <Link href="/shop" className="btn-hero px-8 py-3 rounded-xl font-bold inline-block mt-4">
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((p, index) => (
              <div
                key={p.id}
                className="animate-fade-up glass-card rounded-2xl p-4 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-coral-glow flex flex-col group relative"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div 
                  className="relative w-full aspect-square rounded-xl overflow-hidden mb-4 cursor-pointer"
                  onClick={() => router.push(`/shop/${p.id}`)}
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="relative z-10 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-2 left-2 z-20 glass-strong px-2 py-1 rounded-lg text-[10px] font-semibold text-foreground">
                    {p.category}
                  </div>
                </div>
                
                <button 
                  onClick={() => toggleFavorite(p)}
                  className="absolute top-6 right-6 z-30 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-rose-500 hover:scale-110 transition-transform shadow-sm"
                  title="Bỏ yêu thích"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>
                
                <div className="flex-1 flex flex-col">
                  <h3 
                    onClick={() => router.push(`/shop/${p.id}`)}
                    className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors cursor-pointer"
                  >
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-1 mt-auto mb-2 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="font-medium text-foreground">{p.rating}</span>
                  </div>
                  <div className="text-xl font-display font-bold gradient-text mb-4">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                  </div>
                  <button
                    onClick={() => handleBuyNow(p)}
                    className="w-full py-2.5 rounded-xl btn-hero text-sm font-semibold mt-auto flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" /> Mua ngay
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
