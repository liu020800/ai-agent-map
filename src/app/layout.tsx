import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Agent 用户调查网站",
  description: "全国 AI 工具 / AI Agent 使用情况调查、排行榜、热力图与用户分享卡片。",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-slate-950 text-slate-200 antialiased">
        <div className="fixed inset-0 -z-20 bg-[radial-gradient(120%_80%_at_50%_0%,rgba(15,23,42,1),rgba(2,6,23,1))]" />
        {children}
      </body>
    </html>
  );
}
