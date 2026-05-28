import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <p className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs tracking-wide text-slate-300">页面未找到</p>
      <h1 className="text-3xl font-semibold text-white sm:text-5xl">404</h1>
      <p className="text-slate-300">你要找的页面不存在或已移动。</p>
      <Link href="/" className="rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25">
        返回首页
      </Link>
    </main>
  );
}
