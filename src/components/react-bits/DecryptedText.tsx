"use client";

import { useEffect, useState } from "react";

interface DecryptedTextProps {
  text: string;
  className?: string;
  speed?: number;
  trigger?: boolean;
}

export default function DecryptedText({ text, className = "", speed = 30, trigger = true }: DecryptedTextProps) {
  const [display, setDisplay] = useState(text);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!trigger) { setDisplay(text); setDone(true); return; }
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&";
    let frame = 0;
    const total = text.length;
    const interval = setInterval(() => {
      frame++;
      const progress = frame / total;
      let result = "";
      for (let i = 0; i < total; i++) {
        if (i < progress * total) result += text[i];
        else result += chars[Math.floor(Math.random() * chars.length)];
      }
      setDisplay(result);
      if (frame >= total) { clearInterval(interval); setDisplay(text); setDone(true); }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, trigger]);

  return <span className={`${className} ${done ? "" : "font-mono"}`}>{display}</span>;
}
