"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Bot, Smartphone, CalendarDays, Flame, TrendingUp } from "lucide-react";

type StatsOverview = { total: number; agentUsers: number; appUsers: number; todayNew: number };
type ToolStat = { name: string; count: number };
type RankingData = { tools: ToolStat[]; overview: StatsOverview };

export default function HomeStats() {
  const [data, setData] = useState<RankingData | null>(null);

  useEffect(() => {
    fetch("/api/ranking", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setData(j as RankingData))
      .catch(() => {});
  }, []);

  const overview = data?.overview ?? { total: 0, agentUsers: 0, appUsers: 0, todayNew: 0 };
  const topTools = data?.tools.slice(0, 5) ?? [];

  const stats = [
    { icon: Users, label: "总参与人数", value: overview.total, color: "text-indigo-400" },
    { icon: Bot, label: "Agent 用户", value: overview.agentUsers, color: "text-purple-400" },
    { icon: Smartphone, label: "App 用户", value: overview.appUsers, color: "text-blue-400" },
    { icon: CalendarDays, label: "今日新增", value: overview.todayNew, color: "text-emerald-400" },
  ];

  return (
    <div className="w-full max-w-5xl space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-xl transition-all hover:border-indigo-500/30 hover:bg-white/[0.06]"
          >
            <div className="flex items-center gap-2">
              <item.icon className={`h-4 w-4 ${item.color}`} />
              <p className="text-xs text-slate-500">{item.label}</p>
            </div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.1 }} className="mt-2 text-2xl font-bold text-white">
              {item.value}
            </motion.p>
          </motion.div>
        ))}
      </div>

      {/* Hot tools */}
      {topTools.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-400" />
            <p className="text-xs font-medium text-slate-500">热门工具 Top 5</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {topTools.map((tool, i) => (
              <motion.span key={tool.name} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 + i * 0.08 }}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300">
                <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${i < 3 ? "bg-indigo-500/20 text-indigo-300" : "bg-white/5 text-slate-500"}`}>{i + 1}</span>
                {tool.name}
                <span className="text-slate-500">{tool.count}</span>
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
