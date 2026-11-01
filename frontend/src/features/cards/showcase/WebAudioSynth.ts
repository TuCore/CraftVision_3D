/**
 * Web Audio Synthesizer for CraftVision 3D Showcase.
 * Generates tactile and acoustic feedback (heartbeats, crystal star chimes, paper fold)
 * directly in the browser without loading heavy external sound files.
 */

class WebAudioSynth {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      void this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Generates a warm, authentic dual heartbeat ("lub-dub") pulse at 60Hz -> 38Hz
   * and triggers mobile device haptic vibration.
   */
  public playHeartbeat(intensity = 1.0): void {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([45, 120, 35]);
      } catch {}
    }

    const ctx = this.getContext();
    if (!ctx) return;

    const pulse = (time: number, gainFactor: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(62, time);
      osc.frequency.exponentialRampToValueAtTime(36, time + 0.14);

      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(0.6 * gainFactor * intensity, time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.18);
    };

    const now = ctx.currentTime;
    pulse(now, 1.0); // Lub
    pulse(now + 0.19, 0.65); // Dub
  }

  /**
   * Generates shimmering crystal / star chime harmonics when a star drops into the jar.
   */
  public playCrystalChime(baseFreq = 880): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const chords = [1, 1.25, 1.5, 1.875, 2.25]; // Major pentatonic harmonics
    const now = ctx.currentTime + 0.02;

    chords.forEach((ratio, idx) => {
      const noteTime = now + idx * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(baseFreq * ratio, noteTime);

      gain.gain.setValueAtTime(0.0001, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.18 / (idx + 1), noteTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.85);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.9);
    });
  }

  /**
   * Subtle paper folding / crease sound.
   */
  public playPaperCrease(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(140, now + 0.08);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.01);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * Candle extinguish whoosh sound.
   */
  public playExtinguish(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.35;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(450, now);
    filter.Q.setValueAtTime(2.5, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
  }
}

export const webAudioSynth = new WebAudioSynth();
