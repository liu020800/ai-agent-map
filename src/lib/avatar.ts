// Multi-template deterministic avatar generator.
// Renders 1 of 6 visual styles (cyber / retro / neon / holographic / glitch / mystic)
// chosen by seed hash. Each template is multi-layer SVG with gradients, glow,
// and subtle SMIL animations. Color theme is influenced by primary AI tool and
// user level.

export const AVATAR_TEMPLATES = ["cyber", "retro", "neon", "holographic", "glitch", "mystic"] as const;
export type AvatarTemplate = (typeof AVATAR_TEMPLATES)[number];

export const AVATAR_TEMPLATE_LABELS: Record<AvatarTemplate, string> = {
  cyber: "Cyber Grid",
  retro: "Retro Pixel",
  neon: "Neon Pulse",
  holographic: "Holographic",
  glitch: "Glitch Core",
  mystic: "Mystic Rune",
};

const TOOL_COLORS: Record<string, string> = {
  Codex: "#22d3ee",
  "Claude Code": "#a855f7",
  OpenCode: "#00ffc8",
  DeepSeek: "#3b82f6",
  豆包: "#f59e0b",
  n8n: "#ec4899",
  Dify: "#10b981",
  Cursor: "#8b5cf6",
  Windsurf: "#06b6d4",
  Copilot: "#6366f1",
  Kimi: "#fb7185",
  Qwen: "#84cc16",
};

