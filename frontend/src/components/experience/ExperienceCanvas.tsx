"use client";

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';

interface ExperienceCanvasProps {
  children: React.ReactNode;
}

export function ExperienceCanvas({ children }: ExperienceCanvasProps) {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-gradient-to-b from-[#0f0a1c] via-[#160e29] to-[#0a0612]">
      <Canvas
        shadows
        camera={{ position: [0, 1.2, 5], fov: 45 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
}
