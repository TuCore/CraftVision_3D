"use client";

import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from "recharts";
import { money, number, statusLabels, type RevenueReport } from "./types";

export function DashboardCharts({ report }: { report: RevenueReport }) {
  const compact = (value: number) => new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 }).format(value);
  const dateLabel = (value: string) => new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", timeZone: "UTC" }).format(new Date(value));
  const statuses = report.statuses.map(row => ({ name: statusLabels[row.name] ?? row.name, value: row.value }));
  const composition = report.composition.map(row => ({ name: row.name === "Product" ? "Sản phẩm" : "Thiệp số", value: row.value }));
  const tooltipStyle = { borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" };
  return <>
    <div className="h-72 w-full min-w-0 sm:h-80" role="img" aria-label="Biểu đồ doanh thu theo kỳ và kỳ trước">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <ComposedChart data={report.series} margin={{ top: 12, right: 12, left: 8, bottom: 0 }} accessibilityLayer>
          <defs><linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f97316" stopOpacity={0.28} /><stop offset="100%" stopColor="#f97316" stopOpacity={0.02} /></linearGradient></defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis dataKey="date" tickFormatter={dateLabel} tick={{ fontSize: 11 }} minTickGap={32} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={compact} tick={{ fontSize: 11 }} width={65} axisLine={false} tickLine={false} />
          <Tooltip labelFormatter={label => `Từ ${dateLabel(String(label))}`} formatter={value => money(Number(value))} contentStyle={tooltipStyle} />
          <Area type="monotone" dataKey="revenue" name="Kỳ hiện tại" stroke="#f97316" fill="url(#revenue-fill)" strokeWidth={3} dot={report.series.length === 1} isAnimationActive={false} />
          <Line type="monotone" dataKey="previousRevenue" name="Kỳ trước (cùng vị trí trong kỳ)" stroke="#a8a29e" strokeWidth={2} strokeDasharray="5 5" dot={report.series.length === 1} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-3 flex flex-wrap justify-center gap-5 text-xs text-muted-foreground"><span><span className="mr-2 inline-block h-2 w-2 rounded-full bg-orange-500" />Kỳ hiện tại</span><span><span className="mr-2 inline-block h-0.5 w-4 border-t-2 border-dashed border-stone-400 align-middle" />Kỳ trước cùng độ dài</span></div>
    <div className="mt-6 grid gap-6 border-t border-border pt-6 lg:grid-cols-2">
      <div><h3 className="mb-3 text-sm font-semibold">Cơ cấu doanh thu đã thu</h3>
        <div className="h-40 w-full" role="img" aria-label="Doanh thu sản phẩm và thiệp số"><ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart data={composition} layout="vertical" margin={{ left: 0, right: 20 }} accessibilityLayer><CartesianGrid horizontal={false} stroke="var(--border)" /><XAxis type="number" tickFormatter={compact} tick={{ fontSize: 11 }} /><YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} /><Tooltip formatter={value => money(Number(value))} contentStyle={tooltipStyle} /><Bar dataKey="value" name="Doanh thu" fill="#f97316" radius={[0, 6, 6, 0]} isAnimationActive={false} /></BarChart>
        </ResponsiveContainer></div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">{composition.map(row => <span key={row.name}>{row.name}: <strong className="text-foreground">{money(row.value)}</strong></span>)}</div>
      </div>
      <div><h3 className="mb-3 text-sm font-semibold">Trạng thái đơn phát sinh trong kỳ</h3>
        {statuses.length ? <div className="space-y-2.5">{statuses.map(row => <div key={row.name} className="flex items-center gap-3 text-xs"><span className="w-24 shrink-0 text-muted-foreground">{row.name}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-rose-400" style={{ width: `${(row.value / Math.max(1, ...statuses.map(s => s.value))) * 100}%` }} /></div><strong className="w-8 text-right">{number(row.value)}</strong></div>)}</div> : <p className="py-8 text-center text-sm text-muted-foreground">Chưa có đơn hàng trong kỳ.</p>}
      </div>
    </div>
  </>;
}
