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
        backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%)",
        backgroundPosition: "200% center",
        animation: `shimmer ${speed}s linear infinite`,
      }}
    >
      {text}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </span>
  );
}
