"use client";

import Navbar from "@/components/navbar";
import Link from "next/link";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-2xl focus:border focus:border-cyan-300/40 focus:bg-[#0a0b12] focus:px-4 focus:py-2 focus:text-sm focus:text-cyan-300"
      >
        跳到主要内容
      </a>
      <Navbar />
      <div className="pt-20">
        {children}
      </div>
      <footer className="border-t border-white/10 bg-black/30 px-4 py-8 text-center text-xs text-white/45">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <p>AI 生成内容 · 仅供娱乐和分享，不代表真实身份认证。</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/privacy" className="hover:text-cyan-200">隐私政策</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-cyan-200">用户协议</Link>
            <span>·</span>
            <a href="mailto:liusq9428@163.com" className="hover:text-cyan-200">联系反馈：liusq9428@163.com / QQ 515107596</a>
          </div>
        </div>
      </footer>
    </>
  );
}
