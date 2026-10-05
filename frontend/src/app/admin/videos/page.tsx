'use client';

import React, { useState, useEffect } from 'react';
import { 
  Video, Plus, Edit, Trash2, Play, Search, Eye, Loader2, 
  ExternalLink, CheckCircle2, AlertCircle, Film, Sparkles 
} from 'lucide-react';
import { toast } from 'sonner';
import { INITIAL_TEMPLATE_PRODUCTS, TemplateProduct, TemplateVideo, DEFAULT_TUTORIAL_VIDEO } from '@/data/templateProducts';
import { TutorialVideoModal } from '@/components/home/TutorialVideoModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from '@/components/ui/alert-dialog';

export default function AdminVideosPage() {
  const [templates, setTemplates] = useState<TemplateProduct[]>(INITIAL_TEMPLATE_PRODUCTS);
  const [videoMap, setVideoMap] = useState<Record<number, TemplateVideo>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'has_video' | 'no_video'>('all');

  // Preview Modal
  const [previewVideo, setPreviewVideo] = useState<TemplateVideo | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Edit / Add Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formTemplateId, setFormTemplateId] = useState<number>(1);
  const [formData, setFormData] = useState({
    headerTitle: '',
    videoUrl: '',
    captionTitle: '',
    captionDesc: '',
    detailUrl: '',
  });

  // Delete Dialog
  const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load videos from API
  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/template-videos');
      if (res.ok) {
        const data: Record<number, TemplateVideo> = await res.json();
        setVideoMap(data);
      }
    } catch (error) {
      console.error('Lỗi khi tải video:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Filter templates
  const filteredTemplates = templates.filter((tpl) => {
    const hasVideo = !!videoMap[tpl.id];
    const matchSearch = tpl.title.toLowerCase().includes(search.toLowerCase()) || 
      (videoMap[tpl.id]?.headerTitle || '').toLowerCase().includes(search.toLowerCase());
    
    if (!matchSearch) return false;
    if (filter === 'has_video') return hasVideo;
    if (filter === 'no_video') return !hasVideo;
    return true;
  });

  const totalWithVideo = Object.keys(videoMap).length;

  const handleOpenAdd = (tplId?: number) => {
    const targetId = tplId || templates[0]?.id || 1;
    const existing = videoMap[targetId];
    const targetTpl = templates.find(t => t.id === targetId);

    setFormTemplateId(targetId);
    if (existing) {
      setFormData({
        headerTitle: existing.headerTitle || '',
        videoUrl: existing.videoUrl || '',
        captionTitle: existing.captionTitle || '',
        captionDesc: existing.captionDesc || '',
        detailUrl: existing.detailUrl || '',
      });
    } else {
      setFormData({
        headerTitle: `Video Hướng Dẫn - ${targetTpl?.title || ''}`,
        videoUrl: DEFAULT_TUTORIAL_VIDEO.videoUrl,
        captionTitle: DEFAULT_TUTORIAL_VIDEO.captionTitle,
        captionDesc: DEFAULT_TUTORIAL_VIDEO.captionDesc,
        detailUrl: DEFAULT_TUTORIAL_VIDEO.detailUrl || '/shop',
      });
    }
    setIsEditModalOpen(true);
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.videoUrl) {
      toast.error('Vui lòng nhập đường dẫn video (URL).');
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch('/api/template-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: formTemplateId,
          ...formData,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Lỗi khi lưu video');
      }

      const { video } = await res.json();
      setVideoMap(prev => ({ ...prev, [formTemplateId]: video }));
      toast.success('Đã lưu video hướng dẫn thành công!');
      setIsEditModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Không thể lưu video.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteVideo = async () => {
    if (!templateToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/template-videos?templateId=${templateToDelete}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Lỗi khi xóa video');

      setVideoMap(prev => {
        const next = { ...prev };
        delete next[templateToDelete];
        return next;
      });
      toast.success('Đã xóa video hướng dẫn thành công.');
      setTemplateToDelete(null);
    } catch (error: any) {
      toast.error(error.message || 'Không thể xóa video.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-page pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-foreground flex items-center gap-3">
            <Video className="w-8 h-8 text-primary" /> Quản Lý Video Hướng Dẫn
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">
            Thêm, cập nhật và xóa video hướng dẫn tương ứng với từng mẫu thiết kế trên trang chủ
          </p>
        </div>
        <button
          onClick={() => handleOpenAdd()}
          className="btn-hero px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm hover:scale-105 active:scale-95 transition-all text-black cursor-pointer w-fit"
        >
          <Plus className="w-5 h-5" /> Thêm / Cập Nhật Video
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-border flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase">Tổng số mẫu thiết kế</div>
            <div className="text-2xl font-bold font-display mt-1">{templates.length} mẫu</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Đã có video</div>
            <div className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400 mt-1">{totalWithVideo} mẫu</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-amber-500/20 bg-amber-500/5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase">Chưa cấu hình video</div>
            <div className="text-2xl font-bold font-display text-amber-600 dark:text-amber-400 mt-1">{Math.max(0, templates.length - totalWithVideo)} mẫu</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm theo tên mẫu thiết kế..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'all' ? 'bg-primary text-white' : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            Tất cả ({templates.length})
          </button>
          <button
            onClick={() => setFilter('has_video')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'has_video' ? 'bg-emerald-600 text-white' : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            Đã có video ({totalWithVideo})
          </button>
          <button
            onClick={() => setFilter('no_video')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'no_video' ? 'bg-amber-600 text-white' : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            Chưa có video ({Math.max(0, templates.length - totalWithVideo)})
          </button>
        </div>
      </div>

      {/* Templates & Videos Table */}
      <div className="glass-card rounded-[2rem] overflow-hidden shadow-soft border border-border bg-card">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Đang tải danh sách video...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            Không tìm thấy mẫu thiết kế nào phù hợp.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
                <tr>
                  <th className="py-4 px-6">Mẫu thiết kế</th>
                  <th className="py-4 px-6">Tiêu đề Popup</th>
                  <th className="py-4 px-6">Đường dẫn Video</th>
                  <th className="py-4 px-6">Trạng thái</th>
                  <th className="py-4 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTemplates.map((tpl) => {
                  const video = videoMap[tpl.id];
                  return (
                    <tr key={tpl.id} className="hover:bg-muted/20 transition-colors">
                      {/* Template Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={tpl.image}
                            alt={tpl.title}
                            className="w-12 h-12 rounded-xl object-cover border border-border shrink-0"
                          />
                          <div>
                            <div className="font-bold text-foreground line-clamp-1">{tpl.title}</div>
                            <div className="text-xs text-muted-foreground">Mã ID: #{tpl.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Video Title */}
                      <td className="py-4 px-6">
                        {video ? (
                          <div>
                            <div className="font-semibold text-foreground">{video.headerTitle}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">{video.captionTitle}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Chưa cấu hình</span>
                        )}
                      </td>

                      {/* Video URL & Quick Preview */}
                      <td className="py-4 px-6 max-w-xs">
                        {video ? (
                          <div className="flex items-center gap-2">
                            <span className="truncate font-mono text-xs text-muted-foreground">{video.videoUrl}</span>
                            <button
                              onClick={() => {
                                setPreviewVideo(video);
                                setIsPreviewOpen(true);
                              }}
                              className="p-1 rounded-lg hover:bg-primary/10 text-primary transition-colors shrink-0 cursor-pointer"
                              title="Xem thử video"
                            >
                              <Play className="w-4 h-4 fill-primary" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {video ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Đang hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                            Chưa có video
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {video && (
                            <button
                              onClick={() => {
                                setPreviewVideo(video);
                                setIsPreviewOpen(true);
                              }}
                              className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"
                              title="Xem Popup như khách hàng"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenAdd(tpl.id)}
                            className="p-2 rounded-xl bg-card border border-border hover:bg-muted text-foreground transition-colors cursor-pointer"
                            title={video ? "Cập nhật video" : "Thêm video"}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {video && (
                            <button
                              onClick={() => setTemplateToDelete(tpl.id)}
                              className="p-2 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors cursor-pointer"
                              title="Xóa video"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / Add Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-xl rounded-3xl p-6 bg-card border border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-display flex items-center gap-2">
              <Film className="w-5 h-5 text-primary" />
              {videoMap[formTemplateId] ? 'Cập Nhật Video Hướng Dẫn' : 'Thêm Video Hướng Dẫn Mới'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveVideo} className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                Chọn mẫu thiết kế *
              </label>
              <select
                value={formTemplateId}
                onChange={(e) => {
                  const newId = Number(e.target.value);
                  setFormTemplateId(newId);
                  const existing = videoMap[newId];
                  const tpl = templates.find(t => t.id === newId);
                  if (existing) {
                    setFormData({
                      headerTitle: existing.headerTitle,
                      videoUrl: existing.videoUrl,
                      captionTitle: existing.captionTitle,
                      captionDesc: existing.captionDesc,
                      detailUrl: existing.detailUrl || '',
                    });
                  } else {
                    setFormData(prev => ({
                      ...prev,
                      headerTitle: `Video Hướng Dẫn - ${tpl?.title || ''}`,
                    }));
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
              >
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    #{tpl.id} - {tpl.title} {videoMap[tpl.id] ? '(Đã có video)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                Tiêu đề Header Modal *
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Video Hướng Dẫn Thanh Toán"
                value={formData.headerTitle}
                onChange={(e) => setFormData({ ...formData, headerTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                Đường dẫn Video (MP4 / WebM / Cloudinary / YouTube) *
              </label>
              <input
                type="url"
                required
                placeholder="https://.../video.mp4 hoặc https://youtube.com/watch?v=..."
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30 font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Hỗ trợ link video MP4 trực tiếp, video từ Cloudinary, hoặc link video YouTube.
              </p>
            </div>

            {/* Live Video Preview in Admin Form */}
            {formData.videoUrl && (
              <div className="p-3 bg-muted/30 rounded-2xl border border-border/50 text-center">
                <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center justify-center gap-1.5">
                  <Play className="w-3.5 h-3.5" /> Xem trước video phát:
                </div>
                <div className="max-w-[280px] mx-auto rounded-xl overflow-hidden bg-black shadow-inner">
                  {formData.videoUrl.includes('youtube.com') || formData.videoUrl.includes('youtu.be') ? (
                    <div className="p-4 text-xs text-white">Video YouTube đã liên kết</div>
                  ) : (
                    <video
                      controls
                      playsInline
                      className="max-h-[180px] w-full object-contain mx-auto"
                      src={formData.videoUrl}
                    />
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                Tiêu đề phụ dưới video (Caption) *
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: 🎬 Hướng Dẫn Thanh Toán An Toàn"
                value={formData.captionTitle}
                onChange={(e) => setFormData({ ...formData, captionTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                Mô tả chi tiết *
              </label>
              <textarea
                rows={2}
                required
                placeholder="Ví dụ: Hướng dẫn thanh toán qua PayOS: mở ứng dụng ngân hàng, quét mã QR trên trang thanh toán và kiểm tra thông tin trước khi xác nhận."
                value={formData.captionDesc}
                onChange={(e) => setFormData({ ...formData, captionDesc: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                Đường dẫn nút &quot;Xem Hướng Dẫn Chi Tiết&quot;
              </label>
              <input
                type="text"
                placeholder="/shop hoặc https://..."
                value={formData.detailUrl}
                onChange={(e) => setFormData({ ...formData, detailUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30 text-xs"
              />
            </div>

            <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-xl px-5 py-2.5 text-sm font-medium bg-muted hover:bg-muted/80 text-foreground transition-colors cursor-pointer"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="btn-hero rounded-xl px-6 py-2.5 text-sm font-bold text-black transition-all shadow-coral-glow disabled:opacity-50 cursor-pointer inline-flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Lưu Thay Đổi
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!templateToDelete} onOpenChange={() => setTemplateToDelete(null)}>
        <AlertDialogContent className="rounded-3xl p-6 bg-card border border-destructive/20 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Xác nhận xóa video hướng dẫn
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Bạn có chắc chắn muốn xóa video hướng dẫn của mẫu thiết kế #{templateToDelete}? Thao tác này sẽ xoá video khỏi giao diện khách hàng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel className="rounded-xl">Huỷ</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVideo}
              disabled={isDeleting}
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold"
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa Video'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Real Customer-facing Popup Preview */}
      <TutorialVideoModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        video={previewVideo}
      />
    </div>
  );
}
