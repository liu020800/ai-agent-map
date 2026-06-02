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
  cyan: "bg-[#22d3ee]/12 text-[#22d3ee] ring-[#22d3ee]/30",
  purple: "bg-[#8b5cf6]/12 text-[#8b5cf6] ring-[#8b5cf6]/30",
  green: "bg-[#22c55e]/12 text-[#22c55e] ring-[#22c55e]/30",
  amber: "bg-[#f59e0b]/12 text-[#f59e0b] ring-[#f59e0b]/30",
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
        <h2 className="text-balance text-2xl font-semibold leading-tight text-slate-50 sm:text-3xl lg:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">{description}</p>
        ) : null}
      </div>
      {trailing ? <div className="flex shrink-0 items-center gap-3">{trailing}</div> : null}
    </div>
  );
}
