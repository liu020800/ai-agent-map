"use client";

import { motion } from "framer-motion";
import { Map, Shield, Sparkles } from "lucide-react";
import LiquidGlassCard from "@/components/react-bits/LiquidGlassCard";

const ITEMS = [
  { icon: Shield, title: "选择工具", desc: "从 Codex、Claude Code、ChatGPT、DeepSeek、豆包里选择你常用的工具。", badge: "Step 01" },
  { icon: Sparkles, title: "选择用途", desc: "告诉大家你主要用 AI 写代码、做自动化、写内容还是做研究。", badge: "Step 02" },
  { icon: Map, title: "生成身份卡", desc: "拿到一张可保存、可分享的 AI 身份卡，也能进入工具排行统计。", badge: "Step 03" },
];

export default function ThreeStepSection() {
  return (
    <section className="relative z-10 px-6 py-16">
      <div className="mx-auto max-w-[1200px]">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10 text-center">
          <p className="title-font mb-3 text-[10px] font-semibold tracking-[0.18em] text-blue-600">三步完成</p>
          <h2 className="title-font text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">30 秒生成你的 AI 身份卡</h2>
        </motion.div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {ITEMS.map((item, index) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}>
              <LiquidGlassCard className="h-full p-6" mode="standard" blurAmount={0.05} aberrationIntensity={1.2} cornerRadius={24}>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.05]">
                    <item.icon className="h-5 w-5 text-cyan-300/85" />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.22em] text-white/30">{item.badge}</span>
                </div>
                <h3 className="title-font mb-2 text-xl font-black tracking-wider text-white">{item.title}</h3>
                <p className="text-sm leading-7 text-white/45">{item.desc}</p>
              </LiquidGlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
