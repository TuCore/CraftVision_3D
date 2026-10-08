"use client";

import { AppShell } from "@/components/AppShell";
import { CheckCircle2, ArrowRight, Package } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function PaymentSuccessPage() {
  useEffect(() => {
    // If the page is loaded inside an iframe (like the PayOS checkout modal), break out of it.
    if (window !== window.top) {
      window.top!.location.href = window.location.href;
    }
  }, []);

  return (
    <AppShell active="shop">
      <div className="mx-auto max-w-3xl py-24 px-4 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-8 relative">
          <div className="absolute inset-0 bg-emerald-500/20 animate-ping rounded-full"></div>
          <CheckCircle2 className="w-12 h-12 relative z-10" />
        </div>
        
        <h1 className="text-4xl font-extrabold font-display gradient-text mb-4">
          Thanh toán thành công!
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-lg">
          Cảm ơn bạn đã mua sắm tại CraftVision 3D. Đơn hàng của bạn đã được thanh toán qua PayOS và đang được chuẩn bị.
        </p>

        <div className="bg-white/60 dark:bg-card/60 backdrop-blur-md rounded-3xl p-8 border border-white/40 shadow-sm w-full max-w-md mb-8">
          <div className="space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <span className="text-muted-foreground">Mã đơn hàng</span>
              <span className="font-bold">ORD-{Date.now().toString().slice(-6)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-border pb-4">
              <span className="text-muted-foreground">Phương thức</span>
              <span className="font-bold text-primary">Chuyển khoản PayOS</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Trạng thái</span>
              <span className="font-bold text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Đã xác nhận
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Link href="/cart" className="flex-1 btn-hero text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-coral-glow">
            <Package className="w-5 h-5" /> Xem đơn hàng
          </Link>
          <Link href="/shop" className="flex-1 bg-card hover:bg-muted border border-border py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
            Tiếp tục mua sắm <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
