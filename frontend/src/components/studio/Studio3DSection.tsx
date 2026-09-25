"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  History, 
  Upload, 
  X, 
  RotateCw, 
  Sliders, 
  Download, 
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

interface Studio3DSectionProps {
  id?: string;
  className?: string;
  rightColumnHeader?: React.ReactNode;
}

const mockHistory = [
  { id: 1, title: "Mô hình phi hành gia chibi", date: "Hôm qua", time: "14:30" },
  { id: 2, title: "Chiếc cốc gốm họa tiết hoa", date: "2 ngày trước", time: "09:15" },
  { id: 3, title: "Hộp quà trái tim 3D", date: "3 ngày trước", time: "20:00" },
  { id: 4, title: "Mặt dây chuyền hoa sen", date: "Tuần trước", time: "16:45" },
];

export function Studio3DSection({ id = "studio-3d", className = "", rightColumnHeader }: Studio3DSectionProps) {
  const router = useRouter();
  const [sourceType, setSourceType] = useState<"image" | "text">("image");
  const [quality, setQuality] = useState<"fast" | "balance" | "high">("balance");
  const [style, setStyle] = useState("Cách điệu");
  const [promptText, setPromptText] = useState("");
  const [subPrompt, setSubPrompt] = useState("");
  const [uploadImage, setUploadImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [currentModel, setCurrentModel] = useState("https://modelviewer.dev/shared-assets/models/Astronaut.glb");
  const [isNamePopupOpen, setIsNamePopupOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAutoRotate, setIsAutoRotate] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamic import model-viewer script if needed
    if (typeof window !== "undefined" && !customElements.get("model-viewer")) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
        setIsHistoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setUploadImage(url);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const url = URL.createObjectURL(e.dataTransfer.files[0]);
      setUploadImage(url);
    }
  };

  const handleMockGenerate = () => {
    setCurrentModel("https://modelviewer.dev/shared-assets/models/Astronaut.glb");
    setIsGenerating(true);
    setProgress(0);
    setShowResult(false);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 15) + 6;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setIsGenerating(false);
          setShowResult(true);
          toast.success("Đã hoàn tất tạo mô hình 3D!");
        }, 500);
      }
      setProgress(currentProgress);
    }, 500);
  };

  const toggleRotate = () => {
    setIsAutoRotate(prev => !prev);
    toast.info(isAutoRotate ? "Đã dừng tự động xoay" : "Đã bật tự động xoay mô hình");
  };

  const handleFineTune = () => {
    toast.success("Đang mở bảng công cụ tinh chỉnh vật liệu và lưới 3D...");
  };

  return (
    <section id={id} className={`w-full ${className}`}>
      {/* Studio Body: Split View (Controls & 3D Canvas) */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 xl:gap-12 min-h-[520px]">
        {/* Controls Column (Left) */}
        <div className="flex flex-col gap-5">
            {/* Tab: Ảnh -> 3D vs Văn bản -> 3D */}
            <div className="flex rounded-xl bg-muted/80 p-1 text-sm font-medium">
              <button
                onClick={() => setSourceType("image")}
                className={`flex-1 rounded-lg px-3 py-2 transition-all ${
                  sourceType === "image"
                    ? "bg-card shadow-sm text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Ảnh → 3D
              </button>
              <button
                onClick={() => setSourceType("text")}
                className={`flex-1 rounded-lg px-3 py-2 transition-all ${
                  sourceType === "text"
                    ? "bg-card shadow-sm text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Văn bản → 3D
              </button>
            </div>

            {/* Input Box: Image Upload vs Text Description */}
            {sourceType === "image" ? (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-card/50 hover:bg-card/80 p-5 text-center transition-all cursor-pointer relative overflow-hidden min-h-[110px] flex flex-col justify-center items-center group"
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                />
                {uploadImage ? (
                  <>
                    <img src={uploadImage} alt="Uploaded" className="max-h-28 w-full object-contain rounded-lg" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadImage(null);
                      }}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 shadow-md z-10"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-accent/80 group-hover:scale-110 transition-transform">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-sm font-semibold text-foreground">Kéo thả ảnh vào đây</div>
                    <div className="text-xs text-muted-foreground mt-0.5">PNG, JPG tối đa 10MB</div>
                  </>
                )}
              </div>
            ) : (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Mô tả vật thể</label>
                <textarea
                  rows={3}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Ví dụ: Chiếc bình hoa gốm hoa văn xoắn ốc màu pastel..."
                  className="w-full resize-none rounded-xl border border-border bg-card/70 p-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary transition-colors text-foreground"
                />
              </div>
            )}

            {/* Additional Prompt (Tuỳ chọn) */}
            {sourceType === "image" && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Mô tả bổ sung (tuỳ chọn)</label>
                <textarea
                  rows={2}
                  value={subPrompt}
                  onChange={(e) => setSubPrompt(e.target.value)}
                  placeholder="Chi tiết bạn muốn AI chú ý..."
                  className="w-full resize-none rounded-xl border border-border bg-card/70 p-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary transition-colors text-foreground"
                />
              </div>
            )}

            {/* Style Selector */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Phong cách</label>
              <div className="grid grid-cols-2 gap-2">
                {["Thực tế", "Cách điệu", "Hoạt hình", "Điêu khắc"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStyle(s)}
                    className={`rounded-xl py-2 px-3 text-sm font-medium transition-all ${
                      style === s
                        ? "btn-hero text-white shadow-sm"
                        : "chip-btn rounded-xl py-2 text-sm hover:bg-muted/80 text-foreground transition-colors"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Selector */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Chất lượng</label>
              <div className="flex rounded-xl bg-muted/80 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setQuality("fast")}
                  className={`flex-1 rounded-lg py-1.5 transition-all ${
                    quality === "fast" ? "bg-card shadow-sm font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Nhanh
                </button>
                <button
                  type="button"
                  onClick={() => setQuality("balance")}
                  className={`flex-1 rounded-lg py-1.5 transition-all ${
                    quality === "balance" ? "bg-card shadow-sm font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Cân bằng
                </button>
                <button
                  type="button"
                  onClick={() => setQuality("high")}
                  className={`flex-1 rounded-lg py-1.5 transition-all ${
                    quality === "high" ? "bg-card shadow-sm font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Cao
                </button>
              </div>
            </div>

            {/* Action Buttons & Progress Bar */}
            <div className="mt-1">
              {isGenerating ? (
                <div className="rounded-2xl p-4 border border-border bg-card/60">
                  <div className="flex justify-between items-center mb-2 text-xs font-medium">
                    <span className="text-primary flex items-center gap-2 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                      Đang tạo mô hình...
                    </span>
                    <span className="font-bold">{progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-[color:var(--coral)] transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-muted-foreground text-center mt-2 italic">
                    Quá trình này có thể mất từ 15-30 giây
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleMockGenerate}
                    className="rounded-2xl py-3 text-sm font-bold text-white shadow-coral-glow btn-hero w-full hover:scale-[1.01] active:scale-[0.99] transition-all"
                  >
                    Tạo mô hình 3D (Demo)
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/pricing")}
                    className="rounded-2xl py-2.5 text-sm font-semibold text-[color:var(--coral)] border border-[color:var(--coral)]/80 bg-transparent hover:bg-[color:var(--coral)]/10 transition-colors w-full"
                  >
                    Tạo mô hình 3D chuẩn
                  </button>
                </div>
              )}
            </div>
          </div>

        {/* Right Column: Title + 3D Preview Canvas */}
        <div className="flex flex-col gap-6">
          {rightColumnHeader}
          
          <div className="relative flex-1 flex items-center justify-center overflow-hidden min-h-[440px] rounded-3xl p-6 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-rose-500/5 border border-border/50">
            {/* Soft Warm Radial Backdrop (matching Photo 1) */}
            <div className="absolute inset-4 rounded-3xl bg-amber-500/10 dark:bg-amber-500/5 blur-2xl pointer-events-none" />

            {showResult ? (
              <div className="absolute inset-0 z-10 w-full h-full flex items-center justify-center p-6 pb-20">
                {React.createElement("model-viewer", {
                  src: currentModel,
                  "auto-rotate": isAutoRotate ? "" : null,
                  "camera-controls": true,
                  style: { width: "100%", height: "100%", outline: "none" },
                  "environment-image": "neutral",
                  exposure: "1"
                })}
              </div>
            ) : (
              /* Isometric 3D Cube (Photo 1) */
              <div className="relative z-10" style={{ perspective: "900px" }}>
                <div
                  className={`cube relative ${isGenerating ? "animate-spin-slow" : ""}`}
                  style={{ width: "150px", height: "150px" }}
                >
                  <div className="face fA" />
                  <div className="face fB" />
                  <div className="face fC" />
                  <div className="face fD" />
                  <div className="face fE" />
                  <div className="face fF" />
                </div>
              </div>
            )}

            {/* Bottom Floating Action Buttons (Xoay, Tinh chỉnh, Tạo website) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 w-max z-20">
              <button
                type="button"
                onClick={toggleRotate}
                className="chip-btn rounded-full px-4 py-2 text-xs sm:text-sm font-medium hover:bg-card/90 transition-colors flex items-center gap-1.5 shadow-sm text-foreground"
              >
                <RotateCw className="h-4 w-4 text-muted-foreground" />
                Xoay
              </button>
              <button
                type="button"
                onClick={handleFineTune}
                className="chip-btn rounded-full px-4 py-2 text-xs sm:text-sm font-medium hover:bg-card/90 transition-colors flex items-center gap-1.5 shadow-sm text-foreground"
              >
                <Sliders className="h-4 w-4 text-muted-foreground" />
                Tinh chỉnh
              </button>
              <button
                type="button"
                onClick={() => setIsNamePopupOpen(true)}
                className="rounded-full px-5 py-2 text-xs sm:text-sm text-white font-semibold shadow-coral-glow btn-hero flex items-center gap-1.5 hover:scale-105 transition-transform"
              >
                <Download className="h-4 w-4" />
                Tạo website
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Name Popup Modal when clicking "Tạo website" */}
      {isNamePopupOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsNamePopupOpen(false)}
          />
          <div className="relative glass-card bg-card/95 border border-white/20 p-6 sm:p-8 rounded-3xl w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold font-display mb-2 text-foreground">Tên sản phẩm 3D</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Nhập tên cho thiết kế của bạn để hiển thị trên website quà tặng.
            </p>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="VD: Mô hình quà tặng Handmade..."
              autoFocus
              className="w-full bg-background border border-border rounded-xl px-4 py-3 mb-5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-sm"
            />
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setIsNamePopupOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-muted transition-colors text-foreground"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsNamePopupOpen(false);
                  router.push(
                    `/shop/22222222-2222-2222-2222-222222222222/greeting?from=3d&modelUrl=${encodeURIComponent(
                      currentModel || ""
                    )}&customName=${encodeURIComponent(customName || "Sản phẩm 3D của tôi")}`
                  );
                }}
                className="px-5 py-2 rounded-xl text-sm font-medium btn-hero text-white shadow-md hover:scale-105 transition-transform"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
