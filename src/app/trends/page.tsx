"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  Cpu,
  Database,
  Flame,
  PenLine,
  Rocket,
  ServerCog,
  Shield,
  Sparkles,
  TrendingUp,
  Workflow,
  Zap,
  Radio,
  Crosshair,
  Calendar,
} from "lucide-react";
import BlurText from "@/components/react-bits/BlurText";
import SplitText from "@/components/react-bits/SplitText";
import ShinyText from "@/components/react-bits/ShinyText";
import CountUp from "@/components/react-bits/CountUp";
import TiltedCard from "@/components/react-bits/TiltedCard";
import SpotlightCard from "@/components/react-bits/SpotlightCard";
import { PageShell, Section, SectionHeader, StatCard } from "@/components/ui";
import { buildTrendsFromRanking, getTrends, getCategoryLabel, champion, topRisingTools } from "@/lib/trends-data";
import { fetchRanking } from "@/lib/api-client";
import { toolColor } from "@/data/mock";
import type { ToolTrend, TrendsMatrix } from "@/lib/types";

import ParticlesBG from "@/components/react-bits/ParticlesBG";

const CATEGORY_ICON: Record<ToolTrend["category"], React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  agent: Code2,
  app: Cpu,
  automation: Workflow,
  local: ServerCog,
};

const MATRIX_ICON: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  "code-agent": Code2,
  "writing-agent": PenLine,
  automation: Workflow,
  "local-llm": ServerCog,
  "knowledge-base": Database,
  multimodal: Sparkles,
};

const MATRIX_TONE: Record<string, { accent: string; bg: string; border: string }> = {
  "code-agent": { accent: "#22d3ee", bg: "rgba(34,211,238,0.10)", border: "rgba(34,211,238,0.32)" },
  "writing-agent": { accent: "#a855f7", bg: "rgba(168,85,247,0.10)", border: "rgba(168,85,247,0.32)" },
  automation: { accent: "#10b981", bg: "rgba(16,185,129,0.10)", border: "rgba(16,185,129,0.32)" },
  "local-llm": { accent: "#84cc16", bg: "rgba(132,204,22,0.10)", border: "rgba(132,204,22,0.32)" },
  "knowledge-base": { accent: "#06b6d4", bg: "rgba(6,182,212,0.10)", border: "rgba(6,182,212,0.32)" },
  multimodal: { accent: "#ec4899", bg: "rgba(236,72,153,0.10)", border: "rgba(236,72,153,0.32)" },
};

const MATRIX_LABEL_TONE: Record<TrendsMatrix["label"], string> = {
  Exploding: "text-[#fb7185] bg-[#fb7185]/12 border-[#fb7185]/30",
  Rising: "text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/30",
  Stable: "text-slate-300 bg-white/[0.04] border-white/[0.08]",
  Cooling: "text-[#f87171] bg-[#f87171]/10 border-[#f87171]/30",
};

function StableTrendPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-cyan-300/14 bg-[linear-gradient(135deg,rgba(15,23,42,0.80),rgba(2,6,23,0.64))] p-5 shadow-[0_0_34px_rgba(34,211,238,0.10)] backdrop-blur-xl ${className}`}>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:28px_28px] opacity-25" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function TrendRadarPanel({
  snapshot,
  topTool,
}: {
  snapshot: ReturnType<typeof getTrends>;
  topTool: ToolTrend | null | undefined;
}) {
  const orbitTools = snapshot.tools.slice(0, 6);

  return (
    <motion.div
      initial={false}
      className="relative overflow-hidden rounded-[28px] border border-cyan-300/20 bg-[radial-gradient(circle_at_50%_38%,rgba(34,211,238,0.16),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.72),rgba(2,6,23,0.62))] p-5 shadow-[0_0_52px_rgba(34,211,238,0.12)] backdrop-blur-2xl"
    >
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.08)_1px,transparent_1px)] bg-[size:32px_32px] opacity-35" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-1/2 animate-[scan_3.2s_linear_infinite] bg-gradient-to-b from-cyan-300/18 via-cyan-300/4 to-transparent" />
      <div aria-hidden className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-violet-500/25 blur-3xl" />

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="title-font text-[10px] uppercase tracking-[0.32em] text-cyan-200/75">Live Trend Radar</p>
          <h2 className="title-font mt-2 text-2xl font-black text-white">装备热力仪表盘</h2>
        </div>
        <div className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1.5 text-[11px] font-bold text-emerald-200">
          SIGNAL ONLINE
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-6 flex aspect-square max-w-[330px] items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-cyan-300/25 shadow-[0_0_48px_rgba(34,211,238,0.16)_inset]" />
        <div className="absolute inset-10 rounded-full border border-violet-300/20" />
        <div className="absolute inset-20 rounded-full border border-emerald-300/20" />
        <div className="absolute left-1/2 top-0 h-1/2 w-px origin-bottom animate-[spin_5s_linear_infinite] bg-gradient-to-t from-cyan-300 to-transparent" />
        <div className="absolute h-px w-full bg-cyan-300/15" />
        <div className="absolute h-full w-px bg-cyan-300/15" />

        {orbitTools.map((tool, index) => {
          const angle = (index / orbitTools.length) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(angle) * 43;
          const y = Math.sin(angle) * 43;
          const accent = toolColor(tool.name, "#22d3ee");
          return (
            <div
              key={tool.id}
              className="absolute rounded-full border px-3 py-1 text-[11px] font-semibold text-white shadow-lg backdrop-blur-xl"
              style={{
                left: `${50 + x}%`,
                top: `${50 + y}%`,
                transform: "translate(-50%, -50%)",
                borderColor: `${accent}66`,
                background: `${accent}18`,
                boxShadow: `0 0 22px ${accent}33`,
              }}
            >
              {tool.name}
            </div>
          );
        })}

        <div className="relative flex h-36 w-36 flex-col items-center justify-center rounded-full border border-cyan-200/35 bg-black/55 text-center shadow-[0_0_60px_rgba(34,211,238,0.28)] backdrop-blur-xl">
          <p className="title-font text-[10px] uppercase tracking-[0.25em] text-cyan-200/65">Peak Heat</p>
          <p className="title-font text-5xl font-black text-white">{topTool?.heat ?? 0}</p>
          <p className="mt-1 text-xs font-semibold text-cyan-200">{topTool?.name ?? "待点亮"}</p>
        </div>
      </div>

      <div className="relative z-10 mt-5 grid gap-3 sm:grid-cols-3">
        {[
          ["今日新增信号", snapshot.todayNewSignals, "24H SIGNAL", "text-cyan-300/70"],
          ["热门工具", snapshot.fastestGrowing, "真实装配数", "text-emerald-300/70"],
          ["最活跃场景", snapshot.mostActiveScene, `Agent ${snapshot.agentShare}%`, "text-amber-300/70"],
        ].map(([label, value, sub, toneClass]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur-xl">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">{label}</p>
            <p className="title-font mt-2 truncate text-2xl font-black text-white">{value}</p>
            <p className={`mt-1 text-[10px] uppercase tracking-[0.2em] ${toneClass}`}>{sub}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function TrendsPage() {
  const [snapshot, setSnapshot] = useState(() => getTrends());
  useEffect(() => {
    let active = true;
    fetchRanking()
      .then((ranking) => {
        if (active) setSnapshot(buildTrendsFromRanking(ranking));
      })
      .catch(() => {
        if (active) setSnapshot(getTrends());
      });
    return () => {
      active = false;
    };
  }, []);
  const topTool = champion(snapshot);
  const rising = useMemo(() => topRisingTools(snapshot, 3), [snapshot]);
  const maxSignals = useMemo(
    () => Math.max(...snapshot.timeline.map((t) => t.signals), 1),
    [snapshot],
  );
  const maxHeat = useMemo(
    () => Math.max(...snapshot.tools.map((t) => t.heat), 1),
    [snapshot],
  );
  const maxActive = useMemo(
    () => Math.max(...snapshot.timeline.map((t) => t.active), 1),
    [snapshot],
  );

  return (
    <main className="relative min-h-screen overflow-hidden pb-16 pt-0">
      <ParticlesBG className="opacity-12" count={16} />

      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[8%] top-[12%] h-[26rem] w-[26rem] rounded-full bg-[rgba(34,211,238,0.18)] blur-[130px]" />
        <div className="absolute right-[6%] top-[18%] h-[22rem] w-[22rem] rounded-full bg-[rgba(168,85,247,0.18)] blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[rgba(251,191,36,0.12)] blur-[130px]" />
      </div>

      <Section className="relative z-10" spacing="sm">
        <PageShell width="wide">
          {/* ============== HERO COMMAND DECK ============== */}
          <section className="grid gap-8 pb-10 pt-6 lg:min-h-[560px] lg:grid-cols-[minmax(0,0.95fr)_minmax(380px,1.05fr)] lg:items-center">
            <motion.div
              initial={false}
              className="relative"
            >
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-300/[0.05] px-5 py-2.5 backdrop-blur-xl">
                <Radio className="h-4 w-4 text-cyan-300" />
                <span className="title-font text-[11px] font-bold tracking-[0.32em] text-cyan-300">AI EQUIPMENT BATTLEFIELD</span>
              </div>

              <h1 className="title-font max-w-[780px] text-5xl font-black leading-[0.95] tracking-[-0.04em] text-white drop-shadow-[0_0_32px_rgba(34,211,238,0.35)] sm:text-6xl lg:text-7xl">
                <span className="gradient-text-rb">AI 装备</span>
                <br />
                趋势战场
              </h1>

              <p className="mt-7 max-w-[680px] text-lg font-medium leading-8 text-white/78 sm:text-xl">
                基于真实身份卡提交记录，观察 AI Agent 工具、角色与城市信号的实时分布。
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/survey" className="btn-rb-fill">
                  <Shield className="h-5 w-5" />
                  生成身份卡
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/ranking" className="btn-rb-ghost">
                  查看装备热力榜
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-9 grid gap-3 sm:grid-cols-3">
                {[
                  ["扫描节点", snapshot.tools.length, "TOOLS"],
                  ["Agent 占比", snapshot.agentShare, "%"],
                  ["峰值热度", topTool?.heat ?? 0, "HEAT"],
                ].map(([label, value, unit]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-white/38">{label}</p>
                    <p className="title-font mt-2 text-3xl font-black text-white">
                      {value}
                      <span className="ml-1 text-sm text-cyan-200/60">{unit}</span>
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            <TrendRadarPanel snapshot={snapshot} topTool={topTool} />
          </section>

          {/* ============== TOOL RANKING ============== */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, duration: 0.5 }}
            className="mb-10"
          >
            <SectionHeader
              eyebrow="Tool Heat Ranking"
              title="AI 工具热度榜"
              description="按真实用户装配数排序，热度由当前工具使用人数计算。"
              accent="cyan"
              trailing={
                <Link href="/ranking" className="btn-rb-ghost !px-4 !py-2 !text-xs">
                  完整榜单
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              }
              className="mb-6"
            />

            <StableTrendPanel>
              <ul className="space-y-2.5">
                {snapshot.tools.length === 0 && (
                  <li className="rounded-2xl border border-cyan-300/12 bg-cyan-300/[0.04] p-6 text-center text-sm text-cyan-100/75">
                    暂无真实工具趋势。用户生成身份卡后，这里会自动显示真实装备热度。
                  </li>
                )}
                {snapshot.tools.map((tool, index) => {
                  const Icon = CATEGORY_ICON[tool.category];
                  const accent = toolColor(tool.name, "#22d3ee");
                  const heatPct = (tool.heat / maxHeat) * 100;
                  return (
                    <motion.li
                      key={tool.id}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.35, delay: index * 0.04 }}
                      className="group flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.05] bg-black/25 p-3 transition-all hover:border-cyan-300/25 hover:bg-black/40 sm:flex-nowrap"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-black/40 title-font text-sm font-black text-white/70">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-black/30"
                        style={{ boxShadow: `0 0 16px -4px ${accent}66` }}
                      >
                        <Icon className="h-4 w-4" style={{ color: accent }} />
                      </span>
                      <div className="min-w-[120px] flex-1 sm:min-w-0">
                        <p className="font-semibold text-white">{tool.name}</p>
                        <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">{getCategoryLabel(tool.category)}</p>
                      </div>

                      {/* Heat bar */}
                      <div className="order-3 w-full min-w-0 sm:order-none sm:flex-1">
                        <div className="relative h-2.5 overflow-hidden rounded-full bg-white/[0.04]">
                          <motion.span
                            initial={{ width: 0 }}
                            whileInView={{ width: `${heatPct}%` }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 + index * 0.05 }}
                            className="absolute inset-y-0 left-0 block rounded-full"
                            style={{
                              background: `linear-gradient(90deg, ${accent}cc, ${accent}55)`,
                              boxShadow: `0 0 14px ${accent}55`,
                            }}
                          />
                        </div>
                      </div>

                      <span className="rounded-full border border-white/[0.06] bg-black/30 px-2.5 py-1 text-[10px] font-mono text-white/55">
                        {tool.users} 人
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-[10px] font-semibold text-cyan-100">
                        真实数据
                      </span>
                      <span className="title-font text-base font-black text-white">{tool.heat}</span>
                      <span className="text-[9px] uppercase tracking-[0.22em] text-white/30">Heat</span>
                    </motion.li>
                  );
                })}
              </ul>
            </StableTrendPanel>
          </motion.div>

          {/* ============== TREND MATRIX ============== */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-10"
          >
            <SectionHeader
              eyebrow="Trend Matrix"
              title="趋势矩阵"
              description="按场景划分的 AI 工具生态。每个象限代表一个独立的 AI 工作流。"
              accent="purple"
              className="mb-6"
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {snapshot.matrix.map((cell) => {
                const Icon = MATRIX_ICON[cell.id] ?? Sparkles;
                const tone = MATRIX_TONE[cell.id] ?? { accent: "#22d3ee", bg: "rgba(34,211,238,0.10)", border: "rgba(34,211,238,0.32)" };
                return (
                  <motion.div
                    key={cell.id}
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 240, damping: 22 }}
                    className="group relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-5 backdrop-blur-xl"
                    style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04)` }}
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-[24px] border opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ borderColor: tone.border, boxShadow: `0 0 32px ${tone.bg}` }}
                    />
                    <div className="relative flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-11 w-11 items-center justify-center rounded-2xl border"
                          style={{ borderColor: tone.border, background: tone.bg }}
                        >
                          <Icon className="h-5 w-5" style={{ color: tone.accent }} />
                        </span>
                        <div>
                          <p className="title-font text-base font-black text-white">{cell.title}</p>
                          <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">{cell.tools.length} 个代表工具</p>
                        </div>
                      </div>
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${MATRIX_LABEL_TONE[cell.label]}`}>
                        {cell.label}
                      </span>
                    </div>
                    <p className="relative mt-4 text-sm leading-7 text-white/60">{cell.description}</p>
                    <div className="relative mt-4 flex flex-wrap gap-1.5">
                      {cell.tools.map((tool) => (
                        <span
                          key={tool}
                          className="rounded-full border border-white/[0.05] bg-white/[0.02] px-2.5 py-1 text-[11px] text-white/70"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                    <div className="relative mt-5 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.24em] text-white/40">Heat</span>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-white/[0.05]">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${cell.heat}%` }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.8, delay: 0.05 }}
                            className="h-full rounded-full"
                            style={{
                              background: `linear-gradient(90deg, ${tone.accent}, ${tone.accent}55)`,
                              boxShadow: `0 0 10px ${tone.accent}55`,
                            }}
                          />
                        </div>
                        <span className="title-font text-base font-black text-white">{cell.heat}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* ============== TIMELINE / HEAT TREND ============== */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26, duration: 0.5 }}
            className="mb-10 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]"
          >
            {/* 7-day timeline */}
            <StableTrendPanel className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="title-font text-[10px] uppercase tracking-[0.28em] text-cyan-300/70">7-day Signal Pulse</p>
                  <h3 className="title-font mt-2 text-2xl font-black text-white">近 7 天趋势走势</h3>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.05] px-4 py-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
                  </span>
                  <span className="title-font text-[10px] uppercase tracking-[0.22em] text-cyan-300/80">Live Pulse</span>
                </div>
              </div>

              {/* Custom bar chart */}
              <div className="grid grid-cols-7 gap-2 sm:gap-3">
                {snapshot.timeline.length === 0 && (
                  <div className="col-span-7 rounded-2xl border border-cyan-300/12 bg-cyan-300/[0.04] p-6 text-center text-sm text-cyan-100/75">
                    暂无 7 天真实趋势数据，新的身份卡提交会写入这里。
                  </div>
                )}
                {snapshot.timeline.map((point, i) => {
                  const signalPct = (point.signals / maxSignals) * 100;
                  const activePct = (point.active / maxActive) * 100;
                  return (
                    <div key={point.day} className="flex flex-col items-center gap-3">
                      <div className="flex h-44 w-full items-end justify-center gap-1 sm:h-52">
                        {/* Active users (lighter bar) */}
                        <motion.div
                          initial={{ height: 0 }}
                          whileInView={{ height: `${activePct}%` }}
                          viewport={{ once: true, margin: "-40px" }}
                          transition={{ duration: 0.9, delay: 0.05 + i * 0.06, ease: "easeOut" }}
                          className="w-2 rounded-t-md bg-gradient-to-t from-violet-400/30 to-violet-400/70 sm:w-2.5"
                          style={{ minHeight: "6px", boxShadow: "0 0 14px rgba(168,85,247,0.4)" }}
                          title={`活跃 ${point.active}`}
                        />
                        {/* New signals (denser bar) */}
                        <motion.div
                          initial={{ height: 0 }}
                          whileInView={{ height: `${signalPct}%` }}
                          viewport={{ once: true, margin: "-40px" }}
                          transition={{ duration: 0.9, delay: 0.1 + i * 0.06, ease: "easeOut" }}
                          className="w-2 rounded-t-md bg-gradient-to-t from-cyan-400/50 to-cyan-300 sm:w-2.5"
                          style={{ minHeight: "6px", boxShadow: "0 0 14px rgba(34,211,238,0.45)" }}
                          title={`新增信号 ${point.signals}`}
                        />
                      </div>
                      <div className="text-center">
                        <p className="title-font text-xs font-black text-white">{point.day}</p>
                        <p className="mt-0.5 text-[10px] text-cyan-300/80">+{point.signals}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-[0.22em] text-white/45">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-cyan-300" /> 今日新增信号
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-violet-400/80" /> 同时活跃玩家
                </span>
              </div>
            </StableTrendPanel>

            {/* Role distribution */}
            <StableTrendPanel>
              <div className="mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-violet-300" />
                <h3 className="title-font text-lg font-bold text-white">角色分布</h3>
              </div>
              <div className="space-y-3">
                {snapshot.roleDistribution.length === 0 && (
                  <div className="rounded-2xl border border-violet-300/12 bg-violet-300/[0.04] p-5 text-center text-sm text-violet-100/75">
                    暂无真实角色分布。
                  </div>
                )}
                {snapshot.roleDistribution.map((role) => (
                  <div key={role.role}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="text-white/72">{role.role}</span>
                      <span className="title-font font-bold" style={{ color: role.tone }}>
                        {Math.round(role.share * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${role.share * 100}%` }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.8, delay: 0.05 }}
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${role.tone}, ${role.tone}66)`,
                          boxShadow: `0 0 12px ${role.tone}55`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </StableTrendPanel>
          </motion.div>

          {/* ============== REAL HOT TOOLS ============== */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.5 }}
            className="mb-12"
          >
            <SectionHeader
              eyebrow="Rising Champions"
              title="真实热门装备"
              description="基于用户身份卡里的真实工具装配次数排序。"
              accent="amber"
              className="mb-6"
            />
            <div className="grid gap-4 sm:grid-cols-3">
              {rising.length === 0 && (
                <div className="col-span-full rounded-2xl border border-amber-300/12 bg-amber-300/[0.04] p-6 text-center text-sm text-amber-100/75">
                  暂无真实热门装备。
                </div>
              )}
              {rising.map((tool, index) => {
                const Icon = CATEGORY_ICON[tool.category];
                const accent = toolColor(tool.name, "#22d3ee");
                return (
                  <SpotlightCard
                    key={tool.id}
                    className="border-white/[0.06]"
                    spotlightColor={accent.replace("#", "").length === 6 ? `${parseInt(accent.slice(1, 3), 16)}, ${parseInt(accent.slice(3, 5), 16)}, ${parseInt(accent.slice(5, 7), 16)}` : "34, 211, 238"}
                  >
                    <div className="flex items-center gap-4 p-5">
                      <span
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border"
                        style={{ borderColor: `${accent}55`, background: `${accent}15` }}
                      >
                        <Icon className="h-5 w-5" style={{ color: accent }} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="title-font text-base font-black text-white">{tool.name}</p>
                        <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">#{index + 1} 热门装备</p>
                      </div>
                      <div className="text-right">
                        <p className="title-font text-xl font-black" style={{ color: accent }}>
                          {tool.users}
                        </p>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">users</p>
                      </div>
                    </div>
                  </SpotlightCard>
                );
              })}
            </div>
          </motion.div>

          {/* ============== CTA ============== */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-block rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.01] p-8">
              <Sparkles className="mx-auto h-8 w-8 text-amber-300/60" />
              <h3 className="title-font mt-3 text-2xl font-black text-white">生成你的 AI Agent 身份卡，加入趋势样本</h3>
              <p className="mt-2 max-w-md text-sm text-white/50">
                选择装备 + 场景 + 地区，30 秒拿到可分享可点亮的 Agent Passport。
              </p>
              <div className="mt-5 flex justify-center">
                <Link href="/survey" className="btn-rb-fill">
                  <Shield className="h-4 w-4" />
                  立即生成身份卡
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </PageShell>
      </Section>
    </main>
  );
}
