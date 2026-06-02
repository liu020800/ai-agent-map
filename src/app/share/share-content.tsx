"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toPng } from "html-to-image";
import { motion } from "framer-motion";
import { Download, MapPin, RefreshCw, Sparkles, Star, Trophy, Wifi, Copy, Share2, CheckCircle2, Shield, Zap, Radio } from "lucide-react";
import LocalQrCode from "@/components/local-qr-code";
import SharePanel from "@/components/share-panel";
import SciFiLoader from "@/components/react-bits/SciFiLoader";
import LiquidGlassCard from "@/components/react-bits/LiquidGlassCard";
import CountUp from "@/components/react-bits/CountUp";
import ShinyText from "@/components/react-bits/ShinyText";
import { generateAvatarSvg } from "@/lib/avatar";
import { levelName } from "@/lib/level";
import { generateShareText, getQQShareUrl, getQZoneShareUrl, getWeiboShareUrl, initWxShare } from "@/lib/wechat-share";
import { fetchCard, generateAiAvatar } from "@/lib/api-client";

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

const RARITY: Record<number, { name: string; color: string; border: string; label: string; accent: string; panel: string }> = {
  1: { name: "普通", color: "text-neutral-400", border: "border-neutral-500/25", label: "R", accent: "#737373", panel: "rgba(115,115,115,0.12)" },
  2: { name: "稀有", color: "text-[#00ffc8]", border: "border-[#00ffc8]/35", label: "SR", accent: "#00ffc8", panel: "rgba(0,255,200,0.16)" },
  3: { name: "史诗", color: "text-violet-300", border: "border-violet-400/35", label: "SSR", accent: "#a855f7", panel: "rgba(168,85,247,0.18)" },
  4: { name: "传说", color: "text-amber-300", border: "border-amber-400/35", label: "UR", accent: "#fbbf24", panel: "rgba(251,191,36,0.16)" },
  5: { name: "神话", color: "text-rose-300", border: "border-rose-400/35", label: "LR", accent: "#fb7185", panel: "rgba(251,113,133,0.18)" },
};

const POWER: Record<number, number> = { 1: 420, 2: 1380, 3: 3620, 4: 8721, 5: 16888 };

const TOOL_COLOR_MAP: Record<string, string> = {
  Codex: "#22d3ee",
  "Claude Code": "#a855f7",
  OpenCode: "#00ffc8",
  DeepSeek: "#3b82f6",
  豆包: "#f59e0b",
  n8n: "#ec4899",
  Dify: "#10b981",
  Cursor: "#8b5cf6",
  Windsurf: "#06b6d4",
  Copilot: "#6366f1",
  Kimi: "#fb7185",
  Qwen: "#84cc16",
};

function toolAccent(name: string, fallback: string): string {
  return TOOL_COLOR_MAP[name] || fallback;
}

