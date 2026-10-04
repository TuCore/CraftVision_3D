"use client";

import React from 'react';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

interface PostProcessingPipelineProps {
  enabled?: boolean;
  isCompleted?: boolean;
}

export function PostProcessingPipeline({
  enabled = true,
  isCompleted = false,
}: PostProcessingPipelineProps) {
  if (!enabled) return null;

  return (
    <EffectComposer multisampling={0}>
      {/* Cinematic Dreamy Bloom on Flame, Glow & 3D Text */}
      <Bloom
        luminanceThreshold={0.5}
        luminanceSmoothing={0.35}
        intensity={isCompleted ? 1.4 : 0.85}
        mipmapBlur
      />
      {/* Subtle Vignette for Cinema Depth */}
      <Vignette eskil={false} offset={0.2} darkness={0.6} />
    </EffectComposer>
  );
}
