import Link from "next/link";
import { Box, Sparkles, ArrowRight, MessageCircle, Gift, Palette } from "lucide-react";
import { StarryBackground } from "@/components/StarryBackground";

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-clip text-white">
      <StarryBackground />

      <header className="fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ease-in-out bg-transparent py-5 px-4 sm:px-8 border-b border-transparent">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <img src="/image/logoweb.jpg" alt="CraftVision3D Logo" className="w-10 h-10 object-cover rounded-full shadow-sm shrink-0 border border-white/40" />
            <span className="font-display transition-colors duration-300">
              <span className="text-white drop-shadow-sm font-extrabold">
                <span className="text-amber-200">Craft</span>Vision
                <span className="text-rose-300">3D</span>
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth" className="rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 text-sm font-medium">Đăng nhập</Link>
            <Link href="/auth" className="btn-hero rounded-xl px-4 py-2 text-sm font-semibold">Bắt đầu</Link>
          </div>
        </div>
      </header>

      <section className="relative px-4 pt-32 pb-24 text-center z-10">
        <div className="mx-auto max-w-5xl">
          <span className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> AI · Handmade · 3D
          </span>
          <h1 className="mt-6 text-5xl md:text-7xl font-extrabold font-display leading-[1.15] drop-shadow-lg">
            <span className="whitespace-nowrap">Tạo <span className="gradient-text pb-1">món quà thủ công</span></span><br />
            đầy ý nghĩa<br />
            cùng AI
          </h1>
          <p className="mt-6 text-lg text-white/90 max-w-xl mx-auto drop-shadow-sm">
            Gợi ý ý tưởng, danh sách nguyên liệu, ước tính chi phí và video hướng dẫn — chỉ trong vài giây.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link href="/auth" className="btn-hero inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 font-semibold">
              Bắt đầu miễn phí <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/chat?demo=true" className="inline-flex items-center gap-2 rounded-2xl bg-white/20 backdrop-blur-md px-6 py-3.5 font-semibold hover:bg-white/30 text-white">
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
                <div key={f.title} className="glass-card rounded-2xl p-5 bg-white/10 backdrop-blur-md border-white/20">
                  <div className="h-10 w-10 rounded-xl btn-hero grid place-items-center"><Icon className="h-5 w-5" /></div>
                  <h3 className="mt-3 font-semibold text-white">{f.title}</h3>
                  <p className="text-sm text-white/80 mt-1">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
