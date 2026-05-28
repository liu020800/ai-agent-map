"use client";

import { useRef, type ReactNode } from "react";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}

export default function SpotlightCard({ children, className = "", spotlightColor = "rgba(99, 102, 241, 0.15)" }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    el.style.setProperty("--spotlight-color", spotlightColor);
  };

  return (
    <div ref={ref} onMouseMove={handleMouseMove} className={`relative overflow-hidden ${className}`}
      style={{ background: `radial-gradient(circle 200px at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--spotlight-color, rgba(99,102,241,0.15)), transparent)` }}>
      {children}
    </div>
  );
}
