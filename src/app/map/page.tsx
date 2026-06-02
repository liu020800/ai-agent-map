"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Crosshair,
  Filter,
  Flame,
  MapPin,
  Radio,
  RefreshCw,
  Sparkles,
  Swords,
} from "lucide-react";
import BlurText from "@/components/react-bits/BlurText";
import CountUp from "@/components/react-bits/CountUp";
import LiquidGlassCard from "@/components/react-bits/LiquidGlassCard";
import { PageShell, Section, SectionHeader, RankingList, TagCloud, PageSkeletonMap, EmptyState, CyberCard } from "@/components/ui";
import { fetchRanking, type RankingData } from "@/lib/api-client";

const ChinaMapChart = dynamic(() => import("@/components/china-map-chart"), { ssr: false });
const ParticlesBG = dynamic(() => import("@/components/react-bits/ParticlesBG"), { ssr: false });

export default function MapPage() {
  const [data, setData] = useState<RankingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userFilter, setUserFilter] = useState<"all" | "agent" | "app">("all");
  const [selectedTool, setSelectedTool] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
    fetchRanking({ userType: userFilter, tool: selectedTool })
      .then((json) => {
        if (!active) return;
        setData(json);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "加载失败");
        setData(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userFilter, selectedTool, reloadKey]);

  const sortedProvinces = useMemo(
    () => [...(data?.provinces ?? [])].sort((a, b) => b.value - a.value),
    [data],
  );
  const topTools = useMemo(() => (data?.tools ?? []).slice(0, 8), [data]);
  const topLevels = useMemo(
    () => (data?.levels ?? []).slice().sort((a, b) => a.level - b.level),
    [data],
  );
  const overview = data?.overview ?? { total: 0, agentUsers: 0, appUsers: 0, todayNew: 0 };
  const hottestProvince = sortedProvinces[0];
  const dominantTool = topTools[0];

  if (loading && !data) {
    return (
      <main id="main-content" className="relative min-h-[82vh] py-12">
        <PageShell width="wide">
          <SectionHeader
            eyebrow="National Agent Radar"
            title="全国 AI 信号雷达"
            description="这里不是普通地图，而是全国 Agent 玩家信号面板。"
            accent="cyan"
          />
          <div className="mt-10">
            <PageSkeletonMap />
          </div>
        </PageShell>
      </main>
    );
  }

  return (
    <main className="relative overflow-hidden pb-20 pt-10">
      <ParticlesBG className="opacity-14" count={16} />

      <Section className="relative z-10">
        <PageShell width="wide">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-cyan-300/15 bg-cyan-300/[0.05] px-4 py-2 backdrop-blur-md">
              <Crosshair className="h-3.5 w-3.5 text-cyan-300/80" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-300/80">National Agent Radar</span>
            </div>
            <BlurText text="全国 AI 信号雷达" className="title-font text-4xl font-black text-white sm:text-5xl lg:text-6xl" delay={70} direction="bottom" />
            <p className="mt-4 max-w-[780px] text-sm leading-7 text-white/52 sm:text-base">看哪里最活跃、什么装备最热门、哪些地区正在等待被你点亮。</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="mb-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <LiquidGlassCard className="overflow-hidden p-0" mode="shader" blurAmount={0.08} aberrationIntensity={1.8} cornerRadius={30}>
              <div className="relative p-6 sm:p-7">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(34,211,238,0.18),transparent_26%),radial-gradient(circle_at_88%_0%,rgba(168,85,247,0.16),transparent_28%)]" />
                <div className="relative grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
                  <div>
                    <p className="title-font text-[10px] uppercase tracking-[0.3em] text-cyan-300/70">Signal Overview</p>
                    <h2 className="title-font mt-2 text-2xl font-black text-white sm:text-3xl">全国 AI 信号正在点亮</h2>
                    <p className="mt-3 text-sm leading-7 text-white/48">用地图、排行榜和等级分布快速理解全国 Agent 玩家生态。</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {["实时地图", "省份榜", "装备榜", "等级带宽"].map((item) => (
                        <span key={item} className="rounded-full border border-white/[0.05] bg-white/[0.02] px-3 py-1.5 text-[11px] text-white/68">{item}</span>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
                    {[
                      { label: "最热地区", value: hottestProvince?.name ?? "暂无", sub: hottestProvince ? `${hottestProvince.value} 个信号` : "尚无数据", icon: Flame, color: "#fbbf24" },
                      { label: "主导装备", value: dominantTool?.name ?? "暂无", sub: dominantTool ? `${dominantTool.count} 次装配` : "尚无数据", icon: Swords, color: "#a855f7" },
                      { label: "今日新增", value: `${overview.todayNew}${overview.todayNew > 0 ? "+" : ""}`, sub: "新增点亮记录", icon: Radio, color: "#22d3ee" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-[22px] border border-white/[0.05] bg-white/[0.02] p-4">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.05] bg-white/[0.015]" style={{ boxShadow: `0 0 24px ${item.color}20` }}>
                          <item.icon className="h-4 w-4" style={{ color: item.color }} />
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">{item.label}</p>
                        <p className="mt-2 title-font text-2xl font-black text-white">{item.value}</p>
                        <p className="mt-1 text-sm text-white/50">{item.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </LiquidGlassCard>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "全国信号总数", value: overview.total, suffix: "+" },
                { label: "Agent 玩家", value: overview.agentUsers, suffix: "" },
                { label: "App 用户", value: overview.appUsers, suffix: "" },
                { label: "今日新增", value: overview.todayNew, suffix: "" },
              ].map((item) => (
                <LiquidGlassCard key={item.label} className="p-5" mode="standard" blurAmount={0.05} aberrationIntensity={1.2} cornerRadius={22}>
                  <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-white/40">{item.label}</p>
                  <div className="flex items-baseline gap-1">
                    <CountUp to={item.value} className="title-font text-3xl font-black text-white" duration={1.8} />
                    {item.suffix ? <span className="text-sm font-bold text-cyan-300/75">{item.suffix}</span> : null}
                  </div>
                </LiquidGlassCard>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mb-6 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-white/50">
              <Filter className="h-3.5 w-3.5" /> 信号筛选
            </div>
            {(["all", "agent", "app"] as const).map((value) => (
              <button
                key={value}
                onClick={() => setUserFilter(value)}
                className={
                  (userFilter === value
                    ? "border-cyan-300/30 bg-cyan-300/[0.08] text-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.08)]"
                    : "border-white/[0.05] bg-white/[0.02] text-white/60 hover:border-white/[0.10] hover:text-white") +
                  " rounded-full border px-4 py-2 text-xs font-semibold transition-all"
                }
              >
                {value === "all" ? "全部" : value === "agent" ? "Agent" : "App"}
              </button>
            ))}
            <select
              value={selectedTool}
              onChange={(event) => setSelectedTool(event.target.value)}
              className="min-w-[180px] rounded-full border border-white/[0.05] bg-black/40 px-4 py-2.5 text-sm text-white/75 outline-none transition-colors focus:border-cyan-300/30"
            >
              <option value="">所有装备</option>
              {topTools.map((tool) => (
                <option key={tool.name} value={tool.name}>
                  {tool.name} ({tool.count})
                </option>
              ))}
            </select>
            <Link href="/survey" className="btn-lusion-outline !px-4 !py-2.5 !text-[11px]">
              点亮你的地区 <ChevronRight className="h-4 w-4" />
            </Link>
          </motion.div>

          {error ? (
            <CyberCard variant="subtle" className="mb-6 flex items-center gap-3 p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-400/20 bg-rose-500/10 text-rose-300">
                <Radio className="h-4 w-4" />
              </span>
              <div className="flex-1 text-sm text-rose-200/85">{error} · 请检查 Supabase 连接</div>
              <button
                type="button"
                onClick={() => setReloadKey((k) => k + 1)}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.05] bg-white/[0.02] px-3 py-1.5 text-xs text-white/70 hover:text-white"
              >
                <RefreshCw className="h-3 w-3" /> 重试
              </button>
            </CyberCard>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
              <LiquidGlassCard className="p-3" mode="prominent" blurAmount={0.08} aberrationIntensity={1.9} cornerRadius={30}>
                <div className="mb-4 flex items-center justify-between gap-3 px-3 pt-3">
                  <div>
                    <p className="title-font text-xs uppercase tracking-[0.28em] text-cyan-300/70">Live Signal Sweep</p>
                    <h2 className="title-font mt-2 text-xl font-black text-white sm:text-2xl">全国 AI 信号热力分布</h2>
                  </div>
                  <div className="rounded-full border border-white/[0.05] bg-white/[0.02] px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-white/45">Radar View</div>
                </div>
                <div className="overflow-hidden rounded-[24px] border border-white/[0.05] bg-black/30">
                  <ChinaMapChart data={data?.provinces ?? []} filter={userFilter} />
                </div>
              </LiquidGlassCard>
            </motion.div>

            <div className="grid gap-6">
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
                <LiquidGlassCard className="p-5" mode="standard" blurAmount={0.05} aberrationIntensity={1.3} cornerRadius={24}>
                  <div className="mb-4 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-cyan-300/75" />
                    <h3 className="title-font text-lg font-bold text-white">省份排行榜</h3>
                  </div>
                  {sortedProvinces.length > 0 ? (
                    <RankingList
                      items={sortedProvinces.slice(0, 8).map((p) => ({ name: p.name, count: p.value, accent: "#22d3ee", trend: "up" as const, delta: `+${Math.max(3, 14 - sortedProvinces.indexOf(p))}%` }))}
                      unit="信号"
                    />
                  ) : (
                    <EmptyState
                      icon={MapPin}
                      title="这里还没有 Agent 信号"
                      description="成为第一个点亮你所在地区的人。"
                      cta={{ label: "立即生成身份卡", href: "/survey" }}
                    />
                  )}
                </LiquidGlassCard>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
                <LiquidGlassCard className="p-5" mode="standard" blurAmount={0.05} aberrationIntensity={1.3} cornerRadius={24}>
                  <div className="mb-4 flex items-center gap-2">
                    <Swords className="h-4 w-4 text-violet-300" />
                    <h3 className="title-font text-lg font-bold text-white">热门装备榜</h3>
                  </div>
                  <TagCloud items={topTools.slice(0, 10).map((t) => ({ name: t.name, count: t.count }))} />
                </LiquidGlassCard>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
                <LiquidGlassCard className="p-5" mode="shader" blurAmount={0.06} aberrationIntensity={1.6} cornerRadius={24}>
                  <div className="mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    <h3 className="title-font text-lg font-bold text-white">等级分布</h3>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {topLevels.map((item) => (
                      <div key={item.level} className="rounded-2xl border border-white/[0.05] bg-black/20 p-3 text-center">
                        <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/40">L{item.level}</p>
                        <CountUp to={item.count} className="title-font text-xl font-black text-white" duration={1.2} />
                      </div>
                    ))}
                  </div>
                </LiquidGlassCard>
              </motion.div>
            </div>
          </div>
        </PageShell>
      </Section>
    </main>
  );
}
