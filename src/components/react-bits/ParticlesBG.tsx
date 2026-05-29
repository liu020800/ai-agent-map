"use client";

import { useEffect, useRef, useCallback } from "react";

interface ParticlesBGProps {
  className?: string;
  count?: number;
  colors?: string[];
  connectDistance?: number;
  mouseInteractive?: boolean;
}

export default function ParticlesBG({
  className = "",
  count = 120,
  colors = ["#00ffc8", "#00d4ff", "#a855f7"],
  connectDistance = 140,
  mouseInteractive = true,
}: ParticlesBGProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: -999, y: -999 });

  const hexToRgb = useCallback((hex: string): [number, number, number] => {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    const n = parseInt(hex, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const palette = colors.map(hexToRgb);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      rgb: [number, number, number];
      a: number;
    }

    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const isMobile = canvas.width < 768;
      const n = isMobile ? Math.min(count, 50) : count;
      particles = Array.from({ length: n }, () => {
        const rgb = palette[Math.floor(Math.random() * palette.length)];
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 2 + 0.5,
          rgb,
          a: Math.random() * 0.5 + 0.15,
        };
      });
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    if (mouseInteractive) window.addEventListener("mousemove", onMouseMove);

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const p of particles) {
        if (!reduceMotion) {
          // Mouse repulsion
          if (mouseInteractive && mx > 0) {
            const dx = p.x - mx;
            const dy = p.y - my;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              const force = (120 - dist) / 120;
              p.vx += (dx / dist) * force * 0.15;
              p.vy += (dy / dist) * force * 0.15;
            }
          }

          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.99;
          p.vy *= 0.99;

          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.rgb[0]}, ${p.rgb[1]}, ${p.rgb[2]}, ${p.a})`;
        ctx.fill();
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectDistance) {
            const opacity = 0.12 * (1 - dist / connectDistance);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${particles[i].rgb[0]}, ${particles[i].rgb[1]}, ${particles[i].rgb[2]}, ${opacity})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      if (!reduceMotion) animRef.current = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      if (mouseInteractive) window.removeEventListener("mousemove", onMouseMove);
    };
  }, [count, colors, connectDistance, mouseInteractive, hexToRgb]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none ${className}`}
      style={{ position: "fixed", inset: 0, zIndex: 0 }}
    />
  );
}
