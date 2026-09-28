"use client";

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { ParticleHeart } from './ParticleHeart';
import { PhotoSphere } from './PhotoSphere';

// Một số ảnh dummy mẫu
const SAMPLE_IMAGES = [
  "/dreamy-hero-bg.jpg",
  "/dreamy-galaxy.jpg",
  "/dreamy-luxury.jpg",
  "/anh2.png",
  "/anh3.jpg",
  "/dreamy-hero-bg.jpg",
  "/dreamy-galaxy.jpg",
  "/dreamy-luxury.jpg",
  "/anh2.png",
  "/anh3.jpg",
];

export function SceneContainer() {
  return (
    <div className="absolute inset-0 w-full h-full bg-[#100714]">
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        
        {/* Nền bầu trời sao 3D */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        <Suspense fallback={null}>
          <ParticleHeart />
          <PhotoSphere images={SAMPLE_IMAGES} />
        </Suspense>

        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          minDistance={5} 
          maxDistance={30}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}
