"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const LiquidGlass = dynamic(() => import("liquid-glass-react"), { ssr: false });

interface LiquidGlassCardProps {
  children: ReactNode;
  className?: string;
  mode?: "standard" | "polar" | "prominent" | "shader";
  blurAmount?: number;
  saturation?: number;
  aberrationIntensity?: number;
  elasticity?: number;
  cornerRadius?: number;
  padding?: string;
  overLight?: boolean;
  style?: React.CSSProperties;
}

export default function LiquidGlassCard({
  children,
  className = "",
  mode = "standard",
  blurAmount = 0.08,
  saturation = 120,
  aberrationIntensity = 1.5,
  elasticity = 0.2,
  cornerRadius = 24,
  padding = "2rem",
  overLight = false,
  style,
}: LiquidGlassCardProps) {
  return (
    <LiquidGlass
      blurAmount={blurAmount}
      saturation={saturation}
      aberrationIntensity={aberrationIntensity}
      elasticity={elasticity}
      cornerRadius={cornerRadius}
      padding={padding}
      overLight={overLight}
      mode={mode}
      className={className}
      style={style}
    >
      {children}
    </LiquidGlass>
  );
}
