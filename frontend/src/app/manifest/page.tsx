"use client";

import { AppShell } from "@/components/AppShell";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Send, Sparkles } from "lucide-react";
import axios from "axios";
import confetti from "canvas-confetti";

// Flower positions scattered around the base of the tree
const FLOWER_POSITIONS = [
  { x: 14, y: 82 }, { x: 22, y: 87 }, { x: 8, y: 90 }, { x: 30, y: 84 },
  { x: 72, y: 85 }, { x: 78, y: 90 }, { x: 86, y: 83 }, { x: 65, y: 88 },
  { x: 42, y: 91 }, { x: 50, y: 94 }, { x: 58, y: 91 }, { x: 36, y: 89 },
  { x: 18, y: 95 }, { x: 82, y: 93 }, { x: 26, y: 93 }, { x: 68, y: 92 },
  { x: 5, y: 86 }, { x: 90, y: 87 }, { x: 44, y: 96 }, { x: 56, y: 97 },
];

const FLOWER_COLORS = ["#ff9a3c", "#ff6eb4", "#ffd700", "#ff7eb3", "#ff8c55"];

function Flower({ x, y, color, animate }: { x: number; y: number; color: string; animate: boolean }) {
  return (
    <g
      transform={`translate(${x}%, ${y}%)`}
      style={{
        transformBox: "fill-box",
        transformOrigin: "center",
        animation: animate ? "flowerGrow 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "none",
        opacity: 1,
      }}
    >
      {/* petals */}
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <ellipse
          key={angle}
          cx={Math.cos((angle * Math.PI) / 180) * 2.8}
          cy={Math.sin((angle * Math.PI) / 180) * 2.8}
          rx="2.5"
          ry="1.5"
          fill={color}
          opacity="0.85"
          transform={`rotate(${angle}, ${Math.cos((angle * Math.PI) / 180) * 2.8}, ${Math.sin((angle * Math.PI) / 180) * 2.8})`}
        />
      ))}
      {/* center */}
      <circle cx="0" cy="0" r="1.8" fill="#fff8" />
    </g>
  );
}

