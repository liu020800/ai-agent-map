import type { RankingData, LatestCard, TimelineEntry } from "@/lib/api-client";
import type { TrendsSnapshot } from "@/lib/types";

export const demoOverview = {
  total: 1024,
  agentUsers: 642,
  appUsers: 382,
  todayNew: 42,
};

export const DEMO_OVERVIEW = {
  ...demoOverview,
  topProvince: "广东",
  topTool: "Codex",
};

export const demoTools = [
  { name: "Codex", count: 188 },
  { name: "Claude Code", count: 162 },
  { name: "OpenCode", count: 128 },
  { name: "DeepSeek", count: 142 },
  { name: "豆包", count: 118 },
  { name: "Kimi", count: 84 },
  { name: "Dify", count: 88 },
  { name: "n8n", count: 64 },
  { name: "Ollama", count: 56 },
];

export const demoProvinces = [
  { name: "广东", value: 312 },
  { name: "上海", value: 248 },
  { name: "北京", value: 256 },
  { name: "浙江", value: 196 },
  { name: "江苏", value: 172 },
  { name: "四川", value: 138 },
  { name: "湖北", value: 116 },
  { name: "山东", value: 102 },
  { name: "河南", value: 88 },
  { name: "陕西", value: 82 },
];

export const DEMO_PROVINCES = [
  { province: "广东", users: 188, cityCount: 9, topTool: "Codex", growthRate: 16 },
  { province: "北京", users: 164, cityCount: 6, topTool: "Claude Code", growthRate: 12 },
  { province: "上海", users: 152, cityCount: 5, topTool: "Cursor", growthRate: 18 },
  { province: "浙江", users: 136, cityCount: 7, topTool: "Dify", growthRate: 14 },
  { province: "江苏", users: 121, cityCount: 8, topTool: "DeepSeek", growthRate: 11 },
  { province: "四川", users: 96, cityCount: 5, topTool: "Kimi", growthRate: 9 },
];

export const demoCities = [
  { city: "上海", province: "上海", count: 184, topRole: "代码指挥官", topTool: "Codex" },
  { city: "深圳", province: "广东", count: 142, topRole: "自动化玩家", topTool: "n8n" },
  { city: "杭州", province: "浙江", count: 128, topRole: "知识库构建者", topTool: "Dify" },
  { city: "北京", province: "北京", count: 156, topRole: "本地模型驯养师", topTool: "Ollama" },
  { city: "成都", province: "四川", count: 84, topRole: "内容生产者", topTool: "Kimi" },
];

export const DEMO_CITY_SIGNALS = [
  { time: "12:31", city: "上海", role: "代码指挥官", tool: "Codex" },
  { time: "12:28", city: "深圳", role: "自动化玩家", tool: "n8n" },
  { time: "12:22", city: "杭州", role: "知识库构建者", tool: "Dify" },
  { time: "12:16", city: "北京", role: "本地模型驯养师", tool: "Ollama" },
];

export const DEMO_TOOLS = [
  { name: "Codex", users: 256, heat: 92 },
  { name: "Claude Code", users: 214, heat: 84 },
  { name: "DeepSeek", users: 188, heat: 78 },
  { name: "豆包", users: 166, heat: 72 },
  { name: "Kimi", users: 132, heat: 63 },
];

export const demoRoles = [
  { role: "代码指挥官", count: 326, topTool: "Codex" },
  { role: "自动化玩家", count: 214, topTool: "n8n" },
  { role: "本地模型驯养师", count: 142, topTool: "Ollama" },
  { role: "知识库构建者", count: 116, topTool: "Dify" },
  { role: "内容生产者", count: 184, topTool: "Kimi" },
];

export const demoLevels = [
  { level: 3, count: 260 },
  { level: 4, count: 318 },
  { level: 5, count: 226 },
  { level: 6, count: 144 },
  { level: 7, count: 76 },
];

export const demoTrend7Days: TimelineEntry[] = [
  { day: "06-01", signals: 108, active: 78 },
  { day: "06-02", signals: 126, active: 88 },
  { day: "06-03", signals: 142, active: 96 },
  { day: "06-04", signals: 165, active: 112 },
  { day: "06-05", signals: 188, active: 136 },
  { day: "06-06", signals: 214, active: 158 },
  { day: "06-07", signals: 236, active: 174 },
];

