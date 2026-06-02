"use client";

import { motion } from "framer-motion";

export default function RadarMapVisual() {
  const rings = [1, 0.75, 0.5, 0.25];
  const nodes = [
    { x: 60, y: 30, label: "北京" },
    { x: 75, y: 45, label: "上海" },
    { x: 65, y: 55, label: "杭州" },
    { x: 55, y: 40, label: "西安" },
    { x: 70, y: 65, label: "深圳" },
    { x: 50, y: 50, label: "成都" },
    { x: 80, y: 35, label: "青岛" },
    { x: 45, y: 60, label: "重庆" },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="absolute w-[320px] h-[320px] rounded-full bg-gradient-to-br from-cyan-500/5 to-[#a855f7]/5 blur-[60px]" />
      <svg viewBox="0 0 200 200" className="w-[300px] h-[300px]">
        {rings.map((scale, i) => (
          <motion.circle
            key={i}
            cx="100" cy="100" r={80 * scale}
            fill="none"
            stroke="rgba(0, 255, 200, 0.12)"
            strokeWidth="0.5"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.2, duration: 1 }}
          />
        ))}
        <line x1="100" y1="20" x2="100" y2="180" stroke="rgba(0, 255, 200, 0.06)" strokeWidth="0.5" />
        <line x1="20" y1="100" x2="180" y2="100" stroke="rgba(0, 255, 200, 0.06)" strokeWidth="0.5" />
        <line x1="43" y1="43" x2="157" y2="157" stroke="rgba(0, 255, 200, 0.04)" strokeWidth="0.3" />
        <line x1="157" y1="43" x2="43" y2="157" stroke="rgba(0, 255, 200, 0.04)" strokeWidth="0.3" />
        <motion.g className="animate-radar-sweep" style={{ transformOrigin: "100px 100px" }}>
          <defs>
            <linearGradient id="sweepGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(0, 255, 200, 0.25)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path d="M100,100 L100,20 A80,80 0 0,1 157,43 Z" fill="url(#sweepGrad)" />
        </motion.g>
        <circle cx="100" cy="100" r="3" fill="#00ffc8" opacity="0.8">
          <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
        </circle>
        {nodes.map((node, i) => {
          const cx = 20 + (node.x / 100) * 160;
          const cy = 20 + (node.y / 100) * 160;
          return (
            <g key={node.label}>
              <circle cx={cx} cy={cy} r="4" fill="none" stroke="#00ffc8" strokeWidth="0.5" opacity="0">
                <animate attributeName="r" values="3;10" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
              </circle>
              <motion.circle cx={cx} cy={cy} r="2.5" fill="#00ffc8"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.9 }}
                transition={{ delay: 0.5 + i * 0.15, duration: 0.5 }}
              />
              <circle cx={cx} cy={cy} r="5" fill="rgba(0, 255, 200, 0.15)">
                <animate attributeName="opacity" values="0.3;0.8;0.3" dur={`${2.5 + i * 0.2}s`} repeatCount="indefinite" />
              </circle>
            </g>
          );
        })}
        <line x1="80" y1="56" x2="124" y2="84" stroke="rgba(0, 255, 200, 0.08)" strokeWidth="0.5" strokeDasharray="2 2">
          <animate attributeName="stroke-opacity" values="0.05;0.15;0.05" dur="3s" repeatCount="indefinite" />
        </line>
        <line x1="124" y1="84" x2="108" y2="100" stroke="rgba(139, 92, 246, 0.08)" strokeWidth="0.5" strokeDasharray="2 2">
          <animate attributeName="stroke-opacity" values="0.05;0.15;0.05" dur="3.5s" repeatCount="indefinite" />
        </line>
        <line x1="108" y1="100" x2="92" y2="88" stroke="rgba(0, 255, 200, 0.06)" strokeWidth="0.5" strokeDasharray="2 2">
          <animate attributeName="stroke-opacity" values="0.04;0.12;0.04" dur="4s" repeatCount="indefinite" />
        </line>
      </svg>
      <motion.div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-[#00ffc8]/20 bg-[#05060a]/80 px-3 py-1.5 backdrop-blur-sm"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5, duration: 0.8 }}>
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
        </span>
        <span className="text-[10px] font-medium text-[#00ffc8]/80 tracking-wider">AI 信号扫描中</span>
      </motion.div>
    </div>
  );
}
