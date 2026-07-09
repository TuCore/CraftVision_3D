"use client";

import { AppShell } from "@/components/AppShell";
import Link from "next/link";
import { Camera, MapPin, Mail, Calendar, Award, Gift, Heart, Sparkles, Edit3 } from "lucide-react";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const [fullName, setFullName] = useState("Nguyễn Minh");
  const [email, setEmail] = useState("minh@craft.vn");
  const [bio, setBio] = useState('"Sáng tạo là hạnh phúc." — Handmade creator 💛');

  const [location, setLocation] = useState("Đang tải...");
  const [joinedDate, setJoinedDate] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("fullName");
    const storedEmail = localStorage.getItem("email");
    const storedCreatedAt = localStorage.getItem("createdAt");
    const storedBio = localStorage.getItem("bio");

    if (storedName) setFullName(storedName);
    if (storedEmail) setEmail(storedEmail);
    if (storedBio) setBio(storedBio);
    if (storedCreatedAt) {
      const d = new Date(storedCreatedAt);
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      setJoinedDate(`Tham gia ${mm}/${yyyy}`);
    } else {
      setJoinedDate("Thành viên mới");
    }

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

  return (
    <AppShell active="profile">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Cover + profile */}
        <div className="glass-strong rounded-3xl overflow-hidden">
          {/* Đổi background thành màu pastel trơn */}
          <div className="h-40 md:h-56 relative" style={{ background: "oklch(0.95 0.03 340)" }}>
            <button className="absolute top-4 right-4 rounded-xl bg-white/80 backdrop-blur px-3 py-1.5 text-xs font-medium inline-flex items-center gap-1.5 hover:bg-white transition-colors">
              <Camera className="h-3.5 w-3.5" /> Đổi ảnh bìa
            </button>
          </div>
          
          <div className="px-6 md:px-10 pb-8 -mt-16 relative flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="h-28 w-28 md:h-32 md:w-32 rounded-full bg-white grid place-items-center text-4xl font-bold text-primary border-4 border-white shadow-soft overflow-hidden">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <button className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-white shadow-soft grid place-items-center hover:bg-primary hover:text-white transition-colors border border-border">
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

            {/* Stats row - Đã sửa theo yêu cầu */}
            <div className="w-full max-w-lg mx-auto grid grid-cols-2 divide-x divide-border rounded-2xl bg-white/60 py-4 border border-border/50">
              {[
                { v: "12", l: "Dự án handmade" },
                { v: "5", l: "Sản phẩm đã mua" },
              ].map((s) => (
                <div key={s.l} className="text-center">
                  <div className="text-2xl font-bold font-display text-primary">{s.v}</div>
                  <div className="text-xs text-muted-foreground mt-1 font-medium">{s.l}</div>
                </div>
              ))}
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
