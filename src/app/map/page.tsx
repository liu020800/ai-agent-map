"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Crosshair, Flame, MapPin, Radio, Sparkles, Swords, Zap, Shield, Target,
  Users, Code, Cpu, BookOpen, FileText, Network, Trophy, ArrowRight, Activity, Brain
} from "lucide-react";
import CountUp from "@/components/react-bits/CountUp";
import LiquidGlassCard from "@/components/react-bits/LiquidGlassCard";
import { PageShell, Section } from "@/components/ui";
import { MOCK_OVERVIEW, MOCK_PROVINCES, MOCK_TOOLS } from "@/data/mock";

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
  { name: "重庆", value: 7, cityCount: 1, growthRate: 17, topTool: "OpenCode" }
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
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.14]">
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
    <div className="relative aspect-square w-full max-w-[520px] mx-auto">
      <div aria-hidden className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.18),transparent_72%)]" />
      <div className="absolute inset-0 rounded-full border border-cyan-300/15" />
      <div className="absolute inset-[8%] rounded-full border border-cyan-300/12" />
      <div className="absolute inset-[18%] rounded-full border border-cyan-300/10" />
      <div className="absolute inset-[28%] rounded-full border border-cyan-300/8" />
      <div className="absolute inset-[38%] rounded-full border border-cyan-300/5" />
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
          <p className="title-font text-[9px] uppercase tracking-[0.32em] text-cyan-300/70">Total Signal</p>
          <p className="title-font text-3xl font-black text-white">
            <CountUp to={totalSignals} duration={1.6} />
          </p>
          <p className="text-[9px] text-white/45">全国总信号</p>
        </div>
      </div>
    </div>
  );
}

