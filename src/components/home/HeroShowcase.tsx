"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Map,
  Shield,
  Sparkles,
  Radio,
  Crosshair,
  Trophy,
  Workflow,
  Bot,
  Smartphone,
  CalendarDays,
  Users,
} from "lucide-react";
import CountUp from "@/components/react-bits/CountUp";
import TiltedCard from "@/components/react-bits/TiltedCard";
import SpotlightCard from "@/components/react-bits/SpotlightCard";
import AgentPassportPreview from "./AgentPassportPreview";
import FloatingToolBadges from "./FloatingToolBadges";

type HeroOverview = {
  total: number;
  agentUsers: number;
  appUsers: number;
  todayNew: number;
};

type HeroShowcaseProps = {
  overview?: HeroOverview | null;
  topProvinces?: string[];
  topTool?: { name: string; count: number } | null;
};

const STATS = [
  { key: "total", label: "全国 AI 玩家", hint: "已写入身份档案", icon: Users, color: "#67e8f9" },
  { key: "agentUsers", label: "Agent 玩家", hint: "代码 + 自动化", icon: Bot, color: "#a3e635" },
  { key: "appUsers", label: "App 用户", hint: "日常 AI 使用者", icon: Smartphone, color: "#f0abfc" },
  { key: "todayNew", label: "今日新增", hint: "近 24 小时", icon: CalendarDays, color: "#fbbf24" },
] as const;

export default function HeroShowcase({ overview, topProvinces = [], topTool = null }: HeroShowcaseProps) {
  const safeOverview: HeroOverview = overview ?? { total: 0, agentUsers: 0, appUsers: 0, todayNew: 0 };

  return (
    <section className="page-hero relative isolate">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[8%] top-[14%] h-[28rem] w-[28rem] rounded-full bg-[rgba(139,92,246,0.28)] blur-[120px]" />
        <div className="absolute right-[6%] top-[10%] h-[26rem] w-[26rem] rounded-full bg-[rgba(0,229,255,0.22)] blur-[120px]" />
        <div className="absolute bottom-[-6rem] left-1/2 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-[rgba(163,230,53,0.18)] blur-[120px]" />
        <div className="cyber-grid absolute inset-0 opacity-40" />
        <div className="hero-noise" />
      </div>

      <div className="shell relative z-10 grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="max-w-[680px]">
          <div className="btn-pill mb-6 border-cyan-300/20 bg-cyan-300/[0.04] text-cyan-100">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#a3e635] opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#a3e635]" />
            </span>
            AI AGENT IDENTITY SCANNER · v0.8
          </div>

          <h1
            className="display-font text-[clamp(44px,5.7vw,76px)] font-black leading-[0.98] tracking-[-0.055em] text-white drop-shadow-[0_0_44px_rgba(34,211,238,0.26)]"
            style={{ lineHeight: 1.04 }}
          >
            <span className="block whitespace-nowrap">你是 AI 聊天用户，</span>
            <span className="block whitespace-nowrap">还是 <span className="gradient-text-rb">Agent 玩家？</span></span>
          </h1>

          <p className="mt-7 max-w-[640px] text-[clamp(18px,1.7vw,24px)] font-medium leading-[1.6] text-slate-100/86">
            生成你的 AI 身份卡，点亮全国 AI Agent 用户地图。
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/survey" className="btn-rb-fill">
              <Shield className="h-5 w-5" />
              <span>启动身份扫描</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/map" className="btn-rb-ghost">
              <Map className="h-5 w-5" />
              <span>查看全国图谱</span>
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3 text-[12px] text-slate-200/72">
            <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#a3e635] shadow-[0_0_8px_#a3e635]" />无需登录</span>
            <span className="text-white/22">·</span>
            <span>30 秒生成</span>
            <span className="text-white/22">·</span>
            <span>可下载分享卡</span>
            <span className="text-white/22">·</span>
            <span>实时信号地图</span>
          </div>

          <motion.div
            initial={false}
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 1.0 } } }}
            className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {STATS.map((stat) => {
              const Icon = stat.icon;
              const rawValue = (safeOverview as Record<string, number>)[stat.key] ?? 0;
              const value = rawValue;
              const accent = stat.color;
              const rgb = `${parseInt(accent.slice(1, 3), 16)}, ${parseInt(accent.slice(3, 5), 16)}, ${parseInt(accent.slice(5, 7), 16)}`;
              return (
                <motion.div
                  key={stat.key}
                  variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } }}
                >
                  <SpotlightCard className="h-full border-white/[0.08]" spotlightColor={rgb}>
                    <div className="flex h-full flex-col justify-between gap-3 p-4">
                      <div className="flex items-center justify-between">
                        <Icon className="h-4 w-4" style={{ color: accent }} />
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent, boxShadow: `0 0 12px ${accent}` }} />
                      </div>
                      <div>
                        <div className="flex items-baseline gap-1">
                          <CountUp to={value} className="text-[28px] font-black text-white" duration={1.6} />
                          <span className="text-[12px] font-bold text-white/35">+</span>
                        </div>
                        <p className="mt-1 text-[11px] font-medium text-white/52">{stat.label}</p>
                        <p className="text-[10px] leading-4 text-white/32">{stat.hint}</p>
                      </div>
                    </div>
                  </SpotlightCard>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        <div className="relative">
          <TiltedCard maxTilt={6} scale={1.01} className="relative">
            <div className="relative overflow-hidden rounded-[22px] border border-white/[0.12] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] shadow-[0_30px_120px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
              <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:42px_42px] opacity-40" />
                <div className="scanline" />
              </div>

              <div aria-hidden className="pointer-events-none absolute right-6 top-6 z-20 flex items-center gap-2 rounded-full border border-cyan-300/20 bg-black/55 px-3 py-1.5 backdrop-blur-xl">
                <Radio className="h-3.5 w-3.5 text-cyan-300" />
                <span className="text-[10px] uppercase tracking-[0.22em] text-white/72">全国信号雷达已激活</span>
              </div>

              <div className="relative z-10 grid grid-cols-1 gap-4 p-5 lg:grid-cols-[0.85fr_1.15fr]">
                <div className="order-2 flex items-center justify-center lg:order-1">
                  <div className="w-full max-w-[300px]">
                    <AgentPassportPreview />
                  </div>
                </div>
                <div className="order-1 flex flex-col gap-3 lg:order-2">
                  <SideMetric icon={Trophy} label="热门地区" value={topProvinces[0] || "待点亮"} sub={topProvinces[1] ? `次热:${topProvinces[1]}` : "等待真实用户点亮"} />
                  <SideMetric icon={Workflow} label="主力装备" value={topTool?.name || "待装配"} sub={topTool ? `${topTool.count} 次装配` : "等待真实提交"} />
                  <SideMetric icon={Crosshair} label="今日新增" value={`+${safeOverview.todayNew}`} sub="近 24h 新增身份" />
                </div>
              </div>
            </div>
          </TiltedCard>
          <FloatingToolBadges />
        </div>
      </div>
    </section>
  );
}

function SideMetric({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <SpotlightCard className="border-white/[0.06]" spotlightColor="103, 232, 249" spotlightSize={220}>
      <div className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/[0.05] text-cyan-200">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">{label}</p>
          <p className="truncate text-[15px] font-bold text-white">{value}</p>
          <p className="text-[11px] text-white/38">{sub}</p>
        </div>
      </div>
    </SpotlightCard>
  );
}
