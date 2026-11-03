"use client";

import { useState } from "react";

export default function VoucherInput({ code, onApply, loading, error }: {
  code: string; onApply: (code: string) => void; loading: boolean; error?: string;
}) {
  const [input, setInput] = useState("");
  return <div className="rounded-2xl border border-border bg-background p-4 space-y-3">
    <label htmlFor="checkout-voucher" className="block text-sm font-semibold">Mã giảm giá</label>
    <div className="flex gap-2">
      <input id="checkout-voucher" value={input} maxLength={8} placeholder="Nhập mã 8 ký tự"
        onChange={event => setInput(event.target.value.toUpperCase())}
        onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); onApply(input.trim().toUpperCase()); } }}
        className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm uppercase" />
      <button type="button" disabled={loading || !input.trim()} onClick={() => onApply(input.trim().toUpperCase())}
        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">Áp dụng</button>
    </div>
    {code && <div className="flex items-center justify-between gap-2 text-sm"><span>Đã chọn: <strong>{code}</strong></span>
      <button type="button" onClick={() => { setInput(""); onApply(""); }} className="text-primary underline">Gỡ mã</button></div>}
    <p className="text-xs text-muted-foreground">Mỗi tài khoản dùng mỗi mã một lần. Lượt được chốt khi đơn đã thanh toán và nhận hàng.</p>
    <div aria-live="polite">{loading && <p className="text-sm text-muted-foreground">Đang kiểm tra hóa đơn…</p>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}</div>
  </div>;
}
