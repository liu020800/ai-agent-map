"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { FadeIn } from "@/components/motion-wrapper";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Swords, Map, TrendingUp, Zap, Users, Bot, Smartphone, CalendarDays } from "lucide-react";
import BlurText from "@/components/react-bits/BlurText";
import DecryptedText from "@/components/react-bits/DecryptedText";
import CountUp from "@/components/react-bits/CountUp";
import SpotlightCard from "@/components/react-bits/SpotlightCard";

const ParticlesBG = dynamic(() => import("@/components/react-bits/ParticlesBG"), { ssr: false });
const HomeMapPreview = dynamic(() => import("@/components/home-map-preview"), { ssr: false });

export default function HomePage() {
  return (
    <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center gap-20 px-6 py-16">
      {/* Particles background */}
      <ParticlesBG className="fixed inset-0 -z-10 opacity-40" count={50} />

      {/* Hero */}
      <section className="flex min-h-[70vh] flex-col items-center justify-center gap-8 text-center">
        <FadeIn>
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 px-5 py-2 text-xs font-medium tracking-[0.2em] text-cyan-300 backdrop-blur-sm">
            <Zap className="h-3 w-3" />
            <DecryptedText text="AI AGENT IDENTITY SYSTEM" speed={50} />
          </motion.div>
        </FadeIn>

        <BlurText
          text="你是 AI 聊天用户，还是 Agent 玩家？"
          className="text-4xl font-black leading-tight text-white sm:text-6xl lg:text-7xl"
          delay={0.2}
        />

        <FadeIn delay={0.5}>
          <p className="max-w-xl text-base text-slate-400 sm:text-lg">
            生成你的 AI 身份卡，点亮全国 AI Agent 用户地图。
          </p>
        </FadeIn>

        <FadeIn delay={0.6}>
          <Link href="/survey"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-10 py-4 text-base font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40">
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-white/10 to-cyan-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Shield className="h-5 w-5" /> 启动身份扫描 <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </FadeIn>
      </section>

      {/* Stats */}
      <FadeIn delay={0.3} className="w-full">
        <StatsSection />
      </FadeIn>

      {/* Map preview */}
      <FadeIn delay={0.4} className="w-full max-w-5xl">
        <SpotlightCard className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-sm font-bold text-white"><Map className="h-4 w-4 text-cyan-400" />全国 AI 用户分布</h2>
            <Link href="/map" className="text-xs text-cyan-400 hover:text-cyan-300">查看完整地图 →</Link>
          </div>
          <HomeMapPreview />
        </SpotlightCard>
      </FadeIn>

      {/* Hot tools */}
      <FadeIn delay={0.5} className="w-full max-w-5xl">
        <HotTools />
      </FadeIn>

      {/* Feature cards */}
      <div className="grid w-full max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Shield, title: "身份扫描", desc: "生成你的 AI 身份卡", href: "/survey", delay: 0.1 },
          { icon: Swords, title: "装备榜", desc: "最热门 AI 工具排名", href: "/ranking", delay: 0.15 },
          { icon: Map, title: "全国据点", desc: "各地区 Agent 分布", href: "/map", delay: 0.2 },
          { icon: TrendingUp, title: "趋势战场", desc: "AI 工具热度趋势", href: "/trends", delay: 0.25 },
        ].map((item) => (
          <FadeIn key={item.title} delay={item.delay}>
            <Link href={item.href}>
              <SpotlightCard className="group flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl transition-all hover:border-indigo-500/30">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-indigo-400 group-hover:bg-white/[0.1]">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-white">{item.title}</h3>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </SpotlightCard>
            </Link>
          </FadeIn>
        ))}
      </div>
    </main>
  );
}

function StatsSection() {
  const [data, setData] = useState<{ total: number; agentUsers: number; appUsers: number; todayNew: number } | null>(null);
  useEffect(() => {
    fetch("/api/ranking").then(r => r.json()).then(j => setData(j.overview)).catch(() => {});
  }, []);

  const stats = [
    { icon: Users, label: "全国 AI 玩家", value: data?.total ?? 0, color: "text-cyan-400" },
    { icon: Bot, label: "Agent 玩家", value: data?.agentUsers ?? 0, color: "text-purple-400" },
    { icon: Smartphone, label: "App 用户", value: data?.appUsers ?? 0, color: "text-blue-400" },
    { icon: CalendarDays, label: "今日新增", value: data?.todayNew ?? 0, color: "text-emerald-400" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((item, i) => (
        <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
          <SpotlightCard className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-2">
              <item.icon className={`h-4 w-4 ${item.color}`} />
              <p className="text-xs text-slate-500">{item.label}</p>
            </div>
            <CountUp target={item.value} className="text-3xl font-black text-white" duration={1.5} />
          </SpotlightCard>
        </motion.div>
      ))}
    </div>
  );
}

function HotTools() {
  const [tools, setTools] = useState<Array<{ name: string; count: number }>>([]);
  useEffect(() => {
    fetch("/api/ranking").then(r => r.json()).then(j => setTools(j.tools?.slice(0, 8) ?? [])).catch(() => {});
  }, []);

  if (tools.length === 0) return null;

  return (
    <SpotlightCard className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
        <Swords className="h-4 w-4 text-amber-400" /> 热门装备榜
      </h2>
      <div className="flex flex-wrap gap-3">
        {tools.map((tool, i) => (
          <motion.span key={tool.name} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.06 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm transition-all hover:border-cyan-500/30 hover:bg-cyan-500/5">
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${i < 3 ? "bg-amber-500/20 text-amber-300" : "bg-white/5 text-slate-500"}`}>{i + 1}</span>
            <span className="font-medium text-slate-200">{tool.name}</span>
            <span className="text-xs text-slate-500">{tool.count}</span>
          </motion.span>
        ))}
      </div>
    </SpotlightCard>
  );
}

import { useState, useEffect } from "react";
