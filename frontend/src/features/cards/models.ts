import * as T from "three";
import { createRoseBouquet } from "@/app/love-gift/rose-bouquet";
import type { CardDraft, CardTemplate } from "./catalog";

export interface CardModel { root: T.Group; update: (progress: number, time: number) => void; dispose: () => void; }

/** A scene recipe owns its geometry and its interaction, with shared primitive helpers. */
export function buildCardModel(template: CardTemplate, draft: CardDraft): CardModel {
  const root = new T.Group();
  const ownedMaterials: T.Material[] = [];
  const ownedTextures: T.Texture[] = [];
  const cleanup: (() => void)[] = [];
  const updates: ((p: number, t: number) => void)[] = [];
  const accent = String(draft.values.detailColor || draft.values.accent || template.color);
  const mat = (color: string, extra: T.MeshStandardMaterialParameters = {}) => {
    const material = new T.MeshStandardMaterial({ color, roughness: .55, ...extra }); ownedMaterials.push(material); return material;
  };
  const primary = mat(accent), cream = mat("#fff0d8"), gold = mat("#edba59", { metalness: .55, roughness: .27 }), green = mat("#4d9166"), dark = mat("#34415c"), red = mat("#d63858"), white = mat("#fff8ee");
  const mesh = (geometry: T.BufferGeometry, material: T.Material, x = 0, y = 0, z = 0, parent: T.Object3D = root) => { const object = new T.Mesh(geometry, material); object.position.set(x, y, z); parent.add(object); return object; };
  const box = (w: number, h: number, d: number, m: T.Material, x = 0, y = 0, z = 0, parent: T.Object3D = root) => mesh(new T.BoxGeometry(w, h, d), m, x, y, z, parent);
  const ball = (r: number, m: T.Material, x = 0, y = 0, z = 0, parent: T.Object3D = root) => mesh(new T.SphereGeometry(r, 20, 14), m, x, y, z, parent);
  const cylinder = (r: number, h: number, m: T.Material, x = 0, y = 0, z = 0, parent: T.Object3D = root) => mesh(new T.CylinderGeometry(r, r, h, 24), m, x, y, z, parent);
  const cone = (r: number, h: number, m: T.Material, x = 0, y = 0, z = 0, parent: T.Object3D = root) => mesh(new T.ConeGeometry(r, h, 24), m, x, y, z, parent);
  const ring = (r: number, thickness: number, m: T.Material, x = 0, y = 0, z = 0, parent: T.Object3D = root) => mesh(new T.TorusGeometry(r, thickness, 8, 40), m, x, y, z, parent);
  function text(label: string, x = 0, y = 0, z = 0, scale = 1, parent: T.Object3D = root) {
    const canvas = document.createElement("canvas"); canvas.width = 768; canvas.height = 192;
    const ctx = canvas.getContext("2d")!; ctx.fillStyle = "#fff5e3"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    let size = 56; ctx.font = `600 ${size}px sans-serif`;
    const content = label.slice(0, 70);
    while (ctx.measureText(content).width > 730 && size > 14) { size -= 2; ctx.font = `600 ${size}px sans-serif`; }
    ctx.fillText(content, 384, 96);
    const texture = new T.CanvasTexture(canvas); texture.colorSpace = T.SRGBColorSpace; ownedTextures.push(texture);
    const material = new T.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: T.DoubleSide }); ownedMaterials.push(material);
    return mesh(new T.PlaneGeometry(2.3 * scale, .575 * scale), material, x, y, z, parent);
  }
  const value = (key: string, fallback = "") => typeof draft.values[key] === "string" ? String(draft.values[key] || fallback) : fallback;
  function heart(m: T.Material, x = 0, y = 0, z = 0, scale = 1, parent: T.Object3D = root) {
    const shape = new T.Shape(); shape.moveTo(0, -.6); shape.bezierCurveTo(-1.3, .2, -.7, 1.1, 0, .45); shape.bezierCurveTo(.7, 1.1, 1.3, .2, 0, -.6);
    const object = mesh(new T.ExtrudeGeometry(shape, { depth: .14, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: .04, bevelThickness: .04, curveSegments: 18 }), m, x, y, z, parent); object.scale.setScalar(scale); return object;
  }
  function star(m: T.Material, x = 0, y = 0, z = 0, scale = 1, parent: T.Object3D = root) {
    const shape = new T.Shape(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 + Math.PI / 2, r = i % 2 ? .23 : .52; if (!i) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r); else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r); } shape.closePath();
    const object = mesh(new T.ExtrudeGeometry(shape, { depth: .1, bevelEnabled: false }), m, x, y, z, parent); object.scale.setScalar(scale); return object;
  }
  function flower(x: number, y: number, z: number, m = primary, scale = 1, parent: T.Object3D = root) {
    const group = new T.Group(); group.position.set(x, y, z); group.scale.setScalar(scale); parent.add(group);
    cylinder(.035, .9, green, 0, -.55, 0, group);
    for (let i = 0; i < 7; i++) { const a = i * Math.PI * 2 / 7; const petal = ball(.19, m, Math.cos(a) * .23, Math.sin(a) * .23, 0, group); petal.scale.set(1, 1.2, .35); }
    ball(.12, gold, 0, 0, .09, group); return group;
  }
  function tree(blossom = false, x = 0, parent: T.Object3D = root) {
    const group = new T.Group(); group.position.x = x; parent.add(group);
    cylinder(.13, 1.6, mat("#946142"), 0, -.3, 0, group);
    for (let i = 0; i < 9; i++) { const a = i * 2.4, r = .35 + (i % 3) * .28; const node = blossom ? flower(Math.cos(a) * r, .4 + Math.sin(a) * .48, Math.sin(a) * .25, template.model === "apricot" ? gold : primary, .65, group) : ball(.4, green, Math.cos(a) * r, .5 + Math.sin(a) * .5, Math.sin(a) * .3, group); updates.push(p => node.scale.setScalar((blossom ? .65 : 1) * (.18 + p * .82))); }
    cylinder(.6, .4, primary, 0, -1.2, 0, group); return group;
  }
  function house(x = 0, y = 0, scale = 1, parent: T.Object3D = root) {
    const group = new T.Group(); group.position.set(x, y, 0); group.scale.setScalar(scale); parent.add(group);
    box(1.6, 1.3, 1, cream, 0, -.25, 0, group);
    const roof = cone(1.25, .8, primary, 0, .8, 0, group); roof.rotation.y = Math.PI / 4;
    box(.4, .7, .05, dark, 0, -.5, .53, group);
    for (const side of [-1, 1]) { const windowMaterial = mat("#536583", { emissive: "#efb647", emissiveIntensity: 0 }); box(.32, .35, .06, windowMaterial, side * .5, -.1, .54, group); updates.push(p => { windowMaterial.emissiveIntensity = p * 1.8; }); }
    return { group, roof };
  }
  function animal(kind: "bear" | "rabbit" | "dinosaur" | "reindeer", x = 0, parent: T.Object3D = root) {
    const group = new T.Group(); group.position.x = x; parent.add(group);
    const material = kind === "rabbit" ? white : kind === "dinosaur" ? green : mat(kind === "bear" ? "#b98565" : "#9f6242");
    const body = ball(.48, material, 0, -.25, 0, group); body.scale.y = 1.3;
    ball(.46, material, 0, .5, .08, group); ball(.24, cream, 0, .36, .43, group);
    for (const side of [-1, 1]) {
      ball(.055, dark, side * .17, .57, .48, group);
      const ear = ball(kind === "rabbit" ? .13 : .18, material, side * .3, .9, 0, group); if (kind === "rabbit") { ear.scale.y = 3; ear.rotation.z = -side * .18; }
      ball(.19, material, side * .3, -.9, .12, group);
      const arm = ball(.18, material, side * .48, -.2, .05, group); arm.scale.y = 1.5;
      if (kind === "reindeer") { cylinder(.04, .6, gold, side * .24, 1.25, 0, group); box(.3, .06, .06, gold, side * .3, 1.35, 0, group); }
    }
    if (kind === "dinosaur") { const tail = cone(.23, .9, green, .5, -.45, -.2, group); tail.rotation.z = -1.1; for (let i = 0; i < 4; i++) cone(.1, .18, gold, 0, -.5 + i * .3, -.45, group); }
    return group;
  }
  function boat(parent: T.Object3D = root) {
    const group = new T.Group(); parent.add(group);
    const hull = ball(.8, primary, 0, -.5, 0, group); hull.scale.set(1.6, .45, .6);
    cylinder(.035, 2, gold, 0, .35, 0, group);
    const sail = mesh(new T.PlaneGeometry(.85, 1.25), cream, .45, .6, 0, group);
    sail.material = new T.MeshStandardMaterial({ color: "#fff0d8", side: T.DoubleSide }); ownedMaterials.push(sail.material);
    updates.push(p => { sail.scale.y = .05 + p * .95; }); return group;
  }
  const label = (key: string, fallback: string, parent: T.Object3D = root) => text(value(key, fallback), 0, -1.55, .7, .75, parent);
  const model = template.model;
  switch (model) {
    case "rose": case "gratitude-rose": {
      const rose = createRoseBouquet(); root.add(rose.object); cleanup.push(rose.dispose);
      rose.object.traverse(object => { if (object instanceof T.Mesh && object.material instanceof T.MeshStandardMaterial && object.material.color.r > object.material.color.g * 1.4) object.material.color.set(accent); });
      if (model === "rose") updates.push((p, t) => { rose.object.position.y = (1 - p) * 2.5 + (p === 1 ? Math.sin(t * 1.5) * .05 : 0); rose.object.rotation.y = p * .6; });
      else { box(1.3, 1.6, .12, gold, -.9, .2, -.5); updates.push(p => { rose.object.position.x = 1.4 - p * .6; rose.object.scale.setScalar(.65); }); }
      label(model === "rose" ? "ribbon" : "honoree", "Một chút yêu thương"); break;
    }
    case "lock": case "mended-heart": {
      const left = heart(primary, -.4, 0, 0, .9), right = heart(red, .4, 0, -.15, .9);
      if (model === "lock") { ring(.48, .08, gold, 0, .75); const key = box(.65, .08, .08, gold, 1.25, -.35, .5); ring(.15, .04, gold, 1.65, -.35, .5); updates.push(p => { left.position.x = -.3 - p * .7; right.position.x = .3 + p * .7; key.rotation.z = p * Math.PI; }); }
      else { const seam = box(.035, 1, .04, gold, 0, 0, .3); updates.push(p => { left.position.x = -.8 + p * .55; right.position.x = .8 - p * .55; seam.scale.y = p; }); }
      label("engraving", value("recipient")); break;
    }
    case "train": {
      for (const z of [-.3, .3]) box(4, .045, .04, gold, 0, -1, z);
      for (let i = 0; i < 14; i++) box(.06, .04, .8, dark, -1.9 + i * .3, -1.05, 0);
      const train = new T.Group(); root.add(train);
      for (let i = 0; i < 3; i++) { box(.55, .45, .5, i ? cream : primary, i * .7, -.5, 0, train); for (const x of [-.18, .18]) for (const z of [-.29, .29]) { const wheel = cylinder(.13, .07, dark, i * .7 + x, -.78, z, train); wheel.rotation.x = Math.PI / 2; } }
      cylinder(.1, .4, gold, 0, -.08, 0, train); updates.push(p => { train.position.x = -1.5 + p * 1.7; }); label("trainName", "Chuyến tàu kỷ niệm"); break;
    }
    case "ring": case "music": {
      box(1.6, .65, 1.2, primary, 0, -.6);
      const hinge = new T.Group(); hinge.position.set(0, -.25, -.6); root.add(hinge); box(1.65, .12, 1.25, primary, 0, 0, .6, hinge);
      updates.push(p => { hinge.rotation.x = -p * Math.PI * .58; });
      if (model === "ring") { const jewel = new T.Group(); root.add(jewel); ring(.38, .055, value("metal") === "Bạc" ? white : gold, 0, -.1, .1, jewel); mesh(new T.OctahedronGeometry(.17), mat(value("gem") === "Hồng" ? "#ff95c0" : value("gem") === "Xanh" ? "#88d9ef" : "#e9faff", { metalness: .3, roughness: .1 }), 0, .35, .1, jewel); updates.push(p => { jewel.position.y = p * .45; }); }
      else { const birds = new T.Group(); root.add(birds); for (const x of [-.35, .35]) { const b = ball(.22, cream, x, .1, .1, birds); b.scale.set(1, 1, 1.5); cone(.08, .2, gold, x, .15, .4, birds).rotation.x = Math.PI / 2; } updates.push((p, t) => { birds.rotation.y = p * t; birds.position.y = p * .3; }); }
      label("engraving", value("couple", "Dành riêng cho bạn")); break;
    }
    case "islands": {
      for (const side of [-1, 1]) { cone(.85, .8, dark, side * 1.15, -.8).rotation.z = Math.PI; house(side * 1.15, -.1, .5); }
      const bridge = box(1.3, .06, .28, gold, 0, -.4); updates.push(p => { bridge.scale.x = p; });
      text(value("origin", "Nơi mình"), -1.1, .95, .2, .55); text(value("destination", "Nơi bạn"), 1.1, .95, .2, .55); break;
    }
    case "cake": {
      cylinder(1.25, .12, gold, 0, -.95); cylinder(1, .7, value("flavor") === "Chocolate" ? mat("#714338") : primary, 0, -.55); cylinder(.78, .5, cream, 0, .05);
      for (let i = 0; i < 5; i++) { const x = (i - 2) * .26; cylinder(.035, .42, primary, x, .48); const flame = ball(.075, gold, x, .74); flame.scale.y = 1.6; updates.push((p, t) => { flame.visible = p < (i + 1) / 5; flame.scale.x = .8 + Math.sin(t * 8 + i) * .15; }); }
      text(value("age", "♥"), 0, -.5, 1.02, .65); label("cakeText", "Chúc mừng sinh nhật"); break;
    }
    case "balloon": {
      const balloon = new T.Group(); root.add(balloon); const skin = ball(.85, primary, 0, .7, 0, balloon); skin.scale.y = 1.25;
      for (const x of [-.3, .3]) cylinder(.015, .9, gold, x, -.55, 0, balloon); box(.65, .38, .5, cream, 0, -1, 0, balloon);
      updates.push((p, t) => { balloon.position.y = -.4 + p * .8; balloon.rotation.z = Math.sin(t) * .04; }); label("flight", "Bay tới những ước mơ"); break;
    }
    case "rocket": {
      const rocket = new T.Group(); root.add(rocket); cylinder(.3, 1.4, cream, 0, -.1, 0, rocket); cone(.3, .55, primary, 0, .87, 0, rocket); ball(.16, dark, 0, .25, .29, rocket);
      for (const side of [-1, 1]) cone(.22, .6, primary, side * .3, -.65, 0, rocket);
      const fire = cone(.23, .8, gold, 0, -1.05, 0, rocket); fire.rotation.z = Math.PI;
      updates.push((p, t) => { rocket.position.y = p * 1.3 - .4; fire.scale.y = .2 + p * (.8 + Math.sin(t * 18) * .15); });
      ball(.45, primary, 1.25, 1.15, -.5); label("planet", "Hành tinh tuổi mới"); break;
    }
    case "bear": case "rabbit": case "reindeer": case "dinosaur": {
      const creature = animal(model); const present = box(.7, .65, .65, primary, .85, -.7, .4); box(.12, .69, .68, gold, .85, -.7, .4);
      if (model === "dinosaur") { const egg = ball(.65, cream, 0, -.25, .3); egg.scale.y = 1.3; updates.push(p => { egg.position.x = p * 1.4; egg.rotation.z = p * 1.2; creature.scale.setScalar(.15 + p * .85); }); }
      else updates.push((p, t) => { creature.position.x = -1 + p * .8; creature.rotation.z = Math.sin(t * 2) * .04; present.position.y = -.7 + p * .3; });
      label(model === "bear" ? "bearName" : model === "rabbit" ? "rabbit" : model === "reindeer" ? "reindeer" : "dinosaur", "Món quà nhỏ của bạn"); break;
    }
    case "stage": {
      cylinder(1.4, .2, gold, 0, -.95); box(3, .12, .2, gold, 0, 1.35, -.5);
      for (const side of [-1, 1]) { const curtain = box(1.45, 2.1, .12, primary, side * .74, .25, .3); updates.push(p => { curtain.position.x = side * (.74 + p * 1.1); curtain.scale.x = 1 - p * .65; }); ball(.23, primary, side * .8, .6, -.1); }
      text(value("party", value("recipient")), 0, .3, 0); break;
    }
    case "garden": case "apricot": case "peach": case "family-tree": case "book-tree": {
      if (model === "garden") { cylinder(1, .35, cream, 0, -1.1); for (let i = 0; i < 5; i++) { const bloom = flower((i - 2) * .38, .1 + (i % 2) * .25, (i % 2) * .2); updates.push(p => bloom.scale.setScalar(.12 + p * .88)); } label("gardenName", "Khu vườn của bạn"); }
      else { const plant = tree(model === "apricot" || model === "peach"); if (model === "book-tree") { box(2, .18, 1.25, cream, 0, -1.3); box(.03, .19, 1.3, gold, 0, -1.29); updates.push(p => plant.scale.setScalar(.12 + p * .88)); } label(model === "apricot" ? "potText" : model === "family-tree" ? "honorific" : "family", value("recipient")); }
      break;
    }
    case "table": case "harvest": {
      cylinder(1.35, .18, mat("#9e684b"), 0, -.55); for (const x of [-.8, .8]) for (const z of [-.6, .6]) cylinder(.07, .7, gold, x, -.95, z);
      for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5; const dish = model === "table" ? box(.35, .2, .35, green, Math.cos(a), -.34, Math.sin(a) * .7) : ball(.22, primary, Math.cos(a), -.2, Math.sin(a) * .7); updates.push(p => { dish.position.y = -.25 + Math.max(0, 1 - p * 5 + i) * .35; }); }
      label(model === "table" ? "family" : "gratitude", "Cùng nhau, đủ đầy"); break;
    }
    case "lion": {
      const lion = new T.Group(); root.add(lion); ball(.75, primary, 0, .35, 0, lion); box(1.15, .35, .7, gold, 0, -.25, .35, lion);
      for (const side of [-1, 1]) { ball(.26, white, side * .33, .65, .52, lion); ball(.12, dark, side * .33, .65, .73, lion); cone(.2, .4, gold, side * .5, 1, 0, lion); }
      cylinder(.5, .5, red, 0, -.95, .6); updates.push((p, t) => { lion.position.y = Math.abs(Math.sin(p * Math.PI * 3)) * .45; lion.rotation.z = Math.sin(t * 2) * .04; }); label("scrollText", "Phúc lộc đầy nhà"); break;
    }
    case "clock": {
      cylinder(1, .18, gold).rotation.x = Math.PI / 2; cylinder(.88, .2, dark).rotation.x = Math.PI / 2;
      const hand = new T.Group(); root.add(hand); box(.045, .65, .05, cream, 0, .3, .15, hand); updates.push(p => { hand.rotation.z = (1 - p) * Math.PI * 1.8; });
      text("12", 0, .72, .2, .35); text(value("year"), 0, -1.3, .2); break;
    }
    case "sailboat": { const ship = boat(); updates.push((p, t) => { ship.position.x = -.5 + p; ship.rotation.z = Math.sin(t) * .06; }); label("sailText", value("journey", "Khởi đầu mới")); break; }
    case "tea-flowers": case "teacup": {
      cylinder(.65, .09, cream, 0, -.8); cylinder(.43, .6, primary, 0, -.45); ring(.25, .07, primary, .47, -.4); cylinder(.37, .025, mat("#99633d"), 0, -.13);
      const steam = heart(cream, 0, .65, 0, .5); updates.push((p, t) => { steam.scale.setScalar(p * (.4 + Math.sin(t) * .03)); steam.position.y = .4 + p * .5; });
      if (model === "tea-flowers") for (let i = 0; i < 3; i++) { const bloom = flower(-1 + i * .3, .5, -.3, primary, .6); updates.push(p => { bloom.position.y = .5 + (1 - p) * .8; }); }
      label("cupText", value("shortThanks", "Cảm ơn thật nhiều")); break;
    }
    case "medal": { ring(.9, .06, primary, 0, .6); cylinder(.58, .14, gold, 0, -.35).rotation.x = Math.PI / 2; const s = star(cream, 0, -.35, .1, .65); updates.push(p => { s.rotation.z = (1 - p) * Math.PI; s.position.z = .1 + (1 - p); }); label("award", "Người hùng của con"); break; }
    case "dollhouse": case "house": case "ghost-house": {
      const home = house();
      if (model === "dollhouse") updates.push(p => { home.roof.position.y = .8 + p * .8; });
      else if (model === "ghost-house") { const ghost = ball(.35, white, 0, -.2, .8); for (const x of [-.12, .12]) ball(.04, dark, x, -.15, 1.1); updates.push(p => { ghost.position.y = -.2 + p * 1.1; }); }
      else { const door = box(.4, .7, .08, primary, -.2, -.5, .6); updates.push(p => { door.rotation.y = -p * 1.4; }); }
      label(model === "house" ? "homeName" : model === "ghost-house" ? "boo" : "family", value("recipient")); break;
    }
    case "cradle": {
      box(1.5, .22, .9, cream, 0, -.65); for (const side of [-1, 1]) { box(.1, .9, 1, primary, side * .8, -.35); for (let i = 0; i < 7; i++) box(.05, .55, .05, primary, -.65 + i * .22, -.3, side * .45); }
      cylinder(.025, 2, gold, -.9, .2); const mobile = new T.Group(); mobile.position.y = 1.2; root.add(mobile); ring(.55, .025, gold, 0, 0, 0, mobile).rotation.x = Math.PI / 2;
      for (let i = 0; i < 4; i++) star(gold, Math.cos(i * Math.PI / 2) * .55, -.3, Math.sin(i * Math.PI / 2) * .55, .3, mobile);
      updates.push((p, t) => { mobile.rotation.y = p * t; }); label("baby", "Chào con yêu"); break;
    }
    case "tulip": case "lotus": case "conical-hat": {
      const petals = new T.Group(); root.add(petals);
      for (let i = 0; i < (model === "tulip" ? 6 : 12); i++) { const a = i * Math.PI * 2 / (model === "tulip" ? 6 : 12); const pivot = new T.Group(); pivot.rotation.y = a; petals.add(pivot); const petal = ball(.28, primary, 0, .15, .3, pivot); petal.scale.set(.8, 1.8, .4); updates.push(p => { petal.rotation.x = p * (model === "tulip" ? .6 : 1.1); petal.position.z = .3 + p * .15; }); }
      ball(.15, gold, 0, .25); cylinder(.035, .8, green, 0, -.55);
      if (model === "tulip") { const crystal = mesh(new T.OctahedronGeometry(.3), gold, 1, .3); updates.push(p => { crystal.rotation.y = p * Math.PI * 2; }); }
      if (model === "conical-hat") { const hat = cone(.9, .6, cream, -1, -.45, -.3); updates.push(p => { hat.rotation.y = p * Math.PI * 2; hat.rotation.z = p * -.3; }); }
      label(model === "tulip" ? "quality" : model === "lotus" ? "peace" : "ribbon", "Dành điều đẹp nhất cho bạn"); break;
    }
    case "chalkboard": {
      box(2.8, 1.7, .12, gold); box(2.6, 1.5, .15, mat("#244b40"), 0, 0, .03);
      for (const side of [-1, 1]) box(.08, 1.2, .08, gold, side, -1);
      const writing = text(value("boardText", "Cảm ơn thầy cô"), 0, .15, .15); updates.push(p => { writing.scale.x = Math.max(.01, p); }); label("teacher", value("recipient")); break;
    }
    case "graduation": {
      const cap = new T.Group(); root.add(cap); cylinder(.45, .25, dark, 0, 0, 0, cap); box(1.3, .07, 1.3, dark, 0, .17, 0, cap); cylinder(.025, .55, gold, .5, -.07, .4, cap);
      const diploma = cylinder(.14, 1.2, cream, 0, -.85); diploma.rotation.z = Math.PI / 2; ring(.15, .025, primary, 0, -.85).rotation.y = Math.PI / 2;
      updates.push(p => { cap.position.y = Math.sin(p * Math.PI) * 1.2 + p * .3; cap.rotation.z = p * .3; }); label("school", "Chúc mừng tốt nghiệp"); break;
    }
    case "mountain": { cone(1.3, 2.1, dark, 0, -.2); cone(.4, .65, white, 0, .65); const flag = box(.55, .3, .03, primary, .3, 1.25); cylinder(.025, .85, gold, 0, 1.05); updates.push(p => { flag.scale.x = p; }); label("achievement", "Bạn đã làm được!"); break; }
    case "candy": {
      for (let i = 0; i < 3; i++) { const x = (i - 1) * .8; cylinder(.3, 1.1 + (i === 1 ? .5 : 0), cream, x, -.2); cone(.4, .6, primary, x, .65 + (i === 1 ? .5 : 0)); }
      for (const side of [-1, 1]) { cylinder(.04, .8, gold, side * 1.3, -.65); const sweet = ball(.23, primary, side * 1.3, -.2); updates.push((p, t) => { sweet.rotation.y = t * p; sweet.position.y = -.2 + p * .4; }); } label("castle", "Vương quốc ngọt ngào"); break;
    }
    case "star-lantern": { const s = star(primary, 0, .15, 0, 2); ring(1.15, .025, gold, 0, .2, .1); cylinder(.035, 1.1, gold, 0, -1); updates.push(p => { s.rotation.y = p * .6; primary.emissive.set(accent); primary.emissiveIntensity = p * .65; }); label("handleText", value("recipient")); break; }
    case "lantern-street": {
      box(3.2, .15, 1.4, dark, 0, -1.1);
      for (let i = 0; i < 6; i++) { const x = (i % 3 - 1) * 1.05, z = i < 3 ? -.5 : .5; cylinder(.025, 1.8, gold, x, -.1, z); const material = mat(accent, { emissive: accent, emissiveIntensity: 0 }); const lantern = ball(.22, material, x, .7, z); lantern.scale.y = 1.2; updates.push(p => { material.emissiveIntensity = p >= (i + 1) / 6 ? 1 : 0; }); }
      label("street", "Phố đèn lồng"); break;
    }
    case "schoolbag": { box(1.2, 1.4, .65, primary, 0, -.1); ring(.3, .07, gold, 0, .7); box(.85, .45, .1, cream, 0, -.4, .4); const book = box(.7, .85, .15, cream, .7, 1); const pencil = cylinder(.055, 1, gold, -.7, .9); updates.push(p => { book.position.y = 1 - p * .9; pencil.position.y = .9 - p * .7; }); label("schoolYear", "Một năm học mới"); break; }
    case "christmas-tree": { for (let i = 0; i < 3; i++) cone(1 - i * .23, 1.2, green, 0, -.5 + i * .6); cylinder(.12, .5, gold, 0, -1.15); const s = star(gold, 0, 2, 0, .6); updates.push(p => { s.position.y = 2 - p * .5; }); for (let i = 0; i < 12; i++) { const a = i * 2.4; const ornament = ball(.09, i % 2 ? primary : gold, Math.cos(a) * (.8 - i * .045), -.6 + i * .13, Math.sin(a) * (.8 - i * .045)); updates.push(p => { ornament.visible = i / 12 < p; }); } label("starText", "Mùa lễ an lành"); break; }
    case "snow-globe": { const glass = mat("#b9e6f2", { transparent: true, opacity: .18, roughness: .1, depthWrite: false }); ball(1.25, glass); cylinder(1, .35, primary, 0, -1.1); house(0, -.3, .45); for (let i = 0; i < 50; i++) { const seed = i * 2.4; const snow = ball(.022, white, Math.sin(seed) * .8, Math.cos(seed) * .8, Math.sin(seed * 2) * .7); updates.push((p, t) => { snow.position.y = ((i / 50 + t * p * .2) % 1) * 1.8 - .8; }); } label("engraving", value("recipient")); break; }
    case "fireplace": { box(2.2, 1.7, .6, cream, 0, -.1); box(1.4, 1.1, .08, dark, 0, -.35, .34); box(2.5, .2, .9, primary, 0, .85); for (let i = 0; i < 5; i++) { const flame = cone(.14, .65, i % 2 ? gold : red, (i - 2) * .2, -.6, .5); updates.push((p, t) => { flame.scale.y = p * (1 + Math.sin(t * 5 + i) * .15); }); } for (const x of [-.8, .8]) { box(.25, .45, .15, primary, x, .45, .55); ball(.16, primary, x + .08, .22, .55); } label("sign", "Một mùa đông ấm áp"); break; }
    case "pumpkin": { for (let i = 0; i < 9; i++) { const a = i * Math.PI * 2 / 9; const lobe = ball(.5, mat("#ed852c"), Math.cos(a) * .4, -.2, Math.sin(a) * .4); lobe.scale.y = 1.3; } cylinder(.1, .3, green, 0, .55); for (const x of [-.3, .3]) cone(.12, .22, gold, x, .05, .82); box(.4, .08, .05, gold, 0, -.35, .9); cone(.65, .8, primary, 0, 1); updates.push(p => { gold.emissive.set("#ffad33"); gold.emissiveIntensity = p; root.rotation.z = Math.sin(p * Math.PI * 2) * .12; }); label("surprise", "Một bất ngờ ngọt ngào!"); break; }
    case "flag": { cylinder(.035, 2.5, gold, -.7, .1); cylinder(.6, .12, cream, -.7, -1.2); const flag = new T.Group(); root.add(flag); box(1.5, 1, .025, mat("#da251d"), .1, .5, 0, flag); star(mat("#ffff00"), .1, .5, .03, .58, flag); updates.push(p => { flag.position.y = -1 + p; }); label("shortWish", "Bình an và tự hào"); break; }
    case "dove": { ball(.7, mat("#619cce"), 0, -.5); const bird = new T.Group(); root.add(bird); ball(.2, white, 0, .65, 0, bird); ball(.12, white, .18, .78, 0, bird); for (const side of [-1, 1]) { const wing = ball(.25, white, side * .25, .7, 0, bird); wing.scale.set(1.6, .2, .7); updates.push((p, t) => { wing.rotation.z = side * Math.sin(t * 5) * p * .6; }); } updates.push(p => { bird.position.x = Math.sin(p * Math.PI * 2); bird.position.y = Math.sin(p * Math.PI) * .5; }); label("peace", "Gửi những điều bình yên"); break; }
    case "gears": { for (let i = 0; i < 3; i++) { const gear = new T.Group(); gear.position.set((i - 1) * .95, i % 2 ? .3 : -.2, 0); root.add(gear); ring(.37, .09, i % 2 ? primary : gold, 0, 0, 0, gear); for (let j = 0; j < 10; j++) { const a = j * Math.PI / 5; const tooth = box(.16, .18, .16, gold, Math.cos(a) * .43, Math.sin(a) * .43, 0, gear); tooth.rotation.z = a; } updates.push((p, t) => { gear.rotation.z = p * t * (i % 2 ? -1 : 1); }); } label("team", "Cảm ơn sự tận tâm"); break; }
    case "earth": { ball(1, mat("#4f8bcc")); for (let i = 0; i < 10; i++) { const a = i * 2.4; const land = ball(.28, green, Math.sin(a) * .8, Math.cos(a) * .65, .6); land.scale.z = .3; updates.push(p => { land.scale.x = land.scale.y = .1 + p * .9; }); } const sprout = flower(0, 1.2, 0, green, .55); updates.push(p => sprout.scale.setScalar(.1 + p * .45)); label("campaign", "Cùng nuôi mầm xanh"); break; }
    case "store": { house(); box(2, .3, 1.3, primary, 0, .4, .2); const ribbon = box(2, .14, .04, gold, 0, -.15, .8); updates.push(p => { ribbon.scale.x = 1 - p; }); label("business", "Khai trương hồng phát"); break; }
    case "rainbow": { for (let i = 0; i < 5; i++) mesh(new T.TorusGeometry(1 - i * .12, .065, 8, 40, Math.PI), mat(["#e78796", "#edb65f", "#ede28a", "#88c7a4", "#8ea4de"][i]), 0, .1); for (const side of [-1, 1]) { const cloud = new T.Group(); root.add(cloud); for (let i = 0; i < 3; i++) ball(.3, white, side * .7 + i * .2, .05 + (i % 2) * .15, .3, cloud); updates.push(p => { cloud.position.x = side * p * .7; }); } flower(0, -.6, .4, gold, .6); label("encouragement", "Ngày mai trời lại sáng"); break; }
    case "suitcase": { box(1.6, 1.1, .65, primary, 0, -.35); ring(.23, .055, gold, 0, .35); for (const x of [-.5, .5]) box(.09, 1.13, .69, gold, x, -.35); const plane = cone(.18, .7, cream, -1, .8); plane.rotation.z = -Math.PI / 2; updates.push(p => { plane.position.x = -1 + p * 2; plane.position.y = .8 + Math.sin(p * Math.PI) * .4; }); label("destination", "Hẹn gặp ở chân trời mới"); break; }
    default: throw new Error(`Missing scene recipe: ${model}`);
  }
  return {
    root,
    update(p, t) { for (const update of updates) update(p, t); },
    dispose() {
      const geometries = new Set<T.BufferGeometry>(); root.traverse(object => { if (object instanceof T.Mesh) geometries.add(object.geometry); }); geometries.forEach(geometry => geometry.dispose());
      ownedMaterials.forEach(material => material.dispose()); ownedTextures.forEach(texture => texture.dispose()); cleanup.forEach(dispose => dispose());
    },
  };
}
