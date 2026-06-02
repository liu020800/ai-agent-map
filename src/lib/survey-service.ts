import type { SurveyFormPayload } from "./types";

/**
 * Survey data + service layer.
 *
 * Centralized so that when the real API ships we only swap
 * `submitSurvey` / `generateIdentityCard` to fetch calls.
 */

export const SURVEY_TOOLS: { id: string; name: string; category: "agent" | "app" | "automation" | "local"; desc: string; tone: string }[] = [
  { id: "codex", name: "Codex", category: "agent", desc: "OpenAI 出品的代码 Agent", tone: "#22d3ee" },
  { id: "claude-code", name: "Claude Code", category: "agent", desc: "Anthropic 终端编码工作流", tone: "#a855f7" },
  { id: "opencode", name: "OpenCode", category: "agent", desc: "开源本地化 AI 编码环境", tone: "#00ffc8" },
  { id: "cursor", name: "Cursor", category: "agent", desc: "AI-first 编辑器", tone: "#8b5cf6" },
  { id: "deepseek", name: "DeepSeek", category: "app", desc: "国产高性价比通用大模型", tone: "#3b82f6" },
  { id: "doubao", name: "豆包", category: "app", desc: "字节跳动通用 AI 助手", tone: "#f59e0b" },
  { id: "kimi", name: "Kimi", category: "app", desc: "长上下文阅读专家", tone: "#fb7185" },
  { id: "qwen", name: "通义千问", category: "app", desc: "阿里云通义大模型", tone: "#615ced" },
  { id: "cherry-studio", name: "Cherry Studio", category: "local", desc: "多模型聚合桌面客户端", tone: "#10b981" },
  { id: "dify", name: "Dify", category: "automation", desc: "低代码 LLM 工作流编排", tone: "#06b6d4" },
  { id: "n8n", name: "n8n", category: "automation", desc: "可编程的自动化工作流", tone: "#ec4899" },
  { id: "ollama", name: "Ollama", category: "local", desc: "本地大模型推理引擎", tone: "#84cc16" },
];

export const SURVEY_SCENARIOS: { id: string; name: string; desc: string; tone: string }[] = [
  { id: "code", name: "写代码", desc: "代码生成、重构、Code Review", tone: "#22d3ee" },
  { id: "article", name: "写文章", desc: "公众号、博客、推文、脚本", tone: "#a855f7" },
  { id: "automation", name: "自动化工作流", desc: "定时任务、跨服务编排", tone: "#10b981" },
  { id: "data-analysis", name: "数据分析", desc: "SQL、可视化、商业洞察", tone: "#f59e0b" },
  { id: "web-dev", name: "网站开发", desc: "前端、后端、全栈", tone: "#3b82f6" },
  { id: "knowledge-base", name: "知识库问答", desc: "RAG、私域知识检索", tone: "#06b6d4" },
  { id: "local-llm", name: "本地模型部署", desc: "Ollama、量化、GPU 加速", tone: "#84cc16" },
  { id: "nas-docker", name: "NAS / Docker 运维", desc: "自托管、容器化、监控", tone: "#fb7185" },
  { id: "invest", name: "投资分析", desc: "财报、研报、量化信号", tone: "#fbbf24" },
  { id: "learning", name: "学习研究", desc: "论文、笔记、知识整理", tone: "#8b5cf6" },
];

export const SURVEY_PROVINCES = [
  "北京", "上海", "广东", "浙江", "江苏", "四川", "湖北", "福建", "湖南", "陕西",
  "重庆", "天津", "辽宁", "山东", "河南", "安徽", "河北", "江西", "云南", "其他",
];

/**
 * Derived from the selected scenarios. Returns a label, accent and a
 * short narrative blurb that can be displayed on the identity card.
 */
export function deriveRole(scenarios: string[]): { title: string; tone: string; description: string } {
  const set = new Set(scenarios);
  if (set.has("code") && (set.has("automation") || set.has("web-dev"))) {
    return { title: "代码指挥官", tone: "#22d3ee", description: "在 IDE 与终端之间调度 AI Agent，重塑生产流水线。" };
  }
  if (set.has("automation") || set.has("nas-docker")) {
    return { title: "自动化玩家", tone: "#a855f7", description: "用工作流串联工具链，让机器替你完成重复劳动。" };
  }
  if (set.has("knowledge-base") || set.has("local-llm")) {
    return { title: "本地模型驯养师", tone: "#10b981", description: "把大模型装进 NAS、矿机与笔记本，掌控自己的智能。" };
  }
  if (set.has("data-analysis") || set.has("invest")) {
    return { title: "数据分析师", tone: "#f59e0b", description: "在 SQL、财报、量化信号里寻找下一个真相。" };
  }
  if (set.has("article") || set.has("learning")) {
    return { title: "内容生产者", tone: "#ec4899", description: "把灵感、笔记和创作交给 AI，把风格留给自己。" };
  }
  return { title: "AI 探索者", tone: "#94a3b8", description: "走在 AI 工具的最前沿，等待下一个新大陆。" };
}

/**
 * Lightweight deterministic level calc so the survey can preview an
 * identity card without contacting the server. The values intentionally
 * mirror the matrix used elsewhere on the site (L1 → L5).
 */
export function deriveAgentLevel(tools: string[], userType: SurveyFormPayload["userType"]): number {
  if (!tools.length) return 1;
  const agentTools = SURVEY_TOOLS.filter((t) => t.category === "agent").map((t) => t.name);
  const automationTools = SURVEY_TOOLS.filter((t) => t.category === "automation").map((t) => t.name);
  const localTools = SURVEY_TOOLS.filter((t) => t.category === "local").map((t) => t.name);
  const agentHits = tools.filter((t) => agentTools.includes(t)).length;
  const automationHits = tools.filter((t) => automationTools.includes(t)).length;
  const localHits = tools.filter((t) => localTools.includes(t)).length;
  if (userType === "agent" && (agentHits >= 3 || automationHits >= 2 || (agentHits >= 1 && localHits >= 1))) return 5;
  if (userType === "agent" && (agentHits >= 1 || automationHits >= 1 || localHits >= 1)) return 4;
  if (tools.length >= 3) return 3;
  if (tools.length >= 1) return 2;
  return 1;
}

export function deriveSignalStrength(level: number, scenarioCount: number): number {
  const base = 220 + level * 1680;
  return Math.min(9999, base + scenarioCount * 220);
}

export function generateIdentityId(): string {
  const year = new Date().getFullYear();
  const tail = Math.floor(Math.random() * 9000 + 1000).toString();
  return `AAM-${year}-${tail}`;
}

export function buildIdentityId(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const code = Math.abs(h).toString().padStart(4, "0").slice(-4);
  return `AAM-${new Date().getFullYear()}-${code}`;
}

/**
 * Service method placeholder. In production this will POST to
 * /api/survey/submit (Cloudflare Function) and return the persisted
 * record. For now we return a synthetic success so the UI flow works.
 */
export async function submitSurvey(payload: SurveyFormPayload): Promise<{ identityId: string; createdAt: string }> {
  void payload;
  await new Promise((resolve) => setTimeout(resolve, 350));
  return { identityId: generateIdentityId(), createdAt: new Date().toISOString() };
}

/**
 * Service method placeholder for re-generating the identity card.
 */
export async function generateIdentityCard(payload: SurveyFormPayload): Promise<SurveyFormPayload> {
  await new Promise((resolve) => setTimeout(resolve, 220));
  return {
    ...payload,
    identityId: payload.identityId || generateIdentityId(),
    createdAt: new Date().toISOString(),
  };
}