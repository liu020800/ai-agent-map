"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { levelName } from "@/lib/level";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion-wrapper";
import { motion } from "framer-motion";
import { Trophy, MapPin, BarChart3, Swords, Crown, Medal, Zap } from "lucide-react";
import SpotlightCard from "@/components/react-bits/SpotlightCard";
import CountUp from "@/components/react-bits/CountUp";
import ShinyText from "@/components/react-bits/ShinyText";
import SciFiLoader from "@/components/react-bits/SciFiLoader";
import BlurText from "@/components/react-bits/BlurText";

const ParticlesBG = dynamic(() => import("@/components/react-bits/ParticlesBG"), { ssr: false });

type RankingData = {
  tools: Array<{ name: string; count: number }>;
  provinces: Array<{ name: string; value: number }>;
  levels: Array<{ level: number; count: number }>;
};

const RANK_ICONS = [Crown, Trophy, Medal];
const RANK_COLORS = ["text-amber-400", "text-slate-300", "text-amber-600"];
const RANK_GLOW = ["shadow-amber-500/20", "shadow-slate-400/10", "shadow-amber-600/15"];

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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
            <Trophy className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <BlurText text="全国 AI 排行榜" className="text-3xl font-black text-white sm:text-4xl" delay={0} />
            <p className="mt-1 text-sm text-slate-400">基于真实用户数据的装备热度、据点分布与等级排名</p>
          </div>
        </div>
      </FadeIn>

      {error ? <p className="mt-4 text-red-400">{error}</p> : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Tools ranking */}
        <FadeIn delay={0.1}>
          <SpotlightCard className="rounded-2xl border border-amber-500/10 bg-gradient-to-b from-amber-500/5 to-transparent p-6" spotlightColor="rgba(245, 158, 11, 0.08)">
            <div className="flex items-center gap-2 mb-5">
              <Swords className="h-5 w-5 text-amber-400" />
              <ShinyText text="热门装备榜" className="text-lg font-bold" speed={4} />
            </div>
            <StaggerContainer className="space-y-2">
              {(data?.tools ?? []).slice(0, 10).map((item, i) => {
                const RankIcon = RANK_ICONS[i] || null;
                return (
                  <StaggerItem key={item.name}>
                    <motion.div whileHover={{ scale: 1.02, x: 4 }} transition={{ type: "spring", stiffness: 400 }}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-all ${i < 3 ? "border-amber-500/20 bg-amber-500/5 shadow-lg " + RANK_GLOW[i] : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"}`}>
                      <span className="flex items-center gap-3">
                        {RankIcon ? <RankIcon className={`h-4 w-4 ${RANK_COLORS[i]}`} /> : <span className="flex h-4 w-4 items-center justify-center text-xs font-bold text-slate-500">{i + 1}</span>}
                        <span className="text-sm font-medium text-slate-200">{item.name}</span>
                      </span>
                      <span className="text-sm font-bold text-white tabular-nums">{item.count}</span>
                    </motion.div>
                  </StaggerItem>
                );
              })}
              {data && data.tools.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8">
                  <Zap className="h-6 w-6 text-slate-600" />
                  <p className="text-center text-sm text-slate-500">这里还没有 Agent 信号，成为第一个点亮它的人。</p>
                </div>
              ) : null}
            </StaggerContainer>
          </SpotlightCard>
        </FadeIn>

        {/* Province ranking */}
        <FadeIn delay={0.2}>
          <SpotlightCard className="rounded-2xl border border-cyan-500/10 bg-gradient-to-b from-cyan-500/5 to-transparent p-6" spotlightColor="rgba(34, 211, 238, 0.08)">
            <div className="flex items-center gap-2 mb-5">
              <MapPin className="h-5 w-5 text-cyan-400" />
              <ShinyText text="据点排行" className="text-lg font-bold" speed={4} />
            </div>
            <StaggerContainer className="space-y-2">
              {(data?.provinces ?? []).slice(0, 10).map((item, i) => (
                <StaggerItem key={item.name}>
                  <motion.div whileHover={{ scale: 1.02, x: 4 }} transition={{ type: "spring", stiffness: 400 }}
                    className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-all hover:bg-white/[0.04]">
                    <span className="flex items-center gap-3">
                      <span className={`flex h-4 w-4 items-center justify-center text-xs font-bold ${i < 3 ? "text-cyan-400" : "text-slate-500"}`}>{i + 1}</span>
                      <span className="text-sm font-medium text-slate-200">{item.name}</span>
                    </span>
                    <span className="text-sm font-bold text-white tabular-nums">{item.value}</span>
                  </motion.div>
                </StaggerItem>
              ))}
              {data && data.provinces.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">暂无据点数据</p> : null}
            </StaggerContainer>
          </SpotlightCard>
        </FadeIn>

        {/* Level distribution */}
        <FadeIn delay={0.3}>
          <SpotlightCard className="rounded-2xl border border-purple-500/10 bg-gradient-to-b from-purple-500/5 to-transparent p-6" spotlightColor="rgba(168, 85, 247, 0.08)">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="h-5 w-5 text-purple-400" />
              <ShinyText text="等级分布" className="text-lg font-bold" speed={4} />
            </div>
            <div className="space-y-3">
              {(data?.levels ?? []).map((item, i) => (
                <motion.div key={item.level} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{levelName(item.level)}</span>
                    <CountUp target={item.count} className="text-sm font-bold text-indigo-300 tabular-nums" duration={1} />
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (item.count / levelMax) * 100)}%` }} transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                      className="h-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />
                  </div>
                </motion.div>
              ))}
            </div>
          </SpotlightCard>
        </FadeIn>
      </div>
    </main>
  );
}
