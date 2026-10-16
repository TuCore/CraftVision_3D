"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { QrCode } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cardTemplates } from "./catalog";
import { cardRequest, type ServerCard } from "./server";
import { CardQRShareHub } from "./CardQRShareHub";
import "./cards.css";

interface QRSelection {
  card: ServerCard;
  shareUrl: string;
  title: string;
}

export default function MyCards() {
  const [cards, setCards] = useState<ServerCard[] | null>(null);
  const [error, setError] = useState("");
  const [qrSelection, setQrSelection] = useState<QRSelection | null>(null);
  useEffect(() => { const controller = new AbortController(); cardRequest<ServerCard[]>("", { signal: controller.signal }).then(setCards).catch(e => { if (!controller.signal.aborted) setError(e.message); }); return () => controller.abort(); }, []);
  return <div className="cards-workspace"><header className="cards-top"><Link href="/cards">← Chọn mẫu thiệp</Link><Link href="/auth?redirect=/cards/mine">Đăng nhập / đổi tài khoản</Link></header><h1>Thiệp đã lưu trên server</h1>
    {error ? <p role="alert">{error}</p> : !cards ? <p role="status">Đang tải thiệp…</p> : !cards.length ? <p>Bạn chưa lưu thiệp nào. Chọn một mẫu và nhấn “Lưu lên server”.</p> : <div className="cards-grid">{cards.map(card => { const title = cardTemplates.find(t => t.slug === card.draft.template)?.title || "Thiệp 3D"; return <article className="template-card template-copy" key={card.id}><h2>{title}</h2><p>Gửi {String(card.draft.values.recipient || "người thương")}</p><p>{card.sharePath ? "Đã xuất bản" : "Bản nháp riêng tư"} · {new Date(card.updatedAt).toLocaleString("vi-VN")}</p><Link href={`/cards/${card.draft.template}/edit?card=${card.id}`}>Mở và chỉnh sửa →</Link>{card.sharePath && <div className="editor-tools"><Link href={card.sharePath} target="_blank" rel="noreferrer">Xem bản công khai ↗</Link><button type="button" onClick={() => setQrSelection({ card, title, shareUrl: new URL(card.sharePath!, window.location.origin).href })}><QrCode className="h-4 w-4" aria-hidden="true" /> Mã QR</button></div>}</article>; })}</div>}
    <Dialog open={qrSelection !== null} onOpenChange={open => { if (!open) setQrSelection(null); }}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto border-0 bg-transparent p-0 shadow-none sm:max-w-xl">
        <DialogTitle className="sr-only">Mã QR chia sẻ thiệp</DialogTitle>
        <DialogDescription className="sr-only">Tải, sao chép mã QR hoặc sao chép link công khai của thiệp.</DialogDescription>
        {qrSelection && <CardQRShareHub shareUrl={qrSelection.shareUrl} cardTitle={qrSelection.title} recipientName={String(qrSelection.card.draft.values.recipient || "")} />}
      </DialogContent>
    </Dialog>
  </div>;
}
