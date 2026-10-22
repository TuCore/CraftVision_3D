"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import Link from "next/link";
import { Search, Star, Sparkles, Loader2, Heart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Product, Category } from "@/lib/product.types";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useProductCategories } from "@/hooks/useProductCategories";
import api from "@/lib/api";
import { getAccessToken } from "@/lib/authSession";

import { TiltCard } from "@/components/TiltCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslation } from "@/components/LanguageProvider";

// removed hardcoded categories

export default function ShopPage() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isFavorite, toggleFavorite } = useFavoriteStore();
  const { toggleFavorite: addToCart, items: cartItems } = useWishlistStore();
  const { data: categoriesData } = useProductCategories();
  const allCategoryLabel = language === "vi" ? "Tất cả" : "All";
  const dynamicCategories = [allCategoryLabel, ...(categoriesData?.map(c => c.name) || [])];

  const getProductAvailableStock = (product: Product) => {
    if (product.stock === undefined) return 0;
    const prodId = (product.id || '').toLowerCase();
    const inCartQty = cartItems
      .filter((i) => {
        const idToCheck = ((i as any).productId || i.id || i.cartItemId || '').toLowerCase();
        return idToCheck.includes(prodId);
      })
      .reduce((sum, item) => sum + (item.quantity || 1), 0);
    const baseStock = product.availableStock !== undefined ? product.availableStock : product.stock;
    const localPending = Math.max(0, inCartQty - (product.reservedStock || 0));
    return Math.max(0, baseStock - localPending);
  };

  const handleAddToCart = (product: Product) => {
    const token = getAccessToken();
    if (!token) {
      toast.info(language === "vi" ? "Vui lòng đăng nhập để thêm vào giỏ hàng!" : "Please login to add to cart!");
      router.push("/auth");
      return;
    }

    const availableStock = getProductAvailableStock(product);
    if (availableStock <= 0) {
      toast.error(language === "vi" ? "Sản phẩm đã hết hàng trong kho!" : "Product is out of stock!");
      return;
    }

    addToCart(product, {
      hasGreeting: false,
      customQuantity: 1,
    });
    toast.success(
      language === "vi" 
        ? `Đã thêm "${product.name}" vào giỏ hàng!` 
        : `Added "${product.name}" to cart!`,
      {
        action: {
          label: language === "vi" ? "Xem giỏ hàng" : "View cart",
          onClick: () => router.push("/cart"),
        },
      }
    );
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get('/api/products?page=1&pageSize=100', {
          params: { _t: Date.now() },
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        });
        const items = data.items || [];
        // Map backend ProductDto to frontend Product interface
        const mapped = items.map((p: any) => {
          const parsedImages = p.sampleImageUrl ? p.sampleImageUrl.split(',') : (p.images || []);
          const primary = parsedImages.length > 0 ? parsedImages[0] : (p.thumbnailUrl || "/image/placeholder.jpg");
          return {
            id: p.id,
            name: p.name,
            price: p.price,
            category: p.categoryName || "Khác",
            image: primary,
            rating: p.averageRating || 0,
            description: p.description || "",
            matchScore: 0,
            isComingSoon: p.isComingSoon,
            stock: p.stock ?? 0,
            availableStock: p.availableStock ?? p.stock ?? 0,
            reservedStock: p.reservedStock ?? 0,
          };
        });
        setProducts(mapped);
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();

    const handleFocus = () => fetchProducts();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchSearch = product.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === allCategoryLabel || selectedCategory === "Tất cả" || selectedCategory === "All" || product.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [search, selectedCategory, products, allCategoryLabel]);

  return (
    <AppShell active="shop">
      <div className="space-y-8">
        {/* Search & Filter */}
        <section id="products-grid" className="space-y-4 scroll-mt-24">
          <div className="relative max-w-md mx-auto md:mx-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("shop.search_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-full glass-card border border-border outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {dynamicCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? "btn-hero text-black font-bold"
                    : "glass-card border border-border hover:bg-white/50 text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
            <Link
              href="/cards"
              className="inline-flex items-center gap-2 rounded-full border border-amber-400/50 bg-amber-500/10 px-4 py-2 text-sm font-bold text-amber-700 transition-colors hover:bg-amber-500/20 dark:text-amber-300"
            >
              <Sparkles className="h-4 w-4" /> Thư viện Thiệp 3D (54+ mẫu)
            </Link>
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
                className="btn-hero text-black px-6 py-3 rounded-xl font-semibold whitespace-nowrap shrink-0 hover:scale-105 transition-transform"
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

              {/* Liên hệ trực tiếp qua Facebook / Instagram */}
              <div className="pt-1">
                <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground font-medium">
                  <span className="h-px bg-border flex-1" />
                  <span>Hoặc liên hệ trực tiếp qua</span>
                  <span className="h-px bg-border flex-1" />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href="https://www.facebook.com/profile.php?id=61594809743775"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] border border-[#1877F2]/30 font-semibold text-xs transition-all hover:scale-[1.02] shadow-sm"
                  >
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                    </svg>
                    <span>Facebook</span>
                  </a>
                  <a
                    href="https://www.instagram.com/sixc.ent921?stkn=MTNpaDFpZGFicDl2cQ%3D%3D&utm_source=qr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#E1306C]/10 hover:bg-[#E1306C]/20 text-[#E1306C] border border-[#E1306C]/30 font-semibold text-xs transition-all hover:scale-[1.02] shadow-sm"
                  >
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    <span>Instagram</span>
                  </a>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => toast.success("Đã gửi thông tin! Chúng tôi sẽ liên hệ sớm nhất.")}
                className="w-full btn-hero px-6 py-3 rounded-xl text-black font-semibold flex items-center justify-center gap-2"
              >
                Gửi yêu cầu
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Product Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => {
            const availableStock = getProductAvailableStock(product);
            const isOutOfStock = (product.stock !== undefined && product.stock === 0) || availableStock === 0;

            return (
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
                    className={`relative z-10 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${product.isComingSoon || isOutOfStock ? 'blur-[4px] opacity-80' : ''}`}
                  />
                  <div className="absolute top-2 left-2 z-20 glass-strong px-2 py-1 rounded-lg text-[10px] font-semibold text-foreground">
                    {product.category}
                  </div>
                  
                  {product.isComingSoon && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-[2px] transition-all duration-500">
                      <div className="px-5 py-2 rounded-xl bg-black/40 border border-white/10 text-white/90 text-xs font-medium tracking-[0.2em] shadow-xl backdrop-blur-md">
                        COMING SOON
                      </div>
                    </div>
                  )}
                  {!product.isComingSoon && isOutOfStock && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 backdrop-blur-[2px] transition-all duration-500">
                      <div className="px-5 py-2 rounded-xl bg-red-500/80 border border-red-500/30 text-white font-bold text-xs tracking-[0.2em] shadow-xl backdrop-blur-md uppercase">
                        {language === "vi" ? "Hết hàng" : "Out of stock"}
                      </div>
                    </div>
                  )}

                  {/* Heart Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(product.id);
                    }}
                    className="absolute top-2 right-2 z-30 p-2 rounded-full glass-strong hover:bg-white/80 transition-colors"
                  >
                    <Heart
                      className={`h-4 w-4 ${isFavorite(product.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
                    />
                  </button>
                </div>
                
                <div className="flex-1 flex flex-col">
                  <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between gap-1 mt-auto mb-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="font-medium text-foreground">
                        {product.rating > 0 ? product.rating : (language === "vi" ? "Chưa có đánh giá" : "No ratings yet")}
                      </span>
                    </div>
                    {product.stock !== undefined && !product.isComingSoon && (
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                        !isOutOfStock 
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                          : "bg-red-500/10 text-red-500 border-red-500/20"
                      }`}>
                        {!isOutOfStock ? `Kho: ${availableStock}` : (language === "vi" ? "Hết hàng" : "Out of stock")}
                      </span>
                    )}
                  </div>
                  <div className="text-xl font-display font-bold gradient-text mb-4">
                    {new Intl.NumberFormat(language === "vi" ? 'vi-VN' : 'en-US', { style: 'currency', currency: 'VND' }).format(product.price)}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      disabled={product.isComingSoon || isOutOfStock}
                      className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                        isOutOfStock || product.isComingSoon
                          ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60 border border-border"
                          : "bg-gradient-to-r from-[#f98fa2] via-[#f77991] to-[#f56682] hover:from-[#f87e95] hover:to-[#f25273] text-white shadow-sm shadow-rose-300/30 cursor-pointer"
                      }`}
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      <span>{isOutOfStock ? (language === "vi" ? "Hết hàng" : "Out of stock") : (language === "vi" ? "Thêm giỏ" : "Add cart")}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!product.isComingSoon && !isOutOfStock) {
                          router.push(`/shop/${product.id}`);
                        }
                      }}
                      disabled={product.isComingSoon || isOutOfStock}
                      className="py-2.5 rounded-xl btn-hero text-black text-xs font-semibold disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed transition-all"
                    >
                      {product.isComingSoon ? "COMING SOON" : isOutOfStock ? (language === "vi" ? "Hết hàng" : "Out of stock") : t("shop.view_details")}
                    </button>
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </section>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            {t("shop.no_products")}
          </div>
        )}
      </div>
    </AppShell>
  );
}
