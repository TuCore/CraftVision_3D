"use client";

import { use, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { AIGiftWidget } from "@/components/AIGiftWidget";
import { Product } from "@/lib/mock-products";
import { ArrowLeft, CheckCircle, Store, Package, Clock } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useGreetingStore } from "@/store/useGreetingStore";
import { useCollectionStore } from "@/store/useCollectionStore";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export default function GreetingDesignPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from3d = searchParams.get('from') === '3d';
  const modelUrl = searchParams.get('modelUrl');
  const customName = searchParams.get('customName');
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [message, setMessage] = useState("");
  const [greetingImage, setGreetingImage] = useState<string | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<'link' | 'qr'>('link');
  const { toggleFavorite, items } = useWishlistStore();
  const { saveItem } = useCollectionStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const p = await res.json();
          setProduct({
            id: p.id,
            name: p.name,
            price: p.price,
            category: p.categoryName || "Khác",
            image: p.sampleImageUrl || p.thumbnailUrl || "/image/placeholder.jpg",
            rating: 4.8,
            description: p.description || "",
            matchScore: 95,
            productType: p.productType
          });
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (from3d && modelUrl) {
      if (!customElements.get("model-viewer")) {
        const script = document.createElement("script");
        script.type = "module";
        script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
        document.head.appendChild(script);
      }
    }
  }, [from3d, modelUrl]);

  useEffect(() => {
    if (product) {
      const cartItem = items.find(i => i.id === product.id && i.hasGreeting);
      if (cartItem) {
        if (cartItem.greetingMessage && !message) setMessage(cartItem.greetingMessage);
        if (cartItem.greetingImage && !greetingImage) setGreetingImage(cartItem.greetingImage);
      }
    }
  }, [product, items]);

  const store = useGreetingStore();

  const handleConfirm = () => {
    if (product) {
      let finalProduct = product;
      if (from3d && modelUrl) {
        finalProduct = {
          ...product,
          name: customName || "Thiết kế 3D",
          price: 0,
          category: "3D",
          is3D: true,
          modelUrl: modelUrl,
        } as any;
      }
      
      toggleFavorite(finalProduct, true, message, greetingImage || undefined, store.senderName, store.receiverName);
      toast.success("Đã thêm sản phẩm kèm thiệp vào giỏ hàng!");
      router.push("/cart");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGreetingImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!product) {
    return (
      <AppShell active="shop">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell active="shop">
      <div className="mx-auto max-w-6xl space-y-8 py-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2.5 bg-card hover:bg-muted border border-border shadow-sm rounded-full transition-all hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold font-display gradient-text">
              Thiết kế câu chúc riêng
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Gửi gắm yêu thương qua từng thông điệp cá nhân hoá.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Product Preview */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card rounded-3xl p-5 shadow-soft border border-white/40 sticky top-24">
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-5">
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors z-10 pointer-events-none" />
                {from3d && modelUrl ? (
                  // @ts-ignore
                  <model-viewer
                    src={modelUrl}
                    auto-rotate
                    camera-controls
                    shadow-intensity="1"
                    environment-image="neutral"
                    style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
                    className="relative z-0"
                  ></model-viewer>
                ) : (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover relative z-0"
                  />
                )}
                {!from3d && (
                  <div className="absolute top-3 left-3 z-20 glass-strong px-2.5 py-1 rounded-lg text-[10px] font-bold text-foreground shadow-sm">
                    {product.category}
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold font-display leading-tight mb-2 text-foreground">
                {from3d && customName ? customName : product.name}
              </h3>
              {!from3d && (
                <div className="text-xl font-bold font-display gradient-text mb-4">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                </div>
              )}
              {from3d ? (
                <div className="space-y-3 mt-4">
                  <p className="text-sm font-semibold text-foreground">Hình thức nhận thiết kế 3D:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setDeliveryMethod('link')}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${deliveryMethod === 'link' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:bg-muted text-muted-foreground'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                      <span className="font-semibold text-sm">Gửi Link web</span>
                    </button>
                    <button 
                      onClick={() => setDeliveryMethod('qr')}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${deliveryMethod === 'qr' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:bg-muted text-muted-foreground'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>
                      <span className="font-semibold text-sm">Tạo mã QR</span>
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {deliveryMethod === 'link' 
                      ? 'Gửi đường link trực tiếp cho người nhận qua tin nhắn, mạng xã hội.' 
                      : 'Lưu mã QR thành hình ảnh để in lên thiệp, quà tặng vật lý.'}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm text-primary/80 leading-relaxed">
                  Thiệp vật lý tích hợp NFC sẽ được đóng gói cẩn thận cùng sản phẩm này, mang đến trải nghiệm mở quà bất ngờ cho người nhận.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: AI Gift Widget & Image Upload */}
          <div className="lg:col-span-8">
            <div className="glass-card rounded-3xl p-6 md:p-8 space-y-8 shadow-soft border border-white/40">
              
              <AIGiftWidget 
                receiverName="" 
                senderName="" 
                value={message} 
                onChange={setMessage} 
              />
              
              {/* Image Upload Section */}
              <div className="border-t border-border/50 pt-8">
                <h2 className="text-xl font-bold font-display mb-4">Ảnh in trên thiệp (Tuỳ chọn)</h2>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-primary/30 flex items-center justify-center bg-primary/5 overflow-hidden relative shrink-0">
                    {greetingImage ? (
                      <>
                        <img src={greetingImage} alt="Uploaded" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => setGreetingImage(null)}
                          className="absolute top-2 right-2 bg-black/50 hover:bg-black text-white rounded-full p-1 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mx-auto text-primary/50 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs text-muted-foreground">Chưa có ảnh</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-sm text-muted-foreground mb-3">Tải lên một bức ảnh kỷ niệm để in lên mặt trước của thiệp NFC.</p>
                    <label className="inline-block cursor-pointer px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-semibold rounded-xl transition-colors">
                      <span>Chọn ảnh tải lên</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border/50 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-8">
                <button
                  onClick={() => router.back()}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold border border-border hover:bg-muted transition-colors text-foreground"
                >
                  Hủy thiết kế
                </button>
                {from3d && modelUrl && (
                  <button
                    onClick={() => {
                      saveItem({
                        title: customName || product?.name || "Thiết kế 3D",
                        modelUrl: modelUrl
                      });
                      toast.success("Đã lưu vào bộ sưu tập!");
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold border-2 border-primary text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    Lưu
                  </button>
                )}
                <button
                  onClick={handleConfirm}
                  className="w-full sm:w-auto btn-hero px-8 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-coral-glow"
                >
                  <CheckCircle className="w-5 h-5" />
                  Xác nhận và thêm vào giỏ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
