"use client";

import { useCart } from "./CartProvider";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function FloatingCart() {
  const { cartCount, cartTotal } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isBumping, setIsBumping] = useState(false);

  useEffect(() => {
    // Hide floating cart if already on the cart page
    if (cartCount > 0 && pathname !== "/cart") {
      setIsVisible(true);
      
      // Trigger bump animation
      setIsBumping(true);
      const timer = setTimeout(() => setIsBumping(false), 400);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [cartCount, pathname]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-fade-up pointer-events-auto">
      <div 
        onClick={() => router.push("/cart")}
        className="glass-strong rounded-2xl shadow-coral-glow px-4 py-3 flex items-center gap-4 cursor-pointer hover:-translate-y-1 hover:brightness-110 transition-all duration-300 border border-white/40"
      >
        <div className={`relative bg-[color:var(--coral)]/10 p-2 rounded-xl ${isBumping ? 'animate-cart-bump' : ''}`}>
          <ShoppingBag className="h-5 w-5 text-[color:var(--coral)]" />
          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[11px] font-bold text-white shadow-sm">
            {cartCount}
          </span>
        </div>
        
        <div className="flex flex-col pr-2">
          <span className="text-xs text-muted-foreground font-medium">Giỏ hàng của bạn</span>
          <span className="text-sm font-bold font-display gradient-text">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}
          </span>
        </div>

        <div className="h-8 w-8 rounded-full btn-hero flex items-center justify-center text-white shadow-sm ml-2 transition-transform group-hover:translate-x-1">
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
