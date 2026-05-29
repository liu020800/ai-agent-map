"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { MapPin, Filter, Radio, Wifi, ChevronRight, Zap } from "lucide-react";
import SpotlightCard from "@/components/react-bits/SpotlightCard";
import ShinyText from "@/components/react-bits/ShinyText";
import SciFiLoader from "@/components/react-bits/SciFiLoader";
import CountUp from "@/components/react-bits/CountUp";
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
      .then(res => { if (!res.ok) throw new Error("加载失败"); return res.json(); })
      .then((json: RankingData) => { if (active) setData(json); })
      .catch(err => { if (active) setError(err instanceof Error ? err.message : "加载失败"); });
    return () => { active = false; };
  }, []);

  const filteredProvinces = useMemo(() => data?.provinces ?? [], [data]);
  const sortedProvinces = useMemo(() => [...filteredProvinces].sort((a, b) => b.value - a.value), [filteredProvinces]);
  const topTools = useMemo(() => data?.tools.slice(0, 10) ?? [], [data]);
  const totalSignals = useMemo(() => sortedProvinces.reduce((s, p) => s + p.value, 0), [sortedProvinces]);

  if (!data && !error) {
    return (
      <main className="relative mx-auto flex min-h-[80vh] max-w-[1200px] items-center justify-center px-6">
        <ParticlesBG className="-z-10 opacity-20" count={25} />
        <SciFiLoader text="正在扫描全国 AI 信号..." />
      </main>
    );
  }

  return (
    <main className="relative mx-auto max-w-[1200px] px-6 py-8">
      <ParticlesBG className="-z-10 opacity-15" count={20} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
          </span>
          <p className="text-xs font-semibold tracking-[0.3em] text-cyan-400 uppercase">Signal Radar</p>
        </div>
        <BlurText text="全国 AI 信号雷达" className="text-3xl font-black text-white sm:text-4xl" delay={0.1} />
        <p className="mt-2 text-sm text-slate-500">
          已捕获 <span className="text-cyan-400 font-bold">{totalSignals}</span> 个信号，覆盖 <span className="text-cyan-400 font-bold">{sortedProvinces.length}</span> 个省份
        </p>
      </motion.div>

      {error ? <p className="mb-6 text-sm text-red-400 rounded-xl border border-red-500/20 bg-red-500/5 p-4">{error}</p> : null}

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="h-3 w-3" /> 信号类型
          </div>
          {(["all", "agent", "app"] as const).map(f => (
            <motion.button key={f} onClick={() => setUserFilter(f)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${userFilter === f
                ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/10"
                : "bg-white/[0.03] text-slate-400 border border-white/[0.06] hover:border-white/[0.12]"}`}>
              {f === "all" ? "全部信号" : f === "agent" ? "Agent 信号" : "App 信号"}
            </motion.button>
          ))}
          {topTools.length > 0 && (
            <select value={selectedTool} onChange={e => setSelectedTool(e.target.value)}
              className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs text-slate-400 focus:border-cyan-500/40 focus:outline-none">
              <option value="">所有装备</option>
              {topTools.map(t => <option key={t.name} value={t.name}>{t.name} ({t.count})</option>)}
            </select>
          )}
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Map */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <SpotlightCard className="p-2" spotlightColor="rgba(34, 211, 238, 0.06)">
            <div className="rounded-xl overflow-hidden border border-white/[0.04]">
              <ChinaMapChart data={filteredProvinces} filter={userFilter} />
            </div>
          </SpotlightCard>
        </motion.div>

        {/* Province Rankings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <SpotlightCard className="p-4" spotlightColor="rgba(34, 211, 238, 0.06)">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-bold text-white">据点排行</span>
            </div>

            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {sortedProvinces.slice(0, 20).map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.03 }}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 transition-all ${
                    i < 3 ? "bg-cyan-500/5 border border-cyan-500/10" : "hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${
                      i === 0 ? "bg-amber-500/20 text-amber-300" : i === 1 ? "bg-slate-400/15 text-slate-300" : i === 2 ? "bg-amber-600/15 text-amber-400" : "bg-white/5 text-slate-500"
                    }`}>{i + 1}</span>
                    <span className="text-sm font-medium text-white">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {i < 3 && <Radio className="h-3 w-3 text-cyan-400 animate-pulse" />}
                    <CountUp target={p.value} className="text-sm font-bold text-cyan-300 tabular-nums" duration={1} />
                  </div>
                </motion.div>
              ))}
            </div>

            {sortedProvinces.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-12 text-slate-500">
                <Radio className="h-8 w-8 text-slate-600" />
                <p className="text-sm text-center">这里还没有 Agent 信号，<br />成为第一个点亮它的人。</p>
              </div>
            )}
          </SpotlightCard>
        </motion.div>
      </div>
    </main>
  );
}
