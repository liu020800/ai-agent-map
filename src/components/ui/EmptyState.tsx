import type { LucideIcon } from "lucide-react";
import { CyberCard } from "./CyberCard";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  cta?: { label: string; onClick?: () => void; href?: string };
};

export function EmptyState({ icon: Icon, title, description, cta }: EmptyStateProps) {
  return (
    <CyberCard
      variant="subtle"
      className="flex min-h-[280px] flex-col items-center justify-center gap-4 p-8 text-center"
      role="status"
    >
      {Icon ? (
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-400">
          <Icon size={22} strokeWidth={1.4} />
        </span>
      ) : null}
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold text-gray-950 sm:text-lg">{title}</h3>
        {description ? <p className="max-w-md text-sm text-gray-500">{description}</p> : null}
      </div>
      {cta ? (
        cta.href ? (
          <a
            href={cta.href}
            className="mt-1 inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
          >
            {cta.label}
          </a>
        ) : (
          <button
            type="button"
            onClick={cta.onClick}
            className="mt-1 inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
          >
            {cta.label}
          </button>
        )
      ) : null}
    </CyberCard>
  );
}
