import { toolColor } from "@/data/mock";

type ToolBadgeProps = {
  name: string;
  size?: "sm" | "md" | "lg";
  active?: boolean;
  onClick?: () => void;
  count?: number;
};

const SIZE_CLASS = {
  sm: "px-2.5 py-1 text-[11px] gap-1.5",
  md: "px-3 py-1.5 text-xs gap-2",
  lg: "px-3.5 py-2 text-sm gap-2.5",
} as const;

export function ToolBadge({ name, size = "md", active = false, onClick, count }: ToolBadgeProps) {
  const color = toolColor(name);
  const style = {
    color,
    backgroundColor: active ? `${color}22` : `${color}0d`,
    borderColor: active ? `${color}66` : `${color}33`,
    boxShadow: active ? `0 0 16px -4px ${color}80` : undefined,
  } as const;

  const Component = onClick ? "button" : "span";

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      style={style}
      className={`inline-flex items-center rounded-full border font-medium tracking-wide transition-colors ${
        onClick ? "cursor-pointer hover:brightness-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22d3ee]/60" : ""
      } ${SIZE_CLASS[size]}`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
        aria-hidden
      />
      {name}
      {typeof count === "number" ? (
        <span className="font-mono text-[10px] opacity-80">{count}</span>
      ) : null}
    </Component>
  );
}
