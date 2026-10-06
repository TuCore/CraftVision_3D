"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Box, Mail, Lock, User, Sparkles, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchApi } from "@/lib/apiClient";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import { StarryBackground } from "@/components/StarryBackground";
import { motion, Variants } from "framer-motion";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
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
        localStorage.setItem("email", res.email);
        localStorage.setItem("fullName", res.fullName);
        if (res.createdAt) localStorage.setItem("createdAt", res.createdAt);
        router.replace(email === "admin@craftvision.vn" ? "/admin/nfc" : "/home");
      } else {
        const res = await fetchApi("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        localStorage.setItem("token", res.token);
        localStorage.setItem("userId", res.userId);
        localStorage.setItem("email", res.email);
        localStorage.setItem("fullName", res.fullName);
        if (res.createdAt) localStorage.setItem("createdAt", res.createdAt);
        router.replace(email === "admin@craftvision.vn" ? "/admin/nfc" : "/home");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  // Animation variants
  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, x: 100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 100, damping: 20 }
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-clip grid lg:grid-cols-2">
      <StarryBackground />

      {/* Left brand panel */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative hidden lg:flex flex-col justify-between p-12 z-10 text-white"
      >
        <motion.div variants={itemVariants}>
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <img src="/image/logoweb.jpg" alt="CraftVision3D Logo" className="w-10 h-10 object-cover rounded-full shadow-sm shrink-0 border border-white/20" />
            <span className="font-display text-rose-200">
              <span>CraftVision3D</span>
            </span>
          </Link>
        </motion.div>

        <div className="max-w-lg">
          <motion.span variants={itemVariants} className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> AI · Handmade · 3D
          </motion.span>
          <motion.h1 variants={itemVariants} className="mt-5 text-4xl md:text-5xl font-extrabold leading-tight font-display drop-shadow-lg">
            Tạo <span className="gradient-text pb-1">món quà thủ công</span><br />
            đầy ý nghĩa<br />
            cùng AI
          </motion.h1>
          <motion.p variants={itemVariants} className="mt-4 text-white/90 drop-shadow-sm">
            Gợi ý ý tưởng, danh sách nguyên liệu, ước tính chi phí, thời gian và video hướng dẫn — tất cả trong một trợ lý sáng tạo.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-8 grid grid-cols-3 gap-3">
            {[
              { label: "Ý tưởng quà", value: "10k+" },
              { label: "Nguyên liệu", value: "5k+" },
              { label: "Creators", value: "12k+" },
            ].map((s) => (
              <div key={s.label} className="glass-card rounded-2xl p-4 text-center bg-white/10 backdrop-blur-md border-white/20">
                <div className="text-2xl font-bold gradient-text drop-shadow-sm">{s.value}</div>
                <div className="text-xs text-black/70 mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.p variants={itemVariants} className="text-sm text-white/70">© 2026 <span className="text-rose-200">CraftVision3D</span>. Made with ♥ in Vietnam.</motion.p>
      </motion.div>

      {/* Right form panel */}
      <motion.div 
        initial={{ opacity: 0, x: 150 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.3 }}
        className="relative flex items-center justify-center p-6 md:p-12 z-10"
      >
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center font-bold text-lg text-white">
            <img src="/image/logoweb.jpg" alt="CraftVision3D Logo" className="w-12 h-12 object-cover rounded-full shadow-sm shrink-0 border border-white/20" />
            <span className="font-display text-rose-200">
              <span>CraftVision3D</span>
            </span>
          </div>

          <div className="glass-strong bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
            <div className="flex gap-1 p-1 bg-white/60 rounded-2xl mb-6">
              <button
                onClick={() => setMode("login")}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                  mode === "login" ? "btn-hero text-black" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Đăng nhập
              </button>
              <button
                onClick={() => setMode("register")}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                  mode === "register" ? "btn-hero text-black" : "text-muted-foreground hover:text-foreground"
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
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Checkbox id="terms-auth" className="mt-0.5" />
                  <div>
                    <label htmlFor="terms-auth" className="cursor-pointer">
                      Tôi đồng ý với{" "}
                    </label>
                    <Link href="/terms" className="text-primary font-medium hover:underline">Điều khoản</Link>{" "}
                    <label htmlFor="terms-auth" className="cursor-pointer">
                      và{" "}
                    </label>
                    <Link href="/privacy" className="text-primary font-medium hover:underline">Chính sách bảo mật</Link>
                    <label htmlFor="terms-auth" className="cursor-pointer">
                      .
                    </label>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-hero text-black w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold disabled:opacity-70"
              >
                {loading ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">HOẶC</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="flex justify-center">
                <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                  <GoogleLogin
                    onSuccess={(credentialResponse) => {
                      (async () => {
                        if (loading) return;
                        setLoading(true);
                        setError("");
                        try {
                          const res = await fetchApi("/api/auth/google", {
                            method: "POST",
                            body: JSON.stringify({ idToken: credentialResponse.credential }),
                          });
                          localStorage.setItem("token", res.token);
                          localStorage.setItem("userId", res.userId);
                          localStorage.setItem("email", res.email);
                          localStorage.setItem("fullName", res.fullName);
                          if (res.createdAt) localStorage.setItem("createdAt", res.createdAt);
                          toast.success("Đăng nhập Google thành công!");
                          router.replace(res.email === "admin@craftvision.vn" ? "/admin/nfc" : "/home");
                        } catch (err: any) {
                          setError("Đăng nhập Google thất bại: " + err.message);
                        } finally {
                          setLoading(false);
                        }
                      })();
                    }}
                    onError={() => {
                      setError("Đăng nhập Google thất bại.");
                    }}
                    useOneTap
                    shape="rectangular"
                    theme="outline"
                    text="continue_with"
                    size="large"
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
