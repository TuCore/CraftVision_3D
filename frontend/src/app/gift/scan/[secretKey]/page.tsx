'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage } from '@react-three/drei';
import { Heart, Gift, Camera } from 'lucide-react';
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

function ModelViewer({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return (
    <Canvas shadows camera={{ position: [0, 0, 150], fov: 40 }}>
      <Stage environment="city" intensity={0.6}>
        <primitive object={scene} />
      </Stage>
      <OrbitControls autoRotate autoRotateSpeed={2} makeDefault />
    </Canvas>
  );
}

export default function GiftScanPage() {
  const { secretKey } = useParams();
  const [showContent, setShowContent] = useState(false);

  const { data: gift, isLoading, error } = useQuery({
    queryKey: ['gift-scan', secretKey],
    queryFn: async () => {
      const { data } = await api.get(`/api/gifts?secretKey=${secretKey}`);
      return data; // returns GiftSummaryDto with extra info or a specific GiftDisplayDto
    },
    enabled: !!secretKey,
  });

  useEffect(() => {
    if (showContent) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } }));
      }, 250);
    }
  }, [showContent]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">Đang tải hộp quà...</div>;
  
  if (error || !gift) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-6 text-center">
      <Gift className="w-16 h-16 text-gray-700 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Thẻ NFC Không Hợp Lệ</h1>
      <p className="text-gray-400">Không tìm thấy món quà nào được liên kết với thẻ này.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black text-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
      
      {!showContent ? (
        <div className="flex flex-col items-center justify-center min-h-screen relative z-10 p-6 text-center">
          <div className="w-32 h-32 bg-indigo-900/50 rounded-full flex items-center justify-center mb-8 animate-pulse border border-indigo-500/30">
            <Gift className="w-16 h-16 text-indigo-300" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Bạn có một món quà từ {gift.senderName || 'Ai đó'}!</h1>
          <p className="text-lg text-indigo-200 mb-10">Dành riêng cho {gift.receiverName || 'Bạn'}</p>
          <button 
            onClick={() => setShowContent(true)}
            className="px-10 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-xl font-bold shadow-[0_0_40px_rgba(219,39,119,0.4)] hover:scale-105 transition-transform"
          >
            Mở Quà Ngay
          </button>
        </div>
      ) : (
        <div className="relative z-10 max-w-2xl mx-auto min-h-screen flex flex-col p-6 pb-20">
          <h1 className="text-3xl font-bold text-center mt-8 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-purple-300">
            {gift.giftTitle || 'Quà Tặng Đặc Biệt'}
          </h1>
          <p className="text-center text-indigo-200 mb-8">Từ: {gift.senderName} • Đến: {gift.receiverName}</p>
          
          {/* 3D Model View */}
          <div className="w-full h-[60vh] bg-black/40 rounded-3xl backdrop-blur-md border border-white/10 overflow-hidden relative shadow-2xl mb-8">
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs flex items-center gap-2 z-10">
              <Camera className="w-3 h-3" /> Xoay để xem 360°
            </div>
            {/* Sử dụng một model fallback nếu DTO không có threeDModelUrl */}
            <ModelViewer url={gift.threeDModelUrl || 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Embedded/Duck.gltf'} />
          </div>

          {/* Message Content */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl relative">
            <Heart className="w-8 h-8 text-pink-500 absolute -top-4 -right-4 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]" />
            <p className="text-lg leading-relaxed whitespace-pre-line text-indigo-50 font-medium text-center">
              {gift.message || 'Món quà này được làm riêng cho bạn bằng tất cả tình cảm.'}
            </p>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">Được chế tác bởi CraftVision 3D</p>
          </div>
        </div>
      )}
    </div>
  );
}
