"use client";

import { useState, useRef, useCallback, useEffect } from 'react';

export interface UsePressAndHoldOptions {
  duration?: number; // Duration in ms to reach 100% (default: 2500ms)
  decaySpeed?: number; // Multiplier when decaying backwards on release (default: 1.8)
  onComplete?: () => void;
  disabled?: boolean;
}

export interface UsePressAndHoldReturn {
  progress: number; // 0 to 1
  isHolding: boolean;
  isCompleted: boolean;
  bind: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerCancel: (e: React.PointerEvent) => void;
    onPointerLeave: (e: React.PointerEvent) => void;
    onContextMenu: (e: React.MouseEvent) => void;
  };
  reset: () => void;
}

export function usePressAndHold({
  duration = 2500,
  decaySpeed = 1.8,
  onComplete,
  disabled = false,
}: UsePressAndHoldOptions = {}): UsePressAndHoldReturn {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const progressRef = useRef(0);
  const isHoldingRef = useRef(false);
  const isCompletedRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const updateLoop = useCallback((timestamp: number) => {
    if (lastTimeRef.current === null) {
      lastTimeRef.current = timestamp;
    }
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    if (isHoldingRef.current && !isCompletedRef.current) {
      // Advance progress toward 1.0
      const increment = deltaTime / duration;
      progressRef.current = Math.min(1, progressRef.current + increment);
      setProgress(progressRef.current);

      if (progressRef.current >= 1) {
        isCompletedRef.current = true;
        isHoldingRef.current = false;
        setIsCompleted(true);
        setIsHolding(false);
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
        return; // Finished
      }
    } else if (!isCompletedRef.current && progressRef.current > 0) {
      // Smooth decay backwards toward 0
      const decrement = (deltaTime / duration) * decaySpeed;
      progressRef.current = Math.max(0, progressRef.current - decrement);
      setProgress(progressRef.current);

      if (progressRef.current <= 0) {
        lastTimeRef.current = null;
        return; // Fully decayed
      }
    }

    if (!isCompletedRef.current && (isHoldingRef.current || progressRef.current > 0)) {
      animationFrameRef.current = requestAnimationFrame(updateLoop);
    }
  }, [duration, decaySpeed]);

  const startHold = useCallback((e: React.PointerEvent) => {
    if (disabled || isCompletedRef.current) return;

    // Capture pointer so move/release outside button is still detected
    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {}

    isHoldingRef.current = true;
    setIsHolding(true);
    lastTimeRef.current = null;

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(updateLoop);
  }, [disabled, updateLoop]);

  const endHold = useCallback((e: React.PointerEvent) => {
    if (!isHoldingRef.current || isCompletedRef.current) return;

    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {}

    isHoldingRef.current = false;
    setIsHolding(false);
    lastTimeRef.current = null;

    // Start decay animation loop if progress > 0
    if (progressRef.current > 0 && animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = requestAnimationFrame(updateLoop);
    }
  }, [updateLoop]);

  const reset = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    isHoldingRef.current = false;
    isCompletedRef.current = false;
    progressRef.current = 0;
    lastTimeRef.current = null;
    setIsHolding(false);
    setIsCompleted(false);
    setProgress(0);
  }, []);

  return {
    progress,
    isHolding,
    isCompleted,
    bind: {
      onPointerDown: startHold,
      onPointerUp: endHold,
      onPointerCancel: endHold,
      onPointerLeave: endHold,
      onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    },
    reset,
  };
}
