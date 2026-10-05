"use client";

import { use, useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Product } from "@/lib/product.types";
import { ArrowLeft, ShoppingBag, Star, Minus, Plus, Sparkles, ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useWishlistStore } from "@/store/useWishlistStore";
import { toast } from "sonner";
import { useProductReviews } from "@/hooks/useReviews";
import React from "react";
import { ReviewList } from "@/components/ReviewList";

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { toggleFavorite } = useWishlistStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isGuest, setIsGuest] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);


  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsGuest(!localStorage.getItem("token"));
    }
  }, []);
  // Fetch reviews for rating
  const { data: reviews } = useProductReviews(id);
  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((acc, r) => acc + r.rating, 0);
    return total / reviews.length;
  }, [reviews]);

  useEffect(() => {
    // Load model-viewer script dynamically for the demo
    if (typeof window !== "undefined" && !customElements.get("model-viewer")) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, allRes] = await Promise.all([
          fetch(`/api/products/${id}`),
          fetch(`/api/products`)
        ]);

        if (prodRes.ok && allRes.ok) {
          const p = await prodRes.json();
          const allData = await allRes.json();
          const all = allData.items || [];

          const parsedImages = p.sampleImageUrl ? p.sampleImageUrl.split(',') : (p.images?.map((img: any) => img.url) || []);
          const mappedProduct: Product = {
            id: p.id,
            name: p.name,
            price: p.price,
            category: p.categoryName || "Khác",
            image: parsedImages.length > 0 ? parsedImages[0] : (p.thumbnailUrl || "/image/placeholder.jpg"),
            rating: p.averageRating || 0,
            description: p.description || "",
            matchScore: 0,
            productType: p.productType,
            images: parsedImages,
            isComingSoon: p.isComingSoon
          };
          setProduct(mappedProduct as any);

          const mappedRelated = all
            .filter((item: any) => item.id !== id && (item.categoryName === p.categoryName))
            .map((item: any) => {
              const itemImages = item.sampleImageUrl ? item.sampleImageUrl.split(',') : (item.images?.map((img: any) => img.url) || []);
              return {
              id: item.id,
              name: item.name,
              price: item.price,
              category: item.categoryName || "Khác",
              image: itemImages.length > 0 ? itemImages[0] : (item.thumbnailUrl || "/image/placeholder.jpg"),
              rating: item.averageRating || 0,
              description: item.description || "",
              matchScore: 0
            }})
            .slice(0, 4);

          setRelatedProducts(mappedRelated);
        } else if (prodRes.status === 404) {
          notFound();
        }
      } catch (error) {
        console.error("Error fetching product", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!isLoading && typeof window !== "undefined" && window.location.hash === "#reviews") {
      setTimeout(() => {
        document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [isLoading]);

  const ambientLight = useMemo(() => {
    if (!product) return { primary: "var(--coral)", secondary: "var(--butter)" };
    switch (product.category) {
      case "Móc khoá": return { primary: "oklch(0.6 0.2 300)", secondary: "var(--sage)" }; // Tím mộng mơ
      case "Charm": return { primary: "var(--coral)", secondary: "var(--butter)" };
      case "Vòng tay": return { primary: "oklch(0.65 0.15 220)", secondary: "var(--sage)" }; // Xanh biển
      case "Dây chuyền": return { primary: "var(--clay)", secondary: "var(--butter)" };
      case "Đồ trang trí": return { primary: "oklch(0.7 0.2 100)", secondary: "var(--butter)" };
      default: return { primary: "var(--coral)", secondary: "var(--butter)" };
    }
  }, [product]);

  if (isLoading) {
    return (
      <AppShell active="shop">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
      </AppShell>
    );
  }

  if (!product) {
    notFound();
  }

  const handleDecrease = () => setQuantity((prev) => Math.max(1, prev - 1));
  const handleIncrease = () => setQuantity((prev) => prev + 1);

  return (
    <AppShell active="shop">
      <div className="mx-auto max-w-6xl space-y-16">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4">
          <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{product.category}</span>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Left: Image Gallery */}
          <div className="relative flex flex-col gap-4">
            <div className="relative">
              <div className="blob animate-pulse-glow transition-colors duration-1000" style={{ top: "5%", left: "5%", width: "90%", height: "90%", background: ambientLight.primary }} />
              <div className="blob animate-pulse-glow transition-colors duration-1000" style={{ top: "15%", left: "15%", width: "70%", height: "70%", background: ambientLight.secondary, animationDelay: "1s" }} />
              <div className="blob animate-pulse-glow transition-colors duration-1000" style={{ top: "25%", left: "25%", width: "50%", height: "50%", background: "var(--clay)", animationDelay: "2s" }} />
              <div className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-coral-glow border border-white/30 group">
                <img
                  src={((product as any).images?.length > 0 ? (product as any).images[activeImageIndex] : product.image) || product.image}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${(product as any).isComingSoon ? 'blur-[8px] opacity-80' : ''}`}
                />
                
                {(product as any).isComingSoon && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-sm transition-all duration-500">
                    <div className="px-8 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-white/90 text-sm font-medium tracking-[0.25em] shadow-2xl backdrop-blur-md">
                      COMING SOON
                    </div>
                  </div>
                )}
                
                {/* Image Navigation Arrows */}
                {!(product as any).isComingSoon && (product as any).images && (product as any).images.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex(prev => prev === 0 ? (product as any).images.length - 1 : prev - 1);
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-black shadow-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex(prev => prev === (product as any).images.length - 1 ? 0 : prev + 1);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-black shadow-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    
                  </>
                )}
              </div>
              
              {/* Thumbnails */}
              {(product as any).images && (product as any).images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <style>{`
                    .flex.gap-2.overflow-x-auto::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                  {(product as any).images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${activeImageIndex === idx ? 'border-[color:var(--coral)]' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    >
                      <img src={img} alt={`Thumbnail ${idx}`} className={`w-full h-full object-cover ${(product as any).isComingSoon ? 'blur-[4px] opacity-80' : ''}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Info */}
          <div className="glass-card rounded-3xl p-8 md:p-10 flex flex-col">
            <div className="inline-block glass-strong px-3 py-1.5 rounded-xl text-xs font-semibold text-foreground w-fit mb-4 border border-white/40">
              {product.category}
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold font-display leading-tight mb-4 text-foreground">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center text-amber-400">
                <Star className="h-4 w-4 fill-current" />
              </div>
              <span className="font-semibold text-foreground">{averageRating > 0 ? averageRating.toFixed(1) : 'Chưa có đánh giá'}</span>
              {reviews && reviews.length > 0 && (
                <span className="text-muted-foreground text-sm">({reviews.length} đánh giá)</span>
              )}
            </div>

            <div className="text-4xl font-bold font-display gradient-text mb-6">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
            </div>

            <p className="text-muted-foreground leading-relaxed mb-8">
              {product.description}
            </p>

            <div className="border-t border-border w-full mb-8" />

            <div className="flex items-center gap-4 mb-8">
              <span className="font-medium text-sm">Số lượng:</span>
              <div className="flex items-center glass-strong rounded-xl border border-white/40">
                <button
                  onClick={handleDecrease}
                  className="w-10 h-10 flex items-center justify-center hover:bg-white/50 rounded-l-xl transition-colors text-foreground"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="w-12 text-center font-semibold text-foreground">{quantity}</div>
                <button
                  onClick={handleIncrease}
                  className="w-10 h-10 flex items-center justify-center hover:bg-white/50 rounded-r-xl transition-colors text-foreground"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-auto">
              {product.isComingSoon ? (
                <div className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-base text-white bg-neutral-400 cursor-not-allowed">
                  <span className="tracking-wider">COMING SOON</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (isGuest) {
                      toast.info("Vui lòng đăng nhập để thêm vào giỏ hàng!");
                      router.push("/auth");
                      return;
                    }
                    toggleFavorite(product);
                    toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
                    router.push("/cart");
                  }}
                  className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-base text-white bg-gradient-to-r from-[#f98fa2] via-[#f77991] to-[#f56682] hover:from-[#f87e95] hover:to-[#f25273] shadow-lg shadow-rose-300/40 hover:shadow-rose-400/50 border border-white/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Thêm vào giỏ hàng
                </button>
              )}

              {!product.isComingSoon && (
                <>
                  {/* Component 1: Thiết kế câu chúc riêng với MẪU MẶC ĐỊNH (Không chọn mẫu web) */}
                  <div
                    onClick={() => {
                      if (isGuest) {
                        toast.info("Vui lòng đăng nhập để thiết kế thiệp!");
                        router.push("/auth");
                        return;
                      }
                      router.push(`/shop/${product.id}/greeting?mode=default`);
                    }}
                    className="w-full mt-3 cursor-pointer relative overflow-hidden rounded-2xl border border-[color:var(--coral)] bg-[color:var(--coral)]/5 hover:bg-[color:var(--coral)]/10 transition-all p-4.5 flex flex-col sm:flex-row items-center justify-between gap-4 group shadow-xs hover:shadow-md"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[color:var(--coral)]/20 flex items-center justify-center shrink-0">
                        <Sparkles className="h-5 w-5 text-[color:var(--coral)]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-foreground group-hover:text-[color:var(--coral)] transition-colors text-sm sm:text-base">
                            Thiết kế câu chúc riêng
                          </h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[color:var(--coral)]/15 text-[color:var(--coral)] font-bold shrink-0">
                            Mẫu mặc định
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Dùng mẫu thiệp mặc định cố định ban đầu, không qua bước chọn mẫu web.
                        </p>
                      </div>
                    </div>
                    <div className="bg-[color:var(--coral)] text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shrink-0 shadow-coral-glow group-hover:scale-105 transition-transform">
                      Thiết kế ngay
                    </div>
                  </div>

                  {/* Component 2: Thiết kế theo mẫu có sẵn (Kho mẫu thiệp Web) */}
                  <div
                    onClick={() => {
                      if (isGuest) {
                        toast.info("Vui lòng đăng nhập để thiết kế thiệp!");
                        router.push("/auth");
                        return;
                      }
                      router.push(`/shop/${product.id}/greeting`);
                    }}
                    className="w-full cursor-pointer relative overflow-hidden rounded-2xl border border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 transition-all p-4.5 flex flex-col sm:flex-row items-center justify-between gap-4 group shadow-xs hover:shadow-md"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                        <LayoutGrid className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors text-sm sm:text-base">
                            Chọn mẫu thiệp từ thư viện Web
                          </h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold shrink-0">
                            16 mẫu 3D
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Lựa chọn trong kho mẫu thiệp phong phú (Trung thu, Sinh nhật, Tình yêu...).
                        </p>
                      </div>
                    </div>
                    <div className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shrink-0 transition-transform group-hover:scale-105">
                      Chọn mẫu web
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={() => router.push("/shop")}
                className="w-full mt-2 py-4 rounded-2xl glass-card border border-border hover:bg-white/50 transition-colors font-semibold flex items-center justify-center gap-2 text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
                Quay lại cửa hàng
              </button>
            </div>
          </div>
        </div>

        {/* Product Reviews */}
        <div id="reviews">
          <ReviewList productId={id} productName={product.name} />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="pt-8">
            <h2 className="text-2xl font-bold font-display gradient-text mb-6">
              Có thể bạn cũng thích
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p, index) => (
                <div
                  key={p.id}
                  onClick={() => router.push(`/shop/${p.id}`)}
                  className="animate-fade-up glass-card rounded-2xl p-4 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-coral-glow cursor-pointer flex flex-col group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-4">
                    <div className="absolute inset-0 bg-[color:var(--coral)] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-40 z-0" />
                    <img
                      src={p.image}
                      alt={p.name}
                      className="relative z-10 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-2 left-2 z-20 glass-strong px-2 py-1 rounded-lg text-[10px] font-semibold text-foreground">
                      {p.category}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {p.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-auto mb-2 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="font-medium text-foreground">{p.rating > 0 ? p.rating : "Chưa có đánh giá"}</span>
                    </div>
                    <div className="text-xl font-display font-bold gradient-text mb-4">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/shop/${p.id}`);
                      }}
                      className="w-full py-2.5 rounded-xl btn-hero text-black text-sm font-semibold mt-auto"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
