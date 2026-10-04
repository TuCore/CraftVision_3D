"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const CONFIG = {
  texts: {
    loading: "Đang chuẩn bị yêu thương...",
    subLoading: "ĐANG CHUẨN BỊ QUÀ TẶNG...",
    introClick: "Chạm để bắt đầu",
    greetings: ["Gửi Em 💕", "Người Anh Yêu Nhất 💕", "Mãi Bên Em 💕"],
    letterTitle: "Gửi bé iu 💕",
    letterBody:
      "Gửi em — người con gái khiến mỗi ngày của anh trở nên đáng nhớ.\n\nCảm ơn em vì đã xuất hiện, đã yêu thương và đồng hành cùng anh.\n\nDù tương lai phía trước có gì, anh chỉ mong được nắm tay em đi tiếp.\n\nMãi yêu em ❤️",
  },
  images: [
    "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&q=80",
    "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=400&q=80",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&q=80",
    "https://images.unsplash.com/photo-1533038590840-1cde6e668a91?w=400&q=80",
    "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&q=80",
    "https://images.unsplash.com/photo-1529083163960-69b4cf55b5ea?w=400&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80",
    "https://images.unsplash.com/photo-1529417305485-480f579e7578?w=400&q=80",
    "https://images.unsplash.com/photo-1501901609772-df0848060b33?w=400&q=80",
    "https://images.unsplash.com/photo-1516589091380-5d8e87df6999?w=400&q=80",
    "https://images.unsplash.com/photo-1523635048082-b5bc9ffec5e2?w=400&q=80",
    "https://images.unsplash.com/photo-1542303242-3d8a2b045bb5?w=400&q=80",
    "https://images.unsplash.com/photo-1602524816-2cfef7c9e50e?w=400&q=80",
    "https://images.unsplash.com/photo-1502781252888-9143ba7f074e?w=400&q=80",
    "https://images.unsplash.com/photo-1499336315816-097655dcfbda?w=400&q=80",
    "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&q=80",
    "https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=400&q=80",
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80",
  ],
  coverImage: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&q=80",
  audioUrl: "",
};

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type Phase = "loading" | "intro" | "greetings" | "sphere" | "letter";

