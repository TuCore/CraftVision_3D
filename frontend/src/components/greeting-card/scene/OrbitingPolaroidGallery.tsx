"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Text } from "@react-three/drei";
import { ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import * as THREE from "three";

interface OrbitingPolaroidGalleryProps {
  images: string[];
  active: boolean;
  onFocusChange?: (focused: boolean) => void;
}

function makeFallbackTexture(index: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 384;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, index % 2 === 0 ? "#9f3157" : "#443071");
    gradient.addColorStop(1, "#17091d");
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(255,255,255,.82)";
    context.font = "italic 28px 'Playfair Display', 'Times New Roman', Times, serif";
    context.textAlign = "center";
    context.fillText("A beautiful memory", canvas.width / 2, canvas.height / 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function OrbitingPolaroidGallery({
  images,
  active,
  onFocusChange,
}: OrbitingPolaroidGalleryProps) {
  const { camera, size: canvasSize } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const photoRefs = useRef<Array<THREE.Group | null>>([]);
  const orbitTimeRef = useRef(0);
  const focusTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const savedCameraPositionRef = useRef(new THREE.Vector3(0, 2, 8));
  const hoveringRef = useRef(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [textures, setTextures] = useState<THREE.Texture[]>([]);

  const frameGeometry = useMemo(() => new THREE.PlaneGeometry(1.36, 1.12), []);
  const photoGeometry = useMemo(() => new THREE.PlaneGeometry(1.16, 0.75), []);
  const frameMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#fffaf2",
    roughness: 0.34,
    clearcoat: 0.55,
    clearcoatRoughness: 0.3,
    side: THREE.DoubleSide,
  }), []);

  const scratchRef = useRef({
    dummy: new THREE.Object3D(),
    worldPosition: new THREE.Vector3(),
    destination: new THREE.Vector3(),
    direction: new THREE.Vector3(),
  });

  useEffect(() => {
    let cancelled = false;
    const ownedTextures: THREE.Texture[] = [];
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";

    Promise.all(images.map((url, index) => new Promise<THREE.Texture>((resolve) => {
      loader.load(
        url,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = 4;
          ownedTextures.push(texture);
          resolve(texture);
        },
        undefined,
        () => {
          const fallback = makeFallbackTexture(index);
          ownedTextures.push(fallback);
          resolve(fallback);
        },
      );
    }))).then((loadedTextures) => {
      if (cancelled) {
        loadedTextures.forEach((texture) => texture.dispose());
        return;
      }
      setTextures(loadedTextures);
    });

    return () => {
      cancelled = true;
      ownedTextures.forEach((texture) => texture.dispose());
    };
  }, [images]);

  const photoMaterials = useMemo(() => images.map((_, index) => new THREE.MeshBasicMaterial({
    color: textures[index] ? "#ffffff" : "#4b2538",
    map: textures[index] ?? null,
    side: THREE.DoubleSide,
    toneMapped: false,
  })), [images, textures]);

  useEffect(() => () => {
    focusTimelineRef.current?.kill();
    gsap.killTweensOf(camera.position);
    document.body.style.cursor = "auto";
  }, [camera]);

  useEffect(() => () => {
    frameGeometry.dispose();
    photoGeometry.dispose();
    frameMaterial.dispose();
  }, [frameGeometry, frameMaterial, photoGeometry]);

  useEffect(() => () => {
    photoMaterials.forEach((material) => material.dispose());
  }, [photoMaterials]);

  const restoreCamera = useCallback(() => {
    focusTimelineRef.current?.kill();
    const lookTarget = { x: 0, y: 1.2, z: 0 };
    focusTimelineRef.current = gsap.timeline({
      onUpdate: () => camera.lookAt(lookTarget.x, lookTarget.y, lookTarget.z),
      onComplete: () => {
        setSelectedIndex(null);
        onFocusChange?.(false);
      },
    }).to(camera.position, {
      x: savedCameraPositionRef.current.x,
      y: savedCameraPositionRef.current.y,
      z: savedCameraPositionRef.current.z,
      duration: 1,
      ease: "power2.inOut",
    });
  }, [camera, onFocusChange]);

  const focusPhoto = useCallback((index: number, event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (!active) return;
    if (selectedIndex === index) {
      restoreCamera();
      return;
    }

    const photo = photoRefs.current[index];
    if (!photo) return;
    const { destination, direction, worldPosition } = scratchRef.current;
    if (selectedIndex === null) savedCameraPositionRef.current.copy(camera.position);
    photo.getWorldPosition(worldPosition);
    direction.copy(worldPosition);
    direction.y = 0;
    if (direction.lengthSq() < 0.01) direction.set(0, 0.25, 1);
    direction.normalize();
    destination.copy(worldPosition).addScaledVector(direction, 3.1);
    destination.y += 0.28;

    setSelectedIndex(index);
    onFocusChange?.(true);
    focusTimelineRef.current?.kill();
    const lookTarget = { x: 0, y: 1.2, z: 0 };
    focusTimelineRef.current = gsap.timeline({
      onUpdate: () => camera.lookAt(lookTarget.x, lookTarget.y, lookTarget.z),
    })
      .to(camera.position, {
        x: destination.x,
        y: destination.y,
        z: destination.z,
        duration: 1.05,
        ease: "power3.inOut",
      }, 0)
      .to(lookTarget, {
        x: worldPosition.x,
        y: worldPosition.y,
        z: worldPosition.z,
        duration: 1.05,
        ease: "power3.inOut",
      }, 0);
  }, [active, camera, onFocusChange, restoreCamera, selectedIndex]);

  useFrame((_, delta) => {
    if (!active || !groupRef.current) return;
    if (selectedIndex === null && !hoveringRef.current) orbitTimeRef.current += delta * 0.085;

    const count = Math.max(images.length, 1);
    const { dummy, worldPosition } = scratchRef.current;
    photoRefs.current.forEach((photo, index) => {
      if (!photo) return;
      const theta = (index / count) * Math.PI * 2 + orbitTimeRef.current;
      const orbitSine = Math.sin(theta);
      photo.position.set(
        5.05 * Math.cos(theta),
        1.4 - orbitSine,
        3.15 * orbitSine,
      );

      photo.getWorldPosition(worldPosition);
      dummy.position.copy(worldPosition);
      dummy.lookAt(camera.position);
      photo.quaternion.slerp(dummy.quaternion, 1 - Math.exp(-delta * 5.5));
      const responsiveScale = canvasSize.width < 640 ? 0.72 : 1;
      const scale = responsiveScale * (selectedIndex === index ? 1.16 : 1);
      photo.scale.x = THREE.MathUtils.damp(photo.scale.x, scale, 6, delta);
      photo.scale.y = THREE.MathUtils.damp(photo.scale.y, scale, 6, delta);
      photo.scale.z = THREE.MathUtils.damp(photo.scale.z, scale, 6, delta);
    });
  });

  return (
    <group ref={groupRef}>
      {images.map((image, index) => (
        <group
          key={`${image}-${index}`}
          ref={(node) => { photoRefs.current[index] = node; }}
          onClick={(event) => focusPhoto(index, event)}
          onPointerOver={(event) => {
            event.stopPropagation();
            hoveringRef.current = true;
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            hoveringRef.current = false;
            document.body.style.cursor = "auto";
          }}
        >
          <mesh geometry={frameGeometry} material={frameMaterial} castShadow />
          <mesh position={[0, 0.085, 0.016]} geometry={photoGeometry} material={photoMaterials[index]} />
          <Text
            position={[0, -0.45, 0.025]}
            fontSize={0.072}
            color="#442330"
            anchorX="center"
            anchorY="middle"
            maxWidth={1.16}
          >
            {`Memory ${String(index + 1).padStart(2, "0")} · with love`}
          </Text>
        </group>
      ))}
    </group>
  );
}
