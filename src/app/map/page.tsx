"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Crosshair, Flame, MapPin, Radio, Sparkles, Swords, Zap, Shield, Target,
  Users, Code, Cpu, BookOpen, FileText, Network, Trophy, ArrowRight, Activity, Brain
} from "lucide-react";
import CountUp from "@/components/react-bits/CountUp";
import { PageShell, Section } from "@/components/ui";
import { DataNotice } from "@/components/workbench";
import ChinaSvgMap from "@/components/ChinaSvgMap";
import { toolColor } from "@/data/mock";
import { SURVEY_PROVINCES } from "@/lib/survey-service";
import { fetchRanking, type RankingData } from "@/lib/api-client";

type ProvinceSignal = {
  name: string;
  value: number;
  cityCount: number;
  growthRate: number;
  topTool: string;
};

type CitySignal = {
  time: string;
  city: string;
  province: string;
  role: string;
  tool: string;
  tone: string;
};

type ToolSignal = {
  name: string;
  category: "Agent" | "App" | "Local" | "Automation";
  count: number;
  heat: number;
  growthRate: number;
};

type CampSignal = {
  name: string;
  icon: typeof Code;
  count: number;
  share: number;
  tone: string;
};

function StableGlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "cyan" | "emerald" | "amber" | "violet";
}) {
  return (
    <div className={`relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-5 ${className}`}>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

const EXTENDED_PROVINCES: ProvinceSignal[] = [
  { name: "广东", value: 28, cityCount: 4, growthRate: 18, topTool: "Codex" },
  { name: "北京", value: 25, cityCount: 1, growthRate: 22, topTool: "Claude Code" },
  { name: "上海", value: 32, cityCount: 1, growthRate: 15, topTool: "Codex" },
  { name: "浙江", value: 21, cityCount: 4, growthRate: 24, topTool: "Claude Code" },
  { name: "江苏", value: 18, cityCount: 4, growthRate: 16, topTool: "DeepSeek" },
  { name: "四川", value: 14, cityCount: 2, growthRate: 28, topTool: "Dify" },
  { name: "湖北", value: 12, cityCount: 2, growthRate: 12, topTool: "Kimi" },
  { name: "山东", value: 11, cityCount: 3, growthRate: 19, topTool: "DeepSeek" },
  { name: "河南", value: 9, cityCount: 2, growthRate: 14, topTool: "豆包" },
  { name: "陕西", value: 8, cityCount: 2, growthRate: 11, topTool: "Cursor" },
  { name: "福建", value: 9, cityCount: 3, growthRate: 9, topTool: "n8n" },
  { name: "重庆", value: 7, cityCount: 1, growthRate: 17, topTool: "OpenCode" },
  { name: "天津", value: 8, cityCount: 1, growthRate: 13, topTool: "Kimi" },
  { name: "河北", value: 10, cityCount: 3, growthRate: 12, topTool: "DeepSeek" },
  { name: "山西", value: 6, cityCount: 2, growthRate: 10, topTool: "Cursor" },
  { name: "内蒙古", value: 6, cityCount: 2, growthRate: 9, topTool: "Ollama" },
  { name: "辽宁", value: 10, cityCount: 2, growthRate: 15, topTool: "Codex" },
  { name: "吉林", value: 5, cityCount: 2, growthRate: 8, topTool: "豆包" },
  { name: "黑龙江", value: 5, cityCount: 2, growthRate: 7, topTool: "Kimi" },
  { name: "安徽", value: 11, cityCount: 3, growthRate: 16, topTool: "Dify" },
  { name: "江西", value: 8, cityCount: 2, growthRate: 12, topTool: "DeepSeek" },
  { name: "湖南", value: 10, cityCount: 2, growthRate: 17, topTool: "通义千问" },
  { name: "广西", value: 7, cityCount: 2, growthRate: 11, topTool: "n8n" },
  { name: "海南", value: 4, cityCount: 2, growthRate: 8, topTool: "Kimi" },
  { name: "贵州", value: 6, cityCount: 2, growthRate: 12, topTool: "DeepSeek" },
  { name: "云南", value: 7, cityCount: 2, growthRate: 13, topTool: "Ollama" },
  { name: "西藏", value: 3, cityCount: 1, growthRate: 6, topTool: "Kimi" },
  { name: "甘肃", value: 5, cityCount: 2, growthRate: 9, topTool: "豆包" },
  { name: "青海", value: 3, cityCount: 1, growthRate: 5, topTool: "Ollama" },
  { name: "宁夏", value: 3, cityCount: 1, growthRate: 7, topTool: "DeepSeek" },
  { name: "新疆", value: 5, cityCount: 2, growthRate: 10, topTool: "Cursor" },
  { name: "香港", value: 6, cityCount: 1, growthRate: 14, topTool: "Claude Code" },
  { name: "澳门", value: 3, cityCount: 1, growthRate: 6, topTool: "豆包" },
  { name: "台湾", value: 7, cityCount: 2, growthRate: 12, topTool: "Codex" }
];

const PROVINCE_RADAR_POS: Record<string, { x: number; y: number }> = {
  "北京": { x: 64, y: 28 }, "天津": { x: 66, y: 32 }, "上海": { x: 80, y: 56 },
  "重庆": { x: 50, y: 62 }, "河北": { x: 62, y: 34 }, "山西": { x: 58, y: 40 },
  "辽宁": { x: 70, y: 22 }, "吉林": { x: 72, y: 16 }, "黑龙江": { x: 74, y: 8 },
  "江苏": { x: 72, y: 50 }, "浙江": { x: 76, y: 58 }, "安徽": { x: 68, y: 52 },
  "福建": { x: 76, y: 66 }, "江西": { x: 66, y: 60 }, "山东": { x: 68, y: 40 },
  "河南": { x: 62, y: 46 }, "湖北": { x: 60, y: 54 }, "湖南": { x: 60, y: 62 },
  "广东": { x: 66, y: 74 }, "海南": { x: 64, y: 86 }, "四川": { x: 46, y: 58 },
  "贵州": { x: 52, y: 68 }, "云南": { x: 46, y: 76 }, "陕西": { x: 54, y: 44 },
  "甘肃": { x: 44, y: 42 }, "青海": { x: 38, y: 48 }, "台湾": { x: 86, y: 70 },
  "内蒙古": { x: 56, y: 22 }, "广西": { x: 56, y: 74 }, "西藏": { x: 26, y: 56 },
  "宁夏": { x: 50, y: 38 }, "新疆": { x: 22, y: 30 },
  "香港": { x: 70, y: 82 }, "澳门": { x: 68, y: 84 }
};

const CITY_SIGNAL_LOG: CitySignal[] = [
  { time: "12:31", city: "上海", province: "上海", role: "代码指挥官", tool: "Codex", tone: "#22d3ee" },
  { time: "12:28", city: "深圳", province: "广东", role: "自动化玩家", tool: "n8n", tone: "#a855f7" },
  { time: "12:22", city: "北京", province: "北京", role: "本地模型驯养师", tool: "Ollama", tone: "#10b981" },
  { time: "12:19", city: "杭州", province: "浙江", role: "知识库构建者", tool: "Dify", tone: "#06b6d4" },
  { time: "12:16", city: "成都", province: "四川", role: "内容生产者", tool: "Kimi", tone: "#fb7185" },
  { time: "12:11", city: "广州", province: "广东", role: "AI 探索者", tool: "DeepSeek", tone: "#3b82f6" },
  { time: "12:07", city: "西安", province: "陕西", role: "代码指挥官", tool: "Claude Code", tone: "#a855f7" },
  { time: "12:02", city: "南京", province: "江苏", role: "数据分析师", tool: "Cursor", tone: "#8b5cf6" },
  { time: "11:58", city: "武汉", province: "湖北", role: "AI 探索者", tool: "豆包", tone: "#f59e0b" },
  { time: "11:52", city: "重庆", province: "重庆", role: "本地模型驯养师", tool: "OpenCode", tone: "#00ffc8" }
];

const TOOL_HEAT_LIST: ToolSignal[] = [
  { name: "Codex", category: "Agent", count: 88, heat: 100, growthRate: 24 },
  { name: "Claude Code", category: "Agent", count: 76, heat: 86, growthRate: 31 },
  { name: "OpenCode", category: "Agent", count: 55, heat: 62, growthRate: 42 },
  { name: "Cursor", category: "Agent", count: 38, heat: 43, growthRate: 18 },
  { name: "DeepSeek", category: "App", count: 49, heat: 55, growthRate: 12 },
  { name: "豆包", category: "App", count: 44, heat: 50, growthRate: 9 },
  { name: "Kimi", category: "App", count: 28, heat: 32, growthRate: 14 },
  { name: "Dify", category: "Automation", count: 32, heat: 36, growthRate: 22 },
  { name: "n8n", category: "Automation", count: 24, heat: 27, growthRate: 19 },
  { name: "Ollama", category: "Local", count: 21, heat: 24, growthRate: 28 }
];

const CAMP_DISTRIBUTION: CampSignal[] = [
  { name: "代码 Agent", icon: Code, count: 326, share: 25, tone: "#22d3ee" },
  { name: "AI App 用户", icon: Sparkles, count: 514, share: 40, tone: "#a855f7" },
  { name: "本地模型", icon: Cpu, count: 142, share: 11, tone: "#10b981" },
  { name: "自动化工作流", icon: Network, count: 116, share: 9, tone: "#f59e0b" },
  { name: "知识库问答", icon: BookOpen, count: 98, share: 8, tone: "#06b6d4" },
  { name: "内容创作", icon: FileText, count: 84, share: 7, tone: "#fb7185" }
];

const ZERO_OVERVIEW = { total: 0, agentUsers: 0, appUsers: 0, todayNew: 0 };

function StatCard({
  label, value, icon: Icon, tone = "#22d3ee", suffix
}: {
  label: string;
  value: number | string;
  icon: typeof Code;
  tone?: string;
  suffix?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-4 transition-colors duration-150 hover:bg-neutral-50">
      <div aria-hidden className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-30 blur-2xl transition-opacity duration-500 group-hover:opacity-60" style={{ background: tone }} />
      <div className="relative flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-black/30">
          <Icon className="h-4 w-4" style={{ color: tone }} />
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">{label}</p>
      </div>
      <div className="relative mt-3 title-font text-3xl font-black text-white">
        {typeof value === "number" ? <CountUp to={value} duration={1.4} /> : value}
        {suffix && <span className="ml-1 text-base font-bold text-white/55">{suffix}</span>}
      </div>
    </div>
  );
}

function ProvinceRadar({ provinces, totalSignals }: { provinces: ProvinceSignal[]; totalSignals: number }) {
  const max = Math.max(...provinces.map((p) => p.value), 1);
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[430px]">
      <div aria-hidden className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.18),transparent_72%)]" />
      <div className="absolute inset-0 rounded-full border border-cyan-300/15" />
      <div className="absolute inset-[8%] rounded-full border border-cyan-300/12" />
      <div className="absolute inset-[18%] rounded-full border border-cyan-300/10" />
      <div className="absolute inset-[28%] rounded-full border border-cyan-300/8" />
      <div className="absolute inset-[38%] rounded-full border border-cyan-300/5" />
      <svg
        aria-label="中国地图信号轮廓"
        viewBox="0 0 100 100"
        className="absolute inset-[9%] h-[82%] w-[82%] overflow-visible drop-shadow-[0_0_18px_rgba(34,211,238,0.35)]"
      >
        <defs>
          <linearGradient id="china-map-stroke" x1="18" y1="14" x2="86" y2="88" gradientUnits="userSpaceOnUse">
            <stop stopColor="#22d3ee" stopOpacity="0.95" />
            <stop offset="0.55" stopColor="#60a5fa" stopOpacity="0.72" />
            <stop offset="1" stopColor="#a855f7" stopOpacity="0.82" />
          </linearGradient>
          <radialGradient id="china-map-fill" cx="58%" cy="48%" r="58%">
            <stop stopColor="#22d3ee" stopOpacity="0.18" />
            <stop offset="0.72" stopColor="#0f172a" stopOpacity="0.08" />
            <stop offset="1" stopColor="#020617" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path
          d="M18 30 L26 22 L39 20 L48 13 L61 16 L73 13 L82 21 L80 32 L88 38 L82 48 L88 58 L80 67 L78 78 L66 74 L57 84 L45 79 L32 84 L24 73 L15 69 L20 58 L12 49 L18 39 Z"
          fill="url(#china-map-fill)"
          stroke="url(#china-map-stroke)"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M55 16 L56 82 M31 24 L77 74 M16 50 L87 50 M28 74 L78 23" stroke="#22d3ee" strokeOpacity="0.12" strokeWidth="0.6" />
        <path d="M82 72 C87 70 91 73 90 78 C87 82 82 79 82 72Z" fill="#22d3ee" fillOpacity="0.12" stroke="#22d3ee" strokeOpacity="0.45" strokeWidth="0.8" />
        <circle cx="76" cy="86" r="1.4" fill="#22d3ee" fillOpacity="0.8" />
        <circle cx="79" cy="88" r="0.9" fill="#a855f7" fillOpacity="0.75" />
      </svg>
      <div aria-hidden className="absolute top-1/2 left-0 right-0 h-px bg-cyan-300/15" />
      <div aria-hidden className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-300/15" />
      <div aria-hidden className="absolute inset-0 [transform:rotate(45deg)]">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-300/8" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-300/8" />
      </div>
      <div aria-hidden className="absolute inset-0 animate-[radar-spin_8s_linear_infinite]">
        <div className="absolute top-1/2 left-1/2 h-[2px] w-1/2 origin-left -translate-y-1/2 bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.85))]" />
        <div className="absolute top-1/2 left-1/2 h-1/2 w-1/2 origin-top-left [clip-path:polygon(0%_0%,100%_0%,0%_100%)] bg-[conic-gradient(from_0deg,rgba(34,211,238,0.22),transparent_25%)]" />
      </div>
      {provinces.map((p, i) => {
        const pos = PROVINCE_RADAR_POS[p.name] || { x: 50, y: 50 };
        const size = Math.max(5, Math.min(18, 4 + (p.value / max) * 14));
        const isTop3 = i < 3;
        return (
          <div
            key={p.name}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <span
              className={"block rounded-full " + (isTop3 ? "bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.85)] animate-pulse" : "bg-cyan-300/70 shadow-[0_0_8px_rgba(34,211,238,0.5)]")}
              style={{ width: `${size}px`, height: `${size}px` }}
            />
            <span className="title-font pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold text-white/75">
              {p.name}
            </span>
          </div>
        );
      })}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="rounded-full border border-cyan-300/30 bg-black/60 px-6 py-3 backdrop-blur-xl">
          <p className="title-font text-[9px] tracking-[0.18em] text-blue-600">总用户数</p>
          <p className="title-font text-3xl font-black text-white">
            <CountUp to={totalSignals} duration={1.6} />
          </p>
          <p className="text-[9px] text-gray-500">全国总用户</p>
        </div>
      </div>
    </div>
  );
}

