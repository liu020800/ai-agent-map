export function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function hasPositiveData(value?: number | null) {
  return isPositiveNumber(value);
}

export function displayCount(value: unknown, fallback = "—") {
  return isPositiveNumber(value) ? value.toLocaleString("zh-CN") : fallback;
}

export function displayPlus(value: unknown, fallback = "即将点亮") {
  return isPositiveNumber(value) ? `+${value}` : fallback;
}

export function displayLevel(value: unknown, fallback = "—") {
  return isPositiveNumber(value) ? `Lv.${String(value).padStart(2, "0")}` : fallback;
}

export function displayPercent(value: unknown, fallback = "—") {
  return isPositiveNumber(value) ? `${value}%` : fallback;
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
