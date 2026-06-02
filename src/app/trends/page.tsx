"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { BarChart3, Sparkles, TrendingUp, Zap, Radio, Swords, Activity, RefreshCw } from "lucide-react";
import BlurText from "@/components/react-bits/BlurText";
import CountUp from "@/components/react-bits/CountUp";
import LiquidGlassCard from "@/components/react-bits/LiquidGlassCard";
import { PageShell, Section, PageSkeletonChart, EmptyState, CyberCard, RankingList } from "@/components/ui";
import { fetchRanking, type RankingData } from "@/lib/api-client";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });
const ParticlesBG = dynamic(() => import("@/components/react-bits/ParticlesBG"), { ssr: false });

export default function TrendsPage() {
  const [data, setData] = useState<RankingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

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

  const sortedTools = useMemo(
    () => [...(data?.tools ?? [])].sort((a, b) => b.count - a.count),
    [data],
  );
  const chartOption = useMemo(() => {
    if (!data || data.tools.length === 0) return null;
    return {
      tooltip: {
        trigger: "axis" as const,
        backgroundColor: "#0a0d14",
        borderColor: "rgba(255,255,255,0.08)",
        textStyle: { color: "#e5e7eb", fontSize: 12 },
      },
      grid: { left: "3%", right: "4%", bottom: "3%", top: "5%", containLabel: true },
      xAxis: {
        type: "value" as const,
        axisLabel: { color: "rgba(255,255,255,0.45)" },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.05)" } },
      },
      yAxis: {
        type: "category" as const,
        data: sortedTools.map((item) => item.name).reverse(),
        axisLabel: { color: "#e5e7eb", fontSize: 12 },
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.05)" } },
      },
      series: [
        {
          type: "bar",
          data: sortedTools.map((item) => item.count).reverse(),
          itemStyle: {
            borderRadius: [0, 10, 10, 0],
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: "#00ffc8" },
                { offset: 0.55, color: "#00d4ff" },
                { offset: 1, color: "#a855f7" },
              ],
            },
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 18,
              shadowColor: "rgba(0,255,200,0.2)",
            },
          },
          barWidth: "60%",
        },
      ],
    };
  }, [data, sortedTools]);

  if (loading && !data) {
    return (
      <main id="main-content" className="relative min-h-[80vh] py-12">
        <PageShell width="wide">
          <div className="mb-10">
            <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-[#00ffc8]/15 bg-[#00ffc8]/[0.05] px-4 py-2">
              <TrendingUp className="h-3.5 w-3.5 text-[#00ffc8]/80" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#00ffc8]/80">Trend Battlefield</span>
            </div>
            <h1 className="title-font text-4xl font-black text-white sm:text-5xl lg:text-6xl">AI 装备趋势战场</h1>
            <p className="mt-4 max-w-[760px] text-sm leading-7 text-white/55 sm:text-base">谁在领跑、谁在追赶、谁正在冒头。</p>
          </div>
          <PageSkeletonChart />
        </PageShell>
      </main>
    );
  }

  const overview = data?.overview ?? { total: 0, agentUsers: 0, appUsers: 0, todayNew: 0 };
  const champion = sortedTools[0];
  const runnerUp = sortedTools[1];
  const longTail = sortedTools.slice(2, 7);
  const momentum = sortedTools.length > 1 ? Math.max(1, champion!.count - runnerUp!.count) : 0;

  return (
    <main className="relative overflow-hidden pb-20 pt-10">
      <ParticlesBG className="opacity-10" count={12} />

      <Section className="relative z-10">
        <PageShell width="wide">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-[#00ffc8]/15 bg-[#00ffc8]/[0.05] px-4 py-2 backdrop-blur-md">
              <TrendingUp className="h-3.5 w-3.5 text-[#00ffc8]/80" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#00ffc8]/80">Trend Battlefield</span>
            </div>
            <BlurText text="AI 装备趋势战场" className="title-font text-4xl font-black text-white sm:text-5xl lg:text-6xl" delay={70} direction="bottom" />
            <p className="mt-4 max-w-[760px] text-sm leading-7 text-white/55 sm:text-base">这里是全站 AI 工具热度指挥台。</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mb-6 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
            <LiquidGlassCard className="p-6" mode="shader" blurAmount={0.08} aberrationIntensity={1.7} cornerRadius={30}>
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="title-font text-[10px] uppercase tracking-[0.3em] text-[#00ffc8]/65">Momentum Focus</p>
                  <h2 className="mt-2 title-font text-2xl font-black text-white sm:text-3xl">当前热度冠军</h2>
                </div>
                <div className="rounded-full border border-white/[0.05] bg-white/[0.02] px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-white/45">Tool Pulse</div>
              </div>
              {champion ? (
                <div className="grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
                  <div className="rounded-[26px] border border-[#00ffc8]/15 bg-[radial-gradient(circle_at_0%_0%,rgba(0,255,200,0.14),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-5">
                    <div className="mb-6 flex items-center gap-2 text-[#00ffc8]">
                      <Activity className="h-4 w-4" />
                      <span className="text-[11px] uppercase tracking-[0.24em]">Active Champion</span>
                    </div>
                    <h3 className="title-font text-3xl font-black text-white">{champion.name}</h3>
                    <div className="mt-4 flex items-end gap-2">
                      <CountUp to={champion.count} className="title-font text-5xl font-black text-white" duration={1.6} />
                      <span className="pb-2 text-sm text-white/40">次装备</span>
                    </div>
                    <p className="mt-5 text-sm leading-7 text-white/50">它正在定义当前 Agent 玩家的主流装备组合。</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
                    {[
                      { label: "追赶者", value: runnerUp?.name ?? "暂无", stat: runnerUp ? `${runnerUp.count} 次` : "尚无第二名", icon: Swords, color: "#a855f7" },
                      { label: "领先差值", value: `${momentum}`, stat: "冠军差距", icon: Radio, color: "#00d4ff" },
                      { label: "新增玩家", value: `${overview.todayNew}${overview.todayNew > 0 ? "+" : ""}`, stat: "今日写入", icon: Sparkles, color: "#fbbf24" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.05] bg-white/[0.015]">
                          <item.icon className="h-4 w-4" style={{ color: item.color }} />
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">{item.label}</p>
                        <p className="mt-2 text-lg font-bold text-white">{item.value}</p>
                        <p className="mt-1 text-sm text-white/45">{item.stat}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={TrendingUp}
                  title="尚无趋势数据"
                  description="还没有玩家提交身份卡。先去生成一张，第一条信号由你点亮。"
                  cta={{ label: "立即生成身份卡", href: "/survey" }}
                />
              )}
            </LiquidGlassCard>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {[
                { label: "总玩家数", value: overview.total, suffix: overview.total > 0 ? "+" : "" },
                { label: "Agent 玩家", value: overview.agentUsers },
                { label: "App 用户", value: overview.appUsers },
                { label: "今日新增", value: overview.todayNew },
              ].map((item) => (
                <LiquidGlassCard key={item.label} className="p-5" mode="prominent" blurAmount={0.05} aberrationIntensity={1.1} cornerRadius={22}>
                  <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-white/40">{item.label}</p>
                  <div className="flex items-baseline gap-1">
                    <CountUp to={item.value} className="title-font text-3xl font-black text-white" duration={1.5} />
                    {"suffix" in item && item.suffix ? <span className="text-sm font-bold text-cyan-300/75">{item.suffix}</span> : null}
                  </div>
                </LiquidGlassCard>
              ))}
            </div>
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

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
            <LiquidGlassCard className="p-4" mode="prominent" blurAmount={0.08} aberrationIntensity={1.8} cornerRadius={28}>
              <div className="mb-4 flex items-center justify-between gap-2 px-2 pt-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-[#00ffc8]/75" />
                  <h2 className="title-font text-xl font-black text-white sm:text-2xl">装备热力曲线</h2>
                </div>
                <span className="text-[10px] uppercase tracking-[0.22em] text-white/40">Realtime Chart</span>
              </div>
              {chartOption ? (
                <ReactECharts option={chartOption} style={{ height: Math.max(420, (sortedTools.length || 0) * 48) }} />
              ) : (
                <EmptyState
                  icon={BarChart3}
                  title="暂无装备数据"
                  description="接口返回空，先成为第一个上传装备趋势的玩家。"
                  cta={{ label: "立即生成身份卡", href: "/survey" }}
                />
              )}
            </LiquidGlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <LiquidGlassCard className="p-5" mode="standard" blurAmount={0.05} aberrationIntensity={1.1} cornerRadius={24}>
              <div className="mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-300" />
                <h3 className="title-font text-lg font-bold text-white">热度分层</h3>
              </div>
              {longTail.length > 0 ? (
                <RankingList
                  items={longTail.map((tool, i) => ({
                    name: tool.name,
                    count: tool.count,
                    accent: "#00d4ff",
                    trend: "up" as const,
                    delta: `第 ${i + 3} 名`,
                  }))}
                  unit="次装备"
                />
              ) : (
                <EmptyState icon={BarChart3} title="暂无更多趋势数据" />
              )}
            </LiquidGlassCard>

            <LiquidGlassCard className="p-5" mode="shader" blurAmount={0.06} aberrationIntensity={1.4} cornerRadius={24}>
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#00ffc8]" />
                <h3 className="title-font text-lg font-bold text-white">趋势结论</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "冠军工具", value: champion?.name ?? "暂无", desc: "当前主流工作流中心" },
                  { label: "最强追赶", value: runnerUp?.name ?? "暂无", desc: "热度逼近核心装备" },
                  { label: "趋势判断", value: momentum > 5 ? "头部稳固" : "竞争胶着", desc: "装备生态正在变化" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">{item.label}</p>
                    <p className="mt-2 text-lg font-bold text-white">{item.value}</p>
                    <p className="mt-2 text-sm text-white/45">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-white/[0.05] bg-black/20 p-4 text-sm leading-7 text-white/55">
                {champion && runnerUp ? (
                  <>当前装备生态呈现明显的头部集中趋势：<span className="font-semibold text-white">{champion.name}</span> 与 <span className="font-semibold text-white">{runnerUp.name}</span> 组成主力阵列，其余工具正在形成第二梯队。</>
                ) : (
                  "等待玩家数据写入，将自动生成趋势分析。"
                )}
              </div>
            </LiquidGlassCard>
          </motion.div>
        </PageShell>
      </Section>
    </main>
  );
}
