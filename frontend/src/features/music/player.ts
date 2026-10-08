import type { MusicTrack } from "./types";

export interface PlayerSnapshot {
  tracks: MusicTrack[];
  current: MusicTrack | null;
  playing: boolean;
  blocked: boolean;
  loading: boolean;
  volume: number;
  error: string;
}

interface ResumeState { id: string; url: string; time: number }
type StorageLike = Pick<Storage, "getItem" | "setItem">;

export const initialPlayerSnapshot: PlayerSnapshot = {
  tracks: [], current: null, playing: false, blocked: false, loading: false, volume: 0.25, error: "",
};

function read(storage: StorageLike | undefined, key: string): unknown {
  try { return JSON.parse(storage?.getItem(key) ?? "null"); } catch { return null; }
}

// One engine and one audio element live in the root layout, independent of route changes.
export class BackgroundMusicEngine {
  private state: PlayerSnapshot = { ...initialPlayerSnapshot };
  private enabled = true;
  private disposed = false;
  private generation = 0;
  private failed = new Set<string>();
  private resume: ResumeState | null = null;
  private pendingTime = 0;
  private lastSaved = 0;
  private listeners: Array<[string, EventListener]> = [];

  constructor(private audio: HTMLAudioElement, private emit: (state: PlayerSnapshot) => void,
    private preferences?: StorageLike, private session?: StorageLike) {
    const saved = read(preferences, "craftvision.music.preferences") as { enabled?: unknown; volume?: unknown } | null;
    this.enabled = saved?.enabled !== false;
    if (typeof saved?.volume === "number" && Number.isFinite(saved.volume))
      this.state.volume = Math.min(1, Math.max(0, saved.volume));
    const resume = read(session, "craftvision.music.resume") as Partial<ResumeState> | null;
    if (typeof resume?.id === "string" && typeof resume.url === "string" && typeof resume.time === "number" && Number.isFinite(resume.time))
      this.resume = { id: resume.id, url: resume.url, time: Math.max(0, resume.time) };
    audio.volume = this.state.volume;
    this.listen("playing", () => {
      if (!this.enabled) { audio.pause(); return; }
      this.update({ playing: true, blocked: false, loading: false, error: "" });
    });
    this.listen("pause", () => { this.update({ playing: false, loading: false }); this.persist(); });
    this.listen("waiting", () => this.update({ loading: this.enabled }));
    this.listen("ended", () => { if (this.enabled) this.next(); });
    this.listen("error", () => this.handleFailure());
    this.listen("loadedmetadata", () => {
      if (this.pendingTime > 0 && Number.isFinite(audio.duration) && audio.duration > 0) {
        audio.currentTime = Math.min(this.pendingTime, Math.max(0, audio.duration - 0.1));
      }
      this.pendingTime = 0;
    });
    this.listen("timeupdate", () => {
      if (Date.now() - this.lastSaved > 2000) { this.persist(); this.lastSaved = Date.now(); }
    });
    this.update({});
  }

  private listen(event: string, handler: () => void) {
    this.audio.addEventListener(event, handler);
    this.listeners.push([event, handler]);
  }

  private update(patch: Partial<PlayerSnapshot>) {
    if (this.disposed) return;
    this.state = { ...this.state, ...patch };
    this.emit(this.state);
  }

  setPlaylist(tracks: MusicTrack[]) {
    const playlist = tracks.filter(track => track.isEnabled);
    const previous = this.state.current;
    const retained = playlist.find(track => track.id === previous?.id);
    this.update({ tracks: playlist });
    if (retained && retained.audioUrl === previous?.audioUrl) {
      // Metadata edits and polling must never reset playback or the source attribute.
      this.update({ current: retained });
      return;
    }
    const resume = playlist.find(track => track.id === this.resume?.id && track.audioUrl === this.resume.url);
    this.failed.clear();
    this.select(retained ?? resume ?? playlist[0] ?? null, resume ? this.resume!.time : 0);
    this.resume = null;
  }

  private select(track: MusicTrack | null, time = 0) {
    this.generation++;
    this.audio.pause();
    this.pendingTime = time;
    this.update({ current: track, playing: false, blocked: false, loading: false, error: "" });
    if (!track) {
      this.audio.removeAttribute("src");
      this.audio.load();
      return;
    }
    this.audio.src = track.audioUrl;
    this.audio.load();
    this.persist();
    if (this.enabled) this.play();
  }

  private play() {
    if (this.disposed || !this.enabled || !this.state.current) return;
    const generation = this.generation;
    this.update({ loading: true, error: "" });
    void this.audio.play().catch((error: { name?: string }) => {
      if (this.disposed || generation !== this.generation || !this.enabled) return;
      if (error.name === "NotAllowedError") {
        this.update({ playing: false, blocked: true, loading: false });
      } else if (error.name !== "AbortError") {
        this.handleFailure();
      }
    });
  }

  retryAutoplay() {
    if (this.enabled && this.state.blocked) this.play();
  }

  toggle() {
    if (this.state.playing || this.state.loading) {
      this.enabled = false;
      this.generation++;
      this.audio.pause();
      this.update({ playing: false, blocked: false, loading: false });
    } else {
      this.enabled = true;
      this.failed.clear();
      if (this.audio.error && this.state.current) this.select(this.state.current);
      else this.play();
    }
    this.persist();
  }

  next() {
    const tracks = this.state.tracks;
    if (!tracks.length) return;
    this.failed.clear();
    const index = tracks.findIndex(track => track.id === this.state.current?.id);
    this.select(tracks[(index + 1) % tracks.length]);
  }

  private handleFailure() {
    if (!this.state.current || this.failed.has(this.state.current.id)) return;
    this.failed.add(this.state.current.id);
    const index = this.state.tracks.findIndex(track => track.id === this.state.current?.id);
    const ordered = [...this.state.tracks.slice(index + 1), ...this.state.tracks.slice(0, index)];
    const next = ordered.find(track => !this.failed.has(track.id));
    if (next && this.enabled) this.select(next);
    else {
      this.generation++;
      this.audio.pause();
      this.update({ playing: false, loading: false, blocked: false, error: "Không tải được nhạc. Nhấn phát để thử lại." });
    }
  }

  setVolume(value: number) {
    if (!Number.isFinite(value)) return;
    const volume = Math.min(1, Math.max(0, value));
    this.audio.volume = volume;
    this.update({ volume });
    this.persist();
  }

  persist() {
    try {
      this.preferences?.setItem("craftvision.music.preferences", JSON.stringify({ enabled: this.enabled, volume: this.state.volume }));
      if (this.state.current) this.session?.setItem("craftvision.music.resume", JSON.stringify({
        id: this.state.current.id, url: this.state.current.audioUrl, time: this.pendingTime || this.audio.currentTime || 0,
      }));
    } catch { /* Playback remains available when browser storage is disabled. */ }
  }

  dispose() {
    this.persist();
    this.disposed = true;
    this.generation++;
    this.listeners.forEach(([event, handler]) => this.audio.removeEventListener(event, handler));
    this.audio.pause();
    this.audio.removeAttribute("src");
    this.audio.load();
  }
}
