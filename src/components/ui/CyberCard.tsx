import type { ReactNode, HTMLAttributes } from "react";

type CyberCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  variant?: "default" | "subtle" | "highlight";
  glow?: boolean;
  interactive?: boolean;
};

const VARIANT_CLASS = {
  default:
    "border border-white/[0.05] bg-gradient-to-b from-white/[0.03] to-white/[0.01] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
  subtle:
    "border border-white/[0.04] bg-white/[0.01]",
  highlight:
    "border border-[#22d3ee]/30 bg-gradient-to-br from-[#22d3ee]/[0.08] to-[#8b5cf6]/[0.06] shadow-[0_0_40px_-12px_rgba(34,211,238,0.4)]",
} as const;

export function CyberCard({
  children,
  variant = "default",
  glow = false,
  interactive = false,
  className = "",
  ...rest
}: CyberCardProps) {
  const interactiveClass = interactive
    ? "transition-colors duration-200 hover:border-[#22d3ee]/40 hover:bg-white/[0.025] focus-visible:border-[#22d3ee]/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22d3ee]/60"
    : "";
  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${VARIANT_CLASS[variant]} ${interactiveClass} ${className}`}
      {...rest}
    >
      {glow ? (
        <span
          aria-hidden
          className="pointer-events-none absolute -top-px left-1/2 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#22d3ee] to-transparent"
        />
      ) : null}
      {children}
    </div>
  );
}
