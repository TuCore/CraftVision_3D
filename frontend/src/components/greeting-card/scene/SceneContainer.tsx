"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, Stars, Text, useProgress } from "@react-three/drei";
import gsap from "gsap";
import * as THREE from "three";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  BirthdayCake3D,
  CakeLoadingPlaceholder,
  ProceduralBirthdayCake,
} from "./BirthdayCake3D";
import { OrbitingPolaroidGallery } from "./OrbitingPolaroidGallery";
import { ConfettiBurst, Fireworks } from "./CelebrationParticles";

const SAMPLE_IMAGES = [
  "/dreamy-hero-bg.jpg",
  "/anh2.png",
  "/anh3.jpg",
  "/dreamy-hero-bg.jpg",
  "/anh2.png",
  "/anh3.jpg",
];

interface SceneContainerProps {
  customImage?: string;
  receiverName: string;
  candleBlownOut: boolean;
  onInteractive?: () => void;
}

interface CakeBoundaryProps {
  children: React.ReactNode;
  flameActive: boolean;
  extinguished: boolean;
}

class CakeErrorBoundary extends React.Component<CakeBoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Birthday cake model failed to load; using the lightweight fallback.", error);
  }

  render() {
    if (this.state.failed) {
      return (
        <ProceduralBirthdayCake
          flameActive={this.props.flameActive}
          extinguished={this.props.extinguished}
        />
      );
    }
    return this.props.children;
  }
}

function CakeLoader() {
  const { progress } = useProgress();
  return (
    <group>
      <CakeLoadingPlaceholder />
      <Html position={[0, 0.18, 0]} center transform distanceFactor={9}>
        <div className="whitespace-nowrap rounded-full border border-amber-200/30 bg-[#180b1d]/80 px-3 py-1.5 text-[10px] font-semibold tracking-wider text-amber-100 backdrop-blur-md">
          Preparing the cake · {Math.round(progress)}%
        </div>
      </Html>
    </group>
  );
}

function BirthdayTypography({ receiverName }: { receiverName: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const isCompact = useThree((state) => state.size.width < 640);
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.y = 3.28 + Math.sin(state.clock.elapsedTime * 1.15) * 0.08;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.42) * 0.055;
  });

  return (
    <group ref={groupRef}>
      <Text
        fontSize={isCompact ? 0.3 : 0.38}
        maxWidth={isCompact ? 3.4 : 6.4}
        lineHeight={0.9}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.012}
        outlineColor="#7d3f08"
      >
        {isCompact ? `Happy Birthday\n${receiverName}!` : `Happy Birthday ${receiverName}!`}
        <meshStandardMaterial
          color="#ffd875"
          emissive="#a95810"
          emissiveIntensity={0.38}
          metalness={0.85}
          roughness={0.15}
        />
      </Text>
      <pointLight position={[0, 0, 0.45]} color="#ffcc66" intensity={0.7} distance={5} decay={2} />
    </group>
  );
}

function DecorativePodium() {
  return (
    <group>
      <mesh position={[0, -0.18, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[3.12, 3.42, 0.38, 72]} />
        <meshPhysicalMaterial
          color="#35152f"
          roughness={0.3}
          metalness={0.35}
          clearcoat={0.7}
          clearcoatRoughness={0.25}
        />
      </mesh>
      <mesh position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[3.03, 72]} />
        <meshStandardMaterial color="#671f48" roughness={0.42} metalness={0.22} />
      </mesh>
      <mesh position={[0, 0.035, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.72, 0.035, 10, 96]} />
        <meshStandardMaterial color="#f4c76b" emissive="#8c5415" emissiveIntensity={0.28} metalness={0.9} roughness={0.18} />
      </mesh>
    </group>
  );
}

interface CinematicSceneProps {
  images: string[];
  receiverName: string;
  candleBlownOut: boolean;
  onInteractive?: () => void;
}

