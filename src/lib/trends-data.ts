import type { TrendsSnapshot, ToolTrend, TrendsMatrix, TrendDirection } from "./types";

/**
 * Trend data layer for /trends.
 *
 * Currently mock. The shape is intentionally close to what a real API
 * would return so the page can switch to live data by replacing
 * `getTrends()` with a `fetch()` call in the future.
 */

const CATEGORY_LABELS: Record<ToolTrend["category"], string> = {
  agent: "编程 Agent",
  app: "通用 AI",
  automation: "自动化 Agent",
  local: "本地模型",
};

export function getCategoryLabel(category: ToolTrend["category"]): string {
  return CATEGORY_LABELS[category];
}

const TOOL_SEED: Array<Omit<ToolTrend, "id" | "heat" | "direction">> = [
  { name: "Codex", category: "agent", users: 188, growthRate: 18.4 },
  { name: "Claude Code", category: "agent", users: 174, growthRate: 22.1 },
  { name: "OpenCode", category: "agent", users: 132, growthRate: 31.6 },
  { name: "Cursor", category: "agent", users: 121, growthRate: 14.8 },
  { name: "DeepSeek", category: "app", users: 168, growthRate: 9.4 },
  { name: "豆包", category: "app", users: 152, growthRate: 6.1 },
  { name: "通义千问", category: "app", users: 110, growthRate: 3.2 },
  { name: "Kimi", category: "app", users: 96, growthRate: 4.4 },
  { name: "Cherry Studio", category: "app", users: 78, growthRate: 27.3 },
  { name: "Dify", category: "automation", users: 64, growthRate: 12.7 },
];

function directionFor(growth: number): TrendDirection {
  if (growth >= 15) return "up";
  if (growth < 4) return "down";
  return "stable";
}

export function champion(snapshot: TrendsSnapshot): ToolTrend | null {
  return snapshot.tools[0] ?? null;
}

function buildTools(): ToolTrend[] {
  const maxUsers = Math.max(...TOOL_SEED.map((t) => t.users));
  return TOOL_SEED.map((t, i) => ({
    id: `tool-${i}-${t.name}`,
    name: t.name,
    category: t.category,
    users: t.users,
    growthRate: t.growthRate,
    heat: Math.round((t.users / maxUsers) * 100),
    direction: directionFor(t.growthRate),
  })).sort((a, b) => b.users - a.users);
}

const MATRIX_SEED: Array<Omit<TrendsMatrix, "label">> = [
  {
    id: "code-agent",
    title: "代码 Agent",
    description: "Codex、Claude Code 主导的代码生成与重构工作流。",
    heat: 96,
    direction: "up",
    tools: ["Codex", "Claude Code", "OpenCode", "Cursor"],
  },
  {
    id: "writing-agent",
    title: "写作 Agent",
    description: "通用大模型驱动的写作、翻译、内容润色场景。",
    heat: 82,
    direction: "stable",
    tools: ["豆包", "DeepSeek", "通义千问", "Kimi"],
  },
  {
    id: "automation",
    title: "自动化工作流",
    description: "Dify、n8n 等低代码工作流编排系统。",
    heat: 74,
    direction: "up",
    tools: ["Dify", "n8n"],
  },
  {
    id: "local-llm",
    title: "本地模型",
    description: "Ollama、Cherry Studio 等本地推理与桌面客户端。",
    heat: 68,
    direction: "up",
    tools: ["Ollama", "Cherry Studio"],
  },
  {
    id: "knowledge-base",
    title: "知识库工具",
    description: "RAG、知识库问答、私域知识检索系统。",
    heat: 52,
    direction: "stable",
    tools: ["Dify", "Cherry Studio"],
  },
  {
    id: "multimodal",
    title: "多模态工具",
    description: "图片理解、语音、视频等多模态生成与处理。",
    heat: 61,
    direction: "up",
    tools: ["豆包", "Gemini", "Claude"],
  },
];

function labelFor(heat: number, direction: TrendDirection): TrendsMatrix["label"] {
  if (heat >= 90 && direction === "up") return "Exploding";
  if (direction === "up") return "Rising";
  if (direction === "down") return "Cooling";
  return "Stable";
}

function buildMatrix(): TrendsMatrix[] {
  return MATRIX_SEED.map((m) => ({
    ...m,
    label: labelFor(m.heat, m.direction),
  }));
}

const TIMELINE_BASE = [
  { day: "周一", signals: 312, active: 1240 },
  { day: "周二", signals: 286, active: 1196 },
  { day: "周三", signals: 348, active: 1322 },
  { day: "周四", signals: 402, active: 1380 },
  { day: "周五", signals: 476, active: 1412 },
  { day: "周六", signals: 388, active: 1354 },
  { day: "周日", signals: 442, active: 1398 },
];

const ROLE_DISTRIBUTION = [
  { role: "代码指挥官", share: 0.32, tone: "#22d3ee" },
  { role: "自动化玩家", share: 0.21, tone: "#a855f7" },
  { role: "内容生产者", share: 0.18, tone: "#ec4899" },
  { role: "本地模型驯养师", share: 0.14, tone: "#10b981" },
  { role: "知识库构建者", share: 0.09, tone: "#f59e0b" },
  { role: "其他", share: 0.06, tone: "#94a3b8" },
];

function buildSnapshot(): TrendsSnapshot {
  const tools = buildTools();
  const champion = tools[0];
  const fastest = [...tools].sort((a, b) => b.growthRate - a.growthRate)[0];
  return {
    generatedAt: new Date().toISOString(),
    todayNewSignals: 84,
    fastestGrowing: fastest?.name ?? "Codex",
    fastestGrowthRate: fastest?.growthRate ?? 0,
    mostActiveScene: "代码 Agent",
    totalTools: tools.length,
    agentShare: Math.round((tools.filter((t) => t.category === "agent").length / tools.length) * 100),
    tools,
    matrix: buildMatrix(),
    timeline: TIMELINE_BASE,
    roleDistribution: ROLE_DISTRIBUTION,
  };
}

let cached: TrendsSnapshot | null = null;

export function getTrends(): TrendsSnapshot {
  if (cached) return cached;
  cached = buildSnapshot();
  return cached;
}

export function topRisingTools(snapshot: TrendsSnapshot, limit = 4): ToolTrend[] {
  return [...snapshot.tools].sort((a, b) => b.growthRate - a.growthRate).slice(0, limit);
}