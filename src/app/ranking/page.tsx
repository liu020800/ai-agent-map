"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Crown, Flame, MapPin, Radio, RefreshCw, Shield, Sparkles, Swords, Trophy, TrendingUp } from "lucide-react";
import { levelName } from "@/lib/level";
import BlurText from "@/components/react-bits/BlurText";
import CountUp from "@/components/react-bits/CountUp";
import LiquidGlassCard from "@/components/react-bits/LiquidGlassCard";
import { PageShell, Section, PageSkeletonList, EmptyState, CyberCard, RankingList } from "@/components/ui";
import { fetchRanking, type RankingData } from "@/lib/api-client";

const ParticlesBG = dynamic(() => import("@/components/react-bits/ParticlesBG"), { ssr: false });

export default function RankingPage() {
  const [data, setData] = useState<RankingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [tab, setTab] = useState<"tools" | "provinces" | "levels">("tools");

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
    fetchRanking()
      .then((json) => {
        if (active) setData(json);
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "加载失败");
          setData(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const overview = data?.overview ?? { total: 0, agentUsers: 0, appUsers: 0, todayNew: 0 };
  const topTools = data?.tools ?? [];
  const topProvinces = data?.provinces ?? [];
  const topLevels = useMemo(() => data?.levels ?? [], [data]);
  const podium = topTools.slice(0, 3);
  const hottestProvince = topProvinces[0];
  const highestLevel = [...topLevels].sort((a, b) => b.count - a.count)[0];
  const levelMax = useMemo(() => Math.max(1, ...topLevels.map((item) => item.count)), [topLevels]);

  if (loading && !data) {
    return (
      <main id="main-content" className="relative min-h-[80vh] py-12">
        <PageShell width="wide">
          <div className="mb-10">
            <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-cyan-300/15 bg-cyan-300/[0.05] px-4 py-2">
              <Trophy className="h-3.5 w-3.5 text-cyan-300/80" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-300/80">National Leaderboard</span>
            </div>
            <h1 className="title-font text-4xl font-black text-white sm:text-5xl lg:text-6xl">全国 AI 排行榜</h1>
            <p className="mt-4 max-w-[780px] text-sm leading-7 text-white/52 sm:text-base">谁在领跑 Agent 装备生态，哪里的玩家最密集。</p>
          </div>
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <PageSkeletonList rows={6} />
            <PageSkeletonList rows={8} />
          </div>
        </PageShell>
      </main>
    );
  }

  const tabItems = {
    tools: topTools.map((item, index) => ({
      rank: index + 1,
      title: item.name,
      value: item.count,
      desc: "代码 Agent 阵营最常用装备",
      trend: "up" as const,
      delta: `今日 +${Math.max(6, 18 - index)}%`,
    })),
    provinces: topProvinces.map((item, index) => ({
      rank: index + 1,
      title: item.name,
      value: item.value,
      desc: "地区信号正在持续升温",
      trend: "up" as const,
      delta: `热度 +${Math.max(3, 12 - index)}%`,
    })),
    levels: topLevels
      .slice()
      .sort((a, b) => b.count - a.count)
      .map((item, index) => ({
        rank: index + 1,
        title: levelName(item.level),
        value: item.count,
        desc: `L${item.level} 等级玩家最集中`,
        trend: "up" as const,
        delta: `带宽 +${Math.max(2, 9 - index)}%`,
      })),
  } as const;

  const tabAccent = tab === "tools" ? "#a855f7" : tab === "provinces" ? "#fbbf24" : "#22d3ee";

  return (
    <main className="relative overflow-hidden pb-20 pt-10">
      <ParticlesBG className="opacity-12" count={18} />

      <Section className="relative z-10">
        <PageShell width="wide">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-cyan-300/15 bg-cyan-300/[0.05] px-4 py-2 backdrop-blur-md">
              <Trophy className="h-3.5 w-3.5 text-cyan-300/80" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-300/80">National Leaderboard</span>
            </div>
            <BlurText text="全国 AI 排行榜" className="title-font text-4xl font-black text-white sm:text-5xl lg:text-6xl" delay={70} direction="bottom" />
            <p className="mt-4 max-w-[780px] text-sm leading-7 text-white/52 sm:text-base">谁在领跑 Agent 装备生态，哪里的玩家最密集，哪个等级带宽最强。</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="mb-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <LiquidGlassCard className="overflow-hidden p-0" mode="shader" blurAmount={0.08} aberrationIntensity={1.8} cornerRadius={30}>
              <div className="relative p-6 sm:p-7">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(34,211,238,0.16),transparent_26%),radial-gradient(circle_at_90%_0%,rgba(168,85,247,0.18),transparent_28%)]" />
                <div className="relative">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="title-font text-[10px] uppercase tracking-[0.3em] text-cyan-300/65">Podium Signal</p>
                      <h2 className="title-font mt-2 text-2xl font-black text-white sm:text-3xl">本周最强装备阵列</h2>
                    </div>
                    <div className="rounded-full border border-white/[0.05] bg-white/[0.02] px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-white/45">Live Updated</div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    {podium.length > 0 ? podium.map((item, index) => {
                      const styles = [
                        "from-amber-300/20 to-orange-500/5 border-amber-300/20 text-amber-300",
                        "from-slate-200/15 to-slate-400/5 border-slate-200/15 text-slate-200",
                        "from-orange-300/15 to-rose-400/5 border-orange-300/15 text-orange-300",
                      ];
                      return (
                        <div key={item.name} className={`rounded-[24px] border bg-gradient-to-b ${styles[index] ?? "from-white/5 to-transparent border-white/[0.05] text-white"} p-5`}>
                          <div className="mb-4 flex items-center justify-between">
                            <span className="title-font text-2xl font-black">#{index + 1}</span>
                            <Crown className="h-4 w-4" />
                          </div>
                          <p className="mb-2 text-lg font-bold text-white">{item.name}</p>
                          <div className="flex items-end gap-1">
                            <CountUp to={item.count} className="title-font text-3xl font-black text-white" duration={1.4} />
                            <span className="pb-1 text-xs text-white/40">人装备</span>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="md:col-span-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-6 text-sm text-white/50">暂无排行榜数据</div>
                    )}
                  </div>
                </div>
              </div>
            </LiquidGlassCard>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {[
                { label: "热点据点", value: hottestProvince?.name ?? "暂无", sub: hottestProvince ? `${hottestProvince.value} 个信号` : "尚无数据", icon: MapPin, color: "#22d3ee" },
                { label: "活跃等级", value: highestLevel ? `L${highestLevel.level}` : "暂无", sub: highestLevel ? `${highestLevel.count} 位玩家` : "尚无数据", icon: Shield, color: "#a855f7" },
                { label: "新增速度", value: `${overview.todayNew}${overview.todayNew > 0 ? "+" : ""}`, sub: "今日新增记录", icon: Radio, color: "#fbbf24" },
              ].map((item) => (
                <LiquidGlassCard key={item.label} className="p-5" mode="prominent" blurAmount={0.05} aberrationIntensity={1.3} cornerRadius={24}>
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.05] bg-white/[0.015]" style={{ boxShadow: `0 0 24px ${item.color}20` }}>
                    <item.icon className="h-4 w-4" style={{ color: item.color }} />
                  </div>
                  <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-white/40">{item.label}</p>
                  <p className="title-font text-3xl font-black text-white">{item.value}</p>
                  <p className="mt-1 text-sm text-white/50">{item.sub}</p>
                </LiquidGlassCard>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "总玩家数", value: overview.total, suffix: overview.total > 0 ? "+" : "" },
              { label: "Agent 玩家", value: overview.agentUsers },
              { label: "App 用户", value: overview.appUsers },
              { label: "今日新增", value: overview.todayNew },
            ].map((item) => (
                <LiquidGlassCard key={item.label} className="p-5" mode="standard" blurAmount={0.05} aberrationIntensity={1.1} cornerRadius={20}>
                <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-white/40">{item.label}</p>
                <div className="flex items-baseline gap-1">
                  <CountUp to={item.value} className="title-font text-3xl font-black text-white" duration={1.5} />
                  {"suffix" in item && item.suffix ? <span className="text-sm font-bold text-cyan-300/75">{item.suffix}</span> : null}
                </div>
              </LiquidGlassCard>
            ))}
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

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <LiquidGlassCard className="p-5" mode="standard" blurAmount={0.06} aberrationIntensity={1.3} cornerRadius={26}>
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-300/75" />
                <h3 className="title-font text-lg font-bold text-white">带宽分布</h3>
              </div>
              <div className="space-y-3">
                {topLevels
                  .slice()
                  .sort((a, b) => b.count - a.count)
                  .map((item) => (
                    <div key={item.level}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-white/75">{levelName(item.level)}</span>
                        <span className="title-font text-white">{item.count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/[0.06]">
                        <div className="h-2 rounded-full bg-[linear-gradient(90deg,#22d3ee,#8b5cf6)]" style={{ width: `${(item.count / levelMax) * 100}%` }} />
                      </div>
                    </div>
                  ))}
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard className="p-5" mode="shader" blurAmount={0.06} aberrationIntensity={1.5} cornerRadius={26}>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="title-font text-[10px] uppercase tracking-[0.28em] text-cyan-300/68">Leaderboard Panels</p>
                  <h3 className="title-font mt-2 text-2xl font-black text-white">排行榜分区</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "tools", label: "工具热度榜", icon: Swords },
                    { key: "provinces", label: "城市活跃榜", icon: Flame },
                    { key: "levels", label: "身份类型榜", icon: Sparkles },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setTab(item.key as typeof tab)}
                      className={
                        (tab === item.key
                          ? "border-cyan-300/28 bg-cyan-300/[0.08] text-cyan-300"
                          : "border-white/[0.05] bg-white/[0.02] text-white/60 hover:text-white") +
                        " inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-all"
                      }
                    >
                      <item.icon className="h-3.5 w-3.5" /> {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {tabItems[tab].length > 0 ? (
                <RankingList
                  items={tabItems[tab].slice(0, 8).map((it) => ({
                    name: it.title,
                    count: it.value,
                    accent: tabAccent,
                    trend: it.trend,
                    delta: it.delta,
                  }))}
                  unit={tab === "provinces" ? "信号" : "人"}
                />
              ) : (
                <EmptyState
                  icon={Trophy}
                  title="这里还没有可展示的榜单信号"
                  description="先去生成你的 AI Agent Passport，成为第一个写入这个榜单的人。"
                  cta={{ label: "立即生成身份卡", href: "/survey" }}
                />
              )}
            </LiquidGlassCard>
          </motion.div>
        </PageShell>
      </Section>
    </main>
  );
}
