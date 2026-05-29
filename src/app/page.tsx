"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Swords, Map, TrendingUp, Zap, Users, Bot, Smartphone, CalendarDays, ChevronRight } from "lucide-react";
import BlurText from "@/components/react-bits/BlurText";
import DecryptedText from "@/components/react-bits/DecryptedText";
import GradientText from "@/components/react-bits/GradientText";
import CountUp from "@/components/react-bits/CountUp";
import SpotlightCard from "@/components/react-bits/SpotlightCard";
import StarBorder from "@/components/react-bits/StarBorder";

const ParticlesBG = dynamic(() => import("@/components/react-bits/ParticlesBG"), { ssr: false });
const HomeMapPreview = dynamic(() => import("@/components/home-map-preview"), { ssr: false });

export default function HomePage() {
  return (
    <main className="relative min-h-screen">
      <ParticlesBG className="opacity-40" count={60} colors={["#6366f1", "#8b5cf6", "#06b6d4"]} />

      {/* Hero */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-6">
        <div className="relative z-10 flex flex-col items-center gap-8 text-center max-w-[900px]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-white/5 px-5 py-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
              </span>
              <DecryptedText text="AI AGENT IDENTITY SYSTEM" speed={30} className="text-[11px] font-semibold tracking-[0.25em] text-neutral-300" encryptedClassName="text-neutral-600" animateOn="view" />
            </div>
          </motion.div>

          <BlurText
            text="你是 AI 聊天用户，还是 Agent 玩家？"
            className="text-[clamp(2.5rem,7vw,5rem)] font-black leading-[1.1] tracking-tight text-white"
            delay={150}
            direction="bottom"
          />

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            className="max-w-[520px] text-lg leading-relaxed text-neutral-400">
            生成你的 AI 身份卡，点亮全国 AI Agent 用户地图。
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
            className="flex flex-col gap-4 sm:flex-row">
            <Link href="/survey" className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-black hover:bg-neutral-200 transition-colors">
              <Shield className="h-5 w-5" /> 启动身份扫描 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/map" className="inline-flex items-center gap-2 rounded-full border border-neutral-700 px-8 py-4 text-base font-medium text-neutral-300 hover:bg-white/5 transition-colors">
              <Map className="h-5 w-5" /> 查看全国图谱
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-[1200px]">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
            <GradientText colors={["#6366f1", "#06b6d4", "#8b5cf6"]} animationSpeed={6} className="text-sm font-semibold tracking-[0.2em] mb-3">
              LIVE DASHBOARD
            </GradientText>
            <h2 className="text-3xl font-black text-white sm:text-4xl">全国 AI 信号总览</h2>
          </motion.div>
          <StatsSection />
        </div>
      </section>

      {/* Map Preview */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-[1200px]">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase mb-2">Signal Map</p>
              <h2 className="text-2xl font-black text-white sm:text-3xl">全国 AI 信号正在点亮</h2>
            </div>
            <Link href="/map" className="hidden items-center gap-1 text-sm text-neutral-400 hover:text-white transition-colors sm:flex">
              查看完整地图 <ChevronRight className="h-4 w-4" />
            </Link>
          </motion.div>
          <SpotlightCard className="p-2" spotlightColor="rgba(99, 102, 241, 0.1)">
            <div className="overflow-hidden rounded-2xl border border-neutral-800">
              <HomeMapPreview />
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* Hot Tools */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-[1200px]">
          <HotTools />
        </div>
      </section>

      {/* Feature Grid */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Shield, title: "身份扫描", desc: "生成你的 AI Agent 身份卡", href: "/survey" },
              { icon: Swords, title: "装备热度", desc: "最热门 AI 工具实时排名", href: "/ranking" },
              { icon: Map, title: "信号雷达", desc: "全国 Agent 用户分布图", href: "/map" },
              { icon: TrendingUp, title: "趋势战场", desc: "AI 工具热度变化趋势", href: "/trends" },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link href={item.href}>
                  <SpotlightCard className="group flex flex-col gap-4 p-6 h-full" spotlightColor="rgba(99, 102, 241, 0.08)">
                    <item.icon className="h-6 w-6 text-neutral-400 group-hover:text-white transition-colors" />
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                      <p className="text-sm text-neutral-500">{item.desc}</p>
                    </div>
                  </SpotlightCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-[600px] text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-black text-white mb-4">准备好扫描你的 AI 身份了吗？</h2>
            <p className="text-neutral-500 mb-8">只需 30 秒，生成你的 Agent 身份卡</p>
            <StarBorder as={Link} href="/survey" color="#6366f1" speed="4s">
              <span className="flex items-center gap-2 text-sm font-bold">
                <SparklesIcon /> 开始扫描
              </span>
            </StarBorder>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

function SparklesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}

function StatsSection() {
  const [data, setData] = useState<{ total: number; agentUsers: number; appUsers: number; todayNew: number } | null>(null);
  useEffect(() => { fetch("/api/ranking").then(r => r.json()).then(j => setData(j.overview)).catch(() => {}); }, []);

  const stats = [
    { icon: Users, label: "全国 AI 玩家", value: data?.total ?? 0 },
    { icon: Bot, label: "Agent 玩家", value: data?.agentUsers ?? 0 },
    { icon: Smartphone, label: "App 用户", value: data?.appUsers ?? 0 },
    { icon: CalendarDays, label: "今日新增", value: data?.todayNew ?? 0 },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((item, i) => (
        <motion.div key={item.label} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
          <SpotlightCard className="p-6" spotlightColor="rgba(99, 102, 241, 0.08)">
            <div className="flex items-center gap-2 mb-3">
              <item.icon className="h-4 w-4 text-neutral-500" />
              <p className="text-xs text-neutral-500">{item.label}</p>
            </div>
            <CountUp to={item.value} className="text-3xl font-black text-white sm:text-4xl" duration={2} />
          </SpotlightCard>
        </motion.div>
      ))}
    </div>
  );
}

function HotTools() {
  const [tools, setTools] = useState<Array<{ name: string; count: number }>>([]);
  useEffect(() => { fetch("/api/ranking").then(r => r.json()).then(j => setTools(j.tools?.slice(0, 10) ?? [])).catch(() => {}); }, []);
  if (tools.length === 0) return null;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
        <p className="text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase mb-2">Top Equipment</p>
        <h2 className="text-2xl font-black text-white sm:text-3xl">热门装备榜</h2>
      </motion.div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {tools.map((tool, i) => (
          <motion.div key={tool.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
            <SpotlightCard className="p-4" spotlightColor={i < 3 ? "rgba(251, 191, 36, 0.08)" : "rgba(99, 102, 241, 0.05)"}>
              <div className="flex items-center justify-between mb-3">
                <span className={`flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold ${i < 3 ? "bg-amber-500/10 text-amber-400" : "bg-white/5 text-neutral-500"}`}>{i + 1}</span>
                {i < 3 && <Zap className="h-3.5 w-3.5 text-amber-400" />}
              </div>
              <p className="text-sm font-bold text-white mb-1 truncate">{tool.name}</p>
              <p className="text-xs text-neutral-500"><span className="text-lg font-black text-white">{tool.count}</span> 人使用</p>
            </SpotlightCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
