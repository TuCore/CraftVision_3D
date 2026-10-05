"use client";
/* eslint-disable @next/next/no-img-element -- Personalized media is loaded from local drafts or authenticated media references. */
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { CardDraft, CardTemplate } from "./catalog";
import "./rose-rain.css";
const Scene = dynamic(() => import("./RoseRainScene"), { ssr: false, loading: () => <p className="rose-rain-fallback">Đang thắp sáng yêu thương…</p> });

export default function RoseRainExperience({ draft, template, embedded = false }: { draft: CardDraft; template: CardTemplate; embedded?: boolean }) {
  const [started, setStarted] = useState(false), [paused, setPaused] = useState(false), [opened, setOpened] = useState(false), [music, setMusic] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null), audio = useRef<HTMLAudioElement>(null), envelope = useRef<HTMLButtonElement>(null);
  const text = (key: string, fallback = "") => typeof draft.values[key] === "string" ? String(draft.values[key]) : fallback;
  const photos = [text("photo"), ...(Array.isArray(draft.values.album) ? draft.values.album.filter((v): v is string => typeof v === "string") : [])].filter(Boolean);
  useEffect(() => { if (opened) dialog.current?.showModal(); }, [opened]);
  const close = () => { dialog.current?.close(); setOpened(false); envelope.current?.focus(); };
  const toggleMusic = () => { if (!audio.current) return; if (music) { audio.current.pause(); setMusic(false); } else void audio.current.play().then(() => setMusic(true)).catch(() => setMusic(false)); };
  const start = () => { setStarted(true); if (audio.current) void audio.current.play().then(() => setMusic(true)).catch(() => setMusic(false)); };
  const replay = () => { close(); setStarted(false); setPaused(false); audio.current?.pause(); if (audio.current) audio.current.currentTime = 0; setMusic(false); };
  return <main className="rose-rain">
    {text("audio") && <audio ref={audio} src={text("audio")} loop preload="none" />}
    {started && <Scene draft={draft} template={template} paused={paused || opened} />}
    <nav className="rose-rain-controls" aria-label="Điều khiển thiệp">{!embedded && <Link href="/cards">← Bộ sưu tập</Link>}{started && <><button onClick={replay}>↻ Xem lại</button><button onClick={() => setPaused(!paused)}>{paused ? "Tiếp tục" : "Tạm dừng"}</button>{text("audio") && <button onClick={toggleMusic}>{music ? "Tắt nhạc" : "Bật nhạc"}</button>}</>}</nav>
    {!started ? <div className="rose-rain-intro"><button className="rose-rain-start" onClick={start} aria-label="Chạm để bắt đầu"><span aria-hidden="true">♥</span><small>Chạm vào trái tim</small></button></div> : <footer className="rose-rain-actions"><p>Kéo nhẹ để xoay không gian yêu thương</p><button ref={envelope} className="rose-rain-envelope" onClick={() => setOpened(true)}><span aria-hidden="true">💌</span>{text("envelopeLabel", "Một lá thư dành riêng cho bạn")}</button></footer>}
    {opened && <dialog ref={dialog} className="rose-rain-letter" onCancel={close} aria-labelledby="rose-letter-title"><button className="rose-letter-close" onClick={close} aria-label="Đóng thư" autoFocus>×</button><p className="rose-letter-to">GỬI {text("recipient").toLocaleUpperCase("vi")}</p><h1 id="rose-letter-title">{text("letterTitle", "Gửi người thương")}</h1><p className="rose-letter-message">{text("message")}</p>{photos.length > 0 && <div className="rose-letter-photos">{photos.map((src, index) => <img key={index} src={src} alt={`Kỷ niệm ${index + 1}`} loading="lazy" />)}</div>}<p>{text("closing")}</p><strong>{text("sender")}</strong><button className="rose-letter-return" onClick={close}>Cất thư và ngắm tiếp ♥</button></dialog>}
  </main>;
}
