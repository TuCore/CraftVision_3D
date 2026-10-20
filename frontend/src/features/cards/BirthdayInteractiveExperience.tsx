"use client";

/* eslint-disable @next/next/no-img-element -- Personalized images can be data URLs. */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import type { CardDraft, CardTemplate } from "./catalog";
import "./birthday-interactive.css";

const Scene = dynamic(() => import("./BirthdayInteractiveScene"), { ssr: false });
type Stage = "opening" | "intro" | "beats" | "blackout" | "wish" | "heart" | "letter" | "final" | "starlight";

export default function BirthdayInteractiveExperience({ draft }: { template: CardTemplate; draft: CardDraft; embedded?: boolean }) {
  const text = useCallback((key: string, fallback = "") => typeof draft.values[key] === "string" ? String(draft.values[key] || fallback) : fallback, [draft.values]);
  const recipient = text("recipient", "Cậu");
  const sender = text("sender", "Tớ");
  const age = text("age", "20");
  const message = text("message", "Mong cậu ăn ngon, ngủ đủ, bớt lo một chút và luôn nhớ rằng có người ở đây khi cậu cần.");
  const photo = text("photo");
  const photos = useMemo(() => [photo, ...(Array.isArray(draft.values.album) ? draft.values.album.filter((value): value is string => typeof value === "string" && Boolean(value)) : [])].filter(Boolean), [draft.values.album, photo]);
  const wishes = useMemo(() => ["Hạnh phúc hơn", "May mắn hơn", "Khỏe mạnh hơn", "Bình yên hơn"], []);
  const beats = useMemo(() => ["Ngọn nến đã tắt…", `nhưng ${recipient} không đi qua tuổi ${age} một mình đâu.`, `Từ từ thôi nhé, ${recipient}. ${sender} ở đây mà.`], [age, recipient, sender]);
  const [stage, setStage] = useState<Stage>("opening");
  const [hold, setHold] = useState(0);
  const [holding, setHolding] = useState(false);
  const [beat, setBeat] = useState(0);
  const [wish, setWish] = useState<number | null>(null);
  const [typed, setTyped] = useState("");
  const [sent, setSent] = useState(false);
  const [paused, setPaused] = useState(false);
  const [music, setMusic] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const holdFrame = useRef<number | null>(null);
  const holdStarted = useRef(0);

  const transition = useCallback((next: Stage) => {
    if (!panel.current) return setStage(next);
    gsap.to(panel.current, { autoAlpha: 0, y: -18, duration: .35, ease: "power2.in", onComplete: () => setStage(next) });
  }, []);
  useEffect(() => {
    if (!panel.current) return;
    const context = gsap.context(() => gsap.fromTo(panel.current, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .7, ease: "power3.out" }));
    return () => context.revert();
  }, [stage]);
  useEffect(() => { const timer = window.setTimeout(() => transition("intro"), 2200); return () => window.clearTimeout(timer); }, [transition]);
  useEffect(() => {
    if (stage !== "beats" || paused) return;
    if (beat >= beats.length - 1) { const timer = window.setTimeout(() => transition("blackout"), 2800); return () => window.clearTimeout(timer); }
    const timer = window.setTimeout(() => setBeat((value) => value + 1), 2800);
    return () => window.clearTimeout(timer);
  }, [beat, beats.length, paused, stage, transition]);
  useEffect(() => { if (stage !== "blackout" || paused) return; const timer = window.setTimeout(() => transition("wish"), 1800); return () => window.clearTimeout(timer); }, [paused, stage, transition]);
  useEffect(() => {
    if (stage !== "letter") return;
    setTyped("");
    let index = 0;
    const timer = window.setInterval(() => { index += 1; setTyped(message.slice(0, index)); if (index >= message.length) window.clearInterval(timer); }, 24);
    return () => window.clearInterval(timer);
  }, [message, stage]);
  useEffect(() => () => { if (holdFrame.current) cancelAnimationFrame(holdFrame.current); }, []);

  const beginMusic = () => { if (audio.current && !music) void audio.current.play().then(() => setMusic(true)).catch(() => setMusic(false)); };
  const startHold = () => {
    if (stage !== "intro" || hold >= 1 || paused) return;
    beginMusic(); setHolding(true); holdStarted.current = performance.now() - hold * 2600;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - holdStarted.current) / 2600); setHold(progress);
      if (progress >= 1) { setHolding(false); window.setTimeout(() => transition("beats"), 1300); return; }
      holdFrame.current = requestAnimationFrame(tick);
    };
    holdFrame.current = requestAnimationFrame(tick);
  };
  const cancelHold = () => { if (hold >= 1) return; if (holdFrame.current) cancelAnimationFrame(holdFrame.current); holdFrame.current = null; setHolding(false); setHold(0); };
  const chooseWish = (index: number) => { setWish(index); window.setTimeout(() => transition("heart"), 2400); };
  const toggleMusic = () => { if (!audio.current) return; if (music) { audio.current.pause(); setMusic(false); } else void audio.current.play().then(() => setMusic(true)).catch(() => setMusic(false)); };
  const replay = () => { setStage("opening"); setHold(0); setHolding(false); setBeat(0); setWish(null); setTyped(""); setSent(false); setPaused(false); };

  return <main className={`birthday-story birthday-stage-${stage}`} onPointerDown={beginMusic}>
    {text("audio") && <audio ref={audio} src={text("audio")} loop preload="none" />}
    <Scene screen={stage === "intro" ? 2 : stage === "starlight" ? 9 : 0} candleProgress={hold} paused={paused} />
    <div className="birthday-stars" aria-hidden="true" />
    <div ref={panel} className="birthday-story-panel">
      {stage === "opening" && <section className="birthday-opening"><p>HAPPY BIRTHDAY</p><strong>{recipient}</strong><span>{text("eventDate", "Một ngày thật đặc biệt")}</span></section>}
      {stage === "intro" && <section className="birthday-intro-copy"><p>Có một món quà nhỏ dành cho {recipient}…</p><span>Nhưng trước khi mở, thổi nến trước nhé 🎂</span><button className="birthday-candle-hit" onPointerDown={startHold} onPointerUp={cancelHold} onPointerLeave={cancelHold} onPointerCancel={cancelHold} aria-label="Nhấn và giữ để thổi nến" /><small>{holding ? "giữ nữa… giữ tiếp…" : hold >= 1 ? "Ngọn nến đã tắt ✨" : "👆 Nhấn & giữ ngọn nến cho đến khi tắt"}</small></section>}
      {stage === "beats" && <section className="birthday-beat" key={beat}>{beats[beat]}</section>}
      {stage === "blackout" && <section className="birthday-blackout">đang thu gom những kỷ niệm…</section>}
      {stage === "wish" && <section className="birthday-wish"><p>MỘT ĐIỀU ƯỚC</p><h1>Bây giờ… chọn một điều ước cho ngày sinh nhật của {recipient}.</h1><div>{wishes.map((item, index) => <button key={item} disabled={wish !== null} className={wish === index ? "selected" : wish !== null ? "faded" : ""} onClick={() => chooseWish(index)}><i>🎁</i><span>{item}</span></button>)}</div>{wish !== null && <small>Điều ước đã được nhận. Mong nó từ từ thành hiện thực.</small>}</section>}
      {stage === "heart" && <section className="birthday-heart"><div className="birthday-heart-photos">{photos.length ? Array.from({ length: Math.min(12, Math.max(6, photos.length * 2)) }, (_, index) => <img key={index} src={photos[index % photos.length]} alt="" />) : <span>♥</span>}</div><p>Tất cả những kỷ niệm nhỏ này là dành cho {recipient}.</p><h1>Chúc Mừng Sinh Nhật, {recipient}.</h1><small>Hôm nay {recipient} nhất định phải được ăn mừng.</small><button onClick={() => transition("letter")}>Có một lá thư dành cho {recipient} →</button></section>}
      {stage === "letter" && <section className="birthday-letter"><p>LÁ THƯ NHỎ</p><article>{photo && <img src={photo} alt={`Kỷ niệm của ${recipient}`} />}<div><h1>Gửi {recipient},</h1><p>{typed}<i /></p><strong>— {sender}</strong></div></article><button disabled={typed.length < message.length} onClick={() => transition("final")}>Vẫn còn nữa →</button></section>}
      {stage === "final" && <section className="birthday-final"><article><p>DÀNH CHO {recipient.toLocaleUpperCase("vi")}</p><h1>Chúc Mừng Sinh Nhật, {recipient}</h1><strong>từ {sender}</strong><hr /><span>Mong điều ước “{wish === null ? "Bình yên" : wishes[wish]}” thật sự tìm được đường đến với {recipient} trong tuổi {age}.</span></article><button onClick={() => transition("starlight")}>Gửi điều ước lên trời ✨</button><button className="secondary" onClick={replay}>Bắt đầu lại từ đầu</button></section>}
      {stage === "starlight" && <section className={`birthday-starlight ${sent ? "sent" : ""}`}><p>GỬI LÊN TRỜI</p><h1>Biến điều ước thành sao băng</h1><button onClick={() => setSent(true)} disabled={sent}><i>✦</i><span>“{wish === null ? "Điều ước của cậu" : wishes[wish]}”</span></button>{sent ? <div><h2>Điều ước đã được gửi đi ✨</h2><p>Từ đêm nay, sẽ luôn có một ngôi sao giữ lời ước ấy giúp {recipient}.</p></div> : <small>Chạm vào ngôi sao để gửi điều ước lên trời đêm.</small>}<button className="secondary" onClick={() => transition("final")}>Quay lại thiệp</button><button className="secondary" onClick={replay}>Bắt đầu lại từ đầu</button></section>}
    </div>
    {stage !== "opening" && <div className="birthday-floating-controls"><button onClick={() => setPaused((value) => !value)}>{paused ? "▶" : "Ⅱ"}</button>{text("audio") && <button onClick={toggleMusic}>{music ? "♫" : "♪"}</button>}</div>}
  </main>;
}
