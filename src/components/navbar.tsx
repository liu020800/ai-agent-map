"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Trophy, Zap, Shield, TrendingUp, Radar, Menu, X, Moon, Sun } from "lucide-react";

const NAV = [
  { href: "/map", label: "玩家地图", icon: Radar },
  { href: "/ranking", label: "工具排行", icon: Trophy },
  { href: "/trends", label: "使用趋势", icon: TrendingUp },
  { href: "/survey", label: "生成身份卡", icon: Sparkles },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("ai-agent-map-theme");
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const initialTheme = stored === "dark" || stored === "light" ? stored : prefersDark ? "dark" : "light";
    setTheme(initialTheme);
    document.documentElement.classList.toggle("theme-dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("ai-agent-map-theme", nextTheme);
      document.documentElement.classList.toggle("theme-dark", nextTheme === "dark");
    }
  };

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
      initial={false}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="app-card-strong fixed left-0 right-0 top-0 z-50 border-b backdrop-blur-md"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav
          aria-label="主导航"
          className="flex h-16 items-center justify-between"
        >
          <Link href="/" className="group flex items-center gap-3" aria-label="AI Agent Map 首页">
            <div className="app-card-muted relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg transition">
              <Zap className="relative z-10 h-5 w-5" />
            </div>
            <div>
              <p className="app-heading text-sm font-medium tracking-[-0.01em]">AI Agent Map</p>
              <p className="app-soft text-xs">AI 工具栈</p>
            </div>
          </Link>

          <div className="hidden items-stretch gap-1 self-stretch md:flex">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    "relative flex items-center gap-2 px-3 text-sm font-medium transition-colors " +
                    (active ? "app-heading" : "app-muted hover:app-heading")
                  }
                >
                  {active ? (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-x-3 bottom-0 h-0.5 bg-[var(--app-heading)]"
                      transition={{ duration: 0.16 }}
                    />
                  ) : null}
                  <item.icon className="relative h-3.5 w-3.5 text-current" />
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="theme-toggle app-button-secondary flex h-9 w-9 items-center justify-center rounded-lg border transition"
              aria-label={theme === "dark" ? "切换到浅色模式" : "切换到深色模式"}
              title={theme === "dark" ? "浅色模式" : "深色模式"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link href="/survey" className="app-button-primary inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium sm:px-5">
              <Shield className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">生成身份卡</span>
              <span className="sm:hidden">生成</span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className="app-button-secondary flex h-9 w-9 items-center justify-center rounded-lg border transition md:hidden"
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
            className="app-card-strong mx-4 mt-2 overflow-hidden rounded-xl p-2 md:hidden"
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
                        "flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition " +
                        (active
                          ? "app-card-muted app-heading"
                          : "border-transparent app-muted hover:app-card-muted")
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
