'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage } from '@react-three/drei';
import { Heart, Gift, Camera, Sparkles, Smile, Star, Zap } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import confetti from 'canvas-confetti';

function ModelViewer({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return (
    <Canvas shadows camera={{ position: [0, 0, 150], fov: 40 }}>
      <Stage environment="city" intensity={0.6}>
        <primitive object={scene} />
      </Stage>
      <OrbitControls autoRotate autoRotateSpeed={2} makeDefault />
    </Canvas>
  );
}

const MOTIVATION_QUOTES = [
  "Bạn tuyệt vời hơn bạn nghĩ rất nhiều! Hãy luôn tin vào bản thân mình nhé. 🌟",
  "Hôm nay là một ngày tuyệt vời để bắt đầu những điều mới mẻ. Cố lên! 💪",
  "Mỗi bước đi nhỏ đều đưa bạn đến gần hơn với ước mơ của mình. Đừng bỏ cuộc! 🌈",
  "Bạn xứng đáng với tất cả những điều tốt đẹp nhất trên thế giới này. ❤️",
  "Hãy mỉm cười nhiều hơn, vì nụ cười của bạn thực sự rất đẹp! 😊",
  "Dù hôm nay có ra sao, hãy nhớ rằng ngày mai mặt trời vẫn sẽ mọc. 🌅",
  "Sự cố gắng của bạn hôm nay sẽ là niềm tự hào của bạn ngày mai. ✨"
];

function MotivationSection() {
  const [quote, setQuote] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMotivation = () => {
    setIsGenerating(true);
    setQuote(null);
    setTimeout(() => {
      const randomQuote = MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)];
      setQuote(randomQuote);
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <article className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-butter/60 to-background p-7 shadow-soft ring-1 ring-butter/60">
      <div className="mb-4 grid size-10 place-items-center rounded-full bg-coral/15 text-coral">
        <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3c1.54 0 2.93.651 3.91 1.696.979-1.045 2.37-1.696 3.91-1.696 2.974 0 5.438 2.322 5.438 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
      </div>
      
      {!quote ? (
        <>
          <p className="mb-5 text-base italic leading-relaxed text-clay/90">
            Một thông điệp tích cực dành riêng cho bạn ngày hôm nay.
          </p>
          <button onClick={generateMotivation} disabled={isGenerating} className="text-[11px] font-bold uppercase tracking-[0.24em] text-coral transition-opacity hover:opacity-70 flex items-center gap-2">
            {isGenerating ? 'Đang chọn lọc...' : 'Bóc thông điệp →'}
          </button>
        </>
      ) : (
        <div className="animate-fade-up">
          <p className="mb-5 text-base italic leading-relaxed text-clay/90">
            "{quote}"
          </p>
          <button onClick={generateMotivation} className="text-[11px] font-bold uppercase tracking-[0.24em] text-coral transition-opacity hover:opacity-70">
            Thử một câu khác →
          </button>
        </div>
      )}
    </article>
  );
}

export default function GiftScanPage() {
  const { secretKey } = useParams();
  const [showContent, setShowContent] = useState(false);

  const { data: gift, isLoading, error } = useQuery({
    queryKey: ['gift-scan', secretKey],
    queryFn: async () => {
      const { data } = await api.get(`/api/gifts?secretKey=${secretKey}`);
      return data; // returns GiftSummaryDto with extra info or a specific GiftDisplayDto
    },
    enabled: !!secretKey,
  });

  useEffect(() => {
    if (showContent) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 50 };

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } }));
      }, 250);
    }
  }, [showContent]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground relative overflow-hidden">
      <div className="blob animate-pulse-glow" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 300, height: 300, background: "oklch(0.78 0.22 35)" }} />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="font-semibold text-lg animate-pulse">Đang tải hộp quà...</p>
      </div>
    </div>
  );
  
  if (error || !gift) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center relative overflow-hidden">
      <div className="blob animate-pulse-glow" style={{ top: -100, left: -80, width: 420, height: 420, background: "oklch(0.9 0.05 15)" }} />
      <div className="relative z-10 glass-strong p-10 rounded-3xl max-w-md w-full shadow-soft flex flex-col items-center">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
          <Gift className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-2xl font-extrabold font-display mb-2 text-foreground">Thẻ NFC Không Hợp Lệ</h1>
        <p className="text-muted-foreground font-medium">Không tìm thấy món quà nào được liên kết với thẻ này.</p>
      </div>
    </div>
  );

  const themeConfig = useMemo(() => {
    const t = gift?.theme?.toLowerCase() || 'sincere';
    const baseWarm = { bg1: 'oklch(0.92 0.05 60)', bg2: 'oklch(0.95 0.03 70)', bg3: 'oklch(0.96 0.02 80)', icon: Gift, iconColor: 'text-[#C8B4A0] fill-[#C8B4A0]/20' };
    
    if (t === 'romantic') return { ...baseWarm, icon: Heart, iconColor: 'text-rose-400 fill-rose-400/20' };
    if (t === 'funny') return { ...baseWarm, icon: Smile, iconColor: 'text-amber-500 fill-amber-500/20' };
    if (t === 'sincere') return { ...baseWarm, icon: Star, iconColor: 'text-orange-400 fill-orange-400/20' };
    if (t === 'encouraging') return { ...baseWarm, icon: Zap, iconColor: 'text-emerald-500 fill-emerald-500/20' };
    
    return baseWarm;
  }, [gift?.theme]);

  const ThemeIcon = themeConfig.icon;

  return (
    <div className="relative min-h-screen overflow-x-clip bg-background font-sans">
      {/* Background Decor */}
      <div className="blob animate-pulse-glow" style={{ top: -100, left: -80, width: 420, height: 420, background: themeConfig.bg1 }} />
      <div className="blob animate-pulse-glow" style={{ top: "40%", right: -120, width: 500, height: 500, background: themeConfig.bg2, animationDelay: "1s" }} />
      <div className="blob animate-pulse-glow" style={{ bottom: -140, left: "20%", width: 460, height: 460, background: themeConfig.bg3, animationDelay: "2s" }} />
      
      {!showContent ? (
        <div className="flex flex-col items-center justify-center min-h-screen relative z-10 p-6 text-center animate-fade-in-page">
          <div className="relative mb-12 group cursor-pointer" onClick={() => setShowContent(true)}>
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/40 transition-all duration-500 animate-pulse" />
            <div className="w-40 h-40 rounded-full flex items-center justify-center bg-white shadow-coral-glow transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 relative z-10">
              <Gift className="w-20 h-20 text-primary" />
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-primary shadow-sm opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
              Chạm để mở
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-display leading-[1.15] mb-6 drop-shadow-sm">
            Bạn có một <span className="gradient-text pb-1">món quà</span><br />từ {gift.senderName || 'Ai đó'}!
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-12 font-medium max-w-md mx-auto bg-white/40 backdrop-blur-sm px-6 py-2 rounded-full border border-white/50 shadow-sm">
            Dành riêng cho <span className="font-bold text-foreground text-xl">{gift.receiverName || 'Bạn'}</span>
          </p>
          <button 
            onClick={() => setShowContent(true)}
            className="btn-hero px-12 py-5 rounded-full text-xl font-bold shadow-coral-glow hover:scale-105 transition-transform flex items-center gap-3 animate-bounce"
          >
            <Sparkles className="w-6 h-6" /> Mở Quà Ngay
          </button>
        </div>
      ) : (
        <main className="relative z-10 mx-auto px-6 pt-4 transition-[max-width] duration-700 max-w-5xl">
          {/* Ribbon eyebrow */}
          <div className="mb-10 flex items-center justify-center gap-4 animate-reveal">
            <div className="h-px w-16 bg-clay/20" />
            <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-clay/60">
              №{String(gift.scanCount || 1).padStart(3, '0')} · Lễ nghi đã hoàn tất
            </span>
            <div className="h-px w-16 bg-clay/20" />
          </div>

          {/* Title + attribution */}
          <header className="mb-16 text-center animate-reveal" style={{ animationDelay: "150ms" }}>
            <h1 className="mb-6 whitespace-pre-line text-5xl font-extrabold leading-[0.92] tracking-[-0.03em] text-clay md:text-7xl">
              {gift.giftTitle || 'Quà Tặng Đặc Biệt'}
            </h1>
            <OrnamentDivider />
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm font-medium">
              <span className="text-clay/60">Gửi từ</span>
              <span className="rounded-full border border-clay/10 bg-clay/5 px-3 py-1 text-coral">
                {gift.senderName}
              </span>
              <span className="text-clay/60">Dành cho</span>
              <span className="rounded-full border border-clay/10 bg-clay/5 px-3 py-1 text-coral">
                {gift.receiverName}
              </span>
            </div>
          </header>

          {/* Two-column showcase */}
          <section className="mb-20 grid gap-8 md:grid-cols-5 md:gap-10 animate-reveal" style={{ animationDelay: "300ms" }}>
            
            {/* Left: 3D display */}
            <div className="relative md:col-span-3">
              <div className="absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-coral animate-halo" />
              <CornerMarks />
              <div className="group relative overflow-hidden rounded-[2.5rem] bg-white/50 p-6 shadow-coral-glow ring-1 ring-clay/10 backdrop-blur-md transition-transform duration-700 hover:scale-[1.01] md:p-8">
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-butter/10 animate-ritual-float">
                  <div className="size-full">
                    <ModelViewer url={(gift.threeDModelUrl && !gift.threeDModelUrl.includes('readyplayer.me')) ? gift.threeDModelUrl : 'https://modelviewer.dev/shared-assets/models/Astronaut.glb'} />
                  </div>
                  
                  {/* Top-left rotate badge */}
                  <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-white/60 bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-clay backdrop-blur-md">
                    <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Xoay 360°</span>
                  </div>
                  
                  {/* Bottom-center pulse */}
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-clay glass-strong">
                    <div className="size-1 animate-pulse rounded-full bg-coral" />
                    <span>Chạm để tương tác</span>
                  </div>
                </div>
                
                {/* Museum tag under image */}
                <div className="mt-5 flex items-center justify-between px-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-clay/50">
                  <span>Gốm thủ công</span>
                  <span className="text-clay/25">·</span>
                  <span>Bản in độc bản</span>
                  <span className="text-clay/25">·</span>
                  <span>#{String(gift.scanCount || 1).padStart(3, '0')}</span>
                </div>
              </div>
            </div>

            {/* Right: message + wish */}
            <div className="flex flex-col gap-6 md:col-span-2">
              {/* Message card */}
              <article className="relative overflow-hidden rounded-[2rem] bg-white/60 p-7 shadow-soft ring-1 ring-clay/10 backdrop-blur-md">
                <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-butter/50 blur-3xl" />
                <div className="mb-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-clay/15" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-clay/70">
                    Lời nhắn
                  </span>
                  <div className="h-px w-6 bg-clay/15" />
                </div>
                <p
                  className="whitespace-pre-line text-[17px] italic leading-relaxed text-clay/90"
                  style={{ fontFamily: "Plus Jakarta Sans" }}
                >
                  {gift.message || "Món quà này được làm riêng cho bạn bằng tất cả tình cảm."}
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex gap-1">
                    <div className="size-1 rounded-full bg-coral" />
                    <div className="size-1 rounded-full bg-coral/50" />
                    <div className="size-1 rounded-full bg-coral/20" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-clay/50">
                    — {gift.senderName}
                  </span>
                </div>
              </article>
              
              {/* Daily wish card */}
              <MotivationSection />
            </div>
          </section>

          {/* Meta strip */}
          <section className="border-t border-clay/10 pt-8 animate-reveal" style={{ animationDelay: "600ms" }}>
            <div className="flex flex-col items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-[0.22em] text-clay/50 md:flex-row">
              <div className="flex items-center gap-3">
                <span>#{String(gift.scanCount || 1).padStart(3, '0')}</span>
                <span className="text-clay/20">/</span>
                <span>CraftVision 3D</span>
              </div>
            </div>
          </section>

          {/* Signature */}
          <footer className="mt-20 text-center animate-reveal pb-24" style={{ animationDelay: "750ms" }}>
            <OrnamentDivider />
            <div className="mt-6 inline-flex flex-col items-center">
              <span className="mb-2 text-[9px] uppercase tracking-[0.3em] text-clay/40">
                Authentic Experience By
              </span>
              <img src="/image/logoweb.jpg" alt="Logo" className="w-8 h-8 rounded-full object-cover grayscale opacity-60 hover:opacity-100 transition-opacity" />
            </div>
          </footer>
        </main>
      )}
    </div>
  );
}

function OrnamentDivider() {
  return (
    <div className="mx-auto flex items-center justify-center gap-3 text-clay/40">
      <div className="h-px w-16 bg-clay/20" />
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" d="M12 3v18M3 12h18M6 6l12 12M18 6L6 18" />
      </svg>
      <div className="h-px w-16 bg-clay/20" />
    </div>
  );
}

function CornerMarks() {
  const base = "absolute size-4 border-clay/30";
  return (
    <>
      <div className={`${base} -top-1 -left-1 border-l border-t rounded-tl-md`} />
      <div className={`${base} -top-1 -right-1 border-r border-t rounded-tr-md`} />
      <div className={`${base} -bottom-1 -left-1 border-l border-b rounded-bl-md`} />
      <div className={`${base} -bottom-1 -right-1 border-r border-b rounded-br-md`} />
    </>
  );
}
