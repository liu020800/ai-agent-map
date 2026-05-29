"use client";

import { useEffect, useState, useRef } from "react";

interface DecryptedTextProps {
  text: string;
  speed?: number;
  className?: string;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";

export default function DecryptedText({ text, speed = 40, className = "" }: DecryptedTextProps) {
  const [display, setDisplay] = useState(text);
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        obs.disconnect();
        let frame = 0;
        const total = text.length;
        const interval = setInterval(() => {
          frame++;
          const revealed = Math.floor((frame / total) * total);
          let result = "";
          for (let i = 0; i < total; i++) {
            if (i < revealed) {
              result += text[i];
            } else {
              result += CHARS[Math.floor(Math.random() * CHARS.length)];
            }
          }
          setDisplay(result);
          if (frame >= total) {
            clearInterval(interval);
            setDisplay(text);
            setDone(true);
          }
        }, speed);
        return () => clearInterval(interval);
      }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [text, speed]);

  return (
    <span ref={ref} className={`font-mono tracking-wider ${className}`} style={{ opacity: done ? 1 : 0.8 }}>
      {display}
    </span>
  );
}
