import { fetchApi } from "@/lib/apiClient";
import type { CheckoutQuote, CheckoutRequest, UsagePage, Voucher, VoucherSettings } from "./types";

export const voucherApi = {
  list: (): Promise<Voucher[]> => fetchApi("/api/admin/vouchers"),
  create: (value: VoucherSettings): Promise<Voucher> => fetchApi("/api/admin/vouchers", { method: "POST", body: JSON.stringify(value) }),
  update: (id: string, value: VoucherSettings): Promise<Voucher> => fetchApi(`/api/admin/vouchers/${id}`, { method: "PATCH", body: JSON.stringify(value) }),
  usages: (id: string, page: number): Promise<UsagePage> => fetchApi(`/api/admin/vouchers/${id}/usages?page=${page}`),
  quote: (value: CheckoutRequest, signal?: AbortSignal): Promise<CheckoutQuote> => fetchApi("/api/checkout/quote", { method: "POST", body: JSON.stringify(value), signal }),
};
