"use client";

import { useRef, type ReactNode } from "react";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}

export default function SpotlightCard({ children, className = "", spotlightColor = "rgba(99, 102, 241, 0.08)" }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.04] ${className}`}
      style={{
        background: `radial-gradient(circle 300px at var(--mx, 50%) var(--my, 50%), ${spotlightColor}, transparent)`,
      }}
    >
      {children}
    </div>
  );
}
