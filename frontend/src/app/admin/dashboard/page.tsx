"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, ArrowDownRight, ArrowUpRight, BarChart3, Download, Filter, Gift, Layers3, Loader2, Package, RefreshCw, ShoppingBag, Tag, Users, Wallet, AlertTriangle, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { AUTH_SESSION_EVENT, getAccessToken, getJwtRole } from "@/lib/authSession";
import { DashboardCharts } from "@/features/dashboard/DashboardCharts";
import { DashboardDetails, templateName } from "@/features/dashboard/DashboardDetails";
import { dashboardRequest, dashboardResponse, reportParams } from "@/features/dashboard/api";
import { changePercent, filterError, localTime, metricLabels, money, number, presetRange, shiftDate, todayVietnam, type CardInventory, type ReportFilters, type RevenueReport, type SummaryReport, type SystemReport, type TopReport, type TopRow } from "@/features/dashboard/types";

const initialFilters = (): ReportFilters => ({ ...presetRange("30"), kind: "all", method: "all", groupBy: "day" });
const kpis = [
  { key: "revenue", icon: Wallet, unit: "VND", hint: "Tiền hàng đã thu trừ hoàn tiền, không gồm phí giao hàng", color: "text-orange-600 bg-orange-500/10" },
  { key: "orders", icon: ShoppingBag, unit: "đơn", hint: "Theo ngày tạo đơn; thiệp số chỉ được ghi nhận khi đã thanh toán", color: "text-blue-600 bg-blue-500/10" },
  { key: "paidOrders", icon: Activity, unit: "đơn", hint: "Theo ngày thanh toán, gồm cả đơn hoàn tiền sau đó", color: "text-emerald-600 bg-emerald-500/10" },
  { key: "productsSold", icon: Package, unit: "sản phẩm", hint: "Số lượng đã thu tiền; số lượng hoàn được trình bày riêng", color: "text-rose-600 bg-rose-500/10" },
  { key: "cardsSold", icon: Gift, unit: "thiệp", hint: "Một đơn thiệp số đã thanh toán được tính một thiệp", color: "text-violet-600 bg-violet-500/10" },
  { key: "buyers", icon: Users, unit: "khách", hint: "Khách khác nhau có khoản thanh toán thành công trong kỳ", color: "text-cyan-600 bg-cyan-500/10" },
] as const;

function PanelState({ pending, error, retry, children }: { pending: boolean; error: Error | null; retry: () => void; children: ReactNode }) {
  if (pending) return <div role="status" className="space-y-3 py-5"><span className="sr-only">Đang tải báo cáo…</span><div className="h-10 animate-pulse rounded-xl bg-muted" /><div className="h-36 animate-pulse rounded-xl bg-muted/60" /></div>;
  if (error) return <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 text-sm"><p className="text-destructive">{error.message}</p><button type="button" onClick={retry} className="mt-3 font-semibold text-primary underline">Tải lại khu vực này</button></div>;
  return children;
}

function TopTable({ rows, cards }: { rows: TopRow[]; cards?: boolean }) {
  if (!rows.length) return <p className="py-12 text-center text-sm text-muted-foreground">Chưa có giao dịch trong kỳ.</p>;
  return <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="border-b border-border text-muted-foreground"><tr><th className="py-3 pr-3">{cards ? "Mẫu thiệp" : "Sản phẩm"}</th><th className="whitespace-nowrap px-2 text-right">Đã bán / hoàn</th><th className="px-2 text-right">Đơn</th><th className="whitespace-nowrap pl-3 text-right">Doanh thu</th></tr></thead><tbody className="divide-y divide-border/60">{rows.map((row, index) => <tr key={row.key}><td className="min-w-40 py-4 pr-3"><span className="mr-2 text-muted-foreground">{index + 1}.</span><span className="font-semibold">{cards ? templateName(row.key) : row.name}</span></td><td className="whitespace-nowrap px-2 text-right tabular-nums">{number(row.quantity)} <span className="text-muted-foreground">/ {number(row.refundedQuantity)}</span></td><td className="px-2 text-right tabular-nums">{number(row.orders)}</td><td className="whitespace-nowrap pl-3 text-right font-bold tabular-nums">{money(row.revenue)}</td></tr>)}</tbody></table></div>;
}

