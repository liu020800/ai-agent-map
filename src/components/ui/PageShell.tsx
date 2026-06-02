import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  className?: string;
  width?: "narrow" | "default" | "wide";
};

const WIDTH_MAP = {
  narrow: "max-w-[920px]",
  default: "max-w-[1240px]",
  wide: "max-w-[1360px]",
} as const;

export function PageShell({ children, className = "", width = "default" }: PageShellProps) {
  return (
    <div className={`mx-auto w-full ${WIDTH_MAP[width]} px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

type SectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  spacing?: "sm" | "md" | "lg";
};

const SPACING_MAP = {
  sm: "py-10 sm:py-12",
  md: "py-14 sm:py-16 lg:py-20",
  lg: "py-20 sm:py-24 lg:py-28",
} as const;

export function Section({ id, children, className = "", spacing = "md" }: SectionProps) {
  return (
    <section id={id} className={`relative ${SPACING_MAP[spacing]} ${className}`}>
      {children}
    </section>
  );
}
