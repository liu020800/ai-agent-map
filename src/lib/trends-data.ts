import type { TrendsSnapshot, ToolTrend, TrendsMatrix, TrendDirection } from "./types";
import type { RankingData } from "./api-client";

/**
 * Trend data layer for /trends.
 *
 * Trend data layer for /trends. The default snapshot is an empty real-data
 * state; `buildTrendsFromRanking` turns live Supabase aggregation into the
 * visual model used by the page.
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

export function champion(snapshot: TrendsSnapshot): ToolTrend | null {
  return snapshot.tools[0] ?? null;
}

const MATRIX_DEFS: Array<Omit<TrendsMatrix, "label" | "heat" | "direction">> = [
  {
    id: "code-agent",
    title: "代码 Agent",
    description: "Codex、Claude Code 主导的代码生成与重构工作流。",
    tools: ["Codex", "Claude Code", "OpenCode", "Cursor"],
  },
  {
    id: "writing-agent",
    title: "写作 Agent",
    description: "通用大模型驱动的写作、翻译、内容润色场景。",
    tools: ["豆包", "DeepSeek", "通义千问", "Kimi"],
  },
  {
    id: "automation",
    title: "自动化工作流",
    description: "Dify、n8n 等低代码工作流编排系统。",
    tools: ["Dify", "n8n"],
  },
  {
    id: "local-llm",
    title: "本地模型",
    description: "Ollama、Cherry Studio 等本地推理与桌面客户端。",
    tools: ["Ollama", "Cherry Studio"],
  },
  {
    id: "knowledge-base",
    title: "知识库工具",
    description: "RAG、知识库问答、私域知识检索系统。",
    tools: ["Dify", "Cherry Studio"],
  },
  {
    id: "multimodal",
    title: "多模态工具",
    description: "图片理解、语音、视频等多模态生成与处理。",
    tools: ["豆包", "Gemini", "Claude"],
  },
];

function labelFor(heat: number, direction: TrendDirection): TrendsMatrix["label"] {
  if (heat >= 90 && direction === "up") return "Exploding";
  if (direction === "up") return "Rising";
  if (direction === "down") return "Cooling";
  return "Stable";
}

function buildMatrix(tools: ToolTrend[]): TrendsMatrix[] {
  const toolMap = new Map(tools.map((tool) => [tool.name, tool.users]));
  const max = Math.max(...tools.map((tool) => tool.users), 1);
  return MATRIX_DEFS.map((m) => {
    const users = m.tools.reduce((sum, tool) => sum + (toolMap.get(tool) ?? 0), 0);
    const heat = Math.round((users / max) * 100);
    const direction = heat > 0 ? "stable" : "down";
    return {
    ...m,
    heat,
    direction,
    label: labelFor(heat, direction),
  };
  });
}

const ROLE_TONES = ["#22d3ee", "#a855f7", "#ec4899", "#10b981", "#f59e0b", "#94a3b8"];

function categoryForTool(name: string): ToolTrend["category"] {
  if (["Codex", "Claude Code", "OpenCode", "Cursor", "OpenClaw", "Hermes"].includes(name)) return "agent";
  if (["Dify", "n8n"].includes(name)) return "automation";
  if (["Ollama", "Cherry Studio"].includes(name)) return "local";
  return "app";
}

function buildEmptySnapshot(): TrendsSnapshot {
  return {
    generatedAt: new Date().toISOString(),
    todayNewSignals: 0,
    fastestGrowing: "待点亮",
    fastestGrowthRate: 0,
    mostActiveScene: "待点亮",
    totalTools: 0,
    agentShare: 0,
    tools: [],
    matrix: buildMatrix([]),
    timeline: [],
    roleDistribution: [],
  };
}

export function getTrends(): TrendsSnapshot {
  return buildEmptySnapshot();
}

export function buildTrendsFromRanking(ranking: RankingData | null): TrendsSnapshot {
  if (!ranking) return buildEmptySnapshot();
  const maxUsers = Math.max(...ranking.tools.map((tool) => tool.count), 1);
  const tools = ranking.tools.map((tool, index) => ({
    id: `tool-${index}-${tool.name}`,
    name: tool.name,
    category: categoryForTool(tool.name),
    users: tool.count,
    growthRate: 0,
    heat: Math.round((tool.count / maxUsers) * 100),
    direction: "stable" as TrendDirection,
  })).sort((a, b) => b.users - a.users);
  const topTool = tools[0];
  const roleTotal = Math.max(ranking.roles.reduce((sum, role) => sum + role.count, 0), 1);
  const roleDistribution = ranking.roles.slice(0, 6).map((role, index) => ({
    role: role.role,
    share: role.count / roleTotal,
    tone: ROLE_TONES[index] ?? "#94a3b8",
  }));
  return {
    generatedAt: new Date().toISOString(),
    todayNewSignals: ranking.overview.todayNew,
    fastestGrowing: topTool?.name ?? "待点亮",
    fastestGrowthRate: 0,
    mostActiveScene: ranking.roles[0]?.role ?? "待点亮",
    totalTools: tools.length,
    agentShare: ranking.overview.total > 0 ? Math.round((ranking.overview.agentUsers / ranking.overview.total) * 100) : 0,
    tools,
    matrix: buildMatrix(tools),
    timeline: ranking.timeline ?? [],
    roleDistribution,
  };
}

export function topRisingTools(snapshot: TrendsSnapshot, limit = 4): ToolTrend[] {
  return [...snapshot.tools].sort((a, b) => b.users - a.users).slice(0, limit);
}
