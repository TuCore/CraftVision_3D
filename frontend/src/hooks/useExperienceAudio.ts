"use client";

import { useRef, useEffect, useCallback } from 'react';

/**
 * useExperienceAudio — Phase 7
 *
 * Pure Web Audio API audio engine for the 3D greeting experience.
 * - No external audio library required.
 * - Fully respects browser autoplay policy: first interaction unlocks the AudioContext.
 * - Generates soft ambient/BGM tones procedurally (no asset files required).
 * - Exposes imperative methods: playHoldTick, playIgnite, playBGM, stopBGM.
 */
export function useExperienceAudio() {
  const ctxRef = useRef<AudioContext | null>(null);
  const bgmNodeRef = useRef<{ osc: OscillatorNode; gain: GainNode } | null>(null);
  const bgmStartedRef = useRef(false);
  const masterGainRef = useRef<GainNode | null>(null);

  // ─── Lazy-initialise AudioContext on first user gesture ──────────────────
  const getCtx = useCallback((): AudioContext => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      masterGainRef.current = ctxRef.current.createGain();
      masterGainRef.current.gain.value = 0.55;
      masterGainRef.current.connect(ctxRef.current.destination);
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume().catch(() => null);
    }
    return ctxRef.current;
  }, []);

  // ─── Soft sparkle / tick while holding ───────────────────────────────────
  const playHoldTick = useCallback((progress: number) => {
    try {
      const ctx = getCtx();
      const master = masterGainRef.current!;
      const t = ctx.currentTime;
      const baseFreq = 440 + progress * 660; // ramp A4 → A5-ish

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.09, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

      osc.connect(gain);
      gain.connect(master);
      osc.start(t);
      osc.stop(t + 0.14);
    } catch {
      /* silently ignore if AudioContext unavailable */
    }
  }, [getCtx]);

  // ─── Ignite burst — played once at completion ─────────────────────────────
  const playIgnite = useCallback(() => {
    try {
      const ctx = getCtx();
      const master = masterGainRef.current!;
      const t = ctx.currentTime;

      // Rising harmonic sweep
      [1, 2, 3, 5].forEach((harmonic, i) => {
        const osc = ctx.createOscillator();
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(220 * harmonic, t);
        osc.frequency.exponentialRampToValueAtTime(880 * harmonic, t + 0.6);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t + i * 0.04);
        gain.gain.linearRampToValueAtTime(0.12 / harmonic, t + 0.05 + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.0 + i * 0.1);

        osc.connect(gain);
        gain.connect(master);
        osc.start(t + i * 0.04);
        osc.stop(t + 1.5);
      });

      // Noise burst (crackle)
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.max(0, 1 - i / bufferSize);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 3200;
      noiseFilter.Q.value = 0.8;

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(master);
      noise.start(t);
    } catch {
      /* silently ignore */
    }
  }, [getCtx]);

  // ─── Ambient BGM — soft drone pad procedurally synthesized ───────────────
  const startBGM = useCallback(() => {
    if (bgmStartedRef.current) return;
    try {
      const ctx = getCtx();
      const master = masterGainRef.current!;
      bgmStartedRef.current = true;

      const bgmGain = ctx.createGain();
      bgmGain.gain.setValueAtTime(0, ctx.currentTime);
      bgmGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 3.0);
      bgmGain.connect(master);

      // Layered sine oscillators for a warm pad sound (C pentatonic root notes)
      const freqs = [130.81, 164.81, 196.00, 261.63, 329.63]; // C3 E3 G3 C4 E4
      const oscs: OscillatorNode[] = freqs.map((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        // Gentle detuning per layer for chorus effect
        osc.detune.value = (i % 2 === 0 ? 1 : -1) * (i * 3);

        const layerGain = ctx.createGain();
        layerGain.gain.value = 0.18 - i * 0.025;

        osc.connect(layerGain);
        layerGain.connect(bgmGain);
        osc.start();
        return osc;
      });

      // Slow LFO tremolo
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.12; // very slow tremolo
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.04;
      lfo.connect(lfoGain);
      lfoGain.connect(bgmGain.gain);
      lfo.start();

      bgmNodeRef.current = { osc: oscs[0], gain: bgmGain };

      // Cleanup helper stored for stopBGM
      (bgmNodeRef.current as unknown as { _cleanup: () => void })._cleanup = () => {
        oscs.forEach(o => { try { o.stop(); } catch { /* noop */ } });
        try { lfo.stop(); } catch { /* noop */ }
      };
    } catch {
      /* silently ignore */
    }
  }, [getCtx]);

  const stopBGM = useCallback(() => {
    if (!bgmNodeRef.current) return;
    try {
      const ctx = ctxRef.current!;
      const { gain } = bgmNodeRef.current;
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.0);
      const cleanup = (bgmNodeRef.current as unknown as { _cleanup?: () => void })._cleanup;
      setTimeout(() => {
        cleanup?.();
        bgmNodeRef.current = null;
        bgmStartedRef.current = false;
      }, 2200);
    } catch {
      /* silently ignore */
    }
  }, []);

  // ─── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopBGM();
      ctxRef.current?.close().catch(() => null);
    };
  }, [stopBGM]);

  return { playHoldTick, playIgnite, startBGM, stopBGM };
}
