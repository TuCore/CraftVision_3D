"use client";

import { AppShell } from "@/components/AppShell";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Send, Sparkles } from "lucide-react";
import axios from "axios";

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
    setIsBursting(true);
    setTimeout(() => setIsBursting(false), 800);

    try {
      const res = await axios.post(`${apiUrl}/api/manifest`, { email, wishText: wish });
      const { totalWishes } = res.data;
      setWishCount(totalWishes);
      setNewFlowerIndex(totalWishes - 1);
      setTimeout(() => setNewFlowerIndex(null), 1000);
      toast.success("Lời nguyện ước đã bay lên vũ trụ! ✨ Kiểm tra email của bạn nhé.");
      setWish("");
    } catch {
      // Offline demo mode: still show the animation
      const next = wishCount + 1;
      setWishCount(next);
      setNewFlowerIndex(next - 1);
      setTimeout(() => setNewFlowerIndex(null), 1000);
      toast.success("Nguyện ước của bạn đã được gửi! ✨");
      setWish("");
    } finally {
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
        .ring-spin { animation: portalSpin 12s linear infinite; transform-origin: 50% 50%; transform-box: fill-box; }
        .ring-spin-r { animation: portalSpinReverse 18s linear infinite; transform-origin: 50% 50%; transform-box: fill-box; }
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
