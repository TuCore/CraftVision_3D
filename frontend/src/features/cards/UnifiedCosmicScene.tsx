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
  grad.addColorStop(0.35, "rgba(255,245,255,0.8)");
  grad.addColorStop(0.7, "rgba(255,255,255,0.2)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
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

  // Fine cream stationery paper background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 512);
  bgGrad.addColorStop(0, "#fffdf8");
  bgGrad.addColorStop(1, "#f7ead7");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 768, 512);

  // Outer gold & accent double border
  ctx.strokeStyle = "#d97706";
  ctx.lineWidth = 6;
  ctx.strokeRect(22, 22, 724, 468);
  ctx.strokeStyle = accent || "#be185d";
  ctx.lineWidth = 2;
  ctx.strokeRect(34, 34, 700, 444);

  // Ruled paper lines
  ctx.strokeStyle = "rgba(180, 130, 90, 0.22)";
  ctx.lineWidth = 1.5;
  for (let y = 155; y <= 385; y += 46) {
    ctx.beginPath();
    ctx.moveTo(64, y);
    ctx.lineTo(704, y);
    ctx.stroke();
  }

  // Header & Recipient
  ctx.fillStyle = "#881337";
  ctx.font = "bold 30px Georgia, serif";
  ctx.textAlign = "left";
  const safeRecipient = (recipient || "Người thương").slice(0, 28);
  ctx.fillText(`Gửi ${safeRecipient},`, 64, 98);

  // Decorative heart stamp on top-right
  ctx.fillStyle = accent || "#e11d48";
  ctx.font = "bold 28px Georgia, serif";
  ctx.textAlign = "right";
  ctx.fillText("♥", 698, 96);

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
    ctx.fillText(line + suffix, 64, 146 + idx * 46);
  });

  // Sender signature at bottom right
  ctx.fillStyle = "#7c2d12";
  ctx.font = "bold 24px Georgia, serif";
  ctx.textAlign = "right";
  const safeSender = (sender || "Người gửi").slice(0, 24);
  ctx.fillText(`— ${safeSender} ✨`, 696, 442);

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
  grad.addColorStop(0, accent || "#ec4899");
  grad.addColorStop(1, "#1e1b4b");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 10;
  ctx.strokeRect(24, 24, 464, 464);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 42px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`Kỷ niệm #${index + 1}`, 256, 245);
  ctx.font = "28px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.fillText("CraftVision 3D", 256, 300);
  const tex = new T.CanvasTexture(canvas);
  tex.colorSpace = T.SRGBColorSpace;
  return tex;
}

