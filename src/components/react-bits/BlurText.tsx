"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
  animateBy?: "words" | "characters";
}

export default function BlurText({ text, className = "", delay = 0, animateBy = "words" }: BlurTextProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const parts = animateBy === "characters" ? text.split("") : text.split(" ");

  return (
    <div ref={ref} className={className}>
      {parts.map((part, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
          animate={visible ? { opacity: 1, filter: "blur(0px)", y: 0 } : {}}
          transition={{ duration: 0.4, delay: delay + i * 0.05, ease: "easeOut" }}
          className="inline-block"
        >
          {part}{animateBy === "words" ? " " : ""}
        </motion.span>
      ))}
    </div>
  );
}
