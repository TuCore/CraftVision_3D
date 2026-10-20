"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface ParticleCandleFlameProps {
  active: boolean;
  extinguished: boolean;
  particleCount?: number;
}

const MAX_PARTICLE_COUNT = 1200;
const FLAME_HEIGHT = 0.92;
const FLAME_RADIUS = 0.42;
const BASE_LIGHT_INTENSITY = 2.15;
const LIGHT_FADE_SECONDS = 0.4;
const SCATTER_SECONDS = 0.24;
const SMOKE_LIFETIME = 1.75;

interface HeatStop {
  at: number;
  color: THREE.Color;
}

const HEAT_STOPS: readonly HeatStop[] = [
  { at: 0, color: new THREE.Color("#1e3a8a") },
  { at: 0.15, color: new THREE.Color("#0284c7") },
  { at: 0.2, color: new THREE.Color("#fffbeb") },
  { at: 0.65, color: new THREE.Color("#fde047") },
  { at: 0.72, color: new THREE.Color("#f97316") },
  { at: 0.95, color: new THREE.Color("#ea580c") },
  { at: 1, color: new THREE.Color("#3b0806") },
];

const SMOKE_LIGHT = new THREE.Color("#b9bec6");
const SMOKE_DARK = new THREE.Color("#4b5058");

const vertexShader = /* glsl */ `
  uniform float uPixelRatio;

  attribute vec3 aColor;
  attribute float aAlpha;
  attribute float aSize;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    float perspective = 300.0 / max(0.25, -viewPosition.z);

    vColor = aColor;
    vAlpha = aAlpha;
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = clamp(aSize * uPixelRatio * perspective, 1.0, 18.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float distanceFromCenter = length(gl_PointCoord - vec2(0.5));
    float softDisc = 1.0 - smoothstep(0.08, 0.5, distanceFromCenter);
    float glow = exp(-18.0 * distanceFromCenter * distanceFromCenter);
    float alpha = vAlpha * softDisc;

    if (alpha < 0.003) discard;
    gl_FragColor = vec4(vColor * (1.0 + glow * 0.28), alpha);
  }
`;

interface FlameSimulation {
  geometry: THREE.BufferGeometry;
  material: THREE.ShaderMaterial;
  positionAttribute: THREE.BufferAttribute;
  colorAttribute: THREE.BufferAttribute;
  alphaAttribute: THREE.BufferAttribute;
  sizeAttribute: THREE.BufferAttribute;
  positions: Float32Array;
  colors: Float32Array;
  alphas: Float32Array;
  sizes: Float32Array;
  ages: Float32Array;
  lifespans: Float32Array;
  radialFactors: Float32Array;
  angles: Float32Array;
  angularSpeeds: Float32Array;
  driftPhases: Float32Array;
  baseSizes: Float32Array;
  scatterVelocities: Float32Array;
  extinctionAlphas: Float32Array;
  extinctionSizes: Float32Array;
  extinctionColors: Float32Array;
}

function pseudoRandom(index: number, salt: number): number {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function createSimulation(count: number): FlameSimulation {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const alphas = new Float32Array(count);
  const sizes = new Float32Array(count);
  const ages = new Float32Array(count);
  const lifespans = new Float32Array(count);
  const radialFactors = new Float32Array(count);
  const angles = new Float32Array(count);
  const angularSpeeds = new Float32Array(count);
  const driftPhases = new Float32Array(count);
  const baseSizes = new Float32Array(count);
  const scatterVelocities = new Float32Array(count * 3);
  const extinctionAlphas = new Float32Array(count);
  const extinctionSizes = new Float32Array(count);
  const extinctionColors = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const lifespan = 0.74 + pseudoRandom(index, 1) * 0.42;
    lifespans[index] = lifespan;
    ages[index] = pseudoRandom(index, 2) * lifespan;
    radialFactors[index] = Math.sqrt(pseudoRandom(index, 3));
    angles[index] = pseudoRandom(index, 4) * Math.PI * 2;
    angularSpeeds[index] = (pseudoRandom(index, 5) - 0.5) * 2.4;
    driftPhases[index] = pseudoRandom(index, 6) * Math.PI * 2;
    baseSizes[index] = 0.038 + pseudoRandom(index, 7) * 0.044;
  }

  const positionAttribute = new THREE.BufferAttribute(positions, 3);
  const colorAttribute = new THREE.BufferAttribute(colors, 3);
  const alphaAttribute = new THREE.BufferAttribute(alphas, 1);
  const sizeAttribute = new THREE.BufferAttribute(sizes, 1);

  positionAttribute.setUsage(THREE.DynamicDrawUsage);
  colorAttribute.setUsage(THREE.DynamicDrawUsage);
  alphaAttribute.setUsage(THREE.DynamicDrawUsage);
  sizeAttribute.setUsage(THREE.DynamicDrawUsage);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", positionAttribute);
  geometry.setAttribute("aColor", colorAttribute);
  geometry.setAttribute("aAlpha", alphaAttribute);
  geometry.setAttribute("aSize", sizeAttribute);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uPixelRatio: { value: 1 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    toneMapped: false,
  });

  return {
    geometry,
    material,
    positionAttribute,
    colorAttribute,
    alphaAttribute,
    sizeAttribute,
    positions,
    colors,
    alphas,
    sizes,
    ages,
    lifespans,
    radialFactors,
    angles,
    angularSpeeds,
    driftPhases,
    baseSizes,
    scatterVelocities,
    extinctionAlphas,
    extinctionSizes,
    extinctionColors,
  };
}

