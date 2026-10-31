"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export type ShowcaseModelKey = "flower_vase" | "lantern" | "origami_crane" | "candle" | "heart";

export interface ShowcaseModelInfo {
  key: ShowcaseModelKey;
  name: string;
  tag: string;
  url: string;
  scale: number;
  offsetY: number;
  rotationSpeed: number;
  description: string;
}

export const SHOWCASE_MODELS: ShowcaseModelInfo[] = [
  {
    key: "flower_vase",
    name: "Bình Hoa Pha Lê Tri Ân",
    tag: "Tri Ân Thầy Cô",
    url: "/models/glass_vase_flowers.glb",
    scale: 2.2,
    offsetY: -0.9,
    rotationSpeed: 0.35,
    description: "Tượng trưng cho tấm lòng biết ơn sâu sắc gửi tới các Thầy Cô đã tận tình hướng dẫn đồ án.",
  },
  {
    key: "lantern",
    name: "Ngọn Đèn Tri Thức",
    tag: "Gieo Mầm Ước Mơ",
    url: "/models/lantern.glb",
    scale: 0.055,
    offsetY: -0.7,
    rotationSpeed: 0.4,
    description: "Biểu trưng cho ánh sáng tri thức mà Thầy Cô soi rọi trên bước đường nghiên cứu của sinh viên.",
  },
  {
    key: "origami_crane",
    name: "Cánh Hạc Origami 3D",
    tag: "Nghệ Thuật Thủ Công",
    url: "/models/origami_crane.glb",
    scale: 0.022,
    offsetY: 0.1,
    rotationSpeed: 0.45,
    description: "Gợi nhớ bản sắc thủ công tinh tế kết hợp công nghệ 3D số hóa của CraftVision 3D.",
  },
  {
    key: "heart",
    name: "Trái Tim Pha Lê",
    tag: "Tâm Huyết Nhóm",
    url: "/models/origami_heart.glb",
    scale: 1.8,
    offsetY: 0.1,
    rotationSpeed: 0.5,
    description: "Biểu tượng của nhiệt huyết, sự gắn kết đồng đội và đam mê sáng tạo không ngừng.",
  },
];

interface Showcase3DSceneProps {
  stage: string;
  holding: boolean;
  holdProgress: number;
  candleExtinguished: boolean;
  selectedModelKey: ShowcaseModelKey;
  freeOrbit: boolean;
}

