"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { useOrderStore } from "@/store/useOrderStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { toast } from "sonner";
import { Truck, ShoppingCart, CreditCard, ArrowLeft, Wand2, Box } from "lucide-react";
import api from "@/lib/api";
import { AIGiftWidget } from "@/components/AIGiftWidget";
import { useGreetingStore } from "@/store/useGreetingStore";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearItems } = useOrderStore();
  const { removeFromCart } = useWishlistStore(); // to clear cart items on success
  
  const [shippingInfo, setShippingInfo] = useState({
    receiverName: "",
    phone: "",
    address: "",
    province: "",
    district: "",
    ward: "",
    note: ""
  });
  
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  // NFC & AI Gift
  const [useNfcGift, setUseNfcGift] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const [enable3D, setEnable3D] = useState(false);
  const [theme3D, setTheme3D] = useState("Galaxy");
  const [isGenerating3D, setIsGenerating3D] = useState(false);
  const [preview3D, setPreview3D] = useState<string | null>(null);



  const handleGenerate3D = () => {
    setIsGenerating3D(true);
    setTimeout(() => {
      setPreview3D("https://modelviewer.dev/shared-assets/models/Astronaut.glb");
      setIsGenerating3D(false);
    }, 2000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post('/api/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (res.data && res.data.cloudinaryUrl) {
        setUploadedImage(res.data.cloudinaryUrl);
        toast.success("Tải ảnh lên thành công!");
      } else {
        toast.error("Lỗi khi tải ảnh lên server.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Đã xảy ra lỗi mạng khi tải ảnh. Vui lòng đăng nhập nếu chưa đăng nhập.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  useEffect(() => {
    if ((!items || items.length === 0) && !isOrderPlaced) {
      toast.error("Bạn chưa chọn món quà nào!");
      router.push("/shop");
    }
  }, [items, router, isOrderPlaced]);

  const handlePlaceOrder = async () => {
    if (!shippingInfo.receiverName || !shippingInfo.phone || !shippingInfo.address) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }
    if (!agreedTerms) {
      toast.error("Vui lòng đồng ý với điều khoản dịch vụ!");
      return;
    }
    if (!items || items.length === 0) {
      toast.error("Vui lòng chọn một món quà để thanh toán.");
      return;
    }

    setIsSubmitting(true);
    try {
      setIsOrderPlaced(true);
      const fullAddress = `${shippingInfo.address}, ${shippingInfo.ward}, ${shippingInfo.district}, ${shippingInfo.province}`;
      
      const payload = {
        receiverName: shippingInfo.receiverName,
        receiverPhone: shippingInfo.phone,
        receiverAddress: fullAddress,
        paymentMethod: "Cod",
        items: items.map(item => ({
          productId: item.product.id.startsWith("custom-") ? "11111111-1111-1111-1111-111111111111" : item.product.id,
          quantity: item.quantity,
          wantNfc: useNfcGift || !!item.gift,
          gift: (useNfcGift || item.gift) ? {
            giftTitle: useNfcGift ? (useGreetingStore.getState().giftTitle || `Quà tặng cho ${shippingInfo.receiverName || "bạn"}`) : (item.gift?.giftTitle || `Quà tặng cho ${shippingInfo.receiverName || "bạn"}`),
            senderName: useNfcGift ? (useGreetingStore.getState().senderName || "Người gửi") : (item.gift?.senderName || "Người gửi"),
            receiverName: useNfcGift ? (useGreetingStore.getState().receiverName || shippingInfo.receiverName || "Người nhận") : (item.gift?.receiverName || "Người nhận"),
            message: useNfcGift ? generatedMessage : (item.gift?.message || ""),
            messageSource: item.gift?.messageSource || "AI",
            theme: useNfcGift ? (useGreetingStore.getState().tone || "sincere") : (item.gift?.theme || "sincere"),
            threeDModelUrl: useNfcGift ? preview3D : (item.gift?.threeDModelUrl || null),
            previewImageUrl: useNfcGift ? uploadedImage : (item.gift?.previewImageUrl || uploadedImage),
            threeDModelType: item.gift?.threeDModelType || "GLB",
            mediaFileIds: item.gift?.mediaFileIds || []
          } : null
        }))
      };

      await api.post("/api/orders", payload);
      toast.success("Đặt hàng thành công!");
      
      // Clear items from cart
      items.forEach(item => {
        if (item.cartItemId) removeFromCart(item.cartItemId);
      });
      clearItems();
      
      router.push("/profile");
    } catch (error: any) {
      setIsOrderPlaced(false);
      toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi đặt hàng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!items || items.length === 0) return null;

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shipping = subtotal > 500000 ? 0 : 30000;
  const total = subtotal + shipping;

  const showGlobalNfc = items.length === 1 && !items[0].gift;

  return (
    <AppShell active="shop">
      <div className="mx-auto max-w-5xl py-12 px-4 space-y-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-extrabold font-display gradient-text">Thanh toán</h1>
        </div>
        
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

            {/* AI Generator Block - only show for single item without pre-designed gift */}
            {showGlobalNfc && (
              <div className="glass-card p-6 rounded-3xl space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">🎁 Thiết kế thiệp NFC & 3D</h2>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={useNfcGift} onChange={(e) => setUseNfcGift(e.target.checked)} />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {useNfcGift && (
                  <div className="space-y-6">
                    <AIGiftWidget 
                      receiverName={shippingInfo.receiverName} 
                      senderName="" 
                      value={generatedMessage} 
                      onChange={setGeneratedMessage} 
                    />
                    
                    {/* Image Upload Section */}
                    <div className="bg-white/60 p-5 rounded-2xl border border-white shadow-sm space-y-4">
                      <h3 className="font-bold flex items-center gap-2">
                        🖼️ Đính kèm ảnh kỷ niệm
                      </h3>
                      <p className="text-sm text-muted-foreground">Bức ảnh này sẽ hiển thị ở món quà điện tử khi người nhận mở món quà ra.</p>
                      
                      {uploadedImage ? (
                        <div className="relative group rounded-xl overflow-hidden border border-border w-full max-w-[200px] aspect-[4/5]">
                          <img src={uploadedImage} alt="Uploaded preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                              onClick={() => setUploadedImage(null)}
                              className="bg-white text-red-500 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm"
                            >
                              Xóa ảnh
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-primary/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary/5 transition-colors group">
                          {isUploadingImage ? (
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                              <span className="text-sm font-semibold text-primary">Đang tải lên...</span>
                            </div>
                          ) : (
                            <>
                              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <span className="text-xl">+</span>
                              </div>
                              <span className="text-sm font-semibold text-foreground">Nhấn để chọn ảnh (Cloudinary)</span>
                              <span className="text-xs text-muted-foreground mt-1">Hỗ trợ JPG, PNG, WEBP</span>
                            </>
                          )}
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} />
                        </label>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-3xl space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-primary" /> Đơn hàng</h2>
              
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm border-b border-border/50 pb-2">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="font-semibold truncate">{item.product.name}</p>
                      <div className="flex gap-2 items-center text-xs mt-1">
                        <span className="text-muted-foreground">x{item.quantity}</span>
                        {item.gift && <span className="bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded font-semibold">🎁 Đã kèm thiệp</span>}
                      </div>
                    </div>
                    <span className="font-semibold whitespace-nowrap">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span className="font-semibold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Phí giao hàng</span>
                  <span className="font-semibold">{shipping === 0 ? "Miễn phí" : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shipping)}</span>
                </div>
              </div>
              <div className="border-t border-border pt-4 flex justify-between items-center">
                <span className="font-bold">Tổng cộng</span>
                <span className="text-2xl font-display font-extrabold gradient-text">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                </span>
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
