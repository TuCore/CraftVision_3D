"use client";

import { AppShell } from "@/components/AppShell";
import Link from "next/link";
import { Camera, MapPin, Mail, Calendar, Award, Gift, Heart, Sparkles, Edit3 } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/apiClient";
import api from "@/lib/api";
import { mockProducts } from "@/lib/mock-products";
import { toast } from "sonner";
import { Store, Package, CheckCircle, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ProfilePage() {
  const [fullName, setFullName] = useState("Nguyễn Minh");
  const [email, setEmail] = useState("minh@craft.vn");
  const [bio, setBio] = useState('"Sáng tạo là hạnh phúc." — Handmade creator 💛');

  const [location, setLocation] = useState("Đang tải...");
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

    // Lấy vị trí qua IP
    fetch("https://ipapi.co/json/")
      .then(r => r.json())
      .then(data => {
        if(data.city && data.country_name) {
          setLocation(`${data.city}, ${data.country_name}`);
        } else {
          setLocation("Không xác định");
        }
      })
      .catch(() => setLocation("Hà Nội, Việt Nam"));
  }, []);

  const badges = [
    { icon: Award, label: "Creator cấp 5", color: "from-amber-400 to-orange-500" },
    { icon: Gift, label: "12 dự án", color: "from-emerald-400 to-teal-500" },
    { icon: Sparkles, label: "AI Explorer", color: "from-violet-400 to-fuchsia-500" },
  ];

  const gallery = [
    { title: "Hộp quà 3D pastel", likes: 42, color: "oklch(0.82 0.16 25)" },
    { title: "Vòng tay macramé", likes: 28, color: "oklch(0.85 0.14 145)" },
    { title: "Thiệp pop-up hoa", likes: 67, color: "oklch(0.86 0.15 85)" },
    { title: "Đèn giấy origami", likes: 51, color: "oklch(0.83 0.16 265)" },
    { title: "Set trà chiều", likes: 39, color: "oklch(0.84 0.15 45)" },
    { title: "Album ảnh scrap", likes: 22, color: "oklch(0.82 0.16 340)" },
  ];

  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "shipping" | "completed">("all");
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);

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
  }, []);

  const handleReceiveOrder = async (orderId: string) => {
    try {
      await api.patch(`/api/orders/${orderId}/receive`);
      toast.success("Đã nhận được hàng thành công!");
      loadOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi xác nhận nhận hàng");
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
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Cover + profile */}
        <div className="glass-strong rounded-3xl overflow-hidden">
          {/* Đổi background thành màu pastel trơn */}
          <div className="h-40 md:h-56 relative" style={{ background: "oklch(0.95 0.03 340)" }}>
            <button className="absolute top-4 right-4 rounded-xl bg-card/80 backdrop-blur px-3 py-1.5 text-xs font-medium inline-flex items-center gap-1.5 hover:bg-card transition-colors">
              <Camera className="h-3.5 w-3.5" /> Đổi ảnh bìa
            </button>
          </div>
          
          <div className="px-6 md:px-10 pb-8 -mt-16 relative flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="h-28 w-28 md:h-32 md:w-32 rounded-full bg-card grid place-items-center text-4xl font-bold text-primary border-4 border-card shadow-soft overflow-hidden">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <button className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-card shadow-soft grid place-items-center hover:bg-primary hover:text-primary-foreground transition-colors border border-border">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            
            {/* Tên và thông tin kéo xuống dưới khung màu và avatar */}
            <div className="flex flex-col items-center mb-4">
              <div className="flex items-center gap-2 justify-center">
                <h1 className="text-2xl md:text-3xl font-bold font-display text-foreground">{fullName}</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">PRO</span>
              </div>
              <p className="text-muted-foreground mt-2 whitespace-pre-wrap">{bio}</p>
              <div className="flex flex-wrap gap-4 mt-3 justify-center text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {location}</span>
                <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {email}</span>
                <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {joinedDate}</span>
              </div>
            </div>
            
            <Link href="/settings" className="btn-hero inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold mb-8 hover:scale-105 transition-transform">
              <Edit3 className="h-4 w-4" /> Chỉnh sửa
            </Link>

            <div className="w-full max-w-lg mx-auto grid grid-cols-2 divide-x divide-border rounded-2xl bg-card/60 py-4 border border-border/50">
              <div className="text-center cursor-pointer hover:bg-muted/50 rounded-l-2xl transition-colors py-2">
                <div className="text-2xl font-bold font-display text-primary">12</div>
                <div className="text-xs text-muted-foreground mt-1 font-medium">Dự án handmade</div>
              </div>
              <div 
                className="text-center cursor-pointer hover:bg-muted/50 rounded-r-2xl transition-colors py-2"
                onClick={() => setIsOrderHistoryOpen(true)}
              >
                <div className="text-2xl font-bold font-display text-primary">5</div>
                <div className="text-xs text-muted-foreground mt-1 font-medium">Sản phẩm đã mua</div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <section className="glass-card rounded-3xl p-6">
          <h2 className="font-bold font-display mb-4">Thành tựu</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {badges.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.label} className="flex items-center gap-3 bg-card/70 rounded-xl p-3">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${b.color} grid place-items-center text-white shrink-0`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">{b.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Gallery */}
        <section>
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-2xl font-bold font-display">Bộ sưu tập của tôi</h2>
            <div className="flex gap-1 p-1 bg-card/60 rounded-xl text-sm">
              <button className="px-3 py-1.5 rounded-lg btn-hero">Đã hoàn thành</button>
              <button className="px-3 py-1.5 rounded-lg text-muted-foreground">Đã lưu</button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {gallery.map((g) => (
              <div key={g.title} className="glass-card rounded-2xl overflow-hidden group cursor-pointer">
                <div className="aspect-square relative" style={{ background: `linear-gradient(135deg, ${g.color}, oklch(0.92 0.06 85))` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-3">
                  <div className="font-medium text-sm truncate">{g.title}</div>
                </div>
              </div>
            ))}
          </div>
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
                        {order.orderStatus === "Completed" ? "Đã nhận hàng" : order.orderStatus === "Cancelled" ? "Đã hủy" : "Đang giao hàng"}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="p-4 flex flex-col gap-4">
                      {order.items?.map((item: any) => {
                        const product = mockProducts.find(p => p.id === item.productId);
                        const imageUrl = product ? product.image : "https://via.placeholder.com/150";
                        return (
                          <div key={item.id} className="flex gap-4 items-start">
                            <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden shrink-0 border border-border/50">
                              <img src={imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-foreground line-clamp-2 leading-tight">{item.productName}</h3>
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
                        {["Pending", "Processing", "Shipping"].includes(order.orderStatus) && (
                          <button 
                            onClick={() => handleReceiveOrder(order.id)}
                            className="flex-1 sm:flex-none btn-hero px-6 py-2 rounded-lg font-medium text-sm transition-transform hover:scale-105 shadow-coral-glow"
                          >
                            Đã nhận được hàng
                          </button>
                        )}
                        {order.orderStatus === "Completed" && (
                          <button className="flex-1 sm:flex-none border border-border bg-white text-foreground hover:bg-muted px-6 py-2 rounded-lg font-medium text-sm transition-colors">
                            Đánh giá
                          </button>
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
      </div>
    </AppShell>
  );
}
