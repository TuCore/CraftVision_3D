"use client";

import { AppShell } from "@/components/AppShell";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, 
  Bell, 
  Lock, 
  Palette, 
  Globe, 
  CreditCard, 
  LogOut, 
  ChevronRight, 
  Trash2, 
  Sparkles, 
  Camera, 
  MapPin, 
  Plus, 
  AlertTriangle, 
  Loader2,
  Package,
  Store,
  Clock,
  Eye,
  CheckCircle2,
  Truck,
  Phone,
  Copy,
  ExternalLink,
  Calendar,
  Gift
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState, useEffect, useRef } from "react";
import { ProvinceDistrictSelect } from "@/components/common/ProvinceDistrictSelect";
import { fetchApi } from "@/lib/apiClient";
import { useTheme } from "next-themes";
import { useTranslation } from "@/components/LanguageProvider";
import { Language } from "@/lib/dictionaries";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { t, language, setLanguage } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState("account");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam) {
        setTab(tabParam);
      }
    }
  }, []);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  interface Address {
    id: string;
    receiverName: string;
    phone: string;
    address: string;
    province: string;
    district: string;
    isDefault: boolean;
  }
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({});

  // Order History State
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeOrderTab, setActiveOrderTab] = useState<"all" | "shipping" | "completed">("all");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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
    if (tab === "orders") {
      loadOrders();
    }
  }, [tab]);

  const handleReceiveOrder = async (orderId: string) => {
    try {
      await api.patch(`/api/orders/${orderId}/receive`);
      const { toast } = await import("sonner");
      toast.success("Đã nhận được hàng thành công!");
      loadOrders();
    } catch (error: any) {
      const { toast } = await import("sonner");
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
      const { toast } = await import("sonner");
      toast.success("Đã hủy đơn hàng thành công!");
      setCancelDialogOpen(false);
      setOrderToCancel(null);
      loadOrders();
    } catch (error: any) {
      const { toast } = await import("sonner");
      toast.error(error.response?.data?.message || "Lỗi khi hủy đơn hàng");
      setCancelDialogOpen(false);
    }
  };

  const handleOpenOrderDetail = async (order: any) => {
    setSelectedOrderDetail(order);
    setIsDetailModalOpen(true);
    try {
      const res = await api.get(`/api/orders/${order.id}`);
      if (res.data) {
        setSelectedOrderDetail(res.data);
      }
    } catch (err) {
      console.error("Lỗi lấy chi tiết đơn hàng:", err);
    }
  };

  const getFilteredOrders = () => {
    if (activeOrderTab === "all") return orders;
    if (activeOrderTab === "shipping") return orders.filter(o => ["Pending", "Processing", "Shipping", "ReadyToShip", "Reserved"].includes(o.orderStatus));
    if (activeOrderTab === "completed") return orders.filter(o => ["Completed", "Delivered"].includes(o.orderStatus));
    return orders;
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val || 0);
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return `${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} ${d.toLocaleDateString('vi-VN')}`;
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

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchApi("/api/user/profile");
        setFullName(data.fullName || "");
        setEmail(data.email || "");
        setDisplayName(data.displayName || "");
        setPhone(data.phone || "");
        setBio(data.bio || "");
        setAvatarUrl(data.avatarUrl || "");
        
        const addrData = await fetchApi("/api/user/addresses");
        if (Array.isArray(addrData)) {
          setAddresses(addrData);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetchApi("/api/uploads", {
        method: "POST",
        body: formData,
      });
      setAvatarUrl(res.cloudinaryUrl);
      import("sonner").then(({ toast }) => toast.success("Tải ảnh lên thành công!"));
    } catch (err: any) {
      import("sonner").then(({ toast }) => toast.error(err.message || "Lỗi khi tải ảnh lên"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      await fetchApi("/api/user/profile", {
        method: "PUT",
        body: JSON.stringify({
          fullName,
          displayName,
          phone,
          bio,
          avatarUrl
        })
      });
      // Vẫn lưu name lên local storage để Navbar có thể hiển thị nếu cần thiết
      localStorage.setItem("fullName", fullName);
      if (avatarUrl) localStorage.setItem("avatarUrl", avatarUrl);
      import("sonner").then(({ toast }) => toast.success("Đã lưu thay đổi thành công!"));
    } catch (error: any) {
      import("sonner").then(({ toast }) => toast.error(error.message || "Không thể lưu hồ sơ"));
    }
  };

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await fetchApi("/api/user/account", { method: "DELETE" });
      const { toast } = await import("sonner");
      toast.success(language === "vi" ? "Tài khoản của bạn đã được xoá thành công." : "Your account has been deleted.");
      
      // Clear all stored credentials
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("email");
      localStorage.removeItem("fullName");
      localStorage.removeItem("createdAt");
      localStorage.removeItem("avatarUrl");

      setIsDeleteDialogOpen(false);
      router.replace("/auth");
    } catch (error: any) {
      const { toast } = await import("sonner");
      toast.error(error.message || (language === "vi" ? "Lỗi khi xoá tài khoản" : "Failed to delete account"));
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const tabs = [
    { key: "account", label: t("settings.account"), icon: User },
    { key: "orders", label: "Lịch sử đơn hàng", icon: Package },
    { key: "address", label: "Sổ địa chỉ", icon: MapPin },
    { key: "notifications", label: t("settings.notifications"), icon: Bell },
    { key: "privacy", label: t("settings.security"), icon: Lock },
    { key: "appearance", label: t("settings.appearance"), icon: Palette },
    { key: "language", label: t("settings.language"), icon: Globe },
  ];

  return (
    <AppShell active="settings">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-display">Cài đặt</h1>
          <p className="text-muted-foreground mt-1">Quản lý tài khoản và tuỳ chỉnh trải nghiệm của bạn.</p>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-6">
          {/* Side nav */}
          <aside className="glass-card rounded-2xl p-2 h-fit lg:sticky lg:top-24">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active ? "bg-card/90 text-foreground shadow-soft" : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" /> {t.label}
                  <ChevronRight className={`h-4 w-4 ml-auto ${active ? "text-primary" : "opacity-0"}`} />
                </button>
              );
            })}
            <div className="border-t border-border my-2" />
            <button 
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                localStorage.removeItem("email");
                localStorage.removeItem("fullName");
                localStorage.removeItem("createdAt");
                localStorage.removeItem("avatarUrl");
                router.replace("/auth");
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" /> Đăng xuất
            </button>
          </aside>

          {/* Panel */}
          <div className="space-y-6">
            {tab === "account" && (
              <Section title="Thông tin cá nhân" desc="Cập nhật ảnh đại diện, tên và email của bạn.">
                {isLoading ? (
                  <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                ) : (
                  <>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative h-16 w-16 rounded-2xl overflow-hidden btn-hero grid place-items-center text-2xl font-bold text-black shrink-0 group">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <>{fullName ? fullName.charAt(0) : "?"}</>
                        )}
                        {isUploading && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="text-sm px-3 py-2 rounded-lg bg-card/80 hover:bg-card font-medium flex items-center gap-1.5"
                        >
                          <Camera className="w-4 h-4" /> Tải ảnh mới
                        </button>
                        {avatarUrl && (
                          <button 
                            onClick={() => setAvatarUrl("")}
                            className="text-sm px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground font-medium"
                          >
                            Xoá
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Field label="Họ và tên" value={fullName} onChange={setFullName} />
                      <Field label="Tên hiển thị" value={displayName} onChange={setDisplayName} />
                      <Field label="Email" value={email} onChange={setEmail} type="email" />
                      <Field label="Số điện thoại" value={phone} onChange={setPhone} />
                    </div>
                    <div className="mt-4">
                      <Label className="text-sm">Giới thiệu</Label>
                      <textarea
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="mt-1.5 w-full rounded-xl bg-card/80 border border-border px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button onClick={handleSave} className="btn-hero text-black rounded-xl px-5 py-2.5 text-sm font-semibold">Lưu thay đổi</button>
                      <button className="rounded-xl bg-card/70 hover:bg-card px-5 py-2.5 text-sm font-medium">Huỷ</button>
                    </div>
                  </>
                )}
              </Section>
            )}

            {tab === "address" && (
              <Section title="Sổ địa chỉ" desc="Quản lý địa chỉ giao hàng của bạn.">
                <div className="space-y-4">
                  {addresses.map((addr) => (
                    <div key={addr.id} className={`p-5 rounded-2xl border transition-colors ${addr.isDefault ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-card/50'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base">{addr.receiverName}</h3>
                            {addr.isDefault && <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Mặc định</span>}
                          </div>
                          <p className="text-sm font-medium mt-1 text-foreground">{addr.phone}</p>
                          <p className="text-sm text-muted-foreground mt-1">{addr.address}, {addr.district}, {addr.province}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4 mt-2 sm:mt-0">
                          {!addr.isDefault && (
                            <button onClick={async () => {
                              try {
                                await fetchApi(`/api/user/addresses/${addr.id}/default`, { method: "PUT" });
                                const addrData = await fetchApi("/api/user/addresses");
                                if (Array.isArray(addrData)) setAddresses(addrData);
                                import("sonner").then(({ toast }) => toast.success("Đã đặt làm mặc định"));
                              } catch (e) {
                                import("sonner").then(({ toast }) => toast.error("Lỗi khi đặt mặc định"));
                              }
                            }} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Đặt mặc định</button>
                          )}
                          <div className="flex gap-3">
                            <button onClick={() => { setEditingAddressId(addr.id); setNewAddress(addr); }} className="text-sm font-bold text-primary hover:underline">Sửa</button>
                            <button onClick={async () => {
                              try {
                                await fetchApi(`/api/user/addresses/${addr.id}`, { method: "DELETE" });
                                const addrData = await fetchApi("/api/user/addresses");
                                if (Array.isArray(addrData)) setAddresses(addrData);
                                import("sonner").then(({ toast }) => toast.success("Đã xóa địa chỉ"));
                              } catch (e) {
                                import("sonner").then(({ toast }) => toast.error("Lỗi khi xóa"));
                              }
                            }} className="text-sm font-bold text-destructive hover:underline">Xoá</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {editingAddressId ? (
                    <div className="mt-6 p-6 rounded-3xl border border-primary/20 bg-white/50 dark:bg-card shadow-sm space-y-4 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                      <h3 className="font-bold text-lg flex items-center gap-2">{editingAddressId === 'new' ? 'Thêm địa chỉ mới' : 'Sửa địa chỉ'}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Họ tên người nhận *" value={newAddress.receiverName || ''} onChange={v => setNewAddress({...newAddress, receiverName: v})} />
                        <Field label="Số điện thoại *" value={newAddress.phone || ''} onChange={v => setNewAddress({...newAddress, phone: v})} />
                        <div className="md:col-span-2">
                          <Field label="Địa chỉ cụ thể *" value={newAddress.address || ''} onChange={v => setNewAddress({...newAddress, address: v})} />
                        </div>
                        <div className="md:col-span-2">
                          <ProvinceDistrictSelect
                            province={newAddress.province || ''}
                            district={newAddress.district || ''}
                            onProvinceChange={v => setNewAddress(prev => ({ ...prev, province: v, district: '' }))}
                            onDistrictChange={v => setNewAddress(prev => ({ ...prev, district: v }))}
                          />
                        </div>
                      </div>
                      <label className="flex items-center gap-2 mt-4 cursor-pointer w-fit">
                        <input type="checkbox" checked={newAddress.isDefault} onChange={e => setNewAddress({...newAddress, isDefault: e.target.checked})} className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                        <span className="text-sm font-medium">Đặt làm địa chỉ mặc định</span>
                      </label>
                      <div className="flex gap-3 pt-4 border-t border-border mt-4">
                        <button onClick={async () => {
                          if (!newAddress.receiverName || !newAddress.phone || !newAddress.address || !newAddress.province || !newAddress.district) {
                            import("sonner").then(({ toast }) => toast.error("Vui lòng điền đủ thông tin bắt buộc (*)"));
                            return;
                          }
                          try {
                            if (editingAddressId === 'new') {
                              await fetchApi("/api/user/addresses", {
                                method: "POST",
                                body: JSON.stringify(newAddress)
                              });
                            } else {
                              await fetchApi(`/api/user/addresses/${editingAddressId}`, {
                                method: "PUT",
                                body: JSON.stringify(newAddress)
                              });
                            }
                            
                            const addrData = await fetchApi("/api/user/addresses");
                            if (Array.isArray(addrData)) setAddresses(addrData);
                            
                            setEditingAddressId(null);
                            setNewAddress({});
                            import("sonner").then(({ toast }) => toast.success("Đã lưu địa chỉ!"));
                          } catch (error: any) {
                            import("sonner").then(({ toast }) => toast.error(error.message || "Lỗi khi lưu địa chỉ"));
                          }
                        }} className="btn-hero text-black rounded-xl px-6 py-2.5 text-sm font-semibold shadow-coral-glow">Lưu địa chỉ</button>
                        <button onClick={() => { setEditingAddressId(null); setNewAddress({}); }} className="rounded-xl bg-card/70 hover:bg-card border border-border px-6 py-2.5 text-sm font-medium transition-colors">Huỷ</button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => { setEditingAddressId('new'); setNewAddress({ isDefault: addresses.length === 0 }); }}
                      className="w-full mt-4 border-2 border-dashed border-primary/30 rounded-2xl p-4 flex items-center justify-center gap-2 text-primary hover:bg-primary/5 transition-colors font-semibold"
                    >
                      <Plus className="w-5 h-5" /> Thêm địa chỉ mới
                    </button>
                  )}
                </div>
              </Section>
            )}

            {tab === "notifications" && (
              <Section title="Thông báo" desc={<>Chọn cách bạn muốn nhận thông báo từ <span className="text-[#FF37C0]/60">CraftVision3D</span>.</>}>
                <ToggleRow label="Gợi ý ý tưởng hàng ngày" desc="Nhận cảm hứng sáng tạo mỗi sáng." defaultChecked />
                <ToggleRow label="Cập nhật dự án đang làm" desc="Nhắc nhở tiếp tục nơi bạn dừng lại." defaultChecked />
                <ToggleRow label="Tương tác cộng đồng" desc="Ai đó thích hoặc bình luận về tác phẩm của bạn." />
                <ToggleRow label="Ưu đãi và khuyến mãi" desc="Voucher nguyên liệu, giảm giá đối tác." />
                <ToggleRow label="Email tổng hợp hàng tuần" desc="Bản tin về xu hướng handmade." defaultChecked />
              </Section>
            )}

            {tab === "privacy" && (
              <Section title="Bảo mật & Quyền riêng tư">
                <ToggleRow label="Xác thực 2 lớp (2FA)" desc="Thêm lớp bảo vệ cho tài khoản." />
                <ToggleRow label="Hồ sơ công khai" desc="Cho phép người khác xem hồ sơ và bộ sưu tập." defaultChecked />
                <ToggleRow label="Cho phép AI học từ dữ liệu của tôi" desc="Cải thiện chất lượng gợi ý cá nhân." defaultChecked />
                <div className="pt-2 border-t border-border">
                  <button className="text-sm font-medium text-primary hover:underline">Đổi mật khẩu →</button>
                </div>
              </Section>
            )}

            {tab === "appearance" && (
              <Section title="Giao diện" desc="Tuỳ chọn màu sắc chủ đề.">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: "light", label: "Sáng", grad: "linear-gradient(135deg, #fff9f0, #ffe4c4)" },
                    { id: "dark", label: "Tối", grad: "linear-gradient(135deg, #2a1e14, #4a2f1e)" },
                    { id: "system", label: "Tự động", grad: "linear-gradient(135deg, #fff9f0 50%, #2a1e14 50%)" },
                  ].map((t) => (
                    <button 
                      key={t.id} 
                      onClick={() => setTheme(t.id)}
                      className={`rounded-2xl p-1 ${theme === t.id ? "ring-2 ring-primary" : ""}`}
                    >
                      <div className="h-24 rounded-xl" style={{ background: t.grad }} />
                      <div className="text-sm font-medium mt-2">{t.label}</div>
                    </button>
                  ))}
                </div>
              </Section>
            )}

            {tab === "orders" && (
              <Section title="Lịch sử đơn hàng" desc="Quản lý và theo dõi tiến trình các đơn hàng bạn đã mua.">
                {/* Order Filter Tabs */}
                <div className="flex border-b border-border/60 mb-4 bg-card/60 rounded-xl overflow-hidden p-1 gap-1">
                  <button 
                    onClick={() => setActiveOrderTab("all")}
                    className={`flex-1 py-2.5 text-center font-bold text-xs sm:text-sm rounded-lg transition-all cursor-pointer ${
                      activeOrderTab === "all" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    Tất cả ({orders.length})
                  </button>
                  <button 
                    onClick={() => setActiveOrderTab("shipping")}
                    className={`flex-1 py-2.5 text-center font-bold text-xs sm:text-sm rounded-lg transition-all cursor-pointer ${
                      activeOrderTab === "shipping" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    Đang ship ({orders.filter(o => ["Pending", "Processing", "Shipping", "ReadyToShip", "Reserved"].includes(o.orderStatus)).length})
                  </button>
                  <button 
                    onClick={() => setActiveOrderTab("completed")}
                    className={`flex-1 py-2.5 text-center font-bold text-xs sm:text-sm rounded-lg transition-all cursor-pointer ${
                      activeOrderTab === "completed" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    Đã hoàn thành ({orders.filter(o => ["Completed", "Delivered"].includes(o.orderStatus)).length})
                  </button>
                </div>

                {/* Orders Content */}
                <div className="space-y-4 min-h-[300px]">
                  {loadingOrders ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                      <p className="text-sm">Đang tải lịch sử đơn hàng...</p>
                    </div>
                  ) : getFilteredOrders().length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-card/40 rounded-2xl border border-dashed border-border/60">
                      <Package className="w-16 h-16 mb-4 opacity-25 text-primary" />
                      <p className="text-sm font-medium">Chưa có đơn hàng nào trong mục này</p>
                      <Link href="/shop" className="mt-3 btn-hero px-4 py-2 rounded-xl text-xs font-semibold text-black">
                        Khám phá sản phẩm
                      </Link>
                    </div>
                  ) : (
                    getFilteredOrders().map((order) => {
                      const isDelivered = order.orderStatus === "Delivered" || order.orderStatus === "Completed";
                      const isCancelled = order.orderStatus === "Cancelled";
                      const isShipping = ["Shipping", "ReadyToShip"].includes(order.orderStatus);

                      return (
                        <div key={order.id} className="bg-white dark:bg-card border border-border/60 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow">
                          {/* Card Header: CraftVision Mall */}
                          <div className="flex items-center justify-between p-4 border-b border-border/40 bg-muted/15">
                            <div className="flex items-center gap-2 font-medium">
                              <Store className="w-4 h-4 text-primary" />
                              <span className="font-bold text-sm text-foreground">CraftVision Mall</span>
                              <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded ml-1">Mall</span>
                            </div>
                            <div className={`text-xs font-bold uppercase tracking-wider ${
                              isDelivered ? "text-emerald-600" : isCancelled ? "text-rose-600" : "text-amber-600"
                            }`}>
                              {isDelivered ? "ĐÃ HOÀN THÀNH" : isCancelled ? "ĐÃ HỦY" : isShipping ? "ĐANG GIAO HÀNG" : "ĐANG XỬ LÝ"}
                            </div>
                          </div>

                          {/* Items */}
                          <div className="p-4 flex flex-col gap-3">
                            {order.items?.map((item: any) => {
                              const imageUrl = item.productImageUrl || item.image || "/dreamy-hero-bg.jpg";
                              const hasGift = !!item.gift?.secretKey;
                              const giftUrl = hasGift ? `/gift/scan/${item.gift.secretKey}` : `/gift/scan/sample`;

                              return (
                                <div key={item.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between pb-3 border-b border-border/20 last:border-b-0 last:pb-0">
                                  <div className="flex gap-3 items-center min-w-0">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-border/50 bg-muted">
                                      <img src={imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="min-w-0">
                                      <Link href={`/shop/${item.productId}`} className="font-bold text-sm text-foreground hover:text-primary transition-colors line-clamp-1">
                                        {item.productName}
                                      </Link>
                                      <p className="text-xs text-muted-foreground mt-0.5">Phân loại: Tùy chỉnh (x{item.quantity})</p>
                                      {item.gift && (
                                        <Link 
                                          href={giftUrl} 
                                          target="_blank"
                                          className="inline-flex items-center gap-1 text-[11px] text-rose-500 hover:text-rose-600 font-semibold mt-1 hover:underline"
                                        >
                                          <Gift className="w-3 h-3" /> Xem thiệp NFC đã thiết kế <ExternalLink className="w-2.5 h-2.5" />
                                        </Link>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right self-end sm:self-center">
                                    <span className="font-bold text-sm text-primary">{formatPrice(item.unitPrice)}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Footer / Total & Actions */}
                          <div className="p-4 border-t border-border/40 bg-muted/5 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3">
                            <div className="text-xs sm:text-sm text-muted-foreground w-full sm:w-auto text-left">
                              Tổng số tiền: <span className="text-base sm:text-lg font-bold text-primary ml-1">{formatPrice(order.totalAmount)}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                              {/* Xem chi tiết button */}
                              <button
                                onClick={() => handleOpenOrderDetail(order)}
                                className="px-3 py-1.5 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-foreground transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-primary" />
                                Chi tiết
                              </button>

                              {/* Hủy đơn hàng */}
                              {["Pending", "Processing"].includes(order.orderStatus) && (
                                <button 
                                  onClick={() => promptCancelOrder(order.id)}
                                  className="border border-red-500/40 text-red-600 hover:bg-red-500/10 px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
                                >
                                  Hủy đơn hàng
                                </button>
                              )}

                              {/* Đã nhận được hàng */}
                              {["ReadyToShip", "Shipped"].includes(order.orderStatus) && (
                                <button 
                                  onClick={() => handleReceiveOrder(order.id)}
                                  className="btn-hero px-4 py-1.5 rounded-xl font-bold text-xs text-black shadow-coral-glow hover:scale-105 transition-transform cursor-pointer"
                                >
                                  Đã nhận được hàng
                                </button>
                              )}

                              {/* Mua lại */}
                              {order.items?.[0] && (
                                <button 
                                  onClick={() => {
                                    router.push(`/shop/${order.items[0].productId}`);
                                  }}
                                  className="btn-hero px-4 py-1.5 rounded-xl font-bold text-xs text-black shadow-coral-glow hover:scale-105 transition-transform cursor-pointer"
                                >
                                  Mua lại
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </Section>
            )}

            {tab === "language" && (
              <Section title={t("settings.lang_region")}>
                <div className="grid md:grid-cols-2 gap-4">
                  <SelectField 
                    label={t("settings.lang_label")} 
                    options={[
                      { value: "vi", label: "Tiếng Việt" },
                      { value: "en", label: "English" },
                    ]} 
                    value={language}
                    onChange={(val) => setLanguage(val as Language)}
                  />
                  <SelectField label={t("settings.timezone")} options={[{value: "gmt7", label: "GMT+7 (Hanoi)"}, {value: "gmt9", label: "GMT+9 (Tokyo)"}]} />
                  <SelectField label={t("settings.currency")} options={[{value: "vnd", label: "VND (đ)"}, {value: "usd", label: "USD ($)"}]} />
                </div>
              </Section>
            )}

            {/* Danger zone */}
            {tab === "account" && (
              <div className="glass-card rounded-3xl p-6 border border-destructive/20">
                <h3 className="font-bold font-display text-destructive flex items-center gap-2">
                  <Trash2 className="h-4 w-4" /> {t("settings.danger_zone")}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{t("settings.danger_desc")}</p>
                <button 
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="mt-4 rounded-xl border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground px-4 py-2 text-sm font-semibold transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  {t("settings.delete_account")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[440px] rounded-3xl border border-destructive/20 p-6 bg-card/95 backdrop-blur-md">
          <DialogHeader className="flex flex-col items-center text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold font-display text-foreground">
              {t("settings.confirm_delete_title")}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed text-center">
              {t("settings.confirm_delete_desc")}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-6 sm:space-x-0">
            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeletingAccount}
              className="w-full sm:w-1/2 rounded-xl bg-card/80 hover:bg-card border border-border px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer"
            >
              {t("settings.cancel")}
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
              className="w-full sm:w-1/2 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2.5 text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isDeletingAccount ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("settings.deleting")}
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  {t("settings.confirm_delete_btn")}
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="rounded-3xl bg-white dark:bg-card p-6 border border-border/60">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold">Xác nhận hủy đơn hàng?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="rounded-xl border border-border hover:bg-muted font-semibold text-xs sm:text-sm">
              Không, giữ đơn
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeCancelOrder}
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold text-xs sm:text-sm"
            >
              Xác nhận hủy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Order Details Modal with Timelines & Gift Link */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[88vh] overflow-y-auto bg-white dark:bg-card rounded-3xl p-6 sm:p-8 border border-primary/20 shadow-2xl custom-scrollbar">
          {selectedOrderDetail && (
            <div className="space-y-6">
              {/* Modal Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Chi tiết đơn hàng</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      selectedOrderDetail.orderStatus === 'Completed' || selectedOrderDetail.orderStatus === 'Delivered'
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : selectedOrderDetail.orderStatus === 'Cancelled'
                        ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    }`}>
                      {selectedOrderDetail.orderStatus || 'Processing'}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold font-display text-foreground mt-1 flex items-center gap-2">
                    <span>{selectedOrderDetail.orderCode || selectedOrderDetail.id}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(selectedOrderDetail.orderCode || selectedOrderDetail.id);
                        import("sonner").then(({ toast }) => toast.success("Đã sao chép mã đơn hàng!"));
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
                    {formatPrice(selectedOrderDetail.totalAmount ?? 0)}
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
                      {formatDateTime(selectedOrderDetail.createdAt) || "29/09/2026 14:30:00"}
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
                      {selectedOrderDetail.orderStatus === 'Cancelled'
                        ? "Đơn hàng đã hủy"
                        : selectedOrderDetail.orderStatus === 'Completed' || selectedOrderDetail.orderStatus === 'Delivered'
                        ? `Đã nhận hàng (${formatDateTime(selectedOrderDetail.updatedAt || selectedOrderDetail.createdAt)})`
                        : getEstimatedDelivery(selectedOrderDetail.createdAt)}
                    </p>
                    <span className="text-[10px] text-muted-foreground italic block">
                      {selectedOrderDetail.orderStatus === 'Cancelled'
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
                        {`GHN${(selectedOrderDetail.orderCode || selectedOrderDetail.id || '').replace(/[^a-zA-Z0-9]/g, '').slice(-8)}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phí vận chuyển:</span>
                      <span className="font-semibold text-foreground">
                        {formatPrice(selectedOrderDetail.shippingFee || 20000)}
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
                        {selectedOrderDetail.receiverName || "Khách hàng CraftVision"}
                      </span>
                      {selectedOrderDetail.receiverName ? (
                        <span className="text-[10px] text-emerald-600 font-semibold">✓ Từ hệ thống</span>
                      ) : (
                        <span className="text-[10px] text-amber-600 font-semibold">(Mô phỏng)</span>
                      )}
                    </div>
                    <div className="text-muted-foreground flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-primary shrink-0" />
                      <span>{selectedOrderDetail.receiverPhone || "0987 654 321"}</span>
                      {!selectedOrderDetail.receiverPhone && (
                        <span className="text-[10px] text-amber-600 italic">(Mô phỏng)</span>
                      )}
                    </div>
                    <div className="text-muted-foreground flex items-start gap-1.5">
                      <MapPin className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">
                        {selectedOrderDetail.receiverAddress || "Khu đô thị ĐHQG, Phường Linh Trung, TP. Thủ Đức, TP. Hồ Chí Minh"}
                      </span>
                      {!selectedOrderDetail.receiverAddress && (
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
                      {selectedOrderDetail.paymentMethod === 'BankTransfer'
                        ? 'Chuyển khoản QR Banking (PayOS)'
                        : selectedOrderDetail.paymentMethod === 'Cod'
                        ? 'Thanh toán khi nhận hàng (COD)'
                        : selectedOrderDetail.paymentMethod || 'Thanh toán khi nhận hàng (COD)'}
                    </span>
                  </div>
                </div>
                <div className="sm:text-right">
                  <span className="text-muted-foreground font-medium block">Trạng thái thanh toán:</span>
                  <span className={`font-bold inline-block px-2.5 py-0.5 rounded-full text-xs ${
                    selectedOrderDetail.paymentStatus === 'Paid'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-amber-500/10 text-amber-600'
                  }`}>
                    {selectedOrderDetail.paymentStatus === 'Paid' ? '✓ Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                </div>
              </div>

              {/* 4. Sản phẩm đã mua & Link thiệp đã thiết kế */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    Sản phẩm đã mua ({selectedOrderDetail.items?.length || 1})
                  </span>
                  <span className="text-xs text-muted-foreground">Kèm link thiệp đã thiết kế</span>
                </h4>

                <div className="space-y-3">
                  {(selectedOrderDetail.items && selectedOrderDetail.items.length > 0 ? selectedOrderDetail.items : [
                    { productName: "Sản phẩm CraftVision", quantity: 1, unitPrice: selectedOrderDetail.totalAmount || 0, subTotal: selectedOrderDetail.totalAmount || 0 }
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
                              <span>Đơn giá: <strong className="text-foreground">{formatPrice(item.unitPrice || 0)}</strong></span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-primary">
                              {formatPrice(item.subTotal || ((item.unitPrice || 0) * (item.quantity || 1)))}
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
    </AppShell>
  );
}

function Section({ title, desc, children }: { title: string; desc?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 space-y-5">
      <div>
        <h2 className="text-xl font-bold font-display">{title}</h2>
        {desc && <p className="text-sm text-muted-foreground mt-1">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value?: string; onChange?: (v: string) => void; type?: string }) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      <Input value={value} onChange={e => onChange?.(e.target.value)} type={type} className="mt-1.5 bg-card/80 h-11" />
    </div>
  );
}

function SelectField({ label, options, value, onChange }: { label: string; options: {value: string, label: string}[]; value?: string; onChange?: (val: string) => void }) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      <select 
        value={value}
        onChange={e => onChange?.(e.target.value)}
        className="mt-1.5 w-full h-11 rounded-xl bg-card/80 border border-border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function ToggleRow({ label, desc, defaultChecked }: { label: string; desc?: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
      <div>
        <div className="font-medium text-sm">{label}</div>
        {desc && <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>}
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
