"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, Map, Trophy, Sparkles } from "lucide-react";

const NAV = [
  { href: "/map", label: "信号雷达", icon: Map },
  { href: "/ranking", label: "排行榜", icon: Trophy },
  { href: "/survey", label: "生成身份卡", icon: Sparkles },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-[1200px] px-6">
        <nav className="mt-4 flex items-center justify-between rounded-2xl border border-neutral-800 bg-[#0a0a0a]/80 px-6 py-3 backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-neutral-700">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">AI Agent Map</span>
          </Link>
          <div className="hidden items-center gap-1 sm:flex">
            {NAV.map(item => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}
                  className={`relative flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${active ? "text-white" : "text-neutral-500 hover:text-neutral-300"}`}>
                  {active && <motion.div layoutId="nav-active" className="absolute inset-0 rounded-xl border border-neutral-700 bg-white/5" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
                  <item.icon className="relative h-3.5 w-3.5" />
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
          </div>
          <Link href="/survey" className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-black hover:bg-neutral-200 transition-colors">
            启动扫描
          </Link>
        </nav>
      </div>
    </motion.header>
  );
}
