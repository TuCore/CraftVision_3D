"use client";

import React from 'react';
import { Stars } from '@react-three/drei';

interface StarsBackgroundProps {
  count?: number;
  speed?: number;
}

export function StarsBackground({
  count = 3500,
  speed = 0.8,
}: StarsBackgroundProps) {
  return (
    <Stars
      radius={60}
      depth={40}
      count={count}
      factor={3.5}
      saturation={0.4}
      fade
      speed={speed}
    />
  );
}
