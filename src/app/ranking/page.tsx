"use client";

import { useEffect, useMemo, useState } from "react";
import { levelName } from "@/lib/level";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion-wrapper";
import { motion } from "framer-motion";
import { Trophy, MapPin, BarChart3, Swords, Crown, Medal } from "lucide-react";

type RankingData = {
  tools: Array<{ name: string; count: number }>;
  provinces: Array<{ name: string; value: number }>;
  levels: Array<{ level: number; count: number }>;
};

const RANK_ICONS = [Crown, Trophy, Medal];
const RANK_COLORS = ["text-amber-400", "text-slate-300", "text-amber-600"];

export default function RankingPage() {
  const [data, setData] = useState<RankingData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/ranking", { cache: "no-store" })
      .then(async (res) => { if (!res.ok) throw new Error("加载失败"); if (active) setData(await res.json()); })
      .catch((e) => { if (active) setError(e instanceof Error ? e.message : "加载失败"); });
    return () => { active = false; };
  }, []);

  const levelMax = useMemo(() => Math.max(1, ...((data?.levels ?? []).map((l) => l.count))), [data]);

  if (!data && !error) {
    return (
      <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <div className="relative h-12 w-12"><div className="absolute inset-0 animate-ping rounded-full bg-cyan-500/20" /><div className="relative h-12 w-12 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-400" /></div>
          <p className="text-sm">正在扫描全国 AI 信号...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <FadeIn>
        <div className="flex items-center gap-3">
          <Trophy className="h-8 w-8 text-amber-400" />
          <div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">全国 AI 排行榜</h1>
            <p className="mt-1 text-slate-400">基于真实用户数据的装备热度、据点分布与等级排名</p>
          </div>
        </div>
      </FadeIn>

      {error ? <p className="mt-4 text-red-400">{error}</p> : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Tools ranking */}
        <FadeIn delay={0.1}>
          <section className="rounded-2xl border border-amber-500/10 bg-gradient-to-b from-amber-500/5 to-transparent p-6">
            <div className="flex items-center gap-2 mb-4"><Swords className="h-5 w-5 text-amber-400" /><h2 className="text-lg font-bold text-white">热门装备榜</h2></div>
            <StaggerContainer className="space-y-2">
              {(data?.tools ?? []).slice(0, 10).map((item, i) => {
                const RankIcon = RANK_ICONS[i] || null;
                return (
                  <StaggerItem key={item.name}>
                    <div className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-all ${i < 3 ? "border-amber-500/20 bg-amber-500/5" : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"}`}>
                      <span className="flex items-center gap-3">
                        {RankIcon ? <RankIcon className={`h-4 w-4 ${RANK_COLORS[i]}`} /> : <span className="flex h-4 w-4 items-center justify-center text-xs font-bold text-slate-500">{i + 1}</span>}
                        <span className="text-sm font-medium text-slate-200">{item.name}</span>
                      </span>
                      <span className="text-sm font-bold text-white">{item.count}</span>
                    </div>
                  </StaggerItem>
                );
              })}
              {data && data.tools.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">这里还没有 Agent 信号，成为第一个点亮它的人。</p> : null}
            </StaggerContainer>
          </section>
        </FadeIn>

        {/* Province ranking */}
        <FadeIn delay={0.2}>
          <section className="rounded-2xl border border-cyan-500/10 bg-gradient-to-b from-cyan-500/5 to-transparent p-6">
            <div className="flex items-center gap-2 mb-4"><MapPin className="h-5 w-5 text-cyan-400" /><h2 className="text-lg font-bold text-white">据点排行</h2></div>
            <StaggerContainer className="space-y-2">
              {(data?.provinces ?? []).slice(0, 10).map((item, i) => (
                <StaggerItem key={item.name}>
                  <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-all hover:bg-white/[0.04]">
                    <span className="flex items-center gap-3">
                      <span className="flex h-4 w-4 items-center justify-center text-xs font-bold text-slate-500">{i + 1}</span>
                      <span className="text-sm font-medium text-slate-200">{item.name}</span>
                    </span>
                    <span className="text-sm font-bold text-white">{item.value}</span>
                  </div>
                </StaggerItem>
              ))}
              {data && data.provinces.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">暂无据点数据</p> : null}
            </StaggerContainer>
          </section>
        </FadeIn>

        {/* Level distribution */}
        <FadeIn delay={0.3}>
          <section className="rounded-2xl border border-purple-500/10 bg-gradient-to-b from-purple-500/5 to-transparent p-6">
            <div className="flex items-center gap-2 mb-4"><BarChart3 className="h-5 w-5 text-purple-400" /><h2 className="text-lg font-bold text-white">等级分布</h2></div>
            <div className="space-y-3">
              {(data?.levels ?? []).map((item, i) => (
                <motion.div key={item.level} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">{levelName(item.level)}</span>
                    <span className="text-sm font-bold text-indigo-300">{item.count}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (item.count / levelMax) * 100)}%` }} transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                      className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500" />
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </FadeIn>
      </div>
    </main>
  );
}
