"use client";

import { useEffect, useRef, useState } from "react";
import * as T from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

type Particle = { object: T.Object3D; speed: number; spin: number };

export default function BirthdayInteractiveScene({ screen, candleProgress, paused }: { screen: number; candleProgress: number; paused: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const state = useRef({ screen, candleProgress, paused });
  const [decorFailed, setDecorFailed] = useState(false);
  useEffect(() => { state.current = { screen, candleProgress, paused }; }, [screen, candleProgress, paused]);

  useEffect(() => {
    const element = host.current!;
    let renderer: T.WebGLRenderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true }); } catch { setDecorFailed(true); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.outputColorSpace = T.SRGBColorSpace;
    element.appendChild(renderer.domElement);

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(55, 1, .1, 100);
    camera.position.z = 8;
    const world = new T.Group(), cake = new T.Group(), wish = new T.Group(), decor = new T.Group();
    scene.add(world); world.add(cake, wish, decor);
    scene.add(new T.HemisphereLight(0xffe7dc, 0x27122f, 2.8));
    const light = new T.DirectionalLight(0xffffff, 4);
    light.position.set(4, 6, 8); scene.add(light);

    const geometries = new Set<T.BufferGeometry>(), materials = new Set<T.Material>(), textures = new Set<T.Texture>();
    const material = (color: T.ColorRepresentation, options: T.MeshStandardMaterialParameters = {}) => { const value = new T.MeshStandardMaterial({ color, roughness: .45, metalness: .05, ...options }); materials.add(value); return value; };
    const mesh = (geometry: T.BufferGeometry, value: T.Material, parent: T.Object3D, x = 0, y = 0, z = 0) => { geometries.add(geometry); const object = new T.Mesh(geometry, value); object.position.set(x, y, z); parent.add(object); return object; };
    const cream = material(0xffe1c7), pink = material(0xff789d), red = material(0xe84f6f), gold = material(0xffc75d, { metalness: .55, roughness: .25 });
    mesh(new T.CylinderGeometry(2, 2, .35, 48), cream, cake, 0, -1.4);
    mesh(new T.CylinderGeometry(1.6, 1.75, 1.2, 48), pink, cake, 0, -.65);
    mesh(new T.CylinderGeometry(1.2, 1.35, .9, 48), cream, cake, 0, .4);
    const flames: T.Mesh[] = [];
    for (const x of [-.42, .42]) {
      mesh(new T.CylinderGeometry(.07, .07, .72, 18), red, cake, x, 1.27);
      const flame = mesh(new T.SphereGeometry(.13, 18, 18), gold, cake, x, 1.72);
      flame.scale.set(.75, 1.45, .75); flames.push(flame);
    }
    cake.rotation.x = -.08;

    const starGeometry = new T.BufferGeometry(); geometries.add(starGeometry);
    const starPositions = new Float32Array(1200);
    for (let index = 0; index < starPositions.length; index++) starPositions[index] = (Math.random() - .5) * 32;
    starGeometry.setAttribute("position", new T.BufferAttribute(starPositions, 3));
    const starMaterial = new T.PointsMaterial({ color: 0xfff2cf, size: .055, transparent: true, opacity: .8 }); materials.add(starMaterial);
    world.add(new T.Points(starGeometry, starMaterial));
    const starShape = new T.Shape();
    for (let index = 0; index < 10; index++) { const radius = index % 2 ? .48 : 1; const angle = Math.PI / 2 + index * Math.PI / 5; const x = Math.cos(angle) * radius, y = Math.sin(angle) * radius; if (index) starShape.lineTo(x, y); else starShape.moveTo(x, y); }
    starShape.closePath();
    mesh(new T.ExtrudeGeometry(starShape, { depth: .22, bevelEnabled: true, bevelSize: .06, bevelThickness: .06, bevelSegments: 2 }), gold, wish);

    const particles: Particle[] = [];
    const gltfResources = new Set<T.BufferGeometry | T.Material | T.Texture>();
    let disposed = false;
    new GLTFLoader().load("/models/love-gift-decor.glb", gltf => {
      if (disposed) return;
      const sources: T.Mesh[] = [];
      gltf.scene.traverse(object => {
        if (!(object instanceof T.Mesh)) return;
        sources.push(object); gltfResources.add(object.geometry);
        const sourceMaterials = Array.isArray(object.material) ? object.material : [object.material];
        sourceMaterials.forEach(sourceMaterial => { gltfResources.add(sourceMaterial); Object.values(sourceMaterial).forEach(value => { if (value instanceof T.Texture) gltfResources.add(value); }); });
      });
      for (let index = 0; index < 68 && sources.length; index++) {
        const source = sources[index % sources.length], object = source.clone();
        object.scale.copy(source.scale).multiplyScalar(.12 + Math.random() * .28);
        object.position.set((Math.random() - .5) * 18, -10 + Math.random() * 20, -3 - Math.random() * 12);
        decor.add(object); particles.push({ object, speed: .7 + Math.random() * 1.3, spin: (Math.random() - .5) * .8 });
      }
    }, undefined, () => { if (!disposed) setDecorFailed(true); });

    const resize = () => { renderer.setSize(element.clientWidth, element.clientHeight); camera.aspect = element.clientWidth / element.clientHeight; camera.updateProjectionMatrix(); };
    const observer = new ResizeObserver(resize); observer.observe(element); resize();

    let frame = 0, previous = performance.now(), time = 0;
    const render = (now: number) => {
      const dt = Math.min((now - previous) / 1000, .05); previous = now;
      const current = state.current;
      cake.visible = current.screen === 2; wish.visible = current.screen === 9; decor.visible = current.screen === 9;
      flames.forEach((flame) => { flame.visible = current.candleProgress < 1; flame.scale.y = Math.max(.08, 1.45 * (1 - current.candleProgress)); });
      if (!current.paused && !document.hidden) {
        time += dt;
        flames.forEach((flame, index) => { flame.scale.x = .65 + Math.sin(time * 9 + index) * .12; flame.rotation.z = Math.sin(time * 7 + index) * .12; });
        wish.rotation.y = time * .55; wish.position.y = Math.sin(time * 1.8) * .12;
        particles.forEach(particle => { particle.object.position.y -= particle.speed * dt; if (particle.object.position.y < -10) particle.object.position.y = 10; particle.object.rotation.y += particle.spin * dt; particle.object.rotation.z += particle.spin * .6 * dt; });
        world.rotation.y = Math.sin(time * .18) * .08;
      }
      renderer.render(scene, camera); frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    return () => {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect();
      geometries.forEach(geometry => geometry.dispose()); materials.forEach(value => value.dispose()); textures.forEach(texture => texture.dispose()); gltfResources.forEach(resource => resource.dispose());
      renderer.dispose(); renderer.domElement.remove();
    };
  }, []);

  return <div ref={host} className="pointer-events-none absolute inset-0" role="application" aria-label={screen === 2 ? "Bánh sinh nhật 3D." : "Bầu trời điều ước 3D."}>{decorFailed && screen === 9 && <p className="absolute bottom-24 left-1/2 z-10 -translate-x-1/2 text-center text-xs text-amber-100">Bầu trời sao vẫn hoạt động khi thiếu vật thể trang trí.</p>}</div>;
}
