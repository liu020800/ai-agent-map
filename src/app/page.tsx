"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Swords, Map, TrendingUp, Zap, Users, Bot, Smartphone, CalendarDays, Radio, ChevronRight } from "lucide-react";
import BlurText from "@/components/react-bits/BlurText";
import DecryptedText from "@/components/react-bits/DecryptedText";
import CountUp from "@/components/react-bits/CountUp";
import SpotlightCard from "@/components/react-bits/SpotlightCard";

const ParticlesBG = dynamic(() => import("@/components/react-bits/ParticlesBG"), { ssr: false });
const HomeMapPreview = dynamic(() => import("@/components/home-map-preview"), { ssr: false });

export default function HomePage() {
  return (
    <main className="relative min-h-screen">
      <ParticlesBG className="-z-10 opacity-30" count={50} />

      {/* ─── Hero ─── */}
      <section className="relative flex min-h-[92vh] flex-col items-center justify-center px-6 bg-radial-hero">
        {/* Decorative grid lines */}
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-8 text-center max-w-[900px]">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-5 py-2 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
              </span>
              <DecryptedText text="AI AGENT IDENTITY SYSTEM" speed={35} className="text-[11px] font-semibold tracking-[0.25em] text-cyan-300/90" />
            </div>
          </motion.div>

          {/* Title */}
          <BlurText
            text="你是 AI 聊天用户，还是 Agent 玩家？"
            className="text-[clamp(2.5rem,7vw,5.5rem)] font-black leading-[1.1] tracking-tight text-white"
            delay={0.3}
          />

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="max-w-[560px] text-lg leading-relaxed text-slate-400 sm:text-xl"
          >
            生成你的 AI 身份卡，点亮全国 AI Agent 用户地图。
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <Link href="/survey" className="btn-primary text-base">
              <Shield className="h-5 w-5" /> 启动身份扫描 <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/map" className="btn-ghost text-base">
              <Map className="h-5 w-5" /> 查看全国图谱
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex flex-col items-center gap-2 text-slate-500"
          >
            <span className="text-[10px] tracking-widest uppercase">Scroll</span>
            <ChevronRight className="h-4 w-4 -rotate-90" />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Stats Dashboard ─── */}
      <section className="relative px-6 py-20">
        <div className="mx-auto max-w-[1200px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <p className="text-xs font-semibold tracking-[0.3em] text-indigo-400 uppercase mb-3">Live Dashboard</p>
            <h2 className="text-3xl font-black text-white sm:text-4xl">全国 AI 信号总览</h2>
          </motion.div>
          <StatsSection />
        </div>
      </section>

      {/* ─── Map Preview ─── */}
      <section className="relative px-6 py-16">
        <div className="mx-auto max-w-[1200px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Radio className="h-4 w-4 text-cyan-400 animate-pulse" />
                <p className="text-xs font-semibold tracking-[0.2em] text-cyan-400 uppercase">Signal Map</p>
              </div>
              <h2 className="text-2xl font-black text-white sm:text-3xl">全国 AI 信号正在点亮</h2>
            </div>
            <Link href="/map" className="hidden items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 transition-colors sm:flex">
              查看完整地图 <ChevronRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <SpotlightCard className="p-1" spotlightColor="rgba(34, 211, 238, 0.06)">
            <div className="rounded-xl overflow-hidden border border-white/[0.04]">
              <HomeMapPreview />
            </div>
          </SpotlightCard>

          <Link href="/map" className="mt-4 flex items-center justify-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 transition-colors sm:hidden">
            查看完整地图 <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ─── Hot Equipment ─── */}
      <section className="relative px-6 py-16">
        <div className="mx-auto max-w-[1200px]">
          <HotTools />
        </div>
      </section>

      {/* ─── Feature Grid ─── */}
      <section className="relative px-6 py-16">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Shield, title: "身份扫描", desc: "生成你的 AI Agent 身份卡", href: "/survey", accent: "from-indigo-500 to-cyan-500" },
              { icon: Swords, title: "装备热度", desc: "最热门 AI 工具实时排名", href: "/ranking", accent: "from-amber-500 to-orange-500" },
              { icon: Map, title: "信号雷达", desc: "全国 Agent 用户分布图", href: "/map", accent: "from-cyan-500 to-teal-500" },
              { icon: TrendingUp, title: "趋势战场", desc: "AI 工具热度变化趋势", href: "/trends", accent: "from-purple-500 to-pink-500" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Link href={item.href}>
                  <SpotlightCard className="group flex flex-col gap-4 p-6 h-full" spotlightColor="rgba(99, 102, 241, 0.06)">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${item.accent} shadow-lg`}>
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                      <p className="text-sm text-slate-400">{item.desc}</p>
                    </div>
                    <div className="mt-auto flex items-center gap-1 text-xs font-medium text-indigo-400 opacity-0 translate-y-2 transition-all group-hover:opacity-100 group-hover:translate-y-0">
                      进入 <ChevronRight className="h-3 w-3" />
                    </div>
                  </SpotlightCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer CTA ─── */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-[600px] text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-black text-white mb-4">准备好扫描你的 AI 身份了吗？</h2>
            <p className="text-slate-400 mb-8">只需 30 秒，生成你的 Agent 身份卡</p>
            <Link href="/survey" className="btn-primary text-base">
              <Sparkles className="h-5 w-5" /> 开始扫描
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

/* ─── Stats Section ─── */
function StatsSection() {
  const [data, setData] = useState<{ total: number; agentUsers: number; appUsers: number; todayNew: number } | null>(null);
  useEffect(() => {
    fetch("/api/ranking").then(r => r.json()).then(j => setData(j.overview)).catch(() => {});
  }, []);

  const stats = [
    { icon: Users, label: "全国 AI 玩家", value: data?.total ?? 0, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { icon: Bot, label: "Agent 玩家", value: data?.agentUsers ?? 0, color: "text-purple-400", bg: "bg-purple-500/10" },
    { icon: Smartphone, label: "App 用户", value: data?.appUsers ?? 0, color: "text-blue-400", bg: "bg-blue-500/10" },
    { icon: CalendarDays, label: "今日新增", value: data?.todayNew ?? 0, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
        >
          <div className="stat-card">
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.bg}`}>
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <p className="text-xs text-slate-500 font-medium">{item.label}</p>
            </div>
            <CountUp target={item.value} className="text-3xl font-black text-white tabular-nums sm:text-4xl" duration={2} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Hot Tools ─── */
