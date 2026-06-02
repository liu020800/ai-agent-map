"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  Compass,
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
} from "lucide-react";
import CountUp from "@/components/react-bits/CountUp";
import { PageShell, Section } from "@/components/ui";
import { getTrends, getCategoryLabel, champion, topRisingTools } from "@/lib/trends-data";
import { toolColor } from "@/data/mock";
import type { TrendDirection, ToolTrend, TrendsMatrix } from "@/lib/types";

const ParticlesBG = dynamic(() => import("@/components/react-bits/ParticlesBG"), { ssr: false });

const CATEGORY_ICON: Record<ToolTrend["category"], React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  agent: Code2,
  app: Cpu,
  automation: Workflow,
  local: ServerCog,
};

const DIRECTION_META: Record<TrendDirection, { glyph: string; cls: string; label: string }> = {
  up: { glyph: "▲", cls: "text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/30", label: "上升" },
  down: { glyph: "▼", cls: "text-[#f87171] bg-[#f87171]/10 border-[#f87171]/30", label: "下降" },
  stable: { glyph: "·", cls: "text-slate-400 bg-white/[0.04] border-white/[0.08]", label: "持平" },
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

export default function TrendsPage() {
  const snapshot = useMemo(() => getTrends(), []);
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

  return (
    <main className="relative min-h-screen overflow-hidden pb-24 pt-10">
      <ParticlesBG className="opacity-10" count={14} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 12% 8%, rgba(0,255,200,0.16), transparent 28%), radial-gradient(circle at 88% 6%, rgba(168,85,247,0.14), transparent 30%), radial-gradient(circle at 50% 100%, rgba(34,211,238,0.10), transparent 36%)",
        }}
      />
      <div aria-hidden className="hero-noise" />

      <Section className="relative z-10" spacing="md">
        <PageShell width="wide">
          {/* ---------- HERO ---------- */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="hero-panel relative overflow-hidden rounded-[28px] p-6 sm:p-10"
          >
            <div aria-hidden className="cyber-grid absolute inset-0 opacity-50" />
            <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00ffc8] to-transparent" />
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute inset-x-0 h-px animate-scan-line bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
            </div>

            <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#00ffc8]/20 bg-[#00ffc8]/[0.05] px-4 py-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inset-0 animate-ping rounded-full bg-[#00ffc8]/70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00ffc8]" />
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#00ffc8]">Trend Battlefield</span>
                </div>
                <h1 className="title-font text-balance text-3xl font-black leading-[1.05] text-white sm:text-4xl lg:text-[58px]">
                  <span className="block">AI 装备趋势战场</span>
                  <span className="mt-2 block bg-gradient-to-r from-cyan-200 via-violet-300 to-pink-300 bg-clip-text text-transparent">
                    谁在领跑，谁在冒头
                  </span>
                </h1>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
                  观察 Codex、Claude Code、OpenCode、DeepSeek、豆包等 AI Agent 工具在全国玩家中的使用热度、增长速度与阵营变化。每一次身份卡生成都会把数据汇入这张图谱。
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Link href="/survey" className="btn-lusion !px-5 !py-3 !text-xs">
                    <Sparkles className="h-4 w-4" /> 生成我的身份卡
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/ranking" className="btn-lusion-outline !px-5 !py-3 !text-xs">
                    <Flame className="h-4 w-4" /> 完整排行榜
                  </Link>
                </div>
              </div>

              <HeroSpotlight snapshot={snapshot} topTool={topTool} rising={rising} />
            </div>

            <div className="relative mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MetricCell
                label="今日新增信号"
                value={snapshot.todayNewSignals}
                hint="过去 24h"
                tone="#22d3ee"
                icon={TrendingUp}
              />
              <MetricCell
                label="增长最快工具"
                value={snapshot.fastestGrowing}
                hint={`+${snapshot.fastestGrowthRate.toFixed(1)}% WoW`}
                tone="#a855f7"
                icon={Rocket}
              />
              <MetricCell
                label="最活跃场景"
                value={snapshot.mostActiveScene}
                hint={`${snapshot.totalTools} 个工具入榜`}
                tone="#10b981"
                icon={Zap}
              />
              <MetricCell
                label="Agent 占比"
                value={`${snapshot.agentShare}%`}
                hint="代码 + 自动化"
                tone="#fbbf24"
                icon={Compass}
              />
            </div>
          </motion.div>

          {/* ---------- TOOL TREND BOARD ---------- */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45 }}
            className="mt-10"
          >
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-300/85">Tool Trend Board</p>
                <h2 className="title-font text-2xl font-black text-white sm:text-3xl">工具趋势榜</h2>
                <p className="mt-2 max-w-2xl text-sm text-white/55">
                  按玩家使用规模排序。每行带热度条、增长率徽章与方向信号，hover 触发流光。
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/45">
                <span className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5">热力 = 玩家规模</span>
                <span className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5">增长率 = 过去 7 天</span>
              </div>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))] backdrop-blur-xl">
              <ul className="divide-y divide-white/[0.04]">
                {snapshot.tools.map((tool, index) => (
                  <ToolTrendRow key={tool.id} tool={tool} index={index} maxHeat={maxHeat} />
                ))}
              </ul>
            </div>
          </motion.section>

          {/* ---------- MATRIX ---------- */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="mt-12"
          >
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-violet-300/85">Battlefield Matrix</p>
                <h2 className="title-font text-2xl font-black text-white sm:text-3xl">阵营趋势矩阵</h2>
                <p className="mt-2 max-w-2xl text-sm text-white/55">六大 AI 场景的当前热度和态势标签，hover 触发边框流光与上浮位移。</p>
              </div>
              <Link href="/ranking" className="text-xs text-cyan-300/80 transition hover:text-cyan-200">
                查看详细榜单 <ArrowUpRight className="inline h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {snapshot.matrix.map((cell) => (
                <MatrixCard key={cell.id} cell={cell} />
              ))}
            </div>
          </motion.section>

          {/* ---------- TIMELINE + ROLES ---------- */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="mt-12 grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]"
          >
            <div className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))] p-5 backdrop-blur-xl sm:p-6">
              <div className="mb-5 flex items-end justify-between gap-3">
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-300/85">Last 7 Days</p>
                  <h2 className="title-font text-xl font-black text-white sm:text-2xl">七日热度脉冲</h2>
                </div>
                <span className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-[11px] text-white/55">
                  峰值 {Math.max(...snapshot.timeline.map((t) => t.signals))} · 日均 {Math.round(snapshot.timeline.reduce((s, t) => s + t.signals, 0) / snapshot.timeline.length)}
                </span>
              </div>

              <div className="space-y-3">
                {snapshot.timeline.map((point) => {
                  const pct = Math.round((point.signals / maxSignals) * 100);
                  return (
                    <div key={point.day} className="grid grid-cols-[48px_1fr_64px] items-center gap-3 text-sm">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">{point.day}</span>
                      <div className="relative h-3 overflow-hidden rounded-full bg-white/[0.04]">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: "linear-gradient(90deg, rgba(0,255,200,0.85), rgba(34,211,238,0.85), rgba(168,85,247,0.85))",
                            boxShadow: "0 0 18px rgba(34,211,238,0.35)",
                          }}
                        />
                        <div
                          aria-hidden
                          className="absolute inset-y-0 left-0 rounded-full opacity-50 mix-blend-screen"
                          style={{
                            width: `${pct}%`,
                            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)",
                          }}
                        />
                      </div>
                      <div className="text-right">
                        <p className="title-font text-sm font-black text-white">{point.signals}</p>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">活跃 {point.active}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl border border-white/[0.05] bg-black/30 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/40">Insight</p>
                <p className="mt-2 text-sm leading-7 text-white/72">
                  周五是过去一周的信号高峰，达到 <span className="font-semibold text-white">{Math.max(...snapshot.timeline.map((t) => t.signals))}</span> 条新增，活跃玩家突破 <span className="font-semibold text-white">{Math.max(...snapshot.timeline.map((t) => t.active))}</span>。代码 Agent 类别的工作日流量显著高于周末，建议把更新与公告排在工作日发布。
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-5 backdrop-blur-xl sm:p-6">
              <div className="mb-5 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#00ffc8]" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/45">Role Distribution</p>
                  <h2 className="title-font text-xl font-black text-white sm:text-2xl">玩家阵营分布</h2>
                </div>
              </div>
              <div className="space-y-3">
                {snapshot.roleDistribution.map((role) => (
                  <div key={role.role} className="rounded-2xl border border-white/[0.05] bg-black/30 p-3">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-semibold text-white/85">{role.role}</span>
                      <span className="title-font font-black text-white">{Math.round(role.share * 100)}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.round(role.share * 100)}%`,
                          background: `linear-gradient(90deg, ${role.tone}, ${role.tone}55)`,
                          boxShadow: `0 0 12px ${role.tone}55`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.05] p-4 text-sm text-cyan-100/80">
                想成为 <span className="font-semibold text-white">代码指挥官</span> 或 <span className="font-semibold text-white">本地模型驯养师</span> 阵营的一员？生成身份卡，你就会被归入对应类别。
              </div>
            </div>
          </motion.section>

          {/* ---------- CTA ---------- */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45 }}
            className="mt-14"
          >
            <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(163,230,53,0.08),rgba(236,72,153,0.10))] p-7 text-center shadow-[0_28px_90px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:p-12">
              <div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:36px_36px] opacity-40" />
              <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent" />
              <div className="relative">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/30 bg-black/40">
                  <Shield className="h-7 w-7 text-cyan-200" />
                </div>
                <h2 className="title-font text-2xl font-black text-white sm:text-4xl">生成你的 AI Agent 身份卡，加入趋势样本</h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
                  选装备、定义场景、写入城市。完成后你就会出现在工具榜、地区榜与角色榜中，并被纳入下一次趋势分析。
                </p>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link href="/survey" className="btn-lusion !px-6 !py-3.5 !text-sm">
                    <Sparkles className="h-4 w-4" /> 立即生成身份卡
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/map" className="btn-lusion-outline !px-6 !py-3.5 !text-sm">
                    <Compass className="h-4 w-4" /> 查看全国雷达
                  </Link>
                </div>
              </div>
            </div>
          </motion.section>
        </PageShell>
      </Section>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Subcomponents                                                      */
/* ------------------------------------------------------------------ */

function MetricCell({
  label,
  value,
  hint,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}) {
  const isNumber = typeof value === "number";
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-black/30 p-4">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${tone}, transparent)` }} />
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">{label}</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02]">
          <Icon className="h-3.5 w-3.5" style={{ color: tone }} />
        </span>
      </div>
      <p className="title-font text-2xl font-black text-white sm:text-3xl">
        {isNumber ? <CountUp to={value} duration={1.4} /> : value}
      </p>
      {hint ? <p className="mt-1 text-xs text-white/45">{hint}</p> : null}
    </div>
  );
}

