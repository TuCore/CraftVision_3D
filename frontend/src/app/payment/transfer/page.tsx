"use client";

import { AppShell } from "@/components/AppShell";
import { ArrowLeft, CheckCircle2, Copy, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useOrderStore } from "@/store/useOrderStore";

export default function PaymentTransferPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState<string>("");
  const [total, setTotal] = useState<string>("");
  const [orderInfo, setOrderInfo] = useState<any>(null);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const oid = params.get("orderId");
      if (oid) {
        setOrderId(oid);
        setTotal(params.get("total") || "0");
        api.get(`/api/orders/${oid}`)
          .then(res => {
            setOrderInfo(res.data);
            if (res.data.totalAmount) setTotal(res.data.totalAmount.toString());
          })
          .catch(err => console.error("Lỗi khi tải thông tin đơn hàng:", err));
      } else {
        setOrderId(`ORD-${Date.now().toString().slice(-6)}`);
      }
    }
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (orderId && !orderId.startsWith("ORD-")) {
      intervalId = setInterval(async () => {
        try {
          const res = await api.get(`/api/orders/${orderId}/check-payment`);
          if (res.data?.isPaid === true) {
            clearInterval(intervalId);
            toast.success("Thanh toán thành công!");
            const { items, clearItems } = useOrderStore.getState();
            const { removeFromCart } = useWishlistStore.getState();
            items.forEach(item => {
              if (item.cartItemId) removeFromCart(item.cartItemId);
            });
            clearItems();
            router.push(`/payment/success?orderId=${orderId}`);
          }
        } catch (err) {
          console.error("Lỗi khi kiểm tra trạng thái thanh toán:", err);
        }
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [orderId, router]);

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price));
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã copy ${label}!`);
  };

  const payAmount = orderInfo?.payOsAmount || total;
  const bankName = orderInfo?.payOsBin ? `Ngân hàng (BIN: ${orderInfo.payOsBin})` : "MB Bank";
  const accName = orderInfo?.payOsAccountName || "CRAFTVISION 3D";
  const accNum = orderInfo?.payOsAccountNumber || "0382343939";
  const transferContent = orderInfo?.payOsDescription || `CV3D ${orderId.slice(-6).toUpperCase()}`;

  const qrUrl = orderInfo?.qrCode
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(orderInfo.qrCode)}`
    : (orderInfo?.payOsBin && orderInfo?.payOsAccountNumber
      ? `https://img.vietqr.io/image/${orderInfo.payOsBin}-${orderInfo.payOsAccountNumber}-qr_only.png?amount=${payAmount}&addInfo=${encodeURIComponent(transferContent)}`
      : `https://img.vietqr.io/image/970422-0382343939-qr_only.png?amount=${payAmount}&addInfo=${encodeURIComponent(transferContent)}`);

  const handleSimulateSuccess = async () => {
    try {
      if (orderId && !orderId.startsWith("ORD-")) {
        await api.patch(`/api/orders/${orderId}/simulate-payment`);
      }
      const { items, clearItems } = useOrderStore.getState();
      const { removeFromCart } = useWishlistStore.getState();
      items.forEach(item => {
        if (item.cartItemId) removeFromCart(item.cartItemId);
      });
      clearItems();
      toast.success("Thanh toán thành công (Simulated)!");
      router.push("/settings?tab=orders");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Đã xảy ra lỗi khi giả lập thanh toán.");
    }
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
              <img 
                src={qrUrl} 
                alt="PayOS QR" 
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
                      <span className="font-bold">{bankName}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-muted-foreground block mb-1">Chủ tài khoản</label>
                    <div className="flex justify-between items-center bg-card/80 p-4 rounded-xl border border-border">
                      <span className="font-bold uppercase text-primary">{accName}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-muted-foreground block mb-1">Số tài khoản</label>
                    <div className="flex justify-between items-center bg-card/80 p-4 rounded-xl border border-border">
                      <span className="font-bold font-mono text-lg tracking-wider">{accNum}</span>
                      <button onClick={() => handleCopy(accNum, "số tài khoản")} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
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
          <button onClick={handleSimulateSuccess} className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3.5 rounded-xl font-bold transition-colors">
            Đã thanh toán (Dev)
          </button>
          <button onClick={handleCancelPayment} className="bg-card hover:bg-muted border border-border px-8 py-3.5 rounded-xl font-bold transition-colors text-destructive">
            Huỷ thanh toán
          </button>
        </div>
      </div>
    </AppShell>
  );
}