export default function MapPage() {
  const overview = MOCK_OVERVIEW;
  const provinces = EXTENDED_PROVINCES;
  const tools = TOOL_HEAT_LIST;
  const camps = CAMP_DISTRIBUTION;
  const cityLog = CITY_SIGNAL_LOG;
  const totalCities = provinces.reduce((s, p) => s + p.cityCount, 0);
  const hottestProvince = provinces[0];
  const dominantTool = tools[0];
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % cityLog.length), 4000);
    return () => clearInterval(id);
  }, [cityLog.length]);

  return (
    <main className="relative min-h-screen overflow-hidden pb-20 pt-4">
      <style>{`@keyframes radar-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[8%] top-[12%] h-[28rem] w-[28rem] rounded-full bg-[rgba(0,229,255,0.18)] blur-[140px]" />
        <div className="absolute right-[6%] top-[18%] h-[24rem] w-[24rem] rounded-full bg-[rgba(168,85,247,0.18)] blur-[120px]" />
        <div className="absolute bottom-[8%] left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-[rgba(163,230,53,0.12)] blur-[130px]" />
      </div>

      <Section className="relative z-10" spacing="md">
        <PageShell width="wide">
          {/* HERO */}
          <section className="mb-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <motion.div initial={false} className="space-y-6">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-cyan-300/20 bg-cyan-300/[0.05] px-4 py-2 backdrop-blur-xl">
                <Crosshair className="h-4 w-4 text-cyan-300" />
                <span className="title-font text-[11px] font-bold tracking-[0.32em] text-cyan-300">NATIONAL AGENT RADAR</span>
                <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]">
                  <span className="absolute h-1.5 w-1.5 animate-ping rounded-full bg-cyan-300" />
                </span>
              </div>
              <h1 className="title-font text-5xl font-black leading-[0.98] tracking-[-0.04em] text-white drop-shadow-[0_0_36px_rgba(34,211,238,0.32)] sm:text-6xl lg:text-7xl">
                全国 <span className="gradient-text-rb">AI 信号雷达</span>
              </h1>
              <p className="max-w-[560px] text-base font-medium text-white/72 sm:text-lg">
                这里不是普通地图，而是全国 Agent 玩家信号面板。每一张身份卡，都会点亮一个城市信号。
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
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 text-[11px] text-white/45">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  实时信号 · 每 4 秒刷新
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
            </motion.div>

            <motion.div initial={false}>
              <ProvinceRadar provinces={provinces} totalSignals={overview.total} />
            </motion.div>
          </section>

          {/* TOP STATS 6 cards */}
          <section className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <StatCard label="全国总玩家" value={overview.total} icon={Users} tone="#22d3ee" />
            <StatCard label="Agent 阵营" value={overview.agentUsers} icon={Shield} tone="#a855f7" />
            <StatCard label="App 用户" value={overview.appUsers} icon={Zap} tone="#f59e0b" />
            <StatCard label="今日新增" value={overview.todayNew} icon={Sparkles} tone="#10b981" />
            <StatCard label="覆盖城市" value={totalCities} icon={MapPin} tone="#fb7185" />
            <StatCard label="最热省份" value={hottestProvince.name} icon={Flame} tone="#fbbf24" />
          </section>

          {/* PROVINCE HEAT + CITY SIGNAL FLOW */}
          <section className="mb-12 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <LiquidGlassCard className="p-5" mode="standard" blurAmount={0.05} aberrationIntensity={1.3} cornerRadius={24}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="title-font text-[10px] uppercase tracking-[0.28em] text-cyan-300/70">Province Heat Matrix</p>
                  <h3 className="title-font mt-2 text-lg font-bold text-white">省份热力矩阵</h3>
                </div>
                <span className="title-font text-xs text-white/40">TOP {provinces.length}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {provinces.map((p, i) => {
                  const heatPct = Math.max(15, Math.min(100, p.value * 2.6));
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
                        <span className="title-font rounded-md border border-emerald-400/20 bg-emerald-400/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                          +{p.growthRate}%
                        </span>
                      </div>
                      <div className="relative mt-3 title-font text-2xl font-black text-cyan-300">
                        <CountUp to={p.value} duration={1.3} />
                      </div>
                      <div className="relative mt-1 text-[10px] text-white/40">
                        {p.cityCount} 城市 · 最热 {p.topTool}
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
            </LiquidGlassCard>

            <LiquidGlassCard className="p-5" mode="shader" blurAmount={0.05} aberrationIntensity={1.4} cornerRadius={24}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="title-font text-[10px] uppercase tracking-[0.28em] text-emerald-300/70">City Signal Flow</p>
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
                <div className="max-h-[420px] space-y-1.5 overflow-y-auto pr-1">
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
            </LiquidGlassCard>
          </section>

          {/* EQUIPMENT HEAT + CAMP DISTRIBUTION */}
          <section className="mb-12 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <LiquidGlassCard className="p-5" mode="shader" blurAmount={0.05} aberrationIntensity={1.4} cornerRadius={24}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="title-font text-[10px] uppercase tracking-[0.28em] text-amber-300/70">Equipment Heat Distribution</p>
                  <h3 className="title-font mt-2 text-lg font-bold text-white">装备热度分布</h3>
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
                      <span className="title-font w-12 text-right text-[11px] font-bold text-emerald-300">
                        +{t.growthRate}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard className="p-5" mode="standard" blurAmount={0.05} aberrationIntensity={1.3} cornerRadius={24}>
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
            </LiquidGlassCard>
          </section>

          {/* BOTTOM CTA */}
          <section className="mt-12">
            <div className="relative overflow-hidden rounded-[28px] border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(34,211,238,0.08),rgba(168,85,247,0.06))] p-8 text-center shadow-[0_0_80px_rgba(34,211,238,0.18)] backdrop-blur-2xl sm:p-12">
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.04)_1px,transparent_1px)] bg-[size:32px_32px] opacity-50" />
              <div aria-hidden className="pointer-events-none absolute -top-10 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-cyan-300/30 blur-[100px]" />
              <div className="relative">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/[0.08] px-4 py-1.5">
                  <Target className="h-3.5 w-3.5 text-cyan-300" />
                  <span className="title-font text-[10px] font-bold tracking-[0.28em] text-cyan-300">JOIN THE RADAR</span>
                </div>
                <h2 className="title-font text-3xl font-black text-white sm:text-4xl">
                  你的城市还没有被点亮？
                </h2>
                <p className="mx-auto mt-3 max-w-[560px] text-base text-white/65">
                  生成你的 AI Agent Passport，让你的城市出现在全国信号雷达上。
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
