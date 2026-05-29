"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

// Major city coordinates (mapped to SVG viewBox 0-100)
const CITIES = [
  { name: "北京", x: 62, y: 22, size: "lg" },
  { name: "上海", x: 75, y: 42, size: "lg" },
  { name: "广州", x: 65, y: 68, size: "lg" },
  { name: "深圳", x: 67, y: 70, size: "md" },
  { name: "杭州", x: 73, y: 44, size: "md" },
  { name: "成都", x: 42, y: 52, size: "md" },
  { name: "武汉", x: 60, y: 50, size: "md" },
  { name: "西安", x: 48, y: 38, size: "md" },
  { name: "南京", x: 68, y: 40, size: "sm" },
  { name: "重庆", x: 44, y: 54, size: "sm" },
  { name: "天津", x: 64, y: 24, size: "sm" },
  { name: "长沙", x: 58, y: 56, size: "sm" },
  { name: "郑州", x: 56, y: 38, size: "sm" },
  { name: "济南", x: 62, y: 32, size: "sm" },
  { name: "青岛", x: 68, y: 30, size: "sm" },
  { name: "大连", x: 68, y: 20, size: "sm" },
  { name: "沈阳", x: 66, y: 16, size: "sm" },
  { name: "哈尔滨", x: 68, y: 8, size: "sm" },
  { name: "昆明", x: 35, y: 64, size: "sm" },
  { name: "福州", x: 72, y: 54, size: "sm" },
  { name: "厦门", x: 70, y: 58, size: "sm" },
  { name: "合肥", x: 64, y: 42, size: "sm" },
  { name: "太原", x: 54, y: 30, size: "sm" },
  { name: "兰州", x: 38, y: 34, size: "sm" },
  { name: "乌鲁木齐", x: 16, y: 18, size: "sm" },
  { name: "拉萨", x: 22, y: 52, size: "sm" },
];

// Connection lines between nearby cities
const CONNECTIONS = [
  [0, 1], [1, 4], [0, 9], [1, 5], [5, 6], [6, 7], [3, 2], [4, 20],
  [7, 12], [12, 8], [8, 1], [10, 0], [11, 6], [13, 0], [14, 13],
  [15, 16], [16, 17], [18, 5], [19, 1], [2, 19],
];

export default function ChinaSvgMap({ data }: { data?: Array<{ name: string; value: number }> }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const getDataValue = (name: string) => data?.find(d => d.name === name)?.value ?? 0;

  const getSize = (size: string) => {
    if (size === "lg") return { r: 2.2, glow: 6 };
    if (size === "md") return { r: 1.6, glow: 4 };
    return { r: 1.2, glow: 3 };
  };

  return (
    <div className="relative w-full h-full min-h-[300px] flex items-center justify-center">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#00ffc8]/[0.02] via-transparent to-purple-500/[0.02] rounded-2xl" />

      <svg viewBox="0 0 100 90" className="w-full h-full" fill="none">
        {/* Grid underlay */}
        <defs>
          <pattern id="mapGrid" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(0,255,200,0.03)" strokeWidth="0.1" />
          </pattern>
          <radialGradient id="cityGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00ffc8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00ffc8" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="0.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <rect width="100" height="90" fill="url(#mapGrid)" />

        {/* Connection lines */}
        {mounted && CONNECTIONS.map(([a, b], i) => {
          const ca = CITIES[a];
          const cb = CITIES[b];
          return (
            <line key={i} x1={ca.x} y1={ca.y} x2={cb.x} y2={cb.y}
              stroke="#00ffc8" strokeWidth="0.15" strokeOpacity="0.12" strokeDasharray="1 1">
              <animate attributeName="stroke-opacity" values="0.06;0.18;0.06" dur={`${3 + i * 0.3}s`} repeatCount="indefinite" />
            </line>
          );
        })}

        {/* City points */}
        {mounted && CITIES.map((city) => {
          const { r, glow } = getSize(city.size);
          const val = getDataValue(city.name);
          const isHovered = hovered === city.name;
          const dynamicR = val > 0 ? r * (1 + Math.min(val / 50, 1.5)) : r;

          return (
            <g key={city.name} onMouseEnter={() => setHovered(city.name)} onMouseLeave={() => setHovered(null)} style={{ cursor: "pointer" }}>
              {/* Outer glow pulse */}
              <circle cx={city.x} cy={city.y} r={glow} fill="url(#cityGlow)" opacity="0">
                <animate attributeName="r" values={`${glow * 0.6};${glow * 1.2};${glow * 0.6}`} dur={`${2.5 + Math.random() * 2}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.7;0.3" dur={`${2.5 + Math.random() * 2}s`} repeatCount="indefinite" />
              </circle>

              {/* Pulse ring */}
              <circle cx={city.x} cy={city.y} r={r} fill="none" stroke="#00ffc8" strokeWidth="0.2" opacity="0">
                <animate attributeName="r" values={`${r};${r + 3}`} dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0" dur="3s" repeatCount="indefinite" />
              </circle>

              {/* Core dot */}
              <circle cx={city.x} cy={city.y} r={dynamicR}
                fill={isHovered ? "#ff00ff" : "#00ffc8"}
                opacity={isHovered ? 1 : 0.8}
                filter="url(#glow)"
                style={{ transition: "fill 0.3s, opacity 0.3s" }}
              />

              {/* Label on hover */}
              {isHovered && (
                <g>
                  <rect x={city.x - 6} y={city.y - 6} width="12" height="4" rx="0.5"
                    fill="rgba(0,0,0,0.8)" stroke="#00ffc8" strokeWidth="0.15" />
                  <text x={city.x} y={city.y - 3.5} textAnchor="middle" fill="#00ffc8"
                    fontSize="2" fontFamily="Orbitron, sans-serif" fontWeight="600">
                    {city.name}{val > 0 ? ` (${val})` : ""}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Decorative outer ring */}
        <circle cx="50" cy="45" r="42" fill="none" stroke="#00ffc8" strokeWidth="0.08" strokeOpacity="0.06" strokeDasharray="2 3">
          <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="30s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}
