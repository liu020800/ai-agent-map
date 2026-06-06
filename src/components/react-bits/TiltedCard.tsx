"use client";

import { useRef, useState, useCallback, useEffect, ReactNode } from "react";

interface TiltedCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
  perspective?: number;
}

export default function TiltedCard({
  children,
  className = "",
  maxTilt = 8,
  scale = 1.01,
  perspective = 1200,
}: TiltedCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(1200px) rotateX(0deg) rotateY(0deg)");
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setEnabled(!mq.matches);
  }, []);

  const handleMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!enabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    const rx = (-y * maxTilt).toFixed(2);
    const ry = (x * maxTilt).toFixed(2);
    setTransform(`perspective(${perspective}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`);
  }, [enabled, maxTilt, perspective, scale]);

  const handleLeave = useCallback(() => {
    setTransform(`perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`);
  }, [perspective]);

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
      style={{ transform, transformStyle: "preserve-3d", transition: enabled ? "transform 0.4s cubic-bezier(0.16,1,0.3,1)" : "none" }}
    >
      {children}
    </div>
  );
}
