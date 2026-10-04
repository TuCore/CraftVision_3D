import * as THREE from "three";
import { createRoseBouquet } from "./rose-bouquet";

export interface GiftScene {
  ready: Promise<void>;
  setPhase: (phase: string) => void;
  greet: (text: string) => void;
  dispose: () => void;
}

/** Owns animation and GPU resources independently of the gift's accessible UI. */
export function createGiftScene(host: HTMLDivElement, sources: string[], reduced: boolean, progress: (value: number) => void, fallback: () => void): GiftScene {
  let disposed = false;
  let phase = "loading";
  let phaseTime = performance.now();
  let greetingTime = 0;
  let greetingText = "";
  let width = host.clientWidth;
  let height = host.clientHeight;
  let frame = 0;
  let previous = performance.now();
  let lastBurst = 0;
  let rotation = 0;
  let tilt = .12;
  let dragging = false;
  let pointerX = 0;
  let pointerY = 0;
  const random = (min: number, max: number) => min + Math.random() * (max - min);
  const canvas = document.createElement("canvas");
  host.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;
  const background = document.createElement("canvas");
  const bg = background.getContext("2d")!;
  const stars = Array.from({ length: 220 }, () => ({ x: Math.random(), y: Math.random(), radius: random(.3, 1.4), seed: random(0, 6) }));
  let particles: { x: number; y: number; tx: number; ty: number; seed: number }[] = [];
  let sparks: { x: number; y: number; vx: number; vy: number; life: number; color: string }[] = [];
  const world = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(43, width / height, .1, 100);
  const group = new THREE.Group();
  world.add(group);
  const rose = createRoseBouquet();
  const roseGroup = new THREE.Group();
  roseGroup.add(rose.object);
  roseGroup.visible = false;
  world.add(roseGroup);
  world.add(new THREE.HemisphereLight(0xffe7ef, 0x35445e, 2.3));
  const keyLight = new THREE.DirectionalLight(0xffe1d1, 3.4);
  keyLight.position.set(3, 5, 6); world.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0xff84bc, 2);
  rimLight.position.set(-4, 2, -2); world.add(rimLight);
  let roseLanded = false;
  let renderer: THREE.WebGLRenderer | undefined;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);
  } catch { fallback(); }
  const textures: THREE.CanvasTexture[] = [];
  const tiles: { mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>; home: THREE.Vector3; orientation: THREE.Quaternion; index: number }[] = [];
  const images: HTMLImageElement[] = [];
  const pending = new Set<() => void>();

  const ready = Promise.all(sources.map(src => new Promise<THREE.CanvasTexture>(resolve => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    images.push(image);
    let settled = false;
    const finish = (loaded: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      pending.delete(cancel);
      image.onload = image.onerror = null;
      const tile = document.createElement("canvas");
      tile.width = 192; tile.height = 224;
      const c = tile.getContext("2d")!;
      c.fillStyle = "#c7a78c"; c.fillRect(0, 0, 192, 224);
      if (loaded) {
        const ratio = Math.max(184 / image.naturalWidth, 216 / image.naturalHeight);
        const sw = 184 / ratio, sh = 216 / ratio;
        c.drawImage(image, (image.naturalWidth - sw) / 2, (image.naturalHeight - sh) / 2, sw, sh, 4, 4, 184, 216);
      } else {
        const gradient = c.createLinearGradient(0, 0, 192, 224);
        gradient.addColorStop(0, "#361530"); gradient.addColorStop(1, "#bd6b87");
        c.fillStyle = gradient; c.fillRect(4, 4, 184, 216);
        c.fillStyle = "#ffd8df"; c.textAlign = "center"; c.font = "54px Georgia"; c.fillText("♥", 96, 124);
        c.font = "italic 15px Georgia"; c.fillText("Mãi bên em", 96, 162);
      }
      const texture = new THREE.CanvasTexture(tile);
      texture.colorSpace = THREE.SRGBColorSpace;
      if (disposed) texture.dispose();
      else { textures.push(texture); progress(Math.round(textures.length / sources.length * 100)); }
      resolve(texture);
    };
    const cancel = () => finish(false);
    const timeout = window.setTimeout(cancel, 7000);
    pending.add(cancel);
    image.onload = () => finish(true);
    image.onerror = cancel;
    image.src = src;
  }))).then(loaded => {
    if (disposed) return;
    const rows = 13;
    for (let row = 0; row < rows; row++) {
      const latitude = (row + .5) / rows * Math.PI;
      const count = Math.max(5, Math.round(29 * Math.sin(latitude)));
      for (let column = 0; column < count; column++) {
        const longitude = column / count * Math.PI * 2 + (row % 2) * .08;
        const home = new THREE.Vector3(2.25 * Math.sin(latitude) * Math.cos(longitude), 2.25 * Math.cos(latitude), 2.25 * Math.sin(latitude) * Math.sin(longitude));
        const geometry = new THREE.PlaneGeometry(.46, .50);
        const material = new THREE.MeshBasicMaterial({ map: loaded[tiles.length % loaded.length], side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(home); mesh.lookAt(home.clone().multiplyScalar(2));
        tiles.push({ mesh, home, orientation: mesh.quaternion.clone(), index: tiles.length });
        group.add(mesh);
      }
    }
  });

  function buildGreeting(text: string) {
    greetingText = text;
    const mask = document.createElement("canvas"); mask.width = width; mask.height = height;
    const context = mask.getContext("2d")!;
    const lines = text.split("\n");
    const size = Math.min(width / (width < 600 ? 9 : 13), 96);
    context.font = `bold ${size}px Arial, sans-serif`; context.fillStyle = "white"; context.textAlign = "center"; context.textBaseline = "middle";
    lines.forEach((line, i) => context.fillText(line, width / 2, height * .42 + (i - (lines.length - 1) / 2) * size * 1.25));
    const data = context.getImageData(0, 0, width, height).data;
    particles = [];
    for (let y = 0; y < height; y += 3) for (let x = 0; x < width; x += 3) {
      if (data[(y * width + x) * 4 + 3] > 128) particles.push({ tx: x, ty: y, x: random(0, width), y: random(0, height), seed: Math.random() });
    }
  }

  function resize() {
    width = host.clientWidth; height = host.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    background.width = width; background.height = height;
    bg.fillStyle = "#08020f"; bg.fillRect(0, 0, width, height);
    const haze = bg.createRadialGradient(width * .48, height * .47, 0, width * .5, height * .5, Math.max(width, height) * .7);
    haze.addColorStop(0, "#35103b55"); haze.addColorStop(.5, "#16092477"); haze.addColorStop(1, "#00000000"); bg.fillStyle = haze; bg.fillRect(0, 0, width, height);
    for (let i = 0; i < Math.min(16000, width * height / 65); i++) {
      const angle = random(0, Math.PI * 2), radius = Math.pow(Math.random(), .65);
      const x = width / 2 + Math.cos(angle) * radius * width * .7;
      const y = height * .62 + Math.sin(angle) * radius * height * .65;
      bg.fillStyle = `rgba(${i % 3 ? "200,153,217" : "255,209,228"},${random(.06, .38)})`;
      bg.fillRect(x, y, random(.3, 1.2), random(.3, 1.2));
    }
    const glow = bg.createRadialGradient(width / 2, height * .66, 0, width / 2, height * .66, 70);
    glow.addColorStop(0, "#fff6ed"); glow.addColorStop(.025, "#ffd2e8"); glow.addColorStop(.09, "#f08ebe88"); glow.addColorStop(.35, "#a9557820"); glow.addColorStop(1, "#a9557800");
    bg.fillStyle = glow; bg.fillRect(0, 0, width, height);
    renderer?.setSize(width, height);
    camera.aspect = width / height;
    camera.position.z = camera.aspect < 1 ? 7.8 / camera.aspect : 8.8;
    camera.updateProjectionMatrix();
    if (greetingText) buildGreeting(greetingText);
  }

  function draw(now: number) {
    if (disposed) return;
    frame = requestAnimationFrame(draw);
    const dt = Math.min((now - previous) / 1000, .05); previous = now;
    if (document.hidden) return;
    const age = (now - phaseTime) / 1000;
    ctx.clearRect(0, 0, width, height); ctx.drawImage(background, 0, 0, width, height);
    for (const star of stars) {
      ctx.fillStyle = `rgba(255,230,251,${reduced ? .6 : .35 + .3 * Math.sin(now * .001 + star.seed)})`;
      ctx.beginPath(); ctx.arc(star.x * width, star.y * height, star.radius, 0, Math.PI * 2); ctx.fill();
    }
    if (!reduced && phase !== "loading" && phase !== "intro") {
      if (now - lastBurst > 1000) {
        lastBurst = now;
        const x = random(width * .15, width * .85), y = random(height * .08, height * .35);
        const color = ["239,109,162", "160,201,160", "221,189,122"][Math.floor(Math.random() * 3)];
        for (let i = 0; i < 36; i++) { const angle = i / 36 * Math.PI * 2; const speed = random(15, 55); sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, color }); }
      }
      sparks = sparks.filter(s => s.life > 0);
      for (const s of sparks) { s.life -= dt * .6; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += dt * 16; ctx.strokeStyle = `rgba(${s.color},${Math.max(0, s.life) * .7})`; ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * .055, s.y - s.vy * .055); ctx.stroke(); }
      const streak = (now % 4800) / 1500;
      if (streak < 1) { const x = width * (.8 - streak * .35), y = height * (.12 + streak * .35); ctx.strokeStyle = `rgba(236,206,255,${Math.sin(streak * Math.PI) * .45})`; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 45, y - 35); ctx.stroke(); }
    }
    if (phase === "greetings") {
      const elapsed = (now - greetingTime) / 1000;
      const alpha = Math.min(1, elapsed * 2, Math.max(0, (3.4 - elapsed) * 2));
      ctx.globalCompositeOperation = "lighter";
      for (const p of particles) {
        const attraction = 1 - Math.exp(-dt * 6);
        p.x += (p.tx - p.x) * attraction; p.y += (p.ty - p.y) * attraction;
        const scatter = Math.max(0, elapsed - 2.6) * 55;
        const x = p.x + Math.sin(p.seed * 70) * scatter, y = p.y + Math.cos(p.seed * 70) * scatter;
        ctx.fillStyle = `rgba(255,10,156,${alpha * .14})`; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(255,38,177,${alpha * (.5 + p.seed * .5)})`; ctx.fillRect(x, y, 1.5, 1.5);
      }
      ctx.globalCompositeOperation = "source-over";
    }
    group.visible = phase === "sphere" || phase === "scatter";
    roseGroup.visible = phase === "rose";
    if (roseGroup.visible) {
      const fall = Math.min(age / 1.65, 1);
      const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      const bounceAge = Math.max(0, age - 1.65);
      const bounce = Math.abs(Math.sin(bounceAge * 6)) * Math.exp(-bounceAge * 2.8) * .5;
      roseGroup.position.y = reduced ? 0 : (halfHeight + 2) * (1 - fall * fall) + bounce;
      roseGroup.rotation.set(.12, reduced ? .2 : -.45 + Math.min(age, 3.5) * .3, reduced ? -.1 : Math.cos(fall * Math.PI / 2) * .45 - .08);
      const exit = reduced ? 0 : Math.max(0, Math.min(1, (age - 3.9) / .9));
      roseGroup.scale.setScalar(1.45 * (1 - exit * exit));
      if (!reduced && fall === 1 && !roseLanded) {
        roseLanded = true;
        for (let i = 0; i < 60; i++) {
          const angle = i / 60 * Math.PI * 2;
          sparks.push({ x: width / 2, y: height * .6, vx: Math.cos(angle) * random(35, 140), vy: Math.sin(angle) * random(25, 90) - 35, life: 1.4, color: "255,151,190" });
        }
      }
      if (!renderer) {
        ctx.font = `${Math.min(width, height) * .24}px serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("🌹", width / 2, height / 2);
      }
    }
    if (group.visible) {
      if (!reduced && !dragging) rotation += dt * .18;
      group.rotation.set(tilt, rotation, -.07);
      const entrance = reduced ? 1 : Math.min(1, age / 1.6);
      group.scale.setScalar(phase === "sphere" ? .65 + .35 * (1 - Math.pow(1 - entrance, 3)) : 1);
      for (const tile of tiles) {
        tile.mesh.position.copy(tile.home); tile.mesh.quaternion.copy(tile.orientation);
        if (phase === "scatter" && !reduced) {
          const amount = Math.pow(Math.min(age / 2.8, 1), 1.8);
          tile.mesh.position.multiplyScalar(1 + amount * 6);
          tile.mesh.rotateZ(amount * Math.sin(tile.index) * 2);
        }
      }
      if (!renderer && textures.length) {
        const size = Math.min(width, height) * .22;
        textures.forEach((texture, index) => { const angle = index / textures.length * Math.PI * 2 + rotation; ctx.drawImage(texture.image as HTMLCanvasElement, width / 2 + Math.cos(angle) * size - size / 2, height / 2 + Math.sin(angle) * size - size / 2, size, size * 1.16); });
      }
    }
    renderer?.render(world, camera);
  }

  const down = (event: PointerEvent) => { if (phase !== "sphere") return; dragging = true; pointerX = event.clientX; pointerY = event.clientY; host.setPointerCapture(event.pointerId); };
  const move = (event: PointerEvent) => { if (!dragging) return; rotation += (event.clientX - pointerX) * .006; tilt = Math.max(-.7, Math.min(.7, tilt + (event.clientY - pointerY) * .004)); pointerX = event.clientX; pointerY = event.clientY; };
  const up = () => { dragging = false; };
  host.addEventListener("pointerdown", down); host.addEventListener("pointermove", move); host.addEventListener("pointerup", up); host.addEventListener("pointercancel", up);
  const observer = new ResizeObserver(resize); observer.observe(host); resize();
  frame = requestAnimationFrame(draw);
  return {
    ready,
    setPhase(next) { phase = next; phaseTime = performance.now(); roseLanded = false; if (next === "intro") { sparks = []; particles = []; rotation = 0; tilt = .12; } },
    greet(text) { greetingTime = performance.now(); buildGreeting(text); },
    dispose() {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect();
      pending.forEach(cancel => cancel()); images.forEach(image => { image.onload = image.onerror = null; });
      host.removeEventListener("pointerdown", down); host.removeEventListener("pointermove", move); host.removeEventListener("pointerup", up); host.removeEventListener("pointercancel", up);
      tiles.forEach(({ mesh }) => { mesh.geometry.dispose(); mesh.material.dispose(); }); textures.forEach(texture => texture.dispose());
      rose.dispose();
      renderer?.dispose(); renderer?.domElement.remove(); canvas.remove();
    },
  };
}
