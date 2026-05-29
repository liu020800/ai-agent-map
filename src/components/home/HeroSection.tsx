"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Map, Shield, Users, Bot, Smartphone, CalendarDays } from "lucide-react";
import DecryptedText from "@/components/react-bits/DecryptedText";
import CountUp from "@/components/react-bits/CountUp";
import LiquidGlassCard from "@/components/react-bits/LiquidGlassCard";
import AgentPassportPreview from "./AgentPassportPreview";
import FloatingToolBadges from "./FloatingToolBadges";
import gsap from "gsap";

const STATS = [
  { label: "全国 AI 玩家", value: 1280, suffix: "+", icon: Users },
  { label: "Agent 用户", value: 326, suffix: "", icon: Bot },
  { label: "App 用户", value: 954, suffix: "", icon: Smartphone },
  { label: "今日新增", value: 42, suffix: "", icon: CalendarDays },
];

export default function HeroSection() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.from(titleRef.current, { y: 80, opacity: 0, duration: 1.4, delay: 0.5 })
      .from(subtitleRef.current, { y: 40, opacity: 0, duration: 1 }, "-=0.8")
      .from(ctaRef.current, { y: 30, opacity: 0, scale: 0.95, duration: 0.8 }, "-=0.6");
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden z-10">
      <div className="relative mx-auto w-full max-w-[1200px] px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-16 lg:gap-8 items-center">

          {/* Left: Content */}
          <div className="flex flex-col gap-8">
            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="inline-flex items-center gap-3 rounded-full border border-white/[0.06] bg-white/[0.02] px-5 py-2.5 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00ffc8] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00ffc8]" />
                </span>
                <DecryptedText
                  text="AI AGENT IDENTITY SYSTEM"
                  speed={30}
                  className="text-[11px] font-semibold tracking-[0.3em] text-[#00ffc8]/80"
                  encryptedClassName="text-neutral-700"
                  animateOn="view"
                />
              </div>
            </motion.div>

            {/* Title - Lusion style */}
            <div ref={titleRef}>
              <h1 className="title-font leading-[0.92] tracking-[0.04em]" style={{ fontSize: "clamp(36px, 5.5vw, 68px)" }}>
                <span className="block font-black text-white mb-2">你是 AI 聊天用户</span>
                <span className="block font-black text-white/60 mb-2" style={{ fontSize: "0.65em" }}>还是</span>
                <span className="block font-black glitch neon-text" style={{ color: "#00ffc8" }}>
                  Agent 玩家？
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <p ref={subtitleRef} className="max-w-[460px] text-lg leading-relaxed text-white/40">
              生成你的专属 AI 身份卡，点亮全国 AI Agent 用户地图，加入赛博纪元。
            </p>

            {/* CTA Buttons */}
            <div ref={ctaRef} className="flex flex-col gap-4 sm:flex-row">
              <Link href="/survey" className="btn-lusion">
                <Shield className="h-5 w-5" />
                <span>启动身份扫描</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/map" className="btn-lusion-outline">
                <Map className="h-5 w-5" />
                <span>查看全国图谱</span>
              </Link>
            </div>

            {/* Trust bar */}
            <p className="text-xs text-white/20 tracking-[0.2em] font-mono uppercase">
              No Login Required · 30 Sec Scan · Downloadable Card
            </p>

            {/* Stats - Liquid Glass */}
            <div ref={statsRef} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
              {STATS.map((stat) => (
                <LiquidGlassCard
                  key={stat.label}
                  className="p-4"
                  mode="standard"
                  blurAmount={0.04}
                  aberrationIntensity={1}
                  cornerRadius={16}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className="h-3.5 w-3.5 text-[#00ffc8]/40" />
                    <p className="text-[9px] text-white/30 tracking-wider uppercase">{stat.label}</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <CountUp to={stat.value} className="text-xl font-black text-white title-font" duration={2} />
                    {stat.suffix && <span className="text-xs font-bold text-white/20">{stat.suffix}</span>}
                  </div>
                </LiquidGlassCard>
              ))}
            </div>
          </div>

          {/* Right: Visual */}
          <div className="relative hidden lg:flex items-center justify-center min-h-[500px]">
            <div className="relative z-10">
              <LiquidGlassCard mode="prominent" blurAmount={0.08} aberrationIntensity={2} elasticity={0.25} cornerRadius={28} padding="1.5rem">
                <AgentPassportPreview />
              </LiquidGlassCard>
            </div>
            <FloatingToolBadges />
          </div>
        </div>
      </div>
    </section>
  );
}
