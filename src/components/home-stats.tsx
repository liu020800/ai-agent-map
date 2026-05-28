"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { levelLabel } from "@/lib/level";

type UserRow = {
  tools: string[] | null;
  province: string | null;
  ai_level: number | null;
};

function formatCount(value: number) {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}w`;
  return String(value);
}

export default function HomeStats() {
  const [rows, setRows] = useState<UserRow[]>([]);

  useEffect(() => {
    let active = true;
    supabase
      .from("users")
      .select("tools, province, ai_level")
      .limit(50000)
      .then(({ data }) => {
        if (active && data) setRows(data as UserRow[]);
      });
    return () => {
      active = false;
    };
  }, []);

  const totalUsers = rows.length;

  const provincesCount = useMemo(() => new Set(rows.map((r) => r.province).filter(Boolean)).size, [rows]);

  const agentShare = useMemo(() => {
    if (totalUsers === 0) return "待统计";
    const agentCount = rows.filter((r) => (r.ai_level ?? 1) >= 4).length;
    return `${((agentCount / totalUsers) * 100).toFixed(1)}%`;
  }, [rows, totalUsers]);

  const topTool = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of rows) {
      for (const tool of row.tools ?? []) map.set(tool, (map.get(tool) ?? 0) + 1);
    }
    const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : "待统计";
  }, [rows]);

  const levels = useMemo(() => {
    const map = new Map<number, number>();
    for (const row of rows) {
      const level = row.ai_level ?? 1;
      map.set(level, (map.get(level) ?? 0) + 1);
    }
    return Array.from({ length: 5 }, (_, i) => i + 1).map((level) => ({
      level,
      count: map.get(level) ?? 0,
    }));
  }, [rows]);

  return (
    <section className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { label: "填写用户", value: totalUsers ? formatCount(totalUsers) : "待统计" },
        { label: "覆盖省份", value: provincesCount ? String(provincesCount) : "待统计" },
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
          {levels.map((item) => (
            <div key={item.level} className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-white">{levelLabel(item.level)}</p>
              <p className="mt-2 text-lg font-semibold text-white">{item.count}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
