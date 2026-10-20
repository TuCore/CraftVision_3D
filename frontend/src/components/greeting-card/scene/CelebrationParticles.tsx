"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const TAU = Math.PI * 2;
const CONFETTI_COUNT = 600;
const FIREWORK_BURST_COUNT = 6;
const FIREWORK_PARTICLES_PER_BURST = 180;
const FIREWORK_PARTICLE_COUNT =
  FIREWORK_BURST_COUNT * FIREWORK_PARTICLES_PER_BURST;
const FIREWORK_CYCLE_DURATION = 5.2;

const CONFETTI_COLORS = [0xffd65a, 0xf29ba7, 0xffe2b8, 0xdcae52] as const;
const FIREWORK_COLORS = [
  0xff4f81,
  0xffd166,
  0x6ee7ff,
  0x9b7bff,
  0x72f1a7,
  0xff8c42,
] as const;

const FIREWORK_ORIGINS = [
  -3.8, 3.0, -2.5,
  -1.9, 4.45, -4.5,
  2.25, 3.55, -2.2,
  3.9, 4.65, -5.0,
  0.5, 5.0, -6.0,
  -3.0, 4.75, -5.3,
] as const;

const FIREWORK_DELAYS = [0.02, 0.42, 0.88, 1.35, 1.88, 2.48] as const;

type CelebrationEffectProps = {
  active: boolean;
};

function createSoftParticleTexture(): THREE.DataTexture {
  const size = 32;
  const pixels = new Uint8Array(size * size * 4);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const offset = (y * size + x) * 4;
      const normalizedX = (x + 0.5) / size - 0.5;
      const normalizedY = (y + 0.5) / size - 0.5;
      const distance = Math.sqrt(
        normalizedX * normalizedX + normalizedY * normalizedY,
      );
      const alpha = Math.max(0, 1 - distance * 2);

      pixels[offset] = 255;
      pixels[offset + 1] = 255;
      pixels[offset + 2] = 255;
      pixels[offset + 3] = Math.round(alpha * alpha * 255);
    }
  }

  const texture = new THREE.DataTexture(
    pixels,
    size,
    size,
    THREE.RGBAFormat,
    THREE.UnsignedByteType,
  );
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

