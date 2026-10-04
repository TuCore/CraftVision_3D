import { cardTemplates, defaultDraft, fieldsFor, type CardDraft, type CardValue } from "./catalog";

function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("craftvision-card-drafts", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("drafts");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function saveDraft(draft: CardDraft) {
  const db = await database();
  try { await new Promise<void>((resolve, reject) => { const tx = db.transaction("drafts", "readwrite"); tx.objectStore("drafts").put(draft, draft.template); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error); }); }
  finally { db.close(); }
}
export async function readDraft(slug: string): Promise<CardDraft | null> {
  const db = await database();
  try { return await new Promise((resolve, reject) => { const request = db.transaction("drafts").objectStore("drafts").get(slug); request.onsuccess = () => { try { resolve(request.result ? parseDraft(request.result) : null); } catch { resolve(null); } }; request.onerror = () => reject(request.error); }); }
  finally { db.close(); }
}

/** Rebuild imported data from the known schema; never trust arbitrary file keys. */
export function parseDraft(raw: unknown, serverMedia = false): CardDraft {
  if (!raw || typeof raw !== "object") throw new Error("Tệp thiệp không hợp lệ.");
  const input = raw as Partial<CardDraft>;
  const template = cardTemplates.find(card => card.slug === input.template);
  if (input.version !== 1 || !template || !input.values || typeof input.values !== "object") throw new Error("Không nhận diện được phiên bản hoặc mẫu thiệp.");
  const draft = defaultDraft(template);
  for (const field of fieldsFor(template)) {
    const value: unknown = input.values[field.key];
    if (value === undefined) continue;
    let clean: CardValue;
    if (field.type === "list") {
      if (!Array.isArray(value) || value.length > (field.max || 12)) throw new Error(`Dữ liệu ${field.label} không hợp lệ.`);
      clean = value.map(row => { if (!row || typeof row !== "object") throw new Error("Mục danh sách không hợp lệ."); return Object.fromEntries((field.columns || []).map(column => [column, String(row[column] || "").slice(0, 500)])); });
    } else if (field.type === "images") {
      if (!Array.isArray(value) || value.length > (field.max || 12)) throw new Error("Album không hợp lệ.");
      clean = value.map(item => safeImage(item, serverMedia));
    } else if (field.type === "image") clean = value ? safeImage(value, serverMedia) : "";
    else if (field.type === "audio") {
      if (typeof value !== "string" || value.length > 12_000_000 || (value && !(serverMedia ? isServerMedia(value) : /^data:audio\/(mpeg|mp3|wav|x-wav|ogg);base64,[A-Za-z0-9+/=]+$/.test(value)))) throw new Error("Nhạc nền không hợp lệ.");
      clean = value;
    }
    else {
      if (typeof value !== "string" || value.length > 5000) throw new Error(`Dữ liệu ${field.label} không hợp lệ.`);
      if (field.type === "color" && value && !/^#[0-9a-f]{6}$/i.test(value)) throw new Error("Màu không hợp lệ.");
      if (field.type === "select" && !field.options?.includes(value)) throw new Error("Lựa chọn không hợp lệ.");
      clean = value;
    }
    draft.values[field.key] = clean;
  }
  return draft;
}
function isServerMedia(value: string) { return /^\/api\/cards\/media\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value); }
function safeImage(value: unknown, serverMedia = false): string {
  if (typeof value !== "string" || value.length > 3_000_000 || !(serverMedia ? isServerMedia(value) : /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value))) throw new Error("Ảnh không hợp lệ; chỉ nhận PNG, JPEG hoặc WebP.");
  return value;
}
export function importAudio(file: File): Promise<string> {
  if (!["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/ogg"].includes(file.type) || file.size > 8 * 1024 * 1024) return Promise.reject(new Error("Chọn MP3, WAV hoặc OGG không quá 8 MB."));
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error("Không thể đọc nhạc.")); reader.readAsDataURL(file); });
}
export async function importPhoto(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 8 * 1024 * 1024) throw new Error("Chọn ảnh JPG, PNG hoặc WebP không quá 8 MB.");
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas"); const ratio = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.round(bitmap.width * ratio); canvas.height = Math.round(bitmap.height * ratio);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", .82);
  } finally { bitmap.close(); }
}
