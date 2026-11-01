"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Share2,
  Move3d,
  Heart,
  BookOpen,
  Award,
  ChevronRight,
  Send,
  Feather,
  Flower2,
  Compass,
} from "lucide-react";
import { webAudioSynth } from "./WebAudioSynth";
import { SHOWCASE_MODELS, type ShowcaseModelKey } from "./Showcase3DScene";
import "./showcase.css";

const Showcase3DScene = dynamic(() => import("./Showcase3DScene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center text-amber-200/80 font-serif text-sm">
      Đang tải không gian 3D CraftVision...
    </div>
  ),
});

export type ShowcaseStage =
  | "opening"
  | "intro"
  | "voice"
  | "milestones"
  | "letter"
  | "hug"
  | "wish"
  | "jar"
  | "finale";

const SKY_MAPPING: Record<ShowcaseStage, string> = {
  opening: "maroon",
  intro: "candle",
  voice: "room",
  milestones: "party",
  letter: "golden",
  hug: "lightsoff",
  wish: "lamplight",
  jar: "night",
  finale: "hush",
};

export default function ShowcaseExperience() {
  const [stage, setStage] = useState<ShowcaseStage>("opening");
  const [muted, setMuted] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  // Hold-to-extinguish state
  const [holding, setHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [candleExtinguished, setCandleExtinguished] = useState(false);
  const holdStartTime = useRef(0);
  const holdAnimFrame = useRef<number | null>(null);

  // Model switching in 3D
  const [selectedModelKey, setSelectedModelKey] = useState<ShowcaseModelKey>("flower_vase");
  const [freeOrbit, setFreeOrbit] = useState(false);

  // Cassette state
  const [tapePlaying, setTapePlaying] = useState(true);

  // Typewriter state
  const letterFullText = useMemo(
    () =>
      `Kính gửi Quý Thầy Cô giảng viên và các bạn sinh viên đồng hành,\n\nLời đầu tiên, nhóm tác giả đồ án CraftVision 3D xin gửi lời tri ân chân thành và sâu sắc nhất đến Quý Thầy Cô đã tận tình định hướng, dìu dắt và truyền cảm hứng cho chúng em trong suốt quá trình nghiên cứu và phát triển sản phẩm.\n\nNhờ những nhận xét và góp ý quý báu, đề tài CraftVision 3D không chỉ dừng lại ở những thuật toán và kiến trúc kỹ thuật vi dịch vụ phức tạp, mà đã trở thành một hệ sinh thái quà tặng thủ công nghệ thuật số hóa giàu cảm xúc, kết nối trái tim và lưu giữ những khoảnh khắc đáng nhớ.\n\nChúng em xin kính chúc Quý Thầy Cô luôn dồi dào sức khỏe, hạnh phúc và gặt hái thêm nhiều thành tựu rực rỡ trong sự nghiệp trồng người cao quý! Chúc tất cả các nhóm bạn bè bảo vệ đồ án thành công rực rỡ!`,
    []
  );
  const [typedChars, setTypedChars] = useState(0);

  // Heartbeat hold state
  const [heartHolding, setHeartHolding] = useState(false);
  const [heartHeldTime, setHeartHeldTime] = useState(0);
  const heartTimer = useRef<NodeJS.Timeout | null>(null);

  // Wish state
  const defaultWishes = useMemo(
    () => [
      "Kính chúc Thầy Cô luôn mạnh khỏe, hạnh phúc và thành công!",
      "Chúc đồ án CraftVision 3D bảo vệ đạt kết quả xuất sắc!",
      "Chúc tất cả các bạn sinh viên ra trường thuận buồm xuôi gió!",
      "Chúc cho mọi nỗ lực và đam mê sáng tạo đều nở hoa rực rỡ!",
    ],
    []
  );
  const [customWish, setCustomWish] = useState(defaultWishes[0]);
  const [isFolding, setIsFolding] = useState(false);
  const [foldedStar, setFoldedStar] = useState(false);

  // Audio elements
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  // Start background music on first interaction
  const triggerAudioStart = useCallback(() => {
    if (bgmRef.current && !isPlayingMusic && !muted) {
      bgmRef.current.volume = 0.55;
      bgmRef.current
        .play()
        .then(() => setIsPlayingMusic(true))
        .catch(() => {});
    }
  }, [isPlayingMusic, muted]);

  const toggleSound = () => {
    if (!bgmRef.current) return;
    if (muted) {
      bgmRef.current.muted = false;
      bgmRef.current.play().catch(() => {});
      setMuted(false);
    } else {
      bgmRef.current.muted = true;
      setMuted(true);
    }
  };

  // Stage transitions
  const goToStage = useCallback((next: ShowcaseStage) => {
    setStage(next);
    triggerAudioStart();
    if (next === "letter") {
      setTypedChars(0);
    }
    if (next === "milestones" || next === "finale") {
      setSelectedModelKey("flower_vase");
    }
    if (next === "hug") {
      setSelectedModelKey("heart");
    }
  }, [triggerAudioStart]);

  // Hold-to-extinguish candle logic
  const startHold = () => {
    if (stage !== "intro" || candleExtinguished) return;
    triggerAudioStart();
    setHolding(true);
    holdStartTime.current = performance.now() - holdProgress * 2600;

    const tick = (now: number) => {
      const elapsed = now - holdStartTime.current;
      const progress = Math.min(1, elapsed / 2600);
      setHoldProgress(progress);

      if (progress >= 1) {
        setHolding(false);
        setCandleExtinguished(true);
        webAudioSynth.playExtinguish();
        // Transition to next stage after smoke
        setTimeout(() => {
          goToStage("voice");
        }, 2200);
        return;
      }
      holdAnimFrame.current = requestAnimationFrame(tick);
    };

    holdAnimFrame.current = requestAnimationFrame(tick);
  };

  const cancelHold = () => {
    if (candleExtinguished) return;
    if (holdAnimFrame.current) {
      cancelAnimationFrame(holdAnimFrame.current);
      holdAnimFrame.current = null;
    }
    setHolding(false);
    setHoldProgress(0);
  };

  // Heartbeat hold loop
  const startHeartHold = () => {
    setHeartHolding(true);
    webAudioSynth.playHeartbeat(1.2);
    const interval = setInterval(() => {
      webAudioSynth.playHeartbeat(1.1);
      setHeartHeldTime((prev) => prev + 1);
    }, 1100);
    heartTimer.current = interval as unknown as NodeJS.Timeout;
  };

  const endHeartHold = () => {
    setHeartHolding(false);
    if (heartTimer.current) {
      clearInterval(heartTimer.current);
      heartTimer.current = null;
    }
  };

  // Typewriter effect in Stage 5
  useEffect(() => {
    if (stage !== "letter") return;
    if (typedChars >= letterFullText.length) return;

    const timer = setTimeout(() => {
      setTypedChars((prev) => prev + 3);
    }, 28);
    return () => clearTimeout(timer);
  }, [stage, typedChars, letterFullText]);

  // Origami folding transition
  const handleFoldWish = () => {
    setIsFolding(true);
    webAudioSynth.playPaperCrease();
    setTimeout(() => {
      setFoldedStar(true);
      webAudioSynth.playCrystalChime(920);
      setTimeout(() => {
        goToStage("jar");
      }, 1600);
    }, 1800);
  };

  // Star entering jar sound
  useEffect(() => {
    if (stage === "jar") {
      const timer = setTimeout(() => {
        webAudioSynth.playCrystalChime(760);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  // Replay
  const handleReplay = () => {
    setStage("opening");
    setCandleExtinguished(false);
    setHoldProgress(0);
    setHolding(false);
    setFreeOrbit(false);
    setSelectedModelKey("flower_vase");
    setFoldedStar(false);
    setIsFolding(false);
    setTypedChars(0);
  };

  return (
    <div
      className="relative min-h-[100dvh] w-full overflow-hidden text-amber-50 select-none bg-black font-sans"
      onPointerDown={triggerAudioStart}
    >
      {/* Background BGM */}
      <audio ref={bgmRef} src="/showcase/bgm.mp3" loop preload="auto" />

      {/* Sky Transition Layers */}
      <div className="cv-showcase-sky" data-sky={SKY_MAPPING[stage]}>
        <span className="cv-sky-layer cv-sky-layer--maroon" />
        <span className="cv-sky-layer cv-sky-layer--candle" />
        <span className="cv-sky-layer cv-sky-layer--room" />
        <span className="cv-sky-layer cv-sky-layer--party" />
        <span className="cv-sky-layer cv-sky-layer--golden" />
        <span className="cv-sky-layer cv-sky-layer--lightsoff" />
        <span className="cv-sky-layer cv-sky-layer--lamplight" />
        <span className="cv-sky-layer cv-sky-layer--night" />
        <span className="cv-sky-layer cv-sky-layer--hush" />
      </div>

      {/* Floating Bokeh Dust */}
      <div className="fixed inset-0 pointer-events-none z-[1]">
        <span className="cv-bokeh" style={{ left: "15%", top: "25%", width: 50, height: 50, "--bokeh-delay": "0s", "--bokeh-dur": "7s" } as React.CSSProperties} />
        <span className="cv-bokeh" style={{ left: "80%", top: "35%", width: 65, height: 65, "--bokeh-delay": "1.5s", "--bokeh-dur": "8s" } as React.CSSProperties} />
        <span className="cv-bokeh" style={{ left: "30%", top: "75%", width: 45, height: 45, "--bokeh-delay": "2.8s", "--bokeh-dur": "6.5s" } as React.CSSProperties} />
        <span className="cv-bokeh" style={{ left: "70%", top: "80%", width: 55, height: 55, "--bokeh-delay": "0.8s", "--bokeh-dur": "7.5s" } as React.CSSProperties} />
      </div>

      {/* 3D WebGL Canvas Layer */}
      <Showcase3DScene
        stage={stage}
        holding={holding}
        holdProgress={holdProgress}
        candleExtinguished={candleExtinguished}
        selectedModelKey={selectedModelKey}
        freeOrbit={freeOrbit}
      />

      {/* Persistent Audio Controls & Brand Pill */}
      <header className="fixed top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-black/40 backdrop-blur-md border border-amber-200/20 text-xs sm:text-sm shadow-lg text-amber-200/90 font-medium">
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>CraftVision 3D Showcase</span>
        </div>

        <div className="flex items-center gap-2">
          {stage === "finale" && (
            <button
              onClick={() => setFreeOrbit((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all shadow-md ${
                freeOrbit
                  ? "bg-amber-400 text-stone-950 border border-amber-300 ring-2 ring-amber-300/50"
                  : "bg-black/50 text-amber-200/80 border border-amber-200/30 hover:bg-black/70"
              }`}
            >
              <Move3d className="w-3.5 h-3.5" />
              <span>{freeOrbit ? "Đang xoay tự do (3D Orbit)" : "Khóa góc nhìn"}</span>
            </button>
          )}

          <button
            onClick={toggleSound}
            aria-label="Bật/Tắt âm thanh"
            className="p-2 rounded-full bg-black/40 backdrop-blur-md border border-amber-200/20 text-amber-200/80 hover:text-amber-100 hover:bg-black/60 transition shadow-lg"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* =========================================================================
          STAGE 1: OPENING GATE
          ========================================================================= */}
      {stage === "opening" && (
        <section className="relative z-10 flex min-h-[100dvh] w-full flex-col items-center justify-center px-6 text-center">
          <div className="max-w-xl flex flex-col items-center animate-fade-in">
            <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-amber-300/80 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Đồ Án Tốt Nghiệp — CraftVision 3D
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-balance leading-snug mb-4">
              <span className="cv-handwrite">Hành Trình Tri Ân</span>
              <br />
              <span className="text-amber-100/90 text-2xl sm:text-3xl font-light font-display">
                Thầy Cô & Bạn Bè Đồng Hành
              </span>
            </h1>
            <p className="text-sm sm:text-base text-amber-100/75 max-w-md mb-8 leading-relaxed font-light">
              Trải nghiệm tương tác 3D đa giác quan, tôn vinh nghệ thuật quà tặng thủ công và công nghệ số hóa Three.js.
            </p>

            <button
              onClick={() => goToStage("intro")}
              className="cv-action-btn flex items-center gap-2.5 text-sm sm:text-base cursor-pointer"
            >
              <span>Chạm để khám phá</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* =========================================================================
          STAGE 2: INTRO (3D CANDLE RITUAL - HOLD TO EXTINGUISH)
          ========================================================================= */}
      {stage === "intro" && (
        <section className="relative z-10 flex min-h-[100dvh] w-full flex-col items-center justify-between py-20 px-6 text-center">
          <div className="max-w-md animate-fade-in mt-4">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-amber-100 mb-2">
              Ngọn Nến Thắp Sáng Ước Mơ
            </h2>
            <p className="text-xs sm:text-sm text-amber-200/70">
              Gửi gắm tâm nguyện và nhiệt huyết vào ngọn lửa tri thức
            </p>
          </div>

          {/* Touch/Hold interactive zone */}
          <div
            className="cv-hold-container flex flex-col items-center cursor-pointer my-auto"
            onPointerDown={startHold}
            onPointerUp={cancelHold}
            onPointerLeave={cancelHold}
            onPointerCancel={cancelHold}
          >
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
              {/* Circular SVG Progress Ring */}
              <svg className="cv-hold-progress-svg absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="rgba(255, 220, 150, 0.15)"
                  strokeWidth="3.5"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="#fcd385"
                  strokeWidth="4"
                  strokeDasharray={2 * Math.PI * 44}
                  strokeDashoffset={(1 - holdProgress) * (2 * Math.PI * 44)}
                  strokeLinecap="round"
                  className="cv-hold-ring"
                />
              </svg>

              <div className="text-center p-4">
                <span className="text-3xl">🕯️</span>
                <p className="mt-2 text-xs font-semibold text-amber-200/90 tracking-wide uppercase">
                  {holding ? "Đang ước nguyện..." : candleExtinguished ? "Nến đã tắt" : "Chạm & Giữ"}
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs sm:text-sm text-amber-200/60 max-w-xs">
              {candleExtinguished
                ? "Điều ước đã được gửi vào vũ trụ..."
                : holding
                ? "Giữ ngón tay cho đến khi vòng sáng hoàn tất..."
                : "Chạm và giữ vào ngọn nến để thổi tắt và khởi đầu lời chúc"}
            </p>
          </div>

          <div className="h-10" />
        </section>
      )}

      {/* =========================================================================
          STAGE 3: VINTAGE CASSETTE VOICE NOTE
          ========================================================================= */}
      {stage === "voice" && (
        <section className="relative z-10 flex min-h-[100dvh] w-full flex-col items-center justify-center px-6 text-center">
          <div className="cv-glass-panel max-w-lg w-full p-6 sm:p-8 rounded-3xl animate-fade-in flex flex-col items-center">
            <span className="text-xs uppercase tracking-widest text-amber-300 font-semibold mb-2">
              Băng Ghi Âm Kỷ Niệm
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100 mb-6">
              Lời Nhắn Tri Ân Từ Trái Tim
            </h2>

            {/* Vintage Cassette Graphic & Rotating Reels */}
            <div className="relative w-full max-w-[320px] aspect-[1.58] bg-stone-900 rounded-2xl p-4 border border-amber-300/30 shadow-2xl flex flex-col justify-between overflow-hidden">
              <div className="flex justify-between items-center text-[10px] text-amber-300/70 font-mono">
                <span>CRAFTVISION 3D - TAPE #01</span>
                <span>SIDE A</span>
              </div>

              {/* Tape window with reels */}
              <div className="my-auto bg-stone-950/90 rounded-lg p-3 border border-amber-300/20 flex items-center justify-around">
                <div className={`w-12 h-12 rounded-full border-2 border-dashed border-amber-300/60 flex items-center justify-center ${tapePlaying ? "cv-cassette-reel" : "cv-cassette-reel--paused"}`}>
                  <div className="w-4 h-4 rounded-full bg-amber-400/80" />
                </div>

                {/* Animated Waveform Bars */}
                <div className="flex items-center gap-1 h-8">
                  {[18, 28, 14, 32, 22, 10, 26, 30, 16].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 bg-amber-300/80 rounded-full animate-pulse"
                      style={{ height: `${h}px`, animationDelay: `${i * 0.12}s` }}
                    />
                  ))}
                </div>

                <div className={`w-12 h-12 rounded-full border-2 border-dashed border-amber-300/60 flex items-center justify-center ${tapePlaying ? "cv-cassette-reel" : "cv-cassette-reel--paused"}`}>
                  <div className="w-4 h-4 rounded-full bg-amber-400/80" />
                </div>
              </div>

              <div className="text-[11px] text-amber-200/80 font-serif italic text-center">
                &ldquo;Cảm ơn Thầy Cô đã luôn là kim chỉ nam soi sáng con đường chúng em đi.&rdquo;
              </div>
            </div>

            <button
              onClick={() => goToStage("milestones")}
              className="cv-action-btn mt-8 flex items-center gap-2 text-sm cursor-pointer"
            >
              <span>Xem dấu ấn đồ án</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* =========================================================================
          STAGE 4: MILESTONES & 3D CAROUSEL PREVIEW
          ========================================================================= */}
      {stage === "milestones" && (
        <section className="relative z-10 flex min-h-[100dvh] w-full flex-col items-center justify-between py-16 px-6 text-center">
          <div className="max-w-xl animate-fade-in mt-2">
            <span className="text-xs uppercase tracking-widest text-amber-300/90 font-semibold mb-1 block">
              Dấu Ấn Nghiên Cứu & Phát Triển
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-amber-100 mb-2">
              Cột Mốc Dự Án CraftVision 3D
            </h2>
            <p className="text-xs sm:text-sm text-amber-200/70 max-w-md mx-auto">
              Những con số ý nghĩa đánh dấu nỗ lực không ngừng nghỉ dưới sự hướng dẫn của Quý Thầy Cô
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-2xl w-full my-auto z-10">
            {[
              { val: "120+", label: "Ngày nỗ lực đồ án" },
              { val: "25+", label: "Mô hình 3D tối ưu WebGL" },
              { val: "1,500+", label: "Commits & Dòng mã sạch" },
              { val: "100%", label: "Tâm huyết đồng đội" },
            ].map((stat, idx) => (
              <div key={idx} className="cv-glass-panel p-4 rounded-2xl flex flex-col items-center justify-center">
                <span className="text-xl sm:text-3xl font-bold font-mono text-amber-300">{stat.val}</span>
                <span className="text-[11px] sm:text-xs text-amber-100/75 mt-1">{stat.label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => goToStage("letter")}
            className="cv-action-btn flex items-center gap-2 text-sm cursor-pointer z-10"
          >
            <span>Mở bức thư tri ân</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </section>
      )}

      {/* =========================================================================
          STAGE 5: TYPEWRITER APPRECIATION LETTER
          ========================================================================= */}
      {stage === "letter" && (
        <section className="relative z-10 flex min-h-[100dvh] w-full flex-col items-center justify-center p-6 text-center">
          <div className="cv-glass-panel max-w-xl w-full p-6 sm:p-10 rounded-3xl animate-fade-in flex flex-col items-center text-left">
            <div className="w-full flex items-center justify-between border-b border-amber-300/20 pb-3 mb-4">
              <span className="text-xs uppercase tracking-wider text-amber-300 font-semibold flex items-center gap-1.5">
                <Feather className="w-4 h-4" />
                Thư Tri Ân Trang Trọng
              </span>
              <button
                onClick={() => setTypedChars(letterFullText.length)}
                className="text-xs text-amber-300/70 hover:text-amber-200 underline"
              >
                Đọc toàn bộ
              </button>
            </div>

            <div className="w-full min-h-[220px] sm:min-h-[260px] font-serif text-sm sm:text-base leading-relaxed text-amber-100/90 whitespace-pre-line">
              {letterFullText.slice(0, typedChars)}
              {typedChars < letterFullText.length && <span className="cv-typewriter-caret" />}
            </div>

            <div className="w-full flex items-center justify-between mt-6 pt-4 border-t border-amber-300/20 text-xs text-amber-200/70">
              <span>Đại diện: Nhóm Đồ Án EXE201</span>
              <span>CraftVision 3D</span>
            </div>

            <button
              onClick={() => goToStage("hug")}
              className="cv-action-btn mt-6 w-full sm:w-auto flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <span>Kết nối trái tim</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* =========================================================================
          STAGE 6: TACTILE HEARTBEAT HUG (WEB AUDIO PULSE + HAPTIC)
          ========================================================================= */}
      {stage === "hug" && (
        <section className="relative z-10 flex min-h-[100dvh] w-full flex-col items-center justify-between py-20 px-6 text-center">
          <div className="max-w-md animate-fade-in mt-2">
            <span className="text-xs uppercase tracking-widest text-rose-300 font-semibold mb-1 block">
              Gắn Kết Trái Tim
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-amber-100 mb-2">
              Nhịp Đập Đồng Đội & Tri Ân
            </h2>
            <p className="text-xs sm:text-sm text-amber-200/70">
              Công nghệ xúc giác mô phỏng nhịp tim chân thực kết nối tấm lòng
            </p>
          </div>

          {/* Heart holding trigger */}
          <div
            className="flex flex-col items-center cursor-pointer my-auto select-none"
            onPointerDown={startHeartHold}
            onPointerUp={endHeartHold}
            onPointerLeave={endHeartHold}
            onPointerCancel={endHeartHold}
          >
            <div className={`p-8 rounded-full bg-rose-950/40 border border-rose-400/40 backdrop-blur-md shadow-2xl transition-transform ${heartHolding ? "cv-heart-pulse scale-110" : "hover:scale-105"}`}>
              <Heart className="w-16 h-16 sm:w-20 sm:h-20 text-rose-500 fill-rose-500" />
            </div>

            <p className="mt-6 text-xs sm:text-sm text-amber-200/80 font-medium">
              {heartHolding ? "Đang lắng nghe nhịp tim..." : "Chạm & Giữ vào trái tim để cảm nhận nhịp đập"}
            </p>
          </div>

          <button
            onClick={() => goToStage("wish")}
            className="cv-action-btn flex items-center gap-2 text-sm cursor-pointer z-10"
          >
            <span>Gửi điều ước may mắn</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </section>
      )}

      {/* =========================================================================
          STAGE 7: 3D ORIGAMI WISH FOLDING
          ========================================================================= */}
      {stage === "wish" && (
        <section className="relative z-10 flex min-h-[100dvh] w-full flex-col items-center justify-center p-6 text-center">
          <div className="cv-glass-panel max-w-lg w-full p-6 sm:p-8 rounded-3xl animate-fade-in flex flex-col items-center">
            <span className="text-xs uppercase tracking-widest text-amber-300 font-semibold mb-1">
              Origami 3D Nghệ Thuật
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100 mb-4">
              Gấp Giấy Ước Nguyện Thành Sao
            </h2>

            {/* Paper folding representation */}
            <div className={`w-full max-w-sm p-5 rounded-2xl bg-[#fffaf0] text-stone-800 shadow-xl border border-amber-200 text-left my-4 cv-origami-paper ${isFolding ? "cv-origami-paper--folding" : ""}`}>
              <div className="text-[11px] uppercase tracking-wider text-amber-800/70 font-semibold mb-2">
                Mảnh giấy ước nguyện CraftVision
              </div>
              <textarea
                value={customWish}
                onChange={(e) => setCustomWish(e.target.value)}
                rows={3}
                className="w-full bg-transparent resize-none outline-none font-serif text-sm leading-relaxed text-stone-900 border-b border-amber-300/40 focus:border-amber-500"
                placeholder="Nhập lời chúc hoặc tâm nguyện..."
              />

              {/* Quick Preset Buttons */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {defaultWishes.map((w, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCustomWish(w)}
                    className="text-[10px] px-2 py-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 transition"
                  >
                    Lời chúc {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {foldedStar ? (
              <div className="cv-origami-star my-6 text-4xl">🌟</div>
            ) : (
              <button
                onClick={handleFoldWish}
                disabled={isFolding}
                className="cv-action-btn mt-4 flex items-center gap-2 text-sm cursor-pointer"
              >
                <span>{isFolding ? "Đang gấp giấy 3D..." : "Gấp thành ngôi sao sáng"}</span>
                <Sparkles className="w-4 h-4" />
              </button>
            )}
          </div>
        </section>
      )}

      {/* =========================================================================
          STAGE 8: CONSTELLATION STAR SANCTUARY (JAR)
          ========================================================================= */}
      {stage === "jar" && (
        <section className="relative z-10 flex min-h-[100dvh] w-full flex-col items-center justify-between py-20 px-6 text-center">
          <div className="max-w-md animate-fade-in mt-4">
            <span className="text-xs uppercase tracking-widest text-sky-300 font-semibold mb-1 block">
              Bầu Trời Tinh Tú
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-amber-100 mb-2">
              Lọ Điều Ước Ngân Hà
            </h2>
            <p className="text-xs sm:text-sm text-amber-200/70">
              Ngôi sao của bạn đã tỏa sáng giữa muôn ngàn chòm sao may mắn
            </p>
          </div>

          {/* Visual Constellation Jar Representation */}
          <div className="my-auto relative flex flex-col items-center">
            <div className="w-36 h-48 sm:w-44 sm:h-56 rounded-[3rem] border-2 border-amber-200/40 bg-gradient-to-b from-sky-400/10 via-amber-200/10 to-indigo-950/40 backdrop-blur-md shadow-[0_0_50px_rgba(252,211,133,0.35)] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-radial-gradient from-amber-300/20 to-transparent" />
              <div className="text-4xl animate-bounce">🌟</div>
              {/* Floating stars inside */}
              <span className="absolute top-8 left-6 text-xs text-amber-200 animate-pulse">✨</span>
              <span className="absolute bottom-10 right-8 text-xs text-sky-200 animate-pulse" style={{ animationDelay: "0.6s" }}>✨</span>
              <span className="absolute top-14 right-8 text-xs text-amber-300 animate-pulse" style={{ animationDelay: "1.2s" }}>✨</span>
            </div>
            <p className="mt-4 font-serif text-sm italic text-amber-200/80 max-w-xs">
              &ldquo;{customWish}&rdquo;
            </p>
          </div>

          <button
            onClick={() => goToStage("finale")}
            className="cv-action-btn flex items-center gap-2 text-sm cursor-pointer z-10"
          >
            <span>Đến đại kết & Khám phá 3D</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </section>
      )}

      {/* =========================================================================
          STAGE 9: GRAND FINALE & 3D FREE ORBIT SHOWCASE
          ========================================================================= */}
      {stage === "finale" && (
        <section className="relative z-10 flex min-h-[100dvh] w-full flex-col items-center justify-between py-16 px-6 text-center pointer-events-none">
          {/* Header text */}
          <div className="max-w-xl animate-fade-in mt-2 pointer-events-auto">
            <span className="text-xs uppercase tracking-widest text-amber-300 font-semibold mb-1 block">
              Trình Diễn Công Nghệ 3D
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-amber-100 mb-2">
              CraftVision 3D Showcase
            </h2>
            <p className="text-xs sm:text-sm text-amber-200/80 max-w-md mx-auto">
              Chân thành cảm ơn Quý Thầy Cô và các bạn đã đồng hành cùng chúng em!
            </p>
          </div>

          {/* Model Switcher Toolbar */}
          <div className="w-full max-w-md my-auto pointer-events-auto z-20">
            <div className="cv-glass-panel p-2.5 rounded-2xl flex items-center justify-center gap-1.5 shadow-xl mb-3">
              {SHOWCASE_MODELS.map((model) => (
                <button
                  key={model.key}
                  onClick={() => setSelectedModelKey(model.key)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-0.5 ${
                    selectedModelKey === model.key
                      ? "bg-amber-400 text-stone-950 shadow-md font-bold"
                      : "text-amber-200/75 hover:bg-white/10"
                  }`}
                >
                  <span>{model.name.split(" ")[0]}</span>
                  <span className="text-[10px] opacity-75">{model.tag.split(" ")[0]}</span>
                </button>
              ))}
            </div>

            {/* Model Description Badge */}
            {SHOWCASE_MODELS.find((m) => m.key === selectedModelKey) && (
              <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-amber-300/20 text-xs text-amber-200/90 inline-block">
                <strong>{SHOWCASE_MODELS.find((m) => m.key === selectedModelKey)?.name}:</strong>{" "}
                {SHOWCASE_MODELS.find((m) => m.key === selectedModelKey)?.description}
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pointer-events-auto z-20">
            <button
              onClick={handleReplay}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-amber-200/30 text-amber-100 text-sm font-semibold backdrop-blur-md transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Xem lại từ đầu</span>
            </button>

            <button
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Đã sao chép link Showcase: " + window.location.href);
                }
              }}
              className="cv-action-btn flex items-center gap-2 text-sm cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Sao chép link thiệp</span>
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
