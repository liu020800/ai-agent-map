import type { LucideIcon } from "lucide-react";
import { CyberCard } from "./CyberCard";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  delta?: string;
  trend?: "up" | "down" | "flat";
  hint?: string;
};

const TREND_COLOR = {
  up: "text-[#22c55e]",
  down: "text-[#f87171]",
  flat: "text-slate-400",
} as const;

export function StatCard({ icon: Icon, label, value, delta, trend = "flat", hint }: StatCardProps) {
  return (
    <CyberCard variant="default" className="flex flex-col gap-3 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#22d3ee]/25 bg-[#22d3ee]/[0.08] text-[#22d3ee]">
          <Icon size={18} strokeWidth={1.6} />
        </span>
        {delta ? (
          <span className={`text-xs font-medium ${TREND_COLOR[trend]}`}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "·"} {delta}
          </span>
        ) : null}
      </div>
      <div>
        <p className="text-2xl font-semibold leading-tight text-slate-50 sm:text-3xl">{value}</p>
        <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">{label}</p>
      </div>
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </CyberCard>
  );
}
