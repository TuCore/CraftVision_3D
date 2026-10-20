"use client";

import { useEffect, useRef } from "react";
import * as T from "three";

type FallingFlower = {
  object: T.Object3D;
  speed: number;
  drift: number;
  spin: number;
  phase: number;
};

type BloomPart = {
  object: T.Object3D;
  targetScale: T.Vector3;
  delay: number;
  duration: number;
};

export default function HeartKeyScene({ paused, gallery, onBouquet }: { paused: boolean; gallery: boolean; onBouquet: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);
  const galleryRef = useRef(gallery);
  const onBouquetRef = useRef(onBouquet);

  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { galleryRef.current = gallery; }, [gallery]);
  useEffect(() => { onBouquetRef.current = onBouquet; }, [onBouquet]);

  useEffect(() => {
    const element = host.current;
    if (!element) return;

    let renderer: T.WebGLRenderer;
    try {
      renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    element.appendChild(renderer.domElement);

    const scene = new T.Scene();
    scene.fog = new T.FogExp2(0x16070f, 0.032);
    const camera = new T.PerspectiveCamera(46, 1, 0.1, 80);
    camera.position.set(0, 0.1, 13);
    const world = new T.Group();
    const bouquetAnchor = new T.Group();
    world.add(bouquetAnchor);
    scene.add(world);

    scene.add(new T.HemisphereLight(0xffe6ee, 0x210711, 2.5));
    const keyLight = new T.DirectionalLight(0xfff2df, 4.8);
    keyLight.position.set(4, 7, 7);
    scene.add(keyLight);
    const pinkLight = new T.PointLight(0xff4f93, 24, 20);
    pinkLight.position.set(-4, 1, 5);
    scene.add(pinkLight);

    const resources = new Set<T.BufferGeometry | T.Material | T.Texture>();
    const bloomParts: BloomPart[] = [];
    const starsGeometry = new T.BufferGeometry();
    const positions = new Float32Array(360 * 3);
    for (let index = 0; index < positions.length; index += 3) {
      positions[index] = (Math.random() - 0.5) * 34;
      positions[index + 1] = (Math.random() - 0.5) * 22;
      positions[index + 2] = -2 - Math.random() * 22;
    }
    starsGeometry.setAttribute("position", new T.BufferAttribute(positions, 3));
    const starsMaterial = new T.PointsMaterial({ color: 0xffffff, size: 0.055, transparent: true, opacity: 0.88 });
    const stars = new T.Points(starsGeometry, starsMaterial);
    resources.add(starsGeometry);
    resources.add(starsMaterial);
    world.add(stars);

    const falling: FallingFlower[] = [];
    const stemGeometry = new T.CylinderGeometry(0.045, 0.06, 3.8, 8);
    const petalGeometry = new T.SphereGeometry(0.38, 18, 14);
    const leafGeometry = new T.SphereGeometry(0.32, 12, 10);
    const wrapGeometry = new T.ConeGeometry(1.55, 3.1, 5, 1, true);
    const stemMaterial = new T.MeshStandardMaterial({ color: 0x137b45, roughness: 0.68 });
    const petalMaterial = new T.MeshStandardMaterial({ color: 0xff8aaa, emissive: 0x3a0717, roughness: 0.5 });
    const leafMaterial = new T.MeshStandardMaterial({ color: 0x0e6c3e, roughness: 0.72 });
    const wrapMaterial = new T.MeshStandardMaterial({ color: 0xffd8df, side: T.DoubleSide, roughness: 0.8 });
    [stemGeometry, petalGeometry, leafGeometry, wrapGeometry, stemMaterial, petalMaterial, leafMaterial, wrapMaterial].forEach((resource) => resources.add(resource));
    const bouquet = new T.Group();
    const flowerPositions = [[0, 2.2], [-0.7, 1.55], [0.75, 1.45], [-1.15, 0.9], [1.2, 0.8], [-0.35, 0.7], [0.35, 0.62], [-0.85, 0.35], [0.88, 0.25]];
    flowerPositions.forEach(([x, y], index) => {
      const stem = new T.Mesh(stemGeometry, stemMaterial);
      stem.position.set(x * 0.55, y - 1.85, (index % 3 - 1) * 0.12);
      stem.rotation.z = -x * 0.12;
      bouquet.add(stem);
      for (let petal = 0; petal < 5; petal += 1) {
        const mesh = new T.Mesh(petalGeometry, petalMaterial);
        const angle = petal / 5 * Math.PI * 2;
        const targetScale = new T.Vector3(0.62, 1.18, 0.5);
        mesh.scale.setScalar(0.001);
        mesh.position.set(x + Math.cos(angle) * 0.22, y + Math.sin(angle) * 0.12, Math.sin(angle) * 0.22);
        mesh.rotation.z = -Math.cos(angle) * 0.38;
        bouquet.add(mesh);
        bloomParts.push({ object: mesh, targetScale, delay: 0.18 + (y - 0.25) * 0.48 + petal * 0.035, duration: 0.78 });
      }
      const leaf = new T.Mesh(leafGeometry, leafMaterial);
      const leafTargetScale = new T.Vector3(0.45, 1.35, 0.18);
      leaf.scale.setScalar(0.001);
      leaf.position.set(x * 0.7 + (index % 2 ? 0.28 : -0.28), y - 1.45, 0.08);
      leaf.rotation.z = index % 2 ? -0.72 : 0.72;
      bouquet.add(leaf);
      bloomParts.push({ object: leaf, targetScale: leafTargetScale, delay: 0.08 + (y - 0.25) * 0.3, duration: 0.65 });
    });
    const wrap = new T.Mesh(wrapGeometry, wrapMaterial);
    wrap.position.y = -2.15;
    bouquet.add(wrap);
    bouquet.position.y = -0.35;
    bouquet.scale.setScalar(0.95);
    bouquetAnchor.add(bouquet);

    const flowerMaterials = ["🌷", "🌸", "🌹", "💐"].map((symbol) => {
          const canvas = document.createElement("canvas");
          canvas.width = 128;
          canvas.height = 128;
          const context = canvas.getContext("2d");
          if (context) {
            context.font = "88px serif";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillText(symbol, 64, 67);
          }
          const texture = new T.CanvasTexture(canvas);
          texture.colorSpace = T.SRGBColorSpace;
          const material = new T.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
          resources.add(texture);
          resources.add(material);
          return material;
    });
    for (let index = 0; index < 58; index += 1) {
      const flower = new T.Sprite(flowerMaterials[index % flowerMaterials.length]);
      const flowerScale = 0.22 + Math.random() * 0.38;
      flower.scale.set(flowerScale, flowerScale, 1);
      flower.position.set((Math.random() - 0.5) * 24, -12 + Math.random() * 24, -3 - Math.random() * 15);
      world.add(flower);
      falling.push({ object: flower, speed: 0.45 + Math.random() * 0.8, drift: 0.15 + Math.random() * 0.35, spin: (Math.random() - 0.5) * 0.8, phase: Math.random() * Math.PI * 2 });
    }

    let dragging = false;
    let moved = false;
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;
    const pointerDown = (event: PointerEvent) => {
      dragging = true;
      moved = false;
      pointerX = event.clientX;
      pointerY = event.clientY;
      element.setPointerCapture(event.pointerId);
    };
    const pointerMove = (event: PointerEvent) => {
      if (!dragging || pausedRef.current) return;
      const dx = event.clientX - pointerX;
      const dy = event.clientY - pointerY;
      if (Math.abs(dx) + Math.abs(dy) > 5) moved = true;
      targetY += dx * 0.004;
      targetX = T.MathUtils.clamp(targetX + dy * 0.003, -0.28, 0.28);
      pointerX = event.clientX;
      pointerY = event.clientY;
    };
    const pointerUp = () => {
      if (dragging && !moved && !pausedRef.current) onBouquetRef.current();
      dragging = false;
    };
    element.addEventListener("pointerdown", pointerDown);
    element.addEventListener("pointermove", pointerMove);
    element.addEventListener("pointerup", pointerUp);
    element.addEventListener("pointercancel", pointerUp);

    const resize = () => {
      renderer.setSize(element.clientWidth, element.clientHeight);
      camera.aspect = element.clientWidth / Math.max(element.clientHeight, 1);
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();

    let animationFrame = 0;
    let previous = performance.now();
    let elapsed = 0;
    const render = (now: number) => {
      const delta = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      if (!pausedRef.current && !document.hidden) {
        elapsed += delta;
        bloomParts.forEach((part) => {
          const progress = T.MathUtils.clamp((elapsed - part.delay) / part.duration, 0, 1);
          const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress) * Math.cos(progress * Math.PI * 2.25);
          part.object.scale.copy(part.targetScale).multiplyScalar(Math.max(0.001, eased));
        });
        falling.forEach((item) => {
          item.object.position.y -= item.speed * delta;
          item.object.position.x += Math.sin(elapsed * item.drift + item.phase) * delta * 0.12;
          item.object.rotation.y += item.spin * delta;
          item.object.rotation.z += item.spin * 0.65 * delta;
          if (item.object.position.y < -12) item.object.position.y = 12;
        });
        starsMaterial.opacity = 0.7 + Math.sin(elapsed * 1.5) * 0.16;
        bouquetAnchor.rotation.x += (targetX - bouquetAnchor.rotation.x) * 0.06;
        bouquetAnchor.rotation.y += (targetY - bouquetAnchor.rotation.y) * 0.06;
        bouquetAnchor.position.y = Math.sin(elapsed * 0.9) * 0.12 + (galleryRef.current ? -4.6 : 0);
        bouquetAnchor.scale.lerp(new T.Vector3().setScalar(galleryRef.current ? 0.55 : 1), 0.035);
        bouquet.rotation.z = Math.sin(elapsed * 0.7) * 0.025;
      }
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(render);
    };
    animationFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      element.removeEventListener("pointerdown", pointerDown);
      element.removeEventListener("pointermove", pointerMove);
      element.removeEventListener("pointerup", pointerUp);
      element.removeEventListener("pointercancel", pointerUp);
      resources.forEach((resource) => resource.dispose());
      renderer.renderLists.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={host} className="rose-rain-canvas flower-love-canvas" role="button" tabIndex={0} aria-label="Chạm vào bó hoa để nhận lời yêu" />;
}
