"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { toPng } from "html-to-image";
import { levelName } from "@/lib/level";
import { generateAvatarSvg } from "@/lib/avatar";
import { FadeIn } from "@/components/motion-wrapper";
import { motion } from "framer-motion";
import { Download, Copy, RefreshCw, Sparkles, Shield, Swords, MapPin, Zap, Star } from "lucide-react";
import SharePanel from "@/components/share-panel";
import SciFiLoader from "@/components/react-bits/SciFiLoader";
import ShinyText from "@/components/react-bits/ShinyText";
import SpotlightCard from "@/components/react-bits/SpotlightCard";
import CountUp from "@/components/react-bits/CountUp";

const ParticlesBG = dynamic(() => import("@/components/react-bits/ParticlesBG"), { ssr: false });

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

const RARITY: Record<number, { name: string; color: string; glow: string; borderColor: string; bgGrad: string; label: string }> = {
  1: { name: "普通", color: "text-slate-400", glow: "", borderColor: "rgba(148, 163, 184, 0.3)", bgGrad: "from-slate-800/50 to-slate-900/50", label: "R" },
  2: { name: "稀有", color: "text-blue-400", glow: "shadow-[0_0_20px_rgba(59,130,246,0.3)]", borderColor: "rgba(59, 130, 246, 0.4)", bgGrad: "from-blue-950/30 to-slate-900/50", label: "SR" },
  3: { name: "史诗", color: "text-purple-400", glow: "shadow-[0_0_25px_rgba(168,85,247,0.35)]", borderColor: "rgba(168, 85, 247, 0.4)", bgGrad: "from-purple-950/30 to-slate-900/50", label: "SSR" },
  4: { name: "传说", color: "text-amber-400", glow: "shadow-[0_0_30px_rgba(251,191,36,0.3)]", borderColor: "rgba(251, 191, 36, 0.4)", bgGrad: "from-amber-950/30 to-slate-900/50", label: "UR" },
  5: { name: "神话", color: "text-red-400", glow: "shadow-[0_0_35px_rgba(239,68,68,0.35)]", borderColor: "rgba(239, 68, 68, 0.4)", bgGrad: "from-red-950/30 to-slate-900/50", label: "LR" },
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
      <main className="relative mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
        <ParticlesBG className="fixed inset-0 -z-10 opacity-30" count={25} />
        <SciFiLoader text="正在扫描 AI 身份信号..." />
      </main>
    );
  }

  return (
    <main className="relative mx-auto max-w-3xl px-6 py-12">
      <ParticlesBG className="fixed inset-0 -z-10 opacity-20" count={20} />

      <FadeIn>
        <div className="text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/5 px-4 py-1.5">
            <Shield className="h-3 w-3 text-indigo-400" />
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-indigo-400">AI Agent Passport</span>
          </motion.div>
          <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">{card ? "你的 AI 身份档案" : "生成 AI 身份卡"}</h1>
        </div>
      </FadeIn>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        {/* Passport Card */}
        <FadeIn delay={0.1} className="lg:col-span-3">
          <motion.div ref={cardRef}
            className={`relative overflow-hidden rounded-2xl border-2 ${rarity.glow}`}
            style={{ borderColor: rarity.borderColor }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}>

            {/* Animated border glow for high rarity */}
            {currentLevel >= 3 && (
              <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, ${rarity.borderColor}, transparent 40%, transparent 60%, ${rarity.borderColor})`,
                  opacity: 0.3,
                }}
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              />
            )}

            {/* Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${rarity.bgGrad} to-slate-900`} />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08),transparent_50%)]" />

            {/* Content wrapper */}
            <div className="relative">
              {/* Header */}
              <div className="border-b border-indigo-500/20 bg-indigo-500/5 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-indigo-400" />
                    <span className="text-sm font-bold tracking-widest text-indigo-300">AI AGENT PASSPORT</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${rarity.color}`} style={{ borderColor: rarity.borderColor }}>
                      {rarity.label}
                    </span>
                    <span className="text-xs text-slate-500">NO. {userNumber ? String(userNumber).padStart(6, "0") : "000000"}</span>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="flex gap-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 }}
                      className={`relative h-28 w-28 overflow-hidden rounded-xl border-2 ${rarity.glow}`}
                      style={{ borderColor: rarity.borderColor }}>
                      {aiAvatarUrl ? (
                        <img src={aiAvatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full" dangerouslySetInnerHTML={{ __html: pixelAvatarSvg }} />
                      )}
                      {avatarLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
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
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${rarity.color}`} style={{ borderColor: rarity.borderColor }}>
                          <Star className="h-2.5 w-2.5" /> {rarity.name}
                        </span>
                        <span className="text-xs text-slate-500">·</span>
                        <ShinyText text={displayLevel} className="text-xs font-medium" speed={3} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2">
                        <p className="text-[10px] text-slate-500">战斗力</p>
                        <CountUp target={power} className="text-lg font-bold text-amber-400" duration={1.5} />
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
                      <motion.span key={t} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
                        {t}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* QR placeholder */}
                <div className="mt-5 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <div>
                    <p className="text-xs text-slate-500">扫码生成你的 AI 身份</p>
                    <p className="text-[10px] text-slate-600">liusq.icu</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center border border-white/[0.06]">
                    <span className="text-[10px] text-slate-500">QR</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-indigo-500/10 bg-indigo-500/5 px-6 py-3 text-center">
                <p className="text-[10px] text-slate-500 tracking-wider">AI AGENT MAP · liusq.icu</p>
              </div>
            </div>
          </motion.div>
        </FadeIn>

        {/* Controls */}
        <FadeIn delay={0.2} className="lg:col-span-2">
          <div className="space-y-4">
            {/* Manual mode */}
            {!card && (
              <SpotlightCard className="space-y-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-xl" spotlightColor="rgba(99, 102, 241, 0.08)">
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
                <motion.button onClick={generateAiAvatar} disabled={avatarLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 disabled:opacity-50">
                  <Sparkles className="h-4 w-4" /> {avatarLoading ? "AI 生成中..." : "生成 AI 头像"}
                </motion.button>
              </SpotlightCard>
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
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50">
                <Download className="h-4 w-4" /> {generating ? "生成中..." : "保存身份卡"}
              </motion.button>
              <a href="/survey" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition-all hover:border-white/20 hover:bg-white/[0.08]">
                <RefreshCw className="h-4 w-4" /> 再测一次
              </a>
            </div>
          </div>
        </FadeIn>
      </div>
    </main>
  );
}