function resetParticleLifecycles(simulation: FlameSimulation, count: number): void {
  for (let index = 0; index < count; index += 1) {
    simulation.ages[index] = pseudoRandom(index, 17) * simulation.lifespans[index];
    simulation.alphas[index] = 0;
  }
}

function writeHeatColor(colors: Float32Array, index: number, lifeRatio: number): void {
  let lower = HEAT_STOPS[0];
  let upper = HEAT_STOPS[HEAT_STOPS.length - 1];

  for (let stopIndex = 1; stopIndex < HEAT_STOPS.length; stopIndex += 1) {
    if (lifeRatio <= HEAT_STOPS[stopIndex].at) {
      lower = HEAT_STOPS[stopIndex - 1];
      upper = HEAT_STOPS[stopIndex];
      break;
    }
  }

  const range = upper.at - lower.at;
  const mix = range > 0 ? THREE.MathUtils.clamp((lifeRatio - lower.at) / range, 0, 1) : 0;
  const offset = index * 3;
  colors[offset] = THREE.MathUtils.lerp(lower.color.r, upper.color.r, mix);
  colors[offset + 1] = THREE.MathUtils.lerp(lower.color.g, upper.color.g, mix);
  colors[offset + 2] = THREE.MathUtils.lerp(lower.color.b, upper.color.b, mix);
}

function beginExtinguishing(simulation: FlameSimulation, count: number): void {
  simulation.extinctionAlphas.set(simulation.alphas);
  simulation.extinctionSizes.set(simulation.sizes);
  simulation.extinctionColors.set(simulation.colors);

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    const x = simulation.positions[offset];
    const z = simulation.positions[offset + 2];
    const horizontalLength = Math.hypot(x, z);
    const fallbackAngle = simulation.angles[index];
    const radialX = horizontalLength > 0.0001 ? x / horizontalLength : Math.cos(fallbackAngle);
    const radialZ = horizontalLength > 0.0001 ? z / horizontalLength : Math.sin(fallbackAngle);
    const burstSpeed = 0.38 + pseudoRandom(index, 21) * 0.62;

    simulation.scatterVelocities[offset] = radialX * burstSpeed;
    simulation.scatterVelocities[offset + 1] = 0.3 + pseudoRandom(index, 22) * 0.46;
    simulation.scatterVelocities[offset + 2] = radialZ * burstSpeed;
  }
}

function markAttributesForUpload(simulation: FlameSimulation): void {
  simulation.positionAttribute.needsUpdate = true;
  simulation.colorAttribute.needsUpdate = true;
  simulation.alphaAttribute.needsUpdate = true;
  simulation.sizeAttribute.needsUpdate = true;
}

