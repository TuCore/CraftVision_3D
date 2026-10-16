"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cardTemplates } from "./catalog";
import { cardRequest, type ServerCard } from "./server";
import "./cards.css";
export default function MyCards() {
  const [cards, setCards] = useState<ServerCard[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { const controller = new AbortController(); cardRequest<ServerCard[]>("", { signal: controller.signal }).then(setCards).catch(e => { if (!controller.signal.aborted) setError(e.message); }); return () => controller.abort(); }, []);
  return <div className="cards-workspace"><header className="cards-top"><Link href="/cards">← Chọn mẫu thiệp</Link><Link href="/auth?redirect=/cards/mine">Đăng nhập / đổi tài khoản</Link></header><h1>Thiệp đã lưu trên server</h1>
    {error ? <p role="alert">{error}</p> : !cards ? <p role="status">Đang tải thiệp…</p> : !cards.length ? <p>Bạn chưa lưu thiệp nào. Chọn một mẫu và nhấn “Lưu lên server”.</p> : <div className="cards-grid">{cards.map(card => <article className="template-card template-copy" key={card.id}><h2>{cardTemplates.find(t => t.slug === card.draft.template)?.title || "Thiệp 3D"}</h2><p>Gửi {String(card.draft.values.recipient || "người thương")}</p><p>{card.sharePath ? "Đã xuất bản" : "Bản nháp riêng tư"} · {new Date(card.updatedAt).toLocaleString("vi-VN")}</p><Link href={`/cards/${card.draft.template}/edit?card=${card.id}`}>Mở và chỉnh sửa →</Link>{card.sharePath && <p><Link href={card.sharePath} target="_blank" rel="noreferrer">Xem bản công khai ↗</Link></p>}</article>)}</div>}
  </div>;
}
