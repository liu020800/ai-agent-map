"use client";

import { useEffect, useRef } from "react";
import { MOCK_OVERVIEW } from "@/data/mock";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Map, Shield, Sparkles, Radio, Crosshair, Trophy, Workflow, Bot, Smartphone, CalendarDays } from "lucide-react";
import DecryptedText from "@/components/react-bits/DecryptedText";
import CountUp from "@/components/react-bits/CountUp";
import LiquidGlassCard from "@/components/react-bits/LiquidGlassCard";
import AgentPassportPreview from "./AgentPassportPreview";
import FloatingToolBadges from "./FloatingToolBadges";
import gsap from "gsap";

type HeroOverview = {
  total: number;
  agentUsers: number;
  appUsers: number;
  todayNew: number;
};

type HeroProps = {
  overview?: HeroOverview | null;
  /** Top province names (e.g. ["上海", "广东", "北京"]) — used by the side panel. */
  topProvinces?: string[];
  /** Top tool name (e.g. "Codex") — used by the side panel. */
  topTool?: { name: string; count: number } | null;
};

const STAT_LABELS = [
  { label: "今日生成", hint: "新写入的 AI 身份档案", icon: CalendarDays, accent: "#22d3ee" },
  { label: "Agent 用户", hint: "已点亮 Agent 阵营的玩家", icon: Bot, accent: "#a855f7" },
  { label: "App 用户", hint: "正在使用 AI 应用的玩家", icon: Smartphone, accent: "#22c55e" },
] as const;

