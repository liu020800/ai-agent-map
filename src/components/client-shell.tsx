"use client";

import Navbar from "@/components/navbar";

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
    </>
  );
}
