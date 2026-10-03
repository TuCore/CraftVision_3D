"use client";

import { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";
import { Language } from "@/lib/dictionaries";

export function FlagVN({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 640 480"
      className={`shrink-0 rounded-[2px] shadow-xs object-cover overflow-hidden ${className}`}
      aria-label="Tiếng Việt"
      role="img"
    >
      <rect width="640" height="480" fill="#da251d" />
      <polygon
        points="320,84 357.7,200.2 479.9,200.2 381.1,272 418.8,388.2 320,316.4 221.2,388.2 258.9,272 160.1,200.2 282.3,200.2"
        fill="#ffff00"
      />
    </svg>
  );
}

export function FlagUK({ className = "w-5 h-3.5" }: { className?: string }) {
  const baseId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const clipId = `uk_clip_${baseId}`;
  const diagId = `uk_diag_${baseId}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 60 30"
      className={`shrink-0 rounded-[2px] shadow-xs object-cover overflow-hidden ${className}`}
      aria-label="English"
      role="img"
    >
      <defs>
        <clipPath id={clipId}>
          <path d="M0,0 v30 h60 v-30 z" />
        </clipPath>
        <clipPath id={diagId}>
          <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#ffffff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${diagId})`} stroke="#c8102e" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#ffffff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#c8102e" strokeWidth="6" />
      </g>
    </svg>
  );
}

interface LanguageSwitcherProps {
  isTransparentNav?: boolean;
  className?: string;
  align?: "left" | "right";
}

export function LanguageSwitcher({
  isTransparentNav = false,
  className = "",
  align = "right",
}: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const languages: { code: Language; name: string; short: string; Flag: typeof FlagVN }[] = [
    {
      code: "vi",
      name: "Tiếng Việt",
      short: "VI",
      Flag: FlagVN,
    },
    {
      code: "en",
      name: "English",
      short: "EN",
      Flag: FlagUK,
    },
  ];

  const currentLang = languages.find((l) => l.code === language) || languages[0];
  const CurrentFlag = currentLang.Flag;

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative inline-flex items-center gap-1.5 sm:gap-2 rounded-xl px-2.5 py-2 text-xs font-bold transition-all duration-300 ${
          isTransparentNav
            ? "bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-sm"
            : "bg-card/70 hover:bg-card text-foreground border border-border/70 shadow-soft hover:shadow-md"
        }`}
        aria-label="Thay đổi ngôn ngữ"
        aria-expanded={isOpen}
      >
        <CurrentFlag className="w-5 h-3.5 border border-black/10 rounded-[2px]" />
        <span className="font-semibold tracking-wider">{currentLang.short}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 opacity-70 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } mt-2 w-44 rounded-2xl p-1.5 shadow-2xl border backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150 ${
            isTransparentNav
              ? "bg-[#250d1e]/95 border-white/20 text-white shadow-black/50"
              : "bg-card/95 border-border/80 text-foreground shadow-2xl"
          }`}
        >
          <div className="px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {t("nav.language")}
          </div>
          <div className="space-y-1">
            {languages.map((item) => {
              const isSelected = language === item.code;
              const Flag = item.Flag;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setLanguage(item.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? isTransparentNav
                        ? "bg-white/20 text-white font-bold"
                        : "bg-primary/10 text-primary font-bold"
                      : isTransparentNav
                        ? "text-white/80 hover:bg-white/10 hover:text-white"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Flag className="w-5 h-3.5 border border-black/10 rounded-[2px]" />
                    <span>{item.name}</span>
                  </span>
                  {isSelected && (
                    <Check className={`h-3.5 w-3.5 ${isTransparentNav ? "text-amber-300" : "text-primary"}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
