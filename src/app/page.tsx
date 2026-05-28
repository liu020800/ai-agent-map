"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion-wrapper";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Map, Users, Zap, TrendingUp, Swords, Shield } from "lucide-react";

const HomeStats = dynamic(() => import("@/components/home-stats"), { ssr: false });
const HomeMapPreview = dynamic(() => import("@/components/home-map-preview"), { ssr: false });

export default function HomePage() {
  return (
    <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center gap-16 px-6 py-16">
      {/* Hero - Game Login Style */}
      <section className="flex flex-col items-center gap-8 pt-8 text-center">
        <FadeIn>
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 px-5 py-2 text-xs font-medium tracking-[0.2em] text-cyan-300">
            <Zap className="h-3 w-3" /> AI AGENT IDENTITY SYSTEM
          </motion.div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h1 className="text-4xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
            你是 AI 聊天用户，
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">还是 Agent 玩家？</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.15}>
          <p className="max-w-xl text-base text-slate-400 sm:text-lg">
            生成你的 AI 身份卡，加入全国 AI Agent 用户地图。
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/survey" className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40">
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-white/10 to-cyan-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Shield className="h-4 w-4" /> 启动身份扫描 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="/ranking" className="rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-slate-200 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
              <BarChart3 className="mr-1.5 inline h-4 w-4" />排行榜
            </Link>
            <Link href="/map" className="rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-slate-200 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
              <Map className="mr-1.5 inline h-4 w-4" />全国地图
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* Stats */}
      <FadeIn delay={0.3} className="w-full flex justify-center">
        <HomeStats />
      </FadeIn>

      {/* Map preview */}
      <FadeIn delay={0.4} className="w-full max-w-5xl">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white"><Map className="h-4 w-4 text-cyan-400" />全国 AI 用户分布</h2>
            <Link href="/map" className="text-xs text-cyan-400 hover:text-cyan-300">查看完整地图 →</Link>
          </div>
          <HomeMapPreview />
        </div>
      </FadeIn>

      {/* Feature cards */}
      <StaggerContainer className="grid w-full max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Shield, title: "身份扫描", desc: "生成你的 AI 身份卡", href: "/survey", gradient: "from-cyan-500/10 to-indigo-500/10" },
          { icon: Swords, title: "装备榜", desc: "最热门 AI 工具排名", href: "/ranking", gradient: "from-purple-500/10 to-pink-500/10" },
          { icon: Map, title: "全国据点", desc: "各地区 Agent 分布", href: "/map", gradient: "from-blue-500/10 to-cyan-500/10" },
          { icon: TrendingUp, title: "趋势战场", desc: "AI 工具热度趋势", href: "/trends", gradient: "from-amber-500/10 to-orange-500/10" },
        ].map((item) => (
          <StaggerItem key={item.title}>
            <Link href={item.href} className={`group flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-gradient-to-br ${item.gradient} p-6 backdrop-blur-xl transition-all hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-indigo-400 transition-colors group-hover:bg-white/[0.1]">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white">{item.title}</h3>
              <p className="text-xs text-slate-400">{item.desc}</p>
            </Link>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </main>
  );
}
