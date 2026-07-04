
import { AppShell } from "@/components/AppShell";
import { Send, Sparkles, Bot, User, ExternalLink, Video, Clock, Wallet, Package, Copy, Bookmark } from "lucide-react";

export default function ChatPage() {
  const materials = [
    { name: "Giấy mỹ thuật A4 (20 tờ)", price: "45.000đ", link: "https://shopee.vn/search?keyword=giay+my+thuat+a4", keyword: "giấy mỹ thuật A4" },
    { name: "Kéo cắt giấy chuyên dụng", price: "35.000đ", link: "https://shopee.vn/search?keyword=keo+cat+giay", keyword: "kéo cắt giấy" },
    { name: "Keo sữa Elmer's 118ml", price: "28.000đ", link: "https://shopee.vn/search?keyword=keo+sua+elmers", keyword: "keo sữa Elmer's" },
    { name: "Ruy băng satin 10mm (5m)", price: "22.000đ", link: "https://shopee.vn/search?keyword=ruy+bang+satin", keyword: "ruy băng satin" },
    { name: "Hộp giấy kraft 15x15cm", price: "18.000đ", link: "https://shopee.vn/search?keyword=hop+giay+kraft", keyword: "hộp giấy kraft" },
  ];
  const totalCost = "148.000đ";

  const suggestions = [
    { level: "Cơ bản", title: "Thiệp pop-up trái tim", time: "45 phút", price: "~30.000đ" },
    { level: "Trung bình", title: "Hộp quà 3D hoa giấy", time: "2 giờ", price: "~148.000đ" },
    { level: "Nâng cao", title: "Hộp nhạc handmade phát QR", time: "5 giờ", price: "~380.000đ" },
  ];

  return (
    <AppShell active="chat">
      <div className="mx-auto max-w-5xl">
        {/* Chat header */}
        <div className="glass-strong rounded-t-3xl px-6 py-4 flex items-center justify-between border-b border-white/40">
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
          <button className="text-sm px-3 py-1.5 rounded-xl bg-white/70 hover:bg-white font-medium">+ Cuộc trò chuyện mới</button>
        </div>

        {/* Messages */}
        <div className="glass-card rounded-b-3xl p-6 md:p-8 space-y-6 min-h-[60vh]">
          {/* User message */}
          <MessageRow role="user">
            <p>Mình muốn làm quà sinh nhật cho bạn gái, ngân sách khoảng 150k, ưa thích màu pastel. Gợi ý giúp mình nhé!</p>
          </MessageRow>

          {/* AI response */}
          <MessageRow role="ai">
            <p className="text-sm">Tuyệt vời! Mình đã chọn <strong>3 ý tưởng phù hợp</strong> với ngân sách và phong cách pastel của bạn — từ cơ bản đến nâng cao:</p>

            {/* Suggestion list */}
            <div className="mt-4 space-y-2">
              {suggestions.map((s, i) => (
                <div key={s.title} className="flex items-center gap-3 bg-white/70 rounded-xl p-3 hover:bg-white transition-colors cursor-pointer group">
                  <div className={`h-9 w-9 rounded-lg grid place-items-center font-bold text-white ${
                    i === 0 ? "bg-green-500" : i === 1 ? "bg-orange-500" : "bg-rose-500"
                  }`}>{i + 1}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{s.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{s.level}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">⏱ {s.time} · 💰 {s.price}</div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                </div>
              ))}
            </div>

            <p className="mt-5 text-sm">Bạn thích ý tưởng <strong>#2 — Hộp quà 3D hoa giấy</strong>? Đây là chi tiết đầy đủ:</p>

            {/* Materials table card */}
            <div className="mt-3 bg-white/80 rounded-2xl overflow-hidden border border-white/60">
              <div className="px-5 py-4 flex items-center justify-between border-b border-border/50">
                <div className="flex items-center gap-2 font-semibold">
                  <Package className="h-4 w-4 text-primary" /> Bộ nguyên liệu cần mua
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">5 món</span>
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
                  {materials.map((m) => (
                    <tr key={m.name} className="border-t border-border/30 hover:bg-white/60">
                      <td className="px-5 py-3">
                        <div className="font-medium">{m.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Copy className="h-3 w-3" /> từ khoá: <span className="font-mono text-primary">{m.keyword}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right font-semibold">{m.price}</td>
                      <td className="px-5 py-3 text-center">
                        <a href={m.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
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
                      <span className="text-lg font-bold gradient-text">{totalCost}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center text-xs text-muted-foreground">
                      <Clock className="inline h-3.5 w-3.5 mr-1" /> ~2 giờ
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Summary chips */}
            <div className="mt-3 flex flex-wrap gap-2">
              <Chip icon={Wallet} label="Ngân sách: 150.000đ" tone="ok" />
              <Chip icon={Clock} label="Thời gian: 2 giờ" />
              <Chip icon={Package} label="5 nguyên liệu" />
            </div>

            {/* Tutorial video card */}
            <a
              href="https://www.youtube.com/results?search_query=diy+3d+paper+flower+gift+box"
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
                <div className="font-semibold truncate">DIY 3D Paper Flower Gift Box — Hướng dẫn chi tiết</div>
                <div className="text-xs text-muted-foreground mt-0.5">18 phút · 1.2M lượt xem</div>
              </div>
              <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
            </a>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <button className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white font-medium">
                <Bookmark className="h-3.5 w-3.5" /> Lưu ý tưởng
              </button>
              <button className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white font-medium">
                Bắt đầu dự án
              </button>
            </div>
          </MessageRow>
        </div>

        {/* Composer */}
        <div className="sticky bottom-4 mt-4">
          <div className="glass-strong rounded-2xl p-2 flex items-end gap-2 shadow-soft">
            <textarea
              rows={1}
              placeholder="Mô tả món quà bạn muốn tạo…"
              className="flex-1 bg-transparent resize-none px-4 py-3 outline-none placeholder:text-muted-foreground text-sm max-h-32"
            />
            <button className="btn-hero h-11 w-11 rounded-xl grid place-items-center shrink-0">
              <Send className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 justify-center">
            {["Quà 20/10", "Quà cưới handmade", "DIY dưới 100k", "Thiệp sinh nhật"].map((q) => (
              <button key={q} className="text-xs px-3 py-1.5 rounded-full bg-white/70 hover:bg-white text-muted-foreground hover:text-foreground">
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function MessageRow({ role, children }: { role: "user" | "ai"; children: React.ReactNode }) {
  const isUser = role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`h-9 w-9 rounded-xl grid place-items-center shrink-0 ${isUser ? "bg-white/80" : "btn-hero"}`}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 ${isUser ? "bg-primary text-primary-foreground" : "bg-white/70"}`}>
        {children}
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
