"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { defaultDraft, type CardTemplate, type CardDraft } from "./catalog";
import { readDraft } from "./storage";
import CardExperience from "./CardExperience";
const CardScene = dynamic(() => import("./CardScene"), { ssr: false });
const noInteraction = () => {};

export default function CardViewer({ template, useDraft, embedded, artwork = false }: { template: CardTemplate; useDraft: boolean; embedded: boolean; artwork?: boolean }) {
  const [draft, setDraft] = useState<CardDraft>(() => defaultDraft(template));
  const [ready, setReady] = useState(!useDraft);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!useDraft) return;
    let cancelled = false;
    readDraft(template.slug).then(saved => { if (cancelled) return; if (saved) setDraft(saved); else setError("Không tìm thấy bản nháp trên thiết bị này. Đang hiển thị nội dung mẫu."); }).catch(() => { if (!cancelled) setError("Không đọc được bản nháp. Đang hiển thị nội dung mẫu."); }).finally(() => { if (!cancelled) setReady(true); });
    return () => { cancelled = true; };
  }, [template.slug, useDraft]);
  if (!ready) return <p className="scene-loading" role="status">Đang tải nội dung thiệp…</p>;
  if (artwork) return <main className="card-experience" aria-label={template.title} style={{ "--card-accent": template.color, "--card-bg": template.background } as React.CSSProperties}><CardScene template={template} draft={draft} progress={1} envelope={false} opening={false} reduced onInteract={noInteraction} /></main>;
  return <>{error && <p className="viewer-notice" role="status">{error}</p>}<CardExperience template={template} draft={draft} embedded={embedded} /></>;
}
