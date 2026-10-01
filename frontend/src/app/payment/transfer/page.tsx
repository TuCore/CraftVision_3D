"use client";

import { AppShell } from "@/components/AppShell";
import { ArrowLeft, CheckCircle2, Copy, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useWishlistStore } from "@/store/useWishlistStore";

export default function PaymentTransferPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState<string>("");
  const [total, setTotal] = useState<string>("");
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setOrderId(params.get("orderId") || `ORD-${Date.now().toString().slice(-6)}`);
      setTotal(params.get("total") || "0");
    }
  }, []);

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price));
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã copy ${label}!`);
  };

  const transferContent = `CV3D ${orderId.slice(-6).toUpperCase()}`;

  const handleSimulateSuccess = () => {
    const { items, removeFromCart } = useWishlistStore.getState();
    items.forEach(item => {
      if (item.cartItemId) removeFromCart(item.cartItemId);
    });
    router.push("/payment/success");
  };

  const handleCancelPayment = async () => {
    try {
      if (orderId && !orderId.startsWith("ORD-")) {
        await api.patch(`/api/orders/${orderId}/cancel`);
      }
      toast.info("Đã huỷ thanh toán. Bạn có thể chỉnh sửa lại đơn hàng.");
      router.push("/checkout");
    } catch (error) {
      console.error(error);
      toast.error("Đã xảy ra lỗi khi huỷ đơn hàng.");
    }
  };

  return (
    <AppShell active="shop">
      <div className="mx-auto max-w-4xl py-12 px-4 space-y-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-extrabold font-display gradient-text">Thanh toán chuyển khoản</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: QR Code Section */}
          <div className="glass-card p-8 rounded-3xl flex flex-col items-center justify-center text-center space-y-6">
            <h2 className="text-xl font-bold">Quét mã QR qua ứng dụng ngân hàng</h2>
            
            <div className="bg-gradient-to-br from-primary/10 to-[#FF37C0]/10 p-4 rounded-3xl border border-primary/20 relative group">
              <div className="absolute inset-0 bg-white/20 blur-xl rounded-3xl -z-10 group-hover:bg-primary/20 transition-colors duration-500"></div>
              {/* Fake PayOS QR code for now, can replace with actual PayOS QR data */}
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent('https://pay.payos.vn/dummy')}`} 
                alt="VietQR" 
                className="w-56 h-56 rounded-2xl mix-blend-multiply dark:mix-blend-normal bg-white shadow-sm" 
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Số tiền cần thanh toán</div>
              <div className="text-3xl font-extrabold text-primary">{formatPrice(total)}</div>
            </div>

            <p className="text-sm text-muted-foreground italic max-w-xs">
              Sử dụng App ngân hàng hoặc Ví điện tử để quét mã và thanh toán an toàn qua cổng PayOS.
            </p>
          </div>

          {/* Right: Transfer Info Section */}
          <div className="space-y-6">
            <div className="glass-card p-8 rounded-3xl space-y-6 h-full flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold mb-6">Thông tin chuyển khoản</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground block mb-1">Ngân hàng</label>
                    <div className="flex justify-between items-center bg-card/80 p-4 rounded-xl border border-border">
                      <span className="font-bold">MB Bank</span>
                      <img src="https://mbbank.com.vn/images/logo.png" alt="MB" className="h-6 object-contain hidden" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-muted-foreground block mb-1">Chủ tài khoản</label>
                    <div className="flex justify-between items-center bg-card/80 p-4 rounded-xl border border-border">
                      <span className="font-bold uppercase text-primary">CraftVision 3D</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-muted-foreground block mb-1">Số tài khoản</label>
                    <div className="flex justify-between items-center bg-card/80 p-4 rounded-xl border border-border">
                      <span className="font-bold font-mono text-lg tracking-wider">0123456789</span>
                      <button onClick={() => handleCopy("0123456789", "số tài khoản")} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-muted-foreground block mb-1">Nội dung chuyển khoản</label>
                    <div className="flex justify-between items-center bg-primary/10 p-4 rounded-xl border border-primary/20">
                      <span className="font-bold font-mono text-lg text-[#FF37C0]">{transferContent}</span>
                      <button onClick={() => handleCopy(transferContent, "nội dung")} className="p-2 text-[#FF37C0] hover:bg-[#FF37C0]/10 rounded-lg transition-colors">
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex gap-3 text-amber-600">
                <RefreshCcw className="w-5 h-5 shrink-0 animate-spin-slow" />
                <p className="text-sm font-medium">Hệ thống đang chờ nhận thanh toán... Mã QR sẽ hết hạn sau <span className="font-bold">15:00</span> phút.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 pt-8">
          <button onClick={handleSimulateSuccess} className="btn-hero px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-coral-glow">
            <CheckCircle2 className="w-5 h-5" /> Đã chuyển khoản (Simulate)
          </button>
          <button onClick={handleCancelPayment} className="bg-card hover:bg-muted border border-border px-8 py-3.5 rounded-xl font-bold transition-colors text-destructive">
            Huỷ thanh toán
          </button>
        </div>
      </div>
    </AppShell>
  );
}
