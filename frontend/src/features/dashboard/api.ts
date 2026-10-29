import { getAccessToken } from "@/lib/authSession";
import type { ReportFilters } from "./types";

export function reportParams(filters: ReportFilters): string {
  return new URLSearchParams({ from: filters.from, to: filters.to, kind: filters.kind, method: filters.method, groupBy: filters.groupBy }).toString();
}

export async function dashboardResponse(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body) headers.set("Content-Type", "application/json");
  const response = await fetch(`/api/admin/${path}`, { ...options, headers, cache: "no-store" });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(response.status === 401 ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
      : response.status === 403 ? "Chỉ quản trị viên được xem báo cáo hệ thống."
      : body.message || "Không tải được báo cáo. Vui lòng thử lại.");
  }
  return response;
}
export async function dashboardRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await dashboardResponse(`dashboard/${path}`, options);
  return response.status === 204 ? undefined as T : response.json();
}
