"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Square, Upload, Trash2, RotateCcw, Volume2, AlertCircle } from "lucide-react";
import { importAudio } from "./storage";

interface VoiceRecorderFieldProps {
  value: string;
  onChange: (dataUrl: string, fileName?: string) => void;
  voiceText?: string;
  onVoiceTextChange?: (text: string) => void;
  disabled?: boolean;
  maxDurationSec?: number;
}

const SUPPORTED_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
  "audio/ogg",
];

function getPreferredMimeType(): string {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") return "";
  for (const type of SUPPORTED_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function VoiceRecorderField({
  value,
  onChange,
  voiceText,
  onVoiceTextChange,
  disabled = false,
  maxDurationSec = 90,
}: VoiceRecorderFieldProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [levels, setLevels] = useState<number[]>(() => Array(24).fill(12));
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const cleanupRecording = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Ignore stop errors if already stopping
      }
    }
    mediaRecorderRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      void audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setIsRecording(false);
  }, []);

  useEffect(() => {
    return () => {
      cleanupRecording();
    };
  }, [cleanupRecording]);

  const startRecording = async () => {
    if (disabled || isRecording) return;
    setError("");

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("Trình duyệt của bạn không hỗ trợ thu âm trực tiếp. Vui lòng chọn tải file ghi âm.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = getPreferredMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const rawMime = (recorder.mimeType || mimeType || "audio/webm").split(";")[0];
        const blob = new Blob(chunksRef.current, { type: rawMime });
        if (blob.size > 8 * 1024 * 1024) {
          setError("Bản ghi âm vượt quá 8 MB. Vui lòng thu âm ngắn hơn.");
          cleanupRecording();
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          const result = String(reader.result || "");
          // Chuẩn hóa tiền tố MIME để tương thích bộ kiểm tra lưu trữ
          const normalized = result.replace(/^data:audio\/[^;]+(;codecs=[^;]+)?;base64,/, `data:${rawMime};base64,`);
          setFileName(`Ghi-am-giong-noi-${formatDuration(elapsedSec || 1)}.webm`);
          onChange(normalized, `Ghi âm giọng nói (${formatDuration(elapsedSec || 1)})`);
        };
        reader.onerror = () => {
          setError("Không thể xử lý dữ liệu ghi âm.");
        };
        reader.readAsDataURL(blob);
        cleanupRecording();
      };

      // Khởi tạo bộ phân tích sóng âm thời gian thực
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        const audioCtx = new AudioContextClass();
        audioCtxRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateMeter = () => {
          analyser.getByteFrequencyData(dataArray);
          const nextLevels = Array.from({ length: 24 }, (_, idx) => {
            const val = dataArray[idx % dataArray.length] || 0;
            return Math.max(10, Math.min(100, Math.round((val / 255) * 100)));
          });
          setLevels(nextLevels);
          rafRef.current = requestAnimationFrame(updateMeter);
        };
        rafRef.current = requestAnimationFrame(updateMeter);
      }

      setElapsedSec(0);
      setIsRecording(true);
      recorder.start(250);

      timerRef.current = setInterval(() => {
        setElapsedSec((prev) => {
          const next = prev + 1;
          if (next >= maxDurationSec) {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
              mediaRecorderRef.current.stop();
            }
          }
          return next;
        });
      }, 1000);
    } catch {
      setError("Không thể truy cập Microphone. Vui lòng cấp quyền Mic trên trình duyệt hoặc tải file ghi âm có sẵn.");
      cleanupRecording();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    } else {
      cleanupRecording();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    try {
      const dataUrl = await importAudio(file);
      setFileName(file.name);
      onChange(dataUrl, file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể đọc file ghi âm.");
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-rose-500/25 bg-gradient-to-br from-rose-500/5 via-purple-500/5 to-amber-500/5 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-sm font-bold text-foreground flex items-center gap-2">
            <Mic className="w-4 h-4 text-rose-500" />
            Ghi âm giọng nói của bạn (Phát khi chạm vào Model 3D)
          </span>
          <p className="text-xs text-muted-foreground mt-0.5">
            Khi người nhận chạm vào Model 3D, nhạc nền sẽ tự động nhỏ lại để giọng nói và từng chữ cái của bạn xuất hiện.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {!isRecording ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => void startRecording()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Mic className="w-4 h-4" />
              <span>{value ? "Thu âm lại bằng Mic" : "Thu âm trực tiếp"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md animate-pulse cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Dừng thu ({formatDuration(elapsedSec)} / {formatDuration(maxDurationSec)})</span>
            </button>
          )}

          <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 dark:bg-card hover:bg-muted border border-border text-foreground font-semibold text-xs cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5 text-rose-500" />
            <span>Tải file ghi âm</span>
            <input
              type="file"
              accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/webm,audio/mp4,audio/x-m4a,.mp3,.wav,.ogg,.webm,.m4a"
              disabled={disabled || isRecording}
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Trạng thái đang thu âm với sóng âm trực tiếp */}
      {isRecording && (
        <div className="rounded-xl bg-rose-950/90 text-white p-4 space-y-3 border border-rose-400/30">
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-2 font-bold text-rose-300">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              Đang thu âm giọng nói của bạn...
            </span>
            <span className="font-mono font-bold text-amber-300">
              {formatDuration(elapsedSec)} / {formatDuration(maxDurationSec)}
            </span>
          </div>
          <div className="flex items-center justify-center gap-1 h-12 px-2">
            {levels.map((h, i) => (
              <span
                key={i}
                className="w-1.5 rounded-full bg-gradient-to-t from-rose-500 to-amber-300 transition-all duration-75"
                style={{ height: `${Math.max(12, h)}%` }}
              />
            ))}
          </div>
          <p className="text-[11px] text-rose-200/80 text-center">
            Hãy nói lời chúc từ trái tim bạn, sau đó bấm <strong>&ldquo;Dừng thu&rdquo;</strong> để lưu lại.
          </p>
        </div>
      )}

      {/* Trình nghe lại bản ghi âm đã lưu */}
      {value && !isRecording && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25">
          <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
            <Volume2 className="w-5 h-5 text-rose-600 shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-bold text-foreground block truncate">
                {fileName || "Đã đính kèm bản ghi âm giọng nói"}
              </span>
              <span className="text-[10px] text-muted-foreground">
                Sẽ phát khi người nhận chạm vào Model 3D (nhạc nền tự động giảm nhỏ)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <audio controls src={value} className="h-9 max-w-[220px]" preload="metadata" />
            <button
              type="button"
              onClick={() => void startRecording()}
              className="p-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold cursor-pointer shrink-0"
              title="Thu âm lại"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setFileName("");
                onChange("", "");
              }}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 text-xs font-semibold cursor-pointer shrink-0"
              title="Xóa bản ghi âm"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div role="alert" className="flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-500/10 px-3 py-2 rounded-xl border border-red-500/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Ô nhập nội dung văn bản của đoạn ghi âm để chạy chữ từng ký tự khi chạm vào Model 3D */}
      {onVoiceTextChange !== undefined && (
        <div className="space-y-1.5 pt-2 border-t border-border/40">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-bold text-foreground">
              Văn bản của đoạn ghi âm (Hiện từng chữ cái khi chạm vào Model 3D)
            </label>
            <span className="text-[11px] text-muted-foreground">
              {(voiceText || "").length}/1000 ký tự
            </span>
          </div>
          <textarea
            rows={2}
            maxLength={1000}
            value={voiceText || ""}
            onChange={(e) => onVoiceTextChange(e.target.value)}
            placeholder="Nhập nội dung lời nói trong đoạn ghi âm của bạn (VD: Chúc mừng sinh nhật em yêu, cảm ơn em vì đã luôn ở bên anh...)"
            className="w-full rounded-xl border border-border bg-white/80 dark:bg-background p-3 text-xs sm:text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-y"
          />
          <p className="text-[11px] text-muted-foreground">
            ✨ Khi người nhận chạm vào Model 3D, đoạn ghi âm sẽ vang lên đồng thời dòng văn bản này xuất hiện từng chữ cái một khớp theo giọng nói của bạn.
          </p>
        </div>
      )}
    </div>
  );
}
