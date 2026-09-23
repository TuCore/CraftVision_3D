"use client";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Sparkles, MessageCircle, Heart, Gift, Clock, TrendingUp, ArrowRight, Palette, Scissors, Package, Box } from "lucide-react";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [firstName, setFirstName] = useState("bạn");

  useEffect(() => {
    const storedName = localStorage.getItem("fullName");
    if (storedName) {
      setFirstName(storedName.split(' ').pop() || "bạn");
    }
  }, []);



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

          <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Cột trái */}
            <div className="text-left">
              <span className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Chào {firstName}, sẵn sàng sáng tạo?
              </span>
              <h1 className="mt-6 text-4xl md:text-5xl font-extrabold font-display leading-[1.15] text-foreground">
                Hôm nay bạn muốn tạo<br />
                <span className="gradient-text inline-block mt-1 pb-2">món quà gì?</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-lg">
                Hỏi trợ lý AI để nhận ý tưởng, danh sách nguyên liệu, chi phí và video hướng dẫn — chỉ trong vài giây.
              </p>
              <div className="mt-8 flex flex-wrap gap-4 items-center">
                <Link href="/chat" className="btn-hero inline-flex items-center gap-2 rounded-2xl px-7 py-4 font-semibold shadow-coral-glow">
                  <MessageCircle className="h-5 w-5" /> Trò chuyện với AI
                </Link>
                <Link href="/chat?mode=three-d" className="inline-flex items-center gap-2 font-semibold text-foreground hover:text-primary transition-colors px-2 py-4">
                  Mở Studio 3D <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Cột phải: Hình ảnh bó hoa */}
            <div className="relative lg:h-[400px] flex items-center justify-center mt-10 lg:mt-0 w-full max-w-sm mx-auto">

              {/* Vòng tròn bg mờ đằng sau để làm nổi bật */}
              <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl"></div>

              {/* Tag 1: Scan in AR (Bên trái) */}
              <div className="absolute top-1/2 -translate-y-1/2 -left-12 md:-left-16 z-20 glass-strong px-4 py-2 rounded-2xl shadow-coral-glow animate-fade-up">
                <span className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Box className="h-4 w-4 text-primary" /> Scan in AR
                </span>
              </div>

              {/* Tag 3: NFC Tag (Bên phải) */}
              <div className="absolute top-1/2 -translate-y-1/2 -right-8 md:-right-12 z-20 glass-strong px-4 py-2 rounded-2xl shadow-soft animate-fade-up" style={{ animationDelay: '0.2s' }}>
                <span className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-500" /> NFC Tag
                </span>
              </div>

              {/* Tag 2: Handmade with Sixc (Bên dưới) */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 glass-card border border-primary/20 px-5 py-2.5 rounded-full shadow-soft animate-fade-up" style={{ animationDelay: '0.4s' }}>
                <span className="font-bold text-sm text-primary flex items-center gap-2 whitespace-nowrap">
                  <Heart className="h-4 w-4 fill-primary" /> Handmade with SIXC
                </span>
              </div>

              {/* Ảnh bó hoa */}
              <div className="relative z-10 w-[750px] h-[750px] max-w-full flex items-center justify-center">
                <img
                  src="/image/hoav3.png"
                  alt="CraftVision 3D"
                  className="w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
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
