"use client";

import { useEffect, useRef, useState } from "react";
import { Music2, Pause, Play, SkipForward, ChevronDown, Volume2 } from "lucide-react";
import { BackgroundMusicEngine, initialPlayerSnapshot } from "./player";
import { MUSIC_UPDATED_EVENT, type MusicTrack } from "./types";

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const engine = useRef<BackgroundMusicEngine | null>(null);
  const [state, setState] = useState(initialPlayerSnapshot);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!audioRef.current) return;
    let preferences: Storage | undefined;
    let session: Storage | undefined;
    try { preferences = window.localStorage; session = window.sessionStorage; } catch { /* Optional storage. */ }
    const player = new BackgroundMusicEngine(audioRef.current, setState, preferences, session);
    engine.current = player;
    let disposed = false;
    let controller: AbortController | null = null;
    const refresh = async () => {
      if (controller || document.visibilityState === "hidden") return;
      controller = new AbortController();
      const timeout = window.setTimeout(() => controller?.abort(), 15000);
      try {
        const response = await fetch("/api/music", { cache: "no-store", signal: controller.signal });
        if (!response.ok) return;
        const tracks: MusicTrack[] = await response.json();
        if (!disposed && Array.isArray(tracks)) player.setPlaylist(tracks);
      } catch { /* Preserve the current track during transient API outages. */ }
      finally { window.clearTimeout(timeout); controller = null; }
    };
    const retry = (event: Event) => {
      // The player's own controls handle their gesture without a competing play request.
      if (event.target instanceof Element && event.target.closest("[data-background-music]")) return;
      player.retryAutoplay();
    };
    const persist = () => player.persist();
    void refresh();
    const timer = window.setInterval(() => void refresh(), 60000);
    window.addEventListener(MUSIC_UPDATED_EVENT, refresh);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    document.addEventListener("pointerdown", retry);
    document.addEventListener("keydown", retry);
    window.addEventListener("pagehide", persist);
    return () => {
      disposed = true;
      controller?.abort();
      window.clearInterval(timer);
      window.removeEventListener(MUSIC_UPDATED_EVENT, refresh);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
      document.removeEventListener("pointerdown", retry);
      document.removeEventListener("keydown", retry);
      window.removeEventListener("pagehide", persist);
      player.dispose();
      engine.current = null;
    };
  }, []);

  const playLabel = state.playing || state.loading ? "Tạm dừng nhạc nền" : "Bật nhạc nền";
  return <>
    <audio ref={audioRef} preload="metadata" data-testid="background-music-audio" />
    {state.current && <section data-background-music aria-label="Nhạc nền"
      className="fixed bottom-20 left-3 z-[60] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-border bg-card/95 p-2 text-foreground shadow-lg backdrop-blur-md sm:bottom-5 sm:left-5">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => engine.current?.toggle()} aria-label={playLabel} title={playLabel}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          {state.playing || state.loading ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button type="button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-controls="background-music-details"
          className="flex min-w-0 items-center gap-2 text-left" title="Mở điều khiển nhạc nền">
          <span className="min-w-0 max-w-40"><span className="block text-[10px] text-muted-foreground">{state.blocked ? "Chạm để bật nhạc" : state.loading ? "Đang tải nhạc…" : "Nhạc nền"}</span>
            <span className="block truncate text-xs font-semibold">{state.current.title}</span></span>
          <ChevronDown size={16} className={expanded ? "rotate-180" : ""} />
        </button>
        <button type="button" onClick={() => engine.current?.next()} aria-label="Bài tiếp theo" title="Bài tiếp theo" className="rounded-full p-2 hover:bg-muted"><SkipForward size={18} /></button>
      </div>
      {expanded && <div id="background-music-details" className="space-y-3 px-2 pb-2 pt-3">
        <label className="flex items-center gap-2 text-xs"><Volume2 size={16} /><span>Âm lượng</span>
          <input aria-label="Âm lượng nhạc nền" type="range" min="0" max="1" step="0.05" value={state.volume}
            onChange={event => engine.current?.setVolume(Number(event.target.value))} className="w-24 accent-primary" />
          <span>{Math.round(state.volume * 100)}%</span>
        </label>
        <p className="flex items-center gap-1 text-xs text-muted-foreground"><Music2 size={12} /> {state.tracks.length} bài · Phát lần lượt, lặp danh sách</p>
      </div>}
      {state.error && <p role="status" className="max-w-64 px-2 pb-1 pt-2 text-xs text-destructive">{state.error}</p>}
    </section>}
  </>;
}
