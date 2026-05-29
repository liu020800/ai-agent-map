"use client";

import { motion } from "framer-motion";

const BADGES = [
  { name: "Codex", color: "#00ffc8", delay: 0 },
  { name: "Claude Code", color: "#a78bfa", delay: 0.3 },
  { name: "OpenCode", color: "#34d399", delay: 0.6 },
  { name: "DeepSeek", color: "#60a5fa", delay: 0.9 },
  { name: "豆包", color: "#f472b6", delay: 1.2 },
];

export default function FloatingToolBadges() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {BADGES.map((badge, i) => {
        const positions = [
          { top: "8%", left: "-5%" },
          { top: "2%", right: "-8%" },
          { bottom: "25%", left: "-12%" },
          { bottom: "10%", right: "-10%" },
          { top: "40%", right: "-15%" },
        ];
        const pos = positions[i];

        return (
          <motion.div
            key={badge.name}
            className="absolute pointer-events-auto"
            style={pos}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -6, 0],
            }}
            transition={{
              opacity: { delay: 1.5 + badge.delay, duration: 0.5 },
              scale: { delay: 1.5 + badge.delay, duration: 0.5 },
              y: {
                delay: 2 + badge.delay,
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          >
            <div
              className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 backdrop-blur-sm"
              style={{
                borderColor: `${badge.color}30`,
                background: `${badge.color}08`,
                boxShadow: `0 0 12px ${badge.color}15`,
              }}
            >
              <div
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: badge.color }}
              />
              <span
                className="text-[10px] font-semibold whitespace-nowrap"
                style={{ color: badge.color }}
              >
                {badge.name}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
