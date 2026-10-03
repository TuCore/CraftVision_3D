"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Headphones, Check } from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !isMounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-card rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col my-auto z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-2 text-blue-500 font-bold text-lg">
            <Headphones className="w-5 h-5 text-blue-500" />
            <span className="text-foreground">{t("support.header")}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 bg-card">
          {/* Main Title Banner */}
          <div className="text-center space-y-2">
            <h2 className="text-lg sm:text-xl font-extrabold font-display text-blue-600 dark:text-blue-400 tracking-tight flex items-center justify-center gap-2">
              <span>⏰</span> {t("support.question_banner")}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
              {t("support.question_desc")}
            </p>
          </div>

          {/* Contact Option 1: Facebook */}
          <a
            href="https://www.facebook.com/profile.php?id=61594809743775"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 rounded-2xl bg-blue-500/10 hover:bg-blue-500/15 border border-blue-400/30 transition-all hover:scale-[1.01] hover:shadow-md group"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#1877F2] dark:text-blue-400">
                    {t("support.fb_title")}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    {t("support.fb_sub")}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform whitespace-nowrap">
                {t("support.fb_cta")}
              </span>
            </div>
            <div className="mt-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 pl-1">
              <span>✨</span> {t("support.fb_perk")}
            </div>
          </a>

          {/* Contact Option 2: TikTok */}
          <a
            href="https://www.tiktok.com/@sixc.ent?is_from_webapp=1&sender_device=pc"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-400/30 transition-all hover:scale-[1.01] hover:shadow-md group"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shrink-0 shadow-sm">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 15.68a6.34 6.34 0 0011.3 3.93v-8.12a8.27 8.27 0 003.29.69v-3.45a4.79 4.79 0 01-2-.04z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-rose-500 dark:text-rose-400">
                    {t("support.tiktok_title")}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    {t("support.tiktok_sub")}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform whitespace-nowrap">
                {t("support.tiktok_cta")}
              </span>
            </div>
            <div className="mt-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 pl-1">
              <span>✨</span> {t("support.tiktok_perk")}
            </div>
          </a>

          {/* Commitment Card */}
          <div className="p-5 rounded-2xl bg-orange-500/10 dark:bg-orange-950/20 border border-orange-400/30 space-y-3">
            <h4 className="text-sm font-bold text-orange-600 dark:text-orange-400 text-center tracking-wider flex items-center justify-center gap-1.5">
              <span>⚡</span> {t("support.commitment_title")}
            </h4>
            <div className="space-y-1.5 text-xs sm:text-sm text-foreground/80 max-w-xs mx-auto">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-orange-500 shrink-0" />
                <span>{t("support.commit_1")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-orange-500 shrink-0" />
                <span>{t("support.commit_2")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-orange-500 shrink-0" />
                <span>{t("support.commit_3")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
