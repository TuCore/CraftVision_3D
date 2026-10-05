"use client";

import { useState, useEffect, useMemo } from "react";
import { ProvinceDistrictSelect } from "@/components/common/ProvinceDistrictSelect";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useOrderStore } from "@/store/useOrderStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { toast } from "sonner";
import { Truck, ShoppingCart, CreditCard, ArrowLeft, Wand2, Box, Clock, Sparkles, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [isFirstAddressUser, setIsFirstAddressUser] = useState(false);
  const [isDefaultAddressSaved, setIsDefaultAddressSaved] = useState(false);
  const [isSavingDefaultAddress, setIsSavingDefaultAddress] = useState(false);

  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [showBankInfo, setShowBankInfo] = useState(false);
  const [success3DUrl, setSuccess3DUrl] = useState<string | null>(null);

  const hasPhysicalItems = items.some(
    (item) =>
      !(item.product as any).is3D &&
      !(item.product as any).isDigital &&
      (item.product as any).category !== "Thiệp điện tử"
  );

  const hasAddressLocation = Boolean(shippingInfo.province && shippingInfo.province.trim().length > 0);
  const hasEnteredAddressInfo = Boolean(
    shippingInfo.address.trim() || shippingInfo.province || shippingInfo.receiverName.trim() || shippingInfo.phone.trim()
  );
  const canSaveAddress = Boolean(
    shippingInfo.receiverName.trim() && shippingInfo.phone.trim() && shippingInfo.address.trim() && shippingInfo.province
  );

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      toast.info("Vui lòng đăng nhập hoặc đăng ký để tiến hành thanh toán!");
      router.replace("/auth?redirect=/checkout");
      return;
    }
    if ((!items || items.length === 0) && !isOrderPlaced) {
      toast.error("Bạn chưa chọn món quà nào!");
      router.push("/shop");
    }
  }, [items, router, isOrderPlaced]);

  useEffect(() => {
    if (hasPhysicalItems) {
      const fetchDefaultAddress = async () => {
        try {
          const res = await api.get('/api/user/addresses');
          const addresses = res.data;
          if (Array.isArray(addresses)) {
            setSavedAddresses(addresses);
            if (addresses.length === 0) {
              setIsFirstAddressUser(true);
            } else {
              setIsFirstAddressUser(false);
              const defaultAddress = addresses.find((a: any) => a.isDefault) || addresses[0];
              if (defaultAddress) {
                setShippingInfo(prev => ({
                  ...prev,
                  receiverName: defaultAddress.receiverName || "",
                  phone: defaultAddress.phone || "",
                  address: defaultAddress.address || "",
                  province: defaultAddress.province || "",
                  district: defaultAddress.district || "",
                }));
              }
            }
          } else {
            setIsFirstAddressUser(true);
          }
        } catch (error) {
          console.error("Failed to fetch addresses:", error);
          setIsFirstAddressUser(true);
        }
      };
      fetchDefaultAddress();
    }
  }, [hasPhysicalItems]);

  const handleSaveDefaultAddress = async () => {
    if (!shippingInfo.receiverName.trim() || !shippingInfo.phone.trim() || !shippingInfo.address.trim() || !shippingInfo.province) {
      toast.error("Vui lòng điền đầy đủ họ tên, số điện thoại, địa chỉ cụ thể và tỉnh/thành phố!");
      return;
    }
    setIsSavingDefaultAddress(true);
    try {
      await api.post('/api/user/addresses', {
        receiverName: shippingInfo.receiverName.trim(),
        phone: shippingInfo.phone.trim(),
        address: shippingInfo.address.trim(),
        province: shippingInfo.province,
        district: shippingInfo.district || "",
        isDefault: true
      });
      setIsDefaultAddressSaved(true);
      setIsFirstAddressUser(false);
      setSavedAddresses(prev => [...prev, { ...shippingInfo, isDefault: true }]);
      toast.success("Đã áp dụng và lưu làm địa chỉ mặc định thành công!");
    } catch (err: any) {
      console.error("Lỗi khi lưu địa chỉ mặc định:", err);
      toast.error(err.response?.data?.message || "Không thể lưu địa chỉ mặc định. Vui lòng thử lại!");
    } finally {
      setIsSavingDefaultAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (hasPhysicalItems && (!shippingInfo.receiverName || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.province)) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng bao gồm Tỉnh / Thành phố!");
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

      // Auto-save first address as default if user hasn't explicitly clicked the button
      if (hasPhysicalItems && isFirstAddressUser && !isDefaultAddressSaved && canSaveAddress) {
        try {
          await api.post('/api/user/addresses', {
            receiverName: shippingInfo.receiverName.trim(),
            phone: shippingInfo.phone.trim(),
            address: shippingInfo.address.trim(),
            province: shippingInfo.province,
            district: shippingInfo.district || "",
            isDefault: true
          });
          setIsDefaultAddressSaved(true);
        } catch (e) {
          console.warn("Could not auto-save first address:", e);
        }
      }

      const fullAddress = `${shippingInfo.address}, ${shippingInfo.ward}, ${shippingInfo.district}, ${shippingInfo.province}`;
      
      const payload = {
        receiverName: hasPhysicalItems ? shippingInfo.receiverName : "Khách hàng 3D",
        receiverPhone: hasPhysicalItems ? shippingInfo.phone : "0999999999",
        receiverAddress: hasPhysicalItems ? fullAddress : "Online",
        paymentMethod: paymentMethod === "BANK_TRANSFER" ? "BankTransfer" : "Cod",
        shippingFee: shipping,
        items: items.map(item => {
          const cardPrice = item.gift?.cardPrice ?? (item.product as any).cardPrice ?? (item.gift ? 5000 : 0);
          const rawId = item.product.id || "";
          const cleanedId = rawId.replace(/-3d$/, "");
          const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanedId);
          return {
            productId: isGuid ? cleanedId : "82067dac-8d7c-47b8-9379-bf19d74295d0",
            quantity: item.quantity,
            wantNfc: !!item.gift,
            extraPrice: cardPrice,
            gift: item.gift ? {
              giftTitle: item.gift.giftTitle || `Quà tặng cho ${shippingInfo.receiverName || "bạn"}`,
              senderName: item.gift.senderName || "Người gửi",
              receiverName: item.gift.receiverName || shippingInfo.receiverName || "Người nhận",
              message: item.gift.message || "",
              messageSource: item.gift.messageSource || "AI",
              theme: item.gift.theme || "sincere",
              threeDModelUrl: item.gift.threeDModelUrl || null,
              previewImageUrl: item.gift.previewImageUrl || null,
              threeDModelType: item.gift.threeDModelType || "GLB",
              mediaFileIds: item.gift.mediaFileIds || []
            } : null
          };
        })
      };

      const res = await api.post("/api/orders", payload);
      toast.success("Đặt hàng thành công!");
      if (paymentMethod === "BANK_TRANSFER") {
        if (res.data.checkoutUrl) {
          window.location.href = res.data.checkoutUrl;
        } else {
          router.push(`/payment/transfer?orderId=${res.data.id}&total=${total}`);
        }
        return;
      }

      // Clear items from cart (only if not bank transfer, bank transfer will clear on success)
      items.forEach(item => {
        if (item.cartItemId) removeFromCart(item.cartItemId);
      });
      
      if (!hasPhysicalItems) {
        const secretKey = res.data?.items?.[0]?.gift?.secretKey || res.data?.items?.[0]?.id;
        setSuccess3DUrl(`${window.location.origin}/gift/scan/${secretKey}`);
        return;
      }
      
      clearItems();
      router.push("/settings?tab=orders");
    } catch (error: any) {
      setIsOrderPlaced(false);
      toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi đặt hàng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!items || items.length === 0) return null;

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const calculateShippingFee = () => {
    if (!hasPhysicalItems || subtotal >= 500000) return 0;
    if (!hasAddressLocation) return 0;

    const province = (shippingInfo.province || "").toLowerCase().trim();
    const district = (shippingInfo.district || "").toLowerCase().trim();
    const address = (shippingInfo.address || "").toLowerCase().trim();
    const fullText = `${province} ${district} ${address}`;

    const isHcm = fullText.includes("hồ chí minh") || fullText.includes("ho chi minh") || fullText.includes("hcm") || fullText.includes("tphcm");
    const isThuDuc = fullText.includes("thủ đức") || fullText.includes("thu duc");

    if (isHcm || isThuDuc) {
      if (isThuDuc) return 0; // Miễn phí vận chuyển cho Thủ Đức
      return 20000; // Tất cả các quận/huyện còn lại của TP.HCM
    }

    return 35000; // Ngoại tỉnh
  };

  const shipping = calculateShippingFee();
  const total = subtotal + (hasPhysicalItems && !hasAddressLocation ? 0 : shipping);

  return (
    <AppShell active="shop">
      <div className="mx-auto max-w-3xl py-12 px-4 space-y-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-extrabold font-display gradient-text">Thanh toán</h1>
        </div>
        
        <div className="flex flex-col gap-6">
          
          {/* 1. Thông tin giao hàng */}
          {hasPhysicalItems && (
            <div className="glass-card p-6 rounded-3xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-xl font-bold flex items-center gap-2"><Truck className="w-5 h-5 text-primary" /> Thông tin giao hàng</h2>
                <button onClick={() => router.push('/settings?tab=address')} className="text-sm font-semibold text-primary hover:underline text-left sm:text-right">Thay đổi địa chỉ</button>
              </div>
              
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
                <div className="md:col-span-2">
                  <ProvinceDistrictSelect
                    province={shippingInfo.province}
                    district={shippingInfo.district}
                    onProvinceChange={(p) => setShippingInfo(prev => ({ ...prev, province: p, district: "" }))}
                    onDistrictChange={(d) => setShippingInfo(prev => ({ ...prev, district: d }))}
                  />
                </div>
              </div>

              {/* Phát hiện địa chỉ đầu tiên và hiện nút áp dụng thành địa chỉ mặc định */}
              {isFirstAddressUser && !isDefaultAddressSaved && hasEnteredAddressInfo && (
                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-primary/10 to-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-3 text-left w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                        <span>Phát hiện địa chỉ giao hàng đầu tiên của bạn</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Lưu làm địa chỉ mặc định để tự động sử dụng cho các lần mua sắm tiếp theo.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveDefaultAddress}
                    disabled={isSavingDefaultAddress || !canSaveAddress}
                    className="w-full sm:w-auto px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl shadow-md transition-all whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    title={!canSaveAddress ? "Vui lòng điền đủ họ tên, SĐT, địa chỉ và tỉnh/thành để áp dụng" : "Lưu làm địa chỉ mặc định"}
                  >
                    {isSavingDefaultAddress ? (
                      <span>Đang lưu...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Áp dụng thành địa chỉ mặc định</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {isDefaultAddressSaved && (
                <div className="mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 animate-in fade-in duration-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Đã áp dụng và lưu địa chỉ này làm địa chỉ mặc định của bạn trong hệ thống.</span>
                </div>
              )}
            </div>
          )}

          {/* 2. Đơn hàng */}
          <div className="glass-card p-6 rounded-3xl space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-primary" /> Đơn hàng</h2>
            
            <div className="space-y-4">
              {items.map((item, idx) => {
                const cardPrice = item.gift?.cardPrice ?? (item.product as any).cardPrice ?? (item.gift ? 5000 : 0);
                const basePrice = (item.product as any).basePrice ?? (item.gift ? Math.max(0, item.product.price - cardPrice) : item.product.price);
                const templateTitle = (item.gift as any)?.templateTitle || (item.gift as any)?.giftTitle || "Mẫu mặc định";

                return (
                  <div key={idx} className="flex justify-between items-start text-sm border-b border-border/50 pb-3">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="font-semibold text-foreground text-sm truncate">{item.product.name}</p>
                      <div className="flex flex-wrap gap-2 items-center text-xs mt-1">
                        <span className="text-muted-foreground font-medium">x{item.quantity}</span>
                        {item.gift && (
                          <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                            <span>🎁 Đã kèm thiệp:</span>
                            <span className="font-semibold">{templateTitle}</span>
                            <span className="text-primary font-bold">(+{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cardPrice)})</span>
                          </span>
                        )}
                      </div>
                      {item.gift && basePrice > 0 && (
                        <p className="text-[11px] text-muted-foreground mt-1">
                          Đơn giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(basePrice)} (SP) + {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cardPrice)} (Thiệp) = <span className="font-semibold text-foreground">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.product.price)}</span>
                        </p>
                      )}
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <span className="font-bold text-foreground">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-muted-foreground">Tạm tính</span>
                <span className="font-semibold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Phí giao hàng</span>
                <div className="text-right">
                  {hasPhysicalItems ? (
                    hasAddressLocation ? (
                      <>
                        <span className="font-semibold">{shipping === 0 ? "Miễn phí" : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shipping)}</span>
                        {shipping >= 0 && (
                          <span className="block text-[11px] text-muted-foreground">
                            {shipping === 0 
                              ? (subtotal >= 500000 ? "(Freeship đơn trên 500k)" : "(TP. Thủ Đức)") 
                              : shipping === 20000 
                                ? "(TP.HCM)" 
                                : `(Ngoại tỉnh - ${shippingInfo.province})`}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg font-medium inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Tạm ẩn (nhập địa chỉ để tính phí)
                      </span>
                    )
                  ) : (
                    <span className="font-semibold text-emerald-600">Miễn phí (Sản phẩm số)</span>
                  )}
                </div>
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-base">Tổng cộng</span>
                <span className="text-2xl font-display font-extrabold gradient-text">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                </span>
              </div>
              {hasPhysicalItems && !hasAddressLocation && (
                <p className="text-[11px] text-muted-foreground italic text-right mt-1">
                  * Chưa bao gồm phí giao hàng (sẽ tính sau khi bạn chọn Tỉnh / Thành phố)
                </p>
              )}
            </div>
          </div>

          {/* 3. Phương thức thanh toán */}
          <div className="glass-card p-6 rounded-3xl space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" /> Thanh toán</h2>
            
            <div className="space-y-3">
              <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                <input type="radio" name="payment" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="w-4 h-4 text-primary" />
                <span className="font-medium">Thanh toán khi nhận hàng (COD)</span>
              </label>
              <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${paymentMethod === 'BANK_TRANSFER' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                <input type="radio" name="payment" checked={paymentMethod === 'BANK_TRANSFER'} onChange={() => setPaymentMethod('BANK_TRANSFER')} className="w-4 h-4 text-primary" />
                <span className="font-medium">Chuyển khoản ngân hàng (QR PayOS)</span>
              </label>
            </div>

            <div className="flex items-start gap-2 mt-4">
              <input 
                type="checkbox" 
                id="agreed-terms-checkout"
                checked={agreedTerms}
                onChange={e => setAgreedTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
              <div className="text-sm text-muted-foreground">
                <label htmlFor="agreed-terms-checkout" className="cursor-pointer">
                  Tôi đồng ý với{" "}
                </label>
                <Link 
                  href="/terms" 
                  className="text-primary hover:underline font-medium"
                >
                  Điều khoản dịch vụ
                </Link>{" "}
                <label htmlFor="agreed-terms-checkout" className="cursor-pointer">
                  và{" "}
                </label>
                <Link 
                  href="/privacy" 
                  className="text-primary hover:underline font-medium"
                >
                  Chính sách bảo mật
                </Link>
                <label htmlFor="agreed-terms-checkout" className="cursor-pointer">
                  .
                </label>
              </div>
            </div>

            <button 
              onClick={handlePlaceOrder}
              disabled={isSubmitting || !agreedTerms}
              className="w-full py-4 rounded-2xl btn-hero text-black font-bold text-lg flex items-center justify-center gap-2 shadow-coral-glow hover:-translate-y-1 transition-all disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none"
            >
              {isSubmitting ? "Đang xử lý..." : "Đặt hàng ngay"}
            </button>
          </div>
        </div>
      </div>

      <Dialog open={!!success3DUrl} onOpenChange={(open) => {
        if (!open) {
          setSuccess3DUrl(null);
          clearItems();
          router.push("/settings?tab=orders");
        }
      }}>
        <DialogContent className="sm:max-w-md text-center p-8 bg-white rounded-3xl border-primary/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-display text-primary flex items-center justify-center gap-2 mb-2">
              🎉 Thanh toán thành công!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <p className="text-muted-foreground text-sm">Website 3D kèm câu chúc của bạn đã được tạo. Hãy chia sẻ mã QR hoặc link dưới đây cho người nhận nhé!</p>
            
            <div className="bg-primary/5 p-4 rounded-2xl flex justify-center border border-primary/20 mx-auto w-fit">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(success3DUrl || '')}`} alt="QR Code" className="w-48 h-48 rounded-lg shadow-sm" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground text-left block">Link website của bạn:</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={success3DUrl || ''} 
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-medium text-primary"
                />
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(success3DUrl || '');
                    toast.success("Đã copy link!");
                  }}
                  className="px-4 py-2.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl font-bold transition-colors whitespace-nowrap"
                >
                  Copy
                </button>
              </div>
            </div>

            <button 
              onClick={() => {
                clearItems();
                router.push("/settings?tab=orders");
              }}
              className="w-full btn-hero py-3.5 rounded-xl font-bold text-black shadow-coral-glow mt-4 hover:-translate-y-1 transition-transform"
            >
              Xem lịch sử đơn hàng
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBankInfo} onOpenChange={(open) => {
        if (!open) {
          setShowBankInfo(false);
          clearItems();
          router.push("/settings?tab=orders");
        }
      }}>
        <DialogContent className="sm:max-w-md text-center p-8 bg-white rounded-3xl border-primary/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-display text-primary flex items-center justify-center gap-2 mb-2">
              Chuyển khoản ngân hàng
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <p className="text-muted-foreground text-sm">Vui lòng quét mã QR dưới đây để thanh toán cho đơn hàng của bạn.</p>
            
            <div className="bg-primary/5 p-4 rounded-2xl flex justify-center border border-primary/20 mx-auto w-fit">
              <img src={`https://img.vietqr.io/image/970422-0382343939-compact2.png?amount=${total}&addInfo=Thanh toan don hang CraftVision`} alt="VietQR Code" className="w-64 h-64 rounded-lg shadow-sm" />
            </div>

            <div className="space-y-2 text-left bg-muted/30 p-4 rounded-xl">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Ngân hàng:</span>
                <span className="text-sm font-semibold">MB Bank</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Chủ tài khoản:</span>
                <span className="text-sm font-semibold">CRAFTVISION 3D</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Số tài khoản:</span>
                <span className="text-sm font-semibold">0382343939</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 mt-2">
                <span className="text-sm font-bold">Tổng tiền:</span>
                <span className="text-sm font-bold text-primary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}</span>
              </div>
            </div>

            <button 
              onClick={() => {
                setShowBankInfo(false);
                clearItems();
                router.push("/settings?tab=orders");
              }}
              className="w-full btn-hero py-3.5 rounded-xl font-bold text-black shadow-coral-glow mt-4 hover:-translate-y-1 transition-transform"
            >
              Tôi đã thanh toán
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
