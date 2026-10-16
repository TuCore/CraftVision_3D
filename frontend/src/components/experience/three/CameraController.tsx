"use client";

import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import {
  animateCameraToCinematic,
  animateCameraToDefault,
  killCameraTimeline,
} from '../animations/cameraTimeline';

interface CameraControllerProps {
  isCompleted?: boolean;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  onTransitionComplete?: () => void;
}

export function CameraController({
  isCompleted = false,
  controlsRef,
  onTransitionComplete,
}: CameraControllerProps) {
  const { camera } = useThree();
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const controls = controlsRef.current;

    if (isCompleted && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      animateCameraToCinematic({
        camera,
        controls,
        onComplete: onTransitionComplete,
      });
    } else if (!isCompleted && hasTriggeredRef.current) {
      hasTriggeredRef.current = false;
      animateCameraToDefault({
        camera,
        controls,
      });
    }

    return () => {
      killCameraTimeline();
    };
  }, [isCompleted, camera, controlsRef, onTransitionComplete]);

  // Subtle natural floating drift when in completed cinematic close-up
  useFrame(({ clock }) => {
    if (!isCompleted || !controlsRef.current) return;
    const t = clock.getElapsedTime();
    // Gentle floating breathing sway
    camera.position.y += Math.sin(t * 1.2) * 0.0006;
  });

  return null;
}
