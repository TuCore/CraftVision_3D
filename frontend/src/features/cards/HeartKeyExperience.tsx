"use client";

/* eslint-disable @next/next/no-img-element -- Personalized images can be data URLs. */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { CardDraft, CardTemplate } from "./catalog";
import "./rose-rain.css";

const Scene = dynamic(() => import("./HeartKeyScene"), { ssr: false, loading: () => <p className="rose-rain-fallback">Đang chuẩn bị bó hoa…</p> });

export default function HeartKeyExperience({ draft }: { draft: CardDraft; template: CardTemplate; embedded?: boolean }) {
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [opened, setOpened] = useState(false);
  const [gallery, setGallery] = useState(false);
  const [music, setMusic] = useState(false);
  const [typed, setTyped] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const text = useCallback((key: string, fallback = "") => (typeof draft.values[key] === "string" ? String(draft.values[key] || fallback) : fallback).normalize("NFC"), [draft.values]);
  const photo = text("photo");
  const photos = useMemo(() => [photo, ...(Array.isArray(draft.values.album) ? draft.values.album.filter((value): value is string => typeof value === "string" && Boolean(value)) : [])].filter(Boolean), [draft.values.album, photo]);
  const recipient = text("recipient", "người anh yêu");
  const letterTitle = text("letterTitle", `Gửi ${recipient}`);
  const message = text("confession", text("message", "Cảm ơn em vì đã đến bên đời anh."));
  const headline = letterTitle;
  const typingText = gallery ? text("message", "Yêu em — hôm nay, ngày mai và mãi mãi 💕✨") : text("confession", "Cảm ơn em vì đã đến bên đời anh 🌷");

  useEffect(() => {
    if (!started || paused || opened) return;
    setTyped("");
    const chars = Array.from(typingText);
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTyped(chars.slice(0, index).join(""));
      if (index >= chars.length) window.clearInterval(timer);
    }, 55);
    return () => window.clearInterval(timer);
  }, [started, paused, opened, typingText]);

  useEffect(() => {
    if (opened && !dialog.current?.open) dialog.current?.showModal();
  }, [opened]);

  const start = () => {
    setStarted(true);
    if (audio.current) void audio.current.play().then(() => setMusic(true)).catch(() => setMusic(false));
  };
  const openLetter = useCallback(() => {
    if (gallery) return;
    setOpened(true);
    setPaused(true);
  }, [gallery]);
  const closeLetter = () => {
    dialog.current?.close();
    setOpened(false);
    setPaused(false);
    setGallery(true);
  };
  const toggleMusic = () => {
    if (!audio.current) return;
    if (music) {
      audio.current.pause();
      setMusic(false);
    } else void audio.current.play().then(() => setMusic(true)).catch(() => setMusic(false));
  };
  const replay = () => {
    dialog.current?.close();
    setStarted(false);
    setPaused(false);
    setOpened(false);
    setGallery(false);
    setTyped("");
    audio.current?.pause();
    if (audio.current) audio.current.currentTime = 0;
    setMusic(false);
  };

  return <main className="rose-rain heart-key-experience flower-love-experience">
    {text("audio") && <audio ref={audio} src={text("audio")} loop preload="none" onError={() => setMusic(false)} />}

    {!started ? <section className="flower-gift-intro">
      <h1>Cốc cốc, có quà cho em đây 💖</h1>
      <button className="flower-gift-card" onClick={start} aria-label="Mở món quà">
        {photo ? <img src={photo} alt="Món quà dành riêng cho bạn" /> : <span aria-hidden="true">💐</span>}
      </button>
      <p>Chạm vào ảnh, có điều bất ngờ</p>
    </section> : <>
      <Scene paused={paused || opened} gallery={gallery} onBouquet={openLetter} />
      <header className="flower-love-heading">
        <h1>{headline} 💖</h1>
        <p>{typed}<i aria-hidden="true" /></p>
      </header>
      <nav className="rose-rain-controls flower-love-controls" aria-label="Điều khiển thiệp">
        <button onClick={replay}>↻ Xem lại</button>
        <button onClick={() => setPaused((value) => !value)}>{paused ? "Tiếp tục" : "Tạm dừng"}</button>
        {text("audio") && <button onClick={toggleMusic}>{music ? "Tắt nhạc" : "Bật nhạc"}</button>}
      </nav>
      {!gallery && <button className="flower-letter-trigger" onClick={openLetter}>Chạm vào bó hoa để nhận lời yêu ☝</button>}
      {gallery && photos.length > 0 && <section className="flower-photo-gallery" aria-label="Album kỷ niệm">
        {photos.slice(0, 8).map((src, index) => <img key={`${src}-${index}`} src={src} alt={`Kỷ niệm ${index + 1}`} style={{ animationDelay: `${index * 120}ms` }} />)}
      </section>}
    </>}

    {opened && <dialog ref={dialog} className="rose-rain-letter flower-love-letter" onCancel={closeLetter} aria-labelledby="heart-key-letter-title">
      <button className="rose-letter-close" onClick={closeLetter} aria-label="Đóng thư" autoFocus>×</button>
      <div className="flower-love-letter-grid">
        {photo && <img className="flower-love-letter-photo" src={photo} alt="Ảnh kỷ niệm" />}
        <div>
          <h1 id="heart-key-letter-title">{letterTitle} 💖</h1>
          <p className="rose-letter-message">💘 {message}</p>
          {text("eventDate") && <p className="flower-love-date">Ngày kỷ niệm: {text("eventDate")}</p>}
          {text("sender") && <strong>{text("sender")}</strong>}
        </div>
      </div>
    </dialog>}
  </main>;
}
