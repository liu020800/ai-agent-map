"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, Map, Trophy, Sparkles, Shield } from "lucide-react";

const NAV = [
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
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-auto max-w-[1200px] px-6">
        <nav
          className="mt-4 flex items-center justify-between rounded-2xl border border-white/[0.06] bg-black/60 px-6 py-3.5 backdrop-blur-xl"
          style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)" }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#00ffc8]/20 bg-[#00ffc8]/[0.05] transition-all duration-500 group-hover:border-[#00ffc8]/40 group-hover:shadow-[0_0_20px_rgba(0,255,200,0.15)]">
              <Zap className="h-4 w-4 text-[#00ffc8]" />
            </div>
            <span className="title-font text-sm font-bold text-white tracking-[0.1em]">AI AGENT MAP</span>
          </Link>

          {/* Center nav */}
          <div className="hidden items-center gap-1 sm:flex">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                    active ? "text-[#00ffc8]" : "text-white/40 hover:text-white/70"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-xl border border-[#00ffc8]/15 bg-[#00ffc8]/[0.04]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className="relative h-3.5 w-3.5" />
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* CTA */}
          <Link href="/survey" className="btn-lusion !py-2.5 !px-5 !text-xs">
            <Shield className="h-3.5 w-3.5" />
            <span>启动扫描</span>
          </Link>
        </nav>
      </div>
    </motion.header>
  );
}
