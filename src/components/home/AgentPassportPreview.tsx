"use client";

import { motion } from "framer-motion";
import { Shield, Swords, MapPin, Star, Zap } from "lucide-react";

export default function AgentPassportPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ delay: 0.8, duration: 1, type: "spring" }}
      className="relative"
      style={{ perspective: "1000px" }}
    >
      {/* Glow behind card */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-purple-500/10 to-pink-500/10 blur-[40px] scale-110" />

      <div className="relative w-[280px] rounded-2xl border border-white/10 bg-[#0a0a0f]/90 backdrop-blur-xl overflow-hidden">
        {/* Scan line effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-scan-line" />
        </div>

        {/* Header */}
        <div className="relative px-5 pt-5 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-gradient-to-br from-[#00ffc8] to-[#a855f7] flex items-center justify-center">
                <Shield className="h-3 w-3 text-white" />
              </div>
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#00ffc8]/80">AI AGENT PASSPORT</span>
            </div>
            <span className="text-[9px] font-mono text-neutral-600">#0001024</span>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
        </div>

        {/* Avatar + Info */}
        <div className="px-5 pb-3">
          <div className="flex items-center gap-4">
            {/* Pixel avatar placeholder */}
            <div className="relative h-16 w-16 flex-shrink-0">
              <div className="h-full w-full rounded-xl bg-gradient-to-br from-cyan-500/20 to-[#a855f7]/20 border border-white/10 flex items-center justify-center overflow-hidden">
                <svg width="48" height="48" viewBox="0 0 8 8">
                  <rect x="2" y="1" width="4" height="3" fill="#00ffc8" rx="0.5" />
                  <rect x="1" y="4" width="6" height="3" fill="#8b5cf6" rx="0.5" />
                  <rect x="3" y="2" width="0.8" height="0.8" fill="#05060a" />
                  <rect x="4.2" y="2" width="0.8" height="0.8" fill="#05060a" />
                  <rect x="3" y="5" width="2" height="0.5" fill="#05060a" rx="0.2" />
                </svg>
              </div>
              {/* Level badge */}
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-[#0a0a0f] flex items-center justify-center">
                <span className="text-[8px] font-black text-white">4</span>
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">Agent_0x3F</p>
              <p className="text-[10px] text-[#00ffc8] font-medium">L4 Agent 工作流玩家</p>
              <div className="mt-1 flex items-center gap-1">
                <Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />
                <span className="text-[9px] font-bold text-amber-400">SSR</span>
                <span className="text-[9px] text-neutral-600 ml-1">稀有度</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="px-5 pb-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2 text-center">
              <p className="text-[8px] text-neutral-600 mb-0.5">战斗力</p>
              <p className="text-sm font-black text-white">8,721</p>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2 text-center">
              <p className="text-[8px] text-neutral-600 mb-0.5">装备数</p>
              <p className="text-sm font-black text-white">6</p>
            </div>
          </div>
        </div>

        {/* Tools */}
        <div className="px-5 pb-3">
          <p className="text-[8px] text-neutral-600 mb-1.5 flex items-center gap-1">
            <Swords className="h-2.5 w-2.5" /> 已装备
          </p>
          <div className="flex flex-wrap gap-1">
            {["Codex", "Claude Code", "OpenCode"].map((tool) => (
              <span key={tool} className="rounded-md border border-[#00ffc8]/20 bg-cyan-500/5 px-2 py-0.5 text-[9px] font-medium text-[#00ffc8]/80">
                {tool}
              </span>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="px-5 pb-4">
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-500">
            <MapPin className="h-2.5 w-2.5" />
            <span>上海</span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-[#00ffc8]" />
            <span className="text-[8px] text-neutral-600">liusq.icu</span>
          </div>
          <div className="h-6 w-6 rounded bg-white/5 border border-white/10 flex items-center justify-center">
            <span className="text-[7px] text-neutral-600">QR</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
