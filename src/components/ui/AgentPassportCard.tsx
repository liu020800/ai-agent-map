import { generateAvatarSvg } from "@/lib/avatar";
import { toolColor } from "@/data/mock";
import { ToolBadge } from "./ToolBadge";
import { CyberCard } from "./CyberCard";

type AgentPassportCardProps = {
  nickname: string;
  province: string;
  primaryTool: string;
  tools: string[];
  level: number;
  levelName: string;
  avatarSeed: string;
  /** Compact layout: smaller avatar, no qr placeholder, no scan-line. */
  compact?: boolean;
  /** Show accent (level) top glow. */
  showGlow?: boolean;
  className?: string;
};

const LEVEL_GRADIENT = {
  1: "from-slate-500/30 to-slate-700/10",
  2: "from-cyan-500/30 to-cyan-700/10",
  3: "from-violet-500/30 to-violet-700/10",
  4: "from-amber-400/30 to-rose-500/10",
  5: "from-rose-500/40 to-amber-300/10",
} as const;

export function AgentPassportCard({
  nickname,
  province,
  primaryTool,
  tools,
  level,
  levelName,
  avatarSeed,
  compact = false,
  showGlow = true,
  className = "",
}: AgentPassportCardProps) {
  const accent = toolColor(primaryTool);
  const avatarSize = compact ? 96 : 176;
  return (
    <CyberCard
      variant="highlight"
      className={`relative overflow-hidden p-4 sm:p-6 ${className}`}
      style={{ borderColor: `${accent}40` }}
    >
      {showGlow ? (
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r ${LEVEL_GRADIENT[level as 1 | 2 | 3 | 4 | 5] ?? LEVEL_GRADIENT[1]}`}
        />
      ) : null}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse at top right, ${accent}1a, transparent 60%)`,
        }}
      />
      <div className={`relative flex ${compact ? "flex-row items-center gap-4" : "flex-col items-center gap-4"}`}>
        <div
          className="relative shrink-0 overflow-hidden rounded-2xl ring-2"
          style={{ width: avatarSize, height: avatarSize, boxShadow: `0 0 32px -8px ${accent}66`, "--tw-ring-color": `${accent}55` } as React.CSSProperties}
        >
          <div
            className="h-full w-full"
            dangerouslySetInnerHTML={{ __html: generateAvatarSvg(avatarSeed, avatarSize, level, primaryTool) }}
          />
        </div>
        <div className={`min-w-0 ${compact ? "flex-1" : "w-full text-center"}`}>
          {!compact ? (
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1"
              style={{ color: accent, backgroundColor: `${accent}14`, boxShadow: `0 0 12px -4px ${accent}`, borderColor: `${accent}33` }}
            >
              L{level} · {levelName}
            </span>
          ) : null}
          <h3 className={`mt-1 truncate font-semibold text-slate-50 ${compact ? "text-base" : "text-lg"}`}>
            {nickname}
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            <span style={{ color: accent }}>{primaryTool}</span> · {province}
          </p>
          {!compact && tools.length > 0 ? (
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {tools.slice(0, 6).map((t) => (
                <ToolBadge key={t} name={t} size="sm" />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </CyberCard>
  );
}
