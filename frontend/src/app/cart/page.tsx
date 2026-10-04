"use client";

import { useWishlistStore } from "@/store/useWishlistStore";
import { useOrderStore } from "@/store/useOrderStore";
import { AppShell } from "@/components/AppShell";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  Package,
  Calendar,
  CheckCircle2,
  Truck,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Sparkles,
  Eye,
  MapPin,
  Phone,
  CreditCard,
  Clock,
  Gift,
  Copy,
  ExternalLink,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useMemo, useState, useEffect } from "react";
import api from "@/lib/api";
import { useTranslation } from "@/components/LanguageProvider";

export default function CartPage() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { items, removeFromCart, updateQuantity, clearWishlist } = useWishlistStore();
  const { setItems } = useOrderStore();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 3;
  const [totalPages, setTotalPages] = useState(1);

  // Order Details Modal State
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getEstimatedDelivery = (dateStr?: string) => {
    if (!dateStr) return "3 - 5 ngày làm việc";
    try {
      const d = new Date(dateStr);
      const from = new Date(d.getTime() + 3 * 24 * 3600000);
      const to = new Date(d.getTime() + 5 * 24 * 3600000);
      return `${from.toLocaleDateString("vi-VN")} - ${to.toLocaleDateString("vi-VN")}`;
    } catch {
      return "3 - 5 ngày làm việc";
    }
  };

  const handleOpenOrderDetail = async (order: any) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
    if (order.id && typeof order.id === "string" && order.id.includes("-") && order.id.length >= 32) {
      try {
        const res = await api.get(`/api/orders/${order.id}`);
        if (res.data) {
          setSelectedOrder((prev: any) => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.error("Could not fetch full order details:", err);
      }
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoadingOrders(true);
      try {
        const res = await api.get(`/api/orders/me?page=${page}&size=${pageSize}`);
        if (res.data) {
          if (Array.isArray(res.data.items)) {
            setOrderHistory(res.data.items.map((o: any) => ({
              ...o,
              id: o.id || o.orderCode,
              orderCode: o.orderCode || o.id,
              date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : '29/9/2026',
              status: o.orderStatus || 'Processing',
              total: o.totalAmount ?? 0,
              items: Array.isArray(o.items) ? o.items.map((i: any) => ({
                ...i,
                name: i.productName || i.name || "Chi thúi",
                qty: i.quantity || i.qty || 1
              })) : []
            })));
          }
          if (res.data.totalPages) {
            setTotalPages(res.data.totalPages);
          }
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setIsLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [page]);

  // Initialize selected items once when mounted, and filter out removed items
  useEffect(() => {
    setSelectedItems((prev) => {
      // If it's the first time and we have items, select all
      if (prev.length === 0 && items.length > 0) {
        return items.map((item) => item.cartItemId || item.id);
      }
      // Otherwise, just remove deleted items from the selection
      return prev.filter((id) => items.some((item) => (item.cartItemId || item.id) === id));
    });

    if (typeof window !== "undefined" && !customElements.get("model-viewer")) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
      document.head.appendChild(script);
    }
  }, [items]);

  const subtotal = useMemo(() => {
    return items
      .filter((item) => selectedItems.includes(item.cartItemId || item.id))
      .reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
  }, [items, selectedItems]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <AppShell active="cart">
      <div className="mx-auto max-w-6xl py-12 px-4 space-y-8">
        <h1 className="text-3xl font-extrabold font-display text-foreground">
          {t("cart.title")}
        </h1>

        {items.length === 0 ? (
          <div className="glass-card rounded-3xl p-16 text-center space-y-6 flex flex-col items-center shadow-sm">
            <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingCart className="w-10 h-10 text-rose-400" />
            </div>
            <h2 className="text-2xl font-bold font-display">{t("cart.empty_title")}</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t("cart.empty_desc")}
            </p>
            <Link href="/shop" className="btn-hero px-8 py-3 rounded-xl font-bold inline-block mt-4 text-black">
              {t("cart.continue_shopping")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Cart Items */}
            <div className="lg:col-span-8 space-y-4">
              {items.map((item) => (
                <div
                  key={item.cartItemId || item.id}
                  className="bg-white/60 dark:bg-card/60 backdrop-blur-md rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 shadow-sm border border-white/40"
                >
                  {/* Custom Checkbox */}
                  <label className="flex items-center self-start sm:self-auto pt-2 sm:pt-0 cursor-pointer relative group">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={selectedItems.includes(item.cartItemId || item.id)}
                      onChange={(e) => {
                        const id = item.cartItemId || item.id;
                        if (e.target.checked) {
                          setSelectedItems((prev) => [...prev, id]);
                        } else {
                          setSelectedItems((prev) => prev.filter((i) => i !== id));
                        }
                      }}
                    />
                    <div className="w-5 h-5 rounded-lg border-2 border-muted-foreground/30 peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center group-hover:border-primary/50">
                      <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </label>

                  {/* Product Image */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 shadow-sm border border-border/50">
                    {(item as any).is3D && (item as any).modelUrl ? (
                      <div className="w-full h-full bg-primary/5 flex items-center justify-center relative">
                        {/* @ts-ignore */}
                        <model-viewer
                          src={(item as any).modelUrl}
                          auto-rotate
                          camera-controls
                          shadow-intensity="1"
                          style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
                        ></model-viewer>
                      </div>
                    ) : (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 w-full text-center sm:text-left">
                    <h3 className="font-bold text-foreground mb-1 text-base sm:text-lg line-clamp-1">{item.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2">Phân loại: {item.category}</p>

                    {/* Greeting Indicator, Preview & Edit Buttons */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {(item.hasGreeting || item.greetingMessage || item.greetingImage || item.selectedTemplate) && (
                        <div className="inline-flex flex-wrap items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold shadow-sm transition-all hover:bg-primary/15">
                          <span className="flex items-center gap-1.5">
                            <span className="text-sm">🎁</span> Đã kèm thiệp
                          </span>
                          {item.selectedTemplate ? (
                            <>
                              <span className="text-primary/40">•</span>
                              <span className="font-semibold text-primary max-w-[150px] truncate" title={item.selectedTemplate.title}>
                                {item.selectedTemplate.title}
                              </span>
                              <span className="text-[11px] text-rose-600 font-bold">
                                (+{formatPrice(item.selectedTemplate.price || 5000)})
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-primary/40">•</span>
                              <span className="font-semibold text-primary">Mẫu mặc định</span>
                              <span className="text-[11px] text-rose-600 font-bold">(+5.000 đ)</span>
                            </>
                          )}
                          <div className="w-px h-3 bg-primary/30 mx-0.5"></div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="hover:text-primary/70 transition-colors underline-offset-4 hover:underline outline-none cursor-pointer">
                                Xem trước
                              </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[420px] bg-white rounded-3xl p-6 border-primary/20">
                              <DialogHeader>
                                <DialogTitle className="text-xl font-bold font-display text-primary flex items-center gap-2">
                                  🎁 Xem trước thiệp NFC
                                </DialogTitle>
                              </DialogHeader>
                              <div className="py-4 max-h-[60vh] overflow-y-auto px-2 space-y-6 custom-scrollbar bg-gradient-to-br from-[#FFF9E6]/40 to-white/60 rounded-3xl p-4">
                                {item.selectedTemplate && (
                                  <div className="p-3 bg-white/80 rounded-2xl border border-primary/20 shadow-sm flex items-center gap-3">
                                    <img
                                      src={item.selectedTemplate.image}
                                      alt={item.selectedTemplate.title}
                                      className="w-14 h-14 rounded-xl object-cover border border-border/50 shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <span className="text-[10px] font-bold uppercase text-primary tracking-wider">
                                        Mẫu thiệp đã chọn
                                      </span>
                                      <h4 className="font-bold text-xs text-foreground truncate">
                                        {item.selectedTemplate.title}
                                      </h4>
                                      <p className="text-xs text-rose-600 font-extrabold mt-0.5">
                                        {formatPrice(item.selectedTemplate.price)}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                {/* Message card - scaled down version of scan gift page */}
                                <article className="relative overflow-hidden rounded-[2rem] bg-white/70 p-6 shadow-soft ring-1 ring-white/80 backdrop-blur-md transition-all duration-500 hover:shadow-coral-glow group">
                                  <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-butter/40 blur-3xl" />
                                  <div className="mb-4 flex items-center gap-3">
                                    <div className="h-px w-4 bg-clay/15" />
                                    <span className="text-[9px] font-bold uppercase tracking-[0.32em] text-clay/70">
                                      Lời chúc
                                    </span>
                                    <div className="h-px flex-1 bg-clay/15" />
                                  </div>
                                  <div className="relative z-10">
                                    <p
                                      className="whitespace-pre-line text-[14px] italic leading-relaxed text-clay/90"
                                      style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                                    >
                                      {item.greetingMessage || "Chưa có lời chúc nào được tạo."}
                                    </p>
                                  </div>
                                  <div className="mt-6 flex items-center justify-end">
                                    <div className="flex gap-1.5 opacity-70">
                                      <div className="size-1 rounded-full bg-coral/30" />
                                      <div className="size-1 rounded-full bg-coral/60" />
                                      <div className="size-1 rounded-full bg-coral" />
                                    </div>
                                  </div>
                                </article>

                                {/* Uploaded Image Card - Polaroid Style */}
                                {item.greetingImage && (
                                  <article className="relative bg-white p-3 pb-10 shadow-lg ring-1 ring-clay/5 rotate-2 transition-all duration-700 hover:-translate-y-1 hover:rotate-0 hover:shadow-coral-glow self-center mx-auto w-[85%] max-w-[240px]">
                                    <div className="pointer-events-none absolute -right-10 -top-10 size-24 rounded-full bg-rose-200/40 blur-2xl" />
                                    <div className="aspect-square w-full overflow-hidden bg-clay/5">
                                      <img src={item.greetingImage} alt="Kỷ niệm đính kèm" className="w-full h-full object-cover filter contrast-[1.05] brightness-105" />
                                    </div>
                                    <div className="absolute bottom-2.5 left-0 right-0 text-center">
                                      <p className="font-display text-xl text-clay/80 italic opacity-80" style={{ fontFamily: "Caveat, cursive" }}>For You</p>
                                    </div>
                                    {/* Pin decor */}
                                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-6 h-6 bg-black/10 rounded-full shadow-inner blur-[1px]"></div>
                                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-rose-300 rounded-full shadow-sm border border-rose-400"></div>
                                  </article>
                                )}
                              </div>
                              <div className="flex justify-end gap-3">
                                <button
                                  onClick={() => router.push(`/shop/${item.id.replace('-3d', '')}/greeting?editCartItemId=${encodeURIComponent(item.cartItemId || item.id)}${(item as any).is3D ? `&from=3d&modelUrl=${encodeURIComponent((item as any).modelUrl || '')}&customName=${encodeURIComponent(item.name)}` : ''}`)}
                                  className="w-full btn-hero px-6 py-3 rounded-xl text-black font-semibold flex items-center justify-center gap-2 shadow-coral-glow cursor-pointer"
                                >
                                  <Pencil className="w-4 h-4" />
                                  Chỉnh sửa thiệp này
                                </button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}

                      {/* Direct Edit Button on Product Component */}
                      <button
                        onClick={() => router.push(`/shop/${item.id.replace('-3d', '')}/greeting?editCartItemId=${encodeURIComponent(item.cartItemId || item.id)}${(item as any).is3D ? `&from=3d&modelUrl=${encodeURIComponent((item as any).modelUrl || '')}&customName=${encodeURIComponent(item.name)}` : ''}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/80 dark:bg-card/80 hover:bg-primary/10 hover:text-primary text-foreground border border-border hover:border-primary/40 shadow-xs transition-all cursor-pointer"
                        title="Chỉnh sửa thiệp & đơn hàng"
                      >
                        <Pencil className="w-3.5 h-3.5 text-primary" />
                        <span>Chỉnh sửa thiệp</span>
                      </button>
                    </div>

                    <div className="font-bold text-primary mt-1">
                      {formatPrice(item.price)}
                    </div>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex flex-row sm:flex-col items-center justify-between sm:items-end w-full sm:w-auto gap-4">
                    {/* Desktop layout vs Mobile layout */}
                    <div className="flex flex-col sm:flex-row items-center sm:gap-6">
                      <div className="flex items-center bg-white dark:bg-background rounded-2xl border border-primary/20 shadow-sm overflow-hidden h-9">
                        <button
                          onClick={() => updateQuantity(item.cartItemId || item.id, (item.quantity || 1) - 1)}
                          className="w-9 h-full flex items-center justify-center hover:bg-primary/10 text-primary transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-primary">{item.quantity || 1}</span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId || item.id, (item.quantity || 1) + 1)}
                          className="w-9 h-full flex items-center justify-center hover:bg-primary/10 text-primary transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <div className="font-bold text-base text-foreground">
                        {formatPrice(item.price * (item.quantity || 1))}
                      </div>
                      {(item.quantity || 1) > 1 && (
                        <div className="text-[11px] text-muted-foreground text-right">
                          {formatPrice(item.price)} / cái
                        </div>
                      )}
                      <button
                        onClick={() => {
                          removeFromCart(item.cartItemId || item.id);
                          toast.success("Đã xoá sản phẩm khỏi giỏ hàng");
                        }}
                        className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" /> Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-4">
              <div className="bg-white/60 dark:bg-card/60 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/40 sticky top-24">
                <h2 className="text-xl font-bold font-display text-foreground mb-6">
                  {language === "vi" ? "Tóm tắt đơn hàng" : "Order Summary"}
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{t("cart.subtotal")}:</span>
                    <span className="font-bold text-foreground">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{language === "vi" ? "Phí vận chuyển:" : "Shipping:"}</span>
                    <span className="font-bold text-emerald-500">
                      {subtotal === 0 || subtotal >= 500000
                        ? (language === "vi" ? "Miễn phí" : "Free")
                        : (language === "vi" ? "Từ 20.000 đ (nội thành HCM)" : "From 20,000 VND (HCM local)")}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground font-semibold">{t("cart.total")}:</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(subtotal + (subtotal >= 500000 || subtotal === 0 ? 0 : 20000))}
                    </span>
                  </div>
                  {subtotal > 0 && subtotal < 500000 && (
                    <p className="text-[11px] text-muted-foreground mt-1 text-right italic">
                      {language === "vi" ? "(Đã gồm phí ship nội thành HCM 20.000đ)" : "(Includes HCM local shipping 20,000 VND)"}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => {
                    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                    if (!token) {
                      toast.info("Vui lòng đăng nhập hoặc đăng ký để tiến hành thanh toán!");
                      router.push("/auth?redirect=/checkout");
                      return;
                    }
                    const selectedCartItems = items.filter(i => selectedItems.includes(i.cartItemId || i.id));
                    const orderItems = selectedCartItems.map(item => {
                      const hasCard = !!(item.hasGreeting || item.greetingMessage || item.greetingImage || item.selectedTemplate);
                      const cardFee = item.selectedTemplate?.price || item.cardPrice || (hasCard ? 5000 : 0);
                      return {
                        product: {
                          ...item,
                          price: item.price,
                          basePrice: item.basePrice,
                          cardPrice: cardFee,
                        },
                        quantity: item.quantity || 1,
                        cartItemId: item.cartItemId || item.id,
                        gift: hasCard ? {
                          giftTitle: item.selectedTemplate?.title || `Thiệp thông điệp`,
                          templateTitle: item.selectedTemplate?.title || "Mẫu mặc định",
                          cardPrice: cardFee,
                          senderName: item.senderName || undefined,
                          receiverName: item.receiverName || undefined,
                          message: item.greetingMessage || "",
                          previewImageUrl: item.greetingImage || item.selectedTemplate?.image || null,
                          theme: "sincere",
                          messageSource: "Manual"
                        } : null
                      };
                    });
                    setItems(orderItems);
                    router.push("/checkout");
                  }}
                  disabled={selectedItems.length === 0}
                  className="w-full btn-hero py-3.5 rounded-xl text-black font-bold text-base flex items-center justify-center shadow-coral-glow transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none"
                >
                  {language === "vi" ? "Thanh toán" : "Checkout"} {selectedItems.length > 0 ? `(${selectedItems.length})` : ""}
                </button>
                {/* <p className="text-center text-xs text-muted-foreground mt-4 font-medium">
                  {language === "vi" ? "Thanh toán sẽ sớm ra mắt ✨" : "Checkout coming soon ✨"}
                </p> */}
              </div>
            </div>
          </div>
        )}

        {/* Order History Section */}
        <div className="mt-16 space-y-6">
          <h2 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" /> {t("cart.order_history")}
          </h2>

          <div className="grid gap-4">
            {isLoadingOrders ? (
              <div className="text-center text-muted-foreground p-4">
                {language === "vi" ? "Đang tải lịch sử đơn hàng..." : "Loading order history..."}
              </div>
            ) : orderHistory.length === 0 ? (
              <div className="text-center text-muted-foreground p-4 bg-white/60 dark:bg-card/60 backdrop-blur-md rounded-2xl border border-white/40">
                {language === "vi" ? "Bạn chưa có đơn hàng nào." : "You have no orders yet."}
              </div>
            ) : orderHistory.map((order) => {
              const orderCode = order.orderCode || order.id;
              const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : (order.date || '29/9/2026');
              const status = order.orderStatus || order.status || 'Processing';
              const total = order.totalAmount ?? order.total ?? 0;
              const itemsList = Array.isArray(order.items) && order.items.length > 0
                ? order.items.map((i: any) => `${i.productName || i.name} (x${i.quantity || i.qty || 1})`).join(", ")
                : "Chi thúi (x1)";

              return (
                <div
                  key={order.id || orderCode}
                  onClick={() => handleOpenOrderDetail(order)}
                  className="bg-white/60 dark:bg-card/60 backdrop-blur-md rounded-2xl p-5 shadow-sm border border-white/40 flex flex-col md:flex-row gap-4 justify-between md:items-center transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg text-foreground">{orderCode}</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${status === 'Completed' || status === 'Đã giao thành công'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : status === 'Cancelled'
                            ? 'bg-rose-500/10 text-rose-600'
                            : 'bg-amber-500/10 text-amber-600'
                        }`}>
                        {status === 'Completed' || status === 'Đã giao thành công' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Truck className="w-3 h-3" />
                        )}
                        {status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" /> {dateStr}
                    </div>
                    <div className="text-sm font-medium">
                      {itemsList}
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end gap-1 border-t md:border-t-0 pt-3 md:pt-0 border-border/50">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tổng đơn</span>
                    <span className="font-bold text-xl text-primary">{formatPrice(total)}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenOrderDetail(order);
                      }}
                      className="text-sm font-semibold text-primary hover:underline mt-1 bg-primary/10 hover:bg-primary/20 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Details Modal */}
          <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
            <DialogContent className="sm:max-w-[700px] max-h-[88vh] overflow-y-auto bg-white dark:bg-card rounded-3xl p-6 sm:p-8 border border-primary/20 shadow-2xl custom-scrollbar">
              {selectedOrder && (
                <div className="space-y-6">
                  {/* Modal Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Chi tiết đơn hàng</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${selectedOrder.orderStatus === 'Completed' || selectedOrder.orderStatus === 'Đã giao thành công'
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            : selectedOrder.orderStatus === 'Cancelled'
                              ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          }`}>
                          {selectedOrder.orderStatus || 'Processing'}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-extrabold font-display text-foreground mt-1 flex items-center gap-2">
                        <span>{selectedOrder.orderCode || selectedOrder.id}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedOrder.orderCode || selectedOrder.id);
                            toast.success("Đã sao chép mã đơn hàng!");
                          }}
                          className="text-muted-foreground hover:text-primary transition-colors p-1 cursor-pointer"
                          title="Sao chép mã đơn"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </h2>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-muted-foreground">Tổng thanh toán</span>
                      <div className="text-xl sm:text-2xl font-bold font-display text-primary">
                        {formatPrice(selectedOrder.totalAmount ?? selectedOrder.total ?? 0)}
                      </div>
                    </div>
                  </div>

                  {/* 1. Tiến trình & Mốc thời gian đơn hàng */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border/60 space-y-3">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      Mốc thời gian xử lý đơn hàng
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Thời gian đặt hàng */}
                      <div className="p-3.5 rounded-xl bg-white dark:bg-card border border-border/40 space-y-1">
                        <span className="text-muted-foreground font-medium">Thời gian đặt hàng:</span>
                        <p className="font-semibold text-foreground text-sm">
                          {formatDateTime(selectedOrder.createdAt) || "29/09/2026 14:30:00"}
                        </p>
                        <span className="text-[10px] text-emerald-600 font-semibold block">✓ Dữ liệu thật từ hệ thống</span>
                      </div>

                      {/* Thời gian dự kiến nhận hàng */}
                      <div className="p-3.5 rounded-xl bg-white dark:bg-card border border-border/40 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground font-medium">Thời gian dự kiến nhận hàng:</span>
                          <span className="text-[10px] text-primary font-semibold">3 - 5 ngày</span>
                        </div>
                        <p className="font-semibold text-foreground text-sm">
                          {selectedOrder.orderStatus === 'Cancelled'
                            ? "Đơn hàng đã hủy"
                            : selectedOrder.orderStatus === 'Completed' || selectedOrder.orderStatus === 'Đã giao thành công'
                              ? `Đã nhận hàng (${formatDateTime(selectedOrder.updatedAt || selectedOrder.createdAt)})`
                              : getEstimatedDelivery(selectedOrder.createdAt)}
                        </p>
                        <span className="text-[10px] text-muted-foreground italic block">
                          {selectedOrder.orderStatus === 'Cancelled'
                            ? "Đơn hàng không tiếp tục giao"
                            : "Thời gian giao hàng tiêu chuẩn qua đơn vị vận chuyển"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Thông tin vận chuyển & Địa chỉ nhận hàng */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Thông tin vận chuyển */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-card border border-border/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-primary" />
                          Thông tin vận chuyển
                        </h4>
                        <span className="text-[10px] text-amber-600 font-semibold">(Mô phỏng)</span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Đơn vị vận chuyển:</span>
                          <span className="font-semibold text-foreground">Giao Hàng Nhanh (GHN)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Mã vận đơn:</span>
                          <span className="font-mono font-semibold text-primary">
                            {`GHN${(selectedOrder.orderCode || selectedOrder.id || '').replace(/[^a-zA-Z0-9]/g, '').slice(-8)}`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Phí vận chuyển:</span>
                          <span className="font-semibold text-foreground">
                            {formatPrice(selectedOrder.shippingFee || 20000)}
                          </span>
                        </div>
                        <p className="text-[10px] text-amber-600/90 italic pt-1 border-t border-border/30">
                          (Chưa có từ hệ thống - dữ liệu mô phỏng do chưa tích hợp API GHN)
                        </p>
                      </div>
                    </div>

                    {/* Địa chỉ nhận hàng */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-card border border-border/60 space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        Địa chỉ nhận hàng
                      </h4>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-sm">
                            {selectedOrder.receiverName || "Khách hàng CraftVision"}
                          </span>
                          {selectedOrder.receiverName ? (
                            <span className="text-[10px] text-emerald-600 font-semibold">✓ Từ hệ thống</span>
                          ) : (
                            <span className="text-[10px] text-amber-600 font-semibold">(Mô phỏng)</span>
                          )}
                        </div>
                        <div className="text-muted-foreground flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-primary shrink-0" />
                          <span>{selectedOrder.receiverPhone || "0987 654 321"}</span>
                          {!selectedOrder.receiverPhone && (
                            <span className="text-[10px] text-amber-600 italic">(Mô phỏng)</span>
                          )}
                        </div>
                        <div className="text-muted-foreground flex items-start gap-1.5">
                          <MapPin className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                          <span className="leading-relaxed">
                            {selectedOrder.receiverAddress || "Khu đô thị ĐHQG, Phường Linh Trung, TP. Thủ Đức, TP. Hồ Chí Minh"}
                          </span>
                          {!selectedOrder.receiverAddress && (
                            <span className="text-[10px] text-amber-600 italic shrink-0">(Mô phỏng)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Phương thức thanh toán */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-card border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-primary" />
                      <div>
                        <span className="text-muted-foreground font-medium block">Phương thức thanh toán:</span>
                        <span className="font-bold text-sm text-foreground">
                          {selectedOrder.paymentMethod === 'BankTransfer'
                            ? 'Chuyển khoản QR Banking (PayOS)'
                            : selectedOrder.paymentMethod === 'Cod'
                              ? 'Thanh toán khi nhận hàng (COD)'
                              : selectedOrder.paymentMethod || 'Thanh toán khi nhận hàng (COD)'}
                        </span>
                      </div>
                    </div>
                    <div className="sm:text-right">
                      <span className="text-muted-foreground font-medium block">Trạng thái thanh toán:</span>
                      <span className={`font-bold inline-block px-2.5 py-0.5 rounded-full text-xs ${selectedOrder.paymentStatus === 'Paid'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-amber-500/10 text-amber-600'
                        }`}>
                        {selectedOrder.paymentStatus === 'Paid' ? '✓ Đã thanh toán' : 'Chưa thanh toán'}
                      </span>
                    </div>
                  </div>

                  {/* 4. Sản phẩm đã mua & Link thiệp đã thiết kế */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-foreground flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-primary" />
                        Sản phẩm đã mua ({selectedOrder.items?.length || 1})
                      </span>
                      <span className="text-xs text-muted-foreground">Kèm link thiệp đã thiết kế</span>
                    </h4>

                    <div className="space-y-3">
                      {(selectedOrder.items && selectedOrder.items.length > 0 ? selectedOrder.items : [
                        { productName: "Chi thúi", quantity: 1, unitPrice: 120000, subTotal: 120000 }
                      ]).map((item: any, idx: number) => {
                        const hasRealGift = !!item.gift?.secretKey;
                        const giftUrl = hasRealGift
                          ? `/gift/scan/${item.gift.secretKey}`
                          : `/gift/scan/sample`;

                        return (
                          <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-card border border-border/60 shadow-xs space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted shrink-0 border border-border/40">
                                <img
                                  src={item.productImageUrl || item.image || "/dreamy-hero-bg.jpg"}
                                  alt={item.productName || item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-sm text-foreground truncate">
                                  {item.productName || item.name || "Sản phẩm thủ công"}
                                </h5>
                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                  <span>Số lượng: <strong className="text-foreground">{item.quantity || item.qty || 1}</strong></span>
                                  <span>Đơn giá: <strong className="text-foreground">{formatPrice(item.unitPrice || 120000)}</strong></span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-bold text-primary">
                                  {formatPrice(item.subTotal || ((item.unitPrice || 120000) * (item.quantity || 1)))}
                                </span>
                              </div>
                            </div>

                            {/* Khối link thiệp đã thiết kế */}
                            <div className="p-3 rounded-xl bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-950/20 dark:to-orange-950/20 border border-rose-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-2 min-w-0">
                                <Gift className="w-4 h-4 text-rose-500 shrink-0" />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-foreground truncate">
                                      {item.gift?.giftTitle || "Thiệp NFC thông minh kèm quà tặng"}
                                    </span>
                                    {hasRealGift ? (
                                      <span className="text-[10px] text-emerald-600 font-bold">✓ Thiệp thật</span>
                                    ) : (
                                      <span className="text-[10px] text-amber-600 font-bold">(Mô phỏng)</span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-muted-foreground truncate">
                                    {item.gift?.receiverName ? `Dành tặng: ${item.gift.receiverName}` : "Gửi trao yêu thương qua thiệp NFC thông minh"}
                                  </p>
                                </div>
                              </div>

                              <Link
                                href={giftUrl}
                                target="_blank"
                                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold transition-all shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Xem thiệp đã thiết kế</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </div>
                            {!hasRealGift && (
                              <p className="text-[10px] text-amber-600 italic">
                                * Đơn hàng này được tạo khi chưa liên kết thiệp NFC hoặc backend chưa trả secretKey (Chưa có từ hệ thống - dữ liệu thiệp mô phỏng).
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="pt-4 border-t border-border/50 flex justify-end">
                    <button
                      onClick={() => setIsDetailModalOpen(false)}
                      className="px-6 py-2.5 rounded-xl font-semibold border border-border hover:bg-muted text-foreground text-sm transition-colors cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Pagination Controls */}
          {orderHistory.length > 0 && (
            <div className="flex items-center justify-center gap-3 mt-6 bg-white/40 dark:bg-card/40 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isLoadingOrders}
                className="p-2 rounded-xl bg-background border border-border hover:bg-muted hover:text-primary transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-bold min-w-24 text-center">
                Trang {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isLoadingOrders}
                className="p-2 rounded-xl bg-background border border-border hover:bg-muted hover:text-primary transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

      </div>
    </AppShell>
  );
}
