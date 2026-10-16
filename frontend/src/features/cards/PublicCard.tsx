"use client";
import { useEffect, useState } from "react";
import { cardTemplates, type CardDraft } from "./catalog";
import { cardRequest } from "./server";
import { parseDraft } from "./storage";
import CardExperience from "./CardExperience";
import "./cards.css";

export default function PublicCard({ token }: { token: string }) {
  const [draft, setDraft] = useState<CardDraft | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    cardRequest<CardDraft>(`/public/${encodeURIComponent(token)}`, { signal: controller.signal }, false)
      .then(value => { if (!controller.signal.aborted) setDraft(parseDraft(value, true)); })
      .catch(reason => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Không mở được thiệp."); });
    return () => controller.abort();
  }, [token]);
  const template = cardTemplates.find(t => t.slug === draft?.template);
  if (!draft || !template) return <main className="cards-workspace"><h1>{error ? "Chưa thể mở thiệp" : "Đang mở món quà…"}</h1><p role={error ? "alert" : "status"}>{error || "Đang tải lời chúc và mô hình 3D."}</p></main>;
  return <CardExperience template={template} draft={draft} />;
}
