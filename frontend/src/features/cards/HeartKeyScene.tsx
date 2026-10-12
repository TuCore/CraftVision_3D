"use client";

import { useEffect, useRef, useState } from "react";
import * as T from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { CardDraft, CardTemplate } from "./catalog";
import { buildCardModel } from "./models";

type FallingObject = { object: T.Object3D; speed: number; spinY: number; spinZ: number };

export default function HeartKeyScene({ draft, template, paused, onUnlocked }: { draft: CardDraft; template: CardTemplate; paused: boolean; onUnlocked: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const pause = useRef(paused);
  const unlocked = useRef(false);
  const onUnlockedRef = useRef(onUnlocked);
  const [failed, setFailed] = useState(false);

  useEffect(() => { pause.current = paused; }, [paused]);
  useEffect(() => { onUnlockedRef.current = onUnlocked; }, [onUnlocked]);

  useEffect(() => {
    const element = host.current!;
    let renderer: T.WebGLRenderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true }); } catch { setFailed(true); return; }

    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.outputColorSpace = T.SRGBColorSpace;
    element.appendChild(renderer.domElement);

    const scene = new T.Scene();
    scene.fog = new T.FogExp2(0x16091b, .025);
    const camera = new T.PerspectiveCamera(55, 1, .1, 100);
    camera.position.set(0, 0, 12);
    const world = new T.Group();
    scene.add(world);

    const card = buildCardModel(template, draft);
    card.root.scale.setScalar(1.25);
    card.root.position.z = 2;
    world.add(card.root);

    scene.add(new T.HemisphereLight(0xffd6e7, 0x25112c, 2.8));
    const keyLight = new T.DirectionalLight(0xfff1cf, 4.5);
    keyLight.position.set(4, 6, 8);
    scene.add(keyLight);
    const rimLight = new T.PointLight(0xff4f8a, 25, 22);
    rimLight.position.set(-5, 1, 5);
    scene.add(rimLight);

    const falling: FallingObject[] = [];
    const decorResources = new Set<T.BufferGeometry | T.Material | T.Texture>();
    let disposed = false;
    new GLTFLoader().load("/models/love-gift-decor.glb", gltf => {
      if (disposed) return;
      const sources: T.Mesh[] = [];
      gltf.scene.traverse(object => {
        if (!(object instanceof T.Mesh)) return;
        sources.push(object);
        decorResources.add(object.geometry);
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach(material => {
          decorResources.add(material);
          Object.values(material).forEach(value => { if (value instanceof T.Texture) decorResources.add(value); });
        });
      });
      if (!sources.length) return;
      for (let i = 0; i < 72; i++) {
        const source = sources[i % sources.length];
        const object = source.clone();
        const scale = .18 + Math.random() * .38;
        object.scale.copy(source.scale).multiplyScalar(scale);
        object.position.set((Math.random() - .5) * 26, -20 + Math.random() * 40, -4 - Math.random() * 20);
        object.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI * 2, Math.random() * Math.PI);
        world.add(object);
        falling.push({ object, speed: 1.2 + Math.random() * 1.8, spinY: (Math.random() - .5) * .7, spinZ: (Math.random() - .5) * .55 });
      }
    }, undefined, () => setFailed(true));

    let dragging = false, pointerX = 0, pointerY = 0, targetX = -.08, targetY = 0, progress = 0;
    const down = (event: PointerEvent) => { dragging = true; pointerX = event.clientX; pointerY = event.clientY; element.setPointerCapture(event.pointerId); };
    const move = (event: PointerEvent) => {
      if (!dragging || pause.current) return;
      const dx = event.clientX - pointerX, dy = event.clientY - pointerY;
      targetY += dx * .006;
      targetX = T.MathUtils.clamp(targetX + dy * .004, -.65, .65);
      progress = Math.min(1, progress + Math.abs(dx) / 520);
      pointerX = event.clientX; pointerY = event.clientY;
      if (progress >= 1 && !unlocked.current) { unlocked.current = true; onUnlockedRef.current(); }
    };
    const up = () => { dragging = false; };
    const key = (event: KeyboardEvent) => {
      if (!event.key.startsWith("Arrow") || pause.current) return;
      event.preventDefault();
      targetY += event.key === "ArrowLeft" ? -.14 : event.key === "ArrowRight" ? .14 : 0;
      targetX = T.MathUtils.clamp(targetX + (event.key === "ArrowUp" ? -.1 : event.key === "ArrowDown" ? .1 : 0), -.65, .65);
      progress = Math.min(1, progress + .1);
      if (progress >= 1 && !unlocked.current) { unlocked.current = true; onUnlockedRef.current(); }
    };
    element.addEventListener("pointerdown", down);
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerup", up);
    element.addEventListener("pointercancel", up);
    element.addEventListener("keydown", key);

    const resize = () => {
      renderer.setSize(element.clientWidth, element.clientHeight);
      camera.aspect = element.clientWidth / element.clientHeight;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0, time = 0, previous = performance.now();
    const render = (now: number) => {
      const dt = Math.min((now - previous) / 1000, .05); previous = now;
      if (!pause.current && !document.hidden) {
        time += dt;
        if (!reduced) falling.forEach(item => {
          item.object.position.y -= item.speed * dt;
          if (item.object.position.y < -20) item.object.position.y = 20;
          item.object.rotation.y += item.spinY * dt;
          item.object.rotation.z += item.spinZ * dt;
        });
        world.rotation.x += (targetX - world.rotation.x) * .06;
        world.rotation.y += (targetY - world.rotation.y) * .06;
        card.update(progress, time);
      }
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      element.removeEventListener("pointerdown", down);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", up);
      element.removeEventListener("pointercancel", up);
      element.removeEventListener("keydown", key);
      card.dispose();
      decorResources.forEach(resource => resource.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [draft, template]);

  return <div ref={host} className="rose-rain-canvas" tabIndex={0} role="region" aria-label="Mô hình trái tim và chìa khóa 3D. Kéo ngang hoặc dùng phím mũi tên để mở khóa.">{failed && <p className="rose-rain-fallback">Không tải được vật thể trang trí. Bạn vẫn có thể xoay chìa khóa và mở thư.</p>}</div>;
}
