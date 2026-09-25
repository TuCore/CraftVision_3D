"use client";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Sparkles, MessageCircle, ArrowRight, Headphones, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { Studio3DSection } from "@/components/studio/Studio3DSection";
import { TemplateProductsSection } from "@/components/home/TemplateProductsSection";
import { toast } from "sonner";

export default function HomePage() {
  const [firstName, setFirstName] = useState("bạn");
  const [activeSlide, setActiveSlide] = useState(0);
  const [scrollOpacity, setScrollOpacity] = useState(0);

  useEffect(() => {
    const storedName = localStorage.getItem("fullName");
    if (storedName) {
      setFirstName(storedName.split(' ').pop() || "bạn");
    }
  }, []);

  // Background carousel slides
  const slides = [
    { id: 0, image: "/dreamy-hero-bg.jpg", title: "Bầu trời hoàng hôn tinh vân mộng mơ 1" },
    { id: 1, image: "/dreamy-hero-bg.jpg", title: "Bầu trời hoàng hôn tinh vân mộng mơ 2" },
    { id: 2, image: "/dreamy-hero-bg.jpg", title: "Bầu trời hoàng hôn tinh vân mộng mơ 3" },
  ];

  // Auto-advance carousel slide every 8s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Scroll effect for the bottom gradient overlay
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Tăng opacity từ 0 -> 1 trong khoảng 300px cuộn đầu tiên
      const opacity = Math.min(scrollY / 300, 1);
      setScrollOpacity(opacity);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial scroll position

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AppShell active="home">
      {/* 1. Full-screen Hero Section (100vh / min-h-[100dvh]) */}
      <section className="relative w-full min-h-[100dvh] h-screen flex flex-col justify-center items-center text-center px-4 overflow-hidden group">
        {/* Background carousel slides */}
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out ${
              activeSlide === index
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105 pointer-events-none"
            }`}
            style={{ backgroundImage: `url('${slide.image}')` }}
          />
        ))}

        {/* Subtle twilight mauve & purple depth overlays for optimal text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2b1023]/40 via-[#3d1630]/25 to-[#240a1b]/60 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#200c1a]/30 to-[#12050e]/60 pointer-events-none" />

        {/* Whimsical Hand-drawn SVG Doodles (Crescent moon, stars, constellations) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-45" xmlns="http://www.w3.org/2000/svg">
          {/* Trăng khuyết doodle góc trên bên trái */}
          <path d="M 120 70 A 35 35 0 0 0 170 125 A 40 40 0 1 1 120 70 Z" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="3 2" className="animate-pulse" style={{ animationDuration: '4s' }} />
          
          {/* Ngôi sao doodle 5 cánh vẽ tay góc trên giữa */}
          <path d="M 480 45 L 485 60 L 500 62 L 488 72 L 492 87 L 480 77 L 468 87 L 472 72 L 460 62 L 475 60 Z" fill="none" stroke="white" strokeWidth="1.2" opacity="0.7" />
          
          {/* Ngôi sao doodle vẽ tay lớn góc dưới bên phải */}
          <path d="M 850 380 L 870 420 L 915 425 L 880 455 L 890 500 L 850 475 L 810 500 L 820 455 L 785 425 L 830 420 Z" fill="none" stroke="white" strokeWidth="1.6" opacity="0.6" />
          
          {/* Các hạt sao lấp lánh rải rác */}
          <path d="M 260 200 L 263 210 L 273 213 L 263 216 L 260 226 L 257 216 L 247 213 L 257 210 Z" fill="white" opacity="0.7" />
          <path d="M 720 140 L 723 148 L 731 150 L 723 152 L 720 160 L 717 152 L 709 150 L 717 148 Z" fill="white" opacity="0.6" />
          <path d="M 980 220 L 982 228 L 990 230 L 982 232 L 980 240 L 978 232 L 970 230 L 978 228 Z" fill="white" opacity="0.5" />
          <path d="M 160 380 L 162 386 L 168 388 L 162 390 L 160 396 L 158 390 L 152 388 L 158 386 Z" fill="white" opacity="0.5" />

          {/* Đường nét vẽ mây bồng bềnh */}
          <path d="M 50 420 Q 90 390 140 410 Q 190 390 230 425" fill="none" stroke="white" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.35" />
          <path d="M 780 80 Q 820 50 870 70 Q 920 50 960 85" fill="none" stroke="white" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.3" />
        </svg>

        {/* Centered Content */}
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          {/* Tagline / Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-sm animate-fade-down">
            <Sparkles className="h-3.5 w-3.5 text-amber-200" />
            <span className="text-amber-100 text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase">
              Chào {firstName}, sẵn sàng sáng tạo?
            </span>
          </div>

          {/* Tiêu đề chính giữ trọn vẹn câu chữ */}
          <h1 className="mt-6 text-4xl sm:text-6xl md:text-7xl font-extrabold font-display text-white tracking-tight leading-[1.18] drop-shadow-lg">
            Hôm nay bạn muốn tạo<br />
            <span className="font-serif italic font-normal text-rose-200 tracking-normal drop-shadow">món quà</span> gì?
          </h1>

          {/* Mô tả giữ nguyên nội dung */}
          <p className="mt-5 text-base sm:text-lg text-white/90 max-w-xl font-normal leading-relaxed drop-shadow-sm">
            Hỏi trợ lý AI để nhận ý tưởng, danh sách nguyên liệu, chi phí và video hướng dẫn — chỉ trong vài giây.
          </p>

          {/* Các nút hành động CTA */}
          <div className="mt-8 flex flex-wrap gap-4 items-center justify-center">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-200 via-[#ffd0d7] to-rose-300 hover:from-rose-100 hover:to-rose-200 text-rose-950 font-bold text-sm sm:text-base shadow-xl shadow-rose-300/35 hover:scale-105 active:scale-95 transition-all border border-white/50"
            >
              <MessageCircle className="h-5 w-5 text-rose-900" /> Trò chuyện với AI
            </Link>
            <a
              href="#explore-section"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-white font-medium text-sm sm:text-base bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 hover:border-white/40 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Mở Studio 3D <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* Thanh điều hướng chấm tròn (Slider Dots Indicator) */}
          <div className="flex items-center justify-center gap-2.5 pt-10 sm:pt-12">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveSlide(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  activeSlide === idx
                    ? "w-7 h-2 bg-gradient-to-r from-rose-200 to-rose-300 shadow-md shadow-rose-300/60"
                    : "w-2 h-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>



        {/* Nút cuộn xuống khám phá */}
        <button
          type="button"
          onClick={() => {
            document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors animate-bounce cursor-pointer flex flex-col items-center gap-0.5 z-20"
          aria-label="Cuộn xuống khám phá"
        >
          <ChevronDown className="h-5 w-5" />
        </button>

        {/* Lớp phủ gradient mượt mà khi cuộn trang (ẩn ở top, hiện dần khi scroll) */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-40 sm:h-56 bg-gradient-to-b from-transparent to-background pointer-events-none transition-opacity duration-300 ease-out z-10"
          style={{ opacity: scrollOpacity }}
          aria-hidden="true"
        />
      </section>

      {/* 2. Main Content below Hero (Studio 3D Section) */}
      <section id="explore-section" className="relative z-20 bg-background pt-16 sm:pt-24 pb-16 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Màn hình Gen AI 3D (Studio 3D) ở chân trang */}
          <Studio3DSection
            className="pb-6"
            rightColumnHeader={
              <div className="text-left animate-fade-up max-w-2xl">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#c92a4e] tracking-wide mb-4">
                  Khám phá Studio 3D
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground font-medium">
                  Trải nghiệm sức mạnh của AI tạo model 3D: Biến mọi ý tưởng thành mô hình 3D sống động để in lên thiệp chúc mừng, cá nhân hoá từng khoảnh khắc dành riêng cho người thương của bạn.
                </p>
              </div>
            }
          />
        </div>
      </section>

      {/* 3. Template Products Section */}
      <TemplateProductsSection />

      {/* Nút tai nghe nhạc nổi góc dưới bên phải - Global FAB */}
      <button
        type="button"
        onClick={() => toast.success("🎶 Đang phát giai điệu quà tặng lãng mạn...")}
        className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-[999] h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-tr from-rose-200 via-rose-300 to-pink-300 text-rose-950 shadow-xl shadow-rose-300/40 grid place-items-center hover:scale-110 active:scale-95 transition-all group cursor-pointer border border-white/40"
        title="Bật giai điệu lãng mạn"
      >
        <Headphones className="h-5 w-5 sm:h-6 sm:w-6 group-hover:rotate-12 transition-transform" />
      </button>
    </AppShell>
  );
}
