"use client";

import { motion } from "framer-motion";

type Badge = {
  name: string;
  color: string;
  delay: number;
  pos: { top?: string; bottom?: string; left?: string; right?: string };
};

const BADGES: Badge[] = [
  { name: "Codex", color: "#22d3ee", delay: 0, pos: { top: "-4%", right: "-2%" } },
  { name: "Claude Code", color: "#a78bfa", delay: 0.3, pos: { top: "44%", right: "-6%" } },
  { name: "OpenCode", color: "#34d399", delay: 0.6, pos: { bottom: "-2%", right: "4%" } },
  { name: "DeepSeek", color: "#60a5fa", delay: 0.9, pos: { top: "-2%", left: "-4%" } },
];

export default function FloatingToolBadges() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-30 hidden lg:block">
      {BADGES.map((badge, i) => (
        <motion.div
          key={badge.name}
          className="absolute"
          style={badge.pos}
          initial={{ opacity: 0, scale: 0.6, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
          transition={{
            opacity: { delay: 1.4 + badge.delay, duration: 0.5 },
            scale: { delay: 1.4 + badge.delay, duration: 0.5 },
            y: { delay: 1.8 + badge.delay, duration: 3.4 + i * 0.4, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <div
            className="relative flex items-center gap-2 rounded-full border px-3 py-1.5 backdrop-blur-xl"
            style={{
              borderColor: `${badge.color}32`,
              background: `linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03)), ${badge.color}10`,
              boxShadow: `0 0 20px ${badge.color}18`,
            }}
          >
            <span className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,transparent,rgba(255,255,255,.12),transparent)] opacity-80" />
            <div className="relative h-1.5 w-1.5 rounded-full" style={{ background: badge.color, boxShadow: `0 0 10px ${badge.color}` }} />
            <span className="relative whitespace-nowrap text-[10px] font-semibold tracking-[0.12em]" style={{ color: badge.color }}>
              {badge.name}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
