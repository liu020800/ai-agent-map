"use client";

import { motion } from "framer-motion";

interface SciFiLoaderProps {
  text?: string;
  className?: string;
}

export default function SciFiLoader({ text = "正在扫描 AI 信号...", className = "" }: SciFiLoaderProps) {
  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="relative h-16 w-16">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400" />
        <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className="absolute inset-2 rounded-full border-2 border-indigo-500/20 border-b-indigo-400" />
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute inset-4 rounded-full bg-cyan-500/10" />
      </div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }}
        className="text-sm font-medium text-cyan-300/80">{text}</motion.p>
    </div>
  );
}
