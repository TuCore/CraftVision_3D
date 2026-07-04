import Link from "next/link";
import { Box, Home, MessageCircle, Settings, User, LogOut } from "lucide-react";
import type { ReactNode } from "react";

export function AppShell({ children, active }: { children: ReactNode; active?: string }) {
  const nav = [
    { to: "/home", label: "Trang chủ", icon: Home, key: "home" },
    { to: "/chat", label: "Trợ lý AI", icon: MessageCircle, key: "chat" },
    { to: "/profile", label: "Hồ sơ", icon: User, key: "profile" },
    { to: "/settings", label: "Cài đặt", icon: Settings, key: "settings" },
  ] as const;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="blob animate-pulse-glow" style={{ top: -120, left: -100, width: 420, height: 420, background: "oklch(0.78 0.22 35)" }} />
      <div className="blob animate-pulse-glow" style={{ top: "40%", right: -140, width: 500, height: 500, background: "oklch(0.88 0.18 95)", animationDelay: "1s" }} />
      <div className="blob animate-pulse-glow" style={{ bottom: -120, left: "30%", width: 460, height: 460, background: "oklch(0.86 0.2 140)", animationDelay: "2s" }} />

      <header className="sticky top-0 z-50 px-4 pt-4">
        <div className="mx-auto max-w-7xl glass-strong rounded-2xl px-5 py-3 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2 font-bold text-lg">
            <span className="grid h-9 w-9 place-items-center rounded-xl btn-hero">
              <Box className="h-5 w-5" />
            </span>
            <span className="font-display">
              <span className="gradient-text">Craft</span>Vision
              <span className="text-[color:var(--coral)]">3D</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.key;
              return (
                <Link
                  key={item.key}
                  href={item.to}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white/80 text-foreground shadow-soft"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/auth"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/70 px-3 py-2 text-sm font-medium hover:bg-white"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-4 py-8 md:py-12">{children}</main>
    </div>
  );
}
