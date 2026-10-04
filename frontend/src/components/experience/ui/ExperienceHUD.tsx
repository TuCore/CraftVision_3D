"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Compass } from 'lucide-react';
import { ExperienceData } from '@/types/experience';
import { UsePressAndHoldReturn } from '@/hooks/usePressAndHold';
import { HoldToLightButton } from './HoldToLightButton';

interface ExperienceHUDProps {
  data: ExperienceData;
  holdState?: UsePressAndHoldReturn;
}

export function ExperienceHUD({ data, holdState }: ExperienceHUDProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-6">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/shop"
          className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại</span>
        </Link>

        <div className="flex items-center gap-2 rounded-full border border-rose-300/30 bg-rose-950/40 px-4 py-2 text-xs font-medium text-rose-200 backdrop-blur-md shadow-lg">
          <Sparkles className="h-3.5 w-3.5 text-rose-300 animate-pulse" />
          <span className="font-semibold text-white">{data.title}</span>
          <span className="text-white/40">•</span>
          <span>Dành cho: <strong className="text-rose-200">{data.recipientName}</strong></span>
        </div>
      </div>

      {/* Bottom Area: Hold to Light Button + Hints */}
      <div className="flex flex-col items-center gap-3 pb-4">
        {holdState ? (
          <HoldToLightButton holdState={holdState} />
        ) : null}

        {/* Camera rotation helper hint */}
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3.5 py-1.5 text-[11px] text-white/60 backdrop-blur-md">
          <Compass className="h-3.5 w-3.5 text-purple-300 animate-spin-slow" />
          <span>Có thể xoay góc nhìn 360° bằng chuột hoặc cảm ứng</span>
        </div>
      </div>
    </div>
  );
}
