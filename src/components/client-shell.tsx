"use client";

import Navbar from "@/components/navbar";
import Link from "next/link";
import { useState } from "react";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [showContact, setShowContact] = useState(false);

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
          <div className="relative flex flex-wrap items-center justify-center gap-3">
            <Link href="/privacy" className="hover:text-cyan-200">隐私政策</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-cyan-200">用户协议</Link>
            <span>·</span>
            <button
              type="button"
              onClick={() => setShowContact((open) => !open)}
              className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.04] px-3 py-1 text-white/70 transition hover:border-cyan-300/45 hover:text-cyan-200"
              aria-expanded={showContact}
            >
              联系反馈
            </button>
            {showContact && (
              <div className="absolute bottom-9 right-0 z-50 w-[min(88vw,320px)] rounded-2xl border border-cyan-300/25 bg-[#060914]/95 p-4 text-left text-xs text-slate-200 shadow-[0_18px_60px_rgba(0,255,255,0.16)] backdrop-blur-xl">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200">Contact</p>
                <div className="space-y-2">
                  <a href="mailto:liusq9428@163.com" className="block rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 hover:border-cyan-300/40 hover:text-cyan-200">
                    邮箱：liusq9428@163.com
                  </a>
                  <p className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                    QQ：515107596
                  </p>
                  <a href="https://t.me/liusq_ai" target="_blank" rel="noreferrer" className="block rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 hover:border-cyan-300/40 hover:text-cyan-200">
                    TG 交流群：t.me/liusq_ai
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </footer>
    </>
  );
}
