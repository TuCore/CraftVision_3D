"use client";

import React, { useState, useRef, ReactNode } from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function TiltCard({ children, className = "", style, onClick }: TiltCardProps) {
  const [transform, setTransform] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    
    // Calculate rotation (-15 to 15 degrees max)
    const MAX_TILT = 10;
    
    // Mouse X relative to center (-0.5 to 0.5)
    const xRatio = (e.clientX - left) / width - 0.5;
    // Mouse Y relative to center (-0.5 to 0.5)
    const yRatio = (e.clientY - top) / height - 0.5;

    const rotateX = -yRatio * MAX_TILT * 2;
    const rotateY = xRatio * MAX_TILT * 2;

    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseLeave = () => {
    setTransform("");
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-300 ease-out will-change-transform ${className}`}
      style={{ ...style, transform }}
    >
      {children}
    </div>
  );
}
