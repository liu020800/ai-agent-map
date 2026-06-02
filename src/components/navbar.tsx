"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Trophy, Zap, Shield, TrendingUp, Radar, Menu, X } from "lucide-react";

const NAV = [
  { href: "/map", label: "信号雷达", icon: Radar },
  { href: "/ranking", label: "排行榜", icon: Trophy },
  { href: "/trends", label: "趋势战场", icon: TrendingUp },
  { href: "/survey", label: "生成身份卡", icon: Sparkles },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Close menu when route changes.
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <motion.header
      initial={{ y: -18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed left-0 right-0 top-0 z-50"
    >
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <nav
          aria-label="主导航"
          className="mt-4 flex items-center justify-between rounded-[26px] border border-white/[0.09] bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] px-4 py-3.5 backdrop-blur-2xl sm:px-6"
          style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(34,211,238,0.04)" }}
        >
          <Link href="/" className="group flex items-center gap-3" aria-label="AI Agent Map 首页">
            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-cyan-300/20 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.18),transparent_38%),linear-gradient(135deg,rgba(34,211,238,.18),rgba(139,92,246,.18))] transition-all duration-500 group-hover:border-cyan-300/40 group-hover:shadow-[0_0_28px_rgba(34,211,238,0.18)]">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent,rgba(255,255,255,.12),transparent)] opacity-70" />
              <Zap className="relative z-10 h-5 w-5 text-cyan-300" />
            </div>
            <div>
              <p className="title-font text-sm font-black tracking-[0.2em] text-white">AI AGENT MAP</p>
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">Identity Scanner</p>
            </div>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    "relative flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors " +
                    (active ? "text-cyan-300" : "text-white/55 hover:text-white/88")
                  }
                >
                  {active ? (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06]"
                      transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    />
                  ) : null}
                  <item.icon className="relative h-3.5 w-3.5" />
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/survey" className="btn-lusion !px-4 !py-2.5 !text-[11px] sm:!px-5">
              <Shield className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">启动扫描</span>
              <span className="sm:hidden">扫描</span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.04] bg-white/[0.015] text-white/70 transition hover:border-cyan-300/30 hover:text-cyan-300 md:hidden"
              aria-label={open ? "关闭菜单" : "打开菜单"}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              {open ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="mx-4 mt-2 overflow-hidden rounded-[24px] border border-white/[0.09] bg-[linear-gradient(180deg,rgba(7,10,18,0.92),rgba(7,10,18,0.82))] p-3 backdrop-blur-2xl md:hidden"
            style={{ boxShadow: "0 18px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)" }}
          >
            <ul className="flex flex-col gap-1">
              {NAV.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={
                        "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition " +
                        (active
                          ? "border-cyan-300/20 bg-cyan-300/[0.06] text-cyan-300"
                          : "border-white/[0.04] bg-white/[0.01] text-white/72 hover:border-white/[0.08] hover:text-white")
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
