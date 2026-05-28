"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion-wrapper";
import { motion } from "framer-motion";
import { MapPin, Filter, Radio, Wifi } from "lucide-react";
import SpotlightCard from "@/components/react-bits/SpotlightCard";
import ShinyText from "@/components/react-bits/ShinyText";
import SciFiLoader from "@/components/react-bits/SciFiLoader";
import BlurText from "@/components/react-bits/BlurText";

const ChinaMapChart = dynamic(() => import("@/components/china-map-chart"), { ssr: false });
const ParticlesBG = dynamic(() => import("@/components/react-bits/ParticlesBG"), { ssr: false });

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

  if (!data && !error) {
    return (
      <main className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
        <ParticlesBG className="fixed inset-0 -z-10 opacity-30" count={30} />
        <SciFiLoader text="正在扫描全国 AI 信号..." />
      </main>
    );
  }

  return (
    <main className="relative mx-auto max-w-6xl px-6 py-12">
      <ParticlesBG className="fixed inset-0 -z-10 opacity-20" count={25} />

      <FadeIn>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
            <Radio className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <BlurText text="全国 AI 信号雷达" className="text-3xl font-black text-white sm:text-4xl" delay={0} />
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
              <Wifi className="h-3 w-3 text-cyan-500 animate-pulse" />
              实时扫描全国 Agent 据点分布
            </p>
          </div>
        </div>
      </FadeIn>

      {error ? <p className="mt-4 text-red-400">{error}</p> : null}

      {/* Filters */}
      <FadeIn delay={0.1}>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500"><Filter className="h-3 w-3" />信号筛选：</div>
          {(["all", "agent", "app"] as const).map((f) => (
            <motion.button key={f} onClick={() => setUserFilter(f)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${userFilter === f ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/10" : "bg-white/5 text-slate-400 border border-white/10 hover:border-white/20"}`}>
              {f === "all" ? "全部信号" : f === "agent" ? "Agent 信号" : "App 信号"}
            </motion.button>
          ))}
          {topTools.length > 0 && (
            <select value={selectedTool} onChange={(e) => setSelectedTool(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 focus:border-cyan-500/50 focus:outline-none">
              <option value="">所有装备</option>
              {topTools.map((t) => (<option key={t.name} value={t.name}>{t.name} ({t.count})</option>))}
            </select>
          )}
        </div>
      </FadeIn>

      {/* Map */}
      <FadeIn delay={0.2}>
        <SpotlightCard className="mt-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-xl" spotlightColor="rgba(34, 211, 238, 0.08)">
          <ChinaMapChart data={filteredProvinces} filter={userFilter} />
        </SpotlightCard>
      </FadeIn>

      {/* Province rankings */}
      <FadeIn delay={0.3}>
        <div className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <MapPin className="h-4 w-4 text-cyan-400" />
            <ShinyText text="据点排行榜" className="text-lg font-bold" speed={4} />
          </h2>
          <StaggerContainer className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {sortedProvinces.slice(0, 15).map((p, i) => (
              <StaggerItem key={p.name}>
                <motion.div whileHover={{ scale: 1.03, y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
                  <SpotlightCard className={`rounded-xl border p-4 backdrop-blur-xl transition-all ${i < 3 ? "border-cyan-500/20 bg-cyan-500/5" : "border-white/[0.08] bg-white/[0.03]"}`}
                    spotlightColor={i < 3 ? "rgba(34, 211, 238, 0.12)" : "rgba(99, 102, 241, 0.08)"}>
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-bold ${i < 3 ? "text-cyan-400" : "text-slate-500"}`}>#{i + 1}</p>
                      {i < 3 && <Radio className="h-3 w-3 text-cyan-400 animate-pulse" />}
                    </div>
                    <p className="mt-1.5 text-sm font-semibold text-white">{p.name}</p>
                    <p className={`text-xl font-black ${i < 3 ? "text-cyan-300" : "text-indigo-300"}`}>{p.value}</p>
                  </SpotlightCard>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {sortedProvinces.length === 0 && (
            <div className="mt-8 flex flex-col items-center gap-3 py-12 text-slate-500">
              <Radio className="h-8 w-8 text-slate-600" />
              <p className="text-sm">这里还没有 Agent 信号，成为第一个点亮它的人。</p>
            </div>
          )}
        </div>
      </FadeIn>
    </main>
  );
}
