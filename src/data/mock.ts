// Centralized mock data for AI Agent Map.
// Used as fallback when /api/* endpoints return empty or fail.
// Replace usage gradually by binding to real Supabase data.

export type ToolEntry = { name: string; count: number; category?: "agent" | "app" };
export type ProvinceEntry = { name: string; value: number };
export type LevelEntry = { level: number; count: number };
export type RecentCardEntry = {
  nickname: string;
  province: string;
  primary_tool: string;
  tools: string[];
  ai_level: number;
  ai_level_name: string;
  avatar_seed: string;
  card_slug: string;
  created_at: string | null;
};
export type OverviewEntry = {
  total: number;
  agentUsers: number;
  appUsers: number;
  todayNew: number;
};

export const MOCK_OVERVIEW: OverviewEntry = {
  total: 1280,
  agentUsers: 326,
  appUsers: 954,
  todayNew: 42,
};

export const MOCK_TOOLS: ToolEntry[] = [
  { name: "Codex", count: 88, category: "agent" },
  { name: "Claude Code", count: 76, category: "agent" },
  { name: "OpenCode", count: 55, category: "agent" },
  { name: "DeepSeek", count: 49, category: "app" },
  { name: "豆包", count: 44, category: "app" },
  { name: "Cursor", count: 38, category: "agent" },
  { name: "Dify", count: 32, category: "agent" },
  { name: "Kimi", count: 28, category: "app" },
  { name: "n8n", count: 24, category: "agent" },
  { name: "通义千问", count: 22, category: "app" },
];

export const MOCK_PROVINCES: ProvinceEntry[] = [
  { name: "上海", value: 32 },
  { name: "广东", value: 25 },
  { name: "北京", value: 22 },
  { name: "浙江", value: 18 },
  { name: "江苏", value: 16 },
  { name: "四川", value: 12 },
  { name: "湖北", value: 10 },
  { name: "福建", value: 9 },
  { name: "湖南", value: 8 },
  { name: "陕西", value: 7 },
];

export const MOCK_LEVELS: LevelEntry[] = [
  { level: 1, count: 188 },
  { level: 2, count: 372 },
  { level: 3, count: 410 },
  { level: 4, count: 226 },
  { level: 5, count: 84 },
];

export const MOCK_RECENT_CARDS: RecentCardEntry[] = [
  { nickname: "Agent_0x1", province: "上海", primary_tool: "Codex", tools: ["Codex", "Claude Code"], ai_level: 4, ai_level_name: "L4 Agent 工作流玩家", avatar_seed: "agent-alpha-001", card_slug: "", created_at: null },
  { nickname: "PromptFox", province: "北京", primary_tool: "DeepSeek", tools: ["DeepSeek", "豆包"], ai_level: 3, ai_level_name: "L3 AI 工具组合用户", avatar_seed: "agent-beta-002", card_slug: "", created_at: null },
  { nickname: "FlowSmith", province: "广东", primary_tool: "n8n", tools: ["n8n", "Dify"], ai_level: 5, ai_level_name: "L5 本地 AI 系统玩家", avatar_seed: "agent-gamma-003", card_slug: "", created_at: null },
  { nickname: "CodeNova", province: "浙江", primary_tool: "Claude Code", tools: ["Claude Code", "Codex"], ai_level: 4, ai_level_name: "L4 Agent 工作流玩家", avatar_seed: "agent-delta-004", card_slug: "", created_at: null },
];

export const MOCK_TREND_DELTAS = {
  champion: "Codex",
  runnerUp: "Claude Code",
  fastest: "Cursor",
  emerging: "OpenCode",
};

export const TOOL_COLOR_MAP: Record<string, string> = {
  Codex: "#22d3ee",
  "Claude Code": "#a855f7",
  OpenCode: "#00ffc8",
  DeepSeek: "#3b82f6",
  豆包: "#f59e0b",
  Cursor: "#8b5cf6",
  Windsurf: "#06b6d4",
  Copilot: "#6366f1",
  Kimi: "#fb7185",
  Qwen: "#84cc16",
  Dify: "#10b981",
  n8n: "#ec4899",
  Trae: "#0ea5e9",
  CodeBuddy: "#f43f5e",
  Hermes: "#14b8a6",
  OpenClaw: "#eab308",
  ChatGPT: "#10a37f",
  Claude: "#d97706",
  Gemini: "#4285f4",
  通义千问: "#615ced",
  腾讯元宝: "#0c8aff",
};

export function toolColor(name: string, fallback = "#22d3ee"): string {
  return TOOL_COLOR_MAP[name] ?? fallback;
}
