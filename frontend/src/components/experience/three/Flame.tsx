"use client";

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FlameConfig, DEFAULT_FLAME_CONFIG } from '@/types/experience';

interface FlameProps {
  position?: [number, number, number];
  progress?: number; // 0 to 1
  isLit?: boolean;
  config?: Partial<FlameConfig>;
}

export function Flame({
  position = [0, 0, 0],
  progress = 0,
  isLit = false,
  config = {},
}: FlameProps) {
  const mergedConfig = { ...DEFAULT_FLAME_CONFIG, ...config };
  const { innerColor, outerColor, maxScale, flickerSpeed, lightIntensity } = mergedConfig;

  const groupRef = useRef<THREE.Group>(null);
  const outerMeshRef = useRef<THREE.Mesh>(null);
  const innerMeshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  // Target scale driven by progress or full lit state
  const effectiveProgress = isLit ? 1 : progress;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const t = clock.getElapsedTime();

    // 1. Organic Flame Scale based on progress
    // Flame begins appearing around progress > 0.1, grows to maxScale at progress = 1
    const targetScale = effectiveProgress <= 0.05 
      ? 0 
      : Math.min(maxScale, (effectiveProgress - 0.05) / 0.95 * maxScale);

    // Natural flame vertical flickering & breathing
    const flickerY = targetScale > 0 
      ? 1.0 + Math.sin(t * flickerSpeed * 1.5) * 0.06 + Math.sin(t * 27.3) * 0.035
      : 0;
    const flickerXZ = targetScale > 0 
      ? 1.0 + Math.cos(t * flickerSpeed * 1.2) * 0.04
      : 0;

    groupRef.current.scale.set(
      targetScale * flickerXZ,
      targetScale * flickerY,
      targetScale * flickerXZ
    );

    // 2. Subtle Natural Flame Sway (Wind / Convection)
    if (targetScale > 0) {
      groupRef.current.rotation.z = Math.sin(t * flickerSpeed) * 0.06 + Math.sin(t * 19.1) * 0.03;
      groupRef.current.rotation.x = Math.cos(t * flickerSpeed * 0.8) * 0.05;
    }

    // 3. Dynamic Flame Point Light Flicker
    if (lightRef.current) {
      if (effectiveProgress > 0.1) {
        const lightFlicker = 1.0 + Math.sin(t * 14.5) * 0.08 + Math.cos(t * 29.3) * 0.04;
        lightRef.current.intensity = effectiveProgress * lightIntensity * lightFlicker;
        lightRef.current.visible = true;
      } else {
        lightRef.current.intensity = 0;
        lightRef.current.visible = false;
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Dynamic Candle Light */}
      <pointLight
        ref={lightRef}
        position={[0, 0.25, 0]}
        color="#ff9d3b"
        distance={7.5}
        decay={2}
        castShadow
        shadow-bias={-0.0001}
      />

      {/* Blue Combustion Base Halo */}
      <mesh position={[0, 0.04, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial 
          color="#3b82f6" 
          transparent 
          opacity={0.7} 
        />
      </mesh>

      {/* Outer Flame Envelope */}
      <mesh ref={outerMeshRef} position={[0, 0.22, 0]}>
        <coneGeometry args={[0.13, 0.42, 24]} />
        <meshStandardMaterial
          color={outerColor}
          emissive={outerColor}
          emissiveIntensity={2.5}
          transparent
          opacity={0.88}
          roughness={0.1}
        />
      </mesh>

      {/* Inner Flame Core (Bright Hot Center) */}
      <mesh ref={innerMeshRef} position={[0, 0.16, 0]}>
        <coneGeometry args={[0.07, 0.28, 20]} />
        <meshStandardMaterial
          color={innerColor}
          emissive={innerColor}
          emissiveIntensity={4.0}
          transparent
          opacity={0.96}
          roughness={0.05}
        />
      </mesh>
    </group>
  );
}