export const demoRankingData: RankingData = {
  tools: demoTools,
  provinces: demoProvinces,
  cities: demoCities,
  roles: demoRoles,
  levels: demoLevels,
  timeline: demoTrend7Days,
  overview: demoOverview,
  filters: { userType: "all", tool: "" },
};

export const demoPassports: LatestCard[] = [
  { nickname: "QuantumCat", province: "上海", city: "上海", role: "代码指挥官", primary_tool: "Codex", tools: ["Codex", "Claude Code"], ai_level: 7, ai_level_name: "Lv.07", avatar_seed: "demo-quantum-cat", card_slug: "demo-quantum-cat", created_at: null },
  { nickname: "FlowSmith", province: "广东", city: "深圳", role: "自动化玩家", primary_tool: "n8n", tools: ["n8n", "Dify"], ai_level: 5, ai_level_name: "Lv.05", avatar_seed: "demo-flow-smith", card_slug: "demo-flow-smith", created_at: null },
  { nickname: "RAG_Zero", province: "浙江", city: "杭州", role: "知识库构建者", primary_tool: "Dify", tools: ["Dify", "Codex"], ai_level: 6, ai_level_name: "Lv.06", avatar_seed: "demo-rag-zero", card_slug: "demo-rag-zero", created_at: null },
  { nickname: "ByteTamer", province: "四川", city: "成都", role: "内容生产者", primary_tool: "Kimi", tools: ["Kimi", "DeepSeek"], ai_level: 5, ai_level_name: "Lv.05", avatar_seed: "demo-byte-tamer", card_slug: "demo-byte-tamer", created_at: null },
];

export const demoTrendsSnapshot: TrendsSnapshot = {
  generatedAt: "演示趋势",
  todayNewSignals: 42,
  fastestGrowing: "OpenCode",
  fastestGrowthRate: 42,
  mostActiveScene: "代码协作",
  totalTools: demoTools.length,
  agentShare: 63,
  tools: [
    { id: "trend-codex", name: "Codex", category: "agent", users: 188, growthRate: 24, heat: 96, direction: "up" },
    { id: "trend-claude-code", name: "Claude Code", category: "agent", users: 162, growthRate: 31, heat: 88, direction: "up" },
    { id: "trend-opencode", name: "OpenCode", category: "agent", users: 128, growthRate: 42, heat: 76, direction: "up" },
    { id: "trend-deepseek", name: "DeepSeek", category: "app", users: 142, growthRate: 12, heat: 72, direction: "stable" },
    { id: "trend-dify", name: "Dify", category: "automation", users: 88, growthRate: 22, heat: 64, direction: "up" },
    { id: "trend-ollama", name: "Ollama", category: "local", users: 56, growthRate: 28, heat: 58, direction: "up" },
  ],
  matrix: [
    { id: "code-agent", title: "代码协作", description: "终端、IDE 与代码 Agent 工作流", heat: 92, direction: "up", label: "Exploding", tools: ["Codex", "Claude Code", "OpenCode"] },
    { id: "automation", title: "自动化工作流", description: "用节点和 Agent 串联日常任务", heat: 74, direction: "up", label: "Rising", tools: ["n8n", "Dify"] },
    { id: "local-llm", title: "本地模型", description: "在本地设备上运行和调试模型", heat: 61, direction: "up", label: "Rising", tools: ["Ollama", "LM Studio"] },
    { id: "knowledge-base", title: "知识库", description: "搭建个人或团队知识问答", heat: 68, direction: "stable", label: "Stable", tools: ["Dify", "RAGFlow"] },
  ],
  timeline: demoTrend7Days,
  roleDistribution: [
    { role: "代码指挥官", share: 0.32, tone: "#111111" },
    { role: "自动化玩家", share: 0.21, tone: "#525252" },
    { role: "本地模型驯养师", share: 0.16, tone: "#737373" },
    { role: "知识库构建者", share: 0.14, tone: "#a1a1a1" },
    { role: "内容生产者", share: 0.17, tone: "#d4d4d4" },
  ],
};
