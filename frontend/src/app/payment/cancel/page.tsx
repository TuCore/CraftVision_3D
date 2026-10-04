"use client";

import { AppShell } from "@/components/AppShell";
import { XCircle, ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <AppShell active="shop">
      <div className="mx-auto max-w-3xl py-24 px-4 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-rose-100 dark:bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mb-8 relative">
          <div className="absolute inset-0 bg-rose-500/20 animate-ping rounded-full"></div>
          <XCircle className="w-12 h-12 relative z-10" />
        </div>
        
        <h1 className="text-4xl font-extrabold font-display text-rose-500 mb-4">
          Thanh toán thất bại
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-lg">
          Đã có lỗi xảy ra trong quá trình thanh toán qua PayOS hoặc bạn đã huỷ giao dịch. Vui lòng thử lại.
        </p>

        <div className="bg-white/60 dark:bg-card/60 backdrop-blur-md rounded-3xl p-8 border border-rose-500/20 shadow-sm w-full max-w-md mb-8">
          <div className="space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <span className="text-muted-foreground">Lý do</span>
              <span className="font-bold text-rose-500">Người dùng huỷ thanh toán</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Trạng thái</span>
              <span className="font-bold text-rose-500 flex items-center gap-1">
                <XCircle className="w-4 h-4" /> Đã huỷ
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <button onClick={() => router.push('/checkout')} className="flex-1 btn-hero text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-coral-glow transition-all">
            <RotateCcw className="w-5 h-5" /> Thử thanh toán lại
          </button>
          <Link href="/cart" className="flex-1 bg-card hover:bg-muted border border-border py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Về giỏ hàng
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
