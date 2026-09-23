"use client";

import { use, useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Product } from "@/lib/mock-products";
import { ArrowLeft, ShoppingBag, Star, Minus, Plus, Sparkles } from "lucide-react";
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

          const mappedProduct: Product = {
            id: p.id,
            name: p.name,
            price: p.price,
            category: p.categoryName || "Khác",
            image: p.sampleImageUrl || p.thumbnailUrl || "/image/placeholder.jpg",
            rating: 4.8,
            description: p.description || "",
            matchScore: 95,
            productType: p.productType
          };
          setProduct(mappedProduct);

          const mappedRelated = all
            .filter((item: any) => item.id !== id && (item.categoryName === p.categoryName))
            .map((item: any) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              category: item.categoryName || "Khác",
              image: item.sampleImageUrl || item.thumbnailUrl || "/image/placeholder.jpg",
              rating: 4.7,
              description: item.description || "",
              matchScore: 90
            }))
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

          {/* Left: Image */}
          <div className="relative">
            <div className="blob animate-pulse-glow transition-colors duration-1000" style={{ top: "5%", left: "5%", width: "90%", height: "90%", background: ambientLight.primary }} />
            <div className="blob animate-pulse-glow transition-colors duration-1000" style={{ top: "15%", left: "15%", width: "70%", height: "70%", background: ambientLight.secondary, animationDelay: "1s" }} />
            <div className="blob animate-pulse-glow transition-colors duration-1000" style={{ top: "25%", left: "25%", width: "50%", height: "50%", background: "var(--clay)", animationDelay: "2s" }} />
            <div className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-coral-glow border border-white/30">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
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
              <button
                onClick={() => {
                  toggleFavorite(product);
                  toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
                }}
                className="w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 text-base transition-colors btn-hero text-white"
              >
                <ShoppingBag className="h-5 w-5" />
                Thêm vào giỏ hàng
              </button>

              <div
                onClick={() => router.push(`/shop/${product.id}/greeting`)}
                className="w-full mt-4 cursor-pointer relative overflow-hidden rounded-2xl border border-[color:var(--coral)] bg-[color:var(--coral)]/5 hover:bg-[color:var(--coral)]/10 transition-colors p-5 flex flex-col sm:flex-row items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[color:var(--coral)]/20 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-[color:var(--coral)]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground group-hover:text-[color:var(--coral)] transition-colors">Thiết kế câu chúc riêng</h3>
                    <p className="text-xs text-muted-foreground mt-1">Gửi gắm thông điệp cá nhân qua thiệp NFC thông minh.</p>
                  </div>
                </div>
                <div className="bg-[color:var(--coral)] text-white px-4 py-2 rounded-xl text-sm font-semibold shrink-0">
                  Thiết kế ngay
                </div>
              </div>

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
                      <span className="font-medium text-foreground">{p.rating}</span>
                    </div>
                    <div className="text-xl font-display font-bold gradient-text mb-4">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/shop/${p.id}`);
                      }}
                      className="w-full py-2.5 rounded-xl btn-hero text-sm font-semibold mt-auto"
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
