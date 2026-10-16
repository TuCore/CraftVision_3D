"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Volume2, VolumeX } from "lucide-react";

export interface AudioPlayerHandle {
  start: () => void;
}

type AudioContextWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

const NOTE_FREQUENCIES: Record<string, number> = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392,
  A4: 440,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
};

const HAPPY_BIRTHDAY_MELODY: Array<[keyof typeof NOTE_FREQUENCIES | "REST", number]> = [
  ["G4", 0.5], ["G4", 0.5], ["A4", 1], ["G4", 1], ["C5", 1], ["B4", 2],
  ["G4", 0.5], ["G4", 0.5], ["A4", 1], ["G4", 1], ["D5", 1], ["C5", 2],
  ["G4", 0.5], ["G4", 0.5], ["G5", 1], ["E5", 1], ["C5", 1], ["B4", 1], ["A4", 2],
  ["F5", 0.5], ["F5", 0.5], ["E5", 1], ["C5", 1], ["D5", 1], ["C5", 2],
];

export const AudioPlayer = forwardRef<AudioPlayerHandle>(function AudioPlayer(_, ref) {
  const contextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const musicGainRef = useRef<GainNode | null>(null);
  const melodyTimerRef = useRef<number | null>(null);
  const sourcesRef = useRef<Set<AudioScheduledSourceNode>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const scheduleTone = useCallback((
    context: AudioContext,
    destination: AudioNode,
    frequency: number,
    startTime: number,
    duration: number,
    volume: number,
    type: OscillatorType = "sine",
  ) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    oscillator.connect(gain);
    gain.connect(destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.03);
    sourcesRef.current.add(oscillator);
    oscillator.onended = () => {
      sourcesRef.current.delete(oscillator);
      oscillator.disconnect();
      gain.disconnect();
    };
  }, []);

  const scheduleMelody = useCallback((context: AudioContext, startTime: number) => {
    const destination = musicGainRef.current;
    if (!destination) return;

    const beatDuration = 0.42;
    let cursor = startTime;
    HAPPY_BIRTHDAY_MELODY.forEach(([note, beats]) => {
      const duration = beats * beatDuration;
      if (note !== "REST") {
        const frequency = NOTE_FREQUENCIES[note];
        scheduleTone(context, destination, frequency, cursor, Math.min(duration * 0.9, 0.8), 0.17);
        scheduleTone(context, destination, frequency * 2, cursor, Math.min(duration * 0.55, 0.4), 0.035, "triangle");
      }
      cursor += duration;
    });
  }, [scheduleTone]);

  const playOpeningSounds = useCallback((context: AudioContext, destination: AudioNode) => {
    const startTime = context.currentTime;
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * 0.12), context.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let index = 0; index < channel.length; index += 1) {
      const envelope = 1 - index / channel.length;
      channel[index] = (Math.random() * 2 - 1) * envelope * envelope;
    }

    const snap = context.createBufferSource();
    const snapFilter = context.createBiquadFilter();
    const snapGain = context.createGain();
    snap.buffer = buffer;
    snapFilter.type = "highpass";
    snapFilter.frequency.value = 1450;
    snapGain.gain.setValueAtTime(0.18, startTime);
    snapGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.12);
    snap.connect(snapFilter);
    snapFilter.connect(snapGain);
    snapGain.connect(destination);
    snap.start(startTime);
    sourcesRef.current.add(snap);
    snap.onended = () => {
      sourcesRef.current.delete(snap);
      snap.disconnect();
      snapFilter.disconnect();
      snapGain.disconnect();
    };

    [880, 1320, 1760].forEach((frequency, index) => {
      scheduleTone(context, destination, frequency, startTime + 0.72 + index * 0.09, 0.72, 0.09, "sine");
    });
  }, [scheduleTone]);

  const start = useCallback(() => {
    if (contextRef.current) {
      void contextRef.current.resume();
      setIsPlaying(true);
      return;
    }

    const AudioContextConstructor =
      window.AudioContext || (window as AudioContextWindow).webkitAudioContext;
    if (!AudioContextConstructor) return;

    const context = new AudioContextConstructor();
    const masterGain = context.createGain();
    const musicGain = context.createGain();
    const now = context.currentTime;

    masterGain.gain.value = 0.72;
    musicGain.gain.setValueAtTime(0.0001, now);
    musicGain.gain.setValueAtTime(0.0001, now + 2.6);
    musicGain.gain.exponentialRampToValueAtTime(0.75, now + 4.1);
    musicGain.connect(masterGain);
    masterGain.connect(context.destination);

    contextRef.current = context;
    masterGainRef.current = masterGain;
    musicGainRef.current = musicGain;
    playOpeningSounds(context, masterGain);
    scheduleMelody(context, now + 2.7);
    melodyTimerRef.current = window.setInterval(() => {
      if (context.state !== "closed") scheduleMelody(context, context.currentTime + 0.08);
    }, 12_200);

    void context.resume();
    setHasStarted(true);
    setIsPlaying(true);
  }, [playOpeningSounds, scheduleMelody]);

  useImperativeHandle(ref, () => ({ start }), [start]);

  useEffect(() => () => {
    if (melodyTimerRef.current !== null) window.clearInterval(melodyTimerRef.current);
    sourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch {
        // A source that has already ended cannot be stopped twice.
      }
      source.disconnect();
    });
    sourcesRef.current.clear();
    musicGainRef.current?.disconnect();
    masterGainRef.current?.disconnect();
    if (contextRef.current?.state !== "closed") void contextRef.current?.close();
  }, []);

  const togglePlay = () => {
    const context = contextRef.current;
    if (!context) {
      start();
      return;
    }

    if (context.state === "running") {
      void context.suspend();
      setIsPlaying(false);
    } else {
      void context.resume();
      setIsPlaying(true);
    }
  };

  return (
    <div className="fixed right-5 top-5 z-50">
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Mute birthday music" : "Play birthday music"}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white shadow-lg backdrop-blur-md transition hover:scale-105 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
      >
        {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} className={hasStarted ? "" : "opacity-70"} />}
      </button>
    </div>
  );
});
