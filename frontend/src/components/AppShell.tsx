"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Box, Home, MessageCircle, Settings, User, LogOut, ShoppingBag, Store } from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";
import { useCart } from "@/components/CartProvider";
import { useTranslation } from "@/components/LanguageProvider";

export function AppShell({ children, active }: { children: ReactNode; active?: string }) {
  const { t } = useTranslation();
  const { cartCount } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [isBumping, setIsBumping] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDemoMode = new URLSearchParams(window.location.search).get("demo") === "true";
      setIsDemo(isDemoMode);
      
      if (!isDemoMode) {
        const token = localStorage.getItem("token");
        if (!token) {
          router.replace("/auth");
        } else {
          setIsCheckingAuth(false);
        }
      } else {
        setIsCheckingAuth(false);
      }
    }
  }, [pathname, router]);


  useEffect(() => {
    if (cartCount > 0) {
      setIsBumping(true);
      const timer = setTimeout(() => setIsBumping(false), 400);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);
  
  const nav = [
    { to: "/home", label: t("nav.home"), icon: Home, key: "home" },
    { to: "/shop", label: t("nav.shop"), icon: Store, key: "shop" },
    { to: "/chat", label: t("nav.ai"), icon: MessageCircle, key: "chat" },
    { to: "/profile", label: t("nav.profile"), icon: User, key: "profile" },
    { to: "/cart", label: t("nav.cart"), icon: ShoppingBag, key: "cart" },
  ] as const;

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{animationDelay:"0ms"}}></div>
          <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{animationDelay:"150ms"}}></div>
          <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{animationDelay:"300ms"}}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-clip">
      <div className="blob animate-pulse-glow" style={{ top: -120, left: -100, width: 420, height: 420, background: "var(--color-primary)" }} />
      <div className="blob animate-pulse-glow" style={{ top: "40%", right: -140, width: 500, height: 500, background: "var(--color-secondary)", animationDelay: "1s" }} />
      <div className="blob animate-pulse-glow" style={{ bottom: -120, left: "30%", width: 460, height: 460, background: "var(--color-coral)", animationDelay: "2s" }} />

      <header className="sticky top-0 z-50 px-4 pt-4">
        <div className="mx-auto max-w-7xl bg-card/85 backdrop-blur-md border border-border shadow-soft rounded-2xl px-5 py-3 flex items-center justify-between">
          <Link href={isDemo ? "/" : "/home"} className="flex items-center gap-2 font-bold text-lg">
            <img src="/image/logoweb.jpg" alt="CraftVision3D Logo" className="w-10 h-10 object-cover rounded-full shadow-sm shrink-0 border border-border" />
            <span className="font-display">
              <span className="gradient-text">Craft</span>Vision
              <span className="text-[color:var(--coral)]">3D</span>
            </span>
          </Link>
          {!isDemo && (
          <nav className="hidden md:flex items-center gap-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.key;
              const isCart = item.key === "cart";
              return (
                <Link
                  key={item.key}
                  href={item.to}
                  className={`relative overflow-hidden inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-card/80 text-primary shadow-soft"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                  } ${isCart && isBumping ? 'animate-cart-bump' : ''}`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {isCart && cartCount > 0 && (
                    <span className="ml-1 flex h-4 min-w-[1rem] px-1 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                      {cartCount}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 h-1 w-1/2 -translate-x-1/2 rounded-t-full bg-[color:var(--coral)]" />
                  )}
                </Link>
              );
            })}
          </nav>
          )}
          <div className="flex items-center gap-2">
            {!isDemo ? (
              <>
                <Link
              href="/settings"
              className={`relative inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                active === "settings" ? "bg-card/80 text-primary shadow-soft" : "bg-card/70 hover:bg-card text-muted-foreground hover:text-foreground"
              }`}
              title="Cài đặt"
            >
              <Settings className="h-5 w-5" />
              {active === "settings" && (
                <span className="absolute bottom-0 left-1/2 h-1 w-1/2 -translate-x-1/2 rounded-t-full bg-[color:var(--coral)]" />
              )}
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                localStorage.removeItem("email");
                localStorage.removeItem("fullName");
                localStorage.removeItem("createdAt");
                router.replace("/auth");
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-card/70 px-3 py-2 text-sm font-medium hover:bg-card"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t("nav.logout")}</span>
            </button>
              </>
            ) : (
              <Link
                href="/auth"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow-sm hover:opacity-90"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Thoát Demo</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main key={pathname} className={`relative z-10 px-4 animate-fade-in-page ${pathname.startsWith('/chat') ? 'py-4 md:py-6' : 'py-8 md:py-12'}`}>
        {children}
      </main>
      
    </div>
  );
}
