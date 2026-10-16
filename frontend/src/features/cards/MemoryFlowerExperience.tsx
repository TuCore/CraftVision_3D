"use client";

/* eslint-disable @next/next/no-img-element -- Personalized images can be data URLs. */
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import type { CardDraft, CardTemplate } from "./catalog";
import "./memory-flower.css";

export default function MemoryFlowerExperience({ draft, embedded = false }: { draft: CardDraft; template: CardTemplate; embedded?: boolean }) {
  const value = useCallback((key: string, fallback = "") => typeof draft.values[key] === "string" ? String(draft.values[key] || fallback) : fallback, [draft.values]);
  const recipient = value("recipient", "Người thương");
  const sender = value("sender", "Một người luôn yêu bạn");
  const message = value("message", "Cảm ơn em vì đã đến bên đời anh và cùng anh đi qua thật nhiều kỷ niệm.");
  const photo = value("photo", "/images/memory-flower/girl.jpeg");
  const photos = useMemo(() => [photo, ...(Array.isArray(draft.values.album) ? draft.values.album.filter((item): item is string => typeof item === "string" && Boolean(item)) : [])], [draft.values.album, photo]);
  const memories = useMemo(() => Array.isArray(draft.values.memories) ? draft.values.memories.flatMap((item) => typeof item === "object" ? Object.values(item).filter(Boolean) : []) : [], [draft.values.memories]);
  const messages = useMemo(() => [value("intro", `Gửi ${recipient} 💖`), ...memories.slice(0, 4), value("closing", "Yêu em — hôm nay, ngày mai và mãi mãi ✨")], [memories, recipient, value]);
  const [started, setStarted] = useState(false);
  const [opened, setOpened] = useState(false);
  const [gallery, setGallery] = useState(false);
  const [paused, setPaused] = useState(false);
  const [music, setMusic] = useState(false);
  const [line, setLine] = useState(0);
  const [typed, setTyped] = useState("");
  const audio = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!started || paused || opened) return;
    setTyped("");
    let index = 0;
    const typing = window.setInterval(() => {
      index += 1;
      setTyped(messages[line].slice(0, index));
      if (index >= messages[line].length) window.clearInterval(typing);
    }, 52);
    const next = window.setTimeout(() => setLine((current) => (current + 1) % messages.length), Math.max(3500, messages[line].length * 52 + 1700));
    return () => { window.clearInterval(typing); window.clearTimeout(next); };
  }, [line, messages, opened, paused, started]);

  const begin = () => {
    setStarted(true);
    if (audio.current) void audio.current.play().then(() => setMusic(true)).catch(() => setMusic(false));
  };
  const closeLetter = () => { setOpened(false); setGallery(true); };
  const toggleMusic = () => { if (!audio.current) return; if (music) { audio.current.pause(); setMusic(false); } else void audio.current.play().then(() => setMusic(true)).catch(() => setMusic(false)); };
  const replay = () => { setStarted(false); setOpened(false); setGallery(false); setPaused(false); setLine(0); setTyped(""); audio.current?.pause(); if (audio.current) audio.current.currentTime = 0; setMusic(false); };

  return <main className={`memory-flower ${started ? "is-started" : ""} ${gallery ? "is-gallery" : ""} ${paused ? "is-paused" : ""}`}>
    <audio ref={audio} src={value("audio", "/audio/memory-flower.mp3")} loop preload="auto" />
    {!started ? <section className="memory-flower-intro" onClick={begin}>
      <h1>Cốc cốc, có quà cho {recipient} đây 💖</h1>
      <button aria-label="Mở món quà"><img src="/images/memory-flower/cute.jpeg" alt="Món quà bất ngờ" /></button>
      <p>Chạm vào ảnh, có điều bất ngờ</p>
    </section> : <>
      <div className="memory-flower-stars" aria-hidden="true" />
      <header><h1>{value("letterTitle", `Gửi ${recipient}`)} 💖</h1><p>{typed}<i /></p></header>
      <button className="memory-bouquet" onClick={() => setOpened(true)} aria-label="Chạm vào bó hoa để nhận lời yêu">
        <img className="memory-card-back" src="/images/memory-flower/card.png" alt="" />
        {Array.from({ length: 9 }, (_, index) => <span key={index} style={{ "--i": index } as CSSProperties}><b /><img src="/images/memory-flower/tulip.png" alt="" /></span>)}
        <img className="memory-wrapper" src="/images/memory-flower/wrapper.png" alt="" />
      </button>
      {!gallery && <p className="memory-flower-hint">Chạm vào hoa để nhận lời yêu ☝</p>}
      {gallery && <div className="memory-flying-images">{Array.from({ length: 16 }, (_, index) => <img key={index} src={photos[index % photos.length]} alt={`Kỷ niệm ${index % photos.length + 1}`} style={{ "--i": index } as CSSProperties} />)}</div>}
      <nav>{!embedded && <Link href="/cards">← Bộ sưu tập</Link>}<button onClick={replay}>↻ Xem lại</button><button onClick={() => setPaused((state) => !state)}>{paused ? "Tiếp tục" : "Tạm dừng"}</button></nav>
      <button className="memory-music" onClick={toggleMusic} aria-label={music ? "Tắt nhạc" : "Bật nhạc"}>{music ? "♫" : "♪"}</button>
    </>}
    {opened && <div className="memory-letter-backdrop" role="presentation" onClick={closeLetter}><article role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}><button onClick={closeLetter} aria-label="Đóng thư">×</button><img src={photo} alt={`Kỷ niệm của ${recipient}`} /><div><h2>{value("letterTitle", `Gửi ${recipient}`)} 💖</h2><p>💘 {message}</p><strong>— {sender}</strong></div></article></div>}
  </main>;
}
