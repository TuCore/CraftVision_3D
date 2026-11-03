export type VoucherUsageStatus = "Reserved" | "Used" | "Released";
export interface VoucherSettings { discountPercent: number; customerLimit: number; endsAt: string | null; isActive: boolean; revision?: number; }
export interface Voucher extends VoucherSettings {
  id: string; code: string; reserved: number; used: number; available: number; createdAt: string; revision: number;
}
export interface VoucherUsage {
  id: string; userId: string; customer: string; orderId: string; orderCode: string;
  status: VoucherUsageStatus; paymentStatus: string; orderStatus: string; discountAmount: number;
  reservedAt: string; expiresAt: string | null; usedAt: string | null; releasedAt: string | null;
}
export interface UsagePage { items: VoucherUsage[]; totalItems: number; page: number; pageSize: number; }
export interface DiscountSnapshot {
  voucherCode?: string | null; discountPercent?: number; originalTotal?: number; discountAmount?: number;
  merchandiseDiscount?: number; shippingDiscount?: number; totalAmount: number; voucherUsageStatus?: VoucherUsageStatus | null;
}
export interface CheckoutQuote extends DiscountSnapshot { subtotal: number; shippingFee: number; }
export interface CheckoutItem {
  productId: string; quantity: number; wantNfc: boolean;
  cardType: "none" | "default" | "web_library_3d" | "digital"; cardSlug?: string;
  gift?: Record<string, unknown> | null;
}
export interface CheckoutRequest {
  pricingVersion: 1; receiverName: string; receiverPhone: string; receiverAddress: string;
  paymentMethod: string; items: CheckoutItem[]; voucherCode?: string; expectedTotal?: number;
}
export const usageLabels: Record<VoucherUsageStatus, string> = { Reserved: "Đang giữ lượt", Used: "Đã sử dụng", Released: "Đã trả lượt" };
export const money = (amount: number) => `${new Intl.NumberFormat("vi-VN").format(amount)}đ`;
