"use client";

import { AppShell } from "@/components/AppShell";
import Link from "next/link";
import { Camera, MapPin, Mail, Calendar, Award, Gift, Heart, Sparkles, Edit3, Grid, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/apiClient";
import api from "@/lib/api";
import { toast } from "sonner";
import { Store, Package, CheckCircle, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { useRouter } from "next/navigation";
import { TiltCard } from "@/components/TiltCard";
import { motion, AnimatePresence } from "framer-motion";
import { ReviewModal } from "@/components/ReviewModal";
export default function ProfilePage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("Nguyễn Minh");
  const [email, setEmail] = useState("minh@craft.vn");
  const [bio, setBio] = useState('"Sáng tạo là hạnh phúc." — Handmade creator 💛');

  const [joinedDate, setJoinedDate] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchApi("/api/user/profile");
        if (data.fullName) setFullName(data.fullName);
        if (data.email) setEmail(data.email);
        if (data.bio) setBio(data.bio);
        
        if (data.createdAt) {
          const d = new Date(data.createdAt);
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const yyyy = d.getFullYear();
          setJoinedDate(`Tham gia ${mm}/${yyyy}`);
        } else {
          setJoinedDate("Thành viên mới");
        }
      } catch (error) {
        console.error("Lỗi khi tải hồ sơ:", error);
      }
    };
    
    loadProfile();
  }, []);

  const badges = [
    { icon: Award, label: "Creator cấp 5", color: "from-amber-400 to-orange-500" },
    { icon: Gift, label: "12 dự án", color: "from-emerald-400 to-teal-500" },
    { icon: Sparkles, label: "AI Explorer", color: "from-violet-400 to-fuchsia-500" },
  ];

  const collectionData = [
    { title: "Bó hoa giấy pastel", price: 125000, time: "2h", progress: 70, color: "from-orange-300 to-amber-200" },
    { title: "Hộp quà 3D + QR", price: 210000, time: "3.5h", progress: 40, color: "from-yellow-400 to-amber-300" },
    { title: "Vòng tay macramé", price: 65000, time: "1h", progress: 90, color: "from-green-400 to-emerald-300" },
  ];

  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "shipping" | "completed">("all");
  const [activeCollectionTab, setActiveCollectionTab] = useState<"collection" | "favorites">("collection");
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  
  const { favoriteIds, toggleFavorite, isFavorite } = useFavoriteStore();
  const [allProducts, setAllProducts] = useState<any[]>([]);

  // Custom dialog state for Cancel Order
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await api.get("/api/orders/me");
      if (res.data && res.data.items) {
        setOrders(res.data.items);
      }
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadOrders();

    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setAllProducts(data.items || []);
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    };
    fetchProducts();
  }, []);

  const favoriteProducts = allProducts.filter(p => favoriteIds.includes(p.id)).map(p => {
    let cat = p.categoryName || "Khác";
    const nameLower = p.name.toLowerCase();
    if (nameLower.includes("charm")) cat = "Charm";
    else if (nameLower.includes("móc khóa") || nameLower.includes("móc khoá")) cat = "Móc khoá";
    else if (nameLower.includes("dây chuyền")) cat = "Dây chuyền";
    else if (nameLower.includes("vòng tay")) cat = "Vòng tay";
    else if (nameLower.includes("đồ trang trí") || nameLower.includes("decor")) cat = "Đồ trang trí";

    return {
      id: p.id,
      name: p.name,
      price: p.price,
      category: cat,
      image: p.sampleImageUrl || p.thumbnailUrl || "/image/placeholder.jpg",
      rating: 4.9,
    };
  });

  const handleReceiveOrder = async (orderId: string) => {
    try {
      await api.patch(`/api/orders/${orderId}/receive`);
      toast.success("Đã nhận được hàng thành công!");
      loadOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi xác nhận nhận hàng");
    }
  };

  const promptCancelOrder = (orderId: string) => {
    setOrderToCancel(orderId);
    setCancelDialogOpen(true);
  };

  const executeCancelOrder = async () => {
    if (!orderToCancel) return;
    try {
      await api.patch(`/api/orders/${orderToCancel}/cancel`);
      toast.success("Đã hủy đơn hàng thành công!");
      setCancelDialogOpen(false);
      setOrderToCancel(null);
      loadOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi hủy đơn hàng");
      setCancelDialogOpen(false);
    }
  };

  const getFilteredOrders = () => {
    if (activeTab === "all") return orders;
    if (activeTab === "shipping") return orders.filter(o => ["Pending", "Processing", "Shipping", "Reserved"].includes(o.orderStatus));
    if (activeTab === "completed") return orders.filter(o => ["Completed", "Delivered"].includes(o.orderStatus));
    return orders;
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  return (
    <AppShell active="profile">
      <div className="mx-auto max-w-5xl">
        {/* Profile Header (Instagram Style) */}
        <div className="pt-2 pb-2 max-w-3xl mx-auto">
          {/* Avatar and Info Container */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            
            {/* Avatar */}
            <div className="shrink-0 relative">
              <div className="h-16 w-16 md:h-20 md:w-20 rounded-full border-2 border-white shadow-sm overflow-hidden bg-muted">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col items-center sm:items-start gap-1 mt-2 sm:mt-0">
              {/* Name & Badge */}
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold font-display text-foreground tracking-tight">{fullName}</h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[9px] font-bold text-emerald-700 tracking-wider uppercase">Creator</span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-xs md:text-sm mt-0.5">
                <div className="flex flex-col items-center"><span className="font-bold text-foreground text-sm">12</span> <span className="text-muted-foreground text-[10px]">Dự án</span></div>
                <div className="flex flex-col items-center cursor-pointer" onClick={() => setIsOrderHistoryOpen(true)}>
                  <span className="font-bold text-foreground text-sm">{orders.length}</span> <span className="text-muted-foreground text-[10px]">Đã mua</span>
                </div>
                <div className="flex flex-col items-center"><span className="font-bold text-foreground text-sm">{favoriteIds.length}</span> <span className="text-muted-foreground text-[10px]">Yêu thích</span></div>
              </div>

              {/* Bio & Email */}
              <div className="text-xs text-foreground mt-1 text-center sm:text-left">
                <div className="text-muted-foreground">{email}</div>
                <div className="mt-1 italic text-muted-foreground whitespace-pre-wrap">{bio}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-3">
            <Link href="/settings" className="flex-1 py-1.5 bg-white border border-gray-200 shadow-sm text-foreground font-semibold text-xs rounded-lg text-center transition-all hover:bg-gray-50 active:scale-95">
              Chỉnh sửa trang cá nhân
            </Link>
            <button 
              onClick={() => setIsOrderHistoryOpen(true)}
              className="flex-1 py-1.5 bg-white border border-gray-200 shadow-sm text-foreground font-semibold text-xs rounded-lg text-center transition-all hover:bg-gray-50 active:scale-95"
            >
              Lịch sử mua hàng
            </button>
          </div>
        </div>

        <section className="max-w-4xl mx-auto mt-4">
          <div className="relative flex border-b border-border mb-4">
            <button 
              onClick={() => setActiveCollectionTab("collection")}
              className={`flex-1 py-3 text-xs md:text-sm font-bold tracking-wider transition-colors z-10 ${activeCollectionTab === "collection" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              DỰ ÁN CỦA TÔI
            </button>
            <button 
              onClick={() => setActiveCollectionTab("favorites")}
              className={`flex-1 py-3 text-xs md:text-sm font-bold tracking-wider transition-colors z-10 ${activeCollectionTab === "favorites" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              YÊU THÍCH
            </button>
            {/* Sliding Underline */}
            <div 
              className="absolute bottom-[0px] left-0 h-[1.5px] w-1/2 bg-foreground transition-transform duration-300 ease-out"
              style={{ transform: activeCollectionTab === "collection" ? "translateX(0%)" : "translateX(100%)" }}
            />
          </div>
          
          <AnimatePresence mode="wait">
            {activeCollectionTab === "collection" && (
              <motion.div 
                key="collection"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
              >
                {collectionData.map((item) => (
                  <div key={item.title} className="flex flex-col group cursor-pointer">
                    <div className={`aspect-square rounded-2xl bg-gradient-to-br ${item.color} shadow-sm overflow-hidden relative mb-3 transition-transform group-hover:scale-95`}>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-sm md:text-base line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h3>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-bold text-primary text-xs md:text-sm">{formatPrice(item.price)}</span>
                        <span className="text-xs flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3"/> {item.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeCollectionTab === "favorites" && (
              <motion.div 
                key="favorites"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4"
              >
                {favoriteProducts.length > 0 ? favoriteProducts.map((product, index) => (
                  <TiltCard
                    key={product.id}
                    onClick={() => router.push(`/shop/${product.id}`)}
                    className="flex flex-col group cursor-pointer"
                  >
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-2 shadow-sm transition-transform group-hover:scale-95">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="relative z-10 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-2 left-2 z-20 glass-strong px-2 py-1 rounded-lg text-[10px] font-semibold text-foreground">
                        {product.category}
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(product.id);
                        }}
                        className="absolute top-2 right-2 z-20 p-2 rounded-full glass-strong hover:bg-white/80 transition-colors"
                      >
                        <Heart
                          className={`h-4 w-4 ${isFavorite(product.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
                        />
                      </button>
                    </div>
                    
                    <div className="flex-1 flex flex-col">
                      <h3 className="font-bold text-foreground text-sm md:text-base line-clamp-1 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-bold text-primary text-sm">{formatPrice(product.price)}</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {product.rating}
                        </span>
                      </div>
                    </div>
                  </TiltCard>
                )) : (
                  <div className="col-span-2 md:col-span-3 text-center py-12 text-muted-foreground">
                    Bạn chưa có sản phẩm yêu thích nào.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Order History Modal */}
        <Dialog open={isOrderHistoryOpen} onOpenChange={setIsOrderHistoryOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 bg-background/95 backdrop-blur-md border-border/50">
            <DialogHeader className="p-6 pb-2 border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur z-10">
              <DialogTitle className="text-2xl font-bold font-display">Lịch sử đơn hàng</DialogTitle>
            </DialogHeader>

            <div className="p-6 pt-2">
              <div className="bg-white rounded-xl shadow-sm border border-border/50 overflow-hidden mb-6">
                <div className="flex border-b border-border/50">
              <button 
                onClick={() => setActiveTab("all")}
                className={`flex-1 py-4 text-center font-medium text-sm transition-colors relative ${activeTab === "all" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                Tất cả
                {activeTab === "all" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
              </button>
              <button 
                onClick={() => setActiveTab("shipping")}
                className={`flex-1 py-4 text-center font-medium text-sm transition-colors relative ${activeTab === "shipping" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                Đang ship
                {activeTab === "shipping" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
              </button>
              <button 
                onClick={() => setActiveTab("completed")}
                className={`flex-1 py-4 text-center font-medium text-sm transition-colors relative ${activeTab === "completed" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                Đã hoàn thành
                {activeTab === "completed" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
              </button>
            </div>

            <div className="p-4 bg-background/30 min-h-[300px] flex flex-col gap-4">
              {loadingOrders ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                  Đang tải đơn hàng...
                </div>
              ) : getFilteredOrders().length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Package className="w-16 h-16 mb-4 opacity-20" />
                  <p>Chưa có đơn hàng nào</p>
                </div>
              ) : (
                getFilteredOrders().map((order) => (
                  <div key={order.id} className="bg-white border border-border/50 rounded-xl overflow-hidden shadow-sm">
                    {/* Shop Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border/30 bg-muted/10">
                      <div className="flex items-center gap-2 font-medium">
                        <Store className="w-4 h-4 text-primary" />
                        <span>CraftVision Mall</span>
                        <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-1">Mall</span>
                      </div>
                      <div className="text-sm font-semibold text-primary uppercase">
                        {order.orderStatus === "Delivered" ? "Đã nhận hàng" : order.orderStatus === "Cancelled" ? "Đã hủy" : "Đang giao hàng"}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="p-4 flex flex-col gap-4">
                      {order.items?.map((item: any) => {
                        const imageUrl = item.productImageUrl || "https://via.placeholder.com/150";
                        return (
                          <div key={item.id} className="flex gap-4 items-start">
                            <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden shrink-0 border border-border/50">
                              <img src={imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <Link href={`/shop/${item.productId}`} className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2 leading-tight">
                                {item.productName}
                              </Link>
                              <p className="text-sm text-muted-foreground mt-1">Phân loại: Tùy chỉnh</p>
                              <p className="text-sm mt-1">x{item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <span className="font-medium text-primary">{formatPrice(item.unitPrice)}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Footer / Total / Action */}
                    <div className="p-4 border-t border-border/30 bg-muted/5 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
                      <div className="text-sm text-muted-foreground w-full sm:w-auto text-right sm:text-left">
                        Tổng số tiền: <span className="text-lg font-bold text-primary ml-2">{formatPrice(order.totalAmount)}</span>
                      </div>
                      <div className="flex gap-3 w-full sm:w-auto">
                        {["Pending", "Processing"].includes(order.orderStatus) && (
                          <button 
                            onClick={() => promptCancelOrder(order.id)}
                            className="flex-1 sm:flex-none border border-red-500 text-red-500 bg-white hover:bg-red-50 px-6 py-2 rounded-lg font-medium text-sm transition-colors"
                          >
                            Hủy đơn hàng
                          </button>
                        )}
                        {["ReadyToShip", "Shipped"].includes(order.orderStatus) && (
                          <button 
                            onClick={() => handleReceiveOrder(order.id)}
                            className="flex-1 sm:flex-none btn-hero px-6 py-2 rounded-lg font-medium text-sm transition-transform hover:scale-105 shadow-coral-glow text-white"
                          >
                            Đã nhận được hàng
                          </button>
                        )}
                        {["Delivered", "Cancelled"].includes(order.orderStatus) && order.items?.[0] && (
                          <>
                            {order.orderStatus === "Delivered" && (
                              <button 
                                onClick={() => {
                                  router.push(`/shop/${order.items[0].productId}?review=true#reviews`);
                                }}
                                className="flex-1 sm:flex-none border border-black text-black bg-white hover:bg-gray-50 px-6 py-2 rounded-lg font-medium text-sm transition-colors text-center"
                              >
                                Đánh giá
                              </button>
                            )}
                            <Link 
                              href={`/shop/${order.items[0].productId}`}
                              className="flex-1 sm:flex-none btn-hero text-white px-6 py-2 rounded-lg font-medium text-sm transition-transform hover:scale-105 shadow-coral-glow text-center"
                            >
                              Mua lại
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Cancel Confirm Dialog */}
        <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <AlertDialogContent className="rounded-2xl max-w-md bg-background/95 backdrop-blur-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold font-display text-foreground">Hủy đơn hàng</AlertDialogTitle>
              <AlertDialogDescription className="text-base text-muted-foreground">
                Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6">
              <AlertDialogCancel className="rounded-xl px-6 font-bold" onClick={() => setOrderToCancel(null)}>Không hủy</AlertDialogCancel>
              <AlertDialogAction 
                onClick={executeCancelOrder} 
                className="rounded-xl px-6 font-bold bg-rose-500 hover:bg-rose-600 text-white"
              >
                Đồng ý hủy
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppShell>
  );
}
