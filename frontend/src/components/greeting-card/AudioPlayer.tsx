"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export function AudioPlayer({ src = "/music/bgm.mp3" }: { src?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5; // Đặt âm lượng 50%
    }
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="fixed top-6 right-6 z-50">
      <audio ref={audioRef} src={src} loop preload="auto" />
      <button 
        onClick={togglePlay}
        className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-md border border-white/40 rounded-full text-white shadow-lg hover:scale-110 hover:bg-white/30 transition-all duration-300"
      >
        {isPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
      </button>
    </div>
  );
}
