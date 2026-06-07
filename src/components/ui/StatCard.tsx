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
  up: "text-emerald-600",
  down: "text-red-600",
  flat: "text-gray-500",
} as const;

export function StatCard({ icon: Icon, label, value, delta, trend = "flat", hint }: StatCardProps) {
  return (
    <CyberCard variant="default" className="flex flex-col gap-3 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
          <Icon size={18} strokeWidth={1.6} />
        </span>
        {delta ? (
          <span className={`text-xs font-medium ${TREND_COLOR[trend]}`}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "·"} {delta}
          </span>
        ) : null}
      </div>
      <div>
        <p className="text-2xl font-semibold leading-tight text-gray-950 sm:text-3xl">{value}</p>
        <p className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
      </div>
      {hint ? <p className="text-xs text-gray-500">{hint}</p> : null}
    </CyberCard>
  );
}
