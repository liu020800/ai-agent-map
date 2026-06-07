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
      <div className="workbench-surface pt-20">
        {children}
      </div>
      <footer className="app-card-strong border-t px-4 py-8 text-center text-xs">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <p>一个用来看看大家都在玩什么 AI 工具的小网站。AI 生成内容仅供娱乐和分享。</p>
          <div className="relative flex flex-wrap items-center justify-center gap-3">
            <Link href="/privacy" className="app-muted hover:app-heading">隐私政策</Link>
            <span>·</span>
            <Link href="/terms" className="app-muted hover:app-heading">用户协议</Link>
            <span>·</span>
            <button
              type="button"
              onClick={() => setShowContact((open) => !open)}
              className="app-button-secondary rounded-full border px-3 py-1 transition"
              aria-expanded={showContact}
            >
              联系反馈
            </button>
            {showContact && (
              <div className="app-card-strong absolute bottom-9 right-0 z-50 w-[min(88vw,320px)] rounded-2xl p-4 text-left text-xs shadow-xl">
                <p className="app-muted mb-3 text-[11px] font-semibold uppercase tracking-[0.16em]">Contact</p>
                <div className="space-y-2">
                  <a href="mailto:liusq9428@163.com" className="app-card-muted block rounded-xl px-3 py-2 hover:border-[var(--app-border-strong)]">
                    邮箱：liusq9428@163.com
                  </a>
                  <p className="app-card-muted rounded-xl px-3 py-2">
                    QQ：515107596
                  </p>
                  <a href="https://t.me/liusq_ai" target="_blank" rel="noreferrer" className="app-card-muted block rounded-xl px-3 py-2 hover:border-[var(--app-border-strong)]">
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
