"use client";

import LocalQrCode from "@/components/local-qr-code";
import { motion } from "framer-motion";
import { Shield, Swords, MapPin, Star, Radio } from "lucide-react";

const LOADOUT = ["Codex", "Claude Code", "OpenCode"];

export default function AgentPassportPreview() {
  return (
    <motion.div
      initial={false}
      whileHover={{ scale: 1.015, rotateX: 2, rotateY: -2 }}
      transition={{ type: "spring", stiffness: 160, damping: 18 }}
      className="relative"
      style={{ perspective: "1200px" }}
    >
      <div className="relative overflow-hidden rounded-[24px] border border-neutral-800 bg-[#08090e]/90">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015))]" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,255,200,0.14),transparent_32%),radial-gradient(circle_at_0%_100%,rgba(168,85,247,0.16),transparent_28%)]" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-x-0 h-[2px] animate-scan-line bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent" />
          <div className="absolute inset-y-0 left-[12%] w-px bg-gradient-to-b from-transparent via-white/12 to-transparent" />
          <div className="absolute inset-y-0 right-[16%] w-px bg-gradient-to-b from-transparent via-white/8 to-transparent" />
        </div>

        <div className="relative px-5 pb-5 pt-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-neutral-800">
                  <Shield className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-[10px] font-black tracking-[0.18em] text-[#00ffc8]/85">AI 身份卡预览</span>
              </div>
              <p className="text-[10px] tracking-[0.12em] text-white/35">记录工具栈 · 可下载分享</p>
            </div>
            <div className="rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-1 text-[10px] font-black text-amber-300">
              SSR
            </div>
          </div>

          <div className="mb-4 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

          <div className="grid grid-cols-[78px_1fr] gap-4">
            <div className="relative h-[92px] w-[78px] overflow-hidden rounded-[20px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(0,255,200,0.18),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.18),transparent_45%)]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg width="54" height="54" viewBox="0 0 8 8">
                  <rect x="2" y="1" width="4" height="3" fill="#00ffc8" rx="0.5" />
                  <rect x="1" y="4" width="6" height="3" fill="#8b5cf6" rx="0.5" />
                  <rect x="3" y="2" width="0.8" height="0.8" fill="#05060a" />
                  <rect x="4.2" y="2" width="0.8" height="0.8" fill="#05060a" />
                  <rect x="3" y="5" width="2" height="0.5" fill="#05060a" rx="0.2" />
                </svg>
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#08090e] bg-neutral-700">
                <span className="text-[9px] font-black text-white">4</span>
              </div>
            </div>

            <div className="min-w-0">
              <p className="truncate title-font text-lg font-black text-white">Agent_0x3F</p>
              <p className="mt-1 text-[11px] font-semibold tracking-[0.14em] text-[#00ffc8]">L4 Agent 工作流玩家</p>
              <div className="mt-2 flex items-center gap-1.5">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="text-[10px] font-bold text-amber-300">稀有度 SSR</span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[10px] text-white/38">
                <Radio className="h-3 w-3 text-[#00ffc8]/70" />
                <span>已加入全国玩家地图</span>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl border border-white/[0.04] bg-white/[0.015] p-3 text-center">
              <p className="mb-1 text-[9px] uppercase tracking-[0.22em] text-white/28">战斗力</p>
              <p className="title-font text-base font-black text-white">8,721</p>
            </div>
            <div className="rounded-2xl border border-white/[0.04] bg-white/[0.015] p-3 text-center">
              <p className="mb-1 text-[9px] uppercase tracking-[0.22em] text-white/28">编号</p>
              <p className="title-font text-base font-black text-white">#0001024</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/[0.04] bg-white/[0.015] p-3.5">
            <p className="mb-2 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.22em] text-white/32">
              <Swords className="h-3 w-3 text-[#00ffc8]/70" />
              常用工具
            </p>
            <div className="flex flex-wrap gap-1.5">
              {LOADOUT.map((tool) => (
                <span key={tool} className="rounded-full border border-[#00ffc8]/20 bg-[#00ffc8]/[0.06] px-2.5 py-1 text-[10px] font-medium text-[#00ffc8]/90">
                  {tool}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] text-white/55">
              <MapPin className="h-3.5 w-3.5 text-[#00d4ff]" />
              <span>上海 · 中国</span>
            </div>
            <div className="overflow-hidden rounded-xl border border-white/[0.04] bg-white p-1">
              <LocalQrCode value="https://liusq.icu/survey" size={36} className="h-9 w-9" />
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-[#00ffc8]/12 bg-[#00ffc8]/[0.04] px-3 py-2.5 text-[10px] uppercase tracking-[0.2em] text-[#00ffc8]/75">
            liusq.icu · 全民 Agent 身份图谱
          </div>
        </div>
      </div>
    </motion.div>
  );
}
