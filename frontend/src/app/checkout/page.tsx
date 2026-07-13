"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { usePreOrderStore } from "@/store/useStore";
import { toast } from "sonner";
import { Truck, ShoppingCart, CreditCard } from "lucide-react";
import api from "@/lib/api";

export default function CheckoutPage() {
  const router = useRouter();
  const { productId, finalGiftData, resetPreOrder } = usePreOrderStore();
  
  const [shippingInfo, setShippingInfo] = useState({
    receiverName: "",
    phone: "",
    address: "",
    province: "",
    district: "",
    ward: "",
    note: ""
  });
  
  const [useNfcGift, setUseNfcGift] = useState(!!finalGiftData);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlaceOrder = async () => {
    if (!shippingInfo.receiverName || !shippingInfo.phone || !shippingInfo.address) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }
    if (!agreedTerms) {
      toast.error("Vui lòng đồng ý với điều khoản dịch vụ!");
      return;
    }
    if (!productId) {
      toast.error("Không tìm thấy sản phẩm. Vui lòng quay lại cửa hàng.");
      return;
    }

    // Defensive check to ensure users with old localStorage cache (e.g. "p1") are forced to reload
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!guidRegex.test(productId)) {
      toast.error("Phiên làm việc đã cũ. Vui lòng quay lại trang Cửa hàng và chọn lại sản phẩm.");
      resetPreOrder();
      router.push("/shop");
      return;
    }

    setIsSubmitting(true);
    try {
      const fullAddress = `${shippingInfo.address}, ${shippingInfo.ward}, ${shippingInfo.district}, ${shippingInfo.province}`;
      
      const payload = {
        receiverName: shippingInfo.receiverName,
        receiverPhone: shippingInfo.phone,
        receiverAddress: fullAddress,
        paymentMethod: "Cod",
        items: [
          {
            productId: productId,
            quantity: 1,
            wantNfc: useNfcGift,
            gift: useNfcGift && finalGiftData ? {
              giftTitle: finalGiftData.giftTitle,
              senderName: finalGiftData.senderName, // We can let user type it or leave it blank
              receiverName: finalGiftData.receiverName,
              message: finalGiftData.message,
              messageSource: finalGiftData.messageSource,
              theme: finalGiftData.theme,
              threeDModelUrl: finalGiftData.threeDModelUrl,
              previewImageUrl: finalGiftData.previewImageUrl,
              threeDModelType: finalGiftData.threeDModelType,
              mediaFileIds: finalGiftData.mediaFileIds
            } : null
          }
        ]
      };

      await api.post("/api/orders", payload);
      toast.success("Đặt hàng thành công!");
      resetPreOrder();
      router.push("/profile");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi đặt hàng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell active="shop">
      <div className="mx-auto max-w-5xl py-12 px-4 space-y-8">
        <h1 className="text-3xl font-extrabold font-display gradient-text">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Shipping Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6 rounded-3xl space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><Truck className="w-5 h-5 text-primary" /> Thông tin giao hàng</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Họ tên người nhận *</label>
                  <input 
                    type="text" 
                    value={shippingInfo.receiverName}
                    onChange={e => setShippingInfo({...shippingInfo, receiverName: e.target.value})}
                    className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Số điện thoại *</label>
                  <input 
                    type="text" 
                    value={shippingInfo.phone}
                    onChange={e => setShippingInfo({...shippingInfo, phone: e.target.value})}
                    className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5" 
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Địa chỉ cụ thể *</label>
                  <input 
                    type="text" 
                    value={shippingInfo.address}
                    onChange={e => setShippingInfo({...shippingInfo, address: e.target.value})}
                    className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tỉnh / Thành phố</label>
                  <input 
                    type="text" 
                    value={shippingInfo.province}
                    onChange={e => setShippingInfo({...shippingInfo, province: e.target.value})}
                    className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quận / Huyện</label>
                  <input 
                    type="text" 
                    value={shippingInfo.district}
                    onChange={e => setShippingInfo({...shippingInfo, district: e.target.value})}
                    className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5" 
                  />
                </div>
              </div>
            </div>

            {/* AI Gift Options if Product Supports NFC */}
            <div className="glass-card p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">🎁 Dịch vụ Quà tặng NFC & 3D</h2>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={useNfcGift} onChange={(e) => setUseNfcGift(e.target.checked)} />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {useNfcGift && finalGiftData && (
                <div className="pt-4 space-y-4 animate-fade-up">
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                    <p className="text-sm font-medium mb-2 text-primary">Lời chúc đính kèm:</p>
                    <textarea 
                      value={finalGiftData.message}
                      onChange={e => {
                        // Allow minor edits at checkout before final submit
                        const updated = {...finalGiftData, message: e.target.value};
                        usePreOrderStore.getState().setFinalGiftData(updated);
                      }}
                      className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 h-24 resize-none text-sm" 
                    />
                  </div>
                  {finalGiftData.threeDModelUrl && (
                    <div className="bg-secondary/20 border border-secondary/30 rounded-xl p-4 flex items-center justify-between">
                      <span className="text-sm font-medium">Đã bao gồm hộp quà 3D ({finalGiftData.theme})</span>
                      <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">Kèm NFC</span>
                    </div>
                  )}
                </div>
              )}
              {useNfcGift && !finalGiftData && (
                <div className="pt-4 animate-fade-up">
                  <p className="text-sm text-amber-500">Bạn chưa tạo nội dung quà tặng. <button onClick={() => router.push(`/preorder/${productId}`)} className="underline font-bold">Tạo ngay</button></p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-3xl space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-primary" /> Đơn hàng</h2>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Sản phẩm (x1)</span>
                <span className="font-semibold">35.000 đ</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Phí giao hàng</span>
                <span className="font-semibold">30.000 đ</span>
              </div>
              <div className="border-t border-border pt-4 flex justify-between items-center">
                <span className="font-bold">Tổng cộng</span>
                <span className="text-2xl font-display font-extrabold gradient-text">65.000 đ</span>
              </div>
            </div>

            <div className="glass-card p-6 rounded-3xl space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" /> Thanh toán</h2>
              
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-4 rounded-xl border border-primary bg-primary/5 cursor-pointer">
                  <input type="radio" name="payment" checked readOnly className="w-4 h-4 text-primary" />
                  <span className="font-medium">Thanh toán khi nhận hàng (COD)</span>
                </label>
              </div>

              <label className="flex items-start gap-2 cursor-pointer mt-4">
                <input 
                  type="checkbox" 
                  checked={agreedTerms}
                  onChange={e => setAgreedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">Tôi đồng ý với <a href="#" className="text-primary hover:underline">Điều khoản dịch vụ</a> và <a href="#" className="text-primary hover:underline">Chính sách bảo mật</a>.</span>
              </label>

              <button 
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl btn-hero font-bold text-lg flex items-center justify-center gap-2 shadow-coral-glow hover:-translate-y-1 transition-all"
              >
                {isSubmitting ? "Đang xử lý..." : "Đặt hàng ngay"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
