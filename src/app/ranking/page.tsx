"use client";

import { useEffect, useMemo, useState } from "react";
import { levelLabel } from "@/lib/level";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion-wrapper";
import { motion } from "framer-motion";
import { Trophy, MapPin, BarChart3 } from "lucide-react";

type RankingResponse = {
  tools: Array<{ name: string; count: number }>;
  provinces: Array<{ name: string; count: number }>;
  levels: Array<{ level: number; count: number }>;
};

export default function RankingPage() {
  const [data, setData] = useState<RankingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/ranking", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("加载失败");
        const json = (await res.json()) as RankingResponse;
        if (active) setData(json);
      })
      .catch((e) => { if (active) setError(e instanceof Error ? e.message : "加载失败"); });
    return () => { active = false; };
  }, []);

  const levelMax = useMemo(() => Math.max(1, ...((data?.levels ?? []).map((l) => l.count))), [data]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <FadeIn>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">排行榜</h1>
        <p className="mt-3 text-slate-400">基于用户提交数据，查看最热门 AI 工具、省份和等级分布。</p>
      </FadeIn>

      {error ? <p className="mt-6 text-red-400">{error}</p> : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Tools Ranking */}
        <FadeIn delay={0.1}>
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">AI 工具 Top 10</h2>
            </div>
            <StaggerContainer className="mt-4 space-y-3">
              {(data?.tools ?? []).slice(0, 10).map((item, i) => (
                <StaggerItem key={item.name}>
                  <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.05]">
                    <span className="flex items-center gap-3">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${i < 3 ? "bg-indigo-500/20 text-indigo-300" : "bg-white/5 text-slate-500"}`}>{i + 1}</span>
                      <span className="text-sm text-slate-300">{item.name}</span>
                    </span>
                    <span className="text-sm font-semibold text-white">{item.count}</span>
                  </div>
                </StaggerItem>
              ))}
              {data && data.tools.length === 0 ? <p className="text-sm text-slate-500">暂无数据。</p> : null}
            </StaggerContainer>
          </section>
        </FadeIn>

        {/* Province Ranking */}
        <FadeIn delay={0.2}>
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">省份 Top 10</h2>
            </div>
            <StaggerContainer className="mt-4 space-y-3">
              {(data?.provinces ?? []).slice(0, 10).map((item, i) => (
                <StaggerItem key={item.name}>
                  <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.05]">
                    <span className="flex items-center gap-3">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${i < 3 ? "bg-indigo-500/20 text-indigo-300" : "bg-white/5 text-slate-500"}`}>{i + 1}</span>
                      <span className="text-sm text-slate-300">{item.name}</span>
                    </span>
                    <span className="text-sm font-semibold text-white">{item.count}</span>
                  </div>
                </StaggerItem>
              ))}
              {data && data.provinces.length === 0 ? <p className="text-sm text-slate-500">暂无数据。</p> : null}
            </StaggerContainer>
          </section>
        </FadeIn>

        {/* Level Distribution */}
        <FadeIn delay={0.3}>
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">AI 使用等级分布</h2>
            </div>
            <div className="mt-4 space-y-3">
              {(data?.levels ?? []).map((item, i) => (
                <motion.div
                  key={item.level}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{levelLabel(item.level)}</span>
                    <span className="text-sm font-semibold text-indigo-300">{item.count}</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (item.count / levelMax) * 100)}%` }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                      className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"
                    />
                  </div>
                </motion.div>
              ))}
              {!data ? <p className="text-sm text-slate-500">加载中...</p> : null}
            </div>
          </section>
        </FadeIn>
      </div>
    </main>
  );
}