function HeroSpotlight({
  snapshot,
  topTool,
  rising,
}: {
  snapshot: ReturnType<typeof getTrends>;
  topTool: ToolTrend | null;
  rising: ToolTrend[];
}) {
  if (!topTool) return null;
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-black/30 p-5">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(0,255,200,0.16),transparent_55%),radial-gradient(circle_at_20%_85%,rgba(168,85,247,0.18),transparent_60%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 h-px animate-scan-line bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
      </div>

      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-cyan-300/85">Champion · 趋势之巅</p>
          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.06] px-2.5 py-0.5 text-[10px] font-semibold text-cyan-200">+{topTool.growthRate.toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-black/30"
            style={{ boxShadow: `0 0 24px ${toolColor(topTool.name)}55` }}
          >
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: toolColor(topTool.name), boxShadow: `0 0 12px ${toolColor(topTool.name)}` }}
              aria-hidden
            />
          </span>
          <div>
            <p className="title-font text-2xl font-black text-white">{topTool.name}</p>
            <p className="text-xs text-white/45">{getCategoryLabel(topTool.category)} · {topTool.users} 位玩家</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {rising.map((tool) => (
            <div key={tool.id} className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-2">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">{getCategoryLabel(tool.category)}</p>
              <p className="mt-1 truncate text-xs font-semibold text-white">{tool.name}</p>
              <p className="text-[10px] font-semibold text-[#22c55e]">+{tool.growthRate.toFixed(1)}%</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-white/[0.05] bg-black/30 p-3 text-xs leading-6 text-white/55">
          当前生态呈现明显的头部集中趋势，<span className="font-semibold text-white">{topTool.name}</span> 与紧随其后的追赶者组成了主力阵列，<span className="text-[#00ffc8]">{rising[0]?.name}</span> 增速最快，值得持续观察。
        </div>
      </div>
    </div>
  );
}

function ToolTrendRow({ tool, index, maxHeat }: { tool: ToolTrend; index: number; maxHeat: number }) {
  const accent = toolColor(tool.name);
  const heatPct = Math.max(8, Math.round((tool.heat / maxHeat) * 100));
  const Icon = CATEGORY_ICON[tool.category];
  const dirMeta = DIRECTION_META[tool.direction];
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: index * 0.03 }}
      className="group relative flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:gap-5 sm:px-6"
    >
      <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-cyan-300/0 to-transparent transition-colors group-hover:via-cyan-300/40" />
      <div className="flex shrink-0 items-center gap-3 sm:w-[260px]">
        <span className="title-font flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-black/30 text-sm font-black text-white/55">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-black/30"
          style={{ boxShadow: `0 0 16px -4px ${accent}66` }}
        >
          <Icon className="h-4 w-4" style={{ color: accent }} />
        </span>
        <div>
          <p className="font-semibold text-white">{tool.name}</p>
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">{getCategoryLabel(tool.category)}</p>
        </div>
      </div>

      <div className="flex-1">
        <div className="relative h-2.5 overflow-hidden rounded-full bg-white/[0.04]">
          <motion.span
            initial={{ width: 0 }}
            whileInView={{ width: `${heatPct}%` }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.05 + index * 0.04 }}
            className="absolute inset-y-0 left-0 block rounded-full"
            style={{
              background: `linear-gradient(90deg, ${accent}cc, ${accent}55)`,
              boxShadow: `0 0 14px ${accent}55`,
            }}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <span className="rounded-full border border-white/[0.06] bg-black/30 px-2.5 py-1 text-[10px] font-mono text-white/55">
          {tool.users} 人
        </span>
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${dirMeta.cls}`}>
          <span aria-hidden>{dirMeta.glyph}</span>
          {tool.growthRate >= 0 ? "+" : ""}{tool.growthRate.toFixed(1)}%
        </span>
        <span className="title-font text-sm font-black text-white">{tool.heat}</span>
        <span className="text-[10px] uppercase tracking-[0.22em] text-white/35">Heat</span>
      </div>
    </motion.li>
  );
}

function MatrixCard({ cell }: { cell: TrendsMatrix }) {
  const Icon = MATRIX_ICON[cell.id] ?? Sparkles;
  const tone = MATRIX_TONE[cell.id] ?? { accent: "#22d3ee", bg: "rgba(34,211,238,0.10)", border: "rgba(34,211,238,0.32)" };
  return (
    <motion.div
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
          <div className="h-1 w-24 overflow-hidden rounded-full bg-white/[0.05]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${cell.heat}%`,
                background: `linear-gradient(90deg, ${tone.accent}, ${tone.accent}55)`,
                boxShadow: `0 0 10px ${tone.accent}55`,
              }}
            />
          </div>
          <span className="title-font text-sm font-black text-white">{cell.heat}</span>
        </div>
      </div>
    </motion.div>
  );
}
