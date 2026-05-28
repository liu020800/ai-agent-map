import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AI Agent 用户调查网站",
    template: "%s | AI Agent 用户调查网站",
  },
  description: "全国 AI 工具 / AI Agent 使用情况调查、用户等级、排行榜、中国热力图、分享卡片。",
  keywords: ["AI Agent", "AI 调查", "AI 工具", "排行榜", "热力图", "Codex", "Claude Code"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://liusq.icu"),
  openGraph: {
    title: "AI Agent 用户调查网站",
    description: "谁在真正使用 AI Agent？填写问卷、查看排行榜、生成分享卡片。",
    url: "/",
    siteName: "AI Agent 用户调查网站",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Agent 用户调查网站",
    description: "全国 AI 工具 / AI Agent 使用情况调查。",
  },
  robots: {
    index: true,
    follow: true,
  },
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
