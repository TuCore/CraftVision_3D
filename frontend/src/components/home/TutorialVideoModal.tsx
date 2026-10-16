"use client";

import { useState } from "react";
import { PlayCircle } from "lucide-react";
import { type TemplateVideo } from "@/data/templateProducts";
import { useTranslation } from "@/components/LanguageProvider";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface TutorialVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: TemplateVideo | null;
  productTitle?: string;
}

export function TutorialVideoModal({ isOpen, onClose, video, productTitle }: TutorialVideoModalProps) {
  const { t, language } = useTranslation();
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const match = video?.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  const embedUrl = match ? `https://www.youtube.com/embed/${match[1]}` : null;
  const pending = language === "vi" ? "Video hướng dẫn đang được cập nhật." : "The tutorial video is coming soon.";
  const failed = language === "vi" ? "Không tải được video. Vui lòng thử lại sau." : "The video could not be loaded. Please try again later.";

  return (
    <Dialog open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-5xl max-h-[92dvh] overflow-y-auto rounded-2xl bg-card p-4 sm:p-6">
        <DialogTitle className="flex items-center justify-center gap-2 px-7 text-center text-base sm:text-lg">
          <PlayCircle className="h-5 w-5 shrink-0 text-blue-500" />
          {video?.headerTitle || t("video.default_header")}
        </DialogTitle>
        <DialogDescription className="sr-only">{productTitle || t("video.default_caption")}</DialogDescription>
        {isOpen && <div className="flex min-h-48 w-full items-center justify-center overflow-hidden rounded-xl bg-muted shadow-lg">
          {!video?.videoUrl ? <p role="status" className="p-8 text-center text-sm text-muted-foreground">{pending}</p> : embedUrl ? (
            <iframe title={video.headerTitle || t("video.default_header")} src={embedUrl} className="aspect-video w-full max-h-[60dvh]" allow="encrypted-media; picture-in-picture" allowFullScreen />
          ) : failedUrl === video.videoUrl ? <p role="alert" className="p-8 text-center text-sm text-muted-foreground">{failed}</p> : (
            <video key={video.videoUrl} controls playsInline preload="metadata" aria-label={video.headerTitle || t("video.default_header")} className="w-full max-h-[60dvh] bg-black object-contain" src={video.videoUrl} onError={() => setFailedUrl(video.videoUrl)}>
              {language === "vi" ? "Trình duyệt của bạn không hỗ trợ video." : "Your browser does not support video."}
            </video>
          )}
        </div>}
        <div className="space-y-3 py-3 text-center">
          <h3 className="text-lg font-semibold text-blue-500 sm:text-xl">🎬 {video?.captionTitle || t("video.default_caption")}</h3>
          <p className="text-sm text-muted-foreground">{video?.captionDesc || t("video.default_desc")}</p>
          <button onClick={onClose} className="rounded-lg border border-border bg-card px-5 py-2 text-sm font-medium hover:bg-muted">{t("video.close")}</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
