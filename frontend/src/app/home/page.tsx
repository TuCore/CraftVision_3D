"use client";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Sparkles, MessageCircle, Heart, ArrowRight, Box } from "lucide-react";
import { useState, useEffect } from "react";
import { Studio3DSection } from "@/components/studio/Studio3DSection";

export default function HomePage() {
  const [firstName, setFirstName] = useState("bạn");

  useEffect(() => {
    const storedName = localStorage.getItem("fullName");
    if (storedName) {
      setFirstName(storedName.split(' ').pop() || "bạn");
    }
  }, []);

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
                Hôm nay bạn muốn tạo<br/>
                <span className="gradient-text inline-block mt-1 pb-2">món quà gì?</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-lg">
                Hỏi trợ lý AI để nhận ý tưởng, danh sách nguyên liệu, chi phí và video hướng dẫn — chỉ trong vài giây.
              </p>
              <div className="mt-8 flex flex-wrap gap-4 items-center">
                <Link href="/chat" className="btn-hero inline-flex items-center gap-2 rounded-2xl px-7 py-4 font-semibold shadow-coral-glow">
                  <MessageCircle className="h-5 w-5" /> Trò chuyện với AI
                </Link>
                <a 
                  href="#studio-3d" 
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('studio-3d')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 font-semibold text-foreground hover:text-primary transition-colors px-2 py-4 cursor-pointer"
                >
                  Mở Studio 3D <ArrowRight className="h-4 w-4" />
                </a>
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

        {/* 3 Thẻ Tagline bên dưới */}
        <div className="grid grid-cols-3 gap-4 lg:gap-8 max-w-4xl mx-auto -mt-4 relative z-20">
          {[
            { value: "3", label: "Dự án đang làm", icon: Box },
            { value: "12", label: "Đã hoàn thành", icon: Heart },
            { value: "48h", label: "Giờ sáng tạo", icon: Sparkles },
          ].map((tag, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-6 text-left relative overflow-hidden group hover:shadow-soft transition-all border border-border/50">
              <tag.icon className="h-5 w-5 text-muted-foreground mb-3" />
              <div className="text-3xl font-bold font-display text-foreground group-hover:text-primary transition-colors">{tag.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{tag.label}</div>
            </div>
          ))}
        </div>

        {/* Màn hình Gen AI 3D (Studio 3D) thay thế cho phần Dự án & Ý tưởng */}
        <Studio3DSection id="studio-3d" className="pt-2 pb-6" />
      </div>
    </AppShell>
  );
}
