"use client";

import React, { useEffect, useState } from 'react';
import { Flame, AlertCircle, RefreshCw } from 'lucide-react';

// ─── Loading Screen ────────────────────────────────────────────────────────────
export function ExperienceLoadingScreen() {
  const [dots, setDots] = useState('');
  const [phase, setPhase] = useState(0);

  const loadingPhases = [
    'Đang mở không gian 3D',
    'Đang thắp sáng vũ trụ',
    'Chuẩn bị ngọn nến của bạn',
    'Gần xong rồi',
  ];

  useEffect(() => {
    const dotTimer = setInterval(() => {
      setDots(d => (d.length >= 3 ? '' : d + '.'));
    }, 450);
    const phaseTimer = setInterval(() => {
      setPhase(p => (p + 1) % loadingPhases.length);
    }, 1600);
    return () => { clearInterval(dotTimer); clearInterval(phaseTimer); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030008]">
      {/* Animated background gradient orb */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background: 'radial-gradient(ellipse 60% 55% at 50% 50%, #2e0a4a 0%, transparent 70%)',
          animation: 'pulse 3s ease-in-out infinite',
        }}
      />

      {/* Floating flame icon */}
      <div
        className="relative mb-8 flex items-center justify-center"
        style={{ animation: 'float 2.2s ease-in-out infinite' }}
      >
        <div
          className="absolute h-24 w-24 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(251,146,60,0.25) 0%, transparent 70%)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        <Flame
          className="relative h-12 w-12"
          style={{ color: '#fb923c', filter: 'drop-shadow(0 0 16px #fb923c)' }}
        />
      </div>

      {/* Loading text */}
      <div className="flex flex-col items-center gap-2">
        <p
          className="text-lg font-semibold tracking-widest"
          style={{
            color: '#fde68a',
            textShadow: '0 0 20px rgba(253,230,138,0.5)',
            fontFamily: 'Georgia, serif',
          }}
        >
          CraftVision 3D
        </p>
        <p
          className="min-h-[1.5rem] text-sm font-medium"
          style={{ color: 'rgba(255,255,255,0.55)' }}
        >
          {loadingPhases[phase]}{dots}
        </p>
      </div>

      {/* Loading bar */}
      <div className="mt-8 h-px w-40 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #f59e0b, #fb7185, #f97316)',
            animation: 'shimmer 1.6s ease-in-out infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}

// ─── Error Screen ──────────────────────────────────────────────────────────────
interface ExperienceErrorScreenProps {
  message?: string;
  onRetry?: () => void;
}

export function ExperienceErrorScreen({ message, onRetry }: ExperienceErrorScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-[#030008] px-6 text-center">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse 50% 40% at 50% 50%, #3d0a0a 0%, transparent 70%)',
        }}
      />

      <AlertCircle className="relative h-14 w-14 text-rose-400" style={{ filter: 'drop-shadow(0 0 20px #f87171)' }} />

      <div className="relative flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold text-white">Không tìm thấy trải nghiệm</h1>
        <p className="max-w-xs text-sm text-white/50">
          {message ?? 'Liên kết này có thể đã hết hạn hoặc không tồn tại.'}
        </p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="relative flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95"
        >
          <RefreshCw className="h-4 w-4" />
          Thử lại
        </button>
      )}

      <a
        href="/"
        className="relative text-xs text-white/30 underline underline-offset-4 hover:text-white/60 transition-colors"
      >
        Về trang chủ
      </a>
    </div>
  );
}
