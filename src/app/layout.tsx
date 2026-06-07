import type { Metadata } from "next";
import ClientShell from "@/components/client-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "AI Agent Map — 生成你的 AI 身份卡", template: "%s | AI Agent Map" },
  description: "记录你的 AI 工具栈，生成可分享的 AI 身份卡，查看全国 AI 工具使用分布。",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://liusq.icu"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="scroll-smooth" suppressHydrationWarning>
      <body className="overflow-x-hidden text-gray-950">
        <script
          dangerouslySetInnerHTML={{
            __html: `
try {
  var storedTheme = window.localStorage.getItem("ai-agent-map-theme");
  var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  var theme = storedTheme === "dark" || storedTheme === "light" ? storedTheme : prefersDark ? "dark" : "light";
  document.documentElement.classList.toggle("theme-dark", theme === "dark");
} catch (error) {}
            `.trim(),
          }}
        />
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
