"use client";

import React, { forwardRef, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { ParticleCandleFlame } from "./ParticleCandleFlame";

const CAKE_MODEL_URL = "/models/banhsinhnhatcheery.optimized.glb";
const MODEL_SCALE = 3.1;
const MODEL_CENTER = new THREE.Vector3(0.0040465, 0, -0.0100135);
const INFERRED_WICK = new THREE.Vector3(-0.092, 0.681, -0.112);

interface BirthdayCake3DProps {
  flameActive: boolean;
  extinguished: boolean;
}

function cloneOwnedMaterial(material: THREE.Material) {
  const cloned = material.clone();
  const values = cloned as unknown as Record<string, unknown>;

  Object.keys(values).forEach((key) => {
    const value = values[key];
    if (value instanceof THREE.Texture) {
      const texture = value.clone();
      texture.needsUpdate = true;
      values[key] = texture;
    }
  });

  return cloned;
}

function disposeOwnedScene(scene: THREE.Object3D) {
  const disposedTextures = new Set<THREE.Texture>();
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => {
      const values = material as unknown as Record<string, unknown>;
      Object.values(values).forEach((value) => {
        if (value instanceof THREE.Texture && !disposedTextures.has(value)) {
          disposedTextures.add(value);
          value.dispose();
        }
      });
      material.dispose();
    });
  });
}

export const BirthdayCake3D = forwardRef<THREE.Group, BirthdayCake3DProps>(
  function BirthdayCake3D({ flameActive, extinguished }, forwardedRef) {
    const { scene } = useGLTF(CAKE_MODEL_URL);
    const ownedScene = useMemo(() => {
      const cloned = scene.clone(true);
      cloned.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry = object.geometry.clone();
        object.material = Array.isArray(object.material)
          ? object.material.map(cloneOwnedMaterial)
          : cloneOwnedMaterial(object.material);
        object.castShadow = true;
        object.receiveShadow = true;
      });
      return cloned;
    }, [scene]);

    useEffect(() => () => disposeOwnedScene(ownedScene), [ownedScene]);

    const modelPosition = useMemo<[number, number, number]>(() => [
      -MODEL_CENTER.x * MODEL_SCALE,
      0,
      -MODEL_CENTER.z * MODEL_SCALE,
    ], []);
    const wickPosition = useMemo<[number, number, number]>(() => [
      (INFERRED_WICK.x - MODEL_CENTER.x) * MODEL_SCALE,
      INFERRED_WICK.y * MODEL_SCALE + 0.035,
      (INFERRED_WICK.z - MODEL_CENTER.z) * MODEL_SCALE,
    ], []);

    return (
      <group ref={forwardedRef}>
        <primitive object={ownedScene} scale={MODEL_SCALE} position={modelPosition} dispose={null} />
        <mesh position={[wickPosition[0], wickPosition[1] - 0.035, wickPosition[2]]} castShadow>
          <cylinderGeometry args={[0.018, 0.023, 0.075, 10]} />
          <meshStandardMaterial color="#2a1712" roughness={0.9} />
        </mesh>
        <group position={wickPosition} scale={0.62}>
          <ParticleCandleFlame active={flameActive} extinguished={extinguished} particleCount={1200} />
        </group>
      </group>
    );
  },
);

export function ProceduralBirthdayCake({ flameActive, extinguished }: BirthdayCake3DProps) {
  return (
    <group>
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.45, 1.55, 1.1, 48]} />
        <meshStandardMaterial color="#fff1dc" roughness={0.34} metalness={0.04} />
      </mesh>
      <mesh position={[0, 1.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.42, 1.42, 0.15, 48]} />
        <meshStandardMaterial color="#f8b8c5" roughness={0.3} />
      </mesh>
      {Array.from({ length: 10 }, (_, index) => {
        const angle = (index / 10) * Math.PI * 2;
        return (
          <mesh key={index} position={[Math.cos(angle) * 1.05, 1.27, Math.sin(angle) * 1.05]} castShadow>
            <sphereGeometry args={[0.14, 14, 10]} />
            <meshPhysicalMaterial color="#a70f2d" roughness={0.2} clearcoat={0.8} />
          </mesh>
        );
      })}
      <mesh position={[0, 1.55, 0]} castShadow>
        <cylinderGeometry args={[0.065, 0.075, 0.65, 18]} />
        <meshStandardMaterial color="#f7d36c" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.9, 0]}>
        <cylinderGeometry args={[0.016, 0.02, 0.08, 8]} />
        <meshStandardMaterial color="#24120e" roughness={1} />
      </mesh>
      <group position={[0, 1.95, 0]} scale={0.62}>
        <ParticleCandleFlame active={flameActive} extinguished={extinguished} particleCount={1200} />
      </group>
    </group>
  );
}

export function CakeLoadingPlaceholder() {
  const ringRef = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (!ringRef.current) return;
    ringRef.current.rotation.z += delta * 0.9;
    ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.8) * 0.2;
  });

  return (
    <group position={[0, 1.2, 0]}>
      <mesh ref={ringRef}>
        <torusGeometry args={[0.65, 0.035, 10, 48]} />
        <meshBasicMaterial color="#fcd34d" transparent opacity={0.72} />
      </mesh>
    </group>
  );
}

useGLTF.preload(CAKE_MODEL_URL);
