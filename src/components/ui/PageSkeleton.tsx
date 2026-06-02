type SkeletonProps = {
  className?: string;
  style?: React.CSSProperties;
};

export function Skeleton({ className = "", style }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-white/[0.04] [animation-duration:1.4s] ${className}`}
      style={style}
      aria-hidden
    />
  );
}

export function PageSkeletonMap() {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_300px]">
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.01] p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[88px]" />
          ))}
        </div>
        <div className="mt-6 flex h-[420px] items-center justify-center">
          <Skeleton className="h-[400px] w-full max-w-[640px] rounded-2xl" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    </div>
  );
}

export function PageSkeletonList({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.01] px-3 py-3"
        >
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeletonChart() {
  return (
    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.01] p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5" style={{ width: `${50 + (i % 5) * 8}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}
