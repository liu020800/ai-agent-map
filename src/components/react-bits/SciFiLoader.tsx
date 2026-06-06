"use client";

import { motion } from "framer-motion";
import { Radar } from "lucide-react";

export default function SciFiLoader({ text = "雷达已激活，等待信号源...", className = "" }: { text?: string; className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-6 ${className}`}>
      <div className="relative flex h-28 w-28 items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: "linear" }} className="absolute inset-0 rounded-full border border-cyan-300/10" />
        <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 5, ease: "linear" }} className="absolute inset-3 rounded-full border border-cyan-300/12" />
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3.2, ease: "linear" }} className="absolute left-1/2 top-1/2 h-[2px] w-[42%] origin-left -translate-y-1/2 bg-gradient-to-r from-cyan-300/0 via-cyan-300 to-cyan-300/0" />
        <motion.div animate={{ scale: [0.9, 1.08, 0.9], opacity: [0.22, 0.5, 0.22] }} transition={{ repeat: Infinity, duration: 2.2 }} className="absolute inset-7 rounded-full bg-cyan-300/8" />
        <div className="absolute inset-0 rounded-full border border-white/6" />
        <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.04] bg-white/[0.015] backdrop-blur-sm">
          <Radar className="h-5 w-5 text-cyan-300" />
        </div>
      </div>
      <motion.div animate={{ opacity: [0.45, 1, 0.45] }} transition={{ repeat: Infinity, duration: 2.4 }} className="text-center">
        <p className="title-font text-[10px] uppercase tracking-[0.3em] text-cyan-300/72">Signal Scan</p>
        <p className="mt-3 text-sm font-medium tracking-wide text-white/58">{text}</p>
      </motion.div>
    </div>
  );
}
