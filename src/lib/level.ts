const APP_TOOLS = new Set([
  "ChatGPT", "Claude", "Gemini", "DeepSeek", "豆包", "Kimi", "通义千问", "腾讯元宝", "文心一言",
  "Perplexity", "Grok", "Poe", "Genspark", "NotebookLM", "Gamma", "Napkin AI", "Monica",
  "Midjourney", "即梦 AI", "可灵 AI", "Runway",
]);
const AGENT_TOOLS = new Set([
  "Codex", "Claude Code", "OpenCode", "OpenClaw", "Hermes", "Cursor", "Windsurf", "Trae", "CodeBuddy",
  "GitHub Copilot", "Replit Agent", "v0", "Bolt.new", "Lovable", "Manus",
  "Dify", "扣子 / Coze", "LangChain", "LlamaIndex", "Flowise", "n8n", "Make", "Zapier",
  "Cherry Studio", "Ollama", "LM Studio", "Jan", "Open WebUI", "AnythingLLM", "ComfyUI", "Stable Diffusion",
]);

export function computeLevel(userType: "app" | "agent", tools: string[]): number {
  const unique = new Set(tools);
  const agentCount = [...unique].filter((t) => AGENT_TOOLS.has(t)).length;
  const appCount = [...unique].filter((t) => APP_TOOLS.has(t)).length;
  if (userType === "agent" && agentCount >= 3) return 5;
  if (userType === "agent" && agentCount >= 1) return 4;
  if (appCount >= 3) return 3;
  if (appCount >= 1) return 2;
  return 1;
}

export function levelName(level: number): string {
  switch (level) {
    case 5: return "L5 本地 AI 系统玩家";
    case 4: return "L4 Agent 工作流用户";
    case 3: return "L3 AI 工具组合用户";
    case 2: return "L2 Prompt 用户";
    default: return "L1 AI 聊天用户";
  }
}

// Backwards compat
export const levelLabel = levelName;

export { APP_TOOLS, AGENT_TOOLS };
