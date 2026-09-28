"use client";

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export function ParticleHeart() {
  const pointsRef = useRef<THREE.Points>(null);
  const spiralRef = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  // Trạng thái morph: 0 = Trái tim, 1 = Lốc xoáy, 2 = Chữ
  const phaseRef = useRef<number>(0);
  const vortexTimeRef = useRef<number>(0);

  const particleCount = 15000;

  // 1. Khởi tạo Trái tim thể tích (Volume Heart)
  const [heartPositions, heartColors] = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const color = new THREE.Color();
    
    let i = 0;
    while (i < particleCount) {
      const x = (Math.random() - 0.5) * 3;
      const y = (Math.random() - 0.5) * 3;
      const z = (Math.random() - 0.5) * 3;
      
      const a = x * x + 2.25 * z * z + y * y - 1;
      const val = a * a * a - x * x * y * y * y - 0.1125 * z * z * y * y * y;
      
      if (val <= 0) {
        const scale = 3.5;
        positions[i * 3] = x * scale;
        positions[i * 3 + 1] = y * scale + 4;
        positions[i * 3 + 2] = z * scale;
        
        color.setHSL(1.0, 0.9 + Math.random() * 0.1, 0.4 + Math.random() * 0.3);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
        i++;
      }
    }
    return [positions, colors];
  }, [particleCount]);

  // 2. Tạo toạ độ cho chữ "Anh Yêu Em" bằng Canvas 2D Offscreen
  const [textPositions, setTextPositions] = useState<Float32Array | null>(null);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Vẽ chữ để lấy pixel
    ctx.font = 'bold 160px "Times New Roman", serif'; 
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Anh Yêu Em', canvas.width / 2, canvas.height / 2);
    
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const validPixels = [];
    
    // Quét các pixel sáng màu
    for (let y = 0; y < canvas.height; y += 2) {
      for (let x = 0; x < canvas.width; x += 2) {
        const idx = (y * canvas.width + x) * 4;
        if (imgData[idx] > 128) {
          validPixels.push({ x, y });
        }
      }
    }
    
    if (validPixels.length === 0) return;

    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      // Trộn ngẫu nhiên pixel để lúc xoáy các hạt không bị đi theo thứ tự vệt dài
      const p = validPixels[Math.floor(Math.random() * validPixels.length)];
      
      const px = (p.x / canvas.width - 0.5) * 22; 
      const py = -(p.y / canvas.height - 0.5) * 7.3 + 4; 
      const pz = (Math.random() - 0.5) * 0.8;
      
      positions[i * 3] = px + (Math.random() - 0.5) * 0.15;
      positions[i * 3 + 1] = py + (Math.random() - 0.5) * 0.15;
      positions[i * 3 + 2] = pz;
    }
    
    setTextPositions(positions);
  }, [particleCount]);

  // Buffer hiển thị hiện tại (Current Positions Array)
  const currentPositions = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    arr.set(heartPositions);
    return arr;
  }, [heartPositions, particleCount]);

  // 3. Khởi tạo Vòng xoáy thiên hà (Spiral Galaxy) ở bên dưới
  const [spiralPositions, spiralColors] = useMemo(() => {
    const positions = [];
    const colors = [];
    const color = new THREE.Color();
    const scount = 5000;
    
    for (let i = 0; i < scount; i++) {
      const radius = Math.random() * 8;
      const angle = radius * 3 + Math.random() * Math.PI * 2;
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * (1 / (radius + 0.1)) - 3;
      
      positions.push(x, y, z);
      
      color.setHSL(1.0, 0.8, 0.4 + Math.random() * 0.4);
      colors.push(color.r, color.g, color.b);
    }
    return [new Float32Array(positions), new Float32Array(colors)];
  }, []);

  const floatingTexts = [
    { text: "Em là tất cả", radius: 4, angle: 0 },
    { text: "Anh yêu em nhiều lắm!", radius: 6, angle: Math.PI / 2 },
    { text: "Mãi mãi bên nhau", radius: 3, angle: Math.PI },
    { text: "Yêu em", radius: 5, angle: Math.PI * 1.5 },
    { text: "Thế giới của anh", radius: 7, angle: Math.PI / 4 },
    { text: "My love", radius: 5.5, angle: Math.PI * 1.2 },
  ];

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const phase = phaseRef.current;
    
    if (pointsRef.current) {
      const positionsAttr = pointsRef.current.geometry.attributes.position;
      const positions = positionsAttr.array as Float32Array;

      // Xử lý logic nhịp tim nếu đang ở Phase 0
      if (phase === 0) {
        const beatCycle = (time % 0.8) / 0.8;
        let heartScale = 1;
        if (beatCycle < 0.2) {
          heartScale = 1 + Math.sin((beatCycle / 0.2) * Math.PI) * 0.06;
        } else if (beatCycle > 0.3 && beatCycle < 0.5) {
          heartScale = 1 + Math.sin(((beatCycle - 0.3) / 0.2) * Math.PI) * 0.04;
        }
        pointsRef.current.scale.set(heartScale, heartScale, heartScale);
        pointsRef.current.rotation.y = Math.sin(time * 0.3) * 0.15;
      } else {
        // Khi morphing thì ngưng nhịp tim, scale và xoay về mặc định
        pointsRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        pointsRef.current.rotation.y = THREE.MathUtils.lerp(pointsRef.current.rotation.y, 0, 0.1);
      }

      // Xử lý Morphing Từng Hạt (Lerping Particles)
      const lerpSpeed = phase === 1 ? 0.03 : 0.05;

      for (let i = 0; i < particleCount; i++) {
        const ix = i * 3;
        const iy = ix + 1;
        const iz = ix + 2;

        let targetX = heartPositions[ix];
        let targetY = heartPositions[iy];
        let targetZ = heartPositions[iz];

        if (phase === 1) {
          // Lốc xoáy hình phễu (Tornado Funnel)
          const timeSinceVortex = time - vortexTimeRef.current;
          
          // Chiều cao h chuẩn hóa từ 0 đến 1 dựa trên index
          const h = i / particleCount;
          
          // Bán kính r mở rộng dần từ dưới lên trên (đặc trưng của phễu)
          // Đáy phễu nhỏ (r ~ 1), miệng phễu to (r ~ 10)
          const r = 0.5 + h * 9 + Math.random() * 1.0; 
          
          // Trải dọc theo trục Y từ -4 đến +8
          const targetYFunnel = h * 12 - 4; 
          
          // Góc xoay: h*PI*30 để tạo các vòng xoắn ốc xếp chồng lên nhau, 
          // cộng thêm time * tốc_độ để xoay tít mù.
          const angle = h * Math.PI * 30 + timeSinceVortex * 15;
          
          targetX = r * Math.cos(angle);
          targetZ = r * Math.sin(angle);
          targetY = targetYFunnel;
        } 
        else if (phase === 2 && textPositions) {
          // Ghép thành chữ
          targetX = textPositions[ix];
          targetY = textPositions[iy];
          targetZ = textPositions[iz];
        }

        // Nội suy mượt mà (Lerp)
        positions[ix] += (targetX - positions[ix]) * lerpSpeed;
        positions[iy] += (targetY - positions[iy]) * lerpSpeed;
        positions[iz] += (targetZ - positions[iz]) * lerpSpeed;
      }
      
      positionsAttr.needsUpdate = true;
    }

    if (spiralRef.current) {
      spiralRef.current.rotation.y = time * 0.1;
    }
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.05;
    }
  });

  const handleInteraction = (e: any) => {
    e.stopPropagation();
    if (phaseRef.current === 0) {
      // 1. Kích hoạt hiệu ứng lốc xoáy
      phaseRef.current = 1;
      vortexTimeRef.current = performance.now() / 1000;
      
      // 2. Chờ 1.5 giây để bão tan, rồi xếp thành chữ
      setTimeout(() => {
        phaseRef.current = 2;
      }, 1500);
    } else if (phaseRef.current === 2) {
      // Click lần nữa để quay lại thành trái tim
      phaseRef.current = 0;
    }
  };

  // Khởi tạo Texture tròn phát sáng cho Hạt (Soft Circle Texture)
  const particleTexture = useMemo(() => {
    if (typeof document === 'undefined') return null; // SSR fallback
    
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    if (context) {
      // Tạo hiệu ứng toả sáng dần từ tâm ra ngoài (Radial Gradient)
      const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      context.fillStyle = gradient;
      context.fillRect(0, 0, 64, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  return (
    <group ref={groupRef}>
      {/* Khối Trái Tim tương tác */}
      <points 
        ref={pointsRef} 
        onClick={handleInteraction}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'auto'}
      >
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={particleCount} array={currentPositions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={heartColors.length / 3} array={heartColors} itemSize={3} />
        </bufferGeometry>
        {/* map={particleTexture} giúp hạt có hình tròn mờ (glow) */}
        <pointsMaterial 
          size={0.15} 
          vertexColors 
          transparent 
          opacity={1.0} 
          sizeAttenuation 
          blending={THREE.AdditiveBlending} 
          depthWrite={false} 
          map={particleTexture || undefined}
        />
      </points>

      {/* Vòng Xoáy Thiên Hà */}
      <points ref={spiralRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={spiralPositions.length / 3} array={spiralPositions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={spiralColors.length / 3} array={spiralColors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial 
          size={0.12} 
          vertexColors 
          transparent 
          opacity={0.8} 
          sizeAttenuation 
          blending={THREE.AdditiveBlending} 
          depthWrite={false} 
          map={particleTexture || undefined}
        />
      </points>

      {/* Chữ nổi xung quanh */}
      {floatingTexts.map((item, index) => {
        const x = Math.cos(item.angle) * item.radius;
        const z = Math.sin(item.angle) * item.radius;
        return (
          <Text
            key={index}
            position={[x, -2.5 + Math.random() * 0.5, z]}
            rotation={[-Math.PI / 4, item.angle + Math.PI/2, 0]}
            fontSize={0.4}
            color="#ff3333"
            anchorX="center"
            anchorY="middle"
          >
            {item.text}
          </Text>
        );
      })}
    </group>
  );
}
