"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Download,
  QrCode,
  Layers,
  Award,
  Smartphone,
  Eye,
} from "lucide-react";

export default function AdminShowcasePage() {
  const [showcaseUrl, setShowcaseUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const fullUrl = `${origin}/cards/showcase`;
    setShowcaseUrl(fullUrl);

    // Generate High-Res QR Code
    QRCode.toDataURL(
      fullUrl,
      {
        width: 600,
        margin: 2,
        color: {
          dark: "#1c140d",
          light: "#ffffff",
        },
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, []);

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(showcaseUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = "craftvision-showcase-qrcode.png";
    a.click();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display tracking-tight text-foreground">
                Thiệp 3D Showcase Đồ Án
              </h1>
              <p className="text-sm text-muted-foreground">
                Công cụ lấy Link và Mã QR trình diễn cho Thầy Cô giảng viên & Bạn bè
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/cards/showcase"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition shadow-sm"
          >
            <Eye className="w-4 h-4" />
            <span>Mở xem thiệp 3D</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>
      </div>

      {/* Main Grid: QR & Share Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: QR Code Card */}
        <div className="lg:col-span-5 bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-500 mb-4">
            <QrCode className="w-4 h-4" />
            <span>Mã QR Quét Trên Điện Thoại</span>
          </div>

          {/* QR Display */}
          <div className="relative p-4 bg-white rounded-2xl border border-stone-200 shadow-md my-2">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Mã QR Thiệp 3D Showcase"
                className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-sm text-muted-foreground">
                Đang tạo mã QR...
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-3 max-w-xs leading-relaxed">
            Thầy Cô và Bạn Bè có thể dùng camera điện thoại (iOS / Android / Zalo) quét để mở ngay thiệp 3D mà không cần tải app.
          </p>

          <div className="flex items-center gap-3 mt-6 w-full">
            <button
              onClick={handleDownloadQr}
              disabled={!qrDataUrl}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border hover:bg-muted font-medium text-sm transition"
            >
              <Download className="w-4 h-4 text-muted-foreground" />
              <span>Tải ảnh PNG</span>
            </button>

            <a
              href="/cards/showcase"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 font-medium text-sm transition"
            >
              <Smartphone className="w-4 h-4" />
              <span>Thử trên web</span>
            </a>
          </div>
        </div>

        {/* Right Column: Link & Highlights */}
        <div className="lg:col-span-7 space-y-6">
          {/* Link Box */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <span>Đường dẫn truy cập trực tiếp</span>
            </h2>

            <div className="flex items-center gap-2 p-3 bg-muted/60 rounded-xl border border-border">
              <input
                type="text"
                readOnly
                value={showcaseUrl}
                className="flex-1 bg-transparent text-sm font-mono text-foreground outline-none select-all"
              />
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  copied
                    ? "bg-green-600 text-white"
                    : "bg-primary text-primary-foreground hover:opacity-90"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Link này mở trực tiếp mà không yêu cầu tài khoản người nhận hay thanh toán.
            </p>
          </div>

          {/* Features Highlight */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Cấu trúc Kịch bản 9 Chặng Tri Ân</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                <span className="font-bold text-foreground">1. Mở màn điện ảnh</span>
                <p className="text-muted-foreground">Hiệu ứng ảnh Ken Burns, calligraphy và nhạc nền ấm áp.</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                <span className="font-bold text-foreground">2. Thổi nến 3D tương tác</span>
                <p className="text-muted-foreground">Chạm & giữ để dập tắt nến, khói 3D bốc lên và pháo sáng bừng nở.</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                <span className="font-bold text-foreground">3. Cassette hoài niệm</span>
                <p className="text-muted-foreground">Máy cassette retro quay băng và visualizer sóng âm thanh.</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                <span className="font-bold text-foreground">4. Cột mốc đồ án & 3D</span>
                <p className="text-muted-foreground">Thống kê 120+ ngày nỗ lực, 25+ mô hình và dòng code sạch.</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                <span className="font-bold text-foreground">5. Thư tri ân Typewriter</span>
                <p className="text-muted-foreground">Lá thư tri ân Thầy Cô gõ chữ từng ký tự kèm nút đọc nhanh.</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                <span className="font-bold text-foreground">6. Nhịp tim xúc giác</span>
                <p className="text-muted-foreground">Web Audio tổng hợp nhịp tim 60Hz và rung haptic trên điện thoại.</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                <span className="font-bold text-foreground">7. Gấp giấy Origami 3D</span>
                <p className="text-muted-foreground">Mảnh giấy ước nguyện gấp xếp trong không gian 3D thành ngôi sao.</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                <span className="font-bold text-foreground">8. Lọ ngân hà & 3D Orbit</span>
                <p className="text-muted-foreground">Âm thanh tinh thể, sao băng và chế độ xoay tự do ngắm 4 model 3D.</p>
              </div>
            </div>
          </div>

          {/* 3D Models in Showcase */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-amber-500" />
              <span>4 Mô Hình 3D Thật Tích Hợp Trong Thiệp</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-muted/50 border border-border">
                <span className="font-semibold text-foreground block">Bình Hoa Tri Ân</span>
                <span className="text-[10px] text-muted-foreground">Pha lê cao cấp</span>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/50 border border-border">
                <span className="font-semibold text-foreground block">Ngọn Đèn Tri Thức</span>
                <span className="text-[10px] text-muted-foreground">Ánh sáng ấm áp</span>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/50 border border-border">
                <span className="font-semibold text-foreground block">Hạc Origami 3D</span>
                <span className="text-[10px] text-muted-foreground">Thủ công số hóa</span>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/50 border border-border">
                <span className="font-semibold text-foreground block">Trái Tim Pha Lê</span>
                <span className="text-[10px] text-muted-foreground">Đam mê sáng tạo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
