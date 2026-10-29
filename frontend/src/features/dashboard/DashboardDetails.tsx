"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cardTemplates } from "@/features/cards/catalog";
import { dashboardRequest, reportParams } from "./api";
import { localTime, metricLabels, money, number, statusLabels, type CardInventory, type DetailReport, type DetailRow, type ReportFilters } from "./types";

export function templateName(slug: string): string {
  return cardTemplates.find(card => card.slug === slug)?.title ?? (slug === "starlight-birthday" ? "Điều ước sinh nhật dệt từ ánh sao" : slug);
}

function ThresholdEditor({ row }: { row: DetailRow }) {
  const [threshold, setThreshold] = useState(row.threshold ?? 5);
  const [busy, setBusy] = useState(false);
  const client = useQueryClient();
  async function save() {
    if (!Number.isInteger(threshold) || threshold < 0 || threshold > 1000000) { toast.error("Ngưỡng tồn kho phải từ 0 đến 1.000.000."); return; }
    setBusy(true);
    try {
      await dashboardRequest(`stock-threshold/${row.id}`, { method: "PUT", body: JSON.stringify({ threshold }) });
      await client.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Đã cập nhật ngưỡng tồn kho.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Không lưu được ngưỡng tồn kho."); }
    finally { setBusy(false); }
  }
  return <div className="mt-2 flex items-center gap-2 text-xs"><label className="flex items-center gap-2">Ngưỡng cảnh báo<input aria-label={`Ngưỡng cảnh báo ${row.label}`} type="number" min={0} max={1000000} value={threshold} onChange={e => setThreshold(Number(e.target.value))} className="w-20 rounded-lg border border-border bg-background px-2 py-1" /></label><button type="button" disabled={busy || threshold === row.threshold} onClick={save} className="rounded-lg border border-border px-2 py-1 font-semibold text-primary disabled:opacity-50">{busy ? "Đang lưu…" : "Lưu"}</button></div>;
}

export function DashboardDetails({ metric, filters, onClose }: { metric: string; filters: ReportFilters; onClose: () => void }) {
  const [page, setPage] = useState(1);
  const cards = metric === "cardInventory";
  const query = useQuery({ queryKey: ["dashboard", "details", metric, filters, page], queryFn: async ({ signal }) => {
    if (!cards) return dashboardRequest<DetailReport>(`details?${reportParams(filters)}&metric=${metric}&page=${page}`, { signal });
    const data = await dashboardRequest<CardInventory>(`cards?page=${page}`, { signal });
    return { totalItems: data.total, page: data.page, pageSize: data.pageSize, items: data.items.map(card => ({ id: card.id, label: templateName(card.templateSlug), kind: "DigitalCard", at: card.updatedAt, amount: 0, quantity: 1, status: card.status })) } as DetailReport;
  }, staleTime: 0, retry: 1 });
  const description = metric === "legacy" ? "Các giao dịch cũ chưa xác định được ngày thu/hoàn tiền, được tách khỏi báo cáo theo kỳ."
    : ["pending", "refundPending", "customers", "products", "lowStock", "nfc", "cardInventory"].includes(metric) ? "Số liệu hiện tại của toàn hệ thống, không phụ thuộc bộ lọc loại đơn và thanh toán."
    : "Chi tiết theo bộ lọc đang chọn. Giá trị tiền hàng không gồm phí giao hàng; giao dịch hoàn tiền có giá trị âm.";
  const totalPages = Math.max(1, Math.ceil((query.data?.totalItems ?? 0) / 20));
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}><DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl sm:max-w-4xl">
    <DialogHeader><DialogTitle>{metricLabels[metric]}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
    {query.isPending ? <p role="status" className="flex justify-center gap-2 p-12 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Đang tải chi tiết…</p>
      : query.isError ? <p role="alert" className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">{query.error.message} <button type="button" onClick={() => { void query.refetch(); }} className="underline">Thử lại</button></p>
      : <>
        <p className="text-xs text-muted-foreground">{number(query.data.totalItems)} bản ghi · Trang {page}/{totalPages}</p>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-border text-xs text-muted-foreground"><tr><th className="py-3">Nội dung</th><th className="px-3">Trạng thái</th><th className="px-3 text-right">Số lượng</th><th className="px-3 text-right">Giá trị</th><th className="whitespace-nowrap pl-3">Thời gian</th></tr></thead><tbody className="divide-y divide-border">
          {query.data.items.map(row => <tr key={row.id}><td className="min-w-48 py-3 pr-2"><div className="flex items-start gap-2"><span className="font-medium">{row.kind === "DigitalCard" && ["productsSold", "cardsSold"].includes(metric) ? templateName(row.label) : row.label}</span>{row.href && <Link href={row.href} aria-label={`Mở ${row.label}`} className="text-primary"><ArrowUpRight className="h-4 w-4" /></Link>}</div><span className="text-xs text-muted-foreground">{row.kind === "DigitalCard" ? "Thiệp số" : row.kind === "Product" ? "Sản phẩm" : row.kind}</span>{row.threshold !== null && row.threshold !== undefined && <ThresholdEditor key={`${row.id}:${row.threshold}`} row={row} />}</td>
            <td className="whitespace-nowrap px-3 text-xs">{statusLabels[row.status] ?? row.status}</td><td className="px-3 text-right tabular-nums">{number(row.quantity)}</td><td className="whitespace-nowrap px-3 text-right tabular-nums">{["customers", "newCustomers", "nfc", "cardInventory"].includes(metric) ? "—" : money(row.amount)}</td><td className="whitespace-nowrap pl-3 text-xs text-muted-foreground">{row.at ? localTime(row.at) : "Chưa xác định"}</td></tr>)}
          {!query.data.items.length && <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">Không có dữ liệu phù hợp.</td></tr>}
        </tbody></table></div>
        <div className="flex items-center justify-end gap-3"><button type="button" aria-label="Trang trước" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-border p-2 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><span className="text-xs">{page}/{totalPages}</span><button type="button" aria-label="Trang sau" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="rounded-lg border border-border p-2 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div>
      </>}
  </DialogContent></Dialog>;
}
