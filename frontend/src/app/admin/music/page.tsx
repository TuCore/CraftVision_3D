"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Music2, Pencil, Plus, RefreshCw, Trash2, Upload } from "lucide-react";
import { musicRequest } from "@/features/music/api";
import { MUSIC_MAX_BYTES, MUSIC_UPDATED_EVENT, type MusicTrack } from "@/features/music/types";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";

const emptyForm = { title: "", audioUrl: "", isEnabled: true, sortOrder: 0 };

export default function AdminMusicPage() {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<MusicTrack | null>(null);
  const [source, setSource] = useState<"file" | "url">("file");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleting, setDeleting] = useState<MusicTrack | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const titleInput = useRef<HTMLInputElement>(null);

  async function reload() {
    setLoading(true);
    setError("");
    try { setTracks(await musicRequest()); setAvailable(true); }
    catch (error) { setError(error instanceof Error ? error.message : "Không tải được danh sách nhạc."); setAvailable(false); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    const controller = new AbortController();
    musicRequest("/tracks", { signal: controller.signal }).then(data => {
      setTracks(data); setAvailable(true);
    }).catch(error => {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Không tải được danh sách nhạc.");
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  function reset() {
    setEditing(null); setForm(emptyForm); setSource("file"); setFile(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  function edit(track: MusicTrack) {
    setEditing(track);
    setForm({ title: track.title, audioUrl: track.sourceUrl ?? "", isEnabled: track.isEnabled, sortOrder: track.sortOrder });
    setSource(track.sourceUrl ? "url" : "file"); setFile(null); setError(""); setNotice("");
    if (fileInput.current) fileInput.current.value = "";
    titleInput.current?.focus();
    titleInput.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (busy || !available) return;
    setError(""); setNotice("");
    if (source === "file" && file && file.size > MUSIC_MAX_BYTES) { setError("Tệp nhạc tối đa 15 MB."); return; }
    if (source === "file" && !file && (!editing || editing.sourceUrl)) { setError("Vui lòng chọn tệp nhạc."); return; }
    if (source === "url" && !form.audioUrl.trim()) { setError("Vui lòng nhập đường dẫn audio HTTPS."); return; }
    const body = new FormData();
    body.set("title", form.title.trim()); body.set("isEnabled", String(form.isEnabled)); body.set("sortOrder", String(form.sortOrder));
    if (editing) body.set("revision", String(editing.revision));
    if (source === "file" && file) body.set("file", file);
    if (source === "url") body.set("audioUrl", form.audioUrl.trim());
    setBusy(true);
    try {
      await musicRequest<MusicTrack>(editing ? `/tracks/${editing.id}` : "/tracks", { method: editing ? "PUT" : "POST", body });
      const message = editing ? "Đã cập nhật bài nhạc." : "Đã thêm bài nhạc.";
      reset(); setNotice(message);
      window.dispatchEvent(new Event(MUSIC_UPDATED_EVENT));
      await reload();
    } catch (error) { setError(error instanceof Error ? error.message : "Không lưu được bài nhạc."); }
    finally { setBusy(false); }
  }

  async function remove() {
    if (!deleting || busy) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await musicRequest(`/tracks/${deleting.id}?revision=${deleting.revision}`, { method: "DELETE" });
      if (editing?.id === deleting.id) reset();
      setDeleting(null); setNotice("Đã xóa bài nhạc.");
      window.dispatchEvent(new Event(MUSIC_UPDATED_EVENT));
      await reload();
    } catch (error) { setError(error instanceof Error ? error.message : "Không xóa được bài nhạc."); }
    finally { setBusy(false); }
  }

  const inputClass = "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm";
  return <div className="mx-auto max-w-5xl space-y-6 pb-32">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="flex items-center gap-2 text-2xl font-bold"><Music2 className="text-primary" /> Nhạc nền</h1>
        <p className="mt-2 text-sm text-muted-foreground">Quản lý danh sách nhạc phát xuyên suốt website. Số thứ tự nhỏ hơn được phát trước.</p></div>
      <button type="button" onClick={reload} disabled={busy || loading} className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 disabled:opacity-50"><RefreshCw size={16} /> Tải lại</button>
    </div>
    {error && <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error} <Link href="/auth" className="underline">Đăng nhập</Link></div>}
    {notice && <p role="status" className="rounded-xl bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-400">{notice}</p>}
    <form onSubmit={save} className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <h2 className="font-semibold">{editing ? "Chỉnh sửa bài nhạc" : "Thêm bài nhạc"}</h2>
      <fieldset disabled={busy || !available} className="space-y-4 disabled:opacity-60">
        <label className="block space-y-2 text-sm font-medium"><span>Tên bài nhạc</span>
          <input ref={titleInput} required maxLength={120} value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} className={inputClass} placeholder="Ví dụ: Một ngày dịu dàng" /></label>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2"><input type="radio" name="musicSource" checked={source === "file"} onChange={() => setSource("file")} /> Tải tệp nhạc</label>
          <label className="flex items-center gap-2"><input type="radio" name="musicSource" checked={source === "url"} onChange={() => setSource("url")} /> Đường dẫn audio</label>
        </div>
        {source === "file" ? <label className="block space-y-2 text-sm"><span className="flex items-center gap-2"><Upload size={16} /> MP3, WAV hoặc OGG · tối đa 15 MB</span>
          <input ref={fileInput} type="file" accept=".mp3,.wav,.ogg,audio/mpeg,audio/wav,audio/ogg" onChange={event => setFile(event.target.files?.[0] ?? null)} className={inputClass} />
          {editing && !editing.sourceUrl && <span className="block text-xs text-muted-foreground">Không chọn tệp mới để giữ nguyên bài nhạc hiện tại.</span>}
        </label> : <label className="block space-y-2 text-sm"><span>Đường dẫn trực tiếp đến tệp nhạc (HTTPS)</span>
          <input type="url" required maxLength={2048} value={form.audioUrl} onChange={event => setForm({ ...form, audioUrl: event.target.value })} className={inputClass} placeholder="https://…/music.mp3" />
          <span className="block text-xs text-muted-foreground">Dùng link audio công khai, không dùng link trang YouTube hoặc Spotify.</span>
        </label>}
        <div className="flex flex-wrap items-end gap-6">
          <label className="block space-y-2 text-sm"><span>Thứ tự phát</span><input type="number" min={0} max={10000} step={1} required value={form.sortOrder} onChange={event => setForm({ ...form, sortOrder: Number(event.target.value) })} className={inputClass} /></label>
          <label className="flex items-center gap-2 py-2 text-sm"><input type="checkbox" checked={form.isEnabled} onChange={event => setForm({ ...form, isEnabled: event.target.checked })} /> Phát trên website</label>
        </div>
        <div className="flex gap-3"><button type="submit" className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-semibold text-primary-foreground"><Plus size={16} />{busy ? "Đang lưu…" : editing ? "Lưu thay đổi" : "Thêm bài nhạc"}</button>
          {editing && <button type="button" onClick={reset} className="rounded-xl border border-border px-4 py-2">Hủy chỉnh sửa</button>}</div>
      </fieldset>
    </form>
    <section aria-label="Danh sách nhạc" className="space-y-3">
      <h2 className="font-semibold">Danh sách bài nhạc ({tracks.length})</h2>
      {loading ? <p role="status" className="text-sm text-muted-foreground">Đang tải danh sách…</p> : available && !tracks.length ? <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">Chưa có bài nhạc. Thêm bài đầu tiên để bật nhạc nền trên website.</p> : null}
      {tracks.map(track => <article key={track.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
        <div className="min-w-0 flex-1"><h3 className="break-words font-semibold">{track.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">Thứ tự {track.sortOrder} · {track.isEnabled ? "Đang bật" : "Đang tắt"} · {track.sourceUrl ? "Đường dẫn audio" : "Tệp đã tải lên"}</p></div>
        <div className="flex gap-2"><button type="button" disabled={busy} onClick={() => edit(track)} aria-label={`Sửa ${track.title}`} className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm"><Pencil size={15} /> Sửa</button>
          <button type="button" disabled={busy} onClick={() => setDeleting(track)} aria-label={`Xóa ${track.title}`} className="flex items-center gap-2 rounded-xl border border-destructive/30 px-3 py-2 text-sm text-destructive"><Trash2 size={15} /> Xóa</button></div>
      </article>)}
    </section>
    <AlertDialog open={!!deleting} onOpenChange={open => { if (!open && !busy) setDeleting(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Xóa bài nhạc “{deleting?.title}”?</AlertDialogTitle>
        <AlertDialogDescription>Bài nhạc và tệp đã tải lên sẽ bị xóa khỏi danh sách. Thao tác này không thể hoàn tác.</AlertDialogDescription></AlertDialogHeader>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <AlertDialogFooter><AlertDialogCancel disabled={busy}>Giữ lại</AlertDialogCancel><button type="button" disabled={busy} onClick={remove} className="rounded-xl bg-destructive px-4 py-2 text-white">{busy ? "Đang xóa…" : "Xóa bài nhạc"}</button></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>;
}
