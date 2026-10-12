"use client";

/* eslint-disable @next/next/no-img-element -- Personalized images can be local data URLs. */
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { CardDraft, CardTemplate } from "./catalog";
import "./rose-rain.css";

const Scene = dynamic(() => import("./HeartKeyScene"), { ssr: false, loading: () => <p className="rose-rain-fallback">Đang mở cánh cửa trái tim…</p> });

export default function HeartKeyExperience({ draft, template, embedded = false }: { draft: CardDraft; template: CardTemplate; embedded?: boolean }) {
  const [started, setStarted] = useState(false), [paused, setPaused] = useState(false), [opened, setOpened] = useState(false), [music, setMusic] = useState(false), [unlocked, setUnlocked] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null), audio = useRef<HTMLAudioElement>(null), envelope = useRef<HTMLButtonElement>(null);
  const text = (key: string, fallback = "") => typeof draft.values[key] === "string" ? String(draft.values[key] || fallback) : fallback;
  const photos = [text("photo"), ...(Array.isArray(draft.values.album) ? draft.values.album.filter((value): value is string => typeof value === "string") : [])].filter(Boolean);
  const openLetter = useCallback(() => { setOpened(true); setPaused(true); }, []);

  useEffect(() => { if (opened) dialog.current?.showModal(); }, [opened]);
  const close = () => { dialog.current?.close(); setOpened(false); setPaused(false); envelope.current?.focus(); };
  const toggleMusic = () => { if (!audio.current) return; if (music) { audio.current.pause(); setMusic(false); } else void audio.current.play().then(() => setMusic(true)).catch(() => setMusic(false)); };
  const start = () => { setStarted(true); if (audio.current) void audio.current.play().then(() => setMusic(true)).catch(() => setMusic(false)); };
  const replay = () => { dialog.current?.close(); setOpened(false); setStarted(false); setPaused(false); setUnlocked(false); audio.current?.pause(); if (audio.current) audio.current.currentTime = 0; setMusic(false); };
  const handleUnlocked = useCallback(() => { setUnlocked(true); window.setTimeout(openLetter, 700); }, [openLetter]);

  return <main className="rose-rain">
    {text("audio") && <audio ref={audio} src={text("audio")} loop preload="none" onError={() => setMusic(false)} />}
    {started && <Scene draft={draft} template={template} paused={paused || opened} onUnlocked={handleUnlocked} />}
    <nav className="rose-rain-controls" aria-label="Điều khiển thiệp">
      {!embedded && <Link href="/cards">← Bộ sưu tập</Link>}
      {started && <><button onClick={replay}>↻ Xem lại</button><button onClick={() => setPaused(value => !value)}>{paused ? "Tiếp tục" : "Tạm dừng"}</button>{text("audio") && <button onClick={toggleMusic}>{music ? "Tắt nhạc" : "Bật nhạc"}</button>}</>}
    </nav>
    {!started ? <div className="rose-rain-intro"><button className="rose-rain-start" onClick={start} aria-label="Bắt đầu mở khóa trái tim"><span aria-hidden="true">🔑</span><small>Trao chìa khóa</small></button></div> : <footer className="rose-rain-actions"><p>{unlocked ? "Trái tim đã mở ♥" : "Kéo ngang để xoay chìa khóa mở trái tim"}</p><button ref={envelope} className="rose-rain-envelope" onClick={openLetter}><span aria-hidden="true">💌</span>{text("envelopeLabel", "Mở lá thư tình yêu")}</button></footer>}
    {opened && <dialog ref={dialog} className="rose-rain-letter" onCancel={close} aria-labelledby="heart-key-letter-title">
      <button className="rose-letter-close" onClick={close} aria-label="Đóng thư" autoFocus>×</button>
      <p className="rose-letter-to">GỬI {text("recipient", "NGƯỜI THƯƠNG").toLocaleUpperCase("vi")}</p>
      <h1 id="heart-key-letter-title">{text("letterTitle", "Trao chìa khóa, mở cửa trái tim")}</h1>
      <p className="rose-letter-message">{text("confession", text("message"))}</p>
      {text("confession") && text("message") && text("confession") !== text("message") && <p className="rose-letter-message">{text("message")}</p>}
      {photos.length > 0 && <div className="rose-letter-photos">{photos.map((src, index) => <img key={`${src}-${index}`} src={src} alt={`Kỷ niệm ${index + 1}`} loading="lazy" />)}</div>}
      {text("eventDate") && <p><strong>Ngày kỷ niệm:</strong> {new Intl.DateTimeFormat("vi-VN", { dateStyle: "long", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(`${text("eventDate")}T00:00:00+07:00`))}</p>}
      <p>{text("closing")}</p><strong>{text("sender")}</strong>
      <button className="rose-letter-return" onClick={close}>Cất thư và ngắm tiếp ♥</button>
    </dialog>}
  </main>;
}
