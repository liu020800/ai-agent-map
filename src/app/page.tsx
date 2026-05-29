"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Map, Trophy, Sparkles, Zap, ChevronRight, Shield, Users, Bot, Smartphone, CalendarDays, Scan } from "lucide-react";
import HeroSection from "@/components/home/HeroSection";
import LiquidGlassCard from "@/components/react-bits/LiquidGlassCard";
import CountUp from "@/components/react-bits/CountUp";
import gsap from "gsap";

const CyberBackground = dynamic(() => import("@/components/CyberBackground"), { ssr: false });
const ChinaSvgMap = dynamic(() => import("@/components/ChinaSvgMap"), { ssr: false });

const STATS = [
  { label: "全国 AI 玩家", value: 1280, suffix: "+", icon: Users },
  { label: "Agent 用户", value: 326, suffix: "", icon: Bot },
  { label: "App 用户", value: 954, suffix: "", icon: Smartphone },
  { label: "今日新增", value: 42, suffix: "", icon: CalendarDays },
];

export default function HomePage() {
  const [showScan, setShowScan] = useState(false);
  const scanRef = useRef<HTMLDivElement>(null);
  const scanBtnRef = useRef<HTMLButtonElement>(null);

  const handleScan = () => {
    setShowScan(true);
    if (scanBtnRef.current) {
      gsap.to(scanBtnRef.current, { scale: 0.95, duration: 0.15, yoyo: true, repeat: 1 });
    }
  };

  useEffect(() => {
    if (showScan && scanRef.current) {
      gsap.fromTo(scanRef.current,
        { opacity: 0, y: 60, scale: 0.92, filter: "blur(12px)" },
        { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 1.2, ease: "power4.out" }
      );
    }
  }, [showScan]);

  return (
    <main className="relative min-h-screen">
      <CyberBackground />

      {/* Hero */}
      <HeroSection />

      {/* Scan CTA - with animation flow */}
      <section className="px-6 py-16 relative z-10">
        <div className="mx-auto max-w-[1000px] text-center">
          {!showScan ? (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <button ref={scanBtnRef} onClick={handleScan} className="btn-lusion !text-base !px-16 !py-5">
                <Scan className="h-5 w-5" />
                <span>开始赛博身份扫描</span>
              </button>
              <p className="mt-4 text-[10px] text-white/20 tracking-[0.2em] uppercase font-mono">
                Click to initiate cyber identity scan
              </p>
            </motion.div>
          ) : (
            <div ref={scanRef} className="opacity-0">
              {/* Scan line overlay */}
              <div className="relative overflow-hidden rounded-3xl mb-8">
                <div className="absolute inset-0 pointer-events-none z-20">
                  <motion.div
                    className="absolute inset-x-0 h-1"
                    style={{ background: "linear-gradient(90deg, transparent, #00ffc8, transparent)" }}
                    animate={{ y: ["0%", "800%"] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  />
                </div>

                <LiquidGlassCard mode="shader" blurAmount={0.12} aberrationIntensity={2.5} elasticity={0.28} cornerRadius={32} padding="2.5rem">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Identity preview */}
                    <div>
                      <h3 className="title-font text-2xl font-black text-white mb-6 tracking-wider neon-text">
                        你的 AI 身份档案
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between"><span className="text-white/40">赛博等级</span><span className="text-[#00ffc8] font-bold">L4 · Agent 工作流玩家</span></div>
                        <div className="flex justify-between"><span className="text-white/40">稀有度</span><span className="text-[#a855f7] font-bold">SSR</span></div>
                        <div className="flex justify-between"><span className="text-white/40">战斗力</span><span className="text-white font-bold title-font">8,721</span></div>
                        <div className="flex justify-between"><span className="text-white/40">主力装备</span><span className="text-[#00d4ff] font-bold">Codex + Claude Code</span></div>
                      </div>
                      <Link href="/survey" className="btn-lusion !text-xs !mt-6 inline-flex">
                        <Sparkles className="h-4 w-4" />
                        <span>生成完整身份卡</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>

                    {/* Right: China map */}
                    <div>
                      <h3 className="title-font text-lg font-bold text-white mb-4 tracking-wider">全国 Agent 分布</h3>
                      <div className="h-64 rounded-2xl overflow-hidden border border-white/[0.06] bg-black/30">
                        <ChinaSvgMap />
                      </div>
                    </div>
                  </div>
                </LiquidGlassCard>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Stats with Liquid Glass */}
      <section className="px-6 py-16 relative z-10">
        <div className="mx-auto max-w-[1200px]">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10 text-center">
            <p className="title-font text-[10px] font-semibold tracking-[0.3em] text-[#00ffc8]/60 uppercase mb-3">Live Dashboard</p>
            <h2 className="title-font text-2xl font-black text-white sm:text-3xl tracking-wide">全国 AI 信号总览</h2>
          </motion.div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {STATS.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <LiquidGlassCard className="p-6 text-center" mode="standard" blurAmount={0.06} aberrationIntensity={1.2} cornerRadius={20}>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <stat.icon className="h-4 w-4 text-[#00ffc8]/50" />
                    <p className="text-[10px] text-white/40 tracking-wider uppercase">{stat.label}</p>
                  </div>
                  <div className="flex items-baseline justify-center gap-1">
                    <CountUp to={stat.value} className="text-3xl font-black text-white title-font" duration={2} />
                    {stat.suffix && <span className="text-sm font-bold text-white/30">{stat.suffix}</span>}
                  </div>
                </LiquidGlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Preview */}
      <section className="px-6 py-16 relative z-10">
        <div className="mx-auto max-w-[1200px]">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10 flex items-end justify-between">
            <div>
              <p className="title-font text-[10px] font-semibold tracking-[0.3em] text-[#00ffc8]/60 uppercase mb-3">Signal Map</p>
              <h2 className="title-font text-2xl font-black text-white sm:text-3xl tracking-wide">全国 AI 信号正在点亮</h2>
            </div>
            <Link href="/map" className="hidden items-center gap-1 text-sm text-white/40 hover:text-[#00ffc8] transition-colors sm:flex tracking-wider">
              查看完整地图 <ChevronRight className="h-4 w-4" />
            </Link>
          </motion.div>
          <LiquidGlassCard className="p-3" mode="prominent" blurAmount={0.06} aberrationIntensity={2} cornerRadius={28}>
            <div className="rounded-2xl overflow-hidden bg-black/40 border border-white/[0.04] h-[400px]">
              <ChinaSvgMap />
            </div>
          </LiquidGlassCard>
        </div>
      </section>

      {/* Hot Tools */}
      <section className="px-6 pb-20 relative z-10">
        <div className="mx-auto max-w-[1200px]">
          <HotTools />
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24 relative z-10">
        <div className="mx-auto max-w-[1200px]">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
            <p className="title-font text-[10px] font-semibold tracking-[0.3em] text-[#00ffc8]/60 uppercase mb-3">Core Features</p>
            <h2 className="title-font text-2xl font-black text-white sm:text-3xl tracking-wide">你的 AI 身份系统</h2>
          </motion.div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { href: "/survey", icon: Shield, title: "生成身份卡", desc: "选择你的 AI 工具，生成专属 Agent Passport", color: "#00ffc8" },
              { href: "/map", icon: Map, title: "全国信号地图", desc: "查看全国 AI Agent 用户分布热力图", color: "#00d4ff" },
              { href: "/ranking", icon: Trophy, title: "装备排行榜", desc: "看看哪些 AI 工具最受欢迎", color: "#a855f7" },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link href={item.href} className="block group">
                  <LiquidGlassCard className="p-7 transition-all duration-500" mode="standard" blurAmount={0.06} aberrationIntensity={1.5} cornerRadius={24}>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border transition-all duration-500 mb-4"
                      style={{ borderColor: `${item.color}20`, background: `${item.color}05` }}>
                      <item.icon className="h-6 w-6" style={{ color: item.color }} />
                    </div>
                    <h3 className="title-font text-lg font-bold text-white mb-2 tracking-wider">{item.title}</h3>
                    <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
                  </LiquidGlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-32 pt-8 relative z-10">
        <div className="mx-auto max-w-[700px]">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <LiquidGlassCard className="p-14" mode="shader" blurAmount={0.1} aberrationIntensity={2.5} cornerRadius={32}>
              <h2 className="title-font text-2xl font-black text-white mb-4 tracking-wider sm:text-3xl">准备好扫描你的 AI 身份了吗？</h2>
              <p className="text-white/40 mb-8 text-sm tracking-wide">只需 30 秒，生成你的 Agent 身份卡</p>
              <Link href="/survey" className="btn-lusion">
                <Sparkles className="h-5 w-5" />
                <span>开始扫描</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-6 text-[10px] text-white/20 tracking-[0.2em] uppercase font-mono">No Login · 30 Seconds · Shareable</p>
            </LiquidGlassCard>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

function HotTools() {
  const [tools, setTools] = useState<Array<{ name: string; count: number }>>([]);
  useEffect(() => {
    fetch("/api/ranking").then((r) => r.json()).then((j) => setTools(j.tools?.slice(0, 10) ?? [])).catch(() => {});
  }, []);
  if (tools.length === 0) return null;
  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
        <p className="title-font text-[10px] font-semibold tracking-[0.3em] text-[#00ffc8]/60 uppercase mb-3">Top Equipment</p>
        <h2 className="title-font text-2xl font-black text-white sm:text-3xl tracking-wide">热门装备榜</h2>
      </motion.div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {tools.map((tool, i) => (
          <motion.div key={tool.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
            <LiquidGlassCard className="p-4" mode="standard" blurAmount={0.04} aberrationIntensity={1} cornerRadius={16}>
              <div className="flex items-center justify-between mb-3">
                <span className={`flex h-6 w-6 items-center justify-center rounded-md title-font text-[11px] font-bold ${i < 3 ? "bg-[#00ffc8]/10 text-[#00ffc8]" : "bg-white/5 text-white/30"}`}>{i + 1}</span>
                {i < 3 && <Zap className="h-3.5 w-3.5 text-[#00ffc8]" />}
              </div>
              <p className="text-sm font-bold text-white mb-1 truncate">{tool.name}</p>
              <p className="text-xs text-white/40"><span className="text-lg font-black text-white title-font">{tool.count}</span> 人使用</p>
            </LiquidGlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
