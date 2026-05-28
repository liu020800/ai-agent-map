"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion-wrapper";
import { motion } from "framer-motion";
import { MapPin, Filter } from "lucide-react";

const ChinaMapChart = dynamic(() => import("@/components/china-map-chart"), { ssr: false });

type ToolStat = { name: string; count: number };
type ProvinceStat = { name: string; value: number };
type RankingData = {
  tools: ToolStat[];
  provinces: ProvinceStat[];
  levels: Array<{ level: number; count: number }>;
};

export default function MapPage() {
  const [data, setData] = useState<RankingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userFilter, setUserFilter] = useState<"all" | "agent" | "app">("all");
  const [selectedTool, setSelectedTool] = useState<string>("");

  useEffect(() => {
    let active = true;
    fetch("/api/ranking", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("加载失败");
        return res.json();
      })
      .then((json: RankingData) => { if (active) setData(json); })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : "加载失败"); });
    return () => { active = false; };
  }, []);

  const filteredProvinces = useMemo(() => data?.provinces ?? [], [data]);
  const sortedProvinces = useMemo(() => [...filteredProvinces].sort((a, b) => b.value - a.value), [filteredProvinces]);
  const topTools = useMemo(() => data?.tools.slice(0, 10) ?? [], [data]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <FadeIn>
        <div className="flex items-center gap-3">
          <MapPin className="h-8 w-8 text-indigo-400" />
          <div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">全国 AI 用户地图</h1>
            <p className="mt-1 text-slate-400">基于用户提交数据生成的省份热力图。</p>
          </div>
        </div>
      </FadeIn>

      {error ? <p className="mt-4 text-red-400">{error}</p> : null}

      {/* Filters */}
      <FadeIn delay={0.1}>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-slate-500"><Filter className="h-3 w-3" />筛选：</div>
          {(["all", "agent", "app"] as const).map((f) => (
            <button key={f} onClick={() => setUserFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${userFilter === f ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-white/5 text-slate-400 border border-white/10 hover:border-white/20"}`}>
              {f === "all" ? "全部" : f === "agent" ? "Agent 用户" : "App 用户"}
            </button>
          ))}
          {topTools.length > 0 && (
            <select value={selectedTool} onChange={(e) => setSelectedTool(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 focus:border-indigo-500/50 focus:outline-none">
              <option value="">所有工具</option>
              {topTools.map((t) => (<option key={t.name} value={t.name}>{t.name} ({t.count})</option>))}
            </select>
          )}
        </div>
      </FadeIn>

      {/* Map */}
      <FadeIn delay={0.2}>
        <section className="mt-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-xl">
          <ChinaMapChart data={filteredProvinces} filter={userFilter} />
        </section>
      </FadeIn>

      {/* Province rankings */}
      <FadeIn delay={0.3}>
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-white">省份排行榜</h2>
          <StaggerContainer className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {sortedProvinces.slice(0, 15).map((p, i) => (
              <StaggerItem key={p.name}>
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-xl transition-all hover:border-indigo-500/30">
                  <p className="text-xs text-slate-500">#{i + 1}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{p.name}</p>
                  <p className="text-lg font-bold text-indigo-300">{p.value}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </FadeIn>
    </main>
  );
}
