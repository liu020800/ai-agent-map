"use client";

import { motion } from "framer-motion";

interface SciFiLoaderProps {
  text?: string;
  className?: string;
}

export default function SciFiLoader({ text = "正在扫描 AI 信号...", className = "" }: SciFiLoaderProps) {
  return (
    <div className={`flex flex-col items-center gap-6 ${className}`}>
      {/* Radar rings */}
      <div className="relative h-20 w-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-indigo-500/20"
          style={{ borderTopColor: "var(--accent-cyan)" }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="absolute inset-2 rounded-full border border-purple-500/20"
          style={{ borderBottomColor: "var(--accent-purple)" }}
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-5 rounded-full bg-gradient-to-br from-indigo-500/20 to-cyan-500/20"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
        </div>
      </div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 2.5 }}
        className="text-center"
      >
        <p className="text-sm font-medium tracking-wide text-cyan-300/80">{text}</p>
        <div className="mt-2 h-0.5 w-32 mx-auto overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            style={{ width: "60%" }}
          />
        </div>
      </motion.div>
    </div>
  );
}
