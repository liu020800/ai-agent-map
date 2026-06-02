import type { Metadata } from "next";
import ClientShell from "@/components/client-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "AI Agent Map — 你的 AI 身份扫描器", template: "%s | AI Agent Map" },
  description: "生成你的 AI 身份卡，查看全国 AI Agent 用户分布图谱。",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://liusq.icu"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="scroll-smooth">
      <body className="text-white overflow-x-hidden">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
