"use client";

import { useWishlistStore } from "@/store/useWishlistStore";
import { useOrderStore } from "@/store/useOrderStore";
import { AppShell } from "@/components/AppShell";
import { ShoppingCart, Trash2, Minus, Plus, Package, Calendar, CheckCircle2, Truck, ChevronLeft, ChevronRight } from "lucide-react";
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

export default function CartPage() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, clearWishlist } = useWishlistStore();
  const { setItems } = useOrderStore();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoadingOrders(true);
      try {
        const res = await api.get(`/api/orders/me?page=${page}&size=${pageSize}`);
        if (res.data) {
          if (Array.isArray(res.data.items)) {
            setOrderHistory(res.data.items.map((o: any) => ({
              id: o.orderCode || o.id,
              date: new Date(o.createdAt).toLocaleDateString('vi-VN'),
              status: o.orderStatus,
              total: o.totalAmount,
              items: o.items.map((i: any) => ({
                name: i.productName,
                qty: i.quantity
              }))
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
  }, [page, pageSize]);

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
          Giỏ hàng của bạn
        </h1>

        {items.length === 0 ? (
          <div className="glass-card rounded-3xl p-16 text-center space-y-6 flex flex-col items-center shadow-sm">
            <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingCart className="w-10 h-10 text-rose-400" />
            </div>
            <h2 className="text-2xl font-bold font-display">Giỏ hàng trống</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy tiếp tục mua sắm nhé!
            </p>
            <Link href="/shop" className="btn-hero px-8 py-3 rounded-xl font-bold inline-block mt-4 text-white">
              Tiếp tục mua sắm
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
                    
                    {/* Greeting Indicator & Preview */}
                    {(item.hasGreeting || item.greetingMessage || item.greetingImage) && (
                      <div className="inline-flex items-center gap-1.5 mb-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold shadow-sm transition-all hover:bg-primary/15">
                        <span className="flex items-center gap-1.5">
                          <span className="text-sm">🎁</span> Đã kèm thiệp
                        </span>
                        <div className="w-px h-3 bg-primary/30 mx-0.5"></div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="hover:text-primary/70 transition-colors underline-offset-4 hover:underline outline-none">
                              Xem trước
                            </button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[400px] bg-white rounded-3xl p-6 border-primary/20">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-bold font-display text-primary flex items-center gap-2">
                                🎁 Xem trước thiệp NFC
                              </DialogTitle>
                            </DialogHeader>
                            <div className="py-4 max-h-[60vh] overflow-y-auto px-2 space-y-6 custom-scrollbar bg-gradient-to-br from-[#FFF9E6]/40 to-white/60 rounded-3xl p-4">
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
                                onClick={() => router.push(`/shop/${item.id.replace('-3d', '')}/greeting${(item as any).is3D ? `?from=3d&modelUrl=${encodeURIComponent((item as any).modelUrl || '')}&customName=${encodeURIComponent(item.name)}` : ''}`)}
                                className="w-full btn-hero px-6 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-coral-glow"
                              >
                                Chỉnh sửa thiệp
                              </button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                    
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
                  Tóm tắt đơn hàng
                </h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Tạm tính:</span>
                    <span className="font-bold text-foreground">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Phí vận chuyển:</span>
                    <span className="font-bold text-emerald-500">Miễn phí</span>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground font-semibold">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    const selectedCartItems = items.filter(i => selectedItems.includes(i.cartItemId || i.id));
                    const orderItems = selectedCartItems.map(item => ({
                      product: item,
                      quantity: item.quantity || 1,
                      cartItemId: item.cartItemId || item.id,
                      gift: (item.hasGreeting || item.greetingMessage || item.greetingImage) ? {
                        giftTitle: `Quà tặng kèm`,
                        senderName: item.senderName || undefined,
                        receiverName: item.receiverName || undefined,
                        message: item.greetingMessage || "",
                        previewImageUrl: item.greetingImage || null,
                        theme: "sincere",
                        messageSource: "Manual"
                      } : null
                    }));
                    setItems(orderItems);
                    router.push("/checkout");
                  }}
                  disabled={selectedItems.length === 0}
                  className="w-full btn-hero py-3.5 rounded-xl text-white font-bold text-base flex items-center justify-center shadow-coral-glow transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none"
                >
                  Thanh toán {selectedItems.length > 0 ? `(${selectedItems.length})` : ""}
                </button>
                <p className="text-center text-xs text-muted-foreground mt-4 font-medium">
                  Thanh toán sẽ sớm ra mắt ✨
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Order History Section */}
        <div className="mt-16 space-y-6">
          <h2 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" /> Lịch sử đơn hàng
          </h2>
          
          <div className="grid gap-4">
            {isLoadingOrders ? (
              <div className="text-center text-muted-foreground p-4">Đang tải lịch sử đơn hàng...</div>
            ) : orderHistory.length === 0 ? (
              <div className="text-center text-muted-foreground p-4 bg-white/60 dark:bg-card/60 backdrop-blur-md rounded-2xl border border-white/40">
                Bạn chưa có đơn hàng nào.
              </div>
            ) : orderHistory.map((order) => (
              <div key={order.id} className="bg-white/60 dark:bg-card/60 backdrop-blur-md rounded-2xl p-5 shadow-sm border border-white/40 flex flex-col md:flex-row gap-4 justify-between md:items-center transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-foreground">{order.id}</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${order.status === 'Đã giao thành công' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                      {order.status === 'Đã giao thành công' ? <CheckCircle2 className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" /> {order.date}
                  </div>
                  <div className="text-sm font-medium">
                    {order.items.map((i: any) => `${i.name} (x${i.qty})`).join(", ")}
                  </div>
                </div>
                <div className="flex flex-col md:items-end gap-1 border-t md:border-t-0 pt-3 md:pt-0 border-border/50">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tổng đơn</span>
                  <span className="font-bold text-xl text-primary">{formatPrice(order.total)}</span>
                  <button className="text-sm font-semibold text-primary hover:underline mt-1 bg-primary/5 px-3 py-1.5 rounded-lg">Xem chi tiết</button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {orderHistory.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 bg-white/40 dark:bg-card/40 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                <span>Hiển thị</span>
                <select 
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="bg-background border border-border rounded-lg px-2 py-1 text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                >
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
                <span>đơn hàng</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoadingOrders}
                  className="p-2 rounded-xl bg-background border border-border hover:bg-muted hover:text-primary transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-bold w-24 text-center">
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
            </div>
          )}
        </div>

      </div>
    </AppShell>
  );
}
