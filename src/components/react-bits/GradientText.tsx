"use client";

import { useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { motion, useMotionValue, useAnimationFrame, useTransform } from "framer-motion";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
  pauseOnHover?: boolean;
}

export default function GradientText({
  children,
  className = "",
  colors = ["#5227FF", "#FF9FFC", "#B497CF"],
  animationSpeed = 8,
  showBorder = false,
  pauseOnHover = false,
}: GradientTextProps) {
  const [isPaused, setIsPaused] = useState(false);
  const progress = useMotionValue(0);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const duration = animationSpeed * 1000;

  useAnimationFrame(time => {
    if (isPaused) { lastTimeRef.current = null; return; }
    if (lastTimeRef.current === null) { lastTimeRef.current = time; return; }
    const delta = time - lastTimeRef.current;
    lastTimeRef.current = time;
    elapsedRef.current += delta;
    const fullCycle = duration * 2;
    const cycleTime = elapsedRef.current % fullCycle;
    if (cycleTime < duration) {
      progress.set((cycleTime / duration) * 100);
    } else {
      progress.set(100 - ((cycleTime - duration) / duration) * 100);
    }
  });

  useEffect(() => { elapsedRef.current = 0; progress.set(0); }, [animationSpeed, progress]);

  const backgroundPosition = useTransform(progress, p => `${p}% 50%`);
  const gradientColors = [...colors, colors[0]].join(", ");

  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${gradientColors})`,
    backgroundSize: "300% 100%",
    backgroundRepeat: "repeat" as const,
  };

  const handleHover = useCallback((paused: boolean) => {
    if (pauseOnHover) setIsPaused(paused);
  }, [pauseOnHover]);

  return (
    <motion.div
      className={`relative mx-auto flex max-w-fit flex-row items-center justify-center rounded-[1.25rem] font-medium backdrop-blur transition-shadow duration-500 overflow-hidden cursor-pointer ${showBorder ? "py-1 px-2" : ""} ${className}`}
      onMouseEnter={() => handleHover(true)}
      onMouseLeave={() => handleHover(false)}
    >
      {showBorder && (
        <motion.div className="absolute inset-0 z-0 pointer-events-none rounded-[1.25rem]" style={{ ...gradientStyle, backgroundPosition }}>
          <div className="absolute bg-black rounded-[1.25rem] z-[-1]" style={{ width: "calc(100% - 2px)", height: "calc(100% - 2px)", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }} />
        </motion.div>
      )}
      <motion.div
        className="inline-block relative z-2 text-transparent bg-clip-text"
        style={{ ...gradientStyle, backgroundPosition, WebkitBackgroundClip: "text" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