const ACCENT_PALETTE = ["#22d3ee", "#a855f7", "#ec4899", "#fbbf24", "#10b981", "#00ffc8", "#3b82f6", "#f97316"];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function rng(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function pickTemplate(seed: string): AvatarTemplate {
  return AVATAR_TEMPLATES[hashCode(seed) % AVATAR_TEMPLATES.length];
}

function toolAccent(tool?: string): string {
  if (tool && TOOL_COLORS[tool]) return TOOL_COLORS[tool];
  return "#22d3ee";
}

function paletteAccent(hash: number): string {
  return ACCENT_PALETTE[hash % ACCENT_PALETTE.length];
}

function uniqueId(seed: number, suffix: string): string {
  return `av${seed.toString(36).slice(0, 6)}-${suffix}`;
}

function sharedDefs(id: string, accent: string, accent2: string): string {
  return `
    <defs>
      <radialGradient id="bg-${id}" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stop-color="${accent}" stop-opacity="0.32"/>
        <stop offset="60%" stop-color="${accent2}" stop-opacity="0.12"/>
        <stop offset="100%" stop-color="#05060a" stop-opacity="0.95"/>
      </radialGradient>
      <linearGradient id="grad-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${accent}"/>
        <stop offset="100%" stop-color="${accent2}"/>
      </linearGradient>
      <linearGradient id="grad2-${id}" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${accent2}"/>
        <stop offset="100%" stop-color="${accent}"/>
      </linearGradient>
      <filter id="glow-${id}" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.4" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="softGlow-${id}" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="6" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <rect width="256" height="256" fill="url(#bg-${id})" rx="22"/>
    <rect x="0.5" y="0.5" width="255" height="255" fill="none" stroke="${accent}" stroke-opacity="0.18" stroke-width="1" rx="22"/>
  `;
}

function cyberGrid(rand: () => number, accent: string, accent2: string, id: string): string {
  const traces: string[] = [];
  for (let i = 0; i < 9; i++) {
    const x1 = 20 + Math.floor(rand() * 216);
    const y1 = 20 + Math.floor(rand() * 216);
    const horizontal = rand() > 0.5;
    const len = 24 + Math.floor(rand() * 60);
    const x2 = horizontal ? Math.min(236, x1 + len) : x1;
    const y2 = horizontal ? y1 : Math.min(236, y1 + len);
    traces.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${accent}" stroke-width="1.5" stroke-opacity="0.55" stroke-linecap="round"/>`);
    traces.push(`<circle cx="${x2}" cy="${y2}" r="3" fill="${accent}" filter="url(#glow-${id})"/>`);
    if (i % 3 === 0) traces.push(`<rect x="${x2 - 2}" y="${y2 - 2}" width="4" height="4" fill="${accent2}"/>`);
  }
  return `
    ${sharedDefs(id, accent, accent2)}
    ${traces.join("\n    ")}
    <g filter="url(#softGlow-${id})">
      <circle cx="128" cy="128" r="48" fill="none" stroke="url(#grad-${id})" stroke-width="1" stroke-opacity="0.45"/>
    </g>
    <g filter="url(#glow-${id})">
      <circle cx="128" cy="128" r="26" fill="none" stroke="url(#grad-${id})" stroke-width="2.5">
        <animate attributeName="r" values="26;36;26" dur="3s" repeatCount="indefinite"/>
        <animate attributeName="stroke-opacity" values="1;0.45;1" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="128" cy="128" r="12" fill="url(#grad-${id})">
        <animate attributeName="opacity" values="0.9;1;0.9" dur="1.8s" repeatCount="indefinite"/>
      </circle>
    </g>
    <circle cx="128" cy="128" r="86" fill="none" stroke="${accent}" stroke-width="0.6" stroke-opacity="0.35" stroke-dasharray="3 9">
      <animateTransform attributeName="transform" type="rotate" from="0 128 128" to="360 128 128" dur="22s" repeatCount="indefinite"/>
    </circle>
    <circle cx="128" cy="128" r="100" fill="none" stroke="${accent2}" stroke-width="0.4" stroke-opacity="0.3" stroke-dasharray="2 14">
      <animateTransform attributeName="transform" type="rotate" from="360 128 128" to="0 128 128" dur="30s" repeatCount="indefinite"/>
    </circle>
  `;
}

function retroPixel(rand: () => number, accent: string, accent2: string, id: string): string {
  const size = 16;
  const cell = 256 / size;
  const cells: string[] = [];
  const cx = size / 2;
  const cy = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx + 0.5;
      const dy = y - cy + 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 7) continue;
      const r = rand();
      if (r > 0.42) {
        const useAccent2 = rand() > 0.65;
        const isCore = dist < 3.2;
        const opacity = isCore ? 1 : 0.55 + rand() * 0.35;
        cells.push(`<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" fill="${useAccent2 ? accent2 : accent}" opacity="${opacity.toFixed(2)}"/>`);
      }
    }
  }
  return `
    ${sharedDefs(id, accent, accent2)}
    <g shape-rendering="crispEdges">${cells.join("")}</g>
    <rect x="22" y="22" width="212" height="212" fill="none" stroke="${accent}" stroke-width="2" stroke-opacity="0.5" rx="3"/>
    <rect x="30" y="30" width="196" height="196" fill="none" stroke="${accent2}" stroke-width="0.6" stroke-opacity="0.4" rx="2"/>
    <g filter="url(#glow-${id})">
      <rect x="116" y="116" width="24" height="24" fill="${accent}">
        <animate attributeName="fill" values="${accent};${accent2};${accent}" dur="2.5s" repeatCount="indefinite"/>
      </rect>
    </g>
  `;
}

