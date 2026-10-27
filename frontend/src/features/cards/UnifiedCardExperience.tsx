"use client";

/* eslint-disable @next/next/no-img-element -- Personalized data URLs and authenticated media endpoints are rendered directly. */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { CardDraft, CardTemplate } from "./catalog";
import type { UnifiedStage } from "./UnifiedCosmicScene";
import {
  getCuratedModel,
  getCosmicBackground,
  getPhotoFormation,
} from "./curatedModels";

const UnifiedCosmicScene = dynamic(() => import("./UnifiedCosmicScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#060411] text-sm font-medium text-purple-200/80">
      ✨ Đang khởi tạo không gian vũ trụ 3D…
    </div>
  ),
});

const NORMAL_BGM_VOLUME = 0.38;
const DUCKED_BGM_VOLUME = 0.06;

export default function UnifiedCardExperience({
  template,
  draft,
  embedded = false,
}: {
  template: CardTemplate;
  draft: CardDraft;
  embedded?: boolean;
}) {
  const text = useCallback(
    (key: string, fallback = "") =>
      typeof draft.values[key] === "string"
        ? String(draft.values[key] || fallback).normalize("NFC")
        : fallback,
    [draft.values]
  );

  const recipient = text("recipient", "Người thương");
  const sender = text("sender", "Một người luôn bên bạn");
  const title = text("title", template.title);
  const intro = text("intro", "Một món quà nhỏ, dành riêng cho bạn");
  const letterTitle = text("letterTitle", `Gửi ${recipient} thân mến`);
  const message = text("message", template.message);
  const closing = text("closing", "Với tất cả yêu thương");
  const envelopeLabel = text("envelopeLabel", "Dành riêng cho bạn");
  const bgmSrc = text("audio", "");
  const voiceSrc = text("voice", "");
  const voiceTranscript = text(
    "voiceText",
    voiceSrc
      ? `Gửi ${recipient}, hãy lắng nghe lời nhắn từ ${sender} nhé…`
      : intro
  );

  const curatedModel = useMemo(
    () => getCuratedModel(text("sceneModel", "")),
    [text]
  );
  const cosmicBg = useMemo(
    () => getCosmicBackground(text("bgStyle", "")),
    [text]
  );
  const photoFormation = useMemo(
    () => getPhotoFormation(text("photoFormation", "")),
    [text]
  );

  const photos = useMemo(() => {
    const primary = text("photo", "");
    const albumList = Array.isArray(draft.values.album)
      ? draft.values.album.filter(
          (item): item is string => typeof item === "string" && Boolean(item)
        )
      : [];
    const merged = [primary, ...albumList].filter(Boolean);
    return Array.from(new Set(merged));
  }, [draft.values.album, text]);

  const [stage, setStage] = useState<UnifiedStage>("INTRO");
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [voiceTriggered, setVoiceTriggered] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [voiceFinished, setVoiceFinished] = useState(false);
  const [typedVoiceText, setTypedVoiceText] = useState("");
  const [letterOpened, setLetterOpened] = useState(false);
  const [showLetterSheet, setShowLetterSheet] = useState(false);
  const [focusedPhotoIdx, setFocusedPhotoIdx] = useState<number | null>(null);

  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const duckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fadeBgmVolume = useCallback((targetVolume: number) => {
    const bgm = bgAudioRef.current;
    if (!bgm) return;
    if (duckIntervalRef.current) clearInterval(duckIntervalRef.current);
    duckIntervalRef.current = setInterval(() => {
      const diff = targetVolume - bgm.volume;
      if (Math.abs(diff) <= 0.02) {
        bgm.volume = Math.max(0, Math.min(1, targetVolume));
        if (duckIntervalRef.current) clearInterval(duckIntervalRef.current);
        duckIntervalRef.current = null;
        return;
      }
      bgm.volume = Math.max(
        0,
        Math.min(1, bgm.volume + (diff > 0 ? 0.025 : -0.035))
      );
    }, 45);
  }, []);

  const clearTimers = useCallback(() => {
    if (duckIntervalRef.current) {
      clearInterval(duckIntervalRef.current);
      duckIntervalRef.current = null;
    }
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    if (stageTimerRef.current) {
      clearTimeout(stageTimerRef.current);
      stageTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  // Chuyển cảnh tự động từ Bước 1 (1-2 ảnh mở màn) -> Bước 2 (Chuyển cảnh vũ trụ) -> Bước 3 (Model 3D)
  useEffect(() => {
    if (stage === "OPENING_PHOTOS") {
      stageTimerRef.current = setTimeout(() => {
        setStage("TRANSITION");
      }, 4200);
      return () => {
        if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
      };
    }
    if (stage === "TRANSITION") {
      stageTimerRef.current = setTimeout(() => {
        setStage("MODEL_STAGE");
      }, 1650);
      return () => {
        if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
      };
    }
    if (stage === "ENVELOPE_LETTER") {
      stageTimerRef.current = setTimeout(() => {
        setLetterOpened(true);
        setShowLetterSheet(true);
      }, 750);
      return () => {
        if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
      };
    }
  }, [stage]);

  // Hàm phát đoạn Ghi âm + Chạy văn bản từng chữ cái + Giảm nhỏ nhạc nền (Audio Ducking)
  const triggerModelVoiceAndTranscript = useCallback(() => {
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    setVoiceTriggered(true);
    setVoiceFinished(false);
    setTypedVoiceText("");

    const chars = Array.from(voiceTranscript);
    const voiceEl = voiceAudioRef.current;

    // Giảm nhỏ nhạc nền (Audio Ducking)
    fadeBgmVolume(DUCKED_BGM_VOLUME);

    const startCharacterStream = (durationSec: number) => {
      if (chars.length === 0) {
        setVoiceFinished(true);
        fadeBgmVolume(NORMAL_BGM_VOLUME);
        return;
      }
      const totalMs =
        durationSec > 0.5 && Number.isFinite(durationSec)
          ? durationSec * 920
          : chars.length * 52;
      const stepMs = Math.max(22, Math.min(95, Math.round(totalMs / chars.length)));
      let idx = 0;
      typingTimerRef.current = setInterval(() => {
        idx += 1;
        setTypedVoiceText(chars.slice(0, idx).join(""));
        if (idx >= chars.length) {
          if (typingTimerRef.current) clearInterval(typingTimerRef.current);
          typingTimerRef.current = null;
          if (!voiceSrc || !voiceEl || voiceEl.paused || voiceEl.ended) {
            setVoicePlaying(false);
            setVoiceFinished(true);
            fadeBgmVolume(NORMAL_BGM_VOLUME);
          }
        }
      }, stepMs);
    };

    if (voiceSrc && voiceEl) {
      voiceEl.currentTime = 0;
      voiceEl.volume = 1;
      void voiceEl
        .play()
        .then(() => {
          setVoicePlaying(true);
          startCharacterStream(voiceEl.duration || 0);
        })
        .catch(() => {
          setVoicePlaying(false);
          startCharacterStream(0);
        });
    } else {
      setVoicePlaying(true);
      startCharacterStream(0);
    }
  }, [fadeBgmVolume, voiceSrc, voiceTranscript]);

  const handleStartExperience = () => {
    if (bgAudioRef.current && bgmSrc) {
      bgAudioRef.current.volume = NORMAL_BGM_VOLUME;
      bgAudioRef.current.currentTime = 0;
      void bgAudioRef.current
        .play()
        .then(() => setMusicPlaying(true))
        .catch(() => setMusicPlaying(false));
    }
    setStage("OPENING_PHOTOS");
  };

  const handleSceneInteract = useCallback(() => {
    if (stage === "INTRO") {
      handleStartExperience();
      return;
    }
    if (stage === "OPENING_PHOTOS") {
      setStage("TRANSITION");
      return;
    }
    if (stage === "MODEL_STAGE") {
      if (!voiceTriggered) {
        triggerModelVoiceAndTranscript();
      } else if (voiceFinished) {
        setStage("ENVELOPE_LETTER");
      }
      return;
    }
    if (stage === "ENVELOPE_LETTER") {
      setLetterOpened(true);
      setShowLetterSheet((prev) => !prev);
    }
  }, [stage, triggerModelVoiceAndTranscript, voiceFinished, voiceTriggered]);

  const handleReplay = () => {
    clearTimers();
    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause();
      voiceAudioRef.current.currentTime = 0;
    }
    if (bgAudioRef.current && bgmSrc) {
      bgAudioRef.current.volume = NORMAL_BGM_VOLUME;
    }
    setVoiceTriggered(false);
    setVoicePlaying(false);
    setVoiceFinished(false);
    setTypedVoiceText("");
    setLetterOpened(false);
    setShowLetterSheet(false);
    setFocusedPhotoIdx(null);
    setStage("INTRO");
  };

  const toggleMusic = () => {
    const bgm = bgAudioRef.current;
    if (!bgm) return;
    if (musicPlaying) {
      bgm.pause();
      setMusicPlaying(false);
    } else {
      bgm.volume = voicePlaying ? DUCKED_BGM_VOLUME : NORMAL_BGM_VOLUME;
      void bgm
        .play()
        .then(() => setMusicPlaying(true))
        .catch(() => setMusicPlaying(false));
    }
  };

  return (
    <main className="relative h-full min-h-[100svh] w-full overflow-hidden bg-[#060411] text-white select-none">
      {/* Nhạc nền phát xuyên suốt từ đầu đến cuối */}
      {bgmSrc && (
        <audio
          ref={bgAudioRef}
          src={bgmSrc}
          loop
          preload="auto"
          onError={() => setMusicPlaying(false)}
        />
      )}

      {/* Đoạn ghi âm giọng nói của người gửi */}
      {voiceSrc && (
        <audio
          ref={voiceAudioRef}
          src={voiceSrc}
          preload="auto"
          onPlay={() => {
            setVoicePlaying(true);
            fadeBgmVolume(DUCKED_BGM_VOLUME);
          }}
          onPause={() => {
            setVoicePlaying(false);
            fadeBgmVolume(NORMAL_BGM_VOLUME);
          }}
          onEnded={() => {
            setVoicePlaying(false);
            setVoiceFinished(true);
            fadeBgmVolume(NORMAL_BGM_VOLUME);
          }}
          onError={() => {
            setVoicePlaying(false);
            setVoiceFinished(true);
            fadeBgmVolume(NORMAL_BGM_VOLUME);
          }}
        />
      )}

      {/* Không gian Vũ trụ 3D & Sân khấu Tương tác */}
      <UnifiedCosmicScene
        template={template}
        draft={draft}
        stage={stage}
        voicePlaying={voicePlaying}
        letterOpened={letterOpened}
        photos={photos}
        onSceneInteract={handleSceneInteract}
        onPhotoClick={(idx) => setFocusedPhotoIdx(idx)}
      />

      {/* Thanh điều khiển góc trên */}
      <nav
        aria-label="Điều khiển thiệp 3D"
        className="pointer-events-auto absolute top-4 left-4 right-4 z-30 flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2">
          {!embedded && (
            <Link
              href="/cards"
              className="rounded-full border border-white/20 bg-black/40 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md transition hover:bg-white/15"
            >
              ← Bộ sưu tập
            </Link>
          )}
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[11px] text-purple-200/90 backdrop-blur-md">
            <span>{cosmicBg.icon}</span>
            <span>{cosmicBg.name}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {bgmSrc && (
            <button
              type="button"
              onClick={toggleMusic}
              className="rounded-full border border-white/20 bg-black/45 px-3.5 py-1.5 text-xs font-semibold text-amber-200 backdrop-blur-md transition hover:bg-white/15 cursor-pointer"
            >
              {musicPlaying ? "♫ Nhạc: Bật" : "♩ Nhạc: Tắt"}
            </button>
          )}
          {stage !== "INTRO" && (
            <button
              type="button"
              onClick={handleReplay}
              className="rounded-full border border-white/20 bg-black/45 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md transition hover:bg-white/15 cursor-pointer"
            >
              ↻ Xem lại
            </button>
          )}
        </div>
      </nav>

      {/* =================================================================== */}
      {/* BƯỚC 0: MÀN HÌNH LỜI MỞ ĐẦU THIỆP (INTRO)                           */}
      {/* =================================================================== */}
      {stage === "INTRO" && (
        <section className="pointer-events-auto relative z-20 flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
          <div className="max-w-lg space-y-5 rounded-3xl border border-white/15 bg-black/45 p-7 sm:p-10 shadow-2xl backdrop-blur-xl animate-fade-in">
            <span className="inline-block rounded-full border border-rose-300/30 bg-rose-500/15 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-rose-200">
              Dành riêng cho {recipient}
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold leading-tight text-white drop-shadow">
              {title}
            </h1>
            <p className="text-sm sm:text-base leading-relaxed text-purple-100/90 italic">
              &ldquo;{intro}&rdquo;
            </p>
            <p className="text-xs text-white/60">Từ: {sender}</p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartExperience}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 px-8 py-3.5 text-sm font-bold text-white shadow-[0_0_35px_rgba(244,63,94,0.55)] transition duration-300 hover:scale-105 cursor-pointer"
              >
                <span>Chạm để mở thiệp 3D</span>
                <span>✨</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* BƯỚC 1: HIỆN 1 ĐẾN 2 HÌNH ẢNH MỞ MÀN                                */}
      {/* =================================================================== */}
      {stage === "OPENING_PHOTOS" && (
        <section className="pointer-events-none absolute inset-x-0 bottom-8 z-20 flex flex-col items-center px-4 text-center">
          <div className="pointer-events-auto max-w-md space-y-2.5 rounded-2xl border border-white/15 bg-black/50 px-6 py-4 backdrop-blur-lg">
            <p className="text-xs uppercase tracking-[0.22em] text-amber-200/90 font-semibold">
              Khoảnh khắc mở đầu · {recipient}
            </p>
            <p className="text-sm text-white/90 italic">&ldquo;{intro}&rdquo;</p>
            <button
              type="button"
              onClick={() => setStage("TRANSITION")}
              className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white hover:bg-white/20 cursor-pointer"
            >
              <span>Tiếp tục vào không gian 3D →</span>
            </button>
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* BƯỚC 2: HIỆU ỨNG CHUYỂN CẢNH XUYÊN VŨ TRỤ                           */}
      {/* =================================================================== */}
      {stage === "TRANSITION" && (
        <section className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <div className="rounded-full border border-white/20 bg-black/40 px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.28em] text-purple-200 backdrop-blur-md animate-pulse">
            ✨ Đang bay vào tâm điểm kỷ niệm…
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* BƯỚC 3: SÂN KHẤU MODEL 3D + CHẠM PHÁT GHI ÂM & CHỮ TỪNG KÝ TỰ        */}
      {/* =================================================================== */}
      {stage === "MODEL_STAGE" && (
        <section className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex flex-col items-center px-4 text-center">
          <div className="pointer-events-auto w-full max-w-xl space-y-3 rounded-3xl border border-white/20 bg-black/60 p-5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-rose-300">
              <span>{curatedModel.icon}</span>
              <span>{curatedModel.name}</span>
            </div>

            {!voiceTriggered ? (
              <div className="space-y-3">
                <p className="text-sm text-white/90">
                  Chạm trực tiếp vào <strong>Mô hình 3D</strong> phía trên (hoặc nhấn nút bên dưới) để lắng nghe lời nhắn từ <strong>{sender}</strong>.
                </p>
                <button
                  type="button"
                  onClick={triggerModelVoiceAndTranscript}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:scale-105 cursor-pointer animate-pulse"
                >
                  <span>🎙️ Chạm để phát lời nhắn & giọng nói</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Sóng âm khi đang phát đoạn ghi âm (nhạc nền tự động nhỏ lại) */}
                <div className="flex items-center justify-center gap-2">
                  <span className="text-[11px] font-semibold text-amber-300">
                    {voicePlaying
                      ? "🎙️ Đang phát giọng nói (Nhạc nền đã tự động giảm nhỏ)..."
                      : "✨ Lời nhắn từ " + sender}
                  </span>
                  {voicePlaying && (
                    <span className="inline-flex items-end gap-0.5 h-3.5">
                      <i className="w-1 h-2 bg-rose-400 animate-bounce" />
                      <i className="w-1 h-3.5 bg-amber-300 animate-bounce [animation-delay:120ms]" />
                      <i className="w-1 h-2.5 bg-rose-400 animate-bounce [animation-delay:240ms]" />
                      <i className="w-1 h-3 bg-amber-300 animate-bounce [animation-delay:80ms]" />
                    </span>
                  )}
                </div>

                {/* Văn bản của đoạn ghi âm xuất hiện từng chữ cái */}
                <div className="min-h-[3.5rem] rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base sm:text-lg font-serif italic leading-relaxed text-amber-50">
                  &ldquo;{typedVoiceText}
                  {!voiceFinished && (
                    <span className="ml-0.5 inline-block animate-pulse text-rose-400">
                      |
                    </span>
                  )}
                  &rdquo;
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={triggerModelVoiceAndTranscript}
                    className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 cursor-pointer"
                  >
                    ↻ Nghe lại giọng nói
                  </button>
                  <button
                    type="button"
                    onClick={() => setStage("ENVELOPE_LETTER")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-6 py-2 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:scale-105 cursor-pointer"
                  >
                    <span>Mở phong thư & ngắm ảnh kỷ niệm 💌</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* BƯỚC 4: MỞ PHONG THƯ & HÌNH ẢNH XOAY VÒNG QUANH LÁ THƯ              */}
      {/* =================================================================== */}
      {stage === "ENVELOPE_LETTER" && (
        <>
          {/* Thanh chuyển đổi giữa Đọc thư và Ngắm trọn các bức ảnh xoay quanh lá thư */}
          <div className="pointer-events-auto absolute bottom-5 inset-x-0 z-30 flex flex-wrap items-center justify-center gap-2.5 px-4">
            <button
              type="button"
              onClick={() => {
                setLetterOpened(true);
                setShowLetterSheet((prev) => !prev);
              }}
              className="rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xl transition hover:scale-105 cursor-pointer"
            >
              {showLetterSheet
                ? `🌌 Ẩn trang thư để ngắm ${photoFormation.name}`
                : `💌 Mở đọc lá thư (${envelopeLabel})`}
            </button>
            {voiceSrc && (
              <button
                type="button"
                onClick={triggerModelVoiceAndTranscript}
                className="rounded-full border border-white/25 bg-black/60 px-4 py-2.5 text-xs font-semibold text-amber-200 backdrop-blur-md hover:bg-white/15 cursor-pointer"
              >
                🎙️ {voicePlaying ? "Đang phát giọng nói..." : "Nghe lại ghi âm"}
              </button>
            )}
          </div>

          {/* Nội dung Lá thư tâm tình mở ra ở giữa trong khi ảnh xoay xung quanh */}
          {showLetterSheet && (
            <section
              aria-label="Lá thư tâm tình"
              className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center p-4 sm:p-6"
            >
              <article className="relative max-h-[78svh] w-full max-w-lg overflow-y-auto rounded-3xl border border-amber-200/40 bg-gradient-to-b from-[#fffdf9]/95 to-[#f9eedf]/95 p-6 sm:p-8 text-[#3c2415] shadow-[0_25px_70px_rgba(0,0,0,0.75)] backdrop-blur-md animate-fade-in">
                <button
                  type="button"
                  onClick={() => setShowLetterSheet(false)}
                  aria-label="Thu gọn lá thư để ngắm ảnh xoay quanh"
                  className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-lg font-bold text-[#5a3825] hover:bg-black/20 cursor-pointer"
                >
                  ×
                </button>

                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-rose-700/80">
                  {envelopeLabel} · Gửi {recipient}
                </p>
                <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-bold text-[#4a1d2c]">
                  {letterTitle}
                </h2>

                {/* Thanh phát lại ghi âm giọng nói ngay trong lá thư */}
                {(voiceSrc || voiceTranscript) && (
                  <div className="my-4 rounded-2xl border border-rose-300/60 bg-rose-50/90 p-3.5 text-xs text-[#5b2333]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold flex items-center gap-1.5">
                        <span>🎙️ Lời nhắn thoại từ {sender}</span>
                      </span>
                      <button
                        type="button"
                        onClick={triggerModelVoiceAndTranscript}
                        className="rounded-full bg-rose-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-rose-700 cursor-pointer"
                      >
                        {voicePlaying ? "Đang phát..." : "▶ Phát giọng nói"}
                      </button>
                    </div>
                    {voiceTranscript && (
                      <p className="mt-2 font-serif italic text-sm text-[#6b2d3e]">
                        &ldquo;{typedVoiceText || voiceTranscript}&rdquo;
                      </p>
                    )}
                  </div>
                )}

                <div className="my-4 whitespace-pre-wrap font-serif text-base leading-relaxed text-[#3c2415]">
                  {message}
                </div>

                {photos.length > 0 && (
                  <div className="my-4 grid grid-cols-3 gap-2">
                    {photos.slice(0, 6).map((src, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFocusedPhotoIdx(idx)}
                        className="overflow-hidden rounded-xl border border-amber-900/15 shadow-xs hover:scale-105 transition cursor-pointer"
                      >
                        <img
                          src={src}
                          alt={`Ảnh kỷ niệm ${idx + 1}`}
                          className="aspect-square w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                <footer className="mt-5 border-t border-amber-900/15 pt-4 text-right">
                  <p className="text-xs italic text-[#6e4c36]">{closing}</p>
                  <strong className="mt-1 block font-serif text-lg text-rose-800">
                    {sender} ♥
                  </strong>
                </footer>
              </article>
            </section>
          )}
        </>
      )}

      {/* Lightbox xem ảnh phóng đại khi chạm vào ảnh đang xoay quanh lá thư */}
      {focusedPhotoIdx !== null && photos[focusedPhotoIdx] && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setFocusedPhotoIdx(null)}
          className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full rounded-3xl bg-white p-3 shadow-2xl"
          >
            <img
              src={photos[focusedPhotoIdx]}
              alt={`Kỷ niệm ${focusedPhotoIdx + 1}`}
              className="max-h-[70svh] w-full rounded-2xl object-contain bg-black/5"
            />
            <div className="mt-2 flex items-center justify-between px-2 py-1 text-xs font-semibold text-gray-700">
              <span>
                Ảnh kỷ niệm {focusedPhotoIdx + 1} / {photos.length}
              </span>
              <button
                type="button"
                onClick={() => setFocusedPhotoIdx(null)}
                className="rounded-lg bg-rose-600 px-3 py-1 text-white cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
