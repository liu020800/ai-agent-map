export default function MapPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-white sm:text-4xl">全国 AI 用户地图</h1>
      <p className="mt-3 text-slate-300">后续将接入 ECharts 中国地图与省份热力图数据。</p>
      <div className="mt-8 grid place-items-center rounded-2xl border border-white/10 bg-white/5 p-10 text-slate-400">
        地图占位区域
      </div>
    </main>
  );
}
