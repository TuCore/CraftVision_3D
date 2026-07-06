"use client";
import Link from "next/link";
import { useState } from "react";
import { Box, Mail, Lock, User, Sparkles, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchApi } from "@/lib/apiClient";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "register") {
        const res = await fetchApi("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ email, password, fullName: name }),
        });
        localStorage.setItem("token", res.token);
        localStorage.setItem("userId", res.userId);
        window.location.href = "/chat";
      } else {
        const res = await fetchApi("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        localStorage.setItem("token", res.token);
        localStorage.setItem("userId", res.userId);
        window.location.href = "/chat";
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-clip grid lg:grid-cols-2">
      <div className="blob animate-pulse-glow" style={{ top: -100, left: -80, width: 420, height: 420, background: "oklch(0.78 0.22 35)" }} />
      <div className="blob animate-pulse-glow" style={{ bottom: -140, right: -120, width: 500, height: 500, background: "oklch(0.88 0.18 95)", animationDelay: "1s" }} />

      {/* Left brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 z-10">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="grid h-10 w-10 place-items-center rounded-xl btn-hero">
            <Box className="h-5 w-5" />
          </span>
          <span className="font-display">
            <span className="gradient-text">Craft</span>Vision<span className="text-[color:var(--coral)]">3D</span>
          </span>
        </Link>

        <div className="max-w-md">
          <span className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> AI · Handmade · 3D
          </span>
          <h1 className="mt-5 text-4xl md:text-5xl font-extrabold leading-tight font-display">
            Tạo <span className="gradient-text">món quà thủ công</span> đầy ý nghĩa cùng AI
          </h1>
          <p className="mt-4 text-muted-foreground">
            Gợi ý ý tưởng, danh sách nguyên liệu, ước tính chi phí, thời gian và video hướng dẫn — tất cả trong một trợ lý sáng tạo.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { label: "Ý tưởng quà", value: "10k+" },
              { label: "Nguyên liệu", value: "5k+" },
              { label: "Creators", value: "12k+" },
            ].map((s) => (
              <div key={s.label} className="glass-card rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold gradient-text">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">© 2026 CraftVision3D. Made with ♥ in Vietnam.</p>
      </div>

      {/* Right form panel */}
      <div className="relative flex items-center justify-center p-6 md:p-12 z-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center font-bold text-lg">
            <span className="grid h-9 w-9 place-items-center rounded-xl btn-hero">
              <Box className="h-5 w-5" />
            </span>
            <span className="font-display">
              <span className="gradient-text">Craft</span>Vision<span className="text-[color:var(--coral)]">3D</span>
            </span>
          </div>

          <div className="glass-strong rounded-3xl p-8 shadow-soft">
            <div className="flex gap-1 p-1 bg-white/60 rounded-2xl mb-6">
              <button
                onClick={() => setMode("login")}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                  mode === "login" ? "btn-hero" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Đăng nhập
              </button>
              <button
                onClick={() => setMode("register")}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                  mode === "register" ? "btn-hero" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Đăng ký
              </button>
            </div>

            <h2 className="text-2xl font-bold font-display">
              {mode === "login" ? "Chào mừng trở lại 👋" : "Tạo tài khoản mới ✨"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "login"
                ? "Đăng nhập để tiếp tục sáng tạo cùng trợ lý AI."
                : "Bắt đầu hành trình tạo quà tặng thủ công của bạn."}
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-xl border border-rose-100">
                  {error}
                </div>
              )}
              {mode === "register" && (
                <div className="space-y-1.5">
                  <Label htmlFor="name">Họ và tên</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} required placeholder="Nguyễn Văn A" className="pl-10 h-11 bg-white/80" />
                  </div>
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="pl-10 h-11 bg-white/80" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="pl-10 h-11 bg-white/80" />
                </div>
              </div>

              {mode === "login" ? (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                    <Checkbox /> Ghi nhớ tôi
                  </label>
                  <a href="#" className="text-primary font-medium hover:underline">Quên mật khẩu?</a>
                </div>
              ) : (
                <label className="flex items-start gap-2 text-sm text-muted-foreground cursor-pointer">
                  <Checkbox className="mt-0.5" />
                  <span>Tôi đồng ý với <a href="#" className="text-primary font-medium">Điều khoản</a> và <a href="#" className="text-primary font-medium">Chính sách bảo mật</a>.</span>
                </label>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-hero w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold disabled:opacity-70"
              >
                {loading ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">HOẶC</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl border bg-white/80 px-4 py-2.5 text-sm font-medium hover:bg-white">
                  <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4-5.5 4-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12S6.8 21.5 12 21.5c6.9 0 9.5-4.8 9.5-9.3 0-.6-.1-1.3-.2-2H12z"/></svg>
                  Google
                </button>
                <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl border bg-white/80 px-4 py-2.5 text-sm font-medium hover:bg-white">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg> GitHub
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
