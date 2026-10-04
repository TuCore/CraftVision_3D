"use client";

import React from 'react';
import { Flame, Sparkles, RotateCcw } from 'lucide-react';
import { UsePressAndHoldReturn } from '@/hooks/usePressAndHold';

interface HoldToLightButtonProps {
  holdState: UsePressAndHoldReturn;
}

export function HoldToLightButton({ holdState }: HoldToLightButtonProps) {
  const { progress, isHolding, isCompleted, bind, reset } = holdState;

  // SVG circular progress parameters
  const size = 96;
  const strokeWidth = 5;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  const percentage = Math.round(progress * 100);

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center gap-3 animate-fade-in">
        <div className="flex items-center gap-2.5 rounded-full border border-amber-300/40 bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-orange-500/20 px-6 py-3 text-sm font-bold text-amber-200 backdrop-blur-xl shadow-[0_0_30px_rgba(251,146,60,0.4)]">
          <Sparkles className="h-5 w-5 text-amber-300 animate-bounce" />
          <span>Ngọn nến đã được thắp sáng! (100%)</span>
        </div>
        <button
          onClick={reset}
          className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-4 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-md transition-all hover:bg-white/20 hover:text-white"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Thử lại tương tác</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Interactive Press and Hold Button */}
      <div
        {...bind}
        role="button"
        tabIndex={0}
        aria-label="Nhấn và giữ để thắp nến"
        style={{
          boxShadow: isHolding 
            ? `0 0 ${20 + progress * 40}px rgba(251, 146, 60, ${0.4 + progress * 0.5})`
            : '0 0 20px rgba(0, 0, 0, 0.4)',
        }}
        className={`pointer-events-auto relative flex h-24 w-24 cursor-pointer select-none items-center justify-center rounded-full transition-transform duration-150 active:scale-95 touch-none ${
          isHolding ? 'scale-105' : 'hover:scale-105'
        }`}
      >
        {/* SVG Circular Progress Ring */}
        <svg className="absolute inset-0 h-full w-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-75 ease-linear"
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Pill Button */}
        <div className={`flex h-18 w-18 flex-col items-center justify-center rounded-full border border-white/20 backdrop-blur-xl transition-all ${
          isHolding 
            ? 'bg-gradient-to-tr from-amber-500/40 via-rose-500/40 to-orange-500/40 text-amber-200' 
            : 'bg-white/10 text-white hover:bg-white/15'
        }`}>
          <Flame className={`h-6 w-6 transition-transform ${isHolding ? 'scale-125 text-amber-400 animate-pulse' : 'text-rose-300'}`} />
          <span className="mt-0.5 text-[11px] font-bold tracking-wider">
            {isHolding ? `${percentage}%` : 'GIỮ'}
          </span>
        </div>
      </div>

      {/* Instructional Subtitle */}
      <p className="text-center text-xs font-medium text-white/70 backdrop-blur-sm">
        {isHolding ? (
          <span className="text-amber-300 font-semibold">Đang giữ để truyền năng lượng...</span>
        ) : (
          <span>Chạm & giữ nút tròn để thắp sáng ngọn nến</span>
        )}
      </p>
    </div>
  );
}