interface Star       { x: number; y: number; r: number; a: number; speed: number; twinkle: number }
interface TextParticle { x: number; y: number; tx: number; ty: number; vx: number; vy: number; size: number; drift: number; driftPhase: number; alpha: number }
interface Firework   { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; size: number }
interface ShootingStar { x: number; y: number; vx: number; vy: number; life: number; maxLife: number }
interface PhotoParticle { x: number; y: number; vx: number; vy: number; scale: number; ts: number; imgIdx: number; phi: number; theta: number }

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function LoveGiftExperience() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const audioRef    = useRef<HTMLAudioElement | null>(null);
  const animRef     = useRef<number>(0);
  const phaseRef    = useRef<Phase>("loading");

  const [phase, setPhaseState]         = useState<Phase>("loading");
  const [loadPct, setLoadPct]          = useState(0);
  const [muted, setMuted]              = useState(false);
  const [showLetter, setShowLetter]    = useState(false);
  const [typewriterText, setTypewriterText] = useState("");
  const [showEnvelope, setShowEnvelope] = useState(false);

  // canvas-owned state (no re-render needed)
  const starsRef          = useRef<Star[]>([]);
  const textParticlesRef  = useRef<TextParticle[]>([]);
  const fireworksRef      = useRef<Firework[]>([]);
  const shootingStarsRef  = useRef<ShootingStar[]>([]);
  const photoParticlesRef = useRef<PhotoParticle[]>([]);
  const imagesRef         = useRef<HTMLImageElement[]>([]);

  const sphereRotRef      = useRef(0);
  const sphereScattered   = useRef(false);
  const scatterTimeRef    = useRef(0);
  const greetingIdxRef    = useRef(0);
  const greetingAlphaRef  = useRef(0); // 0..1 fade for particles
  const greetingPhaseRef  = useRef<"in" | "hold" | "out" | "idle">("idle");

  const setPhase = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  }, []);

  const rand = (mn: number, mx: number) => Math.random() * (mx - mn) + mn;

  // ─── Build text particles from offscreen canvas ────────────────────────────
  const buildTextParticles = useCallback((text: string, W: number, H: number) => {
    const off = document.createElement("canvas");
    off.width = W;
    off.height = H;
    const octx = off.getContext("2d")!;
    octx.clearRect(0, 0, W, H);

    // Responsive font size — wrap long text onto 2 lines
    const isMobile = W < 640;
    const fontSize = isMobile ? Math.floor(W / 7) : Math.floor(W / 9.5);
    const lineH = fontSize * 1.3;

    octx.fillStyle = "white";
    octx.font = `bold ${fontSize}px Georgia, "Times New Roman", serif`;
    octx.textAlign = "center";
    octx.textBaseline = "middle";

    // Split text so it wraps if too wide
    const words = text.split(" ");
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (octx.measureText(test).width > W * 0.9 && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);

    const totalH = lines.length * lineH;
    const startY = H / 2 - totalH / 2 + lineH / 2;
    lines.forEach((line, i) => {
      octx.fillText(line, W / 2, startY + i * lineH);
    });

    // Sample pixels — every 3px for performance
    const step = isMobile ? 2 : 3;
    const imageData = octx.getImageData(0, 0, W, H);
    const particles: TextParticle[] = [];

    for (let y = 0; y < H; y += step) {
      for (let x = 0; x < W; x += step) {
        const idx = (y * W + x) * 4;
        if (imageData.data[idx] > 100) {
          // Spawn from random off-screen position with velocity toward target
          const angle = rand(0, Math.PI * 2);
          const dist  = rand(200, 600);
          particles.push({
            x: W / 2 + Math.cos(angle) * dist,
            y: H / 2 + Math.sin(angle) * dist,
            tx: x + rand(-1, 1),
            ty: y + rand(-1, 1),
            vx: 0, vy: 0,
            size: rand(1, 2.8),
            drift: rand(0.3, 1.2),
            driftPhase: rand(0, Math.PI * 2),
            alpha: 1,
          });
        }
      }
    }

    textParticlesRef.current = particles;
  }, []);

  // ─── Stars ─────────────────────────────────────────────────────────────────
  const initStars = useCallback((W: number, H: number) => {
    starsRef.current = Array.from({ length: 280 }, () => ({
      x: rand(0, W), y: rand(0, H),
      r: rand(0.3, 1.8), a: rand(0.25, 0.9),
      speed: rand(0.006, 0.04), twinkle: rand(0, Math.PI * 2),
    }));
  }, []);

  // ─── Preload images ────────────────────────────────────────────────────────
  useEffect(() => {
    imagesRef.current = CONFIG.images.map((src) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = src;
      return img;
    });
  }, []);

  // ─── Loading counter ───────────────────────────────────────────────────────
  useEffect(() => {
    let pct = 0;
    const iv = setInterval(() => {
      pct += rand(0.8, 2.5);
      if (pct >= 100) {
        pct = 100;
        setLoadPct(100);
        clearInterval(iv);
        setTimeout(() => setPhase("intro"), 600);
        return;
      }
      setLoadPct(Math.floor(pct));
    }, 40);
    return () => clearInterval(iv);
  }, [setPhase]);

  // ─── Audio ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!CONFIG.audioUrl) return;
    const a = new Audio(CONFIG.audioUrl);
    a.loop = true; a.volume = 0.5;
    audioRef.current = a;
    return () => { a.pause(); };
  }, []);

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !audioRef.current.muted;
    setMuted(m => !m);
  };

  // ─── Intro click → run greeting sequence ──────────────────────────────────
  const handleStart = useCallback(() => {
    if (phaseRef.current !== "intro") return;
    audioRef.current?.play().catch(() => null);
    setPhase("greetings");

    const W = canvasRef.current?.width  || window.innerWidth;
    const H = canvasRef.current?.height || window.innerHeight;
    const greetings = CONFIG.texts.greetings;
    let i = 0;

    const showNext = () => {
      if (i >= greetings.length) {
        greetingAlphaRef.current = 0;
        greetingPhaseRef.current = "idle";
        textParticlesRef.current = [];
        setTimeout(() => setPhase("sphere"), 300);
        return;
      }
      greetingIdxRef.current = i;
      buildTextParticles(greetings[i], W, H);
      greetingPhaseRef.current = "in";
      greetingAlphaRef.current = 0;

      // fade in 500ms → hold 1800ms → fade out 600ms
      setTimeout(() => { greetingPhaseRef.current = "hold"; }, 500);
      setTimeout(() => { greetingPhaseRef.current = "out"; }, 2300);
      setTimeout(() => {
        greetingPhaseRef.current = "idle";
        greetingAlphaRef.current = 0;
        i++;
        showNext();
      }, 2900);
    };
    showNext();
  }, [setPhase, buildTextParticles]);

  // ─── Sphere → envelope ────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "sphere") return;
    const t1 = setTimeout(() => { sphereScattered.current = true; scatterTimeRef.current = Date.now(); }, 4200);
    const t2 = setTimeout(() => setShowEnvelope(true), 6800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase]);

  // ─── Typewriter ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!showLetter) { setTypewriterText(""); return; }
    const full = CONFIG.texts.letterBody;
    let i = 0;
    const iv = setInterval(() => {
      if (i >= full.length) { clearInterval(iv); return; }
      setTypewriterText(full.slice(0, ++i));
    }, 28);
    return () => clearInterval(iv);
  }, [showLetter]);

  // ─── CANVAS LOOP ───────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let W = (canvas.width  = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      initStars(W, H);
    };
    window.addEventListener("resize", resize);
    initStars(W, H);

    let lastFW = 0, lastSS = 0;

    // Firework burst
    const spawnFW = (ts: number) => {
      const cx = rand(W * 0.1, W * 0.9);
      const cy = rand(H * 0.05, H * 0.55);
      const col = ["#ff2d75","#ff6bab","#ff90bb","#c0392b","#ff0a54"][Math.floor(rand(0,5))];
      for (let i = 0; i < 38; i++) {
        const a = (i / 38) * Math.PI * 2;
        const sp = rand(1.5, 5);
        fireworksRef.current.push({ x: cx, y: cy, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp - rand(0.5,2), life: 1, maxLife: rand(50,90), color: col, size: rand(2,4) });
      }
    };

    // Shooting star
    const spawnSS = () => {
      const a = rand(0.2, 0.6);
      shootingStarsRef.current.push({ x: rand(0, W), y: rand(0, H*0.4), vx: Math.cos(a)*rand(10,18), vy: Math.sin(a)*rand(5,10), life: 1, maxLife: rand(22,45) });
    };

    // Build sphere particles
    const buildSphere = () => {
      const count = CONFIG.images.length;
      const cx = W/2, cy = H/2;
      const R  = Math.min(W,H) * 0.3;
      photoParticlesRef.current = Array.from({ length: count }, (_, i) => {
        const phi   = Math.acos(1 - (2*(i+0.5))/count);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        return {
          x: rand(-W, W*2), y: rand(-H, H*2),
          vx: 0, vy: 0, scale: 1, ts: 0,
          imgIdx: i % CONFIG.images.length,
          phi, theta,
        };
      });
    };

    // ─── Draw helpers ─────────────────────────────────────────────────────
    const drawStars = () => {
      starsRef.current.forEach(s => {
        s.twinkle += s.speed;
        const a = s.a * (0.5 + 0.5 * Math.sin(s.twinkle));
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
        ctx.fill();
      });
    };

    /** Draw greeting text as glowing pink particles */
    const drawTextParticles = (ts: number) => {
      const phase = greetingPhaseRef.current;
      if (phase === "idle") return;

      // Animate alpha
      if (phase === "in")   greetingAlphaRef.current = Math.min(1, greetingAlphaRef.current + 0.04);
      if (phase === "out")  greetingAlphaRef.current = Math.max(0, greetingAlphaRef.current - 0.025);

      const alpha = greetingAlphaRef.current;
      if (alpha <= 0) return;

      // Central glow orb — like image 2
      const cx = W/2, cy = H/2;
      const orb = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W,H)*0.28);
      orb.addColorStop(0, `rgba(255,45,117,${0.18 * alpha})`);
      orb.addColorStop(0.4, `rgba(180,0,80,${0.08 * alpha})`);
      orb.addColorStop(1, "transparent");
      ctx.fillStyle = orb;
      ctx.fillRect(0, 0, W, H);

      // Central bright point
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 14);
      glow.addColorStop(0, `rgba(255,255,255,${0.9 * alpha})`);
      glow.addColorStop(0.5, `rgba(255,100,180,${0.4 * alpha})`);
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI*2);
      ctx.fill();

      // Render each text particle
      const particles = textParticlesRef.current;
      particles.forEach((p, i) => {
        // Move toward target
        p.x += (p.tx - p.x) * 0.09;
        p.y += (p.ty - p.y) * 0.09;

        // Subtle organic drift once settled
        const settled = Math.abs(p.x - p.tx) < 4 && Math.abs(p.y - p.ty) < 4;
        const dx = settled ? Math.sin(ts * 0.0008 * p.drift + p.driftPhase) * 1.2 : 0;
        const dy = settled ? Math.cos(ts * 0.0007 * p.drift + p.driftPhase) * 0.8 : 0;

        const px = p.x + dx;
        const py = p.y + dy;
        const particleAlpha = alpha * (0.7 + 0.3 * Math.sin(ts * 0.003 + p.driftPhase));

        // Core pink dot
        ctx.fillStyle = `rgba(255,45,117,${particleAlpha})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI*2);
        ctx.fill();

        // Outer glow halo (every other particle for perf)
        if (i % 2 === 0) {
          ctx.fillStyle = `rgba(255,100,180,${particleAlpha * 0.35})`;
          ctx.beginPath();
          ctx.arc(px, py, p.size * 2.2, 0, Math.PI*2);
          ctx.fill();
        }
      });
    };

    const drawFireworks = () => {
      fireworksRef.current = fireworksRef.current.filter(fw => {
        fw.x += fw.vx; fw.y += fw.vy;
        fw.vy += 0.1; fw.vx *= 0.97; fw.vy *= 0.97;
        fw.life++;
        const a = 1 - fw.life / fw.maxLife;
        if (a <= 0) return false;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = fw.color;
        ctx.shadowColor = fw.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(fw.x, fw.y, fw.size * a, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
        return true;
      });
    };

    const drawShootingStars = () => {
      shootingStarsRef.current = shootingStarsRef.current.filter(ss => {
        ss.x += ss.vx; ss.y += ss.vy; ss.life++;
        const a = 1 - ss.life / ss.maxLife;
        if (a <= 0) return false;
        ctx.save();
        ctx.globalAlpha = a * 0.9;
        ctx.strokeStyle = "#fff";
        ctx.shadowColor = "#ffb3d1";
        ctx.shadowBlur = 4;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - ss.vx * 5, ss.y - ss.vy * 5);
        ctx.stroke();
        ctx.restore();
        return true;
      });
    };

    const drawSphere = (ts: number) => {
      if (photoParticlesRef.current.length === 0) buildSphere();
      const cx = W/2, cy = H/2;
      const R  = Math.min(W,H) * 0.3;

      if (!sphereScattered.current) {
        sphereRotRef.current += 0.008;
        const rot = sphereRotRef.current;

        // Sort by depth for painter's algorithm
        const sorted = [...photoParticlesRef.current].map((p, i) => {
          const tz = R * Math.sin(p.phi) * Math.sin(p.theta + rot);
          return { p, i, depth: (tz + R) / (2*R) };
        }).sort((a, b) => a.depth - b.depth);

        sorted.forEach(({ p, depth }) => {
          const tx = cx + R * Math.sin(p.phi) * Math.cos(p.theta + rot);
          const ty = cy + R * Math.cos(p.phi) * 0.55;
          p.x += (tx - p.x) * 0.08;
          p.y += (ty - p.y) * 0.08;

          const sc = 0.5 + depth * 0.5;
          const sz = Math.min(W,H) * 0.08 * sc;
          const img = imagesRef.current[p.imgIdx];
          if (!img?.complete || !img.naturalWidth) return;

          ctx.save();
          ctx.globalAlpha = 0.9 * sc;
          ctx.shadowColor = "#ff2d75";
          ctx.shadowBlur = 8 * depth;
          const ix = p.x - sz/2, iy = p.y - sz/2;
          ctx.beginPath();
          ctx.roundRect(ix, iy, sz, sz, 6);
          ctx.clip();
          ctx.drawImage(img, ix, iy, sz, sz);
          ctx.restore();

          // Neon frame
          ctx.save();
          ctx.globalAlpha = 0.3 * depth;
          ctx.strokeStyle = "#ff2d75";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(p.x-sz/2, p.y-sz/2, sz, sz, 6);
          ctx.stroke();
          ctx.restore();
        });
      } else {
        // Scatter
        photoParticlesRef.current.forEach(p => {
          if (p.ts === 0) {
            p.ts = Date.now();
            const a = rand(0, Math.PI*2);
            const sp = rand(5, 16);
            p.vx = Math.cos(a) * sp;
            p.vy = Math.sin(a) * sp - rand(2,6);
          }
          p.vx *= 0.97; p.vy *= 0.97; p.vy += 0.28;
          p.x += p.vx; p.y += p.vy;
          const age = (Date.now() - p.ts) / 900;
          const a = Math.max(0, 1 - age);
          if (a <= 0) return;
          const sz = Math.min(W,H) * 0.07;
          const img = imagesRef.current[p.imgIdx];
          if (!img?.complete || !img.naturalWidth) return;
          ctx.save();
          ctx.globalAlpha = a;
          ctx.beginPath();
          ctx.roundRect(p.x-sz/2, p.y-sz/2, sz, sz, 5);
          ctx.clip();
          ctx.drawImage(img, p.x-sz/2, p.y-sz/2, sz, sz);
          ctx.restore();
        });
      }
    };

    // ─── Main loop ────────────────────────────────────────────────────────
    const loop = (ts: number) => {
      ctx.clearRect(0, 0, W, H);

      // Galaxy background
      const bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W,H));
      bg.addColorStop(0, "#0a0018");
      bg.addColorStop(0.55, "#050010");
      bg.addColorStop(1, "#000000");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      drawStars();

      const cur = phaseRef.current;

      if (cur === "greetings") {
        if (ts - lastFW > 650) { spawnFW(ts); lastFW = ts; }
        if (ts - lastSS > 950) { spawnSS();   lastSS = ts; }
        drawFireworks();
        drawShootingStars();
        drawTextParticles(ts); // ← Particle text
      }

      if (cur === "sphere") drawSphere(ts);

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [initStars]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER — only loading/intro/envelope/letter use HTML elements
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 overflow-hidden select-none cursor-pointer"
      style={{ background: "#000" }}
      onClick={phase === "intro" ? handleStart : undefined}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* PHASE 0: LOADING */}
      {phase === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
          <p
            style={{
              color: "#ff2d75",
              textShadow: "0 0 20px #ff2d75, 0 0 60px #ff2d75, 0 0 100px #c0392b",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "clamp(1.5rem, 5vw, 3rem)",
              fontWeight: "bold",
              marginBottom: "2.5rem",
              textAlign: "center",
              padding: "0 1rem",
              animation: "neonPulse 1.5s ease-in-out infinite",
            }}
          >
            {CONFIG.texts.loading}
          </p>

          <div className="flex flex-col items-center gap-3 w-64 sm:w-80">
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,45,117,0.18)" }}>
              <div
                style={{
                  width: `${loadPct}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #c0392b, #ff2d75, #ff90bb)",
                  boxShadow: "0 0 12px #ff2d75",
                  borderRadius: "9999px",
                  transition: "width 0.1s linear",
                }}
              />
            </div>
            <p style={{ color: "rgba(255,144,187,0.8)", fontSize: "0.7rem", letterSpacing: "0.22em", fontWeight: 600 }}>
              {CONFIG.texts.subLoading}&nbsp;{loadPct}%
            </p>
          </div>
        </div>
      )}

      {/* PHASE 1: INTRO */}
      {phase === "intro" && (
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-20 z-10 pointer-events-none">
          <p style={{
            color: "#ff90bb",
            textShadow: "0 0 16px #ff2d75, 0 0 40px #ff2d75",
            fontFamily: "Georgia, serif",
            fontSize: "clamp(1.1rem, 4vw, 1.6rem)",
            animation: "blink 1.2s ease-in-out infinite",
            letterSpacing: "0.12em",
          }}>
            {CONFIG.texts.introClick}
          </p>
        </div>
      )}

      {/* ENVELOPE */}
      {showEnvelope && !showLetter && (
        <div
          className="absolute inset-0 flex items-center justify-center z-10"
          onClick={(e) => { e.stopPropagation(); setTimeout(() => setShowLetter(true), 350); }}
        >
          <div style={{ animation: "floatEnvelope 2.2s ease-in-out infinite", cursor: "pointer", textAlign: "center" }}>
            <svg width="110" height="90" viewBox="0 0 110 90" fill="none">
              <defs>
                <filter id="eglow"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              </defs>
              <rect x="2" y="18" width="106" height="70" rx="8" fill="#1a0010" stroke="#ff2d75" strokeWidth="2.5" filter="url(#eglow)" />
              <polyline points="2,18 55,56 108,18" stroke="#ff2d75" strokeWidth="2.5" fill="none" filter="url(#eglow)" />
              <path d="M55 35 C55 35 42 24 36 30 C30 36 36 44 55 55 C74 44 80 36 74 30 C68 24 55 35 55 35Z" fill="#ff2d75" opacity="0.9" filter="url(#eglow)" />
            </svg>
            <p style={{ color: "#ff90bb", textShadow: "0 0 12px #ff2d75", fontFamily: "Georgia, serif", fontSize: "1rem", marginTop: "1rem", animation: "blink 1.4s ease-in-out infinite" }}>
              Nhấn để mở thư 💌
            </p>
          </div>
        </div>
      )}

      {/* LETTER MODAL */}
      {showLetter && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center p-4 sm:p-8"
          style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(6px)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="relative w-full max-w-3xl rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #12001f 0%, #1a0010 50%, #0a0015 100%)",
              border: "1.5px solid rgba(255,45,117,0.4)",
              boxShadow: "0 0 60px rgba(255,45,117,0.25), 0 30px 80px rgba(0,0,0,0.8)",
              maxHeight: "90vh",
              animation: "modalIn 0.4s ease-out",
            }}
          >
            <button
              onClick={() => { setShowLetter(false); setShowEnvelope(false); }}
              className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all"
            >✕</button>

            {/* Left image */}
            <div className="md:w-2/5 relative shrink-0">
              <img src={CONFIG.coverImage} alt="" className="w-full h-56 md:h-full object-cover" style={{ filter: "brightness(0.72) saturate(1.3)" }} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 55%, #12001f), linear-gradient(to top, #12001f 0%, transparent 55%)" }} />
              <div className="absolute bottom-4 left-4 text-2xl" style={{ filter: "drop-shadow(0 0 8px #ff2d75)" }}>❤️</div>
            </div>

            {/* Right letter */}
            <div className="flex-1 p-6 sm:p-8 flex flex-col overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#ff2d75 transparent" }}>
              <h2 style={{ fontFamily: "Georgia, serif", color: "#ffd6e7", fontSize: "clamp(1.2rem,4vw,1.8rem)", textShadow: "0 0 20px #ff2d75", marginBottom: "1.2rem", borderBottom: "1px solid rgba(255,45,117,0.25)", paddingBottom: "0.8rem" }}>
                {CONFIG.texts.letterTitle}
              </h2>
              <p style={{ fontFamily: "Georgia, serif", color: "rgba(255,214,231,0.9)", fontSize: "clamp(0.88rem,2.5vw,1.05rem)", lineHeight: "1.9", whiteSpace: "pre-line", flex: 1 }}>
                {typewriterText}
                <span style={{ animation: "blink 0.8s step-end infinite", color: "#ff2d75" }}>|</span>
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-px flex-1" style={{ background: "rgba(255,45,117,0.25)" }} />
                <span style={{ color: "#ff2d75", fontSize: "1.5rem" }}>💕</span>
                <div className="h-px flex-1" style={{ background: "rgba(255,45,117,0.25)" }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Music icon */}
      {phase !== "loading" && (
        <button
          onClick={(e) => { e.stopPropagation(); toggleMute(); }}
          className="absolute top-4 right-4 z-40 w-11 h-11 flex items-center justify-center rounded-full border transition-all"
          style={{ background: "rgba(255,45,117,0.15)", border: "1px solid rgba(255,45,117,0.5)", color: "#ff90bb", backdropFilter: "blur(8px)" }}
        >
          {muted
            ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
          }
        </button>
      )}

      {/* Back button */}
      <button
        onClick={() => window.history.back()}
        className="absolute top-4 left-4 z-40 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all"
        style={{ background: "rgba(255,45,117,0.12)", border: "1px solid rgba(255,45,117,0.4)", color: "#ff90bb", backdropFilter: "blur(8px)" }}
      >
        ← Quay lại
      </button>

      <style>{`
        @keyframes neonPulse {
          0%,100% { text-shadow: 0 0 20px #ff2d75,0 0 60px #ff2d75,0 0 100px #c0392b; }
          50%      { text-shadow: 0 0 30px #ff2d75,0 0 90px #ff2d75,0 0 150px #c0392b,0 0 4px #fff; }
        }
        @keyframes blink {
          0%,100% { opacity:1; } 50% { opacity:0; }
        }
        @keyframes floatEnvelope {
          0%,100% { transform:translateY(0) scale(1); }
          50%      { transform:translateY(-14px) scale(1.04); }
        }
        @keyframes modalIn {
          from { opacity:0; transform:scale(0.9) translateY(20px); }
          to   { opacity:1; transform:scale(1)   translateY(0); }
        }
      `}</style>
    </div>
  );
}
