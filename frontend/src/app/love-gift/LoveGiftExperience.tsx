"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, RotateCcw, X } from "lucide-react";
import { createGiftScene, type GiftScene } from "./gift-scene";
import styles from "./love-gift.module.css";

const photos = [
  "/love-gift-01.jpg",
  "/love-gift-02.jpg",
  "/love-gift-03.jpg",
  "/love-gift-04.jpg",
  "/anh3.jpg",
];
const greetings = ["Gửi Em  ♥", "Người Anh\nYêu Nhất", "Mãi Bên Em  ♥"];
const letter = "💗 Gửi em — người con gái khiến mỗi ngày của anh trở nên đáng nhớ.\n\nCảm ơn em vì đã xuất hiện, đã yêu thương và đồng hành cùng anh. Dù tương lai phía trước có gì, anh chỉ mong được nắm tay em đi tiếp.\n\nMãi yêu em. ♥";
type Phase = "loading" | "intro" | "greetings" | "rose" | "sphere" | "scatter" | "envelope";

export default function LoveGiftExperience() {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<GiftScene | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [progress, setProgress] = useState(0);
  const [opened, setOpened] = useState(false);
  const [hasRead, setHasRead] = useState(false);
  const [typed, setTyped] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    if (!host.current) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motion.matches);
    let disposed = false;
    const instance = createGiftScene(host.current, photos, motion.matches, setProgress, () => setFallback(true));
    scene.current = instance;
    instance.ready.then(() => { if (!disposed) setPhase("intro"); });
    return () => { disposed = true; instance.dispose(); scene.current = null; };
  }, []);

  useEffect(() => {
    scene.current?.setPhase(phase);
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (phase === "greetings") {
      greetings.forEach((text, index) => timers.push(setTimeout(() => scene.current?.greet(text), index * 3400)));
      timers.push(setTimeout(() => setPhase("rose"), greetings.length * 3400));
    }
    if (phase === "rose") timers.push(setTimeout(() => setPhase("sphere"), reducedMotion ? 2400 : 4800));
    if (phase === "sphere") timers.push(setTimeout(() => setPhase("scatter"), reducedMotion ? 1800 : 7200));
    if (phase === "scatter") timers.push(setTimeout(() => setPhase("envelope"), reducedMotion ? 200 : 2800));
    return () => timers.forEach(clearTimeout);
  }, [phase, reducedMotion]);

  useEffect(() => {
    if (!opened) return;
    dialog.current?.showModal();
    if (reducedMotion) return;
    const timer = setInterval(() => setTyped(value => Math.min(letter.length, value + 1)), 32);
    return () => clearInterval(timer);
  }, [opened, reducedMotion]);

  const openLetter = () => { setTyped(0); setOpened(true); };
  const closeLetter = () => { dialog.current?.close(); setOpened(false); setHasRead(true); scene.current?.setPhase("sphere"); };
  const replay = () => { dialog.current?.close(); setOpened(false); setHasRead(false); scene.current?.setPhase("intro"); setPhase("intro"); };

  return (
    <main className={styles.experience}>
      <div ref={host} className={styles.scene} aria-hidden="true" />
      <nav className={styles.controls} aria-label="Điều khiển thiệp">
        <Link href="/" className={styles.control}><ArrowLeft size={14} /> Quay lại</Link>
        {phase !== "loading" && <button className={styles.control} onClick={replay}><RotateCcw size={14} /> Xem lại</button>}
      </nav>
      {phase === "loading" && <div className={styles.center} role="status">
        <h1 className={styles.loadingTitle}>Đang chuẩn bị yêu thương...</h1>
        <span className={styles.hearts}>♥ <small>♥</small></span>
        <p className={styles.eyebrow}>ĐANG CHUẨN BỊ QUÀ TẶNG...</p>
        <progress className={styles.progress} value={progress} max={100} aria-label="Đang tải thiệp" />
        <span className={styles.percent}>{progress}%</span>
      </div>}
      {phase === "intro" && <button className={styles.start} onClick={() => setPhase(reducedMotion ? "rose" : "greetings")}>
        <span>Chạm để bắt đầu</span><span className={styles.startRing}>♡</span>
      </button>}
      {phase === "greetings" && <><span className={styles.srOnly} role="status">Gửi em, người anh yêu nhất. Mãi bên em.</span><button className={styles.skip} onClick={() => setPhase("rose")}>Bỏ qua lời mở đầu →</button></>}
      {phase === "rose" && <p className={styles.hint} role="status">Một bó hồng, dành riêng cho em ♥</p>}
      {phase === "sphere" && <p className={styles.hint}>{fallback ? "Những kỷ niệm của chúng mình" : "Kéo nhẹ để xoay những kỷ niệm"}</p>}
      {phase === "envelope" && !opened && <button className={`${styles.envelopeButton} ${hasRead ? styles.reopen : ""}`} onClick={openLetter}>
        <span className={styles.envelope}><Mail size={76} strokeWidth={1} /><span>♥</span></span>
        <span>Một lá thư dành riêng cho em</span><small>Chạm để mở 💌</small>
      </button>}
      {opened && <dialog ref={dialog} className={styles.letter} onCancel={closeLetter} onClick={event => { if (event.target === event.currentTarget) closeLetter(); }} aria-labelledby="letter-title">
        <button className={styles.close} aria-label="Đóng thư" onClick={closeLetter} autoFocus><X size={15} /></button>
        <h2 id="letter-title">Gửi bé iu 💕</h2>
        <div className={styles.letterContent}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photos[0]} alt="Khoảnh khắc yêu thương của đôi mình" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = "/anh3.jpg"; }} />
          <div className={styles.paper}><p aria-hidden="true">{letter.slice(0, reducedMotion ? letter.length : typed)}<span className={styles.caret}>{typed < letter.length && !reducedMotion ? "│" : ""}</span></p><p className={styles.srOnly}>{letter}</p></div>
        </div>
        <button className={styles.readAll} onClick={() => setTyped(letter.length)}>Đọc trọn lời yêu ♥</button>
      </dialog>}
    </main>
  );
}
