"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowRight, Map, Trophy, Sparkles, ChevronRight, Shield, Users, Bot, Smartphone, CalendarDays } from "lucide-react";
import HeroSection from "@/components/home/HeroSection";
import ThreeStepSection from "@/components/home/ThreeStepSection";
import LatestCardStream from "@/components/latest-card-stream";
import LiquidGlassCard from "@/components/react-bits/LiquidGlassCard";
import CountUp from "@/components/react-bits/CountUp";
import { PageShell, Section, SectionHeader, RankingList, TagCloud } from "@/components/ui";
import { fetchRanking, type RankingData } from "@/lib/api-client";

const CyberBackground = dynamic(() => import("@/components/CyberBackground"), { ssr: false });
const ChinaSvgMap = dynamic(() => import("@/components/ChinaSvgMap"), { ssr: false });

export default function HomePage() {
  const [ranking, setRanking] = useState<RankingData | null>(null);

  useEffect(() => {
    let active = true;
    fetchRanking()
      .then((data) => {
        if (active) setRanking(data);
      })
      .catch(() => {
        if (active) setRanking(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const hasData = !!ranking;
  const overview = ranking?.overview ?? null;
  const topTools = (ranking?.tools ?? []).slice(0, 5);
  const topProvinceNames = (ranking?.provinces ?? []).slice(0, 3).map((p) => p.name);
  const topTool = ranking?.tools?.[0] ?? null;
  const allTools = ranking?.tools ?? [];
  const allProvinces = ranking?.provinces ?? [];
  const allLevels = ranking?.levels ?? [];

  return (
    <main id="main-content" className="relative min-h-screen">
      <CyberBackground />
      <HeroSection overview={overview} topProvinces={topProvinceNames} topTool={topTool} />
      <ThreeStepSection />

      <Section className="relative z-10" spacing="md">
        <PageShell>
          <SectionHeader
            eyebrow="Live Dashboard"
            title="全国 AI 信号总览"
            description="总玩家数、Agent 阵营占比、App 用户、今日新增。"
            align="center"
            accent="green"
          />
          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[
              { label: "全国 AI 玩家", value: overview?.total ?? 0, suffix: "+", icon: Users },
              { label: "Agent 用户", value: overview?.agentUsers ?? 0, icon: Bot },
              { label: "App 用户", value: overview?.appUsers ?? 0, icon: Smartphone },
              { label: "今日新增", value: overview?.todayNew ?? 0, icon: CalendarDays },
            ].map((stat, index) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <LiquidGlassCard className="p-5 text-center" mode="standard" blurAmount={0.06} aberrationIntensity={1.2} cornerRadius={20}>
                  <div className="mb-3 flex items-center justify-center gap-2"><stat.icon className="h-4 w-4 text-[#00ffc8]/55" /><p className="text-[10px] uppercase tracking-wider text-white/45">{stat.label}</p></div>
                  <div className="flex items-baseline justify-center gap-1">
                    <CountUp to={stat.value} className="title-font text-3xl font-black text-white" duration={2} />
                    {("suffix" in stat) && stat.suffix && hasData ? <span className="text-sm font-bold text-white/40">{stat.suffix}</span> : null}
                  </div>
                </LiquidGlassCard>
              </motion.div>
            ))}
          </div>
        </PageShell>
      </Section>

      <Section className="relative z-10" spacing="md">
        <PageShell>
          <SectionHeader
            eyebrow="Signal Map"
            title="全国 AI 信号正在点亮"
            description="左侧是分布图，右侧是当前最热门装备。"
            accent="cyan"
            trailing={
              <Link href="/map" className="hidden items-center gap-1 text-sm tracking-wider text-white/45 transition-colors hover:text-[#00ffc8] sm:flex">
                查看完整地图 <ChevronRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="mt-10">
            <LiquidGlassCard className="p-3" mode="prominent" blurAmount={0.06} aberrationIntensity={2} cornerRadius={28}>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_260px]">
                <div className="h-[420px] overflow-hidden rounded-2xl border border-white/[0.05] bg-black/40"><ChinaSvgMap data={ranking?.provinces} /></div>
                <div className="rounded-2xl border border-white/[0.05] p-5">
                  <div className="mb-4 text-[10px] uppercase tracking-[0.22em] text-white/45">热门装备榜</div>
                  <RankingList
                    items={topTools.slice(0, 5).map((t, i) => ({ name: t.name, count: t.count, accent: "#00ffc8", trend: i === 0 ? "up" as const : "flat" as const, delta: i === 0 ? "Top" : undefined }))}
                  />
                </div>
              </div>
            </LiquidGlassCard>
          </div>
        </PageShell>
      </Section>

      <Section className="relative z-10" spacing="md">
        <PageShell>
          <SectionHeader eyebrow="Top Equipment" title="热门装备榜" description="Top 10 AI 工具" accent="purple" />
          <div className="mt-10">
            <TagCloud items={allTools.slice(0, 10).map((t) => ({ name: t.name, count: t.count }))} />
          </div>
        </PageShell>
      </Section>

      <Section className="relative z-10" spacing="md">
        <PageShell>
          <LatestCardStream title="最新身份卡信号流" eyebrow="Latest Signals" ctaHref="/share" ctaLabel="查看分享页" />
        </PageShell>
      </Section>

      <Section className="relative z-10" spacing="md">
        <PageShell>
          <SectionHeader
            eyebrow="Ranking Preview"
            title="排行榜预览"
            description="从工具、城市、等级三个角度看 Agent 玩家生态。"
            align="center"
            accent="cyan"
          />
          <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <LiquidGlassCard className="p-4" mode="standard" blurAmount={0.05} aberrationIntensity={1.2} cornerRadius={24}>
              <div className="mb-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/45"><Trophy className="h-4 w-4 text-[#00ffc8]" /> 工具热度榜</div>
              <RankingList
                items={allTools.slice(0, 3).map((t, i) => ({ name: t.name, count: t.count, accent: "#00ffc8", trend: i === 0 ? "up" as const : "flat" as const }))}
              />
            </LiquidGlassCard>
            <LiquidGlassCard className="p-4" mode="standard" blurAmount={0.05} aberrationIntensity={1.2} cornerRadius={24}>
              <div className="mb-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/45"><Map className="h-4 w-4 text-[#00d4ff]" /> 城市活跃榜</div>
              <RankingList
                items={allProvinces.slice(0, 3).map((p, i) => ({ name: p.name, count: p.value, accent: "#00d4ff", trend: i === 0 ? "up" as const : "flat" as const }))}
              />
            </LiquidGlassCard>
            <LiquidGlassCard className="p-4" mode="standard" blurAmount={0.05} aberrationIntensity={1.2} cornerRadius={24}>
              <div className="mb-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/45"><Sparkles className="h-4 w-4 text-[#a855f7]" /> 身份类型榜</div>
              <div className="px-1">
                <p className="text-sm text-white/45">当前最强阵营</p>
                <p className="mt-2 title-font text-2xl font-black text-white">
                  {(() => {
                    const top = [...allLevels].sort((a, b) => b.count - a.count)[0];
                    return top ? `L${top.level}` : "--";
                  })()}
                </p>
                <p className="mt-2 text-sm leading-7 text-white/55">
                  {(() => {
                    const top = [...allLevels].sort((a, b) => b.count - a.count)[0];
                    return top ? `${top.count} 位玩家集中在这一身份带宽。` : "等待数据接入。";
                  })()}
                </p>
                <Link href="/ranking" className="mt-4 inline-flex items-center gap-1 text-sm text-[#00ffc8] hover:text-white">查看完整榜单 <ChevronRight className="h-4 w-4" /></Link>
              </div>
            </LiquidGlassCard>
          </div>
        </PageShell>
      </Section>

      <Section className="relative z-10" spacing="md">
        <PageShell>
          <SectionHeader
            eyebrow="Core Features"
            title="你的 AI 身份系统"
            description="三步流程，把你写入全国 AI 信号地图。"
            align="center"
            accent="purple"
          />
          <div className="mt-10 grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-3">
            {[
              { href: "/survey", icon: Shield, title: "生成身份卡", desc: "选择你的 AI 工具，生成专属 Agent Passport", color: "#00ffc8" },
              { href: "/map", icon: Map, title: "全国信号地图", desc: "查看全国 AI Agent 用户分布热力图", color: "#00d4ff" },
              { href: "/ranking", icon: Trophy, title: "装备排行榜", desc: "看看哪些 AI 工具最受欢迎", color: "#a855f7" },
            ].map((item, index) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <Link href={item.href} className="block group">
                  <LiquidGlassCard className="p-5 transition-all duration-500" mode="standard" blurAmount={0.06} aberrationIntensity={1.5} cornerRadius={24}>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border transition-all duration-500" style={{ borderColor: item.color + "20", background: item.color + "05" }}><item.icon className="h-6 w-6" style={{ color: item.color }} /></div>
                    <h3 className="title-font mb-2 text-lg font-bold tracking-wider text-white">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-white/45">{item.desc}</p>
                  </LiquidGlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </PageShell>
      </Section>

      <Section className="relative z-10" spacing="md">
        <PageShell width="narrow">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <LiquidGlassCard className="p-8 sm:p-10" mode="shader" blurAmount={0.1} aberrationIntensity={2.5} cornerRadius={32}>
              <h2 className="title-font mb-4 text-2xl font-black tracking-wider text-white sm:text-3xl">准备好扫描你的 AI 身份了吗？</h2>
              <p className="mb-8 text-sm tracking-wide text-white/45">只需 30 秒，生成你的 Agent 身份卡</p>
              <Link href="/survey" className="btn-lusion"><Sparkles className="h-5 w-5" /><span>开始扫描</span><ArrowRight className="h-4 w-4" /></Link>
              <p className="mt-6 text-[10px] font-mono uppercase tracking-[0.2em] text-white/25">No Login · 30 Seconds · Shareable</p>
            </LiquidGlassCard>
          </motion.div>
        </PageShell>
      </Section>
    </main>
  );
}