function HotTools() {
  const [tools, setTools] = useState<Array<{ name: string; count: number }>>([]);
  useEffect(() => {
    fetch("/api/ranking").then(r => r.json()).then(j => setTools(j.tools?.slice(0, 10) ?? [])).catch(() => {});
  }, []);

  if (tools.length === 0) return null;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-2">
          <Swords className="h-4 w-4 text-amber-400" />
          <p className="text-xs font-semibold tracking-[0.2em] text-amber-400 uppercase">Top Equipment</p>
        </div>
        <h2 className="text-2xl font-black text-white sm:text-3xl">热门装备榜</h2>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {tools.map((tool, i) => (
          <motion.div
            key={tool.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
          >
            <SpotlightCard className="p-4" spotlightColor={i < 3 ? "rgba(251, 191, 36, 0.08)" : "rgba(99, 102, 241, 0.05)"}>
              <div className="flex items-center justify-between mb-3">
                <span className={`flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold ${
                  i < 3 ? "bg-amber-500/15 text-amber-300" : "bg-white/5 text-slate-500"
                }`}>
                  {i + 1}
                </span>
                {i < 3 && <Zap className="h-3.5 w-3.5 text-amber-400" />}
              </div>
              <p className="text-sm font-bold text-white mb-1 truncate">{tool.name}</p>
              <p className="text-xs text-slate-500">
                <span className="text-base font-black text-indigo-300">{tool.count}</span> 人使用
              </p>
            </SpotlightCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Sparkles(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" /><path d="M22 5h-4" /><path d="M4 17v2" /><path d="M5 18H3" />
    </svg>
  );
}
