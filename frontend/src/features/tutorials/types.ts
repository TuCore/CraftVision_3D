export interface TutorialVideo {
  headerTitle: string;
  videoUrl: string;
  captionTitle?: string;
  captionDesc?: string;
  detailUrl?: string;
}

export interface TutorialConfiguration {
  video: TutorialVideo | null;
  revision: number;
  updatedAt: string;
}

export const TUTORIAL_QUERY_KEY = ["shared-tutorial-video"] as const;

export function safeTutorialUrl(source: string): boolean {
  const value = source.trim();
  if (!value || value.length > 2048 || /[\u0000-\u001f\u007f\\]/.test(value)) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password &&
      !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  } catch { return false; }
}

export function tutorialFormError(video: TutorialVideo): string | null {
  if (!video.headerTitle.trim() || video.headerTitle.trim().length > 160) return "Tiêu đề phải có từ 1 đến 160 ký tự.";
  if (!safeTutorialUrl(video.videoUrl)) return "Nhập đường dẫn video HTTPS hoặc đường dẫn bắt đầu bằng /.";
  if (video.detailUrl?.trim() && !safeTutorialUrl(video.detailUrl)) return "Liên kết xem thêm phải là HTTPS hoặc đường dẫn bắt đầu bằng /.";
  if ((video.captionTitle?.length ?? 0) > 160 || (video.captionDesc?.length ?? 0) > 2000) return "Nội dung mô tả vượt quá độ dài cho phép.";
  try {
    const url = new URL(video.videoUrl.trim());
    if (["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "www.youtu.be"].includes(url.hostname) && !youtubeEmbedUrl(video.videoUrl.trim()))
      return "Đường dẫn YouTube không hợp lệ. Vui lòng dùng liên kết tới một video.";
  } catch { /* Root-relative media paths do not have a host. */ }
  return null;
}

export function youtubeEmbedUrl(source: string): string | null {
  try {
    const url = new URL(source);
    const host = url.hostname.toLowerCase();
    let id: string | null = null;
    if (host === "youtu.be" || host === "www.youtu.be") id = url.pathname.replace(/^\/|\/$/g, "");
    else if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(host)) {
      id = url.pathname === "/watch" ? url.searchParams.get("v")
        : url.pathname.match(/^\/(?:embed|shorts|v)\/([A-Za-z0-9_-]{11})\/?$/)?.[1] ?? null;
    }
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? `https://www.youtube.com/embed/${id}` : null;
  } catch { return null; }
}
