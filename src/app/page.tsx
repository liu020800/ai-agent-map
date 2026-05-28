"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion-wrapper";
import { ArrowRight, BarChart3, Map, Users, Zap, TrendingUp } from "lucide-react";

const HomeStats = dynamic(() => import("@/components/home-stats"), { ssr: false });

export default function HomePage() {
  return (
    <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center gap-16 px-6 py-16">
      <section className="flex flex-col items-center gap-8 pt-12 text-center">
        <FadeIn>
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium tracking-wide text-indigo-300 backdrop-blur-sm">
            <Zap className="h-3 w-3" /> MVP · AI Agent 用户调查网站
          </span>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h1 className="text-4xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl">
            谁在真正使用
            <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent"> AI Agent</span>？
          </h1>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="max-w-2xl text-base text-slate-400 sm:text-lg">
            这不是普通问卷，而是一个「AI 用户身份社区 + AI Agent 趋势地图」。填写你的使用情况，看看你在全中国的 AI 等级。
          </p>
        </FadeIn>
        <FadeIn delay={0.3}>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/survey" className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:opacity-90">
              立即参与调查 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="/ranking" className="rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">排行榜</Link>
            <Link href="/map" className="rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">AI 地图</Link>
            <Link href="/trends" className="rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">趋势榜</Link>
            <Link href="/share" className="rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">分享卡片</Link>
          </div>
        </FadeIn>
      </section>
      <FadeIn delay={0.4} className="w-full flex justify-center">
        <HomeStats />
      </FadeIn>
      <StaggerContainer className="grid w-full max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Users, title: "用户调查", desc: "填写你的 AI 使用情况", href: "/survey" },
          { icon: BarChart3, title: "排行榜", desc: "查看最热门 AI 工具", href: "/ranking" },
          { icon: Map, title: "全国地图", desc: "各地区 AI 用户分布", href: "/map" },
          { icon: TrendingUp, title: "趋势榜", desc: "AI 工具热度排名", href: "/trends" },
        ].map((item) => (
          <StaggerItem key={item.title}>
            <Link href={item.href} className="group flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl transition-all hover:border-indigo-500/30 hover:bg-white/[0.06]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 transition-colors group-hover:bg-indigo-500/20">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">{item.title}</h3>
              <p className="text-xs text-slate-400">{item.desc}</p>
            </Link>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </main>
  );
}
