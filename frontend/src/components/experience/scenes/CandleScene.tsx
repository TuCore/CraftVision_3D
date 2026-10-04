"use client";

import React, { useRef } from 'react';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Candle } from '../three/Candle';
import { CameraController } from '../three/CameraController';
import { Dynamic3DText } from '../three/Dynamic3DText';
import { StarsBackground } from '../three/StarsBackground';
import { ParticleSystem } from '../three/ParticleSystem';
import { PostProcessingPipeline } from '../three/PostProcessingPipeline';

interface CandleSceneProps {
  candlePosition?: [number, number, number];
  holdProgress?: number; // 0 to 1
  isCompleted?: boolean;
  recipientName?: string;
  message?: string;
  senderName?: string;
}

export function CandleScene({
  candlePosition = [0, -0.6, 0],
  holdProgress = 0,
  isCompleted = false,
  recipientName = 'Minh',
  message,
  senderName,
}: CandleSceneProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  // Effective progress reaches 1 when completed
  const progress = isCompleted ? 1 : holdProgress;

  return (
    <>
      {/* Deep Celestial Starfield (Phase 6) */}
      <StarsBackground count={3200} speed={0.5} />

      {/* Cinematic Camera Controller reacting to completion */}
      <CameraController
        isCompleted={isCompleted}
        controlsRef={controlsRef}
      />

      {/* Cinematic Mood Lighting reacting to interaction progress */}
      {/* Ambient Fill: grows progressively warmer and brighter */}
      <ambientLight 
        intensity={0.4 + progress * 0.35} 
        color={progress > 0.4 ? '#fbe4d2' : '#e0d4f7'} 
      />

      {/* Primary Key Light */}
      <directionalLight
        position={[4, 6, 4]}
        intensity={0.9 + progress * 0.4}
        color="#fff5ea"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />

      {/* Rim / Accent Light for silhouette contrast */}
      <directionalLight
        position={[-4, 4, -4]}
        intensity={0.5 + progress * 0.2}
        color="#a78bfa"
      />

      {/* Ambient Atmosphere Warmth for 75% -> 100% */}
      {progress > 0.6 && (
        <pointLight
          position={[0, 4, 2]}
          intensity={(progress - 0.6) * 1.5}
          color="#ffcca5"
          distance={12}
          decay={2}
        />
      )}

      {/* 3D Candle with interactive Flame & dynamic lighting */}
      <Candle 
        position={candlePosition} 
        progress={progress} 
        isLit={isCompleted} 
      />

      {/* Swirling Golden Fireflies & Rising Embers (Phase 6) */}
      <ParticleSystem
        count={140}
        progress={progress}
        isCompleted={isCompleted}
        candlePosition={candlePosition}
      />

      {/* Dynamic 3D Celestial Text floating above the candle */}
      <Dynamic3DText
        recipientName={recipientName}
        message={message}
        senderName={senderName}
        isCompleted={isCompleted}
        position={[0, candlePosition[1] + 2.65, 0]}
      />

      {/* Soft Ground Contact Shadow */}
      <ContactShadows
        position={[0, candlePosition[1] + 0.05, 0]}
        opacity={0.65}
        scale={6}
        blur={2.2}
        far={3}
        color="#150a21"
      />

      {/* Camera Orbit Controls */}
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={true}
        minDistance={1.4}
        maxDistance={12}
        maxPolarAngle={Math.PI / 2 + 0.05}
        minPolarAngle={Math.PI / 6}
        dampingFactor={0.05}
        autoRotate={false}
      />

      {/* Cinematic Post-Processing Bloom & Vignette (Phase 6) */}
      <PostProcessingPipeline
        enabled={true}
        isCompleted={isCompleted}
      />
    </>
  );
}
