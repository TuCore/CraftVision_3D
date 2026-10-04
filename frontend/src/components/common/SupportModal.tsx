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

          {/* Contact Option 2: Instagram */}
          <a
            href="https://www.instagram.com/sixc.ent921?stkn=MTNpaDFpZGFicDl2cQ%3D%3D&utm_source=qr"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/15 border border-rose-400/30 transition-all hover:scale-[1.01] hover:shadow-md group"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-rose-500 dark:text-rose-400">
                    {t("support.instagram_title")}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    {t("support.instagram_sub")}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 group-hover:translate-x-1 transition-transform whitespace-nowrap">
                {t("support.instagram_cta")}
              </span>
            </div>
            <div className="mt-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 pl-1">
              <span>✨</span> {t("support.instagram_perk")}
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
