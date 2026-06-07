import { ToolBadge } from "./ToolBadge";
import { CyberCard } from "./CyberCard";

type RankingListProps = {
  items: { name: string; count: number; accent?: string; trend?: "up" | "down" | "flat"; delta?: string }[];
  unit?: string;
  empty?: string;
};

const TREND_GLYPH = { up: "↑", down: "↓", flat: "·" } as const;
const TREND_COLOR = {
  up: "text-[#22c55e]",
  down: "text-[#f87171]",
  flat: "text-slate-500",
} as const;

export function RankingList({ items, unit, empty = "暂无数据" }: RankingListProps) {
  if (!items.length) {
    return (
      <div className="app-card-muted rounded-xl p-6 text-center text-sm">
        {empty}
      </div>
    );
  }
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <ol className="space-y-2">
      {items.map((it, idx) => {
        const pct = Math.round((it.count / max) * 100);
        return (
          <li
            key={it.name}
            className="app-card group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 transition-colors hover:border-[var(--app-border-strong)]"
          >
            <span className="app-badge flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs">
              {String(idx + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="app-heading truncate text-sm font-medium">{it.name}</span>
                <span className="flex items-baseline gap-1.5">
                  <span className="app-heading font-mono text-sm font-semibold">
                    {it.count.toLocaleString()}
                  </span>
                  {unit ? <span className="app-soft text-[10px]">{unit}</span> : null}
                  {it.delta ? (
                    <span className={`text-[10px] ${TREND_COLOR[it.trend ?? "flat"]}`}>
                      {TREND_GLYPH[it.trend ?? "flat"]} {it.delta}
                    </span>
                  ) : null}
                </span>
              </div>
              <div
                className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-[var(--app-surface-muted)]"
                aria-hidden
              >
                <div
                  className="h-full rounded-full transition-[width] duration-700"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${it.accent ?? "#22d3ee"}aa, ${it.accent ?? "#22d3ee"}33)`,
                    boxShadow: `0 0 10px -2px ${it.accent ?? "#22d3ee"}80`,
                  }}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

type TagCloudProps = {
  items: { name: string; count?: number }[];
  title?: string;
};

export function TagCloud({ items, title }: TagCloudProps) {
  return (
    <CyberCard variant="subtle" className="p-4 sm:p-5">
      {title ? (
        <div className="mb-3 flex items-center justify-between">
          <span className="app-muted text-xs font-semibold uppercase tracking-wider">{title}</span>
          <span className="app-soft text-[10px]">{items.length} 个</span>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {items.map((it) => (
          <ToolBadge key={it.name} name={it.name} size="sm" count={it.count} />
        ))}
      </div>
    </CyberCard>
  );
}
