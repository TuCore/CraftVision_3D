import { Heart } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className="relative flex items-center justify-center">
        {/* Lớp trái tim toả sáng nhịp đập */}
        <div className="absolute animate-ping opacity-50">
          <Heart className="h-16 w-16 text-[color:var(--coral)] fill-[color:var(--coral)]" />
        </div>
        
        {/* Trái tim chính ở giữa */}
        <Heart className="relative h-12 w-12 text-[color:var(--coral)] fill-[color:var(--coral)] animate-pulse" />
      </div>
      <p className="mt-6 font-medium text-[color:var(--coral)] animate-pulse tracking-widest text-sm uppercase">
        Đang chuẩn bị...
      </p>
    </div>
  );
}
