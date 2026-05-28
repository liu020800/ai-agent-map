"use client";

import { useEffect, useMemo, useState } from "react";
import { levelLabel } from "@/lib/level";

type RankingResponse = {
  tools: Array<{ name: string; count: number }>;
  provinces: Array<{ name: string; count: number }>;
  levels: Array<{ level: number; count: number }>;
};

function formatCount(value: number) {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}w`;
  return String(value);
}

export default function HomeStats() {
  const [data, setData] = useState<RankingResponse | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/ranking", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (active) setData(json as RankingResponse);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const totalUsers = useMemo(() => {
    if (!data) return 0;
    return data.levels.reduce((acc, item) => acc + item.count, 0);
  }, [data]);

  const agentShare = useMemo(() => {
    if (!data || totalUsers === 0) return "待统计";
    const agentCount = data.levels.filter((l) => l.level >= 4).reduce((acc, item) => acc + item.count, 0);
    return `${((agentCount / totalUsers) * 100).toFixed(1)}%`;
  }, [data, totalUsers]);

  const topTool = useMemo(() => data?.tools[0]?.name ?? "待统计", [data]);

  return (
    <section className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { label: "填写用户", value: totalUsers ? formatCount(totalUsers) : "待统计" },
        { label: "覆盖省份", value: data ? String(data.provinces.length) : "待统计" },
        { label: "Agent 用户占比", value: agentShare },
        { label: "当前最热工具", value: topTool },
      ].map((item) => (
        <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <p className="text-sm text-slate-400">{item.label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
        </div>
      ))}

      <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <p className="text-sm text-slate-400">等级分布（实时）</p>
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          {(data?.levels ?? []).map((item) => (
            <div key={item.level} className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-white">{levelLabel(item.level)}</p>
              <p className="mt-2 text-lg font-semibold text-white">{item.count}</p>
            </div>
          ))}
          {!data ? <p className="text-slate-500">加载中...</p> : null}
        </div>
      </div>
    </section>
  );
}
