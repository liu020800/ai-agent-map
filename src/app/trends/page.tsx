"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { FadeIn } from "@/components/motion-wrapper";
import { TrendingUp } from "lucide-react";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

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
      tooltip: { trigger: "axis" as const },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      xAxis: { type: "value" as const, axisLabel: { color: "#94a3b8" }, splitLine: { lineStyle: { color: "rgba(255,255,255,0.05)" } } },
      yAxis: { type: "category" as const, data: sorted.map((t) => t.name).reverse(), axisLabel: { color: "#e2e8f0" } },
      series: [{
        type: "bar",
        data: sorted.map((t) => t.count).reverse(),
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          color: {
            type: "linear",
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: "#6366f1" },
              { offset: 1, color: "#3b82f6" },
            ],
          },
        },
        barWidth: "60%",
      }],
    };
  }, [data]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <FadeIn>
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-indigo-400" />
          <div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">AI 工具趋势榜</h1>
            <p className="mt-1 text-slate-400">基于用户提交数据，查看各 AI 工具的使用热度排名。</p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        <section className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
          {chartOption ? (
            <ReactECharts option={chartOption} style={{ height: Math.max(400, (data?.tools.length ?? 0) * 45) }} />
          ) : (
            <div className="flex h-64 items-center justify-center text-slate-500">暂无数据</div>
          )}
        </section>
      </FadeIn>

      <FadeIn delay={0.3}>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {(data?.tools ?? []).map((tool, i) => (
            <div key={tool.name} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-xl transition-all hover:border-indigo-500/30">
              <p className="text-xs text-slate-500">#{i + 1}</p>
              <p className="mt-1 text-sm font-semibold text-white">{tool.name}</p>
              <p className="text-lg font-bold text-indigo-300">{tool.count}</p>
            </div>
          ))}
        </div>
      </FadeIn>
    </main>
  );
}
