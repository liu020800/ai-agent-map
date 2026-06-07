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
      <footer className="border-t border-gray-200 bg-white px-4 py-8 text-center text-xs text-gray-500">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <p>一个用来看看大家都在玩什么 AI 工具的小网站。AI 生成内容仅供娱乐和分享。</p>
          <div className="relative flex flex-wrap items-center justify-center gap-3">
            <Link href="/privacy" className="hover:text-blue-700">隐私政策</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-blue-700">用户协议</Link>
            <span>·</span>
            <button
              type="button"
              onClick={() => setShowContact((open) => !open)}
              className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              aria-expanded={showContact}
            >
              联系反馈
            </button>
            {showContact && (
              <div className="absolute bottom-9 right-0 z-50 w-[min(88vw,320px)] rounded-2xl border border-gray-200 bg-white p-4 text-left text-xs text-gray-700 shadow-xl">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-600">Contact</p>
                <div className="space-y-2">
                  <a href="mailto:liusq9428@163.com" className="block rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                    邮箱：liusq9428@163.com
                  </a>
                  <p className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                    QQ：515107596
                  </p>
                  <a href="https://t.me/liusq_ai" target="_blank" rel="noreferrer" className="block rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
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
