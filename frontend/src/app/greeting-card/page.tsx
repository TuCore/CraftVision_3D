"use client";

import Image from "next/image";
import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Heart, MessageSquare, Sparkles, Wind, X } from "lucide-react";
import { AudioPlayer, AudioPlayerHandle } from "@/components/greeting-card/AudioPlayer";
import { EnvelopeUnfold } from "@/components/greeting-card/EnvelopeUnfold";
import { SceneContainer } from "@/components/greeting-card/scene/SceneContainer";

interface GreetingData {
  title: string;
  receiverName: string;
  senderName: string;
  message: string;
  photoUrl: string;
  price: number;
  templateId: number;
}

interface StoredGreeting {
  title?: string;
  receiverName?: string;
  senderName?: string;
  message?: string;
  image?: string;
  price?: number;
  templateId?: number;
}

const DEFAULT_GREETING: GreetingData = {
  title: "Điều ước sinh nhật dệt từ ánh sao",
  receiverName: "Bạn thân mến",
  senderName: "Người thương",
  message: "Chúc bạn một tuổi mới rực rỡ, bình an và luôn được bao quanh bởi thật nhiều yêu thương. Hãy ước một điều thật đẹp nhé!",
  photoUrl: "",
  price: 49_999,
  templateId: 17,
};

function GreetingCardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const audioRef = useRef<AudioPlayerHandle>(null);
  const finaleTimerRef = useRef<number | null>(null);
  const [sceneVisible, setSceneVisible] = useState(false);
  const [envelopeVisible, setEnvelopeVisible] = useState(true);
  const [isInteractive, setIsInteractive] = useState(false);
  const [candleBlownOut, setCandleBlownOut] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [data, setData] = useState<GreetingData>(DEFAULT_GREETING);

  useEffect(() => {
    let saved: StoredGreeting | null = null;
    try {
      const stored = sessionStorage.getItem("preview_greeting");
      if (stored) saved = JSON.parse(stored) as StoredGreeting;
    } catch {
      saved = null;
    }

    setData({
      title: searchParams.get("title") || saved?.title || DEFAULT_GREETING.title,
      receiverName: searchParams.get("receiver") || saved?.receiverName || DEFAULT_GREETING.receiverName,
      senderName: searchParams.get("sender") || saved?.senderName || DEFAULT_GREETING.senderName,
      message: searchParams.get("msg") || saved?.message || DEFAULT_GREETING.message,
      photoUrl: searchParams.get("img") || saved?.image || "",
      price: saved?.price || DEFAULT_GREETING.price,
      templateId: saved?.templateId || DEFAULT_GREETING.templateId,
    });
  }, [searchParams]);

  useEffect(() => () => {
    if (finaleTimerRef.current !== null) window.clearTimeout(finaleTimerRef.current);
  }, []);

  const handleBack = () => {
    if (typeof window !== "undefined") {
      if (window.opener) {
        window.close();
      } else if (window.history.length > 1) {
        router.back();
      } else {
        router.push("/home");
      }
    }
  };

  const handleBlowOut = () => {
    if (candleBlownOut) return;
    setCandleBlownOut(true);
    finaleTimerRef.current = window.setTimeout(() => setShowMessageModal(true), 1_250);
  };

  const handleInteractive = useCallback(() => setIsInteractive(true), []);

  return (
    <main className="relative h-screen w-full overflow-hidden bg-[#100714]">
      <AudioPlayer ref={audioRef} />

      {sceneVisible && (
        <div className="absolute inset-0 z-0 animate-in fade-in duration-700">
          <SceneContainer
            customImage={data.photoUrl}
            receiverName={data.receiverName}
            candleBlownOut={candleBlownOut}
            onInteractive={handleInteractive}
          />
        </div>
      )}

      {envelopeVisible && (
        <EnvelopeUnfold
          onOpening={() => audioRef.current?.start()}
          onOpen={() => setSceneVisible(true)}
          onComplete={() => setEnvelopeVisible(false)}
          receiverName={data.receiverName}
          senderName={data.senderName}
          message={data.message}
          photoUrl={data.photoUrl}
        />
      )}

      {sceneVisible && (
        <>
          <nav className="absolute left-4 top-4 z-30 flex max-w-[calc(100%-8rem)] flex-wrap items-center gap-2 sm:left-6 sm:top-6">
            <button
              type="button"
              onClick={handleBack}
              className="flex min-h-11 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Trở về
            </button>
            <button
              type="button"
              onClick={() => setShowMessageModal(true)}
              className="flex min-h-11 items-center gap-1.5 rounded-full border border-rose-300/30 bg-rose-500/15 px-4 py-2 text-xs font-semibold text-rose-100 backdrop-blur-md transition hover:bg-rose-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
            >
              <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" /> Xem lời chúc
            </button>
          </nav>

          <div className="pointer-events-none absolute bottom-4 left-4 z-20 hidden max-w-xs text-left sm:block">
            <p className="font-serif text-lg text-white/90 drop-shadow-[0_0_12px_rgba(255,255,255,.35)]">{data.title}</p>
            <p className="mt-0.5 text-[11px] italic text-white/60">Dành tặng {data.receiverName} · Từ {data.senderName}</p>
          </div>

          {isInteractive && (
            <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleBlowOut}
                disabled={candleBlownOut}
                className="group flex min-h-12 items-center gap-2 whitespace-nowrap rounded-full border border-amber-200/35 bg-white/10 px-5 py-3 text-sm font-bold text-white shadow-[0_0_28px_rgba(251,191,36,.22)] backdrop-blur-md transition hover:scale-105 hover:bg-amber-300/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:cursor-default disabled:border-white/15 disabled:text-white/65 disabled:hover:scale-100"
              >
                {candleBlownOut ? <Sparkles className="h-5 w-5 text-amber-300" /> : <Wind className="h-5 w-5 text-cyan-100 transition group-hover:translate-x-0.5" />}
                {candleBlownOut ? "Your wish is in the stars" : "Make a Wish & Blow Candle"}
              </button>
              {!candleBlownOut && (
                <span className="text-[10px] tracking-wide text-white/55">Drag to look around · Tap a memory to inspect</span>
              )}
            </div>
          )}
        </>
      )}

      {showMessageModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="birthday-letter-title"
          className="absolute inset-0 z-40 flex items-end justify-center bg-black/55 p-4 pb-6 backdrop-blur-sm sm:items-center"
          onClick={() => setShowMessageModal(false)}
        >
          <article
            className="relative w-full max-w-lg animate-in slide-in-from-bottom-10 rounded-[2rem] border border-white/25 bg-gradient-to-br from-white/95 to-rose-50/95 p-6 text-center shadow-2xl duration-500 sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowMessageModal(false)}
              aria-label="Close birthday letter"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-stone-500 transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
              <Heart className="h-7 w-7 fill-rose-500" aria-hidden="true" />
            </div>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.32em] text-amber-600">A wish from the heart</p>
            <h2 id="birthday-letter-title" className="mt-2 font-serif text-2xl font-bold text-stone-900">Dành riêng cho {data.receiverName}</h2>
            {data.photoUrl && (
              <div className="relative mx-auto mt-5 h-32 w-32 rotate-[-2deg] overflow-hidden rounded-sm border-[8px] border-white shadow-lg">
                <Image src={data.photoUrl} alt="Birthday memory" fill sizes="128px" unoptimized className="object-cover" />
              </div>
            )}
            <p className="mx-auto mt-5 max-w-md whitespace-pre-wrap font-serif text-base italic leading-relaxed text-stone-700">“{data.message}”</p>
            <p className="mt-5 font-serif text-sm font-semibold text-rose-700">With all my love, {data.senderName}</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowMessageModal(false)}
                className="min-h-11 flex-1 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 transition hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
              >
                Tiếp tục khám phá
              </button>
              <button
                type="button"
                onClick={handleBack}
                className="btn-hero min-h-11 flex-1 rounded-xl text-xs font-bold text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Trở về màn hình trước
              </button>
            </div>
          </article>
        </div>
      )}
    </main>
  );
}

export default function GreetingCardPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#100714] text-white">Đang tải thông điệp...</div>}>
      <GreetingCardContent />
    </Suspense>
  );
}
