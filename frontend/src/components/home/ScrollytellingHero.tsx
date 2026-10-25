"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  MessageCircle,
  Heart,
  Store,
  Box,
  Volume2,
  VolumeX,
  ChevronDown,
  Gift,
  Eye,
  Play,
  MousePointerClick,
} from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";
import { getAccessToken, getAuthItem } from "@/lib/authSession";
import { toast } from "sonner";

const VIDEO_SRC = "/videos/gemini_generated_video_b9964f43.mp4";
const VIDEO_DURATION_FALLBACK = 8.0;

interface Chapter {
  id: string;
  index: string;
  start: number;
  end: number;
  targetScroll: number;
  badgeVi: string;
  badgeEn: string;
  titlePrefixVi: string;
  titleHighlightVi: string;
  titleSuffixVi: string;
  titlePrefixEn: string;
  titleHighlightEn: string;
  titleSuffixEn: string;
  descVi: string;
  descEn: string;
  pillsVi: string[];
  pillsEn: string[];
  align: "center-bottom" | "left" | "right" | "bottom-wide";
}

const CHAPTERS: Chapter[] = [
  {
    id: "gift-box",
    index: "01",
    start: 0,
    end: 0.23,
    targetScroll: 0.05,
    badgeVi: "HỘP QUÀ KỲ DIỆU",
    badgeEn: "THE MAGIC GIFT BOX",
    titlePrefixVi: "Hôm nay bạn muốn tạo ",
    titleHighlightVi: "món quà",
    titleSuffixVi: " gì?",
    titlePrefixEn: "What ",
    titleHighlightEn: "special gift",
    titleSuffixEn: " will you create today?",
    descVi:
      "Cuộn nhẹ xuống để mở dải ruy-băng vàng và khám phá thế giới quà tặng AI, Studio 3D, Thiệp 3D tương tác cùng đồ thủ công tinh xảo bên trong hộp quà.",
    descEn:
      "Scroll gently to untie the golden ribbon and unlock our world of AI gift ideas, 3D Studio, interactive 3D cards, and handcrafted treasures.",
    pillsVi: ["Mở hộp quà 3D", "Trợ lý AI Vision Plus", "54+ Thiệp 3D", "Quà Handmade"],
    pillsEn: ["Unbox 3D Magic", "Vision Plus AI", "54+ 3D Cards", "Handmade Gifts"],
    align: "center-bottom",
  },
  {
    id: "ai-chatbot",
    index: "02",
    start: 0.23,
    end: 0.52,
    targetScroll: 0.36,
    badgeVi: "TRỢ LÝ AI VISION PLUS & STUDIO 3D",
    badgeEn: "VISION PLUS AI & 3D STUDIO",
    titlePrefixVi: "Từ ý tưởng đến ",
    titleHighlightVi: "mô hình 3D",
    titleSuffixVi: " trong vài giây",
    titlePrefixEn: "From spark to ",
    titleHighlightEn: "3D model",
    titleSuffixEn: " in seconds",
    descVi:
      "Trò chuyện cùng AI Vision Plus để phân tích ảnh mẫu, nhận danh sách nguyên liệu, dự toán chi phí DIY và dựng mô hình quà tặng 3D trực quan.",
    descEn:
      "Chat with Vision Plus AI to analyze reference photos, get DIY material checklists, estimate budgets, and generate interactive 3D gift models.",
    pillsVi: ["Phân tích hình ảnh", "Gợi ý nguyên liệu & chi phí", "Tạo mô hình Studio 3D"],
    pillsEn: ["Image Analysis", "DIY Materials & Budget", "3D Studio Generator"],
    align: "left",
  },
  {
    id: "cards-3d",
    index: "03",
    start: 0.52,
    end: 0.78,
    targetScroll: 0.65,
    badgeVi: "BỘ SƯU TẬP 54+ THIỆP 3D & NFC",
    badgeEn: "54+ INTERACTIVE 3D CARDS & NFC",
    titlePrefixVi: "Chạm mở phong thư, ",
    titleHighlightVi: "gửi ngàn điều ước",
    titleSuffixVi: "",
    titlePrefixEn: "Unseal the envelope, ",
    titleHighlightEn: "send a thousand wishes",
    titleSuffixEn: "",
    descVi:
      "Khám phá sân khấu bánh sinh nhật 3D thắp nến hạt sáng, khóa trái tim pha lê, mưa chữ tình yêu neon và thẻ quà tặng thông minh NFC cá nhân hóa.",
    descEn:
      "Discover interactive 3D birthday cake stages with particle flames, crystal heart locks, neon love rain, and personalized smart NFC gift cards.",
    pillsVi: ["Bánh sinh nhật 3D tương tác", "Khóa trái tim & Mưa chữ Neon", "Thẻ NFC chạm mở thiệp"],
    pillsEn: ["Interactive 3D Cake", "Heart Lock & Neon Rain", "Tap-to-Open NFC Card"],
    align: "right",
  },
  {
    id: "handmade-shop",
    index: "04",
    start: 0.78,
    end: 1.01,
    targetScroll: 0.92,
    badgeVi: "CỬA HÀNG QUÀ TẶNG HANDMADE",
    badgeEn: "ARTISANAL HANDMADE SHOP",
    titlePrefixVi: "Quà tặng ",
    titleHighlightVi: "handmade",
    titleSuffixVi: " tinh tế & độc bản",
    titlePrefixEn: "Exquisite ",
    titleHighlightEn: "handmade",
    titleSuffixEn: " treasures",
    descVi:
      "Gấu bông len móc thủ công, hộp nhạc gỗ, quả cầu tuyết pha lê, bó hoa hồng đom đóm và móc khóa pixel được chế tác tỉ mỉ cho người thương.",
    descEn:
      "Hand-knitted crochet bears, wooden music boxes, crystal snow globes, fairy-light rose bouquets, and pixel keychains crafted with love.",
    pillsVi: ["Gấu bông len móc", "Hộp nhạc gỗ & Quả cầu tuyết", "Bó hoa hồng đèn đom đóm"],
    pillsEn: ["Crochet Teddy Bears", "Music Box & Snow Globe", "Fairy-Light Rose Bouquet"],
    align: "bottom-wide",
  },
];

