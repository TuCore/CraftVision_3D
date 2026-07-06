"use client";

import { useState, useRef, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { Send, Sparkles, Bot, User, ExternalLink, Video, Clock, Wallet, Package, Copy, Bookmark, Image as ImageIcon, X } from "lucide-react";
import { fetchApi } from "@/lib/apiClient";

type Message = {
  role: "user" | "ai";
  content: string;
  imageUrl?: string;
  suggestions?: any[];
};

export default function ChatPage() {
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
        {/* Chat header */}
        <div className="glass-strong rounded-t-3xl px-6 py-4 flex items-center justify-between border-b border-white/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 rounded-2xl btn-hero grid place-items-center">
              <Sparkles className="h-5 w-5" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white" />
            </div>
            <div>
              <h1 className="font-bold font-display">Trợ lý CraftVision</h1>
              <p className="text-xs text-muted-foreground">AI · Sẵn sàng gợi ý ý tưởng quà tặng</p>
            </div>
          </div>
          <div className="flex gap-2">
             <select value={difficulty} onChange={e=>setDifficulty(e.target.value)} className="text-xs rounded-xl bg-white/70 px-2 py-1 outline-none">
               <option value="Easy">Dễ</option>
               <option value="Medium">Vừa</option>
               <option value="Hard">Khó</option>
             </select>
             <button onClick={() => setMessages([])} className="text-sm px-3 py-1.5 rounded-xl bg-white/70 hover:bg-white font-medium">+ Mới</button>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="glass-card rounded-none p-6 md:p-8 space-y-6 flex-1 overflow-y-auto">
          {messages.map((m, idx) => (
            <MessageRow key={idx} role={m.role}>
              {m.imageUrl && (
                 <img src={m.imageUrl} alt="Uploaded" className="w-48 h-48 object-cover rounded-xl mb-3 border border-white/40 shadow-sm" />
              )}
              <p className="whitespace-pre-wrap text-sm">{m.content}</p>

              {m.suggestions && m.suggestions.length > 0 && (
                <div className="mt-4 space-y-4">
                  {m.suggestions.map((s: any, i: number) => (
                    <div key={i} className="bg-white/70 rounded-2xl overflow-hidden border border-white/60">
                      <div className="p-4 flex gap-3 hover:bg-white/90 transition-colors">
                        <div className={`h-10 w-10 shrink-0 rounded-xl grid place-items-center font-bold text-white ${i === 0 ? "bg-green-500" : i === 1 ? "bg-orange-500" : "bg-rose-500"}`}>{i + 1}</div>
                        <div>
                          <div className="font-semibold">{s.name || "Ý tưởng quà tặng"}</div>
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.description}</div>
                          <div className="mt-2 flex gap-2">
                             <Chip icon={Wallet} label={s.estimatedCostRange || "Chưa rõ"} tone="ok" />
                             <Chip icon={Clock} label={s.estimatedTime || "Chưa rõ"} />
                          </div>
                        </div>
                      </div>
                      
                      {/* Materials List */}
                      {s.materials && s.materials.length > 0 && (
                        <div className="bg-white/50 border-t border-white/50 px-4 py-3">
                          <div className="text-xs font-semibold mb-2 flex items-center gap-1"><Package className="w-3.5 h-3.5"/> Cần chuẩn bị:</div>
                          <ul className="text-xs space-y-1 pl-5 list-disc text-muted-foreground">
                            {s.materials.map((mat: string, j: number) => (
                              <li key={j}>{mat}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
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
      </div>
      
    </AppShell>
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
