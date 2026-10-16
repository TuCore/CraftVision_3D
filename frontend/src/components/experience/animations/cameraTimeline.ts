import gsap from 'gsap';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

export interface CameraAnimationConfig {
  defaultPosition: [number, number, number];
  defaultTarget: [number, number, number];
  cinematicPosition: [number, number, number];
  cinematicTarget: [number, number, number];
  duration: number; // in seconds
  ease: string;
}

export const DEFAULT_CAMERA_ANIM_CONFIG: CameraAnimationConfig = {
  defaultPosition: [0, 1.2, 5.0],
  defaultTarget: [0, 0, 0],
  cinematicPosition: [0.45, 0.85, 2.1],
  cinematicTarget: [0, 0.65, 0],
  duration: 2.2,
  ease: 'power2.inOut',
};

let activeTimeline: gsap.core.Timeline | null = null;

export function killCameraTimeline() {
  if (activeTimeline) {
    activeTimeline.kill();
    activeTimeline = null;
  }
}

/**
 * Animate camera from current/default view to intimate cinematic candle close-up
 */
export function animateCameraToCinematic({
  camera,
  controls,
  config = DEFAULT_CAMERA_ANIM_CONFIG,
  onComplete,
}: {
  camera: THREE.Camera;
  controls?: OrbitControlsImpl | null;
  config?: Partial<CameraAnimationConfig>;
  onComplete?: () => void;
}) {
  killCameraTimeline();

  const cfg = { ...DEFAULT_CAMERA_ANIM_CONFIG, ...config };
  const targetPos = new THREE.Vector3(...cfg.cinematicPosition);
  const targetLook = new THREE.Vector3(...cfg.cinematicTarget);

  if (controls) {
    controls.enabled = false;
  }

  const tl = gsap.timeline({
    onComplete: () => {
      if (controls) {
        controls.target.copy(targetLook);
        controls.update();
        controls.enabled = true; // allow gentle rotation at close-up
      }
      onComplete?.();
    },
  });

  // Animate Camera Position
  tl.to(
    camera.position,
    {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: cfg.duration,
      ease: cfg.ease,
      onUpdate: () => {
        if (!controls) {
          camera.lookAt(targetLook);
        }
      },
    },
    0
  );

  // Animate OrbitControls Target (Look-at point)
  if (controls) {
    tl.to(
      controls.target,
      {
        x: targetLook.x,
        y: targetLook.y,
        z: targetLook.z,
        duration: cfg.duration,
        ease: cfg.ease,
        onUpdate: () => {
          controls.update();
        },
      },
      0
    );
  }

  activeTimeline = tl;
  return tl;
}

/**
 * Reset camera smoothly back to default wide view
 */
export function animateCameraToDefault({
  camera,
  controls,
  config = DEFAULT_CAMERA_ANIM_CONFIG,
  onComplete,
}: {
  camera: THREE.Camera;
  controls?: OrbitControlsImpl | null;
  config?: Partial<CameraAnimationConfig>;
  onComplete?: () => void;
}) {
  killCameraTimeline();

  const cfg = { ...DEFAULT_CAMERA_ANIM_CONFIG, ...config };
  const targetPos = new THREE.Vector3(...cfg.defaultPosition);
  const targetLook = new THREE.Vector3(...cfg.defaultTarget);

  if (controls) {
    controls.enabled = false;
  }

  const tl = gsap.timeline({
    onComplete: () => {
      if (controls) {
        controls.target.copy(targetLook);
        controls.update();
        controls.enabled = true;
      }
      onComplete?.();
    },
  });

  tl.to(
    camera.position,
    {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 1.5,
      ease: 'power2.out',
    },
    0
  );

  if (controls) {
    tl.to(
      controls.target,
      {
        x: targetLook.x,
        y: targetLook.y,
        z: targetLook.z,
        duration: 1.5,
        ease: 'power2.out',
        onUpdate: () => {
          controls.update();
        },
      },
      0
    );
  }

  activeTimeline = tl;
  return tl;
}
