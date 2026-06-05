"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Crown, Flame, MapPin, Radio, Shield, Sparkles, Swords, Trophy, TrendingUp, Users,
  Target, Zap, ArrowRight, Award, Medal, Star, Code, Cpu, Network, BookOpen,
  FileText, Brain, Activity, ChevronRight, Gem, Hash
} from "lucide-react";
import CountUp from "@/components/react-bits/CountUp";
import LiquidGlassCard from "@/components/react-bits/LiquidGlassCard";
import { PageShell, Section } from "@/components/ui";
import { toolColor, MOCK_OVERVIEW, MOCK_PROVINCES, MOCK_TOOLS, MOCK_RECENT_CARDS } from "@/data/mock";

type ToolRank = { id: string; name: string; category: string; users: number; heat: number; growthRate: number };
type CityRank = { id: string; city: string; province: string; users: number; topRole: string; topTool: string; growthRate: number };
type ProvinceRank = { id: string; province: string; users: number; cityCount: number; topTool: string; growthRate: number };
type RoleRank = { id: string; role: string; users: number; share: number; topTool: string; growthRate: number; description: string; icon: typeof Code };
type LatestPassport = { id: string; nickname: string; city: string; province: string; role: string; level: number; tools: string[]; signalStrength: number; createdAt: string };

const TOOL_RANKING: ToolRank[] = [
  { id: "t-codex", name: "Codex", category: "Agent", users: 188, heat: 100, growthRate: 24 },
  { id: "t-cc", name: "Claude Code", category: "Agent", users: 162, heat: 86, growthRate: 31 },
  { id: "t-oc", name: "OpenCode", category: "Agent", users: 128, heat: 68, growthRate: 42 },
  { id: "t-cu", name: "Cursor", category: "Agent", users: 96, heat: 51, growthRate: 18 },
  { id: "t-ds", name: "DeepSeek", category: "App", users: 142, heat: 75, growthRate: 12 },
  { id: "t-db", name: "豆包", category: "App", users: 118, heat: 62, growthRate: 9 },
  { id: "t-km", name: "Kimi", category: "App", users: 84, heat: 44, growthRate: 14 },
  { id: "t-ty", name: "通义千问", category: "App", users: 72, heat: 38, growthRate: 7 },
  { id: "t-dify", name: "Dify", category: "Automation", users: 88, heat: 46, growthRate: 22 },
  { id: "t-n8n", name: "n8n", category: "Automation", users: 64, heat: 34, growthRate: 19 },
  { id: "t-ollama", name: "Ollama", category: "Local", users: 56, heat: 30, growthRate: 28 }
];

const CITY_RANKING: CityRank[] = [
  { id: "c-bj", city: "北京", province: "北京", users: 156, topRole: "代码指挥官", topTool: "Claude Code", growthRate: 22 },
  { id: "c-sh", city: "上海", province: "上海", users: 184, topRole: "数据分析师", topTool: "Codex", growthRate: 18 },
  { id: "c-sz", city: "深圳", province: "广东", users: 142, topRole: "自动化玩家", topTool: "n8n", growthRate: 27 },
  { id: "c-hz", city: "杭州", province: "浙江", users: 128, topRole: "知识库构建者", topTool: "Dify", growthRate: 24 },
  { id: "c-gz", city: "广州", province: "广东", users: 96, topRole: "AI 探索者", topTool: "DeepSeek", growthRate: 11 },
  { id: "c-cd", city: "成都", province: "四川", users: 84, topRole: "内容生产者", topTool: "Kimi", growthRate: 28 },
  { id: "c-nj", city: "南京", province: "江苏", users: 72, topRole: "代码指挥官", topTool: "Cursor", growthRate: 19 },
  { id: "c-wh", city: "武汉", province: "湖北", users: 64, topRole: "本地模型驯养师", topTool: "Ollama", growthRate: 16 },
  { id: "c-xa", city: "西安", province: "陕西", users: 58, topRole: "代码指挥官", topTool: "Claude Code", growthRate: 13 },
  { id: "c-cq", city: "重庆", province: "重庆", users: 52, topRole: "AI 探索者", topTool: "OpenCode", growthRate: 17 }
];

