"use client";

import React, { use, useRef, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ExperienceCanvas } from '@/components/experience/ExperienceCanvas';
import { CandleScene } from '@/components/experience/scenes/CandleScene';
import { ExperienceHUD } from '@/components/experience/ui/ExperienceHUD';
import { ExperienceLoadingScreen, ExperienceErrorScreen } from '@/components/experience/ui/ExperienceScreens';
import { usePressAndHold } from '@/hooks/usePressAndHold';
import { useExperienceData } from '@/hooks/useExperienceData';
import { useExperienceAudio } from '@/hooks/useExperienceAudio';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ExperiencePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();

  // ─── Phase 8: Real API fetch with graceful dev fallback ───────────────────
  const { data, isLoading, error } = useExperienceData(resolvedParams.slug);

  // ─── Query param overrides (for preview / dev links) ─────────────────────
  const recipient = searchParams.get('to') ?? data?.recipientName ?? 'Bạn';
  const sender = searchParams.get('from') ?? data?.senderName;
  const message = searchParams.get('msg') ?? data?.message ?? '';

  // ─── Phase 7: Web Audio API engine ────────────────────────────────────────
  const { playHoldTick, playIgnite, startBGM } = useExperienceAudio();
  const lastTickProgress = useRef(0);
  const hasIgnited = useRef(false);
  const audioUnlocked = useRef(false);

  // Unlock AudioContext + start BGM on first pointer interaction
  const handleFirstInteraction = useCallback(() => {
    if (audioUnlocked.current) return;
    audioUnlocked.current = true;
    startBGM();
  }, [startBGM]);

  // On hold complete — play the ignite burst once
  const handleComplete = useCallback(() => {
    if (!hasIgnited.current) {
      hasIgnited.current = true;
      playIgnite();
    }
  }, [playIgnite]);

  // ─── Phase 2: Press-and-hold interaction management ───────────────────────
  const holdState = usePressAndHold({
    duration: 2500,
    decaySpeed: 1.8,
    onComplete: handleComplete,
  });

  // ─── Phase 7: Throttled sparkle tick sounds while holding ─────────────────
  const { progress, isHolding } = holdState;
  useEffect(() => {
    if (isHolding && progress - lastTickProgress.current > 0.08) {
      lastTickProgress.current = progress;
      playHoldTick(progress);
    }
    if (!isHolding && progress === 0) {
      lastTickProgress.current = 0;
    }
  }, [progress, isHolding, playHoldTick]);

  // ─── Loading & Error States (Phase 9) ─────────────────────────────────────
  if (isLoading) {
    return <ExperienceLoadingScreen />;
  }

  if (error && !data) {
    return <ExperienceErrorScreen message={error} onRetry={() => window.location.reload()} />;
  }

  const experienceData = data!;

  return (
    <main
      className="relative h-screen w-screen overflow-hidden bg-black select-none"
      onPointerDown={handleFirstInteraction}
      onTouchStart={handleFirstInteraction}
    >
      {/* 3D Canvas */}
      <ExperienceCanvas>
        <CandleScene
          holdProgress={holdState.progress}
          isCompleted={holdState.isCompleted}
          recipientName={recipient}
          message={message}
          senderName={sender}
        />
      </ExperienceCanvas>

      {/* Minimal Overlay HUD */}
      <ExperienceHUD
        data={{ ...experienceData, recipientName: recipient, senderName: sender ?? undefined, message }}
        holdState={holdState}
      />
    </main>
  );
}
