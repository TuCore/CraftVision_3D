'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

import { Heart, Gift, Camera, Sparkles, Smile, Star, Zap, User } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import confetti from 'canvas-confetti';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
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
    <article className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#FFF9E6]/90 to-white/60 p-8 shadow-soft ring-1 ring-white/60 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:shadow-coral-glow group">
      <div className="pointer-events-none absolute -left-20 -bottom-20 size-48 rounded-full bg-coral/10 blur-3xl transition-transform duration-700 group-hover:scale-150" />
      <div className="mb-5 grid size-12 place-items-center rounded-full bg-coral/10 text-coral ring-1 ring-coral/20 shadow-sm">
        <Heart className="size-5 fill-coral/80" />
      </div>
      
      {!quote ? (
        <>
          <p className="mb-6 text-[17px] italic leading-relaxed text-clay/90 relative z-10" style={{ fontFamily: "Plus Jakarta Sans" }}>
            Một thông điệp tích cực dành riêng cho bạn ngày hôm nay.
          </p>
          <button onClick={generateMotivation} disabled={isGenerating} className="text-[11px] font-bold uppercase tracking-[0.24em] text-coral transition-all hover:opacity-70 flex items-center gap-2 group-hover:tracking-[0.3em]">
            {isGenerating ? 'Đang chọn lọc...' : 'Bóc thông điệp →'}
          </button>
        </>
      ) : (
        <div className="animate-fade-up relative z-10">
          <p className="mb-6 text-[17px] font-medium italic leading-relaxed text-clay/90" style={{ fontFamily: "Plus Jakarta Sans" }}>
            "{quote}"
          </p>
          <button onClick={generateMotivation} className="text-[11px] font-bold uppercase tracking-[0.24em] text-coral transition-all hover:opacity-70 group-hover:tracking-[0.3em]">
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

  useEffect(() => {
    // Load model-viewer script dynamically for the demo
    if (typeof window !== "undefined" && !customElements.get("model-viewer")) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
      document.head.appendChild(script);
    }
  }, []);

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

  const themeConfig = useMemo(() => {
    const t = gift?.theme?.toLowerCase() || 'sincere';
    const baseWarm = { bg1: 'oklch(0.92 0.05 60)', bg2: 'oklch(0.95 0.03 70)', bg3: 'oklch(0.96 0.02 80)', icon: Gift, iconColor: 'text-[#C8B4A0] fill-[#C8B4A0]/20' };
    
    if (t === 'romantic') return { ...baseWarm, icon: Heart, iconColor: 'text-rose-400 fill-rose-400/20' };
    if (t === 'funny') return { ...baseWarm, icon: Smile, iconColor: 'text-amber-500 fill-amber-500/20' };
    if (t === 'sincere') return { ...baseWarm, icon: Star, iconColor: 'text-orange-400 fill-orange-400/20' };
    if (t === 'encouraging') return { ...baseWarm, icon: Zap, iconColor: 'text-emerald-500 fill-emerald-500/20' };
    
    return baseWarm;
  }, [gift?.theme]);

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
        <main className="relative z-10 mx-auto px-6 flex flex-col min-h-screen transition-[max-width] duration-700 max-w-5xl">


          {/* Main Layout */}
          <section className="flex-1 flex flex-col md:flex-row md:items-center justify-center gap-12 lg:gap-20 animate-reveal py-12" style={{ animationDelay: "150ms" }}>
            
            {/* Left: Header text */}
            <header className="flex-1 text-center md:text-left relative">
              <div className="absolute -left-10 -top-10 size-40 rounded-full bg-butter/30 blur-3xl pointer-events-none" />
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.3em] text-clay/50 relative z-10">
                Một món quà thủ công
              </p>
              <h1 className="font-display text-4xl font-medium italic leading-relaxed text-[#6B5A49] md:text-5xl lg:text-6xl relative z-10">
                Dành riêng cho <br />
                <span className="mt-3 block text-5xl font-extrabold not-italic text-transparent bg-clip-text bg-gradient-to-br from-clay to-[#A88B7D] md:text-6xl lg:text-7xl drop-shadow-sm pb-2">
                  {gift.receiverName}
                </span>
              </h1>
              <div className="mt-8 md:hidden relative z-10">
                <OrnamentDivider />
              </div>
            </header>

            {/* Right: message + wish cards */}
            <div className="flex-1 flex flex-col gap-6 w-full max-w-lg mx-auto md:mx-0 animate-reveal" style={{ animationDelay: "300ms" }}>
              
              {/* Daily wish card */}
              <MotivationSection />



              {/* Message card */}
              <article className="relative overflow-hidden rounded-[2.5rem] bg-white/70 p-8 shadow-soft ring-1 ring-white/80 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:shadow-coral-glow group">
                <div className="pointer-events-none absolute -right-20 -top-20 size-48 rounded-full bg-butter/40 blur-3xl transition-transform duration-700 group-hover:scale-150" />
                <div className="mb-6 flex items-center gap-3">
                  <div className="h-px w-6 bg-clay/15 md:hidden" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-clay/70">
                    Lời chúc
                  </span>
                  <div className="h-px flex-1 bg-clay/15" />
                </div>
                <div className="relative z-10">
                  <p
                    className="whitespace-pre-line text-[17px] italic leading-relaxed text-clay/90"
                    style={{ fontFamily: "Plus Jakarta Sans" }}
                  >
                    {gift.message || "Món quà này được làm riêng cho bạn bằng tất cả tình cảm."}
                  </p>
                </div>
                <div className="mt-8 flex items-center justify-end">
                  <div className="flex gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                    <div className="size-1.5 rounded-full bg-coral/30" />
                    <div className="size-1.5 rounded-full bg-coral/60" />
                    <div className="size-1.5 rounded-full bg-coral" />
                  </div>
                </div>
              </article>
              
              {/* 3D Model Viewer - Polaroid Style at the bottom */}
              <article className="relative bg-white p-4 pb-12 shadow-xl ring-1 ring-clay/5 rotate-2 transition-all duration-700 hover:-translate-y-2 hover:rotate-0 hover:shadow-coral-glow group self-center mt-4 w-[90%] max-w-sm">
                <div className="pointer-events-none absolute -right-20 -top-20 size-40 rounded-full bg-rose-200/40 blur-3xl transition-transform duration-700 group-hover:scale-150" />
                <div className="aspect-square w-full overflow-hidden bg-clay/5 relative">
                  {/* @ts-ignore */}
                  <model-viewer
                    src="https://modelviewer.dev/shared-assets/models/Astronaut.glb"
                    auto-rotate
                    camera-controls
                    style={{ width: '100%', height: '100%', outline: 'none' }}
                    environment-image="neutral"
                    exposure="1"
                  ></model-viewer>
                </div>
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <p className="font-display text-2xl text-clay/80 italic opacity-80" style={{ fontFamily: "Caveat, cursive" }}>For You</p>
                </div>
                {/* Pin decor */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-black/10 rounded-full shadow-inner blur-[1px]"></div>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-rose-300 rounded-full shadow-sm border border-rose-400"></div>
              </article>
            </div>
          </section>

          {/* Meta strip */}
          <section className="border-t border-clay/10 pt-8 pb-4 animate-reveal" style={{ animationDelay: "600ms" }}>
            <div className="flex flex-col items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-[0.22em] text-clay/50 md:flex-row">
              <div className="flex items-center gap-3">
                <span>#{String(gift.scanCount || 1).padStart(3, '0')}</span>
                <span className="text-clay/20">/</span>
                <span>CraftVision 3D</span>
              </div>
            </div>
          </section>

          {/* Signature */}
          <footer className="mt-12 text-center animate-reveal" style={{ animationDelay: "750ms" }}>
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


