"use client";

import React, { useRef } from 'react';
import * as THREE from 'three';
import { CandleConfig, DEFAULT_CANDLE_CONFIG, FlameConfig } from '@/types/experience';
import { Flame } from './Flame';

interface CandleProps {
  position?: [number, number, number];
  config?: Partial<CandleConfig>;
  flameConfig?: Partial<FlameConfig>;
  progress?: number; // 0 to 1
  isLit?: boolean;
}

export function Candle({
  position = [0, -1, 0],
  config = {},
  flameConfig = {},
  progress = 0,
  isLit = false,
}: CandleProps) {
  const mergedConfig = { ...DEFAULT_CANDLE_CONFIG, ...config };
  const groupRef = useRef<THREE.Group>(null);

  const { waxColor, waxHeight, waxRadius, baseColor } = mergedConfig;

  return (
    <group ref={groupRef} position={position}>
      {/* Porcelain / Ceramic Plate Pedestal */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[waxRadius * 2.2, waxRadius * 2.4, 0.1, 48]} />
        <meshStandardMaterial 
          color={baseColor} 
          roughness={0.4} 
          metalness={0.2} 
        />
      </mesh>

      {/* Decorative Plate Rim */}
      <mesh position={[0, 0.12, 0]}>
        <torusGeometry args={[waxRadius * 2.1, 0.04, 16, 48]} />
        <meshStandardMaterial 
          color="#d4af37" 
          roughness={0.3} 
          metalness={0.7} 
        />
      </mesh>

      {/* Candle Body (Wax Column) */}
      <mesh position={[0, waxHeight / 2 + 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[waxRadius, waxRadius * 1.05, waxHeight, 48]} />
        <meshStandardMaterial 
          color={waxColor}
          roughness={0.55}
          metalness={0.05}
        />
      </mesh>

      {/* Wax Melt Pool (Top Indentation) */}
      <mesh position={[0, waxHeight + 0.09, 0]}>
        <cylinderGeometry args={[waxRadius * 0.9, waxRadius * 0.85, 0.05, 32]} />
        <meshStandardMaterial 
          color={progress > 0.2 ? '#ffeacc' : '#fcefe6'} 
          roughness={0.2} 
          metalness={0.1}
          emissive={progress > 0.3 ? '#ff9a3c' : '#000000'}
          emissiveIntensity={progress * 0.35}
        />
      </mesh>

      {/* Wick */}
      <mesh position={[0, waxHeight + 0.22, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.22, 16]} />
        <meshStandardMaterial 
          color={progress > 0.5 ? '#ff4400' : '#1a1412'} 
          roughness={0.9} 
          emissive={progress > 0.5 ? '#ff2200' : '#000000'}
          emissiveIntensity={progress * 0.4}
        />
      </mesh>

      {/* 3D Flame Object at Wick Tip */}
      <Flame
        position={[0, waxHeight + 0.33, 0]}
        progress={progress}
        isLit={isLit}
        config={flameConfig}
      />
    </group>
  );
}
