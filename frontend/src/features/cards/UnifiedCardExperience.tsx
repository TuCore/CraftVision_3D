"use client";

/* eslint-disable @next/next/no-img-element -- Personalized data URLs and authenticated media endpoints are rendered directly. */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { CardDraft, CardTemplate } from "./catalog";
import type { UnifiedStage } from "./UnifiedCosmicScene";
import {
  PHOTO_FORMATIONS,
  getCuratedModel,
  getCosmicBackground,
  getPhotoFormation,
  type PhotoFormationPreset,
} from "./curatedModels";

const UnifiedCosmicScene = dynamic(() => import("./UnifiedCosmicScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#060411] text-sm font-medium text-amber-100/80">
      ✦ Đang khởi tạo không gian vũ trụ 3D…
    </div>
  ),
});

const NORMAL_BGM_VOLUME = 0.38;
const DUCKED_BGM_VOLUME = 0.06;

interface TimelineStep {
  id: "INTRO" | "OPENING_PHOTOS" | "MODEL_STAGE" | "ENVELOPE_LETTER";
  stepNumber: string;
  label: string;
  shortLabel: string;
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    id: "INTRO",
    stepNumber: "01",
    label: "Mở đầu",
    shortLabel: "Mở đầu",
  },
  {
    id: "OPENING_PHOTOS",
    stepNumber: "02",
    label: "Ảnh mở màn",
    shortLabel: "Ảnh mở màn",
  },
  {
    id: "MODEL_STAGE",
    stepNumber: "03",
    label: "Quà 3D & Giọng nói",
    shortLabel: "Quà 3D",
  },
  {
    id: "ENVELOPE_LETTER",
    stepNumber: "04",
    label: "Phong thư & Kỷ niệm",
    shortLabel: "Phong thư",
  },
];

const WAVEFORM_BAR_HEIGHTS = [38, 72, 54, 92, 64, 100, 48, 84, 60, 88, 44, 70];

function formatAudioTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const totalSec = Math.floor(seconds);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

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
  const defaultPhotoFormation = useMemo(
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
  const [introUnsealing, setIntroUnsealing] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [voiceTriggered, setVoiceTriggered] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [voiceFinished, setVoiceFinished] = useState(false);
  const [voiceCurrentTime, setVoiceCurrentTime] = useState(0);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [voiceError, setVoiceError] = useState(false);
  const [typedVoiceText, setTypedVoiceText] = useState("");
  const [letterOpened, setLetterOpened] = useState(false);
  const [showLetterSheet, setShowLetterSheet] = useState(false);
  const [focusedPhotoIdx, setFocusedPhotoIdx] = useState<number | null>(null);
  const [activeFormationId, setActiveFormationId] = useState<
    PhotoFormationPreset["id"]
  >(defaultPhotoFormation.id);

  // Sync activeFormationId if the draft's default formation changes in editor preview
  useEffect(() => {
    setActiveFormationId(defaultPhotoFormation.id);
  }, [defaultPhotoFormation.id]);

  const activeFormationPreset = useMemo(
    () => getPhotoFormation(activeFormationId),
    [activeFormationId]
  );

  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const duckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openFlapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const introSealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const introOpeningRef = useRef(false);
  const voicePlayTokenRef = useRef(0);
  const letterCloseBtnRef = useRef<HTMLButtonElement | null>(null);
  const formationBtnRefs = useRef<Array<HTMLButtonElement | null>>([]);

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
    if (openFlapTimerRef.current) {
      clearTimeout(openFlapTimerRef.current);
      openFlapTimerRef.current = null;
    }
    if (introSealTimerRef.current) {
      clearTimeout(introSealTimerRef.current);
      introSealTimerRef.current = null;
    }
  }, []);

  const stopVoiceAndTyping = useCallback(() => {
    voicePlayTokenRef.current += 1;
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    const voiceEl = voiceAudioRef.current;
    if (voiceEl && !voiceEl.paused) {
      voiceEl.pause();
    }
    if (voiceEl) {
      voiceEl.currentTime = 0;
    }
    setVoicePlaying(false);
    setVoiceCurrentTime(0);
    fadeBgmVolume(NORMAL_BGM_VOLUME);
  }, [fadeBgmVolume]);

  useEffect(() => {
    return () => {
      voicePlayTokenRef.current += 1;
      clearTimers();
    };
  }, [clearTimers]);

  const ensureBgmStarted = useCallback(() => {
    const bgm = bgAudioRef.current;
    if (!bgm || !bgmSrc) return;
    if (bgm.paused) {
      bgm.volume = NORMAL_BGM_VOLUME;
      void bgm
        .play()
        .then(() => setMusicPlaying(true))
        .catch(() => setMusicPlaying(false));
    }
  }, [bgmSrc]);

  // Unified stage navigation controller so old timers, voice playback, typewriter, and modals never leak across stages
  const navigateToStage = useCallback(
    (nextStage: UnifiedStage) => {
      clearTimers();
      introOpeningRef.current = false;
      setIntroUnsealing(false);
      setFocusedPhotoIdx(null);
      stopVoiceAndTyping();

      if (nextStage !== "INTRO") {
        ensureBgmStarted();
      }
      if (nextStage !== "ENVELOPE_LETTER") {
        setShowLetterSheet(false);
        setLetterOpened(false);
      }
      if (nextStage === "MODEL_STAGE") {
        setVoiceTriggered(false);
        setVoiceFinished(false);
        setTypedVoiceText("");
      }
      setStage(nextStage);
    },
    [clearTimers, ensureBgmStarted, stopVoiceAndTyping]
  );

  // Automatic stage progression timers
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
      setLetterOpened(false);
      setShowLetterSheet(false);
      openFlapTimerRef.current = setTimeout(() => {
        setLetterOpened(true);
      }, 450);
      stageTimerRef.current = setTimeout(() => {
        setShowLetterSheet(true);
      }, 1850);
      return () => {
        if (openFlapTimerRef.current) clearTimeout(openFlapTimerRef.current);
        if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
      };
    }
  }, [stage]);

  // Focus close button when letter modal opens and handle Escape key
  useEffect(() => {
    if (showLetterSheet) {
      const id = setTimeout(() => {
        letterCloseBtnRef.current?.focus();
      }, 80);
      return () => clearTimeout(id);
    }
  }, [showLetterSheet]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (focusedPhotoIdx !== null) {
          setFocusedPhotoIdx(null);
          return;
        }
        if (showLetterSheet) {
          setShowLetterSheet(false);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [focusedPhotoIdx, showLetterSheet]);

  // Play voice recording + synchronized character-by-character typewriter + BGM audio ducking
  const triggerModelVoiceAndTranscript = useCallback(() => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }

    const token = ++voicePlayTokenRef.current;
    setVoiceTriggered(true);
    setVoiceFinished(false);
    setVoiceError(false);
    setTypedVoiceText("");
    setVoiceCurrentTime(0);

    const chars = Array.from(voiceTranscript);
    const voiceEl = voiceAudioRef.current;

    const startCharacterStream = (durationSec: number, hasAudio: boolean) => {
      if (voicePlayTokenRef.current !== token) return;
      if (chars.length === 0) {
        if (!hasAudio) {
          setVoicePlaying(false);
          setVoiceFinished(true);
          fadeBgmVolume(NORMAL_BGM_VOLUME);
        }
        return;
      }
      const validDuration =
        durationSec > 0.5 && Number.isFinite(durationSec) ? durationSec : 0;
      const totalMs = validDuration > 0 ? validDuration * 920 : chars.length * 48;
      const stepMs = Math.max(
        22,
        Math.min(95, Math.round(totalMs / chars.length))
      );
      let idx = 0;
      typingTimerRef.current = setInterval(() => {
        if (voicePlayTokenRef.current !== token) {
          if (typingTimerRef.current) clearInterval(typingTimerRef.current);
          typingTimerRef.current = null;
          return;
        }
        idx += 1;
        setTypedVoiceText(chars.slice(0, idx).join(""));
        if (idx >= chars.length) {
          if (typingTimerRef.current) clearInterval(typingTimerRef.current);
          typingTimerRef.current = null;
          if (!hasAudio || !voiceEl || voiceEl.paused || voiceEl.ended) {
            setVoicePlaying(false);
            setVoiceFinished(true);
            fadeBgmVolume(NORMAL_BGM_VOLUME);
          }
        }
      }, stepMs);
    };

    if (voiceSrc && voiceEl) {
      fadeBgmVolume(DUCKED_BGM_VOLUME);
      voiceEl.currentTime = 0;
      voiceEl.volume = 1;
      void voiceEl
        .play()
        .then(() => {
          if (voicePlayTokenRef.current !== token) {
            voiceEl.pause();
            return;
          }
          setVoicePlaying(true);
          const dur =
            Number.isFinite(voiceEl.duration) && voiceEl.duration > 0
              ? voiceEl.duration
              : 0;
          if (dur > 0) setVoiceDuration(dur);
          startCharacterStream(dur, true);
        })
        .catch(() => {
          if (voicePlayTokenRef.current !== token) return;
          setVoicePlaying(false);
          setVoiceError(true);
          fadeBgmVolume(NORMAL_BGM_VOLUME);
          startCharacterStream(0, false);
        });
    } else {
      // Text-only typewriter mode when no voice audio is attached
      setVoicePlaying(false);
      startCharacterStream(0, false);
    }
  }, [fadeBgmVolume, voiceSrc, voiceTranscript]);

  const handleStartExperience = useCallback(() => {
    if (introOpeningRef.current) return;
    introOpeningRef.current = true;
    setIntroUnsealing(true);
    ensureBgmStarted();

    if (introSealTimerRef.current) clearTimeout(introSealTimerRef.current);
    introSealTimerRef.current = setTimeout(() => {
      introOpeningRef.current = false;
      setIntroUnsealing(false);
      setStage("OPENING_PHOTOS");
    }, 240);
  }, [ensureBgmStarted]);

  const handleSceneInteract = useCallback(() => {
    if (stage === "INTRO") {
      handleStartExperience();
      return;
    }
    if (stage === "OPENING_PHOTOS") {
      if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
      setStage("TRANSITION");
      return;
    }
    if (stage === "MODEL_STAGE") {
      if (!voiceTriggered) {
        triggerModelVoiceAndTranscript();
      } else if (voiceFinished) {
        navigateToStage("ENVELOPE_LETTER");
      }
      return;
    }
    if (stage === "ENVELOPE_LETTER") {
      setLetterOpened((prev) => {
        const next = !prev;
        if (!next) setShowLetterSheet(false);
        return next;
      });
    }
  }, [
    handleStartExperience,
    navigateToStage,
    stage,
    triggerModelVoiceAndTranscript,
    voiceFinished,
    voiceTriggered,
  ]);

  const handleReplay = useCallback(() => {
    clearTimers();
    stopVoiceAndTyping();
    introOpeningRef.current = false;
    setIntroUnsealing(false);
    if (bgAudioRef.current && bgmSrc) {
      bgAudioRef.current.volume = NORMAL_BGM_VOLUME;
      bgAudioRef.current.currentTime = 0;
    }
    setVoiceTriggered(false);
    setVoicePlaying(false);
    setVoiceFinished(false);
    setVoiceCurrentTime(0);
    setVoiceError(false);
    setTypedVoiceText("");
    setLetterOpened(false);
    setShowLetterSheet(false);
    setFocusedPhotoIdx(null);
    setActiveFormationId(defaultPhotoFormation.id);
    setStage("INTRO");
  }, [bgmSrc, clearTimers, defaultPhotoFormation.id, stopVoiceAndTyping]);

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

  // Map current stage (including internal TRANSITION) to the 4 timeline steps
  const activeStepIndex = useMemo(() => {
    if (stage === "INTRO") return 0;
    if (stage === "OPENING_PHOTOS" || stage === "TRANSITION") return 1;
    if (stage === "MODEL_STAGE") return 2;
    return 3;
  }, [stage]);

  const handleTimelineClick = (step: TimelineStep, index: number) => {
    // Clicking the currently active step does not reset the experience
    if (index === activeStepIndex) return;
    navigateToStage(step.id);
  };

  const hasValidVoiceDuration =
    Number.isFinite(voiceDuration) && voiceDuration > 0;
  const voiceProgressPercent = useMemo(() => {
    if (hasValidVoiceDuration) {
      return Math.max(
        0,
        Math.min(100, (voiceCurrentTime / voiceDuration) * 100)
      );
    }
    if (voiceFinished) return 100;
    if (voicePlaying && voiceTranscript.length > 0) {
      return Math.max(
        5,
        Math.min(
          95,
          (Array.from(typedVoiceText).length /
            Math.max(1, Array.from(voiceTranscript).length)) *
            100
        )
      );
    }
    return 0;
  }, [
    hasValidVoiceDuration,
    typedVoiceText,
    voiceCurrentTime,
    voiceDuration,
    voiceFinished,
    voicePlaying,
    voiceTranscript,
  ]);

  const handleFormationKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    idx: number
  ) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const dir = e.key === "ArrowRight" ? 1 : -1;
      const nextIdx =
        (idx + dir + PHOTO_FORMATIONS.length) % PHOTO_FORMATIONS.length;
      const nextFormation = PHOTO_FORMATIONS[nextIdx];
      setActiveFormationId(nextFormation.id);
      formationBtnRefs.current[nextIdx]?.focus();
    }
  };

  return (
    <main className="relative h-full min-h-[100svh] w-full overflow-hidden bg-[#060411] text-white select-none">
      {/* Continuous background music */}
      {bgmSrc && (
        <audio
          ref={bgAudioRef}
          src={bgmSrc}
          loop
          preload="auto"
          onError={() => setMusicPlaying(false)}
        />
      )}

      {/* Sender's personal voice recording */}
      {voiceSrc && (
        <audio
          ref={voiceAudioRef}
          src={voiceSrc}
          preload="metadata"
          onLoadedMetadata={(e) => {
            const dur = e.currentTarget.duration;
            if (Number.isFinite(dur) && dur > 0) {
              setVoiceDuration(dur);
            }
          }}
          onDurationChange={(e) => {
            const dur = e.currentTarget.duration;
            if (Number.isFinite(dur) && dur > 0) {
              setVoiceDuration(dur);
            }
          }}
          onTimeUpdate={(e) => {
            const cur = e.currentTarget.currentTime;
            if (Number.isFinite(cur) && cur >= 0) {
              setVoiceCurrentTime(cur);
            }
            const dur = e.currentTarget.duration;
            if (Number.isFinite(dur) && dur > 0 && dur !== voiceDuration) {
              setVoiceDuration(dur);
            }
          }}
          onPlay={() => {
            setVoicePlaying(true);
            setVoiceError(false);
            fadeBgmVolume(DUCKED_BGM_VOLUME);
          }}
          onPause={() => {
            setVoicePlaying(false);
            fadeBgmVolume(NORMAL_BGM_VOLUME);
          }}
          onEnded={(e) => {
            const dur = e.currentTarget.duration;
            if (Number.isFinite(dur) && dur > 0) {
              setVoiceCurrentTime(dur);
              setVoiceDuration(dur);
            }
            setVoicePlaying(false);
            setVoiceFinished(true);
            fadeBgmVolume(NORMAL_BGM_VOLUME);
          }}
          onError={() => {
            setVoicePlaying(false);
            setVoiceFinished(true);
            setVoiceError(true);
            fadeBgmVolume(NORMAL_BGM_VOLUME);
          }}
        />
      )}

      {/* 3D Celestial WebGL Stage */}
      <UnifiedCosmicScene
        template={template}
        draft={draft}
        stage={stage}
        voicePlaying={voicePlaying}
        letterOpened={letterOpened}
        photos={photos}
        activeFormation={activeFormationId}
        onSceneInteract={handleSceneInteract}
        onPhotoClick={(idx) => setFocusedPhotoIdx(idx)}
      />

      {/* =================================================================== */}
      {/* TOP HEADER & 4-STEP GLASSMORPHISM JOURNEY TIMELINE BAR              */}
      {/* =================================================================== */}
      <header className="pointer-events-none absolute top-0 inset-x-0 z-40 flex flex-col gap-2 px-3 pt-3 sm:px-5 sm:pt-4">
        <div className="flex items-center justify-between gap-2">
          <div className="pointer-events-auto flex items-center gap-2">
            {!embedded && (
              <Link
                href="/cards"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#f5d78e]/30 bg-[#0d071c]/75 px-3.5 py-1.5 text-xs font-semibold text-[#fdf6e7] shadow-lg backdrop-blur-xl transition hover:border-[#f5d78e]/65 hover:bg-[#190e30]/85 focus-visible:outline-2 focus-visible:outline-[#f5d78e]"
              >
                <span>←</span>
                <span>Bộ sưu tập</span>
              </Link>
            )}
            <span className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-[#f5d78e]/20 bg-[#0d071c]/65 px-3.5 py-1.5 text-[11px] font-medium text-[#f5d78e]/90 backdrop-blur-xl">
              <span>{cosmicBg.icon}</span>
              <span>{cosmicBg.name}</span>
            </span>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            {bgmSrc && (
              <button
                type="button"
                onClick={toggleMusic}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#f5d78e]/35 bg-[#0d071c]/75 px-3.5 py-1.5 text-xs font-semibold text-[#f5d78e] shadow-lg backdrop-blur-xl transition hover:border-[#f5d78e]/70 hover:bg-[#190e30]/85 focus-visible:outline-2 focus-visible:outline-[#f5d78e] cursor-pointer"
              >
                <span>{musicPlaying ? "♫" : "♩"}</span>
                <span>{musicPlaying ? "Nhạc: Bật" : "Nhạc: Tắt"}</span>
              </button>
            )}
            {stage !== "INTRO" && (
              <button
                type="button"
                onClick={handleReplay}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-[#0d071c]/75 px-3.5 py-1.5 text-xs font-semibold text-[#fdf6e7] shadow-lg backdrop-blur-xl transition hover:border-[#f5d78e]/50 hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-[#f5d78e] cursor-pointer"
              >
                <span>↻</span>
                <span>Xem lại</span>
              </button>
            )}
          </div>
        </div>

        {/* 4-Step Interactive Celestial Timeline Bar */}
        <nav
          aria-label="Hành trình trải nghiệm thiệp 3D"
          className="pointer-events-auto mx-auto w-full max-w-2xl overflow-x-auto no-scrollbar"
        >
          <ol className="flex min-w-max items-center justify-between gap-1 rounded-full border border-[#f5d78e]/25 bg-[#0b0618]/75 px-2.5 py-1.5 shadow-[0_10px_32px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:px-4">
            {TIMELINE_STEPS.map((step, idx) => {
              const isCurrent = idx === activeStepIndex;
              const isCompleted = idx < activeStepIndex;
              return (
                <React.Fragment key={step.id}>
                  <li className="flex items-center">
                    <button
                      type="button"
                      onClick={() => handleTimelineClick(step, idx)}
                      aria-current={isCurrent ? "step" : undefined}
                      className={`group relative flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] sm:px-3 sm:py-1.5 sm:text-xs font-semibold transition-all duration-300 focus-visible:outline-2 focus-visible:outline-[#f5d78e] cursor-pointer ${
                        isCurrent
                          ? "border border-[#f5d78e]/70 bg-gradient-to-r from-[#881337]/90 via-[#9f1239]/85 to-[#b45309]/85 text-[#fffdf8] shadow-[0_0_18px_rgba(245,215,142,0.35)]"
                          : isCompleted
                          ? "border border-[#f5d78e]/25 bg-[#f5d78e]/10 text-[#f5d78e] hover:border-[#f5d78e]/55 hover:bg-[#f5d78e]/20"
                          : "border border-transparent text-white/65 hover:border-white/20 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                          isCurrent
                            ? "bg-[#f5d78e] text-[#2a0a18]"
                            : isCompleted
                            ? "bg-[#f5d78e]/25 text-[#f5d78e]"
                            : "bg-white/10 text-white/60 group-hover:bg-white/20 group-hover:text-white"
                        }`}
                      >
                        {isCompleted ? "✓" : step.stepNumber}
                      </span>
                      <span className="sm:hidden whitespace-nowrap">
                        {step.shortLabel}
                      </span>
                      <span className="hidden sm:inline whitespace-nowrap">
                        {step.label}
                      </span>
                    </button>
                  </li>
                  {idx < TIMELINE_STEPS.length - 1 && (
                    <li
                      aria-hidden="true"
                      className="flex-1 min-w-[14px] sm:min-w-[28px] px-0.5"
                    >
                      <div className="h-[1.5px] w-full overflow-hidden rounded-full bg-white/15">
                        <div
                          className={`h-full transition-all duration-500 ${
                            idx < activeStepIndex
                              ? "w-full bg-gradient-to-r from-[#f5d78e] to-[#f43f5e]"
                              : idx === activeStepIndex && stage === "TRANSITION"
                              ? "w-2/3 bg-[#f5d78e]"
                              : "w-0"
                          }`}
                        />
                      </div>
                    </li>
                  )}
                </React.Fragment>
              );
            })}
          </ol>
        </nav>
      </header>

      {/* =================================================================== */}
      {/* STAGE 0: CELESTIAL LUXURY INTRO MODAL & STARLIGHT SEAL              */}
      {/* =================================================================== */}
      {stage === "INTRO" && (
        <section className="pointer-events-auto relative z-20 flex min-h-[100svh] flex-col items-center justify-center px-4 pt-24 pb-8 text-center sm:px-6">
          <div
            className={`relative w-full max-w-lg rounded-[2rem] border border-[#f5d78e]/45 bg-gradient-to-b from-[#160d29]/90 via-[#0d071a]/92 to-[#190a1e]/90 p-7 sm:p-10 shadow-[0_28px_80px_rgba(0,0,0,0.85),0_0_45px_rgba(245,215,142,0.14)] backdrop-blur-2xl transition-all duration-300 animate-fade-in ${
              introUnsealing ? "scale-[1.03] brightness-125" : "scale-100"
            }`}
          >
            {/* Inner Gold Foil Hairline Frame & Corner Star Accents */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-3 rounded-[1.55rem] border border-[#f5d78e]/22"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-4 left-5 text-xs text-[#f5d78e]/70"
            >
              ✦
            </span>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-4 right-5 text-xs text-[#f5d78e]/70"
            >
              ✦
            </span>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-4 left-5 text-xs text-[#f5d78e]/70"
            >
              ✦
            </span>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-4 right-5 text-xs text-[#f5d78e]/70"
            >
              ✦
            </span>

            {/* Top Specular Shimmer Highlight */}
            <div
              aria-hidden="true"
              className="pointer-events-none mx-auto mb-5 h-px w-40 bg-gradient-to-r from-transparent via-[#f5d78e]/80 to-transparent"
            />

            <div className="relative space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#f5d78e]/40 bg-gradient-to-r from-[#881337]/45 via-[#4c1d95]/40 to-[#881337]/45 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-[#fde68a] shadow-inner">
                <span>✦</span>
                <span>Dành riêng cho {recipient}</span>
                <span>✦</span>
              </span>

              <h1 className="font-serif text-3xl sm:text-5xl font-bold leading-tight tracking-tight text-[#fffdf8] drop-shadow-[0_4px_18px_rgba(245,215,142,0.22)]">
                {title}
              </h1>

              <p className="mx-auto max-w-md font-serif text-sm sm:text-base leading-relaxed text-[#f5ebd6]/90 italic">
                &ldquo;{intro}&rdquo;
              </p>

              <div className="flex items-center justify-center gap-3 text-xs tracking-wider text-[#f5d78e]/75">
                <span className="h-px w-8 bg-[#f5d78e]/30" />
                <span>Từ: {sender}</span>
                <span className="h-px w-8 bg-[#f5d78e]/30" />
              </div>

              {/* Starlight Seal Interactive Button */}
              <div className="pt-3 flex flex-col items-center">
                <button
                  type="button"
                  onClick={handleStartExperience}
                  disabled={introUnsealing}
                  className="group relative inline-flex items-center gap-3 rounded-full border border-[#f5d78e]/75 bg-gradient-to-r from-[#881337] via-[#be123c] to-[#b45309] px-7 py-3.5 text-sm font-bold text-[#fffdf8] shadow-[0_0_32px_rgba(245,215,142,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] transition-all duration-300 hover:scale-105 hover:border-[#fde68a] hover:shadow-[0_0_48px_rgba(245,215,142,0.6)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f5d78e] active:scale-95 cursor-pointer"
                >
                  {/* Radial expanding wave rings on hover/focus/click */}
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute -inset-1.5 rounded-full border border-[#f5d78e]/45 transition-all duration-700 group-hover:scale-110 group-hover:opacity-0 group-focus-visible:scale-110 ${
                      introUnsealing
                        ? "scale-125 opacity-0"
                        : "animate-ping [animation-duration:2.6s]"
                    }`}
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-3 rounded-full border border-[#f5d78e]/20 opacity-0 transition-all duration-700 group-hover:scale-110 group-hover:opacity-100 group-focus-visible:opacity-100"
                  />

                  {/* Starlight Seal Emblem Core */}
                  <span className="relative flex h-7 w-7 items-center justify-center rounded-full border border-[#fde68a]/80 bg-gradient-to-br from-[#fde68a] to-[#d97706] text-[#4a0e23] shadow-[0_0_14px_rgba(253,230,138,0.8)] transition-transform duration-300 group-hover:rotate-45">
                    ✦
                  </span>
                  <span className="relative tracking-wide">
                    Chạm để mở thiệp 3D
                  </span>
                  <span
                    aria-hidden="true"
                    className="relative text-[#fde68a] transition-transform duration-300 group-hover:translate-x-0.5"
                  >
                    ✨
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* STAGE 1: 1-2 FLOATING OPENING MEMORY PHOTOS                         */}
      {/* =================================================================== */}
      {stage === "OPENING_PHOTOS" && (
        <section className="pointer-events-none absolute inset-x-0 bottom-7 z-20 flex flex-col items-center px-4 text-center">
          <div className="pointer-events-auto max-w-md space-y-2.5 rounded-3xl border border-[#f5d78e]/30 bg-[#0d071c]/75 px-6 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.75)] backdrop-blur-xl">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#f5d78e] font-semibold">
              ✦ Khoảnh khắc mở đầu · {recipient} ✦
            </p>
            <p className="font-serif text-sm text-[#fffdf8]/90 italic">
              &ldquo;{intro}&rdquo;
            </p>
            <button
              type="button"
              onClick={() => {
                if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
                setStage("TRANSITION");
              }}
              className="mt-1 inline-flex items-center gap-2 rounded-full border border-[#f5d78e]/40 bg-[#f5d78e]/15 px-5 py-1.5 text-xs font-semibold text-[#fdf6e7] transition hover:border-[#f5d78e]/75 hover:bg-[#f5d78e]/25 focus-visible:outline-2 focus-visible:outline-[#f5d78e] cursor-pointer"
            >
              <span>Tiếp tục đến Quà 3D & Giọng nói</span>
              <span>→</span>
            </button>
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* STAGE 2: STARDUST CONVERGENCE TRANSITION                            */}
      {/* =================================================================== */}
      {stage === "TRANSITION" && (
        <section className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-4">
          <div className="rounded-full border border-[#f5d78e]/35 bg-[#0d071c]/70 px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.26em] text-[#fde68a] shadow-[0_0_30px_rgba(245,215,142,0.25)] backdrop-blur-xl animate-pulse">
            ✦ Đang tiến vào tâm điểm ngân hà…
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* STAGE 3: 3D MODEL STAGE + REAL-TIME VOICE PROGRESS & WAVEFORM       */}
      {/* =================================================================== */}
      {stage === "MODEL_STAGE" && (
        <section className="pointer-events-none absolute inset-x-0 bottom-5 z-20 flex flex-col items-center px-4 text-center">
          <div className="pointer-events-auto w-full max-w-xl space-y-3.5 rounded-3xl border border-[#f5d78e]/35 bg-[#0d071c]/80 p-5 shadow-[0_24px_65px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#f5d78e]">
              <span>{curatedModel.icon}</span>
              <span>{curatedModel.name}</span>
            </div>

            {!voiceTriggered ? (
              <div className="space-y-3">
                <p className="text-xs sm:text-sm text-[#f5ebd6]/90">
                  Chạm trực tiếp vào <strong>Mô hình 3D</strong> phía trên (hoặc
                  nhấn nút bên dưới) để mở lời nhắn từ{" "}
                  <strong className="text-[#fde68a]">{sender}</strong>.
                </p>
                <button
                  type="button"
                  onClick={triggerModelVoiceAndTranscript}
                  className="inline-flex items-center gap-2 rounded-full border border-[#f5d78e]/60 bg-gradient-to-r from-[#881337] via-[#be123c] to-[#b45309] px-6 py-2.5 text-xs sm:text-sm font-bold text-[#fffdf8] shadow-[0_0_25px_rgba(245,215,142,0.35)] transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-[#f5d78e] cursor-pointer"
                >
                  <span>{voiceSrc ? "🎙️" : "✨"}</span>
                  <span>
                    {voiceSrc
                      ? "Chạm để nghe giọng nói & lời nhắn"
                      : "Chạm để mở lời nhắn tâm tình"}
                  </span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Voice Player Header + Real-Time Progress Bar OR Text-Only Header */}
                {voiceSrc && !voiceError ? (
                  <div className="rounded-2xl border border-[#f5d78e]/20 bg-white/[0.04] px-3.5 py-2.5 space-y-2">
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="font-semibold text-[#fde68a] flex items-center gap-1.5">
                        <span>🎙️</span>
                        <span>
                          {voicePlaying
                            ? "Đang phát giọng nói (Nhạc nền đã giảm nhỏ)"
                            : voiceFinished
                            ? `Đã phát xong lời nhắn từ ${sender}`
                            : `Tạm dừng lời nhắn từ ${sender}`}
                        </span>
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-[#f5d78e] tabular-nums">
                        {formatAudioTime(voiceCurrentTime)}
                        {hasValidVoiceDuration
                          ? ` / ${formatAudioTime(voiceDuration)}`
                          : ""}
                      </span>
                    </div>

                    {/* Real-Time Progress Bar */}
                    <div
                      role="progressbar"
                      aria-label="Tiến độ đoạn ghi âm giọng nói"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(voiceProgressPercent)}
                      className="h-1.5 w-full overflow-hidden rounded-full bg-white/15"
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#f5d78e] via-[#fb7185] to-[#f59e0b] transition-all duration-150"
                        style={{ width: `${voiceProgressPercent}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-[#fde68a]">
                    <span>✦ Lời nhắn tâm tình từ {sender} ✦</span>
                  </div>
                )}

                {/* Animated Waveform + Typewriter Subtitle Box */}
                <div className="flex items-center gap-3 rounded-2xl border border-[#f5d78e]/20 bg-[#160d29]/75 px-4 py-3 text-left">
                  {/* Animated Waveform (animates only when voicePlaying is true) */}
                  <div
                    aria-hidden="true"
                    className="flex shrink-0 items-center gap-0.5 h-8 px-1"
                  >
                    {WAVEFORM_BAR_HEIGHTS.map((h, i) => (
                      <span
                        key={i}
                        className={`w-1 rounded-full transition-all duration-300 ${
                          voicePlaying
                            ? "bg-gradient-to-t from-[#be123c] to-[#fde68a] animate-pulse"
                            : "bg-[#f5d78e]/30"
                        }`}
                        style={{
                          height: voicePlaying
                            ? `${Math.max(24, h)}%`
                            : "26%",
                          animationDelay: `${(i % 5) * 90}ms`,
                        }}
                      />
                    ))}
                  </div>

                  {/* Character-by-character Typewriter Subtitle */}
                  <div className="min-h-[2.75rem] flex-1 font-serif text-sm sm:text-base italic leading-relaxed text-[#fffdf8] select-text">
                    &ldquo;{typedVoiceText}
                    {!voiceFinished && (
                      <span className="ml-0.5 inline-block animate-pulse text-[#f5d78e]">
                        |
                      </span>
                    )}
                    &rdquo;
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-0.5">
                  <button
                    type="button"
                    onClick={triggerModelVoiceAndTranscript}
                    className="rounded-full border border-[#f5d78e]/35 bg-white/10 px-4 py-2 text-xs font-semibold text-[#fdf6e7] transition hover:border-[#f5d78e]/65 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-[#f5d78e] cursor-pointer"
                  >
                    ↻ {voiceSrc ? "Nghe lại giọng nói" : "Xem lại hiệu ứng chữ"}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateToStage("ENVELOPE_LETTER")}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#f5d78e]/60 bg-gradient-to-r from-[#881337] via-[#be123c] to-[#b45309] px-6 py-2 text-xs sm:text-sm font-bold text-[#fffdf8] shadow-lg transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-[#f5d78e] cursor-pointer"
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
      {/* STAGE 4: 3D ENVELOPE, LIVE 8-FORMATION SWITCHER & FINE-ART LETTER   */}
      {/* =================================================================== */}
      {stage === "ENVELOPE_LETTER" && (
        <>
          {/* Bottom Control Deck & Live 8-Formation Switcher (when letter modal is hidden) */}
          <div className="pointer-events-none absolute bottom-4 inset-x-0 z-30 flex flex-col items-center gap-2.5 px-3 sm:px-5">
            {!showLetterSheet && (
              <div
                role="toolbar"
                aria-label="Chọn đội hình trình diễn ảnh kỷ niệm 3D"
                className="pointer-events-auto w-full max-w-3xl overflow-x-auto no-scrollbar rounded-2xl border border-[#f5d78e]/30 bg-[#0b0618]/80 px-2.5 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.75)] backdrop-blur-xl"
              >
                <div className="flex min-w-max items-center gap-1.5">
                  <span className="px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#f5d78e]/85">
                    ✦ Đội hình 3D:
                  </span>
                  {PHOTO_FORMATIONS.map((fmt, idx) => {
                    const isSelected = activeFormationId === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        ref={(el) => {
                          formationBtnRefs.current[idx] = el;
                        }}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setActiveFormationId(fmt.id)}
                        onKeyDown={(e) => handleFormationKeyDown(e, idx)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[#f5d78e] cursor-pointer ${
                          isSelected
                            ? "border border-[#f5d78e]/80 bg-gradient-to-r from-[#881337] to-[#b45309] text-[#fffdf8] shadow-[0_0_16px_rgba(245,215,142,0.4)]"
                            : "border border-white/10 bg-white/[0.06] text-white/80 hover:border-[#f5d78e]/40 hover:bg-white/15 hover:text-white"
                        }`}
                      >
                        <span>{fmt.icon}</span>
                        <span>{fmt.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (letterOpened) {
                    setShowLetterSheet(false);
                    setLetterOpened(false);
                  } else {
                    setLetterOpened(true);
                  }
                }}
                className="rounded-full border border-[#f5d78e]/40 bg-[#0d071c]/80 px-4 py-2 text-xs sm:text-sm font-bold text-[#fde68a] shadow-lg backdrop-blur-xl transition hover:border-[#f5d78e]/70 hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-[#f5d78e] cursor-pointer"
              >
                {letterOpened
                  ? "✉️ Đóng nắp phong thư 3D"
                  : "💌 Mở nắp phong thư 3D"}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!showLetterSheet) {
                    setLetterOpened(true);
                    setShowLetterSheet(true);
                  } else {
                    setShowLetterSheet(false);
                  }
                }}
                className="rounded-full border border-[#f5d78e]/65 bg-gradient-to-r from-[#881337] via-[#be123c] to-[#b45309] px-5 py-2 text-xs sm:text-sm font-bold text-[#fffdf8] shadow-xl transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-[#f5d78e] cursor-pointer"
              >
                {showLetterSheet
                  ? `🌌 Ẩn thư để ngắm ${activeFormationPreset.name}`
                  : `📜 Đọc toàn văn bức thư (${envelopeLabel})`}
              </button>

              {voiceSrc && (
                <button
                  type="button"
                  onClick={triggerModelVoiceAndTranscript}
                  className="rounded-full border border-white/25 bg-[#0d071c]/80 px-4 py-2 text-xs font-semibold text-[#fde68a] backdrop-blur-xl transition hover:border-[#f5d78e]/50 hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-[#f5d78e] cursor-pointer"
                >
                  🎙️{" "}
                  {voicePlaying ? "Đang phát giọng nói..." : "Nghe lại ghi âm"}
                </button>
              )}
            </div>
          </div>

          {/* =============================================================== */}
          {/* FINE-ART STATIONERY LETTER SHEET MODAL                          */}
          {/* =============================================================== */}
          {showLetterSheet && (
            <section
              aria-label="Lá thư tâm tình"
              onClick={() => setShowLetterSheet(false)}
              className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center px-4 pt-24 pb-20 sm:px-6"
            >
              <article
                onClick={(e) => e.stopPropagation()}
                style={{
                  backgroundImage:
                    "radial-gradient(rgba(212, 175, 55, 0.08) 1px, transparent 0), linear-gradient(180deg, #fffdf8 0%, #fbf5e8 52%, #f4e6d0 100%)",
                  backgroundSize: "18px 18px, 100% 100%",
                }}
                className="relative max-h-[70svh] w-full max-w-lg overflow-y-auto rounded-[1.75rem] border-2 border-[#d4af37]/75 p-6 sm:p-8 text-[#3c2415] shadow-[0_28px_80px_rgba(0,0,0,0.82),0_0_0_1px_rgba(255,253,248,0.6)_inset] animate-fade-in select-text"
              >
                {/* Inner Double Gold & Crimson Frame (pointer-events-none) */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-2.5 rounded-[1.35rem] border border-[#9f1239]/25"
                />

                {/* Vintage SVG Corner Flourishes (pointer-events-none) */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 36 36"
                  className="pointer-events-none absolute top-3.5 left-3.5 h-6 w-6 text-[#b45309]/70"
                >
                  <path
                    d="M2 26 V6 Q2 2 6 2 H26 M6 14 Q6 6 14 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 36 36"
                  className="pointer-events-none absolute top-3.5 right-3.5 h-6 w-6 -scale-x-100 text-[#b45309]/70"
                >
                  <path
                    d="M2 26 V6 Q2 2 6 2 H26 M6 14 Q6 6 14 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 36 36"
                  className="pointer-events-none absolute bottom-3.5 left-3.5 h-6 w-6 -scale-y-100 text-[#b45309]/70"
                >
                  <path
                    d="M2 26 V6 Q2 2 6 2 H26 M6 14 Q6 6 14 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 36 36"
                  className="pointer-events-none absolute bottom-3.5 right-3.5 h-6 w-6 -scale-x-100 -scale-y-100 text-[#b45309]/70"
                >
                  <path
                    d="M2 26 V6 Q2 2 6 2 H26 M6 14 Q6 6 14 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>

                {/* Close button */}
                <button
                  ref={letterCloseBtnRef}
                  type="button"
                  onClick={() => setShowLetterSheet(false)}
                  aria-label="Thu gọn lá thư để ngắm ảnh xoay quanh"
                  className="relative z-10 float-right ml-3 flex h-8 w-8 items-center justify-center rounded-full border border-[#b45309]/30 bg-[#f4e6d0] text-lg font-bold text-[#5a2328] transition hover:bg-[#e9d5b5] focus-visible:outline-2 focus-visible:outline-[#881337] cursor-pointer"
                >
                  ×
                </button>

                {/* Header with Embossed Crimson & Gold Wax Seal */}
                <div className="relative flex items-center gap-3.5 border-b border-[#d4af37]/35 pb-4">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[#f5d78e] bg-gradient-to-br from-[#9f1239] via-[#881337] to-[#4c0519] text-[#fde68a] shadow-[0_4px_12px_rgba(136,19,55,0.45),inset_0_0_0_3px_rgba(245,215,142,0.25)]"
                  >
                    <span className="text-base font-bold">♥</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9f1239]">
                      {envelopeLabel} · Gửi {recipient}
                    </p>
                    <h2 className="mt-0.5 font-serif text-2xl sm:text-3xl font-bold text-[#4a1525]">
                      {letterTitle}
                    </h2>
                  </div>
                </div>

                {/* Embedded Voice Player inside the Letter */}
                {(voiceSrc || voiceTranscript) && (
                  <div className="my-4 rounded-2xl border border-[#d4af37]/45 bg-[#fff9ee]/90 p-3.5 text-xs text-[#5b2333] shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold flex items-center gap-1.5 text-[#7f1d1d]">
                        <span>🎙️ Lời nhắn từ {sender}</span>
                        {voiceSrc && hasValidVoiceDuration && (
                          <span className="font-mono text-[11px] font-normal text-[#9a3412]">
                            ({formatAudioTime(voiceCurrentTime)} /{" "}
                            {formatAudioTime(voiceDuration)})
                          </span>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={triggerModelVoiceAndTranscript}
                        className="rounded-full bg-gradient-to-r from-[#881337] to-[#b45309] px-3.5 py-1 text-[11px] font-bold text-[#fffdf8] shadow-xs transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-[#881337] cursor-pointer"
                      >
                        {voicePlaying
                          ? "Đang phát..."
                          : voiceSrc
                          ? "▶ Phát giọng nói"
                          : "▶ Chạy lời nhắn"}
                      </button>
                    </div>
                    {voiceTranscript && (
                      <p className="mt-2 font-serif italic text-sm text-[#5c2230] select-text">
                        &ldquo;{typedVoiceText || voiceTranscript}&rdquo;
                      </p>
                    )}
                  </div>
                )}

                {/* Main Selectable Letter Body */}
                <div className="my-5 whitespace-pre-wrap font-serif text-base leading-[1.85] text-[#351e10] select-text">
                  {message}
                </div>

                {/* Attached Memory Photo Thumbnails */}
                {photos.length > 0 && (
                  <div className="my-4 grid grid-cols-3 gap-2.5">
                    {photos.slice(0, 6).map((src, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFocusedPhotoIdx(idx)}
                        className="overflow-hidden rounded-xl border border-[#d4af37]/45 bg-white p-1 shadow-xs transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-[#881337] cursor-pointer"
                      >
                        <img
                          src={src}
                          alt={`Ảnh kỷ niệm ${idx + 1}`}
                          className="aspect-square w-full rounded-lg object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Signature Footer */}
                <footer className="mt-5 border-t border-[#d4af37]/35 pt-4 text-right select-text">
                  <p className="text-xs italic text-[#6e4c36]">{closing}</p>
                  <strong className="mt-1 block font-serif text-lg text-[#881337]">
                    — {sender} ✦
                  </strong>
                </footer>
              </article>
            </section>
          )}
        </>
      )}

      {/* Lightbox for inspecting memory photos */}
      {focusedPhotoIdx !== null && photos[focusedPhotoIdx] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Ảnh kỷ niệm ${focusedPhotoIdx + 1}`}
          onClick={() => setFocusedPhotoIdx(null)}
          className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full rounded-3xl border border-[#f5d78e]/40 bg-[#fffdf8] p-3 shadow-2xl"
          >
            <img
              src={photos[focusedPhotoIdx]}
              alt={`Kỷ niệm ${focusedPhotoIdx + 1}`}
              className="max-h-[70svh] w-full rounded-2xl object-contain bg-black/5"
            />
            <div className="mt-2.5 flex items-center justify-between px-2 py-1 text-xs font-semibold text-[#3c2415]">
              <span>
                Ảnh kỷ niệm {focusedPhotoIdx + 1} / {photos.length}
              </span>
              <button
                type="button"
                onClick={() => setFocusedPhotoIdx(null)}
                className="rounded-full bg-[#881337] px-4 py-1.5 text-white hover:bg-[#9f1239] cursor-pointer"
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
