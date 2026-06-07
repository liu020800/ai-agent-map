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
        {eyebrow ? <p className="text-xs font-medium tracking-[0.12em] text-neutral-500">{eyebrow}</p> : null}
        <h1 className="mt-2 text-3xl font-medium tracking-[-0.03em] text-neutral-950 sm:text-4xl">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

export function SectionCard({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-xl border border-neutral-200 bg-white p-5 sm:p-6 ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function DataNotice({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900 ${className}`}>
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
          <p className="text-sm font-medium text-neutral-500">{label}</p>
          <p className="mt-2 text-2xl font-medium text-neutral-950">{value}</p>
        </div>
        {Icon ? (
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
      {hint ? <p className="mt-3 text-xs text-neutral-500">{hint}</p> : null}
    </SectionCard>
  );
}