export default function Showcase3DScene({
  stage,
  holding,
  holdProgress,
  candleExtinguished,
  selectedModelKey,
  freeOrbit,
}: Showcase3DSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    stage,
    holding,
    holdProgress,
    candleExtinguished,
    selectedModelKey,
    freeOrbit,
  });

  // Keep stateRef up-to-date for requestAnimationFrame loop without triggering re-creation
  useEffect(() => {
    stateRef.current = {
      stage,
      holding,
      holdProgress,
      candleExtinguished,
      selectedModelKey,
      freeOrbit,
    };
  }, [stage, holding, holdProgress, candleExtinguished, selectedModelKey, freeOrbit]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch (e) {
      console.warn("WebGL initialization failed:", e);
      return;
    }

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0.4, 4.6);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 10;
    controls.minDistance = 1.2;
    controls.enabled = stateRef.current.freeOrbit;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xfff4e6, 1.2);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffe6d5, 0x1f102a, 1.6);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfffaed, 2.8);
    dirLight.position.set(3, 6, 4);
    scene.add(dirLight);

    const candleLight = new THREE.PointLight(0xffa843, 3.2, 8, 1.6);
    candleLight.position.set(0, 0.6, 0.2);
    scene.add(candleLight);

    // Track resources for memory safety cleanup
    const disposables = new Set<{ dispose: () => void }>();

    // Starfield Particle Background
    const starCount = 650;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starScales = new Float32Array(starCount);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 18;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2;
      starScales[i] = Math.random() * 0.8 + 0.3;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute("scale", new THREE.BufferAttribute(starScales, 1));
    disposables.add(starGeo);

    const starMat = new THREE.PointsMaterial({
      color: 0xffe9be,
      size: 0.055,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    disposables.add(starMat);
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Root Group for Models
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // Candle Stage Group
    const candleGroup = new THREE.Group();
    scene.add(candleGroup);

    // Procedural Candle Body
    const candleWaxGeo = new THREE.CylinderGeometry(0.24, 0.26, 1.3, 32);
    const candleWaxMat = new THREE.MeshStandardMaterial({
      color: 0xfff6ec,
      roughness: 0.3,
      metalness: 0.05,
    });
    disposables.add(candleWaxGeo);
    disposables.add(candleWaxMat);
    const candleWaxMesh = new THREE.Mesh(candleWaxGeo, candleWaxMat);
    candleWaxMesh.position.y = -0.3;
    candleGroup.add(candleWaxMesh);

    // Wick
    const wickGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.18, 12);
    const wickMat = new THREE.MeshBasicMaterial({ color: 0x332211 });
    disposables.add(wickGeo);
    disposables.add(wickMat);
    const wickMesh = new THREE.Mesh(wickGeo, wickMat);
    wickMesh.position.y = 0.42;
    candleGroup.add(wickMesh);

    // Flame (Smooth teardrop shape)
    const flameGeo = new THREE.SphereGeometry(0.12, 24, 24);
    flameGeo.scale(0.7, 1.6, 0.7);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xffbc42,
      transparent: true,
      opacity: 0.95,
    });
    disposables.add(flameGeo);
    disposables.add(flameMat);
    const flameMesh = new THREE.Mesh(flameGeo, flameMat);
    flameMesh.position.y = 0.58;
    candleGroup.add(flameMesh);

    // Candle Halo glow
    const haloGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xff8811,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });
    disposables.add(haloGeo);
    disposables.add(haloMat);
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.position.y = 0.58;
    candleGroup.add(haloMesh);

    // Smoke Particles when extinguished
    const smokeCount = 35;
    const smokeGeo = new THREE.BufferGeometry();
    const smokePos = new Float32Array(smokeCount * 3);
    const smokeVels = new Float32Array(smokeCount * 3);
    for (let i = 0; i < smokeCount; i++) {
      smokePos[i * 3] = 0;
      smokePos[i * 3 + 1] = 0.5;
      smokePos[i * 3 + 2] = 0;
      smokeVels[i * 3] = (Math.random() - 0.5) * 0.015;
      smokeVels[i * 3 + 1] = Math.random() * 0.03 + 0.01;
      smokeVels[i * 3 + 2] = (Math.random() - 0.5) * 0.015;
    }
    smokeGeo.setAttribute("position", new THREE.BufferAttribute(smokePos, 3));
    disposables.add(smokeGeo);
    const smokeMat = new THREE.PointsMaterial({
      color: 0xd4c7be,
      size: 0.08,
      transparent: true,
      opacity: 0,
      blending: THREE.NormalBlending,
    });
    disposables.add(smokeMat);
    const smokePoints = new THREE.Points(smokeGeo, smokeMat);
    candleGroup.add(smokePoints);

    // Loaded 3D Models Map
    const loadedModels: Record<string, THREE.Group> = {};
    const loader = new GLTFLoader();

    SHOWCASE_MODELS.forEach((info) => {
      loader.load(
        info.url,
        (gltf) => {
          const model = gltf.scene;
          model.scale.setScalar(info.scale);
          model.position.y = info.offsetY;

          // Enable shadow & enhance materials
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              disposables.add(child.geometry);
              if (Array.isArray(child.material)) {
                child.material.forEach((m) => disposables.add(m));
              } else {
                disposables.add(child.material);
              }
            }
          });

          loadedModels[info.key] = model;
          model.visible = false;
          modelGroup.add(model);
        },
        undefined,
        (err) => {
          console.warn(`Could not load model ${info.key} from ${info.url}:`, err);
        }
      );
    });

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const delta = clock.getDelta();
      const { stage: currentStage, holding: isHolding, holdProgress: currentHold, candleExtinguished: isExtinguished, selectedModelKey: activeKey, freeOrbit: isFreeOrbit } = stateRef.current;

      // Update OrbitControls
      controls.enabled = isFreeOrbit && (currentStage === "finale" || currentStage === "milestones");
      if (controls.enabled) {
        controls.update();
      }

      // Rotate Starfield gently
      starField.rotation.y = elapsed * 0.015;

      // Stage Visibility Management
      const isCandleStage = currentStage === "intro" || currentStage === "opening";
      candleGroup.visible = isCandleStage;
      modelGroup.visible = !isCandleStage;

      if (isCandleStage) {
        if (isExtinguished) {
          flameMesh.visible = false;
          haloMesh.visible = false;
          candleLight.intensity = THREE.MathUtils.lerp(candleLight.intensity, 0, 0.1);

          // Animate smoke rising
          smokeMat.opacity = Math.max(0, smokeMat.opacity - delta * 0.25);
          if (smokeMat.opacity > 0) {
            const positions = smokeGeo.attributes.position.array as Float32Array;
            for (let i = 0; i < smokeCount; i++) {
              positions[i * 3] += smokeVels[i * 3];
              positions[i * 3 + 1] += smokeVels[i * 3 + 1];
              positions[i * 3 + 2] += smokeVels[i * 3 + 2];
            }
            smokeGeo.attributes.position.needsUpdate = true;
          }
        } else {
          flameMesh.visible = true;
          haloMesh.visible = true;
          smokeMat.opacity = 0.65;

          // Flame flicker
          const flicker = Math.sin(elapsed * 18) * 0.08 + Math.cos(elapsed * 32) * 0.05;
          const holdShrink = isHolding ? (1 - currentHold * 0.75) : 1;

          flameMesh.scale.set(0.7 * holdShrink, (1.6 + flicker) * holdShrink, 0.7 * holdShrink);
          haloMesh.scale.setScalar((1 + flicker * 0.6) * holdShrink);

          candleLight.intensity = (3.2 + flicker * 1.2) * holdShrink;
          candleLight.color.setHSL(0.08 + flicker * 0.01, 0.95, 0.55);
        }

        candleGroup.rotation.y = Math.sin(elapsed * 0.6) * 0.12;
      } else {
        // Showcase Loaded Models
        SHOWCASE_MODELS.forEach((info) => {
          const model = loadedModels[info.key];
          if (!model) return;

          const isCurrent = info.key === activeKey;
          model.visible = isCurrent;

          if (isCurrent && !isFreeOrbit) {
            model.rotation.y += delta * info.rotationSpeed;
            model.position.y = info.offsetY + Math.sin(elapsed * 1.5) * 0.04;

            // Heartbeat stage special pulsation
            if (currentStage === "hug" && info.key === "heart") {
              const beat = Math.sin(elapsed * 5.2) > 0.6 ? 1.15 : 1.0;
              model.scale.setScalar(info.scale * beat);
            }
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup resources strictly (monorepo rule 7)
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);

      controls.dispose();

      disposables.forEach((item) => {
        try {
          item.dispose();
        } catch {}
      });

      scene.clear();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 z-0 w-full h-full pointer-events-auto"
      style={{ touchAction: freeOrbit ? "none" : "auto" }}
    />
  );
}
