"use client";

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface PhotoSphereProps {
  images: string[];
}

export function PhotoSphere({ images }: PhotoSphereProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  const textures = useTexture(images);

  const planes = useMemo(() => {
    const items = [];
    const count = images.length;

    for (let i = 0; i < count; i++) {
      // Sắp xếp các bức ảnh theo hình xoắn ốc bên dưới trái tim
      const radius = 2 + (i / count) * 4; // Bán kính tăng dần từ 2 đến 6
      const angle = i * Math.PI * 0.8; // Xoắn ốc
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      // Trải theo trục y ở phía dưới (vùng của spiral)
      const y = -2.5 + (Math.random() - 0.5) * 1.5;
      
      const position = new THREE.Vector3(x, y, z);
      
      // Hướng quay của tấm ảnh luôn ngửa lên một chút và nhìn về camera
      const quaternion = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(-Math.PI / 6, angle + Math.PI/2, 0)
      );
      
      items.push({
        position,
        quaternion,
        texture: textures[i % textures.length]
      });
    }
    return items;
  }, [images, textures]);

  useFrame((state) => {
    if (groupRef.current) {
      // Xoay đồng bộ với Spiral Galaxy
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {planes.map((plane, index) => (
        <mesh 
          key={index} 
          position={plane.position} 
          quaternion={plane.quaternion}
        >
          {/* Tỉ lệ ảnh nhỏ lại để phù hợp với vòng xoáy */}
          <planeGeometry args={[1.2, 1.2]} />
          <meshBasicMaterial 
            map={plane.texture} 
            side={THREE.DoubleSide} 
            transparent
            opacity={0.95}
          />
        </mesh>
      ))}
    </group>
  );
}