export function ScrollytellingHero() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const isVi = language === "vi";

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioVideoRef = useRef<HTMLVideoElement>(null);

  const [firstName, setFirstName] = useState("bạn");
  const [isGuest, setIsGuest] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeChapterIdx, setActiveChapterIdx] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // Refs for smooth 60fps scrubbing without triggering React re-renders on every sub-frame
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const durationRef = useRef(VIDEO_DURATION_FALLBACK);
  const isSeekingRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const lastStateUpdateRef = useRef(0);

  useEffect(() => {
    const token = getAccessToken();
    setIsGuest(!token);
    const storedName = getAuthItem("fullName");
    if (storedName && token) {
      setFirstName(storedName.split(" ").pop() || "bạn");
    } else {
      setFirstName("bạn");
    }
  }, []);

  // Calculate normalized scroll progress (0 -> 1) within the 420vh container
  const updateTargetFromScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const scrollableDistance = container.offsetHeight - window.innerHeight;
    if (scrollableDistance <= 0) return;

    const scrolled = -rect.top;
    const clamped = Math.max(0, Math.min(1, scrolled / scrollableDistance));
    targetProgressRef.current = clamped;
  }, []);

  // Main scroll + animation frame loop with strict cleanup on unmount
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      if (video.duration && Number.isFinite(video.duration)) {
        durationRef.current = video.duration;
      }
      video.currentTime = 0.01;
    };

    const handleSeeked = () => {
      isSeekingRef.current = false;
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("seeked", handleSeeked);
    if (video.readyState >= 1 && video.duration && Number.isFinite(video.duration)) {
      durationRef.current = video.duration;
    }

    const onScroll = () => {
      if (isAutoPlaying) {
        setIsAutoPlaying(false);
      }
      updateTargetFromScroll();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateTargetFromScroll, { passive: true });
    updateTargetFromScroll();

    const tick = (now: number) => {
      const target = targetProgressRef.current;
      const current = currentProgressRef.current;
      const diff = target - current;

      // Smooth interpolation (lerp) for silky scrubbing
      if (Math.abs(diff) > 0.0005) {
        currentProgressRef.current = current + diff * 0.18;
      } else {
        currentProgressRef.current = target;
      }

      const progress = currentProgressRef.current;
      const duration = durationRef.current || VIDEO_DURATION_FALLBACK;
      const desiredTime = Math.max(0.01, Math.min(duration - 0.04, progress * duration));

      // Seek underlying video when ready and not currently mid-seek
      if (
        video &&
        video.readyState >= 1 &&
        !video.seeking &&
        Math.abs(video.currentTime - desiredTime) > 0.02
      ) {
        try {
          video.currentTime = desiredTime;
        } catch {
          // ignore
        }
      }

      // Throttle React UI state updates to ~30fps for crisp progress bar & chapter transitions
      if (now - lastStateUpdateRef.current > 32) {
        lastStateUpdateRef.current = now;
        setScrollProgress((prev) => (Math.abs(prev - progress) > 0.002 ? progress : prev));

        const matchedIdx = CHAPTERS.findIndex(
          (ch) => progress >= ch.start && progress < ch.end
        );
        if (matchedIdx !== -1) {
          setActiveChapterIdx((prev) => (prev !== matchedIdx ? matchedIdx : prev));
        }
      }

      rafIdRef.current = window.requestAnimationFrame(tick);
    };

    rafIdRef.current = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateTargetFromScroll);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("seeked", handleSeeked);
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
      }
      if (audioVideoRef.current) {
        audioVideoRef.current.pause();
      }
    };
  }, [isAutoPlaying, updateTargetFromScroll]);

  // Smoothly scroll the window to a specific normalized progress (0 -> 1)
  const scrollToProgress = (normProgress: number) => {
    const container = containerRef.current;
    if (!container) return;
    const containerTop = container.getBoundingClientRect().top + window.scrollY;
    const scrollableDistance = container.offsetHeight - window.innerHeight;
    const targetY = containerTop + scrollableDistance * normProgress;
    window.scrollTo({
      top: targetY,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };

  // Toggle background music from the video soundtrack
  const toggleSound = () => {
    const audioEl = audioVideoRef.current;
    if (!audioEl) return;
    if (isMuted) {
      audioEl.muted = false;
      audioEl.volume = 0.55;
      audioEl.play().catch(() => {});
      setIsMuted(false);
    } else {
      audioEl.muted = true;
      audioEl.pause();
      setIsMuted(true);
    }
  };

  // Navigate to AI chat with guest check
  const handleNavigateChat = (mode?: "three-d") => {
    const targetUrl = mode === "three-d" ? "/chat?mode=three-d" : "/chat";
    if (isGuest) {
      toast.info(
        isVi
          ? "Vui lòng đăng nhập hoặc đăng ký để sử dụng Trợ lý AI!"
          : "Please sign in to use the AI Assistant!"
      );
      router.push(`/auth?redirect=${encodeURIComponent(targetUrl)}`);
      return;
    }
    router.push(targetUrl);
  };

  const scrollToTemplates = () => {
    document.getElementById("template-products")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start",
    });
  };

  const activeChapter = CHAPTERS[activeChapterIdx] || CHAPTERS[0];

  return (
    <section
      ref={containerRef}
      aria-label="CraftVision 3D Scrollytelling Showcase"
      className="relative w-full h-[420vh] select-none"
    >
      {/* Hidden audio companion for optional magical music box soundtrack */}
      <video
        ref={audioVideoRef}
        src={VIDEO_SRC}
        loop
        muted
        playsInline
        preload="metadata"
        className="hidden"
        aria-hidden="true"
      />

      {/* Sticky 100dvh Viewport */}
      <div className="sticky top-0 left-0 w-full h-screen min-h-[100dvh] overflow-hidden bg-[#1a0915]">
        {/* Scrollytelling Video */}
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Subtle vignette & top/bottom depth gradients so UI text & Navbar remain crystal clear */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 45%, transparent 35%, rgba(18, 5, 14, 0.55) 100%)",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#160611]/75 via-[#160611]/30 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#14050f]/90 via-[#1b0815]/45 to-transparent pointer-events-none" />

        {/* Right-side Scrollytelling Chapter Navigator (Desktop & Tablet) */}
        <aside
          aria-label={isVi ? "Mục lục cuộn trang" : "Scroll chapters"}
          className="hidden md:flex flex-col items-end gap-3.5 absolute right-6 top-1/2 -translate-y-1/2 z-30"
        >
          {CHAPTERS.map((ch, idx) => {
            const isActive = idx === activeChapterIdx;
            const isPassed = scrollProgress >= ch.end;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => scrollToProgress(ch.targetScroll)}
                className={`group flex items-center gap-3 px-3 py-1.5 rounded-full transition-all duration-300 cursor-pointer backdrop-blur-md border ${
                  isActive
                    ? "bg-[#2b1023]/85 border-rose-300/60 shadow-lg shadow-rose-500/20 scale-105"
                    : "bg-black/35 border-white/15 hover:bg-black/55 hover:border-white/35"
                }`}
              >
                <span
                  className={`text-xs font-semibold tracking-wider transition-colors ${
                    isActive
                      ? "text-rose-200"
                      : "text-white/60 group-hover:text-white/90"
                  }`}
                >
                  {ch.index} ·{" "}
                  {idx === 0
                    ? isVi
                      ? "Hộp Quà"
                      : "Gift Box"
                    : idx === 1
                    ? "Vision Plus AI"
                    : idx === 2
                    ? isVi
                      ? "Thiệp 3D"
                      : "3D Cards"
                    : "Handmade"}
                </span>
                <span
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    isActive
                      ? "w-6 bg-gradient-to-r from-amber-200 to-rose-300 shadow-sm shadow-rose-300"
                      : isPassed
                      ? "w-2.5 bg-rose-300/60"
                      : "w-2.5 bg-white/30"
                  }`}
                />
              </button>
            );
          })}
        </aside>

        {/* Top-left / Bottom-left Sound & Progress Controls */}
        <div className="absolute bottom-6 left-4 sm:left-8 z-30 flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSound}
            aria-label={isMuted ? "Bật nhạc nền" : "Tắt nhạc nền"}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#240b1c]/80 hover:bg-[#351129]/90 text-white/90 text-xs font-medium border border-white/20 backdrop-blur-md shadow-lg transition-all cursor-pointer"
          >
            {isMuted ? (
              <>
                <VolumeX className="h-4 w-4 text-rose-200" />
                <span className="hidden sm:inline">
                  {isVi ? "Bật giai điệu hộp nhạc" : "Enable Music Box"}
                </span>
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 text-amber-300 animate-pulse" />
                <span className="hidden sm:inline text-amber-100">
                  {isVi ? "Đang phát nhạc nền" : "Playing Music"}
                </span>
              </>
            )}
          </button>

          {/* Compact Scroll Percentage Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/45 border border-white/15 backdrop-blur-md text-xs text-white/80 font-mono">
            <span className="w-2 h-2 rounded-full bg-rose-300 animate-ping" />
            <span>{Math.round(scrollProgress * 100)}%</span>
          </div>
        </div>

        {/* Dynamic Story Stage Overlay */}
        <div className="relative z-20 w-full h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 sm:pb-20 pointer-events-none">
          {/* STAGE 0: HERO GIFT BOX (0% - 23%) */}
          {activeChapterIdx === 0 && (
            <div
              key="stage-0"
              className="w-full flex flex-col items-center text-center animate-fade-up pointer-events-auto"
            >
              {/* Greeting Eyebrow */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2b1023]/75 backdrop-blur-md border border-amber-200/35 shadow-lg">
                <Sparkles className="h-3.5 w-3.5 text-amber-200" />
                <span className="text-amber-100 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase">
                  {t("home.hello")}{" "}
                  {firstName === "bạn" ? t("home.friend") : firstName},{" "}
                  {t("home.ready_to_create")}
                </span>
              </div>

              <h1 className="mt-4 text-3xl sm:text-5xl lg:text-6xl font-extrabold font-display text-white tracking-tight leading-[1.15] drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
                <span>
                  {isVi
                    ? activeChapter.titlePrefixVi
                    : activeChapter.titlePrefixEn}
                </span>
                <span className="italic font-normal text-rose-200">
                  {isVi
                    ? activeChapter.titleHighlightVi
                    : activeChapter.titleHighlightEn}
                </span>
                <span>
                  {isVi
                    ? activeChapter.titleSuffixVi
                    : activeChapter.titleSuffixEn}
                </span>
              </h1>

              <p className="mt-3 text-sm sm:text-base text-white/90 max-w-2xl leading-relaxed drop-shadow">
                {isVi ? activeChapter.descVi : activeChapter.descEn}
              </p>

              {/* CTA Buttons */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3.5">
                <button
                  type="button"
                  onClick={() => scrollToProgress(0.36)}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-amber-200 via-[#ffd0d7] to-rose-300 hover:from-amber-100 hover:to-rose-200 text-[#240a1b] font-bold text-sm sm:text-base shadow-xl shadow-rose-400/30 hover:scale-105 active:scale-95 transition-all border border-white/60 cursor-pointer"
                >
                  <Gift className="h-5 w-5 text-[#240a1b]" />
                  {isVi ? "Mở hộp quà khám phá" : "Unbox & Explore"}
                </button>

                <button
                  type="button"
                  onClick={() => handleNavigateChat()}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#2b1023]/75 hover:bg-[#3d1630]/90 text-white font-semibold text-sm sm:text-base border border-white/35 backdrop-blur-md transition-all cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4 text-rose-200" />
                  {t("home.slide1.btn1")}
                </button>

                <button
                  type="button"
                  onClick={scrollToTemplates}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base border border-white/30 backdrop-blur-md transition-all cursor-pointer"
                >
                  <Heart className="h-4 w-4 text-rose-200" />
                  {t("home.view_love_gift")}
                </button>
              </div>

              {/* Scroll Down Hint */}
              <button
                type="button"
                onClick={() => scrollToProgress(0.36)}
                className="mt-5 inline-flex items-center gap-1.5 text-xs text-amber-100/85 hover:text-white tracking-wider uppercase cursor-pointer"
              >
                <span>
                  {isVi
                    ? "Cuộn chuột để mở nắp hộp quà"
                    : "Scroll down to open the gift box"}
                </span>
                <ChevronDown className="h-4 w-4 animate-bounce" />
              </button>
            </div>
          )}

          {/* STAGE 1: AI CHATBOT VISION PLUS & STUDIO 3D (23% - 52%) */}
          {activeChapterIdx === 1 && (
            <div
              key="stage-1"
              className="w-full max-w-xl mr-auto animate-fade-up pointer-events-auto rounded-3xl bg-[#210b1b]/80 border border-rose-200/25 backdrop-blur-xl p-6 sm:p-7 shadow-2xl shadow-black/60"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-300/15 border border-rose-200/30 text-amber-200 text-xs font-bold tracking-wider uppercase">
                <MessageCircle className="h-3.5 w-3.5" />
                <span>
                  {isVi ? activeChapter.badgeVi : activeChapter.badgeEn}
                </span>
              </div>

              <h2 className="mt-3 text-2xl sm:text-4xl font-extrabold font-display text-white leading-tight">
                <span>
                  {isVi
                    ? activeChapter.titlePrefixVi
                    : activeChapter.titlePrefixEn}
                </span>
                <span className="italic font-normal text-rose-200">
                  {isVi
                    ? activeChapter.titleHighlightVi
                    : activeChapter.titleHighlightEn}
                </span>
                <span>
                  {isVi
                    ? activeChapter.titleSuffixVi
                    : activeChapter.titleSuffixEn}
                </span>
              </h2>

              <p className="mt-2.5 text-sm sm:text-base text-white/85 leading-relaxed">
                {isVi ? activeChapter.descVi : activeChapter.descEn}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {(isVi ? activeChapter.pillsVi : activeChapter.pillsEn).map(
                  (pill) => (
                    <span
                      key={pill}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-rose-100 border border-white/15"
                    >
                      ✨ {pill}
                    </span>
                  )
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleNavigateChat()}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-rose-200 via-[#ffd0d7] to-rose-300 hover:from-rose-100 hover:to-rose-200 text-[#240a1b] font-bold text-sm shadow-lg shadow-rose-300/25 hover:scale-105 transition-all cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4 text-[#240a1b]" />
                  {isVi ? "Mở Chatbot Vision Plus" : "Open Vision Plus AI"}
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigateChat("three-d")}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/25 transition-all cursor-pointer"
                >
                  <Box className="h-4 w-4 text-amber-200" />
                  {isVi ? "Trải nghiệm Studio 3D" : "Try 3D Studio"}
                </button>
              </div>
            </div>
          )}

          {/* STAGE 2: 54+ INTERACTIVE 3D CARDS & NFC (52% - 78%) */}
          {activeChapterIdx === 2 && (
            <div
              key="stage-2"
              className="w-full max-w-xl ml-auto md:mr-28 animate-fade-up pointer-events-auto rounded-3xl bg-[#210b1b]/80 border border-rose-200/25 backdrop-blur-xl p-6 sm:p-7 shadow-2xl shadow-black/60"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-300/15 border border-rose-200/30 text-amber-200 text-xs font-bold tracking-wider uppercase">
                <Heart className="h-3.5 w-3.5 text-rose-300" />
                <span>
                  {isVi ? activeChapter.badgeVi : activeChapter.badgeEn}
                </span>
              </div>

              <h2 className="mt-3 text-2xl sm:text-4xl font-extrabold font-display text-white leading-tight">
                <span>
                  {isVi
                    ? activeChapter.titlePrefixVi
                    : activeChapter.titlePrefixEn}
                </span>
                <span className="italic font-normal text-rose-200">
                  {isVi
                    ? activeChapter.titleHighlightVi
                    : activeChapter.titleHighlightEn}
                </span>
              </h2>

              <p className="mt-2.5 text-sm sm:text-base text-white/85 leading-relaxed">
                {isVi ? activeChapter.descVi : activeChapter.descEn}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {(isVi ? activeChapter.pillsVi : activeChapter.pillsEn).map(
                  (pill) => (
                    <span
                      key={pill}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-rose-100 border border-white/15"
                    >
                      💌 {pill}
                    </span>
                  )
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={scrollToTemplates}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-rose-200 via-[#ffd0d7] to-rose-300 hover:from-rose-100 hover:to-rose-200 text-[#240a1b] font-bold text-sm shadow-lg shadow-rose-300/25 hover:scale-105 transition-all cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-[#240a1b]" />
                  {isVi ? "Cá nhân hóa Thiệp 3D" : "Personalize 3D Cards"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/greeting-card")}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/25 transition-all cursor-pointer"
                >
                  <Eye className="h-4 w-4 text-rose-200" />
                  {isVi ? "Mở thử Bánh Sinh Nhật 3D" : "Demo 3D Birthday Cake"}
                </button>
              </div>
            </div>
          )}

          {/* STAGE 3: HANDMADE GIFTS & FINALE (78% - 100%) */}
          {activeChapterIdx === 3 && (
            <div
              key="stage-3"
              className="w-full max-w-3xl mx-auto animate-fade-up pointer-events-auto rounded-3xl bg-[#210b1b]/82 border border-amber-200/30 backdrop-blur-xl p-6 sm:p-7 text-center shadow-2xl shadow-black/65"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-300/15 border border-amber-200/35 text-amber-200 text-xs font-bold tracking-wider uppercase">
                <Store className="h-3.5 w-3.5" />
                <span>
                  {isVi ? activeChapter.badgeVi : activeChapter.badgeEn}
                </span>
              </div>

              <h2 className="mt-3 text-2xl sm:text-4xl font-extrabold font-display text-white leading-tight">
                <span>
                  {isVi
                    ? activeChapter.titlePrefixVi
                    : activeChapter.titlePrefixEn}
                </span>
                <span className="italic font-normal text-rose-200">
                  {isVi
                    ? activeChapter.titleHighlightVi
                    : activeChapter.titleHighlightEn}
                </span>
                <span>
                  {isVi
                    ? activeChapter.titleSuffixVi
                    : activeChapter.titleSuffixEn}
                </span>
              </h2>

              <p className="mt-2.5 text-sm sm:text-base text-white/85 max-w-2xl mx-auto leading-relaxed">
                {isVi ? activeChapter.descVi : activeChapter.descEn}
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {(isVi ? activeChapter.pillsVi : activeChapter.pillsEn).map(
                  (pill) => (
                    <span
                      key={pill}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-amber-100 border border-white/15"
                    >
                      🎁 {pill}
                    </span>
                  )
                )}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-3.5">
                <button
                  type="button"
                  onClick={() => router.push("/shop")}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-amber-200 via-[#ffd0d7] to-rose-300 hover:from-amber-100 hover:to-rose-200 text-[#240a1b] font-bold text-sm sm:text-base shadow-xl shadow-rose-300/30 hover:scale-105 transition-all cursor-pointer"
                >
                  <Store className="h-4 w-4 text-[#240a1b]" />
                  {isVi ? "Ghé thăm Cửa hàng Handmade" : "Visit Handmade Shop"}
                </button>
                <button
                  type="button"
                  onClick={scrollToTemplates}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-semibold text-sm sm:text-base border border-white/30 transition-all cursor-pointer"
                >
                  <MousePointerClick className="h-4 w-4 text-rose-200" />
                  {isVi ? "Xem 54+ mẫu Thiệp 3D bên dưới ↓" : "Browse 54+ 3D Cards below ↓"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Horizontal Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10 z-30">
          <div
            className="h-full bg-gradient-to-r from-amber-300 via-rose-300 to-pink-400 transition-all duration-75"
            style={{ width: `${Math.min(100, Math.max(0, scrollProgress * 100))}%` }}
          />
        </div>
      </div>
    </section>
  );
}
