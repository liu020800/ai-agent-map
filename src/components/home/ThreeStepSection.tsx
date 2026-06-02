"use client";

import { motion } from "framer-motion";
import { Map, Shield, Sparkles } from "lucide-react";
import LiquidGlassCard from "@/components/react-bits/LiquidGlassCard";

const ITEMS = [
  { icon: Shield, title: "选择装备", desc: "从 Codex、Claude Code、OpenCode、DeepSeek、豆包里装配你的 AI 阵列。", badge: "Step 01" },
  { icon: Sparkles, title: "选择场景", desc: "声明你是代码 Agent、自动化术士、研究党还是内容创作者。", badge: "Step 02" },
  { icon: Map, title: "生成身份", desc: "拿到专属 Passport，点亮全国 AI 玩家图谱，并进入排行榜阵营。", badge: "Step 03" },
];

export default function ThreeStepSection() {
  return (
    <section className="relative z-10 px-6 py-16">
      <div className="mx-auto max-w-[1200px]">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10 text-center">
          <p className="title-font mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#00ffc8]/60">Three Steps</p>
          <h2 className="title-font text-2xl font-black tracking-wide text-white sm:text-3xl">30 秒完成你的身份扫描</h2>
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