export default function UnifiedCosmicScene({
  template,
  draft,
  stage,
  voicePlaying,
  letterOpened,
  photos,
  onSceneInteract,
  onPhotoClick,
}: UnifiedCosmicSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  const stageRef = useRef<UnifiedStage>(stage);
  const voicePlayingRef = useRef(voicePlaying);
  const letterOpenedRef = useRef(letterOpened);
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
    interactRef.current = onSceneInteract;
  }, [onSceneInteract]);
  useEffect(() => {
    photoClickRef.current = onPhotoClick;
  }, [onPhotoClick]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const ownedGeometries: T.BufferGeometry[] = [];
    const ownedMaterials: T.Material[] = [];
    const ownedTextures: T.Texture[] = [];

    const trackGeo = <G extends T.BufferGeometry>(g: G): G => {
      ownedGeometries.push(g);
      return g;
    };
    const trackMat = <M extends T.Material>(m: M): M => {
      ownedMaterials.push(m);
      return m;
    };
    const trackTex = <X extends T.Texture>(t: X): X => {
      ownedTextures.push(t);
      return t;
    };

    let renderer: T.WebGLRenderer;
    try {
      renderer = new T.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    } catch {
      setWebglUnavailable(true);
      return;
    }

    const bgPreset = getCosmicBackground(String(draft.values.bgStyle || ""));
    const customNebulaColor =
      typeof draft.values.bgColor === "string" && /^#[0-9a-f]{6}$/i.test(draft.values.bgColor)
        ? draft.values.bgColor
        : bgPreset.nebulaPrimary;
    const accentColor =
      typeof draft.values.accent === "string" && /^#[0-9a-f]{6}$/i.test(draft.values.accent)
        ? draft.values.accent
        : template.color;
    const envelopeColor =
      typeof draft.values.envelopeColor === "string" && /^#[0-9a-f]{6}$/i.test(draft.values.envelopeColor)
        ? draft.values.envelopeColor
        : "#f9e8d4";
    const formation = getPhotoFormation(String(draft.values.photoFormation || "")).id;
    const curatedModel = getCuratedModel(String(draft.values.sceneModel || ""));

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    host.innerHTML = "";
    host.appendChild(renderer.domElement);

    const scene = new T.Scene();
    scene.background = new T.Color(bgPreset.deepColor);
    scene.fog = new T.FogExp2(bgPreset.deepColor, 0.022);

    const camera = new T.PerspectiveCamera(46, 1, 0.1, 120);
    camera.position.set(0, 0.4, 8.2);

    // Ánh sáng vũ trụ đa chiều
    const ambientLight = new T.AmbientLight("#ffffff", 1.35);
    const keyLight = new T.DirectionalLight("#fff5e6", 2.4);
    keyLight.position.set(4, 6, 5);
    const rimLight = new T.PointLight(customNebulaColor, 4.2, 22);
    rimLight.position.set(-4, 2.5, -3);
    const bottomGlow = new T.PointLight(accentColor, 3.2, 16);
    bottomGlow.position.set(0, -2.5, 2.5);
    scene.add(ambientLight, keyLight, rimLight, bottomGlow);

    // =========================================================================
    // 1. COSMIC BACKGROUND 3D (ĐA TẦNG CHIỀU SÂU VŨ TRỤ)
    // =========================================================================
    const cosmicGroup = new T.Group();
    scene.add(cosmicGroup);

    const starTex = trackTex(createStarTexture());
    const starCount = 2200;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const cPrimary = new T.Color(customNebulaColor);
    const cSecondary = new T.Color(bgPreset.nebulaSecondary);
    const cStar = new T.Color(bgPreset.starColor);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const radius = 6 + Math.random() * 42;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i3 + 2] = -Math.abs(radius * Math.cos(phi)) - 2;

      const mix = i % 3 === 0 ? cStar : i % 3 === 1 ? cPrimary : cSecondary;
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

    // Vòng xoáy Tinh vân / Dải Ngân hà có chiều sâu
    const nebulaCount = 450;
    const nebulaPos = new Float32Array(nebulaCount * 3);
    const nebulaCol = new Float32Array(nebulaCount * 3);
    for (let i = 0; i < nebulaCount; i++) {
      const i3 = i * 3;
      const branchAngle = ((i % 3) * Math.PI * 2) / 3;
      const r = 2.5 + (i / nebulaCount) * 18;
      const spin = r * 0.55;
      nebulaPos[i3] = Math.cos(branchAngle + spin) * r + (Math.random() - 0.5) * 1.8;
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
        opacity: 0.42,
        depthWrite: false,
        blending: T.AdditiveBlending,
      })
    );
    const nebulaCloud = new T.Points(nebulaGeo, nebulaMat);
    cosmicGroup.add(nebulaCloud);

    // =========================================================================
    // 2. LOAD TEXTURES CHO HÌNH ẢNH KỶ NIỆM CỦA NGƯỜI DÙNG
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
            loaded.colorSpace = T.SRGBColorSpace;
          },
          undefined,
          () => {}
        )
      );
      tex.colorSpace = T.SRGBColorSpace;
      return tex;
    });

    // =========================================================================
    // 3. BƯỚC 1: 1-2 HÌNH ẢNH MỞ MÀN (OPENING PHOTOS GROUP)
    // =========================================================================
    const openingPhotosGroup = new T.Group();
    scene.add(openingPhotosGroup);

    const openingCount = Math.min(2, effectivePhotos.length);
    const openingCards: T.Group[] = [];
    for (let i = 0; i < openingCount; i++) {
      const card = new T.Group();
      const frame = new T.Mesh(
        trackGeo(new T.BoxGeometry(2.35, 2.85, 0.07)),
        trackMat(
          new T.MeshStandardMaterial({
            color: "#fffdf9",
            roughness: 0.3,
            metalness: 0.1,
          })
        )
      );
      const pic = new T.Mesh(
        trackGeo(new T.PlaneGeometry(2.05, 2.15)),
        trackMat(
          new T.MeshBasicMaterial({
            map: loadedPhotoTextures[i],
            side: T.DoubleSide,
          })
        )
      );
      pic.position.set(0, 0.18, 0.045);
      const glowBorder = new T.Mesh(
        trackGeo(new T.PlaneGeometry(2.5, 3.0)),
        trackMat(
          new T.MeshBasicMaterial({
            color: accentColor,
            transparent: true,
            opacity: 0.28,
            side: T.DoubleSide,
          })
        )
      );
      glowBorder.position.set(0, 0, -0.05);
      card.add(glowBorder, frame, pic);

      if (openingCount === 1) {
        card.position.set(0, 0.15, 1.2);
      } else {
        const side = i === 0 ? -1 : 1;
        card.position.set(side * 1.38, 0.15, 1.0);
        card.rotation.z = -side * 0.09;
        card.rotation.y = -side * 0.18;
      }
      openingPhotosGroup.add(card);
      openingCards.push(card);
    }

    // =========================================================================
    // 4. BƯỚC 3: MODEL 3D TRUNG TÂM (DO CHỦ HỆ THỐNG CUNG CẤP) + HIỆU ỨNG SÓNG ÂM
    // =========================================================================
    const centerModelGroup = new T.Group();
    scene.add(centerModelGroup);

    // Bệ đỡ ánh sáng năng lượng dưới Model 3D
    const pedestalRing = new T.Mesh(
      trackGeo(new T.TorusGeometry(1.45, 0.035, 16, 64)),
      trackMat(
        new T.MeshBasicMaterial({
          color: accentColor,
          transparent: true,
          opacity: 0.75,
        })
      )
    );
    pedestalRing.rotation.x = Math.PI / 2;
    pedestalRing.position.y = -1.25;
    centerModelGroup.add(pedestalRing);

    // Vòng sóng âm lan tỏa khi đang phát đoạn ghi âm giọng nói
    const voiceWaveRings: T.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const waveRing = new T.Mesh(
        trackGeo(new T.RingGeometry(1.3, 1.38, 48)),
        trackMat(
          new T.MeshBasicMaterial({
            color: "#fbbf24",
            transparent: true,
            opacity: 0,
            side: T.DoubleSide,
            blending: T.AdditiveBlending,
          })
        )
      );
      waveRing.rotation.x = Math.PI / 2;
      waveRing.position.y = -1.22;
      centerModelGroup.add(waveRing);
      voiceWaveRings.push(waveRing);
    }

    // Fallback model tạo tức thì trong lúc đợi file .glb tải xong
    const fallbackTemplate: CardTemplate = {
      ...template,
      model: curatedModel.fallbackModelKey,
      color: accentColor,
    };
    const fallbackModel = buildCardModel(fallbackTemplate, draft);
    centerModelGroup.add(fallbackModel.root);

    let gltfRoot: T.Object3D | null = null;
    let gltfDisposed = false;
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      curatedModel.modelUrl,
      (gltf) => {
        if (gltfDisposed) return;
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
      },
      undefined,
      () => {
        // Giữ nguyên fallbackModel nếu file .glb không tải được
      }
    );

    // =========================================================================
    // 5. BƯỚC 4: PHONG THƯ 3D MỞ NẮP & CÁC HÌNH ẢNH XOAY VÒNG QUANH LÁ THƯ
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
      new T.MeshStandardMaterial({ color: baseEnvCol, roughness: 0.42, metalness: 0.08 })
    );
    const envSideFoldMat = trackMat(
      new T.MeshStandardMaterial({ color: sideFoldCol, roughness: 0.44, metalness: 0.08 })
    );
    const envBottomFoldMat = trackMat(
      new T.MeshStandardMaterial({ color: bottomFoldCol, roughness: 0.4, metalness: 0.1 })
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
    const goldFoilMat = trackMat(
      new T.MeshStandardMaterial({
        color: "#fbbf24",
        roughness: 0.25,
        metalness: 0.72,
      })
    );

    // 5.1. Lưng phong bì + Viền kim loại vàng + Lớp lót lụa kem bên trong
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

    // Thành viền trái, phải và đáy tạo độ dày túi thư thật (để hở khe miệng trên)
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

    // 5.2. Tờ thư 3D có nội dung chữ thật nằm trong khe túi phong bì
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
      trackMat(new T.MeshStandardMaterial({ color: "#fffcf5", roughness: 0.42 }))
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

    // 5.3. Ba cánh gấp mặt trước tạo khe túi phong bì chữ V chuẩn thực tế
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

    // Đường viền chỉ vàng nổi bật dọc theo nếp gấp chữ V của phong bì
    const seamLineMat = trackMat(
      new T.LineBasicMaterial({ color: "#fcd34d", transparent: true, opacity: 0.85 })
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

    // 5.4. Bản lề Nắp phong thư trên (Tam giác cân bo đỉnh bằng THREE.Shape, xoay chuẩn trục X)
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

    // Lớp lót lụa kem mặt trong của nắp phong thư (hiện ra khi nắp mở lật lên)
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

    // Viền vàng dọc theo mép nắp phong thư
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

    // 5.5. Con dấu sáp đóng nổi (3D Embossed Wax Seal) tại đỉnh mũi nắp thư
    const waxSealGroup = new T.Group();
    waxSealGroup.position.set(0, -0.08, 0.074);
    const waxDisc = new T.Mesh(
      trackGeo(new T.CylinderGeometry(0.23, 0.25, 0.042, 32)),
      trackMat(
        new T.MeshStandardMaterial({
          color: accentColor,
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

    // Các khung ảnh kỷ niệm xoay vòng quanh Lá thư (tạo đủ số lượng để đội hình 3D đẹp mắt)
    const orbitGroup = new T.Group();
    envelopeStageGroup.add(orbitGroup);

    const displayPhotoCount = Math.max(
      effectivePhotos.length,
      formation === "heart" || formation === "star" ? 10 : 6
    );
    const photoMeshes: T.Group[] = [];

    for (let i = 0; i < displayPhotoCount; i++) {
      const pGroup = new T.Group();
      pGroup.userData = { photoIndex: i % effectivePhotos.length };
      const isFilm = formation === "film-strip";
      const backing = new T.Mesh(
        trackGeo(new T.PlaneGeometry(isFilm ? 1.48 : 1.28, isFilm ? 1.18 : 1.42)),
        trackMat(
          new T.MeshStandardMaterial({
            color: isFilm ? "#18181b" : "#fffaf0",
            roughness: 0.4,
            side: T.DoubleSide,
          })
        )
      );
      const photoPlane = new T.Mesh(
        trackGeo(new T.PlaneGeometry(1.12, 1.05)),
        trackMat(
          new T.MeshBasicMaterial({
            map: loadedPhotoTextures[i % loadedPhotoTextures.length],
            side: T.DoubleSide,
          })
        )
      );
      photoPlane.position.set(0, isFilm ? 0 : 0.08, 0.015);
      const photoBack = photoPlane.clone();
      photoBack.position.set(0, isFilm ? 0 : 0.08, -0.015);
      photoBack.rotation.y = Math.PI;
      pGroup.add(backing, photoPlane, photoBack);
      orbitGroup.add(pGroup);
      photoMeshes.push(pGroup);
    }

    // Hàm tính tọa độ 3D cho 8 Kiểu Trình Bày Ảnh Quanh Lá Thư
    const updatePhotoFormation = (
      mode: PhotoFormationPreset["id"],
      time: number
    ) => {
      const count = photoMeshes.length;
      for (let i = 0; i < count; i++) {
        const item = photoMeshes[i];
        const ratio = i / count;
        const angle = ratio * Math.PI * 2 + time * 0.42;

        if (mode === "sphere") {
          const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
          const theta = Math.PI * (1 + Math.sqrt(5)) * i + time * 0.45;
          const r = 3.55;
          item.position.set(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.cos(phi) * 0.72,
            r * Math.sin(phi) * Math.sin(theta)
          );
          item.lookAt(camera.position);
        } else if (mode === "floating-up") {
          const cycle = ((time * 0.32 + ratio) % 1) * 7.6 - 3.8;
          const sideAngle = i * 2.1 + Math.sin(time * 0.6 + i) * 0.3;
          const r = 2.7 + (i % 3) * 0.65;
          item.position.set(
            Math.cos(sideAngle) * r,
            cycle,
            Math.sin(sideAngle) * r * 0.75
          );
          item.rotation.set(0, Math.sin(time + i) * 0.25, Math.cos(time * 0.8 + i) * 0.08);
        } else if (mode === "heart") {
          const t = ratio * Math.PI * 2;
          const hx = (16 * Math.pow(Math.sin(t), 3)) * 0.21;
          const hy =
            (13 * Math.cos(t) -
              5 * Math.cos(2 * t) -
              2 * Math.cos(3 * t) -
              Math.cos(4 * t)) *
              0.19 +
            0.25;
          const pulse = 1 + Math.sin(time * 2.4) * 0.04;
          item.position.set(
            hx * pulse,
            hy * pulse,
            Math.sin(time * 0.9 + i) * 0.85
          );
          item.lookAt(camera.position);
        } else if (mode === "star") {
          const starAngle = ratio * Math.PI * 2 - Math.PI / 2;
          const arm = Math.cos(5 * starAngle);
          const r = (2.6 + arm * 1.05);
          item.position.set(
            Math.cos(starAngle + time * 0.18) * r,
            Math.sin(starAngle + time * 0.18) * r * 0.85,
            Math.sin(time + i) * 0.7
          );
          item.lookAt(camera.position);
        } else if (mode === "film-strip") {
          const r = 3.6;
          item.position.set(
            Math.cos(angle) * r,
            Math.sin(angle * 2) * 0.85,
            Math.sin(angle) * r
          );
          item.lookAt(0, item.position.y, 0);
          item.rotateY(Math.PI);
        } else if (mode === "galaxy-spiral") {
          const spiralY = (ratio - 0.5) * 4.4;
          const spiralAngle = ratio * Math.PI * 4 + time * 0.55;
          const r = 2.4 + Math.sin(ratio * Math.PI) * 1.4;
          item.position.set(
            Math.cos(spiralAngle) * r,
            spiralY,
            Math.sin(spiralAngle) * r
          );
          item.lookAt(camera.position);
        } else if (mode === "saturn-ring") {
          const r = 3.7;
          const x = Math.cos(angle) * r;
          const z = Math.sin(angle) * r;
          item.position.set(x, x * 0.28 + Math.sin(time + i) * 0.12, z);
          item.lookAt(camera.position);
        } else {
          // carousel-bloom
          const bloomFactor = Math.min(1, 0.75 + Math.sin(time * 0.8) * 0.12);
          const r = 3.35 * bloomFactor;
          item.position.set(
            Math.cos(angle) * r,
            Math.sin(i * 1.5 + time) * 0.9,
            Math.sin(angle) * r
          );
          item.lookAt(camera.position);
        }
      }
    };

    // =========================================================================
    // 6. ĐIỀU KHIỂN XOAY 360° & CHẠM TƯƠNG TÁC (POINTER + RAYCASTER)
    // =========================================================================
    const raycaster = new T.Raycaster();
    const pointer = new T.Vector2();
    let dragging = false;
    let moved = false;
    let startX = 0;
    let userYaw = 0;

    const canvas = renderer.domElement;
    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      moved = false;
      startX = e.clientX;
    };
    const onPointerMove = (e: PointerEvent) => {
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
    // 7. VÒNG LẶP RENDER THEO TỪNG GIAI ĐOẠN KỊCH BẢN
    // =========================================================================
    let rafId = 0;
    const startTime = performance.now();
    let openProgress = letterOpenedRef.current ? 1 : 0;

    const animate = (now: number) => {
      rafId = requestAnimationFrame(animate);
      const elapsed = (now - startTime) * 0.001;
      const currentStage = stageRef.current;

      // Chuyển động vũ trụ có chiều sâu
      const warpMultiplier = currentStage === "TRANSITION" ? 8.5 : 1;
      starField.rotation.y += 0.0008 * warpMultiplier;
      starField.rotation.x = Math.sin(elapsed * 0.15) * 0.06;
      nebulaCloud.rotation.z = elapsed * 0.03 * warpMultiplier;

      // Hiệu ứng camera theo từng giai đoạn
      const targetCamZ =
        currentStage === "INTRO"
          ? 8.5
          : currentStage === "OPENING_PHOTOS"
          ? 6.4
          : currentStage === "TRANSITION"
          ? 3.2
          : currentStage === "MODEL_STAGE"
          ? 5.8
          : 7.4;
      camera.position.z += (targetCamZ - camera.position.z) * 0.06;
      camera.position.y += ((currentStage === "MODEL_STAGE" ? 0.35 : 0.15) - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      // Ẩn/hiện các nhóm theo giai đoạn kịch bản
      openingPhotosGroup.visible =
        currentStage === "OPENING_PHOTOS" || currentStage === "TRANSITION";
      centerModelGroup.visible = currentStage === "MODEL_STAGE";
      envelopeStageGroup.visible = currentStage === "ENVELOPE_LETTER";

      // Animation Bước 1 & 2: 1-2 Ảnh Mở Màn
      if (openingPhotosGroup.visible) {
        openingCards.forEach((card, idx) => {
          const dir = idx === 0 ? -1 : 1;
          if (currentStage === "TRANSITION") {
            card.scale.multiplyScalar(0.92);
            card.rotation.y += 0.14 * dir;
            card.position.z += 0.12;
          } else {
            card.scale.lerp(new T.Vector3(1, 1, 1), 0.08);
            card.position.y = 0.12 + Math.sin(elapsed * 1.8 + idx * 1.4) * 0.12;
          }
        });
      }

      // Animation Bước 3: Model 3D & Sóng âm khi phát Ghi âm
      if (centerModelGroup.visible) {
        fallbackModel.update(1, elapsed);
        centerModelGroup.rotation.y =
          userYaw + elapsed * curatedModel.rotationSpeed;
        centerModelGroup.position.y = Math.sin(elapsed * 1.6) * 0.08;

        voiceWaveRings.forEach((ring, idx) => {
          const mat = ring.material as T.MeshBasicMaterial;
          if (voicePlayingRef.current) {
            const phase = (elapsed * 1.4 + idx * 0.33) % 1;
            ring.scale.setScalar(1 + phase * 1.35);
            mat.opacity = (1 - phase) * 0.65;
          } else {
            mat.opacity = 0;
          }
        });
      }

      // Animation Bước 4: Mở/Đóng Phong Thư 3 Pha & 8 Kiểu Ảnh Xoay Vòng Quanh Lá Thư
      if (envelopeStageGroup.visible) {
        const targetOpen = letterOpenedRef.current ? 1 : 0;
        openProgress += (targetOpen - openProgress) * 0.055;

        // Pha 1 (0.00 -> 0.22): Con dấu sáp nảy nhẹ và tách mở
        const sealT = Math.max(0, Math.min(1, openProgress / 0.22));
        waxSealGroup.visible = sealT < 0.98;
        waxSealGroup.scale.setScalar(Math.max(0.001, 1 - sealT * 0.95));
        waxSealGroup.position.z = 0.074 + Math.sin(sealT * Math.PI) * 0.08;

        // Pha 2 (0.14 -> 0.56): Nắp phong thư xoay mở quanh bản lề ngang (0° -> -162°)
        const flapT = Math.max(0, Math.min(1, (openProgress - 0.14) / 0.42));
        const flapEase = flapT * flapT * (3 - 2 * flapT);
        flapPivot.rotation.x = -flapEase * Math.PI * 0.9;

        // Pha 3 (0.45 -> 1.00): Tờ thư có chữ rút từ trong túi phong bì lên cao
        const sheetT = Math.max(0, Math.min(1, (openProgress - 0.45) / 0.55));
        const sheetEase = sheetT * sheetT * (3 - 2 * sheetT);
        letterPaperGroup.position.y = -0.04 + sheetEase * 1.04;
        letterPaperGroup.position.z =
          -0.005 + Math.max(0, (sheetEase - 0.35) / 0.65) * 0.095;
        letterPaperGroup.rotation.x = -sheetEase * 0.05;
        letterPaperGroup.scale.setScalar(0.95 + sheetEase * 0.09);

        // Thân phong bì hạ nhẹ xuống khi tờ thư rút lên để cân đối khung hình
        envelopeGroup.rotation.y =
          Math.sin(elapsed * 0.65) * 0.14 + userYaw * 0.35;
        envelopeGroup.position.y =
          -0.12 - sheetEase * 0.38 + Math.sin(elapsed * 1.4) * 0.05;

        updatePhotoFormation(formation, elapsed);
      }

      renderer.render(scene, camera);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      gltfDisposed = true;
      cancelAnimationFrame(rafId);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);

      fallbackModel.dispose();
      if (gltfRoot) {
        gltfRoot.traverse((obj) => {
          if (obj instanceof T.Mesh) {
            obj.geometry?.dispose();
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose());
            } else {
              obj.material?.dispose();
            }
          }
        });
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

  return <div ref={hostRef} className="absolute inset-0 h-full w-full overflow-hidden" />;
}