function CinematicScene({
  images,
  receiverName,
  candleBlownOut,
  onInteractive,
}: CinematicSceneProps) {
  const { camera } = useThree();
  const stageRef = useRef<THREE.Group>(null);
  const cakeRef = useRef<THREE.Group>(null);
  const typographyRef = useRef<THREE.Group>(null);
  const galleryRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const notifiedRef = useRef(false);
  const [flameActive, setFlameActive] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [galleryActive, setGalleryActive] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [galleryFocused, setGalleryFocused] = useState(false);

  const handleGalleryFocusChange = useCallback((focused: boolean) => {
    setGalleryFocused(focused);
    if (controlsRef.current) controlsRef.current.enabled = interactive && !focused;
  }, [interactive]);

  useEffect(() => {
    if (!stageRef.current || !cakeRef.current || !typographyRef.current || !galleryRef.current) return;
    const lookTarget = { x: 0, y: 0, z: 0 };
    camera.position.set(0, 0, 15);
    camera.lookAt(0, 0, 0);
    gsap.set(stageRef.current.scale, { x: 1, y: 0.025, z: 1 });
    gsap.set(cakeRef.current.scale, { x: 0, y: 0, z: 0 });
    gsap.set(typographyRef.current.scale, { x: 0, y: 0, z: 0 });
    gsap.set(galleryRef.current.scale, { x: 0.001, y: 0.001, z: 0.001 });

    const timeline = gsap.timeline();
    timeline
      .to(camera.position, {
        x: 0,
        y: 2,
        z: 8,
        duration: 1.5,
        ease: "power2.out",
        onUpdate: () => camera.lookAt(lookTarget.x, lookTarget.y, lookTarget.z),
      }, 0)
      .to(lookTarget, {
        y: 1.2,
        duration: 1.5,
        ease: "power2.out",
      }, 0)
      .to(stageRef.current.scale, {
        y: 1,
        duration: 0.82,
        ease: "power3.out",
      }, 0.04)
      .call(() => setConfettiActive(true), [], 0.12)
      .to(cakeRef.current.scale, {
        x: 1.15,
        y: 1.15,
        z: 1.15,
        duration: 0.86,
        ease: "elastic.out(1, 0.5)",
      }, 0.12)
      .to(cakeRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.34,
        ease: "power2.out",
      }, 0.98)
      .call(() => setFlameActive(true), [], 1.5)
      .call(() => setGalleryActive(true), [], 3)
      .to(typographyRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.8,
        ease: "back.out(1.8)",
      }, 3)
      .to(galleryRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 1.05,
        ease: "power3.out",
      }, 3.05)
      .call(() => {
        setInteractive(true);
        if (!notifiedRef.current) {
          notifiedRef.current = true;
          onInteractive?.();
        }
      }, [], 4.5);

    return () => {
      timeline.kill();
      gsap.killTweensOf(camera.position);
    };
  }, [camera, onInteractive]);

  return (
    <>
      <ambientLight intensity={0.24} />
      <hemisphereLight color="#dec8ff" groundColor="#190712" intensity={0.38} />
      <directionalLight position={[6, 9, 6]} color="#fff0d2" intensity={1.35} castShadow />

      <group ref={stageRef}>
        <DecorativePodium />
      </group>

      <group ref={cakeRef}>
        <CakeErrorBoundary flameActive={flameActive} extinguished={candleBlownOut}>
          <Suspense fallback={<CakeLoader />}>
            <BirthdayCake3D flameActive={flameActive} extinguished={candleBlownOut} />
          </Suspense>
        </CakeErrorBoundary>
      </group>

      <group ref={typographyRef}>
        <BirthdayTypography receiverName={receiverName} />
      </group>

      <group ref={galleryRef}>
        <OrbitingPolaroidGallery
          images={images}
          active={galleryActive}
          onFocusChange={handleGalleryFocusChange}
        />
      </group>

      <ConfettiBurst active={confettiActive} />
      <Fireworks active={candleBlownOut} />

      <OrbitControls
        ref={controlsRef}
        enabled={interactive && !galleryFocused}
        enableDamping
        dampingFactor={0.05}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={5.5}
        maxDistance={12}
        target={[0, 1.2, 0]}
      />
    </>
  );
}

export function SceneContainer({
  customImage,
  receiverName,
  candleBlownOut,
  onInteractive,
}: SceneContainerProps) {
  const images = useMemo(() => {
    if (!customImage?.trim()) return SAMPLE_IMAGES;
    return [customImage, ...SAMPLE_IMAGES.slice(0, 5)];
  }, [customImage]);

  return (
    <div className="absolute inset-0 h-full w-full bg-[#100714]">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 15], fov: 45, near: 0.1, far: 140 }}
        shadows
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.08;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <color attach="background" args={["#100714"]} />
        <fog attach="fog" args={["#100714", 13, 42]} />
        <Stars radius={70} depth={36} count={2800} factor={3.2} saturation={0.2} fade speed={0.55} />
        <CinematicScene
          images={images}
          receiverName={receiverName}
          candleBlownOut={candleBlownOut}
          onInteractive={onInteractive}
        />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_42%,rgba(9,2,12,.62)_100%)]" />
    </div>
  );
}
