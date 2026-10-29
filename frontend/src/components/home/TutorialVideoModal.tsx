"use client";

import { PlayCircle } from "lucide-react";
import { type TutorialVideo } from "@/features/tutorials/types";
import { TutorialVideoPlayer } from "@/features/tutorials/TutorialVideoPlayer";
import { useTranslation } from "@/components/LanguageProvider";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface TutorialVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: TutorialVideo | null;
  productTitle?: string;
}

export function TutorialVideoModal({ isOpen, onClose, video, productTitle }: TutorialVideoModalProps) {
  const { t, language } = useTranslation();
  const pending = language === "vi" ? "Video hướng dẫn đang được cập nhật." : "The tutorial video is coming soon.";

  return (
    <Dialog open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-5xl max-h-[92dvh] overflow-y-auto rounded-2xl bg-card p-4 sm:p-6">
        <DialogTitle className="flex items-center justify-center gap-2 px-7 text-center text-base sm:text-lg">
          <PlayCircle className="h-5 w-5 shrink-0 text-blue-500" />
          {video?.headerTitle || t("video.default_header")}
        </DialogTitle>
        <DialogDescription className="sr-only">{productTitle || t("video.default_caption")}</DialogDescription>
        {isOpen && <div className="flex min-h-48 w-full items-center justify-center overflow-hidden rounded-xl bg-muted shadow-lg">
          {!video?.videoUrl ? <p role="status" className="p-8 text-center text-sm text-muted-foreground">{pending}</p>
            : <TutorialVideoPlayer key={video.videoUrl} video={video} language={language} />}
        </div>}
        <div className="space-y-3 py-3 text-center">
          {video?.captionTitle && <h3 className="text-lg font-semibold text-blue-500 sm:text-xl">{video.captionTitle}</h3>}
          {video?.captionDesc && <p className="whitespace-pre-line text-sm text-muted-foreground">{video.captionDesc}</p>}
          {video?.detailUrl && <a href={video.detailUrl} className="block text-sm font-semibold text-primary underline">{language === "vi" ? "Xem thêm hướng dẫn" : "More instructions"}</a>}
          <button onClick={onClose} className="rounded-lg border border-border bg-card px-5 py-2 text-sm font-medium hover:bg-muted">{t("video.close")}</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