export default function AdminDashboardPage() {
  const client = useQueryClient();
  const [access, setAccess] = useState<"loading" | "admin" | "other">("loading");
  const [filters, setFilters] = useState<ReportFilters>(initialFilters);
  const [draft, setDraft] = useState<ReportFilters>(initialFilters);
  const [preset, setPreset] = useState("30");
  const [filterMessage, setFilterMessage] = useState("");
  const [detail, setDetail] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  useEffect(() => {
    const update = () => { const token = getAccessToken(); setAccess(token && getJwtRole(token) === "Admin" ? "admin" : "other"); };
    update(); window.addEventListener(AUTH_SESSION_EVENT, update); window.addEventListener("storage", update);
    return () => { window.removeEventListener(AUTH_SESSION_EVENT, update); window.removeEventListener("storage", update); };
  }, []);
  const options = { enabled: access === "admin", staleTime: 30_000, retry: 1, refetchOnWindowFocus: true };
  const summary = useQuery({ queryKey: ["dashboard", "summary", filters], queryFn: ({ signal }) => dashboardRequest<SummaryReport>(`summary?${reportParams(filters)}`, { signal }), ...options });
  const revenue = useQuery({ queryKey: ["dashboard", "revenue", filters], queryFn: ({ signal }) => dashboardRequest<RevenueReport>(`revenue?${reportParams(filters)}`, { signal }), ...options });
  const top = useQuery({ queryKey: ["dashboard", "top", filters], queryFn: ({ signal }) => dashboardRequest<TopReport>(`top-selling?${reportParams(filters)}`, { signal }), ...options });
  const system = useQuery({ queryKey: ["dashboard", "system", filters.from, filters.to], queryFn: ({ signal }) => dashboardRequest<SystemReport>(`system?from=${filters.from}&to=${filters.to}`, { signal }), ...options });
  const cards = useQuery({ queryKey: ["dashboard", "cards"], queryFn: ({ signal }) => dashboardRequest<CardInventory>("cards", { signal }), ...options });
  const refreshing = summary.isFetching || revenue.isFetching || top.isFetching || system.isFetching || cards.isFetching;

  function apply(event: FormEvent) {
    event.preventDefault();
    const error = filterError(draft);
    if (error) { setFilterMessage(error); return; }
    setFilters({ ...draft }); setPreset("custom"); setFilterMessage(""); setDetail(null);
  }
  function quickRange(value: string) {
    const next = { ...draft, ...presetRange(value) };
    setDraft(next); setFilters(next); setPreset(value); setFilterMessage(""); setDetail(null);
  }
  async function exportReport() {
    setExporting(true);
    try {
      const response = await dashboardResponse(`reports/sales/export?${reportParams(filters)}`);
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = `doanh-thu-${filters.from}-${filters.to}.csv`;
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("Đã xuất báo cáo theo bộ lọc hiện tại.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Không xuất được báo cáo."); }
    finally { setExporting(false); }
  }

  if (access === "loading") return <p role="status" className="flex items-center gap-2 p-8 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Đang kiểm tra phiên đăng nhập…</p>;
  if (access !== "admin") return <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-8 text-center"><BarChart3 className="mx-auto mb-4 h-10 w-10 text-primary" /><h1 className="text-2xl font-bold">Bảng điều khiển quản trị</h1><p className="my-4 text-sm text-muted-foreground">Đăng nhập bằng tài khoản quản trị viên để xem doanh thu và thống kê hệ thống.</p><Link href="/auth" className="inline-block rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground">Đăng nhập</Link></div>;

  const panel = "min-w-0 rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6";
  const input = "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30";
  const days = Math.round((+new Date(filters.to) - +new Date(filters.from)) / 86400000) + 1;
  const previousLabel = `${shiftDate(filters.from, -days)} → ${shiftDate(filters.from, -1)}`;
  return <div className="mx-auto max-w-7xl space-y-6 pb-12">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">CraftVision 3D · Admin</p><h1 className="flex items-center gap-3 font-display text-3xl font-extrabold"><BarChart3 className="h-8 w-8 text-primary" />Tổng quan hệ thống</h1><p className="mt-2 text-sm text-muted-foreground">Theo dõi doanh thu, đơn hàng và hoạt động bán hàng tại một nơi.</p></div>
      <div className="flex gap-2"><button type="button" onClick={() => { void client.invalidateQueries({ queryKey: ["dashboard"] }); }} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />Tải lại</button><button type="button" onClick={exportReport} disabled={exporting || summary.isPending || summary.isError} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50">{exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}Xuất CSV</button></div>
    </div>

    <form onSubmit={apply} className={`${panel} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 text-sm font-bold"><Filter className="h-4 w-4 text-primary" />Bộ lọc báo cáo</div><div className="flex flex-wrap gap-2">{[["today", "Hôm nay"], ["7", "7 ngày"], ["30", "30 ngày"], ["month", "Tháng này"]].map(([value, label]) => <button type="button" key={value} aria-pressed={preset === value} onClick={() => quickRange(value)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${preset === value ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"}`}>{label}</button>)}</div></div>
      <div className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
        <label className="space-y-1.5 text-xs font-semibold"><span>Từ ngày</span><input aria-label="Từ ngày" type="date" required min="2000-01-01" max={todayVietnam()} value={draft.from} onChange={e => { setDraft({ ...draft, from: e.target.value }); setPreset("custom"); }} className={input} /></label>
        <label className="space-y-1.5 text-xs font-semibold"><span>Đến ngày</span><input aria-label="Đến ngày" type="date" required min={draft.from} max={todayVietnam()} value={draft.to} onChange={e => { setDraft({ ...draft, to: e.target.value }); setPreset("custom"); }} className={input} /></label>
        <label className="space-y-1.5 text-xs font-semibold"><span>Loại đơn</span><select value={draft.kind} onChange={e => setDraft({ ...draft, kind: e.target.value })} className={input}><option value="all">Tất cả loại đơn</option><option value="Product">Sản phẩm</option><option value="DigitalCard">Thiệp số</option></select></label>
        <label className="space-y-1.5 text-xs font-semibold"><span>Thanh toán</span><select value={draft.method} onChange={e => setDraft({ ...draft, method: e.target.value })} className={input}><option value="all">Tất cả phương thức</option><option value="BankTransfer">Chuyển khoản / PayOS</option><option value="Cod">COD</option><option value="None">Chưa xác định</option></select></label>
        <button type="submit" className="rounded-xl bg-foreground px-5 py-2.5 text-sm font-bold text-background">Áp dụng</button>
      </div>
      {filterMessage && <p role="alert" className="text-sm text-destructive">{filterMessage}</p>}
      <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground"><span>Giờ Việt Nam · So sánh với {previousLabel}{filters.to === todayVietnam() ? " · Kỳ hiện tại chưa kết thúc" : ""}</span><span>{summary.data ? `Cập nhật ${localTime(summary.data.updatedAt)}` : "Đang tải dữ liệu"}</span></div>
    </form>

    <PanelState pending={summary.isPending} error={summary.error} retry={() => { void summary.refetch(); }}>
      {summary.data && <>
        {summary.data.unknownEvents > 0 && <button type="button" onClick={() => setDetail("legacy")} className="flex w-full items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-left text-sm"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" /><span><strong>{number(summary.data.unknownEvents)} giao dịch cũ chưa có ngày thanh toán/hoàn tiền.</strong><span className="mt-1 block text-xs text-muted-foreground">Tiền hàng ròng {money(summary.data.unknownNetRevenue)} được tách khỏi báo cáo và CSV theo kỳ. Nhấn để xem chi tiết.</span></span><ChevronRight className="ml-auto h-4 w-4 shrink-0" /></button>}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-6">{kpis.map(({ key, icon: Icon, hint, color, unit }) => {
          const value = summary.data.current[key], prior = summary.data.previous[key], change = changePercent(value, prior);
          return <button type="button" key={key} title={hint} onClick={() => setDetail(key)} className={`${panel} group p-4 text-left transition-colors hover:border-primary/40 sm:p-4`}><div className="mb-4 flex items-center justify-between gap-2"><span className={`rounded-xl p-2.5 ${color}`}><Icon className="h-5 w-5" /></span><ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" /></div><p className="min-h-8 text-xs font-medium text-muted-foreground">{metricLabels[key]}</p><p className="mt-2 break-words text-xl font-extrabold tracking-tight tabular-nums sm:text-2xl">{key === "revenue" ? money(value) : number(value)}</p>{key !== "revenue" && <p className="mt-1 text-xs text-muted-foreground">{unit}</p>}<p className={`mt-3 flex items-center gap-1 text-[11px] ${change === null || change === 0 ? "text-muted-foreground" : change > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>{change === null ? "Chưa có cơ sở so sánh" : <>{change >= 0 ? <ArrowUpRight className="h-3 w-3 shrink-0" /> : <ArrowDownRight className="h-3 w-3 shrink-0" />}{change > 0 ? "Tăng " : change < 0 ? "Giảm " : "Không đổi "}{Math.abs(change).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}% so với kỳ trước</>}</p></button>;
        })}</div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 px-1 text-xs text-muted-foreground"><span>Tiền hàng đã thu: <strong className="text-foreground">{money(summary.data.current.receipts)}</strong></span><span>Đã hoàn: <strong className="text-foreground">{money(summary.data.current.refunds)}</strong></span><span>Phí giao hàng ròng: <strong className="text-foreground">{money(summary.data.current.shipping)}</strong></span><span>Số lượng hoàn: <strong className="text-foreground">{number(summary.data.current.refundedProducts)} sản phẩm · {number(summary.data.current.refundedCards)} thiệp</strong></span></div>
      </>}
    </PanelState>

    <section className={panel} aria-labelledby="revenue-heading"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 id="revenue-heading" className="text-lg font-bold">Xu hướng doanh thu</h2><p className="mt-1 text-xs text-muted-foreground">Theo ngày thu/hoàn tiền · không bao gồm phí giao hàng</p></div><div className="flex rounded-xl border border-border p-1">{[["day", "Ngày"], ["week", "Tuần"], ["month", "Tháng"]].map(([value, label]) => <button type="button" aria-pressed={filters.groupBy === value} key={value} onClick={() => { setFilters({ ...filters, groupBy: value }); setDraft({ ...draft, groupBy: value }); }} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${filters.groupBy === value ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>{label}</button>)}</div></div><PanelState pending={revenue.isPending} error={revenue.error} retry={() => { void revenue.refetch(); }}>{revenue.data && <DashboardCharts report={revenue.data} />}</PanelState></section>

    <section aria-label="Bán chạy trong kỳ"><PanelState pending={top.isPending} error={top.error} retry={() => { void top.refetch(); }}>{top.data && <div className="grid gap-6 lg:grid-cols-2"><div className={panel}><h2 className="text-lg font-bold">Sản phẩm bán chạy</h2><p className="mt-1 text-xs text-muted-foreground">Xếp theo doanh thu sau hoàn tiền</p><TopTable rows={top.data.products} /></div><div className={panel}><h2 className="text-lg font-bold">Mẫu thiệp bán chạy</h2><p className="mt-1 text-xs text-muted-foreground">Mỗi đơn thiệp chỉ ghi nhận một lần</p><TopTable rows={top.data.cards} cards /></div></div>}</PanelState></section>

    <section className={panel} aria-labelledby="system-heading"><div className="mb-5"><h2 id="system-heading" className="flex items-center gap-2 text-lg font-bold"><Layers3 className="h-5 w-5 text-primary" />Số lượng toàn hệ thống</h2><p className="mt-1 text-xs text-muted-foreground">Số liệu hiện tại · độc lập với bộ lọc loại đơn và thanh toán</p></div>
      <PanelState pending={system.isPending} error={system.error} retry={() => { void system.refetch(); }}>{system.data && <>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[
          { metric: "customers", value: system.data.customers, label: "Khách hàng hoạt động", icon: Users, sub: `${number(system.data.newCustomers)} khách mới trong kỳ` },
          { metric: "products", value: system.data.products, label: "Sản phẩm đang bán", icon: Package, sub: `${number(system.data.stock)} sản phẩm có sẵn trong kho` },
          { metric: "nfc", value: system.data.nfcTotal, label: "Thẻ NFC", icon: Tag, sub: `${number(system.data.nfcAvailable)} còn trống · ${number(system.data.nfcActive)} hoạt động` },
        ].map(({ metric, value, label, icon: Icon, sub }) => <button type="button" key={metric} onClick={() => setDetail(metric)} className="rounded-2xl border border-border bg-muted/20 p-4 text-left hover:border-primary/40"><div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground"><Icon className="h-4 w-4 text-primary" />{label}</div><p className="text-2xl font-extrabold tabular-nums">{number(value)}</p><p className="mt-2 text-xs text-muted-foreground">{sub}</p></button>)}
          <div className="rounded-2xl border border-border bg-muted/20 p-4"><p className="mb-3 flex items-center gap-2 text-xs text-muted-foreground"><Gift className="h-4 w-4 text-primary" />Thiệp đã lưu</p>{cards.isPending ? <p role="status" className="text-xs text-muted-foreground">Đang tải…</p> : cards.isError ? <p role="alert" className="text-xs text-muted-foreground">Thống kê thiệp chưa khả dụng. <button type="button" onClick={() => { void cards.refetch(); }} className="text-primary underline">Thử lại</button></p> : cards.data && <button type="button" onClick={() => setDetail("cardInventory")} className="w-full text-left"><p className="text-2xl font-extrabold tabular-nums">{number(cards.data.total)}</p><p className="mt-2 text-xs text-muted-foreground">{number(cards.data.published)} công khai · {number(cards.data.drafts)} chưa công khai</p></button>}</div>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground"><button type="button" onClick={() => setDetail("newCustomers")} className="text-primary underline">Xem khách mới trong kỳ</button><span>NFC: {number(system.data.nfcReserved)} giữ chỗ · {number(system.data.nfcSold)} đã bán</span><span>Cập nhật {localTime(system.data.updatedAt)}</span></div>
      </>}</PanelState>
    </section>

    <section className={panel} aria-labelledby="alerts-heading"><h2 id="alerts-heading" className="mb-4 flex items-center gap-2 text-lg font-bold"><AlertTriangle className="h-5 w-5 text-primary" />Cần xử lý</h2><PanelState pending={system.isPending} error={system.error} retry={() => { void system.refetch(); }}>{system.data && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[
      { metric: "pending", value: system.data.pendingOrders, label: "Đơn chờ xử lý / sản xuất" },
      { metric: "lowStock", value: system.data.lowStock, label: "Sản phẩm sắp hết hàng" },
      { metric: "refundPending", value: system.data.refundPending, label: "Đơn hủy đã thu tiền, chờ hoàn" },
      { metric: "nfc", value: system.data.nfcAvailable, label: system.data.nfcAvailable <= system.data.nfcLowStockThreshold ? "NFC sắp hết — cần bổ sung" : "NFC còn trống", nfc: true },
    ].map(({ metric, value, label, nfc }) => <button type="button" key={metric} onClick={() => setDetail(metric)} className={`flex items-center justify-between gap-3 rounded-2xl border p-4 text-left ${(!nfc && value > 0) || (nfc && value <= system.data!.nfcLowStockThreshold) ? "border-amber-500/25 bg-amber-500/5" : "border-border bg-muted/20"}`}><span className="text-xs font-medium">{label}</span><strong className="text-xl tabular-nums">{number(value)}</strong><ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" /></button>)}</div>}</PanelState></section>
    <p className="text-xs leading-relaxed text-muted-foreground">Doanh thu này phản ánh tiền hàng đã thu sau hoàn tiền, chưa phải lợi nhuận. Đơn sản phẩm được đếm theo ngày tạo; thiệp số chỉ xuất hiện trong lịch sử đơn khi đã thanh toán. Số lượng bán và số lượng hoàn được thống kê riêng. CSV dùng cùng bộ lọc và chỉ gồm giao dịch có ngày xác định.</p>
    {detail && <DashboardDetails key={`${detail}:${reportParams(filters)}`} metric={detail} filters={filters} onClose={() => setDetail(null)} />}
  </div>;
}
