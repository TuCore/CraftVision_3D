"use client";

import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

interface EnvelopeUnfoldProps {
  onOpen: () => void;
  receiverName?: string;
  senderName?: string;
  message?: string;
  photoUrl?: string;
}

export function EnvelopeUnfold({ 
  onOpen,
  receiverName = "Bạn",
  senderName = "Người thương",
  message = "Một món quà bất ngờ đang chờ đón...",
  photoUrl
}: EnvelopeUnfoldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const envelopeRef = useRef<HTMLDivElement>(null);
  const flapRef = useRef<HTMLDivElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { contextSafe } = useGSAP({ scope: containerRef });

  const handleOpen = contextSafe(() => {
    if (isOpen) return;
    setIsOpen(true);

    const tl = gsap.timeline({
      onComplete: () => {
        // Sau khi hoàn thành animation mở thư, gọi hàm onOpen để hiện cảnh 3D
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 1,
          onComplete: onOpen
        });
      }
    });

    // 1. Mở nắp thư
    tl.to(flapRef.current, {
      rotateX: 180,
      duration: 1,
      transformOrigin: 'top center',
      ease: 'power2.inOut',
    });

    // 2. Rút thư lên (z-index phải đc quản lý bằng CSS)
    tl.to(letterRef.current, {
      y: -200,
      duration: 1.2,
      ease: 'power3.out',
    });

    // 3. Phóng to thư lên một chút để người đọc xem lướt qua
    tl.to(letterRef.current, {
      scale: 1.2,
      duration: 1,
      ease: 'power2.out',
    });
  });

  return (
    <div ref={containerRef} className="fixed inset-0 z-40 flex items-center justify-center bg-rose-50/90 backdrop-blur-sm">
      <div 
        ref={envelopeRef} 
        className="relative w-80 h-56 bg-red-800 rounded-lg shadow-2xl cursor-pointer group"
        onClick={handleOpen}
        style={{ perspective: 1000 }}
      >
        {/* Lá thư (Bên trong) */}
        <div 
          ref={letterRef}
          className="absolute inset-x-3 top-3 bottom-3 bg-gradient-to-b from-[#FFFDF9] to-[#FFF5EB] rounded shadow-inner flex flex-col items-center justify-between text-center p-3 border border-rose-200/80 overflow-hidden"
          style={{ zIndex: 10 }}
        >
          <div className="w-full">
            <span className="text-[9px] uppercase tracking-widest text-rose-400 font-bold">Thư gửi riêng bạn</span>
            <h2 className="font-serif text-base sm:text-lg font-bold text-rose-800 line-clamp-1">
              Gửi {receiverName},
            </h2>
          </div>

          {photoUrl ? (
            <div className="w-12 h-12 rounded-md overflow-hidden border border-rose-200 shadow-xs my-0.5 shrink-0">
              <img src={photoUrl} alt="Memory" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="text-sm text-rose-500 my-0.5">
              ❤️
            </div>
          )}

          <p className="text-gray-700 text-[11px] italic font-serif line-clamp-2 px-1 leading-snug">
            "{message}"
          </p>

          <p className="text-[10px] font-serif text-rose-700 font-medium">
            Từ: {senderName}
          </p>
        </div>

        {/* Thân bao thư (Mặt sau, nằm đè lên lá thư một phần để tạo cảm giác nhét bên trong) */}
        <div 
          className="absolute inset-0 bg-red-700 rounded-lg pointer-events-none"
          style={{ 
            zIndex: 20, 
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 65%, 0 100%)' 
          }}
        ></div>

        {/* Nắp thư (Top flap) */}
        <div 
          ref={flapRef}
          className="absolute top-0 inset-x-0 h-32 bg-red-600 rounded-t-lg origin-top pointer-events-none transition-colors group-hover:bg-red-500"
          style={{ 
            zIndex: 30,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            backfaceVisibility: 'hidden'
          }}
        ></div>
        
        {/* Nút ấn Ảo để báo người dùng click */}
        {!isOpen && (
          <div className="absolute -bottom-16 inset-x-0 text-center animate-bounce text-rose-900 font-medium">
            Chạm để mở thư
          </div>
        )}
      </div>
    </div>
  );
}
