'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

import { Heart, Gift, Sparkles, Smile, Star, Zap, ShieldCheck, Hammer, Leaf } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { cardTemplates } from '@/features/cards/catalog';

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

  const selected3dTemplate = useMemo(() => {
    const rawValue = String(gift?.threeDModelUrl || '').trim();
    const slug = rawValue.startsWith('slug:') ? rawValue.slice(5) : rawValue;
    return cardTemplates.find((template) => template.slug === slug || rawValue.includes(template.slug)) || null;
  }, [gift?.threeDModelUrl]);

  const cardPreviewUrl = useMemo(() => {
    if (!selected3dTemplate) return null;
    const query = new URLSearchParams({
      preview: '1',
      recipient: gift?.receiverName || 'Người nhận',
      sender: gift?.senderName || 'Người gửi',
      title: gift?.giftTitle || selected3dTemplate.title,
      message: gift?.message || selected3dTemplate.message,
    });
    const previewImage = String(gift?.previewImageUrl || '');
    if (previewImage && !previewImage.startsWith('data:') && previewImage.length < 1500) {
      query.set('photo', previewImage);
    }
    return `/love-gift/${selected3dTemplate.slug}?${query.toString()}`;
  }, [gift?.giftTitle, gift?.message, gift?.previewImageUrl, gift?.receiverName, gift?.senderName, selected3dTemplate]);

  const isCraftCertificate = gift?.theme === 'craft-certificate';

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
            {isCraftCertificate ? (
              <>Chứng nhận <span className="gradient-text pb-1">CraftVision</span></>
            ) : (
              <>Bạn có một <span className="gradient-text pb-1">món quà</span><br />từ {gift.senderName || 'Ai đó'}!</>
            )}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-12 font-medium max-w-md mx-auto bg-white/40 backdrop-blur-sm px-6 py-2 rounded-full border border-white/50 shadow-sm">
            {isCraftCertificate ? 'Nguồn gốc & câu chuyện chế tác thủ công' : <>Dành riêng cho <span className="font-bold text-foreground text-xl">{gift.receiverName || 'Bạn'}</span></>}
          </p>
          <button 
            onClick={() => setShowContent(true)}
            className="btn-hero text-black px-12 py-5 rounded-full text-xl font-bold shadow-coral-glow hover:scale-105 transition-transform flex items-center gap-3 animate-bounce"
          >
            <Sparkles className="w-6 h-6" /> {isCraftCertificate ? 'Xem chứng nhận' : 'Mở Quà Ngay'}
          </button>
        </div>
      ) : (
        <main className="relative z-10 mx-auto px-6 flex flex-col min-h-screen transition-[max-width] duration-700 max-w-5xl">
          {isCraftCertificate ? (
            <CraftCertificate
              title={gift.giftTitle}
              message={gift.message}
              image={gift.previewImageUrl}
              secretKey={String(secretKey || '')}
            />
          ) : (
          <>

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
              
              {/* Procedural 3D card or warm 2D default card */}
              <article className="relative bg-white p-4 pb-12 shadow-xl ring-1 ring-clay/5 rotate-2 transition-all duration-700 hover:-translate-y-2 hover:rotate-0 hover:shadow-coral-glow group self-center mt-4 w-[90%] max-w-sm">
                <div className="pointer-events-none absolute -right-20 -top-20 size-40 rounded-full bg-rose-200/40 blur-3xl transition-transform duration-700 group-hover:scale-150" />
                <div className="aspect-square w-full overflow-hidden bg-clay/5 relative">
                  {selected3dTemplate ? (
                    <iframe
                      src={cardPreviewUrl || `/love-gift/${selected3dTemplate.slug}?preview=1`}
                      title={`Thiệp 3D ${selected3dTemplate.title}`}
                      className="h-full w-full border-0"
                      allow="autoplay"
                    />
                  ) : gift.previewImageUrl ? (
                    <img
                      src={gift.previewImageUrl}
                      alt={gift.giftTitle || 'Ảnh kỷ niệm trên thiệp'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-rose-50 to-amber-50 p-8 text-center">
                      <Heart className="mb-5 h-16 w-16 fill-rose-200 text-rose-400" />
                      <p className="font-display text-2xl italic text-clay/80">{gift.giftTitle || 'Thiệp lời chúc dành riêng cho bạn'}</p>
                    </div>
                  )}
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
          </>
          )}
        </main>
      )}
    </div>
  );
}

function CraftCertificate({
  title,
  message,
  image,
  secretKey,
}: {
  title?: string;
  message?: string;
  image?: string;
  secretKey: string;
}) {
  return (
    <section className="flex flex-1 items-center py-12 animate-reveal">
      <article className="w-full overflow-hidden rounded-[2.5rem] border border-amber-200/70 bg-white/85 shadow-2xl backdrop-blur-md">
        <div className="grid md:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-72 bg-gradient-to-br from-amber-100 via-orange-50 to-emerald-50 p-8">
            {image ? (
              <img src={image} alt={title || 'Sản phẩm thủ công CraftVision'} className="h-full min-h-64 w-full rounded-3xl object-cover shadow-lg" />
            ) : (
              <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-3xl border border-white/80 bg-white/50 text-center">
                <Hammer className="mb-4 h-16 w-16 text-amber-700" />
                <span className="font-display text-3xl text-clay">Made by hand</span>
              </div>
            )}
          </div>
          <div className="p-8 md:p-12">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              <ShieldCheck className="h-5 w-5" /> Chứng nhận chính hãng
            </div>
            <h1 className="font-display text-3xl font-bold text-clay md:text-5xl">{title || 'Chứng nhận chế tác thủ công'}</h1>
            <p className="mt-5 text-base leading-7 text-clay/80">
              {message || 'Sản phẩm được hoàn thiện thủ công, kiểm tra chất lượng và gắn định danh NFC bởi CraftVision 3D.'}
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-amber-200/70 bg-amber-50/70 p-4">
                <Hammer className="mb-2 h-6 w-6 text-amber-700" />
                <strong className="block text-sm text-clay">Chế tác thủ công</strong>
                <span className="text-xs text-clay/65">Hoàn thiện và kiểm tra từng sản phẩm.</span>
              </div>
              <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/70 p-4">
                <Leaf className="mb-2 h-6 w-6 text-emerald-700" />
                <strong className="block text-sm text-clay">Câu chuyện sản phẩm</strong>
                <span className="text-xs text-clay/65">Tôn trọng vật liệu và dấu ấn người làm.</span>
              </div>
            </div>
            <div className="mt-8 border-t border-clay/10 pt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-clay/50">
              Mã xác thực NFC: {secretKey.slice(0, 12) || 'CRAFTVISION'}
            </div>
          </div>
        </div>
      </article>
    </section>
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