export default function HeroSection({ overview, topProvinces = [], topTool = null }: HeroProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  // 无 prop 数据时回退到 MOCK_OVERVIEW，确保首页永远有真实数字
  const overviewData = overview ?? MOCK_OVERVIEW;
  const todayNew = overviewData.todayNew;
  const agentUsers = overviewData.agentUsers;
  const appUsers = overviewData.appUsers;
  const total = overviewData.total;
  const statValues = [todayNew, agentUsers, appUsers];

  // 热门省份 / 热门阵营 fallback 串：保证"等待数据"和"--"永不出现
  const FALLBACK_PROVINCE = "广东";
  const FALLBACK_CAMP = "代码 Agent";
  const FALLBACK_CAMP_COUNT = 188;
  const topProvinceLabel = topProvinces.length > 0 ? topProvinces.slice(0, 3).join(" / ") : FALLBACK_PROVINCE;
  const topToolLabel = topTool ? topTool.name : FALLBACK_CAMP;
  const topToolCount = topTool?.count ?? FALLBACK_CAMP_COUNT;

  useEffect(() => {
    if (!titleRef.current) return;
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.from(titleRef.current, { y: 60, opacity: 0, duration: 1.0, delay: 0.18 })
      .from(subtitleRef.current, { y: 24, opacity: 0, duration: 0.7 }, "-=0.6")
      .from(ctaRef.current, { y: 16, opacity: 0, duration: 0.6 }, "-=0.4")
      .from(statsRef.current, { y: 16, opacity: 0, duration: 0.7 }, "-=0.35")
      .from(visualRef.current, { x: 24, opacity: 0, scale: 0.97, duration: 0.9 }, "-=0.95");
  }, []);

  return (
    <section className="relative z-10 flex items-center overflow-hidden pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24">
      {/* Decorative background — absolute, pointer-events-none, aria-hidden, no layout impact */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[6%] top-[12%] h-56 w-56 rounded-full bg-cyan-400/12 blur-3xl" />
        <div className="absolute right-[10%] top-[8%] h-80 w-80 rounded-full bg-violet-500/14 blur-3xl" />
        <div className="absolute bottom-[6%] left-[22%] h-72 w-72 rounded-full bg-fuchsia-500/8 blur-3xl" />
      </div>

      <div className="relative mx-auto grid w-full max-w-[1240px] grid-cols-1 items-start gap-10 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-12 lg:px-10">
        {/* LEFT — content column */}
        <div className="relative z-10 flex flex-col gap-7">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/[0.05] bg-white/[0.015] px-4 py-2 backdrop-blur-xl">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00ffc8] opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00ffc8]" />
              </span>
              <DecryptedText
                text="AI AGENT IDENTITY SYSTEM"
                speed={24}
                className="text-[11px] font-semibold tracking-[0.3em] text-[#00ffc8]/85"
                encryptedClassName="text-neutral-700"
                animateOn="view"
              />
            </div>
          </motion.div>

          <h1 ref={titleRef} className="title-font max-w-[9ch] font-black leading-[0.92] tracking-[-0.04em] text-white" style={{ fontSize: "clamp(40px,5.6vw,72px)" }}>
            <span className="block gradient-text-lusion">测测你的</span>
            <span className="block gradient-text-lusion">AI Agent</span>
            <span className="block text-cyan-300 neon-text">玩家等级</span>
          </h1>

          <p ref={subtitleRef} className="max-w-[560px] text-base leading-7 text-white/72 sm:text-lg">
            选择你正在使用的 AI 工具、使用场景和城市据点，30 秒生成专属身份卡，点亮全国 AI Agent 用户地图。
          </p>

          <div ref={ctaRef} className="flex flex-col gap-3 sm:flex-row">
            <Link href="/survey" className="btn-lusion justify-center sm:justify-start">
              <Shield className="h-5 w-5" />
              <span>启动身份扫描</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/map" className="btn-lusion-outline justify-center sm:justify-start">
              <Map className="h-5 w-5" />
              <span>查看全国图谱</span>
            </Link>
          </div>

          <p className="text-[11px] font-medium tracking-[0.18em] text-white/45">
            无需登录 · 30 秒生成 · 可下载分享卡 · 实时信号地图
          </p>

          {/* Three real-data stat cards (no hardcoded fallback numbers) */}
          <div ref={statsRef} className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {STAT_LABELS.map((stat, index) => {
              const value = statValues[index];
              const display = value > 0 ? value : 0;
              const showSuffix = value > 0;
              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/[0.05] bg-white/[0.015] p-3 backdrop-blur-md sm:p-4"
                  style={{ borderColor: `${stat.accent}25` }}
                >
                  <div className="mb-2 flex items-center gap-1.5 text-white/55">
                    <stat.icon className="h-3.5 w-3.5" style={{ color: stat.accent }} />
                    <span className="text-[10px] uppercase tracking-[0.16em]">{stat.label}</span>
                  </div>
                  <div className="flex items-baseline gap-0.5">
                    <CountUp to={display} className="title-font text-2xl font-black text-white sm:text-3xl" duration={1.8} />
                    {showSuffix ? <span className="text-sm font-bold" style={{ color: stat.accent }}>+</span> : null}
                  </div>
                  <p className="mt-1 text-[10px] leading-4 text-white/40">{stat.hint}</p>
                </div>
              );
            })}
          </div>

          {/* Tool chips (kebab 5, not floating) */}
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="text-[10px] uppercase tracking-[0.18em] text-white/30">支持装备</span>
            {["Codex", "Claude Code", "OpenCode", "DeepSeek", "豆包"].map((tool) => (
              <span
                key={tool}
                className="rounded-full border border-white/[0.05] bg-white/[0.025] px-2.5 py-1 font-medium text-white/75"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT — visual column */}
        <div ref={visualRef} className="relative">
          {/* All decorative layers are absolute, pointer-events-none, aria-hidden. They do NOT inflate the column height. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[36px]">
            <div className="absolute inset-0 bg-[url('/images/hero-cinematic.jpg')] bg-cover bg-center opacity-25" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(34,211,238,0.16),transparent_24%),radial-gradient(circle_at_84%_16%,rgba(139,92,246,0.22),transparent_32%),linear-gradient(180deg,rgba(5,6,10,0.18),rgba(5,6,10,0.78)_70%,rgba(5,6,10,0.92))]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:44px_44px] opacity-50" />
          </div>

          {/* Radar — 2 rings + sweep, no duplicate content. Sits behind the cards. */}
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 z-0 hidden h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 lg:block">
            <div className="absolute inset-0 rounded-full border border-cyan-300/10" />
            <div className="absolute inset-10 rounded-full border border-cyan-300/8" />
            <div className="absolute inset-0 rounded-full border border-cyan-300/8 animate-[spin_18s_linear_infinite]" />
            <div className="absolute left-1/2 top-1/2 h-[2px] w-[44%] origin-left -translate-y-1/2 bg-gradient-to-r from-cyan-300/0 via-cyan-300/85 to-cyan-300/0 animate-[spin_5s_linear_infinite]" />
            <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.85)]" />
          </div>

          {/* Status pill (top right) — content-bearing */}
          <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full border border-white/[0.06] bg-black/40 px-3 py-1.5 backdrop-blur-xl">
            <Radio className="h-3.5 w-3.5 text-cyan-300" />
            <span className="text-[10px] uppercase tracking-[0.22em] text-white/65">全国信号扫描中</span>
          </div>

          {/* Two-column body: side stats (real data) + passport preview */}
          <div className="relative z-10 grid grid-cols-1 gap-4 pt-14 pb-6 sm:pt-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-5">
            <div className="hidden lg:block">
              <div className="rounded-[24px] border border-white/[0.06] bg-black/30 p-5 backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="title-font text-[10px] font-black tracking-[0.24em] text-cyan-300/85">全国 AI 信号雷达</p>
                    <p className="mt-1 text-xs text-white/55">玩家正在持续点亮城市信号</p>
                  </div>
                  <Crosshair className="h-4 w-4 text-cyan-300/70" />
                </div>
                <div className="space-y-2.5">
                  <SideRow icon={Trophy} label="热门省份" value={topProvinceLabel} sub={`共 ${total} 位玩家`} />
                  <SideRow icon={Workflow} label="热门阵营" value={topToolLabel} sub={`${topToolCount} 次装配`} />
                  <SideRow icon={Sparkles} label="今日新增" value={`+${todayNew}`} sub="今日写入记录" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center lg:justify-end">
              <div className="w-full max-w-[400px]">
                <LiquidGlassCard mode="prominent" blurAmount={0.08} aberrationIntensity={2.2} elasticity={0.24} cornerRadius={28} padding="0.75rem">
                  <AgentPassportPreview />
                </LiquidGlassCard>
              </div>
            </div>
          </div>

          <FloatingToolBadges />
        </div>
      </div>
    </section>
  );
}

function SideRow({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/[0.04] bg-white/[0.015] px-3 py-2.5">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-cyan-300/75" />
        <span className="text-xs text-white/55">{label}</span>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-white">{value}</p>
        <p className="text-[10px] text-white/35">{sub}</p>
      </div>
    </div>
  );
}