export function ConfettiBurst({ active }: CelebrationEffectProps) {
  const elapsedRef = useRef(0);
  const wasActiveRef = useRef(false);

  const resources = useMemo(() => {
    const positions = new Float32Array(CONFETTI_COUNT * 3);
    const initialPositions = new Float32Array(CONFETTI_COUNT * 3);
    const velocities = new Float32Array(CONFETTI_COUNT * 3);
    const initialVelocities = new Float32Array(CONFETTI_COUNT * 3);
    const colors = new Float32Array(CONFETTI_COUNT * 3);
    const baseColors = new Float32Array(CONFETTI_COUNT * 3);
    const lifetimes = new Float32Array(CONFETTI_COUNT);
    const phases = new Float32Array(CONFETTI_COUNT);
    const color = new THREE.Color();

    for (let index = 0; index < CONFETTI_COUNT; index += 1) {
      const positionOffset = index * 3;
      const spawnAzimuth = Math.random() * TAU;
      const spawnVertical = Math.random() * 2 - 1;
      const spawnHorizontal = Math.sqrt(1 - spawnVertical * spawnVertical);
      const spawnRadius = Math.cbrt(Math.random()) * 0.2;

      initialPositions[positionOffset] =
        Math.cos(spawnAzimuth) * spawnHorizontal * spawnRadius;
      initialPositions[positionOffset + 1] = spawnVertical * spawnRadius;
      initialPositions[positionOffset + 2] =
        Math.sin(spawnAzimuth) * spawnHorizontal * spawnRadius;

      const launchAzimuth = Math.random() * TAU;
      const launchVertical = Math.random() * 2 - 1;
      const launchHorizontal = Math.sqrt(1 - launchVertical * launchVertical);
      const speed = 4.2 + Math.random() * 4.6;

      initialVelocities[positionOffset] =
        Math.cos(launchAzimuth) * launchHorizontal * speed;
      initialVelocities[positionOffset + 1] = launchVertical * speed + 4.6;
      initialVelocities[positionOffset + 2] =
        Math.sin(launchAzimuth) * launchHorizontal * speed;

      color.setHex(
        CONFETTI_COLORS[
          Math.floor(Math.random() * CONFETTI_COLORS.length)
        ],
      );
      baseColors[positionOffset] = color.r;
      baseColors[positionOffset + 1] = color.g;
      baseColors[positionOffset + 2] = color.b;

      lifetimes[index] = 3.4 + Math.random() * 1.8;
      phases[index] = Math.random() * TAU;
    }

    positions.set(initialPositions);
    velocities.set(initialVelocities);
    colors.set(baseColors);

    const positionAttribute = new THREE.BufferAttribute(positions, 3);
    const colorAttribute = new THREE.BufferAttribute(colors, 3);
    positionAttribute.setUsage(THREE.DynamicDrawUsage);
    colorAttribute.setUsage(THREE.DynamicDrawUsage);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", positionAttribute);
    geometry.setAttribute("color", colorAttribute);

    const texture = createSoftParticleTexture();
    const material = new THREE.PointsMaterial({
      size: 0.14,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      alphaTest: 0.015,
      depthWrite: false,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });

    return {
      positions,
      initialPositions,
      velocities,
      initialVelocities,
      colors,
      baseColors,
      lifetimes,
      phases,
      positionAttribute,
      colorAttribute,
      geometry,
      material,
      texture,
    };
  }, []);
  const resourcesRef = useRef(resources);

  useEffect(() => {
    return () => {
      resources.geometry.dispose();
      resources.material.dispose();
      resources.texture.dispose();
    };
  }, [resources]);

  useFrame((_, delta) => {
    const mutableResources = resourcesRef.current;

    if (!active) {
      wasActiveRef.current = false;
      return;
    }

    if (!wasActiveRef.current) {
      elapsedRef.current = 0;
      mutableResources.positions.set(mutableResources.initialPositions);
      mutableResources.velocities.set(mutableResources.initialVelocities);
      mutableResources.colors.set(mutableResources.baseColors);
      mutableResources.positionAttribute.needsUpdate = true;
      mutableResources.colorAttribute.needsUpdate = true;
      wasActiveRef.current = true;
    }

    const frameDelta = Math.min(delta, 1 / 30);
    const elapsed = elapsedRef.current + frameDelta;
    const drag = Math.exp(-1.25 * frameDelta);
    elapsedRef.current = elapsed;

    for (let index = 0; index < CONFETTI_COUNT; index += 1) {
      const positionOffset = index * 3;
      const lifetime = mutableResources.lifetimes[index];

      if (elapsed >= lifetime) {
        mutableResources.colors[positionOffset] = 0;
        mutableResources.colors[positionOffset + 1] = 0;
        mutableResources.colors[positionOffset + 2] = 0;
        continue;
      }

      const phase = mutableResources.phases[index];
      mutableResources.velocities[positionOffset] =
        mutableResources.velocities[positionOffset] * drag +
        Math.sin(elapsed * 4.2 + phase) * 0.35 * frameDelta;
      mutableResources.velocities[positionOffset + 1] =
        mutableResources.velocities[positionOffset + 1] * drag -
        7.8 * frameDelta;
      mutableResources.velocities[positionOffset + 2] =
        mutableResources.velocities[positionOffset + 2] * drag +
        Math.cos(elapsed * 3.7 + phase) * 0.35 * frameDelta;

      mutableResources.positions[positionOffset] +=
        mutableResources.velocities[positionOffset] * frameDelta;
      mutableResources.positions[positionOffset + 1] +=
        mutableResources.velocities[positionOffset + 1] * frameDelta;
      mutableResources.positions[positionOffset + 2] +=
        mutableResources.velocities[positionOffset + 2] * frameDelta;

      const fadeIn = Math.min(1, elapsed * 8);
      const fadeOut = Math.min(1, (lifetime - elapsed) / 1.15);
      const sparkle =
        0.72 + 0.28 * Math.abs(Math.sin(elapsed * 12 + phase));
      const brightness = fadeIn * fadeOut * sparkle;

      mutableResources.colors[positionOffset] =
        mutableResources.baseColors[positionOffset] * brightness;
      mutableResources.colors[positionOffset + 1] =
        mutableResources.baseColors[positionOffset + 1] * brightness;
      mutableResources.colors[positionOffset + 2] =
        mutableResources.baseColors[positionOffset + 2] * brightness;
    }

    mutableResources.positionAttribute.needsUpdate = true;
    mutableResources.colorAttribute.needsUpdate = true;
  });

  return (
    <points
      geometry={resources.geometry}
      material={resources.material}
      visible={active}
      frustumCulled={false}
    />
  );
}

