export function hasPositiveData(value?: number | null) {
  return typeof value === "number" && value > 0;
}

export function displayCount(value?: number | null, fallback = "—") {
  if (!hasPositiveData(value)) return fallback;
  return Number(value).toLocaleString("zh-CN");
}

export function displayLevel(level?: number | null) {
  if (!hasPositiveData(level)) return "—";
  return `Lv.${String(level).padStart(2, "0")}`;
}

export function hasOverviewData(overview?: { total?: number | null } | null) {
  return hasPositiveData(overview?.total);
}

export function dataModeLabel(hasRealData: boolean) {
  return hasRealData ? "真实数据" : "演示数据";
}

export function positiveOrDemo<T>(items: T[], hasRealData: boolean, demoItems: T[]) {
  return hasRealData && items.length > 0 ? items : demoItems;
}
