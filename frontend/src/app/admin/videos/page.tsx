"use client";

import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Video, Plus, Pencil, Trash2, Eye, Globe, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { TutorialVideoModal } from "@/components/home/TutorialVideoModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { tutorialRequest } from "@/features/tutorials/api";
import { TUTORIAL_QUERY_KEY, tutorialFormError, type TutorialVideo } from "@/features/tutorials/types";
import { TutorialVideoPlayer } from "@/features/tutorials/TutorialVideoPlayer";
import { useTutorialVideo } from "@/features/tutorials/useTutorialVideo";

const emptyForm = { headerTitle: "", videoUrl: "", captionTitle: "", captionDesc: "", detailUrl: "" };

export default function AdminVideosPage() {
  const query = useTutorialVideo();
  const client = useQueryClient();
  const video = query.data?.video;
  const [form, setForm] = useState<TutorialVideo>(emptyForm);
  const [revision, setRevision] = useState(0);
  const [editing, setEditing] = useState(false);
  const [deletingRevision, setDeletingRevision] = useState<number | null>(null);
  const [preview, setPreview] = useState<TutorialVideo | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const available = !!query.data && !query.isError && !query.isFetching;

  function edit() {
    if (!available) return;
    setForm(video ?? emptyForm);
    setRevision(query.data!.revision);
    setError(""); setEditing(true);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    const validation = tutorialFormError(form);
    if (validation) { setError(validation); return; }
    setBusy(true); setError("");
    try {
      await client.cancelQueries({ queryKey: TUTORIAL_QUERY_KEY });
      const result = await tutorialRequest({ method: "PUT", body: JSON.stringify({ ...form, revision }) });
      client.setQueryData(TUTORIAL_QUERY_KEY, result);
      setEditing(false);
      toast.success("Đã cập nhật video cho tất cả loại thiệp.");
    } catch (error) { setError(error instanceof Error ? error.message : "Không lưu được video."); }
    finally { setBusy(false); }
  }

  async function remove() {
    if (busy || deletingRevision === null) return;
    setBusy(true); setError("");
    try {
      await client.cancelQueries({ queryKey: TUTORIAL_QUERY_KEY });
      const result = await tutorialRequest({ method: "DELETE", revision: deletingRevision });
      client.setQueryData(TUTORIAL_QUERY_KEY, result);
      setDeletingRevision(null); setPreview(null);
      toast.success("Đã gỡ video hướng dẫn khỏi tất cả loại thiệp.");
    } catch (error) { setError(error instanceof Error ? error.message : "Không xóa được video."); }
    finally { setBusy(false); }
  }

  const inputClass = "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30";
  const actionClass = "inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted disabled:opacity-50";
  return <div className="mx-auto max-w-6xl space-y-6 pb-12">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="flex items-center gap-3 font-display text-2xl font-extrabold sm:text-3xl"><Video className="h-8 w-8 text-primary" /> Quản lý video hướng dẫn</h1>
        <p className="mt-2 text-sm text-muted-foreground">Thêm, chỉnh sửa một lần để áp dụng cho toàn bộ loại thiệp.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => { void query.refetch(); }} disabled={busy || query.isFetching} className={actionClass}><RefreshCw className="h-4 w-4" /> Tải lại</button>
        <button type="button" onClick={edit} disabled={busy || !available} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-50">
          {video ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{video ? "Chỉnh sửa video" : "Thêm video"}
        </button>
      </div>
    </div>
    <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-5">
      <Globe className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      <div><p className="font-semibold">Áp dụng cho tất cả loại thiệp</p><p className="mt-1 text-sm text-muted-foreground">Các mẫu thiệp hiện tại và mẫu được thêm sau này đều dùng video này. Không cần cấu hình riêng cho từng mẫu.</p></div>
    </div>
    {query.isError && <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{query.error.message} Nhấn “Tải lại” để thử lại.</div>}
    <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm" aria-labelledby="shared-video-heading">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-5">
        <h2 id="shared-video-heading" className="text-lg font-bold">Video hướng dẫn chung</h2>
        {!query.isPending && !query.isError && <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${video ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-amber-500/10 text-amber-700 dark:text-amber-400"}`}>{video ? "Đã cấu hình" : "Chưa có video"}</span>}
      </div>
      {query.isPending ? <div role="status" className="flex items-center justify-center gap-2 p-16 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Đang tải video…</div>
        : video ? <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex min-h-48 items-center justify-center overflow-hidden rounded-2xl bg-muted">
            <TutorialVideoPlayer key={`${query.data?.revision}:${video.videoUrl}`} video={video} />
          </div>
          <div className="min-w-0 space-y-4">
            <h3 className="break-words text-xl font-bold">{video.headerTitle}</h3>
            {video.captionTitle && <p className="font-semibold">{video.captionTitle}</p>}
            {video.captionDesc && <p className="whitespace-pre-line break-words text-sm text-muted-foreground">{video.captionDesc}</p>}
            <div className="rounded-xl bg-muted/50 p-3"><p className="mb-1 text-xs font-semibold text-muted-foreground">Đường dẫn video</p><p className="break-all font-mono text-xs">{video.videoUrl}</p></div>
            {video.detailUrl && <p className="break-all text-sm text-muted-foreground">Liên kết xem thêm: <a href={video.detailUrl} className="text-primary underline">{video.detailUrl}</a></p>}
            {query.data && <p className="text-xs text-muted-foreground">Cập nhật: {new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(query.data.updatedAt))}</p>}
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setPreview(video)} className={actionClass}><Eye className="h-4 w-4" /> Xem như khách hàng</button>
              <button type="button" disabled={busy || !available} onClick={() => { setError(""); setDeletingRevision(query.data!.revision); }} className={`${actionClass} border-destructive/20 text-destructive hover:bg-destructive/10`}><Trash2 className="h-4 w-4" /> Xóa video</button>
            </div>
          </div>
        </div> : !query.isError && <div className="space-y-4 px-6 py-16 text-center">
          <Video className="mx-auto h-12 w-12 text-muted-foreground/50" /><h3 className="text-lg font-semibold">Chưa có video hướng dẫn</h3>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">Thêm một video để khách hàng xem hướng dẫn trên tất cả loại thiệp.</p>
          <button type="button" onClick={edit} disabled={!available} className={actionClass}><Plus className="h-4 w-4" /> Thêm video</button>
        </div>}
    </section>
    <Dialog open={editing && preview === null} onOpenChange={open => { if (!busy && !preview) { setEditing(open); setError(""); } }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-3xl sm:max-w-xl">
        <DialogHeader><DialogTitle>{video ? "Chỉnh sửa video hướng dẫn" : "Thêm video hướng dẫn"}</DialogTitle><DialogDescription>Thay đổi này áp dụng cho tất cả loại thiệp.</DialogDescription></DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <fieldset disabled={busy} className="space-y-4 disabled:opacity-60">
            <label className="block space-y-1.5 text-sm font-semibold"><span>Tiêu đề video *</span><input required maxLength={160} value={form.headerTitle} onChange={e => setForm({ ...form, headerTitle: e.target.value })} className={inputClass} placeholder="Ví dụ: Hướng dẫn cá nhân hóa và thanh toán thiệp" /></label>
            <label className="block space-y-1.5 text-sm font-semibold"><span>Đường dẫn video *</span><input required maxLength={2048} value={form.videoUrl} onChange={e => setForm({ ...form, videoUrl: e.target.value })} className={inputClass} placeholder="https://www.youtube.com/watch?v=... hoặc /videos/...mp4" /><span className="block text-xs font-normal text-muted-foreground">Hỗ trợ đường dẫn MP4, WebM hoặc video YouTube.</span></label>
            <label className="block space-y-1.5 text-sm font-semibold"><span>Tiêu đề mô tả</span><input maxLength={160} value={form.captionTitle ?? ""} onChange={e => setForm({ ...form, captionTitle: e.target.value })} className={inputClass} /></label>
            <label className="block space-y-1.5 text-sm font-semibold"><span>Nội dung hướng dẫn</span><textarea maxLength={2000} rows={3} value={form.captionDesc ?? ""} onChange={e => setForm({ ...form, captionDesc: e.target.value })} className={inputClass} /></label>
            <label className="block space-y-1.5 text-sm font-semibold"><span>Liên kết xem thêm</span><input maxLength={2048} value={form.detailUrl ?? ""} onChange={e => setForm({ ...form, detailUrl: e.target.value })} className={inputClass} placeholder="/shop hoặc https://..." /></label>
          </fieldset>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" disabled={busy || !form.videoUrl.trim() || !form.headerTitle.trim()} onClick={() => { const validation = tutorialFormError(form); if (validation) setError(validation); else { setError(""); setPreview({ ...form, videoUrl: form.videoUrl.trim(), detailUrl: form.detailUrl?.trim() }); } }} className={actionClass}><Eye className="h-4 w-4" /> Xem trước</button>
            <button type="button" disabled={busy} onClick={() => { setEditing(false); setError(""); }} className={actionClass}>Hủy</button>
            <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50">{busy && <Loader2 className="h-4 w-4 animate-spin" />}Lưu cho tất cả thiệp</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    <AlertDialog open={deletingRevision !== null} onOpenChange={open => { if (!busy && !open) { setDeletingRevision(null); setError(""); } }}>
      <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Xóa video hướng dẫn chung?</AlertDialogTitle><AlertDialogDescription>Video hướng dẫn sẽ bị gỡ khỏi tất cả loại thiệp. Khách hàng sẽ không thấy nút xem hướng dẫn cho đến khi bạn thêm video mới.</AlertDialogDescription></AlertDialogHeader>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <AlertDialogFooter><AlertDialogCancel disabled={busy}>Hủy</AlertDialogCancel><button type="button" onClick={remove} disabled={busy} className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Đang xóa…" : "Xóa cho tất cả thiệp"}</button></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    <TutorialVideoModal isOpen={preview !== null} onClose={() => setPreview(null)} video={preview} />
  </div>;
}
