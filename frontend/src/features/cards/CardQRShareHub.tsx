"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Download, ExternalLink, Link as LinkIcon, QrCode } from "lucide-react";
import { toCanvas } from "qrcode";
import { toast } from "sonner";

interface CardQRShareHubProps {
  shareUrl: string;
  cardTitle: string;
  recipientName?: string;
}

const QR_SIZE = 1024;

function sanitizeFilename(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "thiep-3d";
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Không thể tạo ảnh PNG.")), "image/png");
  });
}

async function copyText(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Clipboard không khả dụng.");
}

export function CardQRShareHub({ shareUrl, cardTitle, recipientName }: CardQRShareHubProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resetTimerRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);
  const [qrError, setQrError] = useState("");
  const [copiedQr, setCopiedQr] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !shareUrl) return;
    let cancelled = false;
    setReady(false);
    setQrError("");

    void toCanvas(canvas, shareUrl, {
      errorCorrectionLevel: "H",
      width: QR_SIZE,
      margin: 4,
      color: { dark: "#211241", light: "#ffffff" },
    }).then(() => {
      canvas.style.width = "100%";
      canvas.style.height = "auto";
      if (!cancelled) setReady(true);
    }).catch(() => {
      if (!cancelled) setQrError("Không thể tạo mã QR cho liên kết này.");
    });

    return () => { cancelled = true; };
  }, [shareUrl]);

  useEffect(() => () => {
    if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current);
  }, []);

  const showCopiedState = (setter: (value: boolean) => void) => {
    setter(true);
    if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current);
    resetTimerRef.current = window.setTimeout(() => setter(false), 2_500);
  };

  const downloadQr = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;
    try {
      const blob = await canvasToPngBlob(canvas);
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `craftvision-${sanitizeFilename(cardTitle)}-qr.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000);
      toast.success("Đã lưu mã QR dạng PNG.");
    } catch {
      toast.error("Không thể lưu mã QR. Vui lòng thử lại.");
    }
  };

  const copyQr = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;
    try {
      const blob = await canvasToPngBlob(canvas);
      if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") throw new Error("Binary clipboard unavailable");
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      showCopiedState(setCopiedQr);
      toast.success("Đã copy ảnh mã QR.");
    } catch {
      try {
        await copyText(shareUrl);
        showCopiedState(setCopiedQr);
        toast.info("Trình duyệt không hỗ trợ copy ảnh; link thiệp đã được copy thay thế.");
      } catch {
        inputRef.current?.focus();
        inputRef.current?.select();
        toast.error("Không thể truy cập clipboard. Link đã được chọn để bạn sao chép.");
      }
    }
  };

  const copyLink = async () => {
    try {
      await copyText(shareUrl);
      showCopiedState(setCopiedLink);
      toast.success("Đã copy link thiệp.");
    } catch {
      inputRef.current?.focus();
      inputRef.current?.select();
      toast.error("Không thể truy cập clipboard. Link đã được chọn để bạn sao chép.");
    }
  };

  return (
    <section className="w-full rounded-[1.75rem] border border-violet-300/25 bg-gradient-to-br from-[#211241] via-[#170b2c] to-[#0f071d] p-4 text-white shadow-[0_24px_80px_rgba(31,17,62,.3)] sm:p-6" aria-label="Mã QR và link chia sẻ thiệp">
      <header className="mb-4 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-300/15 text-violet-100"><QrCode className="h-6 w-6" aria-hidden="true" /></div>
        <h2 className="mt-3 font-serif text-xl font-bold">Chia sẻ thiệp 3D</h2>
        <p className="mt-1 text-xs text-violet-100/70">{recipientName ? `Dành tặng ${recipientName}` : cardTitle}</p>
      </header>

      <div className="mx-auto w-full max-w-[19rem] rounded-[1.75rem] bg-white p-4 shadow-[0_12px_45px_rgba(0,0,0,.28)]">
        <canvas ref={canvasRef} className={`h-auto w-full rounded-xl transition-opacity ${ready ? "opacity-100" : "opacity-20"}`} aria-label={`Mã QR mở ${cardTitle}`} />
        {!ready && !qrError && <p className="py-3 text-center text-xs font-semibold text-violet-950">Đang tạo mã QR…</p>}
        {qrError && <p className="py-3 text-center text-xs font-semibold text-red-700" role="alert">{qrError}</p>}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button type="button" disabled={!ready} onClick={() => void downloadQr()} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#211241] transition hover:bg-violet-50 disabled:cursor-wait disabled:opacity-50"><Download className="h-4 w-4" aria-hidden="true" /> Lưu mã QR</button>
        <button type="button" disabled={!ready} onClick={() => void copyQr()} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/20 disabled:cursor-wait disabled:opacity-50">{copiedQr ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />} {copiedQr ? "Đã copy" : "Copy mã QR"}</button>
      </div>

      <div className="mt-4 rounded-2xl border border-white/15 bg-black/15 p-3">
        <label htmlFor="card-public-share-url" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-violet-100"><LinkIcon className="h-3.5 w-3.5" /> Link công khai</label>
        <input ref={inputRef} id="card-public-share-url" value={shareUrl} readOnly onFocus={event => event.currentTarget.select()} onClick={event => event.currentTarget.select()} className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs text-white outline-none focus:border-violet-300" />
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => void copyLink()} className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-violet-400/20 px-3 text-xs font-bold text-violet-50 transition hover:bg-violet-400/30">{copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />} {copiedLink ? "Đã copy" : "Copy link"}</button>
          <a href={shareUrl} target="_blank" rel="noreferrer" className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-white/15 px-3 text-xs font-bold text-white transition hover:bg-white/10">Mở thiệp <ExternalLink className="h-3.5 w-3.5" /></a>
        </div>
      </div>
    </section>
  );
}
