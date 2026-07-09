"use client";

import { AppShell } from "@/components/AppShell";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Bell, Lock, Palette, Globe, CreditCard, LogOut, ChevronRight, Trash2, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/apiClient";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState("account");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchApi("/api/user/profile");
        setFullName(data.fullName || "");
        setEmail(data.email || "");
        setDisplayName(data.displayName || "");
        setPhone(data.phone || "");
        setBio(data.bio || "");
      } catch (error) {
        console.error("Lỗi khi tải hồ sơ:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    try {
      await fetchApi("/api/user/profile", {
        method: "PUT",
        body: JSON.stringify({
          fullName,
          displayName,
          phone,
          bio
        })
      });
      // Vẫn lưu name lên local storage để Navbar có thể hiển thị nếu cần thiết
      localStorage.setItem("fullName", fullName);
      import("sonner").then(({ toast }) => toast.success("Đã lưu thay đổi thành công!"));
    } catch (error: any) {
      import("sonner").then(({ toast }) => toast.error(error.message || "Không thể lưu hồ sơ"));
    }
  };

  const tabs = [
    { key: "account", label: "Tài khoản", icon: User },
    { key: "notifications", label: "Thông báo", icon: Bell },
    { key: "privacy", label: "Bảo mật", icon: Lock },
    { key: "appearance", label: "Giao diện", icon: Palette },
    { key: "ai", label: "Trợ lý AI", icon: Sparkles },
    { key: "billing", label: "Thanh toán", icon: CreditCard },
    { key: "language", label: "Ngôn ngữ", icon: Globe },
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
                    active ? "bg-white/90 text-foreground shadow-soft" : "text-muted-foreground hover:bg-white/60 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" /> {t.label}
                  <ChevronRight className={`h-4 w-4 ml-auto ${active ? "text-primary" : "opacity-0"}`} />
                </button>
              );
            })}
            <div className="border-t border-border my-2" />
            <button className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10">
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
                      <div className="h-16 w-16 rounded-2xl btn-hero grid place-items-center text-2xl font-bold text-white">
                        {fullName ? fullName.charAt(0) : "?"}
                      </div>
                      <div className="flex gap-2">
                        <button className="text-sm px-3 py-2 rounded-lg bg-white/80 hover:bg-white font-medium">Tải ảnh mới</button>
                        <button className="text-sm px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground font-medium">Xoá</button>
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
                        className="mt-1.5 w-full rounded-xl bg-white/80 border border-border px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button onClick={handleSave} className="btn-hero rounded-xl px-5 py-2.5 text-sm font-semibold">Lưu thay đổi</button>
                      <button className="rounded-xl bg-white/70 hover:bg-white px-5 py-2.5 text-sm font-medium">Huỷ</button>
                    </div>
                  </>
                )}
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
                    { label: "Sáng", grad: "linear-gradient(135deg, #fff9f0, #ffe4c4)", active: true },
                    { label: "Tối", grad: "linear-gradient(135deg, #2a1e14, #4a2f1e)" },
                    { label: "Tự động", grad: "linear-gradient(135deg, #fff9f0 50%, #2a1e14 50%)" },
                  ].map((t) => (
                    <button key={t.label} className={`rounded-2xl p-1 ${t.active ? "ring-2 ring-primary" : ""}`}>
                      <div className="h-24 rounded-xl" style={{ background: t.grad }} />
                      <div className="text-sm font-medium mt-2">{t.label}</div>
                    </button>
                  ))}
                </div>
              </Section>
            )}

            {tab === "ai" && (
              <Section title="Trợ lý AI" desc="Cá nhân hoá cách AI gợi ý cho bạn.">
                <div>
                  <Label className="text-sm">Phong cách yêu thích</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["Pastel", "Vintage", "Tối giản", "Rustic", "Kawaii", "Boho"].map((s, i) => (
                      <button key={s} className={`px-3.5 py-1.5 rounded-full text-sm font-medium ${
                        i < 2 ? "btn-hero" : "bg-white/70 hover:bg-white text-muted-foreground"
                      }`}>{s}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Ngân sách trung bình / dự án</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <input type="range" min={50} max={1000} defaultValue={150} className="flex-1 accent-[color:var(--primary)]" />
                    <span className="text-sm font-semibold w-24 text-right">~150.000đ</span>
                  </div>
                </div>
                <ToggleRow label="Ưu tiên link Shopee VN" desc="Gợi ý nguyên liệu từ sàn nội địa." defaultChecked />
                <ToggleRow label="Kèm video hướng dẫn YouTube" defaultChecked />
              </Section>
            )}

            {tab === "billing" && (
              <Section title="Gói & Thanh toán">
                <div className="rounded-2xl p-5 bg-gradient-to-r from-primary/10 to-[color:var(--coral)]/10 border border-white/60 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-primary uppercase">Gói hiện tại</div>
                    <div className="text-xl font-bold font-display mt-1"><span className="text-[#FF37C0]/60">CraftVision</span> PRO</div>
                    <div className="text-sm text-muted-foreground">99.000đ / tháng · Gia hạn 15/07/2026</div>
                  </div>
                  <button className="btn-hero rounded-xl px-4 py-2 text-sm font-semibold">Quản lý</button>
                </div>
                <ToggleRow label="Tự động gia hạn" defaultChecked />
              </Section>
            )}

            {tab === "language" && (
              <Section title="Ngôn ngữ & Khu vực">
                <div className="grid md:grid-cols-2 gap-4">
                  <SelectField label="Ngôn ngữ" options={["Tiếng Việt", "English", "日本語"]} />
                  <SelectField label="Múi giờ" options={["GMT+7 (Hanoi)", "GMT+9 (Tokyo)", "GMT+0 (London)"]} />
                  <SelectField label="Tiền tệ" options={["VND (đ)", "USD ($)", "EUR (€)"]} />
                </div>
              </Section>
            )}

            {/* Danger zone */}
            <div className="glass-card rounded-3xl p-6 border border-destructive/20">
              <h3 className="font-bold font-display text-destructive flex items-center gap-2">
                <Trash2 className="h-4 w-4" /> Vùng nguy hiểm
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Xoá tài khoản sẽ xoá toàn bộ dự án và không thể khôi phục.</p>
              <button className="mt-4 rounded-xl border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground px-4 py-2 text-sm font-semibold transition-colors">
                Xoá tài khoản
              </button>
            </div>
          </div>
        </div>
      </div>
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
      <Input value={value} onChange={e => onChange?.(e.target.value)} type={type} className="mt-1.5 bg-white/80 h-11" />
    </div>
  );
}

function SelectField({ label, options }: { label: string; options: string[] }) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      <select className="mt-1.5 w-full h-11 rounded-xl bg-white/80 border border-border px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
        {options.map((o) => <option key={o}>{o}</option>)}
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
