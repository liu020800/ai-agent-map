"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toPng } from "html-to-image";
import { levelName } from "@/lib/level";
import { generateAvatarSvg } from "@/lib/avatar";
import { FadeIn } from "@/components/motion-wrapper";
import { motion } from "framer-motion";
import { Download, Copy, RefreshCw, Sparkles, Shield, Swords, MapPin } from "lucide-react";
import SharePanel from "@/components/share-panel";

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

const RARITY: Record<number, { name: string; color: string; glow: string }> = {
  1: { name: "普通", color: "text-slate-400", glow: "" },
  2: { name: "稀有", color: "text-blue-400", glow: "shadow-blue-500/20" },
  3: { name: "史诗", color: "text-purple-400", glow: "shadow-purple-500/30" },
  4: { name: "传说", color: "text-amber-400", glow: "shadow-amber-500/30" },
  5: { name: "神话", color: "text-red-400", glow: "shadow-red-500/40" },
};

const POWER: Record<number, number> = { 1: 100, 2: 500, 3: 2000, 4: 8000, 5: 50000 };

export default function ShareContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const cardRef = useRef<HTMLDivElement>(null);
  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiAvatarUrl, setAiAvatarUrl] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const [name, setName] = useState("AI 用户");
  const [level, setLevel] = useState(4);
  const [tool, setTool] = useState("Codex + Claude Code");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/cards/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) { setCard(data); setName(data.nickname); setLevel(data.ai_level); setTool(data.primary_tool || data.tools?.[0] || ""); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const generateAiAvatar = useCallback(async () => {
    setAvatarLoading(true);
    try {
      const res = await fetch("/api/generate-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seed: card?.avatar_seed || name + Date.now(), level: card?.ai_level || level, tools: card?.tools || [tool] }),
      });
      const data = await res.json();
      if (data.url) setAiAvatarUrl(data.url);
    } catch {} finally { setAvatarLoading(false); }
  }, [card, name, level, tool]);

  useEffect(() => { if (card || slug) generateAiAvatar(); }, [card, slug, generateAiAvatar]);

  const pixelAvatarSvg = useMemo(() => generateAvatarSvg(card?.avatar_seed || name + level), [card?.avatar_seed, name, level]);
  const displayName = card?.nickname || name;
  const displayLevel = card ? levelName(card.ai_level) : levelName(level);
  const displayTool = card?.primary_tool || tool;
  const userNumber = card?.user_number;
  const currentLevel = card?.ai_level || level;
  const rarity = RARITY[currentLevel] || RARITY[1];
  const power = POWER[currentLevel] || 100;

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `ai-agent-card-${slug || "custom"}.png`;
      link.href = dataUrl;
      link.click();
    } finally { setGenerating(false); }
  }, [slug]);

  if (loading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 animate-ping rounded-full bg-indigo-500/20" />
            <div className="relative h-12 w-12 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-400" />
          </div>
          <p className="text-sm">正在扫描 AI 信号...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <FadeIn>
        <div className="text-center">
          <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-xs font-medium uppercase tracking-[0.3em] text-indigo-400">AI Agent Passport</motion.p>
          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">{card ? "你的 AI 身份档案" : "生成 AI 身份卡"}</h1>
        </div>
      </FadeIn>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        {/* Passport Card */}
        <FadeIn delay={0.1} className="lg:col-span-3">
          <div ref={cardRef} className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-900">
            {/* Header */}
            <div className="border-b border-indigo-500/20 bg-indigo-500/5 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-indigo-400" />
                  <span className="text-sm font-bold tracking-widest text-indigo-300">AI AGENT PASSPORT</span>
                </div>
                <span className="text-xs text-slate-500">NO. {userNumber ? String(userNumber).padStart(6, "0") : "000000"}</span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="flex gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 }}
                    className={`relative h-28 w-28 overflow-hidden rounded-xl border-2 shadow-lg ${rarity.glow}`} style={{ borderColor: currentLevel >= 4 ? "rgba(251,191,36,0.3)" : "rgba(99,102,241,0.3)" }}>
                    {aiAvatarUrl ? (
                      <img src={aiAvatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full" dangerouslySetInnerHTML={{ __html: pixelAvatarSvg }} />
                    )}
                    {avatarLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Sparkles className="h-6 w-6 animate-pulse text-indigo-400" />
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Info */}
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-2xl font-bold text-white">{displayName}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`text-xs font-bold ${rarity.color}`}>★ {rarity.name}</span>
                      <span className="text-xs text-slate-500">·</span>
                      <span className="text-xs text-slate-400">{displayLevel}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2">
                      <p className="text-[10px] text-slate-500">战斗力</p>
                      <p className="text-lg font-bold text-amber-400">{power.toLocaleString()}</p>
                    </div>
                    <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2">
                      <p className="text-[10px] text-slate-500">地区据点</p>
                      <p className="flex items-center gap-1 text-sm font-semibold text-white"><MapPin className="h-3 w-3 text-indigo-400" />{card?.province || "未知"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Equipment */}
              <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-400"><Swords className="h-3.5 w-3.5" />已装备</p>
                <div className="flex flex-wrap gap-2">
                  {(card?.tools || [tool]).map((t) => (
                    <span key={t} className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">{t}</span>
                  ))}
                </div>
              </div>

              {/* QR placeholder */}
              <div className="mt-5 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <div>
                  <p className="text-xs text-slate-500">扫码生成你的 AI 身份</p>
                  <p className="text-[10px] text-slate-600">liusq.icu</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center">
                  <span className="text-[10px] text-slate-500">QR</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-indigo-500/10 bg-indigo-500/5 px-6 py-3 text-center">
              <p className="text-[10px] text-slate-500">AI AGENT MAP · liusq.icu</p>
            </div>
          </div>
        </FadeIn>

        {/* Controls */}
        <FadeIn delay={0.2} className="lg:col-span-2">
          <div className="space-y-4">
            {/* Manual mode */}
            {!card && (
              <div className="space-y-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-xl">
                <label className="block text-sm text-slate-400">
                  昵称
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
                <button onClick={generateAiAvatar} disabled={avatarLoading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">
                  <Sparkles className="h-4 w-4" /> {avatarLoading ? "AI 生成中..." : "生成 AI 头像"}
                </button>
              </div>
            )}

            {/* Share Panel */}
            <SharePanel
              title="AI Agent 身份卡"
              userNumber={userNumber ?? null}
              levelName={displayLevel}
              primaryTool={displayTool}
              slug={slug}
              imageUrl={aiAvatarUrl || undefined}
              onDownload={handleDownload}
            />

            {/* Quick actions */}
            <div className="flex gap-3">
              <motion.button onClick={handleDownload} disabled={generating} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">
                <Download className="h-4 w-4" /> {generating ? "生成中..." : "保存身份卡"}
              </motion.button>
              <a href="/survey" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200">
                <RefreshCw className="h-4 w-4" /> 再测一次
              </a>
            </div>
          </div>
        </FadeIn>
      </div>
    </main>
  );
}