function neonPulse(rand: () => number, accent: string, accent2: string, id: string): string {
  const rings: string[] = [];
  for (let i = 0; i < 6; i++) {
    const r = 24 + i * 18 + Math.floor(rand() * 6);
    const stroke = i % 2 ? accent : accent2;
    const opacity = (0.75 - i * 0.1).toFixed(2);
    const dur = (3 + i * 0.4).toFixed(1);
    rings.push(`<circle cx="128" cy="128" r="${r}" fill="none" stroke="${stroke}" stroke-width="${i === 0 ? 2.5 : 1.4}" stroke-opacity="${opacity}">
      <animate attributeName="r" values="${r};${r + 6};${r}" dur="${dur}s" repeatCount="indefinite"/>
      <animate attributeName="stroke-opacity" values="${opacity};${(Number(opacity) * 0.3).toFixed(2)};${opacity}" dur="${dur}s" repeatCount="indefinite"/>
    </circle>`);
  }
  const sparks: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const r = 110;
    const sx = 128 + Math.cos(a) * r;
    const sy = 128 + Math.sin(a) * r;
    sparks.push(`<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="2.4" fill="${i % 2 ? accent : accent2}" filter="url(#glow-${id})"/>`);
  }
  return `
    ${sharedDefs(id, accent, accent2)}
    ${rings.join("\n    ")}
    ${sparks.join("\n    ")}
    <g filter="url(#softGlow-${id})">
      <circle cx="128" cy="128" r="22" fill="url(#grad-${id})">
        <animate attributeName="r" values="22;28;22" dur="1.8s" repeatCount="indefinite"/>
      </circle>
    </g>
    <circle cx="128" cy="128" r="6" fill="#ffffff" opacity="0.95"/>
  `;
}

function holographic(rand: () => number, accent: string, accent2: string, id: string): string {
  const lines: string[] = [];
  for (let i = 0; i < 14; i++) {
    const y = 18 + i * 16;
    const offset = rand() * 20;
    lines.push(`<line x1="${-20 + offset}" y1="${y}" x2="${260 + offset}" y2="${y}" stroke="url(#grad-${id})" stroke-width="0.8" opacity="${(0.2 + rand() * 0.5).toFixed(2)}">
      <animate attributeName="x1" values="${-40 + offset};${40 + offset};${-40 + offset}" dur="${3 + (i % 4) * 0.6}s" repeatCount="indefinite"/>
      <animate attributeName="x2" values="${260 + offset};${180 + offset};${260 + offset}" dur="${3 + (i % 4) * 0.6}s" repeatCount="indefinite"/>
    </line>`);
  }
  return `
    ${sharedDefs(id, accent, accent2)}
    <rect x="0" y="0" width="256" height="256" fill="url(#bg-${id})" rx="22"/>
    ${lines.join("\n    ")}
    <g filter="url(#softGlow-${id})">
      <polygon points="128,42 214,128 128,214 42,128" fill="none" stroke="url(#grad-${id})" stroke-width="2.5" stroke-linejoin="round">
        <animateTransform attributeName="transform" type="rotate" from="0 128 128" to="360 128 128" dur="14s" repeatCount="indefinite"/>
      </polygon>
    </g>
    <polygon points="128,72 184,128 128,184 72,128" fill="none" stroke="url(#grad2-${id})" stroke-width="1.5" opacity="0.7">
      <animateTransform attributeName="transform" type="rotate" from="360 128 128" to="0 128 128" dur="10s" repeatCount="indefinite"/>
    </polygon>
    <circle cx="128" cy="128" r="8" fill="#ffffff" filter="url(#glow-${id})"/>
  `;
}

function glitchCore(rand: () => number, accent: string, accent2: string, id: string): string {
  const slices: string[] = [];
  for (let i = 0; i < 7; i++) {
    const y = 60 + i * 22;
    const offset = (rand() - 0.5) * 40;
    const sliceColor = i % 2 ? accent : accent2;
    const w = 120 + rand() * 60;
    slices.push(`<rect x="${(128 - w / 2).toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="14" fill="${sliceColor}" opacity="${(0.5 + rand() * 0.4).toFixed(2)}" transform="translate(${offset.toFixed(1)},0)">
      <animate attributeName="x" values="${(128 - w / 2 + offset).toFixed(1)};${(128 - w / 2 - offset).toFixed(1)};${(128 - w / 2 + offset).toFixed(1)}" dur="${(0.6 + i * 0.15).toFixed(2)}s" repeatCount="indefinite"/>
    </rect>`);
  }
  const xLines: string[] = [];
  for (let i = 0; i < 4; i++) {
    const y = 40 + i * 50;
    xLines.push(`<line x1="0" y1="${y}" x2="256" y2="${y}" stroke="${i % 2 ? accent : accent2}" stroke-width="0.4" opacity="0.45"/>`);
  }
  return `
    ${sharedDefs(id, accent, accent2)}
    ${xLines.join("\n    ")}
    ${slices.join("\n    ")}
    <g filter="url(#softGlow-${id})">
      <circle cx="128" cy="128" r="28" fill="none" stroke="#ffffff" stroke-width="2">
        <animate attributeName="stroke-opacity" values="1;0.3;1" dur="0.4s" repeatCount="indefinite"/>
      </circle>
    </g>
    <circle cx="128" cy="128" r="14" fill="${accent}" filter="url(#glow-${id})"/>
  `;
}

