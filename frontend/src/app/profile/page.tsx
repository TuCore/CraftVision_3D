
import { AppShell } from "@/components/AppShell";
import { Camera, MapPin, Mail, Calendar, Award, Gift, Heart, Sparkles, Edit3 } from "lucide-react";

export default function ProfilePage() {
  const badges = [
    { icon: Award, label: "Creator cấp 5", color: "from-amber-400 to-orange-500" },
    { icon: Heart, label: "100+ likes", color: "from-rose-400 to-pink-500" },
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

  return (
    <AppShell active="profile">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Cover + profile */}
        <div className="glass-strong rounded-3xl overflow-hidden">
          <div className="h-40 md:h-56 relative" style={{ background: "var(--gradient-aurora)" }}>
            <button className="absolute top-4 right-4 rounded-xl bg-white/80 backdrop-blur px-3 py-1.5 text-xs font-medium inline-flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5" /> Đổi ảnh bìa
            </button>
          </div>
          <div className="px-6 md:px-10 pb-8 -mt-16 relative">
            <div className="flex flex-col md:flex-row md:items-end gap-5">
              <div className="relative">
                <div className="h-28 w-28 md:h-32 md:w-32 rounded-3xl btn-hero grid place-items-center text-4xl font-bold text-white border-4 border-white shadow-soft">
                  M
                </div>
                <button className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-white shadow-soft grid place-items-center hover:bg-primary hover:text-white transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 md:pb-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold font-display">Nguyễn Minh</h1>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">PRO</span>
                </div>
                <p className="text-muted-foreground mt-1">"Sáng tạo là hạnh phúc." — Handmade creator 💛</p>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Hà Nội, Việt Nam</span>
                  <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> minh@craft.vn</span>
                  <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Tham gia 03/2026</span>
                </div>
              </div>
              <button className="btn-hero inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold">
                <Edit3 className="h-4 w-4" /> Chỉnh sửa
              </button>
            </div>

            {/* Stats row */}
            <div className="mt-8 grid grid-cols-4 divide-x divide-border rounded-2xl bg-white/60 py-4">
              {[
                { v: "12", l: "Dự án" },
                { v: "248", l: "Người theo dõi" },
                { v: "96", l: "Đang theo dõi" },
                { v: "1.4k", l: "Lượt thích" },
              ].map((s) => (
                <div key={s.l} className="text-center">
                  <div className="text-xl font-bold font-display">{s.v}</div>
                  <div className="text-xs text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements */}
        <section className="glass-card rounded-3xl p-6">
          <h2 className="font-bold font-display mb-4">Thành tựu</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {badges.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.label} className="flex items-center gap-3 bg-white/70 rounded-xl p-3">
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
            <div className="flex gap-1 p-1 bg-white/60 rounded-xl text-sm">
              <button className="px-3 py-1.5 rounded-lg btn-hero">Đã hoàn thành</button>
              <button className="px-3 py-1.5 rounded-lg text-muted-foreground">Đã lưu</button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {gallery.map((g) => (
              <div key={g.title} className="glass-card rounded-2xl overflow-hidden group cursor-pointer">
                <div className="aspect-square relative" style={{ background: `linear-gradient(135deg, ${g.color}, oklch(0.92 0.06 85))` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 text-xs font-semibold bg-white/90 rounded-full px-2.5 py-1">
                    <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> {g.likes}
                  </div>
                </div>
                <div className="p-3">
                  <div className="font-medium text-sm truncate">{g.title}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
