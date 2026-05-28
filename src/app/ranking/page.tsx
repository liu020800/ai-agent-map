"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { levelLabel } from "@/lib/level";

type UserRow = {
  tools: string[] | null;
  province: string | null;
  ai_level: number | null;
};

type RankingItem = { name: string; count: number };

export default function RankingPage() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const { data, error } = await supabase.from("users").select("tools, province, ai_level").limit(50000);
      if (!active) return;
      if (error || !data) {
        setError(error?.message ?? "加载失败");
        return;
      }
      setRows(data as UserRow[]);
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const tools = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of rows) {
      for (const tool of row.tools ?? []) map.set(tool, (map.get(tool) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [rows]);

  const provinces = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of rows) {
      if (row.province) map.set(row.province, (map.get(row.province) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
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

  const levelMax = useMemo(() => Math.max(1, ...levels.map((l) => l.count)), [levels]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-white sm:text-4xl">排行榜</h1>
      <p className="mt-3 text-slate-300">基于用户提交数据，查看最热门 AI 工具、省份和等级分布。</p>

      {error ? <p className="mt-6 text-red-400">{error}</p> : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="text-lg font-semibold text-white">AI 工具 Top 10</h2>
          <ol className="mt-4 space-y-3 text-slate-300">
            {tools.map((item, index) => (
              <li key={item.name} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                <span><span className="mr-2 text-sm text-slate-500">#{index + 1}</span>{item.name}</span>
                <span className="text-sm text-white">{item.count}</span>
              </li>
            ))}
            {tools.length === 0 ? <p className="text-slate-500">暂无数据。</p> : null}
          </ol>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="text-lg font-semibold text-white">省份 Top 10</h2>
          <ol className="mt-4 space-y-3 text-slate-300">
            {provinces.map((item, index) => (
              <li key={item.name} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                <span><span className="mr-2 text-sm text-slate-500">#{index + 1}</span>{item.name}</span>
                <span className="text-sm text-white">{item.count}</span>
              </li>
            ))}
            {provinces.length === 0 ? <p className="text-slate-500">暂无数据。</p> : null}
          </ol>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="text-lg font-semibold text-white">AI 使用等级分布</h2>
          <div className="mt-4 space-y-3 text-slate-300">
            {levels.map((item) => (
              <div key={item.level} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">{levelLabel(item.level)}</span>
                  <span className="text-sm text-white">{item.count}</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500" style={{ width: `${Math.min(100, (item.count / levelMax) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
