"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Copy, Pencil, Plus, RefreshCw, TicketPercent, X } from "lucide-react";
import { toast } from "sonner";
import { voucherApi } from "./api";
import { money, usageLabels, type UsagePage, type Voucher } from "./types";

const field = "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm";
const date = (value: string | null) => value ? new Date(value).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) : "Không hết hạn";
const errorMessage = (error: unknown) => error instanceof Error ? error.message : "Không thể thực hiện thao tác.";
const localDate = (value: string | null) => value ? new Date(new Date(value).getTime() - new Date(value).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "";

export default function VoucherAdminPanel() {
  const [items, setItems] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Voucher | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [percent, setPercent] = useState("25");
  const [limit, setLimit] = useState("20");
  const [expiry, setExpiry] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Voucher | null>(null);
  const [history, setHistory] = useState<UsagePage | null>(null);
  const [historyError, setHistoryError] = useState("");
  const [page, setPage] = useState(1);
  const [historyVersion, setHistoryVersion] = useState(0);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setItems(await voucherApi.list()); } catch (error) { setError(errorMessage(error)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!selected) return;
    let active = true;
    setHistory(null); setHistoryError("");
    voucherApi.usages(selected.id, page).then(value => { if (active) setHistory(value); }, error => { if (active) setHistoryError(errorMessage(error)); });
    return () => { active = false; };
  }, [selected, page, historyVersion]);

  const open = (voucher?: Voucher) => {
    setEditing(voucher ?? null); setPercent(String(voucher?.discountPercent ?? 25));
    setLimit(String(voucher?.customerLimit ?? 20)); setExpiry(localDate(voucher?.endsAt ?? null));
    setEnabled(voucher?.isActive ?? true); setFormOpen(true);
  };
  const copy = async (code: string) => {
    try { await navigator.clipboard.writeText(code); toast.success(`Đã sao chép ${code}`); }
    catch { toast.error("Không thể sao chép tự động. Bạn có thể chọn và sao chép mã trong bảng."); }
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true);
    try {
      const value = { discountPercent: Number(percent), customerLimit: Number(limit), endsAt: expiry ? new Date(expiry).toISOString() : null, isActive: enabled, revision: editing?.revision };
      const voucher = editing ? await voucherApi.update(editing.id, value) : await voucherApi.create(value);
      toast.success(editing ? "Đã cập nhật mã giảm giá." : `Đã tạo ${voucher.code}. Bạn có thể sao chép và gửi cho khách.`);
      setFormOpen(false); await load();
    } catch (error) { toast.error(errorMessage(error)); } finally { setSaving(false); }
  };
  const toggle = async (voucher: Voucher) => {
    setSaving(true);
    try { await voucherApi.update(voucher.id, { ...voucher, isActive: !voucher.isActive }); await load(); }
    catch (error) { toast.error(errorMessage(error)); } finally { setSaving(false); }
  };

  return <div className="mx-auto max-w-6xl space-y-6 pb-12">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="flex items-center gap-2 text-2xl font-bold"><TicketPercent className="text-primary" />Mã giảm giá</h1>
        <p className="mt-2 text-sm text-muted-foreground">Tạo mã theo phần trăm, giới hạn số khách và tự gửi mã riêng cho khách hàng.</p></div>
      <div className="flex gap-2"><button onClick={() => void load()} disabled={loading} className="rounded-xl border border-border p-2.5" aria-label="Tải lại"><RefreshCw size={18} /></button>
        <button onClick={() => open()} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-primary-foreground"><Plus size={18} />Tạo mã</button></div>
    </div>
    <div className="grid gap-3 sm:grid-cols-3">{[
      ["Mã đang bật", items.filter(v => v.isActive && (!v.endsAt || new Date(v.endsAt) > new Date())).length],
      ["Lượt đang giữ", items.reduce((sum, v) => sum + v.reserved, 0)],
      ["Đã dùng và nhận hàng", items.reduce((sum, v) => sum + v.used, 0)],
    ].map(([label, value]) => <div key={label} className="rounded-2xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>)}</div>
    <p className="rounded-xl bg-primary/5 p-3 text-sm text-muted-foreground">Lượt đã dùng chỉ được chốt khi đơn đã thanh toán và giao/nhận thành công. Lượt đang giữ cũng được trừ khỏi số còn khả dụng.</p>
    {error && <p role="alert" className="text-destructive">{error} <Link href="/auth" className="underline">Đăng nhập tài khoản admin</Link></p>}
    {loading ? <p role="status">Đang tải mã giảm giá…</p> : !error && <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-left text-sm"><thead className="bg-muted/50"><tr>{["Mã / mức giảm", "Giới hạn", "Đang giữ", "Đã dùng", "Còn lại", "Hạn dùng", "Trạng thái", "Thao tác"].map(label => <th key={label} className="whitespace-nowrap p-4 font-semibold">{label}</th>)}</tr></thead>
        <tbody>{items.map(v => <tr key={v.id} className="border-t border-border"><td className="p-4"><span className="select-all font-mono font-bold text-primary">{v.code}</span><p className="mt-1 text-xs text-muted-foreground">Giảm {v.discountPercent}% tổng bill</p></td>
          <td className="p-4">{v.customerLimit}</td><td className="p-4">{v.reserved}</td><td className="p-4">{v.used}</td><td className="p-4 font-bold">{v.available}</td>
          <td className="p-4 text-xs">{date(v.endsAt)}</td><td className="p-4 whitespace-nowrap">{!v.isActive ? "Tạm khóa" : v.endsAt && new Date(v.endsAt) <= new Date() ? "Hết hạn" : v.available === 0 ? "Hết lượt" : "Đang bật"}</td>
          <td className="p-4"><div className="flex flex-wrap gap-2"><button onClick={() => void copy(v.code)} className="rounded-lg border border-border p-2" aria-label={`Sao chép ${v.code}`}><Copy size={15} /></button>
            <button onClick={() => open(v)} className="rounded-lg border border-border p-2" aria-label={`Chỉnh sửa ${v.code}`}><Pencil size={15} /></button>
            <button disabled={saving} onClick={() => void toggle(v)} className="rounded-lg border border-border px-2 py-1 text-xs disabled:opacity-50">{v.isActive ? "Khóa" : "Bật"}</button>
            <button onClick={() => { setSelected(v); setPage(1); setHistoryVersion(n => n + 1); }} className="text-xs text-primary underline">Lượt sử dụng</button></div></td></tr>)}</tbody>
      </table>{items.length === 0 && <p className="p-8 text-center text-muted-foreground">Chưa có mã. Nhấn “Tạo mã” để bắt đầu.</p>}
    </div>}
    {formOpen && <div className="rounded-2xl border border-primary/30 bg-card p-5 sm:p-6"><div className="mb-4 flex justify-between"><h2 className="text-lg font-bold">{editing ? `Chỉnh sửa ${editing.code}` : "Tạo mã giảm giá"}</h2><button disabled={saving} onClick={() => setFormOpen(false)} aria-label="Đóng biểu mẫu"><X size={20} /></button></div>
      <form key={editing?.id ?? "new"} onSubmit={save} className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm">Phần trăm giảm<input autoFocus={!editing} type="number" min={1} max={100} step={1} required disabled={!!editing} value={percent} onChange={e => setPercent(e.target.value)} className={field} /></label>
        <label className="space-y-2 text-sm">Số khách tối đa<input autoFocus={!!editing} type="number" min={editing ? editing.reserved + editing.used || 1 : 1} max={1000000} step={1} required value={limit} onChange={e => setLimit(e.target.value)} className={field} /></label>
        <label className="space-y-2 text-sm">Hạn sử dụng (để trống nếu không hết hạn)<input type="datetime-local" value={expiry} onChange={e => setExpiry(e.target.value)} className={field} /></label>
        <div className="space-y-3 text-sm"><p>{editing ? <>Mã: <strong className="break-all font-mono text-primary">{editing.code}</strong></> : "Mã ngẫu nhiên 8 ký tự sẽ được tạo khi bạn nhấn Tạo mã. Mỗi mức giảm có một mã riêng."}</p><label className="flex items-center gap-2"><input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />Cho phép sử dụng</label></div>
        <div className="flex gap-3 sm:col-span-2"><button disabled={saving} className="rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground disabled:opacity-50">{saving ? "Đang lưu…" : editing ? "Lưu thay đổi" : "Tạo mã"}</button><button type="button" disabled={saving} onClick={() => setFormOpen(false)} className="rounded-xl border border-border px-4">Hủy</button></div>
      </form></div>}
    {selected && <section className="space-y-4 rounded-2xl border border-border bg-card p-5"><div className="flex items-center justify-between"><h2 className="font-bold">Lượt sử dụng {selected.code}</h2><button onClick={() => setSelected(null)} aria-label="Đóng lịch sử"><X size={20} /></button></div>
      {historyError ? <p role="alert" className="text-destructive">{historyError} <button onClick={() => setHistoryVersion(n => n + 1)} className="underline">Thử lại</button></p> : !history ? <p role="status">Đang tải lịch sử…</p> : <>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{["Khách hàng", "Đơn hàng", "Tiền giảm", "Trạng thái lượt", "Thanh toán / giao hàng", "Ngày giữ / chốt"].map(label => <th key={label} className="p-3">{label}</th>)}</tr></thead><tbody>
          {history.items.map(u => <tr key={u.id} className="border-t border-border"><td className="p-3">{u.customer}</td><td className="p-3"><Link className="text-primary underline" href={`/admin/orders/${u.orderId}`}>{u.orderCode}</Link></td><td className="p-3 whitespace-nowrap">{money(u.discountAmount)}</td><td className="p-3 whitespace-nowrap">{usageLabels[u.status]}</td><td className="p-3 text-xs">{u.paymentStatus} / {u.orderStatus}</td><td className="p-3 text-xs">{date(u.reservedAt)}{u.usedAt && <p>Chốt: {date(u.usedAt)}</p>}{u.releasedAt && <p>Trả: {date(u.releasedAt)}</p>}</td></tr>)}
        </tbody></table>{history.items.length === 0 && <p className="p-4 text-muted-foreground">Chưa có khách sử dụng mã.</p>}</div>
        <div className="flex items-center justify-between text-sm"><button disabled={page === 1} onClick={() => setPage(n => n - 1)} className="disabled:opacity-40">Trang trước</button><span>Trang {page} · {history.totalItems} lượt</span><button disabled={page * history.pageSize >= history.totalItems} onClick={() => setPage(n => n + 1)} className="disabled:opacity-40">Trang sau</button></div>
      </>}
    </section>}
  </div>;
}
