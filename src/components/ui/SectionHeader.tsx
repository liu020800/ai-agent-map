import type { ReactNode } from "react";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  accent?: "cyan" | "purple" | "green" | "amber";
  trailing?: ReactNode;
  className?: string;
};

const ACCENT_BG = {
  cyan: "app-badge",
  purple: "app-badge",
  green: "app-badge",
  amber: "app-badge",
} as const;

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  accent = "cyan",
  trailing,
  className = "",
}: SectionHeaderProps) {
  const alignment = align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <div className={`flex w-full flex-col gap-4 ${alignment} sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div className={`flex max-w-3xl flex-col gap-3 ${alignment}`}>
        {eyebrow ? (
          <span
            className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] ring-1 ${ACCENT_BG[accent]}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {eyebrow}
          </span>
        ) : null}
        <h2 className="app-heading text-balance text-2xl font-semibold leading-tight sm:text-3xl lg:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="app-muted max-w-2xl text-sm leading-relaxed sm:text-base">{description}</p>
        ) : null}
      </div>
      {trailing ? <div className="flex shrink-0 items-center gap-3">{trailing}</div> : null}
    </div>
  );
}