function mysticRune(rand: () => number, accent: string, accent2: string, id: string): string {
  const sides = 6;
  const points: string[] = [];
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
    const r = 78 + rand() * 10;
    points.push(`${(128 + Math.cos(a) * r).toFixed(1)},${(128 + Math.sin(a) * r).toFixed(1)}`);
  }
  const innerPoints: string[] = [];
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2 - Math.PI / 2 + Math.PI / sides;
    const r = 40 + rand() * 8;
    innerPoints.push(`${(128 + Math.cos(a) * r).toFixed(1)},${(128 + Math.sin(a) * r).toFixed(1)}`);
  }
  const particles: string[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const r = 100;
    const dur = 7 + (i % 3);
    particles.push(`<circle cx="${(128 + Math.cos(a) * r).toFixed(1)}" cy="${(128 + Math.sin(a) * r).toFixed(1)}" r="2.6" fill="${i % 2 ? accent : accent2}" filter="url(#glow-${id})">
      <animateTransform attributeName="transform" type="rotate" from="0 128 128" to="360 128 128" dur="${dur}s" repeatCount="indefinite"/>
    </circle>`);
  }
  return `
    ${sharedDefs(id, accent, accent2)}
    ${particles.join("\n    ")}
    <polygon points="${points.join(" ")}" fill="none" stroke="url(#grad-${id})" stroke-width="2" stroke-linejoin="round" filter="url(#glow-${id})"/>
    <polygon points="${innerPoints.join(" ")}" fill="none" stroke="${accent2}" stroke-width="1.4" stroke-linejoin="round" opacity="0.85"/>
    <circle cx="128" cy="128" r="92" fill="none" stroke="${accent}" stroke-width="0.5" stroke-dasharray="2 6" opacity="0.5"/>
    <g filter="url(#softGlow-${id})">
      <circle cx="128" cy="128" r="14" fill="url(#grad-${id})">
        <animate attributeName="r" values="14;18;14" dur="2.2s" repeatCount="indefinite"/>
      </circle>
    </g>
    <circle cx="128" cy="128" r="4" fill="#ffffff"/>
  `;
}

const TEMPLATE_RENDERERS: Record<AvatarTemplate, (rand: () => number, accent: string, accent2: string, id: string) => string> = {
  cyber: cyberGrid,
  retro: retroPixel,
  neon: neonPulse,
  holographic,
  glitch: glitchCore,
  mystic: mysticRune,
};

export function getAvatarTemplate(seed: string): AvatarTemplate {
  return pickTemplate(seed);
}

export function generateAvatarSvg(seed: string, size = 256, level = 1, primaryTool?: string): string {
  const hash = hashCode(seed || "agent");
  const rand = rng(hash);
  const template = pickTemplate(seed || "agent");
  const accent = toolAccent(primaryTool);
  const accent2 = paletteAccent(hash ^ (level * 7));
  const id = uniqueId(hash, template);
  const body = TEMPLATE_RENDERERS[template](rand, accent, accent2, id);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 256 256" data-template="${template}">${body}</svg>`;
}

export function generateCardSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let slug = "";
  for (let i = 0; i < 8; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
}
