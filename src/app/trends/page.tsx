"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { FadeIn } from "@/components/motion-wrapper";
import { motion } from "framer-motion";
import { TrendingUp, Zap, BarChart3 } from "lucide-react";
import SpotlightCard from "@/components/react-bits/SpotlightCard";
import CountUp from "@/components/react-bits/CountUp";
import ShinyText from "@/components/react-bits/ShinyText";
import SciFiLoader from "@/components/react-bits/SciFiLoader";
import BlurText from "@/components/react-bits/BlurText";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });
const ParticlesBG = dynamic(() => import("@/components/react-bits/ParticlesBG"), { ssr: false });

type RankingResponse = {
  tools: Array<{ name: string; count: number }>;
};

export default function TrendsPage() {
  const [data, setData] = useState<RankingResponse | null>(null);

  useEffect(() => {
    fetch("/api/ranking", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setData(j as RankingResponse))
      .catch(() => {});
  }, []);

  const chartOption = useMemo(() => {
    if (!data || data.tools.length === 0) return null;
    const sorted = [...data.tools].sort((a, b) => b.count - a.count);
    return {
      tooltip: {
        trigger: "axis" as const,
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        borderColor: "rgba(99, 102, 241, 0.3)",
        textStyle: { color: "#e2e8f0" },
      },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      xAxis: {
        type: "value" as const,
        axisLabel: { color: "#64748b" },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
      },
      yAxis: {
        type: "category" as const,
        data: sorted.map((t) => t.name).reverse(),
        axisLabel: { color: "#e2e8f0", fontSize: 12 },
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.06)" } },
      },
      series: [{
        type: "bar",
        data: sorted.map((t) => t.count).reverse(),
        itemStyle: {
          borderRadius: [0, 6, 6, 0],
          color: {
            type: "linear",
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: "#6366f1" },
              { offset: 0.5, color: "#8b5cf6" },
              { offset: 1, color: "#06b6d4" },
            ],
          },
        },
        emphasis: {
          itemStyle: {
            color: {
              type: "linear",
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: "#818cf8" },
                { offset: 0.5, color: "#a78bfa" },
                { offset: 1, color: "#22d3ee" },
              ],
            },
          },
        },
        barWidth: "60%",
      }],
    };
  }, [data]);

  if (!data) {
    return (
      <main className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6">
        <ParticlesBG className="fixed inset-0 -z-10 opacity-30" count={25} />
        <SciFiLoader text="正在扫描 AI 装备信号..." />
      </main>
    );
  }

  return (
    <main className="relative mx-auto max-w-5xl px-6 py-12">
      <ParticlesBG className="fixed inset-0 -z-10 opacity-20" count={20} />

      <FadeIn>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
            <TrendingUp className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <BlurText text="AI 装备趋势战场" className="text-3xl font-black text-white sm:text-4xl" delay={0} />
            <p className="mt-1 text-sm text-slate-400">基于用户提交数据，查看各 AI 装备的使用热度排名</p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        <SpotlightCard className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl" spotlightColor="rgba(99, 102, 241, 0.08)">
          {chartOption ? (
            <ReactECharts option={chartOption} style={{ height: Math.max(400, (data?.tools.length ?? 0) * 45) }} />
          ) : (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-500">
              <BarChart3 className="h-8 w-8 text-slate-600" />
              <p className="text-sm">暂无装备数据</p>
            </div>
          )}
        </SpotlightCard>
      </FadeIn>

      <FadeIn delay={0.3}>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {(data?.tools ?? []).map((tool, i) => (
            <motion.div key={tool.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
              whileHover={{ scale: 1.03, y: -2 }}>
              <SpotlightCard className={`rounded-xl border p-4 backdrop-blur-xl transition-all ${i < 3 ? "border-indigo-500/20 bg-indigo-500/5" : "border-white/[0.08] bg-white/[0.03]"}`}
                spotlightColor={i < 3 ? "rgba(99, 102, 241, 0.12)" : "rgba(99, 102, 241, 0.06)"}>
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-bold ${i < 3 ? "text-indigo-400" : "text-slate-500"}`}>#{i + 1}</p>
                  {i < 3 && <Zap className="h-3 w-3 text-indigo-400 animate-pulse" />}
                </div>
                <p className="mt-1.5 text-sm font-semibold text-white">{tool.name}</p>
                <CountUp target={tool.count} className={`text-xl font-black ${i < 3 ? "text-indigo-300" : "text-slate-300"}`} duration={1.2} />
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </FadeIn>
    </main>
  );
}
