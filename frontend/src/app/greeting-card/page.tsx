"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AudioPlayer } from '@/components/greeting-card/AudioPlayer';
import { EnvelopeUnfold } from '@/components/greeting-card/EnvelopeUnfold';
import { SceneContainer } from '@/components/greeting-card/scene/SceneContainer';
import { Sparkles, CreditCard, MessageSquare, ArrowLeft, Heart } from 'lucide-react';
import { useOrderStore } from '@/store/useOrderStore';
import { toast } from 'sonner';

function GreetingCardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpened, setIsOpened] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  // Read data from searchParams or sessionStorage
  const [data, setData] = useState({
    title: "Trung thu - Ngàn Đèn Lồng, Một Lời Thương",
    receiverName: "Bạn thân mến",
    senderName: "Người thương",
    message: "Một món quà bất ngờ và ấm áp đang chờ đón bạn...",
    photoUrl: "",
    price: 49999,
    templateId: 1,
  });

  useEffect(() => {
    let saved: any = null;
    try {
      const stored = sessionStorage.getItem("preview_greeting");
      if (stored) saved = JSON.parse(stored);
    } catch {}

    const titleParam = searchParams.get("title");
    const receiverParam = searchParams.get("receiver");
    const senderParam = searchParams.get("sender");
    const msgParam = searchParams.get("msg");
    const imgParam = searchParams.get("img");

    setData({
      title: titleParam || saved?.title || "Trung thu - Ngàn Đèn Lồng, Một Lời Thương",
      receiverName: receiverParam || saved?.receiverName || "Người thương",
      senderName: senderParam || saved?.senderName || "Bạn",
      message: msgParam || saved?.message || "Chúc bạn một mùa trăng an lành, ấm áp và luôn ngập tràn niềm vui hạnh phúc bên những người thân yêu!",
      photoUrl: imgParam || saved?.image || "",
      price: saved?.price || 49999,
      templateId: saved?.templateId || 1,
    });
  }, [searchParams]);

  const handlePayNow = () => {
    useOrderStore.getState().setItems([
      {
        product: {
          id: `template-${data.templateId || 1}`,
          name: data.title,
          price: data.price || 49999,
          category: "Thiệp điện tử",
          image: data.photoUrl || "/dreamy-hero-bg.jpg",
          rating: 5,
          description: "Mẫu thiệp thông điệp điện tử 3D",
          matchScore: 100,
          is3D: true,
          isDigital: true,
        } as any,
        quantity: 1,
        gift: {
          giftTitle: data.title,
          senderName: data.senderName,
          receiverName: data.receiverName,
          message: data.message,
          previewImageUrl: data.photoUrl,
        },
      },
    ]);
    toast.success("Chuyển tới thanh toán...");
    router.push("/checkout");
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#100714]">
      {/* Trình phát nhạc nền */}
      <AudioPlayer src="/music/bgm.mp3" />

      {/* Hiệu ứng 3D chỉ xuất hiện sau khi mở thư hoặc luôn render nhưng bị che đi */}
      {isOpened && (
        <div className="absolute inset-0 z-0 animate-in fade-in duration-1000">
          <SceneContainer customImage={data.photoUrl} />
        </div>
      )}

      {/* Bao thư 2D (Che toàn bộ màn hình cho đến khi mở) */}
      {!isOpened && (
        <EnvelopeUnfold
          onOpen={() => setIsOpened(true)}
          receiverName={data.receiverName}
          senderName={data.senderName}
          message={data.message}
          photoUrl={data.photoUrl}
        />
      )}

      {/* UI nổi sau khi mở thư */}
      {isOpened && (
        <>
          {/* Top navigation / action bar */}
          <div className="absolute top-6 left-6 z-30 flex items-center gap-3">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  router.back();
                } else {
                  window.close();
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 text-xs font-semibold transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Trở về
            </button>
            <button
              onClick={() => setShowMessageModal(!showMessageModal)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 backdrop-blur-md border border-rose-400/30 text-xs font-semibold transition-all cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Xem lời chúc
            </button>
          </div>

          <div className="absolute top-6 right-20 z-30">
            <button
              onClick={handlePayNow}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full btn-hero text-white text-xs font-bold shadow-coral-glow hover:scale-105 transition-all cursor-pointer"
            >
              <CreditCard className="w-4 h-4" /> Thanh toán thiệp này
            </button>
          </div>

          {/* Modal đọc lời chúc chi tiết */}
          {showMessageModal && (
            <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="max-w-md w-full bg-gradient-to-br from-white/95 to-rose-50/95 p-6 rounded-3xl border border-rose-200/50 shadow-2xl text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                  <Heart className="w-6 h-6 fill-rose-500" />
                </div>
                <h3 className="font-serif text-xl font-bold text-gray-900">
                  Dành riêng cho {data.receiverName}
                </h3>
                {data.photoUrl && (
                  <div className="w-32 h-32 mx-auto rounded-2xl overflow-hidden border-2 border-rose-200 shadow-sm">
                    <img src={data.photoUrl} alt="Memory" className="w-full h-full object-cover" />
                  </div>
                )}
                <p className="text-gray-700 text-sm font-serif italic leading-relaxed whitespace-pre-wrap">
                  "{data.message}"
                </p>
                <div className="pt-2 text-xs font-semibold text-rose-600">
                  Từ: {data.senderName}
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowMessageModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-semibold cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={handlePayNow}
                    className="flex-1 py-2.5 rounded-xl btn-hero text-white text-xs font-bold shadow-sm cursor-pointer"
                  >
                    Thanh toán ngay
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tiêu đề dưới đáy cảnh 3D */}
          <div className="absolute bottom-10 inset-x-0 text-center z-10 pointer-events-none">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif text-white/95 drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]">
              {data.title}
            </h1>
            <p className="mt-2 text-white/80 text-xs sm:text-sm italic">
              Dành tặng {data.receiverName} • Từ {data.senderName}
            </p>
          </div>
        </>
      )}
    </main>
  );
}

export default function GreetingCardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#100714] flex items-center justify-center text-white">Đang tải thông điệp...</div>}>
      <GreetingCardContent />
    </Suspense>
  );
}