function toolCategory(name: string): ToolSignal["category"] {
  if (["Codex", "Claude Code", "OpenCode", "Cursor", "OpenClaw", "Hermes"].includes(name)) return "Agent";
  if (["Dify", "n8n"].includes(name)) return "Automation";
  if (["Ollama", "Cherry Studio"].includes(name)) return "Local";
  return "App";
}

function buildProvinceSignals(ranking: RankingData | null): ProvinceSignal[] {
  const provinceStats = new Map((ranking?.provinces ?? []).map((p) => [p.name, p.value]));
  const cityStats = ranking?.cities ?? [];
  const topToolsByProvince = new Map<string, string>();
  for (const city of cityStats) {
    if (!topToolsByProvince.has(city.province) && city.topTool) topToolsByProvince.set(city.province, city.topTool);
  }

  return SURVEY_PROVINCES.map((province) => ({
    name: province,
    value: provinceStats.get(province) ?? 0,
    cityCount: cityStats.filter((city) => city.province === province && city.count > 0).length,
    growthRate: 0,
    topTool: topToolsByProvince.get(province) || "待点亮",
  })).sort((a, b) => b.value - a.value || a.name.localeCompare(b.name, "zh-Hans-CN"));
}

function buildToolSignals(ranking: RankingData | null): ToolSignal[] {
  const tools = ranking?.tools ?? [];
  const max = Math.max(...tools.map((tool) => tool.count), 1);
  return tools.map((tool) => ({
    name: tool.name,
    category: toolCategory(tool.name),
    count: tool.count,
    heat: Math.round((tool.count / max) * 100),
    growthRate: 0,
  }));
}