export function ParticleCandleFlame({
  active,
  extinguished,
  particleCount = MAX_PARTICLE_COUNT,
}: ParticleCandleFlameProps) {
  const count = Math.min(MAX_PARTICLE_COUNT, Math.max(1, Math.floor(particleCount)));
  const lightRef = useRef<THREE.PointLight>(null);
  const wasActiveRef = useRef(false);
  const wasExtinguishedRef = useRef(false);
  const activationRef = useRef(0);
  const extinguishedAtRef = useRef<number | null>(null);
  const extinctionLightIntensityRef = useRef(0);

  const simulationResource = useMemo(() => createSimulation(count), [count]);
  const simulationRef = useRef(simulationResource);

  useEffect(() => {
    simulationRef.current = simulationResource;

    return () => {
      simulationResource.geometry.dispose();
      simulationResource.material.dispose();
    };
  }, [simulationResource]);

  useFrame((state, frameDelta) => {
    const simulation = simulationRef.current;
    const time = state.clock.elapsedTime;
    const delta = Math.min(frameDelta, 0.05);
    const becameActive = active && !wasActiveRef.current;
    const wasRelit = !extinguished && wasExtinguishedRef.current;
    const wasJustExtinguished = extinguished && !wasExtinguishedRef.current;

    simulation.material.uniforms.uPixelRatio.value = Math.min(state.gl.getPixelRatio(), 2);

    if ((becameActive || wasRelit) && !extinguished) {
      resetParticleLifecycles(simulation, count);
      activationRef.current = 0;
      extinguishedAtRef.current = null;
    }

    if (wasJustExtinguished) {
      beginExtinguishing(simulation, count);
      extinguishedAtRef.current = time;
      extinctionLightIntensityRef.current = lightRef.current?.intensity ?? 0;
    }

    if (!extinguished) {
      const activationTarget = active ? 1 : 0;
      const activationEase = 1 - Math.exp(-delta * 13);
      activationRef.current = THREE.MathUtils.lerp(
        activationRef.current,
        activationTarget,
        activationEase,
      );

      let centroidX = 0;
      let centroidY = 0;
      let centroidZ = 0;
      let centroidWeight = 0;

      for (let index = 0; index < count; index += 1) {
        const offset = index * 3;
        const lifespan = simulation.lifespans[index];
        let age = simulation.ages[index] + delta;

        if (age >= lifespan) {
          age %= lifespan;
        }
        simulation.ages[index] = age;

        const lifeRatio = age / lifespan;
        const heightRatio = 0.16 * lifeRatio + 0.84 * lifeRatio * lifeRatio;
        const y = FLAME_HEIGHT * heightRatio;
        const envelopeRadius =
          FLAME_RADIUS * (1 - heightRatio) * Math.sqrt(Math.max(heightRatio, 0));
        const angle =
          simulation.angles[index] + simulation.angularSpeeds[index] * lifeRatio;
        const radius = envelopeRadius * simulation.radialFactors[index];
        const driftRamp = THREE.MathUtils.smoothstep(heightRatio, 0, 0.12);
        const xDrift = Math.sin(y * 4.0 + time * 8.0) * 0.04;
        const zDrift =
          Math.cos(y * 3.4 + time * 6.5 + simulation.driftPhases[index]) * 0.024;
        const localTurbulence =
          Math.sin(time * 11 + simulation.driftPhases[index] + y * 7) * 0.009;

        const x =
          Math.cos(angle) * radius + (xDrift + localTurbulence) * driftRamp;
        const z = Math.sin(angle) * radius + zDrift * driftRamp;
        simulation.positions[offset] = x;
        simulation.positions[offset + 1] = y;
        simulation.positions[offset + 2] = z;

        const birthAlpha = THREE.MathUtils.smoothstep(lifeRatio, 0, 0.035);
        const tipFade = 1 - THREE.MathUtils.smoothstep(lifeRatio, 0.9, 1);
        const density = 0.58 + pseudoRandom(index, 8) * 0.42;
        const alpha = birthAlpha * tipFade * density * activationRef.current;
        const pulse = 0.9 + Math.sin(time * 17 + simulation.driftPhases[index]) * 0.1;
        const tipScale = THREE.MathUtils.lerp(1, 0.52, heightRatio);

        simulation.alphas[index] = alpha;
        simulation.sizes[index] = simulation.baseSizes[index] * pulse * tipScale;
        writeHeatColor(simulation.colors, index, lifeRatio);

        centroidX += x * alpha;
        centroidY += y * alpha;
        centroidZ += z * alpha;
        centroidWeight += alpha;
      }

      if (lightRef.current) {
        if (centroidWeight > 0.0001) {
          lightRef.current.position.set(
            centroidX / centroidWeight,
            centroidY / centroidWeight,
            centroidZ / centroidWeight,
          );
        }

        const intensity =
          BASE_LIGHT_INTENSITY +
          Math.sin(time * 12) * 0.15 +
          Math.sin(time * 29) * 0.08;
        lightRef.current.intensity = Math.max(0, intensity * activationRef.current);
      }
    } else {
      const extinguishedAt = extinguishedAtRef.current ?? time;
      const extinctionElapsed = Math.max(0, time - extinguishedAt);
      const smokeAge = Math.max(0, extinctionElapsed - SCATTER_SECONDS);
      const smokeMix = THREE.MathUtils.smoothstep(
        extinctionElapsed,
        SCATTER_SECONDS * 0.45,
        SCATTER_SECONDS + 0.18,
      );
      const smokeFade = 1 - THREE.MathUtils.smoothstep(smokeAge, 0, SMOKE_LIFETIME);
      const velocityDrag = Math.exp(-delta * (smokeMix > 0.5 ? 1.35 : 2.8));

      for (let index = 0; index < count; index += 1) {
        const offset = index * 3;
        const curlPhase = simulation.driftPhases[index];
        const curlStrength = smokeMix * (0.2 + pseudoRandom(index, 25) * 0.16);
        const curlX = Math.cos(smokeAge * 5.2 + curlPhase) * curlStrength;
        const curlZ = Math.sin(smokeAge * 4.6 + curlPhase) * curlStrength;

        simulation.scatterVelocities[offset] =
          simulation.scatterVelocities[offset] * velocityDrag + curlX * delta;
        simulation.scatterVelocities[offset + 1] =
          simulation.scatterVelocities[offset + 1] * velocityDrag +
          THREE.MathUtils.lerp(0.42, 0.19, smokeMix) * delta;
        simulation.scatterVelocities[offset + 2] =
          simulation.scatterVelocities[offset + 2] * velocityDrag + curlZ * delta;

        simulation.positions[offset] += simulation.scatterVelocities[offset] * delta;
        simulation.positions[offset + 1] +=
          simulation.scatterVelocities[offset + 1] * delta;
        simulation.positions[offset + 2] +=
          simulation.scatterVelocities[offset + 2] * delta;

        const initialAlpha = Math.max(
          simulation.extinctionAlphas[index],
          0.1 * activationRef.current,
        );
        simulation.alphas[index] =
          initialAlpha * THREE.MathUtils.lerp(1, 0.58, smokeMix) * smokeFade;
        simulation.sizes[index] =
          Math.max(simulation.extinctionSizes[index], simulation.baseSizes[index]) *
          (1 + smokeAge * 1.7);

        const smokeTone = pseudoRandom(index, 26);
        const smokeR = THREE.MathUtils.lerp(SMOKE_LIGHT.r, SMOKE_DARK.r, smokeTone);
        const smokeG = THREE.MathUtils.lerp(SMOKE_LIGHT.g, SMOKE_DARK.g, smokeTone);
        const smokeB = THREE.MathUtils.lerp(SMOKE_LIGHT.b, SMOKE_DARK.b, smokeTone);
        simulation.colors[offset] = THREE.MathUtils.lerp(
          simulation.extinctionColors[offset],
          smokeR,
          smokeMix,
        );
        simulation.colors[offset + 1] = THREE.MathUtils.lerp(
          simulation.extinctionColors[offset + 1],
          smokeG,
          smokeMix,
        );
        simulation.colors[offset + 2] = THREE.MathUtils.lerp(
          simulation.extinctionColors[offset + 2],
          smokeB,
          smokeMix,
        );
      }

      if (lightRef.current) {
        const fadeProgress = THREE.MathUtils.clamp(
          extinctionElapsed / LIGHT_FADE_SECONDS,
          0,
          1,
        );
        const smoothFade = 1 - fadeProgress * fadeProgress * (3 - 2 * fadeProgress);
        lightRef.current.intensity = extinctionLightIntensityRef.current * smoothFade;
      }
    }

    markAttributesForUpload(simulation);
    wasActiveRef.current = active;
    wasExtinguishedRef.current = extinguished;
  });

  return (
    <group>
      <points
        geometry={simulationResource.geometry}
        material={simulationResource.material}
        frustumCulled={false}
      />
      <pointLight
        ref={lightRef}
        color="#ffaa33"
        intensity={0}
        distance={9}
        decay={2}
      />
    </group>
  );
}
