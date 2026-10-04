"use client";

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { Text3DConfig, DEFAULT_TEXT3D_CONFIG } from '@/types/experience';

interface Dynamic3DTextProps {
  recipientName: string;
  message?: string;
  senderName?: string;
  isCompleted?: boolean;
  position?: [number, number, number];
  config?: Partial<Text3DConfig>;
}

export function Dynamic3DText({
  recipientName,
  message,
  senderName,
  isCompleted = false,
  position = [0, 1.45, 0],
  config = {},
}: Dynamic3DTextProps) {
  const mergedConfig = { ...DEFAULT_TEXT3D_CONFIG, ...config };
  const { nameColor, nameGlowColor, messageColor, nameFontSize, messageFontSize, floatSpeed } = mergedConfig;

  const groupRef = useRef<THREE.Group>(null);
  const [revealProgress, setRevealProgress] = useState(0);

  // Format recipient name in elegant uppercase
  const displayName = recipientName ? recipientName.toUpperCase() : 'BẠN';

  useFrame((_, delta) => {
    // Smooth fade & scale-in when isCompleted triggers
    if (isCompleted && revealProgress < 1) {
      setRevealProgress(prev => Math.min(1, prev + delta * 0.8)); // takes ~1.2s to fully reveal
    } else if (!isCompleted && revealProgress > 0) {
      setRevealProgress(prev => Math.max(0, prev - delta * 2.5)); // fast reset
    }

    if (groupRef.current) {
      // Scale group with ease-out cubic
      const s = 1 - Math.pow(1 - revealProgress, 3);
      groupRef.current.scale.setScalar(s);
      
      // Gentle vertical float up as it appears
      groupRef.current.position.y = position[1] + (s * 0.25);
    }
  });

  if (revealProgress <= 0.01) {
    return null;
  }

  return (
    <group ref={groupRef} position={position}>
      <Float
        speed={floatSpeed}
        rotationIntensity={0.1}
        floatIntensity={0.25}
        floatingRange={[-0.05, 0.05]}
      >
        <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
          {/* Subtle Ambient Backlight for Text Glow */}
          <pointLight
            position={[0, 0, -0.3]}
            intensity={revealProgress * 1.5}
            color={nameGlowColor}
            distance={4}
          />

          {/* 1. Recipient Name Header */}
          <Text
            position={[0, 0.42, 0]}
            fontSize={nameFontSize}
            color={nameColor}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.12}
            fillOpacity={revealProgress}
          >
            {displayName}
            <meshStandardMaterial
              attach="material"
              color={nameColor}
              emissive={nameGlowColor}
              emissiveIntensity={0.9 * revealProgress}
              roughness={0.2}
              transparent
              opacity={revealProgress}
            />
          </Text>

          {/* 2. Delicate Celestial Divider */}
          <Text
            position={[0, 0.18, 0]}
            fontSize={0.11}
            color="#fb7185"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.25}
            fillOpacity={revealProgress * 0.8}
          >
            ✦  •  ✦
            <meshBasicMaterial
              attach="material"
              color="#fb7185"
              transparent
              opacity={revealProgress * 0.8}
            />
          </Text>

          {/* 3. Personal Message */}
          {message && (
            <Text
              position={[0, -0.05, 0]}
              fontSize={messageFontSize}
              color={messageColor}
              anchorX="center"
              anchorY="top"
              maxWidth={2.6}
              lineHeight={1.45}
              textAlign="center"
              fillOpacity={revealProgress * 0.95}
            >
              {`"${message}"`}
              <meshStandardMaterial
                attach="material"
                color={messageColor}
                emissive="#f472b6"
                emissiveIntensity={0.3 * revealProgress}
                roughness={0.3}
                transparent
                opacity={revealProgress * 0.95}
              />
            </Text>
          )}

          {/* 4. Sender Signature */}
          {senderName && (
            <Text
              position={[0, -0.42, 0]}
              fontSize={messageFontSize * 0.85}
              color="#fda4af"
              anchorX="center"
              anchorY="top"
              letterSpacing={0.05}
              fillOpacity={revealProgress * 0.85}
            >
              {`— Từ: ${senderName}`}
              <meshBasicMaterial
                attach="material"
                color="#fda4af"
                transparent
                opacity={revealProgress * 0.85}
              />
            </Text>
          )}
        </Billboard>
      </Float>
    </group>
  );
}
