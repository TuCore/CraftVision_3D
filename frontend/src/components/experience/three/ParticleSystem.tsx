"use client";

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleSystemProps {
  count?: number;
  progress?: number; // 0 to 1
  isCompleted?: boolean;
  candlePosition?: [number, number, number];
}

export function ParticleSystem({
  count = 140,
  progress = 0,
  isCompleted = false,
  candlePosition = [0, -0.6, 0],
}: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate glowing particle radial texture in memory
  const texture = useMemo(() => {
    if (typeof document === 'undefined') return undefined;
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.25, 'rgba(253, 224, 71, 0.85)');
    grad.addColorStop(0.55, 'rgba(244, 63, 94, 0.35)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }, []);

  // Initialize particle positions, velocities, and initial phases
  const [positions, phases, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    const sp = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Cylinder distribution around candle
      const radius = 0.25 + Math.random() * 1.8;
      const angle = Math.random() * Math.PI * 2;
      pos[i * 3] = candlePosition[0] + Math.cos(angle) * radius;
      pos[i * 3 + 1] = candlePosition[1] + 1.2 + Math.random() * 2.8;
      pos[i * 3 + 2] = candlePosition[2] + Math.sin(angle) * radius;

      ph[i] = Math.random() * Math.PI * 2;
      sp[i] = 0.35 + Math.random() * 0.55;
    }
    return [pos, ph, sp];
  }, [count, candlePosition]);

  // Target opacity and activity based on interaction progress
  const targetAlpha = isCompleted ? 0.95 : Math.max(0, (progress - 0.2) * 1.1);

  useFrame((_, delta) => {
    if (!pointsRef.current || targetAlpha <= 0.01) return;

    const geom = pointsRef.current.geometry;
    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
    if (!posAttr) return;

    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      // Rising upward motion
      arr[idx + 1] += speeds[i] * delta * (isCompleted ? 1.0 : 0.6);

      // Subtle horizontal curl / drift
      phases[i] += delta * 1.5;
      arr[idx] += Math.sin(phases[i]) * 0.003;
      arr[idx + 2] += Math.cos(phases[i]) * 0.003;

      // Wrap around if risen too high
      const maxHeight = candlePosition[1] + 4.2;
      if (arr[idx + 1] > maxHeight) {
        arr[idx + 1] = candlePosition[1] + 1.2;
        const radius = 0.2 + Math.random() * 1.5;
        const angle = Math.random() * Math.PI * 2;
        arr[idx] = candlePosition[0] + Math.cos(angle) * radius;
        arr[idx + 2] = candlePosition[2] + Math.sin(angle) * radius;
      }
    }

    posAttr.needsUpdate = true;
  });

  if (targetAlpha <= 0.01) {
    return null;
  }

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={isCompleted ? 0.14 : 0.09}
        map={texture}
        transparent
        opacity={targetAlpha}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
        color="#fed7aa"
      />
    </points>
  );
}
