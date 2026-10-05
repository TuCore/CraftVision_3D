"use client";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Sparkles, MessageCircle, ChevronDown, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Studio3DSection } from "@/components/studio/Studio3DSection";
import { TemplateProductsSection } from "@/components/home/TemplateProductsSection";
import { useTranslation } from "@/components/LanguageProvider";
import { toast } from "sonner";

export default function HomePage() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [firstName, setFirstName] = useState("bạn");
  const [isGuest, setIsGuest] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [scrollOpacity, setScrollOpacity] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsGuest(!token);
    const storedName = localStorage.getItem("fullName");
    if (storedName && token) {
      setFirstName(storedName.split(' ').pop() || "bạn");
    } else {
      setFirstName("bạn");
    }
  }, []);

  // Background carousel slides
  const slides = [
    { 
      id: 0, 
      image: "/dreamy-hero-bg.jpg", 
      title: t("home.slide1.title"),
      highlight: t("home.slide1.highlight"),
      suffix: t("home.slide1.suffix"),
      desc: t("home.slide1.desc"),
      btn1Text: t("home.slide1.btn1"),
      btn1Link: "/chat",
      btn1Icon: MessageCircle,
    },
    { 
      id: 1, 
      image: "/anh2.png", 
      title: t("home.slide2.title"),
      highlight: t("home.slide2.highlight"),
      suffix: t("home.slide2.suffix"),
      desc: t("home.slide2.desc"),
      btn1Text: t("home.slide2.btn1"),
      btn1Link: "#template-products",
      btn1Icon: Sparkles,
    },
    { 
      id: 2, 
      image: "/anh3.jpg", 
      title: t("home.slide3.title"),
      highlight: t("home.slide3.highlight"),
      suffix: t("home.slide3.suffix"),
      desc: t("home.slide3.desc"),
      btn1Text: t("home.slide3.btn1"),
      btn1Link: "/shop",
      btn1Icon: Sparkles,
    },
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
        <div className="relative z-10 max-w-4xl lg:max-w-5xl mx-auto flex flex-col items-center w-full">
          {/* Tagline / Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-sm animate-fade-down">
            <Sparkles className="h-3.5 w-3.5 text-amber-200" />
            <span className="text-amber-100 text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase">
              {t("home.hello")} {firstName === "bạn" ? t("home.friend") : firstName}, {t("home.ready_to_create")}
            </span>
          </div>

          {/* Nội dung thay đổi theo Slide */}
          <div key={`content-${activeSlide}`} className="flex flex-col items-center animate-fade-up w-full px-2">
            {/* Tiêu đề chính */}
            <h1 className="mt-6 text-3xl sm:text-5xl md:text-6xl lg:text-[4.25rem] xl:text-7xl font-extrabold font-display text-white tracking-tight leading-[1.18] drop-shadow-lg text-center">
              <span className="block">{slides[activeSlide].title}</span>
              <span className="inline-block sm:whitespace-nowrap">
                <span className="italic font-normal text-rose-200 tracking-normal drop-shadow">{slides[activeSlide].highlight}</span>
                {slides[activeSlide].suffix}
              </span>
            </h1>

            {/* Mô tả */}
            <p className="mt-5 text-base sm:text-lg text-white/90 max-w-2xl font-normal leading-relaxed drop-shadow-sm text-center">
              {slides[activeSlide].desc}
            </p>

            {/* Các nút hành động CTA */}
            <div className="mt-8 flex flex-wrap gap-4 items-center justify-center">
              <button
                type="button"
                onClick={() => {
                  const link = slides[activeSlide].btn1Link;
                  if (link.startsWith("#")) {
                    document.querySelector(link)?.scrollIntoView({ behavior: "smooth" });
                    return;
                  }
                  if (isGuest && (link === "/chat" || link.startsWith("/chat"))) {
                    toast.info("Vui lòng đăng nhập hoặc đăng ký để sử dụng Trợ lý AI!");
                    router.push("/auth?redirect=/chat");
                    return;
                  }
                  router.push(link);
                }}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-200 via-[#ffd0d7] to-rose-300 hover:from-rose-100 hover:to-rose-200 text-rose-950 font-bold text-sm sm:text-base shadow-xl shadow-rose-300/35 hover:scale-105 active:scale-95 transition-all border border-white/50 cursor-pointer"
              >
                {(() => {
                  const Icon = slides[activeSlide].btn1Icon;
                  return <Icon className="h-5 w-5 text-rose-900" />;
                })()}
                {slides[activeSlide].btn1Text}
              </button>
              <Link
                href="#template-products"
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById("template-products")?.scrollIntoView({
                    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
                    block: "start",
                  });
                }}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full border border-white/50 bg-white/10 backdrop-blur-md text-white font-bold text-sm sm:text-base hover:bg-white/20 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                <Heart className="h-5 w-5 text-rose-200" aria-hidden="true" />
                {t("home.view_love_gift")}
              </Link>
            </div>
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




        {/* Lớp phủ gradient mượt mà khi cuộn trang (ẩn ở top, hiện dần khi scroll) */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-40 sm:h-56 bg-gradient-to-b from-transparent to-background pointer-events-none transition-opacity duration-300 ease-out z-10"
          style={{ opacity: scrollOpacity }}
          aria-hidden="true"
        />
      </section>


      {/* 3. Template Products Section */}
      <TemplateProductsSection />
    </AppShell>
  );
}
