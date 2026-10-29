"use client";

import { useState } from "react";
import { youtubeEmbedUrl, type TutorialVideo } from "./types";

export function TutorialVideoPlayer({ video, language = "vi" }: { video: TutorialVideo; language?: string }) {
  const [failed, setFailed] = useState(false);
  const embedUrl = youtubeEmbedUrl(video.videoUrl);
  if (failed) return <p role="alert" className="p-8 text-center text-sm text-muted-foreground">
    {language === "vi" ? "Không tải được video. Vui lòng kiểm tra đường dẫn hoặc thử lại sau." : "The video could not be loaded. Please try again later."}
  </p>;
  return embedUrl ? <iframe title={video.headerTitle} src={embedUrl} className="aspect-video w-full max-h-[60dvh]"
    allow="encrypted-media; picture-in-picture" allowFullScreen onError={() => setFailed(true)} />
    : <video controls playsInline preload="metadata" aria-label={video.headerTitle} className="w-full max-h-[60dvh] bg-black object-contain"
      src={video.videoUrl} onError={() => setFailed(true)}>
      {language === "vi" ? "Trình duyệt của bạn không hỗ trợ video." : "Your browser does not support video."}
    </video>;
}
