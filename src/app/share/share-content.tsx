"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toPng } from "html-to-image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, MapPin, RefreshCw, Sparkles, Trophy, Copy, Share2,
  CheckCircle2, Shield, Radio, Swords, Link2, Users, Flame, Wrench
} from "lucide-react";
import CountUp from "@/components/react-bits/CountUp";
import TiltedCard from "@/components/react-bits/TiltedCard";
import ShinyText from "@/components/react-bits/ShinyText";
import { generateAvatarSvg } from "@/lib/avatar";
import { levelName } from "@/lib/level";
import { toolColor, MOCK_RECENT_CARDS, MOCK_TOOLS } from "@/data/mock";
import { getQQShareUrl, getQZoneShareUrl, getWeiboShareUrl, initWxShare } from "@/lib/wechat-share";
import { fetchCard, generateAiAvatar } from "@/lib/api-client";
import { SURVEY_PROVINCES, buildIdentityId, deriveRole } from "@/lib/survey-service";
import { PageShell, Section } from "@/components/ui";
import ParticlesBG from "@/components/react-bits/ParticlesBG";
import LocalQrCode from "@/components/local-qr-code";

type IdentityCard = {
  id: string;
  nickname: string;
  ai_level: number;
  ai_level_name: string;
  primary_tool: string;
  tools: string[];
  avatar_seed: string;
  province: string;
  city: string;
  created_at: string;
  user_number: number;
  roleTitle: string;
  rarity: string;
  signalStrength: number;
  signature: string;
  scenarios: string[];
  generatedCardImageUrl?: string;
  generatedCardShareText?: string;
};

function StableSharePanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-cyan-300/14 bg-[linear-gradient(135deg,rgba(15,23,42,0.80),rgba(2,6,23,0.64))] p-5 shadow-[0_0_30px_rgba(34,211,238,0.10)] backdrop-blur-xl ${className}`}>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.022)_1px,transparent_1px)] bg-[size:28px_28px] opacity-25" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

const RARITY: Record<number, { name: string; color: string; border: string; label: string; accent: string; glow: string }> = {
  1: { name: "普通", color: "text-neutral-400", border: "border-neutral-500/30", label: "R", accent: "#737373", glow: "rgba(115,115,115,0.4)" },
  2: { name: "稀有", color: "text-[#00ffc8]", border: "border-[#00ffc8]/40", label: "SR", accent: "#00ffc8", glow: "rgba(0,255,200,0.5)" },
  3: { name: "史诗", color: "text-violet-300", border: "border-violet-400/40", label: "SSR", accent: "#a855f7", glow: "rgba(168,85,247,0.5)" },
  4: { name: "传说", color: "text-amber-300", border: "border-amber-400/40", label: "UR", accent: "#fbbf24", glow: "rgba(251,191,36,0.5)" },
  5: { name: "神话", color: "text-rose-300", border: "border-rose-400/40", label: "LR", accent: "#fb7185", glow: "rgba(251,113,133,0.5)" },
  6: { name: "Epic", color: "text-violet-300", border: "border-violet-400/40", label: "EPC", accent: "#a855f7", glow: "rgba(168,85,247,0.55)" },
  7: { name: "Legendary", color: "text-amber-300", border: "border-amber-400/40", label: "LGND", accent: "#fbbf24", glow: "rgba(251,191,36,0.6)" }
};

const POWER: Record<number, number> = { 1: 420, 2: 1380, 3: 3620, 4: 8721, 5: 16888, 6: 24860, 7: 36999 };

function pickRarity(level: number) {
  if (RARITY[level]) return RARITY[level];
  if (level >= 7) return RARITY[7];
  if (level >= 5) return RARITY[5];
  return RARITY[1];
}

function pickPower(level: number) {
  return POWER[level] ?? 420 + level * 4200;
}

function levelLongName(n: number): string {
  if (n >= 1 && n <= 5) return levelName(n);
  if (n === 6) return "L6 资深 Agent 玩家";
  if (n === 7) return "L7 顶级 AI 指挥官";
  if (n === 8) return "L8 传说级 Agent";
  return `Lv.${String(n).padStart(2, "0")} 传奇玩家`;
}

const TOOL_POOL = ["Codex", "Claude Code", "OpenCode", "Cursor", "DeepSeek", "豆包", "Kimi", "通义千问", "Dify", "n8n", "Ollama", "Cherry Studio", "Trae", "CodeBuddy"];
const SCENARIO_POOL = ["写代码", "写文章", "自动化工作流", "数据分析", "网站开发", "知识库问答", "本地模型部署", "NAS / Docker 运维", "投资分析", "学习研究"];
const PROVINCES = SURVEY_PROVINCES;
const CITY_MAP: Record<string, string[]> = {
  "北京": ["北京"], "上海": ["上海"], "广东": ["广州", "深圳", "东莞", "佛山"],
  "浙江": ["杭州", "宁波", "温州", "嘉兴"], "江苏": ["南京", "苏州", "无锡", "常州"],
  "四川": ["成都", "绵阳"], "湖北": ["武汉", "宜昌"], "福建": ["福州", "厦门", "泉州"],
  "湖南": ["长沙", "株洲"], "陕西": ["西安", "咸阳"], "重庆": ["重庆"], "天津": ["天津"],
  "辽宁": ["沈阳", "大连"], "山东": ["济南", "青岛", "烟台"], "河南": ["郑州", "洛阳"],
  "安徽": ["合肥", "芜湖"], "河北": ["石家庄", "唐山"], "山西": ["太原", "大同"],
  "内蒙古": ["呼和浩特", "包头"], "吉林": ["长春", "吉林"], "黑龙江": ["哈尔滨", "齐齐哈尔"],
  "江西": ["南昌", "赣州"], "广西": ["南宁", "桂林"], "海南": ["海口", "三亚"],
  "贵州": ["贵阳", "遵义"], "云南": ["昆明", "大理"], "西藏": ["拉萨", "日喀则"],
  "甘肃": ["兰州", "天水"], "青海": ["西宁", "海东"], "宁夏": ["银川", "吴忠"],
  "新疆": ["乌鲁木齐", "喀什"], "香港": ["香港"], "澳门": ["澳门"], "台湾": ["台北", "高雄"]
};

function buildFallbackCard(seedStr = "share-default-2026"): IdentityCard {
  const tools = ["Codex", "DeepSeek", "Ollama"];
  const scenarios = ["写代码", "本地模型部署", "知识库问答"];
  const role = deriveRole(scenarios);
  return {
    id: buildIdentityId(seedStr),
    nickname: "匿名 Agent",
    ai_level: 7,
    ai_level_name: "L7 顶级 AI 指挥官",
    primary_tool: tools[0],
    tools,
    avatar_seed: seedStr,
    province: "浙江",
    city: "杭州",
    created_at: "2026-06-05",
    user_number: 4821,
    roleTitle: role.title,
    rarity: "Epic",
    signalStrength: 87,
    signature: "用 AI 扩展自己的能力边界",
    scenarios
  };
}

function buildShareText(card: IdentityCard): string {
  return `我刚生成了我的 AI Agent 身份卡：${card.roleTitle} · Lv.${String(card.ai_level).padStart(2, "0")} · 据点 ${card.province} · ${card.city}。你也来测测你的 AI Agent 玩家等级。`;
}

function readSlugFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return new URLSearchParams(window.location.search).get("slug");
  } catch {
    return null;
  }
}

function normalizeStoredPassport(raw: unknown): IdentityCard {
  const fallback = buildFallbackCard();
  if (!raw || typeof raw !== "object") return fallback;
  const r = raw as Record<string, unknown>;
  const levelCandidate =
    typeof r.ai_level === "number" && Number.isFinite(r.ai_level)
      ? r.ai_level
      : typeof r.level === "number" && Number.isFinite(r.level)
        ? r.level
        : fallback.ai_level;
  const tools =
    Array.isArray(r.tools) && (r.tools as unknown[]).length > 0
      ? (r.tools as string[])
      : typeof r.primary_tool === "string" && r.primary_tool.length > 0
        ? [r.primary_tool]
        : fallback.tools;
  const scenarios =
    Array.isArray(r.scenarios) && (r.scenarios as unknown[]).length > 0
      ? (r.scenarios as string[])
      : fallback.scenarios;
  return {
    id: typeof r.id === "string" && r.id.length > 0 ? r.id : fallback.id,
    nickname:
      typeof r.nickname === "string" && r.nickname.trim().length > 0
        ? r.nickname
        : fallback.nickname,
    ai_level: levelCandidate,
    ai_level_name:
      typeof r.ai_level_name === "string" && r.ai_level_name.length > 0
        ? r.ai_level_name
        : levelLongName(levelCandidate),
    primary_tool:
      typeof r.primary_tool === "string" && r.primary_tool.length > 0
        ? r.primary_tool
        : tools[0] ?? fallback.primary_tool,
    tools,
    avatar_seed:
      typeof r.avatar_seed === "string" && r.avatar_seed.length > 0
        ? r.avatar_seed
        : typeof r.avatarSeed === "string" && r.avatarSeed.length > 0
          ? r.avatarSeed
          : fallback.avatar_seed,
    province:
      typeof r.province === "string" && r.province.trim().length > 0
        ? r.province
        : fallback.province,
    city:
      typeof r.city === "string" && r.city.trim().length > 0
        ? r.city
        : fallback.city,
    created_at:
      typeof r.created_at === "string" && r.created_at.length > 0
        ? r.created_at
        : typeof r.createdAt === "string" && r.createdAt.length > 0
          ? r.createdAt
          : fallback.created_at,
    user_number:
      typeof r.user_number === "number" && Number.isFinite(r.user_number)
        ? r.user_number
        : fallback.user_number,
    roleTitle:
      typeof r.roleTitle === "string" && r.roleTitle.trim().length > 0
        ? r.roleTitle
        : fallback.roleTitle,
    rarity: typeof r.rarity === "string" && r.rarity.length > 0 ? r.rarity : fallback.rarity,
    signalStrength:
      typeof r.signalStrength === "number" && Number.isFinite(r.signalStrength)
        ? r.signalStrength
        : fallback.signalStrength,
    signature:
      typeof r.signature === "string" && r.signature.trim().length > 0
        ? r.signature
        : fallback.signature,
    scenarios,
    generatedCardImageUrl:
      typeof r.generatedCardImageUrl === "string" && r.generatedCardImageUrl.length > 0
        ? r.generatedCardImageUrl
        : undefined,
    generatedCardShareText:
      typeof r.generatedCardShareText === "string" && r.generatedCardShareText.length > 0
        ? r.generatedCardShareText
        : undefined,
  };
}

export default function ShareContent() {
  const cardRef = useRef<HTMLDivElement>(null);

  const [card, setCard] = useState<IdentityCard>(() => buildFallbackCard());
  const [generating, setGenerating] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [aiAvatarUrl, setAiAvatarUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<"text" | "link" | null>(null);
  const [downloaded, setDownloaded] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    setSlug(readSlugFromUrl());
  }, []);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    fetchCard(slug)
      .then((data) => {
        if (cancelled || !data) return;
        setCard((prev) => ({
          ...prev,
          id: prev.id,
          nickname: data.nickname || prev.nickname,
          ai_level: data.ai_level || prev.ai_level,
          ai_level_name: data.ai_level_name || prev.ai_level_name,
          primary_tool: data.primary_tool || prev.primary_tool,
          tools: data.tools?.length ? data.tools : prev.tools,
          avatar_seed: data.avatar_seed || prev.avatar_seed,
          province: data.province || prev.province,
          created_at: data.created_at || prev.created_at,
          user_number: data.user_number || prev.user_number
        }));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem("ai-agent-passport-current");
      if (!stored) return;
      const parsed = JSON.parse(stored);
      setCard(normalizeStoredPassport(parsed));
    } catch {
      /* keep fallback on parse / access error */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setAvatarLoading(true);
    generateAiAvatar(card.avatar_seed, card.ai_level, card.tools)
      .then((url) => { if (!cancelled && url) setAiAvatarUrl(url); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setAvatarLoading(false); });
    return () => { cancelled = true; };
  }, [card.avatar_seed, card.ai_level, card.tools]);

  const pixelAvatarSvg = useMemo(
    () => generateAvatarSvg(card.avatar_seed, 280, card.ai_level, card.primary_tool),
    [card.avatar_seed, card.ai_level, card.primary_tool]
  );

  const currentLevel = card.ai_level;
  const rarity = pickRarity(currentLevel);
  const power = pickPower(currentLevel);
  const displayName = card.nickname;
  const displayLevelShort = `Lv.${String(currentLevel).padStart(2, "0")}`;
  const displayLevelLong = levelLongName(currentLevel);
  const displayTool = card.primary_tool;
  const shareText = card.generatedCardShareText || buildShareText(card);
  const shareUrl = slug ? `https://liusq.icu/share?slug=${slug}` : "https://liusq.icu/share";
  const passportCode = String(card.user_number).padStart(7, "0");
  const toolAccentColor = toolColor(displayTool);

  useEffect(() => {
    initWxShare({
      title: `${displayName} 的 AI Agent Passport`,
      desc: shareText,
      link: shareUrl,
      imgUrl: aiAvatarUrl || "https://liusq.icu/images/hero-bg.jpg"
    }).catch(() => {});
  }, [displayName, shareText, shareUrl, aiAvatarUrl]);

  const handleRegenerate = useCallback(() => {
    const seedStr = `regen-${Date.now()}`;
    const newTools = [...TOOL_POOL].sort(() => Math.random() - 0.5).slice(0, 3 + Math.floor(Math.random() * 2));
    const newScenarios = [...SCENARIO_POOL].sort(() => Math.random() - 0.5).slice(0, 3);
    const province = PROVINCES[Math.floor(Math.random() * PROVINCES.length)];
    const cities = CITY_MAP[province] || ["其他"];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const role = deriveRole(newScenarios);
    const newLevel = 1 + Math.floor(Math.random() * 7);
    setCard((prev) => ({
      ...prev,
      id: buildIdentityId(seedStr),
      avatar_seed: seedStr,
      primary_tool: newTools[0],
      tools: newTools,
      scenarios: newScenarios,
      roleTitle: role.title,
      province,
      city,
      ai_level: newLevel,
      ai_level_name: levelLongName(newLevel),
      signalStrength: 40 + Math.floor(Math.random() * 60),
      user_number: Math.floor(Math.random() * 9000) + 1000,
      created_at: new Date().toISOString().slice(0, 10)
    }));
    setShowLevelUp(true);
    setTimeout(() => setShowLevelUp(false), 2000);
  }, []);

  const handleDownload = useCallback(async () => {
    if (card.generatedCardImageUrl) {
      setGenerating(true);
      try {
        const response = await fetch(card.generatedCardImageUrl);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `ai-agent-card-${card.id}.png`;
        link.href = objectUrl;
        link.click();
        URL.revokeObjectURL(objectUrl);
        setDownloaded(true);
        setTimeout(() => setDownloaded(false), 2000);
      } catch {
        window.open(card.generatedCardImageUrl, "_blank", "noopener");
      } finally {
        setGenerating(false);
      }
      return;
    }
    if (!cardRef.current) {
      alert("下载功能准备中，可先截图分享");
      return;
    }
    setGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `ai-agent-passport-${card.id}.png`;
      link.href = dataUrl;
      link.click();
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    } catch {
      alert("下载功能准备中，可先截图分享");
    } finally {
      setGenerating(false);
    }
  }, [card.generatedCardImageUrl, card.id]);

  const handleCopyText = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(shareText).then(
      () => {
        setCopied("text");
        setTimeout(() => setCopied(null), 2000);
      },
      () => {}
    );
  }, [shareText]);

  const handleCopyLink = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(shareUrl).then(
      () => {
        setCopied("link");
        setTimeout(() => setCopied(null), 2000);
      },
      () => {}
    );
  }, [shareUrl]);

  const handleWeiboShare = useCallback(() => {
    if (typeof window === "undefined") return;
    window.open(getWeiboShareUrl(shareText, shareUrl), "_blank", "noopener");
  }, [shareText, shareUrl]);

  const handleQZoneShare = useCallback(() => {
    if (typeof window === "undefined") return;
    window.open(
      getQZoneShareUrl(`${displayName} 的 AI Agent Passport`, shareText, shareUrl, aiAvatarUrl || ""),
      "_blank",
      "noopener"
    );
  }, [shareText, shareUrl, aiAvatarUrl, displayName]);

  const sameCity = MOCK_RECENT_CARDS.slice(0, 3);
  const sameCamp = MOCK_RECENT_CARDS.slice(1, 4);
  const topTools = MOCK_TOOLS.slice(0, 5);

  return (
    <main className="relative min-h-screen overflow-hidden pb-16 pt-0">
      <ParticlesBG className="opacity-20" count={20} />

      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[5%] top-[10%] h-[30rem] w-[30rem] rounded-full bg-[rgba(168,85,247,0.25)] blur-[140px]" />
        <div className="absolute right-[8%] top-[15%] h-[25rem] w-[25rem] rounded-full bg-[rgba(0,229,255,0.22)] blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[rgba(251,191,36,0.15)] blur-[130px]" />
      </div>

      <Section className="relative z-10" spacing="sm">
        <PageShell width="wide">
          <div className="mb-8 text-center">
            <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-300/[0.05] px-5 py-2.5 backdrop-blur-xl">
              <Radio className="h-4 w-4 text-cyan-300" />
              <span className="title-font text-[11px] font-bold tracking-[0.32em] text-cyan-300">AGENT PASSPORT</span>
            </div>
            <h1 className="title-font block text-5xl font-black leading-[0.98] tracking-[-0.04em] text-white drop-shadow-[0_0_36px_rgba(34,211,238,0.28)] sm:text-6xl lg:text-7xl">
              AI Agent <span className="gradient-text-rb">身份卡已生成</span>
            </h1>
            <p className="mx-auto mt-5 max-w-[640px] text-lg font-medium text-white/74">
              这是你的 AI 装备、作战场景和城市信号组成的专属数字身份。
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
            <motion.div initial={false} className="flex justify-center lg:justify-start">
              {card.generatedCardImageUrl ? (
                <div
                  ref={cardRef}
                  className="relative w-full max-w-[430px] overflow-hidden rounded-[28px] border border-cyan-300/24 bg-black shadow-[0_0_70px_rgba(34,211,238,0.18)]"
                  style={{ aspectRatio: "4/5" }}
                >
                  <img
                    src={card.generatedCardImageUrl}
                    alt={`${displayName} 的 AI Agent 身份卡`}
                    className="h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-white/10" />
                </div>
              ) : (
                <TiltedCard maxTilt={8} scale={1.02}>
                  <div
                    ref={cardRef}
                    className="relative overflow-hidden rounded-[28px] border-2 bg-[#05060a]"
                    style={{
                    aspectRatio: "3/4",
                    width: "100%",
                    maxWidth: "380px",
                    borderColor: rarity.glow,
                    boxShadow: `0 0 60px -10px ${rarity.glow}, 0 30px 80px -20px rgba(0,0,0,0.8)`
                  }}
                >
                  <div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgba(0,255,200,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,200,0.06)_1px,transparent_1px)] bg-[size:24px_24px]" />
                  <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.15),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.12),transparent_40%)]" />
                  <div aria-hidden className="scanline" />
                  <div aria-hidden className="hero-noise opacity-40" />

                  <div className="relative z-10 flex h-full flex-col p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" style={{ color: rarity.accent }} />
                        <span className="title-font text-[10px] font-bold tracking-[0.24em] text-white/70">AI AGENT MAP</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="title-font rounded-full border px-2.5 py-1 text-[10px] font-black"
                          style={{ color: rarity.accent, borderColor: rarity.border, background: `${rarity.accent}15` }}
                        >
                          {rarity.label}
                        </span>
                        <span className="title-font font-mono text-[10px] text-white/55">{card.id}</span>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col items-center">
                      <div
                        className="relative overflow-hidden rounded-[20px] border-2"
                        style={{
                          width: "150px",
                          height: "150px",
                          borderColor: rarity.accent,
                          boxShadow: `0 0 40px -8px ${rarity.glow}, inset 0 0 30px -10px ${rarity.glow}`
                        }}
                      >
                        {aiAvatarUrl ? (
                          <img src={aiAvatarUrl} alt="ai-avatar" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full" dangerouslySetInnerHTML={{ __html: pixelAvatarSvg }} />
                        )}
                        {avatarLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                            <Sparkles className="h-7 w-7 animate-spin text-cyan-300" />
                          </div>
                        )}
                      </div>
                      <h2 className="title-font mt-4 text-2xl font-black text-white">{displayName}</h2>
                      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                        <span
                          className="title-font rounded-full border px-3 py-1 text-[11px] font-bold"
                          style={{ color: rarity.accent, borderColor: rarity.border }}
                        >
                          {displayLevelShort} · {card.roleTitle}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[10px] text-white/55">{displayLevelLong}</p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2.5">
                      <div className="rounded-xl border border-white/[0.08] bg-black/30 p-2.5 text-center">
                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">战斗力</p>
                        <p className="title-font mt-1 text-base font-black" style={{ color: rarity.accent }}>
                          <CountUp to={power} duration={1.5} />
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/[0.08] bg-black/30 p-2.5 text-center">
                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">信号</p>
                        <p className="title-font mt-1 text-base font-black text-white">
                          <CountUp to={card.signalStrength} duration={1.4} />%
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 rounded-xl border border-white/[0.06] bg-black/20 p-3">
                      <div className="mb-1.5 flex items-center gap-2">
                        <Swords className="h-3.5 w-3.5" style={{ color: toolAccentColor }} />
                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">装备</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {card.tools.slice(0, 4).map((t) => (
                          <span
                            key={t}
                            className="title-font rounded-full border px-2.5 py-1 text-[10px] font-bold"
                            style={{
                              color: toolColor(t),
                              borderColor: `${toolColor(t)}40`,
                              background: `${toolColor(t)}10`
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-2.5 rounded-xl border border-white/[0.06] bg-black/20 p-3">
                      <p className="mb-1.5 text-[9px] uppercase tracking-[0.2em] text-white/40">场景</p>
                      <div className="flex flex-wrap gap-1.5">
                        {card.scenarios.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="title-font rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] text-white/75"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-2.5 grid grid-cols-2 gap-2 text-[10px] text-white/55">
                      <div>
                        <p className="uppercase tracking-[0.2em] text-white/30">据点</p>
                        <p className="title-font mt-0.5 text-white/85">{card.province} · {card.city}</p>
                      </div>
                      <div className="text-right">
                        <p className="uppercase tracking-[0.2em] text-white/30">创建于</p>
                        <p className="title-font mt-0.5 text-white/85">{card.created_at}</p>
                      </div>
                    </div>

                    <div className="mt-auto flex items-end justify-between pt-3">
                      <p className="title-font max-w-[60%] text-[10px] italic text-white/45">&ldquo;{card.signature}&rdquo;</p>
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.02]">
                        <LocalQrCode value={shareUrl} size={42} />
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {showLevelUp && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.5, y: -30 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute inset-0 flex items-center justify-center bg-black/70"
                      >
                        <div className="text-center">
                          <ShinyText
                            text="REGENERATED!"
                            className="title-font text-3xl font-black"
                            speed={3}
                            shineColor={rarity.accent}
                          />
                          <p className="title-font mt-2 text-sm text-white/70">新身份: {card.roleTitle}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </TiltedCard>
              )}
            </motion.div>
            <motion.div initial={false} className="space-y-5">
              <StableSharePanel>
                <div className="mb-4 flex items-center gap-3">
                  <Share2 className="h-5 w-5 text-violet-300" />
                  <h3 className="title-font text-lg font-bold text-white">身份卡操作</h3>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={handleDownload}
                    disabled={generating}
                    className="btn-rb-fill w-full !justify-center disabled:opacity-60"
                  >
                    {generating ? (
                      <>
                        <Sparkles className="h-4 w-4 animate-spin" />
                        正在生成 PNG...
                      </>
                    ) : downloaded ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        已保存!
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        下载身份卡
                      </>
                    )}
                  </button>
                  <button onClick={handleCopyText} className="btn-rb-ghost w-full !justify-start">
                    {copied === "text" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span>{copied === "text" ? "已复制分享文案!" : "复制分享文案"}</span>
                  </button>
                  <button onClick={handleRegenerate} className="btn-rb-ghost w-full !justify-start">
                    <RefreshCw className="h-4 w-4" />
                    <span>重新生成</span>
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/map" className="btn-rb-ghost !justify-center">
                      <MapPin className="h-4 w-4" />
                      <span>查看全国地图</span>
                    </Link>
                    <Link href="/ranking" className="btn-rb-ghost !justify-center">
                      <Trophy className="h-4 w-4" />
                      <span>查看排行榜</span>
                    </Link>
                  </div>
                </div>
              </StableSharePanel>

              <StableSharePanel>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Copy className="h-5 w-5 text-cyan-300" />
                    <h3 className="title-font text-base font-bold text-white">分享文案</h3>
                  </div>
                  <button
                    onClick={handleCopyText}
                    className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold text-cyan-300 transition hover:bg-cyan-300/20"
                  >
                    {copied === "text" ? "已复制" : "一键复制"}
                  </button>
                </div>
                <p className="rounded-xl border border-white/[0.08] bg-black/30 p-3 text-[13px] leading-relaxed text-white/85">
                  {shareText}
                </p>
              </StableSharePanel>

              <StableSharePanel>
                <div className="mb-4 flex items-center gap-3">
                  <Link2 className="h-5 w-5 text-violet-300" />
                  <h3 className="title-font text-lg font-bold text-white">分享到社交平台</h3>
                </div>
                <div className="space-y-3">
                  <button onClick={handleCopyLink} className="btn-rb-ghost w-full !justify-start">
                    {copied === "link" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    ) : (
                      <Link2 className="h-4 w-4" />
                    )}
                    <span>{copied === "link" ? "链接已复制!" : "复制身份卡链接"}</span>
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleWeiboShare}
                      className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm font-semibold text-white/80 hover:border-red-400/30 hover:bg-red-500/10"
                    >
                      <span className="text-base">📱</span> 微博
                    </button>
                    <button
                      onClick={handleQZoneShare}
                      className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm font-semibold text-white/80 hover:border-yellow-400/30 hover:bg-yellow-500/10"
                    >
                      <span className="text-base">💬</span> QQ空间
                    </button>
                  </div>
                </div>
              </StableSharePanel>

              <StableSharePanel>
                <div className="mb-4 flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-amber-300" />
                  <h3 className="title-font text-lg font-bold text-white">身份档案数据</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/55">身份 ID</span>
                    <span className="title-font font-mono text-sm font-bold text-white/85">{card.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/55">身份等级</span>
                    <span className="title-font font-bold" style={{ color: rarity.accent }}>
                      {displayLevelShort} · {card.roleTitle}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/55">稀有度</span>
                    <span className="title-font font-bold" style={{ color: rarity.accent }}>
                      {rarity.label} · {rarity.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/55">战斗力</span>
                    <CountUp to={power} className="title-font font-bold text-white" duration={1.2} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/55">信号强度</span>
                    <span className="title-font font-bold text-white">
                      <CountUp to={card.signalStrength} className="title-font font-bold text-white" duration={1.2} />%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/55">主力装备</span>
                    <span className="title-font font-bold" style={{ color: toolAccentColor }}>
                      {displayTool}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/55">城市据点</span>
                    <span className="title-font font-bold text-white">{card.province} · {card.city}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/55">护照编号</span>
                    <span className="title-font font-mono text-sm font-bold text-white/70">
                      #{passportCode}
                    </span>
                  </div>
                </div>
              </StableSharePanel>
            </motion.div>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-xl">
              <div className="mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-cyan-300" />
                <h4 className="title-font text-sm font-bold tracking-wider text-white/80">同城玩家</h4>
                <span className="ml-auto text-[10px] text-white/40">{card.province} · {card.city}</span>
              </div>
              <ul className="space-y-2">
                {sameCity.map((p, i) => (
                  <li key={i} className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-black/20 px-3 py-2 text-[12px]">
                    <span className="title-font text-white/85">{p.nickname}</span>
                    <span className="text-white/45">{p.primary_tool}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-xl">
              <div className="mb-3 flex items-center gap-2">
                <Flame className="h-4 w-4 text-violet-300" />
                <h4 className="title-font text-sm font-bold tracking-wider text-white/80">同阵营玩家</h4>
                <span className="ml-auto text-[10px] text-white/40">{displayTool}</span>
              </div>
              <ul className="space-y-2">
                {sameCamp.map((p, i) => (
                  <li key={i} className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-black/20 px-3 py-2 text-[12px]">
                    <span className="title-font text-white/85">{p.nickname}</span>
                    <span className="text-white/45">{p.province}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-xl">
              <div className="mb-3 flex items-center gap-2">
                <Wrench className="h-4 w-4 text-amber-300" />
                <h4 className="title-font text-sm font-bold tracking-wider text-white/80">热门装备</h4>
                <span className="ml-auto text-[10px] text-white/40">TOP 5</span>
              </div>
              <ul className="space-y-2">
                {topTools.map((t, i) => (
                  <li key={i} className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-black/20 px-3 py-2 text-[12px]">
                    <span className="flex items-center gap-2">
                      <span className="title-font w-4 text-white/40">{i + 1}</span>
                      <span className="title-font text-white/85" style={{ color: toolColor(t.name) }}>{t.name}</span>
                    </span>
                    <span className="text-white/45">{t.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </PageShell>
      </Section>
    </main>
  );
}

