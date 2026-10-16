"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Heart, Store } from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function ShopNavDropdown({ active, transparent, mobile = false, onNavigate }: {
  active?: string;
  transparent: boolean;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const items = [
    { href: "/shop", label: t("nav.handmade"), icon: Store },
    { href: "/cards", label: t("nav.love_gift"), icon: Heart },
  ];
  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const isActive = active === "shop" || active === "love-gift" || items.some(item => isCurrent(item.href));

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
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
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform group-data-[state=open]:rotate-180", mobile && "ml-auto")} />
          {isActive && !mobile && <span className={cn("absolute bottom-0 left-1/2 h-1 w-1/2 -translate-x-1/2 rounded-t-full", transparent ? "bg-amber-300" : "bg-[color:var(--coral)]")} />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="bottom"
        sideOffset={8}
        className={cn("min-w-56 rounded-2xl p-2 shadow-xl", transparent ? "border-white/20 bg-[#250d1e]/95 text-white backdrop-blur-xl" : "border-border bg-card text-foreground")}
      >
        {items.map(({ href, label, icon: Icon }) => (
          <DropdownMenuItem key={href} asChild className={cn(
            "cursor-pointer gap-3 rounded-xl px-3 py-3 font-medium",
            transparent && "focus:bg-white/15 focus:text-white",
            isCurrent(href) && (transparent ? "bg-white/15 text-white" : "bg-primary/10 text-primary"),
          )}>
            <Link href={href} aria-current={isCurrent(href) ? "page" : undefined} onClick={onNavigate}>
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
