"use client";

import { AppShell } from "@/components/AppShell";
import { Send, Sparkles, Bot, User, Loader2, ExternalLink, Video, Clock, Wallet, Package, Copy, Bookmark } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const API_BASE_URL = "http://localhost:5192/api/chat";
const MOCK_USER_ID = "11111111-1111-1111-1111-111111111111";

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  role: number; // 0 = User, 1 = Assistant, 2 = System
  content: string;
}

const SAMPLE_JSON_RESPONSE = JSON.stringify({
  text: "Tuyệt vời! Mình đã chọn **3 ý tưởng phù hợp** với ngân sách và phong cách pastel của bạn — từ cơ bản đến nâng cao:",
  suggestions: [
    { level: "Cơ bản", title: "Thiệp pop-up trái tim", time: "45 phút", price: "~30.000đ" },
    { level: "Trung bình", title: "Hộp quà 3D hoa giấy", time: "2 giờ", price: "~148.000đ" },
    { level: "Nâng cao", "title": "Hộp nhạc handmade phát QR", time: "5 giờ", price: "~380.000đ" }
  ],
  featuredIdea: {
    title: "Hộp quà 3D hoa giấy",
    totalCost: "148.000đ",
    totalTime: "2 giờ",
    materialsCount: 5,
    materials: [
      { name: "Giấy mỹ thuật A4 (20 tờ)", price: "45.000đ", link: "https://shopee.vn/search?keyword=giay+my+thuat+a4", keyword: "giấy mỹ thuật A4" },
      { name: "Kéo cắt giấy chuyên dụng", price: "35.000đ", link: "https://shopee.vn/search?keyword=keo+cat+giay", keyword: "kéo cắt giấy" },
      { name: "Keo sữa Elmer's 118ml", price: "28.000đ", link: "https://shopee.vn/search?keyword=keo+sua+elmers", keyword: "keo sữa Elmer's" },
      { name: "Ruy băng satin 10mm (5m)", price: "22.000đ", link: "https://shopee.vn/search?keyword=ruy+bang+satin", keyword: "ruy băng satin" },
      { name: "Hộp giấy kraft 15x15cm", price: "18.000đ", link: "https://shopee.vn/search?keyword=hop+giay+kraft", keyword: "hộp giấy kraft" }
    ],
    tutorial: {
      title: "DIY 3D Paper Flower Gift Box — Hướng dẫn chi tiết",
      url: "https://www.youtube.com/results?search_query=diy+3d+paper+flower+gift+box",
      duration: "18 phút",
      views: "1.2M lượt xem"
    }
  }
});

