import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Sparkles, MessageCircle, Heart, Gift, Clock, TrendingUp, ArrowRight, Palette, Scissors, Package } from "lucide-react";

export default function HomePage() {
  const projects = [
    { title: "Bó hoa giấy pastel", progress: 70, cost: "125.000đ", time: "2h", color: "oklch(0.78 0.18 25)" },
    { title: "Hộp quà 3D + QR", progress: 40, cost: "210.000đ", time: "3.5h", color: "oklch(0.82 0.16 85)" },
    { title: "Vòng tay macramé", progress: 90, cost: "65.000đ", time: "1h", color: "oklch(0.78 0.16 145)" },
  ];

  const ideas = [
    { icon: Palette, title: "Tranh acrylic mini", tag: "Cơ bản", price: "80.000đ" },
    { icon: Scissors, title: "Thiệp pop-up 3D", tag: "Trung bình", price: "45.000đ" },
    { icon: Package, title: "Hộp nhạc handmade", tag: "Nâng cao", price: "320.000đ" },
    { icon: Gift, title: "Set quà sinh nhật", tag: "Trung bình", price: "180.000đ" },
  ];

  return (
    <AppShell active="home">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Hero */}
        <section className="relative glass-strong rounded-3xl p-8 md:p-12 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-40 blur-3xl" style={{ background: "var(--gradient-aurora)" }} />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Chào Minh, sẵn sàng sáng tạo?
            </span>
            <h1 className="mt-4 text-3xl md:text-5xl font-extrabold font-display leading-tight">
              Hôm nay bạn muốn tạo <span className="gradient-text">món quà</span> gì?
            </h1>
            <p className="mt-3 text-muted-foreground">
              Hỏi trợ lý AI để nhận ý tưởng, danh sách nguyên liệu, chi phí và video hướng dẫn — chỉ trong vài giây.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/chat" className="btn-hero inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-semibold">
                <MessageCircle className="h-4 w-4" /> Trò chuyện với AI
              </Link>
              <button className="inline-flex items-center gap-2 rounded-2xl bg-white/80 px-6 py-3 font-semibold hover:bg-white">
                Khám phá thư viện <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Dự án đang làm", value: "3", icon: Gift, color: "text-primary" },
            { label: "Đã hoàn thành", value: "12", icon: Heart, color: "text-[color:var(--coral)]" },
            { label: "Giờ sáng tạo", value: "48h", icon: Clock, color: "text-primary" },
            { label: "Ý tưởng đã lưu", value: "27", icon: TrendingUp, color: "text-[color:var(--coral)]" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="glass-card rounded-2xl p-5">
                <Icon className={`h-5 w-5 ${s.color}`} />
                <div className="mt-3 text-3xl font-bold font-display">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            );
          })}
        </section>

        {/* Ongoing projects */}
        <section>
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold font-display">Dự án đang thực hiện</h2>
              <p className="text-sm text-muted-foreground">Tiếp tục nơi bạn đã dừng lại.</p>
            </div>
            <button className="text-sm font-medium text-primary hover:underline">Xem tất cả</button>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {projects.map((p) => (
              <div key={p.title} className="glass-card rounded-2xl overflow-hidden group hover:shadow-soft transition-shadow">
                <div className="h-32 relative" style={{ background: `linear-gradient(135deg, ${p.color}, oklch(0.9 0.1 85))` }}>
                  <div className="absolute inset-0 bg-white/10" />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold">{p.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>💰 {p.cost}</span>
                    <span>⏱ {p.time}</span>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Tiến độ</span>
                      <span className="font-semibold">{p.progress}%</span>
                    </div>
                    <div className="h-2 bg-white/70 rounded-full overflow-hidden">
                      <div className="h-full btn-hero rounded-full" style={{ width: `${p.progress}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ideas */}
        <section>
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold font-display">Ý tưởng cho bạn</h2>
              <p className="text-sm text-muted-foreground">Gợi ý dựa trên sở thích của bạn.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ideas.map((i) => {
              const Icon = i.icon;
              return (
                <div key={i.title} className="glass-card rounded-2xl p-5 hover:shadow-soft transition-all hover:-translate-y-1">
                  <div className="h-11 w-11 rounded-xl btn-hero grid place-items-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{i.title}</h3>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-white/80 text-muted-foreground">{i.tag}</span>
                    <span className="font-semibold text-primary">{i.price}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
