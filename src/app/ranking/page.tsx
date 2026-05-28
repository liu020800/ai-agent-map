"use client";

import { useEffect, useState } from "react";

type RankingItem = { name: string; count: number };

type RankingResponse = {
  tools: RankingItem[];
  provinces: RankingItem[];
};

export default function RankingPage() {
  const [data, setData] = useState<RankingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const res = await fetch("/api/ranking", { cache: "no-store" });
        if (!res.ok) throw new Error("加载失败");
        const json = (await res.json()) as RankingResponse;
        if (active) setData(json);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "加载失败");
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-white sm:text-4xl">排行榜</h1>
      <p className="mt-3 text-slate-300">基于用户提交数据，查看最热门 AI 工具与省份。</p>

      {error ? <p className="mt-6 text-red-400">{error}</p> : null}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="text-lg font-semibold text-white">AI 工具 Top 10</h2>
          <ol className="mt-4 space-y-3 text-slate-300">
            {(data?.tools ?? []).slice(0, 10).map((item, index) => (
              <li key={item.name} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                <span>
                  <span className="mr-2 text-sm text-slate-500">#{index + 1}</span>
                  {item.name}
                </span>
                <span className="text-sm text-white">{item.count}</span>
              </li>
            ))}
            {!data ? <p className="text-slate-500">加载中...</p> : null}
            {data && data.tools.length === 0 ? <p className="text-slate-500">暂无数据，先去填写问卷吧。</p> : null}
          </ol>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="text-lg font-semibold text-white">省份 Top 10</h2>
          <ol className="mt-4 space-y-3 text-slate-300">
            {(data?.provinces ?? []).slice(0, 10).map((item, index) => (
              <li key={item.name} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                <span>
                  <span className="mr-2 text-sm text-slate-500">#{index + 1}</span>
                  {item.name}
                </span>
                <span className="text-sm text-white">{item.count}</span>
              </li>
            ))}
            {!data ? <p className="text-slate-500">加载中...</p> : null}
            {data && data.provinces.length === 0 ? <p className="text-slate-500">暂无数据。</p> : null}
          </ol>
        </section>
      </div>
    </main>
  );
}
