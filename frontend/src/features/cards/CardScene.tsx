"use client";

import { useEffect, useRef, useState } from "react";
import * as T from "three";
import { buildCardModel } from "./models";
import type { CardDraft, CardTemplate } from "./catalog";

interface Props { template: CardTemplate; draft: CardDraft; progress: number; envelope: boolean; opening: boolean; reduced: boolean; onInteract: () => void; }

export default function CardScene({ template, draft, progress, envelope, opening, reduced, onInteract }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const current = useRef({ progress, envelope, opening, reduced, onInteract });
  useEffect(() => { current.current = { progress, envelope, opening, reduced, onInteract }; }, [progress, envelope, opening, reduced, onInteract]);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let renderer: T.WebGLRenderer;
    try { renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" }); }
    catch { setFailed(true); return; }
    setFailed(false);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.outputColorSpace = T.SRGBColorSpace;
    element.appendChild(renderer.domElement);
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(40, 1, .1, 50); camera.position.set(0, .25, 8);
    const model = buildCardModel(template, draft); model.root.scale.setScalar(.85); model.root.position.y = .2; scene.add(model.root);
    scene.add(new T.HemisphereLight(0xfff1df, 0x526388, 2.3));
    const light = new T.DirectionalLight(0xfff4e6, 3); light.position.set(3, 4, 5); scene.add(light);
    const rim = new T.DirectionalLight(0xc0ceff, 1.8); rim.position.set(-3, 1, -2); scene.add(rim);
    const mail = new T.Group(); scene.add(mail);
    const paperMaterial = new T.MeshStandardMaterial({ color: String(draft.values.envelopeColor || "#f9e8d4"), side: T.DoubleSide });
    const back = new T.Mesh(new T.BoxGeometry(2.3, 1.5, .12), paperMaterial); mail.add(back);
    const creaseMaterial = new T.MeshStandardMaterial({ color: "#d4b9a4", side: T.DoubleSide });
    const triangle = new T.Shape(); triangle.moveTo(-1.15, 0); triangle.lineTo(1.15, 0); triangle.lineTo(0, -.85); triangle.closePath();
    const flap = new T.Group(); flap.position.set(0, .75, .1); mail.add(flap);
    flap.add(new T.Mesh(new T.ShapeGeometry(triangle), creaseMaterial));
    const sheet = new T.Mesh(new T.BoxGeometry(1.95, 1.3, .015), new T.MeshStandardMaterial({ color: "#fffaf0" })); sheet.position.z = -.075; mail.add(sheet);
    const sealShape = new T.Shape();
    if (draft.values.seal === "Trái tim") {
      sealShape.moveTo(0, -.16); sealShape.bezierCurveTo(-.3, .02, -.14, .24, 0, .09); sealShape.bezierCurveTo(.14, .24, .3, .02, 0, -.16);
    } else {
      const points = draft.values.seal === "Ngôi sao" ? 10 : 20;
      for (let i = 0; i < points; i++) { const angle = i / points * Math.PI * 2 + Math.PI / 2, r = i % 2 ? .09 : .18; if (!i) sealShape.moveTo(Math.cos(angle) * r, Math.sin(angle) * r); else sealShape.lineTo(Math.cos(angle) * r, Math.sin(angle) * r); }
      sealShape.closePath();
    }
    const sealGeometry = new T.ExtrudeGeometry(sealShape, { depth: .035, bevelEnabled: false });
    const seal = new T.Mesh(sealGeometry, new T.MeshStandardMaterial({ color: String(draft.values.accent || template.color), metalness: .25 })); seal.position.set(0, -.07, .18); mail.add(seal);
    const starGeometry = new T.BufferGeometry();
    const positions = new Float32Array(150 * 3);
    for (let i = 0; i < positions.length; i++) positions[i] = (Math.sin(i * 127.1 + 17) * 43758.5453 % 1) * 7;
    starGeometry.setAttribute("position", new T.BufferAttribute(positions, 3));
    const starMaterial = new T.PointsMaterial({ color: template.color, size: .026, transparent: true, opacity: .65 });
    const stars = new T.Points(starGeometry, starMaterial); stars.position.z = -3; scene.add(stars);
    const resize = () => { const w = element.clientWidth, h = element.clientHeight; renderer.setSize(w, h); camera.aspect = w / Math.max(h, 1); camera.position.z = camera.aspect < 1 ? 6.1 / camera.aspect : 7.5; camera.updateProjectionMatrix(); };
    const observer = new ResizeObserver(resize); observer.observe(element); resize();
    let frame = 0, last = performance.now(), elapsed = 0, shownProgress = 0, flapProgress = 0, rotation = 0;
    let pointer: { x: number; y: number; startX: number; startY: number } | null = null;
    const down = (event: PointerEvent) => { pointer = { x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY }; element.setPointerCapture(event.pointerId); };
    const move = (event: PointerEvent) => { if (pointer) { rotation += (event.clientX - pointer.x) * .006; pointer.x = event.clientX; pointer.y = event.clientY; } };
    const up = (event: PointerEvent) => { if (pointer && Math.hypot(event.clientX - pointer.startX, event.clientY - pointer.startY) < 8) current.current.onInteract(); pointer = null; };
    const cancel = () => { pointer = null; };
    const lost = (event: Event) => { event.preventDefault(); setFailed(true); };
    renderer.domElement.addEventListener("webglcontextlost", lost);
    element.addEventListener("pointerdown", down); element.addEventListener("pointermove", move); element.addEventListener("pointerup", up); element.addEventListener("pointercancel", cancel);
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop); const dt = Math.min((now - last) / 1000, .05); last = now; if (document.hidden) return;
      const state = current.current; if (!state.reduced) elapsed += dt;
      shownProgress = state.reduced ? state.progress : T.MathUtils.damp(shownProgress, state.progress, 5, dt);
      model.root.visible = !state.envelope; mail.visible = state.envelope;
      model.root.rotation.y = rotation + (state.reduced ? 0 : Math.sin(elapsed * .4) * .12);
      model.update(shownProgress, elapsed);
      if (!state.reduced) stars.rotation.y = elapsed * .015;
      flapProgress = state.reduced ? Number(state.opening) : T.MathUtils.damp(flapProgress, Number(state.opening), 6, dt);
      flap.rotation.x = -flapProgress * Math.PI; seal.visible = !state.opening;
      sheet.position.y = flapProgress * .65;
      mail.rotation.y = state.reduced ? 0 : Math.sin(elapsed) * .1;
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      element.removeEventListener("pointerdown", down); element.removeEventListener("pointermove", move); element.removeEventListener("pointerup", up); element.removeEventListener("pointercancel", cancel);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      model.dispose(); back.geometry.dispose(); paperMaterial.dispose(); creaseMaterial.dispose();
      flap.traverse(object => { if (object instanceof T.Mesh) object.geometry.dispose(); }); sheet.geometry.dispose(); sheet.material.dispose(); seal.geometry.dispose(); seal.material.dispose(); starGeometry.dispose(); starMaterial.dispose(); renderer.dispose(); renderer.domElement.remove();
    };
  }, [template, draft]);
  return <div ref={host} className="card-scene" aria-label={`Mô hình 3D: ${template.title}`}>
    {failed && <div className="scene-fallback"><span aria-hidden="true">{envelope ? "💌" : "🎁"}</span><p>Thiết bị không hỗ trợ hiển thị 3D. Bạn vẫn có thể dùng các nút bên dưới để trải nghiệm và đọc thư.</p></div>}
  </div>;
}
