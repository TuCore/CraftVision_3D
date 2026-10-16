"use client";

/* eslint-disable @next/next/no-img-element -- Local uploaded data URLs and pre-rendered preview assets do not use the image optimizer. */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { fieldsFor, type CardTemplate, type CardDraft } from "./catalog";
import "./cards.css";

const CardScene = dynamic(() => import("./CardScene"), { ssr: false, loading: () => <div className="scene-loading">Đang dựng món quà 3D…</div> });
const RoseRainExperience = dynamic(() => import("./RoseRainExperience"), { ssr: false });
const HeartKeyExperience = dynamic(() => import("./HeartKeyExperience"), { ssr: false });
const BirthdayInteractiveExperience = dynamic(() => import("./BirthdayInteractiveExperience"), { ssr: false });
const MemoryFlowerExperience = dynamic(() => import("./MemoryFlowerExperience"), { ssr: false });
export default function CardExperience(props: { template: CardTemplate; draft: CardDraft; embedded?: boolean }) {
  if (props.template.slug === "rose-love") return <RoseRainExperience {...props} />;
  if (props.template.slug === "heart-key") return <HeartKeyExperience {...props} />;
  if (props.template.slug === "birthday-wish") return <BirthdayInteractiveExperience {...props} />;
  if (props.template.slug === "memory-train") return <MemoryFlowerExperience {...props} />;
  if (props.template.slug === "secret-ring") return <SecretRingExperience {...props} />;
  return <StandardCardExperience {...props} />;
}

