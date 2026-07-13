"use client";

import React, { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ArrowLeft, Sparkles, Upload } from "lucide-react";
import { useOrderStore } from "@/store/useOrderStore";
import { toast } from "sonner";
import { Product } from "@/lib/mock-products";

export default function StudioPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: productId } = use(params);
  const { setItem } = useOrderStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(productId !== "custom-design");

  const [sourceType, setSourceType] = useState<"image" | "text">("image");
  const [quality, setQuality] = useState<"fast" | "balance" | "high">("balance");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [currentModel, setCurrentModel] = useState("https://modelviewer.dev/shared-assets/models/Astronaut.glb");
  const [uploadImage, setUploadImage] = useState<string | null>(null);
  const [style, setStyle] = useState("Cách điệu");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (productId === "custom-design") {
      setProduct({
        id: "custom-design",
        name: "Thiết kế theo yêu cầu",
        price: 150000,
        category: "Custom",
        image: "/image/placeholder.jpg",
        rating: 5.0,
        description: "Bạn có thể tự do mô tả hoặc tải ảnh lên để AI tạo ra món đồ thủ công 3D mang đậm dấu ấn cá nhân. Sau khi tạo xong, bạn có thể lưu mô hình và tiến hành đặt hàng.",
        matchScore: 100
      });
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`);
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
            matchScore: 95
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setUploadImage(url);
    }
  };

  useEffect(() => {
    // Load model-viewer script dynamically for the demo
    if (typeof window !== "undefined" && !customElements.get("model-viewer")) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
      document.head.appendChild(script);
    }
  }, []);

  const handleMockGenerate = () => {
    setCurrentModel("https://modelviewer.dev/shared-assets/models/Astronaut.glb");

    setIsGenerating(true);
    setProgress(0);
    setShowResult(false);
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 15) + 5;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setIsGenerating(false);
          setShowResult(true);
        }, 500);
      }
      setProgress(currentProgress);
    }, 600);
  };

  const handleSaveModel = () => {
    if (!product) return;
    
    const productToAdd = {
      ...product,
      id: productId === "custom-design" ? `custom-${Date.now()}` : product.id,
    };

    const quantity = 1;
    
    setItem(productToAdd, 1, {
      giftTitle: `Thiết kế 3D: ${product.name}`,
      senderName: "Khách hàng",
      receiverName: "Khách hàng",
      message: "Quà tặng Custom từ Studio 3D",
      messageSource: "AI",
      theme: "Galaxy",
      threeDModelUrl: currentModel,
      previewImageUrl: currentModel,
      threeDModelType: "GLB",
      mediaFileIds: []
    });

    toast.success("Đã lưu thiết kế! Đang chuyển đến trang thanh toán...");
    router.push("/checkout");
  };

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
    return (
      <AppShell active="shop">
        <div className="flex items-center justify-center min-h-[50vh]">
          Sản phẩm không tồn tại.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell active="shop">
      <div className="mx-auto max-w-6xl py-8 px-4 space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold font-display gradient-text flex items-center gap-2">
              <Sparkles className="h-6 w-6" /> Studio 3D
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Đang thiết kế: <span className="font-semibold text-foreground">{product.name}</span></p>
          </div>
        </div>

        <div className="bg-card/40 border border-border rounded-3xl overflow-hidden flex flex-col md:flex-row h-[70vh] shadow-xl">
          {/* Controls */}
          <div className="w-full md:w-[380px] flex flex-col gap-4 overflow-y-auto custom-scrollbar border-b md:border-b-0 md:border-r border-border p-6 bg-white/50 backdrop-blur-md">
            <div className="flex rounded-xl bg-muted p-1 text-sm font-medium">
              <button 
                onClick={() => setSourceType("image")}
                className={`flex-1 rounded-lg px-3 py-2.5 transition-colors ${sourceType === "image" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >Ảnh → 3D</button>
              <button 
                onClick={() => setSourceType("text")}
                className={`flex-1 rounded-lg px-3 py-2.5 transition-colors ${sourceType === "text" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >Văn bản → 3D</button>
            </div>
            
            {sourceType === "image" ? (
              <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center hover:bg-primary/10 transition-colors cursor-pointer relative overflow-hidden min-h-[120px] flex flex-col justify-center items-center group" onClick={() => fileInputRef.current?.click()}>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleImageSelect}
                />
                {uploadImage ? (
                  <>
                    <img src={uploadImage} alt="Uploaded" className="max-h-32 w-full object-contain" />
                    <button onClick={(e) => { e.stopPropagation(); setUploadImage(null); }} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 shadow-md z-10 backdrop-blur-md">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm text-primary group-hover:scale-110 transition-transform">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div className="text-sm font-bold text-foreground">Kéo thả ảnh vào đây</div>
                    <div className="text-xs text-muted-foreground mt-1">PNG, JPG tối đa 10MB</div>
                  </>
                )}
              </div>
            ) : (
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Mô tả vật thể</label>
                <textarea rows={3} placeholder="Ví dụ: chiếc cốc gốm sứ màu cam pastel, có hình chú mèo mập..." className="w-full resize-none rounded-xl border border-border bg-white p-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50 transition-colors shadow-sm" />
              </div>
            )}

            {sourceType === "image" && (
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Mô tả bổ sung (tuỳ chọn)</label>
                <textarea rows={2} placeholder="Chi tiết bạn muốn AI chú ý..." className="w-full resize-none rounded-xl border border-border bg-white p-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50 transition-colors shadow-sm"></textarea>
              </div>
            )}
            
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Phong cách</label>
              <div className="grid grid-cols-2 gap-2">
                {["Thực tế", "Cách điệu", "Hoạt hình", "Điêu khắc"].map(s => (
                  <button 
                    key={s}
                    onClick={() => setStyle(s)}
                    className={style === s ? "rounded-xl py-2.5 text-sm font-semibold text-white shadow-md btn-hero" : "rounded-xl py-2.5 text-sm font-medium bg-white border border-border hover:border-primary/30 hover:text-primary transition-all"}
                  >{s}</button>
                ))}
              </div>
            </div>
            
            <div className="mt-auto">
              {isGenerating ? (
                <div className="rounded-2xl p-4 border border-border bg-white shadow-sm">
                  <div className="flex justify-between items-center mb-3 text-sm font-bold">
                    <span className="text-primary flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
                      Đang tạo mô hình 3D...
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-[color:var(--coral)] transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="text-[11px] text-muted-foreground text-center mt-3 font-medium">
                    Quá trình này có thể mất từ 15-30 giây
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={handleMockGenerate}
                    className="rounded-2xl py-3.5 text-base font-bold text-white shadow-coral-glow btn-hero w-full"
                  >
                    Tạo mô hình 3D (Demo)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-white to-orange-50/50">
            <div className="absolute inset-10 rounded-[3rem] radial-bg opacity-40 pointer-events-none"></div>
            
            {showResult ? (
              <div className="absolute inset-0 z-10 w-full h-full flex items-center justify-center p-8 pb-20 animate-fade-in-page">
                {React.createElement('model-viewer', {
                  src: currentModel,
                  "auto-rotate": true,
                  "camera-controls": true,
                  style: { width: '100%', height: '100%', outline: 'none' },
                  "environment-image": "neutral",
                  exposure: "1"
                })}
              </div>
            ) : (
              <div className="relative" style={{perspective: '800px'}}>
                <div className={`cube relative ${isGenerating ? 'animate-spin-slow' : 'opacity-40'}`} style={{width: '160px', height: '160px'}}>
                  <div className="face fA"></div><div className="face fB"></div>
                  <div className="face fC"></div><div className="face fD"></div>
                  <div className="face fE"></div><div className="face fF"></div>
                </div>
              </div>
            )}
            
            {/* Toolbar bottom */}
            {showResult && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 w-max z-20 bg-white/80 backdrop-blur-xl p-2 rounded-2xl shadow-xl border border-white/40 animate-fade-up">
                <button onClick={() => setShowResult(false)} className="rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-muted transition-colors flex items-center gap-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                  Làm lại
                </button>
                <div className="w-px bg-border my-2"></div>
                <button 
                  onClick={handleSaveModel}
                  className="rounded-xl px-6 py-2.5 text-sm text-white font-bold shadow-coral-glow btn-hero flex items-center gap-2 hover:scale-105 transition-transform"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                  Lưu & Đặt hàng
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
