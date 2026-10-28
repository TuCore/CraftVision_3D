"use client";

import { useEffect, useRef, useState } from "react";
import * as T from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { CardDraft, CardTemplate } from "./catalog";
import { buildCardModel } from "./models";
import {
  getCuratedModel,
  getCosmicBackground,
  getPhotoFormation,
  type PhotoFormationPreset,
} from "./curatedModels";

export type UnifiedStage =
  | "INTRO"
  | "OPENING_PHOTOS"
  | "TRANSITION"
  | "MODEL_STAGE"
  | "ENVELOPE_LETTER";

interface UnifiedCosmicSceneProps {
  template: CardTemplate;
  draft: CardDraft;
  stage: UnifiedStage;
  voicePlaying: boolean;
  letterOpened: boolean;
  photos: string[];
  activeFormation?: PhotoFormationPreset["id"];
  onSceneInteract: () => void;
  onPhotoClick?: (index: number) => void;
}

function createStarTexture(): T.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,244,214,0.85)");
  grad.addColorStop(0.7, "rgba(255,255,255,0.22)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new T.CanvasTexture(canvas);
  tex.colorSpace = T.SRGBColorSpace;
  return tex;
}

function createSoftGlowTexture(primaryHex: string, goldHex: string): T.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(128, 128, 8, 128, 128, 124);
  grad.addColorStop(0, goldHex);
  grad.addColorStop(0.38, primaryHex);
  grad.addColorStop(0.72, "rgba(123, 44, 191, 0.14)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new T.CanvasTexture(canvas);
  tex.colorSpace = T.SRGBColorSpace;
  return tex;
}

function createLetterPaperTexture(
  recipient: string,
  sender: string,
  message: string,
  accent: string
): T.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  // Fine ivory stationery background matching UI Fine-Art Letter modal
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 512);
  bgGrad.addColorStop(0, "#fffdf8");
  bgGrad.addColorStop(0.5, "#fbf5e8");
  bgGrad.addColorStop(1, "#f4e6d0");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 768, 512);

  // Subtle paper fiber lines
  ctx.strokeStyle = "rgba(180, 145, 95, 0.08)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 36; i++) {
    const y = (i * 15) % 512;
    ctx.beginPath();
    ctx.moveTo(18, y);
    ctx.lineTo(750, y + (i % 2 === 0 ? 2 : -2));
    ctx.stroke();
  }

  // Outer champagne-gold & crimson double border
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 5;
  ctx.strokeRect(22, 22, 724, 468);
  ctx.strokeStyle = accent || "#9f1239";
  ctx.lineWidth = 1.8;
  ctx.strokeRect(34, 34, 700, 444);

  // Corner flourishes
  const corners = [
    [46, 46, 1, 1],
    [722, 46, -1, 1],
    [46, 466, 1, -1],
    [722, 466, -1, -1],
  ] as const;
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 2.2;
  corners.forEach(([cx, cy, sx, sy]) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy + sy * 22);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + sx * 22, cy);
    ctx.stroke();
  });

  // Ruled paper lines
  ctx.strokeStyle = "rgba(175, 130, 85, 0.2)";
  ctx.lineWidth = 1.4;
  for (let y = 158; y <= 388; y += 46) {
    ctx.beginPath();
    ctx.moveTo(64, y);
    ctx.lineTo(704, y);
    ctx.stroke();
  }

  // Header & Recipient
  ctx.fillStyle = "#7f1d1d";
  ctx.font = "bold 30px Georgia, serif";
  ctx.textAlign = "left";
  const safeRecipient = (recipient || "Người thương").slice(0, 28);
  ctx.fillText(`Gửi ${safeRecipient},`, 64, 98);

  // Embossed wax seal emblem on top-right
  ctx.beginPath();
  ctx.arc(686, 86, 22, 0, Math.PI * 2);
  ctx.fillStyle = "#881337";
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "#f5d78e";
  ctx.stroke();
  ctx.fillStyle = "#fde68a";
  ctx.font = "bold 20px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("♥", 686, 93);

  // Wrapped preview of the letter message
  ctx.fillStyle = "#3c2415";
  ctx.font = "italic 23px Georgia, serif";
  ctx.textAlign = "left";
  const cleanMsg = (
    message || "Chúc bạn luôn rạng rỡ, bình an và ngập tràn yêu thương..."
  )
    .replace(/\s+/g, " ")
    .trim();
  const words = cleanMsg.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const test = current ? `${current} ${w}` : w;
    if (ctx.measureText(test).width > 620) {
      lines.push(current);
      current = w;
      if (lines.length >= 5) break;
    } else {
      current = test;
    }
  }
  if (current && lines.length < 5) lines.push(current);
  lines.forEach((line, idx) => {
    const suffix = idx === 4 && words.length > 25 ? "..." : "";
    ctx.fillText(line + suffix, 64, 148 + idx * 46);
  });

  // Sender signature at bottom right
  ctx.fillStyle = "#7c2d12";
  ctx.font = "bold 24px Georgia, serif";
  ctx.textAlign = "right";
  const safeSender = (sender || "Người gửi").slice(0, 24);
  ctx.fillText(`— ${safeSender} ✦`, 696, 442);

  const tex = new T.CanvasTexture(canvas);
  tex.colorSpace = T.SRGBColorSpace;
  return tex;
}

function createFallbackPhotoTexture(index: number, accent: string): T.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, accent || "#be185d");
  grad.addColorStop(0.55, "#311042");
  grad.addColorStop(1, "#120924");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = "rgba(245, 215, 142, 0.55)";
  ctx.lineWidth = 8;
  ctx.strokeRect(26, 26, 460, 460);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
  ctx.lineWidth = 2;
  ctx.strokeRect(38, 38, 436, 436);
  ctx.fillStyle = "#fdf6e7";
  ctx.font = "bold 40px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText(`Kỷ niệm #${index + 1}`, 256, 242);
  ctx.font = "24px Georgia, serif";
  ctx.fillStyle = "rgba(245, 215, 142, 0.88)";
  ctx.fillText("✦ CraftVision Celestial ✦", 256, 296);
  const tex = new T.CanvasTexture(canvas);
  tex.colorSpace = T.SRGBColorSpace;
  return tex;
}

function applyCoverAspectRatio(tex: T.Texture, targetAspect: number) {
  const img = tex.image as { width?: number; height?: number } | undefined;
  if (!img || !img.width || !img.height) return;
  const imgAspect = img.width / img.height;
  tex.wrapS = T.ClampToEdgeWrapping;
  tex.wrapT = T.ClampToEdgeWrapping;
  if (imgAspect > targetAspect) {
    const repeatX = targetAspect / imgAspect;
    tex.repeat.set(repeatX, 1);
    tex.offset.set((1 - repeatX) * 0.5, 0);
  } else {
    const repeatY = imgAspect / targetAspect;
    tex.repeat.set(1, repeatY);
    tex.offset.set(0, (1 - repeatY) * 0.5);
  }
  tex.needsUpdate = true;
}

function disposeObjectTree(root: T.Object3D) {
  root.traverse((obj) => {
    if (obj instanceof T.Mesh || obj instanceof T.Line || obj instanceof T.Points) {
      obj.geometry?.dispose();
      const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (const mat of materials) {
        if (!mat) continue;
        const record = mat as unknown as Record<string, unknown>;
        const texKeys = [
          "map",
          "normalMap",
          "roughnessMap",
          "metalnessMap",
          "emissiveMap",
          "aoMap",
          "alphaMap",
          "lightMap",
          "bumpMap",
          "specularMap",
        ];
        for (const key of texKeys) {
          const maybeTex = record[key];
          if (maybeTex instanceof T.Texture) {
            maybeTex.dispose();
          }
        }
        mat.dispose();
      }
    }
  });
}

