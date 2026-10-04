"use client";

/* eslint-disable @next/next/no-img-element -- Local uploaded data URLs and pre-rendered preview assets do not use the image optimizer. */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { fieldsFor, type CardTemplate, type CardDraft } from "./catalog";
import "./cards.css";

const CardScene = dynamic(() => import("./CardScene"), { ssr: false, loading: () => <div className="scene-loading">Đang dựng món quà 3D…</div> });
export default function CardExperience({ template, draft, embedded = false }: { template: CardTemplate; draft: CardDraft; embedded?: boolean }) {
  const [stage, setStage] = useState<"intro" | "play" | "celebrate" | "envelope" | "opening" | "letter">("intro");
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [insideFrame, setInsideFrame] = useState(embedded);
  const dialog = useRef<HTMLDialogElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const letterButton = useRef<HTMLButtonElement>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [holding, setHolding] = useState(false);
  const text = (key: string, fallback = "") => typeof draft.values[key] === "string" ? String(draft.values[key] || fallback) : fallback;
  const fields = fieldsFor(template);
  const detailFields = template.fields.filter(field => !["color", "image", "images"].includes(field.type));
  const lists = detailFields.filter(field => field.type === "list").flatMap(field => {
    const rows = draft.values[field.key]; return Array.isArray(rows) ? rows.filter(row => typeof row === "object").map(row => Object.values(row).filter(Boolean).join(" · ")) : [];
  });
  const photos = [text("photo"), ...(Array.isArray(draft.values.album) ? draft.values.album.filter((value): value is string => typeof value === "string") : [])].filter(Boolean);
  const steps = Math.max(3, Math.min(12, lists.length || (template.model === "cake" || template.model === "star-lantern" ? 5 : 3)));
  const interaction = template.action.startsWith("Giữ") ? "hold" : /^(Kéo|Xoay|Lắc|Gạt|Rót)/.test(template.action) ? "slide" : "tap";
  useEffect(() => {
    if (!holding || stage !== "play") return;
    const timer = setInterval(() => setProgress(value => Math.min(1, value + .025)), 50);
    return () => clearInterval(timer);
  }, [holding, stage]);
  useEffect(() => { if (progress >= 1 && stage === "play") { setHolding(false); setStage("celebrate"); } }, [progress, stage]);
  useEffect(() => { const motion = matchMedia("(prefers-reduced-motion: reduce)"); const update = () => setReduced(motion.matches); update(); motion.addEventListener("change", update); setInsideFrame(embedded || window.self !== window.top); return () => motion.removeEventListener("change", update); }, [embedded]);
  useEffect(() => {
    if (stage === "celebrate") { const timer = setTimeout(() => setStage("envelope"), reduced ? 600 : 2000); return () => clearTimeout(timer); }
    if (stage === "opening") { const timer = setTimeout(() => setStage("letter"), reduced ? 100 : 1000); return () => clearTimeout(timer); }
    if (stage === "letter") dialog.current?.showModal();
  }, [stage, reduced]);
  const interact = useCallback(() => {
    if (stage === "intro") { if (audio.current) { audio.current.volume = .35; void audio.current.play().then(() => setMusicPlaying(true)).catch(() => setMusicPlaying(false)); } setStage("play"); return; }
    if (stage === "envelope") { setStage("opening"); return; }
    if (stage !== "play") return;
    const next = Math.min(1, progress + 1 / steps + .00001); setProgress(next);
    if (next >= 1) setStage("celebrate");
  }, [stage, progress, steps]);
  const closeLetter = () => { dialog.current?.close(); setStage("envelope"); setTimeout(() => letterButton.current?.focus(), 0); };
  const replay = () => { dialog.current?.close(); audio.current?.pause(); if (audio.current) audio.current.currentTime = 0; setMusicPlaying(false); setHolding(false); setProgress(0); setStage("intro"); setPhotoIndex(0); };
  const letterVisible = ["envelope", "opening", "letter"].includes(stage);
  return <main className={`card-experience ${insideFrame ? "card-embedded" : ""}`} style={{ "--card-accent": text("accent", template.color), "--card-bg": template.background } as React.CSSProperties}>
    <CardScene template={template} draft={draft} progress={progress} envelope={letterVisible} opening={stage === "opening" || stage === "letter"} reduced={reduced} onInteract={interact} />
    <nav className="experience-nav" aria-label="Điều khiển thiệp">
      {!insideFrame && <Link href="/cards">← Bộ sưu tập</Link>}
      {text("audio") && <button aria-pressed={musicPlaying} onClick={() => { if (!audio.current) return; if (musicPlaying) { audio.current.pause(); setMusicPlaying(false); } else void audio.current.play().then(() => setMusicPlaying(true)).catch(() => setMusicPlaying(false)); }}>{musicPlaying ? "Tắt nhạc" : "Bật nhạc"}</button>}
      <button onClick={replay}>↻ Xem lại</button>
    </nav>
    {text("audio") && <audio ref={audio} src={text("audio")} loop preload="none" onError={() => setMusicPlaying(false)} />}
    <header className="experience-heading"><p>{template.category}</p><h1>{text("title", template.title)}</h1><span>Gửi {text("recipient")}</span></header>
    <div className="experience-actions">
      {stage === "intro" && <><p>{text("intro")}</p><button className="card-primary" onClick={interact}>Mở trải nghiệm</button></>}
      {stage === "play" && <><p className="interaction-memory" aria-live="polite">{lists[Math.min(lists.length - 1, Math.floor(progress * steps))] || template.action}</p>
        {interaction === "slide" && <input className="interaction-slider" type="range" min={0} max={100} value={Math.round(progress * 100)} aria-label={template.action} onChange={event => setProgress(Number(event.target.value) / 100)} />}
        {interaction === "hold" && <button className="hold-action" onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); setHolding(true); }} onPointerUp={() => setHolding(false)} onPointerCancel={() => setHolding(false)} onLostPointerCapture={() => setHolding(false)} onBlur={() => setHolding(false)} onKeyDown={event => { if (event.key === " " || event.key === "Enter") { event.preventDefault(); setHolding(true); } }} onKeyUp={() => setHolding(false)}>Giữ để thực hiện ✦</button>}
        <button className="card-primary" onClick={interact}>{template.action} · {Math.min(steps, Math.floor(progress * steps) + 1)}/{steps}</button><progress value={progress} max={1} aria-label="Tiến trình tương tác" /><small>{interaction === "tap" ? "Chạm mô hình hoặc nút để tiếp tục" : "Dùng thao tác phía trên hoặc nút để thực hiện từng bước"} · Kéo mô hình để xoay</small></>}
      {stage === "celebrate" && <p role="status" className="reveal-message">{template.reveal} ✨</p>}
      {stage === "envelope" && <><p>{text("envelopeLabel", "Một lá thư dành riêng cho bạn")}</p><button ref={letterButton} className="card-primary" onClick={interact}>Mở phong thư 💌</button></>}
      {stage === "opening" && <p role="status">Đang mở lời yêu thương…</p>}
    </div>
    {stage === "letter" && <dialog ref={dialog} className="personal-letter" aria-labelledby="personal-letter-title" onCancel={closeLetter}>
      <button className="letter-close" aria-label="Đóng thư" onClick={closeLetter} autoFocus>×</button>
      <p className="letter-eyebrow">DÀNH RIÊNG CHO {text("recipient")}</p><h2 id="personal-letter-title">{text("letterTitle", "Gửi bạn thân mến")}</h2>
      {photos.length > 0 && <figure><img src={photos[photoIndex]} alt={`Kỷ niệm ${photoIndex + 1} của ${text("recipient")}`} />{photos.length > 1 && <figcaption><button onClick={() => setPhotoIndex(index => (index + photos.length - 1) % photos.length)}>← Ảnh trước</button><span>{photoIndex + 1}/{photos.length}</span><button onClick={() => setPhotoIndex(index => (index + 1) % photos.length)}>Ảnh sau →</button></figcaption>}</figure>}
      <p className="letter-message">{text("message")}</p>
      {detailFields.some(field => draft.values[field.key] && (typeof draft.values[field.key] === "string" || (draft.values[field.key] as unknown[]).length)) && <section className="letter-details" aria-label="Những điều dành riêng cho bạn">{detailFields.map(field => {
        const value = draft.values[field.key]; if (!value || (Array.isArray(value) && !value.length)) return null;
        return <div key={field.key}><h3>{field.label}</h3>{Array.isArray(value) ? <ul>{value.map((item, i) => <li key={i}>{typeof item === "string" ? item : Object.values(item).filter(Boolean).join(" · ")}</li>)}</ul> : <p>{value}</p>}</div>;
      })}</section>}
      {text("logo") && <div className="letter-logo"><img src={text("logo")} alt="Logo người gửi" /></div>}
      <footer><p>{text("closing")}</p><strong>{text("sender")}</strong></footer>
      <button className="letter-return" onClick={closeLetter}>Cất thư và xem lại</button>
    </dialog>}
    <span className="sr-only">{fields.length} trường cá nhân hóa cho mẫu {template.title}</span>
  </main>;
}
