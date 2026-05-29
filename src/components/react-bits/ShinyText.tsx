"use client";

interface ShinyTextProps {
  text: string;
  className?: string;
  speed?: number;
}

export default function ShinyText({ text, className = "", speed = 3 }: ShinyTextProps) {
  return (
    <span
      className={`inline-block bg-[length:200%_100%] bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.1) 100%)",
        backgroundPosition: "200% center",
        animation: `shimmer ${speed}s linear infinite`,
      }}
    >
      {text}
    </span>
  );
}
