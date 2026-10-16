import type { MusicTrack } from "./types";

export async function musicRequest<T = MusicTrack[]>(path = "/tracks", options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`/api/music${path}`, { ...options, headers, cache: "no-store" });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = response.status === 401 ? "Vui lòng đăng nhập để quản lý nhạc nền."
      : response.status === 403 ? "Chỉ tài khoản quản trị viên mới được quản lý nhạc nền."
      : response.status === 413 ? "Tệp nhạc quá lớn. Giới hạn 15 MB (host triển khai có thể giới hạn thấp hơn)."
      : body.message || "Không thể xử lý nhạc nền. Vui lòng thử lại.";
    throw new Error(message);
  }
  return response.status === 204 ? undefined as T : response.json();
}