export function Fireworks({ active }: CelebrationEffectProps) {
  const elapsedRef = useRef(0);
  const wasActiveRef = useRef(false);

  const resources = useMemo(() => {
    const positions = new Float32Array(FIREWORK_PARTICLE_COUNT * 3);
    const velocities = new Float32Array(FIREWORK_PARTICLE_COUNT * 3);
    const origins = new Float32Array(FIREWORK_PARTICLE_COUNT * 3);
    const colors = new Float32Array(FIREWORK_PARTICLE_COUNT * 3);
    const baseColors = new Float32Array(FIREWORK_PARTICLE_COUNT * 3);
    const delays = new Float32Array(FIREWORK_PARTICLE_COUNT);
    const lifetimes = new Float32Array(FIREWORK_PARTICLE_COUNT);
    const phases = new Float32Array(FIREWORK_PARTICLE_COUNT);
    const color = new THREE.Color();

    for (let burst = 0; burst < FIREWORK_BURST_COUNT; burst += 1) {
      const originOffset = burst * 3;

      for (
        let particle = 0;
        particle < FIREWORK_PARTICLES_PER_BURST;
        particle += 1
      ) {
        const index = burst * FIREWORK_PARTICLES_PER_BURST + particle;
        const positionOffset = index * 3;
        const azimuth = Math.random() * TAU;
        const vertical = Math.random() * 2 - 1;
        const horizontal = Math.sqrt(1 - vertical * vertical);
        const speed = 2.6 + Math.random() * 2.7;

        origins[positionOffset] = FIREWORK_ORIGINS[originOffset];
        origins[positionOffset + 1] = FIREWORK_ORIGINS[originOffset + 1];
        origins[positionOffset + 2] = FIREWORK_ORIGINS[originOffset + 2];
        positions[positionOffset] = origins[positionOffset];
        positions[positionOffset + 1] = origins[positionOffset + 1];
        positions[positionOffset + 2] = origins[positionOffset + 2];

        velocities[positionOffset] = Math.cos(azimuth) * horizontal * speed;
        velocities[positionOffset + 1] = vertical * speed;
        velocities[positionOffset + 2] = Math.sin(azimuth) * horizontal * speed;

        color.setHex(
          FIREWORK_COLORS[
            (burst * 2 + Math.floor(Math.random() * 3)) %
              FIREWORK_COLORS.length
          ],
        );
        baseColors[positionOffset] = color.r;
        baseColors[positionOffset + 1] = color.g;
        baseColors[positionOffset + 2] = color.b;

        delays[index] = FIREWORK_DELAYS[burst] + Math.random() * 0.1;
        lifetimes[index] = 1.75 + Math.random() * 0.65;
        phases[index] = Math.random() * TAU;
      }
    }

    const positionAttribute = new THREE.BufferAttribute(positions, 3);
    const colorAttribute = new THREE.BufferAttribute(colors, 3);
    positionAttribute.setUsage(THREE.DynamicDrawUsage);
    colorAttribute.setUsage(THREE.DynamicDrawUsage);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", positionAttribute);
    geometry.setAttribute("color", colorAttribute);

    const texture = createSoftParticleTexture();
    const material = new THREE.PointsMaterial({
      size: 0.23,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      alphaTest: 0.01,
      depthWrite: false,
      depthTest: false,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });

    return {
      positions,
      velocities,
      origins,
      colors,
      baseColors,
      delays,
      lifetimes,
      phases,
      positionAttribute,
      colorAttribute,
      geometry,
      material,
      texture,
    };
  }, []);
  const resourcesRef = useRef(resources);

  useEffect(() => {
    return () => {
      resources.geometry.dispose();
      resources.material.dispose();
      resources.texture.dispose();
    };
  }, [resources]);

  useFrame((_, delta) => {
    const mutableResources = resourcesRef.current;

    if (!active) {
      wasActiveRef.current = false;
      return;
    }

    if (!wasActiveRef.current) {
      elapsedRef.current = 0;
      mutableResources.colors.fill(0);
      wasActiveRef.current = true;
    }

    const frameDelta = Math.min(delta, 1 / 30);
    elapsedRef.current += frameDelta;
    const cycleTime = elapsedRef.current % FIREWORK_CYCLE_DURATION;

    for (let index = 0; index < FIREWORK_PARTICLE_COUNT; index += 1) {
      const positionOffset = index * 3;
      const age = cycleTime - mutableResources.delays[index];
      const lifetime = mutableResources.lifetimes[index];

      if (age < 0 || age >= lifetime) {
        mutableResources.colors[positionOffset] = 0;
        mutableResources.colors[positionOffset + 1] = 0;
        mutableResources.colors[positionOffset + 2] = 0;
        continue;
      }

      const normalizedAge = age / lifetime;
      const phase = mutableResources.phases[index];
      const drift = Math.sin(age * 2.8 + phase) * age * 0.045;

      mutableResources.positions[positionOffset] =
        mutableResources.origins[positionOffset] +
        mutableResources.velocities[positionOffset] * age +
        drift;
      mutableResources.positions[positionOffset + 1] =
        mutableResources.origins[positionOffset + 1] +
        mutableResources.velocities[positionOffset + 1] * age -
        0.72 * age * age;
      mutableResources.positions[positionOffset + 2] =
        mutableResources.origins[positionOffset + 2] +
        mutableResources.velocities[positionOffset + 2] * age -
        drift * 0.65;

      const fade = (1 - normalizedAge) * (1 - normalizedAge);
      const ignition = Math.min(1, age * 20);
      const sparkle = 0.62 + 0.38 * Math.abs(Math.sin(age * 22 + phase));
      const brightness = ignition * fade * sparkle;

      mutableResources.colors[positionOffset] =
        mutableResources.baseColors[positionOffset] * brightness;
      mutableResources.colors[positionOffset + 1] =
        mutableResources.baseColors[positionOffset + 1] * brightness;
      mutableResources.colors[positionOffset + 2] =
        mutableResources.baseColors[positionOffset + 2] * brightness;
    }

    mutableResources.positionAttribute.needsUpdate = true;
    mutableResources.colorAttribute.needsUpdate = true;
  });

  return (
    <points
      geometry={resources.geometry}
      material={resources.material}
      visible={active}
      frustumCulled={false}
      renderOrder={10}
    />
  );
}
