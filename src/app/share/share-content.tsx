"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toPng } from "html-to-image";
import { levelName } from "@/lib/level";
import { generateAvatarSvg } from "@/lib/avatar";
import { FadeIn } from "@/components/motion-wrapper";
import { motion } from "framer-motion";
import { Download, Copy, RefreshCw, Share2 } from "lucide-react";

type CardData = {
  nickname: string;
  ai_level: number;
  ai_level_name: string;
  primary_tool: string;
  tools: string[];
  avatar_seed: string;
  province: string;
  created_at: string;
  user_number: number;
};

export default function ShareContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const cardRef = useRef<HTMLDivElement>(null);
  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const [name, setName] = useState("AI 用户");
  const [level, setLevel] = useState(4);
  const [tool, setTool] = useState("Codex + Claude Code");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/cards/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setCard(data);
          setName(data.nickname);
          setLevel(data.ai_level);
          setTool(data.primary_tool || data.tools?.[0] || "");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const avatarSvg = useMemo(() => generateAvatarSvg(card?.avatar_seed || name + level), [card?.avatar_seed, name, level]);
  const displayName = card?.nickname || name;
  const displayLevel = card ? levelName(card.ai_level) : levelName(level);
  const displayTool = card?.primary_tool || tool;
  const userNumber = card?.user_number;

  const shareText = useMemo(
    () => `我是${userNumber ? `第 ${userNumber} 位` : ""} AI Agent 玩家\n等级：${displayLevel}\n主力工具：${displayTool}\nhttps://liusq.icu`,
    [userNumber, displayLevel, displayTool]
  );

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `ai-agent-card-${displayName}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setGenerating(false);
    }
  }, [displayName]);

  const handleCopyLink = useCallback(async () => {
    const url = slug ? `https://liusq.icu/share?slug=${slug}` : "https://liusq.icu";
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [slug]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "AI Agent 用户身份卡", text: shareText, url: slug ? `https://liusq.icu/share?slug=${slug}` : "https://liusq.icu" });
      } catch {}
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareText, slug]);

  if (loading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
          加载卡片数据...
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <FadeIn>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">{card ? "我的 AI 身份卡" : "生成分享卡片"}</h1>
        <p className="mt-3 text-slate-400">{card ? "分享你的 AI Agent 身份" : "填写信息后一键生成可分享的等级卡片图片"}</p>
      </FadeIn>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {!card && (
          <FadeIn delay={0.1}>
            <section className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
              <label className="block text-sm text-slate-400">
                你的昵称
                <input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white focus:border-indigo-500/50 focus:outline-none" />
              </label>
              <label className="block text-sm text-slate-400">
                AI 等级
                <select value={level} onChange={(e) => setLevel(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white focus:border-indigo-500/50 focus:outline-none">
                  {[1, 2, 3, 4, 5].map((lv) => (<option key={lv} value={lv}>{levelName(lv)}</option>))}
                </select>
              </label>
              <label className="block text-sm text-slate-400">
                主力工具
                <input value={tool} onChange={(e) => setTool(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white focus:border-indigo-500/50 focus:outline-none" />
              </label>
            </section>
          </FadeIn>
        )}

        <FadeIn delay={0.2}>
          <section className="flex items-stretch">
            <div ref={cardRef} className="flex w-full flex-col justify-between overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/20 via-slate-900 to-blue-600/10 p-8 shadow-2xl shadow-indigo-500/10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-indigo-300/70">AI Agent 用户身份卡</p>
                  <p className="mt-4 text-3xl font-bold text-white">{displayName}</p>
                  <p className="mt-2 text-lg font-semibold text-indigo-300">{displayLevel}</p>
                </div>
                <div className="flex-shrink-0" dangerouslySetInnerHTML={{ __html: avatarSvg }} />
              </div>
              <div className="mt-6 space-y-2">
                {userNumber && (
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-5 py-3">
                    <p className="text-sm text-slate-300">我是第 <span className="font-bold text-white">{userNumber}</span> 位 AI Agent 玩家</p>
                  </div>
                )}
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-5 py-3">
                  <p className="text-sm text-slate-300">主力工具：<span className="font-semibold text-white">{displayTool}</span></p>
                </div>
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-5 py-3">
                  <p className="text-sm text-slate-300">等级：<span className="font-semibold text-white">{displayLevel}</span></p>
                </div>
              </div>
              <p className="mt-6 text-xs text-indigo-300/50">liusq.icu</p>
            </div>
          </section>
        </FadeIn>
      </div>

      <FadeIn delay={0.3}>
        <div className="mt-6 flex flex-wrap gap-3">
          <motion.button onClick={handleDownload} disabled={generating} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 disabled:opacity-50">
            <Download className="h-4 w-4" /> {generating ? "生成中..." : "下载 PNG"}
          </motion.button>
          <motion.button onClick={handleCopyLink} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 backdrop-blur-sm">
            <Copy className="h-4 w-4" /> {copied ? "已复制！" : "复制链接"}
          </motion.button>
          <motion.button onClick={handleShare} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 backdrop-blur-sm">
            <Share2 className="h-4 w-4" /> 分享
          </motion.button>
          <a href="/survey" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 backdrop-blur-sm">
            <RefreshCw className="h-4 w-4" /> 再测一次
          </a>
        </div>
      </FadeIn>

      <FadeIn delay={0.4}>
        <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-xl">
          <p className="text-xs text-slate-500">分享文案预览</p>
          <p className="mt-2 whitespace-pre-line text-sm text-slate-300">{shareText}</p>
        </div>
      </FadeIn>
    </main>
  );
}