export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (currentSessionId) {
      fetchMessages(currentSessionId);
    } else {
      setMessages([]);
    }
  }, [currentSessionId]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/sessions`, {
        headers: { "X-User-Id": MOCK_USER_ID }
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
        if (data.length > 0 && !currentSessionId) {
          setCurrentSessionId(data[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    }
  };

  const fetchMessages = async (sessionId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/messages`, {
        headers: { "X-User-Id": MOCK_USER_ID }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const handleNewSession = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setInputValue("");
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue("");
    
    const tempUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 0, // User
      content: userText
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      let sessionId = currentSessionId;
      
      if (!sessionId) {
        const res = await fetch(`${API_BASE_URL}/sessions`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "X-User-Id": MOCK_USER_ID 
          },
          body: JSON.stringify({ title: userText })
        });
        if (res.ok) {
          const newSession = await res.json();
          sessionId = newSession.id;
          setCurrentSessionId(sessionId);
          setSessions(prev => [newSession, ...prev]);
        } else {
          throw new Error("Failed to create session");
        }
      }

      const msgRes = await fetch(`${API_BASE_URL}/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-User-Id": MOCK_USER_ID 
        },
        body: JSON.stringify({ content: userText })
      });

      if (msgRes.ok) {
        const data = await msgRes.json();
        const aiMsg: ChatMessage = {
          ...data.message
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        console.error("Failed to send message", await msgRes.text());
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleShowSample = () => {
    setShowSampleModal(true);
  };

  return (
    <AppShell active="chat">
      <div className="mx-auto max-w-5xl relative">
        {/* Chat header */}
        <div className="glass-strong rounded-t-3xl px-6 py-4 flex items-center justify-between border-b border-white/40 relative">
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
          <div className="flex items-center gap-2">
            <button 
              onClick={handleShowSample}
              className="text-xs px-3 py-1.5 rounded-xl bg-orange-100 text-orange-700 hover:bg-orange-200 font-bold transition-colors shadow-sm"
              title="Xem giao diện mẫu nguyên bản"
            >
              👁 Xem bản mẫu
            </button>
            <button 
              onClick={handleNewSession}
              className="text-sm px-3 py-1.5 rounded-xl bg-white/70 hover:bg-white font-medium transition-colors"
            >
              + Cuộc trò chuyện mới
            </button>
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={scrollContainerRef}
          className="glass-card rounded-b-3xl p-6 md:p-8 space-y-6 min-h-[60vh] max-h-[60vh] overflow-y-auto custom-scrollbar"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
              <div className="h-16 w-16 rounded-3xl btn-hero grid place-items-center mb-4">
                <Bot className="h-8 w-8" />
              </div>
              <h2 className="font-semibold text-lg">Chào bạn!</h2>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                Mình là AI của CraftVision. Bạn muốn làm quà gì, ngân sách bao nhiêu? Gợi ý giúp bạn nhé!
              </p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <AiMessageRenderer key={index} msg={msg} />
            ))
          )}
          
          {isLoading && (
            <MessageRow role="ai">
              <div className="flex items-center gap-2 text-sm text-muted-foreground h-6">
                <Loader2 className="h-4 w-4 animate-spin" /> Đang tổng hợp ý tưởng...
              </div>
            </MessageRow>
          )}
        </div>

        {/* Composer */}
        <div className="sticky bottom-4 mt-4">
          <div className="glass-strong rounded-2xl p-2 flex items-end gap-2 shadow-soft">
            <textarea
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Mô tả món quà bạn muốn tạo…"
              className="flex-1 bg-transparent resize-none px-4 py-3 outline-none placeholder:text-muted-foreground text-sm max-h-32"
            />
            <button 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="btn-hero h-11 w-11 rounded-xl grid place-items-center shrink-0 disabled:opacity-50 transition-opacity"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 justify-center">
            {["Quà 20/10", "Quà cưới handmade", "DIY dưới 100k", "Thiệp sinh nhật"].map((q) => (
              <button 
                key={q} 
                onClick={() => setInputValue(q)}
                className="text-xs px-3 py-1.5 rounded-full bg-white/70 hover:bg-white text-muted-foreground hover:text-foreground transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Sample Modal Popup */}
      {showSampleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/90 backdrop-blur-md w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-white flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-black/5 flex justify-between items-center bg-white/50">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-orange-100 text-orange-600 grid place-items-center">👁</div>
                <h3 className="font-bold text-lg font-display">Giao diện mẫu (Demo)</h3>
              </div>
              <button 
                onClick={() => setShowSampleModal(false)} 
                className="h-8 w-8 rounded-full bg-black/5 hover:bg-black/10 grid place-items-center transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="space-y-6">
                <MessageRow role="user">
                  <div className="text-sm">Mình muốn làm quà sinh nhật cho bạn gái, ngân sách khoảng 150k, ưa thích màu pastel. Gợi ý giúp mình nhé!</div>
                </MessageRow>
                <AiMessageRenderer msg={{ id: "sample", role: 1, content: SAMPLE_JSON_RESPONSE }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function AiMessageRenderer({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 0;

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
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex gap-3 max-w-[85%] ${isUser ? "flex-row-reverse" : ""}`}>
        <div className={`h-9 w-9 rounded-xl grid place-items-center shrink-0 ${isUser ? "bg-white/80" : "btn-hero"}`}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>
        <div className={`rounded-2xl px-5 py-3.5 shadow-soft ${isUser ? "bg-primary text-primary-foreground" : "bg-white/80 border border-white"}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

function Chip({ icon: Icon, label, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; tone?: "ok" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium ${
      tone === "ok" ? "bg-green-100 text-green-700" : "bg-white/70 text-muted-foreground"
    }`}>
      <Icon className="h-3.5 w-3.5" /> {label}
    </span>
  );
}
