"use client";

import { motion, useInView } from "framer-motion";
import { CSSProperties, ElementType, createElement, useEffect, useRef, useState } from "react";

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  threshold?: number;
  rootMargin?: string;
  as?: ElementType;
  gradientClass?: string;
}

export default function SplitText({
  text,
  className = "",
  delay = 0,
  stagger = 0.04,
  duration = 0.7,
  threshold = 0.1,
  rootMargin = "0px",
  as = "span",
  gradientClass = "gradient-text-rb",
}: SplitTextProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chars = Array.from(text);
  const styleVars = { ["--mx" as never]: "50%", ["--my" as never]: "50%" } as CSSProperties;

  const children = chars.map((char, index) => (
    <motion.span
      key={`${char}-${index}`}
      initial={{ y: "100%", opacity: 0, filter: "blur(8px)" }}
      animate={mounted && isInView ? { y: "0%", opacity: 1, filter: "blur(0px)" } : { y: "100%", opacity: 0, filter: "blur(8px)" }}
      transition={{ duration, delay: delay + index * stagger, ease: [0.16, 1, 0.3, 1] }}
      className="inline-block"
      style={{ display: char === " " ? "inline" : "inline-block" }}
    >
      <span className={index % 5 === 0 ? gradientClass : "text-white"}>{char === " " ? "\u00A0" : char}</span>
    </motion.span>
  ));

  return createElement(as, { ref, className: `inline-flex flex-wrap items-baseline ${className}`, style: styleVars }, children);
}
