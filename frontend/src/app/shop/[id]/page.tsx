"use client";

import { use, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { mockProducts } from "@/lib/mock-products";
import { ArrowLeft, ShoppingBag, Star, Minus, Plus } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { toast } from "sonner";

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { addToCart } = useCart();
  
  const product = useMemo(() => mockProducts.find((p) => p.id === id), [id]);
  
  const [quantity, setQuantity] = useState(1);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return mockProducts
      .filter((p) => p.category === product.category && p.id !== product.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);
  }, [product]);

  const ambientLight = useMemo(() => {
    if (!product) return { primary: "var(--coral)", secondary: "var(--butter)" };
    switch (product.category) {
      case "Handmade Kit": return { primary: "oklch(0.6 0.2 300)", secondary: "var(--sage)" }; // Tím mộng mơ
      case "Charm": return { primary: "var(--coral)", secondary: "var(--butter)" };
      case "Beads": return { primary: "oklch(0.65 0.15 220)", secondary: "var(--sage)" }; // Xanh biển
      case "Bracelet String": return { primary: "var(--clay)", secondary: "var(--butter)" };
      default: return { primary: "var(--coral)", secondary: "var(--butter)" };
    }
  }, [product]);

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
              <span className="font-semibold text-foreground">{product.rating}</span>
              <span className="text-muted-foreground text-sm">(128 đánh giá)</span>
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
                  addToCart(product, quantity);
                  toast.success(`Đã thêm ${quantity} "${product.name}" vào giỏ hàng!`);
                }}
                className="w-full py-4 rounded-2xl btn-hero font-semibold flex items-center justify-center gap-2 text-base"
              >
                <ShoppingBag className="h-5 w-5" />
                Thêm vào giỏ hàng
              </button>
              <button
                onClick={() => router.push("/shop")}
                className="w-full py-4 rounded-2xl glass-card border border-border hover:bg-white/50 transition-colors font-semibold flex items-center justify-center gap-2 text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
                Quay lại cửa hàng
              </button>
            </div>
          </div>
        </div>

        {/* Crafting Journey Timeline (Scroll Storytelling) */}
        <section className="py-12 md:py-20 relative">
          <div className="absolute top-0 bottom-0 left-[27px] md:left-1/2 w-1 bg-border -translate-x-1/2 rounded-full opacity-50" />
          
          <div className="text-center mb-16 relative z-10 animate-fade-up">
            <h2 className="text-3xl md:text-4xl font-extrabold font-display gradient-text">Hành trình chế tác</h2>
            <p className="text-muted-foreground mt-3 text-sm md:text-base">Tận tâm trong từng quá trình thực hiện.</p>
          </div>

          <div className="space-y-12 relative z-10">
            {[
              { step: 1, title: "Chuẩn bị nguyên liệu", desc: <>Nhận hộp <span className="text-[#FF37C0]/60">CraftVision</span>, kiểm tra hạt cườm, charm và dây xem đã đủ chưa. Sắp xếp ra khay gỗ để dễ lấy.</> },
              { step: 2, title: "Bắt đầu xâu vòng", desc: "Xâu từng hạt theo pattern màu sắc bạn yêu thích. Nhớ đan xen charm ở giữa để tạo điểm nhấn cá nhân nhé!" },
              { step: 3, title: "Thắt nút cố định", desc: "Sử dụng nút thắt đôi hoặc ba vòng để đảm bảo dây không bị tuột. Nhỏ thêm một giọt keo tàng hình nếu cần." },
              { step: 4, title: "Hoàn thiện & Tận hưởng", desc: "Đeo thử kiệt tác lên tay, chụp một bức ảnh check-in hoặc đóng hộp cẩn thận để làm quà tặng người thương." }
            ].map((journey, idx) => (
              <div key={idx} className="flex flex-col md:flex-row items-center gap-6 md:gap-12 animate-fade-up" style={{ animationDelay: `${idx * 0.15}s` }}>
                <div className={`md:w-1/2 flex w-full pl-16 md:pl-0 ${idx % 2 === 0 ? "md:justify-end" : "md:order-last md:justify-start"}`}>
                  <div className="glass-card p-6 md:p-8 rounded-3xl w-full md:w-4/5 shadow-soft hover:shadow-coral-glow transition-all duration-300 hover:-translate-y-1 group">
                    <h3 className="font-bold text-lg mb-3 text-foreground group-hover:text-primary transition-colors">{journey.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{journey.desc}</p>
                  </div>
                </div>
                
                <div className="w-14 h-14 rounded-full btn-hero flex items-center justify-center font-bold text-xl shadow-coral-glow z-10 flex-shrink-0 md:order-none absolute left-0 md:relative md:left-auto">
                  {journey.step}
                </div>
                
                <div className={`hidden md:block md:w-1/2 ${idx % 2 === 0 ? "md:order-last" : ""}`} />
              </div>
            ))}
          </div>
        </section>

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
