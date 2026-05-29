"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, Map, Trophy, Sparkles } from "lucide-react";

const NAV_ITEMS = [
  { href: "/map", label: "信号雷达", icon: Map },
  { href: "/ranking", label: "排行榜", icon: Trophy },
  { href: "/survey", label: "生成身份卡", icon: Sparkles },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-auto max-w-[1200px] px-6">
        <nav className="mt-4 flex items-center justify-between rounded-2xl border border-white/[0.06] bg-[#09090f]/80 px-6 py-3 backdrop-blur-xl">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/20">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white">AI Agent Map</span>
          </Link>

          {/* Nav links - desktop */}
          <div className="hidden items-center gap-1 sm:flex">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}
                  className={`relative flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    active
                      ? "text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`}>
                  {active && (
                    <motion.div layoutId="nav-active"
                      className="absolute inset-0 rounded-xl border border-indigo-500/30 bg-indigo-500/10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                  )}
                  <item.icon className="relative h-3.5 w-3.5" />
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* CTA */}
          <Link href="/survey"
            className="btn-primary !px-4 !py-2 !text-xs !rounded-xl">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">启动扫描</span>
            <span className="sm:hidden">扫描</span>
          </Link>
        </nav>
      </div>
    </motion.header>
  );
}