export default function ShareContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const cardRef = useRef<HTMLDivElement>(null);

  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [aiAvatarUrl, setAiAvatarUrl] = useState<string | null>(null);
  const [name, setName] = useState("AI 用户");
  const [level, setLevel] = useState(4);
  const [tool, setTool] = useState("Codex + Claude Code");
  const [copied, setCopied] = useState<"text" | "link" | null>(null);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (!slug) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetchCard(slug)
      .then((data) => {
        setCard(data);
        setName(data.nickname);
        setLevel(data.ai_level);
        setTool(data.primary_tool || data.tools?.[0] || "Codex");
      })
      .catch(() => {})
      .finally(() => {
        if (typeof window === "undefined") return;
        setLoading(false);
      });
  }, [slug]);

  const callAiAvatar = useCallback(async () => {
    setAvatarLoading(true);
    try {
      const url = await generateAiAvatar(
        card?.avatar_seed || `${name}-${Date.now()}`,
        card?.ai_level || level,
        card?.tools || [tool],
      );
      if (url) setAiAvatarUrl(url);
    } catch {
    } finally {
      setAvatarLoading(false);
    }
  }, [card, level, name, tool]);

  useEffect(() => {
    if (card || slug) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void callAiAvatar();
    }
  }, [card, slug, callAiAvatar]);


  const pixelAvatarSvg = useMemo(() => generateAvatarSvg(card?.avatar_seed || `${name}-${level}-${tool}`, 200, card?.ai_level || level, card?.primary_tool || tool), [card?.avatar_seed, card?.ai_level, card?.primary_tool, name, level, tool]);
  const currentLevel = card?.ai_level || level;
  const rarity = RARITY[currentLevel] || RARITY[1];
  const power = POWER[currentLevel] || POWER[1];
  const displayName = card?.nickname || name;
  const displayLevel = card ? levelName(card.ai_level) : levelName(level);
  const displayTool = card?.primary_tool || tool;
  const shareText = generateShareText(card?.user_number ?? null, displayLevel, displayTool);
  const shareUrl = slug ? `https://liusq.icu/share?slug=${slug}` : "https://liusq.icu";
  const passportCode = card?.user_number ? String(card.user_number).padStart(7, "0") : "0001024";

  useEffect(() => {
    initWxShare({
      title: `${displayName} 的 AI Agent Passport`,
      desc: shareText,
      link: shareUrl,
      imgUrl: aiAvatarUrl || "https://liusq.icu/images/hero-bg.jpg",
    }).catch(() => {});
  }, [displayName, shareText, shareUrl, aiAvatarUrl]);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `ai-agent-card-${slug || "custom"}.png`;
      link.href = dataUrl;
      link.click();
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 1800);
    } finally {
      setGenerating(false);
    }
  }, [slug]);

  const copyText = useCallback(async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied("text");
    setTimeout(() => setCopied(null), 1800);
  }, [shareText]);

  const copyLink = useCallback(async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied("link");
    setTimeout(() => setCopied(null), 1800);
  }, [shareUrl]);

  const openQQ = useCallback(() => {
    window.open(getQQShareUrl(`${displayName} 的 AI Agent Passport`, shareText, shareUrl, aiAvatarUrl || ""), "_blank", "noopener,noreferrer");
  }, [aiAvatarUrl, displayName, shareText, shareUrl]);

  const openWeibo = useCallback(() => {
    window.open(getWeiboShareUrl(shareText, shareUrl, aiAvatarUrl || undefined), "_blank", "noopener,noreferrer");
  }, [aiAvatarUrl, shareText, shareUrl]);

  const openQzone = useCallback(() => {
    window.open(getQZoneShareUrl(`${displayName} 的 AI Agent Passport`, shareText, shareUrl, aiAvatarUrl || ""), "_blank", "noopener,noreferrer");
  }, [aiAvatarUrl, displayName, shareText, shareUrl]);

  if (loading) {
    return (
      <main id="main-content" className="relative mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center px-6">
        <ParticlesBG className="opacity-20" count={18} />
        <SciFiLoader text="正在扫描 AI 身份信号..." />
      </main>
    );
  }

  return (
    <main id="main-content" className="relative overflow-hidden px-6 py-8 lg:px-10">
      <ParticlesBG className="opacity-15" count={16} />

      <section className="relative z-10 mx-auto max-w-[1220px]">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-cyan-300/15 bg-cyan-300/[0.05] px-4 py-2 backdrop-blur-md">
            <Wifi className="h-3.5 w-3.5 text-cyan-300/80" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-300/80">AI Agent Passport</span>
          </div>
          <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <h1 className="title-font text-4xl font-black text-white sm:text-5xl lg:text-6xl">你的 AI 身份卡已装配完成</h1>
              <p className="mt-4 max-w-[760px] text-sm leading-7 text-white/52 sm:text-base">这不是一张普通卡片，而是你的 Agent 身份通行证。保存它、分享它、点亮你的地区据点，并把你的玩家身份传播到更多平台。</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-3">
              {[
                { label: "身份等级", value: displayLevel },
                { label: "主力工具", value: displayTool },
                { label: "地区据点", value: card?.province || "未知地区" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-4 backdrop-blur-xl">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">{item.label}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[440px_1fr] xl:grid-cols-[460px_1fr]">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mx-auto w-full max-w-[460px] lg:max-w-none">
            <div ref={cardRef} className={`relative overflow-hidden rounded-[34px] border ${rarity.border}`} style={{ aspectRatio: "3 / 4", background: `linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015)), radial-gradient(circle at 50% 18%, ${rarity.accent}30, transparent 32%), radial-gradient(circle at 20% 85%, rgba(0,212,255,0.18), transparent 28%), #07080d`, boxShadow: `0 0 44px ${rarity.accent}20` }}>
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
              <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(255,255,255,0.04)_50%,transparent_100%)] opacity-40" />
              <div className="absolute left-0 right-0 top-[18%] h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
              <div className="absolute left-0 right-0 top-[64%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="pointer-events-none absolute inset-0 overflow-hidden"><motion.div className="absolute inset-x-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${rarity.accent}, transparent)` }} animate={{ y: ["0%", "1450%"] }} transition={{ repeat: Infinity, duration: 4.4, ease: "linear" }} /></div>

              <div className="relative flex h-full flex-col p-6 sm:p-7">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="title-font text-[11px] uppercase tracking-[0.34em] text-white/40">AI AGENT PASSPORT</p>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.25em]" style={{ color: rarity.accent }}>Identity verified</p>
                  </div>
                  <div className={`rounded-full border px-3 py-1 text-[10px] font-bold ${rarity.color} ${rarity.border}`}>{rarity.label}</div>
                </div>

                <div className="mb-5 grid grid-cols-[1fr_auto] gap-4 rounded-xl border border-white/[0.04] bg-white/[0.01] p-4 backdrop-blur-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-white/35">User Code</p>
                    <p className="title-font mt-2 text-2xl font-black text-white">#{passportCode}</p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/[0.05] bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/45">
                      <Radio className="h-3 w-3" /> Live record
                    </div>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/[0.04] bg-white/[0.01]" style={{ boxShadow: `0 0 22px ${rarity.accent}1a` }}>
                    <Shield className="h-6 w-6" style={{ color: rarity.accent }} />
                  </div>
                </div>

                <div className="mb-5 flex flex-col items-center">
                  <div className="relative">
                    {currentLevel >= 4 ? (
                      <motion.div
                        className="absolute -inset-3 rounded-[36px]"
                        style={{ background: `conic-gradient(from 0deg, ${rarity.accent}, #a855f7, #22d3ee, ${rarity.accent})`, filter: `blur(14px)`, opacity: 0.85 }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                      />
                    ) : null}
                    {currentLevel >= 3 ? (
                      <motion.div
                        className="absolute -inset-1 rounded-[32px]"
                        style={{ background: `conic-gradient(from 180deg, ${rarity.accent}, transparent 60%)` }}
                        animate={{ rotate: -360 }}
                        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                      />
                    ) : null}
                    <div className={`relative h-44 w-44 overflow-hidden rounded-[30px] border-2 ${rarity.border}`} style={{ boxShadow: `0 0 36px ${rarity.accent}35` }}>
                      {aiAvatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- External CDN image, user-provided URL.
                        <img src={aiAvatarUrl} alt="AI Avatar" className="h-full w-full object-cover" />
                      ) : <div className="h-full w-full" dangerouslySetInnerHTML={{ __html: pixelAvatarSvg }} />}
                      {avatarLoading ? <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"><Sparkles className="h-5 w-5 animate-pulse" style={{ color: rarity.accent }} /></div> : null}
                      <div className="absolute -bottom-1 -right-1 rounded-full border border-black/20 px-2.5 py-1 text-[10px] font-black text-black" style={{ background: rarity.accent }}>L{currentLevel}</div>
                    </div>
                  </div>
                  {currentLevel >= 4 ? (
                    <button
                      onClick={callAiAvatar}
                      disabled={avatarLoading}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.05] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/85 backdrop-blur-sm transition-all hover:border-white/35 hover:bg-white/[0.1] disabled:opacity-50"
                    >
                      <Sparkles className="h-3 w-3" style={{ color: rarity.accent }} />
                      {avatarLoading ? "AI 强化中..." : aiAvatarUrl ? "重新 AI 强化" : "AI 强化头像"}
                    </button>
                  ) : null}
                </div>

                <div className="mb-5 text-center">
                  <h2 className="title-font text-3xl font-black text-white">{displayName}</h2>
                  <div className="mt-2 flex items-center justify-center gap-2 text-xs">
                    <Star className="h-3.5 w-3.5" style={{ color: rarity.accent }} />
                    <span className={rarity.color}>{rarity.name}</span>
                    <span className="text-white/20">·</span>
                    <ShinyText text={displayLevel} className="font-semibold text-white/80" speed={4} color="#737373" shineColor="#ffffff" />
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-3 text-center">
                    <p className="mb-1 text-[10px] uppercase tracking-[0.22em] text-white/30">战斗力</p>
                    <CountUp to={power} className="title-font text-2xl font-black text-white" duration={1.5} />
                  </div>
                  <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-3 text-center">
                    <p className="mb-1 text-[10px] uppercase tracking-[0.22em] text-white/30">稀有度</p>
                    <p className="title-font text-xl font-black text-white">{rarity.label}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/35"><Trophy className="h-3.5 w-3.5 text-amber-300" /> Core Loadout</div>
                  <div className="flex flex-wrap gap-2">{(card?.tools || [tool]).slice(0, 4).map((item) => {
                    const c = toolAccent(item, rarity.accent);
                    return <span key={item} className="rounded-full border px-3 py-1.5 text-[11px] font-semibold" style={{ borderColor: `${c}55`, color: c, background: `${c}1a`, boxShadow: `0 0 14px ${c}22` }}>{item}</span>;
                  })}</div>
                </div>

                <div className="mb-5">
                  <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/35"><MapPin className="h-3.5 w-3.5 text-[#00d4ff]" /> Region & Signal</div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-white">{card?.province || "未知地区"}</p>
                      <p className="mt-1 text-xs text-white/42">全国 AI Agent 信号已写入图谱</p>
                    </div>
                    <div className="rounded-full border border-white/[0.04] bg-white/[0.01] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/45">liusq.icu</div>
                  </div>
                </div>

                <div className="mt-auto grid grid-cols-[1fr_auto] items-end gap-4 border-t border-white/[0.05] pt-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-white/35">Share Mission</p>
                    <p className="mt-1 text-sm font-semibold text-white/75">保存身份卡并分享给更多 Agent 玩家</p>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-white/[0.05] bg-white p-1"><LocalQrCode value={shareUrl} size={52} className="h-13 w-13" /></div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-6">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
              <LiquidGlassCard className="p-6" mode="shader" blurAmount={0.08} aberrationIntensity={1.8} cornerRadius={28}>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="title-font text-xs uppercase tracking-[0.3em] text-cyan-300/70">Share Command Center</p>
                    <h2 className="title-font mt-2 text-2xl font-black text-white">保存、复制、继续传播</h2>
                  </div>
                  <div className="rounded-full border border-white/[0.04] bg-white/[0.015] px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-white/45">Mobile First</div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <button onClick={handleDownload} disabled={generating} className="btn-lusion !w-full !justify-center !px-4 !py-4 !text-xs disabled:opacity-50"><Download className="h-4 w-4" /> {generating ? "生成中..." : downloaded ? "已保存" : "保存身份卡"}</button>
                  <button onClick={copyText} className="btn-lusion-outline !w-full !justify-center !px-4 !py-4 !text-xs"><Copy className="h-4 w-4" /> {copied === "text" ? "文案已复制" : "复制文案"}</button>
                  <button onClick={copyLink} className="btn-lusion-outline !w-full !justify-center !px-4 !py-4 !text-xs"><Share2 className="h-4 w-4" /> {copied === "link" ? "链接已复制" : "复制链接"}</button>
                  <Link href="/survey" className="btn-lusion-outline !w-full !justify-center !px-4 !py-4 !text-xs"><RefreshCw className="h-4 w-4" /> 再测一次</Link>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  <button onClick={openQQ} className="btn-lusion-outline !w-full !justify-center !px-4 !py-4 !text-xs"><Radio className="h-4 w-4" /> QQ 分享</button>
                  <button onClick={openQzone} className="btn-lusion-outline !w-full !justify-center !px-4 !py-4 !text-xs"><Radio className="h-4 w-4" /> QQ 空间</button>
                  <button onClick={openWeibo} className="btn-lusion-outline !w-full !justify-center !px-4 !py-4 !text-xs"><Share2 className="h-4 w-4" /> 微博分享</button>
                  <button onClick={() => { copyText(); handleDownload(); }} className="btn-lusion-outline !w-full !justify-center !px-4 !py-4 !text-xs"><Sparkles className="h-4 w-4" /> 小红书引导</button>
                  <button onClick={() => { copyText(); handleDownload(); }} className="btn-lusion-outline !w-full !justify-center !px-4 !py-4 !text-xs"><Zap className="h-4 w-4" /> 抖音引导</button>
                </div>
                <div className="mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                  <div className="rounded-[24px] border border-emerald-500/15 bg-emerald-500/5 p-4 text-sm text-emerald-300">
                    <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> 微信分享占位逻辑已启用</div>
                    <p className="mt-3 leading-7 text-emerald-100/75">当前阶段请优先使用“保存图片 + 复制文案”的方式发送到微信好友或朋友圈，兼容性最好，也最适合移动端发布。</p>
                  </div>
                  <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-4">
                    <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-white/35">推荐分享文案</p>
                    <p className="text-sm leading-7 text-white/70">{shareText}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-white/45">
                      <span className="rounded-full border border-white/[0.04] bg-white/[0.015] px-3 py-1.5">{displayLevel}</span>
                      <span className="rounded-full border border-white/[0.04] bg-white/[0.015] px-3 py-1.5">{displayTool}</span>
                      <span className="rounded-full border border-white/[0.04] bg-white/[0.015] px-3 py-1.5">编号 #{passportCode}</span>
                    </div>
                  </div>
                </div>
              </LiquidGlassCard>
            </motion.div>

            {!card ? <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}><LiquidGlassCard className="p-6" mode="standard" blurAmount={0.06} aberrationIntensity={1.4} cornerRadius={24}><div className="mb-4 flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#00ffc8]" /><h3 className="title-font text-lg font-bold text-white">自定义你的预览卡</h3></div><div className="grid gap-4 sm:grid-cols-3"><label className="text-sm text-white/55">昵称<input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/[0.05] bg-black/30 px-4 py-3 text-white outline-none focus:border-[#00ffc8]/25" /></label><label className="text-sm text-white/55">AI 等级<select value={level} onChange={(event) => setLevel(Number(event.target.value))} className="mt-2 w-full rounded-2xl border border-white/[0.05] bg-black/30 px-4 py-3 text-white outline-none focus:border-[#00ffc8]/25">{[1, 2, 3, 4, 5].map((item) => <option key={item} value={item}>{levelName(item)}</option>)}</select></label><label className="text-sm text-white/55">主力工具<input value={tool} onChange={(event) => setTool(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/[0.05] bg-black/30 px-4 py-3 text-white outline-none focus:border-[#00ffc8]/25" /></label></div><button onClick={callAiAvatar} disabled={avatarLoading} className="btn-lusion mt-4 !px-5 !py-3 !text-xs disabled:opacity-50"><Sparkles className="h-4 w-4" /> {avatarLoading ? "AI 头像生成中..." : "重新生成 AI 头像"}</button></LiquidGlassCard></motion.div> : null}

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
              <LiquidGlassCard className="p-5" mode="prominent" blurAmount={0.06} aberrationIntensity={1.4} cornerRadius={24}>
                <div className="mb-4 flex items-center gap-2"><Zap className="h-4 w-4 text-amber-300" /><h3 className="title-font text-lg font-bold text-white">身份卡亮点</h3></div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "等级", value: displayLevel, desc: "当前身份定位" },
                    { label: "主力工具", value: displayTool, desc: "核心装备标签" },
                    { label: "地区据点", value: card?.province || "未知地区", desc: "写入全国图谱" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-4">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">{item.label}</p>
                      <p className="mt-2 text-base font-bold text-white">{item.value}</p>
                      <p className="mt-2 text-sm text-white/40">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-4">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">传播建议</p>
                    <p className="mt-2 text-sm leading-7 text-white/65">先保存 PNG，再复制文案，最后选择微博、QQ 空间或微信朋友圈发布，分享成功率最高。</p>
                  </div>
                  <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-4">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">分享文件名</p>
                    <p className="mt-2 text-sm font-semibold text-white">ai-agent-card-{slug || "custom"}.png</p>
                    <p className="mt-2 text-xs text-white/40">符合当前下载命名规范</p>
                  </div>
                </div>
              </LiquidGlassCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <SharePanel title="AI Agent 身份卡" userNumber={card?.user_number ?? null} levelName={displayLevel} primaryTool={displayTool} slug={slug} imageUrl={aiAvatarUrl || undefined} onDownload={handleDownload} />
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}




