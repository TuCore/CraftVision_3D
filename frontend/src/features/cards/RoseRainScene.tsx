"use client";
import { useEffect, useRef, useState } from "react";
import * as T from "three";
import { buildCardModel } from "./models";
import type { CardDraft, CardTemplate } from "./catalog";

export default function RoseRainScene({ draft, template, paused }: { draft: CardDraft; template: CardTemplate; paused: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const pause = useRef(paused);
  useEffect(() => { pause.current = paused; }, [paused]);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const element = host.current!;
    let renderer: T.WebGLRenderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true }); } catch { setFailed(true); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); element.appendChild(renderer.domElement);
    const scene = new T.Scene(); scene.fog = new T.FogExp2(0x000000, .018);
    const camera = new T.PerspectiveCamera(65, 1, .1, 100); camera.position.z = 16;
    const world = new T.Group(); scene.add(world);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const textures: T.Texture[] = []; const materials: T.Material[] = []; const geometries: T.BufferGeometry[] = [];
    const text = (key: string, fallback: string) => typeof draft.values[key] === "string" && draft.values[key] ? String(draft.values[key]) : fallback;
    const phrases = [text("recipient", "Người thương") + "  ♡", text("ribbon", "Một chút yêu thương"), "Có em là có hạnh phúc", "Em là cả thế giới của anh", "Mãi bên nhau nhé ♡", "Yêu em thật nhiều", "Cảm ơn vì đã đến bên nhau", ...text("message", "Mãi yêu em").split(/[.!?\n]+/).filter(Boolean)].map(s => s.trim().slice(0, 65));
    const plane = new T.PlaneGeometry(1, 1); geometries.push(plane);
    const makeTexture = (value: string) => {
      const c = document.createElement("canvas"); c.width = 1024; c.height = 128;
      const ctx = c.getContext("2d")!; ctx.font = '500 64px Arial, sans-serif'; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.shadowColor = "#85dfff"; ctx.shadowBlur = 22; ctx.fillStyle = "#ffffff";
      ctx.fillText(value, 512, 64, 940); ctx.fillText(value, 512, 64, 940);
      const texture = new T.CanvasTexture(c); texture.colorSpace = T.SRGBColorSpace; textures.push(texture); return texture;
    };
    const labels = phrases.map(s => { const m = new T.MeshBasicMaterial({ map: makeTexture(s), transparent: true, depthWrite: false, side: T.DoubleSide, blending: T.AdditiveBlending }); materials.push(m); return m; });
    const falling: { object: T.Object3D; speed: number }[] = [];
    for (let i = 0; i < 145; i++) {
      const mesh = new T.Mesh(plane, labels[i % labels.length]);
      mesh.scale.set(14, 1.75, 1); mesh.position.set((Math.random() - .5) * 40, (Math.random() - .5) * 42, 8 - Math.random() * 48);
      world.add(mesh); falling.push({ object: mesh, speed: .65 + Math.random() * .85 });
    }
    const shape = new T.Shape(); shape.moveTo(0, .3); shape.bezierCurveTo(-1, 1.4, -1.7, -.2, 0, -1.2); shape.bezierCurveTo(1.7, -.2, 1, 1.4, 0, .3);
    const heartGeometry = new T.ExtrudeGeometry(shape, { depth: .18, bevelEnabled: true, bevelSize: .08, bevelThickness: .08, bevelSegments: 2, steps: 1 }); geometries.push(heartGeometry);
    const heartMaterial = new T.MeshBasicMaterial({ color: 0xff381e }); materials.push(heartMaterial);
    for (let i = 0; i < 65; i++) { const heart = new T.Mesh(heartGeometry, heartMaterial); heart.scale.setScalar(.18 + Math.random() * .36); heart.position.set((Math.random() - .5) * 42, (Math.random() - .5) * 40, -Math.random() * 42); heart.rotation.z = (Math.random() - .5) * .7; world.add(heart); falling.push({ object: heart, speed: 1 + Math.random() }); }
    const stars = new T.BufferGeometry(); geometries.push(stars); const positions = new Float32Array(1800);
    for (let i = 0; i < positions.length; i++) positions[i] = (Math.random() - .5) * 85;
    stars.setAttribute("position", new T.BufferAttribute(positions, 3)); const starMaterial = new T.PointsMaterial({ color: 0xcbd7e3, size: .045, transparent: true, opacity: .7 }); materials.push(starMaterial); world.add(new T.Points(stars, starMaterial));
    const roses = buildCardModel(template, draft); scene.add(roses.root); roses.root.scale.setScalar(.7);
    scene.add(new T.HemisphereLight(0xffdce9, 0x342032, 3)); const light = new T.DirectionalLight(0xffffff, 4); light.position.set(3, 5, 8); scene.add(light);
    let drag = false, px = 0, py = 0, targetX = -.08, targetY = -.2;
    const down = (e: PointerEvent) => { drag = true; px = e.clientX; py = e.clientY; element.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => { if (!drag) return; targetY += (e.clientX - px) * .004; targetX = T.MathUtils.clamp(targetX + (e.clientY - py) * .003, -.7, .7); px = e.clientX; py = e.clientY; };
    const up = () => { drag = false; };
    const key = (e: KeyboardEvent) => { if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) { e.preventDefault(); targetY += e.key === "ArrowLeft" ? -.12 : e.key === "ArrowRight" ? .12 : 0; targetX = T.MathUtils.clamp(targetX + (e.key === "ArrowUp" ? -.1 : e.key === "ArrowDown" ? .1 : 0), -.7, .7); } };
    element.addEventListener("pointerdown", down); element.addEventListener("pointermove", move); element.addEventListener("pointerup", up); element.addEventListener("pointercancel", up); element.addEventListener("keydown", key);
    const resize = () => { renderer.setSize(element.clientWidth, element.clientHeight); camera.aspect = element.clientWidth / element.clientHeight; camera.updateProjectionMatrix(); };
    const observer = new ResizeObserver(resize); observer.observe(element); resize();
    let time = 0, previous = performance.now(), frame = 0;
    const render = (now: number) => {
      const dt = Math.min((now - previous) / 1000, .05); previous = now;
      if (!pause.current && !document.hidden) {
        if (!reduced) { time += dt; falling.forEach(({ object, speed }) => { object.position.y -= dt * speed; if (object.position.y < -22) object.position.y = 22; }); }
        world.rotation.x += (targetX - world.rotation.x) * .045; world.rotation.y += (targetY + (reduced ? 0 : Math.sin(time * .1) * .16) - world.rotation.y) * .045;
        labels.forEach(m => m.color.setHSL(.53 + (reduced ? 0 : (Math.sin(time * .18) + 1) * .15), .55, .8));
        roses.root.visible = reduced || (time > 7 && time < 14);
        roses.root.position.set(0, reduced ? -2 : 7 - (time - 7) * 1.5, 3); roses.root.rotation.y = time * .3; roses.update(1, time);
      }
      renderer.render(scene, camera); frame = requestAnimationFrame(render);
    }; frame = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); element.removeEventListener("pointerdown", down); element.removeEventListener("pointermove", move); element.removeEventListener("pointerup", up); element.removeEventListener("pointercancel", up); element.removeEventListener("keydown", key); roses.dispose(); geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose()); renderer.dispose(); renderer.domElement.remove(); };
  }, [draft, template]);
  return <div ref={host} className="rose-rain-canvas" tabIndex={0} role="region" aria-label="Không gian yêu thương 3D. Kéo hoặc dùng phím mũi tên để xoay.">{failed && <p className="rose-rain-fallback">♥<br />Yêu thương luôn ở đây. Bạn vẫn có thể mở thư bên dưới.</p>}</div>;
}
