import type { Metadata } from "next";
import ClientShell from "@/components/client-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AI Agent Map — 你的 AI 身份扫描器",
    template: "%s | AI Agent Map",
  },
  description: "生成你的 AI 身份卡，查看全国 AI Agent 用户分布图谱。你是 AI 聊天用户，还是 Agent 玩家？",
  keywords: ["AI Agent", "AI 身份卡", "Agent 地图", "Codex", "Claude Code", "DeepSeek", "ChatGPT"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://liusq.icu"),
  openGraph: {
    title: "AI Agent Map — 你的 AI 身份扫描器",
    description: "生成你的 AI 身份卡，点亮全国 AI Agent 用户地图。",
    url: "/",
    siteName: "AI Agent Map",
    locale: "zh_CN",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-noise bg-grid antialiased" style={{ background: "var(--bg-primary)" }}>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
