"use client";

import { motion } from "framer-motion";

export default function SciFiLoader({ text = "正在扫描 AI 信号...", className = "" }: { text?: string; className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-6 ${className}`}>
      <div className="relative h-20 w-20">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-white/10" style={{ borderTopColor: "#6366f1" }} />
        <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="absolute inset-2 rounded-full border border-white/10" style={{ borderBottomColor: "#8b5cf6" }} />
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }} transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-5 rounded-full bg-white/5" />
        <div className="absolute inset-0 flex items-center justify-center"><div className="h-1.5 w-1.5 rounded-full bg-indigo-400" /></div>
      </div>
      <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2.5 }}
        className="text-sm font-medium tracking-wide text-white/50">{text}</motion.p>
    </div>
  );
}
