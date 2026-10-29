import { getAccessToken } from "@/lib/authSession";
import type { TutorialConfiguration } from "./types";

export async function tutorialRequest({ revision, ...options }: RequestInit & { revision?: number } = {}): Promise<TutorialConfiguration> {
  const headers = new Headers(options.headers);
  if (options.method && options.method !== "GET") {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (options.body) headers.set("Content-Type", "application/json");
  }
  const query = options.method === "DELETE" ? `?revision=${revision}` : "";
  const response = await fetch(`/api/tutorial-video${query}`, {
    ...options, headers, cache: "no-store",
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(response.status === 401 ? "Vui lòng đăng nhập lại để quản lý video."
      : response.status === 403 ? "Chỉ quản trị viên được phép thay đổi video hướng dẫn."
      : body.message || "Không tải được video hướng dẫn. Vui lòng thử lại.");
  }
  return response.json();
}
