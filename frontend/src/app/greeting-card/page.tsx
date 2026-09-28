"use client";

import React, { useState } from 'react';
import { AudioPlayer } from '@/components/greeting-card/AudioPlayer';
import { EnvelopeUnfold } from '@/components/greeting-card/EnvelopeUnfold';
import { SceneContainer } from '@/components/greeting-card/scene/SceneContainer';

export default function GreetingCardPage() {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#100714]">
      {/* Trình phát nhạc nền */}
      <AudioPlayer src="/music/bgm.mp3" />

      {/* Hiệu ứng 3D chỉ xuất hiện sau khi mở thư hoặc luôn render nhưng bị che đi */}
      {isOpened && (
        <div className="absolute inset-0 z-0 animate-in fade-in duration-1000">
          <SceneContainer />
        </div>
      )}

      {/* Bao thư 2D (Che toàn bộ màn hình cho đến khi mở) */}
      {!isOpened && (
        <EnvelopeUnfold onOpen={() => setIsOpened(true)} />
      )}
      
      {/* UI nổi (Tuỳ chọn: Tiêu đề hoặc thông điệp sau khi mở thư) */}
      {isOpened && (
        <div className="absolute bottom-10 inset-x-0 text-center z-10 pointer-events-none">
          <h1 className="text-3xl md:text-5xl font-serif text-white/90 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            Kỷ niệm của chúng ta
          </h1>
          <p className="mt-2 text-white/70 italic">Kéo chuột để xoay và cuộn để phóng to</p>
        </div>
      )}
    </main>
  );
}