export default function ManifestPage() {
  const [email, setEmail] = useState("");
  const [wish, setWish] = useState("");
  const [isManifesting, setIsManifesting] = useState(false);
  const [wishCount, setWishCount] = useState(0);
  const [newFlowerIndex, setNewFlowerIndex] = useState<number | null>(null);
  const [isBursting, setIsBursting] = useState(false);
  const [animationState, setAnimationState] = useState<'idle' | 'running' | 'tripping' | 'recovering' | 'praying' | 'placed' | 'leaving' | 'letterSpawns' | 'letterEnters' | 'spaceshipFlies'>('idle');
  const [hasIncense, setHasIncense] = useState(false);
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5192";

  useEffect(() => {
    axios.get(`${apiUrl}/api/manifest/count`)
      .then(res => setWishCount(res.data.count))
      .catch(() => {}); // silently ignore if backend isn't running
  }, [apiUrl]);

  const handleManifest = async () => {
    if (!email || !wish) {
      toast.error("Vui lòng điền đầy đủ email và mong muốn của bạn!");
      return;
    }
    setIsManifesting(true);
    
    // Animation sequence for pixel boy: run, trip, get up, pray
    setAnimationState('running');
    await new Promise(r => setTimeout(r, 600)); // Run in fast from bottom
    
    setAnimationState('tripping');
    await new Promise(r => setTimeout(r, 800)); // Ouch! Faceplant
    
    setAnimationState('recovering');
    await new Promise(r => setTimeout(r, 500)); // Get up

    setAnimationState('praying');
    await new Promise(r => setTimeout(r, 1500)); // Bow multiple times (1.5s = 3 bows)
    
    setHasIncense(true);
    setAnimationState('placed');
    await new Promise(r => setTimeout(r, 600)); // Placed, step back
    
    setIsBursting(true);
    setTimeout(() => setIsBursting(false), 800);
    
    setAnimationState('leaving');
    await new Promise(r => setTimeout(r, 600)); 

    setAnimationState('letterSpawns');
    await new Promise(r => setTimeout(r, 800)); // Envelope pops in & rocket appears
    
    setAnimationState('letterEnters');
    await new Promise(r => setTimeout(r, 600)); // Envelope shrinks into rocket

    setAnimationState('spaceshipFlies');
    await new Promise(r => setTimeout(r, 800)); // Rocket flies up

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.4 },
      colors: ['#ff9a3c', '#ff6eb4', '#ffd700', '#38bdf8']
    });

    try {
      const res = await axios.post(`${apiUrl}/api/manifest`, { email, wishText: wish });
      const { totalWishes } = res.data;
      setWishCount(totalWishes);
      setNewFlowerIndex(totalWishes - 1);
      setTimeout(() => setNewFlowerIndex(null), 1000);
      toast.success("Lời nguyện ước đã bay lên vũ trụ! ✨ Kiểm tra email của bạn nhé.");
      setWish("");
    } catch {
      // Offline demo mode
      const next = wishCount + 1;
      setWishCount(next);
      setNewFlowerIndex(next - 1);
      setTimeout(() => setNewFlowerIndex(null), 1000);
      toast.success("Nguyện ước của bạn đã được gửi! ✨");
      setWish("");
    } finally {
      setTimeout(() => setAnimationState('idle'), 800); // Reset after leaving
      setIsManifesting(false);
    }
  };

  const visibleFlowers = FLOWER_POSITIONS.slice(0, Math.min(wishCount, FLOWER_POSITIONS.length));

  return (
    <AppShell active="manifest">
      <style>{`
        @keyframes flowerGrow {
          from { transform: scale(0) rotate(-180deg); opacity: 0; }
          to   { transform: scale(1) rotate(0deg);    opacity: 1; }
        }
        @keyframes sphereBurst {
          0%   { r: 14; opacity: 1; }
          50%  { r: 28; opacity: 0.5; }
          100% { r: 14; opacity: 1; }
        }
        @keyframes portalSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes portalSpinReverse {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes boyWobble {
          0% { transform: translate(86px, 170px) rotate(-4deg); }
          100% { transform: translate(86px, 170px) rotate(4deg); }
        }
        @keyframes armsPray {
          0%, 100% { transform: translateY(0); }
          30% { transform: translateY(-8px); }
          70% { transform: translateY(12px); }
        }
        @keyframes smokeRise {
          0% { opacity: 0; transform: translateY(0); }
          50% { opacity: 0.6; }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        @keyframes rocketFlame {
          0% { transform: scaleY(1); }
          100% { transform: scaleY(1.3); }
        }
        .ring-spin { animation: portalSpin 12s linear infinite; transform-origin: 50% 50%; transform-box: fill-box; }
        .ring-spin-r { animation: portalSpinReverse 18s linear infinite; transform-origin: 50% 50%; transform-box: fill-box; }
        .smoke-anim { animation: smokeRise 2s infinite ease-out; }
      `}</style>

      <div className="mx-auto max-w-xl flex flex-col items-center justify-center h-[calc(100vh-120px)] overflow-hidden gap-3">

        {/* Tree Portal SVG */}
        <div className="relative w-full max-w-[360px] aspect-square flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_40px_rgba(255,154,60,0.3)]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="portalGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="#ff9a3c" stopOpacity="0.15"/>
                <stop offset="100%" stopColor="#ff6eb4" stopOpacity="0"/>
              </radialGradient>
              <linearGradient id="archGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.9"/>
              </linearGradient>
              <linearGradient id="archGradientInner" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.7"/>
                <stop offset="100%" stopColor="#f472b6" stopOpacity="0.8"/>
              </linearGradient>
              <radialGradient id="orbGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="#fff" stopOpacity="1"/>
                <stop offset="40%"  stopColor="#fbcfe8" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="badgeGrad" cx="0%" cy="0%" r="100%">
                <stop offset="0%" stopColor="#fb923c"/>
                <stop offset="100%" stopColor="#f472b6"/>
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="strongGlow">
                <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="softBlur">
                <feGaussianBlur stdDeviation="1.5"/>
              </filter>
            </defs>

            {/* Background portal light */}
            <circle cx="100" cy="100" r="95" fill="url(#portalGlow)"/>

            {/* Spinning rings & orbits */}
            <g className="ring-spin">
              <circle cx="100" cy="100" r="90" fill="none" stroke="#fca5a5" strokeWidth="0.3" strokeDasharray="4 8"/>
              <circle cx="10" cy="100" r="1.5" fill="#fca5a5" filter="url(#glow)"/>
              <circle cx="190" cy="100" r="1" fill="#fca5a5"/>
            </g>
            <g className="ring-spin-r">
              <circle cx="100" cy="100" r="75" fill="none" stroke="#fdba74" strokeWidth="0.4"/>
              <circle cx="100" cy="25" r="2" fill="#fdba74" filter="url(#glow)"/>
            </g>
            <g className="ring-spin">
              <circle cx="100" cy="100" r="60" fill="none" stroke="#f9a8d4" strokeWidth="0.3" strokeDasharray="12 4"/>
              <circle cx="40" cy="100" r="1.2" fill="#f9a8d4"/>
            </g>

            {/* Ground Shadow */}
            <ellipse cx="100" cy="165" rx="35" ry="6" fill="#000" opacity="0.1"/>

            {/* Canopy blobs (overlapping circles) */}
            <g>
              {/* Deep pink back */}
              <circle cx="115" cy="70" r="26" fill="#ec4899" opacity="0.85"/>
              {/* Orange/Yellow left */}
              <circle cx="78" cy="65" r="24" fill="#fb923c" opacity="0.9"/>
              {/* Peach top */}
              <circle cx="95" cy="45" r="22" fill="#fbbf24" opacity="0.85"/>
              {/* Soft pink overlay */}
              <circle cx="95" cy="55" r="20" fill="#fbcfe8" opacity="0.4"/>
              
              {/* Sparkles / dots in canopy */}
              <circle cx="85" cy="40" r="2.5" fill="#fff" opacity="0.9"/>
              <circle cx="105" cy="35" r="1.5" fill="#fff" opacity="0.8"/>
              <circle cx="75" cy="55" r="2" fill="#fff" opacity="0.9"/>
              <circle cx="95" cy="50" r="3" fill="#fff" opacity="0.7"/>
            </g>

            {/* Legs (Trunk) */}
            <g>
              <line x1="88" y1="88" x2="78" y2="160" stroke="#573322" strokeWidth="6" strokeLinecap="round" opacity="0.9"/>
              <line x1="112" y1="88" x2="122" y2="160" stroke="#573322" strokeWidth="6" strokeLinecap="round" opacity="0.9"/>
              <line x1="88" y1="88" x2="78" y2="160" stroke="#8b4513" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
              <line x1="112" y1="88" x2="122" y2="160" stroke="#8b4513" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
            </g>

            {/* Arches (Foreground glass/neon) */}
            {/* Base curved connection */}
            <path d="M 60 160 Q 100 172 140 160" fill="none" stroke="url(#archGradient)" strokeWidth="2.5" opacity="0.8"/>
            <path d="M 75 160 Q 100 168 125 160" fill="none" stroke="url(#archGradientInner)" strokeWidth="1.5" opacity="0.7"/>
            
            {/* Outer Arch */}
            <path d="M 60 160 L 60 130 A 40 40 0 0 1 140 130 L 140 160" fill="none" stroke="url(#archGradient)" strokeWidth="3" strokeLinecap="round" filter="url(#softBlur)"/>
            <path d="M 60 160 L 60 130 A 40 40 0 0 1 140 130 L 140 160" fill="none" stroke="url(#archGradient)" strokeWidth="1.5" strokeLinecap="round"/>
            
            {/* Inner Arch */}
            <path d="M 75 160 L 75 125 A 25 25 0 0 1 125 125 L 125 160" fill="none" stroke="url(#archGradientInner)" strokeWidth="2" strokeLinecap="round" filter="url(#softBlur)"/>
            <path d="M 75 160 L 75 125 A 25 25 0 0 1 125 125 L 125 160" fill="none" stroke="url(#archGradientInner)" strokeWidth="1" strokeLinecap="round"/>
            
            {/* Vertical Accent lines */}
            <line x1="135" y1="135" x2="135" y2="155" stroke="url(#archGradient)" strokeWidth="1" opacity="0.6" strokeLinecap="round"/>

            {/* Glowing Orb */}
            <circle cx="100" cy="125" r="14" fill="url(#orbGlow)" filter="url(#strongGlow)"
              style={{ animation: isBursting ? "sphereBurst 0.8s ease-out" : "none" }}/>
            <circle cx="100" cy="125" r="10" fill="#fff" opacity="0.95"/>

            {/* Censer / Lư hương */}
            <g transform="translate(90, 160)">
              <path d="M 2 3 L 2 8 C 2 12, 18 12, 18 8 L 18 3 Z" fill="#d4af37" />
              <rect x="0" y="0" width="20" height="3" fill="#b8860b" rx="1" />
              <rect x="4" y="10" width="2" height="4" fill="#b8860b" />
              <rect x="14" y="10" width="2" height="4" fill="#b8860b" />
            </g>

            {/* Placed Incense */}
            <g className="transition-opacity duration-300" style={{ opacity: hasIncense ? 1 : 0 }}>
              <line x1="100" y1="162" x2="100" y2="148" stroke="#8b4513" strokeWidth="1.2" />
              <circle cx="100" cy="148" r="1.5" fill="#ef4444" filter="url(#glow)" />
              <line x1="97" y1="162" x2="94" y2="150" stroke="#8b4513" strokeWidth="1.2" />
              <circle cx="94" cy="150" r="1.5" fill="#ef4444" filter="url(#glow)" />
              <line x1="103" y1="162" x2="106" y2="150" stroke="#8b4513" strokeWidth="1.2" />
              <circle cx="106" cy="150" r="1.5" fill="#ef4444" filter="url(#glow)" />
              
              {/* Smoke for placed incense */}
              <path d="M 100 146 Q 98 140 100 135 T 100 125" fill="none" stroke="#fff" strokeWidth="1" opacity="0.5" className="smoke-anim" />
            </g>

            {/* Pixel Boy (Praying Animation) */}
            <g 
              style={{
                transition: animationState === 'tripping' ? 'all 0.2s cubic-bezier(0.17, 0.89, 0.32, 1.28)' : 'all 0.5s ease-in-out',
                transformOrigin: '14px 18px',
                opacity: animationState === 'idle' ? 0 : 1,
                transform: 
                  animationState === 'idle' ? 'translate(-50px, 250px)' :
                  animationState === 'running' ? 'translate(86px, 180px) rotate(15deg)' :
                  animationState === 'tripping' ? 'translate(86px, 176px) rotate(90deg)' :
                  animationState === 'recovering' ? 'translate(86px, 170px) rotate(0deg)' :
                  animationState === 'praying' ? 'translate(86px, 170px)' :
                  animationState === 'placed' ? 'translate(86px, 170px)' :
                  animationState === 'leaving' ? 'translate(250px, 250px) rotate(-15deg)' : 
                  'translate(-50px, 250px)',
                animation: 
                  animationState === 'running' || animationState === 'leaving' ? 'boyWobble 0.2s infinite alternate' : 'none'
              }}
            >
              {/* Head */}
              <rect x="4" y="-28" width="20" height="16" fill="#1f2937" rx="4" />
              {/* Body (Shirt) */}
              <rect x="3" y="-12" width="22" height="14" fill="#ef4444" rx="3" />
              
              {/* Incense in hands & Hands */}
              <g 
                className="transition-opacity duration-200" 
                style={{ 
                  opacity: (animationState === 'running' || animationState === 'tripping' || animationState === 'recovering' || animationState === 'praying') ? 1 : 0,
                  animation: animationState === 'praying' ? 'armsPray 0.7s infinite ease-in-out' : 'none'
                }}
              >
                <line x1="14" y1="-8" x2="14" y2="-28" stroke="#8b4513" strokeWidth="1.5" />
                <circle cx="14" cy="-28" r="1.5" fill="#ef4444" filter="url(#glow)" />
                <path d="M 14 -30 Q 12 -35 14 -40 T 14 -50" fill="none" stroke="#fff" strokeWidth="1" opacity="0.5" className="smoke-anim" />
                
                {/* Hands holding the incense */}
                <rect x="11" y="-10" width="6" height="6" fill="#fcd34d" rx="2" />
              </g>

              {/* Pants */}
              <rect x="4" y="2" width="20" height="8" fill="#1e3a8a" rx="1" />
              {/* Legs */}
              <rect x="6" y="10" width="6" height="8" fill="#fcd34d" rx="1" />
              <rect x="16" y="10" width="6" height="8" fill="#fcd34d" rx="1" />
            </g>

            {/* Rocket & Letter sequence */}
            <g 
              style={{
                transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                opacity: (animationState === 'letterSpawns' || animationState === 'letterEnters' || animationState === 'spaceshipFlies') ? 1 : 0,
                transform: animationState === 'spaceshipFlies' ? 'translate(0px, -250px)' : 
                           (animationState === 'letterSpawns' || animationState === 'letterEnters') ? 'translate(0px, 0px)' : 'translate(0px, 40px)',
              }}
            >
              <g transform="translate(90, 130)">
                {/* Body */}
                <path d="M 10 0 C 18 10, 18 20, 10 30 C 2 20, 2 10, 10 0 Z" fill="#e2e8f0" />
                <path d="M 10 0 C 14 10, 14 20, 10 30 Z" fill="#94a3b8" />
                {/* Window */}
                <circle cx="10" cy="15" r="3" fill="#38bdf8" />
                <circle cx="10" cy="15" r="1.5" fill="#bae6fd" transform="translate(-0.5, -0.5)" />
                {/* Fins */}
                <path d="M 5 22 L -2 32 L 6 29 Z" fill="#ef4444" />
                <path d="M 15 22 L 22 32 L 14 29 Z" fill="#ef4444" />
                {/* Thruster flame */}
                <g style={{ 
                  opacity: animationState === 'spaceshipFlies' ? 1 : 0, 
                  animation: animationState === 'spaceshipFlies' ? 'rocketFlame 0.05s infinite alternate' : 'none',
                  transformOrigin: '10px 30px'
                }}>
                  <path d="M 6 30 L 10 45 L 14 30 Z" fill="#fb923c" />
                  <path d="M 8 30 L 10 38 L 12 30 Z" fill="#fef08a" />
                </g>
              </g>
            </g>

            {/* Envelope */}
            <g 
              style={{
                transition: 'all 0.6s cubic-bezier(0.5, 0, 0.2, 1)',
                transformOrigin: '100px 106px',
                opacity: (animationState === 'letterSpawns' || animationState === 'letterEnters') ? 1 : 0,
                transform: 
                  animationState === 'letterSpawns' ? 'translate(92px, 100px) scale(1)' :
                  animationState === 'letterEnters' ? 'translate(92px, 140px) scale(0)' : 
                  'translate(92px, 80px) scale(0.5)'
              }}
            >
              <rect x="0" y="0" width="16" height="12" fill="#f8fafc" rx="1" />
              <path d="M 0 0 L 8 6 L 16 0" fill="none" stroke="#cbd5e1" strokeWidth="1" />
              {/* Heart seal */}
              <path d="M 8 7 C 9 6, 11 6, 11 8 C 11 10, 8 11, 8 11 C 8 11, 5 10, 5 8 C 5 6, 7 6, 8 7 Z" fill="#ef4444" />
            </g>

            {/* Flowers */}
            {visibleFlowers.map((pos, i) => (
              <Flower
                key={i}
                x={pos.x * 2}   // scale to SVG viewBox 0-200
                y={pos.y * 2}
                color={FLOWER_COLORS[i % FLOWER_COLORS.length]}
                animate={i === newFlowerIndex}
              />
            ))}

            {/* Wish count badge */}
            {wishCount > 0 && (
              <g transform="translate(140, 10)">
                <rect x="0" y="0" width="48" height="18" rx="9" fill="url(#badgeGrad)" opacity="0.9" filter="url(#glow)"/>
                <text x="24" y="12.5" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold">
                  ✨ {wishCount} wish
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Form */}
        <div className="w-full max-w-[320px] space-y-2 z-10">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email của bạn..."
            className="w-full px-3 py-2 text-sm rounded-xl border border-orange-200/40 bg-white/10 backdrop-blur-sm text-foreground placeholder:text-muted-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50"
          />
          <textarea
            value={wish}
            onChange={(e) => setWish(e.target.value)}
            placeholder="Mong muốn của bạn..."
            rows={2}
            className="w-full px-3 py-2 text-sm rounded-xl border border-orange-200/40 bg-white/10 backdrop-blur-sm text-foreground placeholder:text-muted-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 resize-none"
          />
          <button
            onClick={handleManifest}
            disabled={isManifesting}
            className="w-full py-2.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 shadow-lg"
            style={{ background: "linear-gradient(135deg, #ff9a3c, #ff6eb4)" }}
          >
            {isManifesting ? (
              <Sparkles className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Manifest
          </button>
        </div>

      </div>
    </AppShell>
  );
}
