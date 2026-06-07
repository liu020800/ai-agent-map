import type { ReactNode, HTMLAttributes } from "react";

type CyberCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  variant?: "default" | "subtle" | "highlight";
  glow?: boolean;
  interactive?: boolean;
};

const VARIANT_CLASS = {
  default:
    "border border-gray-200 bg-white shadow-sm",
  subtle:
    "border border-gray-200 bg-gray-50/70",
  highlight:
    "border border-blue-200 bg-blue-50 shadow-sm",
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
    ? "transition-colors duration-200 hover:border-blue-300 hover:bg-blue-50/40 focus-visible:border-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
    : "";
  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${VARIANT_CLASS[variant]} ${interactiveClass} ${className}`}
      {...rest}
    >
      {glow ? (
        <span
          aria-hidden
          className="pointer-events-none absolute -top-px left-1/2 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-300 to-transparent"
        />
      ) : null}
      {children}
    </div>
  );
}
