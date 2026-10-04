import { fieldsFor, cardTemplates, type CardDraft } from "./catalog";
import { parseDraft } from "./storage";

export interface ServerCard { id: string; revision: number; draft: CardDraft; updatedAt: string; publishedAt: string | null; sharePath: string | null }
export async function cardRequest<T>(path: string, options: RequestInit = {}, authenticated = true): Promise<T> {
  const headers = new Headers(options.headers);
  if (authenticated) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Vui lòng đăng nhập để lưu thiệp lên server.");
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (options.body && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const response = await fetch(`/api/cards${path}`, { ...options, headers, cache: "no-store" });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(response.status === 401 ? "Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại; bản nháp vẫn còn trên thiết bị." : error.message || "Không thể kết nối dịch vụ lưu thiệp. Vui lòng thử lại.");
  }
  return response.json() as Promise<T>;
}
const mediaPath = /^\/api\/cards\/media\/[0-9a-f-]{36}$/i;
function dataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error("Không thể đọc media.")); reader.readAsDataURL(blob); });
}
/** Only known media fields can be uploaded or downloaded; arbitrary URLs never get fetched. */
async function mapMedia(draft: CardDraft, convert: (value: string) => Promise<string>): Promise<CardDraft> {
  const template = cardTemplates.find(t => t.slug === draft.template);
  if (!template) throw new Error("Mẫu thiệp không được hỗ trợ.");
  const next = structuredClone(draft);
  for (const field of fieldsFor(template)) {
    const value = next.values[field.key];
    if ((field.type === "image" || field.type === "audio") && typeof value === "string" && value) next.values[field.key] = await convert(value);
    if (field.type === "images" && Array.isArray(value)) next.values[field.key] = await Promise.all(value.map(v => convert(String(v))));
  }
  return next;
}
export async function uploadDraft(draft: CardDraft): Promise<CardDraft> {
  return mapMedia(parseDraft(draft), async value => {
    if (!value.startsWith("data:")) throw new Error("Media của bản nháp không hợp lệ.");
    const blob = await (await fetch(value)).blob();
    const body = new FormData(); body.append("file", blob, "card-media");
    return (await cardRequest<{ url: string }>("/media", { method: "POST", body })).url;
  });
}
export async function downloadDraft(raw: CardDraft): Promise<CardDraft> {
  const draft = parseDraft(raw, true);
  return parseDraft(await mapMedia(draft, async value => {
    if (!mediaPath.test(value)) throw new Error("Đường dẫn media không hợp lệ.");
    const response = await fetch(value, { headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` }, cache: "no-store" });
    if (!response.ok) throw new Error("Không tải được ảnh/nhạc từ bản nháp trên server.");
    return dataUrl(await response.blob());
  }));
}