export default function UnifiedCosmicScene({
  template,
  draft,
  stage,
  voicePlaying,
  letterOpened,
  photos,
  activeFormation,
  onSceneInteract,
  onPhotoClick,
}: UnifiedCosmicSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  const resolvedFormation =
    activeFormation ||
    getPhotoFormation(String(draft.values.photoFormation || "")).id;

  const stageRef = useRef<UnifiedStage>(stage);
  const voicePlayingRef = useRef(voicePlaying);
  const letterOpenedRef = useRef(letterOpened);
  const formationRef = useRef<PhotoFormationPreset["id"]>(resolvedFormation);
  const interactRef = useRef(onSceneInteract);
  const photoClickRef = useRef(onPhotoClick);

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);
  useEffect(() => {
    voicePlayingRef.current = voicePlaying;
  }, [voicePlaying]);
  useEffect(() => {
    letterOpenedRef.current = letterOpened;
  }, [letterOpened]);
  useEffect(() => {
    formationRef.current = resolvedFormation;
  }, [resolvedFormation]);
  useEffect(() => {
    interactRef.current = onSceneInteract;
  }, [onSceneInteract]);
  useEffect(() => {
    photoClickRef.current = onPhotoClick;
  }, [onPhotoClick]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    const ownedGeometries = new Set<T.BufferGeometry>();
    const ownedMaterials = new Set<T.Material>();
    const ownedTextures = new Set<T.Texture>();

    const trackGeo = <G extends T.BufferGeometry>(g: G): G => {
      ownedGeometries.add(g);
      return g;
    };
    const trackMat = <M extends T.Material>(m: M): M => {
      ownedMaterials.add(m);
      return m;
    };
    const trackTex = <X extends T.Texture>(t: X): X => {
      ownedTextures.add(t);
      return t;
    };

    let renderer: T.WebGLRenderer;
    try {
      renderer = new T.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      });
    } catch {
      setWebglUnavailable(true);
      return;
    }

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReducedMotion = motionQuery.matches;
    const onMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    motionQuery.addEventListener("change", onMotionChange);

    const bgPreset = getCosmicBackground(String(draft.values.bgStyle || ""));
    const customNebulaColor =
      typeof draft.values.bgColor === "string" &&
      /^#[0-9a-f]{6}$/i.test(draft.values.bgColor)
        ? draft.values.bgColor
        : bgPreset.nebulaPrimary;
    const accentColor =
      typeof draft.values.accent === "string" &&
      /^#[0-9a-f]{6}$/i.test(draft.values.accent)
        ? draft.values.accent
        : template.color;
    const envelopeColor =
      typeof draft.values.envelopeColor === "string" &&
      /^#[0-9a-f]{6}$/i.test(draft.values.envelopeColor)
        ? draft.values.envelopeColor
        : "#f9e8d4";
    const curatedModel = getCuratedModel(String(draft.values.sceneModel || ""));

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    host.innerHTML = "";
    host.appendChild(renderer.domElement);

    const scene = new T.Scene();
    scene.background = new T.Color(bgPreset.deepColor);
    scene.fog = new T.FogExp2(bgPreset.deepColor, 0.021);

    const camera = new T.PerspectiveCamera(46, 1, 0.1, 120);
    camera.position.set(0, 0.4, 8.2);

    // Multi-directional celestial lighting
    const ambientLight = new T.AmbientLight("#ffffff", 1.38);
    const keyLight = new T.DirectionalLight("#fff6e5", 2.45);
    keyLight.position.set(4, 6.5, 5.5);
    const rimLight = new T.PointLight(customNebulaColor, 4.2, 24);
    rimLight.position.set(-4.2, 2.8, -3.2);
    const bottomGlow = new T.PointLight("#f5d78e", 3.1, 16);
    bottomGlow.position.set(0, -2.4, 2.5);
    scene.add(ambientLight, keyLight, rimLight, bottomGlow);

    // =========================================================================
    // 1. COSMIC BACKGROUND 3D (MULTI-LAYERED DEEP GALAXY)
    // =========================================================================
    const cosmicGroup = new T.Group();
    scene.add(cosmicGroup);

    const starTex = trackTex(createStarTexture());
    const glowDiscTex = trackTex(createSoftGlowTexture(accentColor, "#f5d78e"));

    const starCount = prefersReducedMotion ? 1100 : 2000;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const cPrimary = new T.Color(customNebulaColor);
    const cSecondary = new T.Color(bgPreset.nebulaSecondary);
    const cStar = new T.Color(bgPreset.starColor);
    const cChampagne = new T.Color("#f5d78e");

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const radius = 6 + Math.random() * 42;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i3 + 2] = -Math.abs(radius * Math.cos(phi)) - 2;

      const mix =
        i % 4 === 0
          ? cChampagne
          : i % 4 === 1
          ? cStar
          : i % 4 === 2
          ? cPrimary
          : cSecondary;
      starColors[i3] = mix.r;
      starColors[i3 + 1] = mix.g;
      starColors[i3 + 2] = mix.b;
    }

    const starGeo = trackGeo(new T.BufferGeometry());
    starGeo.setAttribute("position", new T.BufferAttribute(starPositions, 3));
    starGeo.setAttribute("color", new T.BufferAttribute(starColors, 3));
    const starMat = trackMat(
      new T.PointsMaterial({
        size: 0.22,
        map: starTex,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: T.AdditiveBlending,
      })
    );
    const starField = new T.Points(starGeo, starMat);
    cosmicGroup.add(starField);

    // Deep spiral nebula dust
    const nebulaCount = prefersReducedMotion ? 220 : 420;
    const nebulaPos = new Float32Array(nebulaCount * 3);
    const nebulaCol = new Float32Array(nebulaCount * 3);
    for (let i = 0; i < nebulaCount; i++) {
      const i3 = i * 3;
      const branchAngle = ((i % 3) * Math.PI * 2) / 3;
      const r = 2.5 + (i / nebulaCount) * 18;
      const spin = r * 0.55;
      nebulaPos[i3] =
        Math.cos(branchAngle + spin) * r + (Math.random() - 0.5) * 1.8;
      nebulaPos[i3 + 1] = (Math.random() - 0.5) * 3.5;
      nebulaPos[i3 + 2] = -8 + Math.sin(branchAngle + spin) * r * 0.45;
      const col = cPrimary.clone().lerp(cSecondary, i / nebulaCount);
      nebulaCol[i3] = col.r;
      nebulaCol[i3 + 1] = col.g;
      nebulaCol[i3 + 2] = col.b;
    }
    const nebulaGeo = trackGeo(new T.BufferGeometry());
    nebulaGeo.setAttribute("position", new T.BufferAttribute(nebulaPos, 3));
    nebulaGeo.setAttribute("color", new T.BufferAttribute(nebulaCol, 3));
    const nebulaMat = trackMat(
      new T.PointsMaterial({
        size: 0.65,
        map: starTex,
        vertexColors: true,
        transparent: true,
        opacity: 0.38,
        depthWrite: false,
        blending: T.AdditiveBlending,
      })
    );
    const nebulaCloud = new T.Points(nebulaGeo, nebulaMat);
    cosmicGroup.add(nebulaCloud);

    // =========================================================================
    // 2. LOAD USER MEMORY PHOTO TEXTURES (WITH ASPECT-RATIO COVER FIT)
    // =========================================================================
    const effectivePhotos = photos.length > 0 ? photos : [""];
    const textureLoader = new T.TextureLoader();
    textureLoader.crossOrigin = "anonymous";
    const loadedPhotoTextures: T.Texture[] = effectivePhotos.map((src, idx) => {
      const fallback = trackTex(createFallbackPhotoTexture(idx, accentColor));
      if (!src) return fallback;
      const tex = trackTex(
        textureLoader.load(
          src,
          (loaded) => {
            if (disposed) {
              loaded.dispose();
              return;
            }
            loaded.colorSpace = T.SRGBColorSpace;
            applyCoverAspectRatio(loaded, 1.12 / 1.05);
          },
          undefined,
          () => {}
        )
      );
      tex.colorSpace = T.SRGBColorSpace;
      return tex;
    });

    // =========================================================================
    // 3. STAGE 1 & 2: OPENING PHOTOS & STARDUST CONVERGENCE TRANSITION
    // =========================================================================
    const openingPhotosGroup = new T.Group();
    scene.add(openingPhotosGroup);

    const champagneFoilMat = trackMat(
      new T.MeshStandardMaterial({
        color: "#f5d78e",
        roughness: 0.26,
        metalness: 0.72,
      })
    );

    const openingCount = Math.min(2, effectivePhotos.length);
    const openingCards: T.Group[] = [];
    for (let i = 0; i < openingCount; i++) {
      const card = new T.Group();

      const glowHalo = new T.Mesh(
        trackGeo(new T.PlaneGeometry(3.1, 3.6)),
        trackMat(
          new T.MeshBasicMaterial({
            map: glowDiscTex,
            transparent: true,
            opacity: 0.36,
            depthWrite: false,
            blending: T.AdditiveBlending,
            side: T.DoubleSide,
          })
        )
      );
      glowHalo.position.set(0, 0, -0.08);

      const goldRim = new T.Mesh(
        trackGeo(new T.BoxGeometry(2.43, 2.93, 0.045)),
        champagneFoilMat
      );
      goldRim.position.set(0, 0, -0.018);

      const frame = new T.Mesh(
        trackGeo(new T.BoxGeometry(2.34, 2.84, 0.06)),
        trackMat(
          new T.MeshStandardMaterial({
            color: "#fffdf8",
            roughness: 0.32,
            metalness: 0.08,
          })
        )
      );

      const innerGoldBorder = new T.Mesh(
        trackGeo(new T.PlaneGeometry(2.11, 2.21)),
        champagneFoilMat
      );
      innerGoldBorder.position.set(0, 0.16, 0.033);

      const pic = new T.Mesh(
        trackGeo(new T.PlaneGeometry(2.05, 2.15)),
        trackMat(
          new T.MeshBasicMaterial({
            map: loadedPhotoTextures[i],
            side: T.DoubleSide,
          })
        )
      );
      pic.position.set(0, 0.16, 0.038);

      card.add(glowHalo, goldRim, frame, innerGoldBorder, pic);

      const side = openingCount === 1 ? 0 : i === 0 ? -1 : 1;
      const baseX = openingCount === 1 ? 0 : side * 1.36;
      const baseY = openingCount === 1 ? 0.14 : i === 0 ? 0.18 : 0.06;
      const baseZ = openingCount === 1 ? 1.32 : i === 0 ? 1.18 : 0.92;
      const baseRotY = openingCount === 1 ? 0 : -side * 0.17;
      const baseRotZ = openingCount === 1 ? 0 : -side * 0.055;

      card.position.set(baseX, baseY, baseZ);
      card.rotation.set(0, baseRotY, baseRotZ);
      card.userData = {
        side: side || 1,
        baseX,
        baseY,
        baseZ,
        baseRotY,
        baseRotZ,
      };

      openingPhotosGroup.add(card);
      openingCards.push(card);
    }

    // Center convergence stardust stream for TRANSITION stage
    const warpDustCount = prefersReducedMotion ? 24 : 64;
    const warpDustPositions = new Float32Array(warpDustCount * 3);
    for (let i = 0; i < warpDustCount; i++) {
      const i3 = i * 3;
      const angle = (i / warpDustCount) * Math.PI * 6;
      const r = 0.25 + (i % 8) * 0.35;
      warpDustPositions[i3] = Math.cos(angle) * r;
      warpDustPositions[i3 + 1] = Math.sin(angle) * r;
      warpDustPositions[i3 + 2] = -3.5 + (i / warpDustCount) * 6.5;
    }
    const warpDustGeo = trackGeo(new T.BufferGeometry());
    warpDustGeo.setAttribute(
      "position",
      new T.BufferAttribute(warpDustPositions, 3)
    );
    const warpDustMat = trackMat(
      new T.PointsMaterial({
        size: 0.26,
        map: starTex,
        color: "#f5d78e",
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: T.AdditiveBlending,
      })
    );
    const warpDustPoints = new T.Points(warpDustGeo, warpDustMat);
    openingPhotosGroup.add(warpDustPoints);

    // =========================================================================
    // 4. STAGE 3: 3D MODEL STAGE + CELESTIAL DUAL-RING PEDESTAL & FIREFLIES
    // =========================================================================
    const centerModelGroup = new T.Group();
    scene.add(centerModelGroup);

    const pedestalGroup = new T.Group();
    pedestalGroup.position.y = -1.22;
    centerModelGroup.add(pedestalGroup);

    // Soft glowing aura disc at pedestal base
    const pedestalAura = new T.Mesh(
      trackGeo(new T.PlaneGeometry(3.5, 3.5)),
      trackMat(
        new T.MeshBasicMaterial({
          map: glowDiscTex,
          transparent: true,
          opacity: 0.42,
          depthWrite: false,
          blending: T.AdditiveBlending,
          side: T.DoubleSide,
        })
      )
    );
    pedestalAura.rotation.x = -Math.PI / 2;
    pedestalAura.position.y = -0.03;
    pedestalGroup.add(pedestalAura);

    // Outer counter-rotating celestial ring with constellation nodes
    const outerPedestalRingGroup = new T.Group();
    pedestalGroup.add(outerPedestalRingGroup);

    const outerTorus = new T.Mesh(
      trackGeo(new T.TorusGeometry(1.52, 0.022, 16, 72)),
      trackMat(
        new T.MeshBasicMaterial({
          color: "#f5d78e",
          transparent: true,
          opacity: 0.85,
        })
      )
    );
    outerTorus.rotation.x = Math.PI / 2;
    outerPedestalRingGroup.add(outerTorus);

    const nodeGeo = trackGeo(new T.OctahedronGeometry(0.048, 0));
    const nodeMat = trackMat(
      new T.MeshBasicMaterial({
        color: "#fff7d6",
      })
    );
    const arcGeo = trackGeo(
      new T.TorusGeometry(1.52, 0.036, 12, 24, Math.PI * 0.18)
    );
    const arcMat = trackMat(
      new T.MeshBasicMaterial({
        color: accentColor,
        transparent: true,
        opacity: 0.9,
      })
    );
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const node = new T.Mesh(nodeGeo, nodeMat);
      node.position.set(Math.cos(a) * 1.52, 0, Math.sin(a) * 1.52);
      outerPedestalRingGroup.add(node);

      if (i % 3 === 0) {
        const arc = new T.Mesh(arcGeo, arcMat);
        arc.rotation.x = Math.PI / 2;
        arc.rotation.z = a;
        outerPedestalRingGroup.add(arc);
      }
    }

    // Inner counter-rotating ring with constellation ticks
    const innerPedestalRingGroup = new T.Group();
    pedestalGroup.add(innerPedestalRingGroup);

    const innerTorus = new T.Mesh(
      trackGeo(new T.TorusGeometry(1.14, 0.018, 14, 64)),
      trackMat(
        new T.MeshBasicMaterial({
          color: accentColor,
          transparent: true,
          opacity: 0.78,
        })
      )
    );
    innerTorus.rotation.x = Math.PI / 2;
    innerPedestalRingGroup.add(innerTorus);

    const tickGeo = trackGeo(new T.BoxGeometry(0.11, 0.016, 0.024));
    const tickMat = trackMat(
      new T.MeshBasicMaterial({
        color: "#fde68a",
        transparent: true,
        opacity: 0.88,
      })
    );
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const tick = new T.Mesh(tickGeo, tickMat);
      tick.position.set(Math.cos(a) * 1.14, 0, Math.sin(a) * 1.14);
      tick.rotation.y = -a;
      innerPedestalRingGroup.add(tick);
    }

    // Expanding soundwave rings when voice recording plays
    const voiceWaveRings: T.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const waveRing = new T.Mesh(
        trackGeo(new T.RingGeometry(1.22, 1.3, 56)),
        trackMat(
          new T.MeshBasicMaterial({
            color: "#f5d78e",
            transparent: true,
            opacity: 0,
            side: T.DoubleSide,
            blending: T.AdditiveBlending,
            depthWrite: false,
          })
        )
      );
      waveRing.rotation.x = Math.PI / 2;
      waveRing.position.y = 0.02;
      pedestalGroup.add(waveRing);
      voiceWaveRings.push(waveRing);
    }

    // Golden fireflies drifting upward in a hollow ring around the 3D model
    const fireflyCount = prefersReducedMotion ? 16 : 42;
    const fireflyPositions = new Float32Array(fireflyCount * 3);
    const fireflyAngles = new Float32Array(fireflyCount);
    const fireflyRadii = new Float32Array(fireflyCount);
    const fireflySpeeds = new Float32Array(fireflyCount);
    const fireflyHeights = new Float32Array(fireflyCount);

    for (let i = 0; i < fireflyCount; i++) {
      const angle = (i / fireflyCount) * Math.PI * 2 + Math.random() * 0.4;
      // Keep radius >= 1.48 so particles stay in a perimeter halo and never obscure the central model
      const radius = 1.48 + (i % 4) * 0.28 + Math.random() * 0.18;
      const height = (i / fireflyCount) * 2.8 - 1.2;
      fireflyAngles[i] = angle;
      fireflyRadii[i] = radius;
      fireflySpeeds[i] = 0.26 + (i % 5) * 0.06;
      fireflyHeights[i] = height;

      const i3 = i * 3;
      fireflyPositions[i3] = Math.cos(angle) * radius;
      fireflyPositions[i3 + 1] = height;
      fireflyPositions[i3 + 2] = Math.sin(angle) * radius;
    }

    const fireflyGeo = trackGeo(new T.BufferGeometry());
    const fireflyPosAttr = new T.BufferAttribute(fireflyPositions, 3);
    fireflyGeo.setAttribute("position", fireflyPosAttr);
    const fireflyMat = trackMat(
      new T.PointsMaterial({
        size: 0.21,
        map: starTex,
        color: "#fde68a",
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: T.AdditiveBlending,
      })
    );
    const fireflyPoints = new T.Points(fireflyGeo, fireflyMat);
    centerModelGroup.add(fireflyPoints);

    // Fallback model created immediately while GLB loads
    const fallbackTemplate: CardTemplate = {
      ...template,
      model: curatedModel.fallbackModelKey,
      color: accentColor,
    };
    const fallbackModel = buildCardModel(fallbackTemplate, draft);
    centerModelGroup.add(fallbackModel.root);

    // Align pedestal to fallback model bounding box initially
    const alignPedestalToObject = (targetObj: T.Object3D) => {
      const b = new T.Box3().setFromObject(targetObj);
      if (!b.isEmpty() && Number.isFinite(b.min.y)) {
        pedestalGroup.position.y = Math.max(
          -1.42,
          Math.min(-0.55, b.min.y - 0.08)
        );
      }
    };
    alignPedestalToObject(fallbackModel.root);

    let gltfRoot: T.Object3D | null = null;
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      curatedModel.modelUrl,
      (gltf) => {
        if (disposed) {
          disposeObjectTree(gltf.scene);
          return;
        }
        const model = gltf.scene;
        const box = new T.Box3().setFromObject(model);
        const size = box.getSize(new T.Vector3());
        const center = box.getCenter(new T.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z, 0.001);
        const scale = curatedModel.targetSize / maxDim;

        model.scale.setScalar(scale);
        model.position.set(
          -center.x * scale,
          -center.y * scale + curatedModel.positionY,
          -center.z * scale
        );

        const wrapper = new T.Group();
        wrapper.add(model);
        gltfRoot = wrapper;
        fallbackModel.root.visible = false;
        centerModelGroup.add(wrapper);
        alignPedestalToObject(wrapper);
      },
      undefined,
      () => {
        // Keep fallbackModel visible if GLB fails to load
      }
    );

    // =========================================================================
    // 5. STAGE 4: 3D ENVELOPE & 8 LIVE-SWITCHABLE PHOTO FORMATIONS
    // =========================================================================
    const envelopeStageGroup = new T.Group();
    scene.add(envelopeStageGroup);

    const envelopeGroup = new T.Group();
    envelopeGroup.position.set(0, -0.15, 0.45);
    envelopeStageGroup.add(envelopeGroup);

    const envW = 2.76;
    const envH = 1.8;
    const hw = envW / 2;
    const hh = envH / 2;

    const baseEnvCol = new T.Color(envelopeColor);
    const sideFoldCol = baseEnvCol.clone().multiplyScalar(0.84);
    const bottomFoldCol = baseEnvCol.clone().multiplyScalar(0.93);
    const topFlapCol = baseEnvCol.clone().lerp(new T.Color(accentColor), 0.16);

    const envBackMat = trackMat(
      new T.MeshStandardMaterial({
        color: baseEnvCol,
        roughness: 0.42,
        metalness: 0.08,
      })
    );
    const envSideFoldMat = trackMat(
      new T.MeshStandardMaterial({
        color: sideFoldCol,
        roughness: 0.44,
        metalness: 0.08,
      })
    );
    const envBottomFoldMat = trackMat(
      new T.MeshStandardMaterial({
        color: bottomFoldCol,
        roughness: 0.4,
        metalness: 0.1,
      })
    );
    const envTopFlapMat = trackMat(
      new T.MeshStandardMaterial({
        color: topFlapCol,
        roughness: 0.36,
        metalness: 0.15,
        side: T.DoubleSide,
      })
    );
    const silkLiningMat = trackMat(
      new T.MeshStandardMaterial({
        color: "#fdf6e7",
        roughness: 0.48,
        metalness: 0.05,
        side: T.DoubleSide,
      })
    );
    const goldFoilMat = champagneFoilMat;

    // 5.1. Envelope Back + Gold Trim + Inner Silk Lining
    const goldBackTrim = new T.Mesh(
      trackGeo(new T.BoxGeometry(envW + 0.06, envH + 0.06, 0.014)),
      goldFoilMat
    );
    goldBackTrim.position.z = -0.068;

    const backPanel = new T.Mesh(
      trackGeo(new T.BoxGeometry(envW, envH, 0.02)),
      envBackMat
    );
    backPanel.position.z = -0.052;

    const innerLining = new T.Mesh(
      trackGeo(new T.PlaneGeometry(envW - 0.1, envH - 0.1)),
      silkLiningMat
    );
    innerLining.position.z = -0.039;

    const leftWall = new T.Mesh(
      trackGeo(new T.BoxGeometry(0.03, envH, 0.09)),
      envSideFoldMat
    );
    leftWall.position.set(-hw + 0.015, 0, -0.008);
    const rightWall = new T.Mesh(
      trackGeo(new T.BoxGeometry(0.03, envH, 0.09)),
      envSideFoldMat
    );
    rightWall.position.set(hw - 0.015, 0, -0.008);
    const bottomWall = new T.Mesh(
      trackGeo(new T.BoxGeometry(envW, 0.03, 0.09)),
      envBottomFoldMat
    );
    bottomWall.position.set(0, -hh + 0.015, -0.008);

    // 5.2. 3D Fine-Art Letter Sheet inside the envelope pocket
    const letterPaperGroup = new T.Group();
    letterPaperGroup.position.set(0, -0.04, -0.005);
    const letterPaperTex = trackTex(
      createLetterPaperTexture(
        String(draft.values.recipient || "Bạn"),
        String(draft.values.sender || "Người gửi"),
        String(draft.values.message || ""),
        accentColor
      )
    );
    const letterSheetBacking = new T.Mesh(
      trackGeo(new T.BoxGeometry(2.36, 1.54, 0.016)),
      trackMat(new T.MeshStandardMaterial({ color: "#fffdf8", roughness: 0.42 }))
    );
    const letterSheetFront = new T.Mesh(
      trackGeo(new T.PlaneGeometry(2.32, 1.5)),
      trackMat(
        new T.MeshBasicMaterial({
          map: letterPaperTex,
          side: T.DoubleSide,
        })
      )
    );
    letterSheetFront.position.z = 0.01;
    letterPaperGroup.add(letterSheetBacking, letterSheetFront);

    // 5.3. Three Front Pocket Folds
    const foldExtrudeSettings: T.ExtrudeGeometryOptions = {
      depth: 0.01,
      bevelEnabled: true,
      bevelThickness: 0.003,
      bevelSize: 0.003,
      bevelSegments: 2,
    };

    const leftFoldShape = new T.Shape();
    leftFoldShape.moveTo(-hw, hh);
    leftFoldShape.lineTo(-hw, -hh);
    leftFoldShape.lineTo(-0.12, -0.02);
    leftFoldShape.closePath();
    const leftFoldMesh = new T.Mesh(
      trackGeo(new T.ExtrudeGeometry(leftFoldShape, foldExtrudeSettings)),
      envSideFoldMat
    );
    leftFoldMesh.position.z = 0.028;

    const rightFoldShape = new T.Shape();
    rightFoldShape.moveTo(hw, hh);
    rightFoldShape.lineTo(0.12, -0.02);
    rightFoldShape.lineTo(hw, -hh);
    rightFoldShape.closePath();
    const rightFoldMesh = new T.Mesh(
      trackGeo(new T.ExtrudeGeometry(rightFoldShape, foldExtrudeSettings)),
      envSideFoldMat
    );
    rightFoldMesh.position.z = 0.031;

    const bottomFoldShape = new T.Shape();
    bottomFoldShape.moveTo(-hw, -hh);
    bottomFoldShape.lineTo(hw, -hh);
    bottomFoldShape.lineTo(0.22, 0.08);
    bottomFoldShape.lineTo(-0.22, 0.08);
    bottomFoldShape.closePath();
    const bottomFoldMesh = new T.Mesh(
      trackGeo(new T.ExtrudeGeometry(bottomFoldShape, foldExtrudeSettings)),
      envBottomFoldMat
    );
    bottomFoldMesh.position.z = 0.04;

    const seamLineMat = trackMat(
      new T.LineBasicMaterial({
        color: "#fcd34d",
        transparent: true,
        opacity: 0.85,
      })
    );
    const vPocketPoints = [
      new T.Vector3(-hw, hh, 0.054),
      new T.Vector3(-0.16, 0.02, 0.054),
      new T.Vector3(0.16, 0.02, 0.054),
      new T.Vector3(hw, hh, 0.054),
    ];
    const vPocketLine = new T.Line(
      trackGeo(new T.BufferGeometry().setFromPoints(vPocketPoints)),
      seamLineMat
    );
    const bottomSeamPoints = [
      new T.Vector3(-hw, -hh, 0.056),
      new T.Vector3(-0.22, 0.08, 0.056),
      new T.Vector3(0.22, 0.08, 0.056),
      new T.Vector3(hw, -hh, 0.056),
    ];
    const bottomSeamLine = new T.Line(
      trackGeo(new T.BufferGeometry().setFromPoints(bottomSeamPoints)),
      seamLineMat
    );

    // 5.4. Top Flap Hinge
    const flapPivot = new T.Group();
    flapPivot.position.set(0, hh, 0.052);

    const topFlapShape = new T.Shape();
    topFlapShape.moveTo(-hw, 0);
    topFlapShape.lineTo(hw, 0);
    topFlapShape.lineTo(0.14, -0.92);
    topFlapShape.quadraticCurveTo(0, -1.03, -0.14, -0.92);
    topFlapShape.closePath();

    const flapMesh = new T.Mesh(
      trackGeo(
        new T.ExtrudeGeometry(topFlapShape, {
          depth: 0.012,
          bevelEnabled: true,
          bevelThickness: 0.003,
          bevelSize: 0.003,
          bevelSegments: 2,
        })
      ),
      envTopFlapMat
    );

    const innerFlapShape = new T.Shape();
    innerFlapShape.moveTo(-hw + 0.1, -0.04);
    innerFlapShape.lineTo(hw - 0.1, -0.04);
    innerFlapShape.lineTo(0.1, -0.86);
    innerFlapShape.quadraticCurveTo(0, -0.94, -0.1, -0.86);
    innerFlapShape.closePath();
    const innerFlapLining = new T.Mesh(
      trackGeo(new T.ShapeGeometry(innerFlapShape)),
      silkLiningMat
    );
    innerFlapLining.position.z = -0.003;

    const flapEdgePoints = [
      new T.Vector3(-hw, 0, 0.018),
      new T.Vector3(0, -1.01, 0.018),
      new T.Vector3(hw, 0, 0.018),
    ];
    const flapEdgeLine = new T.Line(
      trackGeo(new T.BufferGeometry().setFromPoints(flapEdgePoints)),
      seamLineMat
    );
    flapPivot.add(flapMesh, innerFlapLining, flapEdgeLine);

    // 5.5. Embossed Crimson/Gold Wax Seal
    const waxSealGroup = new T.Group();
    waxSealGroup.position.set(0, -0.08, 0.074);
    const waxDisc = new T.Mesh(
      trackGeo(new T.CylinderGeometry(0.23, 0.25, 0.042, 32)),
      trackMat(
        new T.MeshStandardMaterial({
          color: "#9f1239",
          roughness: 0.28,
          metalness: 0.35,
        })
      )
    );
    waxDisc.rotation.x = Math.PI / 2;
    const waxGoldRing = new T.Mesh(
      trackGeo(new T.TorusGeometry(0.16, 0.018, 12, 32)),
      goldFoilMat
    );
    waxGoldRing.position.z = 0.022;
    const waxStarCore = new T.Mesh(
      trackGeo(new T.OctahedronGeometry(0.075, 0)),
      goldFoilMat
    );
    waxStarCore.position.z = 0.028;
    waxSealGroup.add(waxDisc, waxGoldRing, waxStarCore);

    envelopeGroup.add(
      goldBackTrim,
      backPanel,
      innerLining,
      leftWall,
      rightWall,
      bottomWall,
      letterPaperGroup,
      leftFoldMesh,
      rightFoldMesh,
      bottomFoldMesh,
      vPocketLine,
      bottomSeamLine,
      flapPivot,
      waxSealGroup
    );

    // =========================================================================
    // 5.6. ORBITING MEMORY PHOTO FRAMES (STABLE POOL ACROSS ALL 8 FORMATIONS)
    // =========================================================================
    const orbitGroup = new T.Group();
    envelopeStageGroup.add(orbitGroup);

    const displayPhotoCount = Math.min(
      20,
      Math.max(effectivePhotos.length, 10)
    );
    interface PhotoCardEntry {
      group: T.Group;
      backing: T.Mesh;
      backingMat: T.MeshStandardMaterial;
      goldRim: T.Mesh;
      photoPlane: T.Mesh;
      photoBack: T.Mesh;
      sprocketsGroup: T.Group;
      prevFloatingCycle: number;
    }
    const photoCards: PhotoCardEntry[] = [];

    const sharedBackingGeo = trackGeo(new T.PlaneGeometry(1.3, 1.42));
    const sharedGoldRimGeo = trackGeo(new T.PlaneGeometry(1.35, 1.47));
    const sharedPhotoPlaneGeo = trackGeo(new T.PlaneGeometry(1.12, 1.05));
    const sharedSprocketGeo = trackGeo(new T.PlaneGeometry(0.08, 0.045));
    const sharedSprocketMat = trackMat(
      new T.MeshBasicMaterial({
        color: "#f5d78e",
        side: T.DoubleSide,
      })
    );

    for (let i = 0; i < displayPhotoCount; i++) {
      const pGroup = new T.Group();
      pGroup.userData = { photoIndex: i % effectivePhotos.length };

      const goldRim = new T.Mesh(sharedGoldRimGeo, champagneFoilMat);
      goldRim.position.z = -0.004;

      const backingMat = trackMat(
        new T.MeshStandardMaterial({
          color: "#fffdf8",
          roughness: 0.38,
          side: T.DoubleSide,
        })
      );
      const backing = new T.Mesh(sharedBackingGeo, backingMat);

      const photoMat = trackMat(
        new T.MeshBasicMaterial({
          map: loadedPhotoTextures[i % loadedPhotoTextures.length],
          side: T.DoubleSide,
        })
      );
      const photoPlane = new T.Mesh(sharedPhotoPlaneGeo, photoMat);
      photoPlane.position.set(0, 0.08, 0.015);

      const photoBack = new T.Mesh(sharedPhotoPlaneGeo, photoMat);
      photoBack.position.set(0, 0.08, -0.015);
      photoBack.rotation.y = Math.PI;

      // Pre-built cinema film sprocket holes (toggled when activeFormation === "film-strip")
      const sprocketsGroup = new T.Group();
      for (let s = -2; s <= 2; s++) {
        const topHole = new T.Mesh(sharedSprocketGeo, sharedSprocketMat);
        topHole.position.set(s * 0.26, 0.54, 0.018);
        const botHole = new T.Mesh(sharedSprocketGeo, sharedSprocketMat);
        botHole.position.set(s * 0.26, -0.54, 0.018);
        sprocketsGroup.add(topHole, botHole);
      }
      sprocketsGroup.visible = false;

      pGroup.add(goldRim, backing, photoPlane, photoBack, sprocketsGroup);
      orbitGroup.add(pGroup);
      photoCards.push({
        group: pGroup,
        backing,
        backingMat,
        goldRim,
        photoPlane,
        photoBack,
        sprocketsGroup,
        prevFloatingCycle: -1,
      });
    }

    // Reusable scratch objects for zero-allocation per-frame formation math
    const targetPos = new T.Vector3();
    const targetScale = new T.Vector3(1, 1, 1);
    const backingTargetScale = new T.Vector3(1, 1, 1);
    const lookAtDummy = new T.Object3D();
    const targetQuat = new T.Quaternion();
    const polaroidColor = new T.Color("#fffdf8");
    const filmStripColor = new T.Color("#141418");
    const starVertices: Array<{ x: number; y: number }> = [];
    for (let v = 0; v < 10; v++) {
      const a = (v / 10) * Math.PI * 2 - Math.PI / 2;
      const r = v % 2 === 0 ? 3.85 : 1.95;
      starVertices.push({ x: Math.cos(a) * r, y: Math.sin(a) * r * 0.88 });
    }

    let initializedFormation = false;

    const updatePhotoFormation = (
      mode: PhotoFormationPreset["id"],
      time: number,
      dt: number
    ) => {
      const count = photoCards.length;
      const posBlend =
        !initializedFormation || prefersReducedMotion
          ? 1
          : 1 - Math.exp(-5.6 * dt);
      const rotBlend =
        !initializedFormation || prefersReducedMotion
          ? 1
          : 1 - Math.exp(-6.5 * dt);
      const motionFactor = prefersReducedMotion ? 0.15 : 1;

      const isFilm = mode === "film-strip";
      backingTargetScale.set(isFilm ? 1.14 : 1, isFilm ? 0.86 : 1, 1);

      for (let i = 0; i < count; i++) {
        const entry = photoCards[i];
        const item = entry.group;
        const ratio = i / count;
        const angle = ratio * Math.PI * 2 + time * 0.36 * motionFactor;
        let cardScale = 1;
        let snapPositionImmediately = false;

        if (mode === "sphere") {
          const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
          const theta =
            Math.PI * (1 + Math.sqrt(5)) * i + time * 0.38 * motionFactor;
          const r = 3.55 + (i % 2) * 0.24;
          targetPos.set(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.cos(phi) * 0.74,
            r * Math.sin(phi) * Math.sin(theta)
          );
          lookAtDummy.position.copy(targetPos);
          lookAtDummy.lookAt(camera.position);
          targetQuat.copy(lookAtDummy.quaternion);
        } else if (mode === "floating-up") {
          const cycleNorm = ((time * 0.085 * motionFactor + ratio) % 1 + 1) % 1;
          if (
            entry.prevFloatingCycle >= 0 &&
            entry.prevFloatingCycle > 0.75 &&
            cycleNorm < 0.25
          ) {
            snapPositionImmediately = true;
          }
          entry.prevFloatingCycle = cycleNorm;

          const y = -3.7 + cycleNorm * 7.4;
          const sideAngle =
            (i / count) * Math.PI * 2 +
            Math.sin(time * 0.45 * motionFactor + i) * 0.22;
          const r = 2.95 + (i % 3) * 0.52;
          targetPos.set(
            Math.cos(sideAngle) * r,
            y,
            Math.sin(sideAngle) * r * 0.72
          );
          // Smooth fade-in at bottom and fade-out at top so wrap-around is seamless
          const edgeFade = Math.sin(cycleNorm * Math.PI);
          cardScale = Math.max(0.08, Math.min(1, edgeFade * 1.35));

          lookAtDummy.position.copy(targetPos);
          lookAtDummy.lookAt(camera.position);
          lookAtDummy.rotateZ(Math.cos(time * 0.7 * motionFactor + i) * 0.06);
          targetQuat.copy(lookAtDummy.quaternion);
        } else if (mode === "heart") {
          const t = ratio * Math.PI * 2;
          const hx = 16 * Math.pow(Math.sin(t), 3) * 0.22;
          const hy =
            (13 * Math.cos(t) -
              5 * Math.cos(2 * t) -
              2 * Math.cos(3 * t) -
              Math.cos(4 * t)) *
              0.195 +
            0.26;
          const pulse = 1 + Math.sin(time * 2.2 * motionFactor) * 0.04;
          targetPos.set(
            hx * pulse,
            hy * pulse,
            Math.sin(time * 0.75 * motionFactor + i * 0.7) * 0.65
          );
          lookAtDummy.position.copy(targetPos);
          lookAtDummy.lookAt(camera.position);
          targetQuat.copy(lookAtDummy.quaternion);
        } else if (mode === "star") {
          // 5-pointed star perimeter interpolation for unmistakable star silhouette
          const starPos = ratio * 10;
          const segIdx = Math.floor(starPos) % 10;
          const segFrac = starPos - Math.floor(starPos);
          const vA = starVertices[segIdx];
          const vB = starVertices[(segIdx + 1) % 10];
          const baseX = vA.x + (vB.x - vA.x) * segFrac;
          const baseY = vA.y + (vB.y - vA.y) * segFrac;
          const rot = time * 0.14 * motionFactor;
          const cosR = Math.cos(rot);
          const sinR = Math.sin(rot);
          targetPos.set(
            baseX * cosR - baseY * sinR,
            baseX * sinR + baseY * cosR,
            Math.sin(time * 0.8 * motionFactor + i) * 0.55
          );
          lookAtDummy.position.copy(targetPos);
          lookAtDummy.lookAt(camera.position);
          targetQuat.copy(lookAtDummy.quaternion);
        } else if (mode === "film-strip") {
          const r = 3.7;
          targetPos.set(
            Math.cos(angle) * r,
            Math.sin(angle * 2) * 0.78,
            Math.sin(angle) * r
          );
          lookAtDummy.position.copy(targetPos);
          lookAtDummy.lookAt(0, targetPos.y * 0.5, 0);
          lookAtDummy.rotateY(Math.PI);
          targetQuat.copy(lookAtDummy.quaternion);
        } else if (mode === "galaxy-spiral") {
          const armOffset = (i % 2) * Math.PI;
          const armRatio = Math.floor(i / 2) / Math.max(1, Math.ceil(count / 2));
          const spiralY = (armRatio - 0.5) * 3.8;
          const spiralAngle =
            armRatio * Math.PI * 3.2 +
            armOffset +
            time * 0.45 * motionFactor;
          const r = 2.45 + armRatio * 1.55;
          targetPos.set(
            Math.cos(spiralAngle) * r,
            spiralY,
            Math.sin(spiralAngle) * r
          );
          lookAtDummy.position.copy(targetPos);
          lookAtDummy.lookAt(camera.position);
          targetQuat.copy(lookAtDummy.quaternion);
        } else if (mode === "saturn-ring") {
          const r = 3.85;
          const x = Math.cos(angle) * r;
          const z = Math.sin(angle) * r;
          // 18-degree inclined planetary ring around the envelope
          const tiltY = x * 0.31 + z * 0.12;
          targetPos.set(
            x,
            tiltY + Math.sin(time * 0.9 * motionFactor + i) * 0.08,
            z
          );
          lookAtDummy.position.copy(targetPos);
          lookAtDummy.lookAt(camera.position);
          targetQuat.copy(lookAtDummy.quaternion);
        } else {
          // carousel-bloom: layered blooming petals around the envelope
          const layer = i % 2;
          const bloomWave = 0.88 + Math.sin(time * 0.85 * motionFactor) * 0.1;
          const r = (layer === 0 ? 3.2 : 3.75) * bloomWave;
          targetPos.set(
            Math.cos(angle) * r,
            (layer === 0 ? -0.35 : 0.48) +
              Math.sin(i * 1.4 + time * 0.9 * motionFactor) * 0.42,
            Math.sin(angle) * r
          );
          lookAtDummy.position.copy(targetPos);
          lookAtDummy.lookAt(camera.position);
          lookAtDummy.rotateX(layer === 0 ? -0.08 : 0.08);
          targetQuat.copy(lookAtDummy.quaternion);
        }

        if (mode !== "floating-up") {
          entry.prevFloatingCycle = -1;
        }

        if (snapPositionImmediately) {
          item.position.copy(targetPos);
          item.quaternion.copy(targetQuat);
        } else {
          item.position.lerp(targetPos, posBlend);
          item.quaternion.slerp(targetQuat, rotBlend);
        }

        targetScale.setScalar(cardScale);
        item.scale.lerp(targetScale, posBlend);

        // Smooth frame style transition between Film-Strip and Polaroid
        entry.backing.scale.lerp(backingTargetScale, posBlend);
        entry.goldRim.scale.lerp(backingTargetScale, posBlend);
        entry.backingMat.color.lerp(
          isFilm ? filmStripColor : polaroidColor,
          posBlend
        );
        const targetPhotoY = isFilm ? 0 : 0.08;
        entry.photoPlane.position.y +=
          (targetPhotoY - entry.photoPlane.position.y) * posBlend;
        entry.photoBack.position.y = entry.photoPlane.position.y;
        entry.sprocketsGroup.visible = isFilm;
      }

      initializedFormation = true;
    };

    // =========================================================================
    // 6. 360° POINTER ROTATION, PARALLAX & RAYCASTER INTERACTION
    // =========================================================================
    const raycaster = new T.Raycaster();
    const pointer = new T.Vector2();
    let dragging = false;
    let moved = false;
    let startX = 0;
    let userYaw = 0;
    let parallaxX = 0;
    let parallaxY = 0;

    const canvas = renderer.domElement;
    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      moved = false;
      startX = e.clientX;
    };
    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        parallaxX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        parallaxY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
      }
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 6) moved = true;
      startX = e.clientX;
      userYaw += dx * 0.008;
    };
    const onPointerUp = (e: PointerEvent) => {
      if (dragging && !moved) {
        const rect = canvas.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);

        if (stageRef.current === "ENVELOPE_LETTER" && photoClickRef.current) {
          const hits = raycaster.intersectObjects(orbitGroup.children, true);
          if (hits.length > 0) {
            let obj: T.Object3D | null = hits[0].object;
            while (obj && obj.userData?.photoIndex === undefined) {
              obj = obj.parent;
            }
            if (obj && typeof obj.userData?.photoIndex === "number") {
              photoClickRef.current(obj.userData.photoIndex);
              dragging = false;
              return;
            }
          }
        }
        interactRef.current();
      }
      dragging = false;
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    const resize = () => {
      if (!host) return;
      const w = Math.max(1, host.clientWidth);
      const h = Math.max(1, host.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    // =========================================================================
    // 7. DELTA-TIME RENDER LOOP ACROSS ALL 5 STAGES
    // =========================================================================
    let rafId = 0;
    const startTime = performance.now();
    let prevNow = startTime;
    let prevStage: UnifiedStage = stageRef.current;
    let openProgress = letterOpenedRef.current ? 1 : 0;
    const unitScale = new T.Vector3(1, 1, 1);
    const transitionTargetScale = new T.Vector3(0.68, 0.68, 0.68);

    const animate = (now: number) => {
      rafId = requestAnimationFrame(animate);
      // Clamp delta time to avoid jumps when switching browser tabs
      const dt = Math.min(0.05, Math.max(0.001, (now - prevNow) * 0.001));
      prevNow = now;
      const elapsed = (now - startTime) * 0.001;
      const currentStage = stageRef.current;
      const motionScale = prefersReducedMotion ? 0.15 : 1;

      // Reset Opening Photo transforms cleanly whenever entering OPENING_PHOTOS
      if (
        currentStage === "OPENING_PHOTOS" &&
        prevStage !== "OPENING_PHOTOS"
      ) {
        openingCards.forEach((card) => {
          const { baseX, baseY, baseZ, baseRotY, baseRotZ } = card.userData as {
            baseX: number;
            baseY: number;
            baseZ: number;
            baseRotY: number;
            baseRotZ: number;
          };
          card.position.set(baseX, baseY - 0.22, baseZ - 0.35);
          card.rotation.set(0, baseRotY, baseRotZ);
          card.scale.setScalar(0.9);
        });
        warpDustMat.opacity = 0;
      }
      prevStage = currentStage;

      // Deep space rotation
      const warpMultiplier =
        currentStage === "TRANSITION" && !prefersReducedMotion ? 7.5 : 1;
      starField.rotation.y += 0.048 * dt * warpMultiplier * motionScale;
      starField.rotation.x = Math.sin(elapsed * 0.15) * 0.05 * motionScale;
      nebulaCloud.rotation.z += 0.018 * dt * warpMultiplier * motionScale;

      // Smooth camera framing per stage
      const isCompactViewport = camera.aspect < 0.85;
      const targetCamZ =
        currentStage === "INTRO"
          ? 8.5
          : currentStage === "OPENING_PHOTOS"
          ? isCompactViewport
            ? 7.3
            : 6.4
          : currentStage === "TRANSITION"
          ? 3.3
          : currentStage === "MODEL_STAGE"
          ? isCompactViewport
            ? 6.4
            : 5.7
          : isCompactViewport
          ? 8.5
          : 7.5;
      const camLerp = 1 - Math.exp(-4.2 * dt);
      const targetCamX = prefersReducedMotion ? 0 : parallaxX * 0.16;
      const targetCamY =
        (currentStage === "MODEL_STAGE" ? 0.32 : 0.14) +
        (prefersReducedMotion ? 0 : parallaxY * 0.12);
      camera.position.x += (targetCamX - camera.position.x) * camLerp;
      camera.position.y += (targetCamY - camera.position.y) * camLerp;
      camera.position.z += (targetCamZ - camera.position.z) * camLerp;
      camera.lookAt(0, 0, 0);

      // Stage group visibility
      openingPhotosGroup.visible =
        currentStage === "OPENING_PHOTOS" || currentStage === "TRANSITION";
      centerModelGroup.visible = currentStage === "MODEL_STAGE";
      envelopeStageGroup.visible = currentStage === "ENVELOPE_LETTER";

      // Stage 1 & 2: Opening Photos & Creative Stardust Transition
      if (openingPhotosGroup.visible) {
        const cardBlend = 1 - Math.exp(-5.2 * dt);
        openingCards.forEach((card, idx) => {
          const { side, baseX, baseY, baseZ, baseRotY, baseRotZ } =
            card.userData as {
              side: number;
              baseX: number;
              baseY: number;
              baseZ: number;
              baseRotY: number;
              baseRotZ: number;
            };
          if (currentStage === "TRANSITION") {
            // Softly part outward to the sides while camera glides toward the 3D gift
            const targetX = baseX + side * 2.25;
            const targetZ = baseZ - 1.65;
            card.position.x += (targetX - card.position.x) * cardBlend;
            card.position.z += (targetZ - card.position.z) * cardBlend;
            card.rotation.y +=
              (baseRotY - side * 0.45 - card.rotation.y) * cardBlend;
            card.scale.lerp(transitionTargetScale, cardBlend);
          } else {
            const floatY =
              Math.sin(elapsed * 1.6 + idx * 1.4) * 0.09 * motionScale;
            const px = prefersReducedMotion ? 0 : parallaxX * 0.14;
            const py = prefersReducedMotion ? 0 : parallaxY * 0.1;
            card.position.x += (baseX + px - card.position.x) * cardBlend;
            card.position.y +=
              (baseY + floatY + py - card.position.y) * cardBlend;
            card.position.z += (baseZ - card.position.z) * cardBlend;
            card.rotation.x +=
              ((prefersReducedMotion ? 0 : -parallaxY * 0.06) -
                card.rotation.x) *
              cardBlend;
            card.rotation.y +=
              (baseRotY +
                (prefersReducedMotion ? 0 : parallaxX * 0.08) -
                card.rotation.y) *
              cardBlend;
            card.rotation.z += (baseRotZ - card.rotation.z) * cardBlend;
            card.scale.lerp(unitScale, cardBlend);
          }
        });

        if (currentStage === "TRANSITION") {
          warpDustMat.opacity = Math.min(0.88, warpDustMat.opacity + dt * 1.8);
          warpDustPoints.rotation.z += dt * 1.6 * motionScale;
          warpDustPoints.position.z = ((elapsed * 3.2) % 2.5) - 1.2;
        } else {
          warpDustMat.opacity = Math.max(0, warpDustMat.opacity - dt * 2.5);
        }
      }

      // Stage 3: 3D Model, Counter-Rotating Celestial Pedestal, Golden Fireflies & Voice Waves
      if (centerModelGroup.visible) {
        fallbackModel.update(dt, elapsed);
        centerModelGroup.rotation.y =
          userYaw + elapsed * curatedModel.rotationSpeed * motionScale;
        centerModelGroup.position.y =
          Math.sin(elapsed * 1.5) * 0.07 * motionScale;

        // Counter-rotating pedestal rings
        outerPedestalRingGroup.rotation.y += dt * 0.48 * motionScale;
        innerPedestalRingGroup.rotation.y -= dt * 0.72 * motionScale;

        // Update golden fireflies around the perimeter halo
        if (!prefersReducedMotion) {
          for (let i = 0; i < fireflyCount; i++) {
            const i3 = i * 3;
            fireflyAngles[i] += dt * 0.28 * (i % 2 === 0 ? 1 : -1);
            let h = fireflyHeights[i] + dt * fireflySpeeds[i];
            if (h > 1.55) h = -1.25;
            fireflyHeights[i] = h;
            const r =
              fireflyRadii[i] + Math.sin(elapsed * 1.4 + i) * 0.08;
            fireflyPositions[i3] = Math.cos(fireflyAngles[i]) * r;
            fireflyPositions[i3 + 1] = h;
            fireflyPositions[i3 + 2] = Math.sin(fireflyAngles[i]) * r;
          }
          fireflyPosAttr.needsUpdate = true;
        }

        // Expanding voice soundwave rings
        voiceWaveRings.forEach((ring, idx) => {
          const mat = ring.material as T.MeshBasicMaterial;
          if (voicePlayingRef.current) {
            const phase = (elapsed * 1.35 + idx * 0.33) % 1;
            ring.scale.setScalar(1 + phase * 1.35);
            mat.opacity = (1 - phase) * 0.65;
          } else {
            mat.opacity = Math.max(0, mat.opacity - dt * 2.5);
          }
        });
      }

      // Stage 4: 3-Phase Envelope Open/Close & 8 Live Photo Formations
      if (envelopeStageGroup.visible) {
        const targetOpen = letterOpenedRef.current ? 1 : 0;
        const envBlend = prefersReducedMotion ? 0.35 : 1 - Math.exp(-3.6 * dt);
        openProgress += (targetOpen - openProgress) * envBlend;

        // Phase 1 (0.00 -> 0.22): Wax seal unseals
        const sealT = Math.max(0, Math.min(1, openProgress / 0.22));
        waxSealGroup.visible = sealT < 0.98;
        waxSealGroup.scale.setScalar(Math.max(0.001, 1 - sealT * 0.95));
        waxSealGroup.position.z = 0.074 + Math.sin(sealT * Math.PI) * 0.08;

        // Phase 2 (0.14 -> 0.56): Top flap rotates open around top hinge
        const flapT = Math.max(0, Math.min(1, (openProgress - 0.14) / 0.42));
        const flapEase = flapT * flapT * (3 - 2 * flapT);
        flapPivot.rotation.x = -flapEase * Math.PI * 0.9;

        // Phase 3 (0.45 -> 1.00): Fine-art letter sheet slides out of the pocket
        const sheetT = Math.max(0, Math.min(1, (openProgress - 0.45) / 0.55));
        const sheetEase = sheetT * sheetT * (3 - 2 * sheetT);
        letterPaperGroup.position.y = -0.04 + sheetEase * 1.04;
        letterPaperGroup.position.z =
          -0.005 + Math.max(0, (sheetEase - 0.35) / 0.65) * 0.095;
        letterPaperGroup.rotation.x = -sheetEase * 0.05;
        letterPaperGroup.scale.setScalar(0.95 + sheetEase * 0.09);

        envelopeGroup.rotation.y =
          Math.sin(elapsed * 0.65) * 0.13 * motionScale + userYaw * 0.35;
        envelopeGroup.position.y =
          -0.12 -
          sheetEase * 0.38 +
          Math.sin(elapsed * 1.4) * 0.045 * motionScale;

        updatePhotoFormation(formationRef.current, elapsed, dt);
      }

      renderer.render(scene, camera);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      observer.disconnect();
      motionQuery.removeEventListener("change", onMotionChange);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);

      fallbackModel.dispose();
      if (gltfRoot) {
        disposeObjectTree(gltfRoot);
      }
      ownedGeometries.forEach((g) => g.dispose());
      ownedMaterials.forEach((m) => m.dispose());
      ownedTextures.forEach((t) => t.dispose());
      renderer.dispose();
    };
  }, [draft, photos, template]);

  if (webglUnavailable) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#060411] p-6 text-center text-white/80">
        Thiết bị đang bật chế độ tiết kiệm đồ họa; bạn vẫn có thể nghe nhạc, giọng nói và mở lá thư.
      </div>
    );
  }

  return (
    <div
      ref={hostRef}
      className="absolute inset-0 h-full w-full overflow-hidden"
    />
  );
}
