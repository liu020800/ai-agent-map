"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { motion } from "framer-motion";

interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: "start" | "end" | "center";
  characters?: string;
  className?: string;
  encryptedClassName?: string;
  parentClassName?: string;
  animateOn?: "view" | "hover" | "click";
}

export default function DecryptedText({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = false,
  revealDirection = "start",
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+",
  className = "",
  encryptedClassName = "",
  parentClassName = "",
  animateOn = "view",
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isDecrypted, setIsDecrypted] = useState(animateOn !== "click");
  const containerRef = useRef<HTMLSpanElement>(null);
  const orderRef = useRef<number[]>([]);
  const pointerRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const availableChars = useMemo(() => characters.split(""), [characters]);

  const shuffleText = useCallback(
    (original: string, revealed: Set<number>) => {
      return original.split("").map((char, i) => {
        if (char === " ") return " ";
        if (revealed.has(i)) return original[i];
        return availableChars[Math.floor(Math.random() * availableChars.length)];
      }).join("");
    },
    [availableChars]
  );

  const computeOrder = useCallback((len: number): number[] => {
    const order: number[] = [];
    if (revealDirection === "start") { for (let i = 0; i < len; i++) order.push(i); return order; }
    if (revealDirection === "end") { for (let i = len - 1; i >= 0; i--) order.push(i); return order; }
    const mid = Math.floor(len / 2);
    let offset = 0;
    while (order.length < len) {
      if (offset % 2 === 0) { const idx = mid + offset / 2; if (idx >= 0 && idx < len) order.push(idx); }
      else { const idx = mid - Math.ceil(offset / 2); if (idx >= 0 && idx < len) order.push(idx); }
      offset++;
    }
    return order.slice(0, len);
  }, [revealDirection]);

  // View trigger
  useEffect(() => {
    if (animateOn !== "view") return;
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated) {
        setHasAnimated(true);
        setIsAnimating(true);
        setRevealedIndices(new Set());
      }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [animateOn, hasAnimated]);

  // Animation loop
  useEffect(() => {
    if (!isAnimating) return;
    let iteration = 0;

    if (sequential) {
      orderRef.current = computeOrder(text.length);
      pointerRef.current = 0;
      intervalRef.current = setInterval(() => {
        if (pointerRef.current >= orderRef.current.length) {
          clearInterval(intervalRef.current!);
          setIsAnimating(false);
          setDisplayText(text);
          setIsDecrypted(true);
          return;
        }
        setRevealedIndices(prev => {
          const next = new Set(prev);
          next.add(orderRef.current[pointerRef.current]);
          pointerRef.current++;
          return next;
        });
        setDisplayText(() => {
          const revealed = new Set(revealedIndices);
          orderRef.current.slice(0, pointerRef.current).forEach(i => revealed.add(i));
          return shuffleText(text, revealed);
        });
      }, speed);
    } else {
      intervalRef.current = setInterval(() => {
        iteration++;
        setRevealedIndices(prev => {
          if (iteration >= maxIterations) {
            clearInterval(intervalRef.current!);
            setIsAnimating(false);
            setDisplayText(text);
            setIsDecrypted(true);
            const all = new Set<number>();
            for (let i = 0; i < text.length; i++) all.add(i);
            return all;
          }
          setDisplayText(shuffleText(text, prev));
          return prev;
        });
      }, speed);
    }

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isAnimating, text, speed, maxIterations, sequential, computeOrder, shuffleText, revealedIndices]);

  // Hover
  const triggerHover = useCallback(() => {
    if (isAnimating) return;
    setRevealedIndices(new Set());
    setIsDecrypted(false);
    setDisplayText(shuffleText(text, new Set()));
    setIsAnimating(true);
  }, [isAnimating, text, shuffleText]);

  const resetHover = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsAnimating(false);
    setRevealedIndices(new Set());
    setDisplayText(text);
    setIsDecrypted(true);
  }, [text]);

  // Initial state for click mode
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- Reset state when animate mode or text prop changes. */
    if (animateOn === "click") {
      setDisplayText(shuffleText(text, new Set()));
      setIsDecrypted(false);
    } else {
      setDisplayText(text);
      setIsDecrypted(true);
    }
    setRevealedIndices(new Set());
    setHasAnimated(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [animateOn, text, shuffleText]);

  const eventProps = animateOn === "hover"
    ? { onMouseEnter: triggerHover, onMouseLeave: resetHover }
    : animateOn === "click"
      ? { onClick: () => { if (!isDecrypted && !isAnimating) { setIsAnimating(true); } } }
      : {};

  return (
    <motion.span
      ref={containerRef}
      className={`inline-block whitespace-pre-wrap ${parentClassName}`}
      {...eventProps}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {displayText.split("").map((char, i) => {
          const revealed = revealedIndices.has(i) || (!isAnimating && isDecrypted);
          return <span key={i} className={revealed ? className : encryptedClassName}>{char}</span>;
        })}
      </span>
    </motion.span>
  );
}
