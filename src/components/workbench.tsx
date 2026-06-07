import type { HTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function WorkbenchHeader({
  eyebrow,
  title,
  description,
  actions,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-end lg:justify-between ${className}`}>
      <div>
        {eyebrow ? <p className="app-soft text-xs font-medium tracking-[0.12em]">{eyebrow}</p> : null}
        <h1 className="app-heading mt-2 text-3xl font-medium tracking-[-0.03em] sm:text-4xl">{title}</h1>
        {description ? <p className="app-muted mt-3 max-w-2xl text-sm leading-6 sm:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

export function SectionCard({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`app-card rounded-xl p-5 sm:p-6 ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function DataNotice({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm leading-6 ${className}`} style={{ background: "color-mix(in srgb, var(--app-primary) 8%, var(--app-surface-strong))", borderColor: "var(--app-border)", color: "var(--app-text-muted)" }}>
      {children}
    </div>
  );
}

export function WorkbenchStat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon?: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <SectionCard className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="app-muted text-sm font-medium">{label}</p>
          <p className="app-heading mt-2 text-2xl font-medium">{value}</p>
        </div>
        {Icon ? (
          <span className="app-card-muted flex h-10 w-10 items-center justify-center rounded-lg">
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
      {hint ? <p className="app-soft mt-3 text-xs">{hint}</p> : null}
    </SectionCard>
  );
}
