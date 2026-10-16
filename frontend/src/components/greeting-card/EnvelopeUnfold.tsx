"use client";

import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { CakeSlice, Sparkles } from "lucide-react";
import gsap from "gsap";

interface EnvelopeUnfoldProps {
  onOpening?: () => void;
  onOpen: () => void;
  onComplete?: () => void;
  receiverName?: string;
  senderName?: string;
  message?: string;
  photoUrl?: string;
}

const DEBRIS = Array.from({ length: 16 }, (_, index) => ({
  angle: (index / 16) * Math.PI * 2,
  distance: 48 + (index % 4) * 11,
  size: 3 + (index % 3),
}));

const FAIRY_DUST = Array.from({ length: 24 }, (_, index) => ({
  left: `${8 + ((index * 37) % 84)}%`,
  delay: (index % 6) * 0.035,
  x: ((index * 19) % 50) - 25,
  y: -75 - ((index * 31) % 145),
}));

export function EnvelopeUnfold({
  onOpening,
  onOpen,
  onComplete,
  receiverName = "Bạn",
  senderName = "Người thương",
  message = "Một món quà bất ngờ đang chờ đón...",
  photoUrl,
}: EnvelopeUnfoldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const envelopeRef = useRef<HTMLButtonElement>(null);
  const flapRef = useRef<HTMLDivElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.to(envelopeRef.current, {
        y: 6,
        rotationZ: 0.6,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(sealRef.current, {
        scale: 1.055,
        filter: "drop-shadow(0 0 18px rgba(251, 191, 36, 0.82))",
        duration: 1.15,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, containerRef);

    return () => {
      timelineRef.current?.kill();
      context.revert();
    };
  }, []);

  const handleOpen = useCallback(() => {
    if (isOpen) return;
    setIsOpen(true);
    onOpening?.();
    gsap.killTweensOf([envelopeRef.current, sealRef.current]);

    const timeline = gsap.timeline();
    timelineRef.current = timeline;

    timeline
      .to(sealRef.current, {
        scale: 1.3,
        rotation: -8,
        duration: 0.09,
        ease: "power2.out",
      }, 0)
      .to(sealRef.current, {
        scale: 0,
        rotation: 24,
        opacity: 0,
        duration: 0.21,
        ease: "power3.in",
      }, 0.09)
      .to(".seal-debris", {
        x: (index) => Math.cos(DEBRIS[index].angle) * DEBRIS[index].distance,
        y: (index) => Math.sin(DEBRIS[index].angle) * DEBRIS[index].distance,
        rotation: (index) => index * 47,
        scale: 0,
        opacity: 0,
        duration: 0.42,
        stagger: 0.006,
        ease: "power2.out",
      }, 0.02)
      .to(flapRef.current, {
        rotateX: 180,
        duration: 0.5,
        transformOrigin: "top center",
        ease: "power3.inOut",
      }, 0.3)
      .to(letterRef.current, {
        y: -38,
        scale: 1.035,
        duration: 0.32,
        ease: "power2.out",
      }, 0.68)
      .to(lightRef.current, {
        opacity: 1,
        scaleY: 1.45,
        duration: 0.22,
        ease: "power2.out",
      }, 0.78)
      .to(".fairy-dust", {
        x: (index) => FAIRY_DUST[index].x,
        y: (index) => FAIRY_DUST[index].y,
        scale: (index) => 0.5 + (index % 4) * 0.28,
        opacity: 0,
        duration: 0.75,
        delay: (index) => FAIRY_DUST[index].delay,
        ease: "power1.out",
      }, 0.78)
      .call(onOpen, [], 0.98)
      .to(letterRef.current, {
        y: -120,
        rotateX: 72,
        scale: 1.65,
        opacity: 0,
        duration: 0.58,
        ease: "power2.inOut",
      }, 0.98)
      .to(envelopeRef.current, {
        scaleX: 1.35,
        scaleY: 0.35,
        opacity: 0,
        duration: 0.58,
        ease: "power2.inOut",
      }, 1.02)
      .to(containerRef.current, {
        opacity: 0,
        duration: 0.65,
        ease: "power2.out",
      }, 1.0)
      .call(() => onComplete?.(), [], 1.66);
  }, [isOpen, onComplete, onOpen, onOpening]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-40 flex items-center justify-center overflow-hidden bg-[#100714] px-5"
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 42%, rgba(136,36,72,.28), transparent 38%), radial-gradient(circle at 18% 18%, rgba(251,191,36,.10) 0 1px, transparent 2px), radial-gradient(circle at 78% 30%, rgba(255,255,255,.12) 0 1px, transparent 2px)",
        backgroundSize: "auto, 72px 72px, 95px 95px",
      }}
    >
      <div
        ref={lightRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[70vh] w-56 -translate-x-1/2 -translate-y-[76%] origin-bottom bg-gradient-to-t from-amber-200/80 via-amber-300/25 to-transparent opacity-0 blur-2xl"
        style={{ clipPath: "polygon(44% 100%, 56% 100%, 100% 0, 0 0)" }}
      />

      <button
        ref={envelopeRef}
        type="button"
        onClick={handleOpen}
        disabled={isOpen}
        aria-label="Open your birthday greeting card"
        className="group relative aspect-[1.48/1] w-[min(88vw,25rem)] cursor-pointer border-0 bg-transparent p-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:cursor-default"
        style={{ perspective: 1200, transformStyle: "preserve-3d" }}
      >
        <div
          ref={letterRef}
          className="absolute inset-x-[7%] top-[5%] bottom-[7%] overflow-hidden rounded-md border border-amber-200/70 bg-gradient-to-b from-[#fffdf7] to-[#fff3df] p-4 text-center shadow-[0_0_30px_rgba(251,191,36,.25)]"
          style={{ zIndex: 10, transformStyle: "preserve-3d" }}
        >
          <div className="flex h-full flex-col items-center justify-between">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-amber-600">A little birthday magic</span>
              <h2 className="mt-1 font-serif text-lg font-bold text-rose-900">For {receiverName}</h2>
            </div>
            {photoUrl ? (
              <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-amber-300/70 shadow-md">
                <Image src={photoUrl} alt="Birthday memory" fill sizes="56px" unoptimized className="object-cover" />
              </div>
            ) : (
              <Sparkles className="h-8 w-8 text-amber-500" aria-hidden="true" />
            )}
            <p className="line-clamp-2 max-w-[90%] font-serif text-[11px] italic leading-relaxed text-stone-700">“{message}”</p>
            <p className="text-[10px] font-semibold tracking-wide text-rose-700">With love, {senderName}</p>
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-0 rounded-xl border border-amber-300/45 shadow-[0_24px_80px_rgba(0,0,0,.55),inset_0_0_45px_rgba(255,255,255,.07)]"
          style={{
            zIndex: 20,
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 64%, 0 100%)",
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(255,255,255,.10), transparent 20%), repeating-linear-gradient(125deg, rgba(255,255,255,.025) 0 1px, transparent 1px 4px), linear-gradient(145deg, #7f1d3f, #3e1027)",
          }}
        />

        <div
          ref={flapRef}
          className="pointer-events-none absolute inset-x-0 top-0 h-[58%] rounded-t-xl border-t border-amber-300/55 shadow-[inset_0_2px_8px_rgba(255,255,255,.09)]"
          style={{
            zIndex: 30,
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            backfaceVisibility: "hidden",
            backgroundImage:
              "repeating-linear-gradient(35deg, rgba(255,255,255,.025) 0 1px, transparent 1px 4px), linear-gradient(155deg, #9f284b, #5b1733)",
          }}
        />

        <div
          ref={sealRef}
          className="pointer-events-none absolute left-1/2 top-[47%] z-40 flex h-[4.5rem] w-[4.5rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-red-300/35 bg-[radial-gradient(circle_at_35%_30%,#d84b56,#8b132c_58%,#510819)] text-amber-200 shadow-[inset_0_0_0_5px_rgba(255,255,255,.05),inset_0_0_12px_rgba(0,0,0,.45)]"
          style={{ filter: "drop-shadow(0 0 12px rgba(251,191,36,.6))" }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-300/45">
            <CakeSlice className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
          </div>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-[47%] z-40 h-0 w-0">
          {DEBRIS.map((piece, index) => (
            <span
              key={index}
              className="seal-debris absolute left-0 top-0 rounded-sm bg-gradient-to-br from-red-400 to-red-950"
              style={{ width: piece.size, height: piece.size + 1 }}
            />
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-[10%] top-[25%] z-30 h-[52%] overflow-visible">
          {FAIRY_DUST.map((dust, index) => (
            <span
              key={index}
              className="fairy-dust absolute bottom-0 h-1.5 w-1.5 rounded-full bg-amber-100 opacity-90 shadow-[0_0_8px_2px_rgba(251,191,36,.8)]"
              style={{ left: dust.left }}
            />
          ))}
        </div>

        {!isOpen && (
          <span className="absolute inset-x-[-1rem] top-[calc(100%+2.25rem)] flex items-center justify-center gap-2 text-center text-sm font-medium tracking-wide text-amber-100/90 drop-shadow-[0_0_10px_rgba(251,191,36,.45)]">
            <Sparkles className="h-4 w-4 animate-pulse text-amber-300" aria-hidden="true" />
            Tap gently to unveil your birthday wish ✨
          </span>
        )}
      </button>
    </div>
  );
}
