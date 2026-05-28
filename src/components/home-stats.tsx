"use client";

import { useEffect, useMemo, useState } from "react";
import { levelLabel } from "@/lib/level";
import { motion } from "framer-motion";
import { Users, MapPin, Zap, Flame } from "lucide-react";

type RankingResponse = {
  tools: Array<{ name: string; count: number }>;
  provinces: Array<{ name: string; count: number }>;
  levels: Array<{ level: number; count: number }>;
};

function AnimatedNumber({ value }: { value: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-2xl font-bold text-white"
    >
      {value}
    </motion.span>
  );
}

export default function HomeStats() {
  const [data, setData] = useState<RankingResponse | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/ranking", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => { if (active) setData(j as RankingResponse); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const totalUsers = useMemo(() => (data ? data.levels.reduce((a, b) => a + b.count, 0) : 0), [data]);
  const agentShare = useMemo(() => {
    if (!data || totalUsers === 0) return "待统计";
    const agentCount = data.levels.filter((l) => l.level >= 4).reduce((a, b) => a + b.count, 0);
    return `${((agentCount / totalUsers) * 100).toFixed(1)}%`;
  }, [data, totalUsers]);

  const stats = [
    { icon: Users, label: "填写用户", value: totalUsers ? String(totalUsers) : "待统计" },
    { icon: MapPin, label: "覆盖省份", value: data ? String(data.provinces.length) : "待统计" },
    { icon: Zap, label: "Agent 用户占比", value: agentShare },
    { icon: Flame, label: "当前最热工具", value: data?.tools[0]?.name ?? "待统计" },
  ];

  return (
    <div className="w-full max-w-5xl space-y-6">
      <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-xl transition-all hover:border-indigo-500/30 hover:bg-white/[0.06]"
          >
            <div className="flex items-center gap-2">
              <item.icon className="h-4 w-4 text-indigo-400" />
              <p className="text-xs text-slate-500">{item.label}</p>
            </div>
            <AnimatedNumber value={item.value} />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl"
      >
        <p className="text-xs font-medium text-slate-500">等级分布（实时）</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 md:grid-cols-5">
          {(data?.levels ?? []).map((item, i) => (
            <motion.div
              key={item.level}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center transition-colors hover:bg-white/[0.05]"
            >
              <p className="text-xs text-slate-400">{levelLabel(item.level)}</p>
              <p className="mt-1 text-xl font-bold text-white">{item.count}</p>
            </motion.div>
          ))}
          {!data ? <p className="col-span-full text-center text-sm text-slate-600">加载中...</p> : null}
        </div>
      </motion.div>
    </div>
  );
}
