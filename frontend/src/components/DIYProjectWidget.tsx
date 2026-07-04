"use client";

import { useCart } from "./CartProvider";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";
import { useMemo } from "react";

const PROJECT_REQUIREMENTS = [
  { id: "req1", name: "Hạt cườm / Pha lê", isMet: (cart: any[]) => cart.some(item => item.product.category === "Beads") },
  { id: "req2", name: "Dây cước thun", isMet: (cart: any[]) => cart.some(item => item.product.category === "Bracelet String") },
  { id: "req3", name: "Charm đính kèm", isMet: (cart: any[]) => cart.some(item => item.product.category === "Charm") },
];

export function DIYProjectWidget() {
  const { cartItems } = useCart();
  
  const progress = useMemo(() => {
    const metCount = PROJECT_REQUIREMENTS.filter(req => req.isMet(cartItems)).length;
    return Math.round((metCount / PROJECT_REQUIREMENTS.length) * 100);
  }, [cartItems]);

  return (
    <div className="glass-strong rounded-3xl p-6 md:p-8 relative overflow-hidden group border-2 border-primary/10 hover:border-primary/30 transition-colors">
      <div className="absolute top-0 right-0 w-48 h-48 bg-[color:var(--coral)] blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
      
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <Sparkles className="h-5 w-5 text-primary animate-pulse" />
        <h3 className="font-display font-bold text-lg text-foreground">Dự án gợi ý</h3>
      </div>
      
      <div className="mb-6 relative z-10">
        <div className="text-2xl md:text-3xl font-bold gradient-text mb-2">Vòng tay Pha lê Mùa thu</div>
        <div className="text-sm text-muted-foreground">Thu thập đủ các loại nguyên liệu bên dưới để có thể bắt tay vào làm dự án này nhé!</div>
      </div>

      <div className="space-y-4 mb-8 relative z-10">
        {PROJECT_REQUIREMENTS.map((req) => {
          const isMet = req.isMet(cartItems);
          return (
            <div key={req.id} className="flex items-center gap-3">
              {isMet ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground/50 flex-shrink-0" />
              )}
              <span className={`text-sm font-medium transition-all duration-300 ${isMet ? "text-muted-foreground line-through" : "text-foreground"}`}>
                {req.name}
              </span>
              {!isMet && <span className="ml-auto text-[10px] font-bold px-2 py-1 bg-destructive/10 text-destructive rounded-full">Còn thiếu</span>}
            </div>
          );
        })}
      </div>

      <div className="relative z-10">
        <div className="flex justify-between text-xs font-semibold mb-2">
          <span>Tiến độ thu thập</span>
          <span className="text-primary">{progress}%</span>
        </div>
        <div className="h-2 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[color:var(--coral)] to-[color:var(--clay)] transition-all duration-1000 ease-out" 
            style={{ width: `${progress}%` }}
          />
        </div>
        {progress === 100 && (
          <div className="mt-4 text-center text-sm font-bold text-green-500 animate-fade-up">
            🎉 Đã đủ nguyên liệu! Hãy thanh toán và bắt tay vào làm thôi.
          </div>
        )}
      </div>
    </div>
  );
}
