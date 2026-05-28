import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(99,102,241,0.18),transparent_60%)]" />
      <p className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs tracking-wide text-slate-300 backdrop-blur">
        MVP · AI Agent 用户调查网站
      </p>
      <h1 className="text-3xl font-semibold leading-tight text-white sm:text-5xl">
        谁在真正使用 AI Agent？
      </h1>
      <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
        这不是普通问卷，而是一个「AI 用户身份社区 + AI Agent 趋势地图」。填写你的使用情况，看看你在全中国的 AI 等级。
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/survey"
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:opacity-90"
        >
          立即参与调查
        </Link>
        <Link
          href="/ranking"
          className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 backdrop-blur transition hover:border-white/20 hover:bg-white/10"
        >
          查看排行榜
        </Link>
      </div>
      <section className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "覆盖城市", value: "待统计" },
          { label: "填写用户", value: "待统计" },
          { label: "Agent 用户占比", value: "待统计" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-sm text-slate-400">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
