import * as THREE from "three";

/** Procedural roses: the existing rose_bouquet.glb is a mislabeled sample duck. */
export function createRoseBouquet() {
  const bouquet = new THREE.Group();
  const stemMaterial = new THREE.MeshStandardMaterial({ color: "#305734", roughness: .8 });
  const leafMaterial = new THREE.MeshStandardMaterial({ color: "#356947", side: THREE.DoubleSide, roughness: .6 });
  const ribbonMaterial = new THREE.MeshStandardMaterial({ color: "#f0b0ad", side: THREE.DoubleSide, roughness: .4, metalness: .15 });
  const petals = ["#a40f3e", "#c82151", "#ec4268", "#f46b88"].map(color => new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, roughness: .5 }));

  // Curved, cupped petals with a softly flared lip instead of flat discs.
  function petalGeometry(layer: number) {
    const geometry = new THREE.PlaneGeometry(1, 1, 16, 14);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const u = positions.getX(i) * 2;
      const v = positions.getY(i) + .5;
      const breadth = (.12 + Math.sin(v * Math.PI * .8) * .88) * (.28 + layer * .035);
      const x = u * breadth;
      const y = v * (.53 - layer * .035) - u * u * .07 * v;
      const z = .045 + v * v * (.19 + layer * .06) - u * u * .11 * v + Math.sin(v * Math.PI) * .06;
      positions.setXYZ(i, x, y, z);
    }
    geometry.computeVertexNormals();
    return geometry;
  }
  const petalGeometries = Array.from({ length: 4 }, (_, layer) => petalGeometry(layer));
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0); leafShape.bezierCurveTo(-.32, .22, -.22, .52, 0, .7); leafShape.bezierCurveTo(.22, .5, .28, .2, 0, 0);
  const leafGeometry = new THREE.ShapeGeometry(leafShape, 14);
  const leafPositions = leafGeometry.attributes.position;
  for (let i = 0; i < leafPositions.count; i++) leafPositions.setZ(i, Math.sin(leafPositions.getY(i) * 4) * .08);
  leafGeometry.computeVertexNormals();

  const flowers = [[0, .7, .22], [-.62, .48, .02], [.62, .52, .02], [-.34, .94, -.43], [.35, .98, -.43]];
  flowers.forEach(([x, y, z], index) => {
    const head = new THREE.Group();
    head.position.set(x, y, z);
    head.rotation.set(.36 + index * .03, index * 1.9, -x * .3);
    for (let layer = 0; layer < 4; layer++) {
      const count = 4 + layer * 2;
      for (let i = 0; i < count; i++) {
        const pivot = new THREE.Group();
        pivot.rotation.y = i / count * Math.PI * 2 + layer * .7;
        const petal = new THREE.Mesh(petalGeometries[layer], petals[layer]);
        petal.position.set(0, -.045 * layer, .02 + layer * .07);
        pivot.add(petal); head.add(pivot);
      }
    }
    bouquet.add(head);
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(x * .2, -1.25, z * .2), new THREE.Vector3(x * .4, -.4, z * .4), new THREE.Vector3(x, y, z)]);
    bouquet.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 18, .024, 7, false), stemMaterial));
    for (let i = 0; i < 2; i++) {
      const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
      leaf.position.copy(curve.getPoint(.4 + i * .27));
      leaf.rotation.set(.35, index * 1.5, (i % 2 ? -1 : 1) * 1.05);
      bouquet.add(leaf);
    }
  });
  const knot = new THREE.Mesh(new THREE.SphereGeometry(.1, 16, 12), ribbonMaterial);
  knot.position.set(0, -.55, .22); bouquet.add(knot);
  for (const side of [-1, 1]) {
    const loop = new THREE.Mesh(new THREE.TorusGeometry(.19, .047, 8, 32), ribbonMaterial);
    loop.scale.set(1.35, .65, .5); loop.rotation.z = side * .4; loop.position.set(side * .23, -.51, .2); bouquet.add(loop);
    const tail = new THREE.Mesh(new THREE.PlaneGeometry(.12, .5), ribbonMaterial);
    tail.position.set(side * .14, -.82, .2); tail.rotation.z = side * -.3; bouquet.add(tail);
  }
  bouquet.rotation.x = .15;
  return {
    object: bouquet,
    dispose() {
      const geometries = new Set<THREE.BufferGeometry>();
      bouquet.traverse(object => { if (object instanceof THREE.Mesh) geometries.add(object.geometry); });
      geometries.forEach(geometry => geometry.dispose());
      [...petals, stemMaterial, leafMaterial, ribbonMaterial].forEach(material => material.dispose());
    },
  };
}
