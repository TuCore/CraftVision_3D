"use client";

import { useState, useRef, useEffect } from "react";
import React from "react";
import { AppShell } from "@/components/AppShell";
import { Send, Sparkles, Bot, User, ExternalLink, Video, Clock, Wallet, Package, Copy, Bookmark, Image as ImageIcon, X, Check } from "lucide-react";
import { fetchApi } from "@/lib/apiClient";
import { useRouter } from "next/navigation";

type Message = {
  role: "user" | "ai";
  content: string;
  imageUrl?: string;
  suggestions?: any[];
};

const modes = [
  {id:"vision", title:"Vision Plus", subtitle:"Chat & phân tích hình ảnh", badge:"Free"},
  {id:"three-d",title:"Studio 3D",   subtitle:"Tạo mô hình 3D từ ảnh & văn bản", badge:"Pro"},
];

export default function ChatPage() {
  const [chatMode, setChatMode] = useState<"vision" | "three-d">("vision");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Đọc URL query parameter để mở thẳng Studio 3D nếu có ?mode=three-d
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("mode") === "three-d") {
        setChatMode("three-d");
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: "Chào bạn! Mình là trợ lý AI CraftVision. Bạn đang muốn làm món quà gì, ngân sách bao nhiêu, hay cứ gửi một bức ảnh mẫu cho mình nhé!",
    }
  ]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Settings for the request
  const [maxCost, setMaxCost] = useState(150000);
  const [occasion, setOccasion] = useState("Birthday");
  const [difficulty, setDifficulty] = useState("Easy");
  
  // Image Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    
    // fetchApi doesn't set Content-Type if body is FormData
    const res = await fetchApi("/api/upload", {
      method: "POST",
      body: formData,
    });
    return res.url;
  };

  const handleSend = async () => {
    if (!prompt.trim() && !imageFile) return;

    let finalImageUrl = "";
    
    // Optimistic UI Update
    const userMsg: Message = { role: "user", content: prompt, imageUrl: imagePreviewUrl || undefined };
    setMessages(prev => [...prev, userMsg]);
    setPrompt("");
    setLoading(true);

    try {
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }
      
      const payload = {
        userId: localStorage.getItem("userId") || "00000000-0000-0000-0000-000000000000",
        prompt: userMsg.content || "Hãy phân tích hình ảnh này và gợi ý quà tặng",
        imageUrl: finalImageUrl || "",
        maxCost: maxCost,
        occasion: occasion,
        difficulty: difficulty
      };

      const res = await fetchApi("/api/gift-chat/suggestions", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setMessages(prev => [...prev, {
        role: "ai",
        content: `Tuyệt vời! Mình đã tìm thấy ${res.length} ý tưởng phù hợp với bạn:`,
        suggestions: res
      }]);

    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: "ai",
        content: `❌ Lỗi: ${err.message}`
      }]);
    } finally {
      setLoading(false);
      removeImage();
    }
  };

  return (
    <AppShell active="chat">
      <div className="mx-auto max-w-5xl flex flex-col h-[calc(100vh-6rem)]">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center justify-between px-4 border-b border-border/40 glass-strong rounded-t-3xl relative">
          <div className="relative">
            <button 
              ref={buttonRef}
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="group flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[15px] font-semibold hover-accent transition-colors"
            >
              <span>{modes.find(m => m.id === chatMode)?.title}</span>
              <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            
            {isMenuOpen && (
              <div ref={menuRef} className="absolute left-0 top-full mt-1.5 w-[320px] rounded-2xl border border-border bg-popover p-1.5 shadow-xl z-50">
                {modes.map(m => (
                  <button 
                    key={m.id}
                    onClick={() => { setChatMode(m.id as any); setIsMenuOpen(false); }}
                    className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left hover-accent transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                      <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{m.title}</div>
                      <div className="truncate text-xs text-muted-foreground">{m.subtitle}</div>
                    </div>
                    {m.badge && m.id !== chatMode && <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium">{m.badge}</span>}
                    {m.id === chatMode && <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>}
                  </button>
                ))}
              </div>
            )}
          </div>

        </header>

        {chatMode === "vision" ? (
          <>

        {/* Messages Scroll Area */}
        <div className="glass-card rounded-none p-6 md:p-8 space-y-6 flex-1 overflow-y-auto">
          {messages.map((m, idx) => (
            <MessageRow key={idx} role={m.role}>
              {m.imageUrl && (
                 <img src={m.imageUrl} alt="Uploaded" className="w-48 h-48 object-cover rounded-xl mb-3 border border-white/40 shadow-sm" />
              )}
              <p className="whitespace-pre-wrap text-sm">{m.content}</p>

              {m.suggestions && m.suggestions.length > 0 && (
                <div className="ideas mt-4">
                  {m.suggestions.map((s: any, i: number) => {
                    let materials = [];
                    try {
                      if (typeof s.materialsJson === 'string') materials = JSON.parse(s.materialsJson);
                      else if (Array.isArray(s.materials)) materials = s.materials;
                    } catch(e){}

                    return (
                      <div key={i} className="idea">
                        <div className={`idea-num ${i === 0 ? "n1" : i === 1 ? "n2" : "n3"}`}>{i + 1}</div>
                        <div className="idea-body">
                          <div className="idea-title">{s.name || "Ý tưởng quà tặng"}</div>
                          <div className="idea-desc">{s.description}</div>
                          <div className="idea-meta">
                            {s.estimatedCostRange && <span className="tag tag-price">💰 {s.estimatedCostRange}</span>}
                            {s.estimatedTime && <span className="tag tag-time">🕐 {s.estimatedTime}</span>}
                            {s.difficulty && <span className="tag tag-level">🌱 {s.difficulty}</span>}
                          </div>

                          {materials && materials.length > 0 && (
                            <div className="detail-block">
                              <div className="detail-head"><span className="dot"></span> Nguyên liệu & chi phí</div>
                              <table className="mat">
                                <thead><tr><th>Nguyên liệu</th><th>SL</th><th>Đơn giá</th><th className="num">Thành tiền</th></tr></thead>
                                <tbody>
                                  {materials.map((mat: any, j: number) => (
                                    <tr key={j}>
                                      <td>{mat.name}</td>
                                      <td>{mat.quantity}</td>
                                      <td>{mat.price}</td>
                                      <td className="num">{mat.total}</td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot><tr><td colSpan={3}>Tổng chi phí</td><td className="num">{s.totalCost || "Chưa rõ"}</td></tr></tfoot>
                              </table>
                              <div className="links-row">
                                {materials.filter((m: any) => !!m.purchaseUrl).map((mat: any, j: number) => (
                                  <a key={j} className="link-chip" href={mat.purchaseUrl} target="_blank" rel="noreferrer">🛒 Mua {mat.name}</a>
                                ))}
                                {s.searchKeyword && <a className="link-chip keyword" href={`https://shopee.vn/search?keyword=${encodeURIComponent(s.searchKeyword)}`} target="_blank" rel="noreferrer">🔎 "{s.searchKeyword}"</a>}
                                {s.videoUrl && <a className="link-chip video" href={s.videoUrl} target="_blank" rel="noreferrer">▶ Video hướng dẫn</a>}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </MessageRow>
          ))}
          {loading && (
             <MessageRow role="ai">
               <div className="flex gap-1 items-center h-5">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{animationDelay:"0ms"}}></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{animationDelay:"150ms"}}></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{animationDelay:"300ms"}}></div>
               </div>
             </MessageRow>
          )}
        </div>

        {/* Composer */}
        <div className="glass-strong rounded-b-3xl p-4 shrink-0 border-t border-white/40">
          
          {/* Image Preview Area */}
          {imagePreviewUrl && (
            <div className="mb-3 relative inline-block">
              <img src={imagePreviewUrl} alt="Preview" className="h-20 w-20 object-cover rounded-xl border border-white shadow-sm" />
              <button onClick={removeImage} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 hover:bg-rose-600 shadow-md">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="bg-white/60 rounded-2xl p-2 flex items-end gap-2 border border-white/50 shadow-inner">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageSelect}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="h-11 w-11 rounded-xl grid place-items-center shrink-0 text-muted-foreground hover:bg-white/80 hover:text-primary transition-colors"
              title="Đính kèm ảnh"
            >
              <ImageIcon className="h-5 w-5" />
            </button>
            
            <textarea
              rows={1}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Mô tả món quà, hoặc gửi ảnh mẫu cho AI..."
              className="flex-1 bg-transparent resize-none px-2 py-3 outline-none placeholder:text-muted-foreground text-sm max-h-32"
            />
            
            <button 
              onClick={handleSend}
              disabled={loading || (!prompt.trim() && !imageFile)}
              className="btn-hero h-11 w-11 rounded-xl grid place-items-center shrink-0 disabled:opacity-50 transition-opacity"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
          </>
        ) : (
          <Studio3DView />
        )}
      </div>
      
    </AppShell>
  );
}

function Studio3DView() {
  const router = useRouter();
  const [sourceType, setSourceType] = useState<"image" | "text">("image");
  const [quality, setQuality] = useState<"fast" | "balance" | "high">("balance");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [currentModel, setCurrentModel] = useState("https://modelviewer.dev/shared-assets/models/Astronaut.glb");
  const [uploadImage, setUploadImage] = useState<string | null>(null);
  const [style, setStyle] = useState("Cách điệu");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  
  return (
    <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[380px_1fr] bg-card/40 rounded-b-3xl">
      {/* Controls */}
      <div className="flex flex-col gap-4 overflow-y-auto border-r border-border p-5">
        <div className="flex rounded-xl bg-muted p-1 text-sm">
          <button 
            onClick={() => setSourceType("image")}
            className={`flex-1 rounded-lg px-3 py-2 ${sourceType === "image" ? "bg-card shadow-sm font-medium" : "text-muted-foreground"}`}
          >Ảnh → 3D</button>
          <button 
            onClick={() => setSourceType("text")}
            className={`flex-1 rounded-lg px-3 py-2 ${sourceType === "text" ? "bg-card shadow-sm font-medium" : "text-muted-foreground"}`}
          >Văn bản → 3D</button>
        </div>
        
        {sourceType === "image" ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center hover:bg-card/80 transition-colors cursor-pointer relative overflow-hidden min-h-[140px] flex flex-col justify-center items-center" onClick={() => fileInputRef.current?.click()}>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageSelect}
            />
            {uploadImage ? (
               <>
                 <img src={uploadImage} alt="Uploaded" className="max-h-40 w-full object-contain" />
                 <button onClick={(e) => { e.stopPropagation(); setUploadImage(null); }} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 shadow-md z-10">
                   <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                 </button>
               </>
            ) : (
               <>
                 <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                   <svg className="h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12"/><path d="m7 8 5-5 5 5"/><path d="M5 21h14"/></svg>
                 </div>
                 <div className="text-sm font-medium">Kéo thả ảnh vào đây</div>
                 <div className="text-xs text-muted-foreground mt-1">PNG, JPG tối đa 10MB</div>
               </>
            )}
          </div>
        ) : (
           <div>
             <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Mô tả vật thể</label>
             <textarea rows={4} placeholder="Ví dụ: chiếc cốc gốm sứ màu cam pastel..." className="w-full resize-none rounded-xl border border-border bg-card/70 p-3 text-sm outline-none placeholder:text-muted-foreground" />
           </div>
        )}

        {sourceType === "image" && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Mô tả bổ sung (tuỳ chọn)</label>
            <textarea rows={2} placeholder="Chi tiết bạn muốn AI chú ý..." className="w-full resize-none rounded-xl border border-border bg-card/70 p-3 text-sm outline-none placeholder:text-muted-foreground"></textarea>
          </div>
        )}
        
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Phong cách</label>
          <div className="grid grid-cols-2 gap-2">
            {["Thực tế", "Cách điệu", "Hoạt hình", "Điêu khắc"].map(s => (
               <button 
                 key={s}
                 onClick={() => setStyle(s)}
                 className={style === s ? "rounded-lg py-2 text-sm text-white shadow-md btn-hero" : "chip-btn rounded-lg py-2 text-sm hover-accent transition-colors"}
               >{s}</button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Chất lượng</label>
          <div className="flex rounded-xl bg-muted p-1 text-xs">
            <button onClick={() => setQuality("fast")} className={`flex-1 rounded-lg px-2 py-1.5 ${quality === "fast" ? "bg-card shadow-sm font-medium" : "text-muted-foreground"}`}>Nhanh</button>
            <button onClick={() => setQuality("balance")} className={`flex-1 rounded-lg px-2 py-1.5 ${quality === "balance" ? "bg-card shadow-sm font-medium" : "text-muted-foreground"}`}>Cân bằng</button>
            <button onClick={() => setQuality("high")} className={`flex-1 rounded-lg px-2 py-1.5 ${quality === "high" ? "bg-card shadow-sm font-medium" : "text-muted-foreground"}`}>Cao</button>
          </div>
        </div>
        
        {isGenerating ? (
          <div className="mt-2 rounded-xl p-4 border border-border bg-card/50">
            <div className="flex justify-between items-center mb-2 text-xs font-medium">
              <span className="text-primary flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
                Đang tạo mô hình...
              </span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-[color:var(--coral)] transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-muted-foreground text-center mt-2 italic">
              Quá trình này có thể mất từ 15-30 giây
            </div>
          </div>
        ) : (
          <div className="mt-2 flex flex-col gap-2">
            <button 
              onClick={handleMockGenerate}
              className="rounded-xl py-3 text-sm font-semibold text-white shadow-lg btn-hero w-full"
            >
              Tạo mô hình 3D (Demo)
            </button>
            <button 
              onClick={() => router.push('/pricing')}
              className="rounded-xl py-3 text-sm font-semibold text-[color:var(--coral)] border border-[color:var(--coral)] bg-transparent hover:bg-[color:var(--coral)]/5 transition-colors w-full"
            >
              Tạo mô hình 3D chuẩn
            </button>
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="relative flex items-center justify-center overflow-hidden min-h-[400px]">
        <div className="absolute inset-6 rounded-3xl radial-bg opacity-30 dark:opacity-10 pointer-events-none"></div>
        
        {showResult ? (
          <div className="absolute inset-0 z-10 w-full h-full flex items-center justify-center p-8 pb-16">
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
            <div className={`cube relative ${isGenerating ? 'animate-spin-slow' : ''}`} style={{width: '140px', height: '140px'}}>
              <div className="face fA"></div><div className="face fB"></div>
              <div className="face fC"></div><div className="face fD"></div>
              <div className="face fE"></div><div className="face fF"></div>
            </div>
          </div>
        )}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 w-max z-20">
          <button className="chip-btn rounded-full px-4 py-2 text-sm hover-accent transition-colors flex items-center gap-1.5">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            Xoay
          </button>
          <button className="chip-btn rounded-full px-4 py-2 text-sm hover-accent transition-colors flex items-center gap-1.5">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            Tinh chỉnh
          </button>
          <button className="rounded-full px-5 py-2 text-sm text-white font-medium shadow-md btn-hero flex items-center gap-1.5">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Lưu model
          </button>
        </div>
      </div>
    </div>
  );
}

function AiMessageRenderer({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";

  if (isUser) {
    return (
      <MessageRow role="user">
        <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
      </MessageRow>
    );
  }

  // AI Message Parsing
  let parsedData: any = null;
  let plainText = msg.content;

  try {
    let rawJsonStr = "";
    const jsonMatch = msg.content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      rawJsonStr = jsonMatch[1];
    } else {
      const firstBrace = msg.content.indexOf('{');
      const lastBrace = msg.content.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
         rawJsonStr = msg.content.substring(firstBrace, lastBrace + 1);
      }
    }
    
    if (rawJsonStr) {
      // Fix common JSON errors like trailing commas
      rawJsonStr = rawJsonStr.replace(/,\s*([\]}])/g, '$1');
      parsedData = JSON.parse(rawJsonStr);
    }
  } catch (e) {
    console.error("Failed to parse JSON from AI response", e);
  }

  if (parsedData && parsedData.text) {
    return (
      <MessageRow role="ai">
        <p className="text-sm">{parsedData.text}</p>
        
        {/* Suggestion list */}
        {parsedData.suggestions && parsedData.suggestions.length > 0 && (
          <div className="mt-4 space-y-2">
            {parsedData.suggestions.map((s: any, i: number) => (
              <a 
                key={i} 
                href={s.link || `https://www.youtube.com/results?search_query=${encodeURIComponent(s.title + ' hướng dẫn cách làm')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 bg-white/70 rounded-xl p-3 hover:bg-white transition-colors cursor-pointer group"
              >
                <div className={`h-9 w-9 rounded-lg grid place-items-center font-bold text-white ${
                  i === 0 ? "bg-green-500" : i === 1 ? "bg-orange-500" : "bg-rose-500"
                }`}>{i + 1}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{s.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{s.level || "Cơ bản"}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">⏱ {s.time} · 💰 {s.price}</div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </a>
            ))}
          </div>
        )}

        {parsedData.featuredIdea && (
          <>
            <p className="mt-5 text-sm">Gợi ý chi tiết cho <strong>{parsedData.featuredIdea.title}</strong>:</p>
            
            {/* Materials table card */}
            {parsedData.featuredIdea.materials && (
              <div className="mt-3 bg-white/80 rounded-2xl overflow-hidden border border-white/60">
                <div className="px-5 py-4 flex items-center justify-between border-b border-border/50">
                  <div className="flex items-center gap-2 font-semibold">
                    <Package className="h-4 w-4 text-primary" /> Bộ nguyên liệu cần mua
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">{parsedData.featuredIdea.materialsCount || parsedData.featuredIdea.materials.length} món</span>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-white/50 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="text-left px-5 py-2.5 font-medium">Nguyên liệu</th>
                      <th className="text-right px-3 py-2.5 font-medium">Giá</th>
                      <th className="text-center px-5 py-2.5 font-medium">Mua ngay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.featuredIdea.materials.map((m: any, i: number) => (
                      <tr key={i} className="border-t border-border/30 hover:bg-white/60">
                        <td className="px-5 py-3">
                          <div className="font-medium">{m.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Copy className="h-3 w-3" /> từ khoá: <span className="font-mono text-primary">{m.keyword || m.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right font-semibold">{m.price}</td>
                        <td className="px-5 py-3 text-center">
                          <a href={m.link || `https://shopee.vn/search?keyword=${m.keyword || m.name}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                            Link <ExternalLink className="h-3 w-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gradient-to-r from-primary/10 to-[color:var(--coral)]/10 border-t border-border">
                      <td className="px-5 py-3.5 font-semibold">Tổng chi phí</td>
                      <td className="px-3 py-3.5 text-right">
                        <span className="text-lg font-bold gradient-text">{parsedData.featuredIdea.totalCost}</span>
                      </td>
                      <td className="px-5 py-3.5 text-center text-xs text-muted-foreground">
                        <Clock className="inline h-3.5 w-3.5 mr-1" /> {parsedData.featuredIdea.totalTime}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Summary chips */}
            <div className="mt-3 flex flex-wrap gap-2">
              {parsedData.featuredIdea.totalCost && <Chip icon={Wallet} label={`Ngân sách: ${parsedData.featuredIdea.totalCost}`} tone="ok" />}
              {parsedData.featuredIdea.totalTime && <Chip icon={Clock} label={`Thời gian: ${parsedData.featuredIdea.totalTime}`} />}
              {parsedData.featuredIdea.materialsCount && <Chip icon={Package} label={`${parsedData.featuredIdea.materialsCount} nguyên liệu`} />}
            </div>

            {/* Tutorial video card */}
            {parsedData.featuredIdea.tutorial && (
              <a
                href={parsedData.featuredIdea.tutorial.url || "#"}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex items-center gap-4 bg-gradient-to-r from-rose-50 to-orange-50 rounded-2xl p-4 border border-white/60 hover:shadow-soft transition-all group"
              >
                <div className="h-14 w-24 rounded-xl bg-gradient-to-br from-rose-400 to-orange-400 grid place-items-center relative overflow-hidden">
                  <Video className="h-6 w-6 text-white relative z-10" />
                  <div className="absolute inset-0 bg-black/10" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-rose-600">🎬 Video hướng dẫn từng bước</div>
                  <div className="font-semibold truncate">{parsedData.featuredIdea.tutorial.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{parsedData.featuredIdea.tutorial.duration} · {parsedData.featuredIdea.tutorial.views || "1M lượt xem"}</div>
                </div>
                <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
              </a>
            )}

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <button className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white font-medium">
                <Bookmark className="h-3.5 w-3.5" /> Lưu ý tưởng
              </button>
              <button className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white font-medium">
                Bắt đầu dự án
              </button>
            </div>
          </>
        )}
      </MessageRow>
    );
  }

  // Fallback to plain text if parsing fails or standard conversation
  return (
    <MessageRow role="ai">
      <div className="whitespace-pre-wrap text-sm leading-relaxed">{plainText}</div>
    </MessageRow>
  );
}

function MessageRow({ role, children }: { role: "user" | "ai"; children: React.ReactNode }) {
  const isUser = role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`h-9 w-9 rounded-xl grid place-items-center shrink-0 ${isUser ? "bg-white/80 shadow-sm" : "btn-hero shadow-md"}`}>
        {isUser ? <User className="h-4 w-4 text-primary" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm ${isUser ? "bg-primary text-primary-foreground" : "bg-white/80 border border-white/60"}`}>
        {children}
      </div>
    </div>
  );
}

function Chip({ icon: Icon, label, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; tone?: "ok" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${
      tone === "ok" ? "bg-green-100 text-green-700" : "bg-black/5 text-muted-foreground"
    }`}>
      <Icon className="h-3.5 w-3.5" /> {label}
    </span>
  );
}
