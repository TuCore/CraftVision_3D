"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { usePreOrderStore } from "@/store/useStore";
import { Sparkles, ArrowRight, Wand2, Box } from "lucide-react";
import { toast } from "sonner";

export default function AiGiftGenerator({ params }: { params: Promise<{ productId: string }> }) {
  const router = useRouter();
  const { productId } = use(params);
  const { aiGiftData, setAiGiftData, setProductId, setFinalGiftData } = usePreOrderStore();

  useEffect(() => {
    setProductId(productId);
  }, [productId, setProductId]);

  // Local state for the form before saving to store
  const [formData, setFormData] = useState(aiGiftData);
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState("");
  
  const [enable3D, setEnable3D] = useState(false);
  const [theme3D, setTheme3D] = useState("Galaxy");
  const [extraPrompt3D, setExtraPrompt3D] = useState("");
  const [isGenerating3D, setIsGenerating3D] = useState(false);
  const [preview3D, setPreview3D] = useState<string | null>(null);

  const handleGenerateMessage = async () => {
    if (!formData.recipientName) {
      toast.error("Vui lòng nhập tên người nhận");
      return;
    }
    setIsGeneratingMessage(true);
    // Simulate AI Generation
    setTimeout(() => {
      setGeneratedMessage(`Gửi ${formData.recipientName},\n\nNhân dịp ${formData.occasion}, chúc ${formData.relationship === 'lover' ? 'em' : 'bạn'} luôn vui vẻ và hạnh phúc. ${formData.sharedMemories ? `Nhớ ${formData.sharedMemories} không?` : ''} \n\nYêu thương,\n[Tên của bạn]`);
      setIsGeneratingMessage(false);
      toast.success("Đã tạo lời chúc thành công!");
    }, 1500);
  };

  const handleGenerate3D = async () => {
    setIsGenerating3D(true);
    // Simulate 3D Generation
    setTimeout(() => {
      setPreview3D("https://models.readyplayer.me/637a2884260f890f5a772f10.glb");
      setIsGenerating3D(false);
      toast.success("Đã tạo 3D Model thành công!");
    }, 2000);
  };

  const handleContinue = () => {
    if (!generatedMessage) {
      toast.error("Vui lòng tạo lời chúc trước khi tiếp tục!");
      return;
    }
    
    // Save to store
    setAiGiftData(formData);
    setFinalGiftData({
      giftTitle: `Quà tặng cho ${formData.recipientName}`,
      senderName: "", // Will be filled in checkout or here if we added it
      receiverName: formData.recipientName,
      message: generatedMessage,
      messageSource: "AI",
      theme: theme3D,
      threeDModelUrl: preview3D,
      previewImageUrl: null,
      threeDModelType: "GLB",
      mediaFileIds: []
    });
    
    router.push("/checkout");
  };

  return (
    <AppShell active="shop">
      <div className="mx-auto max-w-4xl py-12 px-4 space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold font-display gradient-text mb-4">AI Gift Generator</h1>
          <p className="text-muted-foreground">Tạo lời chúc và hộp quà 3D mang đậm dấu ấn cá nhân.</p>
        </div>

        <div className="space-y-8">
          {/* A. Thông tin người nhận */}
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><Sparkles className="text-primary h-5 w-5" /> A. Thông tin người nhận</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tên người nhận *</label>
                <input 
                  type="text" 
                  value={formData.recipientName}
                  onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
                  className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5" 
                  placeholder="VD: Lan" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mối quan hệ *</label>
                <select 
                  value={formData.relationship}
                  onChange={(e) => setFormData({...formData, relationship: e.target.value})}
                  className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5"
                >
                  <option value="lover">❤️ Người yêu</option>
                  <option value="friend">👫 Bạn bè</option>
                  <option value="mom">👩 Mẹ</option>
                  <option value="dad">👨 Bố</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Dịp tặng *</label>
                <select 
                  value={formData.occasion}
                  onChange={(e) => setFormData({...formData, occasion: e.target.value})}
                  className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5"
                >
                  <option value="birthday">Sinh nhật</option>
                  <option value="anniversary">Kỷ niệm</option>
                  <option value="graduation">Tốt nghiệp</option>
                  <option value="valentine">Valentine</option>
                </select>
              </div>
            </div>
          </div>

          {/* B. Phong cách */}
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><Wand2 className="text-primary h-5 w-5" /> B. Phong cách</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Văn phong</label>
                <select 
                  value={formData.writingStyle}
                  onChange={(e) => setFormData({...formData, writingStyle: e.target.value})}
                  className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5"
                >
                  <option value="cute">Dễ thương</option>
                  <option value="romantic">Lãng mạn</option>
                  <option value="funny">Hài hước</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ngôn ngữ</label>
                <select 
                  value={formData.language}
                  onChange={(e) => setFormData({...formData, language: e.target.value})}
                  className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5"
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          {/* C. Thông tin bổ sung */}
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><Sparkles className="text-primary h-5 w-5" /> C. Kỷ niệm & Ghi chú (Optional)</h2>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Để AI viết hay hơn, hãy chia sẻ một chút kỷ niệm.</label>
              <textarea 
                value={formData.sharedMemories}
                onChange={(e) => setFormData({...formData, sharedMemories: e.target.value})}
                className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 h-24 resize-none" 
                placeholder="VD: Lần đầu gặp nhau ở trường, cô ấy thích hoa tulip..." 
              />
            </div>
          </div>

          {/* D. AI Message */}
          <div className="glass-card p-6 rounded-3xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">D. Tạo lời chúc AI</h2>
              <button 
                onClick={handleGenerateMessage}
                disabled={isGeneratingMessage}
                className="btn-hero px-6 py-2 rounded-xl font-semibold flex items-center gap-2"
              >
                {isGeneratingMessage ? "Đang tạo..." : <><Wand2 className="w-4 h-4" /> Generate Message</>}
              </button>
            </div>

            {generatedMessage && (
              <div className="space-y-2 animate-fade-up">
                <label className="text-sm font-medium text-primary">Lời chúc đã tạo (Có thể chỉnh sửa):</label>
                <textarea 
                  value={generatedMessage}
                  onChange={(e) => setGeneratedMessage(e.target.value)}
                  className="w-full bg-background/50 border border-primary/30 rounded-xl px-4 py-4 h-40 resize-none font-medium leading-relaxed" 
                />
              </div>
            )}
          </div>

          {/* E. 3D Model */}
          <div className="glass-card p-6 rounded-3xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2"><Box className="w-5 h-5 text-primary" /> E. Tạo Hộp quà 3D (Tùy chọn)</h2>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={enable3D} onChange={(e) => setEnable3D(e.target.checked)} />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {enable3D && (
              <div className="space-y-4 animate-fade-up border-t border-border pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Theme Hộp quà</label>
                    <select 
                      value={theme3D}
                      onChange={(e) => setTheme3D(e.target.value)}
                      className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5"
                    >
                      <option value="Galaxy">Vũ trụ (Galaxy)</option>
                      <option value="Flower">Hoa tươi (Flower)</option>
                      <option value="Luxury">Sang trọng (Luxury)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mô tả thêm (Prompt)</label>
                    <input 
                      type="text" 
                      value={extraPrompt3D}
                      onChange={(e) => setExtraPrompt3D(e.target.value)}
                      className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5" 
                      placeholder="VD: Pink roses, golden lighting..." 
                    />
                  </div>
                </div>
                
                <button 
                  onClick={handleGenerate3D}
                  disabled={isGenerating3D}
                  className="w-full py-3 bg-secondary text-secondary-foreground rounded-xl font-semibold"
                >
                  {isGenerating3D ? "Đang xử lý 3D..." : "Generate 3D Model"}
                </button>

                {preview3D && (
                  <div className="p-4 bg-background/50 rounded-xl text-center text-sm font-medium text-green-500 border border-green-500/20">
                    ✅ Đã tạo thành công mô hình 3D! (Sẽ được gắn vào thiệp NFC)
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button 
              onClick={handleContinue}
              className="btn-hero px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-2 hover:-translate-y-1 transition-transform"
            >
              Tiếp tục đến Đặt hàng <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