function SecretRingExperience({ template, draft, embedded = false }: { template: CardTemplate; draft: CardDraft; embedded?: boolean }) {
  const referenceBase = "https://graden-flowers--flowers-2d5e3.asia-southeast1.hosted.app";
  const referenceMedia = `${referenceBase}/music`;
  const flowerHeads = ["bloom-pale-pink-lily-head-lg-01.webp", "bloom-white-hibiscus-head-lg-01.webp", "bloom-pink-daisy-head-md-01.webp", "bloom-soft-pink-zinnia-head-md-02.webp", "bloom-peach-cosmos-head-md-02.webp", "bloom-pink-clematis-head-md-01.webp", "bloom-cream-daisy-head-md-02.webp", "bloom-pale-pink-lily-head-lg-02.webp", "bloom-cream-daisy-head-md-03.webp"];
  const bouquetLayout = [
    { x: 50, y: 52, scale: 1.18, z: 30 }, { x: 38, y: 48, scale: 1.08, z: 28 },
    { x: 62, y: 47, scale: 1.08, z: 27 }, { x: 27, y: 40, scale: 1, z: 21 },
    { x: 48, y: 34, scale: 1.02, z: 22 }, { x: 72, y: 38, scale: 1, z: 20 },
    { x: 18, y: 27, scale: .88, z: 11 }, { x: 35, y: 20, scale: .9, z: 13 },
    { x: 54, y: 17, scale: .9, z: 12 }, { x: 76, y: 23, scale: .87, z: 10 },
    { x: 10, y: 43, scale: .86, z: 9 }, { x: 88, y: 42, scale: .86, z: 8 },
  ];
  const [stage, setStage] = useState<"INTRO" | "FLOWER_EXPLOSION" | "THEME_TRANSITION" | "BOUQUET_ASSEMBLY" | "BOUQUET_FINAL" | "ENVELOPE_LETTER" | "OUTRO">("INTRO");
  const [wishIndex, setWishIndex] = useState(0);
  const [typedMessage, setTypedMessage] = useState("");
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [letterOpen, setLetterOpen] = useState(false);
  const [flyingWish, setFlyingWish] = useState(false);
  const particleCanvas = useRef<HTMLCanvasElement>(null);
  const introAudio = useRef<HTMLAudioElement>(null);
  const loopAudio = useRef<HTMLAudioElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervals = useRef<ReturnType<typeof setInterval>[]>([]);
  const text = useCallback((key: string, fallback = "") => {
    const value = typeof draft.values[key] === "string" ? String(draft.values[key] || fallback) : fallback;
    return value.normalize("NFC").replace(/â[`´’]u/gi, "ầu").replace(/ế[`´’]n/gi, "ến");
  }, [draft.values]);
  const accent = text("accent", template.color);
  const detailColor = text("detailColor", accent);
  const photos = [text("photo"), ...(Array.isArray(draft.values.album) ? draft.values.album.filter((value): value is string => typeof value === "string" && Boolean(value)) : [])].filter(Boolean);
  const displayPhotos = photos.length ? photos : Array.from({ length: 6 }, (_, index) => `${referenceBase}/gift/photos/p${String(index + 1).padStart(2, "0")}.jpg`);
  const wishes = text("message", text("proposal", "Giữa cả một rừng hoa, em vẫn là đóa đẹp nhất.")).split(/(?<=[.!?])\s+/).filter(Boolean);
  const bouquetWishes = Array.from({ length: 4 }, (_, index) => wishes[index % wishes.length]);
  const clearAsync = useCallback(() => {
    timers.current.forEach(clearTimeout); timers.current = [];
    intervals.current.forEach(clearInterval); intervals.current = [];
  }, []);
  const fadeToLoop = useCallback(() => {
    const intro = introAudio.current, loop = loopAudio.current;
    if (!loop) return;
    loop.volume = 0; void loop.play().then(() => {
      setMusicPlaying(true);
      const fade = setInterval(() => {
        loop.volume = Math.min(.32, loop.volume + .025);
        if (intro) intro.volume = Math.max(0, intro.volume - .035);
        if (loop.volume >= .32) { clearInterval(fade); intervals.current = intervals.current.filter(item => item !== fade); intro?.pause(); }
      }, 80);
      intervals.current.push(fade);
    }).catch(() => setMusicPlaying(false));
  }, []);
  const start = () => {
    const audio = introAudio.current;
    if (audio) { audio.volume = .38; audio.currentTime = 0; void audio.play().then(() => setMusicPlaying(true)).catch(() => setMusicPlaying(false)); }
    setStage("FLOWER_EXPLOSION"); fadeToLoop();
  };
  const replay = () => {
    clearAsync();
    for (const audio of [introAudio.current, loopAudio.current]) { audio?.pause(); if (audio) { audio.currentTime = 0; audio.volume = audio === introAudio.current ? .38 : 0; } }
    setMusicPlaying(false); setTypedMessage(""); setWishIndex(0); setLetterOpen(false); setFlyingWish(false); setStage("INTRO");
  };
  const addWish = () => {
    if (flyingWish) return;
    setFlyingWish(true);
    timers.current.push(setTimeout(() => {
      setFlyingWish(false);
      if (wishIndex < 3) setWishIndex(index => index + 1);
      else setStage("BOUQUET_FINAL");
    }, 900));
  };
  useEffect(() => {
    if (stage === "FLOWER_EXPLOSION") timers.current.push(setTimeout(() => setStage("THEME_TRANSITION"), 15000));
    if (stage === "THEME_TRANSITION") timers.current.push(setTimeout(() => setStage("BOUQUET_ASSEMBLY"), 1800));
    if (stage === "BOUQUET_FINAL") timers.current.push(setTimeout(() => setStage("ENVELOPE_LETTER"), 5500));
    if (stage === "ENVELOPE_LETTER" && letterOpen) {
      const message = text("message", text("proposal", "Anh muốn cùng em viết tiếp câu chuyện của chúng ta. Em đồng ý nhé?"));
      setTypedMessage(""); let index = 0;
      const typing = setInterval(() => { index += 1; setTypedMessage(message.slice(0, index)); if (index >= message.length) { clearInterval(typing); intervals.current = intervals.current.filter(item => item !== typing); } }, 34);
      intervals.current.push(typing);
    }
    return () => { timers.current.forEach(clearTimeout); timers.current = []; };
  }, [letterOpen, stage, text]);
  useEffect(() => {
    const canvas = particleCanvas.current;
    if (!canvas || !["INTRO", "FLOWER_EXPLOSION"].includes(stage)) return;
    const context = canvas.getContext("2d"); if (!context) return;
    let frame = 0;
    const particles = Array.from({ length: 44 }, (_, index) => ({ x: Math.random(), y: Math.random(), size: 1 + index % 3, speed: .00012 + index % 5 * .000025, phase: index * .73 }));
    const resize = () => { canvas.width = innerWidth * Math.min(devicePixelRatio, 2); canvas.height = innerHeight * Math.min(devicePixelRatio, 2); };
    const draw = (time: number) => { context.clearRect(0, 0, canvas.width, canvas.height); for (const particle of particles) { particle.y -= particle.speed; if (particle.y < -.03) particle.y = 1.03; const x = (particle.x + Math.sin(time * .00045 + particle.phase) * .018) * canvas.width; const y = particle.y * canvas.height; context.beginPath(); context.arc(x, y, particle.size * devicePixelRatio, 0, Math.PI * 2); context.fillStyle = `rgba(255,209,220,${.28 + Math.sin(time * .001 + particle.phase) * .16})`; context.shadowColor = "#ffd1dc"; context.shadowBlur = 8; context.fill(); } frame = requestAnimationFrame(draw); };
    resize(); addEventListener("resize", resize); frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); removeEventListener("resize", resize); context.clearRect(0, 0, canvas.width, canvas.height); };
  }, [stage]);
  useEffect(() => () => {
    clearAsync();
    for (const audio of [introAudio.current, loopAudio.current]) { audio?.pause(); if (audio) audio.src = ""; }
  }, [clearAsync]);
  const toggleAudio = () => {
    const active = stage === "INTRO" ? introAudio.current : loopAudio.current;
    if (!active) return;
    if (musicPlaying) { active.pause(); setMusicPlaying(false); }
    else void active.play().then(() => setMusicPlaying(true)).catch(() => setMusicPlaying(false));
  };
  const lightStage = ["THEME_TRANSITION", "BOUQUET_ASSEMBLY", "BOUQUET_FINAL", "ENVELOPE_LETTER", "OUTRO"].includes(stage);
  return <main className={`secret-ring ${lightStage ? "light-theme" : "dark-theme"} ${embedded ? "is-embedded" : ""}`} style={{ "--ring-accent": accent, "--ring-detail": detailColor, "--envelope-color": text("envelopeColor", "#d0b49f") } as React.CSSProperties}>
    <audio ref={introAudio} src={text("audio", `${referenceMedia}/intro.m4a`)} preload="auto" />
    <audio ref={loopAudio} src={`${referenceMedia}/loop.m4a`} preload="auto" loop />
    <canvas ref={particleCanvas} className="particle-canvas" aria-hidden="true" />
    <div className="ring-ambient" aria-hidden="true" />
    <div className="ring-sparkles" aria-hidden="true">{Array.from({ length: 22 }, (_, index) => <i key={index} style={{ "--i": index } as React.CSSProperties} />)}</div>
    {!embedded && <Link className="ring-back" href="/cards">← Bộ sưu tập</Link>}
    <button className="ring-sound" onClick={toggleAudio} aria-label={musicPlaying ? "Tắt nhạc" : "Bật nhạc"}>{musicPlaying ? "♫" : "♩"}</button>
    {stage === "INTRO" && <section className="ring-panel ring-intro">
      <span className="ring-kicker">{text("title", "Một món quà bí mật")}</span>
      <h1>{text("intro", "Gửi em, người phụ nữ của anh")}</h1>
      <p>{text("recipient", "Người phụ nữ của anh")}</p>
      <button className="ring-primary" onClick={start}>Chạm để mở quà 🎁</button>
    </section>}
    {stage === "FLOWER_EXPLOSION" && <section className="ring-panel ring-bloom flower-explosion">
      <div className="flower-wall" aria-label="Rừng hoa đang nở">
        {Array.from({ length: 30 }, (_, index) => <figure className="wall-flower" key={index} style={{ "--left": `${(index * 37 + 5) % 104}%`, "--top": `${(index * 53 + 4) % 105}%`, "--size": `${100 + index % 5 * 24}px`, "--rotate": `${(index % 7 - 3) * 8}deg`, "--delay": `${index * .055}s` } as React.CSSProperties}>
          <img src={`${referenceBase}/growing-garden/pink/${flowerHeads[index % flowerHeads.length]}`} alt="" />
        </figure>)}
      </div>
      <div className="hero-memory">
        <div className="hero-date">{text("date", "20 · 10")}</div>
        <figure className="hero-flower"><img className="hero-petals" src={`${referenceBase}/growing-garden/pink/bloom-soft-pink-zinnia-head-md-02.webp`} alt="" />
          <img className="hero-photo" src={displayPhotos[0]} alt="Kỷ niệm nổi bật" /></figure>
        <blockquote>{text("proposal", "Giữa cả một rừng hoa, em vẫn là đóa đẹp nhất")}</blockquote>
      </div>
      <div className="flower-burst" aria-hidden="true">{Array.from({ length: 38 }, (_, index) => <i key={index} style={{ "--i": index } as React.CSSProperties}>✿</i>)}</div>
      <button className="scene-skip" onClick={() => setStage("THEME_TRANSITION")}>Tiếp tục</button>
    </section>}
    {stage === "THEME_TRANSITION" && <section className="ring-panel theme-morph">
      <figure><img src={`${referenceBase}/growing-garden/pink/bloom-soft-pink-zinnia-head-md-02.webp`} alt="Hoa kỷ niệm" /><img src={displayPhotos[0]} alt="Kỷ niệm đầu tiên" /></figure>
    </section>}
    {stage === "BOUQUET_ASSEMBLY" && <section className="ring-panel ring-bloom" onClick={addWish}>
      <div className="wish-gallery">
        <img className="wish-foliage" src={`${referenceBase}/gift/flowers/foliage-wide.webp`} alt="" />
        <div className="assembly-wrapper" aria-hidden="true"><i className="wrapper-left" /><i className="wrapper-right" /></div>
        <article className={`wish-polaroid ${flyingWish ? "is-flying" : ""}`} key={wishIndex} style={{ "--tilt": `${wishIndex % 2 ? 3 : -3}deg` } as React.CSSProperties}>
          <img src={displayPhotos[wishIndex % displayPhotos.length]} alt={`Kỷ niệm ${wishIndex + 1}`} />
          <small>LỜI CHÚC THỨ {wishIndex + 1}</small><p>{bouquetWishes[wishIndex]}</p>
        </article>
        <div className="assembled-preview">
          <img className="assembly-leaves leaves-left" src={`${referenceBase}/gift/flowers/foliage-upright.webp`} alt="" /><img className="assembly-leaves leaves-right" src={`${referenceBase}/gift/flowers/foliage-upright.webp`} alt="" />
          <div className="short-stems" aria-hidden="true">{bouquetLayout.slice(0, wishIndex).map((flower, index) => <i key={index} style={{ "--stem-angle": `${(flower.x - 50) * .58}deg` } as React.CSSProperties} />)}</div>
          {bouquetLayout.slice(0, wishIndex).map((flower, index) => <figure key={index} style={{ "--x": `${flower.x}%`, "--y": `${flower.y}%`, "--scale": flower.scale, "--depth": flower.z } as React.CSSProperties}><img src={`${referenceBase}/growing-garden/pink/${flowerHeads[index]}`} alt="" /><img src={displayPhotos[index % displayPhotos.length]} alt="" /></figure>)}
        </div>
        <div className="wish-dots" aria-label={`Lời chúc ${wishIndex + 1} trên 4`}>{Array.from({ length: 4 }, (_, index) => <i className={index === wishIndex ? "active" : ""} key={index} />)}</div>
      </div>
      <p className="bloom-hint">Chạm vào thiệp để thêm bông hoa</p>
    </section>}
    {stage === "BOUQUET_FINAL" && <section className="ring-panel ring-bloom" onClick={() => setStage("ENVELOPE_LETTER")}>
      <div className="memory-bouquet">
        <div className="foliage-fan" aria-hidden="true"><img className="foliage foliage-top-left" src={`${referenceBase}/gift/flowers/foliage-upright.webp`} alt="" /><img className="foliage foliage-top-right" src={`${referenceBase}/gift/flowers/foliage-upright.webp`} alt="" /><img className="foliage foliage-side-left" src={`${referenceBase}/gift/flowers/foliage-wide.webp`} alt="" /><img className="foliage foliage-side-right" src={`${referenceBase}/gift/flowers/foliage-wide.webp`} alt="" /></div>
        <div className="bouquet-flowers">
          <div className="short-stems" aria-hidden="true">{bouquetLayout.slice(0, 7).map((flower, index) => <i key={index} style={{ "--stem-angle": `${(flower.x - 50) * .58}deg` } as React.CSSProperties} />)}</div>
          {bouquetLayout.map((flower, index) => <figure key={index} style={{ "--x": `${flower.x}%`, "--y": `${flower.y}%`, "--scale": flower.scale, "--depth": flower.z, "--delay": `${index * .08}s` } as React.CSSProperties}>
          <img className="bouquet-bloom" src={`${referenceBase}/growing-garden/pink/${flowerHeads[index % flowerHeads.length]}`} alt="" />
          <img className="bouquet-photo" src={displayPhotos[index % displayPhotos.length]} alt={`Kỷ niệm ${index % displayPhotos.length + 1}`} />
        </figure>)}</div>
        <div className="stem-tail" aria-hidden="true"><i /><i /><i /><i /><i /></div>
        <div className="bouquet-wrap"><span className="kraft-inner" /></div>
        <span className="bouquet-bow"><i /><b /></span><em className="bouquet-tag">Gửi {text("recipient", "em")}, {text("date", "20.10")}</em>
        <blockquote>Hoa ngoài tiệm sẽ héo. Bó này, anh giữ cho em mãi.</blockquote>
      </div>
      <div className="falling-petals" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <i key={index} style={{ "--i": index } as React.CSSProperties}>❀</i>)}</div>
    </section>}
    {stage === "ENVELOPE_LETTER" && <section className={`ring-panel envelope-scene ${letterOpen ? "is-open" : ""}`}>
      <div className="vintage-envelope"><span className="vintage-back" /><span className="vintage-sheet"><small>DÀNH RIÊNG CHO {text("recipient", "EM")}</small><h2>{text("letterTitle", "Gửi người thương")}</h2><p>{typedMessage}<i>|</i></p><footer>Thương em,<strong>{text("sender", "Anh")} ❤️</strong></footer>{letterOpen && typedMessage.length > 20 && <button onClick={() => setStage("OUTRO")}>Tiếp tục ❤️</button>}</span><span className="vintage-front" /><span className="vintage-flap" /><span className="wax-seal">♥</span></div>
      {!letterOpen && <button className="open-letter" onClick={() => setLetterOpen(true)}>Mở thư ✉️</button>}
    </section>}
    {stage === "OUTRO" && <section className="ring-panel outro-scene">
      <figure><img src={displayPhotos[0]} alt={`Ảnh của ${text("recipient", "người thương")}`} /></figure><span className="outro-tulip">🌷</span>
      <h2>Chúc mừng {text("date", "20/10")}, {text("recipient", "em yêu")}</h2><p>Hoa ngoài kia sẽ héo. Còn em, anh sẽ tưới mỗi ngày.</p><strong>— {text("sender", "Anh")}</strong><button className="ring-primary" onClick={replay}>Xem lại 🔄</button>
    </section>}
    <style jsx>{`
      .secret-ring{--ring-accent:#f56b91;position:relative;display:grid;min-height:100svh;overflow:hidden;place-items:center;color:#fff;background:linear-gradient(180deg,#3a1e27 0%,#2c1520 52%,#1e0e16 100%);isolation:isolate}.secret-ring.is-embedded{min-height:100%;height:100%}.ring-ambient{position:absolute;inset:-20%;z-index:-2;background:radial-gradient(circle at 50% 38%,color-mix(in srgb,var(--ring-accent) 28%,transparent),transparent 42%)}.ring-sparkles{position:absolute;inset:0;z-index:-1}.ring-sparkles i{--x:calc((var(--i) * 43) % 97);position:absolute;left:calc(var(--x)*1%);top:calc(((var(--i)*67)%91)*1%);width:3px;height:3px;border-radius:999px;background:#fff;box-shadow:0 0 8px rgba(255,230,220,.9);animation:sparkle calc(2.2s + (var(--i)%4)*.55s) ease-in-out infinite;animation-delay:calc(var(--i)*-.17s)}.ring-back,.ring-sound{position:absolute;z-index:5;top:1rem;color:#fff}.ring-back{left:1rem;text-decoration:none}.ring-sound{right:1rem;width:42px;height:42px;border:1px solid #ffffff3d;border-radius:50%;background:#ffffff12;font-size:1.25rem}.ring-panel{width:min(92vw,760px);text-align:center;animation:stage-in .75s ease both}.ring-kicker{font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;color:#f8dfe5}.ring-intro h1{max-width:650px;margin:.8rem auto;font-family:Georgia,serif;font-size:clamp(2.15rem,7vw,4.8rem);font-weight:500;line-height:1.08;text-wrap:balance}.ring-intro p{font-family:Georgia,serif;font-size:1.2rem;color:#f3d7de}.ring-primary{margin-top:2rem;padding:1rem 1.65rem;border:1px solid #ffffff42;border-radius:999px;color:#fff;background:linear-gradient(135deg,var(--ring-accent),color-mix(in srgb,var(--ring-accent) 58%,#6c2742));box-shadow:0 0 30px color-mix(in srgb,var(--ring-accent) 42%,transparent);font-weight:700;animation:pulse 2s ease-in-out infinite}.ring-envelope-stage p,.ring-bloom>p{margin-top:1.2rem;color:#f3d7de}.ring-envelope{position:relative;width:min(76vw,390px);height:260px;border:0;background:transparent;filter:drop-shadow(0 24px 28px #12070b99);perspective:900px}.ring-envelope span{position:absolute;inset:0}.envelope-back{border-radius:8px;background:var(--envelope-color)}.envelope-letter{inset:28px 22px 18px!important;padding:2.2rem 1rem;background:#fff9ef;color:#6b3945;font-family:Georgia,serif;box-shadow:0 2px 8px #0002;transform:translateY(-22px);animation:letter-peek 2s ease-in-out infinite}.envelope-front{clip-path:polygon(0 0,50% 58%,100% 0,100% 100%,0 100%);border-radius:8px;background:color-mix(in srgb,var(--envelope-color) 88%,#8e5063)}.envelope-flap{height:54%!important;clip-path:polygon(0 0,100% 0,50% 100%);background:color-mix(in srgb,var(--envelope-color) 92%,#fff);transform-origin:top}.envelope-seal{inset:103px auto auto calc(50% - 25px)!important;display:grid;width:50px;height:50px;place-items:center;border-radius:50%;color:#fff;background:var(--ring-accent);box-shadow:0 4px 10px #0004}.ring-bloom{cursor:pointer}.flower-garden{position:relative;height:min(72vh,610px);min-height:440px;overflow:hidden;border-radius:44% 44% 8% 8%/18% 18% 5% 5%;background:radial-gradient(ellipse at 50% 85%,color-mix(in srgb,var(--ring-detail) 20%,transparent),transparent 55%)}.memory-flower{position:absolute;left:var(--left);top:var(--top);z-index:2;width:var(--size);height:var(--size);margin:0;transform:translate(-50%,-50%) rotate(var(--rotate));filter:drop-shadow(0 12px 13px #10070a88);animation:flower-grow 1.35s var(--delay) cubic-bezier(.2,.8,.2,1.25) both,flower-sway 4s calc(1.5s + var(--delay)) ease-in-out infinite alternate;transform-origin:50% 100%}.flower-art{position:absolute;inset:0;z-index:2;width:100%;height:100%;object-fit:contain}.flower-memory{position:absolute;left:50%;top:48%;z-index:3;width:42%;height:42%;border:3px solid #fff8;clip-path:circle(50%);object-fit:cover;transform:translate(-50%,-50%);filter:saturate(.9) contrast(1.03);box-shadow:0 0 18px #fff9}.flower-stem{position:absolute;left:50%;top:56%;z-index:0;width:8px;height:220px;border-radius:99px;background:linear-gradient(90deg,#355d3a,#76a66a 48%,#274c31);transform:translateX(-50%);transform-origin:top;box-shadow:0 8px 18px #0d1d12aa}.flower-stem:after{content:"";position:absolute;left:-30px;top:58px;width:42px;height:22px;border-radius:100% 0 100% 0;background:#5e8b58;transform:rotate(-25deg)}.garden-glow{position:absolute;left:10%;right:10%;bottom:-16%;height:45%;border-radius:50%;background:radial-gradient(ellipse,var(--ring-detail),transparent 68%);opacity:.18;filter:blur(24px)}.bloom-petals{position:absolute;inset:0;pointer-events:none}.bloom-petals i{--angle:calc(var(--i)*40deg);position:absolute;left:50%;top:50%;color:var(--ring-detail);font-size:1.3rem;animation:bloom-out 2.8s calc(var(--i)*.12s) ease-out both}.ring-letter{max-height:92svh;overflow:auto;padding:1.5rem}.ring-letter article{margin:auto;padding:clamp(1.5rem,5vw,3.5rem);border-radius:8px;background:linear-gradient(135deg,#fffdf5,#f4e6d2);box-shadow:0 28px 80px #0d0508aa;color:#4a2731;text-align:left}.letter-for{font-size:.68rem;letter-spacing:.18em;color:#9a6976}.ring-letter h2{margin:.5rem 0 1.4rem;font-family:Georgia,serif;font-size:clamp(2rem,6vw,3.8rem);font-weight:500;color:#692f40}.ring-photos{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:.6rem;margin-bottom:1.4rem}.ring-photos img{width:100%;height:150px;object-fit:cover;border:5px solid #fff;box-shadow:0 5px 15px #3a1e2722}.typed-message{min-height:6rem;white-space:pre-wrap;font-family:Georgia,serif;font-size:1.08rem;line-height:1.85}.typed-message span{animation:blink .8s step-end infinite}.ring-letter footer{display:grid;justify-content:end;margin-top:1.4rem;text-align:right}.ring-letter footer strong{margin-top:.25rem;font-family:Georgia,serif;font-size:1.3rem;color:var(--ring-accent)}.letter-buttons{display:flex;flex-wrap:wrap;justify-content:center;gap:.7rem;margin-top:2rem}.letter-buttons button{padding:.7rem 1rem;border:1px solid #986b76;border-radius:999px;background:transparent;color:#5d3540}.letter-buttons button:last-child{border-color:var(--ring-accent);color:#fff;background:var(--ring-accent)}@keyframes stage-in{from{opacity:0;transform:translateY(18px) scale(.98)}}@keyframes pulse{50%{transform:scale(1.04);box-shadow:0 0 48px color-mix(in srgb,var(--ring-accent) 65%,transparent)}}@keyframes sparkle{50%{opacity:.2;transform:scale(.35)}}@keyframes letter-peek{50%{transform:translateY(-38px)}}@keyframes flower-grow{from{opacity:0;transform:translate(-50%,55%) rotate(var(--rotate)) scale(.08)}to{opacity:1;transform:translate(-50%,-50%) rotate(var(--rotate)) scale(1)}}@keyframes flower-sway{from{margin-left:-5px}to{margin-left:5px}}@keyframes bloom-out{from{opacity:0;transform:translate(-50%,-50%) scale(0)}to{opacity:0;transform:translate(calc(-50% + cos(var(--angle))*180px),calc(-50% + sin(var(--angle))*180px)) scale(1.4)}}@keyframes blink{50%{opacity:0}}@media(max-width:560px){.flower-garden{height:70svh}.memory-flower{width:calc(var(--size)*.72);height:calc(var(--size)*.72)}.flower-stem{height:180px}}@media (prefers-reduced-motion:reduce){.secret-ring *{animation-duration:.01ms!important;animation-iteration-count:1!important}}
      .ring-bloom{position:absolute;inset:0;width:100%;height:100%;max-width:none;overflow:hidden}.bloom-hint{position:absolute;z-index:30;bottom:1rem;left:50%;margin:0!important;transform:translateX(-50%);font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;opacity:.68}.flower-wall{position:absolute;inset:0;background:radial-gradient(circle at 50% 48%,#613744,#281017 76%)}.wall-flower{position:absolute;left:var(--left);top:var(--top);width:var(--size);height:var(--size);margin:0;transform:translate(-50%,-50%) rotate(var(--rotate));animation:wall-bloom 1.5s var(--delay) cubic-bezier(.22,.9,.3,1.15) both}.wall-flower span{position:absolute;z-index:-1;left:50%;top:50%;width:4px;height:420px;background:#74836a;transform-origin:top;transform:rotate(calc(var(--rotate)*-1));opacity:.6}.wall-flower img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 8px 8px #14090c66)}.hero-memory{position:absolute;inset:0;display:grid;place-items:center;background:radial-gradient(circle,#77465255,#281017 73%);animation:scene-reveal .8s ease both}.hero-date{position:absolute;top:12%;font-family:Georgia,serif;font-size:clamp(3rem,8vw,6rem);font-style:italic;color:#ffe6d6cc}.hero-flower{position:relative;width:min(43vw,390px);aspect-ratio:1;margin:0;animation:hero-open 1.5s cubic-bezier(.2,.85,.25,1.2) both}.hero-petals{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 22px 28px #15080daa)}.hero-photo{position:absolute;left:50%;top:50%;width:48%;height:48%;border-radius:50%;object-fit:cover;transform:translate(-50%,-50%);mask-image:radial-gradient(circle,#000 57%,transparent 72%)}.hero-memory blockquote{position:absolute;bottom:13%;margin:0;padding:0 1rem;font-family:Georgia,serif;font-size:clamp(1.4rem,4vw,2.8rem);font-style:italic;text-shadow:0 4px 18px #1c090d}.wish-gallery,.memory-bouquet{position:absolute;inset:0;background:radial-gradient(circle at 50% 45%,#fffaf4,#ffead8);color:#613b45;animation:scene-reveal .65s ease both}.wish-foliage,.bouquet-foliage{position:absolute;left:50%;top:50%;width:min(58vw,690px);height:min(72vh,620px);object-fit:contain;opacity:.34;transform:translate(-50%,-50%)}.wish-polaroid{--tilt:-3deg;position:absolute;left:50%;top:49%;width:min(78vw,320px);margin:0;padding:14px 14px 22px;background:#fffdf8;box-shadow:0 25px 60px #5d34464d;transform:translate(-50%,-50%) rotate(var(--tilt));animation:polaroid-in .65s cubic-bezier(.2,.85,.25,1.15) both}.wish-polaroid>img{width:100%;height:min(43vh,330px);object-fit:cover}.wish-polaroid small{display:block;margin-top:.8rem;letter-spacing:.18em;color:#b67c8b}.wish-polaroid p{margin:.45rem 0 0;font-family:Georgia,serif;font-size:1.12rem;font-style:italic;line-height:1.35}.wish-dots{position:absolute;bottom:1.6rem;left:50%;display:flex;gap:6px;transform:translateX(-50%)}.wish-dots i{width:5px;height:5px;border-radius:50%;background:#d9b7be}.wish-dots i:nth-child(3){width:18px;border-radius:6px;background:#ae536b}.memory-bouquet{display:grid;place-items:center}.bouquet-foliage{width:min(70vw,760px);height:min(78vh,690px);opacity:.8}.bouquet-flowers{position:absolute;top:5%;left:50%;width:min(66vw,600px);height:min(57vh,490px);transform:translateX(-50%)}.bouquet-flowers figure{position:absolute;left:var(--x);top:var(--y);width:clamp(100px,12vw,170px);aspect-ratio:1;margin:0;animation:bouquet-pop .8s var(--delay) cubic-bezier(.2,.85,.25,1.15) both}.bouquet-bloom{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 7px 7px #4d283844)}.bouquet-photo{position:absolute;left:50%;top:50%;width:43%;height:43%;border-radius:50%;object-fit:cover;transform:translate(-50%,-50%);mask-image:radial-gradient(circle,#000 55%,transparent 72%)}.bouquet-wrap{position:absolute;left:50%;bottom:8%;width:min(52vw,470px);height:47%;clip-path:polygon(4% 0,50% 26%,96% 0,72% 100%,28% 100%);background:linear-gradient(105deg,#dfb98b,#f4d2aa 48%,#d1a875);transform:translateX(-50%);box-shadow:0 20px 50px #8d5a4b55}.bouquet-wrap:after{content:"";position:absolute;inset:5% 8% 8%;clip-path:inherit;background:#efc8ca}.bouquet-wrap em{position:absolute;z-index:2;right:2%;bottom:2%;padding:.45rem .8rem;background:#fffaf1;box-shadow:0 5px 14px #70404b33;font-family:Georgia,serif;color:#9a4a60;transform:rotate(8deg)}.bouquet-bow{position:absolute;z-index:3;left:50%;bottom:3%;display:grid;width:72px;height:38px;place-items:center;border-radius:50%;background:#a8294d;color:#ffd5df;transform:translateX(-50%)}.falling-petals{position:absolute;inset:0;z-index:25;pointer-events:none}.falling-petals i{position:absolute;left:calc(((var(--i)*41)%97)*1%);top:-10%;color:#f5b2bf;font-style:normal;opacity:.7;animation:petal-fall calc(5s + (var(--i)%4)*1s) calc(var(--i)*-.43s) linear infinite}@keyframes wall-bloom{from{opacity:0;transform:translate(-50%,-50%) rotate(var(--rotate)) scale(.08)}to{opacity:1;transform:translate(-50%,-50%) rotate(var(--rotate)) scale(1)}}@keyframes scene-reveal{from{opacity:0;filter:blur(10px)}}@keyframes hero-open{from{opacity:0;transform:scale(.12) rotate(-18deg)}to{opacity:1;transform:scale(1)}}@keyframes polaroid-in{from{opacity:0;transform:translate(-50%,20%) rotate(12deg) scale(.7)}}@keyframes bouquet-pop{from{opacity:0;transform:translateY(80px) scale(.15)}}@keyframes petal-fall{to{top:110%;transform:translateX(90px) rotate(420deg)}}@media(max-width:600px){.hero-flower{width:min(78vw,360px)}.hero-date{top:10%}.hero-memory blockquote{bottom:10%}.bouquet-flowers{width:94vw}.bouquet-wrap{width:82vw}.bouquet-flowers figure{width:28vw}.wish-polaroid>img{height:42vh}}
      .secret-ring{transition:background 1.8s ease,color 1.8s ease}.secret-ring.dark-theme{background:radial-gradient(circle,#2a0d18 0%,#1a050f 100%)}.secret-ring.light-theme{color:#3e2723;background:#fbf3eb}.particle-canvas{position:absolute;inset:0;z-index:-1;width:100%;height:100%;pointer-events:none}.flower-explosion .flower-wall{z-index:1}.flower-explosion .hero-memory{z-index:3;background:radial-gradient(circle at 50% 50%,#8d57625c,transparent 43%);pointer-events:none}.flower-explosion .hero-flower{width:min(37vw,360px)}.flower-explosion .wall-flower{animation-duration:1.15s}.flower-burst{position:absolute;inset:0;z-index:4;pointer-events:none}.flower-burst i{--a:calc(var(--i)*9.47deg);position:absolute;left:50%;top:50%;color:#ffd1dc;font-style:normal;animation:flower-explode 2.8s calc(var(--i)*.025s) cubic-bezier(.15,.75,.2,1) both}.scene-skip{position:absolute;right:1rem;bottom:1rem;z-index:35;padding:.55rem .9rem;border:1px solid #fff5;border-radius:999px;background:#ffffff14;color:#fff}.theme-morph{position:absolute;inset:0;width:100%;max-width:none}.theme-morph figure{position:absolute;left:50%;top:50%;width:min(70vw,360px);aspect-ratio:1;margin:0;transform:translate(-50%,-50%);animation:morph-flower 1.8s ease-in-out both}.theme-morph figure img:first-child{width:100%;height:100%;object-fit:contain}.theme-morph figure img:last-child{position:absolute;left:50%;top:50%;width:45%;height:45%;border-radius:50%;object-fit:cover;transform:translate(-50%,-50%)}.assembled-preview{position:absolute;left:50%;top:50%;width:min(78vw,650px);height:min(70vh,600px);transform:translate(-50%,-50%);pointer-events:none}.assembled-preview figure{--n:0;position:absolute;left:calc(18% + var(--n)*19%);top:calc(22% + (var(--n)%2)*18%);width:120px;aspect-ratio:1;margin:0;animation:bouquet-pop .7s ease both}.assembled-preview figure img:first-child{width:100%;height:100%;object-fit:contain}.assembled-preview figure img:last-child{position:absolute;left:50%;top:50%;width:42%;height:42%;border-radius:50%;object-fit:cover;transform:translate(-50%,-50%)}.wish-dots i.active{width:18px;border-radius:6px;background:#ae536b}.memory-bouquet blockquote{position:absolute;left:50%;bottom:2%;z-index:5;width:min(90vw,720px);margin:0;font-family:Georgia,serif;font-size:clamp(1.15rem,3vw,2rem);font-style:italic;transform:translateX(-50%);animation:stage-in 1s 1.5s both}.envelope-scene{position:absolute;inset:0;width:100%;max-width:none;display:grid;place-items:center;perspective:1200px}.vintage-envelope{position:relative;width:min(82vw,520px);height:320px;transform-style:preserve-3d}.vintage-envelope>span{position:absolute;inset:0}.vintage-back{border-radius:8px;background:#d0b49f;box-shadow:0 30px 70px #744b3b44}.vintage-front{z-index:4;clip-path:polygon(0 0,50% 58%,100% 0,100% 100%,0 100%);background:#c6a58d}.vintage-flap{z-index:5;height:56%;clip-path:polygon(0 0,100% 0,50% 100%);background:#dec7b4;transform-origin:top;transition:transform 1s cubic-bezier(.2,.7,.2,1)}.wax-seal{z-index:6;inset:126px auto auto calc(50% - 28px)!important;display:grid;width:56px;height:56px;place-items:center;border-radius:50%;background:#7a1c29;color:#e5c158;box-shadow:inset 0 0 0 5px #ffffff1c,0 7px 14px #50202d66;transition:.45s}.vintage-sheet{z-index:2;box-sizing:border-box;padding:2.2rem clamp(1.2rem,5vw,3rem);overflow:auto;background:#fffdf7;text-align:left;box-shadow:0 20px 55px #744b3b44;transform:translateY(0) scaleY(.45);transform-origin:top;transition:transform 1.1s .55s ease}.vintage-sheet small{letter-spacing:.16em;color:#9d6875}.vintage-sheet h2{margin:.5rem 0 1rem;font-family:Georgia,serif;font-size:2rem;color:#6a1b29}.vintage-sheet p{white-space:pre-wrap;font-family:Georgia,serif;font-size:1rem;line-height:1.7}.vintage-sheet i{animation:blink .8s step-end infinite}.vintage-sheet footer{display:grid;justify-content:end;text-align:right;font-family:Georgia,serif;font-style:italic}.vintage-sheet footer strong{color:#7a1c29}.vintage-sheet button,.open-letter{padding:.75rem 1.15rem;border:0;border-radius:999px;background:#7a1c29;color:#fff}.vintage-sheet button{display:block;margin:1rem auto 0}.open-letter{position:absolute;bottom:10%;z-index:10}.envelope-scene.is-open .vintage-flap{transform:rotateX(180deg)}.envelope-scene.is-open .wax-seal{opacity:0;transform:scale(.5)}.envelope-scene.is-open .vintage-sheet{z-index:7;transform:translateY(-42%) scaleY(1)}.outro-scene{color:#6a1b29}.outro-scene figure{width:min(65vw,330px);aspect-ratio:4/5;margin:0 auto 1.2rem;padding:10px;border:3px solid #d0b49f;border-radius:50%;background:#fff;box-shadow:0 20px 50px #76504a44;animation:hero-open 1s ease both}.outro-scene figure img{width:100%;height:100%;border-radius:50%;object-fit:cover}.outro-scene h2{margin:.4rem 0;font-family:Georgia,serif;font-size:clamp(2rem,6vw,4rem);font-style:italic}.outro-scene p{margin:.7rem 0;font-family:Georgia,serif;font-size:1.15rem}.outro-tulip{position:absolute;right:12%;top:22%;font-size:clamp(3rem,8vw,6rem);animation:flower-sway 3s ease-in-out infinite alternate}@keyframes flower-explode{from{opacity:1;transform:translate(-50%,-50%) scale(.2)}to{opacity:0;transform:translate(calc(-50% + cos(var(--a))*55vw),calc(-50% + sin(var(--a))*55vh)) rotate(560deg) scale(1.2)}}@keyframes morph-flower{0%{transform:translate(-50%,-50%) scale(1)}100%{transform:translate(-50%,14vh) scale(.15)}}@media(max-width:600px){.flower-explosion .hero-flower{width:72vw}.flower-explosion .hero-date{top:8%}.flower-explosion .hero-memory blockquote{bottom:8%;font-size:1.3rem}.vintage-envelope{height:260px}.envelope-scene.is-open .vintage-sheet{height:72vh;transform:translateY(-55%) scaleY(1)}.assembled-preview figure{width:86px}}
      .secret-ring,.secret-ring button{font-family:"Segoe UI",Arial,sans-serif}.ring-intro h1,.hero-date,.hero-memory blockquote,.wish-polaroid p,.memory-bouquet blockquote,.vintage-sheet h2,.vintage-sheet p,.vintage-sheet footer,.outro-scene h2,.outro-scene p{font-family:"Times New Roman","Segoe UI",serif}.wall-flower span{display:none}.wall-flower{will-change:transform,opacity}.assembly-wrapper{position:absolute;z-index:1;left:50%;bottom:-2%;width:min(54vw,480px);height:56%;transform:translateX(-50%);perspective:900px}.assembly-wrapper:before{content:"";position:absolute;inset:0;clip-path:polygon(50% 0,100% 28%,72% 100%,28% 100%,0 28%);background:#efc8ca;box-shadow:0 22px 45px #7c51442b}.assembly-wrapper i{position:absolute;inset:0;background:#d7b18b;transform-style:preserve-3d}.wrapper-left{clip-path:polygon(0 26%,50% 47%,50% 100%,28% 100%);transform-origin:50% 70%;transform:rotateY(-32deg)}.wrapper-right{clip-path:polygon(100% 26%,50% 47%,50% 100%,72% 100%);transform-origin:50% 70%;transform:rotateY(32deg)}.wish-polaroid{z-index:8;cursor:pointer;will-change:transform,opacity}.wish-polaroid.is-flying{pointer-events:none;animation:wish-flight .9s cubic-bezier(.34,.1,.2,1) forwards}.assembled-preview{z-index:4}.wish-foliage{z-index:2}.memory-bouquet .bouquet-wrap{transform-origin:50% 100%;animation:wrapper-fold 1.2s .75s cubic-bezier(.2,.75,.2,1) both}.memory-bouquet .bouquet-bow{animation:ribbon-pop .8s 1.75s cubic-bezier(.15,1.35,.3,1) both}.memory-bouquet .bouquet-wrap em{transform-origin:10% 0;animation:tag-drop 1s 2.15s ease both}.memory-bouquet blockquote{animation:stage-in 1s 2.7s both}.vintage-sheet{font-family:"Segoe UI",Arial,sans-serif}.vintage-sheet h2,.vintage-sheet p{font-synthesis:none}.outro-scene h2{font-synthesis:none}@keyframes wish-flight{0%{opacity:1;transform:translate(-50%,-50%) rotate(var(--tilt)) scale(1)}42%{opacity:1;transform:translate(calc(-50% - 22vw),calc(-50% - 26vh)) rotate(-16deg) scale(.72)}78%{opacity:.72;transform:translate(calc(-50% + 13vw),calc(-50% - 33vh)) rotate(12deg) scale(.28)}100%{opacity:0;transform:translate(calc(-50% + 7vw),calc(-50% - 28vh)) rotate(0) scale(.08)}}@keyframes wrapper-fold{0%{opacity:.75;transform:translateX(-50%) scaleX(1.3) rotateX(8deg)}55%{transform:translateX(-50%) scaleX(.88) rotateX(0)}100%{opacity:1;transform:translateX(-50%) scaleX(1)}}@keyframes ribbon-pop{from{opacity:0;transform:translateX(-50%) scale(.05) rotate(-25deg)}to{opacity:1;transform:translateX(-50%) scale(1) rotate(0)}}@keyframes tag-drop{from{opacity:0;transform:translateY(-35px) rotate(-16deg)}60%{transform:translateY(5px) rotate(12deg)}to{opacity:1;transform:translateY(0) rotate(8deg)}}
      .assembled-preview,.bouquet-flowers{isolation:isolate}.assembled-preview figure,.bouquet-flowers figure{position:absolute;left:var(--x);top:var(--y);z-index:var(--depth);width:clamp(105px,13vw,178px);aspect-ratio:1;margin:0;transform:translate(-50%,-50%) scale(var(--scale));transform-origin:center;filter:drop-shadow(0 8px 12px rgba(0,0,0,.15));animation:bouquet-pop .8s var(--delay,0s) cubic-bezier(.2,.85,.25,1.15) both}.assembled-preview figure img:first-of-type,.bouquet-flowers figure .bouquet-bloom{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}.assembled-preview figure img:last-of-type,.bouquet-flowers figure .bouquet-photo{position:absolute;left:50%;top:50%;z-index:2;width:42%;height:42%;border-radius:50%;object-fit:cover;transform:translate(-50%,-50%);mask-image:radial-gradient(circle,#000 56%,transparent 73%)}.bouquet-stems{position:absolute;inset:0;z-index:5;width:100%;height:100%;overflow:visible;pointer-events:none}.bouquet-stems path{fill:none;stroke:#66895e;stroke-width:.72;stroke-linecap:round;vector-effect:non-scaling-stroke;filter:drop-shadow(0 2px 1px #29442a33)}.assembly-wrapper{z-index:3;width:min(68vw,620px);height:54%}.assembly-wrapper:before{clip-path:polygon(4% 12%,50% 41%,96% 12%,72% 100%,28% 100%)}.wrapper-left{clip-path:polygon(3% 12%,50% 43%,50% 100%,27% 100%)}.wrapper-right{clip-path:polygon(97% 12%,50% 43%,50% 100%,73% 100%)}.assembled-preview{z-index:4;width:min(72vw,680px);height:min(67vh,570px)}.assembly-leaves{position:absolute;z-index:1;top:2%;width:55%;height:74%;object-fit:contain;opacity:.75;filter:drop-shadow(0 6px 8px #38543c22)}.leaves-left{left:-5%;transform:rotate(-28deg)}.leaves-right{right:-5%;transform:scaleX(-1) rotate(-28deg)}.foliage-fan{position:absolute;z-index:1;left:50%;top:3%;width:min(78vw,760px);height:min(64vh,560px);transform:translateX(-50%);pointer-events:none}.foliage{position:absolute;object-fit:contain;opacity:.86;filter:drop-shadow(0 6px 8px #38543c22)}.foliage-top-left{left:10%;top:-8%;width:44%;height:80%;transform:rotate(-28deg)}.foliage-top-right{right:10%;top:-8%;width:44%;height:80%;transform:scaleX(-1) rotate(-28deg)}.foliage-side-left{left:-8%;top:22%;width:52%;height:58%;transform:rotate(-18deg)}.foliage-side-right{right:-8%;top:22%;width:52%;height:58%;transform:scaleX(-1) rotate(-18deg)}.bouquet-flowers{z-index:4;top:1%;width:min(72vw,690px);height:min(63vh,560px)}.memory-bouquet .bouquet-wrap{z-index:6;bottom:5%;width:min(68vw,620px);height:49%;clip-path:polygon(3% 4%,50% 38%,97% 4%,72% 100%,28% 100%)}.memory-bouquet .bouquet-wrap:after{inset:4% 7% 7%;clip-path:polygon(2% 3%,50% 39%,98% 3%,72% 100%,28% 100%)}@media(max-width:600px){.assembled-preview,.bouquet-flowers{width:98vw}.assembled-preview figure,.bouquet-flowers figure{width:27vw}.assembly-wrapper,.memory-bouquet .bouquet-wrap{width:94vw}.foliage-fan{width:110vw}.bouquet-flowers{height:55vh}.memory-bouquet .bouquet-wrap{height:44%}}
      .bouquet-stems{display:none}.short-stems{position:absolute;inset:0;z-index:5;pointer-events:none}.short-stems i{position:absolute;left:var(--stem-x);top:54%;width:7px;height:15%;border-radius:99px;background:linear-gradient(90deg,#54754e,#86a878 48%,#476c47);transform:translateX(-50%) rotate(var(--stem-angle));transform-origin:top;box-shadow:0 2px 3px #29452f22}.bouquet-flowers{top:5%;height:min(58vh,520px)}.foliage-fan{top:7%;width:min(68vw,670px);height:min(57vh,500px)}.foliage-top-left{left:15%;top:-2%;width:40%;height:76%}.foliage-top-right{right:15%;top:-2%;width:40%;height:76%}.foliage-side-left{left:1%;top:25%;width:43%;height:50%}.foliage-side-right{right:1%;top:25%;width:43%;height:50%}.memory-bouquet .bouquet-wrap{bottom:7%;width:min(66vw,600px);height:50%;overflow:visible;clip-path:polygon(2% 5%,50% 36%,98% 5%,66% 100%,34% 100%);background:linear-gradient(112deg,#c8a88b 0%,#dfc1a4 47%,#d9bba0 52%,#bd9b7e 100%);filter:drop-shadow(0 16px 20px #6a44382c)}.memory-bouquet .bouquet-wrap:before{content:"";position:absolute;z-index:1;inset:0;clip-path:polygon(2% 5%,50% 36%,50% 100%,34% 100%);background:linear-gradient(125deg,#dfc1a4,#c5a285);box-shadow:inset -10px 4px 18px #775b4630}.memory-bouquet .bouquet-wrap:after{z-index:2;inset:0;clip-path:polygon(98% 5%,50% 36%,50% 100%,66% 100%);background:linear-gradient(235deg,#d9bba0,#c09c7f);box-shadow:inset 10px 4px 18px #775b4630}.kraft-inner{position:absolute;z-index:0;left:7%;right:7%;top:5%;height:42%;clip-path:polygon(0 0,50% 72%,100% 0,86% 100%,14% 100%);background:#ead1c0;box-shadow:inset 0 10px 18px #8b67502b}.stem-tail{position:absolute;z-index:2;left:50%;bottom:1.5%;display:flex;gap:5px;height:13%;transform:translateX(-50%) rotate(2deg)}.stem-tail i{display:block;width:6px;height:100%;border-radius:0 0 8px 8px;background:linear-gradient(90deg,#52764c,#8aaa75,#486b45);transform:rotate(calc((var(--tail,0))*1deg))}.stem-tail i:nth-child(1){transform:rotate(8deg)}.stem-tail i:nth-child(2){transform:rotate(4deg)}.stem-tail i:nth-child(4){transform:rotate(-4deg)}.stem-tail i:nth-child(5){transform:rotate(-8deg)}.memory-bouquet .bouquet-bow{z-index:7;left:50%;bottom:5%;width:34px;height:34px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#b94658,#8b1e2d 70%);box-shadow:0 5px 9px #5d13204f}.bouquet-bow:before,.bouquet-bow:after{content:"";position:absolute;top:3px;width:76px;height:34px;background:linear-gradient(#a82940,#7d1627);box-shadow:inset 0 4px 5px #db68754a,0 5px 7px #5d13203c}.bouquet-bow:before{right:24px;border-radius:80% 16% 60% 30%;transform:rotate(7deg)}.bouquet-bow:after{left:24px;border-radius:16% 80% 30% 60%;transform:rotate(-7deg)}.bouquet-bow i,.bouquet-bow b{position:absolute;z-index:-1;top:23px;width:16px;height:78px;background:linear-gradient(90deg,#741423,#a72b3e);transform-origin:top}.bouquet-bow i{left:6px;transform:rotate(15deg)}.bouquet-bow b{right:6px;transform:rotate(-15deg)}.memory-bouquet .bouquet-wrap em{z-index:8;right:0;bottom:-14%;padding:.55rem 1.05rem;background:#fffdf7;color:#8b1e2d;transform:rotate(-5deg);animation:tag-sway 1s 2.15s ease both}.assembly-wrapper,.assembly-wrapper i{background:linear-gradient(120deg,#d9bba0,#c8a88b)}.assembly-wrapper:before{background:#e3c5ab}.memory-bouquet blockquote{bottom:0}@keyframes tag-sway{from{opacity:0;transform:translateY(-35px) rotate(-16deg)}65%{transform:translateY(4px) rotate(3deg)}to{opacity:1;transform:translateY(0) rotate(-5deg)}}@media(max-width:600px){.bouquet-flowers{top:9%;height:49vh}.foliage-fan{top:10%;width:94vw;height:48vh}.memory-bouquet .bouquet-wrap{width:91vw;height:43%;bottom:10%}.short-stems i{height:12%}.stem-tail{bottom:4%;height:10%}.memory-bouquet blockquote{bottom:1%}}
      .memory-bouquet .bouquet-tag{position:absolute;z-index:8;left:calc(50% + 20px);bottom:1%;margin:0;padding:.55rem 1.05rem;background:#fffdf7;box-shadow:0 7px 16px #6f453b35;font-family:"Segoe Script","Segoe UI",cursive;font-size:clamp(.8rem,1.7vw,1.08rem);font-style:italic;white-space:nowrap;color:#8b1e2d;transform-origin:8% 0;animation:tag-sway 1s 2.15s ease both}
      .short-stems i{left:50%;top:49%;width:7px;height:29%;transform:translateX(-50%) rotate(var(--stem-angle));transform-origin:50% 100%}.memory-bouquet .bouquet-wrap{clip-path:polygon(2% 5%,50% 35%,98% 5%,53% 100%,47% 100%)}.memory-bouquet .bouquet-wrap:before{clip-path:polygon(2% 5%,50% 35%,50% 100%,47% 100%)}.memory-bouquet .bouquet-wrap:after{clip-path:polygon(98% 5%,50% 35%,50% 100%,53% 100%)}.kraft-inner{left:7%;right:7%;top:4%;height:43%;clip-path:polygon(0 0,50% 70%,100% 0,87% 100%,13% 100%);background:linear-gradient(135deg,#f7dde2,#f3d0d7 55%,#e9bdc7);box-shadow:inset 0 10px 18px #94667326}.assembly-wrapper:before{clip-path:polygon(3% 10%,50% 40%,97% 10%,54% 100%,46% 100%);background:#f3d0d7}.wrapper-left{clip-path:polygon(2% 10%,50% 42%,50% 100%,46% 100%)}.wrapper-right{clip-path:polygon(98% 10%,50% 42%,50% 100%,54% 100%)}.memory-bouquet .bouquet-bow{bottom:6.2%}.stem-tail{z-index:6;bottom:0;height:10%}@media(max-width:600px){.short-stems i{top:50%;height:24%}.memory-bouquet .bouquet-bow{bottom:9.2%}.stem-tail{bottom:3%;height:8%}}
    `}</style>
  </main>;
}
function StandardCardExperience({ template, draft, embedded = false }: { template: CardTemplate; draft: CardDraft; embedded?: boolean }) {
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
