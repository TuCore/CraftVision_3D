import { money, usageLabels, type DiscountSnapshot } from "./types";

export default function OrderDiscountSummary({ order }: { order: DiscountSnapshot }) {
  if (!order.voucherCode) return null;
  return <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">
    <div className="flex justify-between gap-4"><span>Trước giảm giá</span><span>{money(order.originalTotal ?? order.totalAmount)}</span></div>
    <div className="flex justify-between gap-4 text-primary"><span>{order.voucherCode} (−{order.discountPercent}%)</span><strong>−{money(order.discountAmount ?? 0)}</strong></div>
    <div className="flex justify-between gap-4 font-bold"><span>Thanh toán</span><span>{money(order.totalAmount)}</span></div>
    {order.voucherUsageStatus && <p className="text-xs text-muted-foreground">Mã giảm giá: {usageLabels[order.voucherUsageStatus]}</p>}
  </div>;
}