const PROVINCE_RANKING: ProvinceRank[] = [
  { id: "p-gd", province: "广东", users: 312, cityCount: 5, topTool: "Codex", growthRate: 19 },
  { id: "p-bj", province: "北京", users: 256, cityCount: 1, topTool: "Claude Code", growthRate: 22 },
  { id: "p-sh", province: "上海", users: 248, cityCount: 1, topTool: "Codex", growthRate: 15 },
  { id: "p-zj", province: "浙江", users: 196, cityCount: 4, topTool: "Dify", growthRate: 24 },
  { id: "p-js", province: "江苏", users: 172, cityCount: 4, topTool: "DeepSeek", growthRate: 16 },
  { id: "p-sc", province: "四川", users: 138, cityCount: 3, topTool: "Kimi", growthRate: 28 },
  { id: "p-hb", province: "湖北", users: 116, cityCount: 3, topTool: "Ollama", growthRate: 12 },
  { id: "p-sd", province: "山东", users: 102, cityCount: 3, topTool: "DeepSeek", growthRate: 18 },
  { id: "p-hn", province: "河南", users: 88, cityCount: 3, topTool: "豆包", growthRate: 14 },
  { id: "p-sx", province: "陕西", users: 82, cityCount: 2, topTool: "Cursor", growthRate: 11 },
  { id: "p-fj", province: "福建", users: 76, cityCount: 3, topTool: "n8n", growthRate: 9 },
  { id: "p-cq", province: "重庆", users: 68, cityCount: 1, topTool: "OpenCode", growthRate: 17 }
];

const ROLE_RANKING: RoleRank[] = [
  { id: "r-code", role: "代码指挥官", users: 326, share: 25, topTool: "Codex", growthRate: 28, description: "在 IDE 与终端之间调度 AI Agent，重塑生产流水线。", icon: Code },
  { id: "r-auto", role: "自动化玩家", users: 214, share: 17, topTool: "n8n", growthRate: 22, description: "用工作流串联工具链，让机器替你完成重复劳动。", icon: Network },
  { id: "r-content", role: "内容生产者", users: 184, share: 14, topTool: "Kimi", growthRate: 18, description: "把灵感、笔记和创作交给 AI，把风格留给自己。", icon: FileText },
  { id: "r-local", role: "本地模型驯养师", users: 142, share: 11, topTool: "Ollama", growthRate: 35, description: "把大模型装进 NAS、矿机与笔记本，掌控自己的智能。", icon: Cpu },
  { id: "r-kb", role: "知识库构建者", users: 116, share: 9, topTool: "Dify", growthRate: 24, description: "搭建 RAG 与企业私域知识，让 AI 学会你公司的话。", icon: BookOpen },
  { id: "r-data", role: "数据分析师", users: 96, share: 7, topTool: "DeepSeek", growthRate: 13, description: "在 SQL、财报、量化信号里寻找下一个真相。", icon: Activity },
  { id: "r-explorer", role: "AI 探索者", users: 218, share: 17, topTool: "豆包", growthRate: 9, description: "走在 AI 工具的最前沿，等待下一个新大陆。", icon: Brain }
];

const LATEST_PASSPORTS: LatestPassport[] = [
  { id: "AAM-2026-9421", nickname: "QuantumCat", city: "上海", province: "上海", role: "代码指挥官", level: 7, tools: ["Codex", "Claude Code"], signalStrength: 92, createdAt: "刚刚" },
  { id: "AAM-2026-9418", nickname: "DeepFox", city: "北京", province: "北京", role: "本地模型驯养师", level: 8, tools: ["Ollama", "OpenCode"], signalStrength: 95, createdAt: "2 分钟前" },
  { id: "AAM-2026-9412", nickname: "RAG_Zero", city: "杭州", province: "浙江", role: "知识库构建者", level: 6, tools: ["Dify", "Codex"], signalStrength: 87, createdAt: "5 分钟前" },
  { id: "AAM-2026-9407", nickname: "FlowSmith", city: "深圳", province: "广东", role: "自动化玩家", level: 5, tools: ["n8n", "Dify"], signalStrength: 81, createdAt: "8 分钟前" },
  { id: "AAM-2026-9401", nickname: "CodeNova", city: "杭州", province: "浙江", role: "代码指挥官", level: 4, tools: ["Claude Code", "Codex"], signalStrength: 76, createdAt: "12 分钟前" },
  { id: "AAM-2026-9396", nickname: "PromptFox", city: "北京", province: "北京", role: "AI 探索者", level: 3, tools: ["DeepSeek", "豆包"], signalStrength: 68, createdAt: "15 分钟前" },
  { id: "AAM-2026-9388", nickname: "Agent_0x1", city: "上海", province: "上海", role: "数据分析师", level: 4, tools: ["Codex", "DeepSeek"], signalStrength: 79, createdAt: "21 分钟前" },
  { id: "AAM-2026-9379", nickname: "ByteTamer", city: "成都", province: "四川", role: "内容生产者", level: 5, tools: ["Kimi", "Claude Code"], signalStrength: 84, createdAt: "28 分钟前" }
];

