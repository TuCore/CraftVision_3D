"use client";

import { useWishlistStore } from "@/store/useWishlistStore";
import { useOrderStore } from "@/store/useOrderStore";
import { AppShell } from "@/components/AppShell";
import { ShoppingCart, Trash2, Minus, Plus } from "lucide-react";
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

export default function CartPage() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, clearWishlist } = useWishlistStore();
  const { setItems } = useOrderStore();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);

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
                  {/* Checkbox */}
                  <div className="flex items-center self-start sm:self-auto pt-2 sm:pt-0">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded-md border-gray-300 text-primary focus:ring-primary accent-primary cursor-pointer"
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
                  </div>

                  {/* Product Image */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 shadow-sm border border-border/50">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 w-full text-center sm:text-left">
                    <h3 className="font-bold text-foreground mb-1 text-base sm:text-lg line-clamp-1">{item.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2">Phân loại: {item.category}</p>
                    
                    {/* Greeting Indicator & Preview */}
                    {(item.hasGreeting || item.greetingMessage || item.greetingImage) && (
                      <div className="inline-flex items-center gap-2 mb-2 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-semibold">
                        <span>🎁 Đã kèm thiệp</span>
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="ml-1 text-emerald-600 hover:text-emerald-700 underline underline-offset-2">
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
                                onClick={() => router.push(`/shop/${item.id}/greeting`)}
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
                      <div className="flex items-center bg-white dark:bg-background rounded-full border border-border shadow-sm overflow-hidden h-9">
                        <button 
                          onClick={() => updateQuantity(item.cartItemId || item.id, (item.quantity || 1) - 1)}
                          className="w-9 h-full flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity || 1}</span>
                        <button 
                          onClick={() => updateQuantity(item.cartItemId || item.id, (item.quantity || 1) + 1)}
                          className="w-9 h-full flex items-center justify-center hover:bg-muted transition-colors"
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
      </div>
    </AppShell>
  );
}
