export interface ReportFilters { from: string; to: string; kind: string; method: string; groupBy: string }
export interface Metrics { revenue: number; orders: number; paidOrders: number; productsSold: number; cardsSold: number; buyers: number; receipts: number; refunds: number; shipping: number; refundedProducts: number; refundedCards: number }
export interface SummaryReport { current: Metrics; previous: Metrics; unknownEvents: number; unknownNetRevenue: number; updatedAt: string }
export interface RevenueReport { series: { date: string; revenue: number; receipts: number; refunds: number; previousRevenue: number }[]; composition: { name: string; value: number }[]; statuses: { name: string; value: number }[]; updatedAt: string }
export interface TopRow { key: string; name: string; quantity: number; refundedQuantity: number; orders: number; revenue: number }
export interface TopReport { products: TopRow[]; cards: TopRow[]; updatedAt: string }
export interface SystemReport { customers: number; newCustomers: number; products: number; stock: number; lowStock: number; nfcTotal: number; nfcAvailable: number; nfcReserved: number; nfcSold: number; nfcActive: number; pendingOrders: number; refundPending: number; nfcLowStockThreshold: number; updatedAt: string }
export interface DetailRow { id: string; label: string; kind: string; at: string | null; amount: number; quantity: number; status: string; href?: string; threshold?: number }
export interface DetailReport { items: DetailRow[]; totalItems: number; page: number; pageSize: number }
export interface CardInventory { total: number; published: number; drafts: number; items: { id: string; templateSlug: string; status: string; updatedAt: string }[]; page: number; pageSize: number }

export const metricLabels: Record<string, string> = { revenue: "Doanh thu đã thu", orders: "Đơn phát sinh", paidOrders: "Đơn đã thanh toán", productsSold: "Sản phẩm bán ra", cardsSold: "Thiệp số đã bán", buyers: "Khách mua hàng", legacy: "Giao dịch cũ thiếu ngày", pending: "Đơn cần xử lý", refundPending: "Đơn hủy chờ hoàn tiền", customers: "Khách hàng đang hoạt động", newCustomers: "Khách mới trong kỳ", products: "Sản phẩm đang bán", lowStock: "Sản phẩm sắp hết hàng", nfc: "Kho NFC", cardInventory: "Thiệp đã lưu trên hệ thống" };
export const statusLabels: Record<string, string> = { Pending: "Chờ xử lý", Processing: "Đang xử lý", WaitingProduction: "Chờ sản xuất", Producing: "Đang sản xuất", ReadyToShip: "Chờ giao", Shipped: "Đang giao", Delivered: "Đã giao", Cancelled: "Đã hủy", Paid: "Đã thanh toán", Unpaid: "Chưa thanh toán", Refunded: "Đã hoàn tiền", Failed: "Thất bại", Receipt: "Thu tiền", Refund: "Hoàn toàn bộ", Available: "Còn trống", Reserved: "Đã giữ chỗ", Sold: "Đã bán", Active: "Đang hoạt động", Disabled: "Vô hiệu hóa", Lost: "Thất lạc", Draft: "Chưa công khai", Published: "Đang công khai", InStock: "Có sẵn", PreOrder: "Đặt trước" };
export const number = (value: number) => new Intl.NumberFormat("vi-VN").format(value);
export const money = (value: number) => `${number(value)} ₫`;
export const localTime = (value: string) => new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(value));

export function todayVietnam(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
export function shiftDate(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
export function presetRange(preset: string, today = todayVietnam()): { from: string; to: string } {
  return { from: preset === "today" ? today : preset === "month" ? `${today.slice(0, 7)}-01` : shiftDate(today, preset === "7" ? -6 : -29), to: today };
}
export function filterError(filters: ReportFilters): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(filters.from) || !/^\d{4}-\d{2}-\d{2}$/.test(filters.to)) return "Vui lòng chọn ngày bắt đầu và kết thúc.";
  const start = new Date(`${filters.from}T00:00:00Z`), end = new Date(`${filters.to}T00:00:00Z`);
  if (!Number.isFinite(+start) || !Number.isFinite(+end) || start.toISOString().slice(0, 10) !== filters.from || end.toISOString().slice(0, 10) !== filters.to ||
    filters.from < "2000-01-01" || filters.to < filters.from || filters.to > todayVietnam() || (+end - +start) / 86400000 >= 366) return "Chọn khoảng ngày hợp lệ, tối đa 366 ngày và không vượt quá hôm nay.";
  return null;
}
export function changePercent(current: number, previous: number): number | null {
  return previous === 0 ? null : ((current - previous) / Math.abs(previous)) * 100;
}
