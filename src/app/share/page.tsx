"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { levelLabel } from "@/lib/level";
import { FadeIn } from "@/components/motion-wrapper";
import { motion } from "framer-motion";
import { Download, Share2 } from "lucide-react";

const LEVEL_OPTIONS = [1, 2, 3, 4, 5];

export default function SharePage() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("AI 用户");
  const [level, setLevel] = useState(4);
  const [tool, setTool] = useState("Codex + Claude Code");
  const [generating, setGenerating] = useState(false);
  const [userCount, setUserCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/ranking")
      .then((r) => r.json())
      .then((j) => {
        const total = (j.levels ?? []).reduce((a: number, l: { count: number }) => a + l.count, 0);
        setUserCount(total);
      })
      .catch(() => {});
  }, []);

  const shareText = useMemo(
    () => `我是第 ${userCount ?? "___"} 位 AI Agent 用户\n主力工具：${tool}\n等级：${levelLabel(level)}`,
    [userCount, tool, level]
  );

  async function handleDownload() {
    if (!cardRef.current) return;
    setGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = "ai-agent-share.png";
      link.href = dataUrl;
      link.click();
    } finally {
      setGenerating(false);
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "AI Agent 用户身份卡", text: shareText, url: "https://liusq.icu" });
      } catch {}
    } else {
      await navigator.clipboard.writeText(shareText);
      alert("已复制分享文案到剪贴板！");
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <FadeIn>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">生成分享卡片</h1>
        <p className="mt-3 text-slate-400">填写信息后一键生成可分享的等级卡片图片。</p>
      </FadeIn>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Form */}
        <FadeIn delay={0.1}>
          <section className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
            <label className="block text-sm text-slate-400">
              你的昵称
              <input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white backdrop-blur-sm focus:border-indigo-500/50 focus:outline-none" />
            </label>
            <label className="block text-sm text-slate-400">
              AI 等级
              <select value={level} onChange={(e) => setLevel(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white backdrop-blur-sm focus:border-indigo-500/50 focus:outline-none">
                {LEVEL_OPTIONS.map((lv) => (<option key={lv} value={lv}>{levelLabel(lv)}</option>))}
              </select>
            </label>
            <label className="block text-sm text-slate-400">
              主力工具
              <input value={tool} onChange={(e) => setTool(e.target.value)} placeholder="例如：Codex + Claude Code" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white placeholder:text-slate-600 backdrop-blur-sm focus:border-indigo-500/50 focus:outline-none" />
            </label>
            <div className="flex gap-3">
              <motion.button
                onClick={handleDownload}
                disabled={generating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {generating ? "生成中..." : "下载图片"}
              </motion.button>
              <motion.button
                onClick={handleShare}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 backdrop-blur-sm"
              >
                <Share2 className="h-4 w-4" />
                分享
              </motion.button>
            </div>
          </section>
        </FadeIn>

        {/* Card Preview */}
        <FadeIn delay={0.2}>
          <section className="flex items-stretch">
            <motion.div
              ref={cardRef}
              initial={{ rotateY: -5 }}
              animate={{ rotateY: 0 }}
              transition={{ duration: 0.8 }}
              className="flex w-full flex-col justify-between overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/20 via-slate-900 to-blue-600/10 p-8 shadow-2xl shadow-indigo-500/10"
            >
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-indigo-300/70">AI Agent 用户身份卡</p>
                <p className="mt-6 text-3xl font-bold text-white">{name}</p>
                <p className="mt-2 text-lg font-semibold text-indigo-300">{levelLabel(level)}</p>
              </div>
              <div className="mt-8 space-y-3">
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-5 py-3">
                  <p className="text-xs text-slate-500">我是第 {userCount ?? "___"} 位 AI Agent 用户</p>
                </div>
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-5 py-3">
                  <p className="text-xs text-slate-500">主力工具：{tool}</p>
                </div>
              </div>
              <p className="mt-8 text-xs text-indigo-300/50">liusq.icu</p>
            </motion.div>
          </section>
        </FadeIn>
      </div>

      <FadeIn delay={0.3}>
        <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-xl">
          <p className="text-xs text-slate-500">分享文案预览</p>
          <p className="mt-2 whitespace-pre-line text-sm text-slate-300">{shareText}</p>
        </div>
      </FadeIn>
    </main>
  );
}