const TABS = ["tools", "cities", "provinces", "roles", "latest"] as const;
type TabKey = (typeof TABS)[number];

const MEDAL: Record<number, { label: string; tone: string; glow: string; gradient: string; ring: string; emoji: string }> = {
  1: { label: "CHAMPION", tone: "#fbbf24", glow: "rgba(251,191,36,0.65)", gradient: "linear-gradient(135deg,rgba(251,191,36,0.18),rgba(251,113,133,0.08))", ring: "border-amber-300/40", emoji: "🥇" },
  2: { label: "RUNNER-UP", tone: "#cbd5e1", glow: "rgba(203,213,225,0.55)", gradient: "linear-gradient(135deg,rgba(203,213,225,0.16),rgba(148,163,184,0.06))", ring: "border-slate-200/35", emoji: "🥈" },
  3: { label: "BRONZE", tone: "#fb923c", glow: "rgba(251,146,60,0.55)", gradient: "linear-gradient(135deg,rgba(251,146,60,0.16),rgba(217,119,6,0.06))", ring: "border-orange-300/35", emoji: "🥉" }
};

function RankBadge({ rank }: { rank: number }) {
  const medal = MEDAL[rank];
  if (medal) {
    return (
      <div className="relative flex h-10 w-10 items-center justify-center">
        <div className="absolute inset-0 rounded-full opacity-80 blur-md" style={{ background: medal.glow }} />
        <div className={"relative flex h-10 w-10 items-center justify-center rounded-full border bg-black/60 " + medal.ring}>
          <span className="title-font text-base font-black" style={{ color: medal.tone }}>{rank}</span>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-black/30">
      <span className="title-font text-sm font-bold text-white/60">{rank}</span>
    </div>
  );
}

function RowShell({
  rank, primary, secondary, badge, value, energy, growth, accent, isTop3
}: {
  rank: number;
  primary: string;
  secondary: string;
  badge?: string;
  value: number;
  energy: number;
  growth: number;
  accent: string;
  isTop3: boolean;
}) {
  const medal = MEDAL[rank];
  return (
    <div
      className={
        "group relative grid grid-cols-[44px_minmax(0,1fr)_minmax(0,1fr)_120px] items-center gap-3 overflow-hidden rounded-2xl border p-3.5 transition-all duration-300 hover:-translate-y-0.5 sm:gap-4 sm:p-4 " +
        (isTop3 ? medal!.ring : "border-white/[0.06] hover:border-white/[0.14]")
      }
      style={isTop3 ? { background: medal!.gradient, boxShadow: `0 0 24px -8px ${medal!.glow}` } : { background: "rgba(8,10,16,0.35)" }}
    >
      <RankBadge rank={rank} />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="title-font truncate text-sm font-black text-white sm:text-base">{primary}</span>
          {badge && <span className="title-font rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[9px] uppercase tracking-[0.18em] text-white/65">{badge}</span>}
        </div>
        <p className="mt-0.5 truncate text-[11px] text-white/50">{secondary}</p>
      </div>
      <div className="hidden sm:block">
        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.max(8, Math.min(100, energy))}%`,
              background: `linear-gradient(90deg, ${accent}, ${accent}55)`,
              boxShadow: `0 0 12px ${accent}55`
            }}
          />
        </div>
        <div className="mt-1 flex items-center justify-between text-[9px] uppercase tracking-[0.18em] text-white/35">
          <span>热度</span>
          <span style={{ color: accent }}>{Math.round(energy)}%</span>
        </div>
      </div>
      <div className="text-right">
        <div className="title-font text-base font-black text-white sm:text-lg">
          <CountUp to={value} duration={1.2} />
        </div>
        <div className="mt-0.5 text-[10px] font-bold text-emerald-300">+{growth}%</div>
      </div>
    </div>
  );
}

function RoleCard({ r, rank, isTop3 }: { r: RoleRank; rank: number; isTop3: boolean }) {
  const Icon = r.icon;
  const medal = MEDAL[rank];
  return (
    <div
      className={
        "group relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-1 " +
        (isTop3 ? medal!.ring : "border-white/[0.06] hover:border-white/[0.14]")
      }
      style={
        isTop3
          ? { background: medal!.gradient, boxShadow: `0 0 28px -8px ${medal!.glow}` }
          : { background: "rgba(8,10,16,0.4)" }
      }
    >
      <div className="flex items-start gap-3">
        <RankBadge rank={rank} />
        <div className="flex h-10 w-10 flex-1 items-center justify-center rounded-xl border border-white/[0.08] bg-black/30">
          <Icon className="h-5 w-5" style={{ color: isTop3 ? medal!.tone : "#22d3ee" }} />
        </div>
      </div>
      <p className="mt-3 title-font text-base font-black text-white">{r.role}</p>
      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-white/55">{r.description}</p>
      <div className="mt-3 flex items-end justify-between">
        <div>
          <p className="title-font text-2xl font-black text-white">
            <CountUp to={r.users} duration={1.3} />
          </p>
          <p className="text-[10px] text-white/40">占比 {r.share}% · 主力 {r.topTool}</p>
        </div>
        <span className="rounded-md border border-emerald-400/20 bg-emerald-400/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">+{r.growthRate}%</span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.05]">
        <div className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee,#a855f7,#fb7185)]" style={{ width: `${Math.min(100, r.share * 3)}%` }} />
      </div>
    </div>
  );
}

function PassportMiniCard({ p, rank }: { p: LatestPassport; rank: number }) {
  const medal = MEDAL[rank];
  const isTop3 = rank <= 3;
  const accent = isTop3 ? medal!.tone : "#22d3ee";
  const ring = isTop3 ? medal!.ring : "border-white/[0.06]";
  return (
    <div
      className={"group relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-1 " + ring}
      style={
        isTop3
          ? { background: medal!.gradient, boxShadow: `0 0 24px -10px ${medal!.glow}` }
          : { background: "rgba(8,10,16,0.4)" }
      }
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <RankBadge rank={rank} />
          <div className="rounded-md border px-1.5 py-0.5 font-mono text-[9px]" style={{ color: accent, borderColor: `${accent}40`, background: `${accent}10` }}>{p.id}</div>
        </div>
        <div className="rounded-md border border-cyan-300/30 bg-cyan-300/10 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300">Lv.{String(p.level).padStart(2, "0")}</div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2" style={{ borderColor: accent, boxShadow: `0 0 12px -2px ${accent}80` }}>
          <span className="title-font text-base font-black" style={{ color: accent }}>{p.nickname.slice(0, 1).toUpperCase()}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="title-font truncate text-sm font-black text-white">{p.nickname}</p>
          <p className="truncate text-[11px] text-white/55">{p.role} · {p.city}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {p.tools.slice(0, 3).map((t) => (
          <span key={t} className="title-font rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] text-white/75">{t}</span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] text-white/40">
        <span className="flex items-center gap-1">
          <Radio className="h-3 w-3 text-cyan-300" />
          信号 <span className="title-font font-bold text-white">{p.signalStrength}%</span>
        </span>
        <span>{p.createdAt}</span>
      </div>
    </div>
  );
}

function ChampionDashboard() {
  const tool = TOOL_RANKING[0];
  const city = CITY_RANKING[0];
  const highest = LATEST_PASSPORTS.reduce((a, b) => (a.level > b.level ? a : b));
  const fastest = ROLE_RANKING.reduce((a, b) => (a.growthRate > b.growthRate ? a : b));
  const energy = 88;
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-amber-300/20 bg-[linear-gradient(135deg,rgba(251,191,36,0.10),rgba(168,85,247,0.06))] p-6 shadow-[0_0_72px_rgba(251,191,36,0.18)] backdrop-blur-2xl sm:p-7">
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgba(251,191,36,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(251,191,36,0.04)_1px,transparent_1px)] bg-[size:28px_28px] opacity-40" />
      <div aria-hidden className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-amber-300/30 blur-[100px]" />
      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="title-font text-[10px] uppercase tracking-[0.3em] text-amber-300/80">Champion Dashboard</p>
            <h2 className="title-font mt-2 text-2xl font-black text-white sm:text-3xl">冠军仪表盘</h2>
          </div>
          <Crown className="h-9 w-9 text-amber-300 drop-shadow-[0_0_14px_rgba(251,191,36,0.7)]" />
        </div>

        <div className="mb-5 flex items-center gap-4">
          <div className="relative flex h-24 w-24 items-center justify-center">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
              <circle
                cx="50" cy="50" r="44" fill="none"
                stroke="url(#champion-ring)" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${(energy / 100) * 276} 276`}
                style={{ filter: "drop-shadow(0 0 8px rgba(251,191,36,0.6))" }}
              />
              <defs>
                <linearGradient id="champion-ring" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="60%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex flex-col items-center">
              <span className="title-font text-3xl font-black text-white">{tool.heat}</span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-amber-300/80">HEAT</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">Current Champion Tool</p>
            <p className="title-font mt-1 text-3xl font-black text-white drop-shadow-[0_0_18px_rgba(34,211,238,0.4)]" style={{ color: toolColor(tool.name) }}>{tool.name}</p>
            <p className="mt-1 text-[11px] text-white/55">{tool.users} 次装配 · 增长 +{tool.growthRate}% · 类别 {tool.category}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "冠军城市", value: city.city, sub: `${city.users} 信号`, icon: MapPin, tone: "#22d3ee" },
            { label: "最高等级", value: `Lv.${String(highest.level).padStart(2, "0")}`, sub: highest.nickname, icon: Trophy, tone: "#fbbf24" },
            { label: "增长最快", value: fastest.role, sub: `+${fastest.growthRate}%`, icon: TrendingUp, tone: "#10b981" }
          ].map((it) => {
            const Icon = it.icon;
            return (
              <div key={it.label} className="rounded-xl border border-white/[0.08] bg-black/30 p-3">
                <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] text-white/40">
                  <Icon className="h-3 w-3" style={{ color: it.tone }} />
                  {it.label}
                </div>
                <p className="title-font mt-1.5 truncate text-base font-black text-white">{it.value}</p>
                <p className="mt-0.5 truncate text-[10px] text-white/45">{it.sub}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function RankingPage() {
  const [tab, setTab] = useState<TabKey>("tools");

  const stats = useMemo(() => {
    const champTool = TOOL_RANKING[0];
    const champCity = CITY_RANKING[0];
    const highestLevel = LATEST_PASSPORTS.reduce((a, b) => (a.level > b.level ? a : b));
    return [
      { label: "总上榜玩家", value: MOCK_OVERVIEW.total, icon: Users, tone: "#22d3ee" },
      { label: "最热工具", value: champTool.name, icon: Swords, tone: "#a855f7", isText: true },
      { label: "最强城市", value: `${champCity.city} · ${champCity.users}`, icon: MapPin, tone: "#fbbf24", isText: true },
      { label: "最高等级", value: `Lv.${String(highestLevel.level).padStart(2, "0")}`, icon: Trophy, tone: "#fb7185", isText: true },
      { label: "本周新增", value: MOCK_OVERVIEW.todayNew * 7, icon: Sparkles, tone: "#10b981" },
      { label: "增长最快", value: `+${TOOL_RANKING[2].growthRate}%`, icon: TrendingUp, tone: "#06b6d4", isText: true }
    ];
  }, []);

  const tabMeta: Record<TabKey, { label: string; icon: typeof Swords; accent: string; total: number }> = {
    tools: { label: "工具榜", icon: Swords, accent: "#a855f7", total: TOOL_RANKING.length },
    cities: { label: "城市榜", icon: MapPin, accent: "#22d3ee", total: CITY_RANKING.length },
    provinces: { label: "省份榜", icon: Shield, accent: "#fbbf24", total: PROVINCE_RANKING.length },
    roles: { label: "角色榜", icon: Code, accent: "#fb7185", total: ROLE_RANKING.length },
    latest: { label: "最新身份卡", icon: Hash, accent: "#10b981", total: LATEST_PASSPORTS.length }
  };

  return (
    <main className="relative min-h-screen overflow-hidden pb-20 pt-4">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[8%] top-[10%] h-[28rem] w-[28rem] rounded-full bg-[rgba(168,85,247,0.20)] blur-[140px]" />
        <div className="absolute right-[6%] top-[16%] h-[26rem] w-[26rem] rounded-full bg-[rgba(251,191,36,0.18)] blur-[130px]" />
        <div className="absolute bottom-0 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[rgba(0,229,255,0.15)] blur-[140px]" />
      </div>

      <Section className="relative z-10" spacing="md">
        <PageShell width="wide">
          {/* HERO */}
          <section className="mb-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
            <motion.div initial={false} className="flex flex-col justify-center space-y-6">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-cyan-300/20 bg-cyan-300/[0.05] px-4 py-2 backdrop-blur-xl">
                <Trophy className="h-4 w-4 text-cyan-300" />
                <span className="title-font text-[11px] font-bold tracking-[0.32em] text-cyan-300">NATIONAL LEADERBOARD</span>
                <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
              </div>
              <h1 className="title-font text-5xl font-black leading-[0.98] tracking-[-0.04em] text-white drop-shadow-[0_0_36px_rgba(34,211,238,0.30)] sm:text-6xl lg:text-7xl">
                全国 <span className="gradient-text-rb">AI 排行榜</span>
              </h1>
              <p className="max-w-[560px] text-base font-medium text-white/72 sm:text-lg">
                谁在领跑 Agent 装备生态，哪里的玩家最密集，哪些角色正在崛起。
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/survey" className="btn-rb-fill">
                  <Sparkles className="h-4 w-4" />
                  <span>生成我的身份卡</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/map" className="btn-rb-ghost">
                  <Radio className="h-4 w-4" />
                  <span>查看全国雷达</span>
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 text-[11px] text-white/45">
                <span className="flex items-center gap-1.5"><Crown className="h-3 w-3 text-amber-300" /> 实时更新</span>
                <span className="flex items-center gap-1.5"><Hash className="h-3 w-3 text-cyan-300" /> {MOCK_OVERVIEW.total} 名玩家入榜</span>
                <span className="flex items-center gap-1.5"><Brain className="h-3 w-3 text-violet-300" /> 5 大分区实时切换</span>
              </div>
            </motion.div>
            <motion.div initial={false}>
              <ChampionDashboard />
            </motion.div>
          </section>

          {/* TOP STATS 6 cards */}
          <section className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.14]">
                  <div aria-hidden className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-30 blur-2xl transition-opacity duration-500 group-hover:opacity-60" style={{ background: s.tone }} />
                  <div className="relative flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-black/30">
                      <Icon className="h-4 w-4" style={{ color: s.tone }} />
                    </div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">{s.label}</p>
                  </div>
                  <div className="relative mt-3 title-font text-2xl font-black text-white sm:text-3xl">
                    {s.isText ? s.value : <CountUp to={s.value as number} duration={1.4} />}
                  </div>
                </div>
              );
            })}
          </section>

          {/* TABS */}
          <section className="mb-12">
            <LiquidGlassCard className="p-5 sm:p-6" mode="shader" blurAmount={0.05} aberrationIntensity={1.5} cornerRadius={26}>
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="title-font text-[10px] uppercase tracking-[0.28em] text-cyan-300/70">Leaderboard Panels</p>
                  <h3 className="title-font mt-2 text-2xl font-black text-white sm:text-3xl">排行榜分区</h3>
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-black/30 px-3 py-1.5 text-[10px] text-white/55">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  实时数据 · 每分钟刷新
                </div>
              </div>

              <div className="-mx-1 mb-5 flex items-center gap-2 overflow-x-auto px-1 pb-2 sm:flex-wrap sm:overflow-visible">
                {TABS.map((k) => {
                  const meta = tabMeta[k];
                  const Icon = meta.icon;
                  const active = tab === k;
                  return (
                    <button
                      key={k}
                      onClick={() => setTab(k)}
                      className={
                        "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all duration-300 " +
                        (active
                          ? "border-white/[0.2] text-white shadow-[0_0_24px_-6px_rgba(34,211,238,0.6)]"
                          : "border-white/[0.08] bg-white/[0.02] text-white/60 hover:text-white")
                      }
                      style={active ? { background: `linear-gradient(135deg, ${meta.accent}30, ${meta.accent}10)`, color: meta.accent } : {}}
                    >
                      <Icon className="h-4 w-4" />
                      {meta.label}
                      <span className="title-font rounded-full border border-white/15 bg-black/40 px-1.5 py-0.5 text-[10px] text-white/65">{meta.total}</span>
                    </button>
                  );
                })}
              </div>

              {tab === "tools" && (
                <div className="space-y-2.5">
                  {TOOL_RANKING.map((t, i) => (
                    <RowShell
                      key={t.id}
                      rank={i + 1}
                      primary={t.name}
                      secondary={`${t.category} 阵营 · 增长 +${t.growthRate}%`}
                      badge={t.category}
                      value={t.users}
                      energy={t.heat}
                      growth={t.growthRate}
                      accent={toolColor(t.name)}
                      isTop3={i < 3}
                    />
                  ))}
                </div>
              )}

              {tab === "cities" && (
                <div className="space-y-2.5">
                  {CITY_RANKING.map((c, i) => (
                    <RowShell
                      key={c.id}
                      rank={i + 1}
                      primary={c.city}
                      secondary={`${c.province} · 主流角色 ${c.topRole} · 主流工具 ${c.topTool}`}
                      value={c.users}
                      energy={Math.min(100, c.users / 2)}
                      growth={c.growthRate}
                      accent="#22d3ee"
                      isTop3={i < 3}
                    />
                  ))}
                </div>
              )}

              {tab === "provinces" && (
                <div className="space-y-2.5">
                  {PROVINCE_RANKING.map((p, i) => (
                    <RowShell
                      key={p.id}
                      rank={i + 1}
                      primary={p.province}
                      secondary={`${p.cityCount} 城市覆盖 · 最热工具 ${p.topTool}`}
                      value={p.users}
                      energy={Math.min(100, p.users / 3.2)}
                      growth={p.growthRate}
                      accent="#fbbf24"
                      isTop3={i < 3}
                    />
                  ))}
                </div>
              )}

              {tab === "roles" && (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {ROLE_RANKING.map((r, i) => (
                    <RoleCard key={r.id} r={r} rank={i + 1} isTop3={i < 3} />
                  ))}
                </div>
              )}

              {tab === "latest" && (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {LATEST_PASSPORTS.map((p, i) => (
                    <PassportMiniCard key={p.id} p={p} rank={i + 1} />
                  ))}
                </div>
              )}
            </LiquidGlassCard>
          </section>

          {/* BOTTOM CTA */}
          <section className="mt-8">
            <div className="relative overflow-hidden rounded-[28px] border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(34,211,238,0.08),rgba(168,85,247,0.06))] p-8 text-center shadow-[0_0_80px_rgba(34,211,238,0.18)] backdrop-blur-2xl sm:p-12">
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.04)_1px,transparent_1px)] bg-[size:32px_32px] opacity-50" />
              <div aria-hidden className="pointer-events-none absolute -top-10 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-cyan-300/30 blur-[100px]" />
              <div className="relative">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/[0.08] px-4 py-1.5">
                  <Award className="h-3.5 w-3.5 text-cyan-300" />
                  <span className="title-font text-[10px] font-bold tracking-[0.28em] text-cyan-300">JOIN THE BOARD</span>
                </div>
                <h2 className="title-font text-3xl font-black text-white sm:text-4xl">想进入排行榜？</h2>
                <p className="mx-auto mt-3 max-w-[560px] text-base text-white/65">
                  生成你的 AI Agent Passport，让你的装备、城市和角色进入全国信号榜。
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <Link href="/survey" className="btn-rb-fill">
                    <Sparkles className="h-4 w-4" />
                    <span>立即生成身份卡</span>
                  </Link>
                  <Link href="/map" className="btn-rb-ghost">
                    <Radio className="h-4 w-4" />
                    <span>查看全国雷达</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </PageShell>
      </Section>
    </main>
  );
}