function buildCityLog(ranking: RankingData | null): CitySignal[] {
  const cities = ranking?.cities ?? [];
  if (!cities.length) {
    return [{ time: "--:--", city: "待点亮", province: "中国", role: "等待真实用户生成身份卡", tool: "AI Agent Map", tone: "#22d3ee" }];
  }
  const now = new Date();
  return cities.slice(0, 8).map((city, index) => ({
    time: new Date(now.getTime() - index * 5 * 60 * 1000).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    city: city.city,
    province: city.province,
    role: city.topRole,
    tool: city.topTool,
    tone: toolColor(city.topTool),
  }));
}

function buildCampDistribution(ranking: RankingData | null): CampSignal[] {
  const roles = ranking?.roles ?? [];
  const total = Math.max(roles.reduce((sum, role) => sum + role.count, 0), 1);
  const icons = [Code, FileText, Cpu, Network, BookOpen, Sparkles];
  const tones = ["#22d3ee", "#a855f7", "#10b981", "#f59e0b", "#06b6d4", "#fb7185"];
  if (!roles.length) {
    return [{ name: "等待真实用户", icon: Sparkles, count: 0, share: 0, tone: "#22d3ee" }];
  }
  return roles.slice(0, 6).map((role, index) => ({
    name: role.role,
    icon: icons[index] ?? Sparkles,
    count: role.count,
    share: Math.round((role.count / total) * 100),
    tone: tones[index] ?? "#22d3ee",
  }));
}

