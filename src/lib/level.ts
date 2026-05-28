const APP_TOOLS = new Set(["豆包", "DeepSeek", "Kimi", "ChatGPT", "Gemini", "通义", "元宝"]);
const AGENT_TOOLS = new Set(["OpenClaw", "Hermes", "Codex", "Claude Code", "OpenCode", "Cursor", "Dify", "n8n Agent"]);

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

export function levelLabel(level: number): string {
  switch (level) {
    case 5:
      return "L5 本地 AI 系统玩家";
    case 4:
      return "L4 Agent 自动化用户";
    case 3:
      return "L3 工作流用户";
    case 2:
      return "L2 Prompt 用户";
    default:
      return "L1 普通聊天用户";
  }
}
