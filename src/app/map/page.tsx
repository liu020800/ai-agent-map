"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { FadeIn } from "@/components/motion-wrapper";
import { MapPin } from "lucide-react";

const ChinaMapChart = dynamic(() => import("@/components/china-map-chart"), { ssr: false });

type RankingResponse = {
  provinces: Array<{ name: string; count: number }>;
};

export default function MapPage() {
  const [provinceData, setProvinceData] = useState<Array<{ name: string; value: number }>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/ranking", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("加载失败");
        return res.json();
      })
      .then((json: RankingResponse) => {
        if (active) setProvinceData(json.provinces.map((p) => ({ name: p.name, value: p.count })));
      })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : "加载失败"); });
    return () => { active = false; };
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <FadeIn>
        <div className="flex items-center gap-3">
          <MapPin className="h-8 w-8 text-indigo-400" />
          <div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">全国 AI 用户地图</h1>
            <p className="mt-1 text-slate-400">基于用户提交数据生成的省份热力图。</p>
          </div>
        </div>
      </FadeIn>

      {error ? <p className="mt-4 text-red-400">{error}</p> : null}

      <FadeIn delay={0.2}>
        <section className="mt-8 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-xl">
          <ChinaMapChart data={provinceData} />
        </section>
      </FadeIn>

      <FadeIn delay={0.3}>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {provinceData
            .sort((a, b) => b.value - a.value)
            .slice(0, 10)
            .map((p, i) => (
              <div key={p.name} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-xl">
                <p className="text-xs text-slate-500">#{i + 1}</p>
                <p className="mt-1 text-sm font-semibold text-white">{p.name}</p>
                <p className="text-lg font-bold text-indigo-300">{p.value}</p>
              </div>
            ))}
        </div>
      </FadeIn>
    </main>
  );
}
