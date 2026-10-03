"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, PlayCircle, Film, ExternalLink } from "lucide-react";
import { TemplateVideo } from "@/data/templateProducts";
import { useTranslation } from "@/components/LanguageProvider";

interface TutorialVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: TemplateVideo | null;
  productTitle?: string;
}

export function TutorialVideoModal({
  isOpen,
  onClose,
  video,
  productTitle,
}: TutorialVideoModalProps) {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !video || !isMounted) return null;

  // Helper to extract YouTube embed URL if applicable
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    }
    return null;
  };

  const embedUrl = getEmbedUrl(video.videoUrl);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div className="relative w-full max-w-2xl bg-card rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col my-auto z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card/80 backdrop-blur-md">
          <div className="flex items-center gap-2 text-blue-500 font-bold text-base sm:text-lg">
            <PlayCircle className="w-5 h-5 shrink-0" />
            <span className="truncate text-foreground">
              {video.headerTitle || t("video.default_header")}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label={t("video.close")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Area */}
        <div className="p-4 sm:p-6 bg-muted/30 flex flex-col items-center justify-center">
          <div className="w-full max-w-[420px] rounded-2xl overflow-hidden bg-black shadow-xl border border-black/10 flex items-center justify-center">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                className="w-full aspect-[9/16] sm:aspect-video rounded-2xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                ref={videoRef}
                controls
                autoPlay
                playsInline
                preload="metadata"
                className="w-full max-h-[55vh] object-contain rounded-2xl bg-black"
                src={video.videoUrl}
              >
                Trình duyệt của bạn không hỗ trợ thẻ video.
              </video>
            )}
          </div>
        </div>

        {/* Caption & Actions Footer (Matching Image 1) */}
        <div className="p-5 sm:p-6 bg-card text-center space-y-4 border-t border-border/50">
          <div className="space-y-1.5 max-w-lg mx-auto">
            <h3 className="text-base sm:text-lg font-bold text-blue-500 flex items-center justify-center gap-2">
              <span className="text-xl">🎬</span>
              <span>{video.captionTitle || t("video.default_caption")}</span>
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {video.captionDesc || t("video.default_desc")}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <a
              href={video.detailUrl || "/checkout"}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>{t("video.view_detail")}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
            <button
              onClick={onClose}
              className="border border-border bg-card hover:bg-muted text-foreground font-medium text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              {t("video.close")}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
