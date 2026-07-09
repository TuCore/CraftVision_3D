"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Product } from "@/lib/mock-products";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";

export default function CartPage() {
  const router = useRouter();
  const { cartItems, updateQuantity, removeItem } = useCart();

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  
  const shipping = subtotal > 500000 ? 0 : 30000;
  const total = subtotal + (cartItems.length > 0 ? shipping : 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <AppShell active="cart">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl md:text-4xl font-extrabold font-display mb-8 text-foreground">
          Giỏ hàng của bạn
        </h1>

        {cartItems.length === 0 ? (
          <div className="glass-card rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-soft">
            <div className="w-24 h-24 rounded-full glass-strong flex items-center justify-center mb-6">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <h2 className="text-2xl font-bold font-display mb-2">Giỏ hàng còn trống</h2>
            <p className="text-muted-foreground mb-8">
              Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng.
            </p>
            <Link
              href="/shop"
              className="btn-hero rounded-2xl px-8 py-4 font-semibold inline-flex items-center gap-2"
            >
              Tiếp tục mua sắm
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Cart Items */}
            <div className="flex-1 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-soft"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-24 h-24 sm:w-[100px] sm:h-[100px] object-cover rounded-xl shrink-0"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground line-clamp-2 mb-1">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      Phân loại: {item.product.category}
                    </p>
                    <div className="font-medium text-primary">
                      {formatPrice(item.product.price)}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 sm:gap-8 w-full sm:w-auto justify-between sm:justify-end mt-4 sm:mt-0">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full glass-strong flex items-center justify-center hover:bg-white/50 transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="font-semibold text-sm w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full glass-strong flex items-center justify-center hover:bg-white/50 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="font-display font-bold text-foreground">
                        {formatPrice(item.product.price * item.quantity)}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.product.id)}
                        className="mt-1 text-xs text-destructive hover:underline inline-flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" /> Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Order Summary */}
            <div className="w-full lg:w-1/3">
              <div className="glass-strong rounded-3xl p-6 lg:sticky lg:top-24 shadow-soft">
                <h2 className="text-xl font-bold font-display mb-6 text-foreground">
                  Tóm tắt đơn hàng
                </h2>

                <div className="space-y-4 text-sm mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tạm tính:</span>
                    <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Phí vận chuyển:</span>
                    <span className="font-medium text-foreground">
                      {shipping === 0 ? (
                        <span className="text-green-600">Miễn phí</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <div className="text-xs text-muted-foreground bg-white/50 p-2 rounded-lg text-center">
                      Mua thêm <span className="font-semibold">{formatPrice(500000 - subtotal)}</span> để được miễn phí giao hàng!
                    </div>
                  )}
                </div>

                <div className="border-t border-border mb-6" />

                <div className="flex justify-between items-end mb-8">
                  <span className="text-base font-semibold text-foreground">Tổng cộng:</span>
                  <span className="text-3xl font-bold font-display gradient-text">
                    {formatPrice(total)}
                  </span>
                </div>

                <button
                  onClick={() => router.push("/shop")}
                  className="w-full py-4 rounded-2xl btn-hero font-semibold text-base mb-3 shadow-coral"
                >
                  Tiếp tục mua sắm
                </button>
                <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
                  Thanh toán sẽ sớm ra mắt <span className="animate-pulse">💫</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
