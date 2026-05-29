"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { TrendingUp, Zap, BarChart3 } from "lucide-react";
import SpotlightCard from "@/components/react-bits/SpotlightCard";
import CountUp from "@/components/react-bits/CountUp";
import SciFiLoader from "@/components/react-bits/SciFiLoader";
import BlurText from "@/components/react-bits/BlurText";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });
const ParticlesBG = dynamic(() => import("@/components/react-bits/ParticlesBG"), { ssr: false });

type RankingResponse = { tools: Array<{ name: string; count: number }> };

export default function TrendsPage() {
  const [data, setData] = useState<RankingResponse | null>(null);

  useEffect(() => {
    fetch("/api/ranking", { cache: "no-store" })
      .then(r => r.json())
      .then(j => setData(j as RankingResponse))
      .catch(() => {});
  }, []);

  const chartOption = useMemo(() => {
    if (!data || data.tools.length === 0) return null;
    const sorted = [...data.tools].sort((a, b) => b.count - a.count);
    return {
      tooltip: { trigger: "axis" as const, backgroundColor: "rgba(9,9,15,0.95)", borderColor: "rgba(99,102,241,0.2)", textStyle: { color: "#e2e8f0", fontSize: 12 } },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      xAxis: { type: "value" as const, axisLabel: { color: "#475569" }, splitLine: { lineStyle: { color: "rgba(255,255,255,0.03)" } } },
      yAxis: { type: "category" as const, data: sorted.map(t => t.name).reverse(), axisLabel: { color: "#e2e8f0", fontSize: 12 }, axisLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } } },
      series: [{
        type: "bar",
        data: sorted.map(t => t.count).reverse(),
        itemStyle: {
          borderRadius: [0, 6, 6, 0],
          color: { type: "linear", x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: "#6366f1" }, { offset: 0.5, color: "#8b5cf6" }, { offset: 1, color: "#06b6d4" }] },
        },
        emphasis: { itemStyle: { color: { type: "linear", x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: "#818cf8" }, { offset: 0.5, color: "#a78bfa" }, { offset: 1, color: "#22d3ee" }] } } },
        barWidth: "60%",
      }],
    };
  }, [data]);

  if (!data) {
    return (
      <main className="relative mx-auto flex min-h-[80vh] max-w-[1200px] items-center justify-center px-6">
        <ParticlesBG className="-z-10 opacity-20" count={20} />
        <SciFiLoader text="正在扫描 AI 装备信号..." />
      </main>
    );
  }

  return (
    <main className="relative mx-auto max-w-[1200px] px-6 py-8">
      <ParticlesBG className="-z-10 opacity-15" count={15} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-indigo-400" />
          <p className="text-xs font-semibold tracking-[0.3em] text-indigo-400 uppercase">Trend Battlefield</p>
        </div>
        <BlurText text="AI 装备趋势战场" className="text-3xl font-black text-white sm:text-4xl" delay={0.1} />
        <p className="mt-2 text-sm text-slate-500">基于用户提交数据，查看各 AI 装备的使用热度排名</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <SpotlightCard className="p-4" spotlightColor="rgba(99, 102, 241, 0.06)">
          {chartOption ? (
            <ReactECharts option={chartOption} style={{ height: Math.max(400, (data?.tools.length ?? 0) * 45) }} />
          ) : (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-500">
              <BarChart3 className="h-8 w-8 text-slate-600" />
              <p className="text-sm">暂无装备数据</p>
            </div>
          )}
        </SpotlightCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {(data?.tools ?? []).map((tool, i) => (
            <motion.div key={tool.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.04 }} whileHover={{ y: -2 }}>
              <SpotlightCard className="p-4" spotlightColor={i < 3 ? "rgba(99, 102, 241, 0.1)" : "rgba(99, 102, 241, 0.05)"}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold ${i < 3 ? "text-indigo-400" : "text-slate-500"}`}>#{i + 1}</span>
                  {i < 3 && <Zap className="h-3 w-3 text-indigo-400" />}
                </div>
                <p className="text-sm font-bold text-white mb-1 truncate">{tool.name}</p>
                <CountUp target={tool.count} className={`text-xl font-black ${i < 3 ? "text-indigo-300" : "text-slate-300"}`} duration={1.2} />
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </main>
  );
}