export default function MapPage() {
  const [ranking, setRanking] = useState<RankingData | null>(null);
  useEffect(() => {
    let active = true;
    fetchRanking().then((data) => {
      if (active) setRanking(data);
    }).catch(() => {
      if (active) setRanking(null);
    });
    return () => {
      active = false;
    };
  }, []);

  const overview = ranking?.overview ?? ZERO_OVERVIEW;
  const provinces = useMemo(() => buildProvinceSignals(ranking), [ranking]);
  const activeProvinces = provinces.filter((p) => p.value > 0);
  const radarProvinces = activeProvinces.length ? activeProvinces : provinces.slice(0, 8);
  const tools = useMemo(() => buildToolSignals(ranking), [ranking]);
  const camps = useMemo(() => buildCampDistribution(ranking), [ranking]);
  const cityLog = useMemo(() => buildCityLog(ranking), [ranking]);
  const totalCities = ranking?.cities?.length ?? 0;
  const hottestProvince = provinces[0];
  const dominantTool = tools[0] ?? { name: "待点亮", count: 0, category: "Agent" as const, heat: 0, growthRate: 0 };
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % cityLog.length), 4000);
    return () => clearInterval(id);
  }, [cityLog.length]);

  return (
    <main className="relative min-h-screen overflow-hidden pb-16 pt-0">
      <style>{`@keyframes radar-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[8%] top-[12%] h-[28rem] w-[28rem] rounded-full bg-[rgba(0,229,255,0.18)] blur-[140px]" />
        <div className="absolute right-[6%] top-[18%] h-[24rem] w-[24rem] rounded-full bg-[rgba(168,85,247,0.18)] blur-[120px]" />
        <div className="absolute bottom-[8%] left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-[rgba(163,230,53,0.12)] blur-[130px]" />
      </div>

      <Section className="relative z-10" spacing="sm">
        <PageShell width="wide">
          {/* HERO */}
          <section className="grid gap-8 pb-10 pt-6 lg:grid-cols-[1fr_500px] lg:items-center">
            <motion.div initial={false} className="space-y-6">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-blue-100 bg-blue-50 px-4 py-2">
                <Crosshair className="h-4 w-4 text-blue-600" />
                <span className="title-font text-[11px] font-bold tracking-[0.18em] text-blue-600">全国地图</span>
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              </div>
              <h1 className="title-font text-5xl font-black leading-[0.98] tracking-[-0.04em] text-gray-950 sm:text-6xl lg:text-7xl">
                全国 <span className="text-blue-700">AI 玩家地图</span>
              </h1>
              <p className="max-w-[560px] text-base font-medium text-gray-600 sm:text-lg">
                看看不同地区的朋友都在用哪些 AI 工具。当前为早期测试数据，真实数据正在收集中。
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/survey" className="btn-rb-fill">
                  <Sparkles className="h-4 w-4" />
                  <span>生成身份卡，点亮地图</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/ranking" className="btn-rb-ghost">
                  <Trophy className="h-4 w-4" />
                  <span>查看全国排行</span>
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 text-[11px] text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  数据正在收集中
                </span>
                <span className="flex items-center gap-1.5">
                  <Activity className="h-3 w-3 text-cyan-300" />
                  覆盖 {provinces.length} 省 / {totalCities} 城
                </span>
                <span className="flex items-center gap-1.5">
                  <Brain className="h-3 w-3 text-violet-300" />
                  {overview.total} 位玩家已入图
                </span>
              </div>
              <DataNotice>
                当前为早期工作台数据，真实身份卡记录正在收集中；地图分布会随用户提交自动更新。
              </DataNotice>
            </motion.div>

            <motion.div initial={false} className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(37,99,235,0.06),transparent_45%)]" />
              <div className="relative z-10 mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="title-font text-[10px] tracking-[0.18em] text-blue-600">全国使用概览</p>
                  <h2 className="title-font mt-1 text-xl font-black text-gray-950">全国使用概览</h2>
                </div>
                <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-700">
                  已生成
                </span>
              </div>
              <ProvinceRadar provinces={radarProvinces} totalSignals={overview.total} />
            </motion.div>
          </section>

          {/* TOP STATS 6 cards */}
          <section className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <StatCard label="全国总玩家" value={overview.total} icon={Users} tone="#22d3ee" />
            <StatCard label="Agent 阵营" value={overview.agentUsers} icon={Shield} tone="#a855f7" />
            <StatCard label="App 用户" value={overview.appUsers} icon={Zap} tone="#f59e0b" />
            <StatCard label="今日新增" value={overview.todayNew} icon={Sparkles} tone="#10b981" />
            <StatCard label="覆盖城市" value={totalCities} icon={MapPin} tone="#fb7185" />
            <StatCard label="最热省份" value={hottestProvince.value > 0 ? hottestProvince.name : "待点亮"} icon={Flame} tone="#fbbf24" />
          </section>

          {/* PROVINCE HEAT + CITY SIGNAL FLOW */}
          <section className="mb-10 grid gap-6 xl:grid-cols-[1.28fr_0.92fr]">
            <StableGlassCard tone="cyan">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="title-font text-[10px] uppercase tracking-[0.28em] text-cyan-300/70">Province Heat Matrix</p>
                  <h3 className="title-font mt-2 text-lg font-bold text-white">中国省份热力地图</h3>
                </div>
                <span className="title-font text-xs text-white/40">TOP {provinces.length}</span>
              </div>
              <div className="mb-4 overflow-hidden rounded-2xl border border-cyan-300/12 bg-[#05080d]/72 p-3">
                <ChinaSvgMap data={provinces} />
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {provinces.slice(0, 12).map((p, i) => {
                  const heatPct = p.value > 0 ? Math.max(10, Math.min(100, p.value * 18)) : 0;
                  return (
                    <div
                      key={p.name}
                      className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-black/25 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/30"
                    >
                      <div aria-hidden className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-cyan-300/10 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
                      <div className="relative flex items-start justify-between">
                        <div>
                          <p className="title-font text-base font-black text-white">{p.name}</p>
                          <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-white/35">0{i + 1}</p>
                        </div>
                        <span className="title-font rounded-md border border-cyan-400/20 bg-cyan-400/10 px-1.5 py-0.5 text-[10px] font-bold text-cyan-200">
                          真实
                        </span>
                      </div>
                      <div className="relative mt-3 title-font text-2xl font-black text-cyan-300">
                        <CountUp to={p.value} duration={1.3} />
                      </div>
                      <div className="relative mt-1 text-[10px] text-white/40">
                        {p.cityCount} 城市 · {p.topTool === "待点亮" ? "待点亮" : `最热 ${p.topTool}`}
                      </div>
                      <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee,#a855f7,#fb7185)] shadow-[0_0_12px_rgba(34,211,238,0.4)]"
                          style={{ width: `${heatPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </StableGlassCard>

            <StableGlassCard tone="emerald">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="title-font text-[10px] tracking-[0.18em] text-emerald-600">城市动态</p>
                  <h3 className="title-font mt-2 text-lg font-bold text-white">城市信号流</h3>
                </div>
                <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  REALTIME
                </span>
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-black/40 p-4 font-mono">
                <div className="mb-3 flex items-center justify-between border-b border-emerald-500/15 pb-2 text-[10px] text-emerald-300/70">
                  <span>$ tail -f /var/log/agent-signal.log</span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    streaming
                  </span>
                </div>
                <div className="max-h-[360px] space-y-1.5 overflow-y-auto pr-1">
                  {cityLog.map((entry, i) => {
                    const active = i === tick;
                    return (
                      <div
                        key={i}
                        className={
                          "flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] transition-colors " +
                          (active ? "bg-cyan-300/[0.08] text-white" : "text-white/85")
                        }
                      >
                        <span className="text-emerald-400/70">[{entry.time}]</span>
                        <span className="title-font w-10 font-bold" style={{ color: entry.tone }}>{entry.city}</span>
                        <span className="text-white/25">·</span>
                        <span className="w-32 truncate text-white/75">{entry.role}</span>
                        <span className="text-white/25">·</span>
                        <span className="title-font font-bold text-white">{entry.tool}</span>
                        <span className="ml-auto flex h-1.5 w-1.5 items-center justify-center">
                          {active ? (
                            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-cyan-300" />
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/40" />
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center gap-2 border-t border-emerald-500/15 pt-2 text-[10px] text-emerald-300/60">
                  <span>~</span>
                  <span className="title-font">stream paused · refresh in {((4000 - (Date.now() % 4000)) / 1000).toFixed(1)}s</span>
                </div>
              </div>
            </StableGlassCard>
          </section>

          {/* EQUIPMENT HEAT + CAMP DISTRIBUTION */}
          <section className="mb-10 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <StableGlassCard tone="amber">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="title-font text-[10px] uppercase tracking-[0.28em] text-amber-300/70">Equipment Heat Distribution</p>
                  <h3 className="title-font mt-2 text-lg font-bold text-gray-950">热门工具分布</h3>
                </div>
                <span className="title-font text-xs text-white/40">TOP {tools.length}</span>
              </div>
              <div className="space-y-3">
                {tools.map((t, i) => {
                  const isTop3 = i < 3;
                  return (
                    <div
                      key={t.name}
                      className={
                        "group flex items-center gap-3 rounded-xl p-2 transition-all duration-300 " +
                        (isTop3
                          ? "border border-amber-300/20 bg-[linear-gradient(90deg,rgba(251,191,36,0.08),rgba(251,191,36,0.01))]"
                          : "border border-transparent hover:border-white/[0.06] hover:bg-white/[0.02]")
                      }
                    >
                      <span className={"title-font w-5 text-center text-sm font-black " + (isTop3 ? "text-amber-300" : "text-white/40")}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-[110px]">
                        <p className={"title-font text-sm font-bold " + (isTop3 ? "text-amber-200" : "text-white")}>
                          {t.name}
                          {isTop3 && <span className="ml-1.5 text-[9px] font-black text-amber-300">★</span>}
                        </p>
                        <p className="text-[9px] uppercase tracking-[0.18em] text-white/40">{t.category}</p>
                      </div>
                      <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                        <div
                          className={
                            "absolute inset-y-0 left-0 rounded-full transition-all duration-700 " +
                            (isTop3
                              ? "bg-[linear-gradient(90deg,#fbbf24,#f59e0b,#fb7185)] shadow-[0_0_18px_rgba(251,191,36,0.55)]"
                              : "bg-[linear-gradient(90deg,#22d3ee,#a855f7)]")
                          }
                          style={{ width: `${t.heat}%` }}
                        />
                        <div className="absolute inset-y-0 right-0 w-px bg-white/10" />
                      </div>
                      <span className="title-font w-10 text-right text-sm font-black text-white">
                        <CountUp to={t.count} duration={1.2} />
                      </span>
                      <span className="title-font w-12 text-right text-[11px] font-bold text-cyan-200">
                        真实
                      </span>
                    </div>
                  );
                })}
              </div>
            </StableGlassCard>

            <StableGlassCard tone="violet">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="title-font text-[10px] uppercase tracking-[0.28em] text-violet-300/70">Camp Distribution</p>
                  <h3 className="title-font mt-2 text-lg font-bold text-white">阵营分布</h3>
                </div>
                <span className="title-font text-xs text-white/40">6 大阵营</span>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {camps.map((c) => {
                  const Icon = c.icon;
                  return (
                    <div
                      key={c.name}
                      className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-black/25 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.14]"
                    >
                      <div aria-hidden className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-30 blur-2xl transition-opacity duration-500 group-hover:opacity-70" style={{ background: c.tone }} />
                      <div className="relative flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-black/30">
                          <Icon className="h-4 w-4" style={{ color: c.tone }} />
                        </div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">{c.name}</p>
                      </div>
                      <div className="relative mt-3 title-font text-2xl font-black" style={{ color: c.tone }}>
                        <CountUp to={c.count} duration={1.3} />
                      </div>
                      <div className="relative mt-1 flex items-center justify-between text-[10px] text-white/40">
                        <span>占比 {c.share}%</span>
                        <span className="text-emerald-300">+{Math.max(2, c.share % 9)}%</span>
                      </div>
                      <div className="relative mt-2 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.min(100, c.share * 2)}%`, background: c.tone, boxShadow: `0 0 12px ${c.tone}80` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </StableGlassCard>
          </section>

          {/* BOTTOM CTA */}
          <section className="mt-10">
            <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-center sm:p-10">
              <div className="relative">
                <div className="mb-4 inline-flex items-center gap-2 rounded border border-neutral-200 bg-white px-3 py-1.5">
                  <Target className="h-3.5 w-3.5 text-neutral-500" />
                  <span className="text-xs font-medium text-neutral-500">加入地图</span>
                </div>
                <h2 className="text-2xl font-medium text-neutral-950 sm:text-3xl">
                  想加入玩家地图？
                </h2>
                <p className="mx-auto mt-3 max-w-[560px] text-sm leading-6 text-neutral-600">
                  生成你的 AI 身份卡，让你的城市出现在全国玩家地图上。
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <Link href="/survey" className="btn-rb-fill">
                    <Sparkles className="h-4 w-4" />
                    <span>立即生成身份卡</span>
                  </Link>
                  <Link href="/ranking" className="btn-rb-ghost">
                    <Trophy className="h-4 w-4" />
                    <span>查看排行榜</span>
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
