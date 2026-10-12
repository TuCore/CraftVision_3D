"use client";

/* eslint-disable @next/next/no-img-element -- Personalized images can be local data URLs. */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import type { CardDraft, CardTemplate } from "./catalog";

const Scene = dynamic(() => import("./BirthdayInteractiveScene"), { ssr: false });

export default function BirthdayInteractiveExperience({ draft }: { template: CardTemplate; draft: CardDraft; embedded?: boolean }) {
  const [screen, setScreen] = useState(1), [candles, setCandles] = useState(0), [paused, setPaused] = useState(false), [music, setMusic] = useState(false), [response, setResponse] = useState(""), [sentWish, setSentWish] = useState("");
  const panel = useRef<HTMLDivElement>(null), audio = useRef<HTMLAudioElement>(null);
  const text = (key: string, fallback = "") => typeof draft.values[key] === "string" ? String(draft.values[key] || fallback) : fallback;
  const recipient = text("recipient", "Cậu"), age = text("age", "20"), message = text("message", "Chúc cậu luôn rạng rỡ, bình an và gặp thật nhiều điều tuyệt vời.");
  const photo = typeof draft.values.photo === "string" ? draft.values.photo : "";
  const photos = useMemo(() => [photo, ...(Array.isArray(draft.values.album) ? draft.values.album.filter((value): value is string => typeof value === "string") : [])].filter(Boolean), [draft.values.album, photo]);
  const collage = useMemo(() => Array.from({ length: 30 }, (_, index) => photos[index % Math.max(photos.length, 1)]), [photos]);
  const mask = useMemo(() => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500'><rect width='100%' height='100%' fill='black'/><text x='50%' y='82%' text-anchor='middle' font-family='Arial' font-weight='900' font-size='500' fill='white'>${age.replace(/[^0-9]/g, "").slice(0, 3) || "20"}</text></svg>`)}")`, [age]);

  useEffect(() => { if (!panel.current) return; const context = gsap.context(() => gsap.fromTo(panel.current, { autoAlpha: 0, y: 28, scale: .985 }, { autoAlpha: 1, y: 0, scale: 1, duration: .65, ease: "power3.out" })); return () => context.revert(); }, [screen]);
  useEffect(() => { if (candles !== 2 || screen !== 3) return; const timer = window.setTimeout(() => setScreen(4), 900); return () => window.clearTimeout(timer); }, [candles, screen]);
  const go = (next: number) => { if (!panel.current) { setScreen(next); return; } gsap.to(panel.current, { autoAlpha: 0, y: -18, duration: .3, ease: "power2.in", onComplete: () => setScreen(next) }); };
  const start = () => { if (audio.current) void audio.current.play().then(() => setMusic(true)).catch(() => setMusic(false)); go(2); };
  const toggleMusic = () => { if (!audio.current) return; if (music) { audio.current.pause(); setMusic(false); } else void audio.current.play().then(() => setMusic(true)).catch(() => setMusic(false)); };
  const blowCandle = useCallback(() => setCandles(value => Math.min(2, value + 1)), []);
  const replay = () => { audio.current?.pause(); if (audio.current) audio.current.currentTime = 0; setMusic(false); setPaused(false); setCandles(0); setResponse(""); setSentWish(""); setScreen(1); };
  const downloadWish = () => {
    const canvas = document.createElement("canvas"); canvas.width = 1200; canvas.height = 1200; const context = canvas.getContext("2d"); if (!context) return;
    const gradient = context.createLinearGradient(0, 0, 1200, 1200); gradient.addColorStop(0, "#32132f"); gradient.addColorStop(1, "#ef7793"); context.fillStyle = gradient; context.fillRect(0, 0, 1200, 1200);
    context.textAlign = "center"; context.fillStyle = "#fff1d8"; context.font = "700 66px sans-serif"; context.fillText(`CHÚC MỪNG SINH NHẬT ${recipient.toLocaleUpperCase("vi")}`, 600, 300, 1050);
    context.font = "900 260px sans-serif"; context.fillText(age, 600, 610); context.font = "42px sans-serif"; context.fillText(sentWish || message, 600, 790, 1000); context.font = "36px sans-serif"; context.fillText(`— ${text("sender", "Một người luôn thương cậu")} —`, 600, 980);
    const link = document.createElement("a"); link.download = `loi-chuc-sinh-nhat-${recipient}.png`; link.href = canvas.toDataURL("image/png"); link.click();
  };

  return <main className={`relative min-h-dvh overflow-hidden ${screen === 2 || screen === 5 || screen === 6 || screen === 7 || screen === 8 ? "bg-[#fff3df] text-[#4a2530]" : "bg-[#13091c] text-white"}`}>
    {text("audio") && <audio ref={audio} src={text("audio")} loop preload="none" onError={() => setMusic(false)} />}
    <Scene screen={screen} extinguished={candles} paused={paused} onCandle={blowCandle} />
    <div ref={panel} className="relative z-10 flex min-h-dvh items-center justify-center px-5 py-20">
      {screen === 1 && <section className="text-center"><p className="mb-8 text-lg text-violet-100/75">Ở đây tối quá...</p><button onClick={start} className="group relative h-32 w-24 rounded-2xl border border-white/20 bg-white/10 shadow-[0_0_60px_rgba(255,255,255,.12)] backdrop-blur" aria-label="Bật đèn"><span className="absolute inset-x-5 top-5 h-20 rounded-xl bg-slate-100 shadow-inner transition-transform group-hover:-translate-y-1"><span className="absolute inset-x-3 bottom-3 h-2 rounded-full bg-slate-300" /></span></button><p className="mt-8 text-sm tracking-[.25em] text-violet-100/55">CHẠM ĐỂ BẬT ĐÈN</p></section>}
      {screen === 2 && <section className="relative w-full max-w-4xl text-center"><div className="mb-8 text-6xl" aria-hidden="true">🎈 🎉 🎈</div><p className="text-sm font-bold tracking-[.35em] text-rose-500">BẤT NGỜ CHƯA!!!</p><h1 className="mt-4 text-4xl font-black leading-tight md:text-7xl">CHÚC MỪNG SINH NHẬT<br /><span className="text-rose-500">{recipient}</span> — TRÒN {age} TUỔI</h1><button onClick={() => go(3)} className="mt-10 rounded-full bg-rose-500 px-9 py-4 font-bold text-white shadow-xl shadow-rose-300">Tiếp tục →</button></section>}
      {screen === 3 && <section className="pointer-events-none mt-auto pb-12 text-center"><p className="text-xl font-bold">{candles < 2 ? "Chạm hoặc giữ vào bánh để thổi nến" : "Điều ước đang thức giấc..."}</p><p className="mt-2 text-amber-200">Đã tắt {candles}/2 ngọn nến</p></section>}
      {screen === 4 && <section className="mt-auto pb-12 text-center"><p className="mb-5 text-lg text-amber-100">Nhắm mắt và gửi một điều ước lên bầu trời</p><button onClick={() => go(5)} className="rounded-full border border-amber-200/50 bg-amber-300 px-8 py-4 font-black text-[#32132f] shadow-[0_0_45px_rgba(253,224,71,.6)]">★ Gửi điều ước</button></section>}
      {screen === 5 && <section className="w-full max-w-2xl origin-top animate-[pulse_1s_ease-out_1] rounded-[2rem] border border-amber-200 bg-[#fffaf0] p-6 shadow-2xl md:p-10"><p className="text-xs font-bold tracking-[.3em] text-rose-500">GỬI {recipient.toLocaleUpperCase("vi")}</p>{photos[0] && <img src={photos[0]} alt={`Kỷ niệm của ${recipient}`} className="mt-5 max-h-[45vh] w-full rounded-2xl object-cover" />}<p className="mt-6 whitespace-pre-wrap text-lg leading-8">{message}</p><button onClick={() => go(6)} className="mt-7 rounded-full bg-[#4a2530] px-7 py-3 font-bold text-white">Mở album →</button></section>}
      {screen === 6 && <section className="w-full max-w-5xl text-center"><p className="text-sm font-bold tracking-[.3em] text-rose-500">NHỮNG MẢNH GHÉP TUỔI {age}</p>{photos.length ? <div className="mx-auto mt-5 grid h-[55vh] max-h-[560px] grid-cols-6 gap-1" style={{ WebkitMaskImage: mask, maskImage: mask, WebkitMaskSize: "100% 100%", maskSize: "100% 100%" }}>{collage.map((src, index) => <img key={index} src={src} alt="" className="h-full min-h-0 w-full object-cover transition duration-500 hover:z-10 hover:scale-110" />)}</div> : <div className="mx-auto mt-8 text-[18rem] font-black leading-none text-rose-400">{age}</div>}<button onClick={() => go(7)} className="mt-5 rounded-full bg-rose-500 px-7 py-3 font-bold text-white">Viết lời hồi đáp →</button></section>}
      {screen === 7 && <section className="w-full max-w-xl rounded-[2rem] bg-white p-7 shadow-2xl"><div className="flex items-center gap-4 border-b border-rose-100 pb-5"><div className="grid h-14 w-14 place-items-center rounded-full bg-rose-100 text-2xl">🎂</div><div><h2 className="font-black">Thiệp sinh nhật dành cho {recipient}</h2><p className="text-sm text-emerald-600">● Đang chờ lời hồi đáp</p></div></div><label className="mt-6 block font-bold" htmlFor="birthday-response">Điều ước của cậu</label><textarea id="birthday-response" value={response} onChange={event => setResponse(event.target.value)} className="mt-3 min-h-36 w-full resize-none rounded-2xl border border-rose-200 p-4 outline-none focus:ring-2 focus:ring-rose-300" placeholder="Viết một điều ước hoặc lời nhắn..." /><button disabled={!response.trim()} onClick={() => { setSentWish(response.trim()); go(8); }} className="mt-4 w-full rounded-2xl bg-rose-500 py-4 font-bold text-white disabled:opacity-40">Gửi ♥</button></section>}
      {screen === 8 && <section className="w-full max-w-2xl text-center"><div className="text-7xl">✨</div><h1 className="mt-5 text-4xl font-black">Điều ước đã được gửi!</h1><p className="mx-auto mt-5 max-w-xl text-lg leading-8">“{sentWish}”</p><div className="mt-9 flex flex-wrap justify-center gap-3"><button onClick={downloadWish} className="rounded-full bg-rose-500 px-7 py-4 font-bold text-white">Tải lời chúc</button><button onClick={replay} className="rounded-full border border-[#4a2530]/20 bg-white px-7 py-4 font-bold">↻ Xem lại từ đầu</button></div></section>}
    </div>
    {screen > 1 && <button onClick={() => setPaused(value => !value)} className="fixed bottom-5 right-20 z-30 rounded-full bg-black/65 px-4 py-3 text-sm font-bold text-white backdrop-blur">{paused ? "▶ Tiếp tục" : "Ⅱ Tạm dừng"}</button>}
    {text("audio") && <button onClick={toggleMusic} className="fixed bottom-5 right-5 z-30 grid h-12 w-12 place-items-center rounded-full bg-rose-500 text-xl text-white shadow-xl" aria-label={music ? "Tắt nhạc" : "Bật nhạc"}>{music ? "♫" : "♪"}</button>}
  </main>;
}
