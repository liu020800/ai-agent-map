"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ChinaMapChart = dynamic(() => import("@/components/china-map-chart"), { ssr: false });

type RankingResponse = {
  provinces: Array<{ name: string; count: number }>;
};

export default function MapPage() {
  const [provinceData, setProvinceData] = useState<Array<{ name: string; value: number }>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const res = await fetch("/api/ranking", { cache: "no-store" });
        if (!res.ok) throw new Error("加载失败");
        const json = (await res.json()) as RankingResponse;
        if (active) {
          setProvinceData(json.provinces.map((p) => ({ name: p.name, value: p.count })));
        }
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
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-white sm:text-4xl">全国 AI 用户地图</h1>
      <p className="mt-3 text-slate-300">基于用户提交数据生成的省份热力图。</p>

      {error ? <p className="mt-4 text-red-400">{error}</p> : null}

      <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
        <ChinaMapChart data={provinceData} />
      </section>
    </main>
  );
}
