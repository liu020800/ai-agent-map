"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Crown, Flame, MapPin, Radio, Shield, Sparkles, Swords, Trophy, TrendingUp, Users,
  Target, Zap, ArrowRight, Award, Medal, Star, Code, Cpu, Network, BookOpen,
  FileText, Brain, Activity, ChevronRight, Gem, Hash
} from "lucide-react";
import CountUp from "@/components/react-bits/CountUp";
import { PageShell, Section } from "@/components/ui";
import { DataNotice } from "@/components/workbench";
import { toolColor } from "@/data/mock";
import { fetchLatestCards, fetchRanking, type LatestCard, type RankingData } from "@/lib/api-client";

type ToolRank = { id: string; name: string; category: string; users: number; heat: number; growthRate: number };
type CityRank = { id: string; city: string; province: string; users: number; topRole: string; topTool: string; growthRate: number };
type ProvinceRank = { id: string; province: string; users: number; cityCount: number; topTool: string; growthRate: number };
type RoleRank = { id: string; role: string; users: number; share: number; topTool: string; growthRate: number; description: string; icon: typeof Code };
type LatestPassport = { id: string; nickname: string; city: string; province: string; role: string; level: number; tools: string[]; signalStrength: number; createdAt: string };

function StablePanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-5 sm:p-6 ${className}`}>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

const TOOL_RANKING: ToolRank[] = [
  { id: "t-codex", name: "Codex", category: "Agent", users: 188, heat: 100, growthRate: 24 },
  { id: "t-cc", name: "Claude Code", category: "Agent", users: 162, heat: 86, growthRate: 31 },
  { id: "t-oc", name: "OpenCode", category: "Agent", users: 128, heat: 68, growthRate: 42 },
  { id: "t-cu", name: "Cursor", category: "Agent", users: 96, heat: 51, growthRate: 18 },
  { id: "t-ds", name: "DeepSeek", category: "App", users: 142, heat: 75, growthRate: 12 },
  { id: "t-db", name: "豆包", category: "App", users: 118, heat: 62, growthRate: 9 },
  { id: "t-km", name: "Kimi", category: "App", users: 84, heat: 44, growthRate: 14 },
  { id: "t-ty", name: "通义千问", category: "App", users: 72, heat: 38, growthRate: 7 },
  { id: "t-dify", name: "Dify", category: "Automation", users: 88, heat: 46, growthRate: 22 },
  { id: "t-n8n", name: "n8n", category: "Automation", users: 64, heat: 34, growthRate: 19 },
  { id: "t-ollama", name: "Ollama", category: "Local", users: 56, heat: 30, growthRate: 28 }
];

const CITY_RANKING: CityRank[] = [
  { id: "c-bj", city: "北京", province: "北京", users: 156, topRole: "代码指挥官", topTool: "Claude Code", growthRate: 22 },
  { id: "c-sh", city: "上海", province: "上海", users: 184, topRole: "数据分析师", topTool: "Codex", growthRate: 18 },
  { id: "c-sz", city: "深圳", province: "广东", users: 142, topRole: "自动化玩家", topTool: "n8n", growthRate: 27 },
  { id: "c-hz", city: "杭州", province: "浙江", users: 128, topRole: "知识库构建者", topTool: "Dify", growthRate: 24 },
  { id: "c-gz", city: "广州", province: "广东", users: 96, topRole: "AI 探索者", topTool: "DeepSeek", growthRate: 11 },
  { id: "c-cd", city: "成都", province: "四川", users: 84, topRole: "内容生产者", topTool: "Kimi", growthRate: 28 },
  { id: "c-nj", city: "南京", province: "江苏", users: 72, topRole: "代码指挥官", topTool: "Cursor", growthRate: 19 },
  { id: "c-wh", city: "武汉", province: "湖北", users: 64, topRole: "本地模型驯养师", topTool: "Ollama", growthRate: 16 },
  { id: "c-xa", city: "西安", province: "陕西", users: 58, topRole: "代码指挥官", topTool: "Claude Code", growthRate: 13 },
  { id: "c-cq", city: "重庆", province: "重庆", users: 52, topRole: "AI 探索者", topTool: "OpenCode", growthRate: 17 }
];

const PROVINCE_RANKING: ProvinceRank[] = [
  { id: "p-gd", province: "广东", users: 312, cityCount: 5, topTool: "Codex", growthRate: 19 },
  { id: "p-bj", province: "北京", users: 256, cityCount: 1, topTool: "Claude Code", growthRate: 22 },
  { id: "p-sh", province: "上海", users: 248, cityCount: 1, topTool: "Codex", growthRate: 15 },
  { id: "p-zj", province: "浙江", users: 196, cityCount: 4, topTool: "Dify", growthRate: 24 },
  { id: "p-js", province: "江苏", users: 172, cityCount: 4, topTool: "DeepSeek", growthRate: 16 },
  { id: "p-sc", province: "四川", users: 138, cityCount: 3, topTool: "Kimi", growthRate: 28 },
  { id: "p-hb", province: "湖北", users: 116, cityCount: 3, topTool: "Ollama", growthRate: 12 },
  { id: "p-sd", province: "山东", users: 102, cityCount: 3, topTool: "DeepSeek", growthRate: 18 },
  { id: "p-hn", province: "河南", users: 88, cityCount: 3, topTool: "豆包", growthRate: 14 },
  { id: "p-sx", province: "陕西", users: 82, cityCount: 2, topTool: "Cursor", growthRate: 11 },
  { id: "p-fj", province: "福建", users: 76, cityCount: 3, topTool: "n8n", growthRate: 9 },
  { id: "p-cq", province: "重庆", users: 68, cityCount: 1, topTool: "OpenCode", growthRate: 17 }
];

const ROLE_RANKING: RoleRank[] = [
  { id: "r-code", role: "代码指挥官", users: 326, share: 25, topTool: "Codex", growthRate: 28, description: "在 IDE 与终端之间调度 AI Agent，重塑生产流水线。", icon: Code },
  { id: "r-auto", role: "自动化玩家", users: 214, share: 17, topTool: "n8n", growthRate: 22, description: "用工作流串联工具链，让机器替你完成重复劳动。", icon: Network },
  { id: "r-content", role: "内容生产者", users: 184, share: 14, topTool: "Kimi", growthRate: 18, description: "把灵感、笔记和创作交给 AI，把风格留给自己。", icon: FileText },
  { id: "r-local", role: "本地模型驯养师", users: 142, share: 11, topTool: "Ollama", growthRate: 35, description: "把大模型装进 NAS、矿机与笔记本，掌控自己的智能。", icon: Cpu },
  { id: "r-kb", role: "知识库构建者", users: 116, share: 9, topTool: "Dify", growthRate: 24, description: "搭建 RAG 与企业私域知识，让 AI 学会你公司的话。", icon: BookOpen },
  { id: "r-data", role: "数据分析师", users: 96, share: 7, topTool: "DeepSeek", growthRate: 13, description: "在 SQL、财报、量化信号里寻找下一个真相。", icon: Activity },
  { id: "r-explorer", role: "AI 探索者", users: 218, share: 17, topTool: "豆包", growthRate: 9, description: "走在 AI 工具的最前沿，等待下一个新大陆。", icon: Brain }
];

const LATEST_PASSPORTS: LatestPassport[] = [
  { id: "AAM-2026-9421", nickname: "QuantumCat", city: "上海", province: "上海", role: "代码指挥官", level: 7, tools: ["Codex", "Claude Code"], signalStrength: 92, createdAt: "刚刚" },
  { id: "AAM-2026-9418", nickname: "DeepFox", city: "北京", province: "北京", role: "本地模型驯养师", level: 8, tools: ["Ollama", "OpenCode"], signalStrength: 95, createdAt: "2 分钟前" },
  { id: "AAM-2026-9412", nickname: "RAG_Zero", city: "杭州", province: "浙江", role: "知识库构建者", level: 6, tools: ["Dify", "Codex"], signalStrength: 87, createdAt: "5 分钟前" },
  { id: "AAM-2026-9407", nickname: "FlowSmith", city: "深圳", province: "广东", role: "自动化玩家", level: 5, tools: ["n8n", "Dify"], signalStrength: 81, createdAt: "8 分钟前" },
  { id: "AAM-2026-9401", nickname: "CodeNova", city: "杭州", province: "浙江", role: "代码指挥官", level: 4, tools: ["Claude Code", "Codex"], signalStrength: 76, createdAt: "12 分钟前" },
  { id: "AAM-2026-9396", nickname: "PromptFox", city: "北京", province: "北京", role: "AI 探索者", level: 3, tools: ["DeepSeek", "豆包"], signalStrength: 68, createdAt: "15 分钟前" },
  { id: "AAM-2026-9388", nickname: "Agent_0x1", city: "上海", province: "上海", role: "数据分析师", level: 4, tools: ["Codex", "DeepSeek"], signalStrength: 79, createdAt: "21 分钟前" },
  { id: "AAM-2026-9379", nickname: "ByteTamer", city: "成都", province: "四川", role: "内容生产者", level: 5, tools: ["Kimi", "Claude Code"], signalStrength: 84, createdAt: "28 分钟前" }
];

const TABS = ["tools", "cities", "provinces", "roles", "latest"] as const;
type TabKey = (typeof TABS)[number];

function RankBadge({ rank }: { rank: number }) {
  return (
    <div className="flex h-8 w-8 items-center justify-center">
      <span className={"font-mono text-sm tabular-nums " + (rank <= 3 ? "font-medium text-neutral-950" : "text-neutral-400")}>#{rank}</span>
    </div>
  );
}

function RowShell({
  rank, primary, secondary, badge, value, energy, growth
}: {
  rank: number;
  primary: string;
  secondary: string;
  badge?: string;
  value: number;
  energy: number;
  growth?: number;
}) {
  return (
    <div
      className="group relative grid min-h-[52px] grid-cols-[40px_minmax(0,1fr)_minmax(0,0.65fr)_88px] items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2 transition-colors duration-150 hover:bg-neutral-50 sm:gap-4"
    >
      <RankBadge rank={rank} />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-neutral-950">{primary}</span>
          {badge && <span className="rounded border border-neutral-300 bg-transparent px-1.5 py-0.5 text-[11px] text-neutral-500">{badge}</span>}
        </div>
        <p className="mt-0.5 truncate text-xs text-neutral-500">{secondary}</p>
      </div>
      <div className="hidden sm:block">
        <div className="h-[3px] overflow-hidden rounded-full bg-neutral-200">
          <div
            className="h-full rounded-full bg-neutral-950"
            style={{
              width: `${Math.max(8, Math.min(100, energy))}%`,
            }}
          />
        </div>
        <div className="mt-1 flex items-center justify-between text-[10px] text-neutral-400">
          <span>热度</span>
          <span>{Math.round(energy)}%</span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-base font-medium tabular-nums text-neutral-950 sm:text-lg">
          <CountUp to={value} duration={1.2} />
        </div>
        <div className="mt-0.5 text-[10px] text-neutral-400">{typeof growth === "number" ? `+${growth}%` : "真实数据"}</div>
      </div>
    </div>
  );
}

function RoleCard({ r, rank }: { r: RoleRank; rank: number }) {
  const Icon = r.icon;
  return (
    <div className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-white p-4 transition-colors duration-150 hover:bg-neutral-50">
      <div className="flex items-start gap-3">
        <RankBadge rank={rank} />
        <div className="flex h-9 w-9 flex-1 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
          <Icon className="h-4 w-4 text-neutral-700" />
        </div>
      </div>
      <p className="mt-3 text-base font-medium text-neutral-950">{r.role}</p>
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-500">{r.description}</p>
      <div className="mt-3 flex items-end justify-between">
        <div>
          <p className="text-2xl font-medium tabular-nums text-neutral-950">
            <CountUp to={r.users} duration={1.3} />
          </p>
          <p className="text-[10px] text-neutral-500">占比 {r.share}% · 常用 {r.topTool}</p>
        </div>
        <span className="rounded border border-neutral-300 bg-white px-1.5 py-0.5 text-[10px] text-neutral-500">真实数据</span>
      </div>
      <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-neutral-200">
        <div className="h-full rounded-full bg-neutral-950" style={{ width: `${Math.min(100, r.share * 3)}%` }} />
      </div>
    </div>
  );
}

function PassportMiniCard({ p, rank }: { p: LatestPassport; rank: number }) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-white p-4 transition-colors duration-150 hover:bg-neutral-50">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <RankBadge rank={rank} />
        <div className="rounded border border-neutral-300 px-1.5 py-0.5 font-mono text-[9px] text-neutral-500">{p.id}</div>
        </div>
        <div className="rounded border border-neutral-300 bg-neutral-50 px-1.5 py-0.5 text-[10px] text-neutral-600">Lv.{String(p.level).padStart(2, "0")}</div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-300 bg-neutral-50">
          <span className="text-sm font-medium text-neutral-950">{p.nickname.slice(0, 1).toUpperCase()}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-neutral-950">{p.nickname}</p>
          <p className="truncate text-[11px] text-neutral-500">{p.role} · {p.city}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {p.tools.slice(0, 3).map((t) => (
          <span key={t} className="rounded border border-neutral-300 bg-white px-2 py-0.5 text-[10px] text-neutral-600">{t}</span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] text-neutral-500">
        <span className="flex items-center gap-1">
          <Radio className="h-3 w-3 text-neutral-500" />
          活跃度 <span className="font-medium text-neutral-950">{p.signalStrength}%</span>
        </span>
        <span>{p.createdAt}</span>
      </div>
    </div>
  );
}

function toolCategory(name: string): string {
  if (["Codex", "Claude Code", "OpenCode", "Cursor", "OpenClaw", "Hermes"].includes(name)) return "Agent";
  if (["Dify", "n8n"].includes(name)) return "Automation";
  if (["Ollama", "Cherry Studio"].includes(name)) return "Local";
  return "App";
}

function toToolRanking(ranking: RankingData | null): ToolRank[] {
  const tools = ranking?.tools ?? [];
  const max = Math.max(...tools.map((tool) => tool.count), 1);
  return tools.map((tool) => ({
    id: `real-tool-${tool.name}`,
    name: tool.name,
    category: toolCategory(tool.name),
    users: tool.count,
    heat: Math.round((tool.count / max) * 100),
    growthRate: 0,
  })).sort((a, b) => b.users - a.users || indexOfTool(a.name) - indexOfTool(b.name));
}

function indexOfTool(name: string): number {
  return ["Codex", "Claude Code", "OpenCode", "Cursor", "DeepSeek", "豆包", "Kimi", "通义千问", "Dify", "n8n", "Ollama"].indexOf(name);
}

function toCityRanking(ranking: RankingData | null): CityRank[] {
  return (ranking?.cities ?? []).map((city) => ({
    id: `real-city-${city.province}-${city.city}`,
    city: city.city,
    province: city.province,
    users: city.count,
    topRole: city.topRole,
    topTool: city.topTool,
    growthRate: 0,
  }));
}

function toProvinceRanking(ranking: RankingData | null): ProvinceRank[] {
  const cityCounts = new Map<string, number>();
  for (const city of ranking?.cities ?? []) cityCounts.set(city.province, (cityCounts.get(city.province) ?? 0) + 1);
  const provinceTool = new Map<string, string>();
  for (const city of ranking?.cities ?? []) {
    if (!provinceTool.has(city.province) && city.topTool) provinceTool.set(city.province, city.topTool);
  }
  return (ranking?.provinces ?? []).map((province) => ({
    id: `real-province-${province.name}`,
    province: province.name,
    users: province.value,
    cityCount: cityCounts.get(province.name) ?? 0,
    topTool: provinceTool.get(province.name) || "未记录",
    growthRate: 0,
  }));
}

function toRoleRanking(ranking: RankingData | null): RoleRank[] {
  const total = Math.max(ranking?.overview.total ?? 0, 1);
  const icons = [Code, Network, FileText, Cpu, BookOpen, Activity, Brain];
  const descriptions = new Map([
    ["代码指挥官", "在 IDE 与终端之间调度 AI Agent，重塑生产流水线。"],
    ["自动化玩家", "用工作流串联工具链，让机器替你完成重复劳动。"],
    ["内容生产者", "把灵感、笔记和创作交给 AI，把风格留给自己。"],
    ["本地模型驯养师", "把大模型装进本地环境，掌控自己的智能。"],
    ["知识库构建者", "搭建 RAG 与私域知识，让 AI 学会你的资料。"],
    ["数据分析师", "在 SQL、财报、量化信号里寻找下一个真相。"],
    ["AI 探索者", "走在 AI 工具的最前沿，等待下一个新大陆。"],
  ]);
  return (ranking?.roles ?? []).map((role, index) => ({
    id: `real-role-${role.role}`,
    role: role.role,
    users: role.count,
    share: Math.round((role.count / total) * 100),
    topTool: role.topTool,
    growthRate: 0,
    description: descriptions.get(role.role) || "来自真实用户提交的 AI Agent 身份角色。",
    icon: icons[index] ?? Brain,
  }));
}

function toLatestPassports(cards: LatestCard[]): LatestPassport[] {
  return cards.map((card, index) => ({
    id: card.card_slug || `REAL-${index + 1}`,
    nickname: card.nickname,
    city: card.city || card.province,
    province: card.province,
    role: card.role || "AI 探索者",
    level: card.ai_level,
    tools: card.tools?.length ? card.tools : [card.primary_tool],
    signalStrength: Math.min(99, 52 + card.ai_level * 8),
    createdAt: card.created_at ? new Date(card.created_at).toLocaleDateString("zh-CN") : "刚刚",
  }));
}

function EmptyRealData({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 text-center text-sm text-neutral-500">
      暂无真实{label}数据，生成第一张身份卡后这里会自动更新。
    </div>
  );
}

function ChampionDashboard({ tools, cities, latest, roles }: { tools: ToolRank[]; cities: CityRank[]; latest: LatestPassport[]; roles: RoleRank[] }) {
  const tool = tools[0] ?? { name: "待点亮", category: "真实数据", users: 0, heat: 0, growthRate: 0 };
  const city = cities[0] ?? { city: "待点亮", province: "", users: 0, topRole: "AI 探索者", topTool: "未记录", growthRate: 0 };
  const highest = latest.reduce((a, b) => (a.level > b.level ? a : b), latest[0] ?? { nickname: "待点亮", level: 0 });
  const fastest = roles[0] ?? { role: "待点亮", users: 0, share: 0, topTool: "未记录", growthRate: 0, description: "", icon: Brain };
  return (
    <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="relative border-l-4 border-neutral-950 pl-4">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-500">当前热门</p>
            <h2 className="mt-1 text-xl font-medium text-neutral-950">工具使用摘要</h2>
          </div>
          <Crown className="h-5 w-5 text-neutral-500" />
        </div>

        <div className="mb-5">
          <p className="text-xs text-neutral-500">最常用工具</p>
          <p className="mt-1 text-3xl font-medium tracking-tight text-neutral-950">{tool.name}</p>
          <p className="mt-1 text-xs text-neutral-500">{tool.users} 人使用 · 类别 {tool.category}</p>
          <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-neutral-200">
            <div className="h-full rounded-full bg-neutral-950" style={{ width: `${Math.max(8, tool.heat)}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "热门城市", value: city.city, sub: `${city.users} 用户`, icon: MapPin, tone: "#22d3ee" },
            { label: "最高等级", value: `Lv.${String(highest.level).padStart(2, "0")}`, sub: highest.nickname, icon: Trophy, tone: "#fbbf24" },
            { label: "热门角色", value: fastest.role, sub: `${fastest.users} 人`, icon: TrendingUp, tone: "#10b981" }
          ].map((it) => {
            const Icon = it.icon;
            return (
              <div key={it.label} className="rounded-xl border border-white/[0.08] bg-black/30 p-3">
                <div className="flex items-center gap-1.5 text-[10px] text-neutral-500">
                  <Icon className="h-3 w-3 text-neutral-500" />
                  {it.label}
                </div>
                <p className="mt-1.5 truncate text-sm font-medium text-neutral-950">{it.value}</p>
                <p className="mt-0.5 truncate text-[10px] text-neutral-500">{it.sub}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function RankingPage() {
  const [tab, setTab] = useState<TabKey>("tools");
  const [ranking, setRanking] = useState<RankingData | null>(null);
  const [latestCards, setLatestCards] = useState<LatestCard[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([fetchRanking(), fetchLatestCards(12)])
      .then(([rankingData, cards]) => {
        if (!active) return;
        setRanking(rankingData);
        setLatestCards(cards);
      })
      .catch(() => {
        if (!active) return;
        setRanking(null);
        setLatestCards([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const overview = ranking?.overview ?? { total: 0, agentUsers: 0, appUsers: 0, todayNew: 0 };
  const toolRanking = useMemo(() => toToolRanking(ranking), [ranking]);
  const cityRanking = useMemo(() => toCityRanking(ranking), [ranking]);
  const provinceRanking = useMemo(() => toProvinceRanking(ranking), [ranking]);
  const roleRanking = useMemo(() => toRoleRanking(ranking), [ranking]);
  const latestPassports = useMemo(() => toLatestPassports(latestCards), [latestCards]);

  const stats = useMemo(() => {
    const champTool = toolRanking[0];
    const champCity = cityRanking[0];
    const highestLevel = latestPassports.reduce((a, b) => (a.level > b.level ? a : b), latestPassports[0] ?? { level: 0 });
    return [
      { label: "总上榜玩家", value: overview.total, icon: Users, tone: "#22d3ee" },
      { label: "最热工具", value: champTool?.name ?? "待点亮", icon: Swords, tone: "#a855f7", isText: true },
      { label: "最强城市", value: champCity ? `${champCity.city} · ${champCity.users}` : "待点亮", icon: MapPin, tone: "#fbbf24", isText: true },
      { label: "最高等级", value: `Lv.${String(highestLevel.level).padStart(2, "0")}`, icon: Trophy, tone: "#fb7185", isText: true },
      { label: "今日新增", value: overview.todayNew, icon: Sparkles, tone: "#10b981" },
      { label: "热门角色", value: roleRanking[0]?.role ?? "待点亮", icon: TrendingUp, tone: "#06b6d4", isText: true }
    ];
  }, [cityRanking, latestPassports, overview.todayNew, overview.total, roleRanking, toolRanking]);

  const tabMeta: Record<TabKey, { label: string; icon: typeof Swords; accent: string; total: number }> = {
    tools: { label: "工具榜", icon: Swords, accent: "#a855f7", total: toolRanking.length },
    cities: { label: "城市榜", icon: MapPin, accent: "#22d3ee", total: cityRanking.length },
    provinces: { label: "省份榜", icon: Shield, accent: "#fbbf24", total: provinceRanking.length },
    roles: { label: "角色榜", icon: Code, accent: "#fb7185", total: roleRanking.length },
    latest: { label: "最新身份卡", icon: Hash, accent: "#10b981", total: latestPassports.length }
  };

  return (
    <main className="relative min-h-screen overflow-hidden pb-16 pt-0">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[#fafafa]" />

      <Section className="relative z-10" spacing="sm">
        <PageShell width="wide">
          {/* HERO */}
          <section className="grid gap-8 pb-10 pt-6 lg:grid-cols-[1fr_500px] lg:items-center">
            <motion.div initial={false} className="flex flex-col justify-center space-y-6">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-blue-100 bg-blue-50 px-4 py-2">
                <Trophy className="h-4 w-4 text-blue-600" />
                <span className="title-font text-[11px] font-bold tracking-[0.18em] text-blue-600">工具排行</span>
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              </div>
              <h1 className="title-font text-5xl font-black leading-[0.98] tracking-[-0.04em] text-gray-950 sm:text-6xl lg:text-7xl">
                AI <span className="text-blue-700">工具排行榜</span>
              </h1>
              <p className="max-w-[560px] text-base font-medium text-gray-600 sm:text-lg">
                基于用户登记数据统计热门工具，也可以看看哪些城市和使用场景更活跃。
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/survey" className="btn-rb-fill">
                  <Sparkles className="h-4 w-4" />
                  <span>生成我的身份卡</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/map" className="btn-rb-ghost">
                  <Radio className="h-4 w-4" />
                  <span>查看玩家地图</span>
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 text-[11px] text-gray-500">
                <span className="flex items-center gap-1.5"><Crown className="h-3 w-3 text-amber-300" /> 实时更新</span>
                <span className="flex items-center gap-1.5"><Hash className="h-3 w-3 text-cyan-300" /> {overview.total} 名玩家入榜</span>
                <span className="flex items-center gap-1.5"><Brain className="h-3 w-3 text-violet-300" /> 5 大分区实时切换</span>
              </div>
              <DataNotice>
                排行榜基于真实身份卡提交记录计算；当前为早期数据收集阶段，榜单会随新提交自动刷新。
              </DataNotice>
            </motion.div>
            <motion.div initial={false}>
              <ChampionDashboard tools={toolRanking} cities={cityRanking} latest={latestPassports} roles={roleRanking} />
            </motion.div>
          </section>

          {/* TOP STATS 6 cards */}
          <section className="mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-neutral-200 bg-neutral-200 md:grid-cols-3 lg:grid-cols-6">
            {stats.map((s) => {
              return (
                <div key={s.label} className="bg-white p-4">
                  <p className="text-xs text-neutral-500">{s.label}</p>
                  <div className="mt-2 text-xl font-medium tabular-nums text-neutral-950 sm:text-2xl">
                    {s.isText ? s.value : <CountUp to={s.value as number} duration={1.4} />}
                  </div>
                </div>
              );
            })}
          </section>

          {/* TABS */}
          <section className="mb-10">
            <StablePanel>
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="title-font text-[10px] tracking-[0.18em] text-blue-600">榜单分区</p>
                  <h3 className="title-font mt-2 text-2xl font-black text-gray-950 sm:text-3xl">排行榜分区</h3>
                </div>
                <div className="flex items-center gap-1.5 rounded border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-500">
                  数据会随新身份卡自动更新
                </div>
              </div>

              <div className="-mx-1 mb-5 flex items-center gap-2 overflow-x-auto px-1 pb-2 sm:flex-wrap sm:overflow-visible">
                {TABS.map((k) => {
                  const meta = tabMeta[k];
                  const Icon = meta.icon;
                  const active = tab === k;
                  return (
                    <button
                      key={k}
                      onClick={() => setTab(k)}
                      className={
                        "inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors duration-150 " +
                        (active
                          ? "border-neutral-950 bg-neutral-950 text-white"
                          : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950")
                      }
                    >
                      <Icon className="h-4 w-4" />
                      {meta.label}
                      <span className={"rounded border px-1.5 py-0.5 text-[10px] " + (active ? "border-white/20 text-white/80" : "border-neutral-200 text-neutral-500")}>{meta.total}</span>
                    </button>
                  );
                })}
              </div>

              {tab === "tools" && (
                <div className="space-y-2.5">
                  {toolRanking.length === 0 && <EmptyRealData label="工具榜" />}
                  {toolRanking.map((t, i) => (
                    <RowShell
                      key={t.id}
                      rank={i + 1}
                      primary={t.name}
                      secondary={`${t.category} 阵营 · 来自真实身份卡`}
                      badge={t.category}
                      value={t.users}
                      energy={t.heat}
                    />
                  ))}
                </div>
              )}

              {tab === "cities" && (
                <div className="space-y-2.5">
                  {cityRanking.length === 0 && <EmptyRealData label="城市榜" />}
                  {cityRanking.map((c, i) => (
                    <RowShell
                      key={c.id}
                      rank={i + 1}
                      primary={c.city}
                      secondary={`${c.province} · 主流角色 ${c.topRole} · 主流工具 ${c.topTool}`}
                      value={c.users}
                      energy={Math.min(100, c.users / 2)}
                    />
                  ))}
                </div>
              )}

              {tab === "provinces" && (
                <div className="space-y-2.5">
                  {provinceRanking.length === 0 && <EmptyRealData label="省份榜" />}
                  {provinceRanking.map((p, i) => (
                    <RowShell
                      key={p.id}
                      rank={i + 1}
                      primary={p.province}
                      secondary={`${p.cityCount} 城市覆盖 · 最热工具 ${p.topTool}`}
                      value={p.users}
                      energy={Math.min(100, p.users / 3.2)}
                    />
                  ))}
                </div>
              )}

              {tab === "roles" && (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {roleRanking.length === 0 && <EmptyRealData label="角色榜" />}
                  {roleRanking.map((r, i) => (
                    <RoleCard key={r.id} r={r} rank={i + 1} />
                  ))}
                </div>
              )}

              {tab === "latest" && (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {latestPassports.length === 0 && <EmptyRealData label="最新身份卡" />}
                  {latestPassports.map((p, i) => (
                    <PassportMiniCard key={p.id} p={p} rank={i + 1} />
                  ))}
                </div>
              )}
            </StablePanel>
          </section>

          {/* BOTTOM CTA */}
          <section className="mt-8">
            <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-center sm:p-10">
              <div className="relative">
                <div className="mb-4 inline-flex items-center gap-2 rounded border border-neutral-200 bg-white px-3 py-1.5">
                  <Award className="h-3.5 w-3.5 text-neutral-500" />
                  <span className="text-xs font-medium text-neutral-500">加入排行</span>
                </div>
                <h2 className="text-2xl font-medium text-neutral-950 sm:text-3xl">想进入排行榜？</h2>
                <p className="mx-auto mt-3 max-w-[560px] text-sm leading-6 text-neutral-600">
                  生成你的 AI 身份卡，让你的工具、城市和使用场景进入排行榜统计。
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <Link href="/survey" className="btn-rb-fill">
                    <Sparkles className="h-4 w-4" />
                    <span>立即生成身份卡</span>
                  </Link>
                  <Link href="/map" className="btn-rb-ghost">
                    <Radio className="h-4 w-4" />
                    <span>查看玩家地图</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </PageShell>
      </Section>
    </main>
  );
}
