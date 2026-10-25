"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store } from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";
import { cn } from "@/lib/utils";

export function ShopNavDropdown({ active, transparent, mobile = false, onNavigate }: {
  active?: string;
  transparent: boolean;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const isActive = active === "shop" || pathname === "/shop" || pathname?.startsWith("/shop/");

  return (
    <Link
      href="/shop"
      onClick={onNavigate}
      className={cn(
        "group relative inline-flex items-center rounded-xl text-sm font-medium transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-primary",
        mobile ? "w-full gap-3 px-3.5 py-2.5" : "gap-2 px-3.5 py-2",
        transparent
          ? isActive ? "bg-white/20 text-white font-semibold" : "text-white/80 hover:text-white hover:bg-white/10"
          : isActive ? "bg-card/80 text-primary shadow-soft font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-card/50",
      )}
    >
      <Store className="h-4 w-4" />
      <span>{t("nav.shop")}</span>
      {isActive && !mobile && <span className={cn("absolute bottom-0 left-1/2 h-1 w-1/2 -translate-x-1/2 rounded-t-full", transparent ? "bg-amber-300" : "bg-[color:var(--coral)]")} />}
    </Link>
  );
}
