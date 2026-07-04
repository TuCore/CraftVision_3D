import Link from "next/link";
import { Box, Sparkles, ArrowRight, MessageCircle, Gift, Palette } from "lucide-react";

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="blob animate-pulse-glow" style={{ top: -100, left: -80, width: 420, height: 420, background: "oklch(0.78 0.22 35)" }} />
      <div className="blob animate-pulse-glow" style={{ top: "30%", right: -120, width: 500, height: 500, background: "oklch(0.88 0.18 95)", animationDelay: "1s" }} />
      <div className="blob animate-pulse-glow" style={{ bottom: -140, left: "20%", width: 460, height: 460, background: "oklch(0.86 0.2 140)", animationDelay: "2s" }} />

      <header className="sticky top-0 z-50 px-4 pt-4">
        <div className="mx-auto max-w-7xl glass-strong rounded-2xl px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <span className="grid h-9 w-9 place-items-center rounded-xl btn-hero"><Box className="h-5 w-5" /></span>
            <span className="font-display"><span className="gradient-text">Craft</span>Vision<span className="text-[color:var(--coral)]">3D</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth" className="rounded-xl bg-white/70 hover:bg-white px-4 py-2 text-sm font-medium">Đăng nhập</Link>
            <Link href="/auth" className="btn-hero rounded-xl px-4 py-2 text-sm font-semibold">Bắt đầu</Link>
          </div>
        </div>
      </header>

      <section className="relative px-4 pt-20 pb-24 text-center z-10">
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> AI · Handmade · 3D
          </span>
          <h1 className="mt-6 text-5xl md:text-7xl font-extrabold font-display leading-[1.05]">
            Tạo <span className="gradient-text">món quà thủ công</span> đầy ý nghĩa cùng AI
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
            Gợi ý ý tưởng, danh sách nguyên liệu, ước tính chi phí và video hướng dẫn — chỉ trong vài giây.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link href="/auth" className="btn-hero inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 font-semibold">
              Bắt đầu miễn phí <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/chat" className="inline-flex items-center gap-2 rounded-2xl bg-white/80 px-6 py-3.5 font-semibold hover:bg-white">
              <MessageCircle className="h-4 w-4" /> Xem demo chatbot
            </Link>
          </div>

          <div className="mt-16 grid sm:grid-cols-3 gap-4 text-left">
            {[
              { icon: Sparkles, title: "Ý tưởng AI", desc: "Gợi ý cá nhân hoá theo sở thích và ngân sách." },
              { icon: Gift, title: "Nguyên liệu & chi phí", desc: "Bảng tổng hợp món cần mua + link mua ngay." },
              { icon: Palette, title: "Video hướng dẫn", desc: "Từng bước rõ ràng cho mọi cấp độ." },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="glass-card rounded-2xl p-5">
                  <div className="h-10 w-10 rounded-xl btn-hero grid place-items-center"><Icon className="h-5 w-5" /></div>
                  <h3 className="mt-3 font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
